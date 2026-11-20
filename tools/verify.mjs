import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { research, root, withChrome } from './chrome.mjs';

const expected = { landscape: [1920, 1080], portrait: [1080, 1350], square: [1080, 1080] };
const downloadFolder = join(research, 'browser-downloads-' + process.pid);
const samples = ['boulevard.jpg', 'pier.jpg', 'night-shift.jpg', 'switchboard.jpg'];
const report = { checks: [], png: {}, exceptions: [], remoteRequests: [] };

function equals(name, actual, wanted) {
  deepStrictEqual(actual, wanted, name);
  report.checks.push(name);
}

await mkdir(downloadFolder, { recursive: true });
await withChrome(async ({ call, evaluate, on, until, open, viewport, origin }) => {
  on('Runtime.exceptionThrown', ({ exceptionDetails }) => report.exceptions.push(exceptionDetails.text));
  on('Runtime.consoleAPICalled', ({ type, args }) => {
    if (type === 'error') report.exceptions.push(args.map(value => value.description ?? value.value ?? '').join(' '));
  });
  on('Network.requestWillBeSent', ({ request: { url } }) => {
    if (!url.startsWith(origin + '/') && !url.startsWith('blob:') && !url.startsWith('data:')) report.remoteRequests.push(url);
  });

  const expression = 'window.coverStudio.inspect()';
  const inspect = () => evaluate(expression);
  const element = id => 'document.getElementById(' + JSON.stringify(id) + ')';
  const click = selector => evaluate('document.querySelector(' + JSON.stringify(selector) + ').click()');
  const input = (id, next) => evaluate(`(() => {
    const control = ${element(id)};
    control.value = ${JSON.stringify(next)};
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);

  await viewport(1280, 896);
  await open({ qa: '1' });
  const starter = await inspect();
  equals('five sample photos available', starter.photoCount, 5);
  equals('five different photos in the default collage', starter.state.panels.map(panel => panel.photo), [0, 1, 2, 3, 4]);
  equals('five panel previews rendered', await evaluate('document.querySelectorAll("#panel-picker button").length'), 5);
  equals('three visible PNG buttons', await evaluate(`[...document.querySelectorAll('[data-export]')].every(button => {
    const rect = button.getBoundingClientRect();
    return rect.height >= 32 && rect.bottom <= innerHeight && rect.top >= 0;
  })`), true);

  const { root: documentNode } = await call('DOM.getDocument');
  const { nodeId } = await call('DOM.querySelector', { nodeId: documentNode.nodeId, selector: '#photo-input' });
  await call('DOM.setFileInputFiles', { nodeId, files: samples.map(name => join(root, 'app/samples', name)) });
  await until(expression + '.photoCount === 9');
  equals('native file picker imports all four local photos', (await inspect()).photoCount, 9);
  equals('new cast initially fills the panels', (await inspect()).state.panels.map(panel => panel.photo), [5, 6, 7, 8, 5]);

  await click('#auto-fill');
  equals('autofill action assigns five distinct photos', (await inspect()).state.panels.map(panel => panel.photo), [0, 1, 2, 3, 4]);
  await click('#panel-picker button:nth-child(3)');
  equals('panel picker selects third panel', (await inspect()).selected, 2);
  await input('assigned-photo', '7');
  await input('pan-y', '.54');
  await input('zoom', '1.7');
  await click('#flip');
  await input('role', 'THE INFORMANT');
  const edited = (await inspect()).state.panels[2];
  equals('photo, crop, flip and role are independent panel state', edited, {
    role: 'THE INFORMANT', x: 0, y: .54, photo: 7, zoom: 1.7, flip: true,
  });
  equals('reframing keeps the lead separate', (await inspect()).state.panels[0].photo, 0);
  await click('#undo');
  equals('undo restores previous role label', (await inspect()).state.panels[2].role, starter.state.panels[2].role);
  await click('#redo');
  equals('redo restores role edit', (await inspect()).state.panels[2].role, edited.role);
  await input('layout', 'double');
  equals('two panel layout shows only two panels', (await inspect()).state.panels.length, 2);
  await input('layout', 'premiere');
  equals('a smaller layout preserves the hidden panel edit', (await inspect()).state.panels[2], edited);

  const titleChanged = await evaluate(`(() => {
    const fragment = () => {
      const poster = window.coverStudio.exportCanvas('landscape');
      const region = document.createElement('canvas');
      region.width = 120;
      region.height = 48;
      region.getContext('2d').drawImage(poster, 220, 755, 1480, 170, 0, 0, 120, 48);
      return region.toDataURL();
    };
    const before = fragment();
    const title = document.querySelector('#title');
    title.value = 'CORAL AFTER DARK';
    title.dispatchEvent(new Event('input', { bubbles: true }));
    title.dispatchEvent(new Event('change', { bubbles: true }));
    return before !== fragment();
  })()`);
  equals('caption edit changes the actual export pixels', titleChanged, true);

  const layouts = await evaluate('[...document.querySelector("#layout").options].map(option => option.value)');
  strictEqual(layouts.length, 8);
  for (const layout of layouts) {
    await input('layout', layout);
    for (const [format, dimensions] of Object.entries(expected)) {
      const sample = await evaluate(`(() => {
        const result = coverStudio.exportCanvas(${JSON.stringify(format)});
        const ctx = result.getContext('2d');
        const points = [[.02,.02], [.18,.18], [.49,.28], [.75,.54], [.6,.79]];
        const pixels = points.map(([x,y]) => [...ctx.getImageData(Math.floor(result.width*x), Math.floor(result.height*y), 1, 1).data]);
        return { dimensions: [result.width, result.height], opaque: pixels.every(pixel => pixel[3] === 255), colors: new Set(pixels.map(pixel => pixel.join())).size };
      })()`);
      equals(layout + ' ' + format + ' dimensions', sample.dimensions, dimensions);
      ok(sample.opaque && sample.colors > 2, layout + ' ' + format + ' renders actual art');
      report.checks.push(layout + ' ' + format + ' has distinct opaque poster pixels');
    }
  }

  await open({ qa: '1' });
  await call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadFolder });
  for (const [format, dimensions] of Object.entries(expected)) {
    await click(`[data-export="${format}"]`);
    const relative = 'neon-tide-' + format + '.png';
    const file = join(downloadFolder, relative);
    let png;
    const end = Date.now() + 9000;
    while (!png && Date.now() < end) {
      if ((await readdir(downloadFolder)).includes(relative)) png = await readFile(file).catch(() => null);
      if (!png) await new Promise(resolve => setTimeout(resolve, 100));
    }
    ok(png, 'PNG clicked in editor was saved: ' + format);
    equals(format + ' PNG signature', png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    equals(format + ' PNG IHDR size', [png.readUInt32BE(16), png.readUInt32BE(20)], dimensions);
    equals(format + ' PNG ends at IEND', png.subarray(-8, -4).toString('ascii'), 'IEND');
    report.png[format] = dimensions;
    await rename(file, join(research, 'neon-tide-' + format + '.png'));
  }
});

equals('no browser exceptions or console errors', report.exceptions, []);
equals('no remote requests', report.remoteRequests, []);
await writeFile(join(research, 'recorded-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`${report.checks.length} checks passed, 3 exact PNG exports, 0 exceptions, 0 remote requests.`);
