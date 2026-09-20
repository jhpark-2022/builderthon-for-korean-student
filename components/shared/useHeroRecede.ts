"use client";

import { useEffect, useState } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈 히어로의 스크롤 효과 (ADDED 2026-09-20, 사용자: "여기서 스크롤해서
// 아래로 내려갈 때 애니메이션이 있으면 좋겠어. 8월 페이지를 참고하되 같은
// 효과는 아니게").
//
// DECIDED 2026-09-20 (사용자가 셋 중에 고름): **깊이**입니다. 카피가 먼저 위로
// 올라가며 사라지고, 사진 넷은 느리게 따라오며 살짝 작아집니다. 두 단의 속도가
// 다른 것이 전부이고, 세로축 하나만 씁니다.
//
// 8월(useHeroSplit)과 무엇이 다른가:
//   8월  두 단이 좌우로 ±500px 벌어지고, 배경 영상이 blur(10px)까지 흐려집니다.
//   홈   좌우로 움직이지 않습니다. 흐림도 없습니다. 카피 -80px, 사진 -24px.
// 2026-09-19에 홈이 8월의 훅을 그대로 썼다가 사용자가 "8월 페이지와 같은 효과,
// 마음에 안 듦"으로 걷어냈습니다. 그 결정은 유효합니다. 이 훅은 그것을 되살리는
// 것이 아니라 다른 축의 다른 효과입니다.
//
// 흐림을 쓰지 않는 이유: 8월 훅의 주석이 적어 둔 그대로입니다. 스크롤에 물린
// filter: blur()는 매 프레임 재페인트라 약한 기기에서 스크롤이 끊깁니다.
// 여기서는 transform과 opacity만 씁니다. 둘 다 합성 단계에서 끝납니다.
//
// ── 왜 useScroll의 target이 아니라 페이지 scrollY인가 ───────────────────────
// target + offset ["start start", "end start"]로 잡으면 진행도 0이 "대상의 위가
// 뷰포트 위에 닿는 순간"입니다. 이 히어로는 헤더와 챕터 패딩 아래에서 시작해서
// 스크롤 0에서 이미 200px쯤 내려와 있어요. 그러면 처음 200px을 내리는 동안
// 아무 일도 일어나지 않습니다. 사용자가 본 것은 "스크롤하면 바로"입니다.
// 페이지 scrollY를 직접 읽으면 첫 픽셀부터 반응합니다.
//
// 구간의 단위가 뷰포트 높이인 이유: 히어로의 높이가 화면 높이를 따라가기
// 때문입니다. px로 박으면 13인치와 27인치에서 다른 지점에 사라집니다.
//
// ── 끄는 조건 둘 ────────────────────────────────────────────────────────────
// 1. lg 아래. 폰에서는 히어로가 한 단으로 쌓여서 카피 다음에 카운트다운과 사진이
//    옵니다. 그것을 읽으려고 스크롤하는 것인데 그 스크롤이 바로 글자를 지웁니다.
//    8월 훅이 같은 이유로 페이드를 데스크톱 전용으로 두었습니다.
// 2. prefers-reduced-motion. 8월 것은 사용자 요청으로 이 설정을 무시하지만,
//    새로 만드는 효과의 기본값은 존중입니다.
//
// 푸터의 "배경 움직임 끄기"(MotionToggle)는 보지 않습니다. 그 손잡이는 WCAG
// 2.2.2, 즉 **저절로 시작해서 5초를 넘기는** 움직임에 대한 것이고 배경 캔버스가
// 그 대상입니다. 이 효과는 스크롤하는 동안만 움직이고 손을 떼면 멈춥니다.
// 저절로 시작하지 않으니 2.2.2의 대상이 아니고, 가려야 할 사람은 1번과 2번이
// 이미 가립니다.
// ─────────────────────────────────────────────────────────────────────────────
export function useHeroRecede() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  // 뷰포트 높이. 서버와 첫 렌더가 같아야 해서 기본값을 두고 마운트 뒤에 보정합니다
  // (LocaleProvider와 같은 패턴). 900은 이 사이트를 재는 기준 화면입니다.
  const [vh, setVh] = useState(900);
  const [isWide, setIsWide] = useState(false);
  useEffect(() => {
    const sync = () => {
      setVh(window.innerHeight);
      setIsWide(window.matchMedia("(min-width: 1024px)").matches);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // 카피는 멀리 그리고 먼저, 사진은 조금 그리고 나중에. 그 차이가 깊이입니다.
  // 페이드가 0.25vh에서 시작하는 이유: 첫 스크롤에 글자가 바로 옅어지면 읽다가
  // 멈춘 사람에게는 고장으로 보입니다. 처음 4분의 1 화면은 자리만 옮깁니다.
  const copyY = useTransform(scrollY, [0, vh], [0, -80]);
  const copyOpacity = useTransform(scrollY, [vh * 0.25, vh * 0.85], [1, 0]);
  const photoY = useTransform(scrollY, [0, vh], [0, -24]);
  const photoScale = useTransform(scrollY, [0, vh], [1, 0.94]);
  const photoOpacity = useTransform(scrollY, [vh * 0.35, vh * 0.95], [1, 0]);

  const on = isWide && !reduce;
  return {
    on,
    copyY: on ? copyY : undefined,
    copyOpacity: on ? copyOpacity : undefined,
    photoY: on ? photoY : undefined,
    photoScale: on ? photoScale : undefined,
    photoOpacity: on ? photoOpacity : undefined,
  };
}
