// How ACID transactions work. Theme: sketchbook. Not part of a series.
// Hard cuts: talk = speaker full screen with his real background; page = full-screen notebook explainer.
// Page content lives between y 140 and y 1560 (captions sit below). Example balances are illustrative.
import React from 'react';
import {Scene, useT} from './core';
import {Config, Write, Hilite, RRect, RCircle, RLine, RArrow, RCross, RTick, RShape, Sticky, INK, PENCIL, BLUE, RED, GREEN, ORANGE, HILITE, HILITE2, HAND, MARK, PRINT} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;

export const cfg: Config = {
  cuts: [
    {a: 0, b: 1.2, m: 'talk'},
    {a: 1.2, b: 5.4, m: 'page'},
    {a: 5.4, b: 7.4, m: 'talk'},
    {a: 7.4, b: 27.2, m: 'page'},
    {a: 27.2, b: 30.2, m: 'talk'},
    {a: 30.2, b: 42.8, m: 'page'},
    {a: 42.8, b: 44.8, m: 'talk'},
    {a: 44.8, b: 58.4, m: 'page'},
    {a: 58.4, b: 60.4, m: 'talk'},
    {a: 60.4, b: 82.4, m: 'page'},
    {a: 82.4, b: 84.0, m: 'talk'},
    {a: 84.0, b: 99.3, m: 'page'},
    {a: 99.3, b: 103.2, m: 'talk'},
    {a: 103.2, b: END + 1, m: 'page'},
  ],
};

const Title: React.FC<{t0: number; children: React.ReactNode; size?: number}> = ({t0, children, size = 108}) => <Write t0={t0} x={130} y={150} size={size} d={0.7}>{children}</Write>;
const Person: React.FC<{x: number; y: number; t0: number; color?: string; s?: number; seed?: number}> = ({x, y, t0, color = INK, s = 1, seed = 3}) => (
  <RShape t0={t0} d={0.7} build={(g, o) => {
    const p = o({stroke: color, sw: 6, seed, rough: 1.1});
    return [g.circle(x, y, 100 * s, p), g.line(x, y + 50 * s, x, y + 200 * s, p), g.line(x - 75 * s, y + 110 * s, x + 75 * s, y + 95 * s, p),
      g.line(x, y + 200 * s, x - 60 * s, y + 320 * s, p), g.line(x, y + 200 * s, x + 60 * s, y + 320 * s, p)];
  }} />
);
const Strike: React.FC<{x1: number; x2: number; y: number; t0: number}> = ({x1, x2, y, t0}) => <RLine x1={x1} y1={y + 6} x2={x2} y2={y - 6} t0={t0} d={0.25} stroke={RED} sw={7} seed={11} />;
const Server: React.FC<{x: number; y: number; t0: number}> = ({x, y, t0}) => (
  <RShape t0={t0} d={0.8} build={(g, o) => {
    const p = o({sw: 5, seed: 21});
    return [g.rectangle(x, y, 230, 260, p), g.line(x + 20, y + 87, x + 210, y + 87, p), g.line(x + 20, y + 174, x + 210, y + 174, p),
      g.circle(x + 190, y + 44, 22, o({sw: 4, seed: 22, stroke: GREEN})), g.circle(x + 190, y + 131, 22, o({sw: 4, seed: 23, stroke: GREEN})), g.circle(x + 190, y + 218, 22, o({sw: 4, seed: 24, stroke: GREEN})),
      g.line(x + 30, y + 44, x + 130, y + 44, o({sw: 4, seed: 25})), g.line(x + 30, y + 131, x + 130, y + 131, o({sw: 4, seed: 26})), g.line(x + 30, y + 218, x + 130, y + 218, o({sw: 4, seed: 27}))];
  }} />
);
const Disk: React.FC<{x: number; y: number; w: number; h: number; t0: number}> = ({x, y, w, h, t0}) => (
  <RShape t0={t0} d={0.8} build={(g, o) => {
    const p = o({sw: 5, seed: 31, stroke: BLUE}); const e = 70;
    return [g.ellipse(x + w / 2, y + e / 2, w, e, p), g.line(x, y + e / 2, x, y + h, p), g.line(x + w, y + e / 2, x + w, y + h, p),
      g.arc(x + w / 2, y + h, w, e, 0, Math.PI, false, p), g.arc(x + w / 2, y + h * 0.55, w, e, 0, Math.PI, false, o({sw: 3, seed: 32, stroke: BLUE}))];
  }} />
);
const Lock: React.FC<{x: number; y: number; t0: number; color?: string}> = ({x, y, t0, color = ORANGE}) => (
  <RShape t0={t0} d={0.5} build={(g, o) => [g.arc(x + 45, y + 10, 64, 90, Math.PI, Math.PI * 2, false, o({sw: 7, seed: 41, stroke: color})), g.rectangle(x, y + 10, 90, 75, o({sw: 6, seed: 42, stroke: color, fill: color, fillStyle: 'hachure'}))]} />
);
const Bolt: React.FC<{x: number; y: number; t0: number}> = ({x, y, t0}) => (
  <RShape t0={t0} d={0.3} build={(g, o) => g.polygon([[x + 40, y], [x - 10, y + 90], [x + 25, y + 90], [x - 20, y + 190], [x + 70, y + 70], [x + 35, y + 70], [x + 70, y]], o({sw: 6, seed: 51, stroke: ORANGE, fill: HILITE, fillStyle: 'solid'}))} />
);
const Envelope: React.FC<{x: number; y: number; t0: number}> = ({x, y, t0}) => (
  <RShape t0={t0} d={0.6} build={(g, o) => [g.rectangle(x, y, 300, 200, o({sw: 6, seed: 61, stroke: BLUE})), g.linearPath([[x, y], [x + 150, y + 110], [x + 300, y]], o({sw: 6, seed: 62, stroke: BLUE}))]} />
);

