// Stage 10 requirement 6 — a task generated from a build package's scope
// item and that scope item must never disagree. Three statuses map
// cleanly both ways; a task marked "blocked" or "cancelled" has no clean
// scope-item equivalent, so it leaves the scope item exactly as it was —
// better than forcing a guess onto build-tracking data.

import type { TaskStatus } from "./labels";
import type { ScopeItemStatus } from "@/modules/buildPackages/labels";

export function taskStatusToScopeItemStatus(taskStatus: TaskStatus): ScopeItemStatus | null {
  if (taskStatus === "open") return "not_started";
  if (taskStatus === "in_progress") return "in_progress";
  if (taskStatus === "complete") return "complete";
  return null;
}

export function scopeItemStatusToTaskStatus(scopeItemStatus: ScopeItemStatus): TaskStatus {
  if (scopeItemStatus === "not_started") return "open";
  if (scopeItemStatus === "in_progress") return "in_progress";
  return "complete";
}
