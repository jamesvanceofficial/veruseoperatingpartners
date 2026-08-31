import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getProposalByToken, recordProposalAcceptance } from "@/modules/proposals/data";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const proposal = await getProposalByToken(admin, token);
  if (!proposal) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  if (proposal.status === "accepted") return NextResponse.json({ error: "This proposal has already been accepted." }, { status: 400 });
  if (proposal.status === "declined") return NextResponse.json({ error: "This proposal was declined — contact us to get a new one." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const signedName = typeof body?.signedName === "string" ? body.signedName.trim() : "";
  const signedTitle = typeof body?.signedTitle === "string" ? body.signedTitle.trim() : "";
  if (!signedName) return NextResponse.json({ error: "A printed name is required to accept." }, { status: 400 });

  try {
    await recordProposalAcceptance(admin, proposal.id, { signedName, signedTitle });
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record acceptance.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
