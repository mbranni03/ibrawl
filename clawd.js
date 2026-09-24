// Claw'd, drawn from the Claude Code mascot's pixel grid (18 x 5 half-cells), in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch · rot radians (+ = lean forward) · blink (0 open … 1 shut)
//   arm  = px (negative = up), or [back, front] to move them separately
//   reach = px the front arm nub sticks out forward (punches)
//   shield = 0 … 1 size of the little terminal Claw'd holds over its head (0 = none) · wear = 0 … 1 how worn it is: cracks + fading
//   shatter = 0 … 1 the terminal bursting into shards · dizzy = orbit phase (turns) of stars overhead + spiral eyes (0 = off)
//   oops = 0 … 1 visibility of an error toast over its head, oopsMsg = which one (OOPS)
//   legs = four [dx, dy] foot offsets in px, back to front (dy negative = lifted)
//   speed = 0 … 1 horizontal motion lines (negative = trailing off the front, for moving backwards) · fallLines = 0 … 1 vertical streaks above (fast fall)
//   dust / dustAhead / puff = 0 … 1 progress of a dust cloud behind / in front / on both sides (drawClawdFx)
//   air  = preview-only height above the floor (negative = up); in the game, physics moves the character instead
//   spark = [x, y, spin] a held Claude spark, px from bottom-center like hitboxes (side special wind-up)
//   squint = eyes squeezed shut as > < · eyeY = px to move the eyes down (ducking under the shield) · effort = 0 … 1 charge strokes + effort bar overhead (neutral special)
//   aura = effort tier 0 … 3: glow, one halo per tier, rising sparks · burst = 0 … 1 progress of a tier-up ring
const CLAWD = '#d97757';
const CU = 5, CV = 10; // one grid cell, px (terminal half-cells are twice as tall as wide)

