// Chamfered display alphabet drawn for this studio; no game font is used.
const alphabet = {
  A: 'M0 100 25 0H60L86 100H63L57 76H28L22 100ZM34 54H51L42 20Z',
  B: 'M0 0H64L80 16V38L69 49 84 61V84L68 100H0ZM23 21V40H53L58 35V26L53 21ZM23 60V79H56L61 74V65L56 60Z',
  C: 'M17 0H80V23H30L23 30V70L30 77H80V100H17L0 83V17Z',
  D: 'M0 0H65L85 20V80L65 100H0ZM24 23V77H53L61 69V31L53 23Z',
  E: 'M0 0H78V22H24V39H68V60H24V78H78V100H0Z',
  F: 'M0 0H78V23H24V41H68V63H24V100H0Z',
  G: 'M17 0H81V22H30L23 29V71L30 78H60V62H43V42H83V83L66 100H17L0 83V17Z',
  H: 'M0 0H24V38H61V0H85V100H61V61H24V100H0Z',
  I: 'M0 0H54V20H38V80H54V100H0V80H16V20H0Z',
  J: 'M58 0H82V82L64 100H17L0 83V64H23V72L29 78H52L58 72Z',
  K: 'M0 0H24V40H32L62 0H90L52 49 93 100H65L33 61H24V100H0Z',
  L: 'M0 0H24V77H76V100H0Z',
  M: 'M0 0H23L47 34 71 0H94V100H71V35L47 66 23 35V100H0Z',
  N: 'M0 0H23L61 60V0H85V100H62L24 40V100H0Z',
  O: 'M17 0H68L85 17V83L68 100H17L0 83V17ZM30 22 23 29V71L30 78H55L62 71V29L55 22Z',
  P: 'M0 0H65L83 18V49L65 67H24V100H0ZM24 23V45H54L60 39V29L54 23Z',
  Q: 'M17 0H68L85 17V78L76 87 90 101 76 115 61 100H17L0 83V17ZM30 22 23 29V71L30 78H45L35 68 49 54 62 67V29L55 22Z',
  R: 'M0 0H65L83 18V48L67 64 88 100H61L41 66H24V100H0ZM24 22V44H54L60 38V28L54 22Z',
  S: 'M17 0H80V22H29L23 28V35L28 40H67L83 56V83L66 100H0V78H54L60 72V65L55 60H17L0 43V17Z',
  T: 'M0 0H86V23H55V100H31V23H0Z',
  U: 'M0 0H24V71L31 78H54L61 71V0H85V83L68 100H17L0 83Z',
  V: 'M0 0H24L43 73 63 0H87L58 100H28Z',
  W: 'M0 0H23L36 66 53 20H69L86 66 100 0H123L101 100H79L61 55 44 100H22Z',
  X: 'M0 0H28L44 29 61 0H89L58 48 91 100H64L44 68 24 100H0L31 49Z',
  Y: 'M0 0H27L45 34 64 0H91L57 58V100H33V58Z',
  Z: 'M0 0H83V19L29 78H85V100H0V81L54 22H0Z',
  0: 'M17 0H65L82 17V83L65 100H17L0 83V17ZM29 22 23 28V72L29 78H53L59 72V28L53 22Z',
  1: 'M0 14 29 0H49V79H70V100H0V79H25V26L0 35Z',
  2: 'M16 0H65L82 17V43L67 58 22 75V79H82V100H0V66L16 51 60 35V28L54 22H28L22 28V36H0V16Z',
  3: 'M0 0H65L82 17V38L71 49 84 62V83L67 100H0V78H55L61 72V65L55 59H19V40H54L60 34V28L54 22H0Z',
  4: 'M45 0H69V60H82V81H69V100H46V81H0V63ZM46 33 27 60H46Z',
  5: 'M0 0H80V22H23V39H65L82 56V83L65 100H0V78H54L60 72V65L54 59H0Z',
  6: 'M17 0H78V22H30L23 29V39H65L82 56V83L65 100H17L0 83V17ZM23 60V71L30 78H53L60 71V66L54 60Z',
  7: 'M0 0H83V19L42 100H16L57 22H0Z',
  8: 'M17 0H65L81 16V38L71 48 83 60V83L66 100H17L0 83V60L11 49 1 39V16ZM24 26V34L30 40H53L59 34V26L54 21H29ZM23 66V72L29 79H54L61 72V66L55 60H29Z',
  9: 'M17 0H65L82 17V83L65 100H5V78H53L60 71V61H17L0 44V17ZM29 22 23 28V33L30 40H60V29L53 22Z',
  '-': 'M0 43H42V62H0Z',
  '!': 'M0 0H22V67H0ZM0 79H22V100H0Z',
  '?': 'M0 16 16 0H55L71 16V41L45 62V71H23V51L49 33V28L43 22H28L22 28V36H0ZM23 81H45V100H23Z',
};
const advances = { I: 54, W: 123, M: 94, L: 76, 1: 70, '-': 42, '!': 22, '?': 71 };
const outline = '#160b25';
export function linear(ctx, x0, y0, x1, y1, colors) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  colors.forEach((stop, index) => {
    const [position, color] = Array.isArray(stop) ? stop : [index / (colors.length - 1), stop];
    gradient.addColorStop(position, color);
  });
  return gradient;
}
export function print(ctx, text, x, y, pixels, settings = {}) {
  ctx.save();
  ctx.font = `${settings.italic ? 'italic ' : ''}${settings.weight ?? 800} ${pixels}px ${settings.family || 'Arial, sans-serif'}`;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = settings.align || 'left';
  ctx.letterSpacing = `${settings.spacing || 0}px`;
  ctx.fillStyle = settings.color || '#fff0d4';
  settings.limit ? ctx.fillText(text, x, y, settings.limit) : ctx.fillText(text, x, y);
  ctx.restore();
}
function shapeCaption(caption) {
  const normalized = caption.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  if ([...normalized].some(character => character !== ' ' && !(character in alphabet))) return null;
  const result = new Path2D();
  let cursor = 0;
  for (const character of normalized) {
    if (character === ' ') { cursor += 40; continue; }
    result.addPath(new Path2D(alphabet[character]), new DOMMatrix().translate(cursor, 0));
    cursor += (advances[character] || 86) + 7;
  }
  return { path: result, width: Math.max(1, cursor - 7) };
}
export function titleSafeRegion(width, height) {
  const landscape = width > height * 1.12;
  return { x: width * .055, y: height * (landscape ? .705 : .71), w: width * .89, h: height * (landscape ? .20 : .16) };
}
function chromeColors(finish) {
  if (finish === 'paper') return ['#fff9e5', '#ffd6a7'];
  if (finish === 'neon') return [[0, '#f3fffb'], [.45, '#9cf2e9'], [.48, '#125c7b'], [.51, '#fffbea'], [1, '#bf69cf']];
  return [[0, '#fff9df'], [.13, '#ffe7b4'], [.35, '#ffbf6c'], [.43, '#fa9365'],
    [.47, '#4c1746'], [.505, '#32132f'], [.525, '#fff7d4'], [.61, '#ffbca8'], [.82, '#ee7cab'], [1, '#c84899']];
}
export function renderChromeTitle(ctx, caption, width, height, finish = 'chrome') {
  const region = titleSafeRegion(width, height);
  const letters = shapeCaption(caption.trim() || 'NEON TIDE');
  if (!letters) {
    // Retain arbitrary captions, including characters beyond the custom display alphabet.
    ctx.save(); ctx.textAlign = 'center';
    ctx.font = `900 italic ${region.h * 1.12}px Arial, sans-serif`;
    ctx.lineJoin = 'round'; ctx.lineWidth = region.h * .065; ctx.strokeStyle = outline;
    ctx.strokeText(caption, width / 2, region.y + region.h, region.w);
    ctx.fillStyle = linear(ctx, 0, region.y, 0, region.y + region.h, chromeColors(finish));
    ctx.fillText(caption, width / 2, region.y + region.h, region.w); ctx.restore();
    return region;
  }
  const faceWidth = Math.min(region.w, region.h * letters.width / 85);
  ctx.save();
  ctx.translate((width - faceWidth) / 2 + region.h * .065, region.y);
  ctx.transform(faceWidth / letters.width, 0, -region.h * .0013, region.h / 100, 0, 0);
  ctx.lineJoin = 'round';
  for (let depth = 8; depth > 0; depth--) {
    ctx.save(); ctx.translate(-depth * .55, depth * .80);
    ctx.lineWidth = 8; ctx.strokeStyle = outline; ctx.stroke(letters.path);
    ctx.fillStyle = depth > 4 ? '#501f55' : '#b45496'; ctx.fill(letters.path, 'evenodd'); ctx.restore();
  }
  ctx.lineWidth = 8; ctx.strokeStyle = outline;
  ctx.shadowColor = '#080414'; ctx.shadowBlur = 6; ctx.stroke(letters.path); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffe5b5'; ctx.lineWidth = 2.5; ctx.stroke(letters.path);
  ctx.fillStyle = linear(ctx, 0, 0, 0, 100, chromeColors(finish)); ctx.fill(letters.path, 'evenodd');
  if (finish === 'chrome') {
    ctx.save(); ctx.clip(letters.path, 'evenodd');
    for (const [y, thick, color] of [[64, 1.1, '#fff3d882'], [72, 1.2, '#8d3265'], [80, 1.5, '#ffd3c394'], [88, 1.5, '#7b2a64'], [96, 1.2, '#ffd1c08a']]) {
      ctx.fillStyle = color; ctx.fillRect(-10, y, letters.width + 20, thick);
    }
    ctx.restore();
  }
  ctx.restore();
  return region;
}
export function renderSignature(ctx, caption, width, height, rim, accent = '#ed78ae') {
  if (!caption.trim()) return;
  const landscape = width > height * 1.12;
  const unit = Math.min(width, height) / 1080;
  let pixels = height * (landscape ? .115 : .068);
  ctx.save();
  ctx.font = `${pixels}px Yellowtail, cursive`;
  const maxWidth = width * (landscape ? .62 : .77);
  const measure = ctx.measureText(caption);
  if (measure.width > maxWidth) pixels *= maxWidth / measure.width;
  ctx.font = `${pixels}px Yellowtail, cursive`;
  const descent = ctx.measureText(caption).actualBoundingBoxDescent;
  const baseline = Math.min(height * .931, height - 80 * unit - descent);
  ctx.translate(width * .535, baseline); ctx.rotate(-.025);
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.lineWidth = pixels * .12; ctx.strokeStyle = outline; ctx.strokeText(caption, 0, 0);
  ctx.lineWidth = pixels * .045; ctx.strokeStyle = rim; ctx.strokeText(caption, 0, 0);
  ctx.fillStyle = accent; ctx.fillText(caption, 0, 0);
  ctx.restore();
}
