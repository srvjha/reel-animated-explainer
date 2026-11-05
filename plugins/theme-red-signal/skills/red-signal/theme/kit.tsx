// Theme: RED SIGNAL. Streaming-player look in red and black. No speaker needed (works for voice-over reels):
//   clip - full-screen stock footage, darkened with a red-black grade and a slow push-in
//   page - near-black canvas with a red dot grid; a slanted red ribbon sweeps left to right and reveals the page
// Pages are built from player parts: a video Player (blur, progress, buffer, quality badge), signal bars, chunk blocks
// shaded by quality (dark red = low, bright red = 4K), dark cards, red pills. Bebas Neue titles, Inter body, JetBrains Mono labels.
// Captions: Inter 800 white; the spoken word sits on a red pill.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const BG = '#09090A', CARD = '#141416', EDGE = '#2A2A2F', RED = '#E50914', DEEP = '#8A0B12', WHITE = '#F5F5F1', MUTED = '#9A9AA2', DIM = '#55555C';
export const DISPLAY = 'Bebas Neue', SANS = 'Inter', MONO = 'JetBrains Mono';
export const W = 1080, H = 1920;
/** quality ladder shades: low = dark red, high = bright */
export const QC: Record<string, string> = {'240p': '#4A0D11', '480p': '#7A1017', '720p': '#B0101C', '1080p': '#E50914', '4K': '#FF5A60'};
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 15, stiffness: 200, mass: 0.7});

