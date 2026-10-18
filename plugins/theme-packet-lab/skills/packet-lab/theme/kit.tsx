// Theme: PACKET LAB. Hard cuts between the speaker (full screen, real background, untouched) and full-screen
// "network lab" pages: cool off-white with a dot grid, client and server devices, wires that draw on, packets
// (envelope chips) that travel along them, dark code panels with real HTTP/JSON text, byte streams, and a small
// cycle tracker that shows which step of the flow we are on. Sora headings + IBM Plex Mono.
//   talk - the camera shot full screen; only captions on top (no banners, no plates)
//   page - the lab opens with a circular iris from the bottom right and closes back into it at the end
// Captions: Sora 700; the spoken word sits on a blue pill.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/sora/400.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const BG = '#EEF2F7', DOT = '#C9D3E1', CARD = '#FFFFFF', LINE = '#D5DDE8', INK = '#0F1B33', SUB = '#5B6B84', CODEBG = '#0F1B33', CODEFG = '#DCE6F5';
export const BLUE = '#2563EB', TEAL = '#0F9D76', AMBER = '#F5A524', RED = '#E5484D', SKY = '#38BDF8', SLATE = '#94A3B8';
export const SANS = 'Sora', MONO = 'IBM Plex Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});

export type Config = {cuts: {a: number; b: number; m: 'talk' | 'page'}[]; overlays?: React.FC[]; steps?: string[]; stepAt?: (t: number) => number | 'all' | null};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = INK, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const Logo: React.FC<{src: string; h?: number; w?: number; style?: React.CSSProperties}> = ({src, h, w, style}) => <Img src={staticFile(src)} style={{height: h, width: w, objectFit: 'contain', display: 'block', ...style}} />;
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 22, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = INK, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);

/** white rounded card */
export const Panel: React.FC<{x: number; y: number; w: number; h?: number; t0: number; children?: React.ReactNode; border?: string; pad?: number; style?: React.CSSProperties}> = ({x, y, w, h, t0, children, border = LINE, pad = 26, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`, opacity: clamp(p * 1.5),
    background: CARD, border: `3px solid ${border}`, borderRadius: 28, boxShadow: '0 18px 40px rgba(15,27,51,.10)', padding: pad, boxSizing: 'border-box', ...style}}>{children}</div>;
};

/** pill / tag */
export const Tag: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; size?: number; icon?: string}> = ({children, color = BLUE, solid, size = 28, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: solid ? color : `${color}1F`, border: `2px solid ${color}`, color: solid ? '#fff' : color, fontFamily: MONO, fontWeight: 600, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? '#fff' : color} />}{children}
  </div>
);

/** client / server device card */
export const Device: React.FC<{x: number; y: number; t0: number; kind: 'client' | 'server'; label?: string; sub?: string; w?: number; h?: number; glow?: number; icon?: string}> = ({x, y, t0, kind, label, sub, w = 300, h = 300, glow = 0, icon}) => {
  const c = kind === 'client' ? BLUE : TEAL;
  return <Panel x={x} y={y} w={w} h={h} t0={t0} border={c} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: `0 18px 40px rgba(15,27,51,.10), 0 0 ${40 * glow}px ${c}`}}>
    <div style={{width: w * 0.42, height: w * 0.42, borderRadius: 24, background: `${c}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name={icon || (kind === 'client' ? 'device-mobile' : 'hard-drives')} size={w * 0.3} color={c} />
    </div>
    <Txt size={40} w={800}>{label || (kind === 'client' ? 'Client' : 'Server')}</Txt>
    {sub && <Txt size={24} w={400} font={MONO} color={SUB}>{sub}</Txt>}
  </Panel>;
};

/** wire between two points; draws on, then dashes flow while `flow` window is active */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; flow?: [number, number]; sw?: number; head?: boolean}> = ({x1, y1, x2, y2, t0, d = 0.4, color = SLATE, flow, sw = 6, head}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const on = flow && t >= flow[0] && t <= flow[1];
  const a = Math.atan2(y2 - y1, x2 - x1); const hs = 22;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={LINE} strokeWidth={sw + 8} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={on ? color : SLATE} strokeWidth={sw} strokeLinecap="round" strokeDasharray={on ? '14 14' : undefined} strokeDashoffset={on ? -t * 120 : 0} />
    {head && k > 0.95 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={on ? color : SLATE} strokeWidth={sw} strokeLinecap="round" fill="none" />}
  </svg>;
};

