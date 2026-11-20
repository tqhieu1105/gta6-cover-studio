import * as filesystem from 'node:fs';
import * as paths from 'node:path';
import {fileURLToPath as localPath} from 'node:url';
import {buildDossier} from './vendor/makefun-app.ts';

// Package the exact offline files and app-produced screenshots, without timestamps.
const entryDirectory=localPath(new URL('.',import.meta.url));
const destination=paths.resolve(process.env.MAKEFUN_OUTPUT_DIR??'/output');
filesystem.mkdirSync(destination,{recursive:true});
for(const directory of ['app','screenshots']){
  const source=paths.join(entryDirectory,directory);
  filesystem.cpSync(source,paths.join(destination,directory),{recursive:true});
}
const dossier=buildDossier(destination,{
  app_max_files:993,
  app_max_bytes:48*1024*1024,
  app_path_max_bytes:1000,
  text_max_bytes:160*1024,
  screenshots:{max:4,max_bytes:256*1024},
});
filesystem.writeFileSync(paths.join(destination,'dossier.json'),dossier);
console.log('Packaged Neon Tide: app, screenshots and deterministic dossier.');
