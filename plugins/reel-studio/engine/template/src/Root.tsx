// Fixed entry point. Do not edit per video: edit src/Video.tsx instead.
import React from 'react';
import {Composition, delayRender, continueRender} from 'remotion';
import {Frame} from './theme/kit';
import {cfg, scenes} from './Video';
import data from './data.json';
import {FPS} from './core';

const Main: React.FC = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => { (document as any).fonts.ready.then(() => continueRender(h)); }, [h]);
  return <Frame data={data as any} cfg={cfg as any} scenes={scenes} />;
};

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={Math.round((data as any).duration * FPS)} fps={FPS} width={1080} height={1920} />
);
