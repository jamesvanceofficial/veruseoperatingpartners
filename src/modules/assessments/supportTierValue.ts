// Stage 20, updated Stage 21 for the new locked pricing model — justifies
// each support tier's price on the client report instead of just listing
// what's included. Static per-tier config (like buildTiers.ts) plus the
// arithmetic that turns it into a "what this would cost otherwise" total
// and a per-user cost comparison.

import { SUPPORT_TIER_INFO, type SupportTier } from "./buildTiers";

/** A normal freelance-developer/agency rate — what the included hours would cost bought separately, hour for hour. */
export const AGENCY_HOURLY_RATE = 150;

/** Managed IT services market range, per user per month, 2026 — what the client's effective per-seat cost is compared against. */
export const MANAGED_IT_PER_USER_RANGE = { low: 100, high: 250 };

type SupportTierValueConfig = {
  /** Market-rate hosting, uptime monitoring, and backups for a business of this tier's scale — separate line items if bought individually. */
  hostingInfra: number;
  /** What the SaaS tools this tier's system replaces would cost bought separately (CRM, scheduling, automation platform, etc.), scaled to tier complexity. */
  softwareLicenses: number;
  /** One plain sentence: the business that belongs at this tier. */
  whoFor: string;
  /** One plain sentence: the concrete signals that mean it's time for the next tier up. */
  outgrowSignal: string;
};

export const SUPPORT_TIER_VALUE: Record<Exclude<SupportTier, "custom">, SupportTierValueConfig> = {
  base: {
    hostingInfra: 100,
    softwareLicenses: 300,
    whoFor: "A lean operation — up to about 10 people using the system, and a business that doesn't change much month to month.",
    outgrowSignal:
      "You'll outgrow Base when you're regularly over 10 seats, need more than 2 hours of changes a month, or a 2-business-day response isn't fast enough anymore.",
  },
  growth: {
    hostingInfra: 200,
    softwareLicenses: 700,
    whoFor: "A growing team — up to about 25 people on the system, with enough regular change that 2 hours a month stopped being enough.",
    outgrowSignal:
      "You'll outgrow Growth when you're pushing past 25 seats, need more than 6 hours of work a month, or next-business-day response is too slow for how the business runs.",
  },
  pro: {
    hostingInfra: 350,
    softwareLicenses: 1600,
    whoFor: "A larger, more active operation — up to about 50 people on the system, running several connected tools with real week-to-week change.",
    outgrowSignal:
      "You'll outgrow Pro when you're approaching 50 seats, 12 hours a month can't keep up with the pace of change, or you need a dedicated contact instead of a shared queue.",
  },
  enterprise: {
    hostingInfra: 600,
    softwareLicenses: 2300,
    whoFor: "A complex, larger operation — unlimited seats, multiple integrations, and enough ongoing development need that 24 hours a month is a baseline, not a ceiling.",
    outgrowSignal: "Beyond Enterprise, scope moves to Custom — quoted individually once your needs are genuinely bespoke.",
  },
};

export type SupportTierValueJustification = SupportTierValueConfig & {
  hourlyRate: number;
  hoursEquivalent: number;
  hoursValue: number;
  marketTotal: number;
  /** Effective monthly cost per included seat at this tier's price — null when the tier has no fixed seat count (Enterprise). */
  costPerUser: number | null;
};

export function getSupportTierValueJustification(tier: Exclude<SupportTier, "custom">): SupportTierValueJustification {
  const config = SUPPORT_TIER_VALUE[tier];
  const info = SUPPORT_TIER_INFO[tier];
  const hoursEquivalent = info.includedHoursPerMonth ?? 0;
  const hoursValue = hoursEquivalent * AGENCY_HOURLY_RATE;
  const marketTotal = config.hostingInfra + config.softwareLicenses + hoursValue;
  const costPerUser = info.includedSeats && info.price !== null ? info.price / info.includedSeats : null;
  return { ...config, hourlyRate: AGENCY_HOURLY_RATE, hoursEquivalent, hoursValue, marketTotal, costPerUser };
}
