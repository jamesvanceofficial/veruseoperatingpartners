import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { createAdminClient } from "@/shared/supabase/admin";
import { attachStripeSubscriptionToOrg } from "@/modules/stripe/data";

/** Attach a synced Stripe subscription to a COMPASS organization by hand. Staff only. Writes only to COMPASS, never to Stripe. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const orgId = typeof body?.orgId === "string" && body.orgId ? body.orgId : null;
  if (!orgId) return NextResponse.json({ error: "Pick an organization to attach this subscription to." }, { status: 400 });

  try {
    await attachStripeSubscriptionToOrg(createAdminClient(), id, orgId, guard.userId);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not attach the subscription.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
