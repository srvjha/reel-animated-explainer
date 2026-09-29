"""English whisper.cpp pass (ggml-base.en.bin, word timestamps, 4 s windows) -> asr_plain.json, used to pick anchors."""
from pywhispercpp.model import Model
import subprocess, json, numpy as np
m=Model('ggml-base.en.bin',n_threads=2,print_realtime=False,print_progress=False,no_context=True,token_timestamps=True,max_len=1,split_on_word=True)
out=[]
for a in np.arange(0,107.1,3.5):
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(a),'-t','4.0','-i','audio16k.wav','c.wav'])
    for x in m.transcribe('c.wav'):
        if x.text.strip() and x.t0/100<3.9: out.append((round(a+x.t0/100,2),x.text.strip()))
json.dump(out,open('asr_plain.json','w'))
