// Theme: ORANGE BOARD. Hard cuts between the speaker (full screen, real background, untouched) and full-screen
// whiteboard pages: warm white board with an orange dot grid, clean white cards with soft shadows, connectors with a
// running light pulse, an LLM token stream, light code panels and Manrope type with Fira Code for code. No purple.
//   talk - the camera shot full screen; only captions on top (no banners, no plates)
//   page - the page comes into focus: it fades in from a heavy blur and a slight zoom, and blurs away at the end
// Captions: Manrope 800; the spoken word sits on an orange pill. Note: WHITE = main ink colour, INK = board white.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/600.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

// on the whiteboard: WHITE is the main ink colour and INK is the board colour (kept for API compatibility)
export const INK = '#FFFFFF', WHITE = '#1F1D24', MUTED = '#6E6872', DIM = '#BDB6BE', GLASS = '#FFFFFF', EDGE = '#EEDFD6', BOARD = '#FFFDFB', DOTC = '#F3B08F';
export const CORAL = '#E8622F', BLUE = '#3D5AFE', MINT = '#0F9F74', AMBER = '#D98A00', RED = '#E5484D', CODEBG = '#FFF7F1';
export const SANS = 'Manrope', MONO = 'Fira Code';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});

export type Config = {cuts: {a: number; b: number; m: 'talk' | 'page'}[]; overlays?: React.FC[]};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const Logo: React.FC<{src: string; h?: number; w?: number; style?: React.CSSProperties}> = ({src, h, w, style}) => <Img src={staticFile(src)} style={{height: h, width: w, objectFit: 'contain', display: 'block', ...style}} />;
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.4, dy = 22, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, filter: `blur(${(1 - k) * 8}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = WHITE, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);

/** frosted glass card */
export const Glass: React.FC<{x: number; y: number; w: number; h?: number; t0: number; children?: React.ReactNode; tint?: string; pad?: number; style?: React.CSSProperties}> = ({x, y, w, h, t0, children, tint, pad = 28, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`, opacity: clamp(p * 1.5),
    background: tint ? `linear-gradient(160deg, ${tint}12, #FFFFFF 70%)` : '#FFFFFF',
    border: `2px solid ${tint ? `${tint}66` : EDGE}`, borderRadius: 32,
    boxShadow: `0 18px 40px rgba(120,60,20,.10), 0 2px 0 rgba(255,255,255,1) inset`, padding: pad, boxSizing: 'border-box', ...style}}>{children}</div>;
};

/** pill */
export const Tag: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; size?: number; icon?: string}> = ({children, color = CORAL, solid, size = 28, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 999, background: solid ? color : `${color}22`, border: `1.5px solid ${color}`, color: solid ? INK : color, fontFamily: SANS, fontWeight: 800, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? INK : color} />}{children}
  </div>
);

/** glass node: icon or logo + label + sub */
export const Node: React.FC<{x: number; y: number; w?: number; h?: number; t0: number; icon?: string; logo?: string; label: string; sub?: string; tint?: string; on?: boolean}> = ({x, y, w = 280, h = 280, t0, icon, logo, label, sub, tint = BLUE, on}) => (
  <Glass x={x} y={y} w={w} h={h} t0={t0} tint={on === false ? undefined : tint} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: on === false ? 0.5 : undefined}}>
    {logo ? <Logo src={logo} h={w * 0.36} style={{borderRadius: 22}} /> : <Icon name={icon!} size={w * 0.34} color={tint} />}
    <Txt size={38} w={800}>{label}</Txt>
    {sub && <Txt size={24} w={600} color={MUTED}>{sub}</Txt>}
  </Glass>
);

