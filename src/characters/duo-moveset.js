// Duo's moveset (drawn by duo.js). Duo flies like Kirby or Meta Knight: its double jump is a wing beat it can do again and again,
// it falls floatily on half-spread wings, and holding jump while falling glides. Everything else moves like Claw'd
// (clawd-moveset.js, loaded first); his arm poses swing Duo's wings.
const DUO_MOVESET = {
  movement: {
    ...MOVESET.movement,
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
};
