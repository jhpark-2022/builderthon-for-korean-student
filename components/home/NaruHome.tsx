"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, type Layer, type Stat, type RecordPhoto } from "@/data/naru";
import type { Phrase } from "@/data/dictionary";
import {
  DECEMBER_EVENT_NAME,
  decemberEventLabel,
  formatDecemberDateLine,
  formatDecemberDay,
} from "@/lib/naruDates";
import Chapter from "@/components/journey/Chapter";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
// RecordTabs는 2026-09-16에 화면에서 내려갔습니다. 파일은 그대로 둡니다 -
// 8월 정본을 직접 읽는 유일한 컴포넌트이고, 되살릴 자리가 여기 #record입니다.
import { H2, LABEL_HEADING, STATEMENT } from "@/components/ui/typography";
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
        className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
      >
        {term}
      </a>
      {text.slice(i + term.length)}
    </>
  );
}

export default function NaruHome() {
  const { t, locale } = useLocale();

  return (
    <>
    {/* tabIndex=-1: skip link가 여기로 보낼 때 브라우저가 실제로 포커스를
        옮기도록 합니다. Tab 순서에는 들어가지 않습니다. */}
    <main id="main" tabIndex={-1} className="focus:outline-none">
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
      <Chapter id="top" align="center" className="pt-20 sm:pt-32">
        {/* 보라입니다. 히어로에 주황이 둘(알약 + 버튼)이면 "점처럼 쓴다"는
            규칙이 첫 화면에서 깨집니다(2026-09-15의 같은 결정). */}
        <Eyebrow color="purple">{t(naru.eventHero.eyebrow)}</Eyebrow>
        {/* 이름이 H1입니다. ko에서는 아래에 영문 표기를 한 줄 더 답니다.
            en에서는 이름 자체가 영문이라 한 줄입니다. */}
        <h1 className="text-[clamp(2.4rem,7vw,4.75rem)] font-black leading-[1.05] tracking-tight text-white">
          <span className="block break-keep">{decemberEventLabel(locale)}</span>
          {locale === "ko" && DECEMBER_EVENT_NAME && (
            <span className="gradient-text mt-2 block bg-gradient-to-r from-[#A99AD6] via-[#C79BB4] to-[#EE8A4F] bg-clip-text pb-[0.14em] text-[0.42em] font-bold tracking-[0.12em] text-transparent">
              {DECEMBER_EVENT_NAME.en}
            </span>
          )}
        </h1>
        <p className="mt-6 text-base font-semibold tracking-tight text-[#F2B183] sm:text-lg">
          {formatDecemberDateLine(locale)}
        </p>
        {/* 포지션 한 줄. 12월 챕터의 제목이던 문장입니다. 히어로에서는 이름
            아래 두 번째로 큰 글자입니다. */}
        <p className="mx-auto mt-6 max-w-2xl break-keep text-lg font-semibold leading-snug text-white sm:text-xl">
          {t(naru.december.heading)}
        </p>
        <p className="mx-auto mt-4 max-w-xl break-keep text-sm leading-relaxed text-white/75 sm:text-base">
          {t(naru.eventHero.sub)}
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <OpenChatLink t={t} src="naru-hero" label={openChatLabels.december} variant="hero" />
          <a
            href="#december"
            onClick={() => track("naru_cta", { src: "hero", to: "december" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 hover:text-white sm:px-8 sm:text-base"
          >
            {t(naru.eventHero.ctaProgram)}
            <span aria-hidden className="text-white/50">↓</span>
          </a>
        </div>
      </Chapter>

      {/* ── CH1 · 8월의 기록 ─────────────────────────────────────────────── */}
      {/* 기본 이음매(216px)입니다. 여기 있던 pt-8 sm:pt-10 lg:pt-12는 "#why에
          붙인다"는 주석을 달고 있었는데, 그 챕터는 9/16에 맨 아래로 내려갔습니다.
          지금 이 챕터 앞에 있는 것은 히어로이고, 히어로는 자기 화면 하나를
          온전히 쓰는 것이 맞습니다. 근거로 삼을 앞 챕터가 없으니 붙일 이유도
          없어요(리듬 스케일은 파일 위 주석). */}
      <Chapter id="record" align="center">
        <Eyebrow color="plum">{t(naru.record.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.record.heading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.record.lead)}
        </p>
        {/* 숫자 다섯. 마지막 하나만 설명 줄을 답니다. "9팀이 출제사에 직접
            자료를 요청했다"는 숫자만으로는 무슨 뜻인지 알 수 없고, 그 뜻이
            이 회차에서 가장 중요한 신호입니다. 시키지 않았는데 했어요. */}
        <StatRow stats={naru.record.stats} t={t} className="mt-12 lg:grid-cols-5" />

        {/* 사진 열 장. 이 챕터의 본문입니다.
            2026-09-16: 여기 있던 lead2 한 줄, RecordTabs(형식·멘토·연사 탭),
            "8월에 아쉬웠던 네 가지" 카드 넷이 내려갔습니다. 셋 다 맞는
            내용이었지만 셋 다 8월을 설명하는 글이었고, 설명은 아래 버튼 하나로
            /2026-08에 갑니다. 아쉬웠던 넷은 12월 챕터의 "모양"이 대신 말합니다.
            gaps·tabs 키는 data/naru.ts에 그대로 있습니다. */}
        <PhotoWall photos={naru.record.photos} t={t} />

        {/* 이 챕터의 유일한 행동입니다. 2026-09-16에 유령 버튼에서 실린 버튼으로
            올렸습니다 - 8월의 설명이 전부 저쪽으로 갔으니, 더 알고 싶은 사람에게
            이 버튼은 선택지가 아니라 다음 문장입니다. 주황은 히어로의 주 CTA가
            이미 쓰고 있어서 흰 면을 씁니다(색 규칙은 히어로 주석 참고). */}
        <div className="mt-12 flex justify-center">
          <Link
            href={naruLinks.archive}
            onClick={() => track("naru_cta", { src: "record", to: "archive" })}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-naru-navy transition hover:-translate-y-0.5 hover:bg-white/90 sm:px-8 sm:text-base"
          >
            {t(naru.record.cta)}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Chapter>

      {/* ── CH2 · 프로그램 (DECIDED 2026-09-17 2차) ────────────────────────
          12월 상세. 8월 사이트의 격식(프로그램 · 멘토링 · 달라지는 것)을
          따릅니다. 출처는 빌더톤_2회차_기획.pdf. 카피 위치와 출처 매핑은
          data/naru.ts의 december 블록 주석에 있습니다.

          순서: 모양(숫자 여섯) → 왜 서울인가 → 아쉬웠던 넷과 답 → 일정 →
          멘토링(+ 약속이 지켜지는 지점, 재는 것) → 미정 → 문. 8월 사이트가
          소개 → 프로그램 → 멘토링 → FAQ 순이었던 것과 같은 호흡입니다.

          ⚠️ draftNote를 떼지 마세요. 확정된 것은 이름, 기간, 도시뿐입니다.
          기본 이음매(216px). 장이 바뀌는 자리는 이제 #naru입니다. */}
      <Chapter id="december" align="center">
        <Eyebrow color="orange">
          {`${t(naru.december.eyebrowPrefix)}\u2002${decemberEventLabel(locale)}`}
        </Eyebrow>
        <h2 className={H2}>{t(naru.december.programHeading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.december.shapeLead)}
        </p>
        {/* 8월을 아는 사람이 한 번은 묻는 것. 리드 바로 아래 작은 줄입니다.
            "변하지 않는 두 개"가 #naru 안의 #why로 갑니다. */}
        <p className="mx-auto mt-4 max-w-2xl break-keep text-sm leading-relaxed text-white/55">
          <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="#why" />
        </p>

        <StatRow stats={naru.december.shape} t={t} className="mt-12 lg:grid-cols-6" />
        <p className="mt-4 text-xs text-white/55">{t(naru.december.draftNote)}</p>

        {/* 왜 서울인가. 기획 03의 셋. */}
        <div className="mx-auto mt-12 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.reasonsLabel)}</h3>
          <ol role="list" className="mt-5 grid gap-4 md:grid-cols-3">
            {naru.december.reasons.map((r) => (
              <li key={r.title.en} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                <h4 className="break-keep text-base font-bold leading-snug text-white">{t(r.title)}</h4>
                <p className="mt-3 break-keep text-sm leading-relaxed text-white/70">{t(r.body)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* 8월에 아쉬웠던 넷과 12월의 답. record.gaps를 읽습니다(8월의 관찰이라
            정본이 거기 있습니다). 9/16에 내려갔던 카드가 답이 붙어 돌아왔습니다. */}
        <div className="mx-auto mt-12 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.gapsHeading)}</h3>
          <p className="mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.gapsLead)}
          </p>
          <ol role="list" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {naru.record.gaps.map((gap) => (
              <li key={gap.title.en} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                <h4 className="break-keep text-base font-bold leading-snug text-white">{t(gap.title)}</h4>
                <dl className="mt-4 flex flex-1 flex-col gap-3">
                  <div>
                    <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/50">
                      {t(naru.december.augustLabel)}
                    </dt>
                    <dd className="mt-1 break-keep text-sm leading-relaxed text-white/65">{t(gap.body)}</dd>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#F2B183]">
                      {t(naru.december.decemberLabel)}
                    </dt>
                    <dd className="mt-1 break-keep text-sm leading-relaxed text-white/80">
                      {gap.answer ? t(gap.answer) : t(naru.record.answerPending)}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </div>

        {/* 일정. 스테이지 다섯, 날짜는 naruDates에서 셉니다. 제출 지점 둘과
            워크샵 셋이 칸 안에 붙습니다(기획 04). */}
        <div className="mx-auto mt-12 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.scheduleLabel)}</h3>
          <p className="mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.scheduleLead)}
          </p>
          <ol role="list" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {naru.december.stages.map((stage) => (
              <li
                key={stage.name.en}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
              >
                <p className="text-xs font-semibold text-[#F2B183]">
                  {stage.dayOffset === null ? t(stage.when) : formatDecemberDay(locale, stage.dayOffset)}
                </p>
                <p className="mt-1 text-base font-bold text-white">{t(stage.name)}</p>
                <p className="mt-3 flex-1 break-keep text-sm leading-relaxed text-white/65">{t(stage.body)}</p>
                {stage.workshop && (
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">
                      {t(naru.december.workshopLabel)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/85">{t(stage.workshop.title)}</p>
                    <p className="mt-0.5 break-keep text-xs leading-snug text-white/55">{t(stage.workshop.body)}</p>
                  </div>
                )}
                {stage.submit && (
                  <p className="mt-3 inline-flex w-fit rounded-full border border-[#F2B183]/35 bg-naru-orange/10 px-2.5 py-1 text-[0.68rem] font-semibold text-[#F2B183]">
                    {`${t(naru.december.submitLabel)}\u2002${t(stage.submit)}`}
                  </p>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 break-keep text-xs text-white/55">{t(naru.december.workshopNote)}</p>
        </div>

        {/* 멘토링. 규칙 넷(기획 04 General Mentoring), 그리고 코어가 지켜지는
            지점(기획 02 EXECUTION). 후자는 why.exec/measure를 그대로 읽습니다.
            그 문장들은 이벤트의 실행에 관한 것이라 그룹이 아니라 여기입니다. */}
        <div className="mx-auto mt-12 max-w-5xl text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.mentoringLabel)}</h3>
          <p className="mt-3 break-keep text-lg font-bold leading-snug text-white sm:text-xl">
            {t(naru.december.mentoringHeading)}
          </p>
          <p className="mt-3 max-w-2xl break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.mentoringLead)}
          </p>
          <ul role="list" className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {naru.december.mentoringRules.map((rule, i) => (
              <li key={i} className="flex gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 break-keep text-sm leading-relaxed text-white/80">
                <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-[#F2B183]" />
                {t(rule)}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto mt-12 max-w-5xl border-t border-white/10 pt-12">
          <h3 className={LABEL_HEADING}>{t(naru.why.execLabel)}</h3>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-base leading-relaxed text-white/70">
            {t(naru.why.execLead)}
          </p>
          {/* 둘뿐이고 나란히 있어서 번호는 세어 주지 않습니다. 순서는 ol이
              나릅니다. item.index 키는 data/naru.ts에 그대로 있습니다. */}
          <ol role="list" className="mt-12 grid gap-10 text-left md:grid-cols-2 md:gap-14">
            {naru.why.exec.map((item) => (
              <li key={item.index} className="border-t border-white/10 pt-6">
                <h4 className="break-keep text-lg font-bold leading-snug text-white sm:text-xl">
                  {t(item.title)}
                </h4>
                <p className="mt-4 break-keep text-base leading-relaxed text-white/70">{t(item.body)}</p>
              </li>
            ))}
          </ol>
          {/* 재는 것. 이 챕터에서 가장 검증 가능한 문장이고, 기업이 우리를 읽을
              때 실제로 붙잡는 줄입니다. 라벨 : 문장이라 dl. 문장은 경첩과 같은
              H3, 같은 축. 숫자를 지어내지 마세요. 8월의 실측은 #record에 있고
              여기서는 무엇을 보는지만 말합니다. */}
          <dl className="mt-12 border-t border-white/10 pt-12">
            <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent">
              {t(naru.why.measureLabel)}
            </dt>
            <dd className="mx-auto mt-4 max-w-3xl break-keep text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
              {t(naru.why.measure)}
            </dd>
          </dl>
        </div>


        {/* 아직 정해지지 않은 것. 이 챕터에서 가장 정직하고 가장 값이 큰
            블록입니다. 자세한 이유는 data/naru.ts의 tbdLabel 주석에 있습니다. */}
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-left">
          <h3 className={LABEL_HEADING}>{t(naru.december.tbdLabel)}</h3>
          <ul role="list" className="mt-4 flex flex-wrap gap-2">
            {naru.december.tbd.map((item) => (
              <li
                key={item.en}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70"
              >
                {t(item)}
              </li>
            ))}
          </ul>
          <p className="mt-4 break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.tbdNote)}
          </p>
        </div>

        {/* 이 챕터의 문. 참가자는 오픈채팅(흰 면), 출제사와 후원은 메일(텍스트).
            히어로에서 이미 주황으로 한 번 열었으니 여기는 흰 면입니다. */}
        <p className="mx-auto mt-12 max-w-2xl break-keep text-sm text-white/55">{t(naru.december.ctaNote)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} variant="primary" />
          <a
            href={naruLinks.sponsor}
            onClick={() => track("naru_mail", { src: "december" })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 underline-offset-4 transition hover:text-white hover:underline"
          >
            {t(naru.december.ctaMail)}
            <span aria-hidden>→</span>
          </a>
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
          <Eyebrow color="purple">{t(naru.hero.eyebrow)}</Eyebrow>
        </div>
        {/* 태그라인. 두 줄 고정(히어로에 있던 때의 이유 그대로: 두 개의 선언). */}
        <h2 className={H2}>
          <span className="block break-keep">{t(naru.hero.titleLine1)}</span>
          <span className="gradient-text block break-keep bg-gradient-to-r from-[#A99AD6] via-[#C79BB4] to-[#EE8A4F] bg-clip-text pb-[0.14em] text-transparent">
            {t(naru.hero.titleLine2)}
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.group.lead)}
        </p>
        {/* 서명 헤어라인. 이 페이지에서 한 번. */}
        <div
          aria-hidden
          className="mx-auto mt-12 h-[2px] w-full max-w-[52rem] bg-gradient-to-r from-accent to-accent-strong"
        />
        <div id="why" className="mt-12">
          <Eyebrow color="purple">{t(naru.why.eyebrow)}</Eyebrow>
          {/* H2 토큰의 clamp와 같이 쓰면 CSS 순서상 어느 쪽이 이길지 정해져
              있지 않아서(둘 다 임의값 클래스), 크기는 따로 씁니다. 태그라인이
              이미 H2라 이 제목은 한 단 아래입니다. */}
          <h3 className="mx-auto max-w-[52rem] break-keep text-[clamp(1.5rem,3.2vw,2.25rem)] font-bold tracking-tight text-white">
            {t(naru.why.heading)}
          </h3>
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
        <ol role="list" className="mx-auto mt-12 max-w-5xl text-left">
          {naru.why.cores.map((core, i) => (
            <li
              key={core.index}
              className={`grid gap-8 py-8 sm:py-10 md:grid-cols-[1.4fr_1fr] md:gap-14 lg:py-12 ${
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
      <Chapter id="how" align="center">
        <Eyebrow color="purple">{t(naru.how.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.how.heading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.how.lead)}
        </p>

        <LayerDiagram t={t} />

        {/* Overview 02의 표. 모바일에서는 카드 석 장으로 떨어집니다. 세 열
            짜리 표를 390px에 밀어 넣으면 글자가 세로로 서고, 그러면 읽는
            사람이 표를 가로로 긁어야 합니다. */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 text-left lg:grid-cols-3">
          {naru.how.layers.map((layer) => (
            <Card key={layer.role.en}>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent">
                {t(layer.role)}
              </p>
              <p className="mt-2 break-keep text-lg font-bold text-white">{t(layer.who)}</p>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55">
                    {t(naru.how.doesLabel)}
                  </dt>
                  <dd className="mt-1.5 break-keep text-sm leading-relaxed text-white/75">{t(layer.does)}</dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55">
                    {t(naru.how.getsLabel)}
                  </dt>
                  <dd className="mt-1.5 break-keep text-sm leading-relaxed text-white/75">{t(layer.gets)}</dd>
                </div>
              </dl>
              {/* 이 층의 문. #join의 해당 카드로 가는 앵커입니다(2026-09-17).
                  새 목적지가 아니라 이정표라 텍스트 링크로 둡니다. */}
              <a
                href={`#${layer.join.id}`}
                onClick={() => track("naru_cta", { src: "how", to: layer.join.id })}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-white"
              >
                {t(layer.join.label)}
                <span aria-hidden>→</span>
              </a>
            </Card>
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
                <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-white/35" />
                {t(line)}
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      {/* ── CH5 · 함께하는 길 ────────────────────────────────────────────── */}
      <Chapter id="join" align="center">
        <Eyebrow color="purple">{t(naru.join.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.join.heading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.join.lead)}
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 text-left md:grid-cols-2">
          {naru.join.cards.map((card) => (
            <Card key={card.id} id={card.id} className="flex flex-col">
              <h3 className="break-keep text-lg font-bold text-white">{t(card.who)}</h3>
              {/* 첫 줄만 그립니다(2026-09-16). 둘째 줄은 전부 첫 줄의 조건과
                  다음 단계였고, 그건 메일을 보낸 뒤에 나눌 이야기입니다.
                  lines[1]은 data/naru.ts에 그대로 있습니다. */}
              <p className="mt-4 flex-1 break-keep text-sm leading-relaxed text-white/70">
                {t(card.lines[0])}
              </p>
              <div className="mt-6">
                {card.openChat ? (
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
        <div className="mx-auto mt-6 max-w-5xl rounded-3xl border border-accent/25 bg-accent/[0.06] px-6 py-7 text-left sm:px-8">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent">
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
              className="text-white/65 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.contact)}
            </a>
            <Link
              href={naruLinks.archive}
              className="text-white/65 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.archive)}
            </Link>
          </div>
          <p className="text-xs text-white/55">{t(naru.footer.rights)}</p>
          {/* 배경 움직임 끄기. WCAG 2.2.2. 자리가 푸터인 이유는 컴포넌트 주석에
              있습니다. */}
          <MotionToggle className="mt-2" />
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
    <dl className={`mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.label.en}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-5 text-center"
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
// 사진 벽.
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
      <p
        className={`text-[0.62rem] font-bold uppercase tracking-[0.16em] ${
          center ? "text-white/70" : "text-white/55"
        }`}
      >
        {t(layer.role)}
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
