// Android (the Android bot): a green dome head with two antennae and dot eyes, cut off from a rounded body
// with a thin gap, loose capsule arms beside it and two short legs, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
//   arm = px (negative = up), or [back, front] · legs = Claw'd's four [dx, dy] foot offsets, back to front: the outer two move these feet
//   the arms float free of the body, so they can fly off it: swing = radians each turns about its shoulder (+ = forward: π/2 points
//   straight ahead, π straight up) · reach = px each shoulder moves forward · both a number (front arm only) or [back, front]
//   bar = [length px, typed 0 … 1, query] a Google search bar held out past the front fist, its query typed that far
//   item = [x, y, spin, which] a Google app held (I'm Feeling Lucky), centre x, y px from the feet: which indexes ANDROID_ITEMS
//   chrome = spin: curled up into a rolling Chrome ball instead (side special) · vanish = 0 … 1 thinned out to nothing (warping)
//   grab / throw props, each at [x, y] px from the feet (facing its way, not leaning with the body), then:
//     circle = [x, y, r, drawn 0 … 1, alpha] a Circle to Search scribble · captcha = [x, y, tick 0 … 1, alpha, scale] a reCAPTCHA box
//     tabs = [x, y, slide -1 … 1, alpha] a Chrome tab strip, the open tab sliding that far (+ = forward) · cloud = [x, y, upload 0 … 1, alpha]
//     a Drive cloud over an upload bar · trash = [x, y, lid 0 … 1 open, alpha] a trash can, bottom-centre at x, y
//   cable = 0 … 1 a USB-C cable plugging into its back · batt = 0 … 1 a battery over its head (bigger, with a bolt, while plugged in)
//   dino = [x, y, alpha] the Chrome T-rex, bottom-centre x, y px from the feet (it doesn't lean with the body)
//   earth = 0 … 1 a shockwave spreading along the floor both ways, throwing up map tiles (past 1: settling, gone at 1.8)
//   kick = radians each leg swings forward about its hip, a number (front leg only) or [back, front] · head = [dx, dy] px the head floats off the body · zap = 0 … 1 a crackle of sparks between the antenna tips
const ANDROID = '#3ddc84';
const ANDROID_TIPS = [[-13, -62], [13, -62]];
const GOOGLE = ['#4285f4', '#ea4335', '#fbbc05', '#34a853']; // blue, red, yellow, green

