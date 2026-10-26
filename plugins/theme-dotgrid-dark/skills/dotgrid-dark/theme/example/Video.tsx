// How the Node.js event loop works. Theme: dotgrid-dark. Not part of a series.
// Hard cuts: talk = speaker full screen with his real background; page = full-screen dark dot-grid explainer.
// Page content lives between y 140 and y 1540 (captions below). Timings like "~130ms" are illustrative.
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Head, Panel, Tag, Code, K, Arrow, Mover, Lane, Ring, Icon, Logo, At, Center, Appear, PopIn, Txt,
  WHITE, MUTED, DIM, GREEN, LIME, CYAN, AMBER, RED, CARD, CARD2, LINE, MONO, SANS} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;

export const cfg: Config = {
  cuts: [
    {a: 0, b: 1.4, m: 'talk'},
    {a: 1.4, b: 9.4, m: 'page'},
    {a: 9.4, b: 12.5, m: 'talk'},
    {a: 12.5, b: 24.4, m: 'page'},
    {a: 24.4, b: 30.1, m: 'talk'},
    {a: 30.1, b: 39.4, m: 'page'},
    {a: 39.4, b: 42.6, m: 'talk'},
    {a: 42.6, b: 61.0, m: 'page'},
    {a: 61.0, b: 66.0, m: 'talk'},
    {a: 66.0, b: 77.0, m: 'page'},
    {a: 77.0, b: 81.2, m: 'talk'},
    {a: 81.2, b: 96.9, m: 'page'},
    {a: 96.9, b: 98.3, m: 'talk'},
    {a: 98.3, b: END + 1, m: 'page'},
  ],
};

const PH = ['timers', 'poll', 'check', 'close'];
const Chip: React.FC<{children: React.ReactNode; color?: string; icon?: string; size?: number}> = ({children, color = CYAN, icon, size = 26}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: CARD2, border: `2px solid ${color}`, fontFamily: MONO, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', boxShadow: `0 0 18px ${color}33`}}>
    {icon && <Icon name={icon} size={size * 1.2} color={color} />}{children}
  </div>
);
const Card: React.FC<{x: number; y: number; t0: number; icon?: string; logo?: string; label: string; color?: string; w?: number}> = ({x, y, t0, icon, logo, label, color = WHITE, w = 260}) => (
  <Panel x={x} y={y} w={w} h={250} t0={t0} border={color === WHITE ? LINE : color} glow={color === WHITE ? undefined : color} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
    {logo ? <Logo src={logo} h={110} /> : <Icon name={icon!} size={100} color={color} />}
    <Txt size={34} w={700}>{label}</Txt>
  </Panel>
);

// ------------------------------------------------------------------ scenes
const Hook: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={1.45} label="// NODE.JS" title="Single thread?" />
    <At x={860} y={150}><PopIn t0={1.6}><Logo src="logos/node.png" h={120} /></PopIn></At>
    {/* many requests flowing into one lane */}
    {t > T.thousands && Array.from({length: 14}).map((_, i) => {
      const p = ((t - T.thousands) * 0.55 + i / 14) % 1; const col = i % 3 === 0 ? CYAN : i % 3 === 1 ? AMBER : LIME;
      const x = 120 + (i * 61) % 840; const y = lerp(360, 610, p);
      return <div key={i} style={{position: 'absolute', left: lerp(x, 540, p * p), top: y, width: 22, height: 22, borderRadius: 11, background: col, opacity: Math.sin(p * Math.PI), boxShadow: `0 0 12px ${col}`}} />;
    })}
    <At x={300} y={370}><Appear t0={T.thousands}><Txt size={34} font={MONO} w={700} color={MUTED}>1000s of requests</Txt></Appear></At>
    <Lane x={90} y={640} w={900} t0={T.single} label="1 JS THREAD" bars={[{at: 2.2, x: 10, w: 880, label: 'event loop handles all', color: GREEN, d: 1.2}]} />
    {[0, 1, 2].map(i => <div key={i} style={{opacity: 0.5}}><Lane x={90} y={860 + i * 150} w={900} h={80} t0={T.bina + i * 0.2} label={`THREAD #${i + 2} ?`} color={DIM} bars={[{at: T.bina + i * 0.2, x: 10, w: 880, ghost: true, color: DIM, d: 0.3}]} /></div>)}
    <At x={480} y={980}><PopIn t0={T.naya}><Icon name="x-circle" size={150} color={RED} /></PopIn></At>
    <Center y={1340}><Appear t0={T.thread}><Txt size={40} w={700}>Har request ke liye <span style={{color: RED}}>naya thread nahi</span></Txt></Appear></Center>
    <Center y={1430}><PopIn t0={T.evl}><Tag color={GREEN} solid size={34} icon="arrows-clockwise">event loop</Tag></PopIn></Center>
  </>;
};

