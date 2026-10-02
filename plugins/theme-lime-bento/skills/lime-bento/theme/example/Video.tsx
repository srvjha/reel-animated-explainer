// EXAMPLE: "Database Sharding" (166.4 s). Copy to src/Video.tsx and replace the scenes.
// Scenes are full-frame layers; draw them in the top zone (y 60..960) while the speaker is in the bento tile.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, spring} from 'remotion';
import {Scene, FPS, Shake, Counter, clamp, lerp, ease, win, useT} from './core';
import {Config, Appear, Chip, Header, Cyl, Flow, Line, AppBox, TitleStrip, Typed, pop, BG, PANEL, LINE, LIME, ORANGE, HOT, WHITE, GREY, TEAL, UNB, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const DUR = (data as any).duration as number;

const Hook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; if (t > 8.3) return null;
  const out = clamp((8.1 - t) / 0.3);
  const split = t > T.sharding0 - 0.05;
  const load = ease(t, 0.05, 1.5);
  const sp = spring({frame: f - Math.round((T.sharding0 - 0.05) * FPS), fps: FPS, config: {damping: 12, stiffness: 150}});
  const tp = pop(f, 0.0);
  return <AbsoluteFill style={{opacity: out}}>
    <div style={{opacity: clamp(tp * 1.5), transform: `translateY(${(1 - tp) * -40}px)`}}><TitleStrip pre="DATABASE" hi="SHARDING" slice={T.sharding0 - 0.05} /></div>
    <div style={{position: 'absolute', left: 40, right: 40, top: 1060, height: 330, background: 'rgba(14,15,17,.9)', border: `3px solid ${split ? LIME : load > 0.85 ? HOT : LINE}`, borderRadius: 26, overflow: 'hidden'}}>
      {!split ? <Shake t0={1.3} d={0.8} amp={9}><div style={{display: 'flex', alignItems: 'center', gap: 40, padding: '22px 40px'}}>
        <Cyl w={170} h={270} fill={load} color={load > 0.85 ? HOT : load > 0.6 ? ORANGE : LIME} />
        <div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: GREY, letterSpacing: '.2em'}}>1 DATABASE</div>
          <div style={{fontFamily: UNB, fontWeight: 800, fontSize: 100, color: load > 0.85 ? HOT : WHITE, lineHeight: 1}}>{Math.round(load * 100)}%</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: GREY}}>load</div>
        </div>
      </div></Shake> :
      <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '22px 20px 0'}}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{transform: `translateX(${(1 - sp) * (1.5 - i) * 200}px) scale(${0.6 + 0.4 * sp})`, opacity: clamp(sp * 1.6)}}><Cyl w={150} h={210} fill={0.25 * clamp(sp)} color={LIME} label={`shard ${i + 1}`} sub="25%" /></div>)}
      </div>}
    </div>
  </AbsoluteFill>;
};

const S1: React.FC = () => {
  const t = useT(); const a = 7.8, b = 24.4; if (t < a - 0.1 || t > b + 0.4) return null;
  const fill = lerp(0.25, 0.92, ease(t, T.data1 - 0.2, 3.0));
  const hot = t > T.scale1 - 0.2;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="DAY 1" title="One app, one DB" />
    <Appear t0={T.application - 0.2} t1={b} from="left" style={{left: 60, top: 330}}><AppBox /></Appear>
    <Line x0={330} y0={425} x1={640} y1={425} t0={T.postgres - 0.4} t1={b} color={GREY} />
    <Flow x0={330} y0={425} x1={640} y1={425} t0={T.traffic - 0.3} t1={b} n={Math.round(lerp(3, 10, ease(t, T.traffic, 2)))} speed={lerp(0.7, 1.6, ease(t, T.traffic, 2))} color={hot ? ORANGE : LIME} />
    <Appear t0={T.postgres - 0.2} t1={b} from="right" style={{left: 660, top: 230}}>
      <Shake t0={T.scale1 - 0.2} d={0.7}><Cyl w={260} h={380} fill={t > T.data1 - 0.2 ? fill : 0.25} color={hot ? ORANGE : LIME} label="PostgreSQL" /></Shake>
    </Appear>
    <Appear t0={T.enough - 0.1} t1={T.data1 - 0.3} style={{left: 380, top: 560}}><Chip size={26}>enough for now &#10003;</Chip></Appear>
    <Appear t0={T.data1 - 0.1} t1={T.approaches - 0.3} style={{left: 90, top: 600}}><Chip size={26} color={ORANGE}>data &uarr;</Chip></Appear>
    <Appear t0={T.traffic} t1={T.approaches - 0.3} style={{left: 290, top: 600}}><Chip size={26} color={ORANGE}>traffic &uarr;</Chip></Appear>
    <Appear t0={T.vertical0 - 0.15} t1={b} from="up" style={{left: 60, top: 760}}><Chip size={34} solid>&uarr; VERTICAL</Chip></Appear>
    <Appear t0={T.horizontal0 - 0.15} t1={b} from="up" style={{left: 520, top: 760}}><Chip size={34} color={TEAL} solid>HORIZONTAL &rarr;</Chip></Appear>
  </AbsoluteFill>;
};

