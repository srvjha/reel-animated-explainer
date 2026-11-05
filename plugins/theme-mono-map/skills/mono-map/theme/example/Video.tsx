// How Uber finds the nearest driver. Theme: mono-map (black and white, ride-hailing map look).
// Hard cuts: clip = B&W stock footage (Pexels, free license), talk = speaker cut out on the black street map,
// page = white map sheet with the diagrams. On-screen text is English. Hex IDs, distances, ETAs and counts are illustrative.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, lerp, ease, useT, Counter} from './core';
import {Config, pop, Head, Card, Tag, Car, Pin, Wire, Route, HexGrid, hexXY, hexPath, Icon, At, Center, Appear, PopIn, Txt,
  INK, PAPER, GREY, SOFT, LIGHT, MONO, W} from './theme/kit';
import data from './data.json';

const ws = (data as any).pages.flatMap((p: any) => p.words);
const T = (w: string, n = 1) => { let c = 0; for (const x of ws) if (x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w) { c++; if (c === n) return x.t; } return 0; };
const END = (data as any).duration;

export const cfg: Config = {
  speaker: 'talk.mp4',
  capSkip: 2.9,
  cuts: [
    {a: 0, b: 2.95, m: 'clip', src: 'clips/car.mp4', from: 2.0},
    {a: 2.95, b: 6.75, m: 'clip', src: 'clips/phone.mp4', from: 0.3},
    {a: 6.75, b: 12.5, m: 'clip', src: 'clips/aerial.mp4', from: 1.0, zoom: 1.05},
    {a: 12.5, b: 15.3, m: 'talk'},
    {a: 15.3, b: 24.1, m: 'page'},
    {a: 24.1, b: 27.5, m: 'talk'},
    {a: 27.5, b: 47.1, m: 'page'},
    {a: 47.1, b: 49.3, m: 'clip', src: 'clips/driver.mp4', from: 3.0},
    {a: 49.3, b: 58.3, m: 'page'},
    {a: 58.3, b: 60.0, m: 'clip', src: 'clips/book.mp4', from: 0.0},
    {a: 60.0, b: 72.8, m: 'page'},
    {a: 72.8, b: 75.0, m: 'talk'},
    {a: 75.0, b: 84.1, m: 'page'},
    {a: 84.1, b: 86.5, m: 'clip', src: 'clips/flyover.mp4', from: 4.0},
    {a: 86.5, b: 94.0, m: 'page'},
    {a: 94.0, b: 96.8, m: 'talk'},
    {a: 96.8, b: 112.5, m: 'page'},
    {a: 112.5, b: END + 1, m: 'talk'},
  ],
};

const Small: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 1530}) => <At x={80} y={y}><Txt size={22} font={MONO} w={500} color={GREY}>{children}</Txt></At>;

