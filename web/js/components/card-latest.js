// Petite carte UI (télémétrie récente) — placeholder
export function cardLatest({ title, value, unit }) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `
    <div class="card-title">${title}</div>
    <div class="card-value">${value ?? "—"} <span class="unit">${unit ?? ""}</span></div>
  `;
  return el;
}
