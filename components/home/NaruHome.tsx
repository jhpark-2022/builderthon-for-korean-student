"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, type Layer, type Stat, type RecordPhoto } from "@/data/naru";
import { links, type Phrase } from "@/data/dictionary";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DECEMBER_EVENT_NAME,
  DECEMBER_STARTS_AT_MS,
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
import FlowStrip from "@/components/shared/FlowStrip";
import MobileChatBar from "@/components/shared/MobileChatBar";
import PressRows from "@/components/shared/PressRows";
import { BAND_TINT, BandFades } from "@/components/shared/Band";
import { useHeroSplit } from "@/components/shared/useHeroSplit";
import Chapter from "@/components/journey/Chapter";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
// RecordTabs는 화면에 없습니다(2026-09-17, 사용자: 8월 챕터는 바로 아카이브로 보낸다).
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
//   #naru      나루 (로고, 태그라인, 변하지 않는 두 개)   ← 그룹은 여기서 시작
//   #how       학생회와 기업 (세 층)
//   #join      함께하는 길
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
  useEffect(() => {
    const tick = () => {
      const ms = DECEMBER_STARTS_AT_MS - Date.now();
      if (ms <= 0) { setLeft("started"); return; }
      const mins = Math.floor(ms / 60000);
      setLeft({ d: Math.floor(mins / 1440), h: Math.floor((mins % 1440) / 60), m: mins % 60 });
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  void locale;
  const units = naru.eventHero.countdownUnits;
  const pad = (n: number) => String(n).padStart(2, "0");
  // DECIDED 2026-09-18 (모바일 수정 브리프 2): 한 줄. 서울 기준만(싱가포르 줄은 시차 한 시간에
  // 날짜가 같아 뺌). 초는 뺐고, 폰은 일만, sm부터 일·시간·분. 이날 아침의 두 줄·초 단위는
  // 닷새짜리 이벤트에 과했습니다.
  const cells: { v: string; u: Phrase; phone: boolean }[] =
    left && left !== "started"
      ? [{ v: String(left.d), u: units.days, phone: true }, { v: pad(left.h), u: units.hours, phone: false }, { v: pad(left.m), u: units.minutes, phone: false }]
      : [{ v: "--", u: units.days, phone: true }, { v: "--", u: units.hours, phone: false }, { v: "--", u: units.minutes, phone: false }];
  return (
    <div className={`flex w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-left ${className}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F2B183]">
        {t(naru.eventHero.countdownLabel)}
        <span className="text-white/45">{` · ${t(naru.eventHero.countdownRows.seoul)}`}</span>
      </p>
      {left === "started" ? (
        <p className="text-xl font-black text-white">{t(naru.eventHero.started)}</p>
      ) : (
        <div className="flex items-baseline gap-4">
          {cells.map((c, i) => (
            <div key={i} className={`items-baseline gap-1 ${c.phone ? "flex" : "hidden sm:flex"}`}>
              <span className="text-[2rem] font-black leading-none tabular-nums text-white">{c.v}</span>
              <span className="text-xs font-semibold text-white/55">{t(c.u)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 히어로 사진 넷 (DECIDED 2026-09-17, 사용자). 오른쪽 단(폰은 카피 아래)에 8월 행사
// 사진을 2×2로. 형상 무대(싱가포르·서울 점)는 이날 걷었습니다. 사진은 전부 4:3이라
// 칸도 4:3, fill + cover가 실제로는 아무것도 자르지 않습니다(PhotoWall과 같음).
// 오른쪽 열을 조금 내려(lg:mt-10) 한 덩어리로 읽히게 합니다.
// ─────────────────────────────────────────────────────────────────────────────
function HeroPhotos({ photos, t, className = "" }: { photos: RecordPhoto[]; t: (p: Phrase) => string; className?: string }) {
  if (photos.length === 0) return null;
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${className}`}>
      {photos.slice(0, 4).map((photo, i) => (
        <div
          key={photo.src}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] ${i % 2 === 1 ? "lg:translate-y-8" : ""}`}
        >
          <Image src={photo.src} alt={t(photo.alt)} fill sizes="(max-width: 1024px) 45vw, 22vw" priority={i < 2} className="object-cover object-center" />
        </div>
      ))}
    </div>
  );
}

export default function NaruHome() {
  const { t, locale } = useLocale();
  // 8월 히어로의 패럴랙스 값 여섯. 두 단이 스크롤에 따라 양옆으로 벌어지며 사라집니다.
  const { heroRef, leftX, rightX, splitX, heroFade } = useHeroSplit();

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

          주황 원장(2026-09-17 2차 갱신):
            면  이 버튼(오픈채팅) 하나. 12월 아이브로의 주황 테두리는 #december로
                내려가 그대로입니다.
            점  #naru 코어 둘의 나루 표식, 배경 깊은 물의 점.
            글자 기간 줄의 #F2B183 틴트.
          늘리지 마세요. */}
      {/* DECIDED 2026-09-17 (8월 문법 브리프): 두 단입니다. 8월 히어로의 그리드와
          같은 클래스이고 패럴랙스도 같은 훅(useHeroSplit)입니다. 왼쪽이 아이브로,
          두 줄 제목(1행 흰색, 2행 그라데이션), 굵은 기간 줄, 포지션, 서술, CTA 둘.
          오른쪽(lg부터)이 카운트다운 패널. 파트너 로고 띠는 12월 출제사·후원사가
          확정될 때까지 두지 않습니다(components/shared/HeroPartnerStrip.tsx의 TODO).

          주황 원장(2026-09-17 3차 갱신): 버튼 면에서 주황이 빠졌습니다. 주 CTA는
          보라 → 자주 그라데이션 필입니다. 남은 주황은 점(로고, #naru 코어 표식),
          그라데이션의 끝, 12월 아이브로 글자색, 기간 줄 틴트뿐입니다. */}
      <Chapter id="top" align="center" wide className="pt-16 sm:pt-24 lg:pt-20">
        {/* relative: useScroll의 target은 offsetParent가 positioned여야 합니다.
            없으면 framer-motion이 콘솔에 경고를 냅니다(2026-09-17 배경 검증에서 발견). */}
        <div ref={heroRef} className="relative grid items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:px-0">
          <motion.div style={{ x: splitX ? leftX : undefined, opacity: heroFade }} className="text-center lg:pl-10 lg:text-left xl:pl-16">
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
            <p className="mt-8 text-sm font-semibold text-[#F2B183] drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base">
              {formatDecemberDateLine(locale)}
            </p>
            <p className="mx-auto mt-4 max-w-xl break-keep text-base font-bold leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-lg lg:mx-0">
              {t(naru.december.heading)}
            </p>
            <p className="mx-auto mt-3 max-w-xl break-keep text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base lg:mx-0">
              {t(naru.eventHero.sub)}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
              <OpenChatLink t={t} src="naru-hero" label={openChatLabels.december} variant="hero" />
              {/* 오픈채팅이 막혀 있으면(links.openChat 빈 문자열, 2026-09-17) 이 앵커가
                  히어로의 유일한 문이라 주 CTA의 면(그라데이션 필)을 받습니다. 히어로의
                  주 CTA는 언제나 하나입니다. */}
              <a
                href="#december"
                onClick={() => track("naru_cta", { src: "hero", to: "december" })}
                className={links.openChat ? buttonClass("secondary") : `group ${buttonClass("primary", "naru")}`}
              >
                {t(naru.eventHero.ctaProgram)}
                <span aria-hidden className={links.openChat ? "text-white/50" : ARROW_CLASS}>↓</span>
              </a>
            </div>
            {/* 카운트다운(얇은 한 줄). lg부터 여기, 그 아래 폭에서는 무대 다음에. */}
            <CountdownPanel t={t} locale={locale} className="mt-8 hidden lg:block" />
          </motion.div>
          {/* 오른쪽 단 = 8월 행사 사진 넷 (DECIDED 2026-09-17, 사용자). 8월 히어로의
              메탈 휴먼 자리입니다. 사람이 많이 나온 장면만, 같은 사진은 사이트에 한 번.
              그 전의 형상 무대(싱가포르·서울 점, 배경 수정 브리프)는 같은 날 걷었습니다.
              lg부터만. */}
          <motion.div style={{ x: splitX ? rightX : undefined, opacity: heroFade }} className="hidden lg:block lg:pr-10 xl:pr-16">
            <HeroPhotos photos={naru.eventHero.photos} t={t} />
          </motion.div>
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
        <Eyebrow color="orange">
          {`${t(naru.december.eyebrowPrefix)}\u2002${decemberEventLabel(locale)}`}
        </Eyebrow>
        <h2 className={H2}><Halo tone="orange">{t(naru.december.programHeading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.december.shapeLead)}
        </p>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/55">
          <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="#why" />
        </p>
        {/* 숫자 둘. 8월 ProgramStats("2일 필참 / 6일 선택")의 문법. shape에 이미 있는
            값 둘(5일, 2회)만 씁니다. 4차에서 여섯 칸을 뺐으니 늘리지 않습니다. */}
        <dl className="mx-auto mt-5 flex max-w-2xl items-stretch justify-center">
          {[naru.december.shape[0], naru.december.shape[3]].map((stat, i) => (
            <div key={stat.label.en} className="flex items-stretch">
              {i > 0 && <span aria-hidden className="mx-5 h-9 w-px self-center bg-white/[0.14] sm:mx-9" />}
              <div className="flex flex-col items-center px-1">
                <dd className={`text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-none ${i === 0 ? "text-[#F2B183]" : "text-white"}`}>
                  {t(stat.value)}
                </dd>
                <dt className={`mt-1.5 break-keep text-center text-[0.68rem] font-bold uppercase tracking-[0.1em] ${i === 0 ? "text-[#F2B183]/80" : "text-white/50"}`}>
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
              label: t(s.name),
              kind: s.submit ? "anchor" : "plain",
              badge: s.submit ? `${t(naru.december.submitLabel)}\u2002${t(s.submit)}` : undefined,
            }))}
            pill={t(naru.december.mentoringHeading)}
            legend={{ anchor: t(naru.december.routeLegendSubmit), plain: t(naru.december.routeLegendStage) }}
          />
        </div>

        {/* 데이 카드 다섯. 8월 DayCard의 문법: DAY 큰 숫자 + 날짜 요일, 칩 줄,
            제목, 본문, "→ 그날의 한 줄". 카드는 grid로 같은 높이. */}
        <div className="mx-auto mt-10 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.scheduleLabel)}</h3>
          <p className="mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.scheduleLead)}
          </p>
          <ol role="list" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {naru.december.stages.map((stage) => (
              <li
                key={stage.name.en}
                className={`relative flex h-full flex-col rounded-2xl border p-4 text-left sm:p-5 ${
                  stage.submit ? "border-rose-400/25 bg-white/[0.055]" : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-accent/80">
                      {stage.dayOffset === null ? t(naru.december.beforeLabel) : t(naru.december.dayLabel)}
                    </span>
                    {stage.dayOffset !== null && (
                      <span className="text-2xl font-black leading-none text-white">{stage.dayOffset + 1}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[0.7rem] text-white/55">
                    {stage.dayOffset === null ? t(stage.when) : formatDecemberDayWithWeekday(locale, stage.dayOffset)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {stage.submit && (
                    <Chip tone="rose">
                      <span aria-hidden>★</span>{`${t(naru.december.submitLabel)}\u2002${t(stage.submit)}`}
                    </Chip>
                  )}
                  {stage.chips.map((c, i) => (
                    <Chip key={i} tone={stage.dayOffset === null ? "amber" : "neutral"}>
                      {stage.dayOffset === null && <span aria-hidden>●</span>}
                      {t(c)}
                    </Chip>
                  ))}
                </div>
                <h4 className="mt-3 text-[15px] font-bold leading-snug text-white">{t(stage.name)}</h4>
                {/* 폰(lg 아래)에서는 두 줄까지(모바일 수정 브리프 1.4). "→ 그날의 한 줄"은 그대로. */}
                <p className="mt-1.5 line-clamp-2 break-keep text-[13px] leading-relaxed text-white/65 lg:line-clamp-none">{t(stage.body)}</p>
                <p className="mt-2 flex gap-1.5 break-keep text-[12.5px] font-semibold leading-snug text-emerald-200/85">
                  <span aria-hidden className="text-emerald-300/70">→</span>
                  {t(stage.line)}
                </p>
                {/* 폰: 워크샵을 카드 안 한 줄로(라벨 + 이름). 상자 셋은 lg부터(모바일 수정 브리프 1.1). */}
                {stage.workshop && (
                  <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 text-xs text-white/70 lg:hidden">
                    <span className="font-bold uppercase tracking-[0.14em] text-accent">{t(naru.december.workshopLabel)}</span>
                    <span className="font-semibold text-white/85">{t(stage.workshop.title)}</span>
                  </p>
                )}
              </li>
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
            <ul role="list" className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              {naru.december.mentoringRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 break-keep border-l-2 border-emerald-400/50 pl-3 text-sm leading-snug text-emerald-50/90">
                  {t(rule)}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 break-keep text-xs text-white/55">{t(naru.december.draftNote)}</p>
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
        <div className="mx-auto mt-12 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.gapsHeading)}</h3>
          {/* 폰은 1열(모바일 수정 브리프 1.3). 2열이면 150px 폭에서 "12월" 답이 서너 글자씩
              끊겼습니다. 폰에서는 번호 배지가 제목 왼쪽에 인라인. sm부터 2열, 배지 위. */}
          <ol role="list" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {naru.record.gaps.map((gap, i) => (
              <li key={gap.title.en} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-accent/30 hover:bg-white/[0.05] sm:p-4">
                <div className="flex items-center gap-2.5 sm:block">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-black text-accent sm:h-8 sm:w-8 sm:text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="break-keep text-[15px] font-bold leading-snug text-white sm:mt-2.5 sm:text-base">{t(gap.title)}</h4>
                </div>
                <p className="mt-2 flex items-start gap-2 break-keep text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F2B183]/80" />
                  <span>
                    <span className="mr-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#F2B183]">{t(naru.december.decemberLabel)}</span>
                    {gap.answer ? t(gap.answer) : t(naru.record.answerPending)}
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* DECIDED 2026-09-18 (사용자): "아직 정해지지 않은 것" 상자를 뺐습니다. 미정 목록
            대신 위 draftNote 한 줄("새로 정해지는 것은 이 자리에 업데이트합니다")이 그 말을
            합니다. december.tbd 키는 그대로. */}

        {/* 플로우 스트립. 8월 "참여 플로우"의 문법. lg부터만(모바일 수정 브리프 1.2: 폰에서는
            세로 상자 넷 + 화살표 셋 350px에 정보가 없음). */}
        <div className="mx-auto mt-12 hidden max-w-5xl text-left lg:block">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">{t(naru.december.flowLabel)}</p>
          <FlowStrip
            className="mt-4"
            align="center"
            items={naru.december.flow}
            render={(f) => (
              <div className="flex w-full items-center justify-center rounded-xl border border-accent/25 bg-accent/10 px-4 py-2.5 text-center text-sm font-semibold text-white">{t(f)}</div>
            )}
          />
        </div>

        {/* 문. 참가자는 오픈채팅(2차 유령 필), 출제사와 후원은 텍스트 링크.
            페이지의 그라데이션 필은 히어로 하나뿐입니다. */}
        <p className="mx-auto mt-12 max-w-2xl break-keep text-sm text-white/55">{t(naru.december.ctaNote)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} variant="secondary" />
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
        <Eyebrow color="emerald">{t(naru.gains.eyebrow)}</Eyebrow>
        <h2 className={H2}><Halo tone="violet">{t(naru.gains.heading)}</Halo></h2>
        <ol className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-5">
          {naru.gains.items.map((item, i, arr) => (
            <li
              key={item.num}
              className={`flex flex-col items-start rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left ${i === arr.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-sm font-black text-emerald-200">{item.num}</span>
              <h3 className={`${H3} mt-4`}>{t(item.title)}</h3>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-sm text-white/50">{t(naru.gains.note)}</p>
      </Chapter>

      {/* ── CH3 · 8월이 남긴 것 (DECIDED 2026-09-17, 홈 흐름 재배치 브리프) ──
          히어로 바로 아래에 있던 챕터가 프로그램과 얻는 것 뒤로 내려왔습니다.
          히어로를 본 사람이 묻는 순서: 무엇을 하는가(#december) → 무엇이 남는가
          (#gains) → 그게 진짜인가(여기) → 누가 만드는가(#naru 이후). 기본 이음매. */}
      <Chapter id="record" align="center">
        <Eyebrow color="violet">{t(naru.record.eyebrow)}</Eyebrow>
        <h2 className={H2}><Halo tone="violet">{t(naru.record.heading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.record.lead)}
        </p>
        {/* 숫자 다섯. 마지막 하나만 설명 줄을 답니다. "9팀이 출제사에 직접
            자료를 요청했다"는 숫자만으로는 무슨 뜻인지 알 수 없고, 그 뜻이
            이 회차에서 가장 중요한 신호입니다. 시키지 않았는데 했어요. */}
        <StatRow stats={naru.record.stats} t={t} className="mt-12 lg:grid-cols-5" />

        {/* DECIDED 2026-09-17 (사용자): 사람 탭(RecordTabs)은 넣지 않습니다. "이런 식으로
            너무 디테일하게 넣지는 말고, 이 챕터는 그냥 바로 8월로 보내줘." 이 챕터는
            숫자 다섯과 언론 줄, 그리고 아카이브 버튼 하나입니다. 멘토·연사·패널은
            /2026-08이 정본이고 거기서 봅니다. 사진 벽도 화면에 없습니다(사진은 히어로).
            RecordTabs 파일과 record.tabs 키는 그대로 둡니다. */}

        {/* 언론(DECIDED 2026-09-17). 8월 페이지의 press 블록과 같은 줄(shared/
            PressRows). 위는 행사 뒤 싱가포르 현지 매체, 아래 둘은 8월 페이지에
            있던 기사입니다. 사람 아래에 두는 이유: 사람이 "안"이고 기사는 그것을
            밖에서 본 눈이라, 순서가 안에서 밖입니다. */}
        <PressRows
          items={naru.record.press}
          tag={naru.record.pressTag}
          lead={naru.record.pressLead}
          cta={naru.record.pressCta}
          t={t}
          className="mt-12"
        />

        {/* 이 챕터의 유일한 행동입니다. 2026-09-16에 유령 버튼에서 실린 버튼으로
            올렸습니다 - 8월의 설명이 전부 저쪽으로 갔으니, 더 알고 싶은 사람에게
            이 버튼은 선택지가 아니라 다음 문장입니다. 주황은 히어로의 주 CTA가
            이미 쓰고 있어서 흰 면을 씁니다(색 규칙은 히어로 주석 참고). */}
        <div className="mt-12 flex justify-center">
          <Link
            href={naruLinks.archive}
            onClick={() => track("naru_cta", { src: "record", to: "archive" })}
            className={buttonClass("secondary")}
          >
            {t(naru.record.cta)}
            <span aria-hidden className="text-white/50">→</span>
          </Link>
        </div>
      </Chapter>

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
          className="mx-auto h-auto w-40 sm:w-52"
        />
        <div className="mt-6">
          <Eyebrow color="violet">{t(naru.hero.eyebrow)}</Eyebrow>
        </div>
        {/* 태그라인. 두 줄 고정(히어로에 있던 때의 이유 그대로: 두 개의 선언). */}
        <h2 className={H2}>
          <Halo tone="violet">
            <span className="block break-keep">{t(naru.hero.titleLine1)}</span>
            <span className={`${GRADIENT_TEXT} block break-keep`}>{t(naru.hero.titleLine2)}</span>
          </Halo>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.group.lead)}
        </p>
        {/* 서명 헤어라인. 이 페이지에서 한 번. */}
        <div
          aria-hidden
          className="mx-auto mt-12 h-[2px] w-full max-w-[52rem] bg-gradient-to-r from-accent to-accent-strong"
        />
        {/* 라벨만. "우리는 두 가지를 만들려고 모였습니다" 제목은 내려갔습니다
            (2026-09-17 3차). 태그라인이 바로 위에 H2로 있고, lead가 "바뀌지 않는
            것은 아래 두 개"라고 이미 말합니다. 같은 챕터에 큰 제목 둘은 길이만
            늘립니다. why.heading 키는 그대로. */}
        <div id="why" className="mt-12">
          <Eyebrow color="violet">{t(naru.why.eyebrow)}</Eyebrow>
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
              className={`grid gap-6 py-8 md:grid-cols-[1.4fr_1fr] md:gap-14 lg:py-10 ${
                i > 0 ? "border-t border-white/10" : ""
              }`}
            >
              <div>
                <h3 className={`flex items-start gap-4 ${STATEMENT}`}>
                  <NaruMark className="mt-[0.2em] h-[0.8em] w-[0.8em]" />
                  <span>{t(core.title)}</span>
                </h3>
                {/* 첫 줄은 그 자체가 코어의 문장입니다("스크리닝이 없고, 순위가
                    없습니다. 못해도 되는 자리입니다."). 제목 다음으로 큽니다. */}
                <p className="mt-6 break-keep text-lg font-medium leading-snug text-white/90 sm:text-xl">
                  {t(core.lines[0])}
                </p>
                <p className="mt-4 max-w-xl break-keep text-base leading-relaxed text-white/70">
                  {t(core.lines[1])}
                </p>
              </div>
              <dl className="border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-2">
                <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent">
                  {t(naru.why.keepsLabel)}
                </dt>
                <dd className="mt-3 break-keep text-base leading-relaxed text-white/80">{t(core.keeps)}</dd>
              </dl>
            </li>
          ))}
        </ol>

        {/* 경첩. 두 개가 함께 있어야 하는 이유. 판 두 장을 닫는 헤어라인
            아래, 챕터 제목과 같은 축에 H3로 섭니다. 먼저 각각을 읽고, 그
            다음에 둘이 한 쌍인 이유를 읽습니다. */}
        <div className="mx-auto max-w-5xl border-t border-white/10 pt-12">
          <p className="mx-auto max-w-3xl break-keep text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
            {t(naru.why.note)}
          </p>
          <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/70">
            {t(naru.why.noteBody)}
          </p>
        </div>

        {/* 마지막 줄. 페이지 전체가 여기서 끝납니다. 위의 두 개를 빼면 전부
            방법이고, 방법은 바뀝니다(매니페스토 IV). 이 문장이 8일이 4일이 되는
            12월을 미리 설명합니다. */}
        <div className="mx-auto mt-12 max-w-2xl">
          <h3 className={LABEL_HEADING}>{t(naru.why.agendaLabel)}</h3>
          <p className="mt-3 break-keep text-base leading-relaxed text-white/75">{t(naru.why.agenda)}</p>
        </div>
      </Chapter>

      {/* ── CH4 · 어떻게 일하는가 ────────────────────────────────────────── */}
      {/* DECIDED 2026-09-17: #december 뒤로 내려왔습니다(전에는 #record와
          #december 사이). 이 챕터의 독자는 학생회 임원, 기업 담당자, 운영진,
          곧 바로 아래 #join의 독자입니다. 12월을 예비하는 문장은 한 줄도 없었고,
          그런데도 12월 앞에 서서 폰에서 2,140px를 쓰고 있었어요. 여기 있으면
          "누가 이 자리를 만드는가"가 "그래서 각자의 문은 어디인가"로 바로
          이어지고, "가입 폼 없음"을 두 챕터 떨어져 세 번 말하던 것도 붙습니다.
          기본 이음매(216px)입니다. */}
      <Chapter id="how" align="center" className={BAND_TINT}>
        <BandFades />
        <Eyebrow color="cyan">{t(naru.how.eyebrow)}</Eyebrow>
        <h2 className={H2}><Halo tone="cyan">{t(naru.how.heading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
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
              href={`#${layer.join.id}`}
              onClick={() => track("naru_cta", { src: "how", to: layer.join.id })}
              className="-my-2.5 inline-flex min-h-[44px] items-center gap-1.5 py-2.5 text-sm font-medium text-accent transition hover:text-white"
            >
              {t(layer.join.label)}
              <span aria-hidden>→</span>
            </a>
          ))}
        </div>

        {/* 하지 않는 것. 짧게, 목록으로. 이 블록이 있어야 "그럼 어떻게
            들어가나"라는 질문이 바로 다음 챕터로 넘어갑니다.
            2026-09-16: 옆에 있던 "이름의 두 겹" 두 문단이 내려갔습니다. 그건
            로고 가이드가 말하는 것이고, 이 챕터가 대답해야 하는 질문("어떻게
            일하는가")과는 다른 질문의 답이었습니다. nameLines 키는 그대로
            있습니다. 남은 블록 하나가 폭을 다 씁니다. */}
        <div className="mx-auto mt-12 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.how.notDoingLabel)}
          </p>
          {/* role="list"입니다. Preflight가 모든 ul/ol에 list-style:none을
              걸고, Safari + VoiceOver는 그 목록에서 리스트 의미를 통째로
              떼어냅니다. 역할을 명시해야 "3개 중 1번"이 살아납니다. */}
          <ul role="list" className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {naru.how.notDoing.map((line, i) => (
              <li key={i} className="flex gap-2.5 break-keep text-sm leading-relaxed text-white/75">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                {t(line)}
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      {/* ── CH5 · 함께하는 길 ────────────────────────────────────────────── */}
      <Chapter id="join" align="center">
        <Eyebrow color="emerald">{t(naru.join.eyebrow)}</Eyebrow>
        <h2 className={H2}><Halo tone="emerald">{t(naru.join.heading)}</Halo></h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.join.lead)}
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 text-left md:grid-cols-2">
          {naru.join.cards.map((card, i) => (
            <Card key={card.id} id={card.id} className="flex flex-col !rounded-2xl !bg-white/[0.03] !p-5 transition hover:border-emerald-400/25 hover:bg-white/[0.05]">
              {/* 번호 배지. 8월 BenefitCard의 문법(작은 사각, 챕터 색). */}
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-sm font-black text-emerald-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 break-keep text-lg font-bold text-white">{t(card.who)}</h3>
              {/* 첫 줄만 그립니다(2026-09-16). 둘째 줄은 전부 첫 줄의 조건과
                  다음 단계였고, 그건 메일을 보낸 뒤에 나눌 이야기입니다.
                  lines[1]은 data/naru.ts에 그대로 있습니다. */}
              <p className="mt-4 flex-1 break-keep text-sm leading-relaxed text-white/70">
                {t(card.lines[0])}
              </p>
              <div className="mt-6">
                {card.openChat && !links.openChat ? (
                  // 오픈채팅이 막혀 있는 동안(2026-09-17) 참가자 카드에는 문이 없습니다.
                  // 버튼 자리에 둘째 줄("등록은 아직 열리지 않았습니다")을 보입니다.
                  <p className="break-keep text-sm text-white/55">{t(card.lines[1])}</p>
                ) : card.openChat ? (
                  <OpenChatLink t={t} src="naru-join" label={openChatLabels.join} />
                ) : (
                  <a
                    href={card.door}
                    onClick={() => track("naru_mail", { src: `join_${card.id}` })}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
                  >
                    {t(card.doorLabel)}
                    <span aria-hidden className="text-white/50">→</span>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
        {/* 8월을 건넌 분께. 카드 넷 아래 폭 전체를 쓰는 띠 하나입니다.
            이유는 data/naru.ts의 alumni 주석에 있습니다. */}
        <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-5 py-6 text-left sm:px-7">
          <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-200/90">
            <ChipDot />
            {t(naru.join.alumni.label)}
          </p>
          {/* 첫 줄과 이야기 안내만. 둘째 줄("받은 사람이 돌려주는 모습이 보일
              때 문화가 됩니다")은 12월 챕터의 after 블록과 같은 문장이었는데 그
              블록이 내려갔으니 이 자리에서도 뺍니다. 키는 그대로 있습니다. */}
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/80">
            {t(naru.join.alumni.lines[0])}
          </p>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/60">
            {t(naru.join.alumni.storyNote)}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <OpenChatLink t={t} src="naru-join" label={openChatLabels.join} />
            <a
              href={naruLinks.alumni}
              onClick={() => track("naru_mail", { src: "alumni" })}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              {t(naru.join.alumni.mailLabel)}
              <span aria-hidden className="text-white/50">→</span>
            </a>
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
          <Eyebrow color="plum">{t(naru.people.eyebrow)}</Eyebrow>
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
      className={`flex-1 rounded-2xl border px-4 py-5 text-center ${
        center
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      {/* 역할 라벨은 8월 칩 문법(2026-09-17). 가운데(주최)만 한 단 밝은 칩. */}
      <p>
        <Chip tone={center ? "violet" : "neutral"} className="!text-xs uppercase tracking-[0.14em] lg:!text-[0.62rem]">{t(layer.role)}</Chip>
      </p>
      <p className="mt-1.5 break-keep text-sm font-bold leading-snug text-white sm:text-base">
        {t(layer.who)}
      </p>
      <p className="mt-2 break-keep text-xs leading-snug text-white/55">{t(layer.brings)}</p>
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
    <div className="mx-auto mt-12 max-w-5xl">
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
