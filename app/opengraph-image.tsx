import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "CROSSING SEOUL, 18–22 Dec 2026. 나루 NARU, Korean student builders.";
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
// 그래서 브랜드의 한글 이름은 로고 PNG가 들고 옵니다. public/naru/의 반전
// 락업은 이미 "나루"가 그려진 그림이라, 서체와 무관하게 언제나 같게 나옵니다.
// 로고를 SVG로 바꾸지 마세요. 그 SVG의 한글은 시스템 서체를 부릅니다
// (public/naru/README.md).
//
// ── 2026-09-19 (사용자: "링크를 외부로 공유했을 때 나오는 이미지가 안 예쁘다") ──
// 전에는 지름 300px 원형 마스터 로고가 왼쪽 절반을 먹고, 오른쪽에 크기가 다른
// 다섯 줄이 쌓여 있었습니다. 텔레그램·카카오의 카드는 폭 500px 남짓으로 줄어
// 표시되고, 그 크기에서 다섯 줄은 전부 회색 덩어리가 됩니다.
//
// 그래서 한 장에 한 가지만 크게 말합니다. 공유되는 이유는 12월 이벤트이므로
// 이벤트 이름이 가장 큽니다(96px). 로고는 이름만 들어간 가로 락업으로 왼쪽 위에
// 작게(높이 48px), 원형 마스터는 쓰지 않습니다. 마스터는 가로 120px 이상이어야
// 하는데(로고 가이드) 작은 카드에서는 그 조건을 지킬 자리가 없습니다.
//
// 정렬은 왼쪽 한 축입니다. 가운데 정렬은 줄마다 시작점이 달라져 작게 줄였을 때
// 읽는 순서가 흔들립니다.
//
// 날짜를 이 파일에 직접 씁니다. lib/naruDates.ts를 import 하고 싶겠지만,
// 이 카드는 빌드 시점에 한 번 굳는 그림이고 문자열 하나뿐이라 포맷 함수를 들일
// 값이 없습니다. TODO: 12월 날짜가 바뀌면 이 줄도 함께 고치세요.
//
// "Next event"이지 "Next round"가 아닙니다. 12월은 제로백 빌더톤의 2회차가
// 아니라 다른 이벤트입니다.
// ─────────────────────────────────────────────────────────────────────────────
export default async function OpengraphImage() {
  // ImageResponse는 /public의 상대 경로를 가져오지 못하므로 파일을 읽어
  // data URI로 넣습니다. 이름만 들어간 락업입니다(SINGAPORE가 붙은 락업은
  // 서울 이벤트 이름 바로 옆에서 도시 둘이 부딪힙니다).
  const logo = await readFile(join(process.cwd(), "public/naru/naru-name-rev.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  // 서체를 직접 싣습니다. 없으면 satori가 런타임의 기본 서체로 그리는데, 그
  // 서체에는 굵기가 하나뿐이라 900으로 적은 제목이 본문과 같은 굵기로 나옵니다.
  // 세 벌은 Pretendard 가변 폰트(app/fonts)를 굵기 450·700·900으로 고정한 뒤
  // 라틴 글자만 남긴 것입니다(scripts/build-og-fonts.py). 한 벌이 28KB입니다.
  // satori는 woff2를 읽지 못하므로 ttf입니다.
  const [regular, bold, black] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Pretendard-OG-Regular.ttf")),
    readFile(join(process.cwd(), "public/fonts/Pretendard-OG-Bold.ttf")),
    readFile(join(process.cwd(), "public/fonts/Pretendard-OG-Black.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          // 사이트의 바탕(#070B1F)과 같은 남색. 위에 얹은 두 개의 방사형 빛은
          // 히어로의 후광과 같은 색입니다(보라 틴트 → 자주 틴트).
          backgroundColor: "#070B1F",
          backgroundImage:
            "radial-gradient(78% 98% at 12% 0%, rgba(110,92,190,0.42) 0%, rgba(110,92,190,0) 62%), radial-gradient(66% 86% at 96% 104%, rgba(199,155,180,0.30) 0%, rgba(199,155,180,0) 60%)",
          color: "#ffffff",
          fontFamily: "Pretendard",
        }}
      >
        {/* 머리: 로고 이름 락업 하나. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={173} height={48} alt="나루 NARU" />

        {/* 가운데: 이벤트 이름 하나가 가장 큽니다. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* 주황 점. 사이트의 ChipDot과 같은 자리(라벨 앞)입니다. */}
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 6, backgroundColor: "#EE8A4F" }} />
            <div style={{ display: "flex", fontSize: 23, fontWeight: 700, letterSpacing: 5, color: "#A99AD6" }}>
              NEXT EVENT
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.04,
            }}
          >
            CROSSING SEOUL
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 36, fontWeight: 700, color: "#C79BB4" }}>
            18–22 Dec 2026&nbsp;&nbsp;·&nbsp;&nbsp;Seoul
          </div>
        </div>

        {/* 바닥: 헤어라인 위의 두 줄. 왼쪽이 태그라인, 오른쪽이 포지션입니다. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.14)" }} />
          <div
            style={{
              display: "flex",
              width: "100%",
              marginTop: 24,
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 22,
              color: "#9AA3CE",
            }}
          >
            <div style={{ display: "flex" }}>You do the crossing. We make the place.</div>
            <div style={{ display: "flex" }}>Korean student builders, wherever they study</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: black, weight: 900, style: "normal" },
      ],
    }
  );
}
