import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";

// Self-hosted Pretendard (variable) — served same-origin from the Vercel edge,
// preloaded, with a metric-matched fallback (no CLS). Replaces the old
// render-blocking jsdelivr @import.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
  preload: true,
});

// TODO: swap to the real custom domain once connected.
const SITE_URL = "https://builderthon-for-korean-student.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zero100 Builderthon — Build in Singapore",
  description:
    "Singapore's first AI builderthon for Korean students. 22–29 Aug 2026 · 8 days · ~100 builders solving real companies' AI-transformation problems with vibe coding — from zero to MVP.",
  keywords: ["Builderthon", "Zero100", "Singapore", "Korean students", "AI", "vibe coding", "hackathon", "NUS", "NTU", "SMU"],
  openGraph: {
    title: "Zero100 Builderthon",
    description: "Singapore's first AI builderthon for Korean students · 22–29 Aug 2026 · 8 days.",
    url: SITE_URL,
    siteName: "Zero100 Builderthon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero100 Builderthon",
    description: "Singapore's first AI builderthon for Korean students · 22–29 Aug 2026 · 8 days.",
  },
};

export const viewport: Viewport = {
  themeColor: "#06040f",
  width: "device-width",
  initialScale: 1,
  // Let content extend into the display cutouts so env(safe-area-inset-*) is
  // non-zero — used by the mobile event modal's bottom-sheet padding.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${pretendard.variable}`}>
      <body className="font-sans antialiased bg-[#06040f] text-white">
        {/* Keyboard-only skip link: invisible until focused, lets keyboard /
            screen-reader users bypass the fixed nav. No effect on normal layout. */}
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
