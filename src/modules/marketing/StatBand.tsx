import { AnimatedNumber } from "./animation/AnimatedNumber";

export type BandStat = { value: number; suffix?: string; label: string };

/** The one full-width big-numbers band — real facts about the product, counted up once in view. */
export function StatBand({ stats }: { stats: BandStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-[38px] font-semibold text-[var(--gold-light)] sm:text-[52px]">
            <AnimatedNumber value={s.value} suffix={s.suffix} />
          </span>
          <span className="section-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
