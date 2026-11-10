// AI System Design Ep 2: why normal rate limiting fails for LLM APIs. Theme: ember-ops (dark, orange, white).
// Hard cuts between the speaker and full-screen pages. Article screenshots: TrueFoundry, "API Rate Limiting for LLMs:
// Count Tokens, Not Requests" (taken in his browser). Token counts, prices, budgets and timings are illustrative.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, lerp, ease, useT} from './core';
import {Config, Head, Panel, Tag, Bar, Gauge, Bucket, Node, Wire, Browser, Icon, At, Center, Appear, PopIn, Txt,
  ORANGE, AMBER, WHITE, MUTED, DIM, RED, GREEN, EDGE, PANEL, BG, SANS, MONO} from './theme/kit';
import data from './data.json';

const END = (data as any).duration;
const ws = (data as any).pages.flatMap((p: any) => p.words);
const T = (w: string, n = 1) => { let c = 0; for (const x of ws) if (x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w) { c++; if (c === n) return x.t; } return 0; };
const URL = 'truefoundry.com/blog/llm-token-rate-limiting-budgets';
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export const cfg: Config = {
  cuts: [
    {a: 0, b: 5.0, m: 'talk'},
    {a: 5.0, b: 22.6, m: 'page'},
    {a: 22.6, b: 24.4, m: 'talk'},
    {a: 24.4, b: 49.0, m: 'page'},
    {a: 49.0, b: 53.4, m: 'talk'},
    {a: 53.4, b: 92.4, m: 'page'},
    {a: 92.4, b: 99.2, m: 'talk'},
    {a: 99.2, b: 120.0, m: 'page'},
    {a: 120.0, b: END + 1, m: 'talk'},
  ],
};

// ------------------------------------------------------------------ hook on the talk shot
const TITLE = 'Why normal rate limiting fails for LLM APIs';
const LOG: [string, string, number][] = [['200 OK', GREEN, 2.0], ['200 OK', GREEN, 2.5], ['200 OK', GREEN, 3.0], ['429 Too Many Requests', ORANGE, 3.6]];
const Hook: React.FC = () => {
  const t = useT(); if (t > 5.05) return null; const out = 1 - ease(t, 4.75, 0.25);
  return <div style={{opacity: out}}>
    <Center y={120}><PopIn t0={0.1}><div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, background: 'rgba(11,11,13,.82)', border: `2px solid ${ORANGE}`}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: ORANGE, boxShadow: `0 0 16px ${ORANGE}`}} />
      <Txt size={30} font={MONO} w={700} color={WHITE} style={{letterSpacing: 2}}>AI SYSTEM DESIGN</Txt>
      <div style={{padding: '4px 14px', borderRadius: 10, background: ORANGE}}><Txt size={30} font={MONO} w={700} color={BG}>EP 02</Txt></div></div></PopIn></Center>
    <Center y={220}><Appear t0={1.8}><div style={{padding: '20px 28px', borderRadius: 24, background: 'rgba(11,11,13,.86)', borderLeft: `8px solid ${ORANGE}`}}>
      <Txt size={44} w={800} style={{letterSpacing: -0.8}}>{TITLE}</Txt></div></Appear></Center>
    <div style={{position: 'absolute', left: 70, top: 360, padding: '16px 22px', borderRadius: 18, background: 'rgba(11,11,13,.8)', border: `1.5px solid ${EDGE}`}}>
      {LOG.map(([s, c, t0], i) => t < t0 ? null : <div key={i} style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: c, lineHeight: 1.5, opacity: ease(t, t0, 0.15)}}>{'> POST /v1/chat  '}{s}</div>)}
    </div>
  </div>;
};
const Outro: React.FC = () => {
  const t = useT(); if (t < 120.0) return null;
  return <Center y={200}><PopIn t0={120.3}><div style={{padding: '20px 30px', borderRadius: 26, background: 'rgba(11,11,13,.86)', border: `2px solid ${ORANGE}`, display: 'flex', alignItems: 'center', gap: 16}}>
    <Icon name="coins" size={46} color={ORANGE} /><Txt size={44} w={800}>Count tokens, not requests</Txt></div></PopIn></Center>;
};
cfg.overlays = [Hook, Outro];

