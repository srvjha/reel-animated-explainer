// Theme: EMBER OPS. Dark ops-console look: near-black canvas with a hairline grid and an ember glow, orange as the
// only accent, white type. Hard cuts between the speaker (full screen, real background) and full-screen pages; each
// page is revealed by an orange scan band sweeping top to bottom. Built for gateway / infra / LLM-ops explainers.
// Parts: Panel cards, Gauge (ring), Bar meters, Bucket (fill level with reserve and release animation), Flow nodes
// with Wires and packets, HTTP response card, Browser card for real article screenshots with an orange highlighter,
// log ticker. Sora + IBM Plex Mono. Captions: Sora 700 white, the spoken word on an orange pill with dark text.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing, Img} from 'remotion';
import '@fontsource/sora/400.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/700.css';
import {FPS, Data, Scene, clamp, lerp, ease, win, useT, springAt} from '../core';

export const BG = '#0B0B0D', PANEL = '#16161A', EDGE = '#2A2A30', ORANGE = '#FF7A1A', AMBER = '#FFB547', EMBER = '#C2410C',
  WHITE = '#F7F5F2', MUTED = '#A1A1AA', DIM = '#5B5B66', RED = '#FF4D4D', GREEN = '#3DDC97';
export const SANS = 'Sora', MONO = 'IBM Plex Mono';
export const W = 1080, H = 1920;
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 190, mass: 0.7});

