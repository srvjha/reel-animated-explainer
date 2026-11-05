// How Netflix changes video quality automatically (ABR). Theme: red-signal. Voice-over only (no speaker shots).
// Hard cuts between Pexels stock clips (free license) and red-dotted pages. On-screen text English.
// Bitrates, chunk lengths, speeds and buffer sizes are illustrative.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, lerp, ease, useT} from './core';
import {Config, pop, Head, Card, Tag, QBadge, Signal, Chunk, Player, Icon, At, Center, Appear, PopIn, Txt,
  RED, DEEP, WHITE, MUTED, DIM, EDGE, QC, DISPLAY, SANS, MONO, W} from './theme/kit';
import data from './data.json';

const ws = (data as any).pages.flatMap((p: any) => p.words);
const T = (w: string, n = 1) => { let c = 0; for (const x of ws) if (x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w) { c++; if (c === n) return x.t; } return 0; };
const END = (data as any).duration;

export const cfg: Config = {
  capSkip: 3.1,
  cuts: [
    {a: 0, b: 3.15, m: 'clip', src: 'clips/netflix.mp4', from: 7.5},
    {a: 3.15, b: 4.5, m: 'clip', src: 'clips/train.mp4', from: 1.0},
    {a: 4.5, b: 6.8, m: 'clip', src: 'clips/car.mp4', from: 0.5},
    {a: 6.8, b: 16.0, m: 'page'},
    {a: 16.0, b: 19.1, m: 'clip', src: 'clips/bed.mp4', from: 2.0},
    {a: 19.1, b: 46.5, m: 'page'},
    {a: 46.5, b: 48.6, m: 'clip', src: 'clips/remote.mp4', from: 5.5},
    {a: 48.6, b: 79.4, m: 'page'},
    {a: 79.4, b: 82.7, m: 'clip', src: 'clips/subway.mp4', from: 2.0},
    {a: 82.7, b: 98.9, m: 'page'},
    {a: 98.9, b: 103.8, m: 'clip', src: 'clips/anim.mp4', from: 1.0},
    {a: 103.8, b: 106.4, m: 'clip', src: 'clips/racecar.mp4', from: 3.0},
    {a: 106.4, b: END + 1, m: 'page'},
  ],
};

const Note: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 1540}) => <At x={80} y={y}><Txt size={22} font={MONO} w={500} color={DIM}>{children}</Txt></At>;

// ------------------------------------------------------------------ clip overlays
const Hook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30; if (t > 3.15) return null;
  const words = (data as any).pages.slice(0, 2).flatMap((p: any) => p.words) as {w: string; t: number; e: number}[];
  const lines = [words.slice(0, 4), words.slice(4)];
  return <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
    {lines.map((ln, i) => <div key={i} style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
      {ln.map((w, j) => {
        const shown = t >= w.t - 0.05; const active = shown && t < w.e - 0.03; const p = shown ? pop(f, w.t - 0.05) : 0;
        const isN = w.w.toLowerCase().startsWith('netflix');
        return <React.Fragment key={j}>
          {isN && <div style={{width: 70, height: 70, margin: '0 4px 0 8px', transform: `scale(${0.4 + 0.6 * p})`, opacity: shown ? 1 : 0}}><Img src={staticFile('netflix.png')} style={{width: 70, height: 70, borderRadius: 14, boxShadow: '0 0 0 3px rgba(255,255,255,.85)'}} /></div>}
          <span style={{display: 'inline-block', margin: '0 5px', padding: '0 14px', borderRadius: 16, fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.25, letterSpacing: -1.5,
            opacity: shown ? 1 : 0.35, transform: `translateY(${(1 - p) * 12}px)`, color: WHITE, background: active ? RED : 'transparent',
            textShadow: active ? 'none' : '0 0 6px #000, 0 4px 0 #000, 0 0 28px rgba(0,0,0,.95)'}}>{w.w}</span>
        </React.Fragment>;
      })}
    </div>)}
  </div>;
};
const Travel: React.FC = () => {
  const t = useT(); if (t < 3.15 || t > 6.8) return null;
  return <At x={80} y={300}><Appear t0={3.4}><Tag icon="device-mobile" size={32}>streaming on the move</Tag></Appear></At>;
};
const Moving: React.FC = () => {
  const t = useT(); if (t < 79.4 || t > 82.7) return null;
  return <><At x={80} y={300}><Appear t0={T('change', 2)}><Tag size={32}>quality changes</Tag></Appear></At>
    <At x={80} y={380}><Appear t0={T('playback')}><Tag solid={false} size={32} icon="play">playback keeps going</Tag></Appear></At></>;
};
const Simple: React.FC = () => {
  const t = useT(); if (t < 98.9 || t > 103.8) return null;
  return <Card x={80} y={300} w={920} t0={T('simple')} style={{padding: '24px 30px'}}>
    <Txt size={26} font={MONO} w={700} color={MUTED}>SIMPLE ANIMATION</Txt>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}><QBadge q="1080p" /><Txt size={44} w={800}>looks good at 1.5 Mbps</Txt></div>
  </Card>;
};
const Action: React.FC = () => {
  const t = useT(); if (t < 103.8 || t > 106.4) return null;
  return <Card x={80} y={300} w={920} t0={103.9} hot style={{padding: '24px 30px'}}>
    <Txt size={26} font={MONO} w={700} color={WHITE}>FAST ACTION MOVIE</Txt>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}><QBadge q="1080p" style={{background: '#000'}} /><Txt size={44} w={800}>needs about 6 Mbps</Txt></div>
  </Card>;
};
cfg.overlays = [Hook, Travel, Moving, Simple, Action];

