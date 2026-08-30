import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createActionItem } from "@/modules/meetings/data";
import { ACTION_ITEM_STATUSES } from "@/modules/meetings/labels";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (!description) return NextResponse.json({ error: "Action item description is required." }, { status: 400 });

  const status = emptyToNull(body.status) ?? "open";
  if (!ACTION_ITEM_STATUSES.includes(status as (typeof ACTION_ITEM_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const actionItemId = await createActionItem(admin, id, {
      description,
      assignee: emptyToNull(body.assignee),
      dueDate: emptyToNull(body.dueDate),
      status,
    });
    return NextResponse.json({ data: { id: actionItemId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create the action item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
