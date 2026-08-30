"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreGauge } from "@/modules/assessments/ScoreGauge";
import { useInView, prefersReducedMotion } from "./useInView";

/**
 * Wraps the REAL ScoreGauge (src/modules/assessments/ScoreGauge.tsx, also
 * used by the actual Quick Scan result) — never a reimplementation. Drives
 * its `score` prop from 0 up to the real value once the gauge scrolls into
 * view, so the arc fills and the number counts up together using the
 * gauge's own existing rendering, not a duplicate SVG.
 */
export function AnimatedScoreGauge({ score, className }: { score: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (prefersReducedMotion()) {
      setDisplay(score);
      return;
    }

    const durationMs = 1000;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * score);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, score]);

  return (
    <div ref={ref}>
      <ScoreGauge score={display} className={className} />
    </div>
  );
}