// ------------------------------------------------------------------ clip overlays (sit under the page sheet)
// hook: the first caption page shown big, mid-screen, with the Uber icon inline before "Uber" (regular captions skip it)
const Hook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30; if (t > 2.95) return null;
  const words = (data as any).pages[0].words as {w: string; t: number; e: number}[];
  const lines = [words.slice(0, 4), words.slice(4)];
  return <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
    {lines.map((ln, i) => <div key={i} style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.05; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.05) : 0;
        const isUber = w.w.toLowerCase().startsWith('uber');
        return <React.Fragment key={j}>
          {isUber && <div style={{width: 78, height: 78, margin: '0 4px 0 8px', transform: `scale(${0.4 + 0.6 * p})`, opacity: shown ? 1 : 0}}><Img src={staticFile('uber.png')} style={{width: 78, height: 78, borderRadius: 17, boxShadow: '0 0 0 3px rgba(255,255,255,.9)'}} /></div>}
          <span style={{display: 'inline-block', margin: '0 5px', padding: '0 16px', borderRadius: 18, fontFamily: 'Inter Tight', fontWeight: 800, fontSize: 76, lineHeight: 1.25, letterSpacing: -1.5,
            opacity: shown ? 1 : 0.35, transform: `translateY(${(1 - p) * 12}px)`, color: active ? INK : PAPER, background: active ? PAPER : 'transparent',
            textShadow: active ? 'none' : '0 0 6px #000, 0 4px 0 #000, 0 0 28px rgba(0,0,0,.95)'}}>{w.w}</span>
        </React.Fragment>;
      })}
    </div>)}
  </div>;
};
const Found: React.FC = () => {
  const t = useT(); if (t < 2.95 || t > 6.75) return null; const t0 = T('mil') - 0.2;
  return <Card x={140} y={1150} w={800} t0={t0} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '26px 32px'}}>
    <div style={{width: 90, height: 90, borderRadius: 18, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="car-profile" size={60} color={PAPER} /></div>
    <div><Txt size={40} w={800}>Driver found</Txt><Txt size={28} w={500} font={MONO} color={GREY}>in a few seconds</Txt></div>
  </Card>;
};
const Crowd: React.FC = () => {
  const t = useT(); if (t < 6.75 || t > 12.5) return null;
  const h1 = T('hazaron'), h2 = T('hazaron', 2);
  const pts = Array.from({length: 26}, (_, i) => [90 + ((i * 397) % 900), 560 + ((i * 251) % 760), (i * 47) % 360]);
  return <>
    {pts.map(([x, y, r], i) => i % 2 === 0
      ? <Car key={i} x={x} y={y} rot={r} t0={h1 + i * 0.04} color={PAPER} s={0.8} />
      : <div key={i} style={{position: 'absolute', left: x - 9, top: y - 9, width: 18, height: 18, borderRadius: 9, background: PAPER, opacity: ease(t, h2 + i * 0.04, 0.3), boxShadow: '0 0 0 6px rgba(255,255,255,.25)'}} />)}
    <At x={80} y={300}><Appear t0={h1}><Tag light icon="car-profile" size={34}>1000s of drivers moving</Tag></Appear></At>
    <At x={80} y={390}><Appear t0={h2}><Tag light solid={false} icon="users" size={34}>1000s of riders booking</Tag></Appear></At>
  </>;
};
const DriverPing: React.FC = () => {
  const t = useT(); if (t < 47.1 || t > 49.3) return null;
  return <At x={80} y={300}><Appear t0={47.25}><Tag light icon="map-pin" size={34}>driver location update</Tag></Appear></At>;
};
const NotBest: React.FC = () => {
  const t = useT(); if (t < 84.1 || t > 86.5) return null;
  return <Center y={330}><Appear t0={T('best') - 0.3}><Tag light size={44}>nearest ≠ best</Tag></Appear></Center>;
};
cfg.overlays = [Hook, Found, Crowd, DriverPing, NotBest];

// ------------------------------------------------------------------ pages
const PIN: [number, number] = [540, 760];
const BF_CARS: [number, number, number][] = [[230, 520, 30], [820, 470, 120], [400, 640, 80], [700, 610, 10], [160, 790, 160], [930, 760, 60], [330, 940, 100], [610, 960, 20], [850, 980, 140], [470, 470, 50], [250, 1060, 70], [760, 1100, 170]];
const Brute: React.FC = () => {
  const d0 = T('distance'), s0 = T('sort'), l0 = T('laakhon'), sl = T('slow');
  const dist = BF_CARS.map(([x, y]) => Math.hypot(x - PIN[0], y - PIN[1]));
  const order = dist.map((d, i) => [d, i]).sort((a, b) => a[0] - b[0]).slice(0, 4);
  return <>
    <Head t0={15.4} label="THE SIMPLE WAY" title="Check every driver" />
    {BF_CARS.map(([x, y], i) => <Wire key={'w' + i} x1={PIN[0]} y1={PIN[1]} x2={x} y2={y} t0={d0 + i * 0.12} d={0.3} color={GREY} sw={2.5} dash />)}
    {BF_CARS.map(([x, y, r], i) => <Car key={i} x={x} y={y} rot={r} t0={15.7 + i * 0.05} />)}
    {BF_CARS.map(([x, y], i) => <At key={'l' + i} x={x + 24} y={y - 44}><Appear t0={d0 + i * 0.12 + 0.2}><Txt size={22} font={MONO} w={700} style={{background: PAPER, padding: '1px 6px', borderRadius: 6}}>{(dist[i] / 380).toFixed(1)} km</Txt></Appear></At>)}
    <Pin x={PIN[0]} y={PIN[1]} t0={15.6} />
    <Card x={70} y={1160} w={440} h={400} t0={s0 - 0.2}>
      <Txt size={24} font={MONO} w={700} color={GREY}>SORTED BY DISTANCE</Txt>
      {order.map(([d, i], k) => <Appear key={k} t0={s0 + k * 0.15}><div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16}}>
        <Txt size={34} w={700}>Driver {i + 1}</Txt><Txt size={32} font={MONO} w={700}>{(d / 380).toFixed(1)} km</Txt></div></Appear>)}
    </Card>
    <Card x={540} y={1160} w={470} h={400} t0={l0} dark>
      <Txt size={24} font={MONO} w={700} color={SOFT}>EVERY REQUEST</Txt>
      <Txt size={58} w={800} color={PAPER} style={{marginTop: 18}}><Counter t0={l0 + 0.1} from={12} to={500000} d={1.2} fmt={n => Math.round(n).toLocaleString('en-IN')} /></Txt>
      <Txt size={30} w={600} color={PAPER}>distance checks</Txt>
      <Appear t0={sl}><div style={{marginTop: 26}}><Tag light size={28} icon="warning">slow</Tag></div></Appear>
    </Card>
    <Small y={1580}>numbers are illustrative</Small>
  </>;
};

