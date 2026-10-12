// Theme: VOID INDEX. Near-black canvas, electric blue + cyan accents with a dark brown glow (no purple), made for list / countdown reels ("10 X in 60 seconds").
//   talk - the (cut-out) speaker full screen on black with a soft violet glow; overlays in the band y 1150 to 1560
//   card - header strip (title, 1..N progress rail, countdown ring) + a glass card for the current item; speaker in a window below
// The countdown runs from cfg.timer.from to 0 between cfg.timer.a and cfg.timer.b (scaled to fit the list exactly).
// Captions: white words in a dark glass pill, the spoken word cyan with an underline glow.
// Icons: Phosphor duotone SVGs in public/icons/.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const BG = '#060505', PANEL = '#100E0D', PANEL2 = '#171413', LINE = '#2C2724', WHITE = '#F6F4F2', GREY = '#A09890';
export const BLUE = '#3B82F6', CYAN = '#22D3EE', ORANGE = '#FB923C', BROWN = '#8B5A2B', GREEN = '#34D399', AMBER = '#FBBF24', RED = '#F87171';
export const DISPLAY = 'Space Grotesk', SANS = 'Inter', MONO = 'JetBrains Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});
export const CARD_W = 1000, CARD_H = 800;

export type Config = {
  title: string;
  items: {t: number; label: string}[];             // list items in order with the time each one starts
  timer?: {a: number; b: number; from: number};    // countdown from `from` to 0 between a and b
  modes: {a: number; b: number; m: 'talk' | 'card'}[];
  face: {y0: number; y1: number};
  overlays?: React.FC[];
  speaker?: string;                                 // transparent cut-out speaker video (VP9 alpha) in public/
  rawUntil?: number;                                // show the original camera shot (real background) until this time, then the cut-out
  cutBottom?: number;                               // fade the speaker out below this fraction of the source height (hides a desk the matte kept)
};

// ------------------------------------------------------------------ primitives
export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 36}px)` : from === 'down' ? `translateY(${(1 - p) * -36}px)` : from === 'left' ? `translateX(${(1 - p) * -80}px)` : from === 'right' ? `translateX(${(1 - p) * 80}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.6) * out, transform: tr, ...style}}>{children}</div>;
};

export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', ...style}} />;
};

/** glass box */
export const Box: React.FC<{w?: number; h?: number; color?: string; glow?: boolean; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, color = LINE, glow, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 20, background: PANEL2, border: `2px solid ${color}`, boxShadow: glow ? `0 0 30px ${color}55, inset 0 0 20px ${color}18` : 'none', boxSizing: 'border-box', ...style}}>{children}</div>
);

export const Tag: React.FC<{color?: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = CYAN, solid, size = 22, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontWeight: 700, fontSize: size, color: solid ? BG : color, background: solid ? color : `${color}14`, border: `2px solid ${color}`, borderRadius: 10, padding: '5px 14px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** dotted flow with moving dots (card coords) */
export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; w?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = CYAN, n = 3, speed = 1, w = 3}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.4); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={CARD_W} height={CARD_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op, pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={LINE} strokeWidth={w} strokeDasharray="8 8" />
    {k > 0.95 && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <circle key={i} cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={7} fill={color} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)} style={{filter: `drop-shadow(0 0 6px ${color})`}} />; })}
  </svg>;
};

/** item header inside the card: big index, term, expansion */
export const ItemHead: React.FC<{t0: number; n: number; term: string; full?: string; color?: string}> = ({t0, n, term, full, color = BLUE}) => {
  const t = useT(); const k = ease(t, t0, 0.5);
  return <div style={{position: 'absolute', left: 36, top: 30, right: 36, display: 'flex', alignItems: 'center', gap: 26}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `3px ${color}`, transform: `translateY(${(1 - k) * 30}px)`, opacity: k}}>{String(n).padStart(2, '0')}</div>
    <div style={{opacity: k, transform: `translateX(${(1 - k) * 40}px)`}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 66, color: WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>{term}</div>
      {full && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 24, color: CYAN, marginTop: 10, whiteSpace: 'nowrap'}}>{full}</div>}
    </div>
  </div>;
};

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

const Backdrop: React.FC = () => {
  const t = useT();
  return <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${LINE}55 1px, transparent 1px), linear-gradient(90deg, ${LINE}55 1px, transparent 1px)`, backgroundSize: '72px 72px', backgroundPosition: `0 ${(t * 14) % 72}px`, WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 85%)', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 85%)'}} />
    <div style={{position: 'absolute', left: 540 + Math.sin(t * 0.3) * 220 - 500, top: 380 + Math.cos(t * 0.25) * 160 - 500, width: 1000, height: 1000, borderRadius: '50%', background: `radial-gradient(circle, ${BLUE}38, transparent 65%)`}} />
    <div style={{position: 'absolute', left: 540 + Math.cos(t * 0.22) * 260 - 450, top: 1300 + Math.sin(t * 0.3) * 160 - 450, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${BROWN}55, transparent 65%)`}} />
  </AbsoluteFill>;
};

