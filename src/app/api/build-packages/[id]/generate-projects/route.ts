import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { generateProjectsFromBuildPackage } from "@/modules/projects/data";

/** The one action: each phase becomes a project, each scope item becomes a task inside it, phase week ranges carry across as dates where the build package has a start_date to anchor them. Nothing retyped. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();

  const result = await generateProjectsFromBuildPackage(admin, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ data: { projectIds: result.projectIds } });
}
