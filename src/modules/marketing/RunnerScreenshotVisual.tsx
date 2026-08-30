"use client";

import { useRef } from "react";
import { useParallax } from "./animation/useParallax";
import { BrowserFrame } from "./BrowserFrame";

/** A real screenshot of the assessment runner mid-question, with a restrained parallax drift. Flat, not tilted — this one is meant to read as a straightforward product shot, not a hero centerpiece. */
export function RunnerScreenshotVisual() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(parallaxRef, 0.05);

  return (
    <div ref={parallaxRef}>
      <BrowserFrame
        src="/images/product/runner-screenshot.webp"
        alt="The VERUS assessment runner mid-question, showing answer choices and a live provisional score"
      />
    </div>
  );
}
