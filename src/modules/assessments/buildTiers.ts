// Stage 8 — the four fixed build packages and five fixed support tiers.
// Included/excluded scope and pricing are locked properties of the TIER,
// not computed per-org, so they live here as static config rather than
// being stored per-assessment. What varies per-org is which tier gets
// recommended and why — see buildRecommendation.ts.
//
// Stage 14: the subscription is bundled with every build, not an optional
// add-on. The first STABILIZATION_PERIOD_DAYS after handover are covered
// by the build price; after that it bills monthly at the paired tier
// (DEFAULT_SUPPORT_TIER_FOR_BUILD), which can still be overridden
// independently of the build tier. That's why each BUILD_TIER_INFO's
// included list ends with a line naming its paired support tier and
// price — SUPPORT_TIER_INFO has to exist first so that line can be built
// from it, not typed out by hand and risk drifting from the real price.
//
// Stage 18: portals are deliberately NOT in any tier's included/excluded
// list here — whether a business needs one depends on its business
// model, not which tier it bought. Portal (and automation) scope is
// computed per-assessment from the business profile's operational-needs
// answers and injected at read time — see effectiveScope.ts, which is
// what every consumer of "the build's scope" (the internal recommendation
// panel, the client report) should call instead of reading
// BUILD_TIER_INFO[tier].included directly.

export const BUILD_TIERS = ["foundation", "growth", "enterprise", "custom"] as const;
export type BuildTier = (typeof BUILD_TIERS)[number];

export const SUPPORT_TIERS = ["base", "growth", "pro", "enterprise", "custom"] as const;
export type SupportTier = (typeof SUPPORT_TIERS)[number];

export const SUPPORT_SUBSCRIPTION_NAME = "Software, Systems & Support Subscription";

/** Days after build handover covered by the build price before the subscription starts billing. */
export const STABILIZATION_PERIOD_DAYS = 90;

export type SupportTierInfo = {
  label: string;
  price: number | null;
  priceLabel: string;
  included: string[];
  excluded: string[];
};

// Each tier's included scope is "everything in the tier below, plus its
// own additions" — built from these increments so the cumulative lists
// can't drift out of sync with each other. Concrete numbers throughout
// (seats, response times, change-request/hour blocks), not vague words —
// James can adjust the actual figures, but the panel should never show a
// number-shaped promise as a word. Exported (Stage 20) so the client
// report's tier-comparison ladder can show exactly what's new at each
// step, using this same content rather than restating it.
export const BASE_ITEMS = [
  "Hosting and uptime for their system",
  "Security updates and patching",
  "Daily data backups",
  "Up to 3 user seats",
  "Email support — 2 business day response",
  "Minor content and settings changes (up to 2 hours/month)",
  "Monthly system health check",
];
export const GROWTH_ITEMS = [
  "Up to 10 user seats",
  "Priority email support — next business day response",
  "5 change requests per month",
  "Dashboard and report adjustments",
  "Automation maintenance and fixes",
  "Quarterly system review",
];
export const PRO_ITEMS = [
  "Up to 25 user seats",
  "Phone and scheduled call support — same business day response",
  "12 change requests per month (up from 5)",
  "New automation builds, up to 5 hours/month",
  "Client portal access for their customers",
  "Monthly reporting review",
  "Integration maintenance",
];
export const ENTERPRISE_ITEMS = [
  "Unlimited user seats",
  "Dedicated support contact",
  "Same-day response",
  "10 development hours per month",
  "Multiple integrations maintained",
  "Advanced dashboards and reporting",
  "Quarterly strategic review",
];

