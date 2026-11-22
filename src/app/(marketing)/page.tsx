import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { CompassRose } from "@/shared/ui/CompassRose";
import { BOOK_A_CALL_HREF, FREE_SCAN_HREF } from "@/modules/marketing/links";
import { BrowserShot } from "@/modules/marketing/home/BrowserShot";
import { Marquee } from "@/modules/marketing/home/Marquee";
import { CtaBand } from "@/modules/marketing/home/CtaBand";
import { PLATFORMS } from "@/modules/marketing/home/platforms";

export const metadata: Metadata = {
  title: "VERUS OPERATING PARTNERS LLC — We build the software your company actually runs on",
  description:
    "Not advice. Not a binder. We find the one thing holding a founder-led business back, build the system that fixes it, and keep it running every month after.",
  openGraph: {
    title: "VERUS OPERATING PARTNERS LLC — We build the software your company actually runs on",
    description: "We find the one thing holding a founder-led business back, build the system that fixes it, and keep it running every month after.",
  },
};

const WHAT_WE_DO = [
  {
    n: "01",
    title: "We find the bottleneck",
    body: "A working session on your company, not a questionnaire. We come out of it knowing the single thing costing you the most money, and why it hasn't been fixed yet.",
  },
  {
    n: "02",
    title: "We build the system",
    body: "Custom software, documented processes, dashboards, automations, the back office — whatever that bottleneck actually needs. Built alongside your people, biggest problem first.",
  },
  {
    n: "03",
    title: "We run it every month",
    body: "It doesn't get handed over and abandoned. We maintain it, extend it and add seats as you grow, for a monthly fee that scales with the company.",
  },
];

const HOW_WE_HELP = [
  {
    title: "Everything goes through me.",
    body: "Every quote, every schedule change, every exception waits on the owner. We move those decisions into a system with rules, so the business runs when you're not in it.",
  },
  {
    title: "I don't trust my own numbers.",
    body: "Jobs, payroll and billing live in different places, so nothing reconciles. We put them on one record, so cost, profit and what's owed stop being opinions.",
  },
  {
    title: "We grew and it broke.",
    body: "What worked at ten people collapses at forty. We rebuild the operating layer underneath so headcount stops being the thing that breaks you.",
  },
  {
    title: "My people are doing robot work.",
    body: "Typing, re-typing, copying between tools, chasing paper. We automate the repeatable parts and document the rest so a new hire is useful in a week.",
  },
];

