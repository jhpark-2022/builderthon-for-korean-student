// ─────────────────────────────────────────────────────────────────────────────
// 현장 도구(/crossing/team)의 글(2026-10-17). 모든 팀이 같이 보는 멘토 시간표와 Day 2, Day 3 미션 인증.
// 쓰는 말은 docs/brand.md 5장, 7장을 따릅니다(미션, 성과 공유회. 심사, 과제는 쓰지 않음).
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionaryCore";

export const teamCopy = {
  title: { ko: "멘토 시간표와 미션 인증", en: "Mentor timetable and check-in" },
  timetableHeading: { ko: "멘토 시간표", en: "Mentor timetable" },
  teamLabel: { ko: "우리 팀", en: "Your team" },
  teamPick: { ko: "팀을 고르세요", en: "Pick your team" },
  pickFirst: { ko: "팀을 고르면 인증 올리기와 시간표 칸 넣기가 열립니다.", en: "Pick your team to unlock uploads and timetable slots." },
  dayTab: { ko: "Day", en: "Day" },
  lead: {
    ko: "빈 칸을 두 번 누르면 우리 팀 이름이 들어가고, 멘토와 모든 팀이 같은 시간표를 봅니다. 한 번 넣은 칸은 바꿀 수 없습니다. 한 번은 40분, 앞뒤 10분은 비워 둡니다. 하루 두 칸까지, 두 칸은 2시간 이상 떨어져야 합니다.",
    en: "Tap an empty cell twice to put your team in. Mentors and every team see the same timetable. A slot cannot be changed once it is in. Each slot is 40 minutes, with 10 minutes kept free before and after. Up to two a day, at least two hours apart.",
  },
  carry: { ko: "이슈에 대한 팀의 생각 한 장을 들고 찾아갑니다.", en: "Bring one page of your team's take on the issue." },
  time: { ko: "시간", en: "Time" },
  gap: { ko: "쉬는 10분", en: "10-minute gap" },
  confirmPut: { ko: "넣기?", en: "Put in?" },
  noMentors: { ko: "이 날 시간을 연 멘토가 아직 없습니다.", en: "No mentors have opened times on this day yet." },
  errTaken: { ko: "방금 다른 팀이 들어간 칸입니다.", en: "Another team just took that cell." },
  errTeamBusy: { ko: "우리 팀의 다른 칸과 2시간이 떨어져야 합니다.", en: "Your slots need to start at least two hours apart." },
  errLimit: { ko: "이 날은 이미 두 칸을 넣었습니다.", en: "Your team already has two slots that day." },
  errPast: { ko: "지난 시간입니다.", en: "That time has passed." },
  errGeneric: { ko: "잠시 뒤 다시 해 주세요.", en: "Something went wrong. Try again in a moment." },

  proofHeading: { ko: "미션 인증", en: "Mission check-in" },
  proofLead: {
    // 2026-10-17 (사용자: 미션 완화): 멘토 사진은 찾아간 날에만. Day 2, 3 중 하루 이상이면 됩니다.
    ko: "그날 만든 진척 PDF를 올립니다. 멘토를 찾아간 날에는 함께 찍은 사진도 올립니다(Day 2, 3 중 하루 이상). 현장 출석은 운영진이 체크합니다.",
    en: "Upload that day's progress as a PDF. On the day you visit a mentor, upload a photo with them too (on at least one of Day 2 and 3). The organisers check who is on site.",
  },
  proofPhoto: { ko: "멘토와 함께 찍은 인증 사진", en: "Photo with the mentor" },
  proofPdf: { ko: "그날의 진척 PDF", en: "That day's progress PDF" },
  // Day 1은 PDF 하나(2026-10-17 사용자). 홈 Day 1 카드의 "Day 2에 들고 갈 것"과 같은 물건입니다.
  proofPdfDay1: { ko: "이슈에 대한 팀의 생각 1장 (PDF)", en: "One page of the team's take on the issue (PDF)" },
  proofLeadDay1: { ko: "Day 1에는 이슈에 대한 팀의 생각 1장을 PDF로 올립니다.", en: "On Day 1, upload one page of your team's take on the issue as a PDF." },
  day1Timetable: { ko: "Day 1에는 멘토 시간표에 칸을 넣지 않습니다. 시간표는 Day 2, 3에 씁니다.", en: "There are no mentor slots on Day 1. The timetable is for Day 2 and 3." },
  proofPick: { ko: "파일 올리기", en: "Upload a file" },
  proofReplace: { ko: "다시 올리기", en: "Upload again" },
  proofUploading: { ko: "올리는 중", en: "Uploading" },
  proofDone: { ko: "올렸습니다", en: "Uploaded" },
  proofView: { ko: "보기", en: "View" },
  proofNone: { ko: "아직 없음", en: "Not yet" },
  proofTooBig: { ko: "20MB까지 올릴 수 있습니다.", en: "Files up to 20 MB." },
  proofBadType: { ko: "사진은 JPG, PNG, HEIC, 진척은 PDF로 올립니다.", en: "Photos as JPG, PNG or HEIC. Progress as a PDF." },
} satisfies Record<string, Phrase>;
