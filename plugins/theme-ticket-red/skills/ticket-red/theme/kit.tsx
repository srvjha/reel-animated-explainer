// Theme: TICKET RED. Whitish warm paper, ticket red + deep red, dark ink: event / ticketing look.
//   talk - the (cut-out) speaker full screen on the paper; overlays (ticket cards) in the band y 1150 to 1560, captions below
//   card - a white ticket card (red header band, perforation notches near the bottom) plays the scenes; speaker in a window below
//   full - same card stretched to 1000 x 1530, speaker window slides away
// Captions are a ticket stub: white card with a red stub and dashed tear line; the spoken word gets a red highlight.
// Icons: Phosphor duotone SVGs in public/icons/.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/800.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const PAPER = '#FFF6F4', PAPER2 = '#FCE9E8', CARD = '#FFFFFF', LINE = '#F0D5D9', GREYL = '#E7E7EC';
export const INK = '#1F1F2B', SUB = '#6B6B78', RED = '#F84464', DEEP = '#C4123F', GREEN = '#169B62', AMBER = '#F5A623', BLUE = '#2D7FF9';
export const DISPLAY = 'Poppins', SANS = 'Inter', MONO = 'JetBrains Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});
export const CARD_W = 1000, CARD_H = 840;
export const FULL_H = 1530;

export type Config = {
  title: string;
  logo?: string;                                    // official logo in public/, inline left of the title (on a white chip)
  logoH?: number;
  modes: {a: number; b: number; m: 'talk' | 'card' | 'full'}[];
  face: {y0: number; y1: number};
  overlays?: React.FC[];
  speaker?: string;                                 // transparent cut-out speaker video (VP9 alpha) in public/
  cutBottom?: number;                               // fade the cut-out below this fraction of the source height
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

/** ticket-shaped card with notches on the left/right edge at `notch` (fraction of height) and a dashed tear line */
export const Ticket: React.FC<{w: number; h: number; notch?: number; color?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, notch = 0.5, color = RED, children, style}) => {
  const r = 18; const y = h * notch;
  const mask = `radial-gradient(circle at 0 ${y}px, transparent ${r}px, #000 ${r + 1}px) left / 51% 100% no-repeat, radial-gradient(circle at 100% ${y}px, transparent ${r}px, #000 ${r + 1}px) right / 51% 100% no-repeat`;
  return <div style={{position: 'relative', width: w, height: h, filter: 'drop-shadow(0 10px 20px rgba(31,31,43,.16))', ...style}}>
    <div style={{position: 'absolute', inset: 0, background: CARD, borderRadius: 20, WebkitMask: mask, mask}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: 20, boxShadow: `inset 0 0 0 3px ${color}`, WebkitMask: mask, mask}} />
    <div style={{position: 'absolute', left: r + 6, right: r + 6, top: y, borderTop: `3px dashed ${color}66`}} />
    <div style={{position: 'absolute', inset: 0}}>{children}</div>
  </div>;
};

