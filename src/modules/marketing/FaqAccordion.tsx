"use client";

import { useState } from "react";
import { cn } from "@/shared/ui/cn";

export function FaqAccordion({ items }: { items: readonly { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-[var(--hairline)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question} className="bg-[var(--surface)]">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="glow-gold-focus flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[13.5px] font-semibold text-[var(--cream)]">{item.question}</span>
              <span className={cn("shrink-0 text-[var(--gold-light)] transition-transform duration-200", open && "rotate-45")}>+</span>
            </button>
            <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-[13px] leading-relaxed text-[var(--muted)]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
