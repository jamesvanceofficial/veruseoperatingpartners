import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
import { Badge } from "@/shared/ui/Badge";
import { PrintButton } from "@/shared/ui/PrintButton";
import { formatDate } from "@/shared/format";
import { ASSESSMENT_TYPE_LABELS } from "./labels";
import { categoryScoreTone } from "./scoreTone";
import { BuildRecommendationPanel } from "./BuildRecommendationPanel";
import type { AssessmentReport } from "./types";

/** The completed-assessment view — every category, weighted score, band, and the ranked bottleneck list, plus the Stage 8 build recommendation. Never rendered for a quick_scan assessment (its callers branch to QuickScanResult instead) — that's what keeps pricing off the free scan. Printable via window.print(); .no-print / aside / header are hidden in the print stylesheet. */
export function AssessmentReportView({ report, canEdit = false }: { report: AssessmentReport; canEdit?: boolean }) {
  const { assessment, orgName, bandLabel, categoryScores, buildTierOverrideByName, supportTierOverrideByName } = report;
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
                <Badge tone={categoryScoreTone(c.rawScore)}>{c.rawScore.toFixed(1)} / 10</Badge>
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
              <Badge tone={categoryScoreTone(c.rawScore)}>{c.rawScore.toFixed(1)} / 10</Badge>
            </div>
          ))}
        </div>
      </Card>

      <BuildRecommendationPanel
        assessmentId={assessment.id}
        recommendedBuildTier={assessment.recommended_build_tier}
        buildReasoning={assessment.build_recommendation_reasoning}
        recommendedSupportTier={assessment.recommended_support_tier}
        supportReasoning={assessment.support_recommendation_reasoning}
        buildTierOverride={assessment.build_tier_override}
        buildTierOverrideByName={buildTierOverrideByName}
        buildTierOverrideAt={assessment.build_tier_override_at}
        supportTierOverride={assessment.support_tier_override}
        supportTierOverrideByName={supportTierOverrideByName}
        supportTierOverrideAt={assessment.support_tier_override_at}
        canEdit={canEdit}
      />
    </div>
  );
}
