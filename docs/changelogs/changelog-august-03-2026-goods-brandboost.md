# Changelog — August 3, 2026 (브랜드부스트 굿즈 확정)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/dictionary.ts`, `data/schedule.ts`. No component changes.

## The fact (8/3 미팅에서 확정)

굿즈 = **후드 + 캡(모자) 세트 60개**, **브랜드부스트**(brandboost.kr) 제공,
**Day 1(8/22) 전 도착 확정**, **Day 1 현장 방문자 선착순** 배포.

확정 항목이므로 사이트 어디에도 "검토 중 / 논의 중" 류 헤지를 붙이지 않았습니다.
**배송지·비용 등 물류 정보는 사이트에 쓰지 않았습니다** — 참가자가 알아야 할 것은
"무엇을, 언제, 어떤 조건으로 받는가"뿐이고, 그 세 가지만 적었습니다.

## The overclaim this fixes

굿즈가 미정이던 동안 두 곳이 서로 다른 말을 하고 있었습니다:

| where | old |
|---|---|
| benefits 06 | "굿즈 (pen·notes) 등 · 검토 중" — 품목도 진행 여부도 미정 |
| FAQ 상금 답변 | "순위에 못 들어도 **밥·굿즈·네트워킹은 전원에게** 돌아가며" |

60세트 선착순으로 확정된 순간 FAQ 문장이 **과약속**이 됩니다. 전원이 받는 것은
밥과 네트워킹이고, 굿즈는 아닙니다. 두 문장 모두 이번에 정리했고, 각 키에 왜
'전원'이 빠졌는지를 주석으로 남겼습니다 (두 곳이 같은 사실을 말하므로 함께
움직여야 한다는 메모 포함).

## 수정한 4곳

**1. `dict.benefits.items` 06 인턴십·상금**

```
- 굿즈 (pen·notes) 등 · 검토 중
+ 브랜드부스트 굿즈 — 후드·캡 세트, Day 1 현장 선착순 60세트
+ Brand Boost goods — a hoodie + cap set, 60 sets on a first-come basis on Day 1
```

수량(60)과 '선착순'은 한 줄 안에 세트로 둡니다 — 이 카드의 다른 줄과 달리 여기는
전원에게 가지 않는 항목이라, 둘 중 하나만 남으면 다시 과약속이 됩니다.

**2. FAQ "상금이나 현금 지원이 있나요?"** — 한 문장을 둘로 쪼갬:

> …순위에 못 들어도 **밥과 네트워킹은 전원에게** 돌아갑니다. **브랜드부스트 후드·캡
> 세트는 Day 1 현장에서 선착순 60세트로** 드리고, 수료증은 크래시코스 전 시간을
> 들으면 받습니다.

EN도 같은 구조로 분리 ("the food and the networking still go to everyone. The
Brand Boost hoodie + cap sets go out on Day 1 on site, 60 sets first-come…").
나머지 톤·순서·※ 주석은 그대로 뒀습니다.

**3. `schedule.ts` Day 1**

Day 1은 필참이고 선착순은 **일찍 올 이유**를 만드는 레버라, 카드에서 보이는 자리에
넣되 이미 긴 요약을 더 늘리지는 않았습니다:

- `days[0].summary` (날짜 카드) — 끝에 `· 현장 선착순 굿즈` / `· goods on site,
  first come first served` 한 절만.
- `d1-orientation.summary` (Day 1 모달의 세션 카드) — `· 선착순 굿즈`.
- `d1-orientation.description` — 확정 내용 전부가 여기 한 번만:
  > 오늘 현장에는 굿즈 파트너 브랜드부스트가 준비한 후드·캡 세트가 **60개** 있습니다
  > — 현장 방문자 **선착순**으로 드리니, 받고 싶다면 일찍 오는 게 유리합니다.

  오리엔테이션에 붙인 이유는 배포 시점이 Day 1 현장이고, 이 세션이 "오늘 어떻게
  굴러가는지"를 다루는 자리이기 때문입니다 (주석에 기록).

**4. `partnerIntros["Brand Boost"]`** — 항목은 이미 있었고 마지막 문장만 갱신:

```
- …이번 빌더톤의 굿즈를 함께 만듭니다.
+ …이번 빌더톤에는 참가자 굿즈(후드·캡 세트)를 제공하는 굿즈 파트너로 함께합니다.
```

수량·선착순 조건은 이 카드에 쓰지 않습니다 — 여기는 파트너가 누구인지를 설명하는
자리이고, 받는 방법은 혜택 카드·FAQ·Day 1 일정이 말합니다. 타일의 링크는 이미
`https://www.brandboost.kr/`로 연결돼 있어 그대로 두었고, 후원 티어 로고 배치도
변경 없습니다.

## 전수 확인 (`grep 굿즈|goods`)

| 나머지 등장 위치 | 판정 |
|---|---|
| `partners.intro` "장소·마케팅·멘토링·굿즈를 맡아주는 후원사" | 후원사 역할 나열 — 모순 없음, 유지 |
| `partners.catGoods` / `catVenueGoods` 타일 라벨 | 라벨, 유지 |
| `partnerIntros["Korean Association in Singapore"]` "**멘토** 굿즈백" | 받는 대상이 멘토로 명시돼 있어 참가자 굿즈와 충돌하지 않음 — 유지 |

`"전원"`과 `"굿즈"`가 한 문장에 함께 남은 곳은 **없습니다** (KR·EN 모두 확인).

## Verification

- `npx tsc --noEmit` → 0; `npm run build` → ✓ compiled, 10/10 static pages
- 1440px에서 KR·EN 양쪽 실제 렌더 확인: benefits 06 카드, FAQ 답변(펼친 상태),
  Day 1 날짜 카드, Day 1 모달 → 오리엔테이션 세션 카드 → 세션 모달 본문,
  Brand Boost 파트너 모달(+ "사이트 열기" 링크)
- `grep`으로 굿즈 언급 전수 확인 (위 표)

## Files

- `data/dictionary.ts` — `partnerIntros["Brand Boost"]`, `benefits` 06 포인트,
  FAQ 상금 답변 `{ko,en}`
- `data/schedule.ts` — `days[0].summary`, `d1-orientation`의 summary·description
