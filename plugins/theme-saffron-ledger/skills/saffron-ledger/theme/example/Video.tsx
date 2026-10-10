// How UPI payments work. Theme: saffron-ledger. Not part of a series. Icons: Phosphor duotone (no Lucide).
// Card scenes: 1000 x 840. Official logos in public/logos (UPI, NPCI, Google Pay, PhonePe).
import React from 'react';
import {Scene, clamp, lerp, ease, useT, Shake, springAt} from './core';
import {useCurrentFrame} from 'remotion';
import {Config, Appear, Tag, Heading, Flow, Icon, Logo, Node, Rs, Phone, CARD, PAPER2, LINE, INK, SUB, SAFFRON, DEEPSAF, GREEN, LEAF, RED, AMBER, DISPLAY, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;
const L = {upi: 'logos/upi.png', npci: 'logos/npci.png', gpay: 'logos/gpay.png', gpayM: 'logos/gpay-mark.png', pp: 'logos/phonepe.png', ppM: 'logos/phonepe-mark.png', mark: 'logos/upi-mark.png'};

const Label: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, color = INK, font = DISPLAY, w = 800, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.15, ...style}}>{children}</div>
);
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => <div style={{position: 'absolute', left: x, top: y, ...style}}>{children}</div>;
const Chip: React.FC<{icon?: string; logo?: string; children: React.ReactNode; color?: string; size?: number; solid?: boolean}> = ({icon, logo, children, color = DEEPSAF, size = 28, solid}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 14, background: solid ? color : CARD, border: `3px solid ${solid ? INK : color}`, boxShadow: `5px 5px 0 ${INK}`}}>
    {logo ? <Logo src={logo} h={size * 1.3} /> : icon && <Icon name={icon} size={size * 1.2} color={solid ? '#fff' : color} />}
    <span style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: solid ? '#fff' : INK, whiteSpace: 'nowrap'}}>{children}</span>
  </div>
);
/** white tile holding an official logo */
const LogoTile: React.FC<{src: string; w: number; h: number; pad?: number; on?: boolean; tone?: string}> = ({src, w, h, pad = 24, on, tone = SAFFRON}) => (
  <div style={{width: w, height: h, borderRadius: 20, background: '#fff', border: `3px solid ${on ? tone : INK}`, boxShadow: `6px 6px 0 ${on ? tone : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: pad, boxSizing: 'border-box'}}>
    <Logo src={src} w={w - pad * 2} h={h - pad * 2} />
  </div>
);
/** logo tile that springs in with an overshoot and settles; equal sizes keep rows aligned */
const PopTile: React.FC<{t0: number; src: string; w: number; h: number; pad?: number; tone?: string}> = ({t0, src, w, h, pad = 26, tone = SAFFRON}) => {
  const f = useCurrentFrame(); const t = f / 30; if (t < t0 - 0.05) return <div style={{width: w, height: h}} />;
  const p = springAt(f, t0, {damping: 9, stiffness: 170, mass: 0.8});
  const lift = Math.max(0, Math.sin(Math.min(1, (t - t0) / 0.5) * Math.PI)) * 14;
  return <div style={{transform: `translateY(${-lift}px) scale(${0.2 + 0.8 * p})`, opacity: clamp(p * 2)}}>
    <div style={{width: w, height: h, borderRadius: 24, background: '#fff', border: `4px solid ${INK}`, boxShadow: `8px 8px 0 ${tone}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: pad, boxSizing: 'border-box'}}>
      <Logo src={src} w={w - pad * 2} h={h - pad * 2} />
    </div>
  </div>;
};
const Card: React.FC<{w: number; h?: number; children: React.ReactNode; style?: React.CSSProperties; tone?: string}> = ({w, h, children, style, tone = INK}) => (
  <div style={{width: w, height: h, borderRadius: 20, background: CARD, border: `3px solid ${tone}`, boxShadow: `6px 6px 0 ${tone}`, boxSizing: 'border-box', ...style}}>{children}</div>
);
const Stamp: React.FC<{t0: number; ok?: boolean; size?: number}> = ({t0, ok, size = 64}) => {
  const t = useT(); const k = ease(t, t0, 0.25); if (k <= 0) return null;
  return <div style={{transform: `scale(${1.5 - 0.5 * k})`, opacity: k}}><Icon name={ok ? 'check-circle' : 'x-circle'} size={size} color={ok ? GREEN : RED} /></div>;
};

