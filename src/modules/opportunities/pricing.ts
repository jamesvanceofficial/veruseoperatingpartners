// The one place VERUS pricing language lives — every screen that talks
// about deal value quotes this, so the numbers can never drift out of
// sync with each other. Never call the subscription a "Compass
// subscription" — COMPASS is the internal tool, not the product being
// sold; the product is the Software Systems & Support Subscription.
export const VERUS_PRICING = {
  assessment: "Business Assessment $2,500",
  buildPackage: "Build Package $15,000–$30,000",
  subscription: "Software Systems & Support Subscription $350+/month",
} as const;

export const PRICING_HINT = `VERUS pricing — ${VERUS_PRICING.assessment} · ${VERUS_PRICING.buildPackage} · ${VERUS_PRICING.subscription}`;
