import { notFound } from "next/navigation";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Badge } from "@/shared/ui/Badge";
import { createAdminClient } from "@/shared/supabase/admin";
import { getAssessmentByToken, getAssessmentReport, getCategories, getQuestionsForType, getAnswersMap, getCarriedForwardMap } from "@/modules/assessments/data";
import { ASSESSMENT_TYPE_LABELS } from "@/modules/assessments/labels";
import { AssessmentReportView } from "@/modules/assessments/AssessmentReportView";
import { QuickScanResult } from "@/modules/assessments/QuickScanResult";
import { AssessmentRunner } from "@/modules/assessments/AssessmentRunner";

// Public, unauthenticated — every read here goes through the admin
// client. RLS on assessment_categories/bands/questions/assessments is
// scoped `to authenticated` only, so an anon request has zero access via
// the normal request-scoped client anyway; the token, resolved once by
// getAssessmentByToken, is what authorizes this page, not a session.
export default async function PublicAssessmentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const assessment = await getAssessmentByToken(admin, token);
  if (!assessment) notFound();

  let orgName = "your organization";
  const { data: org } = await admin.from("organizations").select("name").eq("id", assessment.org_id).maybeSingle();
  if (org?.name) orgName = org.name;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <BrandMark size="md" />
        <Badge tone="gold">{ASSESSMENT_TYPE_LABELS[assessment.assessment_type]}</Badge>
      </header>

      <main className="page-container flex flex-1 flex-col gap-6 pb-16">
        <div>
          <h1 className="text-[19px] font-semibold text-[var(--cream)]">Business Assessment for {orgName}</h1>
          <p className="text-[12.5px] text-[var(--muted)]">Answer honestly — the choice you pick is the score, nothing gets judged in between.</p>
        </div>

        {assessment.status === "completed" ? (
          assessment.assessment_type === "quick_scan" ? (
            <QuickScanCompleted admin={admin} assessmentId={assessment.id} />
          ) : (
            <FullCompleted admin={admin} assessmentId={assessment.id} />
          )
        ) : (
          <PublicRunner admin={admin} assessmentId={assessment.id} assessmentType={assessment.assessment_type} token={token} />
        )}
      </main>
    </div>
  );
}

async function FullCompleted({ admin, assessmentId }: { admin: ReturnType<typeof createAdminClient>; assessmentId: string }) {
  const report = await getAssessmentReport(admin, assessmentId);
  if (!report) return null;
  return <AssessmentReportView report={report} />;
}

async function QuickScanCompleted({ admin, assessmentId }: { admin: ReturnType<typeof createAdminClient>; assessmentId: string }) {
  const report = await getAssessmentReport(admin, assessmentId);
  if (!report) return null;
  return (
    <QuickScanResult
      score={report.assessment.enterprise_score ?? 0}
      bandLabel={report.bandLabel}
      bandDescription={report.bandDescription}
      categoryScores={report.categoryScores}
    />
  );
}

async function PublicRunner({
  admin,
  assessmentId,
  assessmentType,
  token,
}: {
  admin: ReturnType<typeof createAdminClient>;
  assessmentId: string;
  assessmentType: "quick_scan" | "full";
  token: string;
}) {
  const [categories, questions, answersMap, carriedForwardMap] = await Promise.all([
    getCategories(admin),
    getQuestionsForType(admin, assessmentType),
    getAnswersMap(admin, assessmentId),
    getCarriedForwardMap(admin, assessmentId),
  ]);

  return (
    <AssessmentRunner
      categories={categories}
      questions={questions}
      initialAnswers={Object.fromEntries(answersMap)}
      carriedForward={Object.fromEntries(carriedForwardMap)}
      clearCarriedForwardUrl={`/api/public/assessment/${token}/clear-carried-forward`}
      saveUrl={`/api/public/assessment/${token}/answer`}
      completeUrl={`/api/public/assessment/${token}/complete`}
    />
  );
}
