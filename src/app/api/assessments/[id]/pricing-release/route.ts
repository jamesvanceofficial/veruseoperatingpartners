import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { setPricingReleased } from "@/modules/assessments/data";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.released !== "boolean") {
    return NextResponse.json({ error: "Missing or invalid 'released'." }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    await setPricingReleased(admin, id, { released: body.released, releasedBy: guard.userId });
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update pricing release.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
