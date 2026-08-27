// Stage 8 recommendation logic, extended in Stage 12 with the financial
// profile / business presence / workforce sections. Pure function, no DB
// access — driven by the org's scale (revenue, employees, locations) and
// the assessment's results (enterprise score, bottleneck categories).
//
// Two independent factors decide the build tier, and the higher one wins:
//   - "size" — how much complexity the org's scale alone implies. Real,
//     confirmed numbers (financial profile revenue, workforce headcount)
//     carry more weight here than organizations.annual_revenue_estimate /
//     employee_count_estimate, which are rough self-reported guesses —
//     see revenuePoints/headcountPoints below.
//   - "need" — how severe the org's bottlenecks are in the categories a
//     build package actually fixes (Operations, Systems, Technology —
//     website/software/dashboards/automations), PLUS two Stage 12
//     signals: weak margins (more build/systems work needed to fix
//     profitability) and no website + no Google Business Profile (needs
//     foundational website/marketing scope beyond what a light build
//     assumes). A company whose only weak spot is Vision doesn't need
//     more build scope to fix it; a company whose Systems and Technology
//     scores are near zero does — that's the original Stage 8 example.
// Custom overrides both when the org's scale is genuinely outside what a
// fixed-scope package covers.

import { formatCurrency, formatNumber } from "@/shared/format";
import { BUILD_TIER_INFO, SUPPORT_TIER_INFO, DEFAULT_SUPPORT_TIER_FOR_BUILD, STABILIZATION_PERIOD_DAYS, type BuildTier, type SupportTier } from "./buildTiers";

const BUILD_RELEVANT_CATEGORIES = new Set(["Operations", "Systems", "Technology"]);
const WEAK_MARGIN_THRESHOLD_PCT = 5;
/** "Several automations" (requirement: portal + several automations => higher tier than neither). */
const SEVERAL_AUTOMATIONS_THRESHOLD = 3;

export type BuildRecommendationInput = {
  orgName: string;
  enterpriseScore: number;
  categoryScores: { categoryName: string; rawScore: number; bottleneckRank: number }[];
  annualRevenueEstimate: number | null;
  employeeCountEstimate: number | null;
  locationCount: number | null;
  /** Financial profile's current/last-year revenue — a real, confirmed number, weighted more heavily than annualRevenueEstimate. */
  realRevenue: number | null;
  netProfitMarginPct: number | null;
  /** Workforce W2 + contractors + VAs — a real, confirmed headcount, weighted more heavily than employeeCountEstimate. */
  realHeadcount: number | null;
  hasWebsite: boolean | null;
  hasGoogleBusinessProfile: boolean;
  /** Stage 18 — whether the business needs a client/partner login, and how many distinct repetitive tasks it wants automated. Neither is tier-gated in scope (see effectiveScope.ts), but both push the recommendation up when real, since a portal and several automations are genuinely more build than a lighter tier assumes. */
  hasPortalNeed: boolean;
  automationTaskCount: number;
};

export type BuildRecommendationResult = {
  buildTier: BuildTier;
  buildPrice: number | null;
  buildReasoning: string;
  supportTier: SupportTier;
  supportPrice: number | null;
  supportReasoning: string;
};

function revenuePoints(input: BuildRecommendationInput): number {
  const isReal = input.realRevenue !== null;
  const revenue = input.realRevenue ?? input.annualRevenueEstimate;
  if (revenue === null) return 0;
  if (isReal) {
    if (revenue >= 10_000_000) return 3;
    if (revenue >= 5_000_000) return 2;
    if (revenue >= 1_500_000) return 1;
    return 0;
  }
  if (revenue >= 10_000_000) return 2;
  if (revenue >= 3_000_000) return 1;
  return 0;
}

function headcountPoints(input: BuildRecommendationInput): number {
  const isReal = input.realHeadcount !== null;
  const count = input.realHeadcount ?? input.employeeCountEstimate;
  if (count === null) return 0;
  if (isReal) {
    if (count >= 40) return 3;
    if (count >= 15) return 2;
    if (count >= 5) return 1;
    return 0;
  }
  if (count >= 50) return 2;
  if (count >= 10) return 1;
  return 0;
}

function locationPoints(locationCount: number | null): number {
  if (locationCount === null) return 0;
  if (locationCount >= 4) return 2;
  if (locationCount >= 2) return 1;
  return 0;
}

function isCustomScale(input: BuildRecommendationInput): boolean {
  const revenue = input.realRevenue ?? input.annualRevenueEstimate ?? 0;
  const headcount = input.realHeadcount ?? input.employeeCountEstimate ?? 0;
  return revenue >= 20_000_000 || headcount >= 150 || (input.locationCount ?? 0) >= 8;
}

