// What is a harness in AI. Theme: orange-board. Not part of a series.
// Hard cuts: talk = speaker full screen with his real background; page = full-screen whiteboard explainer.
// Page content lives between y 140 and y 1540 (captions below). Logos: Claude, Codex (user supplied).
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Head, Glass, Tag, Node, Link, Code, K, Mover, Tokens, Icon, Logo, At, Center, Appear, PopIn, Txt,
  WHITE, MUTED, DIM, CORAL, BLUE, MINT, AMBER, RED, INK, MONO, SANS} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;

export const cfg: Config = {
  cuts: [
    {a: 0, b: 1.2, m: 'talk'},
    {a: 1.2, b: 6.3, m: 'page'},
    {a: 6.3, b: 7.3, m: 'talk'},
    {a: 7.3, b: 13.2, m: 'page'},
    {a: 13.2, b: 15.1, m: 'talk'},
    {a: 15.1, b: 23.6, m: 'page'},
    {a: 23.6, b: 25.7, m: 'talk'},
    {a: 25.7, b: 36.9, m: 'page'},
    {a: 36.9, b: 39.5, m: 'talk'},
    {a: 39.5, b: 43.4, m: 'page'},
    {a: 43.4, b: 46.4, m: 'talk'},
    {a: 46.4, b: 63.9, m: 'page'},
    {a: 63.9, b: 65.4, m: 'talk'},
    {a: 65.4, b: 82.3, m: 'page'},
    {a: 82.3, b: END + 1, m: 'talk'},
  ],
};

const Q: React.FC<{y: number; t0: number; logo?: string; icon?: string; text: React.ReactNode}> = ({y, t0, logo, icon, text}) => (
  <Glass x={90} y={y} w={900} h={160} t0={t0} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px'}}>
    {logo ? <Logo src={logo} h={96} style={{borderRadius: 20}} /> : <Icon name={icon!} size={86} color={BLUE} />}
    <Txt size={50} w={800}>{text}</Txt>
  </Glass>
);
const X: React.FC<{t0: number; size?: number}> = ({t0, size = 70}) => <PopIn t0={t0}><Icon name="x-circle" size={size} color={RED} /></PopIn>;
const Ok: React.FC<{t0: number; size?: number}> = ({t0, size = 70}) => <PopIn t0={t0}><Icon name="check-circle" size={size} color={MINT} /></PopIn>;

// ------------------------------------------------------------------ scenes
const Hook: React.FC = () => (
  <>
    <Head t0={1.25} label="AI BASICS" title="Harness kya hai?" />
    <Q y={400} t0={T.cc - 0.1} logo="logos/claude.png" text={<>Claude Code = <span style={{color: CORAL}}>harness?</span></>} />
    <Q y={600} t0={T.agent - 0.1} icon="robot" text={<>Agent = <span style={{color: CORAL}}>harness?</span></>} />
    <Center y={860}><PopIn t0={T.harnessq}><div style={{width: 260, height: 260, borderRadius: 130, border: `2px solid ${CORAL}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 80px ${CORAL}55, inset 0 0 40px ${CORAL}33`}}>
      <Icon name="question" size={170} color={CORAL} />
    </div></PopIn></Center>
  </>
);

const Myth: React.FC = () => (
  <>
    <Head t0={7.35} label="MYTH" title="LLM sab karta hai?" />
    {[['file-text', 'file padhna', T.file], ['play', 'code run', T.run], ['magnifying-glass', 'web search', T.web]].map(([ic, tx, at], i) => (
      <React.Fragment key={i}>
        <Glass x={90 + i * 310} y={380} w={280} h={260} t0={at as number} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
          <Icon name={ic as string} size={90} color={BLUE} /><Txt size={32} w={800}>{tx}</Txt>
        </Glass>
        <At x={90 + i * 310 + 200} y={360}><X t0={T.nothing + i * 0.12} size={80} /></At>
      </React.Fragment>
    ))}
    <Glass x={90} y={720} w={900} h={420} t0={T.nothing + 0.3} tint={CORAL}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Icon name="brain" size={70} color={CORAL} /><Txt size={44} w={800}>LLM ka asli kaam</Txt></div>
      <div style={{marginTop: 30}}><Tokens t0={T.token} tokens={['Node', '.js', ' is', ' a', ' runtime', ' that', ' lets', ' you', '...']} rate={7} /></div>
      <div style={{marginTop: 30}}><Appear t0={T.predict}><Tag color={CORAL} size={32} icon="sparkle">sirf next token predict</Tag></Appear></div>
    </Glass>
  </>
);