// ------------------------------------------------------------------ pages
const Weak: React.FC = () => {
  const t = useT(); const l0 = T('lag'), b0 = T('blur'), r0 = T('rukta'), ok = T('theek'), hd = T('hd');
  const bad = t >= l0 && t < ok + 0.3;
  const blur = bad ? 14 * ease(t, b0 - 0.3, 0.6) : (t > ok ? 14 * (1 - ease(t, ok + 0.3, 0.8)) : 0);
  const level = t < l0 ? 4 : t < ok ? 1 : 4;
  const badge = t < b0 - 0.2 ? '1080p' : t < hd - 0.2 ? '240p' : '1080p';
  const played = 0.12 + (t - 6.8) * 0.022;
  return <>
    <Head t0={6.9} label="ON A TRAIN" title="Weak network" />
    <Player x={80} y={420} w={920} img="movie.jpg" blur={blur} played={played} buffered={played + (bad ? 0.04 : 0.2)} badge={badge} t0={7.0} />
    <Card x={80} y={1010} w={440} t0={7.1} style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Signal level={level} size={64} /><div><Txt size={24} font={MONO} w={700} color={MUTED}>NETWORK</Txt><Txt size={40} w={800} color={bad ? RED : WHITE}>{bad ? 'weak' : 'good'}</Txt></div></Card>
    <Card x={560} y={1010} w={440} t0={7.1} style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Icon name="play" size={60} color={RED} /><div><Txt size={24} font={MONO} w={700} color={MUTED}>PLAYBACK</Txt><Txt size={40} w={800}>never stops</Txt></div></Card>
    <Center y={1260}><Appear t0={r0 - 0.3}><Tag size={32}>{t < ok ? 'blurry, but still playing' : 'back to HD'}</Tag></Appear></Center>
  </>;
};

