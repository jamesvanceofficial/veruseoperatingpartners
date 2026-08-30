"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select } from "@/shared/ui/FormField";
import { formatDate } from "@/shared/format";
import { ACTION_ITEM_STATUSES, ACTION_ITEM_STATUS_LABELS, ACTION_ITEM_STATUS_TONE } from "./labels";
import type { MeetingActionItem } from "./types";
import type { StaffOption } from "@/modules/organizations/types";

type ActionItemWithName = MeetingActionItem & { assigneeName: string | null };

export function MeetingActionItemsPanel({
  meetingId,
  initialItems,
  staffOptions,
  canEdit,
}: {
  meetingId: string;
  initialItems: ActionItemWithName[];
  staffOptions: StaffOption[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!description.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, assignee, dueDate, status: "open" }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not add the action item.");
        return;
      }
      setDescription("");
      setAssignee("");
      setDueDate("");
      router.refresh();
    } catch {
      setError("Could not add the action item — check your connection.");
    } finally {
      setAdding(false);
    }
  }

  async function handleStatusChange(item: ActionItemWithName, status: string) {
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/action-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: item.description, assignee: item.assignee, dueDate: item.due_date, status }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not update the action item.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleConvert(itemId: string) {
    setBusyId(itemId);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/action-items/${itemId}/convert-to-task`, { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not convert this action item to a task.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(itemId: string) {
    if (!window.confirm("Delete this action item? This cannot be undone.")) return;
    setBusyId(itemId);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/action-items/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not delete the action item.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="section-label">Action Items</p>
      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}

      {initialItems.length === 0 ? (
        <p className="text-[12.5px] text-[var(--muted)]">No action items yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--hairline)]">
          {initialItems.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12.5px] text-[var(--cream)]">{item.description}</span>
                <span className="text-[11px] text-[var(--muted)]">
                  {item.assigneeName ?? "Unassigned"}
                  {item.due_date ? ` · Due ${formatDate(item.due_date)}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canEdit ? (
                  <Select
                    value={item.status}
                    disabled={busyId === item.id}
                    onChange={(e) => handleStatusChange(item, e.target.value)}
                    className="w-auto min-w-[120px] text-[11.5px]"
                  >
                    {ACTION_ITEM_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ACTION_ITEM_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Badge tone={ACTION_ITEM_STATUS_TONE[item.status]}>{ACTION_ITEM_STATUS_LABELS[item.status]}</Badge>
                )}
                {item.linked_task_id ? (
                  <Link href={`/tasks/${item.linked_task_id}/edit`} className="text-[11.5px] text-[var(--gold-light)] hover:underline">
                    View task →
                  </Link>
                ) : canEdit ? (
                  <Button type="button" variant="secondary" loading={busyId === item.id} onClick={() => handleConvert(item.id)}>
                    Convert to task
                  </Button>
                ) : null}
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={busyId === item.id}
                    className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--red)]"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {canEdit ? (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 border-t border-[var(--hairline)] pt-4">
          <FormField label="New action item" htmlFor="new-action-description">
            <Input id="new-action-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="min-w-[220px]" />
          </FormField>
          <FormField label="Assignee" htmlFor="new-action-assignee">
            <Select id="new-action-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="min-w-[160px]">
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name ?? s.email ?? "Unnamed"}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Due date" htmlFor="new-action-due">
            <Input id="new-action-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </FormField>
          <Button type="submit" variant="secondary" loading={adding} disabled={!description.trim()}>
            Add
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
