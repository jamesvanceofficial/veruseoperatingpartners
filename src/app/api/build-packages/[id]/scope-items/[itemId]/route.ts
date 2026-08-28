import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { updateScopeItemStatus } from "@/modules/buildPackages/data";
import { SCOPE_ITEM_STATUSES } from "@/modules/buildPackages/labels";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { itemId } = await params;
  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : "";
  if (!SCOPE_ITEM_STATUSES.includes(status as (typeof SCOPE_ITEM_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    await updateScopeItemStatus(admin, itemId, status);
    return NextResponse.json({ data: { id: itemId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update the scope item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
