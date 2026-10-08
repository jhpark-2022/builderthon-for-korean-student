// 언론 인용의 타입. 줄을 그리던 PressRows 컴포넌트는 2026-09-19에 나루 홈에서
// 내려간 뒤 쓰는 곳이 없어 2026-10-08에 지웠습니다. data/naru.ts가 이 타입을 읽습니다.
import type { Phrase, PressItem } from "@/data/dictionary";

// 같은 글이 여러 매체에 실린 경우(보도자료). 제목과 날짜는 한 번, 링크는 매체마다.
export type PressGroup = {
  title: Phrase;
  date: Phrase;
  links: { outlet: Phrase; url: string }[];
};
export type PressEntry = PressItem | PressGroup;
