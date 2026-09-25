// Wumpus (Discord's mascot): a blurple critter with a wide rounded head, floppy side ears, a pale snout
// and happy closed eyes, on a little bean body and stubby legs, in sketch style.
// pose fields (all optional), written facing right and mirrored for face = -1:
//   x, y offsets · sx, sy stretch (from the floor) · rot radians (+ = lean forward, around the middle)
//   arm = px (negative = up), or [back, front] · arms = radians each arm swings out and up from the shoulder, or [back, front] · reach = px an arm punches out in front (drawn over the body), or [back, front]
//   ears = radians each ear swings out and up from hanging (π = straight up), or [back, front]
//   props, placed like hitboxes (px from bottom-centre + x / y, facing right, not rotated or stretched with the body):
//   emoji = [x, y, radius, burst 0 … 1, kind = index into EMOJIS] a big emoji, bursting into a super-reaction sparkle ring (forward smash)
//   rings = 0 … 1 green voice rings (and shouted words) rising off its head (up smash) · pin = [x, y of the point, size, alpha] a red pushpin (down smash)
//   horn = [x, y (centre), size, blast 0 … 1 or null] an air horn, blasting sound (neutral special) · nelly = [x, y (bottom), t] Nelly the snail in its paws (side special)
//   waves = 0 … 1 sound rings bursting off its head (the down special's counter) · muted = 0 … 1 a struck-through mic over its head (down throw)
//   blast = [0 … 1, angle, colour, spark] KO'd: drawn instead of Wumpus (see drawBlast)
//   dnd = 0 … 1 a big red Do Not Disturb disc held up as a shield (shrinks, cracks and greys with wear 0 … 1) · dndBurst = 0 … 1 it shattering
//   worn with the body: squint = eyes squeezed shut > < (hurt) · invisible = 0 … 1 gone see-through with Discord's grey invisible status dot (dodges) · shout = 0 … 1 mouth open · rocket = 0 … 1 flame of a Nitro tank strapped to its back (up special) · trail = [0 … 1, phase] Nitro sparkles streaming below it · headphones = 0 … 1 deafened headphones on its head
//   legs = Claw'd's four [dx, dy] foot offsets, back to front: the outer two move these feet
const WUMPUS = '#6f7cf0', WUMPUS_LIT = '#b4bcfb', WUMPUS_INK = '#2f3796';
const DND = '#f23f43', BOOST = '#ff73fa', SPEAK = '#23a55a', NITRO = '#8d5cf6', PIN = '#ed4245', PEPE = '#4a8f3c';