// ------------------------------------------------------------------ 01 traditional card payment
const S1: React.FC = () => {
  const t = useT(); const k = ease(t, T.credit, 1.1);
  return <>
    <Heading t0={12.25} kicker="BEFORE UPI" title="A card payment at a shop" />
    <Appear t0={T.traditional} from="left" style={{left: 40, top: 200}}><Node icon="user" label="YOU" sub="customer" w={240} /></Appear>
    <Appear t0={T.shop} from="right" style={{left: 720, top: 200}}><Node icon="storefront" label="SHOP" sub="merchant" w={240} tone="saf" on /></Appear>
    <Appear t0={T.r1000} from="scale" style={{left: 330, top: 220}}>
      <Card w={340} style={{padding: '18px 20px', textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center'}}><Icon name="shopping-bag" size={40} color={SAFFRON} /><Label size={24} font={MONO} w={600} color={SUB}>product</Label></div>
        <div style={{marginTop: 6}}><Rs t0={T.r1000} to={1000} dec={false} size={70} /></div>
      </Card>
    </Appear>
    {t > T.credit - 0.2 && <At x={lerp(60, 600, k)} y={520} style={{opacity: ease(t, T.credit - 0.2, 0.3)}}>
      <div style={{width: 300, height: 186, borderRadius: 20, background: `linear-gradient(135deg, ${INK}, #2D4777)`, boxShadow: `6px 6px 0 ${SAFFRON}`, position: 'relative', padding: 20, boxSizing: 'border-box'}}>
        <div style={{width: 50, height: 38, borderRadius: 8, background: AMBER}} />
        <Label size={24} font={MONO} w={600} color="#fff" style={{marginTop: 26, letterSpacing: '.18em'}}>**** **** 4321</Label>
        <Label size={18} font={MONO} w={500} color="#C9D3E6" style={{marginTop: 8}}>CREDIT CARD</Label>
      </div>
    </At>}
    <Appear t0={T.credit + 1.0} from="scale" style={{left: 400, top: 740}}><Tag size={22}>tap / swipe at the counter</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 02 where the 1000 goes (illustrative)
const Row: React.FC<{t0: number; label: string; children: React.ReactNode; strong?: boolean}> = ({t0, label, children, strong}) => (
  <Appear t0={t0} from="left" style={{position: 'relative'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '24px 4px', borderBottom: `2px dashed ${LINE}`}}>
      <Label size={strong ? 30 : 27} font={SANS} w={strong ? 700 : 500} color={strong ? INK : SUB}>{label}</Label>
      {children}
    </div>
  </Appear>
);
const S2: React.FC = () => {
  return <>
    <Heading t0={22.05} kicker="CARD FEES · ILLUSTRATIVE" title="Where the money goes" />
    <Appear t0={T.provider} from="right" style={{left: 690, top: 180}}><Node icon="credit-card" label="PROVIDER" sub="charges a fee" w={270} tone="red" on /></Appear>
    <Flow x1={690} y1={300} x2={620} y2={330} t0={T.merchant} n={2} color={RED} />
    <div style={{position: 'absolute', left: 40, top: 180, width: 600}}>
      <Card w={600} style={{padding: '14px 26px 22px'}}>
        <Label size={20} font={MONO} w={600} color={DEEPSAF} style={{letterSpacing: '.16em', marginBottom: 4}}>MERCHANT RECEIPT</Label>
        <div style={{position: 'relative', display: 'flex', flexDirection: 'column'}}>
          <Row t0={22.2} label="Sale"><Rs t0={22.2} to={1000} from={1000} size={38} /></Row>
          <Row t0={T.pct2} label="Processing fee 2%"><Rs t0={T.r20} to={20} size={38} color={RED} sign="- " /></Row>
          <Row t0={T.gst} label="18% GST on the fee"><Rs t0={T.r3} to={3.6} size={38} color={RED} sign="- " /></Row>
          <Row t0={T.total} label="Total deduction" strong><Rs t0={T.r23} to={23.6} size={40} color={RED} sign="- " /></Row>
          <Row t0={T.milenge} label="Merchant gets" strong><Rs t0={T.r976} to={976.4} from={1000} size={50} color={GREEN} /></Row>
        </div>
      </Card>
    </div>
  </>;
};

// ------------------------------------------------------------------ 03 card vs zero-MDR UPI
const S3: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={41.85} kicker="CARD vs UPI" title="Same 1000, zero MDR" />
    <Appear t0={T.illustrative} from="up" style={{left: 36, top: 165}}><Tag size={21} color={SUB}>illustrative · actual card fees vary</Tag></Appear>
    <Appear t0={42.0} from="left" style={{left: 40, top: 240}}>
      <Card w={430} h={520} style={{padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}} tone={RED}>
        <Icon name="credit-card" size={90} color={RED} />
        <Label size={34}>CARD</Label>
        <Tag size={22} color={RED}>fee + GST: 23.60</Tag>
        <Label size={22} font={SANS} w={500} color={SUB}>merchant gets</Label>
        <Rs t0={42.2} to={976.4} size={54} color={RED} />
      </Card>
    </Appear>
    <Appear t0={T.r1000b} from="right" style={{left: 530, top: 240}}>
      <Card w={430} h={520} style={{padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}} tone={GREEN}>
        <div style={{height: 90, display: 'flex', alignItems: 'center'}}><Logo src={L.upi} h={70} /></div>
        <Label size={34}>UPI</Label>
        {t > T.zero ? <Tag size={22} color={GREEN} solid>ZERO MDR</Tag> : <div style={{height: 44}} />}
        <Label size={22} font={SANS} w={500} color={SUB}>merchant gets</Label>
        {t > T.merchant2 - 0.3 ? <Rs t0={T.merchant2 - 0.3} to={1000} from={976.4} size={54} color={GREEN} /> : <Label size={54} color={LINE}>...</Label>}
      </Card>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 04 MDR meaning + subsidy
const S4: React.FC = () => {
  const t = useT();
  const words: [string, string, number][] = [['M', 'erchant', T.mdrm], ['D', 'iscount', T.discount], ['R', 'ate', T.rate]];
  return <>
    <Heading t0={52.65} kicker="JARGON CHECK" title="What is MDR?" />
    <div style={{position: 'absolute', left: 40, top: 190, display: 'flex', gap: 14}}>
      {words.map(([a, b, t0], i) => {
        const k = ease(t, t0, 0.5);
        return <Appear key={i} t0={T.mdr + i * 0.1} from="scale" style={{position: 'relative'}}>
          <Card w={lerp(140, 296, k)} h={130} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}} tone={i === 1 ? GREEN : SAFFRON}>
            <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: i === 1 ? GREEN : SAFFRON}}>{a}</span>
            <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: INK, opacity: k, maxWidth: 220 * k, overflow: 'hidden', whiteSpace: 'nowrap'}}>{b}</span>
          </Card>
        </Appear>;
      })}
    </div>
    <Appear t0={T.merchant3} from="left" style={{left: 40, top: 400}}><Node icon="storefront" label="MERCHANT" sub="pays 0 MDR" w={280} tone="green" on /></Appear>
    <Appear t0={T.govt} from="right" style={{left: 660, top: 400}}><Node icon="buildings" label="GOVERNMENT" sub="incentive scheme" w={300} tone="saf" on /></Appear>
    <Flow x1={655} y1={500} x2={330} y2={500} t0={T.behalf} n={4} speed={1.1} color={SAFFRON} />
    <Appear t0={T.behalf} from="scale" style={{left: 380, top: 430}}><Tag size={20}>pays on its behalf</Tag></Appear>
    <Appear t0={T.subsidized} from="up" style={{left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}><Chip icon="hand-coins" color={GREEN} solid size={30}>SUBSIDIZED</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 05 UPI full form + NPCI
const S5: React.FC = () => {
  const words: [string, number][] = [['Unified', T.unified], ['Payments', T.payments], ['Interface', T.interface]];
  return <>
    <Heading t0={64.95} kicker="WHO RUNS UPI?" title="The full form, and the owner" />
    <Appear t0={65.0} from="scale" style={{left: 0, right: 0, top: 175, display: 'flex', justifyContent: 'center'}}><LogoTile src={L.upi} w={520} h={190} pad={28} /></Appear>
    <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 14}}>
      {words.map(([w, t0], i) => <Appear key={i} t0={t0} from="up" style={{position: 'relative'}}><Tag size={30} color={i === 1 ? GREEN : DEEPSAF}>{w}</Tag></Appear>)}
    </div>
    <Appear t0={T.npci - 0.3} from="up" style={{left: 0, right: 0, top: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <Label size={22} font={MONO} w={600} color={SUB}>OPERATED BY</Label>
      <LogoTile src={L.npci} w={560} h={170} pad={26} on tone={INK} />
    </Appear>
    <Appear t0={T.infra} from="up" style={{left: 0, right: 0, top: 772, display: 'flex', justifyContent: 'center'}}><Tag size={22} color={GREEN} solid>manages UPI's payment infra</Tag></Appear>
  </>;
};

// ------------------------------------------------------------------ 06 apps are interfaces
const S6: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={75.35} kicker="THE APPS" title="Apps are just the interface" />
    <Appear t0={T.gpay} from="left" style={{left: 90, top: 170}}><LogoTile src={L.gpay} w={300} h={170} pad={16} /></Appear>
    <Appear t0={T.ppe} from="right" style={{left: 610, top: 170}}><LogoTile src={L.pp} w={300} h={170} pad={26} /></Appear>
    <Appear t0={T.notprov} t1={T.iface - 0.15} from="scale" style={{left: 0, right: 0, top: 345, display: 'flex', justifyContent: 'center'}}><Chip icon="x-circle" color={RED} size={24}>not payment providers</Chip></Appear>
    <Appear t0={T.iface} from="scale" style={{left: 0, right: 0, top: 345, display: 'flex', justifyContent: 'center'}}><Chip icon="device-mobile" color={GREEN} size={24}>payment interface</Chip></Appear>
    {[0, 1, 2].map(i => <Appear key={i} t0={T.banks + i * 0.12} from="up" style={{left: 70 + i * 300, top: 475}}><Node icon="bank" label={`BANK ${'ABC'[i]}`} w={250} /></Appear>)}
    <Appear t0={T.psp} from="scale" style={{left: 0, right: 0, top: 418, display: 'flex', justifyContent: 'center'}}><Tag size={20} color={DEEPSAF} solid>+ authorized PSPs</Tag></Appear>
    {[0, 1, 2].map(i => <Flow key={i} x1={195 + i * 300} y1={630} x2={500} y2={700} t0={T.connect + i * 0.1} n={2} color={GREEN} />)}
    {t > T.connect - 0.2 && <Appear t0={T.connect - 0.2} from="up" style={{left: 150, top: 700}}>
      <Card w={700} h={110} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24}} tone={GREEN}>
        <Logo src={L.upi} h={54} /><Label size={30}>ecosystem</Label><Logo src={L.npci} h={46} />
      </Card>
    </Appear>}
  </>;
};

