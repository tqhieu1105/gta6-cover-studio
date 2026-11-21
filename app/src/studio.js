import { FORMATS, GRADES, LAYOUTS, createPanelState, renderPoster, drawPanelPreview,
  fitPhotoToAnchor, cropTravel, hitTestPanel, canvasOf, clamp } from './art.js';

const node = id => document.getElementById(id);
const formatLabel = { landscape: 'Wide', portrait: 'Portrait', square: 'Square' };
const DEMOS = [
  { name: 'Velvet', file: 'velvet.jpg', face: [.33, .11, .40, .53], silhouette: true },
  { name: 'Night Shift', file: 'night-shift.jpg', face: [.32, .18, .45, .65] },
  { name: 'Insider', file: 'insider.jpg', face: [.32, .17, .34, .51] },
  { name: 'Boulevard', file: 'boulevard.jpg', face: [.37, .12, .23, .22] },
  { name: 'Switchboard', file: 'switchboard.jpg', face: [.30, .16, .40, .57] },
  { name: 'Pier', file: 'pier.jpg', face: [.35, .05, .27, .29] },
];

function create(tag, text, attrs = {}) {
  const result = document.createElement(tag);
  if (text !== null) result.textContent = text;
  for (const [key, value] of Object.entries(attrs)) result.setAttribute(key, value);
  return result;
}

function button(text, callback, attrs = {}) {
  const result = create('button', text, { type: 'button', ...attrs });
  result.addEventListener('click', callback);
  return result;
}

async function decodeImage(url) {
  const result = new Image();
  result.decoding = 'async';
  result.src = url;
  await result.decode();
  if (!result.naturalWidth || !result.naturalHeight) throw Error('Empty photo');
  return result;
}

class CoverStudio {
  constructor() {
    this.photos = [];
    this.selected = 0;
    this.past = [];
    this.future = [];
    this.ownedURLs = new Set();
    this.pendingField = null;
    this.queue = Promise.resolve();
    this.canvas = node('poster');
    this.state = {
      title: 'NEON TIDE',
      subtitle: 'The coast is ours',
      tagline: 'THE CITY NEVER FORGETS',
      edition: 'SUNSET EDITION',
      format: 'landscape',
      layout: 'premiere',
      grade: 'ember',
      finish: 'chrome',
      strength: .79,
      inkAmount: .25,
      heroCutout: true,
      panels: createPanelState('premiere', 6),
      reserve: [],
    };
    const query = new URLSearchParams(location.search);
    for (const key of ['title', 'subtitle', 'tagline', 'edition']) {
      if (query.has(key)) this.state[key] = query.get(key).slice(0, node(key).maxLength);
    }
    for (const [key, allowed] of Object.entries({
      format: Object.keys(FORMATS), layout: LAYOUTS.map(item => item.id), grade: GRADES.map(item => item.id),
    })) if (allowed.includes(query.get(key))) this.state[key] = query.get(key);
    this.state.panels = createPanelState(this.state.layout, 6);
    const lead = Number(query.get('lead'));
    if (Number.isInteger(lead) && lead > 0 && lead < this.state.panels.length) {
      const a = this.state.panels[0], b = this.state.panels[lead];
      [a.photo, b.photo] = [b.photo, a.photo];
      [a.role, b.role] = [b.role, a.role];
    }
  }

  get crop() { return this.state.panels[this.selected]; }
  snapshot() { return JSON.stringify({ state: this.state, selected: this.selected }); }

  remember(before) {
    if (!before || before === this.snapshot()) return;
    this.past.push(before);
    if (this.past.length > 80) this.past.shift();
    this.future.length = 0;
  }

  finishField() {
    if (this.pendingField) this.remember(this.pendingField);
    this.pendingField = null;
  }

  change(operation) {
    this.finishField();
    const before = this.snapshot();
    operation();
    this.remember(before);
    this.refresh();
  }

  field(operation) {
    this.pendingField ??= this.snapshot();
    operation();
    this.refresh();
  }

