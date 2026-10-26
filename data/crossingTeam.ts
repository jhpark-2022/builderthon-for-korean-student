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
  carry: { ko: "이슈에 대한 팀의 생각 한 장을 들고 찾아갑니다. 멘토는 그 한 장을 미리 봅니다.", en: "Bring one page of your team's take on the issue. Your mentor reads it beforehand." },
  notYet: { ko: "아직 열리지 않았습니다. Day 1(12.18) 12:00부터 넣을 수 있습니다.", en: "Not open yet. You can add slots from Day 1 (Dec 18) at 12:00." },
  sameDay: { ko: "오늘은 13:00 이후 칸만 넣을 수 있습니다. 오전 칸은 전날까지 넣습니다.", en: "Today only slots from 13:00 can be added. Morning slots close the day before." },
  day1BookHint: { ko: "Day 2, 3 멘토 칸은 Day 1(12.18) 12:00부터 Day 2, Day 3 탭에서 넣습니다.", en: "From Day 1 (Dec 18) at 12:00, add your Day 2 and 3 mentor slots in the Day 2 and Day 3 tabs." },
  // 2026-10-18 (사용자: "트랙에 따라서 슬롯 색깔이 달라졌으면"). 우리 팀 칸은 흰 테두리로 가립니다.
  trackLegend: { ko: "칸의 색은 그 팀의 트랙입니다. 흰 테두리는 우리 팀입니다.", en: "Each slot takes its team's track colour. A white outline marks your team." },
  time: { ko: "시간", en: "Time" },
  gap: { ko: "쉬는 10분", en: "10-minute gap" },
  past: { ko: "지남", en: "Past" },
  confirmPut: { ko: "넣기?", en: "Put in?" },
  noMentors: { ko: "이 날 시간을 연 멘토가 아직 없습니다.", en: "No mentors have opened times on this day yet." },
  errTaken: { ko: "방금 다른 팀이 들어간 칸입니다.", en: "Another team just took that cell." },
  errTeamBusy: { ko: "우리 팀의 다른 칸과 2시간이 떨어져야 합니다.", en: "Your slots need to start at least two hours apart." },
  errLimit: { ko: "이 날은 이미 두 칸을 넣었습니다.", en: "Your team already has two slots that day." },
  errPast: { ko: "지난 시간입니다.", en: "That time has passed." },
  errNotYet: { ko: "Day 1(12.18) 12:00부터 넣을 수 있습니다.", en: "Slots open on Day 1 (Dec 18) at 12:00." },
  errMorning: { ko: "오늘은 13:00 이후 칸만 넣을 수 있습니다.", en: "Today only slots from 13:00 can be added." },
  errGeneric: { ko: "잠시 뒤 다시 해 주세요.", en: "Something went wrong. Try again in a moment." },

  proofHeading: { ko: "미션 인증", en: "Mission check-in" },
  proofLead: {
    // DECIDED 2026-10-26 (사용자): 멘토 찾아가기는 Day 2, 3 날마다 팀이 함께. 10/17의 "하루 이상" 완화를 되돌립니다.
    // DECIDED 2026-10-26 (사용자: "진척 pdf가 새로운 pdf를 만드는 것이 아니고, 기존 내용을 멘토의 피드백과 팀들의 progress에 맞추어 updated 된 pdf"):
    ko: "멘토의 피드백과 그날의 진척에 맞춰 고친 1장(PDF)과, 팀이 함께 멘토와 찍은 사진을 올립니다. 현장 출석은 운영진이 체크합니다.",
    en: "Upload your one page, updated with the mentor's feedback and the day's progress, as a PDF, and a photo of the team with the mentor. The organisers check who is on site.",
  },
  proofPhoto: { ko: "멘토와 함께 찍은 인증 사진", en: "Photo with the mentor" },
  // 2026-10-26: 진척 PDF는 새 문서가 아니라 고쳐 올린 1장입니다.
  proofPdf: { ko: "고쳐 올린 1장 (PDF)", en: "Your updated one page (PDF)" },
  // DECIDED 2026-10-26 (사용자: "day 3에는 pdf를 제출하는 것이 아니고, 발표자료를 제출하는 걸로, slide in pdf"): Day 3의 PDF는 발표 자료입니다.
  proofLeadDay3: { ko: "발표 자료(슬라이드 PDF)와, 팀이 함께 멘토와 찍은 사진을 올립니다. 현장 출석은 운영진이 체크합니다.", en: "Upload your presentation (slides as a PDF) and a photo of the team with the mentor. The organisers check who is on site." },
  proofPdfDay3: { ko: "발표 자료 (슬라이드 PDF)", en: "Presentation (slides as PDF)" },
  proofPdfHintDay3: { ko: "성과 공유회에서 발표할 슬라이드를 PDF로 내보내 올립니다.", en: "Export the slides you will present at the showcase as a PDF." },
  proofPdfHint: { ko: "새로 만들지 않습니다. 지금까지의 1장을 멘토의 피드백과 그날의 진척에 맞춰 고쳐 올립니다.", en: "Not a new document. Update the one page you have with the mentor's feedback and the day's progress." },
  // Day 1은 PDF 하나(2026-10-17 사용자). 홈 Day 1 카드의 "Day 2에 들고 갈 것"과 같은 물건입니다.
  proofPdfDay1: { ko: "이슈에 대한 팀의 생각 1장 (PDF)", en: "One page of the team's take on the issue (PDF)" },
  // 2026-10-19 (사용자: Day 1 미션 뺌): Day 1 올리기는 선택입니다.
  // DECIDED 2026-10-26 (사용자: "올리면 팀이 멘토분들에게 사전에 공유줄 수 있도록"): 올린 1장은 우리 팀이 칸을 넣은 멘토가 멘토 페이지(/crossing/mentor)에서 미리 봅니다.
  proofLeadDay1: { ko: "Day 1은 미션이 없습니다. 이슈에 대한 팀의 생각 1장을 PDF로 올려 두면, 우리 팀이 칸을 넣은 멘토가 찾아가기 전에 미리 봅니다.", en: "There is no mission on Day 1. Upload one page of your team's take on the issue as a PDF, and the mentors you book will read it before you visit." },
  proofPick: { ko: "파일 고르기", en: "Choose a file" },
  // 2026-10-26 (사용자: 한 번만 올리기, 하루가 끝나기 전에 신중하게): 고른 뒤 한 번 더 묻고 올립니다.
  proofOnce: { ko: "사진과 PDF는 날마다 한 번씩만 올릴 수 있고, 올린 뒤에는 바꿀 수 없습니다. 그날이 끝나기 전에 확인하고 올려 주세요.", en: "You can upload each photo and PDF once a day, and it cannot be changed afterwards. Check it carefully before the day ends." },
  proofConfirm: { ko: "이 파일로 올리기", en: "Upload this file" },
  proofCancel: { ko: "다시 고르기", en: "Choose again" },
  proofLocked: { ko: "올린 파일은 바꿀 수 없습니다.", en: "An uploaded file cannot be changed." },
  proofAlready: { ko: "이 날은 이미 올렸습니다. 올린 파일은 바꿀 수 없습니다.", en: "Already uploaded for this day. It cannot be changed." },
  proofUploading: { ko: "올리는 중", en: "Uploading" },
  proofDone: { ko: "올렸습니다", en: "Uploaded" },
  proofView: { ko: "보기", en: "View" },
  proofNone: { ko: "아직 없음", en: "Not yet" },
  // 2026-10-26 (사용자: 올리는 상자마다 용량 한도를 표시): {mb}는 lib/crossingOps.ts PROOF_MAX_BYTES에서 채웁니다.
  proofLimitPhoto: { ko: "JPG, PNG, HEIC 사진, {mb}MB까지", en: "JPG, PNG or HEIC photo, up to {mb} MB" },
  proofLimitPdf: { ko: "PDF 파일, {mb}MB까지", en: "PDF file, up to {mb} MB" },
  proofTooBig: { ko: "이 파일은 {mb}MB까지 올릴 수 있습니다.", en: "This file can be up to {mb} MB." },
  proofBadType: { ko: "사진은 JPG, PNG, HEIC, 문서는 PDF로 올립니다.", en: "Photos as JPG, PNG or HEIC. Documents as a PDF." },
} satisfies Record<string, Phrase>;