/** countdown ring: seconds left */
export const Countdown: React.FC<{cfg: Config; size?: number}> = ({cfg, size = 110}) => {
  const t = useT(); const tm = cfg.timer; if (!tm) return null;
  const p = clamp((t - tm.a) / (tm.b - tm.a)); const left = Math.ceil(tm.from * (1 - p) - 1e-6);
  const done = t >= tm.b; const urgent = left <= 10 && !done && t > tm.a;
  const r = size / 2 - 7, C = 2 * Math.PI * r; const col = done ? GREEN : urgent ? ORANGE : CYAN;
  const pulse = t > tm.a && !done ? 1 + 0.04 * Math.max(0, Math.cos(((t - tm.a) / (tm.b - tm.a)) * tm.from * Math.PI * 2)) : 1;
  return <div style={{position: 'relative', width: size, height: size, transform: `scale(${pulse})`}}>
    <svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill={PANEL} stroke={LINE} strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * p} style={{filter: `drop-shadow(0 0 8px ${col})`}} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <span style={{fontFamily: MONO, fontWeight: 700, fontSize: size * 0.36, color: done ? GREEN : WHITE, lineHeight: 1}}>{done ? '0' : left}</span>
      <span style={{fontFamily: MONO, fontWeight: 500, fontSize: size * 0.13, color: GREY}}>{done ? 'DONE' : 'SEC'}</span>
    </div>
  </div>;
};

const Header: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => {
  const t = useT(); const cur = cfg.items.reduce((a, it, i) => (t >= it.t - 0.05 ? i : a), -1);
  return <div style={{position: 'absolute', left: 40, top: 34, width: CARD_W, height: 110, opacity: k, transform: `translateY(${(1 - k) * -40}px)`}}>
    <div style={{position: 'absolute', left: 0, top: 6, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: WHITE, whiteSpace: 'nowrap'}}>{cfg.title}</div>
    <div style={{position: 'absolute', left: 0, top: 78, width: 840, display: 'flex', gap: 8}}>
      {cfg.items.map((_, i) => <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: i < cur ? BLUE : i === cur ? CYAN : LINE, boxShadow: i === cur ? `0 0 12px ${CYAN}` : 'none'}} />)}
    </div>
    <div style={{position: 'absolute', right: 0, top: -6}}><Countdown cfg={cfg} size={112} /></div>
  </div>;
};

const Card: React.FC<{scenes: Scene[]; k: number}> = ({scenes, k}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 168, width: CARD_W, height: CARD_H, opacity: k, transform: `translateY(${(1 - k) * -60}px)`, background: `linear-gradient(180deg, ${PANEL}F2, ${BG}F2)`, borderRadius: 30, border: `2px solid ${LINE}`, boxShadow: `0 0 0 1px #000, 0 0 60px ${BLUE}26, 0 30px 60px rgba(0,0,0,.6)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: `linear-gradient(90deg, transparent, ${BLUE}, ${CYAN}, transparent)`}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${LINE} 1.4px, transparent 1.8px)`, backgroundSize: '26px 26px', opacity: 0.6}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
      const inK = ease(t, s.a - 0.05, 0.35), outK = ease(t, s.b - 0.12, 0.25);
      const El = s.el;
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `translateX(${(1 - inK) * 60 - outK * 60}px)`}}><El /></div>;
    })}
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => {
  const t = useT();
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 700, X1 = 40, Y1 = 1190;
  const s1 = Math.min(H1 / fh, W1 / 1080 * 1.12);
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 30 * k, overflow: 'hidden', background: k > 0.02 ? PANEL : 'transparent', border: k > 0.02 ? `${2 * k}px solid ${LINE}` : undefined, boxShadow: k > 0.02 ? `0 0 50px ${BLUE}22` : undefined, boxSizing: 'border-box'}}>
    {k > 0.02 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 60%, ${BLUE}33, transparent 70%)`, opacity: k}} />}
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s, WebkitMaskImage: cfg.cutBottom ? `linear-gradient(to bottom, #000 ${cfg.cutBottom * 100 - 4}%, transparent ${cfg.cutBottom * 100}%)` : undefined, maskImage: cfg.cutBottom ? `linear-gradient(to bottom, #000 ${cfg.cutBottom * 100 - 4}%, transparent ${cfg.cutBottom * 100}%)` : undefined}}>
      {cfg.speaker ? <OffthreadVideo src={staticFile(cfg.speaker)} transparent muted style={{width: '100%', height: '100%'}} /> : <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />}
    </div>
    {cfg.speaker && cfg.rawUntil !== undefined && t < cfg.rawUntil + 0.3 && <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s, opacity: clamp((cfg.rawUntil + 0.25 - t) / 0.5)}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
    </div>}
  </div>;
};

/** captions: dark glass pill, white words, spoken word cyan with a glowing underline, keywords violet */
const Captions: React.FC<{data: Data; k: number}> = ({data, k}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(1600, 1010, k); const fs = lerp(52, 44, k);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(14,14,20,.86)', borderRadius: 20, padding: '10px 24px 12px', border: `1px solid ${LINE}`, boxShadow: '0 10px 30px rgba(0,0,0,.5)'}}>
      {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: fs, lineHeight: 1.25, whiteSpace: 'nowrap', textAlign: 'center'}}>
        {ln.map((w, j) => {
          const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
          return <span key={j} style={{display: 'inline-block', margin: '0 7px', opacity: shown ? 1 : 0.25, transform: `translateY(${(1 - p) * 8}px)`,
            color: active ? CYAN : (w.k ? '#93C5FD' : WHITE), textShadow: active ? `0 0 14px ${CYAN}88` : 'none', borderBottom: active ? `3px solid ${CYAN}` : '3px solid transparent'}}>{w.w}</span>;
        })}
      </div>)}
    </div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = amt(t, spansOf(cfg, ['card']));
  return <AbsoluteFill style={{background: BG}}>
    <Backdrop />
    <Speaker cfg={cfg} k={k} />
    <Card scenes={scenes} k={k} />
    <Header cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} k={k} />
  </AbsoluteFill>;
};
