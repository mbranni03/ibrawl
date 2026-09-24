// Grok's moveset (drawn by grok.js). Movement is Claw'd's (clawd-moveset.js, loaded first), except that a ball with no legs
// gets about by bouncing: two hops a loop, squashed where it lands, stretched on the way up, rocking into each one.
const bounce = (height, lean, sx = 1, sy = 1) => (f, n) => {
  const u = 2 * f / n % 1, h = Math.sin(Math.PI * u), c = (1 - h) ** 3; // h = 0 on the floor … 1 at the top · c = the landing squash
  return { y: -height * h, sx: sx * (1 + 0.1 * c - 0.03 * h), sy: sy * (1 - 0.14 * c + 0.05 * h), rot: lean + 0.05 * Math.sin(2 * Math.PI * u) };
};
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

  specials: {
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
