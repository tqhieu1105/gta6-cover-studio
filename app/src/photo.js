// All pixel work happens locally. Demo annotations never stand in for a face detector.
export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function canvasOf(width, height) {
  const surface = document.createElement('canvas');
  surface.width = Math.max(1, Math.round(width));
  surface.height = Math.max(1, Math.round(height));
  return surface;
}

export function alpha(color, amount) {
  const opacity = Math.round(clamp(amount, 0, 1) * 255).toString(16).padStart(2, '0');
  return color + opacity;
}

export function cropTravel(image, target, zoom = 1) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(target.w / sourceWidth, target.h / sourceHeight) * zoom;
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  return { w, h, x: (w - target.w) / 2, y: (h - target.h) / 2 };
}

export function fitPhotoToAnchor(asset, target, previous = {}) {
  const settings = { zoom: 1, x: 0, y: .35, flip: previous.flip === true };
  if (!asset?.face) return settings;
  const [left, top, width, height] = asset.face;
  const focus = {
    x: settings.flip ? 1 - left - width / 2 : left + width / 2,
    y: top + height * .43,
  };
  const image = cropTravel(asset.image, target);
  if (image.x > .01) settings.x = clamp((target.w / 2 - image.w * focus.x + image.x) / image.x, -1, 1);
  if (image.y > .01) settings.y = clamp((target.h * .39 - image.h * focus.y + image.y) / image.y, -1, 1);
  return settings;
}

export function resolvedCrop(asset, target, settings) {
  return settings.autoFrame ? { ...settings, ...fitPhotoToAnchor(asset, target, settings) } : settings;
}

export function photoProjection(image, target, settings) {
  const full = cropTravel(image, target, settings.zoom);
  return {
    x: target.x + (settings.x - 1) * full.x,
    y: target.y + (settings.y - 1) * full.y,
    w: full.w,
    h: full.h,
  };
}

export function projectedFace(asset, target, settings) {
  if (!asset?.face) return null;
  const crop = resolvedCrop(asset, target, settings);
  const placed = photoProjection(asset.image, target, crop);
  const [left, top, width, height] = asset.face;
  return {
    x: placed.x + placed.w * (crop.flip ? 1 - left - width : left),
    y: placed.y + placed.h * top,
    w: placed.w * width,
    h: placed.h * height,
  };
}

const memo = new WeakMap();
function channels(color) {
  return [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)].map(value => parseInt(value, 16));
}

function treatedPhoto(image, grade, strength, ink) {
  const signature = [grade.id, strength, ink].join('/');
  const stored = memo.get(image);
  if (stored?.signature === signature) return stored.surface;

  const shrink = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
  const surface = canvasOf(image.naturalWidth * shrink, image.naturalHeight * shrink);
  const ctx = surface.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, surface.width, surface.height);
  const pixels = ctx.getImageData(0, 0, surface.width, surface.height);
  const original = pixels.data.slice();
  const warm = channels(grade.warm);
  const cool = channels(grade.cool);
  const rowLength = surface.width * 4;
  const saturation = 1 + strength * .245;
  const contrast = 1.04 + ink * .12;

  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    const luminance = original[offset] * .2126 + original[offset + 1] * .7152 + original[offset + 2] * .0722;
    const light = luminance / 255;
    const shadowTint = strength * .165 * (1 - light) ** 2;
    const highlightTint = strength * .105 * light ** 2;
    const inside = offset >= rowLength && offset + rowLength < original.length;
    const edge = inside ? Math.abs(original[offset - rowLength] - original[offset + rowLength]) : 0;

    for (let color = 0; color < 3; color++) {
      let sample = original[offset + color];
      if (ink > 0 && edge < 28 && offset >= 4 && offset + 4 < original.length) {
        const neighbors = original[offset + color - 4] + original[offset + color + 4];
        sample += ((sample * 2 + neighbors) / 4 - sample) * ink * .35;
      }
      const vivid = luminance + (sample - luminance) * saturation;
      const printed = (vivid - 127) * contrast + 129;
      const tone = printed * (1 - shadowTint - highlightTint)
        + cool[color] * shadowTint + warm[color] * highlightTint;
      pixels.data[offset + color] = tone * (1 - ink * .075 * Math.min(1, edge / 90));
    }
  }
  ctx.putImageData(pixels, 0, 0);
  memo.set(image, { signature, surface });
  return surface;
}

export function paintPhoto(ctx, asset, target, settings, grade, strength = .75, ink = .2) {
  ctx.save();
  ctx.fillStyle = grade.sky[1];
  ctx.fillRect(target.x, target.y, target.w, target.h);
  if (asset?.image) {
    const crop = resolvedCrop(asset, target, settings);
    const projected = photoProjection(asset.image, target, crop);
    ctx.translate(projected.x + projected.w / 2, projected.y);
    ctx.scale(crop.flip ? -1 : 1, 1);
    const treated = treatedPhoto(asset.image, grade, strength, ink);
    ctx.drawImage(treated, -projected.w / 2, 0, projected.w, projected.h);
  }
  ctx.restore();
}

// Hand-traced in the coordinate space of the supplied Velvet derivative.
const leadOutline = new Path2D(
  'M38 442L36 405Q29 383 33 361L25 324Q18 306 23 285' +
  'Q18 248 23 216L31 181Q33 160 51 146L69 128 66 113' +
  'L85 96 109 66Q144 39 182 27Q213 15 238 24' +
  'Q273 21 285 37Q313 42 323 78L327 105 321 127' +
  'Q332 143 336 153L337 154Q346 162 327 167' +
  'L333 189 338 215Q346 240 327 244L311 250' +
  'Q305 274 295 283Q288 300 313 310Q333 319 321 333' +
  'L328 357 341 382Q338 391 322 396L329 421 326 442Z'
);

export function sampleSilhouette(asset, target, settings) {
  if (!asset?.silhouette) return null;
  const crop = resolvedCrop(asset, target, settings);
  const image = photoProjection(asset.image, target, crop);
  const matrix = new DOMMatrix([
    (crop.flip ? -1 : 1) * image.w / 451, 0,
    0, image.h / 442,
    image.x + (crop.flip ? image.w : 0), image.y,
  ]);
  const shape = new Path2D();
  shape.addPath(leadOutline, matrix);
  return shape;
}
