export const TASK_STATUSES = ["open", "in_progress", "blocked", "complete", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  blocked: "Blocked",
  complete: "Complete",
  cancelled: "Cancelled",
};

export const TASK_STATUS_TONE: Record<TaskStatus, "neutral" | "gold" | "yellow" | "green" | "red"> = {
  open: "neutral",
  in_progress: "gold",
  blocked: "red",
  complete: "green",
  cancelled: "red",
};

export { PRIORITIES, PRIORITY_LABELS, PRIORITY_TONE, type Priority } from "@/modules/projects/labels";
