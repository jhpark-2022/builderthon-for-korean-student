import type { Metadata } from "next";
import TeamTool from "@/components/crossing/TeamTool";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/team: 크로싱 서울 현장 도구(2026-10-17). 팀 코드로 들어와 멘토를 예약하고 미션 인증 파일을 올립니다.
// 현장 QR로 여는 주소입니다(?code=ABC234 로 코드를 미리 채울 수 있음). 검색에는 내놓지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "크로싱 서울 팀 페이지",
  other: { "naru:title-en": "CROSSING SEOUL team page | NARU" },
  robots: { index: false, follow: false },
};

export default function TeamPage() {
  return <TeamTool />;
}
