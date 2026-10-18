// How the request-response cycle works. Theme: packet-lab. Not part of a series.
// Hard cuts: talk = speaker full screen with his real background; page = full-screen lab explainer.
// Page content lives between y 140 and y 1460; the cycle tracker sits at y 1500 and captions below it.
// Example values (user id 123, name, sizes) are illustrative.
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Head, Panel, Tag, Device, Wire, Packet, Code, K, Bytes, Arrow, Icon, At, Appear, PopIn, Txt,
  INK, SUB, BLUE, TEAL, AMBER, RED, SKY, SLATE, LINE, CARD, MONO, SANS} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;

const STEP = (n: number, s: string) => `STEP ${n} · ${s}`;
export const cfg: Config = {
  cuts: [
    {a: 0, b: 1.2, m: 'talk'},
    {a: 1.2, b: 6.2, m: 'page'},
    {a: 6.2, b: 14.4, m: 'talk'},
    {a: 14.4, b: 32.3, m: 'page'},
    {a: 32.3, b: 35.4, m: 'talk'},
    {a: 35.4, b: 50.1, m: 'page'},
    {a: 50.1, b: 53.9, m: 'talk'},
    {a: 53.9, b: 62.9, m: 'page'},
    {a: 62.9, b: 66.4, m: 'talk'},
    {a: 66.4, b: 76.5, m: 'page'},
    {a: 76.5, b: 78.5, m: 'talk'},
    {a: 78.5, b: 93.0, m: 'page'},
    {a: 93.0, b: 94.6, m: 'talk'},
    {a: 94.6, b: 106.9, m: 'page'},
    {a: 106.9, b: 108.3, m: 'talk'},
    {a: 108.3, b: 123.0, m: 'page'},
    {a: 123.0, b: 126.0, m: 'talk'},
    {a: 126.0, b: 131.7, m: 'page'},
    {a: 131.7, b: END + 1, m: 'talk'},
  ],
  steps: ['REQUEST', 'SERIALIZE', 'SEND', 'PARSE', 'PROCESS', 'RESPOND', 'RENDER'],
  stepAt: (t: number) => {
    if (t >= 14.4 && t < 32.3) return 0;
    if (t >= 35.4 && t < 50.1) return 1;
    if (t >= 53.9 && t < 76.5) return 2;
    if (t >= 78.5 && t < 84.0) return 3;
    if (t >= 84.0 && t < 93.0) return 4;
    if (t >= 94.6 && t < 98.0) return 5;
    if (t >= 98.0 && t < 103.4) return 6;
    return null;
  },
};