const GEO_CARS: [number, number, number][] = [[200, 540, 30], [320, 610, 80], [800, 520, 120], [880, 640, 60], [560, 700, 10], [640, 820, 160], [190, 900, 100], [300, 1010, 20], [780, 1000, 140], [900, 1120, 50], [450, 1110, 70]];
const Geo: React.FC = () => {
  const t = useT(); const o0 = T('organize'), q0 = T('kaun') - 0.4, f0 = T('fast');
  const cell = 240, gx = 60, gy = 460;
  const near = (x: number, y: number) => Math.floor((x - gx) / cell) === 2 && Math.floor((y - gy) / cell) === 1;
  const qk = ease(t, q0, 0.4);
  return <>
    <Head t0={27.6} label="THE FIX" title="Geospatial indexing" />
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 4}, (_, i) => Array.from({length: 3}, (_, j) => {
        const k = ease(t, o0 + (i + j) * 0.08, 0.35); const hit = i === 2 && j === 1 && qk > 0;
        return <rect key={`${i}${j}`} x={gx + i * cell + 6} y={gy + j * cell + 6} width={cell - 12} height={cell - 12} rx={18} fill={hit ? `rgba(0,0,0,${0.12 * qk})` : 'transparent'} stroke={hit ? INK : SOFT} strokeWidth={hit ? 5 : 2.5} opacity={k} strokeDasharray={hit ? undefined : '10 8'} />;
      }))}
    </svg>
    {GEO_CARS.map(([x, y, r], i) => <Car key={i} x={x} y={y} rot={r} t0={27.8 + i * 0.05} dim={qk > 0.5 && !near(x, y)} />)}
    <Pin x={640} y={720} t0={28} />
    <At x={66} y={1210}><Appear t0={o0}><Tag solid={false} size={28}>drivers grouped by area</Tag></Appear></At>
    <Card x={70} y={1300} w={940} t0={q0} style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Icon name="magnifying-glass" size={56} />
      <div><Txt size={42} w={800}>"Who is near me?"</Txt>
        <Appear t0={f0}><Txt size={28} w={600} font={MONO} color={GREY}>look in one area, answer fast</Txt></Appear></div>
    </Card>
  </>;
};

const Repo: React.FC = () => {
  const t = useT(); const o0 = T('open'), h0 = T('h3');
  return <>
    <Center y={300}><PopIn t0={36.9}><Img src={staticFile('uber.png')} style={{width: 190, height: 190, borderRadius: 40}} /></PopIn></Center>
    <Center y={540}><Appear t0={37.2}><Txt size={70} w={800} style={{letterSpacing: -1.5}}>Built in house</Txt></Appear></Center>
    <Center y={650}><Appear t0={o0}><Tag size={32} icon="github-logo">open source · uber/h3</Tag></Appear></Center>
    <div style={{position: 'absolute', left: 60, top: 790, width: 960, opacity: ease(t, o0 + 0.15, 0.4), transform: `translateY(${(1 - ease(t, o0 + 0.15, 0.4)) * 40}px)`}}>
      <Img src={staticFile('h3repo.png')} style={{width: 960, borderRadius: 22, boxShadow: '0 26px 60px rgba(0,0,0,.35)', display: 'block'}} />
    </div>
    <Center y={1300}><Appear t0={h0}><Txt size={44} w={700} font={MONO}>Hexagonal geospatial index</Txt></Appear></Center>
  </>;
};

