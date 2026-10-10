// Theme: SAFFRON LEDGER. Warm cream paper, saffron + India green accents, navy ink (fintech / payments feel).
//   talk - the speaker full screen (intro hook, punchlines); overlays live in the band y 1000 to 1560, captions sit below
//   card - a cream "ledger" card (saffron | white | green top bands) plays the diagram scenes; the speaker sits in a
//          stamped window below, scaled so the whole band from hair to mic is visible (never cropped)
//   full - same card stretched to 1000 x 1530, speaker window slides away (when the camera shot is unusable)
// Captions are a receipt slip with a hard navy shadow; the spoken word gets a saffron highlighter, keywords print green.
// Icons: Phosphor duotone SVGs in public/icons/ (no Lucide), drawn tinted with <Icon name="bank" color={GREEN} />.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/800.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const PAPER = '#F9EED6', PAPER2 = '#F3E9D6', CARD = '#FFFDF8', LINE = '#E7DCC6', RULE = '#EADFCB';
export const INK = '#1B2A4A', SUB = '#6E675E', SAFFRON = '#EE7623', DEEPSAF = '#C4561A', GREEN = '#0B7A3E', LEAF = '#2E9E5B';
export const RED = '#D64545', AMBER = '#E9A23B', SLATE = '#6A6B6E';
export const DISPLAY = 'Outfit', SANS = 'IBM Plex Sans', MONO = 'IBM Plex Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});
/** scene box inside the card */
export const CARD_W = 1000, CARD_H = 840;
/** scene box in 'full' mode */
export const FULL_H = 1530;

export type Config = {
  title: string;                                    // one line; shown in the header right of the logo
  logo?: string;                                    // official logo in public/ (never redrawn), inline left of the title
  logoH?: number;                                   // logo height in the header (wide wordmarks need less)
  modes: {a: number; b: number; m: 'talk' | 'card' | 'full'}[];
  face: {y0: number; y1: number};                   // source rows (1080x1920) from hair top to mic, shown whole in the window
  overlays?: React.FC[];
  speaker?: string;                                 // transparent cut-out speaker video in public/ (VP9 alpha); omit to use src.mp4 as is
  halftone?: string;                                // halftone dot layer PNG in public/ (default halftone.png)
};

// ------------------------------------------------------------------ primitives
export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 40}px)` : from === 'down' ? `translateY(${(1 - p) * -40}px)` : from === 'left' ? `translateX(${(1 - p) * -90}px)` : from === 'right' ? `translateX(${(1 - p) * 90}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.6) * out, transform: tr, ...style}}>{children}</div>;
};

export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = INK, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', ...style}} />;
};

/** official logo image from public/ */
export const Logo: React.FC<{src: string; h?: number; w?: number; style?: React.CSSProperties}> = ({src, h, w, style}) => (
  <Img src={staticFile(src)} style={{height: h, width: w, objectFit: 'contain', display: 'block', ...style}} />
);

/** tile: icon (or logo) in a cream tile with a hard ink shadow; tone saffron / green / red */
export const Node: React.FC<{icon?: string; logo?: string; label: string; sub?: string; w?: number; tone?: 'saf' | 'green' | 'red' | 'ink'; on?: boolean; dim?: boolean}> = ({icon, logo, label, sub, w = 220, tone = 'ink', on, dim}) => {
  const c = tone === 'saf' ? SAFFRON : tone === 'green' ? GREEN : tone === 'red' ? RED : INK;
  return <div style={{width: w, padding: '18px 12px 16px', borderRadius: 20, background: on ? (tone === 'green' ? '#E7F4EC' : tone === 'red' ? '#FBE9E9' : '#FDEBDC') : CARD, border: `3px solid ${on ? c : INK}`, boxShadow: `6px 6px 0 ${on ? c : INK}`, textAlign: 'center', opacity: dim ? 0.35 : 1, boxSizing: 'border-box'}}>
    <div style={{display: 'flex', justifyContent: 'center', height: w * 0.3, alignItems: 'center'}}>{logo ? <Logo src={logo} h={w * 0.3} /> : <Icon name={icon || 'bank'} size={w * 0.3} color={on ? c : INK} />}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: INK, marginTop: 10, whiteSpace: 'nowrap'}}>{label}</div>
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 18, color: SUB, marginTop: 4, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};

