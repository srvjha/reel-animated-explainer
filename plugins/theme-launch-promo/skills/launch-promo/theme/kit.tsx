// Theme: LAUNCH PROMO. For product promo reels: talking-head problem/solution with real screen
// recordings of the product cut in. Two layouts per time window:
//   talk - speaker full screen (real background), bold captions, optional overlays (hook, CTA)
//   card - brand canvas: a browser-frame card on top plays a demo clip (zoomed into the part that
//          matters, sped up) or a graphic; the speaker stays visible in a window below
// Colours default to a calm product palette; set cfg.brand to match the product.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/source-serif-4/600.css';
import '@fontsource/source-serif-4/700.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/jetbrains-mono/500.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const CREAM = '#EEF0EA', CREAM2 = '#F7F8F4', INK = '#1C1F1E', SUB = '#6A6E69', LINEC = '#DEDBD0', WHITE = '#FFFFFF';
export const RED = '#D64545', AMBER = '#E0A100', GREEN = '#1E8E5A';
export const SERIF = 'Source Serif 4', SANS = 'Plus Jakarta Sans', MONO = 'JetBrains Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});
/** card scene box (px); scenes draw in CARD_W x (CARD_H - 60) under the browser bar */
export const CARD_W = 1000, CARD_H = 900;

export type Config = {
  brand: {name: string; color: string; tag?: string; url?: string};   // wordmark text, accent colour, small tag, URL in the browser bar
  modes: {a: number; b: number; m: 'talk' | 'card'}[];
  face: {y0: number; y1: number};      // source rows (in the 1080x1920 video) shown in the speaker window during card mode
  overlays?: React.FC[];               // hook text, CTA, stickers (drawn above everything except captions)
};

// ------------------------------------------------------------------ primitives
export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 40}px)` : from === 'down' ? `translateY(${(1 - p) * -40}px)` : from === 'left' ? `translateX(${(1 - p) * -90}px)` : from === 'right' ? `translateX(${(1 - p) * 90}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.6) * out, transform: tr, ...style}}>{children}</div>;
};
export const Pill: React.FC<{color: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color, solid, size = 28, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 800, fontSize: size, color: solid ? WHITE : color, background: solid ? color : WHITE, border: `3px solid ${color}`, borderRadius: 999, padding: '8px 22px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
export const Serif: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 64, color = INK, children, style}) => (
  <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, color, lineHeight: 1.08, letterSpacing: '-.01em', ...style}}>{children}</div>
);

/** paper resume thumbnail */
export const ResumeDoc: React.FC<{w?: number; title?: string; accent?: string; lines?: number; stamp?: string; stampColor?: string}> = ({w = 220, title = 'Resume', accent = INK, lines = 7, stamp, stampColor = RED}) => (
  <div style={{width: w, height: w * 1.3, background: WHITE, borderRadius: 10, border: `2px solid ${LINEC}`, boxShadow: '0 14px 30px rgba(0,0,0,.12)', padding: w * 0.09, position: 'relative', overflow: 'hidden'}}>
    <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: w * 0.1, color: accent, textAlign: 'center', whiteSpace: 'nowrap'}}>{title}</div>
    <div style={{height: 2, background: accent, opacity: 0.6, margin: `${w * 0.04}px 0`}} />
    {Array.from({length: lines}).map((_, i) => <div key={i} style={{height: w * 0.035, width: `${60 + ((i * 37) % 40)}%`, background: '#D9D6CC', borderRadius: 3, margin: `${w * 0.045}px 0`}} />)}
    {stamp && <div style={{position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%,-50%) rotate(-14deg)', fontFamily: SANS, fontWeight: 800, fontSize: w * 0.13, color: stampColor, border: `${w * 0.02}px solid ${stampColor}`, borderRadius: 10, padding: '2px 12px', whiteSpace: 'nowrap', background: 'rgba(255,255,255,.85)'}}>{stamp}</div>}
  </div>
);

/** a job description chip */
export const JD: React.FC<{role: string; co: string; color: string}> = ({role, co, color}) => (
  <div style={{width: 300, background: WHITE, borderRadius: 16, border: `2px solid ${LINEC}`, borderLeft: `8px solid ${color}`, padding: '14px 18px', boxShadow: '0 10px 22px rgba(0,0,0,.08)'}}>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: INK, whiteSpace: 'nowrap'}}>{role}</div>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, color: SUB, whiteSpace: 'nowrap'}}>{co} &middot; job description</div>
  </div>
);

/**
 * Screen-recording player with a virtual camera. Plays `src` (public/) from source second s0, sped up so
 * [s0, s1] fills [a, b] of the reel. `keys` are camera keyframes in SOURCE seconds: centre (cx, cy) in
 * source pixels and zoom z (1 = whole width fits the card). Eased between keyframes.
 */
