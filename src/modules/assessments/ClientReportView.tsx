import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { BrandMark } from "@/shared/ui/BrandMark";
import { cn } from "@/shared/ui/cn";
import { formatCurrency, formatDate, formatNumber } from "@/shared/format";
import { categoryScoreTone } from "./scoreTone";
import { CATEGORY_BOTTLENECK_COPY } from "./bottleneckCopy";
import { WEIGHTING_RATIONALE, CATEGORY_SCORE_MEANING, CATEGORY_TYPICAL_COST, CATEGORY_FIX_INVOLVES, NEXT_STEPS, VERUS_CONTACT } from "./reportCopy";
import {
  BUILD_TIER_INFO,
  SUPPORT_TIER_INFO,
  SUPPORT_SUBSCRIPTION_NAME,
  STABILIZATION_PERIOD_DAYS,
  type SupportTier,
} from "./buildTiers";
import { BusinessProfilePanels } from "./BusinessProfilePanels";
import { computeScopeOfWork } from "./scopeOfWork";
import { getEffectiveBuildScope } from "./effectiveScope";
import { getSupportTierValueJustification, MANAGED_IT_PER_USER_RANGE } from "./supportTierValue";
import { FLAT_FEE_ADD_ONS, VA_ASSIGNMENT_FEE_LABEL, VA_ASSIGNMENT_FEE_DESCRIPTION, VA_MINIMUM_HOURS_PER_WEEK, VA_ROLES, VA_TERMS } from "./supportAddOns";
import { redactPriceMentions, PRICING_HIDDEN_MESSAGE, PRICING_HIDDEN_INLINE } from "./pricingGate";
import type { AssessmentReport, Band } from "./types";

const SUPPORT_LADDER: Exclude<SupportTier, "custom">[] = ["base", "growth", "pro", "enterprise"];

const TONE_CLASS: Record<"green" | "yellow" | "red", string> = {
  green: "cr-tone-green",
  yellow: "cr-tone-yellow",
  red: "cr-tone-red",
};
const TONE_BAR: Record<"green" | "yellow" | "red", string> = {
  green: "bg-[var(--green)]",
  yellow: "bg-[var(--yellow)]",
  red: "bg-[var(--red)]",
};

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="cr-avoid-break flex flex-col gap-1">
      <span className="section-label cr-tone-gold">{eyebrow}</span>
      <h2 className="text-[22px] font-semibold text-[var(--cream)]">{title}</h2>
      <div className="mt-1 h-px w-16 bg-[var(--gold)]" />
    </div>
  );
}

/** A whole card's worth of pricing content, replaced with one deliberate line — never a blank space — while pricing_released is off. */
function PricingGateCard({ label }: { label: string }) {
  return (
    <Card strong className="cr-avoid-break flex flex-col items-center gap-1 py-6 text-center">
      <p className="section-label">{label}</p>
      <p className="text-[13px] italic text-[var(--muted)]">{PRICING_HIDDEN_MESSAGE}</p>
    </Card>
  );
}

/**
 * The client-facing executive document — distinct from AssessmentReportView
 * (the internal admin screen). No overrides, no Save buttons, no delete —
 * purely presentational. Stays in the dark COMPASS theme on screen; the
 * .client-report wrapper (see globals.css) converts it to a light,
 * navy/gold-accented print document. Full Assessment, completed, only —
 * the caller (the report page) is responsible for that gate.
 */
