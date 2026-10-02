// Theme: CREAM PASSPORT. Cream paper with navy/red ink, hard offset shadows, rubber stamps.
// The speaker is full screen for hooks and bridges and shrinks into a framed card at the bottom
// ("desk" mode) while paper-document visuals play on top (y 60..800). Keywords sit on mustard pills.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, spring, Easing} from 'remotion';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/700.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import {FPS, Data, Scene, clamp, ease, useT, springAt, punchZoom, Typed as CoreTyped} from '../core';

export const PAPER = '#F3EBDD', PAPER2 = '#E8DCC6', INK = '#1B1F2A', NAVY = '#1D3557', RED = '#C8102E', MUSTARD = '#E9A23B', OK = '#2E7D4F', SOFT = '#6B6255';
export const SERIF = 'DM Serif Display', MONO = 'IBM Plex Mono', SANS = 'Manrope';
export const SHADOW = '8px 10px 0 rgba(27,31,42,.9)';
export const pop = (frame: number, t0: number) => springAt(frame, t0, {damping: 12, stiffness: 170, mass: 0.7});
export const Typed: React.FC<{t0: number; text: string; cps?: number}> = (p) => <CoreTyped {...p} cps={p.cps ?? 28} caret="|" />;

export type Config = {
  desk: [number, number][];               // windows where the speaker shrinks into the bottom card
  punches?: [number, number, number][];   // [start, end, amount] zooms while full screen
  overlays?: React.FC[];                   // hook, bridges, ending: free layers above scenes
};

export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 - t) / 0.25 + 1) * clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 40}px)` : from === 'left' ? `translateX(${(1 - p) * -90}px)` : from === 'right' ? `translateX(${(1 - p) * 90}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.4) * out, transform: tr, ...style}}>{children}</div>;
};

export const Chip: React.FC<{color?: string; bg?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = NAVY, bg = PAPER, size = 30, children, style}) => (
  <span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: size, color, background: bg, border: `3px solid ${color}`, padding: '10px 20px', boxShadow: '6px 7px 0 rgba(27,31,42,.85)', whiteSpace: 'nowrap', ...style}}>{children}</span>
);

export const Stamp: React.FC<{t0: number; t1?: number; color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t0, t1 = 999, color = RED, size = 54, children, style}) => {
  const f = useCurrentFrame(); const t = f / FPS; if (t < t0 || t > t1 + 0.25) return null;
  const p = spring({frame: f - Math.round(t0 * FPS), fps: FPS, config: {damping: 9, stiffness: 260, mass: 0.6}});
  return <div style={{position: 'absolute', transform: `scale(${2.2 - 1.2 * p})`, opacity: clamp(p * 2) * clamp((t1 + 0.25 - t) / 0.25), ...style}}>
    <span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: size, color, border: `6px double ${color}`, padding: '6px 22px', letterSpacing: '.06em', background: 'rgba(243,235,221,.86)', whiteSpace: 'nowrap'}}>{children}</span>
  </div>;
};

export const FacePhoto: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', background: '#222'}}>
    <div style={{position: 'absolute', width: 1080, height: 1920, left: w / 2 - 540 * 0.62, top: h / 2 - 430 * 0.62, transform: 'scale(0.62)', transformOrigin: '0 0'}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted style={{width: 1080, height: 1920, filter: 'grayscale(.25) contrast(1.05)'}} />
    </div>
  </div>
);

// ------------------------------------------------------------------ scenes (visual zone y 60-800 in DESK mode)
export const Header: React.FC<{t0: number; t1: number; kicker: string; title: string; color?: string}> = ({t0, t1, kicker, title, color = NAVY}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 50, top: 60}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: RED, letterSpacing: '.12em'}}>{kicker}</div>
    <div style={{fontFamily: SERIF, fontSize: 70, color, lineHeight: 1.05, whiteSpace: 'nowrap'}}>{title}</div>
  </Appear>
);

export const UserIcon: React.FC<{label: string; color?: string}> = ({label, color = NAVY}) => (
  <div style={{width: 200, textAlign: 'center'}}>
    <div style={{width: 120, height: 120, margin: '0 auto', borderRadius: 60, border: `5px solid ${color}`, background: PAPER2, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 33, top: 16, width: 44, height: 44, borderRadius: 22, background: color}} />
      <div style={{position: 'absolute', left: 17, top: 66, width: 76, height: 48, borderRadius: '38px 38px 6px 6px', background: color}} />
    </div>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color, marginTop: 10, whiteSpace: 'nowrap'}}>{label}</div>
  </div>
);
export const Server: React.FC<{label?: string; color?: string; w?: number}> = ({label = 'BACKEND', color = NAVY, w = 220}) => (
  <div style={{width: w, textAlign: 'center'}}>
    <div style={{border: `5px solid ${color}`, background: PAPER2, padding: 10, boxShadow: SHADOW}}>
      {[0, 1, 2].map(i => <div key={i} style={{height: 26, margin: '8px 0', background: color, opacity: 0.85, position: 'relative'}}><div style={{position: 'absolute', right: 10, top: 8, width: 10, height: 10, borderRadius: 5, background: '#7CFFB2'}} /></div>)}
    </div>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color, marginTop: 14}}>{label}</div>
  </div>
);

