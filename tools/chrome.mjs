import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile, mkdir, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

export const root = resolve(import.meta.dirname, '..');
export const research = resolve(root, '../research');
const pause = duration => new Promise(done => setTimeout(done, duration));
async function retry(probe, label, timeout = 12000) {
  const end = performance.now() + timeout;
  do {
    const result = await probe();
    if (result) return result;
    await pause(80);
  } while (performance.now() < end);
  throw new Error(`Timed out: ${label}`);
}
function launch(binary, args, capture = false) {
  return spawn('timeout', ['--kill-after=2', '115', binary, ...args], {
    detached: true, stdio: ['ignore', capture ? 'pipe' : 'ignore', 'ignore'],
  });
}
async function endProcess(child) {
  if (!child?.pid || child.exitCode !== null) return;
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  await pause(150);
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
}
export async function withChrome(work) {
  const profile = await mkdtemp(join(tmpdir(), 'neon-tide-browser-'));
  const waiting = new Map(), listeners = new Map();
  let server, browser, websocket, requestId = 0;
  try {
    server = launch(process.execPath, [join(root, 'serve.ts'), '--port', '0'], true);
    let startup = '';
    server.stdout.on('data', chunk => { startup += chunk; });
    const origin = await retry(() => startup.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0], 'static server');
    const installed = '/opt/google/chrome/chrome';
    const binary = process.env.CHROME_BIN || await access(installed).then(() => installed, () => 'google-chrome');
    browser = launch(binary, [
      '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions',
      '--disable-component-extensions-with-background-pages', '--disable-background-networking',
      '--no-first-run', '--no-default-browser-check', '--force-device-scale-factor=1', '--hide-scrollbars',
      '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
    ]);
    await mkdir(research, { recursive: true });
    await writeFile(join(research, 'browser-runtime.json'), JSON.stringify({ serverPid: server.pid, chromePid: browser.pid, boundedSeconds: 115 }));
    const port = await retry(async () => {
      const text = await readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
      return Number(text.split('\n')[0]);
    }, 'Chrome debugging port');
    const target = await retry(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500) });
        return (await response.json()).find(item => item.type === 'page');
      } catch { return null; }
    }, 'Chrome page');
    websocket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((done, fail) => {
      const timer = setTimeout(() => fail(Error('Chrome WebSocket did not open')), 6000);
      websocket.addEventListener('open', () => { clearTimeout(timer); done(); }, { once: true });
      websocket.addEventListener('error', () => { clearTimeout(timer); fail(Error('Chrome WebSocket failed')); }, { once: true });
    });
    websocket.addEventListener('message', event => {
      const reply = JSON.parse(event.data);
      if (reply.id) {
        const pending = waiting.get(reply.id);
        if (!pending) return;
        waiting.delete(reply.id); clearTimeout(pending.timer);
        reply.error ? pending.fail(Error(reply.error.message)) : pending.done(reply.result);
      } else for (const listener of listeners.get(reply.method) || []) listener(reply.params);
    });
    const call = (method, params = {}) => new Promise((done, fail) => {
      const id = ++requestId;
      const timer = setTimeout(() => { waiting.delete(id); fail(Error(`Chrome request expired: ${method}`)); }, 18000);
      waiting.set(id, { done, fail, timer });
      websocket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    const on = (event, callback) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(callback);
    };
    const until = (expression, timeout) => retry(() => evaluate(expression), expression.slice(0, 100), timeout);
    const viewport = (width, height) => call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    const open = async params => {
      const url = `${origin}/?${new URLSearchParams(params)}`;
      await call('Page.navigate', { url });
      await until(`location.href === ${JSON.stringify(url)} && document.documentElement?.dataset.ready === 'true'`);
      await evaluate('document.fonts.ready');
      await evaluate('new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))');
    };
    await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
    return await work({ call, evaluate, on, until, viewport, open, origin });
  } finally {
    if (websocket?.readyState === WebSocket.OPEN) websocket.close();
    for (const pending of waiting.values()) clearTimeout(pending.timer);
    await Promise.allSettled([endProcess(browser), endProcess(server)]);
    await rm(profile, { recursive: true, force: true, maxRetries: 3 });
  }
}
