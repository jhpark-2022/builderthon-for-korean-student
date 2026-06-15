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
  title: "SMU × Zero100 Builderthon — Build in Singapore",
  description:
    "Singapore's first festival-style builderthon for Korean students. 24–29 Aug 2026 · 6 days · ~100 builders. Co-building, global out-bounding, AI-native.",
  keywords: ["Builderthon", "Zero100", "KOMOS", "SMU", "Singapore", "Korean students", "hackathon", "vibe coding"],
  openGraph: {
    title: "SMU × Zero100 Builderthon",
    description: "Singapore's first festival-style builderthon for Korean students · 24–29 Aug 2026.",
    url: SITE_URL,
    siteName: "SMU × Zero100 Builderthon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMU × Zero100 Builderthon",
    description: "Singapore's first festival-style builderthon for Korean students · 24–29 Aug 2026.",
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
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
