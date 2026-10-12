// 10 AI terms you must know in 60 seconds. Theme: void-index. Not part of a series. Icons: Phosphor duotone.
// Card scenes: 1000 x 800. The countdown runs 60 -> 0 from "First is LLM" to the end of Loop Engineering (scaled to fit).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Scene, clamp, lerp, ease, useT, springAt} from './core';
import {Config, Appear, Tag, Flow, Icon, Box, ItemHead, Countdown, BG, PANEL, PANEL2, LINE, WHITE, GREY, BLUE, CYAN, ORANGE, GREEN, AMBER, RED, DISPLAY, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;
const TERMS = ['LLM', 'Tokenization', 'Vector Embeddings', 'Context', 'RAG', 'Memory', 'AI Agent', 'Harness Engineering', 'Evals', 'Loop Engineering'];
const STARTS = [T.first, T.second, T.third, T.fourth, T.fifth, T.sixth, T.seventh, T.eighth, T.ninth, T.last];

const Label: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, color = WHITE, font = SANS, w = 700, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...style}}>{children}</div>
);
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
const Pill: React.FC<{t0: number; x: number; y: number; icon?: string; color?: string; children: React.ReactNode}> = ({t0, x, y, icon, color = CYAN, children}) => (
  <Appear t0={t0} from="up" style={{left: x, top: y}}>
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 14, background: `${color}14`, border: `2px solid ${color}`}}>
      {icon && <Icon name={icon} size={30} color={color} />}<Label size={26}>{children}</Label>
    </div>
  </Appear>
);
const NodeBox: React.FC<{icon: string; label: string; sub?: string; w?: number; color?: string; on?: boolean}> = ({icon, label, sub, w = 220, color = BLUE, on = true}) => (
  <Box w={w} color={on ? color : LINE} glow={on} style={{padding: '18px 10px', textAlign: 'center'}}>
    <div style={{display: 'flex', justifyContent: 'center'}}><Icon name={icon} size={w * 0.28} color={on ? color : GREY} /></div>
    <Label size={26} font={DISPLAY} style={{marginTop: 8}}>{label}</Label>
    {sub && <Label size={17} font={MONO} w={500} color={GREY} style={{marginTop: 4}}>{sub}</Label>}
  </Box>
);
const Typed: React.FC<{t0: number; text: string; cps?: number; size?: number; color?: string}> = ({t0, text, cps = 22, size = 24, color = WHITE}) => {
  const t = useT(); const n = clamp(Math.floor((t - t0) * cps), 0, text.length);
  return <span style={{fontFamily: MONO, fontWeight: 500, fontSize: size, color, whiteSpace: 'pre-wrap'}}>{text.slice(0, n)}{n < text.length && t > t0 ? <span style={{color: CYAN}}>|</span> : null}</span>;
};

// ------------------------------------------------------------------ 00 the list
const List: React.FC = () => {
  const t = useT(); const hot = t > T.first - 0.4;
  return <>
    <Appear t0={1.8} from="left" style={{left: 36, top: 26}}><Label size={22} font={MONO} color={CYAN} style={{letterSpacing: '.18em'}}>THE LIST</Label><Label size={54} font={DISPLAY}>10 terms, 60 seconds</Label></Appear>
    {TERMS.map((term, i) => {
      const c = i < 5 ? 0 : 1, r = i % 5; const on = hot && i === 0;
      return <Appear key={i} t0={1.9 + i * 0.32} from={c ? 'right' : 'left'} style={{left: 36 + c * 478, top: 150 + r * 124}}>
        <Box w={450} h={104} color={on ? CYAN : LINE} glow={on} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '0 20px'}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: 'transparent', WebkitTextStroke: `2px ${i % 2 ? CYAN : BLUE}`, width: 64}}>{String(i + 1).padStart(2, '0')}</span>
          <Label size={i === 7 ? 27 : 31} font={DISPLAY}>{term}</Label>
        </Box>
      </Appear>;
    })}
  </>;
};

