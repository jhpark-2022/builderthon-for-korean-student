# 나루 부제 개정 브리프: alliance → collective, 링의 of 빼기 (2026-09-30)

`docs/naru-identity-brief.md`(2026-09-28, 이미 반영됨)의 **후속**입니다. 그 브리프의 원칙(아카이브 불변, 12월 이벤트 문구 불변, 법적 형태 표기 금지)은 그대로 유효합니다. 이 브리프는 바뀐 것만 다룹니다.
레포 규칙은 `CLAUDE.md`를 따릅니다(체인지로그는 `CHANGELOG.md` 맨 위 한 항목, `DECIDED` 주석, em dash 금지).
아래 행 번호는 `ce26434` 기준입니다. 어긋나면 적힌 문자열로 찾으세요.

## 시작 전에

- `git status`를 봅니다. 이 브리프 파일(`docs/naru-collective-brief.md`, untracked) 말고 **커밋되지 않은 변경이 있으면 아무것도 고치지 말고 멈춰서 보고**하세요.
- 깨끗하면 `main`에서 브랜치 `naru-collective-2026-09-30`을 만들고 작업합니다. `main`에 푸시하지 않습니다. 배포는 사용자가 합니다.

## 0. 무엇이 바뀌었나 (DECIDED 2026-09-30, 사용자)

1. 나루는 단체들의 연합이 아니라 **개인들이 모인 그룹**이라 alliance를 버리고 **collective**로 갑니다.
2. 링 아랫줄이 "OF"로 시작하는 게 거슬린다는 판단으로, **링에서만 of를 빼고** 양옆(3시, 9시)에 주황 점을 찍어 윗줄과 아랫줄을 나눕니다.

| 항목 | 지금 사이트 | 바꿀 값 |
| --- | --- | --- |
| 영문 부제 (문장으로 쓸 때) | A Korea-rooted alliance of student builders | **A Korea-rooted collective of student builders** |
| 로고 링 위 | A KOREA-ROOTED ALLIANCE | **A KOREA-ROOTED COLLECTIVE** |
| 로고 링 아래 | OF STUDENT BUILDERS | **STUDENT BUILDERS** (+ 양옆 주황 점) |
| 링을 대문자 두 줄로 옮겨 적는 자리 (푸터) | A KOREA-ROOTED ALLIANCE / OF STUDENT BUILDERS | **A KOREA-ROOTED COLLECTIVE / STUDENT BUILDERS** |
| 국문 부제 (웹 한글 화면) | 한국에 뿌리를 둔 학생 빌더 연합 | **한국에 뿌리를 둔 학생 빌더 모임** (TODO: confirm) |
| 규칙 | alliance는 영문 부제에만 | **alliance, 연합은 나루를 가리키는 말로 쓰지 않는다** |

정의 문장(정식 판, 짧은 판)은 **바뀌지 않았습니다**. `data/naru.ts` 535~536행, 2384~2385행 그대로 둡니다.

정본: `~/Dropbox/Uni/Extra Curriculur/12월 빌더톤/그룹 기획/나루_로고_확정/` (`나루_로고가이드_v2_2026-09-30.pdf`). 이번에 바뀐 원본은 SVG/PNG 01~03(마스터)과 12~14(설명형 락업)입니다. 사이트는 12~14를 쓰지 않습니다. 09~11(기본 락업), 이름만 락업(15~17), 심볼은 그대로라 `naru-lockup-v2-rev.png`, `naru-name-*`, `naru-symbol.svg`는 건드리지 않습니다.

## 1. 로고 자산 (`public/naru/`)

사이트는 이미지를 1년 immutable 캐시로 내보냅니다(README 2026-09-29). **같은 이름으로 덮지 말고 `-v3-` 새 이름**으로 만들고 v2 두 파일은 지웁니다.

### 1.1 `naru-master-v3-rev.png` (한글 화면)

원본 `~/Dropbox/Uni/Extra Curriculur/12월 빌더톤/그룹 기획/나루_로고_확정/PNG/naru_03_마스터_반전.png`(1024², 투명 배경). README 규칙대로 투명 여백을 잘라내고 긴 변 900px로 저장합니다.

### 1.2 `naru-master-en-v3-rev.svg` (영문 화면)

`naru-master-en-v2-rev.svg`를 복사해서 **세 군데만** 고칩니다. 가운데 아웃라인 NARU, 심볼, `@font-face`는 그대로입니다.

