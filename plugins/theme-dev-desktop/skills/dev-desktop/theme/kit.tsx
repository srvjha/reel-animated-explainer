// Theme: DEV DESKTOP. A personal "my workflow" look: the reel lives on the speaker's computer desktop.
// Every cut is either `cam` (the speaker full screen, his real camera) or an `app` window (whiteboard, DB designer,
// AI chat, spec.md editor, browser, terminal, notes). Switching is the creative part: the outgoing shot shrinks into its
// dock icon and the incoming one opens out of its own dock icon (genie-style), over a sunset wallpaper with a menu bar
// and a dock. The speaker and an explainer never share the frame.
// Fonts: Manrope (UI), JetBrains Mono (code), Caveat (handwriting on whiteboards and sticky notes).
// Captions: Manrope 800 white with shadow, the spoken word on a lime highlighter.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import {FPS, Data, clamp, lerp, ease, useT, springAt} from '../core';

export const INK = '#16161D', GREY = '#6B6B7B', SOFT = '#A9A9B8', LINE = '#E6E4EE', PAPER = '#FFFFFF', CANVAS = '#FBFAF7',
  LIME = '#C6FF5E', ORANGE = '#F28C38', CORAL = '#F0776A', VIOLET = '#7B5CF0', TEAL = '#14A3A0', BLUE = '#3B82F6', RED = '#EF4444', GREEN = '#22C55E', YELLOW = '#FFD84D', CLAUDE = '#D97757';
export const SANS = 'Manrope', MONO = 'JetBrains Mono', HAND = 'Caveat';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});

// ------------------------------------------------------------------ apps + dock
export type AppKey = 'cam' | 'chat' | 'board' | 'schema' | 'spec' | 'browser' | 'term' | 'notes';
export const APPS: {key: AppKey; icon: string; bg: string; name: string}[] = [
  {key: 'cam', icon: 'video-camera', bg: 'linear-gradient(160deg,#FF6B6B,#E0344B)', name: 'Camera'},
  {key: 'chat', icon: 'sparkle', bg: `linear-gradient(160deg,#F4A67E,${CLAUDE})`, name: 'AI'},
  {key: 'board', icon: 'pencil-simple-line', bg: 'linear-gradient(160deg,#FFE27A,#F5B82E)', name: 'Board'},
  {key: 'schema', icon: 'database', bg: 'linear-gradient(160deg,#4FD1C5,#14A3A0)', name: 'Schema'},
  {key: 'spec', icon: 'file-text', bg: 'linear-gradient(160deg,#7FB2FF,#3B6FF6)', name: 'spec.md'},
  {key: 'browser', icon: 'compass', bg: 'linear-gradient(160deg,#A78BFA,#6D4AE8)', name: 'Browser'},
  {key: 'term', icon: 'terminal-window', bg: 'linear-gradient(160deg,#3A3A48,#15151C)', name: 'Terminal'},
  {key: 'notes', icon: 'check-square', bg: 'linear-gradient(160deg,#7BE495,#22B35A)', name: 'Notes'},
];
const DOCK_Y = 1760, ICON = 96, GAP = 16;
const dockX0 = (W - (APPS.length * ICON + (APPS.length - 1) * GAP)) / 2;
type Rect = {x: number; y: number; w: number; h: number};
export const dockRect = (k: AppKey): Rect => { const i = APPS.findIndex(a => a.key === k); return {x: dockX0 + i * (ICON + GAP), y: DOCK_Y + 22, w: ICON, h: ICON}; };
export const WIN: Rect = {x: 30, y: 96, w: 1020, h: 1380};
export const fullRect = (k: AppKey): Rect => k === 'cam' ? {x: 0, y: 0, w: W, h: H} : WIN;

export type Cut = {a: number; b: number; m: AppKey; title?: string; el?: React.FC};
export type Config = {cuts: Cut[]; overlays?: React.FC[]; capSkip?: number};

