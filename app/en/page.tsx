import type { Metadata } from "next";
export { default } from "../page";

// 홈(/, 나루)의 영문 공유용 사본(2026-10-26, naru-first: 그 전에는 /naru의 사본이었고 글은 그대로입니다).
// /naru의 영문 공유용 사본. 이유는 app/en/page.tsx 맨 위(DECIDED 2026-10-14).
// 설명은 data/naru.ts의 영문(운영 주체 줄)과 brand 6장 관계 한 문장의 영문입니다.
const DESCRIPTION =
  "A Korea-rooted, student-run, not-for-profit group. It started in Singapore in August 2026, and CROSSING SEOUL is the first event it runs itself.";

export const metadata: Metadata = {
  title: { absolute: "나루 NARU" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  other: { "naru:title-en": "NARU" },
  openGraph: {
    title: "NARU",
    description: DESCRIPTION,
    // og:url을 적지 않습니다. 경로가 "/"이면 Next가 쿼리를 떨어뜨려 og:url이 한국어 홈이 되고(next/dist/lib/metadata/resolvers/
    // resolve-url.js의 pathname === "/" 분기), 페이스북은 og:url을 다시 긁어 한국어 카드를 냅니다. 없으면 크롤러는 받은 주소(/?lang=en)를 씁니다.
    siteName: "나루 NARU",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: "NARU", description: DESCRIPTION },
};
