import { FORMATS, LAYOUTS, GRADES, createPanelState, renderPoster, drawPanelPreview,
  canvasOf, clamp, cropTravel, fitPhotoToAnchor, hitTestPanel } from './art.js';

const $ = id => document.getElementById(id);
const poster = $('poster');
const query = new URLSearchParams(location.search);
const names = { landscape: 'Wide', portrait: 'Portrait', square: 'Square' };
// Face rectangles are hand-placed sample metadata, never inferred for imports.
const sampleCards = [
  { name: 'Velvet', file: 'velvet.jpg', face: [.33, .11, .40, .53], silhouette: true },
  { name: 'Night Shift', file: 'night-shift.jpg', face: [.32, .18, .45, .65] },
  { name: 'Insider', file: 'insider.jpg', face: [.32, .17, .34, .51] },
  { name: 'Boulevard', file: 'boulevard.jpg', face: [.37, .12, .23, .22] },
  { name: 'Switchboard', file: 'switchboard.jpg', face: [.30, .16, .40, .57] },
  { name: 'Pier', file: 'pier.jpg', face: [.35, .05, .27, .29] },
];
const assets = [];
const back = [];
const forward = [];
const ownedUrls = new Set();
let model = {
  title: 'NEON TIDE', subtitle: 'The coast is ours', tagline: 'THE CITY NEVER FORGETS',
  edition: 'SUNSET EDITION', format: 'landscape', layout: 'premiere', grade: 'violet',
  finish: 'chrome', strength: .79, inkAmount: .25, heroCutout: true,
  panels: createPanelState('premiere', sampleCards.length), reserve: [],
};
let chosen = 0;
let geometry;
let scheduled = 0;
let pointer;
let wheelGroup;
let wheelEnd;
let importing = Promise.resolve();
let messageTimer;

for (const key of ['title', 'subtitle', 'tagline', 'edition']) {
  if (query.has(key)) model[key] = query.get(key).slice(0, Number($(key).maxLength));
}
for (const [key, choices] of [['format', Object.keys(FORMATS)], ['layout', LAYOUTS.map(l => l.id)], ['grade', GRADES.map(g => g.id)]]) {
  if (choices.includes(query.get(key))) model[key] = query.get(key);
}
model.panels = createPanelState(model.layout, sampleCards.length);
if (query.has('lead')) {
  const other = Number(query.get('lead'));
  if (Number.isInteger(other) && other > 0 && other < model.panels.length) {
    [model.panels[0].photo, model.panels[other].photo] = [model.panels[other].photo, model.panels[0].photo];
    [model.panels[0].role, model.panels[other].role] = [model.panels[other].role, model.panels[0].role];
  }
}

const selectedCrop = () => model.panels[chosen];
const serialize = () => JSON.stringify({ model, chosen });
function tell(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => $('toast').classList.remove('show'), 2600);
}
function updateHistory() {
  $('undo').disabled = back.length === 0;
  $('redo').disabled = forward.length === 0;
}
function remember(before) {
  if (before === serialize()) return;
  back.push(before);
  if (back.length > 80) back.shift();
  forward.length = 0;
  updateHistory();
}
function edit(action) {
  const before = serialize();
  action();
  remember(before);
  syncControls();
  queueDraw();
}
function history(source, target) {
  if (!source.length) return;
  target.push(serialize());
  ({ model, chosen } = JSON.parse(source.pop()));
  syncControls();
  updateHistory();
  queueDraw();
}
function button(label, handler) {
  const node = document.createElement('button');
  node.type = 'button'; node.textContent = label;
  node.addEventListener('click', handler);
  return node;
}
async function decode(url) {
  const image = new Image(); image.src = url;
  await image.decode();
  return image;
}

