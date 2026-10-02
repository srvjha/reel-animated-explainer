// Theme-agnostic helpers shared by every theme and every Video.tsx.
import React from 'react';
import {useCurrentFrame, spring, Easing} from 'remotion';

export const FPS = 30;
export type Word = {w: string; t: number; e: number; k: boolean};
export type Page = {s: number; e: number; words: Word[]; lines: Word[][]};
export type Data = {duration: number; T: Record<string, number>; pages: Page[]};
/** One visual beat. a/b are seconds. The theme's Frame decides how scenes enter and leave. */
export type Scene = {a: number; b: number; el: React.FC};

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0 -> 1 ease-out starting at t0 over d seconds */
export const ease = (t: number, t0: number, d = 0.4) => Easing.out(Easing.cubic)(clamp((t - t0) / d));
/** 0 -> 1 ease-in-out */
export const eio = (t: number, t0: number, d = 0.5) => Easing.inOut(Easing.cubic)(clamp((t - t0) / d));
/** 1 inside [a, b] with fades */
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * clamp((b - t) / fo);
export const useT = () => useCurrentFrame() / FPS;
export type SpringCfg = {damping: number; stiffness: number; mass?: number};
/** spring that starts at t0 seconds */
export const springAt = (frame: number, t0: number, config: SpringCfg) => spring({frame: frame - Math.round(t0 * FPS), fps: FPS, config});

export const Typed: React.FC<{t0: number; text: string; cps?: number; caret?: string; caretColor?: string}> = ({t0, text, cps = 24, caret, caretColor}) => {
  const t = useT(); const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps)));
  const on = caret && t > t0 && n < text.length && Math.floor(t * 4) % 2 === 0;
  return <span>{text.slice(0, n)}{caret && <span style={{opacity: on ? 1 : 0, color: caretColor}}>{caret}</span>}</span>;
};

export const Counter: React.FC<{t0: number; from: number; to: number; d?: number; fmt?: (n: number) => string; style?: React.CSSProperties}> = ({t0, from, to, d = 0.8, fmt = n => String(Math.round(n)), style}) => {
  const t = useT(); return <span style={style}>{fmt(lerp(from, to, ease(t, t0, d)))}</span>;
};

export const Shake: React.FC<{t0: number; d?: number; amp?: number; children: React.ReactNode}> = ({t0, d = 0.5, amp = 10, children}) => {
  const t = useT(); const k = t > t0 && t < t0 + d ? 1 - (t - t0) / d : 0;
  return <div style={{transform: `translate(${Math.sin(t * 80) * amp * k}px, ${Math.cos(t * 67) * amp * 0.5 * k}px)`}}>{children}</div>;
};

/** zoom punches: [start, end, amount]; the zoom eases in at start and out after end */
export const punchZoom = (t: number, base: number, rampTo: number, punches: [number, number, number][]) => {
  let z = 1 + base * clamp(t / rampTo);
  for (const [a, b, amt] of punches) z += amt * ease(t, a, 0.2) * clamp((b + 0.4 - t) / 0.4);
  return z;
};
