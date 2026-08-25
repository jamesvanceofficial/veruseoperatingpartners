import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
import { LinkButton } from "@/shared/ui/LinkButton";

/** Quick Scan's result — score, band, and the single top bottleneck only. Deliberately not the full per-category breakdown (that's the paid Full Assessment's report). */
export function QuickScanResult({ score, bandLabel, topBottleneckName }: { score: number; bandLabel: string | null; topBottleneckName: string | null }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat label="Your Score" value={score} hint="out of 100" tone="gold" />
        <Stat label="Your Band" value={bandLabel ?? "—"} tone="gold" />
      </div>

      <Card className="flex flex-col gap-2">
        <p className="section-label">Your Biggest Opportunity</p>
        <p className="text-[15px] font-medium text-[var(--cream)]">{topBottleneckName ?? "—"}</p>
        <p className="text-[12.5px] text-[var(--muted)]">
          The single area with the most room to grow, weighted for how much it actually matters to your business.
        </p>
      </Card>

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-[14px] font-semibold text-[var(--cream)]">Want the full picture?</p>
        <p className="max-w-sm text-[12.5px] text-[var(--muted)]">
          The Full Business Assessment scores all ten categories and ranks every bottleneck. Book a call with VERUS to go deeper.
        </p>
        <LinkButton href="/" variant="primary">
          Talk to VERUS
        </LinkButton>
      </Card>
    </div>
  );
}