// ------------------------------------------------------------------ 1. classic rate limiting (5.0 - 22.6)
const Classic: React.FC = () => {
  const t = useT(); const s0 = T('100'), b0 = T('but'), h0 = T('hi', 2), p0 = T('300'), d0 = T('dono');
  const used = t < s0 ? 0 : Math.min(100, Math.floor((t - s0) * 30));
  return <>
    <Head t0={5.1} label="NORMAL APIS" title="100 requests / min / user" size={64} />
    <Panel x={70} y={340} w={940} h={300} t0={5.4}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="user" size={44} color={ORANGE} /><Txt size={32} w={700}>user_42</Txt><div style={{marginLeft: 'auto'}}><Tag size={22} solid={false}>fixed window: 60 s</Tag></div></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: 6, marginTop: 26}}>
        {Array.from({length: 100}, (_, i) => <div key={i} style={{height: 22, borderRadius: 5, background: i < used ? ORANGE : '#26262C'}} />)}</div>
      <Txt size={24} font={MONO} w={700} color={MUTED} style={{marginTop: 18}}>{used} / 100 requests this minute</Txt>
    </Panel>
    <At x={70} y={700}><Appear t0={b0}><Txt size={30} font={MONO} w={700} color={ORANGE}>BUT WITH AN LLM API</Txt></Appear></At>
    <Panel x={70} y={760} w={450} h={470} t0={h0 - 0.2}>
      <Txt size={22} font={MONO} w={700} color={MUTED}>REQUEST A</Txt>
      <div style={{marginTop: 18, padding: '16px 20px', borderRadius: 18, background: '#24242A', display: 'inline-block'}}><Txt size={40} w={700}>"Hi"</Txt></div>
      <Appear t0={d0}><div style={{marginTop: 30}}><Txt size={26} font={MONO} w={500} color={MUTED}>requests: 1</Txt><Txt size={26} font={MONO} w={500} color={MUTED}>tokens: ~1</Txt><Txt size={30} w={800} color={GREEN} style={{marginTop: 10}}>cost: tiny</Txt></div></Appear>
    </Panel>
    <Panel x={560} y={760} w={450} h={470} t0={p0 - 0.2}>
      <Txt size={22} font={MONO} w={700} color={MUTED}>REQUEST B</Txt>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}><Icon name="file-pdf" size={60} color={ORANGE} /><div><Txt size={30} w={700}>300-page PDF</Txt><Txt size={22} font={MONO} w={500} color={MUTED}>"Summarize this PDF"</Txt></div></div>
      <Appear t0={d0}><div style={{marginTop: 30}}><Txt size={26} font={MONO} w={500} color={MUTED}>requests: 1</Txt><Txt size={26} font={MONO} w={500} color={MUTED}>tokens: ~150,000</Txt><Txt size={30} w={800} color={ORANGE} style={{marginTop: 10}}>cost: huge</Txt></div></Appear>
    </Panel>
    <Center y={1290}><Appear t0={d0 + 0.6}><Tag size={30} icon="scales">same request count, very different cost</Tag></Appear></Center>
    <At x={70} y={1390}><Txt size={20} font={MONO} w={500} color={DIM}>token counts are illustrative</Txt></At>
  </>;
};

// ------------------------------------------------------------------ 2. tokens decide cost (24.4 - 34.6)
const Article1: React.FC = () => <>
  <Head t0={24.5} label="FROM THE ARTICLE" title="Count tokens, not requests" size={62} />
  <Browser x={60} y={330} w={960} src="tf_rpm.jpg" t0={24.6} url={URL} crop={[100, 760]} hl={[38, 355, 722, 100, 25.4]} />
