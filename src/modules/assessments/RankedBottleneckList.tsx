import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { categoryScoreTone } from "./scoreTone";

export type RankedBottleneckItem = {
  categoryId: string;
  categoryName: string;
  rawScore: number;
  bottleneckRank: number;
  lowConfidence?: boolean;
};

/** The real ranked-bottleneck list from the internal assessment report, extracted so the marketing site can show exactly this against sample data. */
export function RankedBottleneckList({ items, title = "Ranked Bottlenecks" }: { items: RankedBottleneckItem[]; title?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="mb-1 section-label">{title}</p>
      <p className="mb-1 text-[11.5px] text-[var(--muted)]">Biggest weighted opportunity for improvement first.</p>
      <div className="flex flex-col divide-y divide-[var(--hairline)]">
        {items.map((c) => (
          <div key={c.categoryId} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="font-tabular text-[12px] text-[var(--muted)]">#{c.bottleneckRank}</span>
              <span className="text-[12.5px] text-[var(--cream)]">{c.categoryName}</span>
              {c.lowConfidence ? <Badge tone="yellow">Low confidence</Badge> : null}
            </div>
            <Badge tone={categoryScoreTone(c.rawScore)}>{c.rawScore.toFixed(1)} / 10</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
