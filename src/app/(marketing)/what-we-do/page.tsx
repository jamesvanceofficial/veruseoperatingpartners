import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { POSITIONING, HOW_IT_WORKS_STEPS } from "@/modules/marketing/positioning";

export const metadata: Metadata = {
  title: "What We Do | VERUS Operating Company",
  description:
    "VERUS is not a consulting or coaching firm. We diagnose the worst bottleneck in a founder-led business, build the systems and processes to fix it, and stay embedded running it.",
  openGraph: {
    title: "What We Do | VERUS Operating Company",
    description: "We diagnose, we build, and we stay embedded running it — systems and processes, always both.",
  },
};

const BUILD_ITEMS = [
  { title: "Websites", description: "A site built to generate and convert leads, not just describe the business." },
  { title: "Software", description: "The core system running day-to-day operations — CRM, scheduling, tracking, whatever the business actually needs." },
  { title: "SOPs", description: "Documented, step-by-step processes anyone on the team can follow — not tribal knowledge in one person's head." },
  { title: "Dashboards", description: "Real visibility into what's actually happening in the business, not a gut feeling." },
  { title: "Automations", description: "Repetitive work taken off a person's plate and handled by the system instead." },
  { title: "Documentation", description: "Everything written down — so the business doesn't depend on one person's memory." },
  { title: "Ongoing Support", description: "We stay embedded, keeping what we built running and current as the business changes." },
];

export default function WhatWeDoPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <span className="section-label text-[var(--gold-light)]">What We Do</span>
        <h1 className="max-w-3xl text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
          We diagnose. We build. We stay embedded running it.
        </h1>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.notConsulting}</p>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.approach}</p>
      </section>

      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading eyebrow="Systems and Processes" title={POSITIONING.systemsAndProcesses} description="A system with no process behind it doesn't get used. A process with no system behind it doesn't scale. We build both, together." />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BUILD_ITEMS.map((item) => (
              <Card key={item.title} className="flex flex-col gap-2">
                <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{item.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading eyebrow="How We Work" title="Worst bottleneck first" align="center" />
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

      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <SectionHeading eyebrow="Who We Serve" title="Founder-led, $1M–$25M, industry agnostic" align="center" />
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.whoWeServe}</p>
          <p className="text-[13.5px] font-medium text-[var(--cream)]">{POSITIONING.delivery}</p>
          <LinkButton href="/scan" variant="primary" className="mt-2 px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
