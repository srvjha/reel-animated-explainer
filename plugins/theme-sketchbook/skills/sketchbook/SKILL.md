---
name: sketchbook
description: "Reel theme: sketchbook. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen notebook pages: ruled paper, red margin, hand-drawn rough.js boxes, arrows, circles, ticks and crosses that draw themselves on, Caveat/Kalam handwriting, a yellow highlighter, sticky notes, and handwritten captions with a highlighter on the spoken word. Lo-fi music bed with paper SFX. No banners or plates. Load it when editing a reel with reel-studio that should look like a whiteboard or notebook explainer, or when the user wants cuts instead of a split layout."
---

# Theme: Sketchbook

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How ACID transactions work, 107 s, 14 cuts, 9 page scenes).

**Identity:** paper #FBF8F1 with faint blue rules and a red margin, ink #23232B, pencil grey, blue #2F6FD6, red #E04B3A, green #2E9E5B, orange #F08A24, highlighter yellow #FFE45C. Caveat for handwriting, Kalam for captions and labels, Patrick Hand for big glyphs.

## Layout
- `cfg.cuts`: a list of `{a, b, m}` with `m = 'talk' | 'page'`. Talk = the source video full screen, untouched. Page = a notebook page that slides up over the video (0.28 s) and drops away at its end.
- Scenes play only on pages; several scenes can share one page cut (they crossfade). Page content lives between y 140 and y 1560; the title is handwritten at x 130, y 150 as part of the page, never a banner.
- Captions: talk frames y 1470 (white with dark outline); page frames y 1600 (ink). The spoken word gets a yellow highlighter.
- Cut to a page when he starts explaining something visual; cut back to him for the short "A ka matlab..." style section intros and the CTA lead-in.

## Components (`./theme/kit`)
`Write t0 x y size color font w center rot` (handwriting that writes itself), `Hilite`, `RRect`, `RCircle`, `RLine`, `RArrow curve`, `RCross`, `RTick`, `RShape build={(g, o) => ...}` for any rough.js drawable, `Sticky` (note that slaps on, with tape). Give every rough shape its own `seed` so it does not wobble between frames. The example adds `Person` (stick figure), `Server`, `Disk`, `Lock`, `Bolt`, `Envelope`, `Strike`.

## Sound
`sound.py`: lo-fi bed (Rhodes chords, swung boom-bap at 82 bpm, soft bass, tape wobble, vinyl crackle). SFX: `flip` (page in/out), `scribble`, `pop`, `erase`, `ding`, `tick`, `thud`, `error`, `crumple`.

## Do / don't
- No banners, plates or sudden title bars; everything is drawn on the page.
- Label example values (balances, amounts) as examples.
- Keep every title on one line; never leave a single word alone on a line.
