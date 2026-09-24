// Android's moveset (drawn by android.js). Its arms and head float free of the body, so its attacks throw them: fists that
// fly off their shoulders, a headbutt that pops the dome forward, and sparks crackling between the antennae.
// Movement is Claw'd's (clawd-moveset.js, loaded first); the move fields are laid out the same way as his.
const PUNCH = Math.PI / 2; // swing that points an arm straight ahead
// up smash: where the Chrome dino is (bottom-centre, px from Android's feet) on frame f: hops out from behind the head on 12, over the
// top and down in front by 22, then drops away as it fades
const dinoAt = f => {
  const t = (f - 12) / 10;
  return t <= 1 ? [-18 + 50 * t, -60 - 50 * Math.sin(Math.PI * t)] : [32 + 20 * (t - 1), -60 + 60 * (t - 1)];
};

// forward smash: the pose on frame f with the charge c. swing is the front arm's angle to the body, so its angle on screen is swing - rot:
// held at about 3.7 (up and leaning back over the head), swung through 2.5 (up and forward) down to 1.4 (just below level)
const lanceAnim = (f, c = 1) => {
  const grow = Math.min(1, Math.max(0, (f - 4) / 6)) * (f < 23 ? 1 : Math.max(0, 1 - (f - 23) / 14)); // generates on 4 … 10, back in over the recovery
  return {
    ...tween(f, [
      [0, {}],
      [6, { x: -3, sx: 0.96, sy: 1.04, rot: -0.1, swing: [-0.3, 3.5], reach: [-2, -8], arm: [0, -6], head: [-1, 0], legs: legsAll(3, 0) }],
      [10, { x: -4, sx: 0.95, sy: 1.05, rot: -0.12, swing: [-0.3, 3.55], reach: [-2, -8], arm: [0, -7], head: [-2, 0], legs: legsAll(4, 0) }],
      [15, { x: -5, sx: 0.94, sy: 1.06, rot: -0.14, swing: [-0.3, 3.6], reach: [-2, -8], arm: [0, -8], head: [-2, 0], legs: legsAll(5, 0) }],
      [16, { x: 4, sx: 1.04, sy: 0.97, rot: 0.04, swing: [-0.4, 2.54], reach: [-4, 0], arm: [0, -4], legs: [[-6, 0], [-5, 0], [0, 0], [2, 0]] }],
      [18, { x: 14, y: -2, sx: 1.2, sy: 0.86, rot: 0.18, swing: [-0.6, 1.58], reach: [-6, 8], head: [3, 1], blink: 0.5, legs: [[-14, 2], [-12, 2], [-2, 2], [2, 2]] }],
      [21, { x: 15, y: -2, sx: 1.18, sy: 0.87, rot: 0.17, swing: [-0.6, 1.57], reach: [-6, 8], head: [3, 1], blink: 0.5, legs: [[-14, 2], [-12, 2], [-2, 2], [2, 2]] }],
      [32, { x: 10, sx: 1.06, sy: 0.95, rot: 0.06, swing: [-0.2, 1.3], reach: [0, 3], legs: [[-8, 0], [-6, 0], [-1, 0], [1, 0]] }],
      [48, {}],
    ]),
    bar: [(40 + 70 * c) * grow, f < 10 ? 0.2 * grow : Math.max(0.2, c)],
    speed: f >= 17 && f < 27 ? 1 - (f - 17) / 10 : 0,
    dust: f >= 18 && f < 30 ? (f - 18) / 12 : null,
  };
};
// the box round the bar on frame f, relative to the feet (the game adds the pose's x): its two ends put through the same
// shoulder → arm → body lean → stretch transforms drawAndroid uses, padded a little
const lanceBox = (f, c = 1) => {
  const p = lanceAnim(f, c), s = p.swing[1], r = p.rot || 0, sx = p.sx ?? 1, sy = p.sy ?? 1;
  const ends = [16, 16 + p.bar[0]].map(k => {
    const x = 23 + p.reach[1] + k * Math.sin(s), y = -41 + (p.arm?.[1] || 0) + k * Math.cos(s) + 32; // around the lean's pivot
    return [(x * Math.cos(r) - y * Math.sin(r)) * sx, (x * Math.sin(r) + y * Math.cos(r) - 32) * sy];
  });
  const xs = ends.map(e => e[0]), ys = ends.map(e => e[1]), pad = 9;
  return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: Math.max(...ys) - Math.min(...ys) + 2 * pad };
};

// I'm Feeling Lucky (neutral special): what can come out of the search bar, one at random each throw, and how each flies (see the
// engine's shots): Gmail fast and flat · a Maps pin lobbed, dropping hard · a Chrome ball bouncing along the floor · a Drive triangle
// spinning, grinding in for two hits
const LUCKY = [
  { name: 'Gmail', draw: drawGmail, speed: 820, life: 0.7, r: 12, damage: 5, kb: { base: 20, growth: 40, angle: 25 } },
  { name: 'Maps', draw: drawMapsPin, speed: 360, vy: -560, gravity: 1, life: 1.6, r: 12, damage: 10, kb: { base: 35, growth: 70, angle: 65 } },
  { name: 'Chrome', draw: drawChromeBall, speed: 420, vy: -150, gravity: 1, bounce: 0.75, life: 1.6, r: 11, damage: 6, kb: { base: 25, growth: 50, angle: 40 } },
  { name: 'Drive', draw: drawDriveLogo, speed: 560, life: 0.9, r: 13, hits: 2, every: 0.18, damage: 4, kb: { base: 30, growth: 55, angle: 40 } },
];

