// How Zomato live order tracking works. Theme: tomato-app. Speaker full screen for the hook, then split:
// explainer panel on top (designed phone flow, diagrams, Pexels stock clips), speaker below with his real background.
// On-screen text English. Order IDs, event IDs, coordinates and ETAs are illustrative.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, lerp, ease, useT} from './core';
import {Config, pop, Head, Card, Tag, Chip, Node, Wire, Phone, Toast, Icon, At, Center, Appear, PopIn, Txt,
  RED, PEACH, INK, GREY, SOFT, LINE, WHITE, GREEN, SANS, MONO} from './theme/kit';
import data from './data.json';

const END = (data as any).duration;

// ------------------------------------------------------------------ hook (full screen, before the split)
const Hook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30; if (t > 3.0) return null;
  const words = (data as any).pages[0].words as {w: string; t: number; e: number}[];
  const lines = [words.slice(0, 3), words.slice(3)];
  return <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
    {lines.map((ln, i) => <div key={i} style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.05; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.05) : 0;
        const isZ = w.w.toLowerCase().startsWith('zomato');
        return <React.Fragment key={j}>
          {isZ && <div style={{width: 78, height: 78, margin: '0 4px 0 8px', transform: `scale(${0.4 + 0.6 * p})`, opacity: shown ? 1 : 0}}><Img src={staticFile('zomato.png')} style={{width: 78, height: 78, borderRadius: 18, boxShadow: '0 0 0 3px rgba(255,255,255,.9)'}} /></div>}
          <span style={{display: 'inline-block', margin: '0 5px', padding: '0 14px', borderRadius: 16, fontFamily: SANS, fontWeight: 800, fontSize: 76, lineHeight: 1.25,
            opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 12}px)`, color: WHITE, background: active ? RED : 'transparent',
            textShadow: active ? 'none' : '0 0 6px rgba(0,0,0,.9), 0 4px 0 rgba(0,0,0,.85), 0 0 28px rgba(0,0,0,.8)'}}>{w.w}</span>
        </React.Fragment>;
      })}
    </div>)}
  </div>;
};

export const cfg: Config = {
  split: 1000, camDy: 780, splitAt: 3.0, capSkip: 2.95,
  clips: [
    {a: 3.0, b: 5.0, src: 'clips/order.mp4', from: 1.5},
    {a: 13.3, b: 16.0, src: 'clips/rider.mp4', from: 1.0},
    {a: 39.6, b: 41.4, src: 'clips/chef.mp4', from: 0.5},
    {a: 65.8, b: 67.7, src: 'clips/riderphone.mp4', from: 0.5},
    {a: 80.4, b: 82.4, src: 'clips/riderphone.mp4', from: 4.0},
    {a: 96.3, b: 100.9, src: 'clips/notif.mp4', from: 1.0},
  ],
  screenOverlays: [Hook],
};

const PushToast: React.FC = () => {
  const t = useT(); if (t < 96.3 || t > 100.9) return null;
  return <Toast x={90} y={110} w={900} t0={97.85} logo="zomato.png" title="Your order is out for delivery" body="Rider is 2.1 km away" />;
};
const ClipTag: React.FC = () => {
  const t = useT();
  const tags: [number, number, string, string][] = [[3.0, 5.0, 'you place an order', 'device-mobile'], [13.3, 16.0, 'what runs behind it?', 'lightning'], [39.6, 41.4, 'how does the state change?', 'cooking-pot'], [65.8, 67.7, 'networks are unreliable', 'wifi-slash'], [80.4, 82.4, 'live rider location', 'map-pin']];
  const c = tags.find(x => t >= x[0] && t < x[1]); if (!c) return null;
  return <At x={50} y={50}><Appear t0={c[0] + 0.15}><Tag icon={c[3]} size={30}>{c[2]}</Tag></Appear></At>;
};
cfg.overlays = [PushToast, ClipTag];

// ------------------------------------------------------------------ 1. designed phone flow (5.0 - 13.3)
const STEPS: [string, number, string][] = [['Order confirmed', 7.0, 'check-circle'], ['Food being prepared', 8.1, 'cooking-pot'], ['Rider reached restaurant', 9.17, 'storefront'], ['Rider on the way', 10.8, 'moped']];
const TrackScreen: React.FC<{mapT0: number; eta?: string; riderK: number; steps?: boolean}> = ({mapT0, eta = '25 min', riderK, steps = true}) => {
  const t = useT();
  const route: [number, number][] = [[310, 110], [170, 110], [170, 200], [60, 200], [60, 290]];
  const seg = (k: number) => { const L = route.length - 1; const u = clamp(k) * L; const i = Math.min(L - 1, Math.floor(u)); const r = u - i; return [lerp(route[i][0], route[i + 1][0], r), lerp(route[i][1], route[i + 1][1], r)]; };
  const [rx, ry] = seg(riderK);
  return <div style={{position: 'absolute', inset: 0, background: WHITE}}>
    <svg width={376} height={340} style={{position: 'absolute', left: 0, top: 0}}>
      <rect width={376} height={340} fill="#F7EFEA" />
      {[60, 170, 310].map(x => <line key={x} x1={x} y1={0} x2={x} y2={340} stroke={WHITE} strokeWidth={14} />)}
      {[110, 200, 290].map(y => <line key={y} x1={0} y1={y} x2={376} y2={y} stroke={WHITE} strokeWidth={14} />)}
      {t > mapT0 && <polyline points={route.map(p => p.join(',')).join(' ')} fill="none" stroke={RED} strokeWidth={6} strokeDasharray="12 8" />}
      <circle cx={60} cy={290} r={14} fill={INK} /><rect x={53} y={283} width={14} height={14} fill={WHITE} />
      <circle cx={310} cy={110} r={16} fill={RED} /><circle cx={310} cy={110} r={6} fill={WHITE} />
      {t > mapT0 && <g transform={`translate(${rx},${ry})`}><circle r={22} fill={WHITE} stroke={RED} strokeWidth={4} /><circle r={9} fill={RED} /></g>}
    </svg>
    <div style={{position: 'absolute', left: 18, right: 18, top: 300, borderRadius: 22, background: WHITE, boxShadow: '0 -6px 20px rgba(0,0,0,.08)', padding: '18px 20px'}}>
      <Txt size={20} font={MONO} w={500} color={GREY}>ARRIVING IN</Txt>
      <Txt size={46} w={800}>{eta}</Txt>
      {steps && <div style={{marginTop: 10}}>{STEPS.map(([l, t0, ic]) => <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, opacity: t >= t0 - 0.1 ? 1 : 0.3}}>
        <div style={{width: 40, height: 40, borderRadius: 20, background: t >= t0 - 0.1 ? RED : LINE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} size={24} color={WHITE} /></div>
        <Txt size={23} w={700} color={t >= t0 - 0.1 ? INK : SOFT}>{l}</Txt></div>)}</div>}
    </div>
  </div>;
};
const FlowPhone: React.FC = () => {
  const t = useT(); const n = STEPS.filter(s => t >= s[1]).length;
  return <>
    <At x={60} y={80}><PopIn t0={5.1}><Img src={staticFile('zomato.png')} style={{width: 120, height: 120, borderRadius: 28, boxShadow: '0 12px 30px rgba(226,55,68,.35)'}} /></PopIn></At>
    <At x={60} y={230}><Appear t0={5.3}><Txt size={40} w={800}>Live order</Txt><Txt size={40} w={800} color={RED}>tracking</Txt></Appear></At>
    <Phone x={340} y={80} w={400} h={850} t0={5.2}><TrackScreen mapT0={10.6} riderK={ease(t, 10.8, 2.6)} /></Phone>
    {STEPS.map(([l, t0], i) => <At key={l} x={780} y={300 + i * 110}><Appear t0={t0}><Tag size={22} solid={i === n - 1}>{['confirmed', 'preparing', 'at restaurant', 'on the way'][i]}</Tag></Appear></At>)}
  </>;
};

// ------------------------------------------------------------------ 2. state machine (16.0 - 39.6)
const STATES: [string, number, string][] = [['Placed', 21.7, 'receipt'], ['Accepted', 22.9, 'storefront'], ['Preparing', 24.09, 'cooking-pot'], ['Rider assigned', 25.5, 'moped'], ['Picked up', 26.5, 'package'], ['On the way', 27.7, 'map-pin'], ['Delivered', 28.4, 'check-circle']];
const EVENTS = ['restaurant accepts', 'cooking starts', 'rider found', 'rider picks up', 'rider leaves', 'rider delivers'];
const StateMachine: React.FC = () => {
  const t = useT(); const cur = STATES.filter(s => t >= s[1]).length - 1;
  return <>
    <Head t0={16.1} label="CONCEPT 1" title="Order state machine" />
    {STATES.map(([l, t0, ic], i) => <At key={l} x={60} y={190 + i * 110}><Appear t0={Math.min(t0, 18.0 + i * 0.12)} dy={10}>
      <Chip label={l} icon={ic} size={28} state={t < 21.6 ? 'todo' : i < cur ? 'done' : i === cur ? (t > 29 ? 'done' : 'now') : 'todo'} /></Appear></At>)}
    {EVENTS.map((e, i) => <React.Fragment key={e}>
      <Wire x1={110} y1={268 + i * 110} x2={110} y2={296 + i * 110} t0={18.2 + i * 0.1} color={SOFT} sw={4} />
      <At x={140} y={266 + i * 110}><Appear t0={33.2 + i * 0.12}><Txt size={19} font={MONO} w={500} color={RED}>on: {e}</Txt></Appear></At>
    </React.Fragment>)}
    <At x={560} y={200}><Appear t0={30.0}><Tag size={24} solid={false}>always exactly one state</Tag></Appear></At>
    <Card x={560} y={300} w={470} t0={35.2} style={{padding: '22px 24px'}}>
      <Txt size={22} font={MONO} w={500} color={GREY}>ALLOWED</Txt>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><Icon name="check-circle" size={40} color={GREEN} /><Txt size={30} w={700}>Picked up → Delivered</Txt></div>
    </Card>
    <Card x={560} y={490} w={470} t0={36.2} style={{padding: '22px 24px'}}>
      <Txt size={22} font={MONO} w={500} color={GREY}>NOT ALLOWED</Txt>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}><Icon name="x-circle" size={40} color={RED} /><Txt size={30} w={700} style={{textDecoration: 'line-through'}}>Accepted → Delivered</Txt></div>
    </Card>
    <At x={560} y={690}><Appear t0={37.6}><Tag size={26} icon="check-circle">no wrong status on screen</Tag></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 3. events + event-driven architecture (41.4 - 65.8)
const Events: React.FC = () => {
  const t = useT();
  const SX = 24, QX = 390, SVX = 750, SW = 340, Y = [230, 420, 610];
  return <>
    <Head t0={41.5} label="CONCEPT 2" title="Every change is an event" />
    <Node x={SX} y={Y[0]} w={SW} icon="storefront" label="Restaurant app" t0={42.8} />
    <Node x={SX} y={Y[1]} w={SW} icon="moped" label="Rider app" t0={45.1} />
    <Node x={SX} y={Y[2]} w={SW} icon="credit-card" label="Payment" t0={51.0} />
    <At x={SX + 10} y={Y[0] + 122}><Appear t0={43.5}><Tag size={20} solid={false}>order_accepted</Tag></Appear></At>
    <At x={SX + 10} y={Y[1] + 122}><Appear t0={45.5}><Tag size={20} solid={false}>picked_up</Tag></Appear></At>
    {t > 52.5 && <div style={{position: 'absolute', left: QX + 20, top: 230, width: 260, height: 490, borderRadius: 28, background: WHITE, border: `3px dashed ${RED}`, opacity: ease(t, 52.6, 0.4), boxSizing: 'border-box', padding: 18}}>
      <Txt size={26} w={800} style={{textAlign: 'center'}}>Message queue</Txt>
      <Txt size={18} font={MONO} w={500} color={GREY} style={{textAlign: 'center'}}>event pipeline</Txt>
      {Array.from({length: 5}, (_, i) => <div key={i} style={{height: 54, borderRadius: 12, marginTop: 14, background: i < Math.floor((t - 52.8) * 2.2) % 6 ? PEACH : '#F7F2F0', border: `2px solid ${LINE}`}} />)}
    </div>}
    {Y.map((y, i) => <Wire key={'i' + i} x1={SX + SW} y1={y + 55} x2={QX + 20} y2={300 + i * 150} t0={52.8 + i * 0.1} packets={[53.4 + i * 0.3, 55.0 + i * 0.3, 57.5 + i * 0.4, 60.2 + i * 0.3]} />)}
    <Node x={SVX} y={Y[0]} w={300} icon="receipt" label="Order service" sub="updates status" t0={54.7} />
    <Node x={SVX} y={Y[1]} w={300} icon="bell" label="Notification" sub="messages you" t0={57.1} />
    <Node x={SVX} y={Y[2]} w={300} icon="chart-bar" label="Analytics" sub="saves data" t0={59.4} />
    {Y.map((y, i) => <Wire key={'o' + i} x1={QX + 280} y1={300 + i * 150} x2={SVX} y2={y + 55} t0={[54.7, 57.1, 59.4][i]} packets={[[55.6, 61.9], [58.0, 62.2], [60.3, 62.5]][i]} />)}
    <Center y={790}><Appear t0={61.8}><Txt size={28} w={700} color={GREY}>each service does its own job</Txt></Appear></Center>
    <Center y={850}><Appear t0={64.2}><Tag size={32} icon="lightning">Event-driven architecture</Tag></Appear></Center>
  </>;
};

// ------------------------------------------------------------------ 4. idempotent consumer (67.7 - 80.4)
const Idem: React.FC = () => {
  const t = useT(); const dupOut = t > 76.3;
  const ev = (y: number, t0: number, dup: boolean) => <Card x={50} y={y} w={420} t0={t0} style={{padding: '18px 22px', border: dup && dupOut ? `3px solid ${RED}` : undefined}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Txt size={30} w={800}>picked_up</Txt>{dup && <Tag size={18}>again</Tag>}</div>
    <Txt size={22} font={MONO} w={500} color={t > 73.2 ? RED : GREY}>id: evt_9f2</Txt>
  </Card>;
  return <>
    <Head t0={67.8} label="CONCEPT 3" title="Same event, twice?" />
    {ev(220, 68.2, false)}
    {ev(400, 69.9, true)}
    <Wire x1={470} y1={290} x2={585} y2={355} t0={68.6} packets={[68.9]} />
    <Wire x1={470} y1={470} x2={585} y2={405} t0={70.2} packets={[70.5]} />
    <Node x={590} y={320} w={420} icon="receipt" label="Order service" sub="consumer" t0={68.0} />
    <Card x={590} y={470} w={420} t0={75.0} style={{padding: '18px 22px'}}>
      <Txt size={22} font={MONO} w={500} color={GREY}>ALREADY PROCESSED IDs</Txt>
      {['evt_7a1', 'evt_9f2'].map((id, i) => <Txt key={id} size={28} font={MONO} w={500} style={{marginTop: 8, color: i === 1 && t > 75.5 ? RED : INK}}>{id}{i === 1 && t > 75.5 ? '  ← seen' : ''}</Txt>)}
    </Card>
    <At x={50} y={600}><Appear t0={70.8} out={73.0}><Tag size={26} icon="x-circle">processed twice = wrong data</Tag></Appear></At>
    <At x={50} y={600}><Appear t0={76.3}><Tag size={26} icon="check-circle" color={GREEN}>duplicate skipped</Tag></Appear></At>
    <Center y={800}><Appear t0={78.4}><Tag size={32} icon="fingerprint">Idempotent consumer</Tag></Appear></Center>
    <At x={50} y={910}><Txt size={20} font={MONO} w={500} color={SOFT}>IDs are illustrative</Txt></At>
  </>;
};

// ------------------------------------------------------------------ 5. location + cache (82.4 - 89.8)
const Location: React.FC = () => {
  const t = useT();
  const pings = [83.4, 85.2, 87.0, 88.8]; const n = pings.filter(p => t >= p + 0.7).length;
  const coords = ['28.6129, 77.2295', '28.6133, 77.2301', '28.6138, 77.2309', '28.6142, 77.2316'];
  return <>
    <Head t0={82.5} label="LIVE LOCATION" title="Latest location in a cache" />
    <Node x={50} y={330} w={330} h={130} icon="moped" label="Rider app" sub="every few seconds" t0={82.6} />
    <Wire x1={380} y1={395} x2={600} y2={395} t0={83.0} color={SOFT} packets={pings} />
    {t > 85.6 && <div style={{position: 'absolute', left: 610, top: 260, width: 420, borderRadius: 26, background: INK, padding: '22px 24px', boxSizing: 'border-box', opacity: ease(t, 85.7, 0.4)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name="lightning" size={36} color={RED} /><Txt size={30} w={800} color={WHITE}>Fast cache</Txt></div>
      <Txt size={22} font={MONO} w={500} color={SOFT} style={{marginTop: 14}}>rider:42 →</Txt>
      <Txt size={28} font={MONO} w={500} color={WHITE}>{coords[Math.max(0, n - 1)]}</Txt>
      <Txt size={20} font={MONO} w={500} color={SOFT} style={{marginTop: 10}}>old value overwritten</Txt>
    </div>}
    <Center y={660}><Appear t0={88.6}><Tag size={30} icon="map-pin">only the latest location matters</Tag></Appear></Center>
    <At x={50} y={910}><Txt size={20} font={MONO} w={500} color={SOFT}>coordinates are illustrative</Txt></At>
  </>;
};

// ------------------------------------------------------------------ 6. open vs closed (89.8 - 96.3)
const TwoWays: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={89.9} label="TWO WAYS" title="App open vs app closed" />
    <Card x={50} y={210} w={470} h={720} t0={91.8} style={{padding: 26}}>
      <Txt size={22} font={MONO} w={500} color={GREY}>APP OPEN</Txt>
      <Txt size={36} w={800}>Live connection</Txt>
      <div style={{position: 'relative', width: 418, height: 520, marginTop: 20, borderRadius: 22, overflow: 'hidden', border: `2px solid ${LINE}`}}>
        <div style={{transform: 'scale(1.1)', transformOrigin: '0 0', position: 'absolute', inset: 0}}><TrackScreen mapT0={92.0} riderK={ease(t, 93.0, 2.5)} steps={false} /></div>
      </div>
    </Card>
    <Card x={560} y={210} w={470} h={720} t0={95.9} style={{padding: 26}}>
      <Txt size={22} font={MONO} w={500} color={GREY}>APP CLOSED</Txt>
      <Txt size={36} w={800}>Push notification</Txt>
    </Card>
  </>;
};

// ------------------------------------------------------------------ 7. ETA (100.9 - 108.3)
const Eta: React.FC = () => {
  const t = useT(); const changed = t > 107.1;
  return <>
    <Head t0={101.0} label="ETA" title="Always recalculated" />
    <Card x={50} y={210} w={470} h={420} t0={101.3} hot style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <Txt size={26} font={MONO} w={500} color={WHITE}>ARRIVING IN</Txt>
      <div style={{position: 'relative', height: 170, width: 400, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: lerp(0, -170, ease(t, 107.1, 0.4)), textAlign: 'center'}}>
          <Txt size={140} w={800} color={WHITE} style={{lineHeight: '170px'}}>25</Txt><Txt size={140} w={800} color={WHITE} style={{lineHeight: '170px'}}>30</Txt></div>
      </div>
      <Txt size={40} w={700} color={WHITE}>minutes</Txt>
    </Card>
    {([['map-pin', 'rider location', 103.5], ['path', 'distance', 104.0], ['traffic-signal', 'traffic', 104.5]] as [string, string, number][]).map(([ic, l, t0], i) =>
      <At key={l} x={570} y={230 + i * 130}><Appear t0={t0}><Tag size={32} icon={ic} solid={i === 2}>{l}</Tag></Appear></At>)}
    <At x={570} y={640}><Appear t0={106.4}><Txt size={30} w={700} color={changed ? RED : GREY}>{changed ? 'traffic got heavier' : 'keeps updating'}</Txt></Appear></At>
  </>;
};

// ------------------------------------------------------------------ 8. recap (108.3 - end)
const RECAP: [string, string, number][] = [['State machine', 'receipt', 110.0], ['Event-driven architecture', 'lightning', 110.68], ['Idempotency', 'fingerprint', 112.0], ['Caching', 'hard-drives', 112.8]];
const Recap: React.FC = () => (
  <>
    <Head t0={108.4} label="RECAP" title="Behind your tracking screen" />
    {RECAP.map(([l, ic, t0], i) => <Card key={l} x={60} y={210 + i * 175} w={960} h={145} t0={t0 - 0.1} hot={i === 3} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px'}}>
      <div style={{width: 84, height: 84, borderRadius: 22, background: i === 3 ? WHITE : PEACH, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} size={54} color={RED} /></div>
      <Txt size={26} font={MONO} w={500} color={i === 3 ? WHITE : GREY}>0{i + 1}</Txt>
      <Txt size={44} w={800} color={i === 3 ? WHITE : INK}>{l}</Txt>
    </Card>)}
  </>
);

export const scenes = [
  {a: 5.0, b: 13.3, el: FlowPhone},
  {a: 16.0, b: 39.6, el: StateMachine},
  {a: 41.4, b: 65.8, el: Events},
  {a: 67.7, b: 80.4, el: Idem},
  {a: 82.4, b: 89.8, el: Location},
  {a: 89.8, b: 96.3, el: TwoWays},
  {a: 100.9, b: 108.3, el: Eta},
  {a: 108.3, b: END + 1, el: Recap},
];
