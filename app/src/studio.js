import {
  FORMATS, GRADES, LAYOUTS, canvasOf, clamp, createPanelState,
  cropTravel, drawPanelPreview, hitTestPanel, renderPoster,
} from './art.js';

const byId = id => document.getElementById(id);
const canvas = byId('poster');
const params = new URLSearchParams(location.search);
const starters = [
  ['Velvet', 'velvet.jpg'], ['Night Shift', 'night-shift.jpg'],
  ['Pier', 'pier.jpg'], ['Boulevard', 'boulevard.jpg'], ['Switchboard', 'switchboard.jpg'],
];
const formatNames = { landscape: 'Wide', portrait: 'Portrait', square: 'Square' };
const photoLibrary = [];
const objectUrls = new Set();
const undoStack = [];
const redoStack = [];
let state = {
  title: 'NEON TIDE',
  subtitle: 'One last summer',
  tagline: 'THE CITY NEVER FORGETS',
  edition: 'SUNSET EDITION',
  format: 'landscape',
  layout: 'premiere',
  grade: 'copper',
  finish: 'chrome',
  strength: .79,
  inkMode: false,
  panels: createPanelState('premiere', starters.length),
  sparePanels: [],
};

for (const field of ['title', 'subtitle', 'tagline', 'edition']) {
  if (params.has(field)) state[field] = params.get(field).slice(0, 60);
}
if (Object.hasOwn(FORMATS, params.get('format'))) state.format = params.get('format');
if (GRADES.some(grade => grade.id === params.get('grade'))) state.grade = params.get('grade');
if (LAYOUTS.some(layout => layout.id === params.get('layout'))) {
  state.layout = params.get('layout');
  state.panels = createPanelState(state.layout, starters.length);
}

if (params.has('shot') && params.has('lead')) {
  const index = Number(params.get('lead'));
  if (Number.isInteger(index) && index > 0 && index < state.panels.length) {
    const roles = [state.panels[index].role, state.panels[0].role];
    [state.panels[0].photo, state.panels[index].photo] = [index, 0];
    [state.panels[0].role, state.panels[index].role] = roles;
  }
}

let selected = 0;
let geometry;
let renderRequest;
let toastTimer;
let drag;
let wheelBefore;
let wheelTimer;
let importQueue = Promise.resolve();

function status(message) {
  byId('toast').textContent = message;
  byId('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => byId('toast').classList.remove('show'), 2400);
}

function snapshot() {
  return JSON.stringify({ state, selected });
}

function refreshHistory() {
  byId('undo').disabled = !undoStack.length;
  byId('redo').disabled = !redoStack.length;
}

function recordEdit(before) {
  if (before === snapshot()) return;
  undoStack.push(before);
  if (undoStack.length > 72) undoStack.shift();
  redoStack.length = 0;
  refreshHistory();
}

function change(action) {
  const before = snapshot();
  action();
  recordEdit(before);
  refreshControls();
  requestPoster();
}

function restore(from, to) {
  if (!from.length) return;
  to.push(snapshot());
  ({ state, selected } = JSON.parse(from.pop()));
  refreshHistory();
  refreshControls();
  requestPoster();
}

function load(url) {
  const image = new Image();
  image.src = url;
  return image.decode().then(() => image);
}

function active() {
  return state.panels[selected];
}

function createButton(text, click) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', click);
  return button;
}

function libraryControls() {
  const library = byId('library');
  const options = byId('assigned-photo');
  library.replaceChildren();
  options.replaceChildren();
  photoLibrary.forEach(({ name, image }, index) => {
    const choice = createButton('', () => change(() => { active().photo = index; }));
    choice.dataset.photo = String(index);
    choice.title = 'Assign ' + name + ' to the selected panel';
    choice.setAttribute('aria-label', choice.title);
    const preview = image.cloneNode(false);
    preview.alt = '';
    const label = document.createElement('span');
    label.textContent = name;
    choice.append(preview, label);
    library.append(choice);
    options.add(new Option(name, String(index)));
  });
  byId('photo-count').textContent = photoLibrary.length + ' available';
  byId('auto-fill').disabled = photoLibrary.length === 0;
}

