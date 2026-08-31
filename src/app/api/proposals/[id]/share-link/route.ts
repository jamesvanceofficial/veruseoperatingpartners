import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { generateProposalShareLink } from "@/modules/proposals/data";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const expiresInDays = typeof body?.expiresInDays === "number" ? body.expiresInDays : 30;

  const admin = createAdminClient();
  try {
    const token = await generateProposalShareLink(admin, id, expiresInDays);
    return NextResponse.json({ data: { token } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate a share link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
