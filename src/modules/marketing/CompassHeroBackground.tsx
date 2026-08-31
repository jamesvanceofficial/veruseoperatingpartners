"use client";

import { useRef } from "react";
import { CompassRose } from "@/shared/ui/CompassRose";
import { useParallax } from "./animation/useParallax";

/**
 * The hero centerpiece — big enough to bleed off the hero's own top,
 * bottom, and left edges, rotating a full turn every few minutes (barely
 * perceptible), drifting gently with scroll via the same useParallax
 * hook every other marketing visual uses.
 *
 * Positioned toward the LEFT of the hero — mostly behind the opaque
 * screenshot mockup (which hides its densest, busiest region: the hub
 * where every spike converges) — and masked with a right-side fade so it
 * is guaranteed gone well before the text column starts, regardless of
 * viewport width. An earlier version centered it behind the text column
 * instead; a zoomed screenshot caught a spike visually slicing through
 * the headline, which is exactly the "competes with the content" failure
 * this is meant to avoid — the mask is what makes that impossible rather
 * than merely unlikely.
 *
 * Anchored `top-0` with a fixed viewport-relative height (not `inset-0`)
 * deliberately: on a narrow screen the hero's TOTAL height is much taller
 * than one viewport (visual stacks above text), and centering within
 * that full height would put the rose far below the fold. Anchoring to
 * the first ~100vh keeps it near the top on every width.
 */
export function CompassHeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, 0.05, 50);

  const fadeMask = "linear-gradient(to right, black 0%, black 48%, transparent 68%)";

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-x-0 top-0 flex h-[min(100vh,880px)] items-center justify-center"
      style={{ WebkitMaskImage: fadeMask, maskImage: fadeMask }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full opacity-[0.4] blur-[64px]"
        style={{
          width: "min(60vw, 640px)",
          height: "min(60vw, 640px)",
          left: "min(22vw, 260px)",
          top: "22%",
          background: "radial-gradient(circle, var(--gold) 0%, transparent 68%)",
        }}
      />
      <div
        className="compass-spin-slow absolute"
        style={{ width: "min(175vw, 1750px)", height: "min(175vw, 1750px)", left: "min(-22vw, -270px)", top: "calc(50% - min(87.5vw, 875px))" }}
      >
        <CompassRose className="h-full w-full" opacity={0.32} />
      </div>
    </div>
  );
}
