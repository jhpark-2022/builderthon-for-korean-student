import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Locale } from "@/data/dictionaryCore";
import { OG_BACKGROUND, OG_SIZE, OG_INK, OG_MUTED, OG_CAPTION, OG_LINE, OG_NAVY, OG_ORANGE, OG_MAGENTA, loadOgFonts, publicPngDataUri } from "@/lib/ogCard";

// ─────────────────────────────────────────────────────────────────────────────
// 공유 카드 세 장(홈, /naru, /2026-08)을 언어별로 그립니다. 경로 파일(app/**/opengraph-image.tsx,
// app/en/**/opengraph-image.tsx)은 여기를 부르기만 합니다.
//
// DECIDED 2026-10-14 (사용자: "한국어랑 영어로 바꾸면, 링크를 공유할 때 그 사람에게도 내가 설정한 언어로.
// so does the image and explanation"): 영문 카드는 app/en/ 아래의 정적 사본이 씁니다. ?lang=en 요청을
// middleware.ts가 그 사본으로 다시 씁니다. 영문 글은 사이트에 이미 있는 영문(data/naru.ts)에서 가져옵니다.
//
// 한글 글자는 이 파일에서 모아 카드 서체에 넣습니다(scripts/build-og-fonts.py). 한글을 새로 쓰면 그 스크립트를 다시 돌리세요.
// 가운뎃점은 쓰지 않습니다(brand 5장). TODO: 12월 날짜가 바뀌면 홈 카드의 날짜 줄도 함께 고치세요(lib/naruDates.ts).
// ─────────────────────────────────────────────────────────────────────────────

const FRAME = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "68px 80px 64px",
  ...OG_BACKGROUND,
  color: OG_INK,
  fontFamily: "Pretendard",
} as const;

async function publicSvgDataUri(path: string) {
  const buf = await readFile(join(process.cwd(), "public", path));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

function Hairline() {
  return <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: OG_LINE }} />;
}

// 헤어라인 위의 두 줄. 왼쪽이 나루의 태그라인(data/naru.ts titleLine1, titleLine2).
function FootLine({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Hairline />
      <div
        style={{
          display: "flex",
          width: "100%",
          marginTop: 24,
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          fontWeight: 400,
          color: OG_MUTED,
        }}
      >
        <div style={{ display: "flex" }}>{left}</div>
        <div style={{ display: "flex" }}>{right}</div>
      </div>
    </div>
  );
}

// DECIDED 2026-10-21: 태그라인은 naru.hero.titleLine1, 2와 같은 문장입니다.
const TAGLINE = { ko: "처음엔 다 서툽니다. 건너기 전에 연습부터.", en: "Everyone starts out clumsy. Practice before you cross." };

// ── 홈 ────────────────────────────────────────────────────────────────────────
// 큰 글자는 사이트 히어로의 로고 그대로입니다. 한국어: 국문 "크로싱 서울"에 네 색 그라데이션, 그 아래 영문을
// 한글 폭에 맞춰 벌립니다(brand 6장 표기 A). 영어: 영문 "CROSSING SEOUL" 단독에 같은 그라데이션(표기 B,
// 영문 화면의 히어로와 같습니다). 로고는 이름 락업으로 왼쪽 위에 작게, 영어 카드는 영문 락업(NARU)입니다.
// 텔레그램, 카카오의 카드는 폭 500px 남짓으로 줄어 보이므로 작은 줄은 둘까지만 둡니다.
// DECIDED 2026-11-06 (종이): 크로싱 서울 워드마크는 사이트 히어로와 같이 남색 글자 끝에 주황 점 하나(brand 10장). 영문 줄은 두지 않습니다(히어로와 같음).
// 캐치프레이즈 첫 줄은 2026-11-11부터 워드마크 위(brand 6장: 크로싱 서울 페이지는 캐치프레이즈, 나루 홈은 태그라인).
const CATCH = { ko: "왜 아직, 손으로?", en: "Why still by hand?" };

