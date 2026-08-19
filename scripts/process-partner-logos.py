#!/usr/bin/env python3
"""
One-off: turn brand logos from the shared CI folder into the partner-wall
convention — WHITE MONO on TRANSPARENT, natural aspect ratio (not squared),
matching the files already in public/partners/logos/white/.

Three source shapes are handled:
  • "dark"  — a dark mark on a white/transparent sheet (L^IFE). Alpha comes
              straight from darkness, so outlines and counters survive.
  • "color" — a multicolour mark on a flat light background (마이크로소프트).
              Alpha comes from each pixel's colour distance to the sampled
              background, then everything surviving is flattened to white.
              Only for marks that are FLAT — see "shaded" for the other kind.
  • "shaded"— a colour mark with DRAWING INSIDE IT (싱가포르 한인회's emblem).
              Same silhouette as "color", but brightness inside that silhouette
              becomes opacity instead of everything going solid, so the emblem
              keeps its rosette and ring of type rather than filling in as a
              disc.
  • "alpha" — a solid-colour mark ALREADY cut out on transparency. The shape is
              exactly the source alpha, so use it as-is and just repaint the ink
              white. Running such a file through "dark" instead would scale
              alpha by the ink's luminance and render the mark semi-transparent —
              a mid-purple wordmark came out visibly dimmer than its neighbours.
  • "chroma"— a SATURATED mark on a white sheet whose shapes are separated by
              DARK outlines. No JOB uses this today (it was built for Fyreflyz,
              which is no longer a partner); it is kept because the shape recurs
              and the ramp constants took a while to land. "color" would keep
              both the gold body and
              the brown outline — every pixel is far from white — and the mark
              flattens to one featureless blob. Here alpha needs the saturated ink
              only: the white sheet drops out for having no saturation, the dark
              outline drops out for being dark, and what's left reads as the
              outline gaps that give the mark its shape.
  • "light" — a WHITE mark on a dark sheet (Onword Lab's square glyph). The
              inverse of "dark": brightness IS the ink, so alpha comes from
              luminance above the sheet's own level. Feeding this to "dark"
              would produce a perfect negative — the background solid and the
              glyph punched out of it.

Both are trimmed to the alpha bbox and downscaled so the long edge is 900px —
these render ~40px tall, so anything larger is wasted bytes.

Second job: build the marquee's copies. The logo band sizes every mark with the
same `max-h-10 / max-w-[82%]` box, so a logo that ships with transparent padding
baked into its canvas renders visibly smaller than a tightly-cropped neighbour
(Brand Boost filled 40%x30% of its file; the zero100 WebPs fill ~100%). The band
therefore reads from white/trimmed/, which is the same art cropped to its alpha
bounding box so every mark fills its tile the same way. The partner wall above
keeps using the untrimmed originals — its LogoTile has its own `big` sizing
calibrated against them.

    python3 scripts/process-partner-logos.py
"""
from PIL import Image
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CI = ROOT.parent / "CI"
OUT = ROOT / "public" / "partners" / "logos" / "white"
TRIMMED = OUT / "trimmed"

MAX_EDGE = 900
LO, HI = 40, 110  # colour-distance → alpha ramp, for the "color" mode
# "shaded" mode. LO/HI cut the silhouette out of the sheet; PAPER/INK map
# brightness to density inside it; GAIN lifts the whole thing so the mark is
# not grey beside its pure-white neighbours. See from_shaded.
SHADED_LO, SHADED_HI = 30, 80
SHADED_PAPER, SHADED_INK = 243, 78
SHADED_GAIN = 1.3

# Every white-mono mark gets a trimmed copy. Both the marquee band and the
# partner wall read from trimmed/: sizing there normalises each logo by its
# rendered area, which is only meaningful when the file's dimensions describe
# the INK rather than whatever transparent canvas the brand shipped.

