"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 홈(/)과 나루 페이지(/naru)가 함께 쓰는 조각.
//
// DECIDED 2026-10-10 (구조 브리프 2.2): 홈은 크로싱 서울, 나루는 /naru로 나뉩니다. 두 페이지가 같이 쓰는 것
// (폭과 정렬 토큰, 읽기 판, 폰 접힘, 등록 미리 보기 버튼, 푸터)을 여기 한 곳에 둡니다. 복사하지 않습니다.
// 아래 조각들은 components/home/NaruHome.tsx에서 정의만 옮긴 것입니다. 마크업과 클래스는 그대로입니다.
// ─────────────────────────────────────────────────────────────────────────────
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, register as registerCopy } from "@/data/naru";
import type { Phrase } from "@/data/dictionaryCore";
import { BODY, META } from "@/components/ui/typography";
import OpenChatLink from "@/components/ui/OpenChatLink";
import MotionToggle from "@/components/ui/MotionToggle";

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
/**
 * 폰에서만 접히는 묶음. DECIDED 2026-10-10 (사용자: 데스크톱은 지금이 좋다, 폰은 내용이 너무 많고 지저분하다).
 * sm(640px) 아래에서는 안의 내용을 숨기고 단추 하나를 둡니다. 누르면 그 아래에 펼쳐집니다.
 * sm 이상에서는 감싸는 div가 display: contents라 상자가 생기지 않고, 단추도 없습니다. 데스크톱의 배치는 그대로입니다.
 * 글은 지우지 않습니다. 안에 앵커(id)가 있는 블록은 감싸지 않습니다. 접혀 있으면 그 링크가 갈 곳이 없습니다.
 *
 * DECIDED 2026-10-10 (사용자: "너무 많다, 뭐를 눌렀고 어디를 눌러야 닫는지 모르겠다"):
 * 단추는 내용의 위에 있고 누른 뒤에도 그 자리에 남습니다. 열리면 색이 차고 글이 "접기"로 바뀝니다.
 * 전에는 단추가 내용 아래에 있어서, 열면 단추가 화면 밖으로 밀려나 무엇을 눌렀는지 알 수 없었습니다.
 * 긴 내용의 끝에도 접기가 하나 더 있고, 누르면 위의 단추로 돌아갑니다.
 * 이름은 묶음마다 다릅니다("이어서 읽기"가 셋이면 구분이 안 됩니다). 짧은 글 둘은 접지 않고 그대로 보입니다. 홈에 넷입니다.
 */
export function PhoneFold({ more, less, children }: { more: string; less: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const head = useRef<HTMLButtonElement>(null);
  const chevron = (up: boolean) => (
    <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={up ? "rotate-180" : ""}><path d="m6 9 6 6 6-6" /></svg>
  );
  return (
    <>
      <div className="mt-5 text-center sm:hidden">
        <button
          ref={head}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 ${BODY} font-bold ${open ? "border-accent/50 bg-accent/15 text-white" : "border-white/20 text-accent"}`}
        >
          {open ? less : more}
          {chevron(open)}
        </button>
      </div>
      <div className={open ? "contents" : "max-sm:hidden sm:contents"}>{children}</div>
      {open && (
        <div className="mt-6 text-center sm:hidden">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              requestAnimationFrame(() => head.current?.scrollIntoView({ block: "center" }));
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 px-5 ${BODY} font-bold text-accent`}
          >
            {less}
            {chevron(true)}
          </button>
        </div>
      )}
    </>
  );
}

export function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

