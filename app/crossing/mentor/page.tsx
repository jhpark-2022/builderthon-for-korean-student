import type { Metadata } from "next";
import MentorTool from "@/components/crossing/MentorTool";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/mentor?k=: 멘토 한 사람의 페이지(2026-10-26). 자기 칸에 들어온 팀과 그 팀이 올린 1장을 미리 봅니다.
// 운영진이 멘토에게 링크를 따로 보냅니다(scripts/mentor-links.mjs). 검색에는 내놓지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "크로싱 서울 멘토 페이지",
  other: { "naru:title-en": "CROSSING SEOUL mentor page | NARU" },
  robots: { index: false, follow: false },
};

export default function MentorPage() {
  return <MentorTool />;
}
