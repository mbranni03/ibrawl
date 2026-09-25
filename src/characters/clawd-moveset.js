// Claw'd's moveset (drawn by clawd.js). Fill in values as each move gets built.
//
// input: which buttons trigger it (A = attack, B = special, Z = grab, S = shield; dirs are relative to facing)
// anim:  (frame, totalFrames) => pose — offsets from standing still (fields listed in clawd.js); any field can be left out.
//        null = not made yet. Preview every move on a loop in moves.html.
// frames: loop length in the preview for moves without frame data (defaults to 60)
// Attacks also have frame data (all counts at 60fps) and hitboxes:
//   startup = frames before the hitbox comes out, active = frames it stays out, endlag = frames until you can act again
//   damage  = % added to the target
//   kb      = knockback: base amount, growth with damage %, launch angle in degrees
//   hitbox  = { x, y, w, h } top-left offset from the character's bottom-center (up is negative y), facing right
//   step    = optional forward push (px/s) the move gives the fighter on its first active frame
//   projectile = optional thing thrown on the first active frame: { x, y } spawn point (like hitbox), speed px/s, life s

// blend between keyframes [[frame, pose], …] with smoothstep easing; fields a key leaves out count as 0 (1 for sx/sy)
function tween(f, keys) {
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1][0]) i++;
  const [fa, a] = keys[i], [fb, b] = keys[i + 1];
  let t = Math.min(1, Math.max(0, (f - fa) / (fb - fa)));
  t = t * t * (3 - 2 * t);
  const mix = (p, q) => Array.isArray(p) || Array.isArray(q) // arm / legs arrays blend element by element
    ? (Array.isArray(p) ? p : q).map((_, k) => mix(Array.isArray(p) ? p[k] : p, Array.isArray(q) ? q[k] : q))
    : p + (q - p) * t;
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const d = k === 'sx' || k === 'sy' ? 1 : 0;
    out[k] = mix(a[k] ?? d, b[k] ?? d);
  }
  return out;
}

// shared leg poses (back to front)
const legsAll = (dx, dy) => [[dx, dy], [dx, dy], [dx, dy], [dx, dy]];
const TUCK = [[2, -3], [1, -3], [-1, -3], [-2, -3]]; // feet pulled up under the body
const REACH = legsAll(0, 2);                         // feet stretched down for the floor
const SQUAT = { sx: 1.2, sy: 0.72, arm: 2 };
const CROUCH = { sx: 1.18, sy: 0.66, arm: 2 }; // the held crouch
const AIRBORNE = { arm: -2, legs: TUCK };        // plain floating pose the aerials start and end on
// a ground roll 120px toward d (1 forward, -1 back): crouch, curl into a ball, one full turn, uncurl still facing the same way
// a sideways air dodge toward d (1 forward, -1 back): flinch, then streak off stretched along the way it's going, eyes squeezed shut
const sideDodge = d => f => ({
  ...tween(f, [
    [0, AIRBORNE],
    [2, { sx: 0.9, sy: 1.1, rot: -0.1 * d, arm: -2, legs: TUCK }],
    [4, { x: 30 * d, sx: 1.3, sy: 0.78, rot: 0.12 * d, arm: d > 0 ? [-4, 2] : [2, -4], legs: legsAll(-6 * d, -2) }],
    [14, { x: 130 * d, sx: 1.2, sy: 0.84, rot: 0.08 * d, arm: d > 0 ? [-3, 1] : [1, -3], legs: legsAll(-5 * d, -2) }],
    [18, { x: 140 * d, sx: 0.95, sy: 1.05, rot: -0.04 * d, arm: -2, legs: TUCK }],
    [28, { ...AIRBORNE, x: 144 * d }],
  ]),
  squint: f >= 3 && f < 18, speed: f >= 3 && f < 16 ? d * (1 - (f - 3) / 13) : 0, air: -40,
});
const roll = d => f => {
  const p = tween(f, [
    [0, {}],
    [3, { sx: 1.12, sy: 0.82, rot: 0.1 * d, arm: 2 }],
    [6, { x: 12 * d, sx: 0.86, sy: 0.86, arm: 2, legs: TUCK }],
    [22, { x: 112 * d, sx: 0.86, sy: 0.86, arm: 2, legs: TUCK }],
    [25, { x: 120 * d, sx: 1.14, sy: 0.82, arm: 2 }],
    [30, { x: 120 * d }],
  ]);
  const e = Math.min(1, Math.max(0, (f - 4) / 18));
  return { ...p, rot: d * Math.PI * 2 * e * e * (3 - 2 * e), [d > 0 ? 'dust' : 'dustAhead']: f >= 4 && f < 16 ? (f - 4) / 12 : null }; // kicked up opposite the travel
};
// holding a grabbed bag: leaning back a touch, claws clamped on it
const HOLD = { rot: -0.05, reach: 10, arm: [-2, -3], legs: [[-3, 0], [-2, 0], [1, 0], [2, 0]], carry: [58, -4, 0] };
// a throw: keys carry the bag up to the release frame `at`; after it (viewer only, the game has let go) the bag flies on at
// fly = [vx, vy, spin] per frame, falling. say = [command, result] shown before / after the release (optional)
const throwAnim = ({ keys, at, n, fly: [vx, vy, spin], say: [cmd, done] = [], extra }) => f => {
  const p = tween(f, keys), h = tween(at, keys).carry, t = f - at;
  return {
    ...p, ...extra?.(f), carry: t < 0 ? p.carry : t < 18 ? [h[0] + vx * t, h[1] + vy * t + 0.5 * t * t, h[2] + spin * t] : null,
    ...(cmd ? { say: [t < 0 ? cmd : done, Math.max(0, Math.min(1, f / 4, (n - f) / 6))] } : {}),
  };
};
// hanging off the ledge: body just past the lip, claws hooked over the top, feet dangling
const HANG = { x: -60, air: 40, sy: 1.08, arm: -20, reach: 3, legs: legsAll(0, 3) };

// a whole jump for the preview: squat, spring, tuck at the peak, reach down, land squash. Only `air` differs by height.
const hop = (height, n) => f => {
  const up = 5, down = n - 7; // takeoff and touchdown frames
  const u = (f - up) / (down - up);
  return {
    ...tween(f, [
      [0, {}],
      [4, SQUAT],
      [up + 2, { sx: 0.86, sy: 1.22, arm: -3, legs: legsAll(-1, 1) }],
      [(up + down) / 2, { sx: 1.04, sy: 0.96, arm: -2, legs: TUCK }],
      [down - 1, { sx: 0.94, sy: 1.08, arm: -3, legs: REACH }],
      [down + 2, { sx: 1.2, sy: 0.74, arm: 2 }],
      [n, {}],
    ]),
    air: f > up && f < down ? -height * 4 * u * (1 - u) : 0,
    puff: f >= up && f < up + 10 ? (f - up) / 10 : f >= down ? (f - down) / 7 : null,
  };
};

// neutral special pacing: third k of the effort bar fills in THINK_FILL[k] frames (each slower than the last), then locks in at a
// checkpoint for THINK_HOLD. The tier reached is kept until KO; charging again resumes at thinkFrom(tier), right after that checkpoint
const THINK_FILL = [60, 90, 135], THINK_HOLD = 16;
const thinkFrom = tier => 6 + THINK_FILL.slice(0, tier).reduce((a, n) => a + n + THINK_HOLD, 0); // frame the tier's segment starts filling
const THINK_POWER = [1, 1.1, 1.25, 1.5]; // damage + movement speed multiplier at each tier: low, medium, high, ultrathink

