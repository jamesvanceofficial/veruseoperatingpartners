import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
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
        <span className="section-label text-[var(--gold-light)]">Case Studies</span>
        <h1 className="max-w-3xl text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
          What was built, and what changed.
        </h1>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">Not testimonials — a plain account of the work.</p>
      </section>

      <section className="page-container flex flex-col gap-8 pb-16 sm:pb-20">
        {CASE_STUDIES.map((cs) => (
          <Card key={cs.slug} strong className="flex flex-col gap-6">
            <div>
              <p className="text-[20px] font-semibold text-[var(--gold-light)]">{cs.client}</p>
              <p className="text-[12px] text-[var(--muted)]">
                {cs.location} · {cs.industry}
              </p>
            </div>

            <p className="text-[13.5px] leading-relaxed text-[var(--cream)]">{cs.summary}</p>

            <div>
              <p className="section-label">What Was Built</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {cs.whatWasBuilt.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--cream)]">
                    <span className="text-[var(--gold-light)]">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="section-label">What Changed</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{cs.whatChanged}</p>
            </div>

            <div className="border-t border-[var(--hairline)] pt-4">
              <p className="text-[12.5px] italic text-[var(--muted)]">{cs.quotePlaceholder}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Want to know what a build looks like for your business?
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
