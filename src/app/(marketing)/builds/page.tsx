import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { DiagramHero } from "@/modules/marketing/DiagramHero";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { BuildStackDiagram } from "@/modules/marketing/PageHeroIcons";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { BUILD_TIER_INFO, BUILD_TIERS } from "@/modules/assessments/buildTiers";
import { redactPriceMentions } from "@/modules/assessments/pricingGate";

export const metadata: Metadata = {
  title: "Build Packages | VERUS Operating Company",
  description:
    "Foundation, Growth, and Enterprise builds — the systems, software, and processes VERUS builds to fix a founder-led business's worst bottleneck first. Scoped to your business after a Business Assessment.",
  openGraph: {
    title: "Build Packages | VERUS Operating Company",
    description: "Foundation, Growth, and Enterprise builds — scoped to your business, not a template.",
  },
};

export default function BuildsPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container py-12 sm:py-16">
        <TwoColSection
          visual={
            <FadeUp>
              <DiagramHero><BuildStackDiagram className="h-full w-full" /></DiagramHero>
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">Build Packages</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
              Scoped to Your Business, Not a Template.
            </h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">
              Every build is scoped from your own Business Assessment — the tier and price are exact recommendations for your business,
              not a generic package. What follows is the shape of each tier; your own number comes from the assessment.
            </p>
          </FadeUp>
        </TwoColSection>
      </section>

      <PhotoSection src="/images/photography/handshake.webp" className="border-y border-[var(--hairline)]">
        <div className="page-container flex flex-col gap-10 py-11 sm:py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {BUILD_TIERS.filter((t) => t !== "custom").map((tier, i) => {
            const info = BUILD_TIER_INFO[tier];
            return (
              <FadeUp key={tier} delayMs={i * 100}>
                <Card strong className="hover-lift flex h-full flex-col gap-4">
                  <div>
                    <p className="text-[18px] font-semibold text-[var(--gold-light)]">{info.label}</p>
                    <p className="mt-1 text-[12px] text-[var(--muted)]">{info.forCompanies}</p>
                  </div>
                  <p className="text-[11.5px] text-[var(--muted)]">Timeline: {info.timeline}</p>
                  <div>
                    <p className="section-label">Included</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {info.included.map((item) => (
                        <li key={redactPriceMentions(item, false)} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--cream)]">
                          <span className="text-[var(--green)]">✓</span>
                          <span>{redactPriceMentions(item, false)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp>
          <Card className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-[15px] font-semibold text-[var(--cream)]">{BUILD_TIER_INFO.custom.label}</p>
            <p className="max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
              {redactPriceMentions(BUILD_TIER_INFO.custom.forCompanies, false)} Scoped and quoted individually.
            </p>
          </Card>
        </FadeUp>
        </div>
      </PhotoSection>

      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Every Build Includes" title="Support and Systems That Keep Running After Handover" align="center" />
          </FadeUp>
          <FadeUp delayMs={80}>
            <Badge tone="gold">Every build bundles a Software, Systems & Support subscription</Badge>
          </FadeUp>
          <FadeUp delayMs={140}>
            <LinkButton href="/systems-and-support" variant="secondary" className="mt-2 px-6 py-3 text-[14px]">
              See Software, Systems & Support
            </LinkButton>
          </FadeUp>
        </div>
      </section>

      <section className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
        <FadeUp>
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Your Exact Tier and Price Come From Your Business Assessment.
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