const Abr: React.FC = () => {
  const t = useT(); const a0 = T('adaptive'), s0 = T('abr');
  const k = ease(t, s0 - 0.1, 0.5);
  const word = (w: string, hl: number[]) => w.split('').map((ch, i) => <span key={i} style={{color: hl.includes(i) ? RED : WHITE}}>{ch}</span>);
  return <>
    <Head t0={19.2} label="THE CONCEPT" title="Behind the magic" />
    <Center y={620}><Appear t0={a0 - 0.2}><div style={{fontFamily: DISPLAY, fontSize: 104, letterSpacing: 2, whiteSpace: 'nowrap', opacity: 1 - 0.55 * k}}>
      {word('ADAPTIVE', [0])} {word('BITRATE', [0, 3])} {word('STREAMING', [])}</div></Appear></Center>
    <Center y={800}><div style={{transform: `scale(${0.5 + 0.5 * k})`, opacity: k}}>
      <div style={{fontFamily: DISPLAY, fontSize: 340, color: WHITE, lineHeight: 1, padding: '10px 60px 0', borderRadius: 40, background: RED, boxShadow: `0 30px 120px ${RED}88`}}>ABR</div></div></Center>
    <Center y={1250}><Appear t0={s0 + 0.4}><Txt size={34} font={MONO} w={500} color={MUTED}>quality adapts to your network</Txt></Appear></Center>
  </>;
};

const Q = ['240p', '480p', '720p', '1080p', '4K'];
const Chunks: React.FC = () => {
  const t = useT(); const f0 = T('badi'), n0 = T('nahi', 2), c0 = T('chunks'), s0 = T('seconds'), k0 = T('chunking'), q0 = T('qualities');
  const split = ease(t, c0, 0.6); const n = 7; const cw = 112;
  const stack = ease(t, q0 - 0.3, 0.5);
  return <>
    <Head t0={24.6} label="STEP 1" title="Not one big file" />
    <div style={{position: 'absolute', left: 80, top: 470, width: 920, opacity: (1 - split) * ease(t, f0 - 0.3, 0.4)}}>
      <div style={{height: 120, borderRadius: 16, background: DEEP, border: `2px solid ${EDGE}`, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 18}}>
        <Icon name="file-video" size={60} /><Txt size={40} w={800}>movie.mp4</Txt><Txt size={32} font={MONO} w={500} color={MUTED}>2 hours, 1 file</Txt></div>
      {t > n0 && <div style={{position: 'absolute', left: -10, right: -10, top: 58, height: 8, background: WHITE, transform: `scaleX(${ease(t, n0, 0.3)})`, transformOrigin: 'left'}} />}
    </div>
    {split > 0 && Array.from({length: n}, (_, i) => {
      const x = 80 + i * (cw + 22) * split + i * (920 / n) * (1 - split) * 0.98;
      return <div key={i} style={{position: 'absolute', left: x, top: 470, opacity: split}}>
        <Chunk q="1080p" w={cw} h={120} label={`#${i + 1}`} />
        <Appear t0={s0 + i * 0.06}><Txt size={24} font={MONO} w={700} color={MUTED} style={{textAlign: 'center', marginTop: 10}}>4 s</Txt></Appear>
        {stack > 0 && [0, 1, 2, 4].map((qi, r) => <div key={r} style={{marginTop: 12, opacity: ease(t, q0 + r * 0.12 + i * 0.03, 0.3)}}><Chunk q={Q[qi]} w={cw} h={70} label={Q[qi]} /></div>)}
      </div>;
    })}
    <Center y={1330}><Appear t0={k0}><Tag size={32} icon="film-strip">chunking / segmentation</Tag></Appear></Center>
    <Note y={1420}>chunk length is illustrative</Note>
  </>;
};

const RATES: [string, number][] = [['240p', 0.3], ['480p', 1], ['720p', 3], ['1080p', 5], ['4K', 15]];
const Ladder: React.FC = () => {
  const t = useT(); const times = ['240p', '480p', '720p', '1080p', '4k'].map(q => T(q)); const b0 = T('bitrate', 2), d0 = T('data');
  return <>
    <Head t0={37.0} label="EVERY CHUNK" title="Ready in 5 qualities" />
    <At x={80} y={430}><Appear t0={b0}><div style={{display: 'flex', width: 920, justifyContent: 'space-between'}}><Txt size={24} font={MONO} w={700} color={MUTED}>QUALITY</Txt><Txt size={24} font={MONO} w={700} color={MUTED}>BITRATE</Txt></div></Appear></At>
    {RATES.map(([q, r], i) => <At key={q} x={80} y={490 + i * 150}><Appear t0={times[i] - 0.1}><div style={{display: 'flex', alignItems: 'center', gap: 24, width: 920}}>
      <div style={{width: 150}}><QBadge q={q} size={40} /></div>
      <div style={{flex: 1, height: 26, borderRadius: 13, background: '#1E1E22'}}>
        <div style={{height: 26, borderRadius: 13, background: QC[q], width: `${Math.max(4, Math.sqrt(r / 15) * 100) * ease(t, b0 + i * 0.1, 0.6)}%`}} /></div>
      <div style={{width: 170, textAlign: 'right'}}><Appear t0={b0 + i * 0.1}><Txt size={36} w={800}>{r} Mbps</Txt></Appear></div>
    </div></Appear></At>)}
    <Card x={80} y={1250} w={920} t0={d0 - 0.6} style={{padding: '20px 28px'}}><Txt size={34} w={800}>bitrate = data per second of video</Txt></Card>
    <Note y={1400}>bitrates are illustrative</Note>
  </>;
};

