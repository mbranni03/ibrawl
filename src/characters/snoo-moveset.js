// Snoo's moveset (drawn by snoo.js). Movement is Claw'd's (clawd-moveset.js, loaded first). Its ground attacks lean on what
// Snoo has: stubby arms that stretch out to punch, little feet to kick with, a big head to butt with and an antenna to whip,
// and it hands out Reddit votes: upvotes off its up tilt and up air, downvotes off its down tilt and down air. Its smashes: a ban hammer to the side, a giant
// upvote bursting up out of the floor, and [removed] both ways along the floor.
// Frame data and field meanings as in clawd-moveset.js; pose fields as in snoo.js.
// holding a grabbed foe out at arm's length, both arms stretched to it (carry = where its bottom-centre is, as Claw'd's HOLD)
const SNOO_HOLD = { rot: -0.06, reach: [38, 32], arm: [-4, -4], legs: [[-3, 0], [0, 0], [0, 0], [2, 0]], carry: [52, -4, 0] };
// one of Claw'd's moves done by Snoo: his pose, his squints as shut eyes, and extra(f, n) laid over it (swing, antenna… as in snoo.js)
const snooOver = (move, extra) => ({ ...move, anim: (f, n) => { const p = move.anim(f, n); return { ...p, blink: p.squint ? 1 : p.blink, ...extra(f, n) }; } });
const snooArms = (key, extra) => snooOver(MOVESET.movement[key], extra); // his movement
// hanging off the ledge on Claw'd's spot (the game moves it by x / air), both arms stretched up and over to the lip
const SNOO_HANG = { x: -60, air: 40, sy: 1.08, swing: [0.32, 0.57], reach: [48, 26], legs: legsAll(0, 3) };
const SNOO_PULL = { x: -60, air: 46, sx: 1.08, sy: 0.9, swing: [0.34, 0.6], reach: [54, 32], legs: legsAll(0, 2) }; // dipping to haul itself up
const SNOO_TUCK = { swing: [0.6, -0.6], ant: -0.6 }; // arms pulled in under it, antenna flattened: rolls and dodges
// a jump: arms swing back in the squat, fling up and out on takeoff, open wide at the peak, reach up again coming down
const snooHop = (f, n) => tween(f, [[0, {}], [4, { swing: -0.6 }], [7, { swing: [-1.9, 1.9] }], [(n - 2) / 2, { swing: [-1.2, 1.2] }],
  [n - 8, { swing: [-1.6, 1.6] }], [n - 5, { swing: [-0.6, 0.6] }], [n, {}]]);

