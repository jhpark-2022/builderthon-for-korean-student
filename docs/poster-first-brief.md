# 브리프: 첫 화면과 공유 카드를 포스터로 (2026-11-11 주간 회의)

대상: `/crossing`(`components/crossing/redesign/`), 공유 카드(`lib/ogCards.tsx`), 등록 여는 날 문구. 정본 `docs/brand.md`를 먼저 읽습니다. 근거: 포스터를 따로 만들지 않고 카카오톡 방에 링크를 올리기로 했습니다. 방에서 먼저 보이는 것은 미리보기 카드, 그다음이 폰 첫 화면이라 이 둘이 포스터 몫을 합니다. 판단 질문 2(무대가 진짜라는 사실을 첫 화면에서 보임). P6은 `main`에서 먼저 따로 커밋하고, P1~P5는 가지 `design/poster-first`에서 합니다.

## 0. 지금 (배포본 실측 2026-11-11, 1440x900과 390x844)

| 자리 | 지금 |
| --- | --- |
| 공유 카드 | 이름과 날짜만 큼. 캐치프레이즈는 바닥 26px, 로고 0(Lovable 승인 조건은 포스터와 SNS에도 로고) |
| 히어로 글 | 캐치프레이즈 아래 설명 네 줄(`C.sub`, `C.naruLine`). 어디서, 누가, 무엇을 받는지는 첫 화면에 없음 |
| 로고 | `#partners`가 1440에서 y 3,560(네 번째 화면), 390에서 y 5,035(여섯 번째 화면) |
| 멘토 | 명단은 "멘토 보기" 모달 안에만. 화면 글에 멘토 이름 0 |
| 등록 여는 날 | "11월 14일(토)" 여섯 자리 |

## 1. 뒤

| # | 자리 | 뒤 |
| --- | --- | --- |
| P1 | 히어로 글 | 날짜 줄, 워드마크, 캐치프레이즈 두 줄은 그대로. 그 아래 문단(`C.sub`, `C.naruLine`)을 빼고 사실 넷을 `dl`로: 어디서 / 누가 / 받는 것 / 등록(문장은 D1). 이름은 META 굵게, 값은 BODY, 줄 사이 선 `RULE`. 버튼은 1440에서 `dl` 아래, 390에서 `dl` 위. 버튼 아래 `hero-register-note` 줄은 뺌(등록 줄이 같은 말, `aria-describedby`는 그 `dd`로) |
| P2 | 로고 띠 | 히어로와 `#december` 사이에 `section#sponsors-band`. `decemberPartners.groups` 앞의 세 줄(메인 후원은 lead 로고와 note만, 공간 후원 넷, 기술과 크레딧)을 줄 이름(META)과 함께 한 단으로 낮게. 상자 없이 로고만(높이 lg 28px, 폰 22px 안팎, `logoSize`와 흰 실루엣의 잉크 처리는 지금 것 그대로). 끝에 "함께하는 곳 전체 보기"(`#partners`, `LINK`). 폰은 가로 스크롤. `#partners` 장은 그대로 |
| P3 | 멘토 줄 | 로고 띠 아래 `section#mentors`. `d.mentors`의 `confirmed`만. 카드(흰 면, 선 `RULE`, 그림자 없음, 폭 280px 폰 240px)에 이름(BODY 굵게), 소속과 직책(META), `bio`(META, `SOFT`). 왼쪽으로 흐름(`.marquee-track .marquee-left` 방식, 한 바퀴 60초 안팎), hover와 focus에서 멈춤, `prefers-reduced-motion`이면 멈춘 가로 스크롤. 복제한 줄은 `aria-hidden`. 카드를 누르면 지금의 멘토 모달(`setMentorsDay(2)`). 제목은 `d.mentorsListLabel`(HEADING), 아래 한 줄은 `d.mentorsListNote`의 해요체 |
| P4 | 뺀 글의 자리 | `C.sub` 세 줄은 `#december` 리드 칸의 첫 문단으로(그 아래 `C.scheduleLead`). `C.naruLine`은 화면에서 뺌(`#partners` 주최 줄이 같은 말, 키는 남김) |
| P5 | 공유 카드 | `renderHomeCard`: 나루 락업, 캐치프레이즈 첫 줄(56px, 잉크), 워드마크(지금 크기), 날짜와 도시(40px). 바닥 줄의 글 대신 로고 줄: "공간 후원" 넷과 "기술, 크레딧" Lovable(높이 44px 안팎, 원래 색). 흰 실루엣 셋(아산나눔재단, MARU180, FASTFIVE)은 satori에서 필터가 먹지 않으니 `scripts/colorize-partner-logos.py`로 잉크 판을 `public/partners/logos/paper/`에. `OG_DESCRIPTION` 맨 앞에 캐치프레이즈 첫 줄. EN 카드도 같은 틀 |
| P6 | 등록 여는 날 | 11월 14일(토)을 11월 16일(월)로: `copy.ts` `noteShort`, `data/naru.ts` 네 자리(ko와 en "Monday, 16 November"), `README.md`. 여는 시각은 쓰지 않음(`opensAt` 그대로 비움). 등록 창을 여는 스위치는 건드리지 않음 |

