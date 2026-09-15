import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "나루 NARU, Korean student builders in Singapore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ─────────────────────────────────────────────────────────────────────────────
// 홈의 공유 카드.
//
// DECIDED 2026-09-15: 이 카드의 글자는 전부 로마자입니다. 한글은 로고 안에
// 픽셀로만 들어갑니다.
//
// next/og(satori)는 시스템 서체를 쓰고, 그 런타임에 한글 글립이 있다는 보장이
// 없습니다. 없으면 두부(□□□)가 나오고, 공유 카드는 한 번 캐시되면 그 상태로
// 돌아다닙니다. 자체 호스팅하는 Pretendard도 답이 아니에요. satori는 woff2를
// 읽지 못하고 이 레포에 있는 것은 가변 woff2 하나뿐입니다.
//
// 그래서 브랜드의 한글 이름은 로고 PNG가 들고 옵니다. public/naru/의 마스터
// 반전은 이미 "나루"가 그려진 그림이라, 서체와 무관하게 언제나 같게 나옵니다.
// 로고를 SVG로 바꾸지 마세요. 그 SVG의 한글은 시스템 서체를 부릅니다
// (public/naru/README.md).
//
// 날짜를 이 파일에 직접 씁니다. lib/naruDates.ts를 import 하고 싶겠지만,
// 이 카드는 빌드 시점에 한 번 굳는 그림이고 문자열 하나뿐이라 포맷 함수를 들일
// 값이 없습니다. TODO: 12월 날짜가 바뀌면 이 줄도 함께 고치세요.
//
// "Next event"이지 "Next round"가 아닙니다. 12월은 제로백 빌더톤의 2회차가
// 아니라 다른 이벤트입니다. 이름이 정해지면 이 줄에 넣으세요.
// ─────────────────────────────────────────────────────────────────────────────
export default async function OpengraphImage() {
  // ImageResponse는 /public의 상대 경로를 가져오지 못하므로 파일을 읽어
  // data URI로 넣습니다.
  const logo = await readFile(join(process.cwd(), "public/naru/naru-master-rev.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "0 92px",
          // 로고 가이드: 반전 계열은 남색 계열 바탕에만.
          background:
            "radial-gradient(120% 100% at 22% 20%, #1B2A6B 0%, #12246B 34%, #0A1130 68%, #070B1F 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={300} height={300} alt="NARU" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#C79BB4",
            }}
          >
            NARU
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 18,
              fontSize: 60,
              fontWeight: 900,
              lineHeight: 1.12,
            }}
          >
            <span>You do the crossing.</span>
            <span style={{ color: "#EE8A4F" }}>We make the place.</span>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 27, color: "#B9C0DE" }}>
            Korean student builders in Singapore
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 1,
              color: "#ffffff",
            }}
          >
            Next event&nbsp;&nbsp;9 Dec 2026&nbsp;&nbsp;Seoul
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