export type Cut = {a: number; b: number; m: 'talk' | 'page'};
export type Config = {cuts: Cut[]; overlays?: React.FC[]; capSkip?: number};

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
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.22, ...style}}>{children}</div>
);
export const Panel: React.FC<{x: number; y: number; w: number; h?: number; t0: number; out?: number; children: React.ReactNode; hot?: boolean; style?: React.CSSProperties}> = ({x, y, w, h, t0, out, children, hot, style}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.4) * (out !== undefined ? 1 - ease(t, out, 0.25) : 1); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 24, background: hot ? ORANGE : PANEL, color: hot ? BG : WHITE, border: `2px solid ${hot ? ORANGE : EDGE}`,
    boxShadow: hot ? `0 20px 60px ${ORANGE}55` : '0 20px 50px rgba(0,0,0,.55)', padding: 26, boxSizing: 'border-box', opacity: k, transform: `translateY(${(1 - k) * 26}px)`, ...style}}>{children}</div>;
};
export const Tag: React.FC<{children: React.ReactNode; solid?: boolean; size?: number; icon?: string; color?: string}> = ({children, solid = true, size = 26, icon, color = ORANGE}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 999, background: solid ? color : 'transparent', border: `2.5px solid ${color}`, color: solid ? BG : color, fontFamily: SANS, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>
    {icon && <Icon name={icon} size={size * 1.15} color={solid ? BG : color} />}{children}</div>
);
/** labelled horizontal meter, v in 0..1 */
export const Bar: React.FC<{label: string; v: number; value?: string; color?: string; w?: number; h?: number}> = ({label, v, value, color = ORANGE, w = 420, h = 22}) => (
  <div style={{width: w}}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}><Txt size={22} font={MONO} w={500} color={MUTED}>{label}</Txt>{value && <Txt size={22} font={MONO} w={700} color={color}>{value}</Txt>}</div>
    <div style={{height: h, borderRadius: h / 2, background: '#26262C', marginTop: 8, overflow: 'hidden'}}><div style={{height: h, width: `${clamp(v) * 100}%`, background: color, borderRadius: h / 2}} /></div>
  </div>
);
/** ring gauge */
export const Gauge: React.FC<{x: number; y: number; r?: number; v: number; label: string; value: string; color?: string}> = ({x, y, r = 120, v, label, value, color = ORANGE}) => {
  const c = 2 * Math.PI * r;
  return <div style={{position: 'absolute', left: x, top: y, width: r * 2 + 40, textAlign: 'center'}}>
    <svg width={r * 2 + 40} height={r * 2 + 40}><circle cx={r + 20} cy={r + 20} r={r} stroke="#26262C" strokeWidth={22} fill="none" />
      <circle cx={r + 20} cy={r + 20} r={r} stroke={color} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={`${c * clamp(v)} ${c}`} transform={`rotate(-90 ${r + 20} ${r + 20})`} /></svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: r - 18}}><Txt size={44} w={800}>{value}</Txt></div>
    <Txt size={24} font={MONO} w={700} color={MUTED} style={{marginTop: 6}}>{label}</Txt>
  </div>;
};
/** token bucket: level 0..1 shown as fill, `reserved` part drawn hatched orange on top of the free level */
export const Bucket: React.FC<{x: number; y: number; w?: number; h?: number; free: number; reserved?: number; label?: string}> = ({x, y, w = 300, h = 420, free, reserved = 0, label}) => {
  const fh = (h - 16) * clamp(free), rh = (h - 16) * clamp(reserved);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '18px 18px 40px 40px', border: `5px solid ${WHITE}`, borderTop: 'none', overflow: 'hidden', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: fh, background: `linear-gradient(180deg, ${AMBER}, ${ORANGE})`}} />
      {rh > 0 && <div style={{position: 'absolute', left: 0, right: 0, bottom: fh, height: rh, background: `repeating-linear-gradient(135deg, ${ORANGE}55 0 12px, transparent 12px 24px)`, borderTop: `3px dashed ${ORANGE}`}} />}
    </div>
    {label && <div style={{position: 'absolute', left: 0, right: 0, top: h + 14, textAlign: 'center'}}><Txt size={24} font={MONO} w={700} color={MUTED}>{label}</Txt></div>}
  </div>;
};
export const Node: React.FC<{x: number; y: number; w?: number; h?: number; icon?: string; label: string; sub?: string; t0: number; hot?: boolean}> = ({x, y, w = 260, h = 104, icon, label, sub, t0, hot}) => {
  const f = useCurrentFrame(); if (f / FPS < t0) return null; const p = pop(f, t0);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 20, background: hot ? ORANGE : PANEL, border: `2px solid ${hot ? ORANGE : EDGE}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box',
    transform: `scale(${0.7 + 0.3 * p})`, opacity: clamp(p * 1.5), boxShadow: '0 14px 30px rgba(0,0,0,.5)'}}>
    {icon && <div style={{width: 58, height: 58, borderRadius: 14, background: hot ? BG : '#24242A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon name={icon} size={38} color={ORANGE} /></div>}
    <div><Txt size={27} w={700} color={hot ? BG : WHITE}>{label}</Txt>{sub && <Txt size={19} font={MONO} w={500} color={hot ? BG : MUTED}>{sub}</Txt>}</div>
  </div>;
};
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; t0: number; d?: number; color?: string; sw?: number; head?: boolean; dash?: boolean; packets?: number[]; pc?: string}> = ({x1, y1, x2, y2, t0, d = 0.4, color = DIM, sw = 4, head = true, dash, packets = [], pc = ORANGE}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, d);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k); const a = Math.atan2(y2 - y1, x2 - x1); const hs = 15;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash ? '9 9' : undefined} />
    {head && k > 0.92 && <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(a - 0.5)} ${y2 - hs * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(a + 0.5)} ${y2 - hs * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />}
    {packets.map((p0, i) => { const u = (t - p0) / 0.6; if (u < 0 || u > 1) return null; const e = Easing.inOut(Easing.quad)(u);
      return <circle key={i} cx={lerp(x1, x2, e)} cy={lerp(y1, y2, e)} r={11} fill={pc} stroke={BG} strokeWidth={3} />; })}
  </svg>;
};
/** article screenshot in a dark browser card, optional orange highlighter [x, y, w, h, t0] in screenshot px (800 wide) */
export const Browser: React.FC<{x: number; y: number; w: number; src: string; t0: number; url: string; crop?: [number, number]; hl?: [number, number, number, number, number]}> = ({x, y, w, src, t0, url, crop = [0, 975], hl}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.45); const s = w / 800; const vh = (crop[1] - crop[0]) * s;
  return <div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 24, overflow: 'hidden', border: `2px solid ${EDGE}`, boxShadow: '0 30px 80px rgba(0,0,0,.6)', opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.96 + 0.04 * k})`}}>
    <div style={{height: 60, background: '#1E1E23', display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
      <div style={{marginLeft: 14, flex: 1, height: 38, borderRadius: 19, background: '#2A2A30', display: 'flex', alignItems: 'center', padding: '0 16px', overflow: 'hidden'}}><Txt size={20} font={MONO} w={500} color={MUTED}>{url}</Txt></div>
    </div>
    <div style={{position: 'relative', height: vh, overflow: 'hidden', background: '#fff'}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: -crop[0] * s, width: w, height: 975 * s}} />
      {hl && t > hl[4] && <div style={{position: 'absolute', left: hl[0] * s, top: (hl[1] - crop[0]) * s, width: hl[2] * s * ease(t, hl[4], 0.5), height: hl[3] * s, background: 'rgba(255,140,40,.38)', mixBlendMode: 'multiply', borderRadius: 6}} />}
    </div>
  </div>;
};
/** page heading: orange mono label + one-line white title */
export const Head: React.FC<{t0: number; label: string; title: React.ReactNode; size?: number}> = ({t0, label, title, size = 70}) => {
  const t = useT(); const k1 = ease(t, t0, 0.3), k2 = ease(t, t0 + 0.08, 0.45);
  return <div style={{position: 'absolute', left: 70, top: 150, right: 50}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: k1}}><div style={{width: 14, height: 14, borderRadius: 7, background: ORANGE, boxShadow: `0 0 18px ${ORANGE}`}} /><Txt size={26} font={MONO} w={700} color={ORANGE} style={{letterSpacing: 3}}>{label}</Txt></div>
    <div style={{overflow: 'hidden', marginTop: 10}}><div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: WHITE, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: -1.5, transform: `translateY(${(1 - k2) * 105}%)`}}>{title}</div></div>
  </div>;
};

