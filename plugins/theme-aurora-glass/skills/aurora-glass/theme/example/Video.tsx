// AI System Design Ep 3: why your normal Redis cache won't work for AI chatbots. Theme: aurora-glass.
// Hard cuts between the speaker (full screen, real background) and full-screen glass pages.
// Similarity scores, the 0.95 threshold and vector values are illustrative.
import React from 'react';
import {Easing} from 'remotion';
import {clamp, lerp, ease, useT} from './core';
import {Config, Head, Panel, Tag, Bar, Bubble, Wire, Icon, At, Center, Appear, PopIn, Txt, Mono, Note, GLASS,
  AQUA, BLUE, RED, GREEN, AMBER, WHITE, MUTED, DIM, REDIS, BG, SANS, MONO} from './theme/kit';
import data from './data.json';

const END = (data as any).duration as number;
const WS = (data as any).words as {w: string; t: number}[];
const nm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
const T = (w: string, after = 0) => { for (const x of WS) if (x.t >= after - 0.05 && nm(x.w).startsWith(nm(w))) return x.t; throw new Error('word ' + w); };

export const cfg: Config = {
  cuts: [
    {a: 0, b: 5.3, m: 'talk'}, {a: 5.3, b: 14.4, m: 'page'}, {a: 14.4, b: 16.9, m: 'talk'}, {a: 16.9, b: 25.4, m: 'page'},
    {a: 25.4, b: 26.8, m: 'talk', z: 1.3}, {a: 26.8, b: 41.3, m: 'page'}, {a: 41.3, b: 42.6, m: 'talk'}, {a: 42.6, b: 48.2, m: 'page'},
    {a: 48.2, b: 49.4, m: 'talk', z: 1.3}, {a: 49.4, b: 58.8, m: 'page'}, {a: 58.8, b: 60.0, m: 'talk'}, {a: 60.0, b: 74.2, m: 'page'},
    {a: 74.2, b: 76.1, m: 'talk', z: 1.3}, {a: 76.1, b: 85.3, m: 'page'}, {a: 85.3, b: 86.6, m: 'talk'}, {a: 86.6, b: 91.3, m: 'page'},
    {a: 91.3, b: 92.6, m: 'talk', z: 1.3}, {a: 92.6, b: 108.8, m: 'page'}, {a: 108.8, b: 110.8, m: 'talk'}, {a: 110.8, b: 116.9, m: 'page'},
    {a: 116.9, b: 118.5, m: 'talk', z: 1.3}, {a: 118.5, b: 124.6, m: 'page'}, {a: 124.6, b: END + 1, m: 'talk'},
  ],
};

const RedisTile: React.FC<{s?: number; dim?: boolean}> = ({s = 120, dim}) => (
  <div style={{width: s, height: s, borderRadius: s * 0.24, background: REDIS, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.45 : 1, boxShadow: `0 0 40px ${REDIS}66`}}>
    <Icon name="redis" size={s * 0.62} color="#fff" /></div>
);
const Pill: React.FC<{ok?: boolean; children: React.ReactNode; size?: number}> = ({ok, children, size = 26}) => <Tag color={ok ? GREEN : RED} size={size}>{children}</Tag>;

// ------------------------------------------------------------------ hook + outro on the talk shots
const Hook: React.FC = () => {
  const t = useT(); if (t > 5.3) return null;
  return <>
    <Center y={130}><PopIn t0={0.05}><div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, background: 'rgba(6,10,18,.82)', border: `2px solid ${AQUA}`}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: AQUA, boxShadow: `0 0 16px ${AQUA}`}} />
      <Txt size={30} font={MONO} w={700} style={{letterSpacing: 2}}>AI SYSTEM DESIGN</Txt>
      <div style={{padding: '4px 14px', borderRadius: 10, background: AQUA}}><Txt size={30} font={MONO} w={700} color={BG}>EP 03</Txt></div></div></PopIn></Center>
    <Center y={226}><Appear t0={1.9}><div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 26px', borderRadius: 24, background: 'rgba(6,10,18,.86)', borderLeft: `8px solid ${AQUA}`}}>
      <Txt size={40} w={700} style={{letterSpacing: -0.8}}>Why normal <span style={{color: REDIS}}>Redis</span> cache fails for AI chatbots</Txt></div></Appear></Center>
  </>;
};
const Outro: React.FC = () => {
  const t = useT(); if (t < 124.6) return null;
  return <Center y={190}><div style={{display: 'flex', gap: 22}}>
    <PopIn t0={Math.max(124.65, T('cost', 124) - 0.1)}><div style={{...GLASS, background: 'rgba(6,10,18,.86)', border: `2px solid ${GREEN}`, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 14}}>
      <Txt size={42} w={700}>LLM cost</Txt><Txt size={52} w={700} color={GREEN}>↓</Txt></div></PopIn>
    <PopIn t0={T('latency', 124.5) - 0.1}><div style={{...GLASS, background: 'rgba(6,10,18,.86)', border: `2px solid ${GREEN}`, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 14}}>
      <Txt size={42} w={700}>Latency</Txt><Txt size={52} w={700} color={GREEN}>↓</Txt></div></PopIn>
  </div></Center>;
};
cfg.overlays = [Hook, Outro];

