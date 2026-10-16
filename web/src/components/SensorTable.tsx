import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { date, downloadCsv, valueText } from "../lib/api";
import type { DashboardData, Sensor, SensorStatus } from "../lib/types";
import { Button, Icon, IconButton, Pill } from "./ui";
const states: Record<SensorStatus, string> = {
  normal: "Sous le seuil",
  warning: "À surveiller",
  stale: "Donnée ancienne",
  missing: "Sans mesure",
};
type SortKey = "name" | "status" | "time";
export default function SensorTable({
  data,
  query,
  change,
  hidden,
}: {
  data: DashboardData;
  query: string;
  change: (patch: Record<string, string>, replace?: boolean) => void;
  hidden: boolean;
}) {
  const [params] = useSearchParams();
  const sortKey = params.get("sort");
  const key: SortKey =
    sortKey === "status" || sortKey === "time" ? sortKey : "name";
  const direction = params.get("dir") === "desc" ? -1 : 1;
  const sort = useMemo(() => ({ key, direction }), [key, direction]);
  const state = params.get("state") || "all";
  const status = Object.hasOwn(states, state) ? state : "all";
  const [draftQuery, setDraftQuery] = useState(query);
  useEffect(() => setDraftQuery(query), [query]);
  function setSort(next: { key: SortKey; direction: number }) {
    change({ sort: next.key, dir: next.direction === 1 ? "asc" : "desc" });
  }
  function setStatus(next: string) {
    change({ state: next === "all" ? "" : next });
  }
  const rows = useMemo(
    () =>
      data.sensors
        .filter(
          (sensor) =>
            `${sensor.name} ${sensor.id}`
              .toLocaleLowerCase("fr")
              .includes(query.toLocaleLowerCase("fr")) &&
            (status === "all" || sensor.status === status),
        )
        .sort((a, b) => {
          if (sort.key === "time" && (!a.time || !b.time))
            return Number(!a.time) - Number(!b.time);
          return (
            sort.direction *
            (sort.key === "time"
              ? new Date(a.time!).getTime() - new Date(b.time!).getTime()
              : String(
                  sort.key === "status" ? states[a.status] : a.name,
                ).localeCompare(
                  String(sort.key === "status" ? states[b.status] : b.name),
                  "fr",
                  { numeric: true },
                ))
          );
        }),
    [data.sensors, query, sort, status],
  );
  const header = (label: string, key: SortKey) => (
    <th
      scope="col"
      aria-sort={
        sort.key === key
          ? sort.direction === 1
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <Button
        className="sort-button"
        aria-label={`Trier par ${label}, ordre ${sort.key === key && sort.direction === 1 ? "décroissant" : "croissant"}`}
        onClick={() =>
          setSort({ key, direction: sort.key === key ? -sort.direction : 1 })
        }
      >
        {label}
      </Button>
    </th>
  );
  function exportRows(list: Sensor[]) {
    downloadCsv("ecotwin-capteurs.csv", [
      ["source", "capteur", "metrique", "valeur", "unite", "acquisition"],
      ...list.map((sensor) => [
        data.source,
        sensor.id,
        sensor.name,
        sensor.value,
        sensor.unit,
        sensor.time,
      ]),
    ]);
  }
  return (
    <section className="panel sensors-panel" hidden={hidden}>
      <div className="panel-heading">
        <h2>Les données environnementales</h2>
        <Button
          className="button secondary small"
          symbol="download"
          onClick={() => exportRows(rows)}
        >
          Exporter le catalogue
        </Button>
      </div>
      <div className="table-toolbar">
        <div className="search-field">
          <Icon name="search" size={17} />
          <input
            type="search"
            id="sensor-query"
            aria-label="Rechercher une métrique"
            placeholder="Rechercher une métrique…"
            value={draftQuery}
            onChange={(e) => {
              setDraftQuery(e.target.value);
              if (!(e.nativeEvent as InputEvent).isComposing)
                change({ q: e.target.value }, true);
            }}
            onCompositionEnd={(event) =>
              change({ q: event.currentTarget.value }, true)
            }
          />
          {query && (
            <IconButton
              label="Effacer la recherche"
              symbol="close"
              onClick={() => {
                setDraftQuery("");
                change({ q: "" }, true);
                document
                  .querySelector<HTMLInputElement>("#sensor-query")
                  ?.focus();
              }}
            />
          )}
        </div>
        <select
          aria-label="État des métriques"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Tous les états</option>
          {Object.entries(states).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <p className="quiet table-count" aria-live="polite">
          {rows.length} métrique{rows.length > 1 ? "s" : ""} sur{" "}
          {data.sensors.length}
        </p>
      </div>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Catalogue des métriques, défilement horizontal"
      >
        <table>
          <caption className="sr-only">
            Huit métriques environnementales du site avec unité, état et
            dernière acquisition
          </caption>
          <thead>
            <tr>
              {header("Métrique", "name")}
              <th scope="col">Dernière valeur</th>
              {header("État", "status")}
              {header("Acquisition", "time")}
              <th scope="col">Explorer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((sensor) => (
              <tr key={sensor.id}>
                <td>
                  <strong>{sensor.name}</strong>
                  <span className="cell-meta mono">{sensor.id}</span>
                </td>
                <td className="numeric">
                  <strong>{valueText(sensor.value)}</strong>
                  <span className="unit">{sensor.unit}</span>
                </td>
                <td>
                  <Pill
                    tone={
                      sensor.status === "warning"
                        ? "warning"
                        : sensor.status === "normal"
                          ? "normal"
                          : "neutral"
                    }
                  >
                    {states[sensor.status]}
                  </Pill>
                </td>
                <td>
                  {sensor.time ? date.format(new Date(sensor.time)) : "—"}
                </td>
                <td>
                  <Button
                    className="text-button"
                    symbol="chart"
                    onClick={() =>
                      change({ metric: sensor.id, view: "overview" })
                    }
                  >
                    Voir la courbe
                  </Button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5}>
                  <div className="empty">
                    <p>
                      Aucune métrique ne correspond. Effacez la recherche pour
                      afficher le catalogue.
                    </p>
                    <Button
                      onClick={() => {
                        setStatus("all");
                        setDraftQuery("");
                        change({ q: "" }, true);
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
