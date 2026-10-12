// Theme: CHAT WALL. Messenger-style beige doodle wallpaper, teal header bars, light-green outgoing bubbles, tick marks.
//   talk - the (cut-out) speaker full screen on the wallpaper; overlays live in the band y 1170 to 1560, captions below
//   card - a white chat-window card (teal title bar) plays the diagram scenes; the speaker sits in a rounded window below,
//          on the same wallpaper, scaled so the whole band from hair to mic is visible (never cropped)
//   full - same card stretched to 1000 x 1530, speaker window slides away
// Captions are an outgoing chat bubble with a tail and ticks; the spoken word turns teal-bold, keywords green.
// Icons: Phosphor duotone SVGs in public/icons/. Ticks (sent / delivered / read) are drawn by <Ticks>.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/900.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const WALL = '#ECE5DD', CARD = '#FFFFFF', PANEL = '#F0F2F5', LINE = '#DDE3E6';
export const INK = '#111B21', SUB = '#667781', TEAL = '#008069', DTEAL = '#075E54', GREEN = '#25D366', BUBBLE = '#D9FDD3';
export const BLUE = '#53BDEB', RED = '#EA0038', AMBER = '#F5A623';
export const DISPLAY = 'Nunito', SANS = 'Inter', MONO = 'JetBrains Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});
export const CARD_W = 1000, CARD_H = 840;
export const FULL_H = 1530;

export type Config = {
  title: string;
  logo?: string;                                    // official logo in public/ (never redrawn), inline left of the title
  modes: {a: number; b: number; m: 'talk' | 'card' | 'full'}[];
  face: {y0: number; y1: number};
  overlays?: React.FC[];
  speaker?: string;                                 // transparent cut-out speaker video (VP9 alpha) in public/
  wallpaper?: string;                               // doodle layer PNG in public/ (default doodles.png)
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

export const Logo: React.FC<{src: string; h?: number; w?: number; style?: React.CSSProperties}> = ({src, h, w, style}) => (
  <Img src={staticFile(src)} style={{height: h, width: w, objectFit: 'contain', display: 'block', ...style}} />
);

/** message status ticks: n = 1 (sent), 2 (delivered); read = blue */
export const Ticks: React.FC<{n: 1 | 2; read?: boolean; size?: number; color?: string}> = ({n, read, size = 28, color}) => {
  const c = color || (read ? BLUE : SUB);
  return <svg width={size * (n === 2 ? 1.45 : 1)} height={size * 0.8} viewBox={`0 0 ${n === 2 ? 29 : 20} 16`} style={{display: 'block'}}>
    <path d="M1.5 8.5 L6.5 13.5 L18 2" fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    {n === 2 && <path d="M12.5 12.5 L13.5 13.5 L25 2" fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
  </svg>;
};

/** chat bubble: out = right/green (sender), in = left/white */
export const Bubble: React.FC<{text: React.ReactNode; out?: boolean; ticks?: 0 | 1 | 2; read?: boolean; time?: string; size?: number; w?: number}> = ({text, out = true, ticks = 0, read, time = '10:42', size = 30, w}) => (
  <div style={{position: 'relative', display: 'inline-block', width: w, padding: '12px 18px 10px', borderRadius: 18, borderTopRightRadius: out ? 4 : 18, borderTopLeftRadius: out ? 18 : 4, background: out ? BUBBLE : CARD, boxShadow: '0 2px 2px rgba(11,20,26,.13)', boxSizing: 'border-box'}}>
    <svg width={16} height={20} style={{position: 'absolute', top: 0, [out ? 'right' : 'left']: -10}} viewBox="0 0 16 20"><path d={out ? 'M0 0 H16 L0 18 Z' : 'M16 0 H0 L16 18 Z'} fill={out ? BUBBLE : CARD} /></svg>
    <span style={{fontFamily: SANS, fontWeight: 500, fontSize: size, color: INK}}>{text}</span>
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 14, verticalAlign: 'bottom', fontFamily: SANS, fontSize: size * 0.5, color: SUB}}>{time}{ticks > 0 && <Ticks n={ticks as 1 | 2} read={read} size={size * 0.62} />}</span>
  </div>
);