// 시간표 사용 규칙(2026-10-26, 사용자: "시간표 사용 설명이 좀 더 visually engaging 했으면"). 한 문단이던 것을 카드 여섯 장으로.
// 카드마다 핵심 한마디(key, 굵게)와 한 줄(body). 순서는 넣는 방법, 칸의 길이, 하루 상한, 바꿀 수 없음, 여는 때, 그날의 규칙.
// 규칙의 정본은 lib/crossingOps.ts(SESSION_MINUTES, BUFFER_MINUTES, MAX_BOOKINGS_PER_TEAM_PER_DAY, TEAM_COOLDOWN_MINUTES, BOOKING_OPENS_AT, SAME_DAY_FROM)입니다.
export const timetableRules: { icon: "tap" | "clock" | "two" | "lock" | "open" | "today"; key: Phrase; body: Phrase }[] = [
  { icon: "tap", key: { ko: "두 번 눌러 넣기", en: "Tap twice" }, body: { ko: "빈 칸을 두 번 누르면 우리 팀 이름이 들어갑니다. 멘토와 모든 팀이 같은 표를 봅니다.", en: "Tap an empty cell twice to put your team in. Mentors and every team see the same table." } },
  { icon: "clock", key: { ko: "한 칸 40분", en: "40 minutes a slot" }, body: { ko: "앞뒤 10분은 멘토가 쉬는 시간으로 비워 둡니다.", en: "Ten minutes on either side stay free for the mentor." } },
  { icon: "two", key: { ko: "하루 두 칸", en: "Two slots a day" }, body: { ko: "두 칸은 2시간 이상 떨어져야 합니다.", en: "The two need to start at least two hours apart." } },
  { icon: "lock", key: { ko: "넣으면 못 바꿈", en: "No changes" }, body: { ko: "한 번 넣은 칸은 바꾸거나 뺄 수 없습니다.", en: "Once a slot is in, it cannot be changed or removed." } },
  { icon: "open", key: { ko: "12.18 12:00 열림", en: "Opens Dec 18, 12:00" }, body: { ko: "Day 1 낮 12시부터 Day 2, 3 칸을 함께 넣습니다.", en: "From noon on Day 1, add Day 2 and 3 slots together." } },
  { icon: "today", key: { ko: "당일은 13:00부터", en: "On the day, from 13:00" }, body: { ko: "그날이 되면 그날의 칸은 13:00 이후만 넣습니다.", en: "On the day itself, only slots from 13:00 can be added." } },
];

