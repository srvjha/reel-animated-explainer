// Theme: EDITOR LIGHT. Butter-yellow graph paper, light code-editor windows with syntax highlighting,
// a background-removed speaker as a white-outlined sticker. Three modes per time window:
//   talk  - speaker large, an animated background behind (marquee words + drifting code chips)
//   split - a diagram/code card on top, the cut-out speaker standing in front of its bottom edge
//   full  - the card takes the whole frame, speaker slides away
// Captions sit on a white tooltip card; the spoken word gets a coral highlighter stroke.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/fira-code/500.css';
import '@fontsource/fira-code/600.css';
import {FPS, Data, Scene, clamp, lerp, ease, useT, springAt} from '../core';

export const PAPER = '#FFF7DA', PAPER2 = '#FFFBEC', GRIDC = 'rgba(140,105,20,.12)', INK = '#17191E', SUB = '#6B6A63', CARD = '#FFFFFF', LINE = '#E7DFC2';
export const CORAL = '#FF6B4A', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#DC2626', AMBER = '#D97706', TEAL = '#0D9488';
export const HEAD = 'Instrument Sans', SERIF = 'Instrument Serif', SANS = 'Outfit', CODE = 'Fira Code';
export const pop = (f: number, t0: number) => springAt(f, t0, {damping: 14, stiffness: 200, mass: 0.7});

export type Mode = 'talk' | 'split' | 'full';
export type Config = {
  title: string;                                   // one line, top-left (<= ~26 chars)
  file?: string;                                   // tab label shown on the title chip, e.g. 'middleware.ts'
  modes: {a: number; b: number; m: Mode}[];        // timeline of layouts (contiguous)
  marquee?: string[];                              // words scrolling behind the speaker in talk mode
  chips?: string[];                                // code tokens drifting behind the speaker
  stickers?: {t0: number; t1: number; text: string; x: number; y: number; color?: string; rot?: number}[];  // labels next to the speaker in talk mode
  speaker?: string;                                // transparent speaker video in public/ (default speaker.webm)
};
/** card box in split mode (scene coords) and full mode */
export const CARD_W = 1000, SPLIT_H = 880, FULL_H = 1290;

// ------------------------------------------------------------------ primitives
export const Appear: React.FC<{t0: number; t1?: number; style?: React.CSSProperties; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode}> = ({t0, t1 = 999, style, from = 'up', children}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const p = pop(f, t0); const out = clamp((t1 + 0.25 - t) / 0.25);
  const tr = from === 'up' ? `translateY(${(1 - p) * 36}px)` : from === 'down' ? `translateY(${(1 - p) * -36}px)` : from === 'left' ? `translateX(${(1 - p) * -80}px)` : from === 'right' ? `translateX(${(1 - p) * 80}px)` : `scale(${0.6 + 0.4 * p})`;
  return <div style={{position: 'absolute', opacity: clamp(p * 1.6) * out, transform: tr, ...style}}>{children}</div>;
};

export const Tag: React.FC<{color?: string; size?: number; solid?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({color = INK, size = 26, solid, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: CODE, fontWeight: 600, fontSize: size, color: solid ? '#fff' : color, background: solid ? color : CARD, border: `2.5px solid ${color}`, borderRadius: 12, padding: '6px 16px', whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(23,25,30,.08)', ...style}}>{children}</span>
);

/** "02 / heading" with an italic serif accent word */
export const Heading: React.FC<{t0: number; t1?: number; n?: string; title: string; accent?: string; color?: string}> = ({t0, t1, n, title, accent, color = CORAL}) => (
  <Appear t0={t0} t1={t1} from="left" style={{left: 36, top: 28}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap'}}>
      {n && <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 24, color}}>{n}</span>}
      <span style={{fontFamily: HEAD, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-.01em'}}>{title}</span>
      {accent && <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color}}>{accent}</span>}
    </div>
  </Appear>
);

// ------------------------------------------------------------------ code
const KW = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'await', 'async', 'new', 'import', 'from', 'export', 'try', 'catch', 'throw', 'true', 'false', 'null']);
const tokenize = (line: string) => {
  const out: {s: string; c: string; i?: boolean}[] = [];
  const re = /(\/\/.*$)|('[^']*'|"[^"]*"|`[^`]*`)|(\b\d+\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) out.push({s: m[1], c: '#9A968A', i: true});
    else if (m[2]) out.push({s: m[2], c: GREEN});
    else if (m[3]) out.push({s: m[3], c: AMBER});
    else if (m[4]) out.push({s: m[4], c: BLUE});
    else if (m[5]) out.push({s: m[5], c: KW.has(m[5]) ? CORAL : m[5] === 'req' || m[5] === 'res' || m[5] === 'next' ? TEAL : INK});
    else out.push({s: m[6] ?? m[7], c: '#4B4A44'});
  }
  return out;
};

