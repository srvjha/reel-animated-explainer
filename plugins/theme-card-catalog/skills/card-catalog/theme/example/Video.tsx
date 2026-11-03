// How RAG works. Theme: card-catalog. Split layout: library-desk explainer on top (y 0-1000), speaker below.
// The query is shown as embedded (not chunked), as agreed with the user. Example values are illustrative.
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Head, Card, Drawer, Vec, Arrow, Tag, Page, Type, Icon, At, Appear, PopIn, Txt,
  PAPER, CARD, RED, NAVY, BRASS, GREEN, MUTED, TEAL, AMBER, SERIF, TYPE, SANS} from './theme/kit';
import data from './data.json';

const T = (w: string, n = 1) => { const ws = (data as any).pages.flatMap((p: any) => p.words); let c = 0; for (const x of ws) if (x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w) { c++; if (c === n) return x.t; } return 0; };
const END = data.duration;

export const cfg: Config = {split: 1000, camDy: 715};

const Center: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
const Line: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = NAVY, size = 32}) => <div style={{fontFamily: TYPE, fontWeight: 700, fontSize: size, color, lineHeight: 1.3, whiteSpace: 'nowrap'}}>{children}</div>;
const Shift: React.FC<{dy: number; children: React.ReactNode}> = ({dy, children}) => <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1000, transform: `translateY(${dy}px)`}}>{children}</div>;

// ------------------------------------------------------------------ scenes
const Intro: React.FC = () => (
  <>
    <Head t0={0.1} label="CARD 00 · DEFINITION" title="What is RAG?" />
    {[['R', 'Retrieval', 'fetch the facts', 2.1], ['A', 'Augmented', 'add context', 2.5], ['G', 'Generation', 'write the answer', 2.9]].map(([l, w, s, at], i) => (
      <Card key={i} x={50 + i * 335} y={240} w={310} h={560} t0={at as number} rot={(i - 1) * 2} head={<>CARD {i + 1}</>}>
        <div style={{fontFamily: SERIF, fontSize: 220, color: [RED, TEAL, AMBER][i], lineHeight: 1}}>{l}</div>
        <Line size={32}>{w}</Line>
        <Line size={26} color={MUTED}>{s}</Line>
      </Card>
    ))}
  </>
);

const Limit: React.FC = () => (
  <>
    <Head t0={3.5} label="CARD 01 · THE PROBLEM" title="The LLM limit" />
    <Shift dy={90}>
    <Card x={60} y={220} w={460} h={420} t0={T('llm')} head={<><Icon name="brain" size={34} color={RED} />LLM</>}>
      <Line>knowledge =</Line>
      <Line color={RED}>training data only</Line>
      <Line color={MUTED} size={30}>(up to cut-off date)</Line>
    </Card>
    <Card x={560} y={220} w={460} h={200} t0={T('company')} rot={2} head={<><Icon name="buildings" size={32} color={TEAL} />company data</>} accent={TEAL}><Line size={26}>unknown ?</Line></Card>
    <Card x={560} y={450} w={460} h={190} t0={T('pdf')} rot={-2} head={<><Icon name="file-pdf" size={32} color={TEAL} />your PDF</>} accent={TEAL}><Line size={26}>unknown ?</Line></Card>
    <Center y={700}><Appear t0={T('upload')}><Tag color={NAVY} icon="upload-simple" size={30}>so upload the PDF?</Tag></Appear></Center>
    </Shift>
  </>
);

