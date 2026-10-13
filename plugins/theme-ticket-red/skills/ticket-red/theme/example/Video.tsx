// How BookMyShow prevents double booking. Theme: ticket-red. Not part of a series.
// Card scenes: 1000 x 840 (red band = top 76 px, headings from y 94). Icons: Phosphor duotone. Assets: logos/bms.png, artist.jpg.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Scene, clamp, lerp, ease, useT, Shake, springAt} from './core';
import {Config, Appear, Tag, Heading, Flow, Icon, Logo, Node, Seat, Ticket, PAPER2, CARD, LINE, INK, SUB, RED, DEEP, GREEN, AMBER, BLUE, DISPLAY, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;
const BMS = 'logos/bms.png';

const Label: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, color = INK, font = DISPLAY, w = 800, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.15, ...style}}>{children}</div>
);
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
const Chip: React.FC<{icon?: string; children: React.ReactNode; color?: string; size?: number; solid?: boolean}> = ({icon, children, color = RED, size = 28, solid}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 999, background: solid ? color : CARD, border: `3px solid ${color}`, boxShadow: '0 8px 20px rgba(31,31,43,.12)'}}>
    {icon && <Icon name={icon} size={size * 1.2} color={solid ? '#fff' : color} />}
    <span style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: solid ? '#fff' : INK, whiteSpace: 'nowrap'}}>{children}</span>
  </div>
);
const Box: React.FC<{w: number; h?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, color = LINE, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 18, background: CARD, border: `3px solid ${color}`, boxShadow: '0 8px 18px rgba(31,31,43,.08)', boxSizing: 'border-box', ...style}}>{children}</div>
);
const Mark: React.FC<{t0: number; ok?: boolean; size?: number}> = ({t0, ok, size = 60}) => {
  const t = useT(); const k = ease(t, t0, 0.25); if (k <= 0) return null;
  return <div style={{transform: `scale(${1.5 - 0.5 * k})`, opacity: k}}><Icon name={ok ? 'check-circle' : 'x-circle'} size={size} color={ok ? GREEN : RED} /></div>;
};

