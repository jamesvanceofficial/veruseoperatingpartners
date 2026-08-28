import type { SupabaseClient } from "@supabase/supabase-js";
import { getAssessmentById, getAssessmentReport } from "@/modules/assessments/data";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import { getOpportunityById } from "@/modules/opportunities/data";
import { transitionStage } from "@/modules/opportunities/stageTransition";
import { generateBuildPackagePlan } from "./generatePlan";
import type { PaymentStatus } from "./labels";
import type { BuildPackage, BuildPackageDetail, BuildPackageListRow, BuildPackagePhaseDetail, BuildPackageScopeItem } from "./types";

function computePaymentStatus(pkg: Pick<BuildPackage, "deposit_paid_at" | "balance_paid_at">): PaymentStatus {
  if (pkg.balance_paid_at) return "paid_in_full";
  if (pkg.deposit_paid_at) return "deposit_paid";
  return "unpaid";
}

// ===========================================================
// Create — the one path this stage builds: FROM a completed Full
// Assessment, one click, nothing retyped. Staff-guarded by the caller
// (the API route); this function assumes it's already authorized.
// ===========================================================

export async function createBuildPackageFromAssessment(
  admin: SupabaseClient,
  assessmentId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const assessment = await getAssessmentById(admin, assessmentId);
  if (!assessment) return { ok: false, error: "Assessment not found." };
  if (assessment.assessment_type !== "full" || assessment.status !== "completed") {
    return { ok: false, error: "A build package can only be created from a completed Full Assessment." };
  }

  const effectiveTier = assessment.build_tier_override ?? assessment.recommended_build_tier;
  if (!effectiveTier) {
    return { ok: false, error: "This assessment has no build recommendation to create a package from." };
  }

  const report = await getAssessmentReport(admin, assessmentId);
  if (!report) return { ok: false, error: "Could not load this assessment's results." };

  const rankedBottlenecks = [...report.categoryScores]
    .sort((a, b) => a.bottleneckRank - b.bottleneckRank)
    .map((c) => ({ categoryName: c.categoryName, rawScore: c.rawScore }));

  const plan = generateBuildPackagePlan({
    buildTier: effectiveTier,
    rankedBottlenecks,
    operationalNeeds: report.operationalNeeds,
  });

  const { data: pkg, error: insertError } = await admin
    .from("build_packages")
    .insert({
      org_id: assessment.org_id,
      opportunity_id: assessment.opportunity_id,
      assessment_id: assessmentId,
      tier: effectiveTier,
      status: "sold",
      price: BUILD_TIER_INFO[effectiveTier].price,
    })
    .select("id")
    .single();
  if (insertError) return { ok: false, error: insertError.message };

  for (const phase of plan) {
    const { data: phaseRow, error: phaseError } = await admin
      .from("build_package_phases")
      .insert({
        build_package_id: pkg.id,
        phase_number: phase.phaseNumber,
        name: phase.name,
        week_start: phase.weekStart,
        week_end: phase.weekEnd,
        kind: phase.kind,
        category_name: phase.categoryName,
        category_score: phase.categoryScore,
      })
      .select("id")
      .single();
    if (phaseError) return { ok: false, error: phaseError.message };

    if (phase.scopeItems.length > 0) {
      const { error: itemsError } = await admin.from("build_package_scope_items").insert(
        phase.scopeItems.map((item, i) => ({
          build_package_id: pkg.id,
          phase_id: phaseRow.id,
          scope_category: item.category,
          description: item.description,
          sort_order: i,
        }))
      );
      if (itemsError) return { ok: false, error: itemsError.message };
    }
  }

  return { ok: true, id: pkg.id as string };
}

/** Separate from creation so the API route can transition the opportunity with the acting staff member's id — createBuildPackageFromAssessment() has no notion of "who." */
export async function moveOpportunityToBuildPackageSold(admin: SupabaseClient, opportunityId: string, changedBy: string): Promise<void> {
  const opportunity = await getOpportunityById(admin, opportunityId);
  if (!opportunity) return;
  await transitionStage(admin, opportunityId, opportunity.stage, "build_package_sold", changedBy);
}

export async function getBuildPackageByAssessmentId(supabase: SupabaseClient, assessmentId: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("build_packages")
    .select("id")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? { id: data.id as string } : null;
}

/** Most recent build package's handover date for this assessment — feeds computeFirstBillingDate() on both the internal panel and the client report. Null if no package exists yet or none has a handover date set. */
export async function getLatestHandoverDateForAssessment(supabase: SupabaseClient, assessmentId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("build_packages")
    .select("handover_date")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.handover_date as string | null) ?? null;
}

// ===========================================================
// List
// ===========================================================

