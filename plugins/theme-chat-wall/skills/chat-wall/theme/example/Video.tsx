// How WhatsApp delivers messages when you are offline. Theme: chat-wall. Not part of a series.
// Card scenes: 1000 x 840 (teal title bar takes the top 78 px). Icons: Phosphor duotone. Logo: public/logos/whatsapp.png.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Scene, clamp, lerp, ease, useT, Shake, springAt} from './core';
import {Config, Appear, Tag, Heading, Flow, Icon, Logo, Node, Bubble, Ticks, Phone, CARD, PANEL, LINE, INK, SUB, TEAL, DTEAL, GREEN, BUBBLE, BLUE, RED, AMBER, DISPLAY, SANS, MONO} from './theme/kit';
import data from './data.json';

const T = data.T as Record<string, number>;
const END = data.duration;
const WA = 'logos/whatsapp.png';

const Label: React.FC<{size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, color = INK, font = DISPLAY, w = 900, children, style}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.15, ...style}}>{children}</div>
);
const Chip: React.FC<{icon?: string; children: React.ReactNode; color?: string; size?: number; solid?: boolean}> = ({icon, children, color = TEAL, size = 28, solid}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 999, background: solid ? color : CARD, border: `3px solid ${color}`, boxShadow: '0 8px 20px rgba(11,20,26,.14)'}}>
    {icon && <Icon name={icon} size={size * 1.2} color={solid ? '#fff' : color} />}
    <span style={{fontFamily: SANS, fontWeight: 700, fontSize: size, color: solid ? '#fff' : INK, whiteSpace: 'nowrap'}}>{children}</span>
  </div>
);
const Server: React.FC<{w?: number; on?: boolean; sub?: string}> = ({w = 280, on = true, sub = 'store & forward'}) => <Node logo={WA} label="SERVER" sub={sub} w={w} tone="teal" on={on} />;
const Status: React.FC<{online: boolean; t0?: number}> = ({online}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: online ? '#DCF8E6' : '#FDE2E7', border: `2px solid ${online ? GREEN : RED}`}}>
    <Icon name={online ? 'wifi-high' : 'wifi-slash'} size={26} color={online ? '#0A8F3C' : RED} />
    <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: online ? '#0A8F3C' : RED}}>{online ? 'online' : 'offline'}</span>
  </div>
);
const Cross: React.FC<{t0: number; size?: number}> = ({t0, size = 70}) => {
  const t = useT(); const k = ease(t, t0, 0.25); if (k <= 0) return null;
  return <div style={{transform: `scale(${1.5 - 0.5 * k})`, opacity: k}}><Icon name="x-circle" size={size} color={RED} /></div>;
};
/** small bubble that slides along a path */
const Packet: React.FC<{t0: number; d?: number; x1: number; y1: number; x2: number; y2: number; text?: string; hide?: number}> = ({t0, d = 0.9, x1, y1, x2, y2, text = 'hi', hide = 999}) => {
  const t = useT(); if (t < t0 || t > hide) return null; const k = ease(t, t0, d);
  return <div style={{position: 'absolute', left: lerp(x1, x2, k), top: lerp(y1, y2, k), transform: 'translate(-50%, -50%)'}}><Bubble text={text} size={22} ticks={0} time="" /></div>;
};

