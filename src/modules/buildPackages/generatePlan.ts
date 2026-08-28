// Stage 9 — turns an assessment's already-computed Scope of Work
// (src/modules/assessments/scopeOfWork.ts) into real, trackable build
// package phases and scope items. Pure function, no DB access, so the
// exact plan a build package gets created with can be verified directly.
//
// Design note: a phase's own `whatWeDo` deliverables (already written per
// bottleneck category / portal / handover in reportCopy.ts) become that
// phase's scope items — not the flat, marketing-style
// BUILD_TIER_INFO[tier].included list from effectiveScope.ts, which is a
// different, coarser-grained summary built for the client report's
// Recommended Path comparison, not a phase-by-phase build checklist.
// Automation deliverables from the business profile (Stage 18) don't map
// to a specific bottleneck-category phase, so they attach to Training &
// Handover, where automations actually get wired up and validated.
// A Custom build has no fixed phase structure at all (computeScopeOfWork
// returns null) — it gets one fallback "Build" phase holding the generic
// "scoped individually" line plus any automation deliverables, so the
// create flow never silently drops data for Custom.

import { computeScopeOfWork, type ScopePhase } from "@/modules/assessments/scopeOfWork";
import { AUTOMATION_TASK_LABELS } from "@/modules/assessments/labels";
import type { BuildTier } from "@/modules/assessments/buildTiers";
import type { OperationalNeeds } from "@/modules/assessments/types";
import { type ScopeCategory } from "./labels";

export type GeneratedScopeItem = { category: ScopeCategory; description: string };

export type GeneratedPhase = {
  phaseNumber: number;
  name: string;
  weekStart: number;
  weekEnd: number;
  kind: ScopePhase["kind"] | "custom";
  categoryName: string | null;
  categoryScore: number | null;
  scopeItems: GeneratedScopeItem[];
};

/** Keyword-based, in priority order — a phase's whatWeDo text and the tier's flat scope lines are both short, plain-English deliverable descriptions, never ambiguous enough to need anything smarter. */
export function categorizeScopeText(text: string): ScopeCategory {
  const t = text.toLowerCase();
  if (t.includes("website")) return "website";
  if (t.includes("sop") || t.includes("document")) return "sop_documents";
  if (t.includes("dashboard")) return "dashboards";
  if (t.includes("automation")) return "automation";
  if (t.includes("subscription") || t.includes("support")) return "support";
  return "software";
}

function automationDeliverables(operationalNeeds: OperationalNeeds | null): GeneratedScopeItem[] {
  return (operationalNeeds?.automationTasks ?? []).map((task) => ({
    category: "automation" as const,
    description: `${AUTOMATION_TASK_LABELS[task]} automation`,
  }));
}

export function generateBuildPackagePlan(input: {
  buildTier: BuildTier;
  rankedBottlenecks: { categoryName: string; rawScore: number }[];
  operationalNeeds: OperationalNeeds | null;
}): GeneratedPhase[] {
  const scopePlan = computeScopeOfWork(input.buildTier, input.rankedBottlenecks, input.operationalNeeds);
  const automationItems = automationDeliverables(input.operationalNeeds);

  if (!scopePlan) {
    return [
      {
        phaseNumber: 1,
        name: "Build",
        weekStart: 1,
        weekEnd: 1,
        kind: "custom",
        categoryName: null,
        categoryScore: null,
        scopeItems: [{ category: "software", description: "Scope defined individually based on the client's needs" }, ...automationItems],
      },
    ];
  }

  return scopePlan.phases.map((p) => {
    const items: GeneratedScopeItem[] = p.whatWeDo.map((d) => ({ category: categorizeScopeText(d), description: d }));
    if (p.kind === "handover") items.push(...automationItems);
    return {
      phaseNumber: p.phaseNumber,
      name: p.name,
      weekStart: p.weekStart,
      weekEnd: p.weekEnd,
      kind: p.kind,
      categoryName: p.categoryName ?? null,
      categoryScore: p.categoryScore ?? null,
      scopeItems: items,
    };
  });
}
