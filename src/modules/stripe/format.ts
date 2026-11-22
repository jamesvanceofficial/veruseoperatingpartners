/** Sync timestamps are shown with an explicit UTC label — the server's clock, and what "this month"/"next 30 days" are measured in. */
export function formatSyncTime(value: string | null | undefined): string {
  if (!value) return "never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(new Date(value));
}

export function formatUtcDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}