const Rack: React.FC<{units: number; color: string}> = ({units, color}) => (
  <div style={{width: 300, background: PANEL, border: `4px solid ${WHITE}`, borderRadius: 16, padding: 12}}>
    {Array.from({length: units}).map((_, i) => <div key={i} style={{height: 30, margin: '6px 0', background: LINE, borderRadius: 6, position: 'relative'}}>
      <div style={{position: 'absolute', right: 12, top: 9, width: 12, height: 12, borderRadius: 6, background: color, boxShadow: `0 0 10px ${color}`}} />
      <div style={{position: 'absolute', left: 12, top: 12, width: 140, height: 6, background: '#3a3f46', borderRadius: 3}} /></div>)}
  </div>
);
const S2: React.FC = () => {
  const t = useT(); const a = 24.4, b = 53.3; if (t < a - 0.1 || t > b + 0.4) return null;
  const grow = ease(t, T.cpu32 - 0.2, 1.2);
  const units = Math.round(lerp(4, 11, ease(t, T.powerful - 0.2, 1.2) * 0.35 + grow * 0.65));
  const limit = t > T.hardware - 0.3;
  const col = limit ? HOT : grow > 0.5 ? ORANGE : LIME;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="OPTION 1" title="Vertical scaling" />
    {/* hardware ceiling */}
    {limit && <Appear t0={T.hardware - 0.3} t1={b} from="down" style={{left: 40, top: 220, width: 560}}>
      <div style={{height: 10, background: `repeating-linear-gradient(45deg, ${HOT} 0 18px, ${BG} 18px 36px)`, borderRadius: 4}} />
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: HOT, marginTop: 8}}>HARDWARE LIMIT</div>
    </Appear>}
    <Appear t0={a + 0.3} t1={b} style={{left: 170, top: lerp(560, 270, clamp((units - 4) / 7)) + (limit ? 6 : 0)}}>
      <Shake t0={T.hardware} d={0.6} amp={12}><Rack units={units} color={col} /></Shake>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: GREY, textAlign: 'center', marginTop: 10}}>same server</div>
    </Appear>
    <Appear t0={T.cpu8 - 0.3} t1={b} from="right" style={{left: 610, top: 300}}>
      <div style={{width: 400, background: PANEL, border: `3px solid ${LINE}`, borderRadius: 20, padding: '20px 26px'}}>
        <div style={{fontFamily: MONO, fontSize: 22, color: GREY, letterSpacing: '.2em'}}>CPU CORES</div>
        <div style={{fontFamily: UNB, fontWeight: 800, fontSize: 84, color: WHITE, lineHeight: 1.1}}><Counter t0={T.cpu32 - 0.1} from={8} to={32} d={0.9} /></div>
        <div style={{fontFamily: MONO, fontSize: 22, color: GREY, letterSpacing: '.2em', marginTop: 10}}>RAM</div>
        <div style={{fontFamily: UNB, fontWeight: 800, fontSize: 84, color: t > T.ram128 - 0.1 ? LIME : WHITE, lineHeight: 1.1}}><Counter t0={T.ram128 - 0.1} from={32} to={128} d={0.9} fmt={n => `${Math.round(n)}GB`} /></div>
      </div>
    </Appear>
    <Appear t0={T.same - 0.1} t1={T.limitation - 0.3} style={{left: 610, top: 720}}><Chip size={26}>same machine, more resources</Chip></Appear>
    <Appear t0={T.expensive - 0.2} t1={b} style={{left: 610, top: 720}}>
      <div style={{width: 400}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: ORANGE}}>COST</div>
        <div style={{height: 26, background: LINE, borderRadius: 13, overflow: 'hidden', marginTop: 6}}><div style={{width: `${lerp(25, 100, ease(t, T.expensive - 0.2, 1.2))}%`, height: '100%', background: ORANGE}} /></div>
      </div>
    </Appear>
    <Appear t0={T.ultimately - 0.1} t1={b} style={{left: 610, top: 820}}><Chip size={26} color={HOT}>still ONE server</Chip></Appear>
  </AbsoluteFill>;
};

