// Lego Man's moveset (drawn by lego.js). He fights like a minifig moves: stiff limbs swung whole on their pins (swing / kick),
// no elbows, no knees, and no squash. Only the turnaround skid is Claw'd's (clawd-moveset.js, loaded first) stiffened; the rest is
// his own. His shield isn't built yet, so it's off.
// the down smash's brick k (of this throw, c = 0 … 1 charge): its launch speed [forward, up] in px/s
const scatterVel = (k, c) => [140 + k * (55 + 35 * c), -220 - 60 * (k % 3)];
// his crouch: plastic doesn't squash, so he sits down on the floor like a real minifig, legs straight out in front, leaning in
const SIT = { y: 14, rot: 0.1, kick: [-1.67, 1.67], swing: [0.35, 0.8] }; // the kick keeps his legs level under the lean
const seat = a => 21 - 21 * Math.cos(a) - 6.5 * Math.sin(a); // how far his hips drop so legs turned a (from hanging) still touch the floor
// holding a grabbed target in the front clip, out at arm's length, leaning back a touch
const LHOLD = { rot: -0.04, swing: [0.35, 1.2], legs: [[-3, 0], [0, 0], [0, 0], [2, 0]], carry: [46, -4, 0] };
// a throw: keys carry the target up to the release frame `at`; after it (preview only: the game has let go) it flies on at
// fly = [vx, vy, spin] per frame, falling. extra(f) adds to the pose (and can steer carry before the release)
const legoThrow = ({ keys, at, fly: [vx, vy, spin], extra }) => f => {
  const p = tween(f, keys), h = tween(at, keys).carry, t = f - at;
  return { ...p, carry: t < 0 ? p.carry : t < 18 ? [h[0] + vx * t, h[1] + vy * t + 0.5 * t * t, h[2] + spin * t] : null, ...extra?.(f) };
};
// flat on his back, feet ahead, arms flung out over his head (he lies on his side face: rot turns the front-on figure)
const LIE = { rot: -Math.PI / 2, y: 22, swing: 2.9 };
// hanging off the ledge by both clips, facing the wall (x, air: from standing at the lip, as the game places him)
const LHANG = { x: -42, air: 62, swing: [3.3, 2.75] };
// tucked for a roll: legs out in front, arms reaching after them
const PIKE = { y: -4, kick: [-1.4, 1.4], swing: [-0.6, 1.2] };
// plastic doesn't squash: Claw'd's skid with the stretch taken out (a narrowing sx still turns him round)
const stiff = m => ({ ...m, anim: (f, n) => { const p = m.anim(f, n), sx = p.sx ?? 1; return { ...p, sx: Math.sign(sx) * Math.min(1, Math.abs(sx)), sy: 1 }; } });
// a toy's step at phase p (front-on, so no scissoring): one leg swings out on its hip pin (a) while the other stays planted,
// the opposite arm swings out (b), then the other side; leaning in, and hopping up hop px on each step (the run)
const legoStride = (p, a, b, lean, hop) => {
  const s = Math.sin(p), l = Math.max(0, s), r = Math.max(0, -s);
  return { y: -hop * Math.abs(s), rot: lean, kick: [a * l, a * r], swing: [b * r, b * l] };
};
const LEGO_RUN = (f, n) => legoStride(f / n * Math.PI * 2, 0.6, 0.9, 0.12, 2.5);
// a whole jump: arms swung back, flung up to spring, spread out at the peak, reaching down, arms out to catch the landing.
// Only `air` differs by height (the game picks frames 7 … 55 from the vertical speed)
const LAND = { rot: 0.05, swing: 1, kick: 0.12 };
const legoHop = (height, n) => f => {
  const up = 5, down = n - 7, u = (f - up) / (down - up);
  return {
    ...tween(f, [
      [0, {}],
      [4, { rot: 0.08, swing: [0.5, -0.3] }],
      [up + 2, { rot: -0.04, swing: 2.7 }],
      [(up + down) / 2, { swing: 1.6, kick: 0.25 }],
      [down - 1, { swing: 0.8, kick: 0.05 }],
      [down + 2, LAND],
      [n, {}],
    ]),
    air: f > up && f < down ? -height * 4 * u * (1 - u) : 0,
    puff: f >= up && f < up + 10 ? (f - up) / 10 : f >= down ? (f - down) / 7 : null,
  };
};
// a roll toward d (1 forward, -1 back): tuck, one full turn head over heels, open out still facing the same way
const legoRoll = d => f => {
  const p = tween(f, [[0, {}], [3, { rot: 0.1 * d, swing: [0.5, -0.3] }], [6, { ...PIKE, x: 12 * d }], [22, { ...PIKE, x: 112 * d }], [25, { x: 120 * d, swing: 0.8 }], [30, { x: 120 * d }]]);
  const e = Math.min(1, Math.max(0, (f - 4) / 18));
  return { ...p, rot: d * Math.PI * 2 * e * e * (3 - 2 * e), [d > 0 ? 'dust' : 'dustAhead']: f >= 4 && f < 16 ? (f - 4) / 12 : null };
};
// a sideways air dodge toward d: superman through the air that way, arms out ahead of him, eyes shut
const legoAirDodge = d => f => ({
  ...tween(f, [
    [0, AIRBORNE],
    [2, { rot: -0.1 * d, swing: [0.5, 0.5], legs: TUCK }],
    [4, { x: 30 * d, rot: 0.9 * d, swing: 3 }],
    [14, { x: 130 * d, rot: 0.8 * d, swing: 3 }],
    [18, { x: 140 * d, rot: 0.1 * d, swing: 1.2 }],
    [28, { ...AIRBORNE, x: 144 * d }],
  ]),
  blink: f >= 3 && f < 18 ? 1 : 0, speed: f >= 3 && f < 16 ? d * (1 - (f - 3) / 13) : 0, air: -40,
});
const LEGO_MOVESET = {
  movement: {
    ...MOVESET.movement,
    skid: stiff(MOVESET.movement.skid),
    walk: { ...MOVESET.movement.walk, anim: (f, n) => legoStride(f / n * Math.PI * 2, 0.35, 0.45, 0.03, 0.8) },
    dash: { // lean in, burst into a long stride, hold it, then ease into the run's first frame (the game hands off at 16)
      ...MOVESET.movement.dash,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [3, { rot: -0.05, swing: [0.5, -0.3] }],
          [6, { x: 8, ...legoStride(Math.PI / 2, 0.65, 1, 0.16, 0), speed: 1 }],
          [11, { x: 7, ...legoStride(Math.PI / 2, 0.6, 0.9, 0.15, 0), speed: 1 }],
          [16, { ...LEGO_RUN(0, 24), speed: 0.5 }],
          [20, {}],
        ]),
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    run: { ...MOVESET.movement.run, anim: (f, n) => ({ ...LEGO_RUN(f, n), speed: 0.5, dust: f % (n / 2) <= 9 ? f % (n / 2) / 9 : null }) },
    idle: {
      input: 'none', frames: 120,
      anim: (f, n) => { // two slow breaths per loop in the arms, one blink near the end
        const b = (1 - Math.cos(f / n * Math.PI * 4)) / 2;
        return { swing: 0.06 * b, arm: 0.8 * b - 0.4, blink: f >= 100 && f < 106 ? 1 : 0 };
      },
    },
    jumpSquat: { // arms swung back, then flung up as he springs
      input: 'jump (grounded)', frames: 14,
      anim: f => ({
        ...tween(f, [[0, {}], [4, { rot: 0.08, swing: [0.5, -0.3] }], [6, { rot: 0.1, swing: [0.6, -0.4] }], [9, { rot: -0.04, swing: 2.7, air: -6 }], [14, {}]]),
        puff: f >= 6 ? (f - 6) / 8 : null,
      }),
    },
    fullHop: { input: 'hold jump', frames: 64, anim: legoHop(110, 64) },
    shortHop: { input: 'tap jump', frames: 40, anim: legoHop(45, 40) },
    doubleJump: {
      input: 'jump (airborne)', frames: 36,
      anim: f => tween(f, [ // kick off the air and flip forward once, stiff as a board, legs piked
        [0, { air: -50, swing: 1.2 }],
        [3, { air: -52, rot: 0.1, swing: [0.5, -0.3] }],
        [6, { air: -70, rot: 0.3, swing: 2.8 }],
        [20, { air: -110, rot: Math.PI * 2, swing: 2.8, kick: [-0.8, 0.8] }],
        [28, { air: -100, rot: Math.PI * 2, swing: 1.6 }],
        [36, { air: -50, rot: Math.PI * 2, swing: 1.2 }],
      ]),
    },
    fall: {
      input: 'none', frames: 40,
      anim: (f, n) => { // drifting down, arms up and waving, legs paddling
        const p = f / n * Math.PI * 2, s = Math.sin(p * 2);
        return { air: -80 + 3 * Math.sin(p), swing: [2.3 + 0.25 * s, 2.3 - 0.25 * s], kick: [0.1 + 0.1 * s, 0.1 - 0.1 * s] };
      },
    },
    fastFall: {
      input: 'double-tap down (airborne, falling)', frames: 24,
      anim: (f, n) => ({ air: -70, swing: 3.05, fallLines: 0.75 + 0.25 * Math.sin(f / n * Math.PI * 4) }), // arms straight up, dropping like a brick
    },
    land: {
      input: 'none', frames: 18,
      anim: f => ({ // touch down reaching, arms flung out to catch it, settle
        ...tween(f, [[0, { air: -20, swing: 0.8 }], [3, LAND], [8, { rot: 0.02, swing: 0.4 }], [18, {}]]),
        puff: f >= 3 ? (f - 3) / 15 : null,
      }),
    },
    platformDrop: {
      input: 'down (on platform)', frames: 40,
      anim: f => tween(f, [ // a little hop of a lean, then slip down through the platform with arms up
        [0, {}],
        [4, { rot: 0.06, swing: [0.4, -0.3] }],
        [8, { air: 6, swing: 2.6 }],
        [30, { air: 55, swing: 2.9 }],
        [40, { air: 55, swing: 2.9 }],
      ]),
    },
    crouch: {
      input: 'down (grounded)', frames: 60,
      anim: f => { // plonk down, hold with a small breath in the arms, stand back up
        const p = tween(f, [[0, {}], [5, SIT], [50, SIT], [60, {}]]);
        p.y = seat(p.kick[1] - p.rot); // feet on the floor the whole way down
        if (f > 5 && f < 50) p.arm = -0.6 * Math.sin((f - 5) / 45 * Math.PI * 4);
        return p;
      },
    },
    crouchWalk: {
      input: 'down + left/right (grounded)', frames: 32,
      anim: (f, n) => { // bum-shuffle: hitch forward twice a loop, feet lifting, arms paddling
        const p = f / n * Math.PI * 2, s = Math.sin(p);
        return {
          ...SIT, y: SIT.y - 1.5 * Math.abs(s), rot: SIT.rot + 0.04 * Math.sin(2 * p),
          kick: [-1.67 - 0.15 * Math.max(0, -s), 1.67 + 0.15 * Math.max(0, s)], swing: [0.35 + 0.3 * s, 0.8 - 0.3 * s],
        };
      },
    },
  },

  groundAttacks: {
    jab1: { // straight punch: the front arm snaps up level like a piston
      input: 'light', startup: 3, active: 2, endlag: 14, damage: 2.5, kb: { base: 8, growth: 25, angle: 40 },
      hitbox: { x: 22, y: -56, w: 24, h: 18 },
      anim: f => tween(f, [
        [0, {}],
        [2, { x: -1, rot: -0.05, swing: [0.15, -0.35] }],
        [3, { x: 3, rot: 0.08, swing: [0.35, 1.6], legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
        [5, { x: 3, rot: 0.08, swing: [0.35, 1.55], legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
        [10, { x: 1, rot: 0.03, swing: [0.1, 0.5] }],
        [19, {}],
      ]),
    },
    jab2: { // rising chop: the same arm keeps going, up and over in front of his face
      input: 'light (after jab1)', startup: 3, active: 2, endlag: 16, damage: 2, kb: { base: 10, growth: 25, angle: 50 },
      hitbox: { x: 16, y: -74, w: 28, h: 30 },
      anim: f => tween(f, [
        [0, { swing: [0.2, 1] }],
        [2, { x: 1, rot: 0.03, swing: [0.2, 0.9] }],
        [3, { x: 3, y: -1, sx: 0.98, sy: 1.04, rot: -0.04, swing: [0.4, 2] }],
        [5, { x: 3, y: -1, sx: 0.97, sy: 1.05, rot: -0.06, swing: [0.45, 2.4] }],
        [11, { x: 1, rot: -0.02, swing: [0.15, 1] }],
        [21, {}],
      ]),
    },
    jab3: { // headbutt: rock back, then lurch the whole boxy head in, arms flung back, eyes shut
      input: 'light (after jab2)', step: 220, startup: 5, active: 3, endlag: 24, damage: 4.5, kb: { base: 40, growth: 80, angle: 40 },
      hitbox: { x: 2, y: -74, w: 28, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -4, sx: 1.03, sy: 0.97, rot: -0.22, swing: [-0.2, 0.4], legs: legsAll(3, 0) }],
          [5, { x: 10, y: 1, rot: 0.32, swing: [0.9, -0.5], blink: 1, legs: [[-8, 0], [0, 0], [0, 0], [3, 0]] }],
          [8, { x: 11, y: 1, rot: 0.3, swing: [0.9, -0.5], blink: 1, legs: [[-8, 0], [0, 0], [0, 0], [3, 0]] }],
          [16, { x: 7, rot: 0.12, swing: [0.3, -0.1], legs: [[-4, 0], [0, 0], [0, 0], [1, 0]] }],
          [32, {}],
        ]),
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    dashAttack: { // superman dive out of a run: arms straight out ahead, flat on his belly, sliding on the momentum
      input: 'light while running', startup: 6, active: 10, endlag: 22, damage: 7, kb: { base: 35, growth: 60, angle: 40 },
      hitbox: { x: 0, y: -32, w: 46, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -2, sx: 1.08, sy: 0.9, rot: 0.1, swing: 0.4 }],
          [6, { x: 6, y: 8, rot: 1.3, swing: 2.9, kick: [0.3, -0.1] }],
          [10, { x: 10, y: 22, rot: 1.47, swing: 3.1, kick: [0.1, 0] }],
          [16, { x: 14, y: 22, rot: 1.47, swing: 3.1, kick: [0.1, 0] }],
          [26, { x: 12, y: 6, rot: 0.5, swing: 0.8, kick: [0, 0.3] }],
          [38, {}],
        ]),
        dust: f >= 8 && f < 20 ? (f - 8) / 12 : null,
      }),
    },
    forwardTilt: { // front kick: lean back and swing the whole front leg up level
      input: 'forward + light', step: 200, startup: 6, active: 3, endlag: 18, damage: 8, kb: { base: 20, growth: 70, angle: 35 },
      hitbox: { x: 14, y: -38, w: 26, h: 22 },
      anim: f => tween(f, [
        [0, {}],
        [5, { x: -2, sx: 1.03, sy: 0.96, rot: -0.05, swing: [0.2, 0.3], kick: [0, 0.5] }],
        [6, { x: 4, rot: -0.22, swing: [1.1, 0.6], kick: [0, 1.45] }],
        [9, { x: 4, rot: -0.22, swing: [1.1, 0.6], kick: [0, 1.45] }],
        [16, { x: 2, rot: -0.08, swing: [0.4, 0.2], kick: [0, 0.4] }],
        [27, {}],
      ]),
    },
    upTilt: { // overhead swipe: the front arm swings up past his head, then back down the front
      input: 'up + light', startup: 5, active: 4, endlag: 16, damage: 6, kb: { base: 25, growth: 80, angle: 88 },
      hitbox: { x: -6, y: -84, w: 42, h: 38 },
      anim: f => tween(f, [
        [0, {}],
        [4, { sx: 1.06, sy: 0.92, rot: 0.08, swing: [0.2, -0.4] }],
        [5, { y: -3, sx: 0.95, sy: 1.08, rot: -0.04, swing: [0.3, 2.2], legs: legsAll(0, 2) }],
        [9, { y: -4, sx: 0.95, sy: 1.08, rot: -0.1, swing: [0.4, 3.5], legs: legsAll(0, 2) }],
        [16, { sy: 1.02, rot: -0.03, swing: [0.1, 2.4] }],
        [25, {}],
      ]),
    },
    downTilt: { // from sitting: spin twice on the spot like a top, arms out and legs sweeping round, hitting both sides
      input: 'down + light', startup: 5, active: 8, endlag: 12, damage: 5, kb: { base: 15, growth: 50, angle: 20 },
      hitbox: { x: -40, y: -40, w: 80, h: 40 }, both: true,
      anim: f => {
        const p = tween(f, [
          [0, SIT],
          [4, { ...SIT, rot: 0.18, swing: [0.2, 0.3] }],
          [5, { ...SIT, y: 14.5, rot: 0, kick: [-1.57, 1.57], swing: 1.5 }],
          [13, { ...SIT, y: 14.5, rot: 0, kick: [-1.57, 1.57], swing: 1.5 }],
          [20, { ...SIT, swing: 0.9 }],
          [25, SIT],
        ]);
        const t = Math.min(1, Math.max(0, (f - 4) / 16)), c = Math.cos(4 * Math.PI * t * (2 - t)); // two turns, fast then slowing
        p.sx = (c < 0 ? -1 : 1) * (0.35 + 0.65 * Math.abs(c)); // turning: narrows side-on (his depth), then shows the other way round
        p.puff = f >= 5 ? (f - 5) / 10 : null;
        return p;
      },
    },
    getupAttack: { // from flat on his back: kicks over and drops into the splits, arms out, clearing both sides.
      // Can't be hurt until the hit comes out; knockback goes away from him
      input: 'light / heavy (from knockdown)', startup: 12, active: 4, endlag: 16, damage: 6, kb: { base: 50, growth: 40, angle: 30 },
      hitbox: { x: -40, y: -26, w: 80, h: 26 }, both: true, intangible: [0, 12],
      anim: f => ({
        ...tween(f, [
          [0, LIE],
          [6, { ...LIE, rot: LIE.rot - 0.3, swing: 2.4, kick: [-1, 1] }],
          [11, { rot: -0.25, y: -14, swing: 1.5, kick: 0.4 }],
          [12, { y: 13, swing: 1.4, kick: 1.5 }],
          [16, { y: 13, swing: 1.4, kick: 1.5 }],
          [22, { y: 5, swing: 0.5, kick: 0.6 }],
          [32, {}],
        ]),
        puff: f >= 12 ? (f - 12) / 10 : null,
      }),
    },
  },

  // x / air are measured from standing right at the lip, facing the stage (the game places him by them while he's on it)
  ledge: {
    ledgeGrab: {
      input: 'fall near ledge', frames: 10,
      anim: f => tween(f, [[0, { x: -42, air: 50, swing: [3.1, 2.9] }], [4, { ...LHANG, air: 67, rot: 0.05 }], [10, LHANG]]), // clips click on, he drops a touch and settles
    },
    ledgeHang: {
      input: 'none', frames: 60,
      anim: (f, n) => { // dangling: a slow sway, legs swinging after it
        const s = Math.sin(f / n * Math.PI * 2);
        return { ...LHANG, rot: 0.04 * s, kick: [-0.1 * s, 0.1 * s], blink: f >= 40 && f < 46 ? 1 : 0 };
      },
    },
    ledgeGetup: {
      input: 'toward stage / up', frames: 24,
      anim: f => ({ // dip, haul up over the lip legs first, step onto the stage
        ...tween(f, [
          [0, LHANG],
          [5, { ...LHANG, air: 68 }],
          [11, { x: -30, air: -6, rot: 0.3, swing: [0.6, 1.4], kick: [-1.2, 1.2] }],
          [16, { x: -10, air: -4, rot: 0.1, swing: 0.5, kick: [-0.4, 0.4] }],
          [19, LAND],
          [24, {}],
        ]),
        puff: f >= 19 ? (f - 19) / 5 : null,
      }),
    },
    ledgeJump: {
      input: 'jump', frames: 40, launchAt: 6,
      anim: f => tween(f, [ // pull down, spring straight up off the ledge arms first, drift over the stage
        [0, LHANG],
        [4, { ...LHANG, air: 68 }],
        [6, { x: -40, air: 56, swing: 3.1 }],
        [20, { x: -26, air: -90, swing: 1.6, kick: 0.25 }],
        [34, { x: -20, air: -40, swing: 0.8 }],
        [40, { x: -20, air: -30, swing: 0.8 }],
      ]),
    },
    ledgeRoll: {
      input: 'dodge (Shift / Z)', frames: 36, intangible: [0, 36],
      anim: f => { // haul up, tuck and roll a full turn onto the stage, open out standing well inland
        const p = tween(f, [[0, LHANG], [5, { ...LHANG, air: 68 }], [10, { ...PIKE, x: -30, y: 0, air: -8 }], [25, { ...PIKE, x: 72, y: 0, air: -4 }], [28, { x: 84, swing: 0.8 }], [36, { x: 90 }]]);
        const e = Math.min(1, Math.max(0, (f - 9) / 17));
        return { ...p, rot: Math.PI * 2 * e * e * (3 - 2 * e), puff: f >= 26 && f < 32 ? (f - 26) / 6 : null };
      },
    },
    ledgeAttack: { // haul up over the lip and swing the front leg out level along the stage
      ...MOVESET.ledge.ledgeAttack, hitbox: { x: 10, y: -42, w: 38, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, LHANG],
          [4, { ...LHANG, air: 68 }],
          [9, { x: -30, air: -6, rot: 0.3, swing: [0.6, 1.4], kick: [-1.2, 1.2] }],
          [13, { x: -10, air: -2, rot: -0.05, swing: [0.3, 0.4], kick: [0, 0.4] }],
          [15, { x: -4, rot: -0.08, swing: [0.3, 0.3], kick: [0, 0.5] }],
          [16, { x: 4, rot: -0.22, swing: [1.1, 0.6], kick: [0, 1.45] }],
          [20, { x: 4, rot: -0.22, swing: [1.1, 0.6], kick: [0, 1.45] }],
          [28, { x: 2, rot: -0.08, swing: [0.4, 0.2], kick: [0, 0.4] }],
          [36, {}],
        ]),
        speed: f >= 16 && f < 20 ? 0.6 : 0, puff: f >= 15 && f < 21 ? (f - 15) / 6 : null,
      }),
    },
    ledgeDrop: {
      input: 'away / down', frames: 24,
      anim: f => tween(f, [[0, LHANG], [4, { x: -44, air: 70, swing: [3, 2.6] }], [16, { x: -46, air: 120, swing: 2.4, kick: 0.1 }], [24, { x: -46, air: 120, swing: 2.4, kick: 0.1 }]]), // let go, arms still up
    },
  },

  // no shield yet (it stays off for him); frame data is Claw'd's
  defense: {
    spotDodge: {
      ...MOVESET.defense.spotDodge,
      anim: f => { // turns side-on, as thin as a minifig is deep, arms in and eyes shut, then turns back
        const p = tween(f, [[0, {}], [3, { swing: -0.1 }], [6, { swing: -0.15, blink: 1 }], [16, { swing: -0.15, blink: 1 }], [21, { swing: 0.2 }], [26, {}]]);
        const t = f < 11 ? Math.min(1, Math.max(0, (f - 2) / 5)) : Math.min(1, Math.max(0, (21 - f) / 5));
        return { ...p, sx: 1 - 0.65 * t * t * (3 - 2 * t) };
      },
    },
    rollForward: { ...MOVESET.defense.rollForward, anim: legoRoll(1) },
    rollBack: { ...MOVESET.defense.rollBack, anim: legoRoll(-1) },
    airDodgeForward: { ...MOVESET.defense.airDodgeForward, anim: legoAirDodge(1) },
    airDodgeBack: { ...MOVESET.defense.airDodgeBack, anim: legoAirDodge(-1) },
    airDodge: {
      ...MOVESET.defense.airDodge,
      anim: f => ({ // pops loose into his parts for a moment, then clicks back together
        ...tween(f, [[0, AIRBORNE], [2, { swing: 0.5, legs: TUCK }], [5, { swing: 0.8, apart: 0.35, legs: TUCK }], [16, { swing: 0.8, apart: 0.35, legs: TUCK }], [22, { swing: 0.3, legs: TUCK }], [28, AIRBORNE]]),
        blink: f >= 3 && f < 18 ? 1 : 0, air: -40,
      }),
    },
  },

  // timings are Claw'd's (clawd-moveset.js); only the poses are his
  reactions: {
    hitstun: {
      ...MOVESET.reactions.hitstun,
      anim: (f, n = 30) => { // snaps back, arms flung out, his head jolting up off its stud; shudders, clicks back
        const t = f / n * 30, p = tween(t, [
          [0, { x: -4, rot: -0.3, swing: 1.1, kick: 0.25, headLift: 5, blink: 1 }],
          [5, { x: -6, rot: -0.24, swing: 0.9, kick: 0.2, headLift: 3, blink: 1 }],
          [22, { x: -3, rot: -0.06, swing: 0.2 }],
          [30, {}],
        ]);
        if (t < 10) p.x += f % 2 ? 1.5 : -1.5;
        return p;
      },
    },
    tumble: {
      ...MOVESET.reactions.tumble,
      anim: (f, n = 40) => { // spinning head over heels, stiff limbs windmilling, head rattling on its stud
        const p = f / n * Math.PI * 2, s = Math.sin(2 * p);
        return { rot: -p, swing: [1.6 + 0.9 * s, 1.6 - 0.9 * s], kick: [0.3 - 0.4 * s, 0.3 + 0.4 * s], headLift: 3 + 2 * s, blink: 1, air: -30 };
      },
    },
    knockdown: {
      ...MOVESET.reactions.knockdown,
      anim: f => { // slams down flat on his back (head popping off its stud and clicking back), bounces, lies there legs kicking
        const k = i => f >= 14 ? 0.3 + 0.3 * Math.sin((f - 14) / 3 + i * 1.7) : 0;
        return {
          ...tween(f, [[0, { ...LIE, headLift: 6 }], [6, { ...LIE, y: LIE.y - 12, headLift: 2 }], [12, LIE], [18, LIE]]),
          kick: [-k(0), k(1)], // lying, legs forward = up in the air
          blink: f < 14 ? 1 : 0, dizzy: f >= 14 ? 0.01 + (f - 14) / 40 : 0, puff: f < 8 ? f / 8 : f >= 12 && f < 18 ? (f - 12) / 6 : null,
        };
      },
    },
    tech: {
      ...MOVESET.reactions.tech,
      anim: f => ({ // slaps the floor and springs straight back onto his feet
        ...tween(f, [[0, { rot: -0.8, y: 8, swing: 1.2 }], [5, { y: -18, rot: -0.1, swing: 2.6 }], [11, LAND], [22, {}]]),
        ring: f < 12 ? f / 12 : null, blink: f < 5 ? 1 : 0,
      }),
    },
    getup: {
      ...MOVESET.reactions.getup,
      anim: f => ({ // rocks back, legs up, then swings them down and sits up onto his feet in one go
        ...tween(f, [[0, LIE], [5, { ...LIE, rot: LIE.rot - 0.25, kick: [-0.9, 0.9] }], [13, { rot: -0.5, y: -20, swing: 1.8, kick: [-0.4, 0.4] }], [18, LAND], [26, {}]]),
        puff: f >= 18 ? (f - 18) / 8 : null,
      }),
    },
    ko: {
      ...MOVESET.reactions.ko,
      anim: f => { // flies off coming apart, then his own blast: coloured rays and bricks
        if (f < 20) return { x: 7 * f, air: -5 * f, rot: -f / 4, apart: f / 20, blink: 1 };
        const p = MOVESET.reactions.ko.anim(f); return { ...p, blast: [...p.blast, ...LEGO_BLAST] };
      },
    },
    respawn: {
      ...MOVESET.reactions.respawn, say: 'click!',
      anim: f => { // lowered in standing on a baseplate, then dropped
        const e = 1 - (1 - Math.min(1, f / 40)) ** 3, d = Math.max(0, (f - 100) / 20);
        return { ...LEGO_MOVESET.movement.idle.anim(f % 120, 120), air: -170 + 110 * e + 60 * d * d, pad: +(f < 100), say: ['click!', f < 100 ? Math.min(1, f / 10) : 0] };
      },
    },
  },

  // hold heavy to charge (the wind-up freezes at chargeAt, up to chargeFrames; chargeMult = damage at full charge). His smashes are
  // built of bricks, a stud each: bricks = [least, more at full charge]; he only builds as many as he has studs (none: it whiffs),
  // paid when it comes out. The anim's c and the hitbox's grow follow the bricks built, not the charge: grow = what the hitbox
  // gains from least to most bricks (fewer than least shrinks it)
  smashAttacks: {
    forwardSmash: { // brick hammer: pull out a hammer, heave it up over his head (charging clicks bricks onto the head, turn about
      // longer and wider), then bring it down level in front. No lunge: he stands his ground and lets the hammer do the work.
      // At the hit, longer reaches further out and wider covers more above and below
      input: 'heavy (X / K), hold to charge', startup: 16, active: 4, endlag: 30, damage: 15, kb: { base: 32, growth: 100, angle: 30 },
      hitbox: { x: 24, y: -52, w: 44, h: 32 }, grow: { w: 18, y: -12, h: 24 }, bricks: [1, 3], chargeFrames: 60, chargeMult: 1.4, chargeAt: 12,
      anim: (f, n, c = 0) => ({ // c = 0 … 1 charge held so far (the game passes it; the viewer shows none)
        ...tween(f, [
          [0, {}],
          [4, { swing: [0.2, 0.9] }],
          [12, { x: -4, rot: -0.2, swing: [0.5, 3.6], kick: [0.2, 0] }],
          [15, { x: -5, rot: -0.24, swing: [0.5, 3.8], kick: [0.25, 0] }],
          [16, { x: 8, rot: 0.2, swing: [0.4, 1.65], kick: [0.3, 0.1] }],
          [20, { x: 9, rot: 0.22, swing: [0.4, 1.55], kick: [0.3, 0.1] }],
          [32, { x: 5, rot: 0.12, swing: [0.3, 1.15] }],
          [50, {}],
        ]),
        hammer: f >= 2 && f < 26 ? 1 + 3 * c : 0, // put away before the arm drops (a wide head would dig into the floor)
        puff: f >= 16 && f < 26 ? (f - 16) / 10 : null,
      }),
    },
    upSmash: { // tower build: hands pressed down (charging adds layers), then arms up as a column of bricks shoots up out of the
      // floor in front of him, stands a moment, and sinks back
      input: 'up + heavy (X / K), hold to charge', startup: 14, active: 6, endlag: 24, damage: 13, kb: { base: 32, growth: 98, angle: 90 },
      hitbox: { x: 16, y: -52, w: 28, h: 52 }, grow: { y: -30, h: 30 }, bricks: [5, 3], chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: (f, n, c = 0) => {
        const rise = f < 14 ? 0 : f < 16 ? (f - 13) / 3 : f < 30 ? 1 : Math.max(0, 1 - (f - 30) / 12);
        return {
          ...tween(f, [
            [0, {}],
            [8, { rot: 0.15, swing: 0.7 }],
            [13, { rot: 0.18, swing: 0.6 }],
            [14, { y: -2, rot: -0.05, swing: 2.7, kick: 0.15 }],
            [24, { y: -2, rot: -0.05, swing: 2.8, kick: 0.15 }],
            [44, {}],
          ]),
          tower: rise ? [30, rise, 5 + Math.round(3 * c)] : null,
          puff: f >= 14 && f < 24 ? (f - 14) / 10 : null,
        };
      },
    },
    downSmash: { // loose bricks: scoop up a handful (charging adds more) and fling them out ahead. They tumble, land, and lie on the
      // floor for scatter.life seconds; anyone but him who touches one gets hurt by it (then it's gone). Only hits in front
      input: 'down + heavy (X / K), hold to charge', startup: 12, active: 4, endlag: 24, damage: 11, kb: { base: 25, growth: 90, angle: 30 },
      hitbox: { x: 12, y: -26, w: 50, h: 26 }, grow: { w: 30 }, bricks: [5, 4], chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      scatter: { life: 8, damage: 4, kb: { base: 30, growth: 30, angle: 80 } },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [8, { x: -3, rot: 0.3, swing: [0.3, -0.6], kick: [0.3, 0] }],
          [11, { x: -4, rot: 0.34, swing: [0.35, -0.7], kick: [0.35, 0] }],
          [12, { x: 5, rot: 0.12, swing: [0.2, 1.5], kick: [0.1, 0.2] }],
          [16, { x: 6, rot: 0.1, swing: [0.2, 1.6], kick: [0.1, 0.2] }],
          [40, {}],
        ]),
        handful: f >= 3 && f < 12,
      }),
    },
  },

  // B. neutral: open the instruction booklet and pick what to build from its list (like Hero's command menu) · side: head
  // boomerang · up: staircase · down: fall-apart counter. The builds and the counter's follow-up are their own states, listed here too
  specials: {
    booklet: { // pull the booklet out and flip it open, then read it (bobbing, pages fluttering) until he builds or puts it away.
      // The game draws the list over his head: ↑ ↓ move the pick, special / light builds it (if he has the studs: each build has a
      // cost), shield / dodge / jump closes it. Stands still on the ground; in the air the pages slow his fall to `fall` px/s. The
      // last pick is remembered. studs: he earns one per % of damage his hits do, up to max, starting each game with start
      input: 'special (B), then ↑ ↓ to pick, B / light to build', frames: 60, open: 10, fall: 160,
      builds: ['wreckingBall', 'rocket', 'goldBrick', 'mech'], studs: { start: 30, max: 99 }, // enough to build the wrecking ball or rocket straight away
      anim: f => {
        const o = Math.min(1, f / 10), b = f > 10 ? Math.sin((f - 10) / 25 * Math.PI) : 0;
        return { ...tween(Math.min(f, 10), [[0, {}], [10, { rot: 0.04, swing: [0.25, 1.15], blink: 0 }]]), y: -0.6 * Math.abs(b), book: o, swing: [0.25, 1.15 + 0.04 * b] };
      },
    },
    wreckingBall: { // a yellow crane clicks up out of the floor behind him with the ball pulled back; he yanks the lever and the ball
      // swings down through the space in front of him (the hit) and back, then the crane sinks away. His hardest hit
      input: 'booklet → wrecking ball', label: 'Wrecking ball', cost: 30, startup: 23, active: 5, endlag: 26, landingLag: 12, // the hit: the ball's swing through in front
      damage: 20, kb: { base: 45, growth: 110, angle: 40 }, hitbox: { x: 4, y: -90, w: 100, h: 64 },
      anim: f => {
        const a = f < 20 ? -1.3 : f < 28 ? -1.3 + 2.55 * (f - 20) / 8 : f < 38 ? 1.25 - 1.85 * (f - 28) / 10 : -0.6;
        return {
          ...tween(f, [[0, { swing: [0.25, 1.15] }], [10, { swing: [0.3, 1.1], rot: 0.05 }], [19, { swing: [0.3, 1.2], rot: 0.08 }], [21, { swing: [0.3, 0.3], rot: -0.08 }], [54, {}]]),
          crane: f < 54 ? [f < 42 ? Math.min(1, f / 10) : 1 - (f - 42) / 12, a] : null,
        };
      },
    },
    rocket: { // clicks a brick rocket together on his shoulder, then fires it straight ahead: it speeds up and bursts on whatever it
      // hits (or the stage, or at the end of its range), hitting everything within blast.r. launch: x, y = where it leaves him ·
      // speed = [start, top] px/s · accel px/s² · life s
      input: 'booklet → rocket', label: 'Rocket', cost: 25, startup: 16, active: 1, endlag: 20, landingLag: 10, build: true,
      launch: { x: 30, y: -50, speed: [300, 1100], accel: 2400, life: 1.2, blast: { r: 60, damage: 16, kb: { base: 40, growth: 100, angle: 45 } } },
      anim: f => ({
        ...tween(f, [[0, { swing: [0.25, 1.15] }], [12, { swing: [0.3, 1.35], rot: -0.03 }], [16, { x: -4, swing: [0.3, 1.2], rot: -0.12 }], [36, {}]]),
        rocket: f < 16 ? Math.min(1, f / 12) : null,
      }),
    },
    goldBrick: { // reaches up and clicks a gold brick onto his head stud: glowing gold, every hit does power.mult × damage for power.time
      // seconds (building it again restarts the time)
      input: 'booklet → gold brick', label: 'Gold brick', cost: 40, startup: 14, active: 1, endlag: 14, landingLag: 8, build: true,
      power: { mult: 1.5, time: 10 },
      anim: f => ({
        ...tween(f, [[0, { swing: [0.25, 1.15] }], [10, { swing: [0.3, 3] }], [14, { swing: [0.3, 3.1], y: 1 }], [16, { swing: [0.3, 2.9], y: -2 }], [28, {}]]),
        gold: f >= 14, puff: f >= 14 && f < 24 ? (f - 14) / 10 : null,
      }),
    },
    mech: { // bricks fly in from every side and click together into a mech suit around him, him in its cockpit: for suit.time seconds
      // he's MECH_K × as big and suit.speed × as fast, and every hit does suit.mult × damage with hitboxes MECH_K × the size
      input: 'booklet → mech suit', label: 'Mech suit', cost: 60, startup: 24, active: 1, endlag: 12, landingLag: 10, build: true,
      suit: { time: 8, mult: 1.3, speed: 0.75 },
      anim: f => ({ ...tween(f, [[0, {}], [24, { swing: 0.3 }], [36, {}]]), mech: true, apart: Math.max(0, 1 - f / 24) }),
    },
    headToss: { // head boomerang: grab his head, pull it off its neck stud and fling it ahead, spinning. It slows, turns, and flies
      // back to wherever he is by then (hitting on the way out and again on the way back), then clicks back on. He fights on
      // headless meanwhile, but can't throw it again until it's back. toss: x, y = where it leaves his hand · speed, decel px/s(²)
      // on the way out · home = [start, top] speed flying back · life = seconds before it gives up and snaps straight back
      input: 'forward / back + special', startup: 10, active: 1, endlag: 18, landingLag: 8,
      toss: { x: 38, y: -48, speed: 700, decel: 1400, home: [300, 1100], life: 3, out: { damage: 7, kb: { base: 25, growth: 70, angle: 40 } }, back: { damage: 4, kb: { base: 20, growth: 50, angle: 40 } } },
      anim: f => ({
        ...tween(f, [[0, {}], [6, { rot: -0.06, swing: [0.3, 2.9] }], [9, { x: -2, rot: -0.14, swing: [0.3, 3.3] }], [10, { x: 3, rot: 0.14, swing: [0.4, 1.5] }], [14, { x: 3, rot: 0.12, swing: [0.4, 1.4] }], [29, {}]]),
        headLift: f < 6 ? 0 : f < 10 ? 7 * (f - 6) / 4 : 0, headless: f >= 10, // (the game shows him headless while it's out)
      }),
    },
    stairs: { // build a small staircase and climb it: every `step.every` frames a brick clicks in under his feet, a step up and a
      // step ahead of the last (thrust up, drive forward, in px/s). He ends standing on the top step; the stairs stay `step.life`
      // seconds as real platforms. Once until he's back on the stage or a normal platform. The bricks clicking in hit what's below.
      // A stud a step, paid as each one starts: out of studs, the stairs stop at the last step built (none: he can't start)
      input: 'up + special', startup: 4, active: 36, endlag: 0, thrust: 288, drive: 216, hop: 200, landingLag: 8,
      step: { every: 5, w: 26, h: 10, life: 5 },
      damage: 4, kb: { base: 30, growth: 40, angle: 80 }, hitbox: { x: -16, y: -6, w: 32, h: 20 },
      anim: f => {
        const q = Math.max(0, f - 4) / 5 * Math.PI, s = Math.sin(q); // one step each 5 frames: legs take turns swinging up forward
        return {
          ...tween(Math.min(f, 4), [[0, {}], [4, { rot: 0.08, swing: 0.3 }]]),
          y: f < 4 ? 0 : -3 * Math.abs(s), kick: f < 4 ? 0 : [-0.5 * Math.max(0, s), 0.5 * Math.max(0, -s)], swing: [0.3 + 0.35 * s, 0.3 - 0.35 * s],
          air: -Math.min(36, Math.max(0, f - 4)) * 4.8, // (preview only: the game climbs him with thrust)
        };
      },
    },
    counter: { // brace, arms up: anything that hits him in the window (the active frames) knocks him apart instead (see reassemble)
      input: 'down + special', startup: 4, active: 24, endlag: 16, landingLag: 10, counter: true,
      anim: f => ({
        ...tween(f, [[0, {}], [4, { swing: 0.75, kick: 0.25, rot: -0.03 }], [28, { swing: 0.7, kick: 0.25, rot: -0.03 }], [44, {}]]),
        x: f >= 4 && f < 28 ? (f % 4 < 2 ? 0.5 : -0.5) : 0, blink: f >= 4 && f < 28 && f % 12 < 2 ? 1 : 0,
      }),
    },
    reassemble: { // countered: he flies apart (can't be hurt), the pieces zip over to `warp` px past the attacker, and snap back
      // together facing them, the parts slamming in all around him
      input: 'a hit during the counter', startup: 18, active: 3, endlag: 16, landingLag: 8, warp: [9, 90], intangible: [0, 21],
      damage: 10, kb: { base: 45, growth: 90, angle: 40 }, hitbox: { x: -44, y: -78, w: 88, h: 80 }, both: true,
      anim: f => ({
        ...tween(f, [[0, { swing: 0.7 }], [18, { swing: 1.3, kick: 0.3 }], [22, { swing: 1.3, kick: 0.3 }], [37, {}]]),
        apart: f < 9 ? f / 9 : f < 18 ? 1 - (f - 9) / 9 : 0, puff: f >= 18 ? (f - 18) / 10 : null,
      }),
    },
  },

  // grab = a hit that catches instead (the game then holds it: hold / pummel / a throw by direction). carry = [dx, dy, rot] where
  // the held target's bottom-centre sits, from his feet
  grabs: {
    grab: { // the front C-clip snaps out and clicks shut on them; a whiff clicks on nothing
      input: 'grab (G / U)', startup: 6, active: 3, endlag: 22, hitbox: { x: 14, y: -52, w: 38, h: 44 }, grab: true,
      anim: f => tween(f, [
        [0, {}],
        [4, { x: -2, rot: -0.06, swing: [0.2, 0.4] }],
        [6, { x: 5, rot: 0.12, swing: [0.5, 1.5], legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [9, { x: 5, rot: 0.12, swing: [0.5, 1.45], legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [16, { x: 3, rot: 0.06, swing: [0.3, 1] }],
        [31, {}],
      ]),
    },
    dashGrab: { // out of a run: dives in clip-first and slides on the momentum
      input: 'grab while running', startup: 9, active: 3, endlag: 28, hitbox: { x: 14, y: -52, w: 56, h: 44 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, { rot: 0.12 }],
          [5, { x: -2, rot: -0.04, swing: [0.2, 0.3] }],
          [9, { x: 12, y: -2, rot: 0.3, swing: [0.8, 1.6], kick: [0.5, 0], legs: [[-8, 0], [0, 0], [0, 0], [4, 0]] }],
          [12, { x: 14, rot: 0.28, swing: [0.8, 1.55], kick: [0.45, 0], legs: [[-8, 0], [0, 0], [0, 0], [4, 0]] }],
          [24, { x: 8, rot: 0.1, swing: [0.3, 1] }],
          [40, {}],
        ]),
        dust: f >= 9 && f < 21 ? (f - 9) / 12 : null,
      }),
    },
    hold: { // got them in the front clip, held out at arm's length, leaning back against the weight
      input: 'grab connects', frames: 60, breakFree: 90, perDmg: 1.2,
      anim: (f, n = 60) => { const b = Math.sin(f / n * Math.PI * 4); return { ...LHOLD, rot: -0.04 + 0.02 * b, swing: [0.35, 1.2 + 0.03 * b], carry: [46, -4 + b, 0] }; },
    },
    pummel: { // a headbutt into them
      input: 'light (holding)', startup: 5, active: 1, endlag: 10, damage: 1.5,
      anim: f => tween(f, [[0, LHOLD], [4, { ...LHOLD, rot: -0.14 }], [5, { ...LHOLD, x: 3, rot: 0.24, blink: 1, carry: [48, -4, 0.06] }], [16, LHOLD]]),
    },
    forwardThrow: { // discus: turns once on the spot with them at arm's length (flipping round, side-on in between) and hurls them ahead
      input: 'forward (holding)', startup: 14, active: 1, endlag: 18, damage: 7, kb: { base: 55, growth: 55, angle: 30 },
      anim: legoThrow({ at: 14, fly: [14, -3, 0.25], keys: [[0, LHOLD], [14, { ...LHOLD, x: 4, rot: 0.14, swing: [0.4, 1.5], carry: [52, -10, 0.3] }], [18, { x: 4, rot: 0.1, swing: [0.4, 1.5] }], [32, {}]],
        extra: f => { // the turn: the target swings round behind him and back out front
          if (f >= 14) return {};
          const e = f / 14, a = 2 * Math.PI * e * e * (3 - 2 * e), c = Math.cos(a);
          return { sx: (c < 0 ? -1 : 1) * (0.35 + 0.65 * Math.abs(c)), carry: [48 * c, -8, 0.3 * a / (2 * Math.PI)] };
        } }),
    },
    backThrow: { // backflip suplex: springs up and flips over backwards, carrying them up over his head to slam down behind him
      input: 'back (holding)', startup: 14, active: 1, endlag: 22, damage: 9, kb: { base: 60, growth: 62, angle: 42 },
      anim: legoThrow({ at: 14, fly: [-10, -3, -0.2], keys: [
        [0, LHOLD],
        [4, { ...LHOLD, y: 2, rot: 0.05, swing: [0.4, 1.8], carry: [40, -20, -0.3] }],
        [9, { y: -26, rot: -2.2, swing: [2.4, 2.8], kick: 0.3, carry: [-6, -84, -1.9] }],
        [14, { y: -14, rot: -4.2, swing: [2.6, 3.2], kick: 0.3, carry: [-54, -10, -3] }],
        [22, { y: 0, rot: -2 * Math.PI, swing: 0.6 }],
        [36, { rot: -2 * Math.PI }],
      ] }),
    },
    upThrow: { // stud click: hoists them up and clicks them onto his head stud like a hat, then pops his head up and fires them off
      input: 'up (holding)', startup: 16, active: 1, endlag: 18, damage: 6, kb: { base: 70, growth: 45, angle: 90 },
      anim: legoThrow({ at: 16, fly: [0, -14, 0.05], keys: [
        [0, LHOLD],
        [6, { ...LHOLD, swing: [2.4, 2.6], carry: [18, -60, 0] }],
        [9, { swing: [2.7, 2.7], carry: [0, -73, 0] }],
        [14, { y: 1, swing: [0.4, 0.4], carry: [0, -73, 0] }],
        [16, { y: -3, swing: [0.9, 0.9], headLift: 9, carry: [0, -84, 0] }],
        [22, { swing: 0.5, headLift: 2 }],
        [34, {}],
      ] }),
    },
    downThrow: { // plonk: throws them down flat in front of him, hops up and sits down hard on them; they bounce up out from under him
      input: 'down (holding)', startup: 16, active: 1, endlag: 20, damage: 6, kb: { base: 45, growth: 50, angle: 80 },
      anim: legoThrow({ at: 16, fly: [2, -9, 0.1], keys: [
        [0, LHOLD],
        [6, { ...LHOLD, swing: [0.4, 1.9], carry: [44, -24, 0.6] }],
        [9, { rot: 0.2, swing: [0.3, 1], carry: [50, 16, Math.PI / 2] }],
        [12, { x: 22, y: -30, swing: 1, kick: [-1, 1], carry: [50, 16, Math.PI / 2] }],
        [16, { x: 44, y: -28, rot: 0.1, kick: [-1.67, 1.67], swing: [0.35, 0.8], carry: [50, 16, Math.PI / 2] }],
        [24, { x: 30, y: 4, kick: [-1.3, 1.3], swing: 0.6 }],
        [36, {}],
      ], extra: f => ({ puff: f >= 16 ? (f - 16) / 10 : null }) }),
    },
  },

  // landingLag = frames stuck on the ground if you land mid-attack · air: -40 floats them in the preview (the game ignores it)
  aerials: {
    neutralAir: { // cartwheel: flings out into an X and turns one full circle, hands and feet hitting all around
      input: 'light (airborne)', startup: 4, active: 8, endlag: 14, damage: 6, kb: { base: 20, growth: 60, angle: 45 },
      hitbox: { x: -42, y: -78, w: 84, h: 82 }, landingLag: 8,
      anim: f => {
        const p = tween(f, [[0, AIRBORNE], [3, { rot: -0.25, swing: 0.8, kick: 0.2 }], [4, { swing: 2.3, kick: 0.5 }], [13, { swing: 2.3, kick: 0.5 }], [26, AIRBORNE]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // the turn eases out
        return { ...p, rot: f < 4 ? p.rot : -0.25 + (Math.PI * 2 + 0.25) * e, air: -40 };
      },
    },
    forwardAir: { // overhead chop: the front arm cocks up behind his head, then comes over the top and down in front
      input: 'forward + light (airborne)', startup: 7, active: 4, endlag: 16, damage: 9, kb: { base: 25, growth: 80, angle: 40 },
      hitbox: { x: 18, y: -62, w: 30, h: 44 }, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [6, { x: -3, rot: -0.2, swing: [0.3, 3.4], legs: TUCK }],
          [7, { x: 5, rot: 0.25, swing: [0.6, 2], kick: [0.3, 0] }],
          [11, { x: 5, rot: 0.3, swing: [0.6, 1], kick: [0.3, 0] }],
          [18, { x: 2, rot: 0.1, swing: [0.3, 0.5] }],
          [27, AIRBORNE],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40,
      }),
    },
    backAir: { // donkey kick: tip forward and swing the back leg straight out behind
      input: 'back + light (airborne)', startup: 6, active: 4, endlag: 14, damage: 10, kb: { base: 30, growth: 85, angle: 145 },
      hitbox: { x: -44, y: -40, w: 32, h: 26 }, landingLag: 9,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [5, { x: 3, rot: -0.1, swing: [0.2, 0.5], kick: [-0.3, 0.2] }],
          [6, { x: -4, rot: 0.3, swing: [0.3, 1], kick: [1.5, 0.1] }],
          [10, { x: -4, rot: 0.3, swing: [0.3, 1], kick: [1.5, 0.1] }],
          [16, { x: -1, rot: 0.1, swing: [0.1, 0.4], kick: [0.4, 0] }],
          [24, AIRBORNE],
        ]),
        air: -40,
      }),
    },
    upAir: { // hooray: both arms thrown straight up past his head
      input: 'up + light (airborne)', startup: 5, active: 5, endlag: 14, damage: 7, kb: { base: 22, growth: 80, angle: 90 },
      hitbox: { x: -30, y: -92, w: 60, h: 42 }, landingLag: 7,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [4, { y: 2, swing: -0.2, kick: 0.15 }],
          [5, { y: -3, swing: 1.8, kick: 0.3 }],
          [10, { y: -4, swing: 3.1, kick: 0.25 }],
          [17, { y: -1, swing: 2.4 }],
          [24, AIRBORNE],
        ]),
        air: -40,
      }),
    },
    downAir: { // stomp: legs apart and arms up, then both feet slammed down together. Spikes
      input: 'down + light (airborne)', startup: 8, active: 6, endlag: 18, damage: 11, kb: { base: 20, growth: 70, angle: 285 },
      hitbox: { x: -20, y: -8, w: 40, h: 26 }, landingLag: 14,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [7, { y: -6, swing: 2.4, kick: 0.5 }],
          [8, { y: -2, swing: 3, legs: legsAll(0, 2) }],
          [14, { y: -2, swing: 3, legs: legsAll(0, 2) }],
          [22, { swing: 1.2, legs: legsAll(0, 1) }],
          [32, AIRBORNE],
        ]),
        fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40,
      }),
    },
  },
};
