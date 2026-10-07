// EXAMPLE: Shortlist product promo (57 s), talking head + 4 screen recordings. Copy to src/Video.tsx and replace.
// Card scenes are 1000 x 900 under the browser bar. Demo clips are 2560 x 1440 screen recordings.
import React from 'react';
import {Scene, clamp, ease, useT} from './core';
import {Config, Appear, Pill, Serif, ResumeDoc, JD, Demo, INK, SUB, WHITE, RED, GREEN, SANS, SERIF, CARD_W} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const TEAL = '#006755';

/** step label floating on top of a demo */
const Step: React.FC<{n: string; text: string; t0: number}> = ({n, text, t0}) => (
  <Appear t0={t0} from="down" style={{left: 24, top: 20}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, background: INK, color: WHITE, borderRadius: 999, padding: '10px 22px 10px 10px', boxShadow: '0 10px 24px rgba(0,0,0,.25)'}}>
      <span style={{width: 40, height: 40, borderRadius: 20, background: TEAL, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 22}}>{n}</span>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, whiteSpace: 'nowrap'}}>{text}</span>
    </div>
  </Appear>
);

// ------------------------------------------------------------------ problem 1: one old resume for every job
const ROLES: [string, string, string][] = [['Backend Engineer', 'Razorpay', '#3B6FD8'], ['Data Analyst', 'Flipkart', '#D2862A'], ['Frontend Dev', 'Swiggy', '#C2456A'], ['SDE Intern', 'Zepto', '#6B8E23']];
const P1: React.FC = () => {
  const t = useT();
  return <>
    <Appear t0={3.8} style={{left: 40, top: 36}}><Serif size={52}>Same old resume,</Serif><Serif size={52} color={RED}>every application</Serif></Appear>
    <Appear t0={T.purana - 0.3} from="left" style={{left: 50, top: 300}}>
      <ResumeDoc w={260} title="resume_final.pdf" />
    </Appear>
    {ROLES.map(([r, c, col], i) => {
      const t0 = T.apply + 0.3 + i * 0.35;
      return <React.Fragment key={r}>
        <svg width={CARD_W} height={900} style={{position: 'absolute', left: 0, top: 0, opacity: t > t0 ? 1 : 0}}>
          <line x1={320} y1={470} x2={320 + (620 - 320) * ease(t, t0, 0.4)} y2={470 + (220 + i * 160 - 470) * ease(t, t0, 0.4)} stroke="#B9B6AC" strokeWidth={5} strokeDasharray="12 10" />
        </svg>
        <Appear t0={t0} from="right" style={{left: 640, top: 180 + i * 160}}><JD role={r} co={c} color={col} /></Appear>
        <Appear t0={T.bina + i * 0.12} from="scale" style={{left: 900, top: 196 + i * 160}}>
          <span style={{width: 56, height: 56, borderRadius: 28, background: RED, color: WHITE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30}}>&#10005;</span>
        </Appear>
      </React.Fragment>;
    })}
    <Appear t0={T.bina - 0.1} from="scale" style={{left: 40, top: 780}}><Pill color={RED} solid size={30}>not shortlisted</Pill></Appear>
  </>;
};

// ------------------------------------------------------------------ problem 2: every job wants its own resume
const P2: React.FC = () => (<>
  <Appear t0={10.4} style={{left: 40, top: 36}}><Serif size={52}>Every job description</Serif><Serif size={52} color={TEAL}>needs its own resume</Serif></Appear>
  {ROLES.slice(0, 3).map(([r, c, col], i) => <React.Fragment key={r}>
    <Appear t0={T.har + i * 0.3} from="left" style={{left: 40, top: 250 + i * 200}}><JD role={r} co={c} color={col} /></Appear>
    <Appear t0={T.according - 0.2 + i * 0.25} from="scale" style={{left: 380, top: 290 + i * 200}}><span style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: col}}>&rarr;</span></Appear>
    <Appear t0={T.according + i * 0.25} from="right" style={{left: 470, top: 225 + i * 200}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <ResumeDoc w={130} title={r.split(' ')[0]} accent={col} lines={4} />
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: GREEN, whiteSpace: 'nowrap'}}>&#10003; matches</span>
      </div>
    </Appear>
  </React.Fragment>)}
