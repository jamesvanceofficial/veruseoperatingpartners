import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getAssessmentByToken } from "@/modules/assessments/data";
import {
  saveFinancialProfile,
  saveBusinessPresence,
  saveWorkforce,
  parseFinancialProfileBody,
  parseBusinessPresenceBody,
  parseWorkforceBody,
} from "@/modules/assessments/profileData";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const assessment = await getAssessmentByToken(admin, token);
  if (!assessment) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  if (assessment.status === "completed") {
    return NextResponse.json({ error: "This assessment has already been submitted." }, { status: 400 });
  }
  if (assessment.assessment_type !== "full") {
    return NextResponse.json({ error: "The business profile is only captured on a Full Assessment." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  try {
    await Promise.all([
      saveFinancialProfile(admin, assessment.id, parseFinancialProfileBody(body?.financial)),
      saveBusinessPresence(admin, assessment.id, parseBusinessPresenceBody(body?.presence)),
      saveWorkforce(admin, assessment.id, parseWorkforceBody(body?.workforce)),
    ]);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the business profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
