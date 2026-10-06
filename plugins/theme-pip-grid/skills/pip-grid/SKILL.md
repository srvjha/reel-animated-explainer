---
name: pip-grid
description: "Reel theme: pip grid. Pure black with a fine moving grid, diagrams fill the whole frame, the speaker sits in a round story-ring picture-in-picture bubble from the first frame, scenes reveal cell by cell through the grid, captions fill the spoken word with a pink-to-orange gradient. Load it when editing a reel in this theme with reel-studio."
---

# Theme: PiP Grid

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` ("How Instagram uploads large files", 112 s).

**Identity:** black `#050505`, faint 60/300 px grid, pink `#FF3D7F` to orange `#FF7A2F` gradient, yellow, cyan, green success, red failure. Space Grotesk headlines, Geist Sans captions, Geist Mono labels. Half-time arranged bed (changes every few bars) with soft UI effects.

**Best for:** diagram-heavy explainers where the visuals matter more than the face: request flows, architectures, uploads, pipelines, anything with clients, servers and storage.

## Layout
- Title (top-left, one line) with an optional official logo from `public/` (`cfg.icon`, never redrawn).
- **PiP bubble** top-right (300 px, gradient story ring). `cfg.pip` picks the source circle (face + mic); `cfg.pipFocus` windows grow it to the centre (hook, ending).
- **Stage** = the whole frame below the title: **1080 x 1300 scene box** (frame y 170 to 1470). Keep `x > 690, y < 350` clear for the bubble.
- Captions: 2 lines (maxc 24) at y ~1490, words appear as spoken, the current word fills with a gradient wipe and underline; keywords stay gradient.
- Scenes enter through a grid-cell reveal (top-down with jitter) and fade out.

## Config
```ts
export const cfg: Config = {
  title: 'How Instagram uploads large files',
  icon: 'instagram.png',                 // copy the official logo into rem/public/
  pip: {cx: 530, cy: 560, r: 400},       // source-video circle: face centre and radius
  pipFocus: [[0, 2.4], [109.5, 999]],
};
```
Measure `pip` from a frame with a 100 px grid (`ffmpeg ... drawgrid`): centre between the eyes and the mic, radius covering hair to mic.

## Components (`./theme/kit`)
- `Header t0 t1 kicker title color` (title <= ~20 chars, stays left of the bubble), `Chip color size`, `GradText`, `Panel w h border`.
- `Phone w h` (children render on the screen), `Server w label hot`, `Bucket w label fill` (object storage), `FileIcon w label sub color`.
- `Progress v w h label fail`, `Chunk n s='idle'|'up'|'done'|'fail' size`, `Flow x1 y1 x2 y2 t0 color n speed stop` (dots moving along a dashed line).
- Tokens: `BG PANEL LINE WHITE GREY PINK ORANGE YELLOW GREEN RED CYAN GRAD`, fonts `HEAD SANS MONO`, `STAGE`.

## Sound (`sound.py` SFX)
`whoosh` (scene changes), `pop` (items), `tick` (repeat for counters), `chime` (`f`; success), `error` (failures), `sweep` (uploads, flows), `thump` (big moments).

## Do / don't
- Fill the stage: diagrams should use the full width; this theme has no speaker area to share with.
- Green success, red failure, gradient for the main flow. No purple added on top of logos.
- Never draw a brand logo; use the official file the user gives.
