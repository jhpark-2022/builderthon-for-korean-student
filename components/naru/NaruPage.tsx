"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 나루 페이지 (/naru).
//
// DECIDED 2026-10-10 (사용자: "나루와 크로싱 서울이 한 페이지에 있어 혼동된다. 나루 내용은 전부 다른 탭으로",
// 구조 브리프): 홈(/)은 크로싱 서울(이벤트)만 말하고, 그룹 나루의 글은 전부 이 페이지로 옮겼습니다.
// 아래 챕터들은 components/home/NaruHome.tsx의 #naru, #join, (조건부) #people을 그대로 옮긴 것입니다.
// 글, 글자 크기, 정렬, 판, 폰 접힘은 손대지 않았습니다. 바뀐 것은 id 셋과 맨 끝의 돌아가는 줄 하나입니다.
//
//   #top   (전 #naru)  인장, 태그라인, 소개, #record 8월 요약, 아카이브 링크
//   #core  (전 #why)   변하지 않는 두 개, 경첩, 방법은 바뀝니다
//   #how               어떻게 일하는가
//   #why   (전 #join)  왜 이 자리가 필요한가, 세 곳, 맺음, #join-ways 매니페스토
//
// 옛 주소 /#join, /#how, /#why, /#record, /#join-ways는 홈의 작은 훅이 이 페이지의 같은 자리로 보냅니다
// (components/home/NaruHome.tsx의 useLegacyHash). /#why는 이제 #core이고 /#join은 #why입니다.
// 두 페이지가 같이 쓰는 조각은 components/home/shared.tsx에 있습니다.
// ─────────────────────────────────────────────────────────────────────────────
import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, partnerContact, type Layer, type Stat, type RecordPhoto } from "@/data/naru";
import type { Phrase } from "@/data/dictionaryCore";
import Halo from "@/components/ui/Halo";
import Chip from "@/components/ui/Chip";
import { buttonClass } from "@/components/ui/Button";
import MobileChatBar from "@/components/shared/MobileChatBar";
import Chapter from "@/components/journey/Chapter";
import Reveal from "@/components/shared/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
import { TITLE, BODY, META, H2, H3, STATEMENT, GRADIENT_TEXT } from "@/components/ui/typography";
import NaruMark from "@/components/ui/NaruMark";
import {
  PhoneFold, Card, SUBHEADING, READ, READ_MEASURE_C, MEASURE_C,
  latinTrack, eyebrowTrack, PlateSegment, SiteFooter, usePlateLite,
} from "@/components/home/shared";

// TODO: confirm (왜 브리프 9장). #join의 규모 숫자입니다. 쓰려면 "싱가포르의 한인
// 유학생 수"와 "이들을 가로질러 이어 온 학생 단체 수"의 출처가 있어야 합니다.
// 출처가 확인되면 값을 채우고 true로. false인 동안 statTbd도 그리지 않습니다.
// 공개 숫자는 근거를 댈 수 있어야 합니다. 매니페스토에 있다는 것은 근거가 아닙니다.
const JOIN_STAT_CONFIRMED: boolean = false;