// ------------------------------------------------------------------ 01 send: phone -> server
const S1: React.FC = () => {
  const t = useT(); const atServer = t > T.send;
  return <>
    <Heading t0={11.05} kicker="STEP 1 · SEND" title="Your 'hi' goes to the server" />
    <Appear t0={11.2} from="left" style={{left: 50, top: 230}}>
      <Phone w={280} h={560} title="Friend" status="last seen recently">
        {t > T.hi && <div style={{position: 'absolute', right: 18, top: 120}}><Bubble text="hi" size={26} ticks={atServer ? 1 : 0} time="10:42" /></div>}
        {t > T.hi && !atServer && <div style={{position: 'absolute', right: 22, top: 182}}><Icon name="clock" size={22} color={SUB} /></div>}
      </Phone>
    </Appear>
    <Flow x1={340} y1={500} x2={620} y2={430} t0={T.phone} n={2} />
    <Packet t0={T.phone} d={1.6} x1={360} y1={500} x2={620} y2={430} hide={T.send} />
    <Appear t0={T.server - 0.6} from="right" style={{left: 640, top: 320}}><Server /></Appear>
    <Appear t0={T.send + 0.1} from="up" style={{left: 600, top: 620}}><div style={{display: 'flex', alignItems: 'center', gap: 12}}><Ticks n={1} size={34} /><Label size={24} font={SANS} w={700}>sent to server</Label></div></Appear>
  </>;
};

