import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://adscut.in"), // TODO: confirm the live domain
  title: "AdsCut.in · UGC and product ad editing",
  description: "AdsCut edits UGC and product ads from your raw footage: hooks, kinetic captions, sound and every format. Order on Fiverr.",
};

export const viewport: Viewport = { themeColor: "#0d0e0f", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans text-base leading-[1.55]">{children}</body>
    </html>
  );
}
