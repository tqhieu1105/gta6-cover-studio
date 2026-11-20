import { linear } from './lettering.js';

export function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
export function canvasOf(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return canvas;
}
export function alpha(color, opacity) {
  return color + Math.round(clamp(opacity, 0, 1) * 255).toString(16).padStart(2, '0');
}
export function cropTravel(image, bounds, zoom = 1) {
  const factor = Math.max(bounds.w / image.naturalWidth, bounds.h / image.naturalHeight) * zoom;
  const w = image.naturalWidth * factor, h = image.naturalHeight * factor;
  return { w, h, x: (w - bounds.w) * .5, y: (h - bounds.h) * .5 };
}
export function fitPhotoToAnchor(asset, bounds, crop = {}) {
  const result = { zoom: 1, x: 0, y: .35, flip: crop.flip || false };
  if (!asset?.face) return result;
  const [left, top, width, height] = asset.face;
  const travel = cropTravel(asset.image, bounds);
  const faceX = result.flip ? 1 - left - width / 2 : left + width / 2;
  const faceY = top + height * .43;
  if (travel.x > 0) result.x = clamp((bounds.w * .50 + travel.x - faceX * travel.w) / travel.x, -1, 1);
  if (travel.y > 0) result.y = clamp((bounds.h * .39 + travel.y - faceY * travel.h) / travel.y, -1, 1);
  return result;
}
export function resolvedCrop(asset, bounds, crop) {
  return crop.autoFrame ? { ...crop, ...fitPhotoToAnchor(asset, bounds, crop) } : crop;
}
export function photoProjection(image, bounds, crop) {
  const travel = cropTravel(image, bounds, crop.zoom);
  return { x: bounds.x - travel.x + travel.x * crop.x, y: bounds.y - travel.y + travel.y * crop.y, w: travel.w, h: travel.h };
}
export function projectedFace(asset, bounds, crop) {
  if (!asset?.face) return null;
  const placement = photoProjection(asset.image, bounds, resolvedCrop(asset, bounds, crop));
  const [x, y, w, h] = asset.face;
  return { x: placement.x + placement.w * (crop.flip ? 1 - x - w : x),
    y: placement.y + placement.h * y, w: placement.w * w, h: placement.h * h };
}
export function paintPhoto(ctx, asset, bounds, values, grade, mix = .7, ink = .25) {
  ctx.save();
  ctx.fillStyle = linear(ctx, bounds.x, bounds.y, bounds.x, bounds.y + bounds.h, grade.sky);
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  if (asset?.image) {
    const crop = resolvedCrop(asset, bounds, values);
    const placement = photoProjection(asset.image, bounds, crop);
    ctx.save();
    ctx.translate(placement.x + placement.w / 2, placement.y + placement.h / 2);
    if (crop.flip) ctx.scale(-1, 1);
    ctx.filter = `saturate(${1 + .26 * mix}) contrast(${1.02 + ink * .27})`;
    ctx.drawImage(asset.image, -placement.w / 2, -placement.h / 2, placement.w, placement.h);
    ctx.restore();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = linear(ctx, bounds.x, bounds.y, bounds.x + bounds.w, bounds.y + bounds.h,
      [alpha(grade.warm, mix * .68), alpha(grade.hot, mix * .19), alpha(grade.cool, mix * .76)]);
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = linear(ctx, 0, bounds.y, 0, bounds.y + bounds.h,
      [alpha(grade.warm, mix * .07), '#0000', alpha(grade.cool, mix * .18)]);
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  }
  ctx.restore();
}
// This outline follows only the supplied Velvet sample. Imports are never auto-segmented.
const velvetContour = 'M34 442L36 405Q28 381 33 360L24 324Q19 307 23 286Q18 249 23 218L31 180Q32 162 50 145L69 127 66 112 84 96 110 65 145 42 183 26Q215 14 239 24Q272 22 285 36Q314 42 323 78L327 105 321 127Q333 143 336 153Q346 161 326 167L334 189 338 214Q347 240 327 244L311 250Q305 273 295 283Q288 300 313 309Q333 317 321 333L328 356 341 382Q339 390 322 396L329 421 326 442Z';
export function sampleSilhouette(asset, bounds, values) {
  if (!asset?.silhouette) return null;
  const crop = resolvedCrop(asset, bounds, values);
  const box = photoProjection(asset.image, bounds, crop);
  const matrix = new DOMMatrix().translate(box.x + box.w / 2, box.y)
    .scale(crop.flip ? -1 : 1, 1).translate(-box.w / 2, 0)
    .scale(box.w / 451, box.h / 442);
  const path = new Path2D(); path.addPath(new Path2D(velvetContour), matrix);
  return path;
}
