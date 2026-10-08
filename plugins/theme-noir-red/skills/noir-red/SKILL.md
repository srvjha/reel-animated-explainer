---
name: noir-red
description: "Reel theme: noir red. Cinematic black with one red accent (streaming-service feel). Speaker full screen for the intro and punchlines with big Bebas titles, then a black card with a red glow plays icon-driven system-design diagrams while the speaker sits in a window below, framed from the top of the hair to the mic and never cropped. Uses real SVG icons (lucide-static, simple-icons). Load it when editing a reel with reel-studio and a dark black/red look is wanted."
---

# Theme: Noir Red

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How Netflix handles millions of requests, 177 s, 11 scenes).

**Identity:** black #070707 with a deep red glow, scanlines, drifting red lines; Netflix-red #E50914 accent; Bebas Neue display, Inter Tight captions (white, black outline, spoken word red and lifted), Roboto Mono labels.

## Icons
Install once and copy only what the reel uses into `rem/public/icons/`:
```
npm i --prefix /tmp/icons lucide-static simple-icons
cp /tmp/icons/node_modules/lucide-static/icons/{server,database,shield-check}.svg rem/public/icons/
cp /tmp/icons/node_modules/simple-icons/icons/{apachecassandra,redis}.svg rem/public/icons/
```
Draw with `<Icon name="server" color={RED} />` (CSS mask, any colour). Brand logos the user attaches go in `public/` and are shown with `<Img>`, never redrawn. simple-icons has no AWS logos: use a text tag instead.

## Layout
- `cfg.modes`: `talk` (speaker full screen; put overlays in the band y 1000 to 1380, below the mic, captions sit at y 1390) and `card` (header with logo + title at y 44, card at y 130 with **scenes in 1000 x 840**, captions at y 995, speaker window x 40 y 1150, 1000 x 730).
- `cfg.face {y0, y1}`: source rows from above the hair to below the mic. The window scales to fit this whole band (letterboxed at the sides), so the head is never cut. Check a still.
- Start with a talk intro (title card + hook chips), drop into card mode for the explanation, return to talk for punchline questions and the ending.

## Components (`./theme/kit`)
`Heading kicker title`, `Node icon label sub hot dim`, `Icon`, `Flow x1 y1 x2 y2` (dotted line with moving packets), `Tag`, `Meter`, `Count`, `Appear`. The example adds `Srv` (small server tile with ok/hot/dead/good states), `Chip`, `Band`/`BigT` (talk overlays) and a `Shade` that darkens the lower half in talk mode.

## Do / don't
- One idea per scene, every element timed to the word that names it (`T.key` from marks.txt).
- Red means the point of attention or failure; green only for "still working".
- Do not invent numbers the speaker did not say.