/** a packet (envelope chip) travelling from p1 to p2 between t0 and t0+d */
export const Packet: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; label: string; color?: string; hold?: boolean; icon?: string}> = ({x1, y1, x2, y2, t0, d = 1.0, label, color = AMBER, hold, icon = 'envelope-simple'}) => {
  const t = useT(); if (t < t0) return null; const k = Easing.inOut(Easing.cubic)(clamp((t - t0) / d));
  if (!hold && t > t0 + d + 0.35) return null;
  const o = hold ? 1 : 1 - clamp((t - t0 - d) / 0.3);
  const x = lerp(x1, x2, k), y = lerp(y1, y2, k) - Math.sin(k * Math.PI) * 26;
  return <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 16, background: color, color: INK,
    fontFamily: MONO, fontWeight: 600, fontSize: 26, whiteSpace: 'nowrap', boxShadow: `0 10px 24px ${color}66`}}>
    <Icon name={icon} size={32} color={INK} />{label}
  </div>;
};

/** dark code panel; each line appears at its own time (types in) and can be highlighted */
export type CodeLine = {at: number; text: React.ReactNode; raw?: string; hl?: [number, number]; color?: string};
export const Code: React.FC<{x: number; y: number; w: number; t0: number; title?: string; lines: CodeLine[]; size?: number}> = ({x, y, w, t0, title, lines, size = 34}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp(p * 1.5), background: CODEBG, borderRadius: 24, boxShadow: '0 22px 44px rgba(15,27,51,.28)', overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '2px solid #22314F'}}>
      {[RED, AMBER, TEAL].map(c => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
      {title && <span style={{marginLeft: 12, fontFamily: MONO, fontSize: 22, color: SLATE}}>{title}</span>}
    </div>
    <div style={{padding: '18px 26px 22px'}}>
      {lines.map((l, i) => {
        if (t < l.at) return <div key={i} style={{height: size * 1.55}} />;
        const k = ease(t, l.at, 0.35); const hl = l.hl && t >= l.hl[0] && t <= l.hl[1];
        return <div key={i} style={{fontFamily: MONO, fontSize: size, lineHeight: 1.55, color: l.color || CODEFG, whiteSpace: 'pre', clipPath: `inset(-10% ${(1 - k) * 100}% -10% 0)`,
          background: hl ? 'rgba(245,165,36,.22)' : 'transparent', borderRadius: 6, margin: '0 -10px', padding: '0 10px', boxShadow: hl ? `inset 4px 0 0 ${AMBER}` : 'none'}}>{l.text}</div>;
      })}
    </div>
  </div>;
};
/** token colouring helper for code */
export const K: React.FC<{c: string; children: React.ReactNode}> = ({c, children}) => <span style={{color: c}}>{children}</span>;

/** flowing byte stream (hex boxes) along a row */
export const Bytes: React.FC<{x: number; y: number; w: number; t0: number; t1?: number; color?: string; seed?: number; size?: number}> = ({x, y, w, t0, t1 = 1e9, color = BLUE, seed = 1, size = 54}) => {
  const t = useT(); if (t < t0) return null; const o = ease(t, t0, 0.3) * (1 - ease(t, t1, 0.3));
  const n = Math.ceil(w / (size + 10)) + 2; const off = ((t - t0) * 160) % (size + 10);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: size, overflow: 'hidden', opacity: o, maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)'}}>
    {Array.from({length: n}).map((_, i) => {
      const id = Math.floor((t - t0) * 160 / (size + 10)) - i; const v = ((id * 37 + seed * 101) % 256 + 256) % 256;
      return <div key={i} style={{position: 'absolute', left: (n - 2 - i) * (size + 10) + off - (size + 10), top: 0, width: size, height: size, borderRadius: 10, background: `${color}22`, border: `2px solid ${color}`,
        fontFamily: MONO, fontWeight: 600, fontSize: size * 0.36, color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{v.toString(16).padStart(2, '0').toUpperCase()}</div>;
    })}
  </div>;
};

/** solid arrow */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number}> = ({x1, y1, x2, y2, t0, d = 0.35, color = INK, sw = 6}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const a = Math.atan2(y2 - y1, x2 - x1); const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const hs = 20;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    {k > 0.9 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)} Z`} fill={color} stroke={color} strokeWidth={sw / 2} strokeLinejoin="round" />}
  </svg>;
};

/** page heading: mono step label + Sora title (slides up out of a mask) */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number; color?: string}> = ({t0, label, title, size = 80, color = BLUE}) => {
  const t = useT(); const k1 = ease(t, t0, 0.35), k2 = ease(t, t0 + 0.1, 0.45);
  return <div style={{position: 'absolute', left: 90, top: 140, right: 60}}>
    <div style={{fontFamily: MONO, fontWeight: 600, fontSize: 28, color, letterSpacing: 2, opacity: k1, transform: `translateX(${(1 - k1) * -20}px)`}}>{label}</div>
    <div style={{overflow: 'hidden', marginTop: 4}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: INK, lineHeight: 1.15, whiteSpace: 'nowrap', letterSpacing: -1, transform: `translateY(${(1 - k2) * 110}%)`}}>{title}</div>
    </div>
  </div>;
};

/** small cycle tracker: dots + labels; active step glows */
const Tracker: React.FC<{steps: string[]; active: number | 'all'}> = ({steps, active}) => {
  const t = useT();
  return <div style={{position: 'absolute', left: 70, right: 70, top: 1500, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}>
    <div style={{position: 'absolute', left: 40, right: 40, top: 15, height: 4, background: LINE, borderRadius: 2}} />
    {steps.map((s, i) => {
      const on = active === 'all' || i === active; const done = active !== 'all' && i < active;
      const pulse = on ? 1 + 0.12 * Math.sin(t * 6) : 1;
      return <div key={s} style={{position: 'relative', width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{width: 34, height: 34, borderRadius: 17, background: on ? BLUE : done ? '#9BB5F2' : CARD, border: `4px solid ${on || done ? BLUE : LINE}`, transform: `scale(${pulse})`, boxSizing: 'border-box'}} />
        <div style={{fontFamily: MONO, fontWeight: 600, fontSize: 19, color: on ? BLUE : SUB, whiteSpace: 'nowrap'}}>{s}</div>
      </div>;
    })}
  </div>;
};

// ------------------------------------------------------------------ frame
const Lab: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${DOT} 2.2px, transparent 2.6px)`, backgroundSize: '36px 36px', backgroundPosition: '18px 18px', opacity: 0.8}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 50% 40%, rgba(255,255,255,.75), transparent 75%)'}} />
  </AbsoluteFill>
);

