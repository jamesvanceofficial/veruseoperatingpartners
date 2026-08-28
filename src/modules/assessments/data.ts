import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeScores, findBandId } from "./scoring";
import { computeBuildRecommendation } from "./buildRecommendation";
import { getFinancialProfile, getBusinessPresence, getWorkforce, getOperationalNeeds, realHeadcountFrom, revenuePerEmployeeFrom } from "./profileData";
import { needsPortal } from "./effectiveScope";
import type { AssessmentType } from "./labels";
import type { BuildTier, SupportTier } from "./buildTiers";
import type { Assessment, AssessmentListRow, AssessmentReport, Category, Band, Question, AnswerOption, CategoryScoreDetail } from "./types";

// ===========================================================
// Reference data
// ===========================================================

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase.from("assessment_categories").select("id, name, weight, sort_order").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function getBands(supabase: SupabaseClient): Promise<Band[]> {
  const { data, error } = await supabase
    .from("assessment_bands")
    .select("id, label, min_score, max_score, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as Band[]) ?? [];
}

/** Quick Scan gets the 2-per-category subset; Full gets every active question. Ordered by category, then question. */
export async function getQuestionsForType(supabase: SupabaseClient, type: AssessmentType): Promise<Question[]> {
  const [categories, questionsResult] = await Promise.all([
    getCategories(supabase),
    (() => {
      let query = supabase
        .from("assessment_questions")
        .select("id, category_id, question_text, help_text, answer_options, sort_order, is_quick_scan, version, active")
        .eq("active", true);
      if (type === "quick_scan") query = query.eq("is_quick_scan", true);
      return query;
    })(),
  ]);
  if (questionsResult.error) throw questionsResult.error;

  const categoryOrder = new Map(categories.map((c) => [c.id, c.sort_order]));
  const rows = (questionsResult.data as Question[]) ?? [];
  return rows.sort((a, b) => {
    const catDiff = (categoryOrder.get(a.category_id) ?? 0) - (categoryOrder.get(b.category_id) ?? 0);
    return catDiff !== 0 ? catDiff : a.sort_order - b.sort_order;
  });
}

// ===========================================================
// Assessments
// ===========================================================

export async function getAssessmentById(supabase: SupabaseClient, id: string): Promise<Assessment | null> {
  const { data, error } = await supabase.from("assessments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Assessment) ?? null;
}

/** Public share-link entry point — the ONLY way an anonymous request resolves a token to an assessment. Never accepts a client-supplied id; every subsequent operation uses the id resolved here. Returns null if the token doesn't exist, is revoked, or is expired — the route must treat that as a 404, not distinguish why. */
export async function getAssessmentByToken(admin: SupabaseClient, token: string): Promise<Assessment | null> {
  const { data, error } = await admin.from("assessments").select("*").eq("share_token", token).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const assessment = data as Assessment;
  if (assessment.share_token_revoked_at) return null;
  if (assessment.share_token_expires_at && new Date(assessment.share_token_expires_at).getTime() < Date.now()) return null;
  return assessment;
}

export type AssessmentFilters = { orgId?: string; type?: string; status?: string };

export async function listAssessments(supabase: SupabaseClient, filters: AssessmentFilters = {}): Promise<AssessmentListRow[]> {
  let query = supabase
    .from("assessments")
    .select("id, org_id, assessment_type, status, enterprise_score, band_id, created_at, completed_at")
    .order("created_at", { ascending: false });
  if (filters.orgId) query = query.eq("org_id", filters.orgId);
  if (filters.type) query = query.eq("assessment_type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as { id: string; org_id: string; assessment_type: AssessmentType; status: Assessment["status"]; enterprise_score: number | null; band_id: string | null; created_at: string; completed_at: string | null }[];
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.org_id))];
  const bandIds = [...new Set(rows.map((r) => r.band_id).filter((v): v is string => Boolean(v)))];

  const [orgsResult, bandsResult] = await Promise.all([
    supabase.from("organizations").select("id, name").in("id", orgIds),
    bandIds.length > 0 ? supabase.from("assessment_bands").select("id, label").in("id", bandIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (orgsResult.error) throw orgsResult.error;
  if (bandsResult.error) throw bandsResult.error;

  const orgMap = new Map((orgsResult.data ?? []).map((o) => [o.id, o.name as string]));
  const bandMap = new Map((bandsResult.data ?? []).map((b) => [b.id, b.label as string]));

  return rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    orgName: orgMap.get(r.org_id) ?? "Unknown organization",
    assessment_type: r.assessment_type,
    status: r.status,
    enterprise_score: r.enterprise_score,
    bandLabel: r.band_id ? (bandMap.get(r.band_id) ?? null) : null,
    created_at: r.created_at,
    completed_at: r.completed_at,
  }));
}

