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
// and its specials:
//   tag = [text, x, y, t 0 … 1, colour] a label popping up at x, y (px from bottom-centre, like hitboxes) and drifting up (throws)
//   stream = [phase (frames), spent 0 … 1, on 0 … 1] electric-blue sparks shooting from between its hands, shorter as it's spent
//   poke = true: a pointing finger on the end of the front arm · balloons = [size 0 … 1, pop 0 … 1 or null, sway] birthday
//   balloons tied to its raised hands · imagine = [prompt 0 … 1, drop height px, size 0 … 1, landed 0 … 1, pick] a Meta AI prompt
//   over its head, and what it imagined (MUSE_IMAGINE[pick]) appearing high up ahead of it and dropping
const MUSE = '#eadcc4', MUSE_FUR = '#c2ab88', MUSE_FACE = '#f7dfc6', MUSE_BLUSH = 'rgba(240,120,120,0.45)';
const META = '#0866ff', MUSE_HEART = '#ff3040', LLAMA = '#fbf8f2';
const SABER = ['#ff2a4a', '#1f8bff']; // Beat Saber's red (left hand) and blue (right)
const SPARKS = ['#8b5cf6', '#ff7ad9', '#ffffff', '#0866ff']; // Muse Spark's violet, pink, white and Meta blue
const BALLOONS = [['#f25c54', -15, -54], ['#3a86ff', 0, -68], ['#ffd23f', 15, -54]]; // colour, and x, y above the hands
const MUSE_IMAGINE = ['a piano', 'a rubber duck', 'a birthday cake', 'an anvil']; // what the down special can come up with
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
    if (i && pose.poke) museFuzz(dx * (len + 8), dy * (len + 8), 5, 2.8, Math.atan2(dy, dx)); // the pointing finger
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
  if (pose.stream?.[2] > 0.02) museStream(...pose.stream); // over the hands
  ctx.restore();
  if (pose.tag) museTag(cx + ((pose.x || 0) + pose.tag[1]) * face, bottom + (pose.y || 0) + pose.tag[2], pose.tag[0], pose.tag[3], pose.tag[4]);
  if (pose.vote) museVote(cx + (pose.x || 0) * face, bottom + (pose.y || 0), face, ...pose.vote);
  if (pose.llama) museLlama(cx + 66 * face, bottom, face, ...pose.llama); // where it stands, whatever Muse does
  if (pose.cubes) museCubes(cx, bottom, face, ...pose.cubes);
  if (pose.balloons) museBalloons(cx + (pose.x || 0) * face, bottom + (pose.y || 0) - 62 * (pose.sy ?? 1), ...pose.balloons);
  if (pose.imagine) museImagine(cx, bottom, face, cx + (pose.x || 0) * face, bottom + (pose.y || 0), ...pose.imagine);
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

// a four-point sparkle about the origin, r to each tip, turned by spin
function sparkPath(r, spin = 0) {
  ctx.beginPath(); ctx.moveTo(r * Math.sin(spin), -r * Math.cos(spin));
  for (let k = 1; k <= 4; k++) {
    const a = spin + k * Math.PI / 2, m = a - Math.PI / 4;
    ctx.quadraticCurveTo(0.12 * r * Math.sin(m), -0.12 * r * Math.cos(m), r * Math.sin(a), -r * Math.cos(a));
  }
  ctx.closePath();
}

