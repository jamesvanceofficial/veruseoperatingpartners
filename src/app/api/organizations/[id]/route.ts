import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull, numberOrNull } from "@/shared/format";
import { ORG_TYPES, ORG_STATUSES } from "@/modules/organizations/labels";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
  if (!ORG_TYPES.includes(body.type)) return NextResponse.json({ error: "Invalid organization type." }, { status: 400 });
  if (!ORG_STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid organization status." }, { status: 400 });

  const referredByOrgId = emptyToNull(body.referred_by_org_id);
  if (referredByOrgId === id) {
    return NextResponse.json({ error: "An organization cannot be referred by itself." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizations")
    .update({
      name,
      type: body.type,
      status: body.status,
      industry: emptyToNull(body.industry),
      website: emptyToNull(body.website),
      phone: emptyToNull(body.phone),
      primary_address: emptyToNull(body.primary_address),
      employee_count_estimate: numberOrNull(body.employee_count_estimate),
      annual_revenue_estimate: numberOrNull(body.annual_revenue_estimate),
      source: emptyToNull(body.source),
      referred_by_org_id: referredByOrgId,
      assigned_owner: emptyToNull(body.assigned_owner),
      notes: emptyToNull(body.notes),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { id } });
}