// ------------------------------------------------------------------ scenes
const Hook: React.FC = () => (
  <>
    <Title t0={1.25}>₹1,000 kahan gaya?</Title>
    <Person x={250} y={470} t0={1.4} color={BLUE} s={1.1} seed={3} />
    <Write t0={1.7} x={190} y={850} size={72} color={BLUE}>Tum</Write>
    <Write t0={T.kat} x={150} y={960} size={84} color={RED}>−₹1,000</Write>
    <Person x={830} y={470} t0={T.friend} color={GREEN} s={1.1} seed={5} />
    <Write t0={T.friend + 0.2} x={730} y={850} size={72} color={GREEN}>Friend</Write>
    <RArrow x1={380} y1={600} x2={700} y2={600} t0={3.6} d={0.5} sw={6} seed={8} curve={-40} />
    <RCross x={540} y={585} s={50} t0={T.pahunche + 0.1} />
    <Write t0={T.nahi - 0.1} x={440} y={680} size={280} color={RED} d={0.3} font={PRINT}>?</Write>
  </>
);

const Transfer: React.FC = () => (
  <>
    <Title t0={7.5}>Tum → Friend</Title>
    <RRect x={130} y={340} w={400} h={330} t0={7.7} stroke={BLUE} sw={5} seed={12} />
    <Write t0={7.8} x={155} y={360} size={54} color={BLUE}>Tumhara account</Write>
    <Write t0={T.five} x={170} y={440} size={96}>₹5,000</Write>
    <RRect x={570} y={340} w={410} h={330} t0={9.6} stroke={GREEN} sw={5} seed={13} />
    <Write t0={9.7} x={595} y={360} size={54} color={GREEN}>Friend ka account</Write>
    <Write t0={10.0} x={610} y={440} size={96}>₹2,000</Write>
    <Write t0={10.2} x={610} y={605} size={36} color={PENCIL} font={MARK}>(example)</Write>
    <RArrow x1={360} y1={705} x2={760} y2={705} t0={11.0} d={0.6} sw={6} seed={14} curve={50} />
    <Write t0={T.transfer} x={460} y={765} size={64} color={ORANGE}>₹1,000</Write>
    <Write t0={T.ops} x={130} y={880} size={74}>Database ke 2 operations:</Write>
    <Hilite x={130} y={1000} w={830} h={84} t0={15.0} color={HILITE2} />
    <Write t0={15.0} x={140} y={995} size={70}>1. Tumhare account se −1,000</Write>
    <Strike x1={165} x2={430} y={500} t0={T.deduct} />
    <Write t0={T.deduct + 0.2} x={190} y={560} size={76} color={RED}>→ ₹4,000</Write>
    <Hilite x={130} y={1120} w={830} h={84} t0={17.2} color={HILITE2} />
    <Write t0={17.2} x={140} y={1115} size={70}>2. Friend ke account mein +1,000</Write>
    <Strike x1={605} x2={870} y={500} t0={T.add} />
    <Write t0={T.add + 0.2} x={630} y={530} size={76} color={GREEN}>→ ₹3,000</Write>
    <Write t0={18.1} x={300} y={1290} size={80} color={RED} rot={-3}>dono hone chahiye!</Write>
  </>
);