function selectPanel(index) {
  selected = index;
  refreshPanel();
  placeSelection();
}

function drawPanelPicker() {
  const picker = byId('panel-picker');
  if (picker.childElementCount === state.panels.length) return;
  picker.replaceChildren();
  state.panels.forEach((_, index) => {
    const button = createButton('', () => selectPanel(index));
    const image = canvasOf(144, 98);
    image.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    button.append(image, name);
    picker.append(button);
  });
}

function refreshPanel() {
  const crop = active();
  drawPanelPicker();
  byId('panel-number').textContent = String(selected + 1).padStart(2, '0') + ' / ' + state.panels.length;
  byId('assigned-photo').value = String(crop.photo);
  byId('role').value = crop.role;
  byId('zoom').value = crop.zoom;
  byId('pan-x').value = crop.x;
  byId('pan-y').value = crop.y;
  byId('zoom-value').value = crop.zoom.toFixed(2) + '×';
  byId('x-value').value = Math.round(crop.x * 100) + '%';
  byId('y-value').value = Math.round(crop.y * 100) + '%';
  byId('flip').setAttribute('aria-pressed', crop.flip);
  drawPanelPreview(byId('panel-tile'), photoLibrary[crop.photo], crop, state, selected);
  for (const item of byId('library').children) item.setAttribute('aria-pressed', Number(item.dataset.photo) === crop.photo);
  [...byId('panel-picker').children].forEach((button, index) => {
    const current = state.panels[index];
    const role = current.role || 'Panel ' + (index + 1);
    button.lastElementChild.textContent = role;
    button.setAttribute('aria-label', 'Select panel ' + (index + 1) + ': ' + role);
    button.setAttribute('aria-pressed', index === selected);
    drawPanelPreview(button.firstElementChild, photoLibrary[current.photo], current, state, index);
  });
}

function refreshControls() {
  for (const field of ['title', 'subtitle', 'tagline', 'edition', 'layout', 'finish', 'strength']) {
    const control = byId(field);
    const value = String(state[field]);
    if (control.value !== value) control.value = value;
  }
  byId('ink').checked = state.inkMode;
  byId('strength-value').value = Math.round(state.strength * 100) + '%';
  byId('grade-label').value = GRADES.find(grade => grade.id === state.grade).name;
  byId('preview-dimensions').textContent = FORMATS[state.format].join(' × ');
  for (const control of byId('format-picker').children) control.setAttribute('aria-pressed', control.dataset.format === state.format);
  for (const swatch of byId('grades').children) swatch.setAttribute('aria-pressed', swatch.dataset.grade === state.grade);
  refreshPanel();
}

function placeSelection() {
  if (!geometry) return;
  const panel = geometry.panels[selected];
  byId('selection').setAttribute('viewBox', '0 0 ' + canvas.width + ' ' + canvas.height);
  byId('selection-border').setAttribute('points', panel?.vertices.map(point => point.join(',')).join(' ') ?? '');
}

function fitPreview() {
  const area = byId('preview-area');
  const width = area.clientWidth - 16;
  const height = area.clientHeight - 16;
  if (width < 1 || height < 1) return;
  const scale = Math.min(width / canvas.width, height / canvas.height);
  byId('preview-frame').style.width = Math.floor(canvas.width * scale) + 'px';
  byId('preview-frame').style.height = Math.floor(canvas.height * scale) + 'px';
}

function requestPoster() {
  cancelAnimationFrame(renderRequest);
  renderRequest = requestAnimationFrame(() => {
    geometry = renderPoster(canvas, state, photoLibrary);
    fitPreview();
    placeSelection();
    document.documentElement.dataset.ready = 'true';
  });
}

