// Wumpus's moveset (drawn by wumpus.js), Discord-flavoured. Movement is Claw'd's (clawd-moveset.js, loaded first); his arm and
// leg poses move Wumpus's stubby arms and outer feet, reach punches a paw out and ears swing its floppy ears.
// Fields are as in clawd-moveset.js. Groups not here yet (smashes, specials, grabs, defense, ledge) are still to build.
const sayW = (text, f, from, to) => f >= from && f < to ? [text, Math.min(1, (f - from) / 3, (to - f) / 8)] : null; // caption popping up over the head
// movement: Claw'd's, plus Wumpus's arms swinging out from the shoulders (arms), which his arm offsets alone barely show.
// Past ~1.8 rad they disappear behind his head, so raised arms stop there
const MV = MOVESET.movement, cycle = (f, n, k = 1) => Math.sin(f / n * Math.PI * 2 * k);
const ease = (f, ks) => tween(f, ks.map(([k, a]) => [k, { a }])).a; // one number eased through [[frame, value], …]
const armsOn = (m, arms) => ({ ...m, anim: (f, n = m.frames) => ({ ...m.anim(f, n), arms: arms(f, n) }) });
const WUMPUS_MOVESET = {
  movement: {
    ...MV,
    idle: armsOn(MV.idle, (f, n) => 0.15 + 0.08 * (1 - Math.cos(f / n * Math.PI * 4)) / 2), // breathing out a little with each breath
    walk: armsOn(MV.walk, (f, n) => { const s = cycle(f, n); return [0.3 + 0.35 * s, 0.3 - 0.35 * s]; }), // waddle: flapping out one side at a time
    dash: armsOn(MV.dash, f => ease(f, [[0, 0.2], [3, 0], [6, 1.3], [11, 1.2], [16, 0.9], [20, 0.2]])), // flung back by the burst
    run: armsOn(MV.run, (f, n) => { const s = cycle(f, n); return [0.9 + 0.4 * s, 0.9 - 0.4 * s]; }), // held out wide, pumping
    skid: armsOn(MV.skid, f => ease(f, [[0, 0.9], [4, 1.7], [13, 1.5], [17, 0.6], [26, 0.2]])), // thrown up to brake, dropped for the turn
    crouch: armsOn(MV.crouch, f => ease(f, [[0, 0.15], [5, 0.05], [50, 0.05], [60, 0.15]])), // tucked in
    crouchWalk: armsOn(MV.crouchWalk, (f, n) => { const s = cycle(f, n); return [0.15 + 0.2 * s, 0.15 - 0.2 * s]; }), // little paddles
    jumpSquat: armsOn(MV.jumpSquat, f => ease(f, [[0, 0.15], [4, 0], [6, 0], [9, 1.8], [14, 1.6]])), // down, then flung up for the jump
    fullHop: armsOn(MV.fullHop, (f, n) => ease(f / n, [[0, 1.6], [0.3, 1.8], [0.65, 1.3], [1, 1]])), // raised on the way up, lowering past the peak
    shortHop: armsOn(MV.shortHop, (f, n) => ease(f / n, [[0, 1.6], [0.3, 1.8], [0.65, 1.3], [1, 1]])),
    doubleJump: armsOn(MV.doubleJump, f => ease(f, [[0, 1], [3, 0.4], [6, 1.8], [20, 1.4], [28, 1.2], [36, 1]])), // out wide through the flip
    fall: armsOn(MV.fall, (f, n) => { const s = cycle(f, n, 2); return [1.3 + 0.3 * s, 1.3 - 0.3 * s]; }), // up and flapping
    fastFall: armsOn(MV.fastFall, () => 0), // pinned to its sides, like a dart
    land: armsOn(MV.land, f => ease(f, [[0, 1.6], [3, 0.6], [8, 0.1], [18, 0.15]])), // swung down by the squash
    platformDrop: armsOn(MV.platformDrop, f => ease(f, [[0, 0.15], [4, 0], [8, 1.6], [30, 1.8], [40, 1.8]])), // up as it slips through
  },
  groundAttacks: {
    jab1: { // ping: a quick poke with the front paw, feet planted
      input: 'light', startup: 3, active: 2, endlag: 14, damage: 2.5, kb: { base: 8, growth: 25, angle: 40 },
      hitbox: { x: 16, y: -32, w: 30, h: 16 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -2, sx: 1.04, sy: 0.97, rot: -0.05, reach: -3, ears: 0.1, legs: legsAll(2, 0) }],
          [3, { x: 4, sx: 1.06, sy: 0.96, rot: 0.08, reach: 20, ears: -0.1, legs: [[-4, 0], [0, 0], [0, 0], [2, 0]] }],
          [6, { x: 4, sx: 1.05, sy: 0.97, rot: 0.07, reach: 18, ears: -0.08, legs: [[-4, 0], [0, 0], [0, 0], [2, 0]] }],
          [11, { x: 2, rot: 0.02, reach: 4, legs: [[-2, 0], [0, 0], [0, 0], [1, 0]] }],
          [19, {}],
        ]),
        speed: f >= 3 && f < 6 ? 0.4 : 0,
      }),
    },
    jab2: { // ping ping: the back paw follows it up, a little higher
      input: 'light (after jab1)', startup: 3, active: 2, endlag: 16, damage: 2, kb: { base: 10, growth: 25, angle: 50 },
      hitbox: { x: 16, y: -38, w: 30, h: 18 },
      anim: f => tween(f, [
        [0, {}],
        [2, { x: -1, sx: 0.98, sy: 1.03, rot: -0.04, reach: [-3, 0], ears: 0.1, legs: legsAll(1, 0) }],
        [3, { x: 5, y: -1, sx: 1.04, sy: 1.02, rot: 0.1, reach: [22, 0], arm: [-3, 0], ears: -0.12, legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [6, { x: 5, y: -1, sx: 1.03, sy: 1.02, rot: 0.09, reach: [20, 0], arm: [-3, 0], ears: -0.1, legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [12, { x: 2, rot: 0.03, reach: [4, 0], legs: [[-2, 0], [0, 0], [0, 0], [1, 0]] }],
        [21, {}],
      ]),
    },
    jab3: { // @everyone: rear back and throw the whole big head forward, ears flying
      input: 'light (after jab2)', step: 220, startup: 6, active: 3, endlag: 24, damage: 5, kb: { base: 40, growth: 80, angle: 40 },
      hitbox: { x: 14, y: -70, w: 38, h: 40 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: -6, sx: 0.94, sy: 1.06, rot: -0.3, ears: 0.9, arm: 3, legs: legsAll(5, 0) }],
          [6, { x: 12, y: -2, sx: 1.12, sy: 0.92, rot: 0.38, ears: -0.4, arm: [-4, 2], legs: [[-5, 2], [0, 0], [0, 0], [3, 2]] }],
          [9, { x: 13, y: -2, sx: 1.1, sy: 0.93, rot: 0.36, ears: -0.3, arm: [-4, 2], legs: [[-5, 2], [0, 0], [0, 0], [3, 2]] }],
          [17, { x: 8, rot: 0.1, ears: 0.15, legs: [[-5, 0], [0, 0], [0, 0], [1, 0]] }],
          [33, {}],
        ]),
        speed: f >= 6 && f < 13 ? 1 - (f - 6) / 7 : 0,
        dust: f >= 6 && f < 18 ? (f - 6) / 12 : null,
        say: sayW('@everyone', f, 6, 30),
      }),
    },
    dashAttack: { // sliding into your DMs: hop and belly flop, skidding along on the run's momentum
      input: 'light while running', startup: 7, active: 10, endlag: 20, damage: 7, kb: { base: 35, growth: 60, angle: 55 },
      hitbox: { x: 0, y: -42, w: 54, h: 40 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -2, y: -8, sx: 0.96, sy: 1.05, rot: 0.5, ears: [0.6, 0], arm: -6, legs: legsAll(-2, -2) }],
          [7, { x: 10, y: 9, sx: 1.06, sy: 0.94, rot: 1.35, ears: [1.3, -0.3], arm: -8, legs: legsAll(-4, -4) }],
          [17, { x: 14, y: 9, sx: 1.04, sy: 0.96, rot: 1.32, ears: [1.4, -0.3], arm: -8, legs: legsAll(-4, -4) }],
          [26, { x: 8, y: 2, rot: 0.5, ears: [0.4, 0], arm: -2 }],
          [37, {}],
        ]),
        speed: f >= 7 && f < 22 ? 1 - (f - 7) / 15 : 0,
        dust: f >= 7 && f < 19 ? (f - 7) / 12 : null,
        say: sayW('sliding into DMs', f, 7, 34),
      }),
    },
    forwardTilt: { // /slap: step in and whip the front ear round like a wet noodle
      input: 'forward + light', step: 200, startup: 7, active: 3, endlag: 18, damage: 8, kb: { base: 20, growth: 70, angle: 35 },
      hitbox: { x: 26, y: -70, w: 34, h: 28 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [6, { x: -4, sx: 0.97, sy: 1.03, rot: -0.14, ears: [0.3, -0.6], arm: [0, -2], legs: legsAll(4, 0) }],
          [7, { x: 6, sx: 1.06, sy: 0.96, rot: 0.15, ears: [0.2, 1.8], arm: [-2, 1], legs: [[-6, 0], [0, 0], [0, 0], [3, 0]] }],
          [10, { x: 6, sx: 1.05, sy: 0.97, rot: 0.14, ears: [0.2, 1.7], arm: [-2, 1], legs: [[-6, 0], [0, 0], [0, 0], [3, 0]] }],
          [15, { x: 4, rot: 0.06, ears: [0.1, 2.3], legs: [[-3, 0], [0, 0], [0, 0], [1, 0]] }],
          [28, {}],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0,
        say: sayW('/slap', f, 7, 26),
      }),
    },
    upTilt: { // raise hand: dip, then spring up tall with both ears shot straight up overhead
      input: 'up + light', startup: 6, active: 4, endlag: 16, damage: 6, kb: { base: 25, growth: 80, angle: 88 },
      hitbox: { x: -32, y: -98, w: 64, h: 38 },
      anim: f => tween(f, [
        [0, {}],
        [5, { sx: 1.12, sy: 0.86, ears: 0.5, arm: 3 }],
        [6, { y: -3, sx: 0.92, sy: 1.12, ears: 3.2, arm: -8, legs: legsAll(0, 3) }],
        [10, { y: -3, sx: 0.93, sy: 1.11, ears: 3.4, arm: -8, legs: legsAll(0, 3) }],
        [16, { sx: 0.98, sy: 1.04, ears: 1.4, arm: -2 }],
        [26, {}],
      ]),
    },
    downTilt: { // *boop*: from the crouch, a quick low snoot poke along the floor
      input: 'down + light', startup: 5, active: 3, endlag: 12, damage: 5, kb: { base: 15, growth: 50, angle: 20 },
      hitbox: { x: 18, y: -36, w: 32, h: 24 },
      anim: f => ({
        ...tween(f, [
          [0, CROUCH],
          [4, { ...CROUCH, x: -2, rot: -0.08, ears: 0.2 }],
          [5, { ...CROUCH, x: 7, sx: 1.24, rot: 0.3, ears: -0.2, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
          [8, { ...CROUCH, x: 7, sx: 1.23, rot: 0.28, ears: -0.15, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
          [14, { ...CROUCH, x: 2, rot: 0.06, legs: [[-2, 0], [0, 0], [0, 0], [1, 0]] }],
          [20, CROUCH],
        ]),
        say: sayW('*boop*', f, 5, 18),
      }),
    },
    getupAttack: { // reconnecting…: from flat on its back, kick over and spin up with both ears flung out, clearing both sides.
      // Can't be hurt until the hit comes out; knockback goes away from Wumpus
      input: 'light / heavy (from knockdown)', startup: 12, active: 4, endlag: 16, damage: 6, kb: { base: 50, growth: 40, angle: 30 },
      hitbox: { x: -62, y: -66, w: 124, h: 30 }, both: true, intangible: [0, 12],
      anim: f => ({
        ...tween(f, [
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94, arm: 1 }],
          [6, { rot: Math.PI - 0.3, sx: 1.1, sy: 0.88, arm: 3 }],
          [11, { rot: Math.PI * 1.7, y: -14, sx: 0.92, sy: 1.08, arm: -4, ears: 0.8, legs: legsAll(0, -3) }],
          [12, { rot: Math.PI * 2, sx: 1.12, sy: 0.9, arm: -6, ears: 1.6, legs: [[-6, 0], [0, 0], [0, 0], [6, 0]] }],
          [16, { rot: Math.PI * 2, sx: 1.1, sy: 0.92, arm: -6, ears: 1.5, legs: [[-6, 0], [0, 0], [0, 0], [6, 0]] }],
          [22, { rot: Math.PI * 2, sx: 1.04, sy: 0.97, ears: 0.6 }],
          [32, { rot: Math.PI * 2 }],
        ]),
        puff: f >= 12 ? (f - 12) / 10 : null,
        say: sayW('reconnecting…', f, 0, 12),
      }),
    },
  },
  aerials: { // like Claw'd's: preview-only air: -40, frame 0 / the last frame = the plain airborne pose
    neutralAir: { // loading spinner: fling both ears out and spin a full turn, hitting all around
      input: 'light (airborne)', startup: 4, active: 8, endlag: 14, damage: 6, kb: { base: 20, growth: 60, angle: 45 },
      hitbox: { x: -50, y: -80, w: 100, h: 80 }, landingLag: 8,
      anim: f => {
        const p = tween(f, [[0, AIRBORNE], [3, { sx: 0.94, sy: 1.06, rot: -0.25, arm: -6, ears: 0.6, legs: TUCK }],
          [4, { sx: 1.06, sy: 0.96, arm: -6, ears: 1.6, legs: TUCK }], [13, { sx: 1.06, sy: 0.96, arm: -6, ears: 1.5, legs: TUCK }], [26, AIRBORNE]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // spin eases out
        return { ...p, rot: f < 4 ? p.rot : -0.25 + (Math.PI * 2 + 0.25) * e, air: -40 };
      },
    },
    forwardAir: { // @here: rear the big head back, then nod it down hard in front
      input: 'forward + light (airborne)', startup: 7, active: 4, endlag: 16, damage: 9, kb: { base: 25, growth: 80, angle: 35 },
      hitbox: { x: 14, y: -66, w: 42, h: 54 }, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [6, { x: -3, sx: 0.94, sy: 1.06, rot: -0.35, arm: -6, ears: 0.9, legs: TUCK }],
          [7, { x: 6, sx: 1.08, sy: 0.94, rot: 0.7, arm: 2, ears: -0.3, legs: legsAll(-3, 0) }],
          [11, { x: 6, sx: 1.07, sy: 0.95, rot: 0.66, arm: 2, ears: -0.2, legs: legsAll(-3, 0) }],
          [18, { x: 2, rot: 0.2, ears: 0.3, legs: TUCK }],
          [27, AIRBORNE],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40,
        say: sayW('@here', f, 7, 24),
      }),
    },
    backAir: { // /kick: tip right over forward and shove both feet out behind
      input: 'back + light (airborne)', startup: 6, active: 4, endlag: 14, damage: 10, kb: { base: 30, growth: 85, angle: 145 },
      hitbox: { x: -56, y: -36, w: 36, h: 32 }, landingLag: 9,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [5, { x: 3, sx: 0.94, sy: 1.06, rot: -0.15, arm: -4, ears: 0.2, legs: legsAll(3, -4) }],
          [6, { x: -4, sx: 1.04, sy: 0.96, rot: 0.9, arm: -8, ears: [0.9, -0.2], legs: legsAll(-3, 4) }],
          [10, { x: -4, sx: 1.04, sy: 0.96, rot: 0.86, arm: -8, ears: [0.8, -0.2], legs: legsAll(-3, 4) }],
          [16, { x: -1, rot: 0.3, arm: -3, ears: 0.2, legs: TUCK }],
          [24, AIRBORNE],
        ]),
        speed: f >= 6 && f < 10 ? -0.5 : 0, air: -40,
        say: sayW('/kick', f, 6, 22),
      }),
    },
    upAir: { // stretch tall and scissor both ears up over the head
      input: 'up + light (airborne)', startup: 5, active: 5, endlag: 14, damage: 7, kb: { base: 22, growth: 80, angle: 90 },
      hitbox: { x: -34, y: -100, w: 68, h: 44 }, landingLag: 7,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [4, { sx: 1.1, sy: 0.88, arm: 2, ears: [0.2, 0.6], legs: TUCK }],
          [5, { y: -4, sx: 0.9, sy: 1.15, arm: -10, ears: [3.1, 2.4], legs: legsAll(0, 4) }],
          [10, { y: -3, sx: 0.92, sy: 1.13, arm: -10, ears: [2.6, 3.4], legs: legsAll(0, 3) }],
          [17, { sx: 0.98, sy: 1.04, arm: -4, ears: 1, legs: TUCK }],
          [24, AIRBORNE],
        ]),
        air: -40,
      }),
    },
    downAir: { // stomp: ears flung up, both feet driven straight down. Spikes
      input: 'down + light (airborne)', startup: 8, active: 6, endlag: 18, damage: 11, kb: { base: 20, growth: 70, angle: 285 },
      hitbox: { x: -24, y: -8, w: 48, h: 28 }, landingLag: 14,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [7, { y: -6, sx: 1.1, sy: 0.86, arm: -6, ears: 1.2, legs: legsAll(0, -5) }],
          [8, { y: -2, sx: 0.94, sy: 1.08, arm: -10, ears: 2.8, legs: legsAll(0, 12) }],
          [14, { y: -2, sx: 0.95, sy: 1.07, arm: -10, ears: 2.9, legs: legsAll(0, 11) }],
          [22, { arm: -4, ears: 1, legs: legsAll(0, 3) }],
          [32, AIRBORNE],
        ]),
        fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40,
      }),
    },
  },
};
