// Stage 8 — the four fixed build packages and five fixed support tiers.
// Included/excluded scope and pricing are locked properties of the TIER,
// not computed per-org, so they live here as static config rather than
// being stored per-assessment. What varies per-org is which tier gets
// recommended and why — see buildRecommendation.ts.

export const BUILD_TIERS = ["foundation", "growth", "enterprise", "custom"] as const;
export type BuildTier = (typeof BUILD_TIERS)[number];

export const SUPPORT_TIERS = ["base", "growth", "pro", "enterprise", "custom"] as const;
export type SupportTier = (typeof SUPPORT_TIERS)[number];

export const SUPPORT_SUBSCRIPTION_NAME = "Software, Systems & Support Subscription";

export type BuildTierInfo = {
  label: string;
  price: number | null;
  priceLabel: string;
  forCompanies: string;
  included: string[];
  excluded: string[];
};

export const BUILD_TIER_INFO: Record<BuildTier, BuildTierInfo> = {
  foundation: {
    label: "Foundation Build",
    price: 15000,
    priceLabel: "$15,000",
    forCompanies: "Smaller, simpler companies.",
    included: ["Website", "Basic systems", "Basic SOPs", "Basic dashboard", "Setup", "Implementation"],
    excluded: ["CRM", "Software workflows", "Automations", "Client/staff portals", "Multiple user roles", "Advanced dashboards"],
  },
  growth: {
    label: "Growth Build",
    price: 22500,
    priceLabel: "$22,500",
    forCompanies: "Most clients.",
    included: ["Website", "Software workflows", "CRM", "Dashboards", "SOPs", "Documents", "Automations", "Support", "Implementation"],
    excluded: ["Advanced/custom software", "Client or partner portals", "Multiple advanced user roles", "Enterprise-scale automations"],
  },
  enterprise: {
    label: "Enterprise Build",
    price: 30000,
    priceLabel: "$30,000+",
    forCompanies: "Larger, complex clients.",
    included: [
      "Advanced website and software",
      "Portals",
      "Advanced dashboards",
      "Workflows",
      "Automations",
      "SOPs",
      "Documents",
      "Multiple users",
      "Support",
      "Implementation",
    ],
    excluded: ["Fully bespoke scope beyond a standard package — that's Custom"],
  },
  custom: {
    label: "Custom Build",
    price: null,
    priceLabel: "Quoted separately",
    forCompanies: "Anything beyond $30,000.",
    included: ["Scope defined individually based on the client's needs"],
    excluded: ["No fixed inclusions or exclusions — scoped and quoted per engagement"],
  },
};

export type SupportTierInfo = {
  label: string;
  price: number | null;
  priceLabel: string;
};

export const SUPPORT_TIER_INFO: Record<SupportTier, SupportTierInfo> = {
  base: { label: "Base", price: 350, priceLabel: "$350/mo" },
  growth: { label: "Growth", price: 750, priceLabel: "$750/mo" },
  pro: { label: "Pro", price: 1500, priceLabel: "$1,500/mo" },
  enterprise: { label: "Enterprise", price: 2500, priceLabel: "$2,500+/mo" },
  custom: { label: "Custom", price: null, priceLabel: "Quoted" },
};