1. 링 윗줄: `letter-spacing="0.9"` → `letter-spacing="0.3"`, 글자 `A KOREA-ROOTED ALLIANCE` → `A KOREA-ROOTED COLLECTIVE`
2. 링 아랫줄: `letter-spacing="1.2"` → `letter-spacing="3"`, 글자 `OF STUDENT BUILDERS` → `STUDENT BUILDERS`
3. 아랫줄 `</text>` 바로 뒤에 주황 점 둘:
   `<circle cx="21" cy="180" r="4.5" fill="#EE8A4F"/><circle cx="339" cy="180" r="4.5" fill="#EE8A4F"/>`

값은 원본 `SVG/naru_03_마스터_반전.svg`와 같습니다(font-size 23 유지). 렌더해서 원본 PNG와 링 글자 위치가 같은지 나란히 비교하세요.

### 1.3 참조 바꾸기

| 파일 | 행 | 바꿀 것 |
| --- | --- | --- |
| `components/home/NaruHome.tsx` | 1147 | `"/naru/naru-master-en-v2-rev.svg"` → `v3`, `"/naru/naru-master-v2-rev.png"` → `v3` |
| `components/home/NaruHome.tsx` | 1146 | 주석 "2026-09-29: v2 파일명" 뒤에 "2026-09-30: v3(링 COLLECTIVE, 아랫줄 of 뺌)" |
| `lib/background/shaders/water.ts` | 291 | 주석의 `naru-master-v2-rev.png` → `naru-master-v3-rev.png` |
| `public/naru/README.md` | 20 | 표의 `naru-master-v2-rev.png` → `naru-master-v3-rev.png` |
| `public/naru/README.md` | 55, 61, 63 | 파일명 v3로. 61행 "위 A KOREA-ROOTED ALLIANCE, 아래 OF STUDENT BUILDERS" → "위 A KOREA-ROOTED COLLECTIVE, 아래 STUDENT BUILDERS, 양옆 주황 점" |
| `public/naru/README.md` | 71행 뒤 | 한 줄 추가: "2026-09-30: 부제 alliance → collective, 링 아랫줄은 of를 빼고 양옆 점으로 나눔(로고 가이드 2026-09-30판). 마스터 두 파일을 `-v3-`로. letter-spacing 위 0.3 / 아래 3." |

배경 셰이더는 마스터 PNG를 **주석에서만** 가리킵니다(코드가 읽지 않음). 크기와 위치 상수는 바꾸지 않습니다.

## 2. 매니페스토 PDF

그룹 기획 폴더의 `매니페스토_나루.pdf`(986,639바이트)가 새 표지 링으로 다시 나왔습니다.

| 파일 | 행 | 할 것 |
| --- | --- | --- |
| `public/naru/` | | `naru-manifesto-v3-2026-09.pdf`로 복사, `naru-manifesto-v2-2026-09.pdf` 삭제 |
| `data/naru.ts` | 113 | `manifesto: "/naru/naru-manifesto-v3-2026-09.pdf"` |
| `components/home/NaruHome.tsx` | 1485~1486 | 주석 파일명 v3로, "(2026-09-30 v3: 986,639바이트라 0.9MB 그대로)". 1489행 `PDF 0.9MB`는 그대로 |
| `public/naru/README.md` | 74~75 | `naru-manifesto-v3-2026-09.pdf`, "(2026-09-30 v3: 링 COLLECTIVE. v2는 지웠습니다)" |

## 3. 문구

| 파일 | 행 | 바꿀 것 |
| --- | --- | --- |
| `data/naru.ts` `hero.eyebrow` | 349~350 | ko `한국에 뿌리를 둔 학생 빌더 모임` / en `A Korea-rooted collective of student builders` |
| `data/naru.ts` `hero` 위 주석 | 342~347 | 부제를 새 문구로. "연합에 해당하는 영문 낱말은 영문 부제에만 씁니다" → "alliance, 연합은 나루를 가리키는 말로 쓰지 않습니다(DECIDED 2026-09-30: 나루는 단체의 연합이 아니라 개인이 모인 그룹)". "(로고 v2의 링과 같음)" → "(링에서는 of를 빼고 두 줄로 나눔)". 국문 부제 TODO: confirm은 새 번역안 "모임"으로 유지 |
| `data/naru.ts` `eventHero` 위 같은 주석 | 391~396 | 위와 똑같이. `naruLine` 문구(402~403)는 alliance가 없으니 그대로 |
| `data/naru.ts` `footer.subtitle` | 2382 | ko, en 둘 다 `A Korea-rooted collective of student builders` |
| `data/naru.ts` `footer` | 2382 다음 줄 | 새 필드 `subtitleRing: { top: "A Korea-rooted collective", bottom: "Student builders" },` 위에 주석 "DECIDED 2026-09-30 (사용자): 링 글자를 옮겨 적는 자리라 링과 같이 of를 뺍니다. 문장으로 쓰는 부제는 subtitle" |
| `app/opengraph-image.tsx` `alt` | 7 | `... 나루 NARU, a Korea-rooted collective of student builders.` |

