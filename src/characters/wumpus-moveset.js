// Wumpus's moveset (drawn by wumpus.js), Discord-flavoured. Movement is Claw'd's (clawd-moveset.js, loaded first); his arm and
// leg poses move Wumpus's stubby arms and outer feet, reach punches a paw out and ears swing its floppy ears.
// Fields are as in clawd-moveset.js. His defense has no shield yet (so he can't shield); reactions are Claw'd's.
let reaction = 0; // which emoji the forward smash is holding
const sayW = (text, f, from, to) => f >= from && f < to ? [text, Math.min(1, (f - from) / 3, (to - f) / 8)] : null; // caption popping up over the head
// movement: Claw'd's, plus Wumpus's arms swinging out from the shoulders (arms), which his arm offsets alone barely show.
// Past ~1.8 rad they disappear behind his head, so raised arms stop there
const MV = MOVESET.movement, cycle = (f, n, k = 1) => Math.sin(f / n * Math.PI * 2 * k);
const ease = (f, ks) => tween(f, ks.map(([k, a]) => [k, { a }])).a; // one number eased through [[frame, value], …]
const armsOn = (m, arms) => ({ ...m, anim: (f, n = m.frames) => ({ ...m.anim(f, n), arms: arms(f, n) }) });
const WHOLD = { rot: -0.05, ears: [0.2, 1.4], reach: [14, 16], legs: [[-3, 0], [0, 0], [0, 0], [2, 0]], carry: [50, -4, 0] }; // hugging it: front ear over it, paws on
// dodges go Discord 'Invisible': faded out with the grey status dot while nothing can hurt it (from … to, ramping in and out over 2 frames)
const invisible = (f, from, to) => Math.max(0, Math.min(1, (f - from + 2) / 2, (to - f + 2) / 2));
// a ground roll 120px toward d: squash, tuck, one full turn, pop up still facing the same way (x is real movement in the game)
const wRoll = d => f => {
  const tuck = { sx: 0.84, sy: 0.84, ears: -0.3, arms: 0, legs: legsAll(0, -4) };
  const p = tween(f, [[0, {}], [3, { sx: 1.1, sy: 0.84, rot: 0.1 * d, arms: 0.2 }], [6, { ...tuck, x: 12 * d }], [22, { ...tuck, x: 112 * d }], [25, { x: 120 * d, sx: 1.12, sy: 0.84, arms: 0.3 }], [30, { x: 120 * d }]]);
  const e = Math.min(1, Math.max(0, (f - 4) / 18));
  return { ...p, rot: d * Math.PI * 2 * e * e * (3 - 2 * e), invisible: invisible(f, 4, 20), [d > 0 ? 'dust' : 'dustAhead']: f >= 4 && f < 16 ? (f - 4) / 12 : null };
};
// a sideways air dodge toward d: flinch, then streak off stretched the way it's going, ears trailing
const wSideDodge = d => f => ({
  ...tween(f, [
    [0, AIRBORNE],
    [2, { sx: 0.92, sy: 1.08, rot: -0.1 * d, ears: 0.4, legs: TUCK }],
    [4, { x: 30 * d, sx: 1.2, sy: 0.84, rot: 0.14 * d, ears: d > 0 ? [1.2, -0.3] : [-0.3, 1.2], arms: 0.9, legs: legsAll(-4 * d, -2) }],
    [14, { x: 130 * d, sx: 1.16, sy: 0.86, rot: 0.1 * d, ears: d > 0 ? [1.1, -0.3] : [-0.3, 1.1], arms: 0.9, legs: legsAll(-4 * d, -2) }],
    [18, { x: 140 * d, sx: 0.96, sy: 1.04, rot: -0.04 * d, ears: 0.3, legs: TUCK }],
    [28, { ...AIRBORNE, x: 144 * d }],
  ]),
  invisible: invisible(f, 2, 18), speed: f >= 3 && f < 16 ? d * (1 - (f - 3) / 13) : 0, air: -40,
});
// hanging off the ledge by the front ear hooked over the lip, the rest of it dangling below (x / air from standing at the lip, as Claw'd's)
const WHANG = { x: -55, air: 72, sy: 1.04, ears: [0.8, 2.7], arms: 1.2, legs: [[0, 3], [0, 0], [0, 0], [0, 3]] };
const WHAUL = { x: -55, air: 78, sx: 1.06, sy: 0.92, ears: [0.9, 2.5], arms: 1.3, legs: legsAll(0, 2) }; // dipping to haul itself up
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
  grabs: { // like Claw'd's (carry = where the held one's bottom-centre goes; throws let go on their startup frame)
    grab: { // Friend Request: paws out and the front ear flops over it in a hug; a whiff hugs thin air
      input: 'grab (G / U)', startup: 6, active: 3, endlag: 22, hitbox: { x: 18, y: -50, w: 42, h: 46 }, grab: true,
      anim: f => tween(f, [
        [0, {}],
        [4, { x: -2, sx: 0.96, sy: 1.04, rot: -0.08, ears: [0.2, -0.3], arms: 0.4 }],
        [6, { x: 6, sx: 1.1, sy: 0.93, rot: 0.14, ears: [0.3, 1.5], reach: [16, 18], legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [9, { x: 6, sx: 1.1, sy: 0.93, rot: 0.14, ears: [0.3, 1.6], reach: [16, 18], legs: [[-4, 0], [0, 0], [0, 0], [3, 0]] }],
        [16, { x: 4, sx: 1.03, sy: 0.97, rot: 0.06, ears: 0.5, reach: [4, 4] }],
        [31, {}],
      ]),
    },
    dashGrab: { // out of a run: dives in for the hug and slides on the momentum
      input: 'grab while running', startup: 9, active: 3, endlag: 28, hitbox: { x: 18, y: -50, w: 58, h: 46 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: -2, sx: 1.06, sy: 0.92, rot: -0.04, ears: [0.3, -0.2], arms: 0.6 }],
          [9, { x: 12, y: -2, sx: 1.16, sy: 0.88, rot: 0.22, ears: [0.4, 1.6], reach: [18, 20], legs: [[-8, 2], [0, 0], [0, 0], [4, 1]] }],
          [12, { x: 14, sx: 1.14, sy: 0.88, rot: 0.2, ears: [0.4, 1.6], reach: [18, 20], legs: [[-8, 1], [0, 0], [0, 0], [4, 0]] }],
          [24, { x: 8, sx: 1.04, sy: 0.96, rot: 0.06, ears: 0.4, reach: [4, 4] }],
          [40, {}],
        ]),
        speed: f >= 9 && f < 20 ? 1 - (f - 9) / 11 : 0, dust: f >= 9 && f < 21 ? (f - 9) / 12 : null,
      }),
    },
    hold: { // got it: hugging tight, rocking a little. Request's still pending
      input: 'grab connects', frames: 60, breakFree: 90, perDmg: 1.2,
      anim: (f, n = 60) => {
        const b = Math.sin(f / n * Math.PI * 4);
        return { ...WHOLD, rot: -0.05 + 0.03 * b, sx: 1.02 + 0.01 * b, sy: 0.98 - 0.01 * b, carry: [50, -4 + b, 0], say: ['friend request sent', 1] };
      },
    },
    pummel: { // ping: a squeeze, and a red unread badge on it counts up (the game draws that: badge)
      input: 'light (holding)', startup: 5, active: 1, endlag: 10, damage: 1.5, badge: true,
      anim: f => tween(f, [
        [0, WHOLD],
        [4, { ...WHOLD, rot: -0.1, sx: 0.96, sy: 1.04, ears: [0.2, 1.1], carry: [48, -6, 0] }],
        [5, { ...WHOLD, rot: 0.06, sx: 1.06, sy: 0.94, ears: [0.2, 1.7], reach: [18, 20], carry: [52, -2, 0.05] }],
        [16, WHOLD],
      ]),
    },
    forwardThrow: { // Move to AFK: rear back and shove it off into the AFK channel
      input: 'forward (holding)', startup: 10, active: 1, endlag: 18, damage: 7, kb: { base: 55, growth: 55, angle: 35 },
      anim: throwAnim({ at: 10, n: 29, fly: [12, -6, 0.1], say: ['moving to AFK…', '💤 moved to AFK'], keys: [
        [0, WHOLD],
        [7, { x: -4, rot: -0.18, sx: 0.94, sy: 1.06, ears: [0.3, 0.9], reach: [2, 4], legs: legsAll(2, 0), carry: [42, -8, -0.15] }],
        [10, { x: 6, rot: 0.22, sx: 1.16, sy: 0.88, ears: [0.2, 1.6], reach: [22, 24], legs: [[-8, 0], [0, 0], [0, 0], [4, 0]], carry: [80, -14, 0.2] }],
        [16, { x: 5, rot: 0.15, sx: 1.08, sy: 0.94, ears: 0.5, reach: [16, 18], carry: [80, -14, 0.2] }],
        [29, { carry: [80, -14, 0.2] }],
      ] }),
    },
    backThrow: { // Leave Server: hoist it overhead in the ears and heave it out the door behind
      input: 'back (holding)', startup: 16, active: 1, endlag: 20, damage: 9, kb: { base: 60, growth: 62, angle: 42 },
      anim: throwAnim({ at: 16, n: 37, fly: [-12, -4, -0.15], say: ['showing them out…', '👋 left the server'], keys: [
        [0, WHOLD],
        [6, { rot: -0.1, sx: 0.92, sy: 1.1, ears: [1.2, 2.4], arms: 1.4, carry: [26, -58, -0.8] }],
        [12, { rot: -0.35, sx: 0.96, sy: 1.06, ears: [2.6, 2.8], arms: 1.6, carry: [-18, -66, -2.2] }],
        [16, { rot: -0.45, sx: 1.08, sy: 0.92, ears: [1.8, 1.2], arms: 1.2, carry: [-58, -22, -3] }],
        [24, { rot: -0.2, ears: 0.5, carry: [-58, -22, -3] }],
        [37, { carry: [-58, -22, -3] }],
      ] }),
    },
    upThrow: { // Stage: lift it up overhead in the ears and fling it up onto the stage
      input: 'up (holding)', startup: 14, active: 1, endlag: 20, damage: 6, kb: { base: 70, growth: 45, angle: 90 },
      anim: throwAnim({ at: 14, n: 35, fly: [0, -14, 0.05], say: ['inviting to stage…', '🎙️ invited to speak'], keys: [
        [0, WHOLD],
        [6, { sx: 1.1, sy: 0.88, ears: [0.4, 0.8], reach: [8, 10], carry: [50, 0, 0] }],
        [10, { sx: 1.04, sy: 0.96, ears: [1.6, 1.8], arms: 1, carry: [40, -30, 0] }],
        [14, { y: -4, sx: 0.9, sy: 1.14, ears: [2.8, 2.8], arms: 1.7, legs: legsAll(0, 3), carry: [14, -86, 0] }],
        [22, { sx: 0.96, sy: 1.04, ears: 1.2, arms: 0.8, carry: [14, -86, 0] }],
        [35, { carry: [14, -86, 0] }],
      ] }),
    },
    downThrow: { // Mute: plonk it down, hop up and sit right on its head (muted mic overhead), then it pops out from under
      input: 'down (holding)', startup: 14, active: 1, endlag: 22, damage: 6, kb: { base: 45, growth: 50, angle: 80 },
      anim: throwAnim({ at: 14, n: 37, fly: [2, -9, 0.1], say: ['muting…', '🔇 muted'], extra: f => ({ muted: f >= 9 && f < 32 ? Math.min(1, (f - 9) / 3, (32 - f) / 6) : 0 }), keys: [
        [0, WHOLD],
        [5, { x: 4, sx: 1.08, sy: 0.9, ears: [0.3, 1], carry: [48, 0, 0] }],
        [9, { x: 34, y: -64, sx: 0.96, sy: 1.04, ears: 1.2, arms: 1, legs: legsAll(0, -3), carry: [48, 0, 0] }],
        [12, { x: 44, y: -50, sx: 1.12, sy: 0.84, ears: 0.4, arms: 0.6, carry: [48, 0, 0] }], // sat down on it
        [14, { x: 44, y: -46, sx: 1.2, sy: 0.78, ears: 0.2, carry: [48, 2, 0] }],
        [22, { x: 16, y: -18, rot: -0.1, ears: 1, arms: 1, carry: [48, 2, 0] }], // hopping back off as it pops out
        [37, { carry: [48, 2, 0] }],
      ] }),
    },
  },
  defense: { // no shield (yet): dodge / rolls / air dodges only
    spotDodge: {
      input: 'dodge (Shift / Z)', frames: 26, intangible: [3, 18],
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [3, { sx: 1.12, sy: 0.84, ears: 0.4, arms: 0.3 }],
          [6, { sx: 0.9, sy: 0.9, ears: 1, arms: 0.8 }],
          [16, { sx: 0.9, sy: 0.9, ears: 1.1, arms: 0.8 }],
          [21, { sx: 1.08, sy: 0.92, ears: 0.3 }],
          [26, {}],
        ]),
        invisible: invisible(f, 3, 18),
      }),
    },
    rollForward: { input: 'dodge + forward', frames: 30, intangible: [4, 20], anim: wRoll(1) },
    rollBack: { input: 'dodge + back', frames: 30, intangible: [4, 20], anim: wRoll(-1) },
    airDodgeForward: { input: 'dodge + forward (airborne)', frames: 28, anim: wSideDodge(1) },
    airDodgeBack: { input: 'dodge + back (airborne)', frames: 28, anim: wSideDodge(-1) },
    airDodge: { // once per airtime: a burst of speed toward the held direction (none = stall in place), then free to act
      input: 'dodge (airborne) + any direction', frames: 28, intangible: [2, 18], speed: 720, burst: 12, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [2, { sx: 1.08, sy: 0.92, ears: 0.4, arms: 0.3, legs: TUCK }],
          [5, { sx: 0.9, sy: 0.9, ears: 1.1, arms: 0.9, legs: TUCK }],
          [18, { sx: 0.9, sy: 0.9, ears: 1.1, arms: 0.9, legs: TUCK }],
          [24, { sx: 1.04, sy: 0.97, ears: 0.3, legs: TUCK }],
          [28, AIRBORNE],
        ]),
        invisible: invisible(f, 2, 18), air: -40,
      }),
    },
  },
  ledge: { // the floor is the stage top; x / air are root motion while on the ledge (grab / hang / getup / jump wind-up)
    ledgeGrab: {
      input: 'fall near ledge', frames: 10,
      anim: f => tween(f, [ // the ear flops over the lip and catches, weight drops and stretches, settles into the hang
        [0, { x: -55, air: 60, sx: 0.92, sy: 1.12, ears: [0.6, 2.9], arms: 1.4, legs: legsAll(0, 3) }],
        [4, { x: -55, air: 80, sx: 1.04, sy: 0.96, ears: [0.9, 2.6], arms: 1.3, legs: legsAll(0, 5) }],
        [10, WHANG],
      ]),
    },
    ledgeHang: {
      input: 'none', frames: 60,
      anim: (f, n) => { // dangling from the ear: slow sway, feet swinging behind
        const s = Math.sin(f / n * Math.PI * 2);
        return { ...WHANG, rot: 0.05 * s, arms: 1.2 + 0.15 * s, legs: [[-s, 3], [0, 0], [0, 0], [-s, 3]] };
      },
    },
    ledgeGetup: {
      input: 'toward stage / up', frames: 24,
      anim: f => ({ // dip, haul up over the lip feet tucked, squash down onto the stage
        ...tween(f, [
          [0, WHANG],
          [5, WHAUL],
          [11, { x: -44, air: -6, sx: 0.9, sy: 1.12, rot: 0.25, ears: 1.4, arms: 1, legs: legsAll(0, -4) }],
          [16, { x: -14, air: -4, rot: 0.15, ears: 0.6, legs: legsAll(0, -3) }],
          [19, { sx: 1.16, sy: 0.8, arms: 0.3 }],
          [24, {}],
        ]),
        puff: f >= 19 ? (f - 19) / 5 : null,
      }),
    },
    ledgeJump: {
      input: 'jump', frames: 40, launchAt: 6, // the game hands off to the normal jump arc at launchAt
      anim: f => tween(f, [ // pull down on the ear, spring straight up off the ledge, drift over the stage
        [0, WHANG],
        [4, { ...WHAUL, air: 80, sx: 1.08, sy: 0.9 }],
        [6, { x: -53, air: 66, sx: 0.88, sy: 1.18, ears: [1.5, 2.9], arms: 1.6, legs: legsAll(0, 3) }],
        [20, { x: -40, air: -90, sx: 1.04, sy: 0.96, ears: 0.8, arms: 1.4, legs: TUCK }],
        [34, { x: -24, air: -40, sx: 0.94, sy: 1.08, ears: 1, arms: 1.2, legs: REACH }],
        [40, { x: -20, air: -30, sx: 0.94, sy: 1.08, ears: 1, arms: 1.2, legs: REACH }],
      ]),
    },
    ledgeRoll: {
      input: 'dodge (Shift / Z)', frames: 36, intangible: [0, 36], // can't be hurt the whole way
      anim: f => { // haul up, tuck and roll a full turn onto the stage (gone invisible), pop up well inland
        const tuck = { sx: 0.84, sy: 0.84, ears: -0.3, arms: 0, legs: legsAll(0, -4) };
        const p = tween(f, [[0, WHANG], [5, WHAUL], [10, { ...tuck, x: -40, air: -10 }], [25, { ...tuck, x: 72, air: -4 }], [28, { x: 84, sx: 1.12, sy: 0.82, arms: 0.3 }], [36, { x: 90 }]]);
        const e = Math.min(1, Math.max(0, (f - 9) / 17));
        return { ...p, rot: Math.PI * 2 * e * e * (3 - 2 * e), invisible: invisible(f, 6, 28), puff: f >= 26 && f < 32 ? (f - 26) / 6 : null };
      },
    },
    ledgeAttack: { // haul up and whip the front ear out low along the stage as it lands
      input: 'light / heavy (on ledge)', startup: 16, active: 4, endlag: 16, damage: 7, kb: { base: 30, growth: 50, angle: 35 },
      hitbox: { x: 22, y: -62, w: 44, h: 40 },
      anim: f => ({
        ...tween(f, [
          [0, WHANG],
          [4, WHAUL],
          [9, { x: -44, air: -8, sx: 0.9, sy: 1.12, rot: 0.25, ears: 1.4, arms: 1, legs: legsAll(0, -4) }],
          [13, { x: -16, air: -4, rot: -0.1, ears: [0.4, -0.5], legs: legsAll(0, -3) }],
          [15, { x: -6, sx: 1.1, sy: 0.88, rot: -0.14, ears: [0.3, -0.6] }],
          [16, { x: 4, sx: 1.08, sy: 0.92, rot: 0.2, ears: [0.2, 1.8], arms: 0.4, legs: [[-6, 0], [0, 0], [0, 0], [3, 0]] }],
          [20, { x: 4, sx: 1.07, sy: 0.93, rot: 0.18, ears: [0.2, 1.7], arms: 0.4, legs: [[-6, 0], [0, 0], [0, 0], [3, 0]] }],
          [28, { x: 2, rot: 0.05, ears: [0.1, 0.8] }],
          [36, {}],
        ]),
        speed: f >= 16 && f < 20 ? 0.6 : 0,
        puff: f >= 15 && f < 21 ? (f - 15) / 6 : null,
      }),
    },
    ledgeDrop: {
      input: 'away / down', frames: 24,
      anim: f => tween(f, [ // let go: the ear slips off the lip, and it slides down the wall
        [0, WHANG],
        [4, { x: -57, air: 80, sx: 0.94, sy: 1.08, ears: [0.8, 2.2], arms: 1.3, legs: legsAll(0, 3) }],
        [16, { x: -60, air: 140, sx: 0.96, sy: 1.04, ears: 1.8, arms: 1.4, legs: legsAll(0, 2) }],
        [24, { x: -60, air: 140, sx: 0.96, sy: 1.04, ears: 1.8, arms: 1.4, legs: legsAll(0, 2) }],
      ]),
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
