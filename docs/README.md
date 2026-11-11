# docs/ 안내

이 폴더에는 정본 하나와 작업 지시서(브리프), 점검 보고서가 있습니다. **정본은 `brand.md` 하나**입니다. 사이트의 이름, 문장, 어휘, 숫자, 금지어는 거기서 나오고, 바꾸려면 거기부터 바꿉니다.

브리프는 Claude Code에게 주는 하루짜리 작업 지시서입니다. 적용되고 나면 할 일은 끝나지만 지우지 않습니다. 코드의 `DECIDED YYYY-MM-DD (docs/xxx-brief.md T1)` 주석 185곳이 근거로 가리키고 있어서, 왜 그 문장과 그 값이 됐는지를 되짚을 때 씁니다. 결정 자체는 브리프가 아니라 `brand.md`(6장 이하)와 코드 주석에 남깁니다. 브리프를 읽어야 지금 상태를 알 수 있다면 그건 정본이 덜 적힌 것이니 정본을 고칩니다.

상태: **적용** 반영되어 배포됨 / **대기** 아직 적용 전 / **대체** 뒤의 브리프나 결정이 대신함 / **폐기** 그 방향 자체를 접음 / **보고서** 실측과 제안만, 적용은 짝이 되는 브리프가 함.

## 1. 정본

| 파일 | 무엇 |
| --- | --- |
| `brand.md` | 브랜드 정본. 정의문, 코어 둘, 원칙, 약속, 목소리, 이름과 뜻, 이벤트 어휘, 숫자, 금지어, 시각 |
| `../CHANGELOG.md` | 바뀐 것의 기록(레포 루트, 하나뿐) |
| `../CLAUDE.md` | 일하는 규칙 |

## 2. 브리프 (주제별, 날짜순)

### 구조와 레이아웃 (홈과 크로싱 서울 페이지)

| 날짜 | 파일 | 한 줄 | 상태 |
| --- | --- | --- | --- |
| 09-15 | `naru-launch-brief.md` | 8월 사이트를 나루 런칭 사이트로 | 적용 (bd0279b) |
| 09-15 | `crossing-seoul-positioning-brief.md` | 크로싱 서울 포지션 첫 반영 | 적용, 포지션은 뒤에 여러 번 바뀜(`brand.md` 6장) (459323a) |
| 09-17 | `august-design-language-brief.md` | 홈을 8월 디자인 문법으로 | 적용, 11-05 종이 팔레트로 대체 (a1d0cb7) |
| 09-17 | `home-flow-brief.md` | 히어로 아래에 사진 대신 답 | 적용 (a1ca88c, dc86806) |
| 09-18 | `after-brief.md` | 가치 증명은 마지막 날부터 | 적용 (4f7afce~d73c531) |
| 09-18 | `mobile-fix-brief.md` | 폰 16.5화면을 12화면으로 | 적용 (f093c46~957f2d5) |
| 09-19 | `audit-fix-brief.md` | 09-18 감사 제안 전부 반영 | 적용 (1f47cd6~30977a1) |
| 09-20 | `presentation-review-brief.md` | 상자를 줄이고 목록으로 | 적용 (31de7bd~2bdd710) |
| 09-20 | `hero-recede-fix-brief.md` | 히어로 효과가 보이는 곳에서만 | 폐기, 적용 뒤 같은 날 사용자 요청으로 효과를 걷음 (0d5f8fe, 걷음 edea953) |
| 09-25 | `one-axis-brief.md` | 축을 하나로 | 적용 (653fc91, 2258e07) |
| 09-25 | `readability-brief.md` | 글자 뒤를 고요하게 | 적용 (fcb611c, f1fbc16, 08493f5) |
| 09-29 | `left-edge-brief.md` | 글은 왼쪽 끝, 가운데는 그림 | 적용 (aaccde0) |
| 10-10 | `split-naru-brief.md` | 홈은 크로싱 서울, 나루는 `/naru` | 적용 뒤 10-26 `naru-first-brief.md`로 뒤집힘 (070128e 외 다섯, 뒤집음 308a935) |
| 10-10 | `home-dedupe-brief.md` | 같은 말을 한 번만 | 적용 (f63e32b, fc02e8a, 0088841, 278b407) |
| 10-11 | `site-review-brief.md` | 10-11 리뷰 전부 반영 | 1단계만 적용. 2단계와 3단계는 사용자가 화면을 보고 되돌림(main에 올린 적 없음) (d3ecf08, dcc1acd, 06cbc6f, 97e3821) |
| 10-12 | `signup-nav-brief.md` | 등록 전 빈칸과 세 페이지 칩 | 적용 (e059f86 외 둘, ea4b6c0 외 둘) |
| 10-15 | `visual-brief.md` | 보라 면을 CTA 하나로, 굵기 | 적용 (6d8335f) |
| 10-19 | `hwang-brief.md` | AI 티 걷기(10-19 피드백) | 적용 (8662e20, 92b2e86, a0c631f) |
| 10-24 | `density-brief.md`, `density-mobile-brief.md` | 글은 그대로, 자리만 당김 | 적용 (2fb45e3, e3d8e75, 13b4d61) |
| 10-26 | `naru-first-brief.md` | 홈을 나루로, 크로싱 서울은 `/crossing` | 적용, 지금 구조 (308a935) |
| 11-04 | `site-tells-brief.md` | 바이브 코딩 티 걷기, 정보 양, 종이 팔레트 | 적용(`design/site-tells`) (3fcfba0, 515f955) |
| 11-05 | `merge-paper-brief.md` | 종이 가지를 main에, 백엔드와 도구 페이지 | 적용 (651e963, 합치기 b2d5c79) |
| 11-06 | `first-click-brief.md` | 처음 보는 사람은 어디를 누르나 | 적용 (652f85c) |
| 11-08 | 새 화면(`components/*/redesign/`)은 브리프 없이 들어옴 | 해요체, 공용 헤더 | `brand-voice-brief.md`가 정본을 뒤따라 맞춤 |
| 11-11 | `poster-first-brief.md` | 첫 화면과 공유 카드를 포스터로(사실 넷, 로고 띠, 멘토 줄), 등록 여는 날 11월 16일 | 적용(`design/poster-first`, P6은 main) (7d5e673, 90df562, 06cb89a) |
| 11-12 | `poster-phone-brief.md` | 폰에서 받는 것이 보이게(사실 순서, 받는 것 숫자, 총 200만원, 폰 버튼 하나, 띠 두 칸 격자, 묶음 id) | 적용(`design/poster-phone`) (8a65a6e, e648b82) |