/** tile with icon (or logo); tone teal / green / red */
export const Node: React.FC<{icon?: string; logo?: string; label: string; sub?: string; w?: number; tone?: 'teal' | 'green' | 'red' | 'ink'; on?: boolean; dim?: boolean}> = ({icon, logo, label, sub, w = 220, tone = 'ink', on, dim}) => {
  const c = tone === 'teal' ? TEAL : tone === 'green' ? GREEN : tone === 'red' ? RED : INK;
  return <div style={{width: w, padding: '18px 12px 16px', borderRadius: 22, background: CARD, border: `3px solid ${on ? c : LINE}`, boxShadow: on ? `0 10px 26px ${c}40` : '0 6px 16px rgba(11,20,26,.10)', textAlign: 'center', opacity: dim ? 0.35 : 1, boxSizing: 'border-box'}}>
    <div style={{display: 'flex', justifyContent: 'center', height: w * 0.3, alignItems: 'center'}}>{logo ? <Logo src={logo} h={w * 0.3} /> : <Icon name={icon || 'cloud'} size={w * 0.3} color={on ? c : INK} />}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: INK, marginTop: 10, whiteSpace: 'nowrap'}}>{label}</div>
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 18, color: SUB, marginTop: 4, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};

export const Tag: React.FC<{color?: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = TEAL, solid, size = 24, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: size, color: solid ? '#fff' : color, background: solid ? color : CARD, border: `2px solid ${color}`, borderRadius: 999, padding: '6px 18px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** chat-window style heading: small teal kicker + bold title */
export const Heading: React.FC<{t0: number; t1?: number; kicker: string; title: string}> = ({t0, t1, kicker, title}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 36, top: 92}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 21, color: TEAL, letterSpacing: '.14em'}}>{kicker}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: INK, lineHeight: 1.08, whiteSpace: 'nowrap', marginTop: 2}}>{title}</div>
  </Appear>
);

/** dashed line with moving message dots (card coords) */
export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; w?: number; h?: number; broken?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = GREEN, n = 3, speed = 1, w = 4, h = FULL_H, broken}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.45); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={CARD_W} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op, pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={broken !== undefined && t > broken ? RED : SUB} strokeOpacity={0.5} strokeWidth={w} strokeDasharray="12 10" strokeLinecap="round" />
    {k > 0.95 && (broken === undefined || t < broken) && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <circle key={i} cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={11} fill={color} stroke={CARD} strokeWidth={3} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)} />; })}
  </svg>;
};

/** phone with a messenger look; children drawn on the screen */
export const Phone: React.FC<{w?: number; h?: number; title?: string; status?: string; online?: boolean; children?: React.ReactNode; dim?: boolean}> = ({w = 300, h = 540, title = 'Friend', status, online, children, dim}) => (
  <div style={{width: w, height: h, borderRadius: w * 0.13, background: INK, padding: 10, boxSizing: 'border-box', boxShadow: '0 16px 34px rgba(11,20,26,.28)', opacity: dim ? 0.55 : 1}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.1, overflow: 'hidden', background: WALL}}>
      <Img src={staticFile('doodles.png')} style={{position: 'absolute', left: 0, top: 0, width: 1080 * 0.4, height: 1920 * 0.4, opacity: 0.8}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 74, background: TEAL, display: 'flex', alignItems: 'center', gap: 10, padding: '18px 14px 0', boxSizing: 'border-box'}}>
        <div style={{width: 40, height: 40, borderRadius: 20, background: '#DFE5E7', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="user" size={26} color={SUB} /></div>
        <div><div style={{fontFamily: SANS, fontWeight: 700, fontSize: 19, color: '#fff'}}>{title}</div>{status && <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 14, color: online ? '#C8F7DA' : '#D7E3E1'}}>{status}</div>}</div>
      </div>
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
  return <AbsoluteFill style={{background: WALL}}>
    <Img src={staticFile(cfg.wallpaper || 'doodles.png')} style={{position: 'absolute', left: 0, top: -60, width: 1080, height: 1920, transform: `translateY(${(t * 6) % 110}px)`}} />
    <Img src={staticFile(cfg.wallpaper || 'doodles.png')} style={{position: 'absolute', left: 0, top: -60 - 1920, width: 1080, height: 1920, transform: `translateY(${(t * 6) % 110}px)`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 35% at 50% 0%, ${GREEN}22, transparent 70%)`}} />
  </AbsoluteFill>;
};

const Header: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => (
  <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: 78, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * -80}px)`, zIndex: 2}}>
    {cfg.logo && <Logo src={cfg.logo} h={50} />}
    <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 36, color: '#fff', whiteSpace: 'nowrap'}}>{cfg.title}</span>
    <div style={{flex: 1}} />
    <Icon name="chat-circle-dots" size={40} color="#fff" />
  </div>
);

