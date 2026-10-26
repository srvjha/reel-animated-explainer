---
name: dotgrid-dark
description: "Reel theme: dotgrid dark. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen near-black pages with a dot grid and soft green glow: dark cards, JetBrains Mono code panels, thread lanes with task bars and a playhead, a callback queue, chips that move between places, and an event-loop ring with phase nodes and a rotating pointer. Space Grotesk headings. Pages appear through the dot grid (every dot grows until it covers the screen). Dark minimal techno music. No banners or plates. Load it when editing a reel with reel-studio about Node.js, JavaScript runtime, async, concurrency, threads, queues or schedulers, or whenever a black dotted look is wanted."
---

# Theme: Dotgrid Dark

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How the Node.js event loop works, 105 s, 14 cuts, 10 page scenes).

**Identity:** #060606 with a #242424 dot grid, cards #101010, Node green #6CC24A (lime #A6E36B for keywords), cyan #22D3EE, amber #FBBF24, red #F43F5E. No purple. Space Grotesk 700 headings and captions, JetBrains Mono for code and labels.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page'`. Talk = the source video full screen, untouched. Page = dot-grid reveal (0.36 s in, 0.28 s out).
- Scenes play only on pages (crossfade when several share one cut). Content lives between y 140 and y 1540. `Head` = mono label + title at x 90, y 140 (size 84; keep titles under about 18 characters).
- Captions: talk y 1470, page y 1600; spoken word on a green pill.

## Components (`./theme/kit`)
`Ring cx cy r phases angle active` (event loop / any cycle), `Lane label bars=[{at,x,w,label,color,ghost}] head` (thread timeline), `Mover` (chip travels p1 to p2), `Code title lines=[{at,text,hl}]` + `K`, `Panel glow`, `Tag`, `Arrow dash`, `Head`, `Txt`, `Center`, `Icon` (Phosphor duotone in public/icons), `Logo`, `At`, `Appear`, `PopIn`.

## Sound
`sound.py`: dark minimal techno at 124 bpm (deep kick, rolling sub, hats, filtered minor stab with a slow sweep, drone). SFX: `dots` (page in), `whoosh` (page out), `spin` (ring pointer), `blip`, `tick`, `pop`, `thud`, `glitch`, `error`, `ding`.

## Do / don't
- No banners or stamp plates.
- If the script says something slightly off (e.g. "callbacks register" in a phase where they actually run), show the correct wording on screen and tell the user.
- Label example values as illustrative. Keep titles on one line; never leave a single word alone on a line.
