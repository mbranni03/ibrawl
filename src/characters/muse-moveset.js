// Muse's moveset (drawn by muse.js): Snoo's body moves (snoo-moveset.js, loaded first), which fit the same rig of stretchy stubby
// arms and little feet; muse.js draws likes and hearts where Snoo hands out votes. Its smashes are Meta's: a llama kick (Meta's
// Llama) to the side, an Instagram story bursting open overhead (on Snoo's body motion), and a Beat Saber slash both ways in a
// Quest headset. Its specials: a stream of Muse sparks from its hands (held, like fire breath), a long stretchy Facebook poke, birthday balloons up
// (its recovery), and a Meta AI prompt that drops whatever it imagined. Its grabs are Snoo's (stretchy arms out, held at arm's
// length), handing out likes as it pummels and on the up throw, a heart on the down throw, "Shared!" on the forward throw and
// "Unfriended" on the back throw. Its shield: doomscrolling behind a giant phone, the feed scrolling up its screen; the break:
// "Time for a break?". The dodges are Snoo's.
// Snoo's grabs on Muse's wider body: its back arm, reaching forward, stretches further to get round the body to the foe too, a
// little higher than the front one so both show
const MUSE_GRABS = Object.fromEntries(Object.entries(SNOO_MOVESET.grabs).map(([k, m]) => [k, { ...m, anim: (f, n) => {
  const p = m.anim(f, n), arm = Array.isArray(p.arm) ? p.arm : [p.arm || 0, p.arm || 0];
  return Array.isArray(p.reach) && p.reach[0] > 0 ? { ...p, reach: [p.reach[0] + 30, p.reach[1]], arm: [arm[0] - 5, arm[1]] } : p;
} }]));
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
  // usable on the ground and in the air; extra fields as in snoo-moveset.js, plus hold / loop (the neutral special's)
  specials: {
    neutralSpecial: { // spark stream: draws both hands back, thrusts them out together and streams Muse sparks from between them,
      // hitting over and over, short range. Hold B to keep it going (loop: frames 10 … 22 play over, for up to chargeFrames in
      // all), shorter the longer it goes, like Bowser's fire breath
      input: 'B (V / L), no direction · hold to keep it going, ground or air', startup: 8, active: 16, endlag: 18, damage: 1.2, every: 4,
      kb: { base: 8, growth: 10, angle: 30 }, hitbox: { x: 40, y: -56, w: 72, h: 36 }, grow: { w: -26 }, landingLag: 10,
      hold: 'special', loop: [10, 22], chargeFrames: 120,
      anim: (f, n, c = 0) => { // c = 0 … 1 of the stream spent (the game passes it; the viewer shows none)
        // both hands out together in front, the back one reaching round the body to meet the front one
        const cast = { x: 2, rot: 0.08, sx: 1.03, sy: 0.97, reach: [76, 20], arm: [0, -1], blink: 0.4, legs: [[-4, 0], [0, 0], [0, 0], [2, 0]] };
        const p = tween(f, [[0, {}], [7, { x: -2, rot: -0.1, sx: 0.96, sy: 1.06, reach: [-8, -8], arm: [-2, -2] }], [10, cast], [24, cast], [42, {}]]);
        if (f >= 10 && f < 24) p.y = Math.sin(f * 1.6) * 0.8; // rumbling with it
        return { ...p, stream: [f, c, f < 8 ? 0 : f < 10 ? (f - 8) / 2 : f < 24 ? 1 : Math.max(0, 1 - (f - 24) / 5)] };
      },
    },
    sideSpecial: { // Facebook poke: draws the front arm back, then shoots it out far ahead, finger first, and pokes; whoever it gets
      // wears a "Muse poked you!" for a moment
      input: 'B (V / L) + ← →, ground or air · turns that way first', startup: 12, active: 3, endlag: 26, damage: 7, kb: { base: 25, growth: 60, angle: 35 },
      hitbox: { x: 56, y: -46, w: 70, h: 24 }, landingLag: 12, sticker: { secs: 1.2, draw: drawPokeNote },
      anim: f => ({
        ...tween(f, [
          [0, {}],
          [8, { x: -4, rot: -0.1, sx: 0.96, sy: 1.04, reach: [0, -8], swing: [0.3, 0.3] }],
          [12, { x: 4, rot: 0.12, sx: 1.06, sy: 0.95, reach: [0, 128], swing: [0.2, 0], blink: 0.3, legs: [[-6, 0], [0, 0], [0, 0], [4, 0]] }],
          [15, { x: 4, rot: 0.12, sx: 1.06, sy: 0.95, reach: [0, 126], swing: [0.2, 0], blink: 0.3, legs: [[-6, 0], [0, 0], [0, 0], [4, 0]] }],
          [22, { x: 2, rot: 0.05, reach: [0, 40] }],
          [34, { reach: [0, 6] }],
          [41, {}],
        ]),
        poke: f >= 9 && f < 30, speed: f >= 12 && f < 16 ? 0.5 : 0,
      }),
    },
    upSpecial: { // birthday balloons: a bunch pops up in its raised hands and floats it up (steer with ← →), bumping whatever's above;
      // they burst at the top (the last, bigger hit) and it falls helpless
      input: 'B (V / L) + ↑, ground or air · steer with ← → · falls helpless after', startup: 6, active: 40, endlag: 6, damage: 2, every: 10,
      kb: { base: 20, growth: 20, angle: 85 }, finisher: { damage: 5, kb: { base: 40, growth: 60, angle: 88 } },
      hitbox: { x: -34, y: -150, w: 68, h: 76 }, landingLag: 16, burst: { vy: -330, frames: 40 }, helpless: true,
      anim: f => {
        const up = { swing: [-3, 3], arm: [-3, -3], legs: legsAll(0, 3) };
        const p = tween(f, [[0, {}], [5, { ...up, sx: 1.06, sy: 0.94 }], [8, { ...up, sy: 1.06 }], [44, { ...up, sy: 1.04 }], [52, { swing: [-1.6, 1.6], legs: legsAll(0, 2) }]]);
        if (f >= 8 && f < 46) p.rot = 0.06 * Math.sin((f - 8) / 9); // dangling
        return { ...p, balloons: f < 56 ? [Math.min(1, f / 5), f >= 46 ? (f - 46) / 10 : null, f / 9] : null };
      },
    },
    downSpecial: { // Meta AI, imagine: a prompt pops up over Muse ("Imagine a piano", or a duck, a cake, an anvil: a random pick),
      // it dreams it up high ahead of itself, then points, and down it drops on whoever's there
      input: 'B (V / L) + ↓, ground or air', startup: 24, active: 5, endlag: 20, damage: 13, kb: { base: 35, growth: 75, angle: 65 },
      hitbox: { x: 30, y: -72, w: 56, h: 72 }, landingLag: 12, pick: MUSE_IMAGINE,
      anim: (f, n, c, pick = 0) => ({
        ...tween(f, [
          [0, {}],
          [5, { swing: [-0.6, 0.6], arm: [-2, -2], blink: 0.3 }],
          [10, { sy: 1.04, swing: [-1.4, 1.4], blink: 1 }], // dreaming it up
          [21, { sy: 1.04, swing: [-1.5, 1.5], blink: 1 }],
          [24, { x: 2, rot: 0.06, swing: [-0.2, 1.3], reach: [0, 14] }], // there!
          [30, { x: 1, sy: 0.97, swing: [-0.3, 1.2], reach: [0, 12] }],
          [49, {}],
        ]),
        imagine: f < 50 ? [f < 3 ? f / 3 : f < 22 ? 1 : Math.max(0, 1 - (f - 22) / 6), f < 20 ? 150 : Math.max(0, 150 * (1 - ((f - 20) / 6) ** 2)),
          f < 8 ? 0 : Math.min(1, (f - 8) / 10), f < 26 ? 0 : (f - 26) / 24, pick ?? 0] : null,
      }),
    },
  },
  grabs: { // Snoo's grab, dash grab, hold and throws (their votes come out as likes and hearts), with Meta's labels on top
    ...MUSE_GRABS,
    pummel: { // nods and bonks it, and a like pops up
      ...MUSE_GRABS.pummel,
      anim: f => ({ ...MUSE_GRABS.pummel.anim(f), vote: f >= 5 ? [44, -84, (f - 5) / 11, 1] : null }),
    },
    forwardThrow: { // sets it down, winds up and swats it away: shared
      ...MUSE_GRABS.forwardThrow,
      anim: f => ({ ...MUSE_GRABS.forwardThrow.anim(f), tag: f >= 12 && f < 32 ? ['Shared!', 64, -82, (f - 12) / 20, META] : null }),
    },
    backThrow: { // hoists it up over its head and heaves it over backwards: unfriended
      ...MUSE_GRABS.backThrow,
      anim: f => ({ ...MUSE_GRABS.backThrow.anim(f), tag: f >= 16 && f < 36 ? ['Unfriended', -66, -76, (f - 16) / 20, '#65676b'] : null }),
    },
  },
  defense: {
    ...SNOO_MOVESET.defense,
    shield: { // doomscrolling: a giant phone stands up in front of it like a riot shield and it hunches behind it, glassy-eyed,
      // flicking the feed up its screen with a finger (in the game it shrinks, cracks, thins out and fades as the shield wears down)
      input: 'hold dodge (Shift / Z)', frames: 60,
      anim: f => {
        const hunch = { rot: 0.1, sx: 1.04, sy: 0.94, swing: [0.3, 1.25], arm: [2, 0], blink: 0.55, legs: [[-3, 0], [0, 0], [0, 0], [3, 0]], shield: 1 };
        const p = tween(f, [[0, {}], [4, hunch], [50, hunch], [57, {}], [60, {}]]);
        if (f > 4 && f < 50) p.swing = [0.3, 1.25 + 0.1 * Math.sin((f - 4) / 11.5 * Math.PI * 2)]; // a flick every post
        return { ...p, poke: f > 2 && f < 54, scroll: f, wear: Math.min(1, Math.max(0, (f - 4) / 46)) }; // preview wears it out over the hold (the game uses the real shield health)
      },
    },
    shieldBreak: { // the feed scatters, it pops up flailing and lands dizzy: Instagram tells it to take a break
      ...SNOO_MOVESET.defense.shieldBreak, oops: [['Time for a break?', "you've been scrolling for a while"]],
      anim: f => ({ ...SNOO_MOVESET.defense.shieldBreak.anim(f), oopsMsg: ['Time for a break?', "you've been scrolling for a while"] }),
    },
  },
  reactions: {
    ...SNOO_MOVESET.reactions,
    respawn: { // lowered in on the platform, saying hi
      ...SNOO_MOVESET.reactions.respawn, say: "Hi, I'm Muse!",
      anim: f => { const p = SNOO_MOVESET.reactions.respawn.anim(f); return { ...p, say: ["Hi, I'm Muse!", p.say[1]] }; },
    },
  },
};
