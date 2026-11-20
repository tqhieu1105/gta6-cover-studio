import {
  FORMATS,
  GRADES,
  LAYOUTS,
  initialPanels,
  panelPolygons,
  gradePhoto,
  renderPoster,
  renderPanelThumbnail,
  hitTestPanel,
} from "./art.js";

const $ = (id) => document.getElementById(id);
const query = new URLSearchParams(location.search);
const state = {
  caption: "AFTER\nHOURS",
  tagline: "GOOD PEOPLE. BAD DECISIONS.",
  edition: "SUNSET EDITION",
  year: "2026",
  format: "square",
  layout: "alibi",
  grade: "sunset",
  finish: "chrome",
  intensity: 75,
  ink: true,
  details: true,
  panels: initialPanels(),
};
const photos = [];
let graded = [];
let selected = 1;
let renderPending = false;
let history = [];
let future = [];
let commitTimer;
let toastTimer;
let lastCommitted = "";
const canvas = $("cover");
const isCoverShot = query.get("shot") === "cover";
function notify(message) {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 3000);
}
function cloneState() {
  return JSON.stringify(state);
}
function commit() {
  clearTimeout(commitTimer);
  const snapshot = cloneState();
  if (snapshot === lastCommitted) return;
  if (lastCommitted) {
    history.push(lastCommitted);
    if (history.length > 60) history.shift();
  }
  lastCommitted = snapshot;
  future = [];
  updateUndoButtons();
  $("saveStatus").textContent = "All changes on this device";
}
function commitSoon() {
  clearTimeout(commitTimer);
  commitTimer = setTimeout(commit, 400);
}
function updateUndoButtons() {
  $("undo").disabled = !history.length;
  $("redo").disabled = !future.length;
}
function restore(snapshot) {
  Object.assign(state, JSON.parse(snapshot));
  lastCommitted = cloneState();
  regrade();
  syncInputs();
  buildPanelStrip();
  scheduleRender();
  updateUndoButtons();
}
function undo() {
  commit();
  if (!history.length) return;
  future.push(cloneState());
  restore(history.pop());
  notify("Last change undone");
}
function redo() {
  if (!future.length) return;
  history.push(cloneState());
  restore(future.pop());
  notify("Change restored");
}
function regrade() {
  graded = photos.map((photo) =>
    gradePhoto(photo.image, state.grade, state.intensity, state.ink),
  );
}
function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    renderPending = false;
    renderPoster(canvas, state, photos, graded);
    fitArtboard();
    if (isCoverShot) renderPoster($("shotCanvas"), state, photos, graded);
  });
}
function fitArtboard() {
  const area = $("artboardArea");
  const [w, h] = FORMATS[state.format];
  const maxW = Math.max(100, area.clientWidth - 56),
    maxH = Math.max(100, area.clientHeight - 20);
  const scale = Math.min(maxW / w, maxH / h);
  canvas.style.width = Math.floor(w * scale) + "px";
  canvas.style.height = Math.floor(h * scale) + "px";
  $("artboardWrap").style.width = Math.floor(w * scale) + "px";
  $("artboardWrap").style.height = Math.floor(h * scale) + "px";
}
function updateFormat(format) {
  if (!FORMATS[format]) return;
  state.format = format;
  syncInputs();
  scheduleRender();
  commit();
}
function syncInputs() {
  for (const id of ["caption", "tagline", "edition", "year", "intensity"])
    $(id).value = state[id];
  $("ink").checked = state.ink;
  $("details").checked = state.details;
  $("intensityValue").textContent = state.intensity + "%";
  document
    .querySelectorAll("[data-format]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.format === state.format),
    );
  document
    .querySelectorAll("[data-layout]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.layout === state.layout),
    );
  document
    .querySelectorAll("[data-grade]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.grade === state.grade),
    );
  document
    .querySelectorAll("[data-finish]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.finish === state.finish),
    );
  $("canvasSize").textContent = FORMATS[state.format].join(" × ");
  syncPanelInspector();
}
function syncPanelInspector() {
  const panel = state.panels[selected];
  $("selectedNumber").textContent = String(selected + 1).padStart(2, "0");
  $("selectedName").textContent =
    panel.role.toLowerCase().replace(/^./, (x) => x.toUpperCase()) ||
    "Untitled panel";
  $("selectedType").textContent =
    panel.photo < 0
      ? "Illustrated skyline · original vector art"
      : "Photo panel · drag to position";
  $("role").value = panel.role;
  $("zoom").value = Math.round(panel.zoom * 100);
  $("zoomValue").textContent = Math.round(panel.zoom * 100) + "%";
  $("positionX").value = Math.round(panel.offsetX * 100);
  $("positionY").value = Math.round(panel.offsetY * 100);
  $("panelPhoto").value = panel.photo;
  for (const id of [
    "zoom",
    "positionX",
    "positionY",
    "flipPhoto",
    "centerPhoto",
  ])
    $(id).disabled = panel.photo < 0;
  document
    .querySelectorAll("[data-panel]")
    .forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.panel) === selected),
    );
}
function selectPanel(index) {
  if (index < 0 || index >= panelPolygons(state.layout, state.format).length)
    return;
  selected = index;
  syncPanelInspector();
}
function buildPhotoLibrary() {
  const library = $("photoLibrary");
  library.replaceChildren();
  photos.forEach((photo, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-tile";
    button.title = "Use " + photo.name + " in selected panel";
    button.draggable = true;
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.name;
    const label = document.createElement("span");
    label.textContent = photo.name;
    button.append(img, label);
    button.addEventListener("click", () => assignPhoto(i));
    button.addEventListener("dragstart", (e) =>
      e.dataTransfer.setData("text/plain", String(i)),
    );
    library.append(button);
  });
  $("photoCount").textContent = photos.length + " photos";
  const source = $("panelPhoto");
  source.replaceChildren();
  const scene = document.createElement("option");
  scene.value = -1;
  scene.textContent = "Illustrated sunset skyline";
  source.append(scene);
  photos.forEach((photo, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = photo.name;
    source.append(option);
  });
  syncPanelInspector();
}
function assignPhoto(index) {
  const panel = state.panels[selected];
  panel.photo = index;
  Object.assign(panel, {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    focusX: 0.5,
    focusY: 0.4,
  });
  syncPanelInspector();
  buildPanelStrip();
  scheduleRender();
  commit();
  notify("Photo assigned to panel " + String(selected + 1).padStart(2, "0"));
}
function buildPanelStrip() {
  const strip = $("panelStrip");
  strip.replaceChildren();
  const count = panelPolygons(state.layout, state.format).length;
  for (let i = 0; i < count; i++) {
    const p = state.panels[i];
    const button = document.createElement("button");
    button.dataset.panel = i;
    button.classList.toggle("active", i === selected);
    button.setAttribute("aria-label", "Edit panel " + (i + 1) + ": " + p.role);
    const thumb = document.createElement("canvas");
    renderPanelThumbnail(thumb, p, graded[p.photo], state.grade);
    const label = document.createElement("span");
    label.textContent = p.role;
    const number = document.createElement("b");
    number.textContent = String(i + 1).padStart(2, "0");
    button.append(thumb, label, number);
    button.addEventListener("click", () => selectPanel(i));
    button.addEventListener("dragover", (e) => e.preventDefault());
    button.addEventListener("drop", (e) => {
      e.preventDefault();
      const index = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isInteger(index) && photos[index]) {
        selectPanel(i);
        assignPhoto(index);
      }
    });
    strip.append(button);
  }
}
function buildLayoutChoices() {
  for (const layout of LAYOUTS) {
    const button = document.createElement("button");
    button.className = "layout-card";
    button.dataset.layout = layout.id;
    button.title = layout.name;
    const paths = panelPolygons(layout.id, "landscape")
      .map(
        (poly, i) =>
          `<polygon points="${poly.map(([x, y]) => `${x * 100},${y * 60}`).join(" ")}" fill="${["#b47c83", "#e4bb9c", "#7c8796", "#b89094", "#718b91"][i]}" stroke="#131722" stroke-width="1.8"/>`,
      )
      .join("");
    button.innerHTML = `<svg viewBox="0 0 100 60" aria-hidden="true">${paths}</svg><span>${layout.name}</span>`;
    button.addEventListener("click", () => {
      state.layout = layout.id;
      selected = Math.min(
        selected,
        panelPolygons(state.layout, state.format).length - 1,
      );
      syncInputs();
      buildPanelStrip();
      scheduleRender();
      commit();
    });
    $("layouts").append(button);
  }
}
function buildGradeChoices() {
  for (const grade of GRADES) {
    const button = document.createElement("button");
    button.className = "grade-button";
    button.dataset.grade = grade.id;
    const swatch = document.createElement("i");
    swatch.style.background = `linear-gradient(135deg,${grade.colors.join(",")})`;
    const label = document.createElement("span");
    label.textContent = grade.name;
    button.append(swatch, label);
    button.addEventListener("click", () => {
      state.grade = grade.id;
      regrade();
      buildPanelStrip();
      syncInputs();
      scheduleRender();
      commit();
    });
    $("grades").append(button);
  }
}
async function decodePhoto(src, name) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();
  return { image, src, name };
}
async function importPhotos(files) {
  const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
  if (!accepted.length) {
    notify("Choose a JPEG, PNG, WebP or another browser-supported photo.");
    return;
  }
  const start = photos.length;
  let failures = 0;
  for (const file of accepted.slice(0, 20)) {
    const src = URL.createObjectURL(file);
    try {
      photos.push(await decodePhoto(src, file.name.replace(/\.[^.]+$/, "")));
    } catch {
      URL.revokeObjectURL(src);
      failures++;
    }
  }
  if (photos.length === start) {
    notify("These images could not be decoded. Try JPEG or PNG.");
    return;
  }
  regrade();
  autoFillPanels(start, false);
  buildPhotoLibrary();
  buildPanelStrip();
  scheduleRender();
  commit();
  notify(
    photos.length -
      start +
      " photos added. Your cover is ready." +
      (failures ? " Some files were unsupported." : ""),
  );
}
function autoFillPanels(start = 0, feedback = true) {
  const available = photos.length - start;
  if (!available) return;
  state.panels.forEach((panel, i) => {
    Object.assign(panel, {
      photo: start + (i % available),
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.5,
      focusY: 0.4,
      flip: false,
    });
  });
  buildPanelStrip();
  syncPanelInspector();
  scheduleRender();
  commit();
  if (feedback) notify("All panels filled. Drag any panel to refine its crop.");
}
function getExportCanvas(format) {
  const output = document.createElement("canvas");
  renderPoster(output, state, photos, graded, format);
  return output;
}
async function exportPng(format = state.format) {
  const output = getExportCanvas(format);
  const blob = await new Promise((resolve) =>
    output.toBlob(resolve, "image/png"),
  );
  if (!blob) {
    notify("Export unavailable. Please try again.");
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug =
    state.caption
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "your-story";
  link.download = `${slug}-${FORMATS[format].join("x")}.png`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  notify(`PNG exported · ${FORMATS[format].join(" × ")} · ready to share`);
  $("saveStatus").textContent = "PNG exported successfully";
  return { width: output.width, height: output.height, bytes: blob.size };
}
function openPreview() {
  const output = getExportCanvas(state.format);
  $("previewImage").src = output.toDataURL("image/png");
  $("previewDialog").showModal();
}
function bindEditor() {
  document.querySelectorAll("[data-finish]").forEach((button) =>
    button.addEventListener("click", () => {
      state.finish = button.dataset.finish;
      syncInputs();
      scheduleRender();
      commit();
    }),
  );
  for (const id of ["caption", "tagline", "edition", "year"])
    $(id).addEventListener("input", () => {
      state[id] = $(id).value;
      scheduleRender();
      commitSoon();
    });
  document
    .querySelectorAll("[data-format]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        updateFormat(button.dataset.format),
      ),
    );
  document
    .querySelectorAll("[data-export]")
    .forEach((button) =>
      button.addEventListener("click", () => exportPng(button.dataset.export)),
    );
  $("headerExport").addEventListener("click", () => exportPng());
  $("downloadPreview").addEventListener("click", () => exportPng());
  $("fullPreview").addEventListener("click", openPreview);
  $("closePreview").addEventListener("click", () => $("previewDialog").close());
  $("previewDialog").addEventListener("click", (e) => {
    if (e.target === $("previewDialog")) $("previewDialog").close();
  });
  $("undo").addEventListener("click", undo);
  $("redo").addEventListener("click", redo);
  $("photos").addEventListener("change", async (e) => {
    await importPhotos(e.target.files);
    e.target.value = "";
  });
  const dropZone = $("dropZone");
  ["dragenter", "dragover"].forEach((event) =>
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    }),
  );
  ["dragleave", "drop"].forEach((event) =>
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (event === "drop") importPhotos(e.dataTransfer.files);
    }),
  );
  $("autoFill").addEventListener("click", () => autoFillPanels());
  $("panelPhoto").addEventListener("change", () =>
    assignPhoto(Number($("panelPhoto").value)),
  );
  $("zoom").addEventListener("input", () => {
    state.panels[selected].zoom = Number($("zoom").value) / 100;
    syncPanelInspector();
    scheduleRender();
    commitSoon();
  });
  for (const axis of ["X", "Y"])
    $("position" + axis).addEventListener("input", () => {
      state.panels[selected]["offset" + axis] =
        Number($("position" + axis).value) / 100;
      scheduleRender();
      commitSoon();
    });
  $("role").addEventListener("input", () => {
    state.panels[selected].role = $("role").value.toUpperCase();
    $("selectedName").textContent = $("role").value;
    scheduleRender();
    buildPanelStrip();
    commitSoon();
  });
  $("flipPhoto").addEventListener("click", () => {
    state.panels[selected].flip = !state.panels[selected].flip;
    scheduleRender();
    buildPanelStrip();
    commit();
  });
  const center = () => {
    Object.assign(state.panels[selected], {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.5,
      focusY: 0.4,
    });
    syncPanelInspector();
    scheduleRender();
    buildPanelStrip();
    commit();
  };
  $("resetCrop").addEventListener("click", center);
  $("centerPhoto").addEventListener("click", center);
  $("intensity").addEventListener("input", () => {
    state.intensity = Number($("intensity").value);
    $("intensityValue").textContent = state.intensity + "%";
    regrade();
    scheduleRender();
    commitSoon();
  });
  $("intensity").addEventListener("change", buildPanelStrip);
  for (const id of ["ink", "details"])
    $(id).addEventListener("change", () => {
      state[id] = $(id).checked;
      if (id === "ink") regrade();
      scheduleRender();
      buildPanelStrip();
      commit();
    });
  let dragging = null;
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const index = hitTestPanel(
      canvas,
      ((e.clientX - rect.left) * canvas.width) / rect.width,
      ((e.clientY - rect.top) * canvas.height) / rect.height,
      state,
    );
    if (index < 0) return;
    selectPanel(index);
    if (state.panels[index].photo < 0) return;
    const panel = state.panels[index];
    dragging = {
      x: e.clientX,
      y: e.clientY,
      ox: panel.offsetX,
      oy: panel.offsetY,
    };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const shape = panelPolygons(state.layout, state.format)[selected];
    const bw =
      Math.max(...shape.map((p) => p[0])) - Math.min(...shape.map((p) => p[0]));
    const bh =
      Math.max(...shape.map((p) => p[1])) - Math.min(...shape.map((p) => p[1]));
    const panel = state.panels[selected];
    panel.offsetX = Math.max(
      -1,
      Math.min(1, dragging.ox + (e.clientX - dragging.x) / rect.width / bw),
    );
    panel.offsetY = Math.max(
      -1,
      Math.min(1, dragging.oy + (e.clientY - dragging.y) / rect.height / bh),
    );
    syncPanelInspector();
    scheduleRender();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = null;
    buildPanelStrip();
    commit();
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const panel = state.panels[selected];
      if (panel.photo < 0) return;
      panel.zoom = Math.max(1, Math.min(3.5, panel.zoom + -e.deltaY * 0.0015));
      syncPanelInspector();
      scheduleRender();
      commitSoon();
    },
    { passive: false },
  );
  canvas.addEventListener("dragover", (e) => e.preventDefault());
  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      importPhotos(e.dataTransfer.files);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const index = hitTestPanel(
      canvas,
      ((e.clientX - rect.left) * canvas.width) / rect.width,
      ((e.clientY - rect.top) * canvas.height) / rect.height,
      state,
    );
    const photo = Number(e.dataTransfer.getData("text/plain"));
    if (index >= 0 && photos[photo]) {
      selectPanel(index);
      assignPhoto(photo);
    }
  });
  document.addEventListener("keydown", (e) => {
    const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(
      document.activeElement.tagName,
    );
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !editing) {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    }
    if (e.key === "Escape" && $("previewDialog").open)
      $("previewDialog").close();
    if (
      !editing &&
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      const p = state.panels[selected],
        delta = e.shiftKey ? 0.05 : 0.01;
      p.offsetX = Math.max(
        -1,
        Math.min(
          1,
          p.offsetX +
            (e.key === "ArrowRight"
              ? delta
              : e.key === "ArrowLeft"
                ? -delta
                : 0),
        ),
      );
      p.offsetY = Math.max(
        -1,
        Math.min(
          1,
          p.offsetY +
            (e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0),
        ),
      );
      syncPanelInspector();
      scheduleRender();
      commitSoon();
    }
  });
  new ResizeObserver(fitArtboard).observe($("artboardArea"));
}
async function startStudio() {
  const defaults = await Promise.all([
    decodePhoto("samples/boulevard.jpg", "Boulevard driver"),
    decodePhoto("samples/pier.jpg", "Pier-side fixer"),
  ]);
  photos.push(...defaults);
  if (FORMATS[query.get("format")]) state.format = query.get("format");
  if (LAYOUTS.some((l) => l.id === query.get("layout")))
    state.layout = query.get("layout");
  if (GRADES.some((g) => g.id === query.get("grade")))
    state.grade = query.get("grade");
  if (query.has("caption"))
    state.caption = query.get("caption").replaceAll("|", "\n");
  if (query.has("tagline")) state.tagline = query.get("tagline");
  if (["chrome", "enamel", "ice"].includes(query.get("finish")))
    state.finish = query.get("finish");
  if (isCoverShot) {
    document.body.classList.add("shot-cover");
    const shotCanvas = document.createElement("canvas");
    shotCanvas.id = "shotCanvas";
    document.body.append(shotCanvas);
  }
  regrade();
  buildLayoutChoices();
  buildGradeChoices();
  buildPhotoLibrary();
  buildPanelStrip();
  bindEditor();
  syncInputs();
  commit();
  renderPoster(canvas, state, photos, graded);
  fitArtboard();
  if (isCoverShot) renderPoster($("shotCanvas"), state, photos, graded);
  window.afterHours = {
    state,
    photos,
    renderExport: getExportCanvas,
    exportPng,
    importPhotos,
    selectPanel,
    undo,
    redo,
    render: () => {
      regrade();
      buildPanelStrip();
      syncInputs();
      scheduleRender();
    },
    ready: true,
  };
  await document.fonts.ready;
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  window.__shotReady = true;
}
startStudio().catch((error) => {
  console.error(error);
  notify("The studio could not load. Serve the app folder locally and reload.");
});
