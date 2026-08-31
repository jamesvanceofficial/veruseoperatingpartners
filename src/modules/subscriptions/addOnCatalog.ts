import { SUPPORT_TIER_INFO, type SupportTier } from "@/modules/assessments/buildTiers";
import { VA_ASSIGNMENT_FEE, VA_ROLES, type VaRole } from "@/modules/assessments/supportAddOns";
import type { LineItemType, RevenueCategory } from "./types";

/**
 * The locked add-on catalog line items get attached from — bridges
 * `assessments/supportAddOns.ts` (the one existing source of truth for
 * these names/prices, already shown on the client report) into
 * ready-to-insert line-item shapes, rather than re-typing the list here
 * and risking it drifting from the report.
 */
export type CatalogEntry = {
  key: string;
  description: string;
  itemType: LineItemType;
  revenueCategory: RevenueCategory;
  /** null when the price depends on the subscription's own tier (extra seats) — resolved at add-time instead. */
  monthlyPrice: number | null;
  /** "one_time" closes the line item (end_date = start_date) the moment it's added — it's a real charge, but never counted in ongoing MRR. */
  billing: "recurring" | "one_time";
};

export function getAddOnCatalog(tier: SupportTier | null): CatalogEntry[] {
  const extraSeatRate = tier ? SUPPORT_TIER_INFO[tier].extraSeatRate : null;
  return [
    {
      key: "extra_seats",
      description: "Additional user seats",
      itemType: "addon",
      revenueCategory: "software",
      monthlyPrice: extraSeatRate,
      billing: "recurring",
    },
    { key: "portal", description: "Client or partner portal", itemType: "addon", revenueCategory: "software", monthlyPrice: 400, billing: "recurring" },
    { key: "marketing", description: "Marketing management", itemType: "addon", revenueCategory: "service", monthlyPrice: 2000, billing: "recurring" },
    { key: "seo", description: "SEO management", itemType: "addon", revenueCategory: "service", monthlyPrice: 1200, billing: "recurring" },
    { key: "social", description: "Social media management", itemType: "addon", revenueCategory: "service", monthlyPrice: 900, billing: "recurring" },
    { key: "bookkeeping", description: "Bookkeeping", itemType: "addon", revenueCategory: "service", monthlyPrice: 700, billing: "recurring" },
    {
      key: "automation_build",
      description: "Additional automation build",
      itemType: "addon",
      revenueCategory: "software",
      monthlyPrice: 500,
      billing: "one_time",
    },
    {
      key: "dev_hours",
      description: "Additional development hours",
      itemType: "addon",
      revenueCategory: "software",
      monthlyPrice: 175,
      billing: "recurring",
    },
  ];
}

export { VA_ASSIGNMENT_FEE, VA_ROLES };
export type { VaRole };
