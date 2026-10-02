// Theme: YELLOW TICKER. Speaker stays full screen; a yellow dotted card sits on the chest with
// scenes that swipe in like a deck; a black one-line ticker caption bar on top of the card.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/syne/700.css';
import '@fontsource/syne/800.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/800.css';
import '@fontsource/dm-mono/500.css';
import {FPS, Data, Scene, clamp, ease, useT, springAt} from '../core';

export const YEL = '#FFD60A', INK = '#0B0B0B', PAPER = '#FAF7EE', RED = '#FF4B2B', GREEN = '#19C37D', GREY = '#77756E', SOFT = '#E9E3CF';
export const SYNE = 'Syne', SORA = 'Sora', MONO = 'DM Mono';
/** scene box inside the yellow card, in px */
export const BOX_W = 1020, BOX_H = 560;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 12, stiffness: 190, mass: 0.7});

export type Config = {
  title: string;             // one line, always (keep <= ~24 chars at size 54)
  titleSize?: number;
  titleWindows: [number, number][];  // seconds the title chip is visible, e.g. [[0, 13], [62.4, 999]]
  punches?: [number, number][];      // [t, amount] quick zoom punches on the speaker (held ~2.2s)
};

export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 40}px)` : from === 'left' ? `translateX(${(1 - p) * -90}px)` : from === 'right' ? `translateX(${(1 - p) * 90}px)` : `scale(${0.5 + 0.5 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.5) * out, transform: tr, ...style}}>{children}</div>;
};
/** straight chip with hard offset shadow */
export const Tag: React.FC<{c?: string; bg?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({c = INK, bg = '#fff', size = 26, children, style}) => (
  <span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 500, fontSize: size, color: c, background: bg, border: `3px solid ${INK}`, borderRadius: 10, padding: '6px 14px', whiteSpace: 'nowrap', boxShadow: `4px 5px 0 ${INK}`, ...style}}>{children}</span>
);
export const Big: React.FC<{size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 64, children, style}) => (
  <span style={{fontFamily: SYNE, fontWeight: 800, fontSize: size, color: INK, lineHeight: 1.05, whiteSpace: 'nowrap', ...style}}>{children}</span>
);
const lbl = (s: number) => ({fontFamily: MONO, fontSize: 22 * Math.max(s, .8), color: INK, marginTop: 6, whiteSpace: 'nowrap' as const});

// ------------------------------------------------------------------ icons (flat, thick ink outlines)
export const Laptop: React.FC<{s?: number; label?: string}> = ({s = 1, label}) => (
  <div style={{textAlign: 'center', width: 150 * s}}>
    <div style={{width: 130 * s, height: 86 * s, margin: '0 auto', border: `${5 * s}px solid ${INK}`, borderRadius: 10 * s, background: '#fff'}} />
    <div style={{width: 150 * s, height: 14 * s, background: INK, borderRadius: `0 0 ${8 * s}px ${8 * s}px`}} />
    {label && <div style={lbl(s)}>{label}</div>}
  </div>);
export const Phone: React.FC<{s?: number; label?: string}> = ({s = 1, label}) => (
  <div style={{textAlign: 'center', width: 110 * s}}>
    <div style={{width: 62 * s, height: 104 * s, margin: '0 auto', border: `${5 * s}px solid ${INK}`, borderRadius: 14 * s, background: '#fff', position: 'relative'}}><div style={{position: 'absolute', left: '40%', bottom: 6 * s, width: '20%', height: 5 * s, background: INK, borderRadius: 3}} /></div>
    {label && <div style={lbl(s)}>{label}</div>}
  </div>);
export const TV: React.FC<{s?: number; label?: string}> = ({s = 1, label}) => (
  <div style={{textAlign: 'center', width: 160 * s}}>
    <div style={{width: 150 * s, height: 92 * s, margin: '0 auto', border: `${5 * s}px solid ${INK}`, borderRadius: 8 * s, background: INK}} />
    <div style={{width: 60 * s, height: 10 * s, margin: '0 auto', background: INK}} />
    {label && <div style={lbl(s)}>{label}</div>}
  </div>);