// holding a grabbed target: both floating hands out in front, clamped on its near side (carry = where its bottom-centre goes)
const A_HOLD = { rot: -0.04, swing: [1.35, 1.25], reach: [30, 4], legs: [[-3, 0], [-2, 0], [1, 0], [2, 0]], carry: [56, -4, 0] };

const ANDROID_MOVESET = {
  movement: MOVESET.movement,

  groundAttacks: {
    jab1: { // front fist straight out: a tiny cock back, snapped out on frame 3, feet planted
      input: 'light', startup: 3, active: 2, endlag: 14, damage: 2.5, kb: { base: 8, growth: 25, angle: 40 },
      hitbox: { x: 30, y: -50, w: 30, h: 18 },
      anim: f => tween(f, [
        [0, {}],
        [2, { x: -1, rot: -0.04, swing: [0.2, -0.5], reach: [0, -3] }],
        [3, { x: 3, sx: 1.04, sy: 0.97, rot: 0.08, swing: [0.3, PUNCH], reach: [-2, 10], legs: [[-3, 0], [-3, 0], [0, 0], [2, 0]] }],
        [6, { x: 3, sx: 1.03, sy: 0.98, rot: 0.07, swing: [0.3, PUNCH], reach: [-2, 9], legs: [[-3, 0], [-3, 0], [0, 0], [2, 0]] }],
        [11, { x: 1, rot: 0.02, swing: [0.1, 0.6], reach: [0, 3] }],
        [19, {}],
      ]),
    },
    jab2: { // the back fist crosses over in front of the body while the front one pulls back: a one-two
      input: 'light (after jab1)', startup: 3, active: 2, endlag: 16, damage: 2, kb: { base: 10, growth: 25, angle: 45 },
      hitbox: { x: 28, y: -52, w: 30, h: 20 },
      anim: f => tween(f, [
        [0, {}],
        [2, { x: -1, rot: -0.06, swing: [-0.4, 0.3], reach: [-4, 0] }],
        [3, { x: 5, sx: 1.06, sy: 0.96, rot: 0.14, swing: [PUNCH, -0.5], reach: [52, -6], legs: [[-6, 0], [-6, 0], [0, 0], [3, 0]] }],
        [6, { x: 5, sx: 1.05, sy: 0.97, rot: 0.13, swing: [PUNCH, -0.5], reach: [50, -6], legs: [[-6, 0], [-6, 0], [0, 0], [3, 0]] }],
        [12, { x: 2, rot: 0.04, swing: [0.5, 0], reach: [14, 0] }],
        [21, {}],
      ]),
    },
    jab3: { // finisher: arms swept back, the head pops off the body and headbutts, antennae crackling
      input: 'light (after jab2)', step: 220, startup: 5, active: 3, endlag: 24, damage: 4.5, kb: { base: 40, growth: 80, angle: 40 },
      hitbox: { x: 16, y: -64, w: 40, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -5, sx: 1.08, sy: 0.9, rot: -0.16, swing: [-0.6, -0.6], reach: [-3, -3], head: [-4, 2], blink: 0.6, legs: legsAll(5, 0) }],
          [5, { x: 12, y: -2, sx: 1.1, sy: 0.92, rot: 0.28, swing: [-0.9, -0.9], reach: [-4, -4], head: [18, 4], blink: 1, zap: 1, legs: [[-10, 2], [-10, 2], [0, 2], [2, 2]] }],
          [8, { x: 13, y: -2, sx: 1.09, sy: 0.93, rot: 0.27, swing: [-0.9, -0.9], reach: [-4, -4], head: [19, 4], blink: 1, zap: 1, legs: [[-10, 2], [-10, 2], [0, 2], [2, 2]] }],
          [16, { x: 8, rot: 0.08, swing: [-0.2, -0.2], head: [4, 0], zap: 0.3, legs: [[-5, 0], [-4, 0], [0, 0], [1, 0]] }],
          [32, {}],
        ]),
        speed: f >= 5 && f < 12 ? 1 - (f - 5) / 7 : 0,
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    dashAttack: { // dive out of a run: throws itself flat forward behind both fists, legs kicked up behind, and slides on the momentum
      input: 'light while running', startup: 6, active: 8, endlag: 20, damage: 7, kb: { base: 35, growth: 60, angle: 55 },
      hitbox: { x: 20, y: -52, w: 52, h: 38 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -3, sx: 1.06, sy: 0.92, rot: -0.1, swing: [-0.6, -0.6], legs: legsAll(3, 0) }],
          [6, { x: 10, y: -6, sx: 1.1, sy: 0.9, rot: 0.5, swing: [2, 2], reach: [40, 6], head: [4, 0], blink: 0.3, legs: [[-6, -6], [-6, -6], [-2, -4], [-2, -4]] }],
          [14, { x: 12, y: -3, sx: 1.08, sy: 0.92, rot: 0.46, swing: [2, 2], reach: [38, 6], head: [3, 0], blink: 0.3, legs: [[-6, -5], [-6, -5], [-2, -3], [-2, -3]] }],
          [22, { x: 6, rot: 0.12, swing: [0.4, 0.4], reach: [6, 2], legs: [[-4, 0], [-3, 0], [0, 0], [1, 0]] }],
          [34, {}],
        ]),
        speed: f >= 6 && f < 20 ? 1 - (f - 6) / 14 : 0,
        dust: f >= 6 && f < 18 ? (f - 6) / 12 : null,
      }),
    },
    forwardTilt: { // rocket fist: the front arm levels out and flies clean off its shoulder, then floats back
      input: 'forward + light', startup: 7, active: 3, endlag: 17, damage: 8, kb: { base: 20, growth: 70, angle: 35 },
      hitbox: { x: 46, y: -52, w: 40, h: 22 },
      anim: f => tween(f, [
        [0, {}],
        [5, { x: -3, rot: -0.08, swing: [0.3, -0.7], reach: [0, -5], legs: legsAll(3, 0) }],
        [7, { x: 4, sx: 1.06, sy: 0.96, rot: 0.1, swing: [-0.3, PUNCH], reach: [-3, 34], legs: [[-6, 0], [-6, 0], [0, 0], [3, 0]] }],
        [10, { x: 4, sx: 1.05, sy: 0.97, rot: 0.09, swing: [-0.3, PUNCH], reach: [-3, 38], legs: [[-6, 0], [-6, 0], [0, 0], [3, 0]] }],
        [17, { x: 2, rot: 0.04, swing: [-0.1, PUNCH], reach: [0, 10], legs: [[-3, 0], [-3, 0], [0, 0], [1, 0]] }],
        [27, {}],
      ]),
    },
    upTilt: { // dip, then spring tall with both arms flung up and a bolt arcing between the antennae overhead
      input: 'up + light', startup: 5, active: 4, endlag: 16, damage: 6, kb: { base: 25, growth: 80, angle: 88 },
      hitbox: { x: -28, y: -100, w: 56, h: 42 },
      anim: f => tween(f, [
        [0, {}],
        [4, { sx: 1.12, sy: 0.84, swing: [-0.3, -0.3], arm: [2, 2], head: [0, 3] }],
        [5, { y: -4, sx: 0.9, sy: 1.18, swing: [2.7, 2.7], reach: [4, -4], arm: [-6, -6], head: [0, -8], zap: 1, legs: legsAll(0, 4) }],
        [9, { y: -3, sx: 0.92, sy: 1.16, swing: [2.6, 2.6], reach: [4, -4], arm: [-5, -5], head: [0, -7], zap: 1, legs: legsAll(0, 3) }],
        [16, { sx: 0.98, sy: 1.04, swing: [0.6, 0.6], head: [0, -2], zap: 0.3 }],
        [25, {}],
      ]),
    },
    downTilt: { // from the crouch: leaning back, the front leg swings out straight along the floor in a quick sweep, then tucks back under
      input: 'down + light', startup: 5, active: 3, endlag: 12, damage: 5, kb: { base: 15, growth: 50, angle: 20 },
      hitbox: { x: 12, y: -18, w: 34, h: 18 },
      anim: f => tween(f, [
        [0, CROUCH],
        [4, { ...CROUCH, x: -2, rot: -0.06, kick: -0.3 }],
        [5, { ...CROUCH, rot: -0.14, swing: [0.5, -0.3], kick: 1.35, legs: [[-2, 0], [-2, 0], [0, 0], [4, 4]] }],
        [8, { ...CROUCH, rot: -0.13, swing: [0.5, -0.3], kick: 1.3, legs: [[-2, 0], [-2, 0], [0, 0], [4, 4]] }],
        [14, { ...CROUCH, rot: -0.03, kick: 0.3 }],
        [20, CROUCH],
      ]),
    },
    getupAttack: { // from flat on its back: rocks, flips over and lands with both arms flung straight out and a crackle, clearing both sides.
      // Can't be hurt until the hit comes out; knockback goes away from Android
      input: 'light / heavy (from knockdown)', startup: 12, active: 4, endlag: 16, damage: 6, kb: { base: 50, growth: 40, angle: 30 },
      hitbox: { x: -62, y: -48, w: 124, h: 30 }, both: true, intangible: [0, 12],
      anim: f => ({
        ...tween(f, [
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94 }],
          [6, { rot: Math.PI - 0.3, sx: 1.12, sy: 0.86 }],
          [11, { rot: Math.PI * 1.7, y: -14, sx: 0.9, sy: 1.1, swing: [-0.5, -0.5], legs: TUCK }],
          [12, { rot: Math.PI * 2, sx: 1.2, sy: 0.84, swing: [-PUNCH, PUNCH], reach: [-6, 6], zap: 1, legs: [[-6, 0], [-3, 0], [3, 0], [6, 0]] }],
          [16, { rot: Math.PI * 2, sx: 1.18, sy: 0.85, swing: [-PUNCH, PUNCH], reach: [-6, 6], zap: 0.8, legs: [[-6, 0], [-3, 0], [3, 0], [6, 0]] }],
          [22, { rot: Math.PI * 2, sx: 1.06, sy: 0.94, swing: [-0.4, 0.4] }],
          [32, { rot: Math.PI * 2 }],
        ]),
        blink: f >= 11 && f < 16 ? 1 : 0, puff: f >= 12 ? (f - 12) / 10 : null,
      }),
    },
  },

  // hold heavy to charge; chargeFrames = max hold, chargeMult = damage multiplier at full charge. Their hitboxes change over the move:
  // hitbox(frame, charge 0 … 1) => box. anim gets the charge too; the viewer (which has none) shows them at full charge
  smashAttacks: {
    forwardSmash: { // search bar chop: the front arm goes up and a Google search bar generates above the head, leaning back over it and
      // typing its query the longer it charges (longer bar, longer reach). Then it swings down in front, from overhead to the floor
      input: 'heavy (X / K), hold to charge', step: 220, startup: 16, active: 5, endlag: 27, damage: 13, kb: { base: 30, growth: 100, angle: 38 },
      hitbox: (f, c = 1) => lanceBox(f, c), chargeFrames: 60, chargeMult: 1.4, chargeAt: 10,
      anim: (f, n, c = 1) => lanceAnim(f, c),
    },
    upSmash: { // Chrome dino: crouch and hold (charge), then spring up and the offline T-rex hops out from behind the head, up and over
      // to the front. Only the dino hits, all along its jump
      input: 'up + heavy (X / K), hold to charge', startup: 12, active: 10, endlag: 20, damage: 13, kb: { base: 32, growth: 98, angle: 80 },
      hitbox: f => { const [x, y] = dinoAt(f); return { x: x - 17, y: y - 36, w: 34, h: 36 }; }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [6, { sx: 1.14, sy: 0.84, swing: [0.4, 0.4], arm: [3, 3], head: [0, 3], blink: 0.5 }],
          [11, { sx: 1.16, sy: 0.82, swing: [0.5, 0.5], arm: [3, 3], head: [0, 4], blink: 0.6 }],
          [12, { y: -4, sx: 0.88, sy: 1.18, swing: [2.6, 2.6], reach: [3, -3], head: [0, -6], zap: 1, legs: legsAll(0, 3) }],
          [16, { y: -3, sx: 0.9, sy: 1.14, swing: [2.4, 2.4], reach: [3, -3], head: [0, -4], zap: 0.6, legs: legsAll(0, 2) }],
          [30, { sx: 0.98, sy: 1.03, swing: [0.4, 0.4] }],
          [42, {}],
        ]),
        dino: f >= 12 ? [...dinoAt(f), f < 22 ? 1 : 1 - (f - 22) / 8] : null,
        puff: f === 12 ? 0 : null,
      }),
    },
    downSmash: { // Google Earth stomp: up on its toes with the arms high (charge), then slam flat; a shockwave spreads along the floor throwing up map tiles
      // both ways and the hitbox spreads with it: the closer the target, the sooner and harder it's hit. Knockback goes away from Android
      input: 'down + heavy (X / K), hold to charge', startup: 12, active: 10, endlag: 20, damage: 13, kb: { base: 30, growth: 95, angle: 20 },
      hitbox: f => { const t = Math.min(1, Math.max(0, (f - 12) / 10)), r = 26 + 110 * t; return { x: -r, y: -22, w: 2 * r, h: 24, mult: 1.15 - 0.4 * t }; },
      both: true, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [8, { sx: 0.92, sy: 1.1, swing: [2.6, 2.6], arm: [-4, -4], head: [0, -3], legs: legsAll(0, 3) }],
          [11, { sx: 0.9, sy: 1.12, swing: [2.7, 2.7], arm: [-5, -5], head: [0, -4], legs: legsAll(0, 4) }],
          [12, { sx: 1.3, sy: 0.66, swing: [-0.4, 0.4], reach: [-4, 4], head: [0, 5], blink: 1, legs: [[-4, 0], [-2, 0], [2, 0], [4, 0]] }],
          [16, { sx: 1.26, sy: 0.7, swing: [-0.3, 0.3], reach: [-3, 3], head: [0, 4], blink: 1, legs: [[-4, 0], [-2, 0], [2, 0], [4, 0]] }],
          [26, { sx: 1.04, sy: 0.96 }],
          [42, {}],
        ]),
        earth: f >= 12 && f < 32 ? (f - 12) / 10 : null, puff: f === 12 ? 0 : null,
      }),
    },
  },

  // B (V / L). Neutral and side are ordinary attacks, ground or air; up is a warp (the engine's warpUp / warpStep); down is a held
  // charge on the ground (the engine fills P.batt while B is held and spends it on the next hit)
  specials: {
    neutralSpecial: { // I'm Feeling Lucky: a search bar pops off the front fist, a random Google app (LUCKY) jumps out of it, and Android
      // winds up and throws it over the top. Each one flies its own way
      input: 'B (V / L), no direction, ground or air · a random app each time', startup: 18, active: 2, endlag: 18, damage: 6, kb: { base: 20, growth: 45, angle: 30 },
      hitbox: null, landingLag: 10, projectile: { x: 30, y: -66, pick: LUCKY },
      anim: (f, n, c, pick = 0) => { // pick = which app came out (the game rolls it; the viewer shows the first)
        const p = tween(f, [
          [0, {}],
          [4, { swing: [0, PUNCH], reach: [0, 2] }],
          [9, { swing: [0, PUNCH], reach: [0, 2], head: [0, -2] }],
          [16, { x: -4, rot: -0.16, swing: [-0.2, 3.3], reach: [0, -6], arm: [0, -6], legs: legsAll(4, 0) }],
          [17, { x: -5, rot: -0.18, swing: [-0.2, 3.35], reach: [0, -6], arm: [0, -7], legs: legsAll(5, 0) }],
          [18, { x: 8, y: -2, sx: 1.12, sy: 0.9, rot: 0.2, swing: [-0.5, 1.4], reach: [-4, 8], legs: [[-10, 2], [-8, 2], [0, 2], [2, 2]] }],
          [22, { x: 8, y: -2, sx: 1.1, sy: 0.91, rot: 0.19, swing: [-0.5, 1.4], reach: [-4, 8], legs: [[-10, 2], [-8, 2], [0, 2], [2, 2]] }],
          [36, {}],
        ]);
        const len = 64 * Math.min(1, f / 4) * (f < 9 ? 1 : Math.max(0, 1 - (f - 9) / 4)); // out on 0 … 4, gone by 13
        if (len > 4) p.bar = [len, Math.min(1, f / 7), "i'm feeling lucky"];
        if (f >= 7 && f < 18) { // pops up out of the bar, then carried up over the head for the throw
          const k = Math.min(1, (f - 7) / 4), u = Math.min(1, Math.max(0, (f - 11) / 5));
          p.item = [56 - 50 * u, -48 - 20 * k - 14 * u, f * 0.3, pick];
        }
        return { ...p, say: f < 8 ? ["> I'm Feeling Lucky", Math.min(1, f / 3)] : f < 34 ? ['✓ ' + LUCKY[pick].name, Math.min(1, (34 - f) / 6)] : null };
      },
    },
    sideSpecial: { // Chrome roll: curl up into a spinning Chrome ball and roll forward, bowling over what's in the way. On the ground
      // holding B keeps it rolling (up to chargeFrames more); in the air it's a sideways recovery, once per airtime (not helpless).
      // dash = rolling frames [from, to), px/s, max fall speed in the air, px/s pop up on an air roll
      input: 'B (V / L) + a direction, ground or air · hold on the ground to roll farther', startup: 8, active: 20, endlag: 14, damage: 8, kb: { base: 30, growth: 55, angle: 40 },
      hitbox: { x: -26, y: -50, w: 54, h: 50 }, landingLag: 12, chargeKey: 'special', chargeAt: 18, chargeFrames: 30,
      dash: { from: 8, to: 28, speed: 560, fall: 90, pop: 260 },
      anim: (f, n, c = 0) => { // c = 0 … 1 extra rolling held so far
        const p = tween(f, [
          [0, {}],
          [6, { sx: 1.14, sy: 0.8, swing: [0.7, 0.7], reach: [4, -4], head: [0, 5], blink: 1, legs: TUCK }],
          [8, { sx: 1.18, sy: 0.76, swing: [0.8, 0.8], reach: [5, -5], head: [0, 6], blink: 1, legs: TUCK }],
          [28, { sx: 1.18, sy: 0.76, swing: [0.8, 0.8], reach: [5, -5], head: [0, 6], blink: 1, legs: TUCK }],
          [32, { sx: 0.92, sy: 1.1, swing: [-0.5, -0.5], head: [0, -3] }],
          [42, {}],
        ]);
        const rolled = f - 8 + 30 * c; // frames spent rolling, counting the held extra
        if (f >= 8 && f < 28) Object.assign(p, { chrome: rolled * 0.42, sx: 1, sy: 1, speed: 0.8, dust: Math.round(rolled) % 6 === 0 ? 0 : null });
        return p;
      },
    },
    upSpecial: { // Maps pin warp: point up and a Maps pin drops where Android's headed (reach px up, or up and ahead along aim with
      // ← →), then it thins out to nothing (can't be hurt), reappears at the pin on blink with a pop that hits all round, and falls helpless
      input: 'up + B (V / L), ground or air · + ← → warps up and ahead', warp: true, startup: 14, active: 4, endlag: 12, blink: 12,
      damage: 6, kb: { base: 40, growth: 50, angle: 80 }, hitbox: { x: -38, y: -74, w: 76, h: 82 }, intangible: [8, 15],
      reach: 210, aim: [0.7, -0.72], gravity: 0.05, landingLag: 16, marker: drawWarpPin,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [6, { sx: 0.94, sy: 1.08, swing: [0.3, 2.9], reach: [0, -6], arm: [0, -6], head: [0, -2], legs: legsAll(0, 2) }],
          [9, { sx: 0.92, sy: 1.1, swing: [0.3, 2.95], reach: [0, -6], arm: [0, -7], head: [0, -3], legs: legsAll(0, 2) }],
          [14, { sx: 1.1, sy: 0.92, swing: [-1.4, 1.4], reach: [-4, 4], zap: 1, legs: TUCK }],
          [18, { sx: 1.08, sy: 0.94, swing: [-1.3, 1.3], reach: [-4, 4], zap: 0.6, legs: TUCK }],
          [30, AIRBORNE],
        ]),
        vanish: f < 9 ? 0 : f < 12 ? (f - 9) / 3 : f < 15 ? 1 - (f - 12) / 3 : 0,
      }),
    },
    downSpecial: { // fast charge: squat and plug a USB-C cable into its back; the battery over its head fills charge per frame from
      // plugAt while B is held, on the ground. Let go (or fill it) to stop. The charge is kept, and the next hit that lands spends it
      // all: damage × (1 + power × charge)
      input: 'down + B (V / L), hold · ground only', charge: 1 / 90, plugAt: 10, power: 0.6, frames: 110,
      anim: f => {
        const p = tween(Math.min(f, 10), [
          [0, {}],
          [6, { sx: 1.12, sy: 0.86, rot: -0.06, swing: [-0.9, 0.4], reach: [-6, 0], head: [0, 2] }],
          [10, { sx: 1.1, sy: 0.88, rot: -0.04, swing: [-0.5, 0.3], reach: [-2, 0], head: [0, 2], blink: 0.5 }],
        ]);
        if (f >= 10) { const h = Math.sin(f * 0.5); p.sy += 0.012 * h; p.zap = f % 20 < 3 ? 0.4 : 0; } // humming, the odd crackle
        return { ...p, cable: Math.min(1, f / 8), batt: Math.min(1, Math.max(0, (f - 10) / 90)) }; // batt: the viewer's; the game shows the real level
      },
    },
  },

  // grabs (G / U), laid out like Claw'd's: a grab that connects holds the target (carry = [dx, dy, rot] of its bottom-centre) until it
  // breaks free; light pummels, a direction throws, letting go on the startup frame
  grabs: {
    grab: { // Circle to Search: the front hand loops a glowing scribble round whatever's just ahead, and it's caught
      input: 'grab (G / U)', startup: 7, active: 4, endlag: 22, hitbox: { x: 16, y: -68, w: 60, h: 64 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [3, { x: -1, rot: -0.06, swing: [0.2, 2.3], reach: [0, 2] }],
          [7, { x: 4, sx: 1.06, sy: 0.95, rot: 0.1, swing: [0.9, 1.9], reach: [10, 10], legs: [[-4, 0], [-3, 0], [2, 0], [4, 0]] }],
          [11, { x: 4, sx: 1.05, sy: 0.96, rot: 0.09, swing: [0.9, 1.8], reach: [10, 9], legs: [[-4, 0], [-3, 0], [2, 0], [4, 0]] }],
          [18, { x: 2, rot: 0.04, swing: [0.4, 1], reach: [3, 3] }],
          [33, {}],
        ]),
        circle: [46, -36, 30, Math.min(1, Math.max(0, (f - 2) / 5)), f < 11 ? 1 : Math.max(0, 1 - (f - 11) / 8)],
      }),
    },
    dashGrab: { // out of a run: lunges in circling as it goes, sliding on the momentum
      input: 'grab while running', startup: 9, active: 3, endlag: 28, hitbox: { x: 16, y: -68, w: 74, h: 64 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, { y: -3, rot: 0.12, legs: [[0, -2], [0, 3], [0, -2], [0, 3]] }], // = run frame 0
          [5, { x: -2, sx: 1.06, sy: 0.92, rot: -0.04, swing: [0.2, 2.3], reach: [0, 2] }],
          [9, { x: 12, y: -2, sx: 1.18, sy: 0.86, rot: 0.18, swing: [1, 1.9], reach: [12, 12], legs: [[-10, 2], [-8, 2], [3, 2], [6, 1]] }],
          [12, { x: 14, sx: 1.16, sy: 0.87, rot: 0.16, swing: [1, 1.8], reach: [12, 11], legs: [[-10, 1], [-8, 1], [3, 1], [6, 0]] }],
          [24, { x: 8, sx: 1.04, sy: 0.96, rot: 0.06, swing: [0.4, 0.9], reach: [4, 3] }],
          [40, {}],
        ]),
        circle: [54, -36, 32, Math.min(1, Math.max(0, (f - 4) / 5)), f < 13 ? 1 : Math.max(0, 1 - (f - 13) / 8)],
        speed: f >= 9 && f < 20 ? 1 - (f - 9) / 11 : 0, dust: f >= 9 && f < 21 ? (f - 9) / 12 : null,
      }),
    },
    hold: { // got it: both floating hands clamped on the front of it, leaning back a little
      input: 'grab connects', frames: 60, breakFree: 90, perDmg: 1.2,
      anim: (f, n = 60) => {
        const b = Math.sin(f / n * Math.PI * 4);
        return { ...A_HOLD, rot: -0.04 + 0.02 * b, sy: 1 - 0.012 * b, carry: [56, -4 + b, 0] };
      },
    },
    pummel: { // reCAPTCHA: the front hand comes down and stamps an "I'm not a robot" box onto it, ticked
      input: 'light (holding)', startup: 5, active: 1, endlag: 10, damage: 1.5,
      anim: f => ({
        ...tween(f, [
          [0, A_HOLD],
          [4, { ...A_HOLD, rot: -0.1, swing: [1.35, 2.7], reach: [30, 4], arm: [0, -6] }],
          [5, { ...A_HOLD, rot: 0.08, sy: 0.95, swing: [1.35, 1.5], reach: [30, 14], carry: [58, -2, 0.04] }],
          [16, A_HOLD],
        ]),
        captcha: [56, -46, f < 5 ? 0 : Math.min(1, (f - 5) / 3), Math.max(0, Math.min(1, f / 2, (16 - f) / 4)), f < 5 ? 1.35 - 0.07 * f : 1],
      }),
    },
    forwardThrow: { // next tab: a Chrome tab strip pops up over it, and a forward swipe flicks it on into the next tab
      input: 'forward (holding)', startup: 10, active: 1, endlag: 18, damage: 7, kb: { base: 55, growth: 55, angle: 35 },
      anim: throwAnim({ at: 10, n: 29, fly: [12, -6, 0.1], say: ['Ctrl+Tab', '→ next tab'], keys: [
        [0, A_HOLD],
        [7, { x: -4, rot: -0.16, sx: 0.95, sy: 1.05, swing: [1, 0.5], reach: [18, -6], legs: legsAll(2, 0), carry: [42, -8, -0.12] }],
        [10, { x: 6, rot: 0.2, sx: 1.16, sy: 0.88, swing: [1.8, 1.8], reach: [40, 16], legs: [[-8, 0], [-6, 0], [2, 0], [4, 0]], carry: [86, -14, 0.2] }],
        [16, { x: 5, rot: 0.14, sx: 1.1, sy: 0.92, swing: [1.6, 1.6], reach: [30, 10] }],
        [29, {}],
      ], extra: f => ({ tabs: [56, -114, Math.min(1, Math.max(0, (f - 7) / 5)), Math.max(0, Math.min(1, f / 3, (26 - f) / 6))], speed: f >= 10 && f < 18 ? 1 - (f - 10) / 8 : 0 }) }),
    },
    backThrow: { // previous tab: hoists it overhead and swipes it back over into the tab behind
      input: 'back (holding)', startup: 14, active: 1, endlag: 20, damage: 9, kb: { base: 60, growth: 62, angle: 42 },
      anim: throwAnim({ at: 14, n: 35, fly: [-12, -4, -0.15], say: ['Ctrl+Shift+Tab', '← previous tab'], keys: [
        [0, A_HOLD],
        [6, { rot: -0.1, sx: 0.92, sy: 1.1, swing: [2.6, 2.6], reach: [20, -4], carry: [24, -62, -0.6] }],
        [11, { rot: -0.3, sx: 0.96, sy: 1.06, swing: [3.6, 3.6], reach: [8, -10], carry: [-30, -58, -2] }],
        [14, { rot: -0.42, sx: 1.08, sy: 0.92, swing: [4.3, 4.3], reach: [0, -14], carry: [-64, -18, -3] }],
        [20, { rot: -0.28, sx: 1.06, sy: 0.94, swing: [3.4, 3.4], reach: [0, -8] }],
        [35, {}],
      ], extra: f => ({ tabs: [0, -174, -Math.min(1, Math.max(0, (f - 8) / 6)), Math.max(0, Math.min(1, f / 3, (30 - f) / 6))] }) }),
    },
    upThrow: { // Drive upload: hoists it overhead under a Drive cloud, the upload bar fills, and it's backed up straight into the sky
      input: 'up (holding)', startup: 18, active: 1, endlag: 18, damage: 6, kb: { base: 70, growth: 45, angle: 90 },
      anim: throwAnim({ at: 18, n: 37, fly: [0, -14, 0.05], say: ['Backing up…', '✓ Backed up'], keys: [
        [0, A_HOLD],
        [6, { sx: 0.94, sy: 1.08, swing: [2.9, 2.9], reach: [18, -18], carry: [0, -66, 0] }],
        [15, { sx: 0.95, sy: 1.07, swing: [2.95, 2.95], reach: [18, -18], carry: [0, -68, 0] }],
        [18, { y: -3, sx: 0.88, sy: 1.14, swing: [3.1, 3.1], reach: [20, -20], zap: 1, carry: [0, -86, 0] }],
        [24, { sx: 0.96, sy: 1.05, swing: [2.6, 2.6], reach: [12, -12], zap: 0.3 }],
        [37, {}],
      ], extra: f => ({ cloud: [0, -204, Math.min(1, Math.max(0, (f - 6) / 12)), Math.max(0, Math.min(1, (f - 2) / 4, (34 - f) / 6))] }) }),
    },
    downThrow: { // Uninstall: a trash can pops up in front, Android lifts it high and slams it in, and it bounces back out
      input: 'down (holding)', startup: 14, active: 1, endlag: 20, damage: 6, kb: { base: 45, growth: 50, angle: 80 },
      anim: throwAnim({ at: 14, n: 35, fly: [2, -9, 0.1], say: ['Uninstall?', '🗑 Uninstalled'], keys: [
        [0, A_HOLD],
        [6, { y: -6, sx: 0.9, sy: 1.12, swing: [2.8, 2.8], reach: [20, -6], carry: [36, -64, 0] }],
        [11, { y: -10, sx: 0.92, sy: 1.1, swing: [2.9, 2.9], reach: [20, -6], carry: [46, -74, 0.1] }],
        [14, { rot: 0.15, sx: 1.25, sy: 0.75, swing: [1.2, 1.2], reach: [30, 10], carry: [64, -8, 0] }],
        [22, { rot: 0.05, sx: 1.08, sy: 0.92, swing: [1, 1], reach: [14, 4] }],
        [35, {}],
      ], extra: f => ({
        trash: [64, 0, f < 4 ? f / 4 : f < 14 ? 1 : f < 17 ? 0 : 0.25 * Math.max(0, 1 - (f - 17) / 6), Math.max(0, Math.min(1, f / 3, (32 - f) / 5))],
        puff: f >= 14 ? (f - 14) / 10 : null,
      }) }),
    },
  },

  // aerials are drawn with a preview-only air: -40 so they float in the viewer; frame 0 / the last frame = the plain airborne pose
  aerials: {
    neutralAir: { // arms flung straight out both ways and a full spin, antennae crackling: hits all around
      input: 'light (airborne)', startup: 4, active: 8, endlag: 14, damage: 6, kb: { base: 20, growth: 60, angle: 45 },
      hitbox: { x: -48, y: -78, w: 96, h: 86 }, landingLag: 8,
      anim: f => {
        const p = tween(f, [[0, AIRBORNE], [3, { sx: 0.92, sy: 1.08, rot: -0.25, swing: [0.4, 0.4], legs: TUCK }],
          [4, { sx: 1.06, sy: 0.95, swing: [-PUNCH, PUNCH], reach: [-4, 4], zap: 1, legs: TUCK }],
          [13, { sx: 1.06, sy: 0.95, swing: [-PUNCH, PUNCH], reach: [-4, 4], zap: 0.8, legs: TUCK }], [26, AIRBORNE]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // spin eases out
        return { ...p, rot: f < 4 ? p.rot : -0.25 + (Math.PI * 2 + 0.25) * e, air: -40 };
      },
    },
    forwardAir: { // hammer: both fists raised high over the head, then brought down together in front
      input: 'forward + light (airborne)', startup: 7, active: 4, endlag: 16, damage: 9, kb: { base: 25, growth: 80, angle: 40 },
      hitbox: { x: 14, y: -54, w: 46, h: 50 }, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [6, { x: -3, sx: 0.94, sy: 1.08, rot: -0.24, swing: [2.9, 2.9], reach: [22, 0], head: [-2, 0], legs: TUCK }],
          [7, { x: 5, sx: 1.1, sy: 0.92, rot: 0.3, swing: [1.35, 1.2], reach: [44, 12], head: [3, 2], blink: 0.5, legs: legsAll(-3, -2) }],
          [11, { x: 5, sx: 1.09, sy: 0.93, rot: 0.28, swing: [1.25, 1.1], reach: [42, 12], head: [3, 2], blink: 0.5, legs: legsAll(-3, -2) }],
          [18, { x: 2, sx: 1.03, sy: 0.98, rot: 0.1, swing: [0.4, 0.4], reach: [8, 2], legs: TUCK }],
          [27, AIRBORNE],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40,
      }),
    },
    backAir: { // dropkick: tip forward and shoot both legs straight out behind
      input: 'back + light (airborne)', startup: 6, active: 4, endlag: 14, damage: 10, kb: { base: 30, growth: 85, angle: 145 },
      hitbox: { x: -54, y: -36, w: 40, h: 30 }, landingLag: 9,
      anim: f => tween(f, [
        [0, { ...AIRBORNE, air: -40 }],
        [5, { x: 3, sx: 0.94, sy: 1.06, rot: -0.1, swing: [0.3, 0.3], kick: [0.5, 0.5], legs: TUCK, air: -40 }],
        [6, { x: -6, sx: 1.08, sy: 0.94, rot: 0.36, swing: [1.2, 1.2], reach: [6, 0], kick: [-1.45, -1.3], legs: [[-2, 4], [0, 0], [0, 0], [-2, 4]], air: -40 }],
        [10, { x: -6, sx: 1.07, sy: 0.95, rot: 0.34, swing: [1.2, 1.2], reach: [6, 0], kick: [-1.4, -1.25], legs: [[-2, 4], [0, 0], [0, 0], [-2, 4]], air: -40 }],
        [16, { x: -2, sx: 1.02, sy: 0.98, rot: 0.1, swing: [0.3, 0.3], kick: [-0.4, -0.3], legs: TUCK, air: -40 }],
        [24, { ...AIRBORNE, air: -40 }],
      ]),
    },
    upAir: { // stretch tall and fire the head straight up off the body, sparks arcing between the antennae
      input: 'up + light (airborne)', startup: 5, active: 5, endlag: 14, damage: 7, kb: { base: 22, growth: 80, angle: 90 },
      hitbox: { x: -30, y: -106, w: 60, h: 46 }, landingLag: 7,
      anim: f => tween(f, [
        [0, { ...AIRBORNE, air: -40 }],
        [4, { sx: 1.12, sy: 0.86, swing: [-0.4, -0.4], head: [0, 3], legs: TUCK, air: -40 }],
        [5, { y: -4, sx: 0.9, sy: 1.16, swing: [-0.7, -0.7], arm: [4, 4], head: [0, -14], zap: 1, blink: 1, legs: legsAll(0, 4), air: -40 }],
        [10, { y: -3, sx: 0.91, sy: 1.14, swing: [-0.7, -0.7], arm: [4, 4], head: [0, -13], zap: 1, blink: 1, legs: legsAll(0, 3), air: -40 }],
        [17, { sx: 0.98, sy: 1.04, swing: [-0.2, -0.2], head: [0, -3], zap: 0.3, legs: TUCK, air: -40 }],
        [24, { ...AIRBORNE, air: -40 }],
      ]),
    },
    downAir: { // stomp: arms thrown up, both legs driven straight down. Spikes
      input: 'down + light (airborne)', startup: 8, active: 6, endlag: 18, damage: 11, kb: { base: 20, growth: 70, angle: 285 },
      hitbox: { x: -22, y: -8, w: 44, h: 26 }, landingLag: 14,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [7, { y: -6, sx: 1.12, sy: 0.84, swing: [2.4, 2.4], legs: legsAll(0, -5) }],
          [8, { y: -2, sx: 0.92, sy: 1.1, swing: [2.8, 2.8], reach: [4, -4], head: [0, -3], legs: [[-2, 13], [-1, 14], [1, 14], [2, 13]] }],
          [14, { y: -2, sx: 0.93, sy: 1.09, swing: [2.8, 2.8], reach: [4, -4], head: [0, -3], legs: [[-2, 12], [-1, 13], [1, 13], [2, 12]] }],
          [22, { swing: [0.6, 0.6], legs: legsAll(0, 3) }],
          [32, AIRBORNE],
        ]),
        fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40,
      }),
    },
  },
};
