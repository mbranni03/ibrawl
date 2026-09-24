// Grok's moveset (drawn by grok.js). Movement is Claw'd's (clawd-moveset.js, loaded first), except that a ball with no legs
// gets about by bouncing: two hops a loop, squashed where it lands, stretched on the way up, rocking into each one.
const bounce = (height, lean, sx = 1, sy = 1) => (f, n) => {
  const u = 2 * f / n % 1, h = Math.sin(Math.PI * u), c = (1 - h) ** 3; // h = 0 on the floor … 1 at the top · c = the landing squash
  return { y: -height * h, sx: sx * (1 + 0.1 * c - 0.03 * h), sy: sy * (1 - 0.14 * c + 0.05 * h), rot: lean + 0.05 * Math.sin(2 * Math.PI * u) };
};
const GROK_MOVESET = {
  movement: {
    ...MOVESET.movement,
    walk: { ...MOVESET.movement.walk, anim: bounce(6, 0.06) },
    run: { ...MOVESET.movement.run, anim: (f, n) => ({ ...MOVESET.movement.run.anim(f, n), ...bounce(10, 0.18)(f, n) }) }, // keeps the run's dust kicks
    crouchWalk: { ...MOVESET.movement.crouchWalk, anim: bounce(1.5, 0.05, 1.16, 0.68) },
  },
};
