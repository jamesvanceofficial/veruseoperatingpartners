import type { SupabaseClient } from "@supabase/supabase-js";
import { MRR_STATUSES } from "./config";
import type { SyncedItem } from "./compute";

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

const sum = (rows: StripeSubscriptionRow[]) => Math.round(rows.reduce((s, r) => s + r.mrr, 0) * 100) / 100;

export type ScheduledChangeSummary = { at: string; mrrAfter: number; delta: number } | null;

/** The soonest scheduled change across these rows, and what their combined MRR becomes once it lands. */
function soonestScheduledChange(rows: StripeSubscriptionRow[]): ScheduledChangeSummary {
  const changes = rows.filter((r) => r.scheduled_change_at !== null && r.scheduled_mrr !== null).sort((a, b) => a.scheduled_change_at!.localeCompare(b.scheduled_change_at!));
  if (changes.length === 0) return null;
  const at = changes[0].scheduled_change_at!;
  const before = sum(rows);
  const after = Math.round(rows.reduce((s, r) => s + (r.scheduled_change_at !== null && r.scheduled_change_at <= at ? r.scheduled_mrr! : r.mrr), 0) * 100) / 100;
  return { at, mrrAfter: after, delta: Math.round((after - before) * 100) / 100 };
}

export type StripeDashboardMetrics = {
  lastSync: StripeSyncRun | null;
  lastSuccessfulSyncAt: string | null;
  totalMRR: number;
  softwareMRR: number;
  softwareCount: number;
  serviceMRR: number;
  serviceCount: number;
  serviceScheduled: ScheduledChangeSummary;
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
 * Every MRR figure on the dashboard, read from the synced Stripe mirror —
 * never from hand-entered subscription_line_items.
 * - Software = live product-plan subscriptions (Verus Trading Bot).
 * - Service = live client subscriptions linked to an organization.
 * - Total = Software + Service. A client subscription not yet attached to
 *   an organization is in neither until it's linked; the data-quality
 *   banner names it (and its MRR) so it can't be missed.
 * - "This month" / "next 30 days" are UTC, the server's clock.
 */
export async function getStripeDashboardMetrics(supabase: SupabaseClient, now = new Date()): Promise<StripeDashboardMetrics> {
  const [rows, runs, lastOk] = await Promise.all([
    listStripeSubscriptions(supabase),
    getRecentSyncRuns(supabase, 1),
    supabase.from("stripe_sync_runs").select("finished_at").eq("status", "success").order("finished_at", { ascending: false }).limit(1),
  ]);
  if (lastOk.error) throw lastOk.error;

  const live = rows.filter(isCountedForMrr);
  const software = live.filter((r) => r.is_product_plan);
  const service = live.filter((r) => !r.is_product_plan && r.org_id !== null);
  const counted = [...software, ...service];
  const unmatched = live.filter(isUnmatchedClientSubscription);

  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const renewals = live.filter((r) => r.next_invoice_date && new Date(r.next_invoice_date) >= now && new Date(r.next_invoice_date) <= in30);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const newThisMonth = counted.filter((r) => new Date(r.stripe_created_at) >= monthStart);

  return {
    lastSync: runs[0] ?? null,
    lastSuccessfulSyncAt: (lastOk.data?.[0]?.finished_at as string | undefined) ?? null,
    totalMRR: sum(counted),
    softwareMRR: sum(software),
    softwareCount: software.length,
    serviceMRR: sum(service),
    serviceCount: service.length,
    serviceScheduled: soonestScheduledChange(service),
    totalScheduled: soonestScheduledChange(counted),
    activeCount: live.length,
    upcomingRenewals: renewals.length,
    upcomingRenewalsAmount: Math.round(renewals.reduce((s, r) => s + (r.next_invoice_amount ?? 0), 0) * 100) / 100,
    newMRRThisMonth: sum(newThisMonth),
    newThisMonthCount: newThisMonth.length,
    pastDueCount: rows.filter((r) => r.status === "past_due" || r.status === "unpaid").length,
    unmatchedCount: unmatched.length,
    unmatchedMRR: sum(unmatched),
  };
}

export type DataQualityIssues = {
  activeClientsWithoutStripe: { id: string; name: string }[];
  unmatchedSubscriptions: { id: string; label: string; mrr: number }[];
};

/**
 * The check that keeps COMPASS and Stripe from drifting apart:
 * - an organization marked Active Client (demo orgs excluded via
 *   `organizations.is_demo`) with no live linked Stripe subscription;
 * - a live client Stripe subscription with no linked organization.
 *   Product-plan subscribers (Verus Trading Bot) are individuals and never
 *   expected to have an organization, so they're never flagged.
 */
export async function getDataQualityIssues(supabase: SupabaseClient): Promise<DataQualityIssues> {
  const [orgsResult, rows] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("type", "active_client").eq("is_demo", false).order("name"),
    listStripeSubscriptions(supabase),
  ]);
  if (orgsResult.error) throw orgsResult.error;

  const linkedOrgIds = new Set(rows.filter(isCountedForMrr).map((r) => r.org_id).filter(Boolean));
  return {
    activeClientsWithoutStripe: (orgsResult.data ?? []).filter((o) => !linkedOrgIds.has(o.id)),
    unmatchedSubscriptions: rows
      .filter(isUnmatchedClientSubscription)
      .map((r) => ({ id: r.id, label: `${r.customer_name ?? r.customer_email ?? r.stripe_customer_id} — ${r.product_name}`, mrr: r.mrr })),
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
