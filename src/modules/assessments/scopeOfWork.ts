// Stage 17 — generates the client report's Scope of Work phases from
// THIS assessment's own bottleneck order, capped by how much a given
// build tier actually covers. Pure function, no DB access.
//
// Structure: a fixed 1-week Foundation & Scope Lock phase, then one phase
// per top-ranked bottleneck category (however many the tier's budget
// affords), then a fixed Training & Handover phase — week ranges always
// sum to exactly the tier's planned timeline.

import { CATEGORY_PHASE_NAME, CATEGORY_BUILD_DELIVERABLES, CATEGORY_PHASE_ARTIFACT, CATEGORY_PHASE_DEPENDENCY } from "./reportCopy";
import type { BuildTier } from "./buildTiers";

type TierPhasePlan = {
  /** Single canonical week total for phase math — always inside the tier's timeline range in buildTiers.ts. */
  totalWeeks: number;
  /** How many bottleneck-driven phases this tier's scope and budget can actually cover. */
  maxBottleneckPhases: number;
  scopeLockWeeks: number;
  handoverWeeks: number;
};

const TIER_PHASE_PLAN: Record<Exclude<BuildTier, "custom">, TierPhasePlan> = {
  foundation: { totalWeeks: 5, maxBottleneckPhases: 1, scopeLockWeeks: 1, handoverWeeks: 1 },
  growth: { totalWeeks: 7, maxBottleneckPhases: 2, scopeLockWeeks: 1, handoverWeeks: 1 },
  enterprise: { totalWeeks: 12, maxBottleneckPhases: 4, scopeLockWeeks: 1, handoverWeeks: 2 },
};

export type ScopePhase = {
  phaseNumber: number;
  name: string;
  weekStart: number;
  weekEnd: number;
  kind: "scope-lock" | "bottleneck" | "handover";
  categoryName?: string;
  categoryScore?: number;
  whatWeDo: string[];
  whatYouGet: string;
  whatWeNeed?: string;
};

export type ScopeOfWorkPlan = {
  totalWeeks: number;
  phases: ScopePhase[];
};

/** Splits `total` whole weeks across `count` phases as evenly as possible — the earlier (higher-ranked) phases get any extra week, so the biggest bottleneck gets the most time. */
function splitWeeks(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

/**
 * Returns null for a Custom build (or if there's no recommendation at
 * all) — Custom is scoped and quoted individually, not generated from
 * this fixed-tier phase math.
 */
export function computeScopeOfWork(
  buildTier: BuildTier | null,
  rankedBottlenecks: { categoryName: string; rawScore: number }[]
): ScopeOfWorkPlan | null {
  if (!buildTier || buildTier === "custom") return null;
  const plan = TIER_PHASE_PLAN[buildTier];

  const bottleneckCount = Math.min(plan.maxBottleneckPhases, rankedBottlenecks.length);
  const bottleneckBudget = plan.totalWeeks - plan.scopeLockWeeks - plan.handoverWeeks;
  const bottleneckWeeks = splitWeeks(bottleneckBudget, bottleneckCount);

  const phases: ScopePhase[] = [];
  let cursor = 1;
  let phaseNumber = 1;

  phases.push({
    phaseNumber: phaseNumber++,
    name: "Foundation & Scope Lock",
    weekStart: cursor,
    weekEnd: cursor + plan.scopeLockWeeks - 1,
    kind: "scope-lock",
    whatWeDo: ["Confirm scope", "Map current state", "Gather access and information", "Agree on success measures"],
    whatYouGet: "Signed scope, project plan, kickoff completed.",
  });
  cursor += plan.scopeLockWeeks;

  rankedBottlenecks.slice(0, bottleneckCount).forEach((cat, i) => {
    const weeks = bottleneckWeeks[i];
    phases.push({
      phaseNumber: phaseNumber++,
      name: CATEGORY_PHASE_NAME[cat.categoryName] ?? `${cat.categoryName} Build`,
      weekStart: cursor,
      weekEnd: cursor + weeks - 1,
      kind: "bottleneck",
      categoryName: cat.categoryName,
      categoryScore: cat.rawScore,
      whatWeDo: CATEGORY_BUILD_DELIVERABLES[cat.categoryName] ?? [],
      whatYouGet: CATEGORY_PHASE_ARTIFACT[cat.categoryName] ?? "",
      whatWeNeed: CATEGORY_PHASE_DEPENDENCY[cat.categoryName],
    });
    cursor += weeks;
  });

  phases.push({
    phaseNumber: phaseNumber++,
    name: "Training & Handover",
    weekStart: cursor,
    weekEnd: cursor + plan.handoverWeeks - 1,
    kind: "handover",
    whatWeDo: ["Train the team on the new systems", "Document everything", "Hand over"],
    whatYouGet: "Trained team, documentation, systems live, and the 90-day stabilization period begins.",
  });
  cursor += plan.handoverWeeks;

  return { totalWeeks: plan.totalWeeks, phases };
}
