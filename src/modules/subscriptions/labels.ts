import type { SubscriptionStatus } from "./types";

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
  past_due: "Past Due",
};

export const STATUS_TONE: Record<SubscriptionStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  active: "green",
  paused: "yellow",
  cancelled: "neutral",
  past_due: "red",
};
