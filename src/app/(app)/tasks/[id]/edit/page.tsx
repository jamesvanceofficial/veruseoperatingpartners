import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getTaskById, getTaskDeletePreview } from "@/modules/tasks/data";
import { listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listProjectOptions } from "@/modules/projects/data";
import { TaskForm } from "@/modules/tasks/TaskForm";
import { DangerZone } from "@/shared/ui/DangerZone";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);
  if (!canEdit) redirect("/tasks");

  const supabase = await createServerSupabase();
  const task = await getTaskById(supabase, id);
  if (!task) notFound();

  const [staffOptions, orgOptions, projectOptions, deletePreview] = await Promise.all([
    listStaffProfiles(supabase),
    listOrgOptions(supabase),
    task.org_id ? listProjectOptions(supabase, task.org_id) : Promise.resolve([]),
    getTaskDeletePreview(supabase, id),
  ]);

  const lines = [`Delete "${task.title}"? This cannot be undone.`];
  if (deletePreview.hasLinkedScopeItem) {
    lines.push("This task is tracking a build package scope item — deleting it will not delete that scope item, but the two will no longer stay in sync.");
  }

  return (
    <PageShell title="Edit task" subtitle={task.title}>
      <TaskForm mode="edit" task={task} orgOptions={orgOptions} staffOptions={staffOptions} initialProjectOptions={projectOptions} />
      <DangerZone itemLabel="this task" confirmMessage={lines.join("\n")} deleteUrl={`/api/tasks/${id}`} redirectUrl="/tasks" />
    </PageShell>
  );
}
