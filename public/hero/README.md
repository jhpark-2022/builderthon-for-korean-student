# Hero background video

The hero (`Chapter id="top"`) shows a full-bleed background video instead of
just the WebGL field, toggled by `HERO_VIDEO.enabled` in
`components/journey/Journey.tsx`.

## Current clip

`metal-human.mp4` / `metal-human-poster.jpg` — a chrome / liquid-metal humanoid
loop from **GetLayers** (https://getlayers.ai), no watermark. Source master was
a 4K (2910×2176) 10s silent loop (~57MB); re-encoded here to 1080p-height,
silent H.264 at **~665KB** (+ a 114KB poster) via the recipe below.

Only the MP4 ships — at this bitrate a VP9 WebM came out *larger*, so it wasn't
worth serving. H.264 is universally supported, so the single mp4 is enough.

## How to replace / re-encode

1. Make a short, seamless, **silent** loop (~8–15s). Source it however you like
   (AI: Sora / Runway / Veo / Kling · stock: Pexels / Coverr / GetLayers).

2. Optimise it for the web — small file, no audio, 1080p. With ffmpeg:

   ```bash
   # MP4 (H.264) — scale to 1080px height, strip audio, faststart for streaming
   ffmpeg -i source.mp4 -an -vf "scale=-2:1080" \
     -c:v libx264 -profile:v high -pix_fmt yuv420p \
     -crf 30 -preset slow -movflags +faststart metal-human.mp4

   # Poster still, shown before the video loads / if it fails
   ffmpeg -i source.mp4 -vf "scale=-2:1080" -q:v 4 metal-human-poster.jpg
   ```

   Target: video **≤ ~1MB**. (Raise `-crf` for smaller / lower `-crf` for crisper.)

3. Keep the same two filenames (`metal-human.mp4`, `metal-human-poster.jpg`) so
   `HERO_VIDEO` in `Journey.tsx` needs no edit — or update the paths there.

4. Ensure `HERO_VIDEO.enabled = true` in `components/journey/Journey.tsx`.

That's it — the rest of the page keeps the WebGL background; only the hero
swaps to video, with a dark legibility scrim baked in.