/** light editor window. Lines type in at `at[i]` (seconds); `hi` highlights a line in a time window. */
export const Editor: React.FC<{file: string; lines: string[]; at: number[]; w?: number; size?: number; hi?: {line: number; t0: number; t1: number; color?: string}[]; cps?: number}> = ({file, lines, at, w = 1000, size = 30, hi = [], cps = 40}) => {
  const t = useT(); const lh = size * 1.55;
  return <div style={{width: w, background: CARD, borderRadius: 22, border: `2.5px solid ${LINE}`, boxShadow: '0 24px 50px rgba(80,60,0,.14)', overflow: 'hidden'}}>
    <div style={{height: 54, background: '#F6F2E3', display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: `2px solid ${LINE}`}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{width: 15, height: 15, borderRadius: 8, background: c}} />)}
      <span style={{marginLeft: 16, fontFamily: CODE, fontWeight: 600, fontSize: 22, color: INK, background: CARD, padding: '6px 14px', borderRadius: '10px 10px 0 0', border: `2px solid ${LINE}`, borderBottom: 'none', marginBottom: -12}}>{file}</span>
    </div>
    <div style={{padding: '18px 0 22px'}}>
      {lines.map((ln, i) => {
        const vis = t >= at[i] - 0.02; if (!vis) return <div key={i} style={{height: lh}} />;
        const n = Math.min(ln.length, Math.floor((t - at[i]) * cps) + 1);
        const h = hi.find(x => x.line === i && t >= x.t0 && t < x.t1);
        const typing = n < ln.length;
        let left = n; const toks = tokenize(ln);
        return <div key={i} style={{display: 'flex', height: lh, alignItems: 'center', background: h ? `${h.color ?? CORAL}22` : undefined, borderLeft: `6px solid ${h ? (h.color ?? CORAL) : 'transparent'}`}}>
          <span style={{width: 62, textAlign: 'right', paddingRight: 18, fontFamily: CODE, fontSize: size * 0.8, color: '#C3BDA6'}}>{i + 1}</span>
          <span style={{fontFamily: CODE, fontWeight: 500, fontSize: size, whiteSpace: 'pre'}}>
            {toks.map((tk, j) => { if (left <= 0) return null; const s = tk.s.slice(0, left); left -= tk.s.length; return <span key={j} style={{color: tk.c, fontStyle: tk.i ? 'italic' : undefined}}>{s}</span>; })}
            {typing && <span style={{display: 'inline-block', width: 3, height: size, background: CORAL, verticalAlign: 'middle'}} />}
          </span>
        </div>;
      })}
    </div>
  </div>;
};

/** light terminal / log panel */
export const Terminal: React.FC<{lines: {t: number; s: string; c?: string}[]; w?: number; title?: string; size?: number}> = ({lines, w = 1000, title = 'terminal', size = 26}) => {
  const t = useT();
  return <div style={{width: w, background: '#FBF8EE', borderRadius: 18, border: `2.5px solid ${LINE}`, overflow: 'hidden', boxShadow: '0 18px 40px rgba(80,60,0,.12)'}}>
    <div style={{height: 44, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: CODE, fontSize: 20, color: SUB, borderBottom: `2px solid ${LINE}`}}>$ {title}</div>
    <div style={{padding: '14px 20px'}}>
      {lines.filter(l => t >= l.t).map((l, i) => <div key={i} style={{fontFamily: CODE, fontWeight: 500, fontSize: size, color: l.c ?? INK, lineHeight: 1.6, whiteSpace: 'pre'}}>{l.s}</div>)}
    </div>
  </div>;
};

