import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listProjects } from "@/modules/projects/data";
import { ProjectListTable } from "@/modules/projects/ProjectListTable";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";

export default async function OrganizationProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const rows = await listProjects(supabase, { orgId: id });

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Projects</h2>
        {canCreate ? (
          <LinkButton href={`/projects/new?org_id=${id}`} variant="primary">
            New project
          </LinkButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No projects yet" description="Generate projects from a build package, or create one directly." />
      ) : (
        <ProjectListTable rows={rows} showOrgColumn={false} />
      )}
    </div>
  );
}
