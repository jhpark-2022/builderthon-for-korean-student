import { ImageResponse } from "next/og";
import { OG_BACKGROUND, OG_SIZE, loadOgFonts, publicPngDataUri } from "@/lib/ogCard";

export const alt = "제로백 빌더톤 Zero100 AI Builderthon 기록. 2026년 8월 22~29일 싱가포르. 74명 신청, 25팀 시작, 21팀 발표, 현업 멘토 14명.";
export const size = OG_SIZE;
export const contentType = "image/png";

// ─────────────────────────────────────────────────────────────────────────────
// /2026-08(제로백 빌더톤 기록)의 공유 카드.
//
// DECIDED 2026-10-14 (사용자: "공유했을 때의 설명과 이미지가 정말 수준이 높으면"):
// 전에는 서체를 싣지 않아 런타임의 가는 기본 서체로 그려졌고, "in Singapore."에 무지개식 그라데이션이
// 있었습니다(brand 10장 "무지개식 배색 금지"). 홈, /naru 카드와 같은 바탕과 서체로 다시 그립니다.
// 기록의 카드라 숫자가 주인공입니다(brand 5장 "숫자 하나가 문장을 대신할 수 있으면 숫자를 쓴다").
// 숫자는 brand 8장에 적힌 것만 씁니다. Day 1 참석 수는 자료마다 달라 쓰지 않습니다.
// 이 페이지에서는 제로백 빌더톤이 주인공이라 나루 로고를 얹지 않습니다(brand 6장).
// 같은 날 (사용자, 스크린숏: "zero100 로고도 있으면 좋겠음"): 왼쪽 위에 Zero100 워드마크를 둡니다. 원래 색(남색)은
// 잉크 바탕에서 보이지 않아 흰색판(public/partners/zero100-wordmark-white.png, 원본의 알파 그대로)입니다.
// 8월 페이지 헤더가 같은 워드마크를 brightness-0 invert로 희게 쓰는 것과 같은 결과입니다. 날짜 줄은 오른쪽으로.
// ─────────────────────────────────────────────────────────────────────────────
const STATS = [
  { n: "74", unit: "명", label: "신청" },
  { n: "25", unit: "팀", label: "시작" },
  { n: "21", unit: "팀", label: "마지막 날 발표" },
  { n: "14", unit: "명", label: "현업 멘토" },
];

export default async function OpengraphImage() {
  const [logoSrc, fonts] = await Promise.all([publicPngDataUri("partners/zero100-wordmark-white.png"), loadOgFonts()]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px 64px",
          ...OG_BACKGROUND,
          color: "#ffffff",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={228} height={48} alt="Zero100" />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", width: 12, height: 12, borderRadius: 6, backgroundColor: "#EE8A4F" }} />
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#A99AD6" }}>
            2026년 8월 22~29일, 싱가포르의 기록
          </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 900, letterSpacing: -3, lineHeight: 1.05 }}>
            제로백 빌더톤
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 26, fontWeight: 700, letterSpacing: 8, color: "#C99ACB" }}>
            ZERO100 AI BUILDERTHON
          </div>
        </div>

        {/* 숫자 넷. 헤어라인 위에 같은 폭으로 놓습니다. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.14)" }} />
          <div style={{ display: "flex", width: "100%", marginTop: 26 }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontSize: 56, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ display: "flex", marginLeft: 4, fontSize: 26, fontWeight: 700, color: "#E6E8F5" }}>{s.unit}</div>
                </div>
                <div style={{ display: "flex", marginTop: 10, fontSize: 26, fontWeight: 400, color: "#9AA3CE" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
