import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';

const option = process.argv.indexOf('--port');
const port = option === -1 ? 8080 : Number(process.argv[option + 1]);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Use --port followed by a port number.');
const appDirectory = await realpath(resolve(import.meta.dirname, 'app'));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
function permitted(path) {
  const suffix = relative(appDirectory, path);
  return !isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep);
}
const server = createServer(async (request, response) => {
  function empty(status) {
    if (!response.headersSent) response.writeHead(status, { 'Content-Length': 0 });
    response.end();
  }
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.setHeader('Allow', 'GET, HEAD');
    empty(405);
    return;
  }
  try {
    const path = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    if (path.includes('\0') || path.includes('\\')) { empty(400); return; }
    const requested = resolve(appDirectory, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!permitted(requested)) { empty(404); return; }
    const canonical = await realpath(requested);
    if (!permitted(canonical)) { empty(404); return; }
    const info = await stat(canonical);
    if (!info.isFile()) { empty(404); return; }
    response.writeHead(200, {
      'Content-Type': mime[extname(canonical).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; base-uri 'self'; object-src 'none'",
    });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(canonical);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch { empty(404); }
});
server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  console.log('Studio listening at http://127.0.0.1:' + address.port);
});
['SIGINT', 'SIGTERM'].forEach(signal => process.once(signal, () => {
  server.closeAllConnections();
  server.close();
}));
