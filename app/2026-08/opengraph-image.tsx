import { renderRecordCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// /2026-08의 공유 카드. 그림과 그 결정의 이유는 lib/ogCards.tsx에 있습니다(DECIDED 2026-10-14).
export const alt = "제로백 빌더톤 Zero100 AI Builderthon 기록. 2026년 8월 22~29일 싱가포르. 74명 신청, 25팀 시작, 21팀 발표, 현업 멘토 14명.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderRecordCard("ko");
}
