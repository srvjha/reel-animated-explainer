---
name: "reel-animated-explainer"
description: "Edit Saurav's Hinglish tech reels (1080x1920) into Remotion explainer animations: two-way window, hard cuts, black-top split, full screen, news; captions, screenshots, minimal music, cover and Instagram caption."
---

# Reel Animated Explainer

Saurav records himself talking in Hinglish about backend and AI system design. This skill turns the recording into a finished reel: explainer animations, captions, very quiet music, then a cover and an Instagram caption. Themes, scripts and examples live at github.com/srvjha/reel-animated-explainer (`plugins/theme-*`, `modes/`, `scripts/`). Clone it at the start and reuse kits instead of rewriting.

## 0. Start

- He usually sends: the video, a transcript (use it word for word), the title ("AI System Design Ep N: <question>"), the layout he wants, sometimes assets or URLs to screenshot.
- Ask in ONE message only for what is missing and changes the result (episode number, layout if unclear). Otherwise start right away with one line saying what you will do.
- Give a realistic time estimate: a 2 to 3 min reel takes about 30 to 45 min (render alone 10 to 25 min).
- Look at 4 to 6 frames first (ffprobe + ffmpeg stills) to see framing, black top area, or full frame.

## 1. Hard rules

1. No em dashes and no emojis anywhere: captions, cards, titles, Instagram caption, replies.
2. Never a single word alone on a line in titles, cards or captions. The hook/title line stays on one line.
3. Keep his real camera background unless he asks for a cut-out on that reel.
4. A different theme every reel. Never reuse the previous reel's look.
5. Never purple/violet/indigo/magenta (especially captions). No glass panels, no chip-heavy layouts, no slanted banners or rubber-stamp plates popping in with music, no whiteboard look for the AI System Design series.
6. Music barely audible (section 7). His voice must never compete with the bed.
7. Transcripts are sacred: split into chunks, never reword. Romanize any Devanagari words.
8. Accuracy: fix technical slips on screen (e.g. "time taken for first token" -> "time to first token", "idempotent key" -> "idempotency key") and tell him what you changed. Label example numbers as "example" or "illustrative". Never invent prices or results; take them from official pages.
9. Real logos only (simple-icons npm package or official files he gives); never redraw a logo. Crop private info (emails, account names) out of screenshots he gives.
10. Save all downloaded assets in a temp project folder, never in his Downloads.
11. Contact sheet of stills from every scene before the full render, and frames from the final export before sending.

## 2. Timing

1. `ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 audio16k.wav`. Transcribe with faster-whisper small (cpu, int8): `language='hi'`, `word_timestamps=True`, `vad_filter=True`, and an `initial_prompt` in romanized Hinglish with the topic's technical words (keeps output in Roman script).
2. Light silence trim: `silencedetect=n=-30dB:d=0.25`; for each gap keep 0.08 s on each side. Cut frame-exact in ONE pass so lip sync never drifts:
   `[0:v]fps=30,select='between(n,a,b)+...',setpts=N/30/TB[v];[0:a]aresample=48000,aselect='between(t,A,B)+...',asetpts=N/SR/TB[a]`
   Write `public/src.mp4` (video only) and `voice.wav`.
3. Align HIS transcript to the ASR words with `difflib.SequenceMatcher` on normalized words; interpolate unmatched words; spread any run of identical start times evenly up to the next distinct time; remap through the kept ranges.
4. `src/data.json` = `{duration, caps:[{a,b,w:[{t,s,e}]}], words:[{w,t}]}`. Caption chunks break at punctuation, gaps over 0.25 s, or 3 words.
5. Plan scenes as a timeline (t0, t1, idea, visual). Each scene starts within 0.5 s of when he starts that point; key every animation to the word he says.

## 3. Remotion project

- Files: `src/core.tsx` (FPS 30, clamp, lerp, ease, useT, springAt), `src/Root.tsx`, `src/index.ts`, `src/theme/kit.tsx` (palette, primitives, Frame), `src/Video.tsx` (cfg.cuts + scenes), `src/data.json`, `public/src.mp4`, `public/icons/*.svg`, `public/shots/*`.
- Fonts from npm `@fontsource/*` (Google Fonts can be blocked). Icons: Phosphor bold SVGs + simple-icons brand SVGs drawn through a CSS mask so they take theme colors.
- Kit primitives: Head (mono label + one-line title), Rise (masked text reveal), Card, Tile (icon tile with spring pop), Wire (self-drawing arrow with travelling packets), Mark (check/cross pop), Tok (token block), Meter, Shot (screenshot card with highlight boxes and zoom).
- Render: `npx remotion render src/index.ts Main out/video.mp4 --browser-executable=<chrome-headless-shell> --concurrency=2 --crf=18 --muted`, then mux the mixed audio (libx264 crf 20, aac 192k, +faststart). Music-only fixes need no re-render: just remix and remux.

## 4. Layouts

**Two-way window (his usual choice for AI System Design):** explainer panel on top (1080x960), him below with his real background.
- In split the video moves down (camDy ~660) so his face sits in the lower half; the panel slides down/up over 0.6 s (easeInOutCubic) when switching.
- Melt the panel's bottom edge into the video: mask `linear-gradient(180deg,#000 0%,#000 88%,rgba(0,0,0,.5) 94%,transparent 100%)`. No hard rounded edge or shadow seam (he asked to blend it naturally).
- Open with him full screen ~1.5 s, then split; go back to full screen briefly on key spoken lines ("Ab hum samajhte hain", "Lekin...").
- Back-to-back scenes slide sideways into each other like one continuous canvas. Keep panel content between y 130 and ~880.