function drawAndroid(cx, bottom, pose = {}, face = 1) {
  if (pose.earth != null) { ctx.save(); ctx.translate(cx + (pose.x || 0) * face, bottom); androidEarth(pose.earth); ctx.restore(); } // on the floor, behind
  if (pose.batt != null) androidBattery(cx + (pose.x || 0) * face, bottom + (pose.y || 0) - 84, pose.batt, pose.cable > 0.9);
  const v = pose.vanish || 0;
  if (v >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - v;
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1) * (1 - 0.7 * v), (pose.sy ?? 1) * (1 + 0.6 * v));
  if (pose.chrome != null) { drawChromeBall(0, -24, 24, pose.chrome); ctx.restore(); return; }
  ctx.translate(0, -32); ctx.rotate(pose.rot || 0); ctx.translate(0, 32); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  const pair = v => Array.isArray(v) ? v : [0, v || 0];
  const arm = Array.isArray(pose.arm) ? pose.arm : [pose.arm || 0, pose.arm || 0], swing = pair(pose.swing), reach = pair(pose.reach);
  const feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]], kick = pair(pose.kick), [hx, hy] = pose.head || [0, 0];
  const drawArm = i => { // hung from the top of its shoulder, a gap off the body's side
    ctx.save(); ctx.translate((i ? 23 : -23) + reach[i], -41 + arm[i]); ctx.rotate(-swing[i]);
    rbox(0, 10, 7, 20, 3.5, ANDROID, 2);
    if (i && pose.bar?.[0] > 4) { ctx.rotate(Math.PI / 2); androidBar(...pose.bar); } // along the arm, past the fist
    ctx.restore();
  };

  if (pose.cable > 0) { // from off behind along the floor, up into a port in its back
    const k = Math.min(1, pose.cable), px = -60 + 41 * k, py = -4 - 20 * k;
    ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-110, 0); ctx.quadraticCurveTo(-50, 2, px - 7, py); ctx.stroke();
    ctx.fillStyle = '#5f6368'; ctx.beginPath(); ctx.roundRect(px - 9, py - 3.5, 10, 7, 2); ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke();
  }
  drawArm(0); // the back arm goes behind the body, so it can punch across it
  for (const [i, lx] of [-7, 7].entries()) { // legs, tucked under the body, hung from the hip and stretching to the foot
    const [dx, dy] = feet[i];
    ctx.save(); ctx.translate(lx + dx, -14); ctx.rotate(-kick[i]);
    rbox(0, 7 + dy / 2, 8, 14 + dy, 4, ANDROID, 2);
    ctx.restore();
  }
  rbox(0, -27, 34, 32, [4, 4, 13, 13], ANDROID); // body

  // head: antennae first so the dome covers their roots, then the dome
  ctx.save(); ctx.translate(hx, hy);
  ctx.lineWidth = 2.4;
  for (const [tx, ty] of ANDROID_TIPS) line(tx * 8 / 13, -52, tx, ty, 0.4, 1);
  ctx.save(); ctx.translate(j(1), j(1));
  ctx.fillStyle = ANDROID; ctx.beginPath(); ctx.ellipse(0, -45, 17, 15, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(j(0.4), -45 + j(0.4), 17, 15, 0, Math.PI, 0); ctx.closePath(); ctx.stroke();

  // eyes: dots, nudged toward facing
  ctx.fillStyle = INK;
  for (const ex of [-6, 9]) { ctx.beginPath(); ctx.ellipse(ex, -52, 1.9, 1.9 * (1 - 0.8 * (pose.blink || 0)), 0, 0, 6.28); ctx.fill(); }
  if (pose.zap > 0.05) androidZap(pose.zap);
  ctx.restore();

  drawArm(1);
  ctx.restore();
  if (pose.dino?.[2] > 0) drawDino(cx + pose.dino[0] * face, bottom + pose.dino[1], face, pose.dino[2]);
  if (pose.item) ANDROID_ITEMS[pose.item[3] || 0](cx + pose.item[0] * face, bottom + pose.item[1], 12, pose.item[2] * face);
  const at = ([x, y, ...rest]) => [cx + x * face, bottom + y, ...rest]; // a prop's spot, facing Android's way
  if (pose.trash) drawTrash(...at(pose.trash));
  if (pose.circle) drawSearchCircle(...at(pose.circle));
  if (pose.captcha) drawCaptcha(...at(pose.captcha));
  if (pose.tabs) { const [x, y, slide, a] = at(pose.tabs); drawTabStrip(x, y, slide * face, a); }
  if (pose.cloud) drawDriveCloud(...at(pose.cloud));
}

// Circle to Search: a glowing scribble in Google's colours looping round x, y, drawn that far (a little past a full turn), over a white glow
function drawSearchCircle(x, y, r, drawn, alpha = 1) {
  if (drawn <= 0 || alpha <= 0) return;
  const pts = [], end = drawn * 2.25 * Math.PI;
  for (let a = 0; a <= end; a += 0.12) { const k = r * (1 + 0.07 * Math.sin(3 * a) + 0.04 * a); pts.push([x + Math.cos(a - 2) * k, y + Math.sin(a - 2) * k * 0.9]); }
  if (pts.length < 2) return;
  const g = ctx.createConicGradient(0, x, y);
  [GOOGLE[0], GOOGLE[1], GOOGLE[2], GOOGLE[3], GOOGLE[0]].forEach((c, i) => g.addColorStop(i / 4, c));
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineCap = ctx.lineJoin = 'round';
  for (const [lw, st] of [[8, 'rgba(255,255,255,0.8)'], [3.6, g]]) {
    ctx.lineWidth = lw; ctx.strokeStyle = st; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
  }
  ctx.restore();
}