// ── 정렬과 라벨 (DECIDED 2026-09-25, 가독성 브리프 4) ────────────────────────
// 정렬: 가운데 정렬은 챕터 머리(알약 라벨 + h2 + 바로 아래 문단 하나)와 히어로, 푸터에만
// 씁니다. 8월 페이지의 섹션 머리와 같은 규칙입니다. 그 아래 글은 전부 왼쪽 정렬이고, 버튼은
// 속한 글의 왼쪽 끝에 맞추고, 폰에서 버튼 여럿은 세로로 쌓습니다. 전에는 데스크톱 본문
// 글자의 40%가 가운데 정렬이라 줄마다 시작점이 달랐습니다. 블록의 위치는 아래 "축" 규칙.
//
// 라벨은 두 종류입니다. ①챕터 라벨은 알약(Eyebrow) 그대로. ②챕터 안 소제목(일정, 이렇게
// 굴립니다, 세 층 …)은 SUBHEADING: 본문보다 한 단 큰 18px, semibold, white/85, 자간 0.
// 작은 회색 대문자식 라벨을 소제목으로 쓰지 않습니다. 누르는 것은 알약 테두리 버튼(규칙 ①).
// **한글에 자간 0.08em 이상을 쓰지 않습니다.** 라틴 대문자(DAY 0, 영문 화면의 라벨)만 넓은
// 자간을 유지합니다(LATIN_TRACK). 한글은 대문자가 없어서 넓은 자간이 강조가 아니라 글자
// 사이의 구멍으로 읽힙니다. 표의 행 라벨(세션, 공간, 제출, 기록)은 13.5px, white/75.
// 브리프는 소제목을 16px라고 적었지만 이 페이지 본문 계열(12.24 / 13.5 / 15.75 / 18, 2026-09-20
// 표현 방식 브리프 7) 안에서 16 이상인 가장 작은 단이 18입니다. 새 단을 만들지 않았습니다.
// ──────────────────────────────────────────────────────────────────────────────
// 2026-10-07 (이슈 브리프 4.1): 소제목은 BODY 크기에 굵게입니다. 본문과의 차이는 굵기와 색(/85)뿐입니다.
export const SUBHEADING = `break-keep ${BODY} font-semibold tracking-normal text-white/85`;
// ── 축 (DECIDED 2026-09-26, 한 축 브리프, 사용자: "어떤 건 left, 어떤 건 central, 뒤죽박죽") ──
// 축은 하나입니다. 모든 블록은 화면 가운데 축에 놓고(mx-auto), 글은 그 안에서 왼쪽 정렬합니다.
// 글의 정렬과 블록의 위치는 다른 문제입니다. 9월 25일 BODY_AXIS가 둘을 섞어 본문 블록을 넓은
// 기둥의 왼쪽 끝에 붙였고, 챕터 머리(가운데)와 축이 갈라졌습니다. 폭은 둘뿐입니다:
//   READ = 글을 읽는 기둥. 문단, 소제목, 목록, 버튼, 알림, 숫자 줄, 감사 명단, 두 열까지의 목록.
//   WIDE = 셋 이상이 가로로 나란히 서는 것만. 일정 노선도, AI 활용 범위 셋, 멘토링 규칙 다섯,
//          #join 카드 셋, 세 층 도식.
// 한 블록에 둘이 섞이면(소제목 + 3열 목록) 소제목과 글은 READ, 가로 줄만 WIDE로 쪼갭니다.
// 루트가 18px이라 READ는 864px, WIDE는 1152px입니다(브리프의 768/1024는 16px 기준).
// 폰에서는 둘 다 레일 전체라 화면이 바뀌지 않습니다.
export const READ = "mx-auto w-full max-w-3xl";
export const WIDE = "mx-auto w-full max-w-5xl";
// ── 줄 길이 (DECIDED 2026-10-02, 사용자: 가독성 리뷰의 제안을 모두 반영) ─────────────────
// READ(864px)를 꽉 채운 문단은 한 줄이 45~68자였습니다(실측 1440px). 한글은 35~45자가 편합니다.
// lg부터 문단의 글 폭만 36rem(648px, 18px 글자로 36자 안팎)으로 줄입니다. 기둥(READ)과 판, 카드,
// 표, 구분선의 폭은 그대로이고, 왼쪽 끝도 그대로입니다(왼쪽 끝 브리프). 폰과 태블릿은 바뀌지 않습니다.
//   MEASURE        READ 폭 상자 안에 든 문단. 가운데 정렬 문단은 앞에 mx-auto를 붙입니다.
//   READ_MEASURE   자신이 READ인 왼쪽 정렬 문단. max-w를 건드리지 않고 오른쪽 안쪽 여백으로 줄입니다.
//   READ_MEASURE_C 자신이 READ인 가운데 정렬 문단. 양쪽 안쪽 여백으로 줄입니다.
// 밝기도 같은 날 정리했습니다: 본문(text-base)은 white/75, 작은 본문(text-sm)은 white/70, 강조는
// white/85 또는 흰색, white/55는 라벨과 Day 0에만. 뜻이 있는 문장에 /55를 쓰지 않습니다.
export const MEASURE = "lg:max-w-[36rem]";
export const READ_MEASURE = "lg:pr-[12rem]";
// DECIDED 2026-10-05 (사용자: 가운데 글의 가독성 감사, "make all of the proposed fixes"): 가운데 문단의 규칙 넷.
// ① 줄 길이를 고르게 나눕니다(text-balance). 가운데 정렬에서는 짧은 끝줄이 한가운데 혼자 떠서 윤곽이 깨집니다
//    (실측 610/117px → 377/349px). 줄 수는 그대로입니다. 지원하지 않는 브라우저는 전과 같습니다.
// ② 글 폭은 28rem 하나입니다(같은 날 2차, 사용자 스크린숏: 32rem에서는 고르게 나눈 두 줄짜리의 폭이
//    문단 길이를 따라 388~575px로 벌어져 위아래 윤곽이 들쭉날쭉했습니다. 상한을 내려 폭의 차이를 줄입니다). 전에는 42rem(READ_MEASURE_C)과 36rem(MEASURE) 둘이 섞였습니다. 가운데 글은
//    줄마다 시작점을 새로 찾아야 해서 왼쪽 정렬(36rem)보다 좁아야 합니다. READ 블록은 READ_MEASURE_C,
//    그 안의 문단은 MEASURE_C를 씁니다(둘은 같은 폭). 왼쪽 정렬 문단은 MEASURE, READ_MEASURE 그대로.
// ③ 덩어리의 첫 문단(챕터 리드)만 /90으로 밝히고, 같은 이야기 안은 mt-3, 이야기가 바뀌면 mt-8 이상.
//    전역 CSS의 p { text-wrap: pretty }가 상속값을 이기므로 text-balance는 래퍼가 아니라 문단에 직접 답니다.
// ④ 가운데 문단은 세 줄까지. 넘던 셋(december.lead, why.agenda, join.milestones)은 data/naru.ts에서 줄였습니다.
export const READ_MEASURE_C = "lg:px-[10rem] text-balance";
export const MEASURE_C = "mx-auto lg:max-w-[28rem] text-balance";
// DECIDED 2026-10-07 (이슈 브리프 4.3, 대비 기준): 히어로의 버튼 둘은 남색 반투명 바탕에 섭니다. 히어로에는 읽기
// 판이 없고 해의 빛이 버튼 뒤를 지나갑니다. 폰 영문 화면에서 "See the programme"이 빛 위에 걸려 5.1:1이었습니다
// (본문 기준 7:1). #naru의 문 셋이 같은 이유로 쓰는 알약 바탕(2026-09-23)과 같은 색입니다. 테두리와 크기는 그대로.
export const HERO_BUTTON_GROUND = "!bg-[#0B1430]/60 backdrop-blur-sm";
// 작은 라벨의 자간. 한국어 화면은 0, 영문 화면(라틴 대문자)만 넓게.
export const latinTrack = (locale: "ko" | "en") => (locale === "en" ? "tracking-[0.14em]" : "tracking-normal");
// 챕터 라벨(알약)의 자간. Eyebrow는 8월 페이지와 같은 컴포넌트라 거기 값(0.18em)은 두고
// 홈에서만 한국어일 때 덮습니다.
export const eyebrowTrack = (locale: "ko" | "en") => (locale === "en" ? "" : "!tracking-[0.04em]");

