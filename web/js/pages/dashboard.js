// Page dashboard basique (future intégration Grafana/Influx)
import { cardLatest } from "../components/card-latest.js";

export function mountDashboard(root) {
  root.innerHTML = "";
  const row = document.createElement("div");
  row.className = "row";
  row.append(cardLatest({ title: "Température", value: 22.4, unit: "°C" }));
  row.append(cardLatest({ title: "CO₂", value: 612, unit: "ppm" }));
  root.append(row);
}
