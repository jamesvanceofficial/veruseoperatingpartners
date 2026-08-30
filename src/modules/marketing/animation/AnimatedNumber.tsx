"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, prefersReducedMotion } from "./useInView";

/** Counts up once, when it scrolls into view — ease-out, ~900ms, never repeats. Jumps straight to the value under prefers-reduced-motion. */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  durationMs = 900,
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs]);

  return (
    <span ref={ref} className="font-tabular">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
