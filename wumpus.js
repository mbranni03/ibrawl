// Wumpus (Discord's mascot): a blurple critter with a wide rounded head, floppy side ears, a pale snout
// and happy closed eyes, on a little bean body and stubby legs, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle)
const WUMPUS = '#6f7cf0', WUMPUS_LIT = '#b4bcfb', WUMPUS_INK = '#2f3796';

function drawWumpus(cx, bottom, pose = {}, face = 1) {
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -34); ctx.rotate(pose.rot || 0); ctx.translate(0, 34); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';

  for (const lx of [-6, 6]) { rbox(lx, -8, 7, 12, 3.5, WUMPUS, 2); rbox(lx + 1, -3, 11, 6, 3, WUMPUS, 2); } // legs + feet
  for (const s of [-1, 1]) rbox(s * 12, -22, 6, 12, 3, WUMPUS, 2); // stubby arms, behind the body
  rbox(0, -23, 22, 24, 10, WUMPUS); // bean body
  for (const s of [-1, 1]) { rbox(s * 27, -47, 12, 22, 6, WUMPUS); rbox(s * 27.5, -47, 6, 14, 3, WUMPUS_LIT, 1.4); } // ears, behind the head
  rbox(0, -49, 50, 34, 12, WUMPUS); // head

  // face, nudged toward facing: a pale snout with two nostrils, happy closed eyes either side above it
  rbox(4, -46, 20, 15, 6, WUMPUS_LIT, 2);
  ctx.fillStyle = WUMPUS_INK;
  for (const nx of [0, 8]) { ctx.beginPath(); ctx.roundRect(nx - 2, -46, 4, 2.4, 1.2); ctx.fill(); }
  ctx.lineWidth = 2;
  for (const ex of [-12, 19]) { ctx.beginPath(); ctx.arc(ex, -53, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  ctx.restore();
}
