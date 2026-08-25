import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { saveAnswer } from "@/modules/assessments/data";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const questionId = typeof body?.question_id === "string" ? body.question_id : null;
  const value = Number(body?.value);
  if (!questionId || !Number.isInteger(value) || value < 0 || value > 3) {
    return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const live = await saveAnswer(admin, id, questionId, value);
    return NextResponse.json({ data: live });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save that answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
