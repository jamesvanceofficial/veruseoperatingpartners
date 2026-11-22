import type { SupabaseClient } from "@supabase/supabase-js";
import { MRR_STATUSES } from "./config";
import { splitMonthly, type SyncedItem } from "./compute";
import { computeServicesBreakdown, type CompassServiceLine, type ServicesBreakdown, type StripeServiceLine, type SuspectedDuplicate } from "./services";

export type StripeSubscriptionRow = {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  customer_email: string | null;
  customer_name: string | null;
  product_name: string;
  unit_amount: number | null;
  quantity: number | null;
  billing_interval: string | null;
  items: SyncedItem[];
  mrr: number;
  status: string;
  is_product_plan: boolean;
  stripe_created_at: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  next_invoice_date: string | null;
  next_invoice_amount: number | null;
  scheduled_change_at: string | null;
  scheduled_mrr: number | null;
  scheduled_items: SyncedItem[] | null;
  org_id: string | null;
  match_method: "email" | "name" | "manual" | null;
  matched_at: string | null;
  last_synced_at: string;
  organization: { id: string; name: string } | null;
};

export type StripeSyncRun = {
  id: string;
  trigger: "schedule" | "manual";
  status: "running" | "success" | "error";
  started_at: string;
  finished_at: string | null;
  subscriptions_synced: number | null;
  newly_matched: number | null;
  error: string | null;
};

const SELECT = "*, organization:organizations(id, name)";

function normalize(row: Record<string, unknown>): StripeSubscriptionRow {
  const r = row as unknown as StripeSubscriptionRow;
  return {
    ...r,
    mrr: Number(r.mrr),
    unit_amount: r.unit_amount === null ? null : Number(r.unit_amount),
    next_invoice_amount: r.next_invoice_amount === null ? null : Number(r.next_invoice_amount),
    scheduled_mrr: r.scheduled_mrr === null ? null : Number(r.scheduled_mrr),
  };
}