const S = '"';
const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
const Check: React.FC<{t0: number; ok?: boolean; size?: number}> = ({t0, ok = true, size = 56}) => <PopIn t0={t0}><Icon name={ok ? 'check-circle' : 'x-circle'} size={size} color={ok ? TEAL : RED} /></PopIn>;
const Row: React.FC<{y: number; t0: number; icon: string; text: string; done?: number; color?: string}> = ({y, t0, icon, text, done, color = BLUE}) => (
  <Panel x={90} y={y} w={900} h={130} t0={t0} pad={0} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px'}}>
    <div style={{width: 76, height: 76, borderRadius: 18, background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={icon} size={50} color={color} /></div>
    <Txt size={44} w={700} style={{flex: 1}}>{text}</Txt>
    {done !== undefined && <Check t0={done} />}
  </Panel>
);

// ------------------------------------------------------------------ scenes
const Hook: React.FC = () => (
  <>
    <Head t0={1.25} label="// THE QUESTION" title="Request ka safar?" />
    <Center y={400}><Appear t0={T.url}><Tag icon="globe" color={BLUE} size={30}>https://app.com/profile</Tag></Appear></Center>
    <Device x={90} y={560} t0={1.4} kind="client" icon="browser" label="Client" sub="browser / app" w={300} h={320} />
    <At x={320} y={830}><PopIn t0={T.click}><Icon name="cursor-click" size={70} color={INK} /></PopIn></At>
    <Wire x1={390} y1={720} x2={690} y2={720} t0={3.9} flow={[T.req, 6.2]} color={AMBER} />
    <Device x={690} y={560} t0={T.server - 0.2} kind="server" label="Server" sub="api.app.com" w={300} h={320} />
    <Packet x1={400} y1={720} x2={680} y2={720} t0={T.req} d={1.1} label="request" />
    <Center y={980}><PopIn t0={T.pahunchti}><Txt size={64} w={800}>Kaise <span style={{color: BLUE}}>pahunchti</span> hai?</Txt></PopIn></Center>
  </>
);

const Needs: React.FC = () => (
  <>
    <Head t0={14.45} label={STEP(1, 'REQUEST')} title="Profile open karo" />
    <Device x={90} y={360} t0={T.profile - 0.1} kind="client" label="Profile" sub="app screen" icon="user-circle" w={330} h={400} />
    <Panel x={460} y={360} w={530} h={400} t0={T.pata - 0.1}>
      <Txt size={28} w={600} color={SUB} font={MONO}>client ko pata ho:</Txt>
      {[['question', 'kya mangna hai?', T.kya], ['brackets-curly', 'kis format mein?', T.format], ['list-bullets', 'kaun se params?', T.params]].map(([ic, tx, at], i) => (
        <Appear key={i} t0={at as number}><div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 28}}><Icon name={ic as string} size={46} color={BLUE} /><Txt size={38} w={700}>{tx}</Txt></div></Appear>
      ))}
    </Panel>
    <At x={90} y={830}><Appear t0={T.kya + 0.2}><Tag color={AMBER} size={30}>GET /user/123</Tag></Appear></At>
    <At x={480} y={830}><Appear t0={T.format + 0.2}><Tag color={BLUE} size={30}>JSON</Tag></Appear></At>
    <At x={680} y={830}><Appear t0={T.params + 0.2}><Tag color={TEAL} size={30}>id = 123</Tag></Appear></At>
    <At x={90} y={930}><Appear t0={T.params + 0.4}><Txt size={26} w={400} font={MONO} color={SUB}>(example values)</Txt></Appear></At>
  </>
);

const HttpReq: React.FC = () => (
  <>
    <Head t0={21.05} label={STEP(1, 'REQUEST')} title="HTTP request" />
    <Code x={90} y={340} w={900} t0={21.2} title="request" lines={[
      {at: T.http, text: <><K c={AMBER}>GET</K> <K c={SKY}>/user/123</K> HTTP/1.1</>, hl: [T.endpoint, T.endpoint + 1.6]},
      {at: T.http + 0.5, text: <><K c={SLATE}>Host:</K> api.app.com</>},
      {at: T.http + 0.9, text: <><K c={SLATE}>Accept:</K> application/json</>},
      {at: T.http + 1.3, text: <><K c={SLATE}>Authorization:</K> Bearer eyJ…</>},
    ]} />
    <Device x={90} y={800} t0={26.2} kind="client" w={260} h={280} />
    <Device x={730} y={800} t0={26.4} kind="server" w={260} h={280} />
    <Wire x1={350} y1={940} x2={730} y2={940} t0={26.4} flow={[26.6, 28.4]} color={AMBER} />
    <Packet x1={360} y1={940} x2={720} y2={940} t0={26.6} d={1.4} label="GET" />
    <Center y={1020}><PopIn t0={T.rules}><Tag icon="file-text" color={INK} size={28}>HTTP rules</Tag></PopIn></Center>
    <At x={175} y={1110}><Check t0={T.interpret} /></At>
    <At x={815} y={1110}><Check t0={T.interpret + 0.15} /></At>
    <Center y={1200}><Appear t0={T.interpret + 0.3}><Txt size={42} w={700}>Dono same <span style={{color: BLUE}}>language</span> samjhe</Txt></Appear></Center>
  </>
);

