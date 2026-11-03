// Theme: CARD CATALOG. Split layout: an explainer "library desk" on top and the speaker below (real background,
// just cropped into the lower panel). The desk is warm paper with grain; ideas live on library index cards (red header
// rule, blue ruled lines, rod hole), typewriter text, a wooden catalog drawer with a brass label holder, number-vector
// chips, ink arrows and a PDF page that gets cut into chunk cards. DM Serif Display headings, Courier Prime typewriter,
// Work Sans for UI and captions. No purple, no banners.
//   cfg.split: y where the desk ends and the camera begins; cfg.camDy shifts the video so the face sits in the lower panel.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/work-sans/500.css';
import '@fontsource/work-sans/700.css';
import '@fontsource/work-sans/800.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const PAPER = '#F3EAD7', CARD = '#FFFBF0', RULE = '#B9CDE4', RED = '#B23A2E', NAVY = '#22324F', BRASS = '#B8892E', WOOD = '#7A4E2D', WOOD2 = '#5E3A20';
export const GREEN = '#3F7D5B', MUTED = '#7C705E', TEAL = '#2F7F86', AMBER = '#C9822B';
export const SERIF = 'DM Serif Display', TYPE = 'Courier Prime', SANS = 'Work Sans';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});

export type Config = {cuts?: never; split: number; camDy: number; camScale?: number; overlays?: React.FC[]};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = NAVY, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const Logo: React.FC<{src: string; h?: number; style?: React.CSSProperties}> = ({src, h, style}) => <Img src={staticFile(src)} style={{height: h, display: 'block', ...style}} />;
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 18, children, style}) => {
  const t = useT(); const k = ease(t, t0, d); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 34, color = NAVY, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);
/** typewriter text */
export const Type: React.FC<{t0: number; text: string; cps?: number; size?: number; color?: string; bold?: boolean}> = ({t0, text, cps = 28, size = 28, color = NAVY, bold}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const n = Math.min(text.length, Math.floor((t - t0) * cps) + 1);
  return <span style={{fontFamily: TYPE, fontWeight: bold ? 700 : 400, fontSize: size, color, whiteSpace: 'pre'}}>{text.slice(0, n)}{n < text.length && <span style={{opacity: Math.floor(f / 6) % 2}}>▌</span>}</span>;
};

