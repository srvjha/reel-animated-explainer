// EXAMPLE: "What is middleware?" (106 s). Copy to src/Video.tsx and replace the scenes.
// Card scenes: 1000 x 880 in split mode, 1000 x 1290 in full mode.
import React from 'react';
import {Scene, clamp, lerp, ease, useT} from './core';
import {Config, Appear, Tag, Heading, Editor, Req, Gate, VArrow, INK, SUB, CARD, LINE, CORAL, BLUE, GREEN, RED, AMBER, TEAL, HEAD, SERIF, SANS, CODE} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const Big: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 44, color = INK, children, style}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

// ------------------------------------------------------------------ 01 fifty APIs
const ROUTES = ['/orders', '/cart', '/users', '/profile', '/payments', '/search', '/reviews', '/wishlist', '/address', '/coupons'];
const S1: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={7.7} n="01" title="50 APIs," accent="one check each" />
    <div style={{position: 'absolute', left: 36, top: 140, display: 'grid', gridTemplateColumns: 'repeat(5, 178px)', gap: 12}}>
      {Array.from({length: 50}).map((_, i) => {
        const on = t > T.apis - 0.3 + i * 0.025; const lock = t > T.authd - 0.2 + i * 0.012;
        return <div key={i} style={{height: 54, borderRadius: 12, background: CARD, border: `2px solid ${lock ? CORAL : LINE}`, opacity: on ? 1 : 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', fontFamily: CODE, fontWeight: 600, fontSize: 19, color: INK}}>
          <span>{ROUTES[i % 10]}</span>{lock && <span style={{fontSize: 15, color: '#fff', background: CORAL, borderRadius: 6, padding: '1px 6px'}}>auth?</span>}
        </div>;
      })}
    </div>
  </>;
};

// ------------------------------------------------------------------ 02 copy-paste auth
const ROUTE_CODE = [
  "app.get('/orders', (req, res) => {",
  "  if (!verify(req.headers.token)) return res.status(401)",
  "  // ...orders logic",
  "})",
  "app.get('/cart', (req, res) => {",
  "  if (!verify(req.headers.token)) return res.status(401)",
  "  // ...cart logic",
  "})",
  "app.get('/profile', (req, res) => {",
  "  if (!verify(req.headers.token)) return res.status(401)",
];
const S2: React.FC = () => {
  const s = T.impl - 0.4;
  const at = ROUTE_CODE.map((_, i) => s + i * 0.32);
  return <>
    <Heading t0={13.6} n="02" title="Copy-paste" accent="auth" color={RED} />
    <div style={{position: 'absolute', left: 20, top: 120}}>
      <Editor file="routes.ts" lines={ROUTE_CODE} at={at} w={960} size={23} cps={70}
        hi={[1, 5, 9].map(l => ({line: l, t0: T.dry - 0.3, t1: 99, color: RED}))} />
    </div>
    <Appear t0={T.dontrepeat - 0.3} from="scale" style={{left: 36, top: 760}}><Tag color={RED} size={30} solid>&#10005; DRY: don't repeat yourself</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 03 one change, fifty edits
const S3: React.FC = () => {
  const t = useT();
  const k = ease(t, T.change - 0.2, 1.6); const n = Math.round(k * 50);
  return <>
    <Heading t0={21.5} n="03" title="Logic changes?" color={RED} />
    <Appear t0={T.core - 0.2} style={{left: 36, top: 140}}><Tag size={28} color={AMBER}>verify() &rarr; verifyJWT()</Tag></Appear>
    <div style={{position: 'absolute', left: 36, top: 230, display: 'grid', gridTemplateColumns: 'repeat(10, 84px)', gap: 10}}>
      {Array.from({length: 50}).map((_, i) => <div key={i} style={{width: 84, height: 66, borderRadius: 10, border: `2px solid ${i < n ? RED : LINE}`, background: i < n ? '#FDE2DC' : CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CODE, fontSize: 16, color: i < n ? RED : SUB}}>{i < n ? 'edit' : '.ts'}</div>)}
    </div>
    <Appear t0={T.change - 0.2} style={{left: 36, top: 660}}><Big size={64} color={RED}>{n} / 50 <span style={{fontSize: 34, color: INK}}>files to edit</span></Big></Appear>
  </>;
};

// ------------------------------------------------------------------ 04 the layer
const S4: React.FC = () => {
  const t = useT();
  const k = ((t - 29) / 2.2) % 1; const y = lerp(190, 980, k);
  return <>
    <Heading t0={28.5} n="04" title="Middleware" accent="the middleman" />
    <Appear t0={28.6} style={{left: 0, right: 0, top: 160, textAlign: 'center'}}><Req path="/orders" /></Appear>
    <Appear t0={29.4} style={{left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center'}}><VArrow h={80} /></Appear>
    <Appear t0={T.layer - 0.6} from="scale" style={{left: 60, top: 400, width: 880}}>
      <div style={{height: 190, borderRadius: 26, border: `4px dashed ${CORAL}`, background: '#FFE9E2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 46, color: CORAL}}>middleware</span>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: INK}}>layer</span>
      </div>
    </Appear>
    <Appear t0={T.layer - 0.2} style={{left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center'}}><VArrow h={80} /></Appear>
    <Appear t0={T.layer} style={{left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center'}}><Gate label="route handler" sub="your controller" state="idle" w={420} /></Appear>
    <Appear t0={T.layer + 0.3} style={{left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center'}}><VArrow h={80} /></Appear>
    <Appear t0={T.layer + 0.5} style={{left: 0, right: 0, top: 1010, textAlign: 'center'}}><Req method="200" path="response" color={GREEN} /></Appear>
    {t > 29 && t < 35 && <div style={{position: 'absolute', left: 140, top: y, width: 26, height: 26, borderRadius: 13, background: CORAL, boxShadow: `0 0 0 8px ${CORAL}33`}} />}
    <Appear t0={T.middleman - 0.3} from="right" style={{left: 640, top: 1150}}><Tag size={26} color={CORAL}>sits in between</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 05 express app.use
const EXPRESS = [
  "const app = express()",
  "",
  "app.use((req, res, next) => {",
  "  console.log(req.method, req.url)   // inspect",
  "  req.requestTime = Date.now()       // modify",
  "  next()",
  "})",
  "",
  "app.get('/orders', getOrders)",
];
const S5: React.FC = () => {
  const s = T.express - 0.2;
  const at = [s, s + 0.4, s + 0.8, s + 1.4, s + 2.2, s + 3.0, s + 3.3, s + 3.5, s + 3.7];
  return <>
    <Heading t0={35.0} n="05" title="In" accent="Express" color={TEAL} />
    <div style={{position: 'absolute', left: 20, top: 150}}>
      <Editor file="app.ts" lines={EXPRESS} at={at} w={960} size={27} cps={60}
        hi={[{line: 3, t0: T.inspect - 0.2, t1: T.modify - 0.2, color: BLUE}, {line: 4, t0: T.modify - 0.2, t1: 99, color: CORAL}]} />
    </div>
    <Appear t0={T.inspect - 0.2} style={{left: 40, top: 760}}><Tag size={30} color={BLUE}>inspect the request</Tag></Appear>
    <Appear t0={T.modify - 0.2} style={{left: 440, top: 760}}><Tag size={30} color={CORAL}>modify it</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 06 req, res, next
const SIG = [
  "function middleware(req, res, next) {",
  "  if (allGood(req)) {",
  "    return next()          // pass it on",
  "  }",
  "  return res.status(403).json({ error: 'rejected' })",
  "}",
];
const S6: React.FC = () => {
  const s = T.generally - 0.3;
  return <>
    <Heading t0={40.2} n="06" title="req, res," accent="next" color={TEAL} />
    <Appear t0={T.generally} style={{left: 36, top: 130}}><div style={{display: 'flex', gap: 16}}>
      <Tag size={30} color={TEAL}>req</Tag><Tag size={30} color={TEAL}>res</Tag><Tag size={30} color={TEAL} solid>next</Tag>
    </div></Appear>
    <div style={{position: 'absolute', left: 20, top: 230}}>
      <Editor file="middleware.ts" lines={SIG} at={SIG.map((_, i) => s + 0.2 + i * 0.35)} w={960} size={26} cps={60}
        hi={[{line: 2, t0: T.next2 - 0.2, t1: T.reject - 0.3, color: GREEN}, {line: 4, t0: T.reject - 0.3, t1: 99, color: RED}]} />
    </div>
    <Appear t0={T.next2 - 0.2} style={{left: 40, top: 720}}><Tag size={28} color={GREEN} solid>&#10003; all good &rarr; next()</Tag></Appear>
    <Appear t0={T.reject - 0.2} style={{left: 480, top: 720}}><Tag size={28} color={RED} solid>&#10005; reject &rarr; stop here</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 07 auth middleware flow + code
const AUTH = [
  "function auth(req, res, next) {",
  "  const token = req.headers.authorization",
  "  if (isValid(token)) return next()",
  "  return res.status(401).json({ error: 'Unauthorized' })",
  "}",
  "",
  "app.use('/api', auth)",
];
const S7: React.FC = () => {
  const t = useT();
  const valid = t > T.next3 - 0.4 && t < T.invalid - 0.3; const bad = t > T.invalid - 0.3;
  const step = t > T.resp - 0.3 ? 3 : t > T.controller - 0.3 ? 2 : t > T.authmw - 0.3 ? 1 : t > T.pehle - 0.3 ? 0 : -1;
  return <>
    <Heading t0={52.6} n="07" title="Auth" accent="middleware" />
    <div style={{position: 'absolute', left: 36, top: 140, display: 'flex', alignItems: 'center', gap: 10}}>
      <Appear t0={T.pehle - 0.3} style={{position: 'relative'}}><Req path="/api/orders" status={bad ? '401' : valid ? '200' : undefined} statusColor={bad ? RED : GREEN} /></Appear>
    </div>
    <div style={{position: 'absolute', left: 36, top: 260, display: 'flex', alignItems: 'center', gap: 12}}>
      <Appear t0={T.authmw - 0.3} style={{position: 'relative'}}><Gate label="auth()" sub={bad ? 'invalid token' : t > T.tokencheck - 0.2 ? 'checks the token' : 'middleware'} state={bad ? 'block' : valid ? 'pass' : step === 1 ? 'active' : 'idle'} w={330} /></Appear>
      <Appear t0={T.controller - 0.3} style={{position: 'relative'}}><span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: bad ? '#C9C2A9' : INK}}>&rarr;</span></Appear>
      <Appear t0={T.controller - 0.3} style={{position: 'relative'}}><Gate label="controller" sub="getOrders" state={bad ? 'idle' : valid ? 'pass' : step === 2 ? 'active' : 'idle'} w={290} /></Appear>
      <Appear t0={T.resp - 0.3} style={{position: 'relative'}}><span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: INK}}>&rarr;</span></Appear>
      <Appear t0={T.resp - 0.3} style={{position: 'relative'}}><Gate label="res" state={bad ? 'block' : step >= 3 ? 'pass' : 'idle'} w={140} /></Appear>
    </div>
    <div style={{position: 'absolute', left: 20, top: 450}}>
      <Editor file="auth.ts" lines={AUTH} at={AUTH.map((_, i) => T.tokencheck - 0.4 + i * 0.45)} w={960} size={25} cps={70}
        hi={[{line: 1, t0: T.tokencheck - 0.2, t1: T.valid - 0.2, color: BLUE}, {line: 2, t0: T.valid - 0.2, t1: T.invalid - 0.3, color: GREEN}, {line: 3, t0: T.invalid - 0.3, t1: 99, color: RED}]} />
    </div>
    <Appear t0={T.e401 - 0.2} from="scale" style={{left: 36, top: 1000}}><Tag size={34} color={RED} solid>401 Unauthorized</Tag></Appear>
    <Appear t0={T.e401 + 0.6} style={{left: 440, top: 1010}}><Big size={30} color={SUB}>controller never runs</Big></Appear>
  </>;
};

// ------------------------------------------------------------------ 08 use cases
const USE = ["app.use(logger)", "app.use(cors())", "app.use(rateLimit({ max: 100 }))", "app.use(validate(schema))", "app.use('/api', auth)"];
const S8: React.FC = () => {
  const at = [T.logging - 0.3, T.cors - 0.3, T.rate - 0.3, T.validation - 0.3, T.sab - 0.3];
  const labels: [string, string][] = [['logging', BLUE], ['CORS', TEAL], ['rate limit', AMBER], ['validation', GREEN], ['auth', CORAL]];
  return <>
    <Heading t0={75.0} n="08" title="Not just" accent="auth" />
    <div style={{position: 'absolute', left: 20, top: 130}}>
      <Editor file="app.ts" lines={USE} at={at} w={960} size={30} cps={60} />
    </div>
    <div style={{position: 'absolute', left: 36, top: 560, display: 'flex', flexWrap: 'wrap', gap: 14, width: 920}}>
      {labels.map(([l, c], i) => <Appear key={l} t0={at[i]} from="scale" style={{position: 'relative'}}><Tag size={30} color={c} solid>{l}</Tag></Appear>)}
    </div>
  </>;
};

// ------------------------------------------------------------------ 09 token refresh
const S9: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={84.1} n="09" title="Token" accent="refresh" color={AMBER} />
    <Appear t0={T.access - 0.3} style={{left: 36, top: 150}}><Req path="/api/orders" status="expired" statusColor={AMBER} /></Appear>
    <Appear t0={T.access} style={{left: 60, top: 260}}><VArrow h={70} /></Appear>
    <Appear t0={T.refresh2 - 1.4} style={{left: 36, top: 350}}><Gate label="refresh()" sub="uses the refresh token" state={t > T.refresh2 ? 'pass' : 'active'} w={480} /></Appear>
    <Appear t0={T.refresh2 - 0.2} style={{left: 60, top: 470}}><VArrow h={70} /></Appear>
    <Appear t0={T.refresh2} style={{left: 36, top: 560}}><Req path="new access token" color={GREEN} status="next()" statusColor={TEAL} /></Appear>
    <Appear t0={T.optimal - 0.3} from="scale" style={{left: 560, top: 720}}><Tag size={26} color={AMBER}>not optimal, but works</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 10 the pipeline
const S10: React.FC = () => {
  const t = useT();
  const k = ((t - 95) / 2.6) % 1; const y = lerp(260, 1080, k);
  return <>
    <Heading t0={94.5} n="10" title="Request" accent="pipeline" />
    <Appear t0={94.6} style={{left: 0, right: 0, top: 150, textAlign: 'center'}}><Req path="/api/orders" /></Appear>
    {[['inspect', BLUE, T.inspect2], ['modify', CORAL, T.modify2], ['stop', RED, T.stop2]].map(([l, c, t0], i) => (
      <Appear key={l as string} t0={(t0 as number) - 0.3} from="left" style={{left: 140, top: 330 + i * 190}}>
        <div style={{width: 720, height: 150, borderRadius: 24, border: `4px solid ${c}`, background: CARD, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px'}}>
          <span style={{fontFamily: CODE, fontWeight: 600, fontSize: 28, color: c as string}}>app.use()</span>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: INK}}>{l as string}</span>
        </div>
      </Appear>))}
    <Appear t0={T.final - 0.3} from="scale" style={{left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center'}}><Gate label="final handler" sub="your route" state="pass" w={480} /></Appear>
    {t > 95 && <div style={{position: 'absolute', left: 80, top: y, width: 26, height: 26, borderRadius: 13, background: CORAL, boxShadow: `0 0 0 8px ${CORAL}33`}} />}
  </>;
};

export const scenes: Scene[] = [
  {a: 7.6, b: 13.5, el: S1}, {a: 13.5, b: 21.4, el: S2}, {a: 21.4, b: 27.2, el: S3}, {a: 28.4, b: 35.0, el: S4}, {a: 35.0, b: 40.2, el: S5},
  {a: 40.2, b: 52.5, el: S6}, {a: 52.5, b: 72.0, el: S7}, {a: 75.0, b: 84.0, el: S8}, {a: 84.0, b: 94.4, el: S9}, {a: 94.4, b: 101.3, el: S10}];

export const cfg: Config = {
  title: 'What is middleware?',
  file: 'middleware.ts',
  modes: [
    {a: 0, b: 7.6, m: 'talk'}, {a: 7.6, b: 27.2, m: 'split'}, {a: 27.2, b: 28.4, m: 'talk'}, {a: 28.4, b: 40.2, m: 'full'},
    {a: 40.2, b: 52.5, m: 'split'}, {a: 52.5, b: 72.0, m: 'full'}, {a: 72.0, b: 75.0, m: 'talk'}, {a: 75.0, b: 94.4, m: 'split'},
    {a: 94.4, b: 101.3, m: 'full'}, {a: 101.3, b: 999, m: 'talk'}],
  marquee: ['MIDDLEWARE', 'req → res', 'next()'],
  chips: ['app.use()', 'next()', 'req.headers', 'res.status(401)', '(req, res, next)', 'express()', 'Bearer <token>', 'rateLimit()', 'cors()', 'logger'],
  stickers: [
    {t0: 0.3, t1: 2.6, text: 'middleware?', x: 70, y: 300, color: CORAL, rot: -6},
    {t0: 1.3, t1: 2.6, text: 'why?', x: 760, y: 420, color: BLUE, rot: 5},
    {t0: 3.0, t1: 7.4, text: 'BUILDING BACKEND SYSTEMS', x: 120, y: 300, color: INK, rot: -3},
    {t0: 27.3, t1: 28.4, text: 'middleware!', x: 330, y: 300, color: CORAL, rot: -4},
    {t0: 72.1, t1: 75.0, text: '1 place, not 50', x: 260, y: 300, color: GREEN, rot: -4},
    {t0: 101.4, t1: 999, text: 'your request pipeline', x: 170, y: 300, color: CORAL, rot: -3},
  ],
};
