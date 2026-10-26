// ─────────────────────────────────────────────────────────────────────────────
// 현장 도구(/crossing/team)의 글(2026-10-17). 모든 팀이 같이 보는 멘토 시간표와 Day 2, Day 3 미션 인증.
// 쓰는 말은 docs/brand.md 5장, 7장을 따릅니다(미션, 성과 공유회. 심사, 과제는 쓰지 않음).
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionaryCore";

export const teamCopy = {
  title: { ko: "멘토 시간표와 미션 인증", en: "Mentor timetable and check-in" },
  // 2026-10-23 (모바일 점검): /match처럼 돌아가기와 EN/KR이 있는 머리를 둡니다. 그 전에는 제목으로 바로 시작했습니다.
  back: { ko: "크로싱 서울", en: "Crossing Seoul" },
  swipeHint: { ko: "옆으로 밀면 다른 멘토의 칸이 보입니다.", en: "Swipe sideways for the other mentors' slots." },
  timetableHeading: { ko: "멘토 시간표", en: "Mentor timetable" },
  teamLabel: { ko: "우리 팀", en: "Your team" },
  teamPick: { ko: "팀을 고르세요", en: "Pick your team" },
  pickFirst: { ko: "팀을 고르면 인증 올리기와 시간표 칸 넣기가 열립니다.", en: "Pick your team to unlock uploads and timetable slots." },
  // 2026-10-26: Day 1 탭에는 시간표가 없어(TeamTool) 안내에서 시간표를 뺍니다.
  pickFirstDay1: { ko: "팀을 고르면 인증 올리기가 열립니다.", en: "Pick your team to unlock uploads." },
  dayTab: { ko: "Day", en: "Day" },
  lead: {
    ko: "빈 칸을 두 번 누르면 우리 팀 이름이 들어가고, 멘토와 모든 팀이 같은 시간표를 봅니다. 한 칸은 40분이고 앞뒤 10분은 비워 두며, 한 번 넣은 칸은 바꿀 수 없습니다. 하루 두 칸까지 넣을 수 있고, 두 칸은 2시간 이상 떨어져야 합니다.",
    en: "Tap an empty cell twice to put your team in, and mentors and every team see the same timetable. Each slot is 40 minutes with 10 minutes kept free on either side, and it cannot be changed once it is in. You can take up to two a day, at least two hours apart.",
  },
  carry: { ko: "이슈에 대한 팀의 생각 한 장을 들고 찾아갑니다.", en: "Bring one page of your team's take on the issue." },
  // DECIDED 2026-10-26 (사용자): Day 1부터 Day 2, 3 칸을 넣고, 그날이 되면 13:00 이후 칸만(lib/crossingOps.ts bookingGate).
  gateRule: { ko: "Day 2, 3 칸은 Day 1(12.18)부터 함께 넣을 수 있습니다. 그날이 되면 그날의 칸은 13:00 이후만 넣을 수 있습니다.", en: "Day 2 and 3 slots open together on Day 1 (Dec 18). On the day itself, only slots from 13:00 can be added." },
  notYet: { ko: "아직 열리지 않았습니다. Day 1(12.18)부터 넣을 수 있습니다.", en: "Not open yet. You can add slots from Day 1 (Dec 18)." },
  sameDay: { ko: "오늘은 13:00 이후 칸만 넣을 수 있습니다. 오전 칸은 전날까지 넣습니다.", en: "Today only slots from 13:00 can be added. Morning slots close the day before." },
  day1BookHint: { ko: "Day 2, 3 멘토 칸은 Day 1(12.18)부터 Day 2, Day 3 탭에서 넣습니다.", en: "From Day 1 (Dec 18), add your Day 2 and 3 mentor slots in the Day 2 and Day 3 tabs." },
  // 2026-10-18 (사용자: "트랙에 따라서 슬롯 색깔이 달라졌으면"). 우리 팀 칸은 흰 테두리로 가립니다.
  trackLegend: { ko: "칸의 색은 그 팀의 트랙입니다. 흰 테두리는 우리 팀입니다.", en: "Each slot takes its team's track colour. A white outline marks your team." },
  time: { ko: "시간", en: "Time" },
  gap: { ko: "쉬는 10분", en: "10-minute gap" },
  confirmPut: { ko: "넣기?", en: "Put in?" },
  noMentors: { ko: "이 날 시간을 연 멘토가 아직 없습니다.", en: "No mentors have opened times on this day yet." },
  errTaken: { ko: "방금 다른 팀이 들어간 칸입니다.", en: "Another team just took that cell." },
  errTeamBusy: { ko: "우리 팀의 다른 칸과 2시간이 떨어져야 합니다.", en: "Your slots need to start at least two hours apart." },
  errLimit: { ko: "이 날은 이미 두 칸을 넣었습니다.", en: "Your team already has two slots that day." },
  errPast: { ko: "지난 시간입니다.", en: "That time has passed." },
  errNotYet: { ko: "Day 1(12.18)부터 넣을 수 있습니다.", en: "Slots open on Day 1 (Dec 18)." },
  errMorning: { ko: "오늘은 13:00 이후 칸만 넣을 수 있습니다.", en: "Today only slots from 13:00 can be added." },
  errGeneric: { ko: "잠시 뒤 다시 해 주세요.", en: "Something went wrong. Try again in a moment." },

  proofHeading: { ko: "미션 인증", en: "Mission check-in" },
  proofLead: {
    // DECIDED 2026-10-26 (사용자): 멘토 찾아가기는 Day 2, 3 날마다 팀이 함께. 10/17의 "하루 이상" 완화를 되돌립니다.
    ko: "그날 만든 진척 PDF와 팀이 함께 멘토와 찍은 사진을 올립니다. 현장 출석은 운영진이 체크합니다.",
    en: "Upload that day's progress as a PDF and a photo of the team with the mentor. The organisers check who is on site.",
  },
  proofPhoto: { ko: "멘토와 함께 찍은 인증 사진", en: "Photo with the mentor" },
  proofPdf: { ko: "그날의 진척 PDF", en: "That day's progress PDF" },
  // Day 1은 PDF 하나(2026-10-17 사용자). 홈 Day 1 카드의 "Day 2에 들고 갈 것"과 같은 물건입니다.
  proofPdfDay1: { ko: "이슈에 대한 팀의 생각 1장 (PDF)", en: "One page of the team's take on the issue (PDF)" },
  // 2026-10-19 (사용자: Day 1 미션 뺌): Day 1 올리기는 선택입니다.
  // DECIDED 2026-10-26 (사용자: "올리면 팀이 멘토분들에게 사전에 공유줄 수 있도록"): 올린 1장은 우리 팀이 칸을 넣은 멘토가 멘토 페이지(/crossing/mentor)에서 미리 봅니다.
  proofLeadDay1: { ko: "Day 1은 미션이 없습니다. 이슈에 대한 팀의 생각 1장을 PDF로 올려 두면, 우리 팀이 칸을 넣은 멘토가 찾아가기 전에 미리 봅니다.", en: "There is no mission on Day 1. Upload one page of your team's take on the issue as a PDF, and the mentors you book will read it before you visit." },
  proofPick: { ko: "파일 올리기", en: "Upload a file" },
  proofReplace: { ko: "다시 올리기", en: "Upload again" },
  proofUploading: { ko: "올리는 중", en: "Uploading" },
  proofDone: { ko: "올렸습니다", en: "Uploaded" },
  proofView: { ko: "보기", en: "View" },
  proofNone: { ko: "아직 없음", en: "Not yet" },
  proofTooBig: { ko: "20MB까지 올릴 수 있습니다.", en: "Files up to 20 MB." },
  proofBadType: { ko: "사진은 JPG, PNG, HEIC, 진척은 PDF로 올립니다.", en: "Photos as JPG, PNG or HEIC. Progress as a PDF." },
} satisfies Record<string, Phrase>;

