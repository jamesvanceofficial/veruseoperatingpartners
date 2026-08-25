import { cn } from "@/shared/ui/cn";

function gaugeColor(score: number): string {
  if (score < 40) return "var(--red)";
  if (score < 60) return "var(--yellow)";
  if (score < 80) return "var(--gold)";
  return "var(--green)";
}

/** A circular progress dial for the 0-100 enterprise score. Scales via CSS width (viewBox stays fixed at 200×200), so it's genuinely responsive rather than jumping between fixed pixel sizes. */
export function ScoreGauge({ score, className }: { score: number; className?: string }) {
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div className={cn("relative mx-auto aspect-square w-40 sm:w-52", className)}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--hairline-strong)" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={gaugeColor(clamped)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 500ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-tabular text-[34px] font-semibold leading-none text-[var(--cream)] sm:text-[42px]">{clamped}</span>
        <span className="mt-1 text-[10.5px] uppercase tracking-wide text-[var(--muted)]">out of 100</span>
      </div>
    </div>
  );
}
