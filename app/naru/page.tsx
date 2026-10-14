import type { Metadata } from "next";
import JourneyNav from "@/components/journey/JourneyNav";
import BackgroundMount from "@/components/BackgroundMount";
import NaruPage from "@/components/naru/NaruPage";
import { naru, naruPageNav } from "@/data/naru";
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
const NARU_OG_DESCRIPTION =
  "한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹입니다. 크로싱 서울은 나루가 직접 여는 첫 자리입니다.";

export const metadata: Metadata = {
  title: { absolute: "나루 NARU" },
  description: naru.group.name.ko,
  alternates: { canonical: "/naru" },
  other: { "naru:title-en": "NARU" },
  // DECIDED 2026-10-14 (사용자: 공유 카드의 수준): 공유 카드의 설명은 영문 어원 풀이였습니다. 한국어 제목 아래 영문이
  // 나왔고, 무엇을 하는 그룹인지가 없었습니다. 정의 짧은 판과 관계 한 문장의 뒤 절(brand 1장, 6장)을 그대로 씁니다.
  openGraph: {
    title: "나루 NARU",
    description: NARU_OG_DESCRIPTION,
    url: "/naru",
    siteName: "나루 NARU",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "나루 NARU", description: NARU_OG_DESCRIPTION },
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
      <JourneyNav anchors={naruPageNav} brand="naru" showQuiz={false} page="naru" />
      <NaruPage />
    </>
  );
}
