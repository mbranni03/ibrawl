// Duo's moveset (drawn by duo.js). Duo flies like Kirby or Meta Knight: its double jump is a wing beat it can do again and again,
// it falls floatily on half-spread wings, and holding jump while falling glides. Everything else moves like Claw'd
// (clawd-moveset.js, loaded first); his arm poses swing Duo's wings.
// Wing swings (arm, [back, front]) run from about +8 (folded in) through 0 (hanging) and -20 (straight out) to -49 (straight up);
// the back wing keeps going over the top and points forward by -80. Duo stands on the outer two of Claw'd's four feet.
const duoFeet = (back, front) => [back, [0, 0], [0, 0], front];
// a caption over Duo's head from frame a to b, fading in and out (Claw'd's say)
const duoSay = (text, f, a, b) => f >= a && f < b ? [text, Math.min(1, (f - a) / 3, (b - f) / 5)] : null;
const DUO_GA = MOVESET.groundAttacks, DUO_SA = MOVESET.smashAttacks, DUO_AA = MOVESET.aerials; // frame data starts as Claw'd's; the hitboxes and poses are Duo's
const DUO_AIR = { arm: -12, legs: duoFeet([1, -2], [-1, -2]) }; // wings half out, feet tucked: the plain airborne pose aerials start and end on
// holding a grabbed target: leaning back a touch, the front wing clamped round it (carry = where the target sits, as in Claw'd's HOLD)
const DUO_HOLD = { rot: -0.04, arm: [-10, -20], legs: duoFeet([-3, 0], [2, 0]), carry: [52, -4, 0] };
const DUO_GR = MOVESET.grabs; // frame data starts as Claw'd's
// Claw'd's arm swings are sized for his little nubs: a move Duo borrows from him swings its wings k times as far, and where he
// squeezes his eyes shut > < Duo just shuts them
const duoize = (anim, k = 4) => (...a) => {
  const p = { ...anim(...a) };
  if (p.arm != null) p.arm = Array.isArray(p.arm) ? p.arm.map(v => k * v) : k * p.arm;
  if (p.squint) p.blink = Math.max(p.blink || 0, 0.85);
  return p;
};
const duoWings = (m, k) => m.anim ? { ...m, anim: duoize(m.anim, k) } : m;
const duoBorrow = (group, k) => Object.fromEntries(Object.entries(MOVESET[group]).map(([key, m]) => [key, duoWings(m, k)]));
const DUO_MOVESET = {
  movement: {
    ...duoBorrow('movement'),
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
    jab1: { ...DUO_GA.jab1, name: '¡Hola!', // ¡hola!: a quick slap with the front wing
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
    jab2: { ...DUO_GA.jab2, name: 'Bonjour!', // bonjour!: the front wing scoops out and up, body stretching tall with it
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
    jab3: { ...DUO_GA.jab3, name: '¡Correcto!', // ✓ correct!: hunch forward, then lunge in belly first with both wings flung up in a V, celebrating
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
    dashAttack: { ...DUO_GA.dashAttack, name: 'Streak Slide', // streak slide: dive onto its belly and toboggan along, wings swept back
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
    forwardTilt: { ...DUO_GA.forwardTilt, name: 'Lesson Time', // lesson time.: step in and jab the front wing out straight, like a pointed finger
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
    upTilt: { ...DUO_GA.upTilt, name: '+10 XP', // +10 XP: crouch, then spring up with both wings flung out in a V over the head
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
    downTilt: { ...DUO_GA.downTilt, name: 'Tsk Tsk', // tsk tsk: from the crouch, a low talon kick along the floor
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
    getupAttack: { ...DUO_GA.getupAttack, name: 'Wing Sweep', // from flat on its back: rocks, flips over and lands with both wings flung out, clearing both sides
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
    neutralAir: { ...DUO_AA.neutralAir, name: 'Hoo Hoo!', // hoo hoo!: tuck, then spin a full turn with both wings flung straight out
      hitbox: { x: -48, y: -60, w: 96, h: 62 },
      anim: f => {
        const p = tween(f, [[0, DUO_AIR], [3, { sx: 0.92, sy: 1.08, rot: -0.25, arm: [6, 6], legs: duoFeet([2, -3], [-2, -3]) }],
          [4, { sx: 1.06, sy: 0.96, arm: [-22, -22], legs: duoFeet([-2, 1], [2, 1]) }], [13, { sx: 1.06, sy: 0.96, arm: [-22, -22], legs: duoFeet([-2, 1], [2, 1]) }], [26, DUO_AIR]]);
        const e = 1 - (1 - Math.min(1, Math.max(0, (f - 4) / 9))) ** 2; // spin eases out
        return { ...p, rot: f < 4 ? p.rot : -0.25 + (Math.PI * 2 + 0.25) * e, air: -40, say: duoSay('hoo hoo!', f, 4, 26) };
      },
    },
    forwardAir: { ...DUO_AA.forwardAir, name: 'Wrong Answer', // ✗ wrong!: lean back with the front wing raised high, then chop it down in front
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
    backAir: { ...DUO_AA.backAir, name: 'Remember Me?', // remember me?: tip forward and kick the back foot out behind, back wing flaring
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
    upAir: { ...DUO_AA.upAir, name: 'Level Up', // level up ↑: a backflip, wings out and feet sweeping over the top
      hitbox: { x: -36, y: -100, w: 72, h: 48 },
      anim: f => {
        const p = tween(f, [[0, DUO_AIR], [4, { sx: 1.1, sy: 0.88, rot: 0.1, arm: [4, 4], legs: duoFeet([2, -3], [-2, -3]) }],
          [5, { sx: 0.94, sy: 1.12, arm: [-20, -20], legs: duoFeet([-1, 4], [1, 4]) }], [10, { sx: 0.94, sy: 1.12, arm: [-20, -20], legs: duoFeet([-1, 4], [1, 4]) }],
          [17, { arm: [-10, -10], legs: duoFeet([1, -2], [-1, -2]) }], [24, DUO_AIR]]);
        const e = Math.min(1, Math.max(0, (f - 4) / 11)), k = e * e * (3 - 2 * e); // one turn backwards, feet leading over the head
        return { ...p, rot: f < 4 ? p.rot : 0.1 - (Math.PI * 2 + 0.1) * k, air: -40, say: duoSay('level up ↑', f, 5, 24) };
      },
    },
    downAir: { ...DUO_AA.downAir, name: 'Streak Lost', // streak lost.: wings up, both feet driven straight down. Spikes
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
  smashAttacks: { // c = 0 … 1 charge held (the game passes it; the viewer shows none)
    forwardSmash: { ...DUO_SA.forwardSmash, name: 'Pop Quiz', // pop quiz: hold up a flash card and study it (charge holds here, frame 10), then slam it forward and
      // it turns over: ✓ correct is a big hit, ✗ wrong a feeble one. The game rolls the answer on release: odds right uncharged … fully charged
      hitbox: { x: 30, y: -56, w: 50, h: 42 }, damage: 15, odds: 0.5, oddsCharged: 0.9, missDamage: 5, missKb: { base: 15, growth: 40, angle: 38 },
      anim: (f, n, c = 0, roll = true) => { // roll = the answer (false = wrong; anything else shows it right)
        const right = roll !== false, p = tween(f, [
          [0, { card: [18, -22, 0.4] }],
          [5, { x: -2, rot: -0.04, arm: [2, -30], legs: duoFeet([1, 0], [0, 0]), card: [34, -46, -0.1] }],
          [10, { x: -3, sx: 0.98, sy: 1.02, rot: -0.06, arm: [2, -32], card: [34, -47, -0.1] }],
          [13, { x: -8, sx: 0.93, sy: 1.09, rot: -0.22, arm: [4, -46], legs: duoFeet([8, 0], [4, 0]), card: [12, -72, -0.6] }],
          [14, { x: 18, y: -2, sx: 1.2, sy: 0.86, rot: 0.18, arm: [-10, -16], legs: duoFeet([-16, 2], [2, 2]), card: [52, -36, 0.35] }],
          [18, { x: 19, y: -2, sx: 1.18, sy: 0.87, rot: 0.17, arm: [-10, -16], legs: duoFeet([-16, 2], [2, 2]), card: [53, -35, 0.3] }],
          [30, { x: 14, sx: 1.08, sy: 0.93, rot: 0.08, arm: [-4, -14], legs: duoFeet([-10, 0], [1, 0]), card: [46, -36, 0.2] }],
          [48, { card: [36, -34, 0.1] }],
        ]);
        const after = f >= 18 && f < 44 ? Math.sin((f - 18) / 26 * Math.PI) : 0; // right: a happy hop · wrong: slumps, eyes half shut
        if (right) p.y = (p.y || 0) - 6 * after; else { p.sy -= 0.08 * after; p.rot += 0.12 * after; p.blink = 0.5 * after; }
        return {
          ...p, card: f >= 2 && f < 44 ? [...p.card, f < 14 ? 0 : right ? 1 : -1, f >= 13 && f < 15 ? Math.cos((f - 13) / 2 * Math.PI) : 1] : null,
          speed: f >= 14 && f < 24 ? 1 - (f - 14) / 10 : 0, dust: f >= 14 && f < 26 ? (f - 14) / 12 : null,
          say: f < 14 ? duoSay('translate: owl', f, 2, 14) : duoSay(right ? '✓ búho! +15 XP' : '✗ correct answer: búho', f, 14, 46),
        };
      },
    },
    upSmash: { ...DUO_SA.upSmash, name: 'Streak Flame', // streak flame: crouch as a flame kindles behind it and the streak counts up (charge holds here, frame 8),
      // then spring up as it erupts into a pillar overhead. The longer the charge, the longer the streak and the taller the fire
      hitbox: { x: -36, y: -150, w: 72, h: 110 },
      anim: (f, n, c = 0) => {
        const p = tween(f, [
          [0, {}],
          [6, { sx: 1.14, sy: 0.84, arm: [6, 6], legs: duoFeet([-3, 0], [3, 0]) }],
          [11, { sx: 1.18, sy: 0.8, arm: [7, 7], legs: duoFeet([-3, 0], [3, 0]) }],
          [12, { y: -8, sx: 0.86, sy: 1.22, arm: [-40, -40], legs: duoFeet([0, 4], [0, 4]) }],
          [18, { y: -6, sx: 0.88, sy: 1.18, arm: [-44, -44], legs: duoFeet([0, 3], [0, 3]) }],
          [30, { sx: 0.97, sy: 1.04, arm: [-14, -14] }],
          [40, {}],
        ]);
        const days = Math.round((1 + 29 * Math.min(1, f / 8)) * (1 + 11.1 * c)); // ~30 days uncharged … ~365 at full charge
        const flame = f < 12 ? [(70 + 40 * c) * Math.min(1, f / 6), 1] // kindling behind it
          : f < 34 ? [(140 + 50 * c) * Math.min(1, (f - 11) / 3), f < 24 ? 1 : 1 - (f - 24) / 10] : null; // the pillar, then it dies down
        return {
          ...p, flame, blink: f >= 3 && f < 12 ? 0.4 : 0, puff: f === 12 ? 0 : null,
          say: f < 12 ? duoSay(`🔥 day ${days}`, f, 2, 12) : [...(duoSay(`🔥 ${days}-day streak!`, f, 12, 38) || ['', 0]), Math.max(0, (flame?.[0] || 0) - 60)], // up over the fire
        };
      },
    },
    downSmash: { ...DUO_SA.downSmash, name: 'Unskippable Ad', // unskippable ad: duck while an ad panel hovers over each side, its skip timer counting down
      // (charge holds here, frame 8), then both slam down onto the floor, hitting both sides. Knockback goes away from Duo
      hitbox: { x: -80, y: -58, w: 160, h: 58 },
      anim: (f, n, c = 0) => {
        const p = tween(f, [
          [0, {}],
          [8, { sx: 1.16, sy: 0.8, arm: [8, 8], legs: duoFeet([-3, 0], [3, 0]) }],
          [11, { sx: 1.2, sy: 0.76, arm: [8, 8], legs: duoFeet([-3, 0], [3, 0]) }],
          [12, { sx: 1.26, sy: 0.7, arm: [4, 4], legs: duoFeet([-4, 0], [4, 0]) }],
          [22, { sx: 1.12, sy: 0.84, arm: [2, 2] }],
          [30, { y: -4, sx: 0.94, sy: 1.08, arm: [-20, -20] }],
          [38, {}],
        ]);
        const e = Math.min(1, Math.max(0, (f - 8) / 4)), ads = f < 12 ? [e * e * e, Math.min(1, f / 4)] // hover, then drop hard
          : f < 38 ? [1, f < 30 ? 1 : 1 - (f - 30) / 8] : null;
        return {
          ...p, ads, blink: f >= 3 && f < 22 ? 0.6 : 0, puff: f === 12 ? 0 : null,
          say: f < 12 ? duoSay(`ad · skip in ${5 - Math.round(4 * c)}…`, f, 2, 12) : f < 26 ? duoSay('✨ try Super free!', f, 12, 26) : duoSay('✕ too small to tap', f, 26, 38),
        };
      },
    },
  },
  specials: {
    neutralSpecial: { name: 'Heart Zap', // heart zap: hold up one of its hearts and zap it forward. Duo has 5 a stock: each use spends one and hits harder than
      // the last (the game passes how many it had before this use); with none left it fizzles
      input: 'B (V / L), no direction · ground or air · 5 hearts a stock', hearts: 5, startup: 10, active: 4, endlag: 22, damage: 5,
      kb: { base: 25, growth: 60, angle: 40 }, hitbox: { x: 24, y: -62, w: 54, h: 48 }, landingLag: 10,
      anim: (f, n, c, had = 5) => {
        const p = tween(f, [
          [0, {}],
          [8, { x: -3, sx: 0.96, sy: 1.05, rot: -0.1, arm: [2, -28], legs: duoFeet([2, 0], [0, 0]) }],
          [10, { x: 6, sx: 1.1, sy: 0.93, rot: 0.12, arm: [-8, -20], legs: duoFeet([-6, 0], [2, 0]) }],
          [14, { x: 6, sx: 1.08, sy: 0.94, rot: 0.1, arm: [-8, -20], legs: duoFeet([-6, 0], [2, 0]) }],
          [36, {}],
        ]);
        if (!had) return { // out of hearts: holds up an empty wing, droops
          ...p, heart: null, sy: p.sy - 0.06 * Math.min(1, f / 10), blink: f >= 10 ? 0.5 : 0, say: duoSay('💔 out of hearts · get Super!', f, 6, 36),
        };
        return {
          ...p, blink: f >= 10 && f < 14 ? 0.4 : 0, speed: f >= 10 && f < 14 ? 0.5 : 0,
          hearts: [had, f < 10 ? 0 : Math.min(1, (f - 10) / 8), Math.min(1, f / 3, (36 - f) / 6)], // the one it zaps pops out of the row
          heart: f < 10 ? [30, -44, 0.5 + 0.05 * f, Math.min(1, f / 3)] : f < 20 ? [30 + 3 * (f - 10), -40, 1 + 0.06 * (f - 10), 1 - (f - 10) / 10] : null, // held up, then zapped out
        };
      },
    },
    sideSpecial: { name: 'Reminder', // reminder: flick a wing and a push notification pops out, then drifts after the nearest target, turning to follow it
      // through anything. One out at a time
      input: 'B (V / L) + a direction, ground or air · turns that way first', startup: 12, active: 2, endlag: 22, damage: 7,
      kb: { base: 25, growth: 50, angle: 45 }, hitbox: null, landingLag: 10, projectile: { x: 50, y: -44, speed: 240, life: 3, homing: 2.2, r: 16 },
      shotArt: drawReminder,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [10, { x: -3, sx: 0.96, sy: 1.04, rot: -0.12, arm: [2, -40], legs: duoFeet([2, 0], [0, 0]) }],
          [12, { x: 5, sx: 1.08, sy: 0.95, rot: 0.1, arm: [-6, -14], legs: duoFeet([-5, 0], [2, 0]) }],
          [18, { x: 4, sx: 1.05, sy: 0.97, rot: 0.08, arm: [-6, -16], legs: duoFeet([-4, 0], [1, 0]) }],
          [36, {}],
        ]),
        say: duoSay('🔔 sent', f, 12, 36),
      }),
    },
    upSpecial: { name: 'Streak Freeze', // streak freeze: raise both wings, slam them down, and a block of ice shoots up out of the floor ahead, launching whoever's
      // standing there. Ground or air (in the air it bursts up from Duo's feet)
      input: 'up + B (V / L), ground or air', startup: 8, active: 6, endlag: 22, damage: 10, kb: { base: 40, growth: 75, angle: 85 },
      hitbox: { x: 24, y: -84, w: 48, h: 84 }, landingLag: 12,
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [6, { y: -3, sx: 0.92, sy: 1.1, rot: -0.06, arm: [-40, -40], legs: duoFeet([0, 1], [0, 1]) }],
          [8, { sx: 1.16, sy: 0.84, rot: 0.1, arm: [6, 6], legs: duoFeet([-3, 0], [3, 0]) }],
          [14, { sx: 1.12, sy: 0.88, rot: 0.08, arm: [4, 4], legs: duoFeet([-3, 0], [3, 0]) }],
          [36, {}],
        ]),
        ice: f < 8 ? null : f < 28 ? [76 * Math.min(1, (f - 7) / 3), 1] : f < 36 ? [76 - 30 * (f - 28) / 8, 1 - (f - 28) / 8] : null, // shoots up, holds, sinks away
        puff: f === 8 ? 0 : null,
        say: f >= 8 && f < 36 ? [...duoSay('🧊 streak freeze equipped', f, 8, 36), 16] : null,
      }),
    },
    downSpecial: { name: 'Streak Mode', // streak mode: a streak meter fills while Duo fights (streak.fill s, a flame bursting up behind it when it's full). Full,
      // this strains, swells and bursts it into buff Duo for streak.time s, the meter draining as it goes: its hits do mult × damage and kb × knockback out of
      // hitboxes size × as big, it takes heavy × the knockback, and its attacks turn into punches (buffed, below). Not full: a warning.
      // Losing a stock loses the streak
      input: 'down + B (V / L), ground or air · once the streak meter is full', startup: 36, active: 1, endlag: 30, hitbox: null, landingLag: 10,
      streak: { fill: 35, time: 12, mult: 1.5, kb: 1.2, size: 1.4, heavy: 0.6, lift: 44 }, // lift = px buff Duo stands over its box (the P1 mark, captions, warnings go up by it)
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [6, { y: 1, sx: 1.06, sy: 0.9, rot: 0.05, arm: [6, 6], curl: [1, 1], legs: duoFeet([-3, 0], [3, 0]) }], // hunched, straining
          [34, { y: 2, sx: 1.1, sy: 0.86, rot: 0.08, arm: [8, 8], curl: [1, 1], legs: duoFeet([-5, 0], [5, 0]) }],
          [37, { y: -4, sx: 0.96, sy: 1.08, arm: [-34, -34], curl: [1, 1], legs: duoFeet([-4, 0], [4, 0]) }], // burst: double biceps
          [56, { arm: [-32, -32], curl: [1, 1], legs: duoFeet([-4, 0], [4, 0]) }],
          [67, {}],
        ]),
        x: f < 36 ? Math.sin(f * 2.3) * f / 18 : 0, // shaking harder and harder
        blink: f >= 4 && f < 36 ? 0.7 : 0,
        buff: f < 4 ? 0 : f < 36 ? (f - 4) / 32 : 1 + 0.15 * Math.max(0, Math.sin(Math.PI * (f - 36) / 14)) * (f < 50), // pumped for a moment
        flame: f < 4 ? null : f < 36 ? [30 + 40 * (f - 4) / 32, Math.min(1, (f - 4) / 4)] : [110 * Math.min(1, (f - 35) / 3), Math.max(0, Math.min(1, 1 - (f - 46) / 20))],
        puff: f === 36 ? 0 : null,
        say: f >= 36 && f < 67 ? [...duoSay('💪 BUFF DUO', f, 36, 67), 46] : f >= 67 ? null : duoSay('hnnngh…', f, 6, 36),
      }),
    },
  },
  grabs: { // throws use Claw'd's throwAnim: the target rides carry until the release frame, say = [before, after] it
    grab: { ...DUO_GR.grab, name: 'Wing Clamp', // lean in and clamp the front wing round whatever's there
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [4, { x: -2, sx: 0.96, sy: 1.04, rot: -0.08, arm: [-2, -34], legs: duoFeet([2, 0], [0, 0]) }],
          [6, { x: 6, sx: 1.1, sy: 0.93, rot: 0.14, arm: [-10, -22], legs: duoFeet([-4, 0], [3, 0]) }],
          [9, { x: 6, sx: 1.1, sy: 0.93, rot: 0.14, arm: [-10, -16], legs: duoFeet([-4, 0], [3, 0]) }],
          [16, { x: 4, sx: 1.04, sy: 0.96, rot: 0.08, arm: [-4, -4] }],
          [31, {}],
        ]),
        blink: f >= 9 && f < 16 ? 0.5 : 0,
      }),
    },
    dashGrab: { ...DUO_GR.dashGrab, name: 'Wing Dive', // out of a run: dives in wing-first and slides on the momentum
      anim: f => ({
        ...tween(f, [
          [0, { y: -3, rot: 0.12 }], // = run frame 0
          [5, { x: -2, sx: 1.06, sy: 0.92, rot: -0.04, arm: [-2, -34] }],
          [9, { x: 12, y: -2, sx: 1.18, sy: 0.86, rot: 0.2, arm: [-14, -22], legs: duoFeet([-10, 2], [5, 1]) }],
          [12, { x: 14, sx: 1.16, sy: 0.87, rot: 0.18, arm: [-12, -18], legs: duoFeet([-10, 1], [5, 0]) }],
          [24, { x: 8, sx: 1.05, sy: 0.95, rot: 0.06, arm: [-4, -4] }],
          [40, {}],
        ]),
        speed: f >= 9 && f < 20 ? 1 - (f - 9) / 11 : 0, dust: f >= 9 && f < 21 ? (f - 9) / 12 : null, blink: f >= 12 && f < 22 ? 0.5 : 0,
      }),
    },
    hold: { ...DUO_GR.hold, // got it: leaning back with its wing clamped on, staring it down
      anim: (f, n = 60) => {
        const b = Math.sin(f / n * Math.PI * 4);
        return { ...DUO_HOLD, rot: -0.04 + 0.02 * b, sx: 1.02 + 0.01 * b, sy: 0.98 - 0.01 * b, carry: [52, -4 + b, 0] };
      },
    },
    pummel: { ...DUO_GR.pummel, name: 'Peck', // *peck*: a quick headbutt
      anim: f => ({
        ...tween(f, [
          [0, DUO_HOLD],
          [4, { ...DUO_HOLD, x: -2, rot: -0.14, sx: 0.96, sy: 1.04, carry: [50, -6, 0] }],
          [5, { ...DUO_HOLD, x: 4, rot: 0.22, sx: 1.06, sy: 0.95, carry: [55, -2, 0.08] }],
          [16, DUO_HOLD],
        ]),
        blink: f >= 5 && f < 9 ? 0.8 : 0, say: ['*peck*', Math.max(0, Math.min(1, f / 3, (16 - f) / 4))],
      }),
    },
    forwardThrow: { ...DUO_GR.forwardThrow, name: 'Skip Lesson', // skip this lesson? no.: rear back and shove it away
      anim: throwAnim({ at: 10, n: 29, fly: [12, -6, 0.1], say: ['skip this lesson?', '✗ no.'], keys: [
        [0, DUO_HOLD],
        [7, { x: -4, rot: -0.18, sx: 0.94, sy: 1.06, arm: [-8, -6], legs: duoFeet([2, 0], [1, 0]), carry: [42, -8, -0.15] }],
        [10, { x: 6, rot: 0.2, sx: 1.16, sy: 0.88, arm: [-12, -24], legs: duoFeet([-8, 0], [4, 0]), carry: [80, -14, 0.2] }],
        [16, { x: 5, rot: 0.14, sx: 1.1, sy: 0.92, arm: [-10, -20] }],
        [29, {}],
      ], extra: f => ({ speed: f >= 10 && f < 18 ? 1 - (f - 10) / 8 : 0 }) }),
    },
    backThrow: { ...DUO_GR.backThrow, name: 'Missed A Day', // you missed a day: hoist it overhead with both wings and heave it over backwards
      anim: throwAnim({ at: 16, n: 37, fly: [-12, -4, -0.15], say: ['you missed a day…', '↶ back to day 0'], keys: [
        [0, DUO_HOLD],
        [6, { rot: -0.1, sx: 0.92, sy: 1.1, arm: -44, carry: [28, -62, -0.8] }],
        [12, { rot: -0.35, sx: 0.96, sy: 1.06, arm: -48, carry: [-20, -68, -2.2] }],
        [16, { rot: -0.45, sx: 1.1, sy: 0.9, arm: [-22, -30], carry: [-62, -20, -3] }],
        [22, { rot: -0.3, sx: 1.06, sy: 0.94, arm: -12 }],
        [37, {}],
      ] }),
    },
    upThrow: { ...DUO_GR.upThrow, name: 'Lesson Complete', // lesson complete!: crouch under it, then fling it skyward with a big flap
      anim: throwAnim({ at: 14, n: 35, fly: [0, -14, 0.05], say: ['lesson complete!', '⬆ +20 XP'], keys: [
        [0, DUO_HOLD],
        [8, { sx: 1.16, sy: 0.84, arm: [4, 2], legs: duoFeet([-3, 0], [3, 0]), carry: [48, 0, 0] }],
        [11, { sx: 1.18, sy: 0.82, arm: [6, 4], legs: duoFeet([-3, 0], [3, 0]), carry: [48, 2, 0] }],
        [14, { y: -6, sx: 0.86, sy: 1.2, arm: -46, legs: duoFeet([0, 3], [0, 3]), carry: [40, -80, 0] }],
        [22, { y: -2, sx: 0.94, sy: 1.08, arm: -30 }],
        [35, {}],
      ] }),
    },
    downThrow: { ...DUO_GR.downThrow, name: 'Spanish Or Vanish', // spanish or vanish: lift it overhead and slam it into the floor, where it bounces up
      anim: throwAnim({ at: 14, n: 35, fly: [2, -9, 0.1], say: ['spanish or vanish.', '💥 vanished'], keys: [
        [0, DUO_HOLD],
        [6, { y: -6, rot: -0.05, sx: 0.9, sy: 1.12, arm: -44, carry: [30, -62, 0] }],
        [11, { y: -10, rot: 0.05, sx: 0.94, sy: 1.08, arm: -48, carry: [40, -72, 0.1] }],
        [14, { rot: 0.18, sx: 1.26, sy: 0.74, arm: [-6, -14], carry: [58, 0, 0] }],
        [22, { rot: 0.06, sx: 1.1, sy: 0.9, arm: -4 }],
        [35, {}],
      ], extra: f => ({ puff: f >= 14 ? (f - 14) / 10 : null, blink: f >= 14 && f < 18 ? 0.6 : 0 }) }),
    },
  },
  // hanging on with both wings hooked over the lip: Claw'd's ledge moves with the wings swung twice as far (four times reaches past the top)
  ledge: {
    ...duoBorrow('ledge', 2),
    ledgeAttack: { ...MOVESET.ledge.ledgeAttack, name: 'Back To Class', // haul up, land in a crouch and sweep the front wing low along the stage
      anim: f => {
        const p = duoize(MOVESET.ledge.ledgeAttack.anim, 2)(f);
        if (f >= 13) p.arm = tween(f, [[13, { arm: [0, 8] }], [16, { arm: [-8, -16] }], [20, { arm: [-8, -16] }], [28, { arm: [-2, -4] }], [36, { arm: [0, 0] }]]).arm;
        return { ...p, say: duoSay('back to class!', f, 16, 36) };
      },
    },
  },
  defense: {
    shield: { ...MOVESET.defense.shield, name: 'Focus Mode', // Do Not Disturb: crouch behind a phone held up in front, eyes peeking over it. Its battery runs down
      // as the shield wears (the game passes the wear; the preview drains it over the hold)
      anim: f => {
        const brace = { sx: 1.14, sy: 0.74, arm: [4, -30], legs: duoFeet([-2, 0], [2, 0]), ph: 1 };
        const p = tween(f, [[0, {}], [4, brace], [50, brace], [57, {}], [60, {}]]);
        if (f > 4 && f < 50) p.sy += 0.01 * Math.sin((f - 4) / 46 * Math.PI * 4); // breathing behind it
        return { ...p, ph: undefined, phone: p.ph > 0.05 ? [16, -22, p.ph, -0.08] : null, blink: f >= 3 && f < 52 ? 0.3 : 0, wear: Math.min(1, Math.max(0, (f - 4) / 46)) };
      },
    },
    shieldBreak: { ...MOVESET.defense.shieldBreak, name: 'Dead Battery', // the battery ran out: the screen dies, the phone tumbles away, Duo pops up and lands dizzy
      anim: f => ({
        ...duoize(MOVESET.defense.shieldBreak.anim)(f), shatter: null,
        phone: f < 24 ? [16 + 2 * f, -22 - 4 * f + 0.35 * f * f, 1 - f / 24, 0.25 * f, true] : null,
        oopsMsg: ['phone died 🪫', '12 missed lessons'],
      }),
    },
    spotDodge: duoWings(MOVESET.defense.spotDodge), rollForward: duoWings(MOVESET.defense.rollForward), rollBack: duoWings(MOVESET.defense.rollBack),
    airDodgeForward: duoWings(MOVESET.defense.airDodgeForward), airDodgeBack: duoWings(MOVESET.defense.airDodgeBack), airDodge: duoWings(MOVESET.defense.airDodge),
  },
  reactions: {
    ...duoBorrow('reactions'),
    ko: { ...MOVESET.reactions.ko, // spins off shrinking, then a burst of ink and green with one of its hearts popping in the middle
      anim: f => {
        const p = duoize(MOVESET.reactions.ko.anim)(f);
        return p.blast ? { ...p, blast: [...p.blast, DUO, (x, y, r) => drawHeart(x, y, r / 13)] } : p;
      },
    },
    respawn: { ...MOVESET.reactions.respawn, name: 'Streak Repaired', say: '🔧 streak repaired', // lowered back in on the platform
      anim: f => ({ ...duoize(MOVESET.reactions.respawn.anim)(f), say: ['🔧 streak repaired', f < 100 ? Math.min(1, f / 10) : 0] }),
    },
  },
};

