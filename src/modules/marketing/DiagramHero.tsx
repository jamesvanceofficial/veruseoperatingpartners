"use client";

import { useRef } from "react";
import { useParallax } from "./animation/useParallax";

/**
 * A page hero's SVG diagram, panel-framed with the same restrained scroll
 * parallax every screenshot visual gets. Takes the already-rendered icon
 * element as `children` — a Server Component page can never pass a
 * component function as a prop into a "use client" module, only an
 * instantiated element, same rule as AppShell/MarketingHeader's `brand`
 * prop.
 */
export function DiagramHero({ children, parallaxStrength = 0.05 }: { children: React.ReactNode; parallaxStrength?: number }) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(parallaxRef, parallaxStrength);

  return (
    <div ref={parallaxRef}>
      <div className="glass-panel-strong mx-auto flex aspect-square max-w-[380px] items-center justify-center p-12">{children}</div>
    </div>
  );
}
