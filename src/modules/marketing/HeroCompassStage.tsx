"use client";

import { CompassRose } from "@/shared/ui/CompassRose";
import { ScreenshotVisual } from "./ScreenshotVisual";

/**
 * The home hero's anchor: the full compass rose, whole and uncropped,
 * sized to its own column (a square stage), with the real report
 * screenshot laid over its lower-right quadrant like a card set down on
 * a chart. The hub, the north/west/south points and most of the degree
 * ring stay in clear view, so the compass reads as the deliberate
 * centerpiece rather than texture bleeding off the edge.
 *
 * It lives entirely inside the visual column — never behind the text
 * column — so it can't compete with the headline at any width. Because
 * the stage is a square sized to the column, the same full rose simply
 * scales down on a phone instead of being cropped.
 */
export function HeroCompassStage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[660px]">
      <div
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full opacity-35 blur-[70px]"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />
      <div aria-hidden="true" className="compass-spin-slow absolute inset-0">
        <CompassRose className="h-full w-full" opacity={0.95} litOpacity={0.8} shadowOpacity={0.4} ringOpacity={0.5} />
      </div>
      <div className="absolute bottom-[3%] right-0 w-[47%]">
        <ScreenshotVisual tilt parallaxStrength={0.03} maxWidthClassName="max-w-none" src={src} alt={alt} />
      </div>
    </div>
  );
}
