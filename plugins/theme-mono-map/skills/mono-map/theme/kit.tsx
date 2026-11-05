// Theme: MONO MAP. Strict black and white, ride-hailing app look. Three shot types, all hard cuts:
//   talk - the speaker cut out on a black street map (pre-composited talk video, cfg.speaker)
//   clip - full-screen stock footage, graded to black and white, slow push-in
//   page - a white map "bottom sheet" slides up over the shot (rounded top, grab handle) and slides back down at the end
// Pages are a light grey street map with black ink: top-down cars, a square-in-circle pickup pin, hexagon grids
// (pointy-top, axial coords, ring distance), app-style white cards. Inter Tight + JetBrains Mono. No colour accents:
// emphasis is black vs grey, solid vs outline, and strike-through.
// Captions: Inter Tight 800; the spoken word sits on a solid pill (white pill on talk/clip, black pill on pages).
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const INK = '#000000', PAPER = '#FFFFFF', MAP = '#F2F2F2', ROAD = '#E0E0E0', ROAD2 = '#D2D2D2', GREY = '#6E6E6E', SOFT = '#A8A8A8', LIGHT = '#E8E8E8';
export const SANS = 'Inter Tight', MONO = 'JetBrains Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 15, stiffness: 200, mass: 0.7});

export type Cut = {a: number; b: number; m: 'talk' | 'page' | 'clip'; src?: string; from?: number; zoom?: number; pos?: string};
export type Config = {cuts: Cut[]; overlays?: React.FC[]; speaker?: string; capSkip?: number};  // capSkip: no captions before this time (use when an overlay shows the hook line big)

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