/** a request card ("GET /orders") */
export const Req: React.FC<{method?: string; path: string; color?: string; status?: string; statusColor?: string}> = ({method = 'GET', path, color = BLUE, status, statusColor = GREEN}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: CARD, border: `3px solid ${INK}`, borderRadius: 16, padding: '10px 18px', boxShadow: '0 8px 0 rgba(23,25,30,.12)', whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 24, color: '#fff', background: color, padding: '2px 10px', borderRadius: 8}}>{method}</span>
    <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 28, color: INK}}>{path}</span>
    {status && <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 24, color: '#fff', background: statusColor, padding: '2px 10px', borderRadius: 8}}>{status}</span>}
  </div>
);

/** a middleware gate in the pipeline */
export const Gate: React.FC<{label: string; sub?: string; state?: 'idle' | 'active' | 'pass' | 'block'; w?: number}> = ({label, sub, state = 'idle', w = 300}) => {
  const c = state === 'pass' ? GREEN : state === 'block' ? RED : state === 'active' ? CORAL : '#BDB49A';
  return <div style={{width: w, padding: '16px 20px', background: CARD, borderRadius: 18, border: `3px solid ${c}`, boxShadow: state === 'active' ? `0 0 0 8px ${CORAL}22` : '0 6px 0 rgba(23,25,30,.06)', display: 'flex', alignItems: 'center', gap: 14}}>
    <span style={{width: 40, height: 40, borderRadius: 20, background: state === 'idle' ? '#F1EAD2' : c, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 24}}>{state === 'pass' ? '✓' : state === 'block' ? '✕' : '•'}</span>
    <div><div style={{fontFamily: CODE, fontWeight: 600, fontSize: 28, color: INK, whiteSpace: 'nowrap'}}>{label}</div>{sub && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: SUB, whiteSpace: 'nowrap'}}>{sub}</div>}</div>
  </div>;
};

/** simple down arrow / connector */
export const VArrow: React.FC<{h?: number; color?: string; on?: boolean}> = ({h = 46, color = INK, on = true}) => (
  <div style={{width: 40, height: h, position: 'relative', opacity: on ? 1 : 0.25}}>
    <div style={{position: 'absolute', left: 17, top: 0, width: 6, height: h - 14, background: color, borderRadius: 3}} />
    <div style={{position: 'absolute', left: 8, bottom: 0, width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: `16px solid ${color}`}} />
  </div>
);

// ------------------------------------------------------------------ frame
const modeAt = (t: number, cfg: Config) => {
  // weights for talk/split/full with 0.5 s eased cross-fades at each boundary
  const w = {talk: 0, split: 0, full: 0} as Record<Mode, number>;
  for (const s of cfg.modes) {
    const k = Easing.inOut(Easing.cubic)(clamp((t - s.a + 0.25) / 0.5)) * (1 - Easing.inOut(Easing.cubic)(clamp((t - s.b + 0.25) / 0.5)));
    w[s.m] = Math.max(w[s.m], s.a <= 0.01 ? (1 - Easing.inOut(Easing.cubic)(clamp((t - s.b + 0.25) / 0.5))) : k);
  }
  const tot = w.talk + w.split + w.full || 1;
  return {talk: w.talk / tot, split: w.split / tot, full: w.full / tot};
};

