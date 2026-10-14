import { renderRecordCard } from "@/lib/ogCards";
import { OG_SIZE } from "@/lib/ogCard";

// /2026-08(영문)의 공유 카드. 그림과 그 결정의 이유는 lib/ogCards.tsx에 있습니다(DECIDED 2026-10-14).
export const alt = "Zero100 AI Builderthon, the record. Singapore, 22–29 August 2026. 74 applied, 25 teams started, 21 teams presented, 14 industry mentors.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderRecordCard("en");
}