const MOVESET = {
  movement: {
    idle: {
      input: 'none', frames: 120,
      anim: (f, n) => { // two slow breaths per loop, arms bob opposite the squash, one blink near the end
        const b = (1 - Math.cos(f / n * Math.PI * 4)) / 2;
        return { sx: 1 + 0.03 * b, sy: 1 - 0.05 * b, arm: 1.5 * b - 0.75, blink: f >= 100 && f < 106 ? 1 : 0 };
      },
    },
    walk: {
      input: 'left/right (tap)', frames: 40,
      anim: (f, n) => { // two-beat scuttle: legs 1+3 and 2+4 alternate, arms pump opposite, body bobs on each pass
        const p = f / n * Math.PI * 2;
        const y = -0.8 * (1 + Math.cos(2 * p));
        // foot swings forward while lifted, slides back while planted; -y keeps planted feet on the floor as the body bobs
        const foot = q => [3.5 * Math.sin(q), -3.5 * Math.max(0, Math.cos(q)) - y];
        const a = foot(p), b = foot(p + Math.PI);
        return {
          y, sy: 1 + 0.02 * Math.cos(2 * p), sx: 1 - 0.01 * Math.cos(2 * p),
          rot: 0.035 + 0.015 * Math.sin(2 * p),
          arm: [-1.5 * Math.sin(p), 1.5 * Math.sin(p)],
          legs: [a, b, a, b],
        };
      },
    },
    dash: {
      input: 'double-tap left/right', frames: 20,
      anim: f => ({ // crouch, burst forward and hold the stretch, then ease into the run's first frame (the game hands off at 16)
        ...tween(f, [
          [0, {}],
          [3, { x: -2, sx: 1.1, sy: 0.86, rot: -0.05, arm: 1 }],
          [6, { x: 8, y: -3, sx: 1.16, sy: 0.9, rot: 0.16, arm: [-4, 2], legs: [[-8, 3], [-6, 3], [6, -1], [8, 0]], speed: 1 }],
          [11, { x: 7, y: -3, sx: 1.13, sy: 0.91, rot: 0.15, arm: [-4, 2], legs: [[-7, 3], [-5, 3], [5, -1], [7, 0]], speed: 1 }],
          [16, { y: -3, sx: 1.03, sy: 0.98, rot: 0.12, legs: [[0, -2], [0, 3], [0, -2], [0, 3]], speed: 0.5 }], // = run frame 0
          [20, {}],
        ]),
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    run: {
      input: 'hold after dash', frames: 24,
      anim: (f, n) => { // walk cycle pushed harder: longer stride, higher knees, deep lean, a dust kick every step
        const p = f / n * Math.PI * 2, y = -1.5 * (1 + Math.cos(2 * p));
        const foot = q => [6 * Math.sin(q), -5 * Math.max(0, Math.cos(q)) - y];
        const a = foot(p), b = foot(p + Math.PI), kick = (f % (n / 2)) / 9;
        return {
          y, sx: 1.05 - 0.02 * Math.cos(2 * p), sy: 0.95 + 0.03 * Math.cos(2 * p),
          rot: 0.12 + 0.03 * Math.sin(2 * p),
          arm: [-3 * Math.sin(p), 3 * Math.sin(p)],
          legs: [a, b, a, b],
          speed: 0.5,
          dust: kick <= 1 ? kick : null,
        };
      },
    },
    skid: { // turnaround
      input: 'reverse while running', frames: 26,
      anim: f => ({ // dig in and lean back, slide to a stop, then flip around (sx goes negative = facing the other way)
        ...tween(f, [
          [0, { rot: 0.12, sx: 1.05, sy: 0.95, arm: [-2, 1], speed: 0.5 }],
          [4, { x: 4, rot: -0.2, sx: 1.1, sy: 0.88, arm: -4, legs: [[2, 0], [3, 0], [7, 0], [9, 0]] }],
          [13, { x: 10, rot: -0.16, sx: 1.08, sy: 0.9, arm: -3, legs: [[2, 0], [3, 0], [7, 0], [9, 0]] }],
          [17, { x: 10, sx: 0.15, sy: 1.05 }],
          [21, { x: 10, sx: -1.08, sy: 0.94 }],
          [26, { x: 10, sx: -1 }],
        ]),
        dustAhead: f >= 3 && f < 15 ? (f - 3) / 12 : null,
      }),
    },
    crouch: {
      input: 'down (grounded)', frames: 60,
      anim: f => { // drop low and wide, hold with a small breath, stand back up
        const p = tween(f, [[0, {}], [5, CROUCH], [50, CROUCH], [60, {}]]);
        if (f > 5 && f < 50) p.sy += 0.012 * Math.sin((f - 5) / 45 * Math.PI * 4);
        return p;
      },
    },
    crouchWalk: {
      input: 'down + left/right (grounded)', frames: 32,
      anim: (f, n) => { // stays as low as the crouch: short shuffling steps, arms paddling, barely any bob
        const p = f / n * Math.PI * 2, y = -0.5 * (1 + Math.cos(2 * p));
        const foot = q => [2.5 * Math.sin(q), -1.5 * Math.max(0, Math.cos(q)) - y];
        const a = foot(p), b = foot(p + Math.PI);
        return {
          y, sx: 1.16 + 0.015 * Math.cos(2 * p), sy: 0.68 - 0.015 * Math.cos(2 * p), rot: 0.04,
          arm: [2 - Math.sin(p), 2 + Math.sin(p)],
          legs: [a, b, a, b],
        };
      },
    },
    jumpSquat: { // short wind-up before leaving the ground
      input: 'jump (grounded)', frames: 14,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { ...SQUAT, legs: [[-2, 0], [-1, 0], [1, 0], [2, 0]] }],
          [6, { sx: 1.24, sy: 0.68, arm: 2, legs: [[-2, 0], [-1, 0], [1, 0], [2, 0]] }],
          [9, { sx: 0.86, sy: 1.2, arm: -3, air: -6, legs: legsAll(0, 2) }],
          [14, {}],
        ]),
        puff: f >= 6 ? (f - 6) / 8 : null,
      }),
    },
    fullHop:     { input: 'hold jump', frames: 64, anim: hop(110, 64) },
    shortHop:    { input: 'tap jump',  frames: 40, anim: hop(45, 40) },
    doubleJump: {
      input: 'jump (airborne)', frames: 36,
      anim: f => tween(f, [ // kick off the air and do a full forward flip, balled up
        [0, { air: -50, legs: legsAll(0, 1) }],
        [3, { air: -52, sx: 1.15, sy: 0.85, arm: 2, legs: TUCK }],
        [6, { air: -70, sx: 0.9, sy: 1.15, arm: -4, rot: 0.3, legs: legsAll(0, 3) }],
        [20, { air: -110, rot: Math.PI * 2, arm: -1, legs: TUCK }],
        [28, { air: -100, rot: Math.PI * 2, arm: -2, legs: legsAll(0, 1) }],
        [36, { air: -50, rot: Math.PI * 2, legs: legsAll(0, 1) }],
      ]),
    },
    fall: {
      input: 'none', frames: 40,
      anim: (f, n) => { // drifting down: slight stretch, arms flapping, legs pedalling
        const p = f / n * Math.PI * 2, s = Math.sin(p * 2);
        return {
          air: -80 + 3 * Math.sin(p), sx: 0.98, sy: 1.03,
          arm: [-3 + s, -3 - s],
          legs: [[0, 1.5 + 1.5 * s], [0, 1.5 - 1.5 * s], [0, 1.5 + 1.5 * s], [0, 1.5 - 1.5 * s]],
        };
      },
    },
    fastFall: {
      input: 'double-tap down (airborne, falling)', frames: 24,
      anim: (f, n) => { // stretched like a dart, arms up, legs pointed down, streaks overhead
        const p = f / n * Math.PI * 2;
        return {
          air: -70, sx: 0.88, sy: 1.16, arm: -5, legs: legsAll(0, 3 + 0.5 * Math.sin(p * 2)),
          fallLines: 0.75 + 0.25 * Math.sin(p * 2),
        };
      },
    },
    land: {
      input: 'none', frames: 18,
      anim: f => ({ // touch down stretched, squash hard, wobble back to standing
        ...tween(f, [
          [0, { air: -20, sx: 0.92, sy: 1.1, arm: -3, legs: REACH }],
          [3, { sx: 1.25, sy: 0.7, arm: 3 }],
          [8, { sx: 0.95, sy: 1.06, arm: -1 }],
          [12, { sx: 1.02, sy: 0.98 }],
          [18, {}],
        ]),
        puff: f >= 3 ? (f - 3) / 15 : null,
      }),
    },
    platformDrop: {
      input: 'down (on platform)', frames: 40,
      anim: f => tween(f, [ // quick dip, then slip down through the platform (the preview floor) with arms up
        [0, {}],
        [4, { sx: 1.1, sy: 0.85, arm: 1 }],
        [8, { air: 6, sx: 0.94, sy: 1.08, arm: -3, legs: legsAll(0, 1) }],
        [30, { air: 55, sx: 0.96, sy: 1.06, arm: -4, legs: legsAll(0, 2) }],
        [40, { air: 55, sx: 0.96, sy: 1.06, arm: -4, legs: legsAll(0, 2) }],
      ]),
    },
  },

  // the floor is the stage top and Claw'd faces the stage; x / air are measured from standing right at the lip.
  // The game uses them as root motion while on the ledge (grab / hang / getup / jump wind-up), so they matter here.
  ledge: {
    ledgeGrab: {
      input: 'fall near ledge', frames: 10,
      anim: f => tween(f, [ // catch it with both claws, weight drops and stretches, settle into the hang
        [0, { x: -60, air: 28, sx: 0.9, sy: 1.14, arm: -24, legs: legsAll(0, 3) }],
        [4, { x: -60, air: 46, sx: 1.06, sy: 0.94, arm: -18, reach: 3, legs: legsAll(0, 5) }],
        [10, HANG],
      ]),
    },
    ledgeHang: {
      input: 'none', frames: 60,
      anim: (f, n) => { // dangling: slow pendulum sway, legs trailing behind it
        const s = Math.sin(f / n * Math.PI * 2);
        return { ...HANG, rot: 0.04 * s, legs: [[-s, 3], [-s, 3.5], [-s, 3.5], [-s, 3]], blink: f >= 40 && f < 46 ? 1 : 0 };
      },
    },
    ledgeGetup: {
      input: 'toward stage / up', frames: 24,
      anim: f => ({ // dip, haul up over the lip legs tucked, squash down onto the stage
        ...tween(f, [
          [0, HANG],
          [5, { x: -60, air: 46, sx: 1.08, sy: 0.9, arm: -24, reach: 3, legs: legsAll(0, 2) }],
          [11, { x: -46, air: -6, sx: 0.9, sy: 1.14, rot: 0.25, arm: -8, legs: TUCK }],
          [16, { x: -14, air: -4, rot: 0.15, legs: TUCK }],
          [19, { sx: 1.18, sy: 0.78, arm: 2 }],
          [24, {}],
        ]),
        puff: f >= 19 ? (f - 19) / 5 : null,
      }),
    },
    ledgeJump: {
      input: 'jump', frames: 40, launchAt: 6, // the game hands off to the normal jump arc at launchAt
      anim: f => tween(f, [ // pull down, spring straight up off the ledge, drift over the stage
        [0, HANG],
        [4, { x: -60, air: 48, sx: 1.1, sy: 0.88, arm: -22, reach: 3, legs: legsAll(0, 2) }],
        [6, { x: -58, air: 40, sx: 0.86, sy: 1.22, arm: -4, legs: legsAll(0, 3) }],
        [20, { x: -40, air: -90, sx: 1.04, sy: 0.96, arm: -2, legs: TUCK }],
        [34, { x: -24, air: -40, sx: 0.94, sy: 1.08, arm: -3, legs: REACH }],
        [40, { x: -20, air: -30, sx: 0.94, sy: 1.08, arm: -3, legs: REACH }],
      ]),
    },
    ledgeRoll: {
      input: 'dodge (Shift / Z)', frames: 36, intangible: [0, 36], // can't be hurt the whole way
      anim: f => { // haul up, curl into a ball and roll a full turn onto the stage, pop up standing well inland
        const p = tween(f, [
          [0, HANG],
          [5, { x: -60, air: 46, sx: 1.08, sy: 0.9, arm: -24, reach: 3, legs: legsAll(0, 2) }],
          [10, { x: -40, air: -10, sx: 0.86, sy: 0.86, arm: 2, legs: TUCK }],
          [25, { x: 72, air: -4, sx: 0.86, sy: 0.86, arm: 2, legs: TUCK }],
          [28, { x: 84, sx: 1.16, sy: 0.8, arm: 2 }],
          [36, { x: 90 }],
        ]);
        const e = Math.min(1, Math.max(0, (f - 9) / 17));
        return { ...p, rot: Math.PI * 2 * e * e * (3 - 2 * e), puff: f >= 26 && f < 32 ? (f - 26) / 6 : null };
      },
    },
    ledgeAttack: { // haul up with the claw cocked, land in a crouch and sweep it low along the stage
      input: 'light / heavy (on ledge)', startup: 16, active: 4, endlag: 16, damage: 7, kb: { base: 30, growth: 50, angle: 35 },
      hitbox: { x: 30, y: -30, w: 52, h: 28 },
      anim: f => ({
        ...tween(f, [
          [0, HANG],
          [4, { x: -60, air: 46, sx: 1.08, sy: 0.9, arm: -24, reach: 3, legs: legsAll(0, 2) }],
          [9, { x: -44, air: -8, sx: 0.9, sy: 1.14, rot: 0.25, arm: -8, legs: TUCK }],
          [13, { x: -16, air: -4, rot: -0.1, reach: -4, arm: [0, -12], legs: TUCK }],
          [15, { x: -6, sx: 1.14, sy: 0.84, rot: -0.12, reach: -5, arm: [2, -14] }],
          [16, { x: 4, sx: 1.2, sy: 0.84, rot: 0.14, reach: 26, arm: [-2, 5], legs: [[-8, 0], [-8, 0], [-2, 0], [3, 0]] }],
          [20, { x: 4, sx: 1.18, sy: 0.85, rot: 0.13, reach: 24, arm: [-2, 5], legs: [[-8, 0], [-8, 0], [-2, 0], [3, 0]] }],
          [28, { x: 2, sx: 1.05, sy: 0.96, rot: 0.04, reach: 6, arm: [-1, 1], legs: [[-3, 0], [-3, 0], [-1, 0], [1, 0]] }],
          [36, {}],
        ]),
        speed: f >= 16 && f < 20 ? 0.6 : 0,
        puff: f >= 15 && f < 21 ? (f - 15) / 6 : null,
      }),
    },
    ledgeDrop: {
      input: 'away / down', frames: 24,
      anim: f => tween(f, [ // let go: arms stay up a moment, then slide down the wall
        [0, HANG],
        [4, { x: -62, air: 50, sx: 0.92, sy: 1.1, arm: -10, legs: legsAll(0, 3) }],
        [16, { x: -66, air: 110, sx: 0.96, sy: 1.04, arm: -4, legs: legsAll(0, 2) }],
        [24, { x: -66, air: 110, sx: 0.96, sy: 1.04, arm: -4, legs: legsAll(0, 2) }],
      ]),
    },
  },

  defense: {
    shield: { name: 'Terminal Roof', // hold: crouch and hold a little terminal over its head like a roof (in the game it shrinks as the shield wears down)
      input: 'hold dodge (Shift / Z)', frames: 60,
      anim: f => {
        const brace = { sx: 1.14, sy: 0.72, arm: -14, legs: [[-2, 0], [-1, 0], [1, 0], [2, 0]], shield: 1 };
        const p = tween(f, [[0, {}], [4, brace], [50, brace], [57, {}], [60, {}]]);
        if (f > 4 && f < 50) p.sy += 0.01 * Math.sin((f - 4) / 46 * Math.PI * 4); // breathing behind it
        return { ...p, squint: f >= 3 && f < 52, eyeY: 4 * (p.shield || 0), wear: Math.min(1, Math.max(0, (f - 4) / 46)) }; // preview wears it out over the hold (the game uses the real shield health) // eyes squeezed shut > < and ducked under the terminal, bracing for the hit
      },
    },
    shieldBreak: { name: 'Context Overflow', // the shield ran out: the terminal shatters, Claw'd pops up and lands dizzy (mash any key to shake it off sooner)
      input: 'shield runs out', frames: 150, pop: 560,
      anim: f => {
        const p = tween(f, [
          [0, { sx: 0.9, sy: 1.12, arm: -8, blink: 1, legs: legsAll(0, 2) }],
          [14, { sx: 0.96, sy: 1.05, arm: -4, blink: 1, legs: TUCK }],
          [28, { sx: 0.94, sy: 1.08, arm: -2, legs: REACH }],
          [32, { sx: 1.16, sy: 0.82, arm: 3 }],
          [40, { sx: 1.04, sy: 0.94, arm: 3 }],
          [140, { sx: 1.04, sy: 0.94, arm: 3 }],
          [150, {}],
        ]);
        const dizzy = f >= 32 && f < 144;
        return {
          ...p, air: f < 28 ? -60 * Math.sin(Math.PI * f / 28) : 0, // preview-only pop; the game launches it for real
          rot: dizzy ? 0.1 * Math.sin((f - 32) / 9) : 0, dizzy: dizzy ? 0.01 + (f - 32) / 40 : 0,
          shatter: f < 30 ? f / 30 : null, puff: f >= 28 && f < 34 ? (f - 28) / 6 : null,
          oops: Math.min(1, Math.max(0, Math.min((f - 32) / 6, (110 - f) / 10))), // "context window full"-style toast for a bit after landing
        };
      },
    },
    // dodges: intangible = [first, last) frames nothing can hurt Claw'd; a roll's x is real movement in the game (root motion)
    spotDodge: {
      input: 'dodge + ↓ (Shift / Z), or ↓ while shielding', frames: 26, intangible: [3, 18],
      anim: f => tween(f, [ // quick squash, then shrink back "into the page" with eyes shut, and pop out again
        [0, {}],
        [3, { sx: 1.15, sy: 0.8, arm: 3 }],
        [6, { sx: 0.8, sy: 0.84, blink: 1, arm: -2 }],
        [16, { sx: 0.8, sy: 0.84, blink: 1, arm: -2 }],
        [21, { sx: 1.1, sy: 0.9, arm: 1 }],
        [26, {}],
      ]),
    },
    rollForward: { input: 'dodge + forward, or forward while shielding', frames: 30, intangible: [4, 20], anim: roll(1) },
    rollBack:    { input: 'dodge + back, or back while shielding', frames: 30, intangible: [4, 20], anim: roll(-1) },
    airDodgeForward: { input: 'dodge + forward (airborne)', frames: 28, anim: sideDodge(1) }, // the game swaps these in for sideways air dodges
    airDodgeBack:    { input: 'dodge + back (airborne)',    frames: 28, anim: sideDodge(-1) },
    airDodge: { // once per airtime: a burst of speed toward the held direction (none = stall in place), then free to act
      input: 'dodge (airborne) + any direction', frames: 28, intangible: [2, 18], speed: 720, burst: 12, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [2, { sx: 1.1, sy: 0.9, arm: 3, legs: TUCK }],
          [5, { sx: 0.8, sy: 0.84, blink: 1, arm: -2, legs: TUCK }],
          [18, { sx: 0.8, sy: 0.84, blink: 1, arm: -2, legs: TUCK }],
          [24, { sx: 1.05, sy: 0.97, arm: -2, legs: TUCK }],
          [28, AIRBORNE],
        ]),
        air: -40,
      }),
    },
  },

  // getting hit. The game turns a hit's knockback into kb units (base + growth × damage% / 100): hitstun lasts perKb frames per
  // unit, and from tumble.threshold up it's a tumble instead, which ends in a knockdown if it hits the ground without a tech
  reactions: {
    hitstun: { // light hit: snaps back with its eyes squeezed shut, shudders, shakes it off (the game stretches this over the hitstun)
      input: 'hit (knockback under 80)', frames: 30, perKb: 0.4,
      anim: (f, n = 30) => {
        const t = f / n * 30, p = tween(t, [
          [0, { x: -4, sx: 0.86, sy: 1.14, rot: -0.28, arm: -7, legs: [[-3, -2], [-2, 0], [2, 0], [3, -2]] }],
          [5, { x: -6, sx: 0.92, sy: 1.08, rot: -0.22, arm: -5, legs: [[-2, -1], [-1, 0], [1, 0], [2, -1]] }],
          [22, { x: -3, sx: 1.04, sy: 0.96, rot: -0.06, arm: -1 }],
          [30, {}],
        ]);
        if (t < 10) p.x += f % 2 ? 1.5 : -1.5;
        return { ...p, squint: t < 20 };
      },
    },
    tumble: { // launched hard: spinning head over heels, limbs flailing. Can act again once the hitstun runs out
      input: 'hit (knockback 80+)', frames: 40, threshold: 80,
      anim: (f, n = 40) => {
        const p = f / n * Math.PI * 2, s = Math.sin(2 * p);
        return { rot: -p, sx: 0.94, sy: 1.06, arm: [-2 - 5 * s, -2 + 5 * s], legs: [[-3, -3 * s], [-1, 3 * s], [1, -3 * s], [3, 3 * s]], squint: true, air: -30 };
      },
    },
    knockdown: { // tumbled into the ground: slams onto its back, bounces, then lies there seeing stars, legs kicking like a flipped crab
      input: 'tumble into the ground', frames: 90, bounce: 14, // any input from bounce on gets up (← → rolls away); at frames it gets up anyway
      anim: f => {
        const kick = i => f >= 14 ? 2 + 2 * Math.sin((f - 14) / 3 + i * 1.7) : 0;
        return {
          ...tween(f, [
            [0, { sx: 1.3, sy: 0.6, arm: 4 }],
            [6, { y: -14, sx: 0.95, sy: 1.05, arm: -2 }],
            [12, { sx: 1.2, sy: 0.75, arm: 3 }],
            [18, { sx: 1.04, sy: 0.94, arm: 1 }],
          ]),
          rot: Math.PI, legs: [0, 1, 2, 3].map(i => [kick(i) / 2, kick(i)]), // upside down, so + dy kicks them up
          squint: f < 14, dizzy: f >= 14 ? 0.01 + (f - 14) / 40 : 0, puff: f < 8 ? f / 8 : f >= 12 && f < 18 ? (f - 12) / 6 : null,
        };
      },
    },
    tech: { // shield / dodge pressed just before tumbling into the ground: slaps the floor and pops straight back onto its feet
      input: 'dodge within window frames before landing in tumble · + ← → tech roll', frames: 22, window: 20, intangible: [0, 16],
      lockout: 40, // after a press in tumble, more presses don't count for this many frames: mashing misses techs
      anim: f => ({
        ...tween(f, [
          [0, { sx: 1.3, sy: 0.66, arm: 4 }],
          [5, { y: -18, sx: 0.9, sy: 1.12, arm: -4, legs: TUCK }],
          [11, { sx: 1.14, sy: 0.84, arm: 2 }],
          [22, {}],
        ]),
        ring: f < 12 ? f / 12 : null, squint: f < 5,
      }),
    },
    getup: { // any input from knockdown: rocks back, kicks over forward onto its feet (can't be hurt until it's standing)
      input: 'any (from knockdown) · ← → roll instead', frames: 26, intangible: [0, 20],
      anim: f => ({
        ...tween(f, [
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94, arm: 1 }],
          [5, { rot: Math.PI - 0.25, sx: 1.12, sy: 0.86, arm: 3 }],
          [13, { rot: Math.PI * 1.55, y: -26, sx: 0.9, sy: 1.1, arm: -3, legs: TUCK }],
          [18, { rot: Math.PI * 2, sx: 1.2, sy: 0.76, arm: 2 }],
          [26, { rot: Math.PI * 2 }],
        ]),
        puff: f >= 18 ? (f - 18) / 8 : null,
      }),
    },
    ko: { // crossed the blast zone: spins off shrinking (preview only), then all that's left is a burst of ink and orange at the edge
      input: 'cross the blast zone', frames: 80, blastAt: 20, // the game shows frames blastAt … frames, then respawns
      anim: f => f < 20
        ? { x: 7 * f, air: -5 * f, rot: -f / 4, sx: 1 - f / 40, sy: 1 - f / 40, arm: -5, squint: true }
        : { x: 140, air: -100, blast: [(f - 20) / 60, Math.PI - 0.6] }, // rays shoot back the way it came
    },
    respawn: { name: 'Claude Resume', // next stock: lowered in on a hovering platform, stands there until any input (or wait frames), then drops, flickering
      input: 'after a KO · any key drops', frames: 120, descend: 40, wait: 180, say: '> claude --resume',
      anim: f => { // preview: descend, stand, drop to the floor
        const e = 1 - (1 - Math.min(1, f / 40)) ** 3, d = Math.max(0, (f - 100) / 20);
        return { ...MOVESET.movement.idle.anim(f % 120, 120), air: -170 + 110 * e + 60 * d * d, pad: +(f < 100), say: ['> claude --resume', f < 100 ? Math.min(1, f / 10) : 0] };
      },
    },
  },

  groundAttacks: {
    jab1: { name: 'Quick Snip', // quick front-claw poke: tiny wind-up, snap out on frame 3, feet stay planted
      input: 'light', startup: 3, active: 2, endlag: 14, damage: 2.5, kb: { base: 8, growth: 25, angle: 40 },
      hitbox: { x: 36, y: -34, w: 30, h: 18 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -2, sx: 1.04, sy: 0.97, rot: -0.06, reach: -3, arm: [-1, 1], legs: legsAll(2, 0) }],
          [3, { x: 4, sx: 1.08, sy: 0.95, rot: 0.1, reach: 20, arm: [2, 0], legs: [[-4, 0], [-4, 0], [0, 0], [2, 0]] }],
          [6, { x: 4, sx: 1.06, sy: 0.96, rot: 0.09, reach: 18, arm: [2, 0], legs: [[-4, 0], [-4, 0], [0, 0], [2, 0]] }],
          [11, { x: 2, sx: 1.02, sy: 0.99, rot: 0.03, reach: 4, arm: [1, 0], legs: [[-2, 0], [-2, 0], [0, 0], [1, 0]] }],
          [19, {}],
        ]),
        speed: f >= 3 && f < 6 ? 0.4 : 0,
      }),
    },
    jab2: { name: 'Claw Scoop', // rising swipe: the claw scoops out and up, body stretching tall with it
      input: 'light (after jab1)', startup: 3, active: 2, endlag: 16, damage: 2, kb: { base: 10, growth: 25, angle: 50 },
      hitbox: { x: 32, y: -52, w: 28, h: 28 },
      anim: f => tween(f, [
        [0, {}],
        [2, { x: -1, sx: 0.98, sy: 1.03, rot: 0.03, reach: 2, arm: [0, 4], legs: legsAll(1, 0) }],
        [3, { x: 3, y: -2, sx: 0.96, sy: 1.07, rot: -0.05, reach: 16, arm: [2, -10], legs: legsAll(-3, 2) }],
        [6, { x: 3, y: -2, sx: 0.97, sy: 1.06, rot: -0.06, reach: 12, arm: [2, -15], legs: legsAll(-3, 2) }],
        [12, { x: 1, sx: 0.99, sy: 1.01, rot: -0.02, reach: 3, arm: [1, -4], legs: legsAll(-1, 0) }],
        [21, {}],
      ]),
    },
    jab3: { name: 'Claw Thrust', // finisher: coil back, then throw the whole body forward behind a full-length claw
      input: 'light (after jab2)', step: 220, startup: 5, active: 3, endlag: 24, damage: 4.5, kb: { base: 40, growth: 80, angle: 40 },
      hitbox: { x: 30, y: -40, w: 46, h: 34 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -5, sx: 1.12, sy: 0.86, rot: -0.12, reach: -4, arm: [-2, 3], legs: legsAll(5, 0) }],
          [5, { x: 14, y: -2, sx: 1.2, sy: 0.86, rot: 0.2, reach: 26, arm: [-4, 0], legs: [[-12, 2], [-10, 2], [-2, 2], [2, 2]] }],
          [8, { x: 15, y: -2, sx: 1.18, sy: 0.87, rot: 0.19, reach: 24, arm: [-4, 0], legs: [[-12, 2], [-10, 2], [-2, 2], [2, 2]] }],
          [16, { x: 10, sx: 1.06, sy: 0.95, rot: 0.07, reach: 8, arm: [-1, 0], legs: [[-6, 0], [-5, 0], [-1, 0], [1, 0]] }],
          [32, {}],
        ]),
        speed: f >= 5 && f < 12 ? 1 - (f - 5) / 7 : 0,
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null,
      }),
    },
    dashAttack: { name: 'Claw Lunge', // claw-first lunge out of a run: hop low and long, slide on the momentum
      input: 'light while running', startup: 6, active: 8, endlag: 20, damage: 7, kb: { base: 35, growth: 60, angle: 55 },
      hitbox: { x: 22, y: -40, w: 50, h: 36 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -3, sx: 1.06, sy: 0.92, rot: -0.08, reach: -3, arm: [0, 3], legs: legsAll(3, 0) }],
          [6, { x: 10, y: -4, sx: 1.25, sy: 0.8, rot: 0.1, reach: 22, arm: [-4, 1], legs: [[-10, 3], [-8, 3], [2, 3], [5, 2]] }],
          [14, { x: 12, y: -2, sx: 1.22, sy: 0.82, rot: 0.08, reach: 20, arm: [-4, 1], legs: [[-10, 2], [-8, 2], [2, 2], [5, 1]] }],
          [22, { x: 6, sx: 1.08, sy: 0.92, rot: 0.03, reach: 6, arm: [-1, 0], legs: [[-4, 0], [-3, 0], [0, 0], [1, 0]] }],
          [34, {}],
        ]),
        speed: f >= 6 && f < 20 ? 1 - (f - 6) / 14 : 0,
        dust: f >= 6 && f < 18 ? (f - 6) / 12 : null,
      }),
    },
    forwardTilt: { name: 'Long Claw', // step in behind a long straight claw: jab's reach and then some
      input: 'forward + light', step: 260, startup: 6, active: 3, endlag: 18, damage: 8, kb: { base: 20, growth: 70, angle: 35 },
      hitbox: { x: 36, y: -38, w: 42, h: 22 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: -4, sx: 0.96, sy: 1.04, rot: -0.1, reach: -4, arm: [1, -5], legs: legsAll(4, 0) }],
          [6, { x: 8, sx: 1.14, sy: 0.92, rot: 0.08, reach: 26, arm: [-3, 0], legs: [[-8, 0], [-8, 0], [-2, 0], [3, 0]] }],
          [9, { x: 8, sx: 1.12, sy: 0.93, rot: 0.07, reach: 24, arm: [-3, 0], legs: [[-8, 0], [-8, 0], [-2, 0], [3, 0]] }],
          [16, { x: 4, sx: 1.04, sy: 0.98, rot: 0.03, reach: 8, arm: [-1, 0], legs: [[-4, 0], [-4, 0], [-1, 0], [1, 0]] }],
          [27, {}],
        ]),
        speed: f >= 6 && f < 10 ? 0.5 : 0,
      }),
    },
    upTilt: { name: 'Skyward Claw', // dip, then spring tall and throw the claw straight up past the head
      input: 'up + light', startup: 5, active: 4, endlag: 16, damage: 6, kb: { base: 25, growth: 80, angle: 88 },
      hitbox: { x: 16, y: -90, w: 40, h: 40 },
      anim: f => tween(f, [
        [0, {}],
        [4, { sx: 1.12, sy: 0.84, rot: 0.06, arm: [2, 6] }],
        [5, { y: -4, sx: 0.9, sy: 1.22, rot: -0.12, reach: 5, arm: [0, -28], legs: legsAll(0, 4) }],
        [9, { y: -3, sx: 0.92, sy: 1.2, rot: -0.11, reach: 4, arm: [0, -30], legs: legsAll(0, 3) }],
        [16, { sx: 0.98, sy: 1.05, rot: -0.04, reach: 2, arm: [0, -8] }],
        [25, {}],
      ]),
    },
    downTilt: { name: 'Low Snip', // from the crouch: a quick low claw poke along the floor, then back down
      input: 'down + light', startup: 5, active: 3, endlag: 12, damage: 5, kb: { base: 15, growth: 50, angle: 20 },
      hitbox: { x: 38, y: -20, w: 40, h: 18 },
      anim: f => tween(f, [
        [0, CROUCH],
        [4, { ...CROUCH, x: -2, rot: -0.04, reach: -3, arm: [2, 0] }],
        [5, { ...CROUCH, x: 5, sx: 1.24, rot: 0.06, reach: 26, arm: [2, 6], legs: [[-5, 0], [-5, 0], [0, 0], [2, 0]] }],
        [8, { ...CROUCH, x: 5, sx: 1.23, rot: 0.06, reach: 24, arm: [2, 6], legs: [[-5, 0], [-5, 0], [0, 0], [2, 0]] }],
        [14, { ...CROUCH, x: 2, reach: 6, arm: [2, 3], legs: [[-2, 0], [-2, 0], [0, 0], [1, 0]] }],
        [20, CROUCH],
      ]),
    },
    getupAttack: { name: 'Crab Sweep', // from flat on its back: rocks, kicks over and lands spread wide with both claws out, clearing both sides.
      // Can't be hurt until the hit comes out; knockback goes away from Claw'd
      input: 'light / heavy (from knockdown)', startup: 12, active: 4, endlag: 16, damage: 6, kb: { base: 50, growth: 40, angle: 30 },
      hitbox: { x: -75, y: -30, w: 150, h: 30 }, both: true, intangible: [0, 12],
      anim: f => ({
        ...tween(f, [
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94, arm: 1 }],
          [6, { rot: Math.PI - 0.3, sx: 1.12, sy: 0.86, arm: 3 }],
          [11, { rot: Math.PI * 1.7, y: -14, sx: 0.9, sy: 1.1, arm: -4, legs: TUCK }],
          [12, { rot: Math.PI * 2, sx: 1.36, sy: 0.7, arm: 4, reach: 18, legs: [[-6, 0], [-3, 0], [3, 0], [6, 0]] }],
          [16, { rot: Math.PI * 2, sx: 1.34, sy: 0.72, arm: 4, reach: 18, legs: [[-6, 0], [-3, 0], [3, 0], [6, 0]] }],
          [22, { rot: Math.PI * 2, sx: 1.1, sy: 0.9, arm: 2, reach: 6 }],
          [32, { rot: Math.PI * 2 }],
        ]),
        squint: f >= 11 && f < 16, puff: f >= 12 ? (f - 12) / 10 : null,
      }),
    },
  },

  // hold the button to charge; chargeFrames = max hold, chargeMult = damage multiplier at full charge
  smashAttacks: {
    forwardSmash: { name: 'Claw Chop', // heavy: rear way back with the claw cocked high (charge holds here, frame 10), then chop forward with the whole body
      input: 'heavy (X / K), hold to charge', step: 320, startup: 14, active: 4, endlag: 30, damage: 14, kb: { base: 30, growth: 100, angle: 38 },
      hitbox: { x: 34, y: -38, w: 62, h: 38 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 10,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [10, { x: -8, sx: 0.94, sy: 1.08, rot: -0.22, reach: -5, arm: [2, -12], legs: legsAll(8, 0) }],
          [13, { x: -9, sx: 0.93, sy: 1.09, rot: -0.24, reach: -6, arm: [2, -13], legs: legsAll(9, 0) }],
          [14, { x: 18, y: -2, sx: 1.26, sy: 0.82, rot: 0.18, reach: 30, arm: [-5, -2], legs: [[-16, 2], [-14, 2], [-4, 2], [2, 2]] }],
          [18, { x: 19, y: -2, sx: 1.24, sy: 0.83, rot: 0.17, reach: 28, arm: [-5, -2], legs: [[-16, 2], [-14, 2], [-4, 2], [2, 2]] }],
          [30, { x: 14, sx: 1.1, sy: 0.92, rot: 0.08, reach: 10, arm: [-2, 0], legs: [[-10, 0], [-8, 0], [-2, 0], [1, 0]] }],
          [48, {}],
        ]),
        speed: f >= 14 && f < 24 ? 1 - (f - 14) / 10 : 0,
        dust: f >= 14 && f < 26 ? (f - 14) / 12 : null,
      }),
    },
    upSmash: { name: 'Terminal Uppercut', // terminal uppercut: crouch with the terminal held low in front (charge holds here), then spring up and swing it over the head, front to back
      input: 'up + heavy (X / K), hold to charge', startup: 12, active: 6, endlag: 22, damage: 13, kb: { base: 32, growth: 98, angle: 90 },
      hitbox: { x: -50, y: -125, w: 112, h: 85 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: f => ({ // term = [dx, dy from body centre, tilt, size] of the swung terminal
        ...tween(f, [
          [0, {}],
          [6, { sx: 1.12, sy: 0.88, rot: 0.1, arm: [4, 8], legs: legsAll(0, 0), term: [44, -4, 0.35, 0.7] }],
          [11, { sx: 1.15, sy: 0.85, rot: 0.12, arm: [5, 9], legs: legsAll(0, 0), term: [46, -3, 0.4, 0.72] }],
          [12, { y: -6, sx: 0.86, sy: 1.2, rot: -0.1, arm: [-14, -24], reach: 4, legs: legsAll(0, 3), term: [24, -58, 0.25, 0.8] }],
          [15, { y: -6, sx: 0.86, sy: 1.2, rot: -0.14, arm: [-20, -22], reach: 2, legs: legsAll(0, 3), term: [-6, -70, -0.15, 0.8] }],
          [18, { y: -4, sx: 0.88, sy: 1.16, rot: -0.16, arm: [-22, -16], legs: legsAll(0, 2), term: [-32, -52, -0.55, 0.8] }],
          [30, { sx: 0.96, sy: 1.04, rot: -0.06, arm: [-10, -8], term: [-22, -44, -0.3, 0.74] }],
          [40, {}],
        ]),
        swoosh: f >= 12 && f < 21 ? 1 - (f - 12) / 9 : 0,
        puff: f === 12 ? 0 : null,
      }),
    },
    downSmash: { name: 'Compact Burst', // /compact: squash down flat as a pancake (flatter the longer it charges), then spring back up and the pressure bursts out along
      // the floor both ways. Hits both sides; knockback goes away from Claw'd
      input: 'down + heavy (X / K), hold to charge', startup: 12, active: 4, endlag: 22, damage: 13, kb: { base: 30, growth: 95, angle: 20 },
      hitbox: { x: -90, y: -24, w: 180, h: 24 }, both: true, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: (f, n, c = 0) => { // c = 0 … 1 charge held so far (the game passes it; the viewer shows none)
        const p = tween(f, [
          [0, {}],
          [8, { sx: 1.34, sy: 0.56, arm: 6, legs: [[-4, 0], [-2, 0], [2, 0], [4, 0]] }],
          [11, { sx: 1.36, sy: 0.55, arm: 6, legs: [[-4, 0], [-2, 0], [2, 0], [4, 0]] }],
          [12, { y: -4, sx: 0.84, sy: 1.24, arm: [-10, -10], legs: legsAll(0, 2) }],
          [16, { y: -2, sx: 0.9, sy: 1.14, arm: [-6, -6] }],
          [26, { sx: 1.04, sy: 0.96 }],
          [38, {}],
        ]);
        if (f >= 8 && f < 12) { p.sx += 0.14 * c; p.sy -= 0.12 * c; }
        return {
          ...p, squint: f >= 3 && f < 12,
          say: f < 12 ? (f >= 2 ? ['> /compact', Math.min(1, (f - 2) / 3)] : null) : f < 32 ? ['✓ compacted', 1 - (f - 12) / 20] : null,
          compact: f >= 12 && f < 28 ? (f - 12) / 16 : null, puff: f === 12 ? 0 : null,
        };
      },
    },
  },

  // landingLag = frames stuck on the ground if you land mid-attack
  aerials: {
    // aerials are drawn with a preview-only air: -40 so they float in the viewer; frame 0 / the last frame = the plain airborne pose
    neutralAir: { name: 'Claw Spin', // tuck and spin a full turn with both claws out: hits all around
      input: 'light (airborne)', startup: 4, active: 8, endlag: 14, damage: 6, kb: { base: 20, growth: 60, angle: 45 },
      hitbox: { x: -46, y: -56, w: 92, h: 62 }, landingLag: 8,
      anim: f => {
        const p = tween(f, [[0, AIRBORNE], [3, { sx: 0.92, sy: 1.08, rot: -0.25, arm: [-4, -4], legs: TUCK }],
          [4, { sx: 1.08, sy: 0.94, reach: 8, legs: TUCK }], [13, { sx: 1.08, sy: 0.94, reach: 8, legs: TUCK }], [26, AIRBORNE]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // spin eases out
        return { ...p, rot: f < 4 ? p.rot : -0.25 + (Math.PI * 2 + 0.25) * e, air: -40 };
      },
    },
    forwardAir: { name: 'Pincer Chop', // rear back with the claw high, then chop it down in front
      input: 'forward + light (airborne)', startup: 7, active: 4, endlag: 16, damage: 9, kb: { base: 25, growth: 80, angle: 40 },
      hitbox: { x: 30, y: -44, w: 46, h: 46 }, landingLag: 10,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [6, { x: -3, sx: 0.94, sy: 1.08, rot: -0.28, reach: 0, arm: [0, -14], legs: TUCK }],
          [7, { x: 5, sx: 1.14, sy: 0.9, rot: 0.32, reach: 22, arm: [-3, 6], legs: legsAll(-3, -2) }],
          [11, { x: 5, sx: 1.12, sy: 0.91, rot: 0.3, reach: 20, arm: [-3, 6], legs: legsAll(-3, -2) }],
          [18, { x: 2, sx: 1.04, sy: 0.97, rot: 0.1, reach: 6, arm: [-2, 2], legs: TUCK }],
          [27, AIRBORNE],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40,
      }),
    },
    backAir: { name: 'Mule Kick', // tip forward and mule-kick both back legs out behind
      input: 'back + light (airborne)', startup: 6, active: 4, endlag: 14, damage: 10, kb: { base: 30, growth: 85, angle: 145 },
      hitbox: { x: -68, y: -36, w: 40, h: 32 }, landingLag: 9,
      anim: f => tween(f, [
        [0, { ...AIRBORNE, air: -40 }],
        [5, { x: 3, sx: 0.94, sy: 1.06, rot: -0.1, arm: [-2, -2], legs: [[4, -4], [3, -4], [-1, -3], [-2, -3]], air: -40 }],
        [6, { x: -6, sx: 1.1, sy: 0.92, rot: 0.34, arm: [-5, 2], legs: [[-18, -4], [-15, -2], [-1, -3], [-2, -3]], air: -40 }],
        [10, { x: -6, sx: 1.09, sy: 0.93, rot: 0.32, arm: [-5, 2], legs: [[-17, -4], [-14, -2], [-1, -3], [-2, -3]], air: -40 }],
        [16, { x: -2, sx: 1.03, sy: 0.98, rot: 0.1, arm: [-3, 0], legs: [[-4, -3], [-3, -3], [-1, -3], [-2, -3]], air: -40 }],
        [24, { ...AIRBORNE, air: -40 }],
      ]),
    },
    upAir: { name: 'Rising Claws', // stretch tall and swipe both claws up over the head
      input: 'up + light (airborne)', startup: 5, active: 5, endlag: 14, damage: 7, kb: { base: 22, growth: 80, angle: 90 },
      hitbox: { x: -34, y: -98, w: 70, h: 48 }, landingLag: 7,
      anim: f => tween(f, [
        [0, { ...AIRBORNE, air: -40 }],
        [4, { sx: 1.12, sy: 0.86, rot: 0.08, arm: [4, 4], legs: TUCK, air: -40 }],
        [5, { y: -4, sx: 0.88, sy: 1.22, rot: -0.14, reach: 4, arm: [-22, -30], legs: legsAll(0, 4), air: -40 }],
        [10, { y: -3, sx: 0.9, sy: 1.2, rot: -0.12, reach: 3, arm: [-24, -30], legs: legsAll(0, 3), air: -40 }],
        [17, { sx: 0.98, sy: 1.05, rot: -0.04, arm: [-6, -8], legs: TUCK, air: -40 }],
        [24, { ...AIRBORNE, air: -40 }],
      ]),
    },
    downAir: { name: 'Claw Stomp', // stomp: claws up, all four feet driven straight down. Spikes
      input: 'down + light (airborne)', startup: 8, active: 6, endlag: 18, damage: 11, kb: { base: 20, growth: 70, angle: 285 },
      hitbox: { x: -34, y: -8, w: 68, h: 28 }, landingLag: 14,
      anim: f => ({
        ...tween(f, [
          [0, AIRBORNE],
          [7, { y: -6, sx: 1.12, sy: 0.84, arm: [-8, -8], legs: legsAll(0, -5) }],
          [8, { y: -2, sx: 0.92, sy: 1.1, arm: [-10, -10], legs: [[-2, 13], [-1, 14], [1, 14], [2, 13]] }],
          [14, { y: -2, sx: 0.93, sy: 1.09, arm: [-10, -10], legs: [[-2, 12], [-1, 13], [1, 13], [2, 12]] }],
          [22, { sx: 1, sy: 1, arm: [-4, -4], legs: legsAll(0, 3) }],
          [32, AIRBORNE],
        ]),
        fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40,
      }),
    },
  },

  // usable on the ground and in the air
  specials: {
    neutralSpecial: { name: 'Ultrathink', // think harder: clench up, eyes squeezed > <, and climb the effort tiers low → medium → high → ultrathink.
      // Each segment of the bar fills (THINK_FILL), then locks in at a checkpoint for THINK_HOLD frames: Claw'd pops, grows a little,
      // shakes harder and gains an aura shell for every tier reached (pose.aura = tier, pose.burst = the tier-up ring)
      input: 'B (V / L), no direction · hold to charge, ground or air', frames: 380, chargeFrames: thinkFrom(3) - THINK_HOLD, power: THINK_POWER, // frames of holding to reach ultrathink
      anim: f => {
        const at = k => thinkFrom(k) - THINK_HOLD, sh = f % 4 < 2 ? 1 : -1; // at = frame tier k is reached · which way this frame shakes
        const tier = [1, 2, 3].filter(k => f >= at(k)).length;
        const e = tier >= 3 ? 1 : (tier + Math.min(1, Math.max(0, (f - thinkFrom(tier)) / THINK_FILL[tier]))) / 3; // bar fill, 0 … 1 across the three segments
        const since = tier ? f - at(tier) : Infinity, pop = since < 12 ? 1 - since / 12 : 0; // 1 → 0 just after a tier-up
        const grow = 1 + 0.05 * tier;
        const p = tween(Math.min(f, 6), [[0, {}], [6, { sx: 1.12, sy: 0.84, arm: 3, reach: -2, legs: [[-3, 0], [-2, 0], [2, 0], [3, 0]] }]]);
        if (f >= 6) Object.assign(p, {
          x: sh * (0.5 + 0.7 * tier + 0.5 * e),
          sx: 1.12 * grow * (1 - 0.06 * pop), sy: (0.84 + 0.04 * e) * grow * (1 + 0.14 * pop), // swells a bit per tier, stretches up on the pop
          arm: 3 - 3 * tier - 4 * pop, // arms flex higher each tier, thrown up on the pop
          effort: e, aura: tier, burst: since < 16 ? since / 16 : null,
        });
        return { ...p, squint: f >= 3 };
      },
    },
    sideSpecial: { name: 'Claude Spark', // pull out a Claude spark, wind it up over the head, and hurl it forward spinning
      input: 'B (V / L) + a direction, ground or air · turns that way first', startup: 12, active: 2, endlag: 20, damage: 6, kb: { base: 20, growth: 45, angle: 30 },
      hitbox: null, landingLag: 10, projectile: { x: 52, y: -38, speed: 760, life: 0.75 },
      anim: f => {
        const p = tween(f, [
          [0, {}],
          [3, { x: -1, sx: 1.04, sy: 0.97, arm: [0, -4], legs: legsAll(1, 0) }],
          [10, { x: -7, sx: 0.94, sy: 1.08, rot: -0.24, reach: -3, arm: [3, -16], legs: legsAll(7, 0) }],
          [11, { x: -8, sx: 0.93, sy: 1.09, rot: -0.26, reach: -4, arm: [3, -17], legs: legsAll(8, 0) }],
          [12, { x: 10, y: -2, sx: 1.18, sy: 0.88, rot: 0.22, reach: 24, arm: [-4, 2], legs: [[-12, 2], [-10, 2], [-2, 2], [2, 2]] }],
          [15, { x: 10, y: -2, sx: 1.16, sy: 0.89, rot: 0.21, reach: 22, arm: [-4, 2], legs: [[-12, 2], [-10, 2], [-2, 2], [2, 2]] }],
          [22, { x: 5, sx: 1.05, sy: 0.96, rot: 0.08, reach: 8, arm: [-1, 0], legs: [[-6, 0], [-5, 0], [-1, 0], [1, 0]] }],
          [34, {}],
        ]);
        if (f >= 1 && f < 12) { const k = Math.min(1, f / 10); p.spark = [46 - 14 * k, -30 - 30 * k, f * 0.35]; } // rides the claw up, spinning
        return p;
      },
    },
    upSpecial: { name: 'MCP Tether', // MCP tether: fling a plug on a cord up and ahead. If it catches the stage's lip, Claw'd reels itself straight onto the
      // ledge; a miss pulls the cord back and leaves Claw'd falling helpless ("connection refused") until it lands or catches a ledge.
      // Plugging into an enemy connects to it: link.zaps zaps of link.zapDmg through the cord (one every link.every frames, the first
      // on contact), then it's reeled in at link.reel px/s until link.near px from the claw and blasted away (damage / kb), and Claw'd
      // pops up link.pop px/s, free, with its double jump back
      input: 'up + B (V / L), ground or air · + ← → aims it lower and farther', startup: 7, active: 16, endlag: 10, damage: 5, kb: { base: 45, growth: 70, angle: 60 },
      link: { zaps: 3, every: 12, zapDmg: 2, reel: 900, near: 34, pop: 520 },
      hitbox: null, landingLag: 16, pop: 300, gravity: 0.35, reach: 300, reel: 1100, aim: [72, 45], cone: 25, // pop = px/s up on use, then gravity is scaled while the cord is out · reach = cord px (all out at the end of active) · reel = px/s pulled in · aim = degrees above level: ↑ alone, ↑ + ← → · a lip within cone degrees of the aim and inside the cord's length catches
      anim: f => {
        const p = tween(f, [
          [0, AIRBORNE],
          [5, { sx: 1.1, sy: 0.9, rot: 0.1, arm: [2, 6], reach: -2, legs: TUCK }], // coil, plug hand low
          [7, { sx: 0.92, sy: 1.12, rot: -0.18, arm: [2, -16], reach: 10, legs: legsAll(-2, 4) }], // fling it up
          [23, { sx: 0.94, sy: 1.1, rot: -0.14, arm: [2, -14], reach: 8, legs: legsAll(-2, 4) }],
          [33, AIRBORNE],
        ]);
        const out = f < 7 ? 0 : f < 23 ? (f - 7) / 16 : Math.max(0, 1 - (f - 23) / 10);
        if (out) p.tether = [60 * out, 72 * Math.PI / 180]; // preview only; in the game the cord runs out to reach
        return { ...p, air: -40 };
      },
      reelPose: { sx: 0.88, sy: 1.16, rot: -0.22, arm: [4, -18], reach: 12, legs: legsAll(-5, 6) }, // plugged in: stretched toward the ledge
    },
    downSpecial: { name: 'Spawn Subagent', // spawn a subagent: claws up, then push a little Claw'd out in front. It runs off on its own (dropped, in the air),
      // bonks the first thing it reaches, then reports back with a toast and poofs
      input: 'down + B (V / L), ground or air · one subagent out at a time', startup: 14, active: 2, endlag: 16, damage: 4, kb: { base: 30, growth: 35, angle: 55 },
      hitbox: null, landingLag: 10, sub: { scale: 0.5, x: 40, speed: 380, life: 1.6, report: 0.8 }, // scale of Claw'd · spawn px ahead · run px/s · seconds before it gives up · seconds the toast stays
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [9, { sx: 0.92, sy: 1.1, rot: -0.06, arm: [-12, -12], legs: legsAll(0, 1) }], // claws up: summoning
          [13, { sx: 0.9, sy: 1.12, rot: -0.08, arm: [-14, -14], legs: legsAll(0, 1) }],
          [14, { x: 3, sx: 1.14, sy: 0.88, rot: 0.1, reach: 10, arm: [2, 4], legs: legsAll(-3, 0) }], // push it out
          [18, { x: 3, sx: 1.12, sy: 0.89, rot: 0.09, reach: 9, arm: [2, 4], legs: legsAll(-3, 0) }],
          [32, {}],
        ]),
        squint: f >= 4 && f < 14,
      }),
    },
  },

  // grabs (G / I). A grab that connects holds the bag in Claw'd's claws until it breaks free (hold.breakFree frames, plus perDmg
  // per % it has). Holding: light pummels, a direction throws. Pummel / throws have no hitbox: their damage goes to whatever's held,
  // on the startup frame (throws let go then). carry = [dx, dy, rot] where the held bag's bottom-center goes, like hitboxes
  grabs: {
    grab: { name: 'Claw Snap', // both claws snap out in front and pinch; a whiff clacks them shut on nothing
      input: 'grab (G / I), or shield + light', startup: 6, active: 3, endlag: 22, hitbox: { x: 20, y: -44, w: 42, h: 40 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -2, sx: 0.96, sy: 1.04, rot: -0.08, reach: -2, arm: -4 }],
          [6, { x: 6, sx: 1.12, sy: 0.92, rot: 0.14, reach: 18, arm: -3, legs: [[-4, 0], [-3, 0], [2, 0], [4, 0]] }],
          [9, { x: 6, sx: 1.12, sy: 0.92, rot: 0.14, reach: 16, arm: [-3, 0], legs: [[-4, 0], [-3, 0], [2, 0], [4, 0]] }],
          [16, { x: 4, sx: 1.05, sy: 0.95, rot: 0.08, reach: 4, arm: 1 }],
          [31, {}],
        ]),
        squint: f >= 9 && f < 16,
      }),
    },
    dashGrab: { name: 'Lunging Grab', // out of a run: lunges claws-first and slides on the momentum
      input: 'grab while running', startup: 9, active: 3, endlag: 28, hitbox: { x: 20, y: -44, w: 60, h: 40 }, grab: true,
      anim: f => ({
        ...tween(f, [
          [0, { y: -3, rot: 0.12, legs: [[0, -2], [0, 3], [0, -2], [0, 3]] }], // = run frame 0
          [5, { x: -2, sx: 1.08, sy: 0.9, rot: -0.04, reach: -2, arm: -3 }],
          [9, { x: 12, y: -2, sx: 1.22, sy: 0.84, rot: 0.18, reach: 22, arm: [-4, -2], legs: [[-10, 2], [-8, 2], [3, 2], [6, 1]] }],
          [12, { x: 14, sx: 1.2, sy: 0.84, rot: 0.16, reach: 20, arm: [-4, 0], legs: [[-10, 1], [-8, 1], [3, 1], [6, 0]] }],
          [24, { x: 8, sx: 1.06, sy: 0.94, rot: 0.06, reach: 4, arm: 1 }],
          [40, {}],
        ]),
        speed: f >= 9 && f < 20 ? 1 - (f - 9) / 11 : 0, dust: f >= 9 && f < 21 ? (f - 9) / 12 : null, squint: f >= 12 && f < 22,
      }),
    },
    hold: { // got it: leaning back a little with both claws clamped on, straining
      input: 'grab connects', frames: 60, breakFree: 90, perDmg: 1.2,
      anim: (f, n = 60) => {
        const b = Math.sin(f / n * Math.PI * 4);
        return { ...HOLD, rot: -0.05 + 0.02 * b, sx: 1.02 + 0.01 * b, sy: 0.98 - 0.01 * b, carry: [58, -4 + b, 0] };
      },
    },
    pummel: { name: 'Read Squeeze', // Read(bag.txt): a hard squeeze
      input: 'light (holding)', startup: 5, active: 1, endlag: 10, damage: 1.5,
      anim: f => ({
        ...tween(f, [
          [0, HOLD],
          [4, { ...HOLD, rot: -0.1, sx: 0.96, sy: 1.04, reach: 6, arm: [-2, -6], carry: [56, -6, 0] }],
          [5, { ...HOLD, rot: 0.06, sx: 1.08, sy: 0.93, reach: 14, arm: [-2, 0], carry: [60, -2, 0.06] }],
          [16, HOLD],
        ]),
        squint: f >= 5 && f < 9, say: ['Read(bag.txt)', Math.max(0, Math.min(1, f / 3, (16 - f) / 4))],
      }),
    },
    forwardThrow: { name: 'Git Push', // git push: rears back and shoves it out ahead
      input: 'forward (holding)', startup: 10, active: 1, endlag: 18, damage: 7, kb: { base: 55, growth: 55, angle: 35 },
      anim: throwAnim({ at: 10, n: 29, fly: [12, -6, 0.1], say: ['> git push', '→ origin/main'], keys: [
        [0, HOLD],
        [7, { x: -4, rot: -0.18, sx: 0.94, sy: 1.06, reach: 2, arm: [-2, -4], legs: legsAll(2, 0), carry: [46, -8, -0.15] }],
        [10, { x: 6, rot: 0.2, sx: 1.2, sy: 0.86, reach: 24, arm: [-3, 1], legs: [[-8, 0], [-6, 0], [2, 0], [4, 0]], carry: [84, -14, 0.2] }],
        [16, { x: 5, rot: 0.14, sx: 1.12, sy: 0.9, reach: 16, arm: [-2, 1] }],
        [29, {}],
      ], extra: f => ({ speed: f >= 10 && f < 18 ? 1 - (f - 10) / 8 : 0 }) }),
    },
    backThrow: { name: 'Git Revert', // git revert: hoists it overhead and heaves it over backwards
      input: 'back (holding)', startup: 16, active: 1, endlag: 20, damage: 9, kb: { base: 60, growth: 62, angle: 42 },
      anim: throwAnim({ at: 16, n: 37, fly: [-12, -4, -0.15], say: ['> git revert', '↶ reverted'], keys: [
        [0, HOLD],
        [6, { rot: -0.1, sx: 0.92, sy: 1.1, arm: -10, reach: 4, carry: [30, -58, -0.8] }],
        [12, { rot: -0.35, sx: 0.96, sy: 1.06, arm: -12, carry: [-20, -64, -2.2] }],
        [16, { rot: -0.45, sx: 1.1, sy: 0.9, arm: -6, carry: [-62, -20, -3] }],
        [22, { rot: -0.3, sx: 1.08, sy: 0.92, arm: -2 }],
        [37, {}],
      ] }),
    },
    upThrow: { name: 'Ship It', // ship it: sets it down and a terminal springs up under it, launching it straight up
      input: 'up (holding)', startup: 14, active: 1, endlag: 20, damage: 6, kb: { base: 70, growth: 45, angle: 90 },
      anim: throwAnim({ at: 14, n: 35, fly: [0, -14, 0.05], say: ['> ship it', 'deployed 🚀'], keys: [ // term dy is from body centre: bag bottom + 42
        [0, HOLD],
        [6, { sx: 1.1, sy: 0.9, reach: 6, arm: 2, carry: [58, 0, 0], term: [58, 42, 0, 0] }],
        [9, { sx: 1.04, sy: 0.96, arm: -2, carry: [58, -8, 0], term: [58, 34, 0, 0.8] }],
        [14, { sx: 0.92, sy: 1.1, arm: -10, carry: [58, -70, 0], term: [58, -28, 0, 0.8] }],
        [20, { sx: 0.96, sy: 1.06, arm: -8, term: [58, 20, 0, 0.3] }],
        [23, { arm: -4, term: [58, 30, 0, 0] }],
        [35, {}],
      ] }),
    },
    downThrow: { name: 'Git Commit', // git commit: lifts it overhead and stamps it into the floor, where it bounces up
      input: 'down (holding)', startup: 14, active: 1, endlag: 20, damage: 6, kb: { base: 45, growth: 50, angle: 80 },
      anim: throwAnim({ at: 14, n: 35, fly: [2, -9, 0.1], say: ['> git commit', '✓ committed'], keys: [
        [0, HOLD],
        [6, { y: -6, rot: -0.05, sx: 0.9, sy: 1.12, arm: -10, carry: [30, -60, 0] }],
        [11, { y: -10, rot: 0.05, sx: 0.94, sy: 1.08, arm: -8, carry: [40, -70, 0.1] }],
        [14, { rot: 0.15, sx: 1.3, sy: 0.7, arm: 4, reach: 14, carry: [60, 0, 0] }],
        [22, { rot: 0.05, sx: 1.1, sy: 0.9, arm: 2, reach: 6 }],
        [35, {}],
      ], extra: f => ({ puff: f >= 14 ? (f - 14) / 10 : null }) }),
    },
  },
};
