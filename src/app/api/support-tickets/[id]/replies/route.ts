import { NextResponse } from "next/server";
import { requireSession } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { isVerusStaff } from "@/shared/roles";
import { addReply } from "@/modules/support/data";
import { notifyClientOfReply } from "@/modules/support/notify";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "A reply can't be empty." }, { status: 400 });

  const staff = isVerusStaff(guard.profile.role);
  const isInternal = body?.isInternal === true;
  if (isInternal && !staff) {
    return NextResponse.json({ error: "Only staff can leave internal notes." }, { status: 403 });
  }

  const admin = createAdminClient();

  // The insert goes through the admin client (bypasses RLS), so a
  // client caller's own-org check has to happen here, not rely on RLS —
  // unlike a plain read, which the request-scoped client already scopes.
  const { data: ticket, error: ticketError } = await admin.from("support_tickets").select("org_id, opened_by").eq("id", id).maybeSingle();
  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  if (!staff && ticket.org_id !== guard.profile.org_id) {
    return NextResponse.json({ error: "You can only reply to your own organization's tickets." }, { status: 403 });
  }

  try {
    await addReply(admin, id, { body: text, author: guard.userId, isInternal, isStaffReply: staff });

    if (staff && !isInternal && ticket.opened_by) {
      const { data: openerProfile } = await admin.from("profiles").select("email").eq("id", ticket.opened_by).maybeSingle();
      const [orgResult, ticketSubjectResult] = await Promise.all([
        admin.from("organizations").select("name").eq("id", ticket.org_id).maybeSingle(),
        admin.from("support_tickets").select("subject").eq("id", id).maybeSingle(),
      ]);
      if (openerProfile?.email) {
        const origin = new URL(request.url).origin;
        await notifyClientOfReply({
          clientEmail: openerProfile.email,
          orgName: (orgResult.data?.name as string | undefined) ?? "your organization",
          subject: (ticketSubjectResult.data?.subject as string | undefined) ?? "your support ticket",
          replyBody: text,
          ticketUrl: `${origin}/support-tickets/${id}`,
        });
      }
    }

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the reply.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
