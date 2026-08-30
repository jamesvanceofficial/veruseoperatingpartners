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
import { CATEGORY_BUILD_DELIVERABLES } from "@/modules/assessments/reportCopy";
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

// ===========================================================
// Categorization — every deliverable string a build package can ever get
// is static copy (this table, the fixed phase text below, or a generated
// "<automation task> automation" line), never freeform user text. So
// rather than guess from keywords alone (the previous version's mistake —
// it fell back to "software" for almost everything that wasn't an obvious
// SOP/dashboard/automation match), each known string is mapped to its
// actual category by hand once here. An audit of a real generated
// package is what surfaced the bug: "Written job descriptions for every
// role," "A repeatable hiring pipeline," "Train the team on the new
// systems," "Confirm scope," and "Agree on success measures" were all
// landing on "software," which they plainly aren't.
// ===========================================================

/** CATEGORY_BUILD_DELIVERABLES (reportCopy.ts) — every bottleneck category's own deliverables, by exact text. */
const CATEGORY_DELIVERABLE_MAP: Record<string, ScopeCategory> = {
  // Operations
  "Workflow mapping across core operations": "systems_process",
  "Documented, step-by-step core processes": "sop_documents",
  "Quality checkpoints built into the workflow": "systems_process",
  "The system those processes run inside": "software",
  // Systems
  "Centralized customer and job tracking system": "software",
  "Connected data flow between core tools — no duplicate entry": "automation",
  "Automated alerts for what needs attention": "automation",
  "Documented backup and data-recovery process": "sop_documents",
  "Single system of record for financials": "software",
  // People
  "Written job descriptions for every role": "people_hiring",
  "A repeatable hiring pipeline": "people_hiring",
  "A structured onboarding track for new hires": "people_hiring",
  "A regular performance review cadence": "people_hiring",
  // Leadership
  "Written vision and core values": "sop_documents",
  "A regular leadership meeting cadence with a standing agenda": "systems_process",
  "A documented decision-making process": "sop_documents",
  "A leadership scorecard to track what matters": "dashboards_reporting",
  "A communication process for company updates": "systems_process",
  // Sales
  "Documented sales process, first contact to close": "sop_documents",
  "Pipeline tracked in one system": "software",
  "Standard pricing and proposal templates": "sop_documents",
  "Lead follow-up sequences": "automation",
  "A sales-to-fulfillment handoff process": "systems_process",
  // Finance
  "Monthly P&L review rhythm": "dashboards_reporting",
  "Margin visibility by product or service line": "dashboards_reporting",
  "Documented invoicing and collections process": "sop_documents",
  "A working budget tracked against actuals": "dashboards_reporting",
  "A documented pricing process": "sop_documents",
  // Technology
  "Documented technology and software inventory": "sop_documents",
  "Cybersecurity and access-control policy": "sop_documents",
  "Employee access provisioning and deprovisioning process": "systems_process",
  "Update and patching schedule": "systems_process",
  "Data backup and disaster-recovery plan": "sop_documents",
  // Marketing
  "Documented marketing plan": "sop_documents",
  "Lead-source tracking tied to actual customers": "dashboards_reporting",
  "Consistent brand applied across channels": "systems_process",
  "A content and posting calendar": "automation",
  "A follow-up sequence for leads who aren't ready to buy": "automation",
  // Vision
  "A written 3-5 year vision": "sop_documents",
  "Annual goals tied to that vision": "sop_documents",
  "A plan for what the business looks like without the owner day to day": "sop_documents",
  "A regular cadence to revisit and update the plan": "systems_process",
  // Enterprise Readiness
  "Documented SOPs for critical functions": "sop_documents",
  "An org structure that doesn't route every decision through the owner": "systems_process",
  "Clean, organized records a buyer or investor could review": "sop_documents",
  "A documented plan to reduce owner dependency": "sop_documents",
};

/** Foundation & Scope Lock, Client & Partner Portal, and Training & Handover — fixed text from scopeOfWork.ts, not keyed by category. */
const FIXED_PHASE_DELIVERABLE_MAP: Record<string, ScopeCategory> = {
  "Confirm scope": "systems_process",
  "Map current state": "systems_process",
  "Gather access and information": "systems_process",
  "Agree on success measures": "systems_process",
  "Portal access and permissions setup": "portal",
  "Defining what each user type can see": "portal",
  "Login and account management": "portal",
  "Data walls that keep one customer's information separate from another's": "portal",
  "Train the team on the new systems": "training_handover",
  "Document everything": "sop_documents",
  "Hand over": "training_handover",
  "Scope defined individually based on the client's needs": "systems_process",
};

const DELIVERABLE_CATEGORY_MAP: Record<string, ScopeCategory> = {
  ...Object.fromEntries(Object.values(CATEGORY_BUILD_DELIVERABLES).flat().map((text) => [text, CATEGORY_DELIVERABLE_MAP[text]])),
  ...FIXED_PHASE_DELIVERABLE_MAP,
};

/**
 * The exact-match table above covers every deliverable this app actually
 * generates. The keyword/phase-kind fallback exists only in case
 * reportCopy.ts's copy changes later and a new string shows up here
 * unmapped — it should never fire for anything generated today, so a
 * missed case can be added to the table above the moment it's noticed,
 * rather than the whole scheme silently reverting to a keyword guess.
 */
export function categorizeScopeItem(text: string, phaseKind: GeneratedPhase["kind"]): ScopeCategory {
  if (text.toLowerCase().includes("automation")) return "automation";
  const known = DELIVERABLE_CATEGORY_MAP[text];
  if (known) return known;
  if (text.toLowerCase().includes("website")) return "website";
  if (phaseKind === "portal") return "portal";
  if (phaseKind === "handover") return "training_handover";
  if (phaseKind === "bottleneck" && text.toLowerCase().match(/\bsop\b|document/)) return "sop_documents";
  return "systems_process";
}

function automationDeliverables(operationalNeeds: OperationalNeeds | null): GeneratedScopeItem[] {
  return (operationalNeeds?.automationTasks ?? []).map((task) => {
    const description = `${AUTOMATION_TASK_LABELS[task]} automation`;
    return { category: categorizeScopeItem(description, "handover"), description };
  });
}

export function generateBuildPackagePlan(input: {
  buildTier: BuildTier;
  rankedBottlenecks: { categoryName: string; rawScore: number }[];
  operationalNeeds: OperationalNeeds | null;
}): GeneratedPhase[] {
  const scopePlan = computeScopeOfWork(input.buildTier, input.rankedBottlenecks, input.operationalNeeds);
  const automationItems = automationDeliverables(input.operationalNeeds);

  if (!scopePlan) {
    const fallbackText = "Scope defined individually based on the client's needs";
    return [
      {
        phaseNumber: 1,
        name: "Build",
        weekStart: 1,
        weekEnd: 1,
        kind: "custom",
        categoryName: null,
        categoryScore: null,
        scopeItems: [{ category: categorizeScopeItem(fallbackText, "custom"), description: fallbackText }, ...automationItems],
      },
    ];
  }

  return scopePlan.phases.map((p) => {
    const items: GeneratedScopeItem[] = p.whatWeDo.map((d) => ({ category: categorizeScopeItem(d, p.kind), description: d }));
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
