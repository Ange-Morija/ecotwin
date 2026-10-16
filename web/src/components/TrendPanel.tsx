import { useId, useState } from "react";
import { date, downloadCsv, time, valueText } from "../lib/api";
import type { DashboardData, Period, Point, Sensor } from "../lib/types";
import { Button, Icon } from "./ui";
const emptyPoints: Point[] = [];
function TrendChart({
  points,
  sensor,
  selected,
  onSelect,
}: {
  points: Point[];
  sensor: Sensor;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const titleId = useId();
  if (!points.length)
    return (
      <div className="empty chart-empty">
        <h3>Aucune observation sur cette période</h3>
        <p>Choisissez une autre métrique ou une autre période.</p>
      </div>
    );
  const values = points.map((p) => p.value);
  const min = Math.min(...values, sensor.threshold);
  const max = Math.max(...values, sensor.threshold);
  const padding = (max - min || Math.abs(max) || 1) * 0.15;
  const low = min - padding,
    high = max + padding;
  const timestamps = points.map((point) => new Date(point.time).getTime());
  const duration = timestamps[timestamps.length - 1] - timestamps[0] || 1;
  const x = (index: number) =>
    52 + ((timestamps[index] - timestamps[0]) / duration) * 486;
  const y = (value: number) => 175 - ((value - low) / (high - low)) * 150;
  const label = `${sensor.name}, ${points.length} observations en ${sensor.unit}`;
  return (
    <>
      <svg
        className="trend-chart"
        viewBox="0 0 570 215"
        role="img"
        aria-labelledby={titleId}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const position = ((event.clientX - box.left) / box.width) * 570;
          const target = timestamps[0] + ((position - 52) / 486) * duration;
          onSelect(
            timestamps.reduce(
              (closest, timestamp, index) =>
                Math.abs(timestamp - target) <
                Math.abs(timestamps[closest] - target)
                  ? index
                  : closest,
              0,
            ),
          );
        }}
      >
        <title id={titleId}>{label}</title>
        {[0, 1, 2, 3].map((tick) => {
          const value = low + ((high - low) * tick) / 3;
          return (
            <g key={tick}>
              <line
                x1={52}
                x2={538}
                y1={y(value)}
                y2={y(value)}
                stroke="#dce5eb"
              />
              <text
                x={43}
                y={y(value) + 4}
                textAnchor="end"
                fill="var(--muted)"
                fontSize={11}
              >
                {valueText(value)}
              </text>
            </g>
          );
        })}
        <text x="52" y="14" fill="var(--muted)" fontSize="11">
          {sensor.unit}
        </text>
        <line
          x1={52}
          x2={538}
          y1={y(sensor.threshold)}
          y2={y(sensor.threshold)}
          stroke="#9a5b10"
          strokeDasharray="4 5"
        />
        <text
          x={538}
          y={y(sensor.threshold) - 7}
          textAnchor="end"
          fill="#9a5b10"
          fontSize="10"
        >
          Seuil illustratif {valueText(sensor.threshold)}
        </text>
        <path
          d={points
            .map(
              (point, index) =>
                `${index && timestamps[index] - timestamps[index - 1] <= 90 * 60 * 1000 ? "L" : "M"}${x(index)},${y(point.value)}`,
            )
            .join(" ")}
          fill="none"
          stroke="var(--primary)"
          className="animated-curve"
          pathLength="1"
          key={`${sensor.id}-${points.length}`}
          strokeWidth="2.5"
        />
        {points.map((point, index) => (
          <circle
            key={point.time}
            cx={x(index)}
            cy={y(point.value)}
            r="2"
            fill="var(--primary)"
          />
        ))}
        <line
          x1={x(selected)}
          x2={x(selected)}
          y1={25}
          y2={175}
          stroke="var(--ink)"
          strokeDasharray="2 4"
        />
        <circle
          cx={x(selected)}
          cy={y(points[selected].value)}
          r="4"
          fill="var(--ink)"
          stroke="white"
          strokeWidth="2"
        />
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map(
          (index, i) => (
            <text
              key={i}
              x={x(index)}
              y="200"
              textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
              fill="var(--muted)"
              fontSize="11"
            >
              {time.format(new Date(points[index].time))}
            </text>
          ),
        )}
      </svg>
      <div className="observation-picker">
        <label htmlFor={`observation-${sensor.id}`}>
          Observation sélectionnée
        </label>
        <output>
          {date.format(new Date(points[selected].time))} ·{" "}
          <strong>
            {valueText(points[selected].value)} {sensor.unit}
          </strong>
        </output>
        <input
          id={`observation-${sensor.id}`}
          type="range"
          min={0}
          max={points.length - 1}
          value={selected}
          onChange={(event) => onSelect(Number(event.target.value))}
          aria-valuetext={`${date.format(new Date(points[selected].time))}, ${valueText(points[selected].value)} ${sensor.unit}`}
        />
      </div>
    </>
  );
}
export default function TrendPanel({
  data,
  metric,
  period,
  change,
}: {
  data: DashboardData;
  metric: string;
  period: Period;
  change: (patch: Record<string, string>) => void;
}) {
  const sensor = data.sensors.find((s) => s.id === metric) || data.sensors[0];
  const points = data.history[sensor.id] || emptyPoints;
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<{
    sensor: string;
    index: number;
  } | null>(null);
  const selected =
    selection?.sensor === sensor.id
      ? Math.min(selection.index, Math.max(0, points.length - 1))
      : Math.max(0, points.length - 1);
  return (
    <section className="panel trend-panel">
      <div className="panel-heading">
        <div>
          <h2>Historique des mesures</h2>
          <p className="panel-subtitle">
            Une acquisition, son contexte, son évolution
          </p>
        </div>
        <Icon name="chart" />
      </div>
      <div className="chart-controls">
        <div className="chart-filter">
          <label htmlFor="trend-metric">Métrique</label>
          <select
            aria-label="Métrique"
            id="trend-metric"
            value={sensor.id}
            onChange={(event) => {
              setSelection(null);
              change({ metric: event.target.value });
            }}
          >
            {data.sensors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="chart-filter">
          <label htmlFor="trend-period">Période</label>
          <select
            aria-label="Période"
            id="trend-period"
            value={period}
            onChange={(e) => {
              setSelection(null);
              change({ period: e.target.value });
            }}
          >
            <option value="24h">Dernières 24 heures</option>
            <option value="7d">7 derniers jours</option>
          </select>
        </div>
      </div>
      <div className="chart-value">
        <strong>{valueText(sensor.value)}</strong>
        <span>{sensor.unit}</span>
        <span className="quiet">
          {sensor.time
            ? `Dernière acquisition : ${date.format(new Date(sensor.time))}`
            : "Aucune acquisition"}
        </span>
      </div>
      <TrendChart
        points={points}
        sensor={sensor}
        selected={selected}
        onSelect={(index) => setSelection({ sensor: sensor.id, index })}
      />
      <div className="chart-caption">
        <span>Pas horaire · dernière valeur reçue</span>
        <span>
          Source : {data.source === "demo" ? "démonstration" : "InfluxDB"}
        </span>
      </div>
      <details
        className="chart-table"
        open={open}
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary>Consulter les valeurs du graphique</summary>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Valeurs du graphique, défilement"
        >
          <table>
            <caption className="sr-only">
              {sensor.name}, valeurs en {sensor.unit}
            </caption>
            <thead>
              <tr>
                <th scope="col">Acquisition</th>
                <th scope="col">Valeur ({sensor.unit})</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.time}>
                  <td>{date.format(new Date(p.time))}</td>
                  <td>{valueText(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          className="text-button"
          symbol="download"
          onClick={() =>
            downloadCsv(`ecotwin-${sensor.id}-${period}.csv`, [
              ["source", "capteur", "horodatage_utc", "valeur", "unite"],
              ...points.map((p) => [
                data.source,
                sensor.id,
                p.time,
                p.value,
                sensor.unit,
              ]),
            ])
          }
        >
          Exporter les observations
        </Button>
      </details>
    </section>
  );
}
