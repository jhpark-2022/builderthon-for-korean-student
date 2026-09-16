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
import { H2, H3 } from "@/components/ui/typography";
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

// 카드 한 장. 8월의 Glass와 같은 값이지만, 그 컴포넌트는 Journey.tsx 안에
// 있습니다. 두 줄짜리 래퍼를 꺼내려고 5,157줄 파일을 건드리지 않았습니다.
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 ${className}`}>
      {children}
    </div>
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
        <div className="mt-8">
          <Eyebrow color="purple">{t(naru.hero.eyebrow)}</Eyebrow>
        </div>
        {/* 태그라인. 두 줄로 고정합니다. 한 줄로 흘리면 좁은 폭에서 네 줄까지
            꺾이고, 두 문장이 한 덩어리로 읽힙니다. 이건 두 개의 선언입니다. */}
        <h1 className="text-[clamp(2.05rem,6.4vw,4.25rem)] font-black leading-[1.15] tracking-tight text-white">
          <span className="block break-keep">{t(naru.hero.titleLine1)}</span>
          <span className="block break-keep bg-gradient-to-r from-[#A99AD6] via-[#C79BB4] to-[#EE8A4F] bg-clip-text pb-[0.14em] text-transparent">
            {t(naru.hero.titleLine2)}
          </span>
        </h1>
        {/* {date}와 {name}은 lib/naruDates.ts에서 옵니다. 카피에 날짜와 이름을
            박아 두면 DECEMBER_STARTS_AT이나 DECEMBER_EVENT_NAME을 고쳐도 이
            문장만 남습니다. 둘 다 확정 전의 값이라 반드시 한 번 이상 바뀝니다. */}
        <p className="mx-auto mt-7 max-w-xl break-keep text-sm leading-relaxed text-white/80 sm:text-base">
          {t(naru.hero.sub)
            .replace("{date}", formatDecemberStartShort(locale))
            .replace("{name}", decemberEventLabel(locale))}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-9">
          {/* 주 CTA. 주황은 이 사이트에서 이 버튼과 12월 챕터의 아이브로,
              그리고 배경 필드의 가장 뜨거운 입자에만 있습니다. 더 늘리지
              마세요. 늘리면 로고 한가운데의 나루 점이 눈에 띄지 않습니다.
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
      {/* pt를 줄여 #why에 붙입니다. 이 챕터는 앞 챕터의 근거라 같은 호흡이어야
          합니다. Chapter의 py-24가 모든 이음매를 216px로 만들고 있었는데, 뜻이
          다른 이음매가 같은 공백을 쓰면 공백이 아무 말도 하지 않습니다. */}
      <Chapter id="record" align="center" className="pt-8 sm:pt-10 lg:pt-12">
        <Eyebrow color="plum">{t(naru.record.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.record.heading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.record.lead)}
        </p>
        {/* 숫자 다섯. 마지막 하나만 설명 줄을 답니다. "9팀이 출제사에 직접
            자료를 요청했다"는 숫자만으로는 무슨 뜻인지 알 수 없고, 그 뜻이
            이 회차에서 가장 중요한 신호입니다. 시키지 않았는데 했어요. */}
        <StatRow stats={naru.record.stats} t={t} className="mt-12 lg:grid-cols-5" />

        {/* 사진 열두 장. 이 챕터의 본문입니다.
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

      {/* ── CH2 · 어떻게 일하는가 ────────────────────────────────────────── */}
      <Chapter id="how" align="center" className="pt-8 sm:pt-12 lg:pt-14">
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
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {naru.how.notDoing.map((line, i) => (
              <li key={i} className="flex gap-2.5 break-keep text-sm leading-relaxed text-white/75">
                <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-white/35" />
                {t(line)}
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      {/* ── CH3 · 다음 이벤트 ────────────────────────────────────────────── */}
      {/* 반대로 벌립니다. 여기서 과거가 끝나고 미래가 시작합니다. 공백 자체가
          "장이 바뀐다"를 말하게 두는 유일한 이음매입니다. */}
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
        <p className="mt-5 text-base font-semibold tracking-tight text-[#F2B183] sm:text-lg">
          {formatDecemberDateLine(locale)}
        </p>
        {/* 첫 문장이 부정입니다. 8월을 아는 사람은 이 자리에서 반드시
            "2회차인가"를 묻고, 그 오해를 그대로 두면 아래 문장이 전부 그 전제
            위에서 읽힙니다. */}
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base font-semibold leading-relaxed text-white/85">
          {t(naru.december.notSequel)}
        </p>
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
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.december.shapeLead)}
        </p>

        <StatRow stats={naru.december.shape} t={t} className="mt-12 lg:grid-cols-6" />
        <p className="mt-4 text-xs text-white/45">{t(naru.december.draftNote)}</p>

        {/* 스테이지 다섯. 날짜가 아니라 순서입니다 - 초안의 12/10~12/14와 확정된
            시작일 12월 9일이 아직 맞지 않아서(lib/naruDates.ts), 달력을 두 번
            말하면 바로 위 날짜 줄과 싸웁니다. */}
        <div className="mx-auto mt-14 max-w-5xl text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.december.stagesLabel)}
          </p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {naru.december.stages.map((stage, i) => (
              <li
                key={stage.name.en}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
              >
                {/* 순서 번호는 첫 칸(Team Bonding)만 비웁니다. 그건 본 일정
                    전에 있는 일이라 1일차가 아니에요. */}
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">
                  {i === 0 ? "00" : String(i).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-bold text-white">{t(stage.name)}</p>
                <p className="mt-0.5 text-xs text-white/50">{t(stage.when)}</p>
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
          <ul className="mt-4 flex flex-wrap gap-2">
            {naru.december.tbd.map((item) => (
              <li
                key={item.en}
                className="inline-flex rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70"
              >
                {t(item)}
              </li>
            ))}
          </ul>
          <p className="mt-4 break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.tbdNote)}
          </p>
        </div>

        <p className="mt-10 text-sm text-white/55">{t(naru.december.ctaNote)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <OpenChatLink t={t} src="naru-december" label={openChatLabels.december} />
          <a
            href={naruLinks.december}
            onClick={() => track("naru_mail", { src: "december" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
          >
            {t(naru.december.ctaMail)}
            <span aria-hidden className="text-white/50">→</span>
          </a>
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
            <Card key={card.who.en} className="flex flex-col">
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
                    onClick={() => track("naru_mail", { src: `join_${card.who.en}` })}
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
      <Chapter id="why" align="center">
        <Eyebrow color="purple">{t(naru.why.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.why.heading)}</h2>

        {/* 코어 둘. 두 줄 전부 그리고, 그 아래 "그래서 지키는 것"이 붙습니다.
            이 세 번째 줄이 카드를 선언에서 규칙으로 바꿉니다 - 스크리닝을 두지
            않는 것과 순위를 지운 것은 태도가 아니라 코어에서 따라 나온 결정
            입니다. 카드 안에서 위 여백으로 갈라 두어 눈이 "약속 / 그래서"를
            나눠 읽게 합니다. */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 text-left md:grid-cols-2">
          {naru.why.cores.map((core) => (
            <Card key={core.index} className="flex flex-col">
              <span className="text-xs font-black tracking-[0.3em] text-accent">{core.index}</span>
              <h3 className="mt-3 break-keep text-lg font-bold leading-snug text-white sm:text-xl">
                {t(core.title)}
              </h3>
              <div className="mt-4 flex-1 space-y-3">
                {core.lines.map((line, i) => (
                  <p key={i} className="break-keep text-sm leading-relaxed text-white/70">
                    {t(line)}
                  </p>
                ))}
              </div>
              <div className="mt-6 border-t border-white/[0.07] pt-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">
                  {t(naru.why.keepsLabel)}
                </p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-white/75">
                  {t(core.keeps)}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── 약속이 지켜지는 지점 ───────────────────────────────────────
            위 둘이 약속이고 여기가 그 약속이 깨지거나 지켜지는 자리입니다.
            멘토링 한 시간과 듣는 사람, 그리고 그래서 무엇을 재느냐.

            재는 것을 주황 띠로 따로 뽑습니다. 이 챕터에서 가장 검증 가능한
            문장이고, 기업이 우리를 읽을 때 실제로 붙잡는 줄입니다. 주황 면은
            히어로 CTA와 12월 아이브로, 그리고 여기까지 셋뿐이어야 합니다. */}
        <div className="mx-auto mt-10 max-w-4xl text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.why.execLabel)}
          </p>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/70">
            {t(naru.why.execLead)}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {naru.why.exec.map((item) => (
              <div
                key={item.index}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5"
              >
                <span className="text-xs font-black lowercase tracking-[0.3em] text-white/45">
                  {item.index}
                </span>
                <p className="mt-2 break-keep text-base font-bold leading-snug text-white">
                  {t(item.title)}
                </p>
                <p className="mt-3 break-keep text-sm leading-relaxed text-white/65">{t(item.body)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-accent/25 bg-accent/[0.06] px-6 py-5 sm:flex-row sm:items-baseline sm:gap-5">
            <p className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent">
              {t(naru.why.measureLabel)}
            </p>
            <p className="break-keep text-sm leading-relaxed text-white/85 sm:text-base">
              {t(naru.why.measure)}
            </p>
          </div>
        </div>

        {/* 두 개가 함께 있어야 하는 이유. 카드 아래에 두는 것이 순서입니다.
            먼저 각각을 읽고, 그 다음에 둘이 한 쌍인 이유를 읽습니다. */}
        <div className="mx-auto mt-10 max-w-4xl break-keep rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-left">
          <p className="text-base font-bold leading-snug text-white sm:text-lg">{t(naru.why.note)}</p>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/70">{t(naru.why.noteBody)}</p>
        </div>

        {/* 마지막 줄. 페이지 전체가 여기서 끝납니다 - 위의 두 개를 빼면 전부
            방법이고, 방법은 바뀝니다(매니페스토 IV). 이 문장이 8일이 4일이 되는
            12월을 미리 설명합니다. */}
        <div className="mx-auto mt-10 max-w-4xl text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.why.agendaLabel)}
          </p>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/65">{t(naru.why.agenda)}</p>
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
              href={naruLinks.december}
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
// 장이 됐습니다. 8일이 어땠는지는 문단 다섯 개보다 사진 열두 장이 더 정확하게
// 말합니다.
//
// grid가 아니라 CSS columns입니다. 이유는 하나뿐이에요: 아무 사진도 자르지
// 않기 위해서. grid로 쌓으려면 칸의 높이를 맞춰야 하고, 높이를 맞추려면
// object-cover로 잘라야 합니다. 단체 사진의 양 끝 사람이 잘리면 그 사람은 그
// 기록에 없는 것이 됩니다(원래의 세 장에 붙어 있던 규칙이고, 열두 장이 되어도
// 그대로입니다). columns는 각 사진이 자기 비율대로 서고 세로 사진과 가로
// 사진이 섞여도 열이 알아서 채워집니다.
//
// break-inside-avoid: 이게 없으면 열 경계에서 사진 하나가 반으로 잘려 두 열에
// 걸칩니다. 캡션이 달린 장은 figure 전체가 한 덩어리로 움직여야 해요.
//
// 캡션은 몇 장에만 있습니다(data/naru.ts의 photos). 열두 장에 전부 달면 사진을
// 늘린 만큼 글이 늘어나서, 이 벽을 만든 이유가 없어집니다.
//
// loading: 첫 장만 즉시 받고 나머지는 next/image의 기본값(lazy)입니다. 이
// 챕터는 히어로에서 한 화면 넘게 내려와 있어서 열두 장을 한꺼번에 받을 이유가
// 없습니다.
// ─────────────────────────────────────────────────────────────────────────────
function PhotoWall({ photos, t }: { photos: RecordPhoto[]; t: (p: Phrase) => string }) {
  return (
    <div className="mx-auto mt-12 max-w-5xl gap-4 [column-count:1] sm:[column-count:2] lg:[column-count:3]">
      {photos.map((photo, i) => (
        <figure key={photo.src} className="mb-4 break-inside-avoid text-left">
          <Image
            src={photo.src}
            alt={t(photo.alt)}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={i === 0}
            className="h-auto w-full rounded-2xl border border-white/10"
          />
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
      className={`flex-1 rounded-2xl border px-4 py-5 text-center ${
        center
          ? "border-naru-orange/35 bg-naru-orange/[0.07]"
          : "border-white/12 bg-white/[0.04]"
      }`}
    >
      <p
        className={`text-[0.62rem] font-bold uppercase tracking-[0.16em] ${
          center ? "text-[#F2B183]" : "text-white/55"
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
