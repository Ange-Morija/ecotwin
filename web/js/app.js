// app.js (corrigé)
// Viewer + Arborescence + Mesures 3D + Capteurs + Maintenance + Actions IA
// Commentaires courts, propres et concis.

import { Viewer, NavCubePlugin, XKTLoaderPlugin } from "https://cdn.jsdelivr.net/npm/@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js";

/* ---------- DOM ---------- */
const canvas      = document.getElementById("xeokit-canvas");
const navCube     = document.getElementById("navCube");
const hudMsg      = document.getElementById("hud-msg");
const coordsEl    = document.getElementById("coords");
const propsEl     = document.getElementById("props");
const loader      = document.getElementById("loader");
const loaderText  = document.getElementById("loader-text");
const overlaySVG  = document.getElementById("measure-overlay");
const listEl      = document.getElementById("measure-list");

/* Maintenance modal DOM */
const maintModal    = document.getElementById('maint-modal');
const maintForm     = document.getElementById('maint-form');
const maintSensorId = document.getElementById('maint-sensor-id');
const maintLast     = document.getElementById('maint-last');
const maintNext     = document.getElementById('maint-next');
const maintInterval = document.getElementById('maint-interval');
const maintNotes    = document.getElementById('maint-notes');
const maintSaveBtn  = document.getElementById('maint-save');
const maintCancel   = document.getElementById('maint-cancel');
const maintIaDate   = document.getElementById('maint-ia-date');
const btnIaCompute  = document.getElementById('btn-ia-compute');
const maintIaMeta   = document.getElementById('maint-ia-meta');

/* Actions modal DOM */
const actionsListRoot = document.getElementById('actions-list');
const actionFilterInput = document.getElementById('action-filter');
const btnNewAction = document.getElementById('btn-new-action');
const btnExportActions = document.getElementById('btn-export-actions');
const actionModal = document.getElementById('action-modal');
const actionForm = document.getElementById('action-form');
const actionIdInput = document.getElementById('action-id');
const actionCreated = document.getElementById('action-created');
const actionDue = document.getElementById('action-due');
const actionText = document.getElementById('action-text');
const actionDone = document.getElementById('action-done');
const actionDoneDate = document.getElementById('action-done-date');
const actionDoneBy = document.getElementById('action-done-by');
const actionSaveBtn = document.getElementById('action-save');
const actionCancelBtn = document.getElementById('action-cancel');

/* Sensors tab DOM */
const sensorFilterInput = document.getElementById('sensor-filter');
const sensorUnitSelect  = document.getElementById('sensor-unit-filter');
const sensorListRoot    = document.getElementById('sensor-list');
const btnExportSensors  = document.getElementById('btn-export-sensors');

/* ---------- Config ---------- */
const API_BASE=(window.ECOTWIN_API_URL??"http://localhost:8000/api").replace(/\/$/,"");

/* ---------- Small helpers (unique definitions) ---------- */
const csvQ=(v)=> `"${(v??"").toString().replace(/"/g,'""')}"`;
function downloadFile(name, text){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:"text/csv"})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
function hud(t){ if(hudMsg) hudMsg.textContent = t; }
function showLoader(show, txt){ if(loader) loader.classList.toggle("hidden", !show); if(txt && loaderText) loaderText.textContent = txt; }

/* Date helpers unified (une seule fois) */
function dateToLocalInput(dt){ // iso -> yyyy-mm-ddTHH:MM for input
  if(!dt) return '';
  const d = new Date(dt); if(isNaN(d)) return '';
  const offs = d.getTimezoneOffset(); const local = new Date(d.getTime()-offs*60000);
  return local.toISOString().slice(0,16);
}
function isoToLocalInputValue(iso){ return dateToLocalInput(iso); } // alias clair
function localInputToIso(v){ if(!v) return null; const d = new Date(v); return isNaN(d)?null:d.toISOString(); }
function fmt(v){ return (v==null||Number.isNaN(v))?"—":(typeof v==="number"?(Math.abs(v)<10?v.toFixed(2):v.toFixed(1)):v); }
function fmtDateShort(d){ if(!d) return "—"; try{ return new Date(d).toLocaleString(); }catch{return "—";} }

/* ---------- Viewer init ---------- */
const viewer = new Viewer({ canvasId:"xeokit-canvas", transparent:true, readableGeometryEnabled:true });
viewer.camera.eye = [-20,20,20]; viewer.camera.look = [0,5,0]; viewer.camera.up = [0,1,0];
new NavCubePlugin(viewer, { canvasElement: navCube, size: 100 });

class ProgressDataSource{ async getXKT(src, ok, error){ try{ showLoader(true,"Chargement…"); const r=await fetch(src); ok(await r.arrayBuffer()); }catch(e){ showLoader(false); hud("Erreur XKT"); error(e.toString()); } } }
const xktLoader = new XKTLoaderPlugin(viewer, { dataSource:new ProgressDataSource() });
hud("Chargement XKT…");
const model = xktLoader.load({ id:"ecotwinModel", src:"../assets/model.xkt", edges:true });
model.on("loaded", ()=>{ viewer.cameraFlight.flyTo(model); hud("Modèle chargé."); showLoader(false); buildModelTree(); });

/* ---------- Buttons / FAB ---------- */
const btnFit   = document.getElementById("btn-fit");
const btnXray  = document.getElementById("btn-xray");
const btnEdges = document.getElementById("btn-edges");
const btnReset = document.getElementById("btn-reset");
const btnTheme = document.getElementById("btn-theme");
const btnExport= document.getElementById("btn-export-assets");
if(btnFit) btnFit.addEventListener("click",()=>viewer.cameraFlight.flyTo(viewer.scene));
let xray=false;
if(btnXray) btnXray.addEventListener("click",()=>{ xray=!xray; viewer.scene.setObjectsXRayed(viewer.scene.objectIds,xray); btnXray.classList.toggle("is-active",xray); });
if(btnEdges) btnEdges.addEventListener("click",()=>{ const ms=Object.values(viewer.scene.models); const s=!ms[0]?.edges; ms.forEach(m=>m.edges=s); btnEdges.classList.toggle("is-active",s); });
if(btnEdges) btnEdges.classList.add("is-active");
if(btnReset) btnReset.addEventListener("click",()=>{ viewer.cameraFlight.flyTo(viewer.scene); viewer.scene.setObjectsXRayed(viewer.scene.objectIds,false); Object.values(viewer.scene.models).forEach(m=>m.edges=true); btnXray.classList.remove("is-active"); btnEdges.classList.add("is-active"); });
if(btnTheme) btnTheme.addEventListener("click",()=>document.documentElement.classList.toggle("light"));
if(btnExport) btnExport.addEventListener("click", exportHierarchyCsv);

