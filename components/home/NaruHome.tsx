"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy, registerNoteShort, type RecordPhoto } from "@/data/naru";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import { links, type Phrase } from "@/data/dictionaryCore";
import { useEffect, useState } from "react";
import {
  DECEMBER_EVENT_NAME,
  DECEMBER_STARTS_AT_MS,
  DECEMBER_STARTS_AT_SG_MS,
  decemberEventLabel,
  formatDecemberDateLine,
  formatDecemberDayWithWeekday,
} from "@/lib/naruDates";
import Glass from "@/components/ui/Glass";
import Halo from "@/components/ui/Halo";
import { ChipDot } from "@/components/ui/Chip";
import { buttonClass, ARROW_CLASS } from "@/components/ui/Button";
import { TIMETABLE_OPEN } from "@/lib/crossingOps";
import RouteMap from "@/components/shared/RouteMap";
import PhotoLightbox from "@/components/shared/PhotoLightbox";
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
import {
  SUBHEADING, READ, WIDE, MEASURE_C, READ_MEASURE_C, HERO_BUTTON_GROUND,
  latinTrack, eyebrowTrack, PlateSegment, TermLink, PreparingButton, SiteFooter, usePlateLite,
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
      <p aria-hidden className={`flex items-center gap-2 max-sm:justify-center ${META} font-bold uppercase tracking-[0.18em] text-white/85`}>
        <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-naru-orange" />
        {t(naru.eventHero.countdownLabel)}
        {/* /45 → /60 (2026-09-19, 접근성 감사 2). 이 줄은 sm:hidden이라 **폰에서만**
            보이는데 흰색 45%는 #070B1F 위에서 4.49:1로 AA(4.5:1)에 못 미칩니다.
            globals.css의 대비 표도 "/45는 --bg에서 간발의 차로 실패"라고 적어 두었어요.
            폰에서 이벤트 날짜를 읽으려는 사람이 가장 읽기 어려운 글자로 보게 됩니다.
            /60은 7.25:1입니다. 감싼 <p>가 aria-hidden이라 낭독 대체 경로도 없습니다.
            2026-10-07 (이슈 브리프 4.2, 4.3): /60 → /90. 위 숫자는 단색 바탕 기준이고, 폰 히어로에서는 이 줄 뒤로
            해의 빛이 지나갑니다(실측 3.8:1). 히어로에는 읽기 판이 없어서, 히어로의 작은 글(이 줄, 아래 행 라벨과
            단위, 등록 버튼 아래 한 줄)은 밝은 쪽에 둡니다. */}
        <span className="text-white/85 sm:hidden">{` · ${formatDecemberDayWithWeekday(locale, 0)}`}</span>
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
            <span className="flex min-w-0 flex-col items-start gap-1 sm:items-center">
              <CityShape city={r.city} decorative className={`h-6 w-auto sm:h-10 ${r.city === "seoul" ? "text-naru-logo-from" : "text-naru-logo-to"}`} />
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
            onClick={() => setOpenPhoto(i)}
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
        photos={shown.map((p) => ({ src: p.src, alt: t(p.alt), width: p.width, height: p.height, caption: p.day && `${t(naru.eventHero.photosCaption)} · ${t(p.day)}` }))}
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
  const amber = tone === "amber";
  // DECIDED 2026-10-13 (사용자, 스크린숏: "별, 미션, 이후 공개 이게 다 고려가 되어야 함"): 가운데에 서는 것은 제목 하나가 아니라
  // ★, 라벨, 제목 묶음 전체입니다. 같은 날 앞서 제목만 가운데에 세웠던 것(1fr auto 1fr)을 되돌렸습니다.
  // 위아래는 글자의 잉크로 맞춥니다. 한글은 줄 상자 안에서 위로 붙어 앉고(실측 0.6px) ★의 왼쪽 여백 때문에 묶음이 왼쪽으로 0.75px 치우쳐, 설명이 없는 띠에서는 묶음을 1px 내리고 1px 오른쪽으로 둡니다.
  const head = (
    <>
      <span className={`inline-flex shrink-0 items-center gap-1 ${META} font-bold ${amber ? "text-amber-100" : "text-white/70"}`}>
        {amber && <span aria-hidden>★</span>}{label}
      </span>
      <span className={`${BODY} font-bold leading-snug text-white`}>{title}</span>
    </>
  );
  // 2026-10-19 (시각 감사 5): 가운데 띠는 늘 쌓습니다(★ 미션 / 제목 / 화살표). 제목 길이와 카드 폭에 따라 한 줄로 서던 띠(Day 1, 넓은 Day 4)가 있었습니다.
  const row = `flex w-full items-center gap-x-2.5 gap-y-1 break-keep px-3 py-2 ${center ? "flex-col justify-center" : "flex-wrap text-left"}`;
  return (
    // fill(2026-10-19): 데스크톱 Day 1~3 격자의 띠는 행 높이를 채웁니다. 제목 길이 때문에 화살표가 한 줄에 들어가는 띠만 낮아지던 것.
    <div className={`mt-auto flex w-full flex-col rounded-xl border ${fill ? "md:mt-0" : ""} ${narrow ? "md:mx-auto md:max-w-[17rem]" : ""} ${amber ? "border-amber-400/25 bg-amber-400/10" : "border-white/15 bg-white/[0.04]"}`}>
      {detail && !expanded ? (
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className={`${row} min-h-[44px] flex-1 rounded-xl transition-colors ${amber ? "hover:bg-amber-400/10" : "hover:bg-white/[0.06]"}`}>
          {head}
          <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${amber ? "text-amber-100" : "text-white/70"} transition-transform ${center ? "" : "ml-auto"} ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
        </button>
      ) : (
        <p className={`${row} min-h-[44px] pb-[7px] pl-[13px] pr-[11px] pt-[9px]`}>{head}</p>
      )}
      {detail && (
        <div id={expanded ? undefined : id} hidden={!expanded && !open} className={`break-keep border-t ${amber ? "border-amber-400/20" : "border-white/10"} px-3 py-3`}>
          <div className={`flex w-fit flex-col gap-2.5 text-left ${center ? "mx-auto" : ""}`}>
            {detail.map((g) => (
              <div key={g.label}>
                <p className={`${META} font-bold ${amber ? "text-amber-100" : "text-white/85"}`}>{g.label}</p>
                <ul className={`mt-1 ${BODY} leading-relaxed text-white/85`}>
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2"><span aria-hidden className={amber ? "text-amber-100/70" : "text-white/50"}>•</span><span>{it}</span></li>
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
  const mentoringBoxes = (
    <>
          {/* DECIDED 2026-10-13 (사용자, 멘토링 브리프 1, D1): 상자는 셋이고 종류로 나눕니다. Day 1의 출제사 컨텍스트, Day 2와 Day 3의
              General Mentoring, 출제사 일정에 따르는 현장 멘토링. 문법은 셋이 같습니다(이름 BODY 굵게, 기간 META, 설명 BODY).
              초록 테두리는 가운데 하나뿐이고(초록은 General Mentoring 하나, 2026-09-18), 양옆은 무채색 테두리에 점 색만 다릅니다.
              규칙 목록(mentoringRules)은 가운데 상자의 설명과 아래 Day 4 한 줄로 올라가 그리지 않습니다.
              날짜, 횟수, 기업 이름은 쓰지 않습니다(미정). */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 lg:px-6 lg:py-5">
            <p className={`flex items-center justify-center gap-2 ${BODY} font-bold text-white`}>
              <ChipDot className="bg-accent" />
              {t(naru.december.contextMentoring.name)}
            </p>
            <p className={`mt-0.5 ${META} font-semibold text-white/70`}>{t(naru.december.contextMentoring.when)}</p>
            <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.contextMentoring.body)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-5 py-4 lg:px-6 lg:py-5">
            <p className={`flex items-center justify-center gap-2 ${BODY} font-bold text-white`}>
              <ChipDot />
              {/* lang="en" (2026-09-19, 접근성 감사 7): 한국어 문단 속의 영어 고유명사. */}
              <span lang="en">General Mentoring</span>
            </p>
            <p className={`mt-0.5 ${META} font-semibold text-emerald-200/90`}>{t(naru.december.mentoringAlways)}</p>
            {/* DECIDED 2026-10-10 (사용자, 마일스톤 브리프 2.5): 멘토링은 먼저 찾아가는 자리라는 문장을 상자 안에 그립니다. */}
            <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.mentoringLead)}</p>
          </div>
          {/* DECIDED 2026-10-08 (사용자: "멘토가 오는 게 아니고 우리가 직접 간다", 프로그램 브리프 2.5): 현장 멘토링.
              무채색 테두리에 점만 노선도 둘째 필과 같은 주황입니다(주황은 점으로만). */}
          {/* DECIDED 2026-10-13 (사용자, 스크린숏: "현장 멘토링 박스는 pending 느낌이 더 나오도록"): 아직 정해지지 않은 자리라는 것이 상자 모양에서
              읽히게 합니다. 테두리는 점선, 바탕은 비우고, 점은 속이 빈 주황 고리, 글은 한 단 흐리게(이름 /85, 설명 /70).
              새 색과 새 글자 크기는 없습니다. 정해지면 옆 상자와 같은 실선과 채운 점으로 되돌립니다. */}
          <div className="rounded-2xl border border-dashed border-white/25 px-5 py-4 lg:px-6 lg:py-5">
            <p className={`flex items-center justify-center gap-2 ${BODY} font-bold text-white/85`}>
              <ChipDot className="border border-naru-orange" />
              {t(naru.december.fieldMentoring.name)}
            </p>
            <p className={`mt-0.5 ${META} font-semibold text-white/70`}>{t(naru.december.fieldMentoring.when)}</p>
            <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/70`}>{t(naru.december.fieldMentoring.body)}</p>
          </div>
          {/* 세 상자 아래 한 줄. Day 4에는 멘토링이 없다는 것을 상자가 아니라 줄로 말합니다(상자로 두면 "없음" 하나라 비어 보입니다). */}
          <p className={`break-keep ${META} leading-snug text-white/70 md:col-span-3`}>{t(naru.december.mentoringDay4Line)}</p>
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
  // 2026-10-11 (리뷰 A3, A5): inPanel은 폰의 노선도 패널 안에 서는 카드입니다. 제목은 패널의 첫 줄이고, 마일스톤은 펼쳐 둡니다.
  // 패널의 제목이 h4가 아니라 h3인 이유: 지금은 노선도가 "일정" 소제목(h3)보다 위에 있어 바로 앞 제목이 챕터의 h2입니다.
  // h4로 두면 폰에서 h2 다음이 h4가 됩니다. 일정 소제목이 노선도 위로 올라가면(리뷰 브리프 2.3) h4로 바꿉니다.
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
  // sub: 데스크톱 Day 1~3 줄의 카드(2026-10-19). 카드가 부모 격자의 행을 나눠 써서(subgrid) 한 줄, 세션, 칩, 미션이 세 카드에서 같은 높이에 섭니다.
  const stageCard = (stage: (typeof naru.december.stages)[number], i: number, inPanel = false, sub = false) => {
    const StageHeading = inPanel ? "h3" : "h4";
    // 데스크톱의 Day 1~3 띠는 함께 열립니다. 폰 패널과 Day 4는 각자.
    const sync = !inPanel && i >= 1 && i <= 3 ? { open: stripsOpen, onToggle: () => setStripsOpen((v) => !v) } : {};
    return (
    <div
      key={stage.name.en}
      // 노선도의 현재 위치 점이 이 카드로 옵니다(감사 반영 브리프 3.6).
      onMouseEnter={() => setHoverDay(i)}
      onMouseLeave={() => setHoverDay(null)}
      className={`flex flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 lg:px-6 lg:py-5 items-center text-center ${!inPanel && (i === 0 || i === naru.december.stages.length - 1) ? "md:col-span-3" : ""} ${sub ? "md:row-span-5 md:grid md:grid-rows-subgrid md:items-stretch md:gap-2.5" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        {/* lang="en": DAY는 두 로케일 모두 영어입니다(접근성 감사 7). */}
        <span lang="en" className={`rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 ${META} font-bold tracking-[0.08em] text-accent`}>
          {`${t(naru.december.dayLabel)} ${stage.dayOffset}`}
        </span>
        <StageHeading className={ROW_HEADING}>{t(stage.title)}</StageHeading>
        <span className={`${META} text-white/70`}>{formatDecemberDayWithWeekday(locale, stage.dayOffset)}</span>
      </div>
      {/* stage.body는 그리지 않습니다(2026-09-20). 키는 data/naru.ts에 그대로 있습니다. */}
      <p className={`break-keep ${BODY} leading-relaxed text-white/85`}>{t(stage.line)}</p>
      {stage.session && (
        <p className={`break-keep ${BODY} leading-relaxed text-white/70`}>
          <span className={`mr-1.5 font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.december.sessionLabel)}</span>
          {/* lang="en" (2026-10-11, 리뷰 작은 것): 세션 이름 셋은 두 로케일 모두 영어입니다. */}
          <span lang="en" className="mr-1.5 font-semibold text-white/85">{t(stage.session.title)}</span>
          {t(stage.session.body)}
        </p>
      )}
      {stage.chips.length > 0 ? (
        <p className={`flex flex-wrap justify-center gap-x-3 gap-y-1 ${META} text-white/70`}>
          {stage.chips.map((c, j) => <span key={j}>{t(c)}</span>)}
        </p>
      ) : sub && <span aria-hidden />/* 칩이 없는 날도 행 하나를 차지해야 아래 미션이 옆 카드와 같은 행에 섭니다 */}
      {/* 그날의 마일스톤. amber 띠(홈에서 "결과보다 과정"이 쓰던 색)가 카드 바닥에 섭니다. Day 0에는 없습니다. */}
      {/* DECIDED 2026-10-13 (사용자, 스크린숏: "1일차 박스가 너무 비어있음"): 미션이 없는 Day 1은 같은 자리에 무채색 띠를 세웁니다.
          그날 쓰는 한 장(stage.submit)이 Day 2에 멘토에게 들고 가는 것이라는, 이미 있는 사실입니다. 호박색과 ★는 미션에만 씁니다. */}
      {!stage.milestone && stage.submit && (
        // DECIDED 2026-10-17 (사용자: "똑같이. 상자 색깔로 동일하게"): Day 1 띠도 호박색과 ★, 라벨 "미션"입니다. 2026-10-13의 "호박색과 ★는 미션에만"을
        // 이 결정이 바꿉니다. 그 전 라벨 "Day 2에 들고 갈 것"은 두 줄로 꺾여 Day 2, 3 띠보다 높았습니다.
        <MilestoneStrip id={`carry-day-${stage.dayOffset}`} label={t(naru.december.milestoneLabel)} title={t(stage.submit)} center expanded={inPanel} fill={sub}
          {...sync}
          detail={[
            { label: t(naru.december.carryDetail.todoLabel), items: naru.december.carryDetail.todo.map(t) },
            { label: t(naru.december.milestoneSubmitLabel), items: naru.december.carryDetail.submit.map(t) },
          ]} />
      )}
      {stage.milestone && (
        <MilestoneStrip id={`milestone-day-${stage.dayOffset}`} label={t(naru.december.milestoneLabel)} title={t(stage.milestone)} detail={stage.milestoneDetail && [
          { label: t(naru.december.milestoneConditionsLabel), items: stage.milestoneDetail.conditions.map(t) },
          { label: t(naru.december.milestoneSubmitLabel), items: stage.milestoneDetail.submit.map(t) },
        ]} center expanded={inPanel} fill={sub} narrow={!inPanel && i === naru.december.stages.length - 1} {...sync} />
      )}
      {/* DECIDED 2026-10-17 (사용자): 멘토 시간표와 미션 인증으로 들어가는 문은 Day 2, Day 3 카드에만 있습니다. */}
      {/* 열기 전(TIMETABLE_OPEN false)에는 같은 자리에 잠긴 버튼이 섭니다. */}
      {/* 데스크톱 표에서는 Day 1~3 아래 한 줄 버튼(timetableButton)이 대신하고, 카드 안 버튼은 폰 패널에만 섭니다. */}
      {inPanel && stage.timetableCta && (TIMETABLE_OPEN ? (
        <Link href={stage.timetableCta.href} className={`group w-full justify-center ${buttonClass("secondary")}`}>
          {t(stage.timetableCta.label)}<span aria-hidden className={ARROW_CLASS}>→</span>
        </Link>
      ) : (
        <span role="link" aria-disabled="true" className={LOCKED_CLASS}>{LOCK_ICON}
          {t(stage.timetableCta.label)}
        </span>
      ))}
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
      {/* 2026-10-13 (등록 브리프 2.2): xl 아래에서는 레일이 스크롤 0부터 헤더의 둘째 줄로 서므로 그 높이(54px)만큼 위 여백을 더합니다.
          xl부터는 전과 같습니다(pt-28). */}
      {/* 2026-10-08 (사용자: "크로싱 서울이 너무 위에 있다"): lg의 위 여백을 한 단 늘렸습니다(pt-20 → pt-28). 로고가 헤더에
          바로 붙어 있었습니다. 카운트다운 띠까지 1440×900 한 화면에 들어오는 선에서입니다. */}
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
                      영문 줄은 META 크기라 한 화면의 글자 크기는 그대로 셋입니다. gradient-text는 clip이 안 되는
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
            <div className="mx-auto mt-10 grid w-fit max-w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-14 [&>*]:justify-center [&>*]:whitespace-nowrap max-sm:[&>*]:whitespace-normal">
              {regState === "open" ? (
                <button type="button" onClick={() => { track("naru_cta", { src: "hero", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
                  {t(registerCopy.cta)}
                  <span aria-hidden className={ARROW_CLASS}>→</span>
                </button>
              ) : regState === "closed" ? (
                <span className={`${buttonClass("secondary")} cursor-default !text-white/70`}>{t(registerCopy.closed)}</span>
              ) : (
                // 창이 열리기 전: "등록 준비 중" + 바로 아래 12px 캡션(감사 반영 브리프 1.1).
                // 그 전(2026-09-18 아침)의 반투명 "등록하기"는 이유 없이 죽어 있는 1차 CTA였습니다.
                <PreparingButton t={t} noteId="hero-register-note" onOpen={reg?.openRegister} className={HERO_BUTTON_GROUND} />
              )}
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
      <Chapter id="december" labelledBy="december-title" align="center">
        <PlateSegment id="december">
        {/* 2026-09-18 (감사 반영 브리프 8): 아이브로는 보라 외곽선 1종. 주황 글자·주황 발광을 뺐습니다. */}
        {/* DECIDED 2026-09-30 (사용자): 이 챕터의 머리(알약, h2, 리드 셋, 초안 고지)는 가운데입니다. 아래 숫자 줄과 노선도가
            이미 가운데라 머리부터 노선도까지 한 축입니다. 일정표부터는 왼쪽 끝. */}
        {/* DECIDED 2026-10-10 (구조 브리프 2.4): 머리말 "다음 이벤트 크로싱 서울"을 그리지 않습니다. 홈이 곧 크로싱 서울입니다.
            december.eyebrowPrefix 키는 data/naru.ts에 그대로 있습니다. */}
        <h2 id="december-title" className={`${H2} ${READ} text-balance text-center`}><Halo tone="violet">{t(naru.december.programHeading)}</Halo></h2>
        {/* 폰에서 3줄을 넘는 문단은 왼쪽 정렬 (2026-09-19, 모바일 감사 8). #naru가
            이미 쓰던 규칙(감사 반영 브리프 6.1)인데 #december와 #join에는 적용되지
            않았습니다. 336px 폭에 한글 18자/줄이면 서너 줄 문단이 양쪽 들쭉날쭉한
            마름모로 서고, 눈이 줄마다 시작점을 다시 찾아야 합니다. */}
        {/* DECIDED 2026-09-25 (가독성 브리프 5, 사용자 승인): 제목 옆의 구체적인 한 줄. 날짜는
            naruDates에서. 이 줄이 챕터 머리의 문단 하나라 가운데이고, 아래 shapeLead는 본문
            축으로 내려갑니다(가독성 브리프 4.1: 머리는 h2 바로 아래 문단 하나). 문장은 그대로. */}
        {/* DECIDED 2026-10-02 (사용자: "폰에서도 가운데 정렬로 되돌려줘"): 리드 셋은 폰에서도 가운데입니다.
            같은 날 가독성 리뷰로 폰에서만 왼쪽 정렬로 바꿨다가 되돌렸습니다. 가운데인 블록은 폰에서도 가운데. */}
        <p className={`${READ} ${READ_MEASURE_C} mt-6 break-keep text-center ${BODY} leading-relaxed text-white/85`}>
          {t(naru.december.programConcrete).replace("{date}", formatDecemberDateLine(locale))}
        </p>
        {/* DECIDED 2026-10-11 (브랜드 브리프 B3): "크로싱"의 뜻 한 줄. 위 문단과 같은 모양의 문단입니다. */}
        <p className={`${READ} ${READ_MEASURE_C} mt-3 break-keep text-center ${BODY} leading-relaxed text-white/85`}>
          {t(naru.december.crossingLine)}
        </p>
        <p className={`${READ} ${READ_MEASURE_C} mt-6 break-keep text-center ${BODY} leading-relaxed text-white/70`}>
          {t(naru.december.shapeLead)}
        </p>
        <p className={`${READ} ${READ_MEASURE_C} mt-3 break-keep text-center ${BODY} leading-relaxed text-white/70`}>
          <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="/naru#core" />
        </p>
        {/* 초안 고지(DECIDED 2026-09-18, 사용자): 세부 내용이 바뀔 수 있다는 것을 챕터 머리에서
            확실하게. 호박색 점선 상자(pending 칩과 같은 계열). 8월 문법의 강조 상자 크기. */}
        {/* DECIDED 2026-10-10 (사용자, 스크린숏: "초안이나, 중복 단계나 이 내용도 빼줘"): 위 초안 고지 상자를 그리지 않습니다.
            일정과 현장 멘토링이 아직 바뀔 수 있다는 말은 이제 화면에 없습니다. december.draftLabel, draftNote 키는
            data/naru.ts에 그대로 있습니다. */}
        {/* 숫자 둘. 8월 ProgramStats("2일 필참 / 6일 선택")의 문법. shape에 이미 있는
            값 둘(5일, 2회)만 씁니다. 4차에서 여섯 칸을 뺐으니 늘리지 않습니다. */}
        <Reveal>
        {/* 2026-09-19 (접근성 감사 9): <dl>의 콘텐츠 모델은 dt/dd 또는 **한 겹**의
            div만 허용하고 그 안은 dt가 먼저입니다. 전에는 dl > div > div > dd, dt라
            구조가 깨져서 VoiceOver가 용어와 정의를 짝지어 주지 못하고 "5일"과
            "실질 4일 + 사전 데이터 공개"를 관계 없는 두 조각으로 읽었습니다.
            구분선은 dl 밖으로 낼 수 없어(칸 사이에 있어야 합니다) 허용된 한 겹
            div의 형제로 두고, 보이는 순서는 order로 뒤집습니다. 화면은 그대로입니다.

            2026-09-19 (모바일 감사 17): 구분선 mx-5 → mx-3. 390px에서 칸 하나가
            145px뿐이라 영어 라벨("Four working days, data opens before")이 세 줄로
            접혔습니다. 자간도 폰에서 낮춥니다. 두 칸의 줄 수가 달라 숫자 아래가
            비대칭으로 보이던 자리입니다.

            DECIDED 2026-09-26 (사용자: "중간에 있어야지"): 이 줄만 가운데. 글이 아니라 한눈에 보는
            요약이라 본문의 왼쪽 정렬 규칙(9월 25일, 26일)의 예외입니다. 칸 안의 숫자와 라벨도 가운데. */}
        {/* data-center-zone: 가운데 정렬이 허용되는 세 자리 중 하나(왼쪽 끝 브리프 2.2). 검증이 이 표시로 찾습니다. */}
        {/* 2026-10-10: 초안 상자가 빠져 리드 문단 바로 아래가 됐습니다. 숫자가 문단에 붙지 않게 mt-5를 mt-10으로. */}
        <dl data-center-zone="stats" className={`${READ} mt-10 flex items-stretch justify-center`}>
          {/* DECIDED 2026-10-08 (사용자 승인, 홈 리뷰 12): 둘째 칸이 "2회 중간 제출 지점"이었습니다. 처음 온 사람에게
              뜻이 없는 숫자라 "무순위, 부문별 시상"(shape[4])으로 바꿉니다. 제출 두 번은 아래 "이렇게 굴립니다"가 말합니다. */}
          {[naru.december.shape[0], naru.december.shape[4]].map((stat, i) => (
            // dl의 직계는 div 한 겹이고 그 안은 dt/dd뿐입니다. 그래서 구분선을
            // 엘리먼트로 두지 못하고 ::before로 그립니다. 화면은 같습니다.
            <div
              key={stat.label.en}
              className={`relative flex flex-col items-center ${i > 0 ? "" : "pr-1"} ${
                i > 0
                  ? "ml-3 pl-3 pr-1 before:absolute before:left-0 before:top-1/2 before:h-9 before:w-px before:-translate-y-1/2 before:bg-white/[0.14] before:content-[''] sm:ml-9 sm:pl-9"
                  : ""
              }`}
            >
              {/* 2026-10-11 (리뷰 작은 것): DOM은 dt 다음 dd입니다(용어가 먼저). 보이는 순서는 order가 전과 같이 숫자 위, 라벨 아래로 둡니다. */}
              <dt className={`order-2 mt-1.5 break-keep text-center ${META} font-bold uppercase text-white/70 ${locale === "en" ? "tracking-[0.04em] sm:tracking-[0.1em]" : "tracking-normal"}`}>
                {t(stat.label)}
              </dt>
              <dd className={`order-1 ${TITLE} font-black leading-none text-white`}>
                {t(stat.value)}
              </dd>
            </div>
          ))}
        </dl>
        </Reveal>

        {/* 노선도. 정거장 다섯, ★는 제출이 있는 날. 레일 아래 초록 필이
            General Mentoring(8월의 "1:1 멘토링 매일" 필 자리). */}
        <Reveal className={`${WIDE} mt-8 text-left`}>
          {/* data-center-zone: 노선도와 범례는 그림이라 가운데를 씁니다(왼쪽 끝 브리프 2.2). */}
          <div data-center-zone="routemap">
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
        </Reveal>

        {/* 2026-09-20 (표현 방식 브리프 4): Day 카드 다섯 장을 지우고 표 한 장으로.
            바로 위 노선도가 이미 같은 다섯 라벨(BEFORE / 문제 발견 / 빌드 / 다듬기 /
            피치)을 그리고 있었습니다(2026-09-18 감사 P1: "노선도와 Day 카드가 같은
            시간축을 두 번 그린다"). 노선도가 뼈대이고 이 표가 살입니다. 카드로 두면
            라벨이 세 번 나옵니다(노선도 · 카드 제목 · 표).

            dl이 아니라 표인 이유는 열이 셋이고 세로로 비교되기 때문입니다. 폰에서는
            행마다 쌓입니다. 폰 아코디언(감사 반영 브리프 3.1)은 함께 사라집니다.
            접었다 펴는 장치가 필요했던 것은 카드 다섯 장이 세로로 1,000px을 썼기
            때문이고, 행이면 처음부터 전부 보입니다.

            제출물 칩은 알약을 벗고 오른쪽 열의 작은 글자가 됩니다. 노선도의 ★가
            이미 "제출이 있는 날"을 말하고 있어서 칩이 같은 말을 세 번째로 하고
            있었습니다.

            워크샵 세 칸(Problem Discovery / PO session / Pitching session)은 별도
            행이 아니라 해당 Day 행의 마지막 줄입니다. 전에는 열 정렬로만 관계를
            암시했는데 Day 4에는 워크샵이 없어 줄이 어긋나 있었어요.

            문장은 한 글자도 새로 쓰지 않았습니다. 카드에 있던 title·body·line·
            workshop·chips·submit을 그대로 옮긴 것입니다. 날짜는 전과 같이
            naruDates가 셉니다(data/naru.ts에 날짜 문자열을 쓰지 않는 규칙). */}
        {/* DECIDED 2026-10-09 (사용자: "모바일 view 에서 central 하게 content 들이 더 많이 left 에서 center 로 오면 좋겠음"):
            sm(640px) 아래에서는 이 챕터의 글 블록(일정표, 이렇게 굴립니다, 멘토링 상자, 재는 것, 두 칸 비교, 두 상자,
            그 밖에 바꾼 것)과 #gains 목록, #naru의 코어 둘, #join의 세 카드가 가운데 정렬입니다. 전에는 제목과 리드만
            가운데이고 그 아래가 전부 왼쪽이라, 폰 한 화면에 축이 둘이었습니다. 왼쪽 끝 규칙(2026-09-29)은 sm부터 그대로입니다.
            가운데에서는 줄머리 점과 왼쪽 세로선이 축을 다시 왼쪽에 세우므로 폰에서만 숨깁니다. */}
        {/* DECIDED 2026-10-11 (사용자, 스크린숏 둘: "완전 뒤죽박죽, 뭐는 중간에, 뭐는 left에"): 이 챕터와 #gains의 글 블록은 sm부터도
            가운데입니다. 머리(알약, 제목, 리드, 숫자), 노선도, 등록 줄은 가운데인데 그 사이의 일정, 표, 멘토링 상자, 문단만 왼쪽이라
            한 화면에 축이 둘이었습니다. 폰은 2026-10-09부터 가운데였고, 이제 모든 폭에서 축이 하나입니다.
            왼쪽 끝 규칙(2026-09-29)은 홈의 이 블록들에서는 더 쓰지 않습니다. 표의 라벨은 값 위에 쌓습니다(폰과 같은 모양). */}
        {/* DECIDED 2026-10-19 (사용자, 출제사 브리프 3장): 문제에 들어가는 네 단계. 상자 없이 헤어라인 네 칸(폰은 두 칸),
            아래 한 줄이 평가 원칙(어디까지 물어 들어갔는가)을 말합니다. 글자 크기는 BODY와 META 둘.
            2026-10-19 (시각 감사 2): 멘토링 상자 아래에서 노선도 바로 아래, 일정 위로 옮겼습니다. 팀이 이슈를 파고드는 방식이라 일정보다 먼저 읽힙니다. */}
        <Reveal className={`${READ} mt-8 text-center lg:mt-12`}>
          <p className={`${META} font-bold text-white/70`}>{t(naru.december.approachLabel)}</p>
          <ol role="list" className="mt-3 grid grid-cols-2 border-t border-white/10 md:grid-cols-4">
            {naru.december.approach.map((a, i) => (
              <li key={i} className={`flex flex-col items-center gap-1 border-b border-white/10 px-2 py-4 md:border-b-0 ${i % 2 === 1 ? "border-l" : ""} md:border-l ${i === 0 ? "md:border-l-0" : ""} border-white/10`}>
                <span className={`${META} font-bold tabular-nums text-accent`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`break-keep ${BODY} font-bold text-white`}>{t(a.title)}</span>
                <span className={`break-keep ${META} leading-snug text-white/70`}>{t(a.body)}</span>
              </li>
            ))}
          </ol>
          <p className={`mt-4 text-balance break-keep ${BODY} leading-relaxed text-white/85 md:border-t md:border-white/10 md:pt-4`}>{t(naru.december.approachClose)}</p>
        </Reveal>
        {/* id="schedule": 목차의 "일정" 칩이 내려앉는 자리입니다(2026-10-13). */}
        <Reveal id="schedule" className={`${READ} mt-10 text-center`}>
          <h3 data-subheading className={SUBHEADING}>{t(naru.december.scheduleLabel)}</h3>
          <p className={`${MEASURE_C} mt-3 break-keep ${BODY} leading-relaxed text-white/70`}>
            {t(naru.december.scheduleLead)}
          </p>
          {/* 2026-10-11: 폰에서는 이 표를 그리지 않습니다. 위 노선도의 정거장을 누르면 그날의 행이 노선도 아래에 열립니다. */}
          {/* DECIDED 2026-10-17 (사용자, 스크린숏: "day 4가 너무 비어있음, day 0처럼 아래에, day 1~3은 한 줄, 통일된 멘토 시간표와 미션 인증 버튼, 미션은 상자마다"):
              Day 0 한 줄, Day 1~3 한 줄 세 칸, 그 아래 세 칸에 걸친 버튼 하나, Day 4 한 줄입니다. 그 전(2026-10-11)은 Day 0 아래 두 칸 두 줄. */}
          {/* 세 칸이 864px 글 기둥 안에서는 좁아(카드 한 장 약 270px), 표만 양옆으로 넓힙니다(lg 40px, xl부터 128px. 1024px에서 128px이면 화면 밖으로 나갔습니다). 글과 제목의 축은 그대로 가운데입니다. */}
          <div data-schedule className="mt-5 grid grid-cols-1 gap-3 max-sm:hidden md:grid-cols-3 md:gap-4 lg:-mx-10 xl:-mx-32">
            {/* DECIDED 2026-10-17 (사용자, 스크린숏: "시간표와 미션인증 버튼이 3개의 상자 안에 들어가 있으면"): Day 1~3과 그 버튼을
                큰 판 하나가 감쌉니다. 버튼이 세 날의 것이라는 것을 판이 말합니다. */}
            {stageCard(naru.december.stages[0], 0)}
            <div className="flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-3 md:col-span-3 md:gap-4 md:p-4">
              {/* DECIDED 2026-10-19 (사용자, 스크린숏: "세션이라는 말도 다 같은 선상에"): 세 카드가 이 격자의 다섯 행(제목, 한 줄, 세션, 칩, 미션)을
                  나눠 씁니다(subgrid). 한 줄의 길이가 날마다 달라도 세션과 미션이 같은 높이에 섭니다. */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-x-4 md:gap-y-0">
                {naru.december.stages.slice(1, 4).map((stage, k) => stageCard(stage, k + 1, false, true))}
              </div>
              {timetableButton}
            </div>
            {naru.december.stages.slice(4).map((stage, k) => stageCard(stage, k + 4))}
          </div>
          {/* 2026-09-20 (일정 브리프 5장): workshopNote("스테이지마다 ... 3시간짜리
              워크샵이 붙습니다")를 그리지 않습니다. Day 4에는 세션이 없어
              "스테이지마다"가 더 이상 맞지 않고, 3시간이라는 사실은 바로 아래
              facts의 첫 줄이 정확하게 말합니다. 키는 data/naru.ts에 그대로. */}

          {/* DECIDED 2026-09-20 (일정 브리프 5장, PDF 02 하단): 세션·공간·제출·기록.
              표가 "언제 무엇을"이라면 이 넷은 "어떻게 굴리는가"입니다. 상자가 아니라
              표와 같은 문법의 행입니다(표현 방식 브리프 2장). 라벨 폭이 표의 왼쪽
              열과 같은 7rem이라 두 블록의 왼쪽 축이 한 줄로 섭니다.

              "공간"은 운영 방식이고 "장소"(어디인가)는 여전히 미정입니다. tbd 목록의
              "장소"를 이 줄로 대신하지 마세요. */}
          {/* 라벨은 dl 밖입니다. dl의 콘텐츠 모델은 dt/dd 아니면 **한 겹**의 div만
              허용하고, 둘을 섞으면 VoiceOver가 용어와 정의를 짝지어 주지 못합니다
              (2026-09-19 접근성 감사 9가 같은 자리에서 짚은 것). */}
          {/* 2026-10-11 (리뷰 A5): h4에서 h3로. "일정"(h3)과 같은 층의 소제목입니다. 모양은 그대로. */}
          <h3 data-subheading className={`${SUBHEADING} mt-8`}>{t(naru.december.factsLabel)}</h3>
          <dl className="mt-3">
            {naru.december.facts.map((f, i) => (
              <div
                key={f.k.en}
                // 2026-10-09: 폰은 가운데 정렬이라 라벨을 값 위에 쌓습니다(전에는 폰에서도 2열, 라벨 81px).
                className={`grid grid-cols-1 gap-y-1 border-t border-white/10 py-3 ${i === naru.december.facts.length - 1 ? "border-b" : ""}`}
              >
                {/* /50이 아니라 /75인 이유는 대비입니다(LABEL_HEADING이 같은 이유로
                    /75입니다). 12.24px은 큰 글자 예외를 받지 못해 4.5:1이 필요한데,
                    배경 입자가 지나가는 자리에서 /50은 3.19:1이었습니다.
                    2026-09-25 (가독성 브리프 4.2): 12.24px → 13.5px, 한국어 화면의 자간 0.16em → 0.
                    표의 행 라벨은 13px 이상, white/60 이상입니다. */}
                <dt className={`break-keep ${META} font-semibold uppercase ${latinTrack(locale)} text-white/70`}>{t(f.k)}</dt>
                <dd className={`text-balance break-keep ${BODY} leading-relaxed text-white/70`}>{t(f.v)}</dd>
              </div>
            ))}
          </dl>

        </Reveal>
        {/* General Mentoring. 초록 테두리 강조 상자(8월 "과정이 기록됩니다" 문법).
            2026-09-26 (한 축 브리프): lg에서 규칙 다섯이 가로로 서므로 WIDE입니다. 위 일정표와
            아래 재는 것은 READ라 Reveal을 셋으로 나눴습니다. 내용과 순서는 그대로. */}
        {/* 2026-09-29 (왼쪽 끝 브리프 2.1): WIDE → READ. 라벨을 규칙 옆이 아니라 위에 둡니다. READ 폭에서 옆에
            두면 규칙 다섯 칸이 100px 남짓이라 한두 자씩 끊깁니다. */}
        {/* 2026-09-30: 판 나누기가 이 상자 앞에서 아래(AI 활용 범위 앞)로 내려가, 이 상자는 위 표에 이어지는
            블록입니다. 블록 사이 간격(mt-8 lg:mt-12)을 씁니다. */}
        {/* DECIDED 2026-10-10 (사용자, 스크린숏: "상자가 너무 비워져있음"): 두 상자를 위아래에서 좌우로 세웁니다(md부터).
            READ 폭 한 줄을 다 쓰는 상자 안에서 글이 MEASURE(36rem)에 묶여 오른쪽 절반이 비어 있었습니다. 두 칸으로 나누면
            글이 상자를 채웁니다. 상자 안 문단의 MEASURE는 그래서 뺐습니다. 폰은 전처럼 위아래입니다. 색과 글은 그대로. */}
        {/* DECIDED 2026-10-13 (사용자, 멘토링 브리프 1): 상자가 셋이 되어 md부터 세 칸입니다. 폰은 전처럼 위아래. */}
        {/* id="mentoring": 목차의 "멘토링" 칩이 내려앉는 자리입니다(2026-10-13). */}
        <Reveal id="mentoring" className={`${READ} mt-8 grid grid-cols-1 gap-3 text-center md:grid-cols-3 md:gap-4 lg:mt-12`}>
          {mentoringBoxes}
        </Reveal>
        {/* DECIDED 2026-10-10 (중복 브리프 B2): 이 자리의 호박색 "결과보다 과정" 상자(naru.why.measure)를 그리지 않습니다.
            #naru 코어 01의 "그래서 우리가 보는 것도 순위가 아니라 완주입니다"와 같은 말입니다. 키는 data/naru.ts에 그대로.
            그 자리에 findClose 문단이 섭니다. 평가가 과정이라는 말을 이 문단이 대신합니다. 상자 없이 READ 왼쪽 끝, BODY. */}
        {/* 2026-10-19 (시각 감사 1): findClose는 네 단계 아래 approachClose에 합쳐져 여기서 그리지 않습니다(이 Reveal도 뺌). */}
        {/* DECIDED 2026-10-10 (사용자: "8월이랑 뭐가 다른지 12월 페이지에서는 설명할 필요가 없음"): 여기 있던
              "8월과 무엇이 다른지" 링크를 뺐습니다. 8월 페이지의 #gaps는 그대로 있고, 홈에서는 가리키지 않습니다.
              december.gapsLink 키는 data/naru.ts에 그대로. */}
        {/* 판 나누기(2026-09-26 3차, 사용자: #gains와 #naru 사이 틈에 한국 형상이 보임): 긴 챕터의 판을 둘로 나눠
            서울이 보이는 틈을 하나 더 둡니다.
            DECIDED 2026-09-30 (사용자, 스크린숏: "이렇게 gap이 있는 것이 어색함"): 틈의 자리를 "이렇게 굴립니다"
            표와 General Mentoring 상자 사이에서 여기로 내렸습니다. 거기는 같은 이야기(어떻게 굴리는가)의
            한가운데라 표와 상자 사이가 끊긴 것처럼 읽혔습니다. 여기는 프로그램 이야기가 끝나고 "8월과 무엇이
            다른가"가 시작하는 자리입니다(#naru의 둘째 조각이 #why 앞에서 시작하는 것과 같은 문법). 뒤 조각이
            짧아졌으니 판 덮개가 형상을 다 덮는지는 배경의 개발 경고로 확인합니다(BackgroundScene.warnCover). */}
        {/* DECIDED 2026-10-08 (사용자 승인, 홈 리뷰 10): 등록과 오픈채팅 줄을 둘째 조각의 끝에서 첫 조각의 끝으로
            올렸습니다. 프로그램을 다 읽은 사람이 8월과의 비교 세 블록을 지나야 문을 만났습니다. 비교는 문 뒤에 옵니다. */}
        {/* 문. 참가자는 오픈채팅(2차 유령 필), 출제사와 후원은 텍스트 링크.
            페이지의 그라데이션 필은 히어로 하나뿐입니다. */}
        {/* 문의 줄과 버튼 줄은 한 덩어리입니다(가독성 브리프 4.1). 폰에서는 세로로 쌓습니다.
            DECIDED 2026-09-30 (사용자): 이 덩어리는 가운데. 글이 가운데면 버튼도 가운데(2026-09-29). */}
        {/* DECIDED 2026-10-11 (리뷰 A2): 목차의 "참가" 칩이 내려앉는 자리입니다. 착지 여백은 JourneyNav가 헤더 실높이로 넣는
            scroll-padding-top이 맡습니다(scroll-margin을 따로 더하면 두 값이 합쳐집니다, NaruPage의 2026-09-19 주석). */}
        <div id="register" className={`${READ} mt-8 text-balance text-center lg:mt-12`}>
        {/* 2026-10-11 (리뷰 A5): 등록 블록의 제목. 화면에는 그리지 않고 제목 목록에서 찾을 수 있게 합니다. */}
        <h3 className="sr-only">{t({ ko: "등록", en: "Registration" })}</h3>
        {/* DECIDED 2026-10-13 (사용자, 스크린숏: "너무 길어, 있는 말 반복이니까"): 여기 서던 registerNote 줄들을 뺐습니다. 언제 여는지와
            혼자 등록하는지는 히어로 한 줄이, 장소와 진행 언어는 모달의 안내 상자가 말합니다. 스크리닝 문장(december.ctaNote)
            한 줄만 남습니다. 홈에서 그 낱말은 이 한 자리입니다(docs/brand.md 9장). */}
        <p id="december-register-note" className={`break-keep text-center ${BODY} text-white/70`}>
          {t(regState === "closed" ? registerCopy.closed : naru.december.ctaNote)}
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          {regState === "open" ? (
            <button type="button" onClick={() => { track("naru_cta", { src: "december", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
              {t(registerCopy.cta)}
              <span aria-hidden className={ARROW_CLASS}>→</span>
            </button>
          ) : regState === "not_open" ? (
            <>
              {/* 위 안내 한 줄이 이 버튼의 캡션입니다. */}
              <PreparingButton t={t} noteId="december-register-note" onOpen={reg?.openRegister} />
              {/* DECIDED 2026-10-12 (등록 브리프 1.3, 리뷰 S8): 알림 버튼은 히어로와 같은 그라데이션 필입니다. 그 전에는 미리 보기,
                  알림, 후원 문의 셋이 같은 윤곽선이라 무엇을 눌러야 하는지 보이지 않았습니다. "페이지의 그라데이션 필은 히어로
                  하나"(2026-09-17)는 이 결정이 대신합니다. 같은 문(오픈채팅)이 두 자리에서 같은 모양입니다. */}
              <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} variant="hero" describedBy="december-chat-note" />
            </>
          ) : null}
        </div>
        {regState === "not_open" && links.openChat && (
          <p id="december-chat-note" className={`mt-3 break-keep ${META} leading-snug text-white/70`}>{t(openChatLabels.phoneHint)}</p>
        )}
        {/* DECIDED 2026-10-12 (등록 브리프 1.3, 리뷰 S8): 출제사와 후원 문의는 버튼에서 텍스트 링크로 내려갑니다. 학생이 누를 문이
            아니라서 버튼 줄 밖, 한 단 아래에 섭니다. mailto는 그대로입니다. 2026-09-19(모바일 감사 16)에 유령 필로 올렸던 것은
            오픈채팅이 막혀 있어 이 링크가 그 줄의 유일하게 살아 있는 문이던 때의 결정입니다. 누르는 자리는 44px을 지킵니다. */}
        <p className="mt-1">
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
      <Chapter id="gains" labelledBy="gains-title" align="center">
        <PlateSegment id="gains" read>
        {/* DECIDED 2026-09-30 (사용자, 스크린숏): 이 챕터의 머리(알약, h2, 바로 아래 한 줄)는 가운데입니다.
            #december와 #naru의 머리와 같은 축입니다. 아래 다섯 행부터는 왼쪽 끝. */}
        <div className={`${READ} text-center`}><Eyebrow color="purple" className={eyebrowTrack(locale)}>{t(naru.gains.eyebrow)}</Eyebrow></div>
        <h2 id="gains-title" className={`${H2} ${READ} text-balance text-center`}><Halo tone="violet">{t(naru.gains.heading)}</Halo></h2>
        {/* 제목 옆의 구체적인 한 줄(가독성 브리프 5, 2026-09-25 사용자 승인). 챕터 머리의 문단. */}
        {/* DECIDED 2026-10-11 (사용자, 스크린숏 둘: "이거 말고, 8월에 display 방식 차용해서"): 다섯 행 목록을 8월 페이지 "참가하면 무엇을
            얻나요?"의 문법으로 바꿨습니다(components/journey/Journey.tsx의 #benefits): 맨 위에 "남기는 단 하나" 판과 ✓ 칩, 그 아래 한 줄,
            그 아래 번호 카드. 2026-09-20에 카드를 행으로 바꾼 결정은 이 요청으로 되돌립니다.
            8월과 다른 점: 색은 cyan이 아니라 홈의 accent(보라), 글자 크기는 홈의 셋(TITLE, BODY, META)만, 카드 안은 가운데입니다
            (같은 날 "뭐는 중간에, 뭐는 left에" 결정). 카드 본문은 불릿이 아니라 한 문장입니다(항목마다 문장이 하나뿐). */}
        <Reveal className={READ}>
          <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/[0.08] px-5 py-6 text-center sm:px-7">
            <p className={`${META} font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.gains.spine.tag)}</p>
            <p className={`mx-auto mt-2.5 max-w-[34rem] text-balance break-keep ${BODY} font-bold leading-snug text-white`}>{t(naru.gains.spine.heading)}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {naru.gains.spine.tangibles.map((x, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/30 bg-accent/[0.1] px-3 py-1 ${META} font-semibold text-white/90`}>
                  <span aria-hidden className="text-accent">✓</span>
                  {t(x)}
                </span>
              ))}
            </div>
          </div>
          {/* DECIDED 2026-10-11 (사용자, 스크린숏: "이거 빼줘"): 판 아래의 8월 숫자 한 줄(naru.gains.concrete)은 그리지 않습니다.
              키는 data/naru.ts에 그대로 둡니다. */}
          {/* role="list" (2026-09-19, 접근성 감사 10): Safari/VoiceOver가 list-style:none인 목록의 역할을 떼어 냅니다.
              다섯 장: lg에서 여섯 칸 격자에 두 칸씩, 넷째를 둘째 칸에서 시작해 아랫줄 둘이 가운데에 섭니다. */}
          <ol role="list" className="mt-8 grid grid-cols-1 gap-3 text-center sm:grid-cols-2 md:gap-4 lg:grid-cols-6">
            {naru.gains.items.map((item, i) => (
              <li
                key={item.num}
                className={`flex flex-col items-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 sm:py-5 lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""} ${i === 4 ? "max-lg:sm:col-span-2" : ""}`}
              >
                {/* 폰에서는 번호와 제목을 한 줄에 둡니다(카드 다섯이 세로로 쌓여 길어지지 않게). sm부터는 8월처럼 번호가 제목 위. */}
                <div className="flex items-center justify-center gap-2.5 sm:flex-col sm:gap-3">
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 ${META} font-black tabular-nums text-accent`}>{item.num}</span>
                  <h3 className={ROW_HEADING}>{t(item.title)}</h3>
                </div>
                <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/70`}>{t(item.body)}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        {/* 2026-09-29 (9/28 자문): 결과물의 두 갈래. 창업만이 끝이 아니라는 한 줄(data/naru.ts gains.uses). */}
        {/* DECIDED 2026-09-30 (사용자, 스크린숏): 다섯 행 아래의 두 줄(gains.uses "만든 것은 두 갈래로 쓰입니다…",
            gains.note "각 항목을 어떻게 운영하는지는…")은 그리지 않습니다. 챕터는 다섯 행에서 끝납니다.
            키는 data/naru.ts에 그대로 둡니다. */}

        </PlateSegment>
      </Chapter>

      {/* ── 나루 티저 (DECIDED 2026-10-10, 사용자: "프로그램 끝에 나루 티저, 나루 내용은 전부 다른 탭으로", 구조 브리프 2.3) ──
          홈의 마지막 블록입니다. id는 naru라 옛 링크 /#naru가 여기에 내려앉고, 목차의 넷째 칩이 여기로 옵니다.
          READ 폭의 상자 하나(General Mentoring 상자와 같은 문법, 색은 보라 계열). 왼쪽에 나루 인장(크기는 전의 #naru 머리와
          같은 160/220px), 폰에서는 위. 읽기 판 밖이라 상자가 자기 바탕을 가집니다(배경의 서울 형상이 이 뒤에 서 있습니다).
          Chapter가 아니라 section입니다. Chapter는 md부터 한 화면 높이를 잡아 상자 하나에 빈 화면이 생깁니다. */}
      {/* DECIDED 2026-10-10 (사용자, 스크린숏: "너무 밋밋하다"): 티저를 다시 그렸습니다. 테두리 한 줄짜리 상자에서
          ① 보라에서 자주로 가는 그라데이션 테두리와 안쪽의 빛 둘(/match 결과 카드와 같은 문법), ② 인장 뒤의 빛,
          ③ 나루의 두 줄 선언(naru.hero.titleLine1, 2. /naru 머리의 제목과 같은 문장, 새 글이 아닙니다)을 TITLE로.
          폭은 READ에서 WIDE로 넓혔습니다. TITLE 두 줄이 인장 옆에 서려면 READ(864px)로는 모자랍니다.
          주황은 쓰지 않습니다(주황은 점으로만). 글자 크기는 TITLE, BODY, META 셋 그대로입니다. */}
      {/* DECIDED 2026-10-11 (사용자, 스크린숏: "여기 gap이 다른 gap들에 비해서 너무 좁은데"): 위 여백을 pt-6에서 pt-16 lg:pt-28로.
          #gains가 카드로 길어지면서 마지막 카드와 이 상자 사이가 1440px에서 135px이었습니다(#december 끝과 #gains 머리 사이는 약 220px).
          이제 234px, 폰은 90px에서 135px입니다(실측). */}
      <section id="naru" aria-labelledby="naru-teaser-label" className="relative w-full px-6 pb-20 pt-16 sm:px-10 lg:pb-28 lg:pt-28">
        {/* 2026-10-11 (리뷰 A5): 티저의 제목. 화면에는 그리지 않습니다. */}
        <h2 className="sr-only">{t({ ko: "나루", en: "NARU" })}</h2>
        <Reveal className={WIDE}>
          <div className="relative overflow-hidden rounded-3xl bg-[#0B1430]/90 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/80 via-white/10 to-accent-strong/70 p-px"
              style={{ WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
            />
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-naru-purple/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-accent-strong/25 blur-3xl" />
            <div className="relative flex flex-col items-center gap-7 text-center md:flex-row md:gap-12 md:text-left">
              <div className="relative shrink-0">
                <div aria-hidden className="pointer-events-none absolute inset-[-14%] rounded-full bg-accent/25 blur-2xl" />
                <Image
                  src={locale === "en" ? "/naru/naru-master-en-v3-rev.svg" : "/naru/naru-master-v3-rev.png"}
                  alt={t(naru.hero.logoAlt)}
                  width={900}
                  height={900}
                  unoptimized={locale === "en"}
                  className="relative block h-auto w-[160px] sm:w-[220px]"
                />
              </div>
              <div className="min-w-0">
                <p id="naru-teaser-label" className={`${META} font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.teaser.eyebrow)}</p>
                <p className={`mt-3 ${TITLE} font-bold leading-[1.15] tracking-tight text-white`}>
                  <span className="block break-keep">{t(naru.hero.titleLine1)}</span>{" "}
                  <span className={`${GRADIENT_TEXT} block break-keep`}>{t(naru.hero.titleLine2)}</span>
                </p>
                <p className={`mt-4 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.teaser.body)}</p>
                <Link
                  href={naru.teaser.cta.href}
                  onClick={() => track("naru_cta", { src: "teaser", to: "naru-page" })}
                  className={`group mt-6 ${buttonClass("secondary", "naru")}`}
                >
                  {t(naru.teaser.cta.label)}
                  <span aria-hidden className={ARROW_CLASS}>→</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

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
      <MobileChatBar afterId="gains" endId="closing" phone />
      </main>

      <SiteFooter compact page="crossing" />
    </>
  );
}