export async function getAssessmentReport(supabase: SupabaseClient, id: string): Promise<AssessmentReport | null> {
  const assessment = await getAssessmentById(supabase, id);
  if (!assessment) return null;

  const [orgResult, bandResult, categories, questions, scoresResult, naTotalResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", assessment.org_id).maybeSingle(),
    assessment.band_id
      ? supabase.from("assessment_bands").select("label, description").eq("id", assessment.band_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    getCategories(supabase),
    getQuestionsForType(supabase, assessment.assessment_type),
    supabase.from("assessment_category_scores").select("category_id, raw_score, weighted_score, bottleneck_rank, not_applicable_count").eq("assessment_id", id),
    // A category with EVERY question marked not applicable gets no score
    // row at all (same as one with zero answers) — so the assessment-wide
    // total is counted independently here, not derived from summing
    // categoryScores, or that category's not-applicable answers would
    // silently vanish from the count.
    supabase.from("assessment_answers").select("*", { count: "exact", head: true }).eq("assessment_id", id).eq("is_not_applicable", true),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (scoresResult.error) throw scoresResult.error;
  if (naTotalResult.error) throw naTotalResult.error;

  const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));
  const totalQuestionsByCategory = new Map<string, number>();
  for (const q of questions) totalQuestionsByCategory.set(q.category_id, (totalQuestionsByCategory.get(q.category_id) ?? 0) + 1);

  const rows = (scoresResult.data ?? []) as {
    category_id: string | null;
    raw_score: number;
    weighted_score: number;
    bottleneck_rank: number | null;
    not_applicable_count: number | null;
  }[];

  const categoryScores = rows
    .filter((r): r is typeof r & { category_id: string } => Boolean(r.category_id))
    .map((r) => {
      const notApplicableCount = r.not_applicable_count ?? 0;
      const totalQuestionCount = totalQuestionsByCategory.get(r.category_id) ?? 0;
      return {
        categoryId: r.category_id,
        categoryName: categoryNameMap.get(r.category_id) ?? "Unknown",
        rawScore: r.raw_score,
        weightedScore: r.weighted_score,
        weight: categories.find((c) => c.id === r.category_id)?.weight ?? 0,
        answeredCount: 0,
        bottleneckRank: r.bottleneck_rank ?? 0,
        notApplicableCount,
        totalQuestionCount,
        lowConfidence: totalQuestionCount > 0 && notApplicableCount / totalQuestionCount > 1 / 3,
      };
    })
    .sort((a, b) => a.bottleneckRank - b.bottleneckRank === 0 ? 0 : a.bottleneckRank - b.bottleneckRank);

  const band = bandResult.data as { label: string; description: string | null } | null;

  const overrideByIds = [assessment.build_tier_override_by, assessment.support_tier_override_by, assessment.pricing_released_by].filter(
    (v): v is string => Boolean(v)
  );
  let buildTierOverrideByName: string | null = null;
  let supportTierOverrideByName: string | null = null;
  let pricingReleasedByName: string | null = null;
  if (overrideByIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, email").in("id", overrideByIds);
    if (profilesError) throw profilesError;
    const nameMap = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? (p.email as string | null) ?? "Unnamed"]));
    buildTierOverrideByName = assessment.build_tier_override_by ? (nameMap.get(assessment.build_tier_override_by) ?? null) : null;
    supportTierOverrideByName = assessment.support_tier_override_by ? (nameMap.get(assessment.support_tier_override_by) ?? null) : null;
    pricingReleasedByName = assessment.pricing_released_by ? (nameMap.get(assessment.pricing_released_by) ?? null) : null;
  }

  // Full Assessment only — never captured for a quick_scan.
  let financialProfile = null;
  let businessPresence = null;
  let workforce = null;
  let operationalNeeds = null;
  if (assessment.assessment_type === "full") {
    [financialProfile, businessPresence, workforce, operationalNeeds] = await Promise.all([
      getFinancialProfile(supabase, id),
      getBusinessPresence(supabase, id),
      getWorkforce(supabase, id),
      getOperationalNeeds(supabase, id),
    ]);
  }
  const realHeadcount = realHeadcountFrom(workforce);

  // Stage 9 — most recent linked build package's handover date, if any.
  // Queried directly (not via the buildPackages module) to avoid a
  // circular import, since buildPackages/data.ts itself calls
  // getAssessmentReport().
  const { data: latestPackage, error: packageError } = await supabase
    .from("build_packages")
    .select("handover_date")
    .eq("assessment_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (packageError) throw packageError;
  const buildPackageHandoverDate = (latestPackage?.handover_date as string | null) ?? null;

  return {
    assessment,
    orgName: (orgResult.data as { name: string } | null)?.name ?? "Unknown organization",
    bandLabel: band?.label ?? null,
    bandDescription: band?.description ?? null,
    categoryScores,
    notApplicableCount: naTotalResult.count ?? 0,
    buildTierOverrideByName,
    supportTierOverrideByName,
    pricingReleasedByName,
    financialProfile,
    businessPresence,
    workforce,
    operationalNeeds,
    revenuePerEmployee: revenuePerEmployeeFrom(financialProfile, realHeadcount),
    realHeadcount,
    buildPackageHandoverDate,
  };
}

