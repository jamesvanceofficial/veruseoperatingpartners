import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { getProposalByToken, recordProposalDecline } from "@/modules/proposals/data";
import { emptyToNull } from "@/shared/format";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const proposal = await getProposalByToken(admin, token);
  if (!proposal) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  if (proposal.status === "accepted") return NextResponse.json({ error: "This proposal has already been accepted." }, { status: 400 });
  if (proposal.status === "declined") return NextResponse.json({ error: "This proposal was already declined." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const reason = emptyToNull(body?.reason);

  try {
    await recordProposalDecline(admin, proposal.id, reason);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record the decline.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
