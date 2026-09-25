// CPU players. A CPU's brain plays its fighter by working that fighter's controls every frame: the same keys and presses P1's keyboard
// makes (press), put straight into its globals (index.html's use() has them in while it thinks). It reads the frame data and hitboxes
// of every move and sketches where both fighters will be over the next second, so it knows which of its moves would connect and when,
// what's about to hit it, and how long its foe is stuck; with that it recovers (each fighter its own way: tether, warp, rocket,
// staircase, flaps…), blocks / dodges / beats what's coming, punishes, follows up, zones and edge-guards.
// Levels differ in how late they register what the foe does (react, frames), how far off they judge reach (slop, px), how far they
// wander from the best choice (noise) and how often they bother with each habit (the chances)
const { cpuBrain, cpuStep } = (() => { // (its own scope: only these two are the page's)
const CPU_LEVELS = [
  { name: 'beginner', react: 40, slop: 40, noise: 16, act: 0.02, block: 0.02, tech: 0, combo: 0, guard: 0, zone: 0.05, buff: 0.05, jumpIn: 0.05, idle: 0.8, hang: [90, 220], mash: 20, early: 1, ff: 0, recover: 0.6 },
  { name: 'easy', react: 28, slop: 24, noise: 10, act: 0.07, block: 0.1, tech: 0.05, combo: 0.1, guard: 0, zone: 0.2, buff: 0.1, jumpIn: 0.15, idle: 0.55, hang: [50, 150], mash: 12, early: 0.9, ff: 0, recover: 0.7 },
  { name: 'casual', react: 21, slop: 15, noise: 7, act: 0.22, block: 0.25, tech: 0.2, combo: 0.3, guard: 0.15, zone: 0.3, buff: 0.3, jumpIn: 0.4, idle: 0.35, hang: [25, 110], mash: 8, early: 0.7, ff: 0.15, recover: 0.82 },
  { name: 'medium', react: 14, predict: true, slop: 7, noise: 4, act: 0.45, block: 0.45, tech: 0.45, combo: 0.5, guard: 0.35, zone: 0.45, buff: 0.5, jumpIn: 0.7, idle: 0.15, hang: [12, 70], mash: 5, early: 0.5, ff: 0.4, recover: 0.93 },
  { name: 'skilled', react: 11, predict: true, slop: 5, noise: 3, act: 0.62, block: 0.58, tech: 0.62, combo: 0.65, guard: 0.5, zone: 0.52, buff: 0.62, jumpIn: 0.8, idle: 0.1, hang: [9, 62], mash: 4, early: 0.4, ff: 0.55, recover: 0.96 },
  { name: 'hard', react: 9, predict: true, slop: 3, noise: 2, act: 0.8, block: 0.7, tech: 0.8, combo: 0.8, guard: 0.65, zone: 0.6, buff: 0.75, jumpIn: 0.9, idle: 0.06, hang: [6, 55], mash: 3, early: 0.3, ff: 0.7, recover: 0.98,
    shieldy: 0.8, ledgeSmart: true },
  { name: 'AI trained', react: 4, predict: true, slop: 0, noise: 1, act: 1, block: 0.95, tech: 0.95, combo: 0.95, guard: 0.9, zone: 0.75, buff: 0.9, jumpIn: 1, idle: 0.02, hang: [2, 40], mash: 2, early: 0.15, ff: 0.9,
    slope: 12, risk: 0.6, shieldy: 0.9, high: true, ledgeSmart: true },
];
function cpuBrain(level) { return { V: CPU_LEVELS[level] ?? CPU_LEVELS[3], seen: [], moves: null, hold: 0, shieldT: 0, threat: null, styleT: 0 }; }

const FREE_AIR = ['air', 'djump', 'drop', 'ledgeDrop'];
const rand = (a, b) => a + Math.random() * (b - a), chance = p => Math.random() < p;
const midX = b => b.x + b.w / 2;
const near = (a, b, m = 0) => a.x < b.x + b.w + m && a.x + a.w > b.x - m && a.y < b.y + b.h + m && a.y + a.h > b.y - m;
const overStage = x => x > stage.x && x < stage.x + stage.w;

// this frame's controls: x = ← / → held, up / down / jump / special / heavy held, shield = dodge held (on the ground that's the shield);
// A H B Z G J = light, heavy, special, dodge, grab, jump pressed (buffered that many frames); tilt = the light press is a tilt, dash /
// ff / drop = a double-tap, tech = a tech
function press(i = {}) {
  keys.left = i.x < 0; keys.right = i.x > 0; keys.up = !!i.up; keys.down = !!i.down; keys.jump = !!i.jump; keys.dodge = !!i.shield; keys.special = !!i.special; keys.heavy = !!i.heavy;
  if (i.A) { attackQ = i.A; tiltQ = !!i.tilt; }
  if (i.H) heavyQ = i.H; if (i.B) specialQ = i.B; if (i.Z) dodgeQ = i.Z; if (i.G) grabQ = i.G; if (i.J) jumpQ = i.J;
  if (i.dash) dashQ = true; if (i.ff) ffQ = true; if (i.drop) dropQ = true;
  if (i.tech && !techLock) { techQ = R.tech.window; techLock = R.tech.lockout; }
}

function cpuStep(c) {
  const B = c.brain, V = B.V, s = P.state;
  for (const k in keys) keys[k] = false;
  B.moves ||= catalog();
  const foe = c === human ? fighters.filter(f => f !== human).sort((a, b) => Math.abs(midX(a.P) - midX(P)) - Math.abs(midX(b.P) - midX(P)))[0] : human;
  if (!foe) return;
  B.seen.push(look(foe.P)); if (B.seen.length > 40) B.seen.shift();
  const o = B.o = present(B.seen[Math.max(0, B.seen.length - 1 - V.react)], V); // the foe as it has registered by now
  if (s === 'respawn') { B.dropAt ??= R.respawn.descend + rand(...V.hang); if (P.f > B.dropAt) { B.dropAt = null; press({ x: Math.sign(W / 2 - midX(P)) || 1 }); } return; } // step off the platform after a moment
  if (P.ledge) return onLedge(B, o);
  if (s === 'knockdown') return getUp(B, o);
  if (s === 'shieldBreak') { if (tick % V.mash === 0) P.f += 3; return; } // mashing out of it
  if (s === 'tumble' && (tech(B, o) || P.f < P.stun)) return;
  if (s === 'hitstun' || s === 'land' && P.f < 4) return;
  if (s === 'hold' || s === 'pummel') return throwIt(B, o);
  if (s === 'booklet') return booklet(B);
  if (s === 'tunnel') return press(Math.abs(midX(o) - midX(P)) < 22 || P.f > 80 ? { A: 1 } : { x: Math.sign(midX(o) - midX(P)) });
  if (s === 'ride') return press(cart && !cart.bag && cart.ground && !overStage(cart.x + cart.w / 2 + cart.face * (cart.w / 2 + 50)) ? { J: 1 } : {}); // hop out before it runs off
  if (FLY[s]) return rocket(B);
  if (charging(B, o)) return;
  if (s === 'squat') return press(B.hop || {});
  if (s in ATK && P.ground) return P.landed && (s === 'jab1' || s === 'jab2') && press({ A: 1 }); // mid-attack: finish a jab combo that's landing
  if (!P.ground && (!overStage(midX(P)) || P.y + P.h > stage.y + 2) || P.ground && P.on !== stage && !overStage(midX(P))) return recover(B, o); // off the stage (or under it)
  if (s === 'upSpecial' || s === 'specialFall' || s === 'airDodge' || s in AIR && !P.ground) return drift(B, o);
  fight(B, o);
}

// ---------- seeing ----------
const look = p => ({ x: p.x, y: p.y, w: p.w, h: p.h, vx: p.vx, vy: p.vy, state: p.state, f: p.f, face: p.face, ground: p.ground, on: p.on, dmg: p.dmg, stun: p.stun, lag: p.lag, shield: p.shield, held: p.held, inv: p.inv, fastFall: p.fastFall, ledge: p.ledge, grabbed: p.grabbed, chip: !!p.sticker?.chip, c: p.c, at: tick });
// a sighting brought up to now: its move's frames run on; where it'll be, if the brain thinks ahead (easy just goes by what it saw)
function present(o, V) {
  const age = tick - o.at, n = { ...o, f: o.f + age };
  if (age && V.predict) { const p = ahead(o, age); Object.assign(n, p[age]); }
  return n;
}
// the frames until a sighting can act again (0 = it can now): attacks to their cancel window, landings to the end of their lag…
function lagLeft(o) {
  const c = o.c, s = o.state, f = o.f, m = c.MOVES[s];
  if (o.grabbed) return 30;
  if (s === 'hitstun' || s === 'tumble') return Math.max(0, o.stun - f);
  if (s === 'landLag') return Math.max(0, o.lag - f);
  if (s === 'shieldBreak') return Math.max(0, c.SB.frames - f - 20); // (it mashes)
  if (s === 'knockdown') return Math.max(0, c.R.knockdown.bounce - f) + 6;
  if (s === 'getup' || s === 'tech') return Math.max(0, c.R[s].frames - f);
  if (DODGES.includes(s)) return Math.max(0, c.D[s].frames - f);
  if (s === 'airDodge') return Math.max(0, c.AD.frames - f);
  if (s === 'specialFall') return 20;
  if (s === 'squat' || s === 'land') return Math.max(0, 4 - f);
  if (s === 'ledgeGetup' || s === 'ledgeRoll') return Math.max(0, c.L[s].frames - f);
  if (s === 'hold' || s === 'pummel' || THROWS.includes(s)) return 10;
  if (m?.startup != null) {
    if (o.held && m.chargeAt != null && f >= m.chargeAt) return 0; // charging: it chooses when
    return Math.max(0, Math.ceil(m.startup + (m.active || 0) + (m.endlag || 0) * (1 - CANCEL) - f));
  }
  return 0;
}
// frames it can't be touched for, from now
function safeFor(o) {
  const c = o.c, s = o.state;
  if (s === 'ko' || s === 'respawn' || s === 'tunnel') return 99;
  if (o.inv > 0) return Math.ceil(o.inv * 60);
  const it = (c.L[s] || c.D[s] || c.R[s] || c.MOVES[s])?.intangible;
  return it && o.f < it[1] ? it[1] - o.f : 0;
}
// where a sighting will be over the next n frames: flung (drag, gravity, landing on what's under it), or carrying on as it was
function ahead(o, n) {
  const out = [], stun = o.state === 'hitstun' || o.state === 'tumble' ? Math.max(0, o.stun - o.f) : 0, still = o.ledge || o.grabbed || o.state === 'respawn';
  let { x, y, vx, vy, ground } = o;
  for (let t = 0; t <= n; t++) {
    out.push({ x, y });
    if (still) continue;
    if (ground) { vx -= Math.sign(vx) * Math.min(Math.abs(vx), (t < 10 && ['walk', 'dash', 'run'].includes(o.state) ? 0 : 1800) * STEP); x += vx * STEP; continue; }
    vy = Math.min(vy + G * STEP, o.fastFall ? 1500 : 950);
    if (t < stun) vx -= Math.sign(vx) * Math.min(Math.abs(vx), 250 * STEP);
    x += vx * STEP;
    const top = floorBetween(x, o.w, y + o.h, y + o.h + vy * STEP);
    if (vy > 0 && top != null) { y = top - o.h; vy = 0; ground = true; } else y += vy * STEP;
  }
  return out;
}
// the top of the stage or a platform the feet cross going from y0 down to y1 at x (null: none)
function floorBetween(x, w, y0, y1) {
  if (x + w > stage.x && x < stage.x + stage.w && y0 <= stage.y + 0.5 && y1 >= stage.y) return stage.y;
  for (const pl of plats) if (x + w > pl.x && x < pl.x + pl.w && y0 <= pl.y + 0.5 && y1 >= pl.y) return pl.y;
  return null;
}

// ---------- its own moves ----------
// what it can do, from its moves' data: ground attacks (and grabs), aerials, things it throws / sends out, its recovery tools
function catalog() {
  const ground = [], air = [], zone = [], sp = { neutralSpecial: {}, sideSpecial: { side: 1 }, upSpecial: { up: true }, downSpecial: { down: true } };
  const val = m => (m.finisher ? m.finisher.damage + m.damage * (Math.ceil(m.active / m.every) - 1) : Math.max(m.damage || 0, m.sweet?.damage || 0)) * (m.chargeMult ? 1.1 : 1);
  const G1 = (k, m, input, o = {}) => m?.hitbox && ground.push({ k, m, input, dmg: val(m), ...o });
  const g = { jab1: f => ({ A: 1, x: f }), forwardTilt: f => ({ A: 1, x: f, tilt: true }), upTilt: f => ({ A: 1, up: true, x: f }), downTilt: f => ({ A: 1, down: true, x: f }),
    forwardSmash: f => ({ H: 1, x: f }), upSmash: f => ({ H: 1, up: true, x: f }), downSmash: f => ({ H: 1, down: true, x: f }), grab: f => ({ G: 1, x: f }) };
  for (const [k, input] of Object.entries(g)) if (ATK[k] && fighter.set[k === 'grab' ? 'grabs' : k.endsWith('Smash') ? 'smashAttacks' : 'groundAttacks']) G1(k, ATK[k], input, { turn: true, run: /Smash$/.test(k) ? null : false, dmg: k === 'grab' ? 11 : val(ATK[k]) });
  if (fighter.set.groundAttacks) G1('dashAttack', ATK.dashAttack, () => ({ A: 1, x: P.face }), { run: true });
  if (fighter.set.grabs) G1('dashGrab', ATK.dashGrab, () => ({ G: 1, x: P.face }), { run: true, dmg: 11 });
  const a = { neutralAir: () => ({ A: 1 }), forwardAir: () => ({ A: 1, x: P.face }), backAir: () => ({ A: 1, x: -P.face }), upAir: () => ({ A: 1, up: true }), downAir: () => ({ A: 1, down: true }) };
  if (fighter.set.aerials) for (const [k, input] of Object.entries(a)) if (AIR[k]?.hitbox) air.push({ k, m: AIR[k], input, dmg: val(AIR[k]) });
  if (fighter.set.specials) for (const [k, d] of Object.entries(sp)) {
    const m = SP[k], st = m.state || k, input = f => ({ B: 1, up: d.up, down: d.down, x: d.side ? f : 0 });
    if (m.projectile || m.nelly || m.sub || m.toss || m.ride) zone.push({ k, m, st, input });
    else if (m.hitbox && !m.helpless && !m.launch && !m.flight && !m.warp && m.reach == null && !m.step && !m.counter && !(m.burst?.vy < 0) && !m.hearts) {
      if (ATK[st]) G1(st, m, input, { turn: !!d.side, run: null, special: k });
      if (AIR[st]) air.push({ k: st, m, input: () => input(P.face), dmg: val(m), special: k });
    }
    else if (m.hearts) { G1(st, m, input, { run: null, need: () => P.hearts > 0 }); air.push({ k: st, m, input: () => input(P.face), dmg: val(m), need: () => P.hearts > 0 }); }
  }
  return { ground, air, zone, counter: SP.downSpecial?.counter ? SP.downSpecial : null };
}
// the hitbox of move m on frame f, for a fighter w × h standing at x, y facing face (the move's lean included; null = none)
const LEAN = new Map();
function lean(m, f) {
  let a = LEAN.get(m); if (!a) LEAN.set(m, a = []);
  if (a[f] === undefined) { try { a[f] = m.anim(f, undefined, 0)?.x || 0; } catch (e) { a[f] = 0; } }
  return a[f];
}
function boxAt(m, f, x, y, w, h, face) {
  const hb = typeof m.hitbox === 'function' ? m.hitbox(f, 0) : m.hitbox; if (!hb) return null;
  const cx = x + w / 2, ox = lean(m, f);
  return { x: face > 0 ? cx + ox + hb.x : cx - ox - hb.x - hb.w, y: y + h + hb.y, w: hb.w, h: hb.h };
}
// the first frame from now (≥ tMin) move m, pressed `at` frames from now facing face, would catch the foe: my path mine, its path fp
function connects(m, at, face, mine, fp, o, tMin, slop) {
  for (let f = m.startup; f < m.startup + m.active; f++) {
    const t = at + f; if (t >= fp.length || t >= mine.length) return -1;
    const me = mine[t]; if (!me) return -1; // landed first
    if (t < tMin) continue;
    const hb = boxAt(m, f, me.x, me.y, P.w, P.h, face); if (!hb) return -1;
    if (near(hb, { x: fp[t].x, y: fp[t].y, w: o.w, h: o.h }, slop)) return t;
  }
  return -1;
}
// my path standing and doing move m facing face (its lunge, burst or dash included); null if it'd carry me off the stage
function groundPath(m, face) {
  const out = [], push = carry(m, face), on = P.on || stage; let x = P.x, vx = P.vx;
  for (let t = 0; t < 60; t++) {
    const p = push(t, vx, 0);
    if (m.step && t === m.startup) vx = face * Math.max(face * vx, m.step);
    if (p.vx != null) vx = p.vx; else vx -= Math.sign(vx) * Math.min(Math.abs(vx), (m === ATK.dashAttack ? 800 : ATK_FRICTION) * STEP);
    x += vx * STEP;
    if ((x + P.w / 2 < on.x || x + P.w / 2 > on.x + on.w) && on === stage) return null;
    out.push({ x, y: P.y });
  }
  return out;
}
// my path through the air holding d (a sketch of stepPlayer's physics): from now, or after a jump (squat first on the ground; jump =
// the launch speed) · frames after landing are null
function airPath(d, jump = 0, squat = false, n = 60) {
  const out = []; let x = P.x, y = P.y, vx = P.vx, vy = P.vy, t0 = squat ? 4 : 0, landed = false;
  for (let t = 0; t < n; t++) {
    if (landed) { out.push(null); continue; }
    if (t < t0) { vx -= Math.sign(vx) * Math.min(Math.abs(vx), 3600 * STEP); x += vx * STEP; out.push({ x, y }); continue; }
    if (t === t0 && jump) vy = -jump;
    const tx = d * RUN; vx += Math.sign(tx - vx) * Math.min(Math.abs(tx - vx), (d ? 2300 : 700) * STEP);
    vy = Math.min(vy + G * STEP, P.fastFall ? 1500 : 950);
    x += vx * STEP;
    const top = vy > 0 && floorBetween(x, P.w, y + P.h, y + P.h + vy * STEP);
    if (top) { landed = true; out.push(null); continue; }
    y += vy * STEP; out.push({ x, y });
  }
  return out;
}
// how a move carries its fighter frame by frame, t frames after it's pressed (stepPlayer's launch / burst / dash / climb); fall = that
// frame's gravity still goes on top
function carry(m, face) {
  const bu = m.burst, b0 = bu?.from ?? m.startup, dm = m.dash, end = m.startup + (m.active || 0) + (m.endlag || 0);
  return (t, vx, vy) => {
    let r = {};
    if (m.launch && t === m.startup) r = { vy: -m.launch, fall: true };
    if (dm && t === 0) r = { vy: Math.min(vy, -dm.pop) };
    if (dm && t >= dm.from && t < dm.to) r = { vx: face * dm.speed, vy: Math.min(vy + G * STEP, dm.fall) };
    if (bu && t >= b0 && t < b0 + bu.frames) r = { vx: bu.vx != null ? face * bu.vx : undefined, vy: bu.vy };
    if (bu && t === b0 + bu.frames) r = { vx: vx * (bu.keep ?? 1) };
    if (m.thrust && t >= m.startup && t < end) r = { vy: -m.thrust, vx: face * (m.drive || 0), fall: true };
    if (m.thrust && t === end) r = { vx: 0, vy: 0 };
    return { ...r, helpless: !!m.helpless && t >= end, g: m === US && !m.state ? US.gravity ?? 1 : 1 };
  };
}

// ---------- in the thick of it ----------
function fight(B, o) {
  const V = B.V, s = P.state, fp = ahead(o, 60), lag = lagLeft(o);
  const th = threat(B, o, fp);
  if (th && defend(B, th, o, fp)) return;
  if (tick < B.shieldT && s === 'shield') return press({ shield: true }); // holding it up through the hit
  const ready = P.ground ? ATTACK_FROM.includes(s) && !(s === 'land' && P.f < 4) : FREE_AIR.includes(s) || s === 'tumble';
  if (ready && o.state !== 'ko') {
    const best = bestMove(B, o, fp, lag);
    if (best && (chance(V.act) || lag > 12) && best.score > 0) return go(B, best);
  }
  if (ready && P.ground && zone(B, o, fp)) return;
  approach(B, o, fp, lag);
}
// every way it has of hitting the foe from here, scored; the best (or null)
function bestMove(B, o, fp, lag, offstage = false) {
  const V = B.V, M = B.moves, s = P.state, tMin = safeFor(o), opts = [], dx = midX(o) - midX(P), toward = Math.sign(dx) || P.face;
  if (o.state === 'respawn' || o.state === 'ko' || tMin >= 60) return null;
  const add = (e, t, at, input, cost = 0) => opts.push({ e, t, input, score: worth(B, e, t, o, fp, lag, input.x || P.face) - cost + (Math.random() - 0.5) * V.noise * 2 });
  if (P.ground && !offstage) {
    const running = s === 'dash' || s === 'run';
    for (const g of M.ground) {
      if (g.run != null && g.run !== running) continue;
      if (g.need && !g.need()) continue;
      if (g.m.bricks && P.studs < 1) continue;
      if (s === 'shield' && g.input(P.face).A) continue; // light out of a shield is a grab
      for (const face of g.turn && !running ? [P.face, -P.face] : [P.face]) {
        const mine = groundPath(g.m, face); if (!mine) continue;
        const t = connects(g.m, 0, face, mine, fp, o, tMin, V.slop); if (t >= 0) add(g, t, 0, g.input(face));
      }
    }
    if (chance(V.jumpIn) && !running) for (const full of [false, true]) for (const d of [toward, 0]) {
      const mine = airPath(d, full ? JUMP : HOP, true);
      for (const a of M.air) {
        if (a.need && !a.need()) continue;
        for (let j = 5; j < 34; j += 2) {
          const t = connects(a.m, j, P.face, mine, fp, o, tMin, V.slop);
          if (t >= 0) { const end = mine[Math.min(59, t + 10)]; add(a, t, j, { J: 1, jump: full, x: d }, 2 + (end && !overStage(end.x + P.w / 2) ? 12 * (1 - V.guard) : 0)); break; }
        }
      }
    }
  } else if (FREE_AIR.includes(s) || s === 'tumble') {
    for (const d of [toward, 0, -toward]) {
      const mine = airPath(d);
      for (const a of M.air) { if (a.need && !a.need()) continue; const t = connects(a.m, 0, P.face, mine, fp, o, tMin, V.slop); if (t >= 0) add(a, t, 0, { ...a.input(), x: a.input().x || d }); }
    }
    if (P.jumps > 0 && !offstage) for (const d of [toward, 0]) {
      const mine = airPath(d, fighter.flap || AIRJUMP);
      for (const a of M.air) for (let j = 1; j < 24; j += 2) { if (a.need && !a.need()) continue; const t = connects(a.m, j, P.face, mine, fp, o, tMin, V.slop); if (t >= 0) { add(a, t, j, { J: 1, x: d }, 4); break; } }
    }
  }
  let best = null; for (const op of opts) if (!best || op.score > best.score) best = op;
  return best;
}
// what a hit t frames away is worth: its damage (a KO far more), how sure it is to land (a foe stuck in lag can't dodge; a shield
// stops anything but a grab), less the time it takes and what whiffing it costs
function worth(B, e, t, o, fp, lag, face) {
  const m = e.m, grab = !!m.grab;
  let p = t <= lag ? 1 : o.state === 'shield' ? (grab ? 0.9 : 0.12) : Math.max(0.1, Math.min(0.95, 1.15 - (t - lag) / (B.V.slope ?? 22)));
  if (grab && !o.ground) p *= 0.3;
  let v = e.dmg;
  if (!grab && m.kb) { const at = fp[Math.min(t, fp.length - 1)]; if (kills(o, m.kb, e.dmg, m.both ? Math.sign(midX(o) - midX(P)) || face : face, at)) v += 45 + o.dmg * 0.1; }
  if (grab) v += o.dmg > 90 ? 12 : 3;
  if (m.kb && m.kb.angle > 60 && m.kb.angle < 120 && o.dmg < 70) v += 3 * B.V.combo; // pops it up to follow
  return p * v - (1 - p) * ((m.endlag || 0) + (m.landingLag || 0) * 0.5) * (B.V.risk ?? 0.35) - t * 0.35;
}
// would knockback kb (with dmg on top of what it has) send a foe at `at` out of the blast zone before it can act and drift back?
function kills(o, kb, dmg, dir, at) {
  const k = kb.base + kb.growth * (o.dmg + dmg) / 100, a = kb.angle * Math.PI / 180, stun = Math.round(k * o.c.R.hitstun.perKb);
  let vx = dir * k * KB * Math.cos(a), vy = -k * KB * Math.sin(a), x = at.x + o.w / 2, y = at.y + o.h / 2;
  for (let t = 0; t < stun + 20; t++) {
    vy = Math.min(vy + G * STEP, 950);
    if (t < stun) vx -= Math.sign(vx) * Math.min(Math.abs(vx), 250 * STEP); else vx -= dir * 2300 * STEP; // then it drifts back in
    x += vx * STEP; y += vy * STEP;
    if (x < BLAST.l || x > BLAST.r || y < BLAST.t || y > BLAST.b) return true;
    if (t >= stun && Math.sign(vx) !== dir) return false;
  }
  return false;
}
// go with an option: its presses now (a jump's aerial comes when the air search finds it); maybe charge a smash on a sure thing
function go(B, op) {
  B.hop = op.input.J ? { jump: op.input.jump, x: op.input.x } : null;
  const m = op.e.m;
  B.hold = m.chargeAt != null && op.input.H ? tick + m.chargeAt + (lagLeft(B.o) > op.t + 12 ? Math.min(m.chargeFrames, lagLeft(B.o) - op.t - 4) : 0) : 0;
  press(op.input);
}

// ---------- what's coming ----------
// the soonest thing that would hit it where it's heading: the foe's attack, or anything it has out. { t frames, grab, id, len }
function threat(B, o, fp) {
  const V = B.V, c = o.c, m = c.MOVES[o.state], mine = airOrStand(), found = [];
  if (m?.hitbox && !o.grabbed && o.f >= 0) {
    const charging = o.held && m.chargeAt != null && o.f >= m.chargeAt, f0 = charging ? m.chargeAt : o.f;
    for (let f = Math.max(f0, m.startup); f < m.startup + m.active; f++) {
      const t = f - f0; if (t > 40) break;
      const at = fp[Math.min(t, 60)], hb = boxAt(m, f, at.x, at.y, o.w, o.h, o.face), me = mine[Math.min(t, 59)]; if (!hb) break;
      if (near(hb, { x: me.x, y: me.y, w: P.w, h: P.h }, 8)) { found.push({ t, grab: !!m.grab, id: o.state + (o.at - o.f), len: m.startup + m.active - f, dmg: m.damage || 0 }); break; }
    }
  }
  const seen = secs => secs * 60 >= V.react; // (out long enough to have registered)
  for (const sh of c.shots) if (seen(sh.t)) { const t = meets({ x: sh.x - sh.r, y: sh.y - sh.r, w: 2 * sh.r, h: 2 * sh.r }, sh.vx, sh.vy, (sh.pr.gravity || 0) * G, mine); if (t >= 0) found.push({ t, id: sh, len: 4, dmg: sh.m.damage || 5 }); }
  for (const r of c.rockets) if (seen(r.t)) { const t = meets({ x: r.x - 40, y: r.y - 30, w: 80, h: 60 }, r.dir * r.v, 0, 0, mine); if (t >= 0) found.push({ t, id: r, len: 4, dmg: 16 }); }
  for (const x of [c.thrown, c.sub, c.nelly, c.cart && !c.cart.done && c.cart]) if (x && !x.done) {
    const b = x.w ? x : { x: x.x - 12, y: x.y - 12, w: 24, h: 24 }, t = meets(b, x.vx || 0, x.vy || 0, 0, mine); if (t >= 0) found.push({ t, id: x, len: 6, dmg: 7 });
  }
  let first = null; for (const th of found) if (!first || th.t < first.t) first = th;
  return first && first.t <= 30 ? first : null;
}
// my path if I keep doing what I'm doing (standing still on the ground)
const airOrStand = () => P.ground ? Array.from({ length: 60 }, () => ({ x: P.x, y: P.y })) : airPath(0).map((p, i, a) => p || a.slice(0, i).reverse().find(Boolean) || { x: P.x, y: P.y });
// the first frame a box moving at vx, vy (gravity g) touches me on my path
function meets(b, vx, vy, g, mine) {
  let { x, y } = b;
  for (let t = 0; t < 40; t++) {
    const me = mine[Math.min(t, mine.length - 1)]; if (near({ x, y, w: b.w, h: b.h }, { x: me.x, y: me.y, w: P.w, h: P.h }, 6)) return t;
    vy += g * STEP; x += vx * STEP; y += vy * STEP;
  }
  return -1;
}
// meet a threat: beat it to the punch, counter it, shield it, dodge it, or get out of the way. A level only sees the chance to (block)
// so often; once it's decided about a threat it sticks to that
function defend(B, th, o, fp) {
  const V = B.V, s = P.state, ground = P.ground;
  if (B.threat?.id !== th.id) {
    B.threat = { id: th.id, how: 'none' };
    if (chance(V.block)) {
      const beat = bestMove(B, o, fp, lagLeft(o)), counter = B.moves.counter;
      if (beat && beat.t < th.t - 1 && beat.score > 2 && chance(V.beat ?? 0.6)) B.threat.how = 'beat';
      else if (counter && th.t >= counter.startup + 1 && th.t < counter.startup + counter.active - 2 && th.dmg >= 6 && chance(0.35)) B.threat.how = 'counter';
      else if (ground) B.threat.how = th.grab ? (th.t >= 3 ? 'spot' : 'jump') : P.shield > 0.4 && chance(V.shieldy ?? 0.75) ? 'shield' : th.t >= 3 && th.len < 14 ? 'spot' : 'roll';
      else B.threat.how = !P.airDodged && th.t >= 2 && th.len < 15 && chance(0.7) ? 'airdodge' : 'away';
    }
  }
  const away = -(Math.sign(midX(o) - midX(P)) || P.face);
  switch (B.threat.how) {
    case 'beat': { const b = bestMove(B, o, fp, lagLeft(o)); if (b && b.t < th.t) { go(B, b); return true; } return false; }
    case 'counter': if (!ATTACK_FROM.includes(s) && !FREE_AIR.includes(s)) return false; press({ B: 1, down: true }); B.threat.how = 'done'; return true;
    case 'shield': if (!ground) return false; B.shieldT = tick + th.t + th.len + 2; press({ shield: true }); return true;
    case 'spot': if (!ground || th.t > 6) return th.t > 6; press(s === 'shield' ? { shield: true, Z: 1 } : { Z: 1, down: true }); B.threat.how = 'done'; return true;
    case 'roll': if (!ground || th.t > 6) return th.t > 6; press({ Z: 1, x: overStage(midX(P) + away * 140) ? away : -away }); B.threat.how = 'done'; return true;
    case 'jump': if (!ground) return false; press({ J: 1, jump: true, x: away }); B.hop = { jump: true, x: away }; B.threat.how = 'done'; return true;
    case 'airdodge': if (th.t > 3) return true; press({ Z: 1, x: overStage(midX(P) + away * 120) ? away : 0 }); B.threat.how = 'done'; return true;
    case 'away': press({ x: overStage(midX(P) + away * 60) ? away : -away }); return true;
  }
  return false;
}

// ---------- getting around ----------
// when there's nothing to hit: walk / run / hop in (or keep just out of reach), chase a foe that's flying to where it'll land, go
// up to it on a platform or drop down through one, stand guard at the ledge while it recovers
function approach(B, o, fp, lag) {
  const V = B.V, s = P.state, me = midX(P), dir = Math.sign(midX(o) - me) || P.face, adx = Math.abs(midX(o) - me), dy = o.y + o.h - (P.y + P.h);
  if (tick >= B.styleT) { B.style = chance(V.idle) ? 'idle' : chance(V.rush ?? 0.45) ? 'rush' : chance(0.5) ? 'space' : 'hop'; B.styleT = tick + rand(30, 100); B.gap = rand(80, 150); }
  const off = !overStage(midX(o)) && !o.ground;
  let tx = midX(o);
  if (o.state === 'ko' || o.state === 'respawn') tx = W / 2 + (P.c === human ? 0 : (foes.indexOf(P.c) - 1) * 90); // wait for it in the middle
  else if (off) tx = midX(o) < W / 2 ? stage.x + (chance(V.guard) ? 45 : 150) : stage.x + stage.w - (chance(V.guard) ? 45 : 150); // guard the ledge it's coming back to
  else if (lag > 8 && chance(V.combo)) tx = fp[Math.min(lag, 30)].x + o.w / 2; // to where it'll come down
  else if (B.style === 'space') tx -= dir * B.gap;
  else if (B.style === 'idle') tx = me;
  const mate = fighters.find(f => f !== P.c && f !== human && P.c !== human && Math.abs(midX(f.P) - tx) < 60 && Math.abs(f.P.y - P.y) < 80);
  if (mate) tx += (midX(mate.P) < tx ? 1 : -1) * 75; // a teammate's there: come at it from beside them (or its other side)
  tx = Math.max(stage.x + 30, Math.min(stage.x + stage.w - 30, tx));
  const go = tx - me, gdir = Math.sign(go);
  if (!P.ground) {
    if (!off && o.ground && dy < -40 && P.jumps > 0 && P.vy > -100 && adx < 220) return press({ J: 1, x: dir }); // on up to it
    return press({ x: Math.abs(go) > 10 ? gdir : 0, ff: P.vy > -150 && P.vy < 600 && dy > 30 && chance(V.ff * 0.2) });
  }
  if (s === 'shield') return press({}); // lower it
  if (!off && o.ground && dy < -60 && adx < 180 && chance(0.06)) return jumpTo(B, true, dir); // up to it
  if (!off && dy > 50 && P.on !== stage && adx < 300 && chance(0.1)) return press({ drop: true }); // down through the platform
  if (B.style === 'hop' && !off && adx < 260 && adx > 60 && chance(0.05)) return jumpTo(B, false, dir);
  if (Math.abs(go) < 14) return press(P.face !== dir && adx < 400 && chance(0.2) ? { x: dir } : {}); // there: face it
  const edge = Math.min(me - stage.x, stage.x + stage.w - me) < 90;
  press({ x: gdir, dash: Math.abs(go) > 110 && !edge && s !== 'dash' && s !== 'run' && s !== 'skid' });
}
const jumpTo = (B, full, x) => { B.hop = { jump: full, x }; press({ J: 1, jump: full, x }); };
// in the air mid-move (or helpless): drift toward the foe over the stage, or back to it
function drift(B, o) {
  const me = midX(P), home = overStage(me) ? 0 : me < W / 2 ? 1 : -1;
  if (home && !P.ground) return press({ x: home });
  const to = Math.sign(midX(o) - me);
  press({ x: overStage(me + to * 80) ? to : 0 });
}
// projectiles and things it sends out, when the foe's at the right range for them (not all the time), and powering up when it's safe
function zone(B, o, fp) {
  const V = B.V, dx = midX(o) - midX(P), adx = Math.abs(dx), dir = Math.sign(dx) || P.face, level = Math.abs(o.y + o.h - (P.y + P.h)) < 50;
  const stop = midX(P) + Math.sign(P.vx) * P.vx * P.vx / (2 * ATK_FRICTION); if (P.on === stage && Math.min(stop - stage.x, stage.x + stage.w - stop) < 30) return false; // it'd slide off doing it
  if (buff(B, o, adx)) return true;
  if (!chance(V.zone * 0.06) || tick < (B.zoneT || 0)) return false;
  for (const z of B.moves.zone) {
    const m = z.m, pr = m.projectile;
    let ok = false;
    if (pr?.homing) ok = adx > 150 && adx < 600 && !shots.length;
    else if (pr) ok = adx > 140 && adx < (pr.speed || 600) * (pr.life || 1) * 0.9 && Math.abs(o.y + o.h / 2 - (P.y + P.h + (pr.y || -40))) < 60 + (pr.r || 12);
    else if (m.sub) ok = !sub && (m.sub.speed ? level && adx > 150 && adx < 520 : adx > 90 && adx < 260);
    else if (m.nelly) ok = !nelly && level && adx > 120 && adx < 420;
    else if (m.toss) ok = !thrown && level && adx > 60 && adx < 230;
    else if (m.ride) ok = !cart && level && adx > 90 && adx < 420 && P.on === stage && o.on === stage && chance(0.4);
    if (m.plant && o.chip) ok = true; // the chip's in: set it off (the zap)
    if (!ok) continue;
    if (z.k === 'neutralSpecial' && P.face !== dir) { press({ x: dir }); return true; } // turn to it first (a direction would make it the side special)
    B.zoneT = tick + rand(40, 120) / V.zone;
    const hold = m.chargeAt != null && (m.chargeKey || m.hold) && adx > 320 ? rand(10, m.chargeFrames) : 0;
    B.hold = hold ? tick + m.chargeAt + hold : 0;
    press({ ...z.input(dir), x: z.k === 'neutralSpecial' ? 0 : dir });
    return true;
  }
  return false;
}
// power-ups that need time (Claw'd's think, Android's fast charge, Lego Man's gold brick): only with the foe far off or out of it
function buff(B, o, adx) {
  const V = B.V, far = adx > 420 || o.state === 'respawn' || o.state === 'ko' || (!o.ground && !overStage(midX(o)) && adx > 250);
  if (!far || !chance(V.buff * 0.05)) return false;
  const nb = NEUTRAL_B;
  if (nb.startup == null && !nb.state && !nb.hearts && P.think < 3) { B.hold = tick + 400; press({ B: 1 }); return true; } // think (held)
  if (DOWN_B.charge && P.batt < 1) { B.hold = tick + 200; press({ B: 1, down: true }); return true; }
  if (nb.builds) { // the booklet: the gold brick if it can afford it and isn't glowing, else nothing
    const k = nb.builds.findIndex(b => b === 'goldBrick'); if (k < 0 || P.studs < MOVES.goldBrick.cost || P.gold > 0) return false;
    B.build = k; press({ B: 1 }); return true;
  }
  return false;
}
// keep holding a charge while it's worth it: a smash or charge special (to B.hold), think / fast charge (till the foe comes close)
function charging(B, o) {
  const s = P.state, m = MOVES[s];
  let key = null;
  if (m?.chargeAt != null && P.held) key = m.chargeKey || m.hold || 'heavy';
  else if (s === 'neutralSpecial' && NEUTRAL_B.startup == null && !NEUTRAL_B.state && !NEUTRAL_B.hearts || s === 'downSpecial' && DOWN_B.charge) {
    key = 'special';
    if (Math.abs(midX(o) - midX(P)) < 300 && o.state !== 'respawn' && o.state !== 'ko' || P.think >= 3 && s === 'neutralSpecial') B.hold = 0; // it's coming: stop
  }
  if (!key) return false;
  if (!P.ground && (!overStage(midX(P)) || P.y + P.h > stage.y + 2)) B.hold = 0; // off the stage: let it go and get back
  keys[key] = tick < B.hold;
  return true;
}
// Lego Man's booklet: flip to the build it wants (a fresh ↓ per page), then buy it
function booklet(B) {
  const k = P.bk;
  if (B.build == null || B.build < 0) return press({ Z: 1 }); // (didn't mean to: shut it)
  if (k.i !== B.build) return press({ down: tick % 2 === 0 });
  if (P.f >= MOVES.booklet.open) { B.build = null; press({ B: 1 }); }
}

// ---------- off the stage ----------
// get back: drift in; save the jump(s) for when they're needed (sooner at the lower levels); the up special when it would make it
// (each fighter's own: tether, warp, rocket, launch, staircase…); a side special that carries, or an air dodge, as a last push
function recover(B, o) {
  if (tick - (B.offT ?? -9) > 1) B.fumble = !chance(B.V.recover ?? 1); B.offT = tick; // (a fresh trip off the stage: does it keep its head?)
  const V = B.V, s = P.state, cx = midX(P), side = cx < stage.x + stage.w / 2 ? -1 : 1, home = -side, lx = side < 0 ? stage.x : stage.x + stage.w;
  const under = P.y + P.h > stage.y + 4 && side * (cx - lx) < P.w / 2; // tucked in under the lip: out sideways first
  const x = under ? side : home;
  if (P.ground) return press(chance(0.5) ? { J: 1, jump: true, x: home } : { x: home }); // on a Lego step out here: jump back
  const free = FREE_AIR.includes(s) || s === 'tumble';
  if (!free) return press({ x });
  // hitting a foe out here, if there's time (it keeps its jump for the way back)
  if (P.jumps > 0 && chance(V.guard) && Math.abs(cx - midX(o)) < 200 && P.y < stage.y + 60) {
    const b = bestMove(B, o, ahead(o, 60), lagLeft(o), true), m = b?.e.m;
    if (b && b.score > 5 && makes(x, { at: m.startup + m.active + (m.endlag || 0), vy: fighter.flap || AIRJUMP })) return go(B, b); // (and still get back after)
  }
  const glide = !!fighter.glide && P.vy > 0 && P.y + P.h < stage.y - 10;
  const jv = fighter.flap || AIRJUMP;
  const onto = V.high && o.ground && overStage(midX(o)) && Math.abs(midX(o) - lx) < 170 && makes(x, P.jumps > 0 ? { at: 0, vy: jv, onto: true } : { onto: true }); // it's waiting at the ledge: go over it, onto the stage
  if (makes(x, { glide, onto })) return press({ x, jump: glide });
  if (P.jumps > 0 && P.vy > (P.jumps > 1 ? 60 : -250)) { // (a flapper waits till it's falling again)
    if (!makes(x, { at: 8, vy: jv, onto }) || chance(V.early * 0.1) || P.y + P.h > stage.y + 30) return press({ J: 1, x }); // last good moment (or nerves)
    return press({ x });
  }
  if (P.jumps > 0) return press({ x }); // still rising from the last one
  if (B.fumble && P.y + P.h < stage.y + 120) return press({ x }); // panicking: leaves the up special too late
  const up = upSpecial(x, home);
  if (up) return press(up);
  const zip = sideZip(x, home);
  if (zip) return press(zip);
  if (!P.airDodged) for (const [dx, dy] of [[x, -1], [x, 0], [0, -1]]) { const n = Math.hypot(dx, dy); if (makes(x, { dodge: [dx / n, dy / n] })) return press({ Z: 1, x: dx, up: dy < 0 }); }
  if (P.vy > 200 && !P.usedB?.upSpecial && (US.launch || US.burst || US.warp || US.flight || US.step)) return press({ B: 1, up: true, x: home }); // long shot
  press({ x });
}
// can it get to the stage (land on it, or catch a ledge) from here, holding x? a sketch of the next frames. opts: glide (holding jump,
// if it can), at / vy = a jump that many frames from now, move = a move pressed now (how it carries: carry()), face, dodge = an air
// dodge that way now, from = start somewhere else, helpless, onto = only landing on it counts
function makes(x, opts = {}) {
  const push = opts.move && carry(opts.move, opts.face ?? x);
  let px = opts.from ? opts.from[0] : P.x, py = opts.from ? opts.from[1] : P.y, vx = opts.from ? 0 : P.vx, vy = opts.from ? 0 : P.vy, helpless = !!opts.helpless;
  for (let t = 0; t < 150; t++) {
    const p = push ? push(t, vx, vy) : {};
    if (p.helpless) helpless = true;
    if (opts.at === t) vy = -opts.vy;
    const tx = x * RUN * (helpless ? 0.6 : 1);
    if (p.vx != null) vx = p.vx; else vx += Math.sign(tx - vx) * Math.min(Math.abs(tx - vx), (x ? 2300 : 700) * STEP);
    if (p.vy != null) vy = p.vy + (p.fall ? G * STEP * (p.g ?? 1) : 0); else vy = Math.min(vy + G * STEP * (p.g ?? 1), 950);
    if (opts.glide && vy > fighter.glide && !helpless) vy = fighter.glide;
    if (opts.dodge && t <= AD.burst) { const k = t === AD.burst ? 0.4 : 1; vx = opts.dodge[0] * AD.speed * k; vy = opts.dodge[1] * AD.speed * k; } // an air dodge's burst
    px += vx * STEP;
    if (py + P.h > stage.y && py < stage.y + stage.h && px + P.w > stage.x && px < stage.x + stage.w) { px = px + P.w / 2 < stage.x + stage.w / 2 ? stage.x - P.w : stage.x + stage.w; vx = 0; } // its side
    const ny = py + vy * STEP;
    if (px + P.w > stage.x && px < stage.x + stage.w) {
      if (vy > 0 && py + P.h <= stage.y + 0.5 && ny + P.h >= stage.y) return true; // landed on it
      if (vy < 0 && py >= stage.y + stage.h && ny < stage.y + stage.h) { vy = 0; continue; } // bonked its underside
    }
    py = ny;
    const gap = px + P.w / 2 < stage.x + stage.w / 2 ? stage.x - (px + P.w) : px - (stage.x + stage.w);
    if (vy >= 0 && gap >= 0 && gap < 24 && py > stage.y - 40 && py < stage.y + 16 && !opts.onto && !(opts.dodge && t < AD.frames)) return true; // caught the ledge (not mid-dodge)
    if (py > stage.y + 360) return false;
  }
  return false;
}
// the up special if it'd get it back (or catch a ledge), as presses; null if not
function upSpecial(x, home) {
  const m = US;
  if (!fighter.set.specials || P.state !== 'air' && P.state !== 'djump' && P.state !== 'drop' && P.state !== 'ledgeDrop' && P.state !== 'tumble') return null;
  if (m.warp) for (const d of [home, 0]) { // Android: where the pin would land, then helpless from there
    const [ax, ay] = d ? [m.aim[0] * d, m.aim[1]] : [0, -1], wx = midX(P) + ax * m.reach; let wy = P.y + P.h + ay * m.reach;
    if (wx > stage.x - P.w / 2 && wx < stage.x + stage.w + P.w / 2 && wy > stage.y && wy < stage.y + stage.h) wy = stage.y;
    if (overStage(wx) && wy <= stage.y + 1 || makes(home, { from: [wx - P.w / 2, wy - P.h], helpless: true })) return { B: 1, up: true, x: d };
  }
  if (m.reach != null) return tether(home) ? { B: 1, up: true, x: home } : null;
  if (m.flight) return P.y + P.h > stage.y - 120 || Math.abs(midX(P) - (home > 0 ? stage.x : stage.x + stage.w)) > 200 ? { B: 1, up: true } : null;
  if (m.step && (P.studs < 1 || P.stairs)) return null;
  if (m.launch || m.burst || m.step) return makes(x, { move: m, face: home }) || (m.step && P.y + P.h < stage.y + 200) ? { B: 1, up: true, x: home } : null;
  return null;
}
// Claw'd's MCP cord: pressed toward the stage it goes out at aim[1]°; it catches the lip if that's within reach and near its line, or
// if the cord hits the wall under it
function tether(home) {
  const lx = home > 0 ? stage.x : stage.x + stage.w, ax = midX(P) + home * 40, ay = P.y + P.h - 25, reach = US.reach - 30;
  if (Math.hypot(lx - ax, stage.y - ay) > reach) return false;
  const a = Math.atan2(ay - stage.y, home * (lx - ax)), ang = US.aim[1] * Math.PI / 180;
  if (Math.abs(a - ang) <= (US.cone - 5) * Math.PI / 180) return true;
  const along = home * (lx - ax) / Math.cos(ang), wy = ay - Math.sin(ang) * along;
  return along > 0 && along < reach && wy > stage.y + 4 && wy < stage.y + stage.h;
}
// a side special that carries it a long way (Android's roll, Snoo's zip), if that would get it back
function sideZip(x, home) {
  for (const k of ['sideSpecial', 'downSpecial']) {
    const m = SP[k]; if (!m || !(m.dash || m.burst?.vx) || P.usedB?.[k]) continue;
    if (makes(x, { move: m, face: home })) return { B: 1, x: home, down: k === 'downSpecial' };
  }
  return null;
}
// Grok's rocket: charging, swing the aim toward a point over the ledge and let go with enough charge to get there; flying, steer
// for it (straight up first if the stage is in the way), and bail out once it's over the stage
function rocket(B) {
  const m = FLY[P.state], fl = m.flight, cx = midX(P), cy = P.y + P.h / 2, side = cx < stage.x + stage.w / 2 ? -1 : 1, lx = side < 0 ? stage.x : stage.x + stage.w;
  const tx = lx - side * 60, ty = stage.y - 70, blocked = P.y + P.h > stage.y - 10 && side * (cx - lx) < P.w / 2 + 30;
  const want = blocked ? side * 0.15 : Math.atan2(tx - cx, -(ty - cy));
  if (P.state !== m.state) { // charging
    const need = Math.min(m.chargeFrames, Math.max(8, (Math.hypot(tx - cx, ty - cy) * 60 / m.active * 1.15 - fl.speed[0]) / (fl.speed[1] - fl.speed[0]) * m.chargeFrames));
    const aimed = Math.abs(P.aim - Math.max(-fl.aimMax, Math.min(fl.aimMax, want))) < 0.08;
    return press({ special: !(aimed && P.chg >= need) && P.chg < m.chargeFrames + m.overheat - 10, x: aimed ? 0 : Math.sign(want - P.aim) });
  }
  if (overStage(cx) && Math.abs(cx - (stage.x + stage.w / 2)) < stage.w / 2 - 30 && P.y + P.h < stage.y - 20) return press({ B: 1 }); // over it: hop off
  const d = want - P.fly.ang;
  press({ x: Math.abs(d) > 0.05 ? Math.sign(d) : 0 });
}

// ---------- in someone's hands / on the floor / on the ledge ----------
// a few pummels (more for Grok's ratio), then the throw that KOs, else one to follow up on (low %) or toward the nearer edge
function throwIt(B, o) {
  if (P.state === 'pummel' || P.f < 4) return;
  const b = heldBag(); if (!b) return;
  B.pummels ??= GR.hold.ratio ? GR.hold.ratio.likes + 1 : Math.floor(rand(0, 3) * B.V.combo);
  if (B.pummels > 0 && P.holdT > 40) { B.pummels--; return press({ A: 1 }); }
  B.pummels = null;
  const at = { x: b.x, y: b.y }, opts = [['forwardThrow', { x: P.face }, P.face], ['backThrow', { x: -P.face }, -P.face], ['upThrow', { up: true }, P.face], ['downThrow', { down: true }, P.face]];
  const kill = opts.find(([k, , d]) => GR[k]?.kb && kills({ ...b, c: b.c || { R } }, GR[k].kb, GR[k].damage, d, at));
  const edge = midX(P) < W / 2 ? -1 : 1;
  const pick = kill || (chance(B.V.combo) && b.dmg < 70 ? opts[chance(0.5) ? 2 : 3] : opts[edge === P.face ? 0 : 1]);
  press(pick[1]);
}
// tech the landing out of a tumble (sometimes rolling away from the foe), when it's about to hit the floor
function tech(B, o) {
  if (P.f === 1 || B.techFor !== P.stun) { B.techFor = P.stun; B.techs = chance(B.V.tech); }
  if (!B.techs || P.vy <= 0) return;
  const next = floorBetween(P.x, P.w, P.y + P.h, P.y + P.h + P.vy * STEP * 3);
  if (next == null) return false;
  press({ tech: true, x: chance(0.5) ? -(Math.sign(midX(o) - midX(P)) || 1) : 0 });
  return true;
}
// knocked down: after a beat, get up in place, roll (away, or past the foe), or get up swinging if it's close
function getUp(B, o) {
  if (P.f < R.knockdown.bounce) return;
  B.upAt ??= tick + rand(0, 40) * (1.2 - B.V.tech);
  if (tick < B.upAt) return;
  B.upAt = null;
  const d = midX(o) - midX(P), away = -Math.sign(d) || 1, close = Math.abs(d) < 110;
  const r = Math.random();
  press(close && r < 0.35 ? { A: 1 } : r < 0.7 && overStage(midX(P) + away * 130) ? { x: away } : r < 0.85 && overStage(midX(P) - away * 130) ? { x: -away } : { up: true });
}
// on the ledge: hang a moment, then get up, roll in, jump up, attack, or drop and come back, weighed by where the foe is
function onLedge(B, o) {
  if (P.state !== 'ledgeHang') return;
  B.hangT ??= tick + rand(...B.V.hang);
  const lx = P.ledge < 0 ? stage.x : stage.x + stage.w, d = Math.abs(midX(o) - lx), close = d < 150 && o.ground, busy = lagLeft(o) > 10;
  const m = o.c.MOVES[o.state], swinging = B.V.ledgeSmart && close && m?.hitbox && (o.held || o.f < m.startup + m.active); // its hitbox is (or is about to be) out: let it whiff first
  if (swinging) return;
  if (tick < B.hangT && !(close && busy)) return;
  B.hangT = null;
  const r = Math.random();
  if (close && busy) return press(r < 0.5 ? { A: 1 } : { up: true }); // it's stuck: come up (swinging)
  if (close) return press(r < 0.4 ? { Z: 1 } : r < 0.75 ? { J: 1, jump: true } : r < 0.85 ? { A: 1 } : { up: true });
  press(r < 0.45 ? { up: true } : r < 0.7 ? { J: 1, jump: true } : r < 0.85 ? { Z: 1 } : { A: 1 });
}

return { cpuBrain, cpuStep };
})();
