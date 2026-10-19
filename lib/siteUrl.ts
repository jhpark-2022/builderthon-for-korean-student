// DECIDED 2026-10-20 (hwang 브리프 4.8, D1, 감사 W10): 사이트 주소는 이 한 곳입니다. 도메인을 사면 Vercel 환경변수
// NEXT_PUBLIC_SITE_URL(예: "https://crossingseoul.kr")만 바꾸면 metadataBase, sitemap, robots, JSON-LD, 퀴즈 카드,
// Turnstile 허용 호스트가 같이 따라갑니다. 도메인 구매와 DNS, Vercel 연결, Turnstile 대시보드, Search Console,
// vercel.app → 새 도메인 301(vercel.json의 host 조건 redirect)은 사용자가 도메인을 정한 뒤에 합니다.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://naru-crossing-seoul.vercel.app").replace(/\/+$/, "");
export const SITE_HOST = new URL(SITE_URL).host;