const SNOO_MOVESET = {
  movement: { // Claw'd's, with arms that show: his arm moves are a few px, lost on Snoo, so it swings them about the shoulders
    ...MOVESET.movement,
    idle: snooArms('idle', (f, n) => { const b = (1 - Math.cos(f / n * Math.PI * 4)) / 2; return { swing: [-0.12 * b, 0.12 * b] }; }), // ease out on each breath
    walk: snooArms('walk', (f, n) => ({ swing: 0.55 * Math.sin(f / n * Math.PI * 2) })), // both swinging together, a little waddle
    dash: snooArms('dash', f => tween(f, [[0, {}], [3, { swing: 0.3 }], [6, { swing: -1.2 }], [11, { swing: -1.2 }], [16, { swing: -0.9 }], [20, {}]])), // flung back
    run: snooArms('run', (f, n) => ({ swing: -0.9 + 0.3 * Math.sin(f / n * Math.PI * 4) })), // trailing behind, pumping each step
    skid: snooArms('skid', f => tween(f, [[0, { swing: -0.9 }], [4, { swing: 0.9 }], [13, { swing: 0.9 }], [17, {}], [26, {}]])), // thrown forward to brake
    crouch: snooArms('crouch', f => tween(f, [[0, {}], [5, { swing: [-0.5, 0.5] }], [50, { swing: [-0.5, 0.5] }], [60, {}]])), // out a little for balance
    crouchWalk: snooArms('crouchWalk', (f, n) => { const s = 0.3 * Math.sin(f / n * Math.PI * 2); return { swing: [-0.5 + s, 0.5 + s] }; }), // paddling
    jumpSquat: snooArms('jumpSquat', f => tween(f, [[0, {}], [4, { swing: -0.6 }], [6, { swing: -0.7 }], [9, { swing: [-1.9, 1.9] }], [14, {}]])),
    fullHop: snooArms('fullHop', snooHop),
    shortHop: snooArms('shortHop', snooHop),
    doubleJump: snooArms('doubleJump', f => tween(f, [[0, { swing: [-1.2, 1.2] }], [3, { swing: -0.5 }], [6, { swing: [-2, 2] }], [20, { swing: [-0.4, 0.4] }], [36, { swing: [-1.2, 1.2] }]])), // tucked through the flip
    fall: snooArms('fall', (f, n) => { const s = 0.3 * Math.sin(f / n * Math.PI * 4); return { swing: [-1.6 - s, 1.6 + s] }; }), // up and out, flapping
    fastFall: snooArms('fastFall', () => ({ swing: [-2.1, 2.1] })), // up as far as the head lets them show
    land: snooArms('land', f => tween(f, [[0, { swing: [-1.7, 1.7] }], [3, { swing: [-0.9, 0.9] }], [8, { swing: [-0.3, 0.3] }], [18, {}]])),
    platformDrop: snooArms('platformDrop', f => tween(f, [[0, {}], [4, { swing: -0.3 }], [8, { swing: [-1.9, 1.9] }], [40, { swing: [-1.9, 1.9] }]])),
  },
  groundAttacks: {
    jab1: { // front arm stretches out in a quick straight punch, feet planted
      input: 'light', startup: 3, active: 2, endlag: 14, damage: 2.5, kb: { base: 8, growth: 25, angle: 40 },
      hitbox: { x: 16, y: -30, w: 26, h: 20 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -2, sx: 1.03, sy: 0.97, rot: -0.06, reach: -2, arm: [0, 1], ant: -0.1 }],
          [3, { x: 3, sx: 1.05, sy: 0.96, rot: 0.08, reach: 22, arm: [0, -2], ant: -0.25, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
          [6, { x: 3, sx: 1.04, sy: 0.97, rot: 0.07, reach: 20, arm: [0, -2], ant: -0.2, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
          [11, { x: 1, rot: 0.02, reach: 4, ant: 0.08 }],
          [19, {}],
        ]),
        speed: f >= 3 && f < 6 ? 0.4 : 0,
      }),
    },
    jab2: { // the back arm follows through across the body: a one-two
      input: 'light (after jab1)', startup: 3, active: 2, endlag: 16, damage: 2, kb: { base: 10, growth: 25, angle: 45 },
      hitbox: { x: 14, y: -32, w: 24, h: 20 },
      anim: f => tween(f, [
        [0, {}],
        [2, { x: -1, sx: 0.98, sy: 1.02, rot: -0.04, reach: [2, 0], arm: [1, 2], ant: 0.1 }],
        [3, { x: 5, sx: 1.05, sy: 0.96, rot: 0.12, reach: [50, -4], arm: [-4, 3], ant: -0.3, legs: [[-5, 0], [0, 0], [0, 0], [3, 0]] }],
        [6, { x: 5, sx: 1.04, sy: 0.97, rot: 0.11, reach: [48, -4], arm: [-4, 3], ant: -0.25, legs: [[-5, 0], [0, 0], [0, 0], [3, 0]] }],
        [12, { x: 2, rot: 0.03, reach: [12, 0], arm: [-1, 1], ant: 0.1 }],
        [21, {}],
      ]),
    },
    jab3: { // finisher: rear back, then throw the big head forward in a headbutt, eyes squeezed shut, antenna flung back
      input: 'light (after jab2)', step: 220, startup: 5, active: 3, endlag: 24, damage: 4.5, kb: { base: 40, growth: 80, angle: 40 },
      hitbox: { x: 18, y: -64, w: 32, h: 40 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -5, sx: 0.96, sy: 1.04, rot: -0.3, arm: [-4, -4], ant: 0.5, legs: legsAll(3, 0) }],
          [5, { x: 12, sx: 1.08, sy: 0.94, rot: 0.42, blink: 1, arm: [4, 2], reach: [0, 6], ant: -0.9, legs: [[-10, 0], [0, 0], [0, 0], [3, 0]] }],
          [8, { x: 13, sx: 1.07, sy: 0.95, rot: 0.4, blink: 1, arm: [4, 2], reach: [0, 6], ant: -0.8, legs: [[-10, 0], [0, 0], [0, 0], [3, 0]] }],
          [16, { x: 8, rot: 0.14, blink: 0.3, arm: [1, 1], ant: 0.3, legs: [[-5, 0], [0, 0], [0, 0], [1, 0]] }],
          [32, {}],
        ]),
        speed: f >= 5 && f < 12 ? 1 - (f - 5) / 7 : 0,
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    dashAttack: { // out of a run: dives headfirst and belly-slides along the floor, antenna leading the way
      input: 'light while running', startup: 6, active: 8, endlag: 20, damage: 7, kb: { base: 35, growth: 60, angle: 55 },
      hitbox: { x: 14, y: -46, w: 48, h: 44 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -3, sx: 1.06, sy: 0.9, rot: -0.12, arm: [2, 2], ant: 0.3 }],
          [6, { x: 12, y: 6, sx: 1.04, sy: 0.96, rot: 1.25, arm: [-10, -10], reach: [0, 10], ant: 0.35, legs: [[-4, -3], [0, 0], [0, 0], [-4, -3]] }],
          [14, { x: 14, y: 8, sx: 1.04, sy: 0.96, rot: 1.3, arm: [-10, -10], reach: [0, 10], ant: 0.3, legs: [[-4, -3], [0, 0], [0, 0], [-4, -3]] }],
          [22, { x: 8, y: 2, rot: 0.5, arm: [-4, -4], ant: -0.2 }],
          [34, {}],
        ]),
        speed: f >= 6 && f < 20 ? 1 - (f - 6) / 14 : 0,
        dust: f >= 6 && f < 18 ? (f - 6) / 12 : null,
      }),
    },
    forwardTilt: { // rocks back on its back foot, which swings the front foot up and out in a kick
      input: 'forward + light', step: 200, startup: 6, active: 3, endlag: 18, damage: 8, kb: { base: 20, growth: 70, angle: 35 },
      hitbox: { x: 20, y: -32, w: 30, h: 26 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: -3, sx: 0.97, sy: 1.03, rot: 0.1, arm: [-2, 2], ant: -0.1, legs: [[2, 0], [0, 0], [0, 0], [-2, -2]] }],
          [6, { x: 2, y: 3, rot: -0.5, arm: [-8, -10], ant: 0.6, legs: [[-3, 0], [0, 0], [0, 0], [20, -8]] }],
          [9, { x: 2, y: 3, rot: -0.48, arm: [-8, -10], ant: 0.5, legs: [[-3, 0], [0, 0], [0, 0], [19, -8]] }],
          [16, { x: 1, y: 1, rot: -0.16, arm: [-2, -2], ant: -0.1, legs: [[-1, 0], [0, 0], [0, 0], [2, -2]] }],
          [27, {}],
        ]),
        speed: f >= 6 && f < 10 ? 0.5 : 0,
      }),
    },
    upTilt: { // springs up tall and whips the antenna over its head, front to back, handing out an upvote
      input: 'up + light', startup: 5, active: 4, endlag: 16, damage: 6, kb: { base: 25, growth: 80, angle: 88 },
      hitbox: { x: -26, y: -102, w: 66, h: 58 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { sx: 1.1, sy: 0.88, rot: 0.1, arm: [2, 2], ant: 0.7 }],
          [5, { y: -4, sx: 0.92, sy: 1.14, rot: -0.1, arm: [-10, -12], ant: -0.6, legs: legsAll(0, 3) }],
          [9, { y: -3, sx: 0.93, sy: 1.12, rot: -0.14, arm: [-10, -12], ant: -1.7, legs: legsAll(0, 2) }],
          [16, { sx: 0.98, sy: 1.04, rot: -0.05, arm: [-3, -3], ant: -0.9 }],
          [25, {}],
        ]),
        vote: f >= 5 && f < 25 ? [4, -92, (f - 5) / 20, 1] : null,
      }),
    },
    downTilt: { // from the crouch: sweeps the front foot out low along the floor, handing out a downvote
      input: 'down + light', startup: 5, active: 3, endlag: 12, damage: 5, kb: { base: 15, growth: 50, angle: 20 },
      hitbox: { x: 16, y: -18, w: 32, h: 18 },
      anim: f => ({
        ...tween(f, [
          [0, CROUCH],
          [4, { ...CROUCH, x: -2, rot: -0.05, ant: 0.2, legs: [[0, 0], [0, 0], [0, 0], [-3, 0]] }],
          [5, { ...CROUCH, x: 4, rot: -0.12, ant: -0.3, legs: [[-4, 0], [0, 0], [0, 0], [24, 0]] }],
          [8, { ...CROUCH, x: 4, rot: -0.11, ant: -0.25, legs: [[-4, 0], [0, 0], [0, 0], [23, 0]] }],
          [14, { ...CROUCH, x: 1, ant: 0.1, legs: [[-1, 0], [0, 0], [0, 0], [6, 0]] }],
          [20, CROUCH],
        ]),
        vote: f >= 5 && f < 20 ? [40, -34, (f - 5) / 15, -1] : null,
        dustAhead: f >= 5 && f < 15 ? (f - 5) / 10 : null,
      }),
    },
    getupAttack: { // from flat on its back: rocks, flips over with both feet kicking and lands with both arms flung out wide.
      // Can't be hurt until the hit comes out; knockback goes away from Snoo
      input: 'light / heavy (from knockdown)', startup: 12, active: 4, endlag: 16, damage: 6, kb: { base: 50, growth: 40, angle: 30 },
      hitbox: { x: -60, y: -34, w: 120, h: 34 }, both: true, intangible: [0, 12],
      anim: f => ({
        ...tween(f, [
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94 }],
          [6, { rot: Math.PI - 0.3, sx: 1.1, sy: 0.88, ant: 0.4 }],
          [11, { rot: Math.PI * 1.7, y: -14, sx: 0.92, sy: 1.08, ant: -0.6, legs: legsAll(0, -4) }],
          [12, { rot: Math.PI * 2, sx: 1.22, sy: 0.82, blink: 1, arm: [-4, -4], reach: [-30, 30], ant: 0.3, legs: [[-8, 0], [0, 0], [0, 0], [8, 0]] }],
          [16, { rot: Math.PI * 2, sx: 1.2, sy: 0.84, blink: 1, arm: [-4, -4], reach: [-28, 28], ant: 0.2, legs: [[-8, 0], [0, 0], [0, 0], [8, 0]] }],
          [22, { rot: Math.PI * 2, sx: 1.06, sy: 0.94, reach: [-8, 8], ant: -0.1 }],
          [32, { rot: Math.PI * 2 }],
        ]),
        puff: f >= 12 ? (f - 12) / 10 : null,
      }),
    },
  },
  // hold the button to charge; chargeFrames = max hold, chargeMult = damage multiplier at full charge
  smashAttacks: {
    forwardSmash: { // the ban hammer: pulls it out, winds it back over its shoulder (charge holds here, frame 12), then slams it
      // down in front, eyes shut, and stamps BANNED
      input: 'heavy (X / K), hold to charge', step: 240, startup: 16, active: 4, endlag: 30, damage: 15, kb: { base: 32, growth: 102, angle: 40 },
      hitbox: { x: 20, y: -60, w: 60, h: 60 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 12,
      anim: f => ({
        ...tween(f, [
          [0, { hammer: [0.6, 0], swing: [0, 0.4] }],
          [4, { x: -1, rot: -0.06, swing: [-0.2, 1.2], ant: 0.2, hammer: [0.2, 1] }],
          [12, { x: -5, sx: 0.95, sy: 1.06, rot: -0.24, swing: [-0.6, 2], ant: 0.6, legs: [[3, 0], [0, 0], [0, 0], [-2, 0]], hammer: [-1, 1] }],
          [15, { x: -6, sx: 0.94, sy: 1.07, rot: -0.26, swing: [-0.6, 2.05], ant: 0.65, legs: [[3, 0], [0, 0], [0, 0], [-2, 0]], hammer: [-1.1, 1] }],
          [16, { x: 12, sx: 1.1, sy: 0.9, rot: 0.3, blink: 1, swing: [-0.8, 1.1], ant: -0.8, legs: [[-12, 0], [0, 0], [0, 0], [4, 0]], hammer: [1.12, 1] }],
          [20, { x: 13, sx: 1.08, sy: 0.92, rot: 0.28, blink: 1, swing: [-0.8, 1.1], ant: -0.6, legs: [[-12, 0], [0, 0], [0, 0], [4, 0]], hammer: [1.14, 1] }],
          [34, { x: 9, sx: 1.02, sy: 0.98, rot: 0.1, swing: [-0.3, 0.9], ant: 0.1, legs: [[-6, 0], [0, 0], [0, 0], [2, 0]], hammer: [0.85, 1] }],
          [44, { x: 2, swing: [0, 0.5], hammer: [0.6, 1] }],
          [50, { hammer: [0.6, 0] }],
        ]),
        speed: f >= 16 && f < 24 ? 1 - (f - 16) / 8 : 0,
        puff: f >= 16 && f < 30 ? (f - 16) / 14 : null,
        banned: f >= 16 && f < 44 ? (f - 16) / 28 : null,
      }),
    },
    upSmash: { // front page: crouches low, arms back (charge holds here, frame 8: lower the longer it charges), then springs up tall as
      // a giant upvote bursts up out of the floor behind it, launching whatever's above or beside Snoo
      input: 'up + heavy (X / K), hold to charge', startup: 12, active: 6, endlag: 24, damage: 13, kb: { base: 32, growth: 98, angle: 90 },
      hitbox: { x: -45, y: -160, w: 90, h: 160 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: (f, n, c = 0) => { // c = 0 … 1 charge held so far (the game passes it; the viewer shows none)
        const p = tween(f, [
          [0, {}],
          [6, { sx: 1.14, sy: 0.84, rot: 0.06, swing: [0.5, -0.5], ant: 0.3, legs: [[-3, 0], [0, 0], [0, 0], [3, 0]] }],
          [11, { sx: 1.16, sy: 0.82, rot: 0.06, swing: [0.55, -0.55], ant: 0.35, legs: [[-3, 0], [0, 0], [0, 0], [3, 0]] }],
          [12, { y: -8, sx: 0.88, sy: 1.18, rot: -0.08, swing: [-1.9, 1.9], ant: -0.75, legs: legsAll(0, 3) }],
          [18, { y: -6, sx: 0.9, sy: 1.14, rot: -0.08, swing: [-1.9, 1.9], ant: -0.7, legs: legsAll(0, 2) }],
          [30, { sx: 0.98, sy: 1.02, swing: [-0.8, 0.8], ant: -0.2 }],
          [42, {}],
        ]);
        if (f >= 6 && f < 12) { p.sx += 0.08 * c; p.sy -= 0.08 * c; }
        return { ...p, bigvote: f >= 11 && f < 36 ? (f - 11) / 25 : null, puff: f === 12 ? 0 : f > 12 && f < 24 ? (f - 12) / 12 : null };
      },
    },
    downSmash: { // [removed]: squashes flat (flatter the longer it charges, frame 8), hops and slams back down, and [removed] bursts out
      // along the floor both ways. Hits both sides; knockback goes away from Snoo
      input: 'down + heavy (X / K), hold to charge', startup: 12, active: 4, endlag: 22, damage: 13, kb: { base: 30, growth: 95, angle: 20 },
      hitbox: { x: -90, y: -24, w: 180, h: 24 }, both: true, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: (f, n, c = 0) => {
        const wide = [[-3, 0], [0, 0], [0, 0], [3, 0]], planted = [[-5, 0], [0, 0], [0, 0], [5, 0]];
        const p = tween(f, [
          [0, {}],
          [8, { sx: 1.3, sy: 0.62, swing: [-0.6, 0.6], ant: 0.3, legs: wide }],
          [9, { sx: 1.3, sy: 0.62, swing: [-0.6, 0.6], ant: 0.3, legs: wide }],
          [11, { y: -12, sx: 0.88, sy: 1.14, swing: [-1.8, 1.8], ant: -0.4, legs: legsAll(0, 2) }],
          [12, { sx: 1.32, sy: 0.7, blink: 1, swing: [-1.3, 1.3], ant: 0.5, legs: planted }],
          [16, { sx: 1.28, sy: 0.72, blink: 1, swing: [-1.2, 1.2], ant: 0.3, legs: planted }],
          [26, { sx: 1.04, sy: 0.96, swing: [-0.3, 0.3] }],
          [38, {}],
        ]);
        if (f >= 6 && f < 11) { p.sx += 0.12 * c; p.sy -= 0.1 * c; }
        return { ...p, puff: f >= 12 ? (f - 12) / 10 : null, removed: f >= 12 && f < 34 ? (f - 12) / 22 : null };
      },
    },
  },

  aerials: {
    // drawn with a preview-only air: -40 so they float in the viewer; frame 0 / the last frame = the plain airborne pose
    neutralAir: { // curls up, then spins a full turn with both arms stretched out either way: hits all around
      input: 'light (airborne)', startup: 4, active: 8, endlag: 14, damage: 6, kb: { base: 20, growth: 60, angle: 45 },
      hitbox: { x: -44, y: -80, w: 88, h: 84 }, landingLag: 8,
      anim: f => {
        const p = tween(f, [[0, AIRBORNE], [3, { sx: 0.92, sy: 1.06, arm: [-4, -4], legs: TUCK }],
          [4, { reach: [-22, 22], arm: [-2, -2], ant: -0.4, legs: legsAll(0, -2) }], [12, { reach: [-22, 22], arm: [-2, -2], ant: -0.4, legs: legsAll(0, -2) }], [26, AIRBORNE]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // spin eases out
        return { ...p, rot: f < 4 ? -0.05 * f : -0.2 + (Math.PI * 2 + 0.2) * e, air: -40 };
      },
    },
    forwardAir: { // raises the front arm behind its head, then stretches it out and chops it down in front
      input: 'forward + light (airborne)', startup: 7, active: 4, endlag: 16, damage: 9, kb: { base: 25, growth: 80, angle: 40 },
      hitbox: { x: 16, y: -52, w: 36, h: 44 }, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [6, { x: -3, sx: 0.96, sy: 1.04, rot: -0.2, arm: [0, -30], reach: [0, 6], ant: 0.4, legs: TUCK }],
          [7, { x: 4, sx: 1.06, sy: 0.95, rot: 0.25, arm: [-2, -8], reach: [0, 26], ant: -0.5, blink: 0.5, legs: legsAll(-3, -2) }],
          [11, { x: 4, sx: 1.05, sy: 0.96, rot: 0.28, arm: [-2, 4], reach: [0, 24], ant: -0.4, legs: legsAll(-3, -2) }],
          [18, { x: 2, rot: 0.1, arm: [-1, 2], reach: [0, 6], ant: 0.1, legs: TUCK }],
          [27, AIRBORNE],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40,
      }),
    },
    backAir: { // tips forward, which swings both feet out behind, and kicks them back
      input: 'back + light (airborne)', startup: 6, active: 4, endlag: 14, damage: 10, kb: { base: 30, growth: 85, angle: 145 },
      hitbox: { x: -46, y: -36, w: 30, h: 30 }, landingLag: 9,
      anim: f => tween(f, [
        [0, { ...AIRBORNE, air: -40 }],
        [5, { x: 3, sx: 0.96, sy: 1.04, rot: -0.15, arm: [-2, -2], ant: -0.2, legs: [[4, -4], [0, 0], [0, 0], [2, -3]], air: -40 }],
        [6, { x: -4, sx: 1.04, sy: 0.96, rot: 0.6, arm: [-6, 2], reach: [0, 8], ant: 0.5, blink: 0.5, legs: [[-12, -2], [0, 0], [0, 0], [-10, -4]], air: -40 }],
        [10, { x: -4, sx: 1.04, sy: 0.96, rot: 0.58, arm: [-6, 2], reach: [0, 8], ant: 0.4, blink: 0.5, legs: [[-11, -2], [0, 0], [0, 0], [-9, -4]], air: -40 }],
        [16, { x: -1, rot: 0.2, arm: [-3, 0], ant: 0.1, legs: [[-5, -3], [0, 0], [0, 0], [-4, -3]], air: -40 }],
        [24, { ...AIRBORNE, air: -40 }],
      ]),
    },
    upAir: { // a quick backflip: its feet sweep up over its head, front to back, and it hands out an upvote
      input: 'up + light (airborne)', startup: 5, active: 5, endlag: 14, damage: 7, kb: { base: 22, growth: 80, angle: 90 },
      hitbox: { x: -40, y: -92, w: 80, h: 48 }, landingLag: 7,
      anim: f => {
        const p = tween(f, [[0, AIRBORNE], [4, { sx: 1.08, sy: 0.9, arm: [2, 2], legs: TUCK }],
          [5, { arm: [-6, -6], ant: 0.3, legs: legsAll(0, 3) }], [10, { arm: [-6, -6], ant: 0.3, legs: legsAll(0, 3) }], [24, AIRBORNE]]);
        let u = Math.min(1, Math.max(0, (f - 2) / 12)); u = u * u * (3 - 2 * u);
        return { ...p, rot: -Math.PI * 2 * u, vote: f >= 6 && f < 24 ? [0, -100, (f - 6) / 18, 1] : null, air: -40 };
      },
    },
    downAir: { // flips upside down and drives its antenna straight down like a pogo stick, handing out a downvote. Spikes
      input: 'down + light (airborne)', startup: 8, active: 6, endlag: 18, damage: 11, kb: { base: 20, growth: 70, angle: 285 },
      hitbox: { x: -18, y: -30, w: 36, h: 34 }, landingLag: 14,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [7, { y: -10, rot: Math.PI * 0.92, sx: 0.94, sy: 1.06, arm: [-6, -6], ant: 0.2, legs: TUCK }],
          [8, { y: -8, rot: Math.PI, sx: 0.9, sy: 1.1, arm: [-10, -10], blink: 1, ant: -0.75, legs: legsAll(0, -3) }],
          [14, { y: -8, rot: Math.PI, sx: 0.91, sy: 1.09, arm: [-10, -10], blink: 1, ant: -0.75, legs: legsAll(0, -3) }],
          [22, { y: -6, rot: Math.PI * 1.3, arm: [-4, -4], ant: -0.3, legs: TUCK }],
          [32, { ...AIRBORNE, rot: Math.PI * 2 }],
        ]),
        vote: f >= 8 && f < 26 ? [0, 16, (f - 8) / 18, -1] : null,
        fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40,
      }),
    },
  },

  // usable on the ground and in the air. Extra fields the game reads (any fighter's specials but Claw'd's):
  //   chargeKey = the button held to charge (with chargeAt / chargeFrames / chargeMult, as smashes) · projectile.r = its radius,
  //   .grow = how much bigger a full charge makes it, .draw = its drawing (drawSpark's arguments + the shot; default the Claude spark),
  //   .wave = [px, s] bobbing up and down as it flies, .hitFx = { draw(x, y, t), dur s } an effect left where it hits
  //   burst = { vx, vy, frames, keep, from } speed held for frames from startup (or frame from; vx along facing, none = steer freely),
