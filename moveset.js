// Claw'd's moveset (drawn by clawd.js). Fill in values as each move gets built.
//
// input: which buttons trigger it (A = attack, B = special, Z = grab, S = shield; dirs are relative to facing)
// anim:  (frame, totalFrames) => pose — offsets from standing still (fields listed in clawd.js); any field can be left out.
//        null = not made yet. Preview every move on a loop in moves.html.
// frames: loop length in the preview for moves without frame data (defaults to 60)
// Attacks also have frame data (all counts at 60fps) and hitboxes:
//   startup = frames before the hitbox comes out, active = frames it stays out, endlag = frames until you can act again
//   damage  = % added to the target
//   kb      = knockback: base amount, growth with damage %, launch angle in degrees
//   hitbox  = { x, y, w, h } top-left offset from the character's bottom-center (up is negative y), facing right

// blend between keyframes [[frame, pose], …] with smoothstep easing; fields a key leaves out count as 0 (1 for sx/sy)
function tween(f, keys) {
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1][0]) i++;
  const [fa, a] = keys[i], [fb, b] = keys[i + 1];
  let t = Math.min(1, Math.max(0, (f - fa) / (fb - fa)));
  t = t * t * (3 - 2 * t);
  const mix = (p, q) => Array.isArray(p) || Array.isArray(q) // arm / legs arrays blend element by element
    ? (Array.isArray(p) ? p : q).map((_, k) => mix(Array.isArray(p) ? p[k] : p, Array.isArray(q) ? q[k] : q))
    : p + (q - p) * t;
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const d = k === 'sx' || k === 'sy' ? 1 : 0;
    out[k] = mix(a[k] ?? d, b[k] ?? d);
  }
  return out;
}

// shared leg poses (back to front)
const legsAll = (dx, dy) => [[dx, dy], [dx, dy], [dx, dy], [dx, dy]];
const TUCK = [[2, -3], [1, -3], [-1, -3], [-2, -3]]; // feet pulled up under the body
const REACH = legsAll(0, 2);                         // feet stretched down for the floor
const SQUAT = { sx: 1.2, sy: 0.72, arm: 2 };

// a whole jump for the preview: squat, spring, tuck at the peak, reach down, land squash. Only `air` differs by height.
const hop = (height, n) => f => {
  const up = 5, down = n - 7; // takeoff and touchdown frames
  const u = (f - up) / (down - up);
  return {
    ...tween(f, [
      [0, {}],
      [4, SQUAT],
      [up + 2, { sx: 0.86, sy: 1.22, arm: -3, legs: legsAll(-1, 1) }],
      [(up + down) / 2, { sx: 1.04, sy: 0.96, arm: -2, legs: TUCK }],
      [down - 1, { sx: 0.94, sy: 1.08, arm: -3, legs: REACH }],
      [down + 2, { sx: 1.2, sy: 0.74, arm: 2 }],
      [n, {}],
    ]),
    air: f > up && f < down ? -height * 4 * u * (1 - u) : 0,
    puff: f >= up && f < up + 10 ? (f - up) / 10 : f >= down ? (f - down) / 7 : null,
  };
};

