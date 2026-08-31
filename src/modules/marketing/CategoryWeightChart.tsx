"use client";

import { useRef } from "react";
import { cn } from "@/shared/ui/cn";
import { useInView } from "./animation/useInView";

export type WeightItem = { id: string; name: string; weight: number };

/**
 * Makes the weighting the point, not a footnote — bar length scales
 * directly with weight (Operations at 20 draws a bar four times the
 * length of Vision at 5, the exact ratio the design brief called out),
 * with the top two categories also getting bolder, larger type so the
 * hierarchy reads even before anyone looks at the numbers. Bars animate
 * from zero width once scrolled into view, once, via the same
 * useInView hook every other scroll reveal on the site uses.
 */
export function CategoryWeightChart({ categories }: { categories: WeightItem[] }) {
  const sorted = [...categories].sort((a, b) => b.weight - a.weight);
  const maxWeight = sorted[0]?.weight ?? 1;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {sorted.map((c, i) => {
        const pct = (c.weight / maxWeight) * 100;
        const emphasize = i < 2;
        return (
          <div key={c.id} className="flex items-center gap-4">
            <span
              className={cn(
                "shrink-0 text-right font-tabular text-[var(--gold-light)]",
                emphasize ? "w-7 text-[17px] font-bold" : "w-7 text-[12.5px] font-medium"
              )}
            >
              {c.weight}
            </span>
            <div className="min-w-0 flex-1">
              <span className={cn("mb-1 block truncate text-[var(--cream)]", emphasize ? "text-[14.5px] font-semibold" : "text-[12.5px]")}>
                {c.name}
              </span>
              <div className={cn("w-full overflow-hidden rounded-full bg-[var(--hairline)]", emphasize ? "h-3" : "h-2")}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: inView ? `${pct}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