// ------------------------------------------------------------------ 07 paying a friend 500
const S7: React.FC = () => {
  const t = useT();
  const pinN = t > T.pin ? Math.min(4, Math.floor((t - T.pin) / 0.18) + 1) : 0;
  const idTxt = 'friend@upi'; const idN = t > T.upiid ? Math.min(idTxt.length, Math.floor((t - T.upiid) * 14)) : 0;
  const checks: [string, string][] = [['password', 'UPI PIN'], ['wallet', 'balance'], ['shield-check', 'limits & risk']];
  return <>
    <Heading t0={87.65} kicker="INSIDE A PAYMENT" title="Paying a friend 500" />
    <Appear t0={87.8} from="left" style={{left: 40, top: 165}}>
      <Phone w={330} h={640}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 34, display: 'flex', justifyContent: 'center'}}><Logo src={L.gpayM} h={44} /></div>
        <div style={{position: 'absolute', left: 20, right: 20, top: 100, display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 54, height: 54, borderRadius: 27, background: PAPER2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="user" size={34} color={INK} /></div>
          <div><Label size={22}>{t > T.friend ? 'Friend' : ' '}</Label><Label size={16} font={MONO} w={500} color={SUB}>{idTxt.slice(0, idN) || ' '}</Label></div>
        </div>
        {t > T.qr && <div style={{position: 'absolute', left: 20, right: 20, top: 172, display: 'flex', alignItems: 'center', gap: 8, opacity: ease(t, T.qr, 0.3)}}><Icon name="qr-code" size={30} color={GREEN} /><Label size={16} font={SANS} w={700} color={GREEN}>or scan the QR code</Label></div>}
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>{t > T.amount ? <Rs t0={T.amount} to={500} dec={false} size={64} /> : <Label size={64} color={LINE}>{'₹'}0</Label>}</div>
        {t > T.pin - 0.2 && <div style={{position: 'absolute', left: 20, right: 20, top: 340, textAlign: 'center', opacity: ease(t, T.pin - 0.2, 0.3)}}>
          <Label size={18} font={MONO} w={600} color={SUB}>ENTER UPI PIN</Label>
          <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12}}>{[0, 1, 2, 3].map(i => <div key={i} style={{width: 22, height: 22, borderRadius: 11, border: `3px solid ${INK}`, background: i < pinN ? INK : 'transparent'}} />)}</div>
        </div>}
        <div style={{position: 'absolute', left: 20, right: 20, bottom: 24, height: 64, borderRadius: 16, background: t > T.yourbank - 0.3 ? GREEN : SAFFRON, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Label size={24} color="#fff">{t > T.yourbank - 0.3 ? 'Processing...' : 'Pay'}</Label></div>
      </Phone>
    </Appear>
    <Flow x1={380} y1={480} x2={520} y2={300} t0={T.yourbank - 0.2} n={3} />
    <Appear t0={T.yourbank} from="right" style={{left: 530, top: 170}}><Node icon="bank" label="YOUR BANK" sub={t > T.auth ? 'authenticates' : ' '} w={300} tone="saf" on={t > T.auth} /></Appear>
    <Appear t0={T.checks - 0.3} from="up" style={{left: 530, top: 440}}>
      <Card w={400} style={{padding: '16px 22px'}}>
        <Label size={20} font={MONO} w={600} color={DEEPSAF}>CHECKS (E.G.)</Label>
        {checks.map(([ic, l], i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
          <Icon name={ic} size={36} color={INK} /><Label size={26} font={SANS} w={600} style={{flex: 1}}>{l}</Label><Stamp t0={T.checks - 0.1 + i * 0.25} ok size={36} />
        </div>)}
      </Card>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 08 the rail: bank -> NPCI -> bank
const S8: React.FC = () => {
  const t = useT(); const back = t > T.result;
  return <>
    <Heading t0={102.05} kicker="THE UPI RAIL" title="Bank to NPCI to bank" />
    <Appear t0={102.1} from="left" style={{left: 30, top: 330}}><Node icon="bank" label="YOUR BANK" sub="sender" w={260} tone="saf" on /></Appear>
    <Appear t0={T.npci2} from="scale" style={{left: 345, top: 320}}><LogoTile src={L.npci} w={310} h={170} pad={22} on tone={INK} /></Appear>
    <Appear t0={T.fbank} from="right" style={{left: 710, top: 330}}><Node icon="bank" label="FRIEND'S BANK" sub="recipient" w={260} tone="green" on={t > T.process} /></Appear>
    <Flow x1={290} y1={400} x2={345} y2={400} t0={T.npci2 + 0.2} n={2} />
    <Flow x1={655} y1={400} x2={710} y2={400} t0={T.fbank + 0.2} n={2} />
    <Appear t0={T.details} from="up" style={{left: 330, top: 210}}><Chip icon="receipt" size={24}>payment details</Chip></Appear>
    <Appear t0={T.process} from="up" style={{left: 690, top: 560}}><Tag size={22} color={GREEN} solid>processes it</Tag></Appear>
    {back && <>
      <Flow x1={710} y1={470} x2={655} y2={470} t0={T.result} n={2} color={GREEN} />
      <Flow x1={345} y1={470} x2={290} y2={470} t0={T.result + 0.3} n={2} color={GREEN} />
    </>}
    <Appear t0={T.result} from="up" style={{left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}><Chip icon="arrow-u-up-left" color={GREEN} size={26}>result travels back</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 09 the app does not move money
const S9: React.FC = () => {
  const t = useT(); const TG = T.participating + 0.7; const together = t > TG;
  return <>
    <Heading t0={111.05} kicker="MYTH vs REALITY" title="The app doesn't move money" />
    <Appear t0={T.app} from="down" style={{left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 20}}>
      <LogoTile src={L.gpayM} w={150} h={130} pad={22} /><LogoTile src={L.ppM} w={150} h={130} pad={22} />
    </Appear>
    <Appear t0={T.directly - 0.2} from="left" style={{left: 40, top: 430}}><Node icon="bank" label="BANK A" w={230} /></Appear>
    <Appear t0={T.directly - 0.1} from="right" style={{left: 730, top: 430}}><Node icon="bank" label="BANK B" w={230} /></Appear>
    {!together && t > T.directly && <>
      <Flow x1={500} y1={300} x2={150} y2={430} t0={T.directly} n={2} color={RED} />
      <Flow x1={500} y1={300} x2={850} y2={430} t0={T.directly} n={2} color={RED} />
    </>}
    <Appear t0={T.directly + 0.3} t1={TG - 0.1} from="scale" style={{left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center'}}><Chip icon="x-circle" color={RED} size={26}>app transfers bank to bank</Chip></Appear>
    <Appear t0={TG} from="scale" style={{left: 375, top: 420}}><LogoTile src={L.npci} w={250} h={130} pad={18} on tone={GREEN} /></Appear>
    {together && <>
      <Flow x1={270} y1={500} x2={375} y2={485} t0={TG + 0.2} n={3} color={GREEN} />
      <Flow x1={625} y1={485} x2={730} y2={500} t0={TG + 0.4} n={3} color={GREEN} />
    </>}
    <Appear t0={T.milkar} from="up" style={{left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center'}}><Chip icon="handshake" color={GREEN} solid size={28}>banks + UPI infra, together</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 10 status back to the app
const StatusPhone: React.FC<{ok: boolean; t0: number}> = ({ok, t0}) => {
  const t = useT(); const k = ease(t, t0, 0.4);
  return <Phone w={300} h={520}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 36, display: 'flex', justifyContent: 'center'}}><Logo src={L.gpayM} h={36} /></div>
    {k > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: k, transform: `scale(${0.8 + 0.2 * k})`}}>
      <div style={{width: 130, height: 130, borderRadius: 65, background: ok ? GREEN : RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ok ? 'check-circle' : 'x-circle'} size={96} color="#fff" /></div>
      <Label size={28}>{ok ? 'Payment successful' : 'Payment failed'}</Label>
      <Label size={44} color={ok ? GREEN : RED}>{'₹'}500</Label>
    </div> : <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}><Icon name="hourglass" size={80} color={AMBER} /></div>}
  </Phone>;
};
const S10: React.FC = () => <>
  <Heading t0={121.05} kicker="PAYMENT STATUS" title="The result reaches your app" />
  <Appear t0={T.status - 0.3} from="down" style={{left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center'}}><Chip icon="arrow-u-up-left" size={24}>transaction status</Chip></Appear>
  <Flow x1={500} y1={225} x2={240} y2={290} t0={T.status} n={2} color={GREEN} />
  <Flow x1={500} y1={225} x2={760} y2={290} t0={T.fail - 0.4} n={2} color={RED} />
  <Appear t0={T.success - 0.6} from="up" style={{left: 90, top: 290}}><StatusPhone ok t0={T.success} /></Appear>
  <Appear t0={T.fail - 0.5} from="up" style={{left: 610, top: 290}}><StatusPhone ok={false} t0={T.fail} /></Appear>
</>;

// ------------------------------------------------------------------ 11 pending: check before retry
const S11: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={132.55} kicker="PENDING?" title="Check status, then retry" />
    <Appear t0={T.response - 0.2} from="scale" style={{left: 60, top: 200}}>
      <Card w={400} h={260} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}} tone={AMBER}>
        <div style={{transform: `rotate(${Math.floor(t * 1.2) * 180}deg)`, transition: 'none'}}><Icon name="hourglass" size={90} color={AMBER} /></div>
        <Label size={30}>response delayed</Label>
      </Card>
    </Appear>
    <Appear t0={T.dobara - 0.2} from="scale" style={{left: 540, top: 200}}>
      <div style={{position: 'relative'}}>
        <Card w={400} h={260} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}} tone={RED}>
          <div style={{padding: '14px 40px', borderRadius: 14, background: SAFFRON}}><Label size={30} color="#fff">Pay again</Label></div>
          <Label size={24} font={SANS} w={600} color={RED}>risk of paying twice</Label>
        </Card>
        <div style={{position: 'absolute', right: -16, top: -16}}><Stamp t0={T.dobara + 0.3} size={70} /></div>
      </div>
    </Appear>
    <Appear t0={T.check} from="up" style={{left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}><Chip icon="magnifying-glass" color={GREEN} solid size={32}>check transaction status first</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 12 built for scale
const CAPS: [string, string, string][] = [['lock-key', 'Secured comms', 'secured'], ['git-branch', 'Txn routing', 'routing'], ['bank', 'Bank integration', 'integration'], ['chart-line-up', 'Monitoring', 'monitoring'], ['arrow-clockwise', 'Failure handling', 'failure']];
const S12: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={139.85} kicker="BUILT FOR SCALE" title="What keeps it running" />
    <div style={{position: 'absolute', left: 40, top: 170, width: 920, height: 120, display: 'flex', alignItems: 'flex-end', gap: 6, opacity: ease(t, T.massive, 0.4)}}>
      {Array.from({length: 46}).map((_, i) => <div key={i} style={{flex: 1, height: 20 + 90 * (0.5 + 0.5 * Math.sin(i * 0.45 + t * 2.2)) * ease(t, T.massive + i * 0.01, 0.5), background: i % 2 ? SAFFRON : GREEN, borderRadius: 4}} />)}
    </div>
    {CAPS.map(([ic, l, key], i) => <Appear key={i} t0={T[key] - 0.1} from="up" style={{left: i < 3 ? 40 + i * 315 : 197 + (i - 3) * 315, top: i < 3 ? 330 : 520}}>
      <Card w={295} h={160} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12}} tone={i % 2 ? GREEN : SAFFRON}>
        <Icon name={ic} size={58} color={i % 2 ? GREEN : DEEPSAF} /><Label size={25}>{l}</Label>
      </Card>
    </Appear>)}
    <Appear t0={T.seconds} from="scale" style={{left: 40, top: 740}}><Chip icon="timer" size={24}>done in seconds</Chip></Appear>
    <Appear t0={T.multiple} from="scale" style={{left: 470, top: 740}}><Chip icon="tree-structure" color={GREEN} size={24}>many systems in sync</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 13 summary: an ecosystem
const S13: React.FC = () => {
  const t = useT(); const cx = 500, cy = 470;
  const pts: [number, number, string, number][] = [[500, 230, 'banks', T.bankx], [250, 640, 'npci', T.npcix], [750, 640, 'apps', T.appsx]];
  return <>
    <Heading t0={155.95} kicker="SUMMARY" title={t < T.ecosystem ? 'Not just an app' : 'A payment ecosystem'} />
    {t > T.bankx && <svg width={1000} height={840} style={{position: 'absolute', left: 0, top: 0}}>
      {pts.map(([x, y, , t0], i) => <line key={i} x1={cx} y1={cy} x2={lerp(cx, x, ease(t, t0, 0.4))} y2={lerp(cy, y, ease(t, t0, 0.4))} stroke={i === 1 ? INK : i === 0 ? SAFFRON : GREEN} strokeWidth={6} strokeDasharray="14 10" />)}
    </svg>}
    <Appear t0={T.bankx} from="scale" style={{left: 380, top: 160}}><Node icon="bank" label="BANKS" w={240} tone="saf" on /></Appear>
    <Appear t0={T.npcix} from="scale" style={{left: 90, top: 580}}><LogoTile src={L.npci} w={320} h={130} pad={20} on tone={INK} /></Appear>
    <Appear t0={T.appsx} from="scale" style={{left: 590, top: 570}}>
      <div style={{display: 'flex', gap: 14}}><LogoTile src={L.gpayM} w={150} h={140} pad={24} on tone={GREEN} /><LogoTile src={L.ppM} w={150} h={140} pad={24} on tone={GREEN} /></div>
    </Appear>
    <Appear t0={T.ecosystem} from="scale" style={{left: cx - 120, top: cy - 70}}>
      <div style={{width: 240, height: 140, borderRadius: 24, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `6px 6px 0 ${SAFFRON}`}}>
        <Logo src={L.mark} h={52} /><Label size={22} color="#fff" style={{marginTop: 6}}>digital payments</Label>
      </div>
    </Appear>
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 14}}>
      {([['lightning', 'fast', T.fast], ['users', 'accessible', T.accessible], ['hand-coins', 'convenient', T.convenient]] as [string, string, number][]).map(([ic, l, t0], i) =>
        <Appear key={i} t0={t0} from="up" style={{position: 'relative'}}><Tag size={24} color={i === 1 ? GREEN : DEEPSAF} solid>{l}</Tag></Appear>)}
    </div>
    {t > T.notapp - 0.3 && t < T.ecosystem && <Appear t0={T.notapp - 0.3} t1={T.ecosystem - 0.1} from="scale" style={{left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center'}}><Chip icon="x-circle" color={RED} size={30}>only a payment app</Chip></Appear>}
  </>;
};

// ------------------------------------------------------------------ talk-mode overlays (speaker full screen)
const Band: React.FC<{a: number; b: number; children: React.ReactNode; top?: number}> = ({a, b, children, top = 1170}) => {
  const t = useT(); if (t < a - 0.05 || t > b + 0.3) return null;
  const k = ease(t, a, 0.4) * clamp((b + 0.25 - t) / 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{children}</div>;
};
const Plate: React.FC<{children: React.ReactNode; tone?: string; pad?: string}> = ({children, tone = INK, pad = '18px 30px'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: pad, borderRadius: 24, background: CARD, border: `4px solid ${INK}`, boxShadow: `8px 8px 0 ${tone}`}}>{children}</div>
);
const Big: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 62, color = INK, children}) => (
  <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.05}}>{children}</span>
);
const Intro: React.FC = () => {
  const t = useT();
  return <>
    <Band a={0} b={2.15}>
      <Plate tone={SAFFRON} pad="20px 34px"><Logo src={L.upi} h={92} /><div style={{width: 4, height: 80, background: LINE, borderRadius: 2}} /><Big size={58}>how it actually works</Big></Plate>
    </Band>
    <Band a={T.crores - 0.6} b={4.75}>
      <Plate tone={GREEN}><Logo src={L.mark} h={70} /><Big size={56}>crores of payments a day</Big></Plate>
    </Band>
    <Band a={T.google - 0.1} b={T.paise - 0.15}>
      <div style={{display: 'flex', gap: 30}}>
        <PopTile t0={T.google} src={L.gpay} w={420} h={270} pad={30} tone={GREEN} />
        <PopTile t0={T.phonepe} src={L.pp} w={420} h={270} pad={40} tone={SAFFRON} />
      </div>
    </Band>
    <Band a={T.paise} b={10.3}>
      <Plate tone={SAFFRON} pad="22px 36px">
        <Appear t0={T.bank1} from="scale" style={{position: 'relative'}}><Icon name="bank" size={110} color={DEEPSAF} /></Appear>
        <div style={{position: 'relative', width: 260, height: 110}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 53, height: 5, background: `repeating-linear-gradient(90deg, ${INK} 0 14px, transparent 14px 26px)`}} />
          <div style={{position: 'absolute', top: 28, left: lerp(0, 200, ((t - T.paise) * 0.7) % 1)}}><Icon name="currency-inr" size={56} color={GREEN} /></div>
          <div style={{position: 'absolute', left: 108, top: -46}}><Icon name="question" size={50} color={INK} /></div>
        </div>
        <Appear t0={T.bank2} from="scale" style={{position: 'relative'}}><Icon name="bank" size={110} color={GREEN} /></Appear>
      </Plate>
    </Band>
    <Band a={10.4} b={12.1}>
      <Plate tone={GREEN}><Logo src={L.mark} h={64} /><Big size={58}>let's break it down</Big></Plate>
    </Band>
  </>;
};
const Mid: React.FC = () => <>
  <Band a={61.5} b={64.7}><Plate tone={SAFFRON}><Icon name="question" size={76} color={DEEPSAF} /><Big size={64}>who runs UPI?</Big></Plate></Band>
  <Band a={85.7} b={87.5}><Plate tone={GREEN}><Icon name="gear" size={76} color={GREEN} /><Big size={60}>inside a UPI payment</Big></Plate></Band>
