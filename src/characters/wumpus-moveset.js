// Wumpus's moveset (drawn by wumpus.js), Discord-flavoured. Movement is Claw'd's (clawd-moveset.js, loaded first); his arm and
// leg poses move Wumpus's stubby arms and outer feet, reach punches a paw out and ears swing its floppy ears.
// Fields are as in clawd-moveset.js. Groups not here yet (grabs, defense, ledge) are still to build.
let reaction = 0; // which emoji the forward smash is holding
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
  smashAttacks: { // hold heavy to charge: the pose freezes at chargeAt and c = 0 … 1 is how much charge is held so far (the viewer shows none)
    forwardSmash: { // Super Reaction: pop a big emoji (a random one of EMOJIS) out overhead and hold it up in the ears (it swells with the charge), then slam it
      // down in front, where it bursts into the super-reaction sparkle ring
      input: 'heavy (X / K), hold to charge', step: 200, startup: 15, active: 4, endlag: 30, damage: 14, kb: { base: 30, growth: 100, angle: 38 },
      hitbox: { x: 26, y: -50, w: 48, h: 50 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 11,
      anim: (f, n, c = 0) => {
        if (f === 0) reaction = Math.floor(Math.random() * EMOJIS.length); // rolled as it starts (invisible at frame 0), kept for the rest
        const slam = { sx: 1.14, sy: 0.9, rot: 0.3, ears: 0.6, arms: 1.4, legs: [[-8, 2], [0, 0], [0, 0], [3, 2]] };
        const p = tween(f, [
          [0, { emoji: [4, -62, 0, 0] }],
          [4, { x: -2, sy: 1.04, ears: 1.6, arms: 0.4, emoji: [2, -80, 8, 0] }],
          [11, { x: -6, sx: 0.94, sy: 1.08, rot: -0.22, ears: 2.8, arms: 0.6, legs: legsAll(6, 0), emoji: [-8, -94, 15, 0] }],
          [14, { x: -7, sx: 0.93, sy: 1.09, rot: -0.25, ears: 2.9, arms: 0.6, legs: legsAll(7, 0), emoji: [-9, -96, 15, 0] }],
          [15, { ...slam, x: 14, y: -2, emoji: [48, -26, 17, 0] }],
          [19, { ...slam, x: 15, y: -2, emoji: [50, -26, 17, 0] }],
          [32, { x: 10, rot: 0.08, ears: 0.3, arms: 0.3, legs: [[-4, 0], [0, 0], [0, 0], [1, 0]], emoji: [50, -26, 17, 0] }],
          [49, {}],
        ]);
        if (f >= 11 && f < 15) p.emoji[2] += 5 * c + Math.sin(f * 1.3) * c; // swelling, pulsing with the charge
        p.emoji = f < 31 ? [...p.emoji.slice(0, 3), f >= 15 ? (f - 15) / 16 : 0, reaction] : null;
        return { ...p, speed: f >= 15 && f < 25 ? 1 - (f - 15) / 10 : 0, dust: f >= 15 && f < 27 ? (f - 15) / 12 : null };
      },
    },
    upSmash: { // Speaking: breathe in deep (puffing up fuller with the charge), then shout: green rings of voice (Discord's speaking
      // green) pulse up off its head
      input: 'up + heavy (X / K), hold to charge', startup: 12, active: 6, endlag: 22, damage: 13, kb: { base: 32, growth: 98, angle: 90 },
      hitbox: { x: -44, y: -150, w: 88, h: 100 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: (f, n, c = 0) => {
        const shout = { y: -4, sx: 0.9, sy: 1.14, rot: 0.04, arms: 1.6, ears: 2.4, shout: 1, legs: legsAll(0, 3) };
        const p = tween(f, [
          [0, {}],
          [6, { sx: 1.08, sy: 1.04, rot: -0.06, arms: 0.8, ears: 0.6 }], // the breath in
          [11, { sx: 1.12, sy: 1.06, rot: -0.08, arms: 0.9, ears: 0.7 }],
          [12, shout],
          [18, { ...shout, y: -3, sx: 0.92, sy: 1.12, ears: 2.3 }],
          [30, { sx: 0.98, sy: 1.03, arms: 0.6, ears: 0.8, shout: 0.3 }],
          [40, {}],
        ]);
        if (f >= 8 && f < 12) { p.sx += 0.08 * c; p.sy += 0.04 * c; } // fuller the longer it holds its breath
        return { ...p, rings: f >= 12 && f < 32 ? (f - 12) / 20 : null, puff: f === 12 ? 0 : null };
      },
    },
    downSmash: { // Pin Message: rear up tall with a giant pushpin raised point-down (bigger with the charge), then drive it into the floor
      // just in front. One close hit that pops the target up weakly, leaving it nearby. Charged at all, it pins the target to the floor
      // first: stuck in place (any hit frees it) for up to pin seconds, a quarter of that barely charged, then the pop
      input: 'down + heavy (X / K), hold to charge', startup: 13, active: 3, endlag: 24, damage: 13, kb: { base: 40, growth: 25, angle: 88 },
      hitbox: { x: 22, y: -44, w: 30, h: 46 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 9, pin: 1,
      anim: (f, n, c = 0) => {
        const rear = { y: -4, sx: 0.92, sy: 1.12, ears: 2.4, arms: 1.6, legs: legsAll(2, 2) };
        const stab = { x: 6, sx: 1.16, sy: 0.84, rot: 0.35, ears: 0.3, arms: 0.9, legs: [[-5, 0], [0, 0], [0, 0], [3, 0]] };
        const p = tween(f, [
          [0, { pin: [26, -40, 0, 1] }],
          [5, { y: -2, sy: 1.06, ears: 1.2, arms: 1, pin: [28, -66, 12, 1] }],
          [9, { ...rear, rot: -0.16, pin: [30, -78, 16, 1] }],
          [12, { ...rear, rot: -0.18, pin: [30, -80, 16, 1] }],
          [13, { ...stab, pin: [36, 4, 17, 1] }],
          [16, { ...stab, pin: [36, 4, 17, 1] }],
          [26, { x: 3, rot: 0.1, ears: 0.2, arms: 0.3, pin: [36, 4, 17, 1] }],
          [37, { pin: [36, 4, 17, 0] }],
        ]);
        if (f >= 9 && f < 13) p.pin[2] += 6 * c;
        return { ...p, puff: f === 13 ? 0 : f > 13 && f < 25 ? (f - 13) / 12 : null, say: sayW('pinned a message', f, 13, 36) };
      },
    },
  },
  specials: { // plain moves (usable on the ground and in the air), with a few extras the game runs: sweet = a stronger inner hitbox, nelly spawns her on the startup
    // frame, launch = upward speed given on the startup frame, helpless = specialFall after, counter = the move a hit during the active
    // frames turns into (the hit does nothing). Things it hands to the world are only in the pose until they're let go
    neutralSpecial: { // Airhorn (Discord's old soundboard bot): pull out an air horn, brace, and blast a cone of sound ahead. Point blank
      // (sweet) it launches; farther out it's just a shove
      input: 'special', startup: 12, active: 6, endlag: 24, damage: 3, kb: { base: 45, growth: 20, angle: 20 }, landingLag: 14,
      hitbox: { x: 26, y: -86, w: 120, h: 76 }, sweet: { x: 26, y: -72, w: 42, h: 50, damage: 10, kb: { base: 38, growth: 95, angle: 35 } },
      anim: f => {
        const p = tween(f, [
          [0, { horn: [18, -30, 0] }],
          [7, { sx: 0.97, sy: 1.03, arms: 1.2, ears: 0.3, horn: [26, -44, 1] }],
          [11, { x: -2, sx: 0.95, sy: 1.05, rot: -0.1, arms: 1.3, ears: 0.4, legs: legsAll(3, 0), horn: [28, -46, 1] }],
          [12, { x: -5, sx: 1.06, sy: 0.95, rot: -0.18, arms: 1.4, ears: [1.3, -0.5], legs: legsAll(5, 0), horn: [27, -46, 1.08] }],
          [18, { x: -6, sx: 1.05, sy: 0.96, rot: -0.16, arms: 1.4, ears: [1.4, -0.4], legs: legsAll(5, 0), horn: [27, -46, 1.05] }],
          [30, { x: -2, rot: -0.04, arms: 1.1, ears: 0.3, horn: [26, -44, 1] }],
          [42, { horn: [18, -30, 0] }],
        ]);
        p.horn = [...p.horn, f >= 12 && f < 30 ? (f - 12) / 18 : null]; // blasting, ears blown back, rocked back a step by its own noise
        return { ...p, speed: f >= 12 && f < 24 ? -0.4 : 0, say: sayW('!airhorn', f, 12, 34) };
      },
    },
    sideSpecial: { // Slowmode: set Nelly the snail down in front. She crawls ahead on her own (dropped, in the air) and the first thing she
      // touches takes a little hit and goes into slowmode: half speed, knockback and all, for slow seconds (one Nelly out at a time)
      input: 'special + ← →', startup: 12, active: 1, endlag: 16, landingLag: 10,
      nelly: { x: 34, speed: 70, life: 5, damage: 3, kb: { base: 12, growth: 10, angle: 50 }, slow: 5 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { sx: 0.97, sy: 1.03, rot: -0.05, arms: 1.1, ears: 0.3 }],
          [11, { x: 3, sx: 1.08, sy: 0.9, rot: 0.3, arms: 0.8, ears: -0.1, legs: [[-4, 0], [0, 0], [0, 0], [2, 0]] }],
          [15, { x: 3, sx: 1.06, sy: 0.92, rot: 0.26, arms: 0.7, legs: [[-4, 0], [0, 0], [0, 0], [2, 0]] }],
          [29, {}],
        ]),
        nelly: f < 12 ? [22 + 12 * Math.min(1, f / 11), -22 * (1 - Math.min(1, f / 11)), f / 60] : null, // held out in front, set down on the floor
        say: sayW('slowmode enabled', f, 12, 36),
      }),
    },
    upSpecial: { // Nitro: a Nitro tank on its back fires and launches it straight up in a stream of pink sparkles (steer with ← →), hitting anything on the way.
      // Helpless once it burns out
      input: 'special + ↑', startup: 6, active: 16, endlag: 18, damage: 8, kb: { base: 35, growth: 70, angle: 80 }, landingLag: 14,
      hitbox: { x: -26, y: -76, w: 52, h: 84 }, launch: 1150, helpless: true,
      anim: f => ({
        ...tween(f, [
          [0, { rocket: 0 }],
          [5, { sx: 1.12, sy: 0.86, arms: 0.2, ears: 0.4, rocket: 0.2, legs: legsAll(0, 0) }],
          [6, { y: -4, sx: 0.88, sy: 1.16, arms: 0, ears: -0.25, rocket: 1, legs: legsAll(0, 4) }],
          [22, { sx: 0.92, sy: 1.1, arms: 0.3, ears: -0.1, rocket: 0.8, legs: legsAll(0, 3) }],
          [40, { arms: 1, ears: 0.6, rocket: 0, legs: legsAll(0, 2) }],
        ]),
        speed: 0, fallLines: f >= 6 && f < 22 ? 0.6 : 0,
        trail: f >= 6 && f < 34 ? [Math.min(1, (34 - f) / 12), f / 4] : null,
        say: sayW('Nitro activated', f, 6, 30),
      }),
    },
    downSpecial: { // Deafen: clamp on the headphones. A hit while they're on does nothing: it turns straight into downSpecialHit
      input: 'special + ↓', startup: 4, active: 24, endlag: 18, landingLag: 10, counter: 'downSpecialHit',
      anim: f => tween(f, [
        [0, {}],
        [4, { sx: 1.04, sy: 0.94, arms: 1.2, ears: -0.25, headphones: 1 }],
        [28, { sx: 1.04, sy: 0.94, arms: 1.1, ears: -0.25, headphones: 1 }],
        [36, { arms: 0.4, headphones: 0.6 }],
        [46, {}],
      ]),
    },
    downSpecialHit: { // …undeafened: tears the headphones off and the hit comes back out as a blast of sound, both ways
      input: 'hit during Deafen', startup: 4, active: 4, endlag: 18, damage: 10, kb: { base: 40, growth: 90, angle: 45 },
      hitbox: { x: -80, y: -96, w: 160, h: 104 }, both: true, intangible: [0, 12], landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, { sx: 1.04, sy: 0.94, arms: 1.1, ears: -0.25, headphones: 1 }],
          [3, { sx: 1.12, sy: 0.86, arms: 0.6, ears: -0.3, headphones: 1 }],
          [4, { y: -3, sx: 0.9, sy: 1.14, arms: 1.7, ears: 2.4, headphones: 0 }],
          [8, { y: -3, sx: 0.91, sy: 1.12, arms: 1.7, ears: 2.3 }],
          [26, {}],
        ]),
        waves: f >= 4 && f < 20 ? (f - 4) / 16 : null,
        say: sayW('undeafened', f, 4, 24),
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