const S3: React.FC = () => {
  const t = useT(); const a = 56.0, b = 77.0; if (t < a - 0.1 || t > b + 0.4) return null;
  const repl = t > T.replication - 0.2;
  const full = ease(t, T.zyada - 0.4, 1.4);
  const xs = [190, 540, 890];
  return <AbsoluteFill>
    {!repl ? <Header t0={a} t1={T.replication - 0.2} kicker="OPTION 2" title="Horizontal scaling" color={TEAL} /> : <Header t0={T.replication - 0.2} t1={b} kicker="NOT THE SAME" title="Replication" color={ORANGE} />}
    <Appear t0={T.workload - 0.2} t1={b} from="down" style={{left: 390, top: 230}}><Chip size={30} color={TEAL} solid>WORKLOAD</Chip></Appear>
    {xs.map((x, i) => <React.Fragment key={i}>
      <Line x0={540} y0={300} x1={x} y1={420} t0={T.distribute1 - 0.3} t1={b} color={LINE} />
      <Flow x0={540} y0={300} x1={x} y1={420} t0={T.distribute1 - 0.2} t1={T.replication - 0.2} n={3} color={TEAL} r={8} />
      <Appear t0={T.servers - 0.4 + i * 0.12} t1={b} style={{left: x - 115, top: 410}}>
        <Shake t0={T.zyada + 0.6} d={0.6}><Cyl w={230} h={300} fill={repl ? lerp(0.45, 1.0, full) : 0.3} color={full > 0.7 ? HOT : repl ? ORANGE : TEAL} stripes={repl} label={`db-${i + 1}`} sub={t > T.copies1 - 0.2 ? 'same data copy' : undefined} /></Shake>
      </Appear>
    </React.Fragment>)}
    <Appear t0={T.solution - 0.5} t1={b} from="scale" style={{left: 0, right: 0, top: 820, textAlign: 'center'}}><Chip size={34} color={HOT} solid>copies &ne; solution</Chip></Appear>
  </AbsoluteFill>;
};

const S4: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const a = 77.0, b = 86.9; if (t < a - 0.1 || t > b + 0.4) return null;
  const split = spring({frame: f - Math.round((T.distribute2 - 0.2) * FPS), fps: FPS, config: {damping: 12, stiffness: 150}});
  const pour = ease(t, T.m100b - 0.2, 2.5);
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="SCALE" title="100M users" />
    <Appear t0={T.m100a - 0.2} t1={b} style={{left: 50, top: 230}}>
      <div style={{fontFamily: UNB, fontWeight: 800, fontSize: 88, color: LIME, lineHeight: 1}}><Counter t0={T.m100a - 0.2} from={0} to={100000000} d={1.6} fmt={n => Math.round(n).toLocaleString('en-US')} /></div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: GREY, letterSpacing: '.2em', marginTop: 6}}>USERS</div>
    </Appear>
    {t < T.distribute2 - 0.2 ? <Appear t0={T.m100b - 0.3} t1={T.distribute2 - 0.2} style={{left: 400, top: 410}}>
      <Shake t0={T.m100b + 1.6} d={1.2} amp={8}><Cyl w={280} h={400} fill={lerp(0.3, 1.05, pour)} color={pour > 0.7 ? HOT : ORANGE} label="1 database" /></Shake>
    </Appear> :
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 20 * split}}>
      {[0, 1, 2, 3].map(i => <div key={i} style={{transform: `translateX(${(1 - split) * (1.5 - i) * 120}px)`}}><Cyl w={lerp(240, 210, split)} h={320} fill={lerp(1, 0.28, split)} color={split > 0.5 ? LIME : HOT} /></div>)}
    </div>}
  </AbsoluteFill>;
};