### 3.1 푸터 부제 렌더 (`components/home/NaruHome.tsx` 1575~1583)

지금은 `footer.subtitle`을 `" of "`에서 잘라 두 줄로 만듭니다. collective로 바꾸면 아랫줄이 다시 "OF STUDENT BUILDERS"가 되므로 **자르는 코드를 없애고** `subtitleRing` 두 줄을 그대로 그립니다. 스크린리더에는 문장 부제를 읽힙니다.

```tsx
{/* 로고 가이드 2026-09-30: 링처럼 "A KOREA-ROOTED COLLECTIVE / STUDENT BUILDERS" 두 줄. 링에서는 of를 뺍니다
    (사용자: 아랫줄이 OF로 시작하는 게 거슬림). 스크린리더는 문장 부제(footer.subtitle)를 읽습니다. */}
<p lang="en" className="text-[0.68rem] font-bold uppercase leading-relaxed tracking-[0.14em] text-white/60">
  <span className="sr-only">{t(naru.footer.subtitle)}</span>
  <span aria-hidden="true" className="block">{naru.footer.subtitleRing.top}</span>
  <span aria-hidden="true" className="block">{naru.footer.subtitleRing.bottom}</span>
</p>
```

1572~1573행 주석의 "부제는 로고 링과 같은 글자라"는 그대로 맞습니다.

## 4. 건드리지 않는 것

- `data/dictionary.ts`, `components/journey/*` (8월 아카이브). `Journey.tsx`의 "Startup Alliance"는 파트너 이름이라 그대로.
- `CHANGELOG.md`의 지난 항목, `docs/`의 지난 브리프, `.shots/naru-identity/`.
- `app/layout.tsx`의 description, keywords (alliance, 연합이 없음).

## 5. 검증

1. `npm run build` 통과.
2. 아래가 모두 0건:
   - `grep -rni "alliance\|학생 빌더 연합" app components/home components/ui data/naru.ts lib` (README는 날짜가 붙은 이력 줄, 64~65행만 남아야 합니다)
   - `grep -n "ALLIANCE\|OF STUDENT BUILDERS" public/naru/*.svg`
   - `grep -rn "naru-master-v2-rev\|naru-master-en-v2-rev\|naru-manifesto-v2" app components lib data public/naru/README.md`
   - `ls public/naru | grep "master.*v2\|manifesto-v2"`
3. `.shots/naru-collective/`에 ko, en × 1440, 390:
   - `#naru` 마스터 로고: 링 윗줄 COLLECTIVE, 아랫줄 STUDENT BUILDERS, 양옆 주황 점. 글자가 링 선에 닿거나 잘리지 않는지
   - `#naru` 아이브로(ko "…학생 빌더 모임", en "…collective of student builders")
   - 푸터 부제 두 줄(OF가 없는지), 390에서 줄이 더 꺾이지 않는지
   - `/opengraph-image`
   - 영문 화면에 한글 0곳
4. 매니페스토 버튼으로 받은 PDF 표지의 링이 새 문구인지.

## 6. 커밋과 체인지로그

- 커밋 셋: `feat(brand): 마스터 로고 v3 (링 COLLECTIVE, 아랫줄 of 뺌)` / `feat(copy): 부제 alliance → collective, 푸터는 링 두 줄` / `docs(changelog): 2026-09-30 naru collective`.
- `CHANGELOG.md` 맨 위 한 항목(25줄 이내, 앵커 `2026-09-30-naru-collective`)과 목차 맨 위 링크 "2026-09-30 부제는 collective, 링에서는 of를 뺀다". 브리프: `docs/naru-collective-brief.md`(이 파일도 같이 커밋).
- 끝나면 바꾼 파일, grep 결과, 스크린샷 경로를 요약해 보고하고 멈춥니다.
