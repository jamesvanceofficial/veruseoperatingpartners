"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { MEETING_TYPES, MEETING_TYPE_LABELS, RELATED_RECORD_TYPES, RELATED_RECORD_TYPE_LABELS, type RelatedRecordType, type AttendeeKind } from "./labels";
import { toDatetimeLocalValue } from "@/shared/format";
import type { Meeting, AttendeeInput } from "./types";
import type { StaffOption, OrgOption } from "@/modules/organizations/types";
import type { ContactOption } from "@/modules/opportunities/types";

type AttendeeRow = AttendeeInput & { key: string };
let rowKeySeq = 0;
function newRowKey() {
  rowKeySeq += 1;
  return `row-${rowKeySeq}`;
}

function initialRelatedType(meeting?: Meeting): RelatedRecordType | "" {
  if (!meeting) return "";
  if (meeting.opportunity_id) return "opportunity";
  if (meeting.build_package_id) return "build_package";
  if (meeting.project_id) return "project";
  return "";
}

function initialRelatedId(meeting?: Meeting): string {
  if (!meeting) return "";
  return meeting.opportunity_id ?? meeting.build_package_id ?? meeting.project_id ?? "";
}

export function MeetingForm({
  mode,
  meeting,
  initialAttendees,
  orgOptions,
  lockedOrg,
  staffOptions,
  initialContactOptions,
  initialRelatedOptions,
}: {
  mode: "create" | "edit";
  meeting?: Meeting;
  initialAttendees: AttendeeInput[];
  orgOptions: OrgOption[];
  lockedOrg?: { id: string; name: string };
  staffOptions: StaffOption[];
  initialContactOptions: ContactOption[];
  initialRelatedOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState(lockedOrg?.id ?? meeting?.org_id ?? "");
  const [contactOptions, setContactOptions] = useState<ContactOption[]>(initialContactOptions);
  const [relatedType, setRelatedType] = useState<RelatedRecordType | "">(initialRelatedType(meeting));
  const [relatedId, setRelatedId] = useState(initialRelatedId(meeting));
  const [relatedOptions, setRelatedOptions] = useState(initialRelatedOptions);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeRow[]>(
    initialAttendees.length > 0 ? initialAttendees.map((a) => ({ ...a, key: newRowKey() })) : [{ key: newRowKey(), kind: "guest", value: "" }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRelatedOptions(type: RelatedRecordType | "", forOrgId: string) {
    if (!type || !forOrgId) {
      setRelatedOptions([]);
      return;
    }
    setLoadingChildren(true);
    try {
      const endpoint =
        type === "opportunity"
          ? `/api/organizations/${forOrgId}/opportunities`
          : type === "build_package"
            ? `/api/organizations/${forOrgId}/build-packages`
            : `/api/organizations/${forOrgId}/projects`;
      const res = await fetch(endpoint);
      const payload = await res.json().catch(() => ({ data: [] }));
      const rows: { id: string; name?: string; label?: string }[] = res.ok ? (payload.data ?? []) : [];
      setRelatedOptions(rows.map((r) => ({ id: r.id, label: r.label ?? r.name ?? "" })));
    } catch {
      setRelatedOptions([]);
    } finally {
      setLoadingChildren(false);
    }
  }

  async function handleOrgChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newOrgId = e.target.value;
    setOrgId(newOrgId);
    setRelatedType("");
    setRelatedId("");
    setRelatedOptions([]);
    if (!newOrgId) {
      setContactOptions([]);
      return;
    }
    try {
      const res = await fetch(`/api/organizations/${newOrgId}/contacts`);
      const payload = await res.json().catch(() => ({ data: [] }));
      setContactOptions(res.ok ? (payload.data ?? []) : []);
    } catch {
      setContactOptions([]);
    }
  }

  async function handleRelatedTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value as RelatedRecordType | "";
    setRelatedType(type);
    setRelatedId("");
    await loadRelatedOptions(type, orgId);
  }

  function updateAttendee(key: string, patch: Partial<AttendeeRow>) {
    setAttendees((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addAttendee() {
    setAttendees((rows) => [...rows, { key: newRowKey(), kind: "guest", value: "" }]);
  }

  function removeAttendee(key: string) {
    setAttendees((rows) => rows.filter((r) => r.key !== key));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const scheduledAtLocal = String(form.get("scheduledAt") ?? "");
    const body = {
      orgId: String(form.get("orgId") ?? ""),
      opportunityId: relatedType === "opportunity" ? relatedId : "",
      buildPackageId: relatedType === "build_package" ? relatedId : "",
      projectId: relatedType === "project" ? relatedId : "",
      title: String(form.get("title") ?? ""),
      meetingType: String(form.get("meetingType") ?? ""),
      scheduledAt: scheduledAtLocal ? new Date(scheduledAtLocal).toISOString() : "",
      agenda: String(form.get("agenda") ?? ""),
      notes: String(form.get("notes") ?? ""),
      decisions: String(form.get("decisions") ?? ""),
      followUpDate: String(form.get("followUpDate") ?? ""),
      attendees: attendees.filter((a) => a.value.trim().length > 0).map((a) => ({ kind: a.kind, value: a.value })),
    };

    const url = mode === "create" ? "/api/meetings" : `/api/meetings/${meeting!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      const id = mode === "create" ? payload.data.id : meeting!.id;
      router.push(`/meetings/${id}`);
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
          <FormField label="Meeting title" htmlFor="title">
            <Input id="title" name="title" required defaultValue={meeting?.title ?? ""} />
          </FormField>

          <FormField label="Meeting type" htmlFor="meetingType">
            <Select id="meetingType" name="meetingType" required defaultValue={meeting?.meeting_type ?? ""}>
              <option value="">Select a type…</option>
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEETING_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </FormField>

          {lockedOrg ? (
            <FormField label="Organization" htmlFor="orgId_display" hint="Optional — leave unset for a purely internal meeting.">
              <Input id="orgId_display" value={lockedOrg.name} disabled />
              <input type="hidden" name="orgId" value={lockedOrg.id} />
            </FormField>
          ) : (
            <FormField label="Organization" htmlFor="orgId" hint="Optional — leave unset for a purely internal meeting.">
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

          <FormField label="Date and time" htmlFor="scheduledAt">
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={toDatetimeLocalValue(meeting?.scheduled_at)} />
          </FormField>

          <FormField label="Related to" htmlFor="relatedType" hint="Optional — an opportunity, build package, or project this meeting is about.">
            <Select
              id="relatedType"
              value={relatedType}
              onChange={handleRelatedTypeChange}
              disabled={!orgId}
            >
              <option value="">None</option>
              {RELATED_RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {RELATED_RECORD_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={relatedType ? RELATED_RECORD_TYPE_LABELS[relatedType] : "Related record"} htmlFor="relatedId" hint={loadingChildren ? "Loading…" : undefined}>
            <Select id="relatedId" value={relatedId} onChange={(e) => setRelatedId(e.target.value)} disabled={!relatedType}>
              <option value="">Select…</option>
              {relatedOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Follow-up date" htmlFor="followUpDate">
            <Input id="followUpDate" name="followUpDate" type="date" defaultValue={meeting?.follow_up_date ?? ""} />
          </FormField>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="section-label">Attendees</p>
        <div className="flex flex-col gap-2">
          {attendees.map((row) => (
            <div key={row.key} className="flex flex-wrap items-center gap-2">
              <Select
                value={row.kind}
                onChange={(e) => updateAttendee(row.key, { kind: e.target.value as AttendeeKind, value: "" })}
                className="w-auto min-w-[110px]"
              >
                <option value="contact">Contact</option>
                <option value="staff">Staff</option>
                <option value="guest">Guest</option>
              </Select>
              {row.kind === "contact" ? (
                <Select value={row.value} onChange={(e) => updateAttendee(row.key, { value: e.target.value })} className="min-w-[200px] flex-1">
                  <option value="">Select a contact…</option>
                  {contactOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </Select>
              ) : row.kind === "staff" ? (
                <Select value={row.value} onChange={(e) => updateAttendee(row.key, { value: e.target.value })} className="min-w-[200px] flex-1">
                  <option value="">Select a staff member…</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name ?? s.email ?? "Unnamed"}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={row.value}
                  onChange={(e) => updateAttendee(row.key, { value: e.target.value })}
                  placeholder="Guest name"
                  className="min-w-[200px] flex-1"
                />
              )}
              <button
                type="button"
                onClick={() => removeAttendee(row.key)}
                className="text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--red)]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={addAttendee} className="self-start">
          Add attendee
        </Button>
      </Card>

      <Card className="flex flex-col gap-4">
        <FormField label="Agenda" htmlFor="agenda">
          <Textarea id="agenda" name="agenda" rows={4} defaultValue={meeting?.agenda ?? ""} />
        </FormField>
        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={5} defaultValue={meeting?.notes ?? ""} />
        </FormField>
        <FormField label="Decisions" htmlFor="decisions">
          <Textarea id="decisions" name="decisions" rows={4} defaultValue={meeting?.decisions ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          {mode === "create" ? "Create meeting" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
