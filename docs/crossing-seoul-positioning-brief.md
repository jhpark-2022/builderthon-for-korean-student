# 크로싱 서울 포지션 반영 브리프

Claude Code용 후속 작업 지시서. `docs/naru-launch-brief.md`(런칭 브리프)와 `docs/changelogs/changelog-september-15-2026-naru-launch.md`가 끝난 뒤의 상태를 전제로 한다. 런칭 브리프의 3.2 CH4(12월 블록) 지시 중 이 파일과 어긋나는 것은 이 파일이 우선한다.

---

## 0. 한 줄 목표

크로싱 서울을 **"한인 학생 빌더가 국경과 상관없이 만나는 자리"**로 포지션한다. 지금 홈은 12월을 "무대를 한국으로 옮긴다"고 말한다. 그 문장이 서울 개최를 "한국 이벤트"로 읽히게 만들고, 8월과의 서사가 끊긴다. 고치는 것은 카피가 대부분이고, 컴포넌트는 `#december` 제목 구조 하나다.

## 1. 지금 상태 (먼저 읽을 것)

커밋 `bd0279b`부터 `77221d0`까지가 런칭 작업이다. 이 파일들을 읽고 시작한다.

- `docs/changelogs/changelog-september-15-2026-naru-launch.md` 전체. 특히 §2.2(12월은 제로백이 아니다), §5.5(홍보 구조 넷, 크로싱 서울 작명, 아카이브의 12월 서술 수정)
- `lib/naruDates.ts`: 이름은 `DECEMBER_EVENT_NAME = { ko: "크로싱 서울", en: "CROSSING SEOUL" }`로 확정됨. 시작 12/9, 종료 `null`, 도시 서울
- `data/naru.ts`: `hero`, `record.lead`/`gapsNote`, `december` 블록 전체, `join.lead`/`alumni`/`cards[0]`, `footer.credits`
- `components/home/NaruHome.tsx`의 `#december` 챕터(H2가 날짜 + `headingSuffix`, 그 아래 이름, `notSequel`, `lead` 순)
- `app/layout.tsx`의 `SITE_DESCRIPTION`(아직 "다음 이벤트"라고만 쓰고 이름이 없다. 주석도 "이름이 없어서"라고 돼 있어 낡았다)
- `app/opengraph-image.tsx` 마지막 줄 "Next event 9 Dec 2026 Seoul"
- `data/dictionary.ts`에서 크로싱 서울을 말하는 자리(`about.visionIntro`, `about.visionSteps[2]`, `program.awards.next`, `benefits`, `faq`, `wrap.next`)

지금 카피에서 포지션과 어긋나는 문장은 셋이다.

| 키 | 지금 | 문제 |
| --- | --- | --- |
| `december.lead` | "코어는 그대로 두고 무대를 한국으로 옮깁니다." | 한국 이벤트로 읽힌다 |
| `december.who` | "한국 대학생과, 싱가포르에서 8월을 건넌 사람들이 같은 무대에 섭니다." | 대상이 두 집단으로 닫혀 있다. 싱가포르 밖의 다른 나라 한인 유학생이 자기 자리를 못 찾는다 |
| `hero.sub` | "다음 이벤트 크로싱 서울은 12월 9일에 시작합니다." | 날짜만 있고 무엇인지가 없다 |

## 2. 포지션 (확정, 2026-09-15)

- **크로싱 서울 = 한인 학생 빌더가 국경과 상관없이 만나는 자리.** 8월은 싱가포르 안에서 열렸다. 12월은 한국의 대학생과 해외의 한인 유학생이 같은 문제 앞에 선다. 첫 자리가 서울이고, 다음 크로싱은 어디든 될 수 있다.
- 코어 둘은 그대로다. 넓어지는 것은 판이다.
- 이름과 맞물린다. "크로싱"은 8월의 기록("59명이 8일을 건넜습니다")에서 온 동사인데, 국경을 두고 읽으면 한 겹이 더 생긴다. 건너는 주체는 언제나 참가자 각자다. 나루가 국경을 건너거나 잇는 것이 아니다.
- 두 가지를 조심한다.
  1. 이것은 "한인 전용 vs 넓게"(비한인 포함 여부, 미결)와 다른 축이다. 국경을 여는 것이지 한인이라는 범위를 여는 것이 아니다. 영문에서 Korean을 빼지 않는다.
  2. 한국 안의 독자에게 "한인"은 교포나 유학생으로 읽힌다. 12월 블록에서는 한 번은 "한국의 대학생과 해외의 한인 유학생"으로 풀어 쓴다.

