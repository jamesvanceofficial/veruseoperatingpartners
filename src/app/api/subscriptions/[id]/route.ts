import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull, numberOrNull } from "@/shared/format";
import { updateSubscription, deleteSubscription } from "@/modules/subscriptions/data";
import { SUBSCRIPTION_STATUSES } from "@/modules/subscriptions/types";
import { SUPPORT_TIERS } from "@/modules/assessments/buildTiers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const patch: Parameters<typeof updateSubscription>[2] = {};
  if (body?.planName !== undefined) patch.planName = String(body.planName).trim();
  if (body?.supportTier !== undefined) patch.supportTier = SUPPORT_TIERS.includes(body.supportTier) ? body.supportTier : null;
  if (body?.status !== undefined) {
    if (!SUBSCRIPTION_STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    patch.status = body.status;
  }
  if (body?.seats !== undefined) patch.seats = numberOrNull(body.seats);
  if (body?.startDate !== undefined) patch.startDate = body.startDate;
  if (body?.renewalDate !== undefined) patch.renewalDate = emptyToNull(body.renewalDate);
  if (body?.firstBillingDate !== undefined) patch.firstBillingDate = emptyToNull(body.firstBillingDate);
  if (body?.billingNotes !== undefined) patch.billingNotes = emptyToNull(body.billingNotes);

  const admin = createAdminClient();
  try {
    await updateSubscription(admin, id, patch);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update the subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const admin = createAdminClient();
  try {
    await deleteSubscription(admin, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete the subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
