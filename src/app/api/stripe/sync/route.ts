import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/apiGuards";
import { isStripeConfigured } from "@/modules/stripe/client";
import { runStripeSync } from "@/modules/stripe/sync";

/** On-demand Stripe sync (the "Sync now" button). Staff only. Read-only against Stripe. */
export async function POST() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe isn't connected — STRIPE_SECRET_KEY is not set on the server." }, { status: 503 });
  }

  try {
    const summary = await runStripeSync({ trigger: "manual", triggeredBy: guard.userId });
    return NextResponse.json({ data: summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe sync failed.";
    console.error("[stripe-sync] manual sync failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