const IDS: [number, number, string][] = [[0, 0, '8a2a1072b59ffff'], [2, -1, '8a2a1072b5b7fff'], [-2, 2, '8a2a1072a4a7fff']];
const Hexes: React.FC = () => {
  const t = useT(); const u0 = T('unique'); const cx = 540, cy = 900, s = 74;
  return <>
    <Head t0={41.0} label="H3" title="Map → hexagons" />
    <HexGrid cx={cx} cy={cy} s={s} rings={5} t0={T('h3', 2) + 0.3} stagger={0.12} stroke={GREY} clip={[40, 400, 1040, 1420]}
      style={(q, r) => { const id = IDS.findIndex(([a, b]) => a === q && b === r); return id >= 0 && t > u0 + id * 0.3 ? {fill: id === 0 ? INK : 'rgba(0,0,0,.14)', stroke: INK, sw: 4} : null; }} />
    {IDS.map(([q, r, id], i) => { const [dx, dy] = hexXY(q, r, s); return <At key={i} x={cx + dx - 170} y={cy + dy + (i === 1 ? -125 : 70)}>
      <Appear t0={u0 + i * 0.3}><div style={{width: 340, display: 'flex', justifyContent: 'center'}}><Tag size={24} solid={i === 0}>{id}</Tag></div></Appear></At>; })}
    <Card x={70} y={1430} w={940} t0={u0 - 0.2} style={{padding: '18px 30px'}}><Txt size={34} w={700}>every hexagon has a unique ID</Txt><Txt size={20} font={MONO} w={500} color={GREY}>IDs shown are illustrative</Txt></Card>
  </>;
};

const Index: React.FC = () => {
  const t = useT(); const n0 = T('note'), m0 = T('mapping'), ms = T('milliseconds');
  const cx = 540, cy = 680, s = 64;
  const [ax, ay] = hexXY(-1, 0, s), [bx, by] = hexXY(1, 0, s);
  const mk = ease(t, 49.6, 1.4); const moved = t > 49.6 + 0.9;
  const car = [cx + lerp(ax - 40, bx + 10, mk), cy + lerp(ay + 20, by - 10, mk)];
  const rows = [['…b59ffff', moved ? 'D3, D7' : 'D3'], ['…b5b7fff', moved ? 'D12' : 'D7, D12'], ['…a4a7fff', 'D5']];
  return <>
    <Head t0={49.4} label="IN-MEMORY INDEX" title="Driver → hexagon" />
    <HexGrid cx={cx} cy={cy} s={s} rings={3} t0={49.4} stagger={0.05} stroke={SOFT}
      style={(q, r) => (q === (moved ? 1 : -1) && r === 0) ? {fill: 'rgba(0,0,0,.14)', stroke: INK, sw: 5} : null} />
    <Car x={car[0]} y={car[1]} rot={95} t0={49.4} s={1.15} />
    <At x={car[0] + 30} y={car[1] - 66}><Txt size={24} font={MONO} w={700} style={{background: INK, color: PAPER, padding: '2px 8px', borderRadius: 6}}>D7</Txt></At>
    <Card x={70} y={1060} w={940} t0={n0 - 0.2}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Txt size={24} font={MONO} w={700} color={GREY}>HEXAGON ID → DRIVERS</Txt>
        <Appear t0={m0}><Tag size={24} icon="cpu">in RAM</Tag></Appear>
      </div>
      {rows.map(([h, d], i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '10px 16px', borderRadius: 12, background: i < 2 && t > 50.5 && t < 52.5 ? LIGHT : 'transparent'}}>
        <Txt size={34} font={MONO} w={700}>{h}</Txt><Txt size={34} w={800}>{d}</Txt></div>)}
    </Card>
    <Center y={1470}><Appear t0={ms - 0.3}><Tag size={34} icon="lightning">lookup in milliseconds</Tag></Appear></Center>
  </>;
};