// the Claude spark: an asterisk of slightly uneven, blunt rays. [angle, length] per ray
const SPARK = [[0, 1], [0.5, 0.8], [1.07, 0.95], [1.58, 0.78], [2.1, 1], [2.62, 0.84], [3.16, 0.96], [3.68, 0.8], [4.2, 1], [4.72, 0.85], [5.26, 0.93], [5.77, 0.79]];
const SPARK_R = 16;
function drawSpark(x, y, r = SPARK_R, spin = 0) {
  const pts = [], at = (a, l) => [x + Math.cos(a + spin) * r * l, y + Math.sin(a + spin) * r * l];
  for (const [a, l] of SPARK) pts.push(at(a - 0.1, l), at(a + 0.1, l), at(a + 0.26, 0.3));
  ctx.save(); // one clean outline: sketchy per-segment strokes pile up into a black blob at this size
  ctx.fillStyle = CLAWD; ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.lineJoin = 'round';
  path(pts); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawClawd(cx, bottom, pose = {}, face = 1) {
  const U = CU * (pose.sx ?? 1), V = CV * (pose.sy ?? 1);
  const [ab, af] = Array.isArray(pose.arm) ? pose.arm : [pose.arm || 0, pose.arm || 0];
  const [al, ar] = face > 0 ? [ab, af] : [af, ab];
  const ox = cx + (pose.x || 0) * face - 9 * U, oy = bottom + (pose.y || 0) - 5 * V;
  const at = (gx, gy, dy = 0, dx = 0) => [ox + gx * U + dx, oy + gy * V + dy];
  const rch = pose.reach || 0, [rl, rr] = face > 0 ? [0, rch] : [-rch, 0];

  const mx = ox + 9 * U, my = oy + 2.5 * V;
  if (pose.speed) { // motion lines trailing off the back edge (negative speed = moving backwards: off the front edge)
    const sp = Math.abs(pose.speed), sd = face * Math.sign(pose.speed);
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.6 * sp;
    const bx = mx - sd * (9 * U + 6);
    for (const gy of [0.8, 2, 3.2]) line(bx, oy + gy * V, bx - sd * 26 * sp, oy + gy * V, 0.8, 1);
    ctx.restore();
  }
  if (pose.fallLines) { // streaks above, as if dropping fast
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.55 * pose.fallLines;
    for (const [gx, l] of [[5, 22], [9, 32], [13, 18]]) line(ox + gx * U, oy - 8, ox + gx * U, oy - 8 - l * pose.fallLines, 0.8, 1);
    ctx.restore();
  }

  if (pose.aura) drawAura(mx, my, 7.5 * U, 2.5 * V, bottom + (pose.y || 0), pose.aura);

  ctx.save();
  ctx.translate(mx, my); ctx.rotate((pose.rot || 0) * face); ctx.translate(-mx, -my);
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  // legs (behind the body)
  [4, 6, 11, 13].forEach((lx, i) => {
    const [dx, dy] = pose.legs?.[face > 0 ? i : 3 - i] || [0, 0], fx = dx * face;
    const leg = [at(lx, 3.8), at(lx + 1, 3.8), [at(lx + 1, 5)[0] + fx, at(0, 5)[1] + dy], [at(lx, 5)[0] + fx, at(0, 5)[1] + dy]];
    ctx.fillStyle = CLAWD; path(leg); ctx.fill();
    ctx.lineWidth = 2; poly(leg, 0.8);
  });

  // body + arm nubs as one silhouette
  const body = [at(3, 0), at(15, 0), at(15, 2, ar), at(17, 2, ar, rr), at(17, 3, ar, rr), at(15, 3, ar), at(15, 4), at(3, 4),
                at(3, 3, al), at(1, 3, al, rl), at(1, 2, al, rl), at(3, 2, al)];
  ctx.save(); ctx.translate(j(2.5), j(2.5)); // marker wash, slightly off-register
  ctx.fillStyle = CLAWD; ctx.globalAlpha = 0.92; path(body); ctx.fill();
  ctx.restore();
  hatch([at(3, 3.2), at(15, 3.2), at(15, 4), at(3, 4)], 6, 0.3); // belly shade
  ctx.lineWidth = 2.6; poly(body, 1.2);

  // eyes: tall pixel blocks, nudged toward facing, squash to a line on blink; squint = squeezed shut as > <
  const eh = V * (1 - 0.85 * (pose.blink || 0)), shift = face * U * 0.35;
  ctx.fillStyle = INK; ctx.lineWidth = 2.6;
  for (const [i, ex] of [5, 12].entries()) {
    const [x, y] = at(ex, 1, pose.eyeY || 0);
    if (pose.dizzy) { // spiral eyes, the two winding opposite ways
      const ecx = x + U / 2 + shift, ecy = y + V / 2, R = Math.min(U, V / 2) * 1.05, sp = (i ? -1 : 1);
      ctx.lineWidth = 1.6; ctx.beginPath();
      for (let a = 0; a <= 4 * Math.PI; a += 0.35) { const r = R * a / (4 * Math.PI), q = sp * (a + pose.dizzy * 6.28); ctx.lineTo(ecx + Math.cos(q) * r, ecy + Math.sin(q) * r); }
      ctx.stroke();
    }
    else if (pose.squint) {
      const px = x + U / 2 + shift, d = (i ? -1 : 1) * U * 0.8; // left eye points right, right eye points left
      line(px - d, y + V * 0.1, px + d, y + V / 2, 0.4, 1); line(px + d, y + V / 2, px - d, y + V * 0.9, 0.4, 1);
    } else ctx.fillRect(x + shift + j(0.6), y + (V - eh) / 2 + j(0.6), U, eh);
  }
  if (pose.spark) drawSpark(mx + face * pose.spark[0], bottom + (pose.y || 0) + pose.spark[1], SPARK_R, face * pose.spark[2]);
  if (pose.shield > 0.05) drawTerminal(mx, oy - 14 * pose.shield, pose.shield, pose.wear || 0); // held low over its head like a roof, overlapping the top of the body
  ctx.restore();

  if (pose.shatter != null) { // terminal shards burst up and out from where it was held, tumble and fade
    const t = pose.shatter; ctx.save(); ctx.globalAlpha *= 1 - t; ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
    for (const [dx, dy, vx, vy, r] of SHARDS) {
      const px = mx + dx + vx * t, py = oy - 14 + dy - vy * t + 140 * t * t, a = r * (1 + 6 * t);
      const pts = [[-5, -3], [4, -4], [5, 3], [-3, 4]].map(([u, v]) => [px + u * Math.cos(a) - v * Math.sin(a), py + u * Math.sin(a) + v * Math.cos(a)]);
      path(pts); ctx.fill(); poly(pts, 0.5);
    }
    ctx.restore();
  }
  if (pose.oops > 0) drawOops(mx, oy - 34, pose.oops, OOPS[pose.oopsMsg || 0]);
  if (pose.dizzy) { // three little stars circling over its head (the ones behind drawn smaller and fainter)
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.fillStyle = '#f2c94c';
    for (let k = 0; k < 3; k++) {
      const a = (pose.dizzy + k / 3) * 6.28, depth = 0.75 + 0.25 * Math.sin(a);
      ctx.globalAlpha = 0.55 + 0.45 * depth;
      drawStar(mx + Math.cos(a) * 7 * U, oy - 10 + Math.sin(a) * 0.6 * V, 5.5 * depth);
    }
    ctx.restore();
  }

  if (pose.effort != null) { // charging: strokes bristle off the top of the body, longer the harder it thinks
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.globalAlpha *= 0.45 + 0.4 * pose.effort;
    const rx = 9 * U + 8, ry = 2.5 * V + 8, l = 5 + 12 * pose.effort;
    for (let k = 0; k < 8; k++) {
      const a = Math.PI * (1 + (k + 0.5) / 8) + j(0.15), c = Math.cos(a), s = Math.sin(a);
      line(mx + c * rx, my + s * ry, mx + c * (rx + l), my + s * (ry + l), 0.5, 1);
    }
    if (pose.burst != null) { // tier-up: a ring in the new tier's colour flies off and fades
      ctx.strokeStyle = auraColor(pose.aura); ctx.lineWidth = 3; ctx.globalAlpha = 1 - pose.burst;
      const k = 1.2 + pose.burst; ellipse(mx, my, 7.5 * U * k, (2.5 * V + 6) * k, 1);
    }
    ctx.restore();
    drawEffort(cx, oy - 46, pose.effort, pose.aura || 0);
  }
}

// effort aura, drawn behind Claw'd: a soft glow, one dashed hand-drawn halo per tier reached (cut off at the feet, breathing in
// and out, dashes circling), and little Claude sparks drifting up. Orange (medium), gold (high), rainbow (ultrathink)
const auraHue = l => l >= 3 ? -performance.now() / 4 % 360 : [0, 15, 44][l];
const auraColor = (l, a = 1) => `hsla(${auraHue(l)}, 80%, 58%, ${a})`;
function drawAura(x, y, rx, ry, floor, tier) {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.beginPath(); ctx.rect(x - 400, floor - 400, 800, 400); ctx.clip(); // nothing below the feet

  const R = rx + 10 + 8 * tier, g = ctx.createRadialGradient(0, 0, 0, 0, 0, R); // glow, pulsing gently
  g.addColorStop(0, auraColor(tier, 0.35 + 0.05 * Math.sin(t * 4))); g.addColorStop(1, auraColor(tier, 0));
  ctx.save(); ctx.translate(x, y); ctx.scale(1, (ry + 18) / R); ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.28); ctx.fill(); ctx.restore();

  ctx.lineWidth = 2.4; ctx.setLineDash([14, 7]);
  for (let l = 1; l <= tier; l++) { // one hand-drawn halo per tier, dashes slowly circling (alternate rings turn opposite ways)
    const k = 1.15 + 0.22 * l + 0.02 * Math.sin(t * 4 + l * 2);
    if (l >= 3) { // ultrathink halo shimmers through the rainbow like the bar
      const rg = ctx.createLinearGradient(x - rx * k, 0, x + rx * k, 0);
      for (let c = 0; c <= 6; c++) rg.addColorStop(c / 6, `hsl(${c * 60 + auraHue(3)}, 85%, 58%)`);
      ctx.strokeStyle = rg;
    } else ctx.strokeStyle = auraColor(l, 0.9);
    ctx.lineDashOffset = (l % 2 ? -1 : 1) * t * 30;
    ellipse(x, y, rx * k, (ry + 6) * k, 0.8);
  }
  ctx.setLineDash([]);

  for (let k = 0; k < 3 * tier; k++) { // rising sparks, more per tier, fading in and out on the way up
    const ph = (t * 0.55 + k * 0.618) % 1, side = k % 2 ? 1 : -1, spread = 0.2 + (k * 0.37 % 1) * 0.9;
    ctx.globalAlpha = Math.sin(ph * Math.PI);
    drawSpark(x + side * rx * spread + 4 * Math.sin(t * 3 + k), floor - ph * (2 * ry + 50), 4 + tier * 0.6, t * 2 + k);
  }
  ctx.restore();
}

