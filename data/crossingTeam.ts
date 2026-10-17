// ─────────────────────────────────────────────────────────────────────────────
// 현장 도구(/crossing/team)의 글(2026-10-17). 멘토 예약과 Day 2, Day 3 미션 인증.
// 쓰는 말은 docs/brand.md 5장, 7장을 따릅니다(미션, 성과 공유회, 이슈를 낸 기업. 심사, 과제는 쓰지 않음).
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionaryCore";

export const teamCopy = {
  title: { ko: "크로싱 서울 팀 페이지", en: "CROSSING SEOUL team page" },
  codeLabel: { ko: "팀 코드", en: "Team code" },
  codeHelp: { ko: "Day 1에 팀을 맺으면 운영진이 6자리 코드를 드립니다.", en: "You get a six-character code from the organisers once your team forms on Day 1." },
  codeSubmit: { ko: "들어가기", en: "Enter" },
  codeUnknown: { ko: "맞는 팀 코드가 없습니다. 다시 확인해 주세요.", en: "No team with that code. Check it and try again." },
  changeTeam: { ko: "다른 코드로", en: "Use another code" },
  dayTab: { ko: "Day", en: "Day" },

  bookingHeading: { ko: "멘토 예약", en: "Book a mentor" },
  bookingLead: {
    ko: "시간을 누르면 예약됩니다. 한 번은 30분이고, 예약한 시간의 앞뒤 15분은 그 멘토가 받지 않습니다. 한 팀은 하루 두 번까지 잡을 수 있습니다.",
    en: "Tap a time to book it. Each slot is 30 minutes, and the mentor takes no one in the 15 minutes before and after. A team can book up to two a day.",
  },
  carry: { ko: "이슈에 대한 팀의 생각 한 장을 들고 찾아갑니다.", en: "Bring one page of your team's take on the issue." },
  legendOpen: { ko: "예약 가능", en: "Open" },
  legendMine: { ko: "우리 팀", en: "Your team" },
  legendBooked: { ko: "예약됨", en: "Booked" },
  legendBuffer: { ko: "앞뒤 15분", en: "15-minute gap" },
  noMentors: { ko: "이 날 예약을 받는 멘토가 아직 없습니다.", en: "No mentors are taking bookings on this day yet." },
  confirmBook: { ko: "예약하기", en: "Book" },
  cancelBook: { ko: "예약 취소", en: "Cancel booking" },
  keep: { ko: "그대로 두기", en: "Keep it" },
  errTaken: { ko: "방금 다른 팀이 잡은 시간입니다. 다른 시간을 골라 주세요.", en: "Another team just took that time. Pick another." },
  errTeamBusy: { ko: "우리 팀의 다른 예약과 시간이 겹칩니다.", en: "That clashes with another booking of yours." },
  errLimit: { ko: "이 날은 이미 두 번 예약했습니다.", en: "You already have two bookings that day." },
  errPast: { ko: "지난 시간입니다.", en: "That time has passed." },
  errGeneric: { ko: "잠시 뒤 다시 해 주세요.", en: "Something went wrong. Try again in a moment." },

  proofHeading: { ko: "미션 인증", en: "Mission check-in" },
  proofLead: {
    ko: "멘토와 함께 찍은 사진과 그날 만든 진척 PDF를 올립니다. 현장 출석은 운영진이 체크합니다.",
    en: "Upload a photo with your mentor and that day's progress as a PDF. The organisers check who is on site.",
  },
  proofPhoto: { ko: "멘토와 함께 찍은 인증 사진", en: "Photo with the mentor" },
  proofPdf: { ko: "그날의 진척 PDF", en: "That day's progress PDF" },
  proofPick: { ko: "파일 고르기", en: "Choose a file" },
  proofReplace: { ko: "다시 올리기", en: "Upload again" },
  proofUploading: { ko: "올리는 중", en: "Uploading" },
  proofDone: { ko: "올렸습니다", en: "Uploaded" },
  proofView: { ko: "보기", en: "View" },
  proofNone: { ko: "아직 없음", en: "Not yet" },
  proofTooBig: { ko: "20MB까지 올릴 수 있습니다.", en: "Files up to 20 MB." },
  proofBadType: { ko: "사진은 JPG, PNG, HEIC, PDF는 PDF만 받습니다.", en: "Photos as JPG, PNG or HEIC. The progress file as PDF." },
  // DECIDED 2026-10-17 (상금·인센티브 정리 7장 6번, 멘토 인증 사진 촬영 동의): 올리기 전에 한 번 묻습니다.
  photoConsent: {
    ko: "사진 속 멘토와 팀원 모두에게 찍고 올리는 것을 물어봤습니다. 사진은 운영진만 보고 미션 확인에만 씁니다.",
    en: "Everyone in the photo, mentor included, agreed to it being taken and uploaded. Only the organisers see it, and only to check the mission.",
  },
} satisfies Record<string, Phrase>;
