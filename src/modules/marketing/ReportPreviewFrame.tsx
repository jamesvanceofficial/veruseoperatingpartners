import { AnimatedScoreGauge } from "./animation/AnimatedScoreGauge";
import { RankedBottleneckList } from "@/modules/assessments/RankedBottleneckList";
import { SAMPLE_SCORE, SAMPLE_BAND_LABEL, SAMPLE_BOTTLENECKS } from "./sampleAssessment";

/**
 * A cut-down live preview of an actual assessment report — built from the
 * real ScoreGauge and RankedBottleneckList components against sample data,
 * never a screenshot. Shown at a slight angle via CSS 3D perspective so it
 * reads as a document being held up, not a flat panel like everything
 * else on the page.
 */
export function ReportPreviewFrame() {
  return (
    <div className="[perspective:1600px]">
      <div className="glass-panel-strong fade-scale-in mx-auto max-w-md p-6 [transform:rotateY(-8deg)_rotateX(3deg)] sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="section-label text-[var(--gold-light)]">Sample Business Assessment</span>
          <span className="text-[10px] text-[var(--muted)]">Illustrative</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <AnimatedScoreGauge score={SAMPLE_SCORE} className="w-32 sm:w-36" />
          <span className="text-[15px] font-semibold text-[var(--gold-light)]">{SAMPLE_BAND_LABEL}</span>
        </div>

        <div className="mt-6">
          <RankedBottleneckList items={SAMPLE_BOTTLENECKS.slice(0, 3)} title="Top 3 Bottlenecks" />
        </div>
      </div>
    </div>
  );
}
