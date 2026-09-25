// Muse's moveset (drawn by muse.js): Snoo's body moves (snoo-moveset.js, loaded first), which fit the same rig of stretchy stubby
// arms and little feet; muse.js draws likes and hearts where Snoo hands out votes. No specials, smashes, grabs or shield yet (off in
// the game), and so no shield break; the dodges are Snoo's too.
const MUSE_MOVESET = {
  movement: SNOO_MOVESET.movement, groundAttacks: SNOO_MOVESET.groundAttacks, aerials: SNOO_MOVESET.aerials, ledge: SNOO_MOVESET.ledge,
  defense: Object.fromEntries(Object.entries(SNOO_MOVESET.defense).filter(([k]) => !k.startsWith('shield'))),
  reactions: {
    ...SNOO_MOVESET.reactions,
    respawn: { // lowered in on the platform, saying hi
      ...SNOO_MOVESET.reactions.respawn, say: "Hi, I'm Muse!",
      anim: f => { const p = SNOO_MOVESET.reactions.respawn.anim(f); return { ...p, say: ["Hi, I'm Muse!", p.say[1]] }; },
    },
  },
};
