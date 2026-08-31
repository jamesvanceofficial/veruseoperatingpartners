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
 *
 * Sits on the same `.diagram-screen` textured backdrop (graph-paper grid
 * + warm radial glow) plus a soft blurred gold glow behind the icon
 * itself as `ScreenshotStage` — both replace a flat panel fill with real
 * depth, so every hero across the site (Builds, Systems & Support,
 * What We Do, About) reads consistently rather than some getting the
 * richer treatment and others staying flat.
 */
export function DiagramHero({ children, parallaxStrength = 0.05 }: { children: React.ReactNode; parallaxStrength?: number }) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(parallaxRef, parallaxStrength);

  return (
    <div ref={parallaxRef}>
      <div className="diagram-screen relative mx-auto flex aspect-square max-w-[380px] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--hairline)] p-12">
        <div className="absolute h-40 w-40 rounded-full bg-[var(--gold)] opacity-20 blur-2xl" aria-hidden="true" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
