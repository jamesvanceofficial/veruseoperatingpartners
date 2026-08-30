import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { AnimatedScoreGauge } from "@/modules/marketing/animation/AnimatedScoreGauge";
import { ScreenshotVisual } from "@/modules/marketing/ScreenshotVisual";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { BandScale } from "@/modules/assessments/BandScale";
import { RankedBottleneckList } from "@/modules/assessments/RankedBottleneckList";
import { SAMPLE_SCORE, SAMPLE_BAND_LABEL, SAMPLE_BANDS, SAMPLE_BOTTLENECKS, SAMPLE_QUESTION } from "@/modules/marketing/sampleAssessment";
import { createAdminClient } from "@/shared/supabase/admin";
import { getCategories } from "@/modules/assessments/data";

export const metadata: Metadata = {
  title: "The Business Assessment | VERUS Operating Company",
  description:
    "A $2,500 diagnostic across every part of a founder-led business — ranked by what's actually costing you the most, with a build and support recommendation to fix it.",
  openGraph: {
    title: "The Business Assessment | VERUS Operating Company",
    description: "A $2,500 diagnostic that finds your worst bottleneck and ranks what it's actually costing you.",
  },
};

export default async function TheAssessmentPage() {
  // assessment_categories is RLS-scoped `to authenticated` only (real
  // content, not sensitive) — same reasoning as /scan, so this read goes
  // through the admin client rather than the request-scoped one.
  const admin = createAdminClient();
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories(admin);
  } catch {
    // Degrade gracefully if migrations haven't run — the page still explains the assessment, just without the live category list.
  }

  return (
    <div className="flex flex-col">
      {/* HERO — text left, real runner screenshot at an angle right */}
      <section className="page-container py-12 sm:py-16">
        <TwoColSection
          visual={
            <FadeUp>
              <ScreenshotVisual
                tilt
                maxWidthClassName="max-w-md"
                src="/images/product/runner-screenshot.webp"
                alt="The VERUS assessment runner mid-question, showing answer choices and a live provisional score"
              />
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">The Business Assessment</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[28px] font-semibold leading-tight text-[var(--cream)] sm:text-[38px]">
              A real diagnostic, not a sales pitch dressed up as one.
            </h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[14px] leading-relaxed text-[var(--muted)]">
              The Full Business Assessment is <span className="font-semibold text-[var(--cream)]">$2,500</span>. It goes deep across
              every part of the business, scores it out of 100, and ranks your bottlenecks by what they&apos;re actually costing you.
            </p>
          </FadeUp>
          <FadeUp delayMs={240}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
                Try the Free Scan First
              </LinkButton>
              <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
                Book the Full Assessment
              </LinkButton>
            </div>
          </FadeUp>
        </TwoColSection>
      </section>

      {categories.length > 0 ? (
        <PhotoSection src="/images/photography/dashboard-laptop.webp" className="border-y border-[var(--hairline)]">
          <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
            <FadeUp>
              <SectionHeading
                eyebrow="What It Covers"
                title="Every part of the business, weighted by what actually matters"
                description="The categories below are weighted — Operations and Systems carry more weight than Vision or Marketing, because that's where founder-led businesses are usually actually bottlenecked."
              />
            </FadeUp>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories
                .slice()
                .sort((a, b) => b.weight - a.weight)
                .map((c, i) => (
                  <FadeUp key={c.id} delayMs={Math.min(i * 40, 320)}>
                    <Card className="hover-lift flex items-center justify-between gap-3 py-3.5">
                      <span className="text-[13px] text-[var(--cream)]">{c.name}</span>
                      <span className="font-tabular text-[12px] text-[var(--gold-light)]">weight {c.weight}</span>
                    </Card>
                  </FadeUp>
                ))}
            </div>
          </div>
        </PhotoSection>
      ) : null}

      {/* HOW SCORING WORKS — a real sample question, visual left */}
      <section className="page-container py-11 sm:py-14">
        <TwoColSection
          visual={
            <FadeUp>
              <Card strong className="flex flex-col gap-4">
                <Badge tone="gold">{SAMPLE_QUESTION.category}</Badge>
                <p className="text-[14px] font-medium leading-relaxed text-[var(--cream)]">{SAMPLE_QUESTION.text}</p>
                <div className="flex flex-col gap-2">
                  {SAMPLE_QUESTION.options.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] bg-[var(--navy)] px-3.5 py-2.5"
                    >
                      <span className="font-tabular text-[12px] font-semibold text-[var(--gold-light)]">{opt.value}</span>
                      <span className="text-[12.5px] text-[var(--cream)]">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeUp>
          }
        >
          <FadeUp>
            <SectionHeading eyebrow="The Format" title="Every question uses the same 0-3 ladder" />
          </FadeUp>
          <FadeUp delayMs={80}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              0 is nothing in place. 1 is ad hoc — something exists, but nobody could actually follow it. 2 is documented. 3 is
              documented <span className="font-semibold text-[var(--cream)]">and</span> running well. That ladder removes guesswork —
              there&apos;s no rating a business on a gut feeling, just where a real answer actually lands.
            </p>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              120 questions, 12 per category, every one scored the same way — so the result is a real measurement, not an opinion.
            </p>
          </FadeUp>
        </TwoColSection>
      </section>

      {/* THE RESULT — ranked bottleneck list visual, text right */}
      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container py-11 sm:py-14">
          <TwoColSection
            reverse
            visual={
              <FadeUp>
                <RankedBottleneckList items={SAMPLE_BOTTLENECKS} title="Sample Ranked Bottlenecks" />
              </FadeUp>
            }
          >
            <FadeUp>
              <SectionHeading eyebrow="The Result" title="A score, a band, and a ranked list of what to fix first" />
            </FadeUp>
            <FadeUp delayMs={80}>
              <div className="flex items-center gap-4">
                <AnimatedScoreGauge score={SAMPLE_SCORE} className="w-16 shrink-0" />
                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--cream)]">An Enterprise Score</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                    A single number out of 100 that reflects where the business actually stands today.
                  </p>
                </div>
              </div>
            </FadeUp>
            <FadeUp delayMs={140}>
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--cream)]">A Band</h3>
                <div className="mt-2">
                  <BandScale score={SAMPLE_SCORE} bands={SAMPLE_BANDS} />
                </div>
              </div>
            </FadeUp>
            <FadeUp delayMs={200}>
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--cream)]">A Ranked Bottleneck List</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  Your biggest constraints, ranked by weighted impact — so the build addresses what&apos;s actually costing you the
                  most, first.
                </p>
              </div>
            </FadeUp>
          </TwoColSection>
        </div>
      </section>

      <section className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
        <FadeUp>
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Not ready for the full assessment? Start with the free scan.
          </h2>
        </FadeUp>
        <FadeUp delayMs={100}>
          <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--muted)]">A shorter, no-cost version that still gives you a real score in minutes.</p>
        </FadeUp>
        <FadeUp delayMs={160}>
          <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
        </FadeUp>
      </section>
    </div>
  );
}
