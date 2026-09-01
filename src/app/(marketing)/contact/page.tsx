import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { PhotoFrame } from "@/modules/marketing/PhotoFrame";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { TwoColSection } from "@/modules/marketing/TwoColSection";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { ContactForm } from "@/modules/marketing/ContactForm";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";

export const metadata: Metadata = {
  title: "Contact | VERUS Operating Company",
  description: "Tell us about your business — we'll follow up to schedule a call. Prefer a faster starting point? Take the free scan first.",
  openGraph: {
    title: "Contact | VERUS Operating Company",
    description: "Tell us about your business and we'll follow up to schedule a call.",
  },
};

const NEXT_STEPS = [
  { step: "01", title: "We Review It", description: "Every submission goes to a real person, not a queue." },
  { step: "02", title: "We Schedule a Call", description: "A short conversation to understand the business before anything is proposed." },
  { step: "03", title: "We Scope It Honestly", description: "If it's not a fit, we'll say so — no pressure to move forward." },
];

const CALL_FACTS = [
  { label: "Format", detail: "Phone or video — whichever you prefer." },
  { label: "Length", detail: "Usually 20-30 minutes." },
  { label: "What we cover", detail: "Your business, what's actually slowing it down, and whether VERUS is a fit." },
  { label: "What we don't do", detail: "Sell you anything on the call. If it's not a fit, we'll say so and end it there." },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container py-11 sm:py-14">
        <TwoColSection
          visual={
            <FadeUp>
              <PhotoFrame src="/images/photography/notebook-desk.webp" alt="" />
            </FadeUp>
          }
        >
          <FadeUp>
            <span className="section-label text-[var(--gold-light)]">Contact</span>
          </FadeUp>
          <FadeUp delayMs={80}>
            <h1 className="text-[28px] font-semibold leading-tight text-[var(--cream)] sm:text-[36px]">Tell Us About Your Business.</h1>
          </FadeUp>
          <FadeUp delayMs={160}>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              We&apos;ll follow up to schedule a call. If you&apos;d rather start now, the free scan takes minutes.
            </p>
          </FadeUp>
          <FadeUp delayMs={220}>
            <LinkButton href="/scan" variant="secondary" className="self-start px-5 py-2.5 text-[13px]">
              Or get your free score first
            </LinkButton>
          </FadeUp>
        </TwoColSection>
      </section>

      <section className="page-container pb-16">
        <div className="mx-auto max-w-2xl">
          <FadeUp>
            <ContactForm />
          </FadeUp>
        </div>
      </section>

      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container py-11 sm:py-14">
          <TwoColSection
            reverse
            visual={
              <FadeUp>
                <Card strong className="flex flex-col gap-4">
                  {CALL_FACTS.map((f) => (
                    <div key={f.label} className="flex flex-col gap-1 border-b border-[var(--hairline)] pb-4 last:border-b-0 last:pb-0">
                      <span className="section-label text-[var(--gold-light)]">{f.label}</span>
                      <p className="text-[13px] leading-relaxed text-[var(--cream)]">{f.detail}</p>
                    </div>
                  ))}
                </Card>
              </FadeUp>
            }
          >
            <FadeUp>
              <span className="section-label text-[var(--gold-light)]">The Call</span>
            </FadeUp>
            <FadeUp delayMs={80}>
              <h2 className="text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
                What Actually Happens on a Discovery Call.
              </h2>
            </FadeUp>
            <FadeUp delayMs={160}>
              <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
                It&apos;s a conversation, not a pitch. We ask about the business, you ask about VERUS, and we&apos;re honest with each
                other about whether it&apos;s a fit. Nothing gets sold on this call — if a next step makes sense, we&apos;ll talk about
                what that looks like; if it doesn&apos;t, you&apos;ll hear that plainly and the call just ends.
              </p>
            </FadeUp>
          </TwoColSection>
        </div>
      </section>

      <PhotoSection src="/images/photography/whiteboard-discussion.webp" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col gap-8 py-11 sm:py-14">
          <FadeUp>
            <SectionHeading eyebrow="What Happens Next" title="No Black Box After You Hit Submit" align="center" />
          </FadeUp>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {NEXT_STEPS.map((s, i) => (
              <FadeUp key={s.step} delayMs={i * 80}>
                <div className="hover-lift glass-panel flex h-full flex-col gap-2 p-5">
                  <span className="font-tabular text-[20px] font-semibold text-[var(--gold-light)]">{s.step}</span>
                  <h3 className="text-[14px] font-semibold text-[var(--cream)]">{s.title}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{s.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </PhotoSection>
    </div>
  );
}
