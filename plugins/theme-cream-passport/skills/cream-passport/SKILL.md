---
name: cream-passport
description: "Reel theme: cream passport. Cream paper, navy and red ink, hard offset shadows, rubber stamps, ID cards and forms; the speaker shrinks into a framed card at the bottom; mustard keyword pills. Load it when editing a reel in this theme with reel-studio."
---

# Theme: Cream Passport

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` ("Authentication vs Authorization", 109 s).

**Identity:** paper `#F3EBDD` with a dot grid and a navy/red airmail stripe, navy `#1D3557`, red `#C8102E`, mustard `#E9A23B` highlights, green `#2E7D4F` for success. DM Serif Display headlines, Manrope 800 captions, IBM Plex Mono labels. Soft 88 bpm lo-fi bed, office and stamp sounds.

**Best for:** security, identity, permissions, request lifecycles, anything that maps to documents, forms, IDs, doors and stamps.

## Layout
- Full screen speaker for the hook and bridges (with `cfg.punches`), short blur at each switch.
- `cfg.desk` windows: the speaker shrinks into a framed card at the bottom (about y 1080 down) and scenes draw on paper in **y 60 to 800**.
- Captions: 2 lines (maxc 22) near the bottom, white with heavy shadow; keywords on mustard pills.
- Scenes are full-frame layers mounted in `[a, b]`; time elements with `Appear t0 t1`.

## Config
```ts
export const cfg: Config = {
  desk: [[12.4, 39.7], [41.4, 64.6]],
  punches: [[T.question3 - 0.2, 41.4, 0.14]],   // [start, end, amount]
  overlays: [Hook, Bridges, Ending],            // free layers, defined in Video.tsx
};
```

## Components (`./theme/kit`)
- `Header t0 t1 kicker title color` red mono kicker + serif headline. `Chip color bg size` boxed mono chip with shadow.
- `Stamp t0 t1 color size` rubber stamp that slams in (verdicts: VERIFIED, 401 BLOCKED).
- `TitleCard words=[[text, t0, color]...] sub subT` one-line title whose words pop as spoken.
- `UserIcon label color`, `Server label color w`, `Door label state='idle'|'check'`, `FacePhoto w h` (the speaker's face in an ID photo).
- `Typed` (pipe caret), tokens `PAPER PAPER2 INK NAVY RED MUSTARD OK SOFT SHADOW`, fonts `SERIF MONO SANS`.

## Sound (`sound.py` SFX)
`whoosh` (layout switches), `thud` (stamps, big hits), `beep` (`f`, `d`; items), `chime` (success), `buzz` (denied), `click` (typing; repeat), `sweep` (scanning).

## Do / don't
- Everything looks printed: hard shadows, straight edges, no gradients or glows.
- Red is for denial and errors only. Keep the title on one line (DM Serif is wide; use size 56 to 60).