const Serialize: React.FC = () => (
  <>
    <Head t0={35.45} label={STEP(2, 'SERIALIZE')} title="Serialization" />
    <Code x={90} y={340} w={900} t0={35.5} title="JavaScript object (memory)" lines={[
      {at: 35.6, text: <>{'{'}</>},
      {at: 35.8, text: <>  <K c={SKY}>id</K>: <K c={AMBER}>123</K>,</>},
      {at: 36.0, text: <>  <K c={SKY}>name</K>: <K c={TEAL}>{S}Aman{S}</K>,</>},
      {at: 36.2, text: <>  <K c={SKY}>tags</K>: [<K c={TEAL}>{S}dev{S}</K>]</>},
      {at: 36.4, text: <>{'}'}</>},
    ]} />
    <At x={720} y={290}><Appear t0={T.structured}><Tag color={BLUE} size={26}>structured data</Tag></Appear></At>
    <Arrow x1={540} y1={780} x2={540} y2={880} t0={T.convert - 0.3} color={BLUE} />
    <At x={570} y={800}><Appear t0={T.convert - 0.2}><Txt size={30} w={600} font={MONO} color={BLUE}>convert</Txt></Appear></At>
    <Bytes x={90} y={900} w={900} t0={T.convert} color={BLUE} size={64} />
    <Center y={1000}><Appear t0={T.transmissible}><Txt size={40} w={700} color={SUB}>network pe bhejne layak format</Txt></Appear></Center>
    <Center y={1100}><PopIn t0={T.serial}><Tag color={BLUE} solid size={40}>= SERIALIZATION</Tag></PopIn></Center>
  </>
);

const Json: React.FC = () => (
  <>
    <Head t0={42.15} label={STEP(2, 'SERIALIZE')} title="Object → JSON" />
    <Code x={60} y={340} w={440} t0={T.jsobj - 0.1} title="JS object" size={32} lines={[
      {at: T.jsobj, text: <>{'{'} <K c={SKY}>id</K>: <K c={AMBER}>123</K>,</>},
      {at: T.jsobj + 0.2, text: <>  <K c={SKY}>name</K>: <K c={TEAL}>{S}Aman{S}</K> {'}'}</>},
    ]} />
    <Code x={580} y={340} w={440} t0={T.json - 0.1} title="JSON string" size={32} lines={[
      {at: T.json, text: <K c={AMBER}>{`'{"id":123,`}</K>},
      {at: T.json + 0.2, text: <K c={AMBER}>{`"name":"Aman"}'`}</K>},
    ]} />
    <Arrow x1={505} y1={470} x2={575} y2={470} t0={T.json - 0.2} color={BLUE} />
    <Center y={570}><Appear t0={T.json + 0.3}><Tag color={BLUE} size={28}>JSON.stringify()</Tag></Appear></Center>
    <Code x={90} y={680} w={900} t0={T.body - 0.4} title="request body" size={32} lines={[
      {at: T.body - 0.3, text: <><K c={AMBER}>POST</K> <K c={SKY}>/user</K> HTTP/1.1</>},
      {at: T.body - 0.1, text: <><K c={SLATE}>Content-Type:</K> application/json</>},
      {at: T.body + 0.1, text: <> </>},
      {at: T.body + 0.2, text: <K c={AMBER}>{`{"id":123,"name":"Aman"}`}</K>, hl: [T.body + 0.2, T.reverse]},
    ]} />
    <Panel x={90} y={1080} w={900} h={250} t0={T.reverse - 0.1} border={TEAL}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Icon name="hard-drives" size={50} color={TEAL} /><Txt size={36} w={700}>Server par reverse: JSON → object</Txt></div>
      <div style={{display: 'flex', gap: 18, marginTop: 30}}>
        <Appear t0={T.deser}><Tag color={TEAL} solid size={30}>deserialization</Tag></Appear>
        <Appear t0={T.parsing}><Tag color={TEAL} size={30}>parsing</Tag></Appear>
      </div>
    </Panel>
  </>
);

