// Theme: FESTIVE OPS. Light grey blueprint canvas, sale orange + app blue accents, slate ink.
//   talk - the speaker full screen (intro hook, punchlines); overlays live in the band y 980 to 1560, captions sit in a slate pill below
//   card - white card with an orange top stripe plays the diagram scenes; the speaker sits in a framed window below,
//          scaled so the whole band from hair to mic is visible (never cropped)
//   full - same card stretched to 1000 x 1530, speaker window slides away (when the camera shot is unusable)
// Captions look like a notification toast: slate pill, white words, the spoken word turns orange.
// Icons: SVGs in public/icons/ (lucide-static, simple-icons), drawn tinted with <Icon name="bell" color={ORANGE} />.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/sora/600.css';
import '@fontsource/sora/800.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const CANVAS = '#E8ECF0', GRID = '#D4DBE3', CARD = '#FFFFFF', PANEL = '#F4F6F8', LINE = '#D6DDE4';
export const INK = '#1C2733', SUB = '#5D6B79', ORANGE = '#FF9900', DEEPOR = '#E47911', BLUE = '#0F7CC4', SKY = '#00A8E1';
export const GREEN = '#1E9E5A', RED = '#E5484D';
export const DISPLAY = 'Sora', SANS = 'DM Sans', MONO = 'JetBrains Mono';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});
/** scene box inside the card */
export const CARD_W = 1000, CARD_H = 840;
/** scene box in 'full' mode */
export const FULL_H = 1530;

export type Config = {
  title: string;                                    // one line; shown in the header next to the logo
  logo?: string;                                    // official logo in public/ (never redrawn), shown inline left of the title
  modes: {a: number; b: number; m: 'talk' | 'card' | 'full'}[];
  face: {y0: number; y1: number};                   // source rows (1080x1920) from hair top to mic, shown whole in the window
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

export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = INK, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', ...style}} />;
};

/** labelled node: icon in a white tile with a soft shadow; hot = orange ring, cool = blue ring */
export const Node: React.FC<{icon: string; label: string; sub?: string; w?: number; color?: string; hot?: boolean; cool?: boolean; dim?: boolean; bad?: boolean}> = ({icon, label, sub, w = 220, color = INK, hot, cool, dim, bad}) => {
  const ring = bad ? RED : hot ? ORANGE : cool ? BLUE : LINE;
  return <div style={{width: w, padding: '20px 12px 16px', borderRadius: 22, background: CARD, border: `3px solid ${ring}`, boxShadow: hot || cool || bad ? `0 10px 30px ${ring}40` : '0 10px 24px rgba(28,39,51,.10)', textAlign: 'center', opacity: dim ? 0.35 : 1, boxSizing: 'border-box'}}>
    <div style={{display: 'flex', justifyContent: 'center'}}><Icon name={icon} size={w * 0.3} color={bad ? RED : hot ? DEEPOR : cool ? BLUE : color} /></div>
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: INK, marginTop: 10, whiteSpace: 'nowrap'}}>{label}</div>
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 18, color: SUB, marginTop: 4, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};

export const Tag: React.FC<{color?: string; solid?: boolean; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = DEEPOR, solid, size = 24, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: size, color: solid ? '#fff' : color, background: solid ? color : CARD, border: `2px solid ${color}`, borderRadius: 999, padding: '6px 18px', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** headline with an orange kicker */
export const Heading: React.FC<{t0: number; t1?: number; kicker: string; title: string}> = ({t0, t1, kicker, title}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 36, top: 30}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: DEEPOR, letterSpacing: '.16em'}}>{kicker}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: INK, lineHeight: 1.1, whiteSpace: 'nowrap', marginTop: 4}}>{title}</div>
  </Appear>
);

/** dotted flow line with moving packets (card coords) */
export const Flow: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; t1?: number; color?: string; n?: number; speed?: number; w?: number; h?: number}> = ({x1, y1, x2, y2, t0, t1 = 999, color = ORANGE, n = 4, speed = 1, w = 4, h = FULL_H}) => {
  const t = useT(); if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const k = ease(t, t0, 0.45); const op = clamp((t1 + 0.25 - t) / 0.25);
  return <svg width={CARD_W} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op, pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={GRID} strokeWidth={w} strokeDasharray="10 10" strokeLinecap="round" />
    {k > 0.95 && Array.from({length: n}).map((_, i) => { const ph = ((t - t0) * speed + i / n) % 1;
      return <circle key={i} cx={lerp(x1, x2, ph)} cy={lerp(y1, y2, ph)} r={8} fill={color} opacity={clamp(ph * 6) * clamp((1 - ph) * 6)} />; })}
  </svg>;
};

