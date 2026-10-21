// ─────────────────────────────────────────────────────────────────────────────
// 로고에서 가는 주소 한 곳 (DECIDED 2026-10-20, 사용자: "이 웹사이트에 있는 모든 로고들에 적용", hwang 브리프 3.8, 3.9, 감사 W12).
// 사이트의 파트너 로고(8월 히어로 띠, 로고 벽, "이 빌더톤이 자라 나온 곳" 띠, 푸터, 12월 노선도)는 주소가 있으면 새 창 링크입니다.
// 키는 로고의 alt(이름)입니다. 주소는 2026-10-20에 직접 열어 제목을 확인한 공식 사이트만 적었습니다.
// 주소가 없는 곳(AXMOS, Mission, YJ, 각 학교 학생회 셋)은 비워 둡니다. AXMOS와 학생회는 로고 벽에서 지금처럼 설명 모달을 엽니다.
// ─────────────────────────────────────────────────────────────────────────────
export const partnerLinks: Record<string, string> = {
  "Translink Investment": "https://translink.kr",
  "Wilt Venture Builder": "https://www.wiltvb.com/",
  Codepresso: "https://codepresso.io",
  "Popup Studio": "https://popupstudio.ai",
  Drimaes: "https://www.drimaes.com",
  AWS: "https://aws.amazon.com/",
  Hashed: "https://www.hashed.com/",
  "INNOVATE 360": "https://innovate360.sg/",
  "L^IFE": "https://life-singapore.com/",
  BZCF: "https://bzcf.io/",
  "Korean Association in Singapore": "https://singapore.korean.net/",
  "Onword Lab": "https://www.onwordlab.com/",
  REmited: "https://teamremited.com/",
  "Brand Boost": "https://www.brandboost.kr/",
  Nuldam: "https://sg.nuldam.com/",
  "Jeju Haenyeo": "https://www.jejuhaenyeosg.com/",
  // "이 빌더톤이 자라 나온 곳"(제로백 네트워크) 띠
  "Startup Alliance": "https://startupall.kr",
  KAIA: "https://www.k-aia.or.kr/", // 초기투자액셀러레이터협회
  "Venture Square": "https://www.venturesquare.net",
  MYSC: "https://www.mysc.co.kr",
  EventUs: "https://event-us.kr",
  "United Korean Founders": "https://ukf.net",
  TheMiilk: "https://themiilk.com",
  andar: "https://www.andar.co.kr",
  "CEO SUITE": "https://www.ceosuite.com",
  "Habit Factory": "https://habitfactory.co",
  Twigfarm: "https://twigfarm.net",
  Kowork: "https://kowork.kr",
  "One Degree Labs": "https://www.onedegreelabs.io",
};

export const partnerUrl = (name?: string): string | undefined => (name ? partnerLinks[name] : undefined);
