// Grok: a plain white ball with two slanted pill eyes up near its front, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = roll forward) · blink 0 (open) … 1 (shut)
//   squint = eyes narrowed to flat slanted slits (putting its weight into a hit)
//   car = 0 … 1 size of the Cybertruck Grok rides in, peeking out of the side window (0 = none) · wheel = its wheels' spin, radians
//         empty = nobody at the wheel (Grok jumped out)
//         (in the car, rot tips the whole truck: - = nose up round the back wheel, + = nose down round the front)
//   note = [dx, dy, tilt, typed 0 … 1, size 0 … 1] a community note card, centred dx, dy from bottom-centre (forward smash)
//   posts = [t, a] a fountain of little X posts streaming up out of its top: t = frames in, a = 0 … 1 how thick (up smash)
//   sink = px the ball is sunk into the floor (drawn cut off at it) · debris = 0 … 1 chunks of floor bursting out both ways
//   mound = frames underground: only a dirt mound with a drill bit poking out the front shows · moving = the mound is on the move
//   gen = 0 … 1 a Grok Imagine progress card overhead (neutral special charge)
//   ship = [size 0 … 1, flame 0 … 1] inside a little Starship, face at the porthole (the ball isn't drawn) · empty = nobody in it
//   boom = 0 … 1 it blowing up · tilt = radians the ship leans off upright, round its middle (+ = clockwise, whichever way it faces)
//   aimLine = 0 … 1 a dotted line off the nose showing where it'll launch (charging)
//   beam = 0 … 2 how wide a tractor beam out of its eyes is (0 = off), reaching beamTo = [dx, dy] from bottom-centre (grabs)
//   repost / blocked / hearts = [t 0 … 1, dx, dy] throw effects centred dx, dy from bottom-centre: a green repost arrow circling,
//   a block sign stamped on, hearts and a likes count shooting up
//   glow = 0 … 1 eyes lit Neuralink blue (down special)
const GROK = '#fbf9f4';
const GR_R = 28; // body radius; it sits on the floor
const GR_EYES = [[0.22, -0.4], [0.65, -0.48]]; // eye centres in body radii, back then front

