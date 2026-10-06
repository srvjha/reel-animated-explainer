// Theme: PIP GRID. Pure black with a fine engineering grid; the diagrams own the whole frame.
// The speaker lives in a round picture-in-picture bubble (story-ring style) from the first frame.
// Scenes reveal through the grid cell by cell. Captions: white words, the spoken word fills with
// a pink-to-orange gradient wipe.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/800.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const BG = '#050505', PANEL = '#111214', LINE = '#2A2C30', WHITE = '#F5F5F5', GREY = '#8B8D93';
export const PINK = '#FF3D7F', ORANGE = '#FF7A2F', YELLOW = '#FFC93C', GREEN = '#3DDC97', RED = '#FF4D4D', CYAN = '#38D3F5';
export const GRAD = `linear-gradient(90deg, ${PINK}, ${ORANGE})`;
export const HEAD = 'Space Grotesk', SANS = 'Geist Sans', MONO = 'Geist Mono';
/** scene canvas: full frame width, y 170..1470 (the PiP bubble sits top-right, keep x>700,y<330 clear) */
export const STAGE = {x: 0, y: 170, w: 1080, h: 1300};
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 13, stiffness: 200, mass: 0.7});

export type Config = {
  title: string;                         // one line, <= ~30 chars at 46 px
  icon?: string;                         // file in public/ shown left of the title (official logo, never redrawn)
  pip: {cx: number; cy: number; r: number};  // source-video circle to show in the bubble (face + mic)
  pipFocus?: [number, number][];         // windows where the bubble grows (hook, punchlines)
  full?: [number, number][];             // windows where the speaker fills the whole frame (e.g. the opening hook)
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

/** pill chip with a gradient (or solid) border */
export const Chip: React.FC<{color?: string; size?: number; fill?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({color, size = 28, fill, children, style}) => (
  <span style={{display: 'inline-block', padding: 3, borderRadius: 999, background: color ?? GRAD, ...style}}>
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999, background: fill ? 'transparent' : BG, padding: '8px 22px', fontFamily: MONO, fontWeight: 700, fontSize: size, color: fill ? BG : WHITE, whiteSpace: 'nowrap'}}>{children}</span>
  </span>
);

/** kicker + headline at the top-left of a scene (stays left of the PiP bubble) */
export const Header: React.FC<{t0: number; t1?: number; kicker: string; title: string; color?: string}> = ({t0, t1, kicker, title, color = PINK}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 48, top: 28}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color, letterSpacing: '.18em'}}>{kicker}</div>
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 56, color: WHITE, lineHeight: 1.08, whiteSpace: 'nowrap', marginTop: 6}}>{title}</div>
  </Appear>
);

/** gradient text */
export const GradText: React.FC<{size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 64, children, style}) => (
  <span style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** rounded panel */
export const Panel: React.FC<{w: number; h: number; border?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, border = LINE, children, style}) => (
  <div style={{width: w, height: h, background: PANEL, border: `3px solid ${border}`, borderRadius: 22, position: 'relative', overflow: 'hidden', ...style}}>{children}</div>
);

/** file icon with a folded corner */
export const FileIcon: React.FC<{w?: number; label?: string; sub?: string; color?: string}> = ({w = 160, label, sub, color = PINK}) => {
  const h = w * 1.25; const c = w * 0.28;
  return <div style={{width: w, textAlign: 'center'}}>
    <svg width={w} height={h}>
      <path d={`M4 4 H${w - c} L${w - 4} ${c} V${h - 4} H4 Z`} fill={PANEL} stroke={color} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${w - c} 4 V${c} H${w - 4}`} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />
      <polygon points={`${w * 0.38},${h * 0.42} ${w * 0.38},${h * 0.72} ${w * 0.66},${h * 0.57}`} fill={color} />
    </svg>
    {label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: WHITE, marginTop: 8, whiteSpace: 'nowrap'}}>{label}</div>}
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, color: GREY, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};

/** phone mockup; children render on its screen */
export const Phone: React.FC<{w?: number; h?: number; children?: React.ReactNode}> = ({w = 300, h = 560, children}) => (
  <div style={{width: w, height: h, borderRadius: 46, background: '#000', border: `6px solid #3a3c42`, boxShadow: `0 0 0 3px #17181b, 0 30px 60px rgba(0,0,0,.6)`, position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: '50%', top: 12, width: 90, height: 24, marginLeft: -45, borderRadius: 14, background: '#17181b'}} />
    <div style={{position: 'absolute', inset: '48px 14px 18px'}}>{children}</div>
  </div>
);

