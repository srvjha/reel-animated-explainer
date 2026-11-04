// Functional vs non-functional requirements. Theme: night-blueprint. Not part of a series.
// Hard cuts: talk = speaker full screen with his real background; page = full-screen black dotted blueprint pages.
// On-screen text is English only. Numbers (ms, %, users) are illustrative.
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Head, BBox, Wire, Tag, Item, Gauge, Icon, At, Center, Appear, PopIn, Txt,
  WHITE, MUTED, FAINT, LINE, CYAN, AMBER, RED, GREEN, BG, MONO, SANS} from './theme/kit';
import data from './data.json';

const ws = (data as any).pages.flatMap((p: any) => p.words);
const T = (w: string, n = 1) => { let c = 0; for (const x of ws) if (x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w) { c++; if (c === n) return x.t; } return 0; };
const END = data.duration;

export const cfg: Config = {
  cuts: [
    {a: 0, b: 6.3, m: 'talk'},
    {a: 6.3, b: 14.3, m: 'page'},
    {a: 14.3, b: 17.2, m: 'talk'},
    {a: 17.2, b: 34.6, m: 'page'},
    {a: 34.6, b: 37.0, m: 'talk'},
    {a: 37.0, b: 58.4, m: 'page'},
    {a: 58.4, b: 62.0, m: 'talk'},
    {a: 62.0, b: 71.0, m: 'page'},
    {a: 71.0, b: 72.8, m: 'talk'},
    {a: 72.8, b: 80.0, m: 'page'},
    {a: 80.0, b: 84.8, m: 'talk'},
    {a: 84.8, b: 99.2, m: 'page'},
    {a: 99.2, b: END + 1, m: 'talk'},
  ],
};

// ------------------------------------------------------------------ scenes
const Types: React.FC = () => (
  <>
    <Head t0={6.35} label="SYSTEM DESIGN · STEP 0" title="Requirements" />
    <Center y={330}><Appear t0={T('type')}><Tag color={WHITE} size={30}>2 types</Tag></Appear></Center>
    <BBox x={60} y={450} w={460} h={560} t0={T('functional')} color={CYAN} label="FUNCTIONAL" fill>
      <Icon name="gear" size={90} color={CYAN} />
      <Txt size={50} w={800} style={{marginTop: 20}}>What</Txt>
      <Txt size={50} w={800} color={CYAN}>it does</Txt>
      <Appear t0={T('functional', 2)}><Txt size={28} w={400} color={MUTED} style={{marginTop: 26}}>features, user actions</Txt></Appear>
    </BBox>
    <BBox x={560} y={450} w={460} h={560} t0={T('nonfunctional')} color={AMBER} label="NON-FUNCTIONAL" fill>
      <Icon name="gauge" size={90} color={AMBER} />
      <Txt size={50} w={800} style={{marginTop: 20}}>How well</Txt>
      <Txt size={50} w={800} color={AMBER}>it works</Txt>
      <Appear t0={T('kaise')}><Txt size={28} w={400} color={MUTED} style={{marginTop: 26}}>speed, uptime, scale</Txt></Appear>
    </BBox>
  </>
);

const Functional: React.FC = () => {
  const steps = [
    {icon: 'magnifying-glass', text: 'Search restaurants', at: T('search')},
    {icon: 'shopping-cart', text: 'Create order', at: T('create')},
    {icon: 'receipt', text: 'Place order', at: T('place')},
    {icon: 'map-pin', text: 'Track order', at: T('track')},
    {icon: 'credit-card', text: 'Make payment', at: T('payment')},
  ];
  return <>
    <Head t0={17.25} label="EXAMPLE · FOOD DELIVERY APP" title="Functional" />
    <At x={90} y={330}><Appear t0={T('kya', 2)}><Txt size={34} w={400} color={MUTED}>What will the system do?</Txt></Appear></At>
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <BBox x={90} y={420 + i * 190} w={720} h={140} t0={s.at - 0.2} color={CYAN} d={0.4} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px'}}>
          <Txt size={30} w={600} font={MONO} color={CYAN}>0{i + 1}</Txt>
          <Icon name={s.icon} size={58} color={CYAN} />
          <Txt size={42} w={700}>{s.text}</Txt>
        </BBox>
        {i < 4 && <Wire x1={450} y1={562 + i * 190} x2={450} y2={608 + i * 190} t0={steps[i + 1].at - 0.3} color={FAINT} />}
      </React.Fragment>
    ))}
    <At x={850} y={600}><Appear t0={T('features')}><div style={{writingMode: 'vertical-rl', fontFamily: MONO, fontWeight: 600, fontSize: 34, color: CYAN, letterSpacing: 6}}>= FEATURES</div></Appear></At>
    <Center y={1400}><PopIn t0={T('functional', 4)}><Tag color={CYAN} solid size={34}>functional requirements</Tag></PopIn></Center>
  </>;
};

