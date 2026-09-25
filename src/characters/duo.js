// Duo (Duolingo's owl), after the official art: a wide green body whose top dips in the middle, wings flaring out
// from behind its sides, a light green mask with pointed brow feathers around two tall white eyes, a yellow-over-orange
// beak, three chest feathers and chunky orange feet, outlined in ink like the other fighters.
// Shapes are laid out on the reference art's 1000-unit grid (x from the centre line, y up from the feet), then scaled down.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
//   legs = Claw'd's four [dx, dy] foot offsets in px, back to front: the outer two move these feet
//   arm = px the wingtips swing about the shoulders (negative = up), or [back, front]: the wings are Duo's arms
//   flame = [height px, alpha] a streak flame rising from the floor behind Duo (up smash)
//   ads = [drop 0 (hovering high) … 1 (slammed on the floor), alpha] an ad panel either side of Duo (down smash)
//   heart = [dx, dy, size, alpha] a heart held out / zapped · hearts = [left, pop 0 … 1, alpha] Duo's hearts in a row overhead,
//          the last one popping away as it's spent (neutral special) · ice = [height px, alpha] a block of ice shot up out of the floor ahead of Duo (up special)
//   phone = [dx, dy, size, tilt, dead] a phone held up on Do Not Disturb (shield), its battery = 1 - wear; dead = screen out, cracked
//   card = [dx, dy, tilt, mark, flip] a quiz card held out, centred dx, dy px from the feet: mark 0 = ?, 1 = ✓, -1 = ✗;
//          flip = its width as it turns over (1 … 0 edge-on) (forward smash)
//   eyeFire = streak flames burning in its eyes (the streak meter's full)
//   buff = 0 (the owl) … 1 buff Duo (down special's streak mode; drawBuffDuo) · curl = [back, front] buff Duo's elbows (1 flexed … -1 punching)
const DUO = '#78c800', DUO_LIT = '#8ee000', DUO_FOOT = '#f49000', DUO_BEAK = '#ffc800';
const DUO_K = 0.064; // reference units → px: about 68 px wide, 61 tall

function drawDuo(cx, bottom, pose = {}, face = 1) {
  // buff = 0 (the owl) … 1 (buff Duo; more = pumped mid-flex). On the way it flickers between the two, buff more and more of the time,
  // the owl swelling as it strains, with pop lines bursting out round it
  const b = pose.buff || 0, big = b >= 1 || (b > 0 && (b * 5) % 1 < b), sw = big || !b ? 1 : 1 + 0.25 * b;
  if (pose.flame) drawStreakFlame(cx + (pose.x || 0) * face, bottom, ...pose.flame);
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1) * sw, (pose.sy ?? 1) * sw);
  ctx.translate(0, -30); ctx.rotate(pose.rot || 0); ctx.translate(0, 30); // origin back at the feet
  if (big) drawBuffDuo(pose, b >= 1 ? b : 0.75 + 0.25 * b); else drawOwlDuo(pose);
  ctx.restore();
  if (b > 0 && b < 1) {
    ctx.save(); ctx.translate(cx + (pose.x || 0) * face, bottom - 36); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.05 + 0.9 * i / 6) + j(0.08), r = 42 + 14 * ((b * 5 + i * 0.37) % 1);
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * (r + 9), Math.sin(a) * (r + 9)); ctx.stroke();
    }
    ctx.restore();
  }
  if (pose.ads) for (const side of [-1, 1]) drawAdPanel(cx + (pose.x || 0) * face + side * 56, bottom - 130 * (1 - pose.ads[0]), pose.ads[1]);
  if (pose.ice) drawIcePillar(cx + ((pose.x || 0) + 48) * face, bottom + (pose.y || 0), ...pose.ice);
  if (pose.hearts) { // five fixed slots over its head: the ones it has left, the last one popping
    const [left, pop, a] = pose.hearts, hx = cx + (pose.x || 0) * face, hy = bottom + (pose.y || 0) - 86;
    for (let i = 0; i < left; i++) { const last = i === left - 1 && pop > 0; drawHeart(hx + (i - 2) * 15, hy, 0.48 * (last ? 1 + 0.8 * pop : 1), a * (last ? 1 - pop : 1)); }
  }
  if (pose.heart) { const [dx, dy, k, a] = pose.heart; drawHeart(cx + ((pose.x || 0) + dx) * face, bottom + (pose.y || 0) + dy, k, a); }
  if (pose.phone) { const [dx, dy, k, tilt, dead] = pose.phone; drawPhone(cx + ((pose.x || 0) + dx) * face, bottom + (pose.y || 0) + dy, k, tilt * face, 1 - (pose.wear || 0), dead); }
  if (pose.card) { const [dx, dy, tilt, mark, flip = 1] = pose.card; drawQuizCard(cx + ((pose.x || 0) + dx) * face, bottom + (pose.y || 0) + dy, tilt * face, mark, flip); }
}

