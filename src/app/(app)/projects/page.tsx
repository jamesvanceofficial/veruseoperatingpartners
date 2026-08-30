import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { listProjects } from "@/modules/projects/data";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/modules/projects/labels";
import { ProjectListTable } from "@/modules/projects/ProjectListTable";
import type { ProjectListRow } from "@/modules/projects/types";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; status?: string }>;
}) {
  const params = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let rows: ProjectListRow[] = [];
  let orgOptions: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    [rows, orgOptions] = await Promise.all([
      listProjects(supabase, { orgId: params.org, status: params.status }),
      listOrgOptions(supabase),
    ]);
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.org || params.status);

  return (
    <PageShell title="Projects" subtitle="Active delivery work in progress across every client.">
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
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <Link href="/projects" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              Clear
            </Link>
          ) : null}
        </form>
        {canCreate ? (
          <LinkButton href="/projects/new" variant="primary">
            New project
          </LinkButton>
        ) : null}
      </div>

      {loadError ? (
        <EmptyState title="Projects aren't available yet" description="The database migrations may not have been run yet — check back once they are." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No projects match your filters" : "No projects yet"}
          description={hasFilters ? "Try a different filter or clear it." : "Generate projects from a build package, or create one directly."}
        />
      ) : (
        <ProjectListTable rows={rows} />
      )}
    </PageShell>
  );
}