// ------------------------------------------------------------------ primitives
export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = INK, style}) => {
  const url = `url(${staticFile(`icons/${name}.svg`)})`;
  return <div style={{width: size, height: size, flexShrink: 0, background: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', ...style}} />;
};
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
export const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
export const Appear: React.FC<{t0: number; d?: number; dy?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, d = 0.35, dy = 16, out, children, style}) => {
  const t = useT(); const k = ease(t, t0, d) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px)`, ...style}}>{children}</div>;
};
export const PopIn: React.FC<{t0: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, children, style}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6), ...style}}>{children}</div>;
};
export const Txt: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 40, color = INK, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.25, ...style}}>{children}</div>
);
/** typewriter: reveals `text` between t0 and t1 */
export const Type: React.FC<{text: string; t0: number; t1: number; caret?: boolean; style?: React.CSSProperties}> = ({text, t0, t1, caret = true, style}) => {
  const t = useT(); const n = Math.round(clamp((t - t0) / Math.max(0.01, t1 - t0)) * text.length); if (t < t0) return null;
  return <span style={{whiteSpace: 'pre-wrap', ...style}}>{text.slice(0, n)}{caret && t < t1 + 0.4 && <span style={{display: 'inline-block', width: '0.5em', height: '1em', background: 'currentColor', verticalAlign: 'text-bottom', opacity: Math.sin(t * 12) > 0 ? 0.8 : 0.1}} />}</span>;
};
/** sticky note (straight, not slanted) */
export const Sticky: React.FC<{x: number; y: number; w?: number; t0: number; color?: string; children: React.ReactNode; size?: number}> = ({x, y, w = 280, t0, color = YELLOW, children, size = 40}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, padding: '18px 22px', boxSizing: 'border-box', background: color, borderRadius: 6, boxShadow: '0 12px 24px rgba(0,0,0,.18)',
    fontFamily: HAND, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: INK, transform: `scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.6)}}>{children}</div>;
};
/** hand-drawn style strike line across a box */
export const Strike: React.FC<{x: number; y: number; w: number; t0: number; color?: string}> = ({x, y, w, t0, color = RED}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.35);
  return <svg width={w + 20} height={40} style={{position: 'absolute', left: x - 10, top: y - 20, overflow: 'visible'}}><path d={`M 10 24 Q ${w / 2} 10 ${w + 10} 18`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} /></svg>;
};
export const Pill: React.FC<{children: React.ReactNode; bg?: string; color?: string; size?: number; icon?: string; style?: React.CSSProperties}> = ({children, bg = INK, color = PAPER, size = 26, icon, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderRadius: 999, background: bg, color, fontFamily: SANS, fontWeight: 800, fontSize: size, whiteSpace: 'nowrap', ...style}}>
    {icon && <Icon name={icon} size={size * 1.15} color={color} />}{children}</div>
);