// the neutral special's spark stream, in Muse's body frame: electric blue, shooting from between its hands held out together. A blue
// glow fading out, jagged crackles flickering along it, and sparks: streaks tapering back from white-hot tips, sprayed out and
// sinking as they cool (each out and gone in 12 frames, so the loop is seamless); a bright flash at the hands. spent shortens it,
// on fades it
const SPARK_BLUE = '#1f8bff', SPARK_GLOW = '#8fd0ff';
const SPARK_ROWS = [0.1, -0.7, 0.5, -0.2, 0.9, -0.5, 0.3, -0.9, 0.7, 0, -0.35, 0.6, -0.8, 0.25, -0.1, 0.45]; // each spark's side of the stream
function museStream(ph, spent, on) {
  const L = 54 * (1 - 0.45 * spent), mx = 56, my = -38; // its reach, from between the hands
  ctx.save(); ctx.globalAlpha *= on; ctx.lineCap = ctx.lineJoin = 'round';
  const g = ctx.createLinearGradient(mx, 0, mx + L, 0); g.addColorStop(0, 'rgba(31,139,255,0.22)'); g.addColorStop(1, 'rgba(31,139,255,0)');
  ctx.fillStyle = g; path([[mx, my - 4], [mx + L, my - 18], [mx + L, my + 18], [mx, my + 4]]); ctx.fill(); // a glow fading out
  const glowLine = (pts, w) => { // a bright line: wide pale glow, blue body, white core
    for (const [c, lw, a] of [[SPARK_GLOW, w * 2.6, 0.35], [SPARK_BLUE, w * 1.4, 1], ['#fff', w * 0.6, 1]]) {
      ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], n) => n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
    }
  };
  for (let b = 0; b < 2; b++) { // crackles: fine jagged bolts out into the stream, forking once, redrawn each frame so they flicker
    const pts = [[mx, my]], d = (b ? -1 : 1) * 10, n = 9, reach = L * (0.55 + 0.2 * rnd());
    for (let k = 1; k <= n; k++) pts.push([mx + reach * k / n, my + d * k / n + j(1.5 + k * 0.9)]);
    glowLine(pts, 1.1);
    const [fx, fy] = pts[5]; glowLine([[fx, fy], [fx + 7, fy + d * 0.4 + j(3)], [fx + 12, fy + d * 0.9 + j(3)]], 0.8);
  }
  SPARK_ROWS.forEach((side, k) => { // sprayed out from the mouth each at its own angle and speed, sinking as they fly: a streak that
    // tapers back from a white-hot tip
    const u = (ph / 12 + k / SPARK_ROWS.length) % 1, a = side * 0.42, sp = 0.75 + 0.3 * ((k * 7) % 5) / 4, d = u * L * sp;
    const x = mx + 3 + Math.cos(a) * d, y = my + Math.sin(a) * d + 8 * u * u, len = 4 + 10 * (1 - u) * sp, w = 1.5 * (1 - 0.5 * u);
    const back = f => [x - Math.cos(a) * len * f, y - (Math.sin(a) * len + 2 * u) * f];
    ctx.save(); ctx.globalAlpha *= Math.min(1, (1 - u) * 2.5);
    glowLine([back(1), [x, y]], w * 0.5); glowLine([back(0.45), [x, y]], w);
    ctx.restore();
  });
  for (let k = 0; k < 3; k++) { // twinkles: little four-point flashes popping up along it
    const tx = mx + 10 + rnd() * L * 0.9, ty = my + (rnd() - 0.5) * 26 * (tx - mx) / L, r = 2 + rnd() * 3;
    glowLine([[tx - r, ty], [tx + r, ty]], 0.7); glowLine([[tx, ty - r], [tx, ty + r]], 0.7);
  }
  ctx.fillStyle = 'rgba(143,208,255,0.55)'; ctx.beginPath(); ctx.arc(mx + 2, my, 6 + j(1), 0, 6.28); ctx.fill(); // the flash at the hands
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx + 2, my, 3, 0, 6.28); ctx.fill();
  ctx.restore();
}

// "Muse poked you!", stuck on whoever the side special hit (a sticker: x, y where, rot its tilt, a fading): a white pill with a blue
// rim and a pointing finger. Never mirrored
function drawPokeNote(x, y, rot, a) {
  ctx.save(); ctx.translate(x, y - 34); ctx.rotate(rot * 0.3 - 0.08); ctx.globalAlpha *= a; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.fillStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-50, -11, 100, 22, 11); ctx.fill(); ctx.strokeStyle = META; ctx.stroke();
  ctx.fillStyle = META; ctx.beginPath(); ctx.arc(-38, 0, 7, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; line(-42, 1, -34, -3, 0.2, 1); // the finger, poking
  ctx.fillStyle = '#1c1e21'; ctx.font = '700 11px ui-sans-serif, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Muse poked you!', 7, 0.5);
  ctx.restore();
}

