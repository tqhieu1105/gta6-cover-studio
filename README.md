# After Hours — Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline poster studio for your next cult classic. Turn local photos and a caption into an original, slanted multi-panel crime-movie cover with illustrated sunset scenery and dimensional chrome lettering.

## Make a cover

```sh
node serve.ts --port 8317
```

Open `http://localhost:8317` in desktop Chrome. No package installation or build step is needed. The two included demo photos were generated for make.fun's kit and are free to use.

1. Drop one or several photos into **The Cast**. They automatically fill the panels. Click a photo or drag its thumbnail onto a particular panel to assign it.
2. Choose one of six layouts. Select a panel in the cover or filmstrip, then drag the photo, scroll to zoom, adjust its position, flip it, or edit its character tag. Arrow keys nudge the selected crop; Shift makes larger nudges.
3. Edit the two-line caption and tagline, select a title finish, and choose one of six color grades. The illustrated ink pass is optional.
4. Download a full-resolution PNG with one click: **1080 × 1080**, **1080 × 1350**, or **1920 × 1080**. Each size recomposes the artwork for its aspect ratio. Undo and redo are available with the buttons or Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z outside text inputs.

All photos remain in browser memory. There are no accounts, analytics, uploads, external scripts, font files, network APIs, or runtime dependencies. Reloading clears imported photos. The title's angular Latin letterforms are original polygon outlines in `app/src/art.js`, with a system-font fallback for other characters. Palms, skyline, plane, seal, frames, and billing are also drawn in code. There are no game logos, game art, or game fonts.

## Rendering and verification

`app/src/art.js` contains the aspect-aware poster compositor, edge-preserving paint filter, split-tone grading, crop fitting, original lettering, and illustration routines. `app/src/studio.js` implements local imports, panel assignment, crop interactions, history, and PNG downloads. The live preview, full-screen preview, screenshot mode, and PNG export all call the same `renderPoster` function.

`shots.json` defines the four actual browser views used for the entry. With the server running, `node tools/capture.mjs --final` captures them using `/usr/bin/google-chrome` and the Chrome DevTools Protocol. It also checks export-canvas dimensions and PNG encoding. The script's kit path is specific to this competition workspace.

`main.ts` packages the static app and screenshots and builds the dossier using the kit's unchanged `vendor/makefun-app.ts`. For a local packaging run with Node 22.18 or later:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Licensed under MIT. Sample photographs are supplied by the official bounty kit; all application code and drawn artwork were authored for this entry.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
