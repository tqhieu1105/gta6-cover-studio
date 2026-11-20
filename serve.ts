import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, relative, extname, isAbsolute, sep } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { port: { type: 'string', default: '8080' } } });
const requestedPort = Number(values.port);
if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw Error('Invalid port');
const appDirectory = resolve(import.meta.dirname, 'app');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};
function reject(response, code) { response.writeHead(code).end(); }
const service = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.setHeader('Allow', 'GET, HEAD'); reject(response, 405); return;
  }
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    file = resolve(appDirectory, '.' + (pathname === '/' ? '/index.html' : pathname));
    const local = relative(appDirectory, file);
    if (isAbsolute(local) || local === '..' || local.startsWith('..' + sep)) { reject(response, 404); return; }
  } catch { reject(response, 400); return; }
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) { reject(response, 404); return; }
  response.writeHead(200, {
    'Content-Type': mime[extname(file)] || 'application/octet-stream',
    'Content-Length': info.size, 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; object-src 'none'",
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).on('error', () => response.destroy()).pipe(response);
});
service.listen(requestedPort, '127.0.0.1', () => {
  const bound = service.address();
  if (bound && typeof bound === 'object') console.log(`Neon Tide http://127.0.0.1:${bound.port}`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { service.close(); });
