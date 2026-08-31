import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPPORT_TIER_INFO, DEFAULT_SUPPORT_TIER_FOR_BUILD, computeFirstBillingDate, type SupportTier, type BuildTier } from "@/modules/assessments/buildTiers";
import { getAddOnCatalog, VA_ASSIGNMENT_FEE, VA_ROLES } from "./addOnCatalog";
import { computeMRR, computeMRRByCategory, computeNewMRRThisMonth } from "./mrr";
import type { Subscription, SubscriptionLineItem, SubscriptionListRow, SubscriptionDetail, SubscriptionStatus, LineItemType, RevenueCategory } from "./types";

async function resolveEffectiveSupportTierForBuildPackage(
  supabase: SupabaseClient,
  buildPackage: { tier: BuildTier; assessment_id: string | null }
): Promise<SupportTier> {
  if (buildPackage.assessment_id) {
    const { data, error } = await supabase
      .from("assessments")
      .select("recommended_support_tier, support_tier_override")
      .eq("id", buildPackage.assessment_id)
      .maybeSingle();
    if (error) throw error;
    const resolved = (data?.support_tier_override ?? data?.recommended_support_tier) as SupportTier | null | undefined;
    if (resolved) return resolved;
  }
  return DEFAULT_SUPPORT_TIER_FOR_BUILD[buildPackage.tier];
}

export async function getSubscriptionByBuildPackageId(supabase: SupabaseClient, buildPackageId: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.from("subscriptions").select("id").eq("build_package_id", buildPackageId).maybeSingle();
  if (error) throw error;
  return data as { id: string } | null;
}

/**
 * The one-click path — carries over the client, the effective support
 * tier (the source assessment's override ?? recommended, falling back to
 * the build tier's default pairing), and the tier's price as the base
 * plan line item. Requires a real handover_date: "at handover" is the
 * trigger, and computeFirstBillingDate() has nothing to compute from
 * without one.
 */
export async function createSubscriptionFromBuildPackage(admin: SupabaseClient, buildPackageId: string): Promise<{ id: string }> {
  const { data: pkg, error: pkgError } = await admin
    .from("build_packages")
    .select("org_id, tier, handover_date, assessment_id")
    .eq("id", buildPackageId)
    .maybeSingle();
  if (pkgError) throw pkgError;
  if (!pkg) throw new Error("Build package not found.");
  if (!pkg.handover_date) throw new Error("Set a handover date on this build package before creating its subscription.");

  const existing = await getSubscriptionByBuildPackageId(admin, buildPackageId);
  if (existing) throw new Error("This build package already has a subscription.");

  const tier = await resolveEffectiveSupportTierForBuildPackage(admin, pkg as { tier: BuildTier; assessment_id: string | null });
  const tierInfo = SUPPORT_TIER_INFO[tier];
  const firstBillingDate = computeFirstBillingDate(pkg.handover_date as string);

  const { data: sub, error: subError } = await admin
    .from("subscriptions")
    .insert({
      org_id: pkg.org_id,
      build_package_id: buildPackageId,
      plan_name: `${tierInfo.label} Support Plan`,
      status: "active",
      support_tier: tier,
      seats: tierInfo.includedSeats,
      start_date: pkg.handover_date,
      first_billing_date: firstBillingDate,
    })
    .select("id")
    .single();
  if (subError) throw subError;

  if (tierInfo.price !== null) {
    const { error: lineError } = await admin.from("subscription_line_items").insert({
      subscription_id: sub.id,
      item_type: "base_plan",
      description: `${tierInfo.label} Support Plan — base`,
      monthly_price: tierInfo.price,
      quantity: 1,
      revenue_category: "software",
      start_date: pkg.handover_date,
    });
    if (lineError) throw lineError;
  }

  return { id: sub.id as string };
}

async function attachOrgNames(supabase: SupabaseClient, orgIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(orgIds)];
  if (unique.length === 0) return new Map();
  const { data, error } = await supabase.from("organizations").select("id, name").in("id", unique);
  if (error) throw error;
  return new Map((data ?? []).map((o) => [o.id as string, o.name as string]));
}

