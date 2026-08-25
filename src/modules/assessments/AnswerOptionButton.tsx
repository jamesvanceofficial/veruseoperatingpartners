"use client";

import { cn } from "@/shared/ui/cn";
import type { AnswerOption } from "./types";

/**
 * One answer choice — shared by the COMPASS/share-link runner
 * (AssessmentRunner) and the public Quick Scan wizard, so the two can
 * never visually drift apart. Selected is the only state that uses gold
 * at all (filled ring + solid border + filled background); unselected
 * (resting or hovered) never does, so hover can never read as "picked."
 */
export function AnswerOptionButton({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: AnswerOption;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-2.5 rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-left text-[12.5px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_20%,var(--navy))] font-medium text-[var(--cream)] hover:bg-[color-mix(in_srgb,var(--gold)_26%,var(--navy))]"
          : "border-[var(--hairline)] bg-[var(--navy)] text-[var(--muted)] opacity-70 hover:border-[var(--hairline-strong)] hover:bg-[color-mix(in_srgb,var(--cream)_4%,var(--navy))] hover:opacity-100"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
          selected ? "border-[var(--gold)] bg-[var(--gold)]" : "border-[var(--hairline-strong)] bg-transparent"
        )}
      >
        {selected ? (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
            <path d="M2.5 6.3L5 8.8L9.5 3.3" stroke="var(--black)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span>{option.label}</span>
    </button>
  );
}