const Txn: React.FC = () => (
  <>
    <Title t0={T.logical}>Ek logical unit</Title>
    <Write t0={18.85} d={0.3} x={150} y={385} size={70}>1. Tumhare account se −1,000</Write>
    <Write t0={18.9} d={0.3} x={150} y={505} size={70}>2. Friend ke account mein +1,000</Write>
    <RRect x={115} y={360} w={870} h={250} t0={T.logical + 0.1} d={0.9} stroke={RED} sw={7} seed={15} />
    <RArrow x1={540} y1={630} x2={540} y2={770} t0={T.txn - 0.3} d={0.3} sw={6} seed={16} />
    <Hilite x={190} y={800} w={700} h={130} t0={T.txn + 0.4} />
    <Write t0={T.txn} x={140} y={780} w={800} center size={136}>TRANSACTION</Write>
    <Write t0={24.0} x={140} y={990} w={800} center size={60} color={PENCIL}>reliable banane ke liye:</Write>
    {['A', 'C', 'I', 'D'].map((L, i) => {
      const cx = 225 + i * 210, c = [BLUE, RED, GREEN, ORANGE][i], t0 = T.acid + i * 0.18;
      return <React.Fragment key={L}>
        <RCircle x={cx} y={1220} r={88} t0={t0} d={0.35} stroke={c} sw={7} seed={70 + i} />
        <Write t0={t0 + 0.1} d={0.2} x={cx - 100} y={1140} w={200} center size={140} color={c}>{L}</Write>
      </React.Fragment>;
    })}
    <Write t0={25.9} x={140} y={1345} w={800} center size={64}>properties</Write>
  </>
);

