// Theme: AURORA GLASS. Deep night canvas with a slow blue/aqua aurora bloom rising from the bottom and a faint dot grid.
// Frosted glass panels (soft white fill, hairline edge, top highlight). Aqua = the concept, red = the wrong way,
// green = the payoff, amber = numbers/examples. Hard cuts between the speaker (full screen, real background) and
// full-screen pages; every page cut lands with a focus pull (blur to sharp) and a quick aurora swell.
// Captions follow herk-edit-kit house style: 1 to 3 words, Montserrat ExtraBold caps in one dark box with a thin
// light edge, whole-chunk colour (aqua / red / green), Abril Fatface accent on soft words.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/abril-fatface/400.css';
import {FPS, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const BG = '#060A12', AQUA = '#38BDF8', BLUE = '#3B82F6', RED = '#FF5A6A', GREEN = '#4ADE80', AMBER = '#FBBF24',
  WHITE = '#F1F5F9', MUTED = '#94A3B8', DIM = '#5B6B82', REDIS = '#FF4438';
export const SANS = 'Space Grotesk', MONO = 'JetBrains Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});
export const GLASS: React.CSSProperties = {background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04))', border: '1.5px solid rgba(255,255,255,.14)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.22), 0 24px 60px rgba(0,0,0,.45)', borderRadius: 30};

export type Cut = {a: number; b: number; m: 'talk' | 'page'; z?: number};
export type Cap = {a: number; b: number; t: string; c: string; s: boolean};
export type Config = {cuts: Cut[]; overlays?: React.FC[]};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 18, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = WHITE, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.22, ...style}}>{children}</div>
);
export const Panel: React.FC<{x: number; y: number; w: number; h?: number; t0: number; children?: React.ReactNode; glow?: string; style?: React.CSSProperties}> = ({x, y, w, h, t0, children, glow, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.45);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: 30, boxSizing: 'border-box', ...GLASS,
    ...(glow ? {border: `2px solid ${glow}`, boxShadow: `inset 0 1.5px 0 rgba(255,255,255,.22), 0 0 50px ${glow}55`} : {}),
    opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.97 + 0.03 * k})`, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined, ...style}}>{children}</div>;
};
export const Tag: React.FC<{children: React.ReactNode; color?: string; size?: number; icon?: string; solid?: boolean}> = ({children, color = AQUA, size = 28, icon, solid}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 999, background: solid ? color : `${color}1F`, border: `2px solid ${color}`, color: solid ? BG : color,
    fontFamily: SANS, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: `0 0 26px ${color}33`}}>
    {icon && <Icon name={icon} size={size * 1.1} color={solid ? BG : color} />}{children}</div>
);
export const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 30, color = WHITE, children, style}) =>
  <Txt size={size} font={MONO} w={500} color={color} style={style}>{children}</Txt>;
export const Note: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) =>
  <At x={x} y={y}><Txt size={21} font={MONO} w={500} color={DIM}>{children}</Txt></At>;
export const Bar: React.FC<{v: number; w: number; h?: number; color?: string; grad?: string}> = ({v, w, h = 30, color = AQUA, grad}) => (
  <div style={{width: w, height: h, borderRadius: h / 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}>
    <div style={{height: h, width: `${clamp(v) * 100}%`, background: grad || color, borderRadius: h / 2, boxShadow: `0 0 20px ${color}88`}} /></div>
);
export const Bubble: React.FC<{children: React.ReactNode; alt?: boolean; size?: number; style?: React.CSSProperties}> = ({children, alt, size = 40, style}) => (
  <div style={{display: 'inline-block', padding: '22px 32px', borderRadius: '30px 30px 30px 8px', background: alt ? 'rgba(59,130,246,.22)' : 'rgba(255,255,255,.10)',
    border: `1.5px solid ${alt ? BLUE + '88' : 'rgba(255,255,255,.16)'}`, fontFamily: SANS, fontWeight: 700, fontSize: size, color: WHITE, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; dash?: boolean; packets?: number[]; pc?: string}> = ({x1, y1, x2, y2, t0, d = 0.4, color = DIM, sw = 5, dash, packets = [], pc = AQUA}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const a = Math.atan2(y2 - y1, x2 - x1); const hs = 16;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? '10 10' : undefined} />
    {k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
    {packets.map((p0, i) => { const u = (t - p0) / 0.55; if (u < 0 || u > 1) return null; const e = Easing.inOut(Easing.quad)(u);
      return <circle key={i} cx={lerp(x1, x2, e)} cy={lerp(y1, y2, e)} r={12} fill={pc} stroke={BG} strokeWidth={3} style={{filter: `drop-shadow(0 0 8px ${pc})`}} />; })}
  </svg>;
};
/** page heading: aqua dot + mono label, one-line Space Grotesk title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number}> = ({t0, label, title, size = 68}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.08, 0.45);
  return <div style={{position: 'absolute', left: 70, top: 160, right: 40}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: k1}}><div style={{width: 14, height: 14, borderRadius: 7, background: AQUA, boxShadow: `0 0 18px ${AQUA}`}} />
      <Txt size={26} font={MONO} w={700} color={AQUA} style={{letterSpacing: 3}}>{label}</Txt></div>
    <div style={{overflow: 'hidden', marginTop: 12}}><div style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: WHITE, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: -1.5,
      transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div></div>
  </div>;
};

// ------------------------------------------------------------------ frame
export const Canvas: React.FC = () => {
  const t = useT();
  return <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 42% at ${50 + 8 * Math.sin(t * 0.25)}% 100%, ${BLUE}66 0%, transparent 70%), radial-gradient(ellipse 60% 30% at ${40 + 10 * Math.cos(t * 0.2)}% 92%, ${AQUA}44 0%, transparent 70%), radial-gradient(ellipse 70% 25% at 50% 0%, ${BLUE}22 0%, transparent 70%)`}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1.6px, transparent 1.6px)', backgroundSize: '36px 36px', backgroundPosition: `0 ${-t * 6}px`}} />
  </AbsoluteFill>;
};