// neutral special's effort meter: a sketched bar filling low → medium → high, then a shimmering rainbow "ultrathink"
function drawEffort(x, y, e, tier) {
  const w = 84, h = 10, full = tier >= 3, hue = performance.now() / 4 % 360, x0 = x - w / 2;
  ctx.save();
  if (full) {
    const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
    for (let k = 0; k <= 6; k++) g.addColorStop(k / 6, `hsl(${k * 60 - hue}, 80%, 55%)`);
    ctx.fillStyle = g;
  } else ctx.fillStyle = CLAWD;
  ctx.fillRect(x0, y, w * e, h);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; poly([[x0, y], [x0 + w, y], [x0 + w, y + h], [x0, y + h]], 0.6);
  ctx.lineWidth = 1.2; for (const k of [1, 2]) line(x0 + w * k / 3, y, x0 + w * k / 3, y + h, 0.4, 1);
  const label = ['low', 'medium', 'high', 'ultrathink'][tier];
  ctx.font = '700 22px Caveat, cursive'; ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.fillStyle = INK;
  let lx = x - ctx.measureText(label).width / 2;
  for (const [i, c] of [...label].entries()) { // letter by letter so each one can take its own hue
    if (full) { ctx.strokeText(c, lx, y - 6); ctx.fillStyle = `hsl(${i * 36 - hue}, 85%, 60%)`; }
    ctx.fillText(c, lx, y - 6); lx += ctx.measureText(c).width;
  }
  ctx.restore();
}