// DECIDED 2026-09-25 (가독성 브리프 2): 읽기 판. 카드가 아니라 배경을 가라앉히는 막입니다.
// 흐림(blur)이 요점입니다. 글자 크기의 점 잡음은 지우고, 형상의 빛과 색과 움직임은 남깁니다.
// 투명도만 올리면 배경이 꺼지고, 흐림만 주면 밝은 점이 번져 남습니다. 둘을 같이 씁니다.
// 위 "상자를 쓰는 자리 셋"과 충돌하지 않습니다. 그 규칙은 내용을 담는 상자이고, 이 판은
// 보이는 모양이 없습니다. 챕터마다 본문 기둥 뒤에 하나(#december, #gains, #naru, #join),
// 판 안에 판을 두지 않고 히어로와 푸터에는 두지 않습니다. 값은 app/globals.css의 .reading-plate.
// 2026-09-26 (한 축 브리프 2): 판은 본문 기둥을 따라갑니다. 기본은 WIDE(64rem) 폭이고, WIDE
// 블록이 없는 챕터(#gains)는 read로 READ(48rem) 폭에 맞춥니다. 둘 다 가운데 축이라 위치는
// 전과 같습니다. 모양(투명도, 흐림, 가장자리)은 그대로입니다.
// 2026-09-26 (판 덮개 브리프 2.1): data-plate는 배경(BackgroundScene.readAnchors)이 판을 찾는 손잡이입니다.
// 형상이 바뀌는 구간을 이 판들 뒤에 둡니다. 값은 챕터 id.
export type PlateId = "december" | "gains" | "naru" | "naru-2" | "join";
export function ReadingPlate({ id, read = false }: { id: PlateId; read?: boolean }) {
  return <div aria-hidden data-plate={id} className={read ? "reading-plate reading-plate--read" : "reading-plate"} />;
}