const Backdrop: React.FC<{cfg: Config; talk: number}> = ({cfg, talk}) => {
  const t = useT();
  const rows = cfg.marquee ?? ['MIDDLEWARE', 'req → res', 'next()'];
  const chips = cfg.chips ?? [];
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 80% at 50% 40%, ${PAPER2}, ${PAPER})`}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${GRIDC} 1.5px, transparent 1.5px), linear-gradient(90deg, ${GRIDC} 1.5px, transparent 1.5px)`, backgroundSize: '48px 48px'}} />
    <AbsoluteFill style={{backgroundImage: `linear-gradient(rgba(140,105,20,.16) 2px, transparent 2px), linear-gradient(90deg, rgba(140,105,20,.16) 2px, transparent 2px)`, backgroundSize: '240px 240px'}} />
    {/* talk-mode life: outlined marquee rows + drifting code chips */}
    <AbsoluteFill style={{opacity: 0.25 + 0.75 * talk}}>
      {[0, 1, 2].map(r => {
        const txt = Array(8).fill(rows[r % rows.length]).join('  ·  ');
        const dir = r % 2 ? 1 : -1; const x = ((t * (60 + r * 25) * dir) % 1600) - (dir > 0 ? 1600 : 0);
        return <div key={r} style={{position: 'absolute', left: x, top: 330 + r * 230, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 700, fontSize: 150, letterSpacing: '-.02em', color: 'transparent', WebkitTextStroke: `2.5px rgba(23,25,30,${r === 1 ? 0.14 : 0.09})`}}>{txt}  ·  {txt}</div>;
      })}
      {chips.map((c, i) => {
        const sp = 18 + (i * 7) % 15; const y0 = 260 + ((i * 263) % 1100);
        const x = ((i * 389 + t * sp) % 1300) - 150; const y = y0 + Math.sin(t * 0.8 + i) * 18;
        return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${((i * 13) % 11) - 5}deg)`, fontFamily: CODE, fontWeight: 600, fontSize: 30, color: [CORAL, BLUE, TEAL, AMBER][i % 4], background: 'rgba(255,255,255,.75)', border: `2px solid ${LINE}`, borderRadius: 12, padding: '6px 14px', whiteSpace: 'nowrap'}}>{c}</div>;
      })}
    </AbsoluteFill>
  </AbsoluteFill>;
};

const Speaker: React.FC<{cfg: Config; m: {talk: number; split: number; full: number}}> = ({cfg, m}) => {
  const t = useT();
  // talk: full size, shifted down 90px; split: 0.6 scale, head around y 1060; full: slid off the bottom
  const s = m.talk * 1.0 + m.split * 0.6 + m.full * 0.6;
  const y = m.talk * 90 + m.split * 850 + m.full * 1500;
  const x = (1080 - 1080 * s) / 2;
  const o = 1 - m.full;
  const sway = Math.sin(t * 0.6) * 4 * m.talk;
  return <div style={{position: 'absolute', left: x + sway, top: y, width: 1080 * s, height: 1920 * s, opacity: o,
    filter: `drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 26px 30px rgba(80,60,0,.28))`}}>
    <OffthreadVideo src={staticFile(cfg.speaker ?? 'speaker.webm')} transparent muted style={{width: '100%', height: '100%'}} />
  </div>;
};

const Card: React.FC<{scenes: Scene[]; m: {talk: number; split: number; full: number}}> = ({scenes, m}) => {
  const t = useT();
  const vis = 1 - m.talk; if (vis < 0.01) return null;
  const h = lerp(SPLIT_H, FULL_H, m.full / Math.max(0.001, m.split + m.full));
  const idx = scenes.findIndex(s => t >= s.a - 0.05 && t < s.b);
  return <div style={{position: 'absolute', left: 40, top: 150 - (1 - vis) * 200, width: CARD_W, height: h, opacity: vis, background: 'rgba(255,253,245,.92)', border: `3px solid ${INK}`, borderRadius: 30, boxShadow: `0 10px 0 ${INK}, 0 30px 60px rgba(80,60,0,.18)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(140,105,20,.18) 1.6px, transparent 2px)`, backgroundSize: '24px 24px'}} />
    {scenes.map((s, i) => {
      if (Math.abs(i - idx) > 1 || t < s.a - 0.1 || t > s.b + 0.35) return null;
      const inK = ease(t, s.a - 0.05, 0.45), outK = ease(t, s.b - 0.15, 0.4);
      const El = s.el;
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: inK * (1 - outK), transform: `translateY(${(1 - inK) * 40 - outK * 40}px)`}}><El /></div>;
    })}
  </div>;
};

const Stickers: React.FC<{cfg: Config; talk: number}> = ({cfg, talk}) => (<>
  {(cfg.stickers || []).map((s, i) => <Appear key={i} t0={s.t0} t1={s.t1} from="scale" style={{left: s.x, top: s.y, opacity: talk}}>
    <div style={{transform: `rotate(${s.rot ?? -4}deg)`, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff', background: s.color ?? CORAL, padding: '10px 24px', borderRadius: 16, border: '5px solid #fff', boxShadow: '0 14px 26px rgba(80,60,0,.25)', whiteSpace: 'nowrap'}}>{s.text}</div>
  </Appear>)}
</>);

const TitleChip: React.FC<{cfg: Config}> = ({cfg}) => {
  const f = useCurrentFrame(); const p = pop(f, 0.1);
  return <div style={{position: 'absolute', left: 40, top: 46, display: 'flex', alignItems: 'center', gap: 0, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * -30}px)`, boxShadow: `0 6px 0 ${INK}`, borderRadius: 16, border: `3px solid ${INK}`, overflow: 'hidden'}}>
    {cfg.file && <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 26, color: '#fff', background: INK, padding: '14px 18px'}}>{cfg.file}</span>}
    <span style={{fontFamily: HEAD, fontWeight: 700, fontSize: 38, color: INK, background: CARD, padding: '8px 22px', whiteSpace: 'nowrap'}}>{cfg.title}</span>
  </div>;
};

