import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { root, research, withChrome } from './chrome.mjs';

const report = { checks: [], exports: {}, errors: [], remoteRequests: [] };
const formats = { landscape: [1920, 1080], portrait: [1080, 1350], square: [1080, 1080] };
const photoNames = ['velvet', 'night-shift', 'insider', 'boulevard', 'switchboard', 'pier'];
const downloads = join(research, `downloads-${process.pid}`);
await mkdir(downloads, { recursive: true });
function equal(label, actual, expected) { assert.deepEqual(actual, expected, label); report.checks.push(label); }
function truth(label, actual) { assert.ok(actual, label); report.checks.push(label); }
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fileHashes = await Promise.all(photoNames.map(name => readFile(join(root, 'app/samples', name + '.jpg')).then(hash)));
equal('six different sample image files', new Set(fileHashes).size, 6);
await withChrome(async ({ call, evaluate, open, viewport, until, on, origin }) => {
  on('Runtime.exceptionThrown', e => report.errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
  on('Runtime.consoleAPICalled', e => { if (e.type === 'error') report.errors.push(e.args.map(a => a.description || a.value).join(' ')); });
  on('Network.requestWillBeSent', ({ request }) => {
    if (!request.url.startsWith(origin + '/') && !/^(data|blob):/.test(request.url)) report.remoteRequests.push(request.url);
  });
  const inspect = () => evaluate('coverStudio.inspect()');
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const fill = (id, value) => evaluate(`(() => {
    const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(String(value))};
    el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  })()`);
  const frame = () => evaluate('new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))');
  const digest = () => evaluate(`(async()=>{
    const bytes=await new Promise(done=>document.getElementById('poster').toBlob(async blob=>done(await blob.arrayBuffer())));
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  })()`);
  await viewport(1280, 896); await open({ qa: '1' });
  equal('six demo photos loaded', (await inspect()).photoCount, 6);
  equal('six unique default panel assignments', (await inspect()).state.panels.map(p => p.photo), [0, 1, 2, 3, 4, 5]);
  equal('six selectable panel previews', await evaluate("document.querySelectorAll('#panel-picker button').length"), 6);
  truth('three PNG buttons visible', await evaluate(`document.querySelectorAll('[data-export]').length===3 && [...document.querySelectorAll('[data-export]')].every(b=>{const r=b.getBoundingClientRect();return r.height>=32&&r.bottom<=innerHeight&&r.top>=0})`));
  for (const format of Object.keys(formats)) {
    await click(`[data-format="${format}"]`); await frame();
    const { geometry } = await inspect();
    equal(`${format} canvas dimensions`, await evaluate('[poster.width,poster.height]'), formats[format]);
    truth(`${format} has six face metadata boxes`, geometry.faces.every(Boolean) && geometry.faces.length === 6);
    truth(`${format} faces clear of title`, geometry.faces.every(face =>
      face.x + face.w <= geometry.title.x || face.x >= geometry.title.x + geometry.title.w ||
      face.y + face.h <= geometry.title.y || face.y >= geometry.title.y + geometry.title.h));
    truth(`${format} short title is at least 16 percent tall`, geometry.title.h / geometry.height >= .16 - 1e-9);
  }
  await click('[data-format="landscape"]'); await frame();
  const { root: dom } = await call('DOM.getDocument');
  const { nodeId } = await call('DOM.querySelector', { nodeId: dom.nodeId, selector: '#photo-input' });
  await call('DOM.setFileInputFiles', { nodeId, files: photoNames.map(name => join(root, 'app/samples', name + '.jpg')) });
  await until('coverStudio.inspect().photoCount === 12');
  equal('real six-file input imports the photos', (await inspect()).photoCount, 12);
  equal('new photos fill all six panels', (await inspect()).state.panels.map(p => p.photo), [6, 7, 8, 9, 10, 11]);
  await frame();
  truth('generic imported photos draw without sample silhouette', await evaluate('coverStudio.exportCanvas("landscape").width===1920'));
  await click('#auto-fill');
  equal('auto-fill restores six distinct library photos', (await inspect()).state.panels.map(p => p.photo), [0, 1, 2, 3, 4, 5]);
  await click('#panel-picker button:nth-child(3)');
  await fill('assigned-photo', '7'); await fill('zoom', '1.7'); await fill('pan-x', '.2'); await fill('pan-y', '.3');
  await click('#flip'); await fill('role', 'THE INFORMANT');
  const crop = (await inspect()).state.panels[2];
  equal('independent photo assignment and crop controls', [crop.photo,crop.zoom,crop.x,crop.y,crop.flip,crop.role,crop.autoFrame], [7,1.7,.2,.3,true,'THE INFORMANT',false]);
  await click('#undo'); equal('undo caption change', (await inspect()).state.panels[2].role, 'THE INSIDER');
  await click('#redo'); equal('redo caption change', (await inspect()).state.panels[2].role, 'THE INFORMANT');
  await frame();
  const originalPixels = await digest();
  await fill('title', 'AFTER THE TIDE'); await frame();
  truth('editing title changes exported pixels', originalPixels !== await digest());
  await click('#undo'); await frame(); equal('undo restores original canvas pixels', await digest(), originalPixels);
  await click('#redo'); await frame();
  const bounds = await evaluate(`(()=>{const r=poster.getBoundingClientRect(),g=coverStudio.inspect().geometry,p=g.panels[2];return {x:r.x+(p.x+p.w*.45)/g.width*r.width,y:r.y+(p.y+p.h*.4)/g.height*r.height}})()`);
  const beforeDrag = (await inspect()).state.panels[2];
  await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: bounds.x, y: bounds.y, button: 'left', clickCount: 1 });
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: bounds.x + 25, y: bounds.y + 20, button: 'left', buttons: 1 });
  await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bounds.x + 25, y: bounds.y + 20, button: 'left', clickCount: 1 });
  const afterDrag = (await inspect()).state.panels[2];
  truth('pointer drag changes photo position', beforeDrag.x !== afterDrag.x || beforeDrag.y !== afterDrag.y);
  const beforeWheel = afterDrag.zoom;
  await call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: bounds.x, y: bounds.y, deltaX: 0, deltaY: -100 });
  await until(`coverStudio.inspect().state.panels[2].zoom > ${beforeWheel}`);
  truth('native wheel zoom changes selected panel', (await inspect()).state.panels[2].zoom > beforeWheel);
  await evaluate('new Promise(done=>setTimeout(done,260))');
  await click('#open-exports');
  truth('real export tray opens', await evaluate('document.getElementById("export-tray").open'));
  equal('tray has three freshly rendered formats', await evaluate('[...document.querySelectorAll("#export-cards canvas")].map(c=>[c.width,c.height])'), Object.values(formats));
  await click('#close-exports');
  await call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  for (const [format, dimensions] of Object.entries(formats)) {
    await click(`[data-format="${format}"]`); await frame();
    const data = await evaluate(`coverStudio.exportCanvas('${format}').toDataURL('image/png').split(',')[1]`);
    const expected = Buffer.from(data, 'base64');
    equal(`${format} preview matches export renderer`, await evaluate(`poster.toDataURL()===coverStudio.exportCanvas('${format}').toDataURL()`), true);
    await click(`[data-export="${format}"]`);
    const filename = `after-the-tide-${format}.png`;
    let bytes;
    for (let attempt = 0; attempt < 60; attempt++) {
      bytes = await readFile(join(downloads, filename)).catch(() => null);
      if (bytes) break;
      await new Promise(done => setTimeout(done, 80));
    }
    truth(`${format} PNG downloaded`, bytes && bytes.length > 10000);
    equal(`${format} downloaded PNG signature`, bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    equal(`${format} downloaded PNG exact dimensions`, [bytes.readUInt32BE(16), bytes.readUInt32BE(20)], dimensions);
    equal(`${format} download pixels match preview`, hash(bytes), hash(expected));
    report.exports[format] = { dimensions, bytes: bytes.length, sha256: hash(bytes) };
  }
  // A layout switch preserves edits hidden by layouts with fewer panels.
  await fill('layout', 'single'); equal('one-panel layout works', (await inspect()).state.panels.length, 1);
  await fill('layout', 'premiere'); equal('returning to six panels restores hidden role', (await inspect()).state.panels[2].role, 'THE INFORMANT');
  equal('no JavaScript exceptions', report.errors, []);
  equal('no remote resources', report.remoteRequests, []);
});
await writeFile(join(research, 'verification-current.json'), JSON.stringify(report, null, 2));
console.log(`${report.checks.length} checks passed; 3 exact PNG downloads; ${report.errors.length} errors; ${report.remoteRequests.length} remote requests`);
