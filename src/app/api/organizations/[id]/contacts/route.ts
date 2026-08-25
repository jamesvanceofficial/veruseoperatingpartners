import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { emptyToNull } from "@/shared/format";
import { CONTACT_ROLES, type ContactRole } from "@/modules/organizations/labels";

/** Powers the opportunity form's org-dependent contact dropdown. RLS-scoped read via the request-scoped client — no staff guard needed, same as any other page fetch. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: orgId } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("contacts").select("id, full_name").eq("org_id", orgId).order("full_name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id: orgId } = await params;
  const body = await request.json().catch(() => null);
  const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  if (!fullName) return NextResponse.json({ error: "Contact name is required." }, { status: 400 });

  const contactRole = emptyToNull(body.contact_role);
  if (contactRole && !CONTACT_ROLES.includes(contactRole as ContactRole)) {
    return NextResponse.json({ error: "Invalid contact role." }, { status: 400 });
  }

  const admin = createAdminClient();
  const isPrimary = body.is_primary === true;

  const { data, error } = await admin
    .from("contacts")
    .insert({
      org_id: orgId,
      full_name: fullName,
      title: emptyToNull(body.title),
      contact_role: contactRole,
      email: emptyToNull(body.email),
      phone: emptyToNull(body.phone),
      is_primary: isPrimary,
      notes: emptyToNull(body.notes),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Only one contact per org may be primary — app-layer enforcement (see
  // Stage 5 notes: no DB constraint for this, mutual exclusivity lives here).
  if (isPrimary) {
    await admin.from("contacts").update({ is_primary: false }).eq("org_id", orgId).neq("id", data.id);
  }

  return NextResponse.json({ data });
}
