import type { Metadata } from "next";
export { default } from "../../2026-08/page";

// /2026-08의 영문 공유용 사본. 이유는 app/en/page.tsx 맨 위(DECIDED 2026-10-14).
// 숫자는 brand 8장의 것만, 문장은 data/naru.ts의 영문("In August 74 people applied, and 21 teams presented ...")에서.
const TITLE = "Zero100 AI Builderthon, the record, August 2026 Singapore";
const DESCRIPTION =
  "In August 74 people applied, 25 teams started, and 21 teams presented to the company that set their problem on the last day. Eight days with 14 industry mentors, and the event NARU started from.";

export const metadata: Metadata = {
  title: "제로백 빌더톤 기록, 2026년 8월 싱가포르",
  description: DESCRIPTION,
  alternates: { canonical: "/2026-08" },
  other: { "naru:title-en": "Zero100 AI Builderthon, the record, August 2026 | NARU" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/2026-08?lang=en",
    siteName: "나루 NARU",
    type: "article",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};
