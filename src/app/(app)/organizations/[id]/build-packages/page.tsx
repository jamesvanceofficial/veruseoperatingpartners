import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listAssessments } from "@/modules/assessments/data";
import { listBuildPackages } from "@/modules/buildPackages/data";
import { BuildPackageListTable } from "@/modules/buildPackages/BuildPackageListTable";
import { CreateBuildPackageButton } from "@/modules/buildPackages/CreateBuildPackageButton";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatDate } from "@/shared/format";

export default async function OrganizationBuildPackagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const [packages, completedFullAssessments] = await Promise.all([
    listBuildPackages(supabase, { orgId: id }),
    listAssessments(supabase, { orgId: id, type: "full", status: "completed" }),
  ]);

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const packageByAssessmentId = new Map(packages.filter((p) => p.assessment_id).map((p) => [p.assessment_id as string, p.id]));

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[14px] font-semibold text-[var(--cream)]">Build Packages</h2>

      {packages.length === 0 ? (
        <EmptyState title="No build packages yet" description="Start one from a completed Full Assessment below." />
      ) : (
        <BuildPackageListTable rows={packages} showOrgColumn={false} />
      )}

      {canCreate ? (
        <Card className="flex flex-col gap-3">
          <p className="section-label">Start one</p>
          {completedFullAssessments.length === 0 ? (
            <p className="text-[12.5px] text-[var(--muted)]">
              No completed Full Assessment yet for this organization — a build package is always created from one.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--hairline)]">
              {completedFullAssessments.map((a) => {
                const existingPackageId = packageByAssessmentId.get(a.id);
                return (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12.5px] text-[var(--cream)]">Full Assessment</span>
                      <Badge tone="neutral">{formatDate(a.completed_at)}</Badge>
                      <span className="text-[11.5px] text-[var(--muted)]">Score {a.enterprise_score ?? "—"}</span>
                    </div>
                    {existingPackageId ? (
                      <LinkButton href={`/build-packages/${existingPackageId}`} variant="secondary">
                        View build package →
                      </LinkButton>
                    ) : (
                      <CreateBuildPackageButton assessmentId={a.id} label="Create build package" variant="primary" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : null}

      <Link href={`/organizations/${id}/assessments`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
        View all assessments →
      </Link>
    </div>
  );
}
