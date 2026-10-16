"use client";
import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

// Entrance tweens clear what they set when they land. Without this, a tween that runs twice
// (React dev remounts, a refresh mid-flight) takes the half-finished state as its end and
// leaves elements stuck out of place.
export const CLEAR = "transform,opacity,clipPath,transformOrigin";

// One smooth scroller for the page, set by <SmoothScroll />.
export const scroller: { lenis: Lenis | null } = { lenis: null };

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToY(y: number, duration = 1.2) {
  if (scroller.lenis) scroller.lenis.scrollTo(y, { duration });
  else window.scrollTo({ top: y });
}

// Pause a section's autoplaying videos while it is off screen (saves battery and decoding on phones).
export function usePauseOffscreen(ref: React.RefObject<HTMLElement | null>, playing = true) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      el.querySelectorAll("video").forEach((v) => (e.isIntersecting && playing && !reducedMotion() ? v.play().catch(() => {}) : v.pause())));
    io.observe(el);
    return () => io.disconnect();
  }, [ref, playing]);
}
