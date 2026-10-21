#!/usr/bin/env python3
"""
One-off: turn brand logos from the shared CI folder into the partner-wall
convention - WHITE MONO on TRANSPARENT, natural aspect ratio (not squared),
matching the files already in public/partners/logos/white/.

Three source shapes are handled:
  • "dark"  - a dark mark on a white/transparent sheet (L^IFE). Alpha comes
              straight from darkness, so outlines and counters survive.
  • "color" - a multicolour mark on a flat light background (마이크로소프트).
              Alpha comes from each pixel's colour distance to the sampled
              background, then everything surviving is flattened to white.
              Only for marks that are FLAT - see "shaded" for the other kind.
  • "shaded"- a colour mark with DRAWING INSIDE IT (싱가포르 한인회's emblem).
              Same silhouette as "color", but brightness inside that silhouette
              becomes opacity instead of everything going solid, so the emblem
              keeps its rosette and ring of type rather than filling in as a
              disc.
  • "alpha" - a solid-colour mark ALREADY cut out on transparency. The shape is
              exactly the source alpha, so use it as-is and just repaint the ink
              white. Running such a file through "dark" instead would scale
              alpha by the ink's luminance and render the mark semi-transparent -
              a mid-purple wordmark came out visibly dimmer than its neighbours.
  • "chroma"- a SATURATED mark on a white sheet whose shapes are separated by
              DARK outlines. No JOB uses this today (it was built for Fyreflyz,
              which is no longer a partner); it is kept because the shape recurs
              and the ramp constants took a while to land. "color" would keep
              both the gold body and
              the brown outline - every pixel is far from white - and the mark
              flattens to one featureless blob. Here alpha needs the saturated ink
              only: the white sheet drops out for having no saturation, the dark
              outline drops out for being dark, and what's left reads as the
              outline gaps that give the mark its shape.
  • "light" - a WHITE mark on a dark sheet (Onword Lab's square glyph). The
              inverse of "dark": brightness IS the ink, so alpha comes from
              luminance above the sheet's own level. Feeding this to "dark"
              would produce a perfect negative - the background solid and the
              glyph punched out of it.

Both are trimmed to the alpha bbox and downscaled so the long edge is 900px -
these render ~40px tall, so anything larger is wasted bytes.

Second job: build the marquee's copies. The logo band sizes every mark with the
same `max-h-10 / max-w-[82%]` box, so a logo that ships with transparent padding
baked into its canvas renders visibly smaller than a tightly-cropped neighbour
(Brand Boost filled 40%x30% of its file; the zero100 WebPs fill ~100%). The band
therefore reads from white/trimmed/, which is the same art cropped to its alpha
bounding box so every mark fills its tile the same way. The partner wall above
keeps using the untrimmed originals - its LogoTile has its own `big` sizing
calibrated against them.

    python3 scripts/process-partner-logos.py
"""
import sys
from PIL import Image
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CI = ROOT.parent / "CI"
# 2026-10-19: 12월 로고는 형제 폴더 "12월 빌더톤/CI"에 있습니다. JOBS의 옵션 {"ci": "dec"}로 고릅니다.
CI_DEC = ROOT.parent.parent / "12월 빌더톤" / "CI"
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
    # "color" → "shaded" (2026-08-19). 이 마크는 원 안에 그림이 있습니다 -
    # 링의 활자, 무궁화 로제트, 삼태극. color 모드는 그 셋을 전부 불투명하게
    # 칠해 흰 원반 하나로 만들었습니다. from_shaded 주석에 자세히 적었습니다.
    ("싱가포르 한인회.jpg", "korean-association.png", "shaded"),
    # Microsoft: the stacked lockup (four squares over the wordmark) is the only
    # art we have. It is used small - a 16px-tall mark on the pre-event band -
    # and the stacked form survives that better than a horizontal one would,
    # because the squares stay square instead of shrinking with the cap height.
    ("마이크로소프트.jpg", "microsoft.png", "color"),
    # The Foundry: black speech-bubble + "FOUNDRY." wordmark on an orange sheet.
    #
    # Only the WORDMARK is taken (crop). The bubble is a filled shape, so in white
    # mono it is a featureless white square - at the size this renders (a route-map
    # venue marker, ~63x17 CSS px) it names nothing and eats a quarter of the width
    # the letters need.
    #
    # SOURCE: "The Foundry horizontal.png", the official horizontal lockup from
    # foundry.sg, 2452x701. NOT "The Foundry.jpeg" - that is the square avatar at
    # 225x225, where the wordmark is 65x16px of JPEG-artefacted ink. Upscaled to
    # the marker's device pixels it was visibly mushy, and no amount of blur-and-
    # threshold tracing recovers letterforms that were never sampled. If this logo
    # ever needs redoing, start by looking for a bigger source, not a better filter.
    ("The Foundry horizontal.png", "foundry.png", "color", {"crop": (640, 145, 2362, 557)}),
    # Onword Lab: the wide "⊃ ONWORD LAB" lockup, NOT the square ">." glyph -
    # the glyph alone names nothing.
    #
    # NOTE THE OUTPUT FILENAME. This shipped as `onword.png` twice with different
    # artwork inside, and browsers and the CDN kept serving the first version:
    # the change was invisible on the live site for a whole round of review, and
    # the logo got "fixed" a second time on the strength of a stale image. Any
    # future ARTWORK swap must land on a NEW filename for the same reason.
    # SMU: Day 8 결과 공유회가 이 캠퍼스로 옮겨오면서(2026-08-19) 노선도의 장소
    # 마커로 씁니다. 소스는 CI/SMU.jpg - 공식 세로 로크업(싱가포르 지도 위 사자,
    # 그 아래 "SMU" 워드마크)입니다.
    #
    # SMU: 공식 세로 로크업 전체(싱가포르 지도 위 사자 + "SMU" 워드마크)를 그대로
    # 씁니다. 크롭하지 않습니다 - 사자만, 글자만 떼어 본 두 판을 거쳐 전체로
    # 돌아왔습니다. 글자만 쓰면 세리프 대문자가 폭 45px를 먹어 옆 마크보다
    # 무겁고, 사자만 쓰면 세로 비율 탓에 폭 10px로 줄어 형태가 남지 않습니다.
    #
    # 세로로 긴 마크라 마커 쪽에서 DayMeta.venueLogo의 `tall`로 받습니다(28px).
    # 그 높이에서 잉크 총량이 134로 aws(145)와 맞고 워드마크도 읽힙니다.
    #
    # ⚠️ 출력 파일명에 주의. 이 마크는 이미 한 번 같은 이름(smu.png)으로 아트워크만
    # 바뀐 적이 있고, 브라우저가 옛 이미지를 계속 서빙해 변경이 화면에 반영되지
    # 않았습니다 - onword.png가 겪은 그대로입니다(아래 JOB 주석). 그래서 이번에는
    # 새 이름으로 나갑니다. 아트워크를 또 갈면 파일명도 또 바꾸세요.
    ("SMU.jpg", "smu-lockup.png", "color"),
    ("onword new logo.png", "onword-lab.png", "alpha"),
    # 널담(Nuldam): a solid blue "Nuldam" wordmark already cut out on
    # transparency, so "alpha" - the source alpha IS the shape and we only
    # repaint the ink white. Do NOT feed this to "color": the sheet is
    # transparent, so the corner samples that mode averages for a background
    # colour are (255,255,255,0), and every ink pixel then measures its distance
    # from white rather than from nothing.
    ("Nuldam.png", "nuldam.png", "alpha"),
    # 2026-10-19 (사용자: "day 1 and day 4에 각각 GSC랑 MARU180 로고"): 12월 노선도의 장소 로고.
    # GSC는 G, S, C가 겹쳐 있어 "alpha"로 통째 흰색이면 세 글자가 한 덩어리가 됩니다. "tone"이 글자마다 밝기를 달리합니다.
    ("GSC.png", "gsc.png", "tone", {"ci": "dec"}),
    ("마루180.png", "maru180.png", "color", {"ci": "dec"}),
    # 2026-10-21 (사용자: 12월 함께하는 곳 로고). 아산나눔재단은 짙은 초록 단색이라 "dark".
    # AXMOS는 원본이 이미 투명 바탕이라 "alpha". Lovable, Bloom, 크라이치즈버거는 원래 색이라 scripts/colorize-partner-logos.py에 있습니다.
    ("아산나눔재단.png", "asan-nanum.png", "dark", {"ci": "dec"}),
    ("AXMOS.png", "axmos.png", "alpha", {"ci": "dec"}),
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

    "color" answers one question - is this pixel the sheet or the mark - and
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
    collapses the emblem back into the disc this mode was written to avoid -
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