### 배경 (WebGL 캔버스. 2026-11-05 종이 팔레트로 전부 폐기)

| 날짜 | 파일 | 한 줄 | 상태 |
| --- | --- | --- | --- |
| 09-17 | `background-crossing-field-brief.md`, `background-shapes-brief.md`, `background-fix-brief.md` | 건너는 점들, 두 도시 형상 | 폐기 (ca27881, e5206f7, f80304c) |
| 09-19 | `background-naru-symbol-brief.md`, `background-ring-speed-brief.md`, `background-seoul-to-singapore-brief.md`, `background-portrait-parity-brief.md`, `background-ring-jump-and-singapore-detail-brief.md` | 심볼, 파문, 스크롤 전환, 세로 화면 | 폐기 (심볼은 커밋 없이 버림, 서울 경계 eebd8a4, 파문 94218e1, 서울에서 싱가포르로 4b5d0ca, 세로 화면 745f8b5, 9326bc4) |
| 09-23 | `background-singapore-light-speed-brief.md`, `background-one-clock-brief.md`, `background-seoul-presence-brief.md`, `background-chapter-map-brief.md` | 빛의 속도, 시계 하나, 서울의 흐림, 챕터 맞춤 | 폐기 (8df30d1~d1b84ec, a54cacc) |
| 09-24 | `background-portrait-light-motion-brief.md` | 폰에서 빛의 움직임 | 폐기 (440da4d, bf718be) |
| 09-26 | `background-change-under-cover-brief.md` | 형상은 판 뒤에서만 바뀜 | 폐기 (00cc5b4, 925bc0b, 94deb06) |

`lib/background/`는 쓰지 않습니다. 되살리려면 이 열넷이 아니라 `brand.md` 10장부터 봅니다.

### 브랜드와 글

