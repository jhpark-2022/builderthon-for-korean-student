import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import SkipLink from "@/components/SkipLink";
import { DECEMBER_EVENT_NAME } from "@/lib/naruDates";

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
// 여기 있던 제로백 빌더톤 문구는 app/2026-08/page.tsx로 내려갔습니다. 한 글자도
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
// 이름과 날짜의 정본은 lib/naruDates.ts입니다. 여기서 문자열로 조립하는 이유는
// metadata가 빌드 시점에 한 번 굳는 값이라 훅이나 로케일을 쓸 수 없기
// 때문입니다. 상수에서 읽으니 이름이 바뀌면 여기도 따라옵니다.
//
// 마지막 문장이 포지션입니다(DECIDED 2026-09-15). 검색 결과와 공유 카드에서
// 이 사이트가 무엇인지 말하는 유일한 줄이라, "12월 9일 서울"까지만 쓰면
// 한국에서 열리는 행사로만 읽힙니다.
//
// 2026-09-17: 기간이 확정되어(12/10~12/14) 기간으로 바꿨습니다.
const SITE_NAME = "나루 NARU";
// 2026-09-18 (감사 반영 브리프 9.5): 홈의 기본 제목에 이벤트 키워드. 검색 결과에서 "나루 NARU"만으로는
// 무엇을 하는 사이트인지 없었습니다. 다른 페이지는 template("%s | 나루 NARU")을 그대로 씁니다.
const HOME_TITLE = `${DECEMBER_EVENT_NAME?.ko ?? "크로싱 서울"} 2026 | ${SITE_NAME}`;
// 검색 결과용. 구글은 155자 남짓을 보여 주므로 이벤트 이름과 날짜, 무엇을 하는
// 자리인지, 나루가 무엇인지까지 한 벌에 넣습니다.
const SITE_DESCRIPTION =
  `${DECEMBER_EVENT_NAME?.ko ?? "크로싱 서울"} 2026년 12월 10~14일, 서울. 한국의 대학생과 해외의 한인 유학생이 데이터에서 문제를 찾아 앞에서 증명하는 닷새입니다. 나루는 싱가포르에서 시작한 한인 학생 빌더 커뮤니티입니다.`;

// ── 공유 카드의 제목과 설명 (DECIDED 2026-09-19, 사용자: "링크를 외부로 공유했을 때
// 나오는 상자의 설명이 마음에 안 든다") ─────────────────────────────────────────
// 검색 결과와 공유 카드는 길이 예산이 다릅니다. 텔레그램·카카오의 상자는 설명을
// 두 줄에서 자르고, 잘린 자리에 말줄임표가 붙습니다. 실제로 "싱가포르 한인 학생
// 빌더 커뮤니티. 안전하게 도전할 자리와 자기 가…"에서 끊겨서, 무엇을 하는
// 자리인지도 언제 열리는지도 카드에 남지 않았습니다.
//
// 그래서 카드용을 따로 둡니다. 제목이 이벤트와 날짜를 말하고(굵은 줄), 설명은
// 한 문장으로 누가 오는 자리인지만 말합니다. 둘이 같은 말을 반복하지 않는 것이
// 요점이에요. 날짜는 제목에만 있습니다.
//
// 길이를 늘리지 마세요. 한국어 60자를 넘으면 카드에서 잘립니다.
const OG_TITLE = `${DECEMBER_EVENT_NAME?.ko ?? "크로싱 서울"} · 2026년 12월 10~14일 서울`;
const OG_DESCRIPTION =
  "한국의 대학생과 해외의 한인 유학생이 국경과 상관없이 만나는 자리. 데이터에서 문제를 찾아 앞에서 증명하는 닷새입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // 한 URL에 두 언어(localStorage 로케일)라 언어별 URL이 없습니다. ?lang=en은 LocaleProvider가
  // 읽어 영어로 엽니다(2026-09-18). 로케일별 description은 정적 생성이라 한 벌뿐입니다. TODO: confirm.
  alternates: {
    canonical: "/",
    languages: { ko: "/", en: "/?lang=en" },
  },
  keywords: [
    "나루", "NARU", "싱가포르 한인 학생", "빌더 커뮤니티", "빌더톤", "Builderthon",
    "Zero100", "Singapore", "Korean students", "AI", "NUS", "NTU", "SMU", "서울",
    "크로싱 서울", "CROSSING SEOUL", "한인 유학생",
  ],
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
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
// ?lang=en|ko가 있으면 그것이 이깁니다(alternates.languages의 en URL, 2026-09-18). LocaleProvider도 같은 규칙.
const LOCALE_BOOTSTRAP = `(function(){try{var q=new URLSearchParams(location.search).get("lang");var l=(q==="ko"||q==="en")?q:localStorage.getItem("builderthon.locale");if(l!=="ko"&&l!=="en")l="ko";var d=document.documentElement;d.lang=l;d.setAttribute("data-locale",l);}catch(e){}})()`;

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