# source filename → (output slug, mode) with an optional 4th element, a dict of
# per-source options applied BEFORE the alpha cut:
#   crop:    (l, t, r, b) box on the source, for lockups where only one part of
#            the art is wanted.
#   upscale: LANCZOS factor applied after the crop. A crop out of a small sheet
#            leaves a mark whose edges are a handful of pixels wide; enlarging
#            before the alpha ramp gives the ramp something to work with, so the
#            result has a soft edge rather than a staircase.
JOBS = [
    ("life_logo.png", "life.png", "dark"),
    # "color" → "shaded" (2026-08-19). 이 마크는 원 안에 그림이 있습니다 —
    # 링의 활자, 무궁화 로제트, 삼태극. color 모드는 그 셋을 전부 불투명하게
    # 칠해 흰 원반 하나로 만들었습니다. from_shaded 주석에 자세히 적었습니다.
    ("싱가포르 한인회.jpg", "korean-association.png", "shaded"),
    # Microsoft: the stacked lockup (four squares over the wordmark) is the only
    # art we have. It is used small — a 16px-tall mark on the pre-event band —
    # and the stacked form survives that better than a horizontal one would,
    # because the squares stay square instead of shrinking with the cap height.
    ("마이크로소프트.jpg", "microsoft.png", "color"),
    # The Foundry: black speech-bubble + "FOUNDRY." wordmark on an orange sheet.
    #
    # Only the WORDMARK is taken (crop). The bubble is a filled shape, so in white
    # mono it is a featureless white square — at the size this renders (a route-map
    # venue marker, ~63x17 CSS px) it names nothing and eats a quarter of the width
    # the letters need.
    #
    # SOURCE: "The Foundry horizontal.png", the official horizontal lockup from
    # foundry.sg, 2452x701. NOT "The Foundry.jpeg" — that is the square avatar at
    # 225x225, where the wordmark is 65x16px of JPEG-artefacted ink. Upscaled to
    # the marker's device pixels it was visibly mushy, and no amount of blur-and-
    # threshold tracing recovers letterforms that were never sampled. If this logo
    # ever needs redoing, start by looking for a bigger source, not a better filter.
    ("The Foundry horizontal.png", "foundry.png", "color", {"crop": (640, 145, 2362, 557)}),
    # Onword Lab: the wide "⊃ ONWORD LAB" lockup, NOT the square ">." glyph —
    # the glyph alone names nothing.
    #
    # NOTE THE OUTPUT FILENAME. This shipped as `onword.png` twice with different
    # artwork inside, and browsers and the CDN kept serving the first version:
    # the change was invisible on the live site for a whole round of review, and
    # the logo got "fixed" a second time on the strength of a stale image. Any
    # future ARTWORK swap must land on a NEW filename for the same reason.
    # SMU: Day 8 결과 공유회가 이 캠퍼스로 옮겨오면서(2026-08-19) 노선도의 장소
    # 마커로 씁니다. 소스는 CI/SMU.jpg — 공식 세로 로크업(싱가포르 지도 위 사자,
    # 그 아래 "SMU" 워드마크)입니다.
    #
    # 세로 로크업 전체가 아니라 위쪽 사자 엠블럼만 크롭합니다. 로크업을 통째로
    # 넣으면 마커 높이(16px)에서 글자가 5px도 되지 않아 아무것도 읽히지 않고,
    # 워드마크만 넣으면 이번에는 반대로 커집니다 — 세리프 대문자 세 글자가 폭을
    # 45px까지 먹어 옆의 aws(27px)나 L^IFE(41px)보다 무거워 보였습니다.
    #
    # 엠블럼은 거의 정사각형이라 같은 16px 높이에서 폭이 17px에 그칩니다. 다른
    # 마커들과 무게가 맞고, 사자는 이 학교의 마크로 그 자체가 알아보게 하는
    # 그림입니다. (The Foundry가 워드마크 쪽을 택한 것은 그쪽 심볼이 통짜 말풍선
    # 도형이라 흰색 모노에서 아무 형태도 남지 않기 때문입니다 — 사정이 다릅니다.)
    #
    # 크롭은 로크업 위쪽 블록입니다(y 150–570). 워드마크와의 간격이 y 558–579라
    # 그 사이를 지납니다. 소스를 갈면 이 좌표부터 다시 재세요.
    ("SMU.jpg", "smu.png", "color", {"crop": (0, 150, 900, 570)}),
    ("onword new logo.png", "onword-lab.png", "alpha"),
    # 널담(Nuldam): a solid blue "Nuldam" wordmark already cut out on
    # transparency, so "alpha" — the source alpha IS the shape and we only
    # repaint the ink white. Do NOT feed this to "color": the sheet is
    # transparent, so the corner samples that mode averages for a background
    # colour are (255,255,255,0), and every ink pixel then measures its distance
    # from white rather than from nothing.
    ("Nuldam.png", "nuldam.png", "alpha"),
]


def from_dark(im):
    """Dark-on-light sheet → alpha = darkness (transparent pixels stay out)."""
    rgba = np.asarray(im.convert("RGBA")).astype(int)
    lum = rgba[:, :, :3].mean(axis=2)
    alpha = np.clip(255 - lum, 0, 255) * (rgba[:, :, 3] / 255.0)
    return alpha


def from_color(im):
    """Colour mark on a flat bg → alpha = distance from the sampled bg colour."""
    a = np.asarray(im.convert("RGB")).astype(int)
    h, w, _ = a.shape
    corners = np.array([a[0, 0], a[0, w - 1], a[h - 1, 0], a[h - 1, w - 1]])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    return np.clip((dist - LO) / (HI - LO), 0.0, 1.0) * 255.0


