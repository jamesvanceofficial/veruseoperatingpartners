import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
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
      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <span className="section-label text-[var(--gold-light)]">Build Packages</span>
        <h1 className="max-w-3xl text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
          Scoped to your business, not a template.
        </h1>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">
          Every build is scoped from your own Business Assessment — the tier and price are exact recommendations for your business, not a
          generic package. What follows is the shape of each tier; your own number comes from the assessment.
        </p>
      </section>

      <section className="page-container flex flex-col gap-10 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {BUILD_TIERS.filter((t) => t !== "custom").map((tier) => {
            const info = BUILD_TIER_INFO[tier];
            return (
              <Card key={tier} strong className="flex flex-col gap-4">
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
            );
          })}
        </div>

        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-[15px] font-semibold text-[var(--cream)]">{BUILD_TIER_INFO.custom.label}</p>
          <p className="max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            {redactPriceMentions(BUILD_TIER_INFO.custom.forCompanies, false)} Scoped and quoted individually.
          </p>
        </Card>
      </section>

      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <SectionHeading eyebrow="Every Build Includes" title="Support and systems that keep running after handover" align="center" />
          <Badge tone="gold">Every build bundles a Software, Systems & Support subscription</Badge>
          <LinkButton href="/systems-and-support" variant="secondary" className="mt-2 px-6 py-3 text-[14px]">
            See Software, Systems & Support
          </LinkButton>
        </div>
      </section>

      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
          Your exact tier and price come from your Business Assessment.
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
