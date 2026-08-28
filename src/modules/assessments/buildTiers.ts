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
//
// Stage 21: the support subscription pricing model was replaced entirely
// (researched against market rates, now locked) — base fee plus per-seat
// above an included count, not flat. Each tier states EXACTLY ONE value
// for seats/response-time/included-hours (never built by concatenating
// per-tier increment arrays the way build tiers' cumulative lists are —
// that pattern is what caused the previous model's stacking bug, where a
// higher tier's line sat next to the lower tier's un-superseded line in
// the same list). Scope is organized under four fixed headings per tier
// instead of a flat included/excluded list — see SupportTierScope.

export const BUILD_TIERS = ["foundation", "growth", "enterprise", "custom"] as const;
export type BuildTier = (typeof BUILD_TIERS)[number];

export const SUPPORT_TIERS = ["base", "growth", "pro", "enterprise", "custom"] as const;
export type SupportTier = (typeof SUPPORT_TIERS)[number];

export const SUPPORT_SUBSCRIPTION_NAME = "Software, Systems & Support Subscription";

/** Days after build handover covered by the build price before the subscription starts billing. */
export const STABILIZATION_PERIOD_DAYS = 90;

/** Stage 9 — once a build package has a real handover_date, this is the literal first-billing date instead of the generic "N days after handover" phrasing. Null until handover_date is set. */
export function computeFirstBillingDate(handoverDate: string | null): string | null {
  if (!handoverDate) return null;
  const date = new Date(handoverDate);
  date.setUTCDate(date.getUTCDate() + STABILIZATION_PERIOD_DAYS);
  return date.toISOString().slice(0, 10);
}

/** A support tier's scope, organized under four fixed headings — every tier gets all four, depth/cadence varies. */
export type SupportTierScope = {
  /** Hosting, uptime, monitoring, security patching, backups, fixing what breaks, and the tier's one stated response time. */
  keepingItRunning: string[];
  /** The included monthly hours and what they cover — changes, new automations, dashboard updates, process adjustments, report changes. */
  keepingItCurrent: string[];
  /** Training new staff on the system, documentation updates, and a system review (monthly at Pro and above, quarterly below). */
  keepingItUsed: string[];
  /** Seats, portal access, support channels. */
  access: string[];
};

export type SupportTierInfo = {
  label: string;
  price: number | null;
  priceLabel: string;
  /** null = unlimited (Enterprise) or not applicable (Custom). */
  includedSeats: number | null;
  /** Cost per seat beyond includedSeats — null when there's no per-seat overage (unlimited or Custom). */
  extraSeatRate: number | null;
  /** null = not a fixed number (Custom). */
  includedHoursPerMonth: number | null;
  responseTime: string;
  scope: SupportTierScope;
  /** The concrete jump from the tier immediately below — null for Base (bottom tier) and Custom. Drives the client report's tier-comparison ladder; written by hand per tier so it can never silently drift from the actual numbers below. */
  whatsNewFromPreviousTier: string[] | null;
};

export const SUPPORT_TIER_INFO: Record<SupportTier, SupportTierInfo> = {
  base: {
    label: "Base",
    price: 500,
    priceLabel: "$500/mo",
    includedSeats: 10,
    extraSeatRate: 35,
    includedHoursPerMonth: 2,
    responseTime: "2 business days",
    scope: {
      keepingItRunning: [
        "Hosting and uptime for their system",
        "Security updates and patching",
        "Daily data backups",
        "Fixing what breaks",
        "Response time: 2 business days",
      ],
      keepingItCurrent: ["2 hours of included work per month — covers minor content and settings changes"],
      keepingItUsed: ["New staff trained on the system as needed", "Documentation kept current", "Quarterly system review"],
      access: ["Up to 10 user seats included ($35/mo per additional seat)", "Email support"],
    },
    whatsNewFromPreviousTier: null,
  },
  growth: {
    label: "Growth",
    price: 1200,
    priceLabel: "$1,200/mo",
    includedSeats: 25,
    extraSeatRate: 30,
    includedHoursPerMonth: 6,
    responseTime: "Next business day",
    scope: {
      keepingItRunning: [
        "Hosting and uptime for their system",
        "Security updates and patching",
        "Daily data backups",
        "Fixing what breaks",
        "Response time: next business day",
      ],
      keepingItCurrent: [
        "6 hours of included work per month — covers changes, dashboard and report adjustments, and automation maintenance and fixes",
      ],
      keepingItUsed: ["New staff trained on the system as needed", "Documentation kept current", "Quarterly system review"],
      access: ["Up to 25 user seats included ($30/mo per additional seat)", "Priority email support"],
    },
    whatsNewFromPreviousTier: [
      "15 more included seats (25 vs. 10), at a lower per-seat overage rate ($30 vs. $35)",
      "3x the included work each month (6 hours vs. 2)",
      "Response time drops to next business day",
    ],
  },
  pro: {
    label: "Pro",
    price: 2500,
    priceLabel: "$2,500/mo",
    includedSeats: 50,
    extraSeatRate: 25,
    includedHoursPerMonth: 12,
    responseTime: "Same business day",
    scope: {
      keepingItRunning: [
        "Hosting and uptime for their system",
        "Security updates and patching",
        "Daily data backups",
        "Fixing what breaks",
        "Response time: same business day",
      ],
      keepingItCurrent: [
        "12 hours of included work per month — covers changes, new automation builds, dashboard and report adjustments, and integration maintenance",
      ],
      keepingItUsed: ["New staff trained on the system", "Documentation kept current", "Monthly system review"],
      access: ["Up to 50 user seats included ($25/mo per additional seat)", "Phone and scheduled call support"],
    },
    whatsNewFromPreviousTier: [
      "25 more included seats (50 vs. 25), at a lower per-seat overage rate ($25 vs. $30)",
      "Double the included work each month (12 hours vs. 6)",
      "Response time drops to same business day",
      "Monthly system review instead of quarterly, plus phone and scheduled call support",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price: 4000,
    priceLabel: "$4,000+/mo",
    includedSeats: null,
    extraSeatRate: null,
    includedHoursPerMonth: 24,
    responseTime: "Same day, with a dedicated contact",
    scope: {
      keepingItRunning: [
        "Hosting and uptime for their system",
        "Security updates and patching",
        "Daily data backups",
        "Fixing what breaks",
        "Response time: same day, with a dedicated contact",
      ],
      keepingItCurrent: [
        "24 hours of included work per month — covers changes, new automation builds, ongoing development work, and multiple integrations maintained",
      ],
      keepingItUsed: ["New staff trained on the system", "Documentation kept current", "Monthly system review", "Advanced dashboards and reporting"],
      access: ["Unlimited user seats", "Dedicated support contact"],
    },
    whatsNewFromPreviousTier: [
      "Unlimited seats — no per-seat overage",
      "Double the included work again each month (24 hours vs. 12)",
      "Same-day response with a dedicated contact instead of a shared queue",
    ],
  },
  custom: {
    label: "Custom",
    price: null,
    priceLabel: "Quoted",
    includedSeats: null,
    extraSeatRate: null,
    includedHoursPerMonth: null,
    responseTime: "Defined per engagement",
    scope: {
      keepingItRunning: ["Scope defined per client"],
      keepingItCurrent: ["Scope defined per client"],
      keepingItUsed: ["Scope defined per client"],
      access: ["Scope defined per client"],
    },
    whatsNewFromPreviousTier: null,
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