export const Router: React.FC<{s?: number; label?: string; hot?: boolean}> = ({s = 1, label, hot}) => {
  const t = useT();
  return <div style={{textAlign: 'center', width: 150 * s}}>
    <div style={{position: 'relative', height: 50 * s}}>{[-1, 1].map(k => <div key={k} style={{position: 'absolute', left: 75 * s + k * 40 * s - 3 * s, bottom: 0, width: 6 * s, height: 46 * s, background: INK, borderRadius: 3, transform: `rotate(${k * 14}deg)`}} />)}</div>
    <div style={{width: 150 * s, height: 56 * s, background: hot ? YEL : '#fff', border: `${5 * s}px solid ${INK}`, borderRadius: 12 * s, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 * s}}>
      {[0, 1, 2].map(i => <div key={i} style={{width: 12 * s, height: 12 * s, borderRadius: 6 * s, background: Math.floor(t * 5 + i) % 3 === 0 ? GREEN : SOFT, border: `2px solid ${INK}`}} />)}
    </div>
    {label && <div style={lbl(s)}>{label}</div>}
  </div>;
};
export const Server: React.FC<{s?: number; label?: string}> = ({s = 1, label}) => (
  <div style={{textAlign: 'center', width: 130 * s}}>
    {[0, 1, 2].map(i => <div key={i} style={{width: 120 * s, height: 40 * s, margin: `${6 * s}px auto 0`, background: '#fff', border: `${5 * s}px solid ${INK}`, borderRadius: 8 * s, position: 'relative'}}><div style={{position: 'absolute', right: 10 * s, top: 10 * s, width: 10 * s, height: 10 * s, borderRadius: 5 * s, background: GREEN}} /></div>)}
    {label && <div style={lbl(s)}>{label}</div>}
  </div>);
export const Cloud: React.FC<{label?: string}> = ({label = 'internet'}) => (
  <div style={{width: 210, height: 120, position: 'relative'}}>
    {[[20, 50, 70], [70, 20, 90], [130, 45, 70], [50, 60, 120]].map(([x, y, d], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: d, height: d * 0.75, borderRadius: d, background: '#fff', border: `5px solid ${INK}`}} />)}
    <div style={{position: 'absolute', left: 30, top: 66, width: 160, height: 40, background: '#fff'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: MONO, fontSize: 24, color: INK}}>{label}</div>
  </div>);
export const Envelope: React.FC<{to?: string; from?: string; w?: number}> = ({to, from, w = 300}) => (
  <div style={{width: w, height: w * 0.62, background: '#fff', border: `5px solid ${INK}`, borderRadius: 12, position: 'relative', overflow: 'hidden', boxShadow: `6px 8px 0 ${INK}`}}>
    <svg width={w} height={w * 0.62} style={{position: 'absolute', left: -5, top: -5}}><polyline points={`0,0 ${w / 2},${w * 0.3} ${w},0`} fill="none" stroke={INK} strokeWidth={5} /></svg>
    <div style={{position: 'absolute', right: 14, top: 12, width: w * 0.16, height: w * 0.19, background: YEL, border: `3px solid ${INK}`}} />
    {to !== undefined && <div style={{position: 'absolute', left: 18, bottom: 16, fontFamily: MONO, fontSize: w * 0.075, color: INK, lineHeight: 1.3}}>{from !== undefined && <div style={{color: GREY}}>FROM {from}</div>}<div><b>TO</b> {to}</div></div>}
  </div>);
/** dashed connector drawn from (x1,y1) to (x2,y2) as k goes 0 -> 1 */
export const Dash: React.FC<{x1: number; y1: number; x2: number; y2: number; k?: number; w?: number}> = ({x1, y1, x2, y2, k = 1, w = 6}) => (
  <svg width={BOX_W} height={BOX_H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}><line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={INK} strokeWidth={w} strokeDasharray="14 10" /></svg>
);
/** split-flap board: characters clatter then settle left to right */
export const Flap: React.FC<{text: string; t0: number; size?: number}> = ({text, t0, size = 92}) => {
  const t = useT(); const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return <div style={{display: 'flex', gap: 6}}>{text.split('').map((ch, i) => {
    const done = t > t0 + 0.12 + i * 0.07; const thin = ch === '.' || ch === ':' || ch === ' ';
    const shown = t < t0 ? ' ' : done || thin ? ch : chars[Math.floor(t * 30 + i * 3) % (/\d/.test(ch) ? 10 : chars.length)];
    return <div key={i} style={{width: thin ? size * 0.32 : size * 0.68, height: size * 1.22, background: thin ? 'transparent' : INK, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontFamily: MONO, fontWeight: 500, fontSize: size, color: thin ? INK : (done ? YEL : '#fff')}}>
      {shown}{!thin && <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 3, background: '#333'}} />}
    </div>;
  })}</div>;
};

// ------------------------------------------------------------------ frame
const PANEL_TOP = 1000, BAR_H = 104, CONTENT_H = 580;