// 멘토 페이지(/crossing/mentor?k=)의 글(2026-10-26). 멘토가 찾아올 팀과 그 팀의 1장을 미리 봅니다.
export const mentorCopy = {
  title: { ko: "멘토 페이지", en: "Mentor page" },
  lead: {
    ko: "우리 칸에 들어온 팀과, 그 팀이 올린 이슈에 대한 생각 1장입니다. 팀은 이 한 장을 들고 찾아옵니다. Day 3 칸에는 그 팀이 Day 2에 고쳐 올린 1장도 붙습니다.",
    en: "The teams that booked you, and the one page each team wrote on its issue. They bring this page when they visit. Day 3 slots also carry the page as the team updated it on Day 2.",
  },
  refresh: { ko: "1분마다 새로 읽습니다.", en: "Refreshes every minute." },
  day: { ko: "Day", en: "Day" },
  empty: { ko: "아직 넣은 팀이 없습니다.", en: "No teams yet." },
  day1Pdf: { ko: "이슈에 대한 생각 1장", en: "One page on the issue" },
  day2Pdf: { ko: "Day 2에 고친 1장", en: "Updated on Day 2" },
  noPdf: { ko: "1장을 아직 올리지 않았습니다", en: "No page uploaded yet" },
  badLink: { ko: "링크가 맞지 않습니다. 운영진에게 다시 받아 주세요.", en: "This link does not match. Please ask the organisers for it again." },
  errGeneric: { ko: "잠시 뒤 다시 열어 주세요.", en: "Something went wrong. Please reopen in a moment." },
} satisfies Record<string, Phrase>;
