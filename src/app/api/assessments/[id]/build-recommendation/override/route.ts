import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { setRecommendationOverride } from "@/modules/assessments/data";
import { BUILD_TIERS, SUPPORT_TIERS } from "@/modules/assessments/buildTiers";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const hasBuild = body && Object.prototype.hasOwnProperty.call(body, "build_tier_override");
  const hasSupport = body && Object.prototype.hasOwnProperty.call(body, "support_tier_override");
  if (!hasBuild && !hasSupport) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  if (hasBuild && body.build_tier_override !== null && !BUILD_TIERS.includes(body.build_tier_override)) {
    return NextResponse.json({ error: "Invalid build tier." }, { status: 400 });
  }
  if (hasSupport && body.support_tier_override !== null && !SUPPORT_TIERS.includes(body.support_tier_override)) {
    return NextResponse.json({ error: "Invalid support tier." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    await setRecommendationOverride(admin, id, {
      buildTierOverride: hasBuild ? body.build_tier_override : undefined,
      supportTierOverride: hasSupport ? body.support_tier_override : undefined,
      overriddenBy: guard.userId,
    });
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save the override.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
