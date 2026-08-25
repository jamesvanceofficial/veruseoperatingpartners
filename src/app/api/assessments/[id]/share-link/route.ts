import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { generateShareLink } from "@/modules/assessments/data";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const expiresInDays = body?.expires_in_days === null ? null : Number(body?.expires_in_days) || 30;

  const admin = createAdminClient();
  try {
    const token = await generateShareLink(admin, id, expiresInDays);
    return NextResponse.json({ data: { token } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate a share link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
