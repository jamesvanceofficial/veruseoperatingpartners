"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/shared/ui/FormField";
import { TICKET_STATUSES, TICKET_PRIORITIES, type TicketStatus, type TicketPriority } from "./types";
import { STATUS_LABELS, PRIORITY_LABELS } from "./labels";

async function patch(id: string, body: Record<string, unknown>): Promise<boolean> {
  const res = await fetch(`/api/support-tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

/** Staff-only status/priority/assignment controls — each select PATCHes immediately, same convention as TaskStatusSelect. */
export function TicketControls({
  ticketId,
  status,
  priority,
  assignedTo,
  staffOptions,
}: {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  staffOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [statusValue, setStatusValue] = useState(status);
  const [priorityValue, setPriorityValue] = useState(priority);
  const [assignedValue, setAssignedValue] = useState(assignedTo ?? "");
  const [saving, setSaving] = useState(false);

  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TicketStatus;
    const previous = statusValue;
    setStatusValue(next);
    setSaving(true);
    const ok = await patch(ticketId, { status: next });
    if (!ok) setStatusValue(previous);
    setSaving(false);
    router.refresh();
  }

  async function handlePriority(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TicketPriority;
    const previous = priorityValue;
    setPriorityValue(next);
    setSaving(true);
    const ok = await patch(ticketId, { priority: next });
    if (!ok) setPriorityValue(previous);
    setSaving(false);
    router.refresh();
  }

  async function handleAssigned(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const previous = assignedValue;
    setAssignedValue(next);
    setSaving(true);
    const ok = await patch(ticketId, { assignedTo: next || null });
    if (!ok) setAssignedValue(previous);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <span className="section-label">Status</span>
        <Select value={statusValue} onChange={handleStatus} disabled={saving}>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="section-label">Priority</span>
        <Select value={priorityValue} onChange={handlePriority} disabled={saving}>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="section-label">Assigned To</span>
        <Select value={assignedValue} onChange={handleAssigned} disabled={saving}>
          <option value="">Unassigned</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
