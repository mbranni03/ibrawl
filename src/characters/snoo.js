// Snoo (Reddit's alien): a wide white head with round ears, orange-red eyes, a smile and a bent antenna with a
// ball on the end, on a small egg body with stubby arms and feet, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle)
const SNOO = '#fbf9f4', SNOO_EYE = '#ff4500';

// a filled, sketch-outlined ellipse
function snooBlob(x, y, rx, ry, lw = 2.4) {
  ctx.fillStyle = SNOO; ctx.beginPath(); ctx.ellipse(x + j(1), y + j(1), rx, ry, 0, 0, 6.28); ctx.fill();
  ctx.lineWidth = lw; ellipse(x, y, rx, ry, 0.4);
}

function drawSnoo(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -36); ctx.rotate(pose.rot || 0); ctx.translate(0, 36); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  for (const fx of [-6, 7]) snooBlob(fx, -4, 6, 4, 2); // feet
  for (const s of [-1, 1]) snooBlob(s * 12, -17, 3.5, 7, 2); // arms, behind the body
  snooBlob(0, -17, 11, 13); // egg body

  // antenna: a bent stalk off the top of the head to a ball, drawn first so the head covers its root
  ctx.lineWidth = 2.4;
  line(1, -56, 5, -70, 0.4, 1); line(5, -70, 14, -73, 0.4, 1);
  snooBlob(17, -73, 4.5, 4.5, 2);

  for (const s of [-1, 1]) snooBlob(s * 21, -52, 5.5, 5.5, 2); // ears, behind the head
  snooBlob(0, -44, 23, 15); // head

  // face, nudged toward facing: round eyes and a smile
  ctx.fillStyle = SNOO_EYE;
  for (const ex of [-6, 10]) { ctx.beginPath(); ctx.arc(ex + j(0.3), -47, 3.8, 0, 6.28); ctx.fill(); }
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(2, -44, 8, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke();
  ctx.restore();
}
