import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { DiagramHero } from "@/modules/marketing/DiagramHero";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { OperatorDiagram } from "@/modules/marketing/AboutIcons";

export const metadata: Metadata = {
  title: "James Vance | VERUS Operating Company",
  description:
    "James Vance is an entrepreneur, business owner, investor, and operator with experience across real estate, oil and gas, telecommunications, security, construction, sales, and business development.",
  openGraph: {
    title: "James Vance | VERUS Operating Company",
    description: "The operator behind VERUS Operating Company.",
  },
};

const FIRST_PARAGRAPH =
  "James Vance is an entrepreneur, business owner, investor, and operator with experience across real estate, oil and gas, telecommunications, security, construction, sales, and business development.";

const REMAINING_PARAGRAPHS = [
  "His background is rooted in building businesses, improving operations, developing systems and processes, and creating the structure companies need to grow. He has hands-on experience in business development, acquisitions, project management, sales leadership, operational systems, process improvement, and strategic relationship building.",
  "James brings an operator's mindset to VERUS Operating Partners, with a focus on identifying inefficiencies, building repeatable processes, strengthening execution, and helping businesses operate more effectively. His approach centers on creating scalable systems, improving accountability, and developing practical solutions that support long-term growth.",
  "Across investments, operating companies, and strategic partnerships, James focuses on disciplined execution, strong relationships, and building businesses that create durable long-term value.",
];

const SECTORS = ["Real Estate", "Oil & Gas", "Telecommunications", "Security", "Construction", "Sales", "Business Development"];

const CAPABILITIES = [
  "Business Development",
  "Acquisitions",
  "Project Management",
  "Sales Leadership",
  "Operational Systems",
  "Process Improvement",
  "Strategic Relationships",
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* HERO — name + first paragraph, operator diagram as the visual */}
      <section className="page-container py-12 sm:py-16">
        <TwoColSection
          visual={
            <FadeUp>
              <DiagramHero><OperatorDiagram className="h-full w-full" /></DiagramHero>
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">About</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[32px] font-semibold leading-tight text-[var(--cream)] sm:text-[44px]">James Vance</h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">{FIRST_PARAGRAPH}</p>
          </FadeUp>
        </TwoColSection>
      </section>

      {/* REMAINING PARAGRAPHS — readable measure, not full width */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container py-12 sm:py-16">
          <div className="mx-auto flex max-w-[680px] flex-col gap-5">
            {REMAINING_PARAGRAPHS.map((p, i) => (
              <FadeUp key={p} delayMs={i * 80}>
                <p className="text-[14.5px] leading-relaxed text-[var(--cream)]">{p}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTOR EXPERIENCE */}
      <section className="page-container flex flex-col items-center gap-6 py-12 text-center sm:py-16">
        <FadeUp>
          <span className="section-label text-[var(--gold-light)]">Experience Across</span>
        </FadeUp>
        <FadeUp delayMs={60}>
          <div className="flex flex-wrap justify-center gap-3">
            {SECTORS.map((s) => (
              <span key={s} className="glass-panel px-4 py-2 text-[12.5px] font-medium text-[var(--cream)]">
                {s}
              </span>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* CAPABILITIES */}
      <PhotoSection src="/images/photography/handshake.webp" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col items-center gap-6 py-12 text-center sm:py-16">
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">Core Capabilities</span>
          </FadeUp>
          <FadeUp delayMs={60}>
            <div className="flex flex-wrap justify-center gap-3">
              {CAPABILITIES.map((c) => (
                <span key={c} className="glass-panel px-4 py-2 text-[12.5px] font-medium text-[var(--cream)]">
                  {c}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </PhotoSection>

      {/* CTA */}
      <section className="page-container flex flex-col items-center gap-6 py-12 text-center sm:py-16">
        <FadeUp>
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Start with a Real Look at What&apos;s Holding Your Business Back.
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
      </section>
    </div>
  );
}
