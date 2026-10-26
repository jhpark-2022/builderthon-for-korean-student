# Analytics 영구 기록

Vercel Web Analytics는 Hobby 플랜에서 지난 한 달치만 보여 줍니다. 대시보드에서 사라지기 전에 숫자를 이 폴더에 남깁니다.
이 폴더는 체인지로그가 아닙니다(CLAUDE.md). 바꾼 것은 루트 `CHANGELOG.md`에, 본 것은 여기에 적습니다.

## 파일

- `YYYY-MM-DD.md`: 그날 읽은 숫자. 한 파일에 한 번의 점검.
- `YYYY-MM-DD/*.csv`: 같은 날 대시보드에서 내보낸 CSV. 패널마다 한 파일(pages, routes, referrers, utm, countries, devices, browsers, os).

## 남기는 법 (월 1회, 매달 20일 전후)

1. vercel.com → 프로젝트 naru-crossing-seoul → Analytics. 기간을 "Last 30 days"로.
2. 패널마다 오른쪽 아래 점 셋 메뉴 → "Export as CSV". 모든 플랜에서 됩니다(Vercel 체인지로그 "CSV export in Web Analytics"). 내보내기는 패널 단위의 합계(방문자, 페이지뷰)이고 원시 이벤트는 아닙니다.
3. 받은 파일을 `docs/analytics/YYYY-MM-DD/` 아래 패널 이름으로 둡니다.
4. `YYYY-MM-DD.md`에 표와 읽은 것 서너 줄을 적습니다. 숫자만 남기면 다음 달에 왜 그랬는지 모릅니다.
5. 체인지로그에는 "docs(analytics): YYYY-MM-DD 점검" 한 항목만 씁니다.

## 숫자를 읽을 때 기억할 것

- **Routes 탭은 2026-10-22부터**입니다. 그날 `@vercel/analytics/react`를 `/next`로 바꿔 경로 패턴이 가기 시작했습니다. Pages와 Routes의 수가 다른 것은 창이 다르기 때문입니다.
- **오픈채팅 클릭도 2026-10-22부터**입니다. `/go/openchat/<src>` 방문 수 = 그 버튼의 클릭 수(하한). 전체 페이지뷰를 볼 때는 `/go`를 뺍니다. 자리 이름은 `lib/openChatCount.ts`.
- **팀 방문 제외는 2026-10-23부터**이고, 브라우저마다 `?team=on`을 한 번 연 뒤부터만 빠집니다. 그 전 수치에는 팀 방문이 섞여 있습니다. referrer `vercel.com`은 팀의 대시보드 경유입니다.
- Hobby는 `track()` 커스텀 이벤트를 저장하지 않습니다. Events 패널은 비어 있는 것이 정상입니다.
- `?lang=en`은 경로를 바꾸지 않아(middleware rewrite) 영어로 읽은 사람 수는 Analytics에 없습니다.
- 끝에 괄호가 붙은 주소(`/)` 등)는 2026-10-22부터 308로 돌려보내므로 그 뒤로는 Pages에 쌓이지 않습니다.
- 방문자 수는 날마다 센 값의 합입니다. 같은 사람이 이틀 오면 2입니다.
