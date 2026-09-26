// Touch controls, auto-loaded on coarse-pointer devices (?touch forces them on).
// The pad dispatches the same keydown/keyup the game already listens for, so dash taps,
// tilt windows and input buffers all keep working — no second input path to maintain.
if (matchMedia('(pointer: coarse)').matches || location.search.includes('touch')) {
  const BTN = [['dodge', 'heavy', 'special'], ['grab', 'jump', 'attack']];
  const LABEL = { jump: 'jump', attack: 'light', heavy: 'heavy', special: 'spec', grab: 'grab', dodge: 'dodge' };
  const DEAD = 0.35; // how far off centre the stick has to lean before a direction registers (so 8-way, with a rest zone)

  document.head.appendChild(document.createElement('style')).textContent = `
    body { touch-action: manipulation; }
    #pad { position: fixed; inset: 0; z-index: 9; pointer-events: none; user-select: none; -webkit-user-select: none;
      font: 700 14px Caveat, cursive; color: #f2ede2; }
    #pad .cl { position: absolute; bottom: max(3vh, env(safe-area-inset-bottom)); display: grid; gap: 7px; }
    #pad .cl.l { left: max(3vw, env(safe-area-inset-left)); }
    #pad .cl.r { right: max(3vw, env(safe-area-inset-right)); }
    #pad .b, #pad .pb, #stick { pointer-events: auto; display: grid; place-items: center; border-radius: 50%;
      background: #26231fbb; border: 2px solid #f2ede299; -webkit-tap-highlight-color: transparent; }
    #pad .b { width: 15vmin; height: 15vmin; max-width: 76px; max-height: 76px; }
    #pad .b.on { background: #e0523add; border-color: #f2ede2; }
    #stick { width: 34vmin; height: 34vmin; max-width: 150px; max-height: 150px; background: #26231f88; border-color: #f2ede255; }
    #knob { width: 44%; height: 44%; border-radius: 50%; background: #26231fdd; border: 2px solid #f2ede2aa; }
    #knob.on { background: #e0523add; border-color: #f2ede2; }
    #pad .pb { position: absolute; top: max(2vh, env(safe-area-inset-top)); right: max(3vw, env(safe-area-inset-right));
      width: 42px; height: 42px; font-size: 18px; }
    #rotate { display: none; position: fixed; z-index: 9; left: 50%; bottom: 6vh; transform: translateX(-50%);
      padding: 8px 16px; border-radius: 20px; background: #26231fdd; color: #f2ede2; font: 700 18px Caveat, cursive; }
    @media (orientation: portrait) { #rotate { display: block } }`;

  const pad = Object.assign(document.createElement('div'), { id: 'pad' });
  const el = (tag, parent, props) => parent.appendChild(Object.assign(document.createElement(tag), props));
  const stick = el('div', el('div', pad, { className: 'cl l' }), { id: 'stick' });
  const knob = el('div', stick, { id: 'knob' });
  const right = el('div', pad, { className: 'cl r' });
  right.style.gridTemplateColumns = `repeat(${BTN[0].length}, auto)`;
  for (const a of BTN.flat()) el('div', right, { className: 'b', textContent: LABEL[a] }).dataset.act = a;
  el('div', pad, { className: 'pb', textContent: '⏸' })
    .addEventListener('pointerdown', e => { e.preventDefault(); dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' })); });
  document.body.appendChild(pad);
  el('div', document.body, { id: 'rotate', textContent: '↻ turn your phone sideways' });

  // one finger on the stick (→ up to two directions at once, for diagonals), one finger per button;
  // `down` is what's currently held, so the diff against it decides which key events to fire.
  const held = new Map(); // pointerId → action, for the buttons
  let stickId = null, dirs = new Set(), down = new Set();
  const code = a => binds[0][a] || binds[1][a];
  const actAt = e => document.elementFromPoint(e.clientX, e.clientY)?.dataset.act;
  function sync() {
    const now = new Set([...held.values(), ...dirs].filter(Boolean));
    for (const a of down) if (!now.has(a)) dispatchEvent(new KeyboardEvent('keyup', { code: code(a) }));
    for (const a of now) if (!down.has(a)) dispatchEvent(new KeyboardEvent('keydown', { code: code(a) }));
    down = now;
    for (const b of pad.querySelectorAll('.b')) b.classList.toggle('on', now.has(b.dataset.act));
    knob.classList.toggle('on', dirs.size > 0);
  }
  function aim(e) { // knob follows the finger, clamped to the base; which way it leans is the direction(s) held
    const r = stick.getBoundingClientRect(), R = r.width / 2;
    let dx = (e.clientX - r.left - R) / R, dy = (e.clientY - r.top - R) / R;
    const d = Math.hypot(dx, dy); if (d > 1) { dx /= d; dy /= d; }
    knob.style.transform = `translate(${dx * R * 0.55}px, ${dy * R * 0.55}px)`;
    dirs = new Set([dx < -DEAD && 'left', dx > DEAD && 'right', dy < -DEAD && 'up', dy > DEAD && 'down'].filter(Boolean));
  }
  function release() { stickId = null; dirs = new Set(); knob.style.transform = ''; }

  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { e.target.setPointerCapture(e.pointerId) } catch {}
    if (stick.contains(e.target)) { stickId = e.pointerId; aim(e); } else held.set(e.pointerId, actAt(e));
    sync();
  });
  pad.addEventListener('pointermove', e => {
    if (e.pointerId === stickId) aim(e); else if (held.has(e.pointerId)) held.set(e.pointerId, actAt(e)); else return;
    sync();
  });
  for (const t of ['pointerup', 'pointercancel']) pad.addEventListener(t, e => {
    if (e.pointerId === stickId) release(); else held.delete(e.pointerId);
    sync();
  });

  // the pad is only up during a fight; menus and character select are already tap-driven (the canvas click handler)
  (function show() {
    requestAnimationFrame(show);
    const hide = paused;
    if (hide === (pad.style.display === 'none')) return;
    pad.style.display = hide ? 'none' : '';
    if (hide) { held.clear(); release(); sync(); }
  })();
}