export const Count: React.FC<{t0: number; to: number; d?: number; fmt?: (n: number) => string; size?: number; color?: string}> = ({t0, to, d = 1.2, fmt = n => Math.round(n).toLocaleString('en-IN'), size = 110, color = INK}) => {
  const t = useT(); return <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, lineHeight: 1}}>{fmt(to * ease(t, t0, d))}</span>;
};

export const Meter: React.FC<{v: number; w?: number; label?: string; color?: string}> = ({v, w = 600, label, color = ORANGE}) => (
  <div style={{width: w}}>
    {label && <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 20, color: SUB, marginBottom: 8}}><span>{label}</span><span>{Math.round(clamp(v) * 100)}%</span></div>}
    <div style={{height: 22, borderRadius: 11, background: PANEL, border: `1px solid ${LINE}`, overflow: 'hidden'}}><div style={{width: `${clamp(v) * 100}%`, height: '100%', background: v > 0.85 ? RED : `linear-gradient(90deg, ${SKY}, ${color})`}} /></div>
  </div>
);

/** push-notification toast (white, rounded, app icon, title, body, "now") */
export const Toast: React.FC<{icon?: string; img?: string; title: string; body?: string; w?: number; accent?: string}> = ({icon = 'bell', img, title, body, w = 560, accent = ORANGE}) => (
  <div style={{width: w, display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px', borderRadius: 24, background: 'rgba(255,255,255,.97)', boxShadow: '0 14px 34px rgba(28,39,51,.18)', border: `1px solid ${LINE}`, boxSizing: 'border-box'}}>
    {img ? <Img src={staticFile(img)} style={{width: 58, height: 58, borderRadius: 14}} /> :
      <div style={{width: 58, height: 58, borderRadius: 14, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon name={icon} size={34} color="#fff" /></div>}
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</span>
        <span style={{fontFamily: SANS, fontWeight: 500, fontSize: 19, color: SUB, flexShrink: 0}}>now</span>
      </div>
      {body && <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 21, color: SUB, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2}}>{body}</div>}
    </div>
  </div>
);

/** simple phone outline; children are drawn on the screen (screen box w-24 x h-24) */
export const Phone: React.FC<{w?: number; h?: number; ring?: string; children?: React.ReactNode}> = ({w = 150, h = 280, ring = INK, children}) => (
  <div style={{width: w, height: h, borderRadius: w * 0.18, background: ring, padding: 10, boxSizing: 'border-box', boxShadow: '0 12px 26px rgba(28,39,51,.18)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.13, background: `linear-gradient(160deg, #F7FAFC, #DCE6EF)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: 8, width: w * 0.28, height: 8, marginLeft: -w * 0.14, borderRadius: 4, background: ring}} />
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

const Backdrop: React.FC<{k: number}> = ({k}) => {
  const t = useT();
  return <AbsoluteFill style={{opacity: k, background: CANVAS}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${GRID} 1.5px, transparent 1.5px), linear-gradient(90deg, ${GRID} 1.5px, transparent 1.5px)`, backgroundSize: '60px 60px', backgroundPosition: `0 ${(t * 12) % 60}px`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 30% at 15% 8%, ${ORANGE}26, transparent 70%), radial-gradient(ellipse 60% 30% at 90% 55%, ${SKY}22, transparent 70%)`}} />
    {[0, 1, 2, 3, 4, 5].map(i => { const y = 1920 - ((t * (30 + i * 7) + i * 330) % 2100);
      return <div key={i} style={{position: 'absolute', left: [60, 940, 120, 900, 500, 30][i], top: y, opacity: 0.16, transform: `rotate(${Math.sin(t + i) * 12}deg)`}}><Icon name={i % 2 ? 'bell' : 'package'} size={54} color={i % 3 ? BLUE : DEEPOR} /></div>; })}
  </AbsoluteFill>;
};

const Header: React.FC<{cfg: Config; k: number}> = ({cfg, k}) => (
  <div style={{position: 'absolute', left: 40, top: 40, display: 'flex', alignItems: 'center', gap: 18, opacity: k, transform: `translateY(${(1 - k) * -30}px)`}}>
    {cfg.logo && <Img src={staticFile(cfg.logo)} style={{width: 70, height: 70, borderRadius: 16}} />}
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: INK, whiteSpace: 'nowrap'}}>{cfg.title}</span>
  </div>
);

const Card: React.FC<{scenes: Scene[]; k: number; fk: number}> = ({scenes, k, fk}) => {
  const t = useT(); if (k < 0.01) return null;
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 130, width: CARD_W, height: lerp(CARD_H, FULL_H, fk), opacity: k, transform: `translateY(${(1 - k) * -80}px)`, background: CARD, borderRadius: 30, border: `2px solid ${LINE}`, boxShadow: '0 24px 50px rgba(28,39,51,.16)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 8, background: `linear-gradient(90deg, ${ORANGE}, ${DEEPOR} 60%, ${SKY})`}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${GRID} 1.6px, transparent 2px)`, backgroundSize: '30px 30px', opacity: 0.7}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.3) return null;
      const inK = ease(t, s.a - 0.05, 0.4), outK = ease(t, s.b - 0.12, 0.3);
      const El = s.el;
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `translateX(${(1 - inK) * 40 - outK * 40}px)`}}><El /></div>;
    })}
  </div>;
};