const Send: React.FC = () => (
  <>
    <Head t0={53.95} label={STEP(3, 'SEND')} title="Network pe" />
    <Code x={90} y={330} w={900} t0={T.get - 0.1} title="GET (no body)" size={32} lines={[
      {at: T.get, text: <><K c={AMBER}>GET</K> <K c={SKY}>/user/123</K><K c={TEAL}>?fields=name</K></>, hl: [T.urlp, T.urlp + 1.2]},
    ]} />
    <At x={90} y={520}><Appear t0={T.urlp + 0.1}><Txt size={34} w={600} color={SUB}>Body nahi, params URL mein</Txt></Appear></At>
    <Device x={90} y={640} t0={T.network - 0.8} kind="client" w={280} h={300} />
    <Device x={710} y={640} t0={T.network - 0.6} kind="server" w={280} h={300} />
    <Wire x1={370} y1={790} x2={710} y2={790} t0={T.network - 0.6} flow={[T.network, 62.9]} color={AMBER} />
    <Packet x1={380} y1={790} x2={700} y2={790} t0={T.network} d={1.3} label="request" />
    <Panel x={90} y={1030} w={900} h={260} t0={60.0} border={AMBER} style={{display: 'flex', alignItems: 'center', gap: 26}}>
      <Icon name="question" size={110} color={AMBER} />
      <div>
        <Txt size={30} w={600} font={MONO} color={SUB}>server ka sawaal:</Txt>
        <Appear t0={61.2}><Txt size={54} w={800}>Request kahan <span style={{color: AMBER}}>END</span> hui?</Txt></Appear>
      </div>
    </Panel>
  </>
);

const Framing: React.FC = () => (
  <>
    <Head t0={66.45} label={STEP(3, 'SEND')} title="Body kahan khatam?" />
    <Code x={90} y={330} w={900} t0={66.6} title="option 1 · Content-Length" size={32} lines={[
      {at: 66.7, text: <><K c={AMBER}>POST</K> <K c={SKY}>/user</K> HTTP/1.1</>},
      {at: T.clen, text: <><K c={SLATE}>Content-Length:</K> <K c={AMBER}>24</K>   <K c={SLATE}>← body = 24 bytes</K></>, hl: [T.clen, T.chunked - 0.1]},
      {at: T.size, text: <K c={TEAL}>{`{"id":123,"name":"Aman"}`}</K>},
    ]} />
    <Code x={90} y={680} w={900} t0={T.chunked - 0.1} title="option 2 · chunked" size={32} lines={[
      {at: T.chunked, text: <><K c={SLATE}>Transfer-Encoding:</K> chunked</>},
      {at: T.chunked + 0.5, text: <><K c={AMBER}>18</K>  <K c={SLATE}>← chunk size (hex)</K></>},
      {at: T.chunked + 0.8, text: <K c={TEAL}>{`{"id":123,"name":"Aman"}`}</K>},
      {at: T.endmark, text: <><K c={RED}>0</K>   <K c={SLATE}>← zero chunk = END</K></>, hl: [T.endmark, T.tcp]},
    ]} />
    <At x={90} y={1080}><Appear t0={T.tcp}><Txt size={36} w={700}>TCP = sirf <span style={{color: BLUE}}>bytes ki stream</span></Txt></Appear></At>
    <Bytes x={90} y={1150} w={900} t0={T.tcp} color={BLUE} size={60} seed={4} />
    <At x={90} y={1250}><Appear t0={T.boundary}><Tag color={RED} icon="x-circle" size={30}>message boundary nahi rakhta</Tag></Appear></At>
  </>
);

