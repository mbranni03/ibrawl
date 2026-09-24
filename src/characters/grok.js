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
const GROK = '#fbf9f4';
const GR_R = 28; // body radius; it sits on the floor
const GR_EYES = [[0.22, -0.4], [0.65, -0.48]]; // eye centres in body radii, back then front

function drawGrok(cx, bottom, pose = {}, face = 1) {
  if (pose.mound != null) return drawMound(cx, bottom, pose.mound, pose.moving, face);
  const bx = cx + (pose.x || 0) * face, by = bottom + (pose.y || 0);
  if (pose.posts) drawPosts(bx, by - 2 * GR_R * (pose.sy ?? 1), ...pose.posts);
  ctx.save();
  if (pose.sink) { ctx.beginPath(); ctx.rect(cx - 400, bottom - 800, 800, 800); ctx.clip(); } // the floor hides what's sunk into it
  ctx.translate(bx, by + (pose.sink || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  if (pose.car) { drawCybertruck(pose); ctx.restore(); return; }
  ctx.translate(0, -GR_R); ctx.rotate(pose.rot || 0); // from here on, the origin is the body centre
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  ctx.save(); ctx.translate(j(1), j(1)); // marker wash, slightly off-register
  ctx.fillStyle = GROK; ctx.beginPath(); ctx.arc(0, 0, GR_R, 0, 6.28); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2.6; ellipse(0, 0, GR_R, GR_R, 0.4);

  // eyes: pills leaning back at the top; blink shortens them, squint thins them and tips them toward flat
  const sq = pose.squint ? 1 : 0, l = GR_R * 0.44 * (1 - 0.8 * (pose.blink || 0)), w = GR_R * 0.2 * (1 - 0.45 * sq);
  ctx.fillStyle = INK;
  for (const [ex, ey] of GR_EYES) {
    ctx.save(); ctx.translate(ex * GR_R + j(0.4), ey * GR_R + j(0.4)); ctx.rotate(-0.42 - 0.75 * sq);
    ctx.beginPath(); ctx.roundRect(-w / 2, -l / 2, w, l, w / 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  if (pose.debris != null) drawDebris(cx, bottom, pose.debris);
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
