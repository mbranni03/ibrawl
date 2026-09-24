// Grok: a plain white ball with two slanted pill eyes up near its front, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = roll forward) · blink 0 (open) … 1 (shut)
const GROK = '#fbf9f4';
const GR_R = 28; // body radius; it sits on the floor
const GR_EYES = [[0.22, -0.4], [0.65, -0.48]]; // eye centres in body radii, back then front

function drawGrok(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -GR_R); ctx.rotate(pose.rot || 0); // from here on, the origin is the body centre
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  ctx.save(); ctx.translate(j(1), j(1)); // marker wash, slightly off-register
  ctx.fillStyle = GROK; ctx.beginPath(); ctx.arc(0, 0, GR_R, 0, 6.28); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2.6; ellipse(0, 0, GR_R, GR_R, 0.4);

  // eyes: pills leaning back at the top; blink shortens them
  const l = GR_R * 0.44 * (1 - 0.8 * (pose.blink || 0)), w = GR_R * 0.2;
  ctx.fillStyle = INK;
  for (const [ex, ey] of GR_EYES) {
    ctx.save(); ctx.translate(ex * GR_R + j(0.4), ey * GR_R + j(0.4)); ctx.rotate(-0.42);
    ctx.beginPath(); ctx.roundRect(-w / 2, -l / 2, w, l, w / 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