/** app-style white card (or black with dark) */
export const Card: React.FC<{x: number; y: number; w: number; h?: number; t0: number; out?: number; children: React.ReactNode; dark?: boolean; style?: React.CSSProperties}> = ({x, y, w, h, t0, out, children, dark, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, background: dark ? INK : PAPER, color: dark ? PAPER : INK,
    boxShadow: '0 18px 44px rgba(0,0,0,.16), 0 2px 6px rgba(0,0,0,.08)', padding: 30, boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * 30}px)`, ...style}}>{children}</div>;
};

/** pill: solid black, or outlined */
export const Tag: React.FC<{children: React.ReactNode; solid?: boolean; size?: number; icon?: string; light?: boolean}> = ({children, solid = true, size = 28, icon, light}) => {
  const fg = light ? INK : PAPER, bg = light ? PAPER : INK;
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 999, background: solid ? bg : 'transparent', border: `2.5px solid ${bg}`, color: solid ? fg : bg, fontFamily: MONO, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? fg : bg} />}{children}
  </div>;
};

/** top-down car marker (like the cars on a ride-hailing map). x,y = centre */
export const Car: React.FC<{x: number; y: number; rot?: number; s?: number; t0?: number; color?: string; dim?: boolean}> = ({x, y, rot = 0, s = 1, t0 = 0, color = INK, dim}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  const c = dim ? SOFT : color;
  return <svg width={60} height={60} style={{position: 'absolute', left: x - 30, top: y - 30, overflow: 'visible', transform: `rotate(${rot}deg) scale(${s * (0.5 + 0.5 * p)})`, opacity: clamp(p * 1.5)}}>
    <rect x={17} y={4} width={26} height={52} rx={9} fill={c} />
    <rect x={20} y={14} width={20} height={11} rx={3} fill={PAPER} opacity={0.85} />
    <rect x={20} y={39} width={20} height={7} rx={2} fill={PAPER} opacity={0.6} />
  </svg>;
};

/** pickup pin: black circle with a white square, pulsing halo */
export const Pin: React.FC<{x: number; y: number; t0: number; r?: number; pulse?: boolean; color?: string}> = ({x, y, t0, r = 26, pulse = true, color = INK}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0) return null; const p = pop(f, t0);
  const ph = ((t - t0) % 1.6) / 1.6; const inv = color === INK ? PAPER : INK;
  return <svg width={10} height={10} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    {pulse && <circle cx={0} cy={0} r={r * (1 + ph * 2.2)} fill="none" stroke={color} strokeWidth={3} opacity={(1 - ph) * 0.5} />}
    <circle cx={0} cy={0} r={r * p} fill={color} />
    <rect x={-r * 0.32 * p} y={-r * 0.32 * p} width={r * 0.64 * p} height={r * 0.64 * p} fill={inv} />
  </svg>;
};

/** line that draws itself; dashed while `flow` */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; color?: string; d?: number; head?: boolean; flow?: [number, number]; sw?: number; dash?: boolean; op?: number}> = ({x1, y1, x2, y2, t0, color = INK, d = 0.4, head = false, flow, sw = 3, dash, op = 1}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const a = Math.atan2(y2 - y1, x2 - x1); const hs = 16;
  const on = flow && t >= flow[0] && t <= flow[1];
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', opacity: op}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={on || dash ? '10 10' : undefined} strokeDashoffset={on ? -t * 90 : 0} />
    {head && k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.45)} ${y2 - hs * Math.sin(a - 0.45)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.45)} ${y2 - hs * Math.sin(a + 0.45)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
  </svg>;
};

/** polyline route that draws itself (pts in page px) */
export const Route: React.FC<{pts: [number, number][]; t0: number; d?: number; color?: string; sw?: number}> = ({pts, t0, d = 0.8, color = INK, sw = 8}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const path = 'M ' + pts.map(p => p.join(' ')).join(' L ');
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <path d={path} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
  </svg>;
};

// ------------------------------------------------------------------ hexagons (pointy-top, axial q,r)
export const hexXY = (q: number, r: number, s: number) => [s * Math.sqrt(3) * (q + r / 2), s * 1.5 * r];
export const hexDist = (q: number, r: number) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
export const hexPath = (cx: number, cy: number, s: number) => Array.from({length: 6}, (_, i) => { const a = Math.PI / 180 * (60 * i - 30); return `${i ? 'L' : 'M'} ${cx + s * Math.cos(a)} ${cy + s * Math.sin(a)}`; }).join(' ') + ' Z';
export type HexStyle = {fill?: string; stroke?: string; sw?: number; op?: number} | null;
/** hex grid of `rings` rings around (cx,cy). Cells draw in by distance from the centre starting at t0.
 *  style(q,r,d,t) returns fill/stroke overrides per cell; clip = [x0,y0,x1,y1] keeps only cells whose centre is inside. */
export const HexGrid: React.FC<{cx: number; cy: number; s: number; rings: number; t0: number; stagger?: number; style?: (q: number, r: number, d: number, t: number) => HexStyle; stroke?: string; clip?: [number, number, number, number]}> = ({cx, cy, s, rings, t0, stagger = 0.06, style, stroke = SOFT, clip}) => {
  const t = useT(); if (t < t0) return null;
  const cells: JSX.Element[] = [];
  for (let q = -rings; q <= rings; q++) for (let r = -rings; r <= rings; r++) {
    const d = hexDist(q, r); if (d > rings) continue;
    const [dx, dy] = hexXY(q, r, s); const x = cx + dx, y = cy + dy;
    if (clip && (x < clip[0] || x > clip[2] || y < clip[1] || y > clip[3])) continue;
    const k = ease(t, t0 + d * stagger, 0.3); if (k <= 0) continue;
    const st = style ? style(q, r, d, t) : null;
    cells.push(<path key={`${q},${r}`} d={hexPath(x, y, s * (0.9 + 0.1 * k) - 1.5)} fill={st?.fill || 'transparent'} stroke={st?.stroke || stroke} strokeWidth={st?.sw || 2.5} opacity={k * (st?.op ?? 1)} />);
  }
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{cells}</svg>;
};

/** page heading: mono label chip + title (keep it to one line) */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number; light?: boolean}> = ({t0, label, title, size = 80, light}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.1, 0.45);
  return <div style={{position: 'absolute', left: 80, top: 150, right: 60}}>
    <div style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 24, color: light ? INK : PAPER, background: light ? PAPER : INK, padding: '6px 14px', borderRadius: 8, letterSpacing: 2, opacity: k1}}>{label}</div>
    <div style={{overflow: 'hidden', marginTop: 14}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: light ? PAPER : INK, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: -1.5, transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div>
    </div>
  </div>;
};

// ------------------------------------------------------------------ street map background
const rnd = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
export const Streets: React.FC<{dark?: boolean; seed?: number}> = ({dark, seed = 7}) => {
  const R = rnd(seed); const minor: string[] = [];
  for (let i = 0; i < 16; i++) { const x = -100 + i * 85 + R() * 30; minor.push(`M ${x} -50 L ${x + 160 + R() * 60} ${H + 50}`); }
  for (let i = 0; i < 24; i++) { const y = -60 + i * 90 + R() * 30; minor.push(`M -50 ${y} L ${W + 50} ${y - 120 - R() * 50}`); }
  const c1 = dark ? '#161616' : ROAD, c2 = dark ? '#222' : ROAD2;
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <rect width={W} height={H} fill={dark ? '#050505' : MAP} />
    {minor.map((d, i) => <path key={i} d={d} stroke={c1} strokeWidth={i % 5 === 0 ? 9 : 4} fill="none" />)}
    <path d={`M -50 ${H * 0.3} C 400 ${H * 0.26}, 700 ${H * 0.4}, ${W + 50} ${H * 0.33}`} stroke={c2} strokeWidth={22} fill="none" />
    <path d={`M ${W * 0.3} -50 C ${W * 0.36} ${H * 0.4}, ${W * 0.2} ${H * 0.7}, ${W * 0.42} ${H + 50}`} stroke={c2} strokeWidth={18} fill="none" />
  </svg>;
};
/** background still for the cut-out speaker (render it once, flatten speaker.webm over it with ffmpeg) */
export const TalkBg: React.FC = () => <AbsoluteFill><Streets dark /><AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 25%, rgba(0,0,0,.8) 100%)'}} /></AbsoluteFill>;

// ------------------------------------------------------------------ frame
const pageAmt = (t: number, cfg: Config) => {
  for (const c of cfg.cuts) if (c.m === 'page' && t >= c.a - 0.001 && t < c.b) {
    const kin = Easing.out(Easing.cubic)(clamp((t - c.a) / 0.42)); const kout = Easing.in(Easing.cubic)(clamp((t - (c.b - 0.3)) / 0.3));
    return kin * (1 - kout);
  }
  return 0;
};

const Captions: React.FC<{data: Data; mode: 'talk' | 'page' | 'clip'}> = ({data, mode}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const onPage = mode === 'page';
  return <div style={{position: 'absolute', left: 0, right: 0, top: onPage ? 1610 : mode === 'talk' ? 1530 : 1480, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.34, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        const fg = onPage ? INK : PAPER, pill = onPage ? INK : PAPER, onPill = onPage ? PAPER : INK;
        return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 12px', borderRadius: 12, opacity: shown ? 1 : 0.35, transform: `translateY(${(1 - p) * 8}px)`,
          color: active ? onPill : fg, background: active ? pill : 'transparent',
          textShadow: active || onPage ? 'none' : '0 0 4px #000, 0 3px 0 #000, 0 0 18px rgba(0,0,0,.95)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

const Clip: React.FC<{c: Cut}> = ({c}) => {
  const t = useT(); const k = clamp((t - c.a) / (c.b - c.a)); const z = (c.zoom ?? 1.0) + 0.08 * k;
  return <AbsoluteFill style={{overflow: 'hidden', background: INK}}>
    <Sequence from={Math.round(c.a * FPS)} durationInFrames={Math.round((c.b - c.a) * FPS) + 2} layout="none">
      <OffthreadVideo src={staticFile(c.src!)} startFrom={Math.round((c.from || 0) * FPS)} muted
        style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', objectPosition: c.pos || 'center', transform: `scale(${z})`, filter: 'grayscale(1) contrast(1.15) brightness(.92)'}} />
    </Sequence>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, transparent 26%, transparent 60%, rgba(0,0,0,.72) 100%)'}} />
  </AbsoluteFill>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = pageAmt(t, cfg); const c = cfg.cuts.find(x => t >= x.a && t < x.b);
  const y = (1 - k) * H; const rad = 56 * (1 - k);
  return <AbsoluteFill style={{background: INK}}>
    <OffthreadVideo src={staticFile(cfg.speaker || 'src.mp4')} muted style={{width: W, height: H}} />
    {cfg.cuts.filter(x => x.m === 'clip').map((x, i) => (t >= x.a - 0.05 && t < x.b) ? <Clip key={i} c={x} /> : null)}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    {k > 0.001 && <div style={{position: 'absolute', left: 0, top: y, width: W, height: H, overflow: 'hidden', borderTopLeftRadius: rad, borderTopRightRadius: rad, boxShadow: '0 -20px 60px rgba(0,0,0,.5)'}}>
      <Streets />
      <AbsoluteFill style={{background: 'rgba(255,255,255,.35)'}} />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.16, 0.16)}}><El /></AbsoluteFill>;
      })}
      {k < 0.999 && <div style={{position: 'absolute', left: W / 2 - 60, top: 18, width: 120, height: 10, borderRadius: 5, background: SOFT}} />}
    </div>}
    {t >= (cfg.capSkip || 0) && <Captions data={data} mode={k > 0.5 ? 'page' : (c && c.m === 'clip' ? 'clip' : 'talk')} />}
  </AbsoluteFill>;
};
