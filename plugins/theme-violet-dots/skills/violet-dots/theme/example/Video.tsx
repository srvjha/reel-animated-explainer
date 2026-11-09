// AI System Design Ep 1: why ChatGPT takes time to start streaming (prefill vs decode, TTFT / TPS).
// Theme: violet-dots. Talk (full screen) and split (explainer on top, speaker below) alternate with animated transitions.
// All visuals are drawn here, no stock media. Token counts, timings and sizes are illustrative.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, lerp, ease, useT} from './core';
import {Config, pop, Head, Card, Tag, Node, Wire, Tok, Meter, ChatWindow, Icon, At, Center, Appear, PopIn, Txt,
  INDIGO, VIOLET, TEAL, AMBER, ROSE, YELLOW, INK, GREY, SOFT, LINE, WHITE, TINT, SANS, MONO} from './theme/kit';
import data from './data.json';

const END = (data as any).duration;
const ws = (data as any).pages.flatMap((p: any) => p.words);
const T = (w: string, n = 1) => { let c = 0; for (const x of ws) if (x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w) { c++; if (c === n) return x.t; } return 0; };

export const cfg: Config = {
  split: 960, box: [284, 1352], talkZoom: 1.09, talkDy: 100, capSkip: 0,
  cuts: [
    {a: 0, b: 7.7, m: 'talk'},
    {a: 7.7, b: 26.0, m: 'split'},
    {a: 26.0, b: 36.2, m: 'talk'},
    {a: 36.2, b: 69.4, m: 'split'},
    {a: 69.4, b: 72.6, m: 'talk'},
    {a: 72.6, b: 89.0, m: 'split'},
    {a: 89.0, b: 92.0, m: 'talk'},
    {a: 92.0, b: 111.0, m: 'split'},
    {a: 111.0, b: END + 1, m: 'talk'},
  ],
};

