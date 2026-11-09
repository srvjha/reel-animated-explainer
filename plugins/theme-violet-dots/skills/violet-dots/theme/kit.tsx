// Theme: VIOLET DOTS. Light dotted canvas (cool off-white, slate dots) with indigo / violet accents, for AI and LLM topics.
// Layout toggles to and fro between two shots with animated transitions, no hard cuts:
//   talk  - the speaker full screen (a letterboxed source is zoomed to fill)
//   split - a two-way window: explainer panel on top (rounded bottom), speaker in the lower half, real background kept
// Parts: ChatWindow mock (header with model logo, user / assistant bubbles, thinking dots, token-by-token streaming),
// Token chips, pipeline Nodes with Wires and travelling packets, Meter bars, Card, Tag, Head. Space Grotesk + JetBrains Mono.
// Captions: Space Grotesk 700 white with shadow, the spoken word on a yellow pill.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const YELLOW = '#FFD60A', BG = '#F6F7FB', DOT = '#C9CEE3', INDIGO = '#4F46E5', VIOLET = '#7C3AED', TEAL = '#0D9488', AMBER = '#D97706', ROSE = '#E11D48',
  INK = '#111827', GREY = '#6B7280', SOFT = '#A3A9BF', LINE = '#E3E6F2', WHITE = '#FFFFFF', TINT = '#EEF0FF';
export const SANS = 'Space Grotesk', MONO = 'JetBrains Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});

