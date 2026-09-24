// Wumpus (Discord's mascot): a blurple critter with a wide rounded head, floppy side ears, a pale snout
// and happy closed eyes, on a little bean body and stubby legs, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle)
//   arm = px (negative = up), or [back, front] · arms = radians each arm swings out and up from the shoulder, or [back, front] · reach = px an arm punches out in front (drawn over the body), or [back, front]
//   ears = radians each ear swings out and up from hanging (π = straight up), or [back, front]
//   props, placed like hitboxes (px from bottom-centre + x / y, facing right, not rotated or stretched with the body):
//   emoji = [x, y, radius, burst 0 … 1, kind = index into EMOJIS] a big emoji, bursting into a super-reaction sparkle ring (forward smash)
//   gem = [x, y, size, glow 0 … 1, burst 0 … 1] a pink server-boost gem (up smash) · pin = [x, y of the point, size, alpha] a red pushpin (down smash)
//   legs = Claw'd's four [dx, dy] foot offsets, back to front: the outer two move these feet
const WUMPUS = '#6f7cf0', WUMPUS_LIT = '#b4bcfb', WUMPUS_INK = '#2f3796';
const BOOST = '#ff73fa', BOOST_LIT = '#ffc4fd', PIN = '#ed4245', PEPE = '#4a8f3c';

function drawWumpus(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -34); ctx.rotate(pose.rot || 0); ctx.translate(0, 34); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  const pair = v => Array.isArray(v) ? v : [v || 0, v || 0];
  const arm = pair(pose.arm), swing = pair(pose.arms), reach = Array.isArray(pose.reach) ? pose.reach : [0, pose.reach || 0], ears = pair(pose.ears), feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  for (const [i, lx] of [-6, 6].entries()) { const [dx, dy] = feet[i]; rbox(lx + dx, -8 + dy / 2, 7, 12 + dy, 3.5, WUMPUS, 2); rbox(lx + 1 + dx, -3 + dy, 11, 6, 3, WUMPUS, 2); } // legs + feet
  for (const [i, s] of [-1, 1].entries()) if (!reach[i]) { // stubby arms, behind the body, swinging from the shoulder
    ctx.save(); ctx.translate(s * 11, -27 + arm[i]); ctx.rotate(-s * swing[i]); rbox(s, 5, 6, 12, 3, WUMPUS, 2); ctx.restore();
  }
  rbox(0, -23, 22, 24, 10, WUMPUS); // bean body
  for (const i of [0, 1]) if (reach[i]) { const w = Math.max(6, 10 + reach[i]); rbox(3 + w / 2, -24 - 3 * (1 - i) + arm[i], w, 7, 3.5, WUMPUS, 2); } // punching paws
  for (const [i, s] of [-1, 1].entries()) { // ears, behind the head, swinging from where they join it
    ctx.save(); ctx.translate(s * 26, -56); ctx.rotate(-s * ears[i]); ctx.translate(-s * 26, 56);
    rbox(s * 27, -47, 12, 22, 6, WUMPUS); rbox(s * 27.5, -47, 6, 14, 3, WUMPUS_LIT, 1.4); ctx.restore();
  }
  rbox(0, -49, 50, 34, 12, WUMPUS); // head

  // face, nudged toward facing: a pale snout with two nostrils, happy closed eyes either side above it
  rbox(4, -46, 20, 15, 6, WUMPUS_LIT, 2);
  ctx.fillStyle = WUMPUS_INK;
  for (const nx of [0, 8]) { ctx.beginPath(); ctx.roundRect(nx - 2, -46, 4, 2.4, 1.2); ctx.fill(); }
  ctx.lineWidth = 2;
  for (const ex of [-12, 19]) { ctx.beginPath(); ctx.arc(ex, -53, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  ctx.restore();

  if (!pose.emoji && !pose.gem && !pose.pin) return;
  ctx.save(); ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face, 1);
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  if (pose.emoji) {
    const [x, y, r, b = 0, kind = 0] = pose.emoji, e = EMOJIS[kind];
    if (b) sparkles(x, y, r * (1.2 + 1.6 * b), 1 - b, e.sparkle);
    if (b < 1 && r > 0.5) {
      ctx.save(); ctx.globalAlpha *= 1 - b; ctx.translate(x, y); ctx.scale(1 + 0.4 * b, 1 + 0.4 * b);
      ctx.fillStyle = e.fill; ctx.lineWidth = 2.4; if (e.head) e.head(r); else { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); } ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2; e.face(r); ctx.restore();
    }
  }
  if (pose.gem) {
    const [x, y, sz, glow = 0, b = 0] = pose.gem;
    if (b) sparkles(x, y, sz * (1.4 + 2.2 * b), 1 - b, BOOST);
    if (b < 1 && sz > 0.5) {
      ctx.save(); ctx.globalAlpha *= 1 - b; ctx.translate(x, y);
      if (glow) { ctx.fillStyle = BOOST; ctx.globalAlpha *= 0.25 * glow; ctx.beginPath(); ctx.arc(0, 0, sz * (1.5 + 0.5 * glow), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= 0.25 * glow; }
      const g = [[-0.8, -0.35], [-0.45, -0.8], [0.45, -0.8], [0.8, -0.35], [0, 0.9]].map(([u, v]) => [u * sz, v * sz]);
      ctx.fillStyle = BOOST; ctx.lineWidth = 2.2; path(g); ctx.fill(); ctx.stroke();
      ctx.fillStyle = BOOST_LIT; ctx.beginPath(); ctx.moveTo(-0.45 * sz, -0.8 * sz); ctx.lineTo(-0.2 * sz, -0.35 * sz); ctx.lineTo(0.2 * sz, -0.35 * sz); ctx.lineTo(0.45 * sz, -0.8 * sz); ctx.closePath(); ctx.fill(); // lit crown facet
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-0.8 * sz, -0.35 * sz); ctx.lineTo(0.8 * sz, -0.35 * sz); ctx.moveTo(-0.2 * sz, -0.35 * sz); ctx.lineTo(0, 0.9 * sz); ctx.lineTo(0.2 * sz, -0.35 * sz); ctx.stroke();
      ctx.restore();
    }
  }
  if (pose.pin) {
    const [x, y, sz, a = 1] = pose.pin;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
    ctx.lineWidth = 2.2; ctx.strokeStyle = '#9aa0a6'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -1.1 * sz); ctx.stroke(); ctx.strokeStyle = INK; // needle
    rbox(0, -1.15 * sz, 1.3 * sz, 0.28 * sz, 0.12 * sz, PIN, 2); // collar
    rbox(0, -1.45 * sz, 0.7 * sz, 0.45 * sz, 0.12 * sz, PIN, 2); // stem
    ctx.fillStyle = PIN; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, -1.85 * sz, 0.6 * sz, 0.32 * sz, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // head
    ctx.restore();
  }
  ctx.restore();
}

