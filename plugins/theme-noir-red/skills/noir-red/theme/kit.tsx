// Theme: NOIR RED. Cinematic black with a single red accent (streaming-service feel).
//   talk - the speaker full screen (intro, punchlines), title card + logo overlay
//   card - a black "screen" card with a red glow edge plays the diagram scenes on top; the speaker
//          sits in a tall window below framed from the top of the head to the mic (never cropped)
// Icons: put SVGs in public/icons/ (lucide-static for generic, simple-icons for brands) and draw
// them with <Icon name="server" color={RED} />; they are tinted with a CSS mask.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/roboto-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const BLACK = '#070707', PANEL = '#121212', PANEL2 = '#1A1A1A', LINE = '#2A2A2A', WHITE = '#F5F5F1', GREY = '#9A9A9A';
export const RED = '#E50914', DEEP = '#8F0710', GREEN = '#2BD576', AMBER = '#F5B400';
export const DISPLAY = 'Bebas Neue', SANS = 'Inter Tight', MONO = 'Roboto Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});
/** scene box inside the card */
export const CARD_W = 1000, CARD_H = 840;

export type Config = {
  title: string;                                   // one line, shown in the intro title card and the header strip
  logo?: string;                                   // official logo in public/ (never redrawn)
  modes: {a: number; b: number; m: 'talk' | 'card'}[];
  face: {y0: number; y1: number};                  // source rows (1080x1920) from hair top to mic, shown whole in card mode
  overlays?: React.FC[];
};

// ------------------------------------------------------------------ primitives
export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 40}px)` : from === 'down' ? `translateY(${(1 - p) * -40}px)` : from === 'left' ? `translateX(${(1 - p) * -90}px)` : from === 'right' ? `translateX(${(1 - p) * 90}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.6) * out, transform: tr, ...style}}>{children}</div>;
};

/** tinted SVG icon from public/icons/<name>.svg */
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', ...style}} />;
};

/** labelled node: icon in a dark tile */
export const Node: React.FC<{icon: string; label: string; sub?: string; w?: number; color?: string; hot?: boolean; dim?: boolean}> = ({icon, label, sub, w = 220, color = WHITE, hot, dim}) => (
  <div style={{width: w, padding: '20px 12px 16px', borderRadius: 20, background: PANEL2, border: `2px solid ${hot ? RED : LINE}`, boxShadow: hot ? `0 0 34px ${RED}66` : '0 14px 30px rgba(0,0,0,.5)', textAlign: 'center', opacity: dim ? 0.35 : 1}}>
    <div style={{display: 'flex', justifyContent: 'center'}}><Icon name={icon} size={w * 0.32} color={hot ? RED : color} /></div>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: WHITE, marginTop: 12, whiteSpace: 'nowrap'}}>{label}</div>
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 19, color: GREY, marginTop: 2, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>
);

export const Tag: React.FC<{color?: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = RED, solid, size = 26, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: size, color: solid ? WHITE : color, background: solid ? color : 'rgba(0,0,0,.6)', border: `2px solid ${color}`, borderRadius: 10, padding: '6px 16px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** headline with a red kicker line */
export const Heading: React.FC<{t0: number; t1?: number; kicker: string; title: string}> = ({t0, t1, kicker, title}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 36, top: 26}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: RED, letterSpacing: '.2em'}}>{kicker}</div>
    <div style={{fontFamily: DISPLAY, fontSize: 76, color: WHITE, lineHeight: 1, letterSpacing: '.01em', whiteSpace: 'nowrap'}}>{title}</div>
  </Appear>
);

/** dotted flow line with moving packets between two points (card coords) */
export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; w?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = RED, n = 4, speed = 1, w = 4}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.45); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={CARD_W} height={CARD_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={LINE} strokeWidth={w} strokeDasharray="10 10" />
    {k > 0.95 && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <circle key={i} cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={8} fill={color} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)} style={{filter: `drop-shadow(0 0 6px ${color})`}} />; })}
  </svg>;
};

/** big animated number */
export const Count: React.FC<{t0: number; to: number; d?: number; fmt?: (n: number) => string; size?: number; color?: string}> = ({t0, to, d = 1.2, fmt = n => Math.round(n).toLocaleString('en-US'), size = 120, color = WHITE}) => {
  const t = useT(); return <span style={{fontFamily: DISPLAY, fontSize: size, color, lineHeight: 1}}>{fmt(to * ease(t, t0, d))}</span>;
};

