// How Netflix handles millions of requests. Theme: noir-red. Not part of a series (no banner).
// Card scenes: 1000 x 840. Icons: lucide-static + simple-icons in public/icons.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Scene, clamp, lerp, ease, useT, Shake} from './core';
import {Config, Appear, Tag, Heading, Flow, Meter, Icon, Node, BLACK, PANEL2, LINE, FULL_H, WHITE, GREY, RED, DEEP, GREEN, AMBER, DISPLAY, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;

const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>
);
const Label: React.FC<{size?: number; color?: string; font?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 30, color = WHITE, font = SANS, children, style}) => (
  <div style={{fontFamily: font, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.1, ...style}}>{children}</div>
);
/** small server tile */
const Srv: React.FC<{icon?: string; label: string; w?: number; h?: number; state?: 'ok' | 'hot' | 'dead' | 'good' | 'dim'; sub?: string}> = ({icon = 'server', label, w = 200, h = 120, state = 'ok', sub}) => {
  const c = state === 'hot' || state === 'dead' ? RED : state === 'good' ? GREEN : WHITE;
  return <div style={{width: w, height: h, borderRadius: 18, background: state === 'dead' ? '#1d0708' : PANEL2, border: `2px solid ${state === 'ok' || state === 'dim' ? LINE : c}`, boxShadow: state === 'hot' || state === 'good' ? `0 0 26px ${c}55` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: state === 'dim' ? 0.35 : 1, position: 'relative'}}>
    <Icon name={state === 'dead' ? 'skull' : icon} size={Math.min(h * 0.4, 56)} color={c} />
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: WHITE, whiteSpace: 'nowrap'}}>{label}</div>
    {sub && <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 17, color: GREY, whiteSpace: 'nowrap'}}>{sub}</div>}
  </div>;
};
const Chip: React.FC<{icon: string; children: React.ReactNode; color?: string; size?: number}> = ({icon, children, color = RED, size = 30}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderRadius: 16, background: 'rgba(10,10,10,.88)', border: `2px solid ${color}`, boxShadow: `0 0 30px ${color}44`}}>
    <Icon name={icon} size={size * 1.2} color={color} />
    <span style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color: WHITE, whiteSpace: 'nowrap'}}>{children}</span>
  </div>
);

