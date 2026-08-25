import type { SupabaseClient } from "@supabase/supabase-js";
import type { Organization, OrganizationListRow, OrganizationOverview, Contact, StaffOption, OrgOption } from "./types";
import type { HealthStatus } from "./labels";

export type OrgFilters = { q?: string; type?: string; status?: string };

// ===========================================================
// Cross-cutting lookups. Enterprise score, client health, MRR, and
// lifetime revenue are never stored on organizations — every one of these
// is computed here, live, from its owning table, per the Stage 5 "do not
// duplicate data" rule.
// ===========================================================

async function getProfileNameMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const p of data ?? []) map.set(p.id, p.full_name ?? p.email ?? "Unnamed");
  return map;
}

async function getOrgNameMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("organizations").select("id, name").in("id", ids);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const o of data ?? []) map.set(o.id, o.name);
  return map;
}

async function getBandLabelMap(supabase: SupabaseClient): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("assessment_bands").select("id, label");
  if (error) throw error;
  const map = new Map<string, string>();
  for (const b of data ?? []) map.set(b.id, b.label);
  return map;
}

type LatestAssessment = { org_id: string; enterprise_score: number | null; band_id: string | null; completed_at: string | null };

/** Latest completed assessment per org — the only source for "enterprise score". */
async function getLatestAssessmentsByOrg(supabase: SupabaseClient, orgIds: string[]): Promise<Map<string, LatestAssessment>> {
  if (orgIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("assessments")
    .select("org_id, enterprise_score, band_id, completed_at")
    .in("org_id", orgIds)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });
  if (error) throw error;
  const map = new Map<string, LatestAssessment>();
  for (const row of (data ?? []) as LatestAssessment[]) {
    if (!map.has(row.org_id)) map.set(row.org_id, row);
  }
  return map;
}

type LatestHealth = { org_id: string; status: HealthStatus; period: string };

/** Latest client_health_scores row per org — the only source for "client health". */
async function getLatestHealthByOrg(supabase: SupabaseClient, orgIds: string[]): Promise<Map<string, LatestHealth>> {
  if (orgIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("client_health_scores")
    .select("org_id, status, period")
    .in("org_id", orgIds)
    .order("period", { ascending: false });
  // Staff-only read (per Stage 3 decision) — a client role gets an empty
  // result here, not an error, so it must never block the rest of the page.
  if (error) throw error;
  const map = new Map<string, LatestHealth>();
  for (const row of (data ?? []) as LatestHealth[]) {
    if (!map.has(row.org_id)) map.set(row.org_id, row);
  }
  return map;
}

/** MRR per org = sum(monthly_price * quantity) over open (end_date is null) subscription_line_items. */
async function getMrrByOrg(supabase: SupabaseClient, orgIds: string[]): Promise<Map<string, number>> {
  if (orgIds.length === 0) return new Map();
  const { data: subs, error: subsError } = await supabase.from("subscriptions").select("id, org_id").in("org_id", orgIds);
  if (subsError) throw subsError;
  if (!subs || subs.length === 0) return new Map();

  const subIds = subs.map((s) => s.id);
  const { data: items, error: itemsError } = await supabase
    .from("subscription_line_items")
    .select("subscription_id, monthly_price, quantity")
    .in("subscription_id", subIds)
    .is("end_date", null);
  if (itemsError) throw itemsError;

  const subToOrg = new Map(subs.map((s) => [s.id, s.org_id as string]));
  const map = new Map<string, number>();
  for (const item of items ?? []) {
    const orgId = subToOrg.get(item.subscription_id);
    if (!orgId) continue;
    const amount = Number(item.monthly_price) * Number(item.quantity ?? 1);
    map.set(orgId, (map.get(orgId) ?? 0) + amount);
  }
  return map;
}

/** Lifetime revenue for one org = net of paid revenue_transactions (in minus out). */
async function getLifetimeRevenue(supabase: SupabaseClient, orgId: string): Promise<number> {
  const { data, error } = await supabase.from("revenue_transactions").select("amount, direction").eq("org_id", orgId).eq("status", "paid");
  if (error) throw error;
  let total = 0;
  for (const t of data ?? []) total += t.direction === "in" ? Number(t.amount) : -Number(t.amount);
  return total;
}

// ===========================================================
// Organizations
// ===========================================================

export async function listOrganizations(supabase: SupabaseClient, filters: OrgFilters): Promise<OrganizationListRow[]> {
  let query = supabase.from("organizations").select("id, name, type, industry, assigned_owner").order("name", { ascending: true });

  if (filters.q) query = query.ilike("name", `%${filters.q}%`);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);

  const { data: orgs, error } = await query;
  if (error) throw error;
  if (!orgs || orgs.length === 0) return [];

  const orgIds = orgs.map((o) => o.id as string);
  const ownerIds = [...new Set(orgs.map((o) => o.assigned_owner as string | null).filter((v): v is string => Boolean(v)))];

  const [ownerMap, assessmentMap, healthMap, mrrMap, bandMap] = await Promise.all([
    getProfileNameMap(supabase, ownerIds),
    getLatestAssessmentsByOrg(supabase, orgIds),
    getLatestHealthByOrg(supabase, orgIds),
    getMrrByOrg(supabase, orgIds),
    getBandLabelMap(supabase),
  ]);

  return orgs.map((o) => {
    const assessment = assessmentMap.get(o.id as string);
    return {
      id: o.id as string,
      name: o.name as string,
      type: o.type,
      industry: o.industry,
      ownerName: o.assigned_owner ? (ownerMap.get(o.assigned_owner as string) ?? null) : null,
      latestScore: assessment?.enterprise_score ?? null,
      latestBand: assessment?.band_id ? (bandMap.get(assessment.band_id) ?? null) : null,
      healthStatus: healthMap.get(o.id as string)?.status ?? null,
      mrr: mrrMap.get(o.id as string) ?? 0,
    };
  });
}

