import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The deliverable is a deterministic copy of the actual static application.
// Keep dossier construction identical to the kit's verifier.
const sourceRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(outputRoot, { recursive: true });
for (const assetDirectory of ['app', 'screenshots']) {
  cpSync(resolve(sourceRoot, assetDirectory), resolve(outputRoot, assetDirectory), { recursive: true });
}
const packagedPosterStudio = buildDossier(outputRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(resolve(outputRoot, 'dossier.json'), packagedPosterStudio);