</>;
const Gpu: React.FC = () => {
  const t = useT(); const h0 = T('hi', 4), p0 = T('pdf', 3), g0 = T('gpu');
  return <>
    <Head t0={28.3} label="LOAD" title="The GPU feels the tokens" size={66} />
    <Panel x={70} y={340} w={940} h={340} t0={h0 - 0.2}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Txt size={34} w={700}>"Hi"</Txt><Tag size={22} solid={false}>~1 token</Tag></div>
      <div style={{marginTop: 26}}><Bar label="GPU work" v={0.03 * ease(t, g0, 0.6)} value="tiny" w={880} color={GREEN} /></div>
      <div style={{display: 'flex', gap: 8, marginTop: 24}}><div style={{width: 46, height: 46, borderRadius: 10, background: GREEN}} /></div>
    </Panel>
    <Panel x={70} y={720} w={940} h={560} t0={p0 - 0.2}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="file-pdf" size={44} color={ORANGE} /><Txt size={34} w={700}>300-page PDF</Txt><Tag size={22} solid={false}>~150,000 tokens</Tag></div>
      <div style={{marginTop: 26}}><Bar label="GPU work" v={0.97 * ease(t, g0, 1.0)} value="heavy" w={880} /></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 24}}>{Array.from({length: 120}, (_, i) => <div key={i} style={{width: 46, height: 22, borderRadius: 5, background: ORANGE, opacity: ease(t, p0 + i * 0.012, 0.15)}} />)}</div>
    </Panel>
  </>;
};

// ------------------------------------------------------------------ 3. RPM + TPM, input vs output (34.6 - 49.0)
const Limits: React.FC = () => {
  const t = useT(); const r0 = T('rpm'), p0 = T('tpm'), k0 = T('kuch'), o0 = T('kyunki'), a0 = T('aware');
  const rpm = 0.42 + 0.03 * Math.sin(t * 2), tpm = 0.88 + 0.04 * Math.sin(t * 3);
  return <>
    <Head t0={34.8} label="WHAT PROVIDERS DO" title="Two limits: RPM and TPM" size={64} />
    {t > r0 - 0.2 && <Gauge x={90} y={350} r={140} v={rpm * ease(t, r0, 0.8)} label="RPM · requests / min" value={`${Math.round(rpm * 500)}`} color={AMBER} />}
    {t > p0 - 0.2 && <Gauge x={560} y={350} r={140} v={tpm * ease(t, p0, 0.8)} label="TPM · tokens / min" value={`${Math.round(tpm * 200)}K`} />}
    <Panel x={70} y={770} w={940} h={330} t0={k0 - 0.2}>
      <Txt size={22} font={MONO} w={700} color={MUTED}>SOME PROVIDERS SPLIT IT</Txt>
      <div style={{display: 'flex', gap: 30, marginTop: 24}}>
        <div style={{flex: 1}}><Bar label="input tokens / min" v={0.55} value="limit A" w={420} color={AMBER} /></div>
        <div style={{flex: 1}}><Bar label="output tokens / min" v={0.7} value="limit B" w={420} /></div>
      </div>
      <Appear t0={o0}><div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 30}}><Icon name="currency-dollar" size={40} color={ORANGE} /><Txt size={30} w={700}>output tokens cost more to generate</Txt></div></Appear>
    </Panel>
    <Center y={1160}><Appear t0={a0 - 0.3}><Tag size={34} icon="coins">Token-aware rate limiting</Tag></Appear></Center>
    <At x={70} y={1260}><Txt size={20} font={MONO} w={500} color={DIM}>numbers are illustrative</Txt></At>
  </>;
};