const Manifest: React.FC = () => {
  const m0 = T('manifest'), menu = T('menu'), q0 = T('qualities', 2), c0 = T('chunks', 2);
  const lines = ['1080p/seg_001.m4s', '1080p/seg_002.m4s', '480p/seg_001.m4s', '...'];
  return <>
    <Head t0={48.7} label="ON PLAY" title="Manifest file" />
    <Card x={80} y={420} w={920} t0={m0 - 0.2}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name="list-bullets" size={46} color={RED} /><Txt size={36} font={MONO} w={700}>manifest</Txt>
        <div style={{marginLeft: 'auto'}}><Appear t0={menu}><Tag size={24} solid={false}>the menu</Tag></Appear></div></div>
      <div style={{height: 2, background: EDGE, margin: '22px 0'}} />
      <Txt size={24} font={MONO} w={700} color={MUTED}>QUALITIES AVAILABLE</Txt>
      <div style={{display: 'flex', gap: 14, marginTop: 14}}>{Q.map((q, i) => <PopIn key={q} t0={q0 + i * 0.1}><QBadge q={q} size={32} /></PopIn>)}</div>
      <Txt size={24} font={MONO} w={700} color={MUTED} style={{marginTop: 30}}>WHERE THE CHUNKS ARE</Txt>
      {lines.map((l, i) => <Appear key={i} t0={c0 + i * 0.15}><Txt size={32} font={MONO} w={500} style={{marginTop: 12}}><span style={{color: DIM}}>cdn/</span>{l}</Txt></Appear>)}
    </Card>
  </>;
};

const Monitor: React.FC = () => {
  const t = useT(); const s0 = T('speed'), b0 = T('buffer'), m0 = T('matlab', 3);
  const mb = 8.2 + Math.sin(t * 2.3) * 0.6;
  return <>
    <Head t0={56.4} label="ALWAYS WATCHING" title="Speed + buffer" />
    <Card x={80} y={430} w={440} h={330} t0={s0 - 0.3}>
      <Txt size={24} font={MONO} w={700} color={MUTED}>1 · INTERNET SPEED</Txt>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 34}}><Signal level={4} size={70} /><Txt size={64} w={800}>{mb.toFixed(1)}</Txt></div>
      <Txt size={30} font={MONO} w={500} color={MUTED} style={{marginTop: 10}}>Mbps</Txt>
    </Card>
    <Card x={560} y={430} w={440} h={330} t0={b0 - 0.2}>
      <Txt size={24} font={MONO} w={700} color={MUTED}>2 · BUFFER</Txt>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 34, height: 90}}>{Array.from({length: 6}, (_, i) => <Chunk key={i} q="1080p" w={52} h={80} label="" t0={b0 + i * 0.1} />)}</div>
      <Txt size={30} font={MONO} w={500} color={MUTED} style={{marginTop: 18}}>24 s ahead</Txt>
    </Card>
    <Player x={80} y={840} w={920} img="movie.jpg" played={0.3} buffered={0.3 + 0.25 * ease(t, m0, 0.8)} t0={m0 - 0.5} badge="1080p" />
    {t > m0 && <At x={80 + 920 * 0.3 + 10} y={1440}><Appear t0={m0 + 0.4}><Txt size={28} font={MONO} w={700}>↑ buffer: already on your phone</Txt></Appear></At>}
    <Note y={1520}>speed and buffer values are illustrative</Note>
  </>;
};

