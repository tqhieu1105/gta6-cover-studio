import { linear, print, renderChromeTitle, renderSignature, titleSafeRegion } from './lettering.js';
import { alpha, canvasOf, paintPhoto, projectedFace, sampleSilhouette } from './photo.js';
import { polygon, waterfront, sunsetStage, getawayCar, collectorSeal } from './scenes.js';
export { canvasOf, clamp, cropTravel, fitPhotoToAnchor } from './photo.js';

export const FORMATS = Object.freeze({
  landscape: [1920, 1080],
  portrait: [1080, 1350],
  square: [1080, 1080],
});

function colorway(id, name, sky, warm, rim, cool, hot) {
  return { id, name, sky, warm, rim, cool, hot };
}

export const GRADES = [
  colorway('ember', 'Tangerine Dusk', ['#6d254c', '#f27967', '#ffd394'], '#ffc580', '#fff0ba', '#413067', '#ec5686'),
  colorway('violet', 'Velvet Sunset', ['#523163', '#e4769c', '#ffca9e'], '#ffbd97', '#ffe2bd', '#382865', '#ea558e'),
  colorway('copper', 'Sunlit Brass', ['#8a3855', '#f29d66', '#ffe2a5'], '#ffc779', '#ffedb9', '#2d535f', '#ee6668'),
  colorway('glass', 'Sea Glass', ['#254d75', '#72c9b2', '#f9e2aa'], '#ffcc9e', '#e2fff4', '#186b72', '#f67e9e'),
  colorway('pearl', 'Pink Pearl', ['#655774', '#c995ae', '#ffdfba'], '#ffdeb5', '#ffeadd', '#465a77', '#c077a1'),
  colorway('noir', 'Electric Bay', ['#25194c', '#aa4bad', '#efa4ac'], '#ffb2a8', '#bffff1', '#2e4081', '#f45db9'),
];

function layout(id, name, count) {
  return { id, name, count };
}

export const LAYOUTS = [
  layout('premiere', 'Premiere · six cast', 6),
  layout('rush', 'Spotlight · six cast', 6),
  layout('cascade', 'Cascade · six cast', 6),
  layout('overdrive', 'Overdrive · four cast', 4),
  layout('double', 'Double feature', 2),
  layout('trio', 'Three tickets', 3),
  layout('single', 'One night only', 1),
  layout('seaside', 'Seaside · four cast', 4),
];

const roles = ['THE SIREN', 'THE FIXER', 'THE INSIDER', 'THE DRIVER', 'THE SWITCH', 'THE CAPTAIN'];
const shadow = '#180e23';
const cream = '#fff0d3';

export function createPanelState(layoutId, photoCount, prior = []) {
  const template = LAYOUTS.find(option => option.id === layoutId) || LAYOUTS[0];
  return Array.from({ length: template.count }, (_, index) => prior[index] ?? {
    photo: index % Math.max(1, photoCount),
    role: roles[index],
    zoom: 1,
    x: 0,
    y: 0,
    flip: false,
    autoFrame: true,
  });
}

// A seam runs from a fraction on the top edge to one on the bottom edge.
function point(seam, y) {
  return [seam[0] * (1 - y) + seam[1] * y, y];
}

function cell(left, right, top, bottom) {
  return [point(left, top[0]), point(right, top[1]), point(right, bottom[1]), point(left, bottom[0])];
}

const top = [0, 0];
const bottom = [1, 1];
const west = [0, 0];
const east = [1, 1];

function gallery(left, right, westBreak, eastBreaks) {
  const [row1, row2] = eastBreaks;
  return [
    cell(left, right, top, bottom),
    cell(west, left, top, westBreak),
    cell(west, left, westBreak, bottom),
    cell(right, east, top, row1),
    cell(right, east, row1, row2),
    cell(right, east, row2, bottom),
  ];
}

function portraitGallery() {
  const crown = [[.29, .316], [.655, .277]];
  const hem = [[.22, 1], [.763, 1]];
  const westJoint = [.25, .632];
  const eastJoint = [.707, .58];
  return [
    [crown[0], crown[1], eastJoint, hem[1], hem[0], westJoint],
    [[0, 0], [.32, 0], crown[0], westJoint, [0, .573]],
    [[.32, 0], [.698, 0], crown[1], crown[0]],
    [[.698, 0], [1, 0], [1, .539], eastJoint, crown[1]],
    [[0, .573], westJoint, hem[0], [0, 1]],
    [eastJoint, [1, .539], [1, 1], hem[1]],
  ];
}

function spotlight() {
  const lead = [.455, .36];
  const spine = [.755, .69];
  return [
    cell(west, lead, top, bottom),
    cell(lead, spine, top, [.36, .32]),
    cell(spine, east, top, [.32, .385]),
    cell(lead, spine, [.36, .32], [.70, .67]),
    cell(spine, east, [.32, .385], [.67, .72]),
    [point(lead, .70), point(spine, .67), point(east, .72), point(east, 1), point(lead, 1)],
  ];
}