// the reCAPTCHA box, centred at x, y: a checkbox (ticked that far, in green), "I'm not a robot", the blue swirl; scale > 1 = stamping down
function drawCaptcha(x, y, tick, alpha = 1, scale = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = '#f9f9f9'; ctx.strokeStyle = '#b8b8b8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(-32, -10, 64, 20, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#8a8a8a'; ctx.beginPath(); ctx.roundRect(-28, -5, 10, 10, 1.5); ctx.fill(); ctx.stroke();
  if (tick > 0) { // the tick draws in: down the short stroke, up the long one
    const p = [[-26.5, 0], [-23.5, 3], [-17, -6]], k = Math.min(1, tick) * 2;
    ctx.strokeStyle = '#0f9d58'; ctx.lineWidth = 2.4; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...p[0]);
    ctx.lineTo(p[0][0] + (p[1][0] - p[0][0]) * Math.min(1, k), p[0][1] + (p[1][1] - p[0][1]) * Math.min(1, k));
    if (k > 1) ctx.lineTo(p[1][0] + (p[2][0] - p[1][0]) * (k - 1), p[1][1] + (p[2][1] - p[1][1]) * (k - 1));
    ctx.stroke();
  }
  ctx.fillStyle = '#333'; ctx.font = '5.5px sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText("I'm not a robot", -14, 0.5);
  ctx.strokeStyle = GOOGLE[0]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(24, -1, 3.5, 0.3, 5.2); ctx.stroke();
  ctx.restore();
}