// ------------------------------------------------------------------ 1. normal caching (5.3 - 14.4)
const NormalCache: React.FC = () => {
  const t = useT(); const r0 = T('bahut'), d0 = T('database'), n0 = T('nahi', 11.9), c0 = T('caches');
  const toCache = t > c0;
  return <>
    <Head t0={5.4} label="BASICS" title="Normal caching" />
    {Array.from({length: 5}, (_, i) => <At key={i} x={70} y={400 + i * 108}><Appear t0={r0 + i * 0.18} dy={0}>
      <div style={{...GLASS, borderRadius: 18, padding: '18px 24px', opacity: toCache ? 1 - 0.4 * ease(t, c0 + 0.6 + i * 0.1, 0.3) : 1}}><Mono size={28}>GET /faq/refund</Mono></div></Appear></At>)}
    <Panel x={470} y={400} w={260} h={330} t0={5.9} glow={toCache ? AQUA : undefined}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 10}}><RedisTile s={130} /><Txt size={30} font={MONO} w={700}>CACHE</Txt></div></Panel>
    <Panel x={770} y={400} w={240} h={330} t0={d0 - 0.15} style={{opacity: t > n0 ? 0.4 : undefined}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 10}}><div style={{width: 130, height: 130, borderRadius: 30, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="database" size={84} color={MUTED} /></div>
        <Txt size={30} font={MONO} w={700} color={MUTED}>DATABASE</Txt></div></Panel>
    {t > n0 && <At x={790} y={760}><PopIn t0={n0}><Pill>skipped</Pill></PopIn></At>}
    <Wire x1={400} y1={566} x2={462} y2={566} t0={c0} color={AQUA} packets={[c0 + 0.1, c0 + 0.4, c0 + 0.7, c0 + 1.0]} />
    <Panel x={70} y={950} w={940} h={190} t0={c0 + 0.3} glow={GREEN}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, height: '100%'}}><Icon name="lightning" size={70} color={GREEN} />
        <div><Txt size={40} w={700}>Same request? Serve from cache</Txt><Mono size={26} color={MUTED}>no database trip</Mono></div></div></Panel>
  </>;
};