//           then keep = the fraction of vx left once it ends
  //   helpless = falls helpless (specialFall) once it ends in the air · oncePerAir = only once until it lands
  specials: {
    neutralSpecial: { // karma blast: points the antenna ahead and gathers an orb of karma on the ball (charge holds here, frame 10:
      // the orb swells), then nods and fires it. The longer the charge, the bigger and harder-hitting the orb
      input: 'B (V / L), no direction · hold to charge, ground or air', startup: 14, active: 2, endlag: 18, damage: 5, kb: { base: 18, growth: 55, angle: 35 },
      hitbox: null, landingLag: 10, chargeKey: 'special', chargeAt: 10, chargeFrames: 60, chargeMult: 2.2,
      projectile: { x: 30, y: -50, speed: 620, life: 0.9, r: 8, grow: 1, draw: drawKarma },
      anim: (f, n, c = 0) => {
        const p = tween(f, [
          [0, {}],
          [6, { rot: -0.08, sx: 0.98, sy: 1.02, swing: [-0.5, 0.5], ant: 0.3, orb: 3 }],
          [10, { rot: -0.12, sx: 0.96, sy: 1.04, swing: [-0.7, 0.7], ant: 0.45, orb: 6, legs: [[2, 0], [0, 0], [0, 0], [-1, 0]] }],
          [13, { rot: -0.16, sx: 0.95, sy: 1.05, swing: [-0.8, 0.8], ant: 0.5, orb: 7, legs: [[2, 0], [0, 0], [0, 0], [-1, 0]] }],
          [14, { x: 3, rot: 0.16, sx: 1.04, sy: 0.96, blink: 0.4, swing: [-0.2, 0.6], ant: 0.9, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
          [20, { x: 3, rot: 0.14, sx: 1.03, sy: 0.97, swing: [-0.2, 0.5], ant: 0.8, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
          [34, {}],
        ]);
        if (f >= 8 && f < 14) p.orb += 6 * c;
        return p;
      },
    },
    sideSpecial: { // orangered mail: pulls out an orange envelope, winds up and sends it off like a paper plane. It glides ahead in a
      // gentle wave, and pings a notification on whatever it reaches
      input: 'B (V / L) + ← →, ground or air · turns that way first', startup: 12, active: 2, endlag: 18, damage: 6, kb: { base: 22, growth: 50, angle: 40 },
      hitbox: null, landingLag: 10,
      projectile: { x: 30, y: -32, speed: 420, life: 1.4, r: 10, wave: [14, 0.7], draw: drawMail, hitFx: { draw: snooPing, dur: 0.6 } },
      anim: f => tween(f, [
        [0, {}],
        [4, { swing: [-0.2, 1], ant: 0.1, mail: [0.2, 1] }], // out it comes
        [10, { x: -2, rot: -0.14, sx: 0.97, sy: 1.03, swing: [-0.5, 1.9], ant: 0.4, mail: [-0.5, 1], legs: [[2, 0], [0, 0], [0, 0], [-1, 0]] }], // wound back
        [12, { x: 3, rot: 0.14, sx: 1.03, sy: 0.97, swing: [-0.2, 1.2], ant: -0.3, mail: [0.3, 0], legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }], // and away
        [20, { x: 3, rot: 0.12, swing: [-0.2, 1.1], ant: -0.2, legs: [[-3, 0], [0, 0], [0, 0], [2, 0]] }],
        [32, {}],
      ]),
    },
    upSpecial: { // UFO abduction: antenna beeping, it calls the saucer, which parks overhead and beams Snoo itself up out of danger,
      // hitting anything in the beam. Drops it helpless when the beam cuts out
      input: 'B (V / L) + ↑, ground or air · falls helpless after', startup: 8, active: 20, endlag: 14, damage: 5, kb: { base: 35, growth: 60, angle: 80 },
      hitbox: { x: -30, y: -150, w: 60, h: 150 }, landingLag: 16, burst: { vy: -620, frames: 20 }, helpless: true,
      anim: f => {
        const lifted = { swing: [-1.9, 1.9], blink: 0.5, legs: legsAll(0, 3) };
        const p = tween(f, [
          [0, {}],
          [6, { sx: 1.06, sy: 0.94, rot: -0.1, swing: [-0.6, 0.6], ant: -0.75 }],
          [8, { ...lifted, sx: 0.94, sy: 1.08, ant: -0.4 }],
          [28, { ...lifted, sx: 0.95, sy: 1.07, ant: -0.4 }],
          [34, { swing: [-1.6, 1.6], legs: legsAll(0, 2) }],
          [42, {}],
        ]);
        if (f >= 8 && f < 28) p.rot = 0.12 * Math.sin((f - 8) / 20 * Math.PI * 3); // dangling, twirling a little in the beam
        const ufo = f < 40 ? tween(f, [ // [x, y, beam, tilt] above Snoo: drops in, beams down onto it, cuts out, zips off
          [0, { u: [0, -320, 0, 0] }], [6, { u: [0, -150, 0, 0.08] }], [8, { u: [0, -150, 1, 0] }], [28, { u: [0, -145, 1, 0] }],
          [31, { u: [0, -150, 0, -0.05] }], [40, { u: [120, -280, 0, 0.3] }],
        ]).u : null;
        if (ufo) ufo[4] = f / 6;
        return { ...p, ufo, signal: f < 8 ? f / 8 : null };
      },
    },
    downSpecial: { // [deleted]: glitches and blinks out into a [deleted] tag that zips off the way it's held (or ahead), then pops back
      // into Snoo there, hitting all around. Can't be hurt while deleted; holds its height in the air, once until it lands
      input: 'B (V / L) + ↓, ground or air · + ← → picks the way · once until it lands', startup: 18, active: 4, endlag: 16, damage: 7, kb: { base: 35, growth: 55, angle: 50 },
      hitbox: { x: -40, y: -72, w: 80, h: 72 }, both: true, intangible: [6, 18], landingLag: 10,
      burst: { from: 9, vx: 1400, vy: 0, frames: 8, keep: 0 }, oncePerAir: true,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { sx: 0.9, sy: 1.1, blink: 1, swing: [-0.4, 0.4], ant: 0.3 }], // glitch: squeezed, eyes shut
          [6, { sx: 1.15, sy: 0.85, blink: 1, swing: [-1, 1], ant: -0.3 }],
          [9, { gone: 1 }], [17, { gone: 1 }], // gone: only the tag, zipping
          [18, { sx: 1.2, sy: 0.85, swing: [-1.6, 1.6], ant: 0.5 }], // back, arms flung out
          [22, { sx: 1.1, sy: 0.92, swing: [-1.4, 1.4], ant: 0.3 }],
          [38, {}],
        ]),
        deleted: f >= 6 && f < 18 ? tween(f, [[6, { k: 0 }], [9, { k: 1 }], [17, { k: 1 }], [18, { k: 0 }]]).k : 0,
        poof: f >= 18 && f < 30 ? (f - 18) / 12 : null,
      }),
    },
  },

  grabs: {
    grab: { // both stretchy arms shoot out in front and clamp; a whiff snaps them back empty
      input: 'grab (G / I), or shield + light', startup: 7, active: 3, endlag: 22, hitbox: { x: 16, y: -44, w: 48, h: 40 }, grab: true,
      anim: f => tween(f, [
        [0, {}],
        [5, { x: -2, sx: 0.96, sy: 1.04, rot: -0.08, reach: [-4, -2], arm: [-2, -2], ant: 0.2 }],
        [7, { x: 4, sx: 1.06, sy: 0.95, rot: 0.1, reach: [44, 38], arm: [-4, -4], ant: -0.3, legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [10, { x: 4, sx: 1.05, sy: 0.96, rot: 0.1, reach: [42, 36], arm: [-4, -4], ant: -0.25, legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [17, { x: 2, rot: 0.04, reach: [8, 6], ant: 0.1 }],
        [32, {}],
      ]),
    },
    dashGrab: { // out of a run: dives forward with both arms stretched out ahead, sliding on the momentum
      input: 'grab while running', startup: 9, active: 3, endlag: 28, hitbox: { x: 20, y: -44, w: 60, h: 40 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, { y: -3, rot: 0.12, swing: -0.9 }], // = run frame 0
          [5, { x: -2, sx: 1.06, sy: 0.92, rot: -0.04, reach: [-2, -2], ant: 0.2 }],
          [9, { x: 12, y: -2, sx: 1.08, sy: 0.92, rot: 0.3, reach: [50, 44], arm: [-6, -6], ant: -0.5, blink: 0.4, legs: [[-8, -2], [0, 0], [0, 0], [4, 0]] }],
          [12, { x: 14, sx: 1.07, sy: 0.93, rot: 0.28, reach: [48, 42], arm: [-6, -6], ant: -0.4, legs: [[-8, -2], [0, 0], [0, 0], [4, 0]] }],
          [24, { x: 8, rot: 0.1, reach: [10, 8], ant: 0.1 }],
          [40, {}],
        ]),
        speed: f >= 9 && f < 20 ? 1 - (f - 9) / 11 : 0, dust: f >= 9 && f < 21 ? (f - 9) / 12 : null,
      }),
    },
    hold: { // got it: held out at arm's length, leaning back a little, antenna bobbing
      ...MOVESET.grabs.hold, input: 'grab connects',
      anim: (f, n = 60) => {
        const b = Math.sin(f / n * Math.PI * 4);
        return { ...SNOO_HOLD, rot: -0.06 + 0.02 * b, sx: 1.01 + 0.01 * b, sy: 0.99 - 0.01 * b, ant: 0.15 * b, carry: [52, -4 + b, 0] };
      },
    },
    pummel: { // nods and bonks it with the antenna ball
      input: 'light (holding)', startup: 5, active: 1, endlag: 10, damage: 1.5,
      anim: f => tween(f, [
        [0, SNOO_HOLD],
        [4, { ...SNOO_HOLD, rot: -0.14, ant: -0.4 }],
        [5, { ...SNOO_HOLD, rot: 0.22, ant: 1.5, blink: 0.6, carry: [53, -3, 0.05] }],
        [16, SNOO_HOLD],
      ]),
    },
    forwardThrow: { // sets it down, pulls out the ban hammer and golf-swings it away
      input: 'forward (holding)', startup: 12, active: 1, endlag: 20, damage: 7, kb: { base: 55, growth: 55, angle: 35 },
      anim: throwAnim({ at: 12, n: 33, fly: [12, -5, 0.15], keys: [
        [0, { ...SNOO_HOLD, hammer: [-0.6, 0] }],
        [5, { x: -3, rot: -0.2, swing: [-0.6, 2], ant: 0.5, legs: [[3, 0], [0, 0], [0, 0], [-2, 0]], carry: [50, 0, 0], hammer: [-1, 1] }], // let go, hammer back
        [10, { x: -4, rot: -0.24, swing: [-0.6, 2.05], ant: 0.55, legs: [[3, 0], [0, 0], [0, 0], [-2, 0]], carry: [50, 0, 0], hammer: [-1.1, 1] }],
        [12, { x: 6, sx: 1.06, sy: 0.94, rot: 0.2, blink: 1, swing: [-0.8, 1.2], ant: -0.6, legs: [[-8, 0], [0, 0], [0, 0], [3, 0]], carry: [52, -4, 0.2], hammer: [1.2, 1] }], // swing
        [20, { x: 5, rot: 0.16, swing: [-0.6, 1.1], ant: -0.3, hammer: [1.3, 1] }],
        [28, { x: 2, swing: [0, 0.6], hammer: [0.8, 1] }],
        [33, { hammer: [0.6, 0] }],
      ], extra: f => ({ speed: f >= 12 && f < 20 ? 1 - (f - 12) / 8 : 0 }) }),
    },
    backThrow: { // hoists it up over its head and heaves it over backwards
      input: 'back (holding)', startup: 16, active: 1, endlag: 20, damage: 9, kb: { base: 60, growth: 62, angle: 42 },
      anim: throwAnim({ at: 16, n: 37, fly: [-12, -4, -0.15], keys: [
        [0, SNOO_HOLD],
        [6, { rot: -0.1, sx: 0.94, sy: 1.08, swing: [-1.6, 1.6], ant: 0.3, carry: [32, -60, -0.8] }],
        [12, { rot: -0.34, sx: 0.96, sy: 1.06, swing: [-1.9, 1.9], ant: 0.6, carry: [-16, -80, -2.2] }],
        [16, { rot: -0.44, sx: 1.08, sy: 0.92, blink: 0.6, swing: [-1.2, 1.2], ant: 0.8, carry: [-58, -26, -3] }],
        [22, { rot: -0.3, sx: 1.06, sy: 0.94, swing: [-0.6, 0.6], ant: 0.4 }],
        [37, {}],
      ] }),
    },
    upThrow: { // tosses it up and springs after it, poking it higher with the antenna: an upvote
      input: 'up (holding)', startup: 14, active: 1, endlag: 20, damage: 6, kb: { base: 70, growth: 45, angle: 90 },
      anim: throwAnim({ at: 14, n: 35, fly: [0, -14, 0.05], keys: [
        [0, SNOO_HOLD],
        [6, { sx: 1.1, sy: 0.9, swing: [-0.4, 0.4], reach: [20, 16], ant: 0.2, carry: [40, -14, 0] }],
        [10, { sx: 1.12, sy: 0.88, swing: [-1.4, 1.4], ant: 0.3, carry: [24, -70, 0.2] }], // up it goes
        [14, { y: -8, sx: 0.88, sy: 1.18, swing: [-1.9, 1.9], ant: -0.75, legs: legsAll(0, 3), carry: [6, -96, 0.3] }], // poke
        [20, { y: -5, sx: 0.92, sy: 1.1, swing: [-1.7, 1.7], ant: -0.7, legs: legsAll(0, 2) }],
        [35, {}],
      ], extra: f => ({ vote: f >= 14 && f < 34 ? [8, -118, (f - 14) / 20, 1] : null }) }),
    },
    downThrow: { // lifts it and slams it into the floor with a downvote, where it bounces up
      input: 'down (holding)', startup: 14, active: 1, endlag: 20, damage: 6, kb: { base: 45, growth: 50, angle: 80 },
      anim: throwAnim({ at: 14, n: 35, fly: [2, -9, 0.1], keys: [
        [0, SNOO_HOLD],
        [6, { y: -4, sx: 0.92, sy: 1.1, rot: -0.05, reach: [30, 26], arm: [-10, -10], ant: 0.3, carry: [44, -30, -0.1] }],
        [11, { y: -6, sx: 0.9, sy: 1.12, rot: -0.08, reach: [30, 26], arm: [-12, -12], ant: 0.4, carry: [46, -42, 0] }],
        [14, { sx: 1.2, sy: 0.82, rot: 0.2, blink: 1, reach: [36, 30], arm: [4, 4], ant: -0.5, carry: [52, 0, 0] }], // slam
        [22, { sx: 1.08, sy: 0.93, rot: 0.08, reach: [12, 10], ant: -0.1 }],
        [35, {}],
      ], extra: f => ({ puff: f >= 14 ? (f - 14) / 10 : null, vote: f >= 14 && f < 32 ? [52, -66, (f - 14) / 18, -1] : null }) }),
    },
  },

  ledge: { // Claw'd's x / air path (it's the game's root motion there), Snoo's arms
    ledgeGrab: {
      ...MOVESET.ledge.ledgeGrab,
      anim: f => tween(f, [ // catches it with both stretchy arms, drops and stretches, settles into the hang
        [0, { x: -60, air: 28, sx: 0.9, sy: 1.14, swing: [0.3, 0.5], reach: [40, 20], ant: -0.4, legs: legsAll(0, 3) }],
        [4, { x: -60, air: 46, sx: 1.06, sy: 0.94, swing: [0.34, 0.6], reach: [52, 30], ant: 0.3, legs: legsAll(0, 5) }],
        [10, SNOO_HANG],
      ]),
    },
    ledgeHang: {
      ...MOVESET.ledge.ledgeHang,
      anim: (f, n) => { // dangling, peeking over the lip: slow sway, feet trailing, antenna nodding
        const s = Math.sin(f / n * Math.PI * 2);
        return { ...SNOO_HANG, rot: 0.04 * s, ant: 0.15 * s, legs: [[-s, 3], [0, 0], [0, 0], [-s, 3]], blink: f >= 40 && f < 46 ? 1 : 0 };
      },
    },
    ledgeGetup: {
      ...MOVESET.ledge.ledgeGetup,
      anim: f => ({ // dips, hauls up over the lip arms flung up, squashes down onto the stage
        ...tween(f, [
          [0, SNOO_HANG],
          [5, SNOO_PULL],
          [11, { x: -46, air: -6, sx: 0.9, sy: 1.14, rot: 0.25, swing: [-1.6, 1.6], ant: -0.4, legs: TUCK }],
          [16, { x: -14, air: -4, rot: 0.15, swing: [-1.2, 1.2], legs: TUCK }],
          [19, { sx: 1.16, sy: 0.8, swing: [-0.5, 0.5], ant: 0.3 }],
          [24, {}],
        ]),
        puff: f >= 19 ? (f - 19) / 5 : null,
      }),
    },
    ledgeJump: {
      ...MOVESET.ledge.ledgeJump,
      anim: f => tween(f, [ // pulls down, springs straight up arms first, drifts over the stage
        [0, SNOO_HANG],
        [4, { ...SNOO_PULL, air: 48, sx: 1.1, sy: 0.88 }],
        [6, { x: -58, air: 40, sx: 0.86, sy: 1.22, swing: [-1.9, 1.9], ant: -0.75, legs: legsAll(0, 3) }],
        [20, { x: -40, air: -90, sx: 1.04, sy: 0.96, swing: [-1.2, 1.2], legs: TUCK }],
        [34, { x: -24, air: -40, sx: 0.94, sy: 1.08, swing: [-1.6, 1.6], legs: REACH }],
        [40, { x: -20, air: -30, sx: 0.94, sy: 1.08, swing: [-1.6, 1.6], legs: REACH }],
      ]),
    },
    ledgeRoll: {
      ...MOVESET.ledge.ledgeRoll,
      anim: f => { // hauls up, curls into a ball and rolls a full turn onto the stage, pops up standing well inland
        const p = tween(f, [
          [0, SNOO_HANG],
          [5, SNOO_PULL],
          [10, { ...SNOO_TUCK, x: -40, air: -10, sx: 0.86, sy: 0.86, legs: TUCK }],
          [25, { ...SNOO_TUCK, x: 72, air: -4, sx: 0.86, sy: 0.86, legs: TUCK }],
          [28, { x: 84, sx: 1.14, sy: 0.82, swing: [-0.5, 0.5] }],
          [36, { x: 90 }],
        ]);
        const e = Math.min(1, Math.max(0, (f - 9) / 17));
        return { ...p, rot: Math.PI * 2 * e * e * (3 - 2 * e), puff: f >= 26 && f < 32 ? (f - 26) / 6 : null };
      },
    },
    ledgeAttack: {
      ...MOVESET.ledge.ledgeAttack,
      anim: f => ({ // hauls up, lands low and shoots the front arm out along the stage
        ...tween(f, [
          [0, SNOO_HANG],
          [4, SNOO_PULL],
          [9, { x: -44, air: -8, sx: 0.9, sy: 1.14, rot: 0.25, swing: [-1.6, 1.6], ant: -0.4, legs: TUCK }],
          [13, { x: -16, air: -4, rot: -0.1, swing: [-0.6, 0.4], reach: [0, -4], ant: 0.4, legs: TUCK }],
          [15, { x: -6, sx: 1.14, sy: 0.84, rot: -0.12, swing: [-0.6, 0.3], reach: [0, -4], ant: 0.5 }],
          [16, { x: 4, sx: 1.14, sy: 0.86, rot: 0.14, arm: [0, 4], reach: [0, 46], ant: -0.4, legs: [[-6, 0], [0, 0], [0, 0], [3, 0]] }],
          [20, { x: 4, sx: 1.12, sy: 0.87, rot: 0.13, arm: [0, 4], reach: [0, 44], ant: -0.3, legs: [[-6, 0], [0, 0], [0, 0], [3, 0]] }],
          [28, { x: 2, rot: 0.04, reach: [0, 8], ant: 0.1, legs: [[-2, 0], [0, 0], [0, 0], [1, 0]] }],
          [36, {}],
        ]),
        speed: f >= 16 && f < 20 ? 0.6 : 0,
        puff: f >= 15 && f < 21 ? (f - 15) / 6 : null,
      }),
    },
    ledgeDrop: {
      ...MOVESET.ledge.ledgeDrop,
      anim: f => tween(f, [ // lets go: arms stay up a moment, then it slides down the wall
        [0, SNOO_HANG],
        [4, { x: -62, air: 50, sx: 0.92, sy: 1.1, swing: [-1.9, 1.9], ant: -0.5, legs: legsAll(0, 3) }],
        [16, { x: -66, air: 110, sx: 0.96, sy: 1.04, swing: [-1.6, 1.6], ant: -0.3, legs: legsAll(0, 2) }],
        [24, { x: -66, air: 110, sx: 0.96, sy: 1.04, swing: [-1.6, 1.6], ant: -0.3, legs: legsAll(0, 2) }],
      ]),
    },
  },

  defense: {
    shield: { // hold: crouches behind a big green mod shield, eyes squeezed shut (in the game it shrinks and cracks as it wears down)
      input: 'hold dodge (Shift / Z)', frames: 60,
      anim: f => {
        const brace = { sx: 1.05, sy: 0.9, blink: 1, swing: [0.4, 1.3], reach: [0, 6], ant: -0.4, legs: [[-3, 0], [0, 0], [0, 0], [3, 0]], shield: 1 };
        const p = tween(f, [[0, {}], [4, brace], [50, brace], [57, {}], [60, {}]]);
        if (f > 4 && f < 50) p.sy += 0.01 * Math.sin((f - 4) / 46 * Math.PI * 4); // breathing behind it
        return { ...p, wear: Math.min(1, Math.max(0, (f - 4) / 46)) }; // preview wears it out over the hold (the game uses the real shield health)
      },
    },
    shieldBreak: snooOver(MOVESET.defense.shieldBreak, f => ({ // the mod shield shatters, Snoo pops up flailing and lands dizzy, rate-limited
      ...tween(f, [[0, { swing: [-1.9, 1.9], ant: -0.8 }], [14, { swing: [-1.4, 1.4], ant: -0.4 }], [28, { swing: [-1.7, 1.7] }], [32, { swing: [-0.6, 0.6], ant: 0.5 }]]),
      ...(f >= 32 && f < 144 ? { ant: 0.5 * Math.sin((f - 32) / 6) } : {}), // antenna wobbling with the dizziness
      oopsMsg: ['you are doing that too much', 'try again in 9 minutes'],
    })),
    spotDodge: snooOver(MOVESET.defense.spotDodge, f => tween(f, [ // shrinks into the page, arms and antenna pulled in
      [0, {}], [3, { swing: [-0.4, 0.4] }], [6, SNOO_TUCK], [16, SNOO_TUCK], [21, { swing: [-0.3, 0.3], ant: 0.2 }], [26, {}]])),
    rollForward: snooOver(MOVESET.defense.rollForward, f => tween(f, [[0, {}], [5, SNOO_TUCK], [22, SNOO_TUCK], [30, {}]])), // balled up
    rollBack: snooOver(MOVESET.defense.rollBack, f => tween(f, [[0, {}], [5, SNOO_TUCK], [22, SNOO_TUCK], [30, {}]])),
    airDodgeForward: snooOver(MOVESET.defense.airDodgeForward, f => tween(f, [[0, {}], [4, { swing: -0.9, ant: -0.6 }], [18, { swing: -0.9, ant: -0.6 }], [28, {}]])), // arms streaming back
    airDodgeBack: snooOver(MOVESET.defense.airDodgeBack, f => tween(f, [[0, {}], [4, { swing: 0.9, ant: 0.6 }], [18, { swing: 0.9, ant: 0.6 }], [28, {}]])),
    airDodge: snooOver(MOVESET.defense.airDodge, f => tween(f, [[0, {}], [5, SNOO_TUCK], [18, SNOO_TUCK], [28, {}]])),
  },

  reactions: { // Claw'd's, with Snoo's arms and antenna thrown about
    hitstun: snooOver(MOVESET.reactions.hitstun, (f, n = 30) => tween(f / n * 30, [ // arms flung up, antenna whipped back, settling
      [0, { swing: [-1.5, 1.5], ant: -0.9 }], [5, { swing: [-1.3, 1.3], ant: -0.6 }], [22, { swing: [-0.3, 0.3], ant: 0.2 }], [30, {}]])),
    tumble: snooOver(MOVESET.reactions.tumble, (f, n = 40) => { // windmilling
      const p = f / n * Math.PI * 2, s = Math.sin(2 * p);
      return { swing: [-1.2 + 0.8 * s, 1.2 + 0.8 * s], ant: 0.8 * Math.sin(3 * p) };
    }),
    knockdown: snooOver(MOVESET.reactions.knockdown, f => ({ // flopped over, arms splayed and twitching, antenna bent flat
      swing: f < 14 ? [-1.8, 1.8] : [-1.6 - 0.15 * Math.sin(f / 4), 1.6 + 0.15 * Math.sin(f / 4 + 1)], ant: 1.1 })),
    tech: snooOver(MOVESET.reactions.tech, f => tween(f, [[0, { swing: [-1.4, 1.4] }], [5, { swing: [-1.9, 1.9], ant: -0.6 }], [11, { swing: [-0.6, 0.6], ant: 0.2 }], [22, {}]])),
    getup: snooOver(MOVESET.reactions.getup, f => tween(f, [[0, { swing: [-1.6, 1.6], ant: 1.1 }], [13, { swing: [0.4, -0.4], ant: -0.4 }], [18, { swing: [-1.4, 1.4], ant: 0.3 }], [26, {}]])),
    ko: snooOver(MOVESET.reactions.ko, () => ({ swing: [-1.9, 1.9], ant: -1 })), // arms up, spinning off
    respawn: { // lowered in on the platform, [restored] (the opposite of [removed]) overhead
      ...MOVESET.reactions.respawn, say: '[restored]',
      anim: f => { const p = MOVESET.reactions.respawn.anim(f); return { ...p, swing: [-0.1, 0.1], say: ['[restored]', p.say[1]] }; },
    },
  },
};
