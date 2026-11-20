import { linear, print, renderChromeTitle, renderSignature, titleSafeRegion } from './lettering.js';
import { alpha, paintPhoto, projectedFace, sampleSilhouette } from './photo.js';
import { polygon, waterfront, sunsetStage, getawayCar, collectorSeal } from './scenes.js';
export { canvasOf, clamp, cropTravel, fitPhotoToAnchor } from './photo.js';

export const FORMATS = Object.freeze({ landscape: [1920, 1080], portrait: [1080, 1350], square: [1080, 1080] });
export const GRADES = [
  { id: 'violet', name: 'Velvet Sunset', sky: ['#6d346f', '#ef7894', '#ffd19b'], warm: '#ffc18b', rim: '#ffe7b5', cool: '#39378c', hot: '#ec529e', base: '#231731' },
  { id: 'copper', name: 'Golden Hour', sky: ['#b64d68', '#f69479', '#ffdc9e'], warm: '#ffc17e', rim: '#ffe2a5', cool: '#225778', hot: '#f15c87', base: '#2e1b32' },
  { id: 'glass', name: 'Sea Glass', sky: ['#3c6d86', '#84cfc4', '#f8dfa6'], warm: '#ffd19a', rim: '#d4ffec', cool: '#137e87', hot: '#eea397', base: '#162e38' },
  { id: 'ember', name: 'Coral Heat', sky: ['#833d58', '#ed7d70', '#ffd29b'], warm: '#ffc574', rim: '#ffe3a8', cool: '#463775', hot: '#ef587f', base: '#301e32' },
  { id: 'pearl', name: 'Motel Pearl', sky: ['#77627e', '#c9a7ba', '#f5ddbb'], warm: '#ffdab4', rim: '#ffe8c5', cool: '#4c7b8e', hot: '#ce91ac', base: '#30283d' },
  { id: 'noir', name: 'Electric Bay', sky: ['#382660', '#a95cab', '#efa8b0'], warm: '#ffbba8', rim: '#b8ffe8', cool: '#304b9a', hot: '#e65aaf', base: '#201d37' },
];
export const LAYOUTS = [
  { id: 'premiere', name: 'Premiere · six cast', count: 6 },
  { id: 'rush', name: 'Spotlight · six cast', count: 6 },
  { id: 'cascade', name: 'Cascade · six cast', count: 6 },
  { id: 'overdrive', name: 'Overdrive · four', count: 4 },
  { id: 'double', name: 'Double feature', count: 2 },
  { id: 'trio', name: 'Three tickets', count: 3 },
  { id: 'single', name: 'One night only', count: 1 },
  { id: 'seaside', name: 'Seaside · four', count: 4 },
];
const roleNames = ['THE SIREN', 'THE FIXER', 'THE INSIDER', 'THE DRIVER', 'THE SWITCH', 'THE CAPTAIN'];
const dark = '#170e25';
const cream = '#fff1d5';
export function createPanelState(layoutId, photoCount, preserved = []) {
  const design = LAYOUTS.find(item => item.id === layoutId) || LAYOUTS[0];
  return Array.from({ length: design.count }, (_, index) => preserved[index] || {
    photo: index % Math.max(1, photoCount), role: roleNames[index],
    x: 0, y: 0, zoom: 1, flip: false, autoFrame: true,
  });
}