const ToolCall: React.FC = () => (
  <>
    <Head t0={15.15} label="MODERN LLMs" title="Tool call likhte hain" />
    <Code x={90} y={360} w={900} t0={15.5} title="LLM output (just text)" size={36} lines={[
      {at: T.tool, text: <>{'{'}</>},
      {at: T.tool + 0.3, text: <>  <K c={BLUE}>"tool"</K>: <K c={AMBER}>"read_file"</K>,</>, hl: [T.read, T.md]},
      {at: T.read + 0.3, text: <>  <K c={BLUE}>"path"</K>: <K c={MINT}>"README.md"</K></>, hl: [T.md, T.md + 1.2]},
      {at: T.md + 0.3, text: <>{'}'}</>},
    ]} />
    <At x={90} y={790}><div style={{display: 'flex', gap: 20}}>
      <Appear t0={T.likh}><Tag color={MINT} icon="check-circle" size={34}>likh sakta hai</Tag></Appear>
      <Appear t0={T.norun}><Tag color={RED} icon="x-circle" size={34}>run nahi kar sakta</Tag></Appear>
    </div></At>
    <Glass x={90} y={920} w={900} h={220} t0={T.norun + 0.2} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px'}}>
      <div style={{position: 'relative'}}><Icon name="play" size={110} color={DIM} /><At x={56} y={56}><X t0={T.norun + 0.3} size={64} /></At></div>
      <div><Txt size={40} w={800}>Execute? Nahi.</Txt><Appear t0={T.generate}><Txt size={34} w={600} color={MUTED} style={{marginTop: 10}}>Kaam: bas text generate karna</Txt></Appear></div>
    </Glass>
  </>
);

const Loop: React.FC = () => {
  const t = useT();
  return <>
    <Head t0={25.75} label="THE HARNESS" title="LLM ke around loop" />
    <Node x={90} y={380} w={300} h={300} t0={25.9} icon="brain" label="LLM" sub="writes text" tint={CORAL} />
    <Node x={690} y={380} w={300} h={300} t0={26.1} icon="wrench" label="Harness" sub="runs things" tint={BLUE} />
    <Node x={390} y={900} w={300} h={280} t0={T.actual - 0.3} icon="code" label="Tools" sub="file · bash · web" tint={MINT} />
    <Link x1={690} y1={450} x2={392} y2={450} t0={T.tools} curve={70} color={BLUE} flow={[T.tools, T.response]} />
    <At x={420} y={330}><Appear t0={T.tools}><Tag color={BLUE} size={24}>1 · tools list</Tag></Appear></At>
    <Link x1={390} y1={610} x2={688} y2={610} t0={T.response} curve={-70} color={CORAL} flow={[T.response, T.actual]} />
    <At x={430} y={690}><Appear t0={T.detect}><Tag color={CORAL} size={24}>2 · tool call detect</Tag></Appear></At>
    <Link x1={800} y1={690} x2={640} y2={905} t0={T.actual} color={MINT} flow={[T.actual, T.result + 0.4]} />
    <At x={740} y={790}><Appear t0={T.actual}><Tag color={MINT} size={24}>3 · run</Tag></Appear></At>
    <Mover x1={600} y1={900} x2={820} y2={700} t0={T.result} d={0.5} hold={false}><Tag color={MINT} solid size={22}>result</Tag></Mover>
    <Mover x1={700} y1={440} x2={390} y2={440} t0={T.back} d={0.7} hold={false}><Tag color={BLUE} solid size={22}>4 · result</Tag></Mover>
    <Center y={1240}><Appear t0={T.loop}><div style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <div style={{transform: `rotate(${(t - T.loop) * 160}deg)`}}><Icon name="arrows-clockwise" size={70} color={AMBER} /></div>
      <Txt size={42} w={800}>Loop <span style={{color: AMBER}}>until task complete</span></Txt>
    </div></Appear></Center>
    <Center y={1360}><PopIn t0={T.complete}><Tag color={MINT} solid size={30} icon="check-circle">done</Tag></PopIn></Center>
  </>;
};

