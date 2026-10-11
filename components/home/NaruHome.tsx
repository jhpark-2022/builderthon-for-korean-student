"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy } from "@/data/naru";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import { links, type Phrase } from "@/data/dictionaryCore";
import { useEffect, useState } from "react";
import {
  DECEMBER_EVENT_NAME,
  DECEMBER_STARTS_AT_MS,
  decemberEventLabel,
  formatDecemberDateLine,
  formatDecemberDayWithWeekday,
} from "@/lib/naruDates";
import Halo from "@/components/ui/Halo";
import { ChipDot } from "@/components/ui/Chip";
import { ARROW_CLASS } from "@/components/ui/Button";
import ChatGlyph from "@/components/ChatGlyph";
import RouteMap from "@/components/shared/RouteMap";
import MobileChatBar from "@/components/shared/MobileChatBar";
import Chapter from "@/components/journey/Chapter";
import Reveal from "@/components/shared/Reveal";
// RecordTabs: 2026-09-17에 뺐다가(사용자: 바로 아카이브로) 2026-09-18 감사 반영 브리프 5.2로
// 다시 넣었습니다. 멘토 / 연사와 피드백 패널 둘만.
// (2026-09-19: RecordTabs·PressRows·Funnel은 화면에서 내려가 import도 뺐습니다. 파일은 그대로.)
import { TITLE, SUBTITLE, BODY, META, H2, ROW_HEADING, GRADIENT_TEXT, CHIP_TAG, BTN_PRIMARY, BTN_SECONDARY, BTN_TEXT, CARD } from "@/components/ui/typography";
import { READ, WIDE, PROSE, latinTrack, PlateSegment, PreparingButton, SiteFooter, usePlateLite } from "./shared";

// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈 (/).
//
// DECIDED 2026-09-17 (2차): 이벤트와 그룹을 나눕니다.
//
// 사용자의 지시: "이벤트와 그룹 설명은 분리. 맨 아래에 그룹 로고와 존재 목적,
// 그 위에는 8월 이벤트 recap과 12월 이벤트 설명. 12월은 8월 사이트와 같은
// 격식으로(빌더톤_2회차_기획.pdf)."
//
//   #top       크로싱 서울 히어로 (이름, 기간, 도시, 포지션, 오픈채팅)
//   #record    8월의 기록 (숫자 다섯, 사진 열둘)
//   #december  프로그램 (모양, 왜 서울인가, 아쉬웠던 넷과 답, 일정, 멘토링, 미정)
//   #naru      나루 (로고, 태그라인, 변하지 않는 두 개, 어떻게 일하는가)   ← 그룹은 여기서 시작
//   #join      왜 이 자리가 필요한가 (세 곳의 결핍, 안전장치 둘, 들어오는 길 #join-ways)
//   #people    (조건부)
//
// 아래 2026-09-15 주석의 "홈은 이벤트가 아니라 그룹"은 이제 반만 맞습니다.
// 홈은 이벤트로 열고 그룹으로 닫습니다. 그래도 그 주석을 지우지 않은 이유는
// 1~4번(등록 없음, 2회차 아님, 다리 은유 없음)이 여전히 유효하기 때문입니다.
// 3번(12월 상세 없음)만 뒤집혔습니다: 기획이 나와서 초안 표시를 달고 싣습니다.
//
// DECIDED 2026-09-15: 홈은 이벤트가 아니라 그룹입니다.
//
// 8월까지 이 자리에는 제로백 빌더톤이 있었습니다. 그건 나루가 학생회와
// 기업을 잇는 "지금의 방식"이고, 방식은 바뀝니다(매니페스토 IV). 홈이 회차
// 하나이면, 그 회차가 끝나는 날 홈도 같이 끝납니다. 8월 페이지는 /2026-08로
// 내려가 기록으로 남았고, 이 자리는 나루가 무엇이고 왜 존재하는지를 말합니다.
//
// ── 이 페이지에 없는 것 셋, 그리고 그 이유 ─────────────────────────────────
//
// 1. 등록이 없습니다.
//    12월 이벤트의 등록은 아직 열리지 않았고, 나루는 가입 폼 자체를 두지
//    않습니다(Overview 06). 들어오는 길은 회차 하나예요. 그래서 이 파일은
//    RegisterProvider를 쓰지 않고, 홈의 CTA는 셋뿐입니다: 회차 알아보기,
//    소식 받기(오픈채팅), 문의(메일). 8월 페이지가 마감 뒤에 배운 것을 그대로
//    따릅니다. 누를 수 없는 버튼을 회색으로 남기지 않습니다.
//
// 2. 12월을 "제로백 빌더톤 2회차"라고 부르지 않습니다.
//    제로백 빌더톤은 2026년 8월 싱가포르에서 한 이벤트의 이름입니다. 12월은
//    그 이벤트에서 나온 코어 2개를 잇는 다른 이벤트이고, 이름이 아직 없어요.
//    속편으로 부르면 12월에 오는 사람은 8월을 모르면 늦었다고 느끼고, 기업은
//    같은 문제를 또 여는 자리로 읽습니다. 둘 다 사실이 아닙니다.
//    #december 챕터의 첫 문장이 그 오해를 먼저 끊는 이유입니다. 이름은
//    lib/naruDates.ts의 DECEMBER_EVENT_NAME에서만 옵니다.
//
// 3. 12월 상세가 없습니다.
//    장소, 일정표, 출제사, 멘토, 등록 마감은 11월까지 확정됩니다. 지금 여기에
//    쓰면 전부 다시 고쳐야 하고, 참가자는 고치기 전의 문장을 보고 항공권을
//    끊습니다. 홈은 확정된 사실만 싣고, 상세는 확정된 뒤 /seoul로 붙입니다.
//    이 페이지의 12월 챕터가 말하는 것은 날짜 하나, 달라지는 것 둘, 그리고
//    이벤트가 끝난 뒤에 할 일 셋입니다.
//
// 4. 다리(bridge) 은유가 없습니다.
//    8월 사이트의 "우리가 있었으면 했던 다리를 직접 만듭니다"는 아카이브에
//    그대로 있습니다. 여기서는 나루터만 씁니다. 다리는 건너는 일을 대신해
//    주지만, 나루는 그러지 않아요. 건너는 건 각자가 합니다.
//
// ── DECIDED 2026-09-16: 코어만 남깁니다 ─────────────────────────────────────
// 글이 너무 많았습니다. 이 페이지를 처음 여는 사람이 나루가 무엇인지 알기까지
// 문단 서른 개를 읽어야 했고, 그건 열린 페이지가 아니라 잘 쓴 문서입니다.
//
// 규칙 하나로 걷었습니다: 챕터마다 그 챕터가 아니면 말할 수 없는 것 하나만
// 남기고 나머지는 근거가 있는 곳으로 보냅니다.
//
//  · #record 8월을 설명하지 않습니다. 숫자 다섯과 사진 열둘, 그리고 /2026-08로
//    가는 버튼 하나. 형식·멘토·연사 탭(RecordTabs)과 아쉬웠던 네 가지는
//    내려갔습니다. 전자는 8월 페이지에 정본이 있고, 후자는 12월의 근거라
//    그쪽에서 "모양"으로 다시 나타납니다.
//  · #why 코어 카드가 두 줄에서 한 줄로. 두 번째 줄은 첫 줄의 부연이었습니다.
//  · #how "이름의 두 겹" 두 문단이 내려갔습니다. 로고 가이드에 있습니다.
//  · #december 문단 여덟 개 → 숫자 여섯 + 스테이지 다섯(data/naru.ts의 shape,
//    stages). 12월 기획 초안의 엑기스입니다.
//  · #join 카드마다 두 줄에서 한 줄로.
//
// 키는 하나도 지우지 않았습니다. 화면에서만 내려온 것이라, 되살릴 때
// data/naru.ts에서 그대로 꺼내 쓰면 됩니다.
//
// ── 재사용 ───────────────────────────────────────────────────────────────────
// Chapter, Eyebrow, OpenChatLink, BackgroundMount, JourneyNav를 8월 페이지와
// 함께 씁니다. 두 페이지가 한 사이트로 읽혀야 하고, 같은 일을 하는 컴포넌트가
// 둘이 되면 한쪽만 고쳐지기 시작합니다.
// ─────────────────────────────────────────────────────────────────────────────

