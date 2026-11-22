// Server-only — runs with the admin client and the Stripe key.
import { createAdminClient } from "@/shared/supabase/admin";
import { stripeGet, stripeListAll } from "./client";
import { PRODUCT_PLAN_PRODUCT_IDS, TERMINAL_STATUSES } from "./config";
import {
  computeInvoiceAndSchedule,
  describeInterval,
  sumMonthly,
  summarizeProducts,
  toSyncedItems,
  type StripeSchedule,
  type StripeSubscriptionItem,
} from "./compute";
import { matchCustomerToOrg } from "./match";

type StripeCustomer = { id: string; deleted?: boolean; email?: string | null; name?: string | null };
type StripeSub = {
  id: string;
  status: string;
  created: number;
  customer: StripeCustomer | string;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  cancel_at: number | null;
  canceled_at: number | null;
  schedule: string | null;
  items: { data: StripeSubscriptionItem[] };
};

export type SyncSummary = { runId: string; synced: number; newlyMatched: number; refreshedEnded: number };

const iso = (sec: number | null) => (sec === null ? null : new Date(sec * 1000).toISOString());

/** In-process guard so the hourly timer and a button click can't overlap inside one server. */
let running: Promise<SyncSummary> | null = null;

export function runStripeSync(opts: { trigger: "schedule" | "manual"; triggeredBy?: string | null }): Promise<SyncSummary> {
  if (running) return running;
  running = doSync(opts).finally(() => {
    running = null;
  });
  return running;
}

async function doSync({ trigger, triggeredBy }: { trigger: "schedule" | "manual"; triggeredBy?: string | null }): Promise<SyncSummary> {
  const admin = createAdminClient();
  const { data: run, error: runError } = await admin
    .from("stripe_sync_runs")
    .insert({ trigger, triggered_by: triggeredBy ?? null })
    .select("id")
    .single();
  if (runError) throw runError;

  try {
    const summary = await syncAll(admin, run.id);
    await admin
      .from("stripe_sync_runs")
      .update({ status: "success", finished_at: new Date().toISOString(), subscriptions_synced: summary.synced, newly_matched: summary.newlyMatched })
      .eq("id", run.id);
    return summary;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin.from("stripe_sync_runs").update({ status: "error", finished_at: new Date().toISOString(), error: message.slice(0, 500) }).eq("id", run.id);
    throw err;
  }
}

async function syncAll(admin: ReturnType<typeof createAdminClient>, runId: string): Promise<SyncSummary> {
  const nowSec = Math.floor(Date.now() / 1000);
  const syncedAt = new Date().toISOString();

  const products = await stripeListAll<{ id: string; name: string }>("products");
  const productNames = new Map(products.map((p) => [p.id, p.name]));

  // The default list (no status filter) is every subscription that isn't canceled.
  const subs = await stripeListAll<StripeSub>("subscriptions", { expand: ["data.customer"] });

  const rows = [];
  for (const sub of subs) rows.push(await toRow(sub, productNames, nowSec, syncedAt));

  if (rows.length > 0) {
    // Only Stripe-sourced columns — org_id/match_method/matched_* are never touched by the upsert, so a link (manual or automatic) survives every sync.
    const { error } = await admin.from("stripe_subscriptions").upsert(rows, { onConflict: "stripe_subscription_id" });
    if (error) throw error;
  }

  // Anything stored earlier that's no longer in the live list has ended (canceled) — refresh it from Stripe so its status is real, not stale.
  const seen = new Set(subs.map((s) => s.id));
  const { data: stored, error: storedError } = await admin.from("stripe_subscriptions").select("stripe_subscription_id, status");
  if (storedError) throw storedError;
  let refreshedEnded = 0;
  for (const row of stored ?? []) {
    if (seen.has(row.stripe_subscription_id) || TERMINAL_STATUSES.has(row.status)) continue;
    const sub = await stripeGet<StripeSub>(`subscriptions/${row.stripe_subscription_id}`, { expand: ["customer"] });
    const { error } = await admin.from("stripe_subscriptions").update(await toRow(sub, productNames, nowSec, syncedAt)).eq("stripe_subscription_id", sub.id);
    if (error) throw error;
    refreshedEnded++;
  }

  const newlyMatched = await matchUnlinked(admin);
  return { runId, synced: rows.length, newlyMatched, refreshedEnded };
}

async function toRow(sub: StripeSub, productNames: Map<string, string>, nowSec: number, syncedAt: string) {
  const customer: StripeCustomer = typeof sub.customer === "string" ? { id: sub.customer } : sub.customer;
  const items = toSyncedItems(sub.items.data, productNames);
  const schedule = sub.schedule ? await stripeGet<StripeSchedule>(`subscription_schedules/${sub.schedule}`, { expand: ["phases.items.price"] }) : null;
  const plan = computeInvoiceAndSchedule(sub, items, schedule, productNames, nowSec);
  const primary = items[0];

  return {
    stripe_subscription_id: sub.id,
    stripe_customer_id: customer.id,
    customer_email: customer.deleted ? null : (customer.email ?? null),
    customer_name: customer.deleted ? null : (customer.name ?? null),
    product_name: summarizeProducts(items),
    unit_amount: primary?.unit_amount ?? null,
    quantity: primary?.quantity ?? null,
    billing_interval: primary ? describeInterval(primary.interval, primary.interval_count) : null,
    items,
    mrr: sumMonthly(items),
    status: sub.status,
    is_product_plan: items.length > 0 && items.every((i) => PRODUCT_PLAN_PRODUCT_IDS.has(i.product_id)),
    stripe_created_at: iso(sub.created),
    current_period_end: iso(sub.current_period_end),
    cancel_at_period_end: sub.cancel_at_period_end,
    canceled_at: iso(sub.canceled_at),
    next_invoice_date: iso(plan.nextInvoiceAt),
    next_invoice_amount: plan.nextInvoiceAmount,
    scheduled_change_at: iso(plan.scheduledChangeAt),
    scheduled_mrr: plan.scheduledMrr,
    scheduled_items: plan.scheduledItems,
    last_synced_at: syncedAt,
  };
}

/** Email first, then company name — only for client subscriptions with no link yet. Never creates an organization. */
async function matchUnlinked(admin: ReturnType<typeof createAdminClient>): Promise<number> {
  const { data: unlinked, error } = await admin
    .from("stripe_subscriptions")
    .select("id, customer_email, customer_name")
    .is("org_id", null)
    .eq("is_product_plan", false);
  if (error) throw error;
  if (!unlinked || unlinked.length === 0) return 0;

  const [contactsResult, orgsResult] = await Promise.all([admin.from("contacts").select("org_id, email"), admin.from("organizations").select("id, name")]);
  if (contactsResult.error) throw contactsResult.error;
  if (orgsResult.error) throw orgsResult.error;

  let matched = 0;
  for (const row of unlinked) {
    const match = matchCustomerToOrg({ email: row.customer_email, name: row.customer_name }, contactsResult.data ?? [], orgsResult.data ?? []);
    if (!match) continue;
    const { error: updateError } = await admin
      .from("stripe_subscriptions")
      .update({ org_id: match.orgId, match_method: match.method, matched_at: new Date().toISOString(), matched_by: null })
      .eq("id", row.id)
      .is("org_id", null);
    if (updateError) throw updateError;
    matched++;
  }
  return matched;
}
