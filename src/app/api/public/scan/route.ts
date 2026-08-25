import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getQuestionsForType, submitQuickScan } from "@/modules/assessments/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  const companyName = typeof body?.company_name === "string" ? body.company_name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!fullName || !companyName) {
    return NextResponse.json({ error: "Name and company name are required." }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const rawAnswers: unknown[] = Array.isArray(body?.answers) ? body.answers : [];
  const answers: { questionId: string; value: number }[] = rawAnswers
    .map((a: unknown) => (a && typeof a === "object" ? (a as Record<string, unknown>) : null))
    .filter((a: Record<string, unknown> | null): a is Record<string, unknown> => a !== null)
    .map((a: Record<string, unknown>) => ({ questionId: String(a.question_id ?? ""), value: Number(a.value) }));

  const admin = createAdminClient();
  const quickScanQuestions = await getQuestionsForType(admin, "quick_scan");
  const validIds = new Set(quickScanQuestions.map((q) => q.id));

  if (
    answers.length !== quickScanQuestions.length ||
    answers.some((a: { questionId: string; value: number }) => !validIds.has(a.questionId) || !Number.isInteger(a.value) || a.value < 0 || a.value > 3)
  ) {
    return NextResponse.json({ error: "All questions must be answered." }, { status: 400 });
  }

  try {
    const result = await submitQuickScan(admin, {
      fullName,
      email,
      phone: typeof body?.phone === "string" ? body.phone.trim() : "",
      companyName,
      industry: typeof body?.industry === "string" ? body.industry.trim() : "",
      revenueRange: typeof body?.revenue_range === "string" ? body.revenue_range.trim() : "",
      answers,
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong submitting your scan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