export async function listStripeSubscriptions(supabase: SupabaseClient): Promise<StripeSubscriptionRow[]> {
  const { data, error } = await supabase.from("stripe_subscriptions").select(SELECT).order("stripe_created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function listStripeSubscriptionsForOrg(supabase: SupabaseClient, orgId: string): Promise<StripeSubscriptionRow[]> {
  const { data, error } = await supabase.from("stripe_subscriptions").select(SELECT).eq("org_id", orgId).order("stripe_created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function getRecentSyncRuns(supabase: SupabaseClient, limit = 10): Promise<StripeSyncRun[]> {
  const { data, error } = await supabase.from("stripe_sync_runs").select("*").order("started_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as StripeSyncRun[];
}

export function isCountedForMrr(row: Pick<StripeSubscriptionRow, "status">): boolean {
  return MRR_STATUSES.has(row.status);
}

/** A client (non-product-plan) subscription that is live but not attached to an organization yet. */
export function isUnmatchedClientSubscription(row: Pick<StripeSubscriptionRow, "status" | "is_product_plan" | "org_id">): boolean {
  return isCountedForMrr(row) && !row.is_product_plan && row.org_id === null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** This row's monthly amount split by line, now and after its scheduled change. */
export function rowSplit(row: Pick<StripeSubscriptionRow, "items" | "scheduled_items">) {
  const now = splitMonthly(row.items ?? []);
  const scheduled = row.scheduled_items ? splitMonthly(row.scheduled_items) : null;
  return { now, scheduled };
}

/** Which bucket a live row's platform (non-service) lines land in. Service lines always go to Services, whatever the row. */
function platformBucket(row: StripeSubscriptionRow): "product" | "client" | "unmatched" {
  if (row.is_product_plan) return "product";
  return row.org_id !== null ? "client" : "unmatched";
}

export type ScheduledChangeSummary = { at: string; mrrAfter: number; delta: number } | null;

/**
 * The soonest scheduled change across these rows, and what their combined
 * contribution becomes once it lands. `part` picks which lines of each row
 * count (platform, service, or both).
 */
function soonestScheduledChange(rows: StripeSubscriptionRow[], part: (row: StripeSubscriptionRow, when: "now" | "scheduled") => number): ScheduledChangeSummary {
  const changes = rows.filter((r) => r.scheduled_change_at !== null && r.scheduled_items !== null && part(r, "scheduled") !== part(r, "now"));
  if (changes.length === 0) return null;
  const at = changes.map((r) => r.scheduled_change_at!).sort()[0];
  const before = round2(rows.reduce((s, r) => s + part(r, "now"), 0));
  const after = round2(rows.reduce((s, r) => s + (r.scheduled_change_at !== null && r.scheduled_items !== null && r.scheduled_change_at <= at ? part(r, "scheduled") : part(r, "now")), 0));
  return { at, mrrAfter: after, delta: round2(after - before) };
}

const platformPart = (r: StripeSubscriptionRow, when: "now" | "scheduled") => {
  const { now, scheduled } = rowSplit(r);
  return when === "now" ? now.platform : (scheduled ?? now).platform;
};
const servicePart = (r: StripeSubscriptionRow, when: "now" | "scheduled") => {
  const { now, scheduled } = rowSplit(r);
  return when === "now" ? now.service : (scheduled ?? now).service;
};
/** Everything a row contributes to Total: service lines always, platform lines unless the row is an unmatched client subscription. */
const countedPart = (r: StripeSubscriptionRow, when: "now" | "scheduled") => servicePart(r, when) + (platformBucket(r) === "unmatched" ? 0 : platformPart(r, when));

/** Live Stripe service lines, one entry per line. */
function stripeServiceLines(live: StripeSubscriptionRow[]): StripeServiceLine[] {
  return live.flatMap((r) =>
    (r.items ?? [])
      .filter((i) => i.is_service)
      .map((i) => ({ stripeSubscriptionId: r.stripe_subscription_id, orgId: r.org_id, productName: i.product_name, serviceKey: i.service_key ?? null, monthly: i.monthly_amount }))
  );
}

/** Open COMPASS service line items (billed outside Stripe) with their organization — the same "open line item" rule as subscriptions/mrr.ts. */
async function listCompassServiceLines(supabase: SupabaseClient): Promise<CompassServiceLine[]> {
  const { data, error } = await supabase
    .from("subscription_line_items")
    .select("id, subscription_id, description, monthly_price, quantity, subscription:subscriptions(org_id, organization:organizations(name))")
    .eq("revenue_category", "service")
    .is("end_date", null);
  if (error) throw error;
  type Joined = { id: string; subscription_id: string; description: string; monthly_price: number; quantity: number; subscription: { org_id: string | null; organization: { name: string } | null } | null };
  return ((data ?? []) as unknown as Joined[]).map((li) => ({
    id: li.id,
    subscriptionId: li.subscription_id,
    orgId: li.subscription?.org_id ?? null,
    orgName: li.subscription?.organization?.name ?? null,
    description: li.description,
    monthly: Number(li.monthly_price) * li.quantity,
  }));
}

async function getServicesBreakdown(supabase: SupabaseClient, rows: StripeSubscriptionRow[]): Promise<ServicesBreakdown> {
  return computeServicesBreakdown(stripeServiceLines(rows.filter(isCountedForMrr)), await listCompassServiceLines(supabase));
}

export type StripeDashboardMetrics = {
  lastSync: StripeSyncRun | null;
  lastSuccessfulSyncAt: string | null;
  totalMRR: number;
  productMRR: number;
  productCount: number;
  clientMRR: number;
  clientCount: number;
  services: ServicesBreakdown;
  clientScheduled: ScheduledChangeSummary;
  totalScheduled: ScheduledChangeSummary;
  activeCount: number;
  upcomingRenewals: number;
  upcomingRenewalsAmount: number;
  newMRRThisMonth: number;
  newThisMonthCount: number;
  pastDueCount: number;
  unmatchedCount: number;
  unmatchedMRR: number;
};

/**
 * The dashboard's MRR figures, classified line by line:
 * 1. a line whose Stripe product/price is marked as a service → Services;
 * 2. the other lines of a subscription linked to a client organization →
 *    Client;
 * 3. the other lines of a product-plan subscription (self-serve, e.g. the
 *    Verus Trading Bot) → Product.
 * A subscription with a platform line and a service line splits across
 * Client and Services by line — each line counts exactly once. The
 * platform lines of a client subscription not yet attached to an
 * organization are in no tile until it's linked (the banner names it);
 * its service lines still count in Services.
 * Services also includes COMPASS service line items billed outside
 * Stripe, minus suspected duplicates of a counted Stripe line (see
 * services.ts). Total = Product + Client + Services.
 * "This month" / "next 30 days" are UTC, the server's clock.
 */
export async function getStripeDashboardMetrics(supabase: SupabaseClient, now = new Date()): Promise<StripeDashboardMetrics> {
  const [rows, runs, lastOk] = await Promise.all([
    listStripeSubscriptions(supabase),
    getRecentSyncRuns(supabase, 1),
    supabase.from("stripe_sync_runs").select("finished_at").eq("status", "success").order("finished_at", { ascending: false }).limit(1),
  ]);
  if (lastOk.error) throw lastOk.error;

  const live = rows.filter(isCountedForMrr);
  const product = live.filter((r) => platformBucket(r) === "product");
  const client = live.filter((r) => platformBucket(r) === "client" && rowSplit(r).now.platform > 0);
  const unmatched = live.filter(isUnmatchedClientSubscription);
  const services = await getServicesBreakdown(supabase, rows);

  const sumPart = (rs: StripeSubscriptionRow[], part: typeof platformPart) => round2(rs.reduce((s, r) => s + part(r, "now"), 0));
  const productMRR = sumPart(product, platformPart);
  const clientMRR = sumPart(live.filter((r) => platformBucket(r) === "client"), platformPart);

  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const renewals = live.filter((r) => r.next_invoice_date && new Date(r.next_invoice_date) >= now && new Date(r.next_invoice_date) <= in30);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const newThisMonth = live.filter((r) => new Date(r.stripe_created_at) >= monthStart && countedPart(r, "now") > 0);

  return {
    lastSync: runs[0] ?? null,
    lastSuccessfulSyncAt: (lastOk.data?.[0]?.finished_at as string | undefined) ?? null,
    totalMRR: round2(productMRR + clientMRR + services.totalMRR),
    productMRR,
    productCount: product.length,
    clientMRR,
    clientCount: client.length,
    services,
    clientScheduled: soonestScheduledChange(
      live.filter((r) => platformBucket(r) === "client"),
      platformPart
    ),
    // COMPASS service line items have no scheduled changes, so they carry straight into the "after" figure.
    totalScheduled: ((s) => (s ? { ...s, mrrAfter: round2(s.mrrAfter + services.compassMRR) } : null))(soonestScheduledChange(live, countedPart)),
    activeCount: live.length,
    upcomingRenewals: renewals.length,
    upcomingRenewalsAmount: round2(renewals.reduce((s, r) => s + (r.next_invoice_amount ?? 0), 0)),
    newMRRThisMonth: round2(newThisMonth.reduce((s, r) => s + countedPart(r, "now"), 0)),
    newThisMonthCount: newThisMonth.length,
    pastDueCount: rows.filter((r) => r.status === "past_due" || r.status === "unpaid").length,
    unmatchedCount: unmatched.length,
    unmatchedMRR: sumPart(unmatched, platformPart),
  };
}

export type DataQualityIssues = {
  activeClientsWithoutStripe: { id: string; name: string }[];
  unmatchedSubscriptions: { id: string; label: string; mrr: number; serviceMrr: number }[];
  suspectedDuplicates: SuspectedDuplicate[];
};

/**
 * The check that keeps COMPASS and Stripe from drifting apart:
 * - an organization marked Active Client (demo orgs excluded via
 *   `organizations.is_demo`) with no live linked Stripe subscription;
 * - a live client Stripe subscription with no linked organization.
 *   Product-plan subscribers (Verus Trading Bot) are individuals and never
 *   expected to have an organization, so they're never flagged;
 * - a COMPASS service line item that looks like the same service, for the
 *   same organization, as a Stripe service line already counted — it's
 *   excluded from Services MRR, and named here so it can be ended.
 */
export async function getDataQualityIssues(supabase: SupabaseClient): Promise<DataQualityIssues> {
  const [orgsResult, rows] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("type", "active_client").eq("is_demo", false).order("name"),
    listStripeSubscriptions(supabase),
  ]);
  if (orgsResult.error) throw orgsResult.error;
  const services = await getServicesBreakdown(supabase, rows);

  const linkedOrgIds = new Set(rows.filter(isCountedForMrr).map((r) => r.org_id).filter(Boolean));
  return {
    activeClientsWithoutStripe: (orgsResult.data ?? []).filter((o) => !linkedOrgIds.has(o.id)),
    unmatchedSubscriptions: rows.filter(isUnmatchedClientSubscription).map((r) => {
      const split = rowSplit(r).now;
      return { id: r.id, label: `${r.customer_name ?? r.customer_email ?? r.stripe_customer_id} — ${r.product_name}`, mrr: split.platform, serviceMrr: split.service };
    }),
    suspectedDuplicates: services.duplicates,
  };
}

/**
 * Manual attach — also how a wrong automatic match gets corrected
 * (attach it to the right organization instead). Stored as
 * match_method "manual", which the sync's automatic matching never
 * overwrites. There's deliberately no "detach to nothing": the next hourly
 * sync would just re-run automatic matching on it.
 */
export async function attachStripeSubscriptionToOrg(admin: SupabaseClient, id: string, orgId: string, userId: string): Promise<void> {
  const { data: org, error: orgError } = await admin.from("organizations").select("id").eq("id", orgId).maybeSingle();
  if (orgError) throw orgError;
  if (!org) throw new Error("That organization doesn't exist.");

  const { data, error } = await admin
    .from("stripe_subscriptions")
    .update({ org_id: orgId, match_method: "manual", matched_at: new Date().toISOString(), matched_by: userId })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Stripe subscription not found.");
}
