---
name: make-theme
description: Create a new reel theme plugin for reel-studio (colours, fonts, layout, captions, sound). Use when someone wants a new look for their reels or wants to publish their own theme.
---

# Make a reel theme

A theme is a small Claude Code plugin. reel-studio copies its files into every project, so a theme controls the whole look while the engine handles timing, rendering and audio.

## Layout

```
theme-<name>/
  .claude-plugin/plugin.json        name: "theme-<name>", description starts with "Reel theme:"
  skills/<name>/SKILL.md            style guide for Claude (see below); description starts with "Reel theme:"
  skills/<name>/theme/
    theme.json                      {"name", "npm": [font packages], "captions": {"maxc", "lines"}}
    kit.tsx                         exports Frame, Config and every component scenes may use
    sound.py                        music(dur, rng) -> np.ndarray, SFX = {name: fn(rng, **kw)}, MUSIC_DB
    example/Video.tsx               a complete, real reel in this theme (the best documentation)
    example/cues.json               sound cues for that example
```

## The contract

`kit.tsx` imports helpers from `'../core'` (see `${CLAUDE_PLUGIN_ROOT}/engine/template/src/core.tsx`) and must export:

```tsx
export type Config = { ... };   // whatever the theme needs: title, layout windows, punches, overlays
export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}>;
```

`Frame` draws everything that is not topic-specific: background, the speaker video (`<OffthreadVideo src={staticFile('src.mp4')} muted />`), layout changes, the title, the captions from `data.pages` (`page.words` for one line, `page.lines` for multi-line), and the scenes. It decides how scenes enter and leave (swipe deck, fade, full-frame layers). Scenes come in as `{a, b, el}`.

Captions: words carry `t` (start), `e` (end) and `k` (keyword). Highlight the active word with `t <= now < e`.

## Steps

1. Copy the closest existing theme plugin folder and rename it (`plugin.json`, folder names, `theme.json` name).
2. Decide the identity in one line before code, e.g. "newspaper: off-white, black serif headlines, red underline captions". It must differ clearly from existing themes: palette, fonts (from `@fontsource/*`), caption style, layout motion and sound.
3. Rewrite `kit.tsx`: tokens, `Appear`/chip primitives, icons, `Frame`.
4. Rewrite `sound.py` (pure numpy, no samples, so it ships with no licences to worry about).
5. Port `example/Video.tsx` to the new kit and render stills on a real video with reel-studio's `edit-reel` flow. Fix overflow and layout until clean.
6. Write `skills/<name>/SKILL.md`: when to use it, `THEME_DIR=${CLAUDE_SKILL_DIR}/theme`, the layout zones in pixels, the components and their props, the `Config` fields, caption behaviour, and what NOT to do in this theme.
7. Add the plugin to the marketplace's `.claude-plugin/marketplace.json` (or host it in your own repo) and run `claude plugin validate .`.
