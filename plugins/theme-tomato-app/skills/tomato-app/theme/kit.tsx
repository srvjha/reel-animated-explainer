// Theme: TOMATO APP. Warm food-delivery app look. Opens with the speaker full screen, then (cfg.splitAt) the camera
// slides down into the lower panel while a cream explainer panel drops in from the top (rounded bottom corners).
// The speaker keeps his real background. The top panel holds diagrams or stock clips (cfg.clips play inside the panel).
// Parts: Phone mock (notch, any screen inside), state Chips, service Nodes, Wire with travelling packets,
// app Cards, red Tags, Toast notification. Outfit (rounded geometric) + DM Mono. Tomato red #E23744 on cream.
// Captions: Outfit 800 white with shadow; the spoken word sits on a red pill.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/dm-mono/500.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const RED = '#E23744', RED2 = '#C81E36', CREAM = '#FFF6F1', PEACH = '#FFE3DC', INK = '#1C1C1C', GREY = '#6F6A68', SOFT = '#B9B1AE', LINE = '#F0D9D2', WHITE = '#FFFFFF', GREEN = '#24963F';
export const SANS = 'Outfit', MONO = 'DM Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});

export type PanelClip = {a: number; b: number; src: string; from?: number};
export type Config = {split: number; camDy: number; splitAt: number; clips?: PanelClip[]; overlays?: React.FC[]; screenOverlays?: React.FC[]; capSkip?: number};  // overlays draw inside the panel, screenOverlays over the whole frame

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = INK, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 18, out, children, style}) => {
  const t = useT(); const k = ease(t, t0, d) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = INK, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);
export const Card: React.FC<{x: number; y: number; w: number; h?: number; t0: number; out?: number; children: React.ReactNode; hot?: boolean; style?: React.CSSProperties}> = ({x, y, w, h, t0, out, children, hot, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, background: hot ? RED : WHITE, color: hot ? WHITE : INK,
    boxShadow: '0 14px 34px rgba(140,40,30,.14), 0 2px 6px rgba(140,40,30,.08)', padding: 24, boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * 24}px)`, ...style}}>{children}</div>;
};
export const Tag: React.FC<{children: React.ReactNode; solid?: boolean; size?: number; icon?: string; color?: string}> = ({children, solid = true, size = 26, icon, color = RED}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: solid ? color : WHITE, border: `2.5px solid ${color}`, color: solid ? WHITE : color, fontFamily: SANS, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? WHITE : color} />}{children}
  </div>
);
/** state chip: done = red filled, now = red outline pulsing, todo = grey, bad = struck through */
export const Chip: React.FC<{label: string; state: 'done' | 'now' | 'todo' | 'bad'; size?: number; icon?: string}> = ({label, state, size = 30, icon}) => {
  const t = useT(); const pulse = state === 'now' ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
  const bg = state === 'done' ? RED : state === 'bad' ? '#F4F0EE' : WHITE; const fg = state === 'done' ? WHITE : state === 'todo' || state === 'bad' ? SOFT : RED;
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 18, background: bg, border: `3px solid ${state === 'todo' || state === 'bad' ? LINE : RED}`,
    boxShadow: state === 'now' ? `0 0 0 ${6 + pulse * 6}px rgba(226,55,68,${0.25 - pulse * 0.15})` : '0 6px 16px rgba(140,40,30,.1)', fontFamily: SANS, fontWeight: 700, fontSize: size, color: fg, whiteSpace: 'nowrap', textDecoration: state === 'bad' ? 'line-through' : 'none'}}>
    {icon && <Icon name={icon} size={size * 1.1} color={fg} />}{label}
  </div>;
};
/** service / app node */
export const Node: React.FC<{x: number; y: number; w?: number; h?: number; icon: string; label: string; sub?: string; t0: number; hot?: boolean}> = ({x, y, w = 280, h = 110, icon, label, sub, t0, hot}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, background: hot ? RED : WHITE, border: `3px solid ${hot ? RED : LINE}`, boxShadow: '0 10px 26px rgba(140,40,30,.13)',
    display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box', transform: `scale(${0.7 + 0.3 * p})`, opacity: clamp(p * 1.5)}}>
    <div style={{width: 62, height: 62, borderRadius: 16, background: hot ? WHITE : PEACH, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon name={icon} size={40} color={RED} /></div>
    <div><Txt size={28} w={700} color={hot ? WHITE : INK}>{label}</Txt>{sub && <Txt size={20} font={MONO} w={500} color={hot ? WHITE : GREY}>{sub}</Txt>}</div>
  </div>;
};
/** line that draws itself; red packets travel along it starting at each time in `packets` */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; head?: boolean; dash?: boolean; packets?: number[]}> = ({x1, y1, x2, y2, t0, d = 0.4, color = SOFT, sw = 4, head = true, dash, packets = []}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const a = Math.atan2(y2 - y1, x2 - x1); const hs = 16;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? '10 10' : undefined} />
    {head && k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
    {packets.map((p0, i) => { const u = (t - p0) / 0.7; if (u < 0 || u > 1) return null; const e = Easing.inOut(Easing.quad)(u);
      return <circle key={i} cx={lerp(x1, x2, e)} cy={lerp(y1, y2, e)} r={11} fill={RED} stroke={WHITE} strokeWidth={3} />; })}
  </svg>;
};
/** phone mock; children render inside the screen */
export const Phone: React.FC<{x: number; y: number; w?: number; h?: number; t0: number; children?: React.ReactNode; tilt?: number}> = ({x, y, w = 400, h = 820, t0, children, tilt = 0}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.5);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 56, background: '#141414', padding: 12, boxSizing: 'border-box', boxShadow: '0 30px 70px rgba(80,20,10,.35)',
    opacity: k, transform: `translateY(${(1 - k) * 60}px) rotate(${tilt}deg)`}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', background: WHITE}}>
      {children}
      <div style={{position: 'absolute', left: '50%', top: 12, width: 110, height: 30, marginLeft: -55, borderRadius: 16, background: '#141414'}} />
    </div>
  </div>;
};
/** push notification toast */
export const Toast: React.FC<{x: number; y: number; w: number; t0: number; title: string; body: string; logo?: string}> = ({x, y, w, t0, title, body, logo}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 26, background: 'rgba(255,255,255,.97)', boxShadow: '0 20px 50px rgba(0,0,0,.3)', padding: '20px 24px', boxSizing: 'border-box',
    display: 'flex', gap: 18, alignItems: 'center', transform: `translateY(${(1 - p) * -80}px)`, opacity: clamp(p * 1.5)}}>
    {logo && <Img src={staticFile(logo)} style={{width: 72, height: 72, borderRadius: 16}} />}
    <div><Txt size={28} w={800}>{title}</Txt><Txt size={26} w={500} color={GREY}>{body}</Txt></div>
  </div>;
};
/** panel heading: red label pill + one-line title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number}> = ({t0, label, title, size = 62}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.08, 0.45);
  return <div style={{position: 'absolute', left: 60, top: 44, right: 40}}>
    <div style={{display: 'inline-block', fontFamily: MONO, fontWeight: 500, fontSize: 22, color: WHITE, background: RED, padding: '5px 14px', borderRadius: 999, letterSpacing: 2, opacity: k1}}>{label}</div>
    <div style={{overflow: 'hidden', marginTop: 8}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: INK, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: -1, transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div>
    </div>
  </div>;
};

// ------------------------------------------------------------------ frame
const PanelBg: React.FC<{h: number}> = ({h}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: CREAM}}>
    <svg width={W} height={h} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
      <defs><pattern id="tp" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 24 18 V 30 M 18 24 H 30" stroke="#F3C9BF" strokeWidth="2.5" strokeLinecap="round" /></pattern></defs>
      <rect width={W} height={h} fill="url(#tp)" />
    </svg>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${PEACH} 0%, transparent 60%)`, opacity: 0.8}} />
  </div>
);

