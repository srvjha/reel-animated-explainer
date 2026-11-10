---
name: dev-desktop
description: "Reel theme: dev desktop. Made for personal 'how I work' reels that should not look like a normal explainer. The reel lives on the creator's computer desktop: every cut is either `cam` (speaker full screen, real background) or an app window (AI chat, whiteboard, schema designer, spec.md editor, browser showing real screenshots, terminal with git log, notes checklist). Switching shots is genie-style: the outgoing shot shrinks into its dock icon and the incoming one opens out of its own icon, over a sunset wallpaper with a menu bar and a dock with running-app dots. Handwritten Caveat sticky notes, typewriter text, strike-throughs, Manrope UI, JetBrains Mono code, lime highlighter captions. Load it for reels about workflows, tools, AI coding, productivity, or whenever a creative desktop-story edit is wanted."
---

# Theme: Dev Desktop

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. Reference reel: `theme/example/Video.tsx` (How I code with AI, 146 s, 15 cuts: 5 camera, 10 app windows).

**Identity:** sunset wallpaper (#1F1A45 → #4B2A7B → #B4507A → #F0876A → #FFC08F), white app windows with traffic-light chrome, ink #16161D, lime #C6FF5E highlighter, sticky yellow #FFD84D, Claude orange #D97757 for the AI.

## Layout
- `cfg = {cuts, overlays, capSkip}`; cut = `{a, b, m, title?, el?}` where `m` is `cam` or an app key (`chat`, `board`, `schema`, `spec`, `browser`, `term`, `notes`). `el` renders the window body (1020 x 1316).
- The Frame does the genie transition (0.38 s out, 0.5 s in with a slight overshoot) and bounces the dock icon of the incoming app. The speaker never shares the frame with a window.
- Captions at y 1500 (between the window and the dock), lime pill on the spoken word.
- `overlays` draw over everything; gate them by time (hook search bar on the first cam cut, sticky notes and the comment prompt on later cam cuts).
- Primitives: `Type` (typewriter), `Sticky`, `Strike`, `Pill`, `Appear`, `PopIn`, `Icon` (Phosphor duotone in public/icons).

## Browser screenshots
Take them in the user's browser: set the viewport to 820x1000 with the resize tool, scroll with JavaScript, and take `screenshot`s at scale 1; each result is saved as a file under the session's tool-results folder. Show them in the `browser` app with a lime highlighter sweep over the sentence being spoken.

## Music
Lo-fi from Mixkit ("Sleepy Cat"), looped with a crossfade to the reel length, about -29 dB RMS, written over `music.wav` after `mix_audio.py`.

## Do / don't
- Keep the speaker's real background. Straight sticky notes and pills, no slanted banners or stamps. Title on one line; never a single word alone on a line. Label example data as illustrative.