  history(forward) {
    this.finishField();
    const source = forward ? this.future : this.past;
    const destination = forward ? this.past : this.future;
    if (!source.length) return;
    destination.push(this.snapshot());
    const restored = JSON.parse(source.pop());
    this.state = restored.state;
    this.selected = restored.selected;
    this.refresh();
  }

  select(index) {
    this.finishField();
    this.selected = clamp(index, 0, this.state.panels.length - 1);
    this.refresh();
  }

  manualCrop() {
    if (this.crop.autoFrame) {
      Object.assign(this.crop, fitPhotoToAnchor(this.photos[this.crop.photo], this.geometry.panels[this.selected], this.crop));
      this.crop.autoFrame = false;
    }
    return this.crop;
  }

  assign(index) {
    this.crop.photo = index;
    Object.assign(this.crop, fitPhotoToAnchor(this.photos[index], this.geometry.panels[this.selected], this.crop));
    this.crop.autoFrame = true;
  }

  autofill(start = 0, count = this.photos.length) {
    this.change(() => this.state.panels.forEach((crop, index) => {
      crop.photo = start + index % count;
      Object.assign(crop, fitPhotoToAnchor(this.photos[crop.photo], this.geometry.panels[index], crop));
      crop.autoFrame = true;
    }));
  }

  message(text) {
    clearTimeout(this.messageTimeout);
    node('toast').textContent = text;
    node('toast').classList.add('show');
    this.messageTimeout = setTimeout(() => node('toast').classList.remove('show'), 3000);
  }

  library() {
    node('library').replaceChildren(...this.photos.map((photo, index) => {
      const item = button(null, () => this.change(() => this.assign(index)), {
        'data-photo': index, title: photo.name, 'aria-label': `Use ${photo.name} in selected panel`,
      });
      const image = photo.image.cloneNode();
      image.alt = '';
      item.append(image, create('span', photo.name));
      return item;
    }));
    node('assigned-photo').replaceChildren(...this.photos.map((photo, index) => new Option(photo.name, String(index))));
    node('photo-count').textContent = `${this.photos.length} photos`;
  }

  importFiles(files) {
    const accepted = [...files].filter(file => file.type.startsWith('image/')).slice(0, 36);
    if (!accepted.length) { this.message('Choose JPG, PNG, WebP or another browser-readable photo.'); return; }
    this.queue = this.queue.then(async () => {
      const start = this.photos.length;
      for (const file of accepted) {
        const url = URL.createObjectURL(file);
        try {
          const image = await decodeImage(url);
          this.ownedURLs.add(url);
          const name = file.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'Your photo';
          this.photos.push({ name, image, imported: true });
        } catch { URL.revokeObjectURL(url); }
      }
      const added = this.photos.length - start;
      if (!added) { this.message('These files could not be decoded.'); return; }
      this.library();
      this.autofill(start, added);
      this.message(`${added} photo${added === 1 ? '' : 's'} added locally`);
    }).catch(error => {
      console.error(error);
      this.message('The photos could not be opened. Try another image.');
    });
  }

  exportCanvas(format) {
    const output = canvasOf(...FORMATS[format]);
    renderPoster(output, this.state, this.photos, format);
    return output;
  }

