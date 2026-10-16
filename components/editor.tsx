"use client";
import { useEffect, useRef, useState } from "react";
import { FIVERR_URL, WORKS, timecode } from "@/data/site";
import { gsap, ScrollTrigger, useGSAP, reducedMotion, scrollToY, usePauseOffscreen } from "@/lib/motion";

const PX = 46; // timeline pixels per second
const TOTAL = WORKS.reduce((a, w) => a + w.seconds, 0);
const STARTS = WORKS.reduce<number[]>((a, w, i) => [...a, i ? a[i - 1] + WORKS[i - 1].seconds : 0], []);
const clipAt = (t: number) => STARTS.findLastIndex((s) => t >= s);
// Playhead sits mid-timeline on desktop, nearer the left on phones so the lane isn't half empty
const headAt = () => (window.innerWidth <= 980 ? 0.3 : 0.5);

export default function Editor() {
  const root = useRef<HTMLElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const laneWrap = useRef<HTMLDivElement>(null);
  const tcRefs = useRef<HTMLSpanElement[]>([]);
  const flash = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const tRef = useRef(0);
  const dragged = useRef(false);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(true);
  const w = WORKS[cur];
  usePauseOffscreen(root, playing);

  // Move the lanes so time t sits under the playhead, and follow it on the monitor.
  const seek = (t: number) => {
    const lw = laneWrap.current, lanes = lanesRef.current;
    if (!lw || !lanes) return;
    tRef.current = t;
    lanes.style.transform = `translateX(${lw.clientWidth * headAt() - t * PX}px)`;
    tcRefs.current.forEach((el) => (el.textContent = timecode(t)));
    setCur(clipAt(t));
  };

  const goTo = (i: number) => {
    i = Math.max(0, Math.min(WORKS.length - 1, i));
    const t = STARTS[i] + 0.01, st = trigger.current;
    if (st) scrollToY(st.start + (st.end - st.start) * (t / TOTAL), 1);
    else seek(t);
  };

  // Flash on every cut
  useEffect(() => {
    if (!reducedMotion()) gsap.fromTo(flash.current, { opacity: 0.55 }, { opacity: 0, duration: 0.45, ease: "power2.out" });
  }, [cur]);

  // Waveforms and ruler are drawn once (and on resize)
  useEffect(() => {
    const draw = () => {
      root.current?.querySelectorAll<HTMLCanvasElement>("canvas[data-seed]").forEach((c) => {
        const W = c.offsetWidth, H = c.offsetHeight, d = devicePixelRatio || 1;
        c.width = W * d; c.height = H * d;
        const g = c.getContext("2d")!; g.scale(d, d); g.fillStyle = "#2dd4bf";
        let s = +c.dataset.seed! * 9301;
        const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
        for (let x = 0; x < W; x += 3) {
          const h = (0.25 + rnd() * 0.75) * (0.55 + 0.45 * Math.sin(x / 23 + +c.dataset.seed!)) * H * 0.9;
          g.fillRect(x, (H - h) / 2, 2, h);
        }
      });
      const ru = root.current?.querySelector<HTMLCanvasElement>("canvas[data-ruler]");
      if (!ru) return;
      const H = ru.offsetHeight, d = devicePixelRatio || 1;
      ru.width = TOTAL * PX * d; ru.height = H * d;
      const g = ru.getContext("2d")!; g.scale(d, d); g.fillStyle = "#8e9490"; g.font = "10px ui-monospace, monospace";
      for (let s = 0; s <= TOTAL; s++) {
        const big = s % 5 === 0;
        g.fillRect(s * PX, H - (big ? 10 : 5), 1, big ? 10 : 5);
        if (big) g.fillText(timecode(s).slice(3, 8), s * PX + 4, 11);
      }
    };
    draw();
    document.fonts?.ready.then(draw);
    addEventListener("resize", draw);
    return () => removeEventListener("resize", draw);
  }, []);

  useGSAP(() => {
    seek(0);
    const mm = gsap.matchMedia();
    // Desktop: scrolling scrubs the reel
    mm.add("(min-width: 981px)", () => {
      trigger.current = ScrollTrigger.create({
        trigger: root.current, start: "top top", end: () => "+=" + TOTAL * 38, pin: true, scrub: true,
        onUpdate: (s) => seek(s.progress * (TOTAL - 0.01)),
      });
      return () => { trigger.current = null };
    });
    // Phones: drag the timeline
    mm.add("(max-width: 980px)", () => {
      const lw = laneWrap.current!;
      let t0 = 0, sx = 0, down_ = false;
      const down = (e: PointerEvent) => { sx = e.clientX; t0 = tRef.current; down_ = true; dragged.current = false };
      const move = (e: PointerEvent) => {
        if (!down_) return;
        if (Math.abs(e.clientX - sx) > 6) dragged.current = true;
        seek(Math.max(0, Math.min(TOTAL - 0.01, t0 - (e.clientX - sx) / PX)));
      };
      const up = () => { down_ = false };
      lw.addEventListener("pointerdown", down); addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
      return () => { lw.removeEventListener("pointerdown", down); removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up) };
    });
    if (!reducedMotion()) {
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".panel", { opacity: 0, scale: 0.96, y: 30, duration: 1.1, stagger: 0.1 })
        .from(".ln > span", { yPercent: 110, duration: 1.1, stagger: 0.1 }, "-=.8")
        .from(".pitch-rest > *", { opacity: 0, y: 20, duration: 0.9, stagger: 0.08 }, "-=.8")
        .from(".clip", { scaleX: 0, transformOrigin: "left", duration: 0.9, stagger: 0.015 }, "-=1");
    }
  }, { scope: root });

  const vid = (cls: string, label?: string) => (
    <video
      key={w.src + cls}
      className={cls}
      src={`/media/${w.src}.mp4`}
      poster={`/media/${w.src}-2.jpg`}
      muted loop playsInline autoPlay={playing}
      aria-label={label} aria-hidden={!label}
    />
  );

  return (
    <section ref={root} id="top" aria-label="Showreel editor"
      className="grid gap-3 px-[max(16px,env(safe-area-inset-left))] pt-[calc(64px+env(safe-area-inset-top))] pb-3 min-[981px]:h-svh min-[981px]:grid-rows-[1fr_auto] min-h-svh">
      <div className="grid min-h-0 gap-3 max-[980px]:contents min-[981px]:grid-cols-[minmax(300px,1fr)_1.6fr]">
        {/* Project panel */}
        <div className="panel">
          <div className="ph"><span className="flex gap-1.5" aria-hidden><i className="size-2.5 rounded-full bg-brand" /><i className="size-2.5 rounded-full bg-p3" /><i className="size-2.5 rounded-full bg-p3" /></span><b className="font-medium text-fg">Project</b><span className="font-mono">ADSCUT.IN</span></div>
          <div className="grid content-between gap-6 p-[clamp(18px,2.4vw,36px)] min-[981px]:h-[calc(100%-41px)]">
            <div className="grid gap-[18px]">
              <h1 className="text-[clamp(40px,4.6vw,84px)] leading-[0.95] font-bold tracking-[-0.045em]">
                <span className="ln block overflow-hidden pb-[.04em]"><span className="block">Ads cut to</span></span>
                <span className="ln block overflow-hidden pb-[.04em]"><span className="block text-brand">strike first.</span></span>
              </h1>
              <div className="pitch-rest grid gap-[18px]">
                <p className="max-w-[40ch] text-[clamp(15px,1.1vw,17px)] text-dim">AdsCut edits UGC and product ads from your raw footage. <span className="max-[980px]:hidden">Scroll to scrub the reel: the monitor plays whatever is under the playhead.</span><span className="min-[981px]:hidden">Drag the timeline below to scrub the reel.</span></p>
                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
                  <a className="btn btn-big justify-center" href={FIVERR_URL} target="_blank" rel="noopener">Order on Fiverr</a>
                  <a className="btn btn-big btn-ghost justify-center" href="#bin">See the work</a>
                </div>
              </div>
            </div>
            <dl className="pitch-rest max-[980px]:hidden grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-line pt-[18px] text-[13px]" aria-live="polite">
              <dt className="text-dim">Clip</dt><dd className="truncate">{w.title}</dd>
              <dt className="text-dim">Type</dt><dd>{w.label}</dd>
              <dt className="text-dim">Format</dt><dd className="font-mono">{w.format}</dd>
              <dt className="text-dim">Position</dt><dd className="font-mono">{String(cur + 1).padStart(2, "0")} / {WORKS.length}</dd>
            </dl>
          </div>
        </div>

        {/* Program monitor */}
        <div className="panel grid grid-rows-[auto_1fr_auto] max-[980px]:order-1">
          <div className="ph"><span>Program</span><b className="font-medium text-fg">{w.title}</b><span className="font-mono">Fit</span></div>
          <div className="relative min-h-0 overflow-hidden bg-black max-[980px]:aspect-[16/10]">
            <img key={w.src} src={`/media/${w.src}-2.jpg`} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover blur-2xl brightness-[.45]" />
            {vid("absolute inset-0 size-full object-contain", "Program monitor")}
            <div className="guides pointer-events-none absolute inset-[7%]" aria-hidden><i /><i /><i /><i /></div>
            <span className="absolute top-3.5 left-4 flex items-center gap-2 font-mono text-xs text-white [text-shadow:0_1px_2px_#000]"><i className="rec-dot size-2 rounded-full bg-[#ff4d3d]" />{playing ? "PLAY" : "PAUSE"}</span>
            <span ref={(el) => { if (el) tcRefs.current[0] = el }} className="absolute top-3 right-4 font-mono text-[13px] text-white [text-shadow:0_1px_2px_#000]">00:00:00:00</span>
            <div ref={flash} className="pointer-events-none absolute inset-0 bg-white opacity-0" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 font-mono text-xs text-dim">
            <span ref={(el) => { if (el) tcRefs.current[1] = el }}>00:00:00:00</span>
            <div className="flex gap-1 text-fg">
              <button className="grid size-9 place-items-center rounded-lg hover:bg-p3" aria-label="Previous clip" onClick={() => goTo(cur - 1)}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 3v10M13 3 6 8l7 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" /></svg></button>
              <button className="grid size-9 place-items-center rounded-lg hover:bg-p3" aria-label={playing ? "Pause" : "Play"}
                onClick={() => { setPlaying(!playing); root.current?.querySelectorAll("video").forEach((v) => (playing ? v.pause() : v.play())) }}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>{playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" /> : <path d="M4 2v12l10-6z" fill="currentColor" />}</svg>
              </button>
              <button className="grid size-9 place-items-center rounded-lg hover:bg-p3" aria-label="Next clip" onClick={() => goTo(cur + 1)}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M13 3v10M3 3l7 5-7 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" /></svg></button>
            </div>
            <span>Reel {timecode(TOTAL).slice(3, 8)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="panel grid h-[clamp(170px,26svh,250px)] grid-rows-[auto_1fr] max-[980px]:order-2">
        <div className="ph"><b className="font-medium text-fg">Timeline: showreel</b><span className="max-[980px]:hidden">Scroll to scrub</span><span className="min-[981px]:hidden">Drag to scrub</span><span className="font-mono">{WORKS.length} clips</span></div>
        <div className="relative grid grid-cols-[54px_1fr] overflow-hidden">
          <div className="lanes border-r border-line font-mono text-[11px] font-medium text-dim" aria-hidden>
            {["", "V2", "V1", "A1"].map((t) => <span key={t} className="grid place-items-center border-b border-line">{t}</span>)}
          </div>
          <div ref={laneWrap} className="relative touch-pan-y overflow-hidden">
            <div ref={lanesRef} className="lanes absolute inset-y-0 left-0" style={{ width: TOTAL * PX }}>
              <div className="relative border-b border-line"><canvas data-ruler className="absolute inset-0 h-full" style={{ width: TOTAL * PX }} /></div>
              <div className="relative border-b border-line">
                {WORKS.map((x, i) => <div key={x.src} className="clip bg-v2/70 text-white" style={{ left: STARTS[i] * PX + x.seconds * PX * 0.1, width: x.seconds * PX * 0.45 }}>{x.layer}</div>)}
              </div>
              <div className="relative border-b border-line">
                {WORKS.map((x, i) => (
                  <button key={x.src} type="button" aria-label={`Play ${x.title}`} onClick={() => !dragged.current && goTo(i)} className={`clip cursor-pointer bg-p3 ${i === cur ? "shadow-[inset_0_0_0_2px_var(--color-brand)]" : "shadow-[inset_0_0_0_1px_rgb(255_255_255/.06)]"}`} style={{ left: STARTS[i] * PX + 2, width: x.seconds * PX - 4 }}>
                    {[0, 1, 2, 3, 4, 5].map((k) => <img key={k} src={`/media/${x.src}-${k}.jpg`} alt="" loading="lazy" className="absolute top-0 h-full w-auto max-w-none opacity-55" style={{ left: (k * x.seconds * PX) / 6 }} />)}
                    <span className="relative z-10 rounded bg-black/55 px-1.5 py-0.5">{x.title}</span>
                  </button>
                ))}
              </div>
              <div className="relative border-b border-line">
                {WORKS.map((x, i) => <div key={x.src} className="clip bg-a1/20 !p-0" style={{ left: STARTS[i] * PX + 2, width: x.seconds * PX - 4 }}><canvas data-seed={i + 1} className="size-full" /></div>)}
              </div>
            </div>
            <div className="playhead" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
