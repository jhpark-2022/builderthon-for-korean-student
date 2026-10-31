"use client";

import type { Phrase } from "@/data/dictionaryCore";

export type ShapeCampus = { name: Phrase; src: string; w: number; h: number; u: number; v: number; size: number };

/**
 * 배경 형상 안의 대학교 휘장(DECIDED 2026-10-22 서울, 2026-10-23 싱가포르). 형상 위 각 캠퍼스 자리에 놓이고
 * 커서 빛의 원 안에서만 보입니다. 자리와 빛은 배경(BackgroundScene)이 이 요소의 CSS 변수로 매 프레임 넣습니다:
 *   --sx, --sy  형상 중심(px, 화면 왼쪽 위 기준)   --ss  형상 반너비(px)
 *   --lx, --ly  빛의 자리(px)                     --lr  빛의 반경(px)
 *   --on        켜진 정도 0..1(커서 빛 구간에서 마우스가 화면 안에 있을 때)
 * id는 배경이 찾는 이름입니다(seoul-campuses, singapore-campuses).
 * 마우스가 있는 화면에서만 그립니다. touch면 폰에서도 그립니다(/naru 히어로에서는 커서 없이 늘 보이므로, DECIDED 2026-10-23 사용자:
 * "모바일 view에는 적용이 안 돼 있는 것 같은데"). 꾸밈이라 보조 기술에는 숨깁니다.
 */
export default function ShapeCampuses({ id, campuses, touch = false, spreadOnPhone = false }: { id: string; campuses: ShapeCampus[]; touch?: boolean; spreadOnPhone?: boolean }) {
  return (
    <div
      id={id}
      aria-hidden
      // DECIDED 2026-10-23 (사용자: "모바일에서 보이는 학교들 로고들 더 키워줘", /naru와 홈 둘 다): 폰(sm 아래)에서는 형상 자체가 작아 휘장이 25px쯤이라
      // 1.8배로 키웁니다(--crest-k). sm부터는 1. 자리는 그대로이고 휘장만 큽니다.
      // 이어서 (사용자: "크기는 해도, 로고들끼리 겹치면 안 됨"): 커진 뒤 싱가포르 셋이 폰에서 서로 닿았습니다(NUS가 NTU, SMU와 5~9px 겹침).
      // spreadOnPhone이면 폰에서 자리를 형상 중심에서 1.5배 밖으로 벌립니다(--crest-spread). 서울 다섯은 겹치지 않아 벌리지 않습니다(2026-10-31 서울시립대를 더한 뒤에도 폰, 데스크톱에서 겹침 0).
      className={`pointer-events-none fixed inset-0 [--crest-k:1.8] sm:[--crest-k:1] ${spreadOnPhone ? "[--crest-spread:1.5] sm:[--crest-spread:1]" : ""} ${touch ? "block" : "hidden [@media(hover:hover)_and_(pointer:fine)]:block"}`}
      style={{
        opacity: "var(--on, 0)",
        WebkitMaskImage: "radial-gradient(circle var(--lr, 0px) at var(--lx, -999px) var(--ly, -999px), #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)",
        maskImage: "radial-gradient(circle var(--lr, 0px) at var(--lx, -999px) var(--ly, -999px), #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)",
      }}
    >
      {campuses.map((c) => {
        const left = `calc(var(--sx, 50vw) + var(--ss, 0px) * ${c.u} * var(--crest-spread, 1))`;
        const top = `calc(var(--sy, 50vh) - var(--ss, 0px) * ${c.v} * var(--crest-spread, 1))`;
        const h = `calc(var(--ss, 0px) * ${c.size} * var(--crest-k, 1))`;
        return (
          <div key={c.name.en}>
            {/* DECIDED 2026-10-23 (사용자: "그 점 없애줘"): 캠퍼스 자리에 찍던 점(h-1.5, hi0)을 뺐습니다. 휘장은 전과 같은 자리(그 점이 있던
                곳 바로 위)에 그대로 섭니다. 흰 휘장의 모양만 빌려 hi0로 칠합니다(마스크). */}
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
