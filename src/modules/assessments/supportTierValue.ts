// Stage 20 — justifies each support tier's price on the client report
// instead of just listing what's included. Static per-tier config (like
// buildTiers.ts) plus the arithmetic that turns it into a "what this
// would cost otherwise" total.

import type { SupportTier } from "./buildTiers";

/** A normal freelance-developer/agency rate — what the included hours would cost bought separately, hour for hour. */
export const AGENCY_HOURLY_RATE = 125;

type SupportTierValueConfig = {
  /** Market-rate hosting, uptime monitoring, and backups for a business of this tier's scale — separate line items if bought individually. */
  hostingInfra: number;
  /** What the SaaS tools this tier's system replaces would cost bought separately (CRM, scheduling, automation platform, etc.), scaled to tier complexity. */
  softwareLicenses: number;
  /** This tier's included ongoing work, converted to hours/month — cumulative with the tier(s) below, same as the included-scope lists. */
  hoursEquivalent: number;
  /** One plain sentence: the business that belongs at this tier. */
  whoFor: string;
  /** One plain sentence: the concrete signals that mean it's time for the next tier up. */
  outgrowSignal: string;
};

export const SUPPORT_TIER_VALUE: Record<Exclude<SupportTier, "custom">, SupportTierValueConfig> = {
  base: {
    hostingInfra: 75,
    softwareLicenses: 150,
    hoursEquivalent: 2,
    whoFor: "A lean operation — a handful of people, one core system, and a business that doesn't change much month to month.",
    outgrowSignal:
      "You'll outgrow Base when you're regularly asking for changes beyond small content edits, when more than 3 people need access, or when a 2-business-day response isn't fast enough anymore.",
  },
  growth: {
    hostingInfra: 125,
    softwareLicenses: 400,
    hoursEquivalent: 5,
    whoFor: "A growing team with real day-to-day complexity — multiple people touching the system, regular small changes, and enough moving parts that DIY maintenance isn't realistic anymore.",
    outgrowSignal:
      "You'll outgrow Growth when 5 change requests a month isn't enough, when you need phone support instead of email, or when you're bringing on client-facing portal access.",
  },
  pro: {
    hostingInfra: 200,
    softwareLicenses: 750,
    hoursEquivalent: 17,
    whoFor: "A business running on several connected systems with real change velocity — new automations, an active client-facing presence, and enough scale that phone-level responsiveness actually matters.",
    outgrowSignal:
      "You'll outgrow Pro when 12 change requests and 5 hours of new automation work a month can't keep pace, when you need a dedicated contact instead of a shared queue, or when ongoing development time becomes a monthly need instead of an occasional one.",
  },
  enterprise: {
    hostingInfra: 350,
    softwareLicenses: 1400,
    hoursEquivalent: 27,
    whoFor: "A complex, larger operation — multiple integrations, ongoing development needs every month, and a business that can't afford to wait in a shared queue when something needs attention.",
    outgrowSignal: "Beyond Enterprise, scope moves to Custom — quoted individually once your needs are genuinely bespoke.",
  },
};

export type SupportTierValueJustification = SupportTierValueConfig & {
  hourlyRate: number;
  hoursValue: number;
  marketTotal: number;
};

export function getSupportTierValueJustification(tier: Exclude<SupportTier, "custom">): SupportTierValueJustification {
  const config = SUPPORT_TIER_VALUE[tier];
  const hoursValue = config.hoursEquivalent * AGENCY_HOURLY_RATE;
  const marketTotal = config.hostingInfra + config.softwareLicenses + hoursValue;
  return { ...config, hourlyRate: AGENCY_HOURLY_RATE, hoursValue, marketTotal };
}
