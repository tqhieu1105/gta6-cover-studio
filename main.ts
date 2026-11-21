import { cp, lstat, mkdir, readdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const repository = import.meta.dirname;
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
function nested(parent, child) {
  const suffix = relative(parent, child);
  return suffix === '' || (!isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep));
}
if (nested(repository, destination) || nested(destination, repository)) {
  throw Error('Choose an output directory separate from the source repository.');
}
let files = 0;
let bytes = 0;
async function packageDirectory(folder) {
  await mkdir(join(destination, folder), { recursive: true });
  for (const name of (await readdir(join(repository, folder))).sort()) {
    const path = join(folder, name);
    const info = await lstat(join(repository, path));
    if (info.isSymbolicLink()) throw Error('Entry files must not be symbolic links: ' + path);
    if (info.isDirectory()) await packageDirectory(path);
    else if (info.isFile()) {
      files++;
      bytes += info.size;
      if (files > 997 || bytes > 62 * 1024 * 1024) throw Error('Entry exceeds the packaging budget.');
      await cp(join(repository, path), join(destination, path), { dereference: false });
    } else throw Error('Unsupported filesystem entry: ' + path);
  }
}
const screenshotNames = (await readdir(join(repository, 'screenshots'))).sort();
if (screenshotNames.length < 3 || screenshotNames.length > 4 ||
    screenshotNames.some(name => !/^[1-4]-[a-z0-9-]+\.(jpg|png)$/.test(name))) {
  throw Error('Provide three or four clearly ordered PNG/JPEG dossier screenshots.');
}
const entry = await lstat(join(repository, 'app', 'index.html'));
if (!entry.isFile() || entry.isSymbolicLink()) throw Error('app/index.html must be a regular file.');
await mkdir(destination, { recursive: true });
await packageDirectory('app');
await packageDirectory('screenshots');
const dossier = buildDossier(destination, {
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
});
if (dossier.byteLength > 1.5 * 1024 * 1024) throw Error('Dossier exceeds its limit.');
await writeFile(join(destination, 'dossier.json'), dossier);
console.log('Packaged ' + files + ' files (' + bytes + ' bytes), dossier ' + dossier.byteLength + ' bytes.');
