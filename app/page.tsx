import JourneyNav from "@/components/journey/JourneyNav";
import BackgroundMount from "@/components/BackgroundMount";
import NaruHome from "@/components/home/NaruHome";
import { naruNav } from "@/data/naru";

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
      <BackgroundMount />
      {/* 앵커 목록과 로고를 나루의 것으로 넘깁니다. 기본값은 8월 페이지의
          것이라, /2026-08은 <JourneyNav /> 그대로 두고 아무것도 바뀌지
          않습니다. */}
      <JourneyNav anchors={naruNav} brand="naru" />
      <NaruHome />
    </>
  );
}