## 3. 고칠 것

모든 문자열은 `{ ko, en }`. 문체는 지금 `data/naru.ts`와 같게(평서체, 짧은 문장, 주어 "우리"). 아래 카피는 기준이지 정답이 아니다. 문장은 다듬되 뜻과 규칙(5장)은 지킨다.

### 3.1 `#december` 챕터 (`data/naru.ts` `december` + `NaruHome.tsx`)

제목 구조를 바꾼다. 지금은 H2가 날짜이고 이름이 그 아래 작은 주황 줄이다. 포지션이 제목이 되어야 한다.

```
아이브로   다음 이벤트 · 크로싱 서울 · 2026.12 서울      (이름은 decemberEventLabel, 날짜는 naruDates에서)
H2        국경과 상관없이, 한인 학생 빌더가 만나는 자리.
서브       2026년 12월 9일부터, 서울.                     (formatDecemberRange 그대로. 종료일이 null이면 "부터"까지만)
notSequel  (그대로)
lead       (아래로 교체)
```

- `december.eyebrow`: 이름을 포함시킨다. `DECEMBER_EVENT_NAME`이 `null`로 돌아가는 경우(다음 크로싱이 이름 없이 시작할 때)에도 깨지지 않게 `decemberEventLabel(locale)`로 조립한다. 지금의 이름 줄(`text-[#F2B183]`)은 아이브로에 이름이 들어가므로 뺀다. `nameTbd` 키는 지우지 않는다(주석의 이유 그대로).
- `december.heading` 신설: ko "국경과 상관없이, 한인 학생 빌더가 만나는 자리." / en "Where Korean student builders meet, whichever country they study in." `headingSuffix`는 지운다(날짜가 제목에서 내려오므로 쓸 곳이 없다).
- 날짜는 서브 한 줄로 내린다. `formatDecemberRange(locale)` + 도시. 문자열을 직접 쓰지 않는다.
- `december.lead` 교체: ko "8월은 싱가포르 안에서 열렸습니다. 12월은 한국의 대학생과 해외의 한인 유학생이 같은 문제 앞에 섭니다. 학교도 나라도 다르지만 같은 자리입니다. 코어는 둘 그대로이고, 넓어지는 것은 판입니다." / en에서도 "Korean"을 유지한다.
- `december.who` 교체: ko "한국의 대학생, 해외의 한인 유학생, 그리고 8월을 싱가포르에서 건넌 사람들." 인원과 비율은 쓰지 않는다(`TODO: confirm` 주석 유지).
- `december.changes`에 한 항목 추가(맨 앞): ko "8월은 싱가포르 세 학교 안이었습니다. 12월은 어느 나라에서 공부하든 옵니다." 기존 둘은 그대로.
- `december.whyLabel` / `december.why` 신설(선택 블록, `changes` 아래): "왜 국경을 여는가" 두 줄. ① 한 번으로는 사례가 되지 않고, 메시지는 싱가포르를 넘어야 합니다. ② 안전하게 도전하고 자기 가치를 증명할 자리는 어느 나라 학교 안에도 없습니다. 세 번째 줄("12월은 흩어져 있던 사람들이 한곳에 모이는 시기")은 유학생 귀국 규모가 미검증이라 **넣지 않는다.** 주석으로 `TODO: confirm`만 남긴다.
- `december.tbd`: 손대지 않는다.
- 크로스보더 문제 각도(기획 초안의 "동남아 진출 한국 기업이 문제를 열고 한국 학생은 한국 시장, 싱가포르 학생은 싱가포르 시장의 눈으로 본다")는 출제사가 확정되기 전이라 **싣지 않는다.** `december` 블록 주석에 `TODO: confirm`으로 적어 둔다. 확정되면 이 포지션의 가장 구체적인 증거가 되니 `changes`에 한 항목으로 들어갈 자리다.

