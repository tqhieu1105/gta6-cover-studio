import { linear, print } from './lettering.js';
import { alpha } from './photo.js';

export function polygon(ctx, points) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) i ? ctx.lineTo(...points[i]) : ctx.moveTo(...points[i]);
  ctx.closePath();
}
function seeded(seed) {
  return () => {
    seed = Math.imul(seed ^ seed >>> 15, 2246822519);
    seed = Math.imul(seed ^ seed >>> 13, 3266489917);
    return ((seed ^= seed >>> 16) >>> 0) / 4294967296;
  };
}
export function palm(ctx, x, ground, size, direction, color) {
  ctx.save();
  ctx.translate(x, ground); ctx.scale(size * direction, size);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-.022, 0); ctx.bezierCurveTo(.008, -.26, -.035, -.59, .083, -.87);
  ctx.bezierCurveTo(.031, -.56, .041, -.22, .020, 0); ctx.closePath(); ctx.fill();
  const fronds = [[-.43, -.08], [-.38, -.28], [-.20, -.39], [.06, -.37], [.30, -.28], [.43, -.12], [.39, .10], [-.33, .10]];
  for (let i = 0; i < fronds.length; i++) {
    const [dx, dy] = fronds[i];
    ctx.save(); ctx.translate(.083, -.87);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dx * .40, dy - .055, dx * .87, dy - .02, dx, dy + .14);
    ctx.bezierCurveTo(dx * .73, dy + .035, dx * .37, dy + .055, 0, 0);
    ctx.closePath(); ctx.fill();
    // Short leaflets follow each curved frond instead of radiating as straight spokes.
    ctx.strokeStyle = color; ctx.lineWidth = .009; ctx.lineCap = 'round';
    for (let j = 2; j < 8; j++) {
      const t = j / 9, px = dx * t, py = dy * Math.sin(t * Math.PI / 2) + .14 * t * t;
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px - dx * .025, py + .045, px - dx * .055, py + .085 * (1 - t / 2)); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
function city(ctx, width, baseline, unit, grade, seed = 1907) {
  const rand = seeded(seed);
  for (let i = 0; i < 35; i++) {
    const x = width * i / 35, w = width / 35 * (.58 + rand() * .43);
    const h = (14 + rand() ** 1.6 * 136) * unit;
    ctx.fillStyle = i % 3 === 0 ? '#58344f' : '#302a46';
    ctx.fillRect(x, baseline - h, w, h);
    ctx.fillStyle = '#88526a'; ctx.fillRect(x, baseline - h, w, 2 * unit);
    if (i % 7 === 2) {
      ctx.fillStyle = '#3a304e'; ctx.fillRect(x + w * .32, baseline - h - 16 * unit, w * .36, 16 * unit);
      ctx.fillRect(x + w * .48, baseline - h - 29 * unit, unit, 29 * unit);
    }
    if (i % 5 === 1) {
      ctx.strokeStyle = alpha(grade.hot, .85); ctx.lineWidth = 2 * unit;
      ctx.strokeRect(x + 3 * unit, baseline - h + 3 * unit, w - 6 * unit, h - 3 * unit);
    }
    for (let row = 7; row < h / unit - 4; row += 10) {
      for (let column = 5; column < w / unit - 4; column += 8) {
        if (rand() < .59) {
          ctx.fillStyle = alpha(rand() > .45 ? grade.rim : '#f697b8', .60 + rand() * .3);
          ctx.fillRect(x + column * unit, baseline - h + row * unit, 2.6 * unit, 2 * unit);
        }
      }
    }
  }
}
export function sunsetStage(ctx, rect, grade) {
  const { x, y, w, h } = rect;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = linear(ctx, 0, y, 0, y + h, [grade.sky[0], grade.sky[1], grade.sky[2], '#eaa79c', grade.cool]);
  ctx.fillRect(x, y, w, h);
  const sx = x + w * .80, sy = y + h * .35;
  const halo = ctx.createRadialGradient(sx, sy, w * .06, sx, sy, w * .55);
  halo.addColorStop(0, '#fff0bbcc'); halo.addColorStop(1, '#fff0bb00');
  ctx.fillStyle = halo; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, w * .15, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#ffe5aa'; ctx.fillRect(sx - w * .16, sy - w * .16, w * .32, w * .32);
  ctx.fillStyle = alpha(grade.sky[1], .75);
  for (let band = 0; band < 7; band++) ctx.fillRect(sx - w * .16, sy + band * w * .023, w * .32, (band * .0019 + .002) * w);
  ctx.restore();
  ctx.save(); ctx.translate(x, 0); city(ctx, w, y + h * .82, h / 1580, grade); ctx.restore();
  ctx.fillStyle = linear(ctx, 0, y + h * .82, 0, y + h, [alpha(grade.cool, .90), '#232338']);
  ctx.fillRect(x, y + h * .82, w, h * .18);
  palm(ctx, x + w * .94, y + h * .83, h * .62, -1, '#4b244b99');
  palm(ctx, x + w * .06, y + h * .84, h * .58, 1, '#4b244b77');
  ctx.restore();
}
export function waterfront(ctx, w, h, grade) {
  const unit = Math.min(w, h) / 1080, horizon = h * .877;
  ctx.save();
  ctx.fillStyle = linear(ctx, 0, h * .47, 0, h, [grade.sky[1], grade.sky[2], grade.cool, '#1c1930']);
  ctx.fillRect(0, h * .47, w, h * .53);
  const light = ctx.createRadialGradient(w * .64, h * .78, 0, w * .64, h * .78, w * .5);
  light.addColorStop(0, alpha(grade.rim, .80)); light.addColorStop(.5, alpha(grade.hot, .38)); light.addColorStop(1, '#0000');
  ctx.fillStyle = light; ctx.fillRect(0, h * .47, w, h * .53);
  city(ctx, w, horizon, unit * .72, grade);
  const rand = seeded(431);
  ctx.fillStyle = alpha('#223247', .78); ctx.fillRect(0, horizon, w, h - horizon);
  for (let i = 0; i < 110; i++) {
    const y = horizon + rand() * (h - horizon), x = rand() * w;
    ctx.fillStyle = alpha(i % 3 ? grade.rim : grade.hot, .10 + rand() * .37);
    ctx.fillRect(x, y, (8 + rand() * 76) * unit, (.6 + rand() * 1.8) * unit);
  }
  polygon(ctx, [[0, h * .963], [w * .54, h * .853], [w * .73, h * .857], [w * .39, h]]);
  ctx.fillStyle = '#211c33'; ctx.fill();
  for (let lane = 0; lane < 3; lane++) {
    ctx.lineWidth = (lane === 1 ? 2 : 3.5) * unit; ctx.strokeStyle = alpha(lane === 1 ? grade.rim : grade.hot, .86);
    ctx.beginPath(); ctx.moveTo(0, h * (.97 + lane * .009));
    ctx.quadraticCurveTo(w * .33, h * .922, w * .68, h * .86); ctx.stroke();
  }
  palm(ctx, w * .025, h * .975, h * .27, 1, '#1b1830');
  palm(ctx, w * .982, h * .976, h * .30, -1, '#1b1830');
  ctx.restore();
}
export function getawayCar(ctx, x, y, width, grade) {
  ctx.save(); ctx.translate(x, y); ctx.scale(width / 420, width / 420);
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#181024aa'; ctx.beginPath(); ctx.ellipse(211, 134, 212, 17, 0, 0, Math.PI * 2); ctx.fill();
  const body = new Path2D('M9 91 42 77 112 62 159 22Q167 16 183 16H277L316 57 372 70 409 91 411 115 387 129H26L9 118Z');
  ctx.strokeStyle = '#24192f'; ctx.lineWidth = 7; ctx.stroke(body);
  ctx.fillStyle = linear(ctx, 0, 18, 0, 132, ['#ffe9c3', '#ee9ab1', '#c64b87', '#572e61']); ctx.fill(body);
  const windows = new Path2D('M134 61 170 29H267L298 59Z');
  ctx.fillStyle = linear(ctx, 0, 29, 0, 60, ['#4d7c91', '#27334f']); ctx.fill(windows);
  ctx.strokeStyle = '#ffe0ca'; ctx.lineWidth = 3; ctx.stroke(windows);
  ctx.beginPath(); ctx.moveTo(222, 29); ctx.lineTo(220, 60); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.strokeStyle = '#813a68';
  ctx.beginPath(); ctx.moveTo(217, 68); ctx.lineTo(212, 116); ctx.lineTo(301, 116); ctx.lineTo(306, 68); ctx.stroke();
  ctx.strokeStyle = '#f9c2c7'; ctx.beginPath(); ctx.moveTo(20, 90); ctx.lineTo(120, 73); ctx.lineTo(321, 70); ctx.lineTo(399, 92); ctx.stroke();
  ctx.fillStyle = '#ffe4c1'; ctx.fillRect(276, 79, 16, 3);
  for (const cx of [94, 341]) {
    ctx.fillStyle = '#171323'; ctx.beginPath(); ctx.arc(cx, 121, 28, 0, 7); ctx.fill();
    ctx.fillStyle = linear(ctx, cx, 103, cx, 139, ['#ffe4d6', '#6f6b87', '#e1cde0']); ctx.beginPath(); ctx.arc(cx, 121, 18, 0, 7); ctx.fill();
    ctx.fillStyle = '#322841'; ctx.beginPath(); ctx.arc(cx, 121, 8, 0, 7); ctx.fill();
    ctx.strokeStyle = '#362c45'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * .4; ctx.beginPath(); ctx.moveTo(cx, 121); ctx.lineTo(cx + Math.cos(a) * 16, 121 + Math.sin(a) * 16); ctx.stroke();
    }
  }
  ctx.fillStyle = grade.rim; ctx.shadowBlur = 14; ctx.shadowColor = grade.rim; ctx.fillRect(15, 93, 26, 8); ctx.shadowBlur = 0;
  ctx.fillStyle = grade.hot; ctx.fillRect(389, 94, 15, 9);
  ctx.fillStyle = '#2b1b38'; ctx.fillRect(14, 113, 33, 5);
  ctx.restore();
}
export function collectorSeal(ctx, x, y, radius, grade) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.12);
  polygon(ctx, Array.from({ length: 64 }, (_, i) => {
    const a = i * Math.PI / 32, r = radius * (i % 2 ? .90 : 1);
    return [r * Math.cos(a), r * Math.sin(a)];
  }));
  ctx.strokeStyle = '#23152d'; ctx.lineWidth = radius * .13; ctx.stroke();
  ctx.fillStyle = grade.rim; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, radius * .74, 0, Math.PI * 2); ctx.lineWidth = radius * .035; ctx.stroke();
  print(ctx, 'COLLECTOR', 0, -radius * .34, radius * .16, { align: 'center', color: '#23152d' });
  print(ctx, '06', 0, radius * .20, radius * .69, { align: 'center', color: '#23152d' });
  print(ctx, 'EDITION', 0, radius * .46, radius * .16, { align: 'center', color: '#23152d' });
  ctx.restore();
}