  async download(format) {
    const output = this.exportCanvas(format);
    const file = await new Promise(done => output.toBlob(done, 'image/png'));
    if (!file) { this.message('PNG encoding failed. Please try again.'); return; }
    const url = URL.createObjectURL(file);
    const title = this.state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'neon-tide';
    const link = create('a', null, { href: url, download: `${title}-${format}.png` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    this.message(`Downloaded ${FORMATS[format].join(' × ')} PNG`);
  }

  exports() {
    this.finishField();
    node('export-cards').replaceChildren(...Object.keys(FORMATS).map(format => {
      const article = create('article', null, { class: 'export-card' });
      const artwork = create('div', null, { class: 'export-art' });
      const canvas = this.exportCanvas(format);
      canvas.setAttribute('aria-label', `${formatLabel[format]} export at ${FORMATS[format].join(' by ')} pixels`);
      artwork.append(canvas);
      article.append(artwork, create('h3', formatLabel[format]), create('p', FORMATS[format].join(' × ')),
        button('Download PNG ↗', () => this.download(format), { 'data-tray-export': format }));
      return article;
    }));
    node('export-tray').showModal();
  }

  sizePreview() {
    const area = node('preview-area');
    const ratio = Math.min((area.clientWidth - 24) / this.canvas.width, (area.clientHeight - 24) / this.canvas.height);
    if (ratio <= 0) return;
    node('preview-frame').style.width = Math.floor(this.canvas.width * ratio) + 'px';
    node('preview-frame').style.height = Math.floor(this.canvas.height * ratio) + 'px';
  }

  selectionOverlay() {
    const crop = this.geometry.panels[this.selected];
    const vertices = crop.vertices.map(point => point.join(',')).join(' ');
    node('selection').setAttribute('viewBox', `0 0 ${this.canvas.width} ${this.canvas.height}`);
    ['selection-border', 'clip-border'].forEach(id => node(id).setAttribute('points', vertices));
    const grid = [1 / 3, 2 / 3].flatMap(t => [
      `M${crop.x + crop.w * t} ${crop.y}v${crop.h}`,
      `M${crop.x} ${crop.y + crop.h * t}h${crop.w}`,
    ]).join('');
    node('crop-grid').setAttribute('d', grid);
    node('crop-handles').replaceChildren(...crop.vertices.map(([x, y]) => {
      const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      Object.entries({ cx: x, cy: y, r: this.geometry.unit * 6.5 }).forEach(([key, value]) => point.setAttribute(key, value));
      return point;
    }));
    node('crop-hud').textContent = `PANEL ${this.selected + 1} / ${this.state.panels.length} · ${this.crop.zoom.toFixed(2)}× · DRAG TO POSITION`;
  }

  controls() {
    const values = { ...this.state, role: this.crop.role, zoom: this.crop.zoom,
      'assigned-photo': this.crop.photo, 'pan-x': this.crop.x, 'pan-y': this.crop.y, 'ink-amount': this.state.inkAmount };
    Object.entries(values).forEach(([id, value]) => {
      const control = node(id);
      if (control && control.value !== String(value)) control.value = String(value);
    });
    const grade = GRADES.find(item => item.id === this.state.grade);
    node('grade-label').textContent = grade.name;
    node('preview-dimensions').textContent = FORMATS[this.state.format].join(' × ');
    node('panel-number').textContent = `${this.selected + 1} / ${this.state.panels.length}`;
    node('cast-status').textContent = `${new Set(this.state.panels.map(panel => panel.photo)).size} photos · ${this.state.panels.length} panels`;
    node('zoom-value').textContent = this.crop.zoom.toFixed(2) + '×';
    node('x-value').textContent = Math.round(this.crop.x * 100) + '%';
    node('y-value').textContent = Math.round(this.crop.y * 100) + '%';
    node('strength-value').textContent = Math.round(this.state.strength * 100) + '%';
    node('ink-value').textContent = Math.round(this.state.inkAmount * 100) + '%';
    node('hero-cutout').checked = this.state.heroCutout;
    node('hero-cutout').disabled = !this.photos[this.state.panels[0].photo]?.silhouette;
    node('flip').setAttribute('aria-pressed', String(this.crop.flip));
    node('undo').disabled = !this.past.length && !this.pendingField;
    node('redo').disabled = !this.future.length;
    document.querySelectorAll('[data-format]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.format === this.state.format)));
    document.querySelectorAll('[data-grade]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.grade === this.state.grade)));
    document.querySelectorAll('[data-photo]').forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.photo) === this.crop.photo)));
  }