export type Cut = {a: number; b: number; m: 'talk' | 'split'};
/** box = where the camera picture sits inside the 1080x1920 source (letterboxed sources), split = panel height */
export type Config = {cuts: Cut[]; split: number; box?: [number, number]; talkZoom?: number; talkDy?: number; overlays?: React.FC[]; screenOverlays?: React.FC[]; capSkip?: number};

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
export const Card: React.FC<{x: number; y: number; w: number; h?: number; t0: number; out?: number; children: React.ReactNode; hot?: boolean; color?: string; style?: React.CSSProperties}> = ({x, y, w, h, t0, out, children, hot, color = INDIGO, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 24, background: hot ? color : WHITE, color: hot ? WHITE : INK, border: `2px solid ${hot ? color : LINE}`,
    boxShadow: '0 14px 34px rgba(40,40,90,.10), 0 2px 6px rgba(40,40,90,.06)', padding: 24, boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * 24}px)`, ...style}}>{children}</div>;
};
export const Tag: React.FC<{children: React.ReactNode; solid?: boolean; size?: number; icon?: string; color?: string}> = ({children, solid = true, size = 26, icon, color = INDIGO}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: solid ? color : WHITE, border: `2.5px solid ${color}`, color: solid ? WHITE : color, fontFamily: SANS, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? WHITE : color} />}{children}
  </div>
);
/** pipeline node */
export const Node: React.FC<{x: number; y: number; w?: number; h?: number; icon?: string; label: string; sub?: string; t0: number; hot?: boolean; color?: string; dim?: boolean}> = ({x, y, w = 260, h = 100, icon, label, sub, t0, hot, color = INDIGO, dim}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 20, background: hot ? color : WHITE, border: `2.5px solid ${hot ? color : LINE}`, boxShadow: '0 10px 24px rgba(40,40,90,.10)',
    display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box', transform: `scale(${0.7 + 0.3 * p})`, opacity: clamp(p * 1.5) * (dim ? 0.4 : 1)}}>
    {icon && <div style={{width: 56, height: 56, borderRadius: 14, background: hot ? WHITE : TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon name={icon} size={36} color={color} /></div>}
    <div><Txt size={28} w={700} color={hot ? WHITE : INK}>{label}</Txt>{sub && <Txt size={19} font={MONO} w={500} color={hot ? WHITE : GREY}>{sub}</Txt>}</div>
  </div>;
};
/** line that draws itself; packets travel along it starting at each time in `packets` */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; head?: boolean; dash?: boolean; packets?: number[]; pc?: string}> = ({x1, y1, x2, y2, t0, d = 0.4, color = SOFT, sw = 4, head = true, dash, packets = [], pc = INDIGO}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const a = Math.atan2(y2 - y1, x2 - x1); const hs = 15;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? '9 9' : undefined} />
    {head && k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
    {packets.map((p0, i) => { const u = (t - p0) / 0.6; if (u < 0 || u > 1) return null; const e = Easing.inOut(Easing.quad)(u);
      return <circle key={i} cx={lerp(x1, x2, e)} cy={lerp(y1, y2, e)} r={10} fill={pc} stroke={WHITE} strokeWidth={3} />; })}
  </svg>;
};
/** token chip */
export const Tok: React.FC<{text: string; t0: number; color?: string; solid?: boolean; size?: number}> = ({text, t0, color = INDIGO, solid, size = 26}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{display: 'inline-block', padding: '6px 12px', borderRadius: 10, background: solid ? color : TINT, border: `2px solid ${solid ? color : '#D5D8F5'}`, color: solid ? WHITE : color,
    fontFamily: MONO, fontWeight: 700, fontSize: size, whiteSpace: 'pre', transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6)}}>{text}</div>;
};
/** horizontal meter 0..1 */
export const Meter: React.FC<{label: string; v: number; color?: string; w?: number}> = ({label, v, color = INDIGO, w = 400}) => (
  <div style={{width: w}}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}><Txt size={22} font={MONO} w={500} color={GREY}>{label}</Txt><Txt size={22} font={MONO} w={700} color={color}>{Math.round(v * 100)}%</Txt></div>
    <div style={{height: 18, borderRadius: 9, background: LINE, marginTop: 8}}><div style={{height: 18, borderRadius: 9, width: `${clamp(v) * 100}%`, background: color}} /></div>
  </div>
);
/** chat app mock. `reply` streams word by word from `s0` at `rate` words/sec; thinking dots show between `think` and s0 */
export const ChatWindow: React.FC<{x: number; y: number; w: number; h: number; t0: number; logo: string; name: string; prompt: string; promptAt: number; think: number; s0: number; reply: string; rate?: number; promptLines?: number}> = ({x, y, w, h, t0, logo, name, prompt, promptAt, think, s0, reply, rate = 9}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.45);
  const words = reply.split(' '); const n = t < s0 ? 0 : Math.min(words.length, Math.floor((t - s0) * rate) + 1);
  const dots = t >= think && t < s0;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 30, background: WHITE, border: `2px solid ${LINE}`, boxShadow: '0 24px 60px rgba(40,40,90,.16)', overflow: 'hidden',
    opacity: k, transform: `translateY(${(1 - k) * 40}px)`}}>
    <div style={{height: 82, borderBottom: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px'}}>
      <Img src={staticFile(logo)} style={{width: 46, height: 46, borderRadius: 12}} /><Txt size={30} w={700}>{name}</Txt>
      <div style={{marginLeft: 'auto', width: 14, height: 14, borderRadius: 7, background: n > 0 && n < words.length ? TEAL : SOFT}} />
    </div>
    <div style={{padding: 24}}>
      {t >= promptAt && <div style={{display: 'flex', justifyContent: 'flex-end', opacity: ease(t, promptAt, 0.3)}}>
        <div style={{maxWidth: w * 0.78, background: INDIGO, color: WHITE, borderRadius: '22px 22px 6px 22px', padding: '14px 20px', fontFamily: SANS, fontWeight: 500, fontSize: 25, lineHeight: 1.3}}>{prompt}</div></div>}
      {dots && <div style={{display: 'flex', gap: 10, marginTop: 24, padding: '18px 22px', background: TINT, borderRadius: 20, width: 110}}>
        {[0, 1, 2].map(i => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: INDIGO, opacity: 0.3 + 0.7 * Math.max(0, Math.sin(t * 7 - i * 0.9))}} />)}</div>}
      {n > 0 && <div style={{marginTop: 24, maxWidth: w * 0.86, background: TINT, borderRadius: '22px 22px 22px 6px', padding: '14px 20px', fontFamily: SANS, fontWeight: 500, fontSize: 25, lineHeight: 1.35, color: INK}}>
        {words.slice(0, n).join(' ')}{n < words.length && <span style={{display: 'inline-block', width: 12, height: 26, background: INDIGO, marginLeft: 6, verticalAlign: 'middle', opacity: Math.sin(t * 12) > 0 ? 1 : 0.2}} />}</div>}
    </div>
  </div>;
};
/** panel heading: indigo label pill + one-line title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number}> = ({t0, label, title, size = 60}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.08, 0.45);
  return <div style={{position: 'absolute', left: 60, top: 46, right: 40}}>
    <div style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 21, color: WHITE, background: INDIGO, padding: '5px 14px', borderRadius: 999, letterSpacing: 2, opacity: k1}}>{label}</div>
    <div style={{overflow: 'hidden', marginTop: 8}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: INK, lineHeight: 1.12, whiteSpace: 'nowrap', letterSpacing: -1, transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div>
    </div>
  </div>;
};

// ------------------------------------------------------------------ frame
export const Dots: React.FC<{h: number}> = ({h}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: BG}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${DOT} 2px, transparent 2.6px)`, backgroundSize: '30px 30px', backgroundPosition: '15px 15px'}} />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 85% 0%, ${TINT} 0%, transparent 55%)`}} />
  </div>
);

const Captions: React.FC<{data: Data; top: number}> = ({data, top}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 58, lineHeight: 1.3, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 12px', borderRadius: 14, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px)`,
          color: active ? INK : WHITE, background: active ? YELLOW : 'transparent', textShadow: active ? 'none' : '0 0 5px rgba(0,0,0,.9), 0 3px 0 rgba(0,0,0,.85), 0 0 20px rgba(0,0,0,.7)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

