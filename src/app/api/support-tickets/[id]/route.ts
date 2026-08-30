import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { updateTicketFields, deleteTicket } from "@/modules/support/data";
import { TICKET_STATUSES, TICKET_PRIORITIES } from "@/modules/support/types";

/** Status, priority, and assignment changes are staff-only per the request — a client can submit and reply, never re-triage its own ticket. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const patch: Parameters<typeof updateTicketFields>[2] = {};
  if (body?.status !== undefined) {
    if (!TICKET_STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    patch.status = body.status;
  }
  if (body?.priority !== undefined) {
    if (!TICKET_PRIORITIES.includes(body.priority)) return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
    patch.priority = body.priority;
  }
  if (body?.assignedTo !== undefined) patch.assignedTo = emptyToNull(body.assignedTo);
  if (body?.resolutionNotes !== undefined) patch.resolutionNotes = emptyToNull(body.resolutionNotes);

  const admin = createAdminClient();
  try {
    await updateTicketFields(admin, id, patch);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update the ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await deleteTicket(admin, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete the ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