const Parse: React.FC = () => { const t = useT(); return (
  <>
    <Head t0={78.55} label={STEP(4, 'PARSE')} title="Parse → extract" />
    <Code x={90} y={330} w={900} t0={78.6} title="raw request (server side)" size={32} lines={[
      {at: 78.7, text: <><K c={AMBER}>GET</K> <K c={SKY}>/user/123</K> HTTP/1.1</>},
      {at: 78.9, text: <><K c={SLATE}>Authorization:</K> Bearer eyJ…</>},
      {at: 79.1, text: <><K c={SLATE}>Accept:</K> application/json</>},
    ]} />
    <Arrow x1={540} y1={600} x2={540} y2={700} t0={T.parse} color={BLUE} />
    <At x={570} y={620}><Appear t0={T.parse}><Tag color={BLUE} size={28}>parse</Tag></Appear></At>
    <Panel x={90} y={720} w={900} t0={80.6}>
      <Txt size={28} w={600} font={MONO} color={SUB}>required info</Txt>
      {[['method', 'GET', 80.8], ['userId', '123', 81.3], ['token', 'eyJ…', 81.7]].map(([k, v, at], i) => (
        <Appear key={i} t0={at as number}><div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20, padding: '14px 20px', borderRadius: 14, background: i === 1 && t > T.extract ? '#FFF4DE' : '#F3F6FB'}}>
          <Txt size={34} w={600} font={MONO} color={SUB}>{k}</Txt><Txt size={34} w={600} font={MONO}>{v}</Txt>
        </div></Appear>
      ))}
    </Panel>
    <Center y={1230}><PopIn t0={T.processing}><Tag color={TEAL} size={30} icon="gear">next: processing</Tag></PopIn></Center>
  </>
); };

const Process: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={84.05} label={STEP(5, 'PROCESS')} title="Processing" />
    <At x={720} y={150}><div style={{transform: `rotate(${(t - 84) * 90}deg)`}}><PopIn t0={84.2}><Icon name="gear" size={120} color={TEAL} /></PopIn></div></At>
    <Row y={360} t0={T.auth - 0.1} icon="shield-check" text="Auth check" done={T.auth + 1.4} color={TEAL} />
    <Row y={520} t0={T.db - 0.1} icon="database" text="DB se profile fetch" done={T.fetch + 0.2} color={TEAL} />
    <Row y={680} t0={T.prepare - 0.4} icon="package" text="Response prepare" done={T.prepare + 0.2} color={TEAL} />
    <Center y={900}><div style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Appear t0={90.5}><Tag color={BLUE} solid size={34}>parsing</Tag></Appear>
      <Appear t0={90.7}><Txt size={60} w={800} color={SUB}>≠</Txt></Appear>
      <Appear t0={90.8}><Tag color={TEAL} solid size={34}>processing</Tag></Appear>
    </div></Center>
    <Center y={1010}><Appear t0={T.twosteps}><Txt size={40} w={700}>Do alag steps</Txt></Appear></Center>
  </>;
};

const Response: React.FC = () => (
  <>
    <Head t0={94.65} label={STEP(6, 'RESPOND')} title="HTTP response" />
    <Code x={90} y={330} w={900} t0={94.7} title="response" size={32} lines={[
      {at: T.status, text: <>HTTP/1.1 <K c={TEAL}>200 OK</K></>, hl: [T.status, T.headers]},
      {at: T.headers, text: <><K c={SLATE}>Content-Type:</K> application/json</>, hl: [T.headers, T.rbody]},
      {at: T.headers + 0.2, text: <><K c={SLATE}>Cache-Control:</K> no-cache</>, hl: [T.headers, T.rbody]},
      {at: T.rbody, text: <> </>},
      {at: T.rbody, text: <K c={AMBER}>{`{"id":123,"name":"Aman"}`}</K>, hl: [T.rbody, 98]},
    ]} />
    <At x={90} y={740}><div style={{display: 'flex', gap: 16}}>
      <Appear t0={T.status}><Tag color={TEAL} size={28}>status code</Tag></Appear>
      <Appear t0={T.headers}><Tag color={SLATE} size={28}>headers</Tag></Appear>
      <Appear t0={T.rbody}><Tag color={AMBER} size={28}>body (optional)</Tag></Appear>
    </div></At>
    <Device x={90} y={860} t0={95.0} kind="client" w={260} h={280} />
    <Device x={730} y={860} t0={95.0} kind="server" w={260} h={280} />
    <Wire x1={350} y1={1000} x2={730} y2={1000} t0={95.1} flow={[96.6, 98]} color={TEAL} />
    <Packet x1={720} y1={1000} x2={360} y2={1000} t0={96.6} d={1.2} label="200 OK" color={TEAL} />
  </>
);

