import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

export const root = resolve(import.meta.dirname, '..');
export const research = resolve(root, '../research');
export const projectRoot = root;
export const researchFolder = research;
const pause = duration => new Promise(done => setTimeout(done, duration));

async function poll(read, label, timeout = 14000) {
  const deadline = Date.now() + timeout;
  let lastError;
  do {
    try {
      const value = await read();
      if (value) return value;
    } catch (error) { lastError = error; }
    await pause(80);
  } while (Date.now() < deadline);
  throw Error('Timed out: ' + label + (lastError ? ' (' + lastError.message + ')' : ''));
}

function launch(command, args, stdout = false) {
  return spawn('timeout', ['--kill-after=2', '115', command, ...args], {
    cwd: root,
    detached: true,
    stdio: ['ignore', stdout ? 'pipe' : 'ignore', 'ignore'],
    env: { ...process.env, CURSOR_AGENT: '' },
  });
}

async function stop(process) {
  if (!process?.pid || process.exitCode !== null) return;
  try { globalThis.process.kill(-process.pid, 'SIGTERM'); } catch {}
  await pause(130);
  try { globalThis.process.kill(-process.pid, 'SIGKILL'); } catch {}
}

export async function withChrome(task) {
  const profile = await mkdtemp(join(tmpdir(), 'gta6-cover-chrome-'));
  const outstanding = new Map();
  const listeners = new Map();
  let server, browser, socket;
  let serial = 0;

  try {
    server = launch(process.execPath, [join(root, 'serve.ts'), '--port', '0'], true);
    let serverOutput = '';
    server.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
    const origin = await poll(() => serverOutput.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0], 'static server');
    const installed = '/opt/google/chrome/chrome';
    const executable = process.env.CHROME_BIN || await access(installed).then(() => installed, () => 'google-chrome');
    browser = launch(executable, [
      '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
      '--disable-extensions', '--disable-component-extensions-with-background-pages',
      '--disable-background-networking', '--disable-default-apps', '--no-first-run',
      '--no-default-browser-check', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
    ]);
    await mkdir(research, { recursive: true });
    await writeFile(join(research, 'browser-runtime.json'), JSON.stringify({
      server_pid: server.pid, browser_pid: browser.pid, origin, profile,
    }));

    const port = await poll(async () => {
      const text = await readFile(join(profile, 'DevToolsActivePort'), 'utf8');
      return Number(text.split('\n')[0]) || null;
    }, 'Chrome debugging port');
    const target = await poll(async () => {
      const response = await fetch('http://127.0.0.1:' + port + '/json/list');
      const pages = await response.json();
      return pages.find(page => page.type === 'page' && page.webSocketDebuggerUrl);
    }, 'browser page');

    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((done, reject) => {
      socket.addEventListener('open', done, { once: true });
      socket.addEventListener('error', () => reject(Error('Chrome connection failed')), { once: true });
    });
    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.id) {
        const request = outstanding.get(message.id);
        if (!request) return;
        outstanding.delete(message.id);
        clearTimeout(request.timer);
        if (message.error) request.reject(Error(message.error.message));
        else request.resolve(message.result || {});
      } else if (message.method) {
        for (const listener of listeners.get(message.method) || []) listener(message.params || {});
      }
    });
    socket.addEventListener('close', () => {
      for (const request of outstanding.values()) {
        clearTimeout(request.timer);
        request.reject(Error('Chrome connection closed'));
      }
      outstanding.clear();
    });

    function call(method, params = {}) {
      const id = ++serial;
      return new Promise((resolveRequest, rejectRequest) => {
        const timer = setTimeout(() => {
          outstanding.delete(id);
          rejectRequest(Error('Chrome command timed out: ' + method));
        }, 18000);
        outstanding.set(id, { resolve: resolveRequest, reject: rejectRequest, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const response = await call('Runtime.evaluate', {
        expression, awaitPromise: true, returnByValue: true, userGesture: true,
      });
      if (response.exceptionDetails) {
        throw Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      }
      return response.result?.value;
    }

    async function until(expression, timeout = 14000) {
      return poll(() => evaluate(expression), expression.slice(0, 90), timeout);
    }

    function on(method, callback) {
      const callbacks = listeners.get(method) || [];
      callbacks.push(callback);
      listeners.set(method, callbacks);
    }

    async function viewport(width, height) {
      await call('Emulation.setDeviceMetricsOverride', {
        width, height, deviceScaleFactor: 1, mobile: false,
      });
    }

    async function open(parameters = {}) {
      const query = new URLSearchParams({ qa: '1', ...parameters });
      await call('Page.navigate', { url: origin + '/?' + query });
      await until("document.documentElement.dataset.ready==='true' && Boolean(window.coverStudio)");
      await evaluate('document.fonts.ready.then(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))))');
    }

    await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(method => call(method)));
    return await task({ call, evaluate, viewport, open, until, on, origin });
  } finally {
    if (socket?.readyState === WebSocket.OPEN) {
      try { socket.send(JSON.stringify({ id: ++serial, method: 'Browser.close' })); } catch {}
      await pause(90);
      socket.close();
    }
    for (const request of outstanding.values()) clearTimeout(request.timer);
    await stop(browser);
    await stop(server);
    await rm(profile, { recursive: true, force: true });
  }
}

export const withBrowser = withChrome;