const Atom: React.FC = () => (
  <>
    <Title t0={30.25}><span style={{color: BLUE}}>A</span> = Atomicity</Title>
    <Hilite x={130} y={300} w={510} h={86} t0={T.all} />
    <Write t0={T.all} x={140} y={290} size={84}>All or Nothing</Write>
    <RRect x={130} y={450} w={640} h={140} t0={31.7} stroke={INK} sw={5} seed={17} />
    <Write t0={31.8} x={160} y={480} size={72}>1. Tum −₹1,000</Write>
    <RTick x={910} y={510} s={48} t0={T.deduct2} />
    <RRect x={130} y={640} w={640} h={140} t0={33.9} stroke={INK} sw={5} seed={18} />
    <Write t0={34.1} x={160} y={670} size={72}>2. Friend +₹1,000</Write>
    <RCross x={910} y={710} s={45} t0={T.addfail - 0.2} />
    <Write t0={T.addfail + 0.1} x={860} y={775} size={56} color={RED}>fail!</Write>
    <RArrow x1={790} y1={705} x2={790} y2={525} t0={T.undo - 0.1} d={0.5} stroke={RED} sw={7} seed={19} curve={70} />
    <Write t0={T.undo} x={160} y={810} size={84} color={RED} rot={-2}>UNDO: ₹1,000 wapas</Write>
    <Strike x1={160} x2={590} y={520} t0={T.undo + 0.3} />
    <RRect x={130} y={1010} w={380} h={300} t0={T.poori} stroke={GREEN} sw={6} seed={20} />
    <Write t0={T.poori + 0.1} x={130} y={1040} w={380} center size={72} color={GREEN}>Poori hogi</Write>
    <Write t0={T.poori + 0.4} x={130} y={1150} w={380} center size={60} font={MARK}>COMMIT</Write>
    <Write t0={T.varna} x={510} y={1125} w={80} center size={54} color={PENCIL}>ya</Write>
    <RRect x={590} y={1010} w={390} h={300} t0={T.varna + 0.1} stroke={RED} sw={6} seed={21} />
    <Write t0={T.varna + 0.2} x={590} y={1040} w={390} center size={66} color={RED}>Koi change nahi</Write>
    <Write t0={T.varna + 0.6} x={590} y={1150} w={390} center size={60} font={MARK}>ROLLBACK</Write>
  </>
);

const Cons: React.FC = () => (
  <>
    <Title t0={44.9}><span style={{color: RED}}>C</span> = Consistency</Title>
    <Sticky x={170} y={340} w={740} h={210} t0={T.rules} rot={-2}>
      <Write t0={T.rules + 0.15} x={40} y={22} size={58} color={PENCIL}>Rule (business rule):</Write>
      <Write t0={T.rule} x={40} y={92} size={96}>balance ≥ 0</Write>
    </Sticky>
    <Write t0={50.9} x={130} y={630} size={74}>Balance: ₹500</Write>
    <Write t0={51.2} x={130} y={725} size={74}>Transfer: ₹1,000</Write>
    <Write t0={51.3} x={640} y={660} size={36} color={PENCIL} font={MARK}>(example)</Write>
    <Write t0={T.neg} x={130} y={835} size={96} color={RED}>= −₹500</Write>
    <RCross x={520} y={890} s={50} t0={T.neg + 0.5} />
    <RRect x={600} y={850} w={380} h={130} t0={T.neg2 - 0.1} d={0.3} stroke={RED} sw={7} seed={22} />
    <Write t0={T.neg2} x={600} y={865} w={380} center size={84} color={RED} rot={-4}>REJECTED</Write>
    <RCircle x={290} y={1290} r={150} t0={T.valid} stroke={GREEN} sw={7} seed={23} />
    <Write t0={T.valid + 0.1} x={140} y={1215} w={300} center size={66} color={GREEN}>valid</Write>
    <Write t0={T.valid + 0.3} x={140} y={1290} w={300} center size={66} color={GREEN}>state</Write>
    <RArrow x1={460} y1={1290} x2={620} y2={1290} t0={T.valid + 0.5} d={0.4} sw={6} seed={24} />
    <RCircle x={790} y={1290} r={150} t0={T.valid2} stroke={GREEN} sw={7} seed={25} />
    <Write t0={T.valid2 + 0.1} x={640} y={1215} w={300} center size={66} color={GREEN}>valid</Write>
    <Write t0={T.valid2 + 0.3} x={640} y={1290} w={300} center size={66} color={GREEN}>state</Write>
  </>
);

