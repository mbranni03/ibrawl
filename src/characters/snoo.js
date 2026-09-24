// Snoo (Reddit's alien): a wide white head with round ears, orange-red eyes, a smile and a bent antenna with a
// ball on the end, on a small egg body with stubby arms and feet, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
//   arm = px (negative = up), or [back, front] · legs = Claw'd's four [dx, dy] foot offsets, back to front: the outer two move these feet
//   swing = radians the arms swing about the shoulders (+ = tip toward facing), or [back, front]; the back arm is on the left, so
//           [-1.9, 1.9] throws both arms up and out (much past 2 they hide behind the head)
//   reach = px an arm stretches forward, punching (the front one), or [back, front] (negative = backward) · ant = radians the antenna swings (+ = forward)
//   hammer = [angle, size] a ban hammer gripped in the front hand: angle = radians its handle points from straight up (+ = forward),
//            size 0 … 1 (it pops in and out) · banned = 0 … 1 a red BANNED stamp slamming down in front, then fading
//   signal = phase (turns) of radio rings beeping off the antenna ball · ufo = [x, y, beam 0 … 1, tilt, phase] a flying saucer at x, y
//            (px from bottom-centre) with its tractor beam shot beam of the way down to the floor, phase = rings rising up the beam
//   orb = px radius of a karma orb gathering on the antenna ball (neutral special) · mail = [tilt, size] an orange envelope held in
//          the front hand (side special)
//   gone = 0 … 1 shrinks Snoo away into its middle (1 = not drawn) · deleted = 0 … 1 size of a grey [deleted] tag in its place,
//          streaking when full size · poof = 0 … 1 a ring bursting off its middle (popping back in)
//   bigvote = 0 … 1 a giant upvote bursting up out of the floor behind Snoo (up smash): shoots up, holds, drifts up and fades
//   removed = 0 … 1 two grey [removed] tags bursting out along the floor both ways, fading
//   vote = [x, y, t, dir] a Reddit vote arrow popping up at x, y (px from bottom-centre, like hitboxes) and fading as t goes 0 … 1;
//          dir 1 = orange upvote, -1 = blue downvote
const SNOO = '#fbf9f4', SNOO_EYE = '#ff4500', SNOO_DOWN = '#7193ff';
const SNOO_WOOD = '#b07a45', SNOO_STEEL = '#8a8f99', SNOO_GREY = '#878a8c', SNOO_BEAM = '#fff3a8', SNOO_GLASS = '#cfe6f5';
const VOTE = [[0, -1], [0.95, -0.05], [0.42, -0.05], [0.42, 0.85], [-0.42, 0.85], [-0.42, -0.05], [-0.95, -0.05]]; // the arrow, pointing up

// a filled, sketch-outlined ellipse
function snooBlob(x, y, rx, ry, lw = 2.4) {
  ctx.fillStyle = SNOO; ctx.beginPath(); ctx.ellipse(x + j(1), y + j(1), rx, ry, 0, 0, 6.28); ctx.fill();
  ctx.lineWidth = lw; ellipse(x, y, rx, ry, 0.4);
}