// ------------------------------------------------------------------ 01 LLM
const S1: React.FC = () => {
  const t = useT();
  return <>
    <ItemHead t0={T.first} n={1} term="LLM" full="Large Language Model" />
    <Appear t0={T.large} from="left" style={{left: 36, top: 250}}><Box w={260} h={190} style={{padding: 18}}><Label size={18} font={MONO} color={GREY}>INPUT</Label><div style={{marginTop: 10}}><Typed t0={T.large + 0.2} text="Explain RAG in one line" size={24} /></div></Box></Appear>
    <Flow x1={300} y1={345} x2={370} y2={345} t0={T.large + 0.6} n={2} />
    <Appear t0={T.large + 0.3} from="scale" style={{left: 370, top: 220}}>
      <Box w={260} h={250} color={BLUE} glow style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}>
        <Icon name="brain" size={70} color={BLUE} />
        {[0, 1, 2, 3].map(i => <div key={i} style={{width: 190, height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${BLUE}, ${CYAN})`, opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6 + i))}} />)}
      </Box>
    </Appear>
    <Flow x1={630} y1={345} x2={700} y2={345} t0={T.understand} n={2} />
    <Appear t0={T.understand} from="right" style={{left: 700, top: 250}}><Box w={264} h={190} style={{padding: 18}} color={CYAN}><Label size={18} font={MONO} color={GREY}>OUTPUT</Label><div style={{marginTop: 10}}><Typed t0={T.generate} text="Fetch facts, then answer" size={24} cps={14} /></div></Box></Appear>
    <Pill t0={T.understand} x={36} y={530} icon="text-aa">understands text</Pill>
    <Pill t0={T.generate} x={370} y={530} icon="sparkle" color={BLUE}>generates text</Pill>
    <Pill t0={T.train} x={36} y={630} icon="books" color={AMBER}>trained on huge amounts of text</Pill>
  </>;
};

// ------------------------------------------------------------------ 02 Tokenization
const TOKS = ['AI', ' agents', ' use', ' tools', '!'];
const S2: React.FC = () => {
  const t = useT(); const split = ease(t, T.smaller, 0.6);
  const cols = [BLUE, CYAN, ORANGE, GREEN, AMBER];
  return <>
    <ItemHead t0={T.second} n={2} term="Tokenization" full="text -> tokens" color={CYAN} />
    <Appear t0={T.tok} from="up" style={{left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: lerp(0, 22, split)}}>
      {TOKS.map((tk, i) => <div key={i} style={{padding: '18px 20px', borderRadius: split > 0.05 ? 16 : 0, background: split > 0.05 ? `${cols[i]}22` : 'transparent', border: split > 0.05 ? `2px solid ${cols[i]}` : '2px solid transparent', transform: `translateY(${Math.sin(i * 1.7) * 18 * split}px)`}}>
        <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 46, color: WHITE, whiteSpace: 'pre'}}>{tk.replace(' ', '·')}</span>
      </div>)}
    </Appear>
    <Appear t0={T.tokens} from="up" style={{left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', gap: 22}}>
      {['6052', '13307', '1199', '7526', '0'].map((id, i) => <Tag key={i} color={cols[i]} size={24}>{id}</Tag>)}
    </Appear>
    <Appear t0={T.tokens + 0.2} from="up" style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}><Label size={18} font={MONO} color={GREY}>token ids (illustrative)</Label></Appear>
    <Pill t0={T.smaller} x={36} y={560} icon="scissors">split into smaller units</Pill>
    <Pill t0={T.model2} x={36} y={660} icon="cpu" color={BLUE}>the model processes tokens, not words</Pill>
  </>;
};

// ------------------------------------------------------------------ 03 Vector embeddings
const PTS: [string, number, number, string][] = [['king', 150, 120, BLUE], ['queen', 200, 160, BLUE], ['cat', 430, 275, CYAN], ['dog', 520, 215, CYAN], ['car', 330, 380, AMBER]];
const S3: React.FC = () => {
  const t = useT();
  return <>
    <ItemHead t0={T.third} n={3} term="Vector Embeddings" full="meaning as numbers" />
    <Appear t0={T.numerical - 0.3} from="left" style={{left: 36, top: 240}}>
      <Box w={330} style={{padding: 20}}>
        {['king', 'queen', 'cat'].map((w, i) => <div key={i} style={{marginBottom: 14}}>
          <Label size={22} font={MONO} color={[BLUE, BLUE, CYAN][i]}>"{w}"</Label>
          <Label size={18} font={MONO} w={500} color={GREY}>{t > T.vectors + i * 0.25 ? ['[0.81, 0.12, -0.44, ...]', '[0.79, 0.15, -0.41, ...]', '[-0.32, 0.67, 0.08, ...]'][i] : ' '}</Label>
        </div>)}
      </Box>
    </Appear>
    <Appear t0={T.represent - 0.2} from="right" style={{left: 400, top: 230}}>
      <div style={{position: 'relative', width: 560, height: 440, borderRadius: 20, background: PANEL2, border: `2px solid ${LINE}`}}>
        <svg width={560} height={440} style={{position: 'absolute', inset: 0}}>
          <line x1={40} y1={410} x2={540} y2={410} stroke={LINE} strokeWidth={2} /><line x1={40} y1={410} x2={40} y2={20} stroke={LINE} strokeWidth={2} />
          {t > T.similarity && <line x1={150} y1={120} x2={200} y2={160} stroke={GREEN} strokeWidth={4} strokeDasharray="6 6" />}
          {t > T.similarity && <line x1={430} y1={275} x2={520} y2={215} stroke={GREEN} strokeWidth={4} strokeDasharray="6 6" />}
          {t > T.compare && <line x1={200} y1={160} x2={330} y2={380} stroke={RED} strokeWidth={3} strokeDasharray="6 6" opacity={0.7} />}
        </svg>
        {PTS.map(([w, x, y, c], i) => { const k = ease(t, T.represent + i * 0.15, 0.4);
          return <div key={i} style={{position: 'absolute', left: x - 12, top: y - 12, opacity: k, transform: `scale(${k})`}}>
            <div style={{width: 24, height: 24, borderRadius: 12, background: c, boxShadow: `0 0 14px ${c}`}} />
            <Label size={20} font={MONO} style={{position: 'absolute', left: 30, top: -2}}>{w}</Label>
          </div>; })}
      </div>
    </Appear>
    <Pill t0={T.semantic} x={36} y={700} icon="graph" color={GREEN}>similar meaning = close together</Pill>
  </>;
};

// ------------------------------------------------------------------ 04 Context
const SEGS: [string, string, number][] = [['system prompt', BLUE, 0.25], ['chat history', CYAN, 0.25], ['documents', ORANGE, 0.25], ['question', AMBER, 0.17]];
const S4: React.FC = () => {
  const t = useT();
  return <>
    <ItemHead t0={T.fourth} n={4} term="Context" full="what the model can see right now" color={CYAN} />
    <Appear t0={T.ctx} from="up" style={{left: 36, top: 260}}>
      <Label size={20} font={MONO} color={GREY}>CONTEXT WINDOW</Label>
      <div style={{marginTop: 10, width: 928, height: 120, borderRadius: 18, border: `3px solid ${CYAN}`, display: 'flex', overflow: 'hidden', background: PANEL2}}>
        {SEGS.map(([l, c, w], i) => { const k = ease(t, T.ctx + 0.3 + i * 0.45, 0.5);
          return <div key={i} style={{width: `${w * 100 * k}%`, height: '100%', background: `${c}33`, borderRight: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}><Label size={20} font={MONO} color={c}>{l}</Label></div>; })}
      </div>
    </Appear>
    <Appear t0={T.current} from="up" style={{left: 36, top: 450}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <Icon name="brain" size={80} color={BLUE} />
        <div><Label size={30} font={DISPLAY}>model writes the current response</Label><Label size={22} font={MONO} w={500} color={GREY}>using only what is inside the window</Label></div>
      </div>
    </Appear>
    <Pill t0={T.available} x={36} y={640} icon="eye-slash" color={ORANGE}>not in context = the model can't see it</Pill>
  </>;
};

// ------------------------------------------------------------------ 05 RAG
const S5: React.FC = () => {
  const t = useT();
  return <>
    <ItemHead t0={T.fifth} n={5} term="RAG" full="Retrieval-Augmented Generation" />
    <Appear t0={T.answers - 0.2} from="left" style={{left: 36, top: 240}}><NodeBox icon="chat-circle-text" label="Question" w={240} color={AMBER} /></Appear>
    <Flow x1={276} y1={320} x2={370} y2={320} t0={T.answers + 0.3} n={2} color={AMBER} />
    <Appear t0={T.external - 0.6} from="up" style={{left: 380, top: 240}}><NodeBox icon="magnifying-glass" label="Retrieve" w={240} color={CYAN} /></Appear>
    <Flow x1={620} y1={320} x2={716} y2={320} t0={T.external} n={2} color={CYAN} />
    <Appear t0={T.external} from="right" style={{left: 724, top: 240}}><NodeBox icon="files" label="Your docs" sub="external sources" w={240} color={CYAN} /></Appear>
    <Appear t0={T.relevant} from="up" style={{left: 36, top: 480}}>
      <div style={{display: 'flex', gap: 12}}>{['chunk 12', 'chunk 47', 'chunk 3'].map((c, i) => <Tag key={i} color={GREEN} size={22}>{c}</Tag>)}</div>
      <Label size={18} font={MONO} w={500} color={GREY} style={{marginTop: 8}}>most relevant pieces</Label>
    </Appear>
    <Flow x1={500} y1={510} x2={600} y2={510} t0={T.relevant + 0.4} n={2} color={GREEN} />
    <Appear t0={T.retrieve - 0.3} from="right" style={{left: 610, top: 440}}>
      <Box w={354} color={BLUE} glow style={{padding: 18}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Icon name="brain" size={40} color={BLUE} /><Label size={24} font={DISPLAY}>LLM answers</Label></div>
        <Label size={18} font={MONO} w={500} color={GREY} style={{marginTop: 8}}>grounded in the chunks</Label>
      </Box>
    </Appear>
    <Pill t0={T.retrieve + 0.3} x={36} y={680} icon="lightning" color={AMBER}>retrieve first, then generate</Pill>
  </>;
};

// ------------------------------------------------------------------ 06 Memory
const Msg: React.FC<{me?: boolean; children: React.ReactNode}> = ({me, children}) => (
  <div style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: 380, padding: '10px 16px', borderRadius: 16, background: me ? `${BLUE}33` : PANEL, border: `1px solid ${me ? BLUE : LINE}`, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: WHITE}}>{children}</div>
);
const S6: React.FC = () => {
  const t = useT();
  return <>
    <ItemHead t0={T.sixth} n={6} term="Memory" full="remember across conversations" color={CYAN} />
    <Appear t0={T.conversations - 0.4} from="left" style={{left: 36, top: 240}}>
      <Box w={420} style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
        <Label size={18} font={MONO} color={GREY}>CHAT 1 · MONDAY</Label>
        <Msg me>I always code in Python</Msg><Msg>Got it!</Msg>
      </Box>
    </Appear>
    <Appear t0={T.retain} from="scale" style={{left: 490, top: 270}}><NodeBox icon="database" label="Memory" sub="saved fact" w={190} color={CYAN} /></Appear>
    <Flow x1={456} y1={340} x2={490} y2={340} t0={T.retain} n={1} />
    {t > T.retain + 0.3 && <Appear t0={T.retain + 0.3} from="right" style={{left: 700, top: 300}}><Tag size={18} color={CYAN}>prefers Python</Tag></Appear>}
    <Appear t0={T.future - 0.2} from="left" style={{left: 36, top: 480}}>
      <Box w={600} style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
        <Label size={18} font={MONO} color={GREY}>CHAT 2 · FRIDAY</Label>
        <Msg me>Write me a script to rename files</Msg>
        {t > T.future + 1.2 && <Msg>Here's the Python version</Msg>}
      </Box>
    </Appear>
    <Flow x1={585} y1={420} x2={500} y2={500} t0={T.future + 0.4} n={2} color={CYAN} />
    <Pill t0={T.human} x={670} y={560} icon="brain" color={ORANGE}>like a human brain</Pill>
  </>;
};

// ------------------------------------------------------------------ 07 AI agent
const TOOLS: [string, string][] = [['globe', 'web search'], ['code', 'run code'], ['plugs', 'call APIs'], ['files', 'read files']];
const S7: React.FC = () => {
  const t = useT(); const cx = 300, cy = 470, R = 190;
  return <>
    <ItemHead t0={T.seventh} n={7} term="AI Agent" full="LLM + tools + steps" />
    <Appear t0={T.agent} from="scale" style={{left: cx - 95, top: cy - 85}}><NodeBox icon="robot" label="Agent" sub="LLM inside" w={190} /></Appear>
    {TOOLS.map(([ic, l], i) => { const a = -Math.PI / 2 + i * Math.PI / 2; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.8;
      return <React.Fragment key={i}>
        <Appear t0={T.tool - 0.2 + i * 0.12} from="scale" style={{left: x - 70, top: y - 34}}><Tag size={20} color={CYAN}><Icon name={ic} size={24} color={CYAN} />{l}</Tag></Appear>
      </React.Fragment>; })}
    <Appear t0={T.multistep - 0.2} from="right" style={{left: 600, top: 260}}>
      <Box w={364} style={{padding: 20}} color={GREEN} glow>
        <Label size={20} font={MONO} color={GREEN}>MULTI-STEP TASK</Label>
        {['search the docs', 'write the code', 'run the tests', 'report back'].map((s, i) => { const on = t > T.multistep + i * 0.3;
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, opacity: on ? 1 : 0.3}}><Icon name={on ? 'check-circle' : 'hourglass'} size={30} color={on ? GREEN : GREY} /><Label size={24}>{i + 1}. {s}</Label></div>; })}
      </Box>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 08 Harness engineering
const RINGS: [string, string, string, number][] = [['wrench', 'tools', CYAN, 0], ['lock-key', 'permissions', ORANGE, 1], ['terminal-window', 'execution env', AMBER, 2], ['shield-check', 'verification', GREEN, 3]];
const S8: React.FC = () => {
  const t = useT(); const keys = [T.tools8, T.permissions, T.execution, T.verification]; const cx = 300, cy = 480;
  return <>
    <ItemHead t0={T.eighth} n={8} term="Harness Engineering" full="the system around the model" color={CYAN} />
    {RINGS.slice().reverse().map(([, , c, i]) => { const k = ease(t, keys[i] - 0.2, 0.5); const r = 90 + (i + 1) * 52;
      return <div key={i} style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${c}`, background: `${c}0D`, opacity: k, transform: `scale(${0.85 + 0.15 * k})`}} />; })}
    <Appear t0={T.harness} from="scale" style={{left: cx - 70, top: cy - 70}}>
      <div style={{width: 140, height: 140, borderRadius: 70, background: PANEL2, border: `3px solid ${BLUE}`, boxShadow: `0 0 30px ${BLUE}66`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}><Icon name="brain" size={56} color={BLUE} /><Label size={20} font={MONO}>model</Label></div>
    </Appear>
    {RINGS.map(([ic, l, c, i]) => <Appear key={i} t0={keys[i]} from="right" style={{left: 640, top: 250 + i * 120}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 18, height: 18, borderRadius: 9, background: c}} /><Icon name={ic} size={40} color={c} /><Label size={28} font={DISPLAY}>{l}</Label></div>
    </Appear>)}
  </>;
};

