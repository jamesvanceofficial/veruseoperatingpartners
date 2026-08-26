// Stage 8 recommendation logic. Pure function, no DB access — driven by
// the org's scale (revenue, employees, locations) and the assessment's
// results (enterprise score, bottleneck categories).
//
// Two independent factors decide the build tier, and the higher one wins:
//   - "size" — how much complexity the org's scale alone implies.
//   - "need" — how severe the org's bottlenecks are in the categories a
//     build package actually fixes (Operations, Systems, Technology —
//     website/software/dashboards/automations). A company whose only weak
//     spot is Vision doesn't need more build scope to fix it; a company
//     whose Systems and Technology scores are near zero does — that's the
//     explicit example in the Stage 8 brief.
// Custom overrides both when the org's scale is genuinely outside what a
// fixed-scope package covers.

import { formatCurrency, formatNumber } from "@/shared/format";
import { BUILD_TIER_INFO, SUPPORT_TIER_INFO, type BuildTier, type SupportTier } from "./buildTiers";

const BUILD_RELEVANT_CATEGORIES = new Set(["Operations", "Systems", "Technology"]);

export type BuildRecommendationInput = {
  orgName: string;
  enterpriseScore: number;
  categoryScores: { categoryName: string; rawScore: number; bottleneckRank: number }[];
  annualRevenueEstimate: number | null;
  employeeCountEstimate: number | null;
  locationCount: number | null;
};

export type BuildRecommendationResult = {
  buildTier: BuildTier;
  buildPrice: number | null;
  buildReasoning: string;
  supportTier: SupportTier;
  supportPrice: number | null;
  supportReasoning: string;
};

function sizePoints(input: BuildRecommendationInput): number {
  let points = 0;
  const revenue = input.annualRevenueEstimate;
  if (revenue !== null) {
    if (revenue >= 10_000_000) points += 2;
    else if (revenue >= 3_000_000) points += 1;
  }
  const employees = input.employeeCountEstimate;
  if (employees !== null) {
    if (employees >= 50) points += 2;
    else if (employees >= 10) points += 1;
  }
  const locations = input.locationCount;
  if (locations !== null) {
    if (locations >= 4) points += 2;
    else if (locations >= 2) points += 1;
  }
  return points; // 0-6
}

function isCustomScale(input: BuildRecommendationInput): boolean {
  return (
    (input.annualRevenueEstimate ?? 0) >= 20_000_000 ||
    (input.employeeCountEstimate ?? 0) >= 150 ||
    (input.locationCount ?? 0) >= 8
  );
}

function withArticle(label: string, capitalize = false): string {
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  return `${capitalize ? article[0].toUpperCase() + article.slice(1) : article} ${label}`;
}

function describeScale(input: BuildRecommendationInput): string | null {
  const parts: string[] = [];
  if (input.annualRevenueEstimate !== null) parts.push(`${formatCurrency(input.annualRevenueEstimate)} in estimated annual revenue`);
  if (input.employeeCountEstimate !== null) parts.push(`${formatNumber(input.employeeCountEstimate)} employee${input.employeeCountEstimate === 1 ? "" : "s"}`);
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
  }
): string {
  const { sizeTier, needTier, custom, buildTier, relevantBottlenecks, top3 } = factors;
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

  sentences.push(`Enterprise score: ${input.enterpriseScore}/100.`);

  return sentences.join(" ");
}

function supportReasoningText(buildTier: BuildTier, supportTier: SupportTier, bumped: boolean): string {
  if (buildTier === "custom") {
    return "Support is quoted alongside the Custom Build once scope is finalized.";
  }
  const buildLabel = BUILD_TIER_INFO[buildTier].label;
  const supportLabel = SUPPORT_TIER_INFO[supportTier].label;
  const base = `${withArticle(buildLabel, true)} is typically paired with ${supportLabel} support.`;
  if (bumped) {
    return `${base} Given the organization's size, this is recommended one tier up from the default, to cover the higher ongoing support load.`;
  }
  return base;
}

export function computeBuildRecommendation(input: BuildRecommendationInput): BuildRecommendationResult {
  const top3 = [...input.categoryScores].sort((a, b) => a.bottleneckRank - b.bottleneckRank).slice(0, 3);
  const relevantBottlenecks = top3.filter((c) => BUILD_RELEVANT_CATEGORIES.has(c.categoryName));
  const severeRelevant = relevantBottlenecks.filter((c) => c.rawScore <= 3);

  const size = sizePoints(input);
  const sizeTier = size >= 5 ? 2 : size >= 2 ? 1 : 0;

  let needTier: number;
  if (relevantBottlenecks.length >= 2 && severeRelevant.length >= 1) needTier = 2;
  else if (relevantBottlenecks.length >= 1 || input.enterpriseScore < 40) needTier = 1;
  else needTier = 0;

  const tierIndex = Math.max(sizeTier, needTier);
  const custom = isCustomScale(input);
  const standardTiers: BuildTier[] = ["foundation", "growth", "enterprise"];
  const buildTier: BuildTier = custom ? "custom" : standardTiers[tierIndex];
  const buildInfo = BUILD_TIER_INFO[buildTier];

  const baseSupportMap: Record<BuildTier, SupportTier> = { foundation: "base", growth: "growth", enterprise: "pro", custom: "custom" };
  let supportTier = baseSupportMap[buildTier];
  let bumped = false;
  if (!custom && size >= 5) {
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
    buildReasoning: buildReasoningText(input, { sizeTier, needTier, custom, buildTier, relevantBottlenecks, top3 }),
    supportTier,
    supportPrice: supportInfo.price,
    supportReasoning: supportReasoningText(buildTier, supportTier, bumped),
  };
}
