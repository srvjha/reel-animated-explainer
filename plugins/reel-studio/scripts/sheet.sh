#!/usr/bin/env bash
# Usage: sheet.sh <video.mp4> <out.jpg> t1 t2 t3 ...   -> one contact sheet of frames (4 per row)
# Use on the FINAL export to check text overflow, captions over the face, and scene timing.
set -euo pipefail
V="$1"; O="$2"; shift 2; TMP=$(mktemp -d); i=0
for t in "$@"; do ffmpeg -v error -y -ss "$t" -i "$V" -frames:v 1 -vf "scale=270:-1,drawtext=text='$t s':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6" "$TMP/$(printf %03d $i).png" 2>/dev/null || ffmpeg -v error -y -ss "$t" -i "$V" -frames:v 1 -vf scale=270:-1 "$TMP/$(printf %03d $i).png"; i=$((i+1)); done
COLS=$(( i < 4 ? i : 4 )); ROWS=$(( (i + 3) / 4 ))
ffmpeg -v error -y -i "$TMP/%03d.png" -vf "tile=${COLS}x${ROWS}:padding=6:color=white" -frames:v 1 "$O"
rm -rf "$TMP"; echo "$O"