export const Door: React.FC<{label: string; state: 'idle' | 'check'}> = ({label, state}) => {
  const t = useT();
  const light = state === 'check' ? (Math.floor(t * 6) % 2 ? MUSTARD : '#5a4a2a') : SOFT;
  return <div style={{width: 300, textAlign: 'center'}}>
    <div style={{height: 420, border: `6px solid ${INK}`, background: PAPER2, position: 'relative', boxShadow: SHADOW}}>
      <div style={{position: 'absolute', left: 20, right: 20, top: 20, bottom: 0, border: `4px solid ${INK}`, borderBottom: 'none'}} />
      <div style={{position: 'absolute', right: 40, top: 200, width: 18, height: 40, background: INK}} />
      <div style={{position: 'absolute', left: 90, top: 60, width: 120, height: 70, background: INK, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 30, height: 30, borderRadius: 15, background: light, boxShadow: `0 0 18px ${light}`}} />
      </div>
    </div>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: NAVY, marginTop: 12}}>{label}</div>
  </div>;
};

/** Title card on paper: words pop in one by one at their spoken times. Keep it on ONE line. */
export const TitleCard: React.FC<{words: [string, number, string][]; size?: number; sub?: string; subT?: number}> = ({words, size = 60, sub, subT = 0}) => {
  const f = useCurrentFrame(); const t = f / FPS; const ep = pop(f, subT - 0.2);
  return <div style={{position: 'absolute', left: 30, right: 30, top: 50, background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW, padding: '14px 10px 20px', textAlign: 'center'}}>
    <div style={{fontFamily: SERIF, fontSize: size, whiteSpace: 'nowrap', lineHeight: 1}}>
      {words.map(([w, t0, c], i) => { const p = pop(f, t0 - 0.1); return <span key={i} style={{display: 'inline-block', color: c, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 30}px)`, margin: '0 10px'}}>{w}</span>; })}
    </div>
    {sub && <div style={{overflow: 'hidden', height: t > subT - 0.2 ? 44 * clamp(ep) : 0}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: SOFT, letterSpacing: '.14em', marginTop: 12}}>{sub}</div>
    </div>}
  </div>;
};

// ------------------------------------------------------------------ frame
const deskAmt = (t: number, cfg: Config) => {
  let d = 0;
  for (const [a, b] of cfg.desk) d = Math.max(d, Easing.inOut(Easing.cubic)(clamp((t - a) / 0.5)) * Easing.inOut(Easing.cubic)(clamp((b - t) / 0.5)));
  return d;
};

const PaperBg: React.FC = () => {
  const t = useT();
  return <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(29,53,87,.20) 1.6px, transparent 2px)', backgroundSize: '30px 30px', backgroundPosition: `${(t * 8) % 30}px 0px`}} />
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(135deg, rgba(200,16,46,.035) 0 2px, transparent 2px 14px)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 16, background: `repeating-linear-gradient(90deg, ${NAVY} 0 40px, ${RED} 40px 80px)`}} />
  </AbsoluteFill>;
};

const Speaker: React.FC<{cfg: Config}> = ({cfg}) => {
  const t = useT(); const d = deskAmt(t, cfg);
  const s = punchZoom(t, 0.05, 12, cfg.punches || []) * (1 - d) + 0.56 * d;
  const y = 840 * d;
  let blur = 0;
  for (const [a, b] of cfg.desk) for (const e of [a, b]) blur = Math.max(blur, 9 * clamp(1 - Math.abs(t - e - 0.25) / 0.25));
  return <AbsoluteFill style={{transformOrigin: '50% 22%', transform: `translateY(${y}px) scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
    <AbsoluteFill style={{borderRadius: (40 * d) / Math.max(s, 0.3), overflow: 'hidden', boxShadow: d > 0.01 ? `0 0 0 ${(14 * d) / s}px ${PAPER}, ${18 / s}px ${22 / s}px 0 ${(14 * d) / s}px rgba(27,31,42,${0.85 * d})` : undefined}}>
      <OffthreadVideo src={staticFile('src.mp4')} muted />
    </AbsoluteFill>
  </AbsoluteFill>;
};

const Captions: React.FC<{data: Data}> = ({data}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  return <div style={{position: 'absolute', left: 30, right: 30, bottom: 300, textAlign: 'center'}}>
    {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.28, whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.02; const p = shown ? pop(f, w.t - 0.02) : 0;
        const base: React.CSSProperties = {display: 'inline-block', margin: '0 8px', opacity: shown ? 1 : 0, transform: `translateY(${(1 - p) * 18}px)`};
        return w.k
          ? <span key={j} style={{...base, color: INK, background: MUSTARD, padding: '0 14px', boxShadow: '5px 6px 0 rgba(27,31,42,.9)'}}>{w.w}</span>
          : <span key={j} style={{...base, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.6), 3px 0 0 rgba(0,0,0,.6), -3px 0 0 rgba(0,0,0,.6)'}}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT();
  return <AbsoluteFill style={{background: PAPER}}>
    <PaperBg />
    <Speaker cfg={cfg} />
    {scenes.map((s, i) => { if (t < s.a - 0.1 || t > s.b + 0.4) return null; const El = s.el; return <El key={i} />; })}
    {(cfg.overlays || []).map((O, i) => <O key={i} />)}
    <Captions data={data} />
  </AbsoluteFill>;
};
