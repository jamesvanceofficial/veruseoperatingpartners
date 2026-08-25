import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull, numberOrNull } from "@/shared/format";
import { PIPELINE_STAGES } from "@/modules/opportunities/labels";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Opportunity name is required." }, { status: 400 });

  const orgId = emptyToNull(body.org_id);
  if (!orgId) return NextResponse.json({ error: "Organization is required." }, { status: 400 });

  const stage = emptyToNull(body.stage) ?? "lead";
  if (!PIPELINE_STAGES.includes(stage as (typeof PIPELINE_STAGES)[number])) {
    return NextResponse.json({ error: "Invalid pipeline stage." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("opportunities")
    .insert({
      name,
      org_id: orgId,
      stage,
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
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the initial stage assignment — opportunity_stage_history is meant
  // to be the complete transition record, not just a log of later moves.
  const { error: historyError } = await admin
    .from("opportunity_stage_history")
    .insert({ opportunity_id: data.id, from_stage: null, to_stage: stage, changed_by: guard.userId });
  if (historyError) return NextResponse.json({ error: historyError.message }, { status: 500 });

  return NextResponse.json({ data });
}
