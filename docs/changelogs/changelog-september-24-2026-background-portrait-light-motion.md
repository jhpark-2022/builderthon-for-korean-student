# Changelog 2026-09-24 (폰에서 싱가포르의 빛이 보이게)

**Scope:** `lib/background/config.ts`, `scene/BackgroundScene.ts`, `shaders/water.ts`, `water/WaterSurface.ts`. 가로 화면의 움직임과 파문은 바꾸지 않았습니다.
**근거:** `docs/background-portrait-light-motion-brief.md`

- 점의 가로 이동을 셰이더에서 `BackgroundScene`으로 옮겼습니다(`uLightDx`). `uStage4`, `uSweep`는 이 식에서만 쓰여 지웠습니다.
- 세로 화면은 `LIGHT_PORTRAIT`(폭 0.26, 한 바퀴 2.6화면, 초당 0.07바퀴 상한). `LIGHT_SWEEP.portrait`는 쓰지 않고 남겨 두었습니다.

| # | 항목 | 결과 |
| --- | --- | --- |
| 1 | 데스크톱 불변(1440x900) | 옛 식(float32)과 새 값 차이 최대 8e-8. 캡처 차이 최대 1/255, 평균 0.001~0.015/255 |
| 2 | 폰 읽기 속도 | 속도 중앙값 30.0px/s (전 10.0, 기준 12 이상) |
| 3 | 폰 플릭 | 최고 49.2px/s (기준 50 이하) |
| 4 | 폰 폭 | 점 x 화면 폭의 29.4% ~ 77.9%, 싱가포르 윤곽 안. 가운데가 약 53.6%라(기존 lx의 오른쪽 치우침) 동쪽 끝이 76%를 약 2%p 넘습니다 |
| 5 | 도착 | 도착 전후 0.5초 x 변화 0.19px |
| 6 | 파문 | 도착 지점(점 자리가 같음)에서 전후 평균 0.006/255, 최대 1 |
| 7 | 모션 민감 | 옮긴 직후 lapEased가 목표와 같음 |
| 8 | `/2026-08` | 최대 124px, 2/255 (같은 코드 반복 잡음 안) |

속도(2, 3, 5)는 개발 빌드의 `window.__naruBg` 값과 브라우저 시각으로 쟀습니다.
