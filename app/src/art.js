export const FORMATS = Object.freeze({
  landscape: [1920, 1080],
  portrait: [1080, 1350],
  square: [1080, 1080],
});

export const GRADES = [
  { id: 'copper', name: 'Copper Hour', sky: ['#f55d65', '#ffa96c', '#f5d18a'], rim: '#ffd48c', cool: '#085f78', hot: '#f84a74', base: '#201326' },
  { id: 'violet', name: 'Ultraviolet', sky: ['#371956', '#d52d7b', '#fba475'], rim: '#ffc4e3', cool: '#4c30ae', hot: '#f031a9', base: '#200f37' },
  { id: 'glass', name: 'Biscayne Glass', sky: ['#1b5a7e', '#4ecbc5', '#f8d89c'], rim: '#a8fff0', cool: '#067172', hot: '#f59852', base: '#102932' },
  { id: 'ember', name: 'Signal Fire', sky: ['#6b172a', '#e9423a', '#ffc16d'], rim: '#ffe298', cool: '#272b6b', hot: '#e93043', base: '#26101e' },
  { id: 'pearl', name: 'Pearl Motel', sky: ['#546071', '#b9a4a5', '#f8e2b6'], rim: '#ffcda2', cool: '#255977', hot: '#cb6674', base: '#262335' },
  { id: 'noir', name: 'Blue After Dark', sky: ['#14294c', '#3a61a0', '#de6484'], rim: '#94eeff', cool: '#223fb1', hot: '#db236d', base: '#100e2b' },
];

export const LAYOUTS = [
  { id: 'premiere', name: 'Premiere', count: 5, style: 'cast' },
  { id: 'rush', name: 'Rush Hour', count: 5, style: 'cast', mirror: true },
  { id: 'cascade', name: 'Cascade', count: 5, style: 'cast', horizontal: true },
  { id: 'overdrive', name: 'Overdrive', count: 4, style: 'strips' },
  { id: 'double', name: 'Double Feature', count: 2, style: 'strips' },
  { id: 'trio', name: 'Three Tickets', count: 3, style: 'strips' },
  { id: 'single', name: 'One Night Only', count: 1, style: 'strips' },
  { id: 'seaside', name: 'Seaside', count: 4, style: 'strips', horizontal: true },
];

const cast = [
  { role: 'THE SIREN', x: -0.06, y: 0.93 },
  { role: 'THE FIXER', x: 0.08, y: 0.42 },
  { role: 'THE INSIDER', x: 0.02, y: 0.63 },
  { role: 'THE DRIVER', x: -0.07, y: 0.74 },
  { role: 'THE SWITCH', x: -0.12, y: 0.76 },
];

const paper = '#fff2d7';
const ink = '#170d20';
export const clamp = (n, low, high) => Math.min(high, Math.max(low, n));

export function createPanelState(layout, photoCount, previous = []) {
  const design = LAYOUTS.find(item => item.id === layout) ?? LAYOUTS[0];
  return Array.from({ length: design.count }, (_, i) => previous[i] ?? {
    ...cast[i],
    photo: i % Math.max(1, photoCount),
    zoom: 1,
    flip: false,
  });
}

export function canvasOf(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function box(left, top, right, bottom) {
  return [[left, top], [right, top], [right, bottom], [left, bottom]];
}

function polygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
}

function panelBounds(points) {
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function castWide() {
  return [
    [[.286, 0], [.714, 0], [.659, 1], [.234, 1]],
    [[0, 0], [.286, 0], [.263, .44], [0, .40]],
    [[0, .40], [.263, .44], [.234, 1], [0, 1]],
    [[.714, 0], [1, 0], [1, .398], [.69, .437]],
    [[.69, .437], [1, .398], [1, 1], [.659, 1]],
  ];
}

function castTall() {
  return [
    [[.22, 0], [.78, 0], [.69, 1], [.34, 1]],
    [[0, 0], [.22, 0], [.274, .45], [0, .50]],
    [[0, .50], [.274, .45], [.34, 1], [0, 1]],
    [[.78, 0], [1, 0], [1, .49], [.7422, .42]],
    [[.7422, .42], [1, .49], [1, 1], [.69, 1]],
  ];
}

function castHorizon() {
  return [
    [[.231, 0], [.769, 0], [.723, .51], [.284, .59]],
    [[0, 0], [.231, 0], [.284, .59], [0, .48]],
    [[0, .48], [.284, .59], [.482, .554], [.451, 1], [0, 1]],
    [[.769, 0], [1, 0], [1, .475], [.723, .51]],
    [[.482, .554], [.723, .51], [1, .475], [1, 1], [.451, 1]],
  ];
}

function stripLayout(count, horizontal) {
  if (count === 1) return [box(0, 0, 1, 1)];
  const boundaries = [0, .43];
  for (let i = 2; i <= count; i++) boundaries.push(.43 + .57 * (i - 1) / (count - 1));
  return boundaries.slice(0, -1).map((left, i) => {
    const right = boundaries[i + 1];
    const cut = .065;
    const shape = [[left ? left + cut : 0, 0], [right < 1 ? right + cut : 1, 0],
      [right < 1 ? right - cut : 1, 1], [left ? left - cut : 0, 1]];
    return horizontal ? shape.map(([x, y]) => [y, x]) : shape;
  });
}

export function posterGeometry(state, width, height) {
  const design = LAYOUTS.find(item => item.id === state.layout) ?? LAYOUTS[0];
  const wide = width > height * 1.13;
  const unit = Math.min(width, height) / 1080;
  const edge = 25 * unit;
  const y0 = 67 * unit;
  const fieldH = height * (wide ? .866 : .76);
  const fieldW = width - 2 * edge;
  const shapes = design.style === 'cast'
    ? (design.horizontal ? castHorizon() : wide ? castWide() : castTall())
    : stripLayout(design.count, design.horizontal);
  const panels = shapes.map((points, index) => {
    const vertices = points.map(([x, y]) => [edge + (design.mirror ? 1 - x : x) * fieldW, y0 + y * fieldH]);
    return { index, vertices, ...panelBounds(vertices) };
  });
  return { width, height, unit, wide, edge, y0, fieldH, fieldW, panels };
}

export function hitTestPanel(geometry, x, y) {
  for (const panel of geometry.panels) {
    let inside = false;
    const vertices = panel.vertices;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const [a, b] = vertices[i];
      const [c, d] = vertices[j];
      if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) inside = !inside;
    }
    if (inside) return panel.index;
  }
  return -1;
}