// DECIDED 2026-09-26 (사용자: "안보이는 부분에 틈을 몇개 더 의도적으로 놓아서 거기는 보이게 해주고,
// 변화하는게 안보이면 좋겠는데"): 긴 챕터(#december, #naru)의 판을 둘로 나눠 틈을 하나씩 더 둡니다.
// 형상은 판이 다 덮는 동안 사라지고 틈에서만 보이며, 바뀌는 일은 사라져 있는 동안만 일어납니다
// (lib/background/scene/BackgroundScene.ts의 schedule). gap은 앞 조각과의 사이를 벌립니다.
// 216px에서 판의 위아래 확장(48px × 2)을 빼면 판 사이 120px로, 챕터 사이의 틈과 같습니다.
// DECIDED 2026-09-29 (사용자: "어떤 건 다 left에 있다가 갑자기 다 센터로 가고, 뒤죽박죽. 문장들과 버튼들도",
// 왼쪽 끝 브리프): 글은 하나의 왼쪽 끝(READ 폭의 왼쪽)에서 시작합니다. 제목, 알약 라벨, 리드, 문단, 목록, 카드,
// 버튼 모두. 가운데 정렬은 그림에만 씁니다: #december의 숫자 줄(5일, 2회, 2026-09-26 사용자 요청)과 5일 노선도,
// 그리고 푸터. 2026-09-29 (사용자): 로고는 어디서든 화면 가운데입니다(#naru 인장, 푸터 로고). 9월 25일의 "챕터 머리는 가운데" 규칙을 이 규칙이 대신합니다(머리가 가운데이고 본문이 왼쪽이면
// 챕터마다 한 번씩 뒤집힙니다). Chapter의 align="center"는 8월 페이지와 같은 컴포넌트라 두고, 판 조각이
// text-left로 덮습니다. 그래서 홈의 네 챕터는 모두 PlateSegment 안에 있습니다.
// DECIDED 2026-09-30 (사용자, 스크린숏 일곱 장): 가운데를 쓰는 자리를 넷 더 둡니다. #december의 머리(알약, h2, 리드 셋,
// 초안 고지), #december 끝의 등록 안내와 버튼 둘, #naru의 알약과 h2(인장 아래), #join의 매니페스토 블록. 규칙은
// "글이 가운데면 버튼도 가운데"입니다(2026-09-29 사용자). 그 밖의 본문은 왼쪽 끝 하나 그대로입니다.
// DECIDED 2026-09-30 2차 (사용자, 스크린숏): 둘 더. #gains의 머리(알약, h2, 바로 아래 한 줄)와 #naru 안의
// "8월이 남긴 것" 블록 전체(알약, h3, 두 문장, 아카이브 버튼). 머리가 왼쪽인 챕터는 #join 하나 남았습니다(요청 없음).
// DECIDED 2026-10-03 (사용자, 스크린숏): #join의 머리(h2, 리드)도 가운데. 이제 네 챕터의 머리가 모두 가운데입니다. #join에는 알약이 없습니다.
// 판 폭은 한 축 브리프(2026-09-26)대로 그 조각의 글 기둥을 따릅니다. WIDE 블록(노선도)이 남은 조각은 #december
// 첫 조각뿐이라 나머지는 read입니다.
export function PlateSegment({ id, gap = false, read = false, children }: { id: PlateId; gap?: boolean; read?: boolean; children: React.ReactNode }) {
  return (
    <div className={gap ? "relative mt-[216px] text-left" : "relative text-left"}>
      <ReadingPlate id={id} read={read} />
      {children}
    </div>
  );
}