// the up special's birthday balloons, tied at x, y (Muse's raised hands): strings up to three balloons, swaying; size k pops them in,
// and once pop (0 … 1) they've burst: a ring of dashes where each was, fading. Never mirrored
function museBalloons(x, y, k, pop, sway) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.12 * Math.sin(sway)); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  for (const [col, bx, by] of BALLOONS) {
    const tx = bx * k, ty = by * k; // its knot
    if (pop != null) {
      ctx.save(); ctx.globalAlpha *= 1 - pop; ctx.strokeStyle = col; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = 8 + 14 * pop; line(tx + Math.cos(a) * r, ty - 12 + Math.sin(a) * r, tx + Math.cos(a) * (r + 6), ty - 12 + Math.sin(a) * (r + 6), 0.3, 1); }
      ctx.restore(); continue;
    }
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(tx * 0.3 + 4, ty * 0.5, tx, ty); ctx.stroke(); // string
    ctx.save(); ctx.translate(tx, ty - 12 * k); ctx.scale(k, k);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 10.5, 12.5, 0, 0, 6.28); ctx.fill(); ctx.lineWidth = 2; ellipse(0, 0, 10.5, 12.5, 0.4);
    path([[0, 12], [-2.5, 16], [2.5, 16]]); ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke(); // knot
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-3, -3, 5, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// the down special: a Meta AI prompt bubble over Muse (at mx, my: its feet), "Imagine …" behind the Meta AI ring, and the thing it
// imagined, at 58 px ahead of where it stood (cx, floor), shimmering in size k high up at y (px above the floor), then dropping:
// it squashes as it lands (landed 0 … 1) and fades. Only the bubble reads left to right; the thing faces Muse's way
function museImagine(cx, floor, face, mx, my, prompt, y, k, landed, pick = 0) {
  if (prompt > 0.02) {
    const text = 'Imagine ' + MUSE_IMAGINE[pick];
    ctx.save(); ctx.globalAlpha *= prompt; ctx.translate(mx, my - 98); ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
    const w = ctx.measureText(text).width + 34;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.roundRect(-w / 2, -12, w, 24, 12); ctx.fill(); ctx.stroke();
    const g = ctx.createLinearGradient(-w / 2 + 6, 6, -w / 2 + 22, -6); g.addColorStop(0, META); g.addColorStop(1, SPARKS[1]);
    ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-w / 2 + 14, 0, 5.5, 0, 6.28); ctx.stroke(); // the Meta AI ring
    ctx.fillStyle = '#1c1e21'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 25, 0.5);
    ctx.restore();
  }
  if (k < 0.02) return;
  const sq = landed > 0 ? 1 - 0.25 * Math.sin(Math.min(1, landed * 3) * Math.PI) : 1; // squash on landing
  ctx.save(); ctx.translate(cx + 58 * face, floor - y); ctx.globalAlpha *= landed > 0.6 ? (1 - landed) / 0.4 : 1;
  if (k < 1) { // still being generated: sparkles round it
    ctx.save(); ctx.globalAlpha *= 1 - k; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(Math.cos(i * 1.3 + k * 6) * 26, -18 + Math.sin(i * 1.9 + k * 5) * 20); ctx.fillStyle = SPARKS[i % 4]; sparkPath(5, k * 3); ctx.fill(); ctx.restore(); }
    ctx.restore();
  }
  ctx.scale(face * k / sq, k * sq); ctx.strokeStyle = INK; ctx.lineJoin = ctx.lineCap = 'round'; ctx.lineWidth = 2;
  IMAGINED[pick]();
  ctx.restore();
}
// each thing Muse can imagine, drawn with its bottom-centre on the origin, facing +x, about 44 wide
const IMAGINED = [
  () => { // an upright piano: a dark box, its keys, a lid
    rbox(0, -24, 44, 48, 3, '#2b2320', 2); ctx.fillStyle = '#fff'; ctx.fillRect(-20, -26, 40, 8);
    ctx.fillStyle = INK; for (let i = 0; i < 6; i++) ctx.fillRect(-16 + i * 7, -26, 3, 5);
    ctx.lineWidth = 1.6; line(-20, -26, 20, -26, 0.2, 1); line(-22, -44, 22, -44, 0.3, 1);
  },
  () => { // a rubber duck
    museFuzz(0, -13, 20, 13, 0, '#ffd23f'); museFuzz(10, -32, 11, 10, 0, '#ffd23f');
    ctx.fillStyle = '#ff8c1a'; path([[19, -33], [29, -30], [19, -27]]); ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(13, -35, 1.8, 0, 6.28); ctx.fill();
  },
  () => { // a birthday cake: two tiers, icing, a candle
    rbox(0, -10, 44, 20, 4, '#f7d6e0', 2); rbox(0, -28, 32, 16, 4, '#fbe9ef', 2);
    ctx.strokeStyle = '#e8508a'; ctx.lineWidth = 2; line(-20, -14, 20, -14, 0.6, 1); ctx.strokeStyle = INK;
    rbox(0, -42, 4, 12, 1.5, SABER[1], 1.4); ctx.fillStyle = '#ffb000'; ctx.beginPath(); ctx.ellipse(0, -52, 2.5, 4, 0, 0, 6.28); ctx.fill();
  },
  () => { // an anvil
    ctx.fillStyle = '#5b5f68';
    path([[-22, -36], [14, -36], [24, -30], [12, -26], [8, -14], [16, 0], [-16, 0], [-8, -14], [-12, -26], [-22, -28]]); ctx.fill(); ctx.stroke();
  },
];

// a label (a throw's "Shared!", "Unfriended") popping up at x, y in a white pill rimmed in col, drifting up and fading. Never mirrored
function museTag(x, y, text, t, col) {
  const k = t < 0.15 ? 1.25 * t / 0.15 : 1.25 - 0.25 * Math.min(1, (t - 0.15) / 0.15);
  ctx.save(); ctx.translate(x, y - 14 * t); ctx.scale(k, k); ctx.globalAlpha *= Math.min(1, 3 * (1 - t));
  ctx.font = '700 11px ui-sans-serif, system-ui, sans-serif'; const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-w / 2, -10, w, 20, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 0.5);
  ctx.restore();
}