const MOVESET = {
  movement: {
    idle: {
      input: 'none', frames: 120,
      anim: (f, n) => { // two slow breaths per loop, arms bob opposite the squash, one blink near the end
        const b = (1 - Math.cos(f / n * Math.PI * 4)) / 2;
        return { sx: 1 + 0.03 * b, sy: 1 - 0.05 * b, arm: 1.5 * b - 0.75, blink: f >= 100 && f < 106 ? 1 : 0 };
      },
    },
    walk: {
      input: 'left/right (tap)', frames: 40,
      anim: (f, n) => { // two-beat scuttle: legs 1+3 and 2+4 alternate, arms pump opposite, body bobs on each pass
        const p = f / n * Math.PI * 2;
        const y = -0.8 * (1 + Math.cos(2 * p));
        // foot swings forward while lifted, slides back while planted; -y keeps planted feet on the floor as the body bobs
        const foot = q => [3.5 * Math.sin(q), -3.5 * Math.max(0, Math.cos(q)) - y];
        const a = foot(p), b = foot(p + Math.PI);
        return {
          y, sy: 1 + 0.02 * Math.cos(2 * p), sx: 1 - 0.01 * Math.cos(2 * p),
          rot: 0.035 + 0.015 * Math.sin(2 * p),
          arm: [-1.5 * Math.sin(p), 1.5 * Math.sin(p)],
          legs: [a, b, a, b],
        };
      },
    },
    dash: {
      input: 'double-tap left/right', frames: 20,
      anim: f => ({ // crouch, burst forward and hold the stretch, then ease into the run's first frame (the game hands off at 16)
        ...tween(f, [
          [0, {}],
          [3, { x: -2, sx: 1.1, sy: 0.86, rot: -0.05, arm: 1 }],
          [6, { x: 8, y: -3, sx: 1.16, sy: 0.9, rot: 0.16, arm: [-4, 2], legs: [[-8, 3], [-6, 3], [6, -1], [8, 0]], speed: 1 }],
          [11, { x: 7, y: -3, sx: 1.13, sy: 0.91, rot: 0.15, arm: [-4, 2], legs: [[-7, 3], [-5, 3], [5, -1], [7, 0]], speed: 1 }],
          [16, { y: -3, sx: 1.03, sy: 0.98, rot: 0.12, legs: [[0, -2], [0, 3], [0, -2], [0, 3]], speed: 0.5 }], // = run frame 0
          [20, {}],
        ]),
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    run: {
      input: 'hold after dash', frames: 24,
      anim: (f, n) => { // walk cycle pushed harder: longer stride, higher knees, deep lean, a dust kick every step
        const p = f / n * Math.PI * 2, y = -1.5 * (1 + Math.cos(2 * p));
        const foot = q => [6 * Math.sin(q), -5 * Math.max(0, Math.cos(q)) - y];
        const a = foot(p), b = foot(p + Math.PI), kick = (f % (n / 2)) / 9;
        return {
          y, sx: 1.05 - 0.02 * Math.cos(2 * p), sy: 0.95 + 0.03 * Math.cos(2 * p),
          rot: 0.12 + 0.03 * Math.sin(2 * p),
          arm: [-3 * Math.sin(p), 3 * Math.sin(p)],
          legs: [a, b, a, b],
          speed: 0.5,
          dust: kick <= 1 ? kick : null,
        };
      },
    },
    skid: { // turnaround
      input: 'reverse while running', frames: 26,
      anim: f => ({ // dig in and lean back, slide to a stop, then flip around (sx goes negative = facing the other way)
        ...tween(f, [
          [0, { rot: 0.12, sx: 1.05, sy: 0.95, arm: [-2, 1], speed: 0.5 }],
          [4, { x: 4, rot: -0.2, sx: 1.1, sy: 0.88, arm: -4, legs: [[2, 0], [3, 0], [7, 0], [9, 0]] }],
          [13, { x: 10, rot: -0.16, sx: 1.08, sy: 0.9, arm: -3, legs: [[2, 0], [3, 0], [7, 0], [9, 0]] }],
          [17, { x: 10, sx: 0.15, sy: 1.05 }],
          [21, { x: 10, sx: -1.08, sy: 0.94 }],
          [26, { x: 10, sx: -1 }],
        ]),
        dustAhead: f >= 3 && f < 15 ? (f - 3) / 12 : null,
      }),
    },
    crouch: {
      input: 'down (grounded)', frames: 60,
      anim: f => { // drop low and wide, hold with a small breath, stand back up
        const p = tween(f, [[0, {}], [5, { sx: 1.18, sy: 0.66, arm: 2 }], [50, { sx: 1.18, sy: 0.66, arm: 2 }], [60, {}]]);
        if (f > 5 && f < 50) p.sy += 0.012 * Math.sin((f - 5) / 45 * Math.PI * 4);
        return p;
      },
    },
    crouchWalk: {
      input: 'down + left/right (grounded)', frames: 32,
      anim: (f, n) => { // stays as low as the crouch: short shuffling steps, arms paddling, barely any bob
        const p = f / n * Math.PI * 2, y = -0.5 * (1 + Math.cos(2 * p));
        const foot = q => [2.5 * Math.sin(q), -1.5 * Math.max(0, Math.cos(q)) - y];
        const a = foot(p), b = foot(p + Math.PI);
        return {
          y, sx: 1.16 + 0.015 * Math.cos(2 * p), sy: 0.68 - 0.015 * Math.cos(2 * p), rot: 0.04,
          arm: [2 - Math.sin(p), 2 + Math.sin(p)],
          legs: [a, b, a, b],
        };
      },
    },
    jumpSquat: { // short wind-up before leaving the ground
      input: 'jump (grounded)', frames: 14,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { ...SQUAT, legs: [[-2, 0], [-1, 0], [1, 0], [2, 0]] }],
          [6, { sx: 1.24, sy: 0.68, arm: 2, legs: [[-2, 0], [-1, 0], [1, 0], [2, 0]] }],
          [9, { sx: 0.86, sy: 1.2, arm: -3, air: -6, legs: legsAll(0, 2) }],
          [14, {}],
        ]),
        puff: f >= 6 ? (f - 6) / 8 : null,
      }),
    },
    fullHop:     { input: 'hold jump', frames: 64, anim: hop(110, 64) },
    shortHop:    { input: 'tap jump',  frames: 40, anim: hop(45, 40) },
    doubleJump: {
      input: 'jump (airborne)', frames: 36,
      anim: f => tween(f, [ // kick off the air and do a full forward flip, balled up
        [0, { air: -50, legs: legsAll(0, 1) }],
        [3, { air: -52, sx: 1.15, sy: 0.85, arm: 2, legs: TUCK }],
        [6, { air: -70, sx: 0.9, sy: 1.15, arm: -4, rot: 0.3, legs: legsAll(0, 3) }],
        [20, { air: -110, rot: Math.PI * 2, arm: -1, legs: TUCK }],
        [28, { air: -100, rot: Math.PI * 2, arm: -2, legs: legsAll(0, 1) }],
        [36, { air: -50, rot: Math.PI * 2, legs: legsAll(0, 1) }],
      ]),
    },
    fall: {
      input: 'none', frames: 40,
      anim: (f, n) => { // drifting down: slight stretch, arms flapping, legs pedalling
        const p = f / n * Math.PI * 2, s = Math.sin(p * 2);
        return {
          air: -80 + 3 * Math.sin(p), sx: 0.98, sy: 1.03,
          arm: [-3 + s, -3 - s],
          legs: [[0, 1.5 + 1.5 * s], [0, 1.5 - 1.5 * s], [0, 1.5 + 1.5 * s], [0, 1.5 - 1.5 * s]],
        };
      },
    },
    fastFall: {
      input: 'down (airborne, falling)', frames: 24,
      anim: (f, n) => { // stretched like a dart, arms up, legs pointed down, streaks overhead
        const p = f / n * Math.PI * 2;
        return {
          air: -70, sx: 0.88, sy: 1.16, arm: -5, legs: legsAll(0, 3 + 0.5 * Math.sin(p * 2)),
          fallLines: 0.75 + 0.25 * Math.sin(p * 2),
        };
      },
    },
    land: {
      input: 'none', frames: 18,
      anim: f => ({ // touch down stretched, squash hard, wobble back to standing
        ...tween(f, [
          [0, { air: -20, sx: 0.92, sy: 1.1, arm: -3, legs: REACH }],
          [3, { sx: 1.25, sy: 0.7, arm: 3 }],
          [8, { sx: 0.95, sy: 1.06, arm: -1 }],
          [12, { sx: 1.02, sy: 0.98 }],
          [18, {}],
        ]),
        puff: f >= 3 ? (f - 3) / 15 : null,
      }),
    },
    platformDrop: {
      input: 'down (on platform)', frames: 40,
      anim: f => tween(f, [ // quick dip, then slip down through the platform (the preview floor) with arms up
        [0, {}],
        [4, { sx: 1.1, sy: 0.85, arm: 1 }],
        [8, { air: 6, sx: 0.94, sy: 1.08, arm: -3, legs: legsAll(0, 1) }],
        [30, { air: 55, sx: 0.96, sy: 1.06, arm: -4, legs: legsAll(0, 2) }],
        [40, { air: 55, sx: 0.96, sy: 1.06, arm: -4, legs: legsAll(0, 2) }],
      ]),
    },
  },

  ledge: {
    ledgeGrab:   { input: 'fall near ledge',      anim: null },
    ledgeHang:   { input: 'none',                 anim: null },
    ledgeGetup:  { input: 'toward stage',         anim: null },
    ledgeJump:   { input: 'jump',                 anim: null },
    ledgeRoll:   { input: 'S',                    anim: null },
    ledgeDrop:   { input: 'away / down',          anim: null },
  },

  defense: {
    shield:      { input: 'hold S',               anim: null },
    spotDodge:   { input: 'S + down',             anim: null },
    rollForward: { input: 'S + forward',          anim: null },
    rollBack:    { input: 'S + back',             anim: null },
    airDodge:    { input: 'S (airborne)',         anim: null },
  },

  // getting hit
  reactions: {
    hitstun:     { anim: null }, // light hit, flinch in place
    tumble:      { anim: null }, // launched hard, spinning
    knockdown:   { anim: null }, // hit the ground in tumble without teching
    tech:        { input: 'S just before hitting ground in tumble', anim: null },
    getup:       { input: 'any (from knockdown)', anim: null },
    ko:          { anim: null }, // crossed the blast zone
    respawn:     { anim: null },
  },

  groundAttacks: {
    jab1:        { input: 'A',                        anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    jab2:        { input: 'A (after jab1)',           anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    jab3:        { input: 'A (after jab2)',           anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    dashAttack:  { input: 'A while running',          anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    forwardTilt: { input: 'forward + A',              anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    upTilt:      { input: 'up + A',                   anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    downTilt:    { input: 'down + A',                 anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    getupAttack: { input: 'A (from knockdown)',       anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
    ledgeAttack: { input: 'A (on ledge)',             anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null },
  },

  // hold the button to charge; chargeFrames = max hold, chargeMult = damage multiplier at full charge
  smashAttacks: {
    forwardSmash:{ input: 'hard forward + A (hold)',  anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, chargeFrames: null, chargeMult: null },
    upSmash:     { input: 'hard up + A (hold)',       anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, chargeFrames: null, chargeMult: null },
    downSmash:   { input: 'hard down + A (hold)',     anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, chargeFrames: null, chargeMult: null },
  },

  // landingLag = frames stuck on the ground if you land mid-attack
  aerials: {
    neutralAir:  { input: 'A (airborne)',             anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, landingLag: null },
    forwardAir:  { input: 'forward + A (airborne)',   anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, landingLag: null },
    backAir:     { input: 'back + A (airborne)',      anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, landingLag: null },
    upAir:       { input: 'up + A (airborne)',        anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, landingLag: null },
    downAir:     { input: 'down + A (airborne)',      anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, landingLag: null },
  },

  // usable on the ground and in the air
  specials: {
    neutralSpecial: { input: 'B',                     anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, notes: 'usually a projectile' },
    sideSpecial:    { input: 'forward/back + B',      anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, notes: 'usually a lunge' },
    upSpecial:      { input: 'up + B',                anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, notes: 'recovery move; helpless after' },
    downSpecial:    { input: 'down + B',              anim: null, startup: null, active: null, endlag: null, damage: null, kb: { base: null, growth: null, angle: null }, hitbox: null, notes: 'counter / reflector / etc.' },
  },

  grabs: {
    grab:        { input: 'Z',                        anim: null, startup: null, active: null, endlag: null, hitbox: null },
    dashGrab:    { input: 'Z while running',          anim: null, startup: null, active: null, endlag: null, hitbox: null },
    pummel:      { input: 'A (holding opponent)',     anim: null, damage: null },
    forwardThrow:{ input: 'forward (holding)',        anim: null, damage: null, kb: { base: null, growth: null, angle: null } },
    backThrow:   { input: 'back (holding)',           anim: null, damage: null, kb: { base: null, growth: null, angle: null } },
    upThrow:     { input: 'up (holding)',             anim: null, damage: null, kb: { base: null, growth: null, angle: null } },
    downThrow:   { input: 'down (holding)',           anim: null, damage: null, kb: { base: null, growth: null, angle: null } },
  },
};
