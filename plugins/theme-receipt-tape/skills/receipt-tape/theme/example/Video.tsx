// How write-ahead logging (WAL) works. Theme: receipt-tape. Not part of a series.
// Hard cuts: talk = speaker full screen with his real background; page = full-screen desk explainer.
// Page content lives between y 140 and y 1570 (captions below). LSNs, user ids and balances are illustrative.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Head, Slip, Row, Rule, Card, Stamp, Arrow, Barcode, Chip, Icon, Logo, At, Appear, PopIn, Blackout,
  INK, FADED, RED, TEAL, AMBER, WHITE, MUTED, PAPER, MONO, SANS, DISPLAY} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;

export const cfg: Config = {
  cuts: [
    {a: 0, b: 1.2, m: 'talk'},
    {a: 1.2, b: 8.2, m: 'page'},
    {a: 8.2, b: 17.5, m: 'talk'},
    {a: 17.5, b: 24.6, m: 'page'},
    {a: 24.6, b: 28.2, m: 'talk'},
    {a: 28.2, b: 42.3, m: 'page'},
    {a: 42.3, b: 44.1, m: 'talk'},
    {a: 44.1, b: 55.2, m: 'page'},
    {a: 55.2, b: 59.0, m: 'talk'},
    {a: 59.0, b: 64.8, m: 'page'},
    {a: 64.8, b: 66.6, m: 'talk'},
    {a: 66.6, b: 82.2, m: 'page'},
    {a: 82.2, b: 85.0, m: 'talk'},
    {a: 85.0, b: 99.0, m: 'page'},
    {a: 99.0, b: 100.4, m: 'talk'},
    {a: 100.4, b: 103.5, m: 'page'},
    {a: 103.5, b: END + 1, m: 'talk'},
  ],
};

