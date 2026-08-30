import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { updateActionItem, deleteActionItem } from "@/modules/meetings/data";
import { ACTION_ITEM_STATUSES } from "@/modules/meetings/labels";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { itemId } = await params;
  const body = await request.json().catch(() => null);
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (!description) return NextResponse.json({ error: "Action item description is required." }, { status: 400 });

  const status = emptyToNull(body.status);
  if (!status || !ACTION_ITEM_STATUSES.includes(status as (typeof ACTION_ITEM_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    await updateActionItem(admin, itemId, { description, assignee: emptyToNull(body.assignee), dueDate: emptyToNull(body.dueDate), status });
    return NextResponse.json({ data: { id: itemId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the action item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { itemId } = await params;
  const admin = createAdminClient();
  try {
    await deleteActionItem(admin, itemId);
    return NextResponse.json({ data: { id: itemId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete the action item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
