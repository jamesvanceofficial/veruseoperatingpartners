import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { CONTACT_ROLES, type ContactRole } from "@/modules/organizations/labels";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; contactId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id: orgId, contactId } = await params;
  const body = await request.json().catch(() => null);
  const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  if (!fullName) return NextResponse.json({ error: "Contact name is required." }, { status: 400 });

  const contactRole = emptyToNull(body.contact_role);
  if (contactRole && !CONTACT_ROLES.includes(contactRole as ContactRole)) {
    return NextResponse.json({ error: "Invalid contact role." }, { status: 400 });
  }

  const admin = createAdminClient();
  const isPrimary = body.is_primary === true;

  const { error } = await admin
    .from("contacts")
    .update({
      full_name: fullName,
      title: emptyToNull(body.title),
      contact_role: contactRole,
      email: emptyToNull(body.email),
      phone: emptyToNull(body.phone),
      is_primary: isPrimary,
      notes: emptyToNull(body.notes),
    })
    .eq("id", contactId)
    .eq("org_id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isPrimary) {
    await admin.from("contacts").update({ is_primary: false }).eq("org_id", orgId).neq("id", contactId);
  }

  return NextResponse.json({ data: { id: contactId } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; contactId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id: orgId, contactId } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("contacts").delete().eq("id", contactId).eq("org_id", orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { id: contactId } });
}
