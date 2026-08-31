import { Card } from "@/shared/ui/Card";
import { BrandMark } from "@/shared/ui/BrandMark";
import { formatCurrency, formatDate } from "@/shared/format";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import { PAYMENT_TERMS_LABELS } from "./labels";
import type { Proposal } from "./types";

function TextBlock({ text }: { text: string | null }) {
  if (!text) return <p className="text-[13px] text-[var(--muted)]">—</p>;
  return (
    <div className="flex flex-col gap-3">
      {text.split("\n\n").map((block, i) => (
        <p key={i} className="cr-avoid-break whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--cream)]">
          {block}
        </p>
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="section-label text-[var(--gold-light)]">{eyebrow}</span>
      <h2 className="text-[20px] font-semibold text-[var(--cream)]">{title}</h2>
    </div>
  );
}

/**
 * The one document — used by BOTH the internal preview (staff, no edit
 * controls live here, those are all on the separate /edit page) and the
 * public share-link page a client actually signs from. Wrapped in
 * `.client-report` for print by whichever page renders it, reusing the
 * exact existing light print stylesheet rather than a new one.
 */
export function ProposalDocument({ proposal, preparedByName }: { proposal: Proposal; preparedByName: string | null }) {
  const buildTierInfo = proposal.build_tier ? BUILD_TIER_INFO[proposal.build_tier] : null;

  return (
    <div className="flex flex-col gap-10">
      {/* COVER */}
      <section className="cr-cover cr-avoid-break flex flex-col items-center justify-center gap-6 py-16 text-center">
        <span className="section-label text-[var(--muted)]">Confidential</span>
        <BrandMark size="cover" />
        <div>
          <p className="section-label text-[var(--gold-light)]">Proposal</p>
          <h1 className="mt-2 text-[30px] font-semibold text-[var(--cream)]">{proposal.company_name}</h1>
        </div>
        <p className="text-[13px] text-[var(--muted)]">{formatDate(proposal.proposal_date)}</p>
        {preparedByName ? <p className="text-[12px] text-[var(--muted)]">Prepared by {preparedByName}</p> : null}
      </section>

      {/* WHERE THINGS STAND */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Where Things Stand" title="Your assessment results" />
        {proposal.enterprise_score !== null ? (
          <Card strong className="cr-avoid-break flex items-center justify-between gap-4">
            <div>
              <p className="section-label">Enterprise Score</p>
              <p className="text-[28px] font-semibold cr-tone-gold">
                {proposal.enterprise_score} <span className="text-[14px] font-normal text-[var(--muted)]">/ 100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="section-label">Band</p>
              <p className="text-[16px] font-semibold text-[var(--cream)]">{proposal.band_label ?? "—"}</p>
            </div>
          </Card>
        ) : null}
        <div>
          <p className="section-label mb-2">Your Biggest Constraints</p>
          <TextBlock text={proposal.constraints_text} />
        </div>
      </section>

      {/* WHAT WE RECOMMEND */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="What We Recommend" title={buildTierInfo?.label ?? "Recommended build"} />
        <TextBlock text={proposal.recommendation_text} />
      </section>

      {/* SCOPE OF WORK */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Scope of Work" title="How this gets built" />
        <TextBlock text={proposal.scope_of_work_text} />
      </section>

      {/* INCLUDED / EXCLUDED */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Scope" title="What's included, and what isn't" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="section-label mb-2 cr-tone-green">Included</p>
            <TextBlock text={proposal.included_text} />
          </div>
          <div>
            <p className="section-label mb-2 cr-tone-red">Excluded</p>
            <TextBlock text={proposal.excluded_text} />
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Timeline" title="Kickoff to handover" />
        <TextBlock text={proposal.timeline_text} />
      </section>

      {/* INVESTMENT */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Investment" title="What this costs" />
        <Card strong className="cr-avoid-break flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[var(--cream)]">{buildTierInfo?.label ?? "Build"}</p>
            <p className="text-[19px] font-semibold cr-tone-gold">{formatCurrency(proposal.build_price)}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 border-y border-[var(--hairline)] py-3 sm:grid-cols-2">
            <div>
              <p className="section-label">Payment Terms</p>
              <p className="text-[13px] text-[var(--cream)]">{PAYMENT_TERMS_LABELS[proposal.payment_terms]}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="section-label">{proposal.payment_terms === "paid_in_full" ? "Due at Signing" : "Due at Kickoff"}</p>
                <p className="text-[13px] text-[var(--cream)]">{formatCurrency(proposal.deposit_amount)}</p>
              </div>
              {proposal.balance_amount !== null ? (
                <div>
                  <p className="section-label">Due on Completion</p>
                  <p className="text-[13px] text-[var(--cream)]">{formatCurrency(proposal.balance_amount)}</p>
                </div>
              ) : null}
            </div>
          </div>
          <TextBlock text={proposal.investment_notes} />
          {proposal.first_year_value !== null ? (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] pt-3">
              <p className="text-[13px] font-semibold text-[var(--cream)]">Combined First-Year Value</p>
              <p className="text-[16px] font-semibold cr-tone-gold">{formatCurrency(proposal.first_year_value)}</p>
            </div>
          ) : null}
        </Card>
      </section>

      {/* RESPONSIBILITIES */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Responsibilities" title="Who does what" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="section-label mb-2">VERUS Is Responsible For</p>
            <TextBlock text={proposal.verus_responsibilities_text} />
          </div>
          <div>
            <p className="section-label mb-2">You're Responsible For</p>
            <TextBlock text={proposal.client_responsibilities_text} />
          </div>
        </div>
      </section>

      {/* NEXT STEPS */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Next Steps" title="What happens after you sign" />
        <TextBlock text={proposal.next_steps_text} />
      </section>

      {/* ACCEPTANCE */}
      <section className="cr-page-break cr-avoid-break flex flex-col gap-6 py-10">
        <SectionHeading eyebrow="Acceptance" title="Signature" />
        {proposal.status === "accepted" && proposal.signed_name ? (
          <Card strong className="cr-avoid-break flex flex-col gap-2">
            <p className="text-[13px] text-[var(--cream)]">
              Accepted by <span className="font-semibold">{proposal.signed_name}</span>
              {proposal.signed_title ? `, ${proposal.signed_title}` : ""}
            </p>
            <p className="text-[12px] text-[var(--muted)]">{proposal.accepted_at ? formatDate(proposal.accepted_at) : ""}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="border-b border-[var(--hairline-strong)] pb-1">
                <p className="text-[11px] text-[var(--muted)]">Signature</p>
              </div>
              <div className="border-b border-[var(--hairline-strong)] pb-1">
                <p className="text-[11px] text-[var(--muted)]">Printed Name</p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="border-b border-[var(--hairline-strong)] pb-1">
                <p className="text-[11px] text-[var(--muted)]">Title</p>
              </div>
              <div className="border-b border-[var(--hairline-strong)] pb-1">
                <p className="text-[11px] text-[var(--muted)]">Date</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
