// Stage 18 — the ACTUAL scope for a given assessment's build: the tier's
// static included/excluded list, plus a portal deliverable (only if this
// business actually needs one, scaled to what the tier can deliver) and
// one named deliverable per automation task the client asked for. Every
// consumer of "the build's scope" (the internal recommendation panel, the
// client report's Recommended Path and Scope of Work) should read scope
// through this, never BUILD_TIER_INFO[tier].included directly, so a
// client's portal/automation needs always show up consistently wherever
// scope is displayed.

import { BUILD_TIER_INFO, type BuildTier } from "./buildTiers";
import { AUTOMATION_TASK_LABELS } from "./labels";
import type { OperationalNeeds } from "./types";

/** Portal scope scales with tier, never all-or-nothing — a client needing a portal gets a portal at Foundation too, just a simpler one. */
export const PORTAL_SCOPE_BY_TIER: Record<Exclude<BuildTier, "custom">, string> = {
  foundation: "Client/partner portal — simple, view-only access to their own information",
  growth: "Client/partner portal — view their information, exchange documents, and interact with their account",
  enterprise: "Client/partner portal — full multi-role portal with tailored permissions per user type",
};

export function needsPortal(needs: OperationalNeeds | null): boolean {
  return Boolean(needs?.portalNeed) && needs?.portalNeed !== "no";
}

export type EffectiveScope = { included: string[]; excluded: string[] };

export function getEffectiveBuildScope(buildTier: BuildTier, needs: OperationalNeeds | null): EffectiveScope {
  const info = BUILD_TIER_INFO[buildTier];
  const included = [...info.included];
  // The subscription line is always last (see buildTiers.ts) — pull it
  // off, add the client-specific deliverables, then put it back, so it
  // stays last regardless of what gets injected.
  const subscriptionLine = included.pop();

  if (buildTier !== "custom" && needsPortal(needs)) {
    included.push(PORTAL_SCOPE_BY_TIER[buildTier]);
  }

  for (const task of needs?.automationTasks ?? []) {
    included.push(`${AUTOMATION_TASK_LABELS[task]} automation`);
  }

  if (subscriptionLine) included.push(subscriptionLine);

  return { included, excluded: info.excluded };
}
