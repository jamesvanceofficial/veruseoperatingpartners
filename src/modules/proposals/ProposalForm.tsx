"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { PROPOSAL_STATUSES, PAYMENT_TERMS } from "./types";
import { STATUS_LABELS, PAYMENT_TERMS_LABELS } from "./labels";
import type { Proposal } from "./types";

/**
 * Every field here is an editable copy generated onto the proposal at
 * creation time — nothing here writes back to the source assessment.
 * Org/assessment/build tier are the only things NOT editable (they're
 * what the generated content was built from); everything else, including
 * every section of prose, is free-form text a staff member can adjust
 * per client before sending.
 */
export function ProposalForm({ orgName, proposal }: { orgName: string; proposal: Proposal }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      companyName: String(form.get("companyName") ?? ""),
      proposalDate: String(form.get("proposalDate") ?? ""),
      status: String(form.get("status") ?? ""),
      constraintsText: String(form.get("constraintsText") ?? ""),
      recommendationText: String(form.get("recommendationText") ?? ""),
      scopeOfWorkText: String(form.get("scopeOfWorkText") ?? ""),
      includedText: String(form.get("includedText") ?? ""),
      excludedText: String(form.get("excludedText") ?? ""),
      timelineText: String(form.get("timelineText") ?? ""),
      buildPrice: String(form.get("buildPrice") ?? ""),
      paymentTerms: String(form.get("paymentTerms") ?? ""),
      supportPriceLabel: String(form.get("supportPriceLabel") ?? ""),
      firstYearValue: String(form.get("firstYearValue") ?? ""),
      investmentNotes: String(form.get("investmentNotes") ?? ""),
      verusResponsibilitiesText: String(form.get("verusResponsibilitiesText") ?? ""),
      clientResponsibilitiesText: String(form.get("clientResponsibilitiesText") ?? ""),
      nextStepsText: String(form.get("nextStepsText") ?? ""),
    };

    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/proposals/${proposal.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Organization" htmlFor="org_display">
            <Input id="org_display" value={orgName} disabled />
          </FormField>
          <FormField label="Company name on proposal" htmlFor="companyName">
            <Input id="companyName" name="companyName" required defaultValue={proposal.company_name} />
          </FormField>
          <FormField label="Proposal date" htmlFor="proposalDate">
            <Input id="proposalDate" name="proposalDate" type="date" required defaultValue={proposal.proposal_date} />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" required defaultValue={proposal.status}>
              {PROPOSAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Where Things Stand</p>
        <FormField label="Constraints (in plain language)" htmlFor="constraintsText">
          <Textarea id="constraintsText" name="constraintsText" rows={8} defaultValue={proposal.constraints_text ?? ""} />
        </FormField>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">What We Recommend</p>
        <FormField label="Recommendation" htmlFor="recommendationText">
          <Textarea id="recommendationText" name="recommendationText" rows={6} defaultValue={proposal.recommendation_text ?? ""} />
        </FormField>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Scope of Work</p>
        <FormField label="Phases and deliverables" htmlFor="scopeOfWorkText">
          <Textarea id="scopeOfWorkText" name="scopeOfWorkText" rows={12} defaultValue={proposal.scope_of_work_text ?? ""} />
        </FormField>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">What&apos;s Included, and What Isn&apos;t</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Included" htmlFor="includedText">
            <Textarea id="includedText" name="includedText" rows={8} defaultValue={proposal.included_text ?? ""} />
          </FormField>
          <FormField label="Excluded" htmlFor="excludedText">
            <Textarea id="excludedText" name="excludedText" rows={8} defaultValue={proposal.excluded_text ?? ""} />
          </FormField>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Timeline</p>
        <FormField label="Kickoff to handover" htmlFor="timelineText">
          <Textarea id="timelineText" name="timelineText" rows={4} defaultValue={proposal.timeline_text ?? ""} />
        </FormField>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Investment</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Build price" htmlFor="buildPrice">
            <Input id="buildPrice" name="buildPrice" type="number" min={0} required defaultValue={proposal.build_price ?? ""} />
          </FormField>
          <FormField label="Payment terms" htmlFor="paymentTerms">
            <Select id="paymentTerms" name="paymentTerms" required defaultValue={proposal.payment_terms}>
              {PAYMENT_TERMS.map((t) => (
                <option key={t} value={t}>
                  {PAYMENT_TERMS_LABELS[t]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Support subscription price label" htmlFor="supportPriceLabel">
            <Input id="supportPriceLabel" name="supportPriceLabel" defaultValue={proposal.support_price_label ?? ""} />
          </FormField>
          <FormField label="Combined first-year value" htmlFor="firstYearValue">
            <Input id="firstYearValue" name="firstYearValue" type="number" min={0} defaultValue={proposal.first_year_value ?? ""} />
          </FormField>
        </div>
        <FormField label="Investment notes" htmlFor="investmentNotes">
          <Textarea id="investmentNotes" name="investmentNotes" rows={4} defaultValue={proposal.investment_notes ?? ""} />
        </FormField>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Responsibilities</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="VERUS is responsible for" htmlFor="verusResponsibilitiesText">
            <Textarea id="verusResponsibilitiesText" name="verusResponsibilitiesText" rows={6} defaultValue={proposal.verus_responsibilities_text ?? ""} />
          </FormField>
          <FormField label="Client is responsible for" htmlFor="clientResponsibilitiesText">
            <Textarea id="clientResponsibilitiesText" name="clientResponsibilitiesText" rows={6} defaultValue={proposal.client_responsibilities_text ?? ""} />
          </FormField>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Next Steps</p>
        <FormField label="What happens after signing" htmlFor="nextStepsText">
          <Textarea id="nextStepsText" name="nextStepsText" rows={4} defaultValue={proposal.next_steps_text ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