const Hero: React.FC = () => {
  const t = useT(); if (t < 86.7 || t > 89.9) return null;
  return <AbsoluteFill style={{opacity: win(t, 86.75, 89.8, 0.2, 0.2)}}><TitleStrip pre="DATABASE" hi="SHARDING" slice={T.sharding1 - 0.05} /></AbsoluteFill>;
};

const COLX = [135, 405, 675, 945];
const S5: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const a = 89.6, b = 107.0; if (t < a - 0.1 || t > b + 0.4) return null;
  const cut = spring({frame: f - Math.round((T.shards1 - 0.4) * FPS), fps: FPS, config: {damping: 13, stiffness: 140}});
  const ranges = ['1 - 25M', '25M - 50M', '50M - 75M', '75M - 100M'];
  const sh = [T.shard1, T.shard2, T.shard3, T.shard4];
  const active = sh.reduce((acc, v, i) => (t > v - 0.2 ? i : acc), -1);
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="THE IDEA" title="Split the dataset" />
    {/* long dataset bar that cuts into 4 */}
    <Appear t0={T.large - 0.2} t1={b} style={{left: 0, top: 250, width: 1080, height: 120}}>
      {[0, 1, 2, 3].map(i => {
        const x = lerp(60 + i * 240, COLX[i] - 105, cut); const w = lerp(240, 210, cut);
        return <div key={i} style={{position: 'absolute', left: x, top: lerp(0, 30, cut), width: w - 4, height: 90, borderRadius: 12, background: active === i ? LIME : '#2f3a12', border: `3px solid ${LIME}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 24, color: active === i ? BG : LIME}}>
          {Array.from({length: 6}).map((_, j) => <div key={j} style={{width: 18, height: 34, margin: 4, borderRadius: 4, background: active === i ? BG : LIME, opacity: 0.55}} />)}
        </div>;
      })}
      <div style={{position: 'absolute', left: 60, top: -40, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: GREY, opacity: 1 - cut}}>users table &middot; 100M rows</div>
    </Appear>
    {[0, 1, 2, 3].map(i => <Appear key={i} t0={T.shards1 - 0.1 + i * 0.1} t1={b} style={{left: COLX[i] - 100, top: 420}}>
      <div style={{transform: active === i ? 'translateY(-14px)' : undefined}}><Cyl w={200} h={260} fill={0.25 + (t > sh[i] - 0.2 ? 0.45 : 0)} color={active === i ? LIME : TEAL} glow={active === i} label={`shard ${i + 1}`} /></div>
    </Appear>)}
    {[0, 1, 2, 3].map(i => <Appear key={i} t0={sh[i] - 0.15} t1={b} style={{left: COLX[i] - 110, top: 760, width: 220, textAlign: 'center'}}><Chip size={22} color={LIME} solid={active === i}>{ranges[i]}</Chip></Appear>)}
  </AbsoluteFill>;
};

const S6: React.FC = () => {
  const t = useT(); const a = 107.0, b = 126.2; if (t < a - 0.1 || t > b + 0.4) return null;
  const pick = t > T.particular - 0.1;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="NEW PROBLEM" title="Which shard?" color={ORANGE} />
    <Appear t0={T.naya - 0.1} t1={b} from="down" style={{left: 0, right: 0, top: 230, textAlign: 'center'}}><Chip size={32} color={WHITE}>GET /users/<span style={{color: LIME}}>73829104</span></Chip></Appear>
    <Appear t0={T.strategy - 0.2} t1={b} from="scale" style={{left: 340, top: 340}}>
      <div style={{width: 400, height: 110, background: PANEL, border: `4px solid ${LIME}`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 28, color: LIME}}>sharding strategy</div>
    </Appear>
    <Appear t0={T.shardkey - 0.2} t1={b} style={{left: 0, right: 0, top: 470, textAlign: 'center'}}><Chip size={26} color={ORANGE} solid>shard key = user_id</Chip></Appear>
    {COLX.map((x, i) => <React.Fragment key={i}>
      <Line x0={540} y0={300} x1={x} y1={620} t0={T.naya + 0.3} t1={b} dash color={pick && i === 2 ? LIME : LINE} w={pick && i === 2 ? 6 : 4} />
      <Appear t0={T.naya + 0.2 + i * 0.08} t1={b} style={{left: x - 85, top: 600}}>
        <Cyl w={170} h={200} fill={0.45} color={pick && i === 2 ? LIME : TEAL} glow={pick && i === 2} label={`shard ${i + 1}`} />
        {!pick && t > T.kis1 - 0.3 && <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: UNB, fontWeight: 800, fontSize: 70, color: ORANGE}}>?</div>}
      </Appear>
    </React.Fragment>)}
  </AbsoluteFill>;
};

const S7: React.FC = () => {
  const t = useT(); const a = 126.2, b = 140.0; if (t < a - 0.1 || t > b + 0.4) return null;
  const lit = t > T.calculation - 0.1;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="STRATEGY" title="Hash-based" />
    <Appear t0={T.hash1 - 0.5} t1={b} style={{left: 40, top: 230}}>
      <div style={{width: 1000, background: '#0A0B0C', border: `3px solid ${LINE}`, borderRadius: 20, padding: '24px 30px', fontFamily: MONO, fontWeight: 700, fontSize: 38, color: WHITE, lineHeight: 1.6}}>
        <div><span style={{color: GREY}}>shard = </span><Typed t0={T.hash1 - 0.4} text="hash(user_id) % 4" cps={14} /></div>
        {t > T.calculation - 0.3 && <div style={{color: GREY, fontSize: 32}}><Typed t0={T.calculation - 0.3} text="hash(73829104) % 4 = 2" cps={22} /></div>}
      </div>
    </Appear>
    {COLX.map((x, i) => <Appear key={i} t0={T.hash1 - 0.2 + i * 0.08} t1={b} style={{left: x - 85, top: 520}}>
      <div style={{transform: lit && i === 2 ? 'translateY(-16px)' : undefined}}><Cyl w={170} h={210} fill={0.45} color={lit && i === 2 ? LIME : TEAL} glow={lit && i === 2} label={`shard ${i}`} /></div>
    </Appear>)}
    <Appear t0={T.range - 0.2} t1={b} style={{left: 0, right: 0, top: 830, textAlign: 'center'}}><Chip size={26} color={TEAL}>or range-based: by ID range</Chip></Appear>
  </AbsoluteFill>;
};

const S8: React.FC = () => {
  const t = useT(); const a = 140.0, b = 153.8; if (t < a - 0.1 || t > b + 0.4) return null;
  const back = t > T.combine - 1.6;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="TRADE-OFF" title="Cross-shard queries" color={ORANGE} />
    <Appear t0={T.cross - 0.2} t1={b} from="down" style={{left: 0, right: 0, top: 220, textAlign: 'center'}}><Chip size={26} color={WHITE}>SELECT * FROM orders ORDER BY total</Chip></Appear>
    {COLX.map((x, i) => <React.Fragment key={i}>
      <Line x0={540} y0={290} x1={x} y1={460} t0={T.multiple3 - 0.3} t1={b} dash color={ORANGE} />
      {!back && <Flow x0={540} y0={290} x1={x} y1={460} t0={T.multiple3 - 0.2} t1={T.combine - 1.6} n={2} color={ORANGE} r={8} />}
      {back && <Flow x0={x} y0={660} x1={540} y1={800} t0={T.combine - 1.6} t1={b} n={2} color={LIME} r={8} />}
      <Appear t0={T.multiple3 - 0.2 + i * 0.08} t1={b} style={{left: x - 75, top: 450}}><Cyl w={150} h={190} fill={0.5} color={TEAL} label={`shard ${i + 1}`} /></Appear>
    </React.Fragment>)}
    <Appear t0={T.combine - 0.6} t1={b} from="scale" style={{left: 0, right: 0, top: 790, textAlign: 'center'}}><Chip size={30} solid>combine results</Chip></Appear>
  </AbsoluteFill>;
};

const S9: React.FC = () => {
  const t = useT(); const a = 153.8, b = 159.9; if (t < a - 0.1 || t > b + 0.4) return null;
  const hot = ease(t, T.disproportionately - 0.3, 1.2);
  const flick = 0.85 + 0.15 * Math.sin(t * 30);
  const loads = [0.18, lerp(0.3, 1, hot), 0.14, 0.2];
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="TRADE-OFF" title="Bad shard key" color={HOT} />
    {COLX.map((x, i) => <Appear key={i} t0={a + 0.2 + i * 0.08} t1={b} style={{left: x - 90, top: 260}}>
      <div style={{width: 180, height: 460, background: PANEL, border: `3px solid ${i === 1 && hot > 0.6 ? HOT : LINE}`, borderRadius: 18, position: 'relative', overflow: 'hidden', boxShadow: i === 1 && hot > 0.6 ? `0 0 40px rgba(255,77,61,${0.6 * flick})` : undefined}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${loads[i] * 100}%`, background: i === 1 ? (hot > 0.6 ? HOT : ORANGE) : TEAL, opacity: i === 1 ? flick : 0.85}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: WHITE}}>{Math.round(loads[i] * 100)}%</div>
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: WHITE, textAlign: 'center', marginTop: 10}}>shard {i + 1}</div>
    </Appear>)}
    <Appear t0={T.hotspot - 0.3} t1={b} from="scale" style={{left: 0, right: 0, top: 800, textAlign: 'center'}}><Chip size={40} color={HOT} solid>HOTSPOT</Chip></Appear>
  </AbsoluteFill>;
};