// the owl, round its feet (drawDuo has placed, stretched and leaned it)
function drawOwlDuo(pose) {
  ctx.scale(DUO_K, DUO_K); ctx.translate(-997, -1005); // from here on, reference art coordinates
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  const LW = 2.4 / DUO_K, wob = () => j(1) / DUO_K;
  const fillStroke = (draw, fill) => {
    ctx.save(); ctx.translate(wob(), wob()); ctx.fillStyle = fill; ctx.beginPath(); draw(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(j(0.4) / DUO_K, j(0.4) / DUO_K); ctx.lineWidth = LW; ctx.beginPath(); draw(); ctx.stroke(); ctx.restore();
  };

  // feet, tucked under the body
  const feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]], arm = Array.isArray(pose.arm) ? pose.arm : [pose.arm || 0, pose.arm || 0];
  for (const [i, fx] of [805, 1017].entries()) { const [dx, dy] = feet[i]; fillStroke(() => ctx.roundRect(fx + dx / DUO_K, 912 + dy / DUO_K, 173, 93, 46), DUO_FOOT); }

  // wings, behind the body, flaring out from its sides: the front one, and the back one mirrored across the centre line.
  // Each turns about its shoulder; the wing is 18.5 px long, so arm px of wingtip travel is arm / 18.5 radians
  for (const [i, a] of arm.entries()) {
    ctx.save();
    if (!i) { ctx.translate(1994, 0); ctx.scale(-1, 1); }
    ctx.translate(1378, 512); ctx.rotate(a / 18.5); ctx.translate(-1378, -512);
    fillStroke(() => { ctx.moveTo(1378, 512); ctx.lineTo(1518, 765); ctx.quadraticCurveTo(1545, 828, 1488, 838); ctx.quadraticCurveTo(1390, 858, 1295, 818); ctx.closePath(); }, DUO);
    ctx.restore();
  }

  // body: rounded top corners, the top edge dipping to the middle, straight sides curving into a round belly
  fillStroke(() => {
    ctx.moveTo(615, 620); ctx.lineTo(615, 180); ctx.quadraticCurveTo(615, 50, 745, 50);
    ctx.bezierCurveTo(800, 50, 930, 125, 997, 125); ctx.bezierCurveTo(1064, 125, 1194, 50, 1250, 50);
    ctx.quadraticCurveTo(1378, 50, 1378, 180); ctx.lineTo(1378, 620); ctx.bezierCurveTo(1378, 720, 1340, 770, 1295, 818);
    ctx.bezierCurveTo(1230, 900, 1120, 958, 997, 958); ctx.bezierCurveTo(874, 958, 764, 900, 700, 818); // belly
    ctx.bezierCurveTo(654, 770, 615, 720, 615, 620); ctx.closePath();
  }, DUO);

  // chest feathers: three flat-topped half discs
  ctx.fillStyle = DUO_LIT;
  for (const [fx, fy] of [[913, 690], [1081, 690], [997, 771]]) { ctx.beginPath(); ctx.ellipse(fx, fy, 55, 46, 0, 0, Math.PI); ctx.fill(); }
  duoFace(LW * 0.8, pose.blink, 15, pose.dizzy, pose.eyeFire);
}

