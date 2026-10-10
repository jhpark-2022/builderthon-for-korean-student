"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy, type RecordPhoto } from "@/data/naru";
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
import RouteMap from "@/components/shared/RouteMap";
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
  PhoneFold, SUBHEADING, READ, WIDE, MEASURE, READ_MEASURE_C, HERO_BUTTON_GROUND,
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
  if (shown.length === 0) return null;
  return (
    <figure className={className}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {shown.map((photo, i) => (
          <div
            key={photo.src}
            className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]`}
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
          </div>
        ))}
      </div>
      {/* lg에서는 홀수 칸이 36px 내려가 있어 그만큼 더 띄웁니다. */}
      <figcaption className={`mt-3 text-left max-sm:text-center ${META} text-white/85`}>{t(naru.eventHero.photosCaption)}</figcaption>
    </figure>
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
      <Chapter id="top" labelledBy="hero-title" align="center" wide className="pt-16 sm:pt-24 lg:pt-28">
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
            {/* 굵은 기간 줄. 8월의 "2026.08.22 – 08.29 8일" 자리. */}
            {/* 2026-09-18 (감사 반영 브리프 1.5): 주황 틴트 → 흰색 볼드. 주황은 점으로만. */}
            <p className={`mt-8 ${BODY} font-bold text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] lg:mt-14`}>
              {formatDecemberDateLine(locale)}
            </p>
            <p className={`mx-auto mt-4 max-w-xl break-keep ${BODY} font-bold leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]`}>
              {t(naru.december.heading)}
            </p>
            <p className={`mx-auto mt-3 max-w-xl text-balance break-keep ${BODY} leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]`}>
              {/* 나루 한 문장이 서술 첫 줄(감사 반영 브리프 1.2). TODO: confirm(문구는 사용자가). */}
              <span className="text-white">{t(naru.eventHero.naruLine)}</span>{" "}
              {t(naru.eventHero.sub)}
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:mt-14">
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
              {/* 오픈채팅이 막혀 있으면(links.openChat 빈 문자열, 2026-09-17) 이 앵커가
                  히어로의 유일한 문이라 주 CTA의 면(그라데이션 필)을 받습니다. 히어로의
                  주 CTA는 언제나 하나입니다. 등록이 열리면(regState open) 등록 버튼이 주 CTA. */}
              <a
                href="#december"
                onClick={() => track("naru_cta", { src: "hero", to: "december" })}
                className={`${buttonClass("secondary")} ${HERO_BUTTON_GROUND} max-sm:hidden`}
              >
                {t(naru.eventHero.ctaProgram)}
                <span aria-hidden className="text-white/70">↓</span>
              </a>
            </div>
            {regState === "not_open" && (
              <p id="hero-register-note" className={`mt-3 ${META} leading-snug text-white/85`}>{t(registerCopy.previewCtaNote)}</p>
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
        <div className={`${READ} text-center`}>
        <Eyebrow color="purple" className={eyebrowTrack(locale)}>
          {`${t(naru.december.eyebrowPrefix)}\u2002${decemberEventLabel(locale)}`}
        </Eyebrow>
        </div>
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
              <dd className={`order-1 ${TITLE} font-black leading-none text-white`}>
                {t(stat.value)}
              </dd>
              <dt className={`order-2 mt-1.5 break-keep text-center ${META} font-bold uppercase text-white/70 ${locale === "en" ? "tracking-[0.04em] sm:tracking-[0.1em]" : "tracking-normal"}`}>
                {t(stat.label)}
              </dt>
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
            stations={naru.december.stages.map((s) => ({
              key: s.name.en,
              // 2026-09-20 (일정 브리프 2장): 12/10이 Day 0입니다. dayOffset이 곧 Day 번호이고
              // +1을 더하지 않습니다. null 분기("본 일정 전")는 사라졌습니다.
              sub: `${t(naru.december.dayLabel)} ${s.dayOffset}`,
              label: t(s.title),
              kind: s.submit ? "anchor" : "plain",
              // 2026-10-10 (마일스톤 브리프 2.1): 마일스톤 줄이 생긴 날의 배지는 "제출" 한 낱말입니다. Day 1은 마일스톤과
              // 제출물이 같은 문장이라 두 번 읽혔고, 영문 768px에서는 길어진 Day 1 배지가 Day 3 배지와 겹쳤습니다.
              // 제출물의 이름은 아래 일정표의 행과 "이렇게 굴립니다"의 제출 줄이 말합니다.
              badge: s.submit ? (s.milestone ? t(naru.december.submitLabel) : `${t(naru.december.submitLabel)}\u2002${t(s.submit)}`) : undefined,
              milestone: s.milestone ? t(s.milestone) : undefined,
            }))}
            pills={[t(naru.december.mentoringHeading), t(naru.december.fieldMentoringPill)]}
            legend={{ anchor: t(naru.december.routeLegendSubmit), plain: t(naru.december.routeLegendStage), milestone: t(naru.december.routeLegendMilestone) }}
            current={hoverDay ?? 0}
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
        <Reveal className={`${READ} mt-10 text-left max-sm:text-center`}>
          <h3 data-subheading className={SUBHEADING}>{t(naru.december.scheduleLabel)}</h3>
          <p className={`${MEASURE} mt-3 break-keep ${BODY} leading-relaxed text-white/70`}>
            {t(naru.december.scheduleLead)}
          </p>
          <PhoneFold more={t({ ko: "날짜별 일정 보기", en: "Day-by-day schedule" })} less={t({ ko: "날짜별 일정 접기", en: "Hide the schedule" })}>
          <div className="mt-5">
            {naru.december.stages.map((stage, i) => {
            // DECIDED 2026-10-07 (이슈 브리프 4.2): Day 0 행을 흐리게 하지 않습니다. 2026-09-20에는 이 행만
            // 한 단 낮은 밝기(/55)였는데, 진한 회색 글이 바탕에 묻혀 읽히지 않았습니다. "스테이지로 세지
            // 않는다"는 것은 이 행의 문장(stage.line)이 이미 말합니다. 다섯 행의 밝기는 같습니다.
            return (
              <div
                key={stage.name.en}
                // 노선도의 현재 위치 점이 이 행으로 옵니다(감사 반영 브리프 3.6).
                // 카드가 하던 일을 행이 그대로 이어받습니다.
                onMouseEnter={() => setHoverDay(i)}
                onMouseLeave={() => setHoverDay(null)}
                className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-white/10 py-5 last:border-b sm:grid-cols-[7rem_1fr_10rem]"
              >
                <div className="flex items-baseline gap-2 max-sm:justify-center">
                  {/* lang="en": DAY는 두 로케일 모두 영어입니다(접근성 감사 7). */}
                  <span lang="en" className={LABEL_HEADING}>
                    {`${t(naru.december.dayLabel)}\u2002${stage.dayOffset}`}
                  </span>
                  <span className={`shrink-0 ${META} text-white/70`}>
                    {formatDecemberDayWithWeekday(locale, stage.dayOffset)}
                  </span>
                </div>
                <div>
                  <h4 className={ROW_HEADING}>{t(stage.title)}</h4>
                  {/* stage.body는 그리지 않습니다. 브리프 4장이 표로 옮긴다고 적은 것은
                      제출물 칩, 그날의 한 줄, 워크샵 셋입니다. 카드 본문까지 넣으면 한
                      행이 네 줄이 되고, 표가 아니라 세로로 세운 카드가 됩니다. 키는
                      data/naru.ts에 그대로 있습니다. */}
                  <p className={`mt-1.5 flex gap-1.5 break-keep max-sm:justify-center ${BODY} font-semibold leading-snug text-white`}>
                    {/* 2026-10-09: 가운데 정렬(폰)에서 글이 두 줄이 되면 화살표만 왼쪽 끝에 떨어져 숨깁니다. */}
                    <span aria-hidden className="text-white/70 max-sm:hidden">→</span>
                    {t(stage.line)}
                  </p>
                  {stage.session && (
                    <p className={`mt-1.5 flex flex-wrap items-baseline gap-x-1.5 break-keep max-sm:justify-center ${BODY} leading-relaxed text-white/70`}>
                      <span className={`font-bold uppercase ${latinTrack(locale)} text-accent`}>{t(naru.december.sessionLabel)}</span>
                      <span className="font-semibold text-white/85">{t(stage.session.title)}</span>
                      <span>{t(stage.session.body)}</span>
                    </p>
                  )}
                  {/* DECIDED 2026-10-10 (사용자: 넣은 정보는 그대로, 8월 캘린더 형식은 쓰지 않는다): 그날의 마일스톤은 표의 형식 안에서,
                      이 행의 글 기둥에 한 줄로 섭니다. 같은 날 아침에는 오른쪽 10rem 열의 META 한 줄이었는데 두 줄로 끊기고
                      눈에 들어오지 않았습니다. amber 칩(홈에서 "결과보다 과정" 상자가 쓰는 색)과 BODY 굵은 글, 뒤에 누가 받는지. */}
                  {stage.milestone && (
                    <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 break-keep max-sm:justify-center">
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 ${META} font-bold text-amber-100`}>
                        <span aria-hidden>★</span>{t(naru.december.milestoneLabel)}
                      </span>
                      <span className={`${BODY} font-bold leading-snug text-white`}>{t(stage.milestone)}</span>
                      {/* DECIDED 2026-10-10 (중복 브리프 B1): 뒤에 붙던 "넘은 팀 모두 지원"(milestoneNote)을 그리지 않습니다.
                          노선도 범례가 한 번 말합니다. 네 행에서 네 번 되풀이됐습니다. 키는 data/naru.ts에 그대로. */}
                    </p>
                  )}
                  {/* DECIDED 2026-10-08 (현장 팀 매칭 브리프 5): Day 1 행에만 있는 버튼 하나. 전에 오른쪽 열의 "팀 매칭"
                      칩이 있던 말을 버튼이 합니다. 글이 한 줄이라 10rem 오른쪽 열에는 들어가지 않아, 이 행의 글 기둥
                      왼쪽 끝에 맞춥니다(2026-09-29 왼쪽 끝 규칙). 알약 테두리 버튼(누르는 것의 문법), 글자는 BODY. */}
                  {stage.matchCta && (
                    <Link
                      href={stage.matchCta.href}
                      onClick={() => track("naru_cta", { src: "december-day1", to: "match" })}
                      className={`mt-3 inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-[#0B1430]/80 px-5 py-2 ${BODY} font-medium text-accent transition hover:border-white/30 hover:text-white`}
                    >
                      {t(stage.matchCta.label)}
                      <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap content-start items-start gap-x-3 gap-y-1 max-sm:justify-center">
                  {/* DECIDED 2026-10-10 (중복 브리프 B1): "제출 {제출물}" 칩을 그리지 않습니다. 같은 행의 마일스톤 줄이
                      같은 이름을 말합니다. stage.submit은 노선도의 ★ 판정에만 씁니다. */}
                  {stage.chips.map((c, j) => (
                    <span key={j} className={`${META} text-white/70`}>{t(c)}</span>
                  ))}
                </div>
              </div>
            );
            })}
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
          <h4 data-subheading className={`${SUBHEADING} mt-8`}>{t(naru.december.factsLabel)}</h4>
          <dl className="mt-3">
            {naru.december.facts.map((f, i) => (
              <div
                key={f.k.en}
                // 2026-10-09: 폰은 가운데 정렬이라 라벨을 값 위에 쌓습니다(전에는 폰에서도 2열, 라벨 81px).
                className={`grid grid-cols-1 gap-x-4 gap-y-1 border-t border-white/10 py-3 sm:grid-cols-[7rem_1fr] sm:gap-x-6 ${i === naru.december.facts.length - 1 ? "border-b" : ""}`}
              >
                {/* /50이 아니라 /75인 이유는 대비입니다(LABEL_HEADING이 같은 이유로
                    /75입니다). 12.24px은 큰 글자 예외를 받지 못해 4.5:1이 필요한데,
                    배경 입자가 지나가는 자리에서 /50은 3.19:1이었습니다.
                    2026-09-25 (가독성 브리프 4.2): 12.24px → 13.5px, 한국어 화면의 자간 0.16em → 0.
                    표의 행 라벨은 13px 이상, white/60 이상입니다. */}
                <dt className={`break-keep ${META} font-semibold uppercase ${latinTrack(locale)} text-white/70`}>{t(f.k)}</dt>
                <dd className={`break-keep ${BODY} leading-relaxed text-white/70`}>{t(f.v)}</dd>
              </div>
            ))}
          </dl>
          </PhoneFold>

        </Reveal>
        {/* General Mentoring. 초록 테두리 강조 상자(8월 "과정이 기록됩니다" 문법).
            2026-09-26 (한 축 브리프): lg에서 규칙 다섯이 가로로 서므로 WIDE입니다. 위 일정표와
            아래 재는 것은 READ라 Reveal을 셋으로 나눴습니다. 내용과 순서는 그대로. */}
        {/* 2026-09-29 (왼쪽 끝 브리프 2.1): WIDE → READ. 라벨을 규칙 옆이 아니라 위에 둡니다. READ 폭에서 옆에
            두면 규칙 다섯 칸이 100px 남짓이라 한두 자씩 끊깁니다. */}
        {/* 2026-09-30: 판 나누기가 이 상자 앞에서 아래(AI 활용 범위 앞)로 내려가, 이 상자는 위 표에 이어지는
            블록입니다. 블록 사이 간격(mt-8 lg:mt-12)을 씁니다. */}
        <PhoneFold more={t({ ko: "멘토링 자세히 보기", en: "Mentoring in detail" })} less={t({ ko: "멘토링 접기", en: "Hide mentoring" })}>
        <Reveal className={`${READ} mt-8 text-left max-sm:text-center lg:mt-12`}>
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-5 py-4 lg:px-7">
            <div className="shrink-0">
              <p className={`flex items-center gap-2 max-sm:justify-center ${BODY} font-bold text-white`}>
                <ChipDot />
                {/* lang="en" (2026-09-19, 접근성 감사 7): 한국어 문단 속의 영어 고유명사. */}
                <span lang="en">General Mentoring</span>
              </p>
              <p className={`mt-0.5 ${META} font-semibold text-emerald-200/90`}>{t(naru.december.mentoringAlways)}</p>
              {/* DECIDED 2026-10-10 (사용자, 마일스톤 브리프 2.5): 멘토링은 먼저 찾아가는 자리라는 문장을 상자 안에 그립니다.
                  mentoringLead는 그 전까지 화면에 그려지지 않던 키였습니다. 규칙 목록 위, 이름 줄 아래에 섭니다. */}
              <p className={`${MEASURE} mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.mentoringLead)}</p>
            </div>
            {/* 폰은 2열·작은 글자(길이 목표, 감사 반영 브리프 3.1). */}
            {/* 2026-09-19 (모바일 감사 14): 폰에서 2열을 풉니다. 상자 안쪽 291px을
                둘로 나누면 한 칸의 **글자 폭이 121px**, text-xs로 한글 8.9자/줄입니다.
                "마지막 날에는 새 방향을 제안하지 않음"(18자)이 세 줄, 영어는 네 줄이
                됐습니다. 한 줄 길이는 짧아도 문제입니다. 세로가 늘어나는 대가는
                아래 Day 카드의 clamp 완화와 같은 예산에서 나옵니다. */}
            {/* 2026-09-20 (일정 브리프 3장): 규칙이 넷에서 다섯이 되어 lg를 5열로.
                4열이면 다섯째 줄만 아래로 내려가 왼쪽 칸이 둘이 됩니다. */}
            {/* 2026-09-29 (왼쪽 끝 브리프 2.1, 검증 4): READ 폭에서 다섯 칸은 150px 남짓이라 "바뀝니다"가 넉 자로
                떨어졌습니다. 폰 한 칸, md부터 두 칸. */}
            {/* 2026-10-10: 규칙이 셋이 되어 한 칸으로 세웁니다. 두 칸이면 셋째만 아래로 내려가고, 세 칸이면 READ 폭에서 줄마다 두 줄로 꺾입니다. */}
            <ul role="list" className="grid flex-1 grid-cols-1 gap-y-2">
              {naru.december.mentoringRules.map((rule, i) => (
                <li key={i} className={`flex gap-2.5 break-keep border-l-2 border-white/20 pl-3 max-sm:justify-center max-sm:border-l-0 max-sm:pl-0 ${BODY} leading-snug text-white/85`}>
                  {t(rule)}
                </li>
              ))}
            </ul>
          </div>
          {/* DECIDED 2026-10-08 (사용자: "멘토가 오는 게 아니고 우리가 직접 간다", 프로그램 브리프 2.5): 현장 멘토링.
              General Mentoring 바로 아래에 한 묶음으로 섭니다(mt-3). 같은 READ 폭과 왼쪽 끝, 같은 상자 문법이고
              초록은 쓰지 않습니다(초록은 General Mentoring 하나, 2026-09-18). 무채색 테두리에 점만 노선도 둘째 필과 같은
              주황입니다(주황은 점으로만). 이름은 BODY 굵게, 기간은 META, 설명은 BODY. 규칙 목록은 없습니다.
              날짜, 횟수, 기업 이름은 쓰지 않습니다(미정). 위 초안 배너가 이 약속을 덮습니다. */}
          <div className="mt-3 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 lg:px-7">
            <p className={`flex items-center gap-2 max-sm:justify-center ${BODY} font-bold text-white`}>
              <ChipDot className="bg-naru-orange" />
              {t(naru.december.fieldMentoring.name)}
            </p>
            <p className={`mt-0.5 ${META} font-semibold text-white/70`}>{t(naru.december.fieldMentoring.when)}</p>
            <p className={`${MEASURE} mt-2 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.fieldMentoring.body)}</p>
          </div>
          {/* 재는 것. 호박색 강조 상자(8월 "준비물은 하나예요" 문법).

              2026-09-20 (사용자: "가장 중요한 것은 완주율이라는 거를 강조"): 라벨과
              문장을 한 줄에 "라벨: 문장"으로 붙여 두었더니, 이 챕터에서 가장 중요한
              문장이 각주처럼 읽혔습니다. 라벨을 자기 줄로 올리고 문장을 본문 크기로
              키웁니다. 상자 색과 문법은 그대로예요. 새 강조 장치를 만들지 않습니다.

              처음에는 이 자리에 "84%" 같은 수치를 크게 세우려고 했는데 걷었습니다.
              퍼센트를 한 번 적으면 그 수치가 목표가 되고, 다음 회차는 그 수치를
              지키려고 설계하게 됩니다(data/naru.ts의 measure 주석). */}
        </Reveal>
        </PhoneFold>
        {/* DECIDED 2026-10-10 (중복 브리프 B2): 이 자리의 호박색 "결과보다 과정" 상자(naru.why.measure)를 그리지 않습니다.
            #naru 코어 01의 "그래서 우리가 보는 것도 순위가 아니라 완주입니다"와 같은 말입니다. 키는 data/naru.ts에 그대로.
            그 자리에 findClose 문단이 섭니다. 평가가 과정이라는 말을 이 문단이 대신합니다. 상자 없이 READ 왼쪽 끝, BODY. */}
        <Reveal className={`${READ} text-left max-sm:text-center`}>
          <p className={`${MEASURE} mt-6 break-keep ${BODY} leading-relaxed text-white/85`}>{t(naru.december.findClose)}</p>
          {/* DECIDED 2026-10-10 (중복 브리프 B3): 8월과의 비교는 8월 페이지로 갔고, 여기는 그리로 가는 한 줄입니다. */}
          <Link
            href="/2026-08#gaps"
            onClick={() => track("naru_cta", { src: "december", to: "august-gaps" })}
            className={`mt-2 inline-flex min-h-[44px] items-center gap-1.5 ${BODY} font-medium text-accent underline-offset-4 transition hover:text-white hover:underline`}
          >
            {t(naru.december.gapsLink)}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
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
        <div className={`${READ} mt-8 text-balance text-center lg:mt-12`}>
        <p id="december-register-note" className={`text-balance break-keep text-center ${BODY} text-white/70`}>
          {regState === "closed" ? t(registerCopy.closed) : t(naru.december.ctaNote)}
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          {regState === "open" ? (
            <button type="button" onClick={() => { track("naru_cta", { src: "december", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
              {t(registerCopy.cta)}
              <span aria-hidden className={ARROW_CLASS}>→</span>
            </button>
          ) : regState === "not_open" ? (
            <>
              {/* 위 ctaNote("등록은 아직 열리지 않았습니다…")가 이 버튼의 캡션입니다. */}
              <PreparingButton t={t} noteId="december-register-note" onOpen={reg?.openRegister} />
              <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} variant="secondary" />
            </>
          ) : null}
          <a
            href={naruLinks.sponsor}
            onClick={() => track("naru_mail", { src: "december" })}
            // 2026-09-19 (모바일 감사 16): text → secondary. 오픈채팅이 막혀
            // 있고(links.openChat 빈 문자열) 등록 창도 닫혀 있어, 이 행에 남는
            // 것은 누를 수 없는 PreparingButton(테두리 + 면)과 이 메일 링크
            // 둘뿐입니다. 눈이 먼저 가는 쪽이 면을 가진 죽은 버튼이었어요.
            // 이 파일 맨 위의 원칙("누를 수 없는 버튼을 회색으로 남기지 않습니다")과
            // 어긋난 상태였습니다. 유령 필로 올려 살아 있는 쪽이 1순위가 되게 합니다.
            // 음수 마진도 함께 사라집니다(모바일 감사 23: gap-4 안에서 줄이 바뀌면
            // 행 간격이 −4.5px이 되던 자리).
            className={buttonClass("secondary", "naru")}
          >
            {t(naru.december.ctaMail)}
            <span aria-hidden>→</span>
          </a>
        </div>
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
        <p className={`${READ} ${READ_MEASURE_C} mt-6 break-keep text-center ${BODY} leading-relaxed text-white/85`}>
          {t(naru.gains.concrete)}
        </p>
        {/* DECIDED 2026-09-20 (표현 방식 브리프 3장): 카드 다섯 → 행 다섯.
            한 행에 36~51자를 담으려고 248×307 카드를 쓰고 있었습니다. 테두리와
            23px 여백이 글자보다 존재감이 컸습니다. 데스크톱도 모바일과 같은 구조로,
            번호와 제목이 왼쪽 고정 폭, 설명이 오른쪽. 칸을 나누는 것은 테두리가 아니라
            헤어라인입니다. 상자는 여기서 하는 일이 없었습니다(2장 규칙).

            번호 알약 상자도 뺐습니다. 번호 다섯 개는 눌리는 것도 기록도 경고도 아닙니다.

            제목 칸이 14rem이고 제목 크기가 1.35rem인 이유: 루트가 18px이라 H3
            클램프가 1440에서 34.2px까지 올라가고, 그러면 "실명 기업의 진짜 문제"가
            283px라 어느 칸에도 한 줄로 안 들어갑니다. 1.35rem은 H3 클램프의 아래 끝
            그대로이고(24.3px), 그 크기에서 가장 긴 제목이 201px입니다. 새 계단을 만든
            것이 아니라 있는 계단의 한 끝에 고정한 것입니다.

            행 여백이 데스크톱에서도 py-5인 이유: 이 챕터는 md부터 min-h-screen이라
            1440×900에서 바닥이 900px입니다. py-6이면 안쪽 내용이 705px가 되어 그
            바닥을 21px 밀어 올립니다. 한 줄 제목 다섯 개에 54px 여백은 필요하지도
            않았고요.

            item.evidence는 그대로 두고 그리지 않습니다. 8월 숫자는 #record가 갖습니다. */}
        <Reveal>
        {/* role="list" (2026-09-19, 접근성 감사 10): Tailwind preflight의
            list-style:none 때문에 Safari/VoiceOver가 목록 역할을 떼어 냅니다. */}
        <ol role="list" className={`${READ} mt-10 text-left max-sm:text-center`}>
          {naru.gains.items.map((item) => (
            <li
              key={item.num}
              className="grid grid-cols-1 items-start gap-x-4 gap-y-1 border-t border-white/10 py-5 last:border-b sm:grid-cols-[2.25rem_14rem_1fr] sm:gap-x-6"
            >
              <span className={`pt-0.5 ${BODY} font-black tabular-nums text-accent`}>{item.num}</span>
              <h3 className={ROW_HEADING}>{t(item.title)}</h3>
              <p className={`break-keep ${BODY} leading-relaxed text-white/70 sm:col-start-3`}>
                {t(item.body)}
              </p>
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

      <SiteFooter />
    </>
  );
}
