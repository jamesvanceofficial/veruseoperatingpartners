import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { FaqAccordion } from "@/modules/marketing/FaqAccordion";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { AnimatedScoreGauge } from "@/modules/marketing/animation/AnimatedScoreGauge";
import { ScreenshotStage } from "@/modules/marketing/ScreenshotStage";
import { CompassDivider } from "@/modules/marketing/CompassDivider";
import { CategoryWeightChart } from "@/modules/marketing/CategoryWeightChart";
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

const OBJECTIONS = [
  {
    question: "Why not just hire a consultant?",
    answer:
      "A consultant tells you what's wrong and hands you a plan to execute yourself — the follow-through is still on you. VERUS diagnoses the same way, then actually builds the fix and stays embedded running it. You're not left holding a slide deck and a to-do list nobody has time for.",
  },
  {
    question: "I already have software.",
    answer:
      "The assessment accounts for what you already have. Sometimes the right build connects and fixes what exists rather than replacing it — the point is fixing the actual bottleneck, not selling a rebuild you don't need.",
  },
  {
    question: "I don't have time for this.",
    answer:
      "It's 120 questions you answer at your own pace through a private link — no meeting to schedule, no consultant sitting across from you. Most owners finish it in one sitting between other things. And every week you run on a bottleneck you haven't measured costs more time than this takes.",
  },
  {
    question: "How do I know it's worth $2,500?",
    answer:
      "You get a full, ranked diagnostic of your business — your score, your band, and every bottleneck weighted by what it's actually costing you — whether or not you ever build anything with us. Most owners have never had a real, measured answer to what's holding them back. This is that answer.",
  },
] as const;

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
              <ScreenshotStage
                maxWidthClassName="max-w-xl"
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
              A Real Diagnostic, Not a Sales Pitch Dressed Up As One.
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
        <section className="relative overflow-hidden border-y border-[var(--hairline)] bg-[var(--surface)]">
          <CompassDivider side="left" opacity={0.08} />
          <div className="page-container relative py-11 sm:py-14">
            <TwoColSection
              reverse
              visual={
                <FadeUp>
                  <Card strong className="glass-panel-elevated">
                    <CategoryWeightChart categories={categories.map((c) => ({ id: c.id, name: c.name, weight: c.weight }))} />
                  </Card>
                </FadeUp>
              }
            >
              <FadeUp>
                <SectionHeading
                  eyebrow="What It Covers"
                  title="Every Part of the Business, Weighted By What Actually Matters"
                  description="Operations carries four times the weight of Vision — because that's where founder-led businesses are usually actually bottlenecked, not because of an arbitrary point scale."
                />
              </FadeUp>
            </TwoColSection>
          </div>
        </section>
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
            <SectionHeading eyebrow="The Format" title="Every Question Uses the Same 0-3 Ladder" />
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
              <SectionHeading eyebrow="The Result" title="A Score, a Band, and a Ranked List of What to Fix First" />
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

      {/* OBJECTIONS — honest, brief answers to what actually stops an owner from booking */}
      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Before You Decide" title="What Owners Actually Ask Before Booking" align="center" />
          </FadeUp>
          <FadeUp>
            <div className="mx-auto w-full max-w-2xl">
              <FaqAccordion items={OBJECTIONS} />
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
        <FadeUp>
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Not Ready for the Full Assessment? Start with the Free Scan.
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
