// EXAMPLE: "What is an IP address?" (70.6 s). Copy to src/Video.tsx and replace the scenes.
// Every scene is a component in the 1020 x 560 card box; time things with T.<mark> from marks.txt.
import React from 'react';
import {Easing} from 'remotion';
import {Scene, Typed, clamp, lerp, ease, useT} from './core';
import {Config, Appear, Tag, Laptop, Phone, TV, Router, Server, Cloud, Envelope, Flap, YEL, INK, GREEN, SYNE, SORA, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;

export const cfg: Config = {
  title: 'What is an IP address?',
  titleWindows: [[0, 13.0], [62.4, 999]],
  punches: [[T.yahin - 0.1, 0.07], [T.ip192 - 0.2, 0.07], [T.distinction - 0.2, 0.07], [T.simple - 0.2, 0.06]],
};

const C0: React.FC = () => (<>
  <Appear t0={0.25} from="scale" style={{left: 360, top: 120}}><Envelope w={300} to="???" /></Appear>
  <Appear t0={T.address0 - 0.1} style={{left: 690, top: 140}}><span style={{fontFamily: SYNE, fontWeight: 800, fontSize: 150, color: INK}}>?</span></Appear>
</>);
const C1: React.FC = () => {
  const t = useT();
  return <>
    <svg width={560} height={420} style={{position: 'absolute', left: 30, top: 90}}>
      <polyline points="20,160 280,20 540,160" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" strokeDasharray={900} strokeDashoffset={900 * (1 - ease(t, T.socho - 0.1, 0.8))} />
      <rect x={50} y={150} width={460} height={250} fill="none" stroke={INK} strokeWidth={8} strokeDasharray={1500} strokeDashoffset={1500 * (1 - ease(t, T.socho + 0.2, 0.8))} rx={10} />
    </svg>
    <div style={{position: 'absolute', left: 60, top: 64, fontFamily: MONO, fontSize: 24, color: INK, opacity: ease(t, T.socho, 0.5)}}>tumhara ghar</div>
    <Appear t0={T.phone - 0.1} style={{left: 110, top: 300}}><Phone s={0.9} label="phone" /></Appear>
    <Appear t0={T.laptop - 0.1} style={{left: 230, top: 320}}><Laptop s={0.9} label="laptop" /></Appear>
    <Appear t0={T.tv - 0.1} style={{left: 390, top: 316}}><TV s={0.85} label="smart TV" /></Appear>
    <Appear t0={T.devices - 0.2} style={{left: 250, top: 200}}><Router s={0.8} /></Appear>
    <svg width={1020} height={560} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}><line x1={430} y1={260} x2={430 + 300 * ease(t, T.internet - 0.2, 0.5)} y2={260 - 80 * ease(t, T.internet - 0.2, 0.5)} stroke={INK} strokeWidth={6} strokeDasharray="14 10" /></svg>
    <Appear t0={T.internet - 0.1} from="right" style={{left: 760, top: 90}}><Cloud /></Appear>
  </>;
};
const C2: React.FC = () => {
  const t = useT(); const ph = ((t - T.communicate) * 0.7) % 1; const named = t > T.yahin - 0.1;
  return <>
    <Appear t0={T.server - 0.5} from="left" style={{left: 40, top: 150}}><Laptop label="tumhara laptop" /></Appear>
    <Appear t0={T.server - 0.1} from="right" style={{left: 830, top: 120}}><Server label="server" /></Appear>
    <svg width={1020} height={560} style={{position: 'absolute', left: 0, top: 0}}><line x1={220} y1={210} x2={810} y2={210} stroke={INK} strokeWidth={6} strokeDasharray="14 10" opacity={ease(t, T.server, 0.4)} /></svg>
    {t > T.communicate - 0.1 && <div style={{position: 'absolute', left: lerp(230, 690, ph), top: 160}}><Envelope w={120} /></div>}
    <Appear t0={T.identify - 0.1} style={{left: 40, top: 380}}><Tag size={30} bg={named ? GREEN : '#fff'}>FROM: {named ? '192.168.1.10' : '???'}</Tag></Appear>
    <Appear t0={T.kahan2 - 0.1} style={{left: 520, top: 380}}><Tag size={30} bg={named ? GREEN : '#fff'}>TO: {named ? '142.250.183.14' : '???'}</Tag></Appear>
    <Appear t0={T.yahin} from="scale" style={{left: 0, right: 0, top: 470, textAlign: 'center'}}><Tag size={30} bg={INK} c={YEL}>IP address</Tag></Appear>
  </>;
};
const C3: React.FC = () => {
  const t = useT();
  return <>
    <div style={{position: 'absolute', left: 50, top: 50, fontFamily: SYNE, fontWeight: 800, color: INK, fontSize: 100, lineHeight: 1}}>
      <span style={{background: INK, color: YEL, padding: '0 10px'}}>I</span>{t > T.internet2 - 0.1 ? <Typed t0={T.internet2 - 0.1} text="nternet" cps={20} /> : ''}{' '}
      <span style={{background: INK, color: YEL, padding: '0 10px'}}>P</span>{t > T.protocol - 0.1 ? <Typed t0={T.protocol - 0.1} text="rotocol" cps={20} /> : ''}
    </div>
    <Appear t0={T.numerical - 0.2} from="left" style={{left: 60, top: 300}}><Laptop s={1.1} /></Appear>
    <Appear t0={T.numerical - 0.1} style={{left: 260, top: 320}}><Tag size={40} bg={YEL}>192.168.1.10</Tag></Appear>
    <Appear t0={T.interface - 0.2} style={{left: 260, top: 420}}><span style={{fontFamily: SORA, fontWeight: 800, fontSize: 34, color: INK}}>&rarr; identifies this device</span></Appear>
  </>;
};
const C4: React.FC = () => {
  const t = useT();
  return <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}><Flap text="192.168.1.10" t0={T.ip192 - 0.25} size={84} /></div>
    <Appear t0={T.ipv4a - 0.2} style={{left: 0, right: 0, top: 250, textAlign: 'center'}}>
      <div style={{display: 'inline-flex', gap: 22}}>{['192', '168', '1', '10'].map((o, i) => <Tag key={i} size={28} bg={'#fff'}>0 - 255</Tag>)}</div>
    </Appear>
    <Appear t0={T.ipv4a} from="scale" style={{left: 0, right: 0, top: 360, textAlign: 'center'}}><span style={{fontFamily: SYNE, fontWeight: 800, fontSize: 86, color: INK}}>IPv4</span><span style={{fontFamily: SORA, fontWeight: 600, fontSize: 32, color: INK, marginLeft: 20}}>= 4 numbers</span></Appear>
  </>;
};
const HOPS = [{x: 30, el: <Laptop s={0.75} label="you" />}, {x: 230, el: <Router s={0.75} label="router" />}, {x: 440, el: <Router s={0.75} label="ISP" />}, {x: 650, el: <Router s={0.75} label="..." />}, {x: 850, el: <Server s={0.85} label="website" />}];
const C5: React.FC = () => {
  const t = useT(); const p = clamp((t - T.request) / (T.destination1 + 0.6 - T.request));
  const seg = p * 4; const i = Math.min(3, Math.floor(seg)); const k = Easing.inOut(Easing.cubic)(seg - i);
  const xs = HOPS.map(h => h.x + 70); const routing = t > T.routing - 0.2;
  const p2 = clamp((t - T.packets) / (T.forward + 0.6 - T.packets)); const seg2 = p2 * 4; const i2 = Math.min(3, Math.floor(seg2)); const k2 = Easing.inOut(Easing.cubic)(seg2 - i2);
  const px = routing ? lerp(xs[i2], xs[i2 + 1], k2) : lerp(xs[i], xs[i + 1], k);
  return <>
    <svg width={1020} height={560} style={{position: 'absolute', left: 0, top: 0}}><line x1={100} y1={300} x2={920} y2={300} stroke={INK} strokeWidth={6} strokeDasharray="14 10" opacity={ease(t, T.website - 0.4, 0.5)} /></svg>
    {HOPS.map((h, j) => <Appear key={j} t0={T.website - 0.4 + j * 0.1} style={{left: h.x, top: 210}}><div style={{transform: `scale(${(routing ? i2 : i) === j || (routing ? i2 : i) + 1 === j ? 1.08 : 1})`}}>{h.el}</div></Appear>)}
    {t > T.request - 0.1 && <div style={{position: 'absolute', left: px - 55, top: 120}}><Envelope w={110} /></div>}
    {t > T.request - 0.1 && <div style={{position: 'absolute', left: Math.min(px - 130, 1000 - 260), top: 50, width: 260, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: INK}}>dst 142.250.183.14</div>}
    <Appear t0={T.routing - 0.1} style={{left: 0, right: 0, top: 450, textAlign: 'center'}}><Tag size={30} bg={INK} c={YEL}>each router reads the IP &rarr; forwards</Tag></Appear>
  </>;
};
const C6: React.FC = () => {
  const t = useT();
  return <>
    <div style={{position: 'absolute', left: 30, top: 60, width: 470, height: 440, border: `5px dashed ${INK}`, borderRadius: 24, opacity: ease(t, T.distinction - 0.3, 0.4)}} />
    <div style={{position: 'absolute', left: 54, top: 74, fontFamily: MONO, fontSize: 24, color: INK, opacity: ease(t, T.distinction - 0.2, 0.4)}}>LOCAL NETWORK</div>
    <Appear t0={T.laptop2 - 0.2} style={{left: 70, top: 130}}><Laptop s={0.8} /></Appear>
    <Appear t0={T.private - 0.1} style={{left: 230, top: 160}}><Tag size={26} bg={'#fff'}>192.168.1.10</Tag></Appear>
    <Appear t0={T.local - 0.2} style={{left: 90, top: 300}}><Phone s={0.75} /></Appear>
    <Appear t0={T.local - 0.1} style={{left: 230, top: 330}}><Tag size={26} bg={'#fff'}>192.168.1.11</Tag></Appear>
    <Appear t0={T.private - 0.2} from="scale" style={{left: 150, top: 430}}><Tag size={28} bg={INK} c={YEL}>PRIVATE IP</Tag></Appear>
    <Appear t0={T.public - 0.2} style={{left: 520, top: 170}}><Router s={0.85} hot label="router" /></Appear>
    <Appear t0={T.public} from="scale" style={{left: 520, top: 360}}><Tag size={28} bg={GREEN}>49.36.22.7</Tag></Appear>
    <Appear t0={T.public + 0.2} from="scale" style={{left: 540, top: 430}}><Tag size={28} bg={INK} c={YEL}>PUBLIC IP</Tag></Appear>
    <svg width={1020} height={560} style={{position: 'absolute', left: 0, top: 0}}><line x1={680} y1={250} x2={680 + 120 * ease(t, T.internet3 - 0.3, 0.4)} y2={250 - 60 * ease(t, T.internet3 - 0.3, 0.4)} stroke={INK} strokeWidth={6} strokeDasharray="14 10" /></svg>
    <Appear t0={T.internet3 - 0.2} from="right" style={{left: 790, top: 90}}><Cloud /></Appear>
  </>;
};
const C7: React.FC = () => {
  const t = useT(); const big = ease(t, T.larger - 0.2, 1.0);
  return <>
    <Appear t0={T.ipv4b - 0.2} from="left" style={{left: 40, top: 60}}>
      <div style={{fontFamily: SYNE, fontWeight: 800, fontSize: 64, color: INK}}>IPv4</div>
      <div style={{fontFamily: MONO, fontSize: 34, color: INK}}>192.168.1.10</div>
    </Appear>
    <Appear t0={T.ipv6a - 0.2} from="left" style={{left: 40, top: 240}}>
      <div style={{fontFamily: SYNE, fontWeight: 800, fontSize: 64, color: INK}}>IPv6</div>
      <div style={{fontFamily: MONO, fontSize: 31, color: INK}}>2001:0db8:85a3::8a2e:0370:7334</div>
    </Appear>
    <Appear t0={T.larger - 0.3} style={{left: 40, top: 430, width: 940}}>
      <div style={{fontFamily: MONO, fontSize: 22, color: INK}}>address space</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 6}}><div style={{width: 18, height: 30, background: INK}} /><span style={{fontFamily: MONO, fontSize: 24}}>IPv4 &asymp; 4.3 billion</span></div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 8}}><div style={{width: lerp(18, 560, big), height: 30, background: GREEN, border: `3px solid ${INK}`}} /><span style={{fontFamily: MONO, fontSize: 24, whiteSpace: 'nowrap'}}>IPv6 &asymp; 3.4 &times; 10&sup3;&#8312;</span></div>
    </Appear>
  </>;
};
const C8: React.FC = () => (<>
  <Appear t0={T.simple - 0.2} from="scale" style={{left: 60, top: 70}}><Envelope w={420} from="192.168.1.10" to="142.250.183.14" /></Appear>
  <Appear t0={T.addressing - 0.2} style={{left: 540, top: 90}}><span style={{fontFamily: SYNE, fontWeight: 800, fontSize: 44, color: INK, lineHeight: 1.05}}>addressing<br />information</span></Appear>
  <Appear t0={T.identify3 - 0.2} from="scale" style={{left: 540, top: 290}}><Tag size={34} bg={INK} c={YEL}>&#10003; identify</Tag></Appear>
  <Appear t0={T.route - 0.2} from="scale" style={{left: 540, top: 390}}><Tag size={34} bg={GREEN}>&#10003; route</Tag></Appear>
</>);
export const scenes: Scene[] = [
  {a: 0, b: 2.0, el: C0}, {a: 2.0, b: 7.1, el: C1}, {a: 7.1, b: 14.0, el: C2}, {a: 14.0, b: 24.3, el: C3}, {a: 24.3, b: 31.2, el: C4},
  {a: 31.2, b: 43.0, el: C5}, {a: 43.0, b: 55.9, el: C6}, {a: 55.9, b: 62.4, el: C7}, {a: 62.4, b: 71, el: C8}];
