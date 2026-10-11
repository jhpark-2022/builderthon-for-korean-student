import type { Metadata } from "next";
import JourneyNav from "@/components/journey/JourneyNav";
import BackgroundMount from "@/components/BackgroundMount";
import NaruPage from "@/components/naru/NaruPage";
import { naru, naruPageNav, naruPageBack } from "@/data/naru";
import { ORGANIZATION_LD } from "@/lib/organizationLd";

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
// 설명은 이 페이지 머리의 한 줄(이름 풀이, naru.group.name) 그대로입니다. 새 문장을 쓰지 않습니다.
// title은 absolute입니다. 레이아웃의 template("%s | 나루 NARU")을 타면 이름이 두 번 붙습니다.
export const metadata: Metadata = {
  title: { absolute: "나루 NARU" },
  description: naru.group.name.ko,
  alternates: { canonical: "/naru" },
  other: { "naru:title-en": "NARU" },
  openGraph: {
    title: "나루 NARU",
    description: naru.group.name.en,
    url: "/naru",
    siteName: "나루 NARU",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "나루 NARU", description: naru.group.name.en },
};

const NARU_LD = { "@context": "https://schema.org", "@graph": [ORGANIZATION_LD] };

export default function NaruGroupPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(NARU_LD).replace(/</g, "\\u003c") }} />
      {/* DECIDED 2026-10-10 (구조 브리프 4, D3): 홈과 같은 water 변형의 정지 장면입니다. 새 셰이더는 없습니다.
          DECIDED 2026-10-11 (사용자): 형상은 서울이 아니라 싱가포르입니다. 처음부터 완성돼 있고 건너기는 없습니다.
          형상은 판 뒤에서 사라지고 틈에서만 보입니다. */}
      <BackgroundMount variant="water" still />
      <JourneyNav anchors={naruPageNav} brand="naru" showQuiz={false} back={naruPageBack} />
      <NaruPage />
    </>
  );
}