function panelShapes(design, format) {
  if (design.id === 'rush') return spotlight();
  if (design.count === 6) {
    if (format === 'portrait') return portraitGallery();
    if (design.id === 'cascade') return gallery([.27, .34], [.77, .68], [.36, .43], [[.33, .29], [.68, .62]]);
    if (format === 'square') return gallery([.235, .31], [.77, .695], [.41, .46], [[.33, .29], [.67, .63]]);
    return gallery([.291, .227], [.695, .756], [.39, .47], [[.342, .26], [.664, .594]]);
  }
  if (design.count === 1) return [cell(west, east, top, bottom)];
  const seams = Array.from({ length: design.count + 1 }, (_, index) => {
    if (index === 0) return west;
    if (index === design.count) return east;
    const position = .44 + .56 * (index - 1) / (design.count - 1);
    return [position + .04, position - .04];
  });
  return seams.slice(0,-1).map((seam, index) => {
    const shape = cell(seam, seams[index + 1], top, bottom);
    return design.id === 'seaside' ? shape.map(([x, y]) => [y, x]) : shape;
  });
}

export function posterGeometry(state, width, height) {
  const format = width > height * 1.12 ? 'landscape' : height > width * 1.12 ? 'portrait' : 'square';
  const unit = Math.min(width, height) / 1080;
  const edge = 16 * unit;
  const topMargin = 59 * unit;
  // Each format receives new crop bounds; manual framing remains panel-specific.
  const fieldHeight = height * (format === 'landscape' ? .732 : .727);
  const design = LAYOUTS.find(item => item.id === state.layout) || LAYOUTS[0];
  const panels = panelShapes(design, format).map((shape, index) => {
    const vertices = shape.map(([x, y]) => [edge + x * (width - 2 * edge), topMargin + y * fieldHeight]);
    const horizontal = vertices.map(pair => pair[0]);
    const vertical = vertices.map(pair => pair[1]);
    const x = Math.min(...horizontal);
    const y = Math.min(...vertical);
    return { index, x, y, w: Math.max(...horizontal) - x, h: Math.max(...vertical) - y, vertices };
  });
  return { width, height, unit, edge, format, wide: format === 'landscape',
    top: topMargin, fieldHeight, panels, title: titleSafeRegion(width, height) };
}

function horizontalSection(vertices, y) {
  const intersections = [];
  for (let index = 0; index < vertices.length; index++) {
    const [ax, ay] = vertices[index];
    const [bx, by] = vertices[(index + 1) % vertices.length];
    if ((ay > y) === (by > y)) continue;
    intersections.push(ax + (bx - ax) * (y - ay) / (by - ay));
  }
  return intersections.sort((a,b) => a - b);
}

export function hitTestPanel(geometry, x, y) {
  for (const panel of geometry?.panels || []) {
    const intersections = horizontalSection(panel.vertices, y);
    for (let index = 0; index < intersections.length; index += 2) {
      if (x >= intersections[index] && x < intersections[index + 1]) return panel.index;
    }
  }
  return -1;
}

function castLabel(ctx, panel, role, geometry, grade) {
  const label = role.trim().toUpperCase();
  if (!label) return;
  const { unit, height } = geometry;
  const size = (panel.index ? 19 : 21) * unit;
  const y = panel.index ? panel.y + 29 * unit : panel.y + panel.h * .61;
  if (y > height * .675) return;
  const edges = horizontalSection(panel.vertices, y - size / 3);
  if (edges.length < 2) return;
  const left = edges[0] + 10 * unit;
  const right = edges.at(-1) - 10 * unit;
  ctx.save();
  ctx.font = `900 ${size}px Arial`;
  const length = Math.min(ctx.measureText(label).width + 19 * unit, right - left);
  if (length >= 36 * unit) {
    const x = panel.x > geometry.width / 2 ? right - length : left;
    ctx.translate(x, y);
    ctx.fillStyle = alpha(shadow, .84);
    polygon(ctx, [[0, -size], [length, -size], [length - 4 * unit, size * .25], [0, size * .25]]);
    ctx.fill();
    ctx.fillStyle = panel.index ? grade.hot : grade.rim;
    ctx.fillRect(0, -size, 2 * unit, size * 1.25);
    print(ctx, label, 8 * unit, -2.4 * unit, size, {
      color: cream, limit: length - 14 * unit, spacing: .16 * unit,
    });
  }
  ctx.restore();
}

