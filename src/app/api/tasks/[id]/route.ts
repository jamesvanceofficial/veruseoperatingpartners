import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { updateTask, deleteTask } from "@/modules/tasks/data";
import { TASK_STATUSES } from "@/modules/tasks/labels";
import { PRIORITIES } from "@/modules/projects/labels";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });

  const status = emptyToNull(body.status);
  if (!status || !TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const priority = emptyToNull(body.priority);
  if (!priority || !PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    await updateTask(admin, id, {
      title,
      description: emptyToNull(body.description),
      projectId: emptyToNull(body.projectId),
      orgId: emptyToNull(body.orgId),
      assignee: emptyToNull(body.assignee),
      priority,
      status,
      dueDate: emptyToNull(body.dueDate),
      notes: emptyToNull(body.notes),
    });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the task.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await deleteTask(admin, id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete the task.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
