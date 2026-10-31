import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { PullQuote } from "@/modules/marketing/PullQuote";
import { StatBand } from "@/modules/marketing/StatBand";
import { FaqAccordion } from "@/modules/marketing/FaqAccordion";
import { ScreenshotVisual } from "@/modules/marketing/ScreenshotVisual";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { HeroCompassStage } from "@/modules/marketing/HeroCompassStage";
import { CompassHandoff } from "@/shared/ui/CompassMark";
import { AnimatedScoreGauge } from "@/modules/marketing/animation/AnimatedScoreGauge";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { CategoryBars } from "@/modules/assessments/CategoryBars";
import { BandScale } from "@/modules/assessments/BandScale";
import { RankedBottleneckList } from "@/modules/assessments/RankedBottleneckList";
import { SAMPLE_CATEGORIES, SAMPLE_BANDS, SAMPLE_SCORE, SAMPLE_BOTTLENECKS } from "@/modules/marketing/sampleAssessment";
import { PROBLEM_BLOCKS, WHAT_VERUS_BUILDS, HOW_IT_WORKS_STEPS, POSITIONING, WHO_THIS_IS_FOR, WHO_THIS_IS_NOT_FOR, FAQ_ITEMS } from "@/modules/marketing/positioning";
import { CASE_STUDIES } from "@/modules/marketing/caseStudies";
import { SERVICE_AREAS } from "@/modules/marketing/services";

