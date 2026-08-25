import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { listAssessments } from "@/modules/assessments/data";
import { ASSESSMENT_TYPES, ASSESSMENT_TYPE_LABELS, ASSESSMENT_STATUSES, ASSESSMENT_STATUS_LABELS } from "@/modules/assessments/labels";
import { AssessmentListTable } from "@/modules/assessments/AssessmentListTable";
import type { AssessmentListRow } from "@/modules/assessments/types";

export default async function BusinessAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let rows: AssessmentListRow[] = [];
  let orgOptions: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    [rows, orgOptions] = await Promise.all([
      listAssessments(supabase, { orgId: params.org, type: params.type, status: params.status }),
      listOrgOptions(supabase),
    ]);
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.org || params.type || params.status);

  return (
    <PageShell title="Business Assessments" subtitle="The $2,500 diagnostic — Quick Scan and Full Assessment results for every prospect and client.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <Select name="org" defaultValue={params.org ?? ""}>
            <option value="">All organizations</option>
            {orgOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <Select name="type" defaultValue={params.type ?? ""}>
            <option value="">All types</option>
            {ASSESSMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ASSESSMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            {ASSESSMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ASSESSMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <Link href="/business-assessments" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              Clear
            </Link>
          ) : null}
        </form>
        {canCreate ? (
          <LinkButton href="/business-assessments/new" variant="primary">
            New assessment
          </LinkButton>
        ) : null}
      </div>

      {loadError ? (
        <EmptyState
          title="Assessments aren't available yet"
          description="The database migrations may not have been run yet — check back once they are."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No assessments match your filters" : "No assessments yet"}
          description={hasFilters ? "Try a different filter or clear it." : "Start a Quick Scan or Full Assessment for a prospect."}
        />
      ) : (
        <AssessmentListTable rows={rows} />
      )}
    </PageShell>
  );
}
