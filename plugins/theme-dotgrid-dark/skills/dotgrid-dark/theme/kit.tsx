// Theme: DOTGRID DARK. Hard cuts between the speaker (full screen, real background, untouched) and full-screen
// near-black pages with a dot grid and a soft green glow: dark cards, JetBrains Mono code panels, thread "lanes"
// with task bars, a callback queue, and an event-loop ring with phase nodes and a rotating pointer.
// Space Grotesk headings. Accent green (Node), cyan, amber, red. No purple.
//   talk - the camera shot full screen; only captions on top (no banners, no plates)
//   page - the page appears through the dot grid: every dot grows until it covers the screen, and shrinks away at the end
// Captions: Space Grotesk 700; the spoken word sits on a green pill.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const BG = '#060606', DOT = '#242424', CARD = '#101010', CARD2 = '#161616', LINE = '#2A2A2A', WHITE = '#F3F4F1', MUTED = '#8C8F8A', DIM = '#4A4D49';
export const GREEN = '#6CC24A', LIME = '#A6E36B', CYAN = '#22D3EE', AMBER = '#FBBF24', RED = '#F43F5E', CODEBG = '#0B0B0B';
export const SANS = 'Space Grotesk', MONO = 'JetBrains Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});

export type Config = {cuts: {a: number; b: number; m: 'talk' | 'page'}[]; overlays?: React.FC[]};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const Logo: React.FC<{src: string; h?: number; w?: number; style?: React.CSSProperties}> = ({src, h, w, style}) => <Img src={staticFile(src)} style={{height: h, width: w, objectFit: 'contain', display: 'block', ...style}} />;
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 22, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = WHITE, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);

/** dark card */
export const Panel: React.FC<{x: number; y: number; w: number; h?: number; t0: number; children?: React.ReactNode; border?: string; pad?: number; glow?: string; style?: React.CSSProperties}> = ({x, y, w, h, t0, children, border = LINE, pad = 26, glow, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`, opacity: clamp(p * 1.5),
    background: CARD, border: `2px solid ${border}`, borderRadius: 26, boxShadow: glow ? `0 0 40px ${glow}33, 0 20px 40px rgba(0,0,0,.6)` : '0 20px 40px rgba(0,0,0,.6)', padding: pad, boxSizing: 'border-box', ...style}}>{children}</div>;
};

/** pill / tag */
export const Tag: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; size?: number; icon?: string}> = ({children, color = GREEN, solid, size = 28, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: solid ? color : `${color}1A`, border: `2px solid ${color}`, color: solid ? '#050505' : color, fontFamily: MONO, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? '#050505' : color} />}{children}
  </div>
);

/** code panel; each line appears at its own time and can be highlighted */
export type CodeLine = {at: number; text: React.ReactNode; hl?: [number, number]; color?: string};
export const Code: React.FC<{x: number; y: number; w: number; t0: number; title?: string; lines: CodeLine[]; size?: number}> = ({x, y, w, t0, title, lines, size = 32}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp(p * 1.5), background: CODEBG, border: `2px solid ${LINE}`, borderRadius: 22, boxShadow: '0 22px 44px rgba(0,0,0,.6)', overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: `2px solid ${LINE}`, background: CARD2}}>
      {[RED, AMBER, GREEN].map(c => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
      {title && <span style={{marginLeft: 12, fontFamily: MONO, fontSize: 22, color: MUTED}}>{title}</span>}
    </div>
    <div style={{padding: '16px 24px 20px'}}>
      {lines.map((l, i) => {
        if (t < l.at) return <div key={i} style={{height: size * 1.55}} />;
        const k = ease(t, l.at, 0.35); const hl = l.hl && t >= l.hl[0] && t <= l.hl[1];
        return <div key={i} style={{fontFamily: MONO, fontSize: size, lineHeight: 1.55, color: l.color || WHITE, whiteSpace: 'pre', clipPath: `inset(-10% ${(1 - k) * 100}% -10% 0)`,
          background: hl ? 'rgba(108,194,74,.16)' : 'transparent', borderRadius: 6, margin: '0 -10px', padding: '0 10px', boxShadow: hl ? `inset 4px 0 0 ${GREEN}` : 'none'}}>{l.text}</div>;
      })}
    </div>
  </div>;
};
export const K: React.FC<{c: string; children: React.ReactNode}> = ({c, children}) => <span style={{color: c}}>{children}</span>;

/** solid arrow */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; dash?: boolean}> = ({x1, y1, x2, y2, t0, d = 0.35, color = MUTED, sw = 5, dash}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const a = Math.atan2(y2 - y1, x2 - x1); const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const hs = 18;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? '10 12' : undefined} strokeDashoffset={dash ? -t * 80 : 0} />
    {k > 0.9 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)} Z`} fill={color} stroke={color} strokeWidth={sw / 2} strokeLinejoin="round" />}
  </svg>;
};

