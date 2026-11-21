import { linear, print } from './lettering.js';
import { alpha } from './photo.js';

export function polygon(ctx, vertices) {
  ctx.beginPath();
  vertices.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
}

function sequence(seed) {
  let state = seed;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function sky(ctx, w, h, grade) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, grade.cool], [.25, grade.sky[0]], [.55, grade.sky[1]], [.77, grade.sky[2]], [1, grade.hot],
  ]);
  ctx.fillRect(0, 0, w, h);
  const x = w * .7;
  const y = h * .58;
  const radius = Math.min(w * .144, h * .18);
  const bloom = ctx.createRadialGradient(x, y, radius * .2, x, y, radius * 3.7);
  bloom.addColorStop(0, '#ffe2aabb');
  bloom.addColorStop(.48, alpha(grade.warm, .37));
  bloom.addColorStop(1, '#ffd49a00');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = linear(ctx, 0, y - radius, 0, y + radius, ['#fff7d5', grade.warm, grade.hot]);
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  for (let band = 0; band < 7; band++) {
    ctx.fillStyle = alpha(grade.sky[0], .82);
    ctx.fillRect(x - radius, y + radius * (.34 + band * .104), radius * 2, radius * (.035 + band * .006));
  }
  ctx.restore();
  // Cloud ribbons are broad enough to survive reduction without looking like noise.
  ctx.save();
  ctx.globalAlpha = .15;
  ctx.fillStyle = grade.rim;
  polygon(ctx, [[0,h*.42],[w*.32,h*.406],[w*.68,h*.442],[w,h*.448],[w*.36,h*.438]]);
  ctx.fill();
  polygon(ctx, [[w*.13,h*.51],[w*.54,h*.49],[w*.97,h*.515],[w*.59,h*.509]]);
  ctx.fill();
  ctx.restore();
}