let montage;
function renderCast(ctx, state, assets, geometry, grade) {
  const { width, height, unit } = geometry;
  montage ??= canvasOf(width, height);
  montage.width = width;
  montage.height = height;
  const layer = montage.getContext('2d');
  layer.imageSmoothingQuality = 'high';

  for (const panel of geometry.panels) {
    const crop = state.panels[panel.index];
    const asset = assets[crop.photo];
    const tracedLead = panel.index === 0 && state.heroCutout && sampleSilhouette(asset, panel, crop);
    layer.save();
    polygon(layer, panel.vertices);
    layer.clip();
    if (tracedLead) {
      sunsetStage(layer, panel, grade);
      layer.strokeStyle = alpha(grade.rim, .82);
      layer.lineWidth = 3 * unit;
      layer.shadowColor = grade.hot;
      layer.shadowBlur = 17 * unit;
      layer.stroke(tracedLead);
      layer.shadowBlur = 0;
      layer.clip(tracedLead);
    }
    paintPhoto(layer, asset, panel, crop, grade, state.strength, state.inkAmount);
    layer.restore();
  }
  // Drawing seams after every crop keeps the same line weight on both sides of a cut.
  layer.lineJoin = 'round';
  for (const panel of geometry.panels) {
    polygon(layer, panel.vertices);
    layer.strokeStyle = shadow;
    layer.lineWidth = 6 * unit;
    layer.stroke();
    layer.strokeStyle = alpha(grade.rim, .61);
    layer.lineWidth = 1.35 * unit;
    layer.stroke();
  }
  layer.globalCompositeOperation = 'destination-in';
  layer.fillStyle = linear(layer, 0, height * .574, 0, height * .845, [
    [0, '#fff'], [.32, '#fffe'], [.72, '#fff7'], [1, '#fff0'],
  ]);
  layer.fillRect(0, 0, width, height);
  ctx.drawImage(montage, 0, 0);
}

function borderAndCredits(ctx, { width, height, unit, edge }, grade, { edition, tagline }) {
  const y0 = 13 * unit;
  ctx.strokeStyle = alpha(grade.rim, .68);
  ctx.lineWidth = 1.3 * unit;
  ctx.strokeRect(edge - 3 * unit, y0, width - 2 * edge + 6 * unit, height - 2 * y0);
  const headerBaseline = 43 * unit;
  print(ctx, '✦ ✦ ✦ ✦ ✦', edge + 10 * unit, headerBaseline, 20 * unit, { color: grade.rim });
  print(ctx, 'A STORY FROM THE SUN COAST', width / 2, headerBaseline, 21 * unit, {
    align: 'center', limit: width * .47, spacing: 2.2 * unit, color: cream,
  });
  print(ctx, edition.toUpperCase(), width - edge - 10 * unit, headerBaseline, 18 * unit, {
    align: 'right', limit: width * .24, spacing: 1.5 * unit, color: grade.rim,
  });
  const bottom = height - 63 * unit;
  ctx.fillStyle = shadow;
  ctx.fillRect(edge, bottom, width - edge * 2, 50 * unit);
  ctx.fillStyle = alpha(grade.rim, .64);
  ctx.fillRect(edge, bottom, width - 2 * edge, unit);
  print(ctx, 'AFTER DARK', edge + 11 * unit, bottom + 30 * unit, 16 * unit, {
    color: grade.rim, spacing: 1.3 * unit,
  });
  print(ctx, tagline.toUpperCase(), width / 2, bottom + 23 * unit, 19 * unit, {
    align: 'center', limit: width * .56, spacing: 1.4 * unit,
  });
  print(ctx, 'SUN COAST PICTURES  /  AN INDEPENDENT PRODUCTION', width / 2, bottom + 40 * unit, 10 * unit, {
    align: 'center', limit: width * .55, spacing: 1.7 * unit, color: '#e1c6bd',
  });
  const markX = width - edge - 83 * unit;
  ctx.fillStyle = cream;
  ctx.fillRect(markX, bottom + 10 * unit, 73 * unit, 28 * unit);
  ctx.fillStyle = shadow;
  let cursor = markX + 5 * unit;
  for (const [index, digit] of Array.from('13212321213121231231321').entries()) {
    const weight = Number(digit) * unit;
    ctx.fillRect(cursor, bottom + 14 * unit, weight, (index % 4 ? 16 : 19) * unit);
    cursor += weight + unit;
  }
}

export function renderPoster(canvas, state, assets, format = state.format) {
  const [width, height] = FORMATS[format];
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  const geometry = posterGeometry(state, width, height);
  const grade = GRADES.find(color => color.id === state.grade) || GRADES[0];
  ctx.save();
  ctx.imageSmoothingQuality = 'high';
  waterfront(ctx, width, height, grade);
  renderCast(ctx, state, assets, geometry, grade);
  for (const panel of geometry.panels) castLabel(ctx, panel, state.panels[panel.index].role, geometry, grade);
  if (geometry.wide) getawayCar(ctx, width * .04, height * .86, width * .125, grade);
  renderChromeTitle(ctx, state.title, width, height, state.finish);
  renderSignature(ctx, state.subtitle, width, height, grade.rim, grade.hot);
  collectorSeal(ctx, width * .948, height * .898, geometry.unit * (geometry.wide ? 38 : 28), grade);
  borderAndCredits(ctx, geometry, grade, state);
  ctx.restore();
  geometry.faces = geometry.panels.map(panel => {
    const crop = state.panels[panel.index];
    return projectedFace(assets[crop.photo], panel, crop);
  });
  return geometry;
}

export function drawPanelPreview(canvas, asset, crop, state) {
  const ctx = canvas.getContext('2d');
  const grade = GRADES.find(color => color.id === state.grade) || GRADES[0];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';
  paintPhoto(ctx, asset, { x: 0, y: 0, w: canvas.width, h: canvas.height }, crop, grade,
    state.strength, state.inkAmount);
}
