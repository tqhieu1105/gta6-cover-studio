import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const outputRoot = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const inputRoot = import.meta.dirname;
const folders = ['app', 'screenshots'];
for (const name of folders) {
  const location = relative(inputRoot, outputRoot);
  if (!location || location === name || location.startsWith(name + sep)) {
    throw Error('Set MAKEFUN_OUTPUT_DIR outside the source app and screenshots.');
  }
}

mkdirSync(outputRoot, { recursive: true });
for (const name of folders) {
  const destination = join(outputRoot, name);
  cpSync(join(inputRoot, name), destination, { recursive: true });
}

const dossierCaps = {
  app_max_files: 993,
  app_max_bytes: 50_331_648,
  app_path_max_bytes: 1_000,
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
};
const bytes = buildDossier(outputRoot, dossierCaps);
writeFileSync(join(outputRoot, 'dossier.json'), bytes);
console.log(`Dossier written (${bytes.byteLength} bytes).`);