function palm(ctx, x, y, size, tilt, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(size, size);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  const trunk = new Path2D('M-7 350Q9 191 1 0L9-3Q28 193 14 350Z');
  ctx.fill(trunk);
  for (const [reach, lift, droop] of [[-122, -18, 43], [-97, -77, 25], [-41, -94, 14],
    [32, -88, 13], [96, -62, 27], [130, -7, 55], [89, 26, 68]]) {
    ctx.lineWidth = 2.9;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.quadraticCurveTo(reach * .62, lift, reach, lift + droop);
    ctx.stroke();
    for (let leaf = 1; leaf < 9; leaf++) {
      const t = leaf / 10;
      const ax = 5 * (1 - t) ** 2 + 2 * (1 - t) * t * reach * .62 + t * t * reach;
      const ay = 2 * (1 - t) * t * lift + t * t * (lift + droop);
      const fall = 14 + (1 - t) * 14;
      for (const sign of [-1, 1]) {
        polygon(ctx, [[ax, ay], [ax + sign * 13, ay + 3], [ax + sign * 23, ay + fall], [ax + sign * 5, ay + 6]]);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function skyline(ctx, w, h, horizon, grade, seed) {
  const random = sequence(seed);
  const unit = Math.min(w, h) / 720;
  ctx.fillStyle = '#513253';
  let x = -w * .015;
  while (x < w) {
    const width = w * (.012 + random() * .023);
    const rise = h * (.022 + random() ** 1.6 * .13);
    ctx.fillRect(x, horizon - rise, width, rise);
    x += width + w * .003;
  }
  ctx.fillStyle = '#33263f';
  [[.32, .052, .21], [.455, .042, .17], [.66, .057, .23], [.77, .05, .14], [.89, .045, .18]]
    .forEach(([fraction, breadth, elevation], index) => {
      const x = w * fraction;
      const width = w * breadth;
      const y = horizon - h * elevation;
      ctx.fillRect(x, y, width, h * elevation);
      ctx.fillRect(x + width * .2, y - h * .026, width * .6, h * .028);
      if (index % 2 === 0) ctx.fillRect(x + width * .4, y - h * .05, width * .2, h * .028);
      ctx.save();
      ctx.fillStyle = alpha(grade.rim, .55);
      for (let row = 0; row < 8; row++) {
        if (y + (row + 1) * 9 * unit > horizon) break;
        for (let column = 0; column < 3; column++) {
          if (random() < .25) continue;
          ctx.fillRect(x + width * (.16 + column * .27), y + (row + 1) * 9 * unit,
            Math.max(unit, width * .11), 2.1 * unit);
        }
      }
      ctx.restore();
    });
  ctx.fillStyle = '#35243f';
  ctx.fillRect(0, horizon - h * .009, w, h * .018);
}

function water(ctx, w, h, horizon, grade, seed) {
  const random = sequence(seed);
  ctx.fillStyle = linear(ctx, 0, horizon, 0, h, [
    [0, grade.sky[1]], [.23, grade.cool], [.65, '#49304e'], [1, '#181125'],
  ]);
  ctx.fillRect(0, horizon, w, h - horizon);
  for (let index = 0; index < 140; index++) {
    const depth = random();
    const width = w * (.002 + depth * (.01 + random() * .13));
    const x = w * .7 + (random() - .5) * w * (.14 + depth * .7);
    const y = horizon + depth * (h - horizon);
    ctx.fillStyle = alpha(index % 7 ? grade.warm : '#fff3c9', random() * (.29 - depth * .12));
    ctx.fillRect(x, y, width, Math.max(1, depth * h * .003));
  }
}

function bridge(ctx, w, h, y, grade) {
  ctx.save();
  ctx.strokeStyle = '#2a1c35';
  ctx.lineWidth = Math.max(2, h * .011);
  ctx.beginPath();
  ctx.moveTo(0, y + h * .036);
  ctx.bezierCurveTo(w * .27, y - h * .015, w * .65, y - h * .015, w, y + h * .018);
  ctx.stroke();
  ctx.strokeStyle = alpha(grade.rim, .65);
  ctx.lineWidth = Math.max(1, h * .0015);
  ctx.stroke();
  for (let pier = 1; pier < 7; pier++) {
    const x = w * pier / 7;
    ctx.fillStyle = '#302039';
    ctx.fillRect(x, y + h * .007, w * .004, h * .068);
  }
  ctx.restore();
}

export function sunsetStage(ctx, panel, grade) {
  ctx.save();
  ctx.translate(panel.x, panel.y);
  ctx.beginPath();
  ctx.rect(0, 0, panel.w, panel.h);
  ctx.clip();
  const w = panel.w, h = panel.h, horizon = h * .765;
  sky(ctx, w, h, grade);
  water(ctx, w, h, horizon, grade, 1907);
  skyline(ctx, w, h, horizon, grade, 1836);
  bridge(ctx, w, h, horizon + h * .024, grade);
  palm(ctx, w * .15, h * .26, h / 860, .12, '#33253be0');
  palm(ctx, w * .935, h * .39, h / 1200, -.1, '#39253de0');
  ctx.restore();
}

export function waterfront(ctx, width, height, grade) {
  const horizon = height * .794;
  sky(ctx, width, height, grade);
  water(ctx, width, height, horizon, grade, 481);
  skyline(ctx, width, height, horizon, grade, 776);
  bridge(ctx, width, height, horizon + height * .025, grade);
  palm(ctx, width * .085, height * .37, height / 810, .17, '#2b1e36e5');
  palm(ctx, width * .94, height * .45, height / 1140, -.12, '#2b1e36de');
  ctx.fillStyle = linear(ctx, 0, height * .73, 0, height, [
    [0, '#1c102400'], [.48, '#1c10243c'], [1, '#190e23ec'],
  ]);
  ctx.fillRect(0, height * .73, width, height * .27);
}

export function getawayCar(ctx, x, y, width, grade) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width / 310, width / 310);
  const silhouette = new Path2D('M5 53Q24 38 52 37L83 30L112 10Q151 0 186 10L218 29Q267 32 293 48L301 62L277 72H17L5 64Z');
  ctx.fillStyle = '#140d20';
  ctx.beginPath(); ctx.ellipse(157, 70, 150, 13, 0, 0, 7); ctx.fill();
  ctx.fillStyle = linear(ctx, 0, 7, 0, 73, [grade.rim, grade.warm, grade.hot, '#30203b']);
  ctx.fill(silhouette);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2a1830';
  ctx.stroke(silhouette);
  ctx.fillStyle = linear(ctx, 0, 7, 0, 33, ['#e8b298', '#4b3b59', '#211d35']);
  ctx.fill(new Path2D('M85 30L114 13Q131 9 150 9L151 31ZM157 9Q176 10 185 15L213 30L157 31Z'));
  ctx.strokeStyle = alpha(grade.rim, .7);
  ctx.beginPath(); ctx.moveTo(15, 50); ctx.bezierCurveTo(75, 34, 236, 36, 293, 52); ctx.stroke();
  for (const x of [62, 244]) {
    ctx.beginPath(); ctx.arc(x, 66, 18, 0, 7); ctx.fillStyle = '#170f23'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, 66, 10, 0, 7); ctx.strokeStyle = '#bea8a1'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.fillStyle = grade.rim; ctx.fillRect(274, 51, 20, 4);
  ctx.fillStyle = '#ff5a7d'; ctx.fillRect(13, 53, 21, 4);
  ctx.restore();
}

export function collectorSeal(ctx, x, y, radius, grade) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = grade.rim;
  ctx.lineWidth = radius * .05;
  ctx.fillStyle = '#24192d';
  ctx.beginPath(); ctx.arc(0, 0, radius, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, radius * .84, 0, 7); ctx.stroke();
  print(ctx, 'SUN COAST', 0, -radius * .29, radius * .2, { align: 'center', color: grade.rim, spacing: radius * .022 });
  print(ctx, '✦', 0, radius * .27, radius * .76, { align: 'center', color: grade.warm });
  print(ctx, 'PICTURES', 0, radius * .55, radius * .18, { align: 'center', color: grade.rim, spacing: radius * .035 });
  ctx.restore();
}