const Request: React.FC = () => (
  <>
    <Head t0={12.55} label="STEP 1 · REQUEST" title="DB se user data" />
    <Card x={90} y={360} t0={12.7} icon="device-mobile" label="Client" color={CYAN} />
    <Card x={410} y={360} t0={T.server - 0.2} logo="logos/node.png" label="Node.js" color={GREEN} />
    <Card x={730} y={360} t0={T.db - 0.2} icon="database" label="Database" color={AMBER} />
    <Arrow x1={355} y1={485} x2={405} y2={485} t0={T.req} color={CYAN} />
    <Arrow x1={675} y1={485} x2={725} y2={485} t0={T.db} color={AMBER} />
    <Mover x1={240} y1={680} x2={560} y2={680} t0={T.req} d={0.6}><Chip icon="device-mobile">GET /user</Chip></Mover>
    <Code x={90} y={780} w={900} t0={T.db - 0.3} title="server.js" size={32} lines={[
      {at: T.db - 0.2, text: <><K c={CYAN}>app</K>.get(<K c={AMBER}>'/user'</K>, <K c={GREEN}>async</K> (req, res) =&gt; {'{'}</>},
      {at: T.db, text: <>  <K c={GREEN}>const</K> user = <K c={GREEN}>await</K> db.find(id)</>, hl: [T.fetch - 0.3, 17.4]},
      {at: T.db + 0.2, text: <>  res.json(user)</>},
      {at: T.db + 0.3, text: <>{'})'}</>},
    ]} />
    <Center y={1170}><Appear t0={T.fetch}><Tag color={AMBER} icon="database" size={30}>I/O operation (slow)</Tag></Appear></Center>
  </>
);

const NoBlock: React.FC = () => (
  <>
    <Head t0={17.45} label="STEP 2 · ASYNC" title="Wait nahi karta" />
    <Lane x={90} y={360} w={900} t0={17.5} label="JS THREAD" head={[17.6, 24.4, 0, 896]} bars={[
      {at: T.op, x: 10, w: 200, label: 'db.find()', color: GREEN, d: 0.3},
      {at: 20.2, x: 220, w: 200, label: 'req #2', color: LIME, d: 0.3},
      {at: 22.6, x: 430, w: 200, label: 'req #3', color: LIME, d: 0.3},
      {at: 23.8, x: 640, w: 240, label: 'other code', color: LIME, d: 0.3},
    ]} />
    <Arrow x1={200} y1={500} x2={200} y2={640} t0={T.op + 0.3} color={AMBER} dash />
    <Lane x={90} y={600} w={900} t0={T.async} label="BACKGROUND I/O (OS / libuv)" color={AMBER} bars={[{at: T.op + 0.4, x: 10, w: 870, label: 'DB query running...', color: AMBER, d: 5.0}]} />
    <Panel x={90} y={860} w={900} h={220} t0={T.block - 0.2} border={RED}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Icon name="hourglass" size={70} color={RED} /><Txt size={40} w={700}>Thread block karke wait?</Txt></div>
      <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 16}}><PopIn t0={T.zaroorat}><Icon name="x-circle" size={56} color={RED} /></PopIn><Appear t0={T.zaroorat}><Txt size={40} w={700} color={RED}>zaroorat nahi</Txt></Appear></div>
    </Panel>
    <Center y={1160}><Appear t0={22.6}><Tag color={GREEN} size={30} icon="check-circle">thread free, doosra code chalta hai</Tag></Appear></Center>
  </>
);

