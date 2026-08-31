import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { createProposalFromAssessment } from "@/modules/proposals/data";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const assessmentId = typeof body?.assessmentId === "string" ? body.assessmentId : "";
  if (!assessmentId) return NextResponse.json({ error: "An assessment is required." }, { status: 400 });

  const admin = createAdminClient();
  try {
    const { id } = await createProposalFromAssessment(admin, assessmentId, guard.userId);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate the proposal.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
