// Everything the site shows lives here. To add an ad: put the source in videos/,
// run `npm run media -- videos/<file> <name> [loop-start]`, then add one entry.

export const FIVERR_URL = "https://www.fiverr.com/"; // TODO: your gig URL

export type Category = "ugc" | "product" | "motion";

export type Work = {
  src: string; // file stem in public/media: <src>.mp4 loop, <src>-full.mp4, <src>-0…5.jpg
  title: string;
  category: Category;
  label: string; // shown next to the title
  format: "9:16" | "2:3" | "3:4" | "4:5" | "1:1" | "16:9";
  seconds: number; // loop length on the timeline
  length: number; // full ad length
  layer: string; // what the V2 track shows we added
};

export const WORKS: Work[] = [
  { src: "nike-airforce", title: "Nike AirForce Drop", category: "product", label: "Sneakers", format: "4:5", seconds: 8, length: 15, layer: "Price card" },
  { src: "sneaker-dust", title: "Sneaker Dust", category: "product", label: "Sneaker concept", format: "3:4", seconds: 8, length: 15, layer: "Grade" },
  { src: "tapovan-noodles", title: "Tapovan Inn Noodles", category: "product", label: "Restaurant", format: "4:5", seconds: 8, length: 15, layer: "End card" },
  { src: "dream-number-10", title: "Dream Number 10", category: "motion", label: "Animated story", format: "1:1", seconds: 8, length: 15, layer: "Story" },
  { src: "lays-cheese-dive", title: "Lay's Cheese Dive", category: "motion", label: "3D animation", format: "9:16", seconds: 8, length: 10, layer: "Characters" },
  { src: "realme-buds", title: "Realme Buds", category: "product", label: "Tech", format: "3:4", seconds: 8, length: 15, layer: "Sound" },
  { src: "face-mist", title: "Face Mist Ritual", category: "ugc", label: "Beauty", format: "2:3", seconds: 8, length: 15, layer: "Hook" },
  { src: "streetwear-drop", title: "Streetwear Drop", category: "product", label: "Fashion", format: "9:16", seconds: 8, length: 10, layer: "Motion" },
  { src: "love-at-first-bite", title: "Love at First Bite", category: "product", label: "Pizza", format: "9:16", seconds: 8, length: 15, layer: "Titles" },
  { src: "pepsi-splash", title: "Pepsi Splash", category: "product", label: "Drinks", format: "9:16", seconds: 5, length: 5, layer: "Splash" },
  { src: "gameclip-reveal", title: "GameClip.run Reveal", category: "motion", label: "Logo reveal", format: "16:9", seconds: 8, length: 10, layer: "Logo" },
  { src: "skindeo-serum", title: "Skindeo Serum", category: "product", label: "Skincare", format: "2:3", seconds: 8, length: 15, layer: "End card" },
  { src: "matcha-energy", title: "Matcha Energy", category: "ugc", label: "Drinks", format: "2:3", seconds: 8, length: 15, layer: "Hook" },
  { src: "tiny-harvest", title: "Tiny Harvest", category: "motion", label: "Miniature animation", format: "9:16", seconds: 5, length: 5, layer: "Stop-motion" },
  { src: "the-charge", title: "The Charge", category: "motion", label: "Cinematic", format: "9:16", seconds: 5, length: 5, layer: "Camera" },
  { src: "chicken-shawarma", title: "Spicy Chicken Shawarma", category: "product", label: "Food", format: "2:3", seconds: 8, length: 15, layer: "Price card" },
  { src: "glow-serum", title: "Glow Serum", category: "product", label: "Skincare", format: "4:5", seconds: 8, length: 10, layer: "Titles" },
  { src: "faux-hawk", title: "Faux Hawk", category: "product", label: "Barbershop", format: "3:4", seconds: 8, length: 15, layer: "End card" },
  { src: "krosskube-sale", title: "KrossKube Sale", category: "motion", label: "Promo", format: "4:5", seconds: 8, length: 15, layer: "Promo" },
  { src: "flame-breathing", title: "Flame Breathing", category: "motion", label: "Anime edit", format: "16:9", seconds: 8, length: 10, layer: "VFX" },
  { src: "something-fishy", title: "Something Fishy", category: "product", label: "Sneaker concept", format: "3:4", seconds: 8, length: 15, layer: "Grade" },
];

export const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ugc", label: "UGC" },
  { id: "product", label: "Product ads" },
  { id: "motion", label: "Motion" },
];

// Prices in USD; keep in sync with the Fiverr gig
export const PACKAGES = [
  { name: "Basic", tag: "Preset", days: 2, price: 25, hot: false, rows: [["Videos", "1, up to 15 s"], ["Hooks", "1"], ["Formats", "9:16"], ["Finish", "Captions, licensed music"], ["Revisions", "1"]] },
  { name: "Standard", tag: "Most ordered", days: 3, price: 55, hot: true, rows: [["Videos", "3, up to 30 s"], ["Hooks", "2 per video"], ["Formats", "9:16 and 1:1"], ["Finish", "Kinetic captions, sound design"], ["Revisions", "2"]] },
  { name: "Premium", tag: "Preset", days: 4, price: 115, hot: false, rows: [["Videos", "5, up to 60 s"], ["Hooks", "3 per video"], ["Formats", "All four"], ["Finish", "Motion graphics, full grade and mix, project file"], ["Revisions", "3"]] },
];

export const FAQ = [
  ["What footage should I send?", "Everything you shot, straight off the phone or camera. Long takes are fine; the best hook is often hiding in the middle of one."],
  ["Do you film the videos?", "No. AdsCut edits footage that you or your creators shoot, and can send a shot list before you film."],
  ["Which platforms do you cut for?", "TikTok, Instagram Reels, YouTube Shorts, and paid placements on Meta and TikTok ads."],
  ["Where does the music come from?", "A licensed library cleared for ads. For organic posts you can add a trending sound in the app after export."],
  ["Can I get the project file?", "Premium includes the Premiere Pro project with all media linked."],
];

export const FPS = 24;
export const timecode = (s: number) => {
  const f = Math.floor(s * FPS);
  const p = (n: number) => String(n).padStart(2, "0");
  return `00:${p(Math.floor(f / FPS / 60))}:${p(Math.floor(f / FPS) % 60)}:${p(f % FPS)}`;
};