const Captions: React.FC<{caps: Cap[]; top: number}> = ({caps, top}) => {
  const t = useT(); const c = caps.find(x => t >= x.a && t < x.b); if (!c) return null;
  const col = c.c === 't' ? AQUA : c.c === 'r' ? RED : c.c === 'g' ? GREEN : '#fff';
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{transform: 'translateY(-50%)', maxWidth: 940, textAlign: 'center', background: 'rgba(5,8,14,.9)', border: '2px solid rgba(241,245,249,.22)', borderRadius: 18, padding: c.s ? '6px 28px 12px' : '10px 28px 13px',
      fontFamily: c.s ? 'Abril Fatface' : 'Montserrat', fontWeight: c.s ? 400 : 800, fontSize: c.s ? 66 : 62, lineHeight: 1.08, textTransform: c.s ? 'none' : 'uppercase', letterSpacing: c.s ? 0 : -0.5, color: col}}>{c.t}</div>
  </div>;
};

export const Frame: React.FC<{data: any; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const c = cfg.cuts.find(x => t >= x.a && t < x.b); const onPage = !!c && c.m === 'page';
  const k = onPage ? ease(t, c!.a, 0.35) : 1;
  const z = !onPage && c ? (c.z || 1) * (1 + 0.035 * clamp((t - c.a) / Math.max(1, c.b - c.a))) : 1;
  return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 700px'}}><OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} /></AbsoluteFill>
    {onPage && <AbsoluteFill>
      <Canvas />
      <AbsoluteFill style={{filter: k < 1 ? `blur(${(1 - k) * 14}px)` : undefined, transform: `scale(${1.04 - 0.04 * k})`}}>
        {scenes.map((s, i) => {
          if (t < s.a - 0.1 || t > s.b + 0.05) return null;
          const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.14, 0.14)}}><El /></AbsoluteFill>;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 50% at 50% 100%, ${AQUA}55, transparent 70%)`, opacity: (1 - k) * 0.9, pointerEvents: 'none'}} />
    </AbsoluteFill>}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions caps={data.caps} top={onPage ? 1640 : (c && c.z ? 1470 : 1430)} />
  </AbsoluteFill>;
};
