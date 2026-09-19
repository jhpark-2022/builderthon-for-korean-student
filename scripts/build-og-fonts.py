#!/usr/bin/env python3
"""공유 카드(app/opengraph-image.tsx)가 쓰는 서체 세 벌을 만듭니다.

왜 필요한가
-----------
next/og(satori)는 서체를 직접 주지 않으면 런타임의 기본 서체로 그립니다. 그
서체에는 굵기가 하나뿐이라, 900으로 적은 제목이 본문과 같은 굵기로 나옵니다.
실제로 그랬습니다(2026-09-19 이전의 카드).

satori는 **woff2를 읽지 못합니다.** 이 레포에 있는 것은 가변 woff2 하나
(app/fonts/PretendardVariable.woff2)뿐이라, 거기서 정적 ttf를 뽑아 둡니다.

무엇을 만드는가
---------------
public/fonts/Pretendard-OG-{Regular,Bold,Black}.ttf  (굵기 450 / 700 / 900)

라틴 글자와 카드에서 쓰는 문장부호만 남깁니다. 한 벌이 28KB 남짓입니다.
**한글은 넣지 않습니다.** 넣으면 한 벌이 몇 MB가 되고, 카드의 한글은 로고
PNG가 들고 오는 것이 이 레포의 규칙입니다(public/naru/README.md).

언제 다시 돌리는가
------------------
- Pretendard 원본을 바꿨을 때
- 카드에 새 문장부호가 필요할 때(CHARS에 더하고 다시 돌리세요)

    python3 scripts/build-og-fonts.py

필요한 것: fonttools, brotli (pip install fonttools brotli)
"""

import io
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

SRC = "app/fonts/PretendardVariable.woff2"
OUT_DIR = "public/fonts"

# 기본 라틴 + 카드에서 쓰는 문장부호(가운뎃점, en/em 대시, 따옴표, 화살표 등).
CHARS = "".join(chr(c) for c in range(0x20, 0x7F)) + " ·–—‘’“”•→×…"

WEIGHTS = [("Regular", 450), ("Bold", 700), ("Black", 900)]


def main() -> int:
    if not os.path.exists(SRC):
        print(f"원본이 없습니다: {SRC}", file=sys.stderr)
        return 1
    os.makedirs(OUT_DIR, exist_ok=True)

    for name, wght in WEIGHTS:
        var = TTFont(SRC)
        var.flavor = None  # woff2 → 일반 ttf 컨테이너
        static = instantiateVariableFont(var, {"wght": wght}, inplace=True, updateFontNames=False)

        buf = io.BytesIO()
        static.save(buf)
        buf.seek(0)

        font = TTFont(buf)
        options = subset.Options()
        options.layout_features = ["kern", "liga", "calt"]
        options.name_IDs = ["*"]
        options.name_legacy = True
        options.name_languages = ["*"]
        options.notdef_outline = True
        options.recalc_bounds = True

        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=CHARS)
        subsetter.subset(font)

        out = os.path.join(OUT_DIR, f"Pretendard-OG-{name}.ttf")
        font.flavor = None
        font.save(out)
        print(f"{out}  {os.path.getsize(out):,} bytes  (wght {wght})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