**Hard cuts:** him full screen (real background) <-> full-screen explainer pages, never both at once; punch-in zoom (~1.3x) on key lines.

**Black-top split (Building Backend Systems):** measure the black area every 0.5 to 1 s (first row with mean brightness > 12); the panel covers the max edge + 14 with a wavy bottom edge `y = edge + 14 + 10*sin(2*pi*x/150 + t*2.2)`. Series label top-left, scene title ~60 px, content below. Scene recipe: hook, two-line title card, problem first, solution flow, name the parts, comparisons, trade-offs, tools, one takeaway (don't answer his closing question).

**Full screen with cut-out (only when he asks):** ISNet matte (from `@imgly/background-removal-node`) + MediaPipe core every 3rd frame; front/behind HTML layers composited with Playwright; render in 360-frame chunks. Dark navy + blue grid background, no orange glow or sun shapes; headlines can sit behind his head.

**News roundup:** full frame, cards in a lower band (1080x660 at y ~990) tinted per company (Anthropic #D97757, OpenAI #10A37F, Google #4285F4), real screenshots only, English captions above the band, verify facts for the date window.

## 5. Captions (vary between reels)

- **Boxed chunks:** 1 to 3 words, Montserrat ExtraBold caps ~62 px in one dark box with a thin light edge; whole-chunk color by meaning (blue/teal concept, red wrong way, green payoff); Abril Fatface on soft words (toh, aur, lekin), never two serif chunks in a row.
- **VEED highlight:** Montserrat Black caps ~70 px, white with an ~11 px dark outline; the spoken word sits on an accent box (-2 deg tilt, spring pop); the line pops in. Lay words out with flex (no width guessing).
- **Word board (full screen):** word by word, Archivo Black ~74 px, white with hard black shadow, key terms on yellow #FFE500 or red #FF2E12 plates.
- Hinglish as spoken from his transcript; on-screen cards in English.
- Position: split -> on his chest (~y 1700); full talk -> ~y 1290 to 1430. Never over his mouth.

## 6. Themes (rotate; update this table)

| Theme | Look | Used |
|---|---|---|
| Dark graph paper | #080A0D, orange/teal accents | Ep 6 Message Queue |
| Cream graph paper | #F6F2E9, teal/orange, highlighter | Database Indexes |
| Blueprint | #0E3A5C, amber/cyan | Ep 9 Connection Pooling (split) |
| Black + blue grid arcade | #040507 to #0A1120, yellow/red plates | Connection Pooling full screen |
| mono-map, red-signal, tomato-app, dev-desktop | various | Uber, Netflix, Zomato, How I code with AI |
| ember-ops | dark ops console, orange + white | AI SD Ep 2 |
| blue-nodes | black dotted, electric blue, icon tiles + wires | AI SD Ep 3 (approved) |
| clay-paper | warm cream paper, clay orange, DM Serif headings | AI SD Ep 4 |
| pine-contour | pine black, faint contour rings, amber accent | AI SD Ep 5 (latest) |
| Newsprint, chalkboard | unused | |
| aurora-glass, whiteboard | REJECTED | never again |

New theme recipe: base + one accent + good (green/mint) + bad (red/coral) + info (blue), one heading font, a subtle animated background (drifting grid, dots, contours or grain), vignette.

## 7. Music and sound

- Use the series bed or a free Mixkit track (downloaded through the browser into the temp folder).
- Voice: highpass 70, gentle compressor, loudnorm I=-15.
- Bed: `volume=-31dB` (he said -18 dB was too loud and confusing), fade in 3 s, fade out the last ~1.8 s, sidechain ducked under the voice (`threshold=0.02:ratio=4:attack=20:release=400`).
- Master: alimiter, loudnorm I=-14 TP=-1.5; measure the delivered file.
- SFX optional and soft (taps/clicks); no whoosh on every cut.

## 8. Screenshots from official sources

- Built-in browser, viewport 1000x1000. Hide fixed/sticky elements, cookie banners and popups with JS (never click Accept). Scroll the exact element into view and screenshot; copy into `public/shots/`.
- In the reel: a Shot card, an accent highlight box over the exact line at the word he says it, and a zoom when text would be too small on a phone.
- Used so far: Anthropic pricing and API errors docs, zod.dev, BenchLM pricing tables, Google AI Studio (his screenshot, cropped).

## 9. Explanation quality

- One scene per idea: a heading (label + one-line title), a concrete visual of the mechanism (flows with packets, token bars, counters, meters, timelines, before/after cards) and a payoff mark.
- Show, don't list. Close with a short on-screen recap of the named concepts.

## 10. Deliverables

1. The reel (mp4, about -14 LUFS).
2. Cover 1080x1920 in the same theme: title in balanced lines (no single-word line) inside the 3:4 safe crop (y 240 to 1680), his face below.
3. Instagram caption: "AI System Design Episode N: <title question>" then exactly 5 hashtags. Add a comment CTA only if the reel asks viewers to comment.
4. A short reply: what is in it, what you corrected on screen, anything you could not do.
5. If he asks, add the new theme to his repo (plugin.json, SKILL.md, kit.tsx, example, demo image, README row, marketplace entry) and push.

## 11. Check before sending

- [ ] Theme differs from the last reel; no rejected styles; no purple
- [ ] Every scene starts when he starts that point; no empty panel for more than ~1.5 s
- [ ] No text overflow, no single-word lines, captions never over his mouth
- [ ] Screenshots readable (zoomed), highlighted on the right line, no private info
- [ ] Music barely audible; loudness measured on the final file
- [ ] Frames checked from the final export