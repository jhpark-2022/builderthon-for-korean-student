import JourneyNav from "@/components/journey/JourneyNav";
import BackgroundMount from "@/components/BackgroundMount";
import NaruPage from "@/components/naru/NaruPage";
import { naruPageNav, naruPageBack } from "@/data/naru";

// ─────────────────────────────────────────────────────────────────────────────
// /naru: 그룹 나루의 페이지.
//
// DECIDED 2026-10-10 (사용자: "나루와 크로싱 서울이 한 페이지에 있어 혼동된다. 나루 내용은 전부 다른 탭으로",
// 구조 브리프): 홈(/)은 크로싱 서울(이벤트)만 말합니다. 그룹의 소개, 8월 요약, 변하지 않는 두 개, 어떻게 일하는가,
// 왜 이 자리가 필요한가, 매니페스토는 전부 여기 있습니다. 글은 홈에 있던 그대로입니다(components/naru/NaruPage.tsx).
//
// 헤더는 홈과 같은 JourneyNav(brand="naru")이고 목차만 이 페이지의 넷입니다. 왼쪽에 홈으로 돌아가는 줄이 있습니다.
// 등록 프로바이더는 없습니다. 이 페이지에는 등록 버튼이 없습니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function NaruGroupPage() {
  return (
    <>
      <BackgroundMount variant="water" />
      <JourneyNav anchors={naruPageNav} brand="naru" showQuiz={false} back={naruPageBack} />
      <NaruPage />
    </>
  );
}