// ------------------------------------------------------------------ 4. the problem + reservation and reconciliation (53.4 - 92.4)
const CAP = 10000;
const Journey: React.FC = () => {
  const t = useT();
  const m0 = 53.5, q0 = T('to', 3) || 57.0, sol = T('reservation'), r0 = T('request', 3), in0 = T('input', 2), mx = T('max'), ex = T('for', 1) || 69.2,
    n1 = T('1000'), n2 = T('2000'), n3 = T('3000'), rs = T('reservation', 2), g5 = T('500'), n15 = T('1500'), rel = T('release'), rc = T('reconciliation', 2);
  const phase = t < sol - 0.2 ? 'problem' : 'solve';
  // bucket math (illustrative): free tokens out of CAP
  const reserved = t < n3 ? 0 : t < rel ? 3000 * ease(t, n3, 0.6) : lerp(3000, 1500, ease(t, rel, 0.8));
  const free = (CAP - 4000 - reserved) / CAP; // 4000 already used by other requests
  const outTok = t < g5 ? 0 : Math.min(500, Math.round((t - g5) * 700));
  return <>
    <Head t0={53.5} label="THE CATCH" title={phase === 'problem' ? 'Output size is unknown' : 'Reserve, then reconcile'} size={64} />
    {/* request card */}
    <Panel x={60} y={330} w={560} h={360} t0={m0 + 0.2}>
      <Txt size={22} font={MONO} w={700} color={MUTED}>INCOMING REQUEST</Txt>
      <div style={{marginTop: 22}}><Bar label="input tokens" v={t > in0 ? 0.33 : 0} value={t > in0 ? '1,000' : 'counting'} w={500} color={AMBER} /></div>
      <div style={{marginTop: 26}}><Bar label="output tokens" v={t > mx ? 0.66 : 0} value={t > mx ? 'max 2,000' : '???'} w={500} /></div>
      <Appear t0={n1}><Txt size={24} font={MONO} w={700} color={WHITE} style={{marginTop: 26}}>1,000 + 2,000 = <span style={{color: ORANGE}}>3,000</span></Txt></Appear>
    </Panel>
    {/* bucket */}
    <At x={700} y={330}><Txt size={22} font={MONO} w={700} color={MUTED}>TOKEN BUCKET</Txt></At>
    <Bucket x={700} y={380} w={300} h={420} free={free} reserved={reserved / CAP} label={`free: ${fmt(free * CAP)}`} />
    <At x={700} y={850}><Appear t0={q0}><Txt size={24} font={MONO} w={700} color={ORANGE}>{t < n3 ? 'how much to reserve?' : t < rel ? 'reserved: 3,000' : '1,500 released back'}</Txt></Appear></At>
    {/* LLM */}
    <Node x={60} y={760} w={560} icon="cpu" label="LLM" sub={t < g5 ? 'generating...' : `output: ${outTok} tokens`} t0={m0 + 0.4} hot={t > g5 && t < n15} />
    <Wire x1={340} y1={690} x2={340} y2={760} t0={rs} packets={[rs + 0.2]} />
    {/* ledger */}
    <Panel x={60} y={920} w={960} h={330} t0={sol - 0.1}>
      {[['1  reserve on arrival', 'input + max output = 3,000', n3, ORANGE, 'Token reservation', rs],
        ['2  measure actual', '1,000 in + 500 out = 1,500', n15, AMBER, '', 0],
        ['3  release the rest', '3,000 - 1,500 = 1,500 back', rel, GREEN, 'Reconciliation', rc]].map(([a, b, t0, c, tag, tt], i) =>
        <Appear key={a as string} t0={(t0 as number) - 0.1}><div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: i ? 18 : 0}}>
          <div style={{width: 14, height: 60, borderRadius: 7, background: c as string}} />
          <div><Txt size={30} w={700}>{a}</Txt><Txt size={22} font={MONO} w={500} color={MUTED}>{b}</Txt></div>
          {tag && t > (tt as number) - 0.2 && <div style={{marginLeft: 'auto'}}><Tag size={22} color={c as string}>{tag}</Tag></div>}
        </div></Appear>)}
    </Panel>
    <At x={60} y={1290}><Txt size={20} font={MONO} w={500} color={DIM}>bucket size and counts are illustrative</Txt></At>
    {void ex}
  </>;
};

// ------------------------------------------------------------------ 5. budget limiting (99.2 - 109.6)
const Article2: React.FC = () => <>
  <Head t0={99.3} label="ONE MORE LAYER" title="Budget limiting" />
  <Browser x={60} y={330} w={960} src="tf_controls.jpg" t0={99.4} url={URL} crop={[90, 700]} hl={[40, 492, 720, 82, 100.0]} />
