import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass, ARROW_CLASS } from "@/components/ui/Button";
import { TITLE, BODY, META } from "@/components/ui/typography";

// ─────────────────────────────────────────────────────────────────────────────
// 없는 주소(404). DECIDED 2026-10-22 (UX 점검, 사용자: "모든 것을 반영"): 그 전에는 Next.js 기본 화면이었습니다. 영어만 있고, 헤더도
// 돌아갈 길도 없고, 탭 제목은 홈 제목이었습니다.
//
// 서버 컴포넌트라 로케일 훅을 쓸 수 없습니다. /quiz의 껍데기(app/quiz/QuizIntroShell.tsx)와 같은 방식으로 두 언어를 모두 보내고,
// app/layout.tsx의 부트스트랩이 <html data-locale>을 찍으면 globals.css의 [data-l] 규칙이 한쪽만 보입니다.
// 글자 크기는 TITLE/BODY/META 셋입니다(2026-10-07).
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 Page not found",
  robots: { index: false, follow: false },
};

function Both({ ko, en }: { ko: string; en: string }) {
  return (
    <>
      <span data-l="ko">{ko}</span>
      <span data-l="en">{en}</span>
    </>
  );
}

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="relative flex min-h-screen flex-col items-center justify-center bg-naru-ink px-6 text-center text-white focus:outline-none">
      <p className={`${META} font-bold uppercase tracking-[0.16em] text-white/70`}>404</p>
      <h1 className={`mt-4 break-keep ${TITLE} font-bold tracking-tight`}>
        <Both ko="이 주소에는 페이지가 없습니다." en="There is no page at this address." />
      </h1>
      <p className={`mt-4 max-w-md break-keep ${BODY} leading-relaxed text-white/70`}>
        <Both ko="주소가 바뀌었거나 잘못 적혔을 수 있습니다. 홈에서 다시 찾아 주세요." en="The link may have changed or been mistyped. Start again from the home page." />
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/" className={`group ${buttonClass("primary", "naru")}`}>
          <Both ko="홈으로" en="Home" />
          <span aria-hidden className={ARROW_CLASS}>→</span>
        </Link>
        <Link href="/naru" className={`group ${buttonClass("secondary", "naru")}`}>
          <Both ko="나루 알아보기" en="About NARU" />
        </Link>
      </div>
    </main>
  );
}
