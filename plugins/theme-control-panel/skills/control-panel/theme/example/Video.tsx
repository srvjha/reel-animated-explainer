// EXAMPLE: "Circuit Breaker" (Building Backend Systems EP 13, 140 s). Copy to src/Video.tsx and replace the scenes.
// Scenes draw on the 1000 x 850 schematic board under the speaker window.
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Appear, Plate, Section, Lamp, Block, Wire, Breaker, Seg, Gauge, Spark, Packet, INK, ORANGE, RED, GREEN, AMBER, MUTED, HEAD, MONO, COND} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;

const Note: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 30, color = INK, children, style}) => (
  <div style={{fontFamily: COND, fontWeight: 700, fontSize: size, color, textTransform: 'uppercase', letterSpacing: '.03em', whiteSpace: 'nowrap', ...style}}>{children}</div>
);

type St = 'closed' | 'open' | 'half';
const StateLamps: React.FC<{s: St; y?: number}> = ({s, y = 700}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: 90}}>
    <Lamp color={GREEN} on={s === 'closed'} label="CLOSED" size={40} />
    <Lamp color={RED} on={s === 'open'} label="OPEN" size={40} />
    <Lamp color={AMBER} on={s === 'half'} label="HALF-OPEN" size={40} />
  </div>
);

// ------------------------------------------------------------------ 01 setup
const S1: React.FC = () => (<>
  <Section t0={8.5} n="01" title="THE SETUP" />
  <Appear t0={T.order1 - 0.1} from="left" style={{left: 70, top: 260}}><Block label="ORDER" sub="order-svc" w={260} h={170} /></Appear>
  <Appear t0={T.payment1 + 0.2} from="right" style={{left: 670, top: 260}}><Block label="PAYMENT" sub="payment-svc" w={260} h={170} /></Appear>
  <Wire x1={330} y1={345} x2={670} y2={345} t0={T.payment1 + 1.0} />
  <Appear t0={T.payment1 + 1.4} style={{left: 0, right: 0, top: 520, textAlign: 'center'}}><Plate size={30}>POST /pay &rarr; complete the order</Plate></Appear>
</>);