// buff Duo (the down special's streak mode), after the plush: a little owl head on a huge torso, pecs and abs, boulder shoulders, big
// arms, lime briefs, thick legs and the same orange feet. Drawn in px round its feet, m = how pumped (1 = full). It takes the owl's
// pose fields: its arms swing like the wings (arm, the back one mirrored), the outer feet move its legs, and
//   curl = [back, front] elbow bend: 1 flexed (fist up by the shoulder) · 0 hanging easy · -1 punched out straight
const DUO_DARK = '#4f9a00', DUO_BRIEFS = '#b4e82c', DUO_BIG = 1.3; // laid out about 81 px tall, drawn DUO_BIG × that (ink lines kept their width)
function drawBuffDuo(pose, m) {
  ctx.scale(DUO_BIG, DUO_BIG); const ink = 2.4 / DUO_BIG;
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  const fs = (draw, fill) => { ctx.fillStyle = fill; ctx.beginPath(); draw(); ctx.fill(); ctx.save(); ctx.translate(j(0.4), j(0.4)); ctx.lineWidth = ink; ctx.beginPath(); draw(); ctx.stroke(); ctx.restore(); };
  const ell = (x, y, rx, ry, r = 0) => () => ctx.ellipse(x, y, rx, ry, r, 0, 6.28);
  const two = v => Array.isArray(v) ? v : [v || 0, v || 0], arm = two(pose.arm), curl = two(pose.curl), feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  const limb = i => { // an arm from its shoulder: upper arm (the bicep bunching as it curls), shoulder cap, then forearm and fist from the elbow
    const c = curl[i];
    ctx.save(); if (!i) ctx.scale(-1, 1);
    ctx.translate(22 * m, -52); ctx.rotate(arm[i] / 18.5 - 0.3 * m); // hanging, it stands out off the lats
    fs(ell(2, 8, 8 * m * (1 + 0.2 * Math.max(0, c)), 10 * m, -0.15), DUO);
    fs(ell(0, 0, 9 * m, 8.5 * m), DUO);
    ctx.translate(2, 16); ctx.rotate(c >= 0 ? 0.35 - 2 * c : 0.35 * (1 + c));
    const reach = 4 * Math.max(0, -c);
    fs(ell(0, 7 + reach / 2, 6.5 * m, 8.5 + reach / 2), DUO); fs(ell(0, 15 + reach, 6.5 * m, 6 * m), DUO);
    ctx.restore();
  };
  limb(0);
  for (const [i, s] of [-1, 1].entries()) { // legs: hip, knee bowed out, ankle, as one thick outlined stroke; then the foot
    const [dx, dy] = feet[i], ax = s * 9 + dx, ay = -7 + dy, kx = (s * 8 + ax) / 2 + s * 2.5, ky = (-26 + ay) / 2;
    const leg = () => { ctx.beginPath(); ctx.moveTo(s * 8, -26); ctx.lineTo(kx, ky); ctx.lineTo(ax, ay); ctx.stroke(); };
    ctx.strokeStyle = INK; ctx.lineWidth = 12 * m + 2 * ink; leg(); ctx.strokeStyle = DUO; ctx.lineWidth = 12 * m; leg(); ctx.strokeStyle = INK;
    fs(() => ctx.roundRect(ax - 7, ay - 1, 14, 8, 3.5), DUO_FOOT);
  }
  fs(() => { ctx.moveTo(-13, -28); ctx.lineTo(13, -28); ctx.quadraticCurveTo(12, -21, 4, -18); ctx.lineTo(-4, -18); ctx.quadraticCurveTo(-12, -21, -13, -28); }, DUO_BRIEFS);
  const w = 23 * m; // torso: a V from the waist out to the shoulders, traps up to the neck
  fs(() => {
    ctx.moveTo(-12, -24); ctx.bezierCurveTo(-15, -34, -w - 1, -40, -w, -52); ctx.quadraticCurveTo(-w + 2, -60, -8, -61);
    ctx.lineTo(8, -61); ctx.quadraticCurveTo(w - 2, -60, w, -52); ctx.bezierCurveTo(w + 1, -40, 15, -34, 12, -24); ctx.closePath();
  }, DUO);
  ctx.strokeStyle = DUO_DARK; ctx.lineWidth = 1.4; ctx.beginPath(); // pecs, then a six-pack
  ctx.moveTo(0, -58); ctx.lineTo(0, -28);
  for (const s of [-1, 1]) {
    ctx.moveTo(0, -45); ctx.quadraticCurveTo(s * 10 * m, -40, s * 19 * m, -50);
    for (const y of [-40, -35, -30]) { ctx.moveTo(s * 1.5, y); ctx.quadraticCurveTo(s * 5, y - 1.5, s * 8, y + 0.5); }
  }
  ctx.stroke(); ctx.strokeStyle = INK;
  ctx.save(); ctx.translate(0, -60); // the head: Duo's own shape, shrunk, tapering into the neck
  fs(() => {
    ctx.moveTo(-7, 2); ctx.bezierCurveTo(-12, -1, -13.5, -6, -13.5, -14); ctx.quadraticCurveTo(-13.5, -21, -7.5, -21); ctx.bezierCurveTo(-4.5, -21, -2, -18.5, 0, -18.5);
    ctx.bezierCurveTo(2, -18.5, 4.5, -21, 7.5, -21); ctx.quadraticCurveTo(13.5, -21, 13.5, -14); ctx.bezierCurveTo(13.5, -6, 12, -1, 7, 2); ctx.closePath();
  }, DUO);
  ctx.translate(0, -11); ctx.scale(0.036, 0.036); ctx.translate(-997, -376); duoFace(0.8 * ink / 0.036, pose.blink, 15, pose.dizzy, pose.eyeFire);
  ctx.restore();
  limb(1);
}