function buildLibrary() {
  $('library').replaceChildren();
  $('assigned-photo').replaceChildren();
  assets.forEach((asset, i) => {
    const tile = button('', () => edit(() => {
      selectedCrop().photo = i;
      Object.assign(selectedCrop(), fitPhotoToAnchor(asset, geometry.panels[chosen], selectedCrop()));
    }));
    tile.dataset.photo = i;
    tile.title = `Use ${asset.name} in selected panel`;
    tile.setAttribute('aria-label', tile.title);
    const image = asset.image.cloneNode(); image.alt = '';
    const label = document.createElement('span'); label.textContent = asset.name;
    tile.append(image, label); $('library').append(tile);
    $('assigned-photo').add(new Option(asset.name, String(i)));
  });
  $('photo-count').textContent = `${assets.length} photos`;
}
function choosePanel(index) {
  chosen = index;
  syncPanel();
  selectionOverlay();
}
function syncPanel() {
  const crop = selectedCrop();
  if ($('panel-picker').children.length !== model.panels.length) {
    $('panel-picker').replaceChildren(...model.panels.map((_, i) => {
      const tile = button('', () => choosePanel(i));
      const preview = canvasOf(144, 98);
      preview.setAttribute('aria-hidden', 'true');
      tile.append(preview, document.createElement('span'));
      return tile;
    }));
  }
  $('panel-number').textContent = `${String(chosen + 1).padStart(2, '0')} / ${model.panels.length}`;
  for (const [id, key] of [['assigned-photo', 'photo'], ['role', 'role'], ['zoom', 'zoom'], ['pan-x', 'x'], ['pan-y', 'y']]) $(id).value = crop[key];
  $('zoom-value').value = `${crop.zoom.toFixed(2)}×`;
  $('x-value').value = `${Math.round(crop.x * 100)}%`;
  $('y-value').value = `${Math.round(crop.y * 100)}%`;
  $('flip').setAttribute('aria-pressed', crop.flip);
  drawPanelPreview($('panel-tile'), assets[crop.photo], crop, model);
  [...$('library').children].forEach(tile => tile.setAttribute('aria-pressed', Number(tile.dataset.photo) === crop.photo));
  [...$('panel-picker').children].forEach((tile, i) => {
    const current = model.panels[i];
    tile.setAttribute('aria-pressed', i === chosen);
    tile.setAttribute('aria-label', `Panel ${i + 1}: ${current.role}`);
    tile.lastElementChild.textContent = current.role || `PANEL ${i + 1}`;
    drawPanelPreview(tile.firstElementChild, assets[current.photo], current, model);
  });
}
function syncControls() {
  for (const key of ['title', 'subtitle', 'tagline', 'edition', 'layout', 'finish', 'strength']) $(key).value = model[key];
  $('ink-amount').value = model.inkAmount;
  $('hero-cutout').checked = model.heroCutout;
  $('hero-cutout').disabled = !assets[model.panels[0].photo]?.silhouette;
  $('strength-value').value = `${Math.round(model.strength * 100)}%`;
  $('ink-value').value = `${Math.round(model.inkAmount * 100)}%`;
  $('grade-label').value = GRADES.find(item => item.id === model.grade).name;
  $('preview-dimensions').textContent = FORMATS[model.format].join(' × ');
  for (const node of $('format-picker').children) node.setAttribute('aria-pressed', node.dataset.format === model.format);
  for (const node of $('grades').children) node.setAttribute('aria-pressed', node.dataset.grade === model.grade);
  syncPanel();
}
function fitPreview() {
  const available = $('preview-area');
  const ratio = Math.min((available.clientWidth - 20) / poster.width, (available.clientHeight - 20) / poster.height);
  if (ratio > 0) {
    $('preview-frame').style.width = `${Math.floor(poster.width * ratio)}px`;
    $('preview-frame').style.height = `${Math.floor(poster.height * ratio)}px`;
  }
}
function selectionOverlay() {
  if (!geometry) return;
  const panel = geometry.panels[chosen];
  const points = panel.vertices.map(point => point.join(',')).join(' ');
  $('selection').setAttribute('viewBox', `0 0 ${poster.width} ${poster.height}`);
  $('selection-border').setAttribute('points', points);
  $('clip-border').setAttribute('points', points);
  $('crop-grid').setAttribute('d', [1, 2].map(i => {
    const x = panel.x + panel.w * i / 3, y = panel.y + panel.h * i / 3;
    return `M${x} ${panel.y}v${panel.h}M${panel.x} ${y}h${panel.w}`;
  }).join(''));
  $('crop-handles').replaceChildren(...panel.vertices.map(([x, y]) => {
    const corner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    corner.setAttribute('cx', x); corner.setAttribute('cy', y); corner.setAttribute('r', 7 * geometry.unit);
    return corner;
  }));
  $('crop-hud').textContent = `PANEL ${String(chosen + 1).padStart(2, '0')} · ${selectedCrop().zoom.toFixed(2)}× · DRAG TO REFRAME`;
  $('cast-status').textContent = `${model.panels.length} panels · ${new Set(model.panels.map(p => p.photo)).size} photos`;
}
function queueDraw() {
  cancelAnimationFrame(scheduled);
  scheduled = requestAnimationFrame(() => {
    geometry = renderPoster(poster, model, assets);
    fitPreview(); selectionOverlay();
    document.documentElement.dataset.ready = 'true';
  });
}
function exportCanvas(format) {
  const result = canvasOf(...FORMATS[format]);
  renderPoster(result, model, assets, format);
  return result;
}
function autoFill(first = 0, count = assets.length) {
  edit(() => {
    model.panels.forEach((crop, i) => {
      crop.photo = first + i % count;
      Object.assign(crop, fitPhotoToAnchor(assets[crop.photo], geometry.panels[i], crop), { autoFrame: true });
    });
  });
}
async function importFiles(files) {
  const beforeCount = assets.length;
  const results = await Promise.all([...files].slice(0, 36).map(async file => {
    const url = URL.createObjectURL(file);
    try {
      const image = await decode(url); ownedUrls.add(url);
      return { image, name: file.name.replace(/\.[^.]+$/, ''), imported: true };
    } catch { URL.revokeObjectURL(url); return null; }
  }));
  assets.push(...results.filter(Boolean));
  if (assets.length === beforeCount) { tell('Choose a readable image file'); return; }
  buildLibrary(); autoFill(beforeCount, assets.length - beforeCount);
  tell(`${assets.length - beforeCount} local photos added`);
}
function enqueueImport(files) {
  const copied = [...files];
  if (copied.length) importing = importing.then(() => importFiles(copied)).catch(error => { tell('Could not read these files'); console.error(error); });
}
function download(format) {
  const image = exportCanvas(format);
  image.toBlob(blob => {
    if (!blob) { tell('PNG could not be created'); return; }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const title = model.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'neon-tide';
    anchor.download = `${title}-${format}.png`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    tell(`PNG saved · ${FORMATS[format].join(' × ')}`);
  }, 'image/png');
}
function showExports() {
  $('export-cards').replaceChildren(...Object.keys(FORMATS).map(format => {
    const card = document.createElement('article');
    card.className = 'export-card';
    const image = exportCanvas(format);
    image.setAttribute('aria-label', `${names[format]} export preview`);
    const title = document.createElement('h3'); title.textContent = names[format];
    const dimensions = document.createElement('p'); dimensions.textContent = FORMATS[format].join(' × ');
    const save = button('Download PNG ↗', () => download(format)); save.dataset.trayExport = format;
    const artwork = document.createElement('div'); artwork.className = 'export-art'; artwork.append(image);
    card.append(artwork, title, dimensions, save);
    return card;
  }));
  $('export-tray').showModal();
}
function liveInput(id, changeValue) {
  let start;
  $(id).addEventListener('input', event => {
    start ??= serialize(); changeValue(event.target.value);
    syncPanel();
    $('strength-value').value = `${Math.round(model.strength * 100)}%`;
    $('ink-value').value = `${Math.round(model.inkAmount * 100)}%`;
    queueDraw();
  });
  $(id).addEventListener('change', () => {
    if (start !== undefined) remember(start);
    start = undefined;
  });
}
function manualCrop(key, value) {
  const crop = selectedCrop();
  if (crop.autoFrame) Object.assign(crop, fitPhotoToAnchor(assets[crop.photo], geometry.panels[chosen], crop), { autoFrame: false });
  crop[key] = value;
}
function wireControls() {
  for (const id of ['title', 'subtitle', 'tagline', 'edition']) liveInput(id, value => { model[id] = value; });
  liveInput('role', value => { selectedCrop().role = value; });
  for (const [id, key] of [['zoom', 'zoom'], ['pan-x', 'x'], ['pan-y', 'y']]) liveInput(id, value => { manualCrop(key, Number(value)); });
  liveInput('strength', value => { model.strength = Number(value); });
  liveInput('ink-amount', value => { model.inkAmount = Number(value); });
  $('assigned-photo').addEventListener('change', event => edit(() => {
    selectedCrop().photo = Number(event.target.value);
    Object.assign(selectedCrop(), fitPhotoToAnchor(assets[selectedCrop().photo], geometry.panels[chosen], selectedCrop()), { autoFrame: true });
  }));
  $('layout').addEventListener('change', event => edit(() => {
    const all = [...model.panels, ...model.reserve];
    model.layout = event.target.value;
    model.panels = createPanelState(model.layout, assets.length, all);
    model.reserve = all.slice(model.panels.length);
    chosen = Math.min(chosen, model.panels.length - 1);
  }));
  $('finish').addEventListener('change', event => edit(() => { model.finish = event.target.value; }));
  $('hero-cutout').addEventListener('change', event => edit(() => { model.heroCutout = event.target.checked; }));
  $('face-fit').addEventListener('click', () => edit(() => Object.assign(selectedCrop(), fitPhotoToAnchor(assets[selectedCrop().photo], geometry.panels[chosen], selectedCrop()), { autoFrame: true })));
  $('flip').addEventListener('click', () => edit(() => { selectedCrop().flip = !selectedCrop().flip; }));
  $('reset-crop').addEventListener('click', () => edit(() => Object.assign(selectedCrop(), { x: 0, y: 0, zoom: 1, flip: false, autoFrame: false })));
  $('undo').addEventListener('click', () => history(back, forward));
  $('redo').addEventListener('click', () => history(forward, back));
  $('auto-fill').addEventListener('click', () => autoFill());
  $('photo-input').addEventListener('change', event => { enqueueImport(event.target.files); event.target.value = ''; });
  $('drop-zone').addEventListener('dragover', event => { event.preventDefault(); $('drop-zone').classList.add('over'); });
  $('drop-zone').addEventListener('dragleave', () => $('drop-zone').classList.remove('over'));
  $('drop-zone').addEventListener('drop', event => { event.preventDefault(); $('drop-zone').classList.remove('over'); enqueueImport(event.dataTransfer.files); });
  $('open-exports').addEventListener('click', showExports);
  $('close-exports').addEventListener('click', () => $('export-tray').close());
  $('download-all').addEventListener('click', () => Object.keys(FORMATS).forEach(download));
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.target.closest('input,textarea,select')) return;
    if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? history(forward, back) : history(back, forward); }
  });
}
function posterPoint(event) {
  const box = poster.getBoundingClientRect();
  return { x: (event.clientX - box.left) / box.width * poster.width, y: (event.clientY - box.top) / box.height * poster.height };
}
function wireCanvas() {
  poster.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !geometry) return;
    const point = posterPoint(event);
    const hit = hitTestPanel(geometry, point.x, point.y);
    if (hit < 0) return;
    choosePanel(hit);
    const before = serialize();
    if (selectedCrop().autoFrame) Object.assign(selectedCrop(), fitPhotoToAnchor(assets[selectedCrop().photo], geometry.panels[chosen], selectedCrop()), { autoFrame: false });
    pointer = { id: event.pointerId, before, point, crop: { ...selectedCrop() } };
    poster.setPointerCapture(event.pointerId); poster.classList.add('dragging');
  });
  poster.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const point = posterPoint(event);
    const crop = selectedCrop();
    const travel = cropTravel(assets[crop.photo].image, geometry.panels[chosen], crop.zoom);
    if (travel.x > 0) crop.x = clamp(pointer.crop.x + (point.x - pointer.point.x) / travel.x, -1, 1);
    if (travel.y > 0) crop.y = clamp(pointer.crop.y + (point.y - pointer.point.y) / travel.y, -1, 1);
    syncPanel(); queueDraw();
  });
  poster.addEventListener('lostpointercapture', () => {
    if (pointer) remember(pointer.before);
    pointer = null; poster.classList.remove('dragging');
  });
  poster.addEventListener('wheel', event => {
    if (!geometry) return;
    const point = posterPoint(event), hit = hitTestPanel(geometry, point.x, point.y);
    if (hit < 0) return;
    event.preventDefault(); choosePanel(hit);
    wheelGroup ??= serialize();
    const baseZoom = selectedCrop().autoFrame ? 1 : selectedCrop().zoom;
    manualCrop('zoom', clamp(baseZoom - Math.sign(event.deltaY) * .08, 1, 3));
    syncPanel(); queueDraw(); clearTimeout(wheelEnd);
    wheelEnd = setTimeout(() => { remember(wheelGroup); wheelGroup = undefined; }, 220);
  }, { passive: false });
}
async function boot() {
  await document.fonts.load('60px Yellowtail');
  for (const format of Object.keys(FORMATS)) {
    const tab = button(names[format], () => edit(() => { model.format = format; }));
    tab.dataset.format = format; $('format-picker').append(tab);
    const save = button('', () => download(format)); save.dataset.export = format;
    const title = document.createElement('strong'); title.textContent = names[format];
    const size = document.createElement('small'); size.textContent = FORMATS[format].join('×');
    save.append(title, size); $('export-sizes').append(save);
  }
  for (const layout of LAYOUTS) $('layout').add(new Option(layout.name, layout.id));
  for (const grade of GRADES) {
    const swatch = button('', () => edit(() => { model.grade = grade.id; }));
    swatch.dataset.grade = grade.id; swatch.title = grade.name; swatch.setAttribute('aria-label', grade.name);
    swatch.style.setProperty('--swatch', `linear-gradient(145deg,${grade.sky.join(',')})`);
    $('grades').append(swatch);
  }
  assets.push(...await Promise.all(sampleCards.map(async card => ({ ...card, image: await decode(new URL('../samples/' + card.file, import.meta.url)) }))));
  buildLibrary(); wireControls(); wireCanvas(); syncControls(); updateHistory();
  new ResizeObserver(fitPreview).observe($('preview-area'));
  queueDraw();
}
window.addEventListener('pagehide', event => { if (!event.persisted) ownedUrls.forEach(url => URL.revokeObjectURL(url)); });
if (query.has('qa') || query.has('shot')) {
  window.coverStudio = {
    inspect: () => ({ state: structuredClone(model), selected: chosen, photoCount: assets.length, photoMeta: assets.map(a => ({ name: a.name, anchored: !!a.face, silhouette: !!a.silhouette, imported: !!a.imported })), geometry: geometry && structuredClone(geometry) }),
    exportCanvas,
  };
}
boot().catch(error => { tell('The studio could not start'); console.error(error); });
