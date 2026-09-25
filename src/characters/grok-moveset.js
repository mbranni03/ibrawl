// Grok's moveset (drawn by grok.js). Movement is Claw'd's (clawd-moveset.js, loaded first), except that a ball with no legs
// gets about by bouncing: two hops a loop, squashed where it lands, stretched on the way up, rocking into each one.
const bounce = (height, lean, sx = 1, sy = 1) => (f, n) => {
  const u = 2 * f / n % 1, h = Math.sin(Math.PI * u), c = (1 - h) ** 3; // h = 0 on the floor … 1 at the top · c = the landing squash
  return { y: -height * h, sx: sx * (1 + 0.1 * c - 0.03 * h), sy: sy * (1 - 0.14 * c + 0.05 * h), rot: lean + 0.05 * Math.sin(2 * Math.PI * u) };
};
// hanging off the ledge: the ball just past the lip, squashed against the wall with its eyes peeking over (x / air as Claw'd's HANG,
// measured from standing at the lip)
const GHANG = { x: -58, air: 40, sx: 0.92, sy: 1.06, rot: -0.12 };
// a real roll: forward (d = 1) or back (-1) 120px, one full turn, squashing as it sets off and lands
const ballRoll = d => f => {
  const p = tween(f, [[0, {}], [3, { sx: 1.14, sy: 0.84 }], [6, { x: 14 * d }], [22, { x: 110 * d }], [25, { x: 120 * d, sx: 1.12, sy: 0.88 }], [30, { x: 120 * d }]]);
  const e = Math.min(1, Math.max(0, (f - 4) / 20));
  return { ...p, rot: d * Math.PI * 2 * e * e * (3 - 2 * e), squint: f >= 4 && f < 24, [d > 0 ? 'dust' : 'dustAhead']: f >= 4 && f < 16 ? (f - 4) / 12 : null };
};

// holding in the tractor beam: leaning back a touch, eyes lit, the held one floating out in front. beamed() points the beam at the
// middle of whatever's carried (while the beam's on)
const GHOLD = { rot: -0.06, sx: 1.02, sy: 0.98, glow: 1, beam: 1, carry: [72, -22, 0] };
const beamed = p => ({ ...p, beamTo: p.carry && p.beam ? [p.carry[0], p.carry[1] - 34] : p.beamTo });