/** horizontal meter */
export const Meter: React.FC<{v: number; w?: number; label?: string; color?: string}> = ({v, w = 600, label, color = RED}) => (
  <div style={{width: w}}>
    {label && <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 20, color: GREY, marginBottom: 8}}><span>{label}</span><span>{Math.round(clamp(v) * 100)}%</span></div>}
    <div style={{height: 22, borderRadius: 11, background: PANEL2, border: `1px solid ${LINE}`, overflow: 'hidden'}}><div style={{width: `${clamp(v) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${DEEP}, ${color})`}} /></div>
  </div>
);

// ------------------------------------------------------------------ frame
const cardAmt = (t: number, cfg: Config) => {
  let k = 0;
  for (const s of cfg.modes) if (s.m === 'card') k = Math.max(k, Easing.inOut(Easing.cubic)(clamp((t - s.a + 0.25) / 0.5)) * (1 - Easing.inOut(Easing.cubic)(clamp((t - s.b + 0.25) / 0.5))));
  return k;
};

const Backdrop: React.FC<{k: number}> = ({k}) => {
  const t = useT();
  return <AbsoluteFill style={{opacity: k, background: BLACK}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 40% at 50% 28%, ${DEEP}55, transparent 70%)`}} />
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 4px)'}} />
    {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((t * 40 + i * 640) % 1920), height: 2, background: `linear-gradient(90deg, transparent, ${RED}22, transparent)`}} />)}
  </AbsoluteFill>;
};

const Header: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => (
  <div style={{position: 'absolute', left: 40, top: 44, display: 'flex', alignItems: 'center', gap: 16, opacity: k}}>
    {cfg.logo && <Img src={staticFile(cfg.logo)} style={{width: 64, height: 64}} />}
    <span style={{fontFamily: DISPLAY, fontSize: 58, color: WHITE, letterSpacing: '.02em', whiteSpace: 'nowrap'}}>{cfg.title}</span>
  </div>
);

const Card: React.FC<{scenes: Scene[]; k: number}> = ({scenes, k}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: CARD_H, opacity: k, transform: `translateY(${(1 - k) * -80}px)`, background: PANEL, borderRadius: 26, border: `2px solid ${LINE}`, boxShadow: `0 0 0 1px #000, 0 0 60px ${RED}33, 0 30px 60px rgba(0,0,0,.7)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg, transparent, ${RED}, transparent)`}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,.05) 1.2px, transparent 1.6px)`, backgroundSize: '28px 28px'}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
      const inK = ease(t, s.a - 0.05, 0.4), outK = ease(t, s.b - 0.12, 0.3);
      const El = s.el;
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `scale(${0.97 + 0.03 * inK})`}}><El /></div>;
    })}
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => {
  // full screen -> window (x 40, y 1150, 1000 x 730), whole face band visible (letterboxed, never cropped)
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 730, X1 = 40, Y1 = 1150;
  const s1 = Math.min(H1 / fh, W1 / 1080 * 1.12);
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28 * k, overflow: 'hidden', background: BLACK, border: k > 0.02 ? `${2 * k}px solid ${LINE}` : undefined, boxShadow: k > 0.02 ? `0 0 50px ${RED}22` : undefined}}>
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
    </div>
    <AbsoluteFill style={{background: `linear-gradient(rgba(0,0,0,.45), transparent 18%, transparent 62%, rgba(0,0,0,.7))`, opacity: 1 - k}} />
  </div>;
};

/** subtitles: white bold with a dark outline; the spoken word turns red and lifts */
const Captions: React.FC<{data: Data; k: number}> = ({data, k}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(1390, 995, k);
  return <div style={{position: 'absolute', left: 20, right: 20, top, textAlign: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: lerp(64, 50, k), lineHeight: 1.2, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 8px', opacity: shown ? 1 : 0, transform: `translateY(${(1 - p) * 14 - (active ? 4 : 0)}px) scale(${active ? 1.08 : 1})`,
          color: active ? RED : (w.k ? '#FF6B72' : WHITE), textShadow: '0 0 2px #000, 0 3px 0 #000, 0 0 16px rgba(0,0,0,.9)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = cardAmt(t, cfg);
  return <AbsoluteFill style={{background: BLACK}}>
    <Backdrop k={k} />
    <Speaker cfg={cfg} k={k} />
    <Card scenes={scenes} k={k} />
    <Header cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} k={k} />
  </AbsoluteFill>;
};