// ------------------------------------------------------------------ 00 one seat, two users
const SeatMap: React.FC<{x: number; y: number; hot?: boolean; size?: number}> = ({x, y, hot, size = 46}) => {
  const rows = 'ABCDE';
  return <At x={x} y={y}>
    <div style={{width: 10 * (size + 10) - 10, height: 26, borderRadius: '50% 50% 0 0', background: `linear-gradient(${RED}55, ${RED}11)`, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Label size={16} font={MONO} w={700} color={DEEP}>STAGE</Label></div>
    {rows.split('').map((r, ri) => <div key={r} style={{display: 'flex', gap: 10, marginBottom: 10}}>
      {Array.from({length: 10}).map((_, c) => { const isA10 = ri === 0 && c === 9;
        return <Seat key={c} size={size} state={isA10 ? (hot ? 'hot' : 'free') : 'taken'} label={isA10 ? 'A10' : undefined} />; })}
    </div>)}
  </At>;
};
const S0: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={7.65} kicker="THE PROBLEM" title="1 seat, 2 users, same time" />
    <SeatMap x={210} y={200} hot={t > T.same} />
    {[0, 1].map(i => <Appear key={i} t0={T.same + i * 0.15} from={i ? 'right' : 'left'} style={{left: i ? 760 : 40, top: 540}}>
      <Node icon="user" label={`USER ${i + 1}`} sub="20:00:00.000" w={200} tone={i ? 'blue' : 'red'} on />
    </Appear>)}
    <Flow x1={240} y1={600} x2={740} y2={262} t0={T.koshish - 0.6} n={2} color={RED} />
    <Flow x1={760} y1={600} x2={760} y2={262} t0={T.koshish - 0.4} n={2} color={BLUE} />
    <Appear t0={T.kisko} from="scale" style={{left: 450, top: 520}}><div style={{width: 100, height: 100, borderRadius: 50, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${RED}88`}}><Icon name="question" size={64} color="#fff" /></div></Appear>
    <Appear t0={T.ensure} from="up" style={{left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}><Chip icon="shield-check" color={GREEN} size={26}>backend must allow only ONE</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 01 race condition
const Lane: React.FC<{i: number; y: number; color: string}> = ({i, y, color}) => {
  const t = useT(); const twice = t > T.twice;
  return <>
    <Appear t0={T.user1 + i * 0.5} from="left" style={{left: 26, top: y}}><Node icon="user" label={`USER ${i + 1}`} w={170} tone={i ? 'blue' : 'red'} on /></Appear>
    <Appear t0={T.check + i * 0.15} from="up" style={{left: 222, top: y + 10}}>
      <Box w={270} h={130} style={{padding: 14}}><Label size={18} font={MONO} w={700} color={SUB}>1 · CHECK A10</Label>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 10}}>{t > T.avail1 + i * 0.15 && <Icon name="check-circle" size={34} color={GREEN} />}<Label size={26} color={GREEN}>{t > T.avail1 + i * 0.15 ? 'available' : '...'}</Label></div>
      </Box>
    </Appear>
    <Appear t0={T.create + i * 0.15} from="up" style={{left: 510, top: y + 10}}>
      <Box w={230} h={130} style={{padding: 14}}><Label size={18} font={MONO} w={700} color={SUB}>2 · CREATE</Label><Label size={26} style={{marginTop: 10}}>booking</Label></Box>
    </Appear>
    <Appear t0={T.create2 + i * 0.2} from="right" style={{left: 760, top: y + 4}}>
      <Shake t0={T.twice} d={0.5} amp={8}>
        <Ticket w={210} h={142} notch={0.62} color={twice ? RED : color}>
          <div style={{padding: '12px 16px'}}><Label size={16} font={MONO} w={700} color={SUB}>TICKET</Label><Label size={40} color={twice ? RED : INK}>A10</Label></div>
        </Ticket>
      </Shake>
    </Appear>
  </>;
};
const S1: React.FC = () => <>
  <Heading t0={16.25} kicker="WHAT GOES WRONG" title="Check, then create" />
  <Lane i={0} y={210} color={RED} />
  <Lane i={1} y={410} color={BLUE} />
  <Appear t0={T.twice} from="scale" style={{left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center'}}><Chip icon="warning" color={RED} size={28}>same seat booked twice</Chip></Appear>
  <Appear t0={T.race} from="up" style={{left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center'}}><Tag solid color={DEEP} size={34}>RACE CONDITION</Tag></Appear>
</>;

// ------------------------------------------------------------------ 02 transactions + locking
const S2: React.FC = () => {
  const t = useT(); const locked = t > T.lock && t < T.commit; const booked = t > T.commit; const rej = t > T.reject;
  const rows: [string, string][] = [['A9', 'booked'], ['A10', booked ? 'booked' : 'available'], ['A11', 'booked']];
  return <>
    <Heading t0={36.05} kicker="FIX 1" title="Transactions + locking" />
    <Appear t0={T.r1 - 0.3} from="left" style={{left: 26, top: 250}}><Node icon="user" label="REQUEST 1" sub={booked ? 'committed' : t > T.lock ? 'holds lock' : 'book A10'} w={210} tone="red" on /></Appear>
    <Appear t0={T.doosri - 0.2} from="right" style={{left: 764, top: 250}}><Node icon="user" label="REQUEST 2" sub={rej ? 'rejected' : t > T.wait ? 'waiting...' : 'book A10'} w={210} tone="blue" on={!rej} dim={rej} /></Appear>
    <Appear t0={T.transactions - 0.3} from="up" style={{left: 262, top: 220}}>
      <Box w={476} style={{padding: '16px 20px'}} color={locked ? AMBER : booked ? GREEN : LINE}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Icon name="database" size={34} color={INK} /><Label size={22} font={MONO} w={700}>seats table</Label></div>
        {rows.map(([id, st], i) => <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '10px 14px', borderRadius: 12, background: i === 1 ? (locked ? '#FFF4E0' : booked ? '#E6F6EE' : PAPER2) : '#F6F6F8'}}>
          <Label size={24} font={MONO} w={700}>{id}</Label>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>{i === 1 && locked && <Icon name="lock-key" size={30} color={AMBER} />}<Label size={22} font={MONO} w={700} color={st === 'available' ? GREEN : SUB}>{st}</Label></div>
        </div>)}
      </Box>
    </Appear>
    <Flow x1={236} y1={360} x2={262} y2={360} t0={T.r1} n={1} />
    <Appear t0={T.lock} from="scale" style={{left: 300, top: 520}}><Chip icon="lock-key" color={AMBER} size={24}>A10 locked by request 1</Chip></Appear>
    <Appear t0={T.wait} t1={T.commit - 0.2} from="scale" style={{left: 620, top: 610}}><Chip icon="hourglass" color={BLUE} size={22}>wait / conflict</Chip></Appear>
    <Appear t0={T.commit} from="up" style={{left: 40, top: 620}}><Chip icon="check-circle" color={GREEN} solid size={24}>COMMIT · A10 booked</Chip></Appear>
    <Appear t0={T.reject} from="scale" style={{left: 560, top: 700}}><Chip icon="x-circle" color={RED} solid size={24}>request 2 rejected</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 03 conditional update
const SQL: [string, number][] = [['UPDATE seats', 0], ["SET status = 'booked'", 1], ["WHERE id = 'A10'", 2], ["  AND status = 'available';", 3]];
const S3: React.FC = () => {
  const t = useT(); const keys = [T.sql, T.seats, T.where, T.status2];
  const hot = t > T.availsql - 0.2;
  return <>
    <Heading t0={59.05} kicker="FIX 2" title="Conditional update" />
    <Appear t0={T.sql - 0.4} from="up" style={{left: 40, top: 200}}>
      <div style={{width: 920, borderRadius: 20, background: INK, padding: '22px 28px', boxSizing: 'border-box', boxShadow: '0 14px 30px rgba(31,31,43,.25)'}}>
        <div style={{display: 'flex', gap: 8, marginBottom: 12}}>{[RED, AMBER, GREEN].map((c, i) => <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}</div>
        {SQL.map(([line, i]) => { const n = t > keys[i] ? Math.min(line.length, Math.floor((t - keys[i]) * 40)) : 0;
          return <div key={i} style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, lineHeight: 1.45, color: i === 3 && hot ? '#FFD166' : '#F4F4F8', background: i === 3 && hot ? `${AMBER}26` : 'transparent', borderRadius: 8, whiteSpace: 'pre'}}>
            <span style={{color: '#FF7A93'}}>{line.slice(0, n).split(' ')[0] === 'UPDATE' || line.slice(0, n).startsWith('SET') || line.slice(0, n).startsWith('WHERE') ? '' : ''}</span>{line.slice(0, n)}
          </div>; })}
      </div>
    </Appear>
    <Appear t0={T.availsql} from="scale" style={{left: 640, top: 460}}><Tag size={20} color={AMBER} solid>the check lives in the query</Tag></Appear>
    <Appear t0={T.onerow - 0.3} from="left" style={{left: 40, top: 530}}>
      <Box w={450} color={GREEN} style={{padding: '16px 20px'}}>
        <Label size={18} font={MONO} w={700} color={SUB}>REQUEST 1</Label>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}><Mark t0={T.onerow} ok size={44} /><Label size={28}>1 row updated</Label></div>
        <Label size={20} font={SANS} w={600} color={GREEN} style={{marginTop: 6}}>{t > T.reserve - 0.3 ? 'seat reserved' : ' '}</Label>
      </Box>
    </Appear>
    <Appear t0={T.zero - 0.2} from="right" style={{left: 510, top: 530}}>
      <Box w={450} color={RED} style={{padding: '16px 20px'}}>
        <Label size={18} font={MONO} w={700} color={SUB}>REQUEST 2</Label>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}><Mark t0={T.zero} size={44} /><Label size={28}>0 rows updated</Label></div>
        <Label size={20} font={SANS} w={600} color={RED} style={{marginTop: 6}}>{t > T.otherreq - 0.3 ? 'already taken' : ' '}</Label>
      </Box>
    </Appear>
    <Appear t0={T.atomic - 0.2} from="up" style={{left: 0, right: 0, top: 745, display: 'flex', justifyContent: 'center'}}><Chip icon="lightning" color={DEEP} solid size={26}>check + update = 1 atomic step</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 04 payment + expiry
const S4: React.FC = () => {
  const t = useT(); const held = t > T.reserved && t < T.expire; const expired = t > T.expire; const back = t > T.availagain;
  const p = clamp((t - T.temporarily) / (T.expire - T.temporarily)); const secs = Math.max(0, Math.round(300 * (1 - p)));
  const r = 80, C = 2 * Math.PI * r;
  return <>
    <Heading t0={87.05} kicker="THE PAYMENT GAP" title="Reserve, then expire" />
    <Appear t0={87.2} from="left" style={{left: 30, top: 210}}><Node icon="armchair" label="AVAILABLE" sub="A10" w={260} tone="green" on={!held || back} /></Appear>
    <Appear t0={T.reserved - 0.2} from="up" style={{left: 370, top: 210}}><Node icon="lock-key" label="RESERVED" sub={t > T.nopay ? 'payment pending' : 'held for you'} w={260} tone="amber" on={held} /></Appear>
    <Appear t0={T.reserved} from="right" style={{left: 710, top: 210}}><Node icon="ticket" label="BOOKED" sub="payment confirmed" w={260} tone="red" dim /></Appear>
    <Flow x1={290} y1={300} x2={370} y2={300} t0={T.reserved} n={1} color={AMBER} />
    <Flow x1={630} y1={300} x2={710} y2={300} t0={T.reserved + 0.3} n={1} color={RED} t1={T.expire} />
    {t > T.temporarily - 0.2 && <At x={420} y={430} style={{opacity: ease(t, T.temporarily - 0.2, 0.4)}}>
      <div style={{position: 'relative', width: 180, height: 180}}>
        <svg width={180} height={180} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
          <circle cx={90} cy={90} r={r} fill={CARD} stroke={LINE} strokeWidth={12} />
          <circle cx={90} cy={90} r={r} fill="none" stroke={expired ? RED : AMBER} strokeWidth={12} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * p} />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Label size={40} font={MONO} color={expired ? RED : INK}>{`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}</Label>
          <Label size={16} font={MONO} w={500} color={SUB}>{expired ? 'EXPIRED' : 'expiry timer'}</Label>
        </div>
      </div>
    </At>}
    <Appear t0={T.expiry} from="scale" style={{left: 640, top: 470}}><Tag size={18} color={SUB}>5 min timer (example)</Tag></Appear>
    {expired && <svg width={1000} height={840} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M 420 520 C 260 560, 160 500, 160 410" fill="none" stroke={RED} strokeWidth={5} strokeDasharray="12 10" markerEnd="url(#ah)" opacity={ease(t, T.expire, 0.4)} />
      <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={RED} /></marker></defs>
    </svg>}
    <Appear t0={T.availagain} from="scale" style={{left: 40, top: 530}}><Tag size={20} color={GREEN} solid>available again</Tag></Appear>
    <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, width: 1000}}>
      {([['credit-card', 'payment confirmation', T.confirmation], ['lock-key', 'reservation', T.confirmation + 0.6], ['timer', 'expiry', T.confirmation + 1.6], ['warning', 'failure handling', T.failure]] as [string, string, number][]).map(([ic, l, t0], i) =>
        <Appear key={i} t0={t0} from="up" style={{position: 'relative'}}><Chip icon={ic} size={20} color={i === 3 ? RED : DEEP}>{l}</Chip></Appear>)}
    </div>
  </>;
};

