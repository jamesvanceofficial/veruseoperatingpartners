"use client";

import { useRef } from "react";
import { useParallax } from "./animation/useParallax";
import { BrowserFrame } from "./BrowserFrame";

/**
 * The home hero visual — a real screenshot of a completed VERUS report
 * (seeded from the DEMO "Northline Mechanical" organization, never a real
 * client), shown at an angle with real depth via CSS 3D perspective, and a
 * restrained parallax drift on scroll. The angle is static (a fixed CSS
 * transform); only the outer wrapper's position drifts with scroll.
 */
export function HeroReportVisual() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(parallaxRef, 0.06);

  return (
    <div ref={parallaxRef} className="[perspective:1200px]">
      <div className="mx-auto max-w-lg [transform:rotateY(-10deg)_rotateX(4deg)] [box-shadow:36px_44px_80px_-28px_rgba(0,0,0,0.7)]">
        <BrowserFrame
          src="/images/product/report-screenshot.webp"
          alt="A completed VERUS business assessment report showing an enterprise score, category breakdown, and ranked bottleneck list"
        />
      </div>
    </div>
  );
}