// dust clouds, drawn at the floor under Claw'd rather than at the body (which may be in the air)
function drawClawdFx(cx, floor, pose = {}, face = 1) {
  if (pose.dust != null) drawDust(cx - face * 34, floor, pose.dust, -face);
  if (pose.dustAhead != null) drawDust(cx + face * 34, floor, pose.dustAhead, face);
  if (pose.puff != null) { drawDust(cx - 26, floor, pose.puff, -1); drawDust(cx + 26, floor, pose.puff, 1); }
}

// the part of Claw'd that can be hit (body + legs; arm nubs left out), relative to bottom-center like move hitboxes
function clawdHurtbox(pose = {}, face = 1) {
  const w = 12 * CU * (pose.sx ?? 1), h = 5 * CV * (pose.sy ?? 1);
  return { x: (pose.x || 0) * face - w / 2, y: (pose.y || 0) - h, w, h };
}

// a little terminal window used as a shield: dark screen, title-bar dots, a couple of output lines, orange prompt + blinking cursor
// cracks on the screen, as [wear it starts at, polyline in 0…1 of the screen]; each one runs in from an edge as wear grows
const CRACKS = [
  [0.2, [[0.62, 0], [0.58, 0.25], [0.66, 0.42], [0.6, 0.62]]], [0.25, [[0.58, 0.25], [0.47, 0.33]]],
  [0.4, [[1, 0.55], [0.84, 0.5], [0.78, 0.66], [0.69, 0.7]]],
  [0.6, [[0, 0.3], [0.14, 0.38], [0.22, 0.3], [0.34, 0.46], [0.3, 0.6]]],
  [0.8, [[0.4, 1], [0.45, 0.82], [0.38, 0.7], [0.5, 0.55]]], [0.85, [[0.45, 0.82], [0.58, 0.9]]],
];
function drawTerminal(cx, cy, k, wear = 0) {
  const w = 86 * k, h = 44 * k, x = cx - w / 2, y = cy - h / 2, box = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  ctx.save();
  ctx.globalAlpha *= 1 - 0.6 * wear; // fades toward see-through as it wears down
  ctx.fillStyle = INK; path(box); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; poly(box, 1);
  ctx.strokeStyle = PAPER; ctx.globalAlpha *= 0.45; ctx.lineWidth = 1; line(x + 3, y + 9 * k, x + w - 3, y + 9 * k, 0.4, 1); // title bar
  ctx.fillStyle = PAPER;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + (6 + i * 6) * k, y + 4.8 * k, 1.5 * k, 0, 6.28); ctx.fill(); }
  ctx.lineWidth = 1.6 * k; line(x + 6 * k, y + 17 * k, x + 52 * k, y + 17 * k, 0.4, 1); line(x + 6 * k, y + 24 * k, x + 34 * k, y + 24 * k, 0.4, 1); // output
  ctx.globalAlpha /= 0.45; ctx.fillStyle = CLAWD; ctx.font = `700 ${12 * k}px ui-monospace, Menlo, monospace`;
  ctx.fillText('>', x + 5 * k, y + 38 * k);
  if (Math.floor(performance.now() / 450) % 2) ctx.fillRect(x + 15 * k, y + 29 * k, 6 * k, 10 * k); // cursor
  ctx.strokeStyle = PAPER; ctx.lineWidth = 1.3 * k;
  for (const [from, pts] of CRACKS) {
    let n = Math.min(1, Math.max(0, (wear - from) / 0.15)) * (pts.length - 1); // segments drawn so far
    for (let i = 0; i < pts.length - 1 && n > 0; i++, n--) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], u = Math.min(1, n);
      line(x + ax * w, y + ay * h, x + (ax + (bx - ax) * u) * w, y + (ay + (by - ay) * u) * h, 0.3, 1);
    }
  }
  ctx.restore();
}

