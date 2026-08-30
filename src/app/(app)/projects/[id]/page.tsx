import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getProjectDetail, getProjectDeletePreview } from "@/modules/projects/data";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE, PRIORITY_LABELS, PRIORITY_TONE } from "@/modules/projects/labels";
import { TASK_STATUS_LABELS, TASK_STATUS_TONE } from "@/modules/tasks/labels";
import { TaskStatusSelect } from "@/modules/tasks/TaskStatusSelect";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
import { LinkButton } from "@/shared/ui/LinkButton";
import { DangerZone } from "@/shared/ui/DangerZone";
import { formatDate } from "@/shared/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="text-[13px] text-[var(--cream)]">{value ?? "—"}</p>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getProjectDetail(supabase, id);
  if (!detail) notFound();

  const { project, orgName, ownerName, categoryName, buildPackageTierLabel, phaseName, tasks, completionPct } = detail;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let deleteConfirmMessage = "";
  if (canEdit) {
    const preview = await getProjectDeletePreview(supabase, id);
    const lines = [`Delete "${project.name}" for ${orgName}? This cannot be undone.`];
    lines.push(`This will also permanently delete ${preview.taskCount} task${preview.taskCount === 1 ? "" : "s"}.`);
    deleteConfirmMessage = lines.join("\n");
  }

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/projects" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Projects
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{project.name}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={PROJECT_STATUS_TONE[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
            <Badge tone={PRIORITY_TONE[project.priority]}>{PRIORITY_LABELS[project.priority]}</Badge>
            <Link href={`/organizations/${project.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              {orgName}
            </Link>
          </div>
        </div>
        {canEdit ? <LinkButton href={`/projects/${id}/edit`}>Edit project</LinkButton> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Completion" value={`${completionPct}%`} tone="gold" />
        <Stat label="Owner" value={ownerName ?? "Unassigned"} />
        <Stat label="Start Date" value={formatDate(project.start_date)} />
        <Stat label="Due Date" value={formatDate(project.due_date)} />
      </div>

      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Build package" value={buildPackageTierLabel} />
        <Field label="Phase" value={phaseName} />
        <Field label="Assessment category" value={categoryName} />
      </Card>

      <Card>
        <p className="mb-2 section-label">Description</p>
        <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{project.description ?? "No description yet."}</p>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[var(--cream)]">Tasks</h2>
          {canEdit ? (
            <LinkButton href={`/tasks/new?project_id=${id}&org_id=${project.org_id}`} variant="secondary">
              Add task
            </LinkButton>
          ) : null}
        </div>
        {tasks.length === 0 ? (
          <Card>
            <p className="text-[12.5px] text-[var(--muted)]">No tasks yet.</p>
          </Card>
        ) : (
          <Card className="flex flex-col divide-y divide-[var(--hairline)]">
            {tasks.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <Link href={`/tasks/${task.id}/edit`} className="text-[12.5px] text-[var(--cream)] hover:text-[var(--gold-light)]">
                    {task.title}
                  </Link>
                  <span className="text-[11px] text-[var(--muted)]">
                    {task.due_date ? `Due ${formatDate(task.due_date)}` : "No due date"}
                  </span>
                </div>
                {canEdit ? (
                  <TaskStatusSelect task={task} />
                ) : (
                  <Badge tone={TASK_STATUS_TONE[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>

      {canEdit ? (
        <DangerZone itemLabel="this project" confirmMessage={deleteConfirmMessage} deleteUrl={`/api/projects/${id}`} redirectUrl="/projects" />
      ) : null}
    </div>
  );
}
