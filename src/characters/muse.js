// Muse (Meta's AI): a fuzzy beige plush in sketch style. A round hood, nearly as wide as its belly, runs down into the body with
// barely a neck, and bulges out wider round the belly; a big peach face window fills the hood (wide-set dot eyes, blushing cheeks, a little smile). Long, thick arms
// hang outside the body, and two short chunky legs poke out under it.
// It takes Snoo's pose fields (snoo.js; most of its moves are Snoo's, muse-moveset.js), with a Like (dir 1, blue thumbs-up) or a
// heart (dir -1) for vote; Snoo's antenna (ant) is ignored. Its own, for its smashes:
//   llama = [size 0 … 1, buck, poof] a llama with Meta's ∞ on its side standing in front of Muse, facing it: buck < 0 crouches it
//           (rear low), 1 = both back legs kicked out forward, rear up · poof = 0 … 1 a ring as it pops in or out (or null)
//   story = 0 … 1 an Instagram story ring bursting open overhead, Muse's face in it, then fading
//   sabers = 0 … 1 Beat Saber sabers lit in both hands, blades running on out along the arms (red in the back hand, blue in the
//            front) · slash = 0 … 1 their swing's glowing trail, fanning back to where they were raised overhead, fading
//   cubes = [in 0 … 1, cut] a red and a blue Beat Saber cube sliding in either side; cut = 0 … 1 once sliced, halves flying (or null)
//   headset = 0 … 1 size of the Quest headset strapped over its face window (it grins under it)
const MUSE = '#eadcc4', MUSE_FUR = '#c2ab88', MUSE_FACE = '#f7dfc6', MUSE_BLUSH = 'rgba(240,120,120,0.45)';
const META = '#0866ff', MUSE_HEART = '#ff3040', LLAMA = '#fbf8f2';
const SABER = ['#ff2a4a', '#1f8bff']; // Beat Saber's red (left hand) and blue (right)
const IG = ['#feda75', '#fa7e1e', '#d62976', '#962fbf', '#4f5bd5']; // Instagram's gradient, bottom left to top right
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
function museTufts(pts, cx, cy, lw, col = MUSE) {
  path(pts.map(([x, y], i) => { const k = i % 2 ? 1.025 : 0.99; return [cx + (x - cx) * k + j(0.5), cy + (y - cy) * k + j(0.5)]; }));
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
}
// a fuzzy blob (arms, legs, the llama), turned by rot about its middle
function museFuzz(x, y, rx, ry, rot = 0, col = MUSE) {
  const pts = [];
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * 6.283, px = Math.cos(a) * rx, py = Math.sin(a) * ry;
    pts.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]);
  }
  museTufts(pts, x, y, 2, col);
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
    if (pose.sabers > 0.02) museSaber(Math.atan2(dy, dx), len, pose.sabers, i, pose.slash != null ? [pose.slash, (i ? 3 : -3) - swing[i]] : null);
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

  if (pose.headset > 0.05) museHeadset(pose.headset);
  drawArm(1); // the front arm, over the body
  ctx.restore();
  if (pose.vote) museVote(cx + (pose.x || 0) * face, bottom + (pose.y || 0), face, ...pose.vote);
  if (pose.llama) museLlama(cx + 66 * face, bottom, face, ...pose.llama); // where it stands, whatever Muse does
  if (pose.cubes) museCubes(cx, bottom, face, ...pose.cubes);
  if (pose.story != null) museStory(cx + (pose.x || 0) * face, bottom + (pose.y || 0) - 118, pose.story);
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

// Meta's ∞, centred on the origin, w wide and h tall, stroked in Meta blue (its select screen logo, the llama's side)
function metaLoop(w, h, lw) {
  ctx.strokeStyle = META; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 48; i++) { const a = i / 48 * 6.283, d = 1 + Math.sin(a) ** 2; ctx.lineTo(w / 2 * Math.cos(a) / d, h * 1.414 * Math.sin(a) * Math.cos(a) / d); }
  ctx.stroke();
}

// the forward smash's llama at x, floor, facing Muse (its head toward -face), drawn in its own frame with the head at +x
function museLlama(x, floor, face, k, b, poof) {
  if (poof != null) snooPoof(x, floor - 30, poof);
  if (k < 0.02) return;
  ctx.save(); ctx.translate(x, floor); ctx.scale(-face * k * 1.2, k * 1.2); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  ctx.translate(10, 0); ctx.rotate(0.2 * b); ctx.translate(-10, 0); // tips about its front feet: rear up to buck, down to crouch
  const leg = (lx, a) => { // a leg off the hip at lx, turned a (0 = straight down), ending in a dark hoof
    ctx.save(); ctx.translate(lx, -20); ctx.rotate(a); rbox(0, 9, 5, 19, 2.5, LLAMA, 1.8);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 19, 3, 2.2, 0, 0, 6.28); ctx.fill(); ctx.restore();
  };
  for (const lx of [-14, -9]) leg(lx, Math.max(0, b) * 1.5); // back legs: swing back to straight out behind it (at Muse's foe)
  museFuzz(-20, -31, 4, 5, 0.4, LLAMA); // tail
  museFuzz(0, -26, 19, 11, 0, LLAMA); // body
  ctx.save(); ctx.translate(-1, -26); metaLoop(22, 11, 3.2); ctx.restore(); ctx.strokeStyle = INK; // Meta's ∞ on its side
  for (const lx of [8, 13]) leg(lx, 0); // front legs, planted
  museFuzz(15, -41, 5.5, 13, 0.15, LLAMA); // neck
  museFuzz(13.5, -62, 1.8, 4.5, -0.25, LLAMA); museFuzz(17.5, -63, 1.8, 4.5, 0.15, LLAMA); // ears
  museFuzz(18, -54, 7.5, 6, 0, LLAMA); museFuzz(25, -52, 5, 4, 0, LLAMA); // head, snout
  ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(25, -51, 2.5, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); // a smug little grin
  ctx.fillStyle = INK;
  if (b > 0.5) { ctx.beginPath(); ctx.arc(20, -56.5, 1.8, Math.PI, 0); ctx.stroke(); } // squeezed shut, kicking
  else { ctx.beginPath(); ctx.arc(20, -56, 1.4, 0, 6.28); ctx.fill(); }
  ctx.restore();
}

