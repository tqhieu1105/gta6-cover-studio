/** Local photograph projection and deterministic print treatment. */
export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
export function canvasOf(width, height) {
  const surface = document.createElement('canvas');
  Object.assign(surface, { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) });
  return surface;
}
export function alpha(color, opacity) {
  const byte = Math.round(clamp(opacity, 0, 1) * 255);
  return color.slice(0, 7) + byte.toString(16).padStart(2, '0');
}
export function cropTravel(image, frame, zoom = 1) {
  const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
  const scale = zoom * Math.max(frame.w / iw, frame.h / ih);
  const width = iw * scale, height = ih * scale;
  return { w: width, h: height, x: (width - frame.w) * .5, y: (height - frame.h) * .5 };
}
export function photoProjection(image, frame, crop) {
  const travel = cropTravel(image, frame, crop.zoom);
  return { x: frame.x + travel.x * (crop.x - 1), y: frame.y + travel.y * (crop.y - 1),
    w: travel.w, h: travel.h };
}
export function fitPhotoToAnchor(photo, frame, previous = {}) {
  const result = { zoom: 1, x: 0, y: .35, flip: !!previous.flip };
  if (!photo?.face) return result;
  const travel = cropTravel(photo.image, frame);
  const [left, top, width, height] = photo.face;
  const centerX = result.flip ? 1 - left - width * .5 : left + width * .5;
  const centerY = top + height * .43;
  if (travel.x > .001) result.x = clamp((frame.w * .5 + travel.x - centerX * travel.w) / travel.x, -1, 1);
  if (travel.y > .001) {
    const desired = (frame.h * .39 + travel.y - centerY * travel.h) / travel.y;
    const bottomLimit = Number.isFinite(frame.safeBottom)
      ? (frame.safeBottom - frame.y + travel.y - (top + height) * travel.h) / travel.y : 1;
    result.y = clamp(Math.min(desired, bottomLimit), -1, 1);
  }
  return result;
}
export function resolvedCrop(photo, frame, crop) {
  if (!crop.autoFrame) return crop;
  return Object.assign({}, crop, fitPhotoToAnchor(photo, frame, crop));
}
export function projectedFace(photo, frame, crop) {
  if (!photo?.face) return null;
  const fit = resolvedCrop(photo, frame, crop), box = photoProjection(photo.image, frame, fit);
  const [left, top, width, height] = photo.face;
  return { x: box.x + (fit.flip ? 1 - left - width : left) * box.w,
    y: box.y + top * box.h, w: width * box.w, h: height * box.h };
}
const processed = new WeakMap();
function channels(hex) {
  return [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(value => Number.parseInt(value, 16));
}
function printPlate(photo, grade, strength, inkAmount) {
  const key = [grade.id, strength, inkAmount].join(':');
  let plate = processed.get(photo.image);
  if (plate?.key === key) return plate;
  const sourceWidth = photo.image.naturalWidth, sourceHeight = photo.image.naturalHeight;
  const ratio = Math.min(1, 1400 / Math.max(sourceWidth, sourceHeight));
  const surface = canvasOf(sourceWidth * ratio, sourceHeight * ratio);
  const painter = surface.getContext('2d', { willReadFrequently: true });
  painter.drawImage(photo.image, 0, 0, surface.width, surface.height);
  const pixels = painter.getImageData(0, 0, surface.width, surface.height), original = pixels.data.slice();
  const lightColor = channels(grade.warm), shadowColor = channels(grade.cool), stride = surface.width * 4;
  const chroma = 1 + strength * .28, contrast = 1.055 + inkAmount * .17;
  for (let offset = 0; offset < original.length; offset += 4) {
    const luminance = original[offset] * .2126 + original[offset + 1] * .7152 + original[offset + 2] * .0722;
    const normalized = luminance / 255;
    const shadows = strength * .19 * (1 - normalized) ** 2, lights = strength * .12 * normalized ** 2;
    const edge = offset >= stride && offset + stride < original.length
      ? Math.abs(original[offset - stride] - original[offset + stride]) : 0;
    const line = inkAmount * .11 * clamp((edge - 14) / 65, 0, 1);
    for (let c = 0; c < 3; c++) {
      let value = (luminance + (original[offset + c] - luminance) * chroma - 127.5) * contrast + 128.5;
      value = value * (1 - lights - shadows) + lightColor[c] * lights + shadowColor[c] * shadows;
      value += (Math.round(value / 13) * 13 - value) * inkAmount * .24;
      pixels.data[offset + c] = value * (1 - line);
    }
  }
  painter.putImageData(pixels, 0, 0);
  plate = { key, surface, cutout: undefined };
  processed.set(photo.image, plate);
  return plate;
}
function blit(ctx, surface, placement, flipped) {
  ctx.save();
  ctx.translate(placement.x + placement.w * .5, placement.y);
  if (flipped) ctx.scale(-1, 1);
  ctx.drawImage(surface, -placement.w * .5, 0, placement.w, placement.h);
  ctx.restore();
}
export function paintPhoto(ctx, photo, frame, crop, grade, strength = .8, inkAmount = .25) {
  ctx.save();
  ctx.fillStyle = grade.sky[1];
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
  if (photo?.image) {
    const fit = resolvedCrop(photo, frame, crop);
    const plate = printPlate(photo, grade, strength, inkAmount);
    blit(ctx, plate.surface, photoProjection(photo.image, frame, fit), fit.flip);
  }
  ctx.restore();
}
// An authored alpha belongs to the supplied portrait, never to an arbitrary imported photo.
export function paintIsolatedSubject(ctx, photo, frame, crop, grade, strength, inkAmount) {
  if (!photo?.matteImage) return false;
  const plate = printPlate(photo, grade, strength, inkAmount);
  if (!plate.cutout) {
    plate.cutout = canvasOf(plate.surface.width, plate.surface.height);
    const layer = plate.cutout.getContext('2d');
    layer.drawImage(plate.surface, 0, 0);
    layer.globalCompositeOperation = 'destination-in';
    layer.drawImage(photo.matteImage, 0, 0, plate.cutout.width, plate.cutout.height);
  }
  const fit = resolvedCrop(photo, frame, crop);
  blit(ctx, plate.cutout, photoProjection(photo.image, frame, fit), fit.flip);
  return true;
}
