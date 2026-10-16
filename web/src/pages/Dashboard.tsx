import "../dashboard.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { DashboardData, Mode, Period, User, View } from "../lib/types";
import { api, date, time, valueText } from "../lib/api";
import { useDashboard } from "../lib/useDashboard";
import {
  ActionLink,
  Brand,
  Button,
  ErrorBanner,
  Icon,
  IconButton,
  Loading,
  Pill,
} from "../components/ui";
import type { IconName } from "../components/ui";
import BimPanel from "../components/BimPanel";
import TrendPanel from "../components/TrendPanel";
import SensorTable from "../components/SensorTable";
import InsightsPanel from "../components/InsightsPanel";
const views: [View, string, IconName][] = [
  ["overview", "Vue d’ensemble", "grid"],
  ["bim", "Jumeau BIM", "cube"],
  ["sensors", "Capteurs & données", "sensor"],
  ["insights", "Insights", "spark"],
];
const subtitles: Record<View, string> = {
  overview: "Votre bâtiment, en un regard.",
  bim: "Explorez le contexte de vos espaces.",
  sensors: "Les mesures, leur provenance et leur état.",
  insights: "Des signaux à comprendre, des actions à prioriser.",
};
function Summary({
  data,
  change,
}: {
  data: DashboardData;
  change: (patch: Record<string, string>) => void;
}) {
  const acquisitions = data.sensors.flatMap((sensor) =>
    sensor.time ? [new Date(sensor.time).getTime()] : [],
  );
  const latest = acquisitions.length
    ? new Date(Math.max(...acquisitions))
    : null;
  return (
    <section
      className="summary-grid site-summary"
      aria-label="Indicateurs du site"
    >
      <div className="summary-item">
        <span>Mesures disponibles</span>
        <strong>
          {data.sensors.filter((sensor) => sensor.value !== null).length}
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
        <Button
          className="text-button"
          onClick={() => change({ view: "insights" })}
        >
          Consulter les insights <Icon name="arrow" size={14} />
        </Button>
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
function MetricStrip({
  data,
  metric,
  change,
}: {
  data: DashboardData;
  metric: string;
  change: (patch: Record<string, string>) => void;
}) {
  return (
    <section
      className="metric-strip"
      aria-label="Sélection rapide des métriques"
    >
      <div className="metric-strip-heading">
        <h2>Mesures suivies</h2>
        <Button
          className="text-button"
          onClick={() => change({ view: "sensors" })}
        >
          Ouvrir le catalogue <Icon name="arrow" size={16} />
        </Button>
      </div>
      <div
        className="metric-options"
        tabIndex={0}
        role="region"
        aria-label="Métriques, défilement horizontal"
      >
        {data.sensors.map((sensor) => (
          <Button
            key={sensor.id}
            className={`metric-option ${sensor.status === "warning" ? "metric-warning" : ""}`}
            aria-pressed={sensor.id === metric}
            onClick={() => change({ metric: sensor.id })}
          >
            <span className="metric-name">{sensor.name}</span>
            <span className="metric-reading">
              {valueText(sensor.value)} <small>{sensor.unit}</small>
            </span>
            {sensor.status === "warning" && (
              <span className="metric-state">À surveiller</span>
            )}
          </Button>
        ))}
      </div>
    </section>
  );
}

function Dashboard({ mode }: { mode: Mode }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const rawView = params.get("view");
  const view: View = views.some(([key]) => key === rawView)
    ? (rawView as View)
    : "overview";
  const period: Period = params.get("period") === "7d" ? "7d" : "24h";
  const metric = params.get("metric") || "CAP_TEMP";
  const query = params.get("q") || "";
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [leaving, setLeaving] = useState(false);
  function change(patch: Record<string, string>, replace = false) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace, preventScrollReset: true },
    );
  }
  const { data, error, loading, refresh } = useDashboard(
    mode,
    period,
    mode === "demo" || Boolean(user),
    (p) => change({ period: p }, true),
  );
  useEffect(() => {
    if (mode === "demo") return;
    const current = new AbortController();
    api<User>("/api/auth/me", { signal: current.signal })
      .then(setUser)
      .catch((e) => {
        if (e.name === "AbortError") return;
        if (e.status === 401) navigate("/login", { replace: true });
        else setAuthError("Vérifiez votre connexion et rechargez la page.");
      });
    return () => current.abort();
  }, [mode, navigate]);
  useEffect(() => {
    document.title = `${views.find(([key]) => key === view)?.[1]} — EcoTwin`;
  }, [view]);
  // Normalize invalid external links without losing unrelated query parameters.
  useEffect(() => {
    const patch: Record<string, string> = {};
    if (rawView && !views.some(([key]) => key === rawView))
      patch.view = "overview";
    if (params.has("period") && !["24h", "7d"].includes(params.get("period")!))
      patch.period = "24h";
    if (data && !data.sensors.some((sensor) => sensor.id === metric))
      patch.metric = data.sensors[0].id;
    if (Object.keys(patch).length) change(patch, true);
  }, [data, metric, rawView, params]);
  async function logout() {
    if (leaving) return;
    setLeaving(true);
    setLogoutError("");
    try {
      await api("/api/auth/logout", { method: "POST" });
      navigate("/login", { replace: true });
    } catch {
      setLogoutError(
        "Déconnexion impossible. Vérifiez votre connexion et réessayez.",
      );
      setLeaving(false);
    }
  }
  if (authError)
    return (
      <>
        <header className="marketing-nav">
          <Brand />
        </header>
        <main id="main" className="boot">
          <h1>Connexion au service impossible</h1>
          <ErrorBanner
            title="Le service ne répond pas."
            message={authError}
            retry={() => location.reload()}
          />
        </main>
      </>
    );
  if (mode === "live" && !user)
    return (
      <main id="main" className="boot">
        <Loading>Vérification de votre session…</Loading>
      </main>
    );
  const linkFor = (next: View) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("view", next);
    return `/dashboard?${nextParams}`;
  };
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <div className="workspace">
          <span className="workspace-icon">
            <Icon name="building" size={21} />
          </span>
          <div>
            <strong>{data?.site.name || "Atelier EcoTwin"}</strong>
            <span>
              {mode === "demo"
                ? "Site de démonstration"
                : "Site pilote partagé"}
            </span>
          </div>
        </div>
        <span className="nav-label">ESPACE DE TRAVAIL</span>
        <nav aria-label="Navigation du dashboard">
          {views.map(([key, label, symbol]) => (
            <Link
              key={key}
              to={linkFor(key)}
              className={`side-link ${key === view ? "active" : ""}`}
              aria-current={view === key ? "page" : undefined}
            >
              <Icon name={symbol} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="ai-status">
            <Icon name="spark" size={18} />
            <div>
              <strong>Analyse par seuils</strong>
              <span>IA non connectée</span>
            </div>
          </div>
          <Link to="/" className="side-link">
            <Icon name="help" />À propos d’EcoTwin
          </Link>
          {mode === "demo" ? (
            <ActionLink
              to="/login"
              className="button secondary full"
              symbol={null}
            >
              Se connecter
            </ActionLink>
          ) : (
            <Button
              className="button ghost full"
              symbol="logout"
              onClick={logout}
              disabled={leaving}
            >
              {leaving ? "Déconnexion…" : "Se déconnecter"}
            </Button>
          )}
          <div className="profile">
            <span className="avatar">
              {mode === "demo" ? "D" : user?.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>
                {mode === "demo" ? "Espace découverte" : user?.name}
              </strong>
              <span>
                {mode === "demo" ? "Accès en lecture seule" : "Compte pilote"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="dashboard-shell">
        <header className="app-header">
          <div className="breadcrumb">
            <Icon name="building" size={17} />
            <span>Mon site</span>
            <Icon name="chevron" size={13} />
            <strong>{data?.site.name || "Atelier EcoTwin"}</strong>
          </div>
          <div className="header-right">
            <Pill tone={mode === "demo" ? "demo" : ""}>
              {mode === "demo" ? "Démonstration" : "Source réelle"}
            </Pill>
            <IconButton
              label="Actualiser les données"
              symbol="refresh"
              disabled={loading}
              onClick={() => void refresh()}
            />
            {mode === "demo" ? (
              <ActionLink
                to="/login"
                className="button ghost mobile-account"
                symbol={null}
              >
                Connexion
              </ActionLink>
            ) : (
              <Button
                className="button ghost mobile-account"
                onClick={logout}
                disabled={leaving}
              >
                Se déconnecter
              </Button>
            )}
          </div>
        </header>
        <main id="main" className="dashboard-main">
          <div className="page-heading">
            <div>
              <h1>{views.find(([key]) => key === view)?.[1]}</h1>
              <p>{subtitles[view]}</p>
            </div>
            <div className="update-block">
              <span>
                {data
                  ? `Consulté à ${time.format(new Date(data.generated_at))}`
                  : ""}
              </span>
              <p className="connection-status" role="status">
                {loading
                  ? "Actualisation des observations…"
                  : error
                    ? data
                      ? "Dernières données conservées · état périmé"
                      : "Source indisponible"
                    : mode === "demo"
                      ? "Données illustratives · pas horaire"
                      : "Actualisation toutes les 30 s"}
              </p>
            </div>
          </div>
          <div className="data-feedback" aria-live="polite">
            {error && (
              <ErrorBanner
                title={
                  data
                    ? "Les observations ne sont plus à jour."
                    : "La source ne répond pas."
                }
                message={error}
                retry={() => void refresh()}
              />
            )}
            {logoutError && (
              <ErrorBanner
                title="Votre session reste ouverte."
                message={logoutError}
              />
            )}
          </div>
          {mode === "demo" && (
            <div className="demo-banner">
              <Icon name="cube" size={18} />
              <p>
                <strong>Vous explorez un site de démonstration.</strong> Les
                mesures sont illustratives ; le modèle BIM est consultable.
              </p>
              <Link to="/login">
                Mon espace <Icon name="arrow" size={16} />
              </Link>
            </div>
          )}
          <div
            className="dashboard-content"
            data-view={view}
            aria-busy={loading && !data}
          >
            {!data ? (
              loading ? (
                <Loading />
              ) : (
                <div className="empty no-source">
                  <Icon name="sensor" size={32} />
                  <h2>En attente de vos données</h2>
                  <p>
                    La connexion à InfluxDB doit être configurée pour consulter
                    les observations du site.
                  </p>
                  <ActionLink
                    to="/dashboard?mode=demo"
                    className="button secondary"
                  >
                    Explorer le dashboard de démonstration
                  </ActionLink>
                </div>
              )
            ) : (
              <>
                <div hidden={view !== "overview"}>
                  <Summary data={data} change={change} />
                  <MetricStrip data={data} metric={metric} change={change} />
                </div>
                <div
                  className={`primary-grid ${view === "bim" ? "bim-workspace" : ""}`}
                  hidden={view !== "overview" && view !== "bim"}
                >
                  <BimPanel />
                  <div className="trend-slot" hidden={view !== "overview"}>
                    <TrendPanel
                      data={data}
                      metric={metric}
                      period={period}
                      change={change}
                    />
                  </div>
                </div>
                <SensorTable
                  data={data}
                  query={query}
                  change={change}
                  hidden={view !== "sensors"}
                />
                <InsightsPanel
                  data={data}
                  expanded={view === "insights"}
                  hidden={view !== "overview" && view !== "insights"}
                  change={change}
                />
                <section
                  className="panel integration-panel"
                  hidden={view !== "insights"}
                >
                  <Icon name="spark" size={26} />
                  <div>
                    <h2>Une base pour vos futures analyses IA</h2>
                    <p>
                      Les observations et les objets BIM formeront le contexte
                      des analyses. Aucun modèle de prédiction ni fournisseur IA
                      n’est connecté à ce stade.
                    </p>
                    <p className="quiet">
                      Prochaines étapes : sources vérifiées, moteur
                      configurable, preuves associées et validation humaine.
                    </p>
                  </div>
                </section>
                {view === "bim" && (
                  <p className="bim-notice">
                    Le modèle est réel; la correspondance entre objets et
                    mesures reste à configurer.
                  </p>
                )}
              </>
            )}
          </div>
        </main>
        <footer className="app-footer">
          <span>EcoTwin · BIM + données</span>
          <span>Affichage des dates : Europe/Paris</span>
        </footer>
      </div>
    </div>
  );
}
export default function DashboardRoute() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "demo" ? "demo" : "live";
  return <Dashboard key={mode} mode={mode} />;
}
