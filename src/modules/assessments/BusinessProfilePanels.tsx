import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatNumber } from "@/shared/format";
import {
  PHYSICAL_LOCATION_LABELS,
  SOCIAL_CHANNEL_LABELS,
  REVIEWS_STATUS_LABELS,
  EMAIL_DOMAIN_STATUS_LABELS,
  STAFFING_FEELING_LABELS,
  TIME_TO_FILL_LABELS,
} from "./labels";
import type { FinancialProfile, BusinessPresence, Workforce } from "./types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="text-[13px] text-[var(--cream)]">{value ?? "—"}</p>
    </div>
  );
}

function formatPct(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function hasAnyValue(obj: Record<string, unknown> | null): boolean {
  if (!obj) return false;
  return Object.values(obj).some((v) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0));
}

/**
 * The three Stage 12 panels — Financial Profile, Business Presence,
 * Workforce — captured once per Full Assessment as a point-in-time
 * snapshot. Each renders only if something was actually saved for it, so
 * an assessment nobody filled these in for doesn't show three empty
 * cards. Never rendered for a quick_scan (the caller, AssessmentReportView,
 * already never is).
 */
export function BusinessProfilePanels({
  financialProfile,
  businessPresence,
  workforce,
  revenuePerEmployee,
  realHeadcount,
}: {
  financialProfile: FinancialProfile | null;
  businessPresence: BusinessPresence | null;
  workforce: Workforce | null;
  revenuePerEmployee: number | null;
  realHeadcount: number | null;
}) {
  const showFinancial = hasAnyValue(financialProfile);
  const showPresence = hasAnyValue(businessPresence);
  const showWorkforce = hasAnyValue(workforce);

  if (!showFinancial && !showPresence && !showWorkforce) return null;

  return (
    <div className="flex flex-col gap-4">
      {showFinancial && financialProfile ? (
        <Card className="flex flex-col gap-1">
          <p className="mb-2 section-label">Financial Profile</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Last full year revenue" value={formatCurrency(financialProfile.lastFullYearRevenue)} />
            <Field label="Current year revenue" value={formatCurrency(financialProfile.currentYearRevenue)} />
            <Field label="Gross profit margin" value={formatPct(financialProfile.grossProfitMarginPct)} />
            <Field label="Net profit margin" value={formatPct(financialProfile.netProfitMarginPct)} />
            <Field label="Net profit last year" value={formatCurrency(financialProfile.netProfitLastYear)} />
            <Field label="Monthly overhead" value={formatCurrency(financialProfile.monthlyOverhead)} />
            <Field label="Payroll as % of revenue" value={formatPct(financialProfile.payrollPctOfRevenue)} />
            <Field label="Average revenue per employee" value={formatCurrency(revenuePerEmployee)} />
            <Field label="Cash on hand" value={formatCurrency(financialProfile.cashOnHand)} />
            <Field label="Accounts receivable outstanding" value={formatCurrency(financialProfile.accountsReceivableOutstanding)} />
            <Field label="Largest customer as % of revenue" value={formatPct(financialProfile.largestCustomerPctOfRevenue)} />
            <Field label="Owner's compensation" value={formatCurrency(financialProfile.ownersCompensation)} />
          </div>
        </Card>
      ) : null}

      {showPresence && businessPresence ? (
        <Card className="flex flex-col gap-3">
          <p className="mb-1 section-label">Business Presence</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Physical location"
              value={
                businessPresence.physicalLocation
                  ? `${PHYSICAL_LOCATION_LABELS[businessPresence.physicalLocation]}${businessPresence.physicalAddress ? ` · ${businessPresence.physicalAddress}` : ""}`
                  : null
              }
            />
            <Field
              label="Website"
              value={
                businessPresence.hasWebsite === null
                  ? null
                  : businessPresence.hasWebsite
                    ? (businessPresence.websiteUrl ?? "Yes")
                    : "No"
              }
            />
            <Field label="Online reviews" value={businessPresence.reviewsStatus ? REVIEWS_STATUS_LABELS[businessPresence.reviewsStatus] : null} />
            <Field label="Business email" value={businessPresence.emailDomainStatus ? EMAIL_DOMAIN_STATUS_LABELS[businessPresence.emailDomainStatus] : null} />
          </div>
          {businessPresence.socialChannels.length > 0 ? (
            <div>
              <p className="section-label">Active channels</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {businessPresence.socialChannels.map((c) => (
                  <Badge key={c}>{SOCIAL_CHANNEL_LABELS[c]}</Badge>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {showWorkforce && workforce ? (
        <Card className="flex flex-col gap-4">
          <p className="mb-1 section-label">Workforce</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="W2 employees" value={formatNumber(workforce.w2EmployeeCount)} />
            <Field label="1099 contractors" value={formatNumber(workforce.contractorCount)} />
            <Field label="VAs / offshore" value={formatNumber(workforce.vaCount)} />
            <Field label="In management" value={formatNumber(workforce.managementCount)} />
            <Field
              label="Actively hiring"
              value={workforce.activelyHiring === null ? null : workforce.activelyHiring ? (workforce.hiringRoles ?? "Yes") : "No"}
            />
            <Field label="Typical time to fill" value={workforce.timeToFill ? TIME_TO_FILL_LABELS[workforce.timeToFill] : null} />
            <Field label="Turnover, last 12 months" value={formatPct(workforce.turnoverPct)} />
            <Field label="Real headcount" value={formatNumber(realHeadcount)} />
          </div>

          {workforce.staffingFeeling || revenuePerEmployee !== null ? (
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--hairline)] pt-4 sm:grid-cols-2">
              <div>
                <p className="section-label">Stated staffing feeling</p>
                <p className="mt-1 text-[16px] font-semibold text-[var(--gold-light)]">
                  {workforce.staffingFeeling ? STAFFING_FEELING_LABELS[workforce.staffingFeeling] : "—"}
                </p>
              </div>
              <div>
                <p className="section-label">Revenue per person</p>
                <p className="mt-1 text-[16px] font-semibold text-[var(--gold-light)]">{formatCurrency(revenuePerEmployee)}</p>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