  panelPicker() {
    node('panel-picker').replaceChildren(...this.state.panels.map((crop, index) => {
      const item = button(null, () => this.select(index), {
        'aria-pressed': String(index === this.selected), 'aria-label': `Panel ${index + 1}: ${crop.role || 'unnamed'}`,
      });
      const preview = canvasOf(148, 86);
      drawPanelPreview(preview, this.photos[crop.photo], crop, this.state);
      item.append(preview, create('span', crop.role || `PANEL ${index + 1}`));
      return item;
    }));
    drawPanelPreview(node('panel-tile'), this.photos[this.crop.photo], this.crop, this.state);
  }

  refresh() {
    this.controls();
    cancelAnimationFrame(this.repaint);
    this.repaint = requestAnimationFrame(() => {
      this.geometry = renderPoster(this.canvas, this.state, this.photos);
      this.sizePreview();
      this.selectionOverlay();
      this.panelPicker();
      document.documentElement.dataset.ready = 'true';
    });
  }

  bindFields() {
    const ranges = { zoom: 'zoom', 'pan-x': 'x', 'pan-y': 'y' };
    for (const id of ['title', 'subtitle', 'tagline', 'edition', 'role', 'strength', 'ink-amount', ...Object.keys(ranges)]) {
      const input = node(id);
      input.addEventListener('input', () => this.field(() => {
        if (ranges[id]) this.manualCrop()[ranges[id]] = Number(input.value);
        else if (id === 'role') this.crop.role = input.value;
        else if (id === 'strength') this.state.strength = Number(input.value);
        else if (id === 'ink-amount') this.state.inkAmount = Number(input.value);
        else this.state[id] = input.value;
      }));
      input.addEventListener('change', () => { this.finishField(); this.controls(); });
      input.addEventListener('blur', () => { this.finishField(); this.controls(); });
    }
    node('layout').addEventListener('change', event => this.change(() => {
      this.state.reserve = this.state.panels.map((crop, index) => crop || this.state.reserve[index]).concat(this.state.reserve.slice(this.state.panels.length));
      this.state.layout = event.target.value;
      this.state.panels = createPanelState(this.state.layout, this.photos.length, this.state.reserve);
      this.selected = Math.min(this.selected, this.state.panels.length - 1);
    }));
    node('finish').addEventListener('change', event => this.change(() => { this.state.finish = event.target.value; }));
    node('assigned-photo').addEventListener('change', event => this.change(() => this.assign(Number(event.target.value))));
    node('hero-cutout').addEventListener('change', event => this.change(() => { this.state.heroCutout = event.target.checked; }));
    node('flip').addEventListener('click', () => this.change(() => { this.crop.flip = !this.crop.flip; }));
    node('face-fit').addEventListener('click', () => this.change(() => {
      Object.assign(this.crop, fitPhotoToAnchor(this.photos[this.crop.photo], this.geometry.panels[this.selected], this.crop));
      this.crop.autoFrame = true;
    }));
    node('reset-crop').addEventListener('click', () => this.change(() => {
      Object.assign(this.crop, { zoom: 1, x: 0, y: 0, flip: false, autoFrame: false });
    }));
    node('auto-fill').addEventListener('click', () => this.autofill());
    node('undo').addEventListener('click', () => this.history(false));
    node('redo').addEventListener('click', () => this.history(true));
    node('open-exports').addEventListener('click', () => this.exports());
    node('close-exports').addEventListener('click', () => node('export-tray').close());
    node('download-all').addEventListener('click', async () => {
      for (const format of Object.keys(FORMATS)) await this.download(format);
    });
    node('photo-input').addEventListener('change', event => {
      this.importFiles(event.target.files);
      event.target.value = '';
    });
    const drop = node('drop-zone');
    ['dragenter', 'dragover'].forEach(name => drop.addEventListener(name, event => {
      event.preventDefault(); drop.classList.add('over');
    }));
    ['dragleave', 'drop'].forEach(name => drop.addEventListener(name, event => {
      event.preventDefault(); drop.classList.remove('over');
      if (name === 'drop') this.importFiles(event.dataTransfer.files);
    }));
    document.addEventListener('keydown', event => {
      const textField = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (!textField && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault(); this.history(event.shiftKey);
      }
    });
  }

