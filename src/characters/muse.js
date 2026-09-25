// Muse (Meta's AI): a fuzzy beige plush in sketch style. A round hood, nearly as wide as its belly, runs down into the body with
// barely a neck, and bulges out wider round the belly; a big peach face window fills the hood (wide-set dot eyes, blushing cheeks, a little smile). Long, thick arms
// hang outside the body, and two short chunky legs poke out under it.
// It takes Snoo's pose fields (snoo.js; its moves are Snoo's, muse-moveset.js), with a Like (dir 1, blue thumbs-up) or a heart
// (dir -1) for vote; Snoo's antenna (ant) is ignored
const MUSE = '#eadcc4', MUSE_FUR = '#c2ab88', MUSE_FACE = '#f7dfc6', MUSE_BLUSH = 'rgba(240,120,120,0.45)';
const META = '#0866ff', MUSE_HEART = '#ff3040';
const LIKE_CUFF = [[-1, -0.1], [-0.64, -0.1], [-0.64, 0.9], [-1, 0.9]]; // the thumbs-up, 2 wide, cuff then hand, thumb up
const LIKE_HAND = [[-0.52, -0.08], [-0.12, -0.55], [-0.06, -1], [0.18, -1], [0.3, -0.62], [0.2, -0.22], [0.84, -0.22], [1, -0.04],
  [0.94, 0.22], [0.86, 0.46], [0.76, 0.7], [0.6, 0.9], [-0.52, 0.9]];
// its outline: [y, half width] down the right side, crown to seat (hood widest at the eyes, a slight dip at the shoulders, belly
// widest low down), mirrored up the left, then evened out into points ~3px apart for the tufts
const MUSE_SIDE = [[-70, 0], [-69.7, 5], [-68.8, 9.5], [-67.2, 13], [-65, 15.8], [-62, 17.8], [-58, 19], [-53, 19.5], [-48, 19],
  [-43, 18.2], [-38, 19.2], [-31, 21.4], [-24, 22.8], [-17, 23], [-12, 21.5], [-9, 18], [-7, 12], [-6, 6], [-5.7, 0]];
const MUSE_OUTLINE = (() => {
  const loop = [...MUSE_SIDE.map(([y, w]) => [w, y]), ...MUSE_SIDE.slice(1, -1).reverse().map(([y, w]) => [-w, y])], out = [];
  for (let i = 0; i < loop.length; i++) {
    const [x0, y0] = loop[i], [x1, y1] = loop[(i + 1) % loop.length], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
    for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
  }
  return out;
})();

// fill and outline points with tufts: every other one pushed out from cx, cy
function museTufts(pts, cx, cy, lw) {
  path(pts.map(([x, y], i) => { const k = i % 2 ? 1.025 : 0.99; return [cx + (x - cx) * k + j(0.5), cy + (y - cy) * k + j(0.5)]; }));
  ctx.fillStyle = MUSE; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
}
// a fuzzy blob (arms, legs), turned by rot about its middle
function museFuzz(x, y, rx, ry, rot = 0) {
  const pts = [];
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * 6.283, px = Math.cos(a) * rx, py = Math.sin(a) * ry;
    pts.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]);
  }
  museTufts(pts, x, y, 2);
}

