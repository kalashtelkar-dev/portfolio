// Builds the AdsCut.in "Razor" logo as pure vector shapes (no font needed at runtime).
//   node scripts/build-logo.mjs path/to/InterTight-800.ttf
// Writes public/logo.svg (wordmark, dark UI), public/logo-light.svg (for light backgrounds)
// and app/icon.svg (favicon tile). PNG and .ico versions are rendered from these.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const opentype = require(process.env.OPENTYPE ?? "opentype.js");

const font = opentype.loadSync(process.argv[2]);
const SIZE = 100, TRACK = -5; // matches the approved board: Inter Tight 800, 100 px, -5 px tracking
const GREEN = "#a3e635";

// Outline a string with manual tracking; returns path data and advance width.
function outline(text) {
  let x = 0, d = "";
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    // one <path> per glyph: overlapping letters would punch holes if merged into one path
    d += `<path d="${g.getPath(x, 0, SIZE).toPathData(2)}"/>`;
    x += (g.advanceWidth / font.unitsPerEm) * SIZE + TRACK;
    if (glyphs[i + 1]) x += (font.getKerningValue(g, glyphs[i + 1]) / font.unitsPerEm) * SIZE;
  });
  return { d, width: x - TRACK };
}

// The Razor cut: one straight blade; everything above it slides forward along the blade.
function razor(text, ink, id) {
  const { d, width: w } = outline(text);
  const y0 = -28, y1 = -48, yAt = (x) => y0 + ((y1 - y0) * (x + 20)) / (w + 40), sl = (y1 - y0) / (w + 40);
  const L = -80, R = w + 80, shift = 9;
  const markup = `<defs><clipPath id="${id}t"><polygon points="${L},-200 ${R},-200 ${R},${yAt(R)} ${L},${yAt(L)}"/></clipPath><clipPath id="${id}b"><polygon points="${L},${yAt(L)} ${R},${yAt(R)} ${R},60 ${L},60"/></clipPath></defs>
<g fill="${ink}" clip-path="url(#${id}b)">${d}</g>
<g transform="translate(${shift} ${(shift * sl).toFixed(3)})"><g fill="${ink}" clip-path="url(#${id}t)">${d}</g></g>
<path d="M-34 ${yAt(-34).toFixed(2)}L-8 ${yAt(-8).toFixed(2)}M${w + 14} ${yAt(w + 14).toFixed(2)}L${w + 40} ${yAt(w + 40).toFixed(2)}" stroke="${GREEN}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`;
  const bb = font.getPath(text, 0, 0, SIZE).getBoundingBox();
  // ink bounds: letters (plus the forward slide) and the two blade tips
  const box = { x1: -36, y1: Math.min(bb.y1 - 1, yAt(w + 40) - 2), x2: w + 42 + shift * 0, y2: Math.max(bb.y2 + 1, yAt(-34) + 2) };
  return { markup, box };
}

const svg = (vb, body, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${extra}>${body}</svg>\n`;
const vb = ({ x1, y1, x2, y2 }, pad = 0) => `${(x1 - pad).toFixed(2)} ${(y1 - pad).toFixed(2)} ${(x2 - x1 + 2 * pad).toFixed(2)} ${(y2 - y1 + 2 * pad).toFixed(2)}`;

// Wordmarks
const dark = razor("adscut", "#eceee9", "w");
writeFileSync("public/logo.svg", svg(vb(dark.box, 2), dark.markup, ' fill="none"'));
const light = razor("adscut", "#0d0e0f", "l");
writeFileSync("public/logo-light.svg", svg(vb(light.box, 2), light.markup.replaceAll(GREEN, "#4d7c0f"), ' fill="none"'));

// Icon: the sliced "a" centred on a rounded graphite tile
const a = razor("a", "#eceee9", "i");
const bw = a.box.x2 - a.box.x1, bh = a.box.y2 - a.box.y1, T = 512, k = (T * 0.76) / Math.max(bw, bh);
const tx = T / 2 - (a.box.x1 + bw / 2) * k, ty = T / 2 - (a.box.y1 + bh / 2) * k;
const tile = `<rect width="${T}" height="${T}" rx="${T * 0.22}" fill="#0d0e0f"/><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})">${a.markup}</g>`;
writeFileSync("app/icon.svg", svg(`0 0 ${T} ${T}`, tile));
// Full-bleed version for the Apple touch icon (iOS rounds the corners itself); rasterise to app/apple-icon.png
writeFileSync("public/apple-icon.svg", svg(`0 0 ${T} ${T}`, tile.replace(`rx="${T * 0.22}"`, 'rx="0"')));

console.log("wordmark", vb(dark.box, 2), "| icon scale", k.toFixed(3));
