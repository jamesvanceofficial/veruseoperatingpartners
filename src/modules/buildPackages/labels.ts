export const BUILD_PACKAGE_STATUSES = ["proposed", "sold", "in_progress", "complete", "cancelled"] as const;
export type BuildPackageStatus = (typeof BUILD_PACKAGE_STATUSES)[number];

export const BUILD_PACKAGE_STATUS_LABELS: Record<BuildPackageStatus, string> = {
  proposed: "Proposed",
  sold: "Sold",
  in_progress: "In Progress",
  complete: "Complete",
  cancelled: "Cancelled",
};

export const BUILD_PACKAGE_STATUS_TONE: Record<BuildPackageStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  proposed: "neutral",
  sold: "gold",
  in_progress: "yellow",
  complete: "green",
  cancelled: "red",
};

export const SCOPE_ITEM_STATUSES = ["not_started", "in_progress", "complete"] as const;
export type ScopeItemStatus = (typeof SCOPE_ITEM_STATUSES)[number];

export const SCOPE_ITEM_STATUS_LABELS: Record<ScopeItemStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
};

export const SCOPE_ITEM_STATUS_TONE: Record<ScopeItemStatus, "neutral" | "yellow" | "green"> = {
  not_started: "neutral",
  in_progress: "yellow",
  complete: "green",
};

export const SCOPE_CATEGORIES = ["website", "software", "sop_documents", "automation", "dashboards", "support"] as const;
export type ScopeCategory = (typeof SCOPE_CATEGORIES)[number];

export const SCOPE_CATEGORY_LABELS: Record<ScopeCategory, string> = {
  website: "Website",
  software: "Software",
  sop_documents: "SOPs & Documents",
  automation: "Automation",
  dashboards: "Dashboards",
  support: "Support",
};

/** Computed at read time from deposit_paid_at/balance_paid_at — never stored, same "derived, not redundant" convention as the assessment tier-override effective-value pattern. */
export const PAYMENT_STATUSES = ["unpaid", "deposit_paid", "paid_in_full"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  deposit_paid: "Deposit Paid",
  paid_in_full: "Paid in Full",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, "neutral" | "yellow" | "green"> = {
  unpaid: "neutral",
  deposit_paid: "yellow",
  paid_in_full: "green",
};
