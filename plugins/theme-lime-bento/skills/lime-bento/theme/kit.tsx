// Theme: LIME BENTO. Dark grid backdrop, lime/orange/teal accents. The speaker is full screen for
// hooks and punchlines, and slides into a rounded bento tile (bottom) while visuals play on top.
// Optional: split the speaker into N labelled strips (e.g. SHARD 1..4). Karaoke captions.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, spring} from 'remotion';
import '@fontsource/unbounded/600.css';
import '@fontsource/unbounded/800.css';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/bricolage-grotesque/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, eio, win, useT, springAt, punchZoom, Typed as CoreTyped} from '../core';

export const BG = '#0E0F11', PANEL = '#17191D', LINE = '#2C3036', LIME = '#C6F432', ORANGE = '#FF8A1F', HOT = '#FF4D3D', WHITE = '#F2F2EE', GREY = '#8A8F98', TEAL = '#2EE6C9';
export const UNB = 'Unbounded', BRI = 'Bricolage Grotesque', MONO = 'JetBrains Mono';
export const pop = (frame: number, t0: number) => springAt(frame, t0, {damping: 13, stiffness: 180, mass: 0.7});
export const Typed: React.FC<{t0: number; text: string; cps?: number}> = (p) => <CoreTyped {...p} cps={p.cps ?? 26} caret="_" caretColor={LIME} />;

export type Config = {
  bento: [number, number][];              // windows where the speaker sits in the bottom tile and scenes play on top (y 60..960)
  punches?: [number, number, number][];   // [start, end, amount] zooms while full screen
  split?: {t0: number; t1: number; labels: string[]};  // split the speaker into labelled strips
  overlays?: React.FC[];                   // free layers drawn above scenes (hook, title hero, ending)
};

export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'left' | 'right' | 'scale' | 'down'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 46}px)` : from === 'down' ? `translateY(${(1 - p) * -46}px)` : from === 'left' ? `translateX(${(1 - p) * -100}px)` : from === 'right' ? `translateX(${(1 - p) * 100}px)` : `scale(${0.55 + 0.45 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.5) * out, transform: tr, ...style}}>{children}</div>;
};

export const Chip: React.FC<{color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties; solid?: boolean}> = ({color = LIME, size = 30, children, style, solid}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: size, color: solid ? BG : color, background: solid ? color : 'rgba(14,15,17,.92)', border: `3px solid ${color}`, borderRadius: 14, padding: '10px 20px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

export const Header: React.FC<{t0: number; t1: number; kicker: string; title: string; color?: string}> = ({t0, t1, kicker, title, color = LIME}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 50, top: 64}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color, letterSpacing: '.22em'}}>{'// '}{kicker}</div>
    <div style={{fontFamily: UNB, fontWeight: 800, fontSize: 52, color: WHITE, lineHeight: 1.15, whiteSpace: 'nowrap', marginTop: 6}}>{title}</div>
  </Appear>
);

// ------------------------------------------------------------------ database cylinder (svg) with liquid fill
export const Cyl: React.FC<{w?: number; h?: number; fill?: number; color?: string; stroke?: string; label?: string; sub?: string; glow?: boolean; stripes?: boolean}> = ({w = 220, h = 300, fill = 0.4, color = LIME, stroke = WHITE, label, sub, glow, stripes}) => {
  const t = useT(); const ry = w * 0.16; const body = h - 2 * ry;
  const lvl = ry + body * (1 - clamp(fill));
  const wave = (x: number) => Math.sin(x / 26 + t * 4) * 4;
  let d = `M 4 ${lvl + wave(0)}`;
  for (let x = 0; x <= w - 8; x += 8) d += ` L ${4 + x} ${lvl + wave(x)}`;
  d += ` L ${w - 4} ${h - ry} A ${w / 2 - 4} ${ry} 0 0 1 4 ${h - ry} Z`;
  const id = `c${Math.round(w)}${Math.round(h)}`;
  return <div style={{width: w, textAlign: 'center', filter: glow ? `drop-shadow(0 0 22px ${color})` : undefined}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs><clipPath id={id}><path d={`M 4 ${ry} L 4 ${h - ry} A ${w / 2 - 4} ${ry} 0 0 0 ${w - 4} ${h - ry} L ${w - 4} ${ry} Z`} /></clipPath></defs>
      <path d={`M 4 ${ry} L 4 ${h - ry} A ${w / 2 - 4} ${ry} 0 0 0 ${w - 4} ${h - ry} L ${w - 4} ${ry}`} fill={PANEL} stroke={stroke} strokeWidth={4} />
      <g clipPath={`url(#${id})`}>
        {fill > 0.01 && <path d={d} fill={color} opacity={0.88} />}
        {stripes && [0.3, 0.5, 0.7].map((k, i) => <rect key={i} x={0} y={ry + body * k} width={w} height={6} fill={BG} opacity={0.5} />)}
      </g>
      {[0.33, 0.66].map((k, i) => <path key={i} d={`M 4 ${ry + body * k} A ${w / 2 - 4} ${ry} 0 0 0 ${w - 4} ${ry + body * k}`} fill="none" stroke={stroke} strokeOpacity={0.35} strokeWidth={3} />)}
      <ellipse cx={w / 2} cy={ry} rx={w / 2 - 4} ry={ry - 2} fill={PANEL} stroke={stroke} strokeWidth={4} />
    </svg>
    {label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: WHITE, marginTop: 8, whiteSpace: 'nowrap'}}>{label}</div>}
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, color: GREY, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};