const IsoRace: React.FC = () => (
  <>
    <Title t0={60.5}><span style={{color: GREEN}}>I</span> = Isolation</Title>
    <RRect x={270} y={330} w={540} h={160} t0={61.4} stroke={INK} sw={6} seed={26} />
    <Write t0={T.bal} x={270} y={360} w={540} center size={86}>Balance ₹5,000</Write>
    <RRect x={130} y={640} w={380} h={200} t0={63.0} stroke={BLUE} sw={5} seed={27} />
    <Write t0={63.1} x={155} y={655} size={58} color={BLUE}>Request 1</Write>
    <Write t0={T.w4} x={155} y={735} size={84}>−₹4,000</Write>
    <RRect x={570} y={640} w={380} h={200} t0={63.3} stroke={ORANGE} sw={5} seed={28} />
    <Write t0={63.4} x={595} y={655} size={58} color={ORANGE}>Request 2</Write>
    <Write t0={T.w4 + 0.15} x={595} y={735} size={84}>−₹4,000</Write>
    <Write t0={63.6} x={130} y={555} w={820} center size={56} color={PENCIL}>ek hi time pe</Write>
    <RArrow x1={420} y1={495} x2={320} y2={630} t0={T.read} d={0.35} stroke={BLUE} sw={6} seed={29} />
    <RArrow x1={660} y1={495} x2={760} y2={630} t0={T.read + 0.1} d={0.35} stroke={ORANGE} sw={6} seed={30} />
    <Write t0={T.read + 0.2} x={150} y={865} size={60}>read: 5,000</Write>
    <Write t0={T.read + 0.4} x={590} y={865} size={60}>read: 5,000</Write>
    <Write t0={69.3} x={130} y={975} size={58} color={PENCIL}>concurrency control nahi...</Write>
    <RTick x={450} y={690} s={40} t0={T.incorrect} />
    <RTick x={890} y={690} s={40} t0={T.incorrect + 0.2} />
    <Write t0={T.incorrect + 0.5} x={130} y={1080} size={70}>Dono successful?!</Write>
    <Hilite x={130} y={1200} w={720} h={110} t0={72.4} color="#FFC9C2" />
    <Write t0={72.4} x={140} y={1190} size={100} color={RED}>Balance = −₹3,000</Write>
    <RCross x={920} y={1250} s={45} t0={72.9} />
  </>
);

const IsoFix: React.FC = () => (
  <>
    <Write t0={T.locks} x={130} y={150} size={108}>Locks</Write>
    <Write t0={T.mvcc} x={400} y={150} size={108} color={ORANGE}>+ MVCC</Write>
    <RRect x={130} y={340} w={380} h={200} t0={73.5} stroke={BLUE} sw={5} seed={31} />
    <Write t0={73.6} x={155} y={355} size={58} color={BLUE}>Request 1</Write>
    <Write t0={73.7} x={155} y={435} size={84}>−₹4,000</Write>
    <Lock x={400} y={290} t0={T.locks + 0.2} />
    <RTick x={300} y={620} s={44} t0={76.6} />
    <Write t0={76.9} x={130} y={680} size={62} color={GREEN}>Balance: ₹1,000</Write>
    <RRect x={570} y={340} w={380} h={200} t0={73.6} stroke={ORANGE} sw={5} seed={32} />
    <Write t0={73.7} x={595} y={355} size={58} color={ORANGE}>Request 2</Write>
    <Write t0={73.8} x={595} y={435} size={84}>−₹4,000</Write>
    <Write t0={75.6} x={600} y={570} size={62} color={PENCIL}>wait...</Write>
    <RCross x={760} y={700} s={40} t0={77.8} />
    <Write t0={78.0} x={600} y={760} size={58} color={RED}>paise kam hain</Write>
    <Sticky x={150} y={960} w={790} h={380} t0={T.behavior} rot={1.5}>
      <Write t0={T.behavior + 0.15} x={40} y={30} size={64}>Exact behavior depends on:</Write>
      <Write t0={T.level - 0.4} x={60} y={130} size={84} color={BLUE}>• isolation level</Write>
      <Write t0={81.7} x={60} y={235} size={84} color={BLUE}>• query design</Write>
    </Sticky>
  </>
);