// terminal shards: [dx, dy from the terminal's centre, vx, vy (px over the burst, up = +), starting angle]
const SHARDS = [[-30, -6, -60, 40, 0.3], [-14, 4, -34, 70, 1.2], [0, -8, -6, 90, 2.1], [14, 2, 30, 74, 0.7], [30, -4, 62, 44, 2.6], [-22, 10, -48, 20, 1.9], [22, 10, 50, 26, 0.2]];
// a sketched five-point star, marker-filled
function drawStar(x, y, r) {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; return [x + Math.cos(a) * q, y + Math.sin(a) * q]; });
  path(pts); ctx.fill(); poly(pts, 0.4);
}

// error toasts for a broken shield, Claude Code style: [headline, detail]
const OOPS = [['context window full', '100% used · try /compact'], ['out of credits', '$0.00 left · please top up']];
// a small sketched error toast floating over its head: paper card, red accent bar, headline + detail; a = 0 … 1 fades / rises in
function drawOops(cx, y, a, [head, sub]) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.font = '700 9px ui-monospace, Menlo, monospace'; const w1 = ctx.measureText('✗ ' + head).width;
  ctx.font = '7px ui-monospace, Menlo, monospace'; const w2 = ctx.measureText(sub).width;
  const w = Math.max(w1, w2) + 16, h = 27, x = cx - w / 2, top = y - h - 4 * (1 - a), box = [[x, top], [x + w, top], [x + w, top + h], [x, top + h]];
  ctx.fillStyle = PAPER; path(box); ctx.fill();
  ctx.fillStyle = BOX; ctx.fillRect(x + 2, top + 3, 3, h - 6); // red accent
  ctx.strokeStyle = INK; ctx.lineWidth = 1.8; poly(box, 0.7);
  line(cx - 4, top + h, cx, top + h + 6, 0.4, 1); line(cx, top + h + 6, cx + 4, top + h, 0.4, 1); // little tail pointing down at Claw'd
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = BOX; ctx.font = '700 9px ui-monospace, Menlo, monospace'; ctx.fillText('✗ ' + head, x + 9, top + 12);
  ctx.fillStyle = INK; ctx.globalAlpha *= 0.7; ctx.font = '7px ui-monospace, Menlo, monospace'; ctx.fillText(sub, x + 9, top + 22);
  ctx.restore();
}
