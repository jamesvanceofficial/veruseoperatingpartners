import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createProject } from "@/modules/projects/data";
import { PROJECT_STATUSES, PRIORITIES } from "@/modules/projects/labels";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Project name is required." }, { status: 400 });

  const orgId = emptyToNull(body.orgId);
  if (!orgId) return NextResponse.json({ error: "Organization is required." }, { status: 400 });

  const status = emptyToNull(body.status) ?? "not_started";
  if (!PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const priority = emptyToNull(body.priority) ?? "medium";
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const id = await createProject(admin, {
      name,
      description: emptyToNull(body.description),
      orgId,
      buildPackageId: emptyToNull(body.buildPackageId),
      buildPackagePhaseId: emptyToNull(body.buildPackagePhaseId),
      categoryId: emptyToNull(body.categoryId),
      owner: emptyToNull(body.owner),
      priority,
      status,
      startDate: emptyToNull(body.startDate),
      dueDate: emptyToNull(body.dueDate),
    });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create the project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