const Render: React.FC = () => {
  const t = useT(); const shown = t > T.display;
  return <>
    <Head t0={98.05} label={STEP(7, 'RENDER')} title="Screen pe data" />
    <Code x={60} y={360} w={470} t0={T.creceive - 0.2} title="received" size={32} lines={[
      {at: T.creceive, text: <K c={AMBER}>{`{"id":123,`}</K>},
      {at: T.creceive + 0.2, text: <K c={AMBER}>{` "name":"Aman"}`}</K>},
    ]} />
    <Arrow x1={300} y1={600} x2={300} y2={700} t0={T.cparse} color={BLUE} />
    <At x={330} y={620}><Appear t0={T.cparse}><Tag color={BLUE} size={26}>parse</Tag></Appear></At>
    <Code x={60} y={720} w={470} t0={T.cparse + 0.3} title="object" size={32} lines={[
      {at: T.cparse + 0.4, text: <>user.<K c={SKY}>name</K> = <K c={TEAL}>{S}Aman{S}</K></>},
    ]} />
    <Panel x={590} y={340} w={410} h={720} t0={98.2} border={BLUE} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50}}>
      <Icon name="user-circle" size={180} color={shown ? BLUE : LINE} />
      {shown ? <>
        <PopIn t0={T.display}><Txt size={54} w={800} style={{marginTop: 20}}>Aman</Txt></PopIn>
        <Appear t0={T.display + 0.15}><Txt size={30} w={400} font={MONO} color={SUB} style={{marginTop: 10}}>id: 123</Txt></Appear>
        <Appear t0={T.display + 0.3}><Tag color={TEAL} size={26} icon="check-circle">loaded</Tag></Appear>
      </> : <>
        {[260, 180, 220].map((w, i) => <div key={i} style={{width: w, height: 30, borderRadius: 15, background: '#E6ECF4', marginTop: i ? 22 : 36, opacity: 0.6 + 0.4 * Math.sin(t * 6 + i)}} />)}
      </>}
    </Panel>
    <Center y={1140}><div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      {[['receive', T.creceive], ['parse', T.cparse], ['display', T.display]].map(([s, at], i) => (
        <React.Fragment key={i}>{i > 0 && <Txt size={34} color={SLATE}>→</Txt>}<Tag color={t > (at as number) ? BLUE : SLATE} solid={t > (at as number)} size={28}>{s}</Tag></React.Fragment>
      ))}
    </div></Center>
  </>;
};