/* ---------- Picking + coords + props + mesures — 1 handler ---------- */
viewer.scene.input.on("mousedown",(canvasPos)=>{
  const pick=viewer.scene.pick({canvasPos,pickSurface:true});
  const wpos = pick?.worldPos ? Array.from(pick.worldPos) : null;
  if (MEASURE.mode !== "none" && wpos){ handleMeasureClick(wpos); return; }
  if(pick?.entity){
    const id=pick.entity.id;
    const mo=viewer.metaScene.metaObjects[id]||viewer.metaScene.metaObjects[id?.split("#").pop()];
    propsEl.textContent = mo ? JSON.stringify({id:mo.id,type:mo.type,name:mo.name},null,2) : `ID: ${id}`;
    selectTreeNode(id);
  }
});
viewer.scene.input.on("mousemove",(canvasPos)=>{
  const p=viewer.scene.pick({canvasPos,pickSurface:true});
  coordsEl.textContent = p?.worldPos ? `X ${p.worldPos[0].toFixed(2)}  Y ${p.worldPos[1].toFixed(2)}  Z ${p.worldPos[2].toFixed(2)}` : "X —  Y —  Z —";
});

/* HiDPI: resize + mise à l’échelle */
new ResizeObserver(()=>{
  const dpr=window.devicePixelRatio||1;
  const w=Math.floor(canvas.clientWidth*dpr);
  const h=Math.floor(canvas.clientHeight*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  redrawOverlay();
}).observe(canvas.parentElement);

/* Tabs right */
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click",(e)=>{
    e.preventDefault();
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
    document.getElementById("tab-"+btn.dataset.tab).classList.add("active");
    if(btn.dataset.tab==='actions'){ setTimeout(()=> renderActions(actionFilterInput?.value||''),80); }
    if(btn.dataset.tab==='sensors'){ setTimeout(()=> renderSensors(sensorFilterInput?.value||''),80); }
  });
});

/* ========= Export hiérarchie CSV ========= */
const TYPE_KEEP=/(Ifc(Project|Site|Building|BuildingStorey|Space|Zone|System|Distribution|Flow|Fan|Pump|Boiler|Chiller|AirHandlingUnit))/i;
const className=(t)=> (t||"").replace(/^Ifc/,"").toLowerCase();
function findZoneName(mo){ let cur=mo; while(cur){ if(/Ifc(Zone|BuildingStorey|Space)/i.test(cur.type||"")) return cur.name||cur.id||""; cur=cur.parent||null; } return ""; }
function exportHierarchyCsv(){
  const mos=viewer.metaScene?.metaObjects||{}; const list=Object.values(mos);
  if (!list.length){ alert("Aucune métadonnée trouvée."); return; }
  const rows=[["asset_id","parent_id","asset_name","asset_class","ifc_guid","zone"].join(",")];
  for (const mo of list){
    if (!TYPE_KEEP.test(mo.type||"")) continue;
    rows.push([mo.id, mo.parent?.id||"", mo.name||mo.id||"", className(mo.type), (mo.ifcGuid||mo.uuid||mo.id||""), findZoneName(mo)].map(csvQ).join(","));
  }
  downloadFile("assets.csv", rows.join("\n"));
}

/* ========= Arborescence ========= */
const treeRoot=document.getElementById("tree");
const treeSearch=document.getElementById("tree-search");
const btnTreeExpand=document.getElementById("btn-tree-expand");
const btnTreeCollapse=document.getElementById("btn-tree-collapse");
let TREE_INDEX=new Map();

function buildModelTree(){
  const mos=viewer.metaScene?.metaObjects||{};
  const all=Object.values(mos).filter(m=>TYPE_KEEP.test(m.type||""));
  if (!all.length){ treeRoot.textContent="Aucune arborescence."; return; }
  const children=new Map(); const parentOf=new Map();
  all.forEach(m=>{ const pid=m.parent?.id||null; parentOf.set(m.id,pid); if(!children.has(pid)) children.set(pid,[]); children.get(pid).push(m); });
  const roots=(children.get(null)||[]).concat((children.get(undefined)||[]));
  const sortByName=arr=>arr.sort((a,b)=>(a.name||a.id).localeCompare(b.name||b.id));
  treeRoot.innerHTML=""; TREE_INDEX.clear();
  function renderNode(mo){
    const hasKids=!!children.get(mo.id);
    const node=document.createElement("div"); node.className="node collapsed"; node.dataset.id=mo.id;
    const row=document.createElement("div"); row.className="row";
    const twist=document.createElement("span"); twist.className="twist"; if(!hasKids) twist.style.visibility="hidden";
    const label=document.createElement("span"); label.className="label"; label.textContent=mo.name||mo.id;
    const meta=document.createElement("span"); meta.className="meta"; meta.textContent=`(${className(mo.type)})`;
    row.append(twist,label,meta); node.append(row);
    const kidsWrap=document.createElement("div"); kidsWrap.className="children";
    const kids=sortByName(children.get(mo.id)||[]); kids.forEach(k=>kidsWrap.appendChild(renderNode(k)));
    node.append(kidsWrap);
    twist.addEventListener("click",(e)=>{e.stopPropagation();node.classList.toggle("collapsed");node.classList.toggle("expanded");});
    label.addEventListener("click",(e)=>{e.stopPropagation();focusEntity(mo.id);markSelected(node);});
    TREE_INDEX.set(mo.id,node);
    return node;
  }
  sortByName(roots).forEach(r=>{ const n=renderNode(r); n.classList.remove("collapsed"); n.classList.add("expanded"); treeRoot.appendChild(n); });
  treeRoot.scrollTop=0;
}
function focusEntity(id){ const ent=viewer.scene.objects[id]; if(ent?.aabb){ viewer.cameraFlight.flyTo({ aabb: ent.aabb }); } }
function markSelected(node){ treeRoot.querySelectorAll(".selected").forEach(n=>n.classList.remove("selected")); node.classList.add("selected"); }
function selectTreeNode(id){
  const n=TREE_INDEX.get(id); if(!n) return;
  let cur=n; while(cur && cur!==treeRoot){ if(cur.classList.contains("node")){cur.classList.remove("collapsed");cur.classList.add("expanded");} cur=cur.parentElement; }
  markSelected(n); n.scrollIntoView({block:"nearest"});
}
treeSearch.addEventListener("input",()=>{
  const q=treeSearch.value.trim().toLowerCase();
  treeRoot.querySelectorAll(".node").forEach(n=>n.classList.remove("match"));
  if(!q) return;
  TREE_INDEX.forEach(n=>{
    const label=n.querySelector(".label")?.textContent?.toLowerCase()||"";
    const meta =n.querySelector(".meta") ?.textContent?.toLowerCase()||"";
    if(label.includes(q)||meta.includes(q)){
      n.classList.add("match");
      let p=n.parentElement; while(p && p!==treeRoot){ if(p.classList.contains("node")){p.classList.remove("collapsed");p.classList.add("expanded");} p=p.parentElement; }
    }
  });
});
btnTreeExpand.addEventListener("click",()=>{ treeRoot.querySelectorAll(".node").forEach(n=>{n.classList.remove("collapsed");n.classList.add("expanded");}); });
btnTreeCollapse.addEventListener("click",()=>{ treeRoot.querySelectorAll(".node").forEach(n=>{n.classList.remove("expanded");n.classList.add("collapsed");}); });

