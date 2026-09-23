import type { Metadata } from "next";
import JourneyNav from "@/components/journey/JourneyNav";
import Journey from "@/components/journey/Journey";
import ResetHandler from "@/components/ResetHandler";
import BackgroundMount from "@/components/BackgroundMount";
import ArchiveBanner from "@/components/archive/ArchiveBanner";
import { RegisterProvider } from "@/lib/RegisterContext";
import StickyBarSpace from "@/components/archive/StickyBarSpace";

// ─────────────────────────────────────────────────────────────────────────────
// /2026-08: 제로백 빌더톤(2026년 8월, 싱가포르)의 기록. 나루의 첫 이벤트입니다.
//
// DECIDED 2026-09-15 (나루 런칭): 이 페이지는 원래 홈(/)이었습니다. 홈이
// 나루 그룹의 런칭 페이지가 되면서 여기로 통째로 내려왔습니다. 컴포넌트 구성도,
// 카피도, 크레딧도 그대로입니다.
//
// 왜 지우지 않는가. 한 이벤트가 남겨야 하는 것은 결과물이 아니라 사람의
// 이야기이고(매니페스토 VIII), 두 번째 이벤트부터 선례가 됩니다. 이 페이지를
// 없애면 다음 이벤트를 설명할 근거도, 기업에 우리를 설명할 근거도 같이
// 없어집니다.
//
// 왜 크레딧을 고치지 않는가. 이 이벤트의 주최는 AXMOS였고 파트너 표기도 그때의
// 것입니다. 나루라는 이름은 이 이벤트가 끝난 뒤에 정해졌어요. 지난 이벤트의
// 표기를 나중에 생긴 이름으로 덮어쓰면 그건 기록이 아니라 개작입니다. 그 사정은
// 페이지 맨 위 배너 한 줄이 말합니다(components/archive/ArchiveBanner.tsx).
//
// 제로백 빌더톤은 이 이벤트의 이름이지 나루의 이름이 아니고, 12월 이벤트의
// 이름도 아닙니다. 12월을 "제로백 2회차"라고 부르지 마세요.
//
// 이 파일에서 원본과 달라진 것은 셋뿐입니다: 고정된 serverNow, 지워진
// revalidate, 그리고 배너. 나머지는 옮기기만 했습니다.
// ─────────────────────────────────────────────────────────────────────────────

// ── 제로백 빌더톤의 공유 카드 문자열 ────────────────────────────────────────
// 원래 app/layout.tsx의 metadata였습니다. 레이아웃은 이제 나루를 말해야 하므로
// (제목 "나루 NARU"), 8월 문구는 이 페이지로 내려왔습니다. 문구 자체는 한 글자도
// 바뀌지 않았습니다. 아래 결정 기록도 그대로 유효합니다.
//
// DECIDED 2026-08-23: 라이브 신호를 첫 화면으로 승격 — 히어로 오늘/다음 스트립,
// OG 메타데이터 국면 전환. 시계는 getEventDayState 하나.
//
// "진행 중"이라고 쓰지 않습니다. 어느 국면에서 읽어도 맞는 문장을 씁니다:
// 날짜는 그대로 박아 두고, 서술만 안내형에서 무엇을 하고 있는가로 옮겼습니다.
// 행사 중에는 지금 벌어지는 일로, 끝난 뒤에는 기록으로 읽힙니다.
//
// 모집형 문구(등록·신청·지원하세요)는 원래 없었습니다 — 2026-08-23 전수 확인.
// 다시 넣지 마세요.
const OG_DESCRIPTION =
  "Singapore's first AI builderthon for Korean students, taking on real companies' AI-transformation problems. 22–29 Aug 2026, 8 days.";

export const metadata: Metadata = {
  // layout의 title.template("%s | 나루 NARU")이 뒤를 붙입니다.
  title: "Zero100 AI Builderthon Build in Singapore",
  description:
    "Singapore's first AI builderthon for Korean students. 22–29 Aug 2026 8 days, ~100 builders solving real companies' AI-transformation problems with vibe coding, from zero to MVP.",
  keywords: ["Builderthon", "Zero100", "Singapore", "Korean students", "AI", "vibe coding", "hackathon", "NUS", "NTU", "SMU", "나루", "NARU"],
  alternates: { canonical: "/2026-08" },
  // EN 탭 제목(2026-09-23). LocaleContext가 EN일 때 탭 제목을 이 값으로 바꿉니다.
  other: { "naru:title-en": "Zero100 AI Builderthon, Singapore | NARU" },
  openGraph: {
    title: "Zero100 AI Builderthon",
    description: OG_DESCRIPTION,
    url: "/2026-08",
    siteName: "나루 NARU",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero100 AI Builderthon",
    description: OG_DESCRIPTION,
  },
};

// ── 멈춘 시계 ────────────────────────────────────────────────────────────────
// 원래 이 값은 `Date.now()`였습니다. 서버가 자기 "지금"을 내려보내면 페이지가
// 행사 8일 중 어디쯤인지를 알고 라이브 표면(히어로 스트립, 노선도 진행, 데이
// 카드 3상태)을 그렸어요.
//
// 그 시계는 이제 의미가 없습니다. 행사는 8월 29일에 끝났고 이 페이지는 기록이라,
// 방문자의 진짜 시각으로 그리든 고정값으로 그리든 언제나 마무리(wrap) 국면이
// 나옵니다. 고정값을 쓰는 것은 그 사실을 코드에 적어 두기 위해서입니다.
// `Date.now()`를 남겨 두면 이 페이지가 아직 시각에 반응한다고 읽힙니다.
//
// 9월 1일인 이유는 행사 종료(8/29) 다음 국면에 확실히 들어가는 가장 가까운
// 날짜라서입니다. +08:00을 문자열에 박아 두는 것이 핵심입니다: 이 코드를 읽는
// 곳의 시간대와 무관하게 같은 순간을 가리킵니다(lib/registrationWindow.ts의
// 같은 규칙).
//
// revalidate는 지웠습니다. 다시 그릴 이유가 있는 값이 하나도 남지 않았으니
// 완전한 정적 페이지입니다.
const FROZEN_NOW = new Date("2026-09-01T00:00:00+08:00").getTime();

export default function August2026Archive() {
  return (
    // RegisterProvider는 그대로 둡니다. 등록 진입점은 2026-08-22에 이미
    // 걷어냈지만(마감 후 청산) ReturningGreeting과 ?register=1 경로가 아직 이
    // 컨텍스트를 읽습니다. 8월 페이지의 동작을 바꾸지 않는 것이 이 이동의
    // 조건이라, 살아 있는 배선은 건드리지 않았습니다.
    <RegisterProvider>
      {/* 모바일 스티키 바의 자리(72px)를 예약하는 CSS가 <body>의 data-sticky를
          봅니다(app/globals.css). 나루 홈에는 스티키 바가 없어서 전역으로 걸면
          그 페이지 푸터 아래가 빈 채로 남습니다. 이 페이지만 켭니다. */}
      <StickyBarSpace />
      {/* First child: the ?reset=1 sweep runs before greeting/register read storage. */}
      <ResetHandler />
      <BackgroundMount />
      <JourneyNav />
      <ArchiveBanner />
      <Journey serverNow={FROZEN_NOW} />
    </RegisterProvider>
  );
}