// ------------------------------------------------------------------ 02 normal flow
const S2: React.FC = () => {
  const t = useT();
  return <>
    <Section t0={14.0} n="02" title="NORMAL FLOW" />
    <Appear t0={T.client - 0.2} from="left" style={{left: 30, top: 270}}><Block label="CLIENT" sub="app" w={220} h={150} /></Appear>
    <Appear t0={T.client + 0.2} style={{left: 385, top: 270}}><Block label="ORDER" sub="order-svc" w={230} h={150} /></Appear>
    <Appear t0={T.karega + 0.4} from="right" style={{left: 750, top: 270}}><Block label="PAYMENT" sub="payment-svc" w={220} h={150} /></Appear>
    <Wire x1={250} y1={345} x2={385} y2={345} t0={T.client + 0.1} />
    <Wire x1={615} y1={345} x2={750} y2={345} t0={T.karega + 0.6} />
    {t > T.karega + 1.1 && <Packet pts={[[140, 470], [500, 470], [860, 470]]} t0={T.karega + 1.1} d={1.4} loop />}
    <Appear t0={T.karegi1 - 0.2} style={{left: 0, right: 0, top: 560, textAlign: 'center'}}><Plate size={30} bg={GREEN} color="#fff">200 OK &middot; every hop healthy</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ 03 payment goes down
const S3: React.FC = () => {
  const t = useT();
  const st = t > T.down - 0.1 ? 'down' : t > T.slow - 0.1 ? 'slow' : 'ok';
  const waiting = t > T.incoming;
  return <>
    <Section t0={19.3} n="03" title="PAYMENT GOES DOWN" color={RED} />
    <Appear t0={19.4} from="left" style={{left: 70, top: 250}}><Block label="ORDER" sub="order-svc" w={260} h={170} /></Appear>
    <Appear t0={19.5} from="right" style={{left: 670, top: 250}}><Block label="PAYMENT" sub="payment-svc" w={260} h={170} state={st as any} /></Appear>
    <Wire x1={330} y1={335} x2={670} y2={335} t0={19.6} flow={st === 'ok'} />
    <Appear t0={T.slow - 0.1} t1={T.down - 0.15} from="scale" style={{left: 690, top: 450}}><Plate bg={AMBER} size={28}>SLOW 8000 ms</Plate></Appear>
    <Appear t0={T.down - 0.1} from="scale" style={{left: 700, top: 450}}><Plate bg={RED} color="#fff" size={28}>DOWN</Plate></Appear>
    <Spark x={800} y={335} t0={T.down - 0.1} />
    <Appear t0={T.kya - 0.5} t1={T.incoming - 0.1} from="scale" style={{left: 400, top: 160}}><span style={{fontFamily: HEAD, fontSize: 150, color: ORANGE}}>?</span></Appear>
    {waiting && <div style={{position: 'absolute', left: lerp(330, 640, ease(t, T.incoming, 0.9)) - 16, top: 319, width: 32, height: 32, borderRadius: 6, background: ORANGE, border: `4px solid ${INK}`}} />}
    <Appear t0={T.response1 - 0.3} style={{left: 250, top: 560}}><Seg label="WAITING FOR RESPONSE" text={`${Math.max(0, t - T.response1).toFixed(1).padStart(4, '0')}s`} color={AMBER} size={80} /></Appear>
  </>;
};

// ------------------------------------------------------------------ 04 requests pile up
const S4: React.FC = () => {
  const t = useT();
  const n1 = Math.floor(clamp((t - T.hamari) / (T.traffic - T.hamari)) * 10);
  const n2 = Math.floor(ease(t, T.traffic, 3.2) * 46);
  const n = Math.min(56, n1 + n2);
  return <>
    <Section t0={28.4} n="04" title="REQUESTS PILE UP" color={AMBER} />
    <Appear t0={28.5} from="left" style={{left: 60, top: 140}}><Block label="ORDER" sub="order-svc" w={240} h={150} state={n > 30 ? 'slow' : 'ok'} /></Appear>
    <Appear t0={28.6} from="right" style={{left: 700, top: 140}}><Block label="PAYMENT" sub="payment-svc" w={240} h={150} state="down" /></Appear>
    <Wire x1={300} y1={215} x2={700} y2={215} t0={28.6} flow={false} />
    <div style={{position: 'absolute', left: 60, top: 340, width: 880, height: 300, border: `4px dashed ${INK}`, borderRadius: 12}}>
      <Note size={26} color={MUTED} style={{position: 'absolute', left: 16, top: 8}}>requests waiting on payment</Note>
      <div style={{position: 'absolute', left: 16, top: 52, right: 16, display: 'flex', flexWrap: 'wrap', gap: 10}}>
        {Array.from({length: n}).map((_, i) => <div key={i} style={{width: 46, height: 46, borderRadius: 6, background: i > 40 ? RED : ORANGE, border: `4px solid ${INK}`}} />)}
      </div>
    </div>
    <Appear t0={T.traffic - 0.2} style={{left: 0, right: 0, top: 670, textAlign: 'center'}}><Seg label="IN-FLIGHT REQUESTS" text={String(n).padStart(3, '0')} color={n > 30 ? RED : AMBER} size={66} /></Appear>
  </>;
};

// ------------------------------------------------------------------ 05 order service chokes
const S5: React.FC = () => {
  const t = useT();
  const busy = ease(t, T.threads - 0.3, 2.0);
  const conn = ease(t, T.connections - 0.2, 1.6);
  const lat = lerp(0.18, 0.95, ease(t, T.latency - 0.2, 1.4));
  return <>
    <Section t0={37.8} n="05" title="ORDER SERVICE CHOKES" color={RED} />
    <Appear t0={T.resources - 0.3} from="left" style={{left: 30, top: 120}}><Note size={30}>Order Service resources</Note></Appear>
    <Appear t0={T.threads - 0.4} style={{left: 30, top: 180}}>
      <Note size={24} color={MUTED}>threads / workers</Note>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 54px)', gap: 8, marginTop: 8}}>
        {Array.from({length: 32}).map((_, i) => <div key={i} style={{width: 54, height: 54, borderRadius: 6, border: `4px solid ${INK}`, background: i / 32 < busy ? RED : '#fff'}} />)}
      </div>
    </Appear>
    <Appear t0={T.connections - 0.3} style={{left: 30, top: 560, width: 520}}>
      <Note size={24} color={MUTED}>connection pool</Note>
      <div style={{height: 46, border: `4px solid ${INK}`, borderRadius: 8, marginTop: 8, overflow: 'hidden', background: '#fff'}}><div style={{width: `${conn * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${RED} 0 14px, #b8231f 14px 28px)`}} /></div>
      <Note size={26} color={conn > 0.95 ? RED : INK} style={{marginTop: 6}}>{conn > 0.95 ? 'all connections busy' : `${Math.round(conn * 100)}% busy`}</Note>
    </Appear>
    <Appear t0={T.latency - 0.4} from="right" style={{left: 620, top: 230}}>
      <Gauge v={lat} label="LATENCY" size={330} />
      <div style={{textAlign: 'center', marginTop: 10}}><Seg text={`${Math.round(lerp(120, 9000, ease(t, T.latency - 0.2, 1.4)))}`} color={lat > 0.7 ? RED : AMBER} size={54} label="MS" /></div>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 06 cascading failure
const S6: React.FC = () => {
  const t = useT();
  const oDown = t > T.affect - 0.1; const uDown = t > T.spread - 0.1;
  return <>
    <Section t0={48.6} n="06" title="CASCADING FAILURE" color={RED} />
    <Appear t0={T.dependent - 0.4} from="left" style={{left: 20, top: 260}}><Block label="CHECKOUT" sub="upstream" w={270} h={160} state={uDown ? 'down' : 'ok'} /></Appear>
    <Appear t0={48.8} style={{left: 365, top: 260}}><Block label="ORDER" sub="order-svc" w={270} h={160} state={oDown ? 'down' : 'slow'} /></Appear>
    <Appear t0={48.9} from="right" style={{left: 710, top: 260}}><Block label="PAYMENT" sub="payment-svc" w={270} h={160} state="down" /></Appear>
    <Wire x1={290} y1={340} x2={365} y2={340} t0={T.dependent - 0.2} flow={!uDown} />
    <Wire x1={635} y1={340} x2={710} y2={340} t0={48.9} flow={false} />
    <Spark x={500} y={340} t0={T.affect - 0.1} />
    <Spark x={155} y={340} t0={T.spread - 0.1} />
    <div style={{position: 'absolute', left: lerp(800, 60, ease(t, T.affect - 0.6, (T.spread - T.affect) + 0.6)), top: 470, opacity: t > T.affect - 0.6 ? 1 : 0}}><span style={{fontFamily: HEAD, fontSize: 70, color: RED}}>&larr;</span></div>
    <Appear t0={T.spread - 0.2} from="scale" style={{left: 0, right: 0, top: 600, textAlign: 'center'}}><Plate size={34} bg={RED} color="#fff">one failure &rarr; the whole chain fails</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ 07 we need a switch
const S7: React.FC = () => {
  const t = useT();
  return <>
    <Section t0={56.7} n="07" title="WE NEED A SWITCH" />
    <Appear t0={56.8} from="left" style={{left: 40, top: 280}}><Block label="ORDER" sub="order-svc" w={240} h={150} /></Appear>
    <Appear t0={56.9} from="right" style={{left: 720, top: 280}}><Block label="PAYMENT" sub="payment-svc" w={240} h={150} state="down" /></Appear>
    <Wire x1={280} y1={355} x2={410} y2={355} t0={57.0} flow={false} />
    <Wire x1={590} y1={355} x2={720} y2={355} t0={57.0} flow={false} />
    <Appear t0={T.mechanism - 0.2} from="scale" style={{left: 410, top: 270}}>
      <div style={{width: 180, height: 170, border: `5px dashed ${ORANGE}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: 90, color: ORANGE, background: 'rgba(255,90,31,.08)'}}>?</div>
    </Appear>
    {t > T.continuously - 0.4 && [0, 1, 2].map(i => <Packet key={i} pts={[[280, 355], [720, 355]]} t0={T.continuously - 0.4 + i * 0.35} d={0.6} loop />)}
    {t > T.continuously && [0, 1, 2, 3].map(i => <Spark key={i} x={735} y={355} t0={T.continuously + 0.2 + i * 0.6} />)}
    <Appear t0={T.continuously - 0.2} style={{left: 0, right: 0, top: 560, textAlign: 'center'}}><Plate size={32}>stop hitting a failing dependency</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ 08 the breaker + closed state
const S8: React.FC = () => {
  const t = useT();
  const flow = t > T.normally - 0.3;
  return <>
    <Section t0={64.8} n="08" title="CIRCUIT BREAKER" />
    <Appear t0={64.9} from="left" style={{left: 30, top: 260}}><Block label="ORDER" sub="order-svc" w={240} h={150} /></Appear>
    <Appear t0={65.0} from="down" style={{left: 418, top: 190}}><Breaker state="closed" s={0.95} /></Appear>
    <Appear t0={65.1} from="right" style={{left: 730, top: 260}}><Block label="PAYMENT" sub="payment-svc" w={240} h={150} /></Appear>
    <Wire x1={270} y1={335} x2={418} y2={335} t0={65.2} flow={flow} />
    <Wire x1={580} y1={335} x2={730} y2={335} t0={65.3} flow={flow} />
    {flow && <Packet pts={[[150, 520], [500, 520], [850, 520]]} t0={T.normally - 0.3} d={1.3} loop color={GREEN} />}
    <Appear t0={T.monitor - 0.3} t1={T.initially - 0.2} style={{left: 0, right: 0, top: 590, textAlign: 'center'}}><Plate size={30}>watches every call to payment</Plate></Appear>
    {t > T.initially - 0.3 && <StateLamps s="closed" />}
    <Appear t0={T.closed - 0.1} from="scale" style={{left: 0, right: 0, top: 590, textAlign: 'center'}}><Plate size={30} bg={GREEN} color="#fff">CLOSED = calls go through</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ 09 failures -> trip
const S9: React.FC = () => {
  const t = useT();
  const open = t > T.open1 - 0.1;
  const n = Math.min(5, Math.floor(clamp((t - T.failures) / (T.open1 - 0.2 - T.failures)) * 5.99));
  return <>
    <Section t0={72.3} n="09" title="FAILURES PILE UP" color={RED} />
    <Appear t0={72.4} from="left" style={{left: 30, top: 260}}><Block label="ORDER" sub="order-svc" w={240} h={150} /></Appear>
    <div style={{position: 'absolute', left: 418, top: 190}}><Breaker state={open ? 'open' : 'closed'} s={0.95} /></div>
    <Appear t0={72.5} from="right" style={{left: 730, top: 260}}><Block label="PAYMENT" sub="payment-svc" w={240} h={150} state="down" /></Appear>
    <Wire x1={270} y1={335} x2={418} y2={335} t0={72.4} flow={!open} />
    <Wire x1={580} y1={335} x2={730} y2={335} t0={72.4} flow={!open} cut={open} />
    {Array.from({length: 5}).map((_, i) => <Spark key={i} x={745} y={335} t0={T.failures + i * (T.open1 - T.failures - 0.2) / 5} color={RED} />)}
    <Appear t0={T.failures - 0.2} style={{left: 310, top: 520}}><Seg label="FAILURES / THRESHOLD" text={`${n}/5`} color={n >= 5 ? RED : AMBER} size={70} /></Appear>
    <StateLamps s={open ? 'open' : 'closed'} />
  </>;
};

// ------------------------------------------------------------------ 10 open: fail fast
const S10: React.FC = () => {
  const t = useT();
  const k = ((t - 78) / 1.4) % 1; const px = k < 0.5 ? lerp(270, 400, k * 2) : lerp(400, 270, (k - 0.5) * 2);
  return <>
    <Section t0={77.7} n="10" title="OPEN = FAIL FAST" color={RED} />
    <Appear t0={77.8} from="left" style={{left: 30, top: 200}}><Block label="ORDER" sub="order-svc" w={240} h={150} /></Appear>
    <div style={{position: 'absolute', left: 418, top: 130}}><Breaker state="open" s={0.95} /></div>
    <Appear t0={77.9} from="right" style={{left: 730, top: 200}}><Block label="PAYMENT" sub="payment-svc" w={240} h={150} state="down" /></Appear>
    <Wire x1={270} y1={275} x2={418} y2={275} t0={77.8} flow={false} />
    <Wire x1={580} y1={275} x2={730} y2={275} t0={77.8} cut />
    {t > 78 && <div style={{position: 'absolute', left: px - 16, top: 259, width: 32, height: 32, borderRadius: 6, background: k < 0.5 ? ORANGE : RED, border: `4px solid ${INK}`}} />}
    <Appear t0={T.matlab} style={{left: 40, top: 470}}>
      <div style={{display: 'flex', gap: 30, alignItems: 'center'}}>
        <div style={{opacity: t > T.immediately - 0.2 ? 0.45 : 1, position: 'relative'}}>
          <Seg label="BEFORE: WAIT" text="30s" color={AMBER} size={64} />
          {t > T.immediately - 0.2 && <div style={{position: 'absolute', left: -10, right: -10, top: '55%', height: 8, background: RED, transform: 'rotate(-8deg)'}} />}
        </div>
        <Appear t0={T.immediately - 0.2} from="scale" style={{position: 'relative'}}><Seg label="NOW: FAIL FAST" text="5ms" color={GREEN} size={64} /></Appear>
      </div>
    </Appear>
    <Appear t0={T.unnecessary - 0.2} style={{left: 0, right: 0, top: 690, textAlign: 'center'}}><Plate size={30} bg={GREEN} color="#fff">no wasted threads on a dead service</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ 11 half-open
const S11: React.FC = () => {
  const t = useT();
  const half = t > T.halfopen - 0.1;
  const left = Math.max(0, Math.ceil(30 * (1 - clamp((t - T.permanently) / (T.halfopen - 0.2 - T.permanently)))));
  return <>
    <Section t0={89.3} n="11" title="HALF-OPEN: TEST IT" color={AMBER} />
    <Appear t0={89.4} from="left" style={{left: 30, top: 260}}><Block label="ORDER" sub="order-svc" w={240} h={150} /></Appear>
    <div style={{position: 'absolute', left: 418, top: 190}}><Breaker state={half ? 'half' : 'open'} s={0.95} /></div>
    <Appear t0={89.5} from="right" style={{left: 730, top: 260}}><Block label="PAYMENT" sub="payment-svc" w={240} h={150} state={t > T.recover ? 'slow' : 'down'} /></Appear>
    <Wire x1={270} y1={335} x2={418} y2={335} t0={89.4} flow={false} />
    <Wire x1={580} y1={335} x2={730} y2={335} t0={89.4} cut={!half} flow={false} />
    {!half && <Appear t0={T.permanently - 0.2} style={{left: 300, top: 520}}><Seg label="COOL-DOWN TIMER" text={`${String(left).padStart(2, '0')}s`} color={AMBER} size={70} /></Appear>}
    {half && <Packet pts={[[270, 335], [500, 335], [730, 335]]} t0={T.limited2 - 0.1} d={1.5} color={AMBER} label="test" loop />}
    {half && <Appear t0={T.limited2 - 0.2} style={{left: 0, right: 0, top: 540, textAlign: 'center'}}><Plate size={30} bg={AMBER}>only a few test requests</Plate></Appear>}
    <Appear t0={T.recover - 0.4} from="scale" style={{left: 0, right: 0, top: 610, textAlign: 'center'}}><Plate size={30}>is payment back?</Plate></Appear>
    <StateLamps s={half ? 'half' : 'open'} y={720} />
  </>;
};

// ------------------------------------------------------------------ 12 the state machine
const Node: React.FC<{label: string; color: string; on: boolean; x: number; y: number}> = ({label, color, on, x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 260, height: 110, borderRadius: 55, border: `5px solid ${INK}`, background: on ? color : '#fff', boxShadow: on ? `0 0 34px ${color}, 0 6px 0 ${INK}` : `0 6px 0 ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: 36, color: on ? '#fff' : INK}}>{label}</div>
);
const Edge: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; hot: boolean; color: string; lx: number; ly: number}> = ({x1, y1, x2, y2, label, hot, color, lx, ly}) => {
  const a = Math.atan2(y2 - y1, x2 - x1); const c = hot ? color : MUTED;
  return <>
    <svg width={1000} height={850} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={hot ? 9 : 5} strokeDasharray={hot ? undefined : '12 10'} />
      <polygon points={`${x2},${y2} ${x2 - 26 * Math.cos(a - 0.45)},${y2 - 26 * Math.sin(a - 0.45)} ${x2 - 26 * Math.cos(a + 0.45)},${y2 - 26 * Math.sin(a + 0.45)}`} fill={c} />
    </svg>
    {label && <div style={{position: 'absolute', left: lx, top: ly, fontFamily: MONO, fontWeight: 700, fontSize: 22, color: hot ? INK : MUTED, background: hot ? '#fff' : 'transparent', padding: '2px 8px', border: hot ? `3px solid ${color}` : 'none', borderRadius: 6, whiteSpace: 'nowrap'}}>{label}</div>}
  </>;
};
const S12: React.FC = () => {
  const t = useT();
  const ok = t > T.close - 0.2 && t < T.continue - 0.3; const bad = t > T.dobara1 - 0.3;
  return <>
    <Section t0={99.8} n="12" title="THE 3 STATES" />
    <Edge x1={330} y1={210} x2={600} y2={210} label="failures > limit" hot={false} color={RED} lx={360} ly={160} />
    <Edge x1={760} y1={270} x2={620} y2={500} label="cool-down over" hot={false} color={AMBER} lx={710} ly={380} />
    <Edge x1={400} y1={500} x2={240} y2={275} label="success" hot={ok} color={GREEN} lx={110} ly={390} />
    <Edge x1={600} y1={540} x2={700} y2={278} label="" hot={bad} color={RED} lx={0} ly={0} />
    <Appear t0={T.continue - 0.3} style={{left: 690, top: 470}}><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: bad ? INK : MUTED, background: bad ? '#fff' : 'transparent', border: bad ? `3px solid ${RED}` : 'none', borderRadius: 6, padding: '2px 8px'}}>failure</span></Appear>
    <Appear t0={99.9} from="scale" style={{left: 0, top: 0}}><Node label="CLOSED" color={GREEN} on={ok} x={60} y={160} /></Appear>
    <Appear t0={100.0} from="scale" style={{left: 0, top: 0}}><Node label="OPEN" color={RED} on={bad} x={620} y={160} /></Appear>
    <Appear t0={100.1} from="scale" style={{left: 0, top: 0}}><Node label="HALF-OPEN" color={AMBER} on={!ok && !bad} x={330} y={500} /></Appear>
    <Appear t0={T.successfully - 0.2} t1={T.continue - 0.4} style={{left: 0, right: 0, top: 700, textAlign: 'center'}}><Plate size={30} bg={GREEN} color="#fff">tests pass &rarr; back to CLOSED</Plate></Appear>
    <Appear t0={T.continue - 0.3} style={{left: 0, right: 0, top: 700, textAlign: 'center'}}><Plate size={30} bg={RED} color="#fff">still failing &rarr; OPEN again</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ 13 retry vs breaker