const Agent: React.FC = () => {
  const box = (x: number, at: number, icon: string, label: string, tint: string) => (
    <Glass x={x} y={560} w={260} h={300} t0={at} tint={tint} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
      <Icon name={icon} size={100} color={tint} /><Txt size={40} w={800}>{label}</Txt>
    </Glass>
  );
  return <>
    <Head t0={39.55} label="SO" title="Agent kya hai?" />
    <Center y={380}><Appear t0={T.teesri}><Tag color={MUTED} size={30}>koi teesri cheez nahi</Tag></Appear></Center>
    {box(60, T.l - 0.1, 'brain', 'LLM', CORAL)}
    <At x={330} y={650}><PopIn t0={T.plus}><Txt size={100} w={800} color={MUTED}>+</Txt></PopIn></At>
    {box(410, T.h - 0.1, 'wrench', 'Harness', BLUE)}
    <At x={680} y={650}><PopIn t0={T.a - 0.1}><Txt size={100} w={800} color={MUTED}>=</Txt></PopIn></At>
    {box(760, T.a, 'robot', 'Agent', MINT)}
  </>;
};

const Layers: React.FC = () => (
  <>
    <Head t0={46.45} label="CLAUDE CODE" title="Harness? Partly" />
    <At x={810} y={150}><PopIn t0={46.6}><Logo src="logos/claude.png" h={120} style={{borderRadius: 26}} /></PopIn></At>
    <Center y={390}><Appear t0={T.parts}><Tag color={CORAL} size={32}>do parts</Tag></Appear></Center>
    <Glass x={90} y={500} w={900} h={330} t0={T.interface - 0.1} tint={CORAL}>
      <Txt size={26} w={800} color={CORAL} style={{letterSpacing: 3}}>1 · INTERFACE</Txt>
      <Txt size={44} w={800} style={{marginTop: 12}}>Jo tum dekhte ho</Txt>
      <div style={{display: 'flex', gap: 20, marginTop: 30}}>
        <Appear t0={T.terminal}><Tag color={WHITE} icon="terminal-window" size={30}>terminal</Tag></Appear>
        <Appear t0={T.desktop}><Tag color={WHITE} icon="desktop" size={30}>desktop app</Tag></Appear>
      </div>
    </Glass>
    <At x={90} y={880}><Appear t0={T.hidden - 0.3}><div style={{width: 900, borderTop: `3px dashed ${MUTED}`, opacity: 0.6}} /></Appear></At>
    <At x={400} y={860}><Appear t0={T.hidden - 0.3}><Txt size={26} w={700} color={MUTED} style={{background: INK, padding: '0 16px'}}>under the surface</Txt></Appear></At>
    <Glass x={90} y={940} w={900} h={300} t0={T.hidden} tint={BLUE}>
      <Txt size={26} w={800} color={BLUE} style={{letterSpacing: 3}}>2 · HARNESS</Txt>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14}}><Icon name="wrench" size={70} color={BLUE} /><Txt size={44} w={800}>Andar chupa hua</Txt></div>
      <Txt size={30} w={600} color={MUTED} style={{marginTop: 20}}>tools, loop, permissions, context</Txt>
    </Glass>
  </>
);

