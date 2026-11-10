// How I code with AI. Theme: dev-desktop. The reel lives on Saurav's desktop: the camera is one app, and every step of
// his workflow opens as its own app window (AI chat, whiteboard, schema designer, spec.md, browser, terminal, notes).
// Browser shots: DataCamp "Spec-Driven Development with Claude Code" tutorial (screenshots taken in his browser).
// Example data (tables, commits, hashes, token numbers) is illustrative.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, lerp, ease, useT} from './core';
import {Config, Cut, Icon, At, Appear, PopIn, Txt, Type, Sticky, Strike, Pill,
  INK, GREY, SOFT, LINE, PAPER, LIME, ORANGE, TEAL, BLUE, RED, GREEN, YELLOW, CLAUDE, SANS, MONO, HAND} from './theme/kit';
import data from './data.json';

const END = (data as any).duration;
const BW = 1020, BH = 1316; // window body size

// ------------------------------------------------------------------ shared chat bits
const Bubble: React.FC<{me?: boolean; t0: number; children: React.ReactNode; w?: number}> = ({me, t0, children, w = 760}) => {
  const t = useT(); if (t < t0) return null; const k = ease(t, t0, 0.3);
  return <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginTop: 22, opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
    {!me && <div style={{width: 56, height: 56, borderRadius: 16, background: CLAUDE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0}}><Icon name="sparkle" size={34} color={PAPER} /></div>}
    <div style={{maxWidth: w, background: me ? INK : PAPER, color: me ? PAPER : INK, border: me ? 'none' : `2px solid ${LINE}`, borderRadius: me ? '26px 26px 8px 26px' : '26px 26px 26px 8px', padding: '20px 26px', fontFamily: SANS, fontWeight: 600, fontSize: 35, lineHeight: 1.35}}>{children}</div>
  </div>;
};
const ChatBody: React.FC<{children: React.ReactNode; side?: React.ReactNode}> = ({children, side}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex'}}>
    {side && <div style={{width: 250, borderRight: `2px solid ${LINE}`, background: '#F5F3FA', padding: 22, boxSizing: 'border-box'}}>{side}</div>}
    <div style={{flex: 1, padding: '10px 36px', overflow: 'hidden', position: 'relative'}}>{children}</div>
  </div>
);

// ------------------------------------------------------------------ 1. vibe prompt goes wrong (8.3 - 24.2)
const CODE = ['import express from "express"', 'const app = express()', 'app.post("/order", async (req, res) => {', '  const o = await db.orders.create(req.body)', '  res.json(o.user.id)', '})', 'app.listen(3000)'];
const Vibe: React.FC = () => {
  const t = useT(); const tok = clamp((t - 16.3) / 3.0);
  return <ChatBody>
    <Bubble me t0={9.3}><Type text="This is what I want to build. Make no mistakes." t0={9.4} t1={11.9} /></Bubble>
    <Bubble t0={12.6} w={800}><div style={{fontFamily: MONO, fontSize: 25, fontWeight: 500, lineHeight: 1.55}}>{CODE.map((l, i) => <div key={i} style={{opacity: t > 12.8 + i * 0.25 ? 1 : 0, whiteSpace: 'pre'}}>{l}</div>)}</div></Bubble>
    {t > 15.0 && <div style={{marginTop: 26, borderRadius: 18, background: '#FFF1F1', border: '2px solid #F8B4B4', padding: '16px 22px', opacity: ease(t, 15.0, 0.3)}}>
      <Txt size={28} font={MONO} w={700} color={RED}>TypeError: cannot read 'id' of undefined</Txt></div>}
    {t > 16.3 && <div style={{marginTop: 26, opacity: ease(t, 16.3, 0.3)}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}><Txt size={24} font={MONO} w={700} color={GREY}>TOKENS USED</Txt><Txt size={24} font={MONO} w={700} color={tok > 0.8 ? RED : INK}>{Math.round(lerp(38, 97, tok))}%</Txt></div>
      <div style={{height: 22, borderRadius: 11, background: LINE, marginTop: 8}}><div style={{height: 22, borderRadius: 11, width: `${lerp(38, 97, tok)}%`, background: tok > 0.8 ? RED : ORANGE}} /></div>
      <Appear t0={18.5}><Txt size={24} font={MONO} w={500} color={GREY} style={{marginTop: 8}}>where did they all go?</Txt></Appear>
    </div>}
    <Sticky x={330} y={1000} w={380} t0={20.6} color="#FFB4A8" size={46}>feeling lost, quit halfway?</Sticky>
  </ChatBody>;
};

