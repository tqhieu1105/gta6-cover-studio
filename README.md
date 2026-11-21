# Neon Tide / The Cover Studio

[![Bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/rank.svg)](https://make.fun/competitions/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/tqhieu1105/gta6-cover-studio/reward.svg)](https://make.fun/competitions/gta6-cover-art-01)

Make an original coastal poster with your photos. Six fictional sample subjects open in a live collage; import pictures from your device, write your own title and cast roles, choose a grade, and download a PNG.

## Use the studio

Serve the app/ directory with a static HTTP server and open it in desktop Chrome. The repository includes **node serve.ts --port 8080** as a convenience. Visit http://127.0.0.1:8080 while it runs. No package installation or build step is required.

1. Choose **Import photos** or drop images into the library. Multiple images fill distinct panels; one image can fill every panel.
2. Select a panel in the art or the strip below it. Drag to position, scroll to zoom, use the crop sliders, or flip the photo. The Fit command centers a new import; the bundled demos have hand-authored focus regions.
3. Edit the title, script subtitle, tagline, edition and each role. Try eight panel layouts, six grades and three title finishes. Undo and redo retain your design edits.
4. Download Wide **1920 × 1080**, Portrait **1080 × 1350** or Square **1080 × 1080**. **Export collection** composes all three formats from the current edit.

Photos are decoded locally and retained in browser memory. The app contains no upload, telemetry, remote font or network image. The preview and PNG downloads use the same compositor. The browser may ask permission for three simultaneous downloads.

## Original art and licensed assets

The panel geometry, main display alphabet, chrome treatment, coast, palms, skyline, coupe, production marks and sample silhouette are implemented in the app. No game logo, font, character or official artwork is used.

The images boulevard.jpg and pier.jpg are the synthetic photos supplied by the competition starter and remain unchanged. The four additional fictional adult portraits are local derivatives of David Beniaguev's MIT-licensed [SFHQ-T2I demonstration sheets](https://github.com/SelfishGene/SFHQ-T2I-dataset):

- Velvet: Lighting, source rectangle (2524, 2528)–(2975, 2970).
- Night Shift: Facial Hair, source rectangle (1027, 268)–(1479, 706).
- Insider: Lighting, source rectangle (4511, 3063)–(4980, 3527).
- Switchboard: Hair Style × Sex, source rectangle (516, 1369)–(990, 1765).

The studio's optional scenic cutout applies only to the supplied Velvet sample. Imported pictures retain their full image; no general segmentation or face-recognition claim is made. Asset attribution and permission are in app/samples/LICENSE.txt. Yellowtail Regular, used for the script subtitle, is shipped with its Apache 2.0 license and notice under app/fonts/. The main application is MIT-licensed; see LICENSE.

## Reproduce the entry

Run **node main.ts** to package the static app, four screenshots and dossier.json into /output. For another location, set MAKEFUN_OUTPUT_DIR to a directory outside the repository. The entrypoint uses only Node's standard library and the unchanged kit copy of vendor/makefun-app.ts.

Run **node tools/verify.mjs** for a bounded headless Chrome session. It checks real local imports, unique multi-photo assignment, independent crops and role fields, history, crop gestures, live text, title/face clearance and exact downloads in all three formats. It also records browser exceptions and any request outside the local server.

Run **node tools/capture.mjs** to recreate the screenshot states defined in shots.json through actual controls. Cover captures are the app's own canvas scaled to the allowed screenshot bounds; the editor and format collection are browser screenshots. Every capture is constrained to 256 KiB with a 480px minimum short side and a 1280px maximum long side.
