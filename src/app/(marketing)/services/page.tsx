import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { DiagramHero } from "@/modules/marketing/DiagramHero";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { CompassDivider } from "@/modules/marketing/CompassDivider";
import { IconReveal } from "@/modules/marketing/IconReveal";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { StaffedSystemDiagram } from "@/modules/marketing/PageHeroIcons";
import { SERVICE_ICONS } from "@/modules/marketing/serviceIconMap";
import { SERVICE_AREAS, WHY_THROUGH_VERUS, SERVICE_TIMING, SERVICES_PRICING_NOTE, VA_MIN_HOURS_LABEL } from "@/modules/marketing/services";

export const metadata: Metadata = {
  title: "Services | VERUS Operating Company",
  description:
    "Managed marketing, personal assistants, administration, and trained virtual staff — the ongoing work VERUS staffs and runs inside the systems we build.",
  openGraph: {
    title: "Services | VERUS Operating Company",
    description: "VERUS doesn't just build the systems — we staff and run the work inside them.",
  },
};

const TIMING_LABEL: Record<"after_build" | "any_time", string> = {
  after_build: "After a completed build",
  any_time: "Can start any time",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* HERO — diagram right, text left, same shape as What We Do / Systems & Support */}
      <section className="page-container py-12 sm:py-16">
        <TwoColSection
          reverse
          visual={
            <FadeUp>
              <DiagramHero>
                <StaffedSystemDiagram className="h-full w-full" />
              </DiagramHero>
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">Services</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
              The Work That Keeps Running After the Build.
            </h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">
              VERUS doesn&apos;t just build the systems — we staff and run the work inside them.
            </p>
          </FadeUp>
          <FadeUp delayMs={220}>
            <div className="flex flex-wrap gap-2 pt-1">
              {SERVICE_AREAS.map((s) => (
                <a
                  key={s.slug}
                  href={`#${s.slug}`}
                  className="glass-panel px-3.5 py-1.5 text-[12px] font-medium text-[var(--cream)] transition-colors hover:text-[var(--gold-light)]"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </FadeUp>
        </TwoColSection>
      </section>

      {/* FOUR SERVICE AREAS — alternating diagram/text rows, alternating background bands */}
      {SERVICE_AREAS.map((service, i) => {
        const Icon = SERVICE_ICONS[service.slug];
        const banded = i % 2 === 0;
        return (
          <section
            key={service.slug}
            id={service.slug}
            className={banded ? "border-y border-[var(--hairline)] bg-[var(--surface)]" : undefined}
          >
            <div className="page-container py-11 sm:py-14">
              <TwoColSection
                reverse={i % 2 === 1}
                visual={
                  <FadeUp>
                    <div className="diagram-screen relative mx-auto flex aspect-square max-w-[380px] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--hairline)] p-10">
                      <span className="absolute left-4 top-4 z-10 font-tabular text-[12px] text-[var(--gold-light)]">{service.index}</span>
                      <div className="absolute h-40 w-40 rounded-full bg-[var(--gold)] opacity-20 blur-2xl" aria-hidden="true" />
                      <IconReveal className="relative flex items-center justify-center">
                        <Icon className="h-56 w-56 sm:h-64 sm:w-64" />
                      </IconReveal>
                    </div>
                  </FadeUp>
                }
              >
                <FadeUp>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="section-label text-[var(--gold-light)]">Service {service.index}</span>
                    {service.timing ? (
                      <span className="rounded-full border border-[var(--hairline-strong)] px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
                        {TIMING_LABEL[service.timing]}
                      </span>
                    ) : null}
                  </div>
                </FadeUp>
                <FadeUp delayMs={60}>
                  <h2 className="text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">{service.title}</h2>
                </FadeUp>
                <FadeUp delayMs={120}>
                  <p className="text-[14px] leading-relaxed text-[var(--muted)]">{service.lead}</p>
                </FadeUp>
                <FadeUp delayMs={180}>
                  <ul className="flex flex-col gap-2">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--cream)]">
                        <span className="text-[var(--green)]">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </FadeUp>
                {service.detail ? (
                  <FadeUp delayMs={240}>
                    <div className="flex flex-col gap-2 border-l-2 border-[var(--gold)] pl-4">
                      {service.detail.map((p) => (
                        <p key={p} className="text-[13px] leading-relaxed text-[var(--muted)]">
                          {p}
                        </p>
                      ))}
                    </div>
                  </FadeUp>
                ) : null}
                {service.configNames.length > 0 ? (
                  <FadeUp delayMs={300}>
                    <div className="flex flex-col gap-2 pt-1">
                      <p className="section-label">{service.slug === "virtual-assistance" ? `Roles · ${VA_MIN_HOURS_LABEL}` : "Runs As"}</p>
                      <div className="flex flex-wrap gap-2">
                        {service.configNames.map((name) => (
                          <span key={name} className="glass-panel px-3 py-1.5 text-[12px] font-medium text-[var(--cream)]">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </FadeUp>
                ) : null}
              </TwoColSection>
            </div>
          </section>
        );
      })}

      {/* WHY THROUGH VERUS — real photo band, three cards */}
      <PhotoSection src="/images/photography/whiteboard-discussion.webp" className="border-y border-[var(--hairline)]">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow={WHY_THROUGH_VERUS.eyebrow} title={WHY_THROUGH_VERUS.title} description={WHY_THROUGH_VERUS.summary} align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {WHY_THROUGH_VERUS.points.map((p, i) => (
              <FadeUp key={p.title} delayMs={i * 80}>
                <Card className="hover-lift flex h-full flex-col gap-2">
                  <span className="font-tabular text-[22px] font-semibold text-[var(--gold-light)]">0{i + 1}</span>
                  <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">{p.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{p.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </PhotoSection>

      {/* WHEN EACH SERVICE STARTS — stated plainly, a quiet compass behind the text side */}
      <section className="relative overflow-hidden">
        <CompassDivider side="right" opacity={0.09} />
        <div className="page-container relative flex flex-col gap-8 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Timing" title="When Each Service Starts" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {SERVICE_TIMING.map((t, i) => (
              <FadeUp key={t.label} delayMs={i * 80}>
                <Card strong className="flex h-full flex-col gap-2">
                  <p className="section-label text-[var(--gold-light)]">{t.label}</p>
                  <h3 className="text-[15px] font-semibold text-[var(--cream)]">{t.services}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{t.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING + CTA — no price list, same stance as Builds and Systems & Support */}
      <PhotoSection src="/images/photography/handshake.webp" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Pricing" title="Confirmed on the Call or in the Assessment" align="center" />
          </FadeUp>
          <FadeUp delayMs={80}>
            <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--muted)]">{SERVICES_PRICING_NOTE}</p>
          </FadeUp>
          <FadeUp delayMs={140}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/contact" variant="primary" className="px-6 py-3 text-[14px]">
                Book a Call
              </LinkButton>
              <LinkButton href="/scan" variant="secondary" className="px-6 py-3 text-[14px]">
                Get Your Free Score
              </LinkButton>
            </div>
          </FadeUp>
        </div>
      </PhotoSection>
    </div>
  );
}
