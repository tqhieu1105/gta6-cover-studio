import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root, research, withChrome } from './chrome.mjs';

const dimensions = { landscape: [1920, 1080], portrait: [1080, 1350], square: [1080, 1080] };
const samples = ['velvet', 'night-shift', 'insider', 'boulevard', 'switchboard', 'pier'];
const report = { checks: [], exports: {}, errors: [], remoteRequests: [] };
const downloads = join(research, 'proof-' + process.pid);
await mkdir(downloads, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function equal(label, actual, expected) {
  assert.deepEqual(actual, expected, label);
  report.checks.push(label);
}
function check(label, condition) {
  assert.ok(condition, label);
  report.checks.push(label);
}
const sampleHashes = await Promise.all(samples.map(async sample => hash(await readFile(join(root, 'app/samples', sample + '.jpg')))));
equal('six distinct local sample images', new Set(sampleHashes).size, 6);

await withChrome(async ({ call, evaluate, viewport, open, on, until, origin }) => {
  on('Runtime.exceptionThrown', event => report.errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  on('Runtime.consoleAPICalled', event => {
    if (event.type === 'error') report.errors.push(event.args.map(arg => arg.description || arg.value).join(' '));
  });
  on('Network.requestWillBeSent', event => {
    const url = event.request.url;
    if (!url.startsWith(origin + '/') && !/^(data|blob):/.test(url)) report.remoteRequests.push(url);
  });

  const paint = () => evaluate('new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))');
  const inspect = () => evaluate('coverStudio.inspect()');
  async function click(selector) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await paint();
  }
  async function input(id, value) {
    await evaluate(`(() => {
      const control=document.getElementById(${JSON.stringify(id)});
      control.value=${JSON.stringify(String(value))};
      control.dispatchEvent(new Event('input',{bubbles:true}));
      control.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await paint();
  }
  const pixelHash = () => evaluate(`(async()=>{
    await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
    const png=await new Promise(done=>poster.toBlob(done,'image/png'));
    const bytes=await png.arrayBuffer();
    return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  })()`);
  async function fileInput(paths) {
    const document = await call('DOM.getDocument');
    const result = await call('DOM.querySelector', { nodeId: document.root.nodeId, selector: '#photo-input' });
    await call('DOM.setFileInputFiles', { nodeId: result.nodeId, files: paths });
  }

  await viewport(1280, 896);
  await open({ qa: '1' });
  let state = await inspect();
  equal('six samples decode', state.photoCount, 6);
  equal('six independent default assignments', state.state.panels.map(crop => crop.photo), [0, 1, 2, 3, 4, 5]);
  equal('six panel choices are visible', await evaluate("document.querySelectorAll('#panel-picker button').length"), 6);
  check('all exact PNG controls fit in the workspace', await evaluate(`[...document.querySelectorAll('[data-export]')].length===3 &&
    [...document.querySelectorAll('[data-export]')].every(b=>{const r=b.getBoundingClientRect();return r.height>=28&&r.bottom<=innerHeight;})`));

  for (const [format, size] of Object.entries(dimensions)) {
    await click('[data-format="' + format + '"]');
    const design = await inspect();
    equal(format + ' preview is exact size', await evaluate('[poster.width,poster.height]'), size);
    equal(format + ' has all six subjects', design.geometry.faces.length, 6);
    check(format + ' faces clear the title', design.geometry.faces.every(face => {
      const title = design.geometry.title;
      return face.x + face.w <= title.x || face.x >= title.x + title.w ||
        face.y + face.h <= title.y || face.y >= title.y + title.h;
    }));
    check(format + ' eye centers stay inside their panels', await evaluate(`(() => {
      const {geometry}=coverStudio.inspect();
      const inside=(vertices,x,y)=>vertices.reduce((odd,[ax,ay],i)=>{
        const [bx,by]=vertices[(i+1)%vertices.length];
        return ((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)?!odd:odd;
      },false);
      return geometry.faces.every((face,i)=>inside(geometry.panels[i].vertices,face.x+face.w*.5,face.y+face.h*.38));
    })()`));
    const first = await evaluate(`coverStudio.exportCanvas('${format}').toDataURL('image/png')`);
    const second = await evaluate(`coverStudio.exportCanvas('${format}').toDataURL('image/png')`);
    equal(format + ' repeated export is deterministic', hash(Buffer.from(first)), hash(Buffer.from(second)));
  }

  await click('[data-format="landscape"]');
  await fileInput(samples.map(name => join(root, 'app/samples', name + '.jpg')));
  await until('coverStudio.inspect().photoCount===12');
  await paint();
  equal('six files imported through the real file chooser', (await inspect()).photoCount, 12);
  equal('imported files fill six unique panels', (await inspect()).state.panels.map(crop => crop.photo), [6, 7, 8, 9, 10, 11]);
  check('imports have no invented face or silhouette metadata', (await inspect()).photoMeta.slice(6).every(photo => photo.imported && !photo.anchored && !photo.silhouette));

  await fileInput([join(root, 'app/samples/boulevard.jpg')]);
  await until('coverStudio.inspect().photoCount===13');
  await paint();
  equal('one imported photo can fill every panel', (await inspect()).state.panels.map(crop => crop.photo), [12, 12, 12, 12, 12, 12]);
  await click('#auto-fill');
  equal('autofill restores six distinct samples', (await inspect()).state.panels.map(crop => crop.photo), [0, 1, 2, 3, 4, 5]);

  await click('#panel-picker button:nth-child(3)');
  await input('assigned-photo', 7);
  await input('zoom', 1.7);
  await input('pan-x', .2);
  await input('pan-y', .3);
  await click('#flip');
  await input('role', 'THE INFORMANT');
  state = await inspect();
  const crop = state.state.panels[2];
  equal('selected crop stores photo, position, zoom, flip and role', [crop.photo, crop.x, crop.y, crop.zoom, crop.flip, crop.role], [7, .2, .3, 1.7, true, 'THE INFORMANT']);
  equal('other panel stays independent', state.state.panels[1].photo, 1);
  await click('#undo');
  equal('undo restores the role', (await inspect()).state.panels[2].role, 'THE INSIDER');
  await click('#redo');
  equal('redo restores the role edit', (await inspect()).state.panels[2].role, 'THE INFORMANT');

  const originalPixels = await pixelHash();
  await input('title', 'AFTER THE TIDE');
  check('title edits alter actual exported pixels', await pixelHash() !== originalPixels);
  await click('#undo');
  equal('undo restores exact composed pixels', await pixelHash(), originalPixels);
  await click('#redo');

  const beforeWheel = (await inspect()).state.panels[2].zoom;
  const canvasBounds = await evaluate('(()=>{const r=poster.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()');
  const scene = (await inspect()).geometry;
  const selectedPanel = scene.panels[2];
  const center = {
    x: canvasBounds.x + (selectedPanel.x + selectedPanel.w * .45) / scene.width * canvasBounds.w,
    y: canvasBounds.y + (selectedPanel.y + selectedPanel.h * .4) / scene.height * canvasBounds.h,
  };
  await call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: center.x, y: center.y, deltaX: 0, deltaY: -95 });
  await paint();
  check('real mouse wheel changes crop zoom', (await inspect()).state.panels[2].zoom > beforeWheel);
  const beforeDrag = { ...(await inspect()).state.panels[2] };
  await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: center.x, y: center.y, button: 'left', clickCount: 1 });
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: center.x + 13, y: center.y + 9, button: 'left', buttons: 1 });
  await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: center.x + 13, y: center.y + 9, button: 'left', clickCount: 1 });
  await paint();
  const afterDrag = (await inspect()).state.panels[2];
  check('real pointer drag reframes the selected photo', beforeDrag.x !== afterDrag.x || beforeDrag.y !== afterDrag.y);

  await input('layout', 'single');
  equal('single-panel layout works', (await inspect()).state.panels.length, 1);
  await input('layout', 'premiere');
  equal('returning to six panels retains hidden role edits', (await inspect()).state.panels[2].role, 'THE INFORMANT');
  await click('#open-exports');
  equal('export collection contains native canvases for every size',
    await evaluate('[...document.querySelectorAll("#export-cards canvas")].map(c=>[c.width,c.height])'), Object.values(dimensions));
  await click('#close-exports');

  await call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  for (const [format, size] of Object.entries(dimensions)) {
    await click('[data-format="' + format + '"]');
    const generated = await evaluate(`coverStudio.exportCanvas('${format}').toDataURL('image/png')`);
    const expected = Buffer.from(generated.split(',')[1], 'base64');
    await click('[data-export="' + format + '"]');
    const name = join(downloads, 'after-the-tide-' + format + '.png');
    let actual;
    for (let attempt = 0; attempt < 70; attempt++) {
      actual = await readFile(name).catch(() => null);
      if (actual) break;
      await new Promise(done => setTimeout(done, 80));
    }
    check(format + ' PNG file downloaded', Boolean(actual));
    equal(format + ' has PNG signature', actual.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    equal(format + ' download has exact dimensions', [actual.readUInt32BE(16), actual.readUInt32BE(20)], size);
    equal(format + ' download matches rendered pixels', hash(actual), hash(expected));
    report.exports[format] = { dimensions: size, bytes: actual.length, sha256: hash(actual) };
  }
  equal('no browser exceptions', report.errors, []);
  equal('no external requests', report.remoteRequests, []);
});
await writeFile(join(research, 'verification-current.json'), JSON.stringify(report, null, 2));
console.log(report.checks.length + ' browser checks passed; three exact PNG downloads; ' +
  report.errors.length + ' exceptions; ' + report.remoteRequests.length + ' remote requests');
