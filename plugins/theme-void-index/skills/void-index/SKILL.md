---
name: void-index
description: "Reel theme: void index. Near-black canvas with drifting blue and dark brown glow and a faint grid, for list and countdown reels like '10 AI terms in 60 seconds': the full list appears first, then one glass card per item with a big outlined number, term, expansion and a mini diagram; the header carries the title, a 1..N progress rail and a countdown ring that runs from N seconds to 0 exactly over the list. Cut-out speaker in a window below. Phosphor duotone icons. Load it when editing a list, top-N or timed explainer reel with reel-studio, or when a dark, mostly black look is wanted."
---

# Theme: Void Index

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (10 AI terms you must know in 60 seconds, 86 s, list + 10 item cards).

**Identity:** #050507 canvas, electric blue #3B82F6 and cyan #22D3EE accents with a dark brown glow (no purple), faint moving grid; Space Grotesk display, Inter body, JetBrains Mono labels. Captions in a dark glass pill, the spoken word cyan with a glow underline.

## The countdown
`cfg.timer = {a, b, from}` counts `from` to 0 between `a` (first item starts) and `b` (last item ends). When the spoken list runs longer than the promised time, scale it like this so it lands on 0 exactly at the end (ask the speaker first; the alternative is real seconds with an overtime state). The ring turns pink in the last 10 and green with DONE at 0. Add a soft `clock` SFX per displayed second from `cues.json`.

## Layout
- `cfg.items = [{t, label}]` drives the progress rail (done = blue, current = cyan).
- `talk`: speaker full screen; overlays in the band y 1120 to 1560; captions at y 1600.
- `card`: header at y 34 (title, rail, ring), card at y 168 with **scenes in 1000 x 800**, captions at y 1010, speaker window x 40 y 1190, 1000 x 700.
- Use `ItemHead n term full` at the top of every item scene; leave y 210 to 780 for the diagram.
- Speaker cut-out: reel-studio `cutout/matte.py` + `build_speaker.py`, then `cfg.speaker: 'speaker.webm'`. Do not render stills while two matte jobs run on an 8 GB machine.

## Components (`./theme/kit`)
`ItemHead`, `Countdown`, `Box` (glass panel, `glow`), `Tag`, `Flow`, `Icon`, `Appear`. The example adds `Pill`, `NodeBox`, `Typed`, `Msg`, and talk-mode `Band`/`Plate`/`Big`.

## Do / don't
- Mark example numbers (token ids, scores, vectors) as illustrative.
- Keep every title on one line; never leave a single word alone on a line.
