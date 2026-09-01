import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { PullQuote } from "@/modules/marketing/PullQuote";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { POSITIONING, HOW_IT_WORKS_STEPS } from "@/modules/marketing/positioning";
import { DiagramHero } from "@/modules/marketing/DiagramHero";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { SystemsMapDiagram } from "@/modules/marketing/PageHeroIcons";
import { IconReveal } from "@/modules/marketing/IconReveal";
import {
  WebsiteIcon,
  SoftwareIcon,
  SopIcon,
  DashboardIcon,
  AutomationIcon,
  DocumentationIcon,
  SupportIcon,
} from "@/modules/marketing/CategoryIcons";

export const metadata: Metadata = {
  title: "What We Do | VERUS Operating Company",
  description:
    "VERUS is not a consulting or coaching firm. We diagnose the worst bottleneck in a founder-led business, build the systems and processes to fix it, and stay embedded running it.",
  openGraph: {
    title: "What We Do | VERUS Operating Company",
    description: "We diagnose, we build, and we stay embedded running it — systems and processes, always both.",
  },
};

const BUILD_CATEGORIES = [
  {
    index: "01",
    title: "Websites",
    icon: WebsiteIcon,
    description: "A site built to generate and convert leads, not just describe the business.",
    includes: [
      "Built to convert visitors into inquiries, not just look professional",
      "Fast, mobile-first, and structured around what actually drives a lead to reach out",
      "Connected to the rest of the system — leads land somewhere real, not a dead inbox",
    ],
  },
  {
    index: "02",
    title: "Software",
    icon: SoftwareIcon,
    description: "The core system running day-to-day operations — CRM, scheduling, tracking, whatever the business actually needs.",
    includes: [
      "Scoped to the specific bottleneck the assessment found, not a generic package",
      "One system of record instead of scattered spreadsheets and side tools",
      "Built to be run by the team, not just the owner",
    ],
  },
  {
    index: "03",
    title: "SOPs",
    icon: SopIcon,
    description: "Documented, step-by-step processes anyone on the team can follow — not tribal knowledge in one person's head.",
    includes: [
      "Written from how the work actually happens, not a generic template",
      "Specific enough that a new hire could follow them without asking the owner",
      "Kept as living documents tied to the system they describe, not a binder that goes stale",
    ],
  },
  {
    index: "04",
    title: "Dashboards",
    icon: DashboardIcon,
    description: "Real visibility into what's actually happening in the business, not a gut feeling.",
    includes: [
      "Built around the numbers that actually predict trouble, not vanity metrics",
      "Pulled from the real system of record, not manually updated spreadsheets",
      "Simple enough to check in thirty seconds, not a report nobody opens",
    ],
  },
  {
    index: "05",
    title: "Automations",
    icon: AutomationIcon,
    description: "Repetitive work taken off a person's plate and handled by the system instead.",
    includes: [
      "Targeted at the specific repetitive tasks the business flagged, not automation for its own sake",
      "Built to fail safely and visibly, not silently break something downstream",
      "Documented alongside the SOP it replaces or supports",
    ],
  },
  {
    index: "06",
    title: "Documentation",
    icon: DocumentationIcon,
    description: "Everything written down — so the business doesn't depend on one person's memory.",
    includes: [
      "Pricing, process, and who-does-what captured in writing, not in someone's head",
      "Organized so it's actually findable, not a folder nobody opens",
      "Updated as part of the build, not treated as an afterthought",
    ],
  },
  {
    index: "07",
    title: "Ongoing Support",
    icon: SupportIcon,
    description: "We stay embedded, keeping what we built running and current as the business changes.",
    includes: [
      "Hosting, uptime, security patching, and backups handled, not left to the client",
      "Included monthly hours for changes, new automations, and adjustments as the business changes",
      "A system review on a real cadence, not a one-time handoff and silence",
    ],
  },
];

export default function WhatWeDoPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container py-12 sm:py-16">
        <TwoColSection
          reverse
          visual={
            <FadeUp>
              <DiagramHero><SystemsMapDiagram className="h-full w-full" /></DiagramHero>
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">What We Do</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
              We Diagnose. We Build. We Stay Embedded Running It.
            </h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.notConsulting}</p>
          </FadeUp>
          <FadeUp delayMs={220}>
            <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.approach}</p>
          </FadeUp>
        </TwoColSection>
      </section>

      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container py-11 sm:py-14">
          <FadeUp>
            <PullQuote>{POSITIONING.systemsAndProcesses}</PullQuote>
          </FadeUp>
        </div>
      </section>

      {/* PER-CATEGORY BUILD BREAKDOWN — dense 2-up grid, diagram and text
          sharing one card so they read as a pair, not two ends of the
          screen. The last (Ongoing Support) spans full width as a close. */}
      <div className="page-container py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {BUILD_CATEGORIES.map((cat, i) => (
            <FadeUp key={cat.title} delayMs={(i % 2) * 60} className={i === BUILD_CATEGORIES.length - 1 ? "sm:col-span-2" : undefined}>
              <div className="glass-panel-strong flex h-full flex-col gap-4 p-5 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6">
                <div className="diagram-screen relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--hairline)] sm:mx-0 sm:h-auto sm:min-h-36">
                  <span className="absolute left-3 top-3 z-10 font-tabular text-[11px] text-[var(--gold-light)]">{cat.index}</span>
                  <div className="absolute h-20 w-20 rounded-full bg-[var(--gold)] opacity-25 blur-2xl" aria-hidden="true" />
                  <IconReveal className="relative flex items-center justify-center">
                    <cat.icon className="h-24 w-24 sm:h-28 sm:w-28" />
                  </IconReveal>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <h2 className="text-[16.5px] font-semibold text-[var(--cream)]">{cat.title}</h2>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)]">{cat.description}</p>
                  <ul className="flex flex-col gap-1.5 pt-1">
                    {cat.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--cream)]">
                        <span className="text-[var(--green)]">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      <PhotoSection src="/images/photography/whiteboard-discussion.webp" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="How We Work" title="Worst Bottleneck First" align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((s, i) => (
              <FadeUp key={s.step} delayMs={i * 80}>
                <Card className="hover-lift flex h-full flex-col gap-2">
                  <span className="font-tabular text-[22px] font-semibold text-[var(--gold-light)]">{s.step}</span>
                  <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{s.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{s.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </PhotoSection>

      <section className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
        <FadeUp>
          <SectionHeading eyebrow="Who We Serve" title="Founder-Led, $1M–$25M, Industry Agnostic" align="center" />
        </FadeUp>
        <FadeUp delayMs={80}>
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-[var(--muted)]">{POSITIONING.whoWeServe}</p>
        </FadeUp>
        <FadeUp delayMs={140}>
          <p className="text-[13.5px] font-medium text-[var(--cream)]">{POSITIONING.delivery}</p>
        </FadeUp>
        <FadeUp delayMs={200}>
          <LinkButton href="/scan" variant="primary" className="mt-2 px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
        </FadeUp>
      </section>
    </div>
  );
}