const Ring: React.FC = () => {
  const t = useT(); const h0 = T('tumhara'), n0 = T('aaspaas'), w0 = T('wahan'), r0 = T('ring'), sc = T('shehar');
  const cx = 540, cy = 880, s = 62;
  const k = t < n0 ? 0 : t < r0 ? 1 : 2;
  const busy: [number, number][] = [[0, -1], [1, 0], [-1, 1]];
  const at = (q: number, r: number) => { const [dx, dy] = hexXY(q, r, s); return [cx + dx, cy + dy]; };
  const [fx, fy] = at(2, -2);
  return <>
    <Head t0={60.1} label="RING SEARCH" title="Look nearby first" />
    <HexGrid cx={cx} cy={cy} s={s} rings={5} t0={60.1} stagger={0.04} stroke={SOFT} clip={[40, 430, 1040, 1380]}
      style={(q, r, d) => {
        if (d === 0 && t > h0) return {fill: INK, stroke: INK, sw: 4};
        if (d === 1 && t > n0) return {fill: 'rgba(0,0,0,.2)', stroke: INK, sw: 3.5};
        if (d === 2 && t > r0) return {fill: 'rgba(0,0,0,.08)', stroke: INK, sw: 3};
        if (d > 2 && t > sc) return {op: 0.35};
        return null;
      }} />
    <Pin x={cx} y={cy} t0={h0} r={22} color={PAPER} />
    {busy.map(([q, r], i) => { const [x, y] = at(q, r); return <React.Fragment key={i}><Car x={x} y={y} rot={i * 70} t0={60.4} dim />
      <At x={x - 30} y={y + 26}><Appear t0={w0}><Txt size={20} font={MONO} w={700} color={GREY}>busy</Txt></Appear></At></React.Fragment>; })}
    <Car x={fx} y={fy} rot={200} t0={60.5} />
    <Route pts={[[fx, fy], [fx - 50, fy + 90], [cx + 10, cy - 40]]} t0={r0 + 0.6} sw={7} />
    <At x={fx + 30} y={fy - 70}><Appear t0={r0 + 0.5}><Tag size={24}>free driver</Tag></Appear></At>
    <Card x={70} y={1400} w={940} t0={h0} style={{padding: '20px 30px'}}>
      <div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
        {['your hexagon', 'ring 1', 'ring 2'].map((l, i) => <div key={i} style={{opacity: i <= k ? 1 : 0.3, display: 'flex', alignItems: 'center', gap: 10}}>
          <svg width={36} height={36}><path d={hexPath(18, 18, 16)} fill={['#000', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.08)'][i]} stroke={INK} strokeWidth={2.5} /></svg>
          <Txt size={28} w={700}>{l}</Txt></div>)}
      </div>
      <Appear t0={sc - 0.2}><Txt size={26} font={MONO} w={500} color={GREY} style={{marginTop: 10}}>rest of the city is never scanned</Txt></Appear>
    </Card>
  </>;
};

const Shape: React.FC = () => {
  const t = useT(); const k0 = T('kyunki'), sq = T('square'), co = T('corner'), ac = T('accurate');
  const hx = 290, hy = 860, s = 82; const sx = 790, sy = 860, c = 130;
  const nb: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
  return <>
    <Head t0={75.1} label="WHY HEXAGONS?" title="Neighbours at equal distance" size={66} />
    <HexGrid cx={hx} cy={hy} s={s} rings={1} t0={75.2} stroke={INK} style={(q, r, d) => d === 0 ? {fill: INK, stroke: INK} : null} />
    {nb.map(([q, r], i) => { const [dx, dy] = hexXY(q, r, s); return <Wire key={i} x1={hx} y1={hy} x2={hx + dx} y2={hy + dy} t0={k0 + 0.4 + i * 0.1} sw={5} color={i === 0 ? INK : INK} />; })}
    {nb.map(([q, r], i) => { const [dx, dy] = hexXY(q, r, s); return <div key={'d' + i} style={{position: 'absolute', left: hx + dx - 9, top: hy + dy - 9, width: 18, height: 18, borderRadius: 9, background: PAPER, border: `4px solid ${INK}`, boxSizing: 'border-box', opacity: ease(t, k0 + 0.5 + i * 0.1)}} />; })}
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: ease(t, sq - 0.3, 0.4)}}>
      {[-1, 0, 1].map(i => [-1, 0, 1].map(j => <rect key={`${i}${j}`} x={sx + i * c - c / 2 + 3} y={sy + j * c - c / 2 + 3} width={c - 6} height={c - 6} rx={8} fill={i === 0 && j === 0 ? INK : 'transparent'} stroke={INK} strokeWidth={2.5} />))}
    </svg>
    {[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([i, j], n) => <Wire key={'e' + n} x1={sx} y1={sy} x2={sx + i * c} y2={sy + j * c} t0={sq + n * 0.08} sw={5} color={INK} />)}
    {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([i, j], n) => <Wire key={'c' + n} x1={sx} y1={sy} x2={sx + i * c} y2={sy + j * c} t0={co + n * 0.08} sw={5} color={GREY} dash />)}
    <At x={hx - 200} y={1110}><Appear t0={k0 + 0.6}><div style={{width: 400, textAlign: 'center'}}><Txt size={36} w={800}>Hexagon</Txt><Txt size={26} font={MONO} w={500} color={GREY}>6 neighbours, all 1 step</Txt></div></Appear></At>
    <At x={sx - 220} y={1110}><Appear t0={sq}><div style={{width: 440, textAlign: 'center'}}><Txt size={36} w={800}>Square</Txt><Txt size={26} font={MONO} w={500} color={GREY}>corners ≈ 1.4× farther</Txt></div></Appear></At>
    <Card x={70} y={1300} w={940} t0={ac - 0.6} dark style={{padding: '24px 30px'}}>
      <Txt size={34} w={800} color={PAPER}>Hex rings ≈ circles</Txt>
      <Txt size={26} font={MONO} w={500} color={SOFT}>so the distance estimate is more accurate</Txt>
    </Card>
  </>;
};

