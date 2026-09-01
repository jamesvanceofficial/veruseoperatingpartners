import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { DiagramHero } from "@/modules/marketing/DiagramHero";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { UptimeShieldDiagram } from "@/modules/marketing/PageHeroIcons";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { SUPPORT_TIER_INFO, SUPPORT_TIERS, SUPPORT_SUBSCRIPTION_NAME } from "@/modules/assessments/buildTiers";
import { redactPriceMentions } from "@/modules/assessments/pricingGate";

export const metadata: Metadata = {
  title: "Software, Systems & Support | VERUS Operating Company",
  description:
    "The ongoing subscription that keeps what VERUS builds running, current, and used — hosting, fixes, included monthly work, training, and a system review. Bundled with every build.",
  openGraph: {
    title: "Software, Systems & Support | VERUS Operating Company",
    description: "What keeps running after handover, and who's responsible for it.",
  },
};

const HEADING_LABELS: Record<"keepingItRunning" | "keepingItCurrent" | "keepingItUsed" | "access", string> = {
  keepingItRunning: "Keeping It Running",
  keepingItCurrent: "Keeping It Current",
  keepingItUsed: "Keeping It Used",
  access: "Access",
};

export default function SystemsAndSupportPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container py-12 sm:py-16">
        <TwoColSection
          reverse
          visual={
            <FadeUp>
              <DiagramHero><UptimeShieldDiagram className="h-full w-full" /></DiagramHero>
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">{SUPPORT_SUBSCRIPTION_NAME}</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
              What We Build Doesn&apos;t Stop Working the Day We Hand It Over.
            </h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">
              Every build is bundled with an ongoing subscription that keeps it running, keeps it current as the business changes, and
              keeps your team actually using it. Pulled directly from the same tier structure your build recommendation is scoped from
              — nothing here can drift from what you&apos;d actually see.
            </p>
          </FadeUp>
        </TwoColSection>
      </section>

      <section className="page-container flex flex-col gap-6 pb-11 sm:pb-14">
        {SUPPORT_TIERS.filter((t) => t !== "custom").map((tier, i) => {
          const info = SUPPORT_TIER_INFO[tier];
          return (
            <FadeUp key={tier} delayMs={i * 80}>
              <Card strong className="hover-lift flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[17px] font-semibold text-[var(--gold-light)]">{info.label}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[var(--muted)]">
                    <span>{info.includedSeats !== null ? `${info.includedSeats} seats included` : "Unlimited seats"}</span>
                    <span>{info.includedHoursPerMonth} hrs/mo included</span>
                    <span>{info.responseTime} response</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(info.scope) as (keyof typeof info.scope)[]).map((heading) => (
                    <div key={heading}>
                      <p className="section-label">{HEADING_LABELS[heading]}</p>
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {info.scope[heading].map((item) => (
                          <li key={redactPriceMentions(item, false)} className="text-[12px] leading-relaxed text-[var(--cream)]">
                            {redactPriceMentions(item, false)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeUp>
          );
        })}

        <FadeUp>
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-[15px] font-semibold text-[var(--cream)]">{SUPPORT_TIER_INFO.custom.label}</p>
            <p className="text-[13px] text-[var(--muted)]">Scoped and quoted individually for larger or more complex operations.</p>
          </Card>
        </FadeUp>
      </section>

      <PhotoSection src="/images/photography/warehouse-interior.webp" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="Included with Every Build" title="Support Tier Is Scoped By the Business Assessment" align="center" />
          </FadeUp>
          <FadeUp delayMs={80}>
            <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--muted)]">
              Your recommended tier and price are part of your build recommendation — matched to your team size and how much ongoing
              work the assessment found you actually need.
            </p>
          </FadeUp>
          <FadeUp delayMs={140}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
                Get Your Free Score
              </LinkButton>
              <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
                Book a Call
              </LinkButton>
            </div>
          </FadeUp>
        </div>
      </PhotoSection>
    </div>
  );
}
