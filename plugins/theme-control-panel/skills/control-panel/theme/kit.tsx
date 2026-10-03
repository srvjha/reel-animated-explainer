// Theme: CONTROL PANEL. Industrial safety look: concrete panel, riveted nameplate, signal orange.
// The speaker sits in a bezel "camera window" on top; an engineering-grid schematic board below
// holds the diagrams, which power on with an orange scan line. Captions print out of a label
// maker: black embossed tape that grows word by word. Optional "trip" hits flash the panel red.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/archivo-black/400.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, eio, useT, springAt} from '../core';

export const CONCRETE = '#E3E1DB', STEEL = '#B9B7B0', PAPER = '#F4F3EF', GRID = '#D3DCE3', INK = '#17181A', ORANGE = '#FF5A1F', RED = '#E5322D', GREEN = '#21A45B', AMBER = '#FFB000', MUTED = '#6E6C66';
export const HEAD = 'Archivo Black', COND = 'Barlow Condensed', MONO = 'Space Mono';
/** scene box (scene coordinates), in px; rendered scaled to fit the board under the caption band */
export const BOARD_W = 1000, BOARD_H = 850;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 210, mass: 0.7});

export type Config = {
  title: string;                 // nameplate, one line (<= ~18 chars at 66 px)
  sub: string;                   // small engraved line under the title
  full: [number, number][];      // windows where the speaker goes full screen (hook, punchlines)
  trips?: number[];              // times of a red "trip" hit (flash + shake)
  overlays?: React.FC[];         // free layers above everything (e.g. a hook visual while full screen)
};

// ------------------------------------------------------------------ primitives
export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 36}px)` : from === 'down' ? `translateY(${(1 - p) * -36}px)` : from === 'left' ? `translateX(${(1 - p) * -80}px)` : from === 'right' ? `translateX(${(1 - p) * 80}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.6) * out, transform: tr, ...style}}>{children}</div>;
};

/** engraved label plate (straight chip) */
export const Plate: React.FC<{color?: string; bg?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = INK, bg = '#fff', size = 26, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: size, color, background: bg, border: `3px solid ${INK}`, borderRadius: 6, padding: '6px 16px', whiteSpace: 'nowrap', letterSpacing: '.02em', boxShadow: `0 4px 0 ${INK}`, ...style}}>{children}</span>
);

/** section label at the top-left of the board: "▌ 02  CLOSED STATE" */
export const Section: React.FC<{t0: number; t1?: number; n: string; title: string; color?: string}> = ({t0, t1, n, title, color = ORANGE}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 30, top: 26}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#fff', background: color, padding: '4px 10px', borderRadius: 4}}>{n}</span>
      <span style={{fontFamily: HEAD, fontSize: 44, color: INK, whiteSpace: 'nowrap', letterSpacing: '-.01em'}}>{title}</span>
    </div>
  </Appear>
);

export const Lamp: React.FC<{color: string; on: boolean; size?: number; label?: string}> = ({color, on, size = 34, label}) => (
  <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
    <div style={{width: size, height: size, borderRadius: size, background: on ? color : '#3a3a3a', border: `4px solid ${INK}`, boxShadow: on ? `0 0 ${size * 0.8}px ${color}, inset 0 -4px 0 rgba(0,0,0,.25)` : 'inset 0 -4px 0 rgba(0,0,0,.4)'}} />
    {label && <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: on ? INK : MUTED, whiteSpace: 'nowrap'}}>{label}</span>}
  </div>
);

