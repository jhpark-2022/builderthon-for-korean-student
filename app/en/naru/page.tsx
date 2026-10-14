import type { Metadata } from "next";
export { default } from "../../naru/page";

// /naru의 영문 공유용 사본. 이유는 app/en/page.tsx 맨 위(DECIDED 2026-10-14).
// 설명은 data/naru.ts의 영문(운영 주체 줄)과 brand 6장 관계 한 문장의 영문입니다.
const DESCRIPTION =
  "A Korea-rooted, student-run, not-for-profit group. It started in Singapore in August 2026, and CROSSING SEOUL is the first event it runs itself.";

export const metadata: Metadata = {
  title: { absolute: "나루 NARU" },
  description: DESCRIPTION,
  alternates: { canonical: "/naru" },
  other: { "naru:title-en": "NARU" },
  openGraph: {
    title: "NARU",
    description: DESCRIPTION,
    url: "/naru?lang=en",
    siteName: "나루 NARU",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: "NARU", description: DESCRIPTION },
};
