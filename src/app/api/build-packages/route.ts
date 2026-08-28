import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createBuildPackageFromAssessment, moveOpportunityToBuildPackageSold } from "@/modules/buildPackages/data";
import { getAssessmentById } from "@/modules/assessments/data";

/** The one creation path this stage builds: from a completed Full Assessment, one click, nothing retyped. */
export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const assessmentId = emptyToNull(body?.assessmentId);
  if (!assessmentId) return NextResponse.json({ error: "assessmentId is required." }, { status: 400 });

  const admin = createAdminClient();

  const result = await createBuildPackageFromAssessment(admin, assessmentId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const assessment = await getAssessmentById(admin, assessmentId);
  if (assessment?.opportunity_id) {
    await moveOpportunityToBuildPackageSold(admin, assessment.opportunity_id, guard.userId);
  }

  return NextResponse.json({ data: { id: result.id } });
}