const Naive: React.FC = () => {
  const t = useT(); const fill = clamp((t - 18.6) / 5.5) * 1.25;
  return <>
    <Head t0={13.3} label="CARD 02 · NAIVE WAY" title="Whole PDF in prompt" />
    <Page x={60} y={210} w={260} h={340} t0={13.5} label="PDF" lines={10} />
    <Arrow x1={330} y1={380} x2={420} y2={380} t0={T('prompt') - 0.3} />
    <Card x={430} y={210} w={590} h={340} t0={T('system') - 0.2} head={<>SYSTEM PROMPT</>} noHole>
      <Line size={30} color={MUTED}>question + entire PDF</Line>
      <div style={{marginTop: 18, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: NAVY}}>context window</div>
      <div style={{position: 'relative', marginTop: 8, height: 40, borderRadius: 8, border: `3px solid ${NAVY}`, overflow: 'visible'}}>
        <div style={{width: `${Math.min(fill, 1.0) * 100}%`, height: '100%', background: fill > 1 ? RED : AMBER, borderRadius: 4}} />
        {fill > 1 && <div style={{position: 'absolute', left: '100%', top: -3, height: 40, width: (fill - 1) * 400, background: `repeating-linear-gradient(45deg, ${RED} 0 10px, ${RED}66 10px 20px)`, borderRadius: '0 8px 8px 0'}} />}
      </div>
    </Card>
    <At x={60} y={600}><Appear t0={T('limit')}><div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name="warning" size={50} color={RED} /><Txt size={38} color={RED} font={SERIF} w={400}>1. Context limit hit</Txt></div></Appear></At>
    <At x={60} y={690}><Appear t0={T('increase')}><div style={{display: 'flex', alignItems: 'center', gap: 14}}><Icon name="currency-inr" size={50} color={RED} /><Txt size={38} color={RED} font={SERIF} w={400}>2. Bigger window = costly</Txt></div></Appear></At>
    <At x={60} y={790}><Appear t0={T('feasible')}><Tag color={RED} solid size={32}>not feasible</Tag></Appear></At>
    <At x={320} y={790}><Appear t0={T('rag', 3) + 0.0}><Tag color={GREEN} solid size={32} icon="lightbulb">solution: RAG</Tag></Appear></At>
  </>;
};

const Phases: React.FC = () => (
  <>
    <Head t0={32.9} label="CARD 03 · HOW" title="RAG = 2 phases" />
    <Shift dy={40}>
    <Drawer x={60} y={330} w={450} h={360} t0={T('phases') - 0.2} label="1 · INDEXING" fill={6} glow={ease(useT(), T('indexing'), 0.4)} />
    <Drawer x={570} y={330} w={450} h={360} t0={T('phases')} label="2 · RETRIEVAL" fill={3} />
    <Center y={780}><Appear t0={T('indexing')}><Tag color={BRASS} size={30}>first: indexing</Tag></Appear></Center>
    </Shift>
  </>
);

const Chunk: React.FC = () => {
  const t = useT(); const kc = T('chunking');
  return <>
    <Head t0={36.2} label="INDEXING · STEP 1" title="Chunking" />
    <Page x={60} y={210} w={340} h={560} t0={36.4} label="PDF" lines={14} cuts={[0.27, 0.5, 0.73]} cutAt={kc} />
    <Arrow x1={420} y1={490} x2={500} y2={490} t0={T('divide')} />
    {[0, 1, 2, 3].map(i => (
      <Card key={i} x={520 + (i % 2) * 260} y={210 + Math.floor(i / 2) * 290} w={240} h={260} t0={T('divide') + 0.2 + i * 0.25} from={[-200, 0]} rot={(i % 2 ? 2 : -2)} head={<>CHUNK {i + 1}</>}>
        <Line size={28} color={MUTED}>~500 tokens</Line>
      </Card>
    ))}
    <At x={60} y={820}><Appear t0={T('smallsmall')}><Tag color={RED} icon="scissors" size={30}>small parts</Tag></Appear></At>
  </>;
};

const Embed: React.FC = () => (
  <>
    <Head t0={46.4} label="INDEXING · STEP 2" title="Embedding" />
    <Shift dy={60}>
    <Card x={60} y={220} w={360} h={260} t0={46.5} head={<>CHUNK 1</>}>
      <Line size={28}>"Refund within</Line><Line size={28}>7 days"</Line>
    </Card>
    <Arrow x1={430} y1={350} x2={520} y2={350} t0={T('embedding')} />
    <At x={530} y={300}><Vec t0={T('embedding') + 0.2} vals={[0.12, -0.83, 0.44, 0.07]} size={30} /></At>
    <At x={530} y={370}><Appear t0={T('numerical')}><Txt size={30} color={MUTED} font={TYPE}>numerical vector</Txt></Appear></At>
    <Card x={60} y={560} w={960} h={260} t0={T('meaning') - 0.2} head={<><Icon name="sparkle" size={32} color={TEAL} />MEANING CAPTURE</>} accent={TEAL} noHole>
      <Line size={26}>"refund policy" ≈ "money back"</Line>
      <Line size={30} color={MUTED}>same meaning → nearby vectors</Line>
    </Card>
    </Shift>
  </>
);

