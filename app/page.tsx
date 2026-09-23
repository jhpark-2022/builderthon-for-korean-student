import type { Metadata } from "next";
import JourneyNav from "@/components/journey/JourneyNav";
import BackgroundMount from "@/components/BackgroundMount";
import NaruHome from "@/components/home/NaruHome";
import { naruNav } from "@/data/naru";
import { CrossingRegisterProvider } from "@/components/crossing/RegisterProvider";

// EN 탭 제목(2026-09-23). 서버 제목(한국어, layout의 기본값)은 그대로이고, LocaleContext가
// EN일 때 이 값으로 탭 제목을 바꿉니다.
export const metadata: Metadata = {
  other: { "naru:title-en": "Crossing Seoul 2026 | NARU" },
};

// ─────────────────────────────────────────────────────────────────────────────
// 나루 런칭 홈 (/).
//
// DECIDED 2026-09-15: 홈은 이벤트가 아니라 그룹입니다. 8월까지 이 자리에 있던
// 제로백 빌더톤은 /2026-08로 내려가 기록이 됐습니다. 이유는 그쪽 파일의 주석에
// 있습니다.
//
// 12월 이벤트는 제로백의 2회차가 아닙니다. 그 이벤트에서 나온 코어 2개를 잇는
// 다른 이벤트이고, 이름이 아직 없습니다(lib/naruDates.ts의 DECEMBER_EVENT_NAME).
//
// 이 페이지에 없는 것과 그 이유는 components/home/NaruHome.tsx 맨 위에
// 적어 두었습니다. 여기서는 배선만 봅니다.
//
// RegisterProvider가 없습니다. 홈에 등록이 없기 때문입니다. 12월 이벤트의 등록은 아직
// 열리지 않았고, 나루는 가입 폼을 두지 않습니다. 쓰지 않을 모달과 그 API 상태를
// 마운트하지 않습니다. JourneyNav는 이 프로바이더 없이도 그려지도록 고쳤습니다
// (lib/RegisterContext.tsx의 useRegisterOptional).
//
// ResetHandler도 없습니다. ?reset=1은 8월 회차의 등록·퀴즈 저장값을 쓸어내는
// 도구이고, 이 페이지에는 쓸어낼 저장값이 없습니다.
//
// revalidate가 없습니다. 이 페이지에는 시각에 반응하는 표면이 하나도 없어서
// 완전한 정적 페이지입니다. 12월 등록 창이 열리면 그때 다시 봐야 합니다.
// 그 시각은 lib/naruDates.ts가 갖게 하세요.
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      {/* 나루터 수면. 밤의 강과 건너편 등불 하나입니다.
          8월의 입자 필드는 그 회차의 것이라 /2026-08에 그대로 남습니다
          (lib/background/scene/BackgroundScene.ts의 variant 주석 참고). */}
      {/* DECIDED 2026-09-17 (배경 브리프): "건너는 점들"(crossing). 8월의 입자 엔진으로
          양쪽 기슭의 점들이 강을 건너 등불로 모이는 장면이었고, 이어서 기슭이
          싱가포르·서울 형상이 됐다가, 히어로에 행사 사진이 들어오며 형상을 껐습니다.
          DECIDED 2026-09-17 (사용자, 그날 저녁): 형상을 끄니 8월 필드의 잔잔한 입자
          층만 남아 "8월 거랑 너무 똑같다". 9/15의 강과 등불(water)로 돌아갑니다.
          crossing 변형과 형상 코드는 lib/background에 그대로 있습니다. */}
      <BackgroundMount variant="water" />
      {/* 앵커 목록과 로고를 나루의 것으로 넘깁니다. 기본값은 8월 페이지의
          것이라, /2026-08은 <JourneyNav /> 그대로 두고 아무것도 바뀌지
          않습니다. */}
      {/* showQuiz={false}: 유형 테스트는 8월 Day 1의 팀 매칭용 도구입니다.
          끝난 이벤트의 것이고 12월 이벤트와 관계가 없어요. 그 자리를 비우면
          폰에서 헤더에 액션이 하나도 없게 되므로, JourneyNav가 오픈채팅을
          lg 아래에서도 보이게 바꿉니다. /2026-08은 기본값(true)이라 그대로입니다. */}
      {/* 2026-09-18 (Supabase 등록 브리프 2.5): 크로싱 서울 등록 상태. 창이 닫혀 있는 동안
          (lib/registrationWindow.ts의 CROSSING_WINDOW가 null) 화면은 그 전과 같고 모달은
          열리지 않습니다. 8월 RegisterProvider와 별개. */}
      <CrossingRegisterProvider>
        <JourneyNav anchors={naruNav} brand="naru" showQuiz={false} />
        <NaruHome />
      </CrossingRegisterProvider>
    </>
  );
}
