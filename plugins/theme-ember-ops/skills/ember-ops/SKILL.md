---
name: ember-ops
description: "Reel theme: ember ops. Dark ops-console look (near-black canvas, hairline grid, ember glow) with orange as the only accent and white type. Hard cuts between the speaker (full screen, real background) and full-screen pages; each page is revealed by an orange scan band sweeping top to bottom. Parts: Panel, Tag, Bar meter, ring Gauge, token Bucket (fill + hatched reserved part), flow Nodes and Wires with packets, HTTP response cards, Browser card for real article screenshots with an orange highlighter, log ticker hook. Sora + IBM Plex Mono, orange caption pill. Load it for reels about gateways, rate limiting, quotas, budgets, infra, LLM ops, or whenever a dark orange and white look is wanted."
---

# Theme: Ember Ops

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. Reference reel: `theme/example/Video.tsx` (AI System Design Ep 2: why normal rate limiting fails for LLM APIs, 123 s, 9 cuts, 9 page scenes including 3 article screenshots).

**Identity:** #0B0B0D canvas, panels #16161A with #2A2A30 edges, orange #FF7A1A, amber #FFB547, ember #C2410C glow, white #F7F5F2, muted #A1A1AA, red #FF4D4D for blocks, green #3DDC97 for success.

## Layout
- `cfg.cuts`: `{a, b, m: 'talk' | 'page'}`. Several scenes can live inside one page cut (they crossfade); the scan band plays only when a page cut starts.
- `Head` = glowing orange dot + mono label, one-line Sora 800 title (size 70, shrink for long titles) at y 150. Content y 330 to 1300.
- Captions: talk y 1500, page y 1600; orange pill with dark text on the spoken word.
- `overlays` for the talk shots: the hook (series chip with episode badge, title bar with an orange left edge, a `200 OK ... 429` log ticker) and an outro takeaway.

## Article screenshots
Take them in the user's browser at 820x1000 (resize tool), hide cookie banners and fixed widgets with JavaScript, scroll to each heading, and `screenshot` at scale 1 (saved under the session's tool-results folder). Show them in `Browser` with `crop` and an orange `hl` sweep over the line being spoken.

## Do / don't
- Keep the speaker's real background. No banners or stamp plates. Titles on one line; never a single word alone on a line. Label example numbers (tokens, prices, budgets, Retry-After) as illustrative.
