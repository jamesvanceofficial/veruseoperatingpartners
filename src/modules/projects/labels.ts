export const PROJECT_STATUSES = ["not_started", "in_progress", "on_hold", "complete", "cancelled"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  on_hold: "On Hold",
  complete: "Complete",
  cancelled: "Cancelled",
};

export const PROJECT_STATUS_TONE: Record<ProjectStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  not_started: "neutral",
  in_progress: "gold",
  on_hold: "yellow",
  complete: "green",
  cancelled: "red",
};

/** Shared with tasks — same four values, same meaning. */
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_TONE: Record<Priority, "neutral" | "gold" | "yellow" | "red"> = {
  low: "neutral",
  medium: "gold",
  high: "yellow",
  urgent: "red",
};
