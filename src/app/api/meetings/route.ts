import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createMeeting } from "@/modules/meetings/data";
import { MEETING_TYPES } from "@/modules/meetings/labels";
import type { AttendeeInput } from "@/modules/meetings/types";

function parseAttendees(body: unknown): AttendeeInput[] {
  if (!Array.isArray(body)) return [];
  return body
    .filter((a): a is { kind: string; value: string } => a && typeof a.kind === "string" && typeof a.value === "string")
    .filter((a) => a.kind === "contact" || a.kind === "staff" || a.kind === "guest")
    .map((a) => ({ kind: a.kind as AttendeeInput["kind"], value: a.value }));
}

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Meeting title is required." }, { status: 400 });

  const meetingType = emptyToNull(body.meetingType);
  if (!meetingType || !MEETING_TYPES.includes(meetingType as (typeof MEETING_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid meeting type." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const id = await createMeeting(
      admin,
      {
        orgId: emptyToNull(body.orgId),
        opportunityId: emptyToNull(body.opportunityId),
        buildPackageId: emptyToNull(body.buildPackageId),
        projectId: emptyToNull(body.projectId),
        title,
        meetingType,
        scheduledAt: emptyToNull(body.scheduledAt),
        agenda: emptyToNull(body.agenda),
        notes: emptyToNull(body.notes),
        decisions: emptyToNull(body.decisions),
        followUpDate: emptyToNull(body.followUpDate),
        attendees: parseAttendees(body.attendees),
      },
      guard.userId
    );
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create the meeting.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
