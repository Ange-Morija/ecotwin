// ===== Config Grafana (à adapter) =====
// Commentaires brefs : base URL, UID du dashboard, orgId, time range, refresh, panelIds.
const GRAFANA = {
  baseUrl: "http://localhost:3000",     // URL Grafana (reverse-proxy ok)
  orgId: 1,                             // ID d’organisation
  dashboardUid: "YOUR_DASHBOARD_UID",   // UID du dashboard (Share → Embed)
  from: "now-24h",                      // fenêtre temporelle
  to: "now",
  refresh: "30s",                       // auto-refresh
  theme: document.documentElement.classList.contains("light") ? "light" : "dark",
  panels: {
    temperature:  2,   // panelId Température
    humidity:     3,   // panelId Humidité
    pm25:         4,   // panelId PM2.5
    pm10:         5,   // panelId PM10
    so2:          6,   // panelId SO2
    co:           7,   // panelId CO
    o3:           8    // panelId O3
  }
};

// ===== Construit l'URL d'un panel "d-solo" =====
// Réf: Share → Embed -> /d-solo/{uid}/{slug}?orgId=...&panelId=...  :contentReference[oaicite:4]{index=4}
function buildPanelSrc(panelId){
  const u = new URL(`${GRAFANA.baseUrl}/d-solo/${GRAFANA.dashboardUid}/ecotwin`);
  u.searchParams.set("orgId", String(GRAFANA.orgId));
  u.searchParams.set("panelId", String(panelId));
  u.searchParams.set("from", GRAFANA.from);
  u.searchParams.set("to", GRAFANA.to);
  u.searchParams.set("theme", GRAFANA.theme);
  u.searchParams.set("refresh", GRAFANA.refresh);          // auto-refresh (supporté sur les URLs de panel)
  u.searchParams.set("timezone", "browser");
  u.searchParams.set("kiosk", "tv");                        // masque l'UI Grafana
  return u.toString();
}

// ===== Applique les URLs aux iframes =====
const map = [
  ["panel-temperature", GRAFANA.panels.temperature],
  ["panel-humidity",    GRAFANA.panels.humidity],
  ["panel-pm25",        GRAFANA.panels.pm25],
  ["panel-pm10",        GRAFANA.panels.pm10],
  ["panel-so2",         GRAFANA.panels.so2],
  ["panel-co",          GRAFANA.panels.co],
  ["panel-o3",          GRAFANA.panels.o3]
];

for (const [id, pid] of map) {
  const el = document.getElementById(id);
  if (el && pid) el.src = buildPanelSrc(pid);
}

// (Optionnel) si tu bascules le thème en live, recharger les iframes pour changer "theme="
document.getElementById("btn-theme")?.addEventListener("click", () => {
  GRAFANA.theme = document.documentElement.classList.contains("light") ? "light" : "dark";
  for (const [id, pid] of map) {
    const el = document.getElementById(id);
    if (el && pid) el.src = buildPanelSrc(pid);
  }
});
