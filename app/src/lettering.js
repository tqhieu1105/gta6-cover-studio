// Chamfered display alphabet drawn for this studio; no game font is used.
const alphabet = {
  A: 'M0 100 25 0H60L86 100H63L57 76H28L22 100ZM34 54H51L42 20Z',
  B: 'M0 0H64L80 16V38L69 49 84 61V84L68 100H0ZM23 21V40H53L58 35V26L53 21ZM23 60V79H56L61 74V65L56 60Z',
  C: 'M17 0H80V23H30L23 30V70L30 77H80V100H17L0 83V17Z',
  D: 'M0 0H65L85 20V80L65 100H0ZM24 23V77H53L61 69V31L53 23Z',
  E: 'M0 0H78V23H24V39H67V61H24V77H78V100H0Z',
  F: 'M0 0H78V23H24V41H68V63H24V100H0Z',
  G: 'M17 0H81V22H30L23 29V71L30 78H60V62H43V42H83V83L66 100H17L0 83V17Z',
  H: 'M0 0H24V38H61V0H85V100H61V61H24V100H0Z',
  I: 'M0 0H54V21H39V79H54V100H0V79H15V21H0Z',
  J: 'M58 0H82V82L64 100H17L0 83V64H23V72L29 78H52L58 72Z',
  K: 'M0 0H24V40H32L62 0H90L52 49 93 100H65L33 61H24V100H0Z',
  L: 'M0 0H24V77H76V100H0Z',
  M: 'M0 0H23L47 34 71 0H94V100H71V35L47 66 23 35V100H0Z',
  N: 'M0 0H25L60 58V0H85V100H61L25 42V100H0Z',
  O: 'M17 0H68L85 17V83L68 100H17L0 83V17ZM30 22 23 29V71L30 78H55L62 71V29L55 22Z',
  P: 'M0 0H65L83 18V49L65 67H24V100H0ZM24 23V45H54L60 39V29L54 23Z',
  Q: 'M17 0H68L85 17V78L76 87 90 101 76 115 61 100H17L0 83V17ZM30 22 23 29V71L30 78H45L35 68 49 54 62 67V29L55 22Z',
  R: 'M0 0H65L83 18V48L67 64 88 100H61L41 66H24V100H0ZM24 22V44H54L60 38V28L54 22Z',
  S: 'M17 0H80V22H29L23 28V35L28 40H67L83 56V83L66 100H0V78H54L60 72V65L55 60H17L0 43V17Z',
  T: 'M0 0H87V24H56V100H31V24H0Z',
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
const ink = '#15091e';

export function linear(ctx, x0, y0, x1, y1, stops) {
  const ramp = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((stop, index) => {
    const offset = Array.isArray(stop) ? stop[0] : index / Math.max(1, stops.length - 1);
    ramp.addColorStop(offset, Array.isArray(stop) ? stop[1] : stop);
  });
  return ramp;
}

export function print(ctx, text, x, baseline, size, options = {}) {
  ctx.save();
  ctx.font = `${options.italic ? 'italic ' : ''}${options.weight ?? 800} ${size}px ${options.family ?? 'Arial,sans-serif'}`;
  ctx.textAlign = options.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${options.spacing ?? 0}px`;
  ctx.fillStyle = options.color ?? '#fff0d3';
  if (options.limit) ctx.fillText(text, x, baseline, options.limit);
  else ctx.fillText(text, x, baseline);
  ctx.restore();
}

// Unknown characters use the browser's system alphabet, retaining user-entered text.
function wordShape(caption) {
  const text = caption.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  const shape = new Path2D();
  let x = 0;
  for (const glyph of text) {
    if (glyph === ' ') { x += 31; continue; }
    const contour = alphabet[glyph];
    if (!contour) return null;
    shape.addPath(new Path2D(contour), new DOMMatrix().translate(x, 0));
    x += (advances[glyph] || 86) + 6;
  }
  return { path: shape, width: Math.max(1, x - 6) };
}

export function titleSafeRegion(width, height) {
  const wide = width > height * 1.12;
  const x = width * .067;
  const y = height * (wide ? .698 : .706);
  return { x, y, w: width - 2 * x, h: height * (wide ? .19 : .164) };
}

function metalPalette(finish) {
  if (finish === 'paper') return ['#fff9dc', '#ffcc98'];
  if (finish === 'neon') return [
    [0, '#edfff6'], [.4, '#80e5d5'], [.47, '#297d91'], [.52, '#193b5a'],
    [.56, '#d1fff2'], [1, '#b278d0'],
  ];
  return [
    [0, '#fff7d5'], [.12, '#ffe5a6'], [.40, '#ffb478'], [.465, '#f78964'],
    [.481, '#471e44'], [.515, '#2a112c'], [.54, '#fff0c5'],
    [.63, '#f5a5b3'], [.82, '#e77aa6'], [1, '#c14e8a'],
  ];
}

function systemTitle(ctx, text, area, finish, center) {
  ctx.font = `italic 900 ${area.h * 1.08}px Arial,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const baseline = area.y + area.h * .96;
  ctx.lineWidth = area.h * .092;
  ctx.strokeStyle = ink;
  ctx.strokeText(text, center, baseline, area.w);
  ctx.lineWidth = area.h * .02;
  ctx.strokeStyle = '#ffdeac';
  ctx.strokeText(text, center, baseline, area.w);
  ctx.fillStyle = linear(ctx, 0, area.y, 0, area.y + area.h, metalPalette(finish));
  ctx.fillText(text, center, baseline, area.w);
}

export function renderChromeTitle(ctx, caption, width, height, finish = 'chrome') {
  const area = titleSafeRegion(width, height);
  const text = caption.trim() || 'NEON TIDE';
  const word = wordShape(text);
  ctx.save();
  if (!word) {
    systemTitle(ctx, text, area, finish, width / 2);
    ctx.restore();
    return area;
  }
  const span = Math.min(area.w, word.width * area.h / 86);
  const lean = area.h * .185;
  ctx.translate((width - span + lean) / 2, area.y);
  ctx.transform(span / word.width, 0, -lean / 100, area.h / 100, 0, 0);
  ctx.lineJoin = 'round';

  for (let step = 11; step > 0; step--) {
    ctx.save();
    ctx.translate(-step * .42, step * .53);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6.9;
    ctx.stroke(word.path);
    ctx.fillStyle = step > 4 ? '#442039' : '#a64e70';
    ctx.fill(word.path, 'evenodd');
    ctx.restore();
  }
  ctx.strokeStyle = '#140b20';
  ctx.lineWidth = 7.4;
  ctx.stroke(word.path);
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = '#ffe5b4';
  ctx.stroke(word.path);
  ctx.fillStyle = linear(ctx, 0, 0, 0, 100, metalPalette(finish));
  ctx.fill(word.path, 'evenodd');

  if (finish === 'chrome') {
    ctx.save();
    ctx.clip(word.path, 'evenodd');
    [[68, 1.7, '#ffe8b9b8'], [78, 1.8, '#9f3865bf'], [88, 1.7, '#ffd6b4a8'], [96, 1.3, '#953557b0']]
      .forEach(([y, thickness, color]) => {
        ctx.fillStyle = color;
        ctx.fillRect(-10, y, word.width + 20, thickness);
      });
    ctx.restore();
  }
  ctx.restore();
  return area;
}

export function renderSignature(ctx, caption, width, height, cream, pink = '#ec729e') {
  const text = caption.trim();
  if (!text) return;
  const wide = width > height * 1.12;
  const unit = Math.min(width, height) / 1080;
  let size = height * (wide ? .129 : .075);
  ctx.save();
  ctx.font = `${size}px Yellowtail,cursive`;
  const metrics = ctx.measureText(text);
  const allowedWidth = width * (wide ? .58 : .76);
  if (metrics.width > allowedWidth) size *= allowedWidth / metrics.width;
  ctx.font = `${size}px Yellowtail,cursive`;
  const descent = Math.max(0, ctx.measureText(text).actualBoundingBoxDescent);
  const baseline = Math.min(height * .927, height - 79 * unit - descent);
  ctx.translate(width * .526, baseline);
  ctx.rotate(-.03);
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * .12;
  ctx.strokeStyle = '#160a20';
  ctx.strokeText(text, 0, 0);
  ctx.lineWidth = size * .026;
  ctx.strokeStyle = cream;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = linear(ctx, 0, -size * .72, 0, 3, ['#fff2d0', pink]);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