// a Chrome tab strip centred at x, y: three tabs with coloured favicons, the open (white) one slid slide tabs from the middle
function drawTabStrip(x, y, slide, alpha = 1) {
  if (alpha <= 0) return;
  const tab = cx => { ctx.beginPath(); ctx.moveTo(cx - 15, 6); ctx.lineTo(cx - 11, -6); ctx.lineTo(cx + 11, -6); ctx.lineTo(cx + 15, 6); };
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.fillStyle = '#dee1e6'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect(-44, -8, 88, 16, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; tab(slide * 26); ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke(); // the open tab
  for (const [i, c] of [[-1, GOOGLE[1]], [0, GOOGLE[0]], [1, GOOGLE[3]]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(i * 26 - 6, 0, 2.6, 0, 6.28); ctx.fill(); ctx.fillStyle = '#9aa0a6'; ctx.fillRect(i * 26 - 1, -1, 9, 2); }
  ctx.restore();
}

// a Drive cloud centred at x, y with an upload arrow, over a progress bar filled to upload
function drawDriveCloud(x, y, upload, alpha = 1) {
  if (alpha <= 0) return;
  const puffs = [[-13, 4, 9], [0, -3, 13], [13, 4, 9]], blob = () => { ctx.beginPath(); for (const [dx, dy, r] of puffs) { ctx.moveTo(dx + r, dy); ctx.arc(dx, dy, r, 0, 6.28); } ctx.roundRect(-22, 2, 44, 11, 5); };
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; blob(); ctx.stroke(); ctx.fillStyle = '#fff'; blob(); ctx.fill(); // outline under the fill = one outline round the union
  ctx.strokeStyle = GOOGLE[0]; ctx.lineWidth = 2.6; ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, -6); ctx.moveTo(-5, -1); ctx.lineTo(0, -6); ctx.lineTo(5, -1); ctx.stroke();
  ctx.fillStyle = '#e8eaed'; ctx.beginPath(); ctx.roundRect(-24, 19, 48, 6, 3); ctx.fill();
  ctx.fillStyle = GOOGLE[0]; ctx.beginPath(); ctx.roundRect(-24, 19, 48 * Math.min(1, upload), 6, 3); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(-24, 19, 48, 6, 3); ctx.stroke();
  ctx.restore();
}

// a grey trash can standing with its bottom-centre at x, y, its lid swung open by lid (hinged at the back)
function drawTrash(x, y, lid, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.fillStyle = '#5f6368'; path([[-17, -30], [17, -30], [14, 0], [-14, 0]]); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 2; for (const dx of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(dx, -25); ctx.lineTo(dx * 0.85, -5); ctx.stroke(); }
  ctx.translate(-19, -31); ctx.rotate(-lid * 1.3); // the lid, hinged at its back corner
  ctx.fillStyle = '#5f6368'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(0, -5, 38, 5, 1.5); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(14, -9, 10, 4, 1.5); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// a battery icon centred at x, y, filled to level 0 … 1 (red when nearly empty), with a lightning bolt while charging
function androidBattery(x, y, level, charging) {
  const w = charging ? 28 : 18, h = w / 2;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 2.5); ctx.fill();
  ctx.fillStyle = level < 0.2 ? GOOGLE[1] : ANDROID; ctx.fillRect(-w / 2 + 2, -h / 2 + 2, (w - 4) * level, h - 4);
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 2.5); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(w / 2, -h / 4, 2.5, h / 2); // nub
  if (charging) { ctx.fillStyle = GOOGLE[2]; ctx.lineWidth = 1; path([[2, -h / 2 - 3], [-4, 1], [0, 1], [-2, h / 2 + 3], [4, -1], [0, -1]]); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// Google app icons, each centred at x, y about r px across its middle, spun spin radians (the ones that wobble instead of spinning
// just rock): thrown by I'm Feeling Lucky, the Chrome one is also the side special's ball
function drawChromeBall(x, y, r, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
  for (const [i, c] of ['#db4437', '#f4b400', '#0f9d58'].entries()) { // red, yellow, green thirds round a white ring and a blue middle
    const a = -Math.PI * 5 / 6 + i * Math.PI * 2 / 3;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a, a + Math.PI * 2 / 3); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.48, 0, 6.28); ctx.fill();
  ctx.fillStyle = GOOGLE[0]; ctx.beginPath(); ctx.arc(0, 0, r * 0.37, 0, 6.28); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.4, r / 12); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.stroke();
  ctx.restore();
}
function drawGmail(x, y, r, spin = 0) { // a white envelope, its flap the red M between a blue and a green side
  const w = r * 2.1, h = r * 1.5, e = r * 0.2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.15 * Math.sin(spin)); ctx.lineCap = ctx.lineJoin = 'round';
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 2); ctx.fill();
  ctx.lineWidth = r * 0.3;
  const seg = (c, a, b) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  const bl = [-w / 2 + e, h / 2 - e], tl = [-w / 2 + e, -h / 2 + e], m = [0, h * 0.05], tr = [w / 2 - e, -h / 2 + e], br = [w / 2 - e, h / 2 - e];
  seg(GOOGLE[0], bl, tl); seg(GOOGLE[3], tr, br); seg(GOOGLE[1], tl, m); seg(GOOGLE[1], m, tr);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 2); ctx.stroke();
  ctx.restore();
}
function drawMapsPin(x, y, r, spin = 0) { // the red Maps pin, its point r * 1.1 below y
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.2 * Math.sin(spin));
  ctx.beginPath(); ctx.moveTo(0, r * 1.1);
  ctx.bezierCurveTo(-r * 0.45, r * 0.5, -r * 0.85, r * 0.2, -r * 0.85, -r * 0.25); ctx.arc(0, -r * 0.25, r * 0.85, Math.PI, 0);
  ctx.bezierCurveTo(r * 0.85, r * 0.2, r * 0.45, r * 0.5, 0, r * 1.1);
  ctx.fillStyle = GOOGLE[1]; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#a50e0e'; ctx.beginPath(); ctx.arc(0, -r * 0.25, r * 0.32, 0, 6.28); ctx.fill();
  ctx.restore();
}
function drawDriveLogo(x, y, r, spin = 0) { // the Drive triangle: green, yellow and blue sides
  const p = [0, 1, 2].map(k => [r * Math.cos(-Math.PI / 2 + k * Math.PI * 2 / 3), r * Math.sin(-Math.PI / 2 + k * Math.PI * 2 / 3)]); // top, bottom right, bottom left
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin); ctx.lineCap = 'round'; ctx.lineWidth = r * 0.42;
  for (const [c, a, b] of [['#0f9d58', p[2], p[0]], ['#f4b400', p[0], p[1]], [GOOGLE[0], p[1], p[2]]]) { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.restore();
}
const ANDROID_ITEMS = [drawGmail, drawMapsPin, drawChromeBall, drawDriveLogo];

