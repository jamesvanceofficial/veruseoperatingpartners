import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { convertActionItemToTask } from "@/modules/meetings/data";

/** One click: description/assignee/due date carry straight over into a real task, linked back via meeting_action_items.linked_task_id. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { itemId } = await params;
  const admin = createAdminClient();
  const result = await convertActionItemToTask(admin, itemId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ data: { taskId: result.taskId } });
}
