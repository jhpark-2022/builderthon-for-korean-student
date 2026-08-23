import JourneyNav from "@/components/journey/JourneyNav";
import Journey from "@/components/journey/Journey";
import ResetHandler from "@/components/ResetHandler";
import BackgroundMount from "@/components/BackgroundMount";
import { RegisterProvider } from "@/lib/RegisterContext";

// ── 이 페이지가 서버 컴포넌트인 이유 ────────────────────────────────────────
// DECIDED 2026-08-24: 히어로 라이브 스트립 하이드레이션 밀림 제거 — 서버가
// 자기 시각을 내려보내고(serverNow) 클라이언트가 그대로 그린 뒤 보정한다.
// / 는 정적 프리렌더에서 ISR(revalidate 300)로 바뀐다.
//
// 라이브 표면(히어로 스트립·라이브 필·노선도 진행 효과·데이 카드 3상태)은 서버에
// "지금"이 없어서 전부 마운트 후에야 나타났습니다. 폰에서 그 순간 히어로 아래
// 본문과 CTA가 165px 밀렸어요 — 첫 화면에서 누르려던 버튼이 손가락 밑에서
// 내려앉습니다.
//
// 자리를 비워 두는 방법(min-height)은 답이 아니었습니다. 스트립은 날에 따라 한
// 줄에서 세 줄까지 오가고, 행사 전·후에는 아예 없어서 어떤 고정 높이를 잡아도
// 어느 국면에선가 빈 구멍이 남습니다.
//
// 그래서 서버가 자기 시각을 실어 보냅니다. 서버 HTML이 그 시각으로 그려지고,
// 클라이언트의 첫 렌더도 같은 prop을 받아 똑같이 그립니다 — 마크업이 일치하니
// 하이드레이션 불일치도, 밀림도 없습니다. 그 다음 useEffect가 방문자의 진짜
// 시각으로 보정해요(Journey의 useEventDay 참고).
//
// revalidate 300: 캐시된 HTML이 최대 5분 낡습니다. 하루 단위 신호라 이 정도로는
// 틀리지 않고(SG 자정 직후 5분이 유일한 창인데, 그마저 마운트 직후 보정됩니다),
// 대신 페이지는 여전히 CDN에서 통째로 나갑니다.
// 0으로 내리지 마세요 — 방문마다 서버 렌더가 돌면 얻는 것 없이 비용만 듭니다.
export const revalidate = 300;

export default function Home() {
  // 서버가 읽는 단 한 번의 "지금". 아래로 내려가는 유일한 시각 소스입니다 —
  // 컴포넌트 안에서 Date를 또 읽으면 그 자리만 하이드레이션이 어긋납니다.
  const serverNow = Date.now();
  return (
    // RegisterProvider owns the single register-modal instance shared by the hero
    // hook, the scroll-revealed nav button, and the ?register=1 auto-open.
    <RegisterProvider>
      {/* First child: the ?reset=1 sweep runs before greeting/register read storage. */}
      <ResetHandler />
      <BackgroundMount />
      <JourneyNav />
      <Journey serverNow={serverNow} />
    </RegisterProvider>
  );
}
