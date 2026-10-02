"""Speaker cut-out mattes: ISNet (from the @imgly/background-removal-node npm package, reassembled to isnet_medium.onnx)
plus a MediaPipe selfie-segmentation body core (fills the shirt holes ISNet leaves). Computes every STEP-th frame and
linearly blends the frames in between. Writes alpha/NNNNN.png (frame index at 30 fps).
usage: SRC=video.mp4 python3 matte.py segments.json   (segments.json = [[t0, t1], ...])
Get the model: npm pack @imgly/background-removal-node@1.4.5, untar, then join package/dist/<chunk hashes> listed under
/models/medium in package/dist/resources.json into isnet_medium.onnx."""
import numpy as np, cv2, subprocess, os
os.makedirs('alpha', exist_ok=True)
import onnxruntime as ort, mediapipe as mp
import json, sys
SRC = os.environ["SRC"]; W, H = 1080, 1920
# segments (seconds) where the speaker is on screen; skip the inside of full-screen clips
SEGS = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else [(0, 9999)]
STEP = 3
so = ort.SessionOptions(); so.intra_op_num_threads = 2
isn = ort.InferenceSession('isnet_medium.onnx', so, providers=['CPUExecutionProvider'])
seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0)
K = np.ones((41, 41), np.uint8)
def matte(im):
    x = cv2.resize(im, (1024, 1024), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255 - 0.5
    o = isn.run(['output'], {'input': x.transpose(2, 0, 1)[None]})[0][0, 0]
    a = cv2.resize(np.clip(o, 0, 1), (W, H), interpolation=cv2.INTER_LINEAR)
    m = (seg.process(im).segmentation_mask > 0.5).astype(np.uint8)
    core = cv2.GaussianBlur(cv2.erode(m, K).astype(np.float32), (0, 0), 12)
    return np.maximum(a, core)
for s0, s1 in SEGS:
    n0, n1 = int(round(s0 * 30)), int(round(s1 * 30))
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{n0 / 30:.4f}", "-i", SRC, "-vf", "fps=30", "-frames:v", str(n1 - n0),
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    prev = None
    for n in range(n0, n1):
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        if (n - n0) % STEP and n != n1 - 1: continue
        a = cv2.imread(f'alpha/{n:05d}.png', 0).astype(np.float32) / 255 if os.path.exists(f'alpha/{n:05d}.png') else matte(np.frombuffer(buf, np.uint8).reshape(H, W, 3))
        if prev is not None:
            pn, pa = prev
            for k in range(pn + 1, n):
                f = (k - pn) / (n - pn)
                if not os.path.exists(f'alpha/{k:05d}.png'):
                    cv2.imwrite(f'alpha/{k:05d}.png', ((pa * (1 - f) + a * f) * 255).astype(np.uint8))
        cv2.imwrite(f'alpha/{n:05d}.png', (a * 255).astype(np.uint8)); prev = (n, a)
        print(n, flush=True)