function ramp(ctx, x0, y0, x1, y1, colors) {
  const tint = ctx.createLinearGradient(x0, y0, x1, y1);
  colors.forEach((item, i) => {
    const stop = Array.isArray(item) ? item : [i / (colors.length - 1), item];
    tint.addColorStop(...stop);
  });
  return tint;
}

function caption(ctx, value, x, y, size, options = {}) {
  const { align = 'left', color = paper, italic = false, family = 'sans-serif', weight = 700, tracking = 0, limit } = options;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  ctx.letterSpacing = `${tracking}px`;
  if (limit) ctx.fillText(value, x, y, limit);
  else ctx.fillText(value, x, y);
  ctx.letterSpacing = '0px';
}

export function cropTravel(image, rect, zoom = 1) {
  const sourceW = image.naturalWidth || image.width;
  const sourceH = image.naturalHeight || image.height;
  const scale = Math.max(rect.w / sourceW, rect.h / sourceH) * zoom;
  const w = sourceW * scale;
  const h = sourceH * scale;
  return { w, h, x: Math.max(0, (w - rect.w) / 2), y: Math.max(0, (h - rect.h) / 2) };
}

const lightByRole = [
  ['#ffa751', '#ad4572'],
  ['#ed8b79', '#80408a'],
  ['#eeb651', '#07838c'],
  ['#ff8270', '#ad2981'],
  ['#fc9c60', '#3d7990'],
];
const colorHex = (color, opacity) => color + Math.round(255 * clamp(opacity, 0, 1)).toString(16).padStart(2, '0');