def from_shaded(im):
    """Colour mark whose INSIDE has to survive → shape from the background
    distance, DENSITY from luminance.

    "color" answers one question — is this pixel the sheet or the mark — and
    every non-sheet pixel comes out fully opaque. That is right for a flat mark
    and wrong for one with drawing inside it: 싱가포르 한인회's emblem is a ring
    of type around a mugunghwa rosette around a taegeuk, all of it mid-to-dark
    colour, so "color" returned a featureless white disc. Nothing was lost in
    the downscale; the alpha was solid before it ever got there.

    Here the sheet still decides the SILHOUETTE (colour distance, which is what
    separates ink from paper reliably), and brightness inside it decides how
    opaque each pixel is. The rosette's pale petals go translucent, the dark
    ring and type stay solid, and the emblem reads as an emblem.

    GAIN exists because the result would otherwise sit grey next to the pure
    white marks it shares a row with. 1.3 lifts the type and the ring to white
    while the petals keep enough falloff to stay separate. Raising it further
    collapses the emblem back into the disc this mode was written to avoid —
    at 2.0 it is indistinguishable from "color". Re-check it against a real
    render, not the full-size file: this mark ships ~34px tall.
    """
    a = np.asarray(im.convert("RGB")).astype(int)
    h, w, _ = a.shape
    corners = np.array([a[0, 0], a[0, w - 1], a[h - 1, 0], a[h - 1, w - 1]])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    shape = np.clip((dist - SHADED_LO) / (SHADED_HI - SHADED_LO), 0.0, 1.0)
    ink = np.clip((SHADED_PAPER - a.mean(axis=2)) / (SHADED_PAPER - SHADED_INK), 0.0, 1.0)
    return shape * np.clip(ink * SHADED_GAIN, 0.0, 1.0) * 255.0


def from_light(im):
    """White-on-dark sheet → alpha = brightness above the sheet's own level."""
    a = np.asarray(im.convert("RGB")).astype(int)
    lum = a.mean(axis=2)
    h, w = lum.shape
    sheet = np.median([lum[0, 0], lum[0, w - 1], lum[h - 1, 0], lum[h - 1, w - 1]])
    # Ramp starts a little above the sheet so its noise doesn't become haze.
    return np.clip((lum - (sheet + 12)) / (255 - (sheet + 12)), 0.0, 1.0) * 255.0


def from_chroma(im):
    """Saturated mark on white, dark outlines → keep the ink, drop sheet & outline."""
    a = np.asarray(im.convert("RGB")).astype(float) / 255.0
    mx, mn = a.max(axis=2), a.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0.0)
    lum = a.mean(axis=2)
    # Saturation carries the ink; luminance vetoes the outline. Both ramps are
    # soft so the mark keeps an anti-aliased edge instead of a jagged one.
    ink = np.clip((sat - 0.18) / 0.22, 0.0, 1.0)
    lit = np.clip((lum - 0.34) / 0.16, 0.0, 1.0)
    return ink * lit * 255.0


def from_alpha(im):
    """Already cut out on transparency → the source alpha IS the shape."""
    return np.asarray(im.convert("RGBA")).astype(int)[:, :, 3].astype(float)


def trim_all():
    """Crop every mark to its alpha bbox so they all fill their tile the same."""
    TRIMMED.mkdir(parents=True, exist_ok=True)
    for src in sorted(OUT.glob("*.png")):
        slug = src.stem
        im = Image.open(src)
        bbox = im.getbbox()
        if not bbox:
            print(f"  {slug:24s} -- empty alpha, skipped")
            continue
        cropped = im.crop(bbox)
        dst = TRIMMED / f"{slug}.png"
        cropped.save(dst, "PNG", optimize=True)
        print(f"  {slug:24s} {im.size[0]}x{im.size[1]} -> "
              f"{cropped.size[0]}x{cropped.size[1]}  "
              f"{dst.stat().st_size / 1024:.1f} KB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for src, out, mode, *rest in JOBS:
        opts = rest[0] if rest else {}
        im = Image.open(CI / src)
        if "crop" in opts:
            im = im.crop(opts["crop"])
        if "upscale" in opts:
            k = opts["upscale"]
            im = im.resize((im.width * k, im.height * k), Image.LANCZOS)
        alpha = {
            "dark": from_dark,
            "color": from_color,
            "shaded": from_shaded,
            "alpha": from_alpha,
            "light": from_light,
            "chroma": from_chroma,
        }[mode](im)
        h, w = alpha.shape
        # white mono is fully described by alpha → store as LA (L=255 + alpha)
        img = Image.fromarray(
            np.dstack([np.full((h, w), 255, np.uint8), alpha.astype(np.uint8)]), "LA"
        )
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        w, h = img.size
        if max(w, h) > MAX_EDGE:
            s = MAX_EDGE / max(w, h)
            img = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
        dst = OUT / out
        img.save(dst, "PNG", optimize=True)
        print(f"  {src:24s} -> {out:24s} {img.size[0]}x{img.size[1]}  "
              f"{dst.stat().st_size / 1024:.1f} KB")
    trim_all()


if __name__ == "__main__":
    main()
