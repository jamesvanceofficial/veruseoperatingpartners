import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listStaffProfiles } from "@/modules/organizations/data";
import { getMeetingDetail, getMeetingDeletePreview } from "@/modules/meetings/data";
import { MEETING_TYPE_LABELS, MEETING_TYPE_TONE } from "@/modules/meetings/labels";
import { MeetingActionItemsPanel } from "@/modules/meetings/MeetingActionItemsPanel";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { LinkButton } from "@/shared/ui/LinkButton";
import { DangerZone } from "@/shared/ui/DangerZone";
import { formatDate, formatDateTime } from "@/shared/format";

function RecordSection({ label, content }: { label: string; content: string | null }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="section-label">{label}</p>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--cream)]">{content ?? "None recorded."}</p>
    </Card>
  );
}

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getMeetingDetail(supabase, id);
  if (!detail) notFound();

  const { meeting, orgName, relatedLabel, attendees, actionItems, createdByName } = detail;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const staffOptions = canEdit ? await listStaffProfiles(supabase) : [];

  let deleteConfirmMessage = "";
  if (canEdit) {
    const preview = await getMeetingDeletePreview(supabase, id);
    const lines = [`Delete "${meeting.title}"? This cannot be undone.`];
    lines.push("This will also permanently delete:");
    lines.push(`• ${preview.attendeeCount} attendee${preview.attendeeCount === 1 ? "" : "s"}`);
    lines.push(`• ${preview.actionItemCount} action item${preview.actionItemCount === 1 ? "" : "s"}`);
    lines.push("Any action items already converted to tasks will keep their tasks — only the link back to this meeting goes.");
    deleteConfirmMessage = lines.join("\n");
  }

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/meetings" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Meetings
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{meeting.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={MEETING_TYPE_TONE[meeting.meeting_type]}>{MEETING_TYPE_LABELS[meeting.meeting_type]}</Badge>
            {orgName ? (
              <Link href={`/organizations/${meeting.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
                {orgName}
              </Link>
            ) : (
              <span className="text-[12px] text-[var(--muted)]">Internal</span>
            )}
            <span className="text-[12px] text-[var(--muted)]">· {formatDateTime(meeting.scheduled_at)}</span>
            {relatedLabel ? <span className="text-[12px] text-[var(--muted)]">· {relatedLabel}</span> : null}
          </div>
        </div>
        {canEdit ? <LinkButton href={`/meetings/${id}/edit`}>Edit meeting</LinkButton> : null}
      </div>

      <Card className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="section-label">Attendees</p>
          <p className="text-[11.5px] text-[var(--muted)]">
            {createdByName ? `Logged by ${createdByName}` : null}
            {meeting.follow_up_date ? `${createdByName ? " · " : ""}Follow-up ${formatDate(meeting.follow_up_date)}` : ""}
          </p>
        </div>
        {attendees.length === 0 ? (
          <p className="text-[13px] text-[var(--muted)]">No attendees recorded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {attendees.map((a) => (
              <Badge key={a.id} tone={a.kind === "staff" ? "gold" : "neutral"}>
                {a.name}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <RecordSection label="Agenda" content={meeting.agenda} />
      <RecordSection label="Notes" content={meeting.notes} />
      <RecordSection label="Decisions" content={meeting.decisions} />

      <MeetingActionItemsPanel meetingId={id} initialItems={actionItems} staffOptions={staffOptions} canEdit={canEdit} />

      {canEdit ? (
        <DangerZone itemLabel="this meeting" confirmMessage={deleteConfirmMessage} deleteUrl={`/api/meetings/${id}`} redirectUrl="/meetings" />
      ) : null}
    </div>
  );
}