export type Cut = {a: number; b: number; m: 'page' | 'clip' | 'talk'; src?: string; from?: number; zoom?: number; pos?: string};
export type Config = {cuts: Cut[]; overlays?: React.FC[]; speaker?: string; capSkip?: number};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = WHITE, style}) => {
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
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = WHITE, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);
export const Card: React.FC<{x: number; y: number; w: number; h?: number; t0: number; out?: number; children: React.ReactNode; hot?: boolean; style?: React.CSSProperties}> = ({x, y, w, h, t0, out, children, hot, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, background: hot ? RED : CARD, border: `2px solid ${hot ? RED : EDGE}`,
    boxShadow: hot ? `0 20px 60px ${RED}55` : '0 20px 50px rgba(0,0,0,.6)', padding: 28, boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * 30}px)`, ...style}}>{children}</div>;
};
export const Tag: React.FC<{children: React.ReactNode; solid?: boolean; size?: number; icon?: string; color?: string}> = ({children, solid = true, size = 28, icon, color = RED}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 999, background: solid ? color : 'rgba(0,0,0,.35)', border: `2.5px solid ${color}`, color: WHITE, fontFamily: MONO, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={WHITE} />}{children}
  </div>
);
/** quality badge like a player's (240p ... 4K) */
export const QBadge: React.FC<{q: string; size?: number; style?: React.CSSProperties}> = ({q, size = 34, style}) => (
  <div style={{display: 'inline-block', padding: '4px 14px', borderRadius: 8, background: QC[q] || RED, color: WHITE, fontFamily: MONO, fontWeight: 700, fontSize: size, ...style}}>{q}</div>
);
/** signal bars, level 0..4 */
export const Signal: React.FC<{level: number; size?: number}> = ({level, size = 60}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: size * 0.1, height: size}}>
    {[0, 1, 2, 3].map(i => <div key={i} style={{width: size * 0.17, height: size * (0.3 + i * 0.23), borderRadius: 4, background: i < level ? WHITE : DIM}} />)}
  </div>
);
/** one chunk block shaded by quality */
export const Chunk: React.FC<{q: string; w?: number; h?: number; label?: string; t0?: number; style?: React.CSSProperties}> = ({q, w = 120, h = 90, label, t0 = 0, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{width: w, height: h, borderRadius: 12, background: QC[q] || RED, border: '2px solid rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), flexShrink: 0, ...style}}>
    <span style={{fontFamily: MONO, fontWeight: 700, fontSize: Math.min(28, w / 4.2), color: WHITE}}>{label ?? q}</span>
  </div>;
};
/** mock video player: still frame with blur, progress (played red, buffered grey), quality badge */
export const Player: React.FC<{x: number; y: number; w: number; img: string; blur?: number; played?: number; buffered?: number; badge?: string; t0: number; spin?: boolean}> = ({x, y, w, img, blur = 0, played = 0.2, buffered = 0.4, badge, t0, spin}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4); const h = w * 9 / 16;
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `scale(${0.94 + 0.06 * k})`}}>
    <div style={{position: 'relative', width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#000', border: `2px solid ${EDGE}`, boxShadow: '0 30px 70px rgba(0,0,0,.7)'}}>
      <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px)`, transform: `scale(${1 + blur * 0.01})`}} />
      {badge && <div style={{position: 'absolute', right: 18, top: 16}}><QBadge q={badge} size={30} /></div>}
      {spin && <div style={{position: 'absolute', left: w / 2 - 40, top: h / 2 - 40, width: 80, height: 80, borderRadius: 40, border: `8px solid rgba(255,255,255,.2)`, borderTopColor: RED, transform: `rotate(${t * 400}deg)`}} />}
    </div>
    <div style={{position: 'relative', height: 10, borderRadius: 5, background: '#2B2B30', marginTop: 18}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, borderRadius: 5, width: `${buffered * 100}%`, background: '#77777F'}} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, borderRadius: 5, width: `${played * 100}%`, background: RED}} />
      <div style={{position: 'absolute', left: `calc(${played * 100}% - 12px)`, top: -7, width: 24, height: 24, borderRadius: 12, background: RED}} />
    </div>
  </div>;
};
/** page heading: red mono label + Bebas title (one line) */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number}> = ({t0, label, title, size = 120}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.08, 0.45);
  return <div style={{position: 'absolute', left: 80, top: 150, right: 60}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: k1}}>
      <div style={{width: 44, height: 6, background: RED, borderRadius: 3}} />
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: RED, letterSpacing: 3}}>{label}</div>
    </div>
    <div style={{overflow: 'hidden', marginTop: 6}}>
      <div style={{fontFamily: DISPLAY, fontSize: size, color: WHITE, lineHeight: 1.0, whiteSpace: 'nowrap', letterSpacing: 1, transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div>
    </div>
  </div>;
};

// ------------------------------------------------------------------ backgrounds
export const Dots: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(#4A1216 2.2px, transparent 2.8px)`, backgroundSize: '34px 34px', backgroundPosition: '17px 17px'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% -10%, ${RED}33 0%, transparent 55%)`}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,.95)'}} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ frame
const Captions: React.FC<{data: Data; onPage: boolean}> = ({data, onPage}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1600 : 1480, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.36, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 12px', borderRadius: 12, opacity: shown ? 1 : 0.35, transform: `translateY(${(1 - p) * 8}px)`,
          color: WHITE, background: active ? RED : 'transparent', textShadow: active ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 18px rgba(0,0,0,.95)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

const Clip: React.FC<{c: Cut}> = ({c}) => {
  const t = useT(); const k = clamp((t - c.a) / (c.b - c.a)); const z = (c.zoom ?? 1.0) + 0.07 * k;
  return <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
    <Sequence from={Math.round(c.a * FPS)} durationInFrames={Math.round((c.b - c.a) * FPS) + 2} layout="none">
      <OffthreadVideo src={staticFile(c.src!)} startFrom={Math.round((c.from || 0) * FPS)} muted
        style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', objectPosition: c.pos || 'center', transform: `scale(${z})`, filter: 'contrast(1.12) saturate(.75) brightness(.82)'}} />
    </Sequence>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 25%, transparent 58%, rgba(20,0,2,.85) 100%)`}} />
    <AbsoluteFill style={{background: `${RED}`, mixBlendMode: 'multiply', opacity: 0.12}} />
  </AbsoluteFill>;
};

/** slanted red ribbon sweeping left to right at the start of every page cut */
const Ribbon: React.FC<{k: number}> = ({k}) => {
  const x = lerp(-700, W + 300, k);
  return <div style={{position: 'absolute', left: x - 420, top: -200, width: 420, height: H + 400, background: `linear-gradient(90deg, ${DEEP}, ${RED} 60%, #FF2A33)`, transform: 'skewX(-14deg)', boxShadow: `0 0 80px ${RED}`}} />;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const c = cfg.cuts.find(x => t >= x.a && t < x.b);
  const onPage = !!c && c.m === 'page';
  const kin = onPage ? Easing.inOut(Easing.cubic)(clamp((t - c!.a) / 0.5)) : 1;
  const edge = lerp(-700, W + 300, kin) - 420 + 120;   // reveal follows the ribbon
  return <AbsoluteFill style={{background: '#000'}}>
    {cfg.speaker && <OffthreadVideo src={staticFile(cfg.speaker)} muted style={{width: W, height: H}} />}
    {cfg.cuts.filter(x => x.m === 'clip').map((x, i) => (t >= x.a - 0.05 && t < x.b + 0.55) ? <Clip key={i} c={x} /> : null)}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    {onPage && <AbsoluteFill style={{clipPath: kin < 1 ? `polygon(0 0, ${edge + 240}px 0, ${edge - 240}px ${H}px, 0 ${H}px)` : undefined}}>
      <Dots />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.12, 0.12)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {onPage && kin < 1 && <Ribbon k={kin} />}
    {t >= (cfg.capSkip || 0) && <Captions data={data} onPage={onPage} />}
  </AbsoluteFill>;
};