</>);

// ------------------------------------------------------------------ demos
const Z = 2560 / 700;   // zoom where ~700 source px fill the card width (side panel)
const D1a: React.FC = () => (<>
  <Demo src="demo1.mp4" a={17.2} b={23.6} s0={1.0} s1={11.5} keys={[{t: 1.0, cx: 1280, cy: 720, z: 1}, {t: 2.8, cx: 2240, cy: 560, z: Z}, {t: 8.6, cx: 2240, cy: 560, z: Z}, {t: 10.4, cx: 2240, cy: 800, z: Z}]} />
  <Step n="1" text="Paste the job link" t0={17.4} />
</>);
const D1b: React.FC = () => (<>
  <Demo src="demo1.mp4" a={23.6} b={27.4} s0={17.0} s1={28.5} keys={[{t: 17.0, cx: 2240, cy: 520, z: Z}, {t: 21.0, cx: 2240, cy: 620, z: Z}, {t: 27.0, cx: 2240, cy: 1050, z: Z}]} />
  <Step n="2" text="Get a tailored resume" t0={23.8} />
</>);
const D2a: React.FC = () => (<>
  <Demo src="demo2.mp4" a={27.4} b={30.0} s0={0.5} s1={9.0} keys={[{t: 0.5, cx: 1480, cy: 560, z: 1.85}, {t: 9.0, cx: 1480, cy: 560, z: 1.85}]} />
  <Step n="3" text="Or start from scratch" t0={27.6} />
</>);
const D2b: React.FC = () => (<>
  <Demo src="demo2.mp4" a={30.0} b={33.6} s0={43.4} s1={46.7} keys={[{t: 43.4, cx: 1480, cy: 660, z: 1.8}, {t: 46.7, cx: 1480, cy: 700, z: 1.9}]} />
  <Step n="4" text="One version per role" t0={30.2} />
</>);
const D3a: React.FC = () => (<>
  <Demo src="demo3.mp4" a={33.6} b={37.4} s0={0.3} s1={4.6} keys={[{t: 0.3, cx: 2240, cy: 300, z: Z}, {t: 2.4, cx: 2240, cy: 1000, z: Z}, {t: 4.6, cx: 2240, cy: 1000, z: Z}]} />
  <Step n="5" text="Improve with AI" t0={33.8} />
</>);
const D3b: React.FC = () => (<>
  <Demo src="demo3.mp4" a={37.4} b={41.6} s0={8.6} s1={15.4} keys={[{t: 8.6, cx: 2240, cy: 480, z: Z}, {t: 11.0, cx: 2240, cy: 640, z: Z}, {t: 15.4, cx: 2240, cy: 860, z: Z}]} />
  <Step n="6" text="Small fixes, one click" t0={37.6} />
</>);
const D4a: React.FC = () => (<>
  <Demo src="demo4.mp4" a={43.2} b={46.0} s0={0.8} s1={4.6} keys={[{t: 0.8, cx: 2290, cy: 420, z: 3.3}, {t: 4.6, cx: 2290, cy: 620, z: 3.3}]} />
  <Step n="7" text="Share a link" t0={43.4} />
</>);
const D4b: React.FC = () => (<>
  <Demo src="demo4.mp4" a={46.0} b={49.9} s0={12.6} s1={22.0} keys={[{t: 12.6, cx: 1480, cy: 520, z: 1.65}, {t: 17.0, cx: 1480, cy: 640, z: 1.65}, {t: 22.0, cx: 1480, cy: 720, z: 1.65}]} />
  <Step n="8" text="See who opened it" t0={46.2} />
</>);