// Duolingo's streak flame standing on the floor at x, y: an orange teardrop flicking its tip over, a yellow one inside
function drawStreakFlame(x, y, h, alpha = 1, outer = '#ff9600', inner = '#ffc800') {
  if (h < 1) return;
  const w = 40 + 0.35 * h, lick = (k, hh, ww) => { // one flame, base centred at 0, 0
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-ww * 0.6, 0, -ww * 0.62, -hh * 0.5, -ww * 0.18, -hh * 0.8);
    ctx.quadraticCurveTo(-ww * 0.02, -hh * 0.92, ww * 0.12 + k, -hh);
    ctx.quadraticCurveTo(ww * 0.06, -hh * 0.74, ww * 0.3, -hh * 0.62);
    ctx.bezierCurveTo(ww * 0.62, -hh * 0.36, ww * 0.6, 0, 0, 0); ctx.closePath();
  };
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y + 2); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
  const k = j(3);
  ctx.fillStyle = outer; lick(k, h, w); ctx.fill(); ctx.stroke();
  ctx.fillStyle = inner; lick(k * 0.5, h * 0.55, w * 0.55); ctx.fill();
  ctx.restore();
}

// the streak flame as a little icon centred at x, y (crossed out on the "streak not full" warning)
function drawStreakIcon(x, y) { ctx.save(); ctx.translate(x, y + 7); ctx.scale(0.3, 0.3); drawStreakFlame(0, 0, 44); ctx.restore(); }

// an unskippable Super Duolingo ad standing on x, y (its bottom centre), with a close button far too small to hit
function drawAdPanel(x, y, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x + j(0.5), y); ctx.strokeStyle = INK; ctx.lineWidth = 2.4;
  ctx.fillStyle = '#6f3cd1'; ctx.beginPath(); ctx.roundRect(-22, -58, 44, 58, 6); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.font = '700 7px ui-monospace, Menlo, monospace'; ctx.fillText('AD', -14, -51);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('×', 17, -53); // the close button: good luck
  ctx.fillStyle = '#fff'; ctx.font = '800 11px ui-monospace, Menlo, monospace'; ctx.fillText('SUPER', 0, -34);
  ctx.fillStyle = '#ffc800'; ctx.beginPath(); ctx.roundRect(-16, -20, 32, 11, 5.5); ctx.fill();
  ctx.fillStyle = INK; ctx.font = '700 6px ui-monospace, Menlo, monospace'; ctx.fillText('TRY FREE', 0, -14.5);
  ctx.restore();
}

