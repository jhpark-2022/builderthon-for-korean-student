"use client";

import { seoulCampuses } from "@/data/naru";

/**
 * 서울 안의 대학교 휘장(DECIDED 2026-10-22, data/naru.ts seoulCampuses). 함께하는 곳 뒤의 서울 형상 위, 각 캠퍼스 자리에 놓이고
 * 커서 빛의 원 안에서만 보입니다. 자리와 빛은 배경(BackgroundScene)이 이 요소의 CSS 변수로 매 프레임 넣습니다:
 *   --sx, --sy  서울 형상 중심(px, 화면 왼쪽 위 기준)   --ss  형상 반너비(px)
 *   --lx, --ly  빛의 자리(px)                          --lr  빛의 반경(px)
 *   --on        켜진 정도 0..1(함께하는 곳에서 마우스가 화면 안에 있을 때)
 * 마우스가 있는 화면에서만 그립니다. 꾸밈이라 보조 기술에는 숨깁니다.
 */
export default function SeoulCampuses() {
  return (
    <div
      id="seoul-campuses"
      aria-hidden
      className="pointer-events-none fixed inset-0 hidden [@media(hover:hover)_and_(pointer:fine)]:block"
      style={{
        opacity: "var(--on, 0)",
        WebkitMaskImage: "radial-gradient(circle var(--lr, 0px) at var(--lx, -999px) var(--ly, -999px), #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)",
        maskImage: "radial-gradient(circle var(--lr, 0px) at var(--lx, -999px) var(--ly, -999px), #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)",
      }}
    >
      {seoulCampuses.map((c) => {
        const left = `calc(var(--sx, 50vw) + var(--ss, 0px) * ${c.u})`;
        const top = `calc(var(--sy, 50vh) - var(--ss, 0px) * ${c.v})`;
        const h = `calc(var(--ss, 0px) * ${c.size})`;
        return (
          <div key={c.name.en}>
            {/* 캠퍼스 자리의 점. 서울 가장자리 점과 같은 hi0(#C79BB4)라 표의 로고가 아니라 지도의 일부로 읽힙니다. */}
            <span className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C79BB4]" style={{ left, top }} />
            {/* 휘장은 그 점 바로 위. 흰 휘장의 모양만 빌려 hi0로 칠합니다(마스크). */}
            <span
              className="absolute -translate-x-1/2 bg-[#C79BB4]"
              style={{
                left,
                top: `calc(${top} - ${h} - 10px)`,
                height: h,
                aspectRatio: `${c.w} / ${c.h}`,
                WebkitMaskImage: `url(${c.src})`,
                maskImage: `url(${c.src})`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
