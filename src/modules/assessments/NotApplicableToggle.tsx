"use client";

import { cn } from "@/shared/ui/cn";

/**
 * A 5th, mutually-exclusive choice alongside the 4 real answer options —
 * deliberately never gold, in either state, so it can never read as a
 * real answer. Sits outside the options grid, not inside it, so it reads
 * as a different kind of choice rather than a 5th equal option.
 */
export function NotApplicableToggle({ selected, disabled, onSelect }: { selected: boolean; disabled?: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "self-start rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-[var(--hairline-strong)] bg-[color-mix(in_srgb,var(--cream)_10%,var(--navy))] text-[var(--cream)]"
          : "border-[var(--hairline)] text-[var(--muted)] opacity-70 hover:border-[var(--hairline-strong)] hover:text-[var(--cream)] hover:opacity-100"
      )}
    >
      {selected ? "✓ Not applicable" : "Not applicable to my business"}
    </button>
  );
}
