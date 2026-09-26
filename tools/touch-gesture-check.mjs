// run: node tools/touch-gesture-check.mjs   (needs Chrome at the path below)
// real touch input through the Chrome DevTools Protocol, so the browser's own gesture handling (scroll/pan → pointercancel) is in play
import { spawn } from 'node:child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', PORT = 9333;
const url = new URL('../index.html?touch', import.meta.url).href;
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${(await import('node:os')).tmpdir()}/ibrawl-touch-check`, 'about:blank'], { stdio: 'ignore' });
const wait = ms => new Promise(r => setTimeout(r, ms));
let target; for (let i = 0; i < 50 && !target; i++) { await wait(100); try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}; ws.onmessage = m => { const d = JSON.parse(m.data); pending[d.id]?.(d); };
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const js = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 700, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url }); await wait(1500);
await js(`setPaused(false); window.log = []; for (const t of ['keydown', 'keyup']) addEventListener(t, e => log.push((t === 'keydown' ? '+' : '-') + e.code));
  addEventListener('pointercancel', () => log.push('CANCEL'), true); 0`);
await wait(200);
const r = await js(`(r => [r.left + r.width / 2, r.top + r.height / 2, r.width / 2])(document.getElementById('stick').getBoundingClientRect())`); if (!r) { console.log('no stick:', await js('document.title + " " + !!window.setPaused + " " + location.href')); process.exit(1); }
const [cx, cy, R] = r, touch = (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
await touch('touchStart', cx, cy);
for (let k = 1; k <= 10; k++) { await touch('touchMove', cx + R * k / 10, cy); await wait(16); } // a thumb sliding right, one step a frame
const mid = await js('log.slice()');
await touch('touchEnd'); await wait(50);
const end = await js('log.slice()');
const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
ok(`drag holds right (got ${mid.join(' ') || 'nothing'})`, mid.includes('+KeyD') && !mid.includes('CANCEL'));
ok(`lift releases it (got ${end.join(' ')})`, end.at(-1) === '-KeyD');

// a tap on the home menu still clicks through to the game (touch-action: none only stops pans / zooms, not taps)
await js('goHome(); 0'); await wait(100);
const [tx, ty] = await js(`(r => [r.left + r.width / 2, r.top + (menuY() - 10) * r.height / H])(cv.getBoundingClientRect())`);
await touch('touchStart', tx, ty); await touch('touchEnd'); await wait(100);
ok(`menu tap picks "${await js('HOME_MENU[0]')}"`, await js('picking'));
ws.close(); chrome.kill();
