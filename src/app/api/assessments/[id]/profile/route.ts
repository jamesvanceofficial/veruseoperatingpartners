import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { getAssessmentById } from "@/modules/assessments/data";
import {
  saveFinancialProfile,
  saveBusinessPresence,
  saveWorkforce,
  parseFinancialProfileBody,
  parseBusinessPresenceBody,
  parseWorkforceBody,
} from "@/modules/assessments/profileData";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();

  const assessment = await getAssessmentById(admin, id);
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  if (assessment.assessment_type !== "full") {
    return NextResponse.json({ error: "The business profile is only captured on a Full Assessment." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  try {
    await Promise.all([
      saveFinancialProfile(admin, id, parseFinancialProfileBody(body?.financial)),
      saveBusinessPresence(admin, id, parseBusinessPresenceBody(body?.presence)),
      saveWorkforce(admin, id, parseWorkforceBody(body?.workforce)),
    ]);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the business profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