/** cinema seat; state: free / taken / hot / held / ok */
export const Seat: React.FC<{size?: number; state?: 'free' | 'taken' | 'hot' | 'held' | 'ok'; label?: string}> = ({size = 56, state = 'free', label}) => {
  const c = state === 'hot' ? RED : state === 'held' ? AMBER : state === 'ok' ? GREEN : state === 'taken' ? '#DCDCE3' : CARD;
  const b = state === 'free' ? GREEN : state === 'taken' ? '#C9C9D2' : c;
  return <div style={{width: size, height: size * 0.9, borderRadius: `${size * 0.32}px ${size * 0.32}px ${size * 0.12}px ${size * 0.12}px`, background: c, border: `3px solid ${b}`, boxShadow: state === 'hot' ? `0 0 22px ${RED}88` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
    {label && <span style={{fontFamily: MONO, fontWeight: 700, fontSize: size * 0.3, color: state === 'free' ? GREEN : state === 'taken' ? '#8E8E99' : '#fff'}}>{label}</span>}
  </div>;
};

export const Node: React.FC<{icon?: string; logo?: string; label: string; sub?: string; w?: number; tone?: 'red' | 'green' | 'amber' | 'blue' | 'ink'; on?: boolean; dim?: boolean}> = ({icon, logo, label, sub, w = 220, tone = 'ink', on, dim}) => {
  const c = tone === 'red' ? RED : tone === 'green' ? GREEN : tone === 'amber' ? AMBER : tone === 'blue' ? BLUE : INK;
  return <div style={{width: w, padding: '18px 12px 16px', borderRadius: 22, background: CARD, border: `3px solid ${on ? c : LINE}`, boxShadow: on ? `0 10px 26px ${c}40` : '0 8px 18px rgba(31,31,43,.08)', textAlign: 'center', opacity: dim ? 0.35 : 1, boxSizing: 'border-box'}}>
    <div style={{display: 'flex', justifyContent: 'center', height: w * 0.3, alignItems: 'center'}}>{logo ? <Logo src={logo} h={w * 0.24} /> : <Icon name={icon || 'database'} size={w * 0.3} color={on ? c : INK} />}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: INK, marginTop: 10, whiteSpace: 'nowrap'}}>{label}</div>
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 18, color: SUB, marginTop: 4, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};

export const Tag: React.FC<{color?: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = RED, solid, size = 24, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: size, color: solid ? '#fff' : color, background: solid ? color : CARD, border: `2px solid ${color}`, borderRadius: 999, padding: '6px 18px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** heading inside the card, below the red band */
export const Heading: React.FC<{t0: number; t1?: number; kicker: string; title: string}> = ({t0, t1, kicker, title}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 40, top: 94}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 21, color: DEEP, letterSpacing: '.14em'}}>{kicker}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 48, color: INK, lineHeight: 1.12, whiteSpace: 'nowrap', marginTop: 2}}>{title}</div>
  </Appear>
);

export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; w?: number; h?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = RED, n = 3, speed = 1, w = 4, h = FULL_H}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.45); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={CARD_W} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op, pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={SUB} strokeOpacity={0.4} strokeWidth={w} strokeDasharray="12 10" strokeLinecap="round" />
    {k > 0.95 && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <circle key={i} cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={11} fill={color} stroke={CARD} strokeWidth={3} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)} />; })}
  </svg>;
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
  return <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${LINE} 2.2px, transparent 2.6px)`, backgroundSize: '34px 34px', backgroundPosition: `0 ${(t * 8) % 34}px`, opacity: 0.9}} />
    <div style={{position: 'absolute', left: -300 + Math.sin(t * 0.25) * 80, top: -260, width: 1100, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${RED}2A, transparent 65%)`}} />
    <div style={{position: 'absolute', left: 420 + Math.cos(t * 0.2) * 80, top: 1250, width: 1000, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${RED}22, transparent 65%)`}} />
    {[0, 1, 2, 3].map(i => { const y = 1920 - ((t * (24 + i * 6) + i * 520) % 2100);
      return <div key={i} style={{position: 'absolute', left: [40, 970, 950, 20][i], top: y, opacity: 0.16, transform: `rotate(${Math.sin(t * 0.8 + i) * 16}deg)`}}><Icon name={['ticket', 'armchair', 'film-strip', 'ticket'][i]} size={58} color={i % 2 ? DEEP : RED} /></div>; })}
  </AbsoluteFill>;
};

const Header: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => (
  <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: 76, display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px', boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * -80}px)`, zIndex: 2}}>
    {cfg.logo && <div style={{background: '#fff', borderRadius: 12, padding: '6px 12px'}}><Logo src={cfg.logo} h={cfg.logoH || 38} /></div>}
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: '#fff', whiteSpace: 'nowrap'}}>{cfg.title}</span>
  </div>
);

