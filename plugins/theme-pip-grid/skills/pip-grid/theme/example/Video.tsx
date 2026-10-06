// EXAMPLE: "How Instagram uploads large files" (112 s). Copy to src/Video.tsx and replace the scenes.
// Stage is 1080 x 1300 (frame y 170..1470). Keep x > 690, y < 350 clear for the PiP bubble.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Appear, Chip, Header, Panel, FileIcon, Phone, Server, Bucket, Progress, Chunk, ChunkState, Flow, BG, PANEL, LINE, WHITE, GREY, PINK, ORANGE, YELLOW, GREEN, RED, CYAN, HEAD, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;

const Label: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 30, color = WHITE, children, style}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const IgScreen: React.FC<{p?: number; fail?: boolean}> = ({p, fail}) => (
  <div style={{position: 'absolute', inset: 0, background: '#0b0b0c', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
    <Img src={staticFile('instagram.png')} style={{width: 110, height: 110, borderRadius: 26}} />
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, color: GREY}}>video.mp4 &middot; 500 MB</div>
    {p !== undefined && <Progress v={p} w={180} h={14} fail={fail} />}
  </div>
);
const Tick: React.FC<{ok?: boolean; children: React.ReactNode}> = ({ok = true, children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: WHITE, whiteSpace: 'nowrap'}}>
    <span style={{width: 44, height: 44, borderRadius: 22, background: ok ? GREEN : RED, color: BG, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>{ok ? '✓' : '✕'}</span>{children}
  </div>
);

// ------------------------------------------------------------------ 0 intro
const S0: React.FC = () => {
  const t = useT(); const bob = Math.sin(t * 5) * 10;
  return <>
    <Header t0={2.4} kicker="BUILDING BACKEND SYSTEMS" title="Large file uploads" />
    <Appear t0={2.6} from="scale" style={{left: 340, top: 420}}>
      <Img src={staticFile('instagram.png')} style={{width: 400, height: 400, borderRadius: 96}} />
    </Appear>
    <Appear t0={3.4} style={{left: 120, top: 520}}><div style={{transform: `translateY(${bob}px)`}}><FileIcon w={150} label="video.mp4" sub="500 MB" /></div></Appear>
    <Appear t0={5.4} from="scale" style={{left: 0, right: 0, top: 900, textAlign: 'center'}}><Chip size={34}>how does it upload?</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 1 naive: through the backend
const S1: React.FC = () => {
  const t = useT();
  return <>
    <Header t0={6.9} kicker="SIMPLE APPROACH" title="Upload via backend" />
    <Appear t0={6.95} from="left" style={{left: 40, top: 430}}><Phone w={250} h={460}><IgScreen p={ease(t, T.mb500, 6)} /></Phone></Appear>
    <Appear t0={T.jaayegi - 0.9} style={{left: 420, top: 560}}><Server w={230} label="BACKEND" /></Appear>
    <Appear t0={T.storage1 - 0.3} from="right" style={{left: 790, top: 560}}><Bucket w={240} label="STORAGE" fill={ease(t, T.storage1, 3) * 0.6} /></Appear>
    <Flow x1={300} y1={660} x2={420} y2={660} t0={T.jaayegi - 0.6} color={PINK} />
    <Flow x1={655} y1={660} x2={790} y2={660} t0={T.storage1 - 0.1} color={ORANGE} />
    <Appear t0={T.jaayegi - 0.4} style={{left: 0, right: 0, top: 990, textAlign: 'center'}}><Chip size={28}>500 MB &rarr; backend &rarr; storage</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 2 backend does all the work
const S2: React.FC = () => {
  const t = useT();
  return <>
    <Header t0={16.1} kicker="THE PROBLEM" title="Backend carries all" color={ORANGE} />
    <Appear t0={16.2} from="left" style={{left: 40, top: 400}}><Phone w={220} h={400}><IgScreen p={lerp(0.1, 0.8, ease(t, 16.4, 7))} /></Phone></Appear>
    <Appear t0={16.3} style={{left: 400, top: 450}}><Server w={260} label="BACKEND" hot={t > T.forward - 0.3} /></Appear>
    <Appear t0={16.4} from="right" style={{left: 820, top: 470}}><Bucket w={210} label="STORAGE" fill={lerp(0.1, 0.7, ease(t, T.forward, 2))} /></Appear>
    <Flow x1={270} y1={570} x2={400} y2={570} t0={16.4} color={PINK} n={6} speed={1.6} />
    <Flow x1={665} y1={570} x2={820} y2={570} t0={T.forward - 0.2} color={ORANGE} n={6} speed={1.6} />
    <Appear t0={T.receive - 0.2} from="left" style={{left: 300, top: 860}}><Tick>receive 500 MB</Tick></Appear>
    <Appear t0={T.connection - 0.2} from="left" style={{left: 300, top: 930}}><Tick>keep the connection open</Tick></Appear>
    <Appear t0={T.forward - 0.2} from="left" style={{left: 300, top: 1000}}><Tick>forward it to storage</Tick></Appear>
  </>;
};

// ------------------------------------------------------------------ 3 thousands of users
const S3: React.FC = () => {
  const t = useT();
  const load = ease(t, T.network - 0.3, 1.6);
  return <>
    <Header t0={24.4} kicker="AT SCALE" title="Thousands at once" color={RED} />
    <div style={{position: 'absolute', left: 40, top: 360, display: 'grid', gridTemplateColumns: 'repeat(6, 92px)', gap: 16}}>
      {Array.from({length: 18}).map((_, i) => <Appear key={i} t0={T.thousands - 0.3 + i * 0.05} from="scale" style={{position: 'relative'}}>
        <div style={{width: 92, height: 92, borderRadius: 20, background: PANEL, border: `3px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FileIcon w={44} color={i % 3 ? PINK : ORANGE} /></div>
      </Appear>)}
    </div>
    <Flow x1={660} y1={520} x2={800} y2={760} t0={T.thousands + 0.6} color={PINK} n={8} speed={2} />
    <Appear t0={T.thousands + 0.4} style={{left: 760, top: 760}}><Server w={250} label="BACKEND" hot={load > 0.6} /></Appear>
    <Appear t0={T.network - 0.3} style={{left: 60, top: 760}}><Progress v={lerp(0.2, 0.98, load)} w={600} label="NETWORK" fail={load > 0.8} /></Appear>
    <Appear t0={T.resources - 0.3} style={{left: 60, top: 870}}><Progress v={lerp(0.2, 0.95, ease(t, T.resources - 0.2, 1.4))} w={600} label="CPU / MEMORY" fail={t > T.resources + 1} /></Appear>
    <Appear t0={T.transfer - 0.3} from="scale" style={{left: 60, top: 1010}}><Chip size={30} color={RED}>spent just moving bytes</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 4 take the backend out of the data path
const S4: React.FC = () => {
  const t = useT();
  const aside = ease(t, T.hatate - 0.6, 0.8);
  return <>
    <Header t0={34.5} kicker="THE FIX" title="Get out of the way" color={GREEN} />
    <Appear t0={34.6} from="left" style={{left: 40, top: 520}}><Phone w={220} h={400}><IgScreen /></Phone></Appear>
    <div style={{position: 'absolute', left: 420, top: lerp(600, 360, aside), opacity: t > 34.6 ? 1 : 0}}><Server w={230} label="BACKEND" /></div>
    <Appear t0={34.7} from="right" style={{left: 780, top: 600}}><Bucket w={240} label="OBJECT STORAGE" /></Appear>
    <Flow x1={270} y1={720} x2={780} y2={720} t0={T.hatate - 0.2} color={GREEN} n={6} speed={1.4} />
    <Appear t0={T.role - 0.3} from="scale" style={{left: 300, top: 950}}><Chip size={30} color={GREEN}>new role: the gatekeeper</Chip></Appear>
    <Appear t0={T.khud - 0.2} style={{left: 320, top: 1040}}><Tick ok={false}>process the video</Tick></Appear>
    <Appear t0={T.receive2 - 0.2} style={{left: 320, top: 1110}}><Tick ok={false}>receive the video</Tick></Appear>
  </>;
};

// ------------------------------------------------------------------ 5 pre-signed URL sequence
const COLS = [170, 540, 910];
const Arrow: React.FC<{t0: number; from: number; to: number; y: number; label: string; color?: string}> = ({t0, from, to, y, label, color = PINK}) => {
  const t = useT(); if (t < t0 - 0.05) return null;
  const k = ease(t, t0, 0.5); const x1 = COLS[from], x2 = lerp(COLS[from], COLS[to], k); const dir = to > from ? 1 : -1;
  return <>
    <div style={{position: 'absolute', left: Math.min(x1, x2), top: y, width: Math.abs(x2 - x1), height: 6, background: color, borderRadius: 3}} />
    {k > 0.95 && <div style={{position: 'absolute', left: x2 - (dir > 0 ? 18 : 0), top: y - 12, width: 0, height: 0, borderTop: '15px solid transparent', borderBottom: '15px solid transparent', ...(dir > 0 ? {borderLeft: `20px solid ${color}`} : {borderRight: `20px solid ${color}`})}} />}
    <div style={{position: 'absolute', left: Math.min(COLS[from], COLS[to]) + 20, width: Math.abs(COLS[to] - COLS[from]) - 40, top: y - 46, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color, opacity: clamp(k * 2), whiteSpace: 'nowrap'}}>{label}</div>
  </>;
};
const S5: React.FC = () => {
  const t = useT();
  return <>
    <Header t0={45.0} kicker="PRE-SIGNED URL" title="Ask, then upload" />
    {['PHONE', 'BACKEND', 'STORAGE'].map((n, i) => <Appear key={n} t0={45.05 + i * 0.1} style={{left: COLS[i] - 120, top: 380, width: 240, textAlign: 'center'}}>
      <div style={{padding: '14px 0', borderRadius: 16, background: PANEL, border: `3px solid ${[PINK, CYAN, YELLOW][i]}`, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: WHITE}}>{n}</div>
    </Appear>)}
    {COLS.map((x, i) => <div key={i} style={{position: 'absolute', left: x - 2, top: 450, width: 4, height: t > 45.2 ? lerp(0, 760, ease(t, 45.2, 0.8)) : 0, background: `repeating-linear-gradient(${LINE} 0 14px, transparent 14px 26px)`}} />)}
    <Arrow t0={T.request1 - 0.2} from={0} to={1} y={560} label="1. I want to upload" />
    <Appear t0={T.authenticate - 0.2} style={{left: 560, top: 620}}><Chip size={24} color={GREEN}>auth &#10003;</Chip></Appear>
    <Appear t0={T.permission - 0.2} style={{left: 560, top: 690}}><Chip size={24} color={GREEN}>permission &#10003;</Chip></Appear>
    <Arrow t0={T.presigned - 0.2} from={1} to={0} y={830} label="2. pre-signed URL" color={CYAN} />
    <Appear t0={T.url1 - 0.1} style={{left: 40, top: 870}}><div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, color: GREY, background: PANEL, border: `2px solid ${LINE}`, borderRadius: 10, padding: '8px 14px', whiteSpace: 'nowrap'}}>https://store.../video.mp4?<span style={{color: CYAN}}>signature=a91f&amp;expires=15m</span></div></Appear>
    <Arrow t0={T.directly - 0.3} from={0} to={2} y={1060} label="3. PUT video, straight to storage" color={ORANGE} />
  </>;
};

// ------------------------------------------------------------------ 6 recap triangle
const S6: React.FC = () => {
  const t = useT();
  const s1 = t > T.phone - 0.2, s2 = t > T.url2 - 0.3, s3 = t > T.phone2 - 0.1;
  return <>
    <Header t0={59.5} kicker="THE FLOW" title="Three hops" />
    <Appear t0={59.6} from="scale" style={{left: 60, top: 760}}><Phone w={200} h={360}><IgScreen /></Phone></Appear>
    <Appear t0={59.7} from="scale" style={{left: 420, top: 360}}><Server w={220} label="BACKEND" /></Appear>
    <Appear t0={59.8} from="scale" style={{left: 790, top: 820}}><Bucket w={220} label="STORAGE" fill={s3 ? ease(t, T.phone2 + 0.4, 2) * 0.8 : 0} /></Appear>
    <Flow x1={230} y1={760} x2={440} y2={560} t0={T.phone - 0.2} color={PINK} stop={!s1} />
    <Flow x1={640} y1={560} x2={260} y2={800} t0={T.url2 - 0.3} color={CYAN} stop={!s2} />
    <Flow x1={270} y1={960} x2={790} y2={960} t0={T.phone2 - 0.1} color={ORANGE} n={6} />
    <Appear t0={T.phone - 0.2} style={{left: 150, top: 600}}><Chip size={24}>1 request</Chip></Appear>
    <Appear t0={T.url2 - 0.3} style={{left: 520, top: 700}}><Chip size={24} color={CYAN}>2 upload URL</Chip></Appear>
    <Appear t0={T.phone2 - 0.1} style={{left: 400, top: 1010}}><Chip size={24} color={ORANGE}>3 upload</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 7 single request fails
const S7: React.FC = () => {
  const t = useT();
  const failed = t > T.fail1 - 0.1; const restart = t > T.dobara - 0.1;
  const v = restart ? ease(t, T.dobara + 0.4, 3) * 0.2 : failed ? 0.73 : lerp(0, 0.73, ease(t, 66.5, T.fail1 - 66.6));
  return <>
    <Header t0={66.3} kicker="ONE BIG REQUEST" title="All or nothing" color={RED} />
    <Appear t0={66.4} from="left" style={{left: 60, top: 420}}><FileIcon w={170} label="video.mp4" sub="500 MB" /></Appear>
    <Appear t0={T.single - 0.3} style={{left: 290, top: 470}}><Label size={36}>1 request, 500 MB</Label></Appear>
    <Appear t0={66.5} style={{left: 60, top: 720}}><Progress v={v} w={960} h={44} label={restart ? 'RETRY FROM 0%' : failed ? 'NETWORK FAILED' : 'UPLOADING'} fail={failed && !restart} /></Appear>
    <Appear t0={T.fail1 - 0.1} from="scale" style={{left: 60, top: 860}}><Chip size={30} color={RED}>&#10005; failed at 73%</Chip></Appear>
    <Appear t0={T.dobara - 0.1} from="scale" style={{left: 450, top: 860}}><Chip size={30} color={RED}>start again from zero</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 8 + 9 multipart
const S8: React.FC = () => {
  const t = useT();
  const split = ease(t, T.part1 - 0.3, 0.6);
  const pt = [T.part1, T.part2, T.part3];
  return <>
    <Header t0={72.6} kicker="MULTIPART / RESUMABLE" title="Split into parts" color={YELLOW} />
    <Appear t0={T.multipart - 0.3} style={{left: 60, top: 360}}><Chip size={28} color={YELLOW}>multipart</Chip></Appear>
    <Appear t0={T.resumable - 0.3} style={{left: 300, top: 360}}><Chip size={28} color={YELLOW}>resumable</Chip></Appear>
    <Appear t0={73.0} style={{left: 60, top: 560, width: 960, height: 200}}>
      {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', top: 0, left: lerp(i * 320, i * 340, split), width: lerp(320, 280, split), height: 200, borderRadius: split > 0.1 ? 22 : 0, background: PANEL, border: `4px solid ${t > pt[i] - 0.2 ? [PINK, ORANGE, YELLOW][i] : LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={{fontFamily: HEAD, fontWeight: 700, fontSize: 48, color: t > pt[i] - 0.2 ? WHITE : GREY}}>PART {i + 1}</span>
      </div>)}
      <div style={{position: 'absolute', left: 0, top: -50, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: GREY, opacity: 1 - split}}>video.mp4 &middot; 500 MB</div>
    </Appear>
    <Appear t0={T.chunks - 0.2} from="scale" style={{left: 0, right: 0, top: 840, textAlign: 'center'}}><Chip size={30}>each part = its own request</Chip></Appear>
  </>;
};
const S9: React.FC = () => {
  const t = useT();
  const st = (i: number): ChunkState => {
    if (i < 2) return t > 83.6 + i * 0.4 ? 'done' : 'up';
    if (t > T.retry + 0.6) return 'done';
    if (t > T.retry - 0.2) return 'up';
    if (t > T.fail3 - 0.1) return 'fail';
    return 'up';
  };
  return <>
    <Header t0={83.3} kicker="ONE PART FAILS" title="Retry just that part" color={GREEN} />
    {[0, 1, 2].map(i => <Appear key={i} t0={83.35 + i * 0.08} style={{left: 60 + i * 210, top: 520}}>
      <Chunk n={`P${i + 1}`} s={st(i)} size={170} />
    </Appear>)}
    <Appear t0={83.4} from="right" style={{left: 790, top: 480}}><Bucket w={230} label="STORAGE" fill={(st(0) === 'done' ? 0.3 : 0) + (st(1) === 'done' ? 0.3 : 0) + (st(2) === 'done' ? 0.3 : 0)} /></Appear>
    <Appear t0={T.fail3 - 0.1} from="scale" style={{left: 60, top: 800}}><Chip size={30} color={RED}>part 3 &#10005; network error</Chip></Appear>
    <Appear t0={T.kya + 0.6} style={{left: 60, top: 900}}><Tick ok={false}>re-upload all 500 MB</Tick></Appear>
    <Appear t0={T.retry - 0.3} style={{left: 60, top: 970}}><Tick>retry only part 3</Tick></Appear>
  </>;
};

// ------------------------------------------------------------------ 10 combine
const S10: React.FC = () => {
  const t = useT();
  const m = ease(t, T.combine - 0.3, 0.9);
  return <>
    <Header t0={89.5} kicker="AFTER UPLOAD" title="Stitched together" color={GREEN} />
    {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', left: lerp(80 + i * 210, 380 + i * 110, m), top: lerp(460, 680, m), opacity: t > 89.6 ? 1 - m * 0.95 : 0}}><Chunk n={`P${i + 1}`} s="done" size={150} /></div>)}
    <Appear t0={T.final - 0.2} from="scale" style={{left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, padding: '26px 40px', borderRadius: 24, background: PANEL, border: `4px solid ${GREEN}`}}>
        <FileIcon w={120} color={GREEN} />
        <div><Label size={44}>video.mp4</Label><Label size={28} color={GREEN}>500 MB &middot; complete &#10003;</Label></div>
      </div>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 11 high-level architecture
const S11: React.FC = () => {
  const t = useT();
  return <>
    <Header t0={93.5} kicker="HIGH LEVEL" title="The architecture" />
    <Appear t0={93.6} from="left" style={{left: 40, top: 760}}><Phone w={200} h={360}><IgScreen p={ease(t, T.object5, 3)} /></Phone></Appear>
    <Appear t0={93.7} from="down" style={{left: 40, top: 330}}>
      <Panel w={600} h={300} border={CYAN}>
        <div style={{position: 'absolute', left: 24, top: 10, display: 'flex', alignItems: 'center', gap: 16}}><Server w={90} /><Label size={38}>BACKEND</Label></div>
        <div style={{position: 'absolute', left: 30, top: 140, display: 'flex', flexDirection: 'column', gap: 10}}>
          <Appear t0={T.authn - 0.2} style={{position: 'relative'}}><Label size={28} color={GREEN}>&#10003; authentication</Label></Appear>
          <Appear t0={T.authz - 0.2} style={{position: 'relative'}}><Label size={28} color={GREEN}>&#10003; authorization</Label></Appear>
          <Appear t0={T.orchestration - 0.3} style={{position: 'relative'}}><Label size={28} color={GREEN}>&#10003; upload orchestration</Label></Appear>
        </div>
      </Panel>
    </Appear>
    <Appear t0={93.8} from="right" style={{left: 760, top: 760}}><Bucket w={260} label="OBJECT STORAGE" fill={ease(t, T.object5, 3) * 0.85} /></Appear>
    <Flow x1={140} y1={760} x2={180} y2={635} t0={T.client5 - 0.1} color={PINK} />
    <Appear t0={T.client5} style={{left: 200, top: 670}}><Chip size={22}>1 request</Chip></Appear>
    <Flow x1={480} y1={635} x2={250} y2={830} t0={T.presigned2 - 0.3} color={CYAN} />
    <Appear t0={T.presigned2 - 0.2} style={{left: 420, top: 690}}><Chip size={22} color={CYAN}>2 pre-signed URL</Chip></Appear>
    <Flow x1={250} y1={1000} x2={760} y2={1000} t0={T.object5 - 0.2} color={ORANGE} n={6} />
    {t > T.parts5 - 0.2 && [0, 1, 2].map(i => { const ph = ((t - T.parts5) * 0.7 + i / 3) % 1; return <div key={i} style={{position: 'absolute', left: lerp(260, 700, ph), top: 1040}}><Chunk n={`P${i + 1}`} s="up" size={54} /></div>; })}
    <Appear t0={T.object6 - 0.3} from="scale" style={{left: 600, top: 1170}}><Chip size={24} color={YELLOW}>stores the actual file</Chip></Appear>
  </>;
};

export const scenes: Scene[] = [
  {a: 2.4, b: 6.85, el: S0}, {a: 6.85, b: 16.1, el: S1}, {a: 16.1, b: 24.4, el: S2}, {a: 24.4, b: 34.5, el: S3}, {a: 34.5, b: 45.0, el: S4},
  {a: 45.0, b: 59.5, el: S5}, {a: 59.5, b: 66.3, el: S6}, {a: 66.3, b: 72.6, el: S7}, {a: 72.6, b: 83.3, el: S8}, {a: 83.3, b: 89.5, el: S9},
  {a: 89.5, b: 93.5, el: S10}, {a: 93.5, b: 109.5, el: S11}];

export const cfg: Config = {
  title: 'How Instagram uploads large files',
  icon: 'instagram.png',
  pip: {cx: 530, cy: 560, r: 400},
  full: [[0, 2.4]],
  pipFocus: [[109.5, 999]],
};
