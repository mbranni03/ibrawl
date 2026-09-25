// Lego Man (the classic minifigure): a boxy yellow head with a stud, dot eyes and a smile, a plain red trapezoid torso,
// chunky bent arms ending in C-clip hands, and blue hips over two block legs. Proportions measured off the official
// product shot. Less sketchy than the others on purpose: crisp outlines, shaded fills and gloss so he reads as plastic.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
//   arm = px (negative = up), or [back, front] · legs = Claw'd's four [dx, dy] foot offsets, back to front: the outer two move these legs
//   swing = radians each arm turns on its shoulder pin, or [back, front] · kick = radians each leg turns on the hip pin, or [back, front]:
//   + = outward, so the front limb comes up forward and the back one up behind (π/2 = level, π = straight up)
//   props: hammer = bricks in the brick hammer's head (in the front hand) · handful = loose bricks cupped in the front hand ·
//   tower = [centre x, rise 0 … 1, bricks]: a column of bricks coming up out of the floor · crane = [built 0 … 1, ball angle
//   (0 = hanging straight down, + = swung forward)]: the wrecking ball's crane behind him · rocket = a brick rocket on his
//   shoulder, 0 … 1 built · gold = a gold brick on his head stud, glowing · mech = drawn as his mech suit instead (legoMech),
//   him in its cockpit · book = the instruction booklet in the front hand, 0 shut … 1 open ·
//   wall = 0 … 1 his brick shield (a hut of bricks round him) risen out of the floor · wear = 0 … 1 how worn: cracks, then loose bricks ·
//   headOff = [x, y, rot]: his head off on its own, centred at
//   x, y from his feet on the floor (so it stays put whatever he does; pair with headless) ·
//   apart = 0 … 1: every part flying off from where it belongs (the counter) ·
//   headless = his head's off (thrown) · headLift = px it's pulled up off the neck
const LEGO_RED = ['#f5432c', '#d8150a', '#8e0c04'], LEGO_BLUE = ['#3d86ef', '#0f58c8', '#07317a'], LEGO_YEL = ['#fff27a', '#f7d117', '#c99a00'];
const LEGO_GRN = ['#5fd06a', '#1f9a3a', '#0d5a20'], LEGO_GREY = ['#d4d7dc', '#9ea3aa', '#5d636b'], LEGO_BRICKS = [LEGO_RED, LEGO_YEL, LEGO_BLUE, LEGO_GRN];
const LEGO_WHITE = ['#ffffff', '#e9e6df', '#a9a59c'], LEGO_GOLD = ['#fff0a0', '#e8b923', '#8a6400'];
const MECH_TOP = ['#c9cdd3', '#8d939b', '#50565e'], MECH_BOT = ['#6a7078', '#454a51', '#23272c'], MECH_K = 1.4; // the mech suit's plating, and how much bigger it makes him
const LEGO_LW = 1.7, LEGO_FINE = 0.9; // silhouette / detail line widths

