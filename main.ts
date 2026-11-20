// Deterministic packaging for After Hours: the browser app is the complete renderer.
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repository = fileURLToPath(new URL(".", import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(destination, { recursive: true });
for (const directory of ["app", "screenshots"]) {
  cpSync(join(repository, directory), join(destination, directory), {
    recursive: true,
  });
}
const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(destination, "dossier.json"), dossier);