function projectPhoto(ctx, asset, rect, crop, grade, amount, index, inkMode) {
  const image = asset?.image;
  const { x, y, w, h } = rect;
  if (!image) {
    ctx.fillStyle = ramp(ctx, x, y, x + w, y + h, grade.sky);
    ctx.fillRect(x, y, w, h);
    return;
  }

  const fit = cropTravel(image, rect, crop.zoom);
  const drawX = x + w / 2 + fit.x * crop.x;
  const drawY = y + h / 2 + fit.y * crop.y;
  ctx.save();
  ctx.translate(drawX, drawY);
  if (crop.flip) ctx.scale(-1, 1);
  const contrast = 1.02 + amount * (inkMode ? .32 : .15);
  const saturation = 1.03 + amount * (inkMode ? .32 : .48);
  ctx.filter = `saturate(${saturation}) contrast(${contrast})`;
  ctx.drawImage(image, -fit.w / 2, -fit.h / 2, fit.w, fit.h);
  ctx.restore();

  if (!amount) return;
  const sides = index % 2 === 0 ? [x, x + w] : [x + w, x];
  const [light, shadow] = grade.id === 'copper' ? lightByRole[index % lightByRole.length] : [grade.hot, grade.cool];
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = ramp(ctx, sides[0], y, sides[1], y + h, [
    colorHex(light, amount), colorHex(light, amount * .47), colorHex(shadow, amount * .91),
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = ramp(ctx, x, y, x + w, y + h, [
    colorHex(light, amount * .22), '#0000', colorHex(shadow, amount * (index === 0 ? .33 : .48)),
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = ramp(ctx, x, y, x, y + h, [colorHex(ink, .10 * amount), '#0000', colorHex(grade.base, amount * .36)]);
  ctx.fillRect(x, y, w, h);
}

function seedRandom(seed) {
  return () => {
    seed = Math.imul(1664525, seed) + 1013904223 | 0;
    return (seed >>> 0) / 4294967296;
  };
}

function palm(ctx, x, y, size, sway, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size * sway, size);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-.05, 0);
  ctx.quadraticCurveTo(-.05, -.52, .19, -1);
  ctx.quadraticCurveTo(.06, -.54, .014, 0);
  ctx.fill();
  for (let i = 0; i < 7; i++) {
    const sl = Math.cos(i * .89) * .56;
    const lift = -.94 - Math.sin(i * 1.67) * .18;
    ctx.beginPath();
    ctx.moveTo(.17, -.95);
    ctx.quadraticCurveTo(.18 + sl * .5, lift - .23, .18 + sl, lift + .06);
    ctx.quadraticCurveTo(.18 + sl * .72, lift - .03, .17, -.95);
    ctx.fill();
  }
  ctx.restore();
}

const velvetProfile = 'M34 442C42 419 36 386 34 366C29 340 22 320 24 291C18 268 18 238 22 209C27 191 34 183 32 168C38 159 44 151 52 146C55 137 65 134 68 124C66 120 63 116 64 111C72 108 74 100 83 93C91 80 99 71 111 59C122 52 134 43 145 39C156 30 170 26 182 23C203 17 225 14 240 23C256 17 268 26 281 32C297 36 305 44 315 59C324 74 323 92 327 103C326 113 320 120 325 130C329 137 334 145 337 153C339 160 331 162 326 166C327 173 335 180 335 189C337 197 335 203 339 213C343 225 342 232 336 238C332 244 322 245 310 248C308 260 296 274 294 284C289 295 299 304 312 307C325 310 327 322 322 331C317 340 322 348 326 356C330 367 337 373 341 383C335 389 322 389 321 397C322 410 330 424 325 442Z';

function paintLead(ctx, asset, panel, crop, grade, amount, inkMode) {
  if (!asset?.backdrop || amount < .2) {
    projectPhoto(ctx, asset, panel, crop, grade, amount, 0, inkMode);
    return;
  }

  const { x, y, w, h } = panel;
  const fit = cropTravel(asset.image, panel, crop.zoom);
  const transform = new DOMMatrix()
    .translate(x + w / 2 + fit.x * crop.x, y + h / 2 + fit.y * crop.y)
    .scale(crop.flip ? -1 : 1, 1)
    .translate(-fit.w / 2, -fit.h / 2)
    .scale(fit.w / 451, fit.h / 442);
  const outline = new Path2D();
  outline.addPath(new Path2D(velvetProfile), transform);

  ctx.fillStyle = ramp(ctx, x, y, x + w * .13, y + h, [
    '#30283c', grade.sky[0], grade.sky[2], grade.hot, grade.base,
  ]);
  ctx.fillRect(x, y, w, h);
  const sunX = x + w * .79;
  const sunY = y + h * .43;
  const sun = ctx.createRadialGradient(sunX, sunY, 1, sunX, sunY, w * .38);
  sun.addColorStop(0, '#fff6cace');
  sun.addColorStop(.20, '#fff1c17d');
  sun.addColorStop(.57, colorHex(grade.rim, .42));
  sun.addColorStop(1, '#0000');
  ctx.fillStyle = sun;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#29172b99';
  ctx.fillRect(x, y + h * .69, w, h * .31);
  palm(ctx, x + w * .87, y + h * .71, h * .53, -1, '#462640d2');
  palm(ctx, x + w * .19, y + h * .78, h * .62, 1, '#512745b8');
  palm(ctx, x + w * .76, y + h * .74, h * .26, .83, '#663144c2');

  ctx.save();
  ctx.strokeStyle = colorHex(grade.rim, .37);
  ctx.lineWidth = h * .007;
  ctx.lineJoin = 'round';
  ctx.shadowColor = grade.rim;
  ctx.shadowBlur = h * .026;
  ctx.stroke(outline);
  ctx.shadowBlur = 0;
  ctx.clip(outline);
  projectPhoto(ctx, asset, panel, crop, grade, amount, 0, inkMode);
  ctx.restore();
}

function causeway(ctx, geometry, grade) {
  const { width: w, height: h, edge, unit: u } = geometry;
  const top = h * .561;
  ctx.fillStyle = ramp(ctx, 0, top, 0, h, [grade.sky[0], grade.sky[2], grade.cool, grade.base]);
  ctx.fillRect(edge, top, w - edge * 2, h - top - edge);
  ctx.save();
  ctx.beginPath();
  ctx.rect(edge, top, w - 2 * edge, h - top - edge);
  ctx.clip();
  const rand = seedRandom(1297);
  const horizon = h * .869;
  const glow = ctx.createRadialGradient(w * .38, horizon - 36 * u, 9 * u, w * .38, horizon, w * .35);
  glow.addColorStop(0, colorHex(grade.rim, .88));
  glow.addColorStop(.51, colorHex(grade.hot, .57));
  glow.addColorStop(1, '#0000');
  ctx.fillStyle = glow;
  ctx.fillRect(edge, top, w - 2 * edge, h - top);
  ctx.strokeStyle = colorHex(grade.rim, .51);
  ctx.lineWidth = 2 * u;
  for (let i = 0; i < 4; i++) {
    const head = w * (.08 + i * .075);
    const tail = w * (.25 + i * .13);
    ctx.beginPath();
    ctx.moveTo(head, horizon);
    ctx.quadraticCurveTo(tail, horizon - 18 * u, w * .99, horizon + (12 + i * 9) * u);
    ctx.stroke();
  }

  for (let i = 0; i < 43; i++) {
    const left = i * w / 42;
    const bw = (9 + rand() * 39) * u;
    const bh = (6 + rand() ** 2 * 52) * u;
    ctx.fillStyle = i % 3 === 0 ? '#492036' : '#2b182e';
    ctx.fillRect(left, horizon - bh, bw, bh);
    ctx.fillStyle = colorHex(grade.rim, .61);
    for (let wy = horizon - bh + 5 * u; wy < horizon - 4 * u; wy += 5 * u) {
      for (let wx = left + 3 * u; wx < left + bw - 3 * u; wx += 6 * u) {
        if (rand() > .41) ctx.fillRect(wx, wy, 2.6 * u, 1.6 * u);
      }
    }
  }
  for (let i = 0; i < 38; i++) {
    const y = horizon + (4 + rand() * 73) * u;
    const x = w * rand();
    ctx.fillStyle = colorHex(i % 2 ? grade.rim : grade.hot, .18 + rand() * .31);
    ctx.fillRect(x, y, u * (4 + rand() * 78), u * (.6 + rand() * 1.5));
  }
  palm(ctx, edge + 29 * u, h * .937, 113 * u, 1, '#29182b');
  palm(ctx, w - edge - 36 * u, h * .943, 164 * u, -1, '#201226');
  ctx.restore();
}

function frame(ctx, geometry, grade, state) {
  const { width: w, height: h, unit: u, edge } = geometry;
  ctx.strokeStyle = colorHex(grade.rim, .76);
  ctx.lineWidth = u * 1.6;
  ctx.strokeRect(edge - 9 * u, edge - 10 * u, w - 2 * edge + 18 * u, h - 2 * edge + 20 * u);
  ctx.fillStyle = grade.rim;
  for (const x of [edge - 9 * u, w - edge + 9 * u - 14 * u]) {
    ctx.fillRect(x, edge - 10 * u, 14 * u, 2.8 * u);
    ctx.fillRect(x, h - edge + 7 * u, 14 * u, 2.8 * u);
  }
  const y = 52 * u;
  caption(ctx, 'NIGHTFALL PICTURES', edge + 5 * u, y, 18 * u, { tracking: 1.7 * u });
  caption(ctx, 'BISCAYNE BAY  /  SOUTH FLORIDA', w / 2, y, 17 * u, {
    align: 'center', color: grade.rim, tracking: 2.4 * u, limit: w * .37,
  });
  const editionWidth = 158 * u;
  const right = w - edge - 3 * u;
  ctx.fillStyle = grade.rim;
  polygon(ctx, [[right - editionWidth + 5 * u, y - 19 * u], [right, y - 19 * u], [right - 5 * u, y + 5 * u], [right - editionWidth, y + 5 * u]]);
  ctx.fill();
  caption(ctx, state.edition.toUpperCase(), right - editionWidth / 2, y - 2 * u, 12 * u, {
    align: 'center', color: ink, tracking: u, limit: editionWidth - 17 * u,
  });
}

function roleCard(ctx, panel, role, geometry, grade) {
  const name = role.trim().toUpperCase();
  if (!name) return;
  const { unit: u, width, y0, edge, fieldH } = geometry;
  const isLead = panel.index === 0;
  const y = isLead ? y0 + Math.min(fieldH * .54, panel.h * .76) : panel.y + 36 * u;
  const edges = [];
  for (let i = 0; i < panel.vertices.length; i++) {
    const [ax, ay] = panel.vertices[i];
    const [bx, by] = panel.vertices[(i + 1) % panel.vertices.length];
    if ((ay < y) !== (by < y)) edges.push(ax + (bx - ax) * (y - ay) / (by - ay));
  }
  if (edges.length < 2) return;
  const left = Math.min(...edges) + 13 * u;
  const right = Math.max(...edges) - 13 * u;
  const size = (isLead ? 24 : 22) * u;
  ctx.font = `800 ${size}px sans-serif`;
  const labelWidth = Math.max(24 * u, Math.min(ctx.measureText(name).width + 34 * u, right - left, width * .24));
  const x = left > width / 2 ? right - labelWidth : Math.max(edge + 9 * u, left);
  ctx.fillStyle = isLead ? grade.rim : paper;
  polygon(ctx, [[x + 5 * u, y - 23 * u], [x + labelWidth, y - 23 * u], [x + labelWidth - 5 * u, y + 5 * u], [x, y + 5 * u]]);
  ctx.fill();
  ctx.fillStyle = isLead ? grade.hot : grade.cool;
  ctx.fillRect(x + 8 * u, y - 12 * u, 4 * u, 8 * u);
  caption(ctx, name, x + 18 * u, y - 2 * u, size, { color: ink, weight: 850, limit: labelWidth - 24 * u });
}

const letterforms = {
  A: 'M0 100 24 0H61L86 100H62L57 78H27L22 100ZM32 57H52L42 18Z',
  B: 'M2 0H63L79 15V40L69 49 83 60V85L67 100H2ZM24 20V40H53L57 36V25L52 20ZM24 59V80H56L61 75V64L56 59Z',
  C: 'M16 0H79V22H28L22 28V72L28 78H79V100H16L0 84V16Z',
  D: 'M1 0H66L84 18V82L66 100H1ZM24 22V78H56L62 72V28L56 22Z',
  E: 'M1 0H78V22H25V39H69V59H25V78H78V100H1Z',
  F: 'M1 0H79V22H25V40H69V61H25V100H1Z',
  G: 'M16 0H80V22H28L22 28V72L28 78H60V61H43V41H82V84L66 100H16L0 84V16Z',
  H: 'M1 0H24V38H62V0H85V100H62V60H24V100H1Z',
  I: 'M0 0H56V20H39V80H56V100H0V80H17V20H0Z',
  J: 'M60 0H83V83L66 100H15L0 85V66H22V73L27 78H54L60 72Z',
  K: 'M2 0H25V40H35L65 0H91L53 49 93 100H66L34 60H25V100H2Z',
  L: 'M3 0H26V78H78V100H3Z',
  M: 'M1 0H22L48 36 74 0H95V100H73V33L48 66 23 33V100H1Z',
  N: 'M1 0H22L64 62V0H86V100H65L23 38V100H1Z',
  O: 'M16 0H70L86 16V84L70 100H16L0 84V16ZM28 22 22 28V72L28 78H58L64 72V28L58 22Z',
  P: 'M1 0H68L84 16V51L68 67H24V100H1ZM24 22V46H55L62 40V28L56 22Z',
  Q: 'M16 0H70L86 16V80L77 89 90 101 77 115 61 100H16L0 84V16ZM28 22 22 28V72L28 78H48L38 68 50 55 64 67V28L58 22Z',
  R: 'M2 0H65L82 17V48L66 64 87 100H61L39 65H25V100H2ZM25 22V44H55L60 39V27L55 22Z',
  S: 'M15 0H80V22H27L22 27V35L27 39H68L83 54V84L67 100H0V78H55L61 72V64L56 59H16L0 43V16Z',
  T: 'M0 0H88V22H55V100H32V22H0Z',
  U: 'M0 0H23V72L29 78H57L63 72V0H86V84L70 100H16L0 84Z',
  V: 'M0 0H24L44 74 65 0H88L58 100H30Z',
  W: 'M0 0H22L35 66 52 20H69L86 66 99 0H122L100 100H78L61 54 44 100H22Z',
  X: 'M0 0H27L44 29 62 0H88L57 48 91 100H64L44 67 24 100H0L31 49Z',
  Y: 'M0 0H26L46 36 66 0H92L57 58V100H34V58Z',
  Z: 'M0 0H83V19L29 78H85V100H0V80L54 22H0Z',
  0: 'M17 0H65L82 17V83L65 100H17L0 83V17ZM28 22 22 28V72L28 78H54L60 72V28L54 22Z',
  1: 'M5 11 29 0H49V80H70V100H3V80H26V23L5 31Z',
  2: 'M15 0H66L82 16V44L69 57 22 75V79H82V100H0V66L15 53 60 36V27L55 22H26L21 27V36H0V16Z',
  3: 'M1 0H65L81 16V38L71 49 83 61V84L67 100H1V78H55L61 72V64L56 59H18V40H55L60 35V27L55 22H1Z',
  4: 'M45 0H69V60H82V81H69V100H48V81H0V64ZM48 31 27 60H48Z',
  5: 'M2 0H80V22H23V39H65L81 55V84L65 100H1V78H53L59 72V64L54 59H2Z',
  6: 'M16 0H77V22H28L22 28V39H65L81 55V84L65 100H16L0 84V16ZM22 59V73L27 78H54L60 72V65L54 59Z',
  7: 'M1 0H83V18L42 100H17L57 22H1Z',
  8: 'M16 0H66L81 16V38L71 48 83 60V84L67 100H16L0 84V60L11 49 2 39V16ZM24 25V36L29 40H54L59 35V26L54 21H28ZM22 64V73L27 79H55L61 73V65L55 59H27Z',
  9: 'M16 0H66L82 16V84L66 100H5V78H54L60 72V61H16L0 45V16ZM23 28V34L29 40H60V27L55 22H29Z',
  '!': 'M0 0H22V67H0ZM0 79H22V100H0Z',
  '?': 'M0 15 15 0H55L70 15V42L44 62V71H23V51L48 33V27L43 22H25L20 28V36H0ZM23 81H44V100H23Z',
  '-': 'M0 45H42V62H0Z',
  '&': 'M16 0H51L64 13V29L53 41 66 54 78 39 92 51 79 69 103 100H76L65 87 52 100H16L0 84V58L19 40 8 26V11ZM30 17 26 21 35 31 45 23V20L42 17ZM22 62V75L27 80H44L51 73 33 54Z',
};

const advances = { I: 56, M: 95, W: 122, 1: 70, '!': 22, '?': 70, '-': 42, '&': 103 };

function titleShape(value) {
  const text = value.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  if ([...text].some(letter => letter !== ' ' && !letterforms[letter])) return null;
  const outline = new Path2D();
  let advance = 0;
  for (const letter of text) {
    if (letter === ' ') {
      advance += 42;
      continue;
    }
    outline.addPath(new Path2D(letterforms[letter]), new DOMMatrix().translate(advance, 0));
    advance += (advances[letter] ?? 87) + 9;
  }
  return { outline, advance: advance - 5 };
}

function titlePaint(ctx, height, grade, finish) {
  if (finish === 'paper') return ramp(ctx, 0, 0, 0, height, [paper, grade.rim]);
  if (finish === 'neon') return ramp(ctx, 0, 0, 0, height, [paper, grade.rim, grade.hot, paper]);
  return ramp(ctx, 0, 0, 0, height, [
    [0, '#fff8e4'], [.18, '#ffe6ab'], [.43, '#ffaf60'], [.49, '#a02754'],
    [.515, '#fff7d7'], [.557, '#fecda0'], [.76, '#f69683'], [.95, '#e86d97'], [1, '#b74482'],
  ]);
}

const scriptLetters = {
  a: [31, 'M0 37C8 31 10 18 21 17C33 16 28 36 19 38C8 40 13 17 24 18M28 18C21 30 22 42 38 30'],
  b: [30, 'M0 38C9 28 30-8 25-9C16-12 10 25 10 32C9 44 26 40 30 26C35 10 21 17 15 29M24 38C28 39 34 34 37 30'],
  c: [26, 'M0 37C10 28 11 17 23 17C33 16 25 25 22 24M23 17C9 13 5 41 20 38C25 37 29 34 33 30'],
  d: [33, 'M0 37C7 31 10 18 23 17C31 16 28 36 18 38C7 40 12 18 23 18M26 34C28 19 45-11 39-10C29-10 21 32 29 37C34 41 39 32 40 30'],
  e: [25, 'M0 37C6 32 14 19 22 17C34 14 28 29 13 29C5 43 22 42 32 30'],
  f: [27, 'M0 37C11 26 31-11 27-13C20-20 10 16 10 41C11 65-1 63 3 47C8 33 19 31 31 30M1 22C12 24 23 23 27 22'],
  g: [32, 'M0 37C7 30 12 16 23 17C34 17 28 37 19 39C6 42 10 17 23 18M29 19C23 33 21 66 9 62C-2 55 20 44 39 30'],
  h: [31, 'M0 37C8 30 28-7 24-10C14-14 6 33 8 38C12 35 18 15 26 17C36 19 16 40 28 38C33 38 36 33 38 30'],
  i: [18, 'M0 37C5 32 10 22 14 18C10 27 7 40 17 37C20 36 23 33 25 30M17 7L17 8'],
  j: [20, 'M0 37C6 31 10 24 15 18C12 34 12 66 0 62C-9 57 9 43 27 30M18 7L18 8'],
  k: [30, 'M0 37C8 28 27-10 23-11C15-13 6 31 8 38M10 31C20 21 31 12 32 19C33 26 13 29 14 31C19 32 14 42 27 37C31 35 34 32 37 30'],
  l: [19, 'M0 37C11 24 31-7 22-10C13-14 2 38 14 38C19 38 23 33 26 30'],
  m: [47, 'M0 37C6 31 9 22 14 18C10 29 8 35 9 38C14 29 23 12 28 18C31 23 21 36 23 38C27 33 37 13 42 18C47 23 33 41 45 37C49 36 52 33 54 30'],
  n: [33, 'M0 37C7 30 11 18 15 18C10 29 9 36 10 38C14 33 26 12 31 18C36 24 22 41 32 37C36 36 39 33 40 30'],
  o: [30, 'M0 37C8 28 11 16 22 17C37 17 27 40 17 39C5 38 11 18 22 17C24 23 30 27 37 30'],
  p: [33, 'M0 37C6 31 10 22 15 18L2 60M10 34C17 21 27 10 31 20C36 31 22 43 15 36M24 38C30 38 36 34 40 30'],
  q: [32, 'M0 37C9 29 11 17 24 17C33 18 27 39 16 39C6 38 13 18 23 18M30 18C25 31 18 57 23 60C28 64 33 45 24 43C28 40 35 34 39 30'],
  r: [26, 'M0 37C5 32 10 22 12 17C19 18 25 15 24 19C18 23 14 39 25 37C29 36 32 33 33 30'],
  s: [26, 'M0 37C7 29 21 15 21 17C21 25 29 28 23 35C16 43 6 38 11 33M21 37C26 38 31 33 33 30'],
  t: [21, 'M0 37C7 29 18 9 22 5C14 26 7 40 18 38C22 37 26 33 28 30M5 19C14 20 25 19 30 18'],
  u: [33, 'M0 37C7 30 11 20 14 18C9 29 5 40 15 38C21 37 26 24 29 18C25 28 23 41 33 37C36 36 38 33 40 30'],
  v: [29, 'M0 37C6 30 10 20 13 18C7 30 10 43 18 36C26 30 30 16 27 17C23 21 29 28 36 30'],
  w: [43, 'M0 37C8 30 10 20 13 18C8 29 7 42 16 37C23 33 28 18 28 18C22 31 24 43 32 35C39 28 43 16 40 17C37 23 41 28 50 30'],
  x: [30, 'M0 37C6 31 8 19 14 18C20 16 15 37 24 37C30 37 34 33 37 30M29 18C20 26 13 35 5 40'],
  y: [32, 'M0 37C6 30 9 20 14 18C7 30 6 43 18 36C24 32 28 22 30 18C24 34 20 65 7 62C-2 56 20 44 39 30'],
  z: [29, 'M0 37C8 30 10 18 14 18C19 18 26 21 29 18C23 27 13 34 12 37C19 33 28 34 25 45C22 57 6 65 7 55C8 46 22 40 36 30'],
};

function brushSubtitle(ctx, value, center, baseline, height, maxWidth, grade) {
  const chars = [...value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()];
  if (chars.some(char => char !== ' ' && !scriptLetters[char])) return false;
  const outline = new Path2D();
  let pen = 0;
  for (const char of chars) {
    if (char === ' ') {
      pen += 18;
      continue;
    }
    const [advance, path] = scriptLetters[char];
    outline.addPath(new Path2D(path), new DOMMatrix().translate(pen, 0));
    pen += advance;
  }
  const scale = Math.min(height / 50, maxWidth / Math.max(1, pen));
  ctx.save();
  ctx.translate(center - pen * scale / 2, baseline - 38 * scale);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 8.2;
  ctx.shadowColor = ink;
  ctx.shadowBlur = 8;
  ctx.stroke(outline);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = grade.rim;
  ctx.lineWidth = 3.9;
  ctx.stroke(outline);
  ctx.strokeStyle = paper;
  ctx.lineWidth = 2.25;
  ctx.stroke(outline);
  ctx.restore();
  return true;
}

function titleLockup(ctx, geometry, grade, state) {
  const { width: w, height: h, unit: u, wide } = geometry;
  const value = state.title.trim() || 'NEON TIDE';
  const y = h * (wide ? .658 : .695);
  const height = h * (wide ? .195 : .147);
  const shape = titleShape(value);
  if (shape && shape.advance > 0) {
    const width = Math.min(w * .85, height * shape.advance / 87);
    const start = (w - width) / 2 + height * .074;
    ctx.save();
    ctx.translate(start, y);
    ctx.transform(width / shape.advance, 0, -.15 * height / 100, height / 100, 0, 0);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 10;
    ctx.save();
    ctx.translate(-2, 6);
    ctx.fillStyle = '#6e2c66';
    ctx.stroke(shape.outline);
    ctx.fill(shape.outline, 'evenodd');
    ctx.restore();
    ctx.stroke(shape.outline);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffce98';
    ctx.stroke(shape.outline);
    ctx.fillStyle = titlePaint(ctx, 100, grade, state.finish);
    ctx.fill(shape.outline, 'evenodd');
    ctx.restore();
  } else {
    ctx.save();
    ctx.font = `900 italic ${height * 1.14}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = u * 13;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ink;
    ctx.strokeText(value.toUpperCase(), w / 2, y + height, w * .85);
    ctx.fillStyle = ramp(ctx, 0, y, 0, y + height, [paper, grade.rim, grade.hot]);
    ctx.fillText(value.toUpperCase(), w / 2, y + height, w * .85);
    ctx.restore();
  }

  const subtitle = state.subtitle.trim();
  if (subtitle) {
    const size = (wide ? 79 : 62) * u;
    const baseline = h * (wide ? .917 : .899);
    ctx.save();
    ctx.shadowColor = ink;
    ctx.shadowBlur = 12 * u;
    ctx.shadowOffsetY = 3 * u;
    if (!brushSubtitle(ctx, subtitle, w * (wide ? .537 : .51), baseline, size, w * .69, grade)) {
      caption(ctx, subtitle, w * (wide ? .537 : .51), baseline, size, {
        align: 'center', italic: true, family: 'serif', weight: 700, limit: w * .69,
      });
    }
    ctx.restore();
  }
}

function pressSeal(ctx, x, y, radius, grade) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.13);
  const outline = [];
  for (let i = 0; i < 36; i++) {
    const angle = i * Math.PI / 18;
    const distance = radius * (i % 2 ? .94 : 1);
    outline.push([Math.cos(angle) * distance, Math.sin(angle) * distance]);
  }
  polygon(ctx, outline);
  ctx.fillStyle = grade.rim;
  ctx.strokeStyle = ink;
  ctx.lineWidth = radius * .105;
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, radius * .77, 0, Math.PI * 2);
  ctx.lineWidth = radius * .035;
  ctx.stroke();
  caption(ctx, 'NT', 0, radius * .20, radius * .75, { align: 'center', color: ink, weight: 900, italic: true });
  caption(ctx, 'STUDIO', 0, radius * .52, radius * .19, { align: 'center', color: ink, tracking: radius * .025 });
  ctx.restore();
}

function getawayCoupe(ctx, geometry, grade) {
  const { wide, width, height, unit } = geometry;
  if (!wide) return;
  ctx.save();
  const scale = unit * .91;
  ctx.translate(width * .055, height * .871);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';

  ctx.fillStyle = ramp(ctx, 0, 0, 0, 90, ['#fc94b6', '#8c235c', '#3b123b']);
  const shell = new Path2D('M0 43 22 30 86 22 119 0 188 0 237 24 285 33 299 44 299 62 287 67H16L0 60Z');
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.stroke(shell);
  ctx.fill(shell);
  ctx.fillStyle = '#132135';
  ctx.fill(new Path2D('M99 23 124 5H160V24ZM169 5H185L224 24H169Z'));
  ctx.fillStyle = '#efc99b91';
  ctx.fill(new Path2D('M120 7H149L107 22H100ZM171 7H182L210 22H171Z'));
  ctx.strokeStyle = colorHex(grade.rim, .9);
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(23, 34);
  ctx.lineTo(84, 28);
  ctx.lineTo(238, 29);
  ctx.lineTo(284, 38);
  ctx.moveTo(103, 35);
  ctx.lineTo(199, 35);
  ctx.stroke();

  for (const x of [58, 246]) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(x, 62, 24, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c3a5b5';
    ctx.beginPath();
    ctx.arc(x, 62, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#483049';
    ctx.lineWidth = 2.3;
    for (let ray = 0; ray < 5; ray++) {
      const angle = ray * Math.PI * .4;
      ctx.beginPath();
      ctx.moveTo(x, 62);
      ctx.lineTo(x + 11 * Math.cos(angle), 62 + 11 * Math.sin(angle));
      ctx.stroke();
    }
    ctx.fillStyle = '#eee2d6';
    ctx.fillRect(x - 2, 60, 4, 4);
  }
  ctx.fillStyle = '#fdea9d';
  ctx.fillRect(278, 40, 15, 6);
  ctx.fillStyle = '#e76b84';
  ctx.fillRect(4, 42, 11, 6);
  ctx.fillStyle = '#27172f';
  ctx.fillRect(142, 37, 17, 3);
  ctx.fillStyle = '#79aebe';
  ctx.fillRect(15, 54, 31, 3);
  ctx.fillRect(272, 55, 19, 3);
  ctx.fillStyle = '#e296b457';
  ctx.fillRect(-13, 87, 331, 2);
  ctx.restore();
}

function filmFooter(ctx, geometry, grade, state) {
  const { width: w, height: h, unit: u, edge } = geometry;
  const line = h - 60 * u;
  const baseline = h - 32 * u;
  ctx.fillStyle = ink;
  ctx.fillRect(edge, line, w - 2 * edge, 42 * u);
  ctx.fillStyle = colorHex(grade.rim, .64);
  ctx.fillRect(edge, line, w - 2 * edge, u);
  const left = edge + 15 * u;
  caption(ctx, '★ ★ ★ ★ ★', left, baseline, 17 * u, { color: grade.rim, tracking: 2.4 * u });
  caption(ctx, state.tagline.toUpperCase(), w / 2, baseline, 22 * u, {
    align: 'center', tracking: 2.2 * u, limit: w * .58,
  });
  const right = w - edge - 101 * u;
  const bars = [2,1,3,1,2,3,1,4,1,2,2,1,4,1,3,3,1,2,1];
  let offset = 0;
  ctx.fillStyle = paper;
  ctx.fillRect(right, baseline - 16 * u, 85 * u, 21 * u);
  ctx.fillStyle = ink;
  for (let i = 0; i < bars.length; i++) {
    ctx.fillRect(right + 6 * u + offset, baseline - 13 * u, bars[i] * u, (i % 4 ? 15 : 17) * u);
    offset += (bars[i] + 1.4) * u;
  }
}

let collageLayer;

function paintCast(ctx, state, photos, geometry, grade) {
  const { width, height, unit: u, panels, wide, edge, fieldW } = geometry;
  collageLayer ??= canvasOf(width, height);
  if (collageLayer.width !== width) collageLayer.width = width;
  if (collageLayer.height !== height) collageLayer.height = height;
  const layer = collageLayer.getContext('2d');
  layer.clearRect(0, 0, width, height);
  layer.imageSmoothingQuality = 'high';
  for (const panel of panels) {
    const crop = state.panels[panel.index];
    layer.save();
    polygon(layer, panel.vertices);
    layer.clip();
    if (panel.index === 0) paintLead(layer, photos[crop.photo], panel, crop, grade, state.strength, state.inkMode);
    else projectPhoto(layer, photos[crop.photo], panel, crop, grade, state.strength, panel.index, state.inkMode);
    layer.restore();
  }
  for (const panel of panels) {
    polygon(layer, panel.vertices);
    layer.lineJoin = 'bevel';
    layer.strokeStyle = ink;
    layer.lineWidth = 11 * u;
    layer.stroke();
    layer.lineWidth = 2.3 * u;
    layer.strokeStyle = panel.index === 0 ? grade.rim : colorHex(grade.rim, .68);
    layer.stroke();
  }

  layer.save();
  layer.globalCompositeOperation = 'destination-in';
  const fade = height * (wide ? .628 : .65);
  layer.fillStyle = ramp(layer, 0, fade, 0, height * .875, [[0, '#fff'], [.4, '#fffc'], [1, '#fff0']]);
  layer.fillRect(0, 0, width, height);
  layer.restore();
  ctx.drawImage(collageLayer, 0, 0);

  ctx.fillStyle = ramp(ctx, 0, height * .585, 0, height * .938, [
    [0, '#0000'], [.30, colorHex(grade.base, .32)], [.66, colorHex(ink, .62)], [1, colorHex(ink, .65)],
  ]);
  ctx.fillRect(edge, height * .585, fieldW, height * .353);
}

export function renderPoster(canvas, state, photos, format = state.format) {
  const [width, height] = FORMATS[format];
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.imageSmoothingQuality = 'high';
  const grade = GRADES.find(item => item.id === state.grade) ?? GRADES[0];
  const geometry = posterGeometry(state, width, height);
  const { unit: u, edge, panels, wide } = geometry;
  ctx.fillStyle = ramp(ctx, 0, 0, width, height, [ink, grade.base, ink]);
  ctx.fillRect(0, 0, width, height);
  causeway(ctx, geometry, grade);
  paintCast(ctx, state, photos, geometry, grade);
  for (const panel of panels) roleCard(ctx, panel, state.panels[panel.index].role, geometry, grade);
  titleLockup(ctx, geometry, grade, state);
  getawayCoupe(ctx, geometry, grade);
  pressSeal(ctx, width - edge - (wide ? 57 : 40) * u, height * .895, (wide ? 39 : 29) * u, grade);
  filmFooter(ctx, geometry, grade, state);
  frame(ctx, geometry, grade, state);
  ctx.restore();
  return geometry;
}

export function drawPanelPreview(canvas, photo, crop, state, index) {
  const ctx = canvas.getContext('2d');
  const grade = GRADES.find(item => item.id === state.grade) ?? GRADES[0];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  projectPhoto(ctx, photo, { x: 0, y: 0, w: canvas.width, h: canvas.height }, crop, grade, state.strength, index, state.inkMode);
}
