"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/shared/ui/FormField";
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from "./labels";
import type { Task } from "./types";

/** Also updates the task's linked scope item (if any) on the build package it came from — see updateTask() in tasks/data.ts. */
export function TaskStatusSelect({ task }: { task: Task }) {
  const router = useRouter();
  const [value, setValue] = useState(task.status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TaskStatus;
    const previous = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          projectId: task.project_id,
          orgId: task.org_id,
          assignee: task.assignee,
          priority: task.priority,
          status: next,
          dueDate: task.due_date,
          notes: task.notes,
        }),
      });
      if (!res.ok) {
        setValue(previous);
        return;
      }
      router.refresh();
    } catch {
      setValue(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onChange={handleChange} disabled={saving} className="w-auto min-w-[130px] text-[11.5px]">
      {TASK_STATUSES.map((s) => (
        <option key={s} value={s}>
          {TASK_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
