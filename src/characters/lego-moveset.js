// Lego Man's moveset (drawn by lego.js). He fights like a minifig moves: stiff limbs swung whole on their pins (swing / kick),
// no elbows, no knees. Movement is Claw'd's (clawd-moveset.js, loaded first) except the crouch; moves not built yet are off.
// the down smash's brick k (of this throw, c = 0 … 1 charge): its launch speed [forward, up] in px/s
const scatterVel = (k, c) => [140 + k * (55 + 35 * c), -220 - 60 * (k % 3)];
// his crouch: plastic doesn't squash, so he sits down on the floor like a real minifig, legs straight out in front, leaning in
const SIT = { y: 14, rot: 0.1, kick: [-1.67, 1.67], swing: [0.35, 0.8] }; // the kick keeps his legs level under the lean
const seat = a => 21 - 21 * Math.cos(a) - 6.5 * Math.sin(a); // how far his hips drop so legs turned a (from hanging) still touch the floor
const LEGO_MOVESET = {
  movement: {
    ...MOVESET.movement,
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
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94 }],
          [6, { rot: Math.PI - 0.3, sx: 1.08, sy: 0.9, swing: 0.4 }],
          [11, { rot: Math.PI * 1.7, y: -14, swing: 1.5, kick: 0.4 }],
          [12, { rot: Math.PI * 2, y: 13, swing: 1.4, kick: 1.5 }],
          [16, { rot: Math.PI * 2, y: 13, swing: 1.4, kick: 1.5 }],
          [22, { rot: Math.PI * 2, y: 5, swing: 0.5, kick: 0.6 }],
          [32, { rot: Math.PI * 2 }],
        ]),
        puff: f >= 12 ? (f - 12) / 10 : null,
      }),
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
      builds: ['wreckingBall', 'rocket', 'goldBrick', 'mech'], studs: { start: 20, max: 99 },
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
