---
name: edit-reel
description: Edit a vertical talking-head video (Instagram reel, Short, TikTok) into an animated explainer with Remotion, using an installed reel theme. Use when someone gives you a raw reel video to edit, caption or animate.
argument-hint: <path-to-video>
---

# Edit a reel

You turn a raw 9:16 talking-head video into a finished reel: word-timed captions, animated scenes that land exactly when the speaker says each point, music ducked under the voice, sound effects, and an export under 30 MB.

The look comes from a **theme plugin**. The engine (this plugin) does everything else.

```
SCRIPTS=${CLAUDE_PLUGIN_ROOT}/scripts
```

## 0. Check the setup (once per machine)

- `node -v` (18+), `ffmpeg -version`, `python3 -c "import numpy, pywhispercpp"`. If pywhispercpp is missing: `pip install pywhispercpp numpy`.
- **Find the themes.** Installed themes are skills whose description starts with "Reel theme:". If none are installed, stop and tell the user:
  `/plugin install theme-yellow-ticker@reel-animated-explainer` (or `theme-lime-bento`, `theme-cream-passport`), then `/reload-plugins`.
- First render downloads Remotion's headless Chrome. If that is blocked, set `REMOTION_BROWSER` to a local Chrome/Chromium headless shell.

## 1. Ask once, then work

Ask everything you need in **one** message, skipping anything already answered. Never guess a series name or episode number.

1. **Theme:** list the installed themes with a one-line description each. Ask which one, and what the last reel used so this one looks different.
2. **Transcript:** the exact words (an SRT is perfect). It is used word for word and saves the most time on mixed-language speech. Without it you transcribe and flag uncertain lines.
3. **Title** for the on-screen chip (must fit on one line), and series/episode label if any.
4. **Banned colours or styles**, logos to use (never redraw a brand logo), and the size limit (default 30 MB).

## 2. Prepare

```bash
WD=<work dir, e.g. ./reel-<slug>>
bash $SCRIPTS/prepare.sh <video> $WD <THEME_DIR>
```
`THEME_DIR` is given by the theme's skill (`.../theme`). This normalizes the video to 1080x1920 @30fps, extracts audio, creates `$WD/rem` (a Remotion project with the theme in `src/theme/`) and copies the theme's example to `src/Video.example.tsx`.

## 3. Timing: transcript to word times

1. Write the exact transcript to `$WD/transcript.txt`. Never reword it; only fix obvious ASR spellings if you transcribed it yourself.
2. `python3 $SCRIPTS/asr.py $WD` prints words with times (`word@12.34`). With mixed languages it mishears, so only trust words that clearly match the transcript.
3. Write `$WD/anchors.txt`: one `word time` per line, in transcript order, every 2 to 4 seconds, using words you trust. Then `python3 $SCRIPTS/align.py $WD`. It spreads the remaining words by voiced time. Fix "not increasing" errors by deleting the bad anchor.
4. Write `$WD/marks.txt`: named moments your scenes will hook to, `key word [n]` (n-th occurrence) or `key 12.5`. Example: `router router 2`, `ipv4 IPv4`.
5. `python3 $SCRIPTS/build_data.py $WD --keywords "IP,address,router"` writes `rem/src/data.json` (`duration`, `T`, caption `pages`). It never leaves a single word alone on a caption line; if it warns, adjust the transcript punctuation or `--maxc`.

## 4. Plan the scenes

Write a timeline table before any code: `a, b, what the speaker says, what we show`. Rules:
- Every scene starts within 0.5 s of when the speaker starts that point; every element inside it pops on its own `T.<mark>`.
- One idea per scene. Show the mechanism (packets moving, a DB filling up, a request being stamped 403), not a slide of bullet points.
- Read the theme skill for its layout zones, components and what it is good at.

## 5. Write `src/Video.tsx`

Start from `src/Video.example.tsx` (a complete real reel in this theme). Keep its imports and structure; replace `cfg` and the scenes.
- `export const cfg` is the theme's `Config` (title, layout windows, zoom punches, overlays).
- `export const scenes: Scene[] = [{a, b, el}]`, each `el` a component drawing one beat.
- Use only the theme's components and colour tokens so the reel stays coherent. Add new small components in Video.tsx when the topic needs them.
- Do not edit `Root.tsx`, `core.tsx` or `theme/kit.tsx` for a single video. If the theme itself needs a change, change the theme plugin.

## 6. Preview, then render

```bash
cd $WD/rem && node stills.mjs 1 5 12 20 ...   # one time per scene and per tricky moment -> stills/
```
Tile and look at the stills. Check: text overflow, anything over the face, captions readable, no single-word lines, title on one line, nothing behind the speaker that must be read. Fix and re-run until clean.

Sound: copy the theme's `example/cues.json` to `$WD/cues.json` and rewrite the cues for this video (`t` can be a mark like `"router-0.1"`). Then:
```bash
python3 $SCRIPTS/mix_audio.py $WD
bash $SCRIPTS/render.sh $WD $WD/<name>.mp4 30
bash $SCRIPTS/sheet.sh $WD/<name>.mp4 $WD/final.jpg 1 8 16 ...   # check frames from the FINAL file
```

## 7. Deliver

The video; one line on what is new in this edit; any transcript lines you are unsure about (with times); illustrative values you invented on screen (example IPs, numbers). If asked for an Instagram caption: hook line, 2 to 3 short lines, one comment prompt, 5 to 8 hashtags. Episode numbers only if the user gave them.

## Hard rules

1. The transcript is sacred: split into lines, never reword.
2. Never leave a single word alone on a line (titles, chips, captions).
3. The title stays on one line. Use straight chips, not slanted banners, mid-video.
4. Never redraw a brand logo; use the official file or a plain text badge.
5. Every visual is timed to speech via `T`, never to guessed seconds.
6. Check frames from the final export before saying it is done.