export const Tag: React.FC<{color?: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = DEEPSAF, solid, size = 24, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 600, fontSize: size, color: solid ? '#fff' : color, background: solid ? color : CARD, border: `2px solid ${color}`, borderRadius: 10, padding: '6px 16px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** headline with a saffron kicker and a green underline */
export const Heading: React.FC<{t0: number; t1?: number; kicker: string; title: string}> = ({t0, t1, kicker, title}) => {
  const t = useT();
  return <Appear t0={t0} t1={t1} from="left" style={{left: 36, top: 34}}>
    <div style={{fontFamily: MONO, fontWeight: 600, fontSize: 22, color: DEEPSAF, letterSpacing: '.14em'}}>{kicker}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, color: INK, lineHeight: 1.08, whiteSpace: 'nowrap', marginTop: 2}}>{title}</div>
    <div style={{height: 6, width: 120 * ease(t, t0 + 0.2, 0.5), background: GREEN, borderRadius: 3, marginTop: 8}} />
  </Appear>;
};

/** dashed rail with moving rupee packets (card coords) */
export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; w?: number; h?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = SAFFRON, n = 3, speed = 1, w = 4, h = FULL_H}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.45); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={CARD_W} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op, pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={INK} strokeOpacity={0.25} strokeWidth={w} strokeDasharray="12 10" strokeLinecap="round" />
    {k > 0.95 && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <g key={i} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)}><circle cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={13} fill={color} stroke={CARD} strokeWidth={3} /></g>; })}
  </svg>;
};

/** animated rupee amount (Indian grouping, 2 decimals optional) */
export const Rs: React.FC<{t0: number; to: number; from?: number; d?: number; dec?: boolean; size?: number; color?: string; sign?: string}> = ({t0, to, from = 0, d = 0.9, dec = true, size = 64, color = INK, sign = ''}) => {
  const t = useT(); const v = lerp(from, to, ease(t, t0, d));
  return <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{sign}{'₹'}{v.toLocaleString('en-IN', {minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0})}</span>;
};

/** phone outline; children drawn on the screen */
export const Phone: React.FC<{w?: number; h?: number; children?: React.ReactNode}> = ({w = 300, h = 560, children}) => (
  <div style={{width: w, height: h, borderRadius: w * 0.14, background: INK, padding: 12, boxSizing: 'border-box', boxShadow: `8px 8px 0 ${SAFFRON}`}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.1, background: CARD, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: 10, width: w * 0.26, height: 10, marginLeft: -w * 0.13, borderRadius: 5, background: INK}} />
      {children}
    </div>
  </div>
);

// ------------------------------------------------------------------ frame
const spansOf = (cfg: Config, ms: string[]) => {
  const out: {a: number; b: number}[] = [];
  for (const s of [...cfg.modes].sort((x, y) => x.a - y.a)) if (ms.includes(s.m)) {
    const l = out[out.length - 1]; if (l && Math.abs(l.b - s.a) < 0.01) l.b = s.b; else out.push({a: s.a, b: s.b});
  }
  return out;
};
const amt = (t: number, spans: {a: number; b: number}[]) => {
  let k = 0;
  for (const s of spans) k = Math.max(k, Easing.inOut(Easing.cubic)(clamp((t - s.a + 0.25) / 0.5)) * (1 - Easing.inOut(Easing.cubic)(clamp((t - s.b + 0.25) / 0.5))));
  return k;
};

const Backdrop: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT();
  return <AbsoluteFill style={{background: PAPER}}>
    <Img src={staticFile(cfg.halftone || 'halftone.png')} style={{position: 'absolute', left: -40, top: -40, width: 1160, height: 2000, transform: `translate(${Math.sin(t * 0.25) * 18}px, ${Math.cos(t * 0.2) * 22}px)`}} />
    <div style={{position: 'absolute', left: 26, top: 0, bottom: 0, width: 3, background: SAFFRON, opacity: 0.35}} />
    <div style={{position: 'absolute', right: 26, top: 0, bottom: 0, width: 3, background: GREEN, opacity: 0.35}} />
    {[0, 1, 2, 3].map(i => { const y = 1920 - ((t * (26 + i * 6) + i * 520) % 2100);
      return <div key={i} style={{position: 'absolute', left: [50, 960, 930, 20][i], top: y, opacity: 0.16, transform: `rotate(${Math.sin(t * 0.8 + i) * 14}deg)`}}><Icon name={['currency-inr', 'bank', 'coins', 'qr-code'][i]} size={56} color={i % 2 ? GREEN : DEEPSAF} /></div>; })}
  </AbsoluteFill>;
};