export async function listBuildPackages(
  supabase: SupabaseClient,
  filters: { status?: string; orgId?: string } = {}
): Promise<BuildPackageListRow[]> {
  let query = supabase.from("build_packages").select("*").order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.orgId) query = query.eq("org_id", filters.orgId);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data as BuildPackage[]) ?? [];
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.org_id))];
  const { data: orgs, error: orgsError } = await supabase.from("organizations").select("id, name").in("id", orgIds);
  if (orgsError) throw orgsError;
  const orgNameMap = new Map((orgs ?? []).map((o) => [o.id as string, o.name as string]));

  return rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    assessment_id: r.assessment_id,
    orgName: orgNameMap.get(r.org_id) ?? "Unknown organization",
    tier: r.tier,
    status: r.status,
    price: r.price,
    paymentStatus: computePaymentStatus(r),
    start_date: r.start_date,
    target_completion_date: r.target_completion_date,
    handover_date: r.handover_date,
    created_at: r.created_at,
  }));
}

// ===========================================================
// Detail
// ===========================================================

export async function getBuildPackageDetail(supabase: SupabaseClient, id: string): Promise<BuildPackageDetail | null> {
  const { data: pkgRow, error: pkgError } = await supabase.from("build_packages").select("*").eq("id", id).maybeSingle();
  if (pkgError) throw pkgError;
  if (!pkgRow) return null;
  const buildPackage = pkgRow as BuildPackage;

  const [orgResult, assessmentResult, phasesResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", buildPackage.org_id).maybeSingle(),
    buildPackage.assessment_id
      ? supabase.from("assessments").select("assessment_type, completed_at").eq("id", buildPackage.assessment_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("build_package_phases").select("*").eq("build_package_id", id).order("phase_number", { ascending: true }),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (phasesResult.error) throw phasesResult.error;

  const phaseRows = phasesResult.data ?? [];
  const phaseIds = phaseRows.map((p) => p.id as string);

  let itemsByPhase = new Map<string, BuildPackageScopeItem[]>();
  if (phaseIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("build_package_scope_items")
      .select("*")
      .in("phase_id", phaseIds)
      .order("sort_order", { ascending: true });
    if (itemsError) throw itemsError;
    itemsByPhase = new Map();
    for (const item of (items ?? []) as BuildPackageScopeItem[]) {
      const list = itemsByPhase.get(item.phase_id) ?? [];
      list.push(item);
      itemsByPhase.set(item.phase_id, list);
    }
  }

  const phases: BuildPackagePhaseDetail[] = phaseRows.map((p) => {
    const scopeItems = itemsByPhase.get(p.id as string) ?? [];
    const completed = scopeItems.filter((i) => i.status === "complete").length;
    return {
      id: p.id,
      build_package_id: p.build_package_id,
      phase_number: p.phase_number,
      name: p.name,
      week_start: p.week_start,
      week_end: p.week_end,
      kind: p.kind,
      category_name: p.category_name,
      category_score: p.category_score,
      scopeItems,
      progressPct: scopeItems.length > 0 ? Math.round((completed / scopeItems.length) * 100) : 0,
    };
  });

  const totalItems = phases.reduce((sum, p) => sum + p.scopeItems.length, 0);
  const totalCompleted = phases.reduce((sum, p) => sum + p.scopeItems.filter((i) => i.status === "complete").length, 0);

  const assessmentRow = assessmentResult.data as { assessment_type: "quick_scan" | "full"; completed_at: string | null } | null;

  return {
    buildPackage,
    orgName: (orgResult.data as { name: string } | null)?.name ?? "Unknown organization",
    paymentStatus: computePaymentStatus(buildPackage),
    assessmentType: assessmentRow?.assessment_type ?? null,
    assessmentCompletedAt: assessmentRow?.completed_at ?? null,
    phases,
    overallProgressPct: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
  };
}

// ===========================================================
// Update
// ===========================================================

export type BuildPackageUpdateInput = {
  price: number | null;
  depositAmount: number | null;
  depositPaid: boolean;
  balanceAmount: number | null;
  balancePaid: boolean;
  startDate: string | null;
  targetCompletionDate: string | null;
  handoverDate: string | null;
  status: string;
  notes: string | null;
};

export async function updateBuildPackage(admin: SupabaseClient, id: string, input: BuildPackageUpdateInput): Promise<void> {
  const { data: current, error: currentError } = await admin
    .from("build_packages")
    .select("deposit_paid_at, balance_paid_at")
    .eq("id", id)
    .maybeSingle();
  if (currentError) throw currentError;

  const now = new Date().toISOString();
  const depositPaidAt = input.depositPaid ? (current?.deposit_paid_at ?? now) : null;
  const balancePaidAt = input.balancePaid ? (current?.balance_paid_at ?? now) : null;

  const { error } = await admin
    .from("build_packages")
    .update({
      price: input.price,
      deposit_amount: input.depositAmount,
      deposit_paid_at: depositPaidAt,
      balance_amount: input.balanceAmount,
      balance_paid_at: balancePaidAt,
      start_date: input.startDate,
      target_completion_date: input.targetCompletionDate,
      handover_date: input.handoverDate,
      status: input.status,
      notes: input.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function updateScopeItemStatus(admin: SupabaseClient, itemId: string, status: string): Promise<void> {
  const { error } = await admin.from("build_package_scope_items").update({ status }).eq("id", itemId);
  if (error) throw error;
}
