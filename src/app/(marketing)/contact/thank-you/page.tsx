import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";

export const metadata: Metadata = {
  title: "Thank You | VERUS Operating Company",
  description: "We've received your message and will follow up to schedule a call.",
};

export default function ContactThankYouPage() {
  return (
    <section className="page-container flex flex-col items-center gap-6 py-24 text-center">
      <Card strong className="fade-scale-in flex max-w-lg flex-col items-center gap-5 px-8 py-12">
        <span className="section-label text-[var(--gold-light)]">Thank You</span>
        <h1 className="text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[28px]">We&apos;ve Got It.</h1>
        <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
          We&apos;ll follow up to schedule a call. While you wait, take the free scan — it takes a few minutes and gives you a real
          score for your business right now.
        </p>
        <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
          Get Your Free Score
        </LinkButton>
      </Card>
    </section>
  );
}
