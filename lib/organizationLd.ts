// 나루(그룹)의 Organization JSON-LD. 홈(/)과 /naru가 같은 것을 씁니다.
// DECIDED 2026-10-10 (구조 브리프 2.4): @id는 /#naru 그대로입니다. 홈 끝의 나루 티저가 그 id를 갖고 있습니다.
export const SITE_URL = "https://naru-crossing-seoul.vercel.app";

export const ORGANIZATION_LD = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#naru`,
  name: "나루 NARU",
  alternateName: "NARU",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: "A Korea-rooted, student-run, not-for-profit collective of student builders.",
};
