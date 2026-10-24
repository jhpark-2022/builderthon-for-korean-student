"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy, registerNoteShort, decemberPartners, type RecordPhoto } from "@/data/naru";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import { links, type Phrase } from "@/data/dictionaryCore";
import { useEffect, useRef, useState } from "react";
import {
  DECEMBER_EVENT_NAME,
  DECEMBER_STARTS_AT_MS,
  DECEMBER_STARTS_AT_SG_MS,
  decemberEventLabel,
  formatDecemberDateLine,
  formatDecemberRange,
  DECEMBER_CITY,
  formatDecemberDayWithWeekday,
} from "@/lib/naruDates";
import Glass from "@/components/ui/Glass";
import { buttonClass, ARROW_CLASS } from "@/components/ui/Button";
import { TIMETABLE_OPEN } from "@/lib/crossingOps";
import { VOTE_BUTTON_OPEN } from "@/lib/crossingVote";
import RouteMap from "@/components/shared/RouteMap";
import PhotoLightbox, { warmPhoto } from "@/components/shared/PhotoLightbox";
import MobileChatBar from "@/components/shared/MobileChatBar";
import Chapter from "@/components/journey/Chapter";
import Reveal from "@/components/shared/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
// RecordTabs: 2026-09-17에 뺐다가(사용자: 바로 아카이브로) 2026-09-18 감사 반영 브리프 5.2로
// 다시 넣었습니다. 멘토 / 연사와 피드백 패널 둘만.
// (2026-09-19: RecordTabs·PressRows·Funnel은 화면에서 내려가 import도 뺐습니다. 파일은 그대로.)
import { TITLE, BODY, META, H2, H3, LABEL_HEADING, ROW_HEADING, GRADIENT_TEXT } from "@/components/ui/typography";
import CityShape, { type City } from "@/components/ui/CityShape";
import SeoulCampuses from "@/components/home/SeoulCampuses";
import {
  SUBHEADING, READ, WIDE, MEASURE_C, READ_MEASURE_C, HERO_BUTTON_GROUND,
  latinTrack, eyebrowTrack, PlateSegment, TermLink, SiteFooter, usePlateLite,
} from "./shared";

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
// 카운트다운 패널. 8월 히어로 오른쪽 단의 Glass 패널 문법 (2026-09-17).
//
// 숫자는 마운트 뒤에만 채웁니다. 서버는 시각을 모르고(홈은 정적), 첫 페인트에
// 서버 시각을 박으면 클라이언트에서 다시 계산할 때 숫자가 바뀌며 화면이 튑니다.
// 패널의 높이는 숫자가 있든 없든 같습니다(빈 자리에 "--"). 8월이 겪은 하이드레이션
// 밀림(app/2026-08/page.tsx 상단 주석)을 그대로 물려받지 않으려는 것입니다.
// 0이 되면 "시작했습니다". 아래 미정 칩 셋은 tbd 목록의 앞 둘과 마지막(등록이
// 열리는 날)입니다. 나머지는 프로그램 챕터의 목록이 갖습니다.
// ─────────────────────────────────────────────────────────────────────────────
function CountdownPanel({ t, locale, className = "" }: { t: (p: Phrase) => string; locale: "ko" | "en"; className?: string }) {
  type Left = { d: number; h: number; m: number } | "started";
  const [left, setLeft] = useState<Left | null>(null);
  // 싱가포르 기준(+08:00)은 같은 날 0시라 서울보다 한 시간 뒤에 시작합니다(2026-09-19, 사용자: 둘 다 있어야).
  const [leftSg, setLeftSg] = useState<Left | null>(null);
  useEffect(() => {
    const calc = (target: number): Left => {
      const ms = target - Date.now();
      if (ms <= 0) return "started";
      const mins = Math.floor(ms / 60000);
      return { d: Math.floor(mins / 1440), h: Math.floor((mins % 1440) / 60), m: mins % 60 };
    };
    const tick = () => {
      setLeft(calc(DECEMBER_STARTS_AT_MS));
      setLeftSg(calc(DECEMBER_STARTS_AT_SG_MS));
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  const units = naru.eventHero.countdownUnits;
  const pad = (n: number) => String(n).padStart(2, "0");
  // DECIDED 2026-09-18 (모바일 수정 브리프 2): 한 줄. 서울 기준만(싱가포르 줄은 시차 한 시간에
  // 날짜가 같아 뺌). 초는 뺐고, 폰은 일만, sm부터 일·시간·분. 이날 아침의 두 줄·초 단위는
  // 닷새짜리 이벤트에 과했습니다.
  // 2026-09-19 (사용자: 타이머가 박스를 꽉 채우게): 폰에서도 시간까지 보입니다.
  // 전에는 일 하나였고, 그 한 칸이 상자의 왼쪽 40%에서 끝났습니다. 분은 여전히
  // sm부터입니다(폰 390px에서 세 칸이면 숫자가 줄어들어야 합니다).
  const cellsOf = (l: Left | null): { v: string; u: Phrase; phone: boolean }[] =>
    l && l !== "started"
      ? [{ v: String(l.d), u: units.days, phone: true }, { v: pad(l.h), u: units.hours, phone: true }, { v: pad(l.m), u: units.minutes, phone: false }]
      : [{ v: "--", u: units.days, phone: true }, { v: "--", u: units.hours, phone: true }, { v: "--", u: units.minutes, phone: false }];
  const rows: { key: Phrase; city: City; l: Left | null }[] = [
    { key: naru.eventHero.countdownRows.seoul, city: "seoul", l: left },
    { key: naru.eventHero.countdownRows.singapore, city: "singapore", l: leftSg },
  ];
  // 낭독은 컨테이너의 aria-label 하나로(감사 반영 브리프 1.4, WCAG 4.1.3). 전에는 자식이
  // 따로 읽혀 "81 일"로 끊겼고, aria-live면 분마다 낭독됐습니다. 아래 자식은 전부 aria-hidden.
  const aria =
    left === "started"
      ? t(naru.eventHero.started)
      : left
        ? t(naru.eventHero.countdownAria)
            .replace("{d}", String(left.d))
            .replace("{h}", String(left.h))
            // 싱가포르 줄 (2026-09-19, 접근성 감사 12). leftSg가 없거나 이미
            // 시작했으면 서울 값으로 떨어뜨립니다. 없는 숫자를 지어내지 않습니다.
            .replace("{d2}", String(leftSg && leftSg !== "started" ? leftSg.d : left.d))
            .replace("{h2}", String(leftSg && leftSg !== "started" ? leftSg.h : left.h))
        : t(naru.eventHero.countdownLabel);
  return (
    <div role="group" aria-label={aria} className={`w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-5 py-4 text-left sm:px-6 sm:py-5 ${className}`}>
      {/* 2026-09-18 (감사 반영 브리프 1.4): 테두리는 --border-2, 라벨은 흰색. 주황은 옆의 점 하나
          (상태 표시)뿐입니다. 이 점이 주황 허용 목록의 "카운트다운 옆 점"입니다.
          2026-09-19 (사용자): 서울·싱가포르 두 줄. 시차 한 시간이라 일은 같고 시간만 다릅니다. */}
      {/* DECIDED 2026-10-20 (hwang 브리프 2.2, 감사 W1, W16): 대문자, 자간 0.18em, 주황 점을 뺐습니다. META 굵게 글자 하나. */}
      <p aria-hidden className={`flex items-center gap-2 max-sm:justify-center ${META} font-bold text-white/85`}>
        {t(naru.eventHero.countdownLabel)}
        {/* /45 → /60 (2026-09-19, 접근성 감사 2). 이 줄은 sm:hidden이라 **폰에서만**
            보이는데 흰색 45%는 #070B1F 위에서 4.49:1로 AA(4.5:1)에 못 미칩니다.
            globals.css의 대비 표도 "/45는 --bg에서 간발의 차로 실패"라고 적어 두었어요.
            폰에서 이벤트 날짜를 읽으려는 사람이 가장 읽기 어려운 글자로 보게 됩니다.
            /60은 7.25:1입니다. 감싼 <p>가 aria-hidden이라 낭독 대체 경로도 없습니다.
            2026-10-07 (이슈 브리프 4.2, 4.3): /60 → /90. 위 숫자는 단색 바탕 기준이고, 폰 히어로에서는 이 줄 뒤로
            해의 빛이 지나갑니다(실측 3.8:1). 히어로에는 읽기 판이 없어서, 히어로의 작은 글(이 줄, 아래 행 라벨과
            단위, 등록 버튼 아래 한 줄)은 밝은 쪽에 둡니다. */}
        <span className="text-white/85 sm:hidden">{` (${formatDecemberDayWithWeekday(locale, 0)})`}</span>
      </p>
      {/* 2026-09-19 (사용자: "시간 타이머가 좀 더 박스를 꽉 채워주면 좋겠다"): 칸을 격자로
          나눕니다. 전에는 flex라 숫자 셋이 왼쪽에 몰리고 상자의 오른쪽 절반이 비어
          있었습니다. sm부터 라벨 한 칸 + 일·시간·분 세 칸을 같은 너비로 펴고, 숫자도
          한 단 키웁니다(1.6rem → 2.25rem). 폰은 일만 보이므로 두 칸 그대로입니다. */}
      <div aria-hidden className="mt-2.5 grid gap-y-2 xl:grid-cols-2 xl:gap-x-12">
        {rows.map((r) => (
          <div
            key={r.key.en}
            // 2026-09-19 (모바일 감사 1): 폰 라벨 트랙 6.5rem(117px) → 4.5rem(81px),
            // 숫자 칸은 1fr → minmax(0,1fr). `1fr`은 minmax(auto,1fr)이라 **내용보다
            // 작아지지 못합니다.** 영어 단위(days/hrs)가 한글(일/시간)보다 두 배 넓어
            // 360px에서 숫자 칸이 패널 밖으로 밀렸습니다(계산상 37px 초과).
            // 81px은 이 트랙이 담는 최장 문자열("Seoul time" 약 72px, "싱가포르 SGT"
            // 약 78px)이 한 줄로 들어가는 값입니다.
            // 2026-10-07: 라벨이 META(13.5px)가 되어 "Singapore SGT"가 92px입니다. 81px 트랙에서는 숫자와
            // 겹쳤습니다(영문 390px 실측). 트랙을 5.25rem(94.5px)으로 넓힙니다.
            // DECIDED 2026-10-08 (사용자, 스크린숏: "지역의 형상이 중간에 오면 좋겠어, 지금은 너무 사이드에 있음"): sm부터는
            // 격자가 아니라 가운데로 쌓습니다. 윤곽과 작은 라벨이 그 묶음의 가운데 위에, 숫자 셋이 그 아래 한 줄로.
            // 폰은 폭이 좁아 전처럼 왼쪽 라벨 칸 + 숫자 두 칸입니다(아래 contents가 폰에서 숫자 칸을 격자의 자식으로 둡니다).
            className="grid grid-cols-[5.25rem_repeat(2,minmax(0,1fr))] items-center gap-x-2 sm:flex sm:flex-col sm:items-center sm:gap-3"
          >
            {/* DECIDED 2026-10-08 (사용자, 스크린숏: "그냥 서울, 싱가포르 이것보다 나라의 형상이 있었으면"): 행 라벨 자리에
                그곳의 윤곽을 둡니다. 마케팅 포스트와 같은 그림입니다(components/ui/CityShape.tsx). 어느 곳의 시각인지는
                윤곽이 먼저 말하고, 작은 글 라벨은 그 아래에 남깁니다(윤곽만으로는 표준시를 알 수 없습니다). 윤곽은
                로고 그라데이션의 두 끝 색입니다(서울은 남색 틴트, 싱가포르는 자주 틴트). */}
            {/* DECIDED 2026-10-19 (사용자, 스크린숏: "나라의 shape 사이즈가 동일하지 않음. 그리고 needs to be centralized aligned"):
                높이만 같게(h-6) 두면 가로로 긴 싱가포르가 서울보다 훨씬 커 보였습니다. 두 윤곽을 같은 상자(w-10 h-7, sm부터
                w-14 h-10)에 contain으로 넣어 크기를 맞추고, 윤곽과 라벨을 칸의 가운데에 둡니다. */}
            <span className="flex min-w-0 flex-col items-center gap-1">
              <CityShape city={r.city} decorative className={`h-7 w-10 sm:h-10 sm:w-14 ${r.city === "seoul" ? "text-naru-logo-from" : "text-naru-logo-to"}`} />
              <span className={`whitespace-nowrap ${META} font-semibold text-white/85`}>{t(r.key)}</span>
            </span>
            {r.l === "started" ? (
              <span className={`col-span-2 ${BODY} font-black text-white sm:col-span-3`}>{t(naru.eventHero.started)}</span>
            ) : (
              <span className="contents sm:flex sm:items-baseline sm:justify-center sm:gap-x-8 lg:gap-x-10">
                {cellsOf(r.l).map((c, i) => (
                  // 2026-10-08: 패널이 두 단 아래의 전체 폭 띠가 되어 단위가 다시 숫자 옆에 섭니다(10월 7일에는 반쪽 폭이라
                  // 단위를 숫자 아래로 내렸습니다).
                  <span key={i} className={`min-w-0 items-baseline gap-1.5 ${c.phone ? "flex" : "hidden sm:flex"}`}>
                    <span className={`${TITLE} font-black leading-none tabular-nums text-white`}>{c.v}</span>
                    <span className={`${META} font-semibold text-white/85`}>{t(c.u)}</span>
                  </span>
                ))}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// #gains의 노선(DECIDED 2026-10-19, 사용자, 스크린숏: "너무 평면적으로 보여주는거 같고, visually 의미 있게
// 다가오지 않음", 이어서 "노선하나를 5개가 공유를 하면 좋을거 같은데"). 다섯 카드가 같은 모양의 글 상자라 무엇이 언제
// 오는지가 보이지 않았습니다. 노선도와 같은 그림으로 Day 0~4 노선을 판 맨 위에 한 번 긋고, 다섯 행이 그 칸 위에 막대를 긋습니다.
// 날짜는 data/naru.ts gains.items[].days. 글자는 META 하나라 화면의 크기 셋을 넘지 않습니다.
// 근거: brand 5장 "추상적인 문장 옆에는 구체적인 한 줄", brand 7장 닷새.
// ─────────────────────────────────────────────────────────────────────────────
// DECIDED 2026-10-19 (사용자: 노선 하나를 같이 쓰는 생각은 좋지만 "initial version 진짜 이상함", 디자인 서브에이전트 셋의 검토):
// 첫 판은 막대 끝의 큰 점이 노선보다 무거워 스위치 다섯 개처럼 읽혔고, 막대가 행 가운데에 떠 글과 멀었고, 날 이름이 없었고,
// 폰에서는 머리가 스크롤로 사라졌습니다. 이제 머리와 다섯 행이 같은 칸 틀(GAIN_COLS) 하나를 씁니다: 왼쪽 글 칸 + 날 다섯 칸.
// 머리는 "Day N / 날 이름"과 정거장, Day 4 정거장에만 주황 점(도착, 성과 공유회). 막대는 점 없는 얇은 띠이고 제목 줄 높이에 섭니다.
// split인 행(04)은 날마다 끊어 그립니다.
// DECIDED 2026-10-23 (사용자: "와서 얻는 것 at 12월 이벤트 디자인만 맞추어줘", 데스크톱이 기준): 폰도 데스크톱과 같은 그림입니다.
// 판 맨 위에 Day 0~4 머리(이름과 정거장) 하나, 날마다의 옅은 세로 띠, 행마다 같은 다섯 칸 위의 막대. 그 전의 폰 전용
// 행마다 0~4 작은 노선(GainStrip)은 뺐습니다. 폰은 글 칸이 없어 다섯 칸이 판 너비를 다 쓰고(grid-cols-5), 글은 그 위에 가운데,
// 막대는 글 아래 섭니다. sm부터는 전과 같이 왼쪽 글 칸 + 다섯 칸.
const GAIN_COLS = "grid-cols-5 sm:grid-cols-[minmax(0,18rem)_repeat(5,minmax(0,1fr))]";
// DECIDED 2026-10-20 (사용자, hwang 브리프 3.6, 감사 W2): 막대의 그라데이션을 accent 단색으로.
const GAIN_BAR = "h-2 rounded-full bg-accent/60";

/** 머리: 왼쪽에 "닷새"(sm부터), 날마다 번호와 이름과 정거장. */
function GainRouteHead({ label, names }: { label: string; names: string[] }) {
  return (
    <div className={`grid ${GAIN_COLS}`}>
      <p className={`hidden self-end pr-6 ${META} font-bold text-accent sm:block`}>{label}</p>
      {[0, 1, 2, 3, 4].map((d) => (
        <div key={d} className="flex flex-col items-center text-center">
          <span className={`${META} font-bold tabular-nums text-white/85`}>Day {d}</span>
          <span className={`${META} break-keep px-1 text-white/70`}>{names[d]}</span>
          {/* mt-auto: 이름이 두 줄로 접히는 칸(폰의 "컨텍스트 열기")에서도 정거장 다섯이 한 선에 섭니다. */}
          <div className="relative mt-auto h-3 w-full pt-2.5 box-content">
            <div className={`absolute top-1/2 h-px -translate-y-1/2 bg-white/25 ${d === 0 ? "left-1/2 right-0" : d === 4 ? "left-0 right-1/2" : "inset-x-0"}`} />
            <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${d === 4 ? "h-3 w-3 bg-[#EE8A4F]" : "h-2.5 w-2.5 border border-white/50 bg-[#0B1430]"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 한 행의 막대들. 이어진 날은 한 띠, split이면 날마다 한 칸. sm부터는 제목 줄(번호 배지 28px의 가운데) 높이에 섭니다.
 *  폰에서는 글 아래 자기 다섯 칸 격자(grid-cols-5) 안에 같은 막대를 긋습니다. 두 폭이 칸 하나씩 다릅니다(sm은 글 칸이 1열). */
function GainBars({ days, split }: { days: number[]; split?: boolean }) {
  const lo = Math.min(...days);
  const hi = Math.max(...days);
  const spans = split ? days.map((d) => [d, d]) : [[lo, hi]];
  return (
    <>
      {spans.map(([a, b]) => (
        <div key={a} aria-hidden className="mt-2.5 hidden px-2 sm:block" style={{ gridColumn: `${a + 2} / span ${b - a + 1}`, gridRow: 1 }}>
          <div className={GAIN_BAR} />
        </div>
      ))}
      <div aria-hidden className="mt-[14px] grid grid-cols-5 sm:hidden">
        {spans.map(([a, b]) => (
          <div key={a} className="px-1.5" style={{ gridColumn: `${a + 1} / span ${b - a + 1}` }}>
            <div className={GAIN_BAR} />
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 히어로 사진 넷 (DECIDED 2026-09-17, 사용자). 오른쪽 단(폰은 카피 아래)에 8월 행사
// 사진을 2×2로. 형상 무대(싱가포르·서울 점)는 이날 걷었습니다. 사진은 전부 4:3이라
// 칸도 4:3, fill + cover가 실제로는 아무것도 자르지 않습니다(PhotoWall과 같음).
// 오른쪽 열을 조금 내려(lg:mt-10) 한 덩어리로 읽히게 합니다.
// ─────────────────────────────────────────────────────────────────────────────
// 2026-09-18 (감사 반영 브리프 1.3): 사진 묶음 아래 한 줄 캡션("제로백 빌더톤 · 2026.08 싱가포르").
// 캡션이 없으면 12월 사진으로 읽혔습니다. 데스크톱은 호버 시 각 사진 하단에 "Day 1" 캡션이
// 올라옵니다(photos[].day). 폰은 정적 한 줄만. sizes는 실측 렌더 폭(폰 45vw, 데스크톱 약
// 280px)에 맞춰 dpr 3 기기에서 흐리지 않게(브리프 9.3). src가 없는 사진은 그리지 않습니다.
function HeroPhotos({ photos, t, className = "", desktopOnly = false }: {
  photos: RecordPhoto[];
  t: (p: Phrase) => string;
  className?: string;
  /**
   * 이 묶음이 `hidden lg:block` 안에 있는가 (2026-09-19, 접근성 감사 22).
   * 그러면 폰은 이것을 그리지 않으므로 priority를 걸지 않습니다. 전에는 같은
   * 사진 넷이 DOM에 두 번 있고 양쪽 다 priority여서, 폰이 보지도 않을 이미지
   * 둘을 preload 했습니다. 폰용 묶음(className으로 오는 쪽)이 priority를 맡습니다.
   */
  desktopOnly?: boolean;
}) {
  const shown = photos.filter((p) => !!p.src).slice(0, 4);
  // DECIDED 2026-10-11 (사용자, 스크린숏: "이거 클릭하면 더 큰 이미지로 볼 수 있도록"): 칸은 누르는 것이고, 누르면 그 사진이 크게 열립니다.
  const [openPhoto, setOpenPhoto] = useState<number | null>(null);
  // 2026-10-19: 칸에 이미 받아 둔 작은 판의 주소. 큰 사진이 오는 동안 상자에 늘려 보여 줍니다(PhotoLightbox의 thumb).
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  if (shown.length === 0) return null;
  return (
    <figure className={className}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {shown.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            aria-haspopup="dialog"
            title={t(naru.eventHero.photoOpen)}
            onPointerEnter={() => warmPhoto(photo.src)}
            onTouchStart={() => warmPhoto(photo.src)}
            onFocus={() => warmPhoto(photo.src)}
            onClick={(e) => {
              const imgs = e.currentTarget.parentElement?.querySelectorAll("img") ?? [];
              const next: Record<string, string> = {};
              imgs.forEach((img, k) => { if (img.currentSrc && shown[k]) next[shown[k].src] = img.currentSrc; });
              setThumbs(next);
              setOpenPhoto(i);
            }}
            className={`group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] transition-colors hover:border-white/30`}
          >
            <Image src={photo.src} alt={t(photo.alt)} fill sizes="(max-width: 1023px) 45vw, 280px" priority={!desktopOnly && i < 2} className="object-cover object-center" />
            {photo.day && (
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 ${META} font-bold text-white transition-transform duration-300 group-hover:translate-y-0 motion-reduce:transition-none lg:block`}
              >
                {t(photo.day)}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* lg에서는 홀수 칸이 36px 내려가 있어 그만큼 더 띄웁니다. */}
      {/* DECIDED 2026-10-12 (등록 브리프 1.5, 리뷰 S10): 캡션이 8월 기록으로 갑니다. 밑줄은 본문 인라인 링크의 문법입니다.
          같이 붙였던 8월 숫자 문장은 2026-10-13에 뺐습니다(사용자: "이렇게 디테일한 설명은 필요 없음"). */}
      <figcaption className={`mt-3 text-left max-sm:text-center ${META} text-white/85`}>
        <Link href={naruLinks.archive} onClick={() => track("naru_cta", { src: "hero-caption", to: "archive" })} className="-my-3.5 inline-flex min-h-[44px] items-center break-keep underline underline-offset-4 transition hover:text-white">
          {t(naru.eventHero.photosCaption)}
        </Link>
      </figcaption>
      <PhotoLightbox
        photos={shown.map((p) => ({ src: p.src, alt: t(p.alt), width: p.width, height: p.height, caption: p.day && `${t(naru.eventHero.photosCaption)} · ${t(p.day)}`, thumb: thumbs[p.src] }))}
        index={openPhoto}
        onIndex={setOpenPhoto}
        onClose={() => setOpenPhoto(null)}
        labels={{ close: t(naru.eventHero.photoClose), prev: t(naru.eventHero.photoPrev), next: t(naru.eventHero.photoNext) }}
      />
    </figure>
  );
}

// DECIDED 2026-10-11 (사용자, 스크린숏: "마일스톤에 대한 자세한 설명이 클릭하면 보여지도록"): 일정 카드 바닥의 마일스톤 띠는 누르는 것입니다.
// 누르면 같은 띠 안에 설명이 열리고 다시 누르면 닫힙니다. 띠마다 따로 열립니다. 설명이 없으면 전처럼 글만 있는 띠입니다.
// DECIDED 2026-10-11 (리뷰 A3, A5): id는 useId가 아니라 부르는 쪽이 주는 안정된 값입니다(서버와 클라이언트의 useId가 어긋나
// aria-controls가 없는 id를 가리켰습니다). 설명 문단은 닫혀 있어도 hidden으로 마운트해 둡니다.
// DECIDED 2026-10-22 (사용자: 스와이프할 때 상자 크기가 너무 달라 어색함): 폰 카드에서도 띠를 접어 둡니다(expanded={false}). 다섯 카드가 같은 높이라
// 가장 긴 카드가 짧아야 빈칸이 줄어듭니다. 아래는 그 전의 이유입니다.
// expanded: 폰의 노선도 카드에서는 띠를 누르지 않습니다. 날짜를 눌러 연 카드 안에서 한 번 더 접혀 있던 것(2단 접힘)을 없애고
// 설명 한 문장을 펼쳐 둡니다. 데스크톱 일정 카드의 띠는 전과 같이 누르는 것입니다.
// tone: "plain"은 미션이 아닌 띠입니다(Day 1의 "Day 2에 들고 갈 것"). 같은 자리와 같은 문법이고, 호박색과 ★는 미션에만 씁니다.
// DECIDED 2026-10-17 (사용자: "문장으로 말고, bullet point로, 그리고 제출하는 방법으로"): detail은 문단 하나가 아니라 라벨이 붙은 목록 둘입니다.
// 카드는 가운데 정렬이지만 목록은 글머리가 한 줄로 서야 읽히므로, 목록 묶음만 가운데에 두고 그 안은 왼쪽 정렬입니다.
// 2026-10-19 (시각 감사 6): 열기 전의 시간표 버튼. 흐린 글자만 있는 큰 알약이 고장 난 버튼처럼 보여, 현장 멘토링 상자와 같은
// "아직" 문법(점선 테두리)에 자물쇠를 붙입니다. 새 색과 새 글자 크기는 없습니다.
const LOCKED_CLASS = `w-full cursor-not-allowed justify-center gap-2 !border-dashed !border-white/25 !bg-transparent text-white/70 ${buttonClass("secondary")} hover:!translate-y-0`;
const LOCK_ICON = (
  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
type MilestoneDetail = { label: string; items: string[] }[];
// open, onToggle(2026-10-17): 데스크톱 Day 1~3 판의 세 띠는 함께 열리고 닫힙니다. 한 칸만 열리면 그 줄의 높이가 크게 어긋났습니다.
function MilestoneStrip({ id, label, title, detail, center = false, expanded = false, tone = "amber", open: openProp, onToggle, fill = false, narrow = false }: { id: string; label: string; title: string; detail?: MilestoneDetail; center?: boolean; expanded?: boolean; tone?: "amber" | "plain"; open?: boolean; onToggle?: () => void; fill?: boolean; narrow?: boolean }) {
  const [openSelf, setOpenSelf] = useState(false);
  const open = openProp ?? openSelf;
  const setOpen = (f: (v: boolean) => boolean) => (onToggle ? onToggle() : setOpenSelf(f));
  // DECIDED 2026-10-20 (사용자, hwang 브리프 2.11, 감사 W5, 시각 리뷰 C4): 호박색(amber) 분기를 걷고 모든 띠가 기본 톤입니다. 미션 띠는 ★ 하나로 구별합니다.
  const amber = tone === "amber";
  // DECIDED 2026-10-13 (사용자, 스크린숏: "별, 미션, 이후 공개 이게 다 고려가 되어야 함"): 가운데에 서는 것은 제목 하나가 아니라
  // ★, 라벨, 제목 묶음 전체입니다. 같은 날 앞서 제목만 가운데에 세웠던 것(1fr auto 1fr)을 되돌렸습니다.
  // 위아래는 글자의 잉크로 맞춥니다. 한글은 줄 상자 안에서 위로 붙어 앉고(실측 0.6px) ★의 왼쪽 여백 때문에 묶음이 왼쪽으로 0.75px 치우쳐, 설명이 없는 띠에서는 묶음을 1px 내리고 1px 오른쪽으로 둡니다.
  const head = (
    <>
      <span className={`inline-flex shrink-0 items-center gap-1 ${META} font-bold text-white/70`}>
        {amber && <span aria-hidden>★</span>}{label}
      </span>
      <span className={`${BODY} font-bold leading-snug text-white`}>{title}</span>
    </>
  );
  // 2026-10-19 (시각 감사 5): 가운데 띠는 늘 쌓습니다(★ 미션 / 제목 / 화살표). 제목 길이와 카드 폭에 따라 한 줄로 서던 띠(Day 1, 넓은 Day 4)가 있었습니다.
  const row = `flex w-full items-center gap-x-2.5 gap-y-1 break-keep px-3 py-2 ${center ? "flex-col justify-center" : "flex-wrap text-left"}`;
  return (
    // fill(2026-10-19): 데스크톱 Day 1~3 격자의 띠는 행 높이를 채웁니다. 제목 길이 때문에 화살표가 한 줄에 들어가는 띠만 낮아지던 것.
    <div className={`mt-auto flex w-full flex-col ${expanded ? "border-t border-white/15" : "rounded-xl border border-white/15 bg-white/[0.04]"} ${fill ? "md:mt-[16px]" : ""} ${narrow ? "md:mx-auto md:max-w-[17rem]" : ""}`}>
      {detail && !expanded ? (
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className={`${row} min-h-[44px] flex-1 rounded-xl transition-colors hover:bg-white/[0.06]`}>
          {head}
          <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-white/70 transition-transform ${center ? "" : "ml-auto"} ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
        </button>
      ) : (
        <p className={`${row} min-h-[44px] pb-[7px] pl-[13px] pr-[11px] pt-[9px]`}>{head}</p>
      )}
      {detail && (
        <div id={expanded ? undefined : id} hidden={!expanded && !open} className={`break-keep border-t border-white/10 px-3 py-3`}>
          <div className={`flex w-fit flex-col gap-2.5 text-left ${center ? "mx-auto" : ""}`}>
            {detail.map((g) => (
              <div key={g.label}>
                <p className={`${META} font-bold text-white/85`}>{g.label}</p>
                <ul className={`mt-1 ${BODY} leading-relaxed text-white/85`}>
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2"><span aria-hidden className="text-white/50">•</span><span>{it}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 함께하는 곳 로고의 높이(2026-10-21). 같은 높이면 가로로 긴 워드마크(DRIMAES, Lovable)가 커 보이고 두 줄짜리 마크(팝업스튜디오, Wilt)가
// 작아 보여서, 가로세로 비율로 높이를 나눕니다. 눈에 보이는 면적이 비슷해지는 값입니다.
function partnerLogoHeight(l: { w: number; h: number; square?: boolean }): string {
  if (l.square) return "h-12 sm:h-14"; // 2026-10-21: 크라이치즈버거가 얼굴 아래 글자 두 줄인 판으로 바뀌어 글자가 읽히는 높이로.
  const r = l.w / l.h;
  if (r > 5) return "h-4 sm:h-[1.15rem]";
  if (r > 3.6) return "h-5 sm:h-[1.35rem]";
  if (r > 2.4) return "h-6 sm:h-7";
  return "h-7 sm:h-8";
}

/** 함께하는 곳의 로고 하나. 링크가 있으면 새 탭 링크입니다. h를 주면 비율 높이 대신 그 높이(AXMOS 머리). */
function partnerLogo(l: { name: string; src: string; w: number; h: number; url?: string; square?: boolean }, h?: string) {
  const img = (
    <Image src={l.src} alt={l.name} width={l.w} height={l.h} unoptimized className={`block w-auto ${h ?? partnerLogoHeight(l)} opacity-90`} />
  );
  return l.url ? (
    <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.name} className="tap-44 rounded-sm transition-opacity hover:opacity-100 [&>img]:hover:opacity-100">
      {img}
    </a>
  ) : (
    <span key={l.name}>{img}</span>
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
  const routePanelId = (i: number) => `route-day-${naru.december.stages[i].dayOffset}`;
  // DECIDED 2026-10-19 (사용자, 스크린숏: "너무 내려감", 카드 머리 "DAY 2 확인받기 12.19 토"도 보였으면): Day 2, 3 카드는 화면보다 길어서
  // 카드 하단을 맞추면 머리가 위의 칩 줄 밑으로 들어갔습니다. 하단을 맞추되 카드 머리가 칩 줄(scroll-padding-top, JourneyNav가 실높이로 넣음)
  // 아래 12px보다 위로 올라가지 않는 만큼까지만 내립니다. 스와이프로 날을 바꿨을 때 머리가 이미 위로 지나가 있으면 머리로 되돌립니다.
  const revealPanel = (i: number) => {
    requestAnimationFrame(() => {
      const panel = document.getElementById(routePanelId(i));
      if (!panel) return;
      const r = panel.getBoundingClientRect();
      const pad = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 12;
      const over = Math.min(r.bottom - (window.innerHeight - 63), r.top - pad);
      if (over !== 0 && (over > 0 || r.top < pad)) window.scrollBy({ top: over, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  };
  const selectDay = (i: number) => {
    const opening = openDay !== i;
    setOpenDay(opening ? i : null);
    if (opening) revealPanel(i);
  };
  // DECIDED 2026-10-19 (사용자: "timeline 클릭해야만 움직이는 게 아니고, 스와이핑이 가능했으면"): 폰의 Day 카드를 옆으로 밀면 앞뒤 날로 갑니다.
  // 가로 이동이 48px 이상이고 세로보다 1.5배 클 때만 넘깁니다(세로 스크롤은 그대로). 끝(Day 0, Day 4)에서는 멈춥니다. 닫혀 있으면 아무 일도 없습니다.
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  // DECIDED 2026-10-22 (사용자: "스와이프할 때 넘어가는 애니메이션이 더 있으면"): 카드가 손가락을 따라 끌려오고(dragX), 놓으면 다음 날 카드가
  // 밀어 낸 쪽에서 미끄러져 들어옵니다(slideDir). 끝(Day 0, Day 4)에서는 1/4만 끌리고 제자리로 돌아옵니다. 모션 줄이기에서는 끌림도 미끄러짐도 없습니다.
  const [dragX, setDragX] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1 | 0>(0);
  const prevOpen = useRef<number | null>(openDay);
  useEffect(() => {
    const from = prevOpen.current;
    prevOpen.current = openDay;
    if (from !== null && openDay !== null && from !== openDay) setSlideDir(openDay > from ? 1 : -1);
  }, [openDay]);
  const onSwipeStart = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    swipeStart.current = e.touches.length === 1 ? { x: t0.clientX, y: t0.clientY } : null;
  };
  const onSwipeMove = (e: React.TouchEvent) => {
    const s0 = swipeStart.current;
    if (!s0 || openDay === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t1 = e.touches[0];
    const dx = t1.clientX - s0.x;
    if (Math.abs(dx) < Math.abs(t1.clientY - s0.y)) { setDragX(0); return; }
    const atEdge = (dx > 0 && openDay === 0) || (dx < 0 && openDay === naru.december.stages.length - 1);
    setDragX(atEdge ? dx * 0.25 : dx);
  };
  const onSwipeEnd = (e: React.TouchEvent) => {
    const s0 = swipeStart.current;
    swipeStart.current = null;
    setDragX(0);
    if (!s0 || openDay === null) return;
    const t1 = e.changedTouches[0];
    const dx = t1.clientX - s0.x;
    const dy = t1.clientY - s0.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const next = openDay + (dx < 0 ? 1 : -1);
    if (next < 0 || next >= naru.december.stages.length) return;
    setOpenDay(next);
    revealPanel(next);
  };
  const mentoringBoxes = (
    <>
          {/* DECIDED 2026-10-24 (사용자: "이 부분에 그 내용을 지금 있는 내용 대신 넣자". docs/companies-block-brief.md, lee-review L3 두 청중):
              멘토링 상자 셋 자리에 이슈를 낸 기업의 닷새(이슈가 들어올 때, 닷새 뒤에 남는 기록, 그 다음). 기업이 읽으면 자기 자리인 줄 알되
              "기업에게", "내는 것", "받는 것"처럼 직접 말하지 않습니다(같은 날 사용자: "너무 직접적임").
              내려간 멘토링 문장은 Day 1, Day 2, Day 4 카드가 같은 말을 하고(브리프 1.5), 키는 data/naru.ts에 남겨 두었습니다.
              그 전(2026-10-13 멘토링 브리프 1, D1): 출제사 컨텍스트 / General Mentoring / 현장 멘토링. */}
          {/* DECIDED 2026-10-24 (사용자, 스크린숏: "문제에 들어가는 네 단계와 비슷한 형식으로"): 가운데 정렬 상자 셋을 위 네 단계 표와 같은
              문법으로 바꿨습니다. 왼쪽 정렬 SUBHEADING 소제목, 가는 선 격자(폰 한 단, md부터 세 칸), 칸마다 강조색 META 한 줄(네 단계의
              번호 자리에 기간), BODY 굵은 제목, META 본문. 점선 테두리와 흐린 글자(현장 멘토링의 "미정" 표시)는 내용이 바뀌어 뺐습니다.
              새 글자 크기와 색은 없습니다. 헤더 칩 "이슈"의 앵커(id="mentoring")는 소제목에 있습니다. */}
          <h3 id="mentoring" className={SUBHEADING}>{t(naru.december.forCompanies.label)}</h3>
          <ol role="list" className="mt-[16px] grid border-t border-white/10 md:grid-cols-3">
            {naru.december.forCompanies.boxes.map((b, i) => (
              <li key={i} className={`flex flex-col items-start gap-[12px] border-b border-white/10 px-[12px] py-[24px] sm:px-[16px] ${i > 0 ? "md:border-l" : ""}`}>
                <span className={`${META} font-bold text-accent`}>{t(b.when)}</span>
                <span className={`break-keep ${BODY} font-bold text-white`}>{t(b.name)}</span>
                <span className={`break-keep ${BODY} leading-normal text-white/70`}>{t(b.body)}</span>
              </li>
            ))}
          </ol>
          {/* 1.3의 상자 아래 한 줄(forCompanies.limit)은 2026-10-24 사용자("일단 이거는 제외")로 그리지 않습니다. */}
          {/* 2026-10-24 (사용자: "줄로 넣지 말고 상자 안 내용으로"): 멘토 세 줄과 기업의 두 가지는 표 아래 줄이 아니라 위 세 칸의 글에 들어 있습니다. */}
          {/* 재는 것. 호박색 강조 상자(8월 "준비물은 하나예요" 문법).

              2026-09-20 (사용자: "가장 중요한 것은 완주율이라는 거를 강조"): 라벨과
              문장을 한 줄에 "라벨: 문장"으로 붙여 두었더니, 이 챕터에서 가장 중요한
              문장이 각주처럼 읽혔습니다. 라벨을 자기 줄로 올리고 문장을 본문 크기로
              키웁니다. 상자 색과 문법은 그대로예요. 새 강조 장치를 만들지 않습니다.

              처음에는 이 자리에 "84%" 같은 수치를 크게 세우려고 했는데 걷었습니다.
              퍼센트를 한 번 적으면 그 수치가 목표가 되고, 다음 회차는 그 수치를
              지키려고 설계하게 됩니다(data/naru.ts의 measure 주석). */}
    </>
  );
  // DECIDED 2026-10-11 (사용자, 스크린숏: "너무 한 줄이어서 가독성이 없음. Day 0, 그 아래에 2x2 테이블로"): 일정은 다섯 행 한 기둥이
  // 아니라 Day 0 한 장과 그 아래 Day 1부터 Day 4의 두 칸 두 줄입니다(md부터 두 칸).
  // DECIDED 2026-10-11 (사용자, 같은 날 뒤: "visually 눈에 잘 들어오지 않음"): 헤어라인 칸을 카드로 바꿨습니다. 글자 크기는 그대로 셋이고
  // (2026-10-07), 눈에 걸리는 자리를 둘로 줄였습니다: 위의 DAY 알약과 제목, 아래 끝의 마일스톤 띠. 그날의 한 줄은 굵기를 내렸습니다.
  // 마일스톤 띠는 카드 바닥에 붙어(mt-auto) 옆 카드와 같은 높이에 섭니다. Day 1의 /match 버튼은 히어로로 갔습니다.
  // DECIDED 2026-10-21 (2차): 일정 h3 아래 날짜별 제목은 h4입니다. 폰 패널의 기존 펼침 동작은 유지합니다.
  // Day 1~3이 함께 쓰는 버튼 하나(2026-10-17). 페이지 안에서 날을 고릅니다. 열기 전에는 잠겨 있습니다(TIMETABLE_OPEN).
  const [stripsOpen, setStripsOpen] = useState(false);
  const sharedCta = naru.december.stages[1].timetableCta;
  const timetableButton = sharedCta && (
    <div>
      {TIMETABLE_OPEN ? (
        <Link href="/crossing/team" className={`group w-full justify-center ${buttonClass("secondary")}`}>
          {t(sharedCta.label)}<span aria-hidden className={ARROW_CLASS}>→</span>
        </Link>
      ) : (
        <span role="link" aria-disabled="true" className={LOCKED_CLASS}>{LOCK_ICON}
          {t(sharedCta.label)}
        </span>
      )}
    </div>
  );
  // DECIDED 2026-10-21: 패딩은 그룹이 맡고 단계는 행 간격만 둡니다. 열 사이 gap 32px + 선 안쪽 16px = 기존 48px.
  // DECIDED 2026-10-21: 글 행 24px, 미션 앞 24+16px, 공통 버튼 앞 48px로 서로 다른 묶음을 구분합니다.
  // sub: 데스크톱 Day 1~3 줄의 카드(2026-10-19). 카드가 부모 격자의 행을 나눠 써서(subgrid) 한 줄, 세션, 칩, 미션이 세 카드에서 같은 높이에 섭니다.
  const stageCard = (stage: (typeof naru.december.stages)[number], i: number, inPanel = false, sub = false) => {
    const StageHeading = "h4";
    // 데스크톱의 Day 1~3 띠는 함께 열립니다. 폰 패널과 Day 4는 각자.
    // DECIDED 2026-10-22 (사용자: "아직 비어 있는 느낌, 상자를 세로로 줄여줘"): 폰 카드는 줄 사이 12px, 안쪽 여백 20px.
    const sync = !inPanel && i >= 1 && i <= 3 ? { open: stripsOpen, onToggle: () => setStripsOpen((v) => !v) } : {};
    return (
    <div
      key={stage.name.en}
      // 노선도의 현재 위치 점이 이 카드로 옵니다(감사 반영 브리프 3.6).
      onMouseEnter={() => setHoverDay(i)}
      onMouseLeave={() => setHoverDay(null)}
      className={`flex flex-col ${inPanel ? "gap-[12px]" : "gap-[20px] md:gap-[24px]"} items-center text-center ${sub ? "py-0 md:row-span-5 md:grid md:grid-rows-subgrid md:items-stretch md:border-l md:border-white/10 md:pl-[16px] md:first:border-l-0 md:first:pl-0" : inPanel ? "rounded-2xl border border-white/10 bg-[#0B1430]/70 px-[20px] py-[20px]" : `px-[22.5px] py-[28px] sm:px-[24px] sm:py-[32px] lg:px-[27px] ${i === 0 ? "border-b border-white/10" : "border-t border-white/10"}`} ${!inPanel && (i === 0 || i === naru.december.stages.length - 1) ? "md:col-span-3" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-[8px]">
        {/* lang="en": DAY는 두 로케일 모두 영어입니다(접근성 감사 7). */}
        {/* DECIDED 2026-10-20 (hwang 브리프 2.5, 감사 W4): 알약을 걷고 글자만. 알약은 누르는 것에만 씁니다. */}
        <span lang="en" className={`${META} font-bold text-accent`}>
          {`${t(naru.december.dayLabel)} ${stage.dayOffset}`}
        </span>
        <StageHeading className={ROW_HEADING}>{t(stage.title)}</StageHeading>
        <span className={`${META} text-white/70`}>{formatDecemberDayWithWeekday(locale, stage.dayOffset)}</span>
      </div>
      {/* stage.body는 그리지 않습니다(2026-09-20). 키는 data/naru.ts에 그대로 있습니다. */}
      <p className={`mx-auto max-w-3xl break-keep ${BODY} font-medium leading-relaxed text-white/85`}>{t(stage.line)}</p>
      {stage.session && (
        <p className={`break-keep ${BODY} leading-relaxed text-white/70`}>
          <span className={`mr-1.5 ${META} font-semibold uppercase ${latinTrack(locale)} text-white/70`}>{t(naru.december.sessionLabel)}</span>
          {/* lang="en" (2026-10-11, 리뷰 작은 것): 세션 이름 셋은 두 로케일 모두 영어입니다. */}
          <span lang="en" className="mr-1.5 font-semibold text-white/85">{t(stage.session.title)}</span>
          {t(stage.session.body)}
        </p>
      )}
      {/* DECIDED 2026-10-22 (사용자: "상자 사이즈는 동일한데, 내용이 안 비어 있게"): 폰 카드에서 세션이 없는 날(Day 0, Day 4)은 세션 자리에
          그날의 진행(stage.body)을 그립니다. 새 글이 아니라 9/20부터 그리지 않던 키입니다. 데스크톱은 그대로. */}
      {/* 같은 날 이어서(사용자: "전체 상자의 세로 크기를 줄여줘"): Day 4는 자기 한 줄과 투표 버튼으로 이미 차서 Day 0에만 그립니다. */}
      {inPanel && !stage.session && (i === 0 || stage.panelBody) && (
        <p className={`break-keep ${BODY} leading-relaxed text-white/70`}>{t(stage.panelBody ?? stage.body)}</p>
      )}
      {stage.chips.length > 0 ? (
        // 폰 카드에서 띠가 없는 날(Day 0, Day 4)은 칩 줄을 바닥으로 내려(mt-auto) 다른 날의 미션 띠와 같은 자리에 둡니다(2026-10-22).
        <p className={`flex flex-wrap justify-center gap-x-3 gap-y-1 ${META} text-white/70 ${inPanel && !stage.milestone && !stage.submit ? "mt-auto" : ""}`}>
          {stage.chips.map((c, j) => <span key={j}>{t(c)}</span>)}
          {/* DECIDED 2026-10-22 (사용자: Analytics 개선 4번 "적용"): 10/18 결정문은 "/match는 Day 1 카드의 matchCta가 잇는다"였는데 그리지 않고
              있었습니다(30일 /match 13명). 히어로 버튼 둘은 그대로 두고, 팀 구성 칩 옆에 글자 링크로 섭니다. */}
          {stage.matchCta && (
            <Link
              href={stage.matchCta.href}
              onClick={() => track("naru_cta", { src: inPanel ? "day1-phone" : "day1", to: "match" })}
              className="tap-44 font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-white"
            >
              {t(stage.matchCta.label)} <span aria-hidden>→</span>
            </Link>
          )}
        </p>
      ) : sub && <span aria-hidden />/* 칩이 없는 날도 행 하나를 차지해야 아래 미션이 옆 카드와 같은 행에 섭니다 */}
      {/* 그날의 마일스톤. amber 띠(홈에서 "결과보다 과정"이 쓰던 색)가 카드 바닥에 섭니다. Day 0에는 없습니다. */}
      {/* DECIDED 2026-10-13 (사용자, 스크린숏: "1일차 박스가 너무 비어있음"): 미션이 없는 Day 1은 같은 자리에 무채색 띠를 세웁니다.
          그날 쓰는 한 장(stage.submit)이 Day 2에 멘토에게 들고 가는 것이라는, 이미 있는 사실입니다. 호박색과 ★는 미션에만 씁니다. */}
      {!stage.milestone && stage.submit && (
        // DECIDED 2026-10-17 (사용자: "똑같이. 상자 색깔로 동일하게"): Day 1 띠도 호박색과 ★, 라벨 "미션"입니다. 2026-10-13의 "호박색과 ★는 미션에만"을
        // 이 결정이 바꿉니다. 그 전 라벨 "Day 2에 들고 갈 것"은 두 줄로 꺾여 Day 2, 3 띠보다 높았습니다.
        // DECIDED 2026-10-19 (사용자: "1일차랑 4일차에는 미션을 빼자", 답: 미션 아닌 띠로 남김): Day 1 띠는 다시 무채색, ★ 없음, 라벨 "Day 2에 들고 갈 것".
        // 2026-10-17의 호박색 미션 띠를 되돌립니다. 띠는 이제 늘 쌓은 모양이라 그때의 두 줄 꺾임 문제는 없습니다.
        <MilestoneStrip id={`carry-day-${stage.dayOffset}${inPanel ? "-phone" : ""}`} tone="plain" label={t(naru.december.carryLabel)} title={t(stage.submit)} center expanded={false} fill={sub}
          {...sync}
          detail={[
            { label: t(naru.december.carryDetail.todoLabel), items: naru.december.carryDetail.todo.map(t) },
            { label: t(naru.december.carrySubmitLabel), items: naru.december.carryDetail.submit.map(t) },
          ]} />
      )}
      {stage.milestone && (
        <MilestoneStrip id={`milestone-day-${stage.dayOffset}${inPanel ? "-phone" : ""}`} label={t(naru.december.milestoneLabel)} title={t(stage.milestone)} detail={stage.milestoneDetail && [
          { label: t(naru.december.milestoneConditionsLabel), items: stage.milestoneDetail.conditions.map(t) },
          { label: t(naru.december.milestoneSubmitLabel), items: stage.milestoneDetail.submit.map(t) },
        ]} center expanded={false} fill={sub} narrow={!inPanel && i === naru.december.stages.length - 1} {...sync} />
      )}
      {/* DECIDED 2026-10-22 (사용자: "상자 사이즈는 동일한데, 내용이 안 비어 있게"): 폰 카드 안의 "멘토 시간표와 미션 인증" 버튼을 뺐습니다.
          Day 1~3이 같은 버튼이라 데스크톱처럼 상자 아래에 한 번만 섭니다(아래 below). 카드가 짧아져 다섯 카드의 높이 차가 줄어듭니다. */}
      {/* DECIDED 2026-10-19 (사용자): Day 4 카드의 인기투표 버튼. 데스크톱과 폰 패널 모두 카드 안에 섭니다. 열기 전에는 잠긴 버튼입니다. */}
      {stage.voteCta && (
        <div className={`w-full ${inPanel ? "" : "md:max-w-sm"}`}>
          {VOTE_BUTTON_OPEN ? (
            <Link href={stage.voteCta.href} className={`group w-full justify-center ${buttonClass("secondary")}`}>
              {t(stage.voteCta.label)}<span aria-hidden className={ARROW_CLASS}>→</span>
            </Link>
          ) : (
            <>
              <span role="link" aria-disabled="true" className={LOCKED_CLASS}>{LOCK_ICON}
                {t(stage.voteCta.label)}
              </span>
              {/* 2026-10-22 (UX 점검): 잠긴 버튼이 언제 열리는지 한 줄. */}
              {stage.voteCta.lockedNote && <p className={`mt-[8px] ${META} text-white/70`}>{t(stage.voteCta.lockedNote)}</p>}
            </>
          )}
        </div>
      )}
    </div>
    );
  };
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
    <main id="main" tabIndex={-1} className="naru-min12 naru-home-v2 focus:outline-none">
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
      {/* 2026-10-13 (등록 브리프 2.2): xl 아래에서는 레일이 스크롤 0부터 헤더의 둘째 줄로 서므로 그 높이(54px)만큼 위 여백을 더합니다.
          xl부터는 전과 같습니다(pt-28). */}
      {/* 2026-10-08 (사용자: "크로싱 서울이 너무 위에 있다"): lg의 위 여백을 한 단 늘렸습니다(pt-20 → pt-28). 로고가 헤더에
          바로 붙어 있었습니다. 카운트다운 띠까지 1440×900 한 화면에 들어오는 선에서입니다. */}
      {/* DECIDED 2026-10-22 (사용자, 스크린숏: "여기는 kwan 전의 version으로 되돌려줘"): 히어로(이 챕터, CountdownPanel, HeroPhotos)는
          kwan-design 합치기(a032318) 전의 8784ca1 그대로입니다. 아래 챕터의 kwan 간격 정리는 그대로 둡니다. */}
      <Chapter id="top" labelledBy="hero-title" align="center" wide className="pt-28 sm:pt-36 lg:pt-40 xl:pt-28">
        {/* relative는 2026-09-17에 framer-motion의 useScroll target 경고 때문에
            붙었습니다. 그 훅은 2026-09-20에 사라졌지만 클래스는 둡니다. 히어로가
            앉는 쌓임 맥락이고, 빼는 것은 아무도 요청하지 않은 레이아웃 변경입니다. */}
        {/* DECIDED 2026-10-08 (사용자, 스크린숏: "로고, 타이머, 사진, 설명이 display 되어 있는 방식이 모두 어색함"): 히어로 정리.
            ① 두 단의 윗선을 맞춥니다(가운데 정렬이라 사진 단이 로고보다 아래에서 시작했습니다).
            ② 사진 넷은 엇갈림 없이 반듯한 2×2, 캡션은 바로 아래.
            ③ 버튼 둘은 한 줄에 붙이고, 안내 한 줄은 버튼 줄 아래에(전에는 첫 버튼 아래라 둘째 버튼이 밀렸습니다).
            ④ 카운트다운은 왼쪽 단에서 꺼내 두 단 아래의 가로 띠 하나로. 숫자 옆에 단위, xl부터 서울과 싱가포르가
               한 줄에 나란히. 왼쪽 단 안에서는 TITLE 숫자 두 줄이 단을 다 차지해 설명보다 무거웠습니다.
            폰은 순서 그대로입니다(카피, 버튼, 카운트다운, 사진). */}
        <div className="relative grid items-start gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:px-0">
          {/* DECIDED 2026-10-08 (사용자, 스크린숏: "여기를 이 공간에서 centralize, 그 아래 버튼들도 같이"): 왼쪽 단의 글 묶음
              (알약, 로고, 날짜, 한 줄, 설명, 버튼 둘, 안내)은 그 단 안에서 가운데입니다. 폰에서도 가운데입니다
              (가운데인 블록은 폰에서도 가운데, 2026-10-02). 9월 29일의 "글은 하나의 왼쪽 끝"에서 히어로 왼쪽 단은 예외가 됩니다. */}
          {/* 같은 날 (사용자, 스크린숏: "크로싱 서울이 너무 위에 있다", "내용이 저 공간들을 좀 더 채워줄 수 있으면", "영어 버전은
              더 비워져 있음"): lg부터 이 단은 사진 단의 세로 가운데에 섭니다(lg:self-center). 그리고 묶음 사이(로고와
              날짜, 설명과 버튼)를 벌려 사진 단의 높이를 채웁니다. 글자 크기는 셋 그대로라 크기로 채우지 않습니다.
              그 전에는 윗선에 붙어 있어 로고가 화면 꼭대기에 닿고 아래가 비었습니다. */}
          <div className="text-center lg:self-center lg:pl-10 xl:pl-16">
            {/* DECIDED 2026-10-08 (사용자: "나루 2026 서울이라는 내용을 그냥 빼줘"): 히어로의 알약 라벨(eventHero.eyebrow)은
                그리지 않습니다. 로고가 첫 줄입니다. 키는 data/naru.ts에 그대로 둡니다. */}
            {/* 2행은 그라데이션 토큰(GRADIENT_TEXT). ko는 "크로싱 서울" / "CROSSING SEOUL", en은 "CROSSING" / "SEOUL".
                DECIDED 2026-10-07 (이슈 브리프 4.1): 크기는 TITLE 하나입니다. 챕터 h2, 카운트다운 숫자와 같은 값이고,
                그 전의 히어로 전용 clamp(최대 86.4px)와 2행의 0.82em은 없습니다. 한 화면의 글자 크기가 셋을 넘지
                않게 하려는 것입니다(components/ui/typography.ts). 390px에서 두 줄 모두 한 줄에 들어갑니다. */}
            {/* DECIDED 2026-10-11 (사용자, 스크린숏: "좀 더 로고가 크면 좋겠어", 이어서 "둘다 사이즈가 동일해야함"): 히어로의 로고는 TITLE의 1.25배입니다
                (폰 45px, 데스크톱 84px). 한국어 화면과 영문 화면이 같은 크기입니다. 영문은 글자가 길어 이 크기에서 두 줄로 접힙니다.
                한 화면의 글자 크기는 셋이라는 규칙(2026-10-07)에서 이 로고 하나만 예외입니다. 글이 아니라 표식입니다. 다른 자리에 이 크기를 쓰지 마세요. */}
            <h1 id="hero-title" className="text-[clamp(2.5rem,6.875vw,4.6875rem)] font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_40px_rgba(75,58,140,0.5)]">
              {/* DECIDED 2026-10-08 (사용자: "영문 화면에도 같은 로고로", 이어서 "영어 crossing seoul 로고로 바꿨으면"):
                  영문 화면의 로고는 영문입니다. 큰 글자가 "CROSSING SEOUL"이고 같은 그라데이션을 씁니다. 한글 줄은
                  영문 화면에 보이지 않습니다(나루 락업의 규칙과 같아졌습니다). 영문 로고 파일이 따로 없어서 한국어
                  로고의 큰 줄 문법(굵기, 자간, 그라데이션)을 그대로 옮긴 것이고, 작은 둘째 줄은 두지 않습니다.
                  글자 크기가 TITLE 하나라 좁은 기둥에서는 두 줄로 접힙니다. */}
              {DECEMBER_EVENT_NAME && locale === "en" ? (
                <span lang="en" className="gradient-text block bg-[linear-gradient(90deg,#9AA8EE_0%,#A99AD6_35%,#C99ACB_68%,#E08A76_100%)] bg-clip-text pb-[0.08em] tracking-[-0.02em] text-transparent">{DECEMBER_EVENT_NAME.en}</span>
              ) : DECEMBER_EVENT_NAME ? (
                <>
                  {/* DECIDED 2026-10-08 (사용자, 로고 스크린숏: "이걸로 써줘"): 히어로 제목은 마케팅 포스트의 크로싱 서울 로고
                      모양입니다. 큰 한글 "크로싱 서울"에 그라데이션, 그 아래 가운데에 영문 "CROSSING SEOUL"을 넓은 자간으로.
                      같은 날 (사용자, 스크린숏: "너무 싫음, background가 동일해야지"): 크림색 판은 쓰지 않습니다. 바탕은
                      사이트의 어두운 바탕 그대로입니다. **이 자리에 밝은 판이나 상자를 다시 두지 마세요.**
                      로고의 원래 색(남색 #12246B에서 자주 #845185, 영문 테라코타 #9A3324)은 어두운 바탕에서 보이지 않아
                      (남색 1.4:1) 같은 색상의 밝은 틴트로 옮겼습니다: 남색 틴트 #9AA8EE에서 자주 틴트 #C99ACB, 영문은
                      테라코타 틴트 #E08A76. 로고의 색이라 "주황은 점으로만" 규칙의 대상이 아닙니다.
                      영문 줄은 BODY 크기라(2026-10-20부터) 한 화면의 글자 크기는 그대로 셋입니다. gradient-text는 clip이 안 되는
                      브라우저의 단색 폴백 표식입니다(globals.css). */}
                  {/* DECIDED 2026-10-11 (사용자, 네 안의 스크린숏에서 B를 고름: "로고가 색깔이 더 다양하면"): 로고의 그라데이션은 두 색에서 네 색으로.
                      남색 틴트 #9AA8EE, 보라 #A99AD6, 자주 틴트 #C99ACB, 테라코타 틴트 #E08A76(0, 35, 68, 100%). 끝 색이 아래 영문 줄과 같습니다.
                      헤더의 워드마크와 /naru의 돌아가기도 같은 그라데이션입니다(JourneyNav). 정본은 docs/brand.md의 "색". */}
                  <span className="inline-block">
                    <span lang="ko" className="gradient-text block break-keep bg-[linear-gradient(90deg,#9AA8EE_0%,#A99AD6_35%,#C99ACB_68%,#E08A76_100%)] bg-clip-text pb-[0.08em] tracking-[-0.02em] text-transparent">{DECEMBER_EVENT_NAME.ko}</span>{" "}
                    {/* lang="en" (2026-09-19, 접근성 감사 7): 한국어 TTS가 영문을 한글 음가로 읽지 않게. 사이의 {" "}는
                        이름 계산용입니다(감사 17). pl은 자간만큼 왼쪽을 밀어 가운데를 맞춥니다(끝 글자 뒤의 자간).
                        폰에서는 자간을 좁힙니다: 한글이 36px라 0.55em이면 영문이 한글보다 넓어져 한글이 왼쪽 끝에서 밀립니다. */}
                    {/* 2026-10-08 (히어로 정리): 영문 줄의 양 끝을 한글 줄의 양 끝에 맞춥니다(글자를 고르게 벌려 폭을 같게).
                        가운데 정렬이면 왼쪽 정렬된 히어로에서 영문만 안쪽으로 들어가 보였습니다. 읽는 글은 sr-only 한 줄입니다. */}
                    {/* DECIDED 2026-10-20 (사용자, 스크린숏: "아래에 crossing seoul은 전처럼 좀 space 되게"): hwang 브리프 2.1의 한 줄(자간 0)을 되돌려
                        영문 줄의 양 끝을 한글 줄의 양 끝에 맞춥니다(2026-10-08 그대로). */}
                    {/* DECIDED 2026-10-20 (사용자, 스크린숏: "아래에 있는 CROSSING SEOUL 이 너무 작네"): 영문 줄은 META에서 BODY로
                        (폰 15.75px, 데스크톱 18px). 새 크기를 만들지 않으려고 이미 있는 BODY를 씁니다. 한 화면의 크기는 그대로 셋입니다. */}
                    <span lang="en" className={`mt-1 flex justify-between ${BODY} font-bold uppercase leading-none text-[#E08A76] sm:mt-2`}>
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
            {/* 굵은 기간 줄. 8월의 "2026.08.22 – 08.29 8일" 자리. */}
            {/* 2026-09-18 (감사 반영 브리프 1.5): 주황 틴트 → 흰색 볼드. 주황은 점으로만. */}
            {/* DECIDED 2026-10-11 (사용자: "로고랑 아래 내용의 gap이 조금 더 줄어들어도"): 로고와 날짜 줄 사이를 36/63px에서 27/36px로.
                로고가 커진 만큼 간격이 줄어 아래 버튼과 카운트다운의 자리는 거의 그대로입니다. */}
            <p className={`mt-6 ${BODY} font-bold text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] lg:mt-8`}>
              {formatDecemberDateLine(locale)}
            </p>
            <p className={`mx-auto mt-4 max-w-xl break-keep ${BODY} font-bold leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]`}>
              {t(naru.december.heading)}
            </p>
            <p className={`mx-auto mt-3 max-w-xl text-balance break-keep ${BODY} leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]`}>
              {/* 나루 한 문장이 서술 첫 줄(감사 반영 브리프 1.2). TODO: confirm(문구는 사용자가). */}
              {/* DECIDED 2026-10-13 (등록 브리프 2.3): 이 문장의 "나루"는 링크가 아닙니다. 2026-10-10에는 색만 다른 인라인 링크였는데,
                  /naru로 가는 길은 헤더의 페이지 칩과 홈 끝의 티저 버튼이 맡습니다. 본문 인라인 링크는 밑줄 하나로 통일합니다. */}
              <span className="text-white">{t(naru.eventHero.naruLine)}              </span>{" "}
              {t(naru.eventHero.sub)}
            </p>
            {/* DECIDED 2026-10-11 (사용자, 스크린숏: "여기에 있으면 좋겠음. 2x2, 버튼 별 사이즈는 똑같이"): AI 유형 테스트 버튼이 일정표의
                Day 1에서 여기로 왔습니다. 버튼 넷이 두 칸 두 줄로 서고, 격자가 칸을 늘려 넷의 크기가 같습니다(글은 가운데).
                폰은 한 칸이고 "프로그램 보기"는 전처럼 폰에서 숨깁니다. */}
            <div className={`mx-auto mt-10 grid w-fit max-w-full grid-cols-1 gap-3 ${regState === "not_open" ? "" : "sm:grid-cols-2"} lg:mt-14 [&>*]:justify-center [&>*]:whitespace-nowrap max-sm:[&>*]:whitespace-normal`}>
              {regState === "open" ? (
                <button type="button" onClick={() => { track("naru_cta", { src: "hero", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
                  {t(registerCopy.cta)}
                  <span aria-hidden className={ARROW_CLASS}>→</span>
                </button>
              ) : regState === "closed" ? (
                <span className={`${buttonClass("secondary")} cursor-default !text-white/70`}>{t(registerCopy.closed)}</span>
              ) : null
                // DECIDED 2026-10-20 (사용자, hwang 브리프 3.7, 감사 W11): 열리기 전의 "등록 폼 미리 보기"(제출할 수 없는 폼)를 내렸습니다.
                // 열리기 전에 알릴 것(혼자 등록, 조건 없음)은 아래 한 줄이 말하고, 버튼은 오픈채팅 하나입니다.
                // PreparingButton과 모달의 미리 보기 분기, registerCopy.preview* 키는 남깁니다.
              }
              {/* DECIDED 2026-10-08 (사용자: "오픈채팅 - 열어줘"): 등록이 열리기 전에도 학생이 지금 할 수 있는 일이
                  히어로에 하나 있어야 합니다. 미리 보기 버튼은 제출이 막혀 있어 흔적을 남길 수 없었습니다.
                  links.openChat이 비어 있으면 OpenChatLink가 스스로 숨습니다. 마감 뒤에는 그리지 않습니다. */}
              {regState !== "closed" && (
                // 등록이 열리기 전에는 이 링크가 히어로의 주 CTA입니다(그라데이션 필). 히어로의 주 CTA는 언제나
                // 하나라는 규칙대로, 등록이 열리면 등록 버튼이 그 면을 받고 이 링크는 유령 필로 내려갑니다.
                regState === "open"
                  ? <OpenChatLink t={t} src="naru-hero" label={openChatLabels.join} variant="secondary" className={HERO_BUTTON_GROUND} />
                  : <OpenChatLink t={t} src="naru-hero" label={openChatLabels.december} variant="hero" />
              )}
              {/* DECIDED 2026-10-18 (사용자, 스크린숏: "중요한 버튼 2개만 남겨줘"): "프로그램 보기"(#december)와 "AI 유형 테스트"(/match)를 뺐습니다.
                  남는 둘은 등록과 소식 받기, 신청으로 가는 길입니다. /match는 등록 완료 화면과 Day 1 카드의 matchCta가 잇고,
                  #december는 스크롤 바로 아래입니다. 아래 matchNote 줄도 버튼과 함께 내렸습니다. 키(ctaProgram, ctaMatch, matchNote)는 둡니다. */}
            </div>
            {/* DECIDED 2026-10-12 (등록 브리프 1.2, 리뷰 S1 S3): 언제 열리는지, 혼자 등록해도 되는지, 전공과 코딩 경험이 조건인지가
                첫 화면 안에서 답해집니다. DECIDED 2026-10-13 (사용자: "너무 길어"): 한 줄(registerNoteShort)입니다. 전부는 모달에(2026-10-13부터 등록 블록은 스크리닝 한 줄만). */}
            {regState === "not_open" && (
              <p id="hero-register-note" className={`mt-3 text-balance break-keep ${META} leading-snug text-white/85`}>{t(registerNoteShort)}</p>
            )}
          </div>
          {/* 오른쪽 단 = 8월 행사 사진 넷 (DECIDED 2026-09-17, 사용자). 8월 히어로의
              메탈 휴먼 자리입니다. 사람이 많이 나온 장면만, 같은 사진은 사이트에 한 번.
              그 전의 형상 무대(싱가포르·서울 점, 배경 수정 브리프)는 같은 날 걷었습니다.
              lg부터만. */}
          {/* desktopOnly: 이 묶음은 hidden lg:block이라 폰에서는 그리지 않는데,
              priority가 걸려 있어 폰이 보지도 않을 이미지 둘을 preload 했습니다
              (2026-09-19, 접근성 감사 22). 느린 회선에서 히어로가 늦게 뜨면
              접근성 체감에도 영향이 있습니다. 아래 폰용 묶음이 priority를 맡습니다. */}
          <div className="hidden lg:block lg:pr-10 xl:pr-16">
            <HeroPhotos photos={naru.eventHero.photos} t={t} desktopOnly />
          </div>
        </div>
        {/* 카운트다운 띠(lg부터). 두 단과 같은 좌우 여백이라 로고의 왼쪽 끝, 사진의 오른쪽 끝과 맞습니다. */}
        <div className="hidden lg:block lg:px-10 xl:px-16">
          <CountdownPanel t={t} locale={locale} className="mt-8" />
        </div>
        {/* 폰(lg 아래): 카피 바로 다음에 사진 넷(2×2), 그 아래 카운트다운. */}
        {/* 폰(lg 아래): CTA → 카운트다운 한 줄 → 사진 넷. 데스크톱(왼쪽 단 CTA 아래)과 같은
            순서(모바일 수정 브리프 2). */}
        <div className="px-6 sm:px-10 lg:hidden">
          <CountdownPanel t={t} locale={locale} className="mt-8" />
          <HeroPhotos photos={naru.eventHero.photos} t={t} className="mt-6" />
        </div>
      </Chapter>

      {/* ── CH1 · 닷새의 모양 (DECIDED 2026-09-17, 홈 흐름 재배치 브리프) ──
          히어로 바로 아래로 올라왔습니다. 히어로의 주 CTA "프로그램 보기"가 여기에
          착지합니다. 내용과 순서는 그대로, 자리만 바뀌었습니다. 아래는 그 전의 주석.
          ── CH2 · 프로그램 (DECIDED 2026-09-17 2차) ────────────────────────
          12월 상세. 8월 사이트의 격식(프로그램 · 멘토링 · 달라지는 것)을
          따릅니다. 출처는 빌더톤_2회차_기획.pdf. 카피 위치와 출처 매핑은
          data/naru.ts의 december 블록 주석에 있습니다.

          순서: 모양(숫자 여섯) → 왜 서울인가 → 아쉬웠던 넷과 답 → 일정 →
          멘토링(+ 약속이 지켜지는 지점, 재는 것) → 미정 → 문. 8월 사이트가
          소개 → 프로그램 → 멘토링 → FAQ 순이었던 것과 같은 호흡입니다.

          ⚠️ draftNote를 떼지 마세요. 확정된 것은 이름, 기간, 도시뿐입니다.
          기본 이음매(216px). 장이 바뀌는 자리는 #naru입니다. */}
      {/* 8월 프로그램 챕터의 격식(2026-09-17, 8월 문법 브리프): 섹션 띠(BAND_TINT),
          주황 글자 아이브로 + 발광 H2 + 리드, 숫자 둘, 노선도, 데이 카드 다섯,
          강조 상자(초록·호박), 번호 배지 카드, 플로우 스트립, CTA. 내용과 순서는
          5차 그대로이고 바뀐 것은 보이는 문법입니다.
          DECIDED 2026-09-28 (사용자: 서울과 싱가포르가 보일 때 "너무 어두워서 잘 안보이는 때가 있음"):
          섹션 띠(BAND_TINT)를 걷습니다. 50% 막이라 #december 안의 틈(데스크톱에서 서울이 보이는 유일한
          틈)에서 서울이 절반 밝기였습니다(실측: 캔버스 대비 0.55). 글 뒤는 읽기 판이 가라앉히므로 띠가
          맡던 가독성은 판이 대신합니다. /2026-08의 띠는 그대로입니다(components/shared/Band.tsx). */}
      <Chapter id="december" labelledBy="december-title" align="center" contentSized>
        <PlateSegment id="december">
        {/* DECIDED 2026-10-21 (2차, brand 2장): 짧은 소개 다음에 전체 일정이 오고, 운영 설명은 일정 뒤 한 묶음으로 읽습니다. */}
        <h2 id="december-title" className={`${H2} ${READ} text-balance text-center`}>{t(naru.december.programHeading)}</h2>
        <p className={`${READ} ${READ_MEASURE_C} mt-[27px] break-keep text-center ${BODY} leading-relaxed text-white/85`}>{t(naru.december.approachClose)}</p>
        <Reveal id="schedule" className={`${WIDE} mt-[45px] text-center lg:mt-[48px]`}>
          <div className={READ}>
            <h3 data-subheading className={SUBHEADING}>{t(naru.december.scheduleLabel)}</h3>
            <p className={`${MEASURE_C} mt-[16px] break-keep ${BODY} leading-relaxed text-white/70 sm:mt-[24px]`}>
              {t(naru.december.scheduleLead)}
            </p>
          </div>
          <div className="mt-[36px]">
          {/* data-center-zone: 노선도와 범례는 그림이라 가운데를 씁니다(왼쪽 끝 브리프 2.2). */}
          {/* DECIDED 2026-10-22 (사용자: "12월 이벤트 스케줄 swipe 할 때는 다른 one pager로 이동은 하면 안 됨"): 노선도와 Day 카드에서 시작한
              손짓은 페이지 스와이프(components/shared/PageSwipe.tsx)가 듣지 않습니다. 여기서는 Day 카드만 넘어갑니다. */}
          <div data-center-zone="routemap" data-no-page-swipe="">
          <RouteMap
            ariaLabel={t(naru.december.routeAria)}
            stations={naru.december.stages.map((s, i) => ({
              key: s.name.en,
              // 2026-09-20 (일정 브리프 2장): 12/10이 Day 0입니다. dayOffset이 곧 Day 번호이고
              // +1을 더하지 않습니다. null 분기("본 일정 전")는 사라졌습니다.
              sub: `${t(naru.december.dayLabel)} ${s.dayOffset}`,
              label: t(s.title),
              // DECIDED 2026-10-11 (사용자: "각 날마다 이제 제출물 / milestone이 있는거임"): 마일스톤은 Day 1부터 Day 4까지 날마다 있습니다.
              // 이틀에만 달리던 "제출" 배지는 그래서 뺐습니다.
              // DECIDED 2026-10-11 (사용자, 스크린숏: "다 별이니까 이상한데"): 그 넷에 전부 ★를 달았더니 별이 아무것도 가리키지 않았습니다.
              // ★는 종착역(마지막 날, 성과 공유회) 하나에만 남기고, 마일스톤이 있는 나머지 날은 ◉입니다. Day 0은 전처럼 빈 점.
              // DECIDED 2026-10-15 (사용자, 스크린숏: "day 1 circle 에도, day 2 and 3 와 같은 강조"): Day 1도 ◉입니다.
              // 미션은 여전히 Day 2부터라 Day 1 아래 미션 줄은 없습니다. 빈 점은 Day 0 하나.
              kind: i === 0 ? "plain" : i === naru.december.stages.length - 1 ? "anchor" : "spot",
              milestone: s.milestone ? t(s.milestone) : undefined,
              logo: s.logo,
            }))}
            // DECIDED 2026-10-11 (사용자): 레일 아래의 멘토링 필 둘과 범례를 그리지 않습니다. 필은 아래 멘토링 상자가 같은 말을 하고,
            // 범례는 "제출물과 마일스톤이 있는 날"처럼 따로 표시하지 말라는 요청입니다. 날마다의 마일스톤은 정거장 아래 한 줄이 말합니다.
            current={hoverDay ?? (phone ? openDay : null) ?? 0}
            selected={phone ? openDay : null}
            onSelect={phone ? selectDay : undefined}
            controls={routePanelId}
            // 2026-10-11 (리뷰 A3): 카드가 열려 있는 동안 힌트 자리에는 그 날짜가 섭니다. 눌린 것이 무엇인지 말합니다.
            hint={openDay !== null ? formatDecemberDayWithWeekday(locale, naru.december.stages[openDay].dayOffset) : t(naru.december.routeHint)}
            // 패널 다섯은 늘 마운트돼 있고 열린 것만 hidden이 풀립니다(aria-controls가 가리키는 id가 항상 있습니다).
            // sm부터는 감싼 div가 통째로 display: none입니다. 그 폭에서는 아래 일정 카드가 같은 내용을 그립니다.
            below={
              <div className="overflow-x-clip sm:hidden" onTouchStart={onSwipeStart} onTouchMove={onSwipeMove} onTouchEnd={onSwipeEnd} onTouchCancel={() => { swipeStart.current = null; setDragX(0); }}>
                {/* DECIDED 2026-10-22 (사용자: "상자 사이즈는 동일한데, 내용이 안 비어 있게"): 다섯 카드를 한 칸에 겹쳐(grid-area 1/1) 높이를 가장 긴 날에
                    맞춥니다. 닫힌 날은 invisible + inert라 자리만 차지합니다. 짧던 Day 0, Day 4는 그날의 진행 한 문단으로 채웁니다(stageCard).
                    그 전에 고른 "높이가 부드럽게 따라가기"는 같은 날 되돌렸습니다. */}
                <div
                  className={`mt-3 grid ${openDay === null ? "hidden" : ""}`}
                  style={{ transform: dragX ? `translateX(${dragX}px)` : undefined, transition: dragX ? "none" : "transform 260ms cubic-bezier(0.22,1,0.36,1)" }}
                >
                {naru.december.stages.map((stage, i) => (
                  <div
                    key={`${stage.name.en}-${openDay === i ? slideDir : "x"}`}
                    id={routePanelId(i)}
                    aria-hidden={openDay !== i || undefined}
                    // inert는 이 React 버전에서 글자 값이어야 DOM에 붙습니다(true를 넘기면 경고와 함께 빠짐).
                    {...(openDay !== i ? ({ inert: "" } as unknown as { inert: boolean }) : {})}
                    className={`[grid-area:1/1] [&>*]:h-full ${openDay !== i ? "invisible" : ""} ${openDay === i && slideDir === 1 ? "motion-safe:animate-[routeSlideFromRight_360ms_cubic-bezier(0.22,1,0.36,1)_both]" : ""} ${openDay === i && slideDir === -1 ? "motion-safe:animate-[routeSlideFromLeft_360ms_cubic-bezier(0.22,1,0.36,1)_both]" : ""}`}
                  >
                    {stageCard(stage, i, true)}
                  </div>
                ))}
                </div>
                {/* DECIDED 2026-10-22 (사용자: "Day 2, 3일 때만 보이게"): 폰에서 이 공통 버튼은 미션이 있는 날(Day 2, 3, 정본 7장)을 볼 때만 섭니다. */}
                {timetableButton && (openDay === 2 || openDay === 3) && <div className="mt-3">{timetableButton}</div>}
              </div>
            }
          />
          </div>

          </div>
          <div data-schedule className="mt-[24px] grid grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-[#0B1430]/60 max-sm:hidden md:grid-cols-3">
            {/* DECIDED 2026-10-17 (사용자, 스크린숏: "시간표와 미션인증 버튼이 3개의 상자 안에 들어가 있으면"): Day 1~3과 그 버튼을
                큰 판 하나가 감쌉니다. 버튼이 세 날의 것이라는 것을 판이 말합니다. */}
            {stageCard(naru.december.stages[0], 0)}
            <div className="flex flex-col gap-[24px] p-[28px] sm:p-[32px] md:col-span-3 md:gap-[48px]">
              {/* DECIDED 2026-10-19 (사용자, 스크린숏: "세션이라는 말도 다 같은 선상에"): 세 카드가 이 격자의 다섯 행(제목, 한 줄, 세션, 칩, 미션)을
                  나눠 씁니다(subgrid). 한 줄의 길이가 날마다 달라도 세션과 미션이 같은 높이에 섭니다. */}
              <div className="grid grid-cols-1 gap-x-[24px] gap-y-[56px] md:grid-cols-3 md:gap-x-[32px] md:gap-y-0">
                {naru.december.stages.slice(1, 4).map((stage, k) => stageCard(stage, k + 1, false, true))}
              </div>
              {timetableButton}
            </div>
            {naru.december.stages.slice(4).map((stage, k) => stageCard(stage, k + 4))}
          </div>
        </Reveal>
        <Reveal className={`${WIDE} mt-[72px] border-t border-white/15 pt-[40px] text-left lg:mt-[96px] lg:pt-[48px]`}>
          {/* DECIDED 2026-10-22 (사용자, 스크린숏: "bottom of both parts가 같아야 함"): lg에서 두 열이 같은 높이로 늘고, 왼쪽은 네 단계 표가
              아래 끝에, 오른쪽은 다섯 줄이 높이를 나눠 마지막 선이 왼쪽 표의 마지막 선과 같은 높이에 섭니다. */}
          <div className="grid gap-x-[32px] gap-y-[48px] lg:grid-cols-2 lg:gap-x-[64px]">
            <div className="min-w-0 lg:flex lg:flex-col">
              {/* DECIDED 2026-10-23 (모바일 점검): 이 세 문단만 폰에서 왼쪽이고 위아래가 모두 가운데라 축이 한 번 바뀌었습니다. 폰은 가운데(brand 10장 "글은 하나의 축"), sm부터 왼쪽. */}
              <p className={`mt-[12px] first:mt-0 break-keep text-center sm:text-left ${BODY} leading-relaxed text-white/85 sm:mt-[16px]`}>
                {t(naru.december.programConcrete).replace("{range}", formatDecemberRange(locale)).replace("{city}", DECEMBER_CITY[locale])}
              </p>
              <p className={`mt-[13.5px] first:mt-0 break-keep text-center sm:text-left ${BODY} leading-relaxed text-white/70 sm:mt-[16px]`}>
                {t(naru.december.crossingLine)}
              </p>
              <p className={`mt-[13.5px] first:mt-0 break-keep text-center sm:text-left ${BODY} leading-relaxed text-white/70 sm:mt-[16px]`}>
                <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="/naru#core" />
              </p>
              <dl data-center-zone="stats" className="mt-[45px] lg:mt-[48px] flex items-stretch justify-center">
                {/* DECIDED 2026-10-08 (사용자 승인, 홈 리뷰 12): 둘째 칸이 "2회 중간 제출 지점"이었습니다. 처음 온 사람에게
                    뜻이 없는 숫자라 "무순위, 부문별 시상"(shape[4])으로 바꿉니다. 제출 두 번은 아래 "이렇게 굴립니다"가 말합니다. */}
                {[naru.december.shape[0], naru.december.shape[4]].map((stat, i) => (
                  // dl의 직계는 div 한 겹이고 그 안은 dt/dd뿐입니다. 그래서 구분선을
                  // 엘리먼트로 두지 못하고 ::before로 그립니다. 화면은 같습니다.
                  <div
                    key={stat.label.en}
                    className={`relative flex flex-col items-center ${i > 0 ? "" : "pr-1"} ${
                      i > 0
                        ? "ml-3 pl-3 pr-1 before:absolute before:left-0 before:top-1/2 before:h-16 before:w-px before:-translate-y-1/2 before:bg-white/[0.14] before:content-[''] sm:ml-9 sm:pl-9"
                        : ""
                    }`}
                  >
                    {/* 2026-10-11 (리뷰 작은 것): DOM은 dt 다음 dd입니다(용어가 먼저). 보이는 순서는 order가 전과 같이 숫자 위, 라벨 아래로 둡니다. */}
                    <dt className={`order-2 mt-[12px] break-keep text-center ${META} font-bold uppercase text-white/70 ${latinTrack(locale)}`}>
                      {t(stat.label)}
                    </dt>
                    {/* DECIDED 2026-10-22 (사용자, 스크린숏: "좀 더 visually engaging, 구성은 유지"): 숫자 줄은 TITLE(2026-09-26 사용자 요청의 크기로 돌아감).
                        숫자 하나가 문장을 대신합니다(brand 5장). */}
                    <dd className={`order-1 ${TITLE} font-black leading-none tracking-tight text-white`}>
                      {t(stat.value)}
                    </dd>
                  </div>
                ))}
              </dl>

            </div>
            <div className="min-w-0 lg:flex lg:flex-col">
              <h3 data-subheading className={SUBHEADING}>{t(naru.december.factsLabel)}</h3>
              {/* DECIDED 2026-10-23 (사용자, 스크린숏: "지금 여기가 너무 비어 있어"): 줄 셋이 왼쪽 열 높이(약 700px)에 맞춰 늘어나
                  줄마다 위아래가 200px 넘게 비었습니다. 줄 수는 사용자가 줄인 것이라(10/10, 10/22) 늘리지 않고, 줄을 제 높이로 둡니다. */}
              <dl className="mt-[16px]">
                {naru.december.facts.map((f, i) => (
                  <div
                    key={f.k.en}
                    // DECIDED 2026-10-22 (사용자: "visually engaging"): sm부터 라벨 왼쪽 열(accent), 설명 오른쪽 열. 표처럼 한눈에 훑습니다.
                    className={`grid grid-cols-1 gap-y-[8px] border-t border-white/10 py-[20px] sm:grid-cols-[7.5rem_1fr] sm:gap-x-[24px] sm:py-[24px] lg:py-[32px] ${i === naru.december.facts.length - 1 ? "border-b" : ""}`}
                  >
                    {/* DECIDED 2026-10-23 (사용자, 스크린숏: "팀 구성 같은 제목들도 너무 작고"): 라벨을 META에서 BODY 굵게로 올렸습니다. 새 크기는 만들지 않습니다. */}
                    <dt className={`break-keep ${BODY} font-bold leading-relaxed text-accent`}>{t(f.k)}</dt>
                    <dd className={`break-keep ${BODY} leading-relaxed text-white/70`}>{t(f.v)}</dd>
                  </div>
                ))}
              </dl>

            </div>
            {/* DECIDED 2026-10-23 (사용자, 스크린숏: "left가 너무 vertically 길다. 오른쪽과 맞춰줘"): 네 단계를 왼쪽 열 맨 아래에서 빼서
                두 열 아래 전체 폭 한 줄(데스크톱 네 칸)로 놓았습니다. 왼쪽은 리드와 숫자만 남아 오른쪽 줄 셋과 높이가 비슷해집니다. */}
            <div className="lg:col-span-2">
              {/* DECIDED 2026-10-23 (사용자: 제목들이 너무 작다): 오른쪽 열 제목과 같은 SUBHEADING으로 맞췄습니다. */}
              <p className={SUBHEADING}>{t(naru.december.approachLabel)}</p>
              <ol role="list" className="mt-[16px] grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
                {naru.december.approach.map((a, i) => (
                  <li key={i} className={`flex flex-col items-start gap-[12px] border-b border-white/10 px-[12px] py-[24px] sm:px-[16px] ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "lg:border-l" : ""} border-white/10`}>
                    {/* 2026-10-22: 칸마다 길이가 다른 진행 막대를 넣었다가 같은 날 뺐습니다(사용자: "늘리고 줄이는 그거 이상함"). */}
                    <span className={`${META} font-bold tabular-nums text-accent`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`break-keep ${BODY} font-bold text-white`}>{t(a.title)}</span>
                    {/* 2026-10-24 (사용자: "폰트 키워줘, 다른 part와 동일하게"): 칸 설명은 META에서 사이트 본문 BODY로. 아래 세 칸 표와 같습니다. */}
                    <span className={`break-keep ${BODY} leading-normal text-white/70`}>{t(a.body)}</span>
                  </li>
                ))}
              </ol>
              {/* 2026-10-24 (사용자): 표 아래 줄("네 질문은 출제사의 상황에 따라 유연하게 조정합니다")은 뺐습니다. 멘토와 행사 뒤는 제목이 말합니다. */}
            </div>
            {/* 2026-10-24: 네 단계 표와 같은 묶음(소제목 + 격자). 위 표의 border-b가 선을 그어 border-t는 뺐고, 간격만 남깁니다. */}
            <div className="mt-[32px] md:mt-[40px] lg:col-span-2">
              {mentoringBoxes}
            </div>
          </div>
        </Reveal>
        <div id="register" aria-labelledby="december-register-note" className={`${READ} mt-[64px] border-t border-white/10 pt-[40px] text-balance text-center lg:mt-[96px] lg:pt-[48px]`}>
        {/* 2026-10-11 (리뷰 A5): 등록 블록의 제목. 화면에는 그리지 않고 제목 목록에서 찾을 수 있게 합니다. */}
        <h3 className="sr-only">{t({ ko: "등록", en: "Registration" })}</h3>
        {/* DECIDED 2026-10-13 (사용자, 스크린숏: "너무 길어, 있는 말 반복이니까"): 여기 서던 registerNote 줄들을 뺐습니다. 언제 여는지와
            혼자 등록하는지는 히어로 한 줄이, 장소와 진행 언어는 모달의 안내 상자가 말합니다. 스크리닝 문장(december.ctaNote)
            한 줄만 남습니다. 홈에서 그 낱말은 이 한 자리입니다(docs/brand.md 9장). */}
        <p id="december-register-note" className={`break-keep text-center ${BODY} text-white/70`}>
          {t(regState === "closed" ? registerCopy.closed : naru.december.ctaNote)}
        </p>
        {/* DECIDED 2026-10-22 (UX 점검): 메뉴 "등록"으로 들어온 사람에게 언제 여는지 한 문장. 열리면 사라집니다. */}
        {regState === "not_open" && (
          <p className={`mt-[8px] break-keep text-center ${META} text-white/70`}>{t(naru.december.opensLine)}</p>
        )}
        <div className="mt-[24px] flex flex-col items-center gap-[13.5px] max-sm:[&>*]:w-full sm:mt-[32px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-[18px]">
          {regState === "open" ? (
            <button type="button" onClick={() => { track("naru_cta", { src: "december", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
              {t(registerCopy.cta)}
              <span aria-hidden className={ARROW_CLASS}>→</span>
            </button>
          ) : regState === "not_open" ? (
            <>
              {/* 2026-10-20 (hwang 브리프 3.7): 미리 보기 버튼을 내렸습니다. 히어로와 같은 이유입니다. */}
              {/* DECIDED 2026-10-12 (등록 브리프 1.3, 리뷰 S8): 알림 버튼은 히어로와 같은 그라데이션 필입니다. 그 전에는 미리 보기,
                  알림, 후원 문의 셋이 같은 윤곽선이라 무엇을 눌러야 하는지 보이지 않았습니다. "페이지의 그라데이션 필은 히어로
                  하나"(2026-09-17)는 이 결정이 대신합니다. 같은 문(오픈채팅)이 두 자리에서 같은 모양입니다. */}
              <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} variant="hero" describedBy="december-chat-note" />
            </>
          ) : null}
        </div>
        {regState === "not_open" && links.openChat && (
          <p id="december-chat-note" className={`mt-[13.5px] break-keep ${META} leading-snug text-white/70`}>{t(openChatLabels.phoneHint)}</p>
        )}
        {/* DECIDED 2026-10-12 (등록 브리프 1.3, 리뷰 S8): 출제사와 후원 문의는 버튼에서 텍스트 링크로 내려갑니다. 학생이 누를 문이
            아니라서 버튼 줄 밖, 한 단 아래에 섭니다. mailto는 그대로입니다. 2026-09-19(모바일 감사 16)에 유령 필로 올렸던 것은
            오픈채팅이 막혀 있어 이 링크가 그 줄의 유일하게 살아 있는 문이던 때의 결정입니다. 누르는 자리는 44px을 지킵니다. */}
        <p className="mt-[12px] sm:mt-[16px]">
          <a
            href={naruLinks.sponsor}
            onClick={() => track("naru_mail", { src: "december" })}
            className={`inline-flex min-h-[44px] items-center gap-1.5 ${META} font-medium text-white/85 underline underline-offset-4 transition hover:text-white`}
          >
            {t(naru.december.ctaMail)}
            <span aria-hidden>→</span>
          </a>
        </p>
        </div>
        </PlateSegment>
        {/* DECIDED 2026-10-10 (사용자: "객관적으로 너무 내용이 많다", 중복 브리프 B3): #december의 둘째 판 조각을 홈에서
            내렸습니다. "8월이 남기지 못한 두 가지, 그리고 12월의 답"(카드 둘)과 "그 밖에 바꾼 것"은 8월 페이지 맨 아래의
            #gaps로 갔습니다(components/archive/AugustGaps.tsx). 홈에는 위의 한 줄 링크만 남습니다. 폰의 접힘 단추 하나가
            같이 사라졌습니다. 이 챕터의 판은 이제 하나라 틈도 하나 줄었고, 배경은 판을 DOM에서 읽어 다시 계산합니다
            (BackgroundScene.readAnchors). 같은 자리에 있던 "문제를 찾는 방식" 두 칸 비교는 2026-10-10 앞선 정리에서 내렸습니다.
            december.find, findLabel, gapsHeading, gapsNote, alsoLabel, also 키는 data/naru.ts에 그대로 있습니다. */}

        {/* 끝나면 할 일 (DECIDED 2026-09-18, 사용자: "챕터를 만들지는 말고 기존 포맷에 몇 줄 더").
            팔로업 브리프는 #after 챕터를 제안했지만 사용자가 챕터를 원하지 않아, 아쉬웠던 넷과 같은
            행 형식으로 뒀습니다. 8월에 이 줄이 없어서 이벤트 뒤에 멘토에게 먼저 연락한 팀이
            한 팀이었습니다. after.lead·statement·cadence·weDo 키는 data/naru.ts에 있고 그리지 않습니다.

            2026-09-19 (사용자): **첫 줄 하나만 그립니다.** steps 02(기업이 마지막 날 여는
            기회)와 03(다음 회차에 멘토로 돌아옵니다)은 data/naru.ts에 그대로 있고 화면에서
            내렸습니다. 지우지 않은 이유는 이 레포의 규칙입니다. 되살릴 때 번역을 다시
            쓰지 않아도 되게 둡니다.

            번호 배지와 ol을 함께 뺐습니다. 항목이 하나면 "01"은 셀 것이 없고, 하나짜리
            목록은 목록이 아닙니다. 상자 문법(sm부터 테두리 + 면)은 그대로 두되 폭을
            한 칸이 아니라 전체로 씁니다. 3열 격자에 카드 하나가 남으면 빠진 자리처럼
            읽힙니다. */}
        {/* DECIDED 2026-09-30 (사용자): "끝나면 할 일" 블록은 그리지 않습니다. 그 내용(멘토에게 먼저 연락합니다)은
            위 다섯째 카드 "끝난 뒤 이어지지 않았습니다"의 12월 답이 됐습니다(data/naru.ts record.gaps[4].answer.
            2026-10-07부터는 둘째 카드 record.gaps[1].answer).
            같은 사실을 두 번 말하던 자리였습니다. after.stepsLabel과 steps는 데이터에 그대로 둡니다. */}

        {/* 다음 건너기 (DECIDED 2026-09-29, 9/28 자문): 끝나면 할 일 바로 뒤. 이벤트가 끝나는 곳이 아니라 다음에
            건너갈 곳을 말합니다. 시기가 정해지지 않아 날짜는 쓰지 않습니다(data/naru.ts december.next의 TODO). */}
        {/* DECIDED 2026-09-30 (사용자: "다음 건너기 내용을 넣어줘"): 리드 한 줄 아래에 행 넷(건너는 사람, 맞이하는
            사람, 건너는 이유, 아직). "이렇게 굴립니다"와 같은 행 문법이고 상자가 아닙니다. 라벨은 dl 밖(접근성 감사 9). */}
        {/* DECIDED 2026-09-30 (사용자, 스크린숏: "이부분은 빼줘"): "다음 건너기" 블록은 그리지 않습니다.
            december.nextLabel, next, nextFacts 키는 data/naru.ts에 그대로 둡니다. */}

        {/* DECIDED 2026-09-18 (사용자): "아직 정해지지 않은 것" 상자를 뺐습니다. 미정 목록
            대신 위 draftNote 한 줄("새로 정해지는 것은 이 자리에 업데이트합니다")이 그 말을
            합니다. december.tbd 키는 그대로. */}

        {/* 참여 플로우 스트립(등록 → 팀 본딩 → 닷새 → 결과 공유회)은 뺐습니다(2026-09-18, 감사 반영
            브리프 3.2). 노선도가 데스크톱에서 렌더되는 것을 확인했고, 같은 시간축을 두 번 그리고
            있었습니다. FlowStrip 컴포넌트와 december.flow 키는 그대로. */}

      </Chapter>

      {/* ── CH2 · 오면 무엇이 남는가 (DECIDED 2026-09-17, 홈 흐름 재배치 브리프) ──
          8월 사이트의 "참가하면 무엇을 얻나요?" 자리. 카드 다섯, 제목만(8월 BenefitCard의
          번호 배지 + 제목 문법, 본문 없음). 데스크톱 한 줄 다섯(숫자 스탯 행과 같은
          그리드), 폰은 두 열 + 마지막 한 장 전폭. 아래 한 줄이 "왜 제목뿐인가"의 답.
          8월 참가 혜택 필과 같은 emerald. 기본 이음매. */}
      <Chapter id="gains" labelledBy="gains-title" align="center" contentSized>
        <PlateSegment id="gains" read>
        {/* DECIDED 2026-09-30 (사용자, 스크린숏): 이 챕터의 머리(알약, h2, 바로 아래 한 줄)는 가운데입니다.
            #december와 #naru의 머리와 같은 축입니다. 아래 다섯 행부터는 왼쪽 끝. */}
        <div className={`${READ} text-center`}><Eyebrow color="purple" className={`${eyebrowTrack(locale)} !mb-0`}>{t(naru.gains.eyebrow)}</Eyebrow></div>
        <h2 id="gains-title" className={`${H2} ${READ} mt-[18px] text-balance text-center`}>{t(naru.gains.heading)}</h2>
        {/* 제목 옆의 구체적인 한 줄(가독성 브리프 5, 2026-09-25 사용자 승인). 챕터 머리의 문단. */}
        {/* DECIDED 2026-10-11 (사용자, 스크린숏 둘: "이거 말고, 8월에 display 방식 차용해서"): 다섯 행 목록을 8월 페이지 "참가하면 무엇을
            얻나요?"의 문법으로 바꿨습니다(components/journey/Journey.tsx의 #benefits): 맨 위에 "남기는 단 하나" 판과 ✓ 칩, 그 아래 한 줄,
            그 아래 번호 카드. 2026-09-20에 카드를 행으로 바꾼 결정은 이 요청으로 되돌립니다.
            8월과 다른 점: 색은 cyan이 아니라 홈의 accent(보라), 글자 크기는 홈의 셋(TITLE, BODY, META)만, 카드 안은 가운데입니다
            (같은 날 "뭐는 중간에, 뭐는 left에" 결정). 카드 본문은 불릿이 아니라 한 문장입니다(항목마다 문장이 하나뿐). */}
        <Reveal className={READ}>
          <div className="mt-[36px] rounded-2xl border border-accent/30 bg-accent/[0.08] px-[24px] py-[27px] text-center lg:mt-[48px] sm:p-[40px]">
            <p className={`${META} font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.gains.spine.tag)}</p>
            <p className={`mx-auto mt-[11.25px] max-w-[34rem] text-balance break-keep ${BODY} font-bold leading-snug text-white sm:mt-[12px]`}>{t(naru.gains.spine.heading)}</p>
            {/* DECIDED 2026-10-20 (hwang 브리프 1.2, 2.6, 감사 W3, W4): ✓칩 셋(알약)을 걷고 한 문장으로. tangibles 키는 남깁니다. */}
            {/* DECIDED 2026-10-23 (사용자: 남는 것 다섯 칸 개편): tangiblesLine(팀의 생각 한 장, 코드로 옮긴 결과물)은 그리지 않습니다.
                바로 아래 02와 04가 같은 말을 합니다. 키는 data/naru.ts에 남깁니다. */}
          </div>
          {/* DECIDED 2026-10-11 (사용자, 스크린숏: "이거 빼줘"): 판 아래의 8월 숫자 한 줄(naru.gains.concrete)은 그리지 않습니다.
              키는 data/naru.ts에 그대로 둡니다. */}
          {/* DECIDED 2026-10-19 (사용자, 스크린숏: "노선하나를 5개가 공유를 하면 좋을거 같은데"): 카드마다 따로 긋던 노선을
              하나로 합쳤습니다. 판 하나의 맨 위에 Day 0~4 노선이 한 번 서고, 다섯 혜택은 그 아래 행이 되어 같은 다섯 칸 위에
              자기 날짜만큼 막대를 긋습니다. 정거장에서 내려오는 옅은 세로줄이 다섯 행을 꿰어 같은 노선이라는 것이 보입니다.
              폰은 행 안에서 글 아래에 막대(가운데 정렬), sm부터는 왼쪽에 글, 오른쪽에 막대. 글자는 BODY와 META만.
              role="list" (2026-09-19, 접근성 감사 10): Safari/VoiceOver가 list-style:none인 목록의 역할을 떼어 냅니다. */}
          <div className="relative mt-[36px] rounded-2xl border border-white/15 bg-white/[0.04] px-[22.5px] py-[12px] sm:px-[32px] sm:py-[27px] lg:mt-[48px] lg:px-[40px]">
            <div className="relative">
              {/* 날마다의 옅은 세로 띠(Day 0, 2, 4). 가는 안내선 대신 칸이 보이게. 머리와 행과 같은 칸 틀입니다. */}
              <div aria-hidden className={`pointer-events-none absolute inset-0 grid ${GAIN_COLS}`}>
                <div className="hidden sm:block" />
                {[0, 1, 2, 3, 4].map((d) => (<div key={d} className={d % 2 === 0 ? "rounded-lg bg-white/[0.03]" : ""} />))}
              </div>
              <div aria-hidden className="relative pb-4 pt-[12px] sm:pt-0">
                <GainRouteHead label={t({ ko: "닷새", en: "Five days" })} names={naru.december.stages.map((st) => t(st.title))} />
              </div>
              <ol role="list" className="relative">
                {naru.gains.items.map((item, i) => (
                  <li
                    key={item.num}
                    className={`border-t border-white/[0.08] py-[18px] text-center sm:grid sm:items-start sm:py-[22.5px] sm:text-left ${GAIN_COLS}`}
                  >
                    <div className="min-w-0 sm:pr-6" style={{ gridColumn: 1, gridRow: 1 }}>
                      <div className="flex items-center justify-center gap-2.5 sm:justify-start">
                        <span aria-hidden className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 ${META} font-black tabular-nums text-accent`}>{item.num}</span>
                        <h3 className={ROW_HEADING}>{t(item.title)}</h3>
                      </div>
                      <p className={`mt-[12px] break-keep ${BODY} leading-relaxed text-white/70 sm:mt-[16px]`}>{t(item.body)}</p>
                      <span className="sr-only">{item.days.map((d) => `Day ${d}`).join(", ")}</span>
                    </div>
                    <GainBars days={item.days} split={item.split} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
        {/* 2026-09-29 (9/28 자문): 결과물의 두 갈래. 창업만이 끝이 아니라는 한 줄(data/naru.ts gains.uses). */}
        {/* DECIDED 2026-09-30 (사용자, 스크린숏): 다섯 행 아래의 두 줄(gains.uses "만든 것은 두 갈래로 쓰입니다…",
            gains.note "각 항목을 어떻게 운영하는지는…")은 그리지 않습니다. 챕터는 다섯 행에서 끝납니다.
            키는 data/naru.ts에 그대로 둡니다. */}

        </PlateSegment>
      </Chapter>

      {/* ── 함께하는 곳 (DECIDED 2026-10-21, 사용자: 후원 현황 스크린숏과 "이렇게 로고 반영해줘") ──────────────
          현황표의 네 줄(메인 후원, 장소, 기술과 크레딧, 커뮤니티와 홍보)을 그대로 옮겼습니다. 이벤트가 먼저, 나루는 그 뒤라
          나루 티저 바로 앞입니다(brand 3장 원칙 2). 분류, 로고 줄, 한 줄 설명을 모든 폭에서 가운데로 쌓습니다
          (같은 날 사용자: "put the logo at the center". 그 전은 lg에서 왼쪽 분류, 오른쪽 로고).
          로고는 원래 색이고(data/naru.ts decemberPartners) 비율로 높이를 맞춥니다. 링크가 확실한 곳만 새 탭 링크입니다. */}
      <section id="partners" aria-labelledby="partners-title" className="relative w-full px-[20px] pb-[45px] pt-[72px] sm:px-[40px] sm:pb-[90px] lg:pb-[126px] lg:pt-[108px]">
        {/* DECIDED 2026-10-22 (사용자): 서울 안에서 빛이 비추면 대학교 휘장이 보입니다(학회 로고는 쓰지 않음). 표보다 먼저 두어 표 아래에 깔립니다. */}
        <SeoulCampuses />
        <div className={WIDE}>
          <h2 id="partners-title" className={`${H2} text-center`}>{t(decemberPartners.heading)}</h2>
          <ul className="mt-[45px] border-t border-white/10 lg:mt-[48px]">
            {decemberPartners.groups.map((g) => (
              <li key={g.label.en} className="flex flex-col items-center gap-5 border-b border-white/10 py-[32px] text-center lg:py-[48px]">
                {/* DECIDED 2026-10-21 (사용자: "그냥 로고만 보여줘"): 설명 줄은 없앴습니다.
                    같은 날 (사용자, 스크린숏: "role 도 각 row 마다 넣어줘"): 분류 이름을 다시 보이게. 주최 줄과 같은 META, 로고 위 가운데.
                    같은 날 (사용자: "글자가 더 잘보이게"): white/50 → white/85, 굵게. 크기는 META 그대로. */}
                <p className={`${META} font-semibold text-white/85`}>{t(g.label)}</p>
                {g.lead ? (
                  // DECIDED 2026-10-22 (사용자: "AXMOS라는 컨소시엄 안에 이 5개의 회사가 있다는 느낌을 더 보여줘"): AXMOS가 위, 짧은 선으로
                  // 이어진 테두리 안에 코어 5개사. 테두리는 선만이고 바탕을 칠하지 않습니다(어두운 바탕에 밝은 판 금지).
                  <div className="flex flex-col items-center">
                    {partnerLogo(g.lead, "h-8 sm:h-10")}
                    <p className={`mt-3 ${META} text-white/60`}>{t(g.lead.note)}</p>
                    <span aria-hidden className="h-6 w-px bg-white/25" />
                    <div className="flex flex-wrap items-center justify-center gap-x-[45px] gap-y-[22.5px] lg:gap-x-[48px] rounded-2xl border border-white/20 px-6 py-6 sm:px-10">
                      {g.logos.map((l) => partnerLogo(l))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-x-[45px] gap-y-[22.5px] lg:gap-x-[48px]">
                    {g.logos.map((l) => partnerLogo(l))}
                  </div>
                )}
              </li>
            ))}
            {/* DECIDED 2026-10-21 (사용자, 스크린숏: "따로 아래에 주최 박스를 넣지 말고, 나루 로고를 주최에 넣어줘 at the table, 로고 옆에 learn more"):
                아래에 있던 나루 티저 상자를 없애고 이 표의 마지막 줄로. 이벤트가 먼저, 나루는 그 안에서 드러납니다(brand 3장 원칙 2, 6장 나루 = 주최).
                id="naru"는 옛 링크 /#naru와 목차 칩이 여기에 내려앉게 이 줄로 옮겼습니다. */}
            <li id="naru" className="flex flex-col items-center gap-4 border-b border-white/10 py-[32px] text-center sm:flex-row lg:py-[48px] sm:justify-center sm:gap-8">
              <p className={`${META} font-semibold text-white/85`}>{t(naru.teaser.eyebrow)}</p>
              <Image
                src={locale === "en" ? "/naru/naru-name-en-rev.svg" : "/naru/naru-name-rev.png"}
                alt={t({ ko: "나루", en: "NARU" })}
                width={604}
                height={168}
                unoptimized={locale === "en"}
                className="block h-8 w-auto sm:h-9"
              />
              <Link
                href={naru.teaser.cta.href}
                onClick={() => track("naru_cta", { src: "partners", to: "naru-page" })}
                className={`tap-44 group inline-flex items-center gap-1.5 ${BODY} font-semibold text-accent transition-colors hover:text-white`}
              >
                {t(naru.teaser.cta.label)}
                <span aria-hidden className={ARROW_CLASS}>→</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* DECIDED 2026-10-21 (사용자): 여기 있던 나루 티저 상자(#naru)는 없앴습니다. 주최는 위 함께하는 곳 표의 마지막 줄입니다. */}
      {/* DECIDED 2026-10-10 (사용자: "나루와 크로싱 서울이 한 페이지에 있어 혼동된다", 구조 브리프 2.2): 여기 있던 #naru, #join,
          (조건부) #people 챕터는 /naru로 옮겼습니다(components/naru/NaruPage.tsx). 삭제가 아니라 이동입니다. */}

      {/* 2026-10-10 (구조 브리프): #record가 /naru로 가서, 홈에서는 #gains가 지나면 나타납니다. */}
      {/* 하단 오픈채팅 바(8월과 같은 것). #record가 지나면 나타나고 푸터가 보이면
          물러납니다. 홈에는 폰 전용 바가 없어서 폰까지 맡습니다(phone).

          main의 **끝**입니다 (2026-09-19, 접근성 감사 21). position: fixed로 화면
          맨 아래에 뜨는 바가 DOM에서는 본문 맨 앞이었습니다. 오픈채팅을 되살리면
          폰에서 main에 들어선 첫 Tab이 화면 아래 끝의 버튼으로 뜁니다. 보이는
          순서와 포커스 순서가 어긋나면 안 됩니다(2.4.3). 지금은 links.openChat이
          빈 문자열이라 렌더되지 않는 잠복 상태였어요. */}
      <MobileChatBar afterId="gains" endId="site-footer" phone />
      </main>

      <SiteFooter page="crossing" />
    </>
  );
}
