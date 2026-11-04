// Theme: NIGHT BLUEPRINT. Hard cuts between the speaker (full screen, real background, untouched) and full-screen
// black pages with a fine dot grid where everything is drawn like a blueprint: thin white and cyan outlines with
// corner ticks, dimension-style labels, lines that draw themselves, gauges and small charts. Two accent families:
// cyan = functional (what it does), amber = non-functional (how well it does it). Outfit + Geist Mono. No purple.
//   talk - the camera shot full screen; only captions on top (no banners, no plates)
//   page - a bright scan line sweeps down and reveals the page; at the end it sweeps back up
// Captions: Outfit 800; the spoken word sits on a cyan pill.
// cfg.speaker: talk video with the background replaced by the dotted grid. Build it with reel-studio cutout (matte + speaker.webm),
// then flatten it over a still of the grid with ffmpeg (Remotion's compositor drops VP9 alpha here, so pre-compose).
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/800.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/600.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const BG = '#060708', DOT = '#22262C', LINE = '#E9EEF2', FAINT = '#3A4048', MUTED = '#8C95A1', WHITE = '#F2F5F7';
export const CYAN = '#38D6F5', AMBER = '#F7B32B', RED = '#FF5A5F', GREEN = '#43D19E';
export const SANS = 'Outfit', MONO = 'Geist Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 15, stiffness: 200, mass: 0.7});

export type Config = {cuts: {a: number; b: number; m: 'talk' | 'page'}[]; overlays?: React.FC[]; speaker?: string};  // speaker: optional pre-composited talk video (cut-out speaker over the dotted grid), used instead of src.mp4

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const Logo: React.FC<{src: string; h?: number; style?: React.CSSProperties}> = ({src, h, style}) => <Img src={staticFile(src)} style={{height: h, display: 'block', ...style}} />;
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 18, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = WHITE, font = SANS, w = 600, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);

/** blueprint box: outline draws on, corner ticks, optional dimension label above */
export const BBox: React.FC<{x: number; y: number; w: number; h: number; t0: number; color?: string; label?: string; children?: React.ReactNode; d?: number; fill?: boolean; style?: React.CSSProperties}> = ({x, y, w, h, t0, color = LINE, label, children, d = 0.6, fill, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d); const kc = ease(t, t0 + d * 0.6, 0.35);
  const tick = 18;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
    <svg width={w + 40} height={h + 40} style={{position: 'absolute', left: -20, top: -20, overflow: 'visible'}}>
      <rect x={20} y={20} width={w} height={h} rx={14} fill={fill ? `${color}10` : 'rgba(6,7,8,.65)'} stroke={color} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
      {[[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].map(([cx, cy, sx, sy], i) => <path key={i} d={`M ${20 + cx - sx * 10} ${20 + cy} h ${-sx * tick} M ${20 + cx} ${20 + cy - sy * 10} v ${-sy * tick}`} stroke={color} strokeWidth={2} opacity={k * 0.6} />)}
    </svg>
    {label && <div style={{position: 'absolute', left: 0, top: -44, fontFamily: MONO, fontWeight: 600, fontSize: 22, color, letterSpacing: 2, opacity: k}}>{label}</div>}
    <div style={{position: 'absolute', inset: 0, opacity: kc, padding: 24, boxSizing: 'border-box', ...style}}>{children}</div>
  </div>;
};

/** connector line with arrow head that draws on; flowing dash while `flow` */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; color?: string; d?: number; head?: boolean; flow?: [number, number]; sw?: number}> = ({x1, y1, x2, y2, t0, color = LINE, d = 0.4, head = true, flow, sw = 3}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const a = Math.atan2(y2 - y1, x2 - x1); const hs = 16;
  const on = flow && t >= flow[0] && t <= flow[1];
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={on ? '10 10' : undefined} strokeDashoffset={on ? -t * 90 : 0} />
    {head && k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.45)} ${y2 - hs * Math.sin(a - 0.45)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.45)} ${y2 - hs * Math.sin(a + 0.45)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
  </svg>;
};

/** outlined pill */
export const Tag: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; size?: number; icon?: string}> = ({children, color = CYAN, solid, size = 28, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: solid ? color : 'transparent', border: `2px solid ${color}`, color: solid ? BG : color, fontFamily: MONO, fontWeight: 600, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? BG : color} />}{children}
  </div>
);