/** service block: schematic rectangle with a header strip */
export const Block: React.FC<{label: string; sub?: string; w?: number; h?: number; state?: 'ok' | 'down' | 'slow' | 'idle'; icon?: React.ReactNode}> = ({label, sub, w = 230, h = 150, state = 'ok', icon}) => {
  const t = useT();
  const c = state === 'down' ? RED : state === 'slow' ? AMBER : state === 'idle' ? MUTED : GREEN;
  const blink = state === 'down' ? (Math.floor(t * 4) % 2 === 0) : true;
  return <div style={{width: w, height: h, background: '#fff', border: `4px solid ${INK}`, borderRadius: 10, boxShadow: `0 6px 0 ${INK}`, position: 'relative', overflow: 'hidden'}}>
    <div style={{height: 36, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px'}}>
      <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: '#fff', whiteSpace: 'nowrap'}}>{sub ?? 'service'}</span>
      <span style={{width: 14, height: 14, borderRadius: 7, background: blink ? c : '#444', boxShadow: blink ? `0 0 10px ${c}` : undefined}} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 36, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: HEAD, fontSize: label.length > 9 ? 28 : 34, color: state === 'down' ? RED : INK, whiteSpace: 'nowrap'}}>{icon}{label}</div>
  </div>;
};

/** wire with current flowing (dashes moving) from (x1,y1) to (x2,y2). Draws in from t0. */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; flow?: boolean; speed?: number; cut?: boolean; w?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = INK, flow = true, speed = 1, cut = false, w = 7}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.5); const op = clamp((t1 + 0.25 - t) / 0.25);
  const xe = lerp(x1, x2, k), ye = lerp(y1, y2, k);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const len = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  return <svg width={BOARD_W} height={BOARD_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op}}>
    {cut ? <>
      <line x1={x1} y1={y1} x2={mx - ux * 30} y2={my - uy * 30} stroke={MUTED} strokeWidth={w} strokeLinecap="round" />
      <line x1={mx + ux * 30} y1={my + uy * 30} x2={x2} y2={y2} stroke={MUTED} strokeWidth={w} strokeLinecap="round" />
    </> : <>
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={INK} strokeWidth={w} strokeLinecap="round" />
      {flow && k > 0.9 && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color === INK ? ORANGE : color} strokeWidth={w - 3} strokeDasharray="10 22" strokeDashoffset={-t * 90 * speed} strokeLinecap="round" />}
    </>}
  </svg>;
};

/** DIN-rail breaker: lever up = CLOSED (current flows), down = OPEN, middle = HALF-OPEN */
export const Breaker: React.FC<{state: 'closed' | 'open' | 'half'; s?: number; t?: number}> = ({state, s = 1}) => {
  const f = useCurrentFrame();
  const target = state === 'closed' ? -1 : state === 'open' ? 1 : 0;
  const lever = target * 46 * s;
  const c = state === 'closed' ? GREEN : state === 'open' ? RED : AMBER;
  return <div style={{width: 170 * s, height: 300 * s, background: '#F7F6F2', border: `${5 * s}px solid ${INK}`, borderRadius: 12 * s, position: 'relative', boxShadow: `0 ${8 * s}px 0 ${INK}`}}>
    <div style={{position: 'absolute', left: 14 * s, right: 14 * s, top: 14 * s, height: 30 * s, background: INK, borderRadius: 4 * s, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 18 * s, color: '#fff'}}>C16</div>
    <div style={{position: 'absolute', left: 45 * s, top: 80 * s, width: 80 * s, height: 150 * s, background: '#2b2c2f', borderRadius: 10 * s}} />
    <div style={{position: 'absolute', left: 52 * s, top: 155 * s - 30 * s + lever, width: 66 * s, height: 60 * s, background: c, border: `${4 * s}px solid ${INK}`, borderRadius: 8 * s, boxShadow: `0 ${4 * s}px 0 rgba(0,0,0,.35)`}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 14 * s, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 20 * s, color: c, letterSpacing: '.04em'}}>{state === 'closed' ? 'ON' : state === 'open' ? 'TRIP' : 'TEST'}</div>
  </div>;
};

