import type { Metadata } from "next";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { SectionHeading } from "@/modules/marketing/SectionHeading";
import { createAdminClient } from "@/shared/supabase/admin";
import { getCategories, getBands } from "@/modules/assessments/data";

export const metadata: Metadata = {
  title: "The Business Assessment | VERUS Operating Company",
  description:
    "A $2,500 diagnostic across every part of a founder-led business — ranked by what's actually costing you the most, with a build and support recommendation to fix it.",
  openGraph: {
    title: "The Business Assessment | VERUS Operating Company",
    description: "A $2,500 diagnostic that finds your worst bottleneck and ranks what it's actually costing you.",
  },
};

export default async function TheAssessmentPage() {
  // assessment_categories/assessment_bands are RLS-scoped `to authenticated`
  // only (real content, not sensitive) — same reasoning as /scan, so this
  // read goes through the admin client rather than the request-scoped one.
  const admin = createAdminClient();
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let bands: Awaited<ReturnType<typeof getBands>> = [];
  try {
    [categories, bands] = await Promise.all([getCategories(admin), getBands(admin)]);
  } catch {
    // Degrade gracefully if migrations haven't run — the page still explains the assessment, just without the live category/band list.
  }

  return (
    <div className="flex flex-col">
      <section className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <span className="section-label text-[var(--gold-light)]">The Business Assessment</span>
        <h1 className="max-w-3xl text-[30px] font-semibold leading-tight text-[var(--cream)] sm:text-[40px]">
          A real diagnostic, not a sales pitch dressed up as one.
        </h1>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--muted)]">
          The Full Business Assessment is <span className="font-semibold text-[var(--cream)]">$2,500</span>. It goes deep across every
          part of the business, scores it out of 100, and ranks your bottlenecks by what they&apos;re actually costing you — not a guess,
          a real diagnostic result.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
            Try the Free Scan First
          </LinkButton>
          <LinkButton href="/contact" variant="secondary" className="px-6 py-3 text-[14px]">
            Book the Full Assessment
          </LinkButton>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="border-y border-[var(--hairline)] bg-[var(--surface)]">
          <div className="page-container flex flex-col gap-10 py-16 sm:py-20">
            <SectionHeading
              eyebrow="What It Covers"
              title="Every part of the business, weighted by what actually matters"
              description="The categories below are weighted — Operations and Systems carry more weight than Vision or Marketing, because that's where founder-led businesses are usually actually bottlenecked."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories
                .slice()
                .sort((a, b) => b.weight - a.weight)
                .map((c) => (
                  <Card key={c.id} className="flex items-center justify-between gap-3 py-3.5">
                    <span className="text-[13px] text-[var(--cream)]">{c.name}</span>
                    <span className="font-tabular text-[12px] text-[var(--gold-light)]">weight {c.weight}</span>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-container flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading eyebrow="The Result" title="A score, a band, and a ranked list of what to fix first" align="center" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card className="flex flex-col gap-2">
            <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">An Enterprise Score</h3>
            <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">A single number out of 100 that reflects where the business actually stands today.</p>
          </Card>
          <Card className="flex flex-col gap-2">
            <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">A Band</h3>
            <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
              {bands.length > 0
                ? `From ${bands[0]?.label ?? "Founder Dependent"} to ${bands[bands.length - 1]?.label ?? "Enterprise Ready"} — a plain-language read on where you stand.`
                : "A plain-language read on where the business stands, from founder-dependent to enterprise-ready."}
            </p>
          </Card>
          <Card className="flex flex-col gap-2">
            <h3 className="text-[14.5px] font-semibold text-[var(--cream)]">A Ranked Bottleneck List</h3>
            <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">Your biggest constraints, ranked by weighted impact — so the build addresses what's actually costing you the most, first.</p>
          </Card>
        </div>
      </section>

      <section className="border-t border-[var(--hairline)] bg-[var(--surface)]">
        <div className="page-container flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-[24px] font-semibold leading-tight text-[var(--cream)] sm:text-[30px]">
            Not ready for the full assessment? Start with the free scan.
          </h2>
          <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--muted)]">A shorter, no-cost version that still gives you a real score in minutes.</p>
          <LinkButton href="/scan" variant="primary" className="px-6 py-3 text-[14px]">
            Get Your Free Score
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