const Store: React.FC = () => {
  const t = useT(); const fill = 2 + clamp((t - 58.0) / 2.0) * 7;
  return <>
    <Head t0={54.9} label="INDEXING · STEP 3" title="Vector DB" />
    {[0, 1, 2].map(i => {
      const k = ease(t, 58.2 + i * 0.4, 0.6);
      return <div key={i} style={{position: 'absolute', left: lerp(80 + i * 140, 420 + i * 60, k), top: lerp(220, 360, k), opacity: 1 - clamp((k - 0.8) / 0.2)}}>
        <Vec t0={55.2 + i * 0.3} vals={[[0.12, -0.83], [0.55, 0.21], [-0.4, 0.9]][i]} size={28} />
      </div>;
    })}
    <Drawer x={260} y={420} w={560} h={330} t0={T('database')} label="VECTOR DB" fill={fill} glow={ease(t, 59.7, 0.4) * (1 - ease(t, 61.5, 0.5))} />
    <Center y={800}><div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <Appear t0={T('chunking', 3)}><Tag color={RED} size={30}>chunk</Tag></Appear>
      <Appear t0={T('vector', 4)}><Txt size={30} color={MUTED}>→</Txt></Appear>
      <Appear t0={T('vector', 4)}><Tag color={TEAL} size={30}>embed</Tag></Appear>
      <Appear t0={T('vector', 5)}><Txt size={30} color={MUTED}>→</Txt></Appear>
      <Appear t0={T('vector', 5)}><Tag color={BRASS} size={30}>store</Tag></Appear>
      <Appear t0={T('complete')}><Tag color={GREEN} solid size={30} icon="check-circle">indexing done</Tag></Appear>
    </div></Center>
  </>;
};

const Retrieve: React.FC = () => {
  const t = useT(); const q = T('query'); const fetch = T('relevant');
  const scores = ['0.91', '0.87', '0.82'];
  return <>
    <Head t0={68.8} label="PHASE 2 · RETRIEVAL" title="Search by query" />
    <Card x={60} y={200} w={430} h={190} t0={q - 0.2} head={<><Icon name="user-circle" size={32} color={RED} />USER QUERY</>} noHole>
      <Type t0={q} text={'"When is my refund?"'} size={26} />
    </Card>
    <Arrow x1={500} y1={290} x2={560} y2={290} t0={T('vector', 6) - 0.4} />
    <At x={570} y={260}><Vec t0={T('vector', 6)} vals={[0.10, -0.80, 0.41]} size={26} /></At>
    <At x={570} y={320}><Appear t0={T('vector', 6) + 0.2}><Txt size={28} color={MUTED} font={TYPE}>query → embedding</Txt></Appear></At>
    <Drawer x={60} y={460} w={430} h={330} t0={T('vector', 7) - 0.3} label="VECTOR DB" fill={9} glow={ease(t, T('vector', 7), 0.3) * (1 - ease(t, 82, 0.5))} />
    {[0, 1, 2].map(i => (
      <Card key={i} x={560} y={410 + i * 140} w={460} h={120} t0={fetch + 0.4 + i * 0.5} from={[-300, 0]} hl={t > T('top') && t < 87} head={<>TOP {i + 1} · sim {scores[i]}</>} noHole>
        <Line size={28} color={MUTED}>{['refund in 7 days', 'how refunds work', 'return policy'][i]}</Line>
      </Card>
    ))}
    <At x={560} y={840}><Appear t0={T('top')}><Tag color={AMBER} solid size={30}>top 3 / top 5</Tag></Appear></At>
  </>;
};

