import type { SupportTier } from "@/modules/assessments/buildTiers";

const BUSINESS_DAY_END_HOUR = 17;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function atHour(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Walks forward one calendar day at a time, skipping weekends, until `days` business days have passed. */
function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) remaining--;
  }
  return d;
}

/** The end of the next business day on/after `from` — `from` itself if it's already a weekday and this is "same business day". */
function endOfBusinessDay(from: Date, rollToNextIfWeekend: boolean): Date {
  if (isWeekend(from) && rollToNextIfWeekend) {
    const next = addBusinessDays(from, 1);
    return atHour(next, BUSINESS_DAY_END_HOUR);
  }
  return atHour(from, BUSINESS_DAY_END_HOUR);
}

/**
 * A ticket's response-due timestamp, computed once at creation from the
 * org's support tier — see each tier's `responseTime` label in
 * buildTiers.ts, which this must stay consistent with:
 *   base: "2 business days", growth: "Next business day",
 *   pro: "Same business day", enterprise: "Same day, with a dedicated
 *   contact" (tighter than pro's own same-day promise — a flat 4-hour
 *   window rather than end-of-day, since "dedicated contact" implies
 *   faster than the general same-day tier below it), custom: "Defined
 *   per engagement" (no fixed SLA — returns null).
 */
export function computeResponseDueDate(tier: SupportTier | null, createdAt: Date): Date | null {
  switch (tier) {
    case "base":
      return endOfBusinessDay(addBusinessDays(createdAt, 2), false);
    case "growth":
      return endOfBusinessDay(addBusinessDays(createdAt, 1), false);
    case "pro":
      return endOfBusinessDay(createdAt, true);
    case "enterprise": {
      const due = new Date(createdAt);
      due.setHours(due.getHours() + 4);
      return due;
    }
    case "custom":
    case null:
    default:
      return null;
  }
}

export type SlaState = { kind: "no_sla" } | { kind: "met" } | { kind: "overdue"; overdueBy: string } | { kind: "due_soon"; dueIn: string } | { kind: "on_track"; dueIn: string };

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(Math.abs(ms) / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * The ticket-list/detail display state for a response deadline. `now` is
 * a parameter (never `new Date()` called internally) so this stays a
 * pure, testable function — the caller stamps the current time once.
 */
export function getSlaState(responseDueAt: string | null, firstRespondedAt: string | null, now: Date): SlaState {
  if (!responseDueAt) return { kind: "no_sla" };
  if (firstRespondedAt) return { kind: "met" };

  const due = new Date(responseDueAt);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) return { kind: "overdue", overdueBy: formatDuration(diffMs) };
  if (diffMs < 1000 * 60 * 60 * 4) return { kind: "due_soon", dueIn: formatDuration(diffMs) };
  return { kind: "on_track", dueIn: formatDuration(diffMs) };
}