const Cycle: React.FC = () => {
  const t = useT(); const steps = cfg.steps!; const cx = 540, cy = 830, R = 360;
  const k = ease(t, 103.5, 1.1); const dotA = (t - 103.5) * 2.2 - Math.PI / 2;
  return <>
    <Head t0={103.45} label="// THE FULL CYCLE" title="Cycle complete" />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={LINE} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={BLUE} strokeWidth={10} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
      {t > 104.6 && <circle cx={cx + R * Math.cos(dotA)} cy={cy + R * Math.sin(dotA)} r={18} fill={AMBER} />}
    </svg>
    {steps.map((s, i) => {
      const a = -Math.PI / 2 + (i / steps.length) * Math.PI * 2; const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      return <div key={s} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)'}}><PopIn t0={103.5 + i * 0.14}><Tag color={i < 1 || i > 5 ? BLUE : i === 4 || i === 3 ? TEAL : BLUE} solid size={26}>{s}</Tag></PopIn></div>;
    })}
    <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
      <PopIn t0={T.complete}><Icon name="check-circle" size={130} color={TEAL} style={{margin: '0 auto'}} /></PopIn>
      <Appear t0={T.complete + 0.2}><Txt size={44} w={800}>complete</Txt></Appear>
    </div>
  </>;
};

const Cost: React.FC = () => {
  const t = useT();
  const meter = (x: number, at: number, icon: string, label: string, fill: number) => (
    <Panel x={x} y={340} w={280} h={300} t0={at - 0.1} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
      <Icon name={icon} size={80} color={AMBER} />
      <Txt size={34} w={700}>{label}</Txt>
      <div style={{width: 200, height: 18, borderRadius: 9, background: '#EEF2F7', overflow: 'hidden'}}><div style={{width: `${ease(t, at, 0.8) * fill * 100}%`, height: '100%', background: AMBER}} /></div>
    </Panel>
  );
  const bar = (y: number, at: number, label: string, frac: number, color: string, note: string) => (
    <At x={90} y={y}><Appear t0={at}>
      <div style={{display: 'flex', justifyContent: 'space-between', width: 900}}><Txt size={32} w={700}>{label}</Txt><Txt size={28} w={500} font={MONO} color={SUB}>{note}</Txt></div>
      <div style={{width: 900, height: 44, borderRadius: 12, background: '#E3E9F2', marginTop: 12, overflow: 'hidden'}}><div style={{width: `${ease(t, at + 0.1, 0.7) * frac * 100}%`, height: '100%', background: color}} /></div>
    </Appear></At>
  );
  return <>
    <Head t0={108.35} label="// TRADE-OFF" title="Format ki cost" />
    {meter(90, T.cpu, 'cpu', 'CPU time', 0.7)}
    {meter(400, T.memory, 'memory', 'Memory', 0.55)}
    {meter(710, T.bytes, 'wifi-high', 'Extra bytes', 0.8)}
    {bar(740, 111.9, 'JSON (text)', 1, AMBER, 'bigger, readable')}
    {bar(880, T.protobuf, 'Protocol Buffers (binary)', 0.45, TEAL, 'smaller, faster')}
    <At x={90} y={1010}><Appear t0={T.protobuf + 0.3}><Txt size={24} w={400} font={MONO} color={SUB}>(sizes illustrative)</Txt></Appear></At>
    <Center y={1120}><Appear t0={T.requirement - 0.4}><Tag color={BLUE} size={32} icon="gear">system requirement pe depend</Tag></Appear></Center>
  </>;
};

