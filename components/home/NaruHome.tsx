"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, openChatLabels, type Layer, type Stat, type RecordPhoto } from "@/data/naru";
import type { Phrase } from "@/data/dictionary";
import {
  decemberEventLabel,
  formatDecemberDateLine,
  formatDecemberStartShort,
} from "@/lib/naruDates";
import Chapter from "@/components/journey/Chapter";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
// RecordTabs는 2026-09-16에 화면에서 내려갔습니다. 파일은 그대로 둡니다 -
// 8월 정본을 직접 읽는 유일한 컴포넌트이고, 되살릴 자리가 여기 #record입니다.
import { H2, H3, LABEL_HEADING, STATEMENT } from "@/components/ui/typography";
import NaruMark from "@/components/ui/NaruMark";
import MotionToggle from "@/components/ui/MotionToggle";

// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈 (/).
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
//   pt-20 sm:pt-28 lg:pt-36      270px  장이 바뀝니다. #december 하나뿐.
//   pt-24 sm:pt-32 lg:pt-44      306px  결론. #why 하나뿐. 페이지에서 가장 큽니다.
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
      {/* ── CH0 · 히어로 ─────────────────────────────────────────────────
          로고는 배경 위에 얹히지 않습니다. 로고 가이드가 사진과 영상 위에
          로고를 올리는 것을 금지하고 있어서, 8월 히어로의 메탈 휴먼 영상 대신
          WebGL 필드만 뒤에 둡니다(app/page.tsx의 BackgroundMount). 필드는
          나루 팔레트로 옮겨져 있습니다(lib/background/config.ts).

          pt-*는 고정 헤더를 피하는 여백입니다. 헤더가 맨 위에서는 투명해서
          없어도 겹쳐 보이지는 않지만, 로고 상단이 바 뒤로 들어갑니다. */}
      <Chapter id="top" align="center" className="pt-20 sm:pt-32">
        {/* 마스터 반전. 최소 가로 120px 규칙을 지키려고 모바일에서도 176px
            아래로 내려가지 않게 둡니다. PNG인 이유는 public/naru/README.md. */}
        <Image
          src="/naru/naru-master-rev.png"
          alt={t(naru.hero.logoAlt)}
          width={900}
          height={900}
          priority
          className="mx-auto h-auto w-40 sm:w-56 lg:w-64"
        />
        {/* DECIDED 2026-09-15: 아이브로를 주황에서 보라로 내립니다. 히어로에
            주황이 둘(이 알약 + 아래 CTA)이면 "점처럼 쓴다"는 규칙이 첫 화면에서
            이미 깨지고, 위에서 주황 테두리를 먼저 쓴 만큼 아래 CTA의 당김이
            줄어듭니다. 이 사이트에서 주황 면은 그 버튼 하나뿐이어야 합니다. */}
        {/* 로고 → 아이브로. 스케일의 mt-6입니다(파일 위 리듬 주석). */}
        <div className="mt-6">
          <Eyebrow color="purple">{t(naru.hero.eyebrow)}</Eyebrow>
        </div>
        {/* 태그라인. 두 줄로 고정합니다. 한 줄로 흘리면 좁은 폭에서 네 줄까지
            꺾이고, 두 문장이 한 덩어리로 읽힙니다. 이건 두 개의 선언입니다. */}
        <h1 className="text-[clamp(2.05rem,6.4vw,4.25rem)] font-black leading-[1.15] tracking-tight text-white">
          <span className="block break-keep">{t(naru.hero.titleLine1)}</span>
          <span className="gradient-text block break-keep bg-gradient-to-r from-[#A99AD6] via-[#C79BB4] to-[#EE8A4F] bg-clip-text pb-[0.14em] text-transparent">
            {t(naru.hero.titleLine2)}
          </span>
        </h1>
        {/* {date}와 {name}은 lib/naruDates.ts에서 옵니다. 카피에 날짜와 이름을
            박아 두면 DECEMBER_STARTS_AT이나 DECEMBER_EVENT_NAME을 고쳐도 이
            문장만 남습니다. 둘 다 확정 전의 값이라 반드시 한 번 이상 바뀝니다. */}
        <p className="mx-auto mt-6 max-w-xl break-keep text-sm leading-relaxed text-white/80 sm:text-base">
          {t(naru.hero.sub)
            .replace("{date}", formatDecemberStartShort(locale))
            .replace("{name}", decemberEventLabel(locale))}
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {/* 주 CTA. 주황 원장(2026-09-16 실측 후 갱신):
                면  이 버튼, 12월 아이브로. 둘뿐입니다.
                점  #why 코어 둘의 나루 표식(NaruMark), 배경 깊은 물의 점.
                글자 12월 날짜 줄과 아이브로의 #F2B183 틴트.
              늘리지 마세요. 늘리면 로고 한가운데의 나루 점이 눈에 띄지 않습니다.
              3층 다이어그램의 주황 워시는 같은 날 걷었습니다(LayerDiagram 주석).
              글자를 남색으로 두는 것은 대비 때문입니다(주황 위 흰 글자는
              2.50:1, 남색 글자는 5.63:1. 실측 2026-09-15). */}
          <a
            href="#december"
            onClick={() => track("naru_cta", { src: "hero", to: "december" })}
            className="group inline-flex items-center gap-2 rounded-full bg-naru-orange px-6 py-3.5 text-sm font-bold text-naru-navy transition hover:-translate-y-0.5 hover:bg-[#F29B67] sm:px-8 sm:text-base"
          >
            {t(naru.hero.ctaDecember)}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <Link
            href={naruLinks.archive}
            onClick={() => track("naru_cta", { src: "hero", to: "archive" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 hover:text-white sm:px-8 sm:text-base"
          >
            {t(naru.hero.ctaArchive)}
          </Link>
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

      {/* ── CH2 · 다음 이벤트 ────────────────────────────────────────────── */}
      {/* 반대로 벌립니다. 여기서 과거가 끝나고 미래가 시작합니다. 공백 자체가
          "장이 바뀐다"를 말하게 두는 유일한 이음매입니다.

          DECIDED 2026-09-17: #record 바로 뒤로 올라왔습니다. 위 문장이 처음으로
          말 그대로가 됐어요. 전에는 그 사이에 #how가 있어서 과거(8월 실측)와
          미래(12월 초안) 사이에 조직도가 끼어 있었고, 폰에서 12월 제목은
          5.9화면, 본문의 첫 행동은 8.6화면이었습니다. 12월의 숫자는 전부
          초안이라 8월의 실측에서 신뢰를 빌려야 하는데, 그 거리가 가장 짧은
          자리가 여기입니다. 순서 근거는 data/naru.ts의 naruNav 주석에도. */}
      <Chapter id="december" align="center" className="pt-20 sm:pt-28 lg:pt-36">
        {/* 아이브로가 이름을 답니다. 이름이 별도의 줄이었을 때는 제목이 날짜라
            이름이 갈 곳이 그 아래뿐이었는데, 제목이 포지션으로 바뀌면서 이름은
            라벨 자리로 올라가는 편이 맞습니다.
            이름과 달은 lib/naruDates.ts에서 조립합니다. DECEMBER_EVENT_NAME이
            다시 null이 되어도 decemberEventLabel이 "12월 이벤트"를 돌려주므로
            이 줄은 깨지지 않습니다(그 경우 naru.december.nameTbd를 다시
            쓰세요. 키는 지우지 않았습니다). */}
        {/* 달과 도시는 빼고 접두어 + 이름만 답니다. 브리프의 기준은 "2026.12
            서울"까지 넣는 것이었는데, 375px에서 재 보니 두 줄로 접혔습니다
            (실측 2026-09-15). 바로 아래 날짜 줄이 "2026년 12월 9일부터,
            서울."을 이미 말하므로 여기서 한 번 더 말할 값이 없습니다.
            formatDecemberMonth는 남겨 둡니다. 나중에 아이브로가 넓어질 자리가
            생기거나 다른 곳에서 달만 필요할 때 쓸 값입니다. */}
        <Eyebrow color="orange">
          {`${t(naru.december.eyebrowPrefix)}\u2002${decemberEventLabel(locale)}`}
        </Eyebrow>
        {/* 제목이 포지션을 말합니다. 전에는 날짜였는데, 이 이벤트에서 설명이
            필요한 것은 언제가 아니라 무엇입니다. 날짜는 바로 아래 한 줄로
            내려갔고 그 문자열도 naruDates가 만듭니다. */}
        <h2 className={H2}>{t(naru.december.heading)}</h2>
        <p className="mt-6 text-base font-semibold tracking-tight text-[#F2B183] sm:text-lg">
          {formatDecemberDateLine(locale)}
        </p>
        {/* 첫 문장이 부정입니다. 8월을 아는 사람은 이 자리에서 반드시
            "2회차인가"를 묻고, 그 오해를 그대로 두면 아래 문장이 전부 그 전제
            위에서 읽힙니다. */}
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base font-semibold leading-relaxed text-white/85">
          <TermLink text={t(naru.december.notSequel)} term={t(naru.december.notSequelTerm)} href="#why" />
        </p>

        {/* ── 이 챕터의 주 행동 (DECIDED 2026-09-17) ───────────────────────
            전에는 챕터 맨 끝, 미정 목록 아래에 메일 링크와 같은 고스트로 나란히
            있었습니다. 히어로의 주 CTA를 눌러 여기 착지한 사람은 제목만 보고
            3화면을 더 내려가야 누를 것을 만났고, 만나서는 "소식 받기"와
            "출제사 문의"를 같은 무게로 봤어요. 등록이 없는 페이지에서 이 버튼이
            참가자의 유일한 문입니다. 제목 바로 아래, 흰 면으로 둡니다.
            ctaNote가 참가 조건(스크리닝 없음)을 버튼 바로 위에서 말합니다. */}
        <p className="mx-auto mt-12 max-w-2xl break-keep text-sm text-white/55">{t(naru.december.ctaNote)}</p>
        <div className="mt-4 flex justify-center">
          <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} variant="primary" />
        </div>
        {/* ── 이번 회차의 모양 ─────────────────────────────────────────
            2026-09-16: 여기 있던 것은 문단 여덟 개였습니다 - lead, 달라지는 것
            셋, 왜 국경을 여는가 둘, 누가 오는가, 그리고 "이벤트가 끝난 뒤에 할
            일" 세 단계. 전부 맞는 말이었고 전부 글이었어요. 12월을 모르는
            사람이 그 여덟 문단을 다 읽어야 12월이 무엇인지 알 수 있었습니다.

            12월 기획 초안(원페이저 v1, 2026-09-10)이 실제로 말하는 것은 한
            줄입니다: raw data에서 문제를 찾는 것부터 증명까지, 한 사이클을
            닷새로 압축한다. 그 한 줄과 그것의 모양만 싣습니다.

            키는 전부 data/naru.ts에 있습니다(changes · why · who · after ·
            afterNote). 확정된 뒤 /seoul 상세 페이지가 생기면 그쪽이 받을
            내용이에요.

            ⚠️ draftNote를 이 블록에서 떼지 마세요. 아래 숫자 중 확정된 것은
            하나도 없습니다. */}
        <p className="mx-auto mt-12 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.december.shapeLead)}
        </p>

        <StatRow stats={naru.december.shape} t={t} className="mt-12 lg:grid-cols-6" />
        {/* /55입니다. /45는 실제 배경 위에서 4.38:1이라 AA를 넘지 못합니다
            (globals.css의 하한 주석). 하필 "이 숫자는 확정이 아니다"라는
            고지가 페이지에서 가장 안 읽히는 색이었습니다. */}
        <p className="mt-4 text-xs text-white/55">{t(naru.december.draftNote)}</p>

        {/* 스테이지 다섯. 날짜가 아니라 순서입니다 - 초안의 12/10~12/14와 확정된
            시작일 12월 9일이 아직 맞지 않아서(lib/naruDates.ts), 달력을 두 번
            말하면 바로 위 날짜 줄과 싸웁니다. */}
        <div className="mx-auto mt-12 max-w-5xl text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.december.stagesLabel)}
          </p>
          {/* role="list": 위 notDoing과 같은 이유입니다.

              REMOVED 2026-09-16 (2차): 칸 맨 위의 00~04 번호 줄.

              그 줄이 하는 일이 없었습니다. 순서는 바로 아래 when("본 일정 전",
              "1일차"...)이 글로 말하고, 그게 원래 그 사실이 있어야 할 자리예요.
              게다가 화면은 00부터 세는데 <ol>은 1부터 세서, VoiceOver가
              "2 of 5"라고 읽는 칸에 눈에는 01이 보였습니다. aria-hidden으로
              가려 두고 있었는데, 가려야 하는 것은 대개 없어도 되는 것입니다.

              이제 칸은 이름 / 언제 / 무슨 일 셋입니다. 번호가 쓰던 줄 하나가
              그대로 사라졌어요. */}
          <ol role="list" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {naru.december.stages.map((stage) => (
              <li
                key={stage.name.en}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
              >
                <p className="text-sm font-bold text-white">{t(stage.name)}</p>
                <p className="mt-0.5 text-xs text-accent">{t(stage.when)}</p>
                <p className="mt-3 break-keep text-sm leading-relaxed text-white/65">{t(stage.body)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* 아직 정해지지 않은 것. 이 챕터에서 가장 정직하고 가장 값이 큰
            블록입니다. 자세한 이유는 data/naru.ts의 tbdLabel 주석에 있습니다.
            시각적 무게는 after 블록보다 가볍게 둡니다. 여기는 목록이지
            주장이 아닙니다. */}
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/55">
            {t(naru.december.tbdLabel)}
          </p>
          <ul role="list" className="mt-4 flex flex-wrap gap-2">
            {naru.december.tbd.map((item) => (
              <li
                key={item.en}
                /* border-white/10입니다. /12가 아니라(2026-09-16).
                   Tailwind v3의 불투명도 수식어는 opacity 스케일(5의 배수)이나
                   대괄호 임의값만 받습니다. border-white/12는 그 둘 다 아니라서
                   CSS가 한 줄도 만들어지지 않고, 그러면 border 폭만 남아 색이
                   Preflight 기본값 #e5e7eb로 떨어집니다. 의도한 1.3:1 대신
                   14.2:1짜리 거의 흰 테두리가 그려지고 있었어요.
                   대괄호로 쓰고 싶으면 border-white/[0.12]입니다. */
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

        {/* 출제사와 후원의 문. 참가자의 문(위 흰 버튼)보다 한 단계 아래라
            텍스트 링크입니다. 메일 제목은 #join 기업 카드와 같습니다
            (naruLinks.sponsor 주석). */}
        <p className="mt-12 text-sm">
          <a
            href={naruLinks.sponsor}
            onClick={() => track("naru_mail", { src: "december" })}
            className="inline-flex items-center gap-1.5 font-medium text-white/75 underline-offset-4 transition hover:text-white hover:underline"
          >
            {t(naru.december.ctaMail)}
            <span aria-hidden>→</span>
          </a>
        </p>
      </Chapter>

      {/* ── CH3 · 어떻게 일하는가 ────────────────────────────────────────── */}
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

      {/* ── CH4 · 함께하는 길 ────────────────────────────────────────────── */}
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

      {/* ── CH5 · 여기서 나온 사람 (조건부) ──────────────────────────────
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

      {/* ── CH6 · 왜 존재하는가 ──────────────────────────────────────────
          DECIDED 2026-09-16: 맨 위에서 맨 아래로 내려왔습니다.

          이 챕터는 이 페이지에서 가장 중요한 두 문장을 갖고 있는데, 맨 위에
          있을 때 그 두 문장은 구호로 읽혔습니다. 안전하게 도전할 자리와 자기
          가치를 증명할 기회는 누구나 말할 수 있고, 아직 아무것도 보여 주지
          않은 페이지의 첫 화면에서 하는 그 말은 값이 없습니다.

          프로그램이 먼저 좋아야 메시지에 값이 생깁니다. 8월에 실제로 있었던
          일(#record)과 12월에 실제로 할 일(#december)을 보고 내려온 사람에게,
          이 두 문장은 같은 문장이 아닙니다. 그때는 선언이 아니라 방금 본
          것들의 이유가 돼요.

          그래서 여기서는 길어져도 됩니다. 페이지의 다른 챕터가 전부 짧아진
          것과 반대 방향인데, 같은 규칙의 결과입니다: 그 자리가 아니면 말할 수
          없는 것을 말합니다. 여기가 그것을 말하는 유일한 자리예요.

          구조는 12월 기획 슬라이드의 코어 장을 그대로 씁니다. 왼쪽이 약속,
          오른쪽이 그 약속이 지켜지는 지점. 약속만 있으면 구호이고, 재는 것이
          붙어야 검증 가능한 문장이 됩니다.

          #people(조건부)보다도 아래입니다. 그 챕터가 채워지면 사람의 이야기가
          이 두 문장 바로 앞에 서고, 그게 이 페이지가 끝나는 가장 좋은 방법
          입니다. */}
      {/* ── 강조 장치 (2026-09-16) ──────────────────────────────────────
          이 챕터는 페이지의 결론인데 여느 챕터처럼 읽혔습니다. 원인은 크기가
          아니라 위계였어요. 안에 비슷한 무게의 블록이 여섯 개 있었고, 전부
          페이지의 다른 곳에서 네 번에서 아홉 번씩 쓰는 어휘였습니다. 챕터가
          표시되지 않았고, 챕터 안에서도 아무것도 표시되지 않았습니다.

          고친 것 다섯.

          1. 다가가는 공백. lg에서 이음매가 306px입니다. 12월(270px)보다 크고
             페이지에서 가장 큽니다. 공백은 대비도 팔레트도 쓰지 않는 유일한
             강조 수단이고, 결론에는 멈춤 뒤에 도착하는 것이 맞습니다.
          2. 카드를 코어 둘에만 남깁니다. exec·measure·note에서 상자를 걷고
             헤어라인과 여백으로 나눴습니다. 변하지 않는 두 개가 챕터에서
             면을 가진 유일한 물체가 되고, 그게 주장을 배치로 그린 것입니다.
          3. 서명 헤어라인. from-accent to-accent-strong 2px입니다. 이미
             모달들이 쓰는 장치인데 홈에서는 한 번도 쓰지 않았어요. 보라에서
             자주로 흐르는 방향이 로고 그라데이션과 같습니다. 이 페이지에서
             여기 한 번만 씁니다. 다른 챕터로 복사하지 마세요.
          4. 나루 점. 코어 번호 자리에 링과 점(components/ui/NaruMark.tsx).
             배경의 깊은 물이 이미 같은 표식을 그리고 있어서, 머리의 로고 →
             물속의 점 → 여기로 고리가 닫힙니다.
          5. 순서를 되돌립니다. 코어 → note → [긴 공백] → exec → agenda.
             note("문턱이 낮아야 커지고...")는 코어 둘이 한 쌍인 이유를
             말하는 문장이라 그 둘 바로 아래에 있어야 합니다. 9/16 오전에
             exec를 끼워 넣으면서 사이가 벌어져 있었어요.

          ⚠️ 주황을 여기 더하지 마세요. 나루 점 둘이 더한 주황은 3층
          다이어그램의 주황 워시를 걷어내서 이미 값을 치렀습니다(LayerDiagram
          주석). 페이지의 주황 면은 히어로 CTA와 12월 아이브로 둘뿐입니다. */}
      {/* ── 판형 (DECIDED 2026-09-17) ────────────────────────────────────
          위 "강조 장치 다섯" 중 2(카드를 코어 둘에만)와 4(나루 점)는 살아
          있고, 카드 자체가 없어졌습니다. 사용자가 이 챕터를 "가장 중요한데
          가장 안 이쁘게 그려진 곳"이라고 했고, 실측 화면이 그 말을 뒷받침했어요.
          코어 둘은 카드 안 H3에 14px 본문이었고, 그 아래로 왼쪽 정렬된 회색
          소문자 블록이 하나의 얇은 헤어라인만 사이에 두고 이어졌습니다. 챕터
          제목은 가운데, 본문은 왼쪽. 결론이 아니라 문서였습니다.

          바꾼 원칙 셋.
          1. 코어 둘은 카드가 아니라 판입니다. 전면 폭, 세로로 두 장. 제목은
             STATEMENT(H2와 H3 사이의 단), 첫 줄은 그 자체가 문장이라 큰 글자,
             둘째 줄이 본문. "그래서 지키는 것"은 md부터 오른쪽 열에 세로
             헤어라인을 두고 섭니다. 12월 기획 슬라이드의 코어 장과 같은
             배치(왼쪽 약속, 오른쪽 지켜지는 지점)를 이번엔 실제로 그렸습니다.
          2. 문장은 가운데로 돌아옵니다. 경첩(note), 재는 것(measure),
             마지막 줄(agenda)은 챕터 제목과 같은 축에 섭니다. 크기는
             text-xl sm:text-2xl(2차에서 H3에서 내림. 아래 주석).
             왼쪽 정렬은 판 안쪽과 exec 두 열에만 남습니다.
          3. 이 챕터에서 text-sm을 쓰지 않습니다. 결론의 본문이 페이지에서
             가장 작은 글씨였습니다. 바닥은 text-base(18px)입니다.

          여전히 하지 않은 것: 상자, 주황 면, 두 번째 그라데이션 선. 판을 나누는
          것은 1px 흰 헤어라인뿐이고, 서명 헤어라인은 제목 아래 한 번입니다.

          2026-09-17 (2차): 전부 한 단 내렸습니다. 사용자가 "또 너무 큰데"라고
          했습니다. STATEMENT 51.75 → 38px, 첫 줄 2xl → xl, 경첩과 재는 것
          H3 → 2xl, exec 제목 2xl → xl, 판 세로 여백 16 → 12. 판형은 그대로.
          크기가 아니라 배치가 이 챕터를 결론으로 만든다는 것이 2차의 교훈입니다. */}
      <Chapter id="why" align="center" className="pt-24 sm:pt-32 lg:pt-44">
        <Eyebrow color="purple">{t(naru.why.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.why.heading)}</h2>
        {/* 서명 헤어라인. max-w는 H2의 것과 같아야 합니다(typography.ts).
            장식이라 1.4.11의 대상이 아닙니다. 빛 번짐을 더하지 마세요. */}
        <div
          aria-hidden
          className="mx-auto mt-6 h-[2px] w-full max-w-[52rem] bg-gradient-to-r from-accent to-accent-strong"
        />

        {/* 코어 둘. 판 두 장.
            ol인 이유: 순서가 뜻입니다. 01이 문턱이고 02가 증명이며, 바로 아래
            note가 그 둘이 한 쌍이라고 말합니다. 번호는 그리지 않습니다(9/16
            2차의 이유 그대로). 나루 점이 제목 첫 글자 앞에 섭니다.
            점의 크기가 em인 이유: STATEMENT가 clamp(31.5~51.75px)라 px로 박으면
            좁은 화면에서 점이 제목보다 커집니다. 0.65em이면 20~34px이고 로고
            가이드의 하한 18px을 지킵니다. mt는 leading 1.15의 첫 줄 한가운데.
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
                  <NaruMark className="mt-[0.2em] h-[0.75em] w-[0.75em]" />
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

        {/* ── 약속이 지켜지는 지점 ───────────────────────────────────────
            위 둘이 약속이고 여기가 그 약속이 깨지거나 지켜지는 자리입니다.
            멘토링 한 시간과 듣는 사람, 그리고 그래서 무엇을 재느냐.

            mt-24는 부속으로 내리는 신호입니다. 여기에 선을 하나 더 긋지
            마세요. 위에 이미 서명 헤어라인이 있고, 선이 둘이면 둘째 선은
            강등이 아니라 또 하나의 괄호로 읽힙니다. */}
        <div className="mx-auto mt-24 max-w-5xl sm:mt-32">
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

        {/* 마지막 줄. 페이지 전체가 여기서 끝납니다. 위의 두 개를 빼면 전부
            방법이고, 방법은 바뀝니다(매니페스토 IV). 이 문장이 8일이 4일이 되는
            12월을 미리 설명합니다. */}
        <div className="mx-auto mt-12 max-w-2xl">
          <h3 className={LABEL_HEADING}>{t(naru.why.agendaLabel)}</h3>
          <p className="mt-3 break-keep text-base leading-relaxed text-white/75">{t(naru.why.agenda)}</p>
        </div>
      </Chapter>

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
