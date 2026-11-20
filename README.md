# Neon Tide — Cover Studio

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Live rank](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/rank.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/reward.svg)](https://make.fun/competitions/gta6-cover-art-01)

Turn local photos and a caption into an original sunset crime-poster cover. Five cast photographs, slanted panels, a custom chrome alphabet, a collector's frame, role labels and a fictional production seal share one canvas compositor.

Run `node serve.ts --port 8317` and open `http://127.0.0.1:8317`. The application also works from any static server whose root is `app/`. Node 22.18+ and desktop Chrome are used for packaging and verification. The application needs no build, account, API key or network service.

1. Add one photo or a whole cast from your machine. The library reads files locally.
2. Auto-fill the photo panels, then select a panel to assign its photo and role. Drag to position, scroll to zoom, or use the inspector sliders. Flip, center and reset work independently for each panel.
3. Write your title, subtitle and tagline. Pick one of eight layouts and six grades; undo and redo cover your edits.
4. Export a PNG with one click: square **1080 × 1080**, portrait **1080 × 1350**, or wide **1920 × 1080**. Every size button can export directly. There is no watermark.

Preview, screenshots and full-size exports use `renderPoster` in `app/src/art.js`. The lettering is a hand-authored vector alphabet. Photo crop coordinates survive layout and format changes. Local photographs stay in memory and are never uploaded or persisted.

## Check and package

- `timeout 120 node tools/verify.mjs` runs real headless Chrome checks, imports four files with the native file input, changes crops and captions, exercises undo/redo, and renders every layout in all three formats. It writes the exact PNG exports to the sibling research directory.
- `timeout 90 node tools/capture.mjs` captures four screenshots from the application according to `shots.json` and checks their 256 KiB size cap.
- `MAKEFUN_OUTPUT_DIR=/tmp/neon-tide-output node main.ts` packages the offline app and its screenshots, then uses the unchanged kit library to write a deterministic dossier.

The browser helpers launch their own bounded background server and browser and close both in a `finally` block.

## Sample-photo provenance

`boulevard.jpg` and `pier.jpg` are the competition kit's permitted sample images. Three additional samples are fictional, AI-generated adults, cropped from the public SFHQ-T2I demonstration sheets by David Beniaguev (SelfishGene). They depict no real person. The dataset is distributed under the MIT license, as reported by its [Kaggle dataset page](https://www.kaggle.com/datasets/selfishgene/sfhq-t2i-synthetic-faces-from-text-2-image-models). Sources:

- `fixer.jpg`: Facial Hair sample sheet, first image row, third cell.
- `siren.jpg`: Lighting sample sheet, fifth image row, sixth cell.
- `lookout.jpg`: Glasses Style sample sheet, sixth image row, tenth cell.

The original sheets and dataset description are at [SelfishGene/SFHQ-T2I-dataset](https://github.com/SelfishGene/SFHQ-T2I-dataset). The demonstration-sheet labels are excluded from the sample images. These are reference photos users can replace; none is a borrowed cover or game asset. All poster geometry, scenery, typography, effects and interface code are original to this entry. No Rockstar logo, artwork or game font is included.

MIT License — SFHQ-T2I sample assets

Copyright (c) David Beniaguev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Application source is released under the repository's MIT license.