const Card: React.FC<{scenes: Scene[]; k: number; fk: number}> = ({scenes, k, fk}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: lerp(CARD_H, FULL_H, fk), opacity: k, transform: `translateY(${(1 - k) * -80}px)`, background: CARD, borderRadius: 30, boxShadow: '0 24px 50px rgba(11,20,26,.22)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 78, background: TEAL}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 78, bottom: 0, backgroundImage: `radial-gradient(${LINE} 1.6px, transparent 2px)`, backgroundSize: '28px 28px', opacity: 0.8}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
      const inK = ease(t, s.a - 0.05, 0.4), outK = ease(t, s.b - 0.12, 0.3);
      const El = s.el;
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `translateY(${(1 - inK) * 30 - outK * 30}px)`}}><El /></div>;
    })}
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number; fk: number}> = ({cfg, k, fk}) => {
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 720, X1 = 40, Y1 = 1160;
  const s1 = Math.min(H1 / fh, W1 / 1080 * 1.12);
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  return <div style={{position: 'absolute', left: x, top: y + fk * 820, opacity: 1 - fk, width: w, height: h, borderRadius: 30 * k, overflow: 'hidden', background: k > 0.02 ? WALL : 'transparent', boxShadow: k > 0.02 ? `0 18px 40px rgba(11,20,26,${0.25 * k}), inset 0 0 0 ${4 * k}px ${CARD}` : undefined}}>
    {cfg.speaker && k > 0.02 && <Img src={staticFile(cfg.wallpaper || 'doodles.png')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: k}} />}
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s}}>
      {cfg.speaker ? <OffthreadVideo src={staticFile(cfg.speaker)} transparent muted style={{width: '100%', height: '100%'}} /> : <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />}
    </div>
    {k > 0.02 && <div style={{position: 'absolute', inset: 0, borderRadius: 30 * k, boxShadow: `inset 0 0 0 ${5 * k}px ${CARD}`}} />}
  </div>;
};

/** captions: an outgoing chat bubble with tail and ticks; spoken word teal + bold, keywords green */
const Captions: React.FC<{data: Data; k: number; fk: number}> = ({data, k, fk}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(lerp(1590, 990, k), 1690, fk);
  const fs = lerp(50, 44, k);
  const done = t > pg.e - 0.35;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{position: 'relative', background: BUBBLE, borderRadius: 22, borderTopRightRadius: 6, padding: '10px 22px 12px', boxShadow: '0 4px 10px rgba(11,20,26,.22)'}}>
      <svg width={18} height={22} style={{position: 'absolute', top: 0, right: -12}} viewBox="0 0 16 20"><path d="M0 0 H16 L0 18 Z" fill={BUBBLE} /></svg>
      {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: fs, lineHeight: 1.25, whiteSpace: 'nowrap', textAlign: 'center'}}>
        {ln.map((w, j) => {
          const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
          return <span key={j} style={{display: 'inline-block', margin: '0 6px', opacity: shown ? 1 : 0.28, transform: `translateY(${(1 - p) * 8}px) scale(${active ? 1.06 : 1})`,
            color: active ? TEAL : (w.k ? '#0A8F3C' : INK), textDecoration: active ? `underline 4px ${GREEN}` : 'none', textUnderlineOffset: 8}}>{w.w}</span>;
        })}
      </div>)}
      <div style={{position: 'absolute', right: 12, bottom: 6}}><Ticks n={done ? 2 : 1} read={done} size={20} /></div>
    </div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = amt(t, spansOf(cfg, ['card', 'full'])); const fk = amt(t, spansOf(cfg, ['full']));
  return <AbsoluteFill style={{background: WALL}}>
    <Backdrop cfg={cfg} />
    <Speaker cfg={cfg} k={k} fk={fk} />
    <Card scenes={scenes} k={k} fk={fk} />
    <Header cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} k={k} fk={fk} />
  </AbsoluteFill>;
};