const Speaker: React.FC<{cfg: Config; k: number; fk: number}> = ({cfg, k, fk}) => {
  // full screen -> framed window (x 40, y 1160, 1000 x 720), whole face band visible (letterboxed, never cropped)
  const {y0, y1} = cfg.face; const fh = y1 - y0;
  const W1 = 1000, H1 = 720, X1 = 40, Y1 = 1160;
  const s1 = Math.min(H1 / fh, W1 / 1080 * 1.12);
  const x = lerp(0, X1, k), y = lerp(0, Y1, k), w = lerp(1080, W1, k), h = lerp(1920, H1, k);
  const s = lerp(1, s1, k);
  const vx = lerp(0, (W1 - 1080 * s1) / 2, k), vy = lerp(0, -y0 * s1, k);
  return <div style={{position: 'absolute', left: x, top: y + fk * 820, opacity: 1 - fk, width: w, height: h, borderRadius: 30 * k, overflow: 'hidden', background: INK, border: k > 0.02 ? `${6 * k}px solid ${CARD}` : undefined, boxShadow: k > 0.02 ? '0 20px 44px rgba(28,39,51,.25)' : undefined, boxSizing: 'border-box'}}>
    <div style={{position: 'absolute', left: vx, top: vy, width: 1080 * s, height: 1920 * s}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: '100%', height: '100%'}} />
    </div>
  </div>;
};

/** captions: slate toast pill, white words, the spoken word turns orange and lifts */
const Captions: React.FC<{data: Data; k: number; fk: number}> = ({data, k, fk}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const top = lerp(lerp(1590, 990, k), 1690, fk);
  const fs = lerp(54, 46, k);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(28,39,51,.92)', borderRadius: 28, padding: '12px 26px 14px', boxShadow: '0 12px 30px rgba(0,0,0,.25)', borderLeft: `8px solid ${ORANGE}`}}>
      {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: fs, lineHeight: 1.22, whiteSpace: 'nowrap', textAlign: 'center'}}>
        {ln.map((w, j) => {
          const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
          return <span key={j} style={{display: 'inline-block', margin: '0 7px', opacity: shown ? 1 : 0.32, transform: `translateY(${(1 - p) * 10 - (active ? 3 : 0)}px)`,
            color: active ? ORANGE : (w.k ? '#7FD3F5' : '#FFFFFF')}}>{w.w}</span>;
        })}
      </div>)}
    </div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const k = amt(t, spansOf(cfg, ['card', 'full'])); const fk = amt(t, spansOf(cfg, ['full']));
  return <AbsoluteFill style={{background: CANVAS}}>
    <Backdrop k={k} />
    <Speaker cfg={cfg} k={k} fk={fk} />
    <Card scenes={scenes} k={k} fk={fk} />
    <Header cfg={cfg} k={k} />
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} k={k} fk={fk} />
  </AbsoluteFill>;
};
