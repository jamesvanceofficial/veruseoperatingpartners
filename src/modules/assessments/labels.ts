export const ASSESSMENT_TYPES = ["quick_scan", "full"] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  quick_scan: "Quick Scan",
  full: "Full Assessment",
};

export const ASSESSMENT_STATUSES = ["draft", "in_progress", "completed"] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
};

export const ASSESSMENT_STATUS_TONE: Record<AssessmentStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  draft: "neutral",
  in_progress: "yellow",
  completed: "green",
};

export const REVENUE_RANGES = ["Under $250K", "$250K–$1M", "$1M–$5M", "$5M–$10M", "$10M+"] as const;
