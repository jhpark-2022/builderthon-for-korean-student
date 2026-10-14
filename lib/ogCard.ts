import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// 공유 카드(app/**/opengraph-image.tsx) 세 장이 같이 쓰는 바탕과 서체.
// DECIDED 2026-10-14 (사용자: "공유했을 때의 설명과 이미지가 정말 수준이 높으면"): 홈, /naru, /2026-08 카드가
// 같은 바탕, 같은 서체, 같은 여백으로 한 벌처럼 보이게 합니다. 전에는 /2026-08만 시스템 서체와 무지개 그라데이션이었습니다.

export const OG_SIZE = { width: 1200, height: 630 };

// 사이트의 바탕(#070B1F)과 히어로 후광(보라 틴트 → 자주 틴트). brand 10장 "화면은 잉크 위에".
export const OG_BACKGROUND = {
  backgroundColor: "#070B1F",
  backgroundImage:
    "radial-gradient(78% 98% at 12% 0%, rgba(110,92,190,0.42) 0%, rgba(110,92,190,0) 62%), radial-gradient(66% 86% at 96% 104%, rgba(199,155,180,0.30) 0%, rgba(199,155,180,0) 60%)",
} as const;

// 크로싱 서울 워드마크 그라데이션(brand 10장, 2026-10-11). 사이트 히어로와 같은 네 색, 같은 자리.
export const WORDMARK_GRADIENT = "linear-gradient(90deg, #9AA8EE 0%, #A99AD6 35%, #C99ACB 68%, #E08A76 100%)";

// satori는 woff2를 읽지 못해 ttf입니다. 라틴 + 카드 파일에 적힌 한글만 든 서브셋(scripts/build-og-fonts.py).
// 카드에 한글을 새로 쓰면 그 스크립트를 다시 돌리세요. 빠진 글자는 두부로 나옵니다.
export async function loadOgFonts() {
  const dir = join(process.cwd(), "public/fonts");
  const [regular, bold, black] = await Promise.all([
    readFile(join(dir, "Pretendard-OG-Regular.ttf")),
    readFile(join(dir, "Pretendard-OG-Bold.ttf")),
    readFile(join(dir, "Pretendard-OG-Black.ttf")),
  ]);
  return [
    { name: "Pretendard", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Pretendard", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Pretendard", data: black, weight: 900 as const, style: "normal" as const },
  ];
}

// /public의 PNG를 data URI로. ImageResponse는 상대 경로를 가져오지 못합니다.
export async function publicPngDataUri(path: string) {
  const buf = await readFile(join(process.cwd(), "public", path));
  return `data:image/png;base64,${buf.toString("base64")}`;
}
