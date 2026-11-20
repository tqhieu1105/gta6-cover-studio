# gta6-cover-studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Tide is a private, offline poster atelier. It composes local photographs into an original Vice-inspired key-art cover with a slanted multi-panel layout, split-tone color, hand-drawn city details and dimensional foil lettering. Preview and downloaded PNG use the same compositor.

## Run it

```sh
node serve.ts --port 8317
```

Open `http://localhost:8317` in desktop Chrome. No build or package install is required. The two kit sample photographs load automatically for the demo. Add your own photos by dropping files on the studio or using **Add your photographs**; imports stay in browser memory.

Choose from eight layouts, six color grades and three lettering finishes. Select or drag a panel to reframe it, zoom, flip the image, assign another photo, or edit its role tag. Edit the cover title, tagline, year and edition; optional poster ink, palm silhouettes and a twilight foil border are drawn directly on the canvas. Undo and redo work with the buttons or Ctrl/Cmd+Z.

Export a full-resolution PNG in one click at **1080 × 1080**, **1080 × 1350**, or **1920 × 1080**. Each export recomposes the art for its target ratio using the same renderer as the live preview. Photographs never leave the device; the app does not request a remote resource or use an external font, game artwork, logo, or wordmark.

## Source and screenshots

`app/src/art.js` contains the eight panel maps, crop geometry, poster color processing, original vector illustrations, custom outlined display alphabet, editorial seals, frames, and the shared poster compositor. `app/src/studio.js` wires local photo import, panel crops, layouts, editing, history, and PNG export. `shots.json` describes the four actual Chrome views in `screenshots/`; `tools/capture.mjs` takes those views through Chrome's DevTools Protocol and verifies each exported aspect ratio. `main.ts` packages the unchanged kit dossier library with the static app and screenshots.

The photographs in the demo are the kit's generated, freely usable examples. All lettering and illustration code is original to this repository.

## License

MIT. The included sample photographs are supplied with the make.fun competition kit.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
