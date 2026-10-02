#!/usr/bin/env bash
# Usage: render.sh <workdir> <output.mp4> [max_MB=30]
# Renders the Remotion composition, ducks the music under the voice, adds SFX,
# then a two-pass H.264 encode sized to stay under max_MB (Instagram friendly).
# Set REMOTION_BROWSER to a Chrome/Chromium headless shell if Remotion can't download one.
set -euo pipefail
WD="$1"; OUT="$2"; MAXMB="${3:-30}"
cd "$WD/rem"
BR=(); [ -n "${REMOTION_BROWSER:-}" ] && BR=(--browser-executable="$REMOTION_BROWSER")
npx remotion render src/index.ts Main out/video.mp4 "${BR[@]}" --concurrency="${REEL_CONCURRENCY:-2}" --crf=18 --muted --log=error
cd ..
[ -f music.wav ] || python3 "$(dirname "$0")/mix_audio.py" .
ffmpeg -v error -y -i rem/out/video.mp4 -i src.mp4 -i music.wav -i sfx.wav -filter_complex \
 "[1:a]asplit=2[v1][v2];[2:a][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[m];[v1][m][3:a]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest master.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 master.mp4)
VK=$(python3 -c "print(max(900, min(3000, int($MAXMB*8*1000*0.93/$DUR - 128))))")
ffmpeg -v error -y -i master.mp4 -c:v libx264 -preset medium -b:v ${VK}k -pass 1 -an -f null /dev/null
ffmpeg -v error -y -i master.mp4 -c:v libx264 -preset medium -b:v ${VK}k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT"
rm -f ffmpeg2pass-0.log*
echo "done: $OUT  $(du -h "$OUT" | cut -f1)  ${VK}k video"
