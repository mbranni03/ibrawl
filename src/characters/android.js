// Android (the Android bot): a green dome head with two antennae and dot eyes, cut off from a rounded body
// with a thin gap, loose capsule arms beside it and two short legs, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle) · blink 0 (open) … 1 (shut)
//   arm = px (negative = up), or [back, front] · legs = Claw'd's four [dx, dy] foot offsets, back to front: the outer two move these feet
const ANDROID = '#3ddc84';

function drawAndroid(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -32); ctx.rotate(pose.rot || 0); ctx.translate(0, 32); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  const arm = Array.isArray(pose.arm) ? pose.arm : [pose.arm || 0, pose.arm || 0], feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  for (const [i, lx] of [-7, 7].entries()) { const [dx, dy] = feet[i]; rbox(lx + dx, -7 + dy / 2, 8, 14 + dy, 4, ANDROID, 2); } // legs, tucked under the body, stretching to the foot
  rbox(0, -27, 34, 32, [4, 4, 13, 13], ANDROID); // body
  for (const [i, s] of [-1, 1].entries()) rbox(s * 23, -31 + arm[i], 7, 20, 3.5, ANDROID, 2); // arms, a gap off each side

  // head: antennae first so the dome covers their roots, then the dome
  ctx.lineWidth = 2.4;
  for (const s of [-1, 1]) line(s * 8, -52, s * 13, -62, 0.4, 1);
  ctx.save(); ctx.translate(j(1), j(1));
  ctx.fillStyle = ANDROID; ctx.beginPath(); ctx.ellipse(0, -45, 17, 15, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(j(0.4), -45 + j(0.4), 17, 15, 0, Math.PI, 0); ctx.closePath(); ctx.stroke();

  // eyes: dots, nudged toward facing
  ctx.fillStyle = INK;
  for (const ex of [-6, 9]) { ctx.beginPath(); ctx.ellipse(ex, -52, 1.9, 1.9 * (1 - 0.8 * (pose.blink || 0)), 0, 0, 6.28); ctx.fill(); }
  ctx.restore();
}
