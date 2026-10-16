"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion, usePauseOffscreen } from "@/lib/motion";

const WORDS = ["This", "matcha", "keeps", "me", "focused", "all", "day", "link", "in", "bio"];
const RATIOS = [
  { r: [9, 16], label: "9:16 · TikTok, Reels" },
  { r: [4, 5], label: "4:5 · Feed" },
  { r: [1, 1], label: "1:1 · Square" },
  { r: [16, 9], label: "16:9 · YouTube" },
] as const;

function Panel({ name, meta, title, body, children }: { name: string; meta: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <article className="panel fxp grid grid-rows-[auto_auto_1fr]">
      <div className="ph"><b className="font-medium text-fg">{name}</b><span className="font-mono">{meta}</span></div>
      <div className="grid gap-1.5 px-[18px] pt-[18px] pb-3"><h3 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h3><p className="text-sm text-dim">{body}</p></div>
      <div className="relative mx-3 mb-3 grid h-[360px] place-items-center overflow-hidden rounded-[10px] bg-black">{children}</div>
    </article>
  );
}

export default function Effects() {
  const [word, setWord] = useState(0);
  const [ratio, setRatio] = useState(0);
  const [cut, setCut] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  usePauseOffscreen(section);

  useEffect(() => {
    if (reducedMotion()) return; // CSS shows every word at rest
    const id = setInterval(() => setWord((w) => (w + 1) % (WORDS.length + 3)), 340);
    return () => clearInterval(id);
  }, []);

  const reframe = (i: number) => {
    setRatio(i);
    const el = box.current!, [a, b] = RATIOS[i].r, h = Math.min(300, ((el.parentElement!.clientWidth - 40) * b) / a);
    gsap.to(el, { height: h, width: (h * a) / b, duration: reducedMotion() ? 0 : 0.8, ease: "expo.inOut" });
  };

  return (
    <section ref={section} id="effects" aria-labelledby="fx-h" className="gx pt-[18vh] pb-[6vh]">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div><span className="kicker">Effect controls</span><h2 id="fx-h" className="h2 reveal">What we <em>do</em> to footage.</h2></div>
        <p className="max-w-[40ch] text-dim">Try them. These are the three things that move an ad from skipped to watched.</p>
      </div>
      <div className="grid gap-3.5 min-[981px]:grid-cols-3">
        <Panel name="Captions" meta="Kinetic · burned in" title="Captions that pop" body="Every spoken word on screen, timed to the syllable, styled to your brand.">
          <video src="/media/matcha-energy.mp4" muted loop playsInline autoPlay aria-hidden className="absolute inset-0 size-full object-cover brightness-80" />
          <p className="relative z-10 mt-[140px] flex max-w-full flex-wrap justify-center gap-1.5 px-6 text-center" aria-label={WORDS.join(" ")}>
            {WORDS.map((t, i) => <span key={i} className="cap-word" aria-hidden data-state={i === word ? "on" : i < word ? "done" : ""}>{t}</span>)}
          </p>
        </Panel>

        <Panel name="Reframe" meta={RATIOS[ratio].label} title="One edit, every format" body="The subject stays in frame whichever placement runs it.">
          <div ref={box} className="relative h-[300px] overflow-hidden rounded-md shadow-[0_0_0_2px_var(--color-brand)]" style={{ width: (300 * 9) / 16 }}>
            <video src="/media/nike-airforce.mp4" muted loop playsInline autoPlay aria-hidden className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex justify-center gap-1" role="group" aria-label="Aspect ratio">
            {RATIOS.map((x, i) => (
              <button key={i} aria-pressed={ratio === i} onClick={() => reframe(i)}
                className="min-h-9 rounded-lg bg-black/60 px-3 font-mono text-xs font-medium transition-colors aria-pressed:bg-brand aria-pressed:text-brand-ink">{x.r.join(":")}</button>
            ))}
          </div>
        </Panel>

        <Panel name="Colour" meta="Log → graded" title="A grade that sells" body="Drag across the frame to compare flat footage with the finished grade.">
          <div className="absolute inset-0" style={{ "--cut": `${cut}%` } as React.CSSProperties}>
            <img src="/media/tapovan-noodles-3.jpg" alt="Flat, ungraded frame of a noodle bowl" className="log absolute inset-0 size-full object-cover" />
            <img src="/media/tapovan-noodles-3.jpg" alt="" className="graded absolute inset-0 size-full object-cover" />
            <span className="pointer-events-none absolute inset-y-0 -ml-[1.5px] w-[3px] bg-brand" style={{ left: `${cut}%` }}>
              <span className="absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-brand font-bold text-brand-ink">⟷</span>
            </span>
            <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[11px]">LOG</span>
            <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[11px]">GRADED</span>
            <input type="range" min={0} max={100} value={cut} onChange={(e) => setCut(+e.target.value)} aria-label="Compare grade" className="absolute inset-0 m-0 size-full cursor-ew-resize opacity-0" />
          </div>
        </Panel>
      </div>
    </section>
  );
}