const Dur: React.FC = () => (
  <>
    <Title t0={84.05}><span style={{color: ORANGE}}>D</span> = Durability</Title>
    <RRect x={130} y={340} w={420} h={140} t0={T.commit - 0.1} d={0.3} stroke={GREEN} sw={7} seed={33} />
    <Write t0={T.commit} x={130} y={358} w={420} center size={92} color={GREEN} rot={-2}>COMMIT ✓</Write>
    <Server x={720} y={300} t0={88.8} />
    <Write t0={89.0} x={700} y={570} w={270} center size={52}>DB server</Write>
    <Bolt x={630} y={380} t0={T.crashes} />
    <RArrow x1={330} y1={495} x2={330} y2={690} t0={T.disk - 0.6} d={0.4} sw={6} seed={34} />
    <Write t0={T.disk - 0.2} x={355} y={560} size={54} color={PENCIL}>pehle disk pe save</Write>
    <Disk x={160} y={700} w={340} h={250} t0={T.disk - 0.2} />
    <Write t0={T.disk + 0.3} x={160} y={820} w={340} center size={64} color={BLUE}>Disk</Write>
    <RCross x={835} y={430} s={110} t0={T.crash} />
    <Write t0={T.crash + 0.2} x={700} y={630} w={270} center size={72} color={RED}>CRASH!</Write>
    <RRect x={570} y={760} w={400} h={230} t0={T.wal - 0.1} stroke={INK} sw={5} seed={35} />
    <Write t0={T.wal} x={595} y={770} size={66}>WAL log</Write>
    <Write t0={T.wal + 0.3} x={595} y={850} size={46} color={PENCIL} font={MARK}>−1,000 you  ✓</Write>
    <Write t0={T.wal + 0.5} x={595} y={910} size={46} color={PENCIL} font={MARK}>+1,000 friend ✓</Write>
    <RLine x1={500} y1={860} x2={565} y2={860} t0={T.wal + 0.1} d={0.2} sw={5} seed={36} />
    <RArrow x1={770} y1={1000} x2={600} y2={1130} t0={T.recover - 0.3} d={0.35} stroke={GREEN} sw={6} seed={37} />
    <RRect x={200} y={1140} w={680} h={170} t0={T.recover} d={0.4} stroke={GREEN} sw={7} seed={38} />
    <Write t0={T.recover + 0.1} x={200} y={1170} w={680} center size={84} color={GREEN}>Data recovered ✓</Write>
    <Write t0={97.2} x={130} y={1350} w={820} center size={56} color={PENCIL}>(committed changes)</Write>
  </>
);

const Cta: React.FC = () => (
  <>
    <Sticky x={150} y={360} w={780} h={420} t0={T.comment} rot={-3}>
      <Write t0={T.comment + 0.1} x={0} y={40} w={780} center size={110}>Comment</Write>
      <Write t0={103.8} x={0} y={170} w={780} center size={190} color={RED} d={0.4}>LINK</Write>
    </Sticky>
    <RArrow x1={540} y1={830} x2={540} y2={1000} t0={104.6} d={0.4} sw={6} seed={39} />
    <Envelope x={390} y={1030} t0={T.dm - 0.2} />
    <Write t0={T.dm + 0.1} x={140} y={1270} w={800} center size={86} color={BLUE}>Blog link DM mein</Write>
  </>
);

export const scenes: Scene[] = [
  {a: 1.2, b: 5.4, el: Hook},
  {a: 7.4, b: 18.8, el: Transfer},
  {a: 18.8, b: 27.2, el: Txn},
  {a: 30.2, b: 42.8, el: Atom},
  {a: 44.8, b: 58.4, el: Cons},
  {a: 60.4, b: 73.4, el: IsoRace},
  {a: 73.4, b: 82.4, el: IsoFix},
  {a: 84.0, b: 99.3, el: Dur},
  {a: 103.2, b: END + 1, el: Cta},
];
