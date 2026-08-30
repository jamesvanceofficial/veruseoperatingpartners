"use client";

import { useRef } from "react";
import { cn } from "@/shared/ui/cn";
import { useParallax } from "./animation/useParallax";

/**
 * A real, locally-served photograph as a section background, with a
 * restrained scroll parallax, always behind a navy overlay light enough
 * that the photo genuinely reads as atmosphere without disappearing —
 * text and cards on top never fight the image for attention. Never
 * hotlinked; every src here lives under public/images/photography/.
 * The image is sized taller than its section and parallax-translated
 * within that buffer, so the drift never reveals an edge.
 */
export function PhotoSection({
  src,
  alt = "",
  className,
  children,
}: {
  src: string;
  alt?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const parallaxRef = useRef<HTMLImageElement>(null);
  useParallax(parallaxRef, 0.08);

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={parallaxRef}
        src={src}
        alt={alt}
        className="absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--navy)_55%,transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--black)]/45 via-transparent to-[var(--black)]/65" />
      <div className="relative">{children}</div>
    </section>
  );
}