// 멘토 페이지(/crossing/mentor?k=)의 글(2026-10-26). 멘토가 찾아올 팀과 그 팀의 1장을 미리 봅니다.
export const mentorCopy = {
  title: { ko: "멘토 페이지", en: "Mentor page" },
  lead: {
    ko: "우리 칸에 들어온 팀과, 그 팀이 올린 이슈에 대한 생각 1장입니다. 팀은 이 한 장을 들고 찾아옵니다. Day 3 칸에는 그 팀의 Day 2 진척 PDF도 붙습니다.",
    en: "The teams that booked you, and the one page each team wrote on its issue. They bring this page when they visit. Day 3 slots also carry the team's Day 2 progress PDF.",
  },
  refresh: { ko: "1분마다 새로 읽습니다.", en: "Refreshes every minute." },
  day: { ko: "Day", en: "Day" },
  empty: { ko: "아직 넣은 팀이 없습니다.", en: "No teams yet." },
  day1Pdf: { ko: "이슈에 대한 생각 1장", en: "One page on the issue" },
  day2Pdf: { ko: "Day 2 진척 PDF", en: "Day 2 progress PDF" },
  noPdf: { ko: "1장을 아직 올리지 않았습니다", en: "No page uploaded yet" },
  badLink: { ko: "링크가 맞지 않습니다. 운영진에게 다시 받아 주세요.", en: "This link does not match. Please ask the organisers for it again." },
  errGeneric: { ko: "잠시 뒤 다시 열어 주세요.", en: "Something went wrong. Please reopen in a moment." },
} satisfies Record<string, Phrase>;