// one of Duo's hearts, centred at x, y; size 1 = 26 px across
function drawHeart(x, y, k = 1, alpha = 1) {
  if (k <= 0 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x + j(0.4), y + j(0.4)); ctx.scale(k, k);
  ctx.fillStyle = '#ff4b4b'; ctx.strokeStyle = INK; ctx.lineWidth = 2.4 / k; ctx.beginPath(); ctx.moveTo(0, 11);
  ctx.bezierCurveTo(-4, 7, -13, 1, -13, -5); ctx.bezierCurveTo(-13, -12, -3, -13, 0, -6); ctx.bezierCurveTo(3, -13, 13, -12, 13, -5); ctx.bezierCurveTo(13, 1, 4, 7, 0, 11);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-6, -6, 3, 2, -0.6, 0, 6.28); ctx.fill(); // shine
  ctx.restore();
}

// a push notification from Duo, centred at x, y (the side special's homing shot): the app icon and a guilt trip. k = 0 … 1 popped in
function drawReminder(x, y, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-36 + j(0.4), -12, 72, 24, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#58cc02'; ctx.beginPath(); ctx.roundRect(-31, -8, 16, 16, 4); ctx.fill(); // app icon
  ctx.fillStyle = '#fff'; for (const ex of [-26, -20]) { ctx.beginPath(); ctx.arc(ex, -1, 2.4, 0, 6.28); ctx.fill(); }
  ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '700 7px ui-monospace, Menlo, monospace'; ctx.fillText('Duo', -11, -4.5);
  ctx.font = '6.5px ui-monospace, Menlo, monospace'; ctx.fillText('misses you 🥺', -11, 4.5);
  ctx.restore();
}

// a streak freeze: a block of ice h px tall standing on x, y, a flame frozen inside it
function drawIcePillar(x, y, h, alpha = 1) {
  if (h < 1) return;
  const block = () => { ctx.beginPath(); ctx.roundRect(-22, -h, 44, h, 5); };
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x + j(0.4), y);
  ctx.fillStyle = '#d4f3ff'; block(); ctx.fill();
  ctx.save(); ctx.clip(); drawStreakFlame(0, -6, Math.min(34, h - 8), 0.9, '#1cb0f6', '#ddf4ff'); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; block(); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; // shine
  ctx.beginPath(); ctx.moveTo(-14, 6 - h); ctx.lineTo(-14, Math.min(-6, 22 - h)); ctx.moveTo(-8, 6 - h); ctx.lineTo(-8, Math.min(-6, 12 - h)); ctx.stroke();
  ctx.restore();
}

