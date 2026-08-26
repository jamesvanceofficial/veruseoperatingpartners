import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { BrandMark } from "@/shared/ui/BrandMark";
import { cn } from "@/shared/ui/cn";
import { formatCurrency, formatDate, formatNumber } from "@/shared/format";
import { categoryScoreTone } from "./scoreTone";
import { CATEGORY_BOTTLENECK_COPY } from "./bottleneckCopy";
import { WEIGHTING_RATIONALE, CATEGORY_SCORE_MEANING, CATEGORY_TYPICAL_COST, CATEGORY_FIX_INVOLVES, NEXT_STEPS, VERUS_CONTACT } from "./reportCopy";
import { BUILD_TIER_INFO, SUPPORT_TIER_INFO, SUPPORT_SUBSCRIPTION_NAME, STABILIZATION_PERIOD_DAYS } from "./buildTiers";
import { BusinessProfilePanels } from "./BusinessProfilePanels";
import type { AssessmentReport, Band } from "./types";

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

  const score = assessment.enterprise_score ?? 0;
  const preparedDate = assessment.completed_at ?? assessment.created_at;

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
              <p className="text-[13px] leading-relaxed text-[var(--cream)]">{assessment.build_recommendation_reasoning}</p>
            </div>
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
      {buildInfo && supportInfo ? (
        <section className="cr-page-break flex flex-col gap-4 py-10">
          <SectionHeading eyebrow="The Plan" title="Recommended path" />
          <Card strong className="cr-avoid-break flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[19px] font-semibold cr-tone-gold">{buildInfo.label}</p>
              <p className="text-[19px] font-semibold text-[var(--cream)]">{buildInfo.priceLabel}</p>
            </div>
            <p className="text-[12.5px] text-[var(--muted)]">Timeline: {buildInfo.timeline}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="section-label">Included</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {buildInfo.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--cream)]">
                      <span className="cr-tone-green">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="section-label">Excluded</p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {buildInfo.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                      <span className="cr-tone-red">✕</span>
                      <span>{item}</span>
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
              continues at <span className="font-semibold cr-tone-gold">{supportInfo.label}</span> ({supportInfo.priceLabel}), starting{" "}
              {STABILIZATION_PERIOD_DAYS} days after handover.
            </p>
          </Card>

          {firstYearValue !== null ? (
            <Card strong className="cr-avoid-break flex flex-col items-center gap-1 py-6 text-center">
              <p className="section-label">Combined First-Year Investment</p>
              <p className="font-tabular text-[30px] font-semibold cr-tone-gold">{formatCurrency(firstYearValue)}</p>
              <p className="text-[11.5px] text-[var(--muted)]">
                {buildInfo.priceLabel} build + {formatCurrency((supportInfo.price ?? 0) * 9)} subscription (9 billed months after the included
                period)
              </p>
            </Card>
          ) : null}
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
