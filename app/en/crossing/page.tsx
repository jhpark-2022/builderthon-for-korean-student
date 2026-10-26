import type { Metadata } from "next";
export { default } from "../../crossing/page";

// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울(/crossing)의 영문 공유용 사본(2026-10-26, naru-first: 그 전에는 홈의 사본이었고 글은 그대로입니다).
// 홈의 영문 공유용 사본. 화면은 홈(app/page.tsx)과 같은 컴포넌트이고, 바뀌는 것은 공유 카드의 글과 그림뿐입니다.
//
// DECIDED 2026-10-14 (사용자: "한국어랑 영어로 바꾸면, 링크를 공유할 때 그 사람에게도 내가 설정한 언어로.
// so does the image and explanation"): 링크 미리보기를 만드는 크롤러는 JS를 돌리지 않아 localStorage의 언어를
// 볼 수 없습니다. 그래서 언어를 바꾸면 주소에 ?lang=en이 붙고(lib/LocaleContext.tsx), middleware.ts가
// ?lang=en 요청을 이 사본으로 다시 씁니다. 주소창의 주소는 그대로이고, 화면은 ?lang=en을 읽어 영어로 엽니다.
// /en 주소로 직접 오면 middleware가 /?lang=en으로 돌려보냅니다. 정규 주소는 한국어 경로 하나입니다.
//
// <title>은 한국어 그대로입니다. 탭 제목은 LocaleContext가 naru:title-en으로 바꿉니다(언어를 다시 바꿔도 맞게).
// 영문 글은 사이트에 이미 있는 영문(data/naru.ts)입니다. 새 문장을 쓰지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
const TITLE = "CROSSING SEOUL, 17–21 December 2026";
const DESCRIPTION =
  "Each team takes an issue a company is facing now, finds the problem underneath it, and presents to that company on the fifth day. Whichever country you study in, you end up on the same team.";

export const metadata: Metadata = {
  description: DESCRIPTION,
  alternates: { canonical: "/crossing" },
  other: { "naru:title-en": "CROSSING SEOUL 2026 | NARU" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/crossing?lang=en",
    siteName: "나루 NARU",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};