export async function createAssessment(
  admin: SupabaseClient,
  input: { orgId: string; assessmentType: AssessmentType; opportunityId?: string | null; conductedBy?: string | null; status?: string }
): Promise<string> {
  const { data, error } = await admin
    .from("assessments")
    .insert({
      org_id: input.orgId,
      assessment_type: input.assessmentType,
      opportunity_id: input.opportunityId ?? null,
      conducted_by: input.conductedBy ?? null,
      status: input.status ?? "draft",
    })
    .select("id")
    .single();
  if (error) throw error;
  const assessmentId = data.id as string;

  if (input.assessmentType === "full") {
    await copyForwardFromQuickScan(admin, input.orgId, assessmentId);
  }

  return assessmentId;
}

/**
 * A prospect who already took the free Quick Scan shouldn't be asked the
 * same 20 questions again in the paid Full Assessment. Copies answers for
 * any question the org's most recent COMPLETED quick scan already
 * answered — never a draft/in-progress one, never another org's — into
 * the new full assessment as real answers in their own right (snapshotted
 * from the CURRENT live question, same as any other save, in case the
 * question bank changed since the scan). Marked via carried_forward_at so
 * the runner can show them as carried and offer to clear them.
 */
async function copyForwardFromQuickScan(admin: SupabaseClient, orgId: string, targetAssessmentId: string): Promise<void> {
  const { data: sourceRows, error: sourceError } = await admin
    .from("assessments")
    .select("id, completed_at")
    .eq("org_id", orgId)
    .eq("assessment_type", "quick_scan")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1);
  if (sourceError) throw sourceError;
  const source = sourceRows?.[0] as { id: string; completed_at: string | null } | undefined;
  if (!source) return;

  const { data: sourceAnswers, error: answersError } = await admin
    .from("assessment_answers")
    .select("question_id, answer_value, is_not_applicable")
    .eq("assessment_id", source.id);
  if (answersError) throw answersError;

  const answered = (sourceAnswers ?? []).filter(
    (r): r is { question_id: string; answer_value: string | null; is_not_applicable: boolean } =>
      Boolean(r.question_id) && (r.answer_value !== null || r.is_not_applicable)
  );
  if (answered.length === 0) return;

  const [categories, questions] = await Promise.all([getCategories(admin), getQuestionsForType(admin, "full")]);
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const categoryWeightMap = new Map(categories.map((c) => [c.id, c.weight]));

  type InsertRow = {
    assessment_id: string;
    question_id: string;
    question_text_snapshot: string;
    category_id_snapshot: string;
    weight_snapshot: number;
    answer_options_snapshot: AnswerOption[];
    carried_forward_at: string | null;
    answer_value: string | null;
    is_not_applicable: boolean;
  };

  const rowsToInsert = answered.flatMap((a): InsertRow[] => {
    const question = questionMap.get(a.question_id);
    if (!question) return [];
    const base = {
      assessment_id: targetAssessmentId,
      question_id: question.id,
      question_text_snapshot: question.question_text,
      category_id_snapshot: question.category_id,
      weight_snapshot: categoryWeightMap.get(question.category_id) ?? 0,
      answer_options_snapshot: question.answer_options,
      carried_forward_at: source.completed_at,
    };
    // A question genuinely not applicable to this business doesn't stop
    // being not applicable between the scan and the full assessment —
    // carry that forward as-is, same as a real answer.
    if (a.is_not_applicable) {
      return [{ ...base, answer_value: null, is_not_applicable: true }];
    }
    const value = Number(a.answer_value);
    if (!question.answer_options.some((o) => o.value === value)) return [];
    return [{ ...base, answer_value: String(value), is_not_applicable: false }];
  });
  if (rowsToInsert.length === 0) return;

  const { error: insertError } = await admin.from("assessment_answers").insert(rowsToInsert);
  if (insertError) throw insertError;

  await admin.from("assessments").update({ status: "in_progress", started_at: new Date().toISOString() }).eq("id", targetAssessmentId);
  await recomputeAndSaveScores(admin, targetAssessmentId);
}