/** server / backend box */
export const Server: React.FC<{w?: number; label?: string; color?: string; hot?: boolean}> = ({w = 220, label, color = CYAN, hot}) => {
  const t = useT();
  return <div style={{width: w, textAlign: 'center'}}>
    {[0, 1, 2].map(i => <div key={i} style={{height: w * 0.2, margin: '8px 0', background: PANEL, border: `3px solid ${hot ? RED : color}`, borderRadius: 10, position: 'relative'}}>
      {[0, 1].map(j => <div key={j} style={{position: 'absolute', right: 14 + j * 22, top: '50%', marginTop: -6, width: 12, height: 12, borderRadius: 6, background: (Math.floor(t * 6) + i + j) % 3 ? color : '#1d1f23'}} />)}
      <div style={{position: 'absolute', left: 14, top: '50%', marginTop: -3, width: w * 0.35, height: 6, borderRadius: 3, background: LINE}} />
    </div>)}
    {label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: WHITE, marginTop: 6, whiteSpace: 'nowrap'}}>{label}</div>}
  </div>;
};

/** object storage bucket */
export const Bucket: React.FC<{w?: number; label?: string; fill?: number; color?: string}> = ({w = 240, label, fill = 0, color = YELLOW}) => {
  const h = w * 0.95;
  return <div style={{width: w, textAlign: 'center'}}>
    <svg width={w} height={h}>
      <defs><clipPath id={`bk${w}`}><path d={`M8 ${h * 0.14} L${w * 0.14} ${h - 6} H${w * 0.86} L${w - 8} ${h * 0.14} Z`} /></clipPath></defs>
      <g clipPath={`url(#bk${w})`}><rect x={0} y={h - 6 - (h * 0.86) * clamp(fill)} width={w} height={h} fill={color} opacity={0.85} /></g>
      <path d={`M8 ${h * 0.14} L${w * 0.14} ${h - 6} H${w * 0.86} L${w - 8} ${h * 0.14}`} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={w / 2} cy={h * 0.14} rx={w / 2 - 8} ry={h * 0.09} fill={BG} stroke={color} strokeWidth={6} />
    </svg>
    {label && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: WHITE, marginTop: 6, whiteSpace: 'nowrap'}}>{label}</div>}
  </div>;
};

/** horizontal progress bar */
export const Progress: React.FC<{v: number; w?: number; h?: number; color?: string; label?: string; fail?: boolean}> = ({v, w = 600, h = 30, color, label, fail}) => (
  <div style={{width: w}}>
    {label && <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 22, color: fail ? RED : GREY, marginBottom: 8}}><span>{label}</span><span>{Math.round(clamp(v) * 100)}%</span></div>}
    <div style={{height: h, borderRadius: h, background: '#1a1b1e', border: `2px solid ${fail ? RED : LINE}`, overflow: 'hidden'}}>
      <div style={{width: `${clamp(v) * 100}%`, height: '100%', borderRadius: h, background: fail ? RED : color ?? GRAD}} />
    </div>
  </div>
);

export type ChunkState = 'idle' | 'up' | 'done' | 'fail';
/** one chunk tile */
export const Chunk: React.FC<{n: string | number; s: ChunkState; size?: number}> = ({n, s, size = 92}) => {
  const t = useT();
  const bg = s === 'done' ? GREEN : s === 'fail' ? RED : s === 'up' ? ORANGE : PANEL;
  const pulse = s === 'up' ? 0.75 + 0.25 * Math.sin(t * 12) : 1;
  return <div style={{width: size, height: size, borderRadius: 14, background: bg, opacity: pulse, border: `3px solid ${s === 'idle' ? LINE : bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: size * 0.3, color: s === 'idle' ? GREY : BG}}>{s === 'done' ? '✓' : s === 'fail' ? '✕' : n}</div>;
};

/** dashed line with dots flowing from (x1,y1) to (x2,y2), in stage coordinates */
export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; stop?: boolean}> = ({x1, y1, x2, y2, t0, t1 = 999, color = PINK, n = 4, speed = 0.9, stop}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.45); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={STAGE.w} height={STAGE.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={LINE} strokeWidth={5} strokeDasharray="10 10" strokeLinecap="round" />
    {!stop && k > 0.95 && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <circle key={i} cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={9} fill={color} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)} />; })}
  </svg>;
};

// ------------------------------------------------------------------ frame
const Grid: React.FC = () => {
  const t = useT();
  return <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: `0 ${(t * 6) % 60}px`}} />
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '300px 300px', backgroundPosition: `0 ${(t * 6) % 300}px`}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 40%, rgba(0,0,0,.85) 100%)'}} />
  </AbsoluteFill>;
};

const TitleBar: React.FC<{cfg: Config}> = ({cfg}) => {
  const f = useCurrentFrame(); const p = pop(f, 0.1);
  return <div style={{position: 'absolute', left: 40, top: 54, display: 'flex', alignItems: 'center', gap: 18, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * -30}px)`}}>
    {cfg.icon && <Img src={staticFile(cfg.icon)} style={{width: 64, height: 64, borderRadius: 16}} />}
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 46, color: WHITE, whiteSpace: 'nowrap', letterSpacing: '-.01em'}}>{cfg.title}</div>
  </div>;
};

const focusAmt = (t: number, cfg: Config) => { let d = 0; for (const [a, b] of cfg.pipFocus || []) d = Math.max(d, (a <= 0.01 ? 1 : ease(t, a - 0.2, 0.45)) * (1 - ease(t, b - 0.2, 0.45))); return d; };

