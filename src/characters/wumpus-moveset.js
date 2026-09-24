// Wumpus's moveset (drawn by wumpus.js), Discord-flavoured. Movement is Claw'd's (clawd-moveset.js, loaded first); his arm and
// leg poses move Wumpus's stubby arms and outer feet, reach punches a paw out and ears swing its floppy ears.
// Fields are as in clawd-moveset.js. Groups not here yet (smashes, aerials, specials, grabs, defense, ledge) are still to build.
const sayW = (text, f, from, to) => f >= from && f < to ? [text, Math.min(1, (f - from) / 3, (to - f) / 8)] : null; // caption popping up over the head
const WUMPUS_MOVESET = {
  movement: MOVESET.movement,
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
};