// 문장 안의 한 구절을 앵커로. notSequel의 "변하지 않는 두 개"가 #why로 갑니다.
// 구절이 문장에 없으면(번역이 어긋나면) 링크 없이 문장만 그립니다. 깨진 링크보다
// 링크 없는 문장이 낫습니다.
export function TermLink({ text, term, href }: { text: string; term: string; href: string }) {
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

// 창이 열리기 전의 등록 버튼(감사 반영 브리프 1.1). 흐림(opacity) 대신 색으로 비활성을 말합니다:
// 흰 글자 /70은 바탕 위 9:1이라 4.5:1을 넉넉히 넘습니다. disabled 속성 대신 aria-disabled를
// 쓰는 이유는 포커스가 닿아야 aria-describedby의 캡션이 읽히기 때문입니다. 누르면 아무 일도
// 없습니다. 창이 열리면 부르는 쪽의 open 분기가 대신 그립니다.
// DECIDED 2026-10-08 (사용자: "등록은 볼 수 있는데, submit만 못하게"): 이제 누르면 등록 폼이 미리 보기로 열립니다.
// 제출 버튼만 꺼져 있습니다(components/crossing/RegisterModal의 preview). 라벨은 "등록 폼 미리 보기"이고 살아
// 있는 버튼이라 글자는 /85입니다. 프로바이더가 없는 자리에서는 전처럼 아무 일도 없습니다.
export function PreparingButton({ t, noteId, onOpen, className = "" }: { t: (p: Phrase) => string; noteId: string; onOpen?: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-describedby={noteId}
      onClick={() => { track("naru_cta", { src: "preview", to: "register" }); onOpen?.(); }}
      className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 ${BODY} font-bold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10 sm:px-8 sm:py-4 ${className}`}
    >
      {t(registerCopy.previewCta)}
      <span aria-hidden className="text-white/70">→</span>
    </button>
  );
}

/**
 * 가장 약한 기기에서 읽기 판의 흐림을 빼는 표시(<html data-plate="lite">). 판을 그리는 페이지가 한 번 부릅니다.
 */
export function usePlateLite() {
  // 가장 약한 기기에서는 읽기 판의 흐림을 뺍니다(가독성 브리프 2.3). pickQuality가 최저 단으로
  // 보내는 조건 셋(coarse, 폭 768 미만, 메모리 4GB 이하) 중 기기 성능을 말하는 것은 메모리
  // 하나입니다. 나머지 둘로 가르면 모든 폰에서 흐림이 빠지고, 폰 판(blur 4px)이 뜻을 잃습니다.
  useEffect(() => {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    if (mem <= 4) document.documentElement.dataset.plate = "lite";
  }, []);
}

// ── 푸터 ─────────────────────────────────────────────────────────
// main 밖입니다. 안에 두면 contentinfo 랜드마크가 main 랜드마크 안에
// 중첩되고, 랜드마크로 페이지를 훑는 사람이 본문을 빠져나가지 않은 채
// 푸터에 도착합니다.
// 크레딧 표기 순서는 언제나 주최 → 주관 → 후원입니다.
// 8월 푸터의 "SMU, NUS, NTU 한인 학생회가 주관하고" 줄은 가져오지
// 않았습니다. 그건 제로백 빌더톤의 크레딧이고, 12월 이벤트의 주관은
// 아직 정해지지 않았습니다.
export function SiteFooter() {
  const { t, locale } = useLocale();
  return (
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
          {/* 부제와 짧은 정의(2026-09-29, data/naru.ts의 footer.subtitle과 shortDef). 부제는 로고 링과 같은 글자라
              영문 대문자 라벨로, 정의는 크레딧보다 한 단 밝게. */}
          <div className="-mt-2 flex max-w-xl flex-col items-center gap-2">
            {/* 로고 가이드 2026-09-30: 링처럼 "A KOREA-ROOTED COLLECTIVE / STUDENT BUILDERS" 두 줄. 링에서는 of를 뺍니다
                (사용자: 아랫줄이 OF로 시작하는 게 거슬림). 스크린리더는 문장 부제(footer.subtitle)를 읽습니다. */}
            <p lang="en" className={`${META} font-bold uppercase leading-relaxed tracking-[0.14em] text-white/70`}>
              <span className="sr-only">{t(naru.footer.subtitle)}</span>
              <span aria-hidden="true" className="block">{naru.footer.subtitleRing.top}</span>
              <span aria-hidden="true" className="block">{naru.footer.subtitleRing.bottom}</span>
            </p>
            <p className={`break-keep ${BODY} leading-relaxed text-white/70`}>{t(naru.footer.shortDef)}</p>
          </div>
          {/* 크레딧(2026-09-23): 폰(sm 미만)은 세 줄, sm부터 한 줄에 gap 여백. 가운뎃점은 쓰지 않습니다.
              라벨 white/45, 값 white/70. */}
          <p className={`flex flex-col items-center gap-1 break-keep ${META} leading-relaxed sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5`}>
            {naru.footer.creditItems.map((c) => (
              <span key={c.label.en}>
                <span className="text-white/70">{t(c.label)}</span> <span className="text-white/70">{t(c.value)}</span>
              </span>
            ))}
          </p>
          {/* gap-y-7 (2026-09-19, 모바일 감사 7): 아래 링크가 -my-3(−13.5px씩)이라
              gap-y-2로는 행 간격이 −18px이었습니다. 지금은 오픈채팅이 막혀 링크가
              둘뿐이라 한 줄에 들어가지만, 되살리면 즉시 발현하는 잠복 상태였습니다.
              31.5 − 27 = 4.5px. */}
          <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-7 ${META}`}>
            <OpenChatLink t={t} src="naru-footer" label={openChatLabels.footer} className="!px-3.5 !py-2 !text-xs" />
            <a
              href={naruLinks.general}
              onClick={() => track("naru_mail", { src: "footer" })}
              // min-w-[44px] (2026-09-19, 감사 반영): "문의"/"Contact"는 글자가
              // 짧아 가로 23.4px이었습니다. 세로 44px은 -my-3 + py-3이 만들지만
              // 가로는 아무것도 보장하지 않았어요. 가운데 정렬로 글자 자리는 그대로.
              className="-my-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center py-3 text-white/70 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.contact)}
            </a>
            <Link
              href={naruLinks.archive}
              // min-w-[44px] (2026-09-19, 감사 반영): "문의"/"Contact"는 글자가
              // 짧아 가로 23.4px이었습니다. 세로 44px은 -my-3 + py-3이 만들지만
              // 가로는 아무것도 보장하지 않았어요. 가운데 정렬로 글자 자리는 그대로.
              className="-my-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center py-3 text-white/70 underline-offset-4 transition hover:text-white hover:underline"
            >
              {t(naru.footer.archive)}
            </Link>
          </div>
          <p className={`${META} text-white/70`}>{t(naru.footer.rights)}</p>
          {/* 배경 움직임 끄기. WCAG 2.2.2. 자리가 푸터인 이유는 컴포넌트 주석에
              있습니다. */}
          <MotionToggle className="min-h-[44px] mt-2 !text-white/70" />
        </div>
      </footer>
  );
}
