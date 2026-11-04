---
name: night-blueprint
description: "Reel theme: night blueprint. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen black pages with a fine dot grid and faint 150 px grid: blueprint-style outlined boxes with corner ticks and dimension labels, wires that draw on, checklist rows, semicircle gauges, line charts, a CAP triangle. Cyan = functional / what it does, amber = non-functional / how well. Outfit + Geist Mono. Pages are revealed by a glowing cyan scan line. Synthwave music. No banners or plates. Load it when editing a reel with reel-studio about system design fundamentals, requirements, architecture, trade-offs, or whenever a black dotted look is wanted and dotgrid-dark was used recently."
---

# Theme: Night Blueprint

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (Functional vs non-functional requirements, 102 s, 13 cuts, 7 page scenes).

**Identity:** #060708 with #22262C dots and a faint 150 px grid, line white #E9EEF2, cyan #38D6F5, amber #F7B32B, green #43D19E, red #FF5A5F. No purple. Outfit 800 headings and captions, Geist Mono labels.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page'`. Talk = source video full screen, untouched. Page = scan-line wipe down (0.4 s) and back up (0.32 s).
- Content lives between y 140 and y 1460. `Head` = mono label + title at x 90, y 140 (size 84; keep titles under about 18 characters).
- Captions: talk y 1470, page y 1600; spoken word on a cyan pill. Use `maxc 22`.
- Keep on-screen text in English; captions follow the spoken words.

## Components (`./theme/kit`)
`BBox x y w h color label fill` (blueprint box), `Wire flow head`, `Item icon text ok` (checklist row), `Gauge cx cy r to value label`, `Tag`, `Head`, `Txt`, `Center`, `Icon` (Phosphor duotone in public/icons), `Logo`, `At`, `Appear`, `PopIn`. The example adds a traffic-spike line chart, an architecture sketch (LB, servers, cache, DB) and a CAP triangle.

## Sound
`sound.py`: synthwave at 100 bpm (detuned pad, octave 8th bass, gated snare, delayed arp, tom fills). SFX: `scan`, `whoosh`, `draw`, `blip`, `tick`, `pop`, `ding`, `error`, `rise`, `lock`.

## Do / don't
- No banners or stamp plates.
- Show technically precise wording on screen when the script is loose, and tell the user.
- Keep titles on one line; never leave a single word alone on a line.
