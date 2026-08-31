// Stage 31 — assembles a new proposal's initial editable text from a
// completed Full Assessment's real, already-computed report. Every field
// here becomes a plain, freely-editable column at insert time (see
// data.ts's createProposalFromAssessment) — this function never runs
// again after that; nothing here stays "live" against the assessment,
// matching requirement 3 exactly.

import { CATEGORY_BOTTLENECK_COPY } from "@/modules/assessments/bottleneckCopy";
import { CATEGORY_TYPICAL_COST, CATEGORY_FIX_INVOLVES } from "@/modules/assessments/reportCopy";
import { BUILD_TIER_INFO, SUPPORT_TIER_INFO, DEFAULT_SUPPORT_TIER_FOR_BUILD, STABILIZATION_PERIOD_DAYS, type BuildTier, type SupportTier } from "@/modules/assessments/buildTiers";
import { getEffectiveBuildScope } from "@/modules/assessments/effectiveScope";
import { computeScopeOfWork } from "@/modules/assessments/scopeOfWork";
import type { AssessmentReport } from "@/modules/assessments/types";

export type GeneratedProposalContent = {
  companyName: string;
  enterpriseScore: number | null;
  bandLabel: string | null;
  constraintsText: string;
  buildTier: BuildTier | null;
  recommendationText: string;
  scopeOfWorkText: string;
  includedText: string;
  excludedText: string;
  timelineText: string;
  buildPrice: number | null;
  supportTier: SupportTier | null;
  supportPriceLabel: string | null;
  firstYearValue: number | null;
  verusResponsibilitiesText: string;
  clientResponsibilitiesText: string;
  nextStepsText: string;
};

const VERUS_RESPONSIBILITIES = [
  "Deliver the scope of work above, on the timeline stated, communicating any real change before it happens.",
  "Provide a single point of contact for the duration of the build.",
  "Train the team on everything built, and document it so it doesn't depend on any one person's memory.",
  "Keep the Software, Systems & Support subscription running once handover happens.",
].join("\n");

const CLIENT_RESPONSIBILITIES = [
  "Provide timely access to the systems, accounts, and information needed to do the work.",
  "Make decisions and give feedback within the timeframes agreed during scope lock.",
  "Make the team available for training as each phase is delivered.",
  "Pay according to the terms in this proposal.",
].join("\n");

const NEXT_STEPS = ["Sign this proposal.", "We schedule the kickoff call.", "Foundation & Scope Lock begins."].join("\n");

export function generateProposalContent(report: AssessmentReport): GeneratedProposalContent {
  const { assessment, categoryScores } = report;
  const buildTier = (assessment.build_tier_override ?? assessment.recommended_build_tier) as BuildTier | null;
  const supportTier = (assessment.support_tier_override ?? assessment.recommended_support_tier ?? (buildTier ? DEFAULT_SUPPORT_TIER_FOR_BUILD[buildTier] : null)) as SupportTier | null;

  const top3 = [...categoryScores].sort((a, b) => a.bottleneckRank - b.bottleneckRank).slice(0, 3);
  const constraintsText = top3
    .map((c, i) => {
      const lines = [`#${i + 1} ${c.categoryName} (${c.rawScore.toFixed(1)} / 10)`];
      const found = CATEGORY_BOTTLENECK_COPY[c.categoryName];
      const cost = CATEGORY_TYPICAL_COST[c.categoryName];
      const fix = CATEGORY_FIX_INVOLVES[c.categoryName];
      if (found) lines.push(found);
      if (cost) lines.push(`What it typically costs a business your size: ${cost}`);
      if (fix) lines.push(`What fixing it involves: ${fix}`);
      return lines.join("\n");
    })
    .join("\n\n");

  let recommendationText = "";
  let includedText = "";
  let excludedText = "";
  let timelineText = "";
  let scopeOfWorkText = "";
  let buildPrice: number | null = null;

  if (buildTier) {
    const buildInfo = BUILD_TIER_INFO[buildTier];
    buildPrice = buildInfo.price;
    const forCompanies = buildInfo.forCompanies.replace(/\.$/, "");
    recommendationText = [
      `We recommend the ${buildInfo.label} (${buildInfo.priceLabel}) — built for ${forCompanies.charAt(0).toLowerCase()}${forCompanies.slice(1)}.`,
      `Based on your assessment, your enterprise score is ${report.assessment.enterprise_score ?? "—"} out of 100 (${report.bandLabel ?? "—"}), and your biggest constraint is ${top3[0]?.categoryName ?? "—"} — this build starts there.`,
    ].join(" ");

    const scope = getEffectiveBuildScope(buildTier, report.operationalNeeds);
    includedText = scope.included.map((i) => `• ${i}`).join("\n");
    excludedText = scope.excluded.map((i) => `• ${i}`).join("\n");
    timelineText = `${buildInfo.timeline}.`;

    const plan = computeScopeOfWork(
      buildTier,
      top3.map((c) => ({ categoryName: c.categoryName, rawScore: c.rawScore })),
      report.operationalNeeds
    );
    if (plan) {
      scopeOfWorkText = plan.phases
        .map((p) => {
          const weekLabel = p.weekStart === p.weekEnd ? `Week ${p.weekStart}` : `Weeks ${p.weekStart}-${p.weekEnd}`;
          const lines = [`${p.name} (${weekLabel})`, ...p.whatWeDo.map((d) => `• ${d}`)];
          if (p.whatYouGet) lines.push(`What you get: ${p.whatYouGet}`);
          return lines.join("\n");
        })
        .join("\n\n");
    }
  }

  let supportPriceLabel: string | null = null;
  let firstYearValue: number | null = null;
  if (supportTier) {
    const supportInfo = SUPPORT_TIER_INFO[supportTier];
    supportPriceLabel = supportInfo.priceLabel;
    if (buildPrice !== null && supportInfo.price !== null) {
      firstYearValue = buildPrice + supportInfo.price * 9;
    }
  }

  return {
    companyName: report.orgName,
    enterpriseScore: assessment.enterprise_score,
    bandLabel: report.bandLabel,
    constraintsText,
    buildTier,
    recommendationText,
    scopeOfWorkText,
    includedText,
    excludedText,
    timelineText,
    buildPrice,
    supportTier,
    supportPriceLabel,
    firstYearValue,
    verusResponsibilitiesText: VERUS_RESPONSIBILITIES,
    clientResponsibilitiesText: CLIENT_RESPONSIBILITIES,
    nextStepsText: NEXT_STEPS,
  };
}

export function investmentNoteFor(supportTier: SupportTier | null): string {
  if (!supportTier) return "";
  const info = SUPPORT_TIER_INFO[supportTier];
  return `The Software, Systems & Support Subscription is included with your build — the first ${STABILIZATION_PERIOD_DAYS} days are covered to stabilize the new systems. After that, it continues at ${info.label} (${info.priceLabel}).`;
}