// lit → base → shadow, left to right across x0 … x1
function legoShade([lit, base, dark], x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, lit); g.addColorStop(0.3, base); g.addColorStop(0.8, base); g.addColorStop(1, dark);
  return g;
}
// fill the path draw() makes, then outline it
function legoPart(draw, fill, lw = LEGO_LW) {
  ctx.beginPath(); draw(); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
}
// a soft gloss streak that fades toward its ends
function legoGloss(x, y, w, h, a = 0.6) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, w / 2); ctx.fill();
}
// a soft dark band where one part tucks under another
function legoShadow(x, y, w, h, a = 0.35) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(20,10,0,${a})`); g.addColorStop(1, 'rgba(20,10,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}
const legoLine = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
// a brick side-on: top-left x, y, w × h, a stud per 8px along the top when studs, shaded and outlined like the minifig
function legoBrick(x, y, w, h, col, studs = true) {
  if (studs) for (let i = 0, n = Math.max(1, Math.round(w / 8)); i < n; i++) { const sx = x + (i + 0.5) * w / n - 2.4; legoPart(() => ctx.rect(sx, y - 2.2, 4.8, 2.4), legoShade(col, sx, sx + 4.8), LEGO_FINE); }
  legoPart(() => ctx.rect(x, y, w, h), legoShade(col, x, x + w), LEGO_FINE + 0.3);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 1.2, y + 1.2, w - 2.4, 1.1);
}
// his platforms, standing on their top edge: a step of the up special's staircase ({ h, col })
function drawLegoPlate(pl) { ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; legoBrick(pl.x, pl.y, pl.w, pl.h || 7, LEGO_BRICKS[pl.col ?? 3]); ctx.restore(); }
// the booklet's pick list over his head: a white page under a blue BUILD band, a row per build ({ label, cost }) with its price in
// studs, the chosen one lit with a ▸; ones he can't afford greyed out. open 0 … 1 grows it in from its bottom
function drawLegoBooklet(x, y, rows, sel, open, studs) {
  const w = 150, rh = 18, h = 20 + rh * rows.length;
  ctx.save(); ctx.translate(x, y); ctx.scale(open, open); ctx.translate(-w / 2, -h); ctx.lineCap = ctx.lineJoin = 'round';
  legoPart(() => ctx.roundRect(0, 0, w, h, 3), '#fbfaf6', 1.6);
  ctx.fillStyle = LEGO_BLUE[1]; ctx.beginPath(); ctx.roundRect(0.8, 0.8, w - 1.6, 14, [2.4, 2.4, 0, 0]); ctx.fill();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 13px Caveat, cursive'; ctx.fillText('BUILD', w / 2, 8.5);
  rows.forEach(({ label, cost }, i) => {
    const ry = 18 + i * rh, cy = ry + rh / 2 - 1;
    if (i === sel) { ctx.fillStyle = LEGO_YEL[0]; ctx.fillRect(3, ry, w - 6, rh - 2); }
    ctx.globalAlpha = cost > studs ? 0.35 : 1;
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.font = '700 16px Caveat, cursive';
    if (i === sel) ctx.fillText('▸', 5, cy);
    legoBrick(15, cy - 2, 12, 6, LEGO_BRICKS[i % 4]);
    ctx.fillStyle = INK; ctx.fillText(label, 32, cy);
    ctx.textAlign = 'right'; ctx.fillText(cost, w - 18, cy); legoStud(w - 10, cy, 4);
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}
// a gold stud seen from above: the currency the booklet's builds cost
function legoStud(x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, LEGO_GOLD[0]); g.addColorStop(0.6, LEGO_GOLD[1]); g.addColorStop(1, LEGO_GOLD[2]);
  legoPart(() => ctx.arc(x, y, r, 0, 6.283), g, Math.max(0.8, r / 6));
  ctx.strokeStyle = LEGO_GOLD[2]; ctx.lineWidth = Math.max(0.6, r / 8); ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, 6.283); ctx.stroke();
}
// his stud count, next to his badge in the hud
function drawLegoStuds(x, y, n) {
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; legoStud(x, y, 10);
  ctx.font = '700 26px Caveat, cursive'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = INK;
  ctx.strokeText(n, x + 14, y + 1); ctx.fillStyle = LEGO_GOLD[1]; ctx.fillText(n, x + 14, y + 1);
  ctx.restore();
}
// "no studs!": a paper tag over his head, bottom-centred on x, y, with a crossed-out stud; k = 0 … 1 of its time (pops in, floats up, fades)
function drawLegoWarn(x, y, text, k) {
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.globalAlpha = Math.min(1, k / 0.08, (1 - k) / 0.25);
  ctx.font = '700 17px Caveat, cursive'; const w = ctx.measureText(text).width + 32, s = Math.min(1, 0.6 + k / 0.08 * 0.4);
  ctx.translate(x, y - 8 * k); ctx.scale(s, s); ctx.translate(-w / 2, -22);
  legoPart(() => ctx.roundRect(0, 0, w, 22, 5), '#fbfaf6', 1.6);
  legoStud(13, 11, 6.5); ctx.strokeStyle = '#d8150a'; ctx.lineWidth = 2.2; legoLine(7, 17, 19, 5);
  ctx.fillStyle = '#b8120a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, 24, 12);
  ctx.restore();
}
// a brick rocket pointing +x, centred on the origin: two white bricks, a red nose, red fins; b = 0 … 1 built (the pieces click on in
// that order), flame = 0 … 1 out the back
function legoRocket(b = 1, flame = 0) {
  if (flame) {
    const L = 10 + 16 * flame + j(2), g = ctx.createLinearGradient(-18, 0, -18 - L, 0);
    g.addColorStop(0, '#fff6b0'); g.addColorStop(0.4, '#ffb830'); g.addColorStop(1, 'rgba(240,80,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-17, -4); ctx.quadraticCurveTo(-18 - 2 * L, 0, -17, 4); ctx.fill();
  }
  if (b > 0.75) { legoBrick(-20, -11, 8, 5, LEGO_RED, false); legoBrick(-20, 6, 8, 5, LEGO_RED, false); }
  if (b > 0) legoBrick(-18, -5, 12, 10, LEGO_WHITE, false);
  if (b > 0.25) legoBrick(-6, -5, 12, 10, LEGO_WHITE, false);
  if (b > 0.5) legoPart(() => { ctx.moveTo(6, -5); ctx.quadraticCurveTo(17, -5, 20, 0); ctx.quadraticCurveTo(17, 5, 6, 5); ctx.closePath(); }, legoShade(LEGO_RED, 6, 20), LEGO_FINE + 0.3);
}
// the rocket in flight: { x, y, dir }
function drawLegoRocket(r) { ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.translate(r.x, r.y); ctx.scale(r.dir, 1); legoRocket(1, 1); ctx.restore(); }
// a rocket's blast (or the mech suit popping off), t = 0 … 1: a flash, a spreading ring, bricks flying out every way
function drawLegoBoom(x, y, t, R = 60) {
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.translate(x, y);
  if (t < 0.35) { ctx.globalAlpha = 1 - t / 0.35; ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(0, 0, R * (0.4 + t), 0, 6.283); ctx.fill(); }
  ctx.globalAlpha = 1 - t; ctx.strokeStyle = INK; ctx.lineWidth = 2.4 * (1 - t) + 0.5; ctx.beginPath(); ctx.arc(0, 0, R * (0.3 + 0.8 * t), 0, 6.283); ctx.stroke();
  for (let k = 0; k < 10; k++) {
    const a = k * 0.628 + 0.3, d = R * (0.2 + 1.1 * t);
    ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d + 30 * t * t); ctx.rotate(a + t * 8); legoBrick(-4, -2.5, 8, 5, LEGO_BRICKS[k % 4], false); ctx.restore();
  }
  ctx.restore();
}
// the brick shield's hut, bottom up (so wear takes bricks off the top): two columns either side of him, a lintel over his head
const LEGO_WALL = [...Array.from({ length: 12 }, (_, i) => [i % 2 ? 32 : -46, -10 * (i >> 1) - 10, 14, 10]), [-50, -68, 100, 8]];
// his KO blast's look (drawBlast's cols, core): red / yellow / blue rays, and bricks flying out of the middle
const LEGO_BLAST = [[LEGO_RED[1], LEGO_YEL[1], LEGO_BLUE[1]], (x, y, e, t) => drawLegoBoom(x, y, t, 60 + 60 * e)];
// one of the down smash's loose bricks lying in wait: { x, y, w, h, rot, col } (a box in the world)
function drawLooseBrick(k) {
  ctx.save(); ctx.translate(k.x + k.w / 2, k.y + k.h / 2); ctx.rotate(k.rot); ctx.lineCap = ctx.lineJoin = 'round';
  legoBrick(-k.w / 2, -k.h / 2, k.w, k.h, LEGO_BRICKS[k.col]);
  ctx.restore();
}

function drawLego(cx, bottom, pose = {}, face = 1) {
  if (pose.blast) return drawBlast(cx + (pose.x || 0) * face, bottom + (pose.y || 0) - 2.5 * CV, ...pose.blast); // KO'd: only the blast (as Claw'd's is placed)
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round';
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  if (pose.pad) { ctx.save(); ctx.globalAlpha *= pose.pad; legoBrick(-50, 2, 100, 8, LEGO_GRN); ctx.restore(); } // respawning: a green baseplate over the platform he rides in on
  if (pose.gold) { // powered up: a soft gold glow behind him
    const g = ctx.createRadialGradient(0, -40, 6, 0, -40, 58); g.addColorStop(0, 'rgba(255,215,80,0.55)'); g.addColorStop(1, 'rgba(255,215,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -40, 58, 0, 6.283); ctx.fill();
  }
  if (pose.tower) { // rising out of the floor (clipped at it), studs on the top brick only
    const [tx, r, n] = pose.tower, H = n * 10;
    ctx.save(); ctx.translate(tx, -(pose.y || 0)); ctx.beginPath(); ctx.rect(-30, -H - 30, 60, H + 30); ctx.clip(); ctx.translate(0, (1 - r) * (H + 3));
    for (let k = 0; k < n; k++) legoBrick(-12, -10 * (k + 1), 24, 10, LEGO_BRICKS[(k + 1) % 4], k === n - 1);
    ctx.restore();
  }
  if (pose.wall) { // his shield: clicked up out of the floor (clipped at it); as it wears the bricks crack one by one, then work loose
    const w = pose.wear || 0, loose = Math.max(0, (w - 0.6) / 0.4);
    ctx.save(); ctx.translate(0, -(pose.y || 0)); ctx.beginPath(); ctx.rect(-60, -100, 120, 100); ctx.clip(); ctx.translate(0, (1 - pose.wall) * 80);
    LEGO_WALL.forEach(([x, y, bw, h], i) => {
      const r = i * 0.618 % 1; // this brick's own random: when it cracks, where, which way it's knocked
      ctx.save(); ctx.translate(x + bw / 2, y + h / 2); ctx.rotate(loose * (r - 0.5) * 0.25); ctx.translate(loose * (r - 0.5) * 4 - x - bw / 2, -y - h / 2);
      legoBrick(x, y, bw, h, LEGO_BRICKS[((i >> 1) + i % 2) % 4]);
      if (w > 0.05 + 0.75 * r) { // a zigzag crack top to bottom
        const cx = x + bw * (0.3 + 0.4 * r); ctx.strokeStyle = INK; ctx.lineWidth = LEGO_FINE;
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + 3, y + h * 0.4); ctx.lineTo(cx - 2, y + h * 0.65); ctx.lineTo(cx + 1, y + h); ctx.stroke();
      }
      ctx.restore();
    });
    ctx.restore();
  }
  if (pose.crane) { // a yellow crane clicked up out of the floor behind him: a brick mast, a boom out over his head, a chain, the ball
    const [r, a] = pose.crane, bx = 30 + 72 * Math.sin(a), by = -112 + 72 * Math.cos(a);
    ctx.save(); ctx.translate(0, -(pose.y || 0)); ctx.beginPath(); ctx.rect(-80, -140, 200, 140); ctx.clip(); ctx.translate(0, (1 - r) * 140);
    for (let k = 0; k < 11; k++) legoBrick(-31, -10 * (k + 1), 11, 10, LEGO_YEL, false);
    legoBrick(-34, -120, 70, 8, LEGO_YEL);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; legoLine(30, -112, bx, by); ctx.strokeStyle = LEGO_GREY[2]; ctx.lineWidth = 1.2; legoLine(30, -112, bx, by);
    const g = ctx.createRadialGradient(bx - 4, by - 5, 1, bx, by, 14); g.addColorStop(0, '#8a9099'); g.addColorStop(0.6, '#3e434a'); g.addColorStop(1, '#1b1e22');
    legoPart(() => ctx.arc(bx, by, 14, 0, 6.283), g);
    ctx.restore();
  }
  ctx.translate(0, -36); ctx.rotate(pose.rot || 0); ctx.translate(0, 36); // origin back at the feet
  const pair = v => Array.isArray(v) ? v : [v || 0, v || 0];
  const arm = pair(pose.arm), swing = pair(pose.swing), kick = pair(pose.kick), feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  const A = pose.apart || 0, bit = (dx, dy, r, px, py) => { ctx.translate(px + dx * A, py + dy * A); ctx.rotate(r * A); ctx.translate(-px, -py); }; // a part flung dx, dy and turned r (at apart 1) about px, py
  if (pose.mech) { legoMech(pose, arm, swing, kick, feet, bit); ctx.restore(); return; }

  // legs: square blocks with a thigh step and a foot step, a darker outer side face; each shifts whole with its foot,
  // its top running up under the hips so a lowered leg never comes loose
  for (const [i, s] of [-1, 1].entries()) {
    const x0 = s < 0 ? -13.2 : 0.2, x1 = x0 + 13;
    ctx.save(); ctx.translate(...feet[i]); bit(s * 16, 8, s * 1.2, s * 6.7, -13);
    ctx.translate(s * 6.7, -21); ctx.rotate(-s * kick[i]); ctx.translate(-s * 6.7, 21); // hip pin
    legoPart(() => ctx.rect(x0, -26, 13, 26), legoShade(LEGO_BLUE, x0, x1));
    ctx.save(); ctx.clip();
    legoShadow(x0, -23.5, 13, 3, 0.5); // under the hips
    ctx.fillStyle = LEGO_BLUE[2]; ctx.globalAlpha = 0.45; ctx.fillRect(s < 0 ? x0 : x1 - 1.8, -23.5, 1.8, 23.5); ctx.globalAlpha = 1; // side face
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = LEGO_FINE;
    for (const y of [-14, -4.6]) {
      legoLine(x0, y, x1, y);
      ctx.strokeStyle = LEGO_BLUE[0]; ctx.globalAlpha = 0.6; legoLine(x0 + 0.8, y + 0.8, x1 - 0.8, y + 0.8); ctx.globalAlpha = 1; ctx.strokeStyle = INK; // lit edge below each step
    }
    legoGloss(x0 + 2.2, -13, 1.4, 8, 0.4);
    ctx.restore();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = LEGO_FINE; if (!A) { legoLine(-1.4, -23.5, -1.4, -14); legoLine(1.4, -23.5, 1.4, -14); } // the leg pin between the thighs

  // hips: a flat band right across
  ctx.save(); bit(0, 12, -0.4, 0, -25);
  legoPart(() => ctx.rect(-13.4, -27.4, 26.8, 4), legoShade(LEGO_BLUE, -13.4, 13.4));
  legoShadow(-13.4, -27.4, 26.8, 1.6, 0.4);
  ctx.restore();

  // arms first, the torso's sides overlap their inner edges: a rounded shoulder, a straight outer edge, cut square at the sleeve
  for (const [i, s] of [-1, 1].entries()) {
    ctx.save(); ctx.translate(0, arm[i]); bit(s * 24, -4, s * 1.8, s * 16, -38);
    ctx.translate(s * 15, -45); ctx.rotate(-s * swing[i]); ctx.translate(-s * 15, 45); // shoulder pin
    const sleeve = () => { ctx.moveTo(s * 10.6, -50.2); ctx.quadraticCurveTo(s * 19.4, -50.6, s * 20.2, -43.5); ctx.lineTo(s * 20.6, -30.2); ctx.lineTo(s * 14.2, -29.6); ctx.lineTo(s * 12.4, -44); ctx.closePath(); };
    legoPart(sleeve, legoShade(LEGO_RED, -20.6, 20.6));
    ctx.save(); ctx.beginPath(); sleeve(); ctx.clip(); legoGloss(s * 18 - 0.8, -47, 1.6, 12, s < 0 ? 0.5 : 0.25); ctx.restore();
    const hx = s * 17.4; // wrist and hand centre line
    if (i) legoHeld(pose, s, swing[i], hx, -23.4, true);
    legoPart(() => ctx.rect(hx - 2.1, -30, 4.2, 2.6), legoShade(LEGO_YEL, hx - 2.1, hx + 2.1), LEGO_FINE + 0.3);
    legoShadow(hx - 2.1, -30, 4.2, 1.2, 0.4);
    const hy = -23.4; legoClip(hx, hy, 4.6, LEGO_YEL); // C-clip hand
    if (i) legoHeld(pose, s, swing[i], hx, hy, false);
    ctx.restore();
  }

  // torso: a plain flat trapezoid with barely rounded shoulders
  ctx.save(); bit(0, -2, 0.3, 0, -39);
  const torsoPath = () => { ctx.moveTo(-10.4, -50.4); ctx.lineTo(10.4, -50.4); ctx.quadraticCurveTo(11.4, -50.4, 11.5, -49.4); ctx.lineTo(13.7, -27.4); ctx.lineTo(-13.7, -27.4); ctx.lineTo(-11.5, -49.4); ctx.quadraticCurveTo(-11.4, -50.4, -10.4, -50.4); };
  legoPart(torsoPath, legoShade(LEGO_RED, -13.7, 13.7));
  ctx.save(); ctx.beginPath(); torsoPath(); ctx.clip(); legoShadow(-12, -50.4, 24, 3.2, 0.35); ctx.restore(); // under the neck
  legoGloss(-9, -47, 1.6, 12, 0.3);
  ctx.restore();
  if (pose.rocket) { ctx.save(); ctx.translate(20, -50); legoRocket(pose.rocket); ctx.restore(); } // on his shoulder, pointing ahead

  // head: a wide neck, then the head on it (legoHead): the side special pulls it off and throws it (headless), lifting it first (headLift px)
  bit(0, -30, -0.8, 0, -61); // (the last part: nothing after it needs undoing)
  legoPart(() => ctx.rect(-5.7, -53, 11.4, 2.8), legoShade(LEGO_YEL, -5.7, 5.7), LEGO_FINE + 0.3);
  if (!pose.headless) { const L = pose.headLift || 0; ctx.translate(0, -61 - L); ctx.rotate(-0.06 * L); ctx.translate(0, 61); legoHead(pose.blink, pose.gold); }
  ctx.restore();
  if (pose.headOff) { const [hx, hy, hr] = pose.headOff; drawLegoHead({ x: cx + ((pose.x || 0) + hx) * face, y: bottom + hy, rot: hr * face, face }); }
}

// what the front hand holds, around its clip at hx, hy on an arm swung sw: under = the brick hammer (its bar runs under the clip),
// else the handful of loose bricks and the instruction booklet (kept upright)
function legoHeld(pose, s, sw, hx, hy, under) {
  if (under && pose.hammer) { // a grey bar through the C-clip, then a head of bricks on its end, studs out. Each size up alternates: a
    // layer further out along the handle, then a column wider across it (1: 1×1, 2: 2 deep, 3: 2×2, 4: 3 deep × 2)
    legoPart(() => ctx.rect(hx - 1.6, hy - 4.6, 3.2, 17), legoShade(LEGO_GREY, hx - 1.6, hx + 1.6), LEGO_FINE);
    const n = Math.round(pose.hammer), deep = Math.ceil((n + 1) / 2), wide = Math.ceil(n / 2);
    ctx.save(); ctx.translate(hx, hy + 12.4); ctx.rotate(Math.PI);
    for (let l = 0; l < deep; l++) for (let k = 0; k < wide; k++) legoBrick(10 * wide - 20 * (k + 1), -9 * (l + 1), 20, 9, LEGO_BRICKS[(l + k) % 4], l === deep - 1);
    ctx.restore();
  }
  if (under) return;
  if (pose.handful) { legoBrick(hx - 7, hy + 2.4, 8, 5, LEGO_BLUE); legoBrick(hx - 1, hy + 0.4, 8, 5, LEGO_GRN); } // cupped in the clip
  if (pose.book != null) { // a blue cover, opening out into two white pages with a build drawn on them
    const w = 9 + 11 * pose.book;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(s * sw - (pose.rot || 0));
    legoPart(() => ctx.rect(-w / 2 - 1.2, -19, w + 2.4, 15), legoShade(LEGO_BLUE, -w / 2, w / 2), LEGO_FINE + 0.3);
    if (pose.book > 0.3) {
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(-w / 2, -18, w, 13);
      ctx.strokeStyle = INK; ctx.lineWidth = LEGO_FINE; legoLine(0, -18, 0, -5);
      ctx.fillStyle = LEGO_RED[1]; ctx.fillRect(w / 4 - 3, -12, 6, 3); ctx.fillStyle = LEGO_YEL[1]; ctx.fillRect(w / 4 - 2, -15, 4, 3); ctx.fillStyle = LEGO_BLUE[1]; ctx.fillRect(-w / 4 - 2.5, -11, 5, 3);
    } else { ctx.fillStyle = LEGO_YEL[1]; ctx.fillRect(-2.5, -14.5, 5, 5); } // the cover picture
    ctx.restore();
  }
}

// black-and-yellow hazard stripes filling a box
function legoHazard(x, y, w, h) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = LEGO_YEL[1]; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#23211d';
  for (let k = -h; k < w; k += 7) { ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + 3.5, y + h); ctx.lineTo(x + k + 3.5 + h, y); ctx.lineTo(x + k + h, y); ctx.fill(); }
  ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = LEGO_FINE; ctx.strokeRect(x, y, w, h);
}
// a C-clip hand of radius R at x, y: a thick ring, its gap facing straight down
function legoClip(x, y, R, col, lw = 1.3) {
  const gap = Math.PI / 2, half = 0.55, r = R * 0.52, g = ctx.createRadialGradient(x - R * 0.26, y - R * 0.43, R * 0.1, x, y, R);
  g.addColorStop(0, col[0]); g.addColorStop(0.6, col[1]); g.addColorStop(1, col[2]);
  legoPart(() => { ctx.arc(x, y, R, gap + half, gap - half + 6.283); ctx.arc(x, y, r, gap - half * 1.35 + 6.283, gap + half * 1.35, true); ctx.closePath(); }, g, lw);
}

// the mech suit (pose.mech), drawn in its own units (about MECH_K × his size) and moved by the same pose fields as his body: a yellow
// construction mech with hazard stripes, grey hip, thighs, knees and pistons, big studded shoulder pads and giant C-clip claws,
// stubby legs on wide feet, exhausts, a headlight and an antenna, and him sitting up in the open glass cockpit on top, hands on the
// sticks. apart flings its parts out the same way (building it: they fly in)
function legoMech(pose, arm, swing, kick, feet, bit) {
  const DARK = MECH_BOT, STEEL = MECH_TOP;
  ctx.save(); bit(-10, -24, -0.5, -18, -92); // exhausts, up behind (his back is to the left)
  for (const [x, h] of [[-19, 26], [-11, 19]]) { legoPart(() => ctx.roundRect(x - 3.2, -80 - h, 6.4, h + 4, [2, 2, 0, 0]), legoShade(STEEL, x - 3.2, x + 3.2)); ctx.fillStyle = '#2b2b2b'; ctx.fillRect(x - 2, -80 - h + 0.8, 4, 1.6); }
  ctx.restore();

  for (const [i, s] of [-1, 1].entries()) { // legs: dark thigh, round steel knee, yellow shin with a hazard band, a wide foot
    ctx.save(); ctx.translate(...feet[i]); bit(s * 22, 10, s * 1.1, s * 13, -20);
    ctx.translate(s * 13, -36); ctx.rotate(-s * kick[i]); ctx.translate(-s * 13, 36);
    const x = s * 13;
    legoPart(() => ctx.rect(x - 7, -39, 14, 18), legoShade(DARK, x - 7, x + 7));
    legoPart(() => ctx.rect(x - 9, -23, 18, 18), legoShade(LEGO_YEL, x - 9, x + 9));
    legoHazard(x - 9, -13, 18, 5);
    legoPart(() => ctx.arc(x, -23, 4.6, 0, 6.283), legoShade(STEEL, x - 4.6, x + 4.6));
    legoPart(() => ctx.roundRect(x - 13 + s * 2, -6.5, 26, 6.5, [2.5, 2.5, 1, 1]), legoShade(DARK, x - 11, x + 15));
    ctx.restore();
  }
  ctx.save(); bit(0, 14, -0.3, 0, -36); // hips
  legoPart(() => ctx.rect(-21, -43, 42, 8), legoShade(DARK, -21, 21));
  legoPart(() => ctx.arc(0, -39, 3.2, 0, 6.283), legoShade(STEEL, -3.2, 3.2), LEGO_FINE);
  ctx.restore();

  ctx.save(); bit(0, -4, 0.2, 0, -60); // body: a yellow box, a hazard band along the bottom, a dark vent grille, headlight, antenna
  const body = () => ctx.roundRect(-25, -82, 50, 42, 5);
  legoPart(body, legoShade(LEGO_YEL, -25, 25));
  ctx.save(); ctx.beginPath(); body(); ctx.clip(); legoHazard(-26, -50, 52, 7); legoShadow(-25, -82, 50, 3, 0.3); legoGloss(-20, -78, 2, 22, 0.55); ctx.restore();
  ctx.lineWidth = LEGO_LW; ctx.strokeStyle = INK; ctx.beginPath(); body(); ctx.stroke();
  legoPart(() => ctx.roundRect(-11, -70, 22, 15, 2), legoShade(DARK, -11, 11));
  ctx.strokeStyle = STEEL[0]; ctx.lineWidth = 1.2; for (const y of [-66, -62.5, -59]) legoLine(-7.5, y, 7.5, y);
  const hl = ctx.createRadialGradient(17, -74, 0.5, 17, -74, 9); hl.addColorStop(0, 'rgba(255,250,200,0.9)'); hl.addColorStop(1, 'rgba(255,250,200,0)');
  ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(17, -74, 9, 0, 6.283); ctx.fill();
  legoPart(() => ctx.arc(17, -74, 3.2, 0, 6.283), '#fff7c2', LEGO_FINE);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; legoLine(21, -82, 24, -106); legoPart(() => ctx.arc(24, -107, 2.2, 0, 6.283), '#ff3b2a', LEGO_FINE);
  ctx.restore();

  ctx.save(); bit(0, -30, -0.6, 0, -92); // the cockpit: a dark rim, him from the chest up on the sticks, a glass canopy over him
  legoPart(() => ctx.rect(-17, -83.5, 34, 4), legoShade(DARK, -17, 17));
  legoPart(() => { ctx.moveTo(-5.4, -92); ctx.lineTo(5.4, -92); ctx.lineTo(7.2, -83.5); ctx.lineTo(-7.2, -83.5); ctx.closePath(); }, legoShade(LEGO_RED, -7, 7), LEGO_FINE + 0.3);
  if (!pose.headless) { legoPart(() => ctx.rect(-3.2, -94, 6.4, 2.2), LEGO_YEL[1], LEGO_FINE); ctx.save(); ctx.translate(0, -100.5); ctx.scale(0.72, 0.72); ctx.translate(0, 61); legoHead(pose.blink, pose.gold); ctx.restore(); }
  for (const s of [-1, 1]) { ctx.strokeStyle = INK; ctx.lineWidth = 1.2; legoLine(s * 9, -83.5, s * 8, -89); legoPart(() => ctx.arc(s * 8, -89.5, 1.8, 0, 6.283), LEGO_YEL[1], LEGO_FINE); }
  const glass = () => ctx.roundRect(-15, -110, 30, 27, [10, 10, 1, 1]);
  legoPart(glass, 'rgba(150,205,255,0.22)', LEGO_LW);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.roundRect(-11.5, -106, 3, 13, 1.5); ctx.fill();
  ctx.restore();

  for (const [i, s] of [-1, 1].entries()) { // arms: a steel piston down from a studded shoulder pad to a yellow forearm and a giant clip
    ctx.save(); ctx.translate(0, arm[i]); bit(s * 32, -6, s * 1.6, s * 29, -56);
    const px = s * 29, py = -72;
    ctx.translate(px, py); ctx.rotate(-s * swing[i]); ctx.translate(-px, -py);
    legoPart(() => ctx.rect(px - 2.6, -70, 5.2, 18), legoShade(STEEL, px - 2.6, px + 2.6));
    legoPart(() => ctx.roundRect(px - 7.5, -54, 15, 21, 2), legoShade(LEGO_YEL, px - 7.5, px + 7.5));
    legoHazard(px - 7.5, -40, 15, 4.5);
    if (i) legoHeld(pose, s, swing[i], px, -25, true);
    legoClip(px, -25, 8.6, DARK, 1.6);
    if (i) legoHeld(pose, s, swing[i], px, -25, false);
    legoPart(() => ctx.roundRect(px - 11, py - 9, 22, 17, 5), legoShade(STEEL, px - 11, px + 11));
    for (const d of [-5, 5]) legoPart(() => ctx.rect(px + d - 2.6, py - 11.4, 5.2, 2.6), legoShade(STEEL, px + d - 2.6, px + d + 2.6), LEGO_FINE);
    ctx.restore();
  }
  if (pose.rocket) { ctx.save(); ctx.translate(30, -88); legoRocket(pose.rocket); ctx.restore(); } // on its shoulder
}

// the head, in body coordinates (its middle at 0, -61): a boxy head with small corner radii and its chin in shade, the stud, and
// the face, nudged toward facing: two dot eyes (a lid line when blinking) and a shallow smile
function legoHead(blink = 0, gold = false) {
  if (gold) legoBrick(-6, -77, 12, 4.6, LEGO_GOLD); // clicked onto the stud
  const head = () => ctx.roundRect(-9.2, -69.8, 18.4, 17.1, [2.8, 2.8, 2.2, 2.2]);
  legoPart(head, legoShade(LEGO_YEL, -9.2, 9.2));
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  const chin = ctx.createLinearGradient(0, -57, 0, -52.7); chin.addColorStop(0, 'rgba(140,80,0,0)'); chin.addColorStop(1, 'rgba(140,80,0,0.28)');
  ctx.fillStyle = chin; ctx.fillRect(-9.2, -57, 18.4, 4.3);
  legoShadow(-9.2, -69.8, 18.4, 1.8, 0.25); // under the stud
  ctx.restore();
  legoPart(() => ctx.rect(-3.4, -72.4, 6.8, 2.6), legoShade(LEGO_YEL, -3.4, 3.4), LEGO_FINE + 0.3);
  legoGloss(-7, -68, 1.8, 10, 0.65);

  ctx.fillStyle = ctx.strokeStyle = INK;
  for (const ex of [-1.2, 4.2]) {
    if (blink > 0.5) { ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex, -62.2, 1.3, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); continue; }
    ctx.beginPath(); ctx.ellipse(ex, -61.4, 1.05, 1.25, 0, 0, 6.28); ctx.fill();
  }
  ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(1.5, -61.1, 4.4, Math.PI / 2 - 0.72, Math.PI / 2 + 0.72); ctx.stroke();
}
// the side special's thrown head, in the world: { x, y (its middle), rot, face }
function drawLegoHead(h) {
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.translate(h.x, h.y); ctx.rotate(h.rot); ctx.scale(h.face, 1); ctx.translate(0, 61);
  legoHead();
  ctx.restore();
}