def from_tone(im):
    """Cut-out mark with OVERLAPPING colour shapes plus black type (GSC).
    Everything turns solid white, and a thin gap is cut wherever two differently
    coloured shapes meet, so G, S and C stay apart without going grey.
    (2026-10-19, visual audit 7: the first version dimmed each letter by its
    luminance, and the mark read grey next to MARU180's solid white.)
    DECIDED 2026-10-19 (사용자: "G and S 가 좀 깨져있음"): 경계의 섞인 색 픽셀을
    픽셀마다 따로 분류하니 틈이 톱니처럼 깨졌습니다. 글자별 소속을 4배로 보간해
    다시 나누어 경계를 매끄럽게 하고, 그 경계를 따라 틈을 팝니다."""
    from PIL import ImageFilter
    K = 4  # 원본(466px)이 작아서 4배로 키운 뒤 틈을 팝니다.
    a = np.asarray(im.convert("RGBA")).astype(float)
    rgb, alpha = a[:, :, :3], a[:, :, 3]
    colour = ((rgb.max(axis=2) - rgb.min(axis=2)) >= 40) & (alpha > 128)
    # Label each coloured pixel by its nearest letter colour (sampled from the source).
    refs = np.array([[96, 91, 164], [218, 114, 119], [60, 160, 90]], float)
    d = ((rgb[:, :, None, :] - refs[None, None]) ** 2).sum(axis=3)
    near = d.argmin(axis=2)
    W, H = im.width * K, im.height * K

    def up(m, blur=0.0):
        img = Image.fromarray(np.clip(m, 0, 255).astype(np.uint8))
        if blur:
            img = img.filter(ImageFilter.GaussianBlur(blur))
        return np.asarray(img.resize((W, H), Image.BICUBIC)).astype(float) / 255

    # 글자마다 원본 해상도의 소속 정도를 부드럽게 보간해 키운 뒤 가장 강한 쪽으로 나눕니다.
    # 픽셀 계단이 매끄러운 곡선이 되고, G의 가로 막대 같은 직선과 모서리는 그대로 남습니다.
    score = np.stack([up((colour & (near == i)) * 255.0, 0.8) for i in range(len(refs))])
    region = up(colour * 255.0, 0.6) > 0.3
    lab = np.where(region, score.argmax(axis=0), -1)
    # 틈은 뒤에 놓인 글자 쪽만 팝니다. 앞 글자는 원래 윤곽(G의 가로 막대 등)을 그대로 지킵니다.
    # 겹침 순서는 원본 그림에서 읽었습니다(원본 y 기준): G/S는 y 62 위에서 S가 앞, 아래에서 G가 앞.
    # S/C는 y 57 위에서 C가 앞, 아래에서 S가 앞.
    yy = np.arange(H)[:, None] / K
    back = {(0, 1): np.where(yy < 62, 0, 1), (1, 2): np.where(yy < 57, 1, 2)}
    gap = np.zeros(lab.shape, bool)
    for (i, j), bk in back.items():
        e = np.zeros(lab.shape, bool)
        for dy, dx in ((0, 1), (1, 0)):
            a1, b1 = lab[: H - dy, : W - dx], lab[dy:, dx:]
            hit = ((a1 == i) & (b1 == j)) | ((a1 == j) & (b1 == i))
            e[: H - dy, : W - dx] |= hit
            e[dy:, dx:] |= hit
        # 틈 너비는 원본 기준 약 5px.
        wide = np.asarray(Image.fromarray((e * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41))) > 0
        gap |= wide & (lab == bk)
    soft = np.asarray(Image.fromarray((gap * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(float) / 255
    big_alpha = np.asarray(Image.fromarray(alpha.astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(float)
    big_alpha = np.clip(big_alpha, 0, 255)
    big_alpha[big_alpha < 8] = 0  # 확대할 때 가장자리에 생긴 옅은 잔상을 지워 여백이 늘지 않게 합니다.
    return big_alpha * np.clip(1 - soft * 1.3, 0, 1)


def from_alpha(im):
    """Already cut out on transparency → the source alpha IS the shape."""
    return np.asarray(im.convert("RGBA")).astype(int)[:, :, 3].astype(float)


def trim_all(only=frozenset()):
    """Crop every mark to its alpha bbox so they all fill their tile the same."""
    TRIMMED.mkdir(parents=True, exist_ok=True)
    for src in sorted(OUT.glob("*.png")):
        if only and src.name not in only:
            continue
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
    only = set(sys.argv[1:])  # 출력 파일 이름을 주면 그것만 만듭니다(예: gsc.png maru180.png)
    for src, out, mode, *rest in JOBS:
        opts = rest[0] if rest else {}
        if only and out not in only:
            continue
        im = Image.open((CI_DEC if opts.get("ci") == "dec" else CI) / src)
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
            "tone": from_tone,
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
    trim_all(only)


if __name__ == "__main__":
    main()