const Flow: React.FC = () => (
  <>
    <Head t0={55.05} label="UNDER THE HOOD" title="Prompt ke baad" />
    <Code x={90} y={360} w={900} t0={55.3} title="terminal" size={34} tint={CORAL} lines={[
      {at: 55.5, text: <><K c={MINT}>$</K> claude</>},
      {at: T.prompt - 0.2, text: <><K c={CORAL}>&gt;</K> fix the login bug</>, hl: [T.prompt, T.sdk]},
    ]} />
    <Link x1={540} y1={600} x2={540} y2={690} t0={T.prompt + 0.3} color={CORAL} flow={[T.prompt + 0.3, 63]} />
    <Glass x={90} y={700} w={900} h={190} t0={T.sdk - 0.2} tint={BLUE} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 34px'}}>
      <Icon name="wrench" size={80} color={BLUE} />
      <div><Txt size={44} w={800}>Claude Agent SDK</Txt><Txt size={28} w={600} color={MUTED} style={{marginTop: 6}}>Anthropic ka harness</Txt></div>
    </Glass>
    <Link x1={540} y1={895} x2={540} y2={985} t0={T.comm - 0.3} color={BLUE} flow={[T.comm - 0.3, 63]} />
    <Glass x={90} y={995} w={900} h={170} t0={T.comm} tint={CORAL} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 34px'}}>
      <Logo src="logos/claude.png" h={96} style={{borderRadius: 20}} />
      <Txt size={44} w={800}>Claude model (LLM)</Txt>
    </Glass>
    <Glass x={90} y={1220} w={900} h={170} t0={T.codex - 0.1} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 34px'}}>
      <Logo src="logos/codex.png" h={100} />
      <Txt size={44} w={800}>Codex: <span style={{color: BLUE}}>same idea</span></Txt>
    </Glass>
  </>
);

const Kitchen: React.FC = () => (
  <>
    <Head t0={65.45} label="ANALOGY" title="Restaurant socho" />
    <Glass x={60} y={360} w={460} h={360} t0={T.chef - 0.1} tint={CORAL}>
      <Icon name="chef-hat" size={90} color={CORAL} />
      <Txt size={44} w={800} style={{marginTop: 12}}>Chef</Txt>
      <Appear t0={T.cllm}><Txt size={34} w={700} color={CORAL}>= LLM</Txt></Appear>
      <Appear t0={T.knowledge}><Txt size={26} w={600} color={MUTED} style={{marginTop: 10}}>recipe ka knowledge</Txt></Appear>
    </Glass>
    <Glass x={560} y={360} w={460} h={360} t0={T.kitchen - 0.1} tint={BLUE}>
      <Icon name="cooking-pot" size={90} color={BLUE} />
      <Txt size={44} w={800} style={{marginTop: 12}}>Kitchen</Txt>
      <Appear t0={T.kh}><Txt size={34} w={700} color={BLUE}>= Harness</Txt></Appear>
      <div style={{display: 'flex', gap: 16, marginTop: 14}}>
        <PopIn t0={T.gas}><Icon name="fire" size={48} color={AMBER} /></PopIn>
        <PopIn t0={T.barten}><Icon name="cooking-pot" size={48} color={WHITE} /></PopIn>
        <PopIn t0={T.knife}><Icon name="knife" size={48} color={WHITE} /></PopIn>
      </div>
    </Glass>
    <At x={90} y={740}><Appear t0={T.bina}><Tag color={RED} icon="x-circle" size={28}>bina kitchen kuch nahi</Tag></Appear></At>
    <Glass x={60} y={850} w={960} h={240} t0={T.chef2 - 0.1} tint={MINT} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 14}}>
      <Txt size={50} w={800}>Chef + Kitchen = <span style={{color: MINT}}>Agent</span></Txt>
      <Appear t0={T.khana}><Tag color={MINT} solid size={28} icon="check-circle">khana ready</Tag></Appear>
    </Glass>
    <Glass x={60} y={1130} w={960} h={230} t0={T.counter - 0.1} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px'}}>
      <Icon name="storefront" size={100} color={AMBER} />
      <div><Txt size={46} w={800}>Counter = <span style={{color: AMBER}}>Interface</span></Txt><Appear t0={T.order}><Txt size={30} w={600} color={MUTED} style={{marginTop: 8}}>jahan tum order dete ho</Txt></Appear></div>
    </Glass>
  </>
);

export const scenes: Scene[] = [
  {a: 1.2, b: 6.3, el: Hook},
  {a: 7.3, b: 13.2, el: Myth},
  {a: 15.1, b: 23.6, el: ToolCall},
  {a: 25.7, b: 36.9, el: Loop},
  {a: 39.5, b: 43.4, el: Agent},
  {a: 46.4, b: 55.0, el: Layers},
  {a: 55.0, b: 63.9, el: Flow},
  {a: 65.4, b: 82.3, el: Kitchen},
];