// 챕터 <h2>의 크기. 8월 페이지가 아홉 개의 h2에 쓰는 값과 같습니다
// (Journey.tsx의 CHAPTER HEADING SIZE 주석). 두 페이지의 제목이 같은 크기로
// 읽혀야 한 사이트입니다.
// 제목 스케일은 components/ui/typography.ts가 갖습니다. RecordTabs가 같은 값을
// 읽어야 하는데 이 파일이 그쪽을 import 하고 있어서, 여기 두면 순환이 됩니다.

// ─────────────────────────────────────────────────────────────────────────────
// 세로 리듬. 이 페이지의 모든 간격은 여기 있는 값 중 하나여야 합니다.
//
// DECIDED 2026-09-16. 그 전에는 블록 간격에 mt-4·5·6·7·10·12·14·16·24·32 열
// 가지가 쓰이고 있었습니다. 하는 일은 셋뿐인데요. 챕터 이음매도 162px과 171px이
// 나란히 있었는데, 9px 차이는 아무도 알아보지 못하면서 "여기는 다르다"고
// 주장만 합니다. 뜻이 없는 차이는 리듬을 만들지 않고 리듬을 지웁니다.
//
// root가 18px이라 Tailwind 한 칸은 4.5px입니다.
//
// ── 챕터 이음매 (Chapter의 기본 py-24 = 108px 위에 얹습니다) ────────────────
//   (오버라이드 없음)              216px  기본. 다음 이야기로 넘어갑니다.
//   pt-20 sm:pt-28 lg:pt-36      270px  장이 바뀝니다. #naru 하나뿐(이벤트 → 그룹).
//   pt-24 sm:pt-32 lg:pt-44      306px  (2026-09-17 2차: 비어 있습니다. #why가
//                                       #naru 안으로 들어가면서 결론 이음매가
//                                       270px 자리와 합쳐졌습니다. 필요하면 씁니다.)
//
// 세 단계 말고 네 번째를 만들지 마세요. 이음매의 크기가 뜻을 나르려면 서로
// 명백히 달라야 하고, 세 개가 그 조건을 만족하는 최대입니다.
//
// ── 챕터 안 (Chapter의 직계 자식) ──────────────────────────────────────────
//   mt-4    18px  바로 위 블록에 딸린 주석 한 줄. 붙어 있어야 뜻이 통합니다.
//   mt-6    27px  제목 → 리드 문장. 그리고 앞 블록에 붙는 띠.
//   mt-12   54px  블록 → 블록. 기본값입니다. 의심스러우면 이것.
//   mt-24 sm:mt-32  108/144px  부속으로 강등. #why의 exec 하나뿐.
//
// 카드나 다이어그램 **안쪽**의 간격은 이 스케일을 따르지 않아도 됩니다. 저긴
// 한 덩어리의 내부 조판이고, 여기 있는 값은 덩어리와 덩어리 사이의 것입니다.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 2026-10-11 (리뷰 브리프 2단계): 이 자리에 있던 CountdownPanel(두 시간대의 숫자 판), HeroPhotos(사진 넷과 크게 보기),
// MilestoneStrip(누르면 열리는 마일스톤 띠)은 걷었습니다. 그때의 코드와 주석은 git 이력(6f8ccec 이전)에 있습니다.
// 쓰지 않는 코드를 남기면 다음 사람이 "왜 안 걸려 있지"부터 묻습니다. 데이터 키(countdownUnits, photos 등)는 그대로입니다.
// ─────────────────────────────────────────────────────────────────────────────

// DECIDED 2026-10-11 (리뷰 브리프 2.2, B2, 결정 D-a): 카운트다운은 META 한 줄입니다("12.17 목까지 66일").
// 숫자 여섯이 TITLE 크기로 페이지에서 가장 무거운 줄이었고, 싱가포르 열은 같은 날수에 시간만 하나 달랐습니다.
// 날짜와 남은 날은 naruDates에서 셉니다. 옆의 주황 점은 주황 허용 목록의 "카운트다운 옆 점" 그대로입니다.
function CountdownLine({ t, locale, className = "" }: { t: (p: Phrase) => string; locale: "ko" | "en"; className?: string }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setDays(Math.floor((DECEMBER_STARTS_AT_MS - Date.now()) / 86400000));
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className={`flex items-center gap-2 ${META} font-semibold text-white/85 ${className}`}>
      <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full bg-naru-orange" />
      {/* 마운트 전에는 자리만 잡습니다(서버와 클라이언트의 시각이 달라 숫자를 미리 그리지 않습니다). */}
      {days === null
        ? " "
        : days < 0
          ? t(naru.eventHero.started)
          : t(naru.eventHero.countdownLine).replace("{date}", formatDecemberDayWithWeekday(locale, 0)).replace("{n}", String(days))}
    </p>
  );
}