const Card: React.FC<{scenes: Scene[]; k: number; fk: number}> = ({scenes, k, fk}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  const H = lerp(CARD_H, FULL_H, fk);
  return <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: H, opacity: k, transform: `translateY(${(1 - k) * -80}px)`, filter: 'drop-shadow(0 22px 40px rgba(31,31,43,.18))'}}>
    <div style={{position: 'absolute', inset: 0, background: CARD, borderRadius: 30, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 76, background: `linear-gradient(90deg, ${RED}, ${DEEP})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 76, bottom: 0, backgroundImage: `radial-gradient(${LINE} 1.6px, transparent 2px)`, backgroundSize: '28px 28px', opacity: 0.8}} />
      {/* perforation notches along the red band edge */}
      {Array.from({length: 24}).map((_, i) => <div key={i} style={{position: 'absolute', left: 14 + i * 42, top: 70, width: 12, height: 12, borderRadius: 6, background: CARD}} />)}
      {scenes.map((s, i) => {
        if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
        const inK = ease(t, s.a - 0.05, 0.4), outK = ease(t, s.b - 0.12, 0.3);
        const El = s.el;
        return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `translateY(${(1 - inK) * 30 - outK * 30}px)`}}><El /></div>;
      })}
    </div>
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number; fk: number}> = ({cfg, k, fk}) => {
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 720, X1 = 40, Y1 = 1160;
  const s1 = Math.min(H1 / fh, W1 / 1080 * 1.12);
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  const mk = cfg.cutBottom ? `linear-gradient(to bottom, #000 ${cfg.cutBottom * 100 - 4}%, transparent ${cfg.cutBottom * 100}%)` : undefined;
  return <div style={{position: 'absolute', left: x, top: y + fk * 820, opacity: 1 - fk, width: w, height: h, borderRadius: 30 * k, overflow: 'hidden', background: k > 0.02 ? PAPER2 : 'transparent', boxShadow: k > 0.02 ? `0 18px 40px rgba(31,31,43,${0.2 * k}), 0 0 0 ${4 * k}px ${CARD}, 0 0 0 ${7 * k}px ${RED}66` : undefined}}>
    {k > 0.02 && <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${LINE} 2.2px, transparent 2.6px)`, backgroundSize: '30px 30px', opacity: k}} />}
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s, WebkitMaskImage: mk, maskImage: mk}}>
      {cfg.speaker ? <OffthreadVideo src={staticFile(cfg.speaker)} transparent muted style={{width: '100%', height: '100%'}} /> : <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />}
    </div>
  </div>;
};

/** captions: ticket stub, dark words, the spoken word in a red highlight, keywords deep red */
const Captions: React.FC<{data: Data; k: number; fk: number}> = ({data, k, fk}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(lerp(1590, 992, k), 1690, fk);
  const fs = lerp(50, 44, k);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{display: 'flex', alignItems: 'stretch', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 26px rgba(31,31,43,.2)'}}>
      <div style={{width: 22, background: RED, borderRight: `3px dashed ${CARD}`}} />
      <div style={{background: CARD, padding: '10px 22px 12px'}}>
        {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: fs, lineHeight: 1.25, whiteSpace: 'nowrap', textAlign: 'center'}}>
          {ln.map((w, j) => {
            const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
            return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 6px', borderRadius: 8, opacity: shown ? 1 : 0.28, transform: `translateY(${(1 - p) * 8}px)`,
              background: active ? RED : 'transparent', color: active ? '#fff' : (w.k ? DEEP : INK)}}>{w.w}</span>;
          })}
        </div>)}
      </div>
    </div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = amt(t, spansOf(cfg, ['card', 'full'])); const fk = amt(t, spansOf(cfg, ['full']));
  return <AbsoluteFill style={{background: PAPER}}>
    <Backdrop />
    <Speaker cfg={cfg} k={k} fk={fk} />
    <Card scenes={scenes} k={k} fk={fk} />
    <Header cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} k={k} fk={fk} />
  </AbsoluteFill>;
};