const Speed: React.FC = () => (
  <>
    <Head t0={37.05} label="NON-FUNCTIONAL · QUALITY" title="How well?" color={AMBER} />
    <Gauge cx={300} cy={620} r={190} t0={T('millisecond')} to={0.25} label="search latency" value="120 ms" />
    <At x={130} y={700}><Appear t0={T('fast')}><div style={{display: 'flex', gap: 14}}><Tag color={GREEN} size={24}>fast</Tag><Tag color={RED} size={24}>slow?</Tag></div></Appear></At>
    <Gauge cx={780} cy={620} r={190} t0={T('available') - 0.6} to={0.99} color={GREEN} label="availability" value="99.9%" />
    <BBox x={90} y={830} w={900} h={420} t0={T('latency') - 0.2} color={AMBER} label="ALSO CHECK">
      <Item t0={T('response') - 0.3} icon="lightning" text="Fast response time" color={AMBER} />
      <Item t0={T('latency')} icon="timer" text="No latency spikes" color={AMBER} />
      <Item t0={T('health')} icon="heartbeat" text="Regular health checks" color={AMBER} />
    </BBox>
  </>
);

const Scale: React.FC = () => {
  const t = useT(); const k = ease(t, T('traffic'), 3.6);
  const pts = Array.from({length: 40}).map((_, i) => { const x = i / 39; const spike = Math.exp(-((x - 0.62) ** 2) / 0.012); return [120 + x * 840, 900 - (60 + 40 * Math.sin(i * 1.3) * 0.3 + spike * 380)]; });
  const n = Math.max(2, Math.floor(k * pts.length));
  return <>
    <Head t0={48.85} label="NON-FUNCTIONAL · SCALE" title="Traffic spikes" color={AMBER} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <line x1={120} y1={900} x2={960} y2={900} stroke={FAINT} strokeWidth={3} />
      <line x1={120} y1={400} x2={120} y2={900} stroke={FAINT} strokeWidth={3} />
      {k > 0 && <polyline points={pts.slice(0, n).map(p => p.join(',')).join(' ')} fill="none" stroke={AMBER} strokeWidth={6} strokeLinejoin="round" />}
    </svg>
    <At x={130} y={360}><Appear t0={T('traffic')}><Txt size={26} w={600} font={MONO} color={MUTED}>users / min</Txt></Appear></At>
    <At x={150} y={440}><PopIn t0={T('lakhs')}><Tag color={AMBER} size={28} icon="users-three">100K+ users</Tag></PopIn></At>
    <At x={150} y={520}><PopIn t0={T('crores')}><Tag color={RED} size={28}>10M+ ?</Tag></PopIn></At>
    <BBox x={90} y={990} w={900} h={300} t0={T('handle') - 0.2} color={AMBER} label="CAN IT HANDLE THIS?">
      <Item t0={T('scaling')} icon="arrows-split" text="Scaling strategy" color={AMBER} />
      <Item t0={T('method')} icon="gear" text="Methods we implement" color={AMBER} />
    </BBox>
  </>;
};

const Arch: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={62.05} label="NON-FUNCTIONAL · HOW WE MEET IT" title="Architecture" color={AMBER} />
    <BBox x={340} y={330} w={400} h={130} t0={T('load')} color={AMBER} style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Icon name="arrows-split" size={56} color={AMBER} /><Txt size={36} w={700}>Load balancer</Txt>
    </BBox>
    {[0, 1, 2].map(i => <BBox key={i} x={110 + i * 300} y={560} w={260} h={130} t0={T('replication') + i * 0.12} color={LINE} style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <Icon name="hard-drives" size={50} color={WHITE} /><Txt size={30} w={600}>server {i + 1}</Txt>
    </BBox>)}
    {[0, 1, 2].map(i => <Wire key={i} x1={540} y1={465} x2={240 + i * 300} y2={555} t0={T('replication') - 0.1} color={FAINT} />)}
    <At x={110} y={720}><Appear t0={T('replication') + 0.3}><Tag color={WHITE} size={24}>replication</Tag></Appear></At>
    <BBox x={110} y={820} w={400} h={130} t0={T('caching')} color={CYAN} style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Icon name="lightning" size={52} color={CYAN} /><Txt size={34} w={700}>Cache</Txt>
    </BBox>
    <BBox x={570} y={820} w={400} h={130} t0={T('caching') + 0.3} color={LINE} style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Icon name="database" size={52} color={WHITE} /><Txt size={34} w={700}>DB + replicas</Txt>
    </BBox>
    <Wire x1={240} y1={695} x2={310} y2={815} t0={T('caching')} color={FAINT} />
    <Wire x1={840} y1={695} x2={770} y2={815} t0={T('caching') + 0.3} color={FAINT} />
    <BBox x={110} y={1040} w={860} h={300} t0={T('performance') - 0.2} color={GREEN} label="PERFORMANCE TRACKING">
      <svg width={800} height={200}>
        <polyline points={Array.from({length: 30}).map((_, i) => `${i * 27},${150 - 40 * Math.sin(i * 0.7 + t * 3) * 0.5 - i * 2}`).join(' ')} fill="none" stroke={GREEN} strokeWidth={5} />
      </svg>
    </BBox>
  </>;
};

