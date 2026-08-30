import { cn } from "@/shared/ui/cn";
import type { Band } from "./types";

/** The real five-band scale visual from the client report, extracted so the marketing site can show exactly what a client sees, against sample data. */
export function BandScale({ score, bands }: { score: number; bands: Band[] }) {
  return (
    <div className="cr-avoid-break flex flex-col gap-2">
      <p className="section-label">The five-band scale</p>
      <div className="flex h-8 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--hairline-strong)]">
        {bands.map((b) => {
          const width = b.max_score - b.min_score + 1;
          const active = score >= b.min_score && score <= b.max_score;
          return (
            <div
              key={b.id}
              className={cn(
                "flex items-center justify-center border-r border-[var(--hairline)] last:border-r-0",
                active ? "bg-[var(--gold)]" : "bg-[var(--hairline)]"
              )}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      <div className="flex w-full text-[10px] text-[var(--muted)]">
        {bands.map((b) => {
          const width = b.max_score - b.min_score + 1;
          const active = score >= b.min_score && score <= b.max_score;
          return (
            <div key={b.id} className={cn("px-0.5 text-center leading-tight", active && "font-semibold cr-tone-gold")} style={{ width: `${width}%` }}>
              {b.label}
              <br />
              {b.min_score}-{b.max_score}
            </div>
          );
        })}
      </div>
    </div>
  );
}
