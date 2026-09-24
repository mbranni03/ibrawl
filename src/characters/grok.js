// Grok: a plain white ball with two slanted pill eyes up near its front, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = roll forward) · blink 0 (open) … 1 (shut)
//   squint = eyes narrowed to flat slanted slits (putting its weight into a hit)
//   car = 0 … 1 size of the Cybertruck Grok rides in, peeking out of the side window (0 = none) · wheel = its wheels' spin, radians
//         empty = nobody at the wheel (Grok jumped out)
//         (in the car, rot tips the whole truck: - = nose up round the back wheel, + = nose down round the front)
const GROK = '#fbf9f4';
const GR_R = 28; // body radius; it sits on the floor
const GR_EYES = [[0.22, -0.4], [0.65, -0.48]]; // eye centres in body radii, back then front

function drawGrok(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
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
