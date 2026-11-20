# Neon Tide Cover Studio

[![Bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/rank.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/reward.svg)](https://make.fun/competitions/gta6-cover-art-01)

Turn your local photos into an original coastal crime-film poster. Six distinct fictional sample subjects, slanted panels, custom chrome lettering, a script subtitle and a drawn waterfront give you a starting point. Everything runs on your device in desktop Chrome.

Serve `app/` with any static HTTP server. For the included development server, use Node.js 22.18 or later and `node serve.ts --port 8080`, then open `http://127.0.0.1:8080`. The app itself has no build step, package installation, API key, account or remote dependency.

1. Choose **Add local photos**, or drop images on that area. New images immediately fill the current panels. **Auto-fill all panels** starts again from the whole library; click any library thumbnail to assign it to the active panel.
2. Click a poster panel or its strip thumbnail. Drag the photo, scroll to zoom, or use precise zoom and position sliders. Flip the image and edit its cast role. **Fit frame** restores framing; **Reset** centers the crop. Undo/redo also support Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z.
3. Write your main title, signature subtitle, tagline and edition. Try eight layouts, six grades, three title finishes and the poster-ink mix. A smaller layout keeps hidden panel edits when you switch back.
4. Download an exact **1920 × 1080**, **1080 × 1350**, or **1080 × 1080** PNG. **Export collection** shows all three freshly rendered formats, each with its download button. The live preview and downloads share `renderPoster`.

Sample focus rectangles are supplied metadata, and the scenic silhouette is a hand-traced outline for Velvet only. Imported photographs retain their backgrounds and have fully manual positioning; no automatic face recognition or general background-removal service is claimed. Your photos are read through local file input and never uploaded. Reloading the page clears the in-memory project.

The main display alphabet, diagonal layouts, skyline, palms, coupe and seal are original drawing code. No game art, logo, character or game font is included.

## Verification and dossier

- `timeout 110 node tools/verify.mjs` runs Chrome with a bounded background server. It checks six actual local-file imports, crop/history and pixel changes, title clearance, exact PNG dimensions and matching preview/export bytes, and remote requests. The report is written outside the repo under `../research/`.
- `timeout 110 node tools/capture.mjs` recreates four app-produced screenshots. Text, crop and layout states are reached through editor controls. The last image is the real export dialog.
- `MAKEFUN_OUTPUT_DIR=/tmp/neon-tide-output node main.ts` packages the static app and screenshots and writes the deterministic dossier with the unchanged starter library. Choose an output directory outside this repo.

## Asset credits

`boulevard.jpg` and `pier.jpg` are the competition starter's model-generated samples, retained unchanged. Four additional adult synthetic portraits are cropped and color-matched derivatives of David Beniaguev's SFHQ-T2I demonstration sheets, licensed MIT. The source collection is [SFHQ-T2I](https://github.com/SelfishGene/SFHQ-T2I-dataset); [Kaggle's dataset listing](https://www.kaggle.com/datasets/selfishgene/sfhq-t2i-synthetic-faces-from-text-2-image-models) identifies its MIT license.

- Velvet: Lighting sheet, row 5, cell 6; its hand-traced source-coordinate outline is in `photo.js`.
- Night Shift: Facial Hair sheet, row 1, cell 3.
- Insider: Lighting sheet, row 6, cell 10.
- Switchboard: Hair Style × Sex sheet, row 3, cell 2, crop x516–990/y1369–1765.

The image license is included in `app/samples/LICENSE.txt`. Yellowtail Regular, used for editable subtitles, is Copyright (c) 2011 Brian J. Bonislawsky DBA Astigmatic (AOETI), under Apache 2.0; its license and notice accompany the local font in `app/fonts/`. The application source is MIT licensed; see `LICENSE`.