// DECIDED 2026-11-11 (사용자, docs/poster-first-brief.md P5): 포스터를 따로 만들지 않고 카카오톡 방에 링크를 올리기로 해, 방에서 먼저 보이는
// 이 카드가 포스터 몫을 합니다. 위에서부터 나루 락업, 캐치프레이즈 첫 줄(56px, 잉크), 워드마크, 날짜와 도시. 바닥 줄은 글 대신 로고 줄:
// "공간 후원" 넷과 "기술, 크레딧" Lovable(data/naru.ts decemberPartners의 둘째, 셋째 줄과 같은 이름). 그 전 바닥 줄은 캐치프레이즈(26px)와
// 한 팀 문장이었고, 로고는 0이었습니다(Lovable 승인 조건은 포스터와 SNS에도 로고).
// 로고 조건(brand 10장, 2026-11-10 표기 조건): 디캠프는 "공간 후원" 이름과 함께 공식 검정 로고, Lovable은 공식 파일 원래 색에 밝은 바탕.
// 흰 실루엣 셋(아산나눔재단, MARU180, FASTFIVE)은 satori가 CSS 필터를 그리지 않아, 사이트와 같은 잉크로 칠한 판(paper 폴더의 -ink.png,
// scripts/colorize-partner-logos.py ink)을 씁니다. 크기는 사이트처럼 넓이를 맞추고(높이 44px 안팎) 비율은 바꾸지 않습니다.
const CARD_LOGOS = {
  venues: {
    label: { ko: "공간 후원", en: "Venue sponsors" },
    logos: [
      { src: "partners/logos/paper/asan-nanum-ink.png", name: "아산나눔재단", w: 772, h: 154 },
      { src: "partners/logos/paper/maru180-ink.png", name: "MARU180", w: 385, h: 91 },
      { src: "partners/logos/paper/fastfive-ink.png", name: "FASTFIVE", w: 457, h: 78 },
      { src: "partners/logos/paper/dcamp.png", name: "디캠프", w: 900, h: 220 },
    ],
  },
  tech: {
    label: { ko: "기술, 크레딧", en: "Tech and credits" },
    logos: [{ src: "partners/logos/paper/lovable.png", name: "Lovable", w: 644, h: 110 }],
  },
};
function ogLogoSize(l: { w: number; h: number }, area = 6200, maxH = 44) {
  const r = l.w / l.h;
  let w = Math.sqrt(area * r);
  let h = w / r;
  if (h > maxH) { h = maxH; w = h * r; }
  return { width: Math.round(w), height: Math.round(h) };
}