const Realtime: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={116.35} label="// BEYOND REQUEST-RESPONSE" title="Real-time apps" />
    <Center y={330}><div style={{display: 'flex', gap: 14}}>
      <Appear t0={T.realtime}><Tag color={AMBER} icon="lightning" size={26}>real-time</Tag></Appear>
      <Appear t0={T.notif}><Tag color={AMBER} icon="broadcast" size={26}>notifications</Tag></Appear>
      <Appear t0={T.streaming}><Tag color={AMBER} icon="wifi-high" size={26}>streaming</Tag></Appear>
    </div></Center>
    <Device x={90} y={500} t0={119.0} kind="client" w={280} h={300} />
    <Device x={710} y={500} t0={119.2} kind="server" w={280} h={300} />
    <Wire x1={370} y1={620} x2={710} y2={620} t0={119.3} flow={[T.ws, 123]} color={BLUE} sw={8} />
    <Wire x1={370} y1={690} x2={710} y2={690} t0={119.4} flow={[T.ws, 123]} color={TEAL} sw={8} />
    {t > T.ws && [0, 1, 2].map(i => {
      const p = ((t - T.ws) * 0.7 + i / 3) % 1; const q = ((t - T.ws) * 0.6 + i / 3 + 0.15) % 1;
      return <React.Fragment key={i}>
        <div style={{position: 'absolute', left: lerp(380, 690, p) - 14, top: 606, width: 28, height: 28, borderRadius: 14, background: BLUE, opacity: Math.sin(p * Math.PI)}} />
        <div style={{position: 'absolute', left: lerp(690, 380, q) - 14, top: 676, width: 28, height: 28, borderRadius: 14, background: TEAL, opacity: Math.sin(q * Math.PI)}} />
      </React.Fragment>;
    })}
    <Center y={860}><div style={{display: 'flex', gap: 18}}>
      <PopIn t0={T.ws}><Tag color={BLUE} solid size={32}>WebSocket</Tag></PopIn>
      <PopIn t0={T.es}><Tag color={TEAL} solid size={32}>Event stream</Tag></PopIn>
    </div></Center>
    <Center y={980}><Appear t0={T.persistent}><Txt size={44} w={800}>Connection <span style={{color: BLUE}}>open</span> rehta hai</Txt></Appear></Center>
  </>;
};

const Cancel: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={126.05} label="// EDGE CASE" title="Client chala gaya?" />
    <div style={{opacity: 0.55}}><Device x={90} y={360} t0={126.1} kind="client" w={280} h={300} icon="wifi-x" /></div>
    <Device x={710} y={360} t0={126.2} kind="server" w={280} h={300} />
    <Wire x1={370} y1={510} x2={710} y2={510} t0={126.2} />
    <At x={505} y={475}><Check t0={126.3} ok={false} size={70} /></At>
    <At x={760} y={680}><Appear t0={126.5}><Txt size={28} w={600} font={MONO} color={TEAL}>still working<span style={{opacity: Math.floor(t * 3) % 2}}>...</span></Txt></Appear></At>
    <Center y={800}><Appear t0={T.automatically}><Txt size={48} w={800}>Server ka kaam <span style={{color: AMBER}}>auto cancel?</span></Txt></Appear></Center>
    <Center y={890}><PopIn t0={T.zaroori}><Tag color={RED} solid size={34}>zaroori nahi</Tag></PopIn></Center>
    <Panel x={90} y={1010} w={900} h={300} t0={T.application - 0.1}>
      <Txt size={30} w={600} font={MONO} color={SUB}>depend karta hai:</Txt>
      <Appear t0={T.application}><div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 24}}><Icon name="code" size={46} color={BLUE} /><Txt size={40} w={700}>application logic</Txt></div></Appear>
      <Appear t0={T.cancellation}><div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 20}}><Icon name="plugs-connected" size={46} color={BLUE} /><Txt size={40} w={700}>protocol ka cancellation</Txt></div></Appear>
    </Panel>
  </>;
};

export const scenes: Scene[] = [
  {a: 1.2, b: 6.2, el: Hook},
  {a: 14.4, b: 21.0, el: Needs},
  {a: 21.0, b: 32.3, el: HttpReq},
  {a: 35.4, b: 42.1, el: Serialize},
  {a: 42.1, b: 50.1, el: Json},
  {a: 53.9, b: 62.9, el: Send},
  {a: 66.4, b: 76.5, el: Framing},
  {a: 78.5, b: 84.0, el: Parse},
  {a: 84.0, b: 93.0, el: Process},
  {a: 94.6, b: 98.0, el: Response},
  {a: 98.0, b: 103.4, el: Render},
  {a: 103.4, b: 106.9, el: Cycle},
  {a: 108.3, b: 116.3, el: Cost},
  {a: 116.3, b: 123.0, el: Realtime},
  {a: 126.0, b: 131.7, el: Cancel},
];
