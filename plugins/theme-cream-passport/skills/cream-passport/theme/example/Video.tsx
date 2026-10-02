// EXAMPLE: "Authentication vs Authorization" (108.9 s). Copy to src/Video.tsx and replace the scenes.
// Scenes are full-frame layers drawn in the paper zone (y 60..800) while the speaker is in desk mode.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, spring} from 'remotion';
import {Scene, FPS, clamp, ease, win, useT} from './core';
import {Config, Appear, Chip, Stamp, Typed, FacePhoto, Header, UserIcon, Server, Door, TitleCard, pop, PAPER, PAPER2, INK, NAVY, RED, MUSTARD, OK, SOFT, SERIF, MONO, SANS, SHADOW} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const DUR = (data as any).duration as number;

const VsHalf: React.FC<{side: 'L' | 'R'; t0: number}> = ({side, t0}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const p = spring({frame: f - Math.round(t0 * FPS), fps: FPS, config: {damping: 14, stiffness: 190, mass: 0.8}});
  const L = side === 'L'; const c = L ? NAVY : RED;
  const tag = t > T.difference - 0.2;
  const tp = pop(f, T.difference - 0.2);
  return <div style={{width: 500, height: 250, background: L ? NAVY : RED, color: PAPER, position: 'relative', transform: `translateX(${(1 - p) * (L ? -620 : 620)}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{position: 'absolute', inset: 10, border: `2px dashed rgba(243,235,221,.55)`}} />
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '.18em', height: 40, opacity: tag ? clamp(tp * 1.4) : 0, transform: `translateY(${(1 - tp) * -14}px)`}}>{L ? 'AUTHN' : 'AUTHZ'}</div>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 104, lineHeight: 1}}>{L ? '401' : '403'}</div>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, marginTop: 6, color: L ? '#cfe0f5' : '#ffd9de'}}>{L ? 'who are you?' : 'not allowed'}</div>
  </div>;
};

const Hook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; if (t > 12.7) return null;
  const out = clamp((12.6 - t) / 0.3);
  const t0 = T.confusing - 0.25;
  const lock = t > t0 + 0.35 ? Math.sin((t - t0 - 0.35) * 70) * 8 * clamp(1 - (t - t0 - 0.35) / 0.35) : 0;
  const seal = pop(f, t0 + 0.35);
  const ep = pop(f, T.episode - 0.2);
  const words: [string, number, string][] = [['Authentication', T.authn0, NAVY], ['vs', T.vs0, RED], ['Authorization', T.authz0, NAVY]];
  return <AbsoluteFill style={{opacity: out}}>
    <div style={{position: 'absolute', left: 30, right: 30, top: 50, background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW, padding: '16px 10px 18px', textAlign: 'center'}}>
      <div style={{fontFamily: SERIF, fontSize: 60, whiteSpace: 'nowrap', lineHeight: 1}}>
        {words.map(([w, w0, c], i) => { const p = pop(f, w0 - 0.1); return <span key={i} style={{display: 'inline-block', color: c, opacity: clamp(p * 1.5), transform: `translateY(${(1 - p) * 30}px)`, margin: '0 10px'}}>{w}</span>; })}
      </div>
      <div style={{overflow: 'hidden', height: t > T.episode - 0.2 ? 44 * clamp(ep) : 0}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: SOFT, letterSpacing: '.14em', marginTop: 12}}>BUILDING BACKEND SYSTEMS &middot; EP 11</div>
      </div>
    </div>
    {t > t0 - 0.05 && <div style={{position: 'absolute', left: 40, top: 1160, width: 1000, height: 250, transform: `translateX(${lock}px)`, boxShadow: SHADOW}}>
      <div style={{display: 'flex'}}><VsHalf side="L" t0={t0} /><VsHalf side="R" t0={t0 + 0.08} /></div>
      <div style={{position: 'absolute', left: 500 - 52, top: 125 - 52, width: 104, height: 104, borderRadius: 52, background: PAPER, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 52, color: INK, transform: `scale(${seal})`}}>vs</div>
    </div>}
  </AbsoluteFill>;
};

const SceneRequest: React.FC = () => {
  const t = useT(); const a = 12.6, b = 19.6; if (t < a - 0.1 || t > b + 0.4) return null;
  const p = ease(t, T.request1 - 0.2, 1.1);
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="SCENARIO" title="An app with login" />
    <Appear t0={T.application - 0.2} t1={b} style={{left: 50, top: 300}}><UserIcon label={t > T.login1 ? 'logged in' : 'user'} /></Appear>
    <Appear t0={T.application} t1={b} style={{right: 50, top: 270}}><Server /></Appear>
    {t > T.request1 - 0.2 && <div style={{position: 'absolute', top: 350, left: 250 + p * 360, opacity: win(t, T.request1 - 0.2, b)}}><Chip size={26} color={RED}>REQUEST &rarr;</Chip></div>}
    <Appear t0={T.questions - 0.1} t1={b} from="scale" style={{right: 280, top: 160}}><span style={{fontFamily: SERIF, fontSize: 120, color: RED}}>?</span></Appear>
    <Appear t0={T.questions + 0.25} t1={b} from="scale" style={{right: 60, top: 140}}><span style={{fontFamily: SERIF, fontSize: 120, color: RED}}>?</span></Appear>
    <Appear t0={T.questions} t1={b} style={{left: 0, right: 0, top: 640, textAlign: 'center'}}><Chip size={30}>2 important questions</Chip></Appear>
  </AbsoluteFill>;
};

const Pass: React.FC<{n: string; q: string; color?: string}> = ({n, q, color = NAVY}) => (
  <div style={{width: 980, height: 190, display: 'flex', background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW}}>
    <div style={{width: 160, background: color, color: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 90}}>{n}</div>
    <div style={{flex: 1, padding: '22px 30px', borderLeft: `4px dashed ${INK}`}}>
      <div style={{fontFamily: MONO, fontSize: 22, color: SOFT, letterSpacing: '.12em'}}>QUESTION</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: INK, lineHeight: 1.15}}>{q}</div>
    </div>
  </div>
);
const SceneQuestions: React.FC = () => {
  const t = useT(); const a = 19.6, b = 26.9; if (t < a - 0.1 || t > b + 0.4) return null;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="EVERY REQUEST ASKS" title="Two questions" />
    <Appear t0={T.first - 0.1} t1={b} from="left" style={{left: 50, top: 250}}><Pass n="1" q="Yeh user hai kaun?" /></Appear>
    <Appear t0={T.permission1 - 0.9} t1={b} from="right" style={{left: 50, top: 490}}><Pass n="2" q="Kya isko permission hai?" color={RED} /></Appear>
    <Stamp t0={T.authn_def - 0.1} t1={b} style={{right: 60, top: 360}} size={34} color={NAVY}>= AUTHENTICATION</Stamp>
  </AbsoluteFill>;
};

const SceneAuthN: React.FC = () => {
  const t = useT(); const a = 26.9, b = 39.7; if (t < a - 0.1 || t > b + 0.4) return null;
  const scan = t > T.identity - 0.1 && t < T.identity + 1.3 ? clamp((t - T.identity + 0.1) / 1.4) : -1;
  const ok = t > T.successful1;
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="AUTHENTICATION" title="Who are you?" />
    <Appear t0={a + 0.3} t1={b} from="left" style={{left: 40, top: 230}}>
      <div style={{width: 400, height: 560, background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW, position: 'relative'}}>
        <div style={{height: 56, background: NAVY, color: PAPER, fontFamily: MONO, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', paddingLeft: 18, letterSpacing: '.1em'}}>ID &middot; USER PASS</div>
        <div style={{margin: '20px auto 0', width: 260, height: 300, border: `3px solid ${INK}`, position: 'relative'}}>
          <FacePhoto w={254} h={294} />
          {scan >= 0 && <div style={{position: 'absolute', left: 0, right: 0, top: scan * 290, height: 6, background: '#3DDC84', boxShadow: '0 0 18px 6px rgba(61,220,132,.7)'}} />}
        </div>
        <div style={{fontFamily: MONO, fontSize: 24, color: INK, padding: '16px 22px', lineHeight: 1.5}}>
          <div>name: {t > T.saurav1 - 0.1 ? 'Saurav' : '????'}</div>
          <div>token: {t > T.token1 ? <span style={{color: OK}}>eyJhbGci...</span> : '----'}</div>
        </div>
      </div>
    </Appear>
    {scan >= 0 && <div style={{position: 'absolute', left: 80, top: 800, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: OK}}>VERIFYING IDENTITY...</div>}
    <Appear t0={T.example - 0.2} t1={b} from="right" style={{left: 480, top: 230}}>
      <div style={{width: 560, background: '#fff', border: `4px solid ${INK}`, boxShadow: SHADOW, padding: 26, fontFamily: MONO, fontSize: 28}}>
        <div style={{fontFamily: SERIF, fontSize: 46, color: NAVY, marginBottom: 12}}>Login</div>
        <div style={{color: SOFT, fontSize: 20}}>EMAIL</div>
        <div style={{border: `3px solid ${INK}`, padding: '10px 14px', margin: '6px 0 16px', height: 60}}><Typed t0={T.email - 0.1} text="saurav@mail.com" /></div>
        <div style={{color: SOFT, fontSize: 20}}>PASSWORD</div>
        <div style={{border: `3px solid ${INK}`, padding: '10px 14px', margin: '6px 0 18px', height: 60}}><Typed t0={T.password - 0.1} text={'•'.repeat(10)} cps={20} /></div>
        <div style={{background: ok ? OK : t > T.login2 - 0.05 && t < T.login2 + 0.25 ? RED : NAVY, color: PAPER, textAlign: 'center', padding: '14px 0', fontWeight: 700, transform: t > T.login2 && t < T.login2 + 0.2 ? 'scale(.96)' : undefined}}>
          {t < T.credential - 0.1 ? 'LOGIN' : !ok ? 'verifying...' : 'SUCCESS ✓'}
        </div>
      </div>
    </Appear>
    <Appear t0={T.token1 - 0.3} t1={b} style={{left: 500, top: 690}}><Chip size={26} color={OK}>session / token issued</Chip></Appear>
    <Stamp t0={T.saurav1 - 0.1} t1={b} style={{left: 70, top: 500}} size={38} color={OK}>VERIFIED &middot; SAURAV</Stamp>
  </AbsoluteFill>;
};

const SceneAdmin: React.FC = () => {
  const t = useT(); const a = 41.4, b = 52.5; if (t < a - 0.1 || t > b + 0.4) return null;
  const mv = ease(t, T.hit - 0.3, 0.6);
  return <AbsoluteFill>
    {t < T.authz1 - 0.1 ? <Header t0={a} t1={T.authz1 - 0.1} kicker="NEXT QUESTION" title="Is Saurav an admin?" /> : <Header t0={T.authz1 - 0.1} t1={b} kicker="AUTHORIZATION" title="What can you do?" color={RED} />}
    <Appear t0={T.admin1 - 0.2} t1={b} style={{left: 70 + mv * 330, top: 300}}>
      <div style={{width: 240, background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW}}>
        <div style={{height: 40, background: NAVY}} />
        <div style={{padding: 14, fontFamily: MONO, fontSize: 24, lineHeight: 1.5}}><div>Saurav</div><div style={{color: OK}}>authN &#10003;</div><div>role: {t > T.admin3 - 0.1 ? <b style={{color: RED}}>admin?</b> : '...'}</div></div>
      </div>
    </Appear>
    <Appear t0={T.admin2 - 0.3} t1={b} style={{right: 50, top: 230}}><Door label="/admin" state={t > T.verify2 - 0.1 ? 'check' : 'idle'} /></Appear>
    <Appear t0={T.verify2} t1={b} style={{left: 60, top: 680}}><Chip size={26} color={MUSTARD}>checking role...</Chip></Appear>
  </AbsoluteFill>;
};

const Cell: React.FC<{v: 'ok' | 'no'; t0: number}> = ({v, t0}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0) return <div style={{flex: 1}} />;
  const p = pop(f, t0);
  return <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * p})`}}>
    <span style={{fontFamily: MONO, fontWeight: 700, fontSize: v === 'ok' ? 56 : 34, color: v === 'ok' ? OK : RED, border: v === 'no' ? `4px double ${RED}` : 'none', padding: v === 'no' ? '2px 10px' : 0}}>{v === 'ok' ? '✓' : '✕ 403'}</span>
  </div>;
};
const ScenePerms: React.FC = () => {
  const t = useT(); const a = 52.5, b = 64.6; if (t < a - 0.1 || t > b + 0.4) return null;
  const colHi = t > T.admin4 - 0.2 ? 2 : t > T.normal - 0.2 ? 1 : 0;
  const row = (label: string, u: React.ReactNode, ad: React.ReactNode, hi: boolean) => (
    <div style={{display: 'flex', height: 120, borderTop: `3px solid ${INK}`, background: hi ? 'rgba(233,162,59,.22)' : undefined}}>
      <div style={{width: 400, display: 'flex', alignItems: 'center', paddingLeft: 24, fontFamily: MONO, fontWeight: 700, fontSize: 32, color: INK}}>{label}</div>{u}{ad}
    </div>);
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="AUTHORIZATION" title="Roles x permissions" color={RED} />
    <Appear t0={a + 0.2} t1={b} style={{left: 50, top: 260}}>
      <div style={{width: 980, background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW}}>
        <div style={{display: 'flex', height: 90}}>
          <div style={{width: 400, display: 'flex', alignItems: 'center', paddingLeft: 24, fontFamily: MONO, fontSize: 24, color: SOFT}}>ENDPOINT</div>
          {['user', 'admin'].map((r, i) => <div key={r} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 48, color: colHi === i + 1 ? PAPER : NAVY, background: colHi === i + 1 ? NAVY : undefined}}>{r}</div>)}
        </div>
        {row('GET /profile', <Cell v="ok" t0={T.allowed1 - 0.1} />, <Cell v="ok" t0={T.permission2 - 0.2} />, t > T.getprofile - 0.2 && t < T.deleteuser - 0.2)}
        {row('DELETE /user', <Cell v="no" t0={T.nahi2 - 0.3} />, <Cell v="ok" t0={T.permission2} />, t > T.deleteuser - 0.2 && t < T.admin4 - 0.2)}
      </div>
    </Appear>
  </AbsoluteFill>;
};

