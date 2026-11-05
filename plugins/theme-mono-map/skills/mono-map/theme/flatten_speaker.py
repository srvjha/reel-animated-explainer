import cv2, numpy as np, subprocess, os, json
W, H = 1080, 1920; N = int(open('nframes').read())
segs = json.load(open('segs.json'))
bg = cv2.cvtColor(cv2.imread('/tmp/claude-0/r31/proj/talkbg.png'), cv2.COLOR_BGR2RGB).astype(np.float32)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'src.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', 'talk.mp4'], stdin=subprocess.PIPE)
yy = np.arange(H, dtype=np.float32)[:, None]
CUT = np.clip((1478 - yy) / 70, 0, 1) * np.ones((1, W), np.float32)
bgb = bg.astype(np.uint8).tobytes(); last = None
for n in range(N):
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    ins = any(int(round(a * 30)) <= n < int(round(b * 30)) for a, b in segs)
    if not ins: enc.stdin.write(bgb); last = None; continue
    p = f'alpha/{n:05d}.png'
    if os.path.exists(p): a = cv2.imread(p, 0).astype(np.float32) / 255
    elif last is not None: a = last
    else: enc.stdin.write(bgb); continue
    last = a
    m = np.clip((a - 0.35) / 0.5, 0, 1) * CUT
    b = (m > 0.5).astype(np.uint8); k, lab, st, _ = cv2.connectedComponentsWithStats(b, 8)
    if k > 2:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); keep = cv2.dilate((lab == big).astype(np.uint8), np.ones((15, 15), np.uint8))
        m = m * cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 3)
    m = cv2.GaussianBlur(m, (0, 0), 1.2)[..., None]
    im = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
    enc.stdin.write((im * m + bg * (1 - m)).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); print('done')
