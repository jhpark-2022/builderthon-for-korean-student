import type { Metadata } from "next";
import { Suspense } from "react";
import Quiz from "@/components/Quiz";

// ─────────────────────────────────────────────────────────────────────────────
// /match: 크로싱 서울 Day 1 현장 팀 매칭 (DECIDED 2026-10-08, 현장 팀 매칭 브리프 3).
//
// 이름과 나라를 넣고 AI 유형 테스트(12월판)를 하면 결과가 crossing_match_profiles에 올라가고, 운영진이 그 표로
// 팀을 짭니다. 신청의 일부가 아닙니다. 8월의 /quiz와 같은 컴포넌트이고 판과 매칭 모드만 다릅니다.
// 현장 QR로 여는 주소라 짧고 바뀌지 않게 둡니다. 검색에는 내놓지 않습니다(현장 도구).
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // 2026-10-08: layout의 title.template("%s | 나루 NARU")이 뒤를 붙입니다. 여기에 "| 나루"를 또 적어
  // "크로싱 서울 팀 매칭 | 나루 | 나루 NARU"로 겹쳐 나왔습니다.
  title: "크로싱 서울 팀 매칭",
  other: { "naru:title-en": "CROSSING SEOUL team matching | NARU" },
  description:
    "14문항, 약 3분. 결과로 Day 1 팀 매칭을 합니다. / 14 questions, about 3 minutes. Your result is used for team matching on Day 1.",
  robots: { index: false, follow: false },
};

export default function MatchPage() {
  return (
    <Suspense fallback={<main id="main" className="min-h-screen bg-[#070B1F]" />}>
      <Quiz edition="2026-12" matchMode />
    </Suspense>
  );
}