function autofill(first = 0, count = photoLibrary.length) {
  if (!count) return;
  change(() => {
    state.panels = state.panels.map((panel, index) => ({
      ...panel, photo: first + index % count, x: 0, y: 0, zoom: 1, flip: false,
    }));
  });
}

async function readFiles(files) {
  const first = photoLibrary.length;
  const decoded = await Promise.all(files.slice(0, 36).map(async file => {
    const url = URL.createObjectURL(file);
    try {
      const image = await load(url);
      objectUrls.add(url);
      return { name: file.name.replace(/\.[^.]+$/, ''), image };
    } catch {
      URL.revokeObjectURL(url);
      return null;
    }
  }));
  const additions = decoded.filter(Boolean);
  if (!additions.length) {
    status('No readable photos were added');
    return;
  }
  photoLibrary.push(...additions);
  libraryControls();
  autofill(first, additions.length);
  status(additions.length + (additions.length === 1 ? ' photo added' : ' photos added'));
}

function queueFiles(fileList) {
  const files = [...fileList];
  if (files.length) importQueue = importQueue.then(() => readFiles(files));
}

function exportCanvas(format) {
  const result = canvasOf(...FORMATS[format]);
  renderPoster(result, state, photoLibrary, format);
  return result;
}

function download(format) {
  const target = exportCanvas(format);
  target.toBlob(blob => {
    if (!blob) {
      status('Could not make PNG');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'neon-tide';
    link.href = url;
    link.download = filename + '-' + format + '.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
    status('PNG exported · ' + FORMATS[format].join(' × '));
  }, 'image/png');
}

function buildControls() {
  for (const [format, [w, h]] of Object.entries(FORMATS)) {
    const preview = createButton(formatNames[format], () => change(() => { state.format = format; }));
    preview.dataset.format = format;
    byId('format-picker').append(preview);
    const save = createButton('', () => download(format));
    save.dataset.export = format;
    const name = document.createElement('strong');
    name.textContent = formatNames[format];
    const dimensions = document.createElement('small');
    dimensions.textContent = w + '×' + h;
    save.setAttribute('aria-label', 'Export ' + formatNames[format] + ' PNG, ' + w + ' by ' + h);
    save.append(name, dimensions);
    byId('export-sizes').append(save);
  }
  for (const layout of LAYOUTS) byId('layout').add(new Option(layout.name, layout.id));
  for (const grade of GRADES) {
    const swatch = createButton('', () => change(() => { state.grade = grade.id; }));
    swatch.title = grade.name;
    swatch.dataset.grade = grade.id;
    swatch.setAttribute('aria-label', grade.name);
    swatch.style.setProperty('--swatch', 'linear-gradient(150deg,' + grade.sky.join(',') + ')');
    byId('grades').append(swatch);
  }
}

function continuous(id, update, panelControl = false) {
  const element = byId(id);
  let before;
  element.addEventListener('input', () => {
    before ??= snapshot();
    update(element.value);
    if (panelControl) refreshPanel();
    if (id === 'strength') byId('strength-value').value = Math.round(state.strength * 100) + '%';
    requestPoster();
  });
  element.addEventListener('change', () => {
    if (before !== undefined) recordEdit(before);
    before = undefined;
  });
}

function pointerPosition(event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * canvas.width / box.width,
    y: (event.clientY - box.top) * canvas.height / box.height,
  };
}