// buff Duo's attacks (the down special's streak mode): the same moves, frame data and hitboxes, animated as punches. The game swaps these
// anims in while Duo is buff; buff: 1 draws them buff here (the moves page). arm swings are buff Duo's arms, curl their elbows (drawBuffDuo)
const DUO_GUARD = { arm: [-8, -12], curl: [0.8, 0.85] }; // fists up
const duoBuffed = (g, k, say, keys, more) => ({ ...DUO_MOVESET[g][k], input: 'while buff · ' + (DUO_MOVESET[g][k].input || ''),
  anim: f => ({ ...tween(f, keys), buff: 1, say: duoSay(say[0], f, say[1], say[2]), ...more?.(f) }) });
DUO_MOVESET.buffed = {
  jab1: duoBuffed('groundAttacks', 'jab1', ['¡uno!', 3, 19], [ // a quick straight with the front fist
    [0, {}], [2, { x: -2, rot: -0.05, ...DUO_GUARD }],
    [3, { x: 6, rot: 0.12, sx: 1.04, arm: [-8, -27], curl: [0.8, -1], legs: duoFeet([-4, 0], [3, 0]) }],
    [6, { x: 6, rot: 0.12, sx: 1.04, arm: [-8, -27], curl: [0.8, -1], legs: duoFeet([-4, 0], [3, 0]) }],
    [12, { x: 2, ...DUO_GUARD }], [19, {}],
  ], f => ({ speed: f >= 3 && f < 6 ? 0.4 : 0 })),
  jab2: duoBuffed('groundAttacks', 'jab2', ['¡dos!', 3, 21], [ // a rising hook
    [0, { x: 2, ...DUO_GUARD }], [2, { x: 0, rot: -0.1, arm: [-8, -6], curl: [0.8, 0.6] }],
    [3, { x: 5, y: -2, rot: 0.08, sy: 1.05, arm: [-8, -40], curl: [0.8, 0.3], legs: duoFeet([-3, 0], [3, 0]) }],
    [7, { x: 5, y: -2, rot: 0.08, sy: 1.05, arm: [-8, -42], curl: [0.8, 0.3], legs: duoFeet([-3, 0], [3, 0]) }],
    [13, { x: 2, ...DUO_GUARD }], [21, {}],
  ]),
  jab3: duoBuffed('groundAttacks', 'jab3', ['¡tres! 💪', 5, 32], [ // wind up and throw the whole body behind a straight
    [0, { x: 2, ...DUO_GUARD }], [4, { x: -4, rot: -0.15, sx: 0.95, arm: [-4, 4], curl: [0.8, 1] }],
    [5, { x: 10, rot: 0.25, sx: 1.1, sy: 0.94, arm: [-12, -28], curl: [0.6, -1], legs: duoFeet([-8, 0], [6, 0]) }],
    [10, { x: 10, rot: 0.22, sx: 1.08, sy: 0.95, arm: [-12, -28], curl: [0.6, -1], legs: duoFeet([-8, 0], [6, 0]) }],
    [20, { x: 4, ...DUO_GUARD }], [32, {}],
  ], f => ({ speed: f >= 5 && f < 10 ? 0.6 : 0 })),
  dashAttack: duoBuffed('groundAttacks', 'dashAttack', ['no days off', 6, 34], [ // a shoulder charge
    [0, {}], [5, { x: -2, rot: 0.1, sy: 0.95, arm: [4, 2], curl: [1, 1] }],
    [6, { x: 8, rot: 0.35, sx: 1.08, sy: 0.9, arm: [6, 4], curl: [1, 1], legs: duoFeet([-8, 0], [4, 0]) }],
    [14, { x: 8, rot: 0.32, sx: 1.08, sy: 0.9, arm: [6, 4], curl: [1, 1], legs: duoFeet([-8, 0], [4, 0]) }],
    [24, { x: 3, rot: 0.1 }], [34, {}],
  ], f => ({ speed: f >= 6 && f < 14 ? 0.8 : 0 })),
  forwardTilt: duoBuffed('groundAttacks', 'forwardTilt', ['form check.', 6, 27], [ // step in behind a long straight
    [0, {}], [4, { x: -3, rot: -0.1, arm: [-6, 2], curl: [0.8, 1] }],
    [6, { x: 9, rot: 0.16, sx: 1.06, arm: [-10, -29], curl: [0.7, -1], legs: duoFeet([-6, 0], [5, 0]) }],
    [10, { x: 9, rot: 0.16, sx: 1.06, arm: [-10, -29], curl: [0.7, -1], legs: duoFeet([-6, 0], [5, 0]) }],
    [18, { x: 3, ...DUO_GUARD }], [27, {}],
  ]),
  upTilt: duoBuffed('groundAttacks', 'upTilt', ['+10 XP 💪', 5, 25], [ // dip, then an uppercut straight up
    [0, {}], [4, { y: 2, sy: 0.88, arm: [-6, 4], curl: [0.8, 1] }],
    [5, { y: -3, sy: 1.1, rot: -0.05, arm: [-6, -58], curl: [0.8, -0.6] }],
    [10, { y: -3, sy: 1.08, rot: -0.05, arm: [-6, -58], curl: [0.8, -0.6] }],
    [17, { ...DUO_GUARD }], [25, {}],
  ]),
  downTilt: duoBuffed('groundAttacks', 'downTilt', ['leg day.', 5, 20], [ // a low stomp out in front
    [0, {}], [3, { y: 2, sy: 0.9, rot: -0.08, legs: duoFeet([0, 0], [4, -8]), ...DUO_GUARD }],
    [5, { y: 2, sy: 0.9, rot: 0.1, legs: duoFeet([-3, 0], [16, -2]), ...DUO_GUARD }],
    [8, { y: 2, sy: 0.9, rot: 0.1, legs: duoFeet([-3, 0], [16, -2]), ...DUO_GUARD }],
    [14, { ...DUO_GUARD }], [20, {}],
  ]),
  forwardSmash: duoBuffed('smashAttacks', 'forwardSmash', ['💥 FLAWLESS', 14, 48], [ // cock the fist back (charge holds at 10), then a haymaker
    [0, {}], [10, { x: -5, rot: -0.2, sx: 0.95, sy: 1.03, arm: [-14, 8], curl: [0.8, 1], legs: duoFeet([-2, 0], [4, 0]) }],
    [14, { x: 12, rot: 0.25, sx: 1.12, sy: 0.92, arm: [-16, -28], curl: [0.5, -1], legs: duoFeet([-10, 0], [6, 0]) }],
    [20, { x: 12, rot: 0.22, sx: 1.1, sy: 0.93, arm: [-16, -26], curl: [0.5, -1], legs: duoFeet([-10, 0], [6, 0]) }],
    [34, { x: 4, ...DUO_GUARD }], [48, {}],
  ], f => ({ speed: f >= 14 && f < 20 ? 0.8 : 0 })),
  upSmash: duoBuffed('smashAttacks', 'upSmash', ['🙌 LEVEL UP', 12, 40], [ // crouch with both fists cocked (charge holds at 8), then a double uppercut
    [0, {}], [8, { y: 3, sx: 1.08, sy: 0.84, arm: [4, 4], curl: [1, 1], legs: duoFeet([-4, 0], [4, 0]) }],
    [12, { y: -6, sx: 0.94, sy: 1.14, arm: [-56, -56], curl: [-1, -1] }],
    [18, { y: -6, sx: 0.94, sy: 1.12, arm: [-56, -56], curl: [-1, -1] }],
    [30, { ...DUO_GUARD }], [40, {}],
  ]),
  downSmash: duoBuffed('smashAttacks', 'downSmash', ['🌋 DAILY GOAL', 12, 38], [ // both fists overhead (charge holds at 8), then pounded into the floor either side
    [0, {}], [8, { y: -2, sy: 1.06, arm: [-50, -50], curl: [0.6, 0.6] }],
    [12, { y: 3, sx: 1.12, sy: 0.84, rot: 0, arm: [-16, -16], curl: [-1, -1], legs: duoFeet([-5, 0], [5, 0]) }],
    [18, { y: 3, sx: 1.1, sy: 0.86, arm: [-16, -16], curl: [-1, -1], legs: duoFeet([-5, 0], [5, 0]) }],
    [28, { ...DUO_GUARD }], [38, {}],
  ], f => ({ puff: f === 12 ? 0 : null })),
  neutralAir: duoBuffed('aerials', 'neutralAir', ['hoo HOO!', 4, 26], [ // spin a full turn, both fists out straight
    [0, DUO_GUARD], [4, { arm: [-29, -29], curl: [-1, -1], rot: 0 }], [12, { arm: [-29, -29], curl: [-1, -1], rot: 6.28 }], [26, DUO_GUARD],
  ]),
  forwardAir: duoBuffed('aerials', 'forwardAir', ['✗ wrong.', 7, 27], [ // a hammer fist, raised high and chopped down in front
    [0, DUO_GUARD], [6, { rot: -0.15, arm: [-10, -58], curl: [0.8, 0.4] }],
    [7, { rot: 0.2, arm: [-10, -20], curl: [0.8, -1] }], [11, { rot: 0.2, arm: [-10, -16], curl: [0.8, -1] }], [27, DUO_GUARD],
  ]),
  backAir: duoBuffed('aerials', 'backAir', ['remember me?', 6, 24], [ // a straight thrown out behind with the back fist
    [0, DUO_GUARD], [5, { rot: 0.1, arm: [2, -12], curl: [1, 0.8] }],
    [6, { rot: -0.15, x: -4, arm: [-29, -12], curl: [-1, 0.8] }], [10, { rot: -0.15, x: -4, arm: [-29, -12], curl: [-1, 0.8] }], [24, DUO_GUARD],
  ]),
  upAir: duoBuffed('aerials', 'upAir', ['📈 gains', 5, 24], [ // both fists punched straight up
    [0, DUO_GUARD], [4, { arm: [-20, -20], curl: [1, 1], sy: 0.92 }],
    [5, { arm: [-56, -56], curl: [-1, -1], sy: 1.1 }], [10, { arm: [-56, -56], curl: [-1, -1], sy: 1.08 }], [24, DUO_GUARD],
  ]),
  downAir: duoBuffed('aerials', 'downAir', ['📉 streak lost.', 8, 32], [ // fists up, both feet stomped straight down. Spikes
    [0, DUO_GUARD], [6, { y: -3, arm: [-40, -40], curl: [0.6, 0.6], legs: duoFeet([0, -6], [0, -6]) }],
    [8, { y: 2, sy: 1.06, arm: [-46, -46], curl: [0.3, 0.3], legs: duoFeet([2, 6], [-2, 6]) }],
    [14, { y: 2, sy: 1.06, arm: [-46, -46], curl: [0.3, 0.3], legs: duoFeet([2, 6], [-2, 6]) }], [32, DUO_GUARD],
  ]),
};