/** library index card: header with red rule, blue ruled body, rod hole; slides in */
export const Card: React.FC<{x: number; y: number; w: number; h: number; t0: number; head?: React.ReactNode; children?: React.ReactNode; rot?: number; from?: [number, number]; accent?: string; hl?: boolean; dim?: boolean; noHole?: boolean}> =
  ({x, y, w, h, t0, head, children, rot = 0, from = [0, 40], accent = RED, hl, dim, noHole}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(${(1 - p) * from[0]}px, ${(1 - p) * from[1]}px) rotate(${rot}deg)`, opacity: clamp(p * 1.5) * (dim ? 0.45 : 1),
    background: `repeating-linear-gradient(180deg, transparent 0 37px, ${RULE} 37px 39px), ${CARD}`, backgroundPosition: `0 ${head ? 64 : 22}px`,
    borderRadius: 10, boxShadow: hl ? `0 0 0 4px ${AMBER}, 0 16px 30px rgba(70,45,20,.28)` : '0 12px 24px rgba(70,45,20,.22), 0 1px 0 rgba(0,0,0,.05)', overflow: 'hidden'}}>
    {head && <div style={{height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: `3px solid ${accent}`, background: CARD, fontFamily: TYPE, fontWeight: 700, fontSize: 26, color: accent, gap: 10, whiteSpace: 'nowrap'}}>{head}</div>}
    <div style={{padding: '12px 20px'}}>{children}</div>
    {!noHole && <div style={{position: 'absolute', left: w / 2 - 12, bottom: 12, width: 24, height: 24, borderRadius: 12, background: PAPER, boxShadow: 'inset 0 2px 3px rgba(0,0,0,.25)'}} />}
  </div>;
};

/** wooden catalog drawer with brass label holder and handle; `fill` = number of card tabs visible inside */
export const Drawer: React.FC<{x: number; y: number; w: number; h: number; t0: number; label: string; fill?: number; glow?: number}> = ({x, y, w, h, t0, label, fill = 0, glow = 0}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  const n = Math.floor(fill);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp(p * 1.5)}}>
    {/* cards sticking out the top */}
    {Array.from({length: Math.min(n, 9)}).map((_, i) => <div key={i} style={{position: 'absolute', left: 30 + i * ((w - 120) / 9), top: -40 + (i % 2) * 8, width: (w - 120) / 9 + 30, height: 60, background: CARD, borderTop: `4px solid ${i % 3 === 0 ? RED : i % 3 === 1 ? TEAL : AMBER}`, borderRadius: '6px 6px 0 0', boxShadow: '0 -2px 6px rgba(0,0,0,.12)'}} />)}
    <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: `linear-gradient(180deg, ${WOOD}, ${WOOD2})`, boxShadow: `0 18px 30px rgba(60,35,15,.35), inset 0 2px 0 rgba(255,255,255,.15)${glow ? `, 0 0 ${40 * glow}px ${AMBER}` : ''}`,
      backgroundImage: `repeating-linear-gradient(95deg, rgba(255,255,255,.04) 0 6px, transparent 6px 18px), linear-gradient(180deg, ${WOOD}, ${WOOD2})`}} />
    <div style={{position: 'absolute', left: w / 2 - 150, top: h * 0.2, width: 300, height: 74, borderRadius: 8, background: `linear-gradient(180deg, #E2C37A, ${BRASS})`, padding: 6, boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0,0,0,.35)'}}>
      <div style={{width: '100%', height: '100%', background: CARD, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TYPE, fontWeight: 700, fontSize: 28, color: NAVY, letterSpacing: 2}}>{label}</div>
    </div>
    <div style={{position: 'absolute', left: w / 2 - 70, top: h * 0.2 + 100, width: 140, height: 26, borderRadius: 13, background: `linear-gradient(180deg, #E2C37A, ${BRASS})`, boxShadow: '0 4px 6px rgba(0,0,0,.35)'}} />
  </div>;
};

/** number-vector chip */
export const Vec: React.FC<{t0: number; vals?: number[]; color?: string; size?: number}> = ({t0, vals = [0.12, -0.83, 0.44, 0.07], color = TEAL, size = 26}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  const n = Math.min(vals.length, Math.floor((t - t0) * 10) + 1);
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: `${color}18`, border: `2px solid ${color}`, fontFamily: TYPE, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', transform: `scale(${0.7 + 0.3 * p})`, opacity: clamp(p * 1.5)}}>
    [{vals.slice(0, n).map(v => v.toFixed(2)).join(', ')}{n >= vals.length ? ', …' : ''}]
  </div>;
};

/** ink arrow that draws itself */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; curve?: number; dash?: boolean}> = ({x1, y1, x2, y2, t0, d = 0.4, color = NAVY, sw = 5, curve = 0, dash}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const L = Math.hypot(x2 - x1, y2 - y1) || 1; const mx = (x1 + x2) / 2 - curve * (y2 - y1) / L, my = (y1 + y2) / 2 + curve * (x2 - x1) / L;
  const a = Math.atan2(y2 - my, x2 - mx); const hs = 18;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={dash ? '0.03 0.03' : '1 1'} strokeDashoffset={dash ? -t * 0.2 : 1 - k} opacity={dash ? k : 1} />
    {k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
  </svg>;
};

/** pill label */
export const Tag: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; size?: number; icon?: string}> = ({children, color = NAVY, solid, size = 24, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: solid ? color : `${color}14`, border: `2px solid ${color}`, color: solid ? CARD : color, fontFamily: SANS, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? CARD : color} />}{children}
  </div>
);