const ease3 = (x: number) => 1 - Math.pow(1 - x, 3);
const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = WHITE, font = SANS, w = 800, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.15, ...style}}>{children}</div>
);
const Hdr: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: INK, textAlign: 'center', letterSpacing: 2}}>{children}</div>;
const Blink: React.FC<{children: React.ReactNode}> = ({children}) => { const f = useCurrentFrame(); return <span style={{opacity: Math.floor(f / 8) % 2 ? 0.25 : 1}}>{children}</span>; };
/** data row inside a manila card */
const DRow: React.FC<{k: string; v: React.ReactNode; hl?: boolean; size?: number}> = ({k, v, hl, size = 30}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: size, color: INK, padding: '8px 10px', borderBottom: '2px dashed rgba(0,0,0,.18)', background: hl ? 'rgba(232,163,59,.35)' : 'transparent', borderRadius: 6}}>
    <span>{k}</span><span style={{fontWeight: 700}}>{v}</span>
  </div>
);
/** a value that swaps from a to b at t1 */
const Swap: React.FC<{a: string; b: string; t1: number; color?: string}> = ({a, b, t1, color = TEAL}) => {
  const t = useT(); if (t < t1) return <span>{a}</span>;
  const k = ease(t, t1, 0.3);
  return <span style={{color, display: 'inline-block', transform: `scale(${1.25 - 0.25 * k})`}}>{b}</span>;
};
const Bucket: React.FC<{size?: number}> = ({size = 220}) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 200 210">
    <ellipse cx="100" cy="40" rx="86" ry="26" fill="#B86E12" />
    <path d="M14 40 L36 182 Q100 214 164 182 L186 40 Q100 76 14 40 Z" fill={AMBER} />
    <ellipse cx="100" cy="40" rx="78" ry="20" fill="#7A4A0E" />
    <text x="100" y="140" textAnchor="middle" fontFamily="Archivo Black" fontSize="46" fill={INK}>S3</text>
  </svg>
);
const DbBox: React.FC<{x: number; y: number; t0: number; label: string; sub: string; color?: string}> = ({x, y, t0, label, sub, color = WHITE}) => (
  <At x={x} y={y}><PopIn t0={t0}>
    <div style={{width: 330, height: 330, borderRadius: 26, border: `4px solid ${color}`, background: 'rgba(255,255,255,.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
      <div style={{width: 120, height: 120, borderRadius: 24, background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo src="logos/postgres.svg" h={90} /></div>
      <Txt size={42} font={DISPLAY} w={400}>{label}</Txt>
      <Txt size={26} font={MONO} w={400} color={MUTED}>{sub}</Txt>
    </div>
  </PopIn></At>
);

// ------------------------------------------------------------------ scenes
const Hook: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={1.25} kicker="// INCIDENT REPORT" title="Data bacha kaise?" />
    <Slip x={170} y={420} w={740} h={720} t0={1.3} d={0.7}>
      <Hdr>DB SERVER #01</Hdr>
      <Rule />
      <Row t0={T.entry} left="INSERT user_42" right="SAVED" rcolor={TEAL} />
      <Row t0={T.power} left="power" right={t > T.restart ? 'BACK ON' : 'LOST'} rcolor={t > T.restart ? TEAL : RED} />
      <Row t0={T.server} left="server" right={t > T.restart ? 'RESTART' : 'OFF'} rcolor={t > T.restart ? AMBER : RED} />
      <Rule />
      <Row t0={6.4} left="user_42" right="RECOVERED" rcolor={TEAL} bold />
      <div style={{marginTop: 40, display: 'flex', justifyContent: 'center'}}>{t > 6.9 && <Barcode w={420} h={80} seed={5} />}</div>
    </Slip>
    <Stamp x={540} y={1000} t0={T.recover} text="DATA SAFE" color={TEAL} size={68} />
    <Blackout a={T.power} b={T.restart} sub="server: OFF" />
    <At x={0} y={1270} style={{width: 1080, textAlign: 'center'}}><PopIn t0={T.kaise}><Txt size={110} font={DISPLAY} w={400} color={RED}>Kaise?</Txt></PopIn></At>
  </>;
};

const Problem: React.FC = () => {
  const t = useT(); const prog = clamp((t - T.update) / 1.6) * 0.62;
  const broken = t > T.crash;
  return <>
    <Head t0={17.6} kicker="// THE PROBLEM" title="Direct write = risky" />
    <Card x={150} y={480} w={780} h={600} t0={T.main - 0.1} label="users.dat  (main data file)">
      <DRow k="id" v="balance" />
      <DRow k="user_17" v="₹12,300" />
      <DRow k="user_42" hl={t > T.update} v={!broken ? (t > T.update ? <span>₹5,000 → <Blink>...</Blink></span> : '₹5,000') : <span style={{color: RED}}>₹4,0▒▒▒</span>} />
      <DRow k="user_58" v="₹830" />
      <div style={{marginTop: 34, fontFamily: MONO, fontSize: 26, color: INK}}>writing to disk</div>
      <div style={{marginTop: 10, height: 34, borderRadius: 8, background: 'rgba(0,0,0,.15)', overflow: 'hidden'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', background: broken ? RED : INK}} />
      </div>
      <div style={{marginTop: 10, fontFamily: MONO, fontSize: 26, color: broken ? RED : FADED}}>{t > T.update ? `${Math.round(prog * 100)}%` : ''}{broken ? '  STOPPED' : ''}</div>
    </Card>
    <Blackout a={T.crash} b={T.crash + 0.9} label="CRASH" />
    <Stamp x={540} y={1250} t0={T.incomplete} text="INCOMPLETE" size={72} />
  </>;
};

const WalIntro: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={28.25} kicker="// THE FIX" title="WAL" />
    <At x={420} y={205}><Appear t0={T.seq}><Txt size={40} font={MONO} w={700} color={MUTED}>= sequential log</Txt></Appear></At>
    <Slip x={110} y={420} w={570} h={900} t0={28.6} d={0.9}>
      <Hdr>WRITE-AHEAD LOG</Hdr>
      <div style={{fontFamily: MONO, fontSize: 24, color: FADED, textAlign: 'center'}}>append only</div>
      <Rule />
      <Row t0={T.insert} left="#101 INSERT" right="✓" rcolor={TEAL} size={34} />
      <Row t0={T.upd} left="#102 UPDATE" right="✓" rcolor={TEAL} size={34} />
      <Row t0={T.del} left="#103 DELETE" right="✓" rcolor={TEAL} size={34} />
      <Row t0={36.3} left="#104 ..." size={34} color={FADED} />
      <Rule />
      <div style={{fontFamily: MONO, fontSize: 24, color: FADED, marginTop: 10}}>{t > T.seq ? 'next record → bottom' : ''}</div>
    </Slip>
    <At x={720} y={480}><PopIn t0={T.pehle}><Chip color={RED} fg={WHITE} size={30}>1. PEHLE</Chip></PopIn></At>
    <At x={720} y={545}><Appear t0={T.pehle + 0.2}><Txt size={30} font={MONO} w={400} color={MUTED}>log mein</Txt></Appear></At>
    <At x={720} y={820}><PopIn t0={T.baad}><Chip color={WHITE} size={30}>2. BAAD MEIN</Chip></PopIn></At>
    <At x={720} y={885}><Appear t0={T.apply}><Txt size={30} font={MONO} w={400} color={MUTED}>data files</Txt></Appear></At>
    <Arrow x1={690} y1={1080} x2={760} y2={1110} t0={T.baad - 0.1} d={0.3} />
    <Card x={770} y={1040} w={220} h={250} t0={T.baad} label="data" icon="database">
      <div style={{fontFamily: MONO, fontSize: 24, color: INK, lineHeight: 1.6}}>row 1<br />row 2<br />row 3</div>
    </Card>
  </>;
};

const Example: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={44.15} kicker="// EXAMPLE" title="Balance update" />
    <At x={110} y={340}><Appear t0={T.bal}><Txt size={56} font={MONO} w={700}>user_42: <span style={{color: MUTED}}>{t > T.five - 0.1 ? '₹5,000' : ''}</span>{t > T.four - 0.1 && <span style={{color: AMBER}}> → ₹4,000</span>}</Txt></Appear></At>
    <Slip x={110} y={500} w={440} h={560} t0={T.pehle3 - 0.3} d={0.6}>
      <Hdr>WAL</Hdr>
      <Rule />
      <Row t0={T.pehle3} left="#204 UPDATE" size={30} bold />
      <Row t0={T.pehle3 + 0.5} left="user_42" size={30} />
      <Row t0={T.logs - 0.3} left="5000→4000" size={30} color={RED} bold />
      <Rule />
      <Row t0={T.logs + 0.4} left="written" right="✓" rcolor={TEAL} size={30} />
    </Slip>
    <At x={130} y={1090}><PopIn t0={T.pehle3}><Chip color={RED} fg={WHITE}>1. LOG</Chip></PopIn></At>
    <Card x={620} y={550} w={350} h={420} t0={T.main2 - 0.1} label="data file">
      <DRow k="user_42" v={<Swap a="₹5,000" b="₹4,000" t1={53.4} />} hl={t > 53.4} size={28} />
      <div style={{marginTop: 30, fontFamily: MONO, fontSize: 26, color: t > 53.4 ? TEAL : FADED, display: 'flex', alignItems: 'center', gap: 10}}>
        <Icon name={t > 53.4 ? 'check-circle' : 'hourglass'} size={34} color={t > 53.4 ? TEAL : FADED} />{t > 53.4 ? 'applied' : <span>waiting<Blink>...</Blink></span>}
      </div>
    </Card>
    <At x={640} y={1090}><PopIn t0={53.4}><Chip color={WHITE}>2. DATA FILE</Chip></PopIn></At>
    <Arrow x1={560} y1={780} x2={610} y2={780} t0={53.1} d={0.3} />
    <Stamp x={540} y={1340} t0={T.wal2} text="WRITE-AHEAD LOGGING" size={52} icon="receipt" />
  </>;
};

const CrashScene: React.FC = () => (
  <>
    <Head t0={59.05} kicker="// WHAT IF" title="Crash before write" />
    <Slip x={150} y={460} w={780} h={700} t0={59.2} d={0.6}>
      <Hdr>TXN #204</Hdr>
      <Rule />
      <Row t0={T.record} left="WAL record" right="✓ WRITTEN" rcolor={TEAL} size={34} />
      <Row t0={T.commit} left="COMMIT" right="✓ DONE" rcolor={TEAL} size={34} bold />
      <Row t0={T.file} left="data file" right="PENDING" rcolor={AMBER} size={34} />
      <Rule />
      <div style={{fontFamily: MONO, fontSize: 28, color: FADED, marginTop: 14}}>balance on disk: ₹5,000</div>
      <div style={{fontFamily: MONO, fontSize: 28, color: FADED}}>balance in WAL:  ₹4,000</div>
    </Slip>
    <Blackout a={T.power2} b={70} />
  </>
);

const Recovery: React.FC = () => {
  const t = useT(); const rows = ['#198 INSERT', '#199 UPDATE', '#200 DELETE', '#201 INSERT', '#202 UPDATE', '#203 INSERT', '#204 UPDATE'];
  const cpAt = 3;
  const scan = clamp((t - T.process) / 1.6); const cur = cpAt + scan * 3.99;
  return <>
    <Head t0={66.65} kicker="// RESTART" title="Recovery" />
    <At x={640} y={318}><PopIn t0={T.recovery}><Chip color={AMBER} icon="arrows-clockwise">process: start</Chip></PopIn></At>
    <Slip x={110} y={400} w={560} h={900} t0={66.9} d={0.7}>
      <Hdr>WAL</Hdr>
      <Rule />
      {rows.map((r, i) => {
        const after = i >= cpAt; const lit = after && t > T.relevant + (i - cpAt) * 0.12; const done = after && t > T.process && cur > i + 0.5;
        return <React.Fragment key={r}>
          {i === cpAt && <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 10, opacity: t > T.cp - 0.05 ? 1 : 0}}>
            <div style={{flex: 1, borderTop: `4px dashed ${RED}`}} /><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: RED}}>CHECKPOINT</span><div style={{flex: 1, borderTop: `4px dashed ${RED}`}} />
          </div>}
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 32, height: 66, alignItems: 'center', padding: '0 10px', borderRadius: 6,
            color: !after && t > T.cp ? '#B5AFA2' : INK, background: lit ? (done ? 'rgba(14,140,127,.18)' : 'rgba(232,163,59,.3)') : 'transparent'}}>
            <span>{r}</span><span style={{color: TEAL, fontWeight: 700}}>{done ? 'replay ✓' : ''}</span>
          </div>
        </React.Fragment>;
      })}
      <Rule />
      <div style={{fontFamily: MONO, fontSize: 24, color: FADED, marginTop: 6}}>{t > T.cp ? 'checkpoint se pehle: disk pe hai' : ''}</div>
    </Slip>
    <Arrow x1={680} y1={900} x2={730} y2={900} t0={T.committed - 0.4} d={0.3} />
    <Card x={740} y={760} w={250} h={300} t0={T.committed - 0.3} label="data" icon="database">
      <div style={{fontFamily: MONO, fontSize: 26, color: INK}}>user_42</div>
      <div style={{fontFamily: MONO, fontSize: 40, fontWeight: 700, marginTop: 8}}><Swap a="₹5,000" b="₹4,000" t1={T.restore} /></div>
    </Card>
    <Stamp x={860} y={1150} t0={T.restore} text="RESTORED" color={TEAL} size={40} />
  </>;
};

