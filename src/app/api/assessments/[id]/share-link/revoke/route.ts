import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { revokeShareLink } from "@/modules/assessments/data";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await revokeShareLink(admin, id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to revoke the share link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