// moving dots along a straight path
export const Flow: React.FC<{x0: number; y0: number; x1: number; y1: number; t0: number; t1: number; n?: number; speed?: number; color?: string; r?: number}> = ({x0, y0, x1, y1, t0, t1, n = 5, speed = 0.9, color = LIME, r = 9}) => {
  const t = useT(); if (t < t0 || t > t1) return null;
  return <>{Array.from({length: n}).map((_, i) => {
    const ph = ((t - t0) * speed + i / n) % 1;
    return <div key={i} style={{position: 'absolute', left: lerp(x0, x1, ph) - r, top: lerp(y0, y1, ph) - r, width: 2 * r, height: 2 * r, borderRadius: r, background: color, opacity: win(t, t0, t1) * clamp(ph * 6) * clamp((1 - ph) * 6), boxShadow: `0 0 12px ${color}`}} />;
  })}</>;
};

export const Line: React.FC<{x0: number; y0: number; x1: number; y1: number; t0: number; t1: number; color?: string; dash?: boolean; w?: number}> = ({x0, y0, x1, y1, t0, t1, color = LINE, dash, w = 4}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = ease(t, t0, 0.45);
  return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    <line x1={x0} y1={y0} x2={lerp(x0, x1, p)} y2={lerp(y0, y1, p)} stroke={color} strokeWidth={w} strokeDasharray={dash ? '12 10' : undefined} opacity={clamp((t1 + 0.25 - t) / 0.25)} strokeLinecap="round" />
  </svg>;
};

export const AppBox: React.FC<{label?: string}> = ({label = 'APP'}) => (
  <div style={{width: 260, height: 190, background: PANEL, border: `4px solid ${WHITE}`, borderRadius: 20, overflow: 'hidden'}}>
    <div style={{height: 36, background: LINE, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14}}>{[HOT, ORANGE, LIME].map(c => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}</div>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150, fontFamily: UNB, fontWeight: 800, fontSize: 42, color: WHITE}}>{label}</div>
  </div>
);

/** Title card: "<pre> <hi>" in Unbounded, hi in lime, optional kicker below. slice = time of a glitch-slice hit. */
export const TitleStrip: React.FC<{pre: string; hi: string; sub?: string; size?: number; slice?: number}> = ({pre, hi, sub = 'BUILDING BACKEND SYSTEMS', size = 66, slice = -1}) => {
  const t = useT(); const k = slice >= 0 && t > slice && t < slice + 0.9 ? 1 - (t - slice) / 0.9 : 0;
  const text = <div style={{fontFamily: UNB, fontWeight: 800, fontSize: size, color: WHITE, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-.01em'}}>{pre} <span style={{color: LIME}}>{hi}</span></div>;
  const offs = [-34, 22, -16, 30];
  return <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(14,15,17,.88)', borderRadius: 22, border: `3px solid ${LINE}`, padding: '20px 30px 18px', textAlign: 'center', position: 'relative'}}>
      {k > 0 ? <div style={{position: 'relative'}}>
        <div style={{visibility: 'hidden'}}>{text}</div>
        {offs.map((o, i) => <div key={i} style={{position: 'absolute', left: o * k, top: 0, clipPath: `inset(${i * 25}% 0 ${100 - (i + 1) * 25}% 0)`}}>{text}</div>)}
      </div> : text}
      {sub && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: GREY, letterSpacing: '.28em', marginTop: 12}}>{sub}</div>}
    </div>
  </div>;
};

// ------------------------------------------------------------------ frame
const bentoAmt = (t: number, cfg: Config) => { let d = 0; for (const [a, b] of cfg.bento) d = Math.max(d, eio(t, a, 0.55) * (1 - eio(t, b, 0.55))); return d; };