const Checkpoint: React.FC = () => {
  const t = useT(); const N = 26, cpI = 18; const x0 = 120, x1 = 960, segW = (x1 - x0) / N;
  const bad = clamp((t - T.har) / 1.0), good = clamp((t - T.process3) / 0.5);
  return <>
    <Head t0={75.85} kicker="// CHECKPOINT" title="Reference point" />
    <At x={110} y={360}><Appear t0={T.reference}><Txt size={38} font={MONO} w={700} color={MUTED}>recovery yahin se shuru</Txt></Appear></At>
    <At x={x0} y={500}><Txt size={26} font={MONO} w={400} color={MUTED}>WAL (shuru se ab tak)</Txt></At>
    {Array.from({length: N}).map((_, i) => (
      <At key={i} x={x0 + i * segW} y={570}><Appear t0={76.0 + i * 0.03} dy={-20}>
        <div style={{width: segW - 6, height: 120, background: PAPER, borderRadius: 4, opacity: i < cpI ? 0.5 : 1, boxShadow: '0 6px 12px rgba(0,0,0,.4)'}} />
      </Appear></At>
    ))}
    <At x={x0 + cpI * segW - 7} y={545}><PopIn t0={76.8}><div style={{width: 6, height: 170, background: RED}} /></PopIn></At>
    <At x={x0 + cpI * segW - 8} y={470}><PopIn t0={76.8}><Icon name="flag" size={60} color={RED} /></PopIn></At>
    <At x={x0} y={790}><Appear t0={T.har}><div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="x-circle" size={50} color={RED} /><Txt size={40} font={MONO} w={700} color={RED}>har baar shuru se?</Txt></div></Appear></At>
    {t > T.har && <At x={x0} y={870}><div style={{width: (x1 - x0) * bad, height: 14, background: RED, borderRadius: 7, opacity: 0.8}} /></At>}
    <At x={x0} y={970}><Appear t0={T.process3}><div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="check-circle" size={50} color={TEAL} /><Txt size={40} font={MONO} w={700} color={TEAL}>sirf checkpoint ke baad</Txt></div></Appear></At>
    {t > T.process3 && <At x={x0 + cpI * segW} y={1050}><div style={{width: (N - cpI) * segW * good, height: 14, background: TEAL, borderRadius: 7}} /></At>}
    <Stamp x={540} y={1270} t0={81.9} text="FAST RECOVERY" color={TEAL} size={58} rot={-4} />
  </>;
};