const Generate: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={86.4} label="PHASE 2 · GENERATION" title="Give LLM context" />
    <Card x={60} y={200} w={500} h={330} t0={T('results', 2) - 0.2} head={<>PROMPT</>} noHole>
      <Line size={28} color={TEAL}>context: top 3 chunks</Line>
      <Line size={28} color={RED}>question: when refund?</Line>
      <Appear t0={T('answer')}><Line size={28}>"answer only from</Line><Line size={28}>this context"</Line></Appear>
    </Card>
    <Arrow x1={570} y1={360} x2={660} y2={360} t0={T('llm', 2) - 0.3} />
    <Card x={670} y={240} w={350} h={250} t0={T('llm', 2)} head={<><Icon name="brain" size={34} color={RED} />LLM</>} noHole>
      <Line size={30} color={MUTED}>model</Line>
    </Card>
    <At x={60} y={570}><Appear t0={T('context', 3)}><Tag color={TEAL} solid size={32}>context set ✓</Tag></Appear></At>
    <Card x={60} y={650} w={960} h={240} t0={T('answer', 2) - 0.2} head={<><Icon name="chat-text" size={32} color={GREEN} />ANSWER</>} accent={GREEN} noHole>
      <Type t0={T('answer', 2)} text={'"Refund within 7 days."'} size={28} />
      <div style={{marginTop: 14}}><Appear t0={T('grounded')}><Tag color={GREEN} solid size={30} icon="check-circle">grounded in your data</Tag></Appear></div>
    </Card>
  </>;
};

const Pitfall: React.FC = () => {
  const t = useT(); const cut = T('chunks', 3);
  return <>
    <Head t0={108.4} label="CARD 04 · WATCH OUT" title="Retrieval is key" />
    <Shift dy={60}>
    <Page x={60} y={200} w={380} h={440} t0={T('suppose')} label="PDF" lines={11} cuts={[0.52]} cutAt={cut} hlRows={[[0, 5, `${AMBER}33`], [5.6, 11, `${TEAL}33`]]} />
    <At x={60} y={660}><Appear t0={T('continuation')}><Txt size={30} color={MUTED} font={TYPE}>para 1 → para 2 (continued)</Txt></Appear></At>
    <Card x={520} y={200} w={500} h={170} t0={cut + 0.2} from={[-200, 0]} hl={t > T('upar')} head={<>CHUNK A (para 1)</>} noHole><Line size={28} color={GREEN}>retrieved ✓</Line></Card>
    <Card x={520} y={400} w={500} h={170} t0={cut + 0.5} from={[-200, 0]} dim={t > T('upar')} head={<>CHUNK B (para 2)</>} accent={TEAL} noHole><Line size={28} color={RED}>{t > T('upar') ? 'missed ✗' : ''}</Line></Card>
    <At x={520} y={610}><Appear t0={T('half')}><Tag color={RED} solid size={32} icon="puzzle-piece">half-cooked answer</Tag></Appear></At>
    <div style={{position: 'absolute', left: 0, right: 0, top: 770, display: 'flex', justifyContent: 'center'}}><Appear t0={T('important') + 0.2}><Txt size={44} font={SERIF} w={400}>Retrieval quality = <span style={{color: RED}}>answer quality</span></Txt></Appear></div>
    </Shift>
  </>;
};

const Outro: React.FC = () => (
  <>
    <Head t0={132.9} label="CARD 05 · NEXT" title="That was basic RAG" />
    <Shift dy={120}>
    <Card x={60} y={210} w={460} h={330} t0={133.4} head={<>BASIC RAG</>}>
      <Line size={30}>chunk → embed</Line><Line size={30}>→ store → retrieve</Line><Line size={30}>→ generate</Line>
    </Card>
    <Card x={560} y={210} w={460} h={330} t0={T('advanced') - 0.2} rot={2} head={<>ADVANCED RAG ?</>} accent={TEAL}>
      <Line size={30} color={MUTED}>better chunking</Line><Line size={30} color={MUTED}>re-ranking, hybrid</Line><Line size={30} color={MUTED}>search …</Line>
    </Card>
    <Center y={620}><Appear t0={T('comment')}><Tag color={RED} solid size={34} icon="chat-circle-dots">comment for part 2</Tag></Appear></Center>
    </Shift>
  </>
);

export const scenes: Scene[] = [
  {a: 0, b: 3.4, el: Intro},
  {a: 3.4, b: 13.2, el: Limit},
  {a: 13.2, b: 32.8, el: Naive},
  {a: 32.8, b: 36.1, el: Phases},
  {a: 36.1, b: 46.3, el: Chunk},
  {a: 46.3, b: 54.8, el: Embed},
  {a: 54.8, b: 68.7, el: Store},
  {a: 68.7, b: 86.3, el: Retrieve},
  {a: 86.3, b: 108.3, el: Generate},
  {a: 108.3, b: 132.8, el: Pitfall},
  {a: 132.8, b: END + 1, el: Outro},
];