const Eta: React.FC = () => {
  const t = useT(); const e0 = T('eta'), st = T('straight');
  const P: [number, number] = [540, 1060];
  const A: [number, number] = [600, 760], B: [number, number] = [200, 1300];
  const dimA = t > e0 - 0.1;
  return <>
    <Head t0={86.6} label="FINAL PICK" title="Fastest ETA wins" />
    <div style={{position: 'absolute', left: -20, top: 870, width: W + 40, height: 70, background: INK, transform: 'rotate(-3deg)', opacity: ease(t, 86.7, 0.4)}}>
      <div style={{position: 'absolute', left: 40, right: 40, top: 33, borderTop: `4px dashed ${PAPER}`, opacity: 0.6}} />
    </div>
    <At x={760} y={790}><Appear t0={86.8}><Txt size={26} font={MONO} w={700} style={{transform: 'rotate(-3deg)'}}>FLYOVER</Txt></Appear></At>
    <Pin x={P[0]} y={P[1]} t0={86.7} />
    <Car x={A[0]} y={A[1]} rot={90} t0={86.9} dim={dimA} />
    <Car x={B[0]} y={B[1]} rot={20} t0={87.0} />
    <Wire x1={A[0]} y1={A[1]} x2={P[0]} y2={P[1]} t0={87.2} dash sw={4} color={GREY} />
    <Route pts={[[A[0], A[1]], [1000, 735], [1040, 1010], [P[0] + 20, P[1] - 10]]} t0={st} d={1.0} color={SOFT} sw={7} />
    <Route pts={[[B[0], B[1]], [300, 1200], [P[0] - 20, P[1] + 10]]} t0={e0} d={0.6} sw={8} />
    <div style={{opacity: dimA ? 0.45 : 1}}><Card x={620} y={560} w={400} t0={87.4} style={{padding: '18px 24px'}}>
      <Txt size={26} font={MONO} w={700} color={GREY}>NEAREST</Txt><Txt size={34} w={800}>0.3 km · ETA 9 min</Txt></Card></div>
    <Card x={60} y={1360} w={520} t0={e0 - 0.2} dark style={{padding: '18px 24px'}}>
      <Txt size={26} font={MONO} w={700} color={SOFT}>PICKED</Txt><Txt size={34} w={800} color={PAPER}>1.2 km · ETA 3 min</Txt></Card>
    <Small y={1580}>distances and ETAs are illustrative</Small>
  </>;
};