const SceneSummary: React.FC = () => {
  const t = useT(); const a = 66.4, b = 70.0; if (t < a - 0.1 || t > b + 0.4) return null;
  const card = (k: string, q: string, c: string) => <div style={{width: 980, background: PAPER, border: `4px solid ${INK}`, boxShadow: SHADOW, padding: '20px 30px'}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: c, letterSpacing: '.1em'}}>{k}</div>
    <div style={{fontFamily: SERIF, fontSize: 74, color: INK, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{q}</div></div>;
  return <AbsoluteFill>
    <Appear t0={T.authn2 - 0.2} t1={b} from="left" style={{left: 50, top: 150}}>{card('AUTHENTICATION', 'tum ho kaun?', NAVY)}</Appear>
    <Appear t0={T.authz2 - 0.1} t1={b} from="right" style={{left: 50, top: 440}}>{card('AUTHORIZATION', 'tum kya kar sakte ho?', RED)}</Appear>
  </AbsoluteFill>;
};

const SceneFlow: React.FC = () => {
  const t = useT(); const a = 72.6, b = 94.7; if (t < a - 0.1 || t > b + 0.4) return null;
  const L = 170, R = 910;
  const steps: {t0: number; dir: 1 | -1; label: string; color?: string; note?: string}[] = [
    {t0: T.login3 - 0.2, dir: 1, label: 'POST /login'},
    {t0: T.token_issue - 0.2, dir: -1, label: 'token', color: OK},
    {t0: T.protected - 0.3, dir: 1, label: 'GET /admin + token'},
    {t0: T.role - 0.2, dir: -1, label: 'role check', color: MUSTARD},
  ];
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="REAL BACKEND" title="Request lifecycle" />
    <Appear t0={a + 0.3} t1={b} style={{left: L - 80, top: 210}}><Chip size={26}>CLIENT</Chip></Appear>
    <Appear t0={a + 0.4} t1={b} style={{left: R - 90, top: 210}}><Chip size={26}>SERVER</Chip></Appear>
    <div style={{position: 'absolute', left: L - 2, top: 275, width: 4, height: 500, background: INK, opacity: win(t, a + 0.3, b)}} />
    <div style={{position: 'absolute', left: R - 2, top: 275, width: 4, height: 500, background: INK, opacity: win(t, a + 0.4, b)}} />
    {steps.map((s, i) => {
      if (t < s.t0) return null;
      const p = ease(t, s.t0, 0.7); const y = 300 + i * 100; const c = s.color || NAVY; const x0 = s.dir === 1 ? L : R; const len = (R - L) * p;
      const head: React.CSSProperties = s.dir === 1 ? {borderLeft: `18px solid ${c}`} : {borderRight: `18px solid ${c}`};
      return <div key={i} style={{opacity: win(t, s.t0, b)}}>
        <div style={{position: 'absolute', top: y + 40, left: s.dir === 1 ? x0 : x0 - len, width: len, height: 5, background: c}} />
        <div style={{position: 'absolute', top: y + 28, left: s.dir === 1 ? x0 + len - 14 : x0 - len - 2, width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', ...head}} />
        <div style={{position: 'absolute', top: y - 10, left: L + 30, width: R - L - 60, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: c}}>{s.label}</div>
      </div>;
    })}
    <Appear t0={T.successful2 - 0.2} t1={b} style={{left: R - 150, top: 345}}><Chip size={20} color={OK}>authN &#10003;</Chip></Appear>
    <Appear t0={T.token_verify - 0.2} t1={T.valid} style={{left: 0, right: 0, top: 690, textAlign: 'center'}}><Chip size={28} color={MUSTARD}>verify token...</Chip></Appear>
    <Appear t0={T.valid - 0.1} t1={T.role - 0.3} style={{left: 0, right: 0, top: 690, textAlign: 'center'}}><Chip size={28} color={OK}>valid token &rarr; authN &#10003;</Chip></Appear>
    <Appear t0={T.required - 0.2} t1={T.cont - 0.4} style={{left: 0, right: 0, top: 690, textAlign: 'center'}}><Chip size={28} color={MUSTARD}>required permission?</Chip></Appear>
    <Appear t0={T.cont - 0.3} t1={b} style={{left: 90, top: 690}}><Chip size={30} color={OK}>&#10003; continue</Chip></Appear>
    <Appear t0={T.reject - 0.3} t1={b} style={{right: 90, top: 690}}><Chip size={30} color={RED}>&#10005; 403 reject</Chip></Appear>
  </AbsoluteFill>;
};

const SceneGateway: React.FC = () => {
  const t = useT(); const a = 94.7, b = 101.9; if (t < a - 0.1 || t > b + 0.4) return null;
  const blocked = t > T.before - 0.3;
  const p1 = ease(t, T.checks - 0.6, 1.0);
  return <AbsoluteFill>
    <Header t0={a} t1={b} kicker="BONUS" title="Check at the gateway" />
    <Appear t0={a + 0.3} t1={b} style={{left: 30, top: 290}}><UserIcon label="client" /></Appear>
    <Appear t0={T.gateway - 0.3} t1={b} style={{left: 360, top: 260}}>
      <div style={{width: 320, height: 240, border: `6px solid ${NAVY}`, background: PAPER2, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 48, color: NAVY}}>API Gateway
        <div style={{fontFamily: MONO, fontSize: 22, color: OK, marginTop: 8, opacity: t > T.checks - 0.3 ? 1 : 0}}>authN check &#10003;</div></div>
    </Appear>
    <Appear t0={T.gateway} t1={b} style={{right: 30, top: 260}}><Server label="SERVER" w={200} /></Appear>
    {t > T.checks - 0.6 && <div style={{position: 'absolute', left: 200 + p1 * (blocked ? 150 : 520), top: 560, opacity: win(t, T.checks - 0.6, b)}}><Chip size={22} color={RED}>no token</Chip></div>}
    <Stamp t0={T.before - 0.2} t1={b} style={{left: 370, top: 640}} size={40}>401 BLOCKED</Stamp>
  </AbsoluteFill>;
};

const Ending: React.FC = () => {
  const t = useT(); if (t < 101.9) return null;
  return <AbsoluteFill>
    <Appear t0={T.prove - 0.4} style={{left: 0, right: 0, top: 0}}><TitleCard words={[['Authentication', T.authn0, NAVY], ['vs', T.vs0, RED], ['Authorization', T.authz0, NAVY]]} /></Appear>
    <Appear t0={T.identity2 - 0.3} style={{left: 0, right: 0, top: 960, textAlign: 'center'}}><Chip size={36}>AuthN &rarr; proves identity</Chip></Appear>
    <Appear t0={T.decide - 0.3} style={{left: 0, right: 0, top: 1060, textAlign: 'center'}}><Chip size={36} color={RED}>AuthZ &rarr; decides permission</Chip></Appear>
  </AbsoluteFill>;
};

const Bridges: React.FC = () => (<>
  <Appear t0={T.question3 - 0.1} t1={41.3} style={{left: 0, right: 0, top: 980, textAlign: 'center'}}><Chip size={36} color={RED}>one more question...</Chip></Appear>
  <Appear t0={64.7} t1={66.3} style={{left: 0, right: 0, top: 980, textAlign: 'center'}}><Chip size={36}>simple version</Chip></Appear>
  <Appear t0={70.2} t1={72.5} style={{left: 0, right: 0, top: 980, textAlign: 'center'}}><Chip size={36}>in a real backend?</Chip></Appear>
</>);

export const scenes: Scene[] = [
  {a: 12.6, b: 19.6, el: SceneRequest}, {a: 19.6, b: 26.9, el: SceneQuestions}, {a: 26.9, b: 39.7, el: SceneAuthN}, {a: 41.4, b: 52.5, el: SceneAdmin},
  {a: 52.5, b: 64.6, el: ScenePerms}, {a: 66.4, b: 70.0, el: SceneSummary}, {a: 72.6, b: 94.7, el: SceneFlow}, {a: 94.7, b: 101.9, el: SceneGateway}];

export const cfg: Config = {
  desk: [[12.4, 39.7], [41.4, 64.6], [66.4, 70.0], [72.6, 101.9]],
  punches: [[T.question3 - 0.2, 41.4, 0.14], [64.6, 66.4, 0.1], [70.0, 72.6, 0.12], [T.prove - 0.2, DUR, 0.08]],
  overlays: [Hook, Bridges, Ending],
};
