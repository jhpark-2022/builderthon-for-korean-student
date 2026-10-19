# 브리프: AI 티 걷기 (10/19 피드백)

대상 레포: `website` (`be91292` 기준). 근거는 `docs/hwang-audit-2026-10-19.md`(W1~W16, P1~P11, D1~D9). 정본은 `docs/brand.md`(먼저 읽습니다. 코어와 원칙은 바꾸지 않습니다). `docs/visual-brief.md`(10/15)와 겹치는 항목은 이 브리프가 이깁니다. 줄 번호는 `be91292` 기준이라 어긋나면 클래스 문자열이나 키로 찾습니다.

네 단계. 단계마다 사용자가 스크린숏을 보고 다음으로 갑니다. 1~3단계는 레이아웃을 바꾸지 않습니다. 4단계만 구조입니다.

## 1단계. 글 (P3, P5, P10, W3)

### 1.1 즉시 고칠 셋 (결정 불필요)

| # | 키 | 지금 | 뒤 |
| --- | --- | --- | --- |
| 1 | `december.facts[2].v` | "4일 동안 아침부터 저녁까지. 마지막 날은 제외입니다. 노트북은 각자 가져옵니다." | "4일 모두 아침부터 저녁까지 열려 있고, 노트북은 각자 가져옵니다." EN 같은 뜻 |
| 2 | `december.contextMentoring.body` | 끝 문장 "질문은 이 날 합니다." | 그 문장 삭제 |
| 3 | `december.stages[4].line` | "클로징은 끝난 뒤에 할 일로 끝납니다. 말로 하고, 글로도 남겨 드립니다." | "클로징은 끝난 뒤에 할 일로 끝납니다. 멘토에게 먼저 연락해 무엇을 만들었는지 한 줄을 보내는 것. 말로 하고, 글로도 남겨 드립니다." |
| 4 | `december.facts[4].v` | "1위 한 팀에게 몰아 주는 것보다" | "한 팀에게 몰아 주는 것보다" (정본 9장) |

### 1.2 조각문 열 곳을 자연스러운 문장으로 (W3)

사실은 그대로, em dash와 새 가운뎃점 없음, 정본 5장 문체.

| 키 | 뒤 |
| --- | --- |
| `december.scheduleLead` | "등록은 혼자 하고, 팀은 Day 1 현장에서 전원이 함께 맺습니다. 그 뒤로는 찾기에서 공유하기까지 하루에 한 스테이지씩 넘어갑니다." |
| `december.stages[2].body` | "정의한 문제와 아이디어를 멘토에게 확인받는 날입니다. 무엇을 만들지는 바뀌어도 되고, Day 1의 정의가 바뀌면 운영진에게 알립니다." |
| `december.stages[4].body` | "이슈를 낸 회사 관계자 앞에서 5분 발표하고 5분 질의를 받습니다. 다 풀지 못했어도 무대에 서고, 보는 것은 결과보다 문제에 어떻게 다가갔는지입니다." |
| `gains.items[0].body` | "어느 회사의 어떤 이슈인지 숨기지 않고 회사 이름과 함께 받습니다." |
| `gains.items[1].body` | "Day 2와 Day 3에 하루 두 번까지 찾아갈 수 있습니다." |
| `december.mentoringDay4Line` | "Day 4는 멘토링 없이 성과 공유회 무대에서 질의를 받습니다." |
| `why.cores[0].lines[0]+[1]` (한 문단으로) | "스크리닝도 순위도 없는, 못해도 되는 자리입니다. 여기서 잘하지 못한 것은 어디에도 남지 않고 끝까지 해본 것만 남기 때문에, 우리가 보는 것도 순위가 아니라 완주입니다." |
| `how.layers[*].does` / `gets` | 명사 조각을 서술문 한 문장씩으로. 예: `[0].does` "회차를 기획하고 실행하며, 출제사와 멘토, 후원사와의 관계를 맡고, 회차 사이의 기록을 잇습니다." |
| `how.notDoing[0]`, `[2]` | "회비도 가입 폼도 없어서 들어오는 길은 회차에 오는 것 하나입니다." / "운영진은 보수 없이 실비만 정산합니다." |
| `record.gaps[0].body`, `group.lead` | "완성된 문제를 받으니 결과물이 서로 닮았고, 원인은 참가자의 실력이 아니라 문제의 구조에 있었습니다." / "이벤트는 나루가 학생회와 기업을 잇는 지금의 방식이고, 방식은 바뀌어도 아래 두 개는 바뀌지 않습니다." |

셋 나열 칩: `gains.spine.tangibles` ✓칩 셋은 한 문장 안에 쉼표로(`NaruHome.tsx:1155` 상자 제거와 함께). EN도 같은 길이로 줄입니다.

