import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { createAssessment } from "@/modules/assessments/data";
import { ASSESSMENT_TYPES } from "@/modules/assessments/labels";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const orgId = emptyToNull(body?.org_id);
  if (!orgId) return NextResponse.json({ error: "Organization is required." }, { status: 400 });

  const assessmentType = body?.assessment_type;
  if (!ASSESSMENT_TYPES.includes(assessmentType)) {
    return NextResponse.json({ error: "Invalid assessment type." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const id = await createAssessment(admin, {
      orgId,
      assessmentType,
      opportunityId: emptyToNull(body.opportunity_id),
      conductedBy: guard.userId,
    });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create the assessment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
