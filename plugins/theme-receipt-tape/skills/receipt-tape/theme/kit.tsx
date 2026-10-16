// Theme: RECEIPT TAPE. Hard cuts between the speaker (full screen, real background, untouched) and full-screen
// "desk" pages: a dark charcoal desk under a warm spotlight where thermal receipt slips print out line by line,
// manila data-file cards, rubber stamps, barcodes and dashed arrows. Mono type (Space Mono) + Archivo Black headings.
//   talk - the camera shot full screen; only captions on top (no banners, no plates)
//   page - the desk feeds in from the top like paper out of a printer (zigzag torn edge), and feeds back out at the end
// Captions: Archivo 800; the spoken word sits on a small receipt-paper chip.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/archivo/600.css';
import '@fontsource/archivo/800.css';
import '@fontsource/archivo-black/400.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const DESK = '#1D1C1A', DESK2 = '#2A2825', PAPER = '#F6F3EA', PAPER_SH = '#DCD6C6', MANILA = '#E8D6AE', MANILA_D = '#C9B184';
export const INK = '#1A1A1A', FADED = '#7D786C', RED = '#D7262E', TEAL = '#0E8C7F', AMBER = '#E8A33B', WHITE = '#F4F1EA', MUTED = '#9C978C';
export const MONO = 'Space Mono', SANS = 'Archivo', DISPLAY = 'Archivo Black';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 13, stiffness: 210, mass: 0.7});

export type Config = {cuts: {a: number; b: number; m: 'talk' | 'page'}[]; overlays?: React.FC[]};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = INK, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const Logo: React.FC<{src: string; h?: number; w?: number; style?: React.CSSProperties}> = ({src, h, w, style}) => <Img src={staticFile(src)} style={{height: h, width: w, objectFit: 'contain', display: 'block', ...style}} />;
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;

/** fade + rise */
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 24, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
/** pops in with a spring */
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};

/** text that types itself (receipt printer speed) */
export const Mono: React.FC<{t0: number; text: string; cps?: number; size?: number; color?: string; bold?: boolean; style?: React.CSSProperties}> = ({t0, text, cps = 40, size = 34, color = INK, bold, style}) => {
  const t = useT(); if (t < t0) return null; const n = Math.min(text.length, Math.floor((t - t0) * cps) + 1);
  return <span style={{fontFamily: MONO, fontWeight: bold ? 700 : 400, fontSize: size, color, whiteSpace: 'pre', ...style}}>{text.slice(0, n)}</span>;
};

/** receipt row: left label, dot leaders, right value (types in) */
export const Row: React.FC<{t0: number; left: string; right?: string; size?: number; color?: string; rcolor?: string; bold?: boolean; cps?: number}> = ({t0, left, right = '', size = 32, color = INK, rcolor, bold, cps = 45}) => {
  const t = useT(); if (t < t0) return <div style={{height: size * 1.5}} />;
  const tr = t0 + left.length / cps + 0.12;
  return <div style={{display: 'flex', alignItems: 'baseline', height: size * 1.5, fontFamily: MONO, fontSize: size, color, fontWeight: bold ? 700 : 400, whiteSpace: 'pre'}}>
    <Mono t0={t0} text={left} cps={cps} size={size} color={color} bold={bold} />
    <div style={{flex: 1, overflow: 'hidden', margin: '0 10px', color: FADED, opacity: right && t > tr - 0.1 ? 1 : 0}}>{'.'.repeat(80)}</div>
    {right ? <Mono t0={tr} text={right} cps={cps} size={size} color={rcolor || color} bold /> : null}
  </div>;
};