| 날짜 | 파일 | 한 줄 | 상태 |
| --- | --- | --- | --- |
| 09-19 | `gains-detail-brief.md` | 남는 것 다섯에 설명 | 적용 (dabe1a8, ca669ce) |
| 09-19 | `why-brief.md` | 마지막 챕터의 질문 | 적용 (58f30a7, f741ef4, 6ef4773) |
| 09-29 | `naru-identity-brief.md` | 나루 공식 표기 | 적용, 정의문은 `brand.md` 1장 (b8f905f, 546e0dd, 83721d8, 15989eb) |
| 09-30 | `naru-collective-brief.md` | alliance → collective | 적용 (0ffca42, 0435d56) |
| 10-07 | `issue-first-brief.md` | 데이터가 아니라 이슈에서 | 적용 (a8ba2d5, c09d298, 8b34d18, cff02cd) |
| 10-08 | `program-approach-brief.md` | 닷새가 주는 것은 접근 방식 | 적용 (eff9fa9 외 넷) |
| 10-11 | `brand-brief.md` | 브랜드 정본 한 장(`brand.md`의 시작) | 적용 (e4cbeab 외 여섯) |
| 10-24 | `companies-block-brief.md` | 멘토링 상자 셋 자리에 "기업에게" | 적용 (d3215c3) |
| 10-30 | `companies-page-brief.md` | 기업 페이지와 입구 셋 | 대기. `/companies` 페이지는 만들지 않았음. 같은 날 brand 7장 이슈 줄과 문장만 (33ba855) |
| 10-31 | `rephrase-briefs-2026-10-31.md` | 이슈 파트너와 멘토 브리프의 말을 사이트에 | 적용(코드 주석 32곳이 가리킴) (33ba855) |
| 10-31 | `outputs-two-sides-brief.md` | 남는 것은 둘, 한 물건의 양면 | 적용 (01b9585) |
| 10-31 | `talent-two-places-brief.md` | 두 곳의 학교에서 온 학생 | 적용 (82a564e) |
| 11-04 | `catchphrase-brief.md` | "왜 아직, 손으로?" | 적용 (3d5b921) |
| 11-04 | `thinking-position-brief.md` | 포지션은 생각하는 힘, 빌더를 뺌 | 적용 (e8933ca) |
| 11-04 | `catch-answer-brief.md` | 캐치프레이즈 둘째 줄 | 적용, 둘째 줄은 11-05에 다시 바뀜(`brand.md` 6장) (36fcb10) |
| 11-06 | `think-different-brief.md` | 생각과 팀마다 다르게 | 적용 (feddc2c) |
| 11-06 | `write-first-brief.md` | 내가 쓴 것을 AI가 고치게 | 적용 (1c676d9, 2fae552) |
| 11-08 | `brand-voice-brief.md` | `brand.md`를 새 화면의 해요체에 맞춤 | 적용 (0e88d33, e6bd1d2) |

### 크로싱 서울 프로그램 (닷새, 멘토링, 미션)

| 날짜 | 파일 | 한 줄 | 상태 |
| --- | --- | --- | --- |
| 09-20 | `schedule-2026-09-20-brief.md` | 일정 PDF를 화면에 | 적용, 일정은 뒤에 닷새로 바뀜 (fad1d43~290c394) |
| 10-10 | `milestone-mentoring-brief.md` | 마일스톤 지원과 먼저 찾아가는 멘토링 | 적용, "미션"으로 이름 바뀜 (a6fcf71, 27de432) |
| 10-13 | `mentoring-days-brief.md` | 멘토링 상자 셋과 Day 2부터의 미션 | 적용 (a30583e, 6eefa73, 37a8da1, 58c949f) |
| 11-03 | `mentoring-hours-brief.md` | 멘토링 10:00~16:00 점심 없이 | 적용 (4360a71) |
| 11-03 | `mentor-halfday-brief.md` | 멘토 반나절 칸 | 적용(0017). 브리프 파일은 9e6b5a4에서 레포에 들어옴 (673537a) |
| 11-05 | `mentors-section-brief.md` | 멘토 소개 줄 | 적용 (d6313d9) |
| 11-05 | `day-flow-brief.md` | Day 카드마다 하루의 흐름 | 적용 (5bd98cb 외 다섯) |
| 11-08 | `missions-brief.md` | 미션 조건 넷 | `mission-card-brief.md`가 대체 (브리프 0b4ea00, 적용은 bbda6cc) |
| 11-08 | `mission-card-brief.md` | 미션을 펼친 카드로, 세션 뒤 지원 | 적용(그 뒤 누르면 펼쳐지게 바뀜) (bbda6cc, 접기 6f5be85) |
| 11-08 | `booking-cutoff-brief.md` | 멘토 칸 마감, 팀 간격 2시간, 칸 수 제한 없음 | 적용(0022) (ca5ce6b) |

### 등록과 도구 페이지