const Shape: React.FC = () => {
  const apps = ['App A', 'App B', 'App C'];
  return <>
    <Head t0={72.85} label="HIGH LEVEL" title="Same features?" />
    {apps.map((a, i) => <BBox key={a} x={60 + i * 330} y={350} w={300} h={330} t0={T('multiple') + i * 0.15} color={CYAN} label={a.toUpperCase()}>
      {['search', 'order', 'track', 'pay'].map(f => <Txt key={f} size={30} w={500} font={MONO} color={WHITE} style={{margin: '8px 0'}}>✓ {f}</Txt>)}
    </BBox>)}
    <Center y={720}><Appear t0={T('same')}><Tag color={CYAN} size={30}>functional: often the same</Tag></Appear></Center>
    <BBox x={90} y={850} w={900} h={380} t0={T('nonfunctional', 6) - 0.2} color={AMBER} label="NON-FUNCTIONAL">
      <Txt size={44} w={800}>Targets <span style={{color: AMBER}}>shape</span> the</Txt>
      <Txt size={44} w={800} color={AMBER}>backend architecture</Txt>
      <Appear t0={T('architecture')}><Txt size={28} w={400} color={MUTED} style={{marginTop: 24}}>latency, uptime, scale decide the design</Txt></Appear>
    </BBox>
  </>;
};

const Interview: React.FC = () => {
  const t = useT(); const cap = T('consistency');
  return <>
    <Head t0={84.85} label="IN THE INTERVIEW" title="Ask the right Qs" />
    <BBox x={60} y={330} w={460} h={220} t0={T('functional', 6) - 0.1} color={CYAN} label="FUNCTIONAL">
      <Txt size={34} w={700}>You list them</Txt>
      <Txt size={26} w={400} color={MUTED} style={{marginTop: 10}}>core features first</Txt>
    </BBox>
    <BBox x={560} y={330} w={460} h={220} t0={T('nonfunctional', 7) - 0.1} color={AMBER} label="NON-FUNCTIONAL">
      <Txt size={34} w={700}>Ask questions</Txt>
      <Txt size={26} w={400} color={MUTED} style={{marginTop: 10}}>to the interviewer</Txt>
    </BBox>
    <BBox x={60} y={630} w={960} h={330} t0={T('question') - 0.1} color={AMBER}>
      <Item t0={T('latency', 2)} icon="timer" text="How much latency is allowed?" color={AMBER} size={34} />
      <Item t0={T('users', 2)} icon="users-three" text="How many users to expect?" color={AMBER} size={34} />
      <Item t0={T('scale')} icon="chart-line-up" text="How much scale?" color={AMBER} size={34} />
    </BBox>
    {/* CAP triangle */}
    {t >= cap - 0.2 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d="M 540 1040 L 340 1380 L 740 1380 Z" fill="none" stroke={LINE} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(t, cap - 0.2, 0.6)} />
    </svg>}
    <At x={540 - 110} y={1000}><PopIn t0={cap}><Tag color={CYAN} solid size={28}>Consistency</Tag></PopIn></At>
    <At x={170} y={1395}><PopIn t0={T('availability')}><Tag color={AMBER} solid size={28}>Availability</Tag></PopIn></At>
    <At x={640} y={1395}><PopIn t0={T('cap') - 0.2}><Tag color={WHITE} size={28}>Partition tol.</Tag></PopIn></At>
    <At x={460} y={1230}><Appear t0={T('cap')}><Txt size={46} w={800}>CAP</Txt></Appear></At>
  </>;
};

export const scenes: Scene[] = [
  {a: 6.3, b: 14.3, el: Types},
  {a: 17.2, b: 34.6, el: Functional},
  {a: 37.0, b: 48.8, el: Speed},
  {a: 48.8, b: 58.4, el: Scale},
  {a: 62.0, b: 71.0, el: Arch},
  {a: 72.8, b: 80.0, el: Shape},
  {a: 84.8, b: 99.2, el: Interview},
];
