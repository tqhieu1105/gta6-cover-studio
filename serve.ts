// Start an offline-friendly static server for the poster studio.
// The server deliberately binds to loopback and exposes only app/.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicRoot=resolve(fileURLToPath(new URL('./app',import.meta.url)));
const argumentsList=process.argv.slice(2);
const portPosition=argumentsList.indexOf('--port');
const candidate=portPosition<0?8080:Number(argumentsList[portPosition+1]);
const port=Number.isInteger(candidate)&&candidate>0&&candidate<65536?candidate:8080;
const contentTypes={
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml',
  '.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8',
};

createServer((request,response)=>{
  let path;
  try { path=decodeURIComponent(new URL(request.url||'/', 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Invalid path.');return; }
  if(path.endsWith('/'))path+='index.html';
  const file=resolve(join(publicRoot,normalize(path)));
  if(file!==publicRoot&&!file.startsWith(publicRoot+sep)){response.writeHead(403).end('Outside app/.');return;}
  let size;
  try { const info=statSync(file);if(!info.isFile())throw Error('not file');size=info.size; }
  catch { response.writeHead(404).end('Not found.');return; }
  response.writeHead(200,{
    'content-type':contentTypes[extname(file).toLowerCase()]||'application/octet-stream',
    'content-length':size,'cache-control':'no-store','x-content-type-options':'nosniff',
  });
  if(request.method==='HEAD')response.end();else createReadStream(file).pipe(response);
}).listen(port,'127.0.0.1',()=>process.stdout.write(`Poster studio ready at http://localhost:${port}\n`));