// ------------------------------------------------------------------ desktop chrome
const Wallpaper: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(165deg, #1F1A45 0%, #4B2A7B 38%, #B4507A 68%, #F0876A 88%, #FFC08F 100%)'}}>
    <div style={{position: 'absolute', left: -200, top: 300, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,160,120,.35), transparent 65%)'}} />
    <div style={{position: 'absolute', right: -250, top: -150, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,110,255,.35), transparent 65%)'}} />
  </AbsoluteFill>
);
const MenuBar: React.FC = () => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 56, background: 'rgba(20,16,40,.45)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '0 26px', boxSizing: 'border-box', gap: 30}}>
    <div style={{width: 22, height: 22, borderRadius: 11, background: LIME}} />
    {["Saurav's Desk", 'File', 'Edit', 'View'].map((s, i) => <Txt key={s} size={24} w={i ? 500 : 800} color="rgba(255,255,255,.92)">{s}</Txt>)}
    <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18}}>
      <Icon name="wifi-high" size={28} color="rgba(255,255,255,.9)" /><Icon name="battery-high" size={30} color="rgba(255,255,255,.9)" /><Txt size={24} w={700} color="rgba(255,255,255,.92)">10:42</Txt></div>
  </div>
);
const Dock: React.FC<{running: AppKey[]; bounce?: AppKey; bt?: number}> = ({running, bounce, bt = 0}) => {
  const t = useT();
  return <>
    <div style={{position: 'absolute', left: dockX0 - 20, top: DOCK_Y, width: APPS.length * ICON + (APPS.length - 1) * GAP + 40, height: 140, borderRadius: 36, background: 'rgba(255,255,255,.22)', border: '1.5px solid rgba(255,255,255,.35)', backdropFilter: 'blur(14px)'}} />
    {APPS.map(a => { const r = dockRect(a.key); const b = bounce === a.key ? Math.abs(Math.sin(clamp((t - bt) / 0.6) * Math.PI * 2)) * 22 * (1 - clamp((t - bt) / 0.6)) : 0;
      return <React.Fragment key={a.key}>
        <div style={{position: 'absolute', left: r.x, top: r.y - b, width: ICON, height: ICON, borderRadius: 24, background: a.bg, boxShadow: '0 8px 18px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={a.icon} size={54} color={PAPER} /></div>
        {running.includes(a.key) && <div style={{position: 'absolute', left: r.x + ICON / 2 - 5, top: r.y + ICON + 8, width: 10, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.9)'}} />}
      </React.Fragment>; })}
  </>;
};
/** app window chrome; body is children (size WIN.w x WIN.h - 64) */
export const WindowChrome: React.FC<{title: string; app: AppKey; children: React.ReactNode; dark?: boolean}> = ({title, app, children, dark}) => {
  const a = APPS.find(x => x.key === app)!;
  return <div style={{width: WIN.w, height: WIN.h, borderRadius: 26, overflow: 'hidden', background: dark ? '#17171F' : CANVAS, boxShadow: '0 40px 90px rgba(10,5,40,.55)', border: '1.5px solid rgba(255,255,255,.4)'}}>
    <div style={{height: 64, background: dark ? '#22222C' : '#F1EFF6', borderBottom: `1.5px solid ${dark ? '#2E2E3A' : LINE}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <div key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}
      <div style={{marginLeft: 'auto', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 10, transform: 'translateX(-40px)'}}>
        <div style={{width: 30, height: 30, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={a.icon} size={20} color={PAPER} /></div>
        <Txt size={24} w={700} color={dark ? '#C9C9D6' : GREY} font={MONO}>{title}</Txt></div>
    </div>
    <div style={{position: 'relative', width: WIN.w, height: WIN.h - 64}}>{children}</div>
  </div>;
};

// ------------------------------------------------------------------ captions
const Captions: React.FC<{data: Data; top: number}> = ({data, top}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.32, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 12px', borderRadius: 12, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px)`,
          color: active ? INK : PAPER, background: active ? LIME : 'transparent', textShadow: active ? 'none' : '0 0 5px rgba(0,0,0,.9), 0 3px 0 rgba(0,0,0,.85), 0 0 20px rgba(0,0,0,.7)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

// ------------------------------------------------------------------ frame
const lerpRect = (a: Rect, b: Rect, k: number): Rect => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k)});
const Placed: React.FC<{r: Rect; full: Rect; radius: number; opacity?: number; children: React.ReactNode}> = ({r, full, radius, opacity = 1, children}) => {
  const sx = r.w / full.w, sy = r.h / full.h;
  return <div style={{position: 'absolute', left: full.x, top: full.y, width: full.w, height: full.h, transformOrigin: '0 0', transform: `translate(${r.x - full.x}px, ${r.y - full.y}px) scale(${sx}, ${sy})`, borderRadius: radius, overflow: 'hidden', opacity}}>{children}</div>;
};

export const Frame: React.FC<{data: Data; cfg: Config}> = ({data, cfg}) => {
  const t = useT();
  const i = Math.max(0, cfg.cuts.findIndex(c => t >= c.a && t < c.b)); const cur = cfg.cuts[i]; const prev = i > 0 ? cfg.cuts[i - 1] : null;
  const kOut = prev ? Easing.in(Easing.cubic)(clamp((t - cur.a) / 0.38)) : 1;
  const kIn = prev ? Easing.out(Easing.back(1.1))(clamp((t - cur.a - 0.16) / 0.5)) : 1;
  const camFull = cur.m === 'cam' && kIn >= 1;
  const running = Array.from(new Set(cfg.cuts.filter(c => c.a <= t).map(c => c.m)));
  const render = (c: Cut, k: number, opening: boolean) => {
    const full = fullRect(c.m); const r = lerpRect(dockRect(c.m), full, k); const radius = c.m === 'cam' ? lerp(24, 0, k) * (k < 1 ? 1 : 0) + (k < 1 ? 20 : 0) : 26;
    const El = c.el;
    return <Placed key={(opening ? 'in' : 'out') + c.a} r={r} full={full} radius={radius} opacity={clamp(k * 3)}>
      {c.m === 'cam' ? <div style={{width: W, height: H, background: '#000'}}><OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} /></div>
        : <WindowChrome title={c.title || ''} app={c.m} dark={c.m === 'term'}>{El ? <El /> : null}</WindowChrome>}
    </Placed>;
  };
  return <AbsoluteFill style={{background: '#000'}}>
    {!camFull && <><Wallpaper /><MenuBar /><Dock running={running} bounce={cur.m} bt={cur.a} /></>}
    {prev && kOut < 1 && render(prev, 1 - kOut, false)}
    {render(cur, kIn, true)}
    {(cfg.overlays || []).map((O, j) => <O key={j} />)}
    {t >= (cfg.capSkip || 0) && <Captions data={data} top={cur.m === 'cam' ? 1500 : 1500} />}
  </AbsoluteFill>;
};
