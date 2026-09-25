// headless check of the CPUs: `node tools/cpu-check.js`. Loads the game with a stand-in canvas (that throws where a real one would, e.g. on
// a negative radius), then plays CPU vs CPU (a brain on P1 too): every fighter against every fighter, hard vs medium and AI trained vs hard, each side once,
// plus random 1–3 CPU brawls drawn every few frames (teams, sides picked at random, and free-for-alls). Fails on any error, if a level stops beating the one below it, or if the CPUs self-destruct
// (KO'd with no hit taken in the 4 s before) more than now and then
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => fs.readFileSync(path.join(root, m[1]), 'utf8'));
const stub = `var noop = () => {}, bad = (n, ...r) => { if (r.some(v => !(v >= 0))) throw new Error(n + ': radius ' + r); };
var checks = { arc: (x, y, r) => bad('arc', r), ellipse: (x, y, rx, ry) => bad('ellipse', rx, ry), createRadialGradient: (a, b, r0, c, d, r1) => (bad('createRadialGradient', r0, r1), { addColorStop: noop }), roundRect: (x, y, w, h, r) => bad('roundRect', ...[].concat(r ?? 0)),
  measureText: () => ({ width: 10, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 10, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 0 }), getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }), getImageData: () => ({ data: new Uint8ClampedArray(4) }) };
var ctxStub = new Proxy({}, { get: (t, k) => k in t ? t[k] : checks[k] || (String(k).startsWith('create') ? () => ({ addColorStop: noop }) : noop), set: (t, k, v) => (t[k] = v, true) });
var fakeCanvas = () => ({ style: {}, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }), addEventListener: noop });
var document = { getElementById: fakeCanvas, createElement: fakeCanvas }, window = globalThis, addEventListener = noop, requestAnimationFrame = noop, location = {}, Path2D = function () {};`;
const check = `
let hardWins = 0, trainedWins = 0, games = 0, kos = 0, sds = 0, errors = [];
const lastHit = new Map(), _hitBag = hitBag, _ko = ko;
hitBag = function (b, ...a) { const r = _hitBag(b, ...a); if (r && b.c) lastHit.set(b.c, tick); return r; };
ko = function () { kos++; if (tick - (lastHit.get(cur) ?? -1e9) > 240) sds++; return _ko(); };
function play(p1, p1Level, cpus, levels, draw, m = 'teams', s = []) {
  fighter = FIGHTER[p1]; rolled = cpus; lvls = levels; mode = m; sides = s; restart(); setPaused(false); human.brain = cpuBrain(p1Level);
  try { for (let i = 0; i < 60 * 60 * 4 && !paused; i++) { update(STEP); if (draw && i % 7 === 0) render(i / 60); } }
  catch (e) { errors.push(p1 + ' vs ' + cpus.join('+') + ': ' + e.message); }
  return over; // 'win' = P1's side won
}
for (const a of ROSTER) for (const b of ROSTER) {
  hardWins += play(a, 5, [b], [3]) === 'win'; hardWins += play(a, 3, [b], [5]) === 'lose'; // (levels: 3 medium, 5 hard, 6 AI trained)
  trainedWins += play(a, 6, [b], [5]) === 'win'; trainedWins += play(a, 5, [b], [6]) === 'lose'; games += 2;
}
const pick = list => list[Math.floor(Math.random() * list.length)];
for (let i = 0; i < 60; i++) { const n = 1 + i % 3; play(pick(ROSTER), i % LVL.length, Array.from({ length: n }, () => pick(ROSTER)), Array.from({ length: n }, () => Math.floor(Math.random() * LVL.length)), true, i % 3 ? 'teams' : 'ffa', Array.from({ length: n }, () => Math.round(Math.random()))); } // teams with random sides, and free-for-alls
console.log('hard beat medium in ' + hardWins + ' / ' + games + ' · AI trained beat hard in ' + trainedWins + ' / ' + games + ' · self-destructs ' + sds + ' / ' + kos + ' KOs · errors ' + errors.length);
for (const e of errors.slice(0, 5)) console.log('  ' + e);
if (errors.length || hardWins < games * 0.8 || trainedWins < games * 0.8 || sds > kos * 0.02) { console.log('FAIL'); process.exitCode = 1; } else console.log('ok');
`;
(0, eval)(stub + srcs.join('\n;\n') + '\n;\n' + html.match(/<script>\n([\s\S]*?)<\/script>/)[1] + '\n;\n' + check);
