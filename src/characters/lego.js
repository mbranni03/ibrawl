// Lego Man (the classic minifigure): a boxy yellow head with a stud, dot eyes and a smile, a plain red trapezoid torso,
// chunky bent arms ending in C-clip hands, and blue hips over two block legs. Proportions measured off the official
// product shot. Less sketchy than the others on purpose: crisp outlines, shaded fills and gloss so he reads as plastic.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
const LEGO_RED = ['#f5432c', '#d8150a', '#8e0c04'], LEGO_BLUE = ['#3d86ef', '#0f58c8', '#07317a'], LEGO_YEL = ['#fff27a', '#f7d117', '#c99a00'];
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

function drawLego(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -36); ctx.rotate(pose.rot || 0); ctx.translate(0, 36); // origin back at the feet
  ctx.lineCap = ctx.lineJoin = 'round';

  // legs: square blocks with a thigh step and a foot step, a darker outer side face
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -13.2 : 0.2, x1 = x0 + 13;
    legoPart(() => ctx.rect(x0, -23.5, 13, 23.5), legoShade(LEGO_BLUE, x0, x1));
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
  }
  ctx.strokeStyle = INK; ctx.lineWidth = LEGO_FINE; legoLine(-1.4, -23.5, -1.4, -14); legoLine(1.4, -23.5, 1.4, -14); // the leg pin between the thighs

  // hips: a flat band right across
  legoPart(() => ctx.rect(-13.4, -27.4, 26.8, 4), legoShade(LEGO_BLUE, -13.4, 13.4));
  legoShadow(-13.4, -27.4, 26.8, 1.6, 0.4);

  // arms first, the torso's sides overlap their inner edges: a rounded shoulder, a straight outer edge, cut square at the sleeve
  for (const s of [-1, 1]) {
    const arm = () => { ctx.moveTo(s * 10.6, -50.2); ctx.quadraticCurveTo(s * 19.4, -50.6, s * 20.2, -43.5); ctx.lineTo(s * 20.6, -30.2); ctx.lineTo(s * 14.2, -29.6); ctx.lineTo(s * 12.4, -44); ctx.closePath(); };
    legoPart(arm, legoShade(LEGO_RED, -20.6, 20.6));
    ctx.save(); ctx.beginPath(); arm(); ctx.clip(); legoGloss(s * 18 - 0.8, -47, 1.6, 12, s < 0 ? 0.5 : 0.25); ctx.restore();
    const hx = s * 17.4; // wrist and hand centre line
    legoPart(() => ctx.rect(hx - 2.1, -30, 4.2, 2.6), legoShade(LEGO_YEL, hx - 2.1, hx + 2.1), LEGO_FINE + 0.3);
    legoShadow(hx - 2.1, -30, 4.2, 1.2, 0.4);
    // C-clip: a thick ring with a gap facing straight down
    const gap = Math.PI / 2, half = 0.55, hy = -23.4, R = 4.6, r = 2.4;
    const hand = ctx.createRadialGradient(hx - s * 1.2, hy - 2, 0.4, hx, hy, R);
    hand.addColorStop(0, LEGO_YEL[0]); hand.addColorStop(0.6, LEGO_YEL[1]); hand.addColorStop(1, LEGO_YEL[2]);
    legoPart(() => { ctx.arc(hx, hy, R, gap + half, gap - half + 6.283); ctx.arc(hx, hy, r, gap - half * 1.35 + 6.283, gap + half * 1.35, true); ctx.closePath(); }, hand, 1.3);
  }

  // torso: a plain flat trapezoid with barely rounded shoulders
  const torsoPath = () => { ctx.moveTo(-10.4, -50.4); ctx.lineTo(10.4, -50.4); ctx.quadraticCurveTo(11.4, -50.4, 11.5, -49.4); ctx.lineTo(13.7, -27.4); ctx.lineTo(-13.7, -27.4); ctx.lineTo(-11.5, -49.4); ctx.quadraticCurveTo(-11.4, -50.4, -10.4, -50.4); };
  legoPart(torsoPath, legoShade(LEGO_RED, -13.7, 13.7));
  ctx.save(); ctx.beginPath(); torsoPath(); ctx.clip(); legoShadow(-12, -50.4, 24, 3.2, 0.35); ctx.restore(); // under the neck
  legoGloss(-9, -47, 1.6, 12, 0.3);

  // head: a wide neck, a boxy head with small corner radii and its chin in shade, then the stud
  legoPart(() => ctx.rect(-5.7, -53, 11.4, 2.8), legoShade(LEGO_YEL, -5.7, 5.7), LEGO_FINE + 0.3);
  const head = () => ctx.roundRect(-9.2, -69.8, 18.4, 17.1, [2.8, 2.8, 2.2, 2.2]);
  legoPart(head, legoShade(LEGO_YEL, -9.2, 9.2));
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  const chin = ctx.createLinearGradient(0, -57, 0, -52.7); chin.addColorStop(0, 'rgba(140,80,0,0)'); chin.addColorStop(1, 'rgba(140,80,0,0.28)');
  ctx.fillStyle = chin; ctx.fillRect(-9.2, -57, 18.4, 4.3);
  legoShadow(-9.2, -69.8, 18.4, 1.8, 0.25); // under the stud
  ctx.restore();
  legoPart(() => ctx.rect(-3.4, -72.4, 6.8, 2.6), legoShade(LEGO_YEL, -3.4, 3.4), LEGO_FINE + 0.3);
  legoGloss(-7, -68, 1.8, 10, 0.65);

  // face, nudged toward facing: two dot eyes (a lid line when blinking) and a shallow smile
  ctx.fillStyle = ctx.strokeStyle = INK;
  for (const ex of [-1.2, 4.2]) {
    if ((pose.blink || 0) > 0.5) { ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex, -62.2, 1.3, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); continue; }
    ctx.beginPath(); ctx.ellipse(ex, -61.4, 1.05, 1.25, 0, 0, 6.28); ctx.fill();
  }
  ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(1.5, -61.1, 4.4, Math.PI / 2 - 0.72, Math.PI / 2 + 0.72); ctx.stroke();
  ctx.restore();
}