// ------------------------------------------------------------------ frame
export const Canvas: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.035) 1.5px, transparent 1.5px)', backgroundSize: '60px 60px'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 0%, ${EMBER}55 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, ${ORANGE}22 0%, transparent 50%)`}} />
  </AbsoluteFill>
);

const Captions: React.FC<{data: Data; top: number}> = ({data, top}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, lineHeight: 1.32, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.03) : 0;
        return <span key={j} style={{display: 'inline-block', margin: '0 3px', padding: '0 12px', borderRadius: 12, opacity: shown ? 1 : 0.4, transform: `translateY(${(1 - p) * 8}px)`,
          color: active ? BG : WHITE, background: active ? ORANGE : 'transparent', textShadow: active ? 'none' : '0 0 5px rgba(0,0,0,.9), 0 3px 0 rgba(0,0,0,.85), 0 0 20px rgba(0,0,0,.7)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const c = cfg.cuts.find(x => t >= x.a && t < x.b); const onPage = !!c && c.m === 'page';
  const k = onPage ? Easing.inOut(Easing.cubic)(clamp((t - c!.a) / 0.45)) : 1; const band = k * (H + 160) - 80;
  return <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: W, height: H}} />
    {onPage && <AbsoluteFill style={{clipPath: k < 1 ? `inset(0 0 ${H - band}px 0)` : undefined}}>
      <Canvas />
      {scenes.map((s, i) => {
        if (t < s.a - 0.1 || t > s.b + 0.05) return null;
        const El = s.el; return <AbsoluteFill key={i} style={{opacity: win(t, s.a, s.b, 0.14, 0.14)}}><El /></AbsoluteFill>;
      })}
    </AbsoluteFill>}
    {onPage && k < 1 && <div style={{position: 'absolute', left: 0, top: band - 40, width: W, height: 80, background: `linear-gradient(180deg, transparent, ${ORANGE} 45%, ${AMBER} 55%, transparent)`, boxShadow: `0 0 60px ${ORANGE}`}} />}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    {t >= (cfg.capSkip || 0) && <Captions data={data} top={onPage ? 1600 : 1500} />}
  </AbsoluteFill>;
};
