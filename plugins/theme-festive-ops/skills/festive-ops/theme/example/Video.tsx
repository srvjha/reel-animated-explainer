// How Amazon sends sale notifications at scale (Great Indian Festival). Theme: festive-ops. Not part of a series.
// Card scenes: 1000 x 840. Icons: lucide-static + simple-icons (firebase, apple, android) in public/icons.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Scene, clamp, lerp, ease, useT, Shake} from './core';
import {Config, Appear, Tag, Heading, Flow, Meter, Icon, Node, Toast, Phone, Count, CARD, PANEL, LINE, GRID, INK, SUB, ORANGE, DEEPOR, BLUE, SKY, GREEN, RED, DISPLAY, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;
const LOGO = 'amazon-app.png';

const Label: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, color = INK, font = DISPLAY, w = 800, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.15, ...style}}>{children}</div>
);
const Chip: React.FC<{icon: string; children: React.ReactNode; color?: string; size?: number; solid?: boolean}> = ({icon, children, color = DEEPOR, size = 28, solid}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999, background: solid ? color : CARD, border: `3px solid ${color}`, boxShadow: `0 10px 26px ${color}33`}}>
    <Icon name={icon} size={size * 1.15} color={solid ? '#fff' : color} />
    <span style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: solid ? '#fff' : INK, whiteSpace: 'nowrap'}}>{children}</span>
  </div>
);
const Badge: React.FC<{n: string; color?: string}> = ({n, color = ORANGE}) => (
  <div style={{position: 'absolute', left: -14, top: -14, width: 46, height: 46, borderRadius: 23, background: color, color: '#fff', fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,.18)'}}>{n}</div>
);
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
const JobChip: React.FC<{n: number; hot?: boolean; w?: number}> = ({n, hot, w = 120}) => (
  <div style={{width: w, height: 56, borderRadius: 14, background: hot ? ORANGE : CARD, border: `2px solid ${hot ? DEEPOR : LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 14px rgba(28,39,51,.10)'}}>
    <Icon name="bell" size={24} color={hot ? '#fff' : DEEPOR} /><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 19, color: hot ? '#fff' : INK}}>job {n}</span>
  </div>
);

// ------------------------------------------------------------------ 01 problem statement
const S1: React.FC = () => {
  const t = useT(); const seq = t > T.individual ? Math.floor((t - T.individual) * 6) : -1;
  return <>
    <Heading t0={7.05} kicker="PROBLEM STATEMENT" title="10 lakh pushes, one sale" />
    <Appear t0={T.backend - 0.1} from="left" style={{left: 36, top: 170}}><Node icon="server" label="BACKEND" sub="1 process / user" w={230} hot={seq >= 0} /></Appear>
    <Appear t0={T.massive} from="up" style={{left: 320, top: 175}}>
      <Count t0={T.lakh - 0.3} to={1000000} d={1.4} size={92} color={DEEPOR} />
      <Label size={26} color={SUB} font={SANS} w={700}>users to notify, all at once</Label>
    </Appear>
    {Array.from({length: 60}).map((_, i) => {
      const c = i % 12, r = Math.floor(i / 12); const on = t > T.massive + 0.3 + i * 0.03;
      const lit = seq >= 0 && i <= seq; const cur = i === seq;
      return <At key={i} x={36 + c * 78} y={400 + r * 82}><div style={{width: 64, height: 70, borderRadius: 14, background: cur ? ORANGE : lit ? '#FFE7C2' : PANEL, border: `2px solid ${cur ? DEEPOR : LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.5})`}}>
        <Icon name="smartphone" size={38} color={cur ? '#fff' : lit ? DEEPOR : SUB} />
      </div></At>;
    })}
    <Appear t0={T.request} from="scale" style={{left: 560, top: 310}}><Tag solid color={RED} size={24}>lakhs of requests</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 02 one server overload
const S2: React.FC = () => {
  const t = useT(); const hot = t > T.overload;
  return <>
    <Heading t0={20.45} kicker="THE BOTTLENECK" title="All of it on one server?" />
    {Array.from({length: 14}).map((_, i) => {
      const t0 = T.sabhi + i * 0.22; const ph = ((t - t0) * 0.9) % 1; if (t < t0) return null;
      const a = (i / 14) * Math.PI * 2; const sx = 500 + Math.cos(a) * 470, sy = 480 + Math.sin(a) * 330;
      return <At key={i} x={lerp(sx, 470, ph)} y={lerp(sy, 450, ph)} style={{opacity: clamp(ph * 5) * clamp((1 - ph) * 4)}}><Icon name="bell" size={44} color={i % 2 ? DEEPOR : BLUE} /></At>;
    })}
    <Appear t0={T.server - 0.1} from="scale" style={{left: 370, top: 330}}>
      <Shake t0={T.overload} d={1.2} amp={14}><Node icon={hot ? 'flame' : 'server'} label="ONE SERVER" sub={hot ? 'overloaded' : 'processing all'} w={260} bad={hot} /></Shake>
    </Appear>
    <Appear t0={T.server + 0.3} style={{left: 200, top: 650}}><Meter v={0.3 + 0.7 * ease(t, T.server + 0.3, T.overload - T.server)} w={600} label="SERVER LOAD" /></Appear>
    <Appear t0={T.solve} from="scale" style={{left: 0, right: 0, top: 750, display: 'flex', justifyContent: 'center'}}><Chip icon="sparkles" color={BLUE} size={26}>so how do we solve it?</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 03 three components
const S3: React.FC = () => {
  const comps: [string, string, string, number][] = [['list-ordered', 'MESSAGE QUEUE', 'holds the jobs', T.mq], ['cog', 'WORKERS', 'process in parallel', T.workers], ['send', 'PUSH SERVICE', 'delivers to phones', T.pns]];
  return <>
    <Heading t0={29.75} kicker="THE ARCHITECTURE" title="3 key components" />
    {comps.map(([ic, l, s, t0], i) => <Appear key={i} t0={t0 - 0.1} from="up" style={{left: 30 + i * 330, top: 300}}>
      <div style={{position: 'relative'}}><Node icon={ic} label={l} sub={s} w={280} hot={i === 0} cool={i === 2} /><Badge n={`${i + 1}`} color={i === 2 ? BLUE : ORANGE} /></div>
    </Appear>)}
    <Flow x1={312} y1={420} x2={358} y2={420} t0={T.workers} n={2} />
    <Flow x1={642} y1={420} x2={688} y2={420} t0={T.pns} n={2} color={BLUE} />
    <Appear t0={T.pns + 0.4} from="up" style={{left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', gap: 16}}>
      <Tag size={22}>backend</Tag><Tag size={22}>queue</Tag><Tag size={22}>workers</Tag><Tag size={22} color={BLUE}>push</Tag><Tag size={22} color={BLUE}>phones</Tag>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 04 pick the audience
const INTEREST: [string, string][] = [['laptop', 'electronics'], ['shirt', 'fashion'], ['book-open', 'books'], ['headphones', 'electronics'], ['house', 'home'], ['tv', 'electronics'], ['shirt', 'fashion'], ['book-open', 'books'], ['laptop', 'electronics'], ['house', 'home'], ['watch', 'fashion'], ['smartphone', 'electronics']];
const S4: React.FC = () => {
  const t = useT(); const filt = t > T.electronics;
  return <>
    <Heading t0={34.95} kicker="STEP 1 · TARGETING" title="Who gets this offer?" />
    <Appear t0={T.decide} from="left" style={{left: 36, top: 160}}><Chip icon="filter" size={24}>{filt ? 'interest = electronics' : 'backend decides the users'}</Chip></Appear>
    {INTEREST.map(([ic, l], i) => {
      const c = i % 4, r = Math.floor(i / 4); const el = l === 'electronics'; const on = t > T.decide + 0.2 + i * 0.06;
      const hit = filt && el; const sent = t > T.offers && el;
      return <At key={i} x={36 + c * 236} y={250 + r * 150} style={{opacity: on ? (filt && !el ? 0.3 : 1) : 0}}>
        <div style={{width: 216, height: 132, borderRadius: 20, background: CARD, border: `3px solid ${hit ? ORANGE : LINE}`, boxShadow: hit ? `0 10px 24px ${ORANGE}44` : '0 6px 16px rgba(28,39,51,.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative'}}>
          <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><Icon name="user" size={40} color={INK} /><Icon name={ic} size={34} color={hit ? DEEPOR : SUB} /></div>
          <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: hit ? DEEPOR : SUB}}>{l}</span>
          {sent && <div style={{position: 'absolute', right: -10, top: -10, width: 40, height: 40, borderRadius: 20, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${ease(t, T.offers + i * 0.04, 0.3)})`}}><Icon name="bell" size={24} color="#fff" /></div>}
        </div>
      </At>;
    })}
  </>;
};

