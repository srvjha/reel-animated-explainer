---
name: card-catalog
description: "Reel theme: card catalog. Split layout: a warm library-desk explainer on top (y 0 to cfg.split, default 1000) and the speaker below with his real background, cropped into the lower panel and separated by a brass rail. Library index cards (red header rule, blue ruled lines, rod hole), Courier Prime typewriter text, a wooden catalog drawer with a brass label holder, number-vector chips, ink arrows, and a PDF page that gets cut into chunk cards. DM Serif Display headings, Work Sans captions. Library jazz trio music with typewriter, card and drawer SFX. No banners. Load it when editing a reel with reel-studio about RAG, search, indexing, embeddings, documents, knowledge bases, or when the user asks for diagram on top and himself below."
---

# Theme: Card Catalog

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How RAG works, 144 s, split layout, 11 desk scenes).

**Identity:** paper #F3EAD7 with grain, cards #FFFBF0 with blue #B9CDE4 rules, library red #B23A2E, navy ink #22324F, brass #B8892E, wood #7A4E2D, teal #2F7F86, amber #C9822B, green #3F7D5B. No purple.

## Layout
- `cfg = {split, camDy, camScale?}`: desk covers y 0 to `split`; the source video is drawn full size with its top at `camDy` and clipped to the lower panel. Pick `camDy` so the face sits about 40 px under the rail (face top in source + camDy ≈ split + 40).
- Scenes are a timeline over the whole video (no talk/page cuts). Desk content lives between y 50 and y 970; `Head` = typewriter label + serif title at x 60, y 50. Wrap content in a `Shift dy` (see the example) to centre lighter scenes vertically.
- Captions sit at H - 270 on the speaker panel (white with outline; the spoken word on a cream index-card chip with a red top edge). Use `--maxc 20` in build_data.py so lines fit.

## Components (`./theme/kit`)
`Card x y w h head accent hl dim from rot`, `Drawer label fill glow`, `Vec vals`, `Page cuts cutAt hlRows`, `Type` (typewriter), `Arrow curve dash`, `Tag icon solid`, `Head`, `Txt`, `Icon` (Phosphor duotone in public/icons), `At`, `Appear`, `PopIn`.

## Sound
`sound.py`: library jazz trio (~96 bpm swing: piano comping, walking bass, ride, brushes). SFX: `card`, `type`, `bell`, `drawer`, `snip`, `page`, `pop`, `tick`, `error`, `chime`.

## Do / don't
- No banners or stamp plates.
- Show technically correct steps on screen (e.g. the query is embedded, not chunked) and tell the user.
- Keep titles on one line; never leave a single word alone on a line.

- Keep all on-screen diagram text in English (captions stay as spoken).
