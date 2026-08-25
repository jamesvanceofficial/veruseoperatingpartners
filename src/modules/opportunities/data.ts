import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityListRow, OpportunityDetail, StageHistoryEntry, PipelineStats, ContactOption } from "./types";
import { PIPELINE_STAGES, type PipelineStage } from "./labels";

export type OpportunityFilters = { stage?: string; owner?: string; orgId?: string };

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

async function getContactNameMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("contacts").select("id, full_name").in("id", ids);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const c of data ?? []) map.set(c.id, c.full_name);
  return map;
}

type RawOpportunity = {
  id: string;
  org_id: string;
  name: string;
  stage: PipelineStage;
  owner: string | null;
  primary_contact_id: string | null;
  expected_value: number | null;
  probability: number | null;
  next_action: string | null;
  next_action_date: string | null;
};

async function toListRows(supabase: SupabaseClient, rows: RawOpportunity[]): Promise<OpportunityListRow[]> {
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.org_id))];
  const ownerIds = [...new Set(rows.map((r) => r.owner).filter((v): v is string => Boolean(v)))];
  const contactIds = [...new Set(rows.map((r) => r.primary_contact_id).filter((v): v is string => Boolean(v)))];

  const [orgMap, ownerMap, contactMap] = await Promise.all([
    getOrgNameMap(supabase, orgIds),
    getProfileNameMap(supabase, ownerIds),
    getContactNameMap(supabase, contactIds),
  ]);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    org_id: r.org_id,
    orgName: orgMap.get(r.org_id) ?? "Unknown organization",
    stage: r.stage,
    owner: r.owner,
    ownerName: r.owner ? (ownerMap.get(r.owner) ?? null) : null,
    expected_value: r.expected_value,
    probability: r.probability,
    next_action: r.next_action,
    next_action_date: r.next_action_date,
    primaryContactName: r.primary_contact_id ? (contactMap.get(r.primary_contact_id) ?? null) : null,
  }));
}

export async function listOpportunities(supabase: SupabaseClient, filters: OpportunityFilters = {}): Promise<OpportunityListRow[]> {
  let query = supabase
    .from("opportunities")
    .select("id, org_id, name, stage, owner, primary_contact_id, expected_value, probability, next_action, next_action_date")
    .order("name", { ascending: true });

  if (filters.stage) query = query.eq("stage", filters.stage);
  if (filters.owner) query = query.eq("owner", filters.owner);
  if (filters.orgId) query = query.eq("org_id", filters.orgId);

  const { data, error } = await query;
  if (error) throw error;
  return toListRows(supabase, (data ?? []) as RawOpportunity[]);
}

export async function getOpportunityById(supabase: SupabaseClient, id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase.from("opportunities").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Opportunity) ?? null;
}

export async function listStageHistory(supabase: SupabaseClient, opportunityId: string): Promise<StageHistoryEntry[]> {
  const { data, error } = await supabase
    .from("opportunity_stage_history")
    .select("id, from_stage, to_stage, changed_by, changed_at")
    .eq("opportunity_id", opportunityId)
    .order("changed_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as { id: string; from_stage: PipelineStage | null; to_stage: PipelineStage; changed_by: string | null; changed_at: string }[];
  const changerIds = [...new Set(rows.map((r) => r.changed_by).filter((v): v is string => Boolean(v)))];
  const nameMap = await getProfileNameMap(supabase, changerIds);

  return rows.map((r) => ({
    ...r,
    changedByName: r.changed_by ? (nameMap.get(r.changed_by) ?? null) : null,
  }));
}

export async function getOpportunityDetail(supabase: SupabaseClient, id: string): Promise<OpportunityDetail | null> {
  const opportunity = await getOpportunityById(supabase, id);
  if (!opportunity) return null;

  const [orgMap, ownerMap, contactMap, stageHistory] = await Promise.all([
    getOrgNameMap(supabase, [opportunity.org_id]),
    getProfileNameMap(supabase, opportunity.owner ? [opportunity.owner] : []),
    getContactNameMap(supabase, opportunity.primary_contact_id ? [opportunity.primary_contact_id] : []),
    listStageHistory(supabase, id),
  ]);

  return {
    opportunity,
    orgName: orgMap.get(opportunity.org_id) ?? "Unknown organization",
    ownerName: opportunity.owner ? (ownerMap.get(opportunity.owner) ?? null) : null,
    primaryContactName: opportunity.primary_contact_id ? (contactMap.get(opportunity.primary_contact_id) ?? null) : null,
    stageHistory,
  };
}

export async function listContactOptions(supabase: SupabaseClient, orgId: string): Promise<ContactOption[]> {
  const { data, error } = await supabase.from("contacts").select("id, full_name").eq("org_id", orgId).order("full_name", { ascending: true });
  if (error) throw error;
  return (data as ContactOption[]) ?? [];
}

/** Total pipeline value (everything but Lost) and a per-stage breakdown — always over the WHOLE pipeline, independent of any board/table filters. */
export async function getPipelineStats(supabase: SupabaseClient): Promise<PipelineStats> {
  const { data, error } = await supabase.from("opportunities").select("stage, expected_value");
  if (error) throw error;

  const byStageMap = new Map<PipelineStage, { count: number; value: number }>();
  for (const stage of PIPELINE_STAGES) byStageMap.set(stage, { count: 0, value: 0 });

  let totalValue = 0;
  for (const row of (data ?? []) as { stage: PipelineStage; expected_value: number | null }[]) {
    const bucket = byStageMap.get(row.stage);
    const value = Number(row.expected_value ?? 0);
    if (bucket) {
      bucket.count += 1;
      bucket.value += value;
    }
    if (row.stage !== "lost") totalValue += value;
  }

  return {
    totalValue,
    byStage: PIPELINE_STAGES.map((stage) => ({ stage, ...(byStageMap.get(stage) ?? { count: 0, value: 0 }) })),
  };
}

/** Opportunities with a next action due today or earlier — excludes Lost, which has nothing left to act on. */
export async function listDueNextActions(supabase: SupabaseClient, todayIso: string): Promise<OpportunityListRow[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, org_id, name, stage, owner, primary_contact_id, expected_value, probability, next_action, next_action_date")
    .not("next_action_date", "is", null)
    .lte("next_action_date", todayIso)
    .neq("stage", "lost")
    .order("next_action_date", { ascending: true });
  if (error) throw error;
  return toListRows(supabase, (data ?? []) as RawOpportunity[]);
}
