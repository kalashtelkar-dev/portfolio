"use client";
import { useEffect, useRef, useState } from "react";
import { FILTERS, WORKS, type Category, type Work } from "@/data/site";
import { gsap, reducedMotion, scroller, ScrollTrigger, CLEAR } from "@/lib/motion";

export default function Bin() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [open, setOpen] = useState<Work | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [live, setLive] = useState<string[]>([]); // phones: the row of clips at the middle of the screen plays
  const shown = WORKS.filter((w) => filter === "all" || w.category === filter);

  // Touch screens can't hover, so play the row nearest the middle of the screen instead.
  // One row at a time keeps the grid calm and only ever decodes two small loops.
  useEffect(() => {
    if (!matchMedia("(hover: none)").matches || reducedMotion()) return;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const tiles = [...(grid.current?.children ?? [])] as HTMLElement[], mid = innerHeight / 2;
      let best: DOMRect | null = null, dist = Infinity;
      for (const t of tiles) { const r = t.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < dist) { dist = d; best = r } }
      const next = best && dist < innerHeight / 2 ? tiles.filter((t) => Math.abs(t.getBoundingClientRect().top - best!.top) < 4).map((t) => t.dataset.src!) : [];
      tiles.forEach((t) => { if (!next.includes(t.dataset.src!)) (t.querySelector("[data-bar]") as HTMLElement).style.width = "0" });
      setLive((prev) => (prev.join() === next.join() ? prev : next));
    };
    const onScroll = () => { raf ||= requestAnimationFrame(pick) };
    pick();
    addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll) };
  }, [filter]);

  // Re-cut the grid in with a wipe whenever the filter changes
  useEffect(() => {
    ScrollTrigger.refresh();
    if (reducedMotion() || filter === "all") return;
    gsap.fromTo(grid.current!.children, { opacity: 0, y: 24, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)", clearProps: CLEAR, duration: 0.7, stagger: 0.04, ease: "expo.out" });
  }, [filter]);

  const close = () => {
    if (reducedMotion()) return setOpen(null);
    gsap.to(viewer.current, { clipPath: "inset(0 0 0 100%)", duration: 0.6, ease: "expo.inOut", onComplete: () => setOpen(null) });
  };

  // Viewer wipes in from the left; Escape closes it
  useEffect(() => {
    if (!open) return;
    scroller.lenis?.stop();
    closeBtn.current?.focus();
    if (!reducedMotion()) gsap.fromTo(viewer.current, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "expo.inOut" });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); scroller.lenis?.start() };
  }, [open]);

  return (
    <section id="bin" aria-labelledby="bin-h" className="gx pt-[18vh] pb-[6vh]">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div><span className="kicker">Media bin</span><h2 id="bin-h" className="h2 reveal">Every ad, <em>one bin.</em></h2></div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter clips">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
              className="min-h-10 rounded-[10px] border border-line bg-p1 px-3.5 text-[13px] text-dim transition-colors hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg">{f.label}</button>
          ))}
        </div>
      </div>
      <p className="-mt-4 mb-6 text-dim"><span className="max-sm:hidden">Move across a thumbnail to scrub it, click to play.</span><span className="sm:hidden">Clips play as you scroll. Tap one to watch it with sound.</span></p>

      <div ref={grid} className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:gap-3.5">
        {shown.map((w) => (
          <button key={w.src} data-src={w.src} onClick={() => setOpen(w)} aria-label={`Play ${w.title}`}
            className="tile grid min-w-0 grid-cols-1 gap-2.5 rounded-[14px] border border-line bg-p1 p-2 sm:p-2.5 text-left transition-[border-color,translate,background-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-brand hover:bg-p2">
            <span className="relative aspect-[4/5] overflow-hidden rounded-lg bg-black"
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return; // touch scrolls; the centred row plays instead
                const r = e.currentTarget.getBoundingClientRect(), p = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width));
                e.currentTarget.querySelector("img")!.src = `/media/${w.src}-${Math.floor(p * 6)}.jpg`;
                (e.currentTarget.querySelector("[data-bar]") as HTMLElement).style.width = p * 100 + "%";
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "mouse") return;
                e.currentTarget.querySelector("img")!.src = `/media/${w.src}-0.jpg`;
                (e.currentTarget.querySelector("[data-bar]") as HTMLElement).style.width = "0";
              }}>
              <img src={`/media/${w.src}-0.jpg`} alt="" loading="lazy" className="size-full object-cover" />
              {!open && live.includes(w.src) && (
                <video src={`/media/${w.src}.mp4`} muted loop playsInline autoPlay aria-hidden
                  className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500"
                  onPlaying={(e) => (e.currentTarget.style.opacity = "1")}
                  onTimeUpdate={(e) => { const v = e.currentTarget; (v.parentElement!.querySelector("[data-bar]") as HTMLElement).style.width = (v.currentTime / v.duration) * 100 + "%" }} />
              )}
              <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px]">{w.format}</span>
              <span className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px]">0:{String(w.length).padStart(2, "0")}</span>
              <span data-bar className="absolute bottom-0 left-0 h-[3px] w-0 bg-brand transition-[width] duration-300 ease-linear" />
            </span>
            <span className="flex justify-between gap-x-2 px-0.5 text-sm max-sm:flex-col"><b className="truncate font-semibold">{w.title}</b><span className="text-[13px] text-dim">{w.label}</span></span>
          </button>
        ))}
      </div>

      {open && (
        <div ref={viewer} role="dialog" aria-modal="true" aria-label={open.title}
          className="fixed inset-0 z-[90] grid place-items-center bg-black px-4 pt-[70px] pb-[90px]"
          onClick={(e) => e.target === e.currentTarget && close()}>
          <video src={`/media/${open.src}-full.mp4`} poster={`/media/${open.src}-0.jpg`} controls playsInline autoPlay className="max-h-[calc(100svh-180px)] w-auto max-w-full rounded-[10px] bg-black" />
          <div className="absolute inset-x-4 bottom-6 flex items-end justify-between gap-x-4 gap-y-1 text-[13px] text-dim max-sm:flex-col max-sm:items-start">
            <b className="text-[clamp(20px,5vw,26px)] font-bold tracking-[-0.03em] text-fg">{open.title}</b>
            <span className="sm:text-right">{open.label} · {open.format} · 0:{String(open.length).padStart(2, "0")}</span>
          </div>
          <button ref={closeBtn} onClick={close} className="btn btn-ghost absolute top-[calc(16px+env(safe-area-inset-top))] right-4">Close</button>
        </div>
      )}
    </section>
  );
}