## 2. 지키는 것

- 얼굴 사진 없음(2026-11-07 결정). 하는 일로만 적는 멘토는 지금 표기 그대로. 멘토 수, 인원, 금액, 기간, 수량은 쓰지 않음(brand 8장, 9장).
- 2026-11-04 피드백(`site-tells-brief.md`)의 것을 되살리지 않음: 알약, 그라데이션 면, 두 자리 번호, 장식 점, 카운트다운, 이모지 0. 움직이는 것은 멘토 줄 하나.
- 글자 크기는 `components/shared/redesign.tsx`의 다섯 단만, 한 화면에 넷까지. 주황은 워드마크 점에만.
- 로고 조건: 디캠프는 "공간 후원" 이름과 함께 공식 검정 로고, Lovable은 공식 파일 원래 색에 밝은 바탕, "공식 파트너" 류 표현 없음. 비율과 색을 바꾸지 않음(brand 10장).
- 새 한국어는 `copy.ts`(해요체)와 `data/naru.ts`(기본값과 영어)에 같이. `kos`는 길이가 같을 때만 올라갑니다(brand 0장).

## 3. 결정 (기본값으로 진행, D1은 적용 전에 사용자에게 문장을 보여 줌)

| # | 질문 | 기본값 |
| --- | --- | --- |
| D1 | 사실 넷의 문장 | 어디서: 서울. Day 1 FASTFIVE, Day 2 디캠프 선릉, Day 4 MARU180. Day 3은 Zoom으로 만나요. / 누가: 한국의 대학생과 해외에서 공부하는 한인 학생. 혼자 등록하고, 팀은 Day 1 현장에서 꾸려요. / 받는 것: Lovable 크레딧과 워크숍, 트레바리 독서모임 쿠폰. 미션을 해낸 팀은 모두 지원받고, 마지막 날 부문별로 시상해요. / 등록: 11월 16일(월)에 열어요. 소식은 카카오톡에서 먼저 알려요. 확정된 것만 적고, 아직 정해지지 않은 혜택은 넣지 않음 |
| D2 | 로고 띠에 서는 줄 | 앞의 세 줄. 나머지는 "전체 보기" |
| D3 | `C.sub`의 새 자리 | 닷새 리드 첫 문단. 대안: 화면에서 빼고 `brand.md`에만 |
| D4 | "닷새, 이렇게 보내요" 제목, 리드, 사실 셋 | 그대로 둠. 줄이려면 사용자가 범위를 정함 |
| D5 | 멘토 줄의 움직임 | 흐름. 대안: 멈춘 가로 스크롤 |

## 4. 검증

| # | 기준 |
| --- | --- |
| 1 | 390x844 첫 화면에 워드마크, 캐치프레이즈 첫 줄, 첫 버튼(아래 끝 y 640 안). 1440x900 첫 화면에 사실 넷과 버튼, 로고 띠 머리 y 900 안 |
| 2 | 순서 `#top`, `#sponsors-band`, `#mentors`, `#december`. 모달을 열지 않은 화면 글에 멘토 이름 1 이상, `img` 얼굴 0 |
| 3 | 알약 0, 그라데이션 면 0, 새 글자 크기 0, 가로 넘침 0. `prefers-reduced-motion`에서 멘토 줄 정지 |
| 4 | "11월 14일", "14 November"가 `CHANGELOG.md`와 `docs/` 밖에서 0. brand 9장 금지어 0, em dash 0 |
| 5 | 공유 카드 1200x630 렌더(KO, EN). 500px로 줄인 그림에서 로고 줄과 캐치프레이즈가 읽힘 |
| 6 | KO/EN 1440과 390 전후 스크린숏을 `.shots/poster-first/`에. `npm run build` 통과 |

## 5. 커밋

`copy(register): 등록 여는 날 11월 16일(월)`(P6, main) / `design(crossing): 첫 화면을 포스터로, 로고 띠와 멘토 줄`(P1~P4) / `design(og): 공유 카드에 캐치프레이즈와 로고 줄`(P5) / `docs(changelog): 2026-11-11 첫 화면과 공유 카드를 포스터로`. 같은 커밋에 `docs/brand.md`(5장 두 번까지의 괄호, 6장 정체성 문장의 자리, 10장 공유 카드, 맨 위 마지막 손질)와 `docs/README.md` 색인. `main` 푸시는 사용자 확인 뒤. 배포 뒤 카카오 공유 디버거에서 `/crossing` 캐시 초기화(사이트 밖, 사용자).

결정이 남는 곳: `docs/brand.md` 6장(정체성 문장의 자리)과 10장(공유 카드), `CrossingSeoul.tsx`와 `lib/ogCards.tsx`의 `DECIDED 2026-11-11` 주석.