/** a PDF page: lines of "text", optional dashed cut lines at given fractions */
export const Page: React.FC<{x: number; y: number; w: number; h: number; t0: number; cuts?: number[]; cutAt?: number; label?: string; lines?: number; hlRows?: [number, number, string][]}> = ({x, y, w, h, t0, cuts = [], cutAt = 1e9, label = 'PDF', lines = 12, hlRows = []}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 14px 28px rgba(70,45,20,.25)', transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp(p * 1.5), overflow: 'hidden'}}>
    <div style={{position: 'absolute', right: 0, top: 0, padding: '6px 12px', background: RED, color: CARD, fontFamily: SANS, fontWeight: 800, fontSize: 20, borderBottomLeftRadius: 8}}>{label}</div>
    {hlRows.map(([a, b, c], i) => <div key={i} style={{position: 'absolute', left: 14, right: 14, top: 40 + a * ((h - 60) / lines), height: (b - a) * ((h - 60) / lines), background: c, borderRadius: 6}} />)}
    {Array.from({length: lines}).map((_, i) => <div key={i} style={{position: 'absolute', left: 26, top: 50 + i * ((h - 60) / lines), height: 8, width: (w - 52) * (i % 4 === 3 ? 0.6 : 0.95 - (i % 3) * 0.08), background: '#D8D2C6', borderRadius: 4}} />)}
    {cuts.map((c, i) => t >= cutAt + i * 0.2 && <div key={i} style={{position: 'absolute', left: 0, top: c * h, width: w * ease(t, cutAt + i * 0.2, 0.35), borderTop: `3px dashed ${RED}`}} />)}
  </div>;
};

/** small heading for the desk */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number}> = ({t0, label, title, size = 72}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.08, 0.45);
  return <div style={{position: 'absolute', left: 60, top: 50, right: 40}}>
    <div style={{fontFamily: TYPE, fontWeight: 700, fontSize: 24, color: RED, letterSpacing: 2, opacity: k1}}>{label}</div>
    <div style={{fontFamily: SERIF, fontSize: size, color: NAVY, lineHeight: 1.1, whiteSpace: 'nowrap', marginTop: 2, opacity: k2, transform: `translateY(${(1 - k2) * 16}px)`}}>{title}</div>
  </div>;
};

// ------------------------------------------------------------------ frame
const Desk: React.FC<{h: number}> = ({h}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: PAPER, overflow: 'hidden'}}>
    <svg width={W} height={h} style={{position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'multiply'}}>
      <filter id="pg"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="9" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0.16 0" /></filter>
      <rect width={W} height={h} filter="url(#pg)" />
    </svg>
    <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 120px rgba(120,80,30,.18)'}} />
  </div>
);

const Captions: React.FC<{data: Data; top: number}> = ({data, top}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.35, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 4px', padding: '0 12px', borderRadius: 8, opacity: shown ? 1 : 0.45, transform: `translateY(${(1 - p) * 8}px) rotate(${active ? -1.5 : 0}deg)`,
          color: active ? NAVY : w.k ? '#FFD9A0' : '#FFFFFF', background: active ? CARD : 'transparent', borderTop: active ? `5px solid ${RED}` : '5px solid transparent',
          textShadow: active ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 16px rgba(0,0,0,.9)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const S = cfg.split; const sc = cfg.camScale ?? 1;
  return <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: S, width: W, height: H - S, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{position: 'absolute', left: (W - W * sc) / 2, top: cfg.camDy - S, width: W * sc, height: H * sc}} />
    </div>
    <Desk h={S} />
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: S, overflow: 'hidden'}}>
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.2, 0.2)}}><El /></AbsoluteFill>;
      })}
    </div>
    {/* brass rail between desk and camera */}
    <div style={{position: 'absolute', left: 0, top: S - 6, width: W, height: 14, background: `linear-gradient(180deg, #E8CB86, ${BRASS} 60%, #8A6420)`, boxShadow: '0 4px 10px rgba(0,0,0,.35)'}} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} top={H - 270} />
  </AbsoluteFill>;
};
