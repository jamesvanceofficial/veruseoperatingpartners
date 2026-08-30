import type { TicketStatus, TicketPriority } from "./types";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: "New",
  open: "Open",
  waiting_on_client: "Waiting on Client",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_TONE: Record<TicketStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  new: "gold",
  open: "yellow",
  waiting_on_client: "neutral",
  resolved: "green",
  closed: "neutral",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_TONE: Record<TicketPriority, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  low: "neutral",
  medium: "gold",
  high: "yellow",
  urgent: "red",
};

/** A ticket is still "open" for SLA purposes in any of these statuses — closed/resolved tickets never show as overdue regardless of response_due_at. */
export const OPEN_STATUSES: TicketStatus[] = ["new", "open", "waiting_on_client"];