function drawSnoo(cx, bottom, pose = {}, face = 1) {
  if (pose.bigvote != null) snooBigVote(cx + (pose.x || 0) * face, bottom, pose.bigvote);
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -36); ctx.rotate(pose.rot || 0); ctx.scale(Math.max(0.001, 1 - (pose.gone || 0)), Math.max(0.001, 1 - (pose.gone || 0))); ctx.translate(0, 36); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  const both = v => Array.isArray(v) ? v : [v || 0, v || 0];
  const arm = both(pose.arm), reach = Array.isArray(pose.reach) ? pose.reach : [0, pose.reach || 0], feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  for (const [i, fx] of [-6, 7].entries()) snooBlob(fx + feet[i][0], -4 + feet[i][1], 6, 4, 2); // feet
  // arms, behind the body: reaching stretches one forward from its back edge into a long sausage
  const swing = both(pose.swing);
  for (const [i, s] of [-1, 1].entries()) {
    const r = reach[i], sy = -24 + arm[i]; // the shoulder: top of the hanging arm
    ctx.save(); ctx.translate(s * 12, sy); ctx.rotate(-swing[i]); ctx.translate(-s * 12, -sy);
    snooBlob(s * 12 + r / 2, -17 + arm[i], 3.5 + Math.abs(r) / 2, Math.max(4, 7 - Math.abs(r) / 4), 2);
    ctx.restore();
  }
  snooBlob(0, -17, 11, 13); // egg body

  // antenna: a bent stalk off the top of the head to a ball, drawn first so the head covers its root
  ctx.save(); ctx.translate(1, -56); ctx.rotate(pose.ant || 0); ctx.translate(-1, 56);
  ctx.lineWidth = 2.4;
  line(1, -56, 5, -70, 0.4, 1); line(5, -70, 14, -73, 0.4, 1);
  snooBlob(17, -73, 4.5, 4.5, 2);
  if (pose.orb > 0.5) drawKarma(17, -73, pose.orb);
  if (pose.signal != null) { // two rings spreading off the ball, a half turn apart
    const a0 = ctx.globalAlpha; ctx.strokeStyle = SNOO_EYE; ctx.lineWidth = 1.6;
    for (let k = 0; k < 2; k++) { const u = (pose.signal + k / 2) % 1; ctx.globalAlpha = a0 * (1 - u); ctx.beginPath(); ctx.arc(17, -73, 7 + 12 * u, 0, 6.28); ctx.stroke(); }
  }
  ctx.restore();

  if (pose.hammer?.[1] > 0.05 && pose.hammer[0] < 0) snooHammer(arm[1], swing[1], ...pose.hammer); // raised back: behind the head
  for (const s of [-1, 1]) snooBlob(s * 21, -52, 5.5, 5.5, 2); // ears, behind the head
  snooBlob(0, -44, 23, 15); // head

  // face, nudged toward facing: round eyes and a smile
  ctx.fillStyle = SNOO_EYE;
  for (const ex of [-6, 10]) { ctx.beginPath(); ctx.ellipse(ex + j(0.3), -47, 3.8, 3.8 * (1 - 0.85 * (pose.blink || 0)), 0, 0, 6.28); ctx.fill(); }
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(2, -44, 8, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke();
  if (pose.hammer?.[1] > 0.05 && pose.hammer[0] >= 0) snooHammer(arm[1], swing[1], ...pose.hammer); // swung forward: in front
  if (pose.mail?.[1] > 0.05) { // in the front hand, where that arm's swing puts it
    ctx.save(); ctx.translate(12 + 11 * Math.sin(swing[1]), -24 + arm[1] + 11 * Math.cos(swing[1])); ctx.rotate(pose.mail[0]); ctx.scale(pose.mail[1], pose.mail[1]);
    snooEnvelope(); snooBlob(-4, 3, 4, 4, 2); ctx.restore(); // the fist over its corner
  }
  ctx.restore();
  const mx = cx + (pose.x || 0) * face, my = bottom + (pose.y || 0) - 36; // its middle
  if (pose.deleted > 0.02) snooDeleted(mx, my, face, pose.deleted);
  if (pose.poof != null) snooPoof(mx, my, pose.poof);
  if (pose.ufo) snooUfo(cx, bottom, face, ...pose.ufo);
  if (pose.removed != null) snooRemoved(cx, bottom, pose.removed);
  if (pose.banned != null) snooBanned(cx + (pose.x || 0) * face, bottom + (pose.y || 0), face, pose.banned);
  if (pose.vote) snooVote(cx + (pose.x || 0) * face, bottom + (pose.y || 0), face, ...pose.vote);
}

