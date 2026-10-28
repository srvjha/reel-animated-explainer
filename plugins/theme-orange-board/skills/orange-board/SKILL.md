---
name: orange-board
description: "Reel theme: orange board. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen whiteboard pages: warm white board with an orange dot grid, white cards and logo nodes with soft shadows, connectors with a running light pulse, an LLM token stream, light code panels, and big equation layouts. Manrope + Fira Code. Pages come into focus from a blur. Chill-trap music. No banners or plates. Load it when editing a reel with reel-studio about AI, LLMs, agents, harnesses, tools, or when a clean white board with orange dots is wanted."
---

# Theme: Orange Board

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (What is a harness in AI, 92 s, 15 cuts, 8 page scenes, Claude and Codex logos).

**Identity:** board #FFFDFB with an orange #F3B08F dot grid, ink #1F1D24, orange #E8622F (primary), blue #3D5AFE, green #0F9F74 (success), amber #D98A00, red #E5484D. Code panels #FFF7F1. No purple. Manrope 800 headings and captions, Fira Code for code.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page'`. Talk = the source video full screen, untouched. Page = focus-in from blur + slight zoom (0.4 s) and blur-out (0.3 s).
- Scenes play only on pages (crossfade when several share one cut). Content lives between y 140 and y 1540. `Head` = small orange label + title at x 90, y 140 (size 82; keep titles under about 20 characters).
- Captions: talk y 1460, page y 1600; spoken word on an orange pill.

## Components (`./theme/kit`)
`Glass tint` (white card), `Node icon|logo label sub tint`, `Link x1 y1 x2 y2 curve flow` (glowing connector with pulse), `Tokens` (LLM writing), `Code title lines=[{at,text,hl}]` + `K`, `Mover`, `Tag`, `Head`, `Txt`, `Center`, `Icon` (Phosphor duotone in public/icons), `Logo`, `At`, `Appear` (with blur), `PopIn`.

## Sound
`sound.py`: chill-trap at a 140 bpm half-time feel (808 with glide, swung hats with rolls, rim on 3, warm pad, bell motif). SFX: `focus` (page in), `blur` (page out), `chime`, `pop`, `tick`, `tap`, `swoosh`, `error`, `spark`, `type`.

## Do / don't
- No banners or stamp plates.
- Fix small factual slips on screen (and tell the user) without touching the audio.
- Keep titles on one line; never leave a single word alone on a line.

- The user preferred this light whiteboard look over a dark frosted-glass background for this topic.
