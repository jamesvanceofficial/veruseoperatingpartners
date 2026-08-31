import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { updateLineItem, deleteLineItem } from "@/modules/subscriptions/data";
import { LINE_ITEM_TYPES, REVENUE_CATEGORIES } from "@/modules/subscriptions/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { itemId } = await params;
  const body = await request.json().catch(() => null);

  const patch: Parameters<typeof updateLineItem>[2] = {};
  if (body?.itemType !== undefined && LINE_ITEM_TYPES.includes(body.itemType)) patch.itemType = body.itemType;
  if (body?.description !== undefined) patch.description = String(body.description).trim();
  if (body?.monthlyPrice !== undefined) patch.monthlyPrice = Number(body.monthlyPrice);
  if (body?.quantity !== undefined) patch.quantity = Number(body.quantity);
  if (body?.revenueCategory !== undefined && REVENUE_CATEGORIES.includes(body.revenueCategory)) patch.revenueCategory = body.revenueCategory;
  if (body?.startDate !== undefined) patch.startDate = body.startDate;
  if (body?.endDate !== undefined) patch.endDate = emptyToNull(body.endDate);

  const admin = createAdminClient();
  try {
    await updateLineItem(admin, itemId, patch);
    return NextResponse.json({ data: { id: itemId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update the line item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { itemId } = await params;
  const admin = createAdminClient();
  try {
    await deleteLineItem(admin, itemId);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove the line item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
