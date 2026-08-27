"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import {
  PHYSICAL_LOCATION_OPTIONS,
  PHYSICAL_LOCATION_LABELS,
  SOCIAL_CHANNELS,
  SOCIAL_CHANNEL_LABELS,
  REVIEWS_STATUS_OPTIONS,
  REVIEWS_STATUS_LABELS,
  EMAIL_DOMAIN_STATUS_OPTIONS,
  EMAIL_DOMAIN_STATUS_LABELS,
  STAFFING_FEELING_OPTIONS,
  STAFFING_FEELING_LABELS,
  TIME_TO_FILL_OPTIONS,
  TIME_TO_FILL_LABELS,
  PORTAL_NEED_OPTIONS,
  PORTAL_NEED_LABELS,
  AUTOMATION_TASKS,
  AUTOMATION_TASK_LABELS,
  type PhysicalLocation,
  type SocialChannel,
  type PortalNeed,
  type AutomationTask,
} from "./labels";
import type { FinancialProfile, BusinessPresence, Workforce, OperationalNeeds } from "./types";

function yesNo(value: boolean | null): string {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

/**
 * The pre-questions step of a Full Assessment (never quick_scan). Every
 * field is optional — "Continue to questions" always works, saving
 * whatever's filled in (even nothing). Uncontrolled via FormData like
 * OrganizationForm, except for the handful of fields that gate a
 * conditional field (physical address, website URL, hiring roles) and
 * the social-channels multi-select, which need local state.
 */
export function BusinessProfileForm({
  saveUrl,
  initialFinancial,
  initialPresence,
  initialWorkforce,
  initialOperationalNeeds,
  onContinue,
}: {
  saveUrl: string;
  initialFinancial: FinancialProfile | null;
  initialPresence: BusinessPresence | null;
  initialWorkforce: Workforce | null;
  initialOperationalNeeds: OperationalNeeds | null;
  onContinue: () => void;
}) {
  const [physicalLocation, setPhysicalLocation] = useState<PhysicalLocation | "">(initialPresence?.physicalLocation ?? "");
  const [hasWebsite, setHasWebsite] = useState(yesNo(initialPresence?.hasWebsite ?? null));
  const [activelyHiring, setActivelyHiring] = useState(yesNo(initialWorkforce?.activelyHiring ?? null));
  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>(initialPresence?.socialChannels ?? []);
  const [portalNeed, setPortalNeed] = useState<PortalNeed | "">(initialOperationalNeeds?.portalNeed ?? "");
  const [automationTasks, setAutomationTasks] = useState<AutomationTask[]>(initialOperationalNeeds?.automationTasks ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleChannel(channel: SocialChannel) {
    setSocialChannels((prev) => {
      if (channel === "none") return prev.includes("none") ? [] : ["none"];
      const withoutNone = prev.filter((c) => c !== "none");
      return withoutNone.includes(channel) ? withoutNone.filter((c) => c !== channel) : [...withoutNone, channel];
    });
  }

  function toggleAutomationTask(task: AutomationTask) {
    setAutomationTasks((prev) => (prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const g = (name: string) => form.get(name) ?? "";
    const body = {
      financial: {
        lastFullYearRevenue: g("lastFullYearRevenue"),
        currentYearRevenue: g("currentYearRevenue"),
        grossProfitMarginPct: g("grossProfitMarginPct"),
        netProfitMarginPct: g("netProfitMarginPct"),
        netProfitLastYear: g("netProfitLastYear"),
        monthlyOverhead: g("monthlyOverhead"),
        payrollPctOfRevenue: g("payrollPctOfRevenue"),
        cashOnHand: g("cashOnHand"),
        accountsReceivableOutstanding: g("accountsReceivableOutstanding"),
        largestCustomerPctOfRevenue: g("largestCustomerPctOfRevenue"),
        ownersCompensation: g("ownersCompensation"),
      },
      presence: {
        physicalLocation: physicalLocation || null,
        physicalAddress: g("physicalAddress"),
        hasWebsite: hasWebsite === "yes" ? true : hasWebsite === "no" ? false : null,
        websiteUrl: g("websiteUrl"),
        socialChannels,
        reviewsStatus: g("reviewsStatus") || null,
        emailDomainStatus: g("emailDomainStatus") || null,
      },
      workforce: {
        w2EmployeeCount: g("w2EmployeeCount"),
        contractorCount: g("contractorCount"),
        vaCount: g("vaCount"),
        managementCount: g("managementCount"),
        staffingFeeling: g("staffingFeeling") || null,
        activelyHiring: activelyHiring === "yes" ? true : activelyHiring === "no" ? false : null,
        hiringRoles: g("hiringRoles"),
        timeToFill: g("timeToFill") || null,
        turnoverPct: g("turnoverPct"),
      },
      operationalNeeds: {
        portalNeed: portalNeed || null,
        portalDetails: g("portalDetails"),
        automationTasks,
        automationTasksOther: g("automationTasksOther"),
      },
    };

    try {
      const res = await fetch(saveUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not save — try again.");
        setSubmitting(false);
        return;
      }
      onContinue();
    } catch {
      setError("Could not save — check your connection.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <span className="section-label">Before the questions</span>
        <h2 className="mt-1 text-[17px] font-semibold text-[var(--cream)]">Financial, Presence & Workforce Profile</h2>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">
          Every field here is optional. What you fill in sharpens the build recommendation and gives the report real numbers instead of just a
          score — and it&apos;s captured as a snapshot of this assessment, so it can be compared the next time around.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Financial Profile</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Last full year revenue" htmlFor="lastFullYearRevenue">
            <Input id="lastFullYearRevenue" name="lastFullYearRevenue" type="number" min={0} defaultValue={initialFinancial?.lastFullYearRevenue ?? ""} />
          </FormField>
          <FormField label="Current year revenue (projected or to date)" htmlFor="currentYearRevenue">
            <Input id="currentYearRevenue" name="currentYearRevenue" type="number" min={0} defaultValue={initialFinancial?.currentYearRevenue ?? ""} />
          </FormField>
          <FormField label="Gross profit margin (%)" htmlFor="grossProfitMarginPct">
            <Input id="grossProfitMarginPct" name="grossProfitMarginPct" type="number" min={0} max={100} defaultValue={initialFinancial?.grossProfitMarginPct ?? ""} />
          </FormField>
          <FormField label="Net profit margin (%)" htmlFor="netProfitMarginPct">
            <Input id="netProfitMarginPct" name="netProfitMarginPct" type="number" defaultValue={initialFinancial?.netProfitMarginPct ?? ""} />
          </FormField>
          <FormField label="Net profit last year" htmlFor="netProfitLastYear">
            <Input id="netProfitLastYear" name="netProfitLastYear" type="number" defaultValue={initialFinancial?.netProfitLastYear ?? ""} />
          </FormField>
          <FormField label="Monthly overhead / fixed expenses" htmlFor="monthlyOverhead">
            <Input id="monthlyOverhead" name="monthlyOverhead" type="number" min={0} defaultValue={initialFinancial?.monthlyOverhead ?? ""} />
          </FormField>
          <FormField label="Payroll as % of revenue" htmlFor="payrollPctOfRevenue">
            <Input id="payrollPctOfRevenue" name="payrollPctOfRevenue" type="number" min={0} max={100} defaultValue={initialFinancial?.payrollPctOfRevenue ?? ""} />
          </FormField>
          <FormField label="Cash on hand" htmlFor="cashOnHand">
            <Input id="cashOnHand" name="cashOnHand" type="number" min={0} defaultValue={initialFinancial?.cashOnHand ?? ""} />
          </FormField>
          <FormField label="Accounts receivable outstanding" htmlFor="accountsReceivableOutstanding">
            <Input id="accountsReceivableOutstanding" name="accountsReceivableOutstanding" type="number" min={0} defaultValue={initialFinancial?.accountsReceivableOutstanding ?? ""} />
          </FormField>
          <FormField label="Largest customer as % of revenue" htmlFor="largestCustomerPctOfRevenue">
            <Input id="largestCustomerPctOfRevenue" name="largestCustomerPctOfRevenue" type="number" min={0} max={100} defaultValue={initialFinancial?.largestCustomerPctOfRevenue ?? ""} />
          </FormField>
          <FormField label="Owner's compensation" htmlFor="ownersCompensation">
            <Input id="ownersCompensation" name="ownersCompensation" type="number" min={0} defaultValue={initialFinancial?.ownersCompensation ?? ""} />
          </FormField>
        </div>
        <p className="text-[11px] text-[var(--muted)]">Average revenue per employee is calculated automatically from revenue and headcount — no need to enter it.</p>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Business Presence</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Physical office location" htmlFor="physicalLocation">
            <Select id="physicalLocation" value={physicalLocation} onChange={(e) => setPhysicalLocation(e.target.value as PhysicalLocation)}>
              <option value="">Not answered</option>
              {PHYSICAL_LOCATION_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {PHYSICAL_LOCATION_LABELS[v]}
                </option>
              ))}
            </Select>
          </FormField>
          {physicalLocation === "yes" ? (
            <FormField label="Address" htmlFor="physicalAddress">
              <Input id="physicalAddress" name="physicalAddress" defaultValue={initialPresence?.physicalAddress ?? ""} />
            </FormField>
          ) : null}
          <FormField label="Website" htmlFor="hasWebsite">
            <Select id="hasWebsite" value={hasWebsite} onChange={(e) => setHasWebsite(e.target.value)}>
              <option value="">Not answered</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FormField>
          {hasWebsite === "yes" ? (
            <FormField label="Website URL" htmlFor="websiteUrl">
              <Input id="websiteUrl" name="websiteUrl" placeholder="https://" defaultValue={initialPresence?.websiteUrl ?? ""} />
            </FormField>
          ) : null}
          <FormField label="Do you collect and respond to online reviews?" htmlFor="reviewsStatus">
            <Select id="reviewsStatus" name="reviewsStatus" defaultValue={initialPresence?.reviewsStatus ?? ""}>
              <option value="">Not answered</option>
              {REVIEWS_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {REVIEWS_STATUS_LABELS[v]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Business email" htmlFor="emailDomainStatus">
            <Select id="emailDomainStatus" name="emailDomainStatus" defaultValue={initialPresence?.emailDomainStatus ?? ""}>
              <option value="">Not answered</option>
              {EMAIL_DOMAIN_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {EMAIL_DOMAIN_STATUS_LABELS[v]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Which of these does the business actively use?" htmlFor="social_channels">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SOCIAL_CHANNELS.map((channel) => (
              <label key={channel} className="flex items-center gap-2 text-[12.5px] text-[var(--cream)]">
                <input
                  type="checkbox"
                  checked={socialChannels.includes(channel)}
                  onChange={() => toggleChannel(channel)}
                  className="h-4 w-4 rounded border-[var(--hairline-strong)] bg-[var(--navy)] accent-[var(--gold)]"
                />
                {SOCIAL_CHANNEL_LABELS[channel]}
              </label>
            ))}
          </div>
        </FormField>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Workforce</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="W2 employees" htmlFor="w2EmployeeCount">
            <Input id="w2EmployeeCount" name="w2EmployeeCount" type="number" min={0} defaultValue={initialWorkforce?.w2EmployeeCount ?? ""} />
          </FormField>
          <FormField label="1099 contractors / subcontractors" htmlFor="contractorCount">
            <Input id="contractorCount" name="contractorCount" type="number" min={0} defaultValue={initialWorkforce?.contractorCount ?? ""} />
          </FormField>
          <FormField label="Virtual assistants / offshore staff" htmlFor="vaCount">
            <Input id="vaCount" name="vaCount" type="number" min={0} defaultValue={initialWorkforce?.vaCount ?? ""} />
          </FormField>
          <FormField label="Of those, in a management/supervisory role" htmlFor="managementCount">
            <Input id="managementCount" name="managementCount" type="number" min={0} defaultValue={initialWorkforce?.managementCount ?? ""} />
          </FormField>
          <FormField label="Do you feel you are" htmlFor="staffingFeeling">
            <Select id="staffingFeeling" name="staffingFeeling" defaultValue={initialWorkforce?.staffingFeeling ?? ""}>
              <option value="">Not answered</option>
              {STAFFING_FEELING_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {STAFFING_FEELING_LABELS[v]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Actively hiring right now?" htmlFor="activelyHiring">
            <Select id="activelyHiring" value={activelyHiring} onChange={(e) => setActivelyHiring(e.target.value)}>
              <option value="">Not answered</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FormField>
          {activelyHiring === "yes" ? (
            <FormField label="For what roles?" htmlFor="hiringRoles">
              <Input id="hiringRoles" name="hiringRoles" defaultValue={initialWorkforce?.hiringRoles ?? ""} />
            </FormField>
          ) : null}
          <FormField label="Typical time to fill an open position" htmlFor="timeToFill">
            <Select id="timeToFill" name="timeToFill" defaultValue={initialWorkforce?.timeToFill ?? ""}>
              <option value="">Not answered</option>
              {TIME_TO_FILL_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {TIME_TO_FILL_LABELS[v]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="% of your people who left in the last 12 months" htmlFor="turnoverPct">
            <Input id="turnoverPct" name="turnoverPct" type="number" min={0} max={100} defaultValue={initialWorkforce?.turnoverPct ?? ""} />
          </FormField>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="section-label">Operational Needs</p>
        <FormField label="Do your customers, clients, or partners need to log in and see their own information?" htmlFor="portalNeed">
          <Select id="portalNeed" value={portalNeed} onChange={(e) => setPortalNeed(e.target.value as PortalNeed)}>
            <option value="">Not answered</option>
            {PORTAL_NEED_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {PORTAL_NEED_LABELS[v]}
              </option>
            ))}
          </Select>
        </FormField>
        {portalNeed && portalNeed !== "no" ? (
          <FormField label="What would they need to see?" htmlFor="portalDetails">
            <Textarea id="portalDetails" name="portalDetails" rows={2} defaultValue={initialOperationalNeeds?.portalDetails ?? ""} />
          </FormField>
        ) : null}

        <FormField label="What repetitive tasks eat the most time in your business right now?" htmlFor="automationTasksOther">
          <Textarea id="automationTasksOther" name="automationTasksOther" rows={2} defaultValue={initialOperationalNeeds?.automationTasksOther ?? ""} />
        </FormField>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AUTOMATION_TASKS.map((task) => (
            <label key={task} className="flex items-center gap-2 text-[12.5px] text-[var(--cream)]">
              <input
                type="checkbox"
                checked={automationTasks.includes(task)}
                onChange={() => toggleAutomationTask(task)}
                className="h-4 w-4 rounded border-[var(--hairline-strong)] bg-[var(--navy)] accent-[var(--gold)]"
              />
              {AUTOMATION_TASK_LABELS[task]}
            </label>
          ))}
        </div>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting} className="w-full py-3.5 sm:w-auto">
          Continue to questions
        </Button>
      </div>
    </form>
  );
}