export const scenes: Scene[] = [
  {a: 3.7, b: 10.3, el: P1}, {a: 10.3, b: 15.0, el: P2},
  {a: 17.2, b: 23.6, el: D1a}, {a: 23.6, b: 27.4, el: D1b}, {a: 27.4, b: 30.0, el: D2a}, {a: 30.0, b: 33.6, el: D2b},
  {a: 33.6, b: 37.4, el: D3a}, {a: 37.4, b: 41.6, el: D3b}, {a: 43.2, b: 46.0, el: D4a}, {a: 46.0, b: 49.9, el: D4b}];

// ------------------------------------------------------------------ overlays (talk mode)
const Hook: React.FC = () => {
  const t = useT(); if (t > 3.9) return null;
  return <>
    <Appear t0={T.shortlisted - 0.6} t1={3.6} from="down" style={{left: 0, right: 0, top: 150, textAlign: 'center'}}><Pill color={RED} solid size={40}>not getting shortlisted?</Pill></Appear>
    <Appear t0={T.yours - 0.2} t1={3.6} from="scale" style={{left: 690, top: 300}}><div style={{transform: 'rotate(6deg)'}}><ResumeDoc w={260} title="resume.pdf" stamp="REJECTED" /></div></Appear>
  </>;
};
const Reveal: React.FC = () => {
  const t = useT(); if (t < 14.8 || t > 17.4) return null;
  return <Appear t0={T.brand - 0.2} t1={17.0} from="scale" style={{left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: WHITE, borderRadius: 32, padding: '30px 54px 34px', textAlign: 'center', boxShadow: '0 30px 70px rgba(0,0,0,.35)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center'}}><div style={{width: 30, height: 30, borderRadius: 8, background: TEAL}} /><span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: INK}}>Shortlist</span></div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: TEAL, marginTop: 6}}>a resume for every job</div>
    </div>
  </Appear>;
};
const Cta: React.FC = () => {
  const t = useT(); if (t < 41.4 && t > 1) { /* keep */ }
  return <>
    <Appear t0={41.7} t1={43.2} from="down" style={{left: 0, right: 0, top: 250, textAlign: 'center'}}><Pill color={TEAL} solid size={38}>share + track it</Pill></Appear>
    <Appear t0={T.platform - 0.6} from="down" style={{left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: WHITE, borderRadius: 30, padding: '26px 44px', textAlign: 'center', boxShadow: '0 30px 70px rgba(0,0,0,.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center'}}><div style={{width: 24, height: 24, borderRadius: 7, background: TEAL}} /><span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: INK}}>Shortlist</span></div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: SUB}}>try it out</div>
      </div>
    </Appear>
    <Appear t0={T.comment - 0.2} from="scale" style={{left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: INK, color: WHITE, borderRadius: 26, padding: '22px 34px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,.35)'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, opacity: 0.8}}>comment</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 76, letterSpacing: '.04em', color: '#7FE0C8'}}>"SHORTLIST"</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: t > T.dm - 0.2 ? 1 : 0}}>I'll DM you the link</div>
      </div>
    </Appear>
    <Appear t0={T.month - 0.3} from="scale" style={{left: 0, right: 0, top: 1570, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: 'rotate(-3deg)'}}><Pill color={TEAL} solid size={46}>+ 1 month free access</Pill></div>
    </Appear>
  </>;
};
const CtaGate: React.FC = () => { const t = useT(); return t > 41.4 && (t < 43.3 || t > 49.6) ? <Cta /> : null; };

export const cfg: Config = {
  brand: {name: 'Shortlist', color: TEAL, tag: 'AI resume builder', url: 'shortlist.co.in'},
  modes: [{a: 0, b: 3.7, m: 'talk'}, {a: 3.7, b: 15.0, m: 'card'}, {a: 15.0, b: 17.2, m: 'talk'}, {a: 17.2, b: 41.6, m: 'card'}, {a: 41.6, b: 43.2, m: 'talk'}, {a: 43.2, b: 49.9, m: 'card'}, {a: 49.9, b: 999, m: 'talk'}],
  face: {y0: 720, y1: 1330},
  overlays: [Hook, Reveal, CtaGate],
};