### 3.2 히어로 (`hero`)

- `hero.sub` 교체: ko "2026년 8월, 싱가포르에서 59명이 8일을 건넜습니다. 12월 9일 서울, 크로싱 서울에서는 국경과 상관없이 만납니다." 이름은 `decemberEventLabel`, 날짜는 `formatDecemberStartShort`로 조립한다(지금 문자열에 박혀 있다면 꺼낸다).
- `hero.eyebrow`: 지금 "싱가포르 한인 학생 빌더 커뮤니티". **바꾸지 않는다.** 나루의 정체성 문구는 Overview와 로고 링(SINGAPORE)에 묶여 있고 사용자가 정한다. 주석에 `TODO: confirm. 12월이 국경을 여니 "싱가포르에서 시작한 한인 학생 빌더 커뮤니티"가 후보`라고만 적어 둔다.

### 3.3 8월의 기록 (`record`)

- `record.lead`의 "싱가포르에서 8일이었습니다"를 "싱가포르 안에서 8일이었습니다"로. "안에서"가 12월의 "국경과 상관없이"와 짝이 되는 말이라 일부러 둔다.
- `record.gapsNote` "그래서 12월 이벤트가 있습니다"는 이름이 생겼으니 "그래서 크로싱 서울이 있습니다"로. `decemberEventLabel`로 조립.

### 3.4 함께하는 길 (`join`)

- `join.cards[0]`(참가자) 첫 줄: "따로 들어오는 절차가 없습니다. 어느 나라에서 공부하든, 이벤트에 오면 됩니다."
- `join.cards[1]`(학생회)와 `how.layers[1]`: "각 학교 한인 학생회"는 그대로 둔다. 한국 안의 학교에서 누가 주관 자리에 서는지는 미정이다. 한국 쪽 주체(창업학회 등)를 지어내 쓰지 않고, 주석에 `TODO: confirm`으로만 남긴다.
- `join.alumni`: 그대로. 이미 포지션과 맞는다.

### 3.5 메타데이터와 공유 카드

- `app/layout.tsx` `SITE_DESCRIPTION`: "싱가포르 한인 학생 빌더 커뮤니티. 안전하게 도전할 자리와 자기 가치를 증명할 경험을 만듭니다. 다음 이벤트 크로싱 서울은 2026년 12월 9일 서울에서 시작합니다. 한국의 대학생과 해외의 한인 유학생이 국경과 상관없이 만나는 자리입니다." 이름을 `DECEMBER_EVENT_NAME`에서 읽어 조립하고, "이름이 없어서"라는 낡은 주석을 고친다.
- `app/opengraph-image.tsx` 마지막 줄: "CROSSING SEOUL  9 Dec 2026" 그리고 그 아래 작은 줄 "Korean student builders, wherever they study". 위의 "Korean student builders in Singapore"(나루 정체성 줄)는 그대로.
- `metadata.keywords`에 "크로싱 서울", "CROSSING SEOUL" 추가.

### 3.6 아카이브 (`data/dictionary.ts`)

크로싱 서울을 "무엇인지" 설명하는 문장 두 곳에만 국경 한 구절을 더한다. 나머지(`program.awards.next`, `benefits`, `faq`)는 자리 안내 문장이라 손대지 않는다.

- `about.visionSteps` 크로싱 서울 칸 `body`: "같은 코어를 잇는 다음 이벤트입니다. 이번에는 raw data에서 시작해 무엇이 문제인지 찾는 데서부터 열고, 한국의 대학생과 해외의 한인 유학생이 국경과 상관없이 만납니다."
- `wrap.next`: 현재 문장 끝에 "이번에는 국경과 상관없이 만나요." 한 문장을 더한다.