/** question_id -> the source quick scan's completed_at, for every answer on this assessment still carried forward and untouched since. */
export async function getCarriedForwardMap(supabase: SupabaseClient, assessmentId: string): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("assessment_answers")
    .select("question_id, carried_forward_at")
    .eq("assessment_id", assessmentId)
    .not("carried_forward_at", "is", null);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.question_id && row.carried_forward_at) map.set(row.question_id as string, row.carried_forward_at as string);
  }
  return map;
}

/** "Clear and start fresh" — removes only the still-untouched carried-forward answers, leaving anything the user already re-confirmed or changed (which cleared its own carried_forward_at the moment it was saved) alone. */
export async function clearCarriedForwardAnswers(admin: SupabaseClient, assessmentId: string): Promise<void> {
  const { error } = await admin.from("assessment_answers").delete().eq("assessment_id", assessmentId).not("carried_forward_at", "is", null);
  if (error) throw error;
  await recomputeAndSaveScores(admin, assessmentId);
}

// ===========================================================
// Answering + scoring — the one path every save (staff runner, public
// share-link, quick scan) funnels through.
// ===========================================================

type LiveScore = { enterpriseScore: number; categories: { categoryId: string; categoryName: string; rawScore: number; weight: number; answeredCount: number }[] };

async function recomputeAndSaveScores(admin: SupabaseClient, assessmentId: string): Promise<LiveScore> {
  const [assessmentResult, answersResult, categories, bands] = await Promise.all([
    admin.from("assessments").select("assessment_type").eq("id", assessmentId).single(),
    admin.from("assessment_answers").select("category_id_snapshot, weight_snapshot, answer_value, is_not_applicable").eq("assessment_id", assessmentId),
    getCategories(admin),
    getBands(admin),
  ]);
  if (assessmentResult.error) throw assessmentResult.error;
  if (answersResult.error) throw answersResult.error;

  const rows = (answersResult.data ?? []) as { category_id_snapshot: string | null; weight_snapshot: number; answer_value: string | null; is_not_applicable: boolean }[];
  // Not-applicable rows have answer_value = null, so they're excluded from
  // scoring here the same way an unanswered question already is — never
  // counted as a zero, just left out of both the numerator and denominator.
  const scored = rows
    .filter((r): r is typeof r & { category_id_snapshot: string } => Boolean(r.category_id_snapshot) && r.answer_value !== null)
    .map((r) => ({ categoryId: r.category_id_snapshot, weight: Number(r.weight_snapshot), value: Number(r.answer_value) }));

  const naCountByCategory = new Map<string, number>();
  for (const r of rows) {
    if (r.is_not_applicable && r.category_id_snapshot) {
      naCountByCategory.set(r.category_id_snapshot, (naCountByCategory.get(r.category_id_snapshot) ?? 0) + 1);
    }
  }

  const { enterpriseScore, categories: computed } = computeScores(scored);
  const bandId = findBandId(bands, enterpriseScore);
  const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));

  // Replace this assessment's score rows wholesale — simpler and safer
  // than diffing, and the set is small (at most 10 rows).
  const { error: deleteError } = await admin.from("assessment_category_scores").delete().eq("assessment_id", assessmentId);
  if (deleteError) throw deleteError;

  if (computed.length > 0) {
    const { error: insertError } = await admin.from("assessment_category_scores").insert(
      computed.map((c) => ({
        assessment_id: assessmentId,
        category_id: c.categoryId,
        raw_score: c.rawScore,
        weighted_score: c.weightedScore,
        bottleneck_rank: c.bottleneckRank,
        not_applicable_count: naCountByCategory.get(c.categoryId) ?? 0,
      }))
    );
    if (insertError) throw insertError;
  }

  const { error: updateError } = await admin.from("assessments").update({ enterprise_score: enterpriseScore, band_id: bandId }).eq("id", assessmentId);
  if (updateError) throw updateError;

  return {
    enterpriseScore,
    categories: computed.map((c) => ({ categoryId: c.categoryId, categoryName: categoryNameMap.get(c.categoryId) ?? "Unknown", rawScore: c.rawScore, weight: c.weight, answeredCount: c.answeredCount })),
  };
}