export const zig = (w: number, h: number, top: boolean, bot: boolean, z = 14) => {
  const pts: string[] = []; const n = Math.round(w / (z * 2));
  if (top) for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${i % 2 ? 0 : z}px`); else pts.push('0% 0px', '100% 0px');
  if (bot) for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% calc(100% - ${i % 2 ? 0 : z}px)`); else pts.push('100% 100%', '0% 100%');
  return `polygon(${pts.join(',')})`;
};
/** thermal receipt slip; prints out downward from its top edge over d seconds */
export const Slip: React.FC<{x: number; y: number; w: number; h: number; t0: number; d?: number; children?: React.ReactNode; pad?: number; rot?: number; top?: boolean}> = ({x, y, w, h, t0, d = 0.5, children, pad = 34, rot = 0, top = true}) => {
  const t = useT(); if (t < t0) return null; const k = Easing.out(Easing.quad)(clamp((t - t0) / d));
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.45))', clipPath: `inset(-40px -40px ${(1 - k) * 100}% -40px)`}}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${PAPER} 0%, #FBF9F3 50%, ${PAPER} 100%)`, clipPath: zig(w, h, top, true)}} />
    <div style={{position: 'absolute', inset: 0, padding: `${pad + (top ? 10 : 0)}px ${pad}px ${pad + 10}px`, boxSizing: 'border-box'}}>{children}</div>
  </div>;
};
/** dashed divider like on a receipt */
export const Rule: React.FC<{char?: string; color?: string; size?: number}> = ({char = '-', color = FADED, size = 30}) => <div style={{fontFamily: MONO, fontSize: size, color, whiteSpace: 'nowrap', overflow: 'hidden', lineHeight: 1.2}}>{char.repeat(80)}</div>;

