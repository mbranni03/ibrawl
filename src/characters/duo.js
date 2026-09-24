// Duo (Duolingo's owl), after the official art: a wide green body whose top dips in the middle, wings flaring out
// from behind its sides, a light green mask with pointed brow feathers around two tall white eyes, a yellow-over-orange
// beak, three chest feathers and chunky orange feet, outlined in ink like the other fighters.
// Shapes are laid out on the reference art's 1000-unit grid (x from the centre line, y up from the feet), then scaled down.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
//   legs = Claw'd's four [dx, dy] foot offsets in px, back to front: the outer two move these feet
//   arm = px the wingtips swing about the shoulders (negative = up), or [back, front]: the wings are Duo's arms
const DUO = '#78c800', DUO_LIT = '#8ee000', DUO_FOOT = '#f49000', DUO_BEAK = '#ffc800';
const DUO_K = 0.064; // reference units → px: about 68 px wide, 61 tall

function drawDuo(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -30); ctx.rotate(pose.rot || 0); ctx.translate(0, 30); // origin back at the feet
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
  duoFace(LW * 0.8, pose.blink, 15);
  ctx.restore();
}

// Duo's face (also the Duolingo logo), in reference art coordinates: the light green mask, eyes and beak.
// lw = ink outline width round the eyes and beak (0 = flat, like the logo) · look = how far the pupils shift right
function duoFace(lw = 0, blink = 0, look = 0) {
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
    ctx.fillStyle = dark; ctx.beginPath(); ctx.roundRect(px - 49, 298, 98, 154, 49); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - 44, 330, 34, 0, 6.28); ctx.fill();
  }

  // beak: an orange chin under a yellow dome, with a soft highlight when flat
  ctx.fillStyle = DUO_FOOT; ctx.beginPath(); ctx.arc(997, 488, 53, 0, 6.28); ctx.fill(); if (lw) ctx.stroke();
  ctx.fillStyle = DUO_BEAK; ctx.beginPath(); ctx.moveTo(922, 480);
  ctx.quadraticCurveTo(930, 415, 997, 415); ctx.quadraticCurveTo(1064, 415, 1072, 480); ctx.lineTo(997, 492); ctx.closePath(); ctx.fill();
  if (lw) ctx.stroke(); else { ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.roundRect(970, 427, 55, 22, 11); ctx.fill(); }
}