const Ending: React.FC = () => {
  const t = useT(); if (t < 159.6) return null;
  return <AbsoluteFill>
    <Appear t0={159.8} from="down" style={{left: 0, right: 0, top: 0}}><TitleStrip pre="DATABASE" hi="SHARDING" /></Appear>
    <Appear t0={T.todna - 0.3} style={{left: 0, right: 0, top: 1100, textAlign: 'center'}}><Chip size={34} color={HOT}>&#10005; just breaking the DB</Chip></Appear>
    <Appear t0={T.intelligently - 0.3} style={{left: 0, right: 0, top: 1200, textAlign: 'center'}}><Chip size={34} solid>&#10003; distribute intelligently</Chip></Appear>
  </AbsoluteFill>;
};

export const scenes: Scene[] = [
  {a: 7.8, b: 24.4, el: S1}, {a: 24.4, b: 53.3, el: S2}, {a: 56.0, b: 77.0, el: S3}, {a: 77.0, b: 86.9, el: S4}, {a: 89.6, b: 107.0, el: S5},
  {a: 107.0, b: 126.2, el: S6}, {a: 126.2, b: 140.0, el: S7}, {a: 140.0, b: 153.8, el: S8}, {a: 153.8, b: 159.9, el: S9}];

export const cfg: Config = {
  bento: [[7.8, 53.3], [56.0, 86.9], [89.6, 159.9]],
  punches: [[T.horizontal1 - 0.15, 56.0, 0.12], [T.todna - 0.2, DUR, 0.08]],
  split: {t0: T.sharding1, t1: 107.0, labels: ['SHARD 1', 'SHARD 2', 'SHARD 3', 'SHARD 4']},
  overlays: [Hook, Hero, Ending],
};
