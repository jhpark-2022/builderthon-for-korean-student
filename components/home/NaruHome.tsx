"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy, type Layer, type Stat, type RecordPhoto } from "@/data/naru";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import { links, type Phrase } from "@/data/dictionary";
import { useEffect, useId, useRef, useState } from "react";
import {
  DECEMBER_EVENT_NAME,
  DECEMBER_STARTS_AT_MS,
  DECEMBER_STARTS_AT_SG_MS,
  decemberEventLabel,
  formatDecemberDateLine,
  formatDecemberDay,
  formatDecemberDayWithWeekday,
} from "@/lib/naruDates";
import Glass from "@/components/ui/Glass";
import Halo from "@/components/ui/Halo";
import Chip, { ChipDot } from "@/components/ui/Chip";
import { buttonClass, ARROW_CLASS } from "@/components/ui/Button";
import RouteMap from "@/components/shared/RouteMap";
import MobileChatBar from "@/components/shared/MobileChatBar";
import { BAND_TINT, BandFades } from "@/components/shared/Band";
import Chapter from "@/components/journey/Chapter";
import Reveal from "@/components/shared/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
// RecordTabs: 2026-09-17에 뺐다가(사용자: 바로 아카이브로) 2026-09-18 감사 반영 브리프 5.2로
// 다시 넣었습니다. 멘토 / 연사와 피드백 패널 둘만.
// (2026-09-19: RecordTabs·PressRows·Funnel은 화면에서 내려가 import도 뺐습니다. 파일은 그대로.)
import { H2, H3, LABEL_HEADING, ROW_HEADING, STATEMENT, GRADIENT_TEXT } from "@/components/ui/typography";
import NaruMark from "@/components/ui/NaruMark";
import MotionToggle from "@/components/ui/MotionToggle";

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

// TODO: confirm (왜 브리프 9장). #join의 규모 숫자입니다. 쓰려면 "싱가포르의 한인
// 유학생 수"와 "이들을 가로질러 이어 온 학생 단체 수"의 출처가 있어야 합니다.
// 출처가 확인되면 값을 채우고 true로. false인 동안 statTbd도 그리지 않습니다.
// 공개 숫자는 근거를 댈 수 있어야 합니다. 매니페스토에 있다는 것은 근거가 아닙니다.
const JOIN_STAT_CONFIRMED: boolean = false;

// ── 상자를 쓰는 자리 (DECIDED 2026-09-20, 표현 방식 브리프) ──────────────────
// 셋뿐입니다. ①누를 수 있는 것 ②여러 항목이 한 덩어리로 묶여야 하는 기록
// ③본문에서 떼어 놓아야 하는 경고. 그 밖의 짧은 병렬 문장은 목록입니다.
//
// 이 규칙 전에는 5일 일정표도 상자, 한 문장 주의사항도 상자, PDF 링크도
// 상자였습니다. 모든 것이 같은 모양이면 독자가 형태만 보고 "읽을 것 / 누를 것 /
// 경고"를 구분할 수 없습니다. 계측으로는 상자 없는 #record가 100자당 124px,
// 카드뿐인 #gains가 336px이었습니다.
// ──────────────────────────────────────────────────────────────────────────────
// 카드 한 장. 8월의 Glass와 같은 값이지만, 그 컴포넌트는 Journey.tsx 안에
// 있습니다. 두 줄짜리 래퍼를 꺼내려고 5,157줄 파일을 건드리지 않았습니다.
function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

