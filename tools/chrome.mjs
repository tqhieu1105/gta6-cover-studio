import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');
export const research = resolve(root, '../research');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function poll(work, description, ms = 14_000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const result = await work();
    if (result) return result;
    await sleep(100);
  }
  throw Error('Timed out waiting for ' + description);
}

function background(program, args, stdout = 'ignore') {
  return spawn('timeout', ['--kill-after=3s', '100s', program, ...args], {
    detached: true, stdio: ['ignore', stdout, 'ignore'],
  });
}

async function stop(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  const ended = once(child, 'exit').catch(() => {});
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  await Promise.race([ended, sleep(450)]);
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  await Promise.race([ended, sleep(300)]);
}

export async function withChrome(work) {
  const profile = await mkdtemp(join(tmpdir(), 'neon-tide-cdp-'));
  const pending = new Map();
  const subscriptions = new Map();
  let server;
  let chrome;
  let socket;
  let sequence = 0;
  let origin;
  try {
    server = background(process.execPath, [join(root, 'serve.ts'), '--port', '0'], 'pipe');
    let startup = '';
    server.stdout.on('data', chunk => {
      startup += chunk;
      origin = startup.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    });
    await poll(() => origin, 'local static server');
    chrome = background(process.env.CHROME_BIN || '/opt/google/chrome/chrome', [
      '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
      '--disable-extensions', '--disable-component-extensions-with-background-pages',
      '--disable-background-networking', '--no-first-run', '--no-default-browser-check',
      '--force-device-scale-factor=1', '--hide-scrollbars',
      '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
    ]);
    const port = await poll(async () => {
      const file = await readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
      return Number(file.split('\n')[0]) || null;
    }, 'Chrome debug socket');
    const page = await poll(async () => {
      try {
        const listing = await fetch('http://127.0.0.1:' + port + '/json/list', { signal: AbortSignal.timeout(1300) });
        return (await listing.json()).find(target => target.type === 'page');
      } catch { return null; }
    }, 'Chrome page');

    socket = new WebSocket(page.webSocketDebuggerUrl);
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const task = pending.get(message.id);
        if (!task) return;
        pending.delete(message.id);
        clearTimeout(task.timer);
        if (message.error) task.reject(Error(message.error.message));
        else task.resolve(message.result);
      } else {
        for (const callback of subscriptions.get(message.method) ?? []) callback(message.params);
      }
    });
    await new Promise((resolve, reject) => {
      const deadline = setTimeout(() => reject(Error('Chrome socket did not open')), 6500);
      socket.addEventListener('open', () => { clearTimeout(deadline); resolve(); }, { once: true });
      socket.addEventListener('error', () => { clearTimeout(deadline); reject(Error('Chrome socket failed')); }, { once: true });
    });

    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(Error('Chrome command timed out: ' + method));
      }, 20_000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const reply = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (reply.exceptionDetails) {
        const details = reply.exceptionDetails;
        throw Error(details.exception?.description ?? details.text);
      }
      return reply.result.value;
    };
    const on = (method, callback) => {
      if (!subscriptions.has(method)) subscriptions.set(method, []);
      subscriptions.get(method).push(callback);
    };
    const until = (expression, ms) => poll(() => evaluate(expression), expression.slice(0, 115), ms);
    const viewport = (width, height) => call('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: false,
    });
    const open = async query => {
      const url = new URL('/?' + new URLSearchParams(query), origin).href;
      await call('Page.navigate', { url });
      await until(`location.href === ${JSON.stringify(url)} && document.documentElement.dataset.ready === 'true'`);
      await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    };
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    await work({ call, evaluate, on, until, viewport, open, origin });
  } finally {
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(Error('Chrome closed'));
    }
    if (socket?.readyState === WebSocket.OPEN) socket.close();
    await Promise.all([stop(chrome), stop(server)]);
    await rm(profile, { recursive: true, force: true, maxRetries: 2 });
  }
}
