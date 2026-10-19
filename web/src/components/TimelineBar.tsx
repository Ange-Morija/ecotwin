import { useEffect, useState } from "react";
import { date, time, valueText } from "../lib/api";
import { resolveIndex } from "../lib/types";
import type { DashboardData, Mode, Selection } from "../lib/types";
import { IconButton } from "./ui";
export default function TimelineBar({
  data,
  metric,
  mode,
  selection,
  onSelection,
  autoRefresh,
  onAutoRefresh,
  loading,
  failed,
}: {
  data: DashboardData;
  metric: string;
  mode: Mode;
  selection: Selection;
  onSelection: (selection: Selection) => void;
  autoRefresh: boolean;
  onAutoRefresh: (value: boolean) => void;
  loading: boolean;
  failed: boolean;
}) {
  const sensor =
    data.sensors.find((item) => item.id === metric) || data.sensors[0];
  const points = data.history[sensor.id] || [];
  const last = Math.max(0, points.length - 1);
  const index = resolveIndex(selection, sensor.id, points.length);
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [sensor.id, points.length]);
  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(
      () => onSelection({ sensor: sensor.id, index: index + 1 }),
      700,
    );
    return () => clearTimeout(timer);
  }, [playing, index, last, onSelection, sensor.id]);
  const go = (next: number) =>
    onSelection({
      sensor: sensor.id,
      index: Math.min(last, Math.max(0, next)),
    });
  const point = points[index];
  const status = loading
    ? "Actualisation des observations…"
    : failed
      ? "Dernières données conservées · état périmé"
      : !autoRefresh
        ? "Actualisation automatique en pause"
        : mode === "demo"
          ? "Données illustratives · pas horaire"
          : "Actualisation toutes les 30 s";
  return (
    <footer className="timeline-bar">
      <div
        className="playback"
        role="group"
        aria-label="Lecture de l’historique"
      >
        <IconButton
          label="Observation précédente"
          symbol="chevron"
          className="icon-button flip"
          disabled={!points.length || index <= 0}
          onClick={() => go(index - 1)}
        />
        <IconButton
          label={playing ? "Mettre la lecture en pause" : "Lire l’historique"}
          symbol={playing ? "pause" : "play"}
          disabled={!points.length}
          aria-pressed={playing}
          onClick={() => {
            if (!playing && index >= last) go(0);
            setPlaying(!playing);
          }}
        />
        <IconButton
          label="Observation suivante"
          symbol="chevron"
          disabled={!points.length || index >= last}
          onClick={() => go(index + 1)}
        />
      </div>
      <div className="timeline-track" aria-hidden="true">
        {points.length > 1 && (
          <>
            <span className="tick" style={{ left: "0%" }}>
              {time.format(new Date(points[0].time))}
            </span>
            <span className="tick" style={{ left: "50%" }}>
              {time.format(new Date(points[Math.floor(last / 2)].time))}
            </span>
            <span className="tick end" style={{ left: "100%" }}>
              {time.format(new Date(points[last].time))}
            </span>
            <i className="head" style={{ left: `${(index / last) * 100}%` }} />
          </>
        )}
      </div>
      <output className="timeline-readout">
        {point ? (
          <>
            {date.format(new Date(point.time))} ·{" "}
            <strong>
              {valueText(point.value)} {sensor.unit}
            </strong>
          </>
        ) : (
          "Aucune observation"
        )}
      </output>
      <div className="timeline-status">
        <label className="auto-refresh">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => onAutoRefresh(event.target.checked)}
          />
          Actualisation automatique
        </label>
        <p className="connection-status" role="status">
          {status}
        </p>
        <span>
          Consulté à {time.format(new Date(data.generated_at))} · Europe/Paris ·
          Source : {mode === "demo" ? "démonstration" : "InfluxDB"}
        </span>
      </div>
    </footer>
  );
}
