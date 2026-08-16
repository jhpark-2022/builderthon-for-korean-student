import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import SkipLink from "@/components/SkipLink";

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
  title: "Zero100 AI Builderthon Build in Singapore",
  description:
    "Singapore's first AI builderthon for Korean students. 22–29 Aug 2026 8 days, ~100 builders solving real companies' AI-transformation problems with vibe coding, from zero to MVP.",
  keywords: ["Builderthon", "Zero100", "Singapore", "Korean students", "AI", "vibe coding", "hackathon", "NUS", "NTU", "SMU"],
  openGraph: {
    title: "Zero100 AI Builderthon",
    description: "Singapore's first AI builderthon for Korean students, 22–29 Aug 2026 8 days.",
    url: SITE_URL,
    siteName: "Zero100 AI Builderthon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero100 AI Builderthon",
    description: "Singapore's first AI builderthon for Korean students, 22–29 Aug 2026 8 days.",
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

// Runs while the browser is still parsing <body>, before anything paints, and
// stamps the saved locale onto <html> as `lang` and `data-locale`.
//
// The markup ships as Korean because that is LocaleProvider's default and these
// pages are statically generated — the server has no way to know a preference
// that lives in localStorage. Without this, an English visitor saw Korean until
// the React bundle landed and the provider's effect swapped it. On the home page
// that is a frame; on /quiz it is the whole pre-hydration window, because the
// server shell there paints real copy (app/quiz/QuizIntroShell.tsx).
//
// So the shell ships BOTH languages and lets CSS pick one off `data-locale`
// (see the [data-l] rules in globals.css). This script is what sets that
// attribute in time. Reading cookies in the layout instead would work too, but
// it would opt every page out of static rendering for one string.
//
// Keep the storage key and the "ko" fallback in step with LocaleContext.
const LOCALE_BOOTSTRAP = `(function(){try{var l=localStorage.getItem("builderthon.locale");if(l!=="ko"&&l!=="en")l="ko";var d=document.documentElement;d.lang=l;d.setAttribute("data-locale",l);}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Matches LocaleProvider's default. Corrected before paint by the bootstrap
    // script below, and kept in sync afterwards by the provider's effect, so a
    // visitor who has chosen English gets lang="en" — this is only the value the
    // markup ships with.
    <html lang="ko" data-locale="ko" className={`dark ${pretendard.variable}`}>
      <body className="font-sans antialiased bg-[#06040f] text-white">
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOTSTRAP }} />
        <LocaleProvider>
          {/* First child of the provider so it stays first in the DOM — the
              provider renders no markup of its own. */}
          <SkipLink />
          {children}
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
