import type { MetadataRoute } from "next";

const SITE_URL = "https://builderthon-for-korean-student.vercel.app";

// 페이지 셋. 홈이 나루, /2026-08이 1회차 기록, /quiz가 유형 테스트입니다.
// 2단계에서 12월 상세(/seoul)가 붙으면 여기에 더하세요.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    // 기록은 이제 바뀌지 않습니다. 색인에서 내리지는 않아요. 8월에 참가한
    // 사람이 검색으로 자기 회차를 다시 찾을 수 있어야 합니다.
    { url: `${SITE_URL}/2026-08`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/quiz`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
