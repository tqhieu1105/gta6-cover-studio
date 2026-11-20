import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { root, withChrome } from './chrome.mjs';

const frames = JSON.parse(await readFile(join(root, 'shots.json'), 'utf8'));
const output = process.argv[2] ? resolve(process.argv[2]) : join(root, 'screenshots');
const byteCap = 256 * 1024;
const captures = [];

assert.ok(frames.length >= 3 && frames.length <= 4, 'Use three or four screenshots');
assert.ok(!frames[0].editor && frames[0].format === 'landscape', 'Start the dossier with the wide export');

await withChrome(async ({ call, evaluate, viewport, open }) => {
  for (const frame of frames) {
    const [width, height] = frame.viewport;
    assert.match(frame.name, /^[A-Za-z0-9][A-Za-z0-9._-]+\.jpg$/);
    assert.ok(Math.max(width, height) <= 1280 && Math.min(width, height) >= 480);
    await viewport(width, height);
    await open({ shot: '1', format: frame.format, ...frame.look });
    let buffer;
    for (const quality of [92, 87, 81, 75, 68, 60]) {
      if (frame.editor) {
        const reply = await call('Page.captureScreenshot', { format: 'jpeg', quality, captureBeyondViewport: false });
        buffer = Buffer.from(reply.data, 'base64');
      } else {
        const encoded = await evaluate(`(() => {
          const exported = window.coverStudio.exportCanvas(${JSON.stringify(frame.format)});
          const reduced = document.createElement('canvas');
          reduced.width = ${width};
          reduced.height = ${height};
          const ctx = reduced.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(exported, 0, 0, reduced.width, reduced.height);
          return reduced.toDataURL('image/jpeg', ${quality / 100}).split(',')[1];
        })()`);
        buffer = Buffer.from(encoded, 'base64');
      }
      if (buffer.length <= byteCap) break;
    }
    assert.ok(buffer.length <= byteCap, frame.name + ' exceeds 256 KiB');
    captures.push({ path: join(output, frame.name), buffer });
    console.log(`${frame.name}  ${width}×${height}  ${buffer.length.toLocaleString('en-US')} bytes`);
  }
});

await mkdir(output, { recursive: true });
await Promise.all(captures.map(({ path, buffer }) => writeFile(path, buffer)));
