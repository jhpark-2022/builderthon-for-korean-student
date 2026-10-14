// /naru의 공유 카드. 바탕, 서체, 바닥 줄의 문법은 홈 카드(app/opengraph-image.tsx)와 같습니다.
import { ImageResponse } from "next/og";
import { OG_BACKGROUND, OG_SIZE, loadOgFonts, publicPngDataUri } from "@/lib/ogCard";

export const alt = "나루 NARU. 한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 그룹.";
export const size = OG_SIZE;
export const contentType = "image/png";

// ─────────────────────────────────────────────────────────────────────────────
// DECIDED 2026-10-14 (사용자: "공유했을 때의 설명과 이미지가 정말 수준이 높으면"):
// 전에는 영문 "NARU"가 가장 컸고 한글 "나루"는 왼쪽 위 락업에만 작게 있었습니다. brand 6장은
// "한글 '나루'가 주, 영문 NARU가 보조, 항상 나루가 먼저"입니다. 그래서 큰 글자를 "나루"로 바꾸고,
// 오른쪽에 마스터 로고(v2, 링과 양옆 주황 점)를 둡니다. 그룹의 카드라 이 자리에서만 마스터를 씁니다.
// 로고 가이드의 최소 가로 120px: 카드가 폭 500px로 줄어도 마스터는 약 150px입니다(brand 10장).
// 반전 로고는 남색 계열 바탕에만 얹습니다. 이 바탕이 사이트의 잉크입니다.
//
// 가운데 문장은 정의문의 짧은 판 그대로입니다(brand 1장). 새 문장을 쓰지 않습니다.
// 바닥 오른쪽은 관계 한 문장(brand 6장)의 뒤 절입니다. 영문 부제는 마스터 로고의 링이 이미 말합니다.
// ─────────────────────────────────────────────────────────────────────────────
export default async function OpengraphImage() {
  const [masterSrc, fonts] = await Promise.all([publicPngDataUri("naru/naru-master-v3-rev.png"), loadOgFonts()]);

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
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
              <div style={{ display: "flex", fontSize: 168, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>나루</div>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 10, color: "#A99AD6" }}>NARU</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 40,
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 1.4,
                color: "#E6E8F5",
              }}
            >
              <div style={{ display: "flex" }}>한국에 뿌리를 두고 학생이 직접 운영하는,</div>
              <div style={{ display: "flex" }}>영리를 목적으로 하지 않는 그룹</div>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={masterSrc} width={330} height={330} alt="" style={{ marginRight: -24 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.14)" }} />
          <div
            style={{
              display: "flex",
              width: "100%",
              marginTop: 24,
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 26,
              fontWeight: 400,
              color: "#9AA3CE",
            }}
          >
            <div style={{ display: "flex" }}>건너는 건 각자가 한다. 자리는 우리가 만든다.</div>
            <div style={{ display: "flex" }}>2026년 12월, 크로싱 서울을 엽니다</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
