"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru, naruLinks, type Layer } from "@/data/naru";
import { DECEMBER_EVENT_NAME, decemberEventLabel, formatDecemberStartShort } from "@/lib/naruDates";
import Chapter from "@/components/journey/Chapter";
import Eyebrow from "@/components/ui/Eyebrow";
import OpenChatLink from "@/components/ui/OpenChatLink";
import RecordTabs from "./RecordTabs";

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
// ── 재사용 ───────────────────────────────────────────────────────────────────
// Chapter, Eyebrow, OpenChatLink, BackgroundMount, JourneyNav를 8월 페이지와
// 함께 씁니다. 두 페이지가 한 사이트로 읽혀야 하고, 같은 일을 하는 컴포넌트가
// 둘이 되면 한쪽만 고쳐지기 시작합니다.
// ─────────────────────────────────────────────────────────────────────────────

// 챕터 <h2>의 크기. 8월 페이지가 아홉 개의 h2에 쓰는 값과 같습니다
// (Journey.tsx의 CHAPTER HEADING SIZE 주석). 두 페이지의 제목이 같은 크기로
// 읽혀야 한 사이트입니다.
const H2 = "text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white";

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
        <p className="mx-auto mt-7 max-w-xl break-keep text-sm leading-relaxed text-white/80 sm:text-base">
          {t(naru.hero.sub)}
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

      {/* ── CH1 · 왜 존재하는가 ──────────────────────────────────────────── */}
      <Chapter id="why" align="center">
        <Eyebrow color="purple">{t(naru.why.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.why.heading)}</h2>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 text-left md:grid-cols-2">
          {naru.why.cores.map((core) => (
            <Card key={core.index} className="flex flex-col">
              <span className="text-xs font-black tracking-[0.3em] text-accent">{core.index}</span>
              <h3 className="mt-3 break-keep text-lg font-bold leading-snug text-white sm:text-xl">
                {t(core.title)}
              </h3>
              <div className="mt-4 space-y-3">
                {core.lines.map((line, i) => (
                  <p key={i} className="break-keep text-sm leading-relaxed text-white/70">
                    {t(line)}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* 두 개가 함께 있어야 하는 이유. 카드 아래에 두는 것이 순서입니다.
            먼저 각각을 읽고, 그 다음에 둘이 한 쌍인 이유를 읽습니다. */}
        <div className="mx-auto mt-6 max-w-4xl break-keep rounded-2xl border border-accent/25 bg-accent/[0.06] px-6 py-5 text-left">
          <p className="text-base font-bold leading-snug text-white sm:text-lg">{t(naru.why.note)}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{t(naru.why.noteBody)}</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.why.agendaLabel)}
          </p>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/65">{t(naru.why.agenda)}</p>
        </div>
      </Chapter>

      {/* ── CH2 · 8월의 기록 ─────────────────────────────────────────────── */}
      <Chapter id="record" align="center">
        <Eyebrow color="plum">{t(naru.record.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.record.heading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.record.lead)}
        </p>
        {/* 코어 2개가 여기서 나왔다는 한 줄. CH1을 읽고 내려온 사람에게 이
            챕터가 자랑이 아니라 근거라는 것을 말합니다. */}
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-white/60">
          {t(naru.record.lead2)}
        </p>

        {/* 숫자 다섯. 마지막 하나만 설명 줄을 답니다. "9팀이 출제사에 직접
            자료를 요청했다"는 숫자만으로는 무슨 뜻인지 알 수 없고, 그 뜻이
            이 회차에서 가장 중요한 신호입니다. 시키지 않았는데 했어요. */}
        <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {naru.record.stats.map((stat) => (
            <div
              key={stat.label.en}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-5 text-center"
            >
              <dt className="sr-only">{t(stat.label)}</dt>
              <dd>
                <span className="block text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {t(stat.value)}
                </span>
                {/* aria-hidden: 같은 문자열이 위 sr-only dt에 이미 있습니다.
                    빼지 않으면 "74명 신청, 74명 신청"으로 두 번 읽힙니다. */}
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

        {/* 사진 세 장. 4:3 원본 비율 그대로입니다. aspect 박스를 씌우거나
            object-cover로 자르지 않습니다. 단체 사진의 양 끝 사람이 잘리면
            그 사람은 그 기록에 없는 것이 됩니다. */}
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {naru.record.photos.map((photo) => (
            <figure key={photo.src} className="text-left">
              <Image
                src={photo.src}
                alt={t(photo.alt)}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="h-auto w-full rounded-2xl border border-white/10"
              />
              <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
                  {t(photo.day)}
                </span>
                <span className="break-keep text-sm leading-snug text-white/75">{t(photo.caption)}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* 무엇을 어떻게 했나, 누가 왔나. 사진 뒤, 아쉬웠던 것 앞입니다.
            먼저 있었던 일을 다 보여 주고 나서 부족했던 것을 말해야, 그 고백이
            변명이 아니라 다음 이벤트의 이유로 읽힙니다.
            내용은 전부 8월 정본에서 직접 읽습니다(RecordTabs 주석 참고). */}
        <RecordTabs />

        {/* 아쉬웠던 네 가지. 자랑 뒤에 바로 옵니다. 이 순서가 요점입니다.
            잘된 것만 적으면 다음 이벤트를 여는 이유가 없어 보입니다. */}
        <div className="mx-auto mt-16 max-w-4xl text-left">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="break-keep text-lg font-bold text-white sm:text-xl">
              {t(naru.record.gapsLabel)}
            </h3>
            <span className="break-keep text-sm text-white/70">{t(naru.record.gapsNote)}</span>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {naru.record.gaps.map((gap) => (
              <li key={gap.title.en} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="break-keep text-sm font-semibold leading-snug text-white">{t(gap.title)}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-white/60">{t(gap.body)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={naruLinks.archive}
            onClick={() => track("naru_cta", { src: "record", to: "archive" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
          >
            {t(naru.record.cta)}
            <span aria-hidden className="text-white/50">→</span>
          </Link>
        </div>
      </Chapter>

      {/* ── CH3 · 어떻게 일하는가 ────────────────────────────────────────── */}
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
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 text-left lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
              {t(naru.how.nameLabel)}
            </p>
            <div className="mt-3 space-y-3">
              {naru.how.nameLines.map((line, i) => (
                <p key={i} className="break-keep text-sm leading-relaxed text-white/75">
                  {t(line)}
                </p>
              ))}
            </div>
          </div>
          {/* 하지 않는 것. 짧게, 목록으로. 이 블록이 있어야 "그럼 어떻게
              들어가나"라는 질문이 바로 다음 챕터로 넘어갑니다. */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
              {t(naru.how.notDoingLabel)}
            </p>
            <ul className="mt-3 space-y-2.5">
              {naru.how.notDoing.map((line, i) => (
                <li key={i} className="flex gap-2.5 break-keep text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-white/35" />
                  {t(line)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Chapter>

      {/* ── CH4 · 다음 이벤트 ────────────────────────────────────────────── */}
      <Chapter id="december" align="center">
        <Eyebrow color="orange">{t(naru.december.eyebrow)}</Eyebrow>
        {/* 날짜 문자열은 lib/naruDates.ts에서만 옵니다. 여기에 "12월 9일"을
            직접 쓰지 마세요. 확정 전의 값이라 반드시 한 번 이상 바뀝니다. */}
        <h2 className={H2}>
          {formatDecemberStartShort(locale)}
          {t(naru.december.headingSuffix)}
        </h2>
        {/* 이름이 서는 자리. DECEMBER_EVENT_NAME이 채워지면 이름이, 아직
            null이면 "이름은 아직 없습니다"가 옵니다. 둘 중 하나는 반드시
            있어야 해요. 아무것도 없으면 읽는 사람이 이름을 찾다가 못 찾고,
            못 찾은 것은 "아직 안 정해진 행사"로 읽힙니다. */}
        {DECEMBER_EVENT_NAME ? (
          <p className="mt-5 text-lg font-bold tracking-tight text-[#F2B183] sm:text-xl">
            {decemberEventLabel(locale)}
          </p>
        ) : (
          <p className="mt-5 break-keep text-sm text-white/50">{t(naru.december.nameTbd)}</p>
        )}
        {/* 첫 문장이 부정입니다. 8월을 아는 사람은 이 자리에서 반드시
            "2회차인가"를 묻고, 그 오해를 그대로 두면 아래 문장이 전부 그 전제
            위에서 읽힙니다. */}
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base font-semibold leading-relaxed text-white/85">
          {t(naru.december.notSequel)}
        </p>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-white/70">
          {t(naru.december.lead)}
        </p>

        <div className="mx-auto mt-12 max-w-3xl space-y-4 text-left">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
            {t(naru.december.changesLabel)}
          </p>
          {naru.december.changes.map((line, i) => (
            <p key={i} className="break-keep text-sm leading-relaxed text-white/80">
              {t(line)}
            </p>
          ))}
          <div className="pt-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/50">
              {t(naru.december.whoLabel)}
            </p>
            <p className="mt-2 break-keep text-sm leading-relaxed text-white/80">{t(naru.december.who)}</p>
          </div>
        </div>

        {/* ── 이벤트가 끝난 뒤에 할 일 ───────────────────────────────────
            이 블록은 반드시 있어야 합니다. 8월에 이걸 쓰지 않아서, 이벤트 뒤에
            멘토에게 먼저 연락한 팀이 한 팀이었습니다. 병목은 의지가 아니라
            판단 재료였어요. 내 강점이 그 자리에 쓸모가 있는지를 스스로
            판단할 수 없었습니다. 그래서 무엇을 하면 되는지를 글로 적습니다.
            주황 테두리를 쓰는 유일한 블록입니다. */}
        <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-accent/25 bg-accent/[0.06] px-6 py-7 text-left sm:px-8">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent">
            {t(naru.december.afterLabel)}
          </p>
          <p className="mt-3 break-keep text-sm leading-relaxed text-white/70">
            {t(naru.december.afterNote)}
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {naru.december.after.map((step, i) => (
              <li key={step.title.en}>
                <span className="text-xs font-black tracking-[0.3em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 break-keep text-sm font-semibold leading-snug text-white">
                  {t(step.title)}
                </p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-white/65">{t(step.body)}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-10 text-sm text-white/55">{t(naru.december.ctaNote)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <OpenChatLink t={t} src="naru-december" />
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

      {/* ── CH5 · 함께하는 길 ────────────────────────────────────────────── */}
      <Chapter id="join" align="center">
        <Eyebrow color="purple">{t(naru.join.eyebrow)}</Eyebrow>
        <h2 className={H2}>{t(naru.join.heading)}</h2>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-white/75">
          {t(naru.join.lead)}
        </p>

        <div className="mt-12 grid gap-4 text-left md:grid-cols-2">
          {naru.join.cards.map((card) => (
            <Card key={card.who.en} className="flex flex-col">
              <h3 className="break-keep text-lg font-bold text-white">{t(card.who)}</h3>
              <div className="mt-4 flex-1 space-y-3">
                {card.lines.map((line, i) => (
                  <p key={i} className="break-keep text-sm leading-relaxed text-white/70">
                    {t(line)}
                  </p>
                ))}
              </div>
              <div className="mt-6">
                {card.openChat ? (
                  <OpenChatLink t={t} src="naru-join" />
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
            src="/naru/naru-lockup-rev.png"
            alt={t(naru.footer.logoAlt)}
            width={627}
            height={202}
            className="h-10 w-auto sm:h-12"
          />
          <p className="break-keep text-xs leading-relaxed text-white/60">{t(naru.footer.credits)}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <OpenChatLink t={t} src="naru-footer" className="!px-3.5 !py-2 !text-xs" />
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
        </div>
      </footer>
    </>
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
    <div className="mx-auto mt-12 max-w-4xl">
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
