import { renderHomeCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// 크로싱 서울(/crossing)의 공유 카드. 2026-10-26 (naru-first): 그 전 홈의 카드입니다. 그림과 그 결정의 이유는 lib/ogCards.tsx(DECIDED 2026-10-14).
export const alt = "크로싱 서울 CROSSING SEOUL, 2026년 12월 17~21일 서울. 나루 NARU.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderHomeCard("ko");
}
