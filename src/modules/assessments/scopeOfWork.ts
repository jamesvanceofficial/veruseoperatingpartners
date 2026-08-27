// Stage 17 — generates the client report's Scope of Work phases from
// THIS assessment's own bottleneck order, capped by how much a given
// build tier actually covers. Pure function, no DB access.
//
// Structure: a fixed 1-week Foundation & Scope Lock phase, then one phase
// per top-ranked bottleneck category (however many the tier's budget
// affords), then — Stage 18 — a dedicated portal phase if this business
// actually needs one (extends the total timeline rather than eating into
// bottleneck weeks, since it's real additional scope), then a fixed
// Training & Handover phase. Week ranges always sum to exactly the plan's
// total (base tier weeks, plus portal weeks when applicable).

import { CATEGORY_PHASE_NAME, CATEGORY_BUILD_DELIVERABLES, CATEGORY_PHASE_ARTIFACT, CATEGORY_PHASE_DEPENDENCY } from "./reportCopy";
import { needsPortal } from "./effectiveScope";
import type { BuildTier } from "./buildTiers";
import type { OperationalNeeds } from "./types";

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

/** Extra weeks added to the timeline when a portal is needed — scales with tier the same way portal scope itself does (see effectiveScope.ts). */
const PORTAL_PHASE_WEEKS: Record<Exclude<BuildTier, "custom">, number> = {
  foundation: 1,
  growth: 2,
  enterprise: 3,
};

export type ScopePhase = {
  phaseNumber: number;
  name: string;
  weekStart: number;
  weekEnd: number;
  kind: "scope-lock" | "bottleneck" | "portal" | "handover";
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
  rankedBottlenecks: { categoryName: string; rawScore: number }[],
  operationalNeeds: OperationalNeeds | null = null
): ScopeOfWorkPlan | null {
  if (!buildTier || buildTier === "custom") return null;
  const plan = TIER_PHASE_PLAN[buildTier];
  const wantsPortal = needsPortal(operationalNeeds);
  const portalWeeks = wantsPortal ? PORTAL_PHASE_WEEKS[buildTier] : 0;
  const totalWeeks = plan.totalWeeks + portalWeeks;

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

  if (wantsPortal) {
    phases.push({
      phaseNumber: phaseNumber++,
      name: "Client & Partner Portal",
      weekStart: cursor,
      weekEnd: cursor + portalWeeks - 1,
      kind: "portal",
      whatWeDo: [
        "Portal access and permissions setup",
        "Defining what each user type can see",
        "Login and account management",
        "Data walls that keep one customer's information separate from another's",
      ],
      whatYouGet: "A working client/partner portal, scoped to exactly what your customers and partners need to see.",
      whatWeNeed: "A list of exactly what each user type should be able to see, and any existing account or login system to migrate from.",
    });
    cursor += portalWeeks;
  }

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

  return { totalWeeks, phases };
}