// ------------------------------------------------------------------ 09 Evals
const CASES: [string, boolean][] = [['refund policy question', true], ['date math', false], ['summarise a PDF', true], ['SQL query', true]];
const S9: React.FC = () => {
  const t = useT();
  const bars: [string, number, number, string][] = [['accurate', T.accurate, 0.82, GREEN], ['reliable', T.reliable, 0.74, CYAN], ['useful', T.useful, 0.88, BLUE]];
  return <>
    <ItemHead t0={T.ninth} n={9} term="Evals" full="test the output, systematically" />
    <Appear t0={T.test - 0.4} from="left" style={{left: 36, top: 240}}>
      <Box w={500} style={{padding: 18}}>
        <Label size={18} font={MONO} color={GREY}>TEST CASES</Label>
        {CASES.map(([c, ok], i) => { const on = t > T.test + i * 0.3;
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, opacity: on ? 1 : 0.3}}>
            <Icon name={on ? (ok ? 'check-circle' : 'x-circle') : 'hourglass'} size={32} color={on ? (ok ? GREEN : RED) : GREY} /><Label size={24}>{c}</Label></div>; })}
      </Box>
    </Appear>
    <div style={{position: 'absolute', left: 580, top: 250, width: 380}}>
      {bars.map(([l, t0, v, c], i) => <Appear key={i} t0={t0 - 0.1} from="right" style={{position: 'relative', marginBottom: 34}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><Label size={26} font={DISPLAY}>{l}</Label></div>
        <div style={{marginTop: 10, width: 380, height: 22, borderRadius: 11, background: PANEL2, border: `1px solid ${LINE}`, overflow: 'hidden'}}><div style={{width: `${v * 100 * ease(t, t0, 0.8)}%`, height: '100%', background: c, boxShadow: `0 0 12px ${c}`}} /></div>
      </Appear>)}
    </div>
    <Appear t0={T.useful + 0.2} from="up" style={{left: 580, top: 560}}><Label size={18} font={MONO} w={500} color={GREY}>scores are illustrative</Label></Appear>
  </>;
};