const Decide: React.FC = () => {
  const t = useT(); const h0 = T('har', 4), s0 = T('speed', 2), g0 = T('gir'), tk = T('taaki');
  const seq: [string, number][] = [['1080p', h0 + 0.6], ['1080p', s0 + 0.3], ['1080p', s0 + 1.4], ['240p', g0 + 0.5], ['480p', tk + 0.2], ['720p', tk + 1.4]];
  const tEnd = tk + 2.0;
  const speed = (tt: number) => tt < g0 ? 0.85 : tt < tk + 0.8 ? 0.22 : 0.55;
  const gx = 80, gy = 470, gw = 920, gh = 230;
  const pts = Array.from({length: 80}, (_, i) => { const x = i / 79; const tt = h0 + x * (tEnd - h0); return [gx + x * gw, gy + gh - speed(tt) * gh + Math.sin(i * 1.7) * 6, tt]; });
  const bufferS = t < g0 ? 24 : t < tk ? lerp(24, 9, clamp((t - g0) / 2)) : lerp(9, 14, clamp((t - tk) / 2));
  return <>
    <Head t0={67.0} label="BEFORE EVERY CHUNK" title="Pick the quality" />
    <At x={gx} y={gy - 50}><Txt size={24} font={MONO} w={700} color={MUTED}>INTERNET SPEED</Txt></At>
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect x={gx} y={gy} width={gw} height={gh} rx={14} fill="#111114" stroke={EDGE} strokeWidth={2} />
      <polyline points={pts.filter(p => p[2] <= t).map(p => `${p[0]},${p[1]}`).join(' ')} fill="none" stroke={RED} strokeWidth={6} strokeLinejoin="round" />
    </svg>
    {t > g0 && <At x={560} y={gy + gh - 70}><Appear t0={g0}><Tag size={24} solid={false}>speed drops</Tag></Appear></At>}
    <At x={gx} y={790}><Txt size={24} font={MONO} w={700} color={MUTED}>CHUNKS REQUESTED</Txt></At>
    <div style={{position: 'absolute', left: gx, top: 840, display: 'flex', gap: 14}}>{seq.map(([q, t0], i) => <Chunk key={i} q={q} w={140} h={120} t0={t0} />)}</div>
    <Card x={80} y={1020} w={920} t0={h0 + 0.3} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '22px 28px'}}>
      <Txt size={24} font={MONO} w={700} color={MUTED}>BUFFER</Txt>
      <div style={{flex: 1, height: 24, borderRadius: 12, background: '#24242A'}}><div style={{height: 24, borderRadius: 12, width: `${bufferS / 30 * 100}%`, background: bufferS < 12 ? DEEP : RED}} /></div>
      <Txt size={34} w={800}>{Math.round(bufferS)} s</Txt>
    </Card>
    <At x={80} y={1180}><Appear t0={s0}><Txt size={34} w={700}>speed good + buffer full → <span style={{color: RED}}>HD chunk</span></Txt></Appear></At>
    <At x={80} y={1250}><Appear t0={g0}><Txt size={34} w={700}>speed drops → <span style={{color: RED}}>lower quality next</span></Txt></Appear></At>
    <At x={80} y={1320}><Appear t0={tk}><Txt size={34} w={700}>buffer never empties → <span style={{color: RED}}>no stopping</span></Txt></Appear></At>
  </>;
};

