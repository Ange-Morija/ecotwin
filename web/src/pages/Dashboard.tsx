import "@fontsource-variable/manrope";
import "../dashboard.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { DashboardData, Mode, Period, User, View } from "../lib/types";
import { api, date, time, valueText } from "../lib/api";
import { useDashboard } from "../lib/useDashboard";
import { useChanged, useCountUp } from "../lib/motion";
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
import Assistant from "../components/Assistant";
import ObservationTimeline from "../components/ObservationTimeline";
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
function MetricOption({
  sensor,
  selected,
  index,
  onSelect,
}: {
  sensor: DashboardData["sensors"][number];
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
    <Button
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
    </Button>
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
        aria-label="Métriques disponibles"
      >
        {data.sensors.map((sensor, index) => (
          <MetricOption
            key={sensor.id}
            sensor={sensor}
            index={index}
            selected={sensor.id === metric}
            onSelect={() => change({ metric: sensor.id })}
          />
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchRequested, setSearchRequested] = useState(false);
  const hasFilters = Boolean(
    query ||
      params.get("state") ||
      params.get("sort") ||
      params.get("dir") ||
      period !== "24h" ||
      metric !== "CAP_TEMP",
  );
  function search() {
    change({ view: "sensors" });
    setSearchRequested(true);
  }
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key !== "/" ||
        Boolean(document.querySelector("dialog[open]")) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        target?.closest("input,textarea,select,[contenteditable='true']")
      )
        return;
      event.preventDefault();
      search();
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [setParams]);
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
    autoRefresh,
  );
  useEffect(() => {
    if (!searchRequested || view !== "sensors" || !data) return;
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>("#sensor-query")?.focus();
      setSearchRequested(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [searchRequested, view, data]);

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
          <Link to="/account" className="side-link">
            Mon compte
          </Link>
          <Link to="/business" className="side-link">
            Business et facturation
          </Link>
          <div className="ai-status">
            <Icon name="spark" size={18} />
            <div>
              <strong>Analyse par seuils</strong>
              <span>Règles explicables</span>
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
            <Assistant mode={mode} />
            <Button
              className="workspace-search"
              symbol="search"
              onClick={search}
              aria-label="Rechercher une métrique"
            >
              <span>Rechercher</span>
              <kbd>/</kbd>
            </Button>
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
        <nav className="mobile-services" aria-label="Compte et facturation">
          <Link to="/account">Mon compte</Link>
          <Link to="/business">Business et facturation</Link>
        </nav>
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
                    : !autoRefresh
                      ? "Actualisation automatique en pause"
                      : mode === "demo"
                        ? "Données illustratives · pas horaire"
                        : "Actualisation toutes les 30 s"}
              </p>
            </div>
          </div>
          {data && (
            <div
              className="workspace-toolbar"
              aria-label="Contrôles du tableau de bord"
            >
              <span className="workspace-source">
                Source : {mode === "demo" ? "démonstration" : "InfluxDB"}
              </span>
              {view !== "overview" && (
                <div className="workspace-period">
                  <label htmlFor="workspace-period">Période</label>
                  <select
                    id="workspace-period"
                    value={period}
                    onChange={(event) => change({ period: event.target.value })}
                  >
                    <option value="24h">Dernières 24 heures</option>
                    <option value="7d">7 derniers jours</option>
                  </select>
                </div>
              )}
              <label className="auto-refresh">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(event) => setAutoRefresh(event.target.checked)}
                />
                Actualisation automatique
              </label>
              {hasFilters && (
                <Button
                  className="text-button"
                  symbol="refresh"
                  onClick={() =>
                    change({
                      q: "",
                      state: "",
                      sort: "",
                      dir: "",
                      period: "24h",
                      metric: "CAP_TEMP",
                    })
                  }
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}
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
                <div className="overview-intro" hidden={view !== "overview"}>
                  <Summary data={data} change={change} />
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
                <div className="metrics-slot" hidden={view !== "overview"}>
                  <MetricStrip data={data} metric={metric} change={change} />
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
                {view === "overview" && (
                  <ObservationTimeline data={data} metric={metric} />
                )}
                {view === "insights" && (
                  <section className="panel integration-panel">
                    <Icon name="spark" size={26} />
                    <div>
                      <h2>Compléter vos analyses avec l’assistant</h2>
                      <p>
                        Ouvrez « Assistant IA » pour poser une question. L’envoi
                        d’observations demande votre accord. Les alertes
                        ci-dessus restent calculées par des règles,
                        indépendamment du chatbot.
                      </p>
                    </div>
                  </section>
                )}
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