// ------------------------------------------------------------------ 10 Loop engineering
const S10: React.FC = () => {
  const t = useT(); const cx = 330, cy = 480, R = 200;
  const nodes: [string, string, string, number][] = [['lightning', 'act', BLUE, T.workflow], ['list-checks', 'check results', CYAN, T.results], ['chat-centered-dots', 'feedback', ORANGE, T.feedback], ['arrows-clockwise', 'iterate', AMBER, T.feedback + 0.8]];
  const dot = t > T.workflow ? ((t - T.workflow) * 0.5) % 1 : 0; const da = -Math.PI / 2 + dot * Math.PI * 2;
  return <>
    <ItemHead t0={T.last} n={10} term="Loop Engineering" full="run, check, improve, repeat" color={CYAN} />
    {t > T.workflow && <svg width={1000} height={800} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={LINE} strokeWidth={4} strokeDasharray="10 10" />
      <circle cx={cx + Math.cos(da) * R} cy={cy + Math.sin(da) * R} r={12} fill={CYAN} style={{filter: `drop-shadow(0 0 8px ${CYAN})`}} />
    </svg>}
    {nodes.map(([ic, l, c, t0], i) => { const a = -Math.PI / 2 + i * Math.PI / 2; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      return <Appear key={i} t0={t0 - 0.2} from="scale" style={{left: x - 90, top: y - 40}}>
        <div style={{width: 180, padding: '10px 8px', borderRadius: 16, background: PANEL2, border: `2px solid ${c}`, boxShadow: `0 0 18px ${c}44`, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center'}}><Icon name={ic} size={30} color={c} /><Label size={20} font={DISPLAY}>{l}</Label></div>
      </Appear>; })}
    <Appear t0={T.workflow} from="scale" style={{left: cx - 70, top: cy - 50}}><div style={{textAlign: 'center', width: 140}}><Icon name="robot" size={64} color={BLUE} style={{margin: '0 auto'}} /><Label size={20} font={MONO}>agent</Label></div></Appear>
    <Appear t0={T.iterate - 0.6} from="right" style={{left: 640, top: 420}}>
      <Box w={330} color={GREEN} glow style={{padding: 18, display: "flex", alignItems: "center", gap: 12}}><Icon name="flag-checkered" size={42} color={GREEN} /><Label size={22} font={DISPLAY}>until the task is done</Label></Box>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ talk overlays
const Band: React.FC<{a: number; b: number; children: React.ReactNode; top?: number}> = ({a, b, children, top = 1180}) => {
  const t = useT(); if (t < a - 0.05 || t > b + 0.3) return null;
  const k = ease(t, a, 0.35) * clamp((b + 0.25 - t) / 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{children}</div>;
};
const Plate: React.FC<{children: React.ReactNode; color?: string; pad?: string}> = ({children, color = BLUE, pad = '16px 30px'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: pad, borderRadius: 22, background: 'rgba(14,14,20,.9)', border: `2px solid ${color}`, boxShadow: `0 0 34px ${color}55`}}>{children}</div>
);
const Big: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 60, color = WHITE, children}) => (
  <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.05}}>{children}</span>
);
const Intro: React.FC = () => <Band a={0} b={1.75}>
  <Plate><Big size={64}>10 AI TERMS</Big><Big size={64} color={CYAN}>in 60s</Big><Icon name="timer" size={64} color={CYAN} /></Plate>
