import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { POSITIONING } from "@/modules/marketing/positioning";

export const metadata: Metadata = {
  title: "About James Vance | VERUS Operating Company",
  description: "James Vance leads VERUS Operating Company — diagnosing what's holding founder-led businesses back, building the systems to fix it, and staying embedded running it.",
  openGraph: {
    title: "About James Vance | VERUS Operating Company",
    description: "The operator behind VERUS Operating Company.",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <span className="section-label text-[var(--gold-light)]">About</span>
        <h1 className="max-w-3xl text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">James Vance</h1>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">
          James Vance leads VERUS Operating Company. VERUS exists on a simple belief: founder-led businesses don&apos;t stall because
          their owners aren&apos;t working hard enough — they stall because the business was never built with systems and processes
          that could run without the owner holding every piece of it together.
        </p>
      </section>

      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col gap-8 py-16 sm:py-20">
          <SectionHeading eyebrow="The Approach" title="Not advice from the sidelines" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--cream)]">Not consulting, not coaching</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.notConsulting}</p>
            </Card>
            <Card className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--cream)]">Diagnose, build, stay embedded</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.approach}</p>
            </Card>
            <Card className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--cream)]">Systems and processes, always both</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
                A system nobody follows is dead weight. A process nobody's built the tooling for doesn&apos;t scale. Every engagement
                builds both together.
              </p>
            </Card>
            <Card className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--cream)]">Who VERUS serves</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
                {POSITIONING.whoWeServe} {POSITIONING.delivery}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
          Start with a real look at what&apos;s holding your business back.
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
          <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
            Book a Call
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
