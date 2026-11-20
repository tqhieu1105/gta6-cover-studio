// Screenshot mode calls the same renderPoster as PNG export; no mockup overlays.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { withChrome, KIT, pause } from "./chrome.mjs";
const root = resolve(import.meta.dirname, "..");
await withChrome(async ({ call, evaluate, navigate }) => {
  const shots = JSON.parse(readFileSync(resolve(root, "shots.json"), "utf8"));
  const output = process.argv.includes("--final")
    ? resolve(root, "screenshots")
    : resolve(KIT, "reviews");
  mkdirSync(output, { recursive: true });
  for (const shot of shots) {
    await call("Emulation.setDeviceMetricsOverride", {
      width: shot.w,
      height: shot.h,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await navigate(shot.query);
    await pause(100);
    const screenshot = await call("Page.captureScreenshot", {
      format: "jpeg",
      quality: 86,
      captureBeyondViewport: false,
    });
    const bytes = Buffer.from(screenshot.data, "base64");
    if (bytes.length > 262144)
      throw Error("Screenshot exceeds 256 KiB: " + shot.name);
    writeFileSync(resolve(output, shot.name), bytes);
    const dimensions = await evaluate(
      "({width:afterHours.renderExport(afterHours.state.format).width,height:afterHours.renderExport(afterHours.state.format).height})",
    );
    console.log(shot.name, bytes.length, "bytes", dimensions);
  }
});