const REQ: [number, number][] = [[250, 640], [600, 930], [860, 650]];
const DRV: [number, number, number][] = [[170, 900, 30], [700, 560, 120], [900, 1060, 200]];
const Batch: React.FC = () => {
  const t = useT(); const k0 = T('kuch', 2), m0 = T('match'), tw = T('total'), bm = T('batch'), av = T('available');
  const fill = clamp((t - k0) / 2.2);
  const pair = [[0, 0], [1, 2], [2, 1]];
  return <>
    <Head t0={96.9} label="BATCH MATCHING" title="Match them together" />
    <At x={80} y={390}><div style={{width: 920}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}><Txt size={24} font={MONO} w={700} color={GREY}>COLLECT FOR A FEW SECONDS</Txt><Txt size={24} font={MONO} w={700}>{fill >= 1 ? 'MATCH' : 'WAITING'}</Txt></div>
      <div style={{height: 14, borderRadius: 7, background: LIGHT, marginTop: 10}}><div style={{height: 14, borderRadius: 7, background: INK, width: `${fill * 100}%`}} /></div>
    </div></At>
    {REQ.map(([x, y], i) => <Pin key={'r' + i} x={x} y={y} t0={k0 + 0.2 + i * 0.4} r={20} pulse={false} />)}
    {REQ.map(([x, y], i) => <At key={'rl' + i} x={x + 26} y={y - 50}><Appear t0={k0 + 0.3 + i * 0.4}><Txt size={22} font={MONO} w={700}>R{i + 1}</Txt></Appear></At>)}
    {DRV.map(([x, y, r], i) => <Car key={'d' + i} x={x} y={y} rot={r} t0={av + i * 0.2} />)}
    {DRV.map(([x, y], i) => <At key={'dl' + i} x={x + 28} y={y - 50}><Appear t0={av + i * 0.2}><Txt size={22} font={MONO} w={700}>D{i + 1}</Txt></Appear></At>)}
    {pair.map(([r, d], i) => <Wire key={'p' + i} x1={DRV[d][0]} y1={DRV[d][1]} x2={REQ[r][0]} y2={REQ[r][1]} t0={m0 + i * 0.12} sw={6} />)}
    <Card x={70} y={1200} w={455} t0={tw - 0.3} style={{padding: '22px 26px'}}>
      <Txt size={24} font={MONO} w={700} color={GREY}>ONE BY ONE</Txt><Txt size={38} w={800} style={{textDecoration: 'line-through', textDecorationThickness: 4}}>total wait 14 min</Txt></Card>
    <Card x={555} y={1200} w={455} t0={tw} dark style={{padding: '22px 26px'}}>
      <Txt size={24} font={MONO} w={700} color={SOFT}>BATCHED</Txt><Txt size={38} w={800} color={PAPER}>total wait 9 min</Txt></Card>
    <Center y={1420}><Appear t0={bm}><Tag size={34} icon="users">batch matching</Tag></Appear></Center>
    <Small y={1520}>wait times are illustrative</Small>
  </>;
};

const STEPS: [string, string][] = [['map-pin', 'Geospatial index'], ['hexagon', 'H3 hexagons'], ['magnifying-glass', 'Ring search'], ['users', 'Batch matching + ETA']];
const Recap: React.FC = () => {
  const t = useT();
  const times = [T('geospatial', 2), T('hexagons', 3), T('ring', 3), T('batch', 2)];
  return <>
    <Head t0={106.2} label="RECAP" title="Nearest driver, fast" />
    {[0, 1, 2].map(i => <div key={'v' + i} style={{position: 'absolute', left: 157, top: 420 + i * 230 + 150, width: 6, height: 90, background: INK, opacity: ease(t, times[i + 1] - 0.2, 0.3)}} />)}
    {STEPS.map(([ic, l], i) => <Card key={i} x={80} y={420 + i * 230} w={920} t0={times[i] - 0.15} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '28px 32px'}} dark={i === 3}>
      <div style={{width: 96, height: 96, borderRadius: 20, background: i === 3 ? PAPER : INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} size={60} color={i === 3 ? INK : PAPER} /></div>
      <Txt size={26} font={MONO} w={700} color={i === 3 ? SOFT : GREY}>0{i + 1}</Txt>
      <Txt size={48} w={800} color={i === 3 ? PAPER : INK}>{l}</Txt>
    </Card>)}
    <Center y={1360}><Appear t0={T('chhota') - 0.6}><Tag solid={false} size={34}>small search → fast result</Tag></Appear></Center>
  </>;
};

export const scenes = [
  {a: 15.3, b: 24.1, el: Brute},
  {a: 27.5, b: 36.8, el: Geo},
  {a: 36.8, b: 40.9, el: Repo},
  {a: 40.9, b: 47.1, el: Hexes},
  {a: 49.3, b: 58.3, el: Index},
  {a: 60.0, b: 72.8, el: Ring},
  {a: 75.0, b: 84.1, el: Shape},
  {a: 86.5, b: 94.0, el: Eta},
  {a: 96.8, b: 106.1, el: Batch},
  {a: 106.1, b: 112.5, el: Recap},
];
void Route;