export const Demo: React.FC<{src: string; a: number; b: number; s0: number; s1: number; sw?: number; sh?: number; keys: {t: number; cx: number; cy: number; z: number}[]; w?: number; h?: number}> = ({src, a, b, s0, s1, sw = 2560, sh = 1440, keys, w = CARD_W, h = CARD_H - 60}) => {
  const t = useT(); const rate = (s1 - s0) / (b - a);
  const st = s0 + clamp(t - a, 0, b - a) * rate;
  let i = 0; while (i < keys.length - 1 && st > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[Math.min(i + 1, keys.length - 1)];
  const q = k1 === k0 ? 0 : Easing.inOut(Easing.cubic)(clamp((st - k0.t) / Math.max(0.01, k1.t - k0.t)));
  const z = lerp(k0.z, k1.z, q), cx = lerp(k0.cx, k1.cx, q), cy = lerp(k0.cy, k1.cy, q);
  const s = (w / sw) * z;                       // px per source px
  const vw = w / s, vh = h / s;                 // visible source size
  const x0 = clamp(cx - vw / 2, 0, Math.max(0, sw - vw)), y0 = clamp(cy - vh / 2, Math.min(0, sh - vh) / 2, Math.max(0, sh - vh));
  return <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', background: CREAM2}}>
    <Sequence from={Math.round(a * FPS)} durationInFrames={Math.max(1, Math.round((b - a) * FPS) + 10)} layout="none">
      <div style={{position: 'absolute', left: -x0 * s, top: -y0 * s, width: sw * s, height: sh * s}}>
        <OffthreadVideo src={staticFile(src)} startFrom={Math.round(s0 * FPS)} playbackRate={rate} muted style={{width: '100%', height: '100%'}} />
      </div>
    </Sequence>
    {rate > 1.3 && <div style={{position: 'absolute', right: 16, bottom: 14, fontFamily: MONO, fontWeight: 500, fontSize: 22, color: WHITE, background: 'rgba(28,31,30,.7)', borderRadius: 8, padding: '3px 10px'}}>{rate.toFixed(1)}&times;</div>}
  </div>;
};

// ------------------------------------------------------------------ frame
const modeW = (t: number, cfg: Config) => {
  let card = 0;
  for (const s of cfg.modes) if (s.m === 'card') card = Math.max(card, Easing.inOut(Easing.cubic)(clamp((t - s.a + 0.25) / 0.5)) * (1 - Easing.inOut(Easing.cubic)(clamp((t - s.b + 0.25) / 0.5))));
  return card;
};

const Canvas: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => {
  const t = useT(); const c = cfg.brand.color;
  return <AbsoluteFill style={{opacity: k, background: CREAM}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(28,31,30,.10) 1.4px, transparent 1.8px)', backgroundSize: '26px 26px'}} />
    <div style={{position: 'absolute', left: -200 + Math.sin(t * 0.3) * 60, top: 200, width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${c}22, transparent 65%)`}} />
    <div style={{position: 'absolute', right: -260, top: 1100 + Math.cos(t * 0.25) * 60, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${c}1c, transparent 65%)`}} />
  </AbsoluteFill>;
};

const Wordmark: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 18, height: 18, borderRadius: 5, background: cfg.brand.color}} />
      <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: INK}}>{cfg.brand.name}</span>
    </div>
    {cfg.brand.tag && <Pill color={cfg.brand.color} size={24}>{cfg.brand.tag}</Pill>}
  </div>
);

const Card: React.FC<{cfg: Config; scenes: Scene[]; k: number}> = ({cfg, scenes, k}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 150, width: CARD_W, height: CARD_H, opacity: k, transform: `translateY(${(1 - k) * 120}px) scale(${0.94 + 0.06 * k})`, background: WHITE, borderRadius: 28, border: `2px solid ${LINEC}`, boxShadow: '0 30px 70px rgba(28,31,30,.18)', overflow: 'hidden'}}>
    <div style={{height: 60, background: '#ECEAE2', display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: `2px solid ${LINEC}`}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{width: 15, height: 15, borderRadius: 8, background: c}} />)}
      <span style={{marginLeft: 18, flex: 1, height: 36, borderRadius: 10, background: WHITE, border: `2px solid ${LINEC}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: MONO, fontWeight: 500, fontSize: 20, color: SUB}}>{cfg.brand.url ?? ''}</span>
    </div>
    <div style={{position: 'absolute', left: 0, top: 60, width: CARD_W, height: CARD_H - 60}}>
      {scenes.map((s, i) => {
        if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
        const inK = ease(t, s.a - 0.05, 0.35), outK = ease(t, s.b - 0.1, 0.3);
        const El = s.el;
        return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK)}}><El /></div>;
      })}
    </div>
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => {
  // full screen -> rounded window (y 1300..1880) showing the face rows cfg.face
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 640, X1 = 40, Y1 = 1245;
  const s1 = Math.max(W1 / 1080, H1 / fh);      // scale so the face band fills the window
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 34 * k, overflow: 'hidden', boxShadow: k > 0.02 ? '0 24px 50px rgba(28,31,30,.25)' : undefined, border: k > 0.02 ? `${4 * k}px solid ${WHITE}` : undefined}}>
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(transparent 55%, rgba(0,0,0,.45))', opacity: 1 - k}} />
  </div>;
};

/** captions: full screen -> bold white low; card mode -> dark on the cream band between card and window */
const Captions: React.FC<{data: Data; cfg: Config; k: number}> = ({data, cfg, k}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(1380, 1068, k); const dark = k > 0.5;
  return <div style={{position: 'absolute', left: 20, right: 20, top, textAlign: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: lerp(62, 48, k), lineHeight: 1.22, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        const base: React.CSSProperties = {display: 'inline-block', margin: '0 6px', padding: '0 10px', borderRadius: 12, opacity: shown ? 1 : 0, transform: `translateY(${(1 - p) * 14}px)`};
        if (active) return <span key={j} style={{...base, background: cfg.brand.color, color: WHITE}}>{w.w}</span>;
        return <span key={j} style={{...base, color: dark ? (w.k ? cfg.brand.color : INK) : (w.k ? '#BFF0DE' : WHITE), textShadow: dark ? 'none' : '0 4px 14px rgba(0,0,0,.75), 0 2px 0 rgba(0,0,0,.6)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = modeW(t, cfg);
  return <AbsoluteFill style={{background: INK}}>
    <Canvas cfg={cfg} k={k} />
    <Speaker cfg={cfg} k={k} />
    <Card cfg={cfg} scenes={scenes} k={k} />
    <Wordmark cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} cfg={cfg} k={k} />
  </AbsoluteFill>;
};
