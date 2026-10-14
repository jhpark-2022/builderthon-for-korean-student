import { renderNaruCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// /naru(영문)의 공유 카드. 그림과 그 결정의 이유는 lib/ogCards.tsx에 있습니다(DECIDED 2026-10-14).
export const alt = "NARU, a Korea-rooted collective of student builders.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderNaruCard("en");
}