/* ========= Mesures 3D (FAB scène) ========= */
const vBtnDist  = document.getElementById("vt-meas-distance");
const vBtnPoint = document.getElementById("vt-meas-point");
const vBtnClear = document.getElementById("vt-meas-clear");

const MEASURE={ mode:"none", tempP1:null, seq:1, items:[] }; // items: {id,type, pos|a,b, dist?}

/* Active/désactive le mode + feedback */
function setMeasureMode(mode){
  MEASURE.mode=mode;
  vBtnDist?.classList.toggle("is-active", mode==="distance");
  vBtnPoint?.classList.toggle("is-active", mode==="point");
  hud(mode==="none" ? "Mesure: désactivée" : (mode==="distance" ? "Mesure distance: choisissez 2 points" : "Mesure point: cliquez un point"));
  if(mode!=="distance") MEASURE.tempP1=null;
}
vBtnDist?.addEventListener("click", ()=> setMeasureMode(MEASURE.mode==="distance"?"none":"distance"));
vBtnPoint?.addEventListener("click", ()=> setMeasureMode(MEASURE.mode==="point"?"none":"point"));
vBtnClear?.addEventListener("click", clearAllMeasures);
window.addEventListener("keydown",(e)=>{ if(e.key==="Escape"){ MEASURE.tempP1=null; setMeasureMode("none"); hud("Mesure: annulée."); }});

/* Clic mesure */
function handleMeasureClick(worldPos){
  if(MEASURE.mode==="point"){
    addPoint(worldPos);
    setMeasureMode("none");
    hud("Point ajouté. Navigation libre.");
  } else if(MEASURE.mode==="distance"){
    if(!MEASURE.tempP1){
      MEASURE.tempP1=worldPos;
      hud("Point A défini. Sélectionnez le point B.");
    } else {
      addDistance(MEASURE.tempP1, worldPos);
      MEASURE.tempP1=null;
      setMeasureMode("none");
      hud("Distance ajoutée. Navigation libre.");
    }
  }
}

