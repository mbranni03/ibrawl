// Claw'd, drawn from the Claude Code mascot's pixel grid (18 x 5 half-cells), in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch · rot radians (+ = lean forward) · blink (0 open … 1 shut)
//   arm  = px (negative = up), or [back, front] to move them separately
//   legs = four [dx, dy] foot offsets in px, back to front (dy negative = lifted)
//   speed = 0 … 1 horizontal motion lines · fallLines = 0 … 1 vertical streaks above (fast fall)
//   dust / dustAhead / puff = 0 … 1 progress of a dust cloud behind / in front / on both sides (drawClawdFx)
//   air  = preview-only height above the floor (negative = up); in the game, physics moves the character instead
const CLAWD = '#d97757';
const CU = 5, CV = 10; // one grid cell, px (terminal half-cells are twice as tall as wide)

function drawClawd(cx, bottom, pose = {}, face = 1) {
  const U = CU * (pose.sx ?? 1), V = CV * (pose.sy ?? 1);
  const [ab, af] = Array.isArray(pose.arm) ? pose.arm : [pose.arm || 0, pose.arm || 0];
  const [al, ar] = face > 0 ? [ab, af] : [af, ab];
  const ox = cx + (pose.x || 0) * face - 9 * U, oy = bottom + (pose.y || 0) - 5 * V;
  const at = (gx, gy, dy = 0) => [ox + gx * U, oy + gy * V + dy];

  const mx = ox + 9 * U, my = oy + 2.5 * V;
  if (pose.speed) { // motion lines trailing off the back edge
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.6 * pose.speed;
    const bx = mx - face * (9 * U + 6);
    for (const gy of [0.8, 2, 3.2]) line(bx, oy + gy * V, bx - face * 26 * pose.speed, oy + gy * V, 0.8, 1);
    ctx.restore();
  }
  if (pose.fallLines) { // streaks above, as if dropping fast
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.55 * pose.fallLines;
    for (const [gx, l] of [[5, 22], [9, 32], [13, 18]]) line(ox + gx * U, oy - 8, ox + gx * U, oy - 8 - l * pose.fallLines, 0.8, 1);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(mx, my); ctx.rotate((pose.rot || 0) * face); ctx.translate(-mx, -my);
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  // legs (behind the body)
  [4, 6, 11, 13].forEach((lx, i) => {
    const [dx, dy] = pose.legs?.[face > 0 ? i : 3 - i] || [0, 0], fx = dx * face;
    const leg = [at(lx, 3.8), at(lx + 1, 3.8), [at(lx + 1, 5)[0] + fx, at(0, 5)[1] + dy], [at(lx, 5)[0] + fx, at(0, 5)[1] + dy]];
    ctx.fillStyle = CLAWD; path(leg); ctx.fill();
    ctx.lineWidth = 2; poly(leg, 0.8);
  });

  // body + arm nubs as one silhouette
  const body = [at(3, 0), at(15, 0), at(15, 2, ar), at(17, 2, ar), at(17, 3, ar), at(15, 3, ar), at(15, 4), at(3, 4),
                at(3, 3, al), at(1, 3, al), at(1, 2, al), at(3, 2, al)];
  ctx.save(); ctx.translate(j(2.5), j(2.5)); // marker wash, slightly off-register
  ctx.fillStyle = CLAWD; ctx.globalAlpha = 0.92; path(body); ctx.fill();
  ctx.restore();
  hatch([at(3, 3.2), at(15, 3.2), at(15, 4), at(3, 4)], 6, 0.3); // belly shade
  ctx.lineWidth = 2.6; poly(body, 1.2);

  // eyes: tall pixel blocks, nudged toward facing, squash to a line on blink
  const eh = V * (1 - 0.85 * (pose.blink || 0)), shift = face * U * 0.35;
  ctx.fillStyle = INK;
  for (const ex of [5, 12]) {
    const [x, y] = at(ex, 1);
    ctx.fillRect(x + shift + j(0.6), y + (V - eh) / 2 + j(0.6), U, eh);
  }
  ctx.restore();
}

// dust clouds, drawn at the floor under Claw'd rather than at the body (which may be in the air)
function drawClawdFx(cx, floor, pose = {}, face = 1) {
  if (pose.dust != null) drawDust(cx - face * 34, floor, pose.dust, -face);
  if (pose.dustAhead != null) drawDust(cx + face * 34, floor, pose.dustAhead, face);
  if (pose.puff != null) { drawDust(cx - 26, floor, pose.puff, -1); drawDust(cx + 26, floor, pose.puff, 1); }
}

// the part of Claw'd that can be hit (body + legs; arm nubs left out), relative to bottom-center like move hitboxes
function clawdHurtbox(pose = {}, face = 1) {
  const w = 12 * CU * (pose.sx ?? 1), h = 5 * CV * (pose.sy ?? 1);
  return { x: (pose.x || 0) * face - w / 2, y: (pose.y || 0) - h, w, h };
}