// 문장 안의 한 구절을 앵커로. notSequel의 "변하지 않는 두 개"가 #why로 갑니다.
// 구절이 문장에 없으면(번역이 어긋나면) 링크 없이 문장만 그립니다. 깨진 링크보다
// 링크 없는 문장이 낫습니다.
function TermLink({ text, term, href }: { text: string; term: string; href: string }) {
  const i = text.indexOf(term);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <a
        href={href}
        // py-2.5 -my-2.5: 히트 영역만 44px(모바일 수정 브리프 5). 레이아웃은 그대로.
        // min-h-[44px] 명시 (2026-09-19, 모바일 감사 22). -my-2.5 + py-2.5 +
        // 감싼 문단의 leading으로 44.4px이 나오지만, 문단 글자 크기를 한 단만
        // 내려도 바로 44px 아래로 떨어집니다. 계산에 기대지 않습니다. 같은 파일의
        // 다른 두 자리가 이미 세 짝(-my-2.5 / min-h-[44px] / py-2.5)을 씁니다.
        className="-my-2.5 inline-flex min-h-[44px] items-center py-2.5 underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
      >
        {term}
      </a>
      {text.slice(i + term.length)}
    </>
  );
}

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
  const rows: { key: Phrase; l: Left | null }[] = [
    { key: naru.eventHero.countdownRows.seoul, l: left },
    { key: naru.eventHero.countdownRows.singapore, l: leftSg },
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
      <p aria-hidden className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
        <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-naru-orange" />
        {t(naru.eventHero.countdownLabel)}
        {/* /45 → /60 (2026-09-19, 접근성 감사 2). 이 줄은 sm:hidden이라 **폰에서만**
            보이는데 흰색 45%는 #070B1F 위에서 4.49:1로 AA(4.5:1)에 못 미칩니다.
            globals.css의 대비 표도 "/45는 --bg에서 간발의 차로 실패"라고 적어 두었어요.
            폰에서 이벤트 날짜를 읽으려는 사람이 가장 읽기 어려운 글자로 보게 됩니다.
            /60은 7.25:1입니다. 감싼 <p>가 aria-hidden이라 낭독 대체 경로도 없습니다. */}
        <span className="text-white/60 sm:hidden">{` · ${formatDecemberDayWithWeekday(locale, 0)}`}</span>
      </p>
      {/* 2026-09-19 (사용자: "시간 타이머가 좀 더 박스를 꽉 채워주면 좋겠다"): 칸을 격자로
          나눕니다. 전에는 flex라 숫자 셋이 왼쪽에 몰리고 상자의 오른쪽 절반이 비어
          있었습니다. sm부터 라벨 한 칸 + 일·시간·분 세 칸을 같은 너비로 펴고, 숫자도
          한 단 키웁니다(1.6rem → 2.25rem). 폰은 일만 보이므로 두 칸 그대로입니다. */}
      <div aria-hidden className="mt-2.5 grid gap-y-2">
        {rows.map((r) => (
          <div
            key={r.key.en}
            // 2026-09-19 (모바일 감사 1): 폰 라벨 트랙 6.5rem(117px) → 4.5rem(81px),
            // 숫자 칸은 1fr → minmax(0,1fr). `1fr`은 minmax(auto,1fr)이라 **내용보다
            // 작아지지 못합니다.** 영어 단위(days/hrs)가 한글(일/시간)보다 두 배 넓어
            // 360px에서 숫자 칸이 패널 밖으로 밀렸습니다(계산상 37px 초과).
            // 81px은 이 트랙이 담는 최장 문자열("Seoul time" 약 72px, "싱가포르 SGT"
            // 약 78px)이 한 줄로 들어가는 값입니다.
            className="grid grid-cols-[4.5rem_repeat(2,minmax(0,1fr))] items-baseline gap-x-2 sm:grid-cols-[8.5rem_repeat(3,minmax(0,1fr))] sm:gap-x-4"
          >
            <span className="min-w-0 whitespace-nowrap text-[0.68rem] font-semibold text-white/55 sm:text-xs">{t(r.key)}</span>
            {r.l === "started" ? (
              <span className="col-span-2 text-xl font-black text-white sm:col-span-3">{t(naru.eventHero.started)}</span>
            ) : (
              cellsOf(r.l).map((c, i) => (
                <span key={i} className={`min-w-0 items-baseline gap-1.5 ${c.phone ? "flex" : "hidden sm:flex"}`}>
                  <span className="text-[1.75rem] font-black leading-none tabular-nums text-white sm:text-[2.25rem]">{c.v}</span>
                  <span className="text-xs font-semibold text-white/55">{t(c.u)}</span>
                </span>
              ))
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
            className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] ${i % 2 === 1 ? "lg:translate-y-8" : ""}`}
          >
            <Image src={photo.src} alt={t(photo.alt)} fill sizes="(max-width: 1023px) 45vw, 280px" priority={!desktopOnly && i < 2} className="object-cover object-center" />
            {photo.day && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-[0.68rem] font-bold text-white transition-transform duration-300 group-hover:translate-y-0 motion-reduce:transition-none lg:block"
              >
                {t(photo.day)}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* lg에서는 홀수 칸이 36px 내려가 있어 그만큼 더 띄웁니다. */}
      <figcaption className="mt-3 text-center text-[0.68rem] text-white/50 lg:mt-12 lg:text-left">{t(naru.eventHero.photosCaption)}</figcaption>
    </figure>
  );
}

// 창이 열리기 전의 등록 버튼(감사 반영 브리프 1.1). 흐림(opacity) 대신 색으로 비활성을 말합니다:
// 흰 글자 /70은 바탕 위 9:1이라 4.5:1을 넉넉히 넘습니다. disabled 속성 대신 aria-disabled를
// 쓰는 이유는 포커스가 닿아야 aria-describedby의 캡션이 읽히기 때문입니다. 누르면 아무 일도
// 없습니다. 창이 열리면 부르는 쪽의 open 분기가 대신 그립니다.
function PreparingButton({ t, noteId, className = "" }: { t: (p: Phrase) => string; noteId: string; className?: string }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      aria-describedby={noteId}
      onClick={(e) => e.preventDefault()}
      className={`inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/70 sm:px-8 sm:py-4 sm:text-base ${className}`}
    >
      {t(registerCopy.preparing)}
      <span aria-hidden className="text-white/40">→</span>
    </button>
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
  // docs/changelogs/changelog-september-20-2026-hero-recede-fix.md와
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
      <Chapter id="top" labelledBy="hero-title" align="center" wide className="pt-16 sm:pt-24 lg:pt-20">
        {/* relative는 2026-09-17에 framer-motion의 useScroll target 경고 때문에
            붙었습니다. 그 훅은 2026-09-20에 사라졌지만 클래스는 둡니다. 히어로가
            앉는 쌓임 맥락이고, 빼는 것은 아무도 요청하지 않은 레이아웃 변경입니다. */}
        <div className="relative grid items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:px-0">
          <div className="text-center lg:pl-10 lg:text-left xl:pl-16">
            <Eyebrow color="purple">{t(naru.eventHero.eyebrow)}</Eyebrow>
            {/* 8월 H1과 같은 clamp. 2행은 그라데이션 토큰(GRADIENT_TEXT). ko는
                "크로싱 서울" / "CROSSING SEOUL", en은 "CROSSING" / "SEOUL".
                390px에서 각 줄이 한 줄에 들어갑니다(2행은 0.82em, 실측 2026-09-17). */}
            <h1 id="hero-title" className="text-[clamp(2.4rem,9.5vw,6.5rem)] font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_40px_rgba(75,58,140,0.5)] lg:text-[clamp(2.65rem,6vw,5.5rem)]">
              {locale === "ko" && DECEMBER_EVENT_NAME ? (
                <>
                  <span className="block break-keep text-white">{DECEMBER_EVENT_NAME.ko}</span>{" "}
                  {/* lang="en" (2026-09-19, 접근성 감사 7): <html lang="ko">라
                      한국어 TTS가 "CROSSING SEOUL"을 한글 음가로 읽습니다. 이
                      사이트를 처음 듣는 사람이 듣는 **첫 줄**이 그것입니다.
                      사이의 {" "}는 이름 계산용(감사 17): block span 둘 사이에
                      텍스트 노드가 없으면 "크로싱 서울CROSSING SEOUL"로 붙어
                      읽힙니다. block이라 화면에는 영향이 없습니다. */}
                  <span lang="en" className={`${GRADIENT_TEXT} block text-[0.82em] tracking-[0.02em]`}>{DECEMBER_EVENT_NAME.en}</span>
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
            <p className="mt-8 text-sm font-bold text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base">
              {formatDecemberDateLine(locale)}
            </p>
            <p className="mx-auto mt-4 max-w-xl break-keep text-base font-bold leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] lg:mx-0">
              {t(naru.december.heading)}
            </p>
            <p className="mx-auto mt-3 max-w-xl break-keep text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base lg:mx-0">
              {/* 나루 한 문장이 서술 첫 줄(감사 반영 브리프 1.2). TODO: confirm(문구는 사용자가). */}
              <span className="text-white">{t(naru.eventHero.naruLine)}</span>{" "}
              {t(naru.eventHero.sub)}
            </p>
            <div className="mt-10 flex flex-wrap items-start justify-center gap-3 lg:justify-start">
              {regState === "open" ? (
                <button type="button" onClick={() => { track("naru_cta", { src: "hero", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
                  {t(registerCopy.cta)}
                  <span aria-hidden className={ARROW_CLASS}>→</span>
                </button>
              ) : regState === "closed" ? (
                <span className={`${buttonClass("secondary")} cursor-default opacity-70`}>{t(registerCopy.closed)}</span>
              ) : (
                // 창이 열리기 전: "등록 준비 중" + 바로 아래 12px 캡션(감사 반영 브리프 1.1).
                // 그 전(2026-09-18 아침)의 반투명 "등록하기"는 이유 없이 죽어 있는 1차 CTA였습니다.
                <div className="flex flex-col items-center gap-2 lg:items-start">
                  <PreparingButton t={t} noteId="hero-register-note" />
                  <p id="hero-register-note" className="text-[0.68rem] leading-snug text-white/60">{t(registerCopy.preparingNote)}</p>
                </div>
              )}
              {/* 오픈채팅이 막혀 있으면(links.openChat 빈 문자열, 2026-09-17) 이 앵커가
                  히어로의 유일한 문이라 주 CTA의 면(그라데이션 필)을 받습니다. 히어로의
                  주 CTA는 언제나 하나입니다. 등록이 열리면(regState open) 등록 버튼이 주 CTA. */}
              <a
                href="#december"
                onClick={() => track("naru_cta", { src: "hero", to: "december" })}
                className={buttonClass("secondary")}
              >
                {t(naru.eventHero.ctaProgram)}
                <span aria-hidden className="text-white/50">↓</span>
              </a>
            </div>
            {/* 카운트다운(얇은 한 줄). lg부터 여기, 그 아래 폭에서는 무대 다음에. */}
            <CountdownPanel t={t} locale={locale} className="mt-8 hidden lg:block" />
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
          5차 그대로이고 바뀐 것은 보이는 문법입니다. */}
      <Chapter id="december" labelledBy="december-title" align="center" className={BAND_TINT}>
        <BandFades />
        {/* 2026-09-18 (감사 반영 브리프 8): 아이브로는 보라 외곽선 1종. 주황 글자·주황 발광을 뺐습니다. */}
        <Eyebrow color="purple">
          {`${t(naru.december.eyebrowPrefix)}\u2002${decemberEventLabel(locale)}`}
        </Eyebrow>
        <h2 id="december-title" className={H2}><Halo tone="violet">{t(naru.december.programHeading)}</Halo></h2>
        {/* 폰에서 3줄을 넘는 문단은 왼쪽 정렬 (2026-09-19, 모바일 감사 8). #naru가
            이미 쓰던 규칙(감사 반영 브리프 6.1)인데 #december와 #join에는 적용되지
            않았습니다. 336px 폭에 한글 18자/줄이면 서너 줄 문단이 양쪽 들쭉날쭉한
            마름모로 서고, 눈이 줄마다 시작점을 다시 찾아야 합니다. */}
        <p className="mx-auto mt-6 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
          {t(naru.december.shapeLead)}
        </p>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-left text-sm leading-relaxed text-white/55 lg:text-center">
          <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="#why" />
        </p>
        {/* 초안 고지(DECIDED 2026-09-18, 사용자): 세부 내용이 바뀔 수 있다는 것을 챕터 머리에서
            확실하게. 호박색 점선 상자(pending 칩과 같은 계열). 8월 문법의 강조 상자 크기. */}
        <div role="note" className="mx-auto mt-6 max-w-2xl rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 text-left sm:flex sm:items-start sm:gap-3">
          <span className="mr-2 inline-block shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 align-[2px] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-200 sm:mr-0 sm:mt-0.5">{t(naru.december.draftLabel)}</span>
          <p className="inline break-keep text-sm leading-relaxed text-amber-50/90 sm:block">{t(naru.december.draftNote)}</p>
        </div>
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
            비대칭으로 보이던 자리입니다. */}
        <dl className="mx-auto mt-5 flex max-w-2xl items-stretch justify-center">
          {[naru.december.shape[0], naru.december.shape[3]].map((stat, i) => (
            // dl의 직계는 div 한 겹이고 그 안은 dt/dd뿐입니다. 그래서 구분선을
            // 엘리먼트로 두지 못하고 ::before로 그립니다. 화면은 같습니다.
            <div
              key={stat.label.en}
              className={`relative flex flex-col items-center px-1 ${
                i > 0
                  ? "ml-3 pl-3 before:absolute before:left-0 before:top-1/2 before:h-9 before:w-px before:-translate-y-1/2 before:bg-white/[0.14] before:content-[''] sm:ml-9 sm:pl-9"
                  : ""
              }`}
            >
              <dd className="order-1 text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-none text-white">
                {t(stat.value)}
              </dd>
              <dt className="order-2 mt-1.5 break-keep text-center text-[0.68rem] font-bold uppercase tracking-[0.04em] text-white/50 sm:tracking-[0.1em]">
                {t(stat.label)}
              </dt>
            </div>
          ))}
        </dl>
        </Reveal>

        {/* 노선도. 정거장 다섯, ★는 제출이 있는 날. 레일 아래 초록 필이
            General Mentoring(8월의 "1:1 멘토링 매일" 필 자리). */}
        <Reveal className="mx-auto mt-8 max-w-5xl text-left">
          <RouteMap
            ariaLabel={t(naru.december.routeAria)}
            stations={naru.december.stages.map((s) => ({
              key: s.name.en,
              // 2026-09-20 (일정 브리프 2장): 12/10이 Day 0입니다. dayOffset이 곧 Day 번호이고
              // +1을 더하지 않습니다. null 분기("본 일정 전")는 사라졌습니다.
              sub: `${t(naru.december.dayLabel)} ${s.dayOffset}`,
              label: t(s.title),
              kind: s.submit ? "anchor" : "plain",
              badge: s.submit ? `${t(naru.december.submitLabel)}\u2002${t(s.submit)}` : undefined,
            }))}
            pill={t(naru.december.mentoringHeading)}
            legend={{ anchor: t(naru.december.routeLegendSubmit), plain: t(naru.december.routeLegendStage) }}
            current={hoverDay ?? 0}
          />
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
        <Reveal className="mx-auto mt-10 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.scheduleLabel)}</h3>
          <p className="mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.scheduleLead)}
          </p>
          <div className="mt-5">
            {naru.december.stages.map((stage, i) => {
            // DECIDED 2026-09-20 (일정 브리프 2.2): Day 0만 한 단 낮은 밝기입니다.
            // PDF 03이 "Day 1에 쓸 시간을 벌어 주는 장치이지, 별도의 스테이지가
            // 아닙니다"라고 못박고 있는데, 다섯 칸이 같은 굵기면 그 말이 무너집니다.
            // 행을 지우거나 접지 않습니다. 날짜가 붙은 하루이고 세션도 있습니다.
            const day0 = stage.dayOffset === 0;
            return (
              <div
                key={stage.name.en}
                // 노선도의 현재 위치 점이 이 행으로 옵니다(감사 반영 브리프 3.6).
                // 카드가 하던 일을 행이 그대로 이어받습니다.
                onMouseEnter={() => setHoverDay(i)}
                onMouseLeave={() => setHoverDay(null)}
                className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-white/10 py-5 last:border-b sm:grid-cols-[7rem_1fr_10rem]"
              >
                <div className="flex items-baseline gap-2">
                  {/* lang="en": DAY는 두 로케일 모두 영어입니다(접근성 감사 7). */}
                  <span lang="en" className={LABEL_HEADING}>
                    {`${t(naru.december.dayLabel)}\u2002${stage.dayOffset}`}
                  </span>
                  <span className="shrink-0 text-xs text-white/50">
                    {formatDecemberDayWithWeekday(locale, stage.dayOffset)}
                  </span>
                </div>
                <div>
                  <h4 className={day0 ? `${ROW_HEADING} !text-white/55` : ROW_HEADING}>{t(stage.title)}</h4>
                  {/* stage.body는 그리지 않습니다. 브리프 4장이 표로 옮긴다고 적은 것은
                      제출물 칩, 그날의 한 줄, 워크샵 셋입니다. 카드 본문까지 넣으면 한
                      행이 네 줄이 되고, 표가 아니라 세로로 세운 카드가 됩니다. 키는
                      data/naru.ts에 그대로 있습니다. */}
                  <p className={`mt-1.5 flex gap-1.5 break-keep text-sm font-semibold leading-snug ${day0 ? "text-white/55" : "text-white"}`}>
                    <span aria-hidden className="text-white/50">→</span>
                    {t(stage.line)}
                  </p>
                  {stage.session && (
                    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 break-keep text-sm leading-relaxed text-white/55">
                      <span className={`font-bold uppercase tracking-[0.14em] ${day0 ? "text-accent/75" : "text-accent"}`}>{t(naru.december.sessionLabel)}</span>
                      <span className={day0 ? "font-semibold text-white/55" : "font-semibold text-white/85"}>{t(stage.session.title)}</span>
                      <span>{t(stage.session.body)}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                  {stage.submit && (
                    <span className="text-xs font-bold text-[#C79BB4]">
                      {`${t(naru.december.submitLabel)}\u2002${t(stage.submit)}`}
                    </span>
                  )}
                  {stage.chips.map((c, j) => (
                    <span key={j} className={day0 ? "text-xs text-white/55" : "text-xs text-white/60"}>{t(c)}</span>
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
          <h4 className={`${LABEL_HEADING} mt-8`}>{t(naru.december.factsLabel)}</h4>
          <dl className="mt-3">
            {naru.december.facts.map((f, i) => (
              <div
                key={f.k.en}
                // 폰에서도 2열입니다. 라벨이 두 글자라 81px이면 충분하고, 위로
                // 쌓으면 네 행에 라벨 줄이 넷 더 생깁니다.
                className={`grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-1 border-t border-white/10 py-3 sm:grid-cols-[7rem_1fr] sm:gap-x-6 ${i === naru.december.facts.length - 1 ? "border-b" : ""}`}
              >
                {/* /50이 아니라 /75인 이유는 대비입니다(LABEL_HEADING이 같은 이유로
                    /75입니다). 12.24px은 큰 글자 예외를 받지 못해 4.5:1이 필요한데,
                    배경 입자가 지나가는 자리에서 /50은 3.19:1이었습니다. */}
                <dt className="break-keep text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/75">{t(f.k)}</dt>
                <dd className="break-keep text-sm leading-relaxed text-white/70">{t(f.v)}</dd>
              </div>
            ))}
          </dl>

          {/* General Mentoring. 초록 테두리 강조 상자(8월 "과정이 기록됩니다" 문법). */}
          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-5 py-4 lg:flex-row lg:items-center lg:gap-8 lg:px-7">
            <div className="shrink-0 lg:w-56">
              <p className="flex items-center gap-2 text-base font-bold text-white">
                <ChipDot />
                {/* lang="en" (2026-09-19, 접근성 감사 7): 한국어 문단 속의 영어 고유명사. */}
                <span lang="en">General Mentoring</span>
              </p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-200/90">{t(naru.december.mentoringAlways)}</p>
            </div>
            {/* 폰은 2열·작은 글자(길이 목표, 감사 반영 브리프 3.1). */}
            {/* 2026-09-19 (모바일 감사 14): 폰에서 2열을 풉니다. 상자 안쪽 291px을
                둘로 나누면 한 칸의 **글자 폭이 121px**, text-xs로 한글 8.9자/줄입니다.
                "마지막 날에는 새 방향을 제안하지 않음"(18자)이 세 줄, 영어는 네 줄이
                됐습니다. 한 줄 길이는 짧아도 문제입니다. 세로가 늘어나는 대가는
                아래 Day 카드의 clamp 완화와 같은 예산에서 나옵니다. */}
            {/* 2026-09-20 (일정 브리프 3장): 규칙이 넷에서 다섯이 되어 lg를 5열로.
                4열이면 다섯째 줄만 아래로 내려가 왼쪽 칸이 둘이 됩니다. */}
            <ul role="list" className="grid flex-1 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-5">
              {naru.december.mentoringRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 break-keep border-l-2 border-white/20 pl-3 text-xs leading-snug text-white/85 sm:text-sm">
                  {t(rule)}
                </li>
              ))}
            </ul>
          </div>
          {/* 재는 것. 호박색 강조 상자(8월 "준비물은 하나예요" 문법).

              2026-09-20 (사용자: "가장 중요한 것은 완주율이라는 거를 강조"): 라벨과
              문장을 한 줄에 "라벨: 문장"으로 붙여 두었더니, 이 챕터에서 가장 중요한
              문장이 각주처럼 읽혔습니다. 라벨을 자기 줄로 올리고 문장을 본문 크기로
              키웁니다. 상자 색과 문법은 그대로예요. 새 강조 장치를 만들지 않습니다.

              처음에는 이 자리에 "84%" 같은 수치를 크게 세우려고 했는데 걷었습니다.
              퍼센트를 한 번 적으면 그 수치가 목표가 되고, 다음 회차는 그 수치를
              지키려고 설계하게 됩니다(data/naru.ts의 measure 주석). */}
          <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-5 py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-200">
              {t(naru.why.measureLabel)}
            </p>
            <p className="mt-2 break-keep text-left text-base font-semibold leading-relaxed text-white lg:text-center">
              {t(naru.why.measure)}
            </p>
          </div>
        </Reveal>

        {/* DECIDED 2026-09-20 (일정 브리프 4장, PDF 01): 학생이 도전할 수 있는 AI 활용
            범위 셋. "8월은 셋 중 하나만 썼습니다"가 12월이 왜 다른지를 한 눈에
            말합니다. 바로 아래 gaps 첫 항목이 같은 이야기를 덜 선명하게 하고 있어서
            이 셋이 그 항목의 근거가 됩니다. 그래서 gaps 바로 위입니다.

            상자가 아니라 3열 행 하나입니다(표현 방식 브리프 2장). iii은 지난 것이라
            한 단 낮은 밝기이고, i·ii의 when만 accent입니다. 번호(i·ii·iii)는 로마
            숫자 그대로 PDF에서 옵니다. */}
        <Reveal className="mx-auto mt-8 max-w-5xl text-left lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.december.scopeLabel)}</h3>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/70">{t(naru.december.scopeNote)}</p>
          <ol role="list" className="mt-5 grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">
            {naru.december.scope.map((sc, i) => {
              const past = sc.num === "iii";
              return (
                <li
                  key={sc.num}
                  className={`border-b border-white/10 py-4 sm:border-b-0 sm:py-0 sm:pt-4 ${i > 0 ? "sm:border-l sm:border-white/10 sm:pl-6" : ""} ${i < 2 ? "sm:pr-6" : ""}`}
                >
                  {/* 한 단 낮춤은 /55입니다. 같은 챕터의 Day 0 행이 쓰는 값이고,
                      /45는 배경 입자 위에서 3.35:1이었습니다. */}
                  <p className={`flex items-baseline gap-2 break-keep ${past ? "text-white/55" : "text-white"}`}>
                    {/* uppercase를 걸지 않습니다. PDF의 번호가 소문자 로마 숫자(i · ii · iii)입니다. */}
                    <span lang="en" className={`shrink-0 text-[0.68rem] font-black tracking-[0.12em] ${past ? "text-white/55" : "text-accent"}`}>{sc.num}</span>
                    <span className="text-sm font-bold leading-snug">{t(sc.title)}</span>
                  </p>
                  <p className={`mt-1.5 break-keep text-[0.68rem] font-bold uppercase tracking-[0.14em] ${past ? "text-white/55" : "text-accent"}`}>
                    {t(sc.when)}
                  </p>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 break-keep text-sm leading-relaxed text-white/70">{t(naru.december.scopeClose)}</p>
        </Reveal>

        {/* 8월에 아쉬웠던 넷과 12월의 답. 번호 배지 카드 넷(8월 BenefitCard 문법), 2×2.
            제목이 아쉬웠던 것, 본문이 12월의 답. */}
        <Reveal className="mx-auto mt-8 max-w-5xl text-left lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.december.gapsHeading)}</h3>
          {/* 폰은 1열(모바일 수정 브리프 1.3). 2열이면 150px 폭에서 "12월" 답이 서너 글자씩
              끊겼습니다. 폰에서는 번호 배지가 제목 왼쪽에 인라인. sm부터 2열, 배지 위. */}
          {/* 폰은 상자 없이 행(구분선만). sm부터 카드 2열. */}
          <ol role="list" className="mt-3 grid grid-cols-1 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            {naru.record.gaps.map((gap, i) => (
              <li key={gap.title.en} className="relative border-b border-white/10 py-3 last:border-b-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-4 sm:transition sm:hover:border-accent/30 sm:hover:bg-white/[0.05]">
                <div className="flex items-center gap-2.5 sm:block">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-xs font-black text-accent sm:h-8 sm:w-8 sm:text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="break-keep text-sm font-bold leading-snug text-white sm:mt-2.5 sm:text-base">{t(gap.title)}</h4>
                </div>
                <p className="mt-2 flex items-start gap-2 break-keep text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" />
                  <span>
                    <span className="mr-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent">{t(naru.december.decemberLabel)}</span>
                    {gap.answer ? t(gap.answer) : t(naru.record.answerPending)}
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </Reveal>

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
        <Reveal className="mx-auto mt-8 max-w-5xl text-left lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.after.stepsLabel)}</h3>
          {/* 폰에는 아래 테두리가 없습니다. 셋일 때는 행 사이를 가르는 선이었고
              마지막 행은 last:border-b-0으로 뺐습니다. 하나만 남으면 그 선은
              가를 것이 없어 떠 있는 줄이 됩니다. */}
          <div className="mt-3 py-3 sm:mt-5 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-5">
            <h4 className="break-keep text-sm font-bold leading-snug text-white sm:text-base">
              {t(naru.after.steps[0].title)}
            </h4>
            <p className="mt-2 break-keep text-sm leading-relaxed text-white/75">{t(naru.after.steps[0].body)}</p>
          </div>
        </Reveal>

        {/* DECIDED 2026-09-18 (사용자): "아직 정해지지 않은 것" 상자를 뺐습니다. 미정 목록
            대신 위 draftNote 한 줄("새로 정해지는 것은 이 자리에 업데이트합니다")이 그 말을
            합니다. december.tbd 키는 그대로. */}

        {/* 참여 플로우 스트립(등록 → 팀 본딩 → 닷새 → 결과 공유회)은 뺐습니다(2026-09-18, 감사 반영
            브리프 3.2). 노선도가 데스크톱에서 렌더되는 것을 확인했고, 같은 시간축을 두 번 그리고
            있었습니다. FlowStrip 컴포넌트와 december.flow 키는 그대로. */}

        {/* 문. 참가자는 오픈채팅(2차 유령 필), 출제사와 후원은 텍스트 링크.
            페이지의 그라데이션 필은 히어로 하나뿐입니다. */}
        <p id="december-register-note" className="mx-auto mt-8 max-w-2xl break-keep text-left text-sm text-white/55 lg:mt-12 lg:text-center">
          {regState === "closed" ? t(registerCopy.closed) : t(naru.december.ctaNote)}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {regState === "open" ? (
            <button type="button" onClick={() => { track("naru_cta", { src: "december", to: "register" }); reg?.openRegister(); }} className={`group ${buttonClass("primary", "naru")}`}>
              {t(registerCopy.cta)}
              <span aria-hidden className={ARROW_CLASS}>→</span>
            </button>
          ) : regState === "not_open" ? (
            <>
              {/* 위 ctaNote("등록은 아직 열리지 않았습니다…")가 이 버튼의 캡션입니다. */}
              <PreparingButton t={t} noteId="december-register-note" />
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
      </Chapter>

      {/* ── CH2 · 오면 무엇이 남는가 (DECIDED 2026-09-17, 홈 흐름 재배치 브리프) ──
          8월 사이트의 "참가하면 무엇을 얻나요?" 자리. 카드 다섯, 제목만(8월 BenefitCard의
          번호 배지 + 제목 문법, 본문 없음). 데스크톱 한 줄 다섯(숫자 스탯 행과 같은
          그리드), 폰은 두 열 + 마지막 한 장 전폭. 아래 한 줄이 "왜 제목뿐인가"의 답.
          8월 참가 혜택 필과 같은 emerald. 기본 이음매. */}
      <Chapter id="gains" labelledBy="gains-title" align="center">
        <Eyebrow color="purple">{t(naru.gains.eyebrow)}</Eyebrow>
        <h2 id="gains-title" className={H2}><Halo tone="violet">{t(naru.gains.heading)}</Halo></h2>
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
        <ol role="list" className="mx-auto mt-10 max-w-4xl text-left">
          {naru.gains.items.map((item) => (
            <li
              key={item.num}
              className="grid grid-cols-[2.25rem_1fr] items-start gap-x-4 gap-y-1 border-t border-white/10 py-5 last:border-b sm:grid-cols-[2.25rem_14rem_1fr] sm:gap-x-6"
            >
              <span className="pt-0.5 text-sm font-black tabular-nums text-accent">{item.num}</span>
              <h3 className={ROW_HEADING}>{t(item.title)}</h3>
              <p className="col-start-2 break-keep text-sm leading-relaxed text-white/70 sm:col-start-3">
                {t(item.body)}
              </p>
            </li>
          ))}
        </ol>
        </Reveal>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-left text-sm text-white/50 lg:text-center">{t(naru.gains.note)}</p>

      </Chapter>

      {/* 2026-09-19 (사용자): "8월과 나루는 합칠 수 있음. 나루의 코어가 여기서 나온 거라고." #record
          챕터는 #naru 안의 첫 블록이 됐습니다(아래 id="record"). 헤더 항목 "8월"도 뺐습니다. */}

      {/* ── CH3 · 나루 (DECIDED 2026-09-17 2차) ─────────────────────────────
          여기서 이벤트가 끝나고 그룹이 시작합니다. 270px 이음매가 그 말을 합니다.
          로고(마스터 반전, 배경 위가 아니라 글자 위 여백에), 아이브로, 태그라인,
          그리고 존재 목적: 변하지 않는 두 개. 판 둘의 판형과 크기는 2026-09-17
          1~3차 그대로입니다(그때의 주석은 data/naru.ts와 체인지로그에).
          #why 앵커는 코어 판 목록에 남겨 옛 링크와 notSequel의 링크가 닿습니다.
          exec와 measure는 #december의 멘토링 블록으로 갔습니다. 이벤트의
          실행에 관한 문장이라서요. 여기 남은 것은 코어 둘, 경첩, 마지막 줄. */}
      <Chapter id="naru" labelledBy="naru-title" align="center" className="pt-20 sm:pt-28 lg:pt-36">
        <Image
          src="/naru/naru-master-rev.png"
          alt={t(naru.hero.logoAlt)}
          width={900}
          height={900}
          // 보조 마크(감사 반영 브리프 6.3): 폰 160px, 데스크톱 220px. 형태는 로고 가이드가 정본이라
          // 그대로입니다.
          className="mx-auto h-auto w-[160px] sm:w-[220px]"
        />
        <div className="mt-6">
          <Eyebrow color="purple">{t(naru.hero.eyebrow)}</Eyebrow>
        </div>
        {/* 태그라인. 두 줄 고정(히어로에 있던 때의 이유 그대로: 두 개의 선언). */}
        <h2 id="naru-title" className={H2}>
          <Halo tone="violet">
            <span className="block break-keep">{t(naru.hero.titleLine1)}</span>{" "}
            {/* {" "}: block span 둘 사이에 텍스트 노드가 없으면 이름 계산에서
                "…한다.자리는…"처럼 붙어 읽힙니다 (2026-09-19, 접근성 감사 17). */}
            <span className={`${GRADIENT_TEXT} block break-keep`}>{t(naru.hero.titleLine2)}</span>
          </Halo>
        </h2>
        {/* 이름의 뜻 (2026-09-21, 사용자: 영문판에 나루가 무슨 뜻인지 설명이 필요). 태그라인
            바로 아래입니다. 위 두 줄이 "건넌다"고 말하고, 이 줄이 무엇을 건너는 자리인지
            말합니다. 순서가 반대면 낱말 풀이부터 읽히고 선언이 뒤로 밀립니다.
            본문보다 한 단 작고 한 단 어둡습니다. 주석이지 주장이 아닙니다. */}
        <p className="mx-auto mt-5 max-w-xl break-keep text-left text-sm leading-relaxed text-white/55 lg:text-center">
          {t(naru.group.name)}
        </p>
        {/* 폰에서 3줄을 넘는 문단은 왼쪽 정렬(감사 반영 브리프 6.1). 데스크톱은 가운데 그대로. */}
        <p className="mx-auto mt-6 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
          {t(naru.group.lead)}
        </p>
        {/* 서명 헤어라인. 이 페이지에서 한 번. */}
        <div
          aria-hidden
          className="mx-auto mt-8 h-[2px] w-full max-w-[52rem] bg-gradient-to-r from-accent to-accent-strong lg:mt-12"
        />
        {/* 라벨만. "우리는 두 가지를 만들려고 모였습니다" 제목은 내려갔습니다
            (2026-09-17 3차). 태그라인이 바로 위에 H2로 있고, lead가 "바뀌지 않는
            것은 아래 두 개"라고 이미 말합니다. 같은 챕터에 큰 제목 둘은 길이만
            늘립니다. why.heading 키는 그대로. */}
        {/* ── 8월이 남긴 것 (2026-09-19, 사용자: 8월과 나루를 합침). 코어 둘 바로 앞입니다. lead2가
            "이 이벤트에서 코어 2개가 나왔습니다"로 끝나서 다음 블록(변하지 않는 두 개)으로 이어집니다.
            id="record"는 옛 링크·배경 국면·하단 바(afterId)가 봅니다. 그 전의 챕터 판 주석은 git 이력에. */}
        <Reveal id="record" className="mx-auto mt-8 max-w-3xl lg:mt-12">
          <Eyebrow color="purple">{t(naru.record.eyebrow)}</Eyebrow>
          <h3 className={H3}>{t(naru.record.heading)}</h3>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
            {t(naru.record.lead)}
          </p>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
            {t(naru.record.lead2)}
          </p>
          {/* 빚을 적는 한 줄(2026-09-19, 사용자: "제로백의 도움이 있었기에 이 모든 게
              가능했다"). 본문보다 한 단 밝은 흰색입니다. 감사는 각주가 아니라 문장이어야
              합니다. 아래 아카이브 버튼이 바로 이어지므로, 이 줄이 그 버튼의 이유가 됩니다. */}
          <p className="mx-auto mt-3 max-w-2xl break-keep text-left text-base font-semibold leading-relaxed text-white/85 lg:text-center">
            {t(naru.record.credit)}
          </p>
          {/* 누구에게 진 빚인지 (2026-09-20, 사용자). 위 한 줄보다 한 단 작고
              한 단 어둡습니다. 앞 문장이 선언이고 이것이 명단이라, 같은 무게로
              두면 둘 다 읽히지 않습니다. 바로 아래 아카이브 버튼이 실제 이름들로
              가는 문이고, 이 문단이 그 버튼의 이유가 됩니다.

              2026-09-20 (표현 방식 브리프 5): 명단은 문단이 아니라 목록입니다.
              마침표로 이어 붙이면 세 줄짜리 회색 덩어리가 되고 감사가 감사로 안
              읽힙니다. 상자는 두지 않습니다. 목록이라는 것만 보이면 됩니다.
              낱말은 바뀌지 않았습니다(data/naru.ts의 thanks·thanksClose). */}
          <ul role="list" className="mx-auto mt-6 max-w-2xl space-y-2 text-left">
            {naru.record.thanks.map((line, i) => (
              <li key={i} className="flex gap-3 break-keep text-sm leading-relaxed text-white/70">
                <span aria-hidden className="mt-[0.5em] inline-block h-[0.4em] w-[0.4em] shrink-0 rounded-full bg-white/30" />
                <span>{t(line)}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-left text-sm text-white/55">
            {t(naru.record.thanksClose)}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={naruLinks.archive}
              onClick={() => track("naru_cta", { src: "record", to: "archive" })}
              className={buttonClass("secondary")}
            >
              {t(naru.record.cta)}
              <span aria-hidden className="text-white/50">→</span>
            </Link>
          </div>
        </Reveal>

        {/* 앵커 착지 (2026-09-19, 모바일 감사 4·18): 이 자리에만 scroll-mt가
            없어서 영어 두 줄 헤더(158px) 아래로 아이브로가 들어갔습니다. 고치면서
            **장치를 하나로 줄였습니다**: 이 페이지의 네 앵커(#record, #why, #how,
            #join-ways)에 있던 scroll-mt-24/28을 전부 걷고, JourneyNav가 헤더 실높이를
            재서 넣는 scroll-padding-top 하나만 씁니다. 둘 다 있으면 값이 더해져
            제목이 헤더 아래 120px을 더 비우고 서고, 무엇보다 한쪽만 고쳐질 자리가
            됩니다. #december의 TermLink가 여기로 보냅니다.

            h3 (접근성 감사 18): 전에는 Eyebrow 하나뿐이라, 폰에서 "변하지 않는
            두 개"를 눌러 도착하면 어디에 왔는지 확인할 문장이 없었습니다.
            why.heading 키는 전부터 있었고 그리지 않고 있던 것을 되살립니다.
            sr-only가 아니라 눈에도 보이게 두는 편이 착지점을 말해 줍니다. */}
        <div id="why" className="mt-8 border-t border-white/10 pt-8 lg:mt-12 lg:pt-12">
          <Eyebrow color="purple">{t(naru.why.eyebrow)}</Eyebrow>
          <h3 className={H3}>{t(naru.why.heading)}</h3>
        </div>
        {/* 코어 둘. 판 두 장.
            ol인 이유: 순서가 뜻입니다. 01이 문턱이고 02가 증명이며, 바로 아래
            note가 그 둘이 한 쌍이라고 말합니다. 번호는 그리지 않습니다(9/16
            2차의 이유 그대로). 나루 점이 제목 첫 글자 앞에 섭니다.
            점의 크기가 em인 이유: STATEMENT가 clamp(22.5~29px, 3차)라 px로 박으면
            좁은 화면에서 점이 제목보다 커집니다. 0.8em이면 18~23px이고 로고
            가이드의 하한 18px을 좁은 쪽 끝에서 정확히 지킵니다. mt는 leading
            1.2의 첫 줄 한가운데.
            keeps가 dl인 이유: 항목 이름과 값이지 제목이 아닙니다. */}
        <Reveal>
        <ol role="list" className="mx-auto max-w-5xl text-left">
          {naru.why.cores.map((core, i) => (
            <li
              key={core.index}
              className={`grid gap-3 py-5 md:grid-cols-[1.4fr_1fr] md:gap-14 md:py-7 lg:py-8 ${
                i > 0 ? "border-t border-white/10" : ""
              }`}
            >
              <div>
                {/* DECIDED 2026-09-18 (사용자): 글자가 너무 컸고, 첫 줄을 크게 강조하는 것은
                    "내 스타일이 아님". 제목은 H3 크기(STATEMENT 아님), 두 줄은 같은 본문 크기.
                    STATEMENT 토큰과 core.lines 키는 그대로 둡니다. */}
                <h3 className="flex items-start gap-3 text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
                  <NaruMark className="mt-[0.25em] h-[0.75em] w-[0.75em]" />
                  <span>{t(core.title)}</span>
                </h3>
                <p className="mt-4 max-w-xl break-keep text-base leading-relaxed text-white/80">
                  {t(core.lines[0])}
                </p>
                {/* 폰에서는 코어가 제목 + 한 문장(감사 반영 브리프 6, 나루 챕터 4.4화면). 둘째 줄은
                    lg부터. 키는 그대로. */}
                <p className="mt-2 hidden max-w-xl break-keep text-base leading-relaxed text-white/65 lg:block">
                  {t(core.lines[1])}
                </p>
              </div>
              <KeepsPanel label={t(naru.why.keepsLabel)} body={t(core.keeps)} />
            </li>
          ))}
        </ol>
        </Reveal>

        {/* 경첩. 두 개가 함께 있어야 하는 이유. 판 두 장을 닫는 헤어라인
            아래, 챕터 제목과 같은 축에 H3로 섭니다. 먼저 각각을 읽고, 그
            다음에 둘이 한 쌍인 이유를 읽습니다. */}
        <Reveal className="mx-auto max-w-5xl border-t border-white/10 pt-8 lg:pt-12">
          <p className="mx-auto max-w-3xl break-keep text-left text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-center">
            {t(naru.why.note)}
          </p>
          {/* 폰에서는 경첩의 부연을 접습니다(나루 챕터 길이 목표 2,200). 굵은 한 문장만. */}
          <p className="mx-auto mt-6 hidden max-w-2xl break-keep text-left text-base leading-relaxed text-white/70 lg:block lg:text-center">
            {t(naru.why.noteBody)}
          </p>
        </Reveal>

        {/* 마지막 줄. 페이지 전체가 여기서 끝납니다. 위의 두 개를 빼면 전부
            방법이고, 방법은 바뀝니다(매니페스토 IV). 이 문장이 8일이 4일이 되는
            12월을 미리 설명합니다. */}
        <Reveal className="mx-auto mt-8 max-w-2xl lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.why.agendaLabel)}</h3>
          <p className="mt-3 break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">{t(naru.why.agenda)}</p>
        </Reveal>
              {/* ── 어떻게 일하는가 (DECIDED 2026-09-18, 사용자: "나루와 학생회와 기업 내용은 하나의
            챕터로 합쳐져야 함"). 따로 있던 #how 챕터(세 층, 문 셋, 하지 않는 것)가 이 챕터의
            마지막 블록이 됐습니다. 헤어라인 하나로 나뉘고 제목은 H3. 안쪽 앵커 id="how"는
            옛 링크와 층별 문(#join-*)의 출발점을 위해 남깁니다. 카피 키(naru.how.*)는 그대로.
            그 전의 주석: #december 뒤로 내려온 이유(2026-09-17)는 git 이력에. */}
        <div id="how" className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-8 text-center lg:mt-16 lg:pt-12">

          <Eyebrow color="purple">{t(naru.how.eyebrow)}</Eyebrow>
          <h3 className={H3}>{t(naru.how.heading)}</h3>
        {/* 폰에서는 리드를 접습니다. 다이어그램과 그 아래 한 줄("서로 직접 만나지 않습니다")이 같은 말을 합니다. */}
        <p className="mx-auto mt-6 hidden max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:block lg:text-center">
          {t(naru.how.lead)}
        </p>

        <Reveal>
        <LayerDiagram t={t} />
        </Reveal>

        {/* 층마다 문 하나. 2026-09-17 3차: 여기 있던 "하는 것 / 얻는 것" 카드
            셋이 내려갔습니다. 다이어그램이 이미 세 층을 그리고, 카드 셋은 같은
            세 주체를 한 번 더 세로로 세워 폰에서 800px을 썼습니다. 무엇을 주고
            받는지는 #join의 카드가 문 옆에서 말합니다. layers[].does/gets 키는
            그대로 있습니다. */}
        {/* gap-y-6 (2026-09-19, 모바일 감사 7 · 접근성 감사 11): 안쪽 링크가
            -my-2.5(−11.25px씩)로 히트 영역만 44px로 키우는 관용구를 쓰는데, 줄 간격이
            gap-y-2(9px)라 줄이 바뀌면 **행 간격이 9 − 22.5 = −13.5px**, 즉 위아래
            링크의 히트 상자가 겹쳤습니다. 겹친 자리에서 먼저 잡는 쪽은 DOM 순서가
            아니라 z 순서라, "학생회로 문의하기"를 눌렀는데 옆의 메일이 열릴 수
            있습니다. 세 링크는 폰에서 반드시 접힙니다. 27 − 22.5 = 4.5px로 띄웁니다. */}
        <Reveal className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-6">
          {naru.how.layers.map((layer) => (
            <a
              key={layer.join.id}
              // 2026-09-19: `#${layer.join.id}`(#join의 카드)였습니다. 카드 넷이
              // 화면에서 내려가면서 앵커가 갈 곳을 잃었고, 이제 같은 메일로
              // 곧장 갑니다. 이 세 링크가 학생회·기업·운영진의 유일한 문입니다.
              href={layer.join.mail}
              onClick={() => track("naru_mail", { src: `how_${layer.join.id}` })}
              className="-my-2.5 inline-flex min-h-[44px] items-center gap-1.5 py-2.5 text-sm font-medium text-accent transition hover:text-white"
            >
              {t(layer.join.label)}
              <span aria-hidden>→</span>
            </a>
          ))}
        </Reveal>

        {/* 하지 않는 것(나루가 하지 않는 것, 세 줄)은 화면에서 내려갔습니다
            (DECIDED 2026-09-19, 사용자). 이 챕터가 대답하는 질문은 "어떻게
            일하는가"이고 그 답은 위의 세 층과 문 셋이 이미 합니다. 레일 맨
            아래에서 마지막으로 남는 인상이 회비·후원 계약·보수일 이유가
            없었습니다. notDoingLabel과 notDoing 키는 data/naru.ts에 그대로
            있습니다. 물어보는 사람에게 답할 문장이지 먼저 꺼낼 문장이 아닙니다. */}
        </div>
      </Chapter>


      {/* ── CH5 · 왜 이 자리가 필요한가 (DECIDED 2026-09-19, 왜 브리프) ────────
          페이지의 마지막 큰 질문이 절차("어떻게 함께하는가")였습니다. 이 자리를
          매니페스토 I장이 가져갑니다. 결핍을 말하는 I장이 사이트에 통째로 빠져
          있었어요. 들어오는 길 넷은 그대로 두되 챕터의 머리글이 아니라 그 아래
          라벨(#join-ways)이 됩니다.

          이 챕터가 마지막에 있는 이유: 이벤트를 보고, 8월이 실제로 있었다는 증거를
          보고, 그룹이 무엇인지 안 다음에 "그래서 이게 왜 있어야 하는가"가 나옵니다.
          그 순서면 앞의 모든 것이 이 문단의 근거가 됩니다. 앞에 놓으면 근거 없이
          주장부터 하게 됩니다. */}
      <Chapter id="join" labelledBy="join-title" align="center">
        <Eyebrow color="purple">{t(naru.join.eyebrow)}</Eyebrow>
        <h2 id="join-title" className={H2}><Halo tone="violet">{t(naru.join.heading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
          {t(naru.join.lead)}
        </p>

        {/* 세 곳의 결핍. ul role="list"입니다(왜 브리프 7장). 순서에 뜻이 없어요.
            세 곳은 동등합니다. #after의 steps가 ol인 것과 다릅니다. 칸 안은
            place → lack(없는 것) → opens(그래서 여는 것) 순서이고, 결핍이 먼저
            오고 처방이 나중입니다. */}
        <Reveal>
        <ul role="list" className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 text-left lg:grid-cols-3">
          {naru.join.needs.map((need) => (
            <li
              key={need.place.en}
              className="border-b border-white/10 py-4 last:border-b-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-5"
            >
              <h3 className={H3}>{t(need.place)}</h3>
              <p className="mt-2 break-keep text-sm leading-relaxed text-white/70">{t(need.lack)}</p>
              <p className="mt-3 flex gap-2 break-keep text-sm leading-relaxed text-white/85">
                <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" />
                {t(need.opens)}
              </p>
            </li>
          ))}
        </ul>
        </Reveal>

        {/* 세 곳에 공통된 조건 하나(매니페스토 I장). 장소를 가리지 않습니다.
            같은 I장의 다른 나라 학생과의 비교는 가져오지 않았습니다. */}
        <Reveal>
        <p className="mx-auto mt-8 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
          {t(naru.join.milestones)}
        </p>
        </Reveal>

        {/* 안전장치 두 줄(왜 브리프 2.1). 카드가 아니라 문단입니다. 둘 다 있어야
            합니다. 첫 줄이 없으면 폐쇄적인 모임으로, 둘째 줄이 없으면 억울함의
            호소로 읽힙니다. 한 줄만 그리지 마세요. */}
        <Reveal className="mx-auto mt-8 max-w-3xl space-y-3 break-keep text-sm leading-relaxed text-white/55">
          {naru.join.guards.map((guard, i) => (
            <p key={i}>{t(guard)}</p>
          ))}
        </Reveal>

        {/* 규모 숫자는 출처가 확인되기 전까지 그리지 않습니다. statTbd 키는
            data/naru.ts에 있습니다. */}
        {JOIN_STAT_CONFIRMED && (
          <p className="mx-auto mt-6 max-w-2xl break-keep text-left text-sm leading-relaxed text-white/55 lg:text-center">
            {t(naru.join.statTbd)}
          </p>
        )}

        {/* 챕터를 닫는 자리(DECIDED 2026-09-19, 사용자: "그 공간을 왜 이 자리가
            필요한가에 더 할애"). 매니페스토 표지의 한 줄과 V장입니다. 앞의 세 칸이
            결핍이고, 이 두 문단이 그래서 무엇을 앞당겨 두는지입니다. */}
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <p className={STATEMENT}>{t(naru.join.closingStatement)}</p>
          <div className="mx-auto mt-5 max-w-2xl space-y-3 break-keep text-sm leading-relaxed text-white/70">
            {naru.join.closingBody.map((line, i) => (
              <p key={i}>{t(line)}</p>
            ))}
          </div>
        </Reveal>

        {/* 매니페스토 PDF 하나(DECIDED 2026-09-19, 사용자: "그냥 공간에는 매니페스토
            pdf 다운로드 받을 수 있게 해").

            여기 있던 카드 넷(참가자·학생회·기업·운영진)과 8월 알럼 띠는 화면에서
            내려갔습니다. join.cards·join.alumni·waysLabel·waysLead 키는 data/naru.ts에
            그대로 있고 그리지 않습니다. 문의 메일이 사라진 것은 아닙니다. #naru의
            3층 다이어그램 아래 문 셋이 같은 메일로 곧장 가고(2026-09-19에 앵커에서
            mailto로 바꿨습니다), 푸터의 일반 문의도 그대로입니다.

            버튼이 아니라 링크인 이유: 이 자리는 결정 지점이 아니라 더 읽을 사람을
            위한 문입니다. 파일 정보를 라벨 아래 한 줄로 먼저 보입니다. 무엇을 받는지
            모르고 누르게 하지 않습니다. */}
        {/* 2026-09-20 (표현 방식 브리프 6): 864x246 상자를 걷었습니다. 규칙 ①(누를 수
            있는 것)에 해당하는 것은 버튼 하나뿐이고, 상자는 그 버튼을 감싸고 있을
            뿐이었습니다. 위 헤어라인이 이미 이 블록을 본문에서 떼어 놓습니다.
            문장과 순서는 그대로입니다. */}
        <div aria-hidden className="mx-auto mt-12 h-px w-full max-w-5xl bg-white/10" />
        <Reveal id="join-ways" className="mx-auto mt-10 max-w-3xl text-left">
          {/* "PDF · 1.0MB" (2026-09-19, 모바일 감사 21). 쪽 수와 파일 크기 줄을
              뺀 결정(data/naru.ts)은 그대로 존중합니다. 이건 그 줄을 되살리는 게
              아니라 라벨 옆의 한 조각입니다. 버튼의 ↓는 **형식을 말하지 않고**,
              셀룰러에서 1MB는 데스크톱에서와 다른 값입니다. 그 결정의 이유
              ("무엇을 받는지 모르고 누르게 하지 않습니다")를 셀룰러까지 넓힙니다.
              파일이 바뀌면 이 숫자도 바꾸세요: public/naru/naru-manifesto-v1-2026-09.pdf */}
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.join.manifesto.label)}
            <span className="font-medium normal-case tracking-normal text-white/40">{"\u2002·\u2002PDF 0.9MB"}</span>
          </p>
          <h3 className="mt-3 break-keep text-base font-bold text-white">{t(naru.join.manifesto.title)}</h3>
          <p className="mt-2 break-keep text-sm leading-relaxed text-white/70">{t(naru.join.manifesto.body)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={naruLinks.manifesto}
              // 같은 탭에서 열리면 이 페이지가 PDF 뷰어에 덮입니다. 돌아오는 길이
              // 뒤로 가기뿐이면 읽던 자리를 잃습니다.
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={() => track("naru_cta", { src: "join", to: "manifesto" })}
              className={buttonClass("secondary")}
            >
              {t(naru.join.manifesto.cta)}
              <span aria-hidden className="text-white/50">↓</span>
            </a>
          </div>
        </Reveal>

      </Chapter>

      {/* ── CH6 · 여기서 나온 사람 (조건부) ──────────────────────────────
          stories가 비어 있으면 챕터 자체를 그리지 않습니다. 제목만 있고 안이
          빈 섹션은 "아직 아무도 없다"로 읽히는데, 8월에 스물한 팀이 발표했으니
          그건 사실이 아닙니다. 사실은 아직 이야기를 받아 두지 못했다는 것이고,
          그건 화면이 아니라 우리가 할 일입니다.
          인용문을 지어내지 마세요(data/naru.ts의 Story 주석). */}
      {naru.people.stories.length > 0 && (
        <Chapter id="people" labelledBy="people-title" align="center">
          <Eyebrow color="purple">{t(naru.people.eyebrow)}</Eyebrow>
          <h2 id="people-title" className={H2}>{t(naru.people.heading)}</h2>
          <p className="mx-auto mt-6 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
            {t(naru.people.lead)}
          </p>
          <div className="mt-12 grid gap-4 text-left md:grid-cols-2">
            {naru.people.stories.map((story) => (
              <Card key={story.name.en}>
                <blockquote className="break-keep text-base leading-relaxed text-white/85">
                  {t(story.quote)}
                </blockquote>
                <p className="mt-5 text-sm font-semibold text-white">{t(story.name)}</p>
                <p className="mt-1 text-xs text-white/55">{t(story.school)}</p>
                <p className="mt-3 break-keep text-sm leading-relaxed text-white/65">{t(story.after)}</p>
              </Card>
            ))}
          </div>
        </Chapter>
      )}

      {/* 하단 오픈채팅 바(8월과 같은 것). #record가 지나면 나타나고 푸터가 보이면
          물러납니다. 홈에는 폰 전용 바가 없어서 폰까지 맡습니다(phone).

          main의 **끝**입니다 (2026-09-19, 접근성 감사 21). position: fixed로 화면
          맨 아래에 뜨는 바가 DOM에서는 본문 맨 앞이었습니다. 오픈채팅을 되살리면
          폰에서 main에 들어선 첫 Tab이 화면 아래 끝의 버튼으로 뜁니다. 보이는
          순서와 포커스 순서가 어긋나면 안 됩니다(2.4.3). 지금은 links.openChat이
          빈 문자열이라 렌더되지 않는 잠복 상태였어요. */}
      <MobileChatBar afterId="record" endId="closing" phone />
      </main>

      {/* ── 푸터 ─────────────────────────────────────────────────────────
          main 밖입니다. 안에 두면 contentinfo 랜드마크가 main 랜드마크 안에
          중첩되고, 랜드마크로 페이지를 훑는 사람이 본문을 빠져나가지 않은 채
          푸터에 도착합니다.
          크레딧 표기 순서는 언제나 주최 → 주관 → 후원입니다.
          8월 푸터의 "SMU, NUS, NTU 한인 학생회가 주관하고" 줄은 가져오지
          않았습니다. 그건 제로백 빌더톤의 크레딧이고, 12월 이벤트의 주관은
          아직 정해지지 않았습니다. */}
      <footer id="closing" className="relative w-full border-t border-white/10 px-6 py-14 sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          {/* 헤더와 같은 규칙입니다 (2026-09-21): 영문 화면에서는 영문 락업.
              헤더에서만 바꾸면 같은 페이지 위아래에서 이름이 달라집니다. */}
          <Image
            src={locale === "en" ? "/naru/naru-name-en-rev.svg" : "/naru/naru-name-rev.png"}
            alt={t(naru.footer.logoAlt)}
            width={locale === "en" ? 857 : 604}
            height={locale === "en" ? 142 : 168}
            unoptimized={locale === "en"}
            className="h-10 w-auto sm:h-12"
          />
          <p className="break-keep text-xs leading-relaxed text-white/60">{t(naru.footer.credits)}</p>
          {/* gap-y-7 (2026-09-19, 모바일 감사 7): 아래 링크가 -my-3(−13.5px씩)이라
              gap-y-2로는 행 간격이 −18px이었습니다. 지금은 오픈채팅이 막혀 링크가
              둘뿐이라 한 줄에 들어가지만, 되살리면 즉시 발현하는 잠복 상태였습니다.
              31.5 − 27 = 4.5px. */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-7 text-xs">
            <OpenChatLink t={t} src="naru-footer" label={openChatLabels.footer} className="!px-3.5 !py-2 !text-xs" />
            <a
              href={naruLinks.general}
              onClick={() => track("naru_mail", { src: "footer" })}
              // min-w-[44px] (2026-09-19, 감사 반영): "문의"/"Contact"는 글자가
              // 짧아 가로 23.4px이었습니다. 세로 44px은 -my-3 + py-3이 만들지만
              // 가로는 아무것도 보장하지 않았어요. 가운데 정렬로 글자 자리는 그대로.
              className="-my-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center py-3 text-white/65 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.contact)}
            </a>
            <Link
              href={naruLinks.archive}
              // min-w-[44px] (2026-09-19, 감사 반영): "문의"/"Contact"는 글자가
              // 짧아 가로 23.4px이었습니다. 세로 44px은 -my-3 + py-3이 만들지만
              // 가로는 아무것도 보장하지 않았어요. 가운데 정렬로 글자 자리는 그대로.
              className="-my-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center py-3 text-white/65 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.archive)}
            </Link>
          </div>
          <p className="text-xs text-white/55">{t(naru.footer.rights)}</p>
          {/* 배경 움직임 끄기. WCAG 2.2.2. 자리가 푸터인 이유는 컴포넌트 주석에
              있습니다. */}
          <MotionToggle className="min-h-[44px] mt-2" />
        </div>
      </footer>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 숫자 줄.
//
// 두 챕터가 같은 모양을 씁니다: #record의 8월 숫자 다섯, #december의 12월 모양
// 여섯. 같은 일을 하는 마크업이 둘이 되면 한쪽만 고쳐지기 시작해서, 처음부터
// 하나로 둡니다. 열 수는 className으로 넘깁니다.
//
// dt가 sr-only이고 dd 안의 라벨이 aria-hidden인 이유: 같은 문자열이 둘 다에
// 있어서, 빼지 않으면 스크린리더가 "74명 신청, 74명 신청"으로 두 번 읽습니다.
// ─────────────────────────────────────────────────────────────────────────────
function StatRow({
  stats,
  t,
  className = "",
}: {
  stats: Stat[];
  t: (p: Phrase) => string;
  className?: string;
}) {
  return (
    // 폰: 6칸 그리드에 첫 셋은 2칸씩(한 줄 셋), 나머지 둘은 3칸씩(둘째 줄 둘). "9팀"이
    // 왼쪽에 혼자 남지 않습니다(모바일 수정 브리프 3). sm부터는 이전 그대로.
    <dl className={`mx-auto grid max-w-5xl grid-cols-6 gap-3 sm:grid-cols-3 ${className}`}>
      {stats.map((stat, i) => (
        <div
          key={stat.label.en}
          className={`rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-5 text-center sm:col-span-1 ${i < 3 ? "col-span-2" : "col-span-3"}`}
        >
          <dt className="sr-only">{t(stat.label)}</dt>
          <dd>
            <span className="block break-keep text-2xl font-black tracking-tight text-white sm:text-3xl">
              {t(stat.value)}
            </span>
            <span aria-hidden className="mt-2 block break-keep text-xs leading-snug text-white/60">
              {t(stat.label)}
            </span>
            {stat.note && (
              <span className="mt-2 block break-keep text-[0.68rem] font-semibold leading-snug text-accent">
                {t(stat.note)}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 사진 벽. 2026-09-17 홈 흐름 재배치로 화면에서 내려갔습니다(사진은 히어로가
// 합니다). 함수와 record.wall·photos 키는 그대로 둡니다.
//
// DECIDED 2026-09-16: #record의 본문이 글에서 사진으로 바뀌면서 세 장이 열두
// 장이 됐습니다(시상식 두 장은 이후에 다시 내려갔습니다 - data/naru.ts의
// REMOVED 주석). 8일이 어땠는지는 문단 다섯 개보다 사진 열두 장이 더 정확하게
// 말합니다.
//
// ── 왜 CSS columns가 아니라 grid인가 (2026-09-16, 두 번째 판) ────────────────
// 처음에는 CSS columns였습니다. 어떤 사진도 자르지 않으려고요. 그런데 세로로
// 찍힌 사진이 섞여 있어서, 열 너비 372px에서 가로 사진은 279px로 서고 세로
// 사진은 496px로 섰습니다. 1.8배예요.
//
// columns는 열 높이를 맞추려고 하지만 맞출 수 있는 단위가 사진 한 장이라,
// 높이가 제각각인 열두 장을 세 열에 나누면 어느 조합으로도 딱 떨어지지 않습니다. 실측하니 가운데
// 열이 양옆보다 221px 짧았어요(2026-09-16). 벽이 아니라 몇 장이 아래로 삐져나온
// 것처럼 보였습니다. lazy 로딩 중에는 더 심합니다 - 아직 받지 않은 사진의
// 높이를 브라우저가 모르는 동안 열 균형이 계속 다시 잡히거든요.
//
// 그래서 방향을 바꿨습니다: 화면에서 자르는 대신, **원본을 전부 4:3으로
// 맞춰 두고** 균일한 grid에 넣습니다. 자르는 자리를 런타임의 object-cover가
// 고르게 두지 않고 사람이 골랐어요(세로 세 장은 Dropbox 원본에서 4:3으로 다시
// 잘랐습니다. 객석 사진은 아래쪽에 사람이 몰려 있어서 중심을 0.65로 내렸고,
// 나머지 둘은 가운데입니다).
//
// 지금 열두 장 전부가 정확히 4:3입니다(1200x900 또는 1600x1200). 칸도 4:3이라
// object-cover는 아무것도 자르지 않습니다 - 원본이 4:3에서 벗어나는 사진을
// 나중에 추가할 때를 대비한 안전망으로만 있습니다. 그런 사진을 넣지 마세요.
// 넣어야 하면 여기 말고 export 단계에서 4:3으로 자르세요. 단체 사진의 양 끝
// 사람이 잘리면 그 사람은 그 기록에 없는 것이 됩니다.
//
// 이 배치에서는 한 장도 삐져나올 수 없습니다. 모든 칸이 같은 크기예요.
//
// 장수는 6의 배수로 두세요. 3열(lg)과 2열(그 아래) 양쪽에서 마지막 줄이 꽉
// 차는 수가 그것뿐입니다. 열 장이었을 때는 3열에서 마지막 줄에 한 장만 남았어요.
//
// 캡션은 세 장에만 있습니다(data/naru.ts의 photos). 전부 달면 사진을 늘린 만큼
// 글이 늘어나서, 이 벽을 만든 이유가 없어집니다. 캡션 높이가 칸마다 다르지만
// 사진 자체는 grid 칸에 고정이라(aspect-[4/3]) 줄이 어긋나지 않습니다.
//
// loading: 첫 장만 즉시 받고 나머지는 next/image의 기본값(lazy)입니다. 이
// 챕터는 히어로에서 한 화면 넘게 내려와 있어서 열두 장을 한꺼번에 받을 이유가
// 없습니다.
// ─────────────────────────────────────────────────────────────────────────────
function PhotoWall({ photos, t }: { photos: RecordPhoto[]; t: (p: Phrase) => string }) {
  return (
    <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-3">
      {photos.map((photo, i) => (
        <figure key={photo.src} className="text-left">
          {/* 칸이 4:3이고 원본도 4:3이라 fill + object-cover가 실제로는 아무것도
              자르지 않습니다. relative는 fill이 기준으로 삼을 상자입니다. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={photo.src}
              alt={t(photo.alt)}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              priority={i === 0}
              className="object-cover object-center"
            />
          </div>
          {photo.day && photo.caption && (
            <figcaption className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
                {t(photo.day)}
              </span>
              <span className="break-keep text-sm leading-snug text-white/75">{t(photo.caption)}</span>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3층 다이어그램.
//
// Overview 01의 그림을 웹에 맞게 줄인 것입니다. 원본에는 화살표에 붙은 라벨이
// 여섯 개 있는데(학생과 공간, 임기를 마친 사람, 열어줄 자리, 문제와 자금,
// 학생과의 접점, 소속 학생이 들어온다) 전부 넣으면 390px에서 읽히지 않습니다.
// 각 층이 무엇을 들고 오는지 한 줄(brings)만 남기고, 나머지는 바로 아래
// "하는 것 / 얻는 것" 카드가 말합니다.
//
// SVG가 아니라 HTML로 그립니다. 이 그림에서 정말 중요한 것은 가운데에 나루가
// 있고 양옆이 서로 닿지 않는다는 배치 하나뿐이고, 그건 flex가 더 잘합니다.
// 좁아지면 저절로 세로로 서고, 글자는 페이지 서체와 줄바꿈 규칙(break-keep)을
// 그대로 씁니다. SVG <text>였다면 두 벌을 따로 관리해야 했을 겁니다.
//
// 맨 위 "서로 직접 만나지 않습니다" 줄이 이 그림의 주장입니다. 학생회와 기업이
// 직접 만나면 나루가 있을 이유가 없어요. 화살표 둘이 같은 말을 합니다. 둘 다
// 가운데를 가리키고, 가운데 상자가 둘을 잇는다고 말합니다(2026-09-21).
// ─────────────────────────────────────────────────────────────────────────────
function LayerDiagram({ t }: { t: (p: { ko: string; en: string }) => string }) {
  const [host, organiser, sponsor] = naru.how.layers;

  const box = (layer: Layer, center = false) => (
    <div
      // DECIDED 2026-09-16: 가운데 상자에서 주황을 걷습니다.
      //
      // 이유 둘입니다. 하나, 면적으로 이 워시가 페이지에서 가장 큰 주황
      // 영역이었습니다. 상자 하나가 7% 알파로 약 370x110px이라 히어로 CTA의
      // 두 배가 넘어요. "주황은 점이지 면이 아니다"라는 규칙이 아무도 주황
      // 챕터라고 생각하지 않는 여기서 가장 크게 깨지고 있었습니다.
      // 둘, 강조가 애초에 뒤집혀 있었습니다. 양옆 상자가 border-white/12를
      // 쓰고 있었고 그건 CSS를 만들지 않아 Preflight의 #e5e7eb로 떨어졌어요.
      // 그래서 강조하려던 가운데는 1.4:1 테두리, 양옆은 14:1 테두리였습니다.
      // 다이어그램에서 가장 조용한 상자가 주인공이었던 셈입니다.
      //
      // 이제 가운데는 색이 아니라 높이로 표시합니다. 테두리 한 단계(/20),
      // 면 한 단계(0.06). 구조를 말하는 그림에는 그쪽이 맞습니다.
      //
      // 여기서 걷은 주황이 #why의 나루 점 둘 값을 치릅니다. 페이지 전체의
      // 주황 면적은 오히려 줄었고, 주황 면은 히어로 CTA와 12월 아이브로
      // 둘로 내려갔습니다.
      // 상자 셋의 크기를 맞춥니다 (2026-09-21, 사용자: "상자 사이즈가 다름").
      // flex-1이 폭은 이미 같게 만들고 있었는데(1 1 0%), 높이는 글의 길이가
      // 정하고 있었습니다. 줄 수가 다른 세 상자가 나란히 서면 가장 짧은 상자가
      // 덜 중요해 보입니다. 이 그림에서 셋의 무게는 같아야 합니다.
      // 바깥 줄의 md:items-center를 md:items-stretch로 바꿔 높이를 맞추고,
      // 남는 자리는 flex-col + justify-center로 글이 가운데에 서게 둡니다.
      // 행 높이는 원래 가장 긴 상자가 정하고 있었으므로 챕터 길이는 그대로입니다.
      className={`flex flex-1 flex-col justify-center rounded-2xl border px-4 py-3 text-left md:py-5 md:text-center ${
        center
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      {/* 역할 라벨은 8월 칩 문법(2026-09-17). 가운데(주최)만 한 단 밝은 칩. */}
      {/* 역할 라벨은 "한글 주 + 영문 소문자 보조"(감사 반영 브리프 8, 영문 라벨 규칙). 대문자 자간
          라벨은 아이브로에만. */}
      {/* 폰은 칩과 이름을 한 줄에, 내는 것은 숨기고 얻는 것만(나루 챕터 길이 목표). md부터 그 전 그대로. */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 md:block">
        <p>
          <Chip tone="outline" className={`!text-xs tracking-[0.02em] lg:!text-[0.68rem] ${center ? "!border-accent/40 !text-accent" : ""}`}><RoleLabel text={t(layer.role)} /></Chip>
        </p>
        <p className="break-keep text-sm font-bold leading-snug text-white sm:text-base md:mt-1.5">
          {t(layer.who)}
        </p>
      </div>
      <p className="mt-2 hidden break-keep text-xs leading-snug text-white/55 md:block">{t(layer.brings)}</p>
      {/* 얻는 것 한 줄(2026-09-18). 후원 상자에 내는 것만 있고 얻는 것이 없었습니다(ux-researcher P1). */}
      <p className="mt-2 break-keep text-xs leading-snug text-white/70">
        <span className="font-bold text-accent">{t(naru.how.getsShort)}</span>
        {"\u2002"}
        {t(layer.gets)}
      </p>
    </div>
  );

  // 화살표. 둘 다 나루를 가리킵니다 (DECIDED 2026-09-21, 사용자: "나루는 학생과 기업을
  // 이어주는 거니까 화살표 둘 다 나루를 가리키고 있어야 함").
  //
  // 그 전에는 → → 로 왼쪽에서 오른쪽으로 흘렀습니다. 그러면 학생회가 나루를 거쳐
  // 기업으로 건너가는 그림, 즉 나루가 학생을 기업에 넘기는 파이프가 됩니다. 방향이
  // 곧 주장이라서, 학생회와 기업이 각자 나루로 들고 와서 거기서 만난다는 말을
  // 하려면 오른쪽 화살표는 반대여야 합니다. 바로 위 점선("서로 직접 만나지
  // 않습니다")과 같은 말을 화살표가 합니다. Overview 01도 양쪽이 나루로 들어옵니다.
  //
  // 세로로 설 때(폰)도 같습니다. 나루 위의 상자는 아래를, 아래의 상자는 위를.
  // white/30 → /45: 이 그림에서 유일하게 방향을 말하는 글자라 상자 테두리보다
  // 흐리면 안 됩니다. 자리는 그대로라 챕터 길이는 변하지 않습니다.
  const arrow = (from: "left" | "right") => (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center text-base text-white/45 md:px-1"
    >
      <span className="md:hidden">{from === "left" ? "↓" : "↑"}</span>
      <span className="hidden md:inline">{from === "left" ? "→" : "←"}</span>
    </span>
  );

  return (
    <div className="mx-auto mt-8 max-w-5xl lg:mt-12">
      {/* 서로 닿지 않는다는 선. 데스크톱에서만 그립니다. 세로로 선 모바일
          에서는 "양옆"이라는 배치 자체가 없어서 선이 뜻을 잃습니다.
          모바일에서는 같은 말을 아래 한 줄이 글로 합니다. */}
      <div className="hidden items-center gap-3 px-6 md:flex">
        <span aria-hidden className="h-px flex-1 border-t border-dashed border-white/15" />
        <span className="break-keep text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/55">
          {t(naru.how.diagramNote)}
        </span>
        <span aria-hidden className="h-px flex-1 border-t border-dashed border-white/15" />
      </div>
      <div className="mt-3 flex flex-col items-stretch gap-2 md:flex-row md:items-stretch">
        {box(organiser)}
        {arrow("left")}
        {box(host, true)}
        {arrow("right")}
        {box(sponsor)}
      </div>
      <p className="mt-4 break-keep text-center text-xs text-white/55 md:hidden">
        {t(naru.how.diagramNote)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// "그래서 지키는 것" (2026-09-18, 감사 반영 브리프 6.1). 폰에서는 접혀 있고 버튼으로 펼칩니다.
// lg부터는 그 전과 같은 dl. 데스크톱 판형은 사용자가 정한 자리라 그대로입니다.
// ─────────────────────────────────────────────────────────────────────────────
function KeepsPanel({ label, body }: { label: string; body: string }) {
  const [open, setOpen] = useState(false);
  // useId (2026-09-19, 접근성 감사 20). 전에는 `keeps-${label.length}-${body.length}`
  // 였습니다. 지금은 우연히 안 겹치지만(keeps-9-67 / keeps-9-65), 두 코어의 본문
  // 길이가 같아지는 순간 id가 겹치고 aria-controls가 남의 패널을 가리킵니다.
  // 카피 한 글자에 접근성이 걸려 있으면 안 됩니다.
  const id = useId();
  return (
    <div className="border-t border-white/10 pt-3 md:border-l md:border-t-0 md:pl-10 md:pt-2 lg:pt-6 md:lg:pt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="-mx-1 flex min-h-[44px] items-center gap-2 px-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent lg:hidden"
      >
        {label}
        <span aria-hidden className={`inline-block text-white/45 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      <dl>
        <dt className="hidden text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent lg:block">{label}</dt>
        <dd id={id} className={`${open ? "block" : "hidden"} break-keep text-sm leading-relaxed text-white/75 lg:mt-3 lg:block`}>{body}</dd>
      </dl>
    </div>
  );
}

// 역할 라벨 "주최 HOST" → 주최 + host(작게, 소문자). en "HOST" → Host. (감사 반영 브리프 8)
function RoleLabel({ text }: { text: string }) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return <>{parts[0].charAt(0) + parts[0].slice(1).toLowerCase()}</>;
  return (
    <>
      {parts.slice(0, -1).join(" ")}
      {/* lang="en" (2026-09-19, 접근성 감사 7): "주최 host"의 host 쪽. 한국어
          TTS가 한글 음가로 읽습니다. 영어 로케일에서는 앞뒤가 다 영어라 이
          속성이 아무 일도 하지 않습니다. */}
      <span lang="en" className="ml-1 font-semibold text-white/50">{parts[parts.length - 1].toLowerCase()}</span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8월의 깔때기 (2026-09-18, 감사 반영 브리프 5.1).
//
// 74 → 59 → 25 → 21 → 9는 깔때기인데 같은 크기 타일 다섯으로 나열돼 있었고, 가장 중요한
// "9팀 · 시키지 않았습니다"가 가장 작았습니다(visual-storyteller). 스텝 차트 한 줄(막대 높이가
// 줄어드는 5단)과, 아래 큰 숫자 하나.
//
// dataviz 원칙: 축 없이 값 라벨만, 단일 색상(보라 원색 면)에 마지막 단만 자주. 글자는 글자
// 토큰(흰색)이고 색은 막대만 입습니다. 단위가 섞인 깔때기(명 → 팀)라 막대 높이는 값의 비율이
// 아니라 순서를 말합니다. 폰은 세로 스텝(가로 막대).
//
// 카운트업(선택 사항 채택): 뷰포트 진입 시 0 → 값 600ms, 한 번만. prefers-reduced-motion이면
// 생략. 숫자는 값 문자열에서 뽑고(74명 → 74), 접미사(명·팀)는 그대로 붙입니다.
// ─────────────────────────────────────────────────────────────────────────────
function Funnel({ stats, t, aria, className = "" }: { stats: Stat[]; t: (p: Phrase) => string; aria: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") { setProgress(1); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 600);
        setProgress(1 - Math.pow(1 - p, 3));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  const rows = stats.map((st, i) => {
    const raw = t(st.value);
    const n = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
    return { n, suffix: raw.replace(/[0-9]/g, ""), label: t(st.label), note: st.note ? t(st.note) : null, last: i === stats.length - 1 };
  });
  const max = Math.max(1, ...rows.map((r) => r.n));
  const shown = (n: number) => Math.round(n * progress);
  const last = rows[rows.length - 1];
  const bar = (r: (typeof rows)[number]) => (r.last ? "bg-naru-plum" : "bg-naru-purple");
  return (
    <figure ref={ref} role="img" aria-label={aria} className={`mx-auto max-w-3xl ${className}`}>
      {/* sm부터: 세로 막대 다섯, 값은 막대 위, 라벨은 아래. 2px 간격은 dataviz의 인접 면 간격. */}
      <div aria-hidden className="hidden items-end gap-[2px] sm:flex">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-1 flex-col items-center">
            <span className="text-2xl font-black tabular-nums tracking-tight text-white sm:text-3xl">{shown(r.n)}{r.suffix}</span>
            <div className="mt-2 flex h-28 w-full items-end">
              <div className={`w-full rounded-t-[4px] ${bar(r)} transition-[height] duration-100 ease-linear motion-reduce:transition-none`} style={{ height: `${Math.max(10, (shown(r.n) / max) * 100)}%` }} />
            </div>
            <span className="mt-2 break-keep px-1 text-center text-xs leading-snug text-white/60">{r.label}</span>
          </div>
        ))}
      </div>
      {/* 폰: 세로 스텝. 가로 막대의 길이가 줄어듭니다. */}
      <ol aria-hidden className="space-y-2 sm:hidden">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
            <span className="text-right text-xl font-black tabular-nums tracking-tight text-white">{shown(r.n)}{r.suffix}</span>
            <span className="flex items-center gap-3">
              <span className={`h-5 rounded-r-[4px] ${bar(r)}`} style={{ width: `${Math.max(8, (shown(r.n) / max) * 100)}%` }} />
              <span className="break-keep text-xs leading-snug text-white/60">{r.label}</span>
            </span>
          </li>
        ))}
      </ol>
      {/* 큰 숫자 한 줄: 이 회차에서 가장 중요한 신호. */}
      <figcaption aria-hidden className="mt-8 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 border-t border-white/10 pt-6">
        <span className="text-[clamp(2.5rem,6vw,4rem)] font-black leading-none tabular-nums tracking-tight text-white">{shown(last.n)}{last.suffix}</span>
        <span className="break-keep text-left text-sm font-semibold leading-snug text-white/85 sm:text-base">
          {last.label}
          {last.note && <span className="text-[#C79BB4]">{`\u2002·\u2002${last.note}`}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
