import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getAssessmentByToken, clearCarriedForwardAnswers } from "@/modules/assessments/data";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const assessment = await getAssessmentByToken(admin, token);
  if (!assessment) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  if (assessment.status === "completed") {
    return NextResponse.json({ error: "This assessment has already been submitted." }, { status: 400 });
  }

  try {
    await clearCarriedForwardAnswers(admin, assessment.id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to clear the carried-forward answers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
