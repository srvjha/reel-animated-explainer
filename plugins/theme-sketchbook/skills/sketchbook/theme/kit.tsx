// Theme: SKETCHBOOK. Hard cuts between the speaker (full screen, real background, untouched) and full-screen notebook pages
// where every shape is hand-drawn (rough.js) and draws itself on, with handwriting fonts and a yellow highlighter.
//   talk - the camera shot full screen; only captions on top (no banners, no title plates)
//   page - a full-screen notebook page (ruled paper, red margin) plays the current scene; it slides in like a turned page
// Captions: handwritten (Kalam); the spoken word gets a yellow highlighter swipe.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing} from 'remotion';
import rough from 'roughjs';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/patrick-hand/400.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const PAPER = '#FBF8F1', RULE = '#D6E2F0', MARGIN = '#E9A0A0', INK = '#23232B', PENCIL = '#5B5B66';
export const BLUE = '#2F6FD6', RED = '#E04B3A', GREEN = '#2E9E5B', ORANGE = '#F08A24', HILITE = '#FFE45C', HILITE2 = '#BDEBFF';
export const HAND = 'Caveat', MARK = 'Kalam', PRINT = 'Patrick Hand';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});

export type Config = {
  cuts: {a: number; b: number; m: 'talk' | 'page'}[];   // hard cuts: speaker full screen or a full-screen page
  overlays?: React.FC[];
};

export const gen = rough.generator();
type Opt = {seed?: number; rough?: number; stroke?: string; sw?: number; fill?: string; fillStyle?: string; bow?: number};
const o = (p: Opt) => ({seed: p.seed ?? 7, roughness: p.rough ?? 1.4, bowing: p.bow ?? 1, stroke: p.stroke ?? INK, strokeWidth: p.sw ?? 4, fill: p.fill, fillStyle: p.fillStyle ?? 'hachure', hachureGap: 12, fillWeight: 2.5});

/** draw-on SVG of a rough.js drawable; t0 = start, d = draw duration */
const Draw: React.FC<{paths: {d: string; stroke: string; strokeWidth: number; fill?: string}[]; t0: number; d?: number; style?: React.CSSProperties; w?: number; h?: number}> = ({paths, t0, d = 0.6, style, w = W, h = H}) => {
  const t = useT(); if (t < t0 - 0.02) return null; const k = ease(t, t0, d);
  return <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style}}>
    {paths.map((p, i) => <path key={i} d={p.d} pathLength={1} fill="none" stroke={p.stroke === 'none' ? (p.fill || INK) : p.stroke} strokeWidth={p.stroke === 'none' ? 2.5 : p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - k} />)}
  </svg>;
};
export const RRect: React.FC<Opt & {x: number; y: number; w: number; h: number; t0: number; d?: number}> = ({x, y, w, h, t0, d, ...p}) => <Draw t0={t0} d={d} paths={gen.toPaths(gen.rectangle(x, y, w, h, o(p))) as any} />;
export const RCircle: React.FC<Opt & {x: number; y: number; r: number; t0: number; d?: number}> = ({x, y, r, t0, d, ...p}) => <Draw t0={t0} d={d} paths={gen.toPaths(gen.circle(x, y, r * 2, o(p))) as any} />;
export const RLine: React.FC<Opt & {x1: number; y1: number; x2: number; y2: number; t0: number; d?: number}> = ({x1, y1, x2, y2, t0, d, ...p}) => <Draw t0={t0} d={d} paths={gen.toPaths(gen.line(x1, y1, x2, y2, o(p))) as any} />;
/** any rough.js drawable(s): build = g => g.ellipse(...) or [..]; opt() gives the theme's stroke defaults */
export const RShape: React.FC<{build: (g: typeof gen, opt: (p: Opt) => any) => any; t0: number; d?: number}> = ({build, t0, d}) => {
  const r = build(gen, o); const list = Array.isArray(r) ? r : [r];
  return <Draw t0={t0} d={d} paths={list.flatMap(x => gen.toPaths(x)) as any} />;
};
/** sticky note that slaps onto the page */
export const Sticky: React.FC<{x: number; y: number; w: number; h: number; t0: number; rot?: number; color?: string; children?: React.ReactNode}> = ({x, y, w, h, t0, rot = -2, color = HILITE, children}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0 - 0.02) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${1.25 - 0.25 * p})`, opacity: clamp(p * 2), background: color, boxShadow: '0 14px 26px rgba(40,30,10,.18), inset 0 -10px 18px rgba(0,0,0,.05)', borderRadius: '4px 4px 22px 4px'}}>
    <div style={{position: 'absolute', left: w / 2 - 70, top: -22, width: 140, height: 44, background: 'rgba(255,255,255,.55)', transform: 'rotate(3deg)'}} />
    {children}
  </div>;
};
/** arrow with a hand-drawn head */
export const RArrow: React.FC<Opt & {x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; head?: number; curve?: number}> = ({x1, y1, x2, y2, t0, d = 0.5, head = 26, curve = 0, ...p}) => {
  const a = Math.atan2(y2 - y1, x2 - x1); const mx = (x1 + x2) / 2 - Math.sin(a) * curve, my = (y1 + y2) / 2 + Math.cos(a) * curve;
  const body = curve ? gen.curve([[x1, y1], [mx, my], [x2, y2]], o(p)) : gen.line(x1, y1, x2, y2, o(p));
  const ea = curve ? Math.atan2(y2 - my, x2 - mx) : a;
  const h1 = gen.line(x2, y2, x2 - head * Math.cos(ea - 0.45), y2 - head * Math.sin(ea - 0.45), o({...p, seed: (p.seed ?? 7) + 1}));
  const h2 = gen.line(x2, y2, x2 - head * Math.cos(ea + 0.45), y2 - head * Math.sin(ea + 0.45), o({...p, seed: (p.seed ?? 7) + 2}));
  return <><Draw t0={t0} d={d} paths={gen.toPaths(body) as any} /><Draw t0={t0 + d * 0.85} d={0.18} paths={[...gen.toPaths(h1), ...gen.toPaths(h2)] as any} /></>;
};
/** hand-drawn cross (X) */
export const RCross: React.FC<Opt & {x: number; y: number; s?: number; t0: number}> = ({x, y, s = 60, t0, ...p}) => <>
  <RLine x1={x - s} y1={y - s} x2={x + s} y2={y + s} t0={t0} d={0.18} stroke={RED} sw={9} {...p} />
  <RLine x1={x + s} y1={y - s} x2={x - s} y2={y + s} t0={t0 + 0.15} d={0.18} stroke={RED} sw={9} seed={(p.seed ?? 7) + 3} />
</>;
/** hand-drawn tick */
export const RTick: React.FC<Opt & {x: number; y: number; s?: number; t0: number}> = ({x, y, s = 50, t0, ...p}) => <Draw t0={t0} d={0.3} paths={gen.toPaths(gen.linearPath([[x - s, y], [x - s * 0.3, y + s * 0.7], [x + s, y - s * 0.8]], o({stroke: GREEN, sw: 9, ...p}))) as any} />;
/** highlighter swipe behind text area */
export const Hilite: React.FC<{x: number; y: number; w: number; h: number; t0: number; color?: string; d?: number}> = ({x, y, w, h, t0, color = HILITE, d = 0.4}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  return <div style={{position: 'absolute', left: x, top: y, width: w * k, height: h, background: color, opacity: 0.75, borderRadius: '6px 14px 8px 12px', transform: 'rotate(-1deg)', mixBlendMode: 'multiply'}} />;
};

/** handwriting that writes itself left to right */
export const Write: React.FC<{t0: number; x: number; y: number; size?: number; color?: string; font?: string; d?: number; children: React.ReactNode; rot?: number; w?: number; center?: boolean}> = ({t0, x, y, size = 64, color = INK, font = HAND, d = 0.6, children, rot = 0, w, center}) => {
  const t = useT(); if (t < t0 - 0.02) return null; const k = ease(t, t0, d);
  return <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: center ? 'center' : 'left', transform: `rotate(${rot}deg)`, fontFamily: font, fontWeight: 700, fontSize: size, color, lineHeight: 1.05, whiteSpace: 'nowrap', clipPath: `inset(-20% ${(1 - k) * 110 - 10}% -20% -10%)`}}>{children}</div>;
};

// ------------------------------------------------------------------ frame
const Paper: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(0deg, transparent 0 63px, ${RULE} 63px 66px)`, backgroundPosition: '0 30px'}} />
    <div style={{position: 'absolute', left: 92, top: 0, bottom: 0, width: 3, background: MARGIN}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.35, mixBlendMode: 'multiply'}}>
      <filter id="paperN"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.18 0" /></filter>
      <rect width={W} height={H} filter="url(#paperN)" />
    </svg>
    {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', left: 30, top: 300 + i * 560, width: 28, height: 28, borderRadius: 14, background: '#E4DED2', boxShadow: 'inset 0 3px 4px rgba(0,0,0,.18)'}} />)}
  </AbsoluteFill>
);

