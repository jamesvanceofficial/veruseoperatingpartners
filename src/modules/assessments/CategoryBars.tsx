import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { cn } from "@/shared/ui/cn";
import { categoryScoreTone } from "./scoreTone";

export const TONE_CLASS: Record<"green" | "yellow" | "red", string> = {
  green: "cr-tone-green",
  yellow: "cr-tone-yellow",
  red: "cr-tone-red",
};
export const TONE_BAR: Record<"green" | "yellow" | "red", string> = {
  green: "bg-[var(--green)]",
  yellow: "bg-[var(--yellow)]",
  red: "bg-[var(--red)]",
};

export type CategoryBarItem = {
  categoryId: string;
  categoryName: string;
  weight: number;
  rawScore: number;
  lowConfidence?: boolean;
  /** Optional narrative line under the bar — the real client report shows this (CATEGORY_SCORE_MEANING), the marketing site's sample preview doesn't. */
  meaning?: string;
};

/**
 * The real category-breakdown bars from the client report, extracted so
 * the marketing site can render the exact same visual against sample data
 * — never a re-implementation that could drift from what a client
 * actually receives.
 */
export function CategoryBars({ categories }: { categories: CategoryBarItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {categories.map((c) => {
        const tone = categoryScoreTone(c.rawScore);
        return (
          <Card key={c.categoryId} className="cr-avoid-break flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-semibold text-[var(--cream)]">{c.categoryName}</span>
                <Badge tone="neutral">weight {c.weight}</Badge>
                {c.lowConfidence ? <Badge tone="yellow">Low confidence</Badge> : null}
              </div>
              <span className={cn("font-tabular text-[13px] font-semibold", TONE_CLASS[tone])}>{c.rawScore.toFixed(1)} / 10</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div className={cn("h-full rounded-full", TONE_BAR[tone])} style={{ width: `${Math.min(100, (c.rawScore / 10) * 100)}%` }} />
            </div>
            {c.meaning ? <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{c.meaning}</p> : null}
          </Card>
        );
      })}
    </div>
  );
}
