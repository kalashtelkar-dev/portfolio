"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion, scroller, CLEAR } from "@/lib/motion";

// Smooth scroll, in-page anchors, and the entrance of every section below the editor.
export default function Motion() {
  useEffect(() => {
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const t = a && document.querySelector(a.getAttribute("href")!);
      if (t && scroller.lenis) { e.preventDefault(); scroller.lenis.scrollTo(t as HTMLElement, { duration: 1.4, offset: -72 }) }
    };
    document.addEventListener("click", onAnchor);

    const pct = document.getElementById("pct");
    const ctx = gsap.context(() => {
      gsap.to("#prog", { scaleX: 1, ease: "none", scrollTrigger: { trigger: "#final", start: "top 70%", end: "bottom bottom", scrub: true,
        onUpdate: (s) => pct && (pct.textContent = s.progress > 0.99 ? "Render complete" : `Rendering ${Math.max(2, Math.round(s.progress * 100))}%`) } });
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((h) => gsap.from(h, { clearProps: CLEAR, clipPath: "inset(0 100% 0 0)", x: -40, duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: h, start: "top 85%" } }));
      gsap.utils.toArray<HTMLElement>("main .kicker").forEach((k) => gsap.from(k, { clearProps: CLEAR, opacity: 0, x: -20, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: k, start: "top 90%" } }));
      ScrollTrigger.batch(".tile", { start: "top 92%", once: true, onEnter: (els) => gsap.from(els, { clearProps: CLEAR, opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)", duration: 1, stagger: 0.05, ease: "expo.out" }) });
      gsap.from(".fxp", { clearProps: CLEAR, opacity: 0, y: 80, rotateX: -12, transformPerspective: 900, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: "#effects", start: "top 70%" } });
      gsap.from(".preset", { clearProps: CLEAR, opacity: 0, y: 80, duration: 1.1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: "#export", start: "top 70%" } });
      gsap.from("#help details", { clearProps: CLEAR, opacity: 0, x: 30, duration: 0.8, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: "#help", start: "top 75%" } });
      gsap.from("#final h2", { clearProps: CLEAR, yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#final", start: "top 75%" } });
    });

    let lenis: Lenis | null = null;
    const raf = (t: number) => lenis?.raf(t * 1000);
    if (!reducedMotion()) {
      lenis = scroller.lenis = new Lenis({ lerp: 0.09 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }
    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onAnchor);
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
      scroller.lenis = null;
    };
  }, []);
  return null;
}
