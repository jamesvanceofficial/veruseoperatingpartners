import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
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

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="page-container flex flex-col items-center gap-6 py-11 text-center sm:py-14">
        <FadeUp>
          <span className="section-label text-[var(--gold-light)]">Contact</span>
        </FadeUp>
        <FadeUp delayMs={80}>
          <h1 className="max-w-2xl text-[28px] font-semibold leading-tight text-[var(--cream)] sm:text-[36px]">
            Tell us about your business.
          </h1>
        </FadeUp>
        <FadeUp delayMs={160}>
          <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--muted)]">
            We&apos;ll follow up to schedule a call. If you&apos;d rather start now, the free scan takes minutes.
          </p>
        </FadeUp>
        <FadeUp delayMs={220}>
          <LinkButton href="/scan" variant="secondary" className="px-5 py-2.5 text-[13px]">
            Or get your free score first
          </LinkButton>
        </FadeUp>
      </section>

      <section className="page-container pb-20">
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