function withArticle(label: string, capitalize = false): string {
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  return `${capitalize ? article[0].toUpperCase() + article.slice(1) : article} ${label}`;
}

function describeScale(input: BuildRecommendationInput): string | null {
  const parts: string[] = [];
  if (input.realRevenue !== null) parts.push(`${formatCurrency(input.realRevenue)} in confirmed revenue`);
  else if (input.annualRevenueEstimate !== null) parts.push(`${formatCurrency(input.annualRevenueEstimate)} in estimated annual revenue`);
  if (input.realHeadcount !== null) parts.push(`${formatNumber(input.realHeadcount)} on the team (employees and contractors)`);
  else if (input.employeeCountEstimate !== null) parts.push(`${formatNumber(input.employeeCountEstimate)} employee${input.employeeCountEstimate === 1 ? "" : "s"}`);
  if (input.locationCount !== null) parts.push(`${formatNumber(input.locationCount)} location${input.locationCount === 1 ? "" : "s"}`);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" and ");
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
}

function buildReasoningText(
  input: BuildRecommendationInput,
  factors: {
    sizeTier: number;
    needTier: number;
    custom: boolean;
    buildTier: BuildTier;
    relevantBottlenecks: { categoryName: string; rawScore: number }[];
    top3: { categoryName: string; rawScore: number }[];
    weakMargin: boolean;
    noWebPresence: boolean;
    hasPortalNeed: boolean;
    manyAutomations: boolean;
  }
): string {
  const { sizeTier, needTier, custom, buildTier, relevantBottlenecks, top3, weakMargin, noWebPresence, hasPortalNeed, manyAutomations } = factors;
  const scaleDesc = describeScale(input);
  const sentences: string[] = [];

  if (custom) {
    sentences.push(
      `${input.orgName}'s scale${scaleDesc ? ` — ${scaleDesc}` : ""} is beyond what a fixed-scope build package covers, so this is recommended as a Custom Build, scoped and quoted individually.`
    );
    return sentences.join(" ");
  }

  const tierLabel = BUILD_TIER_INFO[buildTier].label;

  if (sizeTier >= needTier) {
    sentences.push(
      scaleDesc
        ? `With ${scaleDesc}, ${input.orgName} is sized for a ${tierLabel} on scale alone.`
        : `${input.orgName} is recommended for a ${tierLabel}.`
    );
  } else {
    sentences.push(
      scaleDesc
        ? `${input.orgName}'s scale (${scaleDesc}) would suggest a lighter build, but the assessment results call for more.`
        : `The assessment results call for more build than the organization's scale alone would suggest.`
    );
  }

  if (relevantBottlenecks.length > 0) {
    const names = relevantBottlenecks.map((c) => `${c.categoryName} (${c.rawScore.toFixed(1)}/10)`).join(" and ");
    sentences.push(
      `Your top bottleneck${relevantBottlenecks.length > 1 ? "s are" : " is"} ${names} — exactly the kind of gap ${withArticle(tierLabel)} is built to close.`
    );
  } else if (top3.length > 0) {
    const top = top3[0];
    sentences.push(
      `Your biggest bottleneck is ${top.categoryName} (${top.rawScore.toFixed(1)}/10), which is more of a strategy and leadership gap than a systems gap — more build scope won't fix it, so the recommendation stays at ${tierLabel}.`
    );
  }

  if (weakMargin) {
    sentences.push(
      `Your net margin is under ${WEAK_MARGIN_THRESHOLD_PCT}% — that's usually a systems problem more than a market problem, which pushes toward more build, not less.`
    );
  }

  if (noWebPresence) {
    sentences.push("You currently have no website and no Google Business Profile — that's foundational visibility work this build needs to include.");
  }

  if (hasPortalNeed && manyAutomations) {
    sentences.push("You also need a client/partner portal and several repetitive tasks automated — both are real build scope, not extras, and both push toward more build.");
  } else if (hasPortalNeed) {
    sentences.push("You also need a client/partner portal, scoped to this tier — that's real build scope, not an extra.");
  } else if (manyAutomations) {
    sentences.push("You also flagged several repetitive tasks to automate — that's real build scope, not an extra.");
  }

  sentences.push(`Enterprise score: ${input.enterpriseScore}/100.`);

  return sentences.join(" ");
}

