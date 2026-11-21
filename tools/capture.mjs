import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { root, withChrome } from './chrome.mjs';

const recipe = JSON.parse(await readFile(join(root, 'shots.json'), 'utf8'));
assert.ok(recipe.length === 3 || recipe.length === 4, 'The dossier needs three or four images.');
assert.equal(recipe[0].kind, 'cover', 'The first screenshot must be a cover.');
assert.ok(recipe.some(frame => frame.kind === 'editor'), 'Show the real editor.');
const outputDirectory = resolve(process.argv[2] || join(root, 'screenshots'));
const captured = [];

await withChrome(async ({ call, viewport, open, evaluate }) => {
  const paint = () => evaluate('new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))');
  async function click(selector) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await paint();
  }
  async function change(id, value) {
    await evaluate(`(() => {
      const input=document.getElementById(${JSON.stringify(id)});
      input.value=${JSON.stringify(String(value))};
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await paint();
  }

  for (const frame of recipe) {
    const [width, height] = frame.viewport;
    assert.match(frame.name, /^[1-4]-[a-z0-9-]+\.jpg$/);
    assert.ok(Math.min(width, height) >= 480 && Math.max(width, height) <= 1280);
    await viewport(width, height);
    await open({ shot: '1' });
    await click('[data-format="' + frame.format + '"]');
    for (const [property, value] of Object.entries(frame.look || {})) {
      if (property === 'grade') await click('[data-grade="' + value + '"]');
      else if (property === 'lead') {
        const original = await evaluate('coverStudio.inspect().state.panels.map(p=>({photo:p.photo,role:p.role}))');
        await click('#panel-picker button:first-child');
        await change('assigned-photo', original[value].photo);
        await change('role', original[value].role);
        await click('#panel-picker button:nth-child(' + (Number(value) + 1) + ')');
        await change('assigned-photo', original[0].photo);
        await change('role', original[0].role);
      } else await change(property, value);
    }
    if (frame.select !== undefined) await click('#panel-picker button:nth-child(' + (frame.select + 1) + ')');
    if (frame.zoom !== undefined) await change('zoom', frame.zoom);
    if (frame.kind === 'tray') await click('#open-exports');

    let bytes;
    for (const quality of [92, 88, 84, 80, 76, 72, 68, 64, 58]) {
      if (frame.kind === 'cover') {
        const encoded = await evaluate(`(() => {
          const original=coverStudio.exportCanvas(${JSON.stringify(frame.format)});
          const scaled=document.createElement('canvas');
          scaled.width=${width}; scaled.height=${height};
          if(original.width*scaled.height!==original.height*scaled.width)throw Error('Screenshot ratio changed');
          const context=scaled.getContext('2d');
          context.imageSmoothingQuality='high';
          context.drawImage(original,0,0,scaled.width,scaled.height);
          return scaled.toDataURL('image/jpeg',${quality / 100}).split(',')[1];
        })()`);
        bytes = Buffer.from(encoded, 'base64');
      } else {
        const screenshot = await call('Page.captureScreenshot', { format: 'jpeg', quality, captureBeyondViewport: false });
        bytes = Buffer.from(screenshot.data, 'base64');
      }
      if (bytes.length <= 256 * 1024) break;
    }
    assert.ok(bytes.length <= 256 * 1024, 'Screenshot exceeds 256 KiB: ' + frame.name);
    captured.push({ name: frame.name, bytes, width, height });
  }
});

await mkdir(outputDirectory, { recursive: true });
for (const name of await readdir(outputDirectory)) {
  if (/^[1-4]-.*\.jpg$/.test(name) && !captured.some(item => item.name === name)) {
    await rm(join(outputDirectory, name));
  }
}
for (const frame of captured) {
  await writeFile(join(outputDirectory, frame.name), frame.bytes);
  console.log(frame.name + ': ' + frame.width + '×' + frame.height + ', ' + frame.bytes.length + ' bytes');
}
