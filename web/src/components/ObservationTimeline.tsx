import { date, valueText } from "../lib/api";
import type { DashboardData } from "../lib/types";
export default function ObservationTimeline({
  data,
  metric,
}: {
  data: DashboardData;
  metric: string;
}) {
  const sensor =
    data.sensors.find((item) => item.id === metric) || data.sensors[0];
  const points = (data.history[sensor.id] || []).slice(-4).reverse();
  return (
    <section
      className="panel observation-timeline"
      aria-labelledby="timeline-title"
    >
      <header>
        <p className="eyebrow">CHRONOLOGIE DES MESURES</p>
        <h2 id="timeline-title">Dernières observations · {sensor.name}</h2>
        <p className="quiet">
          {data.source === "demo"
            ? "Données illustratives"
            : "Observations reçues de la source"}{" "}
          · Europe/Paris
        </p>
      </header>
      {points.length ? (
        <ol>
          {points.map((point) => (
            <li key={point.time}>
              <time dateTime={point.time}>
                {date.format(new Date(point.time))}
              </time>
              <strong>
                {valueText(point.value)} <span>{sensor.unit}</span>
              </strong>
              <span>
                {point.value > sensor.threshold
                  ? "Au-dessus du seuil illustratif"
                  : "Sous le seuil illustratif"}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty">Aucune observation sur cette période.</p>
      )}
    </section>
  );
}
