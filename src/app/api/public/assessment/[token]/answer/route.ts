import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getAssessmentByToken, saveAnswer } from "@/modules/assessments/data";

/**
 * Public, unauthenticated. The token is the only credential — it's
 * resolved to exactly one assessment id here, and that id (never
 * anything from the request body) is what every subsequent query uses.
 * A bad/expired/revoked token gets the same 404 a nonexistent one would,
 * so a guess can't distinguish "wrong" from "expired."
 */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const assessment = await getAssessmentByToken(admin, token);
  if (!assessment) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  if (assessment.status === "completed") {
    return NextResponse.json({ error: "This assessment has already been submitted." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const questionId = typeof body?.question_id === "string" ? body.question_id : null;
  const value = Number(body?.value);
  if (!questionId || !Number.isInteger(value) || value < 0 || value > 3) {
    return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  }

  try {
    const live = await saveAnswer(admin, assessment.id, questionId, value);
    return NextResponse.json({ data: live });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save that answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
