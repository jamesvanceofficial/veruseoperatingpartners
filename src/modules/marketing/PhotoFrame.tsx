"use client";

import { useRef } from "react";
import { useParallax } from "./animation/useParallax";

/** A real photo given actual visual weight — bordered and framed, not just a faint background wash. Used where a photo needs to read as a deliberate visual element, not atmosphere. */
export function PhotoFrame({ src, alt, className, parallaxStrength = 0.04 }: { src: string; alt: string; className?: string; parallaxStrength?: number }) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(parallaxRef, parallaxStrength);

  return (
    <div ref={parallaxRef} className={className}>
      <div className="glass-panel-strong overflow-hidden p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block aspect-[4/3] w-full rounded-[10px] object-cover" loading="lazy" />
      </div>
    </div>
  );
}
