"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./useInView";

/**
 * Restrained scroll parallax — translates the ref'd element vertically by
 * a fraction of how far its center has drifted from the viewport center.
 * Mutates style.transform directly via rAF instead of React state, so it
 * never re-renders on scroll. A no-op under prefers-reduced-motion.
 */
export function useParallax<T extends HTMLElement>(ref: React.RefObject<T | null>, strength = 0.12) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let ticking = false;

    function update() {
      ticking = false;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const delta = (viewportCenter - elementCenter) * strength;
      node.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, strength]);
}