const Replication: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={85.05} kicker="// BONUS" title="Replication" />
    <DbBox x={110} y={480} t0={T.pg} label="Primary" sub="Postgres" />
    <DbBox x={640} y={480} t0={T.doosre} label="Replica" sub="doosra server" color={AMBER} />
    <At x={110} y={850}><Appear t0={T.pg + 0.3}><Txt size={30} font={MONO} w={400} color={MUTED}>WAL records →</Txt></Appear></At>
    {t > T.replication && [0, 1, 2, 3].map(i => {
      const p = ((t - T.replication) * 0.55 + i * 0.25) % 1;
      return <div key={i} style={{position: 'absolute', left: lerp(450, 630, p) - 30, top: 610 - Math.sin(p * Math.PI) * 40, width: 60, height: 74, background: PAPER, borderRadius: 4, opacity: Math.sin(p * Math.PI), boxShadow: '0 6px 10px rgba(0,0,0,.4)',
        fontFamily: MONO, fontSize: 18, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>WAL</div>;
    })}
    <At x={640} y={850}><Appear t0={T.apply2}><div style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name="check-circle" size={44} color={TEAL} /><Txt size={32} font={MONO} w={700} color={TEAL}>changes applied</Txt></div></Appear></At>
    <At x={110} y={1020}><Appear t0={T.replication + 0.2}><Txt size={48} font={SANS} w={800}>Same WAL → <span style={{color: AMBER}}>copy of data</span></Txt></Appear></At>
  </>;
};

const Archive: React.FC = () => {
  const t = useT(); const k = clamp((t - T.archive) / 0.9);
  return <>
    <Head t0={92.35} kicker="// MODERN SETUPS" title="Archive to S3" />
    {[0, 1, 2, 3].map(i => {
      const tt = T.logrec + i * 0.15; if (t < tt) return null; const ki = ease3(clamp((k - i * 0.12) / 0.6));
      const x = lerp(130 + i * 40, 760, ki), y = lerp(520 + i * 50, 640, ki);
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: 210, height: 260, background: PAPER, borderRadius: 4, transform: `rotate(${(i - 1.5) * 4}deg) scale(${1 - 0.6 * ki})`, opacity: 1 - clamp((ki - 0.85) / 0.15), boxShadow: '0 12px 20px rgba(0,0,0,.45)', padding: 18, boxSizing: 'border-box', fontFamily: MONO, fontSize: 22, color: INK}}>
        <b>WAL seg {i + 1}</b><br />#{300 + i * 50}-{349 + i * 50}<br /><span style={{color: FADED}}>--------</span>
      </div>;
    })}
    <At x={730} y={540}><PopIn t0={T.object}><Bucket size={250} /></PopIn></At>
    <At x={700} y={830}><Appear t0={T.s3}><Txt size={44} font={DISPLAY} w={400}>Amazon S3</Txt></Appear></At>
    <At x={700} y={890}><Appear t0={T.object + 0.2}><Txt size={28} font={MONO} w={400} color={MUTED}>object storage</Txt></Appear></At>
    <Arrow x1={480} y1={1000} x2={700} y2={1000} t0={T.archive - 0.3} d={0.4} color={AMBER} />
    <At x={110} y={1140}><Appear t0={T.archive + 0.4}><Txt size={48} font={SANS} w={800}>Logs safe, <span style={{color: AMBER}}>long term</span></Txt></Appear></At>
  </>;
};

