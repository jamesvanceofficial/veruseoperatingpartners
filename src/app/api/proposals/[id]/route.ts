import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull } from "@/shared/format";
import { updateProposal, deleteProposal } from "@/modules/proposals/data";
import { PROPOSAL_STATUSES, PAYMENT_TERMS } from "@/modules/proposals/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const patch: Parameters<typeof updateProposal>[2] = {};
  if (body?.companyName !== undefined) patch.companyName = String(body.companyName).trim();
  if (body?.proposalDate !== undefined) patch.proposalDate = body.proposalDate;
  if (body?.constraintsText !== undefined) patch.constraintsText = emptyToNull(body.constraintsText);
  if (body?.recommendationText !== undefined) patch.recommendationText = emptyToNull(body.recommendationText);
  if (body?.scopeOfWorkText !== undefined) patch.scopeOfWorkText = emptyToNull(body.scopeOfWorkText);
  if (body?.includedText !== undefined) patch.includedText = emptyToNull(body.includedText);
  if (body?.excludedText !== undefined) patch.excludedText = emptyToNull(body.excludedText);
  if (body?.timelineText !== undefined) patch.timelineText = emptyToNull(body.timelineText);
  if (body?.buildPrice !== undefined) patch.buildPrice = body.buildPrice === "" ? null : Number(body.buildPrice);
  if (body?.paymentTerms !== undefined && PAYMENT_TERMS.includes(body.paymentTerms)) patch.paymentTerms = body.paymentTerms;
  if (body?.supportPriceLabel !== undefined) patch.supportPriceLabel = emptyToNull(body.supportPriceLabel);
  if (body?.firstYearValue !== undefined) patch.firstYearValue = body.firstYearValue === "" ? null : Number(body.firstYearValue);
  if (body?.investmentNotes !== undefined) patch.investmentNotes = emptyToNull(body.investmentNotes);
  if (body?.verusResponsibilitiesText !== undefined) patch.verusResponsibilitiesText = emptyToNull(body.verusResponsibilitiesText);
  if (body?.clientResponsibilitiesText !== undefined) patch.clientResponsibilitiesText = emptyToNull(body.clientResponsibilitiesText);
  if (body?.nextStepsText !== undefined) patch.nextStepsText = emptyToNull(body.nextStepsText);
  if (body?.status !== undefined) {
    if (!PROPOSAL_STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    patch.status = body.status;
  }

  const admin = createAdminClient();
  try {
    await updateProposal(admin, id, patch);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update the proposal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await deleteProposal(admin, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete the proposal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
