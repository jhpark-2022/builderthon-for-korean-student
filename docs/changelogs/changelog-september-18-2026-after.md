# Changelog 2026-09-18 (after: 가치 증명은 마지막 날부터 시작한다)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main` (로컬 커밋만. 아래 3절의 네 항목이 정해지기 전에는 푸시하지 않습니다. 팔로업 브리프 9.2)
**Scope:** 홈(`/`)의 새 챕터 `#after`와 그것으로 가는 다리 둘, 이름의 세 번째 겹. 히어로·`#december`·`#record`·
`/2026-08`·등록 라우트·수파베이스는 손대지 않았습니다. 브리프는 `docs/after-brief.md`.

## 1. 무엇을 왜

8월 회차가 끝난 뒤 멘토에게 먼저 연락한 팀이 한 팀이었던 이유는 의지가 아니라 문장·재료·명분·허락·기한이
전부 없었기 때문입니다(브리프 1장). 그래서 이벤트가 끝나는 날을 출발선으로 적는 챕터를 `#record`와 `#naru`
사이에 하나 만들었습니다.

- **`data/naru.ts`**: `december.afterLabel/afterNote/after`를 최상위 `naru.after`로 승격(파일 순서상 `record` 뒤,
  `how` 앞). eyebrow·heading·lead·leadNote·statement·steps 셋·cadence(+cadenceTbd)·weDo 셋. `gains.bridge`,
  `how.nameLabel`을 "이름의 세 겹"으로 바꾸고 `nameLines`에 세 번째 겹, `join.alumni.afterLink`. `naruNav`에
  `after`("끝난 뒤" / "After"). `december` 자리에는 주석 한 줄.
- **`NaruHome.tsx`**: `#after` 챕터(아이브로 → H2 → lead → leadNote → 헤어라인 사이 선언 한 줄 → 할 일 셋 1열 →
  기한 문단 → 나루가 하는 일 셋). 새 컴포넌트 없이 이 페이지의 문법만 썼습니다. `#gains` 끝에 "이걸 들고 어디로
  건너가는가 →", 알럼 띠에 "끝난 뒤에 할 일 →". 둘 다 44px 히트.
- **`AFTER_CADENCE_CONFIRMED = false`**: 7일/한 달이 확정될 때까지 `cadenceTbd`가 그려집니다. 화면에 "7일", "한 달"이
  없습니다(검증).
- **알럼 띠 둘째 줄**("받은 사람이 돌려주는 모습이 보일 때 문화가 됩니다")은 `after.steps[2].body`가 정본이 되어
  뺐습니다. 키는 주석으로 남겼습니다. `nameLines` 세 번째 겹은 `#how` 블록이 `nameLines`를 그리지 않으므로
  화면에는 아직 없습니다(2026-09-16에 내려간 그대로). 데이터만 닫아 두었습니다.

## 2. 검증

- `npx tsc --noEmit` 통과, `npm run build`(스크래치 복사본) 통과. 콘솔 오류 0. 가로 넘침 0. em dash 0.
- 순서: `top → december → gains → record → after → naru → join`. 헤더 칩 일곱, 390px에서 "끝난 뒤"가 활성일 때
  가운데로 오고 오른쪽 페이드가 보입니다.
- 앵커: `#gains` 다리와 알럼 링크를 누르면 `#after` 상단이 헤더(접힌 53px) 아래 64px에 옵니다.
- 대조 문장(9팀 → 한 팀) 거리: 1440 1,753px(두 화면 1,800 안), **390 2,089px(두 화면 1,688 밖)**. 사이에 사람
  탭(828)과 언론 줄(519)이 있어서입니다. 브리프 4.4가 `#record`를 손대지 말라고 해서 그대로 두고 보고합니다.
- 문서 높이: 390×844 **13,522px**(상한 14,000 안, `#after` 1,925). 1440×900 12,086(`#after` 1,698).
- 영문: 새 키 전부 en 있음. `?lang=en`으로 확인.

## 3. 사용자가 먼저 정해야 하는 것 (미확정, 그래서 푸시 보류)

1. `weDo[0]` 멘토 명단과 연락 방법을 참가자에게 보내는 것. 멘토 각자의 동의. "동의한 멘토에 한해"로 바꿀지.
2. `weDo[1]`, `steps[1]` 마지막 날 공고 형식으로 기회를 여는 것. 출제사와 먼저 합의.
3. `weDo[2]` 먼저 연락한 사람의 이야기를 다음 회차에 싣는 것. 동의 문구.
4. `cadence` 7일과 한 달. 정하면 `AFTER_CADENCE_CONFIRMED`를 `true`로, `cadenceTbd`와 주석 삭제.
5. `after.lead`의 "한 팀"이 맞는지. 아니면 "이벤트가 끝난 뒤에 먼저 연락한 사람은 거의 없었습니다"로(브리프 5장).