const CallbackReady: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={30.15} label="STEP 3 · CALLBACK" title="Kaam complete" />
    <Lane x={90} y={360} w={900} t0={30.2} label="BACKGROUND I/O" color={AMBER} bars={[{at: 30.2, x: 10, w: 870, label: 'DB query done', color: t > T.done ? GREEN : AMBER, d: 0.6}]} />
    <At x={890} y={400}><PopIn t0={T.done}><Icon name="check-circle" size={70} color={GREEN} /></PopIn></At>
    <Mover x1={540} y1={540} x2={300} y2={830} t0={T.callback} d={0.8}><Chip color={CYAN} icon="lightning" size={30}>callback(user)</Chip></Mover>
    <Panel x={90} y={700} w={900} h={260} t0={32.0} border={CYAN} glow={CYAN}>
      <Txt size={28} w={700} font={MONO} color={CYAN}>CALLBACK QUEUE</Txt>
    </Panel>
    <At x={560} y={800}><Appear t0={33.0}><Chip color={DIM} size={26}>cb #2</Chip></Appear></At>
    <At x={760} y={800}><Appear t0={33.3}><Chip color={DIM} size={26}>cb #3</Chip></Appear></At>
    <Center y={1040}><Appear t0={T.register}><Txt size={42} w={700}>Execute hone ke liye <span style={{color: CYAN}}>queue mein ready</span></Txt></Appear></Center>
  </>;
};