/** Upserts one answer (re-snapshotting from the live question every time — safe while the assessment is still active) and rescoring the whole assessment. Flips draft → in_progress and stamps started_at on the first answer. Pass {notApplicable:true} instead of a value when the question genuinely doesn't apply — it's stored distinctly (answer_value stays null, is_not_applicable=true) and excluded from scoring entirely, never counted as a zero. */
export async function saveAnswer(
  admin: SupabaseClient,
  assessmentId: string,
  questionId: string,
  input: { value: number } | { notApplicable: true }
): Promise<LiveScore> {
  const { data: question, error: questionError } = await admin
    .from("assessment_questions")
    .select("question_text, category_id, answer_options")
    .eq("id", questionId)
    .single();
  if (questionError) throw questionError;

  const options = question.answer_options as AnswerOption[];

  let answerValue: string | null = null;
  let isNotApplicable = false;
  if ("notApplicable" in input) {
    isNotApplicable = true;
  } else {
    const chosen = options.find((o) => o.value === input.value);
    if (!chosen) throw new Error("That answer isn't one of this question's choices.");
    answerValue = String(input.value);
  }

  const { data: category, error: categoryError } = await admin.from("assessment_categories").select("weight").eq("id", question.category_id).single();
  if (categoryError) throw categoryError;

  const { error: upsertError } = await admin.from("assessment_answers").upsert(
    {
      assessment_id: assessmentId,
      question_id: questionId,
      answer_value: answerValue,
      is_not_applicable: isNotApplicable,
      question_text_snapshot: question.question_text,
      category_id_snapshot: question.category_id,
      weight_snapshot: category.weight,
      answer_options_snapshot: options,
      // Any answer saved through this path — first time or re-answering a
      // carried-forward one — is a current, deliberate answer, not merely
      // carried. Always clears the flag, which is what makes the carried
      // marker disappear the moment someone touches the question.
      carried_forward_at: null,
    },
    { onConflict: "assessment_id,question_id" }
  );
  if (upsertError) throw upsertError;

  const { data: current, error: currentError } = await admin.from("assessments").select("status, started_at").eq("id", assessmentId).single();
  if (currentError) throw currentError;

  const patch: Record<string, unknown> = {};
  if (current.status === "draft") patch.status = "in_progress";
  if (!current.started_at) patch.started_at = new Date().toISOString();
  if (Object.keys(patch).length > 0) {
    const { error: statusError } = await admin.from("assessments").update(patch).eq("id", assessmentId);
    if (statusError) throw statusError;
  }

  return recomputeAndSaveScores(admin, assessmentId);
}