| 날짜 | 파일 | 한 줄 | 상태 |
| --- | --- | --- | --- |
| 09-18 | `supabase-december-brief.md` | 12월 등록 표 | 적용(0004) (2a864eb, c738739) |
| 10-07 | `registration-form-brief.md` | 신청 폼 항목 | 적용 (5692a68, 9b8c3ef, dcac942) |
| 10-07 | `match-quiz-brief.md` | 현장 팀 매칭 테스트 | 적용 (bd94a1e 외 여섯) |
| 10-08 | `match-humor-brief.md` | 테스트를 더 웃기게 | 적용 (69a2ee6, b2d7aaa, 5a4eeed, 235b168) |
| 11-02 | `register-ux-brief.md` | 등록하려는 학생의 눈 | 적용 (fc3e9dc, 2789d21) |

### 레포

| 날짜 | 파일 | 한 줄 | 상태 |
| --- | --- | --- | --- |
| 11-09 | `readme-brief.md` | README를 읽는 사람 셋으로 | 적용 (dc4af93) |

## 3. 점검과 리뷰 (보고서)

| 날짜 | 파일 | 무엇을 쟀나 | 짝 브리프 |
| --- | --- | --- | --- |
| 06-15 | `audit-backlog-2026-06-15.md` | 8월 사이트 감사 뒤 남은 것(영문) | 없음, 8월 회차 |
| 09-18 | `audit-2026-09-18.md` | 홈 비주얼, 페르소나 8종 | `audit-fix-brief.md` (1f47cd6~30977a1) |
| 10-11 | `review-2026-10-11.md` | 여섯 관점 실측 | `site-review-brief.md` (1단계 d3ecf08 외 셋) |
| 10-11 | `brand-audit-2026-10-11.md` | 브랜드 자료와 사이트 대조 | `brand-brief.md` (e4cbeab 외 여섯) |
| 10-12 | `signup-review-2026-10-12.md` | 등록 퍼널 | `signup-nav-brief.md` (e059f86 외 둘) |
| 10-15 | `visual-review-2026-10-15.md` | 색, 위계, 모션 | `visual-brief.md` (6d8335f) |
| 10-19 | `hwang-audit-2026-10-19.md` | 10-19 피드백 대조 | `hwang-brief.md` (8662e20 외 둘, 8월 페이지 b623031) |
| 10-24 | `lee-review-2026-10-24.md`, `pages-review-2026-10-24.md`, `density-pages-review-2026-10-24.md`, `copy-first-2026-10-24.md`, `keywords-audit-2026-10-24.md` | 10-24 디자인 피드백, 두 페이지 밀도, 글 먼저 초안, 청중별 키워드 | `density-brief.md` 둘, `naru-first-brief.md` (2fb45e3, 13b4d61, 308a935) |
| 10-28 | `company-feedback-2026-10-28.md` | 출제사 피드백 분석 | `companies-page-brief.md` (페이지는 대기, 문장 33ba855) |
| 10-29, 10-30 | `humanize-review-2026-10-29.md`, `humanize-review-2026-10-30.md` | humanize-korean 1차, 2차 | 코드 주석 18곳이 가리킴 (c4b1d13) |
| 11-05 | `humanize-audit-2026-11-05.md` | main 글 감사, 쉼표 여섯 | 적용 (c0f3452) |

## 4. 그 밖

| 폴더 | 무엇 |
| --- | --- |
| `screens/` | 브리프가 쓴 스크린숏과 목업 |
| `readme/` | README의 로고와 화면 |
| `analytics/` | 애널리틱스 기록 |
| `manifesto-web/` | 매니페스토 웹판(ko, en) |

## 5. 앞으로 브리프를 쓰는 기준

- 브리프를 쓰는 때: 파일 셋 이상을 건드리거나, DB와 규칙(마이그레이션, 예약, 미션)을 바꾸거나, 레이아웃과 구조를 바꾸거나, 실측이 근거일 때. 글 열 줄 안쪽의 수정은 브리프 없이 프롬프트로 하고, 결정은 `brand.md`와 `DECIDED` 주석에 바로 남깁니다.
- 브리프는 60줄 안쪽. 0장 지금, 1장 뒤, 결정, 검증, 커밋. 끝에 "결정이 남는 곳" 한 줄(`brand.md` 몇 장, 어느 파일의 주석).
- 적용한 커밋에서 이 파일의 상태를 같이 고칩니다. 대체되면 "대체"와 무엇이 대신하는지 적습니다.
- 보고서는 `-review-` 또는 `-audit-`를 이름에 넣고, 짝 브리프를 3장에 적습니다.