const Backdrop: React.FC = () => {
  const t = useT();
  return <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`, backgroundSize: '54px 54px', opacity: 0.45, backgroundPosition: `0 ${(t * 10) % 54}px`}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(198,244,50,.06), transparent 70%)'}} />
  </AbsoluteFill>;
};

const Speaker: React.FC<{cfg: Config}> = ({cfg}) => {
  const f = useCurrentFrame(); const t = f / FPS; const m = bentoAmt(t, cfg); const z = punchZoom(t, 0.04, 8, cfg.punches || []);
  const sp = cfg.split; const n = sp ? sp.labels.length : 1;
  const G = sp ? 26 * spring({frame: f - Math.round((sp.t0 - 0.05) * FPS), fps: FPS, config: {damping: 11, stiffness: 160}}) * (1 - eio(t, sp.t1, 0.45)) : 0;
  const L = lerp(0, 40, m), Tp = lerp(0, 1000, m), Wd = lerp(1080, 1000, m), Ht = lerp(1920, 860, m), R = lerp(0, 34, m);
  const vs = lerp(z, 0.95, m), vl = lerp(540 - 540 * z, -13, m), vt = lerp(600 - 600 * z, -150, m);
  const video = (dx: number) => <div style={{position: 'absolute', left: vl - dx, top: vt, width: 1080 * vs, height: 1920 * vs}}><OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} /></div>;
  if (!sp || G < 0.5) {
    return <div style={{position: 'absolute', left: L, top: Tp, width: Wd, height: Ht, borderRadius: R, overflow: 'hidden', border: m > 0.02 ? `3px solid ${LINE}` : undefined, boxShadow: m > 0.02 ? '0 30px 60px rgba(0,0,0,.5)' : undefined}}>{video(0)}</div>;
  }
  const sw = Wd / n; const go = clamp(G / 26);
  return <>{sp.labels.map((lab, i) => {
    const dx = (i - (n - 1) / 2) * G; const dy = (i % 2 ? 1 : -1) * G * 0.55;
    return <div key={i} style={{position: 'absolute', left: L + i * sw + dx, top: Tp + dy, width: sw, height: Ht, borderRadius: R * 0.6 + 10 * go, overflow: 'hidden', border: `3px solid ${LIME}`, boxShadow: '0 20px 40px rgba(0,0,0,.55)'}}>
      {video(i * sw)}
      <div style={{position: 'absolute', left: 0, right: 0, top: m > 0.5 ? 14 : 330, textAlign: 'center', opacity: go}}>
        <span style={{fontFamily: MONO, fontWeight: 700, fontSize: m > 0.5 ? 22 : 30, color: BG, background: LIME, borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap'}}>{lab}</span>
      </div>
    </div>;
  })}</>;
};

/** lime slice that sweeps across on every layout switch */
const SliceWipe: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT();
  const edges: number[] = []; for (const [a, b] of cfg.bento) edges.push(a, b);
  const e = edges.find(x => t > x - 0.05 && t < x + 0.45); if (e === undefined) return null;
  const p = clamp((t - e + 0.05) / 0.45);
  return <div style={{position: 'absolute', left: -300, width: 1680, top: lerp(-260, 2100, Easing.inOut(Easing.cubic)(p)), height: 90, background: LIME, transform: 'rotate(-8deg)', opacity: 0.9, boxShadow: `0 0 60px ${LIME}`}} />;
};

const Captions: React.FC<{data: Data}> = ({data}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const pin = pop(f, pg.s);
  return <div style={{position: 'absolute', left: 30, right: 30, bottom: 270, textAlign: 'center', opacity: clamp(pin * 1.5), transform: `translateY(${(1 - pin) * 20}px)`}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: BRI, fontWeight: 800, fontSize: 62, lineHeight: 1.32, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const active = t >= w.t - 0.03 && t < w.e - 0.03; const past = t >= w.t - 0.03;
        const base: React.CSSProperties = {display: 'inline-block', margin: '0 7px', padding: '0 10px', borderRadius: 12, textShadow: active ? 'none' : '0 4px 0 rgba(0,0,0,.85), 0 0 16px rgba(0,0,0,.7)'};
        if (active) return <span key={j} style={{...base, color: BG, background: w.k ? LIME : WHITE, transform: 'scale(1.06)'}}>{w.w}</span>;
        return <span key={j} style={{...base, color: past ? (w.k ? LIME : WHITE) : 'rgba(242,242,238,.45)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT();
  return <AbsoluteFill style={{background: BG}}>
    <Backdrop />
    <Speaker cfg={cfg} />
    {scenes.map((s, i) => { if (t < s.a - 0.1 || t > s.b + 0.4) return null; const El = s.el; return <El key={i} />; })}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <SliceWipe cfg={cfg} />
    <Captions data={data} />
  </AbsoluteFill>;
};
