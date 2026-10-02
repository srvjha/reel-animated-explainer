---
name: lime-bento
description: "Reel theme: lime bento. Dark grid backdrop with lime, orange, teal accents; the speaker slides between full screen and a bento tile, can split into labelled strips; karaoke captions; glitch-slice transitions. Load it when editing a reel in this theme with reel-studio."
---

# Theme: Lime Bento

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` ("Database Sharding", 166 s).

**Identity:** dark `#0E0F11` with a drifting grid, lime `#C6F432` primary, orange `#FF8A1F` warning, hot red `#FF4D3D` failure, teal `#2EE6C9` secondary. Unbounded 800 headlines, Bricolage Grotesque 800 captions, JetBrains Mono labels. Dark 112 bpm bed, glitchy UI sounds.

**Best for:** longer system-design explainers (1.5 to 3 min) with load, scaling, data flow and trade-offs.

## Layout
- Full screen speaker for the hook, bridges and the ending (`cfg.punches` zoom in those parts).
- `cfg.bento` windows: the speaker slides into a rounded tile at **y 1000 to 1860** and scenes draw in the **top zone y 60 to 960**. A lime slice wipes across at every switch.
- `cfg.split`: the speaker splits into N labelled strips (e.g. SHARD 1..4) from `t0` to `t1`. Use it once, when the idea is literally "split".
- Captions: karaoke, 2 lines (maxc 24) at the bottom; the active word sits on a white (or lime for keywords) block.
- Scenes are full-frame layers that self-time with `Header t0 t1` and `Appear t0 t1`; the Frame only mounts them in `[a, b]`.

## Config
```ts
export const cfg: Config = {
  bento: [[7.8, 53.3], [56.0, 86.9]],
  punches: [[T.horizontal1 - 0.15, 56.0, 0.12]],          // [start, end, amount]
  split: {t0: T.sharding1, t1: 107.0, labels: ['SHARD 1', 'SHARD 2', 'SHARD 3', 'SHARD 4']},
  overlays: [Hook, Hero, Ending],                          // free layers, defined in Video.tsx
};
```

## Components (`./theme/kit`)
- `Header t0 t1 kicker title color` ("// KICKER" + headline, top-left) - every scene starts with one.
- `Chip color size solid` outlined or solid mono chip. `Appear t0 t1 from='up'|'down'|'left'|'right'|'scale'`.
- `Cyl w h fill color label sub glow stripes` database cylinder with a live liquid level.
- `Flow x0 y0 x1 y1 t0 t1 n speed color` glowing dots moving along a line. `Line ... dash` animated connector.
- `AppBox label` app window. `TitleStrip pre hi sub slice` title card ("DATABASE" + lime "SHARDING"), glitch-slices at `slice`. `Typed` (lime caret).
- Core: `Counter`, `Shake`, `win`, `ease`, `lerp`.

## Sound (`sound.py` SFX)
`swoosh` (layout switches), `slice` (big reveals, the split), `blip` (`f`, `d`; items), `tick` (counters, typing; repeat), `thud` (limits, failures), `alarm` (overload, hotspot), `riser` (build-up, `d`).

## Do / don't
- Colour carries meaning: lime ok, orange stress, red failure. Don't use red decoratively.
- Keep scene content inside y 60 to 960 while in bento; nothing may reach the speaker tile.
- One split per reel. The title strip text must stay on one line (shrink `size`).