export async function listSubscriptions(
  supabase: SupabaseClient,
  filters: { status?: SubscriptionStatus; tier?: SupportTier } = {}
): Promise<SubscriptionListRow[]> {
  let query = supabase.from("subscriptions").select("id, org_id, plan_name, status, support_tier, seats, renewal_date");
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.tier) query = query.eq("support_tier", filters.tier);

  const { data: subs, error } = await query;
  if (error) throw error;
  const rows = subs ?? [];
  if (rows.length === 0) return [];

  const [orgNameMap, lineItemsResult] = await Promise.all([
    attachOrgNames(supabase, rows.map((r) => r.org_id as string)),
    supabase
      .from("subscription_line_items")
      .select("subscription_id, monthly_price, quantity, end_date")
      .in(
        "subscription_id",
        rows.map((r) => r.id as string)
      ),
  ]);
  if (lineItemsResult.error) throw lineItemsResult.error;

  const lineItemsBySub = new Map<string, { monthly_price: number; quantity: number; end_date: string | null }[]>();
  for (const li of lineItemsResult.data ?? []) {
    const list = lineItemsBySub.get(li.subscription_id as string) ?? [];
    list.push({ monthly_price: li.monthly_price as number, quantity: li.quantity as number, end_date: li.end_date as string | null });
    lineItemsBySub.set(li.subscription_id as string, list);
  }

  return rows.map((r) => ({
    id: r.id as string,
    orgId: r.org_id as string,
    orgName: orgNameMap.get(r.org_id as string) ?? "Unknown organization",
    planName: r.plan_name as string,
    status: r.status as SubscriptionStatus,
    supportTier: r.support_tier as SupportTier | null,
    seats: r.seats as number | null,
    renewalDate: r.renewal_date as string | null,
    mrr: computeMRR(lineItemsBySub.get(r.id as string) ?? []),
  }));
}

