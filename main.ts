import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, sep, join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

// The entry is a static app. Its only build operation is deterministic packaging.
const sourceDirectory = import.meta.dirname;
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const location = relative(sourceDirectory, destination);
if (!location || (!location.startsWith('..' + sep) && location !== '..' && !location.startsWith(sep))) {
  throw new Error('Choose an output directory outside this repository.');
}
await mkdir(destination, { recursive: true });
for (const directory of ['app', 'screenshots']) {
  await cp(join(sourceDirectory, directory), join(destination, directory), { recursive: true, dereference: false });
}
const dossier = buildDossier(destination, {
  app_max_files: 993, app_max_bytes: 48 * 1024 * 1024, app_path_max_bytes: 1000,
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
});
if (dossier.byteLength > 1.5 * 1024 * 1024) throw Error('Dossier exceeds 1.5 MiB');
await writeFile(join(destination, 'dossier.json'), dossier);
console.log(`Static app packaged; dossier.json ${dossier.byteLength} bytes`);