function bindCanvas() {
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !geometry) return;
    const { x, y } = pointerPosition(event);
    const index = hitTestPanel(geometry, x, y);
    if (index < 0) return;
    selectPanel(index);
    canvas.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, before: snapshot(), x, y, crop: { ...active() } };
    canvas.classList.add('dragging');
  });

  canvas.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const crop = active();
    const image = photoLibrary[crop.photo]?.image;
    if (!image) return;
    const point = pointerPosition(event);
    const travel = cropTravel(image, geometry.panels[selected], crop.zoom);
    if (travel.x > 0) crop.x = clamp(drag.crop.x + (point.x - drag.x) / travel.x, -1, 1);
    if (travel.y > 0) crop.y = clamp(drag.crop.y + (point.y - drag.y) / travel.y, -1, 1);
    refreshPanel();
    requestPoster();
  });

  canvas.addEventListener('lostpointercapture', () => {
    if (!drag) return;
    recordEdit(drag.before);
    drag = undefined;
    canvas.classList.remove('dragging');
  });

  canvas.addEventListener('wheel', event => {
    if (!geometry) return;
    const { x, y } = pointerPosition(event);
    const index = hitTestPanel(geometry, x, y);
    if (index < 0) return;
    event.preventDefault();
    if (selected !== index) selectPanel(index);
    wheelBefore ??= snapshot();
    const direction = Math.sign(event.deltaY);
    active().zoom = clamp(active().zoom - direction * .08, 1, 3);
    refreshPanel();
    requestPoster();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      recordEdit(wheelBefore);
      wheelBefore = undefined;
    }, 240);
  }, { passive: false });
}

function bindControls() {
  for (const field of ['title', 'subtitle', 'tagline', 'edition']) continuous(field, value => { state[field] = value; });
  continuous('role', value => { active().role = value; }, true);
  for (const [control, key] of [['zoom', 'zoom'], ['pan-x', 'x'], ['pan-y', 'y']]) {
    continuous(control, value => { active()[key] = Number(value); }, true);
  }
  continuous('strength', value => { state.strength = Number(value); });
  byId('assigned-photo').addEventListener('change', event => change(() => { active().photo = Number(event.target.value); }));
  byId('layout').addEventListener('change', event => change(() => {
    const kept = [...state.panels, ...state.sparePanels];
    state.layout = event.target.value;
    state.panels = createPanelState(state.layout, photoLibrary.length, kept);
    state.sparePanels = kept.slice(state.panels.length);
    selected = Math.min(selected, state.panels.length - 1);
  }));
  byId('finish').addEventListener('change', event => change(() => { state.finish = event.target.value; }));
  byId('ink').addEventListener('change', event => change(() => { state.inkMode = event.target.checked; }));
  byId('flip').addEventListener('click', () => change(() => { active().flip = !active().flip; }));
  byId('center').addEventListener('click', () => change(() => Object.assign(active(), { x: 0, y: 0 })));
  byId('reset-crop').addEventListener('click', () => change(() => Object.assign(active(), { x: 0, y: 0, zoom: 1, flip: false })));
  byId('undo').addEventListener('click', () => restore(undoStack, redoStack));
  byId('redo').addEventListener('click', () => restore(redoStack, undoStack));
  byId('auto-fill').addEventListener('click', () => autofill());
  byId('photo-input').addEventListener('change', event => {
    queueFiles(event.target.files);
    event.target.value = '';
  });
  const drop = byId('drop-zone');
  drop.addEventListener('dragover', event => { event.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', event => {
    event.preventDefault();
    drop.classList.remove('over');
    queueFiles(event.dataTransfer.files);
  });
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.target.matches('input,select,textarea')) return;
    if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) restore(redoStack, undoStack);
      else restore(undoStack, redoStack);
    }
  });
}

async function start() {
  buildControls();
  bindControls();
  bindCanvas();
  new ResizeObserver(fitPreview).observe(byId('preview-area'));
  const samples = await Promise.all(starters.map(async ([name, path]) => {
    const url = new URL('../samples/' + path, import.meta.url);
    return { name, image: await load(url) };
  }));
  photoLibrary.push(...samples);
  libraryControls();
  refreshHistory();
  refreshControls();
  requestPoster();
}

window.addEventListener('pagehide', event => {
  if (!event.persisted) for (const url of objectUrls) URL.revokeObjectURL(url);
});

if (params.has('qa') || params.has('shot')) {
  window.coverStudio = {
    inspect: () => ({ state: structuredClone(state), selected, photoCount: photoLibrary.length }),
    exportCanvas,
  };
}

start().catch(error => {
  status('The sample library could not load');
  console.error(error);
});
