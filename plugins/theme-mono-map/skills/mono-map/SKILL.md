---
name: mono-map
description: "Reel theme: mono map. Strict black and white, ride-hailing app look. Three shot types with hard cuts: full-screen stock clips graded to B&W (slow push-in, overlays like app cards and pills), the speaker cut out on a black street map, and white street-map pages that slide up like an app bottom sheet. Pages draw top-down cars, a square-in-circle pickup pin, pointy-top hexagon grids (axial coords, ring distance, per-cell styling), routes, app-style cards. Inter Tight + JetBrains Mono, no colour accents. Night-drive minimal music. Load it when editing a reel with reel-studio about maps, location, ride-hailing, delivery, geospatial indexing, nearest-neighbour search, or whenever a black and white look with stock footage is wanted."
---

# Theme: Mono Map

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. Reference reel: `theme/example/Video.tsx` (How Uber finds the nearest driver, 115 s, 18 cuts, 10 page scenes, 7 stock clips).

**Identity:** black #000, white #FFF, map grey #F2F2F2 with #E0E0E0 / #D2D2D2 roads, greys #6E6E6E and #A8A8A8. No colour. Emphasis = black vs grey, solid vs outline, strike-through. Inter Tight 800 titles and captions, JetBrains Mono labels.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page' | 'clip'`. Clip cuts take `src` (public path), `from` (seconds into the clip), optional `zoom`, `pos`.
- Page = white map sheet slides up from the bottom (0.42 s, rounded top + grab handle) and drops at the end (0.3 s).
- Clip = full-screen, CSS grayscale + contrast, 8% push-in, top and bottom gradient. Put clip text in `cfg.overlays` (they render under the page sheet) and gate each overlay by time.
- `Head` = mono chip label + one-line title at y 150 (size 80, about 20 characters max).
- Content between y 300 and y 1560. Captions: page y 1610 (black, active word on black pill), talk y 1530, clip y 1480 (white, active word on white pill). `maxc 22`.
- On-screen text English; captions follow the spoken words. Label example numbers as illustrative.

## Components (`./theme/kit`)
`HexGrid cx cy s rings t0 stagger style(q,r,d,t) clip`, `hexXY`, `hexDist`, `hexPath`, `Car x y rot s dim color`, `Pin x y t0 r pulse color`, `Route pts t0`, `Wire dash flow head`, `Card x y w t0 out dark`, `Tag solid light icon`, `Head`, `Txt`, `Icon` (Phosphor duotone in public/icons), `At`, `Center`, `Appear out`, `PopIn`, `Streets dark`, `TalkBg`.

## Speaker on the black street map
1. Render the background still: a tiny composition that renders `TalkBg` (`npx remotion still src/Bg.tsx Bg talkbg.png`).
2. Mattes for the talk segments with reel-studio `cutout/matte.py` (ISNet only works fine).
3. `flatten_speaker.py` composites the speaker over the still (bottom fade at the desk line, edit `CUT`) straight into an opaque `talk.mp4`; set `cfg.speaker: 'talk.mp4'`.

## Stock clips
Free-license portrait clips (Pexels) downloaded through the user's browser, then scaled and cropped to 1080x1920 30 fps h264 in `public/clips/`. Colour clips are fine: the kit grades them to B&W.

## Sound
`sound.py`: night-drive minimal at 92 bpm (electric-piano minor 7ths, sub, indicator-tick hats, kick on 1 and 3, rim on 4, sparse plucks). SFX: `sheet`, `drop`, `ping`, `tap`, `hex`, `sonar`, `match`, `whoosh`, `pop`, `tick`.

## Do / don't
- No banners or stamp plates. Hard cuts only; the speaker never shares a frame with a page.
- Titles on one line; never leave a single word alone on a line.