// the forward smash's emojis, drawn centred on (0, 0) at radius r: face draws over the filled, outlined head (a circle, or the path head builds)
const grin = (r, top = 0.12) => { ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-0.5 * r, top * r); ctx.quadraticCurveTo(0, 0.95 * r, 0.5 * r, top * r); ctx.closePath(); ctx.fill(); };
const happyEyes = r => { for (const ex of [-0.35, 0.35]) { ctx.beginPath(); ctx.arc(ex * r, -0.18 * r, 0.16 * r, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } };
function heart(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s); ctx.bezierCurveTo(x - 1.6 * s, y - 0.1 * s, x - 0.7 * s, y - 1.1 * s, x, y - 0.35 * s); ctx.bezierCurveTo(x + 0.7 * s, y - 1.1 * s, x + 1.6 * s, y - 0.1 * s, x, y + s); ctx.fill(); ctx.stroke(); }
const EMOJIS = [
  { fill: '#ffcc4d', sparkle: '#ffcc4d', face: r => { happyEyes(r); grin(r); } }, // 😄
  { fill: '#ffcc4d', sparkle: '#5dadec', face: r => { // 😂 tears of joy
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 0.35 * r, -0.12 * r, 0.16 * r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    grin(r, 0.1); ctx.fillStyle = '#5dadec'; ctx.lineWidth = 1.6;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 0.66 * r, -0.02 * r, 0.12 * r, 0.26 * r, -s * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  } },
  { fill: '#eceae6', sparkle: '#eceae6', face: r => { // 💀
    ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 0.34 * r, -0.12 * r, 0.22 * r, 0.25 * r, 0, 0, Math.PI * 2); ctx.fill(); }
    path([[0, 0.14 * r], [-0.1 * r, 0.32 * r], [0.1 * r, 0.32 * r]]); ctx.fill(); // nose
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-0.38 * r, 0.56 * r); ctx.lineTo(0.38 * r, 0.56 * r);
    for (const tx of [-0.19, 0, 0.19]) { ctx.moveTo(tx * r, 0.46 * r); ctx.lineTo(tx * r, 0.68 * r); } ctx.stroke(); // teeth
  } },
  { fill: '#ffcc4d', sparkle: '#ed4245', face: r => { // 😍
    ctx.fillStyle = '#ed4245'; ctx.lineWidth = 1.6; for (const s of [-1, 1]) heart(s * 0.36 * r, -0.2 * r, 0.2 * r);
    ctx.lineWidth = 2; grin(r, 0.2);
  } },
  { fill: PEPE, sparkle: PEPE, // sad Pepe (feelsbadman), three-quarter view facing the target
    head: r => smooth(scaled(r, [[-0.8, 0.74], [-0.98, 0.2], [-0.93, -0.35], [-0.72, -0.8], [-0.4, -1], [-0.08, -0.92], [0.05, -0.8],
      [0.2, -0.96], [0.55, -1], [0.86, -0.8], [1.02, -0.42], [1, 0.12], [0.92, 0.58], [0.62, 0.86], [0.1, 0.96], [-0.45, 0.9]])),
    face: r => {
      const at = (x, y) => [x * r, y * r], stroke = (w, ...curves) => { ctx.lineWidth = w; ctx.beginPath(); for (const [a, c, b] of curves) { ctx.moveTo(...at(...a)); ctx.quadraticCurveTo(...at(...c), ...at(...b)); } ctx.stroke(); };
      stroke(1.2, [[-0.66, -0.72], [-0.42, -0.84], [-0.16, -0.74]], [[0.2, -0.74], [0.46, -0.86], [0.74, -0.74]]); // brow hump creases
      stroke(1.4, [[-0.7, -0.44], [-0.36, -0.62], [-0.04, -0.54]], [[0.12, -0.54], [0.46, -0.64], [0.82, -0.44]]); // worried brows, high in the middle
      for (const [ex, ey, px, lid] of [[-0.32, -0.2, -0.26, [[-0.66, -0.16], [-0.3, -0.42], [0.0, -0.34]]], [0.44, -0.2, 0.48, [[0.12, -0.34], [0.46, -0.42], [0.78, -0.16]]]]) {
        const [cx, cy] = at(ex, ey);
        ctx.fillStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, cy, 0.32 * r, 0.26 * r, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(...at(px, -0.1), 0.14 * r, 0, Math.PI * 2); ctx.fill(); // big wet pupils
        ctx.fillStyle = '#fff'; for (const [dx, dy, g] of [[0.05, -0.05, 0.05], [-0.05, 0.05, 0.022]]) { ctx.beginPath(); ctx.arc(...at(px + dx, -0.1 + dy), g * r, 0, Math.PI * 2); ctx.fill(); }
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, 0.32 * r, 0.26 * r, 0, 0, Math.PI * 2); ctx.clip(); // heavy lid drooping over the top, lowest at the outer corner
        ctx.fillStyle = PEPE; ctx.beginPath(); ctx.moveTo(...at(lid[0][0] - 0.2, -0.6)); ctx.lineTo(...at(lid[0][0] - 0.2, lid[0][1]));
        ctx.lineTo(...at(...lid[0])); ctx.quadraticCurveTo(...at(...lid[1]), ...at(...lid[2])); ctx.lineTo(...at(lid[2][0] + 0.2, lid[2][1])); ctx.lineTo(...at(lid[2][0] + 0.2, -0.6)); ctx.fill(); ctx.restore();
        ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(...at(...lid[0])); ctx.quadraticCurveTo(...at(...lid[1]), ...at(...lid[2])); ctx.stroke();
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, cy, 0.32 * r, 0.26 * r, 0, 0, Math.PI * 2); ctx.stroke();
      }
      stroke(1.1, [[-0.6, 0.12], [-0.32, 0.22], [-0.06, 0.1]], [[0.18, 0.1], [0.46, 0.22], [0.76, 0.1]]); // bags under the eyes
      ctx.fillStyle = '#b5532f'; ctx.lineWidth = 2; ctx.beginPath(); // the pout: a fat frowning lip, drooping at the far corner
      ctx.moveTo(...at(-0.66, 0.52)); ctx.quadraticCurveTo(...at(0.0, 0.2), ...at(0.9, 0.32)); ctx.quadraticCurveTo(...at(1.1, 0.5), ...at(0.92, 0.7));
      ctx.quadraticCurveTo(...at(0.3, 0.8), ...at(-0.66, 0.52)); ctx.fill(); ctx.stroke();
      stroke(1.4, [[-0.6, 0.52], [0.2, 0.46], [0.98, 0.52]]); // where the lips meet
    } },
];

// a closed curve rounding through pts (it passes through their midpoints, bending toward each point)
function smooth(pts) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = pts.length;
  ctx.beginPath(); ctx.moveTo(...mid(pts[n - 1], pts[0]));
  pts.forEach((p, i) => ctx.quadraticCurveTo(...p, ...mid(p, pts[(i + 1) % n])));
  ctx.closePath();
}
const scaled = (r, pts) => pts.map(([x, y]) => [x * r, y * r]);

// a super-reaction burst: little four-point sparkles flying out on a ring of radius r
function sparkles(x, y, r, alpha, fill) {
  ctx.save(); ctx.globalAlpha *= Math.max(0, alpha); ctx.fillStyle = fill; ctx.lineWidth = 1.6;
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + 0.2, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r, s = k % 2 ? 4 : 6;
    ctx.beginPath(); ctx.moveTo(px, py - s); ctx.lineTo(px + s * 0.3, py - s * 0.3); ctx.lineTo(px + s, py); ctx.lineTo(px + s * 0.3, py + s * 0.3);
    ctx.lineTo(px, py + s); ctx.lineTo(px - s * 0.3, py + s * 0.3); ctx.lineTo(px - s, py); ctx.lineTo(px - s * 0.3, py - s * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
