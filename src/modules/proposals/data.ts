import type { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { getAssessmentReport } from "@/modules/assessments/data";
import { transitionStage } from "@/modules/opportunities/stageTransition";
import { generateProposalContent, investmentNoteFor } from "./generate";
import type { Proposal, ProposalListRow, ProposalDetail, ProposalStatus, PaymentTerms } from "./types";

function computePaymentSplit(buildPrice: number | null, terms: PaymentTerms): { deposit: number | null; balance: number | null } {
  if (buildPrice === null) return { deposit: null, balance: null };
  if (terms === "paid_in_full") return { deposit: buildPrice, balance: null };
  const half = Math.round((buildPrice / 2) * 100) / 100;
  return { deposit: half, balance: buildPrice - half };
}

export async function createProposalFromAssessment(admin: SupabaseClient, assessmentId: string, preparedBy: string | null): Promise<{ id: string }> {
  const { data: assessment, error: assessmentError } = await admin
    .from("assessments")
    .select("assessment_type, status, opportunity_id")
    .eq("id", assessmentId)
    .maybeSingle();
  if (assessmentError) throw assessmentError;
  if (!assessment) throw new Error("Assessment not found.");
  if (assessment.assessment_type !== "full" || assessment.status !== "completed") {
    throw new Error("A proposal can only be generated from a completed Full Assessment.");
  }

  const report = await getAssessmentReport(admin, assessmentId);
  if (!report) throw new Error("Could not load this assessment's report.");

  const content = generateProposalContent(report);
  const { deposit, balance } = computePaymentSplit(content.buildPrice, "paid_in_full");

  const { data, error } = await admin
    .from("proposals")
    .insert({
      org_id: report.assessment.org_id,
      assessment_id: assessmentId,
      opportunity_id: assessment.opportunity_id,
      prepared_by: preparedBy,
      company_name: content.companyName,
      enterprise_score: content.enterpriseScore,
      band_label: content.bandLabel,
      constraints_text: content.constraintsText,
      build_tier: content.buildTier,
      recommendation_text: content.recommendationText,
      scope_of_work_text: content.scopeOfWorkText,
      included_text: content.includedText,
      excluded_text: content.excludedText,
      timeline_text: content.timelineText,
      build_price: content.buildPrice,
      payment_terms: "paid_in_full",
      deposit_amount: deposit,
      balance_amount: balance,
      support_tier: content.supportTier,
      support_price_label: content.supportPriceLabel,
      first_year_value: content.firstYearValue,
      investment_notes: investmentNoteFor(content.supportTier),
      verus_responsibilities_text: content.verusResponsibilitiesText,
      client_responsibilities_text: content.clientResponsibilitiesText,
      next_steps_text: content.nextStepsText,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function getProposalByAssessmentId(supabase: SupabaseClient, assessmentId: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.from("proposals").select("id").eq("assessment_id", assessmentId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as { id: string } | null;
}

async function attachOrgNames(supabase: SupabaseClient, orgIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(orgIds)];
  if (unique.length === 0) return new Map();
  const { data, error } = await supabase.from("organizations").select("id, name").in("id", unique);
  if (error) throw error;
  return new Map((data ?? []).map((o) => [o.id as string, o.name as string]));
}

export async function listProposals(supabase: SupabaseClient, filters: { orgId?: string; status?: ProposalStatus } = {}): Promise<ProposalListRow[]> {
  let query = supabase.from("proposals").select("id, org_id, status, build_tier, build_price, proposal_date, sent_at").order("created_at", { ascending: false });
  if (filters.orgId) query = query.eq("org_id", filters.orgId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const orgNameMap = await attachOrgNames(supabase, rows.map((r) => r.org_id as string));
  return rows.map((r) => ({
    id: r.id as string,
    orgId: r.org_id as string,
    orgName: orgNameMap.get(r.org_id as string) ?? "Unknown organization",
    status: r.status as ProposalStatus,
    buildTier: r.build_tier,
    buildPrice: r.build_price as number | null,
    proposalDate: r.proposal_date as string,
    sentAt: r.sent_at as string | null,
  }));
}

export async function getProposalDetail(supabase: SupabaseClient, id: string): Promise<ProposalDetail | null> {
  const { data, error } = await supabase.from("proposals").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const proposal = data as Proposal;

  const [orgResult, preparedByResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", proposal.org_id).maybeSingle(),
    proposal.prepared_by ? supabase.from("profiles").select("full_name, email").eq("id", proposal.prepared_by).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  if (orgResult.error) throw orgResult.error;

  const preparedBy = preparedByResult.data as { full_name: string | null; email: string | null } | null;

  return {
    proposal,
    orgName: (orgResult.data?.name as string | undefined) ?? "Unknown organization",
    preparedByName: preparedBy ? (preparedBy.full_name ?? preparedBy.email) : null,
  };
}

export async function getProposalByToken(admin: SupabaseClient, token: string): Promise<Proposal | null> {
  const { data, error } = await admin.from("proposals").select("*").eq("share_token", token).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const proposal = data as Proposal;
  if (proposal.share_token_revoked_at) return null;
  if (proposal.share_token_expires_at && new Date(proposal.share_token_expires_at).getTime() < Date.now()) return null;
  return proposal;
}

export type ProposalUpdateInput = Partial<{
  companyName: string;
  proposalDate: string;
  enterpriseScore: number | null;
  bandLabel: string | null;
  constraintsText: string | null;
  buildTier: string | null;
  recommendationText: string | null;
  scopeOfWorkText: string | null;
  includedText: string | null;
  excludedText: string | null;
  timelineText: string | null;
  buildPrice: number | null;
  paymentTerms: PaymentTerms;
  supportTier: string | null;
  supportPriceLabel: string | null;
  firstYearValue: number | null;
  investmentNotes: string | null;
  verusResponsibilitiesText: string | null;
  clientResponsibilitiesText: string | null;
  nextStepsText: string | null;
  status: ProposalStatus;
}>;

const FIELD_MAP: Record<string, string> = {
  companyName: "company_name",
  proposalDate: "proposal_date",
  enterpriseScore: "enterprise_score",
  bandLabel: "band_label",
  constraintsText: "constraints_text",
  buildTier: "build_tier",
  recommendationText: "recommendation_text",
  scopeOfWorkText: "scope_of_work_text",
  includedText: "included_text",
  excludedText: "excluded_text",
  timelineText: "timeline_text",
  buildPrice: "build_price",
  supportTier: "support_tier",
  supportPriceLabel: "support_price_label",
  firstYearValue: "first_year_value",
  investmentNotes: "investment_notes",
  verusResponsibilitiesText: "verus_responsibilities_text",
  clientResponsibilitiesText: "client_responsibilities_text",
  nextStepsText: "next_steps_text",
  status: "status",
};

export async function updateProposal(admin: SupabaseClient, id: string, input: ProposalUpdateInput): Promise<void> {
  const patch: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(FIELD_MAP)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) patch[column] = value;
  }

  // Payment terms changes recompute the split from whichever build price ends up in effect (the patch's own, or the current stored one).
  if (input.paymentTerms !== undefined) {
    patch.payment_terms = input.paymentTerms;
    const effectivePrice = input.buildPrice !== undefined ? input.buildPrice : (await admin.from("proposals").select("build_price").eq("id", id).maybeSingle()).data?.build_price ?? null;
    const { deposit, balance } = computePaymentSplit(effectivePrice, input.paymentTerms);
    patch.deposit_amount = deposit;
    patch.balance_amount = balance;
  } else if (input.buildPrice !== undefined) {
    const { data: current } = await admin.from("proposals").select("payment_terms").eq("id", id).maybeSingle();
    const terms = (current?.payment_terms as PaymentTerms | undefined) ?? "paid_in_full";
    const { deposit, balance } = computePaymentSplit(input.buildPrice, terms);
    patch.deposit_amount = deposit;
    patch.balance_amount = balance;
  }

  if (Object.keys(patch).length === 0) return;
  const { error } = await admin.from("proposals").update(patch).eq("id", id);
  if (error) throw error;
}

export async function markProposalSent(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("proposals").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

/** Called from the public share-link page when a client accepts — also moves the linked opportunity to Build Package Sold, same stage a build package creation would move it to (a no-op if it's already there by the time one actually gets created). changedBy is null here since a client accepting has no staff profile. */
export async function recordProposalAcceptance(admin: SupabaseClient, id: string, input: { signedName: string; signedTitle: string }): Promise<void> {
  const { data: proposal, error: fetchError } = await admin.from("proposals").select("opportunity_id").eq("id", id).maybeSingle();
  if (fetchError) throw fetchError;

  const { error } = await admin
    .from("proposals")
    .update({ status: "accepted", accepted_at: new Date().toISOString(), signed_name: input.signedName, signed_title: input.signedTitle })
    .eq("id", id);
  if (error) throw error;

  if (proposal?.opportunity_id) {
    const { data: opportunity } = await admin.from("opportunities").select("stage").eq("id", proposal.opportunity_id).maybeSingle();
    if (opportunity) {
      await transitionStage(admin, proposal.opportunity_id, opportunity.stage as string, "build_package_sold", null);
    }
  }
}

export async function recordProposalDecline(admin: SupabaseClient, id: string, reason: string | null): Promise<void> {
  const { error } = await admin.from("proposals").update({ status: "declined", declined_at: new Date().toISOString(), decline_reason: reason }).eq("id", id);
  if (error) throw error;
}

export async function generateProposalShareLink(admin: SupabaseClient, proposalId: string, expiresInDays: number | null): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null;
  const { error } = await admin.from("proposals").update({ share_token: token, share_token_expires_at: expiresAt, share_token_revoked_at: null }).eq("id", proposalId);
  if (error) throw error;
  return token;
}

export async function revokeProposalShareLink(admin: SupabaseClient, proposalId: string): Promise<void> {
  const { error } = await admin.from("proposals").update({ share_token_revoked_at: new Date().toISOString() }).eq("id", proposalId);
  if (error) throw error;
}

export async function getProposalDeletePreview(supabase: SupabaseClient, id: string): Promise<{ companyName: string; status: ProposalStatus }> {
  const { data, error } = await supabase.from("proposals").select("company_name, status").eq("id", id).maybeSingle();
  if (error) throw error;
  return { companyName: (data?.company_name as string | undefined) ?? "this proposal", status: (data?.status as ProposalStatus | undefined) ?? "draft" };
}

export async function deleteProposal(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from("proposals").delete().eq("id", id);
  if (error) throw error;
}