const LoopIntro: React.FC = () => {
  const t = useT(); const ang = Math.max(0, t - 35.6) * 2.4;
  return <>
    <Head t0={35.05} label="// THE HERO" title="Event loop" />
    <Ring cx={540} cy={780} r={300} t0={35.2} phases={PH.map(n => ({name: n}))} angle={ang} active={Math.floor(((ang / (Math.PI * 2)) * 4 + 0.5) % 4)} />
    <div style={{position: 'absolute', left: 540, top: 780, transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
      <PopIn t0={35.4}><Logo src="logos/node.png" h={130} style={{margin: '0 auto'}} /></PopIn>
    </div>
    {[0, 1, 2].map(i => <Mover key={i} x1={150 + i * 60} y1={1260} x2={540} y2={940} t0={T.cbs + i * 0.35} d={0.6} hold={false}><Chip color={CYAN} size={24}>cb</Chip></Mover>)}
    <Center y={1230}><Appear t0={T.phases}><Txt size={40} w={700}>Phases ke through callbacks <span style={{color: GREEN}}>process</span></Txt></Appear></Center>
  </>;
};

const PHASE_INFO = [
  {at: T.timer, name: 'timers', code: [<><K c={CYAN}>setTimeout</K>(cb, <K c={AMBER}>100</K>)</>, <><K c={CYAN}>setInterval</K>(cb, <K c={AMBER}>1000</K>)</>], note: 'timer callbacks run here'},
  {at: T.poll, name: 'poll', code: [<><K c={CYAN}>fs</K>.readFile(path, cb)</>, <><K c={CYAN}>db</K>.query(sql, cb)</>], note: 'I/O events + their callbacks'},
  {at: T.check, name: 'check', code: [<><K c={CYAN}>setImmediate</K>(cb)</>], note: 'setImmediate callbacks run here'},
  {at: T.close, name: 'close', code: [<><K c={CYAN}>socket</K>.on(<K c={AMBER}>'close'</K>, cb)</>], note: 'close callbacks run here'},
];
const Phases: React.FC = () => {
  const t = useT();
  let idx = -1; PHASE_INFO.forEach((p, i) => { if (t >= p.at - 0.2) idx = i; });
  // pointer eases to each phase at its time; spins a full lap after the last
  let ang = 0;
  for (let i = 0; i < 4; i++) { const k = ease(t, PHASE_INFO[i].at - 0.5, 0.5); ang = lerp(ang, (i / 4) * Math.PI * 2, i === 0 ? 1 : k); }
  ang += ease(t, 59.8, 1.0) * (Math.PI / 2);
  const info = idx >= 0 ? PHASE_INFO[idx] : null;
  return <>
    <Head t0={42.65} label="// PHASES" title="Loop ke phases" />
    <Ring cx={540} cy={680} r={270} t0={42.7} phases={PH.map((n, i) => ({name: n, at: PHASE_INFO[i].at - 0.25}))} angle={ang} active={idx} size={32} />
    <div style={{position: 'absolute', left: 540, top: 680, transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
      <Txt size={30} font={MONO} w={700} color={MUTED}>phase</Txt>
      <Txt size={70} w={700} color={GREEN}>{idx >= 0 ? `${idx + 1}/4` : ''}</Txt>
    </div>
    {info && <div key={info.name}>
      <Code x={90} y={1060} w={900} t0={info.at} title={`${info.name} phase`} size={34} lines={info.code.map((c, i) => ({at: info.at + 0.15 + i * 0.25, text: c}))} />
      <At x={90} y={1340}><Appear t0={info.at + 0.4}><Tag color={GREEN} size={30} icon="check-circle">{info.note}</Tag></Appear></At>
    </div>}
  </>;
};

const Timeout: React.FC = () => {
  const t = useT(); const x0 = 120, x1 = 960; const X = (ms: number) => lerp(x0, x1, ms / 200);
  return <>
    <Head t0={66.05} label="// TIMERS" title="100ms = minimum" />
    <Code x={90} y={340} w={900} t0={T.st - 0.2} size={36} lines={[{at: T.st, text: <><K c={CYAN}>setTimeout</K>(cb, <K c={AMBER}>100</K>)</>}]} />
    {/* time axis */}
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <line x1={x0} y1={760} x2={x0 + (x1 - x0) * ease(t, 67.0, 0.8)} y2={760} stroke={MUTED} strokeWidth={5} />
      {[0, 50, 100, 150, 200].map(ms => t > 67.2 && <g key={ms}><line x1={X(ms)} y1={745} x2={X(ms)} y2={775} stroke={MUTED} strokeWidth={4} /><text x={X(ms)} y={820} fill={MUTED} fontFamily={MONO} fontSize={26} textAnchor="middle">{ms}ms</text></g>)}
      {t > T.ms100 && <line x1={X(100)} y1={600} x2={X(100)} y2={760} stroke={GREEN} strokeWidth={5} strokeDasharray="10 10" />}
    </svg>
    <At x={X(100) - 120} y={540}><Appear t0={T.ms100}><Tag color={GREEN} size={26}>min 100ms</Tag></Appear></At>
    <At x={X(100) - 40} y={860}><PopIn t0={T.exactly}><div style={{display: 'flex', alignItems: 'center', gap: 10}}><Icon name="x-circle" size={50} color={RED} /><Txt size={30} w={700} color={RED}>exactly?</Txt></div></PopIn></At>
    <Mover x1={X(100)} y1={700} x2={X(132)} y2={700} t0={T.later} d={0.6}><Chip color={AMBER} icon="lightning" size={26}>cb runs</Chip></Mover>
    <At x={X(132) - 60} y={980}><Appear t0={T.later + 0.4}><Txt size={26} w={500} font={MONO} color={MUTED}>~132ms (example)</Txt></Appear></At>
    <Panel x={90} y={1100} w={900} h={260} t0={T.minimum - 0.1} border={GREEN}>
      <Txt size={40} w={700}>Ye <span style={{color: GREEN}}>minimum threshold</span> hai</Txt>
      <Appear t0={T.later}><Txt size={34} w={500} color={MUTED} style={{marginTop: 20}}>Thread busy ho toh callback late chalega</Txt></Appear>
    </Panel>
  </>;
};

const Block: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={81.25} label="// CAREFUL" title="Blocking code" color={RED} />
    <Code x={90} y={340} w={900} t0={T.cpu - 0.2} title="CPU-intensive / long sync loop" size={32} lines={[
      {at: T.cpu, text: <><K c={GREEN}>for</K> (<K c={GREEN}>let</K> i = <K c={AMBER}>0</K>; i &lt; <K c={AMBER}>1e10</K>; i++) {'{'}</>},
      {at: T.long, text: <>  heavyMath(i)</>},
      {at: T.long + 0.2, text: <>{'}'}</>},
    ]} />
    <Lane x={90} y={660} w={900} t0={T.sync} label="JS THREAD" color={RED} bars={[{at: T.sync, x: 10, w: 870, label: t > T.tblock ? 'BLOCKED' : 'running sync loop...', color: RED, d: 2.8}]} />
    <Panel x={90} y={900} w={900} h={300} t0={T.period} border={CYAN}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name="hourglass" size={40} color={CYAN} /><Txt size={28} w={700} font={MONO} color={CYAN}>CALLBACKS WAITING</Txt></div>
      <div style={{display: 'flex', gap: 14, marginTop: 30, flexWrap: 'wrap'}}>
        {['db cb', 'timer cb', 'req #4', 'req #5', 'req #6'].map((c, i) => <Appear key={c} t0={T.period + 0.3 + i * 0.35}><Chip color={DIM} size={26}>{c}</Chip></Appear>)}
      </div>
    </Panel>
    <Center y={1280}><Appear t0={T.cbwait}><Txt size={40} w={700}>Event loop <span style={{color: RED}}>execute nahi</span> kar payega</Txt></Appear></Center>
  </>;
};

const Benefit: React.FC = () => {
  const row = (y: number, at: number, ok: boolean, text: string) => (
    <Panel x={90} y={y} w={900} h={140} t0={at} border={ok ? GREEN : RED} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px'}}>
      <Icon name={ok ? 'check-circle' : 'x-circle'} size={70} color={ok ? GREEN : RED} /><Txt size={40} w={700}>{text}</Txt>
    </Panel>
  );
  return <>
    <Head t0={91.25} label="// RULE" title="Loop ko free rakho" />
    {row(360, 91.4, false, 'heavy sync work on main thread')}
    {row(540, T.nonblock, true, 'non-blocking I/O (async)')}
    {row(720, T.benefit + 0.3, true, 'callbacks short aur fast')}
    <Center y={960}><PopIn t0={T.unnecessary}><Tag color={GREEN} solid size={34}>unnecessary block mat karo</Tag></PopIn></Center>
  </>;
};

const Summary: React.FC = () => {
  const t = useT(); const ang = Math.max(0, t - 98.6) * 2.6;
  return <>
    <Head t0={98.35} label="// IN SHORT" title="Event loop = magic" />
    <Ring cx={540} cy={700} r={250} t0={98.4} phases={PH.map(n => ({name: n}))} angle={ang} active={Math.floor(((ang / (Math.PI * 2)) * 4 + 0.5) % 4)} size={28} />
    <div style={{position: 'absolute', left: 540, top: 700, transform: 'translate(-50%,-50%)'}}><PopIn t0={98.6}><Logo src="logos/node.png" h={120} /></PopIn></div>
    <Lane x={90} y={1040} w={900} t0={T.asyncop - 0.4} label="1 JS THREAD" bars={[
      {at: T.asyncop, x: 10, w: 160, label: 'req', color: LIME, d: 0.2}, {at: T.asyncop + 0.3, x: 180, w: 160, label: 'req', color: LIME, d: 0.2},
      {at: T.asyncop + 0.6, x: 350, w: 160, label: 'req', color: LIME, d: 0.2}, {at: T.asyncop + 0.9, x: 520, w: 160, label: 'req', color: LIME, d: 0.2}, {at: T.asyncop + 1.2, x: 690, w: 190, label: 'req ...', color: LIME, d: 0.2},
    ]} />
    <Center y={1280}><Appear t0={T.request}><Txt size={40} w={700}>Async ops handle, <span style={{color: GREEN}}>no new thread</span></Txt></Appear></Center>
  </>;
};

export const scenes: Scene[] = [
  {a: 1.4, b: 9.4, el: Hook},
  {a: 12.5, b: 17.4, el: Request},
  {a: 17.4, b: 24.4, el: NoBlock},
  {a: 30.1, b: 35.0, el: CallbackReady},
  {a: 35.0, b: 39.4, el: LoopIntro},
  {a: 42.6, b: 61.0, el: Phases},
  {a: 66.0, b: 77.0, el: Timeout},
  {a: 81.2, b: 91.2, el: Block},
  {a: 91.2, b: 96.9, el: Benefit},
  {a: 98.3, b: END + 1, el: Summary},
];