// ------------------------------------------------------------------ 02 friend offline
const S2: React.FC = () => {
  const t = useT();
  return <>
    <Heading t0={17.05} kicker="THE PROBLEM" title="Your friend is offline" />
    <Appear t0={17.1} from="left" style={{left: 40, top: 330}}><Server /></Appear>
    <Appear t0={T.offline - 0.2} from="right" style={{left: 660, top: 220}}>
      <div style={{position: 'relative'}}>
        <Phone w={280} h={540} title="Friend" status="offline" dim />
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}><Status online={false} /></div>
      </div>
    </Appear>
    <Flow x1={325} y1={450} x2={655} y2={450} t0={T.immediately - 0.2} n={2} broken={T.deliver} />
    <Appear t0={T.deliver} from="scale" style={{left: 455, top: 412}}><Cross t0={T.deliver} size={76} /></Appear>
    <Appear t0={T.deliver + 0.2} from="up" style={{left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}><Chip icon="warning" color={RED} size={26}>can't deliver right now</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 03 store temporarily
const S3: React.FC = () => {
  const t = useT(); const k = ease(t, T.store - 0.4, 0.8);
  return <>
    <Heading t0={22.05} kicker="STEP 2 · STORE" title="The server holds it" />
    <Appear t0={22.2} from="up" style={{left: 140, top: 210}}>
      <div style={{width: 720, height: 420, borderRadius: 26, background: CARD, border: `3px solid ${TEAL}`, boxShadow: `0 14px 30px ${TEAL}33`, position: 'relative'}}>
        <div style={{position: 'absolute', left: 24, top: 20, display: 'flex', alignItems: 'center', gap: 14}}><Logo src={WA} h={52} /><Label size={30}>WHATSAPP SERVER</Label></div>
        <div style={{position: 'absolute', left: 40, right: 40, bottom: 34, height: 200, borderRadius: 20, background: PANEL, border: `3px dashed ${TEAL}`}}>
          <div style={{position: 'absolute', left: 20, top: 14, display: 'flex', alignItems: 'center', gap: 10}}><Icon name="database" size={34} color={TEAL} /><Label size={20} font={MONO} w={700} color={TEAL}>PENDING · for friend</Label></div>
          {[0, 1].map(i => <div key={i} style={{position: 'absolute', left: 30 + i * 150, top: 80, opacity: 0.45}}><Bubble text={['ok', 'see you'][i]} size={20} time="" /></div>)}
          {t > T.temporarily - 0.2 && <div style={{position: 'absolute', left: 340, top: lerp(-180, 80, k)}}><Bubble text="hi" size={24} time="10:42" ticks={1} /></div>}
        </div>
      </div>
    </Appear>
    <Appear t0={T.temporarily} from="scale" style={{left: 610, top: 200}}><Tag size={22} solid color={TEAL}>temporarily stored</Tag></Appear>
    <Appear t0={T.recipient} from="up" style={{left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}><Chip icon="hourglass" size={26}>until the recipient comes online</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 04 no constant polling
const S4: React.FC = () => {
  const t = useT(); const calls = [T.continuously, T.call, T.ol1, T.ol2];
  const stop = T.ol2 + 0.5;
  return <>
    <Heading t0={28.05} kicker="MYTH" title="No 'are you online?' loop" />
    <Appear t0={28.1} from="left" style={{left: 40, top: 300}}><Server w={260} /></Appear>
    <Appear t0={28.2} from="right" style={{left: 700, top: 240}}>
      <div style={{position: 'relative'}}><Phone w={250} h={460} title="Friend" status="offline" dim /></div>
    </Appear>
    {calls.map((c, i) => {
      if (t < c) return null; const k = ease(t, c, 0.6);
      return <div key={i} style={{position: 'absolute', left: lerp(330, 470 + (i % 2) * 50, k), top: 220 + i * 70, opacity: t > stop ? 0.25 : 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, background: CARD, borderRadius: 16, padding: '6px 14px', boxShadow: '0 4px 10px rgba(0,0,0,.12)'}}><Icon name="phone-call" size={28} color={AMBER} /><Label size={20} font={SANS} w={700}>online?</Label></div>
      </div>;
    })}
    <Appear t0={stop} from="scale" style={{left: 420, top: 300}}><Cross t0={stop} size={110} /></Appear>
    <Appear t0={T.side - 0.2} from="up" style={{left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', gap: 14}}>
      <Chip icon="database" size={24}>waits on the server</Chip>{t > T.available && <Chip icon="check-circle" color="#0A8F3C" size={24}>ready to deliver</Chip>}
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 05 reconnect and push
const S5: React.FC = () => {
  const t = useT(); const on = t > T.reconnect;
  return <>
    <Heading t0={36.85} kicker="STEP 3 · RECONNECT" title="Friend comes back online" />
    <Appear t0={36.9} from="left" style={{left: 40, top: 320}}><Server sub={t > T.pending ? '1 pending message' : 'store & forward'} /></Appear>
    <Appear t0={37.0} from="right" style={{left: 660, top: 210}}>
      <div style={{position: 'relative'}}>
        <Phone w={290} h={560} title="Friend" status={on ? 'online' : 'offline'} online={on} dim={!on}>
          {t > T.deliver2 + 0.5 && <div style={{position: 'absolute', left: 18, top: 130, opacity: ease(t, T.deliver2 + 0.5, 0.3)}}><Bubble text="hi" out={false} size={26} time="10:42" /></div>}
        </Phone>
        <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center'}}><Status online={on} /></div>
      </div>
    </Appear>
    {t > T.connect && <Flow x1={655} y1={470} x2={325} y2={470} t0={T.connect} n={2} color={BLUE} />}
    <Appear t0={T.connect} from="scale" style={{left: 400, top: 380}}><Tag size={20} color={BLUE}>connects to server</Tag></Appear>
    <Packet t0={T.pending} d={1.0} x1={330} y1={560} x2={650} y2={560} hide={T.deliver2 + 0.6} />
    <Appear t0={T.deliver2} from="up" style={{left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center'}}><Chip icon="paper-plane-tilt" color="#0A8F3C" size={26}>pending message delivered</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 06 acknowledgement and ticks
const S6: React.FC = () => {
  const t = useT(); const two = t > T.change;
  return <>
    <Heading t0={42.55} kicker="STEP 4 · ACKNOWLEDGE" title="Why your ticks change" />
    <Appear t0={42.6} from="left" style={{left: 30, top: 220}}>
      <Phone w={260} h={500} title="Friend" status="online" online>
        <div style={{position: 'absolute', right: 14, top: 120}}><Bubble text="hi" size={24} ticks={two ? 2 : 1} time="10:42" /></div>
      </Phone>
      <Label size={20} font={MONO} w={700} color={SUB} style={{textAlign: 'center', marginTop: 8}}>YOU (sender)</Label>
    </Appear>
    <Appear t0={42.7} from="up" style={{left: 380, top: 330}}><Server w={240} sub="" /></Appear>
    <Appear t0={42.8} from="right" style={{left: 710, top: 220}}>
      <Phone w={260} h={500} title="You" status="online" online>
        <div style={{position: 'absolute', left: 14, top: 120}}><Bubble text="hi" out={false} size={24} time="10:43" /></div>
      </Phone>
      <Label size={20} font={MONO} w={700} color={SUB} style={{textAlign: 'center', marginTop: 8}}>FRIEND</Label>
    </Appear>
    <Flow x1={705} y1={420} x2={625} y2={420} t0={T.ack} n={2} color={BLUE} />
    <Appear t0={T.ack} from="scale" style={{left: 620, top: 300}}><Tag size={20} solid color={BLUE}>ACK</Tag></Appear>
    <Flow x1={375} y1={420} x2={295} y2={420} t0={T.update - 0.2} n={2} color={BLUE} />
    <Appear t0={T.update} from="scale" style={{left: 290, top: 300}}><Tag size={20} color={BLUE}>status update</Tag></Appear>
    <Appear t0={T.ticks - 0.2} from="up" style={{left: 0, right: 0, top: 765, display: 'flex', justifyContent: 'center', gap: 30}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Ticks n={1} size={32} /><Label size={22} font={SANS} w={700}>sent</Label></div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Ticks n={2} size={32} /><Label size={22} font={SANS} w={700}>delivered</Label></div>
    </Appear>
  </>;
};

// ------------------------------------------------------------------ 07 unreliable network, retry
const S7: React.FC = () => {
  const t = useT(); const broke = t > T.break; const retry = t > T.attempt - 0.3;
  return <>
    <Heading t0={50.35} kicker="REAL WORLD" title="Networks are unreliable" />
    <Appear t0={50.4} from="left" style={{left: 40, top: 320}}><Server /></Appear>
    <Appear t0={50.5} from="right" style={{left: 680, top: 230}}><Phone w={260} h={500} title="Friend" status={broke && !retry ? 'connecting...' : 'online'} online={!broke || retry} /></Appear>
    {!retry && <Flow x1={325} y1={460} x2={675} y2={460} t0={T.unreliable + 1.0} n={2} broken={T.break} />}
    {broke && !retry && <div style={{position: 'absolute', left: 462, top: 420}}><Shake t0={T.break} d={0.5} amp={8}><Icon name="link-break" size={80} color={RED} /></Shake></div>}
    <Appear t0={T.dstatus} t1={T.attempt - 0.35} from="up" style={{left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}><Chip icon="hourglass" color={AMBER} size={26}>delivery status: not confirmed</Chip></Appear>
    {retry && <Flow x1={325} y1={460} x2={675} y2={460} t0={T.attempt - 0.3} n={3} color={GREEN} />}
    <Appear t0={T.attempt - 0.3} from="up" style={{left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}><Chip icon="arrows-clockwise" color="#0A8F3C" size={26}>delivery attempt #2</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 08 ack + duplicate handling
const S8: React.FC = () => {
  const t = useT(); const dropped = t > T.handling;
  return <>
    <Heading t0={59.65} kicker="RELIABILITY" title="ACKs and no duplicates" />
    <Appear t0={59.7} from="left" style={{left: 40, top: 200}}>
      <Phone w={300} h={600} title="You" status="online" online>
        <div style={{position: 'absolute', left: 14, top: 120}}><Bubble text="hi" out={false} size={24} time="10:43" /></div>
        {t > T.duplicate && <div style={{position: 'absolute', left: 14, top: 200, opacity: dropped ? 1 - ease(t, T.handling + 0.4, 0.5) : 1, transform: `translateX(${dropped ? ease(t, T.handling + 0.4, 0.5) * -60 : 0}px)`}}><Bubble text="hi" out={false} size={24} time="10:43" /></div>}
      </Phone>
    </Appear>
    <Appear t0={T.ack2} from="right" style={{left: 400, top: 210}}>
      <div style={{width: 560, borderRadius: 22, background: CARD, border: `3px solid ${LINE}`, padding: '18px 22px', boxSizing: 'border-box', boxShadow: '0 8px 20px rgba(0,0,0,.10)'}}>
        <Label size={20} font={MONO} w={700} color={TEAL}>INCOMING ON PHONE</Label>
        {[0, 1].map(i => {
          const show = i === 0 || t > T.duplicate; const dup = i === 1 && dropped;
          return show && <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, padding: '10px 14px', borderRadius: 14, background: dup ? '#FDE2E7' : PANEL}}>
            <Icon name="chat-text" size={30} color={dup ? RED : TEAL} /><Label size={22} font={MONO} w={700}>msg id 7f3a</Label><div style={{flex: 1}} />
            {i === 0 ? <Tag size={18} color="#0A8F3C" solid>shown</Tag> : dropped ? <Tag size={18} color={RED} solid>duplicate · dropped</Tag> : <Tag size={18} color={AMBER}>retry copy</Tag>}
          </div>;
        })}
      </div>
    </Appear>
    <Appear t0={T.ack2 + 0.2} from="up" style={{left: 400, top: 520}}><Chip icon="seal-check" color={BLUE} size={24}>ACK confirms delivery</Chip></Appear>
    <Appear t0={T.reliable - 0.3} from="up" style={{left: 400, top: 620}}><Chip icon="shield-check" color="#0A8F3C" solid size={24}>reliable despite failures</Chip></Appear>
  </>;
};

// ------------------------------------------------------------------ 09 summary
const S9: React.FC = () => {
  const t = useT();
  const steps: [string, string, string, number][] = [['database', 'STORE', 'server keeps it', T.store2], ['hourglass', 'WAIT', 'for reconnect', T.reconnect2], ['paper-plane-tilt', 'DELIVER', 'then ACK', T.delivery]];
  return <>
    <Heading t0={72.35} kicker="BEHIND EVERY MESSAGE" title="Messaging infrastructure" />
    {steps.map(([ic, l, s, t0], i) => <Appear key={i} t0={t0 - 0.3} from="up" style={{left: 40 + i * 320, top: 260}}>
      <Node icon={ic} label={l} sub={s} w={280} tone={i === 2 ? 'green' : 'teal'} on={t > t0} />
    </Appear>)}
    {[0, 1].map(i => <Flow key={i} x1={322 + i * 320} y1={370} x2={358 + i * 320} y2={370} t0={steps[i + 1][3] - 0.3} n={1} />)}
    <Appear t0={T.complete - 0.3} from="up" style={{left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
      <Bubble text="hi" size={40} ticks={2} read={t > T.complete + 0.3} time="10:42" />
    </Appear>
  </>;
};

// ------------------------------------------------------------------ talk-mode overlays (speaker full screen, cut out on the wallpaper)
const Band: React.FC<{a: number; b: number; children: React.ReactNode; top?: number}> = ({a, b, children, top = 1170}) => {
  const t = useT(); if (t < a - 0.05 || t > b + 0.3) return null;
  const k = ease(t, a, 0.4) * clamp((b + 0.25 - t) / 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{children}</div>;
};
const Plate: React.FC<{children: React.ReactNode; pad?: string}> = ({children, pad = '18px 30px'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: pad, borderRadius: 28, background: CARD, boxShadow: '0 16px 36px rgba(11,20,26,.25)', borderBottom: `6px solid ${GREEN}`}}>{children}</div>
);
const Big: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 60, color = INK, children}) => (
  <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.05}}>{children}</span>
);
const PopIn: React.FC<{t0: number; children: React.ReactNode}> = ({t0, children}) => {
  const f = useCurrentFrame(); if (f / 30 < t0 - 0.05) return null;
  const p = springAt(f, t0, {damping: 9, stiffness: 170, mass: 0.8});
  return <div style={{transform: `scale(${0.2 + 0.8 * p})`, opacity: clamp(p * 2)}}>{children}</div>;
};
const Intro: React.FC = () => {
  const t = useT();
  return <>
    <Band a={0} b={2.55}><Plate><Logo src={WA} h={92} /><Big size={56}>When your friend is offline</Big></Plate></Band>
    <Band a={T.tumne} b={7.3}>
      <PopIn t0={T.bheja - 0.3}><Bubble text="hi! free tonight?" size={46} ticks={t > T.bheja + 0.3 ? 1 : 0} time="10:42" /></PopIn>
      <div style={{display: 'flex', gap: 16}}>
        <PopIn t0={T.internet}><Plate pad="10px 22px"><Icon name="user" size={44} color={SUB} /><Big size={34}>Friend</Big><Status online={false} /></Plate></PopIn>
      </div>
      <PopIn t0={T.kahan - 0.3}><Plate pad="10px 26px"><Icon name="chat-circle-dots" size={46} color={TEAL} /><Big size={40}>where does it wait?</Big></Plate></PopIn>
    </Band>
    <Band a={7.4} b={10.9}>
      <PopIn t0={T.online - 0.2}><Plate pad="10px 22px"><Icon name="user" size={44} color={SUB} /><Big size={34}>Friend</Big><Status online /></Plate></PopIn>
      <PopIn t0={T.deliver0 - 0.3}><Bubble text="hi! free tonight?" size={46} ticks={t > T.deliver0 ? 2 : 1} time="10:42" /></PopIn>
      <PopIn t0={T.deliver0 + 0.2}><Plate pad="10px 26px"><Icon name="lightning" size={44} color="#0A8F3C" /><Big size={38}>delivered automatically</Big></Plate></PopIn>
    </Band>
  </>;
};
const Mid: React.FC = () => {
  const t = useT();
  return <Band a={66.4} b={72.2}>
    <PopIn t0={T.nexttime}><Plate pad="12px 26px"><Icon name="user" size={44} color={SUB} /><Big size={34}>Friend</Big><Status online={false} /></Plate></PopIn>
    {t > T.sirf - 0.3 && <PopIn t0={T.sirf - 0.3}><Plate>
      <Icon name="device-mobile" size={64} color={INK} /><Icon name="arrow-clockwise" size={0} />
      <Big size={44} color={SUB}>{'->'}</Big><Logo src={WA} h={64} /><Big size={44} color={SUB}>{'->'}</Big>
      <Icon name="device-mobile" size={64} color={INK} />
    </Plate></PopIn>}
    {t > T.sirf + 0.3 && <PopIn t0={T.sirf + 0.3}><Plate pad="10px 26px"><Big size={40}>not just phone to phone</Big></Plate></PopIn>}
  </Band>;
};

export const cfg: Config = {
  title: 'Offline message delivery',
  logo: WA,
  modes: [
    {a: 0, b: 11.0, m: 'talk'}, {a: 11.0, b: 66.3, m: 'card'}, {a: 66.3, b: 72.3, m: 'talk'}, {a: 72.3, b: END + 1, m: 'card'},
  ],
  face: {y0: 120, y1: 1000},
  overlays: [Intro, Mid],
  speaker: 'speaker.webm',
};

export const scenes: Scene[] = [
  {a: 11.0, b: 17.0, el: S1}, {a: 17.0, b: 22.0, el: S2}, {a: 22.0, b: 28.0, el: S3}, {a: 28.0, b: 36.8, el: S4},
  {a: 36.8, b: 42.5, el: S5}, {a: 42.5, b: 50.3, el: S6}, {a: 50.3, b: 59.6, el: S7}, {a: 59.6, b: 66.3, el: S8},
  {a: 72.3, b: END + 1, el: S9},
];