</>;
const BUD: [string, string, number, number][] = [['team: search', 'gpt model · $$ per token', 0.62, 0], ['team: support', 'small model · $ per token', 0.35, 0], ['user_42', 'reasoning model · $$$ per token', 1.0, 1]];
const Budget: React.FC = () => {
  const t = useT(); const b0 = T('budget', 3), m0 = T('models');
  return <>
    <Head t0={101.6} label="FINANCIAL CONTROL" title="Daily budget per user / team" size={58} />
    {BUD.map(([n, s, v, over], i) => { const k = ease(t, 101.9 + i * 0.3, 1.4); const vv = over ? Math.min(1, ease(t, 102.2, 4.6)) : v * k;
      return <Panel key={n} x={70} y={340 + i * 230} w={940} h={200} t0={101.8 + i * 0.25}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name={i === 2 ? 'user' : 'users-three'} size={40} color={ORANGE} /><Txt size={30} w={700}>{n}</Txt>
          <div style={{marginLeft: 'auto'}}><Txt size={22} font={MONO} w={500} color={MUTED}>{t > m0 ? s : ''}</Txt></div></div>
        <div style={{marginTop: 22}}><Bar label="spent today" v={vv} value={`$${(vv * 5).toFixed(2)} / $5.00`} w={880} color={vv >= 0.999 ? RED : ORANGE} /></div>
      </Panel>; })}
    {t > b0 && <Center y={1060}><PopIn t0={b0 + 0.2}><Tag size={32} color={RED} icon="prohibit">budget over: request blocked</Tag></PopIn></Center>}
    <At x={70} y={1160}><Txt size={20} font={MONO} w={500} color={DIM}>budgets are illustrative</Txt></At>
  </>;
};

// ------------------------------------------------------------------ 6. 429 + Retry-After + backoff (109.6 - 120.0)
const Limit429: React.FC = () => {
  const t = useT(); const c0 = T('429'), r0 = T('retryafter') || 113.4, b0 = T('backoff');
  const tries: [number, string][] = [[0, '1 s'], [1, '2 s'], [2, '4 s'], [3, '8 s']]; const bt = b0 - 1.2;
  return <>
    <Head t0={109.7} label="WHEN THE LIMIT IS HIT" title="429 + Retry-After" />
    <Panel x={70} y={340} w={940} h={330} t0={c0 - 0.3} style={{fontFamily: MONO}}>
      <Txt size={36} font={MONO} w={700} color={ORANGE}>HTTP/1.1 429 Too Many Requests</Txt>
      <Appear t0={r0}><Txt size={32} font={MONO} w={500} color={WHITE} style={{marginTop: 18}}>Retry-After: 12</Txt></Appear>
      <Appear t0={r0 + 0.5}><Txt size={26} font={MONO} w={500} color={MUTED} style={{marginTop: 14}}>{'{ "error": "rate_limit_exceeded" }'}</Txt></Appear>
    </Panel>
    <At x={70} y={730}><Appear t0={bt - 0.2}><Txt size={24} font={MONO} w={700} color={MUTED}>RETRY WITH BACKOFF</Txt></Appear></At>
    {tries.map(([i, s]) => { const x = 70 + i * 240; const t0 = bt + i * 0.3; return t < t0 ? null : <React.Fragment key={i}>
      <PopIn t0={t0} style={{position: 'absolute', left: x, top: 790}}><div style={{width: 200, height: 120, borderRadius: 20, background: i === 3 ? GREEN : PANEL, border: `2px solid ${i === 3 ? GREEN : EDGE}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Txt size={22} font={MONO} w={500} color={i === 3 ? BG : MUTED}>wait</Txt><Txt size={38} w={800} color={i === 3 ? BG : WHITE}>{s}</Txt></div></PopIn>
    </React.Fragment>; })}
    <At x={70} y={950}><Appear t0={bt + 1.1}><Tag size={26} solid={false} color={GREEN} icon="check-circle">retry succeeds</Tag></Appear></At>
    <At x={70} y={1040}><Txt size={20} font={MONO} w={500} color={DIM}>values are illustrative</Txt></At>
  </>;
};
const Article3: React.FC = () => <>
  <Head t0={115.0} label="FROM THE ARTICLE" title="What to do when a limit is hit" size={56} />
  <Browser x={60} y={330} w={960} src="tf_429.jpg" t0={115.1} url={URL} crop={[95, 590]} hl={[40, 246, 720, 80, 115.7]} />
</>;

export const scenes = [
  {a: 5.0, b: 22.6, el: Classic},
  {a: 24.4, b: 28.2, el: Article1},
  {a: 28.2, b: 34.6, el: Gpu},
  {a: 34.6, b: 49.0, el: Limits},
  {a: 53.4, b: 92.4, el: Journey},
  {a: 99.2, b: 101.5, el: Article2},
  {a: 101.5, b: 109.6, el: Budget},
  {a: 109.6, b: 115.0, el: Limit429},
  {a: 115.0, b: 117.4, el: Article3},
  {a: 117.4, b: 120.0, el: Limit429},
];
void [Img, staticFile, clamp, SANS];