</Band>;
const Outro: React.FC = () => {
  const t = useT();
  return <>
    <Band a={77.3} b={81.9} top={1120}>
      <Plate color={GREEN}><Icon name="flag-checkered" size={56} color={GREEN} /><Big size={56}>10 terms in 60 seconds</Big></Plate>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: 960}}>
        {TERMS.map((s, i) => <Appear key={i} t0={77.5 + i * 0.12} from="scale" style={{position: 'relative'}}><Tag size={22} color={i % 2 ? CYAN : BLUE}>{s}</Tag></Appear>)}
      </div>
    </Band>
    <Band a={T.yaad - 0.1} b={END} top={1180}>
      <Plate color={ORANGE} pad="14px 28px"><Icon name="x-circle" size={48} color={ORANGE} /><Big size={48}>don't just memorize</Big></Plate>
      {t > T.understand2 && <Appear t0={T.understand2} from="up" style={{position: 'relative'}}><Plate color={CYAN} pad="14px 28px"><Icon name="gear" size={48} color={CYAN} /><Big size={48}>understand how they work</Big></Plate></Appear>}
    </Band>
  </>;
};

export const cfg: Config = {
  title: '10 AI TERMS',
  items: TERMS.map((label, i) => ({t: STARTS[i], label})),
  timer: {a: T.first, b: T.iterate + 0.2, from: 60},
  modes: [{a: 0, b: 1.7, m: 'talk'}, {a: 1.7, b: 77.2, m: 'card'}, {a: 77.2, b: END + 1, m: 'talk'}],
  face: {y0: 300, y1: 1000},
  overlays: [Intro, Outro],
  speaker: 'speaker.webm',
  cutBottom: 0.845,
  rawUntil: T.first,
};

export const scenes: Scene[] = [
  {a: 1.7, b: T.first, el: List}, {a: T.first, b: T.second, el: S1}, {a: T.second, b: T.third, el: S2}, {a: T.third, b: T.fourth, el: S3},
  {a: T.fourth, b: T.fifth, el: S4}, {a: T.fifth, b: T.sixth, el: S5}, {a: T.sixth, b: T.seventh, el: S6}, {a: T.seventh, b: T.eighth, el: S7},
  {a: T.eighth, b: T.ninth, el: S8}, {a: T.ninth, b: T.last, el: S9}, {a: T.last, b: 77.2, el: S10},
];