const Card: React.FC<{title: string; color: string; children: React.ReactNode}> = ({title, color, children}) => (
  <div style={{width: 440, height: 560, background: '#fff', border: `5px solid ${INK}`, borderRadius: 14, boxShadow: `0 8px 0 ${INK}`, overflow: 'hidden'}}>
    <div style={{height: 70, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: 36, color: '#fff'}}>{title}</div>
    <div style={{position: 'relative', height: 490}}>{children}</div>
  </div>
);
const S13: React.FC = () => {
  const t = useT();
  const spin = (t * 200) % 360;
  return <>
    <Section t0={107.7} n="13" title="RETRY ≠ BREAKER" />
    <Appear t0={T.retry - 0.4} from="left" style={{left: 30, top: 130}}>
      <Card title="RETRY" color={INK}>
        <svg width={440} height={300} style={{position: 'absolute', left: 0, top: 10}}>
          <circle cx={220} cy={140} r={90} fill="none" stroke={ORANGE} strokeWidth={12} strokeDasharray="420 150" transform={`rotate(${spin} 220 140)`} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 115, textAlign: 'center', fontFamily: HEAD, fontSize: 56, color: INK}}>&#8635;</div>
        <Note size={36} style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>request failed?</Note>
        <Appear t0={T.dobara2 - 0.3} style={{left: 0, right: 0, top: 360, textAlign: 'center'}}><Note size={44} color={ORANGE}>try it again</Note></Appear>
      </Card>
    </Appear>
    <Appear t0={T.idea - 0.6} from="right" style={{left: 530, top: 130}}>
      <Card title="BREAKER" color={RED}>
        <div style={{position: 'absolute', left: 152, top: 26}}><Breaker state={t > T.temporarily - 0.2 ? 'open' : 'closed'} s={0.8} /></div>
        <Note size={36} style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>dependency failing?</Note>
        <Appear t0={T.temporarily - 0.2} style={{left: 0, right: 0, top: 360, textAlign: 'center'}}><Note size={44} color={RED}>stop calling it</Note><Note size={30} color={MUTED}>for a while</Note></Appear>
      </Card>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 14 use both
