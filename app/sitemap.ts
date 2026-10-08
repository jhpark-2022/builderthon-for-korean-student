import type { MetadataRoute } from "next";

const SITE_URL = "https://naru-crossing-seoul.vercel.app";

// 페이지 셋. 홈이 나루, /2026-08이 1회차 기록, /quiz가 유형 테스트입니다.
// 2단계에서 12월 상세(/seoul)가 붙으면 여기에 더하세요.
// 2026-10-08 (사용자 승인, SEO 리뷰 15): lastModified. 빌드 시각입니다(정적 생성이라 배포할 때마다 굳습니다).
// 기록 페이지는 내용이 바뀌는 배포에서만 의미가 있지만, 값이 없는 것보다 낫습니다.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    // 기록은 이제 바뀌지 않습니다. 색인에서 내리지는 않아요. 8월에 참가한
    // 사람이 검색으로 자기 회차를 다시 찾을 수 있어야 합니다.
    { url: `${SITE_URL}/2026-08`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/quiz`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