// ------------------------------------------------------------------ 05 message queue
const S5: React.FC = () => {
  const t = useT(); const n = 7;
  const exiting = t > T.turn ? Math.floor((t - T.turn) / 0.7) : -1;
  return <>
    <Heading t0={43.75} kicker="STEP 2 · MESSAGE QUEUE" title="Jobs wait in line" />
    <Appear t0={T.ab} t1={T.jobs - 0.2} from="scale" style={{left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center'}}><Chip icon="circle-x" color={RED} size={30}>send everything at once</Chip></Appear>
    <Appear t0={T.jobs - 0.2} from="left" style={{left: 30, top: 230}}><Node icon="server" label="BACKEND" w={180} /></Appear>
    {t > T.jobs - 0.1 && <div style={{position: 'absolute', left: 240, top: 250, width: 730, height: 140, borderRadius: 70, background: PANEL, border: `3px dashed ${ORANGE}`, opacity: ease(t, T.jobs - 0.1, 0.4)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: -44, textAlign: 'center'}}><Label size={22} font={MONO} color={DEEPOR}>MESSAGE QUEUE</Label></div>
    </div>}
    {Array.from({length: n}).map((_, i) => {
      const t0 = T.jobs + i * 0.32; if (t < t0) return null;
      const k = ease(t, t0, 0.6); const slot = i - Math.max(0, exiting + 1);
      const gone = i <= exiting; const g = gone ? ease(t, T.turn + i * 0.7, 0.5) : 0;
      const x = gone ? lerp(260 + 0 * 100, 1060, g) : lerp(200, 830 - Math.max(0, slot) * 100 - 0, k);
      return <At key={i} x={x} y={292} style={{opacity: gone ? 1 - g : 1}}><JobChip n={101 + i} hot={i === exiting + 1 && t > T.waiting} w={92} /></At>;
    })}
    <Appear t0={T.waiting} from="up" style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 16}}><Chip icon="hourglass" size={26}>a waiting line</Chip><Chip icon="list-ordered" color={BLUE} size={26}>one job at a time</Chip></Appear>
    <Appear t0={T.turn} from="up" style={{left: 130, top: 620}}>
      <Toast img={LOGO} title="Electronics offers are live" body="job 101 · batch of users" w={740} />
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 06 workers and fanout
const S6: React.FC = () => {
  const t = useT(); const fan = t > T.fanout;
  const groups = ['users A', 'users B', 'users C'];
  return <>
    <Heading t0={54.85} kicker="STEP 3 · WORKERS" title={fan ? 'This is fanout' : 'Workers run in parallel'} />
    <Appear t0={54.9} from="left" style={{left: 30, top: 160}}>
      <div style={{width: 190, height: 620, borderRadius: 26, background: PANEL, border: `3px dashed ${ORANGE}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 16, boxSizing: 'border-box'}}>
        <Label size={18} font={MONO} color={DEEPOR}>QUEUE</Label>
        {Array.from({length: 8}).map((_, i) => <JobChip key={i} n={110 + i} w={150} />)}
      </div>
    </Appear>
    {[0, 1, 2].map(i => <Appear key={i} t0={T.multiple + i * 0.15} from="scale" style={{left: 330, top: 175 + i * 200}}><Node icon="cog" label={`WORKER ${i + 1}`} w={220} hot={(i === 0 && t > T.w1) || (i === 1 && t > T.w2) || t > T.workload} /></Appear>)}
    {[0, 1, 2].map(i => <Flow key={i} x1={225} y1={260 + i * 200} x2={325} y2={265 + i * 200} t0={T.pick + i * 0.1} n={2} speed={1.4} />)}
    {[0, 1, 2].map(i => {
      const on = (i === 0 && t > T.w1) || (i === 1 && t > T.w2) || (i === 2 && t > T.workload);
      return <React.Fragment key={i}>
        {on && <Flow x1={555} y1={265 + i * 200} x2={650} y2={265 + i * 200} t0={i === 0 ? T.w1 : i === 1 ? T.w2 : T.workload} n={3} speed={1.6} color={BLUE} />}
        <Appear t0={i === 0 ? T.w1 : i === 1 ? T.w2 : T.workload} from="right" style={{left: 655, top: 185 + i * 200}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            {[0, 1, 2].map(j => <Phone key={j} w={78} h={140} ring={on ? INK : SUB}><div style={{position: 'absolute', left: 6, right: 6, top: 30, height: 30, borderRadius: 8, background: ORANGE, opacity: ease(t, (i === 0 ? T.w1 : i === 1 ? T.w2 : T.workload) + 0.5 + j * 0.15, 0.3)}} /></Phone>)}
          </div>
          <Label size={20} font={MONO} color={SUB} style={{marginTop: 6}}>{groups[i]}</Label>
        </Appear>
      </React.Fragment>;
    })}
    <Appear t0={T.parallel} from="scale" style={{left: 610, top: 128}}><Tag size={20} color={BLUE}>in parallel</Tag></Appear>
    <Appear t0={T.fanout} from="scale" style={{left: 0, right: 0, top: 772, display: 'flex', justifyContent: 'center'}}><Chip icon="git-fork" solid size={26}>FANOUT: 1 job, many deliveries</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 07 auto-scale
const S7: React.FC = () => {
  const t = useT();
  const depth = t < T.additional ? 0.35 + 0.6 * ease(t, T.pileup, 1.6) : 0.95 - 0.6 * ease(t, T.autoscale, 1.2);
  return <>
    <Heading t0={70.65} kicker="SALE SPIKE" title="Auto-scale the workers" />
    <Appear t0={70.8} style={{left: 200, top: 165}}><Meter v={depth} w={600} label="QUEUE DEPTH" /></Appear>
    {Array.from({length: 8}).map((_, i) => {
      const extra = i >= 3; const t0 = extra ? T.additional + (i - 3) * 0.2 : 70.9 + i * 0.1;
      return <Appear key={i} t0={t0} from="scale" style={{left: 40 + (i % 4) * 235, top: 290 + Math.floor(i / 4) * 230}}>
        <div style={{position: 'relative'}}><Node icon="cog" label={`WORKER ${i + 1}`} w={210} hot={!extra} cool={extra} />{extra && <div style={{position: 'absolute', right: -10, top: -10}}><Tag solid color={BLUE} size={18}>new</Tag></div>}</div>
      </Appear>;
    })}
    <Appear t0={T.autoscale} from="scale" style={{left: 0, right: 0, top: 770, display: 'flex', justifyContent: 'center'}}><Chip icon="trending-up" color={BLUE} solid size={26}>AUTO-SCALE ON DEMAND</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 08 push providers
const S8: React.FC = () => {
  const t = useT(); const p2 = t > T.apis - 0.3;
  return <>
    <Heading t0={79.25} kicker="STEP 4 · PUSH SERVICES" title={p2 ? 'FCM and APNs deliver' : 'No direct phone link'} />
    {/* phase 1: backend does not hold a connection to every phone */}
    <Appear t0={79.3} t1={T.apis - 0.3} from="left" style={{left: 40, top: 330}}><Node icon="server" label="BACKEND" w={220} /></Appear>
    {[0, 1, 2, 3].map(i => <Appear key={i} t0={T.phone - 0.2 + i * 0.1} t1={T.apis - 0.3} from="right" style={{left: 760, top: 170 + i * 160}}><Phone w={80} h={140} /></Appear>)}
    {!p2 && t > T.directly && [0, 1, 2, 3].map(i => <svg key={i} width={1000} height={840} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={262} y1={420} x2={lerp(262, 755, ease(t, T.directly + i * 0.1, 0.5))} y2={lerp(420, 240 + i * 160, ease(t, T.directly + i * 0.1, 0.5))} stroke={t > T.deliver ? RED : GRID} strokeWidth={4} strokeDasharray="10 10" />
    </svg>)}
    <Appear t0={T.deliver} t1={T.apis - 0.3} from="scale" style={{left: 400, top: 380}}><Chip icon="unplug" color={RED} size={26}>not direct</Chip></Appear>
    {/* phase 2: workers hand off to FCM / APNs */}
    <Appear t0={T.apis - 0.2} from="left" style={{left: 30, top: 330}}><Node icon="cog" label="WORKERS" w={200} hot /></Appear>
    <Appear t0={T.firebase - 0.1} from="scale" style={{left: 350, top: 170}}><Node icon="firebase" label="FCM" sub="Firebase Cloud Messaging" w={300} cool /></Appear>
    <Appear t0={T.apple - 0.1} from="scale" style={{left: 350, top: 500}}><Node icon="apple" label="APNs" sub="Apple Push Notification" w={300} cool /></Appear>
    <Flow x1={232} y1={410} x2={345} y2={270} t0={T.firebase} n={3} />
    <Flow x1={232} y1={430} x2={345} y2={600} t0={T.apple} n={3} />
    <Flow x1={655} y1={270} x2={760} y2={270} t0={T.firebase + 0.4} n={3} color={BLUE} />
    <Flow x1={655} y1={600} x2={760} y2={600} t0={T.apple + 0.4} n={3} color={BLUE} />
    <Appear t0={T.firebase + 0.4} from="right" style={{left: 770, top: 190}}><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><Phone w={80} h={140} /><Icon name="android" size={56} color={GREEN} /></div></Appear>
    <Appear t0={T.apple + 0.4} from="right" style={{left: 770, top: 520}}><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><Phone w={80} h={140} /><Icon name="apple" size={52} color={INK} /></div></Appear>
    <Appear t0={T.providers} from="up" style={{left: 0, right: 0, top: 772, display: 'flex', justifyContent: 'center'}}><Tag size={22} color={BLUE}>push notification providers</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 09 what providers handle
const S9: React.FC = () => {
  const t = useT();
  const tiles: [string, string, string, number][] = [['smartphone', 'Right devices', 'token -> device', T.relevant], ['refresh-cw', 'Retries', 'when delivery fails', T.retries], ['gauge', 'Rate limits', 'provider quotas', T.ratelimit], ['timer', 'Controlled pace', 'steady, not a flood', T.controlled]];
  return <>
    <Heading t0={93.35} kicker="PUSH PROVIDERS" title="What FCM & APNs handle" />
    {tiles.map(([ic, l, s, t0], i) => {
      const spin = ic === 'refresh-cw' && t > t0 ? (t - t0) * 200 : 0;
      const needle = ic === 'gauge' && t > t0 ? -60 + 100 * ease(t, t0, 0.8) - 10 * Math.sin((t - t0) * 6) * 0.3 : 0;
      return <Appear key={i} t0={t0 - 0.1} from="up" style={{left: 30 + (i % 2) * 480, top: 175 + Math.floor(i / 2) * 320}}>
        <div style={{width: 460, height: 290, borderRadius: 26, background: CARD, border: `3px solid ${i % 2 ? BLUE : ORANGE}`, boxShadow: '0 12px 28px rgba(28,39,51,.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
          <div style={{transform: `rotate(${spin}deg)`}}><Icon name={ic} size={92} color={i % 2 ? BLUE : DEEPOR} /></div>
          {ic === 'gauge' && <div style={{position: 'absolute', top: 70, left: 228, width: 4, height: 34, background: RED, transformOrigin: '2px 34px', transform: `rotate(${needle}deg)`, opacity: 0}} />}
          <Label size={34}>{l}</Label>
          <Label size={20} font={MONO} w={500} color={SUB}>{s}</Label>
        </div>
      </Appear>;
    })}
  </>;
};

// ------------------------------------------------------------------ 10 not the same millisecond
const ARR = [0.15, 0.9, 0.45, 1.6, 0.3, 1.2];
const S10: React.FC = () => {
  const t = useT(); const t0 = T.exactly + 0.2;
  return <>
    <Heading t0={106.25} kicker="REALITY CHECK" title="Not all in the same ms" />
    <svg width={1000} height={840} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={190} y1={700} x2={940} y2={700} stroke={INK} strokeWidth={3} />
      {[0, 1, 2, 3].map(i => <g key={i}><line x1={190 + i * 230} y1={692} x2={190 + i * 230} y2={708} stroke={INK} strokeWidth={3} /></g>)}
    </svg>
    {['0s', '+1s', '+2s', '+3s'].map((l, i) => <At key={i} x={170 + i * 230} y={714}><Label size={20} font={MONO} color={SUB}>{l}</Label></At>)}
    {ARR.map((a, i) => {
      const k = ease(t, t0 + a, 0.5);
      return <React.Fragment key={i}>
        <At x={36} y={190 + i * 82}><div style={{display: 'flex', alignItems: 'center', gap: 10}}><Icon name="user" size={36} color={INK} /><Label size={20} font={MONO} color={SUB}>user {i + 1}</Label></div></At>
        <div style={{position: 'absolute', left: 190, top: 210 + i * 82, height: 6, width: 230 * a * k + 1, background: GRID, borderRadius: 3}} />
        {k > 0 && <At x={190 + 230 * a - 22} y={190 + i * 82} style={{transform: `scale(${k})`}}><div style={{width: 46, height: 46, borderRadius: 23, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="bell" size={26} color="#fff" /></div></At>}
      </React.Fragment>;
    })}
    <Appear t0={T.guaranteed} from="scale" style={{left: 560, top: 175}}><Tag solid color={RED} size={22}>no ms guarantee</Tag></Appear>
    <Appear t0={T.delay} from="scale" style={{left: 0, right: 0, top: 770, display: 'flex', justifyContent: 'center'}}><Chip icon="circle-check" color={GREEN} size={26}>a small delay is fine</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 11 recap pipeline
const PIPE: [string, string, string, boolean][] = [['server', 'BACKEND', 'nexttime', false], ['list-ordered', 'QUEUE', 'queues', false], ['cog', 'WORKERS', 'workers2', false], ['send', 'FCM / APNs', 'push2', true], ['smartphone', 'PHONES', 'services', true]];
const S11: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={111.95} kicker="BEHIND THE SCENES" title="Every sale notification" />
    {PIPE.map(([ic, l, key, blue], i) => <Appear key={i} t0={112.1 + i * 0.12} from="up" style={{left: 14 + i * 197, top: 180}}>
      <Node icon={ic} label={l} w={180} hot={!blue && t > T[key]} cool={blue && t > T[key]} />
    </Appear>)}
    {[0, 1, 2, 3].map(i => <Flow key={i} x1={194 + i * 197} y1={265} x2={211 + i * 197} y2={265} t0={113 + i * 0.2} n={1} />)}
    <Appear t0={T.msg - 0.3} from="up" style={{left: 330, top: 400}}>
      <Phone w={340} h={430}>
        <div style={{position: 'absolute', left: 12, right: 12, top: 40, transform: `translateY(${(1 - ease(t, T.msg, 0.5)) * -80}px)`, opacity: ease(t, T.msg, 0.4)}}>
          <div style={{display: 'flex', gap: 10, alignItems: 'center', background: '#fff', borderRadius: 18, padding: 10, boxShadow: '0 8px 18px rgba(0,0,0,.15)'}}>
            <Img src={staticFile(LOGO)} style={{width: 46, height: 46, borderRadius: 11}} />
            <div><Label size={17} font={SANS}>Great Indian Festival</Label><Label size={15} font={SANS} w={500} color={SUB}>Deals are live. Shop now</Label></div>
          </div>
        </div>
      </Phone>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ talk-mode overlays (speaker full screen)
const Band: React.FC<{a: number; b: number; children: React.ReactNode; top?: number}> = ({a, b, children, top = 1000}) => {
  const t = useT(); if (t < a - 0.05 || t > b + 0.3) return null;
  const k = ease(t, a, 0.4) * clamp((b + 0.25 - t) / 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{children}</div>;
};
const BigT: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 80, color = '#fff', children}) => (
  <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, lineHeight: 1.05, textAlign: 'center', textShadow: '0 6px 26px rgba(0,0,0,.55)', whiteSpace: 'nowrap'}}>{children}</div>
);
const TitleRow: React.FC<{size?: number}> = ({size = 62}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 30px', borderRadius: 30, background: 'rgba(255,255,255,.96)', boxShadow: '0 16px 40px rgba(0,0,0,.3)'}}>
    <Img src={staticFile(LOGO)} style={{width: size * 1.45, height: size * 1.45, borderRadius: size * 0.32}} />
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color: INK, whiteSpace: 'nowrap'}}>Notifications at Scale</span>
  </div>
);
const TALK: [number, number][] = [[-1, 7.1], [27.4, 29.8], [77.3, 79.3], [122.0, 999]];
const Shade: React.FC = () => {
  const t = useT();
  const k = Math.max(...TALK.map(([a, b]) => clamp((t - a) / 0.4) * clamp((b - t) / 0.3)));
  return <div style={{position: 'absolute', left: 0, right: 0, top: 900, height: 1020, background: 'linear-gradient(transparent, rgba(12,18,26,.55) 25%, rgba(12,18,26,.7))', opacity: k}} />;
};
const Intro: React.FC = () => {
  const t = useT();
  const rot = t * 25;
  return <>
    <Band a={0} b={1.95} top={985}>
      <div style={{position: 'relative', width: 570, height: 570}}>
        <div style={{position: 'absolute', inset: -120, background: `repeating-conic-gradient(from ${rot}deg, ${ORANGE}55 0deg 10deg, transparent 10deg 24deg)`, borderRadius: '50%', WebkitMaskImage: 'radial-gradient(circle, #000 35%, transparent 70%)', maskImage: 'radial-gradient(circle, #000 35%, transparent 70%)'}} />
        <Img src={staticFile('gif-banner.jpg')} style={{position: 'absolute', inset: 0, width: 570, height: 570, borderRadius: 28, boxShadow: '0 24px 60px rgba(0,0,0,.45)', border: '6px solid #fff', transform: `rotate(${lerp(-6, 0, ease(t, 0, 0.6))}deg) scale(${lerp(0.75, 1, ease(t, 0, 0.5)) * (1 + 0.03 * Math.sin(t * 5))})`}} />
      </div>
    </Band>
    <Band a={2.05} b={4.85} top={1010}>
      {([['Great Indian Festival', 'Deals are live. Shop now', 2.2], ['Lightning deal', 'An item on your wishlist just dropped', T.lakho], ['Electronics offers', 'Top picks on laptops and phones', 3.8]] as [string, string, number][]).map(([a, b, t0], i) =>
        <Appear key={i} t0={t0} from="down" style={{position: 'relative'}}><Toast img={LOGO} title={a} body={b} w={880} /></Appear>)}
      <Appear t0={T.lakho + 0.2} from="scale" style={{position: 'relative'}}><Chip icon="users" size={30} solid>to lakhs of phones</Chip></Appear>
    </Band>
    <Band a={4.95} b={7.0} top={1110}>
      <TitleRow />
      <Chip icon="server" color={BLUE} size={28}>how does the backend handle it?</Chip>
    </Band>
  </>;
};
const Mid: React.FC = () => <>
  <Band a={27.5} b={29.6} top={1090}><Icon name="workflow" size={96} color={ORANGE} /><BigT size={86}>THE ARCHITECTURE</BigT></Band>
  <Band a={77.4} b={79.1} top={1090}><Icon name="triangle-alert" size={96} color={ORANGE} /><BigT size={86}>IMPORTANT CONCEPT</BigT></Band>
</>;
const Outro: React.FC = () => <Band a={122.1} b={END} top={1060}>
  <TitleRow size={56} />
  <div style={{display: 'flex', gap: 12}}>
    {['Queue', 'Workers', 'Push service'].map((s, i) => <Appear key={i} t0={122.4 + i * 0.2} from="scale" style={{position: 'relative'}}><Tag size={26} solid color={i === 2 ? BLUE : DEEPOR}>{s}</Tag></Appear>)}
  </div>
</Band>;

export const cfg: Config = {
  title: 'Notifications at Scale',
  logo: LOGO,
  modes: [
    {a: 0, b: 7.0, m: 'talk'}, {a: 7.0, b: 27.4, m: 'card'}, {a: 27.4, b: 29.7, m: 'talk'}, {a: 29.7, b: 77.3, m: 'card'},
    {a: 77.3, b: 79.2, m: 'talk'}, {a: 79.2, b: 122.0, m: 'card'}, {a: 122.0, b: END + 1, m: 'talk'},
  ],
  face: {y0: 40, y1: 990},
  overlays: [Shade, Intro, Mid, Outro],
};

export const scenes: Scene[] = [
  {a: 7.0, b: 20.4, el: S1}, {a: 20.4, b: 27.4, el: S2}, {a: 29.7, b: 34.9, el: S3}, {a: 34.9, b: 43.7, el: S4},
  {a: 43.7, b: 54.8, el: S5}, {a: 54.8, b: 70.6, el: S6}, {a: 70.6, b: 77.3, el: S7}, {a: 79.2, b: 93.3, el: S8},
  {a: 93.3, b: 106.2, el: S9}, {a: 106.2, b: 111.9, el: S10}, {a: 111.9, b: 122.0, el: S11},
];
