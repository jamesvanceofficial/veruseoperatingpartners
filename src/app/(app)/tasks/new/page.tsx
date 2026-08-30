import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById, listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listProjectOptions } from "@/modules/projects/data";
import { TaskForm } from "@/modules/tasks/TaskForm";

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ org_id?: string; project_id?: string }> }) {
  const { org_id, project_id } = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canCreate) {
    return (
      <PageShell title="New task" subtitle="Add a task.">
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can create tasks.</p>
        </Card>
      </PageShell>
    );
  }

  const supabase = await createServerSupabase();

  const lockedOrg = org_id ? await getOrganizationById(supabase, org_id) : null;
  const [staffOptions, orgOptions, initialProjectOptions] = await Promise.all([
    listStaffProfiles(supabase),
    lockedOrg ? Promise.resolve([]) : listOrgOptions(supabase),
    lockedOrg ? listProjectOptions(supabase, lockedOrg.id) : Promise.resolve([]),
  ]);

  return (
    <PageShell title="New task" subtitle={lockedOrg ? `Add a task for ${lockedOrg.name}.` : "Add a task."}>
      <TaskForm
        mode="create"
        orgOptions={orgOptions}
        lockedOrg={lockedOrg ? { id: lockedOrg.id, name: lockedOrg.name } : undefined}
        staffOptions={staffOptions}
        initialProjectOptions={initialProjectOptions}
        defaultProjectId={project_id}
      />
    </PageShell>
  );
}
