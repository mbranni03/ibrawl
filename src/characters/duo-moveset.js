// Duo's moveset (drawn by duo.js). Duo flies like Kirby or Meta Knight: its double jump is a wing beat it can do again and again,
// it falls floatily on half-spread wings, and holding jump while falling glides. Everything else moves like Claw'd
// (clawd-moveset.js, loaded first); his arm poses swing Duo's wings.
// Wing swings (arm, [back, front]) run from about +8 (folded in) through 0 (hanging) and -20 (straight out) to -49 (straight up);
// the back wing keeps going over the top and points forward by -80. Duo stands on the outer two of Claw'd's four feet.
const duoFeet = (back, front) => [back, [0, 0], [0, 0], front];
// a caption over Duo's head from frame a to b, fading in and out (Claw'd's say)
const duoSay = (text, f, a, b) => f >= a && f < b ? [text, Math.min(1, (f - a) / 3, (b - f) / 5)] : null;
const DUO_GA = MOVESET.groundAttacks, DUO_AA = MOVESET.aerials; // frame data starts as Claw'd's; the hitboxes and poses are Duo's
const DUO_AIR = { arm: -12, legs: duoFeet([1, -2], [-1, -2]) }; // wings half out, feet tucked: the plain airborne pose aerials start and end on
// Claw'd's arm swings are sized for his little nubs: the movement Duo borrows from him swings its wings 4x as far
const duoWings = m => m.anim ? { ...m, anim: (f, n) => { const p = m.anim(f, n); return p.arm == null ? p : { ...p, arm: Array.isArray(p.arm) ? p.arm.map(a => 4 * a) : 4 * p.arm }; } } : m;
const DUO_MOVESET = {
  movement: {
    ...Object.fromEntries(Object.entries(MOVESET.movement).map(([k, m]) => [k, duoWings(m)])),
    doubleJump: {
      input: 'jump (airborne) · up to 5 times', frames: 30,
      anim: f => tween(f, [ // wings sweep up, beat down hard to pop it up a little way, then it drops toward the next beat
        [0, { air: -50, arm: -12, legs: legsAll(0, 2) }],
        [5, { air: -47, sx: 1.06, sy: 0.94, arm: -38, legs: legsAll(0, 1) }],
        [9, { air: -68, sx: 0.92, sy: 1.1, arm: 4, blink: 0.4, legs: legsAll(0, 3) }],
        [18, { air: -84, rot: 0.06, arm: -16, legs: legsAll(0, 1) }],
        [30, { air: -50, arm: -12, legs: legsAll(0, 2) }],
      ]),
    },
    fall: {
      input: 'none', frames: 40,
      anim: (f, n) => { // floaty: wings held half out, fluttering, feet dangling, swaying on the way down
        const p = f / n * Math.PI * 2, s = Math.sin(p * 2);
        return { air: -80 + 3 * Math.sin(p), rot: 0.04 * Math.sin(p), arm: -14 - 5 * s, legs: legsAll(0, 2 + s) };
      },
    },
    glide: {
      input: 'hold jump while falling', frames: 48,
      anim: (f, n) => { // wings spread wide, beating slowly (each downbeat lifts it a touch), leaning into the drift, feet trailing
        const p = f / n * Math.PI * 2, s = Math.sin(p * 2);
        return { air: -70 + 3 * s, rot: 0.14, sx: 1.03, sy: 0.97, arm: -26 - 10 * s, legs: legsAll(-2, 1) };
      },
    },
  },
  groundAttacks: {
    jab1: { ...DUO_GA.jab1, // ¡hola!: a quick slap with the front wing
      hitbox: { x: 28, y: -46, w: 34, h: 24 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -2, sx: 1.03, sy: 0.98, rot: -0.06, arm: [-3, 8], legs: duoFeet([1, 0], [1, 0]) }],
          [3, { x: 5, sx: 1.06, sy: 0.96, rot: 0.1, arm: [-6, -22], legs: duoFeet([-4, 0], [2, 0]) }],
          [6, { x: 5, sx: 1.05, sy: 0.97, rot: 0.09, arm: [-6, -20], legs: duoFeet([-4, 0], [2, 0]) }],
          [11, { x: 2, rot: 0.03, arm: [-2, -6], legs: duoFeet([-2, 0], [1, 0]) }],
          [19, {}],
        ]),
        speed: f >= 3 && f < 6 ? 0.4 : 0, say: duoSay('¡hola!', f, 3, 19),
      }),
    },
    jab2: { ...DUO_GA.jab2, // bonjour!: the front wing scoops out and up, body stretching tall with it
      hitbox: { x: 20, y: -68, w: 38, h: 38 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [2, { x: -1, sx: 1.03, sy: 0.98, rot: 0.04, arm: [0, 6], legs: duoFeet([1, 0], [0, 0]) }],
          [3, { x: 3, y: -2, sx: 0.96, sy: 1.07, rot: -0.06, arm: [2, -40], legs: duoFeet([-3, 0], [2, -1]) }],
          [6, { x: 3, y: -2, sx: 0.97, sy: 1.06, rot: -0.07, arm: [2, -46], legs: duoFeet([-3, 0], [2, -1]) }],
          [12, { x: 1, rot: -0.02, arm: [1, -12], legs: duoFeet([-1, 0], [1, 0]) }],
          [21, {}],
        ]),
        say: duoSay('bonjour!', f, 3, 21),
      }),
    },
    jab3: { ...DUO_GA.jab3, // ✓ correct!: hunch forward, then lunge in belly first with both wings flung up in a V, celebrating
      hitbox: { x: 16, y: -54, w: 50, h: 44 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -5, sx: 1.1, sy: 0.88, rot: 0.14, arm: [6, 6], legs: duoFeet([3, 0], [2, 0]) }],
          [5, { x: 14, y: -2, sx: 1.12, sy: 0.93, rot: -0.18, arm: [-40, -38], legs: duoFeet([-12, 1], [4, -2]) }],
          [8, { x: 15, y: -2, sx: 1.1, sy: 0.94, rot: -0.17, arm: [-42, -40], legs: duoFeet([-12, 1], [4, -2]) }],
          [16, { x: 10, sx: 1.04, sy: 0.97, rot: -0.06, arm: [-14, -12], legs: duoFeet([-6, 0], [1, 0]) }],
          [32, {}],
        ]),
        speed: f >= 5 && f < 12 ? 1 - (f - 5) / 7 : 0,
        dust: f >= 5 && f < 17 ? (f - 5) / 12 : null, say: duoSay('✓ correct!', f, 5, 32),
      }),
    },
    dashAttack: { ...DUO_GA.dashAttack, // streak slide: dive onto its belly and toboggan along, wings swept back
      hitbox: { x: 10, y: -38, w: 60, h: 38 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -3, sx: 1.08, sy: 0.9, rot: -0.1, arm: [-20, -24], legs: duoFeet([3, 0], [2, 0]) }],
          [6, { x: 10, y: -4, sx: 1.18, sy: 0.78, rot: 1.05, arm: [4, 4], legs: duoFeet([-4, -3], [-4, -3]) }],
          [14, { x: 14, sx: 1.16, sy: 0.8, rot: 1.05, arm: [2, 2], legs: duoFeet([-4, -3], [-4, -3]) }],
          [22, { x: 8, sx: 1.1, sy: 0.88, rot: 0.4, arm: [-8, -8], legs: duoFeet([-2, 0], [0, 0]) }],
          [34, {}],
        ]),
        blink: f >= 6 && f < 20 ? 0.6 : 0,
        speed: f >= 6 && f < 20 ? 1 - (f - 6) / 14 : 0,
        dust: f >= 6 && f < 18 ? (f - 6) / 12 : null, say: duoSay('🔥 streak!', f, 6, 34),
      }),
    },
    forwardTilt: { ...DUO_GA.forwardTilt, // lesson time.: step in and jab the front wing out straight, like a pointed finger
      hitbox: { x: 30, y: -50, w: 44, h: 24 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [5, { x: -4, sx: 0.96, sy: 1.04, rot: -0.1, arm: [-2, 8], legs: duoFeet([2, 0], [0, 0]) }],
          [6, { x: 9, sx: 1.1, sy: 0.94, rot: 0.08, arm: [6, -21], legs: duoFeet([-8, 0], [4, 0]) }],
          [9, { x: 9, sx: 1.09, sy: 0.95, rot: 0.07, arm: [6, -20], legs: duoFeet([-8, 0], [4, 0]) }],
          [16, { x: 4, sx: 1.03, rot: 0.03, arm: [3, -14], legs: duoFeet([-4, 0], [2, 0]) }],
          [27, {}],
        ]),
        speed: f >= 6 && f < 10 ? 0.5 : 0, say: duoSay('lesson time.', f, 6, 27),
      }),
    },
    upTilt: { ...DUO_GA.upTilt, // +10 XP: crouch, then spring up with both wings flung out in a V over the head
      hitbox: { x: -28, y: -92, w: 56, h: 40 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { sx: 1.14, sy: 0.84, arm: [6, 6] }],
          [5, { y: -6, sx: 0.9, sy: 1.2, rot: -0.04, arm: [-40, -40], legs: duoFeet([0, 3], [0, 3]) }],
          [9, { y: -5, sx: 0.92, sy: 1.18, rot: -0.04, arm: [-44, -44], legs: duoFeet([0, 2], [0, 2]) }],
          [16, { sx: 0.98, sy: 1.04, arm: [-12, -12] }],
          [25, {}],
        ]),
        say: f >= 5 && f < 25 ? ['+10 XP', Math.min(1, (25 - f) / 8)] : null,
      }),
    },
    downTilt: { ...DUO_GA.downTilt, // tsk tsk: from the crouch, a low talon kick along the floor
      hitbox: { x: 18, y: -18, w: 40, h: 18 },
      anim: f => ({
        ...tween(f, [
          [0, CROUCH],
          [4, { ...CROUCH, x: -2, rot: -0.06, legs: duoFeet([0, 0], [-3, -3]) }],
          [5, { ...CROUCH, x: 3, rot: -0.1, arm: [-10, -6], legs: duoFeet([-2, 0], [24, -2]) }],
          [8, { ...CROUCH, x: 3, rot: -0.1, arm: [-10, -6], legs: duoFeet([-2, 0], [22, -2]) }],
          [14, { ...CROUCH, x: 1, legs: duoFeet([0, 0], [6, 0]) }],
          [20, CROUCH],
        ]),
        say: duoSay('tsk tsk', f, 5, 20),
      }),
    },
    getupAttack: { ...DUO_GA.getupAttack, // from flat on its back: rocks, flips over and lands with both wings flung out, clearing both sides
      anim: f => ({
        ...tween(f, [
          [0, { rot: Math.PI, sx: 1.04, sy: 0.94, arm: 4 }],
          [6, { rot: Math.PI - 0.3, sx: 1.12, sy: 0.86, arm: 6 }],
          [11, { rot: Math.PI * 1.7, y: -14, sx: 0.9, sy: 1.1, arm: -8, legs: duoFeet([2, -3], [-2, -3]) }],
          [12, { rot: Math.PI * 2, sx: 1.3, sy: 0.76, arm: -22, legs: duoFeet([-6, 0], [6, 0]) }],
          [16, { rot: Math.PI * 2, sx: 1.28, sy: 0.78, arm: -22, legs: duoFeet([-6, 0], [6, 0]) }],
          [22, { rot: Math.PI * 2, sx: 1.08, sy: 0.92, arm: -6 }],
          [32, { rot: Math.PI * 2 }],
        ]),
        blink: f >= 11 && f < 16 ? 0.8 : 0, puff: f >= 12 ? (f - 12) / 10 : null,
      }),
    },
  },
  aerials: { // drawn at a preview-only air: -40, like Claw'd's
    neutralAir: { ...DUO_AA.neutralAir, // hoo hoo!: tuck, then spin a full turn with both wings flung straight out
      hitbox: { x: -48, y: -60, w: 96, h: 62 },
      anim: f => {
        const p = tween(f, [[0, DUO_AIR], [3, { sx: 0.92, sy: 1.08, rot: -0.25, arm: [6, 6], legs: duoFeet([2, -3], [-2, -3]) }],
          [4, { sx: 1.06, sy: 0.96, arm: [-22, -22], legs: duoFeet([-2, 1], [2, 1]) }], [13, { sx: 1.06, sy: 0.96, arm: [-22, -22], legs: duoFeet([-2, 1], [2, 1]) }], [26, DUO_AIR]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // spin eases out
        return { ...p, rot: f < 4 ? p.rot : -0.25 + (Math.PI * 2 + 0.25) * e, air: -40, say: duoSay('hoo hoo!', f, 4, 26) };
      },
    },
    forwardAir: { ...DUO_AA.forwardAir, // ✗ wrong!: lean back with the front wing raised high, then chop it down in front
      hitbox: { x: 24, y: -62, w: 46, h: 50 },
      anim: f => ({
        ...tween(f, [
          [0, DUO_AIR],
          [6, { x: -3, sx: 0.94, sy: 1.08, rot: -0.24, arm: [2, -48], legs: duoFeet([2, -3], [-2, -3]) }],
          [7, { x: 5, sx: 1.12, sy: 0.92, rot: 0.3, arm: [-6, -8], legs: duoFeet([-3, -1], [-2, -1]) }],
          [11, { x: 5, sx: 1.1, sy: 0.93, rot: 0.28, arm: [-6, -6], legs: duoFeet([-3, -1], [-2, -1]) }],
          [18, { x: 2, sx: 1.03, sy: 0.98, rot: 0.1, arm: [-8, -8], legs: duoFeet([1, -2], [-1, -2]) }],
          [27, DUO_AIR],
        ]),
        speed: f >= 7 && f < 11 ? 0.5 : 0, air: -40, say: duoSay('✗ wrong!', f, 7, 27),
      }),
    },
    backAir: { ...DUO_AA.backAir, // remember me?: tip forward and kick the back foot out behind, back wing flaring
      hitbox: { x: -54, y: -36, w: 34, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, DUO_AIR],
          [5, { x: 3, sx: 0.94, sy: 1.06, rot: -0.1, arm: [-6, -10], legs: duoFeet([5, -4], [-1, -3]) }],
          [6, { x: -6, sx: 1.08, sy: 0.93, rot: 0.34, arm: [-22, 2], legs: duoFeet([-13, -6], [-2, -3]) }],
          [10, { x: -6, sx: 1.07, sy: 0.94, rot: 0.32, arm: [-20, 2], legs: duoFeet([-12, -6], [-2, -3]) }],
          [16, { x: -2, sx: 1.02, sy: 0.98, rot: 0.1, arm: [-12, -6], legs: duoFeet([-5, -2], [-1, -2]) }],
          [24, DUO_AIR],
        ]),
        air: -40, say: duoSay('remember me?', f, 6, 24),
      }),
    },
    upAir: { ...DUO_AA.upAir, // level up ↑: a backflip, wings out and feet sweeping over the top
      hitbox: { x: -36, y: -100, w: 72, h: 48 },
      anim: f => {
        const p = tween(f, [[0, DUO_AIR], [4, { sx: 1.1, sy: 0.88, rot: 0.1, arm: [4, 4], legs: duoFeet([2, -3], [-2, -3]) }],
          [5, { sx: 0.94, sy: 1.12, arm: [-20, -20], legs: duoFeet([-1, 4], [1, 4]) }], [10, { sx: 0.94, sy: 1.12, arm: [-20, -20], legs: duoFeet([-1, 4], [1, 4]) }],
          [17, { arm: [-10, -10], legs: duoFeet([1, -2], [-1, -2]) }], [24, DUO_AIR]]);
        const e = Math.min(1, Math.max(0, (f - 4) / 11)), k = e * e * (3 - 2 * e); // one turn backwards, feet leading over the head
        return { ...p, rot: f < 4 ? p.rot : 0.1 - (Math.PI * 2 + 0.1) * k, air: -40, say: duoSay('level up ↑', f, 5, 24) };
      },
    },
    downAir: { ...DUO_AA.downAir, // streak lost.: wings up, both feet driven straight down. Spikes
      hitbox: { x: -30, y: -10, w: 60, h: 30 },
      anim: f => ({
        ...tween(f, [
          [0, DUO_AIR],
          [7, { y: -6, sx: 1.12, sy: 0.84, arm: [-30, -30], legs: duoFeet([0, -5], [0, -5]) }],
          [8, { y: -2, sx: 0.9, sy: 1.14, arm: [-42, -42], legs: duoFeet([-1, 7], [1, 7]) }],
          [14, { y: -2, sx: 0.91, sy: 1.12, arm: [-40, -40], legs: duoFeet([-1, 6], [1, 6]) }],
          [22, { arm: [-14, -14], legs: duoFeet([0, 3], [0, 3]) }],
          [32, DUO_AIR],
        ]),
        blink: f >= 8 && f < 14 ? 0.5 : 0,
        fallLines: f >= 8 && f < 16 ? 1 - (f - 8) / 8 : 0, air: -40, say: duoSay('streak lost.', f, 8, 32),
      }),
    },
  },
};
