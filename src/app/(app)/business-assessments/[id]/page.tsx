import { notFound } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getAssessmentById, getAssessmentReport, getCategories, getQuestionsForType, getAnswersMap, getCarriedForwardMap, getNotApplicableIds, getAnswerCount } from "@/modules/assessments/data";
import { ASSESSMENT_TYPE_LABELS, ASSESSMENT_STATUS_LABELS, ASSESSMENT_STATUS_TONE } from "@/modules/assessments/labels";
import { AssessmentReportView } from "@/modules/assessments/AssessmentReportView";
import { QuickScanResult } from "@/modules/assessments/QuickScanResult";
import { AssessmentRunner } from "@/modules/assessments/AssessmentRunner";
import { ShareLinkPanel } from "@/modules/assessments/ShareLinkPanel";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { DangerZone } from "@/shared/ui/DangerZone";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const assessment = await getAssessmentById(supabase, id);
  if (!assessment) notFound();

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const [orgResult] = await Promise.all([supabase.from("organizations").select("name").eq("id", assessment.org_id).maybeSingle()]);
  const orgName = (orgResult.data as { name: string } | null)?.name ?? "Unknown organization";

  let deleteConfirmMessage = "";
  if (canEdit) {
    const answerCount = await getAnswerCount(supabase, id);
    deleteConfirmMessage = `Delete this ${ASSESSMENT_TYPE_LABELS[assessment.assessment_type]} for ${orgName}? This permanently deletes its ${answerCount} answer${answerCount === 1 ? "" : "s"} and category scores. This cannot be undone.`;
  }

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/business-assessments" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Business Assessments
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{ASSESSMENT_TYPE_LABELS[assessment.assessment_type]}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={ASSESSMENT_STATUS_TONE[assessment.status]}>{ASSESSMENT_STATUS_LABELS[assessment.status]}</Badge>
            <Link href={`/organizations/${assessment.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              {orgName}
            </Link>
          </div>
        </div>
      </div>

      {canEdit ? (
        <ShareLinkPanel
          assessmentId={id}
          initialToken={assessment.share_token}
          initialExpiresAt={assessment.share_token_expires_at}
          initialActive={Boolean(assessment.share_token) && !assessment.share_token_revoked_at && (!assessment.share_token_expires_at || new Date(assessment.share_token_expires_at).getTime() > Date.now())}
        />
      ) : null}

      {assessment.status === "completed" ? (
        assessment.assessment_type === "quick_scan" ? (
          <QuickScanReport supabase={supabase} assessmentId={id} />
        ) : (
          <FullReport supabase={supabase} assessmentId={id} canEdit={canEdit} />
        )
      ) : !canEdit ? (
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">This assessment hasn&apos;t been completed yet.</p>
        </Card>
      ) : (
        <Runner supabase={supabase} assessmentId={id} assessmentType={assessment.assessment_type} />
      )}

      {canEdit ? (
        <DangerZone
          itemLabel="this assessment"
          confirmMessage={deleteConfirmMessage}
          deleteUrl={`/api/assessments/${id}`}
          redirectUrl="/business-assessments"
        />
      ) : null}
    </div>
  );
}

async function FullReport({ supabase, assessmentId, canEdit }: { supabase: SupabaseClient; assessmentId: string; canEdit: boolean }) {
  const report = await getAssessmentReport(supabase, assessmentId);
  if (!report) return null;
  return <AssessmentReportView report={report} canEdit={canEdit} />;
}

async function QuickScanReport({ supabase, assessmentId }: { supabase: SupabaseClient; assessmentId: string }) {
  const report = await getAssessmentReport(supabase, assessmentId);
  if (!report) return null;
  return (
    <QuickScanResult
      score={report.assessment.enterprise_score ?? 0}
      bandLabel={report.bandLabel}
      bandDescription={report.bandDescription}
      categoryScores={report.categoryScores}
      notApplicableCount={report.notApplicableCount}
    />
  );
}

async function Runner({
  supabase,
  assessmentId,
  assessmentType,
}: {
  supabase: SupabaseClient;
  assessmentId: string;
  assessmentType: "quick_scan" | "full";
}) {
  const [categories, questions, answersMap, carriedForwardMap, notApplicableIds] = await Promise.all([
    getCategories(supabase),
    getQuestionsForType(supabase, assessmentType),
    getAnswersMap(supabase, assessmentId),
    getCarriedForwardMap(supabase, assessmentId),
    getNotApplicableIds(supabase, assessmentId),
  ]);

  return (
    <AssessmentRunner
      categories={categories}
      questions={questions}
      initialAnswers={Object.fromEntries(answersMap)}
      initialNotApplicable={notApplicableIds}
      carriedForward={Object.fromEntries(carriedForwardMap)}
      clearCarriedForwardUrl={`/api/assessments/${assessmentId}/clear-carried-forward`}
      saveUrl={`/api/assessments/${assessmentId}/answer`}
      completeUrl={`/api/assessments/${assessmentId}/complete`}
    />
  );
}