// ------------------------------------------------------------------ 2. support bot (16.9 - 25.4)
const SupportBot: React.FC = () => {
  const t = useT(); const a0 = T('refund') - 0.3, b0 = T('mere'), s0 = T('matlab', 24);
  return <>
    <Head t0={17.0} label="EXAMPLE" title="A customer support AI bot" size={62} />
    <Panel x={90} y={360} w={900} h={900} t0={17.1}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 24, borderBottom: '1.5px solid rgba(255,255,255,.1)'}}>
        <div style={{width: 76, height: 76, borderRadius: 22, background: `linear-gradient(135deg, ${BLUE}, ${AQUA})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="robot" size={50} color="#fff" /></div>
        <div><Txt size={36} w={700}>Support Bot</Txt><div style={{display: 'flex', alignItems: 'center', gap: 8}}><div style={{width: 12, height: 12, borderRadius: 6, background: GREEN}} /><Mono size={22} color={MUTED}>online</Mono></div></div></div>
      <div style={{position: 'relative', height: 700}}>
        <At x={0} y={40}><Appear t0={a0}><Mono size={22} color={MUTED}>User A</Mono><Bubble style={{marginTop: 10, borderColor: t > s0 ? AQUA : undefined}}>How do I get a refund?</Bubble></Appear></At>
        <At x={0} y={250}><Appear t0={b0}><Mono size={22} color={MUTED}>User B</Mono><Bubble alt style={{marginTop: 10, borderColor: t > s0 ? AQUA : undefined}}>When will I get my money back?</Bubble></Appear></At>
        <At x={0} y={480}><PopIn t0={s0}><Tag icon="check-circle">same meaning</Tag></PopIn></At>
        <At x={340} y={480}><PopIn t0={s0 + 0.35}><Tag color={RED} icon="x-circle">different words</Tag></PopIn></At>
      </div>
    </Panel>
  </>;
};

// ------------------------------------------------------------------ 3. open loop (26.8 - 29.9)
const Loop: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={26.9} label="EPISODE 3" title={<>Caching for <span style={{color: AQUA}}>AI chatbots</span></>} />
    {['Exact-match cache', 'Semantic cache', 'The traps + fixes'].map((s, i) => <Panel key={s} x={110} y={420 + i * 170} w={860} h={140} t0={27.3 + i * 0.25}
      style={{display: 'flex', alignItems: 'center', gap: 28, filter: t > 28.6 && i > 0 ? `blur(${7 * ease(t, 28.6, 0.5)}px)` : undefined}}>
      <Txt size={34} font={MONO} w={700} color={AQUA}>0{i + 1}</Txt><Txt size={44} w={700}>{s}</Txt></Panel>)}
  </>;
};

// ------------------------------------------------------------------ 4. exact match (29.9 - 41.3)
const ExactMatch: React.FC = () => {
  const t = useT(); const e0 = T('exact', 33), u0 = T('bilkul', 36), q1 = T('text', 37.5), q2 = T('agar', 39), cm = T('comma', 39.6), m0 = T('miss', 40.5);
  return <>
    <Head t0={30.0} label="01 · EXACT MATCH" title="Exact-match cache" />
    <Panel x={70} y={360} w={940} h={330} t0={30.2} glow={t > e0 ? AQUA : undefined}>
      <div style={{display: 'flex'}}><Txt size={24} font={MONO} w={700} color={AQUA} style={{width: 520, letterSpacing: 3}}>KEY</Txt><Txt size={24} font={MONO} w={700} color={AQUA} style={{letterSpacing: 3}}>VALUE</Txt></div>
      <div style={{display: 'flex', marginTop: 30}}><Mono size={32} style={{width: 520}}>"how do i get a refund?"</Mono><Mono size={32} color={MUTED}>cached answer</Mono></div>
      <div style={{width: 470 * ease(t, u0, 0.5), height: 6, borderRadius: 3, background: AMBER, marginTop: 12}} />
      <Appear t0={u0 + 0.2}><Mono size={24} color={AMBER} style={{marginTop: 20}}>must match character for character</Mono></Appear>
    </Panel>
    <Panel x={70} y={760} w={940} h={150} t0={q1} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <Mono size={34}>"how do i get a refund?"</Mono>{t > q1 + 0.4 && <PopIn t0={q1 + 0.4}><Pill ok>HIT</Pill></PopIn>}</Panel>
    <Panel x={70} y={950} w={940} h={150} t0={q2} glow={t > m0 ? RED : undefined} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <Mono size={34}>"how do i get a refund<span style={{color: RED, fontWeight: 700, textShadow: t > cm ? `0 0 18px ${RED}` : undefined, fontSize: t > cm ? 46 : 34}}>,</span>?"</Mono>
      {t > m0 && <PopIn t0={m0}><Pill>MISS</Pill></PopIn>}</Panel>
    <At x={70} y={1150}><Appear t0={m0 + 0.4}><div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="cpu" size={44} color={RED} /><Txt size={34} w={700} color={RED}>one comma → miss → full LLM call</Txt></div></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 5. thousand ways (42.6 - 48.2)
const PARA = ['refund kaise milega?', 'how to get a refund', 'refund process?', 'paise wapas kab?', 'I want my money back', 'refund status pls', 'can I return this?', 'how do refunds work'];
const Thousand: React.FC = () => {
  const t = useT(); const h0 = T('hazaar'), a0 = T('achha');
  return <>
    <Head t0={42.7} label="01 · EXACT MATCH" title="One question, 1000 ways" />
    {PARA.map((p, i) => <At key={p} x={70 + (i % 2) * 480} y={380 + Math.floor(i / 2) * 128}><Appear t0={42.8 + i * 0.16}>
      <div style={{...GLASS, borderRadius: 20, width: 460, height: 104, boxSizing: 'border-box', padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Mono size={25}>{p}</Mono><div style={{padding: '4px 12px', borderRadius: 999, border: `2px solid ${RED}`}}><Txt size={18} font={MONO} w={700} color={RED}>MISS</Txt></div></div></Appear></At>)}
    <Center y={920}><PopIn t0={h0}><Txt size={120} w={700} color={AMBER} style={{textShadow: `0 0 40px ${AMBER}66`}}>×1000</Txt></PopIn></Center>
    <Center y={1110}><Appear t0={h0 + 0.3}><Txt size={36} w={500} color={MUTED}>people ask the same thing differently</Txt></Appear></Center>
    <Center y={1220}><PopIn t0={a0}><Tag color={RED} icon="x-circle" size={34}>exact match: not a good fit</Tag></PopIn></Center>
  </>;
};

// ------------------------------------------------------------------ 6. semantic (49.4 - 52.3)
const Semantic: React.FC = () => {
  const t = useT(); const w0 = T('words', 50.5), n0 = T('nahi', 50.9), m0 = T('meaning', 51.4);
  return <>
    <Head t0={49.5} label="02 · SEMANTIC CACHE" title={<span style={{color: AQUA}}>Semantic caching</span>} size={80} />
    <Panel x={70} y={440} w={940} h={190} t0={w0 - 0.2} style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <Icon name="x-circle" size={60} color={t > n0 ? RED : MUTED} />
      <div style={{position: 'relative'}}><Txt size={52} w={700} color={t > n0 ? MUTED : WHITE}>Match the words</Txt>
        <div style={{position: 'absolute', left: -6, top: '52%', height: 7, borderRadius: 4, background: RED, width: `${ease(t, n0, 0.3) * 104}%`}} /></div></Panel>
    <Panel x={70} y={680} w={940} h={190} t0={m0} glow={AQUA} style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <Icon name="check-circle" size={60} color={AQUA} /><Txt size={52} w={700}>Match the <span style={{color: AQUA}}>meaning</span></Txt></Panel>
  </>;
};

// ------------------------------------------------------------------ 7. embeddings (52.3 - 58.8)
const VEC = [0.12, -0.48, 0.91, 0.07, -0.33, 0.56, -0.12];
const Embedding: React.FC = () => {
  const t = useT(); const q0 = T('question', 52.8), e0 = T('embeddings', 53.3), c0 = T('create', 53.9), n0 = T('numbers'), m0 = T('meaning', 57);
  return <>
    <Head t0={52.4} label="02 · EMBEDDINGS" title="Text becomes numbers" />
    <Panel x={70} y={360} w={940} h={140} t0={q0} style={{display: 'flex', alignItems: 'center'}}><Mono size={36}>"how do i get a refund?"</Mono></Panel>
    <Wire x1={540} y1={510} x2={540} y2={640} t0={e0} color={AQUA} packets={[e0 + 0.3]} />
    <At x={600} y={545}><Appear t0={e0}><Tag icon="cpu" size={26}>embedding model</Tag></Appear></At>
    <Panel x={70} y={660} w={940} h={150} t0={c0} glow={t > m0 ? AQUA : undefined} style={{display: 'flex', alignItems: 'center', gap: 6}}>
      <Mono size={36} color={MUTED}>[</Mono>
      {VEC.map((v, i) => { const k = ease(t, c0 + 0.2 + i * 0.08, 0.5); const shown = t < c0 + 0.2 + i * 0.08 ? 0 : k < 1 ? Math.sin(t * 40 + i) * 0.9 : v;
        return <Mono key={i} size={32} color={t > m0 ? AQUA : WHITE} style={{width: 112, textAlign: 'center', fontWeight: 700, opacity: k}}>{shown.toFixed(2)}</Mono>; })}
      <Mono size={36} color={MUTED}>…]</Mono></Panel>
    <At x={70} y={880}><Appear t0={n0}><Txt size={50} w={700}>A list of numbers</Txt></Appear></At>
    <At x={70} y={960}><Appear t0={m0}><Txt size={50} w={700} color={AQUA}>= the meaning of the text</Txt></Appear></At>
    <Note x={70} y={1090}>values illustrative · real embeddings have hundreds of numbers</Note>
  </>;
};

// ------------------------------------------------------------------ 8. vector space (60.0 - 68.1)
const cluster = (cx: number, cy: number, n: number, r: number, seed: number) => Array.from({length: n}, (_, i) => {
  const a = (i * 2.399 + seed) % (Math.PI * 2); const rr = r * (0.35 + 0.65 * ((i * 0.618 + seed) % 1)); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
const CL: [number, number, string, string][] = [[270, 330, AQUA, 'refund questions'], [700, 220, DIM, 'shipping'], [660, 560, DIM, 'password reset']];
const VectorSpace: React.FC = () => {
  const t = useT(); const s0 = 60.2, n0 = T('naya'), l0 = T('embedding', 63), sim = T('similarity', 66);
  const fly = Easing.out(Easing.cubic)(clamp((t - n0) / 0.9)); const nx = lerp(860, 340, fly), ny = lerp(80, 400, fly);
  return <>
    <Head t0={60.1} label="02 · VECTOR SPACE" title="Same meaning sits close" />
    <Panel x={70} y={360} w={940} h={760} t0={60.1} style={{padding: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56,189,248,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.08) 1px, transparent 1px)', backgroundSize: '47px 47px'}} />
      {CL.map(([cx, cy, c, lab], k) => <React.Fragment key={lab}>
        {cluster(cx, cy, 8, 80, cx / 100).map(([x, y], i) => { const p = ease(t, s0 + 0.1 + k * 0.2 + i * 0.03, 0.3);
          return <div key={i} style={{position: 'absolute', left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: 11, background: c, transform: `scale(${p * (k === 0 && t > s0 + 0.9 && t < s0 + 1.5 ? 1.4 : 1)})`, boxShadow: `0 0 16px ${c}`}} />; })}
        <div style={{position: 'absolute', left: cx - 120, top: cy + 100, width: 240, textAlign: 'center', opacity: ease(t, s0 + 0.6, 0.3)}}><Txt size={24} font={MONO} w={700} color={c}>{lab}</Txt></div>
      </React.Fragment>)}
      <div style={{position: 'absolute', left: 296 - 16, top: 330 - 16, width: 32, height: 32, borderRadius: 16, background: AQUA, border: '4px solid #fff', boxShadow: `0 0 20px ${AQUA}`}} />
      {t > sim && <svg width={940} height={760} style={{position: 'absolute', left: 0, top: 0}}><line x1={296} y1={330} x2={lerp(296, nx, ease(t, sim, 0.4))} y2={lerp(330, ny, ease(t, sim, 0.4))} stroke={AMBER} strokeWidth={5} strokeDasharray="12 10" /></svg>}
      {t > n0 && <div style={{position: 'absolute', left: nx - 18, top: ny - 18, width: 36, height: 36, borderRadius: 18, background: AMBER, border: '4px solid #fff', boxShadow: `0 0 26px ${AMBER}`}} />}
      <div style={{position: 'absolute', left: 390, top: 420, opacity: ease(t, l0, 0.3)}}><Mono size={25} color={AMBER}>new: "when will I get my money back?"</Mono></div>
      <div style={{position: 'absolute', left: 390, top: 480}}>{t > sim && <PopIn t0={sim + 0.2}><Tag color={AMBER} icon="magnifying-glass">similarity check</Tag></PopIn>}</div>
    </Panel>
    <Note x={70} y={1150}>2D sketch · real embeddings have many dimensions</Note>
  </>;
};

// ------------------------------------------------------------------ 9. threshold (68.1 - 74.2)
const Threshold: React.FC = () => {
  const t = useT(); const s0 = T('similarity', 68.3), th = T('threshold', 69), h0 = T('hit', 71.9), p0 = T('purana');
  const v = 0.97 * ease(t, s0, 1.4);
  return <>
    <Head t0={68.2} label="02 · THRESHOLD" title="Above the threshold = hit" size={62} />
    <Panel x={70} y={360} w={940} h={400} t0={68.2}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><Mono size={30} color={MUTED}>similarity</Mono><Txt size={96} font={MONO} w={700} color={t > h0 ? GREEN : WHITE}>{v.toFixed(2)}</Txt></div>
      <div style={{position: 'relative', marginTop: 30}}><Bar v={v} w={880} h={40} color={AQUA} grad={`linear-gradient(90deg, ${BLUE}, ${AQUA} 70%, ${GREEN})`} />
        {t > th && <div style={{position: 'absolute', left: 880 * 0.95 - 3, top: -24, width: 6, height: 88, borderRadius: 3, background: AMBER, opacity: ease(t, th, 0.3)}} />}</div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 34}}><Appear t0={th}><Mono size={28} color={AMBER}>threshold 0.95 (example)</Mono></Appear></div>
    </Panel>
    <At x={70} y={810}>{t > h0 && <PopIn t0={h0}><Tag color={GREEN} icon="check-circle" size={44} solid>CACHE HIT</Tag></PopIn>}</At>
    <Panel x={70} y={960} w={940} h={160} t0={p0} glow={GREEN} style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Icon name="arrows-counter-clockwise" size={56} color={GREEN} /><Txt size={40} w={700}>Return the cached answer</Txt></Panel>
    <At x={70} y={1160}><Appear t0={p0 + 0.6}><div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name="cpu" size={40} color={MUTED} /><Txt size={32} w={700} color={MUTED} style={{textDecoration: 'line-through', textDecorationColor: RED, textDecorationThickness: 5}}>LLM call</Txt><Txt size={32} w={700} color={GREEN}>skipped</Txt></div></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 10. race (76.1 - 85.3)
const Race: React.FC = () => {
  const t = useT(); const l0 = T('call', 77.8), s0 = T('seconds'), x0 = T('expensive'), e0 = T('embeddings', 81), q0 = T('search', 82), m0 = T('milliseconds'), c0 = T('cheap');
  const lane = (y: number, t0: number, icon: string, title: string, fill: number, col: string, a: React.ReactNode, b: React.ReactNode) =>
    <Panel x={70} y={y} w={940} h={360} t0={t0}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name={icon} size={52} color={col} /><Txt size={42} w={700}>{title}</Txt></div>
      <div style={{marginTop: 40}}><Bar v={fill} w={880} h={40} color={col} /></div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 34}}>{a}{b}</div></Panel>;
  return <>
    <Head t0={76.2} label="WHY IT PAYS OFF" title="Seconds vs milliseconds" />
    {lane(380, l0 - 0.3, 'hourglass-medium', 'LLM call', clamp((t - l0) / 3.4), RED,
      <Appear t0={s0}><Txt size={40} font={MONO} w={700} color={RED}>seconds</Txt></Appear>,
      <Appear t0={x0}><div style={{display: 'flex', alignItems: 'center', gap: 10}}><Icon name="coins" size={44} color={RED} /><Txt size={40} font={MONO} w={700} color={RED}>expensive</Txt></div></Appear>)}
    {lane(800, e0 - 0.2, 'lightning', 'Embedding + similarity search', ease(t, q0, 0.18), GREEN,
      <Appear t0={m0}><Txt size={40} font={MONO} w={700} color={GREEN}>milliseconds</Txt></Appear>,
      <Appear t0={c0}><div style={{display: 'flex', alignItems: 'center', gap: 10}}><Icon name="coins" size={44} color={GREEN} /><Txt size={40} font={MONO} w={700} color={GREEN}>cheap</Txt></div></Appear>)}
  </>;
};

// ------------------------------------------------------------------ 11. bloom filter (86.6 - 91.3)
const Bloom: React.FC = () => {
  const t = useT(); const b0 = T('bloom'), f0 = T('filter', 87.9), q0 = T('trade-off'), fp = T('false', 89.9); const ON = [2, 5, 9];
  return <>
    <Head t0={86.7} label="THE TRAP" title={<><span style={{color: AMBER}}>⚠</span> A big risk</>} />
    <Panel x={70} y={380} w={940} h={420} t0={b0 - 0.3}>
      <Mono size={30} color={MUTED}>Bloom filter</Mono>
      <div style={{display: 'flex', gap: 10, marginTop: 34}}>{Array.from({length: 12}, (_, i) => { const on = ON.includes(i) && t > f0 + 0.3 + ON.indexOf(i) * 0.12;
        return <div key={i} style={{width: 63, height: 84, borderRadius: 14, border: `2px solid ${on ? AMBER : 'rgba(255,255,255,.16)'}`, background: on ? `${AMBER}33` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Txt size={36} font={MONO} w={700} color={on ? AMBER : DIM}>{on ? 1 : 0}</Txt></div>; })}</div>
      <Appear t0={q0}><Mono size={32} color={AMBER} style={{marginTop: 40}}>"seen this before?" → "maybe yes"</Mono></Appear>
    </Panel>
    <At x={70} y={860}>{t > fp && <PopIn t0={fp}><Tag color={RED} size={46} solid icon="warning">FALSE POSITIVE</Tag></PopIn>}</At>
    <At x={70} y={990}><Appear t0={fp + 0.5}><Txt size={36} w={500} color={MUTED}>a "yes" that is actually wrong</Txt></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 12. cancel vs don't cancel (92.6 - 101.6)
const Cancel: React.FC = () => {
  const t = useT(); const a0 = T('mera', 93.9), b0 = T('mera', 96.3), d0 = T('Dono', 98), p0 = T('pass', 99), u0 = T('ulta');
  const k = Easing.out(Easing.cubic)(clamp((t - d0 - 0.1) / 0.8));
  return <>
    <Head t0={92.7} label="THE TRAP" title="Close vectors, opposite meaning" size={58} />
    <At x={70} y={370}><Appear t0={a0}><Bubble size={44}>Cancel my order</Bubble></Appear></At>
    <At x={70} y={510}><Appear t0={b0}><Bubble alt size={44}><span style={{color: RED}}>Don't</span> cancel my order</Bubble></Appear></At>
    <Panel x={70} y={680} w={560} h={440} t0={d0} style={{padding: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56,189,248,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.08) 1px, transparent 1px)', backgroundSize: '44px 44px'}} />
      <div style={{position: 'absolute', left: lerp(80, 250, k), top: lerp(80, 190, k), width: 34, height: 34, borderRadius: 17, background: AQUA, boxShadow: `0 0 20px ${AQUA}`}} />
      <div style={{position: 'absolute', left: lerp(460, 284, k), top: lerp(360, 214, k), width: 34, height: 34, borderRadius: 17, background: RED, boxShadow: `0 0 20px ${RED}`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: ease(t, p0, 0.3)}}><Txt size={26} font={MONO} w={700} color={AMBER}>almost the same point</Txt></div>
    </Panel>
    <Panel x={660} y={680} w={350} h={440} t0={p0}>
      <Mono size={28} color={MUTED}>similarity</Mono><Txt size={88} font={MONO} w={700} color={AMBER}>0.96</Txt><Mono size={22} color={DIM}>example</Mono>
      <Appear t0={u0}><Txt size={38} w={700} color={RED} style={{marginTop: 40, whiteSpace: 'normal', lineHeight: 1.15}}>opposite meaning</Txt></Appear></Panel>
    <At x={70} y={1170}><Appear t0={u0 + 0.4}><Txt size={30} w={500} color={MUTED}>a 0.95 threshold would serve the <span style={{color: RED}}>wrong answer</span></Txt></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 13. tune (101.6 - 104.0)
const Tune: React.FC = () => {
  const t = useT(); const x = t < 102.0 ? 0 : t < 102.9 ? 0.78 * Easing.inOut(Easing.cubic)(clamp((t - 102.0) / 0.9)) : t < 103.4 ? lerp(0.78, 0.55, ease(t, 102.9, 0.4)) : lerp(0.55, 0.66, ease(t, 103.4, 0.4));
  return <>
    <Head t0={101.7} label="FIX 1" title="Tune the threshold carefully" size={60} />
    <Panel x={70} y={420} w={940} h={480} t0={101.75}>
      <Mono size={30} color={MUTED}>threshold</Mono>
      <div style={{position: 'relative', marginTop: 70}}><Bar v={1} w={880} h={36} grad={`linear-gradient(90deg, ${RED}, ${AMBER} 55%, ${GREEN})`} />
        <div style={{position: 'absolute', left: x * 806, top: -22, width: 80, height: 80, borderRadius: 40, background: '#fff', boxShadow: '0 0 0 9px rgba(255,255,255,.15), 0 0 30px rgba(255,255,255,.55)'}} /></div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 60}}><Mono size={28} color={RED}>too low: wrong hits</Mono><Mono size={28} color={AMBER}>too high: few hits</Mono></div>
      <Mono size={24} color={DIM} style={{marginTop: 40}}>tune it on your real queries</Mono>
    </Panel>
  </>;
};

// ------------------------------------------------------------------ 14. user-specific (104.0 - 108.8)
const UserSpecific: React.FC = () => {
  const t = useT(); const c0 = T('cache', 106) - 0.1, x0 = T('nahi', 106.7), r0 = T('real-time');
  return <>
    <Head t0={104.1} label="FIX 2" title="Skip user-specific questions" size={60} />
    <At x={70} y={380}><Appear t0={104.2}><Bubble size={44}>Where is <span style={{color: AMBER}}>my</span> order?</Bubble></Appear></At>
    <At x={640} y={398}><Appear t0={104.6}><Tag color={AMBER} icon="user">user-specific</Tag></Appear></At>
    <Panel x={70} y={600} w={430} h={400} t0={c0}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 20}}><RedisTile s={130} dim /><Txt size={34} font={MONO} w={700} color={MUTED}>CACHE</Txt>
        <Appear t0={x0}><Tag color={RED} icon="x-circle">don't store</Tag></Appear></div></Panel>
    <Panel x={580} y={600} w={430} h={400} t0={r0 - 0.2} glow={GREEN}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 20}}>
        <div style={{width: 130, height: 130, borderRadius: 32, background: `${GREEN}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="database" size={80} color={GREEN} /></div>
        <Txt size={34} font={MONO} w={700} color={GREEN}>LIVE LOOKUP</Txt><Appear t0={r0 + 0.2}><Tag color={GREEN} icon="lightning">real-time</Tag></Appear></div></Panel>
  </>;
};

// ------------------------------------------------------------------ 15. TTL + invalidation (110.8 - 116.9)
const ROWS = ['"how do i get a refund?"', '"shipping time?"', '"reset password"'];
const Ttl: React.FC = () => {
  const t = useT(); const ch = T('change', 111), sv = T('serve', 112.8), g0 = T('galat'), inv = T('invalidation', 115);
  const gone = ease(t, inv + 0.3, 0.45);
  return <>
    <Head t0={110.9} label="FIX 3" title="TTL + cache invalidation" size={62} />
    <Panel x={70} y={360} w={940} h={470} t0={110.9}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}><Mono size={26} color={MUTED}>cache entries</Mono><div style={{display: 'flex', alignItems: 'center', gap: 8}}><Icon name="clock" size={30} color={AQUA} /><Mono size={26} color={AQUA}>TTL</Mono></div></div>
      {ROWS.map((r, i) => { const stale = i === 0 && t > sv; const ttl = [1, 0.75, 0.55][i] - (t - 110.9) * [0.06, 0.09, 0.08][i];
        return <div key={r} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, height: 90, padding: '0 22px', borderRadius: 18,
          border: `2px solid ${stale && t > g0 ? RED : 'rgba(255,255,255,.1)'}`, opacity: i === 0 ? 1 - gone : 1, transform: i === 0 ? `translateX(${gone * 160}px)` : undefined}}>
          <Mono size={28}>{r}</Mono>{stale ? <Tag color={RED} size={22}>STALE</Tag> : <Bar v={ttl} w={200} h={14} color={AQUA} />}</div>; })}
    </Panel>
    <Panel x={70} y={870} w={450} h={230} t0={T('policy', 110.7)}>
      <Mono size={26} color={MUTED}>Refund policy</Mono>
      <Txt size={52} font={MONO} w={700} color={t > ch ? AMBER : WHITE} style={{marginTop: 22}}>{t > ch ? 'v2 · updated' : 'v1'}</Txt></Panel>
    <Panel x={560} y={870} w={450} h={230} t0={inv - 0.2} glow={AQUA}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name="trash" size={36} color={AQUA} /><Txt size={30} w={700} color={AQUA}>cache invalidation</Txt></div>
      <Txt size={30} w={500} style={{marginTop: 22, whiteSpace: 'normal'}}>clear entries when the data changes</Txt></Panel>
    <Note x={70} y={1140}>TTL = entries expire on their own · invalidation = clear on change</Note>
  </>;
};

