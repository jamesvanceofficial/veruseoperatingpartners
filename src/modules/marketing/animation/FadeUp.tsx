"use client";

import { useRef } from "react";
import { cn } from "@/shared/ui/cn";
import { useInView } from "./useInView";

/** Restrained scroll reveal — a slight rise and fade, once, never a repeating loop. motion-reduce: (a real Tailwind variant tied to the prefers-reduced-motion media query) drops the transition entirely for anyone who's asked for it. */
export function FadeUp({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
      style={{ transitionDelay: inView && delayMs ? `${delayMs}ms` : undefined }}
    >
      {children}
    </div>
  );
}
