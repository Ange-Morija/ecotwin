import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
const paths = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  cube: "m3 7 9-5 9 5v10l-9 5-9-5zm0 0 9 5 9-5M12 12v10",
  chart: "M4 3v17h17M7 15l4-5 4 3 6-8",
  sensor: "M8 9a5 5 0 0 1 8 0M4 6a10 10 0 0 1 16 0M10 12a2 2 0 0 1 4 0M12 15v6",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  chevron: "m9 5 7 7-7 7",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  refresh: "M20 7a9 9 0 1 0 1 8M20 2v6h-6",
  check: "m5 12 4 4L19 6",
  alert: "m12 3 10 18H2Zm0 6v5m0 3v1",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
  close: "m6 6 12 12M6 18 18 6",
  logout: "M9 4H4v16h5m5-13 5 5-5 5m-6-5h11",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  lock: "M5 10h14v11H5zm3 0V6a4 4 0 0 1 8 0v4",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  fit: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  building: "M4 21V7l8-4v18m0-11h8v11M2 21h20M7 8v2m0 3v2m0 3v1m9-5v2m0 2v1",
  play: "M7 4.5v15l12-7.5Z",
  pause: "M8 5v14m8-14v14",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z",
  help: "M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5m0 3v1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20",
};
export type IconName = keyof typeof paths;
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="EcoTwin, accueil">
      <img src="/assets/ecotwin.svg" width="34" height="34" alt="" />
      eco<strong>twin</strong>
      <span className="brand-dot">.</span>
    </Link>
  );
}
export function Button({
  children,
  symbol,
  className = "button secondary",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { symbol?: IconName }) {
  return (
    <button type="button" className={className} onClick={onClick} {...props}>
      {symbol && <Icon name={symbol} size={18} />}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  symbol,
  onClick,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  symbol: IconName;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
      {...props}
    >
      <Icon name={symbol} />
    </button>
  );
}
export function ActionLink({
  children,
  to,
  className = "button primary",
  symbol = "arrow",
}: {
  children: ReactNode;
  to: string;
  className?: string;
  symbol?: IconName | null;
}) {
  return (
    <Link to={to} className={className}>
      {children}
      {symbol && <Icon name={symbol} size={18} />}
    </Link>
  );
}
export function Pill({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`pill ${tone}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
export function MarketingNav() {
  return (
    <header className="marketing-nav">
      <Brand />
      <nav aria-label="Navigation principale">
        <Link to="/#platform">La plateforme</Link>
        <Link to="/#uses">Les usages</Link>
        <Link to="/business">Business</Link>
      </nav>
      <div className="nav-actions">
        <Link to="/login" className="login-link">
          Se connecter
        </Link>
        <ActionLink to="/dashboard?mode=demo" className="button primary small">
          Explorer la démo
        </ActionLink>
      </div>
    </header>
  );
}
export function BuildingDrawing() {
  return (
    <img
      className="building-drawing"
      src="/assets/building-schematic.svg"
      width="620"
      height="460"
      alt="Coupe axonométrique schématique : trois niveaux reliés à des mesures de température et de qualité de l’air. Données illustratives."
    />
  );
}
export function Loading({
  children = "Chargement du tableau de bord…",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {children}
    </div>
  );
}
export function ErrorBanner({
  title,
  message,
  retry,
}: {
  title: string;
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-banner" role="alert">
      <Icon name="alert" />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {retry && (
        <Button
          onClick={retry}
          symbol="refresh"
          className="button secondary small"
        >
          Réessayer
        </Button>
      )}
    </div>
  );
}