/** glowing connector with a light pulse running along it while `flow` is active */
export const Link: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; color?: string; flow?: [number, number]; head?: boolean; curve?: number; sw?: number}> = ({x1, y1, x2, y2, t0, color = BLUE, flow, head = true, curve = 0, sw = 5}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.5);
  const mx = (x1 + x2) / 2 + curve * (y2 - y1) / Math.hypot(x2 - x1, y2 - y1 || 1), my = (y1 + y2) / 2 - curve * (x2 - x1) / Math.hypot(x2 - x1, y2 - y1 || 1);
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`; const a = Math.atan2(y2 - my, x2 - mx); const hs = 20;
  const on = flow && t >= flow[0] && t <= flow[1]; const p = on ? ((t - flow![0]) * 0.9) % 1 : 0;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    
    <path d={d} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
    {on && <path d={d} stroke={color} strokeWidth={sw + 4} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="0.08 0.92" strokeDashoffset={-p} style={{filter: `drop-shadow(0 0 10px ${color})`}} />}
    {head && k > 0.95 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
  </svg>;
};

/** code / output panel */
export type CodeLine = {at: number; text: React.ReactNode; hl?: [number, number]; color?: string};
export const Code: React.FC<{x: number; y: number; w: number; t0: number; title?: string; lines: CodeLine[]; size?: number; tint?: string}> = ({x, y, w, t0, title, lines, size = 32, tint = BLUE}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp(p * 1.5), background: CODEBG, border: `2px solid ${CORAL}55`, borderRadius: 26,
    boxShadow: '0 18px 40px rgba(120,60,20,.10)', overflow: 'hidden'}}>
    {title && <div style={{padding: '14px 24px', borderBottom: `2px solid ${CORAL}33`, fontFamily: MONO, fontSize: 22, color: MUTED}}>{title}</div>}
    <div style={{padding: '16px 26px 20px'}}>
      {lines.map((l, i) => {
        if (t < l.at) return <div key={i} style={{height: size * 1.55}} />;
        const k = ease(t, l.at, 0.4); const hl = l.hl && t >= l.hl[0] && t <= l.hl[1];
        return <div key={i} style={{fontFamily: MONO, fontSize: size, lineHeight: 1.55, color: l.color || WHITE, whiteSpace: 'pre', clipPath: `inset(-10% ${(1 - k) * 100}% -10% 0)`,
          background: hl ? `${AMBER}26` : 'transparent', borderRadius: 8, margin: '0 -10px', padding: '0 10px'}}>{l.text}</div>;
      })}
    </div>
  </div>;
};
export const K: React.FC<{c: string; children: React.ReactNode}> = ({c, children}) => <span style={{color: c}}>{children}</span>;

/** chips moving between two points */
export const Mover: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; children: React.ReactNode; hold?: boolean}> = ({x1, y1, x2, y2, t0, d = 0.8, children, hold = true}) => {
  const t = useT(); if (t < t0) return null; const k = Easing.inOut(Easing.cubic)(clamp((t - t0) / d));
  if (!hold && t > t0 + d + 0.3) return null; const o = hold ? ease(t, t0, 0.2) : 1 - clamp((t - t0 - d) / 0.3);
  return <div style={{position: 'absolute', left: lerp(x1, x2, k), top: lerp(y1, y2, k), transform: 'translate(-50%,-50%)', opacity: o}}>{children}</div>;
};

/** tokens appearing one by one (an LLM writing) */
export const Tokens: React.FC<{t0: number; tokens: string[]; rate?: number; size?: number; color?: string; cursor?: boolean}> = ({t0, tokens, rate = 6, size = 34, color = WHITE, cursor = true}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const n = Math.min(tokens.length, Math.floor((t - t0) * rate) + 1);
  return <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}>
    {tokens.slice(0, n).map((tk, i) => <span key={i} style={{fontFamily: MONO, fontSize: size, color, padding: '2px 8px', borderRadius: 8, background: i === n - 1 && n < tokens.length ? `${CORAL}33` : 'rgba(0,0,0,0.05)'}}>{tk}</span>)}
    {cursor && n < tokens.length && <span style={{width: 4, height: size, background: CORAL, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2}} />}
  </div>;
};

/** page heading: small coral label + big Manrope title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number; color?: string}> = ({t0, label, title, size = 82, color = CORAL}) => {
  const t = useT(); const k1 = ease(t, t0, 0.4), k2 = ease(t, t0 + 0.1, 0.5);
  return <div style={{position: 'absolute', left: 90, top: 140, right: 60}}>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color, letterSpacing: 4, opacity: k1}}>{label}</div>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: WHITE, lineHeight: 1.12, whiteSpace: 'nowrap', letterSpacing: -2, marginTop: 6, opacity: k2, filter: `blur(${(1 - k2) * 10}px)`, transform: `translateY(${(1 - k2) * 20}px)`}}>{title}</div>
  </div>;
};

// ------------------------------------------------------------------ frame
const Backdrop: React.FC = () => (
  <AbsoluteFill style={{background: BOARD}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${DOTC} 2.6px, transparent 3px)`, backgroundSize: '36px 36px', backgroundPosition: '18px 18px', opacity: 0.75}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 60% at 50% 40%, rgba(255,255,255,.55), transparent 75%)'}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(232,98,47,.08)'}} />
  </AbsoluteFill>
);

const pageAmt = (t: number, cfg: Config) => {
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.out(Easing.cubic)(clamp((t - c.a) / 0.4)); const kout = Easing.in(Easing.cubic)(clamp((t - (c.b - 0.3)) / 0.3));
    return kin * (1 - kout);
  }
  return 0;
};

const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1600 : 1460, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.38, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 4px', padding: '0 12px', borderRadius: 16, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px) scale(${active ? 1.04 : 1})`,
          color: active ? '#FFFFFF' : onPage ? (w.k ? CORAL : WHITE) : (w.k ? '#FFD3C4' : '#FFFFFF'), background: active ? CORAL : 'transparent',
          textShadow: active || onPage ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 18px rgba(0,0,0,.9)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = pageAmt(t, cfg);
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} />
    {k > 0.001 && <AbsoluteFill style={{opacity: k, filter: k < 0.999 ? `blur(${(1 - k) * 36}px)` : undefined, transform: `scale(${1.06 - 0.06 * k})`}}>
      <Backdrop />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.18, 0.18)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} onPage={k > 0.5} />
  </AbsoluteFill>;
};
