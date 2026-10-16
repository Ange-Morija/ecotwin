import { Component, Suspense, lazy, useEffect, useRef } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import {
  ActionLink,
  ErrorBanner,
  Loading,
  MarketingNav,
} from "./components/ui";
const Business = lazy(() => import("./pages/Business"));
const Account = lazy(() => import("./pages/Account"));
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Do not log personal data. */
  }
  render() {
    return this.state.failed ? (
      <>
        <MarketingNav />
        <main id="main" className="boot">
          <h1>Une erreur empêche l’affichage</h1>
          <ErrorBanner
            title="Rechargez la page pour réessayer."
            message="Votre session et vos données enregistrées sont conservées."
            retry={() => location.reload()}
          />
        </main>
      </>
    ) : (
      this.props.children
    );
  }
}
function RouteFocus() {
  const location = useLocation();
  const surface = `${location.pathname}:${new URLSearchParams(location.search).get("view") || "overview"}`;
  const previous = useRef(surface);
  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    } else if (previous.current !== surface) {
      const main = document.querySelector<HTMLElement>("#main");
      main?.setAttribute("tabindex", "-1");
      main?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    previous.current = surface;
  }, [surface, location.hash]);
  return null;
}
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <RouteFocus />
        <Suspense
          fallback={
            <main id="main" className="boot">
              <Loading>Chargement d’EcoTwin…</Loading>
            </main>
          }
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth key="login" />} />
            <Route
              path="/register"
              element={<Auth key="register" register />}
            />
            <Route path="/business" element={<Business />} />
            <Route path="/account" element={<Account />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="*"
              element={
                <>
                  <MarketingNav />
                  <main id="main" className="boot">
                    <h1>Cette page n’existe pas</h1>
                    <ActionLink to="/">Revenir à l’accueil</ActionLink>
                  </main>
                </>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
