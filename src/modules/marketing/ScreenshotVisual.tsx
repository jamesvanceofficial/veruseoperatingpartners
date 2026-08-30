"use client";

import { useRef } from "react";
import { cn } from "@/shared/ui/cn";
import { useParallax } from "./animation/useParallax";
import { BrowserFrame } from "./BrowserFrame";

/**
 * A real product screenshot with a restrained scroll parallax drift —
 * optionally shown at a fixed CSS 3D tilt for a hero-style "held up"
 * presentation. The parallax transform lives on the OUTER wrapper; the
 * tilt is a separate, static transform on an inner div — combining both
 * on one element would have the parallax's rAF writes silently overwrite
 * the tilt on every scroll frame.
 */
export function ScreenshotVisual({
  src,
  alt,
  tilt = false,
  parallaxStrength = 0.06,
  maxWidthClassName = "max-w-lg",
}: {
  src: string;
  alt: string;
  tilt?: boolean;
  parallaxStrength?: number;
  maxWidthClassName?: string;
}) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(parallaxRef, parallaxStrength);

  return (
    <div ref={parallaxRef} className={tilt ? "[perspective:1200px]" : undefined}>
      <div
        className={cn(
          "mx-auto",
          maxWidthClassName,
          tilt && "[transform:rotateY(-10deg)_rotateX(4deg)] [box-shadow:36px_44px_80px_-28px_rgba(0,0,0,0.7)]"
        )}
      >
        <BrowserFrame src={src} alt={alt} />
      </div>
    </div>
  );
}
