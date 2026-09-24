// Shared hand-drawn drawing helpers. Pages assign `ctx` before drawing.
let ctx, seed = 1;
const INK = '#2a2622', PAPER = '#f2ede2', BOX = '#e0523a';

// seeded jitter: reseed once per frame (e.g. seed = floor(t * 8)) so lines "boil" at ~8fps
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const j = a => (rnd() - 0.5) * 2 * a;

function line(x1, y1, x2, y2, wob = 1.4, passes = 2) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  for (let k = 0; k < passes; k++) {
    const os = Math.min(4, len * 0.25), o1 = rnd() * os, o2 = rnd() * os; // overshoot like a quick pen stroke
    ctx.beginPath();
    ctx.moveTo(x1 - ux * o1 + j(wob), y1 - uy * o1 + j(wob));
    ctx.quadraticCurveTo((x1 + x2) / 2 + j(wob * 1.6), (y1 + y2) / 2 + j(wob * 1.6), x2 + ux * o2 + j(wob), y2 + uy * o2 + j(wob));
    ctx.stroke();
  }
}
function poly(pts, wob) { for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; line(a[0], a[1], b[0], b[1], wob); } }
function path(pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); }
function ellipse(cx, cy, rx, ry, wob = 1.2) {
  ctx.beginPath();
  const start = rnd() * 6.28, n = 28;
  for (let i = 0; i <= n + 2; i++) { // +2 = overlap at the join
    const a = start + i / n * 6.28;
    const x = cx + Math.cos(a) * (rx + j(wob)), y = cy + Math.sin(a) * (ry + j(wob));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}
// a rounded box centred on x, y: fill slightly off-register, then a crisp outline. r can be [tl, tr, br, bl] like roundRect
function rbox(x, y, w, h, r, fill, lw = 2.4) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x - w / 2 + j(1), y - h / 2 + j(1), w, h, r); ctx.fill();
  ctx.lineWidth = lw; ctx.beginPath(); ctx.roundRect(x - w / 2 + j(0.4), y - h / 2 + j(0.4), w, h, r); ctx.stroke();
}
function hatch(pts, gap = 11, alpha = 0.45) {
  ctx.save(); path(pts); ctx.clip();
  ctx.globalAlpha = alpha; ctx.lineWidth = 1;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let x = x0 - (y1 - y0); x < x1; x += gap) line(x, y1, x + (y1 - y0), y0, 1, 1);
  ctx.restore();
}

// a few sketched puffs drifting away in direction dir (±1) and fading as t goes 0 → 1
function drawDust(x, y, t, dir) {
  ctx.save();
  ctx.globalAlpha = 0.7 * (1 - t); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.fillStyle = PAPER;
  for (const [dx, dy, r] of [[0, -4, 5], [9, -8, 4], [16, -3, 3.5]]) {
    const px = x + dir * (dx + 14 * t), py = y + dy - 6 * t, pr = r * (0.6 + t);
    ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.28); ctx.fill();
    ellipse(px, py, pr, pr, 0.6);
  }
  ctx.restore();
}

// grainy paper with fibers and darker edges, baked once at canvas pixel size
function makePaper(w, h, dpr) {
  const c = document.createElement('canvas');
  c.width = w * dpr; c.height = h * dpr;
  const p = c.getContext('2d');
  p.fillStyle = PAPER; p.fillRect(0, 0, c.width, c.height);
  const img = p.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  p.putImageData(img, 0, 0);
  p.scale(dpr, dpr);
  p.strokeStyle = '#7a6a55'; p.lineWidth = 0.6; p.globalAlpha = 0.07;
  for (let i = 0; i < w * h / 1850; i++) { // fibers
    const x = Math.random() * w, y = Math.random() * h, a = Math.random() * 6.28, l = 4 + Math.random() * 14;
    p.beginPath(); p.moveTo(x, y);
    p.quadraticCurveTo(x + Math.cos(a) * l / 2 + 2, y + Math.sin(a) * l / 2 - 2, x + Math.cos(a) * l, y + Math.sin(a) * l);
    p.stroke();
  }
  p.globalAlpha = 1;
  const g = p.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.75);
  g.addColorStop(0, 'rgba(120,95,60,0)'); g.addColorStop(1, 'rgba(120,95,60,0.22)');
  p.fillStyle = g; p.fillRect(0, 0, w, h);
  return c;
}