export async function getOrganizationById(supabase: SupabaseClient, id: string): Promise<Organization | null> {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Organization) ?? null;
}

export async function getOrganizationOverview(supabase: SupabaseClient, id: string): Promise<OrganizationOverview | null> {
  const org = await getOrganizationById(supabase, id);
  if (!org) return null;

  const [ownerMap, referredByMap, assessmentMap, healthMap, mrrMap, bandMap, lifetimeRevenue] = await Promise.all([
    getProfileNameMap(supabase, org.assigned_owner ? [org.assigned_owner] : []),
    getOrgNameMap(supabase, org.referred_by_org_id ? [org.referred_by_org_id] : []),
    getLatestAssessmentsByOrg(supabase, [id]),
    getLatestHealthByOrg(supabase, [id]),
    getMrrByOrg(supabase, [id]),
    getBandLabelMap(supabase),
    getLifetimeRevenue(supabase, id),
  ]);

  const assessment = assessmentMap.get(id);
  const health = healthMap.get(id);

  return {
    org,
    ownerName: org.assigned_owner ? (ownerMap.get(org.assigned_owner) ?? null) : null,
    referredByName: org.referred_by_org_id ? (referredByMap.get(org.referred_by_org_id) ?? null) : null,
    latestAssessment: assessment
      ? { score: assessment.enterprise_score, band: assessment.band_id ? (bandMap.get(assessment.band_id) ?? null) : null, completedAt: assessment.completed_at }
      : null,
    healthStatus: health?.status ?? null,
    healthPeriod: health?.period ?? null,
    mrr: mrrMap.get(id) ?? 0,
    lifetimeRevenue,
  };
}

export async function listStaffProfiles(supabase: SupabaseClient): Promise<StaffOption[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["verus_admin", "verus_staff"])
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data as StaffOption[]) ?? [];
}

export async function listOrgOptions(supabase: SupabaseClient, excludeId?: string): Promise<OrgOption[]> {
  let query = supabase.from("organizations").select("id, name").order("name", { ascending: true });
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as OrgOption[]) ?? [];
}

// ===========================================================
// Contacts
// ===========================================================

export async function listContacts(supabase: SupabaseClient, orgId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("org_id", orgId)
    .order("is_primary", { ascending: false })
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data as Contact[]) ?? [];
}