// up special: the Maps pin dropping onto the spot Android's about to warp to (x, y = its point), on frame f of the move
function drawWarpPin(x, y, f) {
  const k = Math.min(1, f / 6), a = f < 14 ? 1 : Math.max(0, 1 - (f - 14) / 8);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(42,38,34,0.22)'; ctx.beginPath(); ctx.ellipse(x, y, 11 * k, 3 * k, 0, 0, 6.28); ctx.fill();
  drawMapsPin(x, y - 15.4 - 50 * (1 - k) ** 2, 14);
  ctx.restore();
}

// a Google search bar lying along +x from the fist: white pill, blue magnifier, the query typed so far and a caret.
// Held at any angle, facing either way: the text is turned so it's never mirrored or upside down
const ANDROID_QUERY = 'how to win at smash';
function androidBar(len, typed, query = ANDROID_QUERY) {
  ctx.save(); ctx.translate(16, 0);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(j(0.6), -7 + j(0.6), len, 14, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(j(0.3), -7 + j(0.3), len, 14, 7); ctx.stroke();
  ctx.strokeStyle = GOOGLE[0]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(8, -1, 2.6, 0, 6.28); ctx.moveTo(9.9, 0.9); ctx.lineTo(12.2, 3.2); ctx.stroke();
  const w = len - 19; // text area, after the magnifier
  ctx.beginPath(); ctx.rect(15, -7, w, 14); ctx.clip();
  const { a, b, c, d } = ctx.getTransform(); // where the bar's axes point on screen
  ctx.translate(15 + w / 2, 0);
  if (a * d - b * c < 0) ctx.scale(1, -1); // mirrored (facing left): flip back across the bar
  if (a < 0) ctx.rotate(Math.PI); // pointing leftward on screen: read it the other way along the bar
  const text = query.slice(0, Math.round(typed * query.length)) + (seed & 1 ? '|' : ' '); // the caret blinks with the jitter
  ctx.fillStyle = INK; ctx.font = '7px monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(text, -w / 2 + 1, 0.5);
  ctx.restore();
}

// the Chrome offline T-rex, as its pixel sprite (facing right), bottom-centre at x, y
const DINO = [
  '.........#######',
  '........##.#####',
  '........########',
  '........########',
  '........#####...',
  '........#######.',
  '#......#####....',
  '#.....######....',
  '##...########...',
  '###.#######.#...',
  '##########......',
  '.#########......',
  '..#######.......',
  '...######.......',
  '....##.##.......',
  '....#...#.......',
  '....##..##......',
];
function drawDino(x, y, face = 1, alpha = 1) {
  const c = 2.1, w = DINO[0].length * c, h = DINO.length * c;
  ctx.save(); ctx.globalAlpha *= Math.min(1, alpha); ctx.translate(x, y); ctx.scale(face, 1); ctx.fillStyle = '#535353';
  DINO.forEach((row, r) => { for (let k = 0; k < row.length; k++) if (row[k] === '#') ctx.fillRect(-w / 2 + k * c, -h + r * c, c + 0.3, c + 0.3); });
  ctx.restore();
}

// Google Earth stomp, drawn on the floor at the feet as e runs 0 … 1 (the shockwave spreading) … 1.8 (all settled): impact lines
// off the feet, a Maps-blue location ring spreading along the floor, and map tiles (park, water, road) the wave throws up out of
// the floor as it passes, flipping and falling back, the ones nearest the feet highest
const MAP_LAND = '#f1efe6', MAP_PARK = '#81c995', MAP_WATER = '#669df6', MAP_ROAD = '#fbbc05';
const tileHash = k => { const x = Math.sin(k * 127.1 + 1.7) * 43758.5; return x - Math.floor(x); }; // steady per-tile randomness (rnd boils)
function androidEarth(e) {
  const r = 26 + 110 * Math.min(1, e), ry = r * 0.1, a = e < 1 ? 1 : Math.max(0, 1 - (e - 1) / 0.8);
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  if (a > 0) { // location ring
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(66,133,244,0.18)'; ctx.beginPath(); ctx.ellipse(0, 0, r, ry, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = GOOGLE[0]; ctx.lineWidth = 2.2; ellipse(0, 0, r, ry, 0.5);
  }
  if (e < 0.4) { // impact lines
    ctx.globalAlpha = 1 - e / 0.4; ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
    for (const sd of [-1, 1]) for (const [dy, l] of [[-3, 16], [-12, 11], [-22, 8]]) { const x0 = sd * (28 + 40 * e); line(x0, dy, x0 + sd * l, dy - l * 0.5, 0.5, 1); }
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1.3;
  for (const sd of [-1, 1]) for (let k = 0; k < 8; k++) { // map tiles
    const d = 22 + k * 15, t = (e - (d - 26) / 110) / 0.8; // 0 as the wave reaches it … 1 back down
    if (t <= 0 || t >= 1) continue;
    const h = tileHash(k * 2 + (sd > 0)), size = 10 + 5 * h, hi = 30 - 2.5 * k;
    ctx.save(); ctx.globalAlpha = t < 0.75 ? 1 : (1 - t) / 0.25;
    ctx.translate(sd * (d + 12 * t * h), -hi * 4 * t * (1 - t) - size / 2); ctx.rotate(sd * (1 + 2 * h) * t * 2.4);
    const q = size / 2;
    ctx.fillStyle = MAP_LAND; ctx.beginPath(); ctx.roundRect(-q, -q, size, size, 2); ctx.fill();
    ctx.save(); ctx.clip();
    if (h < 0.33) { ctx.fillStyle = MAP_PARK; ctx.beginPath(); ctx.ellipse(-q * 0.3, q * 0.2, q * 0.8, q * 0.6, 0.4, 0, 6.28); ctx.fill(); }
    else if (h < 0.6) { ctx.fillStyle = MAP_WATER; ctx.beginPath(); ctx.moveTo(-q, q * 0.1); ctx.quadraticCurveTo(0, -q * 0.5, q, q * 0.3); ctx.lineTo(q, q); ctx.lineTo(-q, q); ctx.fill(); }
    ctx.fillStyle = MAP_ROAD; ctx.fillRect(-q, -q * 0.62 + h * q, size, q * 0.42); // a road across every tile
    ctx.restore();
    ctx.beginPath(); ctx.roundRect(-q, -q, size, size, 2); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// a jagged bolt bowing up between the antenna tips and a few short sparks flying off each, green under an ink line; boils with the jitter
function androidZap(z) {
  const [[ax, ay], [bx, by]] = ANDROID_TIPS, bolts = [];
  const bolt = (x1, y1, x2, y2, n, bow = 0) => bolts.push(Array.from({ length: n + 1 }, (_, k) => {
    const u = k / n, e = k % n ? 1 : 0; // ends pinned
    return [x1 + (x2 - x1) * u + e * j(2.5), y1 + (y2 - y1) * u - bow * Math.sin(Math.PI * u) + e * j(2.5)];
  }));
  bolt(ax, ay, bx, by, 6, 10 * z);
  for (const [tx, ty] of ANDROID_TIPS) for (let k = 0; k < 3; k++) {
    const a = -Math.PI / 2 + Math.sign(tx) * (0.3 + k * 0.5) + j(0.2), l = 5 + 7 * z;
    bolt(tx, ty, tx + Math.cos(a) * l, ty + Math.sin(a) * l, 2);
  }
  ctx.save(); ctx.globalAlpha *= Math.min(1, z * 1.5);
  for (const [lw, c] of [[3.4, ANDROID], [1.3, INK]]) {
    ctx.lineWidth = lw; ctx.strokeStyle = c;
    for (const b of bolts) { ctx.beginPath(); b.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
  }
  ctx.restore();
}

// the part of Android that can be hit (body + legs + head; the loose arms left out), relative to bottom-center like move hitboxes
function androidHurtbox(pose = {}, face = 1) {
  const w = 34 * (pose.sx ?? 1), h = 60 * (pose.sy ?? 1);
  return { x: (pose.x || 0) * face - w / 2, y: (pose.y || 0) - h, w, h };
}