// DECIDED 2026-10-11 (리뷰 브리프 2.2, 2.6, C6): 주 CTA. 이름이 어디로 가는지 말하고("오픈채팅에서 알림 받기"), 새 창임을
// 보조 기술에 알립니다. 히어로와 등록 블록 두 자리에 같은 모양으로 섭니다. links.openChat이 비면 그리지 않습니다.
function ChatCta({ t, src }: { t: (p: Phrase) => string; src: string }) {
  if (!links.openChat) return null;
  return (
    <a href={links.openChat} target="_blank" rel="noopener noreferrer" onClick={() => track("openchat_click", { src })} className={BTN_PRIMARY}>
      <ChatGlyph className="h-4 w-4 shrink-0" />
      {t(openChatLabels.december)}
      <span className="sr-only">{t({ ko: "(새 창)", en: "(new window)" })}</span>
      <span aria-hidden className={ARROW_CLASS}>→</span>
    </a>
  );
}

// DECIDED 2026-10-11 (리뷰 브리프 2.3): 마일스톤은 누르는 띠가 아니라 펼쳐 둔 정적 행입니다(폰과 데스크톱 모두).
// 2026-10-11 오전의 "누르면 설명이 열린다"는 이 결정이 대신합니다. amber 띠의 색은 그대로입니다.
function MilestoneRow({ label, title, detail }: { label: string; title: string; detail?: string }) {
  return (
    <div className="mt-auto w-full rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5">
      <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 break-keep max-sm:justify-center">
        <span className={`inline-flex shrink-0 items-center gap-1 ${META} font-bold text-amber-100`}>
          <span aria-hidden>★</span>{label}
        </span>
        <span className={`${BODY} font-bold leading-snug text-white`}>{title}</span>
      </p>
      {detail && <p className={`mt-1.5 break-keep ${BODY} leading-relaxed text-white/85`}>{detail}</p>}
    </div>
  );
}


