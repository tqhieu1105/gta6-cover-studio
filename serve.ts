import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

const options = parseArgs({ options: { port: { type: 'string', default: '8080' } } }).values;
const port = Number(options.port);
if (!Number.isInteger(port) || port < 0 || port > 65_535) throw Error('Choose a port between 0 and 65535.');
const root = resolve(import.meta.dirname, 'app');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let filename;
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    filename = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const location = relative(root, filename);
    if (isAbsolute(location) || location === '..' || location.startsWith('..' + sep)) {
      response.writeHead(404).end();
      return;
    }
  } catch {
    response.writeHead(400).end();
    return;
  }

  const file = await stat(filename).catch(() => null);
  if (!file?.isFile()) {
    response.writeHead(404).end();
    return;
  }

  response.writeHead(200, {
    'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
    'Content-Length': file.size,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(filename).on('error', () => response.destroy()).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  if (address && typeof address === 'object') console.log('Cover Studio listening at http://127.0.0.1:' + address.port);
});
