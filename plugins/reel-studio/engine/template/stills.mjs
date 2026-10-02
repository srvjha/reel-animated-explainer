// node stills.mjs 1.5 7 22.4 ...  -> stills/s_<t>.png at quarter scale (use for previews)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const times = process.argv.slice(2).map(Number);
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const scale = Number(process.env.STILL_SCALE || 0.25);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Main', browserExecutable});
for (const t of times) {
  await renderStill({composition: comp, serveUrl, output: `stills/s_${t}.png`, frame: Math.min(comp.durationInFrames - 1, Math.round(t * 30)), browserExecutable, scale});
}
console.log('done');
