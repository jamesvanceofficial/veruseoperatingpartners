export const PIPELINE_STAGES = [
  "lead",
  "discovery_scheduled",
  "discovery_completed",
  "assessment_proposed",
  "assessment_sold",
  "build_package_proposed",
  "build_package_sold",
  "support_subscription_active",
  "lost",
  "nurture",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  lead: "Lead",
  discovery_scheduled: "Discovery Scheduled",
  discovery_completed: "Discovery Completed",
  assessment_proposed: "Assessment Proposed",
  assessment_sold: "Assessment Sold",
  build_package_proposed: "Build Package Proposed",
  build_package_sold: "Build Package Sold",
  support_subscription_active: "Support Subscription Active",
  lost: "Lost",
  nurture: "Nurture",
};

/** Won/active stages read green, dead reads red, parked reads yellow, everything still in motion reads gold. */
export const STAGE_TONE: Record<PipelineStage, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  lead: "gold",
  discovery_scheduled: "gold",
  discovery_completed: "gold",
  assessment_proposed: "gold",
  assessment_sold: "green",
  build_package_proposed: "gold",
  build_package_sold: "green",
  support_subscription_active: "green",
  lost: "red",
  nurture: "yellow",
};
