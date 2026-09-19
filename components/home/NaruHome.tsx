"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy, type Layer, type Stat, type RecordPhoto } from "@/data/naru";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import { links, type Phrase } from "@/data/dictionary";
import { useEffect, useRef, useState } from "react";
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
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
// RecordTabs: 2026-09-17에 뺐다가(사용자: 바로 아카이브로) 2026-09-18 감사 반영 브리프 5.2로
// 다시 넣었습니다. 멘토 / 연사와 피드백 패널 둘만.
// (2026-09-19: RecordTabs·PressRows·Funnel은 화면에서 내려가 import도 뺐습니다. 파일은 그대로.)
import { H2, H3, LABEL_HEADING, STATEMENT, GRADIENT_TEXT } from "@/components/ui/typography";
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

// 카드 한 장. 8월의 Glass와 같은 값이지만, 그 컴포넌트는 Journey.tsx 안에
// 있습니다. 두 줄짜리 래퍼를 꺼내려고 5,157줄 파일을 건드리지 않았습니다.
function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 ${className}`}>
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
        className="-my-2.5 inline-block py-2.5 underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
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
  const cellsOf = (l: Left | null): { v: string; u: Phrase; phone: boolean }[] =>
    l && l !== "started"
      ? [{ v: String(l.d), u: units.days, phone: true }, { v: pad(l.h), u: units.hours, phone: false }, { v: pad(l.m), u: units.minutes, phone: false }]
      : [{ v: "--", u: units.days, phone: true }, { v: "--", u: units.hours, phone: false }, { v: "--", u: units.minutes, phone: false }];
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
        ? t(naru.eventHero.countdownAria).replace("{d}", String(left.d)).replace("{h}", String(left.h))
        : t(naru.eventHero.countdownLabel);
  return (
    <div role="group" aria-label={aria} className={`w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-5 py-3.5 text-left ${className}`}>
      {/* 2026-09-18 (감사 반영 브리프 1.4): 테두리는 --border-2, 라벨은 흰색. 주황은 옆의 점 하나
          (상태 표시)뿐입니다. 이 점이 주황 허용 목록의 "카운트다운 옆 점"입니다.
          2026-09-19 (사용자): 서울·싱가포르 두 줄. 시차 한 시간이라 일은 같고 시간만 다릅니다. */}
      <p aria-hidden className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
        <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-naru-orange" />
        {t(naru.eventHero.countdownLabel)}
        <span className="text-white/45 sm:hidden">{` · ${formatDecemberDayWithWeekday(locale, 0)}`}</span>
      </p>
      <div aria-hidden className="mt-2 grid gap-y-1.5">
        {rows.map((r) => (
          <div key={r.key.en} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="w-[7.5rem] shrink-0 text-xs font-semibold text-white/55">{t(r.key)}</span>
            {r.l === "started" ? (
              <span className="text-xl font-black text-white">{t(naru.eventHero.started)}</span>
            ) : (
              cellsOf(r.l).map((c, i) => (
                <span key={i} className={`items-baseline gap-1 ${c.phone ? "flex" : "hidden sm:flex"}`}>
                  <span className="text-[1.6rem] font-black leading-none tabular-nums text-white">{c.v}</span>
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
function HeroPhotos({ photos, t, className = "" }: { photos: RecordPhoto[]; t: (p: Phrase) => string; className?: string }) {
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
            <Image src={photo.src} alt={t(photo.alt)} fill sizes="(max-width: 1023px) 45vw, 280px" priority={i < 2} className="object-cover object-center" />
            {photo.day && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-[12px] font-bold text-white transition-transform duration-300 group-hover:translate-y-0 motion-reduce:transition-none lg:block"
              >
                {t(photo.day)}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* lg에서는 홀수 칸이 36px 내려가 있어 그만큼 더 띄웁니다. */}
      <figcaption className="mt-3 text-center text-[12px] text-white/50 lg:mt-12 lg:text-left">{t(naru.eventHero.photosCaption)}</figcaption>
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
  // 8월 히어로의 패럴랙스 값 여섯. 두 단이 스크롤에 따라 양옆으로 벌어지며 사라집니다.
  // 2026-09-19 (사용자): 8월 히어로의 패럴랙스(두 단이 양옆으로 벌어지며 사라짐, useHeroSplit)를
  // 뺐습니다. "8월 페이지와 같은 효과, 마음에 안 듦." 히어로는 정지 레이아웃입니다.
  // 폰 Day 카드 아코디언의 열린 칸(감사 반영 브리프 3.1). 첫 카드만 기본 펼침. lg부터는 무시.
  const [openDay, setOpenDay] = useState(0);
  // 노선도의 현재 위치 점(감사 반영 브리프 3.6): 데스크톱은 호버·포커스한 카드, 폰은 열린 칸.
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  return (
    <>
    {/* tabIndex=-1: skip link가 여기로 보낼 때 브라우저가 실제로 포커스를
        옮기도록 합니다. Tab 순서에는 들어가지 않습니다. */}
    {/* naru-min12: 폰 글자 하한 12px(app/globals.css). */}
    <main id="main" tabIndex={-1} className="naru-min12 focus:outline-none">
      {/* 하단 오픈채팅 바(8월과 같은 것). #record가 지나면 나타나고 푸터가 보이면
          물러납니다. 홈에는 폰 전용 바가 없어서 폰까지 맡습니다(phone). */}
      <MobileChatBar afterId="record" endId="closing" phone />
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
      <Chapter id="top" align="center" wide className="pt-16 sm:pt-24 lg:pt-20">
        {/* relative: useScroll의 target은 offsetParent가 positioned여야 합니다.
            없으면 framer-motion이 콘솔에 경고를 냅니다(2026-09-17 배경 검증에서 발견). */}
        <div className="relative grid items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:px-0">
          <div className="text-center lg:pl-10 lg:text-left xl:pl-16">
            <Eyebrow color="purple">{t(naru.eventHero.eyebrow)}</Eyebrow>
            {/* 8월 H1과 같은 clamp. 2행은 그라데이션 토큰(GRADIENT_TEXT). ko는
                "크로싱 서울" / "CROSSING SEOUL", en은 "CROSSING" / "SEOUL".
                390px에서 각 줄이 한 줄에 들어갑니다(2행은 0.82em, 실측 2026-09-17). */}
            <h1 className="text-[clamp(2.4rem,9.5vw,6.5rem)] font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_40px_rgba(75,58,140,0.5)] lg:text-[clamp(2.65rem,6vw,5.5rem)]">
              {locale === "ko" && DECEMBER_EVENT_NAME ? (
                <>
                  <span className="block break-keep text-white">{DECEMBER_EVENT_NAME.ko}</span>
                  <span className={`${GRADIENT_TEXT} block text-[0.82em] tracking-[0.02em]`}>{DECEMBER_EVENT_NAME.en}</span>
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
            <p className="mx-auto mt-4 max-w-xl break-keep text-base font-bold leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-lg lg:mx-0">
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
                  <p id="hero-register-note" className="text-[12px] leading-snug text-white/60">{t(registerCopy.preparingNote)}</p>
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
          <div className="hidden lg:block lg:pr-10 xl:pr-16">
            <HeroPhotos photos={naru.eventHero.photos} t={t} />
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
      <Chapter id="december" align="center" className={BAND_TINT}>
        <BandFades />
        {/* 2026-09-18 (감사 반영 브리프 8): 아이브로는 보라 외곽선 1종. 주황 글자·주황 발광을 뺐습니다. */}
        <Eyebrow color="purple">
          {`${t(naru.december.eyebrowPrefix)}\u2002${decemberEventLabel(locale)}`}
        </Eyebrow>
        <h2 className={H2}><Halo tone="violet">{t(naru.december.programHeading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.december.shapeLead)}
        </p>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/55">
          <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="#why" />
        </p>
        {/* 초안 고지(DECIDED 2026-09-18, 사용자): 세부 내용이 바뀔 수 있다는 것을 챕터 머리에서
            확실하게. 호박색 점선 상자(pending 칩과 같은 계열). 8월 문법의 강조 상자 크기. */}
        <div role="note" className="mx-auto mt-6 max-w-2xl rounded-xl border border-dashed border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 text-left sm:flex sm:items-start sm:gap-3">
          <span className="mr-2 inline-block shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 align-[2px] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-200 sm:mr-0 sm:mt-0.5">{t(naru.december.draftLabel)}</span>
          <p className="inline break-keep text-sm leading-relaxed text-amber-50/90 sm:block">{t(naru.december.draftNote)}</p>
        </div>
        {/* 숫자 둘. 8월 ProgramStats("2일 필참 / 6일 선택")의 문법. shape에 이미 있는
            값 둘(5일, 2회)만 씁니다. 4차에서 여섯 칸을 뺐으니 늘리지 않습니다. */}
        <dl className="mx-auto mt-5 flex max-w-2xl items-stretch justify-center">
          {[naru.december.shape[0], naru.december.shape[3]].map((stat, i) => (
            <div key={stat.label.en} className="flex items-stretch">
              {i > 0 && <span aria-hidden className="mx-5 h-9 w-px self-center bg-white/[0.14] sm:mx-9" />}
              <div className="flex flex-col items-center px-1">
                <dd className="text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-none text-white">
                  {t(stat.value)}
                </dd>
                <dt className="mt-1.5 break-keep text-center text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/50">
                  {t(stat.label)}
                </dt>
              </div>
            </div>
          ))}
        </dl>

        {/* 노선도. 정거장 다섯, ★는 제출이 있는 날. 레일 아래 초록 필이
            General Mentoring(8월의 "1:1 멘토링 매일" 필 자리). */}
        <div className="mx-auto mt-8 max-w-5xl text-left">
          <RouteMap
            ariaLabel={t(naru.december.routeAria)}
            stations={naru.december.stages.map((s) => ({
              key: s.name.en,
              sub: s.dayOffset === null ? t(naru.december.beforeLabel) : `${t(naru.december.dayLabel)} ${s.dayOffset + 1}`,
              label: t(s.title),
              kind: s.submit ? "anchor" : "plain",
              badge: s.submit ? `${t(naru.december.submitLabel)}\u2002${t(s.submit)}` : undefined,
            }))}
            pill={t(naru.december.mentoringHeading)}
            legend={{ anchor: t(naru.december.routeLegendSubmit), plain: t(naru.december.routeLegendStage) }}
            current={hoverDay ?? (openDay >= 0 ? openDay : 0)}
          />
        </div>

        {/* 데이 카드 다섯. 8월 DayCard의 문법: DAY 큰 숫자 + 날짜 요일, 칩 줄,
            제목, 본문, "→ 그날의 한 줄". 카드는 grid로 같은 높이. */}
        <div className="mx-auto mt-10 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.scheduleLabel)}</h3>
          <p className="mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.scheduleLead)}
          </p>
          {/* 폰에서는 아코디언(감사 반영 브리프 3.1): 제목+날짜 56px 행, 탭하면 펼침, 첫 카드만
              기본 펼침. lg부터는 그 전과 같은 정적 카드 다섯. 마크업은 DayCard 하나이고 헤더만
              폰용 버튼과 데스크톱용 정적 행 둘을 두어 CSS로 고릅니다(하이드레이션 뒤 접히는
              점프가 없습니다). */}
          <ol role="list" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {naru.december.stages.map((stage, i) => (
              <DayCard
                key={stage.name.en}
                stage={stage}
                t={t}
                locale={locale}
                open={openDay === i}
                onToggle={() => setOpenDay(openDay === i ? -1 : i)}
                onFocus={() => setHoverDay(i)}
                onBlur={() => setHoverDay(null)}
              />
            ))}
          </ol>
          {/* 워크샵 줄(5차 배치 그대로). 상자는 8월 Glass 계열의 연보라 테두리. lg부터만
              (폰에서는 Day 카드 안의 한 줄이 대신합니다). */}
          <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-5">
            <p className="hidden break-keep text-xs leading-relaxed text-white/55 lg:block lg:self-center lg:pr-2">
              {t(naru.december.workshopNote)}
            </p>
            {naru.december.stages.map((stage) =>
              stage.workshop ? (
                <div key={stage.name.en} className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">
                    {t(naru.december.workshopLabel)}
                    <span className="lg:hidden">{`\u2002${t(stage.name)}`}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/90">{t(stage.workshop.title)}</p>
                  <p className="mt-0.5 break-keep text-xs leading-snug text-white/55">{t(stage.workshop.body)}</p>
                </div>
              ) : stage.dayOffset === null ? null : (
                <div key={stage.name.en} aria-hidden className="hidden lg:block" />
              ),
            )}
          </div>
          {/* General Mentoring. 초록 테두리 강조 상자(8월 "과정이 기록됩니다" 문법). */}
          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-5 py-4 lg:flex-row lg:items-center lg:gap-8 lg:px-7">
            <div className="shrink-0 lg:w-56">
              <p className="flex items-center gap-2 text-base font-bold text-white">
                <ChipDot />
                General Mentoring
              </p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-200/90">{t(naru.december.mentoringAlways)}</p>
            </div>
            {/* 폰은 2열·작은 글자(길이 목표, 감사 반영 브리프 3.1). */}
            <ul role="list" className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-x-6 sm:gap-y-2 lg:grid-cols-4">
              {naru.december.mentoringRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 break-keep border-l-2 border-white/20 pl-3 text-xs leading-snug text-white/85 sm:text-sm">
                  {t(rule)}
                </li>
              ))}
            </ul>
          </div>
          {/* 재는 것. 호박색 강조 상자(8월 "준비물은 하나예요" 문법). */}
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
            <p className="break-keep text-sm leading-relaxed text-amber-50/85">
              <span className="font-bold text-amber-200">{t(naru.why.measureLabel)}</span>
              {": "}
              <span className="font-semibold text-white">{t(naru.why.measure)}</span>
            </p>
          </div>
        </div>

        {/* 8월에 아쉬웠던 넷과 12월의 답. 번호 배지 카드 넷(8월 BenefitCard 문법), 2×2.
            제목이 아쉬웠던 것, 본문이 12월의 답. */}
        <div className="mx-auto mt-8 max-w-5xl text-left lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.december.gapsHeading)}</h3>
          {/* 폰은 1열(모바일 수정 브리프 1.3). 2열이면 150px 폭에서 "12월" 답이 서너 글자씩
              끊겼습니다. 폰에서는 번호 배지가 제목 왼쪽에 인라인. sm부터 2열, 배지 위. */}
          {/* 폰은 상자 없이 행(구분선만). sm부터 카드 2열. */}
          <ol role="list" className="mt-3 grid grid-cols-1 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            {naru.record.gaps.map((gap, i) => (
              <li key={gap.title.en} className="relative border-b border-white/10 py-3 last:border-b-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-4 sm:transition sm:hover:border-accent/30 sm:hover:bg-white/[0.05]">
                <div className="flex items-center gap-2.5 sm:block">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-black text-accent sm:h-8 sm:w-8 sm:text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="break-keep text-[15px] font-bold leading-snug text-white sm:mt-2.5 sm:text-base">{t(gap.title)}</h4>
                </div>
                <p className="mt-2 flex items-start gap-2 break-keep text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" />
                  <span>
                    <span className="mr-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">{t(naru.december.decemberLabel)}</span>
                    {gap.answer ? t(gap.answer) : t(naru.record.answerPending)}
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* 끝나면 할 일 (DECIDED 2026-09-18, 사용자: "챕터를 만들지는 말고 기존 포맷에 몇 줄 더").
            팔로업 브리프는 #after 챕터를 제안했지만 사용자가 챕터를 원하지 않아, 아쉬웠던 넷과 같은
            행 형식으로 셋만 둡니다. 8월에 이 줄이 없어서 이벤트 뒤에 멘토에게 먼저 연락한 팀이
            한 팀이었습니다. after.lead·statement·cadence·weDo 키는 data/naru.ts에 있고 그리지 않습니다. */}
        <div className="mx-auto mt-8 max-w-5xl text-left lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.after.stepsLabel)}</h3>
          <ol role="list" className="mt-3 grid grid-cols-1 sm:mt-5 sm:grid-cols-3 sm:gap-4">
            {naru.after.steps.map((step) => (
              <li key={step.num} className="relative border-b border-white/10 py-3 last:border-b-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-4">
                <div className="flex items-center gap-2.5 sm:block">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-black text-accent sm:h-8 sm:w-8 sm:text-sm">
                    {step.num}
                  </span>
                  <h4 className="break-keep text-[15px] font-bold leading-snug text-white sm:mt-2.5 sm:text-base">{t(step.title)}</h4>
                </div>
                <p className="mt-2 break-keep text-sm leading-relaxed text-white/75">{t(step.body)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* DECIDED 2026-09-18 (사용자): "아직 정해지지 않은 것" 상자를 뺐습니다. 미정 목록
            대신 위 draftNote 한 줄("새로 정해지는 것은 이 자리에 업데이트합니다")이 그 말을
            합니다. december.tbd 키는 그대로. */}

        {/* 참여 플로우 스트립(등록 → 팀 본딩 → 닷새 → 결과 공유회)은 뺐습니다(2026-09-18, 감사 반영
            브리프 3.2). 노선도가 데스크톱에서 렌더되는 것을 확인했고, 같은 시간축을 두 번 그리고
            있었습니다. FlowStrip 컴포넌트와 december.flow 키는 그대로. */}

        {/* 문. 참가자는 오픈채팅(2차 유령 필), 출제사와 후원은 텍스트 링크.
            페이지의 그라데이션 필은 히어로 하나뿐입니다. */}
        <p id="december-register-note" className="mx-auto mt-8 max-w-2xl break-keep text-sm text-white/55 lg:mt-12">
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
            className={`${buttonClass("text")} -my-2.5 min-h-[44px] py-2.5`}
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
      <Chapter id="gains" align="center">
        <Eyebrow color="purple">{t(naru.gains.eyebrow)}</Eyebrow>
        <h2 className={H2}><Halo tone="violet">{t(naru.gains.heading)}</Halo></h2>
        {/* DECIDED 2026-09-19 (얻는 것 브리프 3장): 다섯 칸에 본문이 붙습니다. 그래서
            레일이 max-w-6xl이고(한 칸의 본문 폭이 170px 아래로 내려가면 안 됩니다),
            lg:min-h-[8.5rem]은 지웠습니다. 본문이 생기면 최소 높이가 할 일이 없어요.
            폰은 64px 리스트 행이 아니라 1열 카드입니다. 본문 두 줄이 행에 들어가지
            않습니다. 번호 배지가 왼쪽, 제목과 본문이 오른쪽에 쌓입니다(끝나면 할 일
            카드와 같은 문법). item.evidence는 그대로 두고 그리지 않습니다. 8월 숫자는
            #record가 갖습니다. 이 주석을 풀지 마세요. */}
        <ol className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-2 lg:grid-cols-5 lg:items-start lg:gap-3">
          {naru.gains.items.map((item) => (
            <li
              key={item.num}
              className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left lg:flex-col lg:p-5"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-black text-accent">{item.num}</span>
              <div className="min-w-0 lg:mt-4">
                <h3 className={H3}>{t(item.title)}</h3>
                <p className="mt-2 break-keep text-sm leading-relaxed text-white/70">{t(item.body)}</p>
                {/* {item.evidence && <p className="mt-2 text-xs text-white/55">{t(item.evidence)}</p>} */}
              </div>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-sm text-white/50">{t(naru.gains.note)}</p>

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
      <Chapter id="naru" align="center" className="pt-20 sm:pt-28 lg:pt-36">
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
        <h2 className={H2}>
          <Halo tone="violet">
            <span className="block break-keep">{t(naru.hero.titleLine1)}</span>
            <span className={`${GRADIENT_TEXT} block break-keep`}>{t(naru.hero.titleLine2)}</span>
          </Halo>
        </h2>
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
        <div id="record" className="mx-auto mt-8 max-w-3xl scroll-mt-24 lg:mt-12">
          <Eyebrow color="purple">{t(naru.record.eyebrow)}</Eyebrow>
          <h3 className={H3}>{t(naru.record.heading)}</h3>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
            {t(naru.record.lead)}
          </p>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">
            {t(naru.record.lead2)}
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
        </div>

        <div id="why" className="mt-8 border-t border-white/10 pt-8 lg:mt-12 lg:pt-12">
          <Eyebrow color="purple">{t(naru.why.eyebrow)}</Eyebrow>
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

        {/* 경첩. 두 개가 함께 있어야 하는 이유. 판 두 장을 닫는 헤어라인
            아래, 챕터 제목과 같은 축에 H3로 섭니다. 먼저 각각을 읽고, 그
            다음에 둘이 한 쌍인 이유를 읽습니다. */}
        <div className="mx-auto max-w-5xl border-t border-white/10 pt-8 lg:pt-12">
          <p className="mx-auto max-w-3xl break-keep text-left text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-center">
            {t(naru.why.note)}
          </p>
          {/* 폰에서는 경첩의 부연을 접습니다(나루 챕터 길이 목표 2,200). 굵은 한 문장만. */}
          <p className="mx-auto mt-6 hidden max-w-2xl break-keep text-left text-base leading-relaxed text-white/70 lg:block lg:text-center">
            {t(naru.why.noteBody)}
          </p>
        </div>

        {/* 마지막 줄. 페이지 전체가 여기서 끝납니다. 위의 두 개를 빼면 전부
            방법이고, 방법은 바뀝니다(매니페스토 IV). 이 문장이 8일이 4일이 되는
            12월을 미리 설명합니다. */}
        <div className="mx-auto mt-8 max-w-2xl lg:mt-12">
          <h3 className={LABEL_HEADING}>{t(naru.why.agendaLabel)}</h3>
          <p className="mt-3 break-keep text-left text-base leading-relaxed text-white/75 lg:text-center">{t(naru.why.agenda)}</p>
        </div>
              {/* ── 어떻게 일하는가 (DECIDED 2026-09-18, 사용자: "나루와 학생회와 기업 내용은 하나의
            챕터로 합쳐져야 함"). 따로 있던 #how 챕터(세 층, 문 셋, 하지 않는 것)가 이 챕터의
            마지막 블록이 됐습니다. 헤어라인 하나로 나뉘고 제목은 H3. 안쪽 앵커 id="how"는
            옛 링크와 층별 문(#join-*)의 출발점을 위해 남깁니다. 카피 키(naru.how.*)는 그대로.
            그 전의 주석: #december 뒤로 내려온 이유(2026-09-17)는 git 이력에. */}
        <div id="how" className="mx-auto mt-10 max-w-5xl scroll-mt-24 border-t border-white/10 pt-8 text-center lg:mt-16 lg:pt-12">

          <Eyebrow color="purple">{t(naru.how.eyebrow)}</Eyebrow>
          <h3 className={H3}>{t(naru.how.heading)}</h3>
        {/* 폰에서는 리드를 접습니다. 다이어그램과 그 아래 한 줄("서로 직접 만나지 않습니다")이 같은 말을 합니다. */}
        <p className="mx-auto mt-6 hidden max-w-2xl break-keep text-left text-base leading-relaxed text-white/75 lg:block lg:text-center">
          {t(naru.how.lead)}
        </p>

        <LayerDiagram t={t} />

        {/* 층마다 문 하나. 2026-09-17 3차: 여기 있던 "하는 것 / 얻는 것" 카드
            셋이 내려갔습니다. 다이어그램이 이미 세 층을 그리고, 카드 셋은 같은
            세 주체를 한 번 더 세로로 세워 폰에서 800px을 썼습니다. 무엇을 주고
            받는지는 #join의 카드가 문 옆에서 말합니다. layers[].does/gets 키는
            그대로 있습니다. */}
        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-2">
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
        </div>

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
      <Chapter id="join" align="center">
        <Eyebrow color="purple">{t(naru.join.eyebrow)}</Eyebrow>
        <h2 className={H2}><Halo tone="violet">{t(naru.join.heading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.join.lead)}
        </p>

        {/* 세 곳의 결핍. ul role="list"입니다(왜 브리프 7장). 순서에 뜻이 없어요.
            세 곳은 동등합니다. #after의 steps가 ol인 것과 다릅니다. 칸 안은
            place → lack(없는 것) → opens(그래서 여는 것) 순서이고, 결핍이 먼저
            오고 처방이 나중입니다. */}
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

        {/* 세 곳에 공통된 조건 하나(매니페스토 I장). 장소를 가리지 않습니다.
            같은 I장의 다른 나라 학생과의 비교는 가져오지 않았습니다. */}
        <p className="mx-auto mt-8 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.join.milestones)}
        </p>

        {/* 안전장치 두 줄(왜 브리프 2.1). 카드가 아니라 문단입니다. 둘 다 있어야
            합니다. 첫 줄이 없으면 폐쇄적인 모임으로, 둘째 줄이 없으면 억울함의
            호소로 읽힙니다. 한 줄만 그리지 마세요. */}
        <div className="mx-auto mt-8 max-w-3xl space-y-3 break-keep text-sm leading-relaxed text-white/55">
          {naru.join.guards.map((guard, i) => (
            <p key={i}>{t(guard)}</p>
          ))}
        </div>

        {/* 규모 숫자는 출처가 확인되기 전까지 그리지 않습니다. statTbd 키는
            data/naru.ts에 있습니다. */}
        {JOIN_STAT_CONFIRMED && (
          <p className="mx-auto mt-6 max-w-2xl break-keep text-sm leading-relaxed text-white/55">
            {t(naru.join.statTbd)}
          </p>
        )}

        {/* 챕터를 닫는 자리(DECIDED 2026-09-19, 사용자: "그 공간을 왜 이 자리가
            필요한가에 더 할애"). 매니페스토 표지의 한 줄과 V장입니다. 앞의 세 칸이
            결핍이고, 이 두 문단이 그래서 무엇을 앞당겨 두는지입니다. */}
        <div className="mx-auto mt-12 max-w-3xl">
          <p className={STATEMENT}>{t(naru.join.closingStatement)}</p>
          <div className="mx-auto mt-5 max-w-2xl space-y-3 break-keep text-sm leading-relaxed text-white/70">
            {naru.join.closingBody.map((line, i) => (
              <p key={i}>{t(line)}</p>
            ))}
          </div>
        </div>

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
        <div aria-hidden className="mx-auto mt-12 h-px w-full max-w-5xl bg-white/10" />
        <div id="join-ways" className="mx-auto mt-12 max-w-3xl scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-left sm:px-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.join.manifesto.label)}
          </p>
          <h3 className="mt-3 break-keep text-lg font-bold text-white">{t(naru.join.manifesto.title)}</h3>
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
            <span className="text-xs text-white/45">{t(naru.join.manifesto.meta)}</span>
          </div>
        </div>

      </Chapter>

      {/* ── CH6 · 여기서 나온 사람 (조건부) ──────────────────────────────
          stories가 비어 있으면 챕터 자체를 그리지 않습니다. 제목만 있고 안이
          빈 섹션은 "아직 아무도 없다"로 읽히는데, 8월에 스물한 팀이 발표했으니
          그건 사실이 아닙니다. 사실은 아직 이야기를 받아 두지 못했다는 것이고,
          그건 화면이 아니라 우리가 할 일입니다.
          인용문을 지어내지 마세요(data/naru.ts의 Story 주석). */}
      {naru.people.stories.length > 0 && (
        <Chapter id="people" align="center">
          <Eyebrow color="purple">{t(naru.people.eyebrow)}</Eyebrow>
          <h2 className={H2}>{t(naru.people.heading)}</h2>
          <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
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
          <Image
            src="/naru/naru-name-rev.png"
            alt={t(naru.footer.logoAlt)}
            width={604}
            height={168}
            className="h-10 w-auto sm:h-12"
          />
          <p className="break-keep text-xs leading-relaxed text-white/60">{t(naru.footer.credits)}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <OpenChatLink t={t} src="naru-footer" label={openChatLabels.footer} className="!px-3.5 !py-2 !text-xs" />
            <a
              href={naruLinks.general}
              onClick={() => track("naru_mail", { src: "footer" })}
              className="-my-3 inline-block py-3 text-white/65 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.contact)}
            </a>
            <Link
              href={naruLinks.archive}
              className="-my-3 inline-block py-3 text-white/65 underline-offset-4 transition hover:text-white hover:underline"
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
// 직접 만나면 나루가 있을 이유가 없어요.
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
      className={`flex-1 rounded-2xl border px-4 py-3 text-left md:py-5 md:text-center ${
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
          <Chip tone="outline" className={`!text-xs tracking-[0.02em] lg:!text-[0.62rem] ${center ? "!border-accent/40 !text-accent" : ""}`}><RoleLabel text={t(layer.role)} /></Chip>
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

  // 화살표. 세로로 설 때는 아래를, 가로로 설 때는 안쪽을 가리킵니다.
  const arrow = (dir: "right" | "left") => (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center text-lg text-white/30 md:px-1"
    >
      <span className="md:hidden">↓</span>
      <span className="hidden md:inline">{dir === "right" ? "→" : "←"}</span>
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
      <div className="mt-3 flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {box(organiser)}
        {arrow("right")}
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
// Day 카드 (2026-09-18, 감사 반영 브리프 3.1). 8월 DayCard의 문법(DAY 큰 숫자 + 날짜 요일, 칩 줄,
// 제목, 본문, "→ 그날의 한 줄")은 그대로이고, 폰에서만 아코디언입니다.
//
// 헤더가 둘인 이유: 폰용은 <button aria-expanded>, 데스크톱용은 정적 행. matchMedia로 하나만
// 그리면 서버 마크업(데스크톱)이 폰에서 하이드레이션 뒤에 접히며 800px이 점프합니다. CSS로
// 고르면 첫 페인트부터 접혀 있습니다. display:none은 접근성 트리에서도 빠지므로 데스크톱
// 스크린리더가 눌리지 않는 버튼을 만나지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
type Stage = (typeof naru.december.stages)[number];
function DayCard({
  stage,
  t,
  locale,
  open,
  onToggle,
  onFocus,
  onBlur,
}: {
  stage: Stage;
  t: (p: Phrase) => string;
  locale: "ko" | "en";
  open: boolean;
  onToggle: () => void;
  /** 노선도의 현재 위치 점이 이 카드로 오게(호버·포커스). */
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const bodyId = `day-${stage.name.en.toLowerCase().replace(/\s+/g, "-")}-body`;
  const kicker = stage.dayOffset === null ? t(naru.december.beforeLabel) : t(naru.december.dayLabel);
  const date = stage.dayOffset === null ? t(stage.when) : formatDecemberDayWithWeekday(locale, stage.dayOffset);
  // 한글 주 + 영문 소문자 보조(감사 반영 브리프 8). en에서는 이름이 곧 제목이라 보조를 붙이지 않습니다.
  const sub = locale === "ko" ? stage.name.en.toLowerCase() : null;
  return (
    <li
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`relative flex h-full flex-col rounded-2xl border text-left ${
        stage.submit ? "border-[#9A5A82]/40 bg-white/[0.055]" : "border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      {/* 폰 헤더: 56px 행, 탭하면 펼침. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 text-left lg:hidden"
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent/80">{kicker}</span>
          {stage.dayOffset !== null && <span className="text-xl font-black leading-none text-white">{stage.dayOffset + 1}</span>}
          <span className="truncate text-[15px] font-bold text-white">{t(stage.title)}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-white/55">
          {date}
          <span aria-hidden className={`inline-block text-white/45 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>⌄</span>
        </span>
      </button>
      {/* 데스크톱 헤더: 정적. */}
      <div className="hidden items-baseline justify-between gap-3 p-4 pb-0 sm:p-5 sm:pb-0 lg:flex">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-accent/80">{kicker}</span>
          {stage.dayOffset !== null && <span className="text-2xl font-black leading-none text-white">{stage.dayOffset + 1}</span>}
        </span>
        <span className="shrink-0 text-[0.7rem] text-white/55">{date}</span>
      </div>
      <div id={bodyId} className={`${open ? "block" : "hidden"} px-4 pb-4 sm:px-5 sm:pb-5 lg:block`}>
        <div className="flex flex-wrap gap-1.5 lg:mt-3">
          {/* 강조색은 하나(감사 반영 브리프 3.3): "★ 제출" 칩만 자주, 나머지는 --border-2 외곽선. */}
          {stage.submit && (
            <Chip tone="plum">
              <span aria-hidden>★</span>{`${t(naru.december.submitLabel)}\u2002${t(stage.submit)}`}
            </Chip>
          )}
          {stage.chips.map((c, i) => (
            <Chip key={i} tone="outline">{t(c)}</Chip>
          ))}
        </div>
        <h4 className="mt-3 hidden flex-wrap items-baseline gap-x-2 text-[15px] font-bold leading-snug text-white lg:flex">
          {t(stage.title)}
          {sub && <span className="text-xs font-semibold text-white/50">{sub}</span>}
        </h4>
        {/* 폰(lg 아래)에서는 두 줄까지(모바일 수정 브리프 1.4). */}
        <p className="mt-2 line-clamp-2 break-keep text-[13px] leading-relaxed text-white/65 lg:mt-1.5 lg:line-clamp-none">{t(stage.body)}</p>
        {/* "→ 그날의 한 줄"은 흰색 볼드 하나(감사 반영 브리프 3.3). */}
        <p className="mt-2 flex gap-1.5 break-keep text-[12.5px] font-bold leading-snug text-white">
          <span aria-hidden className="text-white/50">→</span>
          {t(stage.line)}
        </p>
        {/* 폰: 워크샵을 카드 안 한 줄로(라벨 + 이름). 상자 셋은 lg부터(모바일 수정 브리프 1.1). */}
        {stage.workshop && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 text-xs text-white/70 lg:hidden">
            <span className="font-bold uppercase tracking-[0.14em] text-accent">{t(naru.december.workshopLabel)}</span>
            <span className="font-semibold text-white/85">{t(stage.workshop.title)}</span>
          </p>
        )}
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// "그래서 지키는 것" (2026-09-18, 감사 반영 브리프 6.1). 폰에서는 접혀 있고 버튼으로 펼칩니다.
// lg부터는 그 전과 같은 dl. 데스크톱 판형은 사용자가 정한 자리라 그대로입니다.
// ─────────────────────────────────────────────────────────────────────────────
function KeepsPanel({ label, body }: { label: string; body: string }) {
  const [open, setOpen] = useState(false);
  const id = `keeps-${label.length}-${body.length}`;
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
      <span className="ml-1 font-semibold text-white/50">{parts[parts.length - 1].toLowerCase()}</span>
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