</>;
const Outro: React.FC = () => <Band a={166.5} b={END} top={1150}>
  <Plate tone={SAFFRON} pad="20px 34px"><Logo src={L.upi} h={92} /><div style={{width: 4, height: 80, background: LINE, borderRadius: 2}} /><Big size={58}>behind the scenes</Big></Plate>
  <div style={{display: 'flex', gap: 22, marginTop: 8}}>
    <PopTile t0={166.8} src={L.gpay} w={300} h={190} pad={22} tone={GREEN} />
    <PopTile t0={167.0} src={L.pp} w={300} h={190} pad={30} tone={SAFFRON} />
    <PopTile t0={167.2} src={L.npci} w={300} h={190} pad={26} tone={GREEN} />
  </div>
</Band>;

export const cfg: Config = {
  title: 'How payments actually move',
  logo: L.upi,
  logoH: 58,
  modes: [
    {a: 0, b: 12.2, m: 'talk'}, {a: 12.2, b: 61.4, m: 'card'}, {a: 61.4, b: 64.9, m: 'talk'}, {a: 64.9, b: 85.6, m: 'card'},
    {a: 85.6, b: 87.6, m: 'talk'}, {a: 87.6, b: 166.4, m: 'card'}, {a: 166.4, b: END + 1, m: 'talk'},
  ],
  face: {y0: 160, y1: 1040},
  overlays: [Intro, Mid, Outro],
  speaker: 'speaker.webm',
};

export const scenes: Scene[] = [
  {a: 12.2, b: 22.0, el: S1}, {a: 22.0, b: 41.8, el: S2}, {a: 41.8, b: 52.6, el: S3}, {a: 52.6, b: 61.4, el: S4},
  {a: 64.9, b: 75.3, el: S5}, {a: 75.3, b: 85.6, el: S6}, {a: 87.6, b: 102.0, el: S7}, {a: 102.0, b: 111.0, el: S8},
  {a: 111.0, b: 121.0, el: S9}, {a: 121.0, b: 132.5, el: S10}, {a: 132.5, b: 139.8, el: S11}, {a: 139.8, b: 155.9, el: S12},
  {a: 155.9, b: 166.4, el: S13},
];