const NEXT_STEPS = [
  { n: 1, title: "Book a 30-minute call", body: "You describe what's breaking. We tell you what we'd build first and roughly what it costs. No deck, no pitch." },
  {
    n: 2,
    title: "We scope the first build",
    body: "A written proposal for the one bottleneck worth fixing now — what gets built, how long, what it costs, what changes for you.",
  },
  {
    n: 3,
    title: "We build it and run it",
    body: "Work starts within days, not quarters. When it's live, it moves onto a monthly plan that keeps it maintained and growing.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-[28vw] top-1/2 w-[min(1100px,120vw)] -translate-y-1/2 sm:-right-[14vw] lg:-right-[6vw] lg:w-[min(1000px,72vw)]" aria-hidden="true">
          <CompassRose className="compass-spin-slow h-auto w-full" opacity={0.14} />
        </div>
        <div className="page-container relative flex flex-col gap-7 pb-14 pt-16 sm:pb-20 sm:pt-24 lg:pt-28">
          <p className="mono-label">OPERATIONS · SYSTEMS · SOFTWARE</p>
          <h1 className="max-w-[12ch] text-[clamp(44px,9.2vw,108px)] leading-[0.95] text-[var(--white)] sm:max-w-none">
            We build the software
            <br className="hidden sm:inline" /> your company
            <br className="hidden sm:inline" /> actually runs on.
          </h1>
          <p className="max-w-[58ch] text-[17px] leading-relaxed text-[var(--muted-dark)] sm:text-[19px]">
            Not advice. Not a binder. We find the one thing holding a founder-led business back, build the system that fixes it, and keep it running every month after.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={BOOK_A_CALL_HREF} variant="primary">
              Book a call
            </LinkButton>
            <LinkButton href="#built" variant="secondary">
              See what we&apos;ve built
            </LinkButton>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH PRODUCT SHOT */}
      <section className="page-container relative pb-14 sm:pb-20">
        <BrowserShot
          src="/images/platforms/rbl-safety.jpg"
          alt="RBL Safety's live operations platform, built by VERUS, showing officer scheduling and the dispatch desk"
          label="RBL SAFETY — LIVE RIGHT NOW"
          width={1568}
          height={590}
          priority
        />
      </section>

      {/* MARQUEE */}
      <Marquee items={PLATFORMS.map((p) => p.name)} />

      {/* WHAT WE DO — light */}
      <section id="what-we-do" className="mkt-light">
        <div className="page-container flex flex-col gap-12 py-20 sm:py-28">
          <div className="flex flex-col gap-4">
            <p className="mono-label">What we do</p>
            <h2 className="max-w-[20ch] text-[36px] leading-[1.02] sm:text-[60px]">Most companies don&apos;t need advice. They need the thing built.</h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {WHAT_WE_DO.map((c) => (
              <div key={c.n} className="flex flex-col gap-3 border-t border-[var(--hairline-strong)] pt-6">
                <span className="mono-label">{c.n}</span>
                <h3 className="text-[24px] leading-tight">{c.title}</h3>
                <p className="text-[16px] leading-relaxed text-[var(--muted)]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand heading="Stop running the company from your phone." line="One call. We'll tell you what we'd build first and what it would cost." />

      {/* WHAT WE'VE BUILT — intro */}
      <section id="built" className="page-container flex flex-col gap-4 pb-4 pt-20 sm:pt-28">
        <p className="mono-label">What we&apos;ve built</p>
        <h2 className="max-w-[18ch] text-[36px] leading-[1.02] sm:text-[60px]">Six companies run on software we built.</h2>
        <p className="max-w-[62ch] text-[17px] leading-relaxed text-[var(--muted-dark)] sm:text-[19px]">
          Not pilots. Not slide decks. These are the real screens, open right now, in businesses that depend on them to dispatch work, pay people and get paid.
        </p>
      </section>

      {/* SIX PLATFORM ROWS — alternating dark / light, starting dark */}
      {PLATFORMS.map((p, i) => (
        <section key={p.slug} id={p.slug} className={i % 2 === 1 ? "mkt-light" : undefined} aria-labelledby={`${p.slug}-name`}>
          <div className="page-container flex flex-col gap-8 py-16 sm:py-20">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="mono-label">{String(i + 1).padStart(2, "0")}</span>
              <h3 id={`${p.slug}-name`} className="text-[32px] leading-none sm:text-[42px]">
                {p.name}
              </h3>
              <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-3 py-1 text-[13px] font-semibold text-[#08090b]">{p.status}</span>
            </div>
            <BrowserShot src={p.image} alt={p.alt} label={`${p.name} — live`} width={1568} height={590} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                ["Why", p.why],
                ["What we built", p.built],
                ["What it does", p.does],
              ].map(([heading, body]) => (
                <div key={heading} className="flex flex-col gap-2.5">
                  <h4 className="mono-label">{heading}</h4>
                  <p className="text-[16px] leading-relaxed text-[var(--muted)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* HOW WE HELP YOU */}
      <section id="how-we-help" className="border-t border-[var(--hairline)]">
        <div className="page-container flex flex-col gap-12 py-20 sm:py-28">
          <div className="flex flex-col gap-4">
            <p className="mono-label">How we help you</p>
            <h2 className="max-w-[18ch] text-[36px] leading-[1.02] sm:text-[60px]">Which one of these is your company?</h2>
            <p className="max-w-[60ch] text-[17px] leading-relaxed text-[var(--muted-dark)] sm:text-[19px]">
              If you recognise yourself in one of these, we have already built the fix for somebody else.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {HOW_WE_HELP.map((c) => (
              <div key={c.title} className="flex flex-col gap-4 rounded-[20px] border border-[var(--hairline)] bg-[var(--raised)] p-7 sm:p-9">
                <h3 className="text-[26px] leading-tight text-[var(--accent)] sm:text-[30px]">&ldquo;{c.title}&rdquo;</h3>
                <p className="text-[16px] leading-relaxed text-[var(--muted-dark)]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand heading="Recognise your company in there?" line="Then we've already built most of your fix for somebody else." />

      {/* WHAT HAPPENS NEXT — light */}
      <section id="next-steps" className="mkt-light">
        <div className="page-container flex flex-col gap-12 py-20 sm:py-28">
          <div className="flex flex-col gap-4">
            <p className="mono-label">Next steps</p>
            <h2 className="text-[36px] leading-[1.02] sm:text-[60px]">What happens next.</h2>
            <p className="text-[17px] leading-relaxed text-[var(--muted)] sm:text-[19px]">Three steps, and you can stop after any of them.</p>
          </div>
          <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {NEXT_STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[18px] font-bold text-[#08090b]" aria-hidden="true">
                  {s.n}
                </span>
                <h3 className="text-[24px] leading-tight">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.title}
                </h3>
                <p className="text-[16px] leading-relaxed text-[var(--muted)]">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <LinkButton href={BOOK_A_CALL_HREF} variant="primary">
                Book a call
              </LinkButton>
              <LinkButton href={FREE_SCAN_HREF} variant="secondary">
                Not ready? Take the free scan
              </LinkButton>
            </div>
            <p className="text-[15px] text-[var(--muted)]">30 minutes. If it&apos;s not a fit, we&apos;ll tell you on the call.</p>
          </div>
        </div>
      </section>

      {/* FREE SCAN — dark */}
      <section id="free-scan">
        <div className="page-container grid grid-cols-1 items-center gap-12 py-20 sm:py-28 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <p className="mono-label">Free scan</p>
            <h2 className="text-[36px] leading-[1.02] sm:text-[52px]">Not ready to talk? Find out where you stand.</h2>
            <p className="max-w-[54ch] text-[17px] leading-relaxed text-[var(--muted-dark)]">
              Ten minutes, ten categories, a live score as you answer. You get your ranked bottlenecks and where you sit on the operator scale. Nothing to pay, no call required.
            </p>
            <div>
              <LinkButton href={FREE_SCAN_HREF} variant="primary">
                Take the free scan
              </LinkButton>
            </div>
          </div>
          <div className="h-[360px] overflow-hidden rounded-[20px] border border-[var(--hairline-strong)] bg-[var(--raised)] sm:h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/product/report-screenshot.webp"
              alt="A VERUS free scan result showing the overall score, the operator scale and the ranked bottleneck list"
              width={1400}
              height={1931}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