export const SUPPORT_TIER_INFO: Record<SupportTier, SupportTierInfo> = {
  base: {
    label: "Base",
    price: 350,
    priceLabel: "$350/mo",
    included: BASE_ITEMS,
    excluded: ["New feature development", "New automations", "Additional modules", "Dashboard changes", "Priority response", "Phone support"],
  },
  growth: {
    label: "Growth",
    price: 750,
    priceLabel: "$750/mo",
    included: [...BASE_ITEMS, ...GROWTH_ITEMS],
    excluded: ["New modules", "Custom development", "A dedicated support line"],
  },
  pro: {
    label: "Pro",
    price: 1500,
    priceLabel: "$1,500/mo",
    included: [...BASE_ITEMS, ...GROWTH_ITEMS, ...PRO_ITEMS],
    excluded: ["Major new modules", "Unlimited development"],
  },
  enterprise: {
    label: "Enterprise",
    price: 2500,
    priceLabel: "$2,500+/mo",
    included: [...BASE_ITEMS, ...GROWTH_ITEMS, ...PRO_ITEMS, ...ENTERPRISE_ITEMS],
    excluded: ["Work beyond this scope — moves to Custom, quoted separately"],
  },
  custom: {
    label: "Custom",
    price: null,
    priceLabel: "Quoted",
    included: ["Scope defined per client"],
    excluded: ["No fixed inclusions or exclusions — scoped and quoted per engagement"],
  },
};

/** The default support tier bundled with each build tier — computeBuildRecommendation() starts every recommendation here, then may bump it up one tier for scale (see buildRecommendation.ts); staff can override the support tier independently of the build tier at any point. */
export const DEFAULT_SUPPORT_TIER_FOR_BUILD: Record<BuildTier, SupportTier> = {
  foundation: "base",
  growth: "growth",
  enterprise: "pro",
  custom: "custom",
};

function subscriptionScopeLine(buildTier: BuildTier): string {
  const supportTier = DEFAULT_SUPPORT_TIER_FOR_BUILD[buildTier];
  const info = SUPPORT_TIER_INFO[supportTier];
  const billing = supportTier === "custom" ? `${info.label} support (${info.priceLabel})` : `${info.label} at ${info.priceLabel}`;
  return `${SUPPORT_SUBSCRIPTION_NAME} — first ${STABILIZATION_PERIOD_DAYS} days included, then ${billing}`;
}

export type BuildTierInfo = {
  label: string;
  price: number | null;
  priceLabel: string;
  forCompanies: string;
  /** Typical kickoff-to-handover duration — shown on the client report's Recommended Path section. */
  timeline: string;
  included: string[];
  excluded: string[];
};

export const BUILD_TIER_INFO: Record<BuildTier, BuildTierInfo> = {
  foundation: {
    label: "Foundation Build",
    price: 15000,
    priceLabel: "$15,000",
    forCompanies: "Smaller, simpler companies.",
    timeline: "4-6 weeks from kickoff to handover",
    included: ["Website", "Basic systems", "Basic SOPs", "Basic dashboard", "Setup", "Implementation", subscriptionScopeLine("foundation")],
    excluded: ["CRM", "Software workflows", "Automations", "Multiple user roles", "Advanced dashboards"],
  },
  growth: {
    label: "Growth Build",
    price: 22500,
    priceLabel: "$22,500",
    forCompanies: "Most clients.",
    timeline: "6-9 weeks from kickoff to handover",
    included: [
      "Website",
      "Software workflows",
      "CRM",
      "Dashboards",
      "SOPs",
      "Documents",
      "Automations",
      "Implementation",
      subscriptionScopeLine("growth"),
    ],
    excluded: ["Advanced/custom software", "Multiple advanced user roles", "Enterprise-scale automations"],
  },
  enterprise: {
    label: "Enterprise Build",
    price: 30000,
    priceLabel: "$30,000+",
    forCompanies: "Larger, complex clients.",
    timeline: "10-14 weeks from kickoff to handover",
    included: [
      "Advanced website and software",
      "Advanced dashboards",
      "Workflows",
      "Automations",
      "SOPs",
      "Documents",
      "Multiple users",
      "Implementation",
      subscriptionScopeLine("enterprise"),
    ],
    excluded: ["Fully bespoke scope beyond a standard package — that's Custom"],
  },
  custom: {
    label: "Custom Build",
    price: null,
    priceLabel: "Quoted separately",
    forCompanies: "Anything beyond $30,000.",
    timeline: "Scoped and scheduled individually",
    included: ["Scope defined individually based on the client's needs", subscriptionScopeLine("custom")],
    excluded: ["No fixed inclusions or exclusions — scoped and quoted per engagement"],
  },
};
