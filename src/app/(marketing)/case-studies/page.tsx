import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { CASE_STUDIES } from "@/modules/marketing/caseStudies";

export const metadata: Metadata = {
  title: "Case Studies | VERUS Operating Company",
  description: "What VERUS actually built for RBL Safety and Radiant Moments, and what changed as a result — no invented numbers, no testimonials dressed up as data.",
  openGraph: {
    title: "Case Studies | VERUS Operating Company",
    description: "What was built, and what changed — written honestly.",
  },
};

export default function CaseStudiesPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <FadeUp>
          <span className="section-label text-[var(--gold-light)]">Case Studies</span>
        </FadeUp>
        <FadeUp delayMs={80}>
          <h1 className="max-w-3xl text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
            What was built, and what changed.
          </h1>
        </FadeUp>
        <FadeUp delayMs={160}>
          <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">Not testimonials — a plain account of the work.</p>
        </FadeUp>
      </section>

      {CASE_STUDIES.map((cs, i) => (
        <section key={cs.slug} className={i % 2 === 1 ? "border-y border-[var(--hairline)] bg-[var(--surface)]" : undefined}>
          <div className="page-container flex flex-col gap-8 py-16 sm:py-20">
            <FadeUp>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-tabular text-[13px] text-[var(--gold-light)]">{String(i + 1).padStart(2, "0")}</span>
                <div className="h-px flex-1 bg-[var(--hairline)]" />
              </div>
            </FadeUp>

            <FadeUp delayMs={40}>
              <div>
                <p className="text-[24px] font-semibold text-[var(--gold-light)] sm:text-[30px]">{cs.client}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="neutral">{cs.location}</Badge>
                  <Badge tone="gold">{cs.industry}</Badge>
                </div>
              </div>
            </FadeUp>

            <FadeUp delayMs={80}>
              <div className="max-w-3xl">
                <p className="section-label">The Situation</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--cream)]">{cs.situation}</p>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FadeUp delayMs={120}>
                <Card strong className="flex h-full flex-col gap-3">
                  <p className="section-label text-[var(--gold-light)]">What Was Built</p>
                  <ul className="flex flex-col gap-2">
                    {cs.whatWasBuilt.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--cream)]">
                        <span className="text-[var(--gold-light)]">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeUp>
              <FadeUp delayMs={180}>
                <Card className="flex h-full flex-col gap-3">
                  <p className="section-label">What Changed</p>
                  <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">{cs.whatChanged}</p>
                </Card>
              </FadeUp>
            </div>

            <FadeUp delayMs={220}>
              <div className="border-l-2 border-[var(--gold)] pl-4">
                <p className="text-[13px] italic leading-relaxed text-[var(--muted)]">{cs.quotePlaceholder}</p>
              </div>
            </FadeUp>
          </div>
        </section>
      ))}

      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <FadeUp>
          <SectionHeading eyebrow="Next" title="Want to know what a build looks like for your business?" align="center" />
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
      </section>
    </div>
  );
}
