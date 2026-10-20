import "@fontsource-variable/manrope";
import "../dashboard.css";
import "../theme.css";
import "../workspace.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Mode, Period, Selection, User, View } from "../lib/types";
import { api, time } from "../lib/api";
import { useDashboard } from "../lib/useDashboard";
import { useTheme } from "../lib/theme";
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
import InsightsPanel from "../components/InsightsPanel";
import SensorsPanel from "../components/SensorsPanel";
import TimelineBar from "../components/TimelineBar";
const views: [View, string, IconName][] = [
  ["overview", "Vue d’ensemble", "grid"],
  ["sensors", "Capteurs & données", "sensor"],
  ["insights", "Insights", "spark"],
];
const subtitles: Record<View, string> = {
  overview: "Votre bâtiment, en un regard.",
  sensors: "Les mesures, leur provenance et leur état.",
  insights: "Des signaux à comprendre, des actions à prioriser.",
};
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
  const { theme, toggle: toggleTheme } = useTheme();
  const [selection, setSelection] = useState<Selection>(null);
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
  const current = views.find(([key]) => key === view)!;
  const workspace = view === "overview";
  return (
    <div
      className="dashboard-layout app-shell"
      data-theme={theme}
      data-view={view}
    >
      <header className="topbar">
        <Brand />
        {workspace && <h1 className="topbar-title">{current[1]}</h1>}
        <nav aria-label="Navigation du dashboard" className="topnav">
          {views.map(([key, label, symbol]) => (
            <Link
              key={key}
              to={linkFor(key)}
              className={`top-link ${key === view ? "active" : ""}`}
              aria-current={view === key ? "page" : undefined}
            >
              <Icon name={symbol} size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="site-chip">
          <Icon name="building" size={16} />
          <span>{data?.site.name || "Atelier EcoTwin"}</span>
          <Pill tone={mode === "demo" ? "demo" : ""}>
            {mode === "demo" ? "Démonstration" : "Source réelle"}
          </Pill>
        </div>
        <div className="topbar-right">
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
          <IconButton
            label={
              theme === "dark"
                ? "Passer au thème clair"
                : "Passer au thème sombre"
            }
            symbol={theme === "dark" ? "sun" : "moon"}
            onClick={toggleTheme}
          />
          <IconButton
            label="Actualiser les données"
            symbol="refresh"
            disabled={loading}
            onClick={() => void refresh()}
          />
          {mode === "live" && user && (
            <span className="user-name">{user.name}</span>
          )}
          <Link to="/account" className="top-link plain">
            Compte
          </Link>
          <Link to="/business" className="top-link plain">
            Business
          </Link>
          {mode === "demo" ? (
            <ActionLink
              to="/login"
              className="button secondary small"
              symbol={null}
            >
              Se connecter
            </ActionLink>
          ) : (
            <Button
              className="button ghost small"
              onClick={logout}
              disabled={leaving}
            >
              {leaving ? "Déconnexion…" : "Se déconnecter"}
            </Button>
          )}
        </div>
      </header>
      {mode === "demo" && (
        <div className="demo-banner">
          <Icon name="cube" size={18} />
          <p>
            <strong>Vous explorez un site de démonstration.</strong> Les mesures
            sont illustratives ; le modèle BIM est consultable.
          </p>
          <Link to="/login">
            Mon espace <Icon name="arrow" size={16} />
          </Link>
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
      <main
        id="main"
        className={`app-main ${workspace ? "is-workspace" : "is-page"}`}
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
                La connexion à InfluxDB doit être configurée pour consulter les
                observations du site.
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
            <div className="workspace-stage" hidden={!workspace}>
              <BimPanel />
              <aside className="float-right" aria-label="Mesures et historique">
                <SensorsPanel data={data} metric={metric} change={change} />
                <TrendPanel
                  data={data}
                  metric={metric}
                  period={period}
                  change={change}
                  selection={selection}
                  onSelection={setSelection}
                />
              </aside>
              <TimelineBar
                data={data}
                metric={metric}
                mode={mode}
                selection={selection}
                onSelection={setSelection}
                autoRefresh={autoRefresh}
                onAutoRefresh={setAutoRefresh}
                loading={loading}
                failed={Boolean(error)}
              />
            </div>
            {!workspace && (
              <div className="page-body">
                <div className="page-heading">
                  <div>
                    <h1 className="page-title">{current[1]}</h1>
                    <p>{subtitles[view]}</p>
                  </div>
                  <div className="update-block">
                    <span>
                      Consulté à {time.format(new Date(data.generated_at))}
                    </span>
                    <p className="connection-status" role="status">
                      {loading
                        ? "Actualisation des observations…"
                        : error
                          ? "Dernières données conservées · état périmé"
                          : !autoRefresh
                            ? "Actualisation automatique en pause"
                            : mode === "demo"
                              ? "Données illustratives · pas horaire"
                              : "Actualisation toutes les 30 s"}
                    </p>
                  </div>
                </div>
                <div
                  className="workspace-toolbar"
                  aria-label="Contrôles du tableau de bord"
                >
                  <span className="workspace-source">
                    Source : {mode === "demo" ? "démonstration" : "InfluxDB"}
                  </span>
                  <div className="workspace-period">
                    <label htmlFor="workspace-period">Période</label>
                    <select
                      id="workspace-period"
                      value={period}
                      onChange={(event) =>
                        change({ period: event.target.value })
                      }
                    >
                      <option value="24h">Dernières 24 heures</option>
                      <option value="7d">7 derniers jours</option>
                    </select>
                  </div>
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
                <SensorTable
                  data={data}
                  query={query}
                  change={change}
                  hidden={view !== "sensors"}
                />
                {view === "insights" && (
                  <>
                    <InsightsPanel
                      data={data}
                      expanded
                      hidden={false}
                      change={change}
                    />
                    <section className="panel integration-panel">
                      <Icon name="spark" size={26} />
                      <div>
                        <h2>Compléter vos analyses avec l’assistant</h2>
                        <p>
                          Ouvrez « Assistant IA » pour poser une question.
                          L’envoi d’observations demande votre accord. Les
                          alertes ci-dessus restent calculées par des règles,
                          indépendamment du chatbot.
                        </p>
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
      {!workspace && (
        <footer className="app-footer">
          <span>EcoTwin · BIM + données</span>
          <span>Affichage des dates : Europe/Paris</span>
        </footer>
      )}
    </div>
  );
}
export default function DashboardRoute() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "demo" ? "demo" : "live";
  return <Dashboard key={mode} mode={mode} />;
}
