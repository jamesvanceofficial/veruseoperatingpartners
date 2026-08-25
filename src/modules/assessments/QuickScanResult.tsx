import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/LinkButton";
import { cn } from "@/shared/ui/cn";
import { ScoreGauge } from "./ScoreGauge";
import { categoryScoreTone } from "./scoreTone";
import { CATEGORY_BOTTLENECK_COPY } from "./bottleneckCopy";
import type { CategoryScoreDetail } from "./types";

const TONE_BAR: Record<"green" | "yellow" | "red", string> = {
  green: "bg-[var(--green)]",
  yellow: "bg-[var(--yellow)]",
  red: "bg-[var(--red)]",
};

function CategoryBars({ categoryScores }: { categoryScores: CategoryScoreDetail[] }) {
  const byWeight = [...categoryScores].sort((a, b) => b.weight - a.weight);
  return (
    <div className="flex flex-col gap-3.5">
      {byWeight.map((c) => {
        const tone = categoryScoreTone(c.rawScore);
        return (
          <div key={c.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] font-medium text-[var(--cream)]">{c.categoryName}</span>
              <Badge tone={tone}>{c.rawScore.toFixed(1)} / 10</Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--navy)]">
              <div
                className={cn("h-full rounded-full transition-[width] duration-500 ease-out", TONE_BAR[tone])}
                style={{ width: `${Math.min(100, (c.rawScore / 10) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopBottlenecks({ categoryScores }: { categoryScores: CategoryScoreDetail[] }) {
  const top3 = [...categoryScores].sort((a, b) => a.bottleneckRank - b.bottleneckRank).slice(0, 3);
  return (
    <div className="flex flex-col gap-3">
      {top3.map((c, i) => (
        <Card key={c.categoryId} className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-tabular text-[13px] text-[var(--gold-light)]">#{i + 1}</span>
            <span className="text-[14px] font-semibold text-[var(--cream)]">{c.categoryName}</span>
            <Badge tone={categoryScoreTone(c.rawScore)}>{c.rawScore.toFixed(1)} / 10</Badge>
          </div>
          <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{CATEGORY_BOTTLENECK_COPY[c.categoryName] ?? ""}</p>
        </Card>
      ))}
    </div>
  );
}

/**
 * Quick Scan's result — the free scan's entire pitch is this page. Shown
 * on /scan right after submit, and on /assessment/[token] and inside
 * COMPASS for a completed quick_scan assessment. Every surface passes the
 * same AssessmentReport-shaped data (categoryScores, bandLabel,
 * bandDescription), so this component never has to know which one called
 * it.
 */
export function QuickScanResult({
  score,
  bandLabel,
  bandDescription,
  categoryScores,
}: {
  score: number;
  bandLabel: string | null;
  bandDescription: string | null;
  categoryScores: CategoryScoreDetail[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card strong className="flex flex-col items-center gap-4 py-8 text-center sm:py-10">
        <ScoreGauge score={score} />
        <div className="flex flex-col items-center gap-1.5">
          <span className="section-label">Your Band</span>
          <p className="text-[20px] font-semibold text-[var(--gold-light)]">{bandLabel ?? "—"}</p>
          {bandDescription ? <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[var(--muted)]">{bandDescription}</p> : null}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <p className="section-label">All Ten Categories</p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">Every category, scored out of 10. The weakest ones are colored to stand out.</p>
        </div>
        <CategoryBars categoryScores={categoryScores} />
      </Card>

      <div className="flex flex-col gap-3">
        <div className="px-0.5">
          <p className="section-label">Your Top 3 Bottlenecks</p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">Ranked by how much they're actually costing you, not just how low they scored.</p>
        </div>
        <TopBottlenecks categoryScores={categoryScores} />
      </div>

      <Card className="flex flex-col gap-3">
        <p className="section-label">What This Scan Doesn&apos;t Tell You</p>
        <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
          This is 20 questions — 2 per category. Enough to spot a pattern, not enough to build a plan around. It doesn&apos;t show you:
        </p>
        <ul className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
          <li>— Every question in every category: the complete picture, not a sample</li>
          <li>— Your exact numbers, not just a band</li>
          <li>— How you compare to other businesses like yours</li>
          <li>— A build plan ranked by what will move the needle first</li>
        </ul>
        <p className="text-[12.5px] font-medium text-[var(--cream)]">That&apos;s what the Full Business Assessment covers.</p>
      </Card>

      <Card strong className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="section-label">Next Step</span>
        <p className="text-[19px] font-semibold text-[var(--cream)]">Want the full picture?</p>
        <p className="max-w-md text-[13px] leading-relaxed text-[var(--muted)]">
          A 20-minute call with VERUS. We&apos;ll walk through your results, tell you honestly whether a Full Business Assessment is the
          right next step, and what it would actually cover for a business like yours.
        </p>
        <LinkButton href="/" variant="primary" className="mt-1 px-8 py-3 text-[13.5px]">
          Talk to VERUS
        </LinkButton>
      </Card>
    </div>
  );
}
