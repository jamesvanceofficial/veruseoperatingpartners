import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { PullQuote } from "@/modules/marketing/PullQuote";
import { StatBand } from "@/modules/marketing/StatBand";
import { FaqAccordion } from "@/modules/marketing/FaqAccordion";
import { ReportPreviewFrame } from "@/modules/marketing/ReportPreviewFrame";
import { AnimatedScoreGauge } from "@/modules/marketing/animation/AnimatedScoreGauge";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { CategoryBars } from "@/modules/assessments/CategoryBars";
import { BandScale } from "@/modules/assessments/BandScale";
import { RankedBottleneckList } from "@/modules/assessments/RankedBottleneckList";
import { SAMPLE_CATEGORIES, SAMPLE_BANDS, SAMPLE_SCORE, SAMPLE_BOTTLENECKS } from "@/modules/marketing/sampleAssessment";
import { PROBLEM_BLOCKS, WHAT_VERUS_BUILDS, HOW_IT_WORKS_STEPS, POSITIONING, WHO_THIS_IS_FOR, WHO_THIS_IS_NOT_FOR, FAQ_ITEMS } from "@/modules/marketing/positioning";
import { CASE_STUDIES } from "@/modules/marketing/caseStudies";

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
      {/* HERO — text left, live report preview right */}
      <section className="page-container py-16 sm:py-24">
        <TwoColSection
          visual={
            <FadeUp>
              <ReportPreviewFrame />
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">VERUS Operating Company</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[32px] font-semibold leading-[1.1] text-[var(--cream)] sm:text-[46px]">
              From founder-led chaos to system-driven growth.
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
      </section>

      {/* THE PROBLEM — visual left (real category bars), text right */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container py-16 sm:py-20">
          <TwoColSection
            visual={
              <FadeUp>
                <CategoryBars categories={SAMPLE_CATEGORIES.slice(0, 4)} />
              </FadeUp>
            }
          >
            <FadeUp>
              <SectionHeading eyebrow="The Problem" title="What's actually holding the business back" />
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

      {/* WHAT VERUS BUILDS — full-width numbers band */}
      <section className="page-container flex flex-col gap-12 py-16 sm:py-20">
        <FadeUp>
          <SectionHeading eyebrow="What VERUS Builds" title="Systems and processes — always both" align="center" />
        </FadeUp>
        <FadeUp>
          <StatBand
            stats={[
              { value: 10, label: "Categories Assessed" },
              { value: 120, label: "Diagnostic Questions" },
              { value: 100, suffix: "-pt", label: "Enterprise Score" },
              { value: 4, label: "Build Tiers" },
            ]}
          />
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
        <div className="page-container flex flex-col gap-10 py-16 sm:py-20">
          <FadeUp>
            <SectionHeading eyebrow="How It Works" title="Four steps, start to finish" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((s, i) => (
              <FadeUp key={s.step} delayMs={i * 80}>
                <Card className="flex h-full flex-col gap-2">
                  <span className="font-tabular text-[22px] font-semibold text-[var(--gold-light)]">{s.step}</span>
                  <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{s.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{s.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* THE ASSESSMENT AS ENTRY POINT — text left, band scale right */}
      <section className="page-container py-16 sm:py-20">
        <TwoColSection
          reverse
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
            <span className="section-label text-[var(--gold-light)]">Start Here</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h2 className="text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
              Every engagement starts with knowing exactly what&apos;s costing you.
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
        <div className="page-container py-16 sm:py-20">
          <FadeUp>
            <PullQuote>{POSITIONING.approach}</PullQuote>
          </FadeUp>
        </div>
      </section>

      {/* PROOF POINTS — visual left (ranked bottleneck list), case studies below */}
      <section className="page-container flex flex-col gap-14 py-16 sm:py-20">
        <TwoColSection
          visual={
            <FadeUp>
              <RankedBottleneckList items={SAMPLE_BOTTLENECKS} title="Sample Ranked Bottlenecks" />
            </FadeUp>
          }
        >
          <FadeUp>
            <SectionHeading eyebrow="Proof" title="Built and running, not just proposed" />
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
              <Card strong className="flex h-full flex-col gap-3">
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
      </section>

      {/* WHO THIS IS FOR / NOT FOR */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col gap-10 py-16 sm:py-20">
          <FadeUp>
            <SectionHeading eyebrow="Fit" title="Who this is for — and who it isn't" align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FadeUp>
              <Card className="flex h-full flex-col gap-3">
                <p className="section-label text-[var(--green)]">This Is For You If</p>
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
              <Card className="flex h-full flex-col gap-3">
                <p className="section-label text-[var(--red)]">This Isn&apos;t For You If</p>
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
      </section>

      {/* FAQ */}
      <section className="page-container flex flex-col gap-10 py-16 sm:py-20">
        <FadeUp>
          <SectionHeading eyebrow="Questions" title="Straight answers" align="center" />
        </FadeUp>
        <FadeUp>
          <div className="mx-auto w-full max-w-2xl">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </FadeUp>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <FadeUp>
            <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
              Find out what&apos;s actually holding your company back.
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
      </section>
    </div>
  );
}
