import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listTasks } from "@/modules/tasks/data";
import { TaskListTable } from "@/modules/tasks/TaskListTable";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";

export default async function OrganizationTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const rows = await listTasks(supabase, { orgId: id });

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Tasks</h2>
        {canCreate ? (
          <LinkButton href={`/tasks/new?org_id=${id}`} variant="primary">
            New task
          </LinkButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No tasks yet" description="Generate projects from a build package, or create a task directly." />
      ) : (
        <TaskListTable rows={rows} showOrgColumn={false} />
      )}
    </div>
  );
}
