import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { PIPELINE_STAGES } from "@/modules/opportunities/labels";
import { transitionStage } from "@/modules/opportunities/stageTransition";

/** Dedicated, minimal endpoint for the kanban board's drag-and-drop — moves one card, nothing else. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const stage = typeof body?.stage === "string" ? body.stage : "";
  if (!PIPELINE_STAGES.includes(stage as (typeof PIPELINE_STAGES)[number])) {
    return NextResponse.json({ error: "Invalid pipeline stage." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin.from("opportunities").select("stage").eq("id", id).maybeSingle();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });

  try {
    await transitionStage(admin, id, current.stage, stage, guard.userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to move the opportunity.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ data: { id, stage } });
}