function drawGrok(cx, bottom, pose = {}, face = 1) {
  if (pose.tilt) { // lean the whole thing (ball and ship) round the ship's middle
    const px = cx + (pose.x || 0) * face, py = bottom + (pose.y || 0) - (pose.ship ? SHIP_H / 2 : GR_R);
    ctx.save(); ctx.translate(px, py); ctx.rotate(pose.tilt); ctx.translate(-px, -py);
    drawGrok(cx, bottom, { ...pose, tilt: 0 }, face); ctx.restore(); return;
  }
  if (pose.blast) return pose.blastDraw(cx + (pose.x || 0) * face, bottom + (pose.y || 0) - GR_R, ...pose.blast); // KO'd: only the burst is left
  if (pose.mound != null) return drawMound(cx, bottom, pose.mound, pose.moving, face);
  const bx = cx + (pose.x || 0) * face, by = bottom + (pose.y || 0);
  if (pose.posts) drawPosts(bx, by - 2 * GR_R * (pose.sy ?? 1), ...pose.posts);
  ctx.save();
  if (pose.sink) { ctx.beginPath(); ctx.rect(cx - 400, bottom - 800, 800, 800); ctx.clip(); } // the floor hides what's sunk into it
  ctx.translate(bx, by + (pose.sink || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  if (pose.car) { drawCybertruck(pose); ctx.restore(); return; }
  if (pose.ship) { drawStarship(pose.ship[0], pose.ship[1], pose); if (pose.aimLine) drawAimLine(pose.aimLine); ctx.restore(); return; }
  ctx.translate(0, -GR_R); ctx.rotate(pose.rot || 0); // from here on, the origin is the body centre
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  ctx.save(); ctx.translate(j(1), j(1)); // marker wash, slightly off-register
  ctx.fillStyle = GROK; ctx.beginPath(); ctx.arc(0, 0, GR_R, 0, 6.28); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2.6; ellipse(0, 0, GR_R, GR_R, 0.4);

  // eyes: pills leaning back at the top; blink shortens them, squint thins them and tips them toward flat
  const sq = pose.squint ? 1 : 0, l = GR_R * 0.44 * (1 - 0.8 * (pose.blink || 0)), w = GR_R * 0.2 * (1 - 0.45 * sq);
  const glow = pose.glow || 0;
  for (const [ex, ey] of GR_EYES) {
    ctx.save(); ctx.translate(ex * GR_R + j(0.4), ey * GR_R + j(0.4)); ctx.rotate(-0.42 - 0.75 * sq);
    if (glow) { ctx.fillStyle = `rgba(62,197,255,${0.3 * glow})`; ctx.beginPath(); ctx.ellipse(0, 0, w * 1.6, l * 0.8, 0, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = glow > 0.5 ? '#3ec5ff' : INK; ctx.beginPath(); ctx.roundRect(-w / 2, -l / 2, w, l, w / 2); ctx.fill();
    if (glow > 0.5) { ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
  if (pose.debris != null) drawDebris(cx, bottom, pose.debris);
  if (pose.gen != null) drawImagining(bx, by - 2 * GR_R * (pose.sy ?? 1) - 26, pose.gen);
  if (pose.boom != null) drawBoom(bx, by - GR_R, pose.boom);
  if (pose.beam && pose.beamTo) drawBeam(bx + face * 0.65 * GR_R * (pose.sx ?? 1), by - 1.48 * GR_R * (pose.sy ?? 1), cx + face * pose.beamTo[0], bottom + pose.beamTo[1], pose.beam);
  if (pose.repost) drawRepost(cx + face * pose.repost[1], bottom + pose.repost[2], pose.repost[0], face);
  if (pose.blocked) drawBlocked(cx + face * pose.blocked[1], bottom + pose.blocked[2], pose.blocked[0]);
  if (pose.hearts) drawHearts(cx + face * pose.hearts[1], bottom + pose.hearts[2], pose.hearts[0]);
  if (pose.note) { const [dx, dy, tilt, typed, size] = pose.note; drawNote(cx + dx * face, bottom + dy, tilt * face, typed, size); }
}

// a community note: a paper card with a blue "i", the header, and scribbled lines of text typing in (typed 0 … 1)
function drawNote(x, y, tilt = 0, typed = 1, size = 1, a = 1) {
  if (size <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(size, size); ctx.globalAlpha *= a;
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  rbox(0, 0, 88, 44, 5, '#fdfbf5', 2);
  ctx.fillStyle = '#1d9bf0'; ctx.beginPath(); ctx.arc(-34, -11, 6, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(-35, -12, 2, 5); ctx.fillRect(-35, -15, 2, 2); // the i
  ctx.fillStyle = INK; ctx.font = '700 12px Caveat, cursive'; ctx.textBaseline = 'middle'; ctx.fillText('Readers added context', -25, -11);
  ctx.lineWidth = 1.6; ctx.globalAlpha *= 0.7;
  for (const [k, ly, len] of [[0, 3, 70], [1, 13, 48]]) { // two lines of "text", written left to right
    const l = len * Math.min(1, Math.max(0, typed * 2 - k));
    if (l > 1) line(-37, ly, -37 + l, ly, 0.6, 1);
  }
  ctx.restore();
}
// the note left stuck on whoever it hit, tipped with them
function drawStuckNote(x, y, rot, a) { drawNote(x, y, rot + 0.25, 1, 0.42, a); }

// X posts streaming up in a wobbly column from x, y: little cards with an X, rising over 40 frames and fading out at the top
function drawPosts(x, y, t, a) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  for (let i = 0; i < 7; i++) {
    const u = (t / 40 + i / 7) % 1, h = 130 * u, px = x + 12 * Math.sin(u * 9 + i * 2.3), py = y - h;
    ctx.globalAlpha = a * Math.min(1, u * 8, (1 - u) * 4);
    ctx.save(); ctx.translate(px, py); ctx.rotate(0.3 * Math.sin(u * 7 + i));
    rbox(0, 0, 20, 14, 3, '#fdfbf5', 1.6);
    ctx.lineWidth = 1.8; line(-6, -3, -1, 3, 0.3, 1); line(-6, 3, -1, -3, 0.3, 1); // the X
    ctx.lineWidth = 1; line(2, -2, 7, -2, 0.3, 1); line(2, 2, 6, 2, 0.3, 1);
    ctx.restore();
  }
  ctx.restore();
}

// chunks of floor thrown out both ways and up, falling back (t 0 … 1)
function drawDebris(x, y, t) {
  ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = '#b8a07a'; ctx.lineWidth = 1.4; ctx.globalAlpha = Math.min(1, (1 - t) * 3);
  for (const [vx, vy, r] of [[-70, -110, 5], [-40, -150, 4], [-95, -70, 3.5], [60, -130, 5], [90, -90, 4], [35, -160, 3]]) {
    const px = x + vx * t, py = y + vy * t + 170 * t * t;
    ctx.beginPath(); ctx.moveTo(px - r, py); ctx.lineTo(px, py - r); ctx.lineTo(px + r, py + r * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// tunnelling: a hump of dirt on the floor, a drill bit spinning out of its front, pebbles jumping off it while it moves
function drawMound(cx, bottom, f, moving, face) {
  ctx.save(); ctx.translate(cx, bottom); ctx.scale(face, 1);
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  const bob = moving ? Math.abs(Math.sin(f * 0.6)) * 2 : 0;
  ctx.fillStyle = '#b8a07a'; ctx.beginPath(); ctx.ellipse(0, 0, 36, 17 + bob, 0, Math.PI, 0); ctx.fill();
  ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(j(0.5), 0, 36, 17 + bob, 0, Math.PI, 0); ctx.stroke();
  ctx.lineWidth = 1; ctx.globalAlpha = 0.5; for (const [px, py] of [[-18, -5], [-3, -11], [12, -4]]) line(px, py, px + 4, py - 1, 0.4, 1);
  ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(29, -9); ctx.rotate(-0.35); // the drill bit: a cone with a spiral that turns
  ctx.fillStyle = '#9aa0a4'; path([[0, -6], [16, 0], [0, 6]]); ctx.fill(); ctx.lineWidth = 1.8; poly([[0, -6], [16, 0], [0, 6]], 0.3);
  ctx.lineWidth = 1.1; for (let k = 0; k < 3; k++) { const u = ((moving ? f * 0.25 : 0) + k / 3) % 1; line(u * 14, -6 * (1 - u), u * 14 + 3, 6 * (1 - u - 0.2), 0.2, 1); }
  ctx.restore();
  if (moving) for (let k = 0; k < 3; k++) { // pebbles hopping off the back
    const u = (f / 14 + k / 3) % 1, px = -28 - 16 * u, py = -10 - 22 * u + 30 * u * u;
    ctx.fillStyle = '#8a7556'; ctx.beginPath(); ctx.arc(px, py, 2.2, 0, 6.28); ctx.fill();
  }
  ctx.restore();
}

// the ball's box, like clawdHurtbox (bottom-centre, facing right)
function grokHurtbox(pose = {}, face = 1) {
  const w = 2 * GR_R * (pose.sx ?? 1), h = 2 * GR_R * (pose.sy ?? 1);
  return { x: (pose.x || 0) * face - w / 2, y: (pose.y || 0) - h, w, h };
}

// the side special's ride: a Cybertruck side on, one wedge of brushed steel, Grok peeking out of the triangular side window.
// Drawn from the floor under its middle, facing right, px
const CT_BODY = [[-62, -13], [-62, -31], [-2, -52], [62, -31], [62, -19], [55, -13]];
const CT_WINDOW = [[-42, -29], [-5, -47], [44, -29]];
function drawCybertruck(pose) {
  const k = pose.car, a = pose.rot || 0, px = a < 0 ? -36 : 38; // pivots on the back wheel popping a wheelie, the front one braking
  ctx.scale(k, k); ctx.translate(px, -11); ctx.rotate(a); ctx.translate(-px, 11);
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  ctx.save(); ctx.translate(j(1), j(1)); ctx.fillStyle = '#d3d6d8'; path(CT_BODY); ctx.fill(); ctx.restore();
  hatch([[-62, -24], [62, -24], [62, -13], [-62, -13]], 9, 0.25); // lower panels
  ctx.lineWidth = 2.6; poly(CT_BODY, 1);

  ctx.fillStyle = '#3a4047'; path(CT_WINDOW); ctx.fill(); // glass, with Grok sat behind it
  ctx.save(); path(CT_WINDOW); ctx.clip();
  if (!pose.empty) { ctx.translate(-2, -14); ctx.scale(0.56, 0.56); drawGrok(0, 0, { blink: pose.blink, squint: pose.squint }); }
  ctx.restore();
  ctx.lineWidth = 2; poly(CT_WINDOW, 0.8);
  ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; line(4, -41, 16, -35, 0.4, 1); ctx.restore(); // glint

  ctx.lineWidth = 3; ctx.strokeStyle = '#f4ecc0'; line(50, -34, 61, -31, 0.4, 1); // light bar
  ctx.strokeStyle = '#d0412c'; line(-61, -31, -52, -34.5, 0.4, 1); // tail light
  ctx.strokeStyle = INK;
  for (const wx of [-36, 38]) { // wheels: tyre, hub, spokes turning with pose.wheel
    ctx.fillStyle = '#3b3733'; ctx.beginPath(); ctx.arc(wx, -11, 11, 0, 6.28); ctx.fill(); ctx.lineWidth = 2; ellipse(wx, -11, 11, 11, 0.5);
    ctx.fillStyle = '#9aa0a4'; ctx.beginPath(); ctx.arc(wx, -11, 5, 0, 6.28); ctx.fill();
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) { const t = (pose.wheel || 0) + i * 2.09; ctx.beginPath(); ctx.moveTo(wx, -11); ctx.lineTo(wx + 5 * Math.cos(t), -11 + 5 * Math.sin(t)); ctx.stroke(); }
  }
}

// Grok Imagine at work: a little card with a progress bar and the percentage, a sparkle beside it
function drawImagining(x, y, g) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  rbox(0, 0, 70, 26, 5, '#fdfbf5', 1.8);
  ctx.fillStyle = INK; ctx.font = '700 11px Caveat, cursive'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText('imagining… ' + Math.round(g * 100) + '%', -30, -5);
  ctx.fillStyle = '#e3d9c6'; ctx.fillRect(-29, 4, 58, 5);
  ctx.fillStyle = g >= 1 ? '#5bb46a' : '#1d9bf0'; ctx.fillRect(-29, 4, 58 * g, 5);
  ctx.lineWidth = 1.2; ctx.strokeRect(-29, 4, 58, 5);
  const tw = 1 + 0.3 * Math.sin(performance.now() / 90); // sparkle
  ctx.fillStyle = '#f4c542'; ctx.beginPath(); ctx.moveTo(42, -10 - 6 * tw); ctx.lineTo(44, -12); ctx.lineTo(42 + 6 * tw, -10); ctx.lineTo(44, -8); ctx.lineTo(42, -10 + 6 * tw); ctx.lineTo(40, -8); ctx.lineTo(42 - 6 * tw, -10); ctx.lineTo(40, -12); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// a generated image flung as a projectile: a polaroid, tumbling, with one of a few AI slips on it (pic 0 … 2)
function drawImagined(x, y, r, t, dir = 1, pic = 0) {
  const w = r * 2.1, h = r * 2.5, s = r * 1.7; // frame and picture
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir * (0.25 * Math.sin(t * 14) + t * 3)); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  rbox(0, 0, w, h, 2, '#fdfbf5', 1.8);
  ctx.fillStyle = ['#cfe6f5', '#fbe3a8', '#e8d6f0'][pic]; ctx.fillRect(-s / 2, -h / 2 + (w - s) / 2, s, s);
  ctx.translate(0, -h / 2 + (w - s) / 2 + s / 2); ctx.lineWidth = 1.4; const k = s / 30;
  if (pic === 0) { // a hand with six fingers
    ctx.fillStyle = '#f2c8a0'; ctx.beginPath(); ctx.ellipse(0, 5 * k, 7 * k, 6 * k, 0, 0, 6.28); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.42; line(Math.cos(a) * 6 * k, 5 * k + Math.sin(a) * 6 * k, Math.cos(a) * 13 * k, 5 * k + Math.sin(a) * 13 * k, 0.3, 1); }
  } else if (pic === 1) { // a smiling sun with three eyes
    ctx.fillStyle = '#f4c542'; ctx.beginPath(); ctx.arc(0, 0, 8 * k, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; for (const ex of [-4, 0, 4]) { ctx.beginPath(); ctx.arc(ex * k, -2 * k, 1.1 * k, 0, 6.28); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 1 * k, 4 * k, 0.3, Math.PI - 0.3); ctx.stroke();
  } else { // a clock melting off its own edge
    ctx.fillStyle = '#fdfbf5'; ctx.beginPath(); ctx.moveTo(-9 * k, -4 * k); ctx.quadraticCurveTo(0, -12 * k, 9 * k, -4 * k); ctx.quadraticCurveTo(10 * k, 6 * k, 3 * k, 12 * k); ctx.quadraticCurveTo(-2 * k, 5 * k, -9 * k, 4 * k); ctx.closePath(); ctx.fill(); ctx.stroke();
    line(0, -2 * k, 0, -7 * k, 0.2, 1); line(0, -2 * k, 4 * k, 1 * k, 0.2, 1);
  }
  ctx.restore();
}

// Starship with Grok inside: a steel tube stood on its engines, nose cone on top, flaps and fins, and a porthole Grok looks out of
// (pose.empty: dark glass). Drawn from the floor under its middle, facing right; k = size (pops in from the floor), flame 0 … 1
const SHIP_H = 102;
function drawStarship(k, flame, pose = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.scale(k, k); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  if (flame > 0) { // out of the engines, flickering
    const l = (16 + 40 * flame) * (1 + 0.15 * Math.sin(performance.now() / 30));
    ctx.fillStyle = '#f49b3a'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(-8, l * 0.6, 0, l); ctx.quadraticCurveTo(8, l * 0.6, 11, 0); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = '#ffe07a'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(0, l * 0.7, 6, 0); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#6d6a66'; for (const ex of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(ex - 3, -5); ctx.lineTo(ex + 3, -5); ctx.lineTo(ex + 4, 0); ctx.lineTo(ex - 4, 0); ctx.closePath(); ctx.fill(); } // engines
  const fins = [[[-15, -24], [-25, -5], [-15, -5]], [[15, -24], [25, -5], [15, -5]], [[-15, -86], [-22, -82], [-22, -72], [-15, -70]], [[15, -86], [22, -82], [22, -72], [15, -70]]];
  for (const f of fins) { ctx.fillStyle = '#b9bcbf'; path(f); ctx.fill(); ctx.lineWidth = 1.8; poly(f, 0.4); }
  const hull = () => { ctx.beginPath(); ctx.moveTo(-15, -5); ctx.lineTo(-15, -82); ctx.quadraticCurveTo(-15, -100, 0, -SHIP_H); ctx.quadraticCurveTo(15, -100, 15, -82); ctx.lineTo(15, -5); ctx.closePath(); };
  ctx.save(); ctx.translate(j(0.8), j(0.8)); ctx.fillStyle = '#d3d6d8'; hull(); ctx.fill(); ctx.restore();
  ctx.lineWidth = 2.4; ctx.save(); ctx.translate(j(0.4), j(0.4)); hull(); ctx.stroke(); ctx.restore();
  ctx.lineWidth = 1; ctx.globalAlpha = 0.4; line(-15, -30, 15, -30, 0.4, 1); line(-15, -44, 15, -44, 0.4, 1); line(6, -8, 6, -42, 0.4, 1); ctx.globalAlpha = 1; // panel seams

  // the porthole, Grok looking out of it
  const wx = 2, wy = -64, wr = 13;
  ctx.fillStyle = '#3a4047'; ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 6.28); ctx.fill();
  if (!pose.empty) { ctx.save(); ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 6.28); ctx.clip(); ctx.translate(wx - 3, wy + 13); ctx.scale(0.5, 0.5); drawGrok(0, 0, { blink: pose.blink, squint: pose.squint }); ctx.restore(); }
  ctx.fillStyle = '#b9bcbf'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 6.28); ctx.stroke(); // rim
  ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(wx, wy, wr - 4, -2.4, -1.6); ctx.stroke(); ctx.restore(); // glint
  ctx.restore();
}

// the launch line: dashes running up off the nose, longer and darker the more it's charged
function drawAimLine(a) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.globalAlpha = 0.25 + 0.45 * a; ctx.setLineDash([5, 7]); ctx.lineDashOffset = -performance.now() / 40;
  ctx.beginPath(); ctx.moveTo(0, -SHIP_H - 8); ctx.lineTo(0, -SHIP_H - 8 - (30 + 70 * a)); ctx.stroke();
  ctx.restore();
}

// rapid unscheduled disassembly: a jagged burst, orange over yellow, with bits of steel flying off (t 0 … 1)
function drawBoom(x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round'; ctx.globalAlpha = Math.min(1, (1 - t) * 2.5);
  const star = (r, n) => Array.from({ length: n * 2 }, (_, i) => { const a = i / n * Math.PI + t, rr = i % 2 ? r * 0.55 : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; });
  const r = 26 + 40 * Math.sqrt(t);
  ctx.fillStyle = '#f49b3a'; path(star(r, 9)); ctx.fill(); ctx.lineWidth = 2.2; poly(star(r, 9), 1);
  ctx.fillStyle = '#ffe07a'; path(star(r * 0.55, 7)); ctx.fill();
  ctx.fillStyle = '#b9bcbf'; ctx.lineWidth = 1.4;
  for (const [vx, vy, sp] of [[-1, -0.6, 3], [1, -0.8, -4], [-0.4, -1, 5], [0.7, 0.4, -2], [-0.8, 0.5, 3]]) {
    ctx.save(); ctx.translate(vx * 80 * t, vy * 80 * t + 60 * t * t); ctx.rotate(sp * t); ctx.fillRect(-5, -3, 10, 6); ctx.strokeRect(-5, -3, 10, 6); ctx.restore();
  }
  ctx.restore();
}

// a Neuralink chip: a dark square with gold pins and a blinking blue light. drawChipShot flies; drawChip sits on whoever it's in
function drawChipAt(x, y, k, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.strokeStyle = INK; ctx.lineCap = 'round';
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.4; for (const d of [-3, 0, 3]) { line(d, -7, d, -9, 0, 1); line(d, 7, d, 9, 0, 1); line(-7, d, -9, d, 0, 1); line(7, d, 9, d, 0, 1); }
  ctx.strokeStyle = INK; rbox(0, 0, 14, 14, 3, '#2f3237', 1.6);
  if (Math.floor(performance.now() / 300) % 2) { ctx.fillStyle = '#3ec5ff'; ctx.beginPath(); ctx.arc(3, -3, 2.2, 0, 6.28); ctx.fill(); }
  ctx.restore();
}
function drawChipShot(x, y, r, t, dir) {
  ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2;
  for (const dy of [-4, 0, 4]) line(x - dir * 10, y + dy, x - dir * 26, y + dy, 0.4, 1);
  ctx.restore();
  drawChipAt(x, y, r / 7, t * 20 * dir);
}
function drawChip(x, y, rot, a) { ctx.save(); ctx.globalAlpha *= a; drawChipAt(x, y - 16, 0.8, rot); ctx.restore(); }
// the zap going off in a chipped target: blue bolts crackling out of where the chip was (a = 1 → 0 as it fades)
function drawZap(x, y, rot, a) {
  ctx.save(); ctx.translate(x, y - 16); ctx.globalAlpha *= a; ctx.lineCap = ctx.lineJoin = 'round';
  for (let i = 0; i < 7; i++) {
    const ang = i / 7 * 6.28 + performance.now() / 80, pts = [[0, 0]];
    for (let s = 1; s <= 4; s++) pts.push([Math.cos(ang) * s * 11 + j(5), Math.sin(ang) * s * 11 + j(5)]);
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); pts.forEach(([px, py], k) => k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
    ctx.strokeStyle = '#3ec5ff'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}

// the Starship after Grok's off it: flying nose first along its heading (ang, radians off straight up), then blowing up (boom 0 … 1)
function drawWreck(x, y, ang, boom) {
  if (boom != null) {
    drawBoom(x, y, boom);
    ctx.save(); ctx.globalAlpha = Math.min(1, (1 - boom) * 3); ctx.fillStyle = INK; ctx.font = '700 16px Caveat, cursive'; ctx.textAlign = 'center';
    ctx.fillText('rapid unscheduled disassembly', x, y - 64 - 10 * boom); ctx.restore();
    return;
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.translate(0, SHIP_H / 2);
  drawStarship(1, 0.5, { empty: true });
  ctx.restore();
}

// the tractor beam: a pale blue cone from the eyes, widening to w × 22 px at the far end, rings running along it
function drawBeam(x1, y1, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, r = 22 * w;
  ctx.save(); ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(62,197,255,0.22)'; ctx.beginPath(); ctx.moveTo(x1 + nx * 3, y1 + ny * 3); ctx.lineTo(x2 + nx * r, y2 + ny * r); ctx.lineTo(x2 - nx * r, y2 - ny * r); ctx.lineTo(x1 - nx * 3, y1 - ny * 3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,150,210,0.55)'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 6]); ctx.lineDashOffset = performance.now() / 30;
  line(x1 + nx * 3, y1 + ny * 3, x2 + nx * r, y2 + ny * r, 0.4, 1); line(x1 - nx * 3, y1 - ny * 3, x2 - nx * r, y2 - ny * r, 0.4, 1);
  ctx.setLineDash([]);
  for (let i = 0; i < 3; i++) { // rings pulled along toward Grok
    const u = 1 - (performance.now() / 600 + i / 3) % 1, px = x1 + dx * u, py = y1 + dy * u, rr = 3 + (r - 3) * u;
    ctx.globalAlpha = 0.5 * u; ctx.beginPath(); ctx.ellipse(px, py, rr * 0.35, rr, Math.atan2(dy, dx), 0, 6.28); ctx.stroke();
  }
  ctx.restore();
}

// the ratio meter over whoever Grok holds: replies vs likes; once replies win, a red RATIO'D stamp slams on (r.at = when)
function drawRatio(x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  rbox(0, 0, 84, 24, 6, '#fdfbf5', 1.8);
  ctx.font = '700 15px Caveat, cursive'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillStyle = r.replies > r.likes ? '#d0412c' : INK; ctx.fillText('💬 ' + r.replies, -20, 1);
  ctx.fillStyle = INK; ctx.fillText('♥ ' + r.likes, 22, 1);
  if (r.ratiod) {
    const t = Math.min(1, (performance.now() - r.at) / 160), k = 1.8 - 0.8 * t; // slams down from big
    ctx.translate(0, -26); ctx.rotate(-0.14); ctx.scale(k, k); ctx.globalAlpha = t;
    drawStamp("RATIO'D", 1);
  }
  ctx.restore();
}
function drawStamp(text, lw) { // a red rubber stamp: text in a double-ruled box, centred on the origin
  ctx.font = '700 22px Caveat, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 16;
  ctx.strokeStyle = '#d0412c'; ctx.fillStyle = '#d0412c'; ctx.lineWidth = 2.2 * lw;
  ctx.strokeRect(-w / 2, -14, w, 28); ctx.lineWidth = 1 * lw; ctx.strokeRect(-w / 2 + 3, -11, w - 6, 22);
  ctx.fillText(text, 0, 1);
}
// the stamp left on someone thrown while ratio'd
function drawRatioStamp(x, y, rot, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot - 0.2); ctx.scale(0.8, 0.8); ctx.globalAlpha *= a; drawStamp("RATIO'D", 1); ctx.restore(); }

// forward throw: a green repost arrow swinging round what's held (t 0 … 1)
function drawRepost(x, y, t, face) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = Math.min(1, t * 4, (1 - t) * 4); ctx.rotate(face * t * 6.28); ctx.lineCap = ctx.lineJoin = 'round';
  for (const [c, w] of [[INK, 6], ['#00ba7c', 3.5]]) {
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w;
    ctx.beginPath(); ctx.arc(0, 0, 44, -2.6, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 44, 0.5, 3.8); ctx.stroke();
  }
  for (const a of [0.9, 3.8]) { // arrowheads
    ctx.save(); ctx.rotate(a); ctx.translate(44, 0); ctx.fillStyle = '#00ba7c'; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    path([[-8, -2], [8, -2], [0, 9]]); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
// back throw: a block sign stamped onto what's thrown (t 0 … 1: slams in, holds, fades)
function drawBlocked(x, y, t) {
  const k = t < 0.2 ? 1.7 - 3.5 * t : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.globalAlpha = Math.min(1, t * 6, (1 - t) * 3); ctx.lineCap = 'round';
  ctx.strokeStyle = '#d0412c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 6.28); ctx.stroke(); line(-15, -15, 15, 15, 0.4, 1);
  ctx.fillStyle = '#d0412c'; ctx.font = '700 16px Caveat, cursive'; ctx.textAlign = 'center'; ctx.fillText('blocked', 0, 38);
  ctx.restore();
}
// up throw: hearts popping out and floating up from under what's thrown, and a likes count racing up
function drawHearts(x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round';
  for (let i = 0; i < 8; i++) {
    const u = (t * 1.6 + i / 8) % 1, hx = 24 * Math.sin(i * 2.4 + u * 4), hy = 50 - 130 * u, s = 6 + 3 * (i % 3);
    ctx.globalAlpha = Math.min(1, u * 5, (1 - u) * 3) * Math.min(1, (1 - t) * 4);
    ctx.fillStyle = '#f91880'; ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(hx, hy + s * 0.9); ctx.bezierCurveTo(hx - s * 1.4, hy - s * 0.2, hx - s * 0.6, hy - s * 1.2, hx, hy - s * 0.4);
    ctx.bezierCurveTo(hx + s * 0.6, hy - s * 1.2, hx + s * 1.4, hy - s * 0.2, hx, hy + s * 0.9); ctx.fill(); ctx.stroke();
  }
  ctx.globalAlpha = Math.min(1, t * 5, (1 - t) * 3); ctx.fillStyle = '#f91880'; ctx.font = '700 20px Caveat, cursive'; ctx.textAlign = 'center';
  ctx.fillText('♥ ' + (t < 0.6 ? Math.round(10 ** (1 + 5 * t / 0.6)).toLocaleString() : '1.2M'), 0, 74);
  ctx.restore();
}

// Grok's KO: ink rays and blue sparks shooting off toward ang, with a little X spinning away in the middle (t 0 … 1)
function drawGrokBlast(x, y, t, ang) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = Math.min(1, (1 - t) * 2.2); ctx.lineCap = 'round';
  for (let i = 0; i < 11; i++) {
    const a = ang + (i - 5) * 0.2, l0 = 20 + 60 * t, l1 = l0 + 30 + (i % 3) * 20 * (1 - t);
    ctx.strokeStyle = i % 2 ? '#3ec5ff' : INK; ctx.lineWidth = i % 2 ? 3 : 4.5;
    line(Math.cos(a) * l0, Math.sin(a) * l0, Math.cos(a) * l1, Math.sin(a) * l1, 0.8, 1);
  }
  ctx.rotate(t * 8); drawXMark(0, 0, 10 * (1 - t) + 4);
  ctx.restore();
}
// a small hand-drawn X (xAI's mark), r = half its size
function drawXMark(x, y, r) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.45; line(x - r, y - r, x + r, y + r, 0.3, 1);
  ctx.lineWidth = r * 0.2; line(x + r, y - r, x - r, y + r, 0.3, 1);
  ctx.restore();
}