## 4. 하지 않는 것

- `DECEMBER_EVENT_NAME`, 날짜, `tbd` 목록을 건드리지 않는다.
- `december.notSequel`을 지우지 않는다.
- 참가 인원, 비율(1:1), 유학생 귀국 규모, 출제사, 한국 쪽 주관 주체를 쓰지 않는다.
- `hero.eyebrow`, `how.layers`, 로고, 팔레트, 배경, `/2026-08`의 크레딧을 건드리지 않는다.
- 12월 상세 라우트를 만들지 않는다(2단계).

## 5. 카피 규칙 (런칭 브리프 6장에 더하는 것)

- 국경에 관한 말은 "국경과 상관없이 만난다"로 쓴다. 나루를 주어로 "국경을 넘는다/건넌다/잇는다"라고 쓰지 않는다. 건너는 건 각자가 한다.
- "글로벌", "월드와이드", "디아스포라", "해외 각지" 같은 큰 말을 쓰지 않는다. 나라 이름은 싱가포르와 한국만 실제로 나오고 그 밖은 "어느 나라에서 공부하든"으로.
- "한인 학생 빌더"는 나루의 용어라 그대로 쓰되, 12월 블록에서 한 번은 "한국의 대학생과 해외의 한인 유학생"으로 풀어 쓴다.
- 영문: "Korean student builders, whichever country they study in" 또는 "wherever they study". Korean을 빼지 않는다.
- em dash 금지. 12월에 관해 "빌더톤", "2회차", "제로백"을 쓰지 않는다(`notSequel` 예외 그대로).

## 6. 검증과 마무리

1. `npx tsc --noEmit`, `npm run build` 통과.
2. `grep -n "글로벌\|디아스포라\|월드와이드\|국경을 넘\|국경을 건너\|국경을 잇\|해외 각지" data/naru.ts components/home/ app/layout.tsx app/opengraph-image.tsx`가 0건.
3. `grep -n "무대를 한국으로\|한국으로 옮" data/naru.ts data/dictionary.ts`가 0건.
4. 런칭 브리프 8.3의 금지어·이름 검사를 다시 돌린다. `december` 블록에 제로백·Zero100·빌더톤·2회차는 `notSequel` 한 줄뿐이어야 한다.
5. 눈으로 확인: `december`와 `join` 블록에 한국 안의 대학생이나 해외 한인 유학생 어느 한쪽만 대상으로 읽히는 문장이 없는지. 한국 독자가 "한인"을 자기 얘기로 읽을 수 있게 풀어 쓴 문장이 12월 블록에 한 번은 있는지.
6. 스크린샷 `.shots/naru/`에 추가: `home-375-ko-december.png`, `home-375-en-december.png`, `home-1440-ko-december.png`, `home-1440-en-december.png` 갱신 + 히어로 `home-375-ko.png`/`-en.png` 갱신. 375px에서 새 H2가 세 줄을 넘지 않는지, 아이브로(이름 포함)가 한 줄에 드는지 본다. 넘치면 아이브로에서 날짜를 빼고 서브에만 둔다.
7. OG 이미지를 `next start` 후 `/opengraph-image`로 열어 마지막 두 줄이 겹치지 않는지 본다.
8. 체인지로그: 기존 `changelog-september-15-2026-naru-launch.md`에 덧붙이지 말고 `docs/changelogs/changelog-september-XX-2026-crossing-seoul-positioning.md`를 새로 쓴다. 문제 → 결정 → 바뀐 키 목록 → 확인 방법 → TODO: confirm(히어로 아이브로 후보, 귀국 시기 줄, 크로스보더 문제 각도, 한국 쪽 주관 주체).
9. 커밋 메시지: `feat: 크로싱 서울을 국경과 상관없이 만나는 자리로 포지션한다`. 브랜치는 `naru-launch`에서 이어서. **프로덕션 배포는 하지 않는다.** `npx vercel` 프리뷰 URL만 보고한다.