/** manila data-file card with a tab label */
export const Card: React.FC<{x: number; y: number; w: number; h: number; t0: number; label: string; icon?: string; children?: React.ReactNode; tint?: string}> = ({x, y, w, h, t0, label, icon = 'file-text', children, tint = MANILA}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 60}px) rotate(${(1 - p) * -3}deg)`, opacity: clamp(p * 1.5)}}>
    <div style={{position: 'absolute', left: 0, top: -46, height: 50, padding: '0 22px', background: tint, borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: INK, whiteSpace: 'nowrap'}}>
      <Icon name={icon} size={30} color={INK} />{label}
    </div>
    <div style={{position: 'absolute', inset: 0, background: tint, borderRadius: '0 16px 16px 16px', boxShadow: `0 18px 30px rgba(0,0,0,.45), inset 0 -6px 0 ${MANILA_D}`, padding: 26, boxSizing: 'border-box'}}>{children}</div>
  </div>;
};

/** verdict line: icon + bold text between two receipt-style double rules that draw outward from the centre (no box, no tilt) */
export const Stamp: React.FC<{x: number; y: number; t0: number; text: string; color?: string; size?: number; rot?: number; icon?: string}> = ({x, y, t0, text, color = RED, size = 64, icon}) => {
  const t = useT(); if (t < t0) return null;
  const kl = ease(t, t0, 0.35); const n = Math.min(text.length, Math.floor((t - t0 - 0.12) * 38) + 1); const ki = ease(t, t0 + 0.05, 0.3);
  const ic = icon || (color === TEAL ? 'check-circle' : 'x-circle');
  const rule = <div style={{width: `${kl * 100}%`, height: 10, borderTop: `3px solid ${color}`, borderBottom: `3px solid ${color}`, margin: '0 auto'}} />;
  return <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14}}>
    {rule}
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.3, padding: '0 10px'}}>
      <div style={{transform: `scale(${ki})`}}><Icon name={ic} size={size * 1.05} color={color} /></div>
      <span style={{fontFamily: DISPLAY, fontSize: size, color, letterSpacing: 2, whiteSpace: 'pre', lineHeight: 1}}>{text.slice(0, Math.max(0, n)).padEnd(text.length, ' ')}</span>
    </div>
    {rule}
  </div>;
};

/** dashed arrow that draws itself */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; dash?: boolean}> = ({x1, y1, x2, y2, t0, d = 0.45, color = WHITE, sw = 6, dash = true}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const a = Math.atan2(y2 - y1, x2 - x1); const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const hs = 22;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? '2 16' : undefined} />
    {k > 0.9 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
  </svg>;
};

export const Barcode: React.FC<{w?: number; h?: number; seed?: number; color?: string}> = ({w = 360, h = 70, seed = 3, color = INK}) => {
  const bars: number[] = []; let s = seed; for (let i = 0; i < 46; i++) { s = (s * 9301 + 49297) % 233280; bars.push(1 + Math.floor((s / 233280) * 4)); }
  const tot = bars.reduce((a, b) => a + b * 2, 0); let x = 0;
  return <svg width={w} height={h}>{bars.map((b, i) => { const bw = (b / tot) * w; const r = <rect key={i} x={x} y={0} width={bw} height={h} fill={color} />; x += bw * 2; return r; })}</svg>;
};

/** mono pill label on the desk */
export const Chip: React.FC<{children: React.ReactNode; color?: string; fg?: string; size?: number; icon?: string}> = ({children, color = WHITE, fg = INK, size = 28, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 10, background: color, fontFamily: MONO, fontWeight: 700, fontSize: size, color: fg, whiteSpace: 'nowrap', boxShadow: '0 8px 18px rgba(0,0,0,.35)'}}>
    {icon && <Icon name={icon} size={size * 1.2} color={fg} />}{children}
  </div>
);

/** heading on the desk: mono kicker (red, types) + Archivo Black title (rises out of a mask) */
export const Head: React.FC<{t0: number; kicker: string; title: React.ReactNode; size?: number}> = ({t0, kicker, title, size = 80}) => {
  const t = useT(); const k = ease(t, t0 + 0.1, 0.45);
  return <div style={{position: 'absolute', left: 110, top: 140, right: 60}}>
    <Mono t0={t0} text={kicker} size={30} color={RED} bold />
    <div style={{overflow: 'hidden', marginTop: 6}}>
      <div style={{fontFamily: DISPLAY, fontSize: size, color: WHITE, lineHeight: 1.12, whiteSpace: 'nowrap', transform: `translateY(${(1 - k) * 110}%)`}}>{title}</div>
    </div>
  </div>;
};

/** the lights go out (power failure) between a and b; red warning flickers in the dark */
export const Blackout: React.FC<{a: number; b: number; label?: string; sub?: string}> = ({a, b, label = 'POWER FAILURE', sub}) => {
  const t = useT(); if (t < a || t > b + 0.4) return null;
  const fl = (x: number) => (Math.sin(x * 97) > 0.2 ? 1 : 0.3);
  let o = t < a + 0.3 ? 0.55 + 0.4 * fl(t) : 0.93; if (t > b) o = 0.93 * (1 - clamp((t - b) / 0.35)) * (t < b + 0.15 ? fl(t) : 1);
  return <AbsoluteFill style={{background: `rgba(6,6,6,${o})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20}}>
    {t < b && t > a + 0.15 && <>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: fl(t * 0.6) * 0.5 + 0.5}}>
        <Icon name="lightning" size={90} color={RED} />
        <span style={{fontFamily: DISPLAY, fontSize: 80, color: RED, letterSpacing: 2}}>{label}</span>
      </div>
      {sub && <span style={{fontFamily: MONO, fontSize: 36, color: MUTED}}>{sub}</span>}
    </>}
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ frame
const Desk: React.FC = () => (
  <AbsoluteFill style={{background: DESK}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 38%, rgba(255,214,150,.13), transparent 70%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'overlay'}}>
      <filter id="deskN"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0" /></filter>
      <rect width={W} height={H} filter="url(#deskN)" />
    </svg>
    <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,.7)'}} />
  </AbsoluteFill>
);

const pageAmt = (t: number, cfg: Config) => {
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.out(Easing.cubic)(clamp((t - c.a) / 0.3)); const kout = Easing.in(Easing.cubic)(clamp((t - (c.b - 0.24)) / 0.24));
    return kin * (1 - kout);
  }
  return 0;
};

const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1610 : 1480, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.35, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{position: 'relative', display: 'inline-block', margin: '0 5px', padding: '0 8px', opacity: shown ? 1 : 0.38, transform: `translateY(${(1 - p) * 8}px)`,
          color: active ? INK : w.k ? '#FFD27A' : WHITE, background: active ? PAPER : 'transparent', borderRadius: 6,
          textShadow: active ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 18px rgba(0,0,0,.9)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = pageAmt(t, cfg);
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} />
    {k > 0.001 && <AbsoluteFill style={{transform: `translateY(${-(1 - k) * 1960}px)`, clipPath: k < 0.999 ? zig(W, H, false, true, 22) : undefined}}>
      <Desk />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.16, 0.16)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} onPage={k > 0.5} />
  </AbsoluteFill>;
};
