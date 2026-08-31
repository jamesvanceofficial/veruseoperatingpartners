import type { BuildTier, SupportTier } from "@/modules/assessments/buildTiers";

export const PROPOSAL_STATUSES = ["draft", "sent", "accepted", "declined"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PAYMENT_TERMS = ["paid_in_full", "half_upfront"] as const;
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];

export type Proposal = {
  id: string;
  org_id: string;
  assessment_id: string | null;
  opportunity_id: string | null;
  status: ProposalStatus;
  prepared_by: string | null;
  proposal_date: string;
  company_name: string;
  enterprise_score: number | null;
  band_label: string | null;
  constraints_text: string | null;
  build_tier: BuildTier | null;
  recommendation_text: string | null;
  scope_of_work_text: string | null;
  included_text: string | null;
  excluded_text: string | null;
  timeline_text: string | null;
  build_price: number | null;
  payment_terms: PaymentTerms;
  deposit_amount: number | null;
  balance_amount: number | null;
  support_tier: SupportTier | null;
  support_price_label: string | null;
  first_year_value: number | null;
  investment_notes: string | null;
  verus_responsibilities_text: string | null;
  client_responsibilities_text: string | null;
  next_steps_text: string | null;
  signed_name: string | null;
  signed_title: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  share_token: string | null;
  share_token_expires_at: string | null;
  share_token_revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProposalListRow = {
  id: string;
  orgId: string;
  orgName: string;
  status: ProposalStatus;
  buildTier: BuildTier | null;
  buildPrice: number | null;
  proposalDate: string;
  sentAt: string | null;
};

export type ProposalDetail = {
  proposal: Proposal;
  orgName: string;
  preparedByName: string | null;
};
