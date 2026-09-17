// ─────────────────────────────────────────────────────────────────────────────
// 노선도, 일반형 (2026-09-17, 8월 문법 브리프).
//
// 8월 페이지의 RouteMap(Journey.tsx)은 8일짜리 스케줄과 라이브 시계(오늘·지나온 날),
// 장소 로고, 데이 모달 버튼에 묶여 있어서 그대로 꺼내면 홈에서 쓸 수 없습니다.
// 여기 있는 것은 그 노선도의 **문법**입니다: 레일 한 줄, 정거장 노드 세 층(★ 앵커 /
// ◉ 스포트라이트 / ○ 보통), 노드 아래 이름, 앵커 아래 배지, 레일 아래 초록 필,
// 범례 한 줄. 노드와 레일의 클래스는 Journey.tsx의 것과 같은 문자열입니다.
// 8월 페이지는 자기 RouteMap을 그대로 씁니다(픽셀 회귀 0이 조건).
//
// 정거장 수는 prop이 정합니다. 레일의 양끝 inset은 한 칸의 절반(50/n %)이라 노드
// 중심에서 노드 중심까지 이어집니다.
// ─────────────────────────────────────────────────────────────────────────────
export type RouteStation = {
  key: string;
  /** 노드 위 작은 줄. "DAY 1" 자리. 없으면 그리지 않습니다. */
  sub?: string;
  /** 노드 아래 이름. */
  label: string;
  kind: "anchor" | "spot" | "plain";
  /** 앵커 노드 아래 배지("★ 제출" 같은). 앵커일 때만. */
  badge?: string;
};

export default function RouteMap({
  stations,
  pill,
  legend,
  ariaLabel,
  className = "",
}: {
  stations: RouteStation[];
  /** 레일 아래 초록 필. 8월의 "1:1 멘토링 Day 3~7 매일 열려 있어요" 자리. */
  pill?: string;
  legend?: { anchor: string; plain: string; spot?: string };
  ariaLabel?: string;
  className?: string;
}) {
  const n = Math.max(1, stations.length);
  const inset = `${50 / n}%`;
  return (
    <div className={className}>
      <ol
        aria-label={ariaLabel}
        className={`relative flex items-start ${pill ? "pb-10" : "pb-2"}`}
      >
        {/* 레일. top-[1.625rem]은 노드 줄의 중심(py-2.5 + h-8의 절반). */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-[1.625rem] h-px bg-gradient-to-r from-rose-300/40 via-white/15 to-rose-300/40"
          style={{ left: inset, right: inset }}
        />
        {stations.map((s) => {
          const anchor = s.kind === "anchor";
          const spot = s.kind === "spot";
          return (
            <li key={s.key} className="relative flex-1">
              <div className="flex w-full flex-col items-center gap-1.5 px-1 py-2.5 text-center">
                <span className="relative flex h-8 items-center justify-center">
                  {anchor ? (
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-rose-300/50 bg-rose-400/25 text-[0.6rem] text-rose-100 shadow-[0_0_0_4px_rgba(10,6,20,0.85)]">
                      <span aria-hidden>★</span>
                    </span>
                  ) : spot ? (
                    <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-violet-300/60 bg-violet-400/20 shadow-[0_0_0_4px_rgba(10,6,20,0.85)]">
                      <span aria-hidden className="h-2 w-2 rounded-full bg-violet-200" />
                    </span>
                  ) : (
                    <span className="relative h-3 w-3 rounded-full border border-white/35 bg-[#0a0614] shadow-[0_0_0_4px_rgba(10,6,20,0.85)]" />
                  )}
                </span>
                {s.sub && (
                  <span className={`text-[0.62rem] font-bold leading-none ${anchor ? "text-rose-200" : spot ? "text-violet-200" : "text-white/55"}`}>
                    {s.sub}
                  </span>
                )}
                <span className={`break-keep text-[0.68rem] leading-tight ${anchor || spot ? "font-bold text-white" : "text-white/75"}`}>
                  {s.label}
                </span>
                {anchor && s.badge && (
                  <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 text-[0.58rem] font-bold leading-none text-rose-200">
                    {s.badge}
                  </span>
                )}
              </div>
            </li>
          );
        })}
        {pill && (
          <span className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center">
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-400/[0.1] px-2.5 py-1 text-[0.72rem] font-semibold leading-none text-emerald-100">
              <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full bg-emerald-400/80" />
              {pill}
            </span>
          </span>
        )}
      </ol>
      {legend && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-[0.66rem] text-rose-200/85">
            <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-rose-300/50 bg-rose-400/25 text-[0.42rem] text-rose-100">★</span>
            {legend.anchor}
          </span>
          <span className="flex items-center gap-1.5 text-[0.66rem] text-white/50">
            <span aria-hidden className="h-2 w-2 rounded-full border border-white/35" />
            {legend.plain}
          </span>
          {legend.spot && (
            <span className="flex items-center gap-1.5 text-[0.66rem] text-violet-200/85">
              <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-violet-300/60 bg-violet-400/20">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-200" />
              </span>
              {legend.spot}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
