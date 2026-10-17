import type { Metadata } from "next";
import TeamTool from "@/components/crossing/TeamTool";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/team: 크로싱 서울 멘토 시간표와 미션 인증(2026-10-17). 모든 팀이 같은 시간표를 봅니다.
// 현장 QR로 여는 주소입니다. 검색에는 내놓지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "크로싱 서울 멘토 시간표",
  other: { "naru:title-en": "CROSSING SEOUL mentor timetable | NARU" },
  robots: { index: false, follow: false },
};

export default function TeamPage() {
  return <TeamTool />;
}