const S14: React.FC = () => (<>
  <Section t0={119.5} n="14" title="USE BOTH TOGETHER" color={GREEN} />
  <Appear t0={T.real - 0.1} from="scale" style={{left: 0, right: 0, top: 150, textAlign: 'center'}}><span style={{fontFamily: HEAD, fontSize: 84, color: INK}}>RETRY <span style={{color: ORANGE}}>+</span> BREAKER</span></Appear>
  <Appear t0={T.temporary - 0.3} from="left" style={{left: 40, top: 330}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Plate size={34} bg={INK} color="#fff">RETRY</Plate><Note size={42}>&rarr; temporary blips</Note></div>
  </Appear>
  <Appear t0={T.repeated - 0.3} from="left" style={{left: 40, top: 450}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Plate size={34} bg={RED} color="#fff">BREAKER</Plate><Note size={42}>&rarr; repeated failures</Note></div>
  </Appear>
  <Appear t0={T.cascading - 0.2} from="left" style={{left: 40, top: 570}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Plate size={34} bg={RED} color="#fff">BREAKER</Plate><Note size={42}>&rarr; stops the cascade</Note></div>
  </Appear>
</>);

// ------------------------------------------------------------------ 15 next time
const S15: React.FC = () => {
  const t = useT(); const second = t > T.question2 - 0.3;
  return <>
    <Section t0={126.7} n="15" title="NEXT TIME IT FAILS" />
    <Appear t0={T.fix - 1.4} from="left" style={{left: 40, top: 160}}>
      <div style={{width: 920, padding: '26px 30px', background: '#fff', border: `5px solid ${INK}`, borderRadius: 14, boxShadow: `0 8px 0 ${INK}`, opacity: second ? 0.5 : 1, position: 'relative'}}>
        <Note size={26} color={MUTED}>question 1</Note>
        <div style={{fontFamily: HEAD, fontSize: 52, color: INK}}>How do we fix it?</div>
      </div>
    </Appear>
    <Appear t0={T.question2 - 0.3} from="right" style={{left: 40, top: 400}}>
      <div style={{width: 920, padding: '26px 30px', background: ORANGE, border: `5px solid ${INK}`, borderRadius: 14, boxShadow: `0 8px 0 ${INK}`}}>
        <Note size={26} color={INK}>also ask</Note>
        <div style={{fontFamily: HEAD, fontSize: 46, color: '#fff', lineHeight: 1.1}}>How do we stop it<br />from spreading?</div>
      </div>
    </Appear>
    <Appear t0={T.spread2 - 0.3} from="scale" style={{left: 0, right: 0, top: 680, textAlign: 'center'}}><Plate size={32} bg={INK} color="#fff">&rarr; put a circuit breaker in front</Plate></Appear>
  </>;
};

// ------------------------------------------------------------------ hook overlay (full screen, 0 - 8.4 s)
const Hook: React.FC = () => {
  const t = useT(); if (t > 8.5) return null;
  const out = clamp((8.3 - t) / 0.3); const saved = t > T.nahi0 - 0.05;
  const svcs = ['AUTH', 'ORDERS', 'PAYMENT', 'CART'];
  const downAt = [2.2, 2.5, 0.9, 2.8];
  return <div style={{position: 'absolute', left: 0, right: 0, top: 1560, display: 'flex', justifyContent: 'center', gap: 18, opacity: out}}>
    {svcs.map((n, i) => {
      const down = t > downAt[i] && (!saved || i === 2);
      return <Appear key={n} t0={0.25 + i * 0.08} style={{position: 'relative'}}>
        <div style={{position: 'relative'}}>
          <Block label={n} sub={i === 2 && saved ? 'isolated' : 'service'} w={235} h={130} state={down ? 'down' : 'ok'} />
          {i === 2 && saved && <div style={{position: 'absolute', left: 82, top: -150}}><Breaker state="open" s={0.42} /></div>}
        </div>
      </Appear>;
    })}
  </div>;
};

export const scenes: Scene[] = [
  {a: 8.45, b: 14.0, el: S1}, {a: 14.0, b: 19.3, el: S2}, {a: 19.3, b: 28.3, el: S3}, {a: 28.3, b: 37.7, el: S4}, {a: 37.7, b: 48.6, el: S5},
  {a: 48.6, b: 56.6, el: S6}, {a: 56.6, b: 62.45, el: S7}, {a: 64.8, b: 72.3, el: S8}, {a: 72.3, b: 77.7, el: S9}, {a: 77.7, b: 89.3, el: S10},
  {a: 89.3, b: 99.8, el: S11}, {a: 99.8, b: 107.7, el: S12}, {a: 107.7, b: 119.5, el: S13}, {a: 119.5, b: 126.6, el: S14}, {a: 126.6, b: 137.8, el: S15}];

export const cfg: Config = {
  title: 'CIRCUIT BREAKER',
  sub: 'BUILDING BACKEND SYSTEMS · EP 13',
  full: [[0, 8.45], [62.45, 64.8], [137.8, 999]],
  trips: [0.9, T.nahi0 - 0.05, T.down - 0.1, T.spread - 0.1, T.open1 - 0.1],
  overlays: [Hook],
};
