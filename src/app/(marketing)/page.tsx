import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { PROBLEM_BLOCKS, WHAT_VERUS_BUILDS, HOW_IT_WORKS_STEPS, POSITIONING } from "@/modules/marketing/positioning";
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
      {/* HERO */}
      <section className="page-container flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <span className="section-label text-[var(--gold-light)]">VERUS Operating Company</span>
        <h1 className="max-w-4xl text-[34px] font-semibold leading-[1.1] text-[var(--cream)] sm:text-[48px]">
          From founder-led chaos to system-driven growth.
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--muted)] sm:text-[17px]">
          We find what&apos;s actually holding your company back, then build the systems and processes to fix it.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
          <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
            Book a Call
          </LinkButton>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="page-container flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading eyebrow="The Problem" title="What's actually holding the business back" align="center" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PROBLEM_BLOCKS.map((block) => (
            <Card key={block.title} strong className="flex flex-col gap-2.5">
              <h3 className="text-[15px] font-semibold text-[var(--cream)]">{block.title}</h3>
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">{block.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* WHAT VERUS BUILDS */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            eyebrow="What VERUS Builds"
            title="Systems and processes — always both"
            description="A system with no process behind it doesn't get used. A process with no system behind it doesn't scale. We build both, together, embedded in how the business actually runs."
          />
          <div className="flex flex-wrap gap-3">
            {WHAT_VERUS_BUILDS.map((item) => (
              <span key={item} className="glass-panel px-4 py-2 text-[12.5px] font-medium text-[var(--cream)]">
                {item}
              </span>
            ))}
            <span className="glass-panel px-4 py-2 text-[12.5px] font-medium text-[var(--cream)]">Ongoing Support</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="page-container flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading eyebrow="How It Works" title="Four steps, start to finish" align="center" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((s) => (
            <Card key={s.step} className="flex flex-col gap-2">
              <span className="font-tabular text-[22px] font-semibold text-[var(--gold-light)]">{s.step}</span>
              <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{s.title}</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{s.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* THE ASSESSMENT — ENTRY POINT */}
      <section className="page-container py-16 sm:py-20">
        <div className="glass-panel-strong fade-scale-in flex flex-col items-center gap-6 px-6 py-14 text-center sm:px-14">
          <span className="section-label text-[var(--gold-light)]">Start Here</span>
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Every engagement starts with knowing exactly what&apos;s costing you.
          </h2>
          <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--muted)]">
            The free scan takes minutes and gives you a real score. The Full Business Assessment goes deep across every part of the
            operation and ranks your bottlenecks by what they&apos;re actually costing you.
          </p>
          <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
        </div>
      </section>

      {/* PROOF POINTS */}
      <section className="page-container flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading eyebrow="Proof" title="Built and running, not just proposed" align="center" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.slug} strong className="flex flex-col gap-3">
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
          ))}
        </div>
        <p className="text-center text-[13px] text-[var(--muted)]">{POSITIONING.whoWeServe}</p>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Find out what&apos;s actually holding your company back.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
              Get Your Free Score
            </LinkButton>
            <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
              Book a Call
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