/** Marks an assessment completed. Requires every question for its type to be answered — the caller is responsible for telling the user why if this rejects. */
export async function completeAssessment(admin: SupabaseClient, assessmentId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const assessment = await getAssessmentById(admin, assessmentId);
  if (!assessment) return { ok: false, error: "Assessment not found." };

  const [questions, answersResult] = await Promise.all([
    getQuestionsForType(admin, assessment.assessment_type),
    admin.from("assessment_answers").select("question_id").eq("assessment_id", assessmentId),
  ]);
  if (answersResult.error) throw answersResult.error;

  const answeredIds = new Set((answersResult.data ?? []).map((r) => r.question_id));
  const unanswered = questions.filter((q) => !answeredIds.has(q.id));
  if (unanswered.length > 0) {
    return { ok: false, error: `${unanswered.length} question${unanswered.length === 1 ? "" : "s"} still need${unanswered.length === 1 ? "s" : ""} an answer.` };
  }

  await recomputeAndSaveScores(admin, assessmentId);
  const { error } = await admin.from("assessments").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", assessmentId);
  if (error) throw error;

  if (assessment.assessment_type === "full") {
    await computeAndSaveBuildRecommendation(admin, assessmentId);
  }

  return { ok: true };
}

// ===========================================================
// Build recommendation — Stage 8. Computed once, at completion, for Full
// Assessments only (never Quick Scan — that stays a hook with no pricing
// shown). A snapshot, like the score itself: not recomputed later even if
// the org record changes afterward.
// ===========================================================

