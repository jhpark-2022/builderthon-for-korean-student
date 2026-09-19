# 기슭 형상 (2026-09-17, 싱가포르 갱신 2026-09-19)

`variant="crossing"` 배경에서 왼쪽 기슭의 입자는 싱가포르 본섬, 오른쪽 기슭의
입자는 서울특별시 경계 윤곽으로 서 있습니다. `variant="water"`(홈)에서는 같은
`seoul.ts`가 워터마크로 떠오르고 `#naru`에서 `singapore.ts`로 건너갑니다. 여기 있는 `singapore.ts`, `seoul.ts`는
`scripts/build-shape-points.py`가 굽습니다. 손으로 고치지 마세요.

## 출처

| 형상 | 원본 | 정리 |
| --- | --- | --- |
| 싱가포르 | geoBoundaries gbOpen `SGP` ADM0 (표현 연도 2016, 2023-12-12 릴리스). 원자료는 URA Master Plan 2014 Subzone Boundary (No Sea) / data.gov.sg. MultiPolygon 열두 고리 중 면적이 가장 큰 본섬 하나만 떼어 `scripts/data/singapore-geoboundaries-2016.geojson`에 둠(4,254 꼭짓점) | 형태학적 열기(반지름 24px ≈ 590m)로 부두·방파제를 지운 뒤 Douglas-Peucker로 83 꼭짓점까지 단순화. 경도에 cos(위도)를 곱해 동서 축척 보정. 북쪽이 위 |
| 서울 | 통계청(KOSTAT) 센서스용 행정구역경계 2013, 시도 단위. `southkorea/southkorea-maps` 저장소의 `kostat/2013/json/skorea_provinces_geo.json`에서 서울특별시 피처 하나만 떼어 `scripts/data/seoul-kostat-2013.geojson`에 둠(7,700 꼭짓점) | Douglas-Peucker로 64 꼭짓점까지 단순화. 경도에 cos(위도)를 곱해 동서 축척 보정. 북쪽이 위, 좌우 반전 없음 |

부속 섬(센토사, 주롱섬, 우빈, 테콩)은 넣지 않았습니다. 서울이 폴리곤 하나인 것과
같습니다. 점이 흩어지면 윤곽이 읽히지 않아요. 매립지(투아스·창이)는 원자료대로 둡니다.

**부두와 방파제도 지웁니다**(2026-09-19, 사용자: "조그만 섬들까지 다 커버하지 말고
main island만"). 원자료의 남쪽 해안에는 케펠·파시르판장의 부두와 투아스의 방파제가
폭 200~400m 실처럼 붙어 있습니다. 서울 경계에는 그런 것이 없어요. 그대로 구우면 그
실 위에 점이 한 줄로 앉아, 화면에서는 본섬에서 떨어져 나온 작은 섬으로 읽힙니다.
그래서 2,048px 래스터에서 형태학적 열기(침식 → 팽창)를 반지름 24px(≈590m) 한 번
돌리고 바깥 윤곽을 다시 땁니다. 그보다 가는 것만 사라지고 창이·투아스·주롱 만
같은 큰 굴곡은 남습니다. 지도가 아니라 배경이라 이 편이 맞습니다.

한강은 넣지 않았습니다. 같은 출처에 하천 폴리곤이 없고, 지어낸 강은 넣지 않습니다
(브리프 1).

**2026-09-19까지 싱가포르는 로고 심볼 SVG의 섬 패스(21 꼭짓점)에서 구웠습니다.**
점을 2,000개 뿌려도 21각형은 21각형이라 창이도 투아스도 북쪽 해안도 없었습니다.
로고 SVG는 이제 굽기 입력이 아닙니다. `public/naru/naru-symbol.svg`는 로고로만
남습니다(로고 가이드 v1). 바뀐 것은 배경의 점뿐입니다.

## 라이선스

- 통계청 SGIS 행정구역경계 자료는 공공데이터입니다. `southkorea/southkorea-maps`
  저장소에는 LICENSE 파일이 없습니다(2026-09-17 확인, GitHub API `license: null`).
  README가 출처를 KOSTAT으로 밝히고 있습니다.
- TODO: confirm. 통계청 SGIS의 이용 약관(공공누리 유형)을 확인해 여기에 적을 것.
  웹 배경의 점 2,000개로 쓰는 것이라 원자료를 재배포하지는 않지만,
  `scripts/data/seoul-kostat-2013.geojson`은 원자료의 일부입니다.
- 싱가포르 윤곽: geoBoundaries gbOpen은 **CC BY 4.0**입니다. 표기 —
  "Boundaries from geoBoundaries (geoboundaries.org), gbOpen SGP ADM0, CC BY 4.0."
  원자료인 data.gov.sg의 URA 자료는 Open Data Commons ODbL 1.0 /
  Singapore Open Data Licence입니다. 두 표기를 `scripts/data/singapore-geoboundaries-2016.geojson`
  의 `source`·`license` 항목에도 적어 뒀습니다.

## 굽는 방법

```
python3 scripts/build-shape-points.py
```

512×512 래스터 → 가장자리(바운딩 박스 너비의 6% 이내) 밀도 3배 → 푸아송 디스크
(Bridson) → 형상당 2,000점 → 가장자리 먼저, 속 나중 순서로 저장. 런타임은
품질 티어의 입자 수 절반만큼 앞에서부터 씁니다(폰 450점, 노트북 1,400, 데스크톱
2,000). 결과 확인용 `*-preview.png`도 같이 나옵니다.