/** checklist row: icon + label, ticks in at `ok` */
export const Item: React.FC<{t0: number; icon: string; text: string; color?: string; size?: number; ok?: number}> = ({t0, icon, text, color = CYAN, size = 38, ok}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.35);
  return <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: k, transform: `translateX(${(1 - k) * -24}px)`, margin: '14px 0'}}>
    <div style={{width: size * 1.6, height: size * 1.6, borderRadius: 12, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={icon} size={size} color={color} /></div>
    <Txt size={size} w={600}>{text}</Txt>
    {ok !== undefined && t >= ok && <PopIn t0={ok}><Icon name="check-circle" size={size} color={GREEN} /></PopIn>}
  </div>;
};

/** semicircle gauge 0..1 with value text */
export const Gauge: React.FC<{cx: number; cy: number; r: number; t0: number; to: number; color?: string; label: string; value: string}> = ({cx, cy, r, t0, to, color = AMBER, label, value}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 1.0) * to;
  const arc = (v: number) => { const a = Math.PI * (1 - v); return `${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)}`; };
  return <>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={`M ${arc(0)} A ${r} ${r} 0 0 1 ${arc(1)}`} stroke={FAINT} strokeWidth={14} fill="none" strokeLinecap="round" />
      {k > 0.001 && <path d={`M ${arc(0)} A ${r} ${r} 0 0 1 ${arc(k)}`} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />}
    </svg>
    <div style={{position: 'absolute', left: cx - r, width: r * 2, top: cy - r * 0.55, textAlign: 'center'}}>
      <Txt size={r * 0.42} w={800} color={color}>{value}</Txt>
      <Txt size={22} w={600} font={MONO} color={MUTED}>{label}</Txt>
    </div>
  </>;
};

/** page heading: mono label + Outfit title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number; color?: string}> = ({t0, label, title, size = 84, color = CYAN}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.1, 0.45);
  return <div style={{position: 'absolute', left: 90, top: 140, right: 60}}>
    <div style={{fontFamily: MONO, fontWeight: 600, fontSize: 26, color, letterSpacing: 3, opacity: k1}}>{label}</div>
    <div style={{overflow: 'hidden', marginTop: 6}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: WHITE, lineHeight: 1.12, whiteSpace: 'nowrap', letterSpacing: -1, transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div>
    </div>
  </div>;
};

// ------------------------------------------------------------------ frame
const Grid: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${DOT} 2px, transparent 2.4px)`, backgroundSize: '30px 30px', backgroundPosition: '15px 15px'}} />
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${FAINT}55 1px, transparent 1px), linear-gradient(90deg, ${FAINT}55 1px, transparent 1px)`, backgroundSize: '150px 150px', backgroundPosition: '15px 15px', opacity: 0.35}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 240px rgba(0,0,0,.95)'}} />
  </AbsoluteFill>
);

const pageAmt = (t: number, cfg: Config) => {
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.inOut(Easing.cubic)(clamp((t - c.a) / 0.4)); const kout = Easing.inOut(Easing.cubic)(clamp((t - (c.b - 0.32)) / 0.32));
    return kin * (1 - kout);
  }
  return 0;
};

const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1600 : 1470, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.36, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 4px', padding: '0 12px', borderRadius: 12, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px)`,
          color: active ? BG : w.k ? '#9BE9FA' : WHITE, background: active ? CYAN : 'transparent',
          textShadow: active ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 16px rgba(0,0,0,.95)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = pageAmt(t, cfg); const yLine = k * H;
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile(cfg.speaker || 'src.mp4')} muted style={{width: W, height: H}} />
    {k > 0.001 && <AbsoluteFill style={{clipPath: k < 0.999 ? `inset(0 0 ${H - yLine}px 0)` : undefined}}>
      <Grid />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.16, 0.16)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {k > 0.001 && k < 0.999 && <div style={{position: 'absolute', left: 0, top: yLine - 3, width: W, height: 6, background: CYAN, boxShadow: `0 0 30px ${CYAN}, 0 0 80px ${CYAN}`}} />}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} onPage={k > 0.5} />
  </AbsoluteFill>;
};