function fullRect(x0, y0, x1, y1) { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; }
function sixCastPolygons(format, layoutId) {
  if (layoutId === 'rush') return [
    [[0, 0], [.47, 0], [.41, 1], [0, 1]],
    [[.47, 0], [.73, 0], [.71, .38], [.447, .38]],
    [[.73, 0], [1, 0], [1, .38], [.71, .38]],
    [[.447, .38], [.71, .38], [.69, .72], [.427, .72]],
    [[.71, .38], [1, .38], [1, .72], [.69, .72]],
    [[.427, .72], [1, .72], [1, 1], [.41, 1]],
  ];
  if (format === 'portrait') return [
    [[.32, .34], [.68, .29], [.76, 1], [.24, 1]],
    [[0, 0], [.35, 0], [.32, .34], [.28, .66], [0, .62]],
    [[.35, 0], [.70, 0], [.68, .29], [.32, .34]],
    [[.70, 0], [1, 0], [1, .55], [.71, .56], [.68, .29]],
    [[0, .62], [.28, .66], [.24, 1], [0, 1]],
    [[.71, .56], [1, .55], [1, 1], [.76, 1]],
  ];
  if (layoutId === 'cascade') return [
    [[.25, 0], [.77, 0], [.72, .59], [.29, .61]],
    [[0, 0], [.25, 0], [.27, .32], [0, .38]],
    [[0, .38], [.27, .32], [.29, .61], [.41, .60], [.38, 1], [0, 1]],
    [[.77, 0], [1, 0], [1, .35], [.74, .34]],
    [[.74, .34], [1, .35], [1, .69], [.71, .68]],
    [[.41, .60], [.72, .59], [.71, .68], [1, .69], [1, 1], [.38, 1]],
  ];
  return format === 'landscape' ? [
    [[.29, 0], [.69, 0], [.63, 1], [.23, 1]],
    [[0, 0], [.29, 0], [.262, .47], [0, .42]],
    [[0, .42], [.262, .47], [.23, 1], [0, 1]],
    [[.69, 0], [1, 0], [1, .31], [.6714, .31]],
    [[.6714, .31], [1, .31], [1, .64], [.6516, .64]],
    [[.6516, .64], [1, .64], [1, 1], [.63, 1]],
  ] : [
    [[.26, 0], [.74, 0], [.68, 1], [.32, 1]],
    [[0, 0], [.26, 0], [.285, .42], [0, .46]],
    [[0, .46], [.285, .42], [.32, 1], [0, 1]],
    [[.74, 0], [1, 0], [1, .34], [.7196, .34]],
    [[.7196, .34], [1, .34], [1, .67], [.6998, .67]],
    [[.6998, .67], [1, .67], [1, 1], [.68, 1]],
  ];
}
function stripPolygons(number, horizontal) {
  if (number === 1) return [fullRect(0, 0, 1, 1)];
  const stops = [0, .44, ...Array.from({ length: number - 1 }, (_, i) => .44 + .56 * (i + 1) / (number - 1))];
  return stops.slice(0, -1).map((left, index) => {
    const right = stops[index + 1];
    const points = [[left ? left + .035 : 0, 0], [right < 1 ? right + .035 : 1, 0],
      [right < 1 ? right - .035 : 1, 1], [left ? left - .035 : 0, 1]];
    return horizontal ? points.map(([x, y]) => [y, x]) : points;
  });
}
export function posterGeometry(state, width, height) {
  const design = LAYOUTS.find(item => item.id === state.layout) || LAYOUTS[0];
  const format = width > height * 1.12 ? 'landscape' : height > width * 1.12 ? 'portrait' : 'square';
  const unit = Math.min(width, height) / 1080;
  const edge = 18 * unit;
  const top = 67 * unit;
  const fieldHeight = height * (format === 'landscape' ? .68 : .72);
  const fieldWidth = width - edge * 2;
  const shapes = design.count === 6 ? sixCastPolygons(format, design.id) : stripPolygons(design.count, design.id === 'seaside');
  const panels = shapes.map((shape, index) => {
    const vertices = shape.map(([x, y]) => [edge + fieldWidth * x, top + fieldHeight * y]);
    const xs = vertices.map(p => p[0]), ys = vertices.map(p => p[1]);
    return { index, vertices, x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  });
  return { width, height, unit, edge, wide: format === 'landscape', format, top, fieldHeight, panels, title: titleSafeRegion(width, height) };
}
export function hitTestPanel(geometry, x, y) {
  for (const panel of geometry.panels) {
    let hits = 0;
    for (let i = 0; i < panel.vertices.length; i++) {
      const [ax, ay] = panel.vertices[i], [bx, by] = panel.vertices[(i + 1) % panel.vertices.length];
      if ((ay > y) !== (by > y) && x < ax + (y - ay) * (bx - ax) / (by - ay)) hits++;
    }
    if (hits % 2) return panel.index;
  }
  return -1;
}
function spanAt(panel, y) {
  const crossing = [];
  panel.vertices.forEach(([x, y0], i) => {
    const [x1, y1] = panel.vertices[(i + 1) % panel.vertices.length];
    if ((y0 > y) !== (y1 > y)) crossing.push(x + (y - y0) * (x1 - x) / (y1 - y0));
  });
  return crossing.length >= 2 ? [Math.min(...crossing), Math.max(...crossing)] : [panel.x, panel.x + panel.w];
}
function castLabel(ctx, panel, text, geometry, grade) {
  if (!text.trim()) return;
  const u = geometry.unit;
  let baseline = panel.y + 34 * u;
  if (panel.index === 0) baseline = panel.y + panel.h * .64;
  if (baseline > geometry.height * .67) return;
  const [left, right] = spanAt(panel, baseline - 10 * u);
  const size = (panel.index === 0 ? 23 : 21) * u;
  ctx.save(); ctx.font = `900 ${size}px Arial`;
  const width = Math.min(ctx.measureText(text.toUpperCase()).width + 24 * u, right - left - 24 * u);
  const x = panel.x > geometry.width / 2 ? right - width - 12 * u : left + 12 * u;
  ctx.translate(x, baseline); ctx.rotate(-.02);
  ctx.fillStyle = panel.index === 0 ? grade.rim : panel.index % 2 ? cream : '#b7e9e2';
  polygon(ctx, [[3 * u, -25 * u], [width, -25 * u], [width - 3 * u, 5 * u], [0, 5 * u]]); ctx.fill();
  print(ctx, text.toUpperCase(), 9 * u, -3 * u, size, { color: dark, limit: width - 18 * u });
  ctx.restore();
}
let photoLayer;
function paintCast(ctx, state, assets, geometry, grade) {
  const { width: w, height: h, unit: u, edge } = geometry;
  photoLayer ||= document.createElement('canvas');
  photoLayer.width = w; photoLayer.height = h;
  const layer = photoLayer.getContext('2d'); layer.imageSmoothingQuality = 'high';
  for (const panel of geometry.panels) {
    const crop = state.panels[panel.index], asset = assets[crop.photo];
    layer.save(); polygon(layer, panel.vertices); layer.clip();
    const silhouette = panel.index === 0 && state.heroCutout ? sampleSilhouette(asset, panel, crop) : null;
    if (silhouette) {
      sunsetStage(layer, panel, grade);
      layer.save();
      layer.strokeStyle = alpha(grade.rim, .70); layer.lineWidth = 5 * u;
      layer.shadowBlur = 10 * u; layer.shadowColor = grade.rim;
      layer.stroke(silhouette); layer.shadowBlur = 0;
      layer.clip(silhouette);
      paintPhoto(layer, asset, panel, crop, grade, state.strength, state.inkAmount);
      layer.restore();
    } else paintPhoto(layer, asset, panel, crop, grade, state.strength, state.inkAmount);
    layer.restore();
  }
  for (const panel of geometry.panels) {
    polygon(layer, panel.vertices);
    layer.lineJoin = 'bevel'; layer.lineWidth = 9 * u; layer.strokeStyle = dark; layer.stroke();
    layer.lineWidth = 2 * u; layer.strokeStyle = alpha(grade.rim, panel.index ? .61 : .95); layer.stroke();
  }
  layer.save(); layer.globalCompositeOperation = 'destination-in';
  layer.fillStyle = linear(layer, 0, h * .65, 0, h * .85, [[0, '#fff'], [.34, '#ffff'], [1, '#fff0']]);
  layer.fillRect(0, 0, w, h); layer.restore();
  ctx.drawImage(photoLayer, 0, 0);
  ctx.fillStyle = linear(ctx, 0, h * .68, 0, h * .93, ['#0000', alpha(dark, .36), alpha(dark, .14)]);
  ctx.fillRect(edge, h * .68, w - 2 * edge, h * .25);
}
function printFrame(ctx, geometry, grade, state) {
  const { width: w, height: h, unit: u, edge } = geometry;
  ctx.strokeStyle = alpha(grade.rim, .9); ctx.lineWidth = 1.5 * u;
  ctx.strokeRect(edge - 5 * u, 13 * u, w - edge * 2 + 10 * u, h - 26 * u);
  print(ctx, '★★★★★', edge + 11 * u, 47 * u, 24 * u, { color: grade.rim, spacing: u });
  print(ctx, 'SIX LIVES. ONE COAST. NO WAY BACK.', w / 2, 47 * u, 20 * u,
    { align: 'center', limit: w * .59, spacing: 2 * u });
  print(ctx, state.edition.toUpperCase(), w - edge - 11 * u, 47 * u, 17 * u,
    { align: 'right', limit: w * .22, color: grade.rim, spacing: u });
  const ruleY = h - 64 * u;
  ctx.fillStyle = dark; ctx.fillRect(edge, ruleY, w - edge * 2, 49 * u);
  ctx.fillStyle = alpha(grade.rim, .68); ctx.fillRect(edge, ruleY, w - edge * 2, u);
  print(ctx, 'COMING SOON', edge + 9 * u, ruleY + 25 * u, 17 * u, { color: grade.rim, spacing: 1.3 * u });
  print(ctx, state.tagline.toUpperCase(), w / 2, ruleY + 21 * u, 19 * u, { align: 'center', limit: w * .55, spacing: 1.8 * u });
  print(ctx, 'NIGHTFALL PICTURES  ·  A FILM BY YOU  ·  SHOT ON YOUR CAMERA', w / 2, ruleY + 38 * u, 9 * u,
    { align: 'center', limit: w * .59, spacing: u, color: '#d6bdd0' });
  const bx = w - edge - 94 * u;
  ctx.fillStyle = cream; ctx.fillRect(bx, ruleY + 9 * u, 84 * u, 27 * u);
  let cursor = bx + 5 * u; ctx.fillStyle = dark;
  for (let i = 0; i < 25; i++) {
    const bar = (i * 7 % 3 + 1) * u;
    ctx.fillRect(cursor, ruleY + 12 * u, bar, (i % 5 ? 17 : 21) * u); cursor += bar + u;
  }
}
export function renderPoster(canvas, state, assets, format = state.format) {
  const [w, h] = FORMATS[format];
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  const geometry = posterGeometry(state, w, h);
  const grade = GRADES.find(item => item.id === state.grade) || GRADES[0];
  ctx.save(); ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = dark; ctx.fillRect(0, 0, w, h);
  waterfront(ctx, w, h, grade);
  paintCast(ctx, state, assets, geometry, grade);
  geometry.panels.forEach(panel => castLabel(ctx, panel, state.panels[panel.index].role, geometry, grade));
  renderChromeTitle(ctx, state.title, w, h, state.finish);
  renderSignature(ctx, state.subtitle, w, h, grade.rim, grade.hot);
  if (geometry.wide) getawayCar(ctx, w * .055, h * .846, w * .155, grade);
  collectorSeal(ctx, w * .946, h * .91, (geometry.wide ? 40 : 31) * geometry.unit, grade);
  printFrame(ctx, geometry, grade, state);
  ctx.restore();
  geometry.faces = geometry.panels.map(panel => projectedFace(assets[state.panels[panel.index].photo], panel, state.panels[panel.index]));
  return geometry;
}
export function drawPanelPreview(canvas, asset, crop, state) {
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintPhoto(ctx, asset, { x: 0, y: 0, w: canvas.width, h: canvas.height }, crop,
    GRADES.find(grade => grade.id === state.grade) || GRADES[0], state.strength, state.inkAmount);
}
