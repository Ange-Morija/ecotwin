import { useState } from "react";
import type { DashboardData, Sensor } from "../lib/types";
import { date, time, valueText } from "../lib/api";
import { useChanged, useCountUp } from "../lib/motion";
import { Icon } from "./ui";
import InsightsPanel from "./InsightsPanel";
const FALLBACK_FAMILY = "Environnement";
function Summary({
  data,
  onInsights,
}: {
  data: DashboardData;
  onInsights: () => void;
}) {
  const acquisitions = data.sensors.flatMap((sensor) =>
    sensor.time ? [new Date(sensor.time).getTime()] : [],
  );
  const latest = acquisitions.length
    ? new Date(Math.max(...acquisitions))
    : null;
  const measured = data.sensors.filter((sensor) => sensor.value !== null);
  const over = measured.filter((sensor) => sensor.status === "warning").length;
  const within = measured.length - over;
  const rate = useCountUp(
    measured.length ? Math.round((within / measured.length) * 100) : null,
  );
  return (
    <section
      className="summary-grid site-summary"
      aria-label="Indicateurs du site"
    >
      <div className="summary-item compliance-summary">
        <span>Conformité aux seuils</span>
        <strong>
          {rate ?? "—"}
          {measured.length > 0 && <small> %</small>}
        </strong>
        <div
          className="compliance-bar"
          role="img"
          aria-label={`${within} métriques sous le seuil, ${over} au-dessus, ${data.sensors.length - measured.length} sans mesure`}
        >
          {data.sensors.map((sensor) => (
            <i
              key={sensor.id}
              className={
                sensor.value === null
                  ? "none"
                  : sensor.status === "warning"
                    ? "over"
                    : "ok"
              }
            />
          ))}
        </div>
        <span>
          {within} sous · {over} au-dessus du seuil
        </span>
      </div>
      <div className="summary-item">
        <span>Mesures disponibles</span>
        <strong>
          {measured.length}
          <small> / {data.sensors.length}</small>
        </strong>
        <span>métriques sur la période</span>
      </div>
      <div className="summary-item">
        <span>Points de vigilance</span>
        <strong className={data.insights.length ? "vigilance-value" : ""}>
          {data.insights.length}
          <small>
            {" "}
            seuil{data.insights.length > 1 ? "s" : ""} dépassé
            {data.insights.length > 1 ? "s" : ""}
          </small>
        </strong>
        <button type="button" className="text-button" onClick={onInsights}>
          Consulter les points <Icon name="arrow" size={14} />
        </button>
      </div>
      <div className="summary-item acquisition-summary">
        <span>Dernière acquisition</span>
        <strong>{latest ? time.format(latest) : "—"}</strong>
        <span>
          {latest
            ? date.format(latest) + " · Europe/Paris"
            : "Aucune mesure reçue"}
        </span>
      </div>
    </section>
  );
}
function SensorRow({
  sensor,
  selected,
  index,
  onSelect,
}: {
  sensor: Sensor;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const changed = useChanged(sensor.value);
  const ratio =
    sensor.value !== null && sensor.threshold > 0
      ? (sensor.value / sensor.threshold) * 100
      : null;
  return (
    <button
      type="button"
      className={`metric-option ${sensor.status === "warning" ? "metric-warning" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="metric-name">{sensor.name}</span>
      <span className={`metric-reading ${changed ? "value-changed" : ""}`}>
        {valueText(sensor.value)} <small>{sensor.unit}</small>
      </span>
      {ratio !== null && (
        <span
          className="metric-gauge"
          role="img"
          aria-label={`${Math.round(ratio)} % du seuil illustratif`}
        >
          <i style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }} />
        </span>
      )}
      {sensor.status === "warning" && (
        <span className="metric-state tag-warning">À surveiller</span>
      )}
      {sensor.value === null && (
        <span className="metric-state tag-missing">Sans mesure</span>
      )}
    </button>
  );
}
function FamilyGroup({
  family,
  sensors,
  metric,
  change,
}: {
  family: string;
  sensors: Sensor[];
  metric: string;
  change: (patch: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(true);
  const warnings = sensors.filter((sensor) => sensor.status === "warning");
  return (
    <div className="family-group">
      <button
        type="button"
        className="family-heading"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name="chevron" size={14} />
        <strong>{family}</strong>
        <span>
          {sensors.length} capteur{sensors.length > 1 ? "s" : ""}
          {warnings.length ? ` · ${warnings.length} à surveiller` : ""}
        </span>
      </button>
      {open &&
        sensors.map((sensor, index) => (
          <SensorRow
            key={sensor.id}
            sensor={sensor}
            index={index}
            selected={sensor.id === metric}
            onSelect={() => change({ metric: sensor.id })}
          />
        ))}
    </div>
  );
}
export default function SensorsPanel({
  data,
  metric,
  change,
}: {
  data: DashboardData;
  metric: string;
  change: (patch: Record<string, string>) => void;
}) {
  const [tab, setTab] = useState<"sensors" | "insights">("sensors");
  const families = new Map<string, Sensor[]>();
  for (const sensor of data.sensors) {
    const family = sensor.family || FALLBACK_FAMILY;
    families.set(family, [...(families.get(family) || []), sensor]);
  }
  return (
    <section className="float-panel sensors-float" aria-label="Capteurs">
      <div
        className="float-tabs"
        role="tablist"
        aria-label="Capteurs et alertes"
      >
        <button
          type="button"
          role="tab"
          id="tab-sensors"
          aria-selected={tab === "sensors"}
          aria-controls="tabpanel-sensors"
          onClick={() => setTab("sensors")}
        >
          Capteurs
        </button>
        <button
          type="button"
          role="tab"
          id="tab-insights"
          aria-selected={tab === "insights"}
          aria-controls="tabpanel-insights"
          onClick={() => setTab("insights")}
        >
          Points à examiner
          <span className="tab-count">{data.insights.length}</span>
        </button>
      </div>
      <div
        role="tabpanel"
        id="tabpanel-sensors"
        aria-labelledby="tab-sensors"
        hidden={tab !== "sensors"}
      >
        <Summary data={data} onInsights={() => setTab("insights")} />
        <div
          className="metric-options"
          tabIndex={0}
          role="region"
          aria-label="Métriques disponibles"
        >
          {[...families].map(([family, sensors]) => (
            <FamilyGroup
              key={family}
              family={family}
              sensors={sensors}
              metric={metric}
              change={change}
            />
          ))}
        </div>
        <div className="float-footer">
          <button
            type="button"
            className="text-button"
            onClick={() => change({ view: "sensors" })}
          >
            Ouvrir le catalogue <Icon name="arrow" size={14} />
          </button>
          <a href="/public/index.html" className="text-button">
            Outils BIM, maintenance et actions <Icon name="arrow" size={14} />
          </a>
        </div>
      </div>
      <div
        role="tabpanel"
        id="tabpanel-insights"
        aria-labelledby="tab-insights"
        hidden={tab !== "insights"}
      >
        <InsightsPanel
          data={data}
          expanded={false}
          hidden={false}
          change={change}
        />
      </div>
    </section>
  );
}
