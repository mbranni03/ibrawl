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
  smashAttacks: { // c = 0 … 1 charge held (the game passes it; the viewer shows none)
    forwardSmash: { ...DUO_SA.forwardSmash, // pop quiz: hold up a flash card and study it (charge holds here, frame 10), then slam it forward and
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
    upSmash: { ...DUO_SA.upSmash, // streak flame: crouch as a flame kindles behind it and the streak counts up (charge holds here, frame 8),
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
    downSmash: { ...DUO_SA.downSmash, // unskippable ad: duck while an ad panel hovers over each side, its skip timer counting down
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
    neutralSpecial: { // heart zap: hold up one of its hearts and zap it forward. Duo has 5 a stock: each use spends one and hits harder than
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
        const left = had - 1;
        return {
          ...p, blink: f >= 10 && f < 14 ? 0.4 : 0, speed: f >= 10 && f < 14 ? 0.5 : 0,
          heart: f < 10 ? [30, -44, 0.5 + 0.05 * f, Math.min(1, f / 3)] : f < 20 ? [30 + 3 * (f - 10), -40, 1 + 0.06 * (f - 10), 1 - (f - 10) / 10] : null, // held up, then zapped out
          say: duoSay('❤'.repeat(left) + '🖤'.repeat(5 - left), f, 10, 36),
        };
      },
    },
    sideSpecial: { // reminder: flick a wing and a push notification pops out, then drifts after the nearest target, turning to follow it
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
    upSpecial: { // streak freeze: raise both wings, slam them down, and a block of ice shoots up out of the floor ahead, launching whoever's
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
    downSpecial: { // Duo is watching: set a little Duo plush down in front. It sits there staring, and pounces on anything that comes close.
      // One out at a time; it gives up after a while. sub: scale of Duo · set down px ahead · seconds it waits · pounce = how close is close
      input: 'down + B (V / L), ground or air · one plush out at a time', startup: 14, active: 2, endlag: 16, damage: 6,
      kb: { base: 30, growth: 45, angle: 50 }, hitbox: null, landingLag: 10, sub: { scale: 0.5, x: 44, speed: 0, life: 8, report: 0, pounce: 170 },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [8, { x: -2, rot: 0.3, sx: 1.04, sy: 0.94, arm: [-6, -26], legs: duoFeet([2, 0], [-1, 0]) }],
          [14, { x: 4, rot: 0.42, sx: 1.06, sy: 0.92, arm: [-4, -14], legs: duoFeet([-4, 0], [2, 0]) }],
          [32, {}],
        ]),
        say: duoSay('Duo is watching 👀', f, 12, 32),
      }),
    },
  },
};
