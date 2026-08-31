import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { emptyToNull, numberOrNull } from "@/shared/format";
import { createSubscriptionFromBuildPackage, createSubscription } from "@/modules/subscriptions/data";
import { SUBSCRIPTION_STATUSES } from "@/modules/subscriptions/types";
import { SUPPORT_TIERS } from "@/modules/assessments/buildTiers";

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const admin = createAdminClient();

  // One-click path from a build package — everything else is derived.
  if (typeof body?.buildPackageId === "string" && body.buildPackageId) {
    try {
      const { id } = await createSubscriptionFromBuildPackage(admin, body.buildPackageId);
      return NextResponse.json({ data: { id } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create the subscription.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  // Manual path.
  const orgId = emptyToNull(body?.orgId);
  if (!orgId) return NextResponse.json({ error: "An organization is required." }, { status: 400 });
  const planName = typeof body?.planName === "string" ? body.planName.trim() : "";
  if (!planName) return NextResponse.json({ error: "A plan name is required." }, { status: 400 });
  const startDate = emptyToNull(body?.startDate);
  if (!startDate) return NextResponse.json({ error: "A start date is required." }, { status: 400 });
  const status = SUBSCRIPTION_STATUSES.includes(body?.status) ? body.status : "active";
  const supportTier = SUPPORT_TIERS.includes(body?.supportTier) ? body.supportTier : null;

  try {
    const { id } = await createSubscription(admin, {
      orgId,
      planName,
      supportTier,
      status,
      seats: numberOrNull(body?.seats),
      startDate,
      renewalDate: emptyToNull(body?.renewalDate),
      firstBillingDate: emptyToNull(body?.firstBillingDate),
      billingNotes: emptyToNull(body?.billingNotes),
    });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create the subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