// ------------------------------------------------------------------ 16. takeaway (118.5 - 120.4) + 17. summary (120.4 - 124.6)
const Takeaway: React.FC = () => {
  const t = useT(); const m0 = T('meaning', 119.5);
  return <>
    <Head t0={118.6} label="THE TAKEAWAY" title="The cache key is…" />
    <Panel x={70} y={420} w={940} h={190} t0={118.7} style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <Icon name="x-circle" size={60} color={RED} /><Txt size={56} w={700} color={MUTED} style={{textDecoration: 'line-through', textDecorationColor: RED, textDecorationThickness: 6}}>not the text</Txt></Panel>
    <Panel x={70} y={660} w={940} h={190} t0={m0 - 0.1} glow={AQUA} style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <Icon name="check-circle" size={60} color={AQUA} /><Txt size={56} w={700}>it's the <span style={{color: AQUA}}>meaning</span></Txt></Panel>
  </>;
};
const Summary: React.FC = () => <>
  <Head t0={120.45} label="RECAP" title="Caching for AI chatbots" />
  {[['Semantic caching', T('Semantic', 120)], ['Similarity threshold', T('similarity', 121)], ['Careful invalidation', T('careful', 122)]].map(([s, t0], i) =>
    <Panel key={s as string} x={70} y={400 + i * 190} w={940} h={160} t0={(t0 as number) - 0.1} glow={AQUA} style={{display: 'flex', alignItems: 'center', gap: 30}}>
      <Txt size={36} font={MONO} w={700} color={AQUA}>0{i + 1}</Txt><Txt size={50} w={700}>{s}</Txt></Panel>)}
</>;

export const scenes = [
  {a: 5.3, b: 14.4, el: NormalCache}, {a: 16.9, b: 25.4, el: SupportBot}, {a: 26.8, b: 29.9, el: Loop}, {a: 29.9, b: 41.3, el: ExactMatch},
  {a: 42.6, b: 48.2, el: Thousand}, {a: 49.4, b: 52.3, el: Semantic}, {a: 52.3, b: 58.8, el: Embedding}, {a: 60.0, b: 68.1, el: VectorSpace},
  {a: 68.1, b: 74.2, el: Threshold}, {a: 76.1, b: 85.3, el: Race}, {a: 86.6, b: 91.3, el: Bloom}, {a: 92.6, b: 101.6, el: Cancel},
  {a: 101.6, b: 104.0, el: Tune}, {a: 104.0, b: 108.8, el: UserSpecific}, {a: 110.8, b: 116.9, el: Ttl}, {a: 118.5, b: 120.4, el: Takeaway},
  {a: 120.4, b: 124.6, el: Summary},
];
void [SANS, BLUE, WHITE, Note];