/** split amount at time t: 1 inside split cuts, 0 inside talk cuts, eased over 0.6 s at the start of each cut */
export const splitAmt = (t: number, cfg: Config) => {
  const i = cfg.cuts.findIndex(c => t >= c.a && t < c.b); if (i < 0) return 0;
  const c = cfg.cuts[i]; const prev = i > 0 ? (cfg.cuts[i - 1].m === 'split' ? 1 : 0) : (c.m === 'split' ? 1 : 0); const cur = c.m === 'split' ? 1 : 0;
  return lerp(prev, cur, Easing.inOut(Easing.cubic)(clamp((t - c.a) / 0.6)));
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const P = cfg.split; const [by, bh] = cfg.box || [0, H];
  const k = splitAmt(t, cfg);
  const fill = (H / bh) * (cfg.talkZoom || 1); const s = lerp(fill, 1, k);
  const camTy = lerp(cfg.talkDy || 0, P - by, k);   // talk: optional nudge down; split: picture top (by) lands at the panel bottom (P)
  const panelY = -(1 - k) * (P + 40);
  return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{transform: `translateY(${camTy}px) scale(${s})`, transformOrigin: '50% 50%'}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} />
    </AbsoluteFill>
    {k > 0.001 && <div style={{position: 'absolute', left: 0, top: panelY, width: W, height: P, overflow: 'hidden', borderBottomLeftRadius: 44, borderBottomRightRadius: 44, boxShadow: '0 16px 40px rgba(0,0,0,.35)'}}>
      <Dots h={P} />
      {scenes.map((sc, i) => {
        if (t < sc.a - 0.1 || t > sc.b + 0.05) return null;
        const El = sc.el; return <AbsoluteFill key={i} style={{opacity: win(t, sc.a, sc.b, 0.15, 0.15)}}><El /></AbsoluteFill>;
      })}
      {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    </div>}
    {(cfg.screenOverlays || []).map((O, i) => <O key={'s' + i} />)}
    {t >= (cfg.capSkip || 0) && <Captions data={data} top={lerp(1490, 1660, k)} />}
  </AbsoluteFill>;
};