export const metadata: Metadata = {
  title: "VERUS Operating Company — Systems for Founder-Led Businesses",
  description:
    "VERUS diagnoses what's actually holding your company back, then builds the systems and processes to fix it — and stays embedded running them. Founder-led businesses, $1M-$25M revenue, delivered remotely nationwide.",
  openGraph: {
    title: "VERUS Operating Company — Systems for Founder-Led Businesses",
    description: "We find what's holding your company back, then build the systems to fix it.",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* HERO — text left, the full compass rose right as the anchor, with
          the real report screenshot set on its center. Layout alternates
          down the page from here: text/visual, visual/text, text/visual... */}
      <section className="relative overflow-hidden">
        <div className="hero-light-sweep" />
        <div className="page-container section-y relative">
          <TwoColSection
            reverse
            visual={
              <FadeUp>
                <HeroCompassStage
                  src="/images/product/report-screenshot.webp"
                  alt="A completed VERUS business assessment report showing an enterprise score, category breakdown, and ranked bottleneck list"
                />
              </FadeUp>
            }
          >
            <FadeUp>
              <span className="section-eyebrow">VERUS Operating Company</span>
            </FadeUp>
            <FadeUp delayMs={80}>
              <h1 className="text-[32px] font-semibold leading-[1.1] text-[var(--cream)] sm:text-[46px]">
                From Founder-Led Chaos to System-Driven Growth.
              </h1>
            </FadeUp>
            <FadeUp delayMs={160}>
              <p className="max-w-lg text-[14.5px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
                We find what&apos;s actually holding your company back, then build the systems and processes to fix it.
              </p>
            </FadeUp>
            <FadeUp delayMs={240}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
                  Get Your Free Score
                </LinkButton>
                <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
                  Book a Call
                </LinkButton>
              </div>
            </FadeUp>
          </TwoColSection>
        </div>
      </section>

      {/* THE PROBLEM — visual left (real category bars), text right */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container section-y">
          <TwoColSection
            visual={
              <FadeUp>
                <CategoryBars strong categories={SAMPLE_CATEGORIES.slice(0, 4)} />
              </FadeUp>
            }
          >
            <FadeUp>
              <SectionHeading eyebrow="The Problem" title="What's Actually Holding the Business Back" />
            </FadeUp>
            <div className="flex flex-col gap-4">
              {PROBLEM_BLOCKS.map((block, i) => (
                <FadeUp key={block.title} delayMs={i * 80}>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[var(--cream)]">{block.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{block.description}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </TwoColSection>
        </div>
      </section>

      {/* SEE THE REAL ASSESSMENT — text left, screenshot right, alternating from The Problem above */}
      <section className="page-container section-y">
        <TwoColSection
          reverse
          visual={
            <FadeUp>
              <ScreenshotVisual
                parallaxStrength={0.05}
                maxWidthClassName="max-w-none"
                src="/images/product/runner-screenshot.webp"
                alt="The VERUS assessment runner mid-question, showing answer choices and a live provisional score"
              />
            </FadeUp>
          }
        >
          <FadeUp>
            <SectionHeading eyebrow="See It" title="Real Questions, a Live Score As You Go" />
          </FadeUp>
          <FadeUp delayMs={80}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Every question uses the same 0-3 ladder, and your provisional score updates as you answer — no guessing where you stand
              until the end. This is the actual assessment runner, not a mockup.
            </p>
          </FadeUp>
        </TwoColSection>
      </section>

      <div className="page-container">
        <CompassHandoff />
      </div>

      {/* WHAT VERUS BUILDS — full-width numbers band */}
      <section className="page-container section-y section-stack flex flex-col">
        <FadeUp>
          <SectionHeading eyebrow="What VERUS Builds" title="Systems and Processes — Always Both" align="center" />
        </FadeUp>
        <FadeUp>
          <Card strong className="px-3 py-8 sm:px-6 sm:py-10">
            <StatBand
              stats={[
                { value: 10, label: "Categories Assessed" },
                { value: 120, label: "Diagnostic Questions" },
                { value: 100, suffix: "-pt", label: "Enterprise Score" },
                { value: 4, label: "Build Tiers" },
              ]}
            />
          </Card>
        </FadeUp>
        <FadeUp>
          <div className="flex flex-wrap justify-center gap-3">
            {WHAT_VERUS_BUILDS.map((item) => (
              <span key={item} className="glass-panel px-4 py-2 text-[12.5px] font-medium text-[var(--cream)]">
                {item}
              </span>
            ))}
            <span className="glass-panel px-4 py-2 text-[12.5px] font-medium text-[var(--cream)]">Ongoing Support</span>
          </div>
        </FadeUp>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container section-y section-stack flex flex-col">
          <FadeUp>
            <SectionHeading eyebrow="How It Works" title="Four Steps, Start to Finish" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((s, i) => (
              <FadeUp key={s.step} delayMs={i * 80}>
                <Card strong className="hover-lift flex h-full flex-col gap-2">
                  <span className="font-tabular text-[22px] font-semibold text-[var(--gold-light)]">{s.step}</span>
                  <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{s.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{s.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES — the four ongoing service areas, pointing at /services */}
      <section className="page-container section-y section-stack flex flex-col">
        <FadeUp>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Services"
              title="The Work That Keeps Running After the Build"
              description="VERUS doesn't just build the systems — we staff and run the work inside them."
            />
            <Link href="/services" className="shrink-0 text-[12.5px] font-medium text-[var(--gold-light)] hover:underline">
              See all services →
            </Link>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Typographic cards — no image, no icon — until real screenshots are supplied. */}
          {SERVICE_AREAS.map((s, i) => (
            <FadeUp key={s.slug} delayMs={i * 80}>
              <Link href={`/services#${s.slug}`} className="block h-full">
                <Card strong className="hover-lift flex h-full flex-col gap-2">
                  <span className="font-tabular text-[22px] font-semibold text-[var(--gold-light)]">{s.index}</span>
                  <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{s.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{s.lead}</p>
                </Card>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>

      <div className="page-container">
        <CompassHandoff />
      </div>

      {/* THE ASSESSMENT AS ENTRY POINT — score visual left, text right */}
      <section className="page-container section-y">
        <TwoColSection
          visual={
            <FadeUp>
              <Card strong className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <AnimatedScoreGauge score={SAMPLE_SCORE} className="w-28 sm:w-32" />
                </div>
                <BandScale score={SAMPLE_SCORE} bands={SAMPLE_BANDS} />
              </Card>
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-eyebrow">Start Here</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h2 className="text-[26px] font-semibold leading-tight text-[var(--cream)] sm:text-[32px]">
              Every Engagement Starts with Knowing Exactly What&apos;s Costing You.
            </h2>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              The free scan takes minutes and gives you a real score, on the same scale shown here. The Full Business Assessment goes
              deep across every part of the operation and ranks your bottlenecks by what they&apos;re actually costing you.
            </p>
          </FadeUp>
          <FadeUp delayMs={240}>
            <LinkButton href="/scan" variant="primary" className="self-start px-6 py-3 text-[14px]">
              Get Your Free Score
            </LinkButton>
          </FadeUp>
        </TwoColSection>
      </section>

      {/* PULL QUOTE */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container section-y">
          <FadeUp>
            <PullQuote>{POSITIONING.approach}</PullQuote>
          </FadeUp>
        </div>
      </section>

      {/* PROOF POINTS — text left, ranked bottleneck list right, case studies below */}
      <section>
        <div className="page-container section-y section-stack flex flex-col">
        <TwoColSection
          reverse
          visual={
            <FadeUp>
              <RankedBottleneckList strong items={SAMPLE_BOTTLENECKS} title="Sample Ranked Bottlenecks" />
            </FadeUp>
          }
        >
          <FadeUp>
            <SectionHeading eyebrow="Proof" title="Built and Running, Not Just Proposed" />
          </FadeUp>
          <FadeUp delayMs={80}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Every assessment ranks your bottlenecks the same way — by what they&apos;re actually costing you, weighted, not by gut
              feeling. Here&apos;s what that produced for two real clients.
            </p>
          </FadeUp>
        </TwoColSection>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CASE_STUDIES.map((cs, i) => (
            <FadeUp key={cs.slug} delayMs={i * 100}>
              <Card strong className="hover-lift flex h-full flex-col gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--cream)]">{cs.client}</p>
                  <p className="text-[11.5px] text-[var(--muted)]">
                    {cs.location} · {cs.industry}
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--muted)]">{cs.summary}</p>
                <Link href="/case-studies" className="text-[12.5px] font-medium text-[var(--gold-light)] hover:underline">
                  Read the case study →
                </Link>
              </Card>
            </FadeUp>
          ))}
        </div>
        </div>
      </section>

      {/* WHO THIS IS FOR / NOT FOR — real photo background, restrained behind a strong navy overlay */}
      <PhotoSection src="/images/photography/construction-workers.webp" alt="" className="border-y border-[var(--hairline)]">
        <div className="page-container section-y section-stack flex flex-col">
          <FadeUp>
            <SectionHeading eyebrow="Fit" title="Who This Is for — and Who It Isn't" align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FadeUp>
              <Card strong className="flex h-full flex-col gap-3">
                <p className="section-label text-[var(--green)]!">This Is for You If</p>
                <ul className="flex flex-col gap-2.5">
                  {WHO_THIS_IS_FOR.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--cream)]">
                      <span className="text-[var(--green)]">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeUp>
            <FadeUp delayMs={100}>
              <Card strong className="flex h-full flex-col gap-3">
                <p className="section-label text-[var(--red)]!">This Isn&apos;t for You If</p>
                <ul className="flex flex-col gap-2.5">
                  {WHO_THIS_IS_NOT_FOR.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--cream)]">
                      <span className="text-[var(--red)]">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeUp>
          </div>
        </div>
      </PhotoSection>

      {/* FAQ */}
      <section className="page-container section-y section-stack flex flex-col">
        <FadeUp>
          <SectionHeading eyebrow="Questions" title="Straight Answers" align="center" />
        </FadeUp>
        <FadeUp>
          <div className="mx-auto w-full max-w-2xl">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </FadeUp>
      </section>

      {/* FINAL CTA — photo background for a strong close */}
      <PhotoSection src="/images/photography/warehouse-interior.webp" alt="" className="border-t border-[var(--hairline)]">
        <div className="page-container section-y flex flex-col items-center gap-6 text-center">
          <FadeUp>
            <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
              Find Out What&apos;s Actually Holding Your Company Back.
            </h2>
          </FadeUp>
          <FadeUp delayMs={100}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
                Get Your Free Score
              </LinkButton>
              <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
                Book a Call
              </LinkButton>
            </div>
          </FadeUp>
        </div>
      </PhotoSection>
    </div>
  );
}
