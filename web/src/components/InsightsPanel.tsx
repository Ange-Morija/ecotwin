import { useState } from "react";
import type { DashboardData } from "../lib/types";
import { valueText } from "../lib/api";
import { Icon, IconButton, Pill } from "./ui";
export default function InsightsPanel({
  data,
  expanded,
  change,
  hidden,
}: {
  data: DashboardData;
  expanded: boolean;
  hidden: boolean;
  change: (patch: Record<string, string>) => void;
}) {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <section
      hidden={hidden}
      className={`panel insights-panel ${expanded ? "expanded" : ""}`}
    >
      <div className="panel-heading">
        <h2>Les signaux qui comptent</h2>
        <Pill tone={data.insights.length ? "warning" : "neutral"}>
          {data.insights.length} point{data.insights.length > 1 ? "s" : ""}
        </Pill>
      </div>
      {data.insights.length ? (
        data.insights.map((insight) => (
          <article className="insight" key={insight.sensor}>
            <span className="insight-icon">
              <Icon name="alert" size={18} />
            </span>
            <div>
              <h3>{insight.title}</h3>
              <p>
                {valueText(insight.value)} {insight.unit} · seuil illustratif{" "}
                {valueText(insight.threshold)} {insight.unit}
              </p>
              <p className="quiet">{insight.explanation}</p>
              {insight.stale && (
                <Pill tone="warning">Observation ancienne</Pill>
              )}
              {opened === insight.sensor && (
                <div className="insight-details">
                  <p>Source : règle de dépassement. Aucune prédiction IA.</p>
                  <button
                    className="text-button"
                    onClick={() =>
                      change({ metric: insight.sensor, view: "overview" })
                    }
                  >
                    Examiner la courbe <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </div>
            <IconButton
              label={`${opened === insight.sensor ? "Masquer" : "Consulter"} le détail : ${insight.title}`}
              symbol="chevron"
              aria-expanded={opened === insight.sensor}
              onClick={() =>
                setOpened(opened === insight.sensor ? null : insight.sensor)
              }
            />
          </article>
        ))
      ) : (
        <div className="empty">
          <Icon name="check" size={28} />
          <h3>Aucun dépassement observé</h3>
          <p>
            Les métriques sans mesure ne permettent pas de conclure sur l’état
            du bâtiment.
          </p>
        </div>
      )}
      <p className="panel-note">
        <Icon name="help" size={14} />
        Analyse par seuils · IA non connectée. {data.threshold_note}
      </p>
    </section>
  );
}
