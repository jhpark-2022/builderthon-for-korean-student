# 기슭 형상 (2026-09-17)

`variant="crossing"` 배경에서 왼쪽 기슭의 입자는 싱가포르 본섬, 오른쪽 기슭의
입자는 서울특별시 경계 윤곽으로 서 있습니다. 여기 있는 `singapore.ts`, `seoul.ts`는
`scripts/build-shape-points.py`가 굽습니다. 손으로 고치지 마세요.

## 출처

| 형상 | 원본 | 정리 |
| --- | --- | --- |
| 싱가포르 | `public/naru/naru-symbol.svg`의 섬 패스. 로고 심볼(로고 가이드 v1, 2026-09-13)과 같은 단순화 정도, 21 꼭짓점 | 남쪽 해안의 주황 점은 가져오지 않습니다. 화면의 주황은 등불 하나뿐입니다 |
| 서울 | 통계청(KOSTAT) 센서스용 행정구역경계 2013, 시도 단위. `southkorea/southkorea-maps` 저장소의 `kostat/2013/json/skorea_provinces_geo.json`에서 서울특별시 피처 하나만 떼어 `scripts/data/seoul-kostat-2013.geojson`에 둠(7,700 꼭짓점) | Douglas-Peucker로 64 꼭짓점까지 단순화. 경도에 cos(위도)를 곱해 동서 축척 보정. 북쪽이 위, 좌우 반전 없음 |

한강은 넣지 않았습니다. 같은 출처에 하천 폴리곤이 없고, 지어낸 강은 넣지 않습니다
(브리프 1).

## 라이선스

- 통계청 SGIS 행정구역경계 자료는 공공데이터입니다. `southkorea/southkorea-maps`
  저장소에는 LICENSE 파일이 없습니다(2026-09-17 확인, GitHub API `license: null`).
  README가 출처를 KOSTAT으로 밝히고 있습니다.
- TODO: confirm. 통계청 SGIS의 이용 약관(공공누리 유형)을 확인해 여기에 적을 것.
  웹 배경의 점 2,000개로 쓰는 것이라 원자료를 재배포하지는 않지만,
  `scripts/data/seoul-kostat-2013.geojson`은 원자료의 일부입니다.
- 로고 심볼은 나루의 것입니다.

## 굽는 방법

```
python3 scripts/build-shape-points.py
```

512×512 래스터 → 가장자리(바운딩 박스 너비의 6% 이내) 밀도 3배 → 푸아송 디스크
(Bridson) → 형상당 2,000점 → 가장자리 먼저, 속 나중 순서로 저장. 런타임은
품질 티어의 입자 수 절반만큼 앞에서부터 씁니다(폰 450점, 노트북 1,400, 데스크톱
2,000). 결과 확인용 `*-preview.png`도 같이 나옵니다.