const Summary: React.FC = () => (
  <>
    <Head t0={100.45} kicker="// IN SHORT" title="Core idea" />
    <Slip x={190} y={420} w={700} h={820} t0={100.5} d={0.6}>
      <Hdr>WRITE-AHEAD LOGGING</Hdr>
      <Rule />
      <Row t0={T.pehle5} left="1. log likho" right="FIRST" rcolor={RED} size={36} bold />
      <Row t0={T.data5} left="2. data files" right="THEN" rcolor={TEAL} size={36} bold />
      <Rule />
      <div style={{fontFamily: MONO, fontSize: 28, color: FADED, textAlign: 'center', marginTop: 18}}>crash? WAL se recover</div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 40}}><Appear t0={102.6}><Barcode w={460} h={90} seed={11} /></Appear></div>
      <div style={{fontFamily: MONO, fontSize: 24, color: FADED, textAlign: 'center', marginTop: 16}}>THANK YOU FOR WATCHING</div>
    </Slip>
  </>
);

export const scenes: Scene[] = [
  {a: 1.2, b: 8.2, el: Hook},
  {a: 17.5, b: 24.6, el: Problem},
  {a: 28.2, b: 42.3, el: WalIntro},
  {a: 44.1, b: 55.2, el: Example},
  {a: 59.0, b: 64.8, el: CrashScene},
  {a: 66.6, b: 75.6, el: Recovery},
  {a: 75.6, b: 82.2, el: Checkpoint},
  {a: 85.0, b: 92.3, el: Replication},
  {a: 92.3, b: 99.0, el: Archive},
  {a: 100.4, b: 103.5, el: Summary},
];
