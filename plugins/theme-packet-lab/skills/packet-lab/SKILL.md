---
name: packet-lab
description: "Reel theme: packet lab. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen light network-lab pages: cool off-white dot grid, client and server device cards, wires that draw on with flowing dashes, envelope packets that travel between devices, dark code panels with real HTTP requests/responses and JSON (lines type in and highlight), hex byte streams, and a 7-step cycle tracker. Sora + IBM Plex Mono. Captions with the spoken word on a blue pill. Pages open with a circular iris. Minimal house music with network/UI SFX. No banners or plates. Load it when editing a reel with reel-studio about HTTP, APIs, networking, protocols, client-server flows or request pipelines."
---

# Theme: Packet Lab

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How the request-response cycle works, 136 s, 19 cuts, 15 page scenes).

**Identity:** lab #EEF2F7 with a dot grid, white cards, ink #0F1B33, client blue #2563EB, server teal #0F9D76, packet amber #F5A524, red #E5484D for errors, code panels #0F1B33. No purple. Sora 800 headings, IBM Plex Mono for code and labels.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page'`. Talk = the source video full screen, untouched. Page = the lab opens as a circle from the bottom-right corner (0.32 s) and closes back into it.
- Scenes play only on pages (crossfade when several share one cut). Content lives between y 140 and y 1460. `Head` = mono step label + title at x 90, y 140 (size 80; keep titles under about 18 characters).
- `cfg.steps` + `cfg.stepAt(t)` drive the tracker at y 1500 (return an index, 'all' or null). Captions: talk y 1470, page y 1620.

## Components (`./theme/kit`)
`Device kind=client|server label sub icon`, `Wire x1 y1 x2 y2 flow=[a,b] head`, `Packet x1 y1 x2 y2 t0 d label color`, `Code title lines=[{at, text, hl}]` with `K` for token colours, `Bytes` (hex stream), `Panel`, `Tag icon solid`, `Arrow`, `Head label title`, `Txt`, `Icon` (Phosphor duotone in public/icons), `Logo`, `At`, `Appear`, `PopIn`.

## Sound
`sound.py`: minimal house at 118 bpm (soft four-on-the-floor, offbeat hats, plucky chord stabs, rubbery bass, arpeggio every other 8 bars). SFX: `iris` (page in), `swish` (page out), `send`, `recv`, `click`, `pop`, `type`, `data`, `ding`, `error`.

## Do / don't
- No banners or stamp plates; status is shown with ticks, tags and highlights.
- Label example values as illustrative.
- Keep every title on one line; never leave a single word alone on a line.