  bindCanvas() {
    const coordinates = event => {
      const bounds = this.canvas.getBoundingClientRect();
      return [(event.clientX - bounds.left) / bounds.width * this.canvas.width,
        (event.clientY - bounds.top) / bounds.height * this.canvas.height];
    };
    let drag = null;
    const stop = () => {
      if (!drag) return;
      this.remember(drag.before);
      drag = null;
      this.canvas.classList.remove('dragging');
      this.controls();
    };
    this.canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      const [x, y] = coordinates(event);
      const selected = hitTestPanel(this.geometry, x, y);
      if (selected < 0) return;
      this.select(selected);
      const before = this.snapshot();
      const crop = { ...this.manualCrop() };
      drag = { x, y, crop, before, pointer: event.pointerId };
      this.canvas.setPointerCapture(event.pointerId);
      this.canvas.classList.add('dragging');
      event.preventDefault();
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!drag || drag.pointer !== event.pointerId) return;
      const [x, y] = coordinates(event);
      const travel = cropTravel(this.photos[this.crop.photo].image, this.geometry.panels[this.selected], this.crop.zoom);
      this.crop.x = travel.x > .1 ? clamp(drag.crop.x + (x - drag.x) / travel.x, -1, 1) : 0;
      this.crop.y = travel.y > .1 ? clamp(drag.crop.y + (y - drag.y) / travel.y, -1, 1) : 0;
      this.refresh();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => this.canvas.addEventListener(name, stop));
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.change(() => {
        this.manualCrop();
        this.crop.zoom = clamp(this.crop.zoom * Math.exp(-event.deltaY * .0016), 1, 3);
      });
    }, { passive: false });
  }

  async start() {
    await document.fonts.load('60px Yellowtail');
    this.photos = await Promise.all(DEMOS.map(async demo => ({
      ...demo, image: await decodeImage(new URL('../samples/' + demo.file, import.meta.url)),
    })));
    this.library();
    for (const [format, dimensions] of Object.entries(FORMATS)) {
      node('format-picker').append(button(formatLabel[format], () => this.change(() => {
        this.state.format = format;
      }), { 'data-format': format }));
      const download = button(null, () => this.download(format), { 'data-export': format });
      download.append(create('strong', formatLabel[format]), create('small', dimensions.join('×')));
      node('export-sizes').append(download);
    }
    LAYOUTS.forEach(item => node('layout').add(new Option(item.name, item.id)));
    GRADES.forEach(grade => {
      const swatch = button(null, () => this.change(() => { this.state.grade = grade.id; }), {
        'data-grade': grade.id, title: grade.name, 'aria-label': grade.name,
      });
      swatch.style.setProperty('--swatch', `linear-gradient(135deg,${grade.sky.join(',')})`);
      node('grades').append(swatch);
    });
    this.geometry = renderPoster(this.canvas, this.state, this.photos);
    this.bindFields();
    this.bindCanvas();
    this.refresh();
    new ResizeObserver(() => this.sizePreview()).observe(node('preview-area'));
    window.addEventListener('pagehide', event => {
      if (!event.persisted) this.ownedURLs.forEach(url => URL.revokeObjectURL(url));
    });
  }
}

const studio = new CoverStudio();
const query = new URLSearchParams(location.search);
if (query.has('qa') || query.has('shot')) {
  window.coverStudio = {
    inspect: () => ({
      state: structuredClone(studio.state), selected: studio.selected, photoCount: studio.photos.length,
      geometry: studio.geometry && structuredClone(studio.geometry),
      photoMeta: studio.photos.map(photo => ({
        name: photo.name, anchored: Boolean(photo.face), silhouette: Boolean(photo.silhouette), imported: Boolean(photo.imported),
      })),
    }),
    exportCanvas: format => studio.exportCanvas(format),
  };
}
studio.start().catch(error => {
  studio.message('The studio could not start.');
  console.error(error);
});
