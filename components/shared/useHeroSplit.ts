"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";

// MOVED HERE 2026-09-17 (8월 문법 브리프). components/journey/Journey.tsx에서
// 정의만 옮겼습니다. 마크업과 클래스는 한 글자도 바뀌지 않았고, 8월 페이지는
// 같은 파일을 import 합니다. 나루 홈이 같은 문법을 쓰기 위해서입니다.
// Journey()의 히어로 패럴랙스 값 여섯을 훅 하나로. 반환값의 이름은 Journey.tsx가
// 쓰던 변수 이름 그대로라 그쪽의 JSX는 한 글자도 바뀌지 않았습니다.
export function useHeroSplit() {
    // Hero split — as the hero scrolls out, the two columns fly apart to the
    // left/right screen edges and fade, so the screen "opens" onto what's below.
    const heroRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress: heroProgress } = useScroll({
      target: heroRef,
      offset: ["start start", "end start"],
    });
    // Columns fly apart from the first scroll (0) but slide out slowly, over the
    // first 35% of the hero, so the motion is gentle. Fade tracks alongside.
    const leftX = useTransform(heroProgress, [0, 0.35], [0, -500]);
    const rightX = useTransform(heroProgress, [0, 0.35], [0, 500]);
    const heroFadeWide = useTransform(heroProgress, [0, 0.35], [1, 0]);
    // The ±500px horizontal fly-apart only makes sense in the lg+ two-up layout,
    // where the columns actually sit side by side. Below lg they stack into one
    // centred column, so translating them left/right just throws the content off
    // both screen edges and overlaps them (it looked broken on phones). Gate the
    // x-shift on the desktop layout; mobile keeps only the gentle opacity fade.
    const [isWide, setIsWide] = useState(false);
    useEffect(() => {
      const mq = window.matchMedia("(min-width: 1024px)");
      const sync = () => setIsWide(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      return () => mq.removeEventListener("change", sync);
    }, []);
    // Apply the horizontal split on the wide (two-up) layout only — it stays on
    // even under reduced-motion (by explicit request), so this is NOT gated on
    // `reduce`. Below lg the columns stack, so no horizontal shift there.
    const splitX = isWide;
    // Background video blurs early — in step with the columns flying apart — so the
    // whole hero softens as soon as the visitor starts scrolling.
    // NOTE: this scroll-linked `filter: blur()` on the (playing) hero video repaints
    // the video every frame and can cause scroll jank on weaker devices. It was
    // removed once for that reason, then restored by request. By request it also
    // stays on under reduced-motion (not gated on `reduce`).
    const bgBlur = useTransform(heroProgress, [0, 0.15], ["blur(0px)", "blur(10px)"]);
    // The scroll-linked opacity FADE is a DESKTOP effect (it plays as the two
    // columns fly apart). On mobile the hero stacks into one tall column with the
    // Countdown/Problem panel at the bottom — so scrolling to reach it is exactly
    // what the fade reacts to, dimming the panel before you can read it. Gate the
    // fade on the wide layout so mobile keeps the hero fully opaque and readable.
    // The background blur stays on everywhere (kept on mobile by request) — it's
    // behind the content, so it doesn't hurt readability.
    const heroFade = isWide ? heroFadeWide : undefined;
  return { heroRef, leftX, rightX, splitX, heroFade, bgBlur };
}