// the up smash's Instagram story ring at x, y (its middle): bursts open, holds, grows a little more and fades, Muse's face as the
// avatar in the middle. Never mirrored
function museStory(x, y, t) {
  const up = Math.min(1, t / 0.15), r = 10 + 24 * (1 - (1 - up) ** 3) + 10 * Math.max(0, t - 0.6);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= Math.min(1, 3 * (1 - t)); ctx.lineCap = 'round';
  ctx.fillStyle = MUSE_FACE; ctx.beginPath(); ctx.arc(0, 0, r - 7, 0, 6.28); ctx.fill();
  ctx.fillStyle = MUSE_BLUSH; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 0.4, r * 0.12, r * 0.13, r * 0.08, 0, 0, 6.28); ctx.fill(); }
  ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * 0.28, -r * 0.08, r * 0.07, 0, 6.28); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, r * 0.02, r * 0.14, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  const g = ctx.createLinearGradient(-r, r, r, -r); IG.forEach((c, i) => g.addColorStop(i / 4, c));
  ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ellipse(0, 0, r + 3.5, r + 3.5, 0.4); ellipse(0, 0, r - 3.5, r - 3.5, 0.4);
  ctx.restore();
}


// a Quest headset over the face window, in Muse's body frame, k = size (it pops on from its middle): the strap round the hood,
// the white visor with its three dark camera pods, and a grin showing under it
function museHeadset(k) {
  ctx.save(); ctx.translate(3, -56); ctx.scale(k, k); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#4a4a4f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, -1); ctx.quadraticCurveTo(-20, -4, -21, 2); ctx.stroke(); // strap
  rbox(0, 0, 30, 15, 6, '#f4f3f0', 2);
  ctx.fillStyle = '#26262b'; for (const px of [-9, 0, 9]) { ctx.beginPath(); ctx.roundRect(px - 1.8, -4.5, 3.6, 9, 1.8); ctx.fill(); }
  ctx.fillStyle = MUSE_BLUSH; for (const bx of [-10, 13]) { ctx.beginPath(); ctx.ellipse(bx, 10, 2.6, 1.6, 0, 0, 6.28); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(1, 7.5, 3.4, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  ctx.restore();
}

// a Beat Saber saber in an arm's frame (from the shoulder, the arm pointing at angle a, len long): the hilt in the fist, the blade
// k of its length, lit on out along the arm. trail = [t, sweep]: the swing's fan of light, from sweep radians back to here, fading
function museSaber(a, len, k, i, trail) {
  const col = SABER[i], r0 = len + 2, r1 = r0 + 6 + 34 * k;
  ctx.save(); ctx.lineCap = 'round';
  if (trail && trail[0] < 1) {
    ctx.save(); ctx.globalAlpha *= 0.22 * (1 - trail[0]) ** 2; ctx.fillStyle = col; ctx.beginPath();
    ctx.arc(0, 0, r1, a, a - trail[1], trail[1] > 0); ctx.arc(0, 0, r0 + 6, a - trail[1], a, trail[1] <= 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.rotate(a);
  const seg = (x0, x1, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke(); };
  seg(r0 - 3, r0 + 6, 5, INK); seg(r0 - 3, r0 + 6, 2.4, '#8a8f99'); // the hilt
  ctx.globalAlpha *= 0.35; seg(r0 + 6, r1, 9, col); ctx.globalAlpha /= 0.35; // glow
  seg(r0 + 6, r1, 4.2, col); seg(r0 + 7, r1 - 1, 1.6, '#fff'); // the blade, white hot down the middle
  ctx.restore();
}

// the down smash's two Beat Saber cubes, one each side of x at the floor (red behind Muse, blue in front), a white arrow on each:
// they slide in as u goes 0 … 1; once cut (0 … 1) each splits across the middle, the top half flying up and out, the bottom
// dropping, both spinning and fading. Never mirrored
function museCubes(x, floor, face, u, cut) {
  for (const [i, s] of [[0, -face], [1, face]]) {
    const cx = x + s * (110 - 50 * u), cy = floor - 24;
    ctx.save(); ctx.globalAlpha *= cut == null ? Math.min(1, 3 * u) : 1 - cut; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
    const half = (dy, ox, oy, rot) => { // a half: dy = -1 top, 1 bottom
      ctx.save(); ctx.translate(cx + ox, cy + oy); ctx.rotate(rot); ctx.beginPath(); ctx.rect(-9, dy < 0 ? -9 : 0, 18, 9); ctx.clip();
      rbox(0, 0, 18, 18, 3.5, SABER[i], 1.8);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-5, -3); ctx.lineTo(0, 2); ctx.lineTo(5, -3); ctx.stroke(); // the arrow
      ctx.restore();
    };
    if (cut == null) { half(-1, 0, 0, 0); half(1, 0, 0, 0); }
    else {
      half(-1, s * 22 * cut, -26 * cut + 30 * cut * cut, s * 2.5 * cut);
      half(1, s * 12 * cut, 22 * cut * cut, -s * 1.5 * cut);
      ctx.globalAlpha *= 1 - cut; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; line(cx - 14, cy, cx + 14, cy, 0.3, 1); // the cut line, flashing
    }
    ctx.restore();
  }
}
