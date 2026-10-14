import { ImageResponse } from "next/og";
import { OG_BACKGROUND, OG_SIZE, WORDMARK_GRADIENT, loadOgFonts, publicPngDataUri } from "@/lib/ogCard";

export const alt = "크로싱 서울 CROSSING SEOUL, 2026년 12월 17~21일 서울. 나루 NARU.";
export const size = OG_SIZE;
export const contentType = "image/png";

// ─────────────────────────────────────────────────────────────────────────────
// 홈의 공유 카드.
//
// DECIDED 2026-10-14 (사용자: "링크를 외부에 공유했을 때 나오는 설명과 이미지가 정말 수준이 높으면"):
// 큰 글자를 사이트 히어로의 로고 그대로 씁니다. 국문 "크로싱 서울"에 네 색 그라데이션, 그 아래 영문
// "CROSSING SEOUL"을 한글 폭에 맞춰 벌립니다(brand 6장 표기 A 락업, 10장 워드마크 그라데이션).
// 전에는 영문 "CROSSING SEOUL" 흰 글자와 "NEXT EVENT" 라벨이었습니다. 카드 서체에 한글이 없어서였고,
// 지금은 카드에 적힌 한글만 서체에 넣습니다(scripts/build-og-fonts.py).
//
// 그대로 둔 것(2026-09-19의 결정): 한 장에 한 가지만 크게, 왼쪽 한 축 정렬, 로고는 이름 락업으로 왼쪽 위에 작게.
// 텔레그램, 카카오의 카드는 폭 500px 남짓으로 줄어 보이므로 작은 줄은 둘까지만 둡니다.
//
// 글자 크기: 로고(표식, 크기 규칙의 예외) + BODY(날짜) + META(영문 줄, 바닥 줄). brand 10장 "글자 크기 셋".
// 가운뎃점은 쓰지 않습니다(brand 5장). TODO: 12월 날짜가 바뀌면 날짜 줄도 함께 고치세요(lib/naruDates.ts).
// ─────────────────────────────────────────────────────────────────────────────
export default async function OpengraphImage() {
  const [logoSrc, fonts] = await Promise.all([publicPngDataUri("naru/naru-name-rev.png"), loadOgFonts()]);
  const en = "CROSSING SEOUL";

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={173} height={48} alt="나루 NARU" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* 락업: 한글 줄의 폭에 영문 줄의 양 끝을 맞춥니다(사이트 히어로와 같은 문법). */}
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
            <div
              style={{
                display: "flex",
                fontSize: 156,
                fontWeight: 900,
                letterSpacing: -4,
                lineHeight: 1.1,
                paddingBottom: 6,
                backgroundImage: WORDMARK_GRADIENT,
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              크로싱 서울
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 26,
                fontWeight: 700,
                color: "#E08A76",
              }}
            >
              {[...en].map((ch, i) => (
                <div key={i} style={{ display: "flex" }}>
                  {ch === " " ? " " : ch}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 44, fontSize: 40, fontWeight: 700, color: "#E6E8F5" }}>
            2026년 12월 17~21일, 서울
          </div>
        </div>

        {/* 바닥: 헤어라인 위의 두 줄. 왼쪽이 나루의 태그라인(data/naru.ts), 오른쪽이 크로싱 서울의 뜻(brand 6장). */}
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
            <div style={{ display: "flex" }}>한국의 대학생과 해외의 한인 학생이 한 팀으로</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
