"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { TASK_STATUSES, TASK_STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from "./labels";
import type { Task } from "./types";
import type { StaffOption, OrgOption } from "@/modules/organizations/types";

export function TaskForm({
  mode,
  task,
  orgOptions,
  lockedOrg,
  staffOptions,
  initialProjectOptions,
  defaultProjectId,
}: {
  mode: "create" | "edit";
  task?: Task;
  orgOptions: OrgOption[];
  lockedOrg?: { id: string; name: string };
  staffOptions: StaffOption[];
  initialProjectOptions: { id: string; name: string }[];
  /** Preselects the project dropdown on create (e.g. arriving from a project's own "Add task" button) — has no effect in edit mode, where the task's own project_id already drives the default. */
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState(lockedOrg?.id ?? task?.org_id ?? "");
  const [projectOptions, setProjectOptions] = useState(initialProjectOptions);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOrgChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newOrgId = e.target.value;
    setOrgId(newOrgId);
    if (!newOrgId) {
      setProjectOptions([]);
      return;
    }
    setLoadingProjects(true);
    try {
      const res = await fetch(`/api/organizations/${newOrgId}/projects`);
      const payload = await res.json().catch(() => ({ data: [] }));
      setProjectOptions(res.ok ? (payload.data ?? []) : []);
    } catch {
      setProjectOptions([]);
    } finally {
      setLoadingProjects(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      projectId: String(form.get("projectId") ?? ""),
      orgId: String(form.get("orgId") ?? ""),
      assignee: String(form.get("assignee") ?? ""),
      priority: String(form.get("priority") ?? ""),
      status: String(form.get("status") ?? ""),
      dueDate: String(form.get("dueDate") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    const url = mode === "create" ? "/api/tasks" : `/api/tasks/${task!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Task title" htmlFor="title">
            <Input id="title" name="title" required defaultValue={task?.title ?? ""} />
          </FormField>

          {lockedOrg ? (
            <FormField label="Organization" htmlFor="orgId_display">
              <Input id="orgId_display" value={lockedOrg.name} disabled />
              <input type="hidden" name="orgId" value={lockedOrg.id} />
            </FormField>
          ) : (
            <FormField label="Organization" htmlFor="orgId" hint="Optional — leave unset for a purely internal task.">
              <Select id="orgId" name="orgId" value={orgId} onChange={handleOrgChange}>
                <option value="">None (internal)</option>
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Project" htmlFor="projectId" hint={loadingProjects ? "Loading…" : undefined}>
            <Select key={orgId} id="projectId" name="projectId" defaultValue={task?.project_id ?? defaultProjectId ?? ""}>
              <option value="">None</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Assignee" htmlFor="assignee">
            <Select id="assignee" name="assignee" defaultValue={task?.assignee ?? ""}>
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name ?? s.email ?? "Unnamed"}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" required defaultValue={task?.priority ?? "medium"}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" required defaultValue={task?.status ?? "open"}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Due date" htmlFor="dueDate">
            <Input id="dueDate" name="dueDate" type="date" defaultValue={task?.due_date ?? ""} />
          </FormField>
        </div>

        <FormField label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={3} defaultValue={task?.description ?? ""} />
        </FormField>

        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} defaultValue={task?.notes ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          {mode === "create" ? "Create task" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