// a vote arrow: pops in big, settles, drifts off (up for an upvote, down for a downvote) and fades. Not turned with the body
function snooVote(cx, bottom, face, x, y, t, dir) {
  const k = 9 * (t < 0.2 ? 1.3 * t / 0.2 : 1.3 - 0.3 * Math.min(1, (t - 0.2) / 0.2));
  ctx.save(); ctx.translate(cx + x * face, bottom + y - dir * 16 * t); ctx.scale(k, k * dir);
  ctx.globalAlpha *= Math.min(1, 3 * (1 - t));
  ctx.fillStyle = dir > 0 ? SNOO_EYE : SNOO_DOWN; ctx.strokeStyle = INK; ctx.lineWidth = 2 / k; ctx.lineJoin = 'round';
  path(VOTE); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// the ban hammer, oversized, in Snoo's body frame: gripped in the front hand (where that arm's swing puts it)
function snooHammer(armY, swing, a, k) {
  ctx.save();
  ctx.translate(12 + 11 * Math.sin(swing), -24 + armY + 11 * Math.cos(swing)); ctx.rotate(a); ctx.scale(k, k); // from here the handle points up
  ctx.lineWidth = 2;
  const handle = [[-3, 7], [3, 7], [3, -36], [-3, -36]], head = [[-21, -61], [21, -61], [21, -35], [-21, -35]];
  ctx.fillStyle = SNOO_WOOD; path(handle); ctx.fill(); poly(handle, 0.3);
  ctx.fillStyle = SNOO_STEEL; path(head); ctx.fill();
  ctx.fillStyle = SNOO_EYE; ctx.fillRect(-13, -61, 26, 26); // orange band round the middle, BAN on it
  ctx.lineWidth = 2.4; poly(head, 0.4); line(-13, -61, -13, -35, 0.3, 1); line(13, -61, 13, -35, 0.3, 1);
  ctx.fillStyle = '#fff'; ctx.font = '700 10px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('BAN', 0, -47.5);
  snooBlob(0, 0, 4.5, 4.5, 2); // the fist round the grip
  ctx.restore();
}

// BANNED, rubber-stamped over where the hammer lands: slams in big, settles, fades. Never mirrored, so it always reads
function snooBanned(cx, bottom, face, t) {
  const k = t < 0.12 ? 1.4 - 0.4 * t / 0.12 : 1;
  ctx.save(); ctx.translate(cx + 58 * face, bottom - 92); ctx.rotate(-0.14); ctx.scale(k, k);
  ctx.globalAlpha *= Math.min(1, 4 * (1 - t));
  const box = [[-31, -10], [31, -10], [31, 10], [-31, 10]];
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; path(box); ctx.fill();
  ctx.strokeStyle = SNOO_EYE; ctx.lineWidth = 2.4; poly(box, 0.6);
  ctx.fillStyle = SNOO_EYE; ctx.font = '700 13px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('BANNED', 0, 1);
  ctx.restore();
}

// the flying saucer Snoo calls in (up smash), high overhead: a light cone shooting down toward the floor with rings rising up it,
// behind a glass dome on a steel disc ringed with orange lights. Drawn over Snoo, so it stands in the beam
function snooUfo(cx, bottom, face, x, y, beam, tilt, ph) {
  ctx.save(); ctx.translate(cx + x * face, bottom + y); ctx.strokeStyle = INK;
  if (beam > 0) {
    const h = 4 + (-y - 4) * beam, bw = 13 + 31 * beam; // its tip: the floor once beam = 1
    ctx.save(); ctx.globalAlpha *= 0.45; ctx.fillStyle = SNOO_BEAM; path([[-13, 4], [13, 4], [bw, h], [-bw, h]]); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha *= 0.55; ctx.lineWidth = 1.4;
    for (let k = 0; k < 5; k++) { const u = 1 - (ph + k / 5) % 1, ry = 4 + (h - 4) * u, w = (13 + (bw - 13) * u) * 0.8; line(-w, ry, w, ry, 0.6, 1); }
    ctx.restore();
  }
  ctx.rotate(tilt * face); ctx.lineWidth = 2;
  ctx.fillStyle = SNOO_GLASS; ctx.beginPath(); ctx.ellipse(0, -3, 14, 12, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.fillStyle = SNOO_STEEL; ctx.beginPath(); ctx.ellipse(0, 0, 30, 7, 0, 0, 6.28); ctx.fill(); ellipse(0, 0, 30, 7, 0.4);
  ctx.fillStyle = SNOO_EYE; for (const lx of [-19, -7, 7, 19]) { ctx.beginPath(); ctx.arc(lx, 1.5, 2, 0, 6.28); ctx.fill(); }
  ctx.restore();
}

// [removed], the way Reddit shows a removed comment: a tag sliding out along the floor each way, fading. Never mirrored
function snooRemoved(cx, bottom, t) {
  ctx.save(); ctx.globalAlpha *= Math.min(1, 3 * (1 - t)); ctx.strokeStyle = INK;
  ctx.font = '700 11px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const d of [-1, 1]) {
    const x = cx + d * (60 + 60 * t), y = bottom - 12;
    ctx.fillStyle = '#fff'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.roundRect(x - 35, y - 9, 70, 18, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = SNOO_GREY; ctx.fillText('[removed]', x, y + 0.5);
    ctx.lineWidth = 1.4; line(x - d * 40, y - 4, x - d * 54, y - 4, 0.5, 1); line(x - d * 40, y + 4, x - d * 48, y + 4, 0.5, 1); // speed dashes behind it
  }
  ctx.restore();
}

// a karma orb (neutral special), charging on the antenna and thrown: an orange ball in a soft glow with an upvote on it.
// Takes the same arguments as drawSpark, so it can be a projectile's draw; spin is ignored so the arrow stays upright
function drawKarma(x, y, r = 10) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(255,69,0,0.22)'; ctx.beginPath(); ctx.arc(0, 0, r * 1.5, 0, 6.28); ctx.fill();
  ctx.fillStyle = SNOO_EYE; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.fill(); ctx.lineWidth = 1.6; ctx.stroke();
  ctx.scale(r * 0.5, r * 0.5); ctx.fillStyle = '#fff'; path(VOTE); ctx.fill();
  ctx.restore();
}

// [deleted], the way Reddit shows a deleted account, standing in for Snoo while it's gone (down special); streaks at full size.
// Never mirrored, so it always reads
function snooDeleted(x, y, face, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = INK;
  ctx.fillStyle = '#fff'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.roundRect(-36, -10, 72, 20, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = SNOO_GREY; ctx.font = '700 11px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('[deleted]', 0, 0.5);
  if (k > 0.99) { ctx.lineWidth = 1.4; for (const [dy, l] of [[-5, 16], [0, 24], [5, 12]]) line(-face * 42, dy, -face * (42 + l), dy, 0.5, 1); } // speed dashes behind
  ctx.restore();
}

// popping back in: a ring and eight dashes bursting off Snoo's middle, fading
function snooPoof(x, y, t) {
  const r = 22 + 30 * t;
  ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha *= 1 - t; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, c = Math.cos(a), s = Math.sin(a); line(x + c * (r + 4), y + s * (r + 4), x + c * (r + 12), y + s * (r + 12), 0.4, 1); }
  ctx.restore();
}

// the up smash's giant upvote, behind Snoo: shoots up out of the floor (clipped there) in the first fifth, holds, then drifts up fading
function snooBigVote(x, floor, t) {
  const up = Math.min(1, t / 0.12), rise = (1 - (1 - up) ** 3) * 148 + Math.max(0, t - 0.5) * 60; // eased burst, then a slow drift
  ctx.save(); ctx.translate(x, floor);
  ctx.beginPath(); ctx.rect(-200, -600, 400, 600); ctx.clip(); // nothing below the floor
  ctx.globalAlpha *= Math.min(1, 2.5 * (1 - t)); ctx.translate(0, 80 - rise); // starts just under the floor; stem foot on it once fully up
  ctx.fillStyle = SNOO_EYE; path(VOTE.map(([vx, vy]) => [vx * 40, vy * 80])); ctx.fill(); // 76 wide, 148 tall
  ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

// Reddit's orangered: an orange envelope, flap folded down, centred on the origin, 20 x 14
function snooEnvelope() {
  const box = [[-10, -7], [10, -7], [10, 7], [-10, 7]];
  ctx.fillStyle = SNOO_EYE; path(box); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.8; poly(box, 0.3);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(0, 1.5); ctx.lineTo(8, -5); ctx.stroke();
}

// the side special's letter in flight (drawSpark's arguments, plus the shot, to tilt along its wave): speed dashes trailing it
function drawMail(x, y, r = 10, spin = 0, sh = null) {
  const d = Math.sign(sh?.vx ?? 1) || 1, w = sh?.m.projectile.wave;
  const slope = w ? w[0] * 2 * Math.PI / w[1] * Math.cos(2 * Math.PI * sh.t / w[1]) / Math.abs(sh.vx) : 0; // dy / dx along its path
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
  for (const [dy, l] of [[-4, 10], [3, 16]]) line(-d * (r + 4), dy, -d * (r + 4 + l), dy, 0.4, 1);
  ctx.rotate(Math.atan(slope) * d); ctx.scale(r / 10, r / 10); snooEnvelope();
  ctx.restore();
}

// the letter arriving: a red notification badge with a 1 pops up off the hit, inside a spreading ring, then fades
function snooPing(x, y, t) {
  const k = t < 0.15 ? 1.3 * t / 0.15 : 1.3 - 0.3 * Math.min(1, (t - 0.15) / 0.15);
  ctx.save(); ctx.translate(x, y - 22 * t); ctx.globalAlpha *= Math.min(1, 3 * (1 - t)); ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 22 * t, 10 + 26 * t, 0, 6.28); ctx.stroke();
  ctx.scale(k, k); ctx.fillStyle = SNOO_EYE; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 6.28); ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '700 11px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', 0, 0.5);
  ctx.restore();
}
