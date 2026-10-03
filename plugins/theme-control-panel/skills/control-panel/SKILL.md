---
name: control-panel
description: "Reel theme: control panel. Concrete industrial panel with a riveted nameplate, the speaker in a bezel camera window, an engineering-grid schematic board that powers on with an orange scan line, label-maker tape captions, breaker switches, lamps, 7-segment counters and red trip flashes. Load it when editing a reel in this theme with reel-studio."
---

# Theme: Control Panel

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` ("Circuit Breaker", 140 s).

**Identity:** concrete `#E3E1DB` panel with screws, signal orange `#FF5A1F`, ink `#17181A`, green `#21A45B` healthy, amber `#FFB000` degraded, red `#E5322D` failed. Archivo Black headlines, Barlow Condensed captions (uppercase), Space Mono labels. Minimal industrial bed at 100 bpm with clunks, relay clicks and zaps.

**Best for:** reliability and failure topics: circuit breakers, retries, timeouts, rate limiting, health checks, load shedding, anything with states, thresholds and things going down.

## Layout
- Nameplate (always on top, y 40 to 168): `cfg.title` on one line (about 18 chars max) and `cfg.sub` engraved below.
- Full screen speaker in `cfg.full` windows (hook, a reveal, the ending). Captions sit at y ~1330 then.
- Otherwise the speaker sits in a bezel window (y 190 to 900), captions in their own band (y 912 to ~1066, never over the face), and the **board** below (y 1076 to 1880).
- **Scenes draw in a 1000 x 850 box** that is scaled into the board. Keep important content in y 100 to 780. Each scene powers on with an orange scan line.
- `cfg.trips`: times of a red trip hit (border flash, speaker shake, red tint). Use 2 to 5 per reel, on real failures.
- `cfg.overlays`: free layers (the example uses one for a hook visual while full screen, at y 1560+).

## Config
```ts
export const cfg: Config = {
  title: 'CIRCUIT BREAKER',
  sub: 'BUILDING BACKEND SYSTEMS · EP 13',
  full: [[0, 8.45], [62.45, 64.8], [137.8, 999]],
  trips: [T.down - 0.1, T.open1 - 0.1],
  overlays: [Hook],
};
```

## Components (`./theme/kit`)
- `Section t0 t1 n title color` numbered heading, top-left of every scene.
- `Block label sub w h state='ok'|'slow'|'down'|'idle'` service box with a status LED (blinks red when down).
- `Wire x1 y1 x2 y2 t0 flow cut color` wire that draws in, with current flowing; `cut` shows a broken wire.
- `Breaker state='closed'|'open'|'half' s` DIN-rail breaker (lever up ON, down TRIP, middle TEST).
- `Lamp color on label size`, `Seg text color size label` 7-segment display, `Gauge v limit label size` dial with red zone.
- `Spark x y t0`, `Packet pts t0 d color label loop` request moving along points.
- `Plate color bg size` straight engraved chip, `Appear t0 t1 from`.
- Tokens: `CONCRETE STEEL PAPER GRID INK ORANGE RED GREEN AMBER MUTED`, fonts `HEAD COND MONO`, `BOARD_W BOARD_H`.

## Sound (`sound.py` SFX)
`clunk` (breaker lever, big state change), `click` (relay; items appearing; repeat for counters), `zap` (`d`; failures, sparks), `alarm` (`d`), `powerup` / `powerdown` (layout changes), `beep` (`f`, `d`), `scan` (scene power-on), `tape`.

## Do / don't
- Colour is status: green healthy, amber degraded, red failed, orange for flow and emphasis. Never decorative red.
- Captions are uppercase label tape; keep pages to 2 lines of about 20 chars (`theme.json`).
- Don't put diagrams over the speaker window; the board is the only diagram area.