### 1.3 EN 단축 (W7)

| 키 | 지금 | 뒤 |
| --- | --- | --- |
| `eventHero.countdownLabel.en` | "Until CROSSING SEOUL" | "Countdown" |
| `dictionaryCore.pages[0].en` | "CROSSING SEOUL" | "Home" (워드마크와 같은 글자가 헤더에 둘 서는 것을 막음) |
| `december.programHeading.en` | "From issue to proof, in five days" | "Issue to proof, five days" |
| 푸터 EN "Zero100 builderthon, Aug 2026" | | "Aug 2026" |
| `gains.spine.tangibles.en` | 칩 셋 | 1.2의 문장과 같은 길이 |
| 멘토링 상자 제목 `NaruHome.tsx:606` | `flex items-center` + 점 | 점 제거(2단계)로 2줄 제목이 자연스럽게 |

## 2단계. 라벨의 옷 벗기기 (W1, W4, W5, W16, W7)

| # | 파일:줄 | 지금 | 뒤 |
| --- | --- | --- | --- |
| 2.1 | `NaruHome.tsx:866-869` 히어로 영문 | 글자 하나씩 span, `justify-between` | `<span lang="en" className={`${META} font-bold uppercase text-[#E08A76]`}>{DECEMBER_EVENT_NAME.en}</span>` 한 줄, 자간 0, 가운데 |
| 2.2 | `NaruHome.tsx:226` 카운트다운 라벨 | `uppercase tracking-[0.18em]` + `:227` 점 | 둘 다 삭제. META 굵게 |
| 2.3 | `components/ui/Eyebrow.tsx:44` | `uppercase tracking-[0.18em]` + 알약 테두리 | 제거. 테두리 없는 META 굵게. 8월 페이지가 옛 모양을 유지해야 하면 Journey 호출부에만 className으로 넘김 |
| 2.4 | `shared.tsx:157` eyebrowTrack, `:154` latinTrack | 0.04em / EN 0.14em | `""` / 0.06em 이하 |
| 2.5 | `NaruHome.tsx:689` 카드 DAY 알약 | `rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 tracking-[0.08em]` | 제거. `${META} font-bold text-accent` 글자만 |
| 2.6 | `NaruHome.tsx:1155` ✓칩 | `rounded-full border border-accent/30 bg-accent/[0.1] px-3 py-1 text-white/90` | 상자 제거, 1.2의 문장 |
| 2.7 | `NaruPage.tsx:478, 665, 751` | 자간 라벨 셋 | 자간 0 |
| 2.8 | `NaruHome.tsx:607, 615, 630` ChipDot 3곳, `components/ui/Chip.tsx:36` | 점 | 호출 삭제, 함수 삭제 |
| 2.9 | `shared/RouteMap.tsx:175-177, 233-252` ◉ 역과 범례 | 테두리 원 + 안의 점 | 속 찬 원 하나(`bg-accent`). Day 0 빈 고리, ★ 유지 |
| 2.10 | `NaruHome.tsx:613, 619` General Mentoring | emerald | `border-white/15`, `text-white/70` |
| 2.11 | FoldBox amber 분기(`NaruHome.tsx:469-496`) | amber | 분기 제거, 기본 톤 |
| 2.12 | `MobileChatBar.tsx:122` | `violet-400/45 violet-100` | `border-accent/40 text-accent` |
| 2.13 | `JourneyNav.tsx:753-775` 챕터 칩(폰 레일, xl 아래) | 알약 | 밑줄 글자 링크(현위치는 `decoration-accent`). 알약은 버튼에만 |
| 2.14 | `JourneyNav.tsx:346-352` EN 헤더 분기 | EN은 1800px부터 한 줄 | KR과 같은 xl |

끝나면 홈 폰 알약 28 → 8(버튼만), 양의 자간 0, 장식 점 0.

## 3단계. 모션과 버튼 (W6, W2, W11, W12)

| # | 파일:줄 | 뒤 |
| --- | --- | --- |
| 3.1 | `shared/Reveal.tsx:85-96`, `journey/Chapter.tsx:142-148` | opacity/transform과 `transition-all duration-700` 제거. `data-chapter-reveal` 속성은 배경(`BackgroundScene.ts:466`)이 읽으므로 남김. D5 기본값: 리빌 전부 제거 |
| 3.2 | `RouteMap.tsx:170` starFlash, `globals.css:210-214` | 제거 |
| 3.3 | hover `-translate-y` 5곳(`ui/Button.tsx:26, 31`, `shared.tsx:241`, `JourneyNav.tsx:673`, `MatchParts.tsx:235`) | 제거. 눌림은 `active:scale-[0.98]`만(10/15 브리프 3.6). `tailwind.config.ts` `future: { hoverOnlyWhenSupported: true }` |
| 3.4 | `ui/Halo.tsx` 호출 3곳(`NaruHome.tsx:984, 1344`, `NaruPage.tsx:99`) | span만 남기고 발광 제거 |
| 3.5 | `JourneyNav.tsx:446` 헤더 워드마크 | 4색 그라데이션 → 단색 흰색. 히어로 로고(`NaruHome.tsx:858`)만 그라데이션 |
| 3.6 | GAIN_BAR(`NaruHome.tsx:305`) | 그라데이션 → `bg-accent/60` 단색 |
| 3.7 | `NaruHome.tsx:898-909`, `:1258-1266` | `regState === "not_open"` 분기에서 PreparingButton 제거, OpenChatLink만. `shared.tsx:235-246`과 모달 preview 분기, `naru.ts:242-246` 키는 유지 |
| 3.8 | `naru.ts:2363, 2522` 역 로고, `RouteMap.tsx:159-164` | 로고 타입에 `url?: string`, 있으면 `<a href target="_blank" rel="noopener noreferrer" aria-label={name}>` |
| 3.9 | `Journey.tsx:3292, 3434` LogoTile | `onOpen` 대신 url을 넘겨 `<a>`로(이미 지원, `:94-95`). url 없는 셋(SMU KSA, NUS Korea Society, NTU KSA)만 onOpen 유지 |
| 3.10 | 10/15 브리프 3.2~3.4 착지와 현위치 | 그대로 적용(리빌 translate가 사라지면 착지 오차도 사라지지만 offsetTop 기준 계산은 유지) |

## 4단계. 구조: 옵션 A (W8, W9, W10, W13, W14)

| # | 파일 | 뒤 |
| --- | --- | --- |
| 4.1 | `shared/PageChips.tsx:31-33`, `data/dictionaryCore.ts:43-52` | 사이트 메뉴를 알약이 아닌 텍스트 링크 한 줄로: 크로싱 서울(EN Home) / 나루 / 8월 기록 / 후원 문의(`naruLinks.sponsor`) / 오픈채팅. 현재 페이지는 밑줄. 폰은 레일 밖 햄버거 한 줄(`JourneyNav.tsx:762`에서 분리), 챕터 목차는 레일에만 |
| 4.2 | `components/home/shared.tsx:255-320` SiteFooter, `Journey.tsx:3669` | 푸터 하나로 통일(compact 제거, FooterNav → SiteFooter). 내용: 한 줄 "학생이 직접 운영하는 그룹 나루가 엽니다", 사이트 메뉴 다섯, 오픈채팅, 문의, 8월 파트너 로고 줄(링크), "© 2026 나루 NARU" |
| 4.3 | `JourneyNav.tsx:415-527` | 세 페이지 헤더 같은 자리(워드마크 오른쪽 아래 또는 EN/KR 왼쪽)에 바이라인 "by 나루 NARU"(`naru-name-rev.png` h-5, `/naru`는 생략). 상수 하나 |
| 4.4 | `lib/ogCards.tsx` 8월 카드 | 홈 카드(`renderHomeCard:74`)와 같은 왼쪽 위 작은 나루 락업 |
| 4.5 | `NaruHome.tsx` 히어로 컨테이너, `:226` 라벨, #gains 표(`:1339` 이하), 티저(`:1424` 이하) | 히어로를 WIDE(144~1296)에 맞춰 글 시작 144, 사진 오른쪽 끝 1296. 카운트다운 라벨 100 → 144. #gains 표와 티저 글 왼쪽을 288(READ). 왼쪽 시작점 8종 → 2종 |
| 4.6 | 챕터 머리 4곳(NaruHome) | lg에서 제목 왼쪽 열, 리드 오른쪽 열의 2열(D6). 챕터 순서와 블록 순서는 그대로 |
| 4.7 | `NaruPage.tsx:470-497`, `naru.ts:337` | 매니페스토 내려받기 블록과 nav 칩 내림(D8). 키와 PDF 파일은 유지 |
| 4.8 | `app/layout.tsx:29`, `app/sitemap.ts:3`, `app/robots.ts:3`, `lib/organizationLd.ts:3`, `Quiz.tsx:1218`, `lib/register/turnstile.ts:23` | SITE_URL을 `NEXT_PUBLIC_SITE_URL` env 하나로(기본값 vercel.app). Turnstile 호스트 목록에 새 도메인 추가. `vercel.json`에 vercel.app → 새 도메인 301(host 조건). 도메인 구매와 DNS, Vercel 연결, Cloudflare Turnstile 대시보드, Search Console은 사용자가 합니다(D1) |

## 5. 건드리지 말 것

챕터 순서, 블록 순서, 글자 크기 셋, 배경 장면과 등불, 두 primary CTA의 그라데이션 필, 노선도 주황 현재점과 ★, `/2026-08`의 5색 체계와 라벨 자간(기록, 픽셀 회귀 0, 단 4.2 푸터와 4.4 OG는 예외), `/match` 글, 정본의 코어·원칙·스테이지 이름. 10/11에 되돌린 내용은 넣지 않습니다. 사람 이름 0, 금지어 0, em dash 0, 가운뎃점 새로 쓰지 않음(기존 "나루 · NARU" 표기는 정본 6장 규칙대로).

## 6. 결정 기본값

| # | 질문 | 기본값 |
| --- | --- | --- |
| D1 | 도메인 | 코드는 env로 준비만. 이름과 구매는 사용자 |
| D2 | 나루 바이라인 세 페이지 + 8월 OG | 함 |
| D3 | "함께하는 사람" | 보류 |
| D4 | "후원" 메뉴 | "후원 문의" 링크만 |
| D5 | 리빌 | 전부 제거 |
| D6 | 챕터 머리 2열 | 함(lg 이상만, 폰은 그대로) |
| D7 | 멘토링 본체 교체, PO 세션 교체, 데이터, 기업명 선공개 시점, 패널 | 하지 않음(사용자 결정 뒤) |
| D8 | 매니페스토 링크 내림 | 함 |

## 7. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 글 | "마지막 날은 제외" 0, "질문은 이 날" 0, `stages[4].line`에 "멘토에게 먼저 연락" 포함, "1위" 홈 0. 1.2 열 곳이 바뀐 문장 |
| 2 | 라벨 | 홈 390: `rounded-full`에 테두리나 면이 있는 요소 10개 이하, 전부 button 또는 a. 한글 노드 중 letter-spacing > 0 = 0. 14px 이하 장식 점 0(노선도 역 제외). emerald, amber, violet 클래스 홈 컴포넌트 0 |
| 3 | 모션 | 390 전체 스크롤 중 리빌 발화 0. hover translate 0. Halo 0. `:hover` 규칙이 `(hover:hover)` 안 |
| 4 | EN | 1440 `/` EN 헤더 한 줄(둘째 줄 레일 없음). 폰 EN 첫 화면 카운트다운 라벨 1줄, 히어로 버튼 둘 다 844 안. 칩 줄바꿈 KR vs EN 차이 0. 카드 높이 KR vs EN 차이 60px 이하 |
| 5 | 버튼과 링크 | not_open에서 "등록 폼 미리 보기" 0. 역 로고와 8월 LogoTile이 `a[target=_blank]`(url 있는 것) |
| 6 | 구조 | 세 페이지 헤더에 같은 메뉴 다섯(텍스트), 폰은 햄버거. 세 페이지 푸터 DOM 동일. 바이라인 세 페이지 같은 자리(`/naru` 제외). 8월 OG에 나루 락업. 홈 1440 왼쪽 시작점 2종, 가운데 축 1 |
| 7 | 도메인 준비 | `grep -r "naru-crossing-seoul.vercel.app"` 결과가 env 기본값 한 곳 |
| 8 | 불변 | `/2026-08` 픽셀 차이는 헤더 메뉴, 푸터, 로고 링크만. axe 0. `npm run build` 통과. 정본 금지어 0 |

단계마다 홈, `/naru`, `/2026-08`의 첫 화면과 멘토링, 일정, #gains 화면을 1440×900과 390×844, KR과 EN으로 적용 전과 나란히. 2단계 뒤에는 스퀸트 시트(10% + blur)도.

## 8. 커밋

1단계 `copy: 4일 모두, 질문은 날마다, 끝난 뒤 멘토에게 연락` / `copy: 조각문 열 곳을 문장으로, EN 단축` / changelog.
2단계 `style(label): 자간, 알약, 점을 걷고 META 글자 하나로` / changelog.
3단계 `feat(motion): 리빌과 발광 제거, hover 가드, 눌림` / `feat(home): 미리 보기 버튼 내림, 로고 링크` / changelog.
4단계 `feat(nav): 사이트 메뉴와 푸터 하나, 바이라인, 8월 OG` / `style(layout): 왼쪽 시작점 둘, 챕터 머리 2열` / `chore: SITE_URL env` / changelog.

`main` 푸시는 사용자가 단계마다 확인한 뒤입니다.
