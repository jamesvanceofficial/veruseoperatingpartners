import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getAssessmentByToken, completeAssessment } from "@/modules/assessments/data";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const assessment = await getAssessmentByToken(admin, token);
  if (!assessment) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });

  try {
    const result = await completeAssessment(admin, assessment.id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ data: { id: assessment.id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit the assessment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