export function ClientReportView({
  report,
  bands,
  preparedByName,
}: {
  report: AssessmentReport;
  bands: Band[];
  preparedByName: string;
}) {
  const {
    assessment,
    orgName,
    bandLabel,
    bandDescription,
    categoryScores,
    notApplicableCount,
    financialProfile,
    businessPresence,
    workforce,
    operationalNeeds,
    revenuePerEmployee,
    realHeadcount,
  } = report;

  const byWeight = [...categoryScores].sort((a, b) => b.weight - a.weight);
  const top3 = [...categoryScores].sort((a, b) => a.bottleneckRank - b.bottleneckRank).slice(0, 3);

  const effectiveBuildTier = assessment.build_tier_override ?? assessment.recommended_build_tier;
  const effectiveSupportTier = assessment.support_tier_override ?? assessment.recommended_support_tier;
  const buildInfo = effectiveBuildTier ? BUILD_TIER_INFO[effectiveBuildTier] : null;
  const supportInfo = effectiveSupportTier ? SUPPORT_TIER_INFO[effectiveSupportTier] : null;
  const firstYearValue = buildInfo?.price != null && supportInfo?.price != null ? buildInfo.price + supportInfo.price * 9 : null;
  // The actual scope for THIS client — the tier's list plus a portal
  // deliverable (if needed) and one named line per automation task asked
  // for, never a portal/automation exclusion baked into the tier itself.
  const effectiveScope = effectiveBuildTier ? getEffectiveBuildScope(effectiveBuildTier, operationalNeeds) : null;

  const rankedBottlenecks = [...categoryScores]
    .sort((a, b) => a.bottleneckRank - b.bottleneckRank)
    .map((c) => ({ categoryName: c.categoryName, rawScore: c.rawScore }));
  const scopePlan = computeScopeOfWork(effectiveBuildTier, rankedBottlenecks, operationalNeeds);

  const score = assessment.enterprise_score ?? 0;
  const preparedDate = assessment.completed_at ?? assessment.created_at;
  // Stage 22 — findings are always visible; every dollar figure stays
  // hidden behind a deliberate placeholder until staff releases pricing.
  const pricingReleased = assessment.pricing_released;

  return (
    <div className="client-report flex flex-col">
      <div className="cr-footer">
        <span>
          {orgName} · Confidential
        </span>
        <span className="cr-page-number" />
      </div>

      {/* 1. COVER */}
      <section className="cr-cover cr-avoid-break flex flex-col items-center justify-center gap-8 py-24 text-center">
        <BrandMark size="lg" />
        <div className="flex flex-col items-center gap-3">
          <span className="section-label cr-tone-gold">Confidential</span>
          <h1 className="text-[38px] font-semibold leading-tight text-[var(--cream)]">Business Assessment</h1>
          <p className="text-[22px] font-medium text-[var(--gold-light)] cr-tone-gold">{orgName}</p>
        </div>
        <div className="flex flex-col items-center gap-1 text-[13px] text-[var(--muted)]">
          <p>Date prepared: {formatDate(preparedDate)}</p>
          <p>Prepared by: {preparedByName}</p>
        </div>
      </section>

      {/* 2. EXECUTIVE SUMMARY */}
      <section className="cr-page-break flex flex-col gap-5 py-10">
        <SectionHeading eyebrow="Executive Summary" title="Where things stand" />
        <Card strong className="cr-avoid-break flex flex-col gap-2">
          <p className="text-[13.5px] leading-relaxed text-[var(--cream)]">
            {orgName} scored <span className="font-semibold cr-tone-gold">{score} out of 100</span> — the{" "}
            <span className="font-semibold cr-tone-gold">{bandLabel ?? "—"}</span> band.{" "}
            {bandDescription}
          </p>
        </Card>

        <div className="flex flex-col gap-2">
          <p className="section-label">The three things holding it back</p>
          <ul className="flex flex-col gap-2">
            {top3.map((c, i) => (
              <li key={c.categoryId} className="cr-avoid-break flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--cream)]">
                <span className="font-tabular font-semibold cr-tone-gold">{i + 1}.</span>
                <span>
                  <span className="font-semibold">{c.categoryName}.</span> {CATEGORY_BOTTLENECK_COPY[c.categoryName] ?? ""}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {buildInfo && supportInfo ? (
          <>
            <div className="flex flex-col gap-2">
              <p className="section-label">What we recommend</p>
              <p className="text-[13px] leading-relaxed text-[var(--cream)]">
                {redactPriceMentions(assessment.build_recommendation_reasoning ?? "", pricingReleased)}
              </p>
            </div>
            {pricingReleased ? (
              <Card className="cr-avoid-break flex flex-col gap-1">
                <p className="section-label">What it costs, and what it produces</p>
                <p className="text-[13px] leading-relaxed text-[var(--cream)]">
                  {buildInfo.priceLabel} to build {buildInfo.label.replace(" Build", "")}-level systems. {SUPPORT_SUBSCRIPTION_NAME} continues at{" "}
                  {supportInfo.priceLabel} after the first {STABILIZATION_PERIOD_DAYS} days, included in the build.{" "}
                  {firstYearValue !== null ? (
                    <>
                      Combined, that&apos;s <span className="font-semibold cr-tone-gold">{formatCurrency(firstYearValue)}</span> in year one.
                    </>
                  ) : null}
                </p>
              </Card>
            ) : (
              <PricingGateCard label="What it costs, and what it produces" />
            )}
          </>
        ) : null}
      </section>

      {/* 3. HOW THIS WAS MEASURED */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Methodology" title="How this was measured" />
        <p className="text-[13px] leading-relaxed text-[var(--cream)]">{WEIGHTING_RATIONALE}</p>
        <Card className="cr-avoid-break flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {byWeight.map((c) => (
              <div key={c.categoryId} className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-[var(--cream)]">{c.categoryName}</span>
                <span className="font-tabular cr-tone-gold">{c.weight}</span>
              </div>
            ))}
          </div>
        </Card>
        {notApplicableCount > 0 ? (
          <p className="text-[12px] text-[var(--muted)]">
            {notApplicableCount} question{notApplicableCount === 1 ? "" : "s"} on this assessment were marked not applicable to this business and
            were excluded from scoring entirely — never counted as a zero.
          </p>
        ) : null}
      </section>

      {/* 4. YOUR SCORE */}
      <section className="flex flex-col gap-5 py-10">
        <SectionHeading eyebrow="Result" title="Your score" />
        <Card strong className="cr-avoid-break flex flex-col items-center gap-3 py-10 text-center">
          <span className="font-tabular text-[64px] font-semibold leading-none cr-tone-gold">{score}</span>
          <span className="text-[11px] uppercase tracking-wide text-[var(--muted)]">out of 100</span>
          <span className="mt-2 text-[19px] font-semibold cr-tone-gold">{bandLabel ?? "—"}</span>
        </Card>

        <div className="cr-avoid-break flex flex-col gap-2">
          <p className="section-label">The five-band scale</p>
          <div className="flex h-8 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--hairline-strong)]">
            {bands.map((b) => {
              const width = b.max_score - b.min_score + 1;
              const active = score >= b.min_score && score <= b.max_score;
              return (
                <div
                  key={b.id}
                  className={cn("flex items-center justify-center border-r border-[var(--hairline)] last:border-r-0", active ? "bg-[var(--gold)]" : "bg-[var(--hairline)]")}
                  style={{ width: `${width}%` }}
                />
              );
            })}
          </div>
          <div className="flex w-full text-[10px] text-[var(--muted)]">
            {bands.map((b) => {
              const width = b.max_score - b.min_score + 1;
              const active = score >= b.min_score && score <= b.max_score;
              return (
                <div key={b.id} className={cn("px-0.5 text-center leading-tight", active && "font-semibold cr-tone-gold")} style={{ width: `${width}%` }}>
                  {b.label}
                  <br />
                  {b.min_score}-{b.max_score}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CATEGORY BREAKDOWN */}
      <section className="cr-page-break flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Detail" title="Category breakdown" />
        <div className="flex flex-col gap-3">
          {byWeight.map((c) => {
            const tone = categoryScoreTone(c.rawScore);
            const meaning = CATEGORY_SCORE_MEANING[c.categoryName];
            const meaningText = meaning ? (tone === "green" ? meaning.strong : tone === "yellow" ? meaning.developing : meaning.weak) : "";
            return (
              <Card key={c.categoryId} className="cr-avoid-break flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-[var(--cream)]">{c.categoryName}</span>
                    <Badge tone="neutral">weight {c.weight}</Badge>
                    {c.lowConfidence ? <Badge tone="yellow">Low confidence</Badge> : null}
                  </div>
                  <span className={cn("font-tabular text-[13px] font-semibold", TONE_CLASS[tone])}>{c.rawScore.toFixed(1)} / 10</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                  <div className={cn("h-full rounded-full", TONE_BAR[tone])} style={{ width: `${Math.min(100, (c.rawScore / 10) * 100)}%` }} />
                </div>
                <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{meaningText}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 6. YOUR THREE BIGGEST CONSTRAINTS */}
      <section className="cr-page-break flex flex-col gap-5 py-10">
        <SectionHeading eyebrow="The Heart Of This Report" title="Your three biggest constraints" />
        <div className="flex flex-col gap-6">
          {top3.map((c, i) => (
            <Card key={c.categoryId} strong className="cr-avoid-break flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="font-tabular text-[20px] font-semibold cr-tone-gold">#{i + 1}</span>
                <span className="text-[16px] font-semibold text-[var(--cream)]">{c.categoryName}</span>
                <span className={cn("font-tabular text-[13px]", TONE_CLASS[categoryScoreTone(c.rawScore)])}>{c.rawScore.toFixed(1)} / 10</span>
              </div>
              <div>
                <p className="section-label">What we found</p>
                <p className="text-[13px] leading-relaxed text-[var(--cream)]">{CATEGORY_BOTTLENECK_COPY[c.categoryName] ?? ""}</p>
              </div>
              <div>
                <p className="section-label">What it typically costs a business your size</p>
                <p className="text-[13px] leading-relaxed text-[var(--cream)]">{CATEGORY_TYPICAL_COST[c.categoryName] ?? ""}</p>
              </div>
              <div>
                <p className="section-label">What fixing it involves</p>
                <p className="text-[13px] leading-relaxed text-[var(--cream)]">{CATEGORY_FIX_INVOLVES[c.categoryName] ?? ""}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. THE BUSINESS PROFILE */}
      {financialProfile || businessPresence || workforce ? (
        <section className="cr-page-break flex flex-col gap-4 py-10">
          <SectionHeading eyebrow="As Reported" title="The business profile" />
          <BusinessProfilePanels
            financialProfile={financialProfile}
            businessPresence={businessPresence}
            workforce={workforce}
            revenuePerEmployee={revenuePerEmployee}
            realHeadcount={realHeadcount}
          />
        </section>
      ) : null}

      {/* 8. RECOMMENDED PATH */}
      {buildInfo && supportInfo && effectiveScope ? (
        <section className="cr-page-break flex flex-col gap-4 py-10">
          <SectionHeading eyebrow="The Plan" title="Recommended path" />
          <Card strong className="cr-avoid-break flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[19px] font-semibold cr-tone-gold">{buildInfo.label}</p>
              <p className="text-[19px] font-semibold text-[var(--cream)]">{pricingReleased ? buildInfo.priceLabel : PRICING_HIDDEN_INLINE}</p>
            </div>
            <p className="text-[12.5px] text-[var(--muted)]">Timeline: {buildInfo.timeline}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="section-label">Included</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {effectiveScope.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--cream)]">
                      <span className="cr-tone-green">✓</span>
                      <span>{redactPriceMentions(item, pricingReleased)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="section-label">Excluded</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {effectiveScope.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                      <span className="cr-tone-red">✕</span>
                      <span>{redactPriceMentions(item, pricingReleased)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="cr-avoid-break flex flex-col gap-2">
            <p className="section-label">{SUPPORT_SUBSCRIPTION_NAME}</p>
            <p className="text-[13px] leading-relaxed text-[var(--cream)]">
              Included with the build — the first {STABILIZATION_PERIOD_DAYS} days are covered to stabilize the new systems. After that, it
              continues at <span className="font-semibold cr-tone-gold">{supportInfo.label}</span>{" "}
              ({pricingReleased ? supportInfo.priceLabel : PRICING_HIDDEN_INLINE}), starting {STABILIZATION_PERIOD_DAYS} days after handover.
            </p>
            <div className="grid grid-cols-2 gap-3 border-y border-[var(--hairline)] py-3 sm:grid-cols-4">
              <div>
                <p className="section-label">Seats</p>
                <p className="text-[12.5px] text-[var(--cream)]">{supportInfo.includedSeats !== null ? `${supportInfo.includedSeats} included` : "Unlimited"}</p>
              </div>
              <div>
                <p className="section-label">Extra seat</p>
                <p className="text-[12.5px] text-[var(--cream)]">
                  {supportInfo.extraSeatRate === null ? "—" : pricingReleased ? `$${supportInfo.extraSeatRate}/mo` : PRICING_HIDDEN_INLINE}
                </p>
              </div>
              <div>
                <p className="section-label">Included hours</p>
                <p className="text-[12.5px] text-[var(--cream)]">{supportInfo.includedHoursPerMonth !== null ? `${supportInfo.includedHoursPerMonth}/mo` : "—"}</p>
              </div>
              <div>
                <p className="section-label">Response time</p>
                <p className="text-[12.5px] text-[var(--cream)]">{supportInfo.responseTime}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="section-label">Keeping it running</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {supportInfo.scope.keepingItRunning.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--cream)]">
                      <span className="cr-tone-green">✓</span>
                      <span>{redactPriceMentions(item, pricingReleased)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="section-label">Keeping it current</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {supportInfo.scope.keepingItCurrent.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--cream)]">
                      <span className="cr-tone-green">✓</span>
                      <span>{redactPriceMentions(item, pricingReleased)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="section-label">Keeping it used</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {supportInfo.scope.keepingItUsed.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--cream)]">
                      <span className="cr-tone-green">✓</span>
                      <span>{redactPriceMentions(item, pricingReleased)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="section-label">Access</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {supportInfo.scope.access.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--cream)]">
                      <span className="cr-tone-green">✓</span>
                      <span>{redactPriceMentions(item, pricingReleased)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {effectiveSupportTier && effectiveSupportTier !== "custom" && !pricingReleased ? (
            <PricingGateCard label="The Support Ladder" />
          ) : effectiveSupportTier && effectiveSupportTier !== "custom" ? (
            <Card className="flex flex-col gap-4">
              <div>
                <p className="section-label">The Support Ladder</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--cream)]">
                  {supportInfo.label} is the recommended tier for {orgName}. Here's the full ladder — what's below, what's above, and why each
                  step costs what it costs.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {SUPPORT_LADDER.map((tier, i) => {
                  const info = SUPPORT_TIER_INFO[tier];
                  const value = getSupportTierValueJustification(tier);
                  const isTheirs = tier === effectiveSupportTier;
                  const nextTier = SUPPORT_LADDER[i + 1];
                  return (
                    <div key={tier} className="flex flex-col gap-2">
                      <Card
                        strong={isTheirs}
                        className={cn("cr-avoid-break flex flex-col gap-3", isTheirs && "border-2 border-[var(--gold)]")}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[15px] font-semibold cr-tone-gold">
                            {info.label} <span className="text-[13px] font-normal text-[var(--cream)]">· {info.priceLabel}</span>
                          </p>
                          {isTheirs ? <Badge tone="gold">Your tier</Badge> : null}
                        </div>
                        <div className="grid grid-cols-2 gap-3 border-y border-[var(--hairline)] py-2.5 sm:grid-cols-4">
                          <div>
                            <p className="section-label">Seats</p>
                            <p className="text-[12px] text-[var(--cream)]">{info.includedSeats !== null ? `${info.includedSeats} included` : "Unlimited"}</p>
                          </div>
                          <div>
                            <p className="section-label">Extra seat</p>
                            <p className="text-[12px] text-[var(--cream)]">{info.extraSeatRate !== null ? `$${info.extraSeatRate}/mo` : "—"}</p>
                          </div>
                          <div>
                            <p className="section-label">Included hours</p>
                            <p className="text-[12px] text-[var(--cream)]">{info.includedHoursPerMonth !== null ? `${info.includedHoursPerMonth}/mo` : "—"}</p>
                          </div>
                          <div>
                            <p className="section-label">Response time</p>
                            <p className="text-[12px] text-[var(--cream)]">{info.responseTime}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <p className="section-label">What this costs otherwise</p>
                            <ul className="mt-1 flex flex-col gap-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
                              <li>Hosting &amp; infrastructure: {formatCurrency(value.hostingInfra)}/mo</li>
                              <li>Software licenses replaced: {formatCurrency(value.softwareLicenses)}/mo</li>
                              <li>
                                {value.hoursEquivalent} hrs/mo of dev time @ {formatCurrency(value.hourlyRate)}/hr: {formatCurrency(value.hoursValue)}/mo
                              </li>
                            </ul>
                            <p className="mt-1.5 text-[12.5px] font-semibold text-[var(--cream)]">
                              Market value: {formatCurrency(value.marketTotal)}/mo
                            </p>
                            {value.costPerUser !== null ? (
                              <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--muted)]">
                                Works out to {formatCurrency(value.costPerUser)}/user/mo — below the {formatCurrency(MANAGED_IT_PER_USER_RANGE.low)}-
                                {formatCurrency(MANAGED_IT_PER_USER_RANGE.high)}/user/mo managed-IT market range.
                              </p>
                            ) : null}
                          </div>
                          <div>
                            <p className="section-label">Who this is for</p>
                            <p className="text-[11.5px] leading-relaxed text-[var(--cream)]">{value.whoFor}</p>
                          </div>
                          <div>
                            <p className="section-label">When you outgrow it</p>
                            <p className="text-[11.5px] leading-relaxed text-[var(--cream)]">{value.outgrowSignal}</p>
                          </div>
                        </div>
                      </Card>
                      {nextTier && SUPPORT_TIER_INFO[nextTier].whatsNewFromPreviousTier ? (
                        <div className="cr-avoid-break flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pl-3 text-[11.5px] leading-relaxed">
                          <span className="font-semibold cr-tone-gold">
                            +{formatCurrency((SUPPORT_TIER_INFO[nextTier].price ?? 0) - (info.price ?? 0))}/mo →
                          </span>
                          <span className="text-[var(--muted)]">
                            {(SUPPORT_TIER_INFO[nextTier].whatsNewFromPreviousTier ?? []).join("; ")}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {!pricingReleased ? (
            <PricingGateCard label="Available Add-ons" />
          ) : (
          <Card className="flex flex-col gap-4">
            <div>
              <p className="section-label">Available Add-ons</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--cream)]">
                These attach to any tier above, billed monthly unless noted otherwise.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {FLAT_FEE_ADD_ONS.map((addOn) => (
                <li key={addOn.name} className="cr-avoid-break flex items-start justify-between gap-3 border-b border-[var(--hairline)] pb-2 text-[12.5px] leading-relaxed last:border-b-0 last:pb-0">
                  <span className="text-[var(--cream)]">
                    <span className="font-semibold">{addOn.name}.</span> {addOn.description}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-semibold cr-tone-gold">{addOn.priceLabel}</span>
                </li>
              ))}
            </ul>

            <div className="cr-avoid-break mt-2 flex flex-col gap-2 border-t border-[var(--hairline)] pt-4">
              <p className="section-label">Virtual Assistant Staffing</p>
              <p className="text-[12.5px] leading-relaxed text-[var(--cream)]">
                <span className="font-semibold cr-tone-gold">{VA_ASSIGNMENT_FEE_LABEL}.</span> {VA_ASSIGNMENT_FEE_DESCRIPTION} Then billed hourly for
                actual hours worked, {VA_MINIMUM_HOURS_PER_WEEK} hours/week minimum per VA:
              </p>
              <ul className="mt-1 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                {VA_ROLES.map((role) => (
                  <li key={role.name} className="flex items-center justify-between gap-3 text-[12px] text-[var(--cream)]">
                    <span>{role.name}</span>
                    <span className="font-tabular cr-tone-gold">${role.hourlyRate}/hr</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-2 flex flex-col gap-1.5">
                {VA_TERMS.map((term) => (
                  <li key={term} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                    <span className="cr-tone-gold">—</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          )}

          {firstYearValue !== null ? (
            pricingReleased ? (
              <Card strong className="cr-avoid-break flex flex-col items-center gap-1 py-6 text-center">
                <p className="section-label">Combined First-Year Investment</p>
                <p className="font-tabular text-[30px] font-semibold cr-tone-gold">{formatCurrency(firstYearValue)}</p>
                <p className="text-[11.5px] text-[var(--muted)]">
                  {buildInfo.priceLabel} build + {formatCurrency((supportInfo.price ?? 0) * 9)} subscription (9 billed months after the included
                  period)
                </p>
              </Card>
            ) : (
              <PricingGateCard label="Combined First-Year Investment" />
            )
          ) : null}
        </section>
      ) : null}

      {/* SCOPE OF WORK — generated from this assessment's own bottleneck order, capped by what the recommended tier actually covers. */}
      {scopePlan ? (
        <section className="cr-page-break flex flex-col gap-5 py-10">
          <SectionHeading eyebrow="Generated From Your Assessment" title="Scope of work" />
          <p className="text-[13px] leading-relaxed text-[var(--cream)]">
            The order below isn&apos;t generic — it follows your own bottleneck ranking from this assessment, so what gets built first is
            whatever is actually holding {orgName} back the most, capped by what {buildInfo?.label} covers.
          </p>

          <div className="cr-avoid-break flex flex-col gap-2">
            <p className="section-label">The shape of it — {scopePlan.totalWeeks} weeks</p>
            <div className="flex h-8 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--hairline-strong)]">
              {scopePlan.phases.map((p) => {
                const weeks = p.weekEnd - p.weekStart + 1;
                const width = (weeks / scopePlan.totalWeeks) * 100;
                return (
                  <div
                    key={p.phaseNumber}
                    className={cn(
                      "flex items-center justify-center border-r border-[var(--hairline)] px-1 text-center text-[9px] font-medium leading-tight last:border-r-0",
                      p.kind === "scope-lock" && "bg-[var(--muted)] text-[var(--black)]",
                      p.kind === "bottleneck" && "bg-[var(--gold)] text-[var(--black)]",
                      p.kind === "portal" && "bg-[var(--gold-light)] text-[var(--black)]",
                      p.kind === "handover" && "bg-[var(--green)] text-[var(--cream)]"
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {weeks >= 2 ? `W${p.weekStart}-${p.weekEnd}` : `W${p.weekStart}`}
                  </div>
                );
              })}
            </div>
            <div className="flex w-full text-[9.5px] text-[var(--muted)]">
              {scopePlan.phases.map((p) => {
                const weeks = p.weekEnd - p.weekStart + 1;
                const width = (weeks / scopePlan.totalWeeks) * 100;
                return (
                  <div key={p.phaseNumber} className="px-0.5 text-center leading-tight" style={{ width: `${width}%` }}>
                    {p.name}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {scopePlan.phases.map((p) => (
              <Card key={p.phaseNumber} className="cr-avoid-break flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[14.5px] font-semibold text-[var(--cream)]">
                    Phase {p.phaseNumber} — {p.name}
                  </p>
                  <Badge tone="neutral">{p.weekStart === p.weekEnd ? `Week ${p.weekStart}` : `Weeks ${p.weekStart}-${p.weekEnd}`}</Badge>
                </div>
                {p.kind === "bottleneck" && p.categoryScore !== undefined ? (
                  <p className="text-[11.5px] text-[var(--muted)]">
                    Your #{p.phaseNumber - 1} ranked constraint — {p.categoryName} scored {p.categoryScore.toFixed(1)}/10 on this assessment.
                  </p>
                ) : null}
                <div>
                  <p className="section-label">{p.kind === "bottleneck" || p.kind === "portal" ? "What we build" : "What we do"}</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {p.whatWeDo.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--cream)]">
                        <span className="cr-tone-gold">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="section-label">What you get at the end of this phase</p>
                  <p className="text-[12.5px] leading-relaxed text-[var(--cream)]">{p.whatYouGet}</p>
                </div>
                {p.whatWeNeed ? (
                  <div>
                    <p className="section-label">What we need from you</p>
                    <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{p.whatWeNeed}</p>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>

          {buildInfo ? (
            <p className="cr-avoid-break text-[13px] font-medium leading-relaxed text-[var(--cream)]">
              This is what your {pricingReleased ? buildInfo.priceLabel : "recommended"} build covers — {scopePlan.totalWeeks} weeks from kickoff
              to handover, addressing your constraints in the order they&apos;re actually holding {orgName} back.
            </p>
          ) : null}
        </section>
      ) : buildInfo?.label === "Custom Build" ? (
        <section className="cr-page-break flex flex-col gap-3 py-10">
          <SectionHeading eyebrow="Generated From Your Assessment" title="Scope of work" />
          <p className="text-[13px] leading-relaxed text-[var(--cream)]">
            A Custom Build is scoped and quoted individually rather than following the fixed-tier phase structure above — the specific phases,
            timeline, and deliverables will be defined once scope is finalized with you directly.
          </p>
        </section>
      ) : null}

      {/* 9. WHAT HAPPENS NEXT */}
      <section className="flex flex-col gap-4 py-10">
        <SectionHeading eyebrow="Moving Forward" title="What happens next" />
        <Card className="cr-avoid-break flex flex-col gap-3">
          {NEXT_STEPS.map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--gold)] font-tabular text-[11px] font-semibold cr-tone-gold">
                {i + 1}
              </span>
              <p className="text-[13px] leading-relaxed text-[var(--cream)]">{step}</p>
            </div>
          ))}
        </Card>
      </section>

      {/* 10. BACK PAGE */}
      <section className="cr-page-break cr-cover flex flex-col items-center justify-center gap-6 py-24 text-center">
        <BrandMark size="lg" />
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[16px] font-semibold text-[var(--cream)]">{VERUS_CONTACT.companyName}</p>
          <p className="text-[13px] cr-tone-gold">{VERUS_CONTACT.website}</p>
          <p className="text-[13px] text-[var(--muted)]">{VERUS_CONTACT.cta}</p>
        </div>
        <p className="mt-4 text-[10.5px] uppercase tracking-wide text-[var(--muted)]">Confidential — prepared for {orgName}</p>
      </section>
    </div>
  );
}
