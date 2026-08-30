import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createTask } from "@/modules/tasks/data";
import { TASK_STATUSES } from "@/modules/tasks/labels";
import { PRIORITIES } from "@/modules/projects/labels";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });

  const status = emptyToNull(body.status) ?? "open";
  if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const priority = emptyToNull(body.priority) ?? "medium";
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const id = await createTask(admin, {
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
    const message = err instanceof Error ? err.message : "Failed to create the task.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
