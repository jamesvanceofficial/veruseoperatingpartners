import type { Metadata } from "next";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Card } from "@/shared/ui/Card";
import { LinkButton } from "@/shared/ui/LinkButton";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { CompassDivider } from "@/modules/marketing/CompassDivider";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { ScreenshotStage } from "@/modules/marketing/ScreenshotStage";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { FaqAccordion } from "@/modules/marketing/FaqAccordion";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { POSITIONING } from "@/modules/marketing/positioning";
import { CASE_STUDIES } from "@/modules/marketing/caseStudies";

// Stage 37 — the dedicated paid-traffic landing page. No site navigation
// anywhere on this page (see the deliberately nav-free header/footer
// below) — the only two exits are /scan and /contact, same as every
// button on the page links to one of those two and nothing else.
// Excluded from the sitemap and marked noindex: this page exists to
// receive ad clicks, not to be found organically, and has none of the
// site nav an organic visitor would expect.
export const metadata: Metadata = {
  title: "Would Your Business Survive 30 Days Without You? | VERUS",
  description: "Take the free 4-minute scan and get a real score, your band, and your single biggest bottleneck — named. No call required.",
  robots: { index: false, follow: false },
};

const RECOGNITION_BLOCKS = [
  {
    title: "Your Phone Never Stops.",
    description:
      "Every question that could be answered by a real system instead gets texted straight to you — the crew, the schedule, the customer who needs an answer right now.",
  },
  {
    title: "You Can't Actually Take a Day Off.",
    description:
      "Not because you don't trust your people. Because nothing keeps moving without you personally in it, so a day off just means a pile waiting when you're back.",
  },
  {
    title: "You Already Know Where the Problem Is.",
    description: "You just haven't had the time, or the outside eyes, to actually name it and fix it instead of working around it again.",
  },
  {
    title: "Every New Hire Adds Coordination, Not Relief.",
    description: "More people without real systems just means more decisions routed through you. Growth is making the problem worse, not better.",
  },
] as const;

const SCAN_FACTS = [
  "20 real diagnostic questions — the same ones used in every VERUS assessment",
  "About 4 minutes",
  "Completely free, no card, no call required",
  "A real score out of 100, your band, and your single biggest constraint, named",
] as const;

const TRUST_POINTS = [
  {
    title: "Computed the Same Way for Everyone",
    description: "Your score comes from a fixed formula, not a human deciding what to tell you.",
  },
  {
    title: "The Answer You Pick Is the Score",
    description: "There's no hidden weighting toward a sales outcome — what you honestly answer is what gets measured.",
  },
  {
    title: "You Get the Result Either Way",
    description: "Your score, band, and biggest constraint show up on screen immediately, whether or not you ever talk to us.",
  },
] as const;

const START_FAQ = [
  {
    question: "Is it really free?",
    answer: "Yes. The scan costs nothing and there's no card required. You get your score whether or not you ever talk to us.",
  },
  {
    question: "How long does it take?",
    answer: "About 4 minutes — 20 questions, one honest answer each.",
  },
  {
    question: "What happens after?",
    answer:
      "You see your score, band, and biggest constraint immediately on screen. If you want to go deeper or talk it through, you can — there's no obligation either way.",
  },
  {
    question: "Do you work with my industry?",
    answer:
      "We're industry agnostic — trades, construction, real estate, service, industrial, capital management. The diagnostic and build approach is the same regardless of industry; what gets built is specific to your business.",
  },
] as const;