function supportReasoningText(input: BuildRecommendationInput, buildTier: BuildTier, supportTier: SupportTier, bumped: boolean): string {
  const supportLabel = SUPPORT_TIER_INFO[supportTier].label;

  if (buildTier === "custom") {
    return `Support is part of this engagement, not a separate purchase — scoped and quoted alongside the Custom Build, with the same structure as every tier: the first ${STABILIZATION_PERIOD_DAYS} days are included to stabilize the new systems, then it bills at the agreed rate.`;
  }

  const headcount = input.realHeadcount ?? input.employeeCountEstimate;
  const isRealHeadcount = input.realHeadcount !== null;
  const systemsScore = input.categoryScores.find((c) => c.categoryName === "Systems")?.rawScore ?? null;

  const sentences: string[] = [
    `This is included with the build, not a separate purchase — the first ${STABILIZATION_PERIOD_DAYS} days are covered in the build price to get the new systems stable, then it continues at ${supportLabel} (${SUPPORT_TIER_INFO[supportTier].priceLabel}).`,
  ];

  if (headcount !== null) {
    sentences.push(
      `With ${formatNumber(headcount)} ${isRealHeadcount ? "on the team" : "employees"}, ${supportLabel}'s seat allowance and response times match the day-to-day support load a team this size actually generates.`
    );
  }

  if (systemsScore !== null && systemsScore < 5) {
    sentences.push(
      `Systems scored ${systemsScore.toFixed(1)}/10 on this assessment — with that much still undocumented or manual, ongoing hands-on support matters more here than it would for a more systemized operation.`
    );
  } else if (bumped) {
    sentences.push("Given the organization's scale, this continues one tier up from the build's default once the included period ends.");
  }

  return sentences.join(" ");
}

export function computeBuildRecommendation(input: BuildRecommendationInput): BuildRecommendationResult {
  const top3 = [...input.categoryScores].sort((a, b) => a.bottleneckRank - b.bottleneckRank).slice(0, 3);
  const relevantBottlenecks = top3.filter((c) => BUILD_RELEVANT_CATEGORIES.has(c.categoryName));
  const severeRelevant = relevantBottlenecks.filter((c) => c.rawScore <= 3);

  const size = revenuePoints(input) + headcountPoints(input) + locationPoints(input.locationCount); // 0-8
  const sizeTier = size >= 6 ? 2 : size >= 2 ? 1 : 0;

  let needTier: number;
  if (relevantBottlenecks.length >= 2 && severeRelevant.length >= 1) needTier = 2;
  else if (relevantBottlenecks.length >= 1 || input.enterpriseScore < 40) needTier = 1;
  else needTier = 0;

  const weakMargin = input.netProfitMarginPct !== null && input.netProfitMarginPct < WEAK_MARGIN_THRESHOLD_PCT;
  const noWebPresence = input.hasWebsite === false && !input.hasGoogleBusinessProfile;
  const manyAutomations = input.automationTaskCount >= SEVERAL_AUTOMATIONS_THRESHOLD;
  if (weakMargin) needTier = Math.max(needTier, 1);
  if (noWebPresence) needTier = Math.max(needTier, 1);
  if (input.hasPortalNeed) needTier = Math.max(needTier, 1);
  if (input.hasPortalNeed && manyAutomations) needTier = Math.max(needTier, 2);

  const tierIndex = Math.max(sizeTier, needTier);
  const custom = isCustomScale(input);
  const standardTiers: BuildTier[] = ["foundation", "growth", "enterprise"];
  const buildTier: BuildTier = custom ? "custom" : standardTiers[tierIndex];
  const buildInfo = BUILD_TIER_INFO[buildTier];

  let supportTier = DEFAULT_SUPPORT_TIER_FOR_BUILD[buildTier];
  let bumped = false;
  if (!custom && size >= 6) {
    const order: SupportTier[] = ["base", "growth", "pro", "enterprise"];
    const idx = order.indexOf(supportTier);
    if (idx >= 0 && idx < order.length - 1) {
      supportTier = order[idx + 1];
      bumped = true;
    }
  }
  const supportInfo = SUPPORT_TIER_INFO[supportTier];

  return {
    buildTier,
    buildPrice: buildInfo.price,
    buildReasoning: buildReasoningText(input, {
      sizeTier,
      needTier,
      custom,
      buildTier,
      relevantBottlenecks,
      top3,
      weakMargin,
      noWebPresence,
      hasPortalNeed: input.hasPortalNeed,
      manyAutomations,
    }),
    supportTier,
    supportPrice: supportInfo.price,
    supportReasoning: supportReasoningText(input, buildTier, supportTier, bumped),
  };
}