/** a chip that moves from p1 to p2 between t0 and t0+d */
export const Mover: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; children: React.ReactNode; hold?: boolean}> = ({x1, y1, x2, y2, t0, d = 0.8, children, hold = true}) => {
  const t = useT(); if (t < t0) return null; const k = Easing.inOut(Easing.cubic)(clamp((t - t0) / d));
  if (!hold && t > t0 + d + 0.3) return null; const o = hold ? ease(t, t0, 0.2) : 1 - clamp((t - t0 - d) / 0.3);
  return <div style={{position: 'absolute', left: lerp(x1, x2, k), top: lerp(y1, y2, k), transform: 'translate(-50%,-50%)', opacity: o}}>{children}</div>;
};

/** horizontal lane (e.g. "JS thread") with bars that grow in at their own time */
export type Bar = {at: number; x: number; w: number; label?: string; color?: string; d?: number; ghost?: boolean};
export const Lane: React.FC<{x: number; y: number; w: number; h?: number; t0: number; label: string; color?: string; bars?: Bar[]; head?: [number, number, number, number]}> = ({x, y, w, h = 96, t0, label, color = GREEN, bars = [], head}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4);
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color, marginBottom: 10, letterSpacing: 1}}>{label}</div>
    <div style={{position: 'relative', width: w * k, height: h, borderRadius: 16, background: CARD, border: `2px solid ${LINE}`, overflow: 'hidden'}}>
      {bars.map((b, i) => {
        if (t < b.at) return null; const kb = ease(t, b.at, b.d ?? 0.5); const c = b.color || color;
        return <div key={i} style={{position: 'absolute', left: b.x, top: 10, height: h - 20, width: b.w * kb, borderRadius: 10, background: b.ghost ? 'transparent' : `${c}33`, border: `2px ${b.ghost ? 'dashed' : 'solid'} ${c}`,
          fontFamily: MONO, fontWeight: 700, fontSize: 24, color: c, display: 'flex', alignItems: 'center', paddingLeft: 14, boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden'}}>{b.label}</div>;
      })}
      {head && t >= head[0] && <div style={{position: 'absolute', top: 0, bottom: 0, width: 4, background: WHITE, boxShadow: `0 0 12px ${WHITE}`, left: lerp(head[2], head[3], clamp((t - head[0]) / (head[1] - head[0])))}} />}
    </div>
  </div>;
};

/** event-loop ring: phase nodes on a circle, a pointer at `angle` (radians, 0 = top, clockwise) and an active index */
export type Phase = {name: string; at?: number};
export const Ring: React.FC<{cx: number; cy: number; r: number; t0: number; phases: Phase[]; angle: number; active?: number; size?: number; dim?: boolean}> = ({cx, cy, r, t0, phases, angle, active = -1, size = 30, dim}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.8);
  const col = dim ? DIM : GREEN; const px = cx + r * Math.sin(angle), py = cy - r * Math.cos(angle);
  return <>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE} strokeWidth={14} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} transform={`rotate(-90 ${cx} ${cy})`} opacity={0.6} />
      {/* travelling arc behind the pointer */}
      {k >= 1 && <path d={`M ${cx + r * Math.sin(angle - 0.7)} ${cy - r * Math.cos(angle - 0.7)} A ${r} ${r} 0 0 1 ${px} ${py}`} stroke={col} strokeWidth={14} fill="none" strokeLinecap="round" />}
      {k >= 1 && <circle cx={px} cy={py} r={16} fill={dim ? DIM : WHITE} style={{filter: `drop-shadow(0 0 12px ${col})`}} />}
    </svg>
    {phases.map((p, i) => {
      const a = (i / phases.length) * Math.PI * 2; const x = cx + r * Math.sin(a), y = cy - r * Math.cos(a);
      const on = i === active; const shown = t >= (p.at ?? t0 + 0.2 + i * 0.12);
      if (!shown) return null; const q = ease(t, p.at ?? t0 + 0.2 + i * 0.12, 0.3);
      return <div key={p.name} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${(0.7 + 0.3 * q) * (on ? 1.12 : 1)})`, opacity: q,
        padding: '12px 22px', borderRadius: 999, background: on ? GREEN : CARD2, border: `3px solid ${on ? GREEN : LINE}`, color: on ? '#050505' : (dim ? DIM : WHITE),
        fontFamily: MONO, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: on ? `0 0 36px ${GREEN}88` : 'none'}}>{p.name}</div>;
    })}
  </>;
};

/** page heading: mono label + Space Grotesk title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number; color?: string}> = ({t0, label, title, size = 84, color = GREEN}) => {
  const t = useT(); const k1 = ease(t, t0, 0.35), k2 = ease(t, t0 + 0.1, 0.45);
  return <div style={{position: 'absolute', left: 90, top: 140, right: 60}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color, letterSpacing: 2, opacity: k1, transform: `translateX(${(1 - k1) * -20}px)`}}>{label}</div>
    <div style={{overflow: 'hidden', marginTop: 4}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: WHITE, lineHeight: 1.15, whiteSpace: 'nowrap', letterSpacing: -1, transform: `translateY(${(1 - k2) * 110}%)`}}>{title}</div>
    </div>
  </div>;
};

// ------------------------------------------------------------------ frame
const Dots: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${DOT} 2.4px, transparent 2.8px)`, backgroundSize: '34px 34px', backgroundPosition: '17px 17px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 42%, rgba(108,194,74,.10), transparent 70%)'}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,.9)'}} />
  </AbsoluteFill>
);

const pageAmt = (t: number, cfg: Config) => {
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.out(Easing.cubic)(clamp((t - c.a) / 0.36)); const kout = Easing.in(Easing.cubic)(clamp((t - (c.b - 0.28)) / 0.28));
    return kin * (1 - kout);
  }
  return 0;
};

const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1600 : 1470, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, lineHeight: 1.38, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 4px', padding: '0 12px', borderRadius: 14, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px) scale(${active ? 1.04 : 1})`,
          color: active ? '#050505' : w.k ? LIME : WHITE, background: active ? GREEN : 'transparent',
          textShadow: active ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 16px rgba(0,0,0,.95)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = pageAmt(t, cfg);
  const dr = 26 * k; // dot radius in a 36 px cell: covers fully above ~25.5
  const mask = k < 0.999 ? `radial-gradient(circle, #000 ${dr}px, transparent ${dr + 1}px)` : undefined;
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} />
    {k > 0.001 && <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '36px 36px', maskSize: '36px 36px', WebkitMaskPosition: 'center', maskPosition: 'center'}}>
      <Dots />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.16, 0.16)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} onPage={k > 0.5} />
  </AbsoluteFill>;
};