// ------------------------------------------------------------------ full-screen overlays (talk shots)
const TITLE = 'Why does ChatGPT take time to start streaming?';
// intro: series lockup, then the title typed into a chat composer and "sent", and a thinking bubble (the wait itself)
const Intro: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30; if (t > 7.9) return null; const out = 1 - ease(t, 7.45, 0.3);
  const l0 = 0.35, ty0 = 4.25, ty1 = 6.6, sent = 6.75;
  const nch = Math.round(clamp((t - ty0) / (ty1 - ty0)) * TITLE.length);
  const size = 35; const sp = pop(f, sent); const k1 = ease(t, l0, 0.5);
  const word = (txt: string, t0: number, color = WHITE) => <span style={{display: 'inline-block', opacity: ease(t, t0, 0.25), transform: `translateY(${(1 - ease(t, t0, 0.35)) * 40}px)`, color}}>{txt}</span>;
  return <div style={{opacity: out}}>
    {/* series lockup */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 56, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: k1}}>
        <PopIn t0={0.4}><Img src={staticFile('claude.png')} style={{width: 72, height: 72, borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,.4)'}} /></PopIn>
        <PopIn t0={0.6}><Img src={staticFile('chatgpt.svg')} style={{width: 72, height: 72, borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,.4)'}} /></PopIn>
        <PopIn t0={3.2}><div style={{height: 72, padding: '0 22px', borderRadius: 18, background: YELLOW, display: 'flex', alignItems: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 34, color: INK, boxShadow: '0 8px 24px rgba(0,0,0,.4)'}}>EP 01</div></PopIn>
      </div>
      <div style={{marginTop: 18, fontFamily: SANS, fontWeight: 700, fontSize: 96, letterSpacing: -3, lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 6px 30px rgba(0,0,0,.65)'}}>
        {word('AI', 1.35)} {word('System', 1.5)} {word('Design', 1.75, YELLOW)}</div>
    </div>
    {/* chat composer typing the title */}
    {t >= ty0 - 0.3 && <div style={{position: 'absolute', left: 24, top: 272, width: 1032, height: 100, borderRadius: 50, background: 'rgba(255,255,255,.96)', boxShadow: '0 18px 50px rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', padding: '0 12px 0 26px', boxSizing: 'border-box', opacity: ease(t, ty0 - 0.3, 0.3), transform: `translateY(${(1 - ease(t, ty0 - 0.3, 0.35)) * 30}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: INK, whiteSpace: 'nowrap', letterSpacing: -0.5, flex: 1, overflow: 'hidden'}}>
        {TITLE.slice(0, nch)}{t < sent && <span style={{display: 'inline-block', width: 4, height: size, background: INDIGO, marginLeft: 3, verticalAlign: 'middle', opacity: Math.sin(t * 14) > 0 ? 1 : 0}} />}</div>
      <div style={{width: 76, height: 76, borderRadius: 38, background: t >= sent ? YELLOW : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t >= sent ? 1 + 0.25 * Math.sin(Math.min(1, sp) * Math.PI) : 1})`}}>
        <Icon name="arrow-up" size={44} color={INK} /></div>
    </div>}
    {/* the wait */}
    {t >= sent + 0.15 && <div style={{position: 'absolute', left: 24, top: 390, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 26, background: 'rgba(255,255,255,.92)', boxShadow: '0 12px 30px rgba(0,0,0,.35)', opacity: ease(t, sent + 0.15, 0.25)}}>
      {[0, 1, 2].map(i => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: INDIGO, opacity: 0.3 + 0.7 * Math.max(0, Math.sin(t * 8 - i * 0.9))}} />)}
      <Txt size={26} font={MONO} w={700} color={GREY} style={{marginLeft: 8}}>waiting for first token</Txt>
    </div>}
  </div>;
};
const Outro: React.FC = () => {
  const t = useT(); if (t < 111.0) return null;
  return <Center y={260}><Appear t0={T('chhota') - 0.2}><div style={{padding: '18px 28px', borderRadius: 26, background: 'rgba(255,255,255,.95)', boxShadow: '0 16px 40px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', gap: 16}}>
    <Icon name="lightning" size={44} color={INDIGO} /><Txt size={40} w={700}>short, relevant prompt = fast prefill</Txt></div></Appear></Center>;
};
cfg.screenOverlays = [Intro, Outro];

// ------------------------------------------------------------------ 1. the UI (7.7 - 17.0)
const PROMPT = 'Here are 40 pages of my notes. Summarize the key points for my exam.';
const REPLY = 'Sure! Key points: 1. Prefill reads the whole prompt at once. 2. Decode writes the answer one token at a time. 3. Streaming shows each token as soon as it is ready.';
const Ui: React.FC = () => {
  const t = useT(); const p0 = T('prompt'), th = T('sabse'), s0 = T('streams') - 0.2;
  const waiting = t >= th && t < s0; const wsec = clamp((t - th) / (s0 - th)) * 2.6;
  return <>
    <Head t0={7.8} label="THE UI" title="Big prompt, then a pause" />
    <ChatWindow x={40} y={190} w={490} h={640} t0={8.0} logo="chatgpt.svg" name="ChatGPT" prompt={PROMPT} promptAt={p0} think={th} s0={s0} reply={REPLY} rate={10} />
    <ChatWindow x={550} y={190} w={490} h={640} t0={T('claude')} logo="claude.png" name="Claude" prompt={PROMPT} promptAt={p0} think={th} s0={s0 + 0.15} reply={REPLY} rate={10} />
    <Center y={858}><Appear t0={th}><Tag size={30} icon={waiting ? 'hourglass' : 'lightning'} color={waiting ? AMBER : TEAL}>{waiting ? `waiting ${wsec.toFixed(1)} s` : 'then it streams, fast'}</Tag></Appear></Center>
  </>;
};

// ------------------------------------------------------------------ 2. normal API vs LLM (17.0 - 26.0)
const Flow: React.FC = () => {
  const r0 = T('request'), p0 = r0 + 0.6, s0 = T('response'), k0 = T('khatam'), l0 = T('llm'), ph = T('phases');
  const row = (y: number, label: string, mid: React.ReactNode, t0: number, tr: number, tp: number, ts: number) => <>
    <At x={60} y={y - 54}><Appear t0={t0}><Txt size={26} font={MONO} w={700} color={GREY}>{label}</Txt></Appear></At>
    <Node x={40} y={y} w={250} icon="paper-plane-tilt" label="Request" t0={tr} />
    <Wire x1={290} y1={y + 50} x2={350} y2={y + 50} t0={tp - 0.1} />
    {mid}
    <Wire x1={730} y1={y + 50} x2={790} y2={y + 50} t0={ts - 0.1} />
    <Node x={790} y={y} w={250} icon="chat-text" label="Response" t0={ts} />
  </>;
  return <>
    <Head t0={17.1} label="REQUEST FLOW" title="Normal API vs LLM" />
    {row(290, 'NORMAL API', <Node x={350} y={290} w={380} icon="gear" label="Processing" sub="one step" t0={p0} />, 17.2, r0, p0, s0)}
    <At x={790} y={410}><Appear t0={k0}><Tag size={22} solid={false} color={TEAL}>done</Tag></Appear></At>
    {row(640, 'LLM', <div style={{position: 'absolute', left: 350, top: 640, width: 380, height: 100, display: 'flex', gap: 10}}>
      <PopIn t0={ph - 0.2} style={{flex: 1}}><div style={{height: 100, borderRadius: 20, background: INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Txt size={26} w={700} color={WHITE}>Phase 1</Txt></div></PopIn>
      <PopIn t0={ph + 0.1} style={{flex: 1}}><div style={{height: 100, borderRadius: 20, background: VIOLET, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Txt size={26} w={700} color={WHITE}>Phase 2</Txt></div></PopIn>
    </div>, l0, l0 + 0.1, ph - 0.3, ph + 0.4)}
  </>;
};

// ------------------------------------------------------------------ 3. prefill (36.2 - 51.0)
const PTOK = ['Here', ' are', ' 40', ' pages', ' of', ' my', ' notes', '.', ' Summ', 'arize', ' the', ' key', ' points', '.'];
const Gpu: React.FC<{x: number; y: number; w: number; h: number; t0: number; heat: (i: number) => number; label?: string}> = ({x, y, w, h, t0, heat, label = 'GPU'}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4); const cols = 10, rows = 4;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 24, background: INK, padding: 20, boxSizing: 'border-box', opacity: k, transform: `scale(${0.92 + 0.08 * k})`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Icon name="cpu" size={34} color={WHITE} /><Txt size={26} w={700} color={WHITE}>{label}</Txt><Txt size={18} font={MONO} w={500} color={SOFT} style={{marginLeft: 'auto'}}>cores</Txt></div>
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, marginTop: 14}}>
      {Array.from({length: cols * rows}, (_, i) => { const v = clamp(heat(i)); return <div key={i} style={{height: (h - 110) / rows - 8, borderRadius: 6, background: v > 0.05 ? `rgba(129,140,248,${0.25 + 0.75 * v})` : '#2A2F45'}} />; })}
    </div>
  </div>;
};
const Prefill: React.FC = () => {
  const t = useT(); const m0 = T('model'), pa = T('parallel'), g0 = T('gpu'), c0 = T('compute', 2);
  const fly = ease(t, pa, 0.6);
  return <>
    <Head t0={36.3} label="PHASE 1" title="Prefill: read it all at once" />
    <At x={50} y={190}><Appear t0={m0 - 0.3}><Txt size={22} font={MONO} w={700} color={GREY}>YOUR PROMPT AS TOKENS</Txt></Appear></At>
    <div style={{position: 'absolute', left: 50, top: 230, width: 980, display: 'flex', flexWrap: 'wrap', gap: 10}}>
      {PTOK.map((s, i) => <div key={i} style={{transform: `translateY(${fly * 200}px) scale(${1 - fly * 0.3})`, opacity: 1 - fly * 0.9}}><Tok text={s} t0={m0 + i * 0.06} /></div>)}
    </div>
    {Array.from({length: 7}, (_, i) => <Wire key={i} x1={110 + i * 140} y1={350} x2={180 + i * 120} y2={470} t0={pa - 0.1} color={'#C7CBF5'} sw={3} packets={[pa, pa + 0.05]} />)}
    <Gpu x={50} y={480} w={600} h={330} t0={38.5} heat={i => t < pa + 0.3 ? 0 : (0.75 + 0.25 * Math.sin(t * 9 + i)) * ease(t, pa + 0.3, 0.5)} />
    <Card x={680} y={480} w={350} h={330} t0={g0 - 0.2}>
      <Txt size={22} font={MONO} w={700} color={GREY}>GPU USAGE</Txt>
      <div style={{marginTop: 26}}><Meter label="compute" v={0.94 * ease(t, g0, 0.8)} w={300} color={INDIGO} /></div>
      <div style={{marginTop: 30}}><Meter label="memory bw" v={0.38 * ease(t, g0, 0.8)} w={300} color={SOFT} /></div>
    </Card>
    <At x={50} y={850}><Appear t0={pa}><Tag size={26} solid={false}>all tokens in parallel</Tag></Appear></At>
    <At x={500} y={850}><Appear t0={c0 - 0.2}><Tag size={30} icon="cpu">compute-bound</Tag></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 4. decode (51.0 - 69.4)
const OUT = ['Sure', '!', ' Key', ' points', ':', ' 1', '.', ' Pre', 'fill'];
const Decode: React.FC = () => {
  const t = useT(); const a0 = T('answer', 3), dp = T('depend'), pa = T('parallel', 2), we = T('weights'), mb = T('memory', 2), mbp = T('memory', 3);
  const step = 1.25; const n = t < a0 ? 0 : Math.min(OUT.length, Math.floor((t - a0) / step) + 1);
  const pulse = n > 0 ? 1 - ((t - a0) % step) / step : 0;
  const tokX = (i: number) => 50 + i * 108;
  return <>
    <Head t0={51.1} label="PHASE 2" title="Decode: one token at a time" />
    <At x={50} y={190}><Txt size={22} font={MONO} w={700} color={GREY}>ANSWER SO FAR</Txt></At>
    <div style={{position: 'absolute', left: 50, top: 230, display: 'flex', gap: 8}}>
      {OUT.slice(0, n).map((s, i) => <Tok key={i} text={s} t0={a0 + i * step} color={VIOLET} solid={i === n - 1} />)}
    </div>
    {t > dp && n > 1 && <svg width={1080} height={960} style={{position: 'absolute', inset: 0, opacity: ease(t, dp, 0.4)}}>
      {Array.from({length: n - 1}, (_, i) => <path key={i} d={`M ${tokX(i) + 40} 290 Q ${(tokX(i) + tokX(n - 1)) / 2 + 40} ${350 + (n - i) * 6} ${tokX(n - 1) + 30} 292`} fill="none" stroke={VIOLET} strokeWidth={2.5} opacity={0.5} />)}
    </svg>}
    <At x={50} y={380}><Appear t0={dp}><Tag size={24} solid={false} color={VIOLET}>each new token depends on all previous ones</Tag></Appear></At>
    <Gpu x={50} y={470} w={480} h={300} t0={52.0} label="GPU" heat={i => i % 10 < 3 ? 0.35 * pulse + 0.1 : 0.02} />
    <div style={{position: 'absolute', left: 640, top: 470, width: 390, height: 140, borderRadius: 24, background: WHITE, border: `2.5px solid ${LINE}`, padding: 20, boxSizing: 'border-box', opacity: ease(t, we - 0.2, 0.4)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name="hard-drives" size={40} color={VIOLET} /><Txt size={28} w={700}>Memory</Txt></div>
      <Txt size={20} font={MONO} w={500} color={GREY} style={{marginTop: 6}}>model weights (GBs)</Txt>
    </div>
    <Wire x1={640} y1={560} x2={535} y2={600} t0={we} color={VIOLET} sw={5} packets={Array.from({length: 12}, (_, i) => we + 0.2 + i * 0.55)} pc={VIOLET} />
    <Card x={640} y={630} w={390} h={190} t0={mb - 0.3}>
      <div style={{marginTop: 0}}><Meter label="memory bw" v={0.95 * ease(t, mb, 0.8)} w={340} color={VIOLET} /></div>
      <div style={{marginTop: 24}}><Meter label="compute" v={0.3 * ease(t, mb, 0.8)} w={340} color={SOFT} /></div>
    </Card>
    <At x={50} y={790}><Appear t0={pa}><Tag size={24} solid={false} color={ROSE} icon="x-circle">cannot run in parallel</Tag></Appear></At>
    <At x={50} y={862}><Appear t0={mbp - 0.2}><Tag size={30} icon="hard-drives" color={VIOLET}>memory-bound</Tag></Appear></At>
    <At x={640} y={862}><Appear t0={T('bottleneck')}><Tag size={24} solid={false} color={VIOLET}>bottleneck: memory bandwidth</Tag></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 5. TTFT and TPS (72.6 - 89.0)
const Metrics: React.FC = () => {
  const t = useT(); const tt = T('ttft'), rq = T('request', 3), pl = T('prompt', 4), tp = T('tps'), ag = T('agla'), dc = T('decode', 2);
  const X0 = 60, X1 = 1020;
  const lane = (y: number, pre: number, t0: number, label: string) => {
    const k = ease(t, t0, 0.8); const pw = pre * k; const ticks = 9;
    return <>
      <At x={X0} y={y - 46}><Txt size={22} font={MONO} w={700} color={GREY}>{label}</Txt></At>
      <div style={{position: 'absolute', left: X0, top: y, width: X1 - X0, height: 70, borderRadius: 16, background: WHITE, border: `2px solid ${LINE}`}} />
      <div style={{position: 'absolute', left: X0, top: y, width: pw, height: 70, borderRadius: 16, background: INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {pw > 160 && <Txt size={24} w={700} color={WHITE}>prefill</Txt>}</div>
      {Array.from({length: ticks}, (_, i) => { const x = X0 + pre + 16 + i * ((X1 - X0 - pre - 30) / ticks); const s = t0 + 0.8 + i * 0.12; return t > s ? <div key={i} style={{position: 'absolute', left: x, top: y + 14, width: 26, height: 42, borderRadius: 8, background: TEAL, opacity: ease(t, s, 0.2)}} /> : null; })}
      {k > 0.95 && <div style={{position: 'absolute', left: X0 + pre - 2, top: y - 10, width: 4, height: 90, background: AMBER}} />}
    </>;
  };
  return <>
    <Head t0={72.7} label="MEASURE IT" title="TTFT and TPS" />
    {lane(260, 260, tt - 0.2, 'SHORT PROMPT')}
    {T('prompt', 4) > 0 && t > pl - 0.2 && lane(450, 560, pl, 'LONG PROMPT')}
    <Card x={60} y={570} w={470} h={250} t0={T('time') - 0.1} style={{padding: 24}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{width: 18, height: 18, borderRadius: 4, background: INDIGO}} /><Txt size={30} w={700}>TTFT</Txt></div>
      <Txt size={22} font={MONO} w={500} color={GREY} style={{marginTop: 6}}>time to first token</Txt>
      <Appear t0={rq}><Txt size={24} w={500} color={INK} style={{marginTop: 14, whiteSpace: 'normal', width: 420}}>request sent → first token. Mostly prefill, grows with the prompt.</Txt></Appear>
    </Card>
    <Card x={550} y={570} w={470} h={250} t0={tp - 0.1} style={{padding: 24}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{width: 18, height: 18, borderRadius: 4, background: TEAL}} /><Txt size={30} w={700}>TPS</Txt></div>
      <Txt size={22} font={MONO} w={500} color={GREY} style={{marginTop: 6}}>tokens per second</Txt>
      <Appear t0={ag}><Txt size={24} w={500} color={INK} style={{marginTop: 14, whiteSpace: 'normal', width: 420}}>how fast the next tokens come. This is decode speed.</Txt></Appear>
    </Card>
    <At x={60} y={850}><Appear t0={dc}><Txt size={20} font={MONO} w={500} color={SOFT}>bar lengths are illustrative</Txt></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 6. RAG and long outputs (92.0 - 102.0)
const Rag: React.FC = () => {
  const t = useT(); const d0 = T('documents'), tf = T('ttft', 3), us = T('user'), op = T('output'), dc = T('decode', 3);
  const nd = t < d0 ? 0 : Math.min(20, Math.floor((t - d0) * 16) + 1);
  return <>
    <Head t0={92.1} label="IN SYSTEM DESIGN" title="Where the wait comes from" />
    <Node x={50} y={200} w={300} icon="files" label="RAG app" sub="retrieves docs" t0={92.4} />
    <div style={{position: 'absolute', left: 400, top: 190, width: 630, height: 230, borderRadius: 24, background: WHITE, border: `2.5px solid ${LINE}`, padding: 18, boxSizing: 'border-box', opacity: ease(t, 92.8, 0.4)}}>
      <Txt size={22} font={MONO} w={700} color={GREY}>PROMPT</Txt>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10}}>
        {Array.from({length: nd}, (_, i) => <div key={i} style={{width: 50, height: 62, borderRadius: 8, background: TINT, border: `2px solid #C7CBF5`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="file-text" size={30} color={INDIGO} /></div>)}
      </div>
    </div>
    <At x={400} y={430}><Appear t0={d0 + 0.6}><Txt size={24} font={MONO} w={700} color={INDIGO}>{nd} documents stuffed in</Txt></Appear></At>
    <At x={50} y={500}><Txt size={22} font={MONO} w={700} color={GREY}>TTFT</Txt></At>
    <div style={{position: 'absolute', left: 50, top: 540, height: 54, width: 120 + 640 * ease(t, tf, 1.0), borderRadius: 14, background: INDIGO}} />
    <Card x={560} y={620} w={470} t0={us} style={{padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14}}>
      <Icon name="user" size={44} color={GREY} /><Txt size={30} w={700}>"Is the app stuck?"</Txt>
    </Card>
    <At x={50} y={640}><Txt size={22} font={MONO} w={700} color={GREY}>{t > op ? 'LONG OUTPUT, DECODE TIME' : ''}</Txt></At>
    {t > op && <div style={{position: 'absolute', left: 50, top: 680, display: 'flex', gap: 6}}>{Array.from({length: Math.min(16, Math.floor((t - op) * 7) + 1)}, (_, i) => <div key={i} style={{width: 24, height: 48, borderRadius: 7, background: TEAL}} />)}</div>}
    <At x={50} y={780}><Appear t0={dc}><Tag size={26} solid={false} color={TEAL} icon="clock">long answer = more decode time</Tag></Appear></At>
    <At x={50} y={870}><Txt size={20} font={MONO} w={500} color={SOFT}>illustrative</Txt></At>
  </>;
};

// ------------------------------------------------------------------ 7. full pipeline + streaming (102.0 - 111.0)
const Stream: React.FC = () => {
  const t = useT(); const st = T('streaming'), ph = T('pehle', 4), wh = T('while');
  const pk = Array.from({length: 10}, (_, i) => ph + 0.3 + i * 0.5);
  return <>
    <Head t0={102.1} label="UNDER THE HOOD" title="Stream every token" />
    <Node x={40} y={190} w={330} icon="browser" label="Chat UI" sub="renders tokens" t0={102.2} />
    <Node x={40} y={430} w={330} icon="cloud" label="API server" sub="opens a stream" t0={102.4} />
    <Node x={40} y={670} w={330} icon="cpu" label="GPU" sub="prefill, then decode" t0={102.6} hot />
    <Wire x1={150} y1={290} x2={150} y2={430} t0={102.8} packets={[103.0]} />
    <Wire x1={150} y1={530} x2={150} y2={670} t0={103.0} packets={[103.3]} />
    <Wire x1={260} y1={670} x2={260} y2={530} t0={ph} color={TEAL} packets={pk} pc={TEAL} />
    <Wire x1={260} y1={430} x2={260} y2={290} t0={ph} color={TEAL} packets={pk.map(p => p + 0.4)} pc={TEAL} />
    <At x={285} y={590}><Appear t0={ph}><Txt size={20} font={MONO} w={700} color={TEAL}>token</Txt></Appear></At>
    <Card x={420} y={190} w={620} t0={st - 0.2} style={{padding: 26, fontFamily: MONO}}>
      <Txt size={22} font={MONO} w={700} color={GREY}>DECODE LOOP</Txt>
      {['while (!done) {', '  token = model.next(context)', '  send(token)   // streamed', '  context.push(token)', '}'].map((l, i) => <Txt key={i} size={27} font={MONO} w={500} color={t > wh && i > 0 && i < 4 ? INDIGO : INK} style={{whiteSpace: 'pre', marginTop: 10}}>{l}</Txt>)}
    </Card>
    <div style={{position: 'absolute', left: 420, top: 560, width: 620, borderRadius: 24, background: TINT, padding: '20px 24px', boxSizing: 'border-box', opacity: ease(t, ph, 0.4)}}>
      <Txt size={22} font={MONO} w={700} color={GREY}>USER SEES</Txt>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: INK, marginTop: 8, lineHeight: 1.35}}>{REPLY.split(' ').slice(0, Math.max(0, Math.floor((t - ph - 0.3) * 6))).join(' ')}<span style={{display: 'inline-block', width: 12, height: 28, background: INDIGO, marginLeft: 6, verticalAlign: 'middle'}} /></div>
    </div>
    <At x={420} y={870}><Appear t0={T('wait') - 0.2}><Tag size={26} icon="lightning" color={TEAL}>first token shown, wait feels short</Tag></Appear></At>
  </>;
};

export const scenes = [
  {a: 7.7, b: 17.0, el: Ui},
  {a: 17.0, b: 26.0, el: Flow},
  {a: 36.2, b: 51.0, el: Prefill},
  {a: 51.0, b: 69.4, el: Decode},
  {a: 72.6, b: 89.0, el: Metrics},
  {a: 92.0, b: 102.0, el: Rag},
  {a: 102.0, b: 111.0, el: Stream},
];
void [PopIn, useCurrentFrame, lerp];
