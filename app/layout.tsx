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
// DECIDED 2026-09-15 (나루 런칭): 레이아웃의 metadata는 이제 나루를 말합니다.
// 여기 있던 8월 회차 문구는 app/2026-08/page.tsx로 내려갔습니다 — 한 글자도
// 바뀌지 않았고, 사는 곳만 옮겼어요.
//
// title.template이 요점입니다. 레이아웃이 기본 제목을 들고, 각 페이지가 자기
// 제목을 얹습니다: /2026-08은 "Zero100 AI Builderthon Build in Singapore |
// 나루 NARU", /quiz는 자기 제목 그대로. 홈만 default를 씁니다.
//
// 설명에 날짜를 박아 둔 것은 이 페이지가 정적 생성이기 때문입니다. 빌드 시점에
// 한 번 굳고 요청 시각을 볼 수 없어요(8월 페이지에서 배운 것과 같은 제약).
// 그래서 어느 국면에서 읽어도 맞는 문장을 씁니다.
//
// TODO: confirm — 12월 종료일이 확정되면 설명의 "2026년 12월 9일"을 기간으로
// 바꿀지 결정합니다. 날짜 문자열의 정본은 lib/naruDates.ts입니다.
const SITE_NAME = "나루 NARU";
const SITE_DESCRIPTION =
  "싱가포르 한인 학생 빌더 커뮤니티. 안전하게 도전할 자리와 자기 가치를 증명할 경험을 만듭니다. 다음 회차는 2026년 12월 9일 서울에서 시작합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "나루", "NARU", "싱가포르 한인 학생", "빌더 커뮤니티", "빌더톤", "Builderthon",
    "Zero100", "Singapore", "Korean students", "AI", "NUS", "NTU", "SMU", "서울",
  ],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#070B1F",
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
      <body className="font-sans antialiased bg-[#070B1F] text-white">
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
