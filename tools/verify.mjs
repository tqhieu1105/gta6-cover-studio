// Exercise real editor controls, local uploads and downloaded PNG bytes in Chrome.
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { withChrome, KIT, pause } from "./chrome.mjs";
const downloads = resolve(KIT, "export-proof");
mkdirSync(downloads, { recursive: true });
const root = resolve(import.meta.dirname, "..");
const report = { checks: [], exports: [], requests: [], errors: [] };
function assert(condition, message) {
  if (!condition) throw Error(message);
  report.checks.push(message);
}
await withChrome(async ({ call, on, evaluate, navigate }) => {
  await call("Network.enable");
  on("Network.requestWillBeSent", (data) => {
    if (/^https?:/.test(data.request.url))
      report.requests.push(data.request.url);
  });
  on("Runtime.exceptionThrown", (data) =>
    report.errors.push(data.exceptionDetails.text),
  );
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloads,
    eventsEnabled: true,
  });
  await navigate();
  assert(
    await evaluate(
      "afterHours.photos.length===2 && afterHours.state.panels.length===5",
    ),
    "Demo starts with two photos and five editable panels",
  );
  // Switching every layout and grade catches empty or incompatible aspect states.
  for (const layout of [
    "alibi",
    "crossfire",
    "coastline",
    "triptych",
    "split",
    "mosaic",
  ]) {
    await evaluate(
      `document.querySelector('[data-layout="${layout}"]').click()`,
    );
    for (const format of ["square", "portrait", "landscape"]) {
      await evaluate(
        `document.querySelector('[data-format="${format}"]').click()`,
      );
      await pause(35);
      const dimensions = await evaluate(
        "({width:cover.width,height:cover.height,layout:afterHours.state.layout})",
      );
      assert(
        dimensions.layout === layout &&
          dimensions.width > 0 &&
          dimensions.height > 0,
        `${layout} / ${format} composes successfully`,
      );
    }
  }
  for (const grade of ["sunset", "neon", "tropic", "heat", "gold", "film"]) {
    await evaluate(`document.querySelector('[data-grade="${grade}"]').click()`);
    assert(
      await evaluate(`afterHours.state.grade==='${grade}'`),
      `${grade} grade applies`,
    );
  }
  await evaluate(
    `document.querySelector('[data-format="square"]').click();document.querySelector('[data-layout="alibi"]').click();document.querySelector('[data-grade="sunset"]').click();document.getElementById('caption').value='TEST\\nDRIVE';document.getElementById('caption').dispatchEvent(new Event('input',{bubbles:true}));`,
  );
  await pause(500);
  assert(
    await evaluate("afterHours.state.caption==='TEST\\nDRIVE'"),
    "Caption edits reach the renderer",
  );
  await evaluate("document.getElementById('undo').click()");
  assert(
    await evaluate("afterHours.state.caption==='AFTER\\nHOURS'"),
    "Undo restores the previous caption",
  );
  await evaluate("document.getElementById('redo').click()");
  assert(
    await evaluate("afterHours.state.caption==='TEST\\nDRIVE'"),
    "Redo restores edited caption",
  );
  // Use the actual file input, rather than replacing the internal photo store.
  const documentNode = await call("DOM.getDocument");
  const fileInput = await call("DOM.querySelector", {
    nodeId: documentNode.root.nodeId,
    selector: "#photos",
  });
  await call("DOM.setFileInputFiles", {
    nodeId: fileInput.nodeId,
    files: [resolve(root, "app/samples/boulevard.jpg")],
  });
  for (let i = 0; i < 50; i++) {
    await pause(100);
    if (await evaluate("afterHours.photos.length===3")) break;
  }
  assert(
    await evaluate(
      "afterHours.photos.length===3 && afterHours.state.panels.every(p=>p.photo===2)",
    ),
    "One uploaded photo automatically fills every panel",
  );
  await call("DOM.setFileInputFiles", {
    nodeId: fileInput.nodeId,
    files: [
      resolve(root, "app/samples/pier.jpg"),
      resolve(root, "app/samples/boulevard.jpg"),
    ],
  });
  for (let i = 0; i < 50; i++) {
    await pause(100);
    if (await evaluate("afterHours.photos.length===5")) break;
  }
  assert(
    await evaluate(
      "afterHours.photos.length===5 && afterHours.state.panels[0].photo===3 && afterHours.state.panels[1].photo===4",
    ),
    "Multiple uploaded photos cycle through the panels",
  );
  await evaluate(
    "document.querySelector('[data-panel=\"1\"]').click();document.getElementById('zoom').value=160;document.getElementById('zoom').dispatchEvent(new Event('input',{bubbles:true}));",
  );
  assert(
    await evaluate("afterHours.state.panels[1].zoom===1.6"),
    "Per-panel zoom control updates crop",
  );
  const rectangle = await evaluate(
    "(()=>{const r=cover.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};})()",
  );
  const x = rectangle.x + rectangle.w * 0.72,
    y = rectangle.y + rectangle.h * 0.35;
  await call("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await call("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: x + 32,
    y: y + 21,
    button: "left",
    buttons: 1,
  });
  await call("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: x + 32,
    y: y + 21,
    button: "left",
    clickCount: 1,
  });
  assert(
    await evaluate(
      "afterHours.state.panels[1].offsetX>0 && afterHours.state.panels[1].offsetY>0",
    ),
    "Dragging the actual canvas repositions the selected photo",
  );
  await evaluate(
    "document.getElementById('flipPhoto').click();document.getElementById('role').value='THE ESCAPE ARTIST';document.getElementById('role').dispatchEvent(new Event('input',{bubbles:true}));",
  );
  assert(
    await evaluate(
      "afterHours.state.panels[1].flip && afterHours.state.panels[1].role==='THE ESCAPE ARTIST'",
    ),
    "Flip and editable character tags work per panel",
  );
  await evaluate("document.getElementById('resetCrop').click()");
  assert(
    await evaluate(
      "afterHours.state.panels[1].zoom===1 && afterHours.state.panels[1].offsetX===0",
    ),
    "Reset restores the panel crop",
  );
  // Disconnect the browser network before downloading, proving exports are local.
  await call("Network.emulateNetworkConditions", {
    offline: true,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  await evaluate(
    "document.getElementById('caption').value='LOCAL\\nLEGEND';document.getElementById('caption').dispatchEvent(new Event('input',{bubbles:true}));",
  );
  for (const [format, w, h] of [
    ["square", 1080, 1080],
    ["portrait", 1080, 1350],
    ["landscape", 1920, 1080],
  ]) {
    const filename = `local-legend-${w}x${h}.png`;
    await evaluate(
      `document.querySelector('[data-export="${format}"]').click()`,
    );
    for (let i = 0; i < 100; i++) {
      await pause(100);
      if (readdirSync(downloads).includes(filename)) break;
    }
    const bytes = readFileSync(resolve(downloads, filename));
    assert(
      bytes.subarray(1, 4).toString() === "PNG" &&
        bytes.readUInt32BE(16) === w &&
        bytes.readUInt32BE(20) === h,
      `Real downloaded ${format} PNG is ${w} × ${h}`,
    );
    const rendered = await evaluate(
      `afterHours.renderExport('${format}').toDataURL('image/png').split(',')[1]`,
    );
    assert(
      bytes.equals(Buffer.from(rendered, "base64")),
      `${format} download exactly matches the app renderer`,
    );
    report.exports.push({
      filename,
      width: w,
      height: h,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  assert(
    report.requests.every((url) => url.startsWith("http://127.0.0.1:8317/")),
    "App makes no requests outside its own local static files",
  );
  assert(report.errors.length === 0, "No uncaught browser exceptions");
});
writeFileSync(
  resolve(KIT, "verification-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
