"use client";
import { useEffect, useRef, useState } from "react";
import { FIVERR_URL } from "@/data/site";

// "Meet the editor": a second monitor panel holding the intro video. Nothing downloads until play.
export default function Intro() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // Pause (never auto-resume, it has sound) once the panel scrolls out of view.
  useEffect(() => {
    const v = video.current!;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) v.pause() }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const play = () => {
    const v = video.current!;
    setStarted(true);
    v.muted = false;
    v.play().catch(() => {});
  };

  return (
    <section id="intro" aria-labelledby="intro-h" className="gx grid items-center gap-x-10 gap-y-8 pt-[18vh] pb-[6vh] min-[981px]:grid-cols-[1fr_1.6fr]">
      <div className="grid content-start gap-5">
        <div><span className="kicker">Meet the editor</span><h2 id="intro-h" className="h2 reveal">Hey, I’m <em>Kalash.</em></h2></div>
        <p className="max-w-[40ch] text-dim">Thirty seconds on who I am and the kind of ads I cut: UGC, product launches and motion graphics, edited to hold attention from the first frame.</p>
        <div className="flex flex-wrap gap-2.5">
          <a className="btn btn-big" href={FIVERR_URL} target="_blank" rel="noopener">Order on Fiverr</a>
          <a className="btn btn-big btn-ghost" href="#bin">See every ad</a>
        </div>
      </div>

      <div className="panel">
        <div className="relative aspect-video bg-black">
          <video ref={video} src="/media/intro.mp4" poster="/media/intro-poster.jpg" preload="none" playsInline controls={started}
            className="absolute inset-0 size-full object-cover" aria-label="AdsCut intro video" />
          {!started && (
            <button onClick={play} aria-label="Play the intro video with sound"
              className="group absolute inset-0 grid place-items-center bg-black/25 transition-colors hover:bg-black/10">
              <span className="relative grid size-24 place-items-center rounded-full bg-brand text-brand-ink transition-transform duration-500 ease-out-expo group-hover:scale-110 group-active:scale-95 max-sm:size-[72px]">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 [animation-duration:2.2s]" aria-hidden />
                <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden className="relative ml-1"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
              </span>
              <span className="absolute right-4 bottom-4 rounded-md bg-black/70 px-2 py-1 font-mono text-xs text-fg">Sound on · 0:29</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