/** captions on a white tooltip card; the current word gets a coral highlighter stroke */
const Captions: React.FC<{data: Data}> = ({data}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const pg = data.pages.find(p => t >= p.s && t < p.e); if (!pg) return null;
  const pin = pop(f, pg.s);
  return <div style={{position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center', opacity: clamp(pin * 1.6), transform: `translateY(${(1 - pin) * 16}px)`}}>
    <div style={{background: CARD, border: `3px solid ${INK}`, borderRadius: 24, padding: '14px 26px 18px', boxShadow: `0 8px 0 ${INK}`, textAlign: 'center'}}>
      {pg.lines.map((ln, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, lineHeight: 1.22, whiteSpace: 'nowrap', color: INK}}>
        {ln.map((w, j) => {
          const shown = t >= w.t - 0.03; const active = shown && t < w.e - 0.03;
          const sweep = clamp((t - w.t + 0.03) / 0.18);
          return <span key={j} style={{display: 'inline-block', margin: '0 6px', position: 'relative', opacity: shown ? 1 : 0.22, color: w.k ? BLUE : INK}}>
            {active && <span style={{position: 'absolute', left: -6, right: -6, top: '22%', bottom: '6%', background: CORAL, opacity: 0.45, borderRadius: 6, transform: `scaleX(${sweep}) skewX(-8deg)`, transformOrigin: 'left'}} />}
            <span style={{position: 'relative'}}>{w.w}</span>
          </span>;
        })}
      </div>)}
    </div>
  </div>;
};

export const Frame: React.FC<{data: Data; cfg: Config; scenes: Scene[]}> = ({data, cfg, scenes}) => {
  const t = useT(); const m = modeAt(t, cfg);
  return <AbsoluteFill style={{background: PAPER}}>
    <Backdrop cfg={cfg} talk={m.talk} />
    <Card scenes={scenes} m={m} />
    <Speaker cfg={cfg} m={m} />
    <Stickers cfg={cfg} talk={m.talk} />
    <TitleChip cfg={cfg} />
    <Captions data={data} />
  </AbsoluteFill>;
};
