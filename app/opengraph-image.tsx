import { renderHomeCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// 홈의 공유 카드. 그림과 그 결정의 이유는 lib/ogCards.tsx에 있습니다(DECIDED 2026-10-14).
export const alt = "크로싱 서울 CROSSING SEOUL, 2026년 12월 17~21일 서울. 나루 NARU.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderHomeCard("ko");
}
