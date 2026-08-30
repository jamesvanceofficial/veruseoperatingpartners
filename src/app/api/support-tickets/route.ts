import { NextResponse } from "next/server";
import { requireSession } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { isVerusStaff } from "@/shared/roles";
import { emptyToNull } from "@/shared/format";
import { createTicket } from "@/modules/support/data";
import { TICKET_PRIORITIES } from "@/modules/support/types";
import { notifyNewSupportTicket } from "@/modules/support/notify";

export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  if (!subject) return NextResponse.json({ error: "A subject is required." }, { status: 400 });

  const priority = TICKET_PRIORITIES.includes(body?.priority) ? body.priority : "medium";
  const staff = isVerusStaff(guard.profile.role);

  // A client can only ever open a ticket for their own org — never trust
  // a client-supplied orgId, since this write goes through the admin
  // client (bypasses RLS) once past this guard. Staff picks the org.
  let orgId: string | null;
  if (staff) {
    orgId = emptyToNull(body?.orgId);
    if (!orgId) return NextResponse.json({ error: "An organization is required." }, { status: 400 });
  } else {
    orgId = guard.profile.org_id;
    if (!orgId) return NextResponse.json({ error: "Your account isn't linked to an organization." }, { status: 403 });
  }

  const admin = createAdminClient();
  try {
    const { id, orgName } = await createTicket(admin, {
      orgId,
      subject,
      description: emptyToNull(body?.description),
      priority,
      openedBy: guard.userId,
    });

    const origin = new URL(request.url).origin;
    await notifyNewSupportTicket({
      orgName,
      subject,
      priority,
      description: emptyToNull(body?.description),
      ticketUrl: `${origin}/support-tickets/${id}`,
    });

    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create the ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
