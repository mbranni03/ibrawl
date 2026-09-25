// Muse's moveset (drawn by muse.js): Snoo's body moves (snoo-moveset.js, loaded first), which fit the same rig of stretchy stubby
// arms and little feet; muse.js draws likes and hearts where Snoo hands out votes. Its smashes are Meta's: a llama kick (Meta's
// Llama) to the side, an Instagram story bursting open overhead (on Snoo's body motion), and a Beat Saber slash both ways in a
// Quest headset. No specials, grabs or shield yet (off in the game), and so no shield break; the dodges are
// Snoo's too.
const MUSE_MOVESET = {
  movement: SNOO_MOVESET.movement, groundAttacks: SNOO_MOVESET.groundAttacks, aerials: SNOO_MOVESET.aerials, ledge: SNOO_MOVESET.ledge,
  // hold the button to charge (chargeFrames, chargeMult, chargeAt as Snoo's)
  smashAttacks: {
    forwardSmash: { // llama kick: Muse points ahead and a llama pops in in front of it, facing it; it crouches, rear down (charge
      // holds here, frame 12: lower the longer it charges), then bucks both back legs out forward while Muse cheers, and poofs off
      input: 'heavy (X / K), hold to charge', startup: 16, active: 4, endlag: 30, damage: 16, kb: { base: 34, growth: 100, angle: 38 },
      hitbox: { x: 40, y: -56, w: 72, h: 50 }, chargeFrames: 60, chargeMult: 1.4, chargeAt: 12,
      anim: (f, n, c = 0) => { // c = 0 … 1 charge held so far (the game passes it; the viewer shows none)
        const p = tween(f, [
          [0, {}],
          [6, { x: -4, rot: -0.04, swing: [0.3, 1.2], reach: [0, 6] }], // points: go get 'em
          [12, { x: -6, rot: -0.08, sx: 0.97, sy: 1.03, swing: [0.4, 1.4], reach: [0, 10] }],
          [15, { x: -6, rot: -0.1, sx: 0.96, sy: 1.04, swing: [0.4, 1.45], reach: [0, 10] }],
          [16, { x: -5, y: -3, rot: 0.04, sy: 1.06, blink: 1, swing: [-1.7, 1.9] }], // cheers as it bucks
          [22, { x: -5, y: -2, rot: 0.03, sy: 1.04, blink: 1, swing: [-1.6, 1.8] }],
          [34, { x: -3, swing: [-0.5, 0.6] }],
          [50, {}],
        ]);
        const l = tween(f, [[0, { l: [0, 0] }], [5, { l: [1.08, 0] }], [8, { l: [1, 0] }], [12, { l: [1, -0.4] }], [15, { l: [1, -0.45] }],
          [16, { l: [1, 1] }], [21, { l: [1, 1] }], [30, { l: [1, 0.15] }], [40, { l: [1, 0] }], [46, { l: [0, 0] }]]).l; // [size, buck]
        if (f >= 8 && f < 16) l[1] -= 0.15 * c;
        return { ...p, llama: [...l, f < 8 ? f / 8 : f >= 40 && f < 50 ? (f - 40) / 10 : null] };
      },
    },
    upSmash: { // Instagram story: Snoo's crouch (charge holds, frame 8) and spring up, arms high, and its story ring bursts open
      // overhead with Muse's face in it, launching whatever's above or beside it
      ...SNOO_MOVESET.smashAttacks.upSmash, hitbox: { x: -42, y: -156, w: 84, h: 156 },
      anim: (f, n, c) => { const { bigvote, ...p } = SNOO_MOVESET.smashAttacks.upSmash.anim(f, n, c); return { ...p, story: f >= 11 && f < 38 ? (f - 11) / 27 : null }; },
    },
    downSmash: { // Beat Saber: pulls on a Quest headset and lights a saber in each hand as a red and a blue cube slide in either
      // side, raises both crossed overhead (charge holds here, frame 8), then slashes both down and out at once, slicing the cubes.
      // Hits both sides; knockback goes away from Muse
      input: 'down + heavy (X / K), hold to charge', startup: 12, active: 5, endlag: 22, damage: 14, kb: { base: 30, growth: 96, angle: 25 },
      hitbox: { x: -84, y: -60, w: 168, h: 60 }, both: true, chargeFrames: 60, chargeMult: 1.4, chargeAt: 8,
      anim: (f, n, c = 0) => {
        const wide = [[-4, 0], [0, 0], [0, 0], [4, 0]];
        const p = tween(f, [
          [0, {}],
          [6, { y: -2, sx: 0.95, sy: 1.06, swing: [-3, 3], arm: [-3, -3], legs: wide }], // sabers up, crossed overhead
          [11, { y: -3, sx: 0.94, sy: 1.08, rot: -0.03, swing: [-3.05, 3.05], arm: [-4, -4], legs: wide }],
          [12, { sx: 1.16, sy: 0.86, swing: [-1.1, 1.1], arm: [2, 2], legs: [[-7, 0], [0, 0], [0, 0], [7, 0]] }], // slash!
          [17, { sx: 1.14, sy: 0.87, swing: [-0.5, 0.5], arm: [2, 2], legs: [[-7, 0], [0, 0], [0, 0], [7, 0]] }],
          [28, { sx: 1.04, sy: 0.97, swing: [-0.3, 0.3] }],
          [40, {}],
        ]);
        if (f >= 6 && f < 12) { p.sy += 0.05 * c; p.y -= 2 * c; } // up on its toes the longer it charges
        return {
          ...p, puff: f >= 12 && f < 22 ? (f - 12) / 10 : null,
          headset: tween(f, [[0, { k: 0 }], [4, { k: 1 }], [34, { k: 1 }], [39, { k: 0 }]]).k,
          sabers: tween(f, [[0, { k: 0 }], [5, { k: 1 }], [30, { k: 1 }], [36, { k: 0 }]]).k,
          slash: f >= 12 && f < 24 ? (f - 12) / 12 : null,
          cubes: f < 30 ? [Math.min(1, f / 8), f >= 12 ? (f - 12) / 18 : null] : null,
        };
      },
    },
  },
  defense: Object.fromEntries(Object.entries(SNOO_MOVESET.defense).filter(([k]) => !k.startsWith('shield'))),
  reactions: {
    ...SNOO_MOVESET.reactions,
    respawn: { // lowered in on the platform, saying hi
      ...SNOO_MOVESET.reactions.respawn, say: "Hi, I'm Muse!",
      anim: f => { const p = SNOO_MOVESET.reactions.respawn.anim(f); return { ...p, say: ["Hi, I'm Muse!", p.say[1]] }; },
    },
  },
};