// ------------------------------------------------------------------ talk overlays
const Band: React.FC<{a: number; b: number; children: React.ReactNode; top?: number}> = ({a, b, children, top = 1150}) => {
  const t = useT(); if (t < a - 0.05 || t > b + 0.3) return null;
  const k = ease(t, a, 0.4) * clamp((b + 0.25 - t) / 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{children}</div>;
};
const Plate: React.FC<{children: React.ReactNode; pad?: string}> = ({children, pad = '16px 28px'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: pad, borderRadius: 24, background: CARD, boxShadow: '0 16px 36px rgba(31,31,43,.22)', borderLeft: `10px solid ${RED}`}}>{children}</div>
);
const Big: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 56, color = INK, children}) => (
  <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.05}}>{children}</span>
);
const PopIn: React.FC<{t0: number; children: React.ReactNode}> = ({t0, children}) => {
  const f = useCurrentFrame(); if (f / 30 < t0 - 0.05) return null;
  const p = springAt(f, t0, {damping: 9, stiffness: 170, mass: 0.8});
  return <div style={{transform: `scale(${0.2 + 0.8 * p})`, opacity: clamp(p * 2)}}>{children}</div>;
};
const Intro: React.FC = () => {
  const t = useT(); const pulse = 1 + 0.05 * Math.sin(t * 8);
  return <>
    <Band a={0} b={2.15}><Plate><Logo src={BMS} h={58} /><Big size={46}>prevents double booking?</Big></Plate></Band>
    <Band a={T.karan - 0.15} b={7.5} top={1130}>
      <PopIn t0={T.karan - 0.1}>
        <Ticket w={980} h={400} notch={0.5} color={RED}>
          <div style={{position: 'absolute', left: 24, top: 24, width: 352, height: 352, borderRadius: 18, overflow: 'hidden'}}><Img src={staticFile('artist.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
          <div style={{position: 'absolute', left: 404, top: 34, right: 26}}>
            <Label size={22} font={MONO} w={700} color={DEEP}>LIVE IN CONCERT</Label>
            <Label size={62} style={{marginTop: 4}}>KARAN AUJLA</Label>
          </div>
          <div style={{position: 'absolute', left: 404, top: 222, right: 26, display: 'flex', alignItems: 'center', gap: 12}}>
            <Label size={22} font={SANS} w={600} color={SUB}>booking on</Label><Logo src={BMS} h={40} />
          </div>
          <div style={{position: 'absolute', left: 404, top: 290}}>
            {t > T.oneseat - 0.2 ? <div style={{transform: `scale(${pulse})`, transformOrigin: 'left center'}}><Tag solid color={RED} size={30}><Icon name="armchair" size={34} color="#fff" />1 SEAT LEFT</Tag></div>
              : <Tag color={RED} size={26}>filling fast</Tag>}
          </div>
        </Ticket>
      </PopIn>
    </Band>
  </>;
};
const Outro: React.FC = () => {
  const t = useT();
  const items: [string, string, number][] = [['users', 'handle concurrent requests', T.concurrent], ['database', 'keep DB state consistent', T.consistent], ['credit-card', 'handle payment failures', T.failures]];
  return <>
    <Band a={108.6} b={T.thats - 0.2} top={1120}>
      <PopIn t0={108.7}><Plate><Icon name="ticket" size={56} color={RED} /><Big size={44}>not just "is it available?"</Big></Plate></PopIn>
      {items.map(([ic, l, t0], i) => t > t0 - 0.2 && <PopIn key={i} t0={t0 - 0.2}><Chip icon={ic} size={30} color={[RED, DEEP, AMBER][i]}>{l}</Chip></PopIn>)}
    </Band>
    <Band a={T.thats} b={END} top={1180}>
      <PopIn t0={T.thats}><Plate><Logo src={BMS} h={58} /><Big size={46}>no double booking</Big><Icon name="check-circle" size={56} color={GREEN} /></Plate></PopIn>
    </Band>
  </>;
};

export const cfg: Config = {
  title: 'How double booking is prevented',
  logo: BMS,
  logoH: 36,
  modes: [{a: 0, b: 7.6, m: 'talk'}, {a: 7.6, b: 108.5, m: 'card'}, {a: 108.5, b: END + 1, m: 'talk'}],
  face: {y0: 60, y1: 980},
  overlays: [Intro, Outro],
  speaker: 'speaker.webm',
};

export const scenes: Scene[] = [
  {a: 7.6, b: 16.2, el: S0}, {a: 16.2, b: 36.0, el: S1}, {a: 36.0, b: 59.0, el: S2}, {a: 59.0, b: 87.0, el: S3}, {a: 87.0, b: 108.5, el: S4},
];
