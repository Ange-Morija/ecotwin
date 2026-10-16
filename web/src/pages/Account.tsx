import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { User } from "../lib/types";
import { MarketingNav, Button, Loading } from "../components/ui";
export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    document.title = "Mon compte — EcoTwin";
    const controller = new AbortController();
    api<User>("/api/auth/me", { signal: controller.signal })
      .then(setUser)
      .catch((e) => {
        if (e.name === "AbortError") return;
        if (e instanceof ApiError && e.status === 401)
          navigate("/login?next=account", { replace: true });
        else setError("Impossible de charger votre compte. Rechargez la page.");
      });
    return () => controller.abort();
  }, [navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await api("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({
          current_password: current,
          new_password: password,
        }),
      });
      navigate("/login?password=changed", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Modification impossible.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <MarketingNav />
      <main id="main" className="service-page account-page">
        <Link to="/dashboard">Retour au dashboard</Link>
        <p className="eyebrow">VOTRE ESPACE</p>
        <h1>Mon compte</h1>
        <p role="alert" className="form-error">
          {error}
        </p>
        {!user && !error ? (
          <Loading>Chargement du compte…</Loading>
        ) : (
          user && (
            <>
              <div className="account-summary">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <Link to="/business">Abonnement et facturation →</Link>
              </div>
              <section className="panel account-security">
                <h2>Changer mon mot de passe</h2>
                <p>
                  12 caractères minimum. Toutes vos sessions seront fermées
                  après la modification.
                </p>
                <form onSubmit={submit}>
                  <label htmlFor="current-password">Mot de passe actuel</label>
                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={128}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                  />
                  <label htmlFor="new-password">Nouveau mot de passe</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="submit" disabled={pending}>
                    {pending ? "Modification…" : "Enregistrer le mot de passe"}
                  </Button>
                </form>
              </section>
            </>
          )
        )}
      </main>
    </>
  );
}
