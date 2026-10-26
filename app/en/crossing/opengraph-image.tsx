import { renderHomeCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// 크로싱 서울(/crossing, 영문)의 공유 카드. 2026-10-26 (naru-first): 그 전 홈의 카드입니다. 그림과 그 결정의 이유는 lib/ogCards.tsx(DECIDED 2026-10-14).
export const alt = "CROSSING SEOUL, 17–21 December 2026, Seoul. Run by NARU.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderHomeCard("en");
}