const fullAmt = (t: number, cfg: Config) => { let d = 0; for (const [a, b] of cfg.full || []) d = Math.max(d, (a <= 0.01 ? 1 : ease(t, a - 0.25, 0.5)) * (1 - Easing.inOut(Easing.cubic)(clamp((t - b + 0.3) / 0.6)))); return d; };

/** round PiP bubble with a gradient story ring; grows during pipFocus windows, morphs to full frame during `full` */
const Pip: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT(); const k = Easing.inOut(Easing.cubic)(focusAmt(t, cfg)); const F = fullAmt(t, cfg);
  const D = lerp(300, 620, k); const cx = lerp(880, 540, k), cy = lerp(330, 760, k);
  const {cx: sx, cy: sy, r} = cfg.pip; const s = (D / 2) / r;
  const ring = 9 * (1 - F), gap = 6 * (1 - F);
  // bubble rect -> full frame rect
  const bx = cx - D / 2, by = cy - D / 2;
  const x = lerp(bx, 0, F), y = lerp(by, 0, F), w = lerp(D, 1080, F), h = lerp(D, 1920, F);
  const vs = lerp(s, 1, F), vx = lerp(D / 2 - sx * s, 0, F), vy = lerp(D / 2 - sy * s, 0, F);
  return <div style={{position: 'absolute', left: x - ring - gap, top: y - ring - gap, width: w + 2 * (ring + gap), height: h + 2 * (ring + gap), borderRadius: lerp(D, 0, F), background: F > 0.98 ? 'transparent' : `conic-gradient(from ${t * 40}deg, ${YELLOW}, ${ORANGE}, ${PINK}, ${ORANGE}, ${YELLOW})`, padding: ring, boxShadow: F > 0.98 ? undefined : '0 20px 60px rgba(0,0,0,.7)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: lerp(D, 0, F), background: BG, padding: gap}}>
      <div style={{width: w, height: h, borderRadius: lerp(D / 2, 0, F), overflow: 'hidden', position: 'relative'}}>
        <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * vs, height: 1920 * vs}}>
          <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
        </div>
        {F > 0.01 && <div style={{position: 'absolute', inset: 0, opacity: F, background: 'linear-gradient(rgba(0,0,0,.55), transparent 16%, transparent 70%, rgba(0,0,0,.6))'}} />}
      </div>
    </div>
  </div>;
};

/** stage: scenes reveal through the grid, cell by cell */
const Stage: React.FC<{scenes: Scene[]}> = ({scenes}) => {
  const t = useT();
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  const C = 60, cols = Math.ceil(STAGE.w / C), rows = Math.ceil(STAGE.h / C);
  return <div style={{position: 'absolute', left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h}}>
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
      const El = s.el; const pin = (t - s.a + 0.05) / 0.5; const pout = (t - s.b + 0.05) / 0.3;
      const out = clamp(1 - pout);
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: out}}>
        <El />
        {pin < 1 && <div style={{position: 'absolute', inset: 0}}>
          {Array.from({length: cols * rows}).map((_, q) => {
            const cx = q % cols, cy = Math.floor(q / cols);
            const d = (cy / rows) * 0.6 + ((cx * 37 + cy * 61) % 17) / 17 * 0.4;      // top-down with jitter
            const v = clamp((pin - d * 0.7) / 0.3);
            if (v >= 1) return null;
            return <div key={q} style={{position: 'absolute', left: cx * C, top: cy * C, width: C, height: C, background: BG, opacity: 1 - v, border: v > 0 ? `1px solid ${PINK}` : undefined}} />;
          })}
        </div>}
      </div>;
    })}
  </div>;
};

/** captions: white words appear as spoken; the current word fills with a pink-orange wipe */
const Captions: React.FC<{data: Data}> = ({data}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 30, right: 30, top: 1490, textAlign: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.25, whiteSpace: 'nowrap', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.9))'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        const wipe = clamp((t - w.t + 0.03) / Math.max(0.12, Math.min(0.5, w.e - w.t)));
        const base: React.CSSProperties = {display: 'inline-block', margin: '0 8px', opacity: shown ? 1 : 0, transform: `translateY(${(1 - p) * 14}px)`, position: 'relative'};
        if (active || w.k) return <span key={j} style={{...base, color: 'transparent', backgroundImage: `linear-gradient(90deg, ${PINK}, ${ORANGE} ${wipe * 100}%, ${WHITE} ${wipe * 100}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text'}}>{w.w}
          {active && <span style={{position: 'absolute', left: 0, bottom: -2, height: 6, width: `${wipe * 100}%`, borderRadius: 3, background: GRAD}} />}</span>;
        return <span key={j} style={{...base, color: WHITE}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => (
  <AbsoluteFill style={{background: BG}}>
    <Grid />
    <Stage scenes={scenes} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Pip cfg={cfg} />
    <TitleBar cfg={cfg} />
    <Captions data={data} />
  </AbsoluteFill>
);
