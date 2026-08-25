import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeScores, findBandId } from "./scoring";
import type { AssessmentType } from "./labels";
import type { Assessment, AssessmentListRow, AssessmentReport, Category, Band, Question, AnswerOption } from "./types";

// ===========================================================
// Reference data
// ===========================================================

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase.from("assessment_categories").select("id, name, weight, sort_order").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function getBands(supabase: SupabaseClient): Promise<Band[]> {
  const { data, error } = await supabase.from("assessment_bands").select("id, label, min_score, max_score, sort_order").order("sort_order", { ascending: true });
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

  const [orgResult, bandResult, categories, scoresResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", assessment.org_id).maybeSingle(),
    assessment.band_id ? supabase.from("assessment_bands").select("label").eq("id", assessment.band_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    getCategories(supabase),
    supabase.from("assessment_category_scores").select("category_id, raw_score, weighted_score, bottleneck_rank").eq("assessment_id", id),
  ]);
  if (orgResult.error) throw orgResult.error;
  if (scoresResult.error) throw scoresResult.error;

  const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));
  const rows = (scoresResult.data ?? []) as { category_id: string | null; raw_score: number; weighted_score: number; bottleneck_rank: number | null }[];

  const categoryScores = rows
    .filter((r): r is typeof r & { category_id: string } => Boolean(r.category_id))
    .map((r) => ({
      categoryId: r.category_id,
      categoryName: categoryNameMap.get(r.category_id) ?? "Unknown",
      rawScore: r.raw_score,
      weightedScore: r.weighted_score,
      weight: categories.find((c) => c.id === r.category_id)?.weight ?? 0,
      answeredCount: 0,
      bottleneckRank: r.bottleneck_rank ?? 0,
    }))
    .sort((a, b) => a.bottleneckRank - b.bottleneckRank === 0 ? 0 : a.bottleneckRank - b.bottleneckRank);

  return {
    assessment,
    orgName: (orgResult.data as { name: string } | null)?.name ?? "Unknown organization",
    bandLabel: (bandResult.data as { label: string } | null)?.label ?? null,
    categoryScores,
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
  return data.id as string;
}

// ===========================================================
// Answering + scoring — the one path every save (staff runner, public
// share-link, quick scan) funnels through.
// ===========================================================

type LiveScore = { enterpriseScore: number; categories: { categoryId: string; categoryName: string; rawScore: number; weight: number; answeredCount: number }[] };

async function recomputeAndSaveScores(admin: SupabaseClient, assessmentId: string): Promise<LiveScore> {
  const [answersResult, categories, bands] = await Promise.all([
    admin.from("assessment_answers").select("category_id_snapshot, weight_snapshot, answer_value").eq("assessment_id", assessmentId),
    getCategories(admin),
    getBands(admin),
  ]);
  if (answersResult.error) throw answersResult.error;

  const rows = (answersResult.data ?? []) as { category_id_snapshot: string | null; weight_snapshot: number; answer_value: string | null }[];
  const scored = rows
    .filter((r): r is typeof r & { category_id_snapshot: string } => Boolean(r.category_id_snapshot) && r.answer_value !== null)
    .map((r) => ({ categoryId: r.category_id_snapshot, weight: Number(r.weight_snapshot), value: Number(r.answer_value) }));

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

/** Upserts one answer (re-snapshotting from the live question every time — safe while the assessment is still active) and rescoring the whole assessment. Flips draft → in_progress and stamps started_at on the first answer. */
export async function saveAnswer(admin: SupabaseClient, assessmentId: string, questionId: string, value: number): Promise<LiveScore> {
  const { data: question, error: questionError } = await admin
    .from("assessment_questions")
    .select("question_text, category_id, answer_options")
    .eq("id", questionId)
    .single();
  if (questionError) throw questionError;

  const options = question.answer_options as AnswerOption[];
  const chosen = options.find((o) => o.value === value);
  if (!chosen) throw new Error("That answer isn't one of this question's choices.");

  const { data: category, error: categoryError } = await admin.from("assessment_categories").select("weight").eq("id", question.category_id).single();
  if (categoryError) throw categoryError;

  const { error: upsertError } = await admin.from("assessment_answers").upsert(
    {
      assessment_id: assessmentId,
      question_id: questionId,
      answer_value: String(value),
      question_text_snapshot: question.question_text,
      category_id_snapshot: question.category_id,
      weight_snapshot: category.weight,
      answer_options_snapshot: options,
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
  return { ok: true };
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

export async function getAnswersMap(supabase: SupabaseClient, assessmentId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase.from("assessment_answers").select("question_id, answer_value").eq("assessment_id", assessmentId);
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.question_id && row.answer_value !== null) map.set(row.question_id, Number(row.answer_value));
  }
  return map;
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
  answers: { questionId: string; value: number }[];
};

export type QuickScanResult = {
  assessmentId: string;
  enterpriseScore: number;
  bandLabel: string | null;
  topBottleneckCategoryName: string | null;
};

export async function submitQuickScan(admin: SupabaseClient, input: QuickScanInput): Promise<QuickScanResult> {
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
    await saveAnswer(admin, assessmentId, a.questionId, a.value);
  }

  const completed = await completeAssessment(admin, assessmentId);
  if (!completed.ok) throw new Error(completed.error);

  const report = await getAssessmentReport(admin, assessmentId);
  const topBottleneck = report?.categoryScores.find((c) => c.bottleneckRank === 1) ?? null;

  return {
    assessmentId,
    enterpriseScore: report?.assessment.enterprise_score ?? 0,
    bandLabel: report?.bandLabel ?? null,
    topBottleneckCategoryName: topBottleneck?.categoryName ?? null,
  };
}