const pageAmt = (t: number, cfg: Config) => {
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.out(Easing.cubic)(clamp((t - c.a) / 0.32)); const kout = Easing.in(Easing.cubic)(clamp((t - (c.b - 0.26)) / 0.26));
    return kin * (1 - kout);
  }
  return 0;
};

const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1620 : 1470, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 54, lineHeight: 1.4, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        const base = onPage ? (w.k ? BLUE : INK) : (w.k ? '#FFD166' : '#FFFFFF');
        return <span key={j} style={{display: 'inline-block', margin: '0 4px', padding: '2px 12px', borderRadius: 14, opacity: shown ? 1 : (onPage ? 0.3 : 0.45), transform: `translateY(${(1 - p) * 8}px) scale(${active ? 1.04 : 1})`,
          color: active ? '#FFFFFF' : base, background: active ? BLUE : 'transparent',
          textShadow: active || onPage ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 16px rgba(0,0,0,.95), 0 0 30px rgba(0,0,0,.6)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = pageAmt(t, cfg);
  const R = Math.hypot(W, H) * 1.05 * k;
  const st = cfg.stepAt ? cfg.stepAt(t) : null;
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} />
    {k > 0.001 && <AbsoluteFill style={{clipPath: k < 0.999 ? `circle(${R}px at 100% 100%)` : undefined}}>
      <Lab />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.16, 0.16)}}><El /></AbsoluteFill>;
      })}
      {cfg.steps && st !== null && <Tracker steps={cfg.steps} active={st} />}
    </AbsoluteFill>}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} onPage={k > 0.5} />
  </AbsoluteFill>;
};
