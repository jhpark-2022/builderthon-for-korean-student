"use client";

import { useEffect, useState } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈 히어로의 스크롤 효과 (ADDED 2026-09-20, 사용자: "여기서 스크롤해서
// 아래로 내려갈 때 애니메이션이 있으면 좋겠어. 8월 페이지를 참고하되 같은
// 효과는 아니게").
//
// DECIDED 2026-09-20 (사용자가 셋 중에 고름): **깊이**입니다. 제목이 먼저 위로
// 물러나며 사라지고, 사진 넷은 훨씬 느리게 따라오며 살짝 작아집니다. 두 단의
// 속도 차이가 전부이고, 세로축 하나만 씁니다.
//
// 8월(useHeroSplit)과 무엇이 다른가:
//   8월  두 단이 좌우로 ±500px 벌어지고, 배경 영상이 blur(10px)까지 흐려집니다.
//   홈   좌우로 움직이지 않습니다. 흐림도 없습니다.
// 2026-09-19에 홈이 8월의 훅을 그대로 썼다가 사용자가 "8월 페이지와 같은 효과,
// 마음에 안 듦"으로 걷어냈습니다. 그 결정은 유효합니다. 이 훅은 그것을 되살리는
// 것이 아니라 다른 축의 다른 효과입니다.
//
// 흐림을 쓰지 않는 이유: 8월 훅의 주석이 적어 둔 그대로입니다. 스크롤에 물린
// filter: blur()는 매 프레임 재페인트라 약한 기기에서 스크롤이 끊깁니다.
// 여기서는 transform과 opacity만 씁니다. 둘 다 합성 단계에서 끝납니다.
//
// 푸터의 "배경 움직임 끄기"(MotionToggle)는 보지 않습니다. 그 손잡이는 WCAG
// 2.2.2, 즉 저절로 시작해서 5초를 넘기는 움직임에 대한 것이고 배경 캔버스가
// 그 대상입니다. 이 효과는 스크롤하는 동안만 움직이고 손을 떼면 멈춥니다.
//
// ── 왜 구간을 옮겼나 (DECIDED 2026-09-20, 히어로 효과 수정 브리프) ──────────
// 전 버전은 값이 정확했는데 보이지 않았습니다. 데스크톱 페이드 구간이 스크롤
// 225~765px이었고, 제목(문서 90~290)은 90px 헤더 위로 스크롤 200px에 이미
// 사라집니다. 페이드가 시작되기 전에 페이드할 것이 없었어요. 실제로 페이드된
// 것은 스크롤 765px에 아직 164px 화면에 남아 있던 카운트다운 패널입니다.
// 폰은 더 심해서, 효과 구간(스크롤 518~666px) 동안 보이는 것이 96px짜리
// 띠 하나였습니다. 처음 440px 동안은 measured transform이 none이었습니다.
//
// 그래서 대상을 블록 전체가 아니라 **제목 묶음**으로 좁힙니다. 높이 839px짜리
// 블록은 위와 아래가 839px 간격으로 화면을 떠나서, 둘 다 만족하는 불투명도
// 구간이 존재하지 않습니다. CTA와 카운트다운은 이제 건드리지 않습니다.
// "읽고 누를 것을 지우지 않는다"는 원래 의도가 여기서 더 잘 지켜집니다.
//
// 폰과 데스크톱이 같은 축(페이지 scrollY)을 씁니다. 갈리는 것은 구간과 폭뿐이고
// 코드 경로는 하나입니다. 전 버전의 useHeroExit는 useScroll({ target })으로
// **자기가 y를 거는 바로 그 요소**를 재고 있었습니다. 요소가 움직이면 경계
// 상자도 같이 움직이고 진행도가 다시 계산되는 되먹임이라, 폭을 키우면 바로
// 드러납니다. 그래서 지웠습니다. useScroll에 target을 주지 마세요.
//
// 합격 기준(브리프 3.1): 불투명도 0.5 지점에서 요소 높이의 35% 이상이 헤더
// 아래 화면 안. 불투명도 0.3 아래에서 누를 수 있는 것이 화면에 없을 것.
// 값을 바꾸려면 이 둘을 다시 재세요.
// ─────────────────────────────────────────────────────────────────────────────
export function useHeroRecede() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [isWide, setIsWide] = useState(true); // 데스크톱 우선. 아래 주석 참고.
  useEffect(() => {
    const sync = () => setIsWide(window.matchMedia("(min-width: 1024px)").matches);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // 제목 묶음. 데스크톱은 스크롤 300px, 폰은 260px 안에 끝납니다. 둘 다 그
  // 구간 내내 제목이 화면에 있습니다(브리프 1장 지오메트리).
  const end = isWide ? 300 : 260;
  const titleY = useTransform(scrollY, [0, end], [0, isWide ? -120 : -60]);
  // 첫 40px은 자리만 옮깁니다. 첫 픽셀에 글자가 옅어지면 고장으로 보입니다.
  const titleOpacity = useTransform(scrollY, [40, end], [1, 0]);

  // 사진 단(데스크톱 오른쪽, 문서 240~779). 아래쪽이 화면을 떠나는 것이 스크롤
  // 689px이라 거기서 끝냅니다. 0이 아니라 0.2에서 멈추는 이유: 0까지 내리면
  // 아직 화면에 있는 동안 사라집니다(합격 기준 2번).
  const photoY = useTransform(scrollY, [0, 700], [0, -48]);
  const photoScale = useTransform(scrollY, [0, 700], [1, 0.92]);
  const photoOpacity = useTransform(scrollY, [200, 700], [1, 0.2]);

  // 폰의 두 번째 블록(카운트다운 + 사진, 문서 702~1155). 아래쪽이 떠나는 것이
  // 스크롤 1,155px입니다. 카운트다운 숫자를 읽는 중에 지우지 않도록 늦게 시작해
  // 0.25에서 멈춥니다.
  const stackY = useTransform(scrollY, [450, 1050], [0, -40]);
  const stackOpacity = useTransform(scrollY, [650, 1100], [1, 0.25]);

  // 페이드는 두 화면 모두. 움직임만 prefers-reduced-motion을 봅니다.
  // 이 설정이 막으려는 것은 움직임이고, 투명도 변화는 움직임의 대체로 권장되는
  // 쪽입니다(전 버전의 판단 그대로).
  const move = !reduce;
  return {
    titleY: move ? titleY : undefined,
    titleOpacity,
    photoY: move ? photoY : undefined,
    photoScale: move ? photoScale : undefined,
    photoOpacity,
    stackY: move ? stackY : undefined,
    stackOpacity,
  };
}

// isWide의 기본값이 true인 것은 첫 프레임 때문입니다. false로 시작하면
// 데스크톱에서도 첫 렌더가 폰 구간(260px)을 타고 useEffect 뒤에 바뀝니다.
// 기본값을 데스크톱 쪽에 두면 폰에서 한 프레임 동안 300px 구간을 쓰는데,
// 그 한 프레임은 스크롤 0이라 두 구간의 값이 같습니다(y 0, 불투명도 1).
// 반대 방향은 값이 다릅니다.