/* Utils */
const dist3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const mid  =(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
function flyToPos(p){ const bb=[p[0]-1,p[1]-1,p[2]-1,p[0]+1,p[1]+1,p[2]+1]; viewer.cameraFlight.flyTo({aabb:bb}); }

/* Projection monde -> pixels CSS (corrige DPR) */
function worldToCss(p){
  const out=new Float32Array(2);
  const xy = viewer.camera.project(p,out) || out;
  const rect = canvas.getBoundingClientRect();
  const sx = rect.width  / canvas.width;
  const sy = rect.height / canvas.height;
  return [ xy[0]*sx, xy[1]*sy ];
}

/* Redessin overlay (cordes + points + labels) */
function redrawOverlay(){
  if(!overlaySVG) return;
  const rect=canvas.getBoundingClientRect();
  overlaySVG.setAttribute("width",  String(Math.max(1,Math.floor(rect.width ))));
  overlaySVG.setAttribute("height", String(Math.max(1,Math.floor(rect.height))));
  while(overlaySVG.firstChild) overlaySVG.removeChild(overlaySVG.firstChild);

  const NS="http://www.w3.org/2000/svg";
  const dot=(x,y,r=5)=>{ const c=document.createElementNS(NS,"circle"); c.setAttribute("cx",x); c.setAttribute("cy",y); c.setAttribute("r",r); c.setAttribute("fill","#ef4444"); c.setAttribute("stroke","#fff"); c.setAttribute("stroke-width","1.5"); return c; };
  const label=(x,y,text)=>{ const t=document.createElementNS(NS,"text"); t.setAttribute("x",x); t.setAttribute("y",y); t.setAttribute("font-size","12"); t.setAttribute("fill","#fff"); t.setAttribute("stroke","#000"); t.setAttribute("stroke-width","3"); t.setAttribute("paint-order","stroke"); t.textContent=text; return t; };

  for(const it of MEASURE.items){
    if(it.type==="point"){
      const p = worldToCss(it.pos); if(!p) continue;
      overlaySVG.appendChild(dot(p[0], p[1], 5));
      overlaySVG.appendChild(label(p[0]+8, p[1]-8, `${it.id}`));
    }else if(it.type==="distance"){
      const a=worldToCss(it.a), b=worldToCss(it.b); if(!a||!b) continue;
      const ln=document.createElementNS(NS,"line");
      ln.setAttribute("x1",a[0]); ln.setAttribute("y1",a[1]);
      ln.setAttribute("x2",b[0]); ln.setAttribute("y2",b[1]);
      ln.setAttribute("stroke","#ef4444"); ln.setAttribute("stroke-width","2"); ln.setAttribute("stroke-linecap","round");
      overlaySVG.appendChild(ln);
      overlaySVG.appendChild(dot(a[0],a[1],4));
      overlaySVG.appendChild(dot(b[0],b[1],4));
      const m=worldToCss(mid(it.a,it.b));
      overlaySVG.appendChild(label(m[0]+8, m[1]-8, `${it.id} • ${it.dist.toFixed(2)} m`));
    }
  }
}

/* Ajout mesures */
function addPoint(p){
  const id=`P${MEASURE.seq++}`;
  const item={id,type:"point",pos:p};
  MEASURE.items.push(item);
  renderMeasureRow(item);
  redrawOverlay();
}
function addDistance(a,b){
  const id=`D${MEASURE.seq++}`, d=dist3(a,b);
  const item={id,type:"distance",a,b,dist:d};
  MEASURE.items.push(item);
  renderMeasureRow(item);
  redrawOverlay();
}

/* UI liste mesures */
function renderMeasureRow(item){
  if (listEl && listEl.classList.contains("empty")){ listEl.classList.remove("empty"); listEl.textContent=""; }
  if (!listEl) return;

  const row=document.createElement("div"); row.className="ms-item"; row.id=`ms-${item.id}`;
  const left=document.createElement("div"); left.className="ms-left";
  const pill=document.createElement("span"); pill.className="ms-type"; pill.textContent=item.type==="point"?"POINT":"DIST";
  const title=document.createElement("strong"); title.textContent=item.id;
  const meta=document.createElement("span"); meta.className="ms-meta";
  meta.textContent=item.type==="point" ? `XYZ: ${item.pos.map(v=>v.toFixed(2)).join(" / ")}` : `d=${item.dist.toFixed(2)} m`;
  left.append(pill,title,meta);

  const acts=document.createElement("div"); acts.className="ms-actions";
  const bFocus=document.createElement("button"); bFocus.className="ms-btn"; bFocus.title="Focus"; bFocus.textContent="🎯";
  const bCopy =document.createElement("button"); bCopy .className="ms-btn"; bCopy .title="Copier"; bCopy .textContent="📋";
  const bDel  =document.createElement("button"); bDel  .className="ms-btn";  bDel  .title="Supprimer"; bDel  .textContent="✖";

  bFocus.addEventListener("click", ()=>{ const p=item.type==="point"?item.pos:mid(item.a,item.b); flyToPos(p); });
  bCopy .addEventListener("click", ()=>{ const txt=item.type==="point"?`Point ${item.id} - X:${item.pos[0]} Y:${item.pos[1]} Z:${item.pos[2]}`:`Distance ${item.id} - A:${item.a.join(",")} B:${item.b.join(",")} - d=${item.dist}`; navigator.clipboard.writeText(txt).catch(()=>{}); });
  bDel  .addEventListener("click", ()=> removeMeasure(item.id));

  acts.append(bFocus,bCopy,bDel);
  row.append(left,acts);
  listEl.append(row);
}
function removeMeasure(id){
  const idx=MEASURE.items.findIndex(x=>x.id===id); if(idx<0) return;
  MEASURE.items.splice(idx,1);
  const row=document.getElementById(`ms-${id}`); if(row) row.remove();
  if (listEl && !MEASURE.items.length){ listEl.classList.add("empty"); listEl.textContent="Aucune mesure."; }
  redrawOverlay();
}
function clearAllMeasures(){
  MEASURE.items=[]; MEASURE.tempP1=null;
  if (listEl){ listEl.classList.add("empty"); listEl.textContent="Aucune mesure."; }
  setMeasureMode("none");
  redrawOverlay(); hud("Mesures effacées.");
}

/* Redessiner à chaque frame (caméra/zoom) */
viewer.scene.on("tick", redrawOverlay);

/* ========= Données capteurs & Maintenance ========= */
const SENSORS=[
  {id:"CAP_TEMP",name:"Température",unit:"°C",field:"temperature"},
  {id:"CAP_HUM", name:"Humidité",unit:"%",field:"humidity"},
  {id:"CAP_PM25",name:"PM2.5",unit:"µg/m³",field:"pm25"},
  {id:"CAP_PM10",name:"PM10",unit:"µg/m³",field:"pm10"},
  {id:"CAP_SO2", name:"SO₂",unit:"ppb",field:"so2"},
  {id:"CAP_CO",  name:"CO",unit:"ppm",field:"co"},
  {id:"CAP_O3",  name:"O₃",unit:"ppb",field:"o3"},
  {id:"CAP_NO2", name:"NO₂",unit:"ppb",field:"no2"}
];

const _LOCAL_MAINT_CACHE = {};
const _LOCAL_ACTIONS_CACHE = {};

/* Raw fetch latest */
async function getLatestRaw(sensorId){
  if(_LOCAL_MAINT_CACHE[sensorId]) return _LOCAL_MAINT_CACHE[sensorId];
  try{ const r=await fetch(`${API_BASE}/telemetry/latest?sensor=${encodeURIComponent(sensorId)}`); if(!r.ok) return null; return await r.json(); }catch{return null;}
}

/* parse timestamp and quality */
function parseTimestamp(obj){
  if(!obj) return null;
  const keys=["timestamp","ts","time","_time","date","datetime","t","sampleTime","time_utc"];
  for(const k of keys){ if(obj[k]!==undefined && obj[k]!==null){ const v=obj[k]; if(typeof v==="number") return (v>1e12)?new Date(v):new Date(v*1000); if(typeof v==="string"){ const n=Date.parse(v); if(!isNaN(n)) return new Date(n); const num=Number(v); if(!Number.isNaN(num)) return (num>1e12)?new Date(num):new Date(num*1000); } } }
  try{ if(obj.value && obj.value.time) return parseTimestamp({time: obj.value.time}); }catch{}
  try{ if(obj.meta && obj.meta.time) return parseTimestamp({time: obj.meta.time}); }catch{}
  return null;
}
function extractQuality(obj){
  if(!obj) return null;
  const keys=["quality","status","qc","flag","valid","quality_flag","qualityStatus","data_quality"];
  for(const k of keys) if(obj[k]!==undefined && obj[k]!==null) return obj[k];
  if(obj.meta){ if(obj.meta.quality!==undefined) return obj.meta.quality; if(obj.meta.status!==undefined) return obj.meta.status; }
  return null;
}
function extractMaintenance(obj){
  if(!obj) return { lastMaintenance:null, nextMaintenance:null, intervalDays:null, notes:null, iaPredicted:null };
  const lastKeys=["last_maintenance","last_maint","maintenance_last","maintenance_date","last_service","lastServiced"];
  const nextKeys=["next_maintenance","next_maint","maintenance_due","maintenance_next","nextService"];
  const intervalKeys=["maintenance_interval_days","maint_interval_days","maintenance_interval","maint_interval_days"];
  let last=null, next=null, interval=null, notes=null, iaPred=null;
  for(const k of lastKeys){ if(obj[k]){ last=parseTimestamp({time:obj[k]})||parseTimestamp(obj[k]); break; } }
  for(const k of nextKeys){ if(obj[k]){ next=parseTimestamp({time:obj[k]})||parseTimestamp(obj[k]); break; } }
  for(const k of intervalKeys){ if(obj[k]!==undefined){ const n=Number(obj[k]); if(!Number.isNaN(n)) interval=n; break; } }
  if(obj.meta){
    if(!last && obj.meta.last_maintenance) last=parseTimestamp({time:obj.meta.last_maintenance});
    if(!next && obj.meta.next_maintenance) next=parseTimestamp({time:obj.meta.next_maintenance});
    if(!interval && obj.meta.maintenance_interval_days) interval=Number(obj.meta.maintenance_interval_days);
    if(obj.meta.maintenance_notes) notes=obj.meta.maintenance_notes;
    if(obj.meta.maintenance_ia_predicted_next) iaPred = obj.meta.maintenance_ia_predicted_next;
    if(obj.meta.maintenance_ia && obj.meta.maintenance_ia.predicted_next) iaPred = obj.meta.maintenance_ia.predicted_next;
  }
  if(obj.maintenance){
    if(!last && obj.maintenance.last) last=parseTimestamp({time:obj.maintenance.last});
    if(!next && obj.maintenance.next) next=parseTimestamp({time:obj.maintenance.next});
    if(!interval && obj.maintenance.interval_days) interval=Number(obj.maintenance.interval_days);
    if(obj.maintenance.notes) notes = obj.maintenance.notes;
  }
  if(!iaPred && obj.maintenance_ia_predicted_next) iaPred = obj.maintenance_ia_predicted_next;
  return { lastMaintenance:last, nextMaintenance:next, intervalDays:interval, notes:notes||null, iaPredicted:iaPred||null };
}

/* IA prediction endpoint helper */
async function fetchIaPredictionForSensor(sensorId){
  const urls=[
    `${API_BASE}/mlops/maintenance/predict?sensor=${encodeURIComponent(sensorId)}`,
    `${API_BASE}/telemetry/maintenance/predict?sensor=${encodeURIComponent(sensorId)}`,
    `${API_BASE}/mlops/predict_maintenance?sensor=${encodeURIComponent(sensorId)}`
  ];
  for(const u of urls){
    try{
      const r = await fetch(u);
      if(!r.ok) continue;
      const j = await r.json();
      if(j && (j.predicted_next || j.next)) return { predicted_next: j.predicted_next||j.next, confidence: j.confidence??j.confidence_score??null, computed_at: j.computed_at||j.computedAt||new Date().toISOString() };
    }catch(e){ /* ignore */ }
  }
  return null;
}

/* ---------- Render sensors (affiche maintenance + IA) ---------- */
(function populateUnitFilter(){ if(!sensorUnitSelect) return; const units = Array.from(new Set(SENSORS.map(s=>s.unit).filter(Boolean))); for(const u of units){ const o=document.createElement('option'); o.value=u; o.textContent=u; sensorUnitSelect.appendChild(o); } })();

async function renderSensors(filterText=''){
  if(!sensorListRoot) return;
  sensorListRoot.innerHTML = '<div class="card">Chargement…</div>';
  const q = (filterText||'').trim().toLowerCase();
  const unitFilter = sensorUnitSelect ? sensorUnitSelect.value : '';

  const jobs = SENSORS.map(async s => {
    const raw = await getLatestRaw(s.id).catch(()=>null);
    let val = null;
    if(raw){
      if(raw[s.field] !== undefined) val = raw[s.field];
      else if(raw.value !== undefined) val = raw.value;
      else { for(const k of Object.keys(raw)){ if(typeof raw[k] === "number"){ val = raw[k]; break; } } }
    }
    return { sensor:s, raw, value:val };
  });

  const results = await Promise.all(jobs);
  sensorListRoot.innerHTML = '';
  const now = Date.now();
  const STALE_THRESHOLD_SEC = 300;
  const csvRows = [["id","name","value","unit","last_seen","age_s","quality","last_maintenance","next_maintenance","ia_predicted","notes"].join(",")];

  for(const rj of results){
    const s = rj.sensor;
    const name = s.name || s.id;
    const id = s.id || s.field;
    if(q && !(name.toLowerCase().includes(q) || id.toLowerCase().includes(q))) continue;
    if(unitFilter && s.unit !== unitFilter) continue;

    const raw = rj.raw || {};
    const val = rj.value;
    const ts = parseTimestamp(raw);
    const tsText = ts ? ts.toLocaleString() : "—";
    const ageSec = ts ? Math.round((now - ts.getTime())/1000) : Infinity;
    const qual = extractQuality(raw);
    const qualText = (qual===null||qual===undefined) ? "—" : String(qual);

    const m = extractMaintenance(raw);
    const lastMaintText = m.lastMaintenance ? fmtDateShort(m.lastMaintenance) : "—";
    let nextMaint = m.nextMaintenance;
    if(!nextMaint && m.lastMaintenance && m.intervalDays){ nextMaint = new Date(m.lastMaintenance.getTime() + m.intervalDays*24*3600*1000); }
    const nextMaintText = nextMaint ? fmtDateShort(nextMaint) : "—";
    const iaText = m.iaPredicted ? fmtDateShort(m.iaPredicted) : "—";

    const isStale = (!ts) || (ageSec > STALE_THRESHOLD_SEC);
    const staleText = isStale ? `Trous/stale (${isNaN(ageSec)?'?' : ageSec+'s'})` : `OK (${ageSec}s)`;

    const card = document.createElement('div'); card.className='sensor-card';
    const title = document.createElement('div'); title.className='title'; title.textContent = `${name} (${id})`;
    const meta = document.createElement('div'); meta.className='sensor-meta';
    meta.innerHTML = `Unité: ${s.unit||'—'} • Dernière valeur: <strong>${fmt(val)}</strong> • Horodatage: <span class="ts">${tsText}</span>`;

    const valueRow = document.createElement('div'); valueRow.style.display='flex'; valueRow.style.alignItems='center'; valueRow.style.justifyContent='space-between';
    const valEl = document.createElement('div'); valEl.className='sensor-value'; valEl.textContent = (val===null||val===undefined) ? '—' : `${fmt(val)} ${s.unit||''}`;
    valueRow.appendChild(valEl);

    const qPill = document.createElement('div'); qPill.className='data-quality'; qPill.textContent = `Qualité: ${qualText}`;
    if(qualText!=='—' && (qual === 'bad' || qual === '0' || qual === 0 || qual === 'false' || qual === false || String(qual).toLowerCase()==='bad')) qPill.classList.add('bad');
    else if(isStale) qPill.classList.add('stale'); else qPill.classList.add('good');

    const maintenanceRow = document.createElement('div'); maintenanceRow.className='maintenance-row';
    maintenanceRow.innerHTML = `<div class="maintenance-date">Dernière maintenance: <strong>${lastMaintText}</strong></div>
                                <div class="maintenance-date">Maintenance opportune: <strong>${nextMaintText}</strong></div>
                                <div class="maintenance-date">Maintenance (IA): <strong id="ia-${id.replace(/[^a-zA-Z0-9_-]/g,'_')}">${iaText}</strong></div>`;

    const notesRow = document.createElement('div'); notesRow.className='sensor-meta'; notesRow.style.marginTop='6px';
    notesRow.textContent = `Notes maintenance: ${m.notes||'—'}`;

    const staleEl = document.createElement('div'); staleEl.className='sensor-meta'; staleEl.style.marginTop='6px';
    staleEl.textContent = `État: ${staleText}`;

    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px'; actions.style.marginTop='6px';
    const bCopy = document.createElement('button'); bCopy.className='ms-btn'; bCopy.textContent='📋'; bCopy.title='Copier valeur';
    bCopy.addEventListener('click', ()=>{ navigator.clipboard.writeText(`${name} ${fmt(val)} ${s.unit||''} — ${tsText} — ${qualText}`).catch(()=>{}); });
    const bShowRaw = document.createElement('button'); bShowRaw.className='ms-btn'; bShowRaw.textContent='🔎'; bShowRaw.title='Voir RAW';
    bShowRaw.addEventListener('click', ()=>{ alert(JSON.stringify(raw||{value:val}, null, 2)); });
    const bEditM = document.createElement('button'); bEditM.className='ms-btn'; bEditM.textContent='🛠️'; bEditM.title='Éditer maintenance';
    bEditM.addEventListener('click', ()=> openMaintenanceEditor(id, raw));

    actions.append(bCopy, bShowRaw, bEditM);

    card.append(title, meta, valueRow, qPill, maintenanceRow, notesRow, staleEl, actions);
    sensorListRoot.appendChild(card);

    csvRows.push([id, name, val===null?'':val, s.unit||'', ts?ts.toISOString():'', isFinite(ageSec)?ageSec:'', qualText, m.lastMaintenance?m.lastMaintenance.toISOString():'', nextMaint?nextMaint.toISOString():'', m.iaPredicted||'', m.notes||''].map(csvQ).join(","));

    if(!m.iaPredicted){
      (async ()=>{
        try{
          const res = await fetchIaPredictionForSensor(id);
          if(res && res.predicted_next){
            const el = document.getElementById(`ia-${id.replace(/[^a-zA-Z0-9_-]/g,'_')}`);
            if(el) el.textContent = new Date(res.predicted_next).toLocaleString();
            raw.meta = raw.meta || {};
            raw.meta.maintenance_ia_predicted_next = res.predicted_next;
            _LOCAL_MAINT_CACHE[id] = raw;
          }
        }catch(e){ /* ignore */ }
      })();
    }
  }

  if(sensorListRoot.children.length===0) sensorListRoot.innerHTML = '<div class="card">Aucun capteur trouvé pour ce filtre.</div>';
  if(btnExportSensors) btnExportSensors.onclick = ()=> downloadFile(`sensors_filtered_${Date.now()}.csv`, csvRows.join("\n"));
}

/* Hook filters / initial render */
if(sensorFilterInput) sensorFilterInput.addEventListener('input', ()=> renderSensors(sensorFilterInput.value));
if(sensorUnitSelect) sensorUnitSelect.addEventListener('change', ()=> renderSensors(sensorFilterInput?sensorFilterInput.value:'') );
setTimeout(()=>renderSensors(),80);
setInterval(()=>{ renderSensors(sensorFilterInput?sensorFilterInput.value:''); }, 30000);

/* ---------- Maintenance modal helpers ---------- */
function openMaintenanceEditor(sensorId, raw){
  if(!maintModal) return alert("Modal indisponible");
  maintSensorId.textContent = sensorId;
  const m = extractMaintenance(raw||{});
  maintLast.value = m.lastMaintenance ? dateToLocalInput(m.lastMaintenance) : '';
  maintNext.value = m.nextMaintenance ? dateToLocalInput(m.nextMaintenance) : '';
  maintInterval.value = m.intervalDays || '';
  maintNotes.value = m.notes || '';
  maintIaDate.value = m.iaPredicted ? dateToLocalInput(m.iaPredicted) : '';
  maintIaMeta.textContent = 'Dernier calcul: — • Confiance: —';
  if(!maintNext.value) updateMaintNextFromInputs();
  maintNext.removeAttribute('data-manual');
  maintModal.classList.remove('hidden'); maintModal.setAttribute('aria-hidden','false');

  fetchIaPredictionForSensor(sensorId).then(res=>{
    if(res && res.predicted_next){
      maintIaDate.value = isoToLocalInputValue(res.predicted_next);
      maintIaMeta.textContent = `Dernier calcul: ${res.computed_at?new Date(res.computed_at).toLocaleString():'—'} • Confiance: ${res.confidence??'—'}`;
    }
  }).catch(()=>{/*ignore*/});
}
function closeMaintenanceEditor(){ if(!maintModal) return; maintModal.classList.add('hidden'); maintModal.setAttribute('aria-hidden','true'); maintForm?.reset(); maintIaDate.value=''; maintIaMeta.textContent='Dernier calcul: — • Confiance: —'; }
if(maintCancel) maintCancel.addEventListener('click', ()=> closeMaintenanceEditor());

function computeNextIsoFromLocal(lastLocalInputValue, intervalDays){
  if(!lastLocalInputValue) return null;
  const interval = Number(intervalDays); if(!interval || isNaN(interval) || interval<=0) return null;
  const last = new Date(lastLocalInputValue); if(isNaN(last)) return null;
  const next = new Date(last.getTime() + interval*24*3600*1000); return next.toISOString();
}
function updateMaintNextFromInputs(){ if(!maintNext) return; const manualNext = maintNext.value && maintNext.getAttribute('data-manual')==='true'; if(manualNext) return; const lastVal = maintLast.value; const intervalVal = maintInterval.value; const nextIso = computeNextIsoFromLocal(lastVal, intervalVal); maintNext.value = nextIso ? isoToLocalInputValue(nextIso) : ''; }
if(maintNext) maintNext.addEventListener('input', ()=>{ if(!maintNext.value) maintNext.removeAttribute('data-manual'); else maintNext.setAttribute('data-manual','true'); });
if(maintLast) maintLast.addEventListener('change', updateMaintNextFromInputs);
if(maintInterval) maintInterval.addEventListener('input', updateMaintNextFromInputs);

/* Save maintenance */
async function saveMaintenanceForSensor(sensorId){
  if(!maintNext.value && maintLast.value && maintInterval.value){
    const iso = computeNextIsoFromLocal(maintLast.value, maintInterval.value);
    if(iso) maintNext.value = isoToLocalInputValue(iso);
  }

  const payload = {
    maintenance: {
      last: maintLast.value ? new Date(maintLast.value).toISOString() : null,
      next: maintNext.value ? new Date(maintNext.value).toISOString() : null,
      interval_days: maintInterval.value ? Number(maintInterval.value) : null,
      notes: maintNotes.value || null
    },
    maintenance_ia: {
      predicted_next: maintIaDate.value ? new Date(maintIaDate.value).toISOString() : null
    }
  };

  hud("Enregistrement maintenance…");
  try{
    const r = await fetch(`${API_BASE}/telemetry/maintenance?sensor=${encodeURIComponent(sensorId)}`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    if(r.ok){ hud("Maintenance enregistrée (serveur)."); closeMaintenanceEditor(); setTimeout(()=> renderSensors(sensorFilterInput?.value||''),200); return; }
  }catch(e){ /* ignore */ }

  try{
    const r2 = await fetch(`${API_BASE}/sensors/${encodeURIComponent(sensorId)}/maintenance`, {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    if(r2.ok){ hud("Maintenance enregistrée (endpoint alternative)."); closeMaintenanceEditor(); setTimeout(()=> renderSensors(sensorFilterInput?.value||''),200); return; }
  }catch(e){ /* ignore */ }

  // fallback local
  hud("Impossible d'enregistrer sur le serveur — mise à jour locale appliquée.");
  try{
    const raw = await getLatestRaw(sensorId) || {};
    raw.meta = raw.meta || {};
    if(payload.maintenance){
      raw.meta.last_maintenance = payload.maintenance.last;
      raw.meta.next_maintenance = payload.maintenance.next;
      raw.meta.maintenance_interval_days = payload.maintenance.interval_days;
      raw.meta.maintenance_notes = payload.maintenance.notes;
    }
    if(payload.maintenance_ia){
      raw.meta.maintenance_ia_predicted_next = payload.maintenance_ia.predicted_next;
    }
    _LOCAL_MAINT_CACHE[sensorId] = raw;
    closeMaintenanceEditor();
    setTimeout(()=> renderSensors(sensorFilterInput?.value||''),200);
  }catch(e){ closeMaintenanceEditor(); }
}

if(btnIaCompute){
  btnIaCompute.addEventListener('click', async ()=>{
    const sensorId = maintSensorId.textContent;
    if(!sensorId) return hud("Aucun capteur sélectionné.");
    btnIaCompute.disabled = true;
    maintIaMeta.textContent = 'Calcul IA en cours…';
    try{
      const r = await fetchIaPredictionForSensor(sensorId);
      if(r && r.predicted_next){
        maintIaDate.value = isoToLocalInputValue(r.predicted_next);
        maintIaMeta.textContent = `Dernier calcul: ${r.computed_at?new Date(r.computed_at).toLocaleString():'—'} • Confiance: ${r.confidence??'—'}`;
        hud("Prédiction IA récupérée.");
      } else {
        maintIaMeta.textContent = 'IA indisponible';
        hud("IA indisponible.");
      }
    }catch(e){
      maintIaMeta.textContent = 'Erreur IA';
      hud("Erreur IA.");
    } finally { btnIaCompute.disabled = false; }
  });
}
if(maintSaveBtn) maintSaveBtn.addEventListener('click', async ()=>{
  const sid = maintSensorId.textContent; if(!sid) return hud("Aucun capteur sélectionné.");
  maintSaveBtn.disabled = true;
  await saveMaintenanceForSensor(sid);
  maintSaveBtn.disabled = false;
});

/* ========= Actions IA (nouvel onglet) ========= */
async function fetchActions(force=false){
  if(!force && fetchActions._cache) return fetchActions._cache;
  try{
    const r = await fetch(`${API_BASE}/mlops/actions`);
    if(!r.ok) throw new Error('nok');
    const j = await r.json();
    fetchActions._cache = Array.isArray(j) ? j : (j.actions||[]);
    return fetchActions._cache;
  }catch(e){
    return Object.values(_LOCAL_ACTIONS_CACHE);
  }
}
async function postActionToApi(action){
  const r = await fetch(`${API_BASE}/mlops/actions`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(action) });
  if(!r.ok) throw new Error('post failed');
  return await r.json();
}
async function putActionToApi(id, action){
  const r = await fetch(`${API_BASE}/mlops/actions/${encodeURIComponent(id)}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(action) });
  if(!r.ok) throw new Error('put failed');
  return await r.json();
}
async function deleteActionApi(id){
  const r = await fetch(`${API_BASE}/mlops/actions/${encodeURIComponent(id)}`, { method:'DELETE' });
  if(!r.ok) throw new Error('delete failed');
  return true;
}

async function renderActions(filter=''){
  if(!actionsListRoot) return;
  actionsListRoot.innerHTML = '<div class="card">Chargement…</div>';
  const items = await fetchActions(true).catch(()=>[]);
  const q = (filter||'').trim().toLowerCase();
  actionsListRoot.innerHTML = '';

  const rows = [["id","created_at","due_at","action","done","done_at","done_by","source"].join(",")];

  if(!items.length) actionsListRoot.innerHTML = '<div class="card">Aucune action.</div>';
  for(const a of items){
    const id = a.id || a._id || ('local-'+(Math.random()*1e9|0));
    const created = a.created_at || a.created || a.ts || null;
    const due = a.due_at || a.due || null;
    const text = a.text || a.action || '';
    const done = !!a.done;
    const done_at = a.done_at || a.completed_at || null;
    const done_by = a.done_by || a.completed_by || '';

    if(q && !(String(text).toLowerCase().includes(q) || String(id).toLowerCase().includes(q) || (done? 'done' : 'open').includes(q))) continue;

    const card = document.createElement('div'); card.className='action-card';
    card.dataset.id = id;
    const hdr = document.createElement('div'); hdr.className='action-hdr';
    hdr.innerHTML = `<div class="action-id">${id}</div><div class="action-meta">Créée: ${fmtDateShort(created)} • À faire: ${fmtDateShort(due)}</div>`;
    const body = document.createElement('div'); body.className='action-body'; body.textContent = text;
    const foot = document.createElement('div'); foot.className='action-foot';
    foot.innerHTML = `<label class="chk"><input type="checkbox" ${done?'checked':''} data-id="${id}" class="action-toggle" /> Corrigée</label>
                      <div class="action-right">Fait: <strong>${fmtDateShort(done_at)}</strong> • Par: <strong>${done_by||'—'}</strong></div>`;

    const acts = document.createElement('div'); acts.className='action-actions';
    const bEdit = document.createElement('button'); bEdit.className='btn ghost small'; bEdit.textContent='✎'; bEdit.title='Éditer';
    const bDel  = document.createElement('button'); bDel.className='btn ghost small'; bDel.textContent='🗑'; bDel.title='Supprimer';
    bEdit.addEventListener('click', ()=> openActionEditor({ id, created_at:created, due_at:due, text, done, done_at, done_by }));
    bDel.addEventListener('click', async ()=>{
      if(!confirm("Supprimer cette action ?")) return;
      try{
        await deleteActionApi(id);
        hud("Action supprimée (serveur).");
      }catch(e){
        delete _LOCAL_ACTIONS_CACHE[id];
        hud("Suppression locale.");
      }
      renderActions(actionFilterInput?.value||'');
    });
    acts.append(bEdit,bDel);

    card.append(hdr, body, foot, acts);
    actionsListRoot.appendChild(card);

    const chk = card.querySelector('.action-toggle');
    chk?.addEventListener('change', async (ev)=>{
      const checked = ev.target.checked;
      openActionEditor({ id, created_at:created, due_at:due, text, done:checked, done_at: checked ? new Date().toISOString() : null, done_by: checked ? (window.USER_NAME||'technicien') : '' });
    });

    rows.push([id, created||'', due||'', text, done?1:0, done_at||'', done_by||'', a.source||'ai'].map(csvQ).join(","));
  }

  if(btnExportActions) btnExportActions.onclick = ()=> downloadFile(`actions_${Date.now()}.csv`, rows.join("\n"));
}

/* Action modal */
function openActionEditor(action){
  actionIdInput.value = action.id || '';
  actionCreated.value = dateToLocalInput(action.created_at || new Date().toISOString());
  actionDue.value = dateToLocalInput(action.due_at || '');
  actionText.value = action.text || action.action || '';
  actionDone.checked = !!action.done;
  actionDoneDate.value = dateToLocalInput(action.done_at || '');
  actionDoneBy.value = action.done_by || '';
  if(actionModal) { actionModal.classList.remove('hidden'); actionModal.setAttribute('aria-hidden','false'); }
  document.getElementById('action-modal-title').textContent = action.id ? 'Éditer action' : 'Nouvelle action';
}
function closeActionEditor(){ if(actionModal){ actionModal.classList.add('hidden'); actionModal.setAttribute('aria-hidden','true'); } actionForm?.reset(); }
if(btnNewAction) btnNewAction.addEventListener('click', ()=> openActionEditor({}));

async function saveActionFromModal(){
  const id = actionIdInput.value || null;
  const payload = {
    created_at: localInputToIso(actionCreated.value) || new Date().toISOString(),
    due_at: localInputToIso(actionDue.value) || null,
    text: (actionText.value||'').trim(),
    done: actionDone.checked,
    done_at: localInputToIso(actionDoneDate.value) || null,
    done_by: (actionDoneBy.value||'').trim(),
    source: 'ai'
  };
  try{
    if(!id){
      await postActionToApi(payload);
      hud("Action créée (serveur).");
      fetchActions._cache = null;
    } else {
      try{
        await putActionToApi(id, payload);
        hud("Action mise à jour (serveur)."); fetchActions._cache = null;
      }catch(e){
        _LOCAL_ACTIONS_CACHE[id] = Object.assign({ id }, payload);
        hud("Mise à jour locale.");
      }
    }
  }catch(e){
    const nid = id || ('local-'+(Math.random()*1e9|0));
    _LOCAL_ACTIONS_CACHE[nid] = Object.assign({ id:nid }, payload);
    hud("Action sauvegardée localement.");
  } finally {
    closeActionEditor();
    setTimeout(()=> renderActions(actionFilterInput?.value||''), 150);
  }
}
if(actionSaveBtn) actionSaveBtn.addEventListener('click', ()=> saveActionFromModal());
if(actionCancelBtn) actionCancelBtn.addEventListener('click', ()=> closeActionEditor());
if(actionFilterInput) actionFilterInput.addEventListener('input', ()=> renderActions(actionFilterInput.value));

/* initial render */
setTimeout(()=>{ renderActions(); renderSensors(); }, 200);

/* End of file */