// ------------------------------------------------------------------ 01 a normal backend melts
const S1: React.FC = () => {
  const t = useT();
  const load = clamp(0.15 + 0.85 * ease(t, T.traffic - 0.4, 1.8));
  const dead = t > T.fail;
  return <>
    <Heading t0={9.05} kicker="THE PROBLEM" title="ONE NORMAL BACKEND?" />
    <At x={40} y={180} style={{display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: 14}}>
      {Array.from({length: 24}).map((_, i) => {
        const on = t > 9.2 + i * 0.07;
        return <div key={i} style={{width: 80, height: 80, borderRadius: 16, background: PANEL2, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.4})`}}>
          <Icon name={['smartphone', 'tv', 'laptop'][i % 3]} size={44} color={i % 5 === 0 ? RED : WHITE} />
        </div>;
      })}
    </At>
    <Flow x1={420} y1={300} x2={640} y2={420} t0={9.8} n={6} speed={1.6} />
    <Flow x1={420} y1={460} x2={640} y2={430} t0={10.0} n={6} speed={1.9} />
    <Flow x1={420} y1={620} x2={640} y2={440} t0={10.2} n={6} speed={1.7} />
    <Appear t0={T.normal} from="scale" style={{left: 650, top: 300}}>
      <Shake t0={T.fail} d={0.6} amp={14}><Node icon={dead ? 'flame' : 'server'} label="BACKEND" sub="single server" w={300} hot={dead} /></Shake>
    </Appear>
    <Appear t0={T.traffic - 0.3} style={{left: 650, top: 560}}><Meter v={load} w={300} label="LOAD" /></Appear>
    <Appear t0={T.fail} from="scale" style={{left: 660, top: 660}}><Tag solid size={30}>503 · DOWN</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 02 Zuul edge gateway
const S2: React.FC = () => {
  const t = useT();
  const devs: [string, string][] = [['tv', 'TV'], ['smartphone', 'MOBILE'], ['laptop', 'WEB']];
  const svcs: [string, string][] = [['search', 'SEARCH'], ['zap', 'RECS'], ['play', 'PLAYBACK']];
  return <>
    <Heading t0={T.jab} kicker="STEP 1 · EDGE LAYER" title="ZUUL = API GATEWAY" />
    {devs.map(([ic, l], i) => <Appear key={i} t0={T.jab + 0.2 + i * 0.15} from="left" style={{left: 24, top: 190 + i * 190}}><Node icon={ic} label={l} w={150} /></Appear>)}
    {devs.map((_, i) => <Flow key={i} x1={176} y1={262 + i * 190} x2={340} y2={400} t0={21.9 + i * 0.1} n={3} speed={1.3} />)}
    <Appear t0={T.zuul} from="scale" style={{left: 345, top: 290}}>
      <Node icon="shield-check" label="ZUUL" sub={t > T.edge ? 'edge · API gateway' : ' '} w={270} hot />
    </Appear>
    {([['route', 'ROUTING', T.routing], ['lock', 'AUTHENTICATION', T.auth], ['gauge', 'LOAD SHEDDING', T.shed]] as [string, string, number][]).map(([ic, l, t0], i) =>
      <Appear key={i} t0={t0} from="up" style={{left: 330, top: 535 + i * 92}}><Chip icon={ic} size={26}>{l}</Chip></Appear>)}
    {svcs.map((_, i) => <Flow key={i} x1={616} y1={400} x2={790} y2={265 + i * 200} t0={T.service + i * 0.1} n={3} speed={1.3} />)}
    {svcs.map(([ic, l], i) => <Appear key={i} t0={T.service + 0.1 + i * 0.12} from="right" style={{left: 795, top: 190 + i * 200}}><Node icon={ic} label={l} w={180} /></Appear>)}
  </>;
};

// ------------------------------------------------------------------ 03 monolith -> microservices
const MS: [string, string, string][] = [['lock', 'AUTH', 'login'], ['search', 'SEARCH', 'titles'], ['zap', 'RECS', 'for you'], ['play', 'PLAYBACK', 'stream'], ['layers', 'BILLING', 'plans'], ['users', 'PROFILES', "who's watching"]];
const S3: React.FC = () => {
  const t = useT(); const split = ease(t, T.micro, 0.8);
  const mono = t < T.micro + 0.6;
  return <>
    <Heading t0={33.7} kicker="STEP 2 · ARCHITECTURE" title={t < T.micro ? 'NOT A MONOLITH' : 'MICROSERVICES'} />
    {mono && <div style={{position: 'absolute', left: 250, top: 220, width: 500, height: 400, opacity: (t > T.monolith - 0.1 ? ease(t, T.monolith - 0.1, 0.4) : 0) * (1 - split), transform: `scale(${1 + split * 0.3})`}}>
      <Shake t0={T.micro - 0.3} d={0.4} amp={12}>
        <div style={{width: 500, height: 400, borderRadius: 26, background: PANEL2, border: `3px solid ${t > T.single ? RED : LINE}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
          <Icon name="box" size={130} color={WHITE} />
          <Label size={64} font={DISPLAY} style={{fontWeight: 400}}>MONOLITH</Label>
          {t > T.single && <Label size={26} color={GREY} font={MONO}>one single backend</Label>}
        </div>
      </Shake>
    </div>}
    {MS.map(([ic, l, s], i) => {
      const c = i % 3, r = Math.floor(i / 3);
      const k = ease(t, T.micro + i * 0.08, 0.6); if (k <= 0) return null;
      const x = lerp(355, 40 + c * 320, k), y = lerp(320, 190 + r * 230, k);
      const hot = t > T.resp && Math.floor((t - T.resp) * 2.5) % 6 === i;
      return <div key={i} style={{position: 'absolute', left: x, top: y, opacity: k}}>
        <div style={{width: 290, height: 200, borderRadius: 20, background: PANEL2, border: `2px solid ${hot ? RED : LINE}`, boxShadow: hot ? `0 0 30px ${RED}55` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          <Icon name={ic} size={64} color={hot ? RED : WHITE} />
          <Label size={30}>{l}</Label>
          {t > T.resp && <Label size={20} color={GREY} font={MONO}>{s}</Label>}
        </div>
      </div>;
    })}
    <Appear t0={T.arch} from="up" style={{left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}><Chip icon="network">DISTRIBUTED ARCHITECTURE</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 04 millions of requests on one DB
const S4: React.FC = () => {
  const t = useT(); const hot = t > T.database;
  return <>
    <Heading t0={51.05} kicker="THE NEXT BOTTLENECK" title="ALL TRAFFIC TO THE DB?" />
    {[0, 1, 2].map(i => <Appear key={i} t0={51.3 + i * 0.12} from="down" style={{left: 70 + i * 310, top: 170}}><Srv icon="boxes" label={['SEARCH', 'RECS', 'PLAYBACK'][i]} w={240} /></Appear>)}
    {[0, 1, 2].map(i => <Flow key={i} x1={190 + i * 310} y1={292} x2={500} y2={500} t0={T.millions2} n={hot ? 9 : 5} speed={hot ? 2.6 : 1.4} />)}
    <Appear t0={T.millions2 + 0.2} from="scale" style={{left: 380, top: 500}}>
      <Shake t0={T.database} d={0.7} amp={12}><Node icon="database" label="DATABASE" sub="every single read" w={240} hot={hot} /></Shake>
    </Appear>
    <Appear t0={T.database + 0.2} style={{left: 200, top: 740}}><Meter v={0.4 + 0.6 * ease(t, T.database, 1.0)} w={600} label="DB LOAD" /></Appear>
  </>;
};

// ------------------------------------------------------------------ 05 EVCache
const HOT = ['profiles', 'home rows', 'watch progress', 'artwork'];
const S5: React.FC = () => {
  const t = useT(); const relief = t > T.dbhit;
  return <>
    <Heading t0={59.55} kicker="STEP 3 · CACHING" title="EVCACHE" />
    <Appear t0={59.7} from="left" style={{left: 24, top: 300}}><Node icon="boxes" label="SERVICES" w={190} /></Appear>
    <Flow x1={214} y1={380} x2={350} y2={380} t0={T.caching + 0.2} n={6} speed={2.2} />
    <Appear t0={T.evcache} from="scale" style={{left: 355, top: 250}}>
      <Node icon="memory-stick" label="EVCACHE" sub={t > T.inmem ? 'distributed · in-memory' : ' '} w={300} hot />
    </Appear>
    <Flow x1={655} y1={380} x2={790} y2={380} t0={T.evcache + 0.3} n={relief ? 1 : 3} speed={0.6} color={relief ? GREY : RED} />
    <Appear t0={59.9} from="right" style={{left: 795, top: 300}}><Node icon="database" label="DB" w={180} dim={relief} /></Appear>
    <Appear t0={T.memcached} from="up" style={{left: 380, top: 500}}><Tag size={24}>built on Memcached</Tag></Appear>
    {HOT.map((h, i) => {
      const t0 = T.freq + i * 0.35; const k = ease(t, t0, 0.7); if (k <= 0) return null;
      return <div key={i} style={{position: 'absolute', left: lerp(40 + i * 235, 300 + (i % 2) * 240, k), top: lerp(760, 610 + Math.floor(i / 2) * 70, k), opacity: clamp(k * 3)}}>
        <Tag color={WHITE} size={22}>{h}</Tag>
      </div>;
    })}
    <Appear t0={T.dbhit} from="scale" style={{left: 770, top: 520}}><Chip icon="circle-check" color={GREEN} size={24}>DB rests</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 06 Cassandra
const WL: [string, string][] = [['monitor-play', 'viewing history'], ['users', 'user profiles'], ['activity', 'events & logs'], ['film', 'catalog data']];
const S6: React.FC = () => {
  const t = useT(); const cx = 700, cy = 470, R = 200; const rot = (t - T.cassandra) * 18;
  const k = ease(t, T.cassandra, 0.6);
  return <>
    <Heading t0={73.55} kicker="STEP 4 · DATABASES" title="RIGHT DB FOR EACH JOB" />
    {WL.map(([ic, l], i) => <Appear key={i} t0={T.workloads + i * 0.25} from="left" style={{left: 30, top: 200 + i * 130}}>
      <div style={{width: 320, height: 100, borderRadius: 16, background: PANEL2, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', boxSizing: 'border-box'}}><Icon name={ic} size={44} color={RED} /><Label size={26}>{l}</Label></div>
    </Appear>)}
    {WL.map((_, i) => <Flow key={i} x1={355} y1={250 + i * 130} x2={cx - 150} y2={cy} t0={T.databases + i * 0.1} n={2} speed={1} />)}
    {k > 0 && <svg width={1000} height={840} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={DEEP} strokeWidth={4} strokeDasharray="14 12" transform={`rotate(${rot} ${cx} ${cy})`} />
    </svg>}
    {Array.from({length: 6}).map((_, i) => {
      const a = (i / 6) * Math.PI * 2 + rot * Math.PI / 180; const kk = ease(t, T.cassandra + 0.1 + i * 0.08, 0.5); if (kk <= 0) return null;
      const on = t > T.better && Math.floor((t - T.better) * 3) % 6 === i;
      return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * R - 42, top: cy + Math.sin(a) * R - 42, width: 84, height: 84, borderRadius: 42, background: PANEL2, border: `2px solid ${on ? RED : LINE}`, boxShadow: on ? `0 0 24px ${RED}88` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${kk})`}}>
        <Icon name="database" size={38} color={on ? RED : WHITE} />
      </div>;
    })}
    <Appear t0={T.cassandra} from="scale" style={{left: cx - 90, top: cy - 90, width: 180, textAlign: 'center'}}>
      <div style={{display: 'flex', justifyContent: 'center'}}><Icon name="apachecassandra" size={110} color={WHITE} /></div>
      <Label size={30} style={{marginTop: 8}}>Cassandra</Label>
    </Appear>
    <Appear t0={79.4} from="up" style={{left: 470, top: 740}}><Tag size={22}>highly distributed · replicated</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 07 Open Connect CDN
const S7: React.FC = () => {
  const t = useT(); const near = t > T.isps;
  return <>
    <Heading t0={93.85} kicker="STEP 5 · VIDEO" title={t < T.openconnect ? 'VIDEO NEEDS A CDN' : 'OPEN CONNECT'} />
    <Appear t0={94.1} from="down" style={{left: 700, top: 160}}><Node icon="cloud" label="ORIGIN" sub="far away" w={230} dim={near} /></Appear>
    <Appear t0={T.stream - 0.4} from="left" style={{left: 40, top: 580}}><Node icon="tv" label="YOU" sub="press play" w={200} /></Appear>
    <Flow x1={810} y1={340} x2={150} y2={580} t0={T.stream} n={2} speed={0.35} color={near ? LINE : AMBER} />
    <Appear t0={T.door} t1={T.isps} from="scale" style={{left: 340, top: 300}}><Chip icon="triangle-alert" color={AMBER} size={26}>far = slow + costly</Chip></Appear>
    {t > T.apna && <div style={{position: 'absolute', left: 330, top: 470, width: 400, height: 320, borderRadius: 24, border: `3px dashed ${RED}`, background: 'rgba(229,9,20,.06)', opacity: ease(t, T.apna, 0.4)}}>
      <div style={{position: 'absolute', left: 20, top: 14, display: 'flex', alignItems: 'center', gap: 10}}><Icon name="router" size={34} color={RED} /><Label size={24} font={MONO} color={RED}>YOUR ISP</Label></div>
    </div>}
    <Appear t0={T.openconnect} from="scale" style={{left: 400, top: 550}}>
      <div style={{width: 260, height: 200, borderRadius: 20, background: PANEL2, border: `2px solid ${RED}`, boxShadow: `0 0 34px ${RED}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
        <div style={{display: 'flex', gap: 12, alignItems: 'center'}}><Img src={staticFile('netflix.png')} style={{width: 60, height: 60}} /><Icon name="hard-drive" size={56} color={WHITE} /></div>
        <Label size={30}>OPEN CONNECT</Label><Label size={18} color={GREY} font={MONO}>Netflix's own CDN</Label>
      </div>
    </Appear>
    <Flow x1={400} y1={650} x2={240} y2={650} t0={T.isps + 0.2} n={5} speed={2} />
    <Appear t0={T.deploy} from="up" style={{left: 740, top: 560}}><Chip icon="map-pin" size={22}>inside ISPs</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 08 pre-positioned, closest server
const OCA = [{x: 60, y: 330, d: 'far'}, {x: 760, y: 300, d: 'far'}, {x: 640, y: 600, d: 'closest'}];
const S8: React.FC = () => {
  const t = useT(); const ux = 400, uy = 560;
  const pick = t > T.close;
  return <>
    <Heading t0={113.95} kicker="PRE-POSITIONED CONTENT" title="CLOSEST SERVER WINS" />
    <Appear t0={114.0} from="down" style={{left: 400, top: 150}}><Srv icon="cloud" label="ORIGIN" w={200} h={110} /></Appear>
    {[0, 1, 2].flatMap(i => [0, 1].map(j => {
      const t0 = (j ? T.release : T.popular) + i * 0.2; const k = ease(t, t0, 1.0); if (k <= 0 || t > T.req) return null;
      const o = OCA[i];
      return <div key={`${i}${j}`} style={{position: 'absolute', left: lerp(477, o.x + 50 + j * 50, k), top: lerp(180, o.y - 56, k), opacity: clamp((1 - k) * 4 + 0.3)}}>
        <div style={{width: 46, height: 46, borderRadius: 10, background: j ? RED : WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="clapperboard" size={30} color={j ? WHITE : BLACK} /></div>
      </div>;
    }))}
    {t > T.geo && OCA.map((o, i) => {
      const k = ease(t, T.geo + i * 0.2, 0.5); const hit = pick && i === 2;
      return <svg key={i} width={1000} height={840} style={{position: 'absolute', left: 0, top: 0, opacity: pick && !hit ? 0.2 : 1}}>
        <line x1={ux} y1={uy} x2={lerp(ux, o.x + 95, k)} y2={lerp(uy, o.y + 60, k)} stroke={hit ? RED : GREY} strokeWidth={hit ? 6 : 3} strokeDasharray={hit ? undefined : '8 10'} />
      </svg>;
    })}
    {OCA.map((o, i) => <Appear key={i} t0={114.2 + i * 0.12} from="scale" style={{left: o.x, top: o.y}}>
      <Srv icon="hard-drive" label={`OCA ${i + 1}`} w={190} h={120} state={pick ? (i === 2 ? 'hot' : 'dim') : 'ok'} sub={t > T.geo ? o.d : undefined} />
    </Appear>)}
    <Appear t0={T.popular} t1={T.req - 0.2} from="up" style={{left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center'}}><Tag size={22}>popular + new releases, cached ahead</Tag></Appear>
    <Appear t0={T.req - 0.2} from="scale" style={{left: ux - 50, top: uy - 50}}>
      <div style={{width: 100, height: 100, borderRadius: 50, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${RED}88`}}><Icon name="play" size={48} color={WHITE} /></div>
    </Appear>
    {pick && <Flow x1={640} y1={650} x2={450} y2={570} t0={T.close + 0.2} n={5} speed={2.2} />}
    <Appear t0={T.close} from="scale" style={{left: 560, top: 750}}><Tag solid size={24}>served from nearest OCA</Tag></Appear>
  </>;
};


// ------------------------------------------------------------------ 08b full screen: request -> nearest Open Connect server (speaker hidden)
const OCB = [{x: 60, y: 300, d: 'far'}, {x: 760, y: 420, d: 'far'}, {x: 480, y: 1100, d: 'nearest'}];
const S8b: React.FC = () => {
  const t = useT(); const ux = 330, uy = 860; const pick = t > T.close; const geo = t > T.geo;
  const pulse = t > T.play2 ? 1 + 0.08 * Math.sin((t - T.play2) * 9) * Math.exp(-(t - T.play2) * 1.2) : 1;
  return <>
    <Heading t0={119.35} kicker="STEP 5 · OPEN CONNECT" title={geo ? 'NEAREST SERVER WINS' : 'STRAIGHT TO THE CDN'} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${LINE}55 1px, transparent 1px), linear-gradient(90deg, ${LINE}55 1px, transparent 1px)`, backgroundSize: '100px 100px', opacity: 0.5}} />
    {/* origin is skipped */}
    <Appear t0={119.5} from="down" style={{left: 400, top: 160}}><div style={{position: 'relative'}}><Srv icon="cloud" label="ORIGIN" sub="far away" w={210} h={130} state={t > T.req + 0.6 ? 'dim' : 'ok'} /></div></Appear>
    {t > T.req && <svg width={1000} height={FULL_H} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={ux} y1={uy} x2={505} y2={290} stroke={GREY} strokeWidth={3} strokeDasharray="8 10" opacity={0.5} />
    </svg>}
    <Appear t0={T.req + 0.6} from="scale" style={{left: 380, top: 470}}><Chip icon="circle-x" size={24}>origin skipped</Chip></Appear>
    {/* distance rings */}
    {geo && [0, 1, 2].map(i => { const ph = ((t - T.geo) * 0.6 + i / 3) % 1;
      return <div key={i} style={{position: 'absolute', left: ux - 700 * ph, top: uy - 700 * ph, width: 1400 * ph, height: 1400 * ph, borderRadius: '50%', border: `3px solid ${RED}`, opacity: (1 - ph) * 0.5}} />; })}
    {/* links to every OCA */}
    {t > T.req + 0.3 && OCB.map((o, i) => {
      const k = ease(t, T.req + 0.3 + i * 0.15, 0.5); const hit = pick && i === 2;
      const cx = o.x + 105, cy = o.y + 75;
      return <svg key={i} width={1000} height={FULL_H} style={{position: 'absolute', left: 0, top: 0, opacity: pick && !hit ? 0.2 : 1}}>
        <line x1={ux} y1={uy} x2={lerp(ux, cx, k)} y2={lerp(uy, cy, k)} stroke={hit ? RED : GREY} strokeWidth={hit ? 8 : 3} strokeDasharray={hit ? undefined : '10 12'} />
      </svg>;
    })}
    {OCB.map((o, i) => <Appear key={i} t0={119.6 + i * 0.12} from="scale" style={{left: o.x, top: o.y}}>
      <div style={{position: 'relative'}}>
        <Srv icon="hard-drive" label={`OPEN CONNECT ${i + 1}`} w={210} h={150} state={pick ? (i === 2 ? 'hot' : 'dim') : 'ok'} sub={geo ? o.d : 'cached titles'} />
        <div style={{position: 'absolute', right: -14, top: -14, display: 'flex', gap: 4}}>{[WHITE, RED].map((c, j) => <div key={j} style={{width: 34, height: 34, borderRadius: 8, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="clapperboard" size={22} color={j ? WHITE : BLACK} /></div>)}</div>
      </div>
    </Appear>)}
    {pick && <Flow x1={560} y1={1110} x2={ux + 40} y2={uy + 60} t0={T.close + 0.1} n={6} speed={2.2} w={6} />}
    {/* the viewer */}
    <Appear t0={119.4} from="scale" style={{left: ux - 80, top: uy - 80}}>
      <div style={{width: 160, height: 160, borderRadius: 80, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${RED}99`, transform: `scale(${pulse})`}}><Icon name="play" size={74} color={WHITE} /></div>
    </Appear>
    <Appear t0={119.5} from="up" style={{left: ux - 120, top: uy + 100, width: 240, textAlign: 'center'}}><Label size={30}>YOU</Label></Appear>
    <Appear t0={T.play2} from="scale" style={{left: ux + 100, top: uy - 40}}><Chip icon="monitor-play" size={26}>press play</Chip></Appear>
    <Appear t0={T.geo} from="scale" style={{left: ux - 150, top: uy - 210}}><Chip icon="map-pin" size={26}>your location</Chip></Appear>
    <Appear t0={T.close} from="up" style={{left: 0, right: 0, top: 1390, display: 'flex', justifyContent: 'center'}}><Chip icon="zap" size={30}>video from the nearest server</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 09 design for failure
const S9: React.FC = () => {
  const t = useT(); const up = ease(t, T.cb - 0.2, 0.5);
  const parts: [string, string, number][] = [['boxes', 'SERVICES', T.sfail], ['server', 'SERVERS', T.srvfail], ['network', 'NETWORK', T.netfail]];
  const tools: [string, string, string, number][] = [['zap', 'CIRCUIT BREAKER', 'stop calling a sick service', T.cb], ['gauge', 'LOAD SHEDDING', 'drop extra load early', T.ls], ['globe', 'MULTI-REGION', 'fail over to another region', T.mr], ['flame', 'CHAOS ENGINEERING', 'break things on purpose', T.ce]];
  return <>
    <Heading t0={131.55} kicker="STEP 6 · RESILIENCE" title="ASSUME THINGS FAIL" />
    <div style={{position: 'absolute', left: 0, top: lerp(0, -20, up), width: 1000, height: 840, transform: `scale(${1 - 0.12 * up})`, transformOrigin: '50% 20%'}}>
      {parts.map(([ic, l, tf], i) => <Appear key={i} t0={T.failure + i * 0.15} from="up" style={{left: 40 + i * 320, top: 190}}>
        <div style={{position: 'relative'}}><Shake t0={tf} d={0.4} amp={10}><Srv icon={ic} label={t > tf ? `${l} FAIL` : l} w={280} h={170} state={t > tf ? 'dead' : 'ok'} /></Shake></div>
      </Appear>)}
    </div>
    {tools.map(([ic, l, s, t0], i) => <Appear key={i} t0={t0} from="up" style={{left: 40 + (i % 2) * 470, top: 410 + Math.floor(i / 2) * 200}}>
      <div style={{width: 450, height: 180, borderRadius: 20, background: PANEL2, border: `2px solid ${RED}`, boxShadow: `0 0 26px ${RED}33`, padding: '22px 24px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon name={ic} size={52} color={RED} /><Label size={30}>{l}</Label></div>
        <Label size={20} color={GREY} font={MONO} style={{marginTop: 18}}>{s}</Label>
      </div>
    </Appear>)}
  </>;
};

// ------------------------------------------------------------------ 10 Chaos Monkey
const S10: React.FC = () => {
  const t = useT(); const VIC = 6;
  const scan = t > T.random && t < T.down ? Math.floor((t - T.random) * 9) % 12 : -1;
  const ok = t > T.check + 1.2;
  return <>
    <Heading t0={148.95} kicker="CHAOS ENGINEERING" title="CHAOS MONKEY" />
    <Appear t0={T.monkey} from="scale" style={{left: 760, top: 50}}><Tag solid size={24}>random kill</Tag></Appear>
    {Array.from({length: 12}).map((_, i) => {
      const c = i % 4, r = Math.floor(i / 4); const dead = i === VIC && t > T.down;
      const st = dead ? 'dead' : scan === i ? 'hot' : ok ? 'good' : 'ok';
      return <Appear key={i} t0={149.1 + i * 0.05} from="scale" style={{left: 55 + c * 230, top: 180 + r * 160}}>
        <div style={{position: 'relative'}}><Shake t0={T.down} d={i === VIC ? 0.5 : 0.01} amp={i === VIC ? 14 : 0}><Srv icon="server" label={dead ? 'DOWN' : `node-${i + 1}`} w={200} h={130} state={st as any} /></Shake></div>
      </Appear>;
    })}
    <Appear t0={T.check} from="up" style={{left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}>
      {ok ? <Chip icon="circle-check" color={GREEN}>STILL STREAMING</Chip> : <Chip icon="activity" color={AMBER}>is everything still up?</Chip>}
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 11 the big picture
const STACK: [string, string, string, number][] = [
  ['shield-check', 'EDGE LAYER', 'Zuul', 0], ['boxes', 'MICROSERVICES', 'services', 1], ['memory-stick', 'DISTRIBUTED CACHE', 'EVCache', 2],
  ['apachecassandra', 'DISTRIBUTED DB', 'Cassandra', 3], ['globe', 'CDN', 'Open Connect', 4], ['flame', 'FAULT TOLERANCE', 'Chaos Monkey', 5]];
const S11: React.FC = () => {
  const t = useT(); const keys = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'];
  const last = keys.reduce((a, k, i) => (t > T[k] ? i : a), -1);
  return <>
    <Heading t0={161.15} kicker="THE BIG PICTURE" title="HIGH-LEVEL ARCHITECTURE" />
    {STACK.map(([ic, l, s, i]) => <Appear key={i} t0={T[keys[i]] - 0.1} from="left" style={{left: 40, top: 160 + i * 106}}>
      <div style={{width: 920, height: 92, borderRadius: 16, background: i === last ? '#240709' : PANEL2, border: `2px solid ${i === last ? RED : LINE}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', boxSizing: 'border-box'}}>
        <Label size={40} font={DISPLAY} color={RED} style={{fontWeight: 400, width: 40}}>{`0${i + 1}`}</Label>
        <Icon name={ic} size={48} color={i === last ? RED : WHITE} />
        <Label font={DISPLAY} style={{fontWeight: 400, fontSize: 46, letterSpacing: '.02em'}}>{l}</Label>
        <div style={{flex: 1}} />
        <Tag size={22} color={i === last ? RED : GREY}>{s}</Tag>
      </div>
    </Appear>)}
  </>;
};

// ------------------------------------------------------------------ talk-mode overlays (speaker full screen)
const Band: React.FC<{a: number; b: number; children: React.ReactNode; top?: number}> = ({a, b, children, top = 1010}) => {
  const t = useT(); if (t < a - 0.05 || t > b + 0.3) return null;
  const k = ease(t, a, 0.4) * clamp((b + 0.25 - t) / 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{children}</div>;
};
const BigT: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 110, color = WHITE, children}) => (
  <div style={{fontFamily: DISPLAY, fontSize: size, color, lineHeight: 0.95, textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,.9), 0 0 4px #000', whiteSpace: 'nowrap'}}>{children}</div>
);
const TALK: [number, number][] = [[-1, 9.1], [14.0, 19.9], [89.9, 93.9], [173.3, 999]];
const Shade: React.FC = () => {
  const t = useT();
  const k = Math.max(...TALK.map(([a, b]) => clamp((t - a) / 0.4) * clamp((b - t) / 0.3)));
  return <div style={{position: 'absolute', left: 0, right: 0, top: 880, height: 1040, background: 'linear-gradient(transparent, rgba(0,0,0,.7) 20%, rgba(0,0,0,.82))', opacity: k}} />;
};
const Intro: React.FC = () => {
  const t = useT();
  return <>
    <Band a={0} b={2.0} top={1000}>
      <Img src={staticFile('netflix.png')} style={{width: 150, height: 150, transform: `scale(${0.7 + 0.3 * ease(t, 0, 0.5)})`}} />
      <BigT size={96}>HOW NETFLIX HANDLES</BigT>
      <BigT size={116} color={RED}>MILLIONS OF REQUESTS</BigT>
    </Band>
    <Band a={T.imagine} b={9.0} top={1010}>
      <div style={{display: 'flex', gap: 22, height: 70}}>{['users', 'tv', 'smartphone', 'laptop', 'users'].map((ic, i) => <Appear key={i} t0={2.3 + i * 0.15} from="scale" style={{position: 'relative'}}><Icon name={ic} size={70} color={i % 2 ? RED : WHITE} /></Appear>)}</div>
      <BigT size={100}>MILLIONS AT ONCE</BigT>
      <div style={{display: 'flex', gap: 16, height: 80}}>
        {([['search', 'SEARCH', T.search], ['zap', 'RECS', T.recs], ['play', 'PLAY', T.play]] as [string, string, number][]).map(([ic, l, t0], i) =>
          <Appear key={i} t0={t0} from="scale" style={{position: 'relative'}}><Chip icon={ic} size={28}>{l}</Chip></Appear>)}
      </div>
    </Band>
  </>;
};
const Mid: React.FC = () => <>
  <Band a={15.0} b={19.7}><Icon name="shield-check" size={90} color={RED} /><BigT size={104}>SO HOW DOES</BigT><BigT size={104} color={RED}>NETFLIX SOLVE IT?</BigT></Band>
  <Band a={90.0} b={93.7}><Icon name="monitor-play" size={90} color={RED} /><BigT size={104}>THE BIG ONE:</BigT><BigT size={104} color={RED}>VIDEO</BigT></Band>
</>;
const Outro: React.FC = () => {
  const t = useT();
  return <Band a={173.5} b={END} top={1000}>
    <Img src={staticFile('netflix.png')} style={{width: 120, height: 120}} />
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: 960}}>
      {['Zuul', 'Microservices', 'EVCache', 'Cassandra', 'Open Connect', 'Chaos Monkey'].map((s, i) => <Appear key={i} t0={173.7 + i * 0.12} from="scale" style={{position: 'relative'}}><Tag size={26} solid={i % 2 === 1}>{s}</Tag></Appear>)}
    </div>
    {t > 175.9 && <BigT size={110} color={RED}>MILLIONS OF REQUESTS</BigT>}
  </Band>;
};

export const cfg: Config = {
  title: 'HANDLING MILLIONS OF REQUESTS',
  logo: 'netflix.png',
  modes: [
    {a: 0, b: 9.0, m: 'talk'}, {a: 9.0, b: 14.0, m: 'card'}, {a: 14.0, b: 19.8, m: 'talk'},
    {a: 19.8, b: 90.0, m: 'card'}, {a: 90.0, b: 93.8, m: 'talk'}, {a: 93.8, b: 119.3, m: 'card'}, {a: 119.3, b: 131.4, m: 'full'}, {a: 131.4, b: 173.4, m: 'card'}, {a: 173.4, b: END + 1, m: 'talk'},
  ],
  face: {y0: 10, y1: 930},
  overlays: [Shade, Intro, Mid, Outro],
};

export const scenes: Scene[] = [
  {a: 9.0, b: 14.0, el: S1}, {a: 19.8, b: 33.6, el: S2}, {a: 33.6, b: 51.0, el: S3}, {a: 51.0, b: 59.5, el: S4},
  {a: 59.5, b: 73.4, el: S5}, {a: 73.4, b: 90.0, el: S6}, {a: 93.8, b: 113.9, el: S7}, {a: 113.9, b: 119.3, el: S8}, {a: 119.3, b: 131.4, el: S8b},
  {a: 131.4, b: 148.8, el: S9}, {a: 148.8, b: 161.1, el: S10}, {a: 161.1, b: 173.4, el: S11},
];
