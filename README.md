# Neon Tide Cover Studio

[![Bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/rank.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/reward.svg)](https://make.fun/competitions/gta6-cover-art-01)

Build the cast for a fictional South Florida crime film. Neon Tide combines five photo panels with bold, angled lettering and a drawn waterfront. It runs offline as a static site in desktop Chrome.

Serve the `app/` directory with any static server, or run `node serve.ts` and open `http://127.0.0.1:8080` with Node.js 22.18 or later.

- Drop one or more photos onto **Add photos**. New photos fill the panels as soon as they load. You can also fill the panels from the whole library or click a thumbnail to assign it to the selected panel.
- Click a panel and drag inside it to position the photo. Scroll or use the zoom slider to get closer. The inspector lets you flip the photo, set its crop precisely, and write a role label.
- Edit the title, subtitle, tagline, and edition alongside the preview. Try eight layouts, six color grades, and three title finishes. Undo and redo keep track of changes. Switching to a smaller layout keeps the hidden panel edits for when you switch back.
- Export directly as a **1920 × 1080**, **1080 × 1350**, or **1080 × 1080** PNG. The preview and all three downloads use the same drawing code.

Your files stay in memory on your device. The page needs no account or external resources.

## Verify and package

Run `timeout 100 node tools/verify.mjs` to check local photo imports, cropping, caption changes, and all three downloaded PNGs in Chrome. Set `CHROME_BIN` if your Chrome executable is installed in a nonstandard location. Run `timeout 100 node tools/capture.mjs` to rebuild the dossier screenshots. Use `MAKEFUN_OUTPUT_DIR=/tmp/neon-tide-output node main.ts` to copy the app and captures into the output and build the dossier.

## Sample photographs

`boulevard.jpg` and `pier.jpg` are model-generated samples supplied by the competition kit. The other photographs are original crops and color adjustments of fictional adults from David Beniaguev’s SFHQ-T2I demonstration sheets. Night Shift comes from the Facial Hair sheet (row 1, cell 3), Velvet from Lighting (row 5, cell 6), and Switchboard from Glasses Style (row 6, cell 10). See the [source sheets](https://github.com/SelfishGene/SFHQ-T2I-dataset) and the [dataset license](https://www.kaggle.com/datasets/selfishgene/sfhq-t2i-synthetic-faces-from-text-2-image-models).

The poster layout, scenery, and display lettering are original. The repository's MIT license covers the app source.

MIT License for the SFHQ-T2I sample photographs

Copyright (c) David Beniaguev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