const Captions: React.FC<{data: Data; top: number}> = ({data, top}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.32, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 12px', borderRadius: 14, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px)`,
          color: WHITE, background: active ? RED : 'transparent', textShadow: active ? 'none' : '0 0 5px rgba(0,0,0,.9), 0 3px 0 rgba(0,0,0,.85), 0 0 20px rgba(0,0,0,.7)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const P = cfg.split;
  const k = Easing.inOut(Easing.cubic)(clamp((t - cfg.splitAt) / 0.65));
  const camY = k * cfg.camDy; const panelY = -(1 - k) * (P + 40);
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{position: 'absolute', left: 0, top: camY, width: W, height: H}} />
    {k > 0 && <div style={{position: 'absolute', left: 0, top: panelY, width: W, height: P, overflow: 'hidden', borderBottomLeftRadius: 44, borderBottomRightRadius: 44, boxShadow: '0 16px 40px rgba(0,0,0,.35)'}}>
      <PanelBg h={P} />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.15, 0.15)}}><El /></AbsoluteFill>;
      })}
      {(cfg.clips || []).map((c, i) => (t >= c.a && t < c.b) ? <AbsoluteFill key={'c' + i}>
        <Sequence from={Math.round(c.a * FPS)} durationInFrames={Math.round((c.b - c.a) * FPS) + 2} layout="none">
          <OffthreadVideo src={staticFile(c.src)} startFrom={Math.round((c.from || 0) * FPS)} muted style={{position: 'absolute', left: 0, top: 0, width: W, height: P, objectFit: 'cover', transform: `scale(${1.02 + 0.06 * clamp((t - c.a) / (c.b - c.a))})`}} />
        </Sequence>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 30%)'}} />
      </AbsoluteFill> : null)}
      {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    </div>}
    {(cfg.screenOverlays || []).map((O, i) => <O key={'s' + i} />)}
    {t >= (cfg.capSkip || 0) && <Captions data={data} top={lerp(1450, 1650, k)} />}
  </AbsoluteFill>;
};
