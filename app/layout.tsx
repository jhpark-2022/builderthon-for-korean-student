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

// ── 공유 카드 문자열 ─────────────────────────────────────────────────────────
// DECIDED 2026-08-23: 라이브 신호를 첫 화면으로 승격 — 히어로 오늘/다음 스트립,
// OG 메타데이터 국면 전환. 시계는 getEventDayState 하나.
//
// 이 파일은 그 "하나의 시계"를 쓸 수 없습니다. 홈은 정적 생성이라 여기 metadata는
// 빌드 시점에 한 번 굳고 요청 시각을 볼 수 없어요. 날짜를 보는 문구로 바꾸려면
// generateMetadata + 동적 렌더링이 필요하고, 그건 홈을 정적에서 내리는 값입니다.
//
// 그래서 "진행 중"이라고 쓰지 않습니다. 대신 어느 국면에서 읽어도 맞는 문장을
// 씁니다: 날짜는 그대로 박아 두고, 서술만 안내형에서 무엇을 하고 있는가로
// 옮겼습니다. 행사 중에는 지금 벌어지는 일로, 끝난 뒤에는 기록으로 읽힙니다.
//
// 모집형 문구(등록·신청·지원하세요)는 원래 없었습니다 — 2026-08-23 전수 확인.
// 다시 넣지 마세요.
const OG_DESCRIPTION =
  "Singapore's first AI builderthon for Korean students, taking on real companies' AI-transformation problems. 22–29 Aug 2026, 8 days.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zero100 AI Builderthon Build in Singapore",
  description:
    "Singapore's first AI builderthon for Korean students. 22–29 Aug 2026 8 days, ~100 builders solving real companies' AI-transformation problems with vibe coding, from zero to MVP.",
  keywords: ["Builderthon", "Zero100", "Singapore", "Korean students", "AI", "vibe coding", "hackathon", "NUS", "NTU", "SMU"],
  openGraph: {
    title: "Zero100 AI Builderthon",
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "Zero100 AI Builderthon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero100 AI Builderthon",
    description: OG_DESCRIPTION,
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