const GROK_MOVESET = {
  movement: {
    ...MOVESET.movement,
    walk: { ...MOVESET.movement.walk, anim: bounce(6, 0.06) },
    run: { ...MOVESET.movement.run, anim: (f, n) => ({ ...MOVESET.movement.run.anim(f, n), ...bounce(10, 0.18)(f, n) }) }, // keeps the run's dust kicks
    crouchWalk: { ...MOVESET.movement.crouchWalk, anim: bounce(1.5, 0.05, 1.16, 0.68) },
  },

  // no arms or legs: every hit is the whole ball, sold with squash and stretch, rolling, and eyes narrowing as it commits.
  // Frame data and fields as in clawd-moveset.js; hitboxes fit the 52 x 56 ball
  groundAttacks: {
    jab1: { // quick headbutt: rock back, snap the front of the ball forward
      input: 'light', startup: 3, active: 2, endlag: 14, damage: 2.5, kb: { base: 8, growth: 25, angle: 40 },
      hitbox: { x: 20, y: -46, w: 30, h: 26 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -3, sx: 0.94, sy: 1.05, rot: -0.14 }],
          [3, { x: 7, sx: 1.12, sy: 0.92, rot: 0.24 }],
          [5, { x: 7, sx: 1.1, sy: 0.93, rot: 0.22 }],
          [10, { x: 3, sx: 1.03, sy: 0.98, rot: 0.08 }],
          [19, {}],
        ]),
        squint: f >= 3 && f < 8, speed: f >= 3 && f < 6 ? 0.4 : 0,
      }),
    },
    jab2: { // second headbutt, hopping into it so it lands higher
      input: 'light (after jab1)', startup: 3, active: 2, endlag: 16, damage: 2, kb: { base: 10, growth: 25, angle: 50 },
      hitbox: { x: 18, y: -62, w: 30, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -2, sx: 1.08, sy: 0.9, rot: -0.08 }],
          [3, { x: 6, y: -7, sx: 0.94, sy: 1.1, rot: 0.32 }],
          [5, { x: 6, y: -7, sx: 0.95, sy: 1.09, rot: 0.3 }],
          [10, { x: 2, sx: 1.08, sy: 0.92, rot: 0.06 }], // lands
          [21, {}],
        ]),
        squint: f >= 3 && f < 9,
      }),
    },
    jab3: { // finisher: coil back, then throw itself into one full forward roll and bowl through
      input: 'light (after jab2)', step: 220, startup: 5, active: 3, endlag: 24, damage: 4.5, kb: { base: 40, growth: 80, angle: 40 },
      hitbox: { x: 16, y: -52, w: 42, h: 46 },
      anim: f => {
        const e = Math.min(1, Math.max(0, (f - 4) / 10)); // the roll, eased
        return {
          ...tween(f, [
            [0, {}],
            [4, { x: -6, sx: 1.14, sy: 0.84 }],
            [5, { x: 10, sx: 1.08, sy: 0.94 }],
            [9, { x: 14, sx: 1.06, sy: 0.95 }],
            [15, { x: 10, sx: 1.1, sy: 0.9 }],
            [32, {}],
          ]),
          rot: f < 4 ? -0.3 * f / 4 : -0.3 + (Math.PI * 2 + 0.3) * e * e * (3 - 2 * e),
          squint: f >= 4 && f < 14, speed: f >= 5 && f < 12 ? 1 - (f - 5) / 7 : 0,
          dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
        };
      },
    },
    dashAttack: { // cannonball: tuck in tight out of the run and roll two full turns through them, sliding on the momentum
      input: 'light while running', startup: 6, active: 10, endlag: 20, damage: 7, kb: { base: 35, growth: 60, angle: 50 },
      hitbox: { x: 4, y: -52, w: 52, h: 50 },
      anim: f => {
        const e = Math.min(1, Math.max(0, (f - 5) / 22)), roll = 1 - (1 - e) ** 2; // fast off the mark, easing out
        return {
          ...tween(f, [
            [0, { y: -3, rot: 0.18 }], // ≈ where the run leaves it
            [4, { x: -3, sx: 1.12, sy: 0.86 }],
            [6, { x: 10, sx: 0.9, sy: 0.9 }],
            [20, { x: 12, sx: 0.9, sy: 0.9 }],
            [27, { x: 6, sx: 1.12, sy: 0.88 }], // unballs
            [36, {}],
          ]),
          rot: f < 5 ? 0.18 * (1 - f / 5) : Math.PI * 4 * roll,
          squint: f >= 5 && f < 26, speed: f >= 6 && f < 22 ? 1 - (f - 6) / 16 : 0,
          dust: f >= 6 && f < 18 ? (f - 6) / 12 : null,
        };
      },
    },
    forwardTilt: { // body check: lean back tall, then slam in stretched sideways
      input: 'forward + light', step: 260, startup: 6, active: 3, endlag: 18, damage: 8, kb: { base: 20, growth: 70, angle: 35 },
      hitbox: { x: 22, y: -46, w: 42, h: 38 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: -5, sx: 0.9, sy: 1.1, rot: -0.22 }],
          [6, { x: 10, sx: 1.28, sy: 0.8, rot: 0.16 }],
          [9, { x: 10, sx: 1.25, sy: 0.82, rot: 0.15 }],
          [16, { x: 4, sx: 1.06, sy: 0.96, rot: 0.05 }],
          [27, {}],
        ]),
        squint: f >= 6 && f < 13, speed: f >= 6 && f < 10 ? 0.6 : 0,
      }),
    },
    upTilt: { // squash, then spring straight up and bonk it with the top of the ball; lands with a bounce
      input: 'up + light', startup: 5, active: 4, endlag: 16, damage: 6, kb: { base: 25, growth: 80, angle: 88 },
      hitbox: { x: -16, y: -98, w: 54, h: 42 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { sx: 1.22, sy: 0.76 }],
          [5, { y: -16, sx: 0.86, sy: 1.22, rot: -0.1 }],
          [9, { y: -20, sx: 0.9, sy: 1.16, rot: -0.08 }],
          [15, { y: -2, sx: 0.96, sy: 1.05 }],
          [18, { sx: 1.14, sy: 0.86 }],
          [25, {}],
        ]),
        squint: f >= 4 && f < 12, puff: f >= 17 && f < 24 ? (f - 17) / 7 : null,
      }),
    },
    downTilt: { // from the crouch: flatten into a pancake and skid in low along the floor
      input: 'down + light', startup: 5, active: 3, endlag: 12, damage: 5, kb: { base: 15, growth: 50, angle: 20 },
      hitbox: { x: 22, y: -22, w: 42, h: 20 },
      anim: f => ({
        ...tween(f, [
          [0, CROUCH],
          [4, { ...CROUCH, x: -3, rot: -0.06 }],
          [5, { ...CROUCH, x: 8, sx: 1.42, sy: 0.52, rot: 0.08 }],
          [8, { ...CROUCH, x: 8, sx: 1.4, sy: 0.53, rot: 0.08 }],
          [14, { ...CROUCH, x: 3, sx: 1.26, sy: 0.6 }],
          [20, CROUCH],
        ]),
        squint: f >= 5 && f < 11, dustAhead: f >= 5 && f < 15 ? (f - 5) / 10 : null,
      }),
    },
    getupAttack: { // from upside down: rock, flip upright, and spin in place like a top, clearing both sides. Can't be hurt until it hits
      input: 'light / heavy (from knockdown)', startup: 12, active: 6, endlag: 16, damage: 6, kb: { base: 50, growth: 40, angle: 30 },
      hitbox: { x: -60, y: -40, w: 120, h: 40 }, both: true, intangible: [0, 12],
      anim: f => ({
        ...tween(f, [
          [0, { sx: 1.04, sy: 0.94 }],
          [6, { sx: 1.12, sy: 0.86 }],
          [11, { y: -14, sx: 0.9, sy: 1.1 }],
          [12, { sx: 1.3, sy: 0.74 }],
          [18, { sx: 1.26, sy: 0.76 }],
          [24, { sx: 1.08, sy: 0.92 }],
          [34, {}],
        ]),
        rot: f < 6 ? Math.PI - 0.3 * f / 6 : f < 12 ? Math.PI - 0.3 + (Math.PI + 0.3) * (f - 6) / 6 : 2 * Math.PI + Math.sin((f - 12) * 1.1) * 0.25 * Math.max(0, 1 - (f - 12) / 14),
        squint: f >= 10 && f < 18, puff: f >= 12 ? (f - 12) / 12 : null,
      }),
    },
  },

  // hold to charge (chargeFrames, chargeMult, chargeAt as Claw'd's): the anim gets the charge held so far, c = 0 … 1
  smashAttacks: {
    forwardSmash: { // Community Note: rear back while a note types itself out overhead (more of it the longer the charge), then headbutt
      // the card into them. The hitbox is the card, reaching past the ball; it stays stuck on whoever it hits for a moment
      input: 'heavy (X / K), hold to charge', step: 240, startup: 16, active: 4, endlag: 30, damage: 15, kb: { base: 32, growth: 100, angle: 38 },
      hitbox: { x: 24, y: -64, w: 66, h: 50 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 10,
      sticker: { secs: 1.2, draw: (x, y, rot, a) => drawStuckNote(x, y, rot, a) },
      anim: (f, n, c = 0) => {
        const p = tween(f, [
          [0, {}],
          [10, { x: -6, sx: 0.92, sy: 1.1, rot: -0.25 }],
          [15, { x: -8, sx: 0.9, sy: 1.12, rot: -0.3 }],
          [16, { x: 12, sx: 1.26, sy: 0.82, rot: 0.28 }],
          [20, { x: 12, sx: 1.24, sy: 0.83, rot: 0.26 }],
          [32, { x: 6, sx: 1.06, sy: 0.95, rot: 0.08 }],
          [50, {}],
        ]);
        const k = tween(f, [ // the card: [dx, dy, tilt, _, size]
          [0, { note: [6, -80, -0.1, 0, 0] }],
          [6, { note: [8, -86, -0.08, 0, 1.08] }],
          [8, { note: [10, -84, -0.08, 0, 1] }],
          [15, { note: [0, -80, -0.14, 0, 1] }], // pulled back…
          [16, { note: [58, -42, 0.14, 0, 1] }], // …slammed forward
          [22, { note: [64, -42, 0.16, 0, 1] }],
          [30, { note: [66, -36, 0.2, 0, 0] }],
        ]).note;
        k[3] = Math.min(1, f / 16 + c);
        return { ...p, note: f < 30 ? k : null, squint: f >= 14 && f < 24, speed: f >= 16 && f < 22 ? 0.7 : 0 };
      },
    },
    upSmash: { // Trending: squash down, then spray a fountain of X posts up out of its top. Anyone above gets carried up the column
      // by a hit every `every` frames (damage / kb), and the last one (finisher) launches them
      input: 'up + heavy (X / K), hold to charge', startup: 10, active: 25, every: 5, endlag: 22, damage: 1.5, kb: { base: 22, growth: 0, angle: 90 },
      finisher: { damage: 6, kb: { base: 34, growth: 100, angle: 90 } },
      hitbox: { x: -38, y: -160, w: 76, h: 130 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 7,
      anim: (f, n, c = 0) => {
        const p = tween(f, [
          [0, {}],
          [7, { sx: 1.24 + 0.08 * c, sy: 0.74 - 0.06 * c }], // squashes lower the longer it charges
          [10, { y: -4, sx: 0.84, sy: 1.24, rot: -0.12 }],
          [35, { y: -3, sx: 0.86, sy: 1.2, rot: -0.1 }],
          [40, { sx: 0.96, sy: 1.05 }],
          [47, {}],
        ]);
        if (f >= 10 && f < 35) p.sy += 0.04 * Math.sin(f * 1.6); // shuddering as they pour out
        return {
          ...p, squint: f >= 4 && f < 38, posts: f >= 10 && f < 44 ? [f - 10, Math.min(1, (f - 10) / 3, (44 - f) / 6)] : null,
          say: f >= 10 && f < 40 ? ['#1 trending', Math.min(1, (f - 10) / 3, (40 - f) / 4)] : null,
        };
      },
    },
    downSmash: { // The Boring Company: spin up like a drill (faster with charge) and screw down into the floor, spraying dirt both ways
      // (a small hit), then tunnel: steered with ← →, or left alone it digs on ahead; pops out as tunnelOut (burrow: in index.html)
      input: 'down + heavy (X / K), hold to charge · ← → steer underground, attack / jump to pop out', startup: 12, active: 4, endlag: 8,
      damage: 4, kb: { base: 40, growth: 30, angle: 75 }, hitbox: { x: -56, y: -22, w: 112, h: 22 }, both: true,
      chargeFrames: 60, chargeMult: 1.4, chargeAt: 7, burrow: { out: 'tunnelOut', speed: 300, dist: 200, max: 90 }, // px/s · px dug if not steered · frames under at most
      anim: (f, n, c = 0) => {
        const p = tween(f, [
          [0, {}],
          [7, { sx: 1.12, sy: 0.88 }],
          [10, { sx: 0.88, sy: 1.1 }],
          [24, { sx: 0.84, sy: 1.12, sink: 60 }],
        ]);
        return {
          ...p, sink: f < 10 ? 0 : p.sink, rot: f < 7 ? f * 0.08 : 0.56 + (f - 7) * 0.9 + 14 * c, // spins up, and keeps spinning while charged
          squint: f >= 5, debris: f >= 12 && f < 26 ? (f - 12) / 14 : null, puff: f >= 12 && f < 20 ? (f - 12) / 8 : null,
        };
      },
    },
    tunnelOut: { // bursting back up out of the tunnel with an uppercut, both sides; keeps the down smash's charge
      input: 'end of the down smash tunnel', startup: 4, active: 5, endlag: 26, damage: 13, kb: { base: 32, growth: 98, angle: 80 },
      hitbox: { x: -34, y: -84, w: 68, h: 84 }, both: true, chargeFrames: 60, chargeMult: 1.4,
      anim: f => {
        const p = tween(f, [
          [0, { sx: 0.84, sy: 1.2, sink: 40 }],
          [4, { y: -30, sx: 0.82, sy: 1.26 }],
          [9, { y: -40, sx: 0.9, sy: 1.12 }],
          [16, { sx: 1.2, sy: 0.8 }],
          [22, { sx: 0.96, sy: 1.04 }],
          [35, {}],
        ]);
        const e = Math.min(1, f / 12);
        return {
          ...p, rot: Math.PI * 2 * (1 - (1 - e) ** 2), squint: f < 12,
          debris: f < 14 ? f / 14 : null, puff: f < 8 ? f / 8 : f >= 16 && f < 24 ? (f - 16) / 8 : null,
        };
      },
    },
  },

  // grabs (G / U): no hands, so Grok grabs with a tractor beam out of its eyes and holds what it catches floating in it. Fields as
  // Claw'd's (carry = where the held one's bottom-centre goes); beam / beamTo draw the beam (beamed() aims it at whatever's carried).
  // hold.ratio: every pummel adds a reply against the held one's likes; once replies outnumber them they're RATIO'D (a stamp slams on)
  // and the throw after hits mult × harder (damage and knockback), the stamp riding along on them for a moment
  grabs: {
    grab: { // eyes light up and a beam shoots out ahead; a whiff lets it fizzle back
      input: 'grab (G / U)', startup: 6, active: 3, endlag: 22, hitbox: { x: 20, y: -58, w: 72, h: 46 }, grab: true,
      anim: f => {
        const ext = f < 3 ? 0 : f < 6 ? (f - 3) / 3 : f < 9 ? 1 : Math.max(0, 1 - (f - 9) / 8);
        return {
          ...tween(f, [[0, {}], [4, { sx: 0.94, sy: 1.06, rot: -0.1 }], [6, { x: 3, sx: 1.06, sy: 0.95, rot: 0.08 }], [9, { x: 3, sx: 1.05, sy: 0.96, rot: 0.08 }], [18, {}], [31, {}]]),
          glow: f >= 3 && f < 18 ? 1 : 0, beam: ext ? 0.3 + 0.7 * ext : 0, beamTo: [18 + 72 * ext, -36],
        };
      },
    },
    dashGrab: { // out of a run: skids in, beam first, sliding on the momentum
      input: 'grab while running', startup: 9, active: 3, endlag: 28, hitbox: { x: 20, y: -58, w: 84, h: 46 }, grab: true,
      anim: f => {
        const ext = f < 5 ? 0 : f < 9 ? (f - 5) / 4 : f < 12 ? 1 : Math.max(0, 1 - (f - 12) / 10);
        return {
          ...tween(f, [[0, { y: -3, rot: 0.18 }], [5, { x: -2, sx: 1.1, sy: 0.9, rot: -0.1 }], [9, { x: 8, sx: 1.12, sy: 0.9, rot: 0.1 }], [12, { x: 10, sx: 1.1, sy: 0.91, rot: 0.1 }], [24, { x: 5, sx: 1.03, sy: 0.98 }], [40, {}]]),
          glow: f >= 5 && f < 22 ? 1 : 0, beam: ext ? 0.3 + 0.7 * ext : 0, beamTo: [18 + 84 * ext, -36],
          speed: f >= 9 && f < 20 ? 1 - (f - 9) / 11 : 0, dust: f >= 9 && f < 21 ? (f - 9) / 12 : null,
        };
      },
    },
    hold: { // got one: floating in the beam, bobbing, Grok leaning back a touch
      input: 'grab connects', frames: 60, breakFree: 90, perDmg: 1.2,
      ratio: { likes: 2, mult: 1.5, draw: (x, y, r) => drawRatio(x, y, r), stamp: { secs: 1.2, draw: (x, y, rot, a) => drawRatioStamp(x, y, rot, a) } },
      anim: (f, n = 60) => {
        const b = Math.sin(f / n * Math.PI * 4);
        return beamed({ ...GHOLD, rot: -0.06 + 0.02 * b, carry: [72, -22 + 3 * b, 0.05 * b] });
      },
    },
    pummel: { // "@grok is this true?": the beam flares and zaps them. Each one is a reply toward the ratio
      input: 'light (holding)', startup: 5, active: 1, endlag: 10, damage: 1.5,
      anim: f => ({
        ...beamed(tween(f, [
          [0, GHOLD],
          [4, { ...GHOLD, sx: 0.96, sy: 1.04, beam: 0.7 }],
          [5, { ...GHOLD, sx: 1.07, sy: 0.94, beam: 1.9, carry: [75, -25, 0.1] }],
          [16, GHOLD],
        ])),
        squint: f >= 5 && f < 9, say: ['@grok is this true?', Math.max(0, Math.min(1, f / 3, (16 - f) / 4))],
      }),
    },
    forwardThrow: { // Repost: the beam swings them round in a loop, a green repost arrow circling with them, and flings them on ahead
      input: 'forward (holding)', startup: 14, active: 1, endlag: 18, damage: 7, kb: { base: 55, growth: 55, angle: 35 },
      anim: f => beamed(throwAnim({ at: 14, n: 33, fly: [13, -5, 0.2], say: ['↻ repost', 'reposted'], keys: [
        [0, GHOLD],
        [4, { ...GHOLD, carry: [60, -54, -1.6] }],
        [8, { ...GHOLD, rot: -0.12, carry: [38, -30, -3.14] }],
        [11, { ...GHOLD, carry: [60, -6, -4.7] }],
        [14, { x: 6, rot: 0.2, sx: 1.12, sy: 0.9, glow: 1, beam: 1.4, carry: [86, -24, -6.28] }],
        [16, { x: 5, rot: 0.12, sx: 1.06, sy: 0.95 }],
        [33, {}],
      ], extra: f => ({ repost: f < 16 ? [f / 16, 60, -64] : null, speed: f >= 14 && f < 20 ? 0.6 : 0 }) })(f)),
    },
    backThrow: { // Blocked: swings them up over its head and down behind, and a block sign slams onto them as they go
      input: 'back (holding)', startup: 14, active: 1, endlag: 22, damage: 9, kb: { base: 60, growth: 62, angle: 42 },
      anim: f => beamed(throwAnim({ at: 14, n: 37, fly: [-12, -4, -0.15], say: ['🚫 block', 'blocked'], keys: [
        [0, GHOLD],
        [6, { ...GHOLD, rot: -0.2, carry: [22, -88, -1.2] }],
        [10, { ...GHOLD, rot: -0.3, carry: [-40, -74, -2.2] }],
        [14, { rot: -0.36, sx: 1.1, sy: 0.9, glow: 1, beam: 1.4, carry: [-76, -28, -3] }],
        [16, { rot: -0.25, sx: 1.05, sy: 0.96 }],
        [37, {}],
      ], extra: f => ({ blocked: f >= 14 && f < 40 ? [(f - 14) / 26, -120 - 4 * (f - 14), -70] : null }) })(f)),
    },
    upThrow: { // Going viral: lifts them overhead in the beam, then hearts burst up under them and the likes count races them skyward
      input: 'up (holding)', startup: 14, active: 1, endlag: 21, damage: 6, kb: { base: 70, growth: 45, angle: 90 },
      anim: f => beamed(throwAnim({ at: 14, n: 35, fly: [0, -14, 0.05], say: ['📈 going viral', '♥ 1.2M'], keys: [
        [0, GHOLD],
        [6, { ...GHOLD, sx: 0.95, sy: 1.06, beam: 1.2, carry: [44, -42, 0] }],
        [11, { ...GHOLD, rot: -0.2, sx: 0.92, sy: 1.1, beam: 1.2, carry: [8, -94, 0] }],
        [14, { rot: -0.24, sx: 0.88, sy: 1.14, glow: 1, beam: 1.6, carry: [0, -106, 0] }],
        [16, { rot: -0.12, sx: 0.96, sy: 1.04 }],
        [35, {}],
      ], extra: f => ({ hearts: f >= 12 && f < 40 ? [(f - 12) / 28, 0, -160] : null }) })(f)),
    },
    downThrow: { // Steamroll: drops them flat on the floor, rolls right over them and back, and they pop up flattened
      input: 'down (holding)', startup: 16, active: 1, endlag: 20, damage: 6, kb: { base: 45, growth: 50, angle: 80 },
      anim: f => {
        const p = beamed(throwAnim({ at: 16, n: 36, fly: [3, -9, 0.3], say: ['steamroll', 'flattened'], keys: [
          [0, GHOLD],
          [5, { ...GHOLD, x: -4, sx: 1.1, sy: 0.9, carry: [64, 0, -1.57] }], // dropped, lying there
          [6, { x: -4, sx: 1.1, sy: 0.9, carry: [64, 0, -1.57] }],
          [11, { x: 62, y: -24, sx: 1.08, sy: 0.92, carry: [64, 0, -1.57] }], // right over the top
          [16, { x: 4, sx: 1.16, sy: 0.86, carry: [64, 0, -1.57] }], // and back
          [22, { sx: 0.96, sy: 1.04 }],
          [36, {}],
        ], extra: f => ({ puff: f >= 16 && f < 26 ? (f - 16) / 10 : null, squint: f >= 5 && f < 16 }) })(f));
        return { ...p, rot: (p.x || 0) / GR_R }; // rolls the way a ball would over the ground it covers
      },
    },
  },

  // shield and dodges. Frame data, shield health, intangibility and air dodge physics as Claw'd's
  defense: {
    shield: { // a verified bubble pops up round it, ✓ badge up front; it hunkers down inside, eyes squeezed (the game shrinks, fades and
      // cracks the bubble as the shield wears down)
      ...MOVESET.defense.shield,
      anim: f => {
        const brace = { sx: 1.08, sy: 0.9, shield: 1 };
        const p = tween(f, [[0, {}], [4, brace], [50, brace], [57, {}], [60, {}]]);
        if (f > 4 && f < 50) p.sy += 0.01 * Math.sin((f - 4) / 46 * Math.PI * 4);
        return { ...p, squint: f >= 3 && f < 52, wear: Math.min(1, Math.max(0, (f - 4) / 46)) }; // the preview wears it out over the hold
      },
    },
    shieldBreak: { // the bubble pops: Grok's flung up, lands dizzy with a "rate limit exceeded"-style toast (mash to shake it off sooner)
      ...MOVESET.defense.shieldBreak,
      oops: [['rate limit exceeded', '429 · too many requests'], ['verification revoked', '✓ removed · subscription lapsed'], ['grok is at capacity', 'try again in a few minutes']],
      anim: f => {
        const p = tween(f, [
          [0, { sx: 0.86, sy: 1.16, blink: 1 }],
          [14, { sx: 0.96, sy: 1.05, blink: 1 }],
          [28, { sx: 0.92, sy: 1.1 }],
          [32, { sx: 1.22, sy: 0.8 }],
          [40, { sx: 1.04, sy: 0.95 }],
          [140, { sx: 1.04, sy: 0.95 }],
          [150, {}],
        ]);
        const dizzy = f >= 32 && f < 144;
        return {
          ...p, air: f < 28 ? -60 * Math.sin(Math.PI * f / 28) : 0, rot: dizzy ? 0.12 * Math.sin((f - 32) / 9) : 0, dizzy: dizzy ? 0.01 + (f - 32) / 40 : 0,
          shatter: f < 24 ? f / 24 : null, puff: f >= 28 && f < 34 ? (f - 28) / 6 : null,
          oops: Math.min(1, Math.max(0, Math.min((f - 32) / 6, (110 - f) / 10))), oopsMsg: ['rate limit exceeded', '429 · too many requests'],
        };
      },
    },
    spotDodge: { // flattens into a pancake on the floor, eyes shut, and everything goes over it; then springs back
      ...MOVESET.defense.spotDodge,
      anim: f => tween(f, [
        [0, {}],
        [3, { sx: 1.2, sy: 0.8 }],
        [6, { sx: 1.5, sy: 0.36, blink: 1 }],
        [16, { sx: 1.5, sy: 0.36, blink: 1 }],
        [21, { sx: 0.9, sy: 1.12 }],
        [26, {}],
      ]),
    },
    rollForward: { ...MOVESET.defense.rollForward, anim: ballRoll(1) },
    rollBack: { ...MOVESET.defense.rollBack, anim: ballRoll(-1) },
    airDodgeForward: { ...MOVESET.defense.airDodgeForward }, // streaking stretched along the way it goes (Claw'd's sideDodge reads fine on a ball)
    airDodgeBack: { ...MOVESET.defense.airDodgeBack },
    airDodge: { // curls up small and spins once, eyes shut
      ...MOVESET.defense.airDodge,
      anim: f => {
        const e = Math.min(1, Math.max(0, (f - 4) / 14));
        return {
          ...tween(f, [[0, {}], [2, { sx: 1.1, sy: 0.9 }], [5, { sx: 0.8, sy: 0.8, blink: 1 }], [18, { sx: 0.8, sy: 0.8, blink: 1 }], [24, { sx: 1.05, sy: 0.97 }], [28, {}]]),
          rot: Math.PI * 2 * e * e * (3 - 2 * e), air: -40,
        };
      },
    },
  },

  // the ledge: the floor is the stage top and Grok faces the stage, x / air from standing right at the lip (the game places it by them)
  ledge: {
    ledgeGrab: { // smacks into the wall stretched, squashes flat against it, settles
      input: 'fall near ledge', frames: 10,
      anim: f => tween(f, [
        [0, { x: -58, air: 26, sx: 0.88, sy: 1.14, rot: -0.2 }],
        [4, { x: -56, air: 46, sx: 0.8, sy: 1.12, rot: -0.08 }],
        [10, GHANG],
      ]),
    },
    ledgeHang: { // clinging on: a slow wobble, peeking over the top, a blink
      input: 'none', frames: 60,
      anim: (f, n) => { const s = Math.sin(f / n * Math.PI * 2); return { ...GHANG, rot: -0.12 + 0.05 * s, sy: 1.06 + 0.02 * s, blink: f >= 40 && f < 46 ? 1 : 0 }; },
    },
    ledgeGetup: { // squashes down, springs up and rolls over the lip onto the stage
      input: 'toward stage / up', frames: 24,
      anim: f => {
        const p = tween(f, [
          [0, GHANG],
          [5, { x: -58, air: 48, sx: 1.08, sy: 0.88 }],
          [11, { x: -40, air: -18, sx: 0.9, sy: 1.12 }],
          [16, { x: -14, air: -6 }],
          [19, { sx: 1.18, sy: 0.8 }],
          [24, {}],
        ]);
        const e = Math.min(1, Math.max(0, (f - 5) / 14));
        return { ...p, rot: f < 5 ? p.rot : Math.PI * 2 * e * e * (3 - 2 * e), puff: f >= 19 ? (f - 19) / 5 : null };
      },
    },
    ledgeJump: { // squashes against the wall and pings straight up off it like a rubber ball
      input: 'jump', frames: 40, launchAt: 6,
      anim: f => tween(f, [
        [0, GHANG],
        [4, { x: -58, air: 52, sx: 1.14, sy: 0.84 }],
        [6, { x: -56, air: 40, sx: 0.84, sy: 1.22 }],
        [20, { x: -40, air: -90, sx: 1.04, sy: 0.96 }],
        [34, { x: -24, air: -40, sx: 0.94, sy: 1.08 }],
        [40, { x: -20, air: -30, sx: 0.94, sy: 1.08 }],
      ]),
    },
    ledgeRoll: { // hauls up and rolls a full turn onto the stage, well inland
      input: 'dodge (Shift / Z)', frames: 36, intangible: [0, 36],
      anim: f => {
        const p = tween(f, [
          [0, GHANG],
          [5, { x: -58, air: 48, sx: 1.08, sy: 0.88 }],
          [10, { x: -40, air: -10, sx: 0.9, sy: 0.9 }],
          [25, { x: 72, air: -4, sx: 0.9, sy: 0.9 }],
          [28, { x: 84, sx: 1.14, sy: 0.84 }],
          [36, { x: 90 }],
        ]);
        const e = Math.min(1, Math.max(0, (f - 9) / 17));
        return { ...p, rot: Math.PI * 2 * e * e * (3 - 2 * e), squint: f >= 8 && f < 26, puff: f >= 26 && f < 32 ? (f - 26) / 6 : null };
      },
    },
    ledgeAttack: { // pops up over the lip and bowls in low along the stage
      input: 'light / heavy (on ledge)', startup: 16, active: 4, endlag: 16, damage: 7, kb: { base: 30, growth: 50, angle: 35 },
      hitbox: { x: 26, y: -34, w: 50, h: 32 },
      anim: f => ({
        ...tween(f, [
          [0, GHANG],
          [4, { x: -58, air: 48, sx: 1.08, sy: 0.88 }],
          [9, { x: -44, air: -10, sx: 0.9, sy: 1.12 }],
          [13, { x: -16, air: -4, rot: -0.2 }],
          [15, { x: -6, sx: 1.16, sy: 0.84, rot: -0.2 }],
          [16, { x: 6, sx: 1.26, sy: 0.8, rot: 0.24 }],
          [20, { x: 6, sx: 1.24, sy: 0.82, rot: 0.22 }],
          [28, { x: 3, sx: 1.06, sy: 0.95, rot: 0.06 }],
          [36, {}],
        ]),
        squint: f >= 13 && f < 24, speed: f >= 16 && f < 20 ? 0.6 : 0, puff: f >= 15 && f < 21 ? (f - 15) / 6 : null,
      }),
    },
    ledgeDrop: { // lets go and slides down the wall
      input: 'away / down', frames: 24,
      anim: f => tween(f, [
        [0, GHANG],
        [4, { x: -60, air: 50, sx: 0.9, sy: 1.1 }],
        [16, { x: -64, air: 110, sx: 0.94, sy: 1.06 }],
        [24, { x: -64, air: 110, sx: 0.94, sy: 1.06 }],
      ]),
    },
  },

  // getting hit. Hitstun / tumble thresholds, tech window and timings as Claw'd's
  reactions: {
    hitstun: { // dented in by the hit, eyes squeezed, shudders, pops back round
      ...MOVESET.reactions.hitstun,
      anim: (f, n = 30) => {
        const t = f / n * 30, p = tween(t, [[0, { x: -5, sx: 0.78, sy: 1.18, rot: -0.3 }], [5, { x: -6, sx: 0.86, sy: 1.1, rot: -0.24 }], [22, { x: -3, sx: 1.04, sy: 0.97, rot: -0.06 }], [30, {}]]);
        if (t < 10) p.x += f % 2 ? 1.5 : -1.5;
        return { ...p, squint: t < 20 };
      },
    },
    tumble: { // launched: spinning end over end, wobbling out of shape
      ...MOVESET.reactions.tumble,
      anim: (f, n = 40) => { const p = f / n * Math.PI * 2; return { rot: -2 * p, sx: 1 + 0.08 * Math.sin(2 * p), sy: 1 - 0.08 * Math.sin(2 * p), squint: true, air: -30 }; },
    },
    knockdown: { // splats flat on the floor upside down, bounces, then lies there wobbling, seeing stars
      ...MOVESET.reactions.knockdown,
      anim: f => ({
        ...tween(f, [[0, { sx: 1.4, sy: 0.56 }], [6, { y: -16, sx: 0.92, sy: 1.08 }], [12, { sx: 1.26, sy: 0.72 }], [18, { sx: 1.1, sy: 0.88 }]]),
        rot: Math.PI + (f >= 18 ? 0.08 * Math.sin((f - 18) / 5) : 0), squint: f < 14,
        dizzy: f >= 14 ? 0.01 + (f - 14) / 40 : 0, puff: f < 8 ? f / 8 : f >= 12 && f < 18 ? (f - 12) / 6 : null,
      }),
    },
    tech: { // slaps the floor and bounces straight back up the right way round
      ...MOVESET.reactions.tech,
      anim: f => ({
        ...tween(f, [[0, { sx: 1.36, sy: 0.62 }], [5, { y: -20, sx: 0.88, sy: 1.14 }], [11, { sx: 1.14, sy: 0.84 }], [22, {}]]),
        ring: f < 12 ? f / 12 : null, squint: f < 5,
      }),
    },
    getup: { // rocks, then rolls back over onto its bottom with a hop
      ...MOVESET.reactions.getup,
      anim: f => {
        const p = tween(f, [[0, { sx: 1.1, sy: 0.9 }], [5, { sx: 1.14, sy: 0.86 }], [13, { y: -22, sx: 0.92, sy: 1.08 }], [18, { sx: 1.16, sy: 0.84 }], [26, {}]]);
        const e = Math.min(1, Math.max(0, (f - 5) / 13));
        return { ...p, rot: f < 5 ? Math.PI - 0.2 * f / 5 : Math.PI - 0.2 + (Math.PI + 0.2) * e * e * (3 - 2 * e), puff: f >= 18 ? (f - 18) / 8 : null };
      },
    },
    ko: { // spins off shrinking, then a burst of ink and blue rays where it left
      ...MOVESET.reactions.ko,
      anim: f => f < 20
        ? { x: 7 * f, air: -5 * f, rot: -f / 3, sx: 1 - f / 40, sy: 1 - f / 40, squint: true }
        : { air: -100, blast: [(f - 20) / 60, Math.PI - 0.6], blastDraw: (x, y, t, ang) => drawGrokBlast(x, y, t, ang) }, // right on the edge it left by
    },
    respawn: { // lowered in on the platform (an X on its front); stands there until any input, then drops
      ...MOVESET.reactions.respawn, say: '> grok: back online', mark: (x, y, r) => drawXMark(x, y, r),
      anim: f => { const p = MOVESET.reactions.respawn.anim(f); return { ...p, say: p.say && ['> grok: back online', p.say[1]], padMark: (x, y, r) => drawXMark(x, y, r) }; },
    },
  },

  // drawn with a preview-only air: -40 like Claw'd's; rot always ends on a whole turn so the eyes land back on the front
  aerials: {
    neutralAir: { // spin in place twice, fast then easing off: the whole ball is the hitbox
      input: 'light (airborne)', startup: 4, active: 8, endlag: 14, damage: 6, kb: { base: 20, growth: 60, angle: 45 },
      hitbox: { x: -36, y: -64, w: 72, h: 70 }, landingLag: 8,
      anim: f => {
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 3) / 16))) ** 2;
        return {
          ...tween(f, [[0, {}], [3, { sx: 1.1, sy: 0.9 }], [4, { sx: 0.94, sy: 0.94 }], [14, { sx: 0.94, sy: 0.94 }], [26, {}]]),
          rot: f < 3 ? -0.2 * f / 3 : -0.2 + (Math.PI * 4 + 0.2) * e, squint: f >= 3 && f < 16, air: -40,
        };
      },
    },
    forwardAir: { // front flip: rear back, then bring the top of the ball over and down onto whatever's in front
      input: 'forward + light (airborne)', startup: 7, active: 4, endlag: 16, damage: 9, kb: { base: 25, growth: 80, angle: 40 },
      hitbox: { x: 14, y: -58, w: 46, h: 52 }, landingLag: 10,
      anim: f => {
        const e = Math.min(1, Math.max(0, (f - 5) / 9));
        return {
          ...tween(f, [
            [0, {}],
            [5, { x: -4, sx: 0.92, sy: 1.08 }],
            [7, { x: 8, y: 4, sx: 1.16, sy: 0.9 }],
            [11, { x: 8, y: 4, sx: 1.12, sy: 0.92 }],
            [18, { x: 3, sx: 1.03, sy: 0.98 }],
            [27, {}],
          ]),
          rot: f < 5 ? -0.45 * f / 5 : -0.45 + (Math.PI * 2 + 0.45) * e * e * (3 - 2 * e),
          squint: f >= 6 && f < 13, speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40,
        };
      },
    },
    backAir: { // hurl itself backwards and squash its back into them, eyes still facing forward
      input: 'back + light (airborne)', startup: 6, active: 4, endlag: 14, damage: 10, kb: { base: 30, growth: 85, angle: 145 },
      hitbox: { x: -64, y: -52, w: 40, h: 44 }, landingLag: 9,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: 4, sx: 0.92, sy: 1.08, rot: 0.2 }],
          [6, { x: -12, sx: 1.28, sy: 0.8, rot: -0.28 }],
          [10, { x: -12, sx: 1.25, sy: 0.82, rot: -0.26 }],
          [16, { x: -4, sx: 1.05, sy: 0.96, rot: -0.08 }],
          [24, {}],
        ]),
        squint: f >= 5 && f < 12, speed: f >= 6 && f < 10 ? -0.6 : 0, air: -40,
      }),
    },
    upAir: { // stretch tall and headbutt straight up, tipped back so the top of the ball leads
      input: 'up + light (airborne)', startup: 5, active: 5, endlag: 14, damage: 7, kb: { base: 22, growth: 80, angle: 90 },
      hitbox: { x: -28, y: -104, w: 56, h: 50 }, landingLag: 7,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { y: 4, sx: 1.16, sy: 0.84, rot: 0.1 }],
          [5, { y: -10, sx: 0.84, sy: 1.26, rot: -0.3 }],
          [10, { y: -9, sx: 0.86, sy: 1.23, rot: -0.28 }],
          [17, { y: -2, sx: 0.97, sy: 1.04, rot: -0.08 }],
          [24, {}],
        ]),
        squint: f >= 5 && f < 13, air: -40,
      }),
    },
    downAir: { // cannonball: curl up, then plunge bottom-first, stretched like a dropped water balloon. Spikes
      input: 'down + light (airborne)', startup: 8, active: 6, endlag: 18, damage: 11, kb: { base: 20, growth: 70, angle: 285 },
      hitbox: { x: -28, y: -16, w: 56, h: 30 }, landingLag: 14,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [7, { y: -8, sx: 1.14, sy: 0.84 }],
          [8, { y: 6, sx: 0.84, sy: 1.2 }],
          [14, { y: 5, sx: 0.85, sy: 1.18 }],
          [22, { sx: 1.02, sy: 0.98 }],
          [32, {}],
        ]),
        squint: f >= 6 && f < 16, blink: f >= 3 && f < 7 ? 0.5 : 0, fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40,
      }),
    },
  },

  // Grok's own specials run as their own states (state: …; bindMoves in index.html), clear of Claw'd's hard-wired ones
  specials: {
    neutralSpecial: { // Grok Imagine: hold B and a card overhead counts up as it generates (a sparkle beside it); let go (or hit 100%)
      // and it flings the picture, a polaroid of some AI slip-up (six fingers, three eyes, a melting clock). The longer the charge, the
      // bigger the picture and the harder it hits: damage × chargeMult and projectile.r × (1 + grow) at 100%. Ground or air
      input: 'B (V / L), no direction · hold to charge, let go to throw · ground or air', state: 'imagine', hold: 'special', keepOnLand: true,
      startup: 12, active: 1, endlag: 18, damage: 4, kb: { base: 20, growth: 60, angle: 30 }, chargeFrames: 90, chargeMult: 3, chargeAt: 8, landingLag: 6,
      projectile: { x: 40, y: -32, speed: 620, life: 0.8, r: 13, grow: 0.9, draw: (x, y, r, spin, sh) => drawImagined(x, y, r, sh.t, Math.sign(sh.vx) || 1, sh.pic || 0) },
      anim: (f, n, c = 0) => ({
        ...tween(f, [
          [0, {}],
          [8, { sx: 1.08, sy: 0.92, rot: -0.12 }], // hunched over it, thinking hard (the game shakes it while charging)
          [11, { x: -3, sx: 0.94, sy: 1.06, rot: -0.2 }],
          [12, { x: 7, sx: 1.16, sy: 0.9, rot: 0.24 }], // flings it
          [16, { x: 6, sx: 1.12, sy: 0.92, rot: 0.2 }],
          [30, {}],
        ]),
        squint: f >= 4 && f < 16, gen: f < 12 ? Math.min(1, c || f / 40) : null, // the viewer has no charge: it just shows it starting
      }),
    },
    upSpecial: { // Starship, like Diddy Kong's Rocketbarrel Boost: Grok climbs into a Starship and the engine builds while B is held
      // (flame roaring bigger). It can't move while charging (in the air it barely sinks); ← → swing the aim, a dotted line off the nose
      // showing it. Let go to launch that way: faster the longer the charge. In flight ← → turns it (the body is the hitbox) and B again bails out. At the end of the flight, or
      // bailing, Grok falls helpless and the empty ship flies on and blows up on whatever it hits (wreck); flying into the stage blows it
      // up there. Held overheat frames past a full charge, it blows up under Grok instead: selfDamage to Grok, helpless.
      // flight: speed = [tap, full] px/s · turn = radians / frame steering in flight · tilt = the most it can lean then · fall = max px/s
      // sinking while charging in the air · aimTurn = radians / frame swinging the aim while charging, aimMax = how far · wreck: r = blast reach px, life = seconds before it blows on its own, coast = seconds it keeps flying straight, then gravity scale · mid = px up to the ship's middle
      input: 'up + B (V / L), ground or air · hold to charge, let go to launch · ← → steer · B to bail', state: 'rocket',
      startup: 0, active: 40, endlag: 0, damage: 5, kb: { base: 30, growth: 50, angle: 70 }, hitbox: { x: -32, y: -100, w: 64, h: 100 },
      chargeFrames: 50, overheat: 70, selfDamage: 8, landingLag: 14,
      flight: { speed: [420, 820], turn: 0.06, tilt: 1.35, fall: 40, aimTurn: 0.07, aimMax: 1.05 },
      wreck: { damage: 9, kb: { base: 40, growth: 70, angle: 60 }, r: 46, life: 1.5, coast: 0.35, gravity: 0.6, mid: 51, draw: (x, y, ang, boom) => drawWreck(x, y, ang, boom) },
      chargeAnim: (f, c) => { // in the ship, which squats down on its engines as they build; past full it shakes harder and harder
        const over = Math.max(0, c - 1) / (70 / 50), k = f < 4 ? f / 4 * 1.15 : f < 7 ? 1.15 - 0.15 * (f - 4) / 3 : 1;
        return {
          sx: 1 + 0.08 * Math.min(1, c), sy: 1 - 0.08 * Math.min(1, c), x: over ? (f % 2 ? 1 : -1) * (1 + 3 * over) : 0,
          ship: [k, f < 4 ? 0 : 0.15 + 0.45 * Math.min(1, c) + 0.1 * Math.sin(f * 1.7) + 0.3 * over], squint: true, aimLine: f < 4 ? 0 : Math.min(1, c),
          say: over > 0.25 ? ['⚠ engine overheating', Math.min(1, (over - 0.25) * 6)] : null,
        };
      },
      anim: () => ({ sx: 0.95, sy: 1.05, ship: [1, 1], squint: true }), // in flight (the game leans it to its heading)
      previewFrames: 110,
      preview: f => { // the viewer: charge aiming right, launch that way, steer back left, bail out; the empty ship flies off out of frame
        if (f < 34) return { ...(f < 30 ? GROK_MOVESET.specials.upSpecial.chargeAnim(f, f / 30) : { sx: 0.92, sy: 1.08, ship: [1, 1], squint: true }), say: null, tilt: 0.5 * Math.min(1, Math.max(0, (f - 6) / 16)) };
        if (f < 80) return { sx: 0.95, sy: 1.05, ship: [1, 1], squint: true, tilt: 0.5 * Math.cos((f - 34) / 46 * Math.PI), air: -(f - 34) * 5 };
        const t = f - 80, e = Math.min(1, t / 14);
        return { air: -230 - 60 * e + 0.5 * t * t, rot: Math.PI * 2 * (1 - (1 - e) ** 2), blink: t < 10 ? 1 : 0 }; // bails: pops out the top with a flip
      },
    },
    downSpecial: { // Neuralink: fire a chip that plugs into the first one it hits (a little damage, no knockback) and stays in, light
      // blinking. Down special again while a chip is in anyone: neuralZap. One chip at a time
      input: 'down + B (V / L), ground or air · again to zap', state: 'neuralink', zap: 'neuralZap', startup: 10, active: 1, endlag: 16,
      damage: 2, kb: { base: 0, growth: 0, angle: 0 }, landingLag: 6,
      projectile: { x: 30, y: -36, speed: 700, life: 0.45, r: 7, draw: (x, y, r, spin, sh) => drawChipShot(x, y, r, sh.t, Math.sign(sh.vx) || 1) },
      plant: { chip: true, secs: Infinity, draw: (x, y, rot, a) => drawChip(x, y, rot, a) },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [8, { x: -3, sx: 0.94, sy: 1.06, rot: -0.12 }],
          [10, { x: 5, sx: 1.1, sy: 0.93, rot: 0.14 }],
          [14, { x: 4, sx: 1.08, sy: 0.94, rot: 0.12 }],
          [27, {}],
        ]),
        glow: f >= 6 && f < 14 ? 1 : 0,
      }),
    },
    neuralZap: { // the chip goes off: Grok's eyes flash, and wherever the chipped one is, it's zapped (knockback away from Grok)
      input: 'down + B with a chip in someone', startup: 8, active: 1, endlag: 20, damage: 10, kb: { base: 45, growth: 75, angle: 75 }, landingLag: 8,
      detonate: { secs: 0.45, draw: (x, y, rot, a) => drawZap(x, y, rot, a) },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [6, { sx: 1.1, sy: 0.9 }],
          [8, { y: -4, sx: 0.92, sy: 1.1 }],
          [14, { sx: 1.04, sy: 0.96 }],
          [29, {}],
        ]),
        glow: f >= 4 && f < 18 ? 1 : f >= 18 && f < 24 ? (24 - f) / 6 : 0, say: f >= 8 && f < 26 ? ['⚡ zap', Math.min(1, (f - 8) / 2, (26 - f) / 4)] : null,
      }),
    },
    sideSpecial: { // Autopilot, like Steve's minecart: hop up, a Cybertruck pops in under it, and it's off, picking up speed until something
      // stops it. Jump bails out (air jumps kept: ride off the ledge, then leap for it). Running into someone scoops them into the bed as
      // Grok leaps out; the truck carries them a moment, then launches them (a grab: shields don't help). Once Grok's out, the empty
      // truck rams the first thing it meets. Ends on a hit, crashing into the stage's side, after life seconds, or off the blast zone.
      // One truck at a time. In the game the summon (startup) hands off to the ride; active / endlag here only pace the viewer's
      // preview of a ride and a hop out. ride: w, h = the truck's box · speed = [start, top] px/s, accel px/s² · bed, bedY = where a
      // scooped target rides, px behind / above its middle-bottom · scoop / ram = the hits with and without Grok at the wheel
      input: 'B (V / L) + a direction, ground or air · jump to bail out', startup: 12, active: 24, endlag: 20, landingLag: 8,
      ride: { w: 116, h: 46, speed: [260, 720], accel: 1100, life: 2.2, bed: 36, bedY: 18,
        scoop: { carry: 0.35, damage: 12, kb: { base: 55, growth: 70, angle: 50 } }, ram: { damage: 8, kb: { base: 35, growth: 60, angle: 35 } } },
      anim: f => {
        const p = tween(f, [
          [0, {}],
          [3, { sx: 1.15, sy: 0.85 }],
          [6, { y: -16, sx: 0.92, sy: 1.1 }], // hops up…
          [7, { y: -6 }], // …and lands in the driver's seat
          [10, { sx: 1.06, sy: 0.94 }],
          [12, { rot: -0.1 }], // floors it: a little wheelie
          [16, {}],
          [36, {}],
          [39, { rot: 0.12, sx: 1.04, sy: 0.96 }], // brakes hard
          [44, {}],
          [46, { y: -18, sx: 0.9, sy: 1.1 }], // hops out as the truck goes
          [52, {}],
          [53, { sx: 1.12, sy: 0.88 }],
          [56, {}],
        ]);
        const u = Math.min(1, (f - 7) / 4), pop = 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2; // truck appears with a little overshoot
        const car = f < 7 ? 0 : f < 11 ? pop : f < 44 ? 1 : f < 49 ? 1 - (f - 44) / 5 : 0;
        if (f >= 16 && f < 36) p.y = -1.2 * Math.abs(Math.sin((f - 16) * 0.7)); // rumbling along
        return {
          ...p, car, wheel: f < 12 ? 0 : f < 36 ? (f - 12) * 0.9 : 21.6 + 3 * (1 - (1 - Math.min(1, (f - 36) / 8)) ** 2),
          squint: f >= 12 && f < 36, say: f >= 2 && f < 12 ? ['autopilot: on', Math.min(1, (f - 2) / 3, (12 - f) / 3)] : null,
          dust: f >= 12 && f < 36 ? (f - 12) % 8 / 8 : null, dustAhead: f >= 36 && f < 46 ? (f - 36) / 10 : null,
          puff: f >= 7 && f < 13 ? (f - 7) / 6 : f >= 44 && f < 50 ? (f - 44) / 6 : null,
        };
      },
    },
  },
};