// ------------------------------------------------------------------ 2. whiteboard: user flow + edge cases (27.1 - 33.0)
const FLOW = ['Sign up', 'Browse', 'Cart', 'Pay', 'Track'];
const Board: React.FC = () => {
  const t = useT();
  return <div style={{position: 'absolute', inset: 0, background: PAPER, backgroundImage: 'radial-gradient(#E3E0EA 2px, transparent 2.5px)', backgroundSize: '34px 34px'}}>
    <At x={50} y={40}><Txt size={68} font={HAND} w={700}>my system design</Txt></At>
    <At x={50} y={140}><Appear t0={28.6}><Txt size={46} font={HAND} w={700} color={BLUE}>user flow</Txt></Appear></At>
    {FLOW.map((s, i) => { const x = 60 + (i % 3) * 320, y = 230 + Math.floor(i / 3) * 230; const t0 = 28.8 + i * 0.3; return <React.Fragment key={s}>
      <PopIn t0={t0} style={{position: 'absolute', left: x, top: y}}><div style={{width: 250, height: 120, border: `5px solid ${INK}`, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 54, background: PAPER}}>{s}</div></PopIn>
      {i !== 2 && i < FLOW.length - 1 && t > t0 + 0.2 && <svg style={{position: 'absolute', left: x + 255, top: y + 50, overflow: 'visible'}} width={60} height={20}><path d="M 4 10 L 56 10 M 44 0 L 56 10 L 44 20" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></svg>}
      {i === 2 && t > t0 + 0.2 && <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={BW} height={BH}><path d={`M ${x + 125} ${y + 124} Q ${x + 125} ${y + 175} 185 ${y + 226}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></svg>}
    </React.Fragment>; })}
    <At x={50} y={740}><Appear t0={31.7}><Txt size={46} font={HAND} w={700} color={RED}>edge cases</Txt></Appear></At>
    <Sticky x={60} y={820} w={290} t0={31.9} size={44}>payment fails?</Sticky>
    <Sticky x={380} y={820} w={290} t0={32.2} color="#BDE8FF" size={44}>item out of stock?</Sticky>
    <Sticky x={700} y={820} w={270} t0={32.5} color="#C8F7C5" size={44}>user goes offline?</Sticky>
  </div>;
};

// ------------------------------------------------------------------ 3. schema designer (33.0 - 38.3)
const TABLES: [string, string[], number, number][] = [['users', ['id', 'name', 'email'], 60, 120], ['orders', ['id', 'user_id', 'status', 'total'], 380, 360], ['payments', ['id', 'order_id', 'status', 'amount'], 700, 120]];
const Schema: React.FC = () => {
  const t = useT();
  return <div style={{position: 'absolute', inset: 0, background: '#F7F9FB', backgroundImage: 'linear-gradient(#E9EEF3 1.5px, transparent 1.5px), linear-gradient(90deg, #E9EEF3 1.5px, transparent 1.5px)', backgroundSize: '40px 40px'}}>
    <At x={50} y={36}><Txt size={34} font={MONO} w={700} color={TEAL}>schema.sql</Txt></At>
    {t > 37.0 && <svg width={BW} height={BH} style={{position: 'absolute', inset: 0}}>
      <path d="M 320 245 C 360 245, 340 500, 380 500" stroke={TEAL} strokeWidth={5} fill="none" opacity={ease(t, 37.1, 0.4)} />
      <path d="M 640 500 C 680 500, 660 245, 700 245" stroke={TEAL} strokeWidth={5} fill="none" opacity={ease(t, 37.4, 0.4)} />
    </svg>}
    {TABLES.map(([name, fields, x, y], i) => <PopIn key={name} t0={35.0 + i * 0.25} style={{position: 'absolute', left: x, top: y}}>
      <div style={{width: 260, borderRadius: 18, background: PAPER, border: `2.5px solid ${TEAL}`, overflow: 'hidden', boxShadow: '0 12px 28px rgba(20,60,80,.12)'}}>
        <div style={{background: TEAL, padding: '12px 18px'}}><Txt size={30} font={MONO} w={700} color={PAPER}>{name}</Txt></div>
        {fields.map((f, j) => <div key={f} style={{padding: '9px 18px', borderTop: j ? `1.5px solid ${LINE}` : 'none', opacity: ease(t, 36.2 + j * 0.1, 0.25)}}><Txt size={25} font={MONO} w={500} color={f.endsWith('_id') ? TEAL : INK}>{f}</Txt></div>)}
      </div></PopIn>)}
    <At x={60} y={760}><Appear t0={37.3}><Pill bg={TEAL} icon="link" size={28}>users → orders → payments</Pill></Appear></At>
    <At x={60} y={1240}><Txt size={22} font={MONO} w={500} color={SOFT}>example schema</Txt></At>
  </div>;
};

// ------------------------------------------------------------------ 4. Claude reviews it, guard against over-engineering (38.3 - 60.4)
const EXTRA: [string, number][] = [['+ audit_logs table', 53.4], ['+ user_preferences table', 53.9], ['+ order_events table', 54.8], ['+ 9 extra fields', 55.3]];
const Review: React.FC = () => {
  const t = useT(); const phase2 = t > 50.6;
  const side = <>
    <Txt size={22} font={MONO} w={700} color={GREY}>ATTACHED</Txt>
    {[['pencil-simple-line', 'user-flow.board'], ['database', 'schema.sql']].map(([ic, n], i) => <Appear key={n} t0={41.8 + i * 0.4}><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 12px', borderRadius: 14, background: PAPER, border: `2px solid ${LINE}`}}>
      <Icon name={ic} size={30} color={i ? TEAL : ORANGE} /><Txt size={20} font={MONO} w={700}>{n}</Txt></div></Appear>)}
    <Appear t0={39.9}><div style={{marginTop: 40, padding: 14, borderRadius: 14, background: INK}}><Txt size={22} font={MONO} w={700} color={LIME}>mode: review</Txt><Txt size={20} font={MONO} w={500} color={SOFT}>no code yet</Txt></div></Appear>
  </>;
  return <ChatBody side={side}>
    {!phase2 && <>
      <Bubble me t0={41.4} w={640}><Type text="Here's my design and schema. What did I miss? Which edge cases, which fields? How can I make it better?" t0={41.5} t1={47.9} /></Bubble>
      <Bubble t0={47.6} w={640}><div>You missed:</div>
        {['refund flow when payment fails', 'orders.updated_at', 'payments.idempotency_key'].map((s, i) => <Appear key={s} t0={47.9 + i * 0.35}><div style={{fontFamily: MONO, fontSize: 28, marginTop: 8}}>• {s}</div></Appear>)}</Bubble>
    </>}
    {phase2 && <>
      <Bubble t0={50.7} w={640}><div>I'd also add:</div>
        {EXTRA.map(([s, t0], i) => <div key={s} style={{position: 'relative', opacity: ease(t, t0, 0.25), marginTop: 8}}><span style={{fontFamily: MONO, fontSize: 29, color: t > 57.6 ? SOFT : INK}}>{s}</span>
          <Strike x={0} y={20} w={430} t0={57.2 + i * 0.18} /></div>)}</Bubble>
      <Appear t0={51.0}><div style={{marginTop: 28}}><Pill bg={ORANGE} icon="warning" size={26}>over-engineering alert</Pill></div></Appear>
      <Appear t0={56.9}><div style={{marginTop: 18}}><Pill bg={INK} color={LIME} size={24}>extra tables = complex DB for no reason</Pill></div></Appear>
      <Sticky x={200} y={940} w={420} t0={59.1} size={52}>the decision is mine</Sticky>
    </>}
  </ChatBody>;
};

// ------------------------------------------------------------------ 5. browser: DataCamp article (71.3 - 77.0, 92.3 - 100.4)
const Shot: React.FC<{src: string; t0: number; hl?: [number, number, number, number, number]}> = ({src, t0, hl}) => {
  const t = useT(); const s = BW / 800;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: PAPER}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#F1EFF6', borderBottom: `1.5px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 20px'}}>
      <div style={{flex: 1, height: 42, borderRadius: 21, background: PAPER, border: `1.5px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10, overflow: 'hidden'}}><Icon name="lock-simple" size={22} color={GREY} /><Txt size={21} font={MONO} w={500} color={GREY}>datacamp.com/tutorial/spec-driven-development-with-claude-code</Txt></div></div>
    <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 64, width: BW, height: 975 * s, opacity: ease(t, t0, 0.3)}} />
    {hl && t > hl[4] && <div style={{position: 'absolute', left: hl[0] * s, top: 64 + hl[1] * s, width: hl[2] * s * ease(t, hl[4], 0.5), height: hl[3] * s, background: 'rgba(198,255,94,.6)', mixBlendMode: 'multiply', borderRadius: 6}} />}
  </div>;
};
const Article1: React.FC = () => { const t = useT(); return t < 73.0 ? <Shot src="dc_title.jpg" t0={71.4} hl={[50, 112, 560, 96, 71.7]} /> : <Shot src="dc_gates.jpg" t0={73.0} hl={[50, 515, 700, 72, 74.6]} />; };
const Article2: React.FC = () => <Shot src="dc_vibe.jpg" t0={92.4} hl={[50, 230, 690, 48, 94.1]} />;

// ------------------------------------------------------------------ 6. spec.md (77.0 - 92.3)
const SPEC: [string, string, number][] = [
  ['# spec.md', 'my food app', 77.1],
  ['## Features', 'signup, cart, orders, payments', 77.8], ['## Design', 'monolith API + Postgres', 78.8], ['## User flow', 'sign up → browse → cart → pay → track', 80.3],
  ['## Database schema', 'users, orders, payments', 81.0], ['## API endpoints', 'POST /orders · POST /payments', 82.6], ['## Request / response', '{ orderId, amount } → { status }', 83.8],
  ['## Edge cases', 'payment fails → order unpaid, retry', 85.3], ['## Acceptance criteria', 'order paid + tracked = done', 87.8]];
const Spec: React.FC = () => {
  const t = useT();
  return <div style={{position: 'absolute', inset: 0, background: '#FDFCF8', padding: '24px 0', boxSizing: 'border-box', fontFamily: MONO}}>
    {SPEC.map(([h, body, t0], i) => { const done = t > 91.3 && i > 0;
      return t < t0 - 0.05 ? null : <div key={h} style={{display: 'flex', marginTop: i ? 14 : 0}}>
        <div style={{width: 70, textAlign: 'right', paddingRight: 18, color: SOFT, fontSize: 22, lineHeight: '43px'}}>{i * 2 + 1}<br />{i * 2 + 2}</div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 34, fontWeight: 700, color: i ? BLUE : INK, lineHeight: '44px'}}><Type text={h} t0={t0} t1={t0 + 0.35} caret={false} />{done && <span style={{color: GREEN, marginLeft: 14}}>✓</span>}</div>
          <div style={{fontSize: 28, fontWeight: 500, color: GREY, lineHeight: '42px'}}><Type text={body} t0={t0 + 0.3} t1={t0 + 0.9} caret={i === SPEC.length - 1} /></div>
        </div>
      </div>; })}
    <At x={70} y={1160}><Appear t0={89.6}><Pill bg={GREEN} icon="check-circle" size={26}>feature is done when this passes</Pill></Appear></At>
    <At x={680} y={20}><Appear t0={73.5}><Pill bg={INK} color={LIME} size={22}>written before any code</Pill></Appear></At>
  </div>;
};

// ------------------------------------------------------------------ 7. spec as a guided path (100.4 - 112.8)
const Guided: React.FC = () => {
  const side = <>
    <Txt size={22} font={MONO} w={700} color={GREY}>PROJECT CONTEXT</Txt>
    <Appear t0={100.6}><div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: 12, borderRadius: 14, background: PAPER, border: `2.5px solid ${BLUE}`}}><Icon name="push-pin" size={28} color={BLUE} /><Txt size={22} font={MONO} w={700}>spec.md</Txt></div></Appear>
    <Appear t0={110.9}><Txt size={20} font={MONO} w={500} color={GREY} style={{marginTop: 14, whiteSpace: 'normal'}}>loaded every time, no re-explaining</Txt></Appear>
  </>;
  return <ChatBody side={side}>
    <Bubble me t0={100.8} w={600}>Build the orders API as per spec.md</Bubble>
    <Bubble t0={102.2} w={620}><div>Following spec.md:</div>
      {['POST /orders', 'POST /payments', 'payment fails → unpaid + retry', 'acceptance criteria tests'].map((s, i) => <Appear key={s} t0={102.6 + i * 0.4}><div style={{fontFamily: MONO, fontSize: 28, marginTop: 8}}><span style={{color: GREEN}}>✓</span> {s}</div></Appear>)}</Bubble>
    <Appear t0={105.1}><div style={{marginTop: 30}}><Pill bg={INK} color={LIME} icon="eye" size={26}>I keep checking the backend flow</Pill></div></Appear>
    <Sticky x={200} y={940} w={430} t0={101.8} color="#BDE8FF" size={48}>no guessing, a guided path</Sticky>
  </ChatBody>;
};

// ------------------------------------------------------------------ 8. terminal: atomic commits (116.7 - 132.2)
const COMMITS: [string, string, number][] = [['9c1f2ab', 'feat(auth): signup and login', 118.2], ['4be7d10', 'feat(cart): add and remove items', 118.6], ['a41c2e9', 'feat(orders): create order', 119.0], ['e07b5c3', 'feat(payments): pay + failures', 119.4]];
const Term: React.FC = () => {
  const t = useT(); const L = (t0: number, children: React.ReactNode, color = '#D7D7E3') => t < t0 ? null : <div style={{fontFamily: MONO, fontSize: 29, color, lineHeight: 1.65, whiteSpace: 'pre', opacity: ease(t, t0, 0.15)}}>{children}</div>;
  return <div style={{position: 'absolute', inset: 0, padding: '26px 34px', boxSizing: 'border-box', background: '#17171F'}}>
    {L(116.9, <><span style={{color: LIME}}>➜</span> <span style={{color: '#7FB2FF'}}>~/food-app</span> <Type text="git log --oneline" t0={117.0} t1={117.7} caret={false} /></>)}
    {[...COMMITS].reverse().map(([h, m, t0]) => <React.Fragment key={h}>{L(t0, <><span style={{color: YELLOW}}>{h}</span> {m}</>)}</React.Fragment>)}
    {L(120.2, ' ')}
    {L(120.3, <><span style={{color: RED}}>✗</span> test failed: payments › refund twice</>, '#FF9A9A')}
    {L(121.4, <span style={{color: SOFT}}># AI can't fix it in chat</span>)}
    {L(122.4, <><span style={{color: LIME}}>➜</span> <Type text="git diff a41c2e9 e07b5c3" t0={122.5} t1={123.5} caret={false} /></>)}
    {L(124.2, <span style={{color: '#FFB86B'}}>+ processPayment(order)  // no idempotency check</span>)}
    {L(125.6, ' ')}
    {L(125.7, <><span style={{color: CLAUDE}}>✳ claude</span> <Type text="Bug is in payments after e07b5c3." t0={125.8} t1={127.0} caret={false} /></>)}
    {L(127.1, <Type text="  Add an idempotency check. Touch nothing else." t0={127.1} t1={128.6} />)}
    {L(129.0, <><span style={{color: GREEN}}>✓</span> tests passed</>, '#9BE59B')}
    <At x={34} y={1150}><Appear t0={130.6}><Pill bg={LIME} color={INK} icon="steering-wheel" size={28}>AI writes the code, I keep control</Pill></Appear></At>
    <At x={600} y={30}><Appear t0={116.8}><Pill bg="#2B2B38" color={LIME} size={24}>one feature = one commit</Pill></Appear></At>
    <At x={34} y={1240}><Txt size={20} font={MONO} w={500} color="#55556A">example commits</Txt></At>
  </div>;
};

// ------------------------------------------------------------------ 9. notes: my process (132.2 - 141.6)
const STEPS: [string, number][] = [['Design it yourself', 133.5], ['Write the spec', 134.3], ['AI reviews it', 135.4], ['Build with atomic commits', 136.3]];
const Notes: React.FC = () => {
  const t = useT();
  return <div style={{position: 'absolute', inset: 0, background: '#FFFDF5', padding: '40px 60px', boxSizing: 'border-box'}}>
    <Txt size={30} font={MONO} w={700} color={GREY}>NOTES</Txt>
    <Txt size={76} font={HAND} w={700} style={{marginTop: 6}}>how I build with AI</Txt>
    {STEPS.map(([s, t0]) => { const done = t > t0 + 0.2; return <div key={s} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 34, opacity: ease(t, t0 - 0.4, 0.3)}}>
      <div style={{width: 64, height: 64, borderRadius: 16, border: `4px solid ${done ? GREEN : SOFT}`, background: done ? GREEN : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${done ? 1 + 0.2 * Math.max(0, 1 - (t - t0 - 0.2) * 4) : 1})`}}>
        {done && <Icon name="check" size={42} color={PAPER} />}</div>
      <Txt size={50} w={800}>{s}</Txt></div>; })}
    <div style={{marginTop: 70}}><Appear t0={137.8}><Txt size={60} font={HAND} w={700} color={BLUE}>keep the decisions in your hands</Txt></Appear></div>
    <Sticky x={60} y={940} w={640} t0={139.4} color={LIME} size={56}>you control AI, not the other way round</Sticky>
  </div>;
};

// ------------------------------------------------------------------ overlays on the camera
const Hook: React.FC = () => {
  const t = useT(); if (t > 8.25) return null; const k = ease(t, 0.05, 0.35) * (1 - ease(t, 7.9, 0.3));
  return <div style={{position: 'absolute', left: 50, right: 50, top: 150, height: 110, borderRadius: 30, background: 'rgba(30,26,50,.72)', border: '1.5px solid rgba(255,255,255,.3)',
    display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', opacity: k, transform: `translateY(${(1 - k) * -30}px)`}}>
    <Icon name="magnifying-glass" size={50} color="rgba(255,255,255,.85)" />
    <Txt size={56} w={800} color={PAPER}><Type text="How do I code with AI?" t0={0.1} t1={1.1} /></Txt>
    <div style={{marginLeft: 'auto'}}><Pill bg={LIME} color={INK} size={24}>my workflow</Pill></div>
  </div>;
};
const CamNotes: React.FC = () => {
  const t = useT();
  if (t > 61.5 && t < 71.2) return <Sticky x={600} y={180} w={420} t0={62.3} color={LIME} size={52}>clear fundamentals = you steer AI</Sticky>;
  if (t > 112.9 && t < 116.6) return <Sticky x={620} y={180} w={400} t0={113.3} color={YELLOW} size={52}>I start with the backend</Sticky>;
  if (t > 143.0) return <div style={{position: 'absolute', left: 40, right: 40, top: 170, display: 'flex', justifyContent: 'center'}}><PopIn t0={143.4}><div style={{padding: '22px 30px', borderRadius: 28, background: 'rgba(30,26,50,.78)', border: '1.5px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: 16}}>
    <Icon name="chat-circle-dots" size={48} color={LIME} /><Txt size={42} w={800} color={PAPER}>How do you code with AI?</Txt></div></PopIn></div>;
  return null;
};

export const cfg: Config = {
  cuts: [
    {a: 0, b: 8.3, m: 'cam'},
    {a: 8.3, b: 24.2, m: 'chat', title: 'AI chat', el: Vibe},
    {a: 24.2, b: 27.1, m: 'cam'},
    {a: 27.1, b: 33.0, m: 'board', title: 'user-flow.board', el: Board},
    {a: 33.0, b: 38.3, m: 'schema', title: 'schema.sql', el: Schema},
    {a: 38.3, b: 60.4, m: 'chat', title: 'Claude: review only', el: Review},
    {a: 60.4, b: 71.3, m: 'cam'},
    {a: 71.3, b: 77.0, m: 'browser', title: 'datacamp.com', el: Article1},
    {a: 77.0, b: 92.3, m: 'spec', title: 'spec.md', el: Spec},
    {a: 92.3, b: 100.4, m: 'browser', title: 'datacamp.com', el: Article2},
    {a: 100.4, b: 112.8, m: 'chat', title: 'Claude', el: Guided},
    {a: 112.8, b: 116.7, m: 'cam'},
    {a: 116.7, b: 132.2, m: 'term', title: 'zsh: ~/food-app', el: Term},
    {a: 132.2, b: 141.6, m: 'notes', title: 'Notes', el: Notes},
    {a: 141.6, b: END + 1, m: 'cam'},
  ] as Cut[],
  overlays: [Hook, CamNotes],
};
export const scenes: any[] = [];