const pageAmt = (t: number, cfg: Config) => {
  // 0 = talk, 1 = page. Page slides in over 0.28 s at the start of each page cut and out at its end.
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.out(Easing.cubic)(clamp((t - c.a) / 0.28)); const kout = Easing.in(Easing.cubic)(clamp((t - (c.b - 0.22)) / 0.22));
    return {k: kin * (1 - kout), cut: c};
  }
  return {k: 0, cut: undefined as any};
};

/** captions: handwritten words; the spoken word gets a highlighter swipe */
const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = onPage ? 1600 : 1470;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: MARK, fontWeight: 700, fontSize: onPage ? 56 : 60, lineHeight: 1.3, whiteSpace: 'nowrap', textAlign: 'center'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        const col = onPage ? (active ? INK : w.k ? BLUE : INK) : (active ? INK : '#FFFFFF');
        return <span key={j} style={{position: 'relative', display: 'inline-block', margin: '0 8px', opacity: shown ? 1 : (onPage ? 0.25 : 0.35), transform: `translateY(${(1 - p) * 8}px) rotate(${active ? -1.5 : 0}deg)`, color: col,
          textShadow: onPage || active ? 'none' : '0 0 3px #000, 0 3px 0 #000, 0 0 16px rgba(0,0,0,.85)'}}>
          {active && <span style={{position: 'absolute', left: -8, right: -8, top: '18%', bottom: '8%', background: HILITE, borderRadius: '6px 14px 8px 12px', transform: 'rotate(-2deg)', zIndex: -1}} />}
          {w.w}
        </span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const {k} = pageAmt(t, cfg);
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H, transform: `scale(${1 + 0.03 * k})`}} />
    {k > 0.001 && <AbsoluteFill style={{transform: `translateY(${(1 - k) * 1920}px) rotate(${(1 - k) * 4}deg)`, transformOrigin: '0% 100%', boxShadow: '0 -20px 60px rgba(0,0,0,.35)'}}>
      <Paper />
      {scenes.map((s, i) => {
        if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.16, 0.16)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} onPage={k > 0.5} />
  </AbsoluteFill>;
};
