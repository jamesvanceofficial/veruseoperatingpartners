import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listAssessments } from "@/modules/assessments/data";
import { AssessmentListTable } from "@/modules/assessments/AssessmentListTable";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";

export default async function OrganizationAssessmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const rows = await listAssessments(supabase, { orgId: id });

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Assessments</h2>
        {canCreate ? (
          <LinkButton href={`/business-assessments/new?org_id=${id}`} variant="primary">
            Start new assessment
          </LinkButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No assessments yet" description="No Quick Scan or Full Assessment has been run for this organization." />
      ) : (
        <AssessmentListTable rows={rows} showOrgColumn={false} />
      )}
    </div>
  );
}
