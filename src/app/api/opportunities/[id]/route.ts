import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull, numberOrNull } from "@/shared/format";
import { PIPELINE_STAGES } from "@/modules/opportunities/labels";
import { transitionStage } from "@/modules/opportunities/stageTransition";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("opportunities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { id } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Opportunity name is required." }, { status: 400 });

  const orgId = emptyToNull(body.org_id);
  if (!orgId) return NextResponse.json({ error: "Organization is required." }, { status: 400 });

  const stage = emptyToNull(body.stage);
  if (!stage || !PIPELINE_STAGES.includes(stage as (typeof PIPELINE_STAGES)[number])) {
    return NextResponse.json({ error: "Invalid pipeline stage." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: current, error: currentError } = await admin.from("opportunities").select("stage").eq("id", id).maybeSingle();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });

  const { error: updateError } = await admin
    .from("opportunities")
    .update({
      name,
      org_id: orgId,
      primary_contact_id: emptyToNull(body.primary_contact_id),
      owner: emptyToNull(body.owner),
      source: emptyToNull(body.source),
      expected_value: numberOrNull(body.expected_value),
      probability: numberOrNull(body.probability),
      pain_points: emptyToNull(body.pain_points),
      business_goals: emptyToNull(body.business_goals),
      next_action: emptyToNull(body.next_action),
      next_action_date: emptyToNull(body.next_action_date),
      notes: emptyToNull(body.notes),
      lost_reason: emptyToNull(body.lost_reason),
    })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  try {
    await transitionStage(admin, id, current.stage, stage, guard.userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record the stage change.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ data: { id } });
}