/** Full Assessment only — the caller (completeAssessment) is responsible for that check. */
async function computeAndSaveBuildRecommendation(admin: SupabaseClient, assessmentId: string): Promise<void> {
  const assessment = await getAssessmentById(admin, assessmentId);
  if (!assessment) return;

  const [orgResult, categories, scoresResult, financialProfile, businessPresence, workforce, operationalNeeds] = await Promise.all([
    admin.from("organizations").select("name, annual_revenue_estimate, employee_count_estimate, location_count").eq("id", assessment.org_id).maybeSingle(),
    getCategories(admin),
    admin.from("assessment_category_scores").select("category_id, raw_score, bottleneck_rank").eq("assessment_id", assessmentId),
    getFinancialProfile(admin, assessmentId),
    getBusinessPresence(admin, assessmentId),
    getWorkforce(admin, assessmentId),
    getOperationalNeeds(admin, assessmentId),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (scoresResult.error) throw scoresResult.error;

  const org = orgResult.data as { name: string; annual_revenue_estimate: number | null; employee_count_estimate: number | null; location_count: number | null } | null;
  const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));
  const rows = (scoresResult.data ?? []) as { category_id: string | null; raw_score: number; bottleneck_rank: number | null }[];
  const categoryScores = rows
    .filter((r): r is typeof r & { category_id: string } => Boolean(r.category_id))
    .map((r) => ({ categoryName: categoryNameMap.get(r.category_id) ?? "Unknown", rawScore: r.raw_score, bottleneckRank: r.bottleneck_rank ?? 0 }));

  const realHeadcount = realHeadcountFrom(workforce);

  const recommendation = computeBuildRecommendation({
    orgName: org?.name ?? "This organization",
    enterpriseScore: assessment.enterprise_score ?? 0,
    categoryScores,
    annualRevenueEstimate: org?.annual_revenue_estimate ?? null,
    employeeCountEstimate: org?.employee_count_estimate ?? null,
    locationCount: org?.location_count ?? null,
    realRevenue: financialProfile?.currentYearRevenue ?? financialProfile?.lastFullYearRevenue ?? null,
    netProfitMarginPct: financialProfile?.netProfitMarginPct ?? null,
    realHeadcount,
    hasWebsite: businessPresence?.hasWebsite ?? null,
    hasGoogleBusinessProfile: businessPresence?.socialChannels.includes("google_business") ?? false,
    hasPortalNeed: needsPortal(operationalNeeds),
    automationTaskCount: operationalNeeds?.automationTasks.length ?? 0,
  });

  const { error } = await admin
    .from("assessments")
    .update({
      recommended_build_tier: recommendation.buildTier,
      recommended_build_price: recommendation.buildPrice,
      build_recommendation_reasoning: recommendation.buildReasoning,
      recommended_support_tier: recommendation.supportTier,
      recommended_support_price: recommendation.supportPrice,
      support_recommendation_reasoning: recommendation.supportReasoning,
    })
    .eq("id", assessmentId);
  if (error) throw error;
}

/** Staff override for the recommended build and/or support tier. Passing null for either clears that override, reverting to the recommendation. Both are recorded independently with who/when. */
export async function setRecommendationOverride(
  admin: SupabaseClient,
  assessmentId: string,
  input: { buildTierOverride?: BuildTier | null; supportTierOverride?: SupportTier | null; overriddenBy: string }
): Promise<void> {
  const patch: Record<string, unknown> = {};
  const now = new Date().toISOString();

  if (input.buildTierOverride !== undefined) {
    patch.build_tier_override = input.buildTierOverride;
    patch.build_tier_override_by = input.buildTierOverride ? input.overriddenBy : null;
    patch.build_tier_override_at = input.buildTierOverride ? now : null;
  }
  if (input.supportTierOverride !== undefined) {
    patch.support_tier_override = input.supportTierOverride;
    patch.support_tier_override_by = input.supportTierOverride ? input.overriddenBy : null;
    patch.support_tier_override_at = input.supportTierOverride ? now : null;
  }
  if (Object.keys(patch).length === 0) return;

  const { error } = await admin.from("assessments").update(patch).eq("id", assessmentId);
  if (error) throw error;
}

/** Stage 22 — staff-only toggle. Releasing stamps who/when; hiding again clears both, same as an override reverting to null — the fields always describe the CURRENT state, not a history of past releases. */
export async function setPricingReleased(
  admin: SupabaseClient,
  assessmentId: string,
  input: { released: boolean; releasedBy: string }
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from("assessments")
    .update({
      pricing_released: input.released,
      pricing_released_at: input.released ? now : null,
      pricing_released_by: input.released ? input.releasedBy : null,
    })
    .eq("id", assessmentId);
  if (error) throw error;
}

// ===========================================================
// Share links
// ===========================================================

export async function generateShareLink(admin: SupabaseClient, assessmentId: string, expiresInDays: number | null): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null;
  const { error } = await admin
    .from("assessments")
    .update({ share_token: token, share_token_expires_at: expiresAt, share_token_revoked_at: null })
    .eq("id", assessmentId);
  if (error) throw error;
  return token;
}

