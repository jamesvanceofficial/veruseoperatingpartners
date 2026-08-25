import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
import { Badge } from "@/shared/ui/Badge";
import { PrintButton } from "@/shared/ui/PrintButton";
import { formatDate } from "@/shared/format";
import { ASSESSMENT_TYPE_LABELS } from "./labels";
import type { AssessmentReport } from "./types";

function scoreTone(score: number): "green" | "yellow" | "red" {
  if (score >= 7) return "green";
  if (score >= 4) return "yellow";
  return "red";
}

/** The completed-assessment view — every category, weighted score, band, and the ranked bottleneck list. Printable via window.print(); .no-print / aside / header are hidden in the print stylesheet. */
export function AssessmentReportView({ report }: { report: AssessmentReport }) {
  const { assessment, orgName, bandLabel, categoryScores } = report;
  const byWeight = [...categoryScores].sort((a, b) => b.weight - a.weight);
  const bottlenecks = [...categoryScores].sort((a, b) => a.bottleneckRank - b.bottleneckRank);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="section-label">{ASSESSMENT_TYPE_LABELS[assessment.assessment_type]} Report</span>
          <p className="text-[12px] text-[var(--muted)]">{orgName} · {formatDate(assessment.completed_at ?? assessment.created_at)}</p>
        </div>
        <PrintButton>Print report</PrintButton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat label="Enterprise Score" value={assessment.enterprise_score ?? "—"} hint="out of 100" tone="gold" />
        <Stat label="Band" value={bandLabel ?? "—"} tone="gold" />
      </div>

      <Card className="flex flex-col gap-1">
        <p className="mb-1 section-label">All Categories</p>
        <div className="flex flex-col divide-y divide-[var(--hairline)]">
          {byWeight.map((c) => (
            <div key={c.categoryId} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[12.5px] text-[var(--cream)]">{c.categoryName}</span>
              <span className="text-[11px] text-[var(--muted)]">weight {c.weight}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--navy)]">
                  <div
                    className="h-full rounded-full bg-[var(--gold)]"
                    style={{ width: `${Math.min(100, (c.rawScore / 10) * 100)}%` }}
                  />
                </div>
                <Badge tone={scoreTone(c.rawScore)}>{c.rawScore.toFixed(1)} / 10</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-1">
        <p className="mb-1 section-label">Ranked Bottlenecks</p>
        <p className="mb-1 text-[11.5px] text-[var(--muted)]">Biggest weighted opportunity for improvement first.</p>
        <div className="flex flex-col divide-y divide-[var(--hairline)]">
          {bottlenecks.map((c) => (
            <div key={c.categoryId} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="font-tabular text-[12px] text-[var(--muted)]">#{c.bottleneckRank}</span>
                <span className="text-[12.5px] text-[var(--cream)]">{c.categoryName}</span>
              </div>
              <Badge tone={scoreTone(c.rawScore)}>{c.rawScore.toFixed(1)} / 10</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