const Speaker: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT();
  let z = 1.0 + 0.03 * clamp(t / 10);
  for (const [a, amt] of cfg.punches || []) z += amt * ease(t, a, 0.2) * clamp(1 - (t - a - 2.2) / 0.5);
  return <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 22%'}}><OffthreadVideo src={staticFile('src.mp4')} muted /></AbsoluteFill>;
};

const Panel: React.FC<{scenes: Scene[]}> = ({scenes}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const open = springAt(f, 4 / FPS, {damping: 15, stiffness: 120});
  const idx = scenes.findIndex(s => t >= s.a && t < s.b);
  return <div style={{position: 'absolute', left: 28, right: 28, top: PANEL_TOP + BAR_H - 14, height: CONTENT_H * open + 14, background: YEL, borderRadius: '0 0 34px 34px', overflow: 'hidden', border: `5px solid ${INK}`, borderTop: 'none', boxShadow: `0 14px 0 ${INK}`}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(11,11,11,.13) 2px, transparent 2.4px)`, backgroundSize: '26px 26px'}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.35) return null;
      const inK = ease(t, s.a - 0.05, 0.45); const outK = ease(t, s.b - 0.2, 0.45);
      const x = i === 0 ? -outK * 1100 : (1 - inK) * 1100 - outK * 1100;
      const El = s.el;
      return <div key={i} style={{position: 'absolute', left: 0, top: 14, width: BOX_W, height: CONTENT_H, transform: `translateX(${x}px) rotate(${(1 - inK) * 3 - outK * 3}deg)`}}><El /></div>;
    })}
  </div>;
};

const CaptionBar: React.FC<{data: Data}> = ({data}) => {
  const f = useCurrentFrame(); const t = f / FPS; const pages = data.pages;
  const i = pages.findIndex((p, j) => t >= p.s && t < Math.max(p.e, pages[j + 1]?.s ?? 999));
  const cur = pages[i]; const prev = pages[i - 1];
  const sw = cur ? ease(t, cur.s, 0.22) : 0;
  const line = (p: Data['pages'][0] | undefined, y: number, op: number) => p && <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: op, whiteSpace: 'nowrap', fontFamily: SORA, fontWeight: 800, fontSize: 54, lineHeight: `${BAR_H}px`}}>
    {p.words.map((w, j) => {
      const shown = t >= w.t - 0.04; const active = shown && t < w.e - 0.02; const pk = shown ? pop(f, w.t - 0.04) : 0;
      return <span key={j} style={{display: 'inline-block', margin: '0 9px', color: w.k ? YEL : '#fff', opacity: shown ? 1 : 0.18, transform: `translateY(${(1 - pk) * 16}px)`, position: 'relative'}}>
        {w.w}<span style={{position: 'absolute', left: 0, right: 0, bottom: 18, height: 7, borderRadius: 4, background: YEL, transform: `scaleX(${active ? 1 : 0})`, transformOrigin: 'left'}} />
      </span>;
    })}
  </div>;
  return <div style={{position: 'absolute', left: 28, right: 28, top: PANEL_TOP, height: BAR_H, background: INK, borderRadius: 30, overflow: 'hidden', border: `5px solid ${INK}`}}>
    {line(prev, -BAR_H * sw, 1 - sw)}{line(cur, BAR_H * (1 - sw), 1)}
  </div>;
};

const Title: React.FC<{cfg: Config}> = ({cfg}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const w = cfg.titleWindows.find(([a, b]) => t >= a && t < b); if (!w) return null;
  const [a, b] = w; const p = pop(f, a); const k = (a <= 0.01 ? 1 : clamp((t - a) / 0.3)) * clamp((b - t) / 0.3);
  return <div style={{position: 'absolute', left: 0, right: 0, top: 54, display: 'flex', justifyContent: 'center', opacity: clamp(k) * clamp(p * 1.4), transform: `translateY(${(1 - p) * -50}px) rotate(-1.5deg)`}}>
    <div style={{background: YEL, border: `5px solid ${INK}`, borderRadius: 18, padding: '10px 30px 14px', boxShadow: `8px 10px 0 ${INK}`, fontFamily: SYNE, fontWeight: 800, fontSize: cfg.titleSize ?? 54, color: INK, whiteSpace: 'nowrap'}}>{cfg.title}</div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => (
  <AbsoluteFill style={{background: INK}}>
    <Speaker cfg={cfg} />
    <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,.35), transparent 14%, transparent 86%, rgba(0,0,0,.3))'}} />
    <Title cfg={cfg} />
    <Panel scenes={scenes} />
    <CaptionBar data={data} />
  </AbsoluteFill>
);
