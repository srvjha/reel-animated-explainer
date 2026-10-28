---
name: glass-rig
description: "Reel theme: glass rig. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen frosted-glass pages: deep ink background with two slowly drifting light blobs (warm coral, cool blue) and grain, frosted glass cards and nodes, glowing curved connectors with a light pulse, an LLM token stream, code/output panels, and a big equation layout. Manrope + Fira Code. Pages come into focus from a heavy blur. Chill-trap / future-garage music. No banners or plates. Load it when editing a reel with reel-studio about AI, LLMs, agents, harnesses, tools, or anything modern and product-like."
---

# Theme: Glass Rig

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (What is a harness in AI, 92 s, 15 cuts, 8 page scenes, Claude and Codex logos).

**Identity:** ink #0A0D14, coral #E8836A (primary), blue #6F8BFF, mint #5EE6B0 (success), amber #FFC857, red #FF5C6C. No purple. Manrope 800 headings and captions, Fira Code for code.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page'`. Talk = the source video full screen, untouched. Page = focus-in from blur + slight zoom (0.4 s) and blur-out (0.3 s).
- Scenes play only on pages (crossfade when several share one cut). Content lives between y 140 and y 1540. `Head` = small coral label + title at x 90, y 140 (size 82; keep titles under about 20 characters).
- Captions: talk y 1460, page y 1600; spoken word on a coral pill.

## Components (`./theme/kit`)
`Glass tint` (frosted card), `Node icon|logo label sub tint`, `Link x1 y1 x2 y2 curve flow` (glowing connector with pulse), `Tokens` (LLM writing), `Code title lines=[{at,text,hl}]` + `K`, `Mover`, `Tag`, `Head`, `Txt`, `Center`, `Icon` (Phosphor duotone in public/icons), `Logo`, `At`, `Appear` (with blur), `PopIn`.

## Sound
`sound.py`: chill-trap at a 140 bpm half-time feel (808 with glide, swung hats with rolls, rim on 3, warm pad, bell motif). SFX: `focus` (page in), `blur` (page out), `chime`, `pop`, `tick`, `tap`, `swoosh`, `error`, `spark`, `type`.

## Do / don't
- No banners or stamp plates.
- Fix small factual slips on screen (and tell the user) without touching the audio.
- Keep titles on one line; never leave a single word alone on a line.