export async function revokeShareLink(admin: SupabaseClient, assessmentId: string): Promise<void> {
  const { error } = await admin.from("assessments").update({ share_token_revoked_at: new Date().toISOString() }).eq("id", assessmentId);
  if (error) throw error;
}

// ===========================================================
// Answers — for resuming the runner
// ===========================================================

/** For the delete confirmation — answers and category scores both cascade-delete with the assessment at the DB level, so this is the only count that needs computing. */
export async function getAnswerCount(supabase: SupabaseClient, assessmentId: string): Promise<number> {
  const { count, error } = await supabase.from("assessment_answers").select("*", { count: "exact", head: true }).eq("assessment_id", assessmentId);
  if (error) throw error;
  return count ?? 0;
}

export async function getAnswersMap(supabase: SupabaseClient, assessmentId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase.from("assessment_answers").select("question_id, answer_value").eq("assessment_id", assessmentId);
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.question_id && row.answer_value !== null) map.set(row.question_id, Number(row.answer_value));
  }
  return map;
}

/** question_ids marked not applicable on this assessment — for resuming the runner with the toggle already set. */
export async function getNotApplicableIds(supabase: SupabaseClient, assessmentId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("assessment_answers")
    .select("question_id")
    .eq("assessment_id", assessmentId)
    .eq("is_not_applicable", true);
  if (error) throw error;
  return (data ?? []).map((r) => r.question_id as string).filter(Boolean);
}

// ===========================================================
// Public Quick Scan — the /scan intake flow. Creates the org/contact/
// opportunity/assessment in one submission and scores it immediately
// (Quick Scan is one-shot, never resumed), per Stage 7 rule #5.
// ===========================================================

export type QuickScanInput = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  revenueRange: string;
  answers: { questionId: string; value: number | null; notApplicable: boolean }[];
};

// Named distinctly from the QuickScanResult *component* (modules/assessments/QuickScanResult.tsx) — this is the data shape the API returns, not UI.
export type QuickScanSubmissionResult = {
  assessmentId: string;
  enterpriseScore: number;
  bandLabel: string | null;
  bandDescription: string | null;
  categoryScores: CategoryScoreDetail[];
  notApplicableCount: number;
};

export async function submitQuickScan(admin: SupabaseClient, input: QuickScanInput): Promise<QuickScanSubmissionResult> {
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: input.companyName,
      type: "prospect",
      status: "active",
      industry: input.industry || null,
      source: "Website Quick Scan",
      notes: input.revenueRange ? `Revenue range (self-reported via Quick Scan): ${input.revenueRange}` : null,
    })
    .select("id")
    .single();
  if (orgError) throw orgError;

  const { error: contactError } = await admin.from("contacts").insert({
    org_id: org.id,
    full_name: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    contact_role: "owner",
    is_primary: true,
  });
  if (contactError) throw contactError;

  const { data: opportunity, error: opportunityError } = await admin
    .from("opportunities")
    .insert({ org_id: org.id, name: `${input.companyName} — Quick Scan`, stage: "lead", source: "website scan" })
    .select("id")
    .single();
  if (opportunityError) throw opportunityError;

  const assessmentId = await createAssessment(admin, {
    orgId: org.id,
    assessmentType: "quick_scan",
    opportunityId: opportunity.id,
    status: "in_progress",
  });

  for (const a of input.answers) {
    await saveAnswer(admin, assessmentId, a.questionId, a.notApplicable ? { notApplicable: true } : { value: a.value as number });
  }

  const completed = await completeAssessment(admin, assessmentId);
  if (!completed.ok) throw new Error(completed.error);

  const report = await getAssessmentReport(admin, assessmentId);

  return {
    assessmentId,
    enterpriseScore: report?.assessment.enterprise_score ?? 0,
    bandLabel: report?.bandLabel ?? null,
    bandDescription: report?.bandDescription ?? null,
    categoryScores: report?.categoryScores ?? [],
    notApplicableCount: report?.notApplicableCount ?? 0,
  };
}
