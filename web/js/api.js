// Appels REST vers FastAPI (placeholder propre)
// Commentaire: centraliser fetch/erreurs/URLs.
const API_BASE = (window.ECOTWIN_API_URL ?? "/api").replace(/\/$/, "");

export async function health() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("API /health non joignable");
  return res.json();
}