export default function StartPage() {
  return (
    <div className="grain-overlay flex min-h-screen flex-col">
      {/* Deliberately not a <Link> — this page has zero site navigation, only the /scan and /contact buttons below count as exits. */}
      <div className="page-container flex justify-center py-6">
        <BrandMark size="md" />
      </div>

      {/* HERO — single centered column, one button, no visual competing for attention */}
      <section className="relative overflow-hidden">
        <CompassDivider side="right" opacity={0.09} />
        <div className="hero-light-sweep" />
        <div className="page-container relative flex flex-col items-center gap-6 py-10 text-center sm:py-16">
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">For Founder-Led Businesses</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="max-w-3xl text-[30px] font-semibold leading-[1.15] text-[var(--cream)] sm:text-[48px]">
              If You Disappeared For 30 Days, Would Your Business Keep Running?
            </h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="max-w-xl text-[14.5px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
              Most owners are wrong about where their real bottleneck is — guessing wrong is what keeps them stuck. The free scan
              tells you, in about 4 minutes, based on your own answers.
            </p>
          </FadeUp>
          <FadeUp delayMs={240}>
            <LinkButton href="/scan" variant="primary" className="glow-gold-idle px-8 py-4 text-[15px]">
              Get Your Free Score
            </LinkButton>
          </FadeUp>
        </div>
      </section>

      {/* RECOGNITION — what it feels like to be the bottleneck */}
      <PhotoSection src="/images/photography/warehouse-interior.webp" alt="" className="border-y border-[var(--hairline)]">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Sound Familiar?" title="What It Feels Like When You're the Bottleneck" align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {RECOGNITION_BLOCKS.map((block, i) => (
              <FadeUp key={block.title} delayMs={i * 80}>
                <Card className="flex h-full flex-col gap-2">
                  <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{block.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)]">{block.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </PhotoSection>

      {/* WHAT THE SCAN ACTUALLY IS — real report screenshot, plain facts */}
      <section className="page-container py-11 sm:py-14">
        <TwoColSection
          visual={
            <FadeUp>
              <ScreenshotStage
                src="/images/product/report-screenshot.webp"
                alt="A completed VERUS business assessment report showing an enterprise score, category breakdown, and ranked bottleneck list"
              />
            </FadeUp>
          }
        >
          <FadeUp>
            <SectionHeading eyebrow="The Scan" title="No Call Required. Just a Real Answer." />
          </FadeUp>
          <FadeUp delayMs={80}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              This is the actual report you get — not a sales deck, the real output. Here&apos;s exactly what&apos;s in it:
            </p>
          </FadeUp>
          <Card className="flex flex-col gap-3.5">
            {SCAN_FACTS.map((fact, i) => (
              <FadeUp key={fact} delayMs={140 + i * 60}>
                <div className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--cream)]">
                  <span className="text-[var(--green)]">✓</span>
                  <span>{fact}</span>
                </div>
              </FadeUp>
            ))}
          </Card>
        </TwoColSection>
      </section>

      {/* WHY IT ISN'T A SALES TRICK */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Why Trust the Score" title="This Isn't a Lead-Gen Trick" align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TRUST_POINTS.map((point, i) => (
              <FadeUp key={point.title} delayMs={i * 100}>
                <div className="hover-lift glass-panel flex h-full flex-col gap-2 p-5 text-center">
                  <h3 className="text-[13.5px] font-semibold text-[var(--cream)]">{point.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{point.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* WHO VERUS IS — three locked positioning lines, two condensed case studies */}
      <PhotoSection src="/images/photography/handshake.webp" alt="">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Who's Behind This" title="VERUS Operating Company" align="center" />
          </FadeUp>
          <FadeUp>
            <div className="mx-auto flex max-w-2xl flex-col gap-2.5 text-center">
              <p className="text-[13.5px] leading-relaxed text-[var(--cream)]">{POSITIONING.notConsulting}</p>
              <p className="text-[13.5px] leading-relaxed text-[var(--cream)]">{POSITIONING.approach}</p>
              <p className="text-[13.5px] leading-relaxed text-[var(--cream)]">{POSITIONING.whoWeServe}</p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {CASE_STUDIES.map((cs, i) => (
              <FadeUp key={cs.slug} delayMs={i * 100}>
                <Card strong className="flex h-full flex-col gap-2">
                  <p className="text-[14px] font-semibold text-[var(--cream)]">
                    {cs.client} <span className="font-normal text-[var(--muted)]">— {cs.industry}</span>
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{cs.summary}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </PhotoSection>

      {/* FAQ */}
      <section className="page-container flex flex-col gap-10 py-11 sm:py-14">
        <FadeUp>
          <SectionHeading eyebrow="Questions" title="Straight Answers" align="center" />
        </FadeUp>
        <FadeUp>
          <div className="mx-auto w-full max-w-2xl">
            <FaqAccordion items={START_FAQ} />
          </div>
        </FadeUp>
      </section>

      {/* CLOSING CTA — the only other exit on the page, offered alongside the scan */}
      <PhotoSection src="/images/photography/construction-workers.webp" alt="" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col items-center gap-6 py-12 text-center sm:py-16">
          <FadeUp>
            <h2 className="max-w-2xl text-[26px] font-semibold leading-tight text-[var(--cream)] sm:text-[34px]">
              Find Out What&apos;s Actually Holding Your Company Back.
            </h2>
          </FadeUp>
          <FadeUp delayMs={100}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/scan" variant="primary" className="glow-gold-idle px-7 py-3.5 text-[14.5px]">
                Get Your Free Score
              </LinkButton>
              <LinkButton href="/contact" variant="secondary" className="px-7 py-3.5 text-[14.5px]">
                Book a Call Instead
              </LinkButton>
            </div>
          </FadeUp>
        </div>
      </PhotoSection>

      {/* Deliberately no footer nav — plain, non-linked close. */}
      <div className="page-container flex justify-center py-8 text-center text-[11px] text-[var(--muted)]">
        &copy; {new Date().getFullYear()} VERUS Operating Company. Delivered remotely, nationwide.
      </div>
    </div>
  );
}
