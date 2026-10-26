import { renderNaruCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// 홈(나루)의 공유 카드. 2026-10-26 (naru-first): 그 전 /naru의 카드입니다. 그림과 그 결정의 이유는 lib/ogCards.tsx(DECIDED 2026-10-14).
export const alt = "나루 NARU. 한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderNaruCard("ko");
}