export default function NaruPage() {
  const { t, locale } = useLocale();
  usePlateLite();
  return (
    <>
    {/* tabIndex=-1: skip link가 여기로 보낼 때 브라우저가 실제로 포커스를 옮기도록 합니다. */}
    {/* naru-min12: 홈과 같은 글자 하한(app/globals.css). */}
    <main id="main" tabIndex={-1} className="naru-min12 focus:outline-none">
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
      <Chapter id="top" labelledBy="naru-title" align="center" className="pt-20 sm:pt-28 lg:pt-36">
        <PlateSegment id="naru" read>
        {/* DECIDED 2026-09-27 (사용자): 영문 화면에서는 한글 "나루"가 보이지 않습니다.
            헤더·푸터 락업과 같은 규칙(2026-09-21). 영문 마스터는 원본 03 반전에서
            "나루"와 "N A R U" 두 줄을 아웃라인한 NARU 한 줄로 바꾼 것입니다
            (public/naru/README.md). */}
        <div className={READ}>
        <Image
          // 2026-09-29: v2 파일명. 같은 이름으로 덮으면 1년짜리 immutable 캐시에 옛 링이 남습니다(public/naru/README.md).
          // 2026-09-30: v3(링 COLLECTIVE, 아랫줄 of 뺌).
          src={locale === "en" ? "/naru/naru-master-en-v3-rev.svg" : "/naru/naru-master-v3-rev.png"}
          alt={t(naru.hero.logoAlt)}
          width={900}
          height={900}
          unoptimized={locale === "en"}
          // 보조 마크(감사 반영 브리프 6.3): 폰 160px, 데스크톱 220px. 형태는 로고 가이드가 정본이라
          // 그대로입니다.
          // DECIDED 2026-09-29 (사용자: "로고들은 무조건 화면의 center에 있어야함"): 로고는 글이 아니라 그림이라
          // 왼쪽 끝 규칙의 예외이고, 가운데를 쓰는 넷째 자리입니다(숫자 줄, 노선도, 푸터 다음). READ가 화면 가운데
          // 축이라 mx-auto가 곧 화면 가운데입니다. data-center-zone은 왼쪽 끝 검증이 이 자리를 건너뛰게 하는 표시.
          data-center-zone="logo"
          className="mx-auto block h-auto w-[160px] sm:w-[220px]"
        />
        </div>
        {/* DECIDED 2026-09-30 (사용자): 인장 아래의 알약과 태그라인은 가운데. 인장이 가운데라 셋이 한 축입니다.
            그 아래 이름 풀이부터는 왼쪽 끝. */}
        <div className={`${READ} mt-6 text-center`}>
          <Eyebrow color="purple" className={eyebrowTrack(locale)}>{t(naru.hero.eyebrow)}</Eyebrow>
        </div>
        {/* 태그라인. 두 줄 고정(히어로에 있던 때의 이유 그대로: 두 개의 선언). */}
        <h2 id="naru-title" className={`${H2} ${READ} text-balance text-center`}>
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
            본문보다 한 단 작습니다. 주석이지 주장이 아닙니다.
            DECIDED 2026-10-02 (사용자: 가독성 리뷰): 밝기는 /55 → /70. 작고 흐리고 줄까지 길어 읽히지 않았습니다. */}
        {/* DECIDED 2026-10-05 (사용자, 스크린숏: "그냥 하나로 합치라니까"): 이름 풀이부터 아카이브 버튼까지가
            한 덩어리입니다. 문단이 모두 가운데이고 같은 폭(READ_MEASURE_C)에 같은 간격(mt-6)으로 섭니다.
            "그 아래 이름 풀이부터는 왼쪽 끝"(2026-09-30)은 이 결정이 대신합니다. */}
        <p className={`${READ} ${READ_MEASURE_C} mt-5 break-keep text-center ${BODY} leading-relaxed text-white/70`}>
          {t(naru.group.name)}
        </p>
        {/* 태그라인 옆의 구체적인 한 줄(가독성 브리프 5, 2026-09-25 사용자 승인). 이름 풀이 다음,
            리드 앞입니다. 머리 문단은 이름 풀이 하나라 이 줄은 본문 축에 섭니다. 리드의 첫
            문장과 뜻이 겹치는 것은 알고 둔 것입니다(사용자: 표의 제안대로). */}
        <p className={`${READ} ${READ_MEASURE_C} mt-8 break-keep text-center ${BODY} leading-relaxed text-white/85`}>
          {t(naru.group.concrete)}
        </p>
        {/* DECIDED 2026-10-05 3차 (사용자, 스크린숏: "너무 길어. 간략하게"): 리드(group.lead)는 그리지 않습니다.
            "방식은 바뀝니다"는 아래 "방법은 바뀝니다"가 다시 말합니다. 키는 data/naru.ts에 그대로.
            남은 네 문단의 글도 같은 날 줄였습니다. */}
        {/* DECIDED 2026-10-05 (사용자, 스크린숏: "한 파트로 그냥 합쳐줘. 중간에 선 두고 나누지 말고"): 여기 있던
            서명 헤어라인(2px 그라디언트)을 뺐습니다.
            같은 날 2차 (사용자: "그냥 하나로 합치라니까"): 선만 빼서는 여전히 두 파트였습니다. 알약
            (record.eyebrow)과 h3 "8월이 남긴 것"(record.heading)도 화면에서 내리고, 두 문장과 버튼을 위
            문단들 바로 아래에 같은 간격으로 잇습니다. 두 키는 data/naru.ts에 그대로 있고 그리지 않습니다.
            id="record"는 남깁니다(옛 링크, 배경 국면, 하단 바). */}
        {/* 라벨만. "우리는 두 가지를 만들려고 모였습니다" 제목은 내려갔습니다
            (2026-09-17 3차). 태그라인이 바로 위에 H2로 있고, lead가 "바뀌지 않는
            것은 아래 두 개"라고 이미 말합니다. 같은 챕터에 큰 제목 둘은 길이만
            늘립니다. why.heading 키는 그대로. */}
        {/* ── 8월이 남긴 것 (2026-09-19, 사용자: 8월과 나루를 합침). 코어 둘 바로 앞입니다. lead2가
            "이 이벤트에서 코어 2개가 나왔습니다"로 끝나서 다음 블록(변하지 않는 두 개)으로 이어집니다.
            id="record"는 옛 링크·배경 국면·하단 바(afterId)가 봅니다. 그 전의 챕터 판 주석은 git 이력에. */}
        {/* DECIDED 2026-09-29 (사용자: "그냥 최소화하자"): 두 문장만. lead2가 두 장면(스크리닝 없이 받아 풀고,
            앞에서 증명한 것)을 바로 아래 코어 둘과 같은 순서로 짝지우고, credit이 빚을 적습니다. 감사 명단
            (thanks·thanksClose)과 lead는 화면에서 내렸습니다. data에는 남겨 둡니다(/2026-08 마지막 화면의
            같은 문단과 짝을 볼 자리). 명단은 아래 아카이브 버튼 너머에 있습니다. */}
        {/* DECIDED 2026-09-30 (사용자, 스크린숏: "이것들도 center로"): 이 블록 전체(알약, h3, 두 문장, 버튼)는
            가운데입니다. 글이 가운데면 버튼도 가운데(2026-09-29). */}
        <Reveal id="record" className={`${READ} mt-8 text-center`}>
          {/* DECIDED 2026-10-02 (사용자: "폰에서도 가운데 정렬로 되돌려줘"): 두 문장은 폰에서도 가운데(위 12월 머리와 같은 결정). */}
          <p className={`${MEASURE_C} break-keep text-center ${BODY} leading-relaxed text-white/70`}>
            {t(naru.record.lead2)}
          </p>
          {/* 빚을 적는 한 줄(2026-09-19). 감사는 각주가 아니라 문장이어야 합니다. */}
          <p className={`${MEASURE_C} mt-3 break-keep text-center ${BODY} font-semibold leading-relaxed text-white/85`}>
            {t(naru.record.credit)}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={naruLinks.archive}
              onClick={() => track("naru_cta", { src: "record", to: "archive" })}
              className={buttonClass("secondary")}
            >
              {t(naru.record.cta)}
              <span aria-hidden className="text-white/70">→</span>
            </Link>
          </div>
        </Reveal>

        </PlateSegment>
        <PlateSegment id="naru-2" gap read>
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
        {/* DECIDED 2026-10-05 (사용자, 스크린숏: "이거 center에"): 알약과 h3는 가운데. 아래 코어 두 장(글과 지킴
            칸의 두 단)은 왼쪽 끝 그대로입니다. */}
        <div id="core" className={`${READ} mt-8 border-t border-white/10 pt-8 text-balance text-center lg:mt-12 lg:pt-12`}>
          <Eyebrow color="purple" className={eyebrowTrack(locale)}>{t(naru.why.eyebrow)}</Eyebrow>
          <h3 className={H3}>{t(naru.why.heading)}</h3>
        </div>
        {/* 코어 둘. 판 두 장.
            ol인 이유: 순서가 뜻입니다. 01이 문턱이고 02가 증명이며, 바로 아래
            note가 그 둘이 한 쌍이라고 말합니다. 번호는 그리지 않습니다(9/16
            2차의 이유 그대로). 나루 점이 제목 첫 글자 앞에 섭니다.
            점의 크기는 18px 고정입니다(2026-10-07). 제목이 BODY 크기(15.75~18px)가 되어 em으로 두면
            로고 가이드의 하한 18px 아래로 내려갑니다. mt는 첫 줄의 한가운데.
            keeps가 dl인 이유: 항목 이름과 값이지 제목이 아닙니다. */}
        <Reveal>
        <ol role="list" className={`${READ} text-left max-sm:text-center`}>
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
                <h3 className={`flex items-start gap-3 max-sm:justify-center ${BODY} font-bold leading-snug tracking-tight text-white`}>
                  <NaruMark className="mt-[2px] h-4 w-4 shrink-0 sm:mt-[3px]" />
                  <span>{t(core.title)}</span>
                </h3>
                <p className={`mt-4 max-w-xl break-keep max-sm:mx-auto ${BODY} leading-relaxed text-white/85`}>
                  {t(core.lines[0])}
                </p>
                {/* 폰에서는 코어가 제목 + 한 문장(감사 반영 브리프 6, 나루 챕터 4.4화면). 둘째 줄은
                    lg부터. 키는 그대로. */}
                <p className={`mt-2 hidden max-w-xl break-keep ${BODY} leading-relaxed text-white/70 lg:block`}>
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
        {/* DECIDED 2026-10-05 (사용자, 스크린숏: "이것도"): 경첩 세 문단과 아래 "방법은 바뀝니다"는 가운데. */}
        <Reveal className={`${READ} border-t border-white/10 pt-8 text-balance text-center lg:pt-12`}>
          <p className={`text-balance break-keep text-center ${BODY} font-bold leading-snug tracking-tight text-white`}>
            {t(naru.why.note)}
          </p>
          {/* 경첩 옆의 구체적인 한 줄(가독성 브리프 5, 2026-09-25 사용자 승인). 폰에서도 보입니다. */}
          <p className={`${MEASURE_C} mt-3 break-keep text-center ${BODY} leading-relaxed text-white/70`}>{t(naru.why.noteConcrete)}</p>
          {/* 폰에서는 경첩의 부연을 접습니다(나루 챕터 길이 목표 2,200). 굵은 한 문장만. */}
          <p className={`${MEASURE_C} mt-3 hidden break-keep text-center ${BODY} leading-relaxed text-white/70 lg:block`}>
            {t(naru.why.noteBody)}
          </p>
          {/* DECIDED 2026-10-05 (사용자: "설명을 더"): 부연이 두 문단입니다. 둘 다 폰에서는 접습니다(위와 같은 이유). */}
          <p className={`${MEASURE_C} mt-3 hidden break-keep text-center ${BODY} leading-relaxed text-white/70 lg:block`}>
            {t(naru.why.noteClose)}
          </p>
        </Reveal>

        {/* 마지막 줄. 페이지 전체가 여기서 끝납니다. 위의 두 개를 빼면 전부
            방법이고, 방법은 바뀝니다(매니페스토 IV). 이 문장이 8일이 4일이 되는
            12월을 미리 설명합니다. */}
        <Reveal className={`${READ} mt-8 text-balance text-center lg:mt-12`}>
          <h3 data-subheading className={SUBHEADING}>{t(naru.why.agendaLabel)}</h3>
          <p className={`${MEASURE_C} mt-3 break-keep text-center ${BODY} leading-relaxed text-white/70`}>{t(naru.why.agenda)}</p>
          <p className={`${MEASURE_C} mt-3 break-keep text-center ${BODY} leading-relaxed text-white/70`}>{t(naru.why.agendaMore)}</p>
        </Reveal>
              {/* ── 어떻게 일하는가 (DECIDED 2026-09-18, 사용자: "나루와 학생회와 기업 내용은 하나의
            챕터로 합쳐져야 함"). 따로 있던 #how 챕터(세 층, 문 셋, 하지 않는 것)가 이 챕터의
            마지막 블록이 됐습니다. 헤어라인 하나로 나뉘고 제목은 H3. 안쪽 앵커 id="how"는
            옛 링크와 층별 문(#join-*)의 출발점을 위해 남깁니다. 카피 키(naru.how.*)는 그대로.
            그 전의 주석: #december 뒤로 내려온 이유(2026-09-17)는 git 이력에. */}
        {/* 2026-09-26 (한 축 브리프): 헤어라인과 머리, 리드는 READ. 세 층 도식만 WIDE(LayerDiagram). */}
        <div id="how" className="mt-10 text-left lg:mt-16">
        {/* DECIDED 2026-10-05 (사용자, 스크린숏: "다 중간에"): 소제목, h3, 리드는 가운데. 도식과 버튼 셋이 이미 가운데입니다. */}
        <div className={`${READ} border-t border-white/10 pt-8 text-balance text-center lg:pt-12`}>

          {/* "세 층"은 챕터 라벨이 아니라 챕터 안 소제목입니다(가독성 브리프 4.2의 표). 알약을 벗습니다. */}
          {/* DECIDED 2026-10-06 (사용자, 스크린숏: "세 층 빼주고"): 소제목 "세 층"(how.eyebrow)은 그리지 않습니다.
              제목 하나만 섭니다. 키는 data/naru.ts에 그대로. */}
          <h3 className={H3}>{t(naru.how.heading)}</h3>
        {/* 2026-09-25 (가독성 브리프 5 표의 4행, 사용자 승인): 폰에서도 리드를 보입니다. 새 줄을
            붙이는 대신 "누가 무엇을 내는가"를 이미 말하는 이 문장을 폰에서 접지 않습니다.
            그 전에는 폰에서 접었습니다(다이어그램과 아래 한 줄이 같은 말을 한다는 이유). */}
        {/* DECIDED 2026-10-05 (사용자, 스크린숏: "라는 설명은 생략"): 리드(how.lead)는 그리지 않습니다. 누가 무엇을
            내는지는 바로 아래 세 층 도식이 칸마다 말합니다. 키는 data/naru.ts에 그대로. */}
        </div>

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
        {/* DECIDED 2026-09-23 (첫 방문자 리뷰): 폰에서 세 링크가 배경 형상의 점 위에 글자만 떠 있어
            읽기 어려웠습니다. 페이지의 다른 버튼과 같은 알약으로 감쌉니다(테두리 white/15, ArchiveBanner의
            어두운 반투명 채움, backdrop-blur). 폰은 세로로 쌓고 각 버튼은 내용 폭, sm부터 가로 한 줄.
            알약 자체가 44px이라 위의 -my-2.5 관용구는 필요 없습니다. 형상은 건드리지 않습니다. */}
        {/* DECIDED 2026-10-01 (사용자: "아래에 있는 버튼 3곳이 center로"): 세 버튼은 도식의 가운데에 섭니다.
            그 전에는 READ의 왼쪽 끝이었습니다. 폰의 세로 쌓기도 가운데입니다. */}
        <Reveal className={`${READ} mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center`}>
          {naru.how.layers.map((layer) => (
            <a
              key={layer.join.id}
              // 2026-09-19: `#${layer.join.id}`(#join의 카드)였습니다. 카드 넷이
              // 화면에서 내려가면서 앵커가 갈 곳을 잃었고, 이제 같은 메일로
              // 곧장 갑니다. 이 세 링크가 학생회·기업·운영진의 유일한 문입니다.
              href={layer.join.mail}
              onClick={() => track("naru_mail", { src: `how_${layer.join.id}` })}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-[#0B1430]/80 px-5 py-2.5 ${BODY} font-medium text-accent backdrop-blur-sm transition hover:border-white/30 hover:text-white`}
            >
              {t(layer.join.label)}
              <span aria-hidden>→</span>
            </a>
          ))}
        </Reveal>
        {/* DECIDED 2026-10-08 (사용자 승인, 홈 리뷰 8): 세 문은 mailto뿐이라 메일 앱이 없는 데스크톱에서는 눌러도
            아무 일이 없었습니다. 주소를 고를 수 있는 글자로 보여 주고, 기업에 먼저 부탁하는 것을 한 줄로 적습니다.
            위 세 버튼과 같은 가운데입니다. */}
        <Reveal className={`${READ} mt-4 text-center`}>
          <p className={`${MEASURE_C} break-keep ${META} leading-relaxed text-white/70`}>{t(partnerContact.ask)}</p>
          <p className={`mt-1 ${META} text-white/70`}>
            {t(partnerContact.addressLabel)}
            {"\u2002"}
            <span className="select-all text-white/85">{naruLinks.contact}</span>
          </p>
        </Reveal>

        {/* 하지 않는 것(나루가 하지 않는 것, 세 줄)은 화면에서 내려갔습니다
            (DECIDED 2026-09-19, 사용자). 이 챕터가 대답하는 질문은 "어떻게
            일하는가"이고 그 답은 위의 세 층과 문 셋이 이미 합니다. 레일 맨
            아래에서 마지막으로 남는 인상이 회비·후원 계약·보수일 이유가
            없었습니다. notDoingLabel과 notDoing 키는 data/naru.ts에 그대로
            있습니다. 물어보는 사람에게 답할 문장이지 먼저 꺼낼 문장이 아닙니다. */}
        </div>
        </PlateSegment>
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
      <Chapter id="why" labelledBy="join-title" align="center">
        <PlateSegment id="join" read>
        {/* DECIDED 2026-10-03 (사용자, 스크린숏: "다 centre로"): 이 챕터의 머리(h2, 리드)도 가운데입니다.
            머리가 왼쪽인 챕터는 이제 없습니다. 세 칸부터는 왼쪽 끝 그대로.
            DECIDED 2026-10-05 (사용자, 스크린숏: "다 중간에"): 세 칸 아래의 문단(공통 조건, 안전장치 두 줄, 닫는
            문장과 그 아래)도 가운데입니다. 왼쪽 끝으로 남는 것은 세 칸의 카드 안뿐입니다.
            같은 날 (사용자: "알약은 빼줘"): 알약을 제목과 같은 말로 바꿨더니 위아래로 겹쳐서 그리지 않습니다.
            join.eyebrow 키는 data/naru.ts에 그대로 있습니다. */}
        <h2 id="join-title" className={`${H2} ${READ} text-balance text-center`}><Halo tone="violet">{t(naru.join.heading)}</Halo></h2>
        <p className={`${READ} ${READ_MEASURE_C} mt-6 break-keep text-center ${BODY} leading-relaxed text-white/85`}>
          {t(naru.join.lead)}
        </p>

        {/* 세 곳의 결핍. ul role="list"입니다(왜 브리프 7장). 순서에 뜻이 없어요.
            세 곳은 동등합니다. #after의 steps가 ol인 것과 다릅니다. 칸 안은
            place → lack(없는 것) → opens(그래서 여는 것) 순서이고, 결핍이 먼저
            오고 처방이 나중입니다. */}
        <Reveal>
        <ul role="list" className={`${READ} mt-12 grid grid-cols-1 gap-4 text-left max-sm:text-center lg:grid-cols-3`}>
          {naru.join.needs.map((need) => (
            // DECIDED 2026-09-30 (사용자: 상자 셋의 글이 많고, 점 항목은 같은 선에): 글은 data/naru.ts에서 줄였고,
            // 세 칸이 나란히 서는 lg에서는 카드 안이 부모 격자의 서브그리드(제목, 없는 것, 여는 것 세 줄)입니다.
            // 줄 높이가 세 칸에서 같아져 점 항목의 윗선이 한 선에 섭니다. 카드 바닥에 붙이면(mt-auto) 두 줄짜리
            // 항목의 점이 위로 올라가 어긋났습니다. 줄 사이 간격은 부모의 gap이 아니라 문단의 여백(mt-2, pt-4)입니다.
            <li
              key={need.place.en}
              className="border-b border-white/10 py-4 last:border-b-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-5 lg:grid lg:grid-rows-subgrid lg:row-span-3 lg:gap-y-0"
            >
              <h3 className={H3}>{t(need.place)}</h3>
              <p className={`mt-2 break-keep ${BODY} leading-relaxed text-white/70`}>{t(need.lack)}</p>
              <p className={`flex gap-2 self-start break-keep pt-4 max-sm:justify-center ${BODY} leading-relaxed text-white/85`}>
                <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80 max-sm:hidden" />
                {t(need.opens)}
              </p>
            </li>
          ))}
        </ul>
        </Reveal>

        {/* 세 곳에 공통된 조건 하나(매니페스토 I장). 장소를 가리지 않습니다.
            같은 I장의 다른 나라 학생과의 비교는 가져오지 않았습니다. */}
        <PhoneFold more={t({ ko: "왜 필요한지 더 읽기", en: "More on why" })} less={t({ ko: "왜 필요한지 접기", en: "Hide the rest" })}>
        <Reveal>
        <p className={`${READ} ${READ_MEASURE_C} mt-10 break-keep text-center ${BODY} leading-relaxed text-white/70`}>
          {t(naru.join.milestones)}
        </p>
        </Reveal>

        {/* 안전장치 두 줄(왜 브리프 2.1). 카드가 아니라 문단입니다. 둘 다 있어야
            합니다. 첫 줄이 없으면 폐쇄적인 모임으로, 둘째 줄이 없으면 억울함의
            호소로 읽힙니다. 한 줄만 그리지 마세요.
            DECIDED 2026-10-02 (사용자: 가독성 리뷰): 밝기 /55 → /70. 이 두 줄은 각주가 아니라 주장입니다. */}
        <Reveal className={`${READ} ${READ_MEASURE_C} mt-8 space-y-3 break-keep text-center ${BODY} leading-relaxed text-white/70`}>
          {naru.join.guards.map((guard, i) => (
            <p key={i} className="text-balance">{t(guard)}</p>
          ))}
        </Reveal>

        {/* 규모 숫자는 출처가 확인되기 전까지 그리지 않습니다. statTbd 키는
            data/naru.ts에 있습니다. */}
        {JOIN_STAT_CONFIRMED && (
          <p className={`${READ} ${READ_MEASURE_C} mt-6 break-keep text-center ${BODY} leading-relaxed text-white/70`}>
            {t(naru.join.statTbd)}
          </p>
        )}

        {/* 챕터를 닫는 자리(DECIDED 2026-09-19, 사용자: "그 공간을 왜 이 자리가
            필요한가에 더 할애"). 매니페스토 표지의 한 줄과 V장입니다. 앞의 세 칸이
            결핍이고, 이 두 문단이 그래서 무엇을 앞당겨 두는지입니다. */}
        <Reveal className={`${READ} mt-12 text-balance text-center`}>
          <p className={`${STATEMENT} text-balance`}>{t(naru.join.closingStatement)}</p>
          {/* 닫는 문장 옆의 구체적인 한 줄(가독성 브리프 5, 2026-09-25 사용자 승인). 이름은 naruDates. */}
          {/* DECIDED 2026-10-10 (중복 브리프 C8): closingConcrete("{name}은 스크리닝 없이, 오는 사람이 참가자입니다")를 그리지 않습니다.
              #december 끝의 등록 안내가 같은 말을 합니다. 키는 data/naru.ts에 그대로. */}
          <div className={`${MEASURE_C} mt-5 space-y-3 break-keep ${BODY} leading-relaxed text-white/70`}>
            {naru.join.closingBody.map((line, i) => (
              <p key={i} className="text-balance">{t(line)}</p>
            ))}
          </div>
        </Reveal>
        </PhoneFold>

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
        <div aria-hidden className={`${READ} mt-12 h-px bg-white/10`} />
        {/* DECIDED 2026-09-30 (사용자): 매니페스토 블록은 가운데. 글이 가운데면 버튼도 가운데(2026-09-29). */}
        <Reveal id="join-ways" className={`${READ} mt-10 text-balance text-center`}>
          {/* "PDF · 1.0MB" (2026-09-19, 모바일 감사 21). 쪽 수와 파일 크기 줄을
              뺀 결정(data/naru.ts)은 그대로 존중합니다. 이건 그 줄을 되살리는 게
              아니라 라벨 옆의 한 조각입니다. 버튼의 ↓는 **형식을 말하지 않고**,
              셀룰러에서 1MB는 데스크톱에서와 다른 값입니다. 그 결정의 이유
              ("무엇을 받는지 모르고 누르게 하지 않습니다")를 셀룰러까지 넓힙니다.
              파일이 바뀌면 이 숫자도 바꾸세요: public/naru/naru-manifesto-v4-2026-10.pdf
              (2026-10-10 v4: 959,215바이트라 0.9MB 그대로) */}
          <p className={`${META} font-bold uppercase ${latinTrack(locale)} text-white/70`}>
            {t(naru.join.manifesto.label)}
            <span className="font-medium normal-case tracking-normal text-white/70">{/* 2026-10-10: 영문 화면은 영문판(191,475바이트)을 받습니다. 크기 표기도 로케일을 따릅니다. */}{locale === "en" ? "\u2002·\u2002PDF 0.2MB" : "\u2002·\u2002PDF 0.9MB"}</span>
          </p>
          <h3 className={`mt-3 break-keep ${BODY} font-bold text-white`}>{t(naru.join.manifesto.title)}</h3>
          <p className={`mt-2 text-balance break-keep ${BODY} leading-relaxed text-white/70`}>{t(naru.join.manifesto.body)}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a
              href={locale === "en" ? naruLinks.manifestoEn : naruLinks.manifesto}
              // 같은 탭에서 열리면 이 페이지가 PDF 뷰어에 덮입니다. 돌아오는 길이
              // 뒤로 가기뿐이면 읽던 자리를 잃습니다.
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={() => track("naru_cta", { src: "join", to: locale === "en" ? "manifesto-en" : "manifesto" })}
              className={buttonClass("secondary")}
            >
              {t(naru.join.manifesto.cta)}
              <span aria-hidden className="text-white/70">↓</span>
            </a>
          </div>
        </Reveal>

        {/* DECIDED 2026-10-10 (구조 브리프 3.3): 페이지의 맨 끝, 매니페스토 상자 아래의 돌아가는 줄. 새 문장은 없습니다.
            앞의 것은 8월 페이지 #gaps에서 홈으로 가는 줄과 같은 라벨이고, 뒤의 것은 홈의 프로그램 챕터 끝에 있는 버튼과
            같은 버튼입니다(같은 곳으로 갑니다). data-naru-return은 글자 보존 검증이 이 줄을 빼고 비교하는 손잡이입니다. */}
        <div data-naru-return className={`${READ} mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4`}>
          <Link href="/#december" onClick={() => track("naru_cta", { src: "naru-page", to: "december" })} className={buttonClass("secondary", "naru")}>
            {t(naru.december.gapsBackLink)}
            <span aria-hidden>→</span>
          </Link>
          <OpenChatLink t={t} src="naru-join" label={openChatLabels.december} variant="secondary" />
        </div>

        </PlateSegment>
      </Chapter>

      {/* ── CH6 · 여기서 나온 사람 (조건부) ──────────────────────────────
          stories가 비어 있으면 챕터 자체를 그리지 않습니다. 제목만 있고 안이
          빈 섹션은 "아직 아무도 없다"로 읽히는데, 8월에 스물한 팀이 발표했으니
          그건 사실이 아닙니다. 사실은 아직 이야기를 받아 두지 못했다는 것이고,
          그건 화면이 아니라 우리가 할 일입니다.
          인용문을 지어내지 마세요(data/naru.ts의 Story 주석). */}
      {naru.people.stories.length > 0 && (
        <Chapter id="people" labelledBy="people-title" align="center">
          <div className={`${READ} text-left`}><Eyebrow color="purple" className={eyebrowTrack(locale)}>{t(naru.people.eyebrow)}</Eyebrow></div>
          <h2 id="people-title" className={`${H2} ${READ} text-left`}>{t(naru.people.heading)}</h2>
          <p className={`${READ} mt-6 break-keep text-left ${BODY} leading-relaxed text-white/70`}>
            {t(naru.people.lead)}
          </p>
          <div className="mt-12 grid gap-4 text-left md:grid-cols-2">
            {naru.people.stories.map((story) => (
              <Card key={story.name.en}>
                <blockquote className={`break-keep ${BODY} leading-relaxed text-white/85`}>
                  {t(story.quote)}
                </blockquote>
                <p className={`mt-5 ${BODY} font-semibold text-white`}>{t(story.name)}</p>
                <p className={`mt-1 ${META} text-white/70`}>{t(story.school)}</p>
                <p className={`mt-3 break-keep ${BODY} leading-relaxed text-white/70`}>{t(story.after)}</p>
              </Card>
            ))}
          </div>
        </Chapter>
      )}

      {/* 하단 오픈채팅 바. 홈에 있을 때와 같은 조건입니다(#record가 지나면 나타나고 푸터가 보이면 물러남). */}
      <MobileChatBar afterId="record" endId="closing" phone />
    </main>
    <SiteFooter />
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
            <span className={`block break-keep ${TITLE} font-black tracking-tight text-white`}>
              {t(stat.value)}
            </span>
            <span aria-hidden className={`mt-2 block break-keep ${META} leading-snug text-white/70`}>
              {t(stat.label)}
            </span>
            {stat.note && (
              <span className={`mt-2 block break-keep ${META} font-semibold leading-snug text-accent`}>
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
              <span className={`${META} font-bold uppercase tracking-[0.14em] text-accent`}>
                {t(photo.day)}
              </span>
              <span className={`break-keep ${BODY} leading-snug text-white/70`}>{t(photo.caption)}</span>
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
// 있고 양옆이 거기서 만난다는 배치 하나뿐이고, 그건 flex가 더 잘합니다.
// 좁아지면 저절로 세로로 서고, 글자는 페이지 서체와 줄바꿈 규칙(break-keep)을
// 그대로 씁니다. SVG <text>였다면 두 벌을 따로 관리해야 했을 겁니다.
//
// 맨 위 줄이 이 그림의 주장입니다. DECIDED 2026-10-01 (사용자: "직접 만나는거임, 그리고
// 이들이 진심으로 교류하는 곳임"): 그 전에는 "서로 직접 만나지 않습니다"였고 선도 점선
// 이었습니다. 학생회와 기업은 나루에서 직접 만납니다. 화살표 둘이 같은 말을 합니다. 둘 다
// 가운데를 가리키고, 가운데 상자가 둘이 만나는 자리라고 말합니다(2026-09-21).
// ─────────────────────────────────────────────────────────────────────────────
function LayerDiagram({ t }: { t: (p: { ko: string; en: string }) => string }) {
  const [host, organiser, sponsor] = naru.how.layers;
  const { locale } = useLocale();

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
      // 2026-09-25 (가독성 브리프 4.1): md부터 가운데 정렬이던 상자 안 글을 왼쪽으로. 본문 기둥
      // 아래의 글은 전부 왼쪽 정렬입니다. 상자의 배치(가운데가 나루)는 그대로입니다.
      // DECIDED 2026-10-02 (사용자: "상자 3개가 좀 위로 너무 높은 느낌"): md부터의 위아래 안쪽 여백 py-5를
      // 걷어 폰과 같은 py-3으로, 글 사이 간격도 md부터 mt-2 → mt-1.5. 글자 크기와 줄 수는 그대로입니다.
      // DECIDED 2026-10-05 (사용자, 스크린숏: "여기 너무 어색, 공간 사이의 gap도 너무 크고"): md부터 상자 안의
      // 글(이름, 내는 것, 얻는 것)도 칩과 같이 가운데입니다. 칩만 가운데이고 글이 왼쪽이라 한 상자에 축이
      // 둘이었습니다(2026-09-25의 "상자 안 글은 왼쪽"은 이 결정이 대신합니다). 글은 위에서부터 쌓아(md:justify-start)
      // 세 칩이 한 줄에 섭니다. 그 전에는 줄 수가 다른 가운데 상자의 칩만 25px 위에 있었습니다. 폰은 그대로.
      // DECIDED 2026-10-08 (사용자: "세 층 상자 안 글이 폰에서 왼쪽 정렬입니다 - desktop 을 따라가"): 폰도 데스크톱과
      // 같이 가운데이고, 칩 아래에 이름이 쌓입니다. 위 10월 5일의 "폰은 그대로"를 이 결정이 대신합니다.
      // 내는 것 한 줄을 폰에서 숨기는 것(나루 챕터 길이 목표)은 그대로입니다.
      className={`flex flex-1 flex-col justify-center rounded-2xl border px-4 py-3 text-center md:justify-start md:py-4 ${
        center
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      {/* 역할 라벨은 8월 칩 문법(2026-09-17). 가운데(주최)만 한 단 밝은 칩. */}
      {/* 역할 라벨은 "한글 주 + 영문 소문자 보조"(감사 반영 브리프 8, 영문 라벨 규칙). 대문자 자간
          라벨은 아이브로에만. */}
      {/* 폰은 칩과 이름을 한 줄에, 내는 것은 숨기고 얻는 것만(나루 챕터 길이 목표). md부터 그 전 그대로. */}
      <div>
        {/* DECIDED 2026-10-02 (사용자: "주관, 주최, 후원 bubble이 at the centre"): md부터 역할 칩만 상자의
            가로 가운데에 둡니다. 이름과 본문은 왼쪽 정렬 그대로입니다(2026-09-25). 폰은 칩과 이름이 한 줄이라 그대로. */}
        <p>
          <Chip tone="outline" size="meta" className={`tracking-[0.02em] ${center ? "!border-accent/40 !text-accent" : ""}`}><RoleLabel text={t(layer.role)} /></Chip>
        </p>
        {/* DECIDED 2026-10-01 (사용자: "나루 대신, 나루의 로고를 넣어줘. 나루라는 이름 대신"): 가운데 상자는
            이름 글자 대신 헤더, 푸터와 같은 락업입니다. 한글 PNG는 위 26px이 여백이라(헤더 주석 참고)
            영문 SVG보다 한 단 높게 잡아 심볼 크기를 맞춥니다. 양옆 상자는 그대로 글자입니다. */}
        {center ? (
          <p className="mt-2">
            <Image
              src={locale === "en" ? "/naru/naru-name-en-rev.svg" : "/naru/naru-name-rev.png"}
              alt={t(layer.who)}
              width={locale === "en" ? 857 : 604}
              height={locale === "en" ? 142 : 168}
              unoptimized={locale === "en"}
              className={`mx-auto ${locale === "en" ? "h-5 w-auto sm:h-6" : "h-6 w-auto sm:h-7"}`}
            />
          </p>
        ) : (
          <p className={`mt-1.5 break-keep ${BODY} font-bold leading-snug text-white`}>
            {t(layer.who)}
          </p>
        )}
      </div>
      {/* 2026-09-29 (왼쪽 끝 브리프 검증 4): 도식이 READ 폭으로 좁아져 "깔 사람."이 넉 자 한 줄로 떨어졌습니다.
          글자 크기는 그대로 두고 줄 나눔만 고르게(text-wrap: balance) 합니다. */}
      <p className={`mt-1.5 hidden break-keep ${META} leading-snug text-white/70 [text-wrap:balance] md:block`}>{t(layer.brings)}</p>
      {/* 얻는 것 한 줄(2026-09-18). 후원 상자에 내는 것만 있고 얻는 것이 없었습니다(ux-researcher P1). */}
      <p className={`mt-2 break-keep ${META} leading-snug text-white/70 [text-wrap:balance] md:mt-1.5`}>
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
  // 하려면 오른쪽 화살표는 반대여야 합니다. 바로 위 선("직접 만나 진심으로
  // 교류합니다")과 같은 말을 화살표가 합니다. Overview 01도 양쪽이 나루로 들어옵니다.
  //
  // 세로로 설 때(폰)도 같습니다. 나루 위의 상자는 아래를, 아래의 상자는 위를.
  // white/30 → /45: 이 그림에서 유일하게 방향을 말하는 글자라 상자 테두리보다
  // 흐리면 안 됩니다. 자리는 그대로라 챕터 길이는 변하지 않습니다.
  const arrow = (from: "left" | "right") => (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center ${BODY} text-white/60 md:px-1`}
    >
      <span className="md:hidden">{from === "left" ? "↓" : "↑"}</span>
      <span className="hidden md:inline">{from === "left" ? "→" : "←"}</span>
    </span>
  );

  return (
    // data-figure: 세 층 도식은 그림이라 안쪽 정렬(상자, 점선 가운데 라벨)은 그대로이고, 바깥 왼쪽 끝만 READ에 맞춥니다(왼쪽 끝 브리프 2.2).
    // DECIDED 2026-10-05 (사용자: "gap도 너무 크고"): 리드가 내려가 제목 바로 아래가 됐습니다. mt-8/12 → mt-5/6.
    <div data-figure="layers" className={`${READ} mt-5 lg:mt-6`}>
      {/* DECIDED 2026-10-06 (사용자, 스크린숏: "이거 빼줘"): 상자 위의 선과 "직접 만나 진심으로 교류합니다"
          (how.diagramNote)는 그리지 않습니다. 폰에서 같은 말을 하던 아래 한 줄도 같이 내렸습니다. 둘이 나루에서
          만난다는 것은 가운데를 가리키는 화살표 둘이 말합니다. 키는 data/naru.ts에 그대로. */}
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-stretch">
        {box(organiser)}
        {arrow("left")}
        {box(host, true)}
        {arrow("right")}
        {box(sponsor)}
      </div>
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
  const { locale } = useLocale();
  return (
    <div className="border-t border-white/10 pt-3 md:border-l md:border-t-0 md:pl-10 md:pt-2 lg:pt-6 md:lg:pt-2">
      {/* 누르는 것은 알약 테두리 버튼입니다(가독성 브리프 4.2, 규칙 ①). 전에는 작은 대문자
          라벨 모양이라 소제목과 구별되지 않았습니다. #naru 문 셋과 같은 알약입니다. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-[#0B1430]/80 px-4 ${BODY} font-medium text-accent transition hover:border-white/30 hover:text-white lg:hidden`}
      >
        {label}
        <span aria-hidden className={`inline-block text-white/60 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      <dl>
        <dt className={`hidden ${META} font-bold uppercase ${latinTrack(locale)} text-accent lg:block`}>{label}</dt>
        <dd id={id} className={`${open ? "mt-3" : ""} ${open ? "block" : "hidden"} break-keep ${BODY} leading-relaxed text-white/70 lg:mt-3 lg:block`}>{body}</dd>
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
      <span lang="en" className="ml-1 font-semibold text-white/70">{parts[parts.length - 1].toLowerCase()}</span>
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
            <span className={`${TITLE} font-black tabular-nums tracking-tight text-white`}>{shown(r.n)}{r.suffix}</span>
            <div className="mt-2 flex h-28 w-full items-end">
              <div className={`w-full rounded-t-[4px] ${bar(r)} transition-[height] duration-100 ease-linear motion-reduce:transition-none`} style={{ height: `${Math.max(10, (shown(r.n) / max) * 100)}%` }} />
            </div>
            <span className={`mt-2 break-keep px-1 text-center ${META} leading-snug text-white/70`}>{r.label}</span>
          </div>
        ))}
      </div>
      {/* 폰: 세로 스텝. 가로 막대의 길이가 줄어듭니다. */}
      <ol aria-hidden className="space-y-2 sm:hidden">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
            <span className={`text-right ${BODY} font-black tabular-nums tracking-tight text-white`}>{shown(r.n)}{r.suffix}</span>
            <span className="flex items-center gap-3">
              <span className={`h-5 rounded-r-[4px] ${bar(r)}`} style={{ width: `${Math.max(8, (shown(r.n) / max) * 100)}%` }} />
              <span className={`break-keep ${META} leading-snug text-white/70`}>{r.label}</span>
            </span>
          </li>
        ))}
      </ol>
      {/* 큰 숫자 한 줄: 이 회차에서 가장 중요한 신호. */}
      <figcaption aria-hidden className="mt-8 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 border-t border-white/10 pt-6">
        <span className={`${TITLE} font-black leading-none tabular-nums tracking-tight text-white`}>{shown(last.n)}{last.suffix}</span>
        <span className={`break-keep text-left ${BODY} font-semibold leading-snug text-white/85`}>
          {last.label}
          {last.note && <span className="text-naru-plum-tint">{`\u2002·\u2002${last.note}`}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
