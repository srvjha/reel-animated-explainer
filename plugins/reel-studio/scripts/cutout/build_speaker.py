#!/usr/bin/env python3
# Usage (inside the work dir, after matte.py): ffprobe ... nb_read_packets > nframes; python3 build_speaker.py
"""Refine mattes and write a transparent speaker video (VP9 + alpha) for Remotion.
- tighten ISNet edges (removes the soft halo that looks dirty on a light background)
- keep only pixels inside a dilated MediaPipe person mask (drops chair / wall leftovers)
- keep the largest connected blob"""
import cv2, numpy as np, subprocess, mediapipe as mp, os
W, H = 1080, 1920; N = int(open('nframes').read())
seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0)
K = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71))
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'src.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                        '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '5M', '-deadline', 'realtime', '-cpu-used', '8', '-row-mt', '1', '-auto-alt-ref', '0',
                        'rem/public/speaker.webm'], stdin=subprocess.PIPE)
last = None
for n in range(N):
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    im = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    p = f'alpha/{n:05d}.png'
    a = cv2.imread(p, 0).astype(np.float32) / 255 if os.path.exists(p) else last
    a = np.clip((a - 0.35) / 0.5, 0, 1)
    if n % 2 == 0 or last is None:
        m = (seg.process(im).segmentation_mask > 0.3).astype(np.uint8)
        m = cv2.GaussianBlur(cv2.dilate(m, K).astype(np.float32), (0, 0), 9)
        mm = m
    a = a * mm
    b = (a > 0.5).astype(np.uint8); k, lab, st, _ = cv2.connectedComponentsWithStats(b, 8)
    if k > 2:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); keep = cv2.dilate((lab == big).astype(np.uint8), np.ones((15, 15), np.uint8))
        a = a * cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 3)
    a = cv2.GaussianBlur(a, (0, 0), 1.2)
    last = a
    enc.stdin.write(np.dstack([im, (a * 255).astype(np.uint8)]).tobytes())
    if n % 300 == 0: print(n, flush=True)
enc.stdin.close(); enc.wait(); print('done')