const Header: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => (
  <div style={{position: 'absolute', left: 40, top: 38, height: 70, display: 'flex', alignItems: 'center', gap: 18, opacity: k, transform: `translateY(${(1 - k) * -30}px)`}}>
    {cfg.logo && <Logo src={cfg.logo} h={cfg.logoH || 64} />}
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: INK, whiteSpace: 'nowrap'}}>{cfg.title}</span>
  </div>
);

const Card: React.FC<{scenes: Scene[]; k: number; fk: number}> = ({scenes, k, fk}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: lerp(CARD_H, FULL_H, fk), opacity: k, transform: `translateY(${(1 - k) * -80}px)`, background: CARD, borderRadius: 28, border: `3px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, overflow: 'hidden', boxSizing: 'border-box'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 7, background: SAFFRON}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 7, height: 5, background: CARD}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 12, height: 7, background: GREEN}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${LINE} 1.6px, transparent 2px)`, backgroundSize: '28px 28px', opacity: 0.9}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
      const inK = ease(t, s.a - 0.05, 0.4), outK = ease(t, s.b - 0.12, 0.3);
      const El = s.el;
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `translateY(${(1 - inK) * 30 - outK * 30}px)`}}><El /></div>;
    })}
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number; fk: number}> = ({cfg, k, fk}) => {
  // full screen -> stamped window (x 40, y 1160, 1000 x 720), whole face band visible (letterboxed, never cropped)
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 720, X1 = 40, Y1 = 1160;
  const s1 = Math.min(H1 / fh, W1 / 1080 * 1.12);
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  return <div style={{position: 'absolute', left: x, top: y + fk * 820, opacity: 1 - fk, width: w, height: h, borderRadius: 28 * k, overflow: 'hidden', background: k > 0.02 ? PAPER2 : 'transparent', border: k > 0.02 ? `${3 * k}px solid ${INK}` : undefined, boxShadow: k > 0.02 ? `${10 * k}px ${10 * k}px 0 ${GREEN}` : undefined, boxSizing: 'border-box'}}>
    {cfg.speaker && k > 0.02 && <Img src={staticFile(cfg.halftone || 'halftone.png')} style={{position: 'absolute', left: -200, top: -300, width: 1400, height: 2490, opacity: k}} />}
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s}}>
      {cfg.speaker ? <OffthreadVideo src={staticFile(cfg.speaker)} transparent muted style={{width: '100%', height: '100%'}} /> : <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />}
    </div>
  </div>;
};

/** captions: receipt slip, navy words, the spoken word gets a saffron highlighter, keywords print green */
const Captions: React.FC<{data: Data; k: number; fk: number}> = ({data, k, fk}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(lerp(1590, 990, k), 1690, fk);
  const fs = lerp(52, 45, k);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: CARD, borderRadius: 18, padding: '10px 22px 12px', border: `3px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}`}}>
      {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: fs, lineHeight: 1.25, whiteSpace: 'nowrap', textAlign: 'center'}}>
        {ln.map((w, j) => {
          const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
          return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 6px', borderRadius: 8, opacity: shown ? 1 : 0.3, transform: `translateY(${(1 - p) * 8}px)`,
            background: active ? SAFFRON : 'transparent', color: active ? '#fff' : (w.k ? GREEN : INK)}}>{w.w}</span>;
        })}
      </div>)}
    </div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = amt(t, spansOf(cfg, ['card', 'full'])); const fk = amt(t, spansOf(cfg, ['full']));
  return <AbsoluteFill style={{background: PAPER}}>
    <Backdrop cfg={cfg} />
    <Speaker cfg={cfg} k={k} fk={fk} />
    <Card scenes={scenes} k={k} fk={fk} />
    <Header cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} k={k} fk={fk} />
  </AbsoluteFill>;
};