function drawWumpus(cx, bottom, pose = {}, face = 1) {
  if (pose.blast) return drawBlast(cx + (pose.x || 0) * face, bottom + (pose.y || 0) - 34, ...pose.blast); // KO'd: only the burst is left (clawd.js)
  ctx.save();
  ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face * (pose.sx ?? 1), pose.sy ?? 1);
  ctx.translate(0, -34); ctx.rotate(pose.rot || 0); ctx.translate(0, 34); // origin back at the feet
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  const a0 = ctx.globalAlpha; if (pose.invisible) ctx.globalAlpha *= 1 - 0.65 * pose.invisible; // status: invisible

  const pair = v => Array.isArray(v) ? v : [v || 0, v || 0];
  if (pose.rocket != null) { // Nitro tank on its back, behind everything: Nitro's pink → purple, NITRO down the side, fins, a pink-purple flame
    const fl = pose.rocket, nitro = ctx.createLinearGradient(0, -45, 0, -5); nitro.addColorStop(0, NITRO); nitro.addColorStop(1, BOOST);
    if (fl > 0) for (const [w, c, len] of [[7, NITRO, 50], [4.5, BOOST, 34], [2, '#fff', 16]]) { // flame: purple, pink, white-hot core
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-21 - w, -5); ctx.quadraticCurveTo(-21, -5 + len * fl * 1.6, -21 + w, -5); ctx.fill(); if (c === NITRO) ctx.stroke();
    }
    ctx.fillStyle = NITRO; path([[-29, -14], [-36, -4], [-29, -7]]); ctx.fill(); ctx.stroke(); path([[-13, -14], [-6, -4], [-13, -7]]); ctx.fill(); ctx.stroke(); // fins
    rbox(-21, -25, 17, 40, 8, nitro, 2);
    ctx.save(); ctx.translate(-21, -19); ctx.scale(face, 1); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#fff'; ctx.font = 'italic 800 8px ui-sans-serif, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NITRO', 0, 0.5); ctx.restore(); // lettering kept below the head's overhang, and unmirrored facing left
  }
  const arm = pair(pose.arm), swing = pair(pose.arms), reach = Array.isArray(pose.reach) ? pose.reach : [0, pose.reach || 0], ears = pair(pose.ears), feet = [pose.legs?.[0] || [0, 0], pose.legs?.[3] || [0, 0]];
  for (const [i, lx] of [-6, 6].entries()) { const [dx, dy] = feet[i]; rbox(lx + dx, -8 + dy / 2, 7, 12 + dy, 3.5, WUMPUS, 2); rbox(lx + 1 + dx, -3 + dy, 11, 6, 3, WUMPUS, 2); } // legs + feet
  for (const [i, s] of [-1, 1].entries()) if (!reach[i]) { // stubby arms, behind the body, swinging from the shoulder
    ctx.save(); ctx.translate(s * 11, -27 + arm[i]); ctx.rotate(-s * swing[i]); rbox(s, 5, 6, 12, 3, WUMPUS, 2); ctx.restore();
  }
  rbox(0, -23, 22, 24, 10, WUMPUS); // bean body
  for (const i of [0, 1]) if (reach[i]) { const w = Math.max(6, 10 + reach[i]); rbox(3 + w / 2, -24 - 3 * (1 - i) + arm[i], w, 7, 3.5, WUMPUS, 2); } // punching paws
  for (const [i, s] of [-1, 1].entries()) { // ears, behind the head, swinging from where they join it
    ctx.save(); ctx.translate(s * 26, -56); ctx.rotate(-s * ears[i]); ctx.translate(-s * 26, 56);
    rbox(s * 27, -47, 12, 22, 6, WUMPUS); rbox(s * 27.5, -47, 6, 14, 3, WUMPUS_LIT, 1.4); ctx.restore();
  }
  rbox(0, -49, 50, 34, 12, WUMPUS); // head

  // face, nudged toward facing: a pale snout with two nostrils, happy closed eyes either side above it
  rbox(4, -46, 20, 15, 6, WUMPUS_LIT, 2);
  ctx.fillStyle = WUMPUS_INK;
  for (const nx of [0, 8]) { ctx.beginPath(); ctx.roundRect(nx - 2, -46, 4, 2.4, 1.2); ctx.fill(); }
  ctx.lineWidth = 2;
  if (pose.squint) for (const [ex, d] of [[-12, 1], [19, -1]]) { ctx.beginPath(); ctx.moveTo(ex - 3 * d, -57); ctx.lineTo(ex + 2.5 * d, -53.5); ctx.lineTo(ex - 3 * d, -50); ctx.stroke(); } // squeezed shut > <
  else for (const ex of [-12, 19]) { ctx.beginPath(); ctx.arc(ex, -53, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  if (pose.dnd) { // status: Do Not Disturb, a red dot with a white bar
    ctx.globalAlpha = a0 * pose.dnd; ctx.fillStyle = PAPER; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(22, -34, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = DND; ctx.beginPath(); ctx.arc(22, -34, 4.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = PAPER; ctx.fillRect(19.5, -35, 5, 2); ctx.globalAlpha = a0;
  }
  if (pose.invisible) { // the status dot at the corner, like on an avatar: grey, hollow
    ctx.globalAlpha = a0 * pose.invisible; ctx.fillStyle = PAPER; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(22, -34, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#80848e'; ctx.beginPath(); ctx.arc(22, -34, 4.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(22, -34, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a0 * (1 - 0.65 * pose.invisible);
  }
  if (pose.shout) { ctx.fillStyle = WUMPUS_INK; ctx.beginPath(); ctx.ellipse(5, -36.5, 5, 3.4 * pose.shout, 0, 0, Math.PI * 2); ctx.fill(); } // mouth open under the snout
  if (pose.headphones) { // deafened: headphones clamped over the ears, with Discord's red slash through them
    ctx.save(); ctx.globalAlpha *= pose.headphones; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -52, 27, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    for (const s of [-1, 1]) rbox(s * 26, -50, 10, 17, 4, '#4e5058', 2);
    ctx.strokeStyle = PIN; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-18, -80); ctx.lineTo(18, -62); ctx.stroke(); ctx.restore();
  }
  ctx.restore();

  if (!pose.emoji && pose.rings == null && !pose.pin && !pose.horn && !pose.nelly && !pose.waves && !pose.trail && !pose.muted && !pose.dnd && pose.dndBurst == null) return;
  ctx.save(); ctx.translate(cx + (pose.x || 0) * face, bottom + (pose.y || 0)); ctx.scale(face, 1);
  ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  if (pose.emoji) {
    const [x, y, r, b = 0, kind = 0] = pose.emoji, e = EMOJIS[kind];
    if (b) sparkles(x, y, r * (1.2 + 1.6 * b), 1 - b, e.sparkle);
    if (b < 1 && r > 0.5) {
      ctx.save(); ctx.globalAlpha *= 1 - b; ctx.translate(x, y); ctx.scale(1 + 0.4 * b, 1 + 0.4 * b);
      ctx.fillStyle = e.fill; ctx.lineWidth = 2.4; if (e.head) e.head(r); else { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); } ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2; e.face(r); ctx.restore();
    }
  }
  if (pose.rings != null) { // voice rings pulsing up off the head, widening and fading as they rise
    ctx.save(); ctx.strokeStyle = SPEAK; ctx.lineWidth = 3.5;
    for (let k = 0; k < 3; k++) { const u = Math.min(1, Math.max(0, pose.rings * 1.5 - k * 0.25)); if (!u || u >= 1) continue;
      ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.ellipse(0, -74 - 80 * u, 22 + 18 * u, 7 + 4 * u, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.fillStyle = SPEAK; ctx.strokeStyle = INK;
    for (const [word, delay, dx] of [['HELLO?', 0, -14], ['CAN YOU HEAR ME?', 0.22, 12], ['!!!', 0.45, -4]]) { // the shouting, flying up the column
      const u = Math.min(1, Math.max(0, pose.rings * 1.4 - delay)); if (!u || u >= 1) continue;
      ctx.globalAlpha = Math.min(1, 6 * u, 2 * (1 - u)); ctx.font = `800 ${Math.round(10 + 5 * u)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.save(); ctx.translate(dx * (1 + u), -84 - 95 * u); ctx.rotate(dx > 0 ? 0.08 : -0.08); ctx.scale(face, 1); ctx.lineWidth = 3; ctx.strokeText(word, 0, 0); ctx.fillText(word, 0, 0); ctx.restore(); // unmirrored facing left
    }
    ctx.restore();
  }
  if (pose.pin) drawPin(...pose.pin);
  if (pose.horn) drawHorn(...pose.horn);
  if (pose.dnd > 0.05) { // the DND disc, held up in front like a riot shield: shrinks, cracks and greys out as it wears
    const w = pose.wear || 0, r = 30 * pose.dnd * (0.75 + 0.25 * (1 - w)), g = Math.round(0x80 * w * 0.7);
    ctx.save(); ctx.translate(22, -40); ctx.globalAlpha *= 0.92;
    ctx.fillStyle = `rgb(${242 - g}, ${63 + g}, ${67 + g})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-r * 0.55, -r * 0.14, r * 1.1, r * 0.28, r * 0.12); ctx.fill(); // the bar
    ctx.lineWidth = 1.6; for (let k = 0; k < Math.floor(w * 5); k++) { const a = k * 2.1 + 0.4; ctx.beginPath(); ctx.moveTo(0.15 * r * Math.cos(a), 0.15 * r * Math.sin(a)); // cracks spreading from the middle
      ctx.lineTo(0.55 * r * Math.cos(a + 0.25), 0.55 * r * Math.sin(a + 0.25)); ctx.lineTo(0.95 * r * Math.cos(a - 0.1), 0.95 * r * Math.sin(a - 0.1)); ctx.stroke(); }
    ctx.restore();
  }
  if (pose.dndBurst != null) { // the disc bursting into red shards that fly out, spin and fade
    const t = pose.dndBurst; ctx.save(); ctx.globalAlpha *= 1 - t; ctx.fillStyle = DND; ctx.lineWidth = 1.4;
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.3, d = 10 + 70 * t; ctx.save(); ctx.translate(22 + Math.cos(a) * d, -40 + Math.sin(a) * d + 60 * t * t); ctx.rotate(a + t * 6);
      path([[-6, -4], [7, -2], [-1, 6]]); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  if (pose.muted) { // Discord's muted mic: capsule on a stand, red slash through it
    ctx.save(); ctx.globalAlpha *= pose.muted; ctx.translate(0, -108); ctx.lineWidth = 2;
    rbox(0, -4, 9, 15, 4.5, '#e3e5e8', 2); ctx.beginPath(); ctx.arc(0, -2, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.moveTo(0, 6); ctx.lineTo(0, 10); ctx.moveTo(-5, 10); ctx.lineTo(5, 10); ctx.stroke();
    ctx.strokeStyle = PIN; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(10, 8); ctx.stroke(); ctx.restore();
  }
  if (pose.trail) { // Nitro sparkles pouring out under the tank, shrinking and fading the farther they fall behind
    const [a, ph] = pose.trail;
    for (let k = 0; k < 5; k++) { const u = (k + ph) % 5 / 5; ctx.save(); ctx.globalAlpha *= a * (1 - u); ctx.fillStyle = k % 2 ? BOOST : NITRO; ctx.lineWidth = 1.4; star(-21 + (k % 2 ? 7 : -7) * (1 - u * 0.5), 14 + 90 * u, 6 * (1 - u * 0.6)); ctx.restore(); }
  }
  if (pose.nelly) drawNelly(...pose.nelly, 1);
  if (pose.waves) { // sound rings off the head
    const w = pose.waves; ctx.save(); ctx.globalAlpha *= 1 - w; ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) { const rr = 22 + (40 + 16 * k) * w; ctx.beginPath(); ctx.arc(0, -46, rr, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}

// a red pushpin with its point at (x, y), size sz (also drawn stuck in a target the down smash pinned, by the game)
function drawPin(x, y, sz, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = 2.2; ctx.strokeStyle = '#9aa0a6'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -1.1 * sz); ctx.stroke(); ctx.strokeStyle = INK; // needle
  rbox(0, -1.15 * sz, 1.3 * sz, 0.28 * sz, 0.12 * sz, PIN, 2); // collar
  rbox(0, -1.45 * sz, 0.7 * sz, 0.45 * sz, 0.12 * sz, PIN, 2); // stem
  ctx.fillStyle = PIN; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, -1.85 * sz, 0.6 * sz, 0.32 * sz, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // head
  ctx.restore();
}

// Airhorn (neutral special): a can with a red horn flaring forward, centre (x, y), size k; blast = 0 … 1 sound rings pouring out of the bell
function drawHorn(x, y, k, blast) {
  if (k < 0.05) return;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round';
  if (blast != null) { // arcs fanning out of the bell, oldest farthest and faintest
    ctx.lineWidth = 3;
    for (let n = 0; n < 4; n++) { const u = (blast * 1.6 + n / 4) % 1, rr = 18 + 90 * u; ctx.globalAlpha = (1 - u) * Math.min(1, (1 - blast) * 3); ctx.beginPath(); ctx.arc(10 * k, 0, rr, -0.5, 0.5); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  ctx.scale(k, k);
  rbox(-8, 6, 13, 22, 4, '#e3e5e8', 2); rbox(-8, 6, 13, 6, 1, PIN, 1.4); rbox(-8, -6.5, 7, 4, 1.5, '#4e5058', 1.6); // can, label band, nozzle button
  ctx.fillStyle = PIN; ctx.lineWidth = 2; path([[-4, -3], [14, -9], [16, 5], [-4, 1]]); ctx.fill(); ctx.stroke(); // the horn, flaring out to…
  ctx.beginPath(); ctx.ellipse(15, -2, 3.2, 8, 0.12, 0, Math.PI * 2); ctx.fillStyle = '#b8232a'; ctx.fill(); ctx.stroke(); // …the bell
  ctx.restore();
}

// Nelly, Discord's snail (side special), bottom-centre (x, y), crawling toward face; t = seconds, for the crawl
function drawNelly(x, y, t = 0, face = 1) {
  const c = Math.sin(t * 9); // body stretches and bunches as it crawls
  ctx.save(); ctx.translate(x, y); ctx.scale(face, 1); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = 2;
  ctx.fillStyle = '#ffd89e'; ctx.beginPath(); ctx.moveTo(-15 - c, 0); ctx.quadraticCurveTo(-4, -9, 8, -8); ctx.quadraticCurveTo(13 + c, -20, 17 + c, -14); // body, head up at the front
  ctx.quadraticCurveTo(20 + c, -6, 15 + c, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const [ex, ey] of [[14, -23], [19, -21]]) { ctx.beginPath(); ctx.moveTo(15 + c, -15); ctx.lineTo(ex + c, ey); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + c, ey, 1.8, 0, Math.PI * 2); ctx.fill(); } // eye stalks
  ctx.fillStyle = '#eb459e'; ctx.beginPath(); ctx.arc(-3, -13, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // shell
  ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * Math.PI * 3.2, rr = 7.5 * (1 - k / 28); k ? ctx.lineTo(-3 + Math.cos(a) * rr, -13 + Math.sin(a) * rr) : ctx.moveTo(-3 + rr, -13); } ctx.stroke(); // spiral
  ctx.restore();
}

// the forward smash's emojis, drawn centred on (0, 0) at radius r: face draws over the filled, outlined head (a circle, or the path head builds)
const grin = (r, top = 0.12) => { ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-0.5 * r, top * r); ctx.quadraticCurveTo(0, 0.95 * r, 0.5 * r, top * r); ctx.closePath(); ctx.fill(); };
const happyEyes = r => { for (const ex of [-0.35, 0.35]) { ctx.beginPath(); ctx.arc(ex * r, -0.18 * r, 0.16 * r, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } };
function heart(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s); ctx.bezierCurveTo(x - 1.6 * s, y - 0.1 * s, x - 0.7 * s, y - 1.1 * s, x, y - 0.35 * s); ctx.bezierCurveTo(x + 0.7 * s, y - 1.1 * s, x + 1.6 * s, y - 0.1 * s, x, y + s); ctx.fill(); ctx.stroke(); }
const EMOJIS = [
  { fill: '#ffcc4d', sparkle: '#ffcc4d', face: r => { happyEyes(r); grin(r); } }, // 😄
  { fill: '#ffcc4d', sparkle: '#5dadec', face: r => { // 😂 tears of joy
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 0.35 * r, -0.12 * r, 0.16 * r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    grin(r, 0.1); ctx.fillStyle = '#5dadec'; ctx.lineWidth = 1.6;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 0.66 * r, -0.02 * r, 0.12 * r, 0.26 * r, -s * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  } },
  { fill: '#eceae6', sparkle: '#eceae6', face: r => { // 💀
    ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 0.34 * r, -0.12 * r, 0.22 * r, 0.25 * r, 0, 0, Math.PI * 2); ctx.fill(); }
    path([[0, 0.14 * r], [-0.1 * r, 0.32 * r], [0.1 * r, 0.32 * r]]); ctx.fill(); // nose
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-0.38 * r, 0.56 * r); ctx.lineTo(0.38 * r, 0.56 * r);
    for (const tx of [-0.19, 0, 0.19]) { ctx.moveTo(tx * r, 0.46 * r); ctx.lineTo(tx * r, 0.68 * r); } ctx.stroke(); // teeth
  } },
  { fill: '#ffcc4d', sparkle: '#ed4245', face: r => { // 😍
    ctx.fillStyle = '#ed4245'; ctx.lineWidth = 1.6; for (const s of [-1, 1]) heart(s * 0.36 * r, -0.2 * r, 0.2 * r);
    ctx.lineWidth = 2; grin(r, 0.2);
  } },
  { fill: PEPE, sparkle: PEPE, // sad Pepe (feelsbadman), three-quarter view facing the target
    head: r => smooth(scaled(r, [[-0.8, 0.74], [-0.98, 0.2], [-0.93, -0.35], [-0.72, -0.8], [-0.4, -1], [-0.08, -0.92], [0.05, -0.8],
      [0.2, -0.96], [0.55, -1], [0.86, -0.8], [1.02, -0.42], [1, 0.12], [0.92, 0.58], [0.62, 0.86], [0.1, 0.96], [-0.45, 0.9]])),
    face: r => {
      const at = (x, y) => [x * r, y * r], stroke = (w, ...curves) => { ctx.lineWidth = w; ctx.beginPath(); for (const [a, c, b] of curves) { ctx.moveTo(...at(...a)); ctx.quadraticCurveTo(...at(...c), ...at(...b)); } ctx.stroke(); };
      stroke(1.2, [[-0.66, -0.72], [-0.42, -0.84], [-0.16, -0.74]], [[0.2, -0.74], [0.46, -0.86], [0.74, -0.74]]); // brow hump creases
      stroke(1.4, [[-0.7, -0.44], [-0.36, -0.62], [-0.04, -0.54]], [[0.12, -0.54], [0.46, -0.64], [0.82, -0.44]]); // worried brows, high in the middle
      for (const [ex, ey, px, lid] of [[-0.32, -0.2, -0.26, [[-0.66, -0.16], [-0.3, -0.42], [0.0, -0.34]]], [0.44, -0.2, 0.48, [[0.12, -0.34], [0.46, -0.42], [0.78, -0.16]]]]) {
        const [cx, cy] = at(ex, ey);
        ctx.fillStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, cy, 0.32 * r, 0.26 * r, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(...at(px, -0.1), 0.14 * r, 0, Math.PI * 2); ctx.fill(); // big wet pupils
        ctx.fillStyle = '#fff'; for (const [dx, dy, g] of [[0.05, -0.05, 0.05], [-0.05, 0.05, 0.022]]) { ctx.beginPath(); ctx.arc(...at(px + dx, -0.1 + dy), g * r, 0, Math.PI * 2); ctx.fill(); }
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, 0.32 * r, 0.26 * r, 0, 0, Math.PI * 2); ctx.clip(); // heavy lid drooping over the top, lowest at the outer corner
        ctx.fillStyle = PEPE; ctx.beginPath(); ctx.moveTo(...at(lid[0][0] - 0.2, -0.6)); ctx.lineTo(...at(lid[0][0] - 0.2, lid[0][1]));
        ctx.lineTo(...at(...lid[0])); ctx.quadraticCurveTo(...at(...lid[1]), ...at(...lid[2])); ctx.lineTo(...at(lid[2][0] + 0.2, lid[2][1])); ctx.lineTo(...at(lid[2][0] + 0.2, -0.6)); ctx.fill(); ctx.restore();
        ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(...at(...lid[0])); ctx.quadraticCurveTo(...at(...lid[1]), ...at(...lid[2])); ctx.stroke();
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, cy, 0.32 * r, 0.26 * r, 0, 0, Math.PI * 2); ctx.stroke();
      }
      stroke(1.1, [[-0.6, 0.12], [-0.32, 0.22], [-0.06, 0.1]], [[0.18, 0.1], [0.46, 0.22], [0.76, 0.1]]); // bags under the eyes
      ctx.fillStyle = '#b5532f'; ctx.lineWidth = 2; ctx.beginPath(); // the pout: a fat frowning lip, drooping at the far corner
      ctx.moveTo(...at(-0.66, 0.52)); ctx.quadraticCurveTo(...at(0.0, 0.2), ...at(0.9, 0.32)); ctx.quadraticCurveTo(...at(1.1, 0.5), ...at(0.92, 0.7));
      ctx.quadraticCurveTo(...at(0.3, 0.8), ...at(-0.66, 0.52)); ctx.fill(); ctx.stroke();
      stroke(1.4, [[-0.6, 0.52], [0.2, 0.46], [0.98, 0.52]]); // where the lips meet
    } },
];

// a closed curve rounding through pts (it passes through their midpoints, bending toward each point)
function smooth(pts) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = pts.length;
  ctx.beginPath(); ctx.moveTo(...mid(pts[n - 1], pts[0]));
  pts.forEach((p, i) => ctx.quadraticCurveTo(...p, ...mid(p, pts[(i + 1) % n])));
  ctx.closePath();
}
const scaled = (r, pts) => pts.map(([x, y]) => [x * r, y * r]);

// a super-reaction burst: little four-point sparkles flying out on a ring of radius r
function sparkles(x, y, r, alpha, fill) {
  ctx.save(); ctx.globalAlpha *= Math.max(0, alpha); ctx.fillStyle = fill; ctx.lineWidth = 1.6;
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2; star(x + Math.cos(a) * r, y + Math.sin(a) * r, k % 2 ? 4 : 6); }
  ctx.restore();
}
function star(x, y, s) { // one four-point sparkle, in the current fill
  ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.3, y - s * 0.3); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.3, y + s * 0.3);
  ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.3, y + s * 0.3); ctx.lineTo(x - s, y); ctx.lineTo(x - s * 0.3, y - s * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
}
