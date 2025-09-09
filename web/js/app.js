// === xeokit (ESM) ===
import {
  Viewer,
  NavCubePlugin,
  XKTLoaderPlugin
} from "https://cdn.jsdelivr.net/npm/@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js";

// === DOM ===
const canvas     = document.getElementById("xeokit-canvas");
const navCubeCV  = document.getElementById("navCube");
const hudMsg     = document.getElementById("hud-msg");
const coordsEl   = document.getElementById("coords");
const propsEl    = document.getElementById("props");
const btnFit     = document.getElementById("btn-fit");
const btnXray    = document.getElementById("btn-xray");
const btnEdges   = document.getElementById("btn-edges");
const btnReset   = document.getElementById("btn-reset");
const btnTheme   = document.getElementById("btn-theme");
const loader     = document.getElementById("loader");
const loaderFill = document.getElementById("loader-fill");
const loaderText = document.getElementById("loader-text");

// === Viewer ===
// Note: readableGeometryEnabled via constructeur (meilleur pick/coords).
const viewer = new Viewer({
  canvasId: "xeokit-canvas",
  transparent: true,
  readableGeometryEnabled: true
});

viewer.camera.eye  = [-20, 20, 20];
viewer.camera.look = [0, 5, 0];
viewer.camera.up   = [0, 1, 0];

// === NavCube (besoin d'un canvas dédié) ===
new NavCubePlugin(viewer, { canvasElement: navCubeCV, size: 110 }); // conforme API. :contentReference[oaicite:3]{index=3}

// === Loader XKT ===
class ProgressDataSource {
  async getXKT(src, ok, error) {
    try {
      showLoader(true, "Chargement…");
      const res    = await fetch(src);
      const total  = Number(res.headers.get("Content-Length")) || 0;
      const reader = res.body.getReader();
      let loaded = 0; const chunks = [];

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total) {
          const pct = Math.round((loaded / total) * 100);
          loaderFill.style.width = `${pct}%`;
          loaderText.textContent = `Chargement… ${pct}%`;
        } else {
          loaderText.textContent = `Chargement… ${(loaded/1048576).toFixed(1)} Mo`;
        }
      }
      const arrayBuffer = await new Blob(chunks).arrayBuffer();
      ok(arrayBuffer); // on passe l'ArrayBuffer au plugin
    } catch (e) {
      showLoader(false); hud("Erreur de téléchargement XKT."); console.error(e);
      error(e.toString());
    }
  }
  async getMetaModel(metaModelSrc, ok /*, error */) {
    try {
      const r = await fetch(metaModelSrc);
      ok(r.ok ? await r.json() : null);
    } catch { ok(null); }
  }
}

const xktLoader = new XKTLoaderPlugin(viewer, {
  dataSource: new ProgressDataSource(),
  objectDefaults: { IfcSpace: { visible: false }, IfcWindow: { opacity: 0.35 } }
});

hud("Chargement XKT…");

// Charge le modèle XKT
const model = xktLoader.load({ id: "ecotwinModel", src: "../assets/model.xkt", edges: true });

model.on("loaded", () => {
  viewer.cameraFlight.flyTo(model);
  hud("Modèle chargé.");
  showLoader(false);
});

model.on("error", (err) => {
  showLoader(false); hud("Erreur de chargement."); console.error("XKT load error:", err);
});

// === UI ===
btnFit.addEventListener("click", () => viewer.cameraFlight.flyTo(viewer.scene));

let xray = false;
btnXray.addEventListener("click", () => {
  xray = !xray;
  viewer.scene.setObjectsXRayed(viewer.scene.objectIds, xray);
});

btnEdges.addEventListener("click", () => {
  const models = Object.values(viewer.scene.models);
  const newState = !models[0]?.edges;
  models.forEach(m => m.edges = newState);
});

btnReset.addEventListener("click", () => {
  viewer.cameraFlight.flyTo(viewer.scene);
  viewer.scene.setObjectsXRayed(viewer.scene.objectIds, false);
  Object.values(viewer.scene.models).forEach(m => m.edges = true);
});

btnTheme.addEventListener("click", () => document.documentElement.classList.toggle("light"));

// === Picking (clic) : propriétés basiques ===
viewer.scene.input.on("mousedown", (canvasPos) => {
  const pick = viewer.scene.pick({ canvasPos, pickSurface: true });
  if (pick?.entity) {
    const id = pick.entity.id;
    const mo = viewer.metaScene.metaObjects[id] || viewer.metaScene.metaObjects[id?.split("#").pop()];
    propsEl.textContent = mo
      ? JSON.stringify({ id: mo.id, type: mo.type, name: mo.name }, null, 2)
      : `ID: ${id}`;
  }
});

// === Coordonnées (move) : worldPos ===
viewer.scene.input.on("mousemove", (canvasPos) => {
  const pick = viewer.scene.pick({ canvasPos, pickSurface: true });
  if (pick?.worldPos) {
    const [x,y,z] = pick.worldPos;
    coordsEl.textContent = `X ${x.toFixed(2)}  Y ${y.toFixed(2)}  Z ${z.toFixed(2)}`;
  } else { coordsEl.textContent = "X —  Y —  Z —"; }
});

// === Resize CSS -> canvas (pas de viewer.resize) ===
const resize = () => {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
};
new ResizeObserver(resize).observe(canvas.parentElement);
resize();

// === Utils ===
function hud(t){ hudMsg.textContent = t; }
function showLoader(show, txt){
  loader.classList.toggle("hidden", !show);
  if (txt) loaderText.textContent = txt;
  if (show) loaderFill.style.width = "0%";
}
