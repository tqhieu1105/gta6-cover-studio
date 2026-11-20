import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { root, withChrome } from './chrome.mjs';

const frames = JSON.parse(await readFile(join(root, 'shots.json'), 'utf8'));
const destination = resolve(process.argv[2] || join(root, 'screenshots'));
assert.ok(frames.length >= 3 && frames.length <= 4);
assert.equal(frames[0].kind, 'cover');
assert.equal(frames[0].format, 'landscape');
assert.ok(frames.some(frame => frame.kind === 'editor'));
const captures = [];
await withChrome(async ({ call, evaluate, viewport, open }) => {
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const fill = (id, value) => evaluate(`(() => {
    const control = document.getElementById(${JSON.stringify(id)});
    control.value = ${JSON.stringify(String(value))};
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  const settle = () => evaluate('new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))');
  for (const frame of frames) {
    const [width, height] = frame.viewport;
    assert.match(frame.name, /^[a-zA-Z0-9][a-zA-Z0-9._-]+\.jpg$/);
    assert.ok(Math.max(width, height) <= 1280 && Math.min(width, height) >= 480);
    await viewport(width, height);
    await open({ shot: '1' });
    await click(`[data-format="${frame.format}"]`);
    const look = frame.look || {};
    for (const key of ['title', 'subtitle', 'tagline', 'edition', 'layout']) if (key in look) await fill(key, look[key]);
    if (look.grade) await click(`[data-grade="${look.grade}"]`);
    if (look.lead) {
      const current = await evaluate('coverStudio.inspect().state.panels.map(p => ({photo:p.photo,role:p.role}))');
      await click('#panel-picker button:first-child'); await fill('assigned-photo', look.lead); await fill('role', current[look.lead].role);
      await click(`#panel-picker button:nth-child(${look.lead + 1})`); await fill('assigned-photo', current[0].photo); await fill('role', current[0].role);
    }
    if (frame.select !== undefined) await click(`#panel-picker button:nth-child(${frame.select + 1})`);
    if (frame.zoom) await fill('zoom', frame.zoom);
    await settle();
    if (frame.kind === 'tray') { await click('#open-exports'); await settle(); }
    let bytes;
    for (const quality of [92, 88, 84, 80, 76, 72, 66, 60]) {
      if (frame.kind === 'cover') {
        const data = await evaluate(`(() => {
          const source = coverStudio.exportCanvas(${JSON.stringify(frame.format)});
          const result = document.createElement('canvas'); result.width=${width}; result.height=${height};
          if (source.width * result.height !== source.height * result.width) throw Error('Cover ratio mismatch');
          const ctx = result.getContext('2d'); ctx.imageSmoothingQuality='high';
          ctx.drawImage(source,0,0,result.width,result.height);
          return result.toDataURL('image/jpeg',${quality / 100}).split(',')[1];
        })()`);
        bytes = Buffer.from(data, 'base64');
      } else {
        const shot = await call('Page.captureScreenshot', { format: 'jpeg', quality, captureBeyondViewport: false });
        bytes = Buffer.from(shot.data, 'base64');
      }
      if (bytes.length <= 262144) break;
    }
    assert.ok(bytes.length <= 262144, `${frame.name} is too large`);
    captures.push({ name: frame.name, bytes });
    console.log(`${frame.name}: ${width}×${height}, ${bytes.length} bytes`);
  }
});
await mkdir(destination, { recursive: true });
const names = new Set(captures.map(frame => frame.name));
for (const name of await readdir(destination)) {
  if (/^[1-4]-.*\.jpg$/.test(name) && !names.has(name)) await unlink(join(destination, name));
}
for (const capture of captures) await writeFile(join(destination, capture.name), capture.bytes);
