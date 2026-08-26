import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { clearCarriedForwardAnswers } from "@/modules/assessments/data";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await clearCarriedForwardAnswers(admin, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to clear the carried-forward answers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