// a phone on Do Not Disturb, centred at x, y: a moon on a night screen and a battery running down (red when low) · dead: black, cracked
function drawPhone(x, y, k, tilt, battery, dead) {
  if (k <= 0.02) return;
  ctx.save(); ctx.translate(x + j(0.4), y); ctx.rotate(tilt); ctx.scale(k, k); ctx.strokeStyle = INK; ctx.lineWidth = 2.4;
  ctx.fillStyle = '#3c3c3c'; ctx.beginPath(); ctx.roundRect(-16, -26, 32, 52, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dead ? '#111' : '#2b1f5c'; ctx.beginPath(); ctx.roundRect(-13, -22, 26, 44, 3); ctx.fill();
  if (dead) { ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(1, -4); ctx.lineTo(-5, 6); ctx.moveTo(1, -4); ctx.lineTo(10, 2); ctx.stroke(); ctx.restore(); return; }
  ctx.fillStyle = '#ffc800'; ctx.beginPath(); ctx.arc(0, -6, 7, 0, 6.28); ctx.fill(); // the moon: a disc with a bite out of it
  ctx.fillStyle = '#2b1f5c'; ctx.beginPath(); ctx.arc(3.5, -8.5, 6, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '700 5px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Do Not', 0, 8); ctx.fillText('Disturb', 0, 14);
  const b = Math.max(0, Math.min(1, battery)); // battery, top right
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.strokeRect(3, -20, 8, 4); ctx.fillStyle = b < 0.25 ? '#ff4b4b' : '#58cc02'; ctx.fillRect(3.5, -19.5, 7 * b, 3);
  ctx.restore();
}

// a quiz flash card centred at x, y: ? until it's answered, then ✓ on green or ✗ on red
function drawQuizCard(x, y, tilt, mark, flip) {
  const [bg, edge, sign] = mark > 0 ? ['#d7ffb8', '#58a700', '✓'] : mark < 0 ? ['#ffdfe0', '#ea2b2b', '✗'] : ['#fff', INK, '?'];
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(Math.max(0.06, Math.abs(flip)), 1);
  ctx.fillStyle = bg; ctx.strokeStyle = edge; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.roundRect(-17 + j(0.5), -13 + j(0.5), 34, 26, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = edge; ctx.font = '700 18px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(sign, 0, 1); ctx.restore();
}

// Duo's face (also the Duolingo logo), in reference art coordinates: the light green mask, eyes and beak.
// lw = ink outline width round the eyes and beak (0 = flat, like the logo) · look = how far the pupils shift right
// dizzy = turns spun so far (Claw'd's dizzy field): spirals for pupils, spinning · fire = streak flames for pupils (its streak meter's full)
function duoFace(lw = 0, blink = 0, look = 0, dizzy = 0, fire = false) {
  // mask: a circle round each eye, joined by the brows that V down to the middle, with two pointed feathers each side
  ctx.fillStyle = DUO_LIT; ctx.beginPath();
  path([[700, 240], [735, 148], [782, 188], [803, 118], [918, 232], [997, 262], [1076, 232], [1191, 118], [1212, 188], [1259, 148], [1294, 240], [1190, 400], [997, 480], [805, 400]]);
  ctx.fill();
  for (const ex of [805, 1190]) { ctx.beginPath(); ctx.arc(ex, 400, 150, 0, 6.28); ctx.fill(); }

  // eyes: tall white capsules, dark capsule pupils looking in with a round glint; blink squashes them
  const k = 1 - 0.85 * (blink || 0), dark = lw ? INK : '#4b4b4b';
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  for (const [ex, px] of [[812, 830 + look], [1181, 1165 + look]]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(ex - 105, 376 - 136 * k, 210, 272 * k, 105 * k); ctx.fill();
    if (lw) ctx.stroke();
    if (k < 0.5) continue;
    if (dizzy) { // seeing stars: an ink spiral winding out from the middle of each eye
      ctx.save(); ctx.strokeStyle = dark; ctx.lineWidth = 20; ctx.beginPath(); // a loose turn and a half: the eye is only ~13 px across
      for (let a = 0; a <= 3 * Math.PI; a += 0.2) { const r = 8 + a * 8, q = a + dizzy * 2 * Math.PI; ctx.lineTo(ex + Math.cos(q) * r, 376 + Math.sin(q) * r * 1.2); }
      ctx.stroke(); ctx.restore(); continue;
    }
    if (fire) { // a streak flame burning up out of the bottom of each eye
      ctx.save(); ctx.beginPath(); ctx.roundRect(ex - 105, 376 - 136 * k, 210, 272 * k, 105 * k); ctx.clip();
      ctx.translate(px, 376 + 136 * k); ctx.scale(3.2, 3.2); drawStreakFlame(0, 0, 58); ctx.restore(); continue;
    }
    ctx.fillStyle = dark; ctx.beginPath(); ctx.roundRect(px - 49, 298, 98, 154, 49); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - 44, 330, 34, 0, 6.28); ctx.fill();
  }

  // beak: an orange chin under a yellow dome, with a soft highlight when flat
  ctx.fillStyle = DUO_FOOT; ctx.beginPath(); ctx.arc(997, 488, 53, 0, 6.28); ctx.fill(); if (lw) ctx.stroke();
  ctx.fillStyle = DUO_BEAK; ctx.beginPath(); ctx.moveTo(922, 480);
  ctx.quadraticCurveTo(930, 415, 997, 415); ctx.quadraticCurveTo(1064, 415, 1072, 480); ctx.lineTo(997, 492); ctx.closePath(); ctx.fill();
  if (lw) ctx.stroke(); else { ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.roundRect(970, 427, 55, 22, 11); ctx.fill(); }
}