function drawMuse(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -36); ctx.rotate(pose.rot || 0); ctx.translate(0, 36); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  const both = v => Array.isArray(v) ? v : [v || 0, v || 0];
  const arm = both(pose.arm), swing = both(pose.swing), reach = Array.isArray(pose.reach) ? pose.reach : [0, pose.reach || 0];
  const feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  // an arm: a sausage growing out of the shoulder (its root inside the body), hanging splayed out a little, swinging about the
  // shoulder; reaching swings it out toward level and stretches it. The front one covers its own root line so it joins the body
  const drawArm = i => {
    const s = i ? 1 : -1, r = reach[i], sx = s * 17.5, sy = -38 + arm[i], t = Math.min(1, Math.abs(r) / 20), len = 23 + 0.6 * Math.abs(r);
    let dx = s * 0.45 * (1 - t) + Math.sign(r) * t, dy = 1 - 1.05 * t; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-swing[i]);
    museFuzz(dx * len / 2, dy * len / 2, len / 2 + 3, 6, Math.atan2(dy, dx));
    if (i) { ctx.fillStyle = MUSE; ctx.beginPath(); ctx.arc(dx * 2, dy * 2, 5, 0, 6.28); ctx.fill(); }
    ctx.restore();
  };
  for (const [i, fx] of [-7.5, 7.5].entries()) museFuzz(fx + feet[i][0], -5.5 + feet[i][1], 6.5, 5.5); // legs, under the body
  drawArm(0); // the back arm, behind the body
  museTufts(MUSE_OUTLINE, 0, -36, 2.4); // hood and body in one
  ctx.strokeStyle = MUSE_FUR; ctx.lineWidth = 1.2; // a few strokes of fur
  for (const [x, y] of [[-14, -30], [-6, -20], [8, -14], [15, -25], [-14, -15], [2, -31]]) line(x, y, x + 2, y + 4, 0.3, 1);

  // the face window, filling the hood, nudged toward facing: wide-set dot eyes, blush, a small smile
  ctx.fillStyle = MUSE_FACE; ctx.beginPath(); ctx.ellipse(2 + j(0.3), -54, 15, 11, 0, 0, 6.28); ctx.fill();
  ctx.lineWidth = 2; ellipse(2, -54, 15, 11, 0.4); ctx.strokeStyle = INK;
  ctx.fillStyle = MUSE_BLUSH; for (const bx of [-7.5, 11.5]) { ctx.beginPath(); ctx.ellipse(bx, -50.5, 3.2, 2, 0, 0, 6.28); ctx.fill(); }
  ctx.fillStyle = INK;
  for (const ex of [-5.5, 9.5]) { ctx.beginPath(); ctx.ellipse(ex, -55.5, 2, 2 * (1 - 0.85 * (pose.blink || 0)), 0, 0, 6.28); ctx.fill(); }
  ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(2, -53.5, 2.8, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();

  drawArm(1); // the front arm, over the body
  ctx.restore();
  if (pose.vote) museVote(cx + (pose.x || 0) * face, bottom + (pose.y || 0), face, ...pose.vote);
}

// the thumbs-up, unit size (2 wide) about the origin, in the current scale: set lineWidth first
function likeIcon() {
  ctx.fillStyle = META; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  for (const pts of [LIKE_CUFF, LIKE_HAND]) { path(pts); ctx.fill(); ctx.stroke(); }
}
// a heart, unit size about the origin
function heartPath() {
  ctx.beginPath(); ctx.moveTo(0, 0.9); ctx.bezierCurveTo(-1.3, 0, -0.9, -1.1, 0, -0.4); ctx.bezierCurveTo(0.9, -1.1, 1.3, 0, 0, 0.9);
}
// a like (dir 1) or a heart (dir -1) popping up at x, y: pops in big, settles, drifts off (up / down) and fades. Not turned with the body
function museVote(cx, bottom, face, x, y, t, dir) {
  const k = 9 * (t < 0.2 ? 1.3 * t / 0.2 : 1.3 - 0.3 * Math.min(1, (t - 0.2) / 0.2));
  ctx.save(); ctx.translate(cx + x * face, bottom + y - dir * 16 * t); ctx.scale(k, k);
  ctx.globalAlpha *= Math.min(1, 3 * (1 - t)); ctx.lineWidth = 2 / k;
  if (dir > 0) likeIcon(); else { ctx.fillStyle = MUSE_HEART; ctx.strokeStyle = INK; heartPath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// Meta's ∞, centred on the origin, w wide and h tall, stroked in Meta blue (its select screen logo)
function metaLoop(w, h, lw) {
  ctx.strokeStyle = META; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 48; i++) { const a = i / 48 * 6.283, d = 1 + Math.sin(a) ** 2; ctx.lineTo(w / 2 * Math.cos(a) / d, h * 1.414 * Math.sin(a) * Math.cos(a) / d); }
  ctx.stroke();
}
