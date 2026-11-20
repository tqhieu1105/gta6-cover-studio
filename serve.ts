import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const appRoot=fileURLToPath(new URL('./app/',import.meta.url));
const flag=process.argv.indexOf('--port');
const port=Number(flag>=0?process.argv[flag+1]:process.env.PORT||8317);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url||'/',`http://localhost:${port}`).pathname);
    let target=resolve(appRoot,'.'+pathname);
    if(target!==resolve(appRoot)&&!target.startsWith(resolve(appRoot)+sep)){response.writeHead(403).end();return;}
    if((await stat(target)).isDirectory())target=resolve(target,'index.html');
    const data=await readFile(target);response.writeHead(200,{'content-type':mime[extname(target)]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});
    response.end(data);
  }catch(error){response.writeHead(error.code==='ENOENT'?404:400,{'content-type':'text/plain'}).end('File unavailable');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Neon Tide http://127.0.0.1:${port}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
