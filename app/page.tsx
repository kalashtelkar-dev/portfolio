import Editor from "@/components/editor";
import Bin from "@/components/bin";
import Effects from "@/components/effects";
import Motion from "@/components/motion";
import { FAQ, FIVERR_URL, PACKAGES } from "@/data/site";

const ext = { target: "_blank", rel: "noopener" } as const;

export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[60] flex h-[calc(60px+env(safe-area-inset-top))] items-center justify-between gap-4 border-b border-line bg-bg/80 px-[max(16px,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] min-[981px]:px-6 backdrop-blur-md">
        <a href="#top" aria-label="AdsCut.in, back to top" className="flex items-center">
          <img src="/logo.svg" alt="AdsCut.in" width={120} height={25} className="h-[22px] w-auto" />
        </a>
        <nav aria-label="Main" className="flex gap-1 text-sm max-[980px]:hidden">
          {[["#bin", "Work"], ["#effects", "Services"], ["#export", "Packages"], ["#help", "Help"]].map(([h, t]) => (
            <a key={h} href={h} className="rounded-lg px-3 py-2 text-dim transition-colors hover:bg-p2 hover:text-fg">{t}</a>
          ))}
        </nav>
        <a className="btn min-h-10 rounded-lg px-4 text-[13px]" href={FIVERR_URL} {...ext}>Order on Fiverr</a>
      </header>

      <Editor />

      <main>
        <Bin />
        <Effects />

        <section id="export" aria-labelledby="ex-h" className="gx pt-[18vh] pb-[6vh]">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <div><span className="kicker">Export settings</span><h2 id="ex-h" className="h2 reveal">Pick a <em>preset.</em></h2></div>
            <p className="max-w-[40ch] text-dim">Every order, payment and file goes through Fiverr. Need more than five videos? Ask for a custom offer.</p>
          </div>
          <div className="grid gap-3.5 min-[981px]:grid-cols-3">
            {PACKAGES.map((p) => (
              <article key={p.name} className={`panel preset group grid content-start gap-5 p-[22px] transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-brand ${p.hot ? "border-brand !bg-brand text-brand-ink" : ""}`}>
                <div className="flex justify-between font-mono text-xs opacity-80"><span>{p.tag}</span><span>{p.days} days</span></div>
                <h3 className="text-[28px] font-bold tracking-[-0.03em]">{p.name}</h3>
                <div className="text-[clamp(56px,5vw,88px)] leading-[0.9] font-bold tracking-[-0.06em] tabular-nums">${p.price}<small className="ml-1 text-base font-medium tracking-normal opacity-70">/order</small></div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  {p.rows.map(([k, v]) => [<dt key={k} className="pt-0.5 font-mono text-xs opacity-65">{k}</dt>, <dd key={k + "v"}>{v}</dd>])}
                </dl>
                <a className={`render ${p.hot ? "!bg-brand-ink text-brand group-hover:text-bg [&_i]:!bg-fg" : "group-hover:text-brand-ink"}`} href={FIVERR_URL} {...ext}><i />Render {p.name}</a>
              </article>
            ))}
          </div>
        </section>

        <section id="help" aria-labelledby="help-h" className="gx grid gap-10 pt-[18vh] pb-[12vh] min-[981px]:grid-cols-[1fr_1.5fr]">
          <div><span className="kicker">Help</span><h2 id="help-h" className="h2 reveal">Before you <em>order.</em></h2></div>
          <div>
            {FAQ.map(([q, a], i) => (
              <details key={q} className="group border-b border-line">
                <summary className="flex cursor-pointer items-center justify-between gap-5 px-1 py-5 text-lg font-medium">{q}<span className="min-w-10 text-right font-mono text-xs text-dim group-open:text-brand">⌘{i + 1}</span></summary>
                <p className="max-w-[60ch] px-1 pb-5 text-dim">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="final" aria-labelledby="fin-h" className="gx grid min-h-[90svh] content-center gap-9 border-t border-line py-[12vh]">
          <span className="kicker">Rendering your next ad</span>
          <h2 id="fin-h" className="text-[clamp(56px,11vw,200px)] leading-[0.85] font-bold tracking-[-0.06em]">Your footage.<br /><em className="text-brand not-italic">Our cut.</em></h2>
          <div className="h-3.5 overflow-hidden rounded-full bg-p2" aria-hidden><i id="prog" className="block h-full origin-left scale-x-[.02] bg-brand" /></div>
          <div className="flex flex-wrap items-center justify-between gap-5 text-dim">
            <span id="pct" className="font-mono">Rendering 2%</span>
            <a className="btn btn-big" href={FIVERR_URL} {...ext}>Order on Fiverr</a>
          </div>
        </section>
      </main>

      <footer className="gx grid grid-cols-[1fr_auto] gap-[18px] border-t border-line py-7 text-[13px] text-dim">
        <span>© 2026 AdsCut.in · UGC, product ads, motion graphics</span>
        <nav aria-label="Footer" className="flex gap-[18px]"><a className="hover:text-fg" href="#bin">Work</a><a className="hover:text-fg" href="#export">Packages</a><a className="hover:text-fg" href={FIVERR_URL} {...ext}>Fiverr</a></nav>
        <p className="col-span-full text-xs">Powered by <a className="font-medium text-fg underline-offset-4 hover:text-brand hover:underline" href="https://deepsoch.ai/" {...ext}>Deepsoch AI</a></p>
      </footer>

      <Motion />
    </>
  );
}
