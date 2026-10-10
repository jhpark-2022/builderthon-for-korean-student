import type { Metadata } from "next";
import JourneyNav from "@/components/journey/JourneyNav";
import Journey from "@/components/journey/Journey";
import ResetHandler from "@/components/ResetHandler";
import BackgroundMount from "@/components/BackgroundMount";
import ArchiveBanner from "@/components/archive/ArchiveBanner";
import { RegisterProvider } from "@/lib/RegisterContext";
import StickyBarSpace from "@/components/archive/StickyBarSpace";

// ─────────────────────────────────────────────────────────────────────────────
// /2026-08: 제로백 빌더톤(2026년 8월, 싱가포르)의 기록. 나루가 시작된 이벤트입니다(주최는 AXMOS 소속 회사들, 2026-10-08).
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
// 왜 크레딧을 고치지 않는가. 이 이벤트의 주최는 제로백(Zero100) 커뮤니티의 일부인
// AXMOS 소속 회사들이었고(DECIDED 2026-10-08, 사용자) 파트너 표기도 그때의 것입니다. 나루라는 이름은 이 이벤트가 끝난 뒤에 정해졌어요. 지난 이벤트의
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
// DECIDED 2026-10-08 (전체 리뷰 반영): 공유 카드와 설명이 "~100 builders"라고 적고
// 있었습니다. 실제는 신청 74명, Day 1 참석 59명, 발표 21팀입니다(data/naru.ts의
// record.stats). 숫자를 고치고, 지난 이벤트의 기록이라는 것을 문장에 넣었습니다.
// 영문 이름은 "Zero100 AI Builderthon", 한글 이름은 "제로백 빌더톤" 하나로 씁니다.
// 모집형 문구(등록, 신청, 지원하세요)는 넣지 않습니다.
const OG_DESCRIPTION =
  "The record of the Zero100 AI Builderthon, Singapore, 22 to 29 August 2026. 74 applied, 59 came on Day 1 and 21 teams presented to the company that set the problem.";

export const metadata: Metadata = {
  // layout의 title.template("%s | 나루 NARU")이 뒤를 붙입니다.
  title: "제로백 빌더톤 기록, 2026년 8월 싱가포르",
  description:
    "2026년 8월 22일부터 29일까지 싱가포르에서 열린 제로백 빌더톤(Zero100 AI Builderthon)의 기록입니다. 74명이 신청했고 59명이 첫날 왔으며, 21팀이 마지막 날 문제를 낸 기업 앞에서 발표했습니다.",
  keywords: ["Builderthon", "Zero100", "Singapore", "Korean students", "AI", "vibe coding", "hackathon", "NUS", "NTU", "SMU", "나루", "NARU"],
  alternates: { canonical: "/2026-08" },
  // EN 탭 제목(2026-09-23). LocaleContext가 EN일 때 탭 제목을 이 값으로 바꿉니다.
  other: { "naru:title-en": "Zero100 AI Builderthon, the record, August 2026 | NARU" },
  openGraph: {
    title: "Zero100 AI Builderthon, the record",
    description: OG_DESCRIPTION,
    url: "/2026-08",
    siteName: "나루 NARU",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero100 AI Builderthon, the record",
    description: OG_DESCRIPTION,
  },
};

// DECIDED 2026-10-08 (전체 리뷰 반영): 멈춘 시계(FROZEN_NOW)와 serverNow prop을 지웠습니다.
// 행사가 끝난 뒤로는 어느 시각을 넣어도 같은 화면이 나왔고, 그 시계를 읽던 라이브
// 표면도 Journey에서 함께 걷혔습니다. 이 페이지는 완전한 정적 기록입니다.

export default function August2026Archive() {
  return (
    // RegisterProvider는 이제 "이 기기에서 8월에 등록했었다"는 플래그 하나만 나릅니다
    // (lib/RegisterContext.tsx, 2026-10-08). 모달과 /api/register는 지웠습니다.
    <RegisterProvider>
      {/* 모바일 스티키 바의 자리(72px)를 예약하는 CSS가 <body>의 data-sticky를
          봅니다(app/globals.css). 나루 홈에는 스티키 바가 없어서 전역으로 걸면
          그 페이지 푸터 아래가 빈 채로 남습니다. 이 페이지만 켭니다. */}
      <StickyBarSpace />
      {/* First child: the ?reset=1 sweep runs before greeting/register read storage. */}
      <ResetHandler />
      <BackgroundMount />
      {/* DECIDED 2026-10-10 (사용자: "유형 테스트는 8월 페이지에서 보이지 않게, 12월과 혼동할 수 있음"): 헤더의 유형 테스트
          링크(데스크톱 줄, 폰 칩, 다시 온 사람 인사)를 그리지 않습니다. 12월에는 /match가 따로 있어 두 테스트가 섞여 보였습니다.
          /quiz 페이지는 주소로는 그대로 열립니다. */}
      <JourneyNav showQuiz={false} />
      <ArchiveBanner />
      <Journey />
    </RegisterProvider>
  );
}
