"use client";

import { useRef } from "react";
import { cn } from "@/shared/ui/cn";
import { useInView } from "./animation/useInView";

/**
 * Wraps an SVG diagram so its individual child elements fade up into place
 * in a fast staggered sequence once scrolled into view, instead of the
 * whole icon just appearing — see `.icon-draw-in` in globals.css, which
 * targets `> svg > *` generically so this works for every hand-drawn icon
 * regardless of its internal mix of rect/line/circle/path elements.
 */
export function IconReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.35);

  return (
    <div ref={ref} className={cn("icon-draw-in", inView && "in-view", className)}>
      {children}
    </div>
  );
}