export async function getSubscriptionDetail(supabase: SupabaseClient, id: string): Promise<SubscriptionDetail | null> {
  const { data: subRow, error } = await supabase.from("subscriptions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!subRow) return null;
  const subscription = subRow as Subscription;

  const [orgResult, lineItemsResult, buildPackageResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", subscription.org_id).maybeSingle(),
    supabase.from("subscription_line_items").select("*").eq("subscription_id", id).order("start_date", { ascending: false }),
    subscription.build_package_id
      ? supabase.from("build_packages").select("tier").eq("id", subscription.build_package_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (lineItemsResult.error) throw lineItemsResult.error;
  if (buildPackageResult.error) throw buildPackageResult.error;

  const lineItems = (lineItemsResult.data ?? []) as SubscriptionLineItem[];
  const buildTier = (buildPackageResult.data as { tier: BuildTier } | null)?.tier ?? null;

  return {
    subscription,
    orgName: (orgResult.data?.name as string | undefined) ?? "Unknown organization",
    buildPackageLabel: buildTier ? `${buildTier.charAt(0).toUpperCase()}${buildTier.slice(1)} Build` : null,
    lineItems,
    mrr: computeMRR(lineItems),
    mrrByCategory: computeMRRByCategory(lineItems),
  };
}

export async function listSubscriptionsForOrg(supabase: SupabaseClient, orgId: string): Promise<SubscriptionDetail[]> {
  const { data, error } = await supabase.from("subscriptions").select("id").eq("org_id", orgId).order("created_at", { ascending: false });
  if (error) throw error;
  const details = await Promise.all((data ?? []).map((r) => getSubscriptionDetail(supabase, r.id as string)));
  return details.filter((d): d is SubscriptionDetail => d !== null);
}

export type SubscriptionCreateInput = {
  orgId: string;
  planName: string;
  supportTier: SupportTier | null;
  status: SubscriptionStatus;
  seats: number | null;
  startDate: string;
  renewalDate: string | null;
  firstBillingDate: string | null;
  billingNotes: string | null;
};

export async function createSubscription(admin: SupabaseClient, input: SubscriptionCreateInput): Promise<{ id: string }> {
  const { data, error } = await admin
    .from("subscriptions")
    .insert({
      org_id: input.orgId,
      plan_name: input.planName,
      support_tier: input.supportTier,
      status: input.status,
      seats: input.seats,
      start_date: input.startDate,
      renewal_date: input.renewalDate,
      first_billing_date: input.firstBillingDate,
      billing_notes: input.billingNotes,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export type SubscriptionUpdateInput = Partial<SubscriptionCreateInput> & { cancelledAt?: string | null };

export async function updateSubscription(admin: SupabaseClient, id: string, input: SubscriptionUpdateInput): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.planName !== undefined) patch.plan_name = input.planName;
  if (input.supportTier !== undefined) patch.support_tier = input.supportTier;
  if (input.status !== undefined) {
    patch.status = input.status;
    patch.cancelled_at = input.status === "cancelled" ? new Date().toISOString() : null;
  }
  if (input.seats !== undefined) patch.seats = input.seats;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.renewalDate !== undefined) patch.renewal_date = input.renewalDate;
  if (input.firstBillingDate !== undefined) patch.first_billing_date = input.firstBillingDate;
  if (input.billingNotes !== undefined) patch.billing_notes = input.billingNotes;
  if (Object.keys(patch).length === 0) return;

  const { error } = await admin.from("subscriptions").update(patch).eq("id", id);
  if (error) throw error;
}

export async function getSubscriptionDeletePreview(supabase: SupabaseClient, id: string): Promise<{ planName: string; lineItemCount: number }> {
  const [subResult, itemsResult] = await Promise.all([
    supabase.from("subscriptions").select("plan_name").eq("id", id).maybeSingle(),
    supabase.from("subscription_line_items").select("id", { count: "exact", head: true }).eq("subscription_id", id),
  ]);
  if (subResult.error) throw subResult.error;
  if (itemsResult.error) throw itemsResult.error;
  return { planName: (subResult.data?.plan_name as string | undefined) ?? "this subscription", lineItemCount: itemsResult.count ?? 0 };
}

export async function deleteSubscription(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("subscriptions").delete().eq("id", id);
  if (error) throw error;
}

// ===========================================================
// Line items
// ===========================================================

export type LineItemInput = {
  itemType: LineItemType;
  description: string;
  monthlyPrice: number;
  quantity: number;
  revenueCategory: RevenueCategory;
  startDate: string;
  endDate: string | null;
};

export async function createLineItem(admin: SupabaseClient, subscriptionId: string, input: LineItemInput): Promise<{ id: string }> {
  const { data, error } = await admin
    .from("subscription_line_items")
    .insert({
      subscription_id: subscriptionId,
      item_type: input.itemType,
      description: input.description,
      monthly_price: input.monthlyPrice,
      quantity: input.quantity,
      revenue_category: input.revenueCategory,
      start_date: input.startDate,
      end_date: input.endDate,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

/** Attaches one entry from the locked add-on catalog — resolves its price against the subscription's own tier (for the tier-rate seat add-on) and closes it immediately if it's a one-time charge. */
export async function addCatalogLineItem(admin: SupabaseClient, subscriptionId: string, catalogKey: string): Promise<{ id: string }> {
  const { data: sub, error: subError } = await admin.from("subscriptions").select("support_tier").eq("id", subscriptionId).maybeSingle();
  if (subError) throw subError;
  const tier = (sub?.support_tier as SupportTier | null) ?? null;

  const entry = getAddOnCatalog(tier).find((e) => e.key === catalogKey);
  if (!entry) throw new Error("Unknown add-on.");
  if (entry.monthlyPrice === null) throw new Error("This add-on's price depends on a support tier — set one on the subscription first.");

  const today = new Date().toISOString().slice(0, 10);
  return createLineItem(admin, subscriptionId, {
    itemType: entry.itemType,
    description: entry.description,
    monthlyPrice: entry.monthlyPrice,
    quantity: 1,
    revenueCategory: entry.revenueCategory,
    startDate: today,
    endDate: entry.billing === "one_time" ? today : null,
  });
}

/** VA placements are deliberately not a flat-fee catalog entry — a one-time assignment fee (closed immediately, never counted in ongoing MRR) plus a separate open, recurring hourly line staff updates monthly as real hours are logged. */
export async function addVaPlacement(admin: SupabaseClient, subscriptionId: string, roleName: string): Promise<{ assignmentFeeId: string; hourlyLineId: string }> {
  const role = VA_ROLES.find((r) => r.name === roleName);
  if (!role) throw new Error("Unknown VA role.");

  const today = new Date().toISOString().slice(0, 10);
  const assignmentFee = await createLineItem(admin, subscriptionId, {
    itemType: "addon",
    description: `VA Assignment Fee — ${role.name}`,
    monthlyPrice: VA_ASSIGNMENT_FEE,
    quantity: 1,
    revenueCategory: "service",
    startDate: today,
    endDate: today,
  });

  const hourlyLine = await createLineItem(admin, subscriptionId, {
    itemType: "addon",
    description: `VA Hours — ${role.name} (logged monthly)`,
    monthlyPrice: role.hourlyRate,
    quantity: 0,
    revenueCategory: "service",
    startDate: today,
    endDate: null,
  });

  return { assignmentFeeId: assignmentFee.id, hourlyLineId: hourlyLine.id };
}

export type LineItemUpdateInput = Partial<LineItemInput>;

export async function updateLineItem(admin: SupabaseClient, id: string, input: LineItemUpdateInput): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.itemType !== undefined) patch.item_type = input.itemType;
  if (input.description !== undefined) patch.description = input.description;
  if (input.monthlyPrice !== undefined) patch.monthly_price = input.monthlyPrice;
  if (input.quantity !== undefined) patch.quantity = input.quantity;
  if (input.revenueCategory !== undefined) patch.revenue_category = input.revenueCategory;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (Object.keys(patch).length === 0) return;

  const { error } = await admin.from("subscription_line_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteLineItem(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("subscription_line_items").delete().eq("id", id);
  if (error) throw error;
}

// ===========================================================
// Dashboard
// ===========================================================

export type SubscriptionDashboardMetrics = {
  totalMRR: number;
  newMRRThisMonth: number;
  mrrByCategory: { software: number; service: number };
  activeCount: number;
  upcomingRenewals: number;
  pastDueCount: number;
};

export async function getSubscriptionDashboardMetrics(supabase: SupabaseClient): Promise<SubscriptionDashboardMetrics> {
  const [subsResult, lineItemsResult] = await Promise.all([
    supabase.from("subscriptions").select("id, status, renewal_date"),
    supabase.from("subscription_line_items").select("subscription_id, monthly_price, quantity, revenue_category, start_date, end_date"),
  ]);
  if (subsResult.error) throw subsResult.error;
  if (lineItemsResult.error) throw lineItemsResult.error;

  const subs = subsResult.data ?? [];
  const lineItems = (lineItemsResult.data ?? []) as { monthly_price: number; quantity: number; revenue_category: RevenueCategory; start_date: string; end_date: string | null }[];

  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);

  return {
    totalMRR: computeMRR(lineItems),
    newMRRThisMonth: computeNewMRRThisMonth(lineItems, now),
    mrrByCategory: computeMRRByCategory(lineItems),
    activeCount: subs.filter((s) => s.status === "active").length,
    upcomingRenewals: subs.filter((s) => s.status === "active" && s.renewal_date && new Date(s.renewal_date as string) <= in30Days && new Date(s.renewal_date as string) >= now).length,
    pastDueCount: subs.filter((s) => s.status === "past_due").length,
  };
}