export async function renderHomeCard(locale: Locale) {
  const groups = [CARD_LOGOS.venues, CARD_LOGOS.tech];
  const [logoSrc, fonts, ...logoSrcs] = await Promise.all([
    locale === "en" ? publicSvgDataUri("naru/naru-name-en-paper.svg") : publicPngDataUri("naru/naru-name-paper.png"),
    loadOgFonts(),
    ...groups.flatMap((g) => g.logos.map((l) => publicPngDataUri(l.src))),
  ]);
  const name = locale === "en" ? "CROSSING SEOUL" : "크로싱 서울";
  let n = 0;

  return new ImageResponse(
    (
      <div style={FRAME}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {locale === "en" ? <img src={logoSrc} width={290} height={48} alt="NARU" /> : <img src={logoSrc} width={173} height={48} alt="나루 NARU" />}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15, color: OG_INK }}>{CATCH[locale]}</div>
          <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap", fontSize: locale === "en" ? 116 : 156, fontWeight: 900, letterSpacing: locale === "en" ? -3 : -4, lineHeight: 1.1, color: OG_NAVY }}>
            <div style={{ display: "flex" }}>{name}</div>
            <div style={{ display: "flex", color: OG_ORANGE }}>.</div>
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 40, fontWeight: 700, color: OG_INK }}>
            {locale === "en" ? "17–21 December 2026, Seoul" : "2026년 12월 17~21일, 서울"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Hairline />
          <div style={{ display: "flex", marginTop: 20, gap: 56 }}>
            {groups.map((g) => (
              <div key={g.label.en} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: OG_MUTED }}>{g.label[locale]}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 28, height: 48, marginTop: 8 }}>
                  {g.logos.map((l) => {
                    const s = ogLogoSize(l);
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img key={l.name} src={logoSrcs[n++]} width={s.width} height={s.height} alt={l.name} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}

// ── /naru ─────────────────────────────────────────────────────────────────────
// 한국어: 큰 글자가 한글 "나루", 영문 NARU가 보조(brand 6장 "항상 나루가 먼저"). 영어: 영문 화면의 규칙대로 NARU가 큰 글자.
// 오른쪽에 마스터 로고(v2). 카드가 폭 500px로 줄어도 약 150px이라 최소 가로 120px를 지킵니다(brand 10장).
// 가운데 문장은 정의 짧은 판(brand 1장), 영어는 EN 부제입니다. 바닥 오른쪽은 관계 한 문장(brand 6장)의 뒤 절.
export async function renderNaruCard(locale: Locale) {
  const [masterSrc, fonts] = await Promise.all([publicPngDataUri("naru/naru-master-v3-paper.png"), loadOgFonts()]);

  return new ImageResponse(
    (
      <div style={FRAME}>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {locale === "en" ? (
              <div style={{ display: "flex", fontSize: 168, fontWeight: 900, letterSpacing: -4, lineHeight: 1, color: OG_NAVY }}>NARU</div>
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
                <div style={{ display: "flex", fontSize: 168, fontWeight: 900, letterSpacing: -4, lineHeight: 1, color: OG_NAVY }}>나루</div>
                <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 10, color: OG_MAGENTA }}>NARU</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontSize: 40, fontWeight: 700, lineHeight: 1.4, color: OG_INK }}>
              {/* 줄은 배열로 나눕니다. satori는 Fragment 안의 두 줄을 한 줄로 붙였습니다. */}
              {(locale === "en"
                ? ["A Korea-rooted collective", "of student builders"]
                : ["한국에 뿌리를 두고 학생이 직접 운영하는,", "영리를 목적으로 하지 않는 그룹"]
              ).map((line) => (
                <div key={line} style={{ display: "flex" }}>{line}</div>
              ))}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={masterSrc} width={330} height={330} alt="" style={{ marginRight: -24, flexShrink: 0 }} />
        </div>

        <FootLine
          left={TAGLINE[locale]}
          right={locale === "en" ? "Opening CROSSING SEOUL, December 2026" : "2026년 12월, 크로싱 서울을 엽니다"}
        />
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}

// ── /2026-08 (제로백 빌더톤 기록) ────────────────────────────────────────────
// 큰 제목은 "[Zero100 로고] 빌더톤"(사용자, 2026-10-14). 영어는 "[로고] AI Builderthon"으로 정식 영문 이름이 됩니다.
// 로고는 흰색판(public/partners/zero100-wordmark-white.png, 원본의 알파 그대로). 원래 남색은 잉크 바탕에서 보이지 않습니다.
// 숫자는 brand 8장에 적힌 것만 씁니다. Day 1 참석 수는 자료마다 달라 쓰지 않습니다. 영문 라벨은 data/naru.ts의 record.stats.
// 이 페이지에서는 제로백 빌더톤이 주인공이라 나루 로고를 얹지 않습니다(brand 6장).
const RECORD_STATS = [
  { n: "74", unit: { ko: "명", en: "" }, label: { ko: "신청", en: "applied" } },
  { n: "25", unit: { ko: "팀", en: "" }, label: { ko: "시작", en: "teams started" } },
  { n: "21", unit: { ko: "팀", en: "" }, label: { ko: "마지막 날 발표", en: "teams presented" } },
  { n: "14", unit: { ko: "명", en: "" }, label: { ko: "현업 멘토", en: "industry mentors" } },
];

export async function renderRecordCard(locale: Locale) {
  const [logoSrc, naruSrc, fonts] = await Promise.all([
    publicPngDataUri("partners/zero100-wordmark.png"),
    locale === "en" ? publicSvgDataUri("naru/naru-name-en-paper.svg") : publicPngDataUri("naru/naru-name-paper.png"),
    loadOgFonts(),
  ]);
  const en = locale === "en";

  return new ImageResponse(
    (
      <div style={FRAME}>
        {/* DECIDED 2026-10-20 (hwang 브리프 4.4, D2, 감사 W13): 홈 카드와 같은 왼쪽 위 작은 나루 락업. 그 옆의 주황 점은 걷었습니다. */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {en ? <img src={naruSrc} width={290} height={48} alt="NARU" /> : <img src={naruSrc} width={173} height={48} alt="나루 NARU" />}
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: OG_MAGENTA }}>
            {en ? "The record, Singapore, 22–29 August 2026" : "2026년 8월 22~29일, 싱가포르의 기록"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* 영문 이름은 한 줄에 들어가지 않아 로고 아래에 "AI Builderthon"을 놓습니다. */}
          <div style={{ display: "flex", flexDirection: en ? "column" : "row", alignItems: en ? "flex-start" : "center", gap: en ? 18 : 36 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={en ? 380 : 512} height={en ? 80 : 108} alt="Zero100" />
            <div style={{ display: "flex", whiteSpace: "nowrap", fontSize: en ? 112 : 128, fontWeight: 900, letterSpacing: -3, lineHeight: 1.05, color: OG_NAVY }}>
              {en ? "AI Builderthon" : "빌더톤"}
            </div>
          </div>
          {!en && (
            <div style={{ display: "flex", marginTop: 14, fontSize: 26, fontWeight: 700, letterSpacing: 8, color: OG_MAGENTA }}>
              ZERO100 AI BUILDERTHON
            </div>
          )}
        </div>

        {/* 숫자 넷. 헤어라인 위에 같은 폭으로 놓습니다. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Hairline />
          <div style={{ display: "flex", width: "100%", marginTop: 26 }}>
            {RECORD_STATS.map((s) => (
              <div key={s.n} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontSize: 56, fontWeight: 900, letterSpacing: -1, lineHeight: 1, color: OG_NAVY }}>{s.n}</div>
                  {s.unit[locale] && (
                    <div style={{ display: "flex", marginLeft: 4, fontSize: 26, fontWeight: 700, color: OG_INK }}>{s.unit[locale]}</div>
                  )}
                </div>
                <div style={{ display: "flex", marginTop: 10, fontSize: 26, fontWeight: 400, color: OG_CAPTION }}>{s.label[locale]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