export default function NaruHome() {
  const { t, locale } = useLocale();
  // 크로싱 서울 등록 상태(2026-09-18). 프로바이더가 없거나 창이 닫혀 있으면 "not_open"이고
  // 화면은 그 전과 같습니다. open이면 CTA 셋이 "등록하기"로, closed면 "등록이 마감됐습니다".
  const reg = useCrossingRegisterOptional();
  const regState = reg?.state ?? "not_open";
  // ── 히어로는 정지 레이아웃입니다 (DECIDED 2026-09-20, 사용자: "undo the
  //    animation that i tried to put at the top") ───────────────────────────
  //
  // 스크롤에 물린 히어로 효과를 두 번 시도했고 두 번 다 걷었습니다.
  //
  //   2026-09-19  8월의 useHeroSplit(두 단이 좌우로 ±500px 벌어지며 사라짐)을
  //               그대로 가져왔습니다. 사용자: "8월 페이지와 같은 효과, 마음에 안 듦."
  //   2026-09-20  다른 축으로 다시 만들었습니다(useHeroRecede, 제목 묶음이 위로
  //               물러나고 사진 단이 느리게 따라오는 깊이). 사용자가 셋 중에 고른
  //               안이었고, 구간을 제목이 보이는 동안으로 옮겨 계측까지 통과했는데,
  //               실제 화면에서 원하는 것이 아니었습니다.
  //
  // 두 번의 결론이 같습니다. 이 히어로에는 스크롤 효과를 걸지 마세요. 세 번째
  // 안을 만들기 전에 사용자에게 먼저 물어보세요. 그동안의 값과 계측은
  // CHANGELOG.md 2026-09-20 항목과
  // docs/hero-recede-fix-brief.md에 남아 있습니다. 되살릴 일이 생기면 거기서
  // 꺼내 쓰면 되고, 코드는 지웁니다. 쓰지 않는 코드가 남아 있으면 다음 사람이
  // "왜 안 걸려 있지"부터 묻게 됩니다.
  //
  // 챕터 리빌(Chapter/Reveal의 data-chapter-reveal)은 이것과 별개이고 그대로
  // 돌아갑니다. 그건 히어로 아래 블록들이 올라오며 나타나는 효과입니다.
  // 노선도의 현재 위치 점(감사 반영 브리프 3.6). 호버한 일정 행으로 점이 옮겨 갑니다.
  // 2026-09-20 (표현 방식 브리프 4): openDay(폰 Day 카드 아코디언)는 카드와 함께
  // 사라졌습니다. 행은 처음부터 전부 펼쳐져 있어 접었다 펼 것이 없습니다.
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  usePlateLite();
  // DECIDED 2026-10-11 (사용자: "button으로 말고, 여기(노선도)를 클릭하면 나오는 구조가 더 자연스러운듯"): 폰의 접힘 단추를 뺐습니다.
  // 폰에서 노선도의 정거장을 누르면 그날의 카드가 노선도 바로 아래에 열립니다(다시 누르면 닫힘).
  // DECIDED 2026-10-11 (사용자, 같은 날 뒤: "여기 클릭하게 하는 건 빼주면 될 것 같고"): sm부터는 정거장이 눌리지 않습니다.
  // 일정 카드가 다 보이는 화면에서 누르면 표시만 남고 하는 일이 없었습니다. 폰은 그대로입니다(카드 다섯을 한 번에 펴면 길어서).
  // 멘토링 필 둘은 뺐고(아래 상자가 같은 말을 합니다), 멘토링 상자는 폰에서도 처음부터 보입니다.
  // DECIDED 2026-10-11 (리뷰 A3): 폰의 첫 진입에는 DAY 1(인덱스 1)이 열려 있습니다. 날짜를 눌러 카드가 열릴 때 카드 하단이
  // 화면 하단에서 63px 위보다 아래에 있으면 그만큼만 스크롤합니다(전에는 점 행이 화면 아래쪽에 있으면 카드가 화면 밖에 열려
  // 아무 일도 일어나지 않은 것처럼 보였습니다). 처음부터 열려 있는 DAY 1에는 스크롤하지 않습니다. 누른 때만입니다.
  // phone: 정거장이 눌리는 폭(sm 아래)인가. sm부터는 정거장이 버튼이 아니고(전에는 눌리지 않는 버튼이었습니다),
  // 노선도의 현재 위치 점도 전처럼 Day 0에서 시작합니다.
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639.98px)");
    const read = () => setPhone(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  // 리뷰 브리프 2.5: "다른 점"에 남는 두 행. 리뷰 브리프 2.2: 지난 회차의 사진 한 장(Day 1의 홀).
  const differFacts = naru.december.facts.filter((f) => f.k.en === "Milestones" || f.k.en === "Our hypothesis");
  const pastPhoto = naru.eventHero.photos[1];
  const routePanelId = (i: number) => `route-day-${naru.december.stages[i].dayOffset}`;
  const selectDay = (i: number) => {
    const opening = openDay !== i;
    setOpenDay(opening ? i : null);
    if (!opening) return;
    requestAnimationFrame(() => {
      const panel = document.getElementById(routePanelId(i));
      if (!panel) return;
      const over = panel.getBoundingClientRect().bottom - (window.innerHeight - 63);
      if (over > 0) window.scrollBy({ top: over, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  };
  // DECIDED 2026-10-11 (리뷰 브리프 2.1, 2.4, 2.7): 멘토링 상자 둘. 이름은 SUBTITLE, 글은 sm부터 왼쪽 끝입니다(폰은 가운데).
  // General Mentoring의 에메랄드는 팔레트 밖의 한 번짜리 색이라 "남는 것" 판과 같은 보라(accent)로 바꿨습니다.
  // 현장 멘토링은 무채색 카드에 주황 점 그대로입니다(주황은 점으로만).
  const mentoringBoxes = (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/[0.08] p-6">
        <div className="shrink-0">
          <p className={`flex items-center gap-2 max-sm:justify-center ${SUBTITLE} text-white`}>
            <ChipDot className="bg-accent" />
            <span lang="en">General Mentoring</span>
          </p>
          <p className={`mt-1 ${META} font-semibold text-accent`}>{t(naru.december.mentoringAlways)}</p>
          <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.mentoringLead)}</p>
        </div>
        <ul role="list" className="grid flex-1 grid-cols-1 gap-y-2">
          {naru.december.mentoringRules.map((rule, i) => (
            <li key={i} className={`break-keep ${BODY} leading-snug text-white/85`}>{t(rule)}</li>
          ))}
        </ul>
      </div>
      <div className={CARD}>
        <p className={`flex items-center gap-2 max-sm:justify-center ${SUBTITLE} text-white`}>
          <ChipDot className="bg-naru-orange" />
          {t(naru.december.fieldMentoring.name)}
        </p>
        <p className={`mt-1 ${META} font-semibold text-white/70`}>{t(naru.december.fieldMentoring.when)}</p>
        <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.fieldMentoring.body)}</p>
      </div>
    </>
  );
  // 날짜 카드. 데스크톱의 다섯 장(Day 0 한 장과 2x2, 2026-10-11 오전)과 폰의 노선도 패널이 같은 카드를 씁니다.
  // DECIDED 2026-10-11 (리뷰 브리프 2.3): 세션은 "세션 / 이름 / 설명" 세 줄로 나누고, 마일스톤은 펼친 정적 행입니다.
  // 카드 안의 글은 sm부터 왼쪽 끝입니다(2.7). inPanel은 폰의 노선도 패널 안에 서는 카드이고, 그때 제목은 패널의 첫 줄입니다.
  // 제목은 두 자리 모두 h4입니다. "일정" 소제목(h3)이 노선도 위로 올라가서 패널도 h3 아래에 섭니다(1단계에서는 h3이었습니다).
  const stageCard = (stage: (typeof naru.december.stages)[number], i: number, inPanel = false) => (
    <div
      key={stage.name.en}
      // 노선도의 현재 위치 점이 이 카드로 옵니다(감사 반영 브리프 3.6).
      onMouseEnter={() => setHoverDay(i)}
      onMouseLeave={() => setHoverDay(null)}
      className={`${CARD} flex flex-col gap-2.5 text-center sm:text-left ${!inPanel && i === 0 ? "md:col-span-2" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 max-sm:justify-center">
        <span lang="en" className={`${CHIP_TAG} tracking-[0.08em] text-accent`}>
          {`${t(naru.december.dayLabel)} ${stage.dayOffset}`}
        </span>
        <h4 className={ROW_HEADING}>{t(stage.title)}</h4>
        <span className={`${META} text-white/70`}>{formatDecemberDayWithWeekday(locale, stage.dayOffset)}</span>
      </div>
      {/* stage.body는 그리지 않습니다(2026-09-20). 키는 data/naru.ts에 그대로 있습니다. */}
      <p className={`break-keep ${BODY} leading-relaxed text-white/85`}>{t(stage.line)}</p>
      {stage.session && (
        <div>
          <p className={`${META} font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.december.sessionLabel)}</p>
          <p lang="en" className={`${BODY} font-bold text-white`}>{t(stage.session.title)}</p>
          <p className={`break-keep ${BODY} leading-relaxed text-white/70`}>{t(stage.session.body)}</p>
        </div>
      )}
      {stage.chips.length > 0 && (
        <p className={`flex flex-wrap gap-x-3 gap-y-1 max-sm:justify-center ${META} text-white/70`}>
          {stage.chips.map((c, j) => <span key={j}>{t(c)}</span>)}
        </p>
      )}
      {/* DECIDED 2026-10-11 (리뷰 브리프 2.2): AI 유형 테스트는 히어로에서 Day 1 카드로 돌아왔습니다. 팀을 맺는 날의 도구입니다.
          그 아래의 한 줄(matchNote)은 결과가 Day 1 전에는 저장되지 않는다는 사실입니다. */}
      {stage.matchCta && (
        <div>
          <Link href={stage.matchCta.href} onClick={() => track("naru_cta", { src: "day1", to: "match" })} className={`${BTN_TEXT} text-accent`}>
            {t(stage.matchCta.label)}
            <span aria-hidden>→</span>
          </Link>
          <p className={`break-keep ${META} leading-snug text-white/70`}>{t(naru.eventHero.matchNote)}</p>
        </div>
      )}
      {stage.milestone && (
        <MilestoneRow label={t(naru.december.milestoneLabel)} title={t(stage.milestone)} detail={stage.milestoneDetail && t(stage.milestoneDetail)} />
      )}
    </div>
  );

  // DECIDED 2026-10-10 (구조 브리프 3.2): 옛 주소. 홈에 있던 #join, #how, #why, #record, #join-ways는 /naru로 갔습니다.
  // 해시는 서버에 오지 않아 redirects로 잡을 수 없으므로, 마운트 때 한 번 보고 /naru의 같은 자리로 바꿉니다.
  // /naru에서 id가 바뀐 둘은 여기서 맞춥니다: 전의 #why(변하지 않는 두 개)는 #core, 전의 #join(왜 이 자리가 필요한가)은 #why.
  // 그 밖의 해시(#december, #gains, #naru 등)는 손대지 않습니다. #naru는 홈 끝의 티저에 내려앉습니다.
  useEffect(() => {
    const moved: Record<string, string> = { "#join": "why", "#how": "how", "#why": "core", "#record": "record", "#join-ways": "join-ways" };
    const to = moved[window.location.hash];
    if (to) window.location.replace(`/naru#${to}`);
  }, []);

  return (
    <>
    {/* tabIndex=-1: skip link가 여기로 보낼 때 브라우저가 실제로 포커스를
        옮기도록 합니다. Tab 순서에는 들어가지 않습니다. */}
    {/* naru-min12: 홈의 글자 하한(app/globals.css). 2026-09-20에 폰 전용에서 모든 폭으로. */}
    <main id="main" tabIndex={-1} className="naru-min12 focus:outline-none">
      {/* ── CH0 · 크로싱 서울 히어로 (DECIDED 2026-09-17 2차) ──────────────
          홈의 첫 화면이 그룹에서 이벤트로 바뀌었습니다. 8월 사이트의 히어로가
          8월 이벤트였듯이, 여기는 크로싱 서울입니다. 나루 로고는 헤더에만 있고
          큰 로고는 맨 아래 #naru로 내려갔습니다(로고 가이드: 배경 위에 얹지
          않는다는 규칙은 그대로, WebGL 필드 위에는 글자만 있습니다).

          이름, 기간, 도시는 전부 lib/naruDates.ts에서 옵니다. 이 파일에 날짜를
          쓰지 마세요.

          주황 원장(2026-09-18, 감사 반영 브리프 0·8, 사용자 결정): 주황은 점으로만.
            로고의 나루 점(헤더·푸터·#naru 인장), 배경 등불, 노선도의 현재 위치 점,
            카운트다운 옆 점, #naru 코어 제목 앞 점. 이 다섯뿐입니다.
            면·줄·글자색·그라데이션 끝의 주황은 전부 뺐습니다(제목 2행은 보라 → 자주).
          늘리지 마세요. */}
      {/* DECIDED 2026-09-17 (8월 문법 브리프): 두 단입니다. 8월 히어로의 그리드와
          같은 클래스이고 패럴랙스도 같은 훅(useHeroSplit)입니다. 왼쪽이 아이브로,
          두 줄 제목(1행 흰색, 2행 그라데이션), 굵은 기간 줄, 포지션, 서술, CTA 둘.
          오른쪽(lg부터)이 카운트다운 패널. 파트너 로고 띠는 12월 출제사·후원사가
          확정될 때까지 두지 않습니다(components/shared/HeroPartnerStrip.tsx의 TODO).

          2026-09-18: 그라데이션 끝·12월 아이브로 글자색·기간 줄 틴트의 주황도 뺐습니다.
          위의 주황 원장이 정본입니다. */}
      {/* labelledBy (2026-09-19, 접근성 감사 5): 이름 없는 <section>은 region
          랜드마크로 노출되지 않습니다. 그래서 폰 로터의 랜드마크 목록에 main과
          contentinfo만 남고, 18,000px짜리 한 장에서 챕터 단위 이동 수단이 레일
          하나뿐이었습니다. 각 챕터가 자기 제목을 이름으로 씁니다. */}
      {/* 2026-10-08 (사용자: "크로싱 서울이 너무 위에 있다"): lg의 위 여백을 한 단 늘렸습니다(pt-20 → pt-28). 로고가 헤더에
          바로 붙어 있었습니다. 카운트다운 띠까지 1440×900 한 화면에 들어오는 선에서입니다. */}
      {/* DECIDED 2026-10-11 (리뷰 브리프 2.2, B5, B7, C4, C6): 히어로는 왼쪽 단에 글만 있습니다.
          순서는 이름, 날짜, 무엇(굵은 줄), 누가 어떻게(문단, 주최 문장은 끝), 버튼 하나와 글자 링크 하나, 사실 한 줄, 남은 날 한 줄.
          오른쪽 단은 비워 둡니다(결정 D-b). 배경의 형상이 그 자리를 가집니다. 사진 넷과 두 시간대의 숫자 판, 버튼 넷은
          걷었습니다: 사진은 한 장이 다음 챕터로, "등록 폼 미리 보기"는 등록 블록으로, "AI 유형 테스트"는 Day 1 카드로 갔습니다.
          문단 속 "나루"의 링크도 뺐습니다(목차의 칩과 끝의 티저가 /naru로 갑니다).
          정렬(2.7): sm부터 왼쪽 끝, 폰은 가운데(가운데인 블록은 폰에서도 가운데, 2026-10-02).
          이 히어로에는 스크롤 효과를 걸지 않습니다(2026-09-20 결정 그대로). */}
      <Chapter id="top" labelledBy="hero-title" align="center" wide className="pt-16 sm:pt-24 lg:pt-28">
        <div className="relative grid items-start gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:px-0">
          <div className={`${PROSE} lg:pl-10 xl:pl-16`}>
            <h1 id="hero-title" className={`${TITLE} font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_40px_rgba(75,58,140,0.5)]`}>
              {/* DECIDED 2026-10-08 (사용자: "영문 화면에도 같은 로고로", 이어서 "영어 crossing seoul 로고로 바꿨으면"):
                  영문 화면의 로고는 영문입니다. 큰 글자가 "CROSSING SEOUL"이고 같은 그라데이션을 씁니다. 한글 줄은
                  영문 화면에 보이지 않습니다(나루 락업의 규칙과 같아졌습니다). 영문 로고 파일이 따로 없어서 한국어
                  로고의 큰 줄 문법(굵기, 자간, 그라데이션)을 그대로 옮긴 것이고, 작은 둘째 줄은 두지 않습니다.
                  글자 크기가 TITLE 하나라 좁은 기둥에서는 두 줄로 접힙니다. */}
              {DECEMBER_EVENT_NAME && locale === "en" ? (
                <span lang="en" className="gradient-text block bg-gradient-to-r from-naru-logo-from to-naru-logo-to bg-clip-text pb-[0.08em] tracking-[-0.02em] text-transparent">{DECEMBER_EVENT_NAME.en}</span>
              ) : DECEMBER_EVENT_NAME ? (
                <>
                  {/* DECIDED 2026-10-08 (사용자, 로고 스크린숏: "이걸로 써줘"): 히어로 제목은 마케팅 포스트의 크로싱 서울 로고
                      모양입니다. 큰 한글 "크로싱 서울"에 그라데이션, 그 아래 가운데에 영문 "CROSSING SEOUL"을 넓은 자간으로.
                      같은 날 (사용자, 스크린숏: "너무 싫음, background가 동일해야지"): 크림색 판은 쓰지 않습니다. 바탕은
                      사이트의 어두운 바탕 그대로입니다. **이 자리에 밝은 판이나 상자를 다시 두지 마세요.**
                      로고의 원래 색(남색 #12246B에서 자주 #845185, 영문 테라코타 #9A3324)은 어두운 바탕에서 보이지 않아
                      (남색 1.4:1) 같은 색상의 밝은 틴트로 옮겼습니다: 남색 틴트 #9AA8EE에서 자주 틴트 #C99ACB, 영문은
                      테라코타 틴트 #E08A76. 로고의 색이라 "주황은 점으로만" 규칙의 대상이 아닙니다.
                      영문 줄은 META 크기라 한 화면의 글자 크기는 그대로 셋입니다. gradient-text는 clip이 안 되는
                      브라우저의 단색 폴백 표식입니다(globals.css). */}
                  <span className="inline-block">
                    <span lang="ko" className="gradient-text block break-keep bg-gradient-to-r from-naru-logo-from to-naru-logo-to bg-clip-text pb-[0.08em] tracking-[-0.02em] text-transparent">{DECEMBER_EVENT_NAME.ko}</span>{" "}
                    {/* lang="en" (2026-09-19, 접근성 감사 7): 한국어 TTS가 영문을 한글 음가로 읽지 않게. 사이의 {" "}는
                        이름 계산용입니다(감사 17). pl은 자간만큼 왼쪽을 밀어 가운데를 맞춥니다(끝 글자 뒤의 자간).
                        폰에서는 자간을 좁힙니다: 한글이 36px라 0.55em이면 영문이 한글보다 넓어져 한글이 왼쪽 끝에서 밀립니다. */}
                    {/* 2026-10-08 (히어로 정리): 영문 줄의 양 끝을 한글 줄의 양 끝에 맞춥니다(글자를 고르게 벌려 폭을 같게).
                        가운데 정렬이면 왼쪽 정렬된 히어로에서 영문만 안쪽으로 들어가 보였습니다. 읽는 글은 sr-only 한 줄입니다. */}
                    <span lang="en" className={`mt-1 flex justify-between ${META} font-bold uppercase leading-none text-[#E08A76] sm:mt-2`}>
                      <span className="sr-only">{DECEMBER_EVENT_NAME.en}</span>
                      {[...DECEMBER_EVENT_NAME.en].map((ch, i) => (<span key={i} aria-hidden>{ch === " " ? "\u00a0" : ch}</span>))}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-white">{decemberEventLabel(locale).split(" ")[0]}</span>
                  <span className={`${GRADIENT_TEXT} block`}>{decemberEventLabel(locale).split(" ").slice(1).join(" ") || "\u00a0"}</span>
                </>
              )}
            </h1>
            <p className={`mt-8 ${BODY} font-bold text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] lg:mt-12`}>
              {formatDecemberDateLine(locale)}
            </p>
            <p className={`mt-4 max-w-xl break-keep max-sm:mx-auto ${BODY} font-bold leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]`}>
              {t(naru.december.heading)}
            </p>
            <p className={`mt-3 max-w-xl break-keep max-sm:mx-auto ${BODY} leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]`}>
              {t(naru.eventHero.sub)}{" "}{t(naru.eventHero.naruLine)}
            </p>
            <div className="mt-10 flex flex-col items-center gap-x-6 gap-y-2 sm:flex-row">
              {regState === "open" ? (
                <button type="button" onClick={() => { track("naru_cta", { src: "hero", to: "register" }); reg?.openRegister(); }} className={BTN_PRIMARY}>
                  {t(registerCopy.cta)}
                  <span aria-hidden className={ARROW_CLASS}>→</span>
                </button>
              ) : regState === "closed" ? (
                <span className={`${BTN_SECONDARY} cursor-default !text-white/70`}>{t(registerCopy.closed)}</span>
              ) : (
                <ChatCta t={t} src="naru-hero" />
              )}
              <a href="#december" onClick={() => track("naru_cta", { src: "hero", to: "december" })} className={BTN_TEXT}>
                {t(naru.eventHero.ctaProgram)}
                <span aria-hidden>↓</span>
              </a>
            </div>
            <p className={`mt-4 max-w-xl break-keep max-sm:mx-auto ${META} leading-snug text-white/85`}>{t(naru.eventHero.facts)}</p>
            <CountdownLine t={t} locale={locale} className="mt-2 max-sm:justify-center" />
          </div>
          <div aria-hidden className="hidden lg:block" />
        </div>
      </Chapter>

      {/* ── 이슈에서 증명까지, 닷새 ─────────────────────────────────────────────
          DECIDED 2026-10-11 (리뷰 브리프 2.3~2.6): 이 챕터의 순서는 제목, 문단 둘과 사진 한 장, 일정 문단, 노선도와 세션 세 줄,
          날짜 카드(sm부터), 멘토링 상자 둘, 다른 점 둘입니다. "5일 / 무순위" 숫자 줄은 노선도 머리의 한 줄이 됐고,
          등록 블록은 다음 챕터("남는 것")의 끝으로 갔습니다. 셋째 문단(notSequel)은 그리지 않습니다(키는 그대로).
          정렬(2.7): 제목과 노선도, 세션 세 줄만 가운데이고 글 블록은 sm부터 READ의 왼쪽 끝 하나입니다. 폰은 가운데.
          2026-10-11 오전의 "sm부터도 가운데"는 이 결정이 대신합니다. 그 전의 주석은 git 이력(6f8ccec 이전)에 있습니다. */}
      <Chapter id="december" labelledBy="december-title" align="center">
        <PlateSegment id="december">
        <h2 id="december-title" className={`${H2} ${READ} text-balance text-center`}><Halo tone="violet">{t(naru.december.programHeading)}</Halo></h2>
        <div className={`${READ} mt-6 grid items-start gap-6 md:grid-cols-[1fr_17rem] md:gap-8 ${PROSE}`}>
          <div>
            <p className={`break-keep ${BODY} leading-relaxed text-white/85`}>
              {t(naru.december.programConcrete).replace("{date}", formatDecemberDateLine(locale))}
            </p>
            <p className={`mt-4 break-keep ${BODY} leading-relaxed text-white/70`}>{t(naru.december.shapeLead)}</p>
          </div>
          {/* DECIDED 2026-10-11 (리뷰 브리프 2.2, B7, 결정 D-b): 지난 회차의 사진은 이 한 장입니다(Day 1의 홀). 날짜 오버레이는 없습니다.
              같은 날 사용자가 "8월에는 74명이 신청했고..." 문장을 빼라고 해서, 브리프가 사진 옆에 두라던 그 문장은 그리지 않습니다. */}
          <figure className="mx-auto w-full max-w-[17rem]">
            <Image
              src={pastPhoto.src}
              alt={t(pastPhoto.alt)}
              width={pastPhoto.width}
              height={pastPhoto.height}
              sizes="306px"
              className="h-auto w-full rounded-2xl border border-white/10"
            />
            <figcaption className={`mt-2 ${META} text-white/70`}>{t(naru.eventHero.pastCaption)}</figcaption>
          </figure>
        </div>

        <Reveal className={`${READ} mt-12 ${PROSE}`}>
          <h3 data-subheading className={`${SUBTITLE} break-keep text-white`}>{t(naru.december.scheduleLabel)}</h3>
          <p className={`mt-3 break-keep ${BODY} leading-relaxed text-white/70`}>{t(naru.december.scheduleLead)}</p>
        </Reveal>

        <Reveal className={`${WIDE} mt-8`}>
          {/* data-center-zone: 노선도는 그림이라 가운데를 씁니다(왼쪽 끝 브리프 2.2, 리뷰 브리프 2.7). 머리의 한 줄도 그 그림의 일부입니다. */}
          <div data-center-zone="routemap">
          <p className={`mb-4 text-center ${META} text-white/70`}>{t(naru.december.routeNote)}</p>
          <RouteMap
            ariaLabel={t(naru.december.routeAria)}
            stations={naru.december.stages.map((s, i) => ({
              key: s.name.en,
              sub: `${t(naru.december.dayLabel)} ${s.dayOffset}`,
              label: t(s.title),
              // ★는 종착역(마지막 날, 성과 공유회) 하나, 마일스톤이 있는 나머지 날은 ◉, Day 0은 빈 점(2026-10-11 오전).
              kind: !s.milestone ? "plain" : i === naru.december.stages.length - 1 ? "anchor" : "spot",
              milestone: s.milestone ? t(s.milestone) : undefined,
            }))}
            current={hoverDay ?? (phone ? openDay : null) ?? 0}
            selected={phone ? openDay : null}
            onSelect={phone ? selectDay : undefined}
            controls={routePanelId}
            // 2026-10-11 (리뷰 A3): 카드가 열려 있는 동안 힌트 자리에는 그 날짜가 섭니다.
            hint={openDay !== null ? formatDecemberDayWithWeekday(locale, naru.december.stages[openDay].dayOffset) : t(naru.december.routeHint)}
            // 패널 다섯은 늘 마운트돼 있고 열린 것만 hidden이 풀립니다. sm부터는 감싼 div가 통째로 display: none입니다.
            below={
              <div className="sm:hidden">
                {naru.december.stages.map((stage, i) => (
                  <div key={stage.name.en} id={routePanelId(i)} hidden={openDay !== i} className="mt-3">
                    {stageCard(stage, i, true)}
                  </div>
                ))}
              </div>
            }
          />
          </div>
          {/* DECIDED 2026-10-11 (리뷰 브리프 2.3, C1): 세션 세 줄. 누르지 않아도 폰과 데스크톱 모두에서 보입니다.
              Day 태그 열만 가운데이고(2.7) 이름과 설명은 왼쪽입니다. 묶음 자체는 노선도 아래 가운데에 섭니다. */}
          <ul role="list" data-center-zone="sessions" className="mx-auto mt-6 grid w-fit max-w-full gap-y-2">
            {naru.december.sessionsLead.map((s) => (
              <li key={s.name} className="grid grid-cols-[4.25rem_1fr] items-baseline gap-x-3 text-left">
                <span lang="en" className={`${CHIP_TAG} justify-center tracking-[0.08em] text-accent`}>{`${t(naru.december.dayLabel)} ${s.dayOffset}`}</span>
                <span className={`break-keep ${BODY} leading-snug text-white/85`}>
                  <span lang="en" className="font-bold text-white">{s.name}</span>, {t(s.note)}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* 날짜 카드 다섯(결정 D-e: 유지). 폰에서는 그리지 않습니다. 위 노선도의 정거장을 누르면 같은 카드가 그 아래에 열립니다. */}
        <Reveal className={`${READ} mt-8 max-sm:hidden`}>
          <div data-schedule className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {naru.december.stages.map((stage, i) => stageCard(stage, i))}
          </div>
        </Reveal>

        <Reveal className={`${READ} mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 ${PROSE}`}>
          {mentoringBoxes}
        </Reveal>

        {/* DECIDED 2026-10-11 (리뷰 브리프 2.5, C3): "기존 해커톤과 다른 점". 남는 행은 마일스톤과 가설 둘입니다.
            sm부터 왼쪽 라벨(10rem, BODY 굵게)과 오른쪽 본문, 폰은 라벨 위 본문 아래. dl의 직계는 div 한 겹입니다(접근성 감사 9). */}
        <Reveal className={`${READ} mt-12 ${PROSE}`}>
          <h3 data-subheading className={`${SUBTITLE} break-keep text-white`}>{t(naru.december.factsLabel)}</h3>
          <dl className="mt-4">
            {differFacts.map((f, i) => (
              <div key={f.k.en} className={`grid grid-cols-1 gap-y-1 border-t border-white/10 py-4 sm:grid-cols-[10rem_1fr] sm:gap-x-6 ${i === differFacts.length - 1 ? "border-b" : ""}`}>
                <dt className={`break-keep ${BODY} font-bold text-white`}>{t(f.k)}</dt>
                <dd className={`break-keep ${BODY} leading-relaxed text-white/70`}>{t(f.v)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        </PlateSegment>
      </Chapter>

      {/* ── 남는 것, 그리고 등록 ────────────────────────────────────────────────
          DECIDED 2026-10-11 (리뷰 브리프 2.6, C2, 결정 D-c): 제목은 SUBTITLE로 내리고 판 하나(체크 셋)와 문단 하나만 둡니다.
          알약 "참가 혜택"과 01부터 05의 카드 다섯은 그리지 않습니다(다섯 장 모두 위에서 한 말의 재진술이었습니다. 키는 그대로).
          그 아래가 등록 블록(#register)입니다. 프로그램과 남는 것을 다 읽은 자리에 문이 있고, 페이지의 마지막 버튼이 등록입니다.
          id="gains"와 읽기 판은 그대로입니다(배경의 국면과 하단 오픈채팅 바가 이 id를 봅니다). */}
      <Chapter id="gains" labelledBy="gains-title" align="center">
        <PlateSegment id="gains" read>
        <h2 id="gains-title" className={`${READ} ${SUBTITLE} break-keep text-white ${PROSE}`}>{t(naru.gains.heading)}</h2>
        <Reveal className={`${READ} ${PROSE}`}>
          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/[0.08] p-6">
            <p className={`${META} font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.gains.spine.tag)}</p>
            <p className={`mt-2.5 break-keep ${BODY} font-bold leading-snug text-white`}>{t(naru.gains.spine.heading)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 max-sm:justify-center">
              {naru.gains.spine.tangibles.map((x, i) => (
                <span key={i} className={`${CHIP_TAG} whitespace-nowrap text-white/90`}>
                  <span aria-hidden className="text-accent">✓</span>
                  {t(x)}
                </span>
              ))}
            </div>
          </div>
          <p className={`mt-6 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.findClose)}</p>
        </Reveal>

        {/* 등록 블록. 목차의 "참가" 칩이 내려앉는 자리입니다(리뷰 A2). 착지 여백은 JourneyNav의 scroll-padding-top이 맡습니다. */}
        <div id="register" className={`${READ} mt-12 border-t border-white/10 pt-8 ${PROSE}`}>
          <h3 className="sr-only">{t({ ko: "등록", en: "Registration" })}</h3>
          <p id="december-register-note" className={`break-keep ${BODY} leading-relaxed text-white/70`}>
            {regState === "closed" ? t(registerCopy.closed) : t(naru.december.ctaNote)}
          </p>
          <div className="mt-5 flex flex-col items-center gap-x-4 gap-y-3 sm:flex-row sm:flex-wrap">
            {regState === "open" ? (
              <button type="button" onClick={() => { track("naru_cta", { src: "december", to: "register" }); reg?.openRegister(); }} className={BTN_PRIMARY}>
                {t(registerCopy.cta)}
                <span aria-hidden className={ARROW_CLASS}>→</span>
              </button>
            ) : regState === "not_open" ? (
              <>
                <ChatCta t={t} src="naru-december" />
                {/* 위 ctaNote("등록은 아직 열리지 않았습니다...")가 이 버튼의 캡션입니다. */}
                <PreparingButton t={t} noteId="december-register-note" onOpen={reg?.openRegister} />
              </>
            ) : null}
            <a href={naruLinks.sponsor} onClick={() => track("naru_mail", { src: "december" })} className={BTN_TEXT}>
              {t(naru.december.ctaMail)}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
        </PlateSegment>
      </Chapter>

      {/* ── 나루 티저 ───────────────────────────────────────────────────────────
          DECIDED 2026-10-11 (리뷰 브리프 2.6, B4): 인장 120px, "여는 사람들", 굵은 한 줄, 한 문단, 글자 링크.
          TITLE 크기의 슬로건 두 줄과 220px 인장은 히어로의 h1보다 컸고 /naru의 머리와 글자 하나 다르지 않았습니다.
          슬로건은 /naru에만 있습니다. 링크는 버튼 모양이 아닙니다(페이지의 마지막 버튼은 등록).
          id는 naru라 옛 링크 /#naru와 목차의 "나루" 칩이 여기로 옵니다. 읽기 판 밖이라 카드가 자기 바탕을 가집니다.
          Chapter가 아니라 section입니다(Chapter는 md부터 한 화면 높이를 잡습니다). */}
      <section id="naru" aria-labelledby="naru-teaser-title" className="relative w-full px-6 pb-20 pt-16 sm:px-10 lg:pb-28 lg:pt-28">
        <h2 id="naru-teaser-title" className="sr-only">{t({ ko: "나루", en: "NARU" })}</h2>
        <Reveal className={READ}>
          <div className={`${CARD} flex flex-col items-center gap-6 !bg-[#0B1430]/90 sm:flex-row ${PROSE}`}>
            <Image
              src={locale === "en" ? "/naru/naru-master-en-v3-rev.svg" : "/naru/naru-master-v3-rev.png"}
              alt={t(naru.hero.logoAlt)}
              width={900}
              height={900}
              unoptimized={locale === "en"}
              className="block h-auto w-[120px] shrink-0"
            />
            <div className="min-w-0">
              <p className={`${META} font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.teaser.eyebrow)}</p>
              <p className={`mt-2 break-keep ${BODY} font-bold text-white`}>{t(naru.teaser.title)}</p>
              <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.teaser.body)}</p>
              <Link href={naru.teaser.cta.href} onClick={() => track("naru_cta", { src: "teaser", to: "naru-page" })} className={`mt-2 ${BTN_TEXT} !text-accent`}>
                {t(naru.teaser.cta.label)}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>


      {/* 2026-10-10 (구조 브리프): #record가 /naru로 가서, 홈에서는 #gains가 지나면 나타납니다. */}
      {/* 하단 오픈채팅 바(8월과 같은 것). #record가 지나면 나타나고 푸터가 보이면
          물러납니다. 홈에는 폰 전용 바가 없어서 폰까지 맡습니다(phone).

          main의 **끝**입니다 (2026-09-19, 접근성 감사 21). position: fixed로 화면
          맨 아래에 뜨는 바가 DOM에서는 본문 맨 앞이었습니다. 오픈채팅을 되살리면
          폰에서 main에 들어선 첫 Tab이 화면 아래 끝의 버튼으로 뜁니다. 보이는
          순서와 포커스 순서가 어긋나면 안 됩니다(2.4.3). 지금은 links.openChat이
          빈 문자열이라 렌더되지 않는 잠복 상태였어요. */}
      <MobileChatBar afterId="gains" endId="closing" phone />
      </main>

      <SiteFooter compact />
    </>
  );
}
