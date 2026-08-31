import type { ProposalStatus, PaymentTerms } from "./types";

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

export const STATUS_TONE: Record<ProposalStatus, "neutral" | "gold" | "green" | "yellow" | "red"> = {
  draft: "neutral",
  sent: "yellow",
  accepted: "green",
  declined: "red",
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  paid_in_full: "Paid in Full",
  half_upfront: "Half Up Front, Balance on Completion",
};