/** 7-segment style counter */
export const Seg: React.FC<{text: string; color?: string; size?: number; label?: string}> = ({text, color = RED, size = 90, label}) => (
  <div style={{display: 'inline-block', background: '#101113', border: `5px solid ${INK}`, borderRadius: 12, padding: '10px 22px', boxShadow: `0 6px 0 ${INK}`}}>
    {label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: MUTED, letterSpacing: '.12em'}}>{label}</div>}
    <div style={{position: 'relative', fontFamily: MONO, fontWeight: 700, fontSize: size, lineHeight: 1.05, letterSpacing: '.06em'}}>
      <span style={{position: 'absolute', left: 0, top: 0, color: 'rgba(255,255,255,.07)'}}>{'8'.repeat(text.length)}</span>
      <span style={{color, textShadow: `0 0 18px ${color}`}}>{text}</span>
    </div>
  </div>
);

/** analog gauge 0..1 with red zone above `limit` */
export const Gauge: React.FC<{v: number; limit?: number; label?: string; size?: number}> = ({v, limit = 0.7, label, size = 260}) => {
  const r = size / 2 - 16; const cx = size / 2, cy = size / 2;
  const ang = (x: number) => Math.PI * (1 - x);
  const pt = (x: number, rr: number) => [cx + rr * Math.cos(ang(x)), cy - rr * Math.sin(ang(x))];
  const arc = (a: number, b: number) => { const [x1, y1] = pt(a, r); const [x2, y2] = pt(b, r); return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`; };
  const [nx, ny] = pt(clamp(v), r - 18);
  return <div style={{width: size, textAlign: 'center'}}>
    <svg width={size} height={size / 2 + 26}>
      <path d={arc(0, limit)} stroke={INK} strokeWidth={14} fill="none" />
      <path d={arc(limit, 1)} stroke={RED} strokeWidth={14} fill="none" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={v > limit ? RED : ORANGE} strokeWidth={8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={14} fill={INK} />
    </svg>
    {label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: INK, marginTop: -6, whiteSpace: 'nowrap'}}>{label}</div>}
  </div>;
};

/** spark burst at (x,y) starting t0 */
export const Spark: React.FC<{x: number; y: number; t0: number; color?: string}> = ({x, y, t0, color = AMBER}) => {
  const t = useT(); const p = (t - t0) / 0.45; if (p < 0 || p > 1) return null;
  return <svg width={BOARD_W} height={BOARD_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {Array.from({length: 10}).map((_, i) => { const a = i / 10 * Math.PI * 2 + 0.3; const r0 = 10 + 50 * p, r1 = 30 + 90 * p;
      return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={i % 2 ? color : ORANGE} strokeWidth={7 * (1 - p) + 1} strokeLinecap="round" />; })}
  </svg>;
};

/** a small packet/request dot travelling along a path of points */
export const Packet: React.FC<{pts: [number, number][]; t0: number; d: number; color?: string; label?: string; loop?: boolean}> = ({pts, t0, d, color = ORANGE, label, loop}) => {
  const t = useT(); if (t < t0) return null; let p = (t - t0) / d; if (loop) p = p % 1; else if (p > 1) return null;
  const seg = p * (pts.length - 1); const i = Math.min(pts.length - 2, Math.floor(seg)); const k = Easing.inOut(Easing.quad)(seg - i);
  const x = lerp(pts[i][0], pts[i + 1][0], k), y = lerp(pts[i][1], pts[i + 1][1], k);
  return <div style={{position: 'absolute', left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 6, background: color, border: `4px solid ${INK}`}}>
    {label && <span style={{position: 'absolute', left: 40, top: -2, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK, whiteSpace: 'nowrap'}}>{label}</span>}
  </div>;
};

// ------------------------------------------------------------------ frame
const WIN = {x: 40, y: 190, w: 1000, h: 710};          // speaker window (windowed mode)
const CAP_Y = 912;                                     // caption band between window and board
const BOARD = {x: 40, y: 1076, h: 804};               // board frame; the 1000 x 850 scene box is scaled to fit

const fullAmt = (t: number, cfg: Config) => { let d = 0; for (const [a, b] of cfg.full) d = Math.max(d, (a <= 0.01 ? 1 : eio(t, a - 0.25, 0.5)) * (1 - eio(t, b - 0.25, 0.5))); return d; };
const tripAmt = (t: number, cfg: Config) => { let k = 0; for (const a of cfg.trips || []) if (t >= a && t < a + 0.9) k = Math.max(k, 1 - (t - a) / 0.9); return k; };

const Panel: React.FC = () => (
  <AbsoluteFill style={{background: CONCRETE}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,.06) 1px, transparent 1.4px), radial-gradient(rgba(255,255,255,.5) 1px, transparent 1.4px)', backgroundSize: '7px 7px, 11px 11px', backgroundPosition: '0 0, 3px 5px'}} />
    {[[18, 18], [1044, 18], [18, 1884], [1044, 1884]].map(([x, y], i) => <Screw key={i} x={x} y={y} />)}
  </AbsoluteFill>
);
const Screw: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 18}) => (
  <div style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: 'linear-gradient(145deg,#f4f4f2,#8d8b85)', border: '2px solid #6d6b66'}}>
    <div style={{position: 'absolute', left: 2, right: 2, top: s / 2 - 3, height: 2, background: '#5c5a55', transform: 'rotate(35deg)'}} />
  </div>
);

const Nameplate: React.FC<{cfg: Config; full: number}> = ({cfg, full}) => {
  const f = useCurrentFrame(); const p = pop(f, 0.15);
  return <div style={{position: 'absolute', left: 40, right: 40, top: 40, height: 128, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * -40}px)`,
    background: 'linear-gradient(180deg,#F8F7F3,#D9D7D0)', border: `5px solid ${INK}`, borderRadius: 12, boxShadow: `0 8px 0 ${INK}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
    {[[12, 12], [944, 12], [12, 88], [944, 88]].map(([x, y], i) => <Screw key={i} x={x} y={y} s={16} />)}
    <div style={{fontFamily: HEAD, fontSize: 62, color: INK, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '.01em'}}>{cfg.title}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 8}}>
      <div style={{width: 60, height: 10, background: `repeating-linear-gradient(45deg, ${ORANGE} 0 8px, ${INK} 8px 16px)`}} />
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 21, color: MUTED, letterSpacing: '.16em', whiteSpace: 'nowrap'}}>{cfg.sub}</div>
      <div style={{width: 60, height: 10, background: `repeating-linear-gradient(45deg, ${ORANGE} 0 8px, ${INK} 8px 16px)`}} />
    </div>
  </div>;
};

const Speaker: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT(); const m = 1 - fullAmt(t, cfg); const trip = tripAmt(t, cfg);
  const x = lerp(0, WIN.x, m), y = lerp(0, WIN.y, m), w = lerp(1080, WIN.w, m), h = lerp(1920, WIN.h, m);
  const vy = lerp(0, 25, m);                             // windowed: whole video sits 60px lower, cropped by the window
  const z = 1 + 0.035 * clamp(t / 10) * (1 - m);
  const sh = trip > 0 ? Math.sin(t * 90) * 10 * trip : 0;
  return <div style={{position: 'absolute', left: x + sh, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 22 * m, border: m > 0.02 ? `${12 * m}px solid ${INK}` : undefined, boxShadow: m > 0.02 ? `0 ${10 * m}px 0 rgba(23,24,26,.9)` : undefined}}>
    <div style={{position: 'absolute', left: -x - 12 * m, top: -y + vy - 12 * m, width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: '50% 25%'}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: 1080, height: 1920}} />
    </div>
    {m > 0.5 && <div style={{position: 'absolute', left: 20, top: 18, display: 'flex', alignItems: 'center', gap: 10, opacity: clamp((m - 0.5) * 2), fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#fff', background: 'rgba(0,0,0,.55)', padding: '4px 12px', borderRadius: 6}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: Math.floor(t * 2) % 2 ? RED : '#7a1a17'}} />CAM 01
    </div>}
    {trip > 0 && <AbsoluteFill style={{background: `rgba(229,50,45,${0.35 * trip})`, mixBlendMode: 'multiply'}} />}
  </div>;
};

const Board: React.FC<{cfg: Config; scenes: Scene[]}> = ({cfg, scenes}) => {
  const t = useT(); const m = 1 - fullAmt(t, cfg);
  if (m < 0.01) return null;
  const y = BOARD.y + (1 - m) * 950; const k = (BOARD.h - 10) / BOARD_H;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: BOARD.x, top: y, width: BOARD_W, height: BOARD.h, background: PAPER, border: `5px solid ${INK}`, borderRadius: 14, overflow: 'hidden', boxShadow: `0 8px 0 ${INK}`}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${GRID} 1.5px, transparent 1.5px), linear-gradient(90deg, ${GRID} 1.5px, transparent 1.5px), linear-gradient(rgba(211,220,227,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(211,220,227,.5) 1px, transparent 1px)`, backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'}} />
    <div style={{position: 'absolute', left: (BOARD_W - 10 - BOARD_W * k) / 2, top: 0, width: BOARD_W, height: BOARD_H, transform: `scale(${k})`, transformOrigin: '0 0'}}>
      {scenes.map((s, i) => {
        if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.05) return null;
        const reveal = Easing.inOut(Easing.cubic)(clamp((t - s.a + 0.05) / 0.5));
        const El = s.el;
        return <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`}}><El /></div>;
      })}
    </div>
    {scenes.map((s, i) => { const q = (t - s.a + 0.05) / 0.5; if (q < 0 || q > 1) return null; const yy = Easing.inOut(Easing.cubic)(q) * BOARD.h;
      return <div key={'scan' + i} style={{position: 'absolute', left: 0, right: 0, top: yy - 3, height: 6, background: ORANGE, boxShadow: `0 0 24px ${ORANGE}`}} />; })}
  </div>;
};

/** label-maker captions: each line is black embossed tape that prints out word by word */
const Captions: React.FC<{data: Data; cfg: Config}> = ({data, cfg}) => {
  const f = useCurrentFrame(); const t = f / FPS; const m = 1 - fullAmt(t, cfg);
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(1330, CAP_Y, m);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
    {pg.lines.map((ln, i) => {
      const shown = ln.filter(w => t >= w.t - 0.03);
      if (!shown.length) return <div key={i} style={{height: 74}} />;
      const tilt = i % 2 ? 0.8 : -0.8;
      return <div key={i} style={{transform: `rotate(${tilt}deg)`, background: '#141414', padding: '6px 22px 8px', clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%, 10px 50%)', boxShadow: '0 6px 12px rgba(0,0,0,.35)', whiteSpace: 'nowrap'}}>
        {shown.map((w, j) => {
          const active = t < w.e - 0.03; const p = pop(f, w.t - 0.03);
          return <span key={j} style={{display: 'inline-block', margin: '0 7px', fontFamily: COND, fontWeight: 700, fontSize: 60, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '.04em',
            color: w.k ? ORANGE : '#F2F2F2', textShadow: '0 -2px 0 rgba(255,255,255,.35), 0 2px 0 rgba(0,0,0,.9)', transform: `translateY(${(1 - p) * 10}px) scale(${active ? 1.06 : 1})`,
            borderBottom: active ? `5px solid ${w.k ? ORANGE : '#F2F2F2'}` : '5px solid transparent'}}>{w.w}</span>;
        })}
      </div>;
    })}
  </div>;
};

const TripFlash: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT(); const k = tripAmt(t, cfg); if (k <= 0) return null;
  return <AbsoluteFill style={{boxShadow: `inset 0 0 0 ${18 * k}px ${RED}, inset 0 0 ${160 * k}px rgba(229,50,45,${0.6 * k})`}} />;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const full = fullAmt(t, cfg);
  return <AbsoluteFill style={{background: CONCRETE}}>
    <Panel />
    <Speaker cfg={cfg} />
    <Board cfg={cfg} scenes={scenes} />
    <Nameplate cfg={cfg} full={full} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} cfg={cfg} />
    <TripFlash cfg={cfg} />
  </AbsoluteFill>;
};
