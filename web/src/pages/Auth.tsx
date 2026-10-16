import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  Brand,
  BuildingDrawing,
  Button,
  Icon,
  IconButton,
} from "../components/ui";
type Field = "name" | "email" | "password";
export default function Auth({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState<boolean | null>(
    register ? null : true,
  );
  const fields = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    document.title = `${register ? "Créer un compte" : "Connexion"} — EcoTwin`;
    const controller = new AbortController();
    if (register)
      api<{ registration_enabled: boolean }>("/api/auth/config", {
        signal: controller.signal,
      })
        .then((result) => setRegistration(result.registration_enabled))
        .catch((e) => {
          if (e.name !== "AbortError")
            setError(
              "La configuration du service est indisponible. Rechargez la page pour réessayer.",
            );
        });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [register]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const next: Partial<Record<Field, string>> = {};
    const payload = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };
    for (const key of (register
      ? ["name", "email", "password"]
      : ["email", "password"]) as Field[]) {
      if (!payload[key]) next[key] = "Renseignez ce champ.";
      else if (
        key === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
      )
        next[key] = "Saisissez une adresse e-mail valide.";
      else if (key === "password" && register && payload.password.length < 12)
        next[key] = "Choisissez au moins 12 caractères.";
      else if (key === "name" && payload.name.length < 2)
        next[key] = "Renseignez au moins 2 caractères.";
    }
    setErrors(next);
    setError("");
    const first = Object.keys(next)[0] as Field | undefined;
    if (first) {
      fields.current[first]?.focus();
      return;
    }
    setPending(true);
    try {
      await api(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (mounted.current) navigate("/dashboard", { replace: true });
    } catch (e) {
      if (mounted.current) {
        setError(
          e instanceof Error
            ? e.message
            : "Connexion impossible. Vérifiez votre réseau et réessayez.",
        );
        fields.current.email?.focus();
      }
    } finally {
      if (mounted.current) setPending(false);
    }
  }
  function field(key: Field, label: string) {
    const input = (
      <input
        ref={(el) => {
          fields.current[key] = el;
        }}
        id={key}
        name={key}
        type={
          key === "password"
            ? show
              ? "text"
              : "password"
            : key === "email"
              ? "email"
              : "text"
        }
        autoComplete={
          key === "password"
            ? register
              ? "new-password"
              : "current-password"
            : key === "email"
              ? "username"
              : "name"
        }
        required
        maxLength={key === "password" ? 128 : key === "name" ? 80 : 254}
        value={values[key]}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={`${key}-error${key === "password" && register ? " password-hint" : ""}`}
      />
    );
    return (
      <div className="field">
        <label htmlFor={key}>{label}</label>
        {key === "password" ? (
          <div className="password-field">
            {input}
            <IconButton
              label={
                show ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
              symbol="eye"
              onClick={() => setShow(!show)}
              aria-pressed={show}
            />
          </div>
        ) : (
          input
        )}
        {key === "password" && register && (
          <span id="password-hint" className="field-hint">
            12 caractères minimum. Utilisez un mot de passe unique.
          </span>
        )}
        <span id={`${key}-error`} className="field-error">
          {errors[key]}
        </span>
      </div>
    );
  }
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div>
          <h2>
            Le contexte fait
            <br />
            toute la différence.
          </h2>
          <BuildingDrawing />
        </div>
        <p>BIM. Données. Décisions.</p>
      </aside>
      <main id="main" className="auth-main">
        <Link to="/" className="back-link">
          Retour à la plateforme
        </Link>
        <div className="auth-card">
          <div className="feature-icon">
            <Icon name="lock" size={24} />
          </div>
          <h1>
            {register ? "Créer votre compte" : "Heureux de vous retrouver."}
          </h1>
          <p className="auth-intro">
            {register
              ? "Rejoignez le site pilote partagé EcoTwin."
              : "Connectez-vous pour retrouver les données de votre bâtiment."}
          </p>
          {register && registration === false ? (
            <p role="status" className="empty">
              La création de compte est désactivée. Contactez votre
              administrateur.
            </p>
          ) : (
            <form noValidate onSubmit={submit}>
              {register && field("name", "Votre nom")}
              {field("email", "Adresse e-mail")}
              {field("password", "Mot de passe")}
              <p role="alert" className="form-error">
                {error}
              </p>
              <Button
                type="submit"
                className="button primary auth-submit"
                disabled={pending || registration === null}
                aria-busy={pending}
                symbol="arrow"
              >
                {pending
                  ? register
                    ? "Création du compte…"
                    : "Connexion…"
                  : register
                    ? "Créer mon compte"
                    : "Se connecter"}
              </Button>
            </form>
          )}
          <p className="auth-switch">
            {register
              ? "Vous avez déjà un compte ? "
              : "Vous découvrez EcoTwin ? "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Se connecter" : "Créer un compte pilote"}
            </Link>
          </p>
          <div className="auth-demo">
            <Link to="/dashboard?mode=demo">
              Explorer la démo sans compte <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p className="quiet">
            Compte local du pilote · site partagé · accès sécurisé par session
          </p>
        </div>
      </main>
    </div>
  );
}