const Startup: React.FC = () => {
  const t = useT(); const s0 = T('start'), sh = T('sharp'), p0 = T('player', 4), b0 = T('badhata');
  const steps: [string, number][] = [['240p', s0 - 0.3], ['480p', sh - 0.6], ['720p', sh + 0.2], ['1080p', b0 - 0.6]];
  const cur = steps.filter(s => t >= s[1]).pop();
  const blur = cur ? ({'240p': 12, '480p': 7, '720p': 3, '1080p': 0} as any)[cur[0]] : 12;
  const cx = 80, cy = 1000, cw = 920, ch = 380;
  return <>
    <Head t0={82.8} label="WHY IT STARTS BLURRY" title="Start low, then climb" />
    <Player x={170} y={380} w={740} img="movie.jpg" blur={blur} played={0.05 + (t - 82.7) * 0.01} buffered={0.15 + (t - 82.7) * 0.02} badge={cur ? cur[0] : undefined} t0={82.9} />
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
      <line x1={cx} y1={cy + ch} x2={cx + cw} y2={cy + ch} stroke={EDGE} strokeWidth={3} />
      {steps.map(([q, t0], i) => { const k = ease(t, t0, 0.35); const h = (i + 1) / 4 * (ch - 40); const x = cx + i * (cw / 4);
        return <rect key={q} x={x + 8} y={cy + ch - h * k} width={cw / 4 - 16} height={h * k} rx={10} fill={QC[q]} />; })}
    </svg>
    {steps.map(([q, t0], i) => <At key={q} x={cx + i * (cw / 4)} y={cy + ch + 14}><Appear t0={t0}><div style={{width: cw / 4, textAlign: 'center'}}><Txt size={28} font={MONO} w={700}>{q}</Txt></div></Appear></At>)}
    <At x={cx} y={cy - 50}><Appear t0={p0}><Txt size={24} font={MONO} w={700} color={MUTED}>QUALITY OVER TIME →</Txt></Appear></At>
  </>;
};

const PerTitle: React.FC = () => {
  const h0 = T('har', 5);
  const A: [string, number][] = [['720p', 0.8], ['1080p', 1.5]], B: [string, number][] = [['720p', 3.5], ['1080p', 6]];
  const col = (x: number, title: string, icon: string, rows: [string, number][], t0: number) => <Card x={x} y={560} w={440} t0={t0}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name={icon} size={46} color={RED} /><Txt size={32} w={800}>{title}</Txt></div>
    <div style={{height: 2, background: EDGE, margin: '20px 0'}} />
    {rows.map(([q, r]) => <div key={q} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14}}><QBadge q={q} size={30} /><Txt size={34} w={800}>{r} Mbps</Txt></div>)}
  </Card>;
  return <>
    <Head t0={92.3} label="NETFLIX EXTRA" title="Per-title encoding" />
    <Center y={430}><Appear t0={h0}><Txt size={34} w={700} color={MUTED}>each show gets its own encoding settings</Txt></Appear></Center>
    {col(80, 'Animation show', 'television', A, h0 + 0.4)}
    {col(560, 'Action movie', 'film-strip', B, h0 + 0.8)}
    <Note y={1000}>bitrates are illustrative</Note>
  </>;
};

const Outro: React.FC = () => (
  <>
    <Center y={560}><PopIn t0={106.5}><Img src={staticFile('netflix.png')} style={{width: 170, height: 170, borderRadius: 36}} /></PopIn></Center>
    <Center y={800}><Appear t0={106.7}><div style={{fontFamily: DISPLAY, fontSize: 120, color: WHITE, whiteSpace: 'nowrap', letterSpacing: 1}}>Right bitrate <span style={{color: RED}}>per show</span></div></Appear></Center>
    <Center y={960}><Appear t0={107.1}><Tag size={34} icon="lightning">less data, same quality</Tag></Appear></Center>
  </>
);

export const scenes = [
  {a: 6.8, b: 16.0, el: Weak},
  {a: 19.1, b: 24.5, el: Abr},
  {a: 24.5, b: 36.9, el: Chunks},
  {a: 36.9, b: 46.5, el: Ladder},
  {a: 48.6, b: 56.3, el: Manifest},
  {a: 56.3, b: 66.9, el: Monitor},
  {a: 66.9, b: 79.4, el: Decide},
  {a: 82.7, b: 92.1, el: Startup},
  {a: 92.1, b: 98.9, el: PerTitle},
  {a: 106.4, b: END + 1, el: Outro},
];
