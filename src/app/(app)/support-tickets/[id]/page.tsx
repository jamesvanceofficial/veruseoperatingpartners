import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Stat } from "@/shared/ui/Stat";
import { DangerZone } from "@/shared/ui/DangerZone";
import { formatDateTime } from "@/shared/format";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getTicketDetail, getTicketDeletePreview, listStaffOptions } from "@/modules/support/data";
import { STATUS_LABELS, STATUS_TONE, PRIORITY_LABELS, PRIORITY_TONE } from "@/modules/support/labels";
import { SlaBadge } from "@/modules/support/SlaBadge";
import { TicketControls } from "@/modules/support/TicketControls";
import { TicketThread } from "@/modules/support/TicketThread";
import { TicketReplyForm } from "@/modules/support/TicketReplyForm";

export default async function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/support-tickets/${id}`);
  const profileResult = await getMyProfile(user.id);
  const staff = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const supabase = await createServerSupabase();
  const detail = await getTicketDetail(supabase, id);
  if (!detail) notFound();

  const staffOptions = staff ? await listStaffOptions(supabase) : [];
  const deletePreview = staff ? await getTicketDeletePreview(supabase, id) : null;

  const { ticket } = detail;

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div>
        <Link href="/support-tickets" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
          ← Support Tickets
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-[19px] font-semibold text-[var(--cream)]">{ticket.subject}</h1>
          <Badge tone={STATUS_TONE[ticket.status]}>{STATUS_LABELS[ticket.status]}</Badge>
          <Badge tone={PRIORITY_TONE[ticket.priority]}>{PRIORITY_LABELS[ticket.priority]}</Badge>
        </div>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">
          {detail.orgName}
          {detail.subscriptionPlanName ? ` · ${detail.subscriptionPlanName}` : ""} · opened {formatDateTime(ticket.opened_at)}
          {detail.openedByName ? ` by ${detail.openedByName}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Response Due" value={<SlaBadge responseDueAt={ticket.response_due_at} firstRespondedAt={ticket.first_responded_at} />} />
        <Stat label="Assigned To" value={detail.assignedToName ?? "Unassigned"} />
        <Stat label="First Response" value={ticket.first_responded_at ? formatDateTime(ticket.first_responded_at) : "—"} />
      </div>

      {ticket.description ? (
        <Card className="flex flex-col gap-2">
          <p className="section-label">Request</p>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--cream)]">{ticket.description}</p>
        </Card>
      ) : null}

      {staff ? (
        <Card strong className="flex flex-col gap-2">
          <p className="section-label">Manage</p>
          <TicketControls ticketId={ticket.id} status={ticket.status} priority={ticket.priority} assignedTo={ticket.assigned_to} staffOptions={staffOptions} />
        </Card>
      ) : null}

      <Card className="flex flex-col gap-4">
        <p className="section-label">Thread</p>
        <TicketThread replies={detail.replies} />
        <div className="border-t border-[var(--hairline)] pt-4">
          <TicketReplyForm ticketId={ticket.id} canLeaveInternalNotes={staff} />
        </div>
      </Card>

      {staff && deletePreview ? (
        <DangerZone
          itemLabel="this ticket"
          confirmMessage={`Delete "${deletePreview.subject}"? This also deletes its ${deletePreview.replyCount} ${deletePreview.replyCount === 1 ? "reply" : "replies"} (including any internal notes). This can't be undone.`}
          deleteUrl={`/api/support-tickets/${id}`}
          redirectUrl="/support-tickets"
        />
      ) : null}
    </div>
  );
}
