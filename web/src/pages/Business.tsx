import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { Button, Loading, MarketingNav, Pill } from "../components/ui";
type Plan = {
  enabled: boolean;
  price: null | {
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
    test_mode: boolean;
  };
};
type Status = {
  status: string;
  subscribed: boolean;
  has_customer: boolean;
  cancel_at_period_end?: boolean;
};
const statuses: Record<string, string> = {
  none: "Aucun abonnement",
  active: "Abonnement actif",
  trialing: "Période d’essai",
  past_due: "Paiement en retard",
  unpaid: "Paiement impayé",
  canceled: "Abonnement résilié",
  incomplete: "Paiement à terminer",
  incomplete_expired: "Paiement expiré",
  paused: "Abonnement suspendu",
};
export default function Business() {
  const [params] = useSearchParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      api<Plan>("/api/billing/plan"),
      api<Status>("/api/billing/status"),
    ]);
    const [offer, account] = results;
    if (offer.status === "fulfilled") setPlan(offer.value);
    else setError(offer.reason.message);
    if (account.status === "fulfilled") {
      setStatus(account.value);
      setSignedIn(true);
    } else if (
      account.reason instanceof ApiError &&
      account.reason.status === 401
    )
      setSignedIn(false);
    else {
      setError(account.reason.message);
      setStatus(null);
    }
    setLoading(false);
  }
  useEffect(() => {
    document.title = "Business — EcoTwin";
    void load();
  }, []);
  async function redirect(path: string) {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await api<{ url: string }>(`/api/billing/${path}`, {
        method: "POST",
      });
      const target = new URL(result.url);
      if (
        target.protocol !== "https:" ||
        !(
          target.hostname === "checkout.stripe.com" ||
          target.hostname === "billing.stripe.com"
        )
      )
        throw new Error("Adresse de paiement invalide.");
      window.location.assign(target.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
      setPending(false);
    }
  }
  const p = plan?.price;
  const amount = p
    ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: p.currency.toUpperCase(),
      }).format(
        p.amount /
          10 **
            (["isk", "ugx"].includes(p.currency.toLowerCase())
              ? 2
              : (new Intl.NumberFormat("en", {
                  style: "currency",
                  currency: p.currency,
                }).resolvedOptions().maximumFractionDigits ?? 2)),
      )
    : null;
  const intervals: Record<string, string> = {
    month: "mois",
    year: "an",
    week: "semaine",
    day: "jour",
  };
  return (
    <>
      <MarketingNav />
      <main id="main" className="service-page business-page">
        <p className="eyebrow">ECOTWIN BUSINESS</p>
        <h1>Un espace pour votre exploitation.</h1>
        <p className="service-intro">
          Retrouvez votre abonnement, vos factures et vos moyens de paiement
          dans un espace dédié.
        </p>
        {params.get("checkout") === "returned" && (
          <p role="status" className="notice">
            Vous revenez de Stripe. Le retour seul ne confirme aucun paiement :
            consultez le statut ci-dessous.
          </p>
        )}
        {params.get("checkout") === "canceled" && (
          <p role="status" className="notice">
            Le parcours de paiement a été interrompu. Vous pouvez le reprendre.
          </p>
        )}
        <p role="alert" className="form-error">
          {error}
        </p>
        {loading ? (
          <Loading>Chargement de l’offre…</Loading>
        ) : (
          <div className="business-grid">
            <section className="business-offer">
              <Pill>Abonnement Business</Pill>
              <h2>Votre offre</h2>
              <div className="business-price">
                {amount || "Bientôt disponible"}
              </div>
              {p && (
                <p>
                  Par {p.interval_count > 1 ? `${p.interval_count} ` : ""}
                  {intervals[p.interval] || p.interval} · taxes et total
                  détaillés par Stripe avant validation.
                </p>
              )}
              {p?.test_mode && (
                <p className="notice">
                  Mode test Stripe · aucun paiement réel.
                </p>
              )}
              <p>
                Le tarif et la périodicité affichés proviennent de Stripe.
                L’abonnement ne crée pas encore d’espace multi-entreprises et ne
                modifie pas les droits du pilote partagé.
              </p>
              {!plan?.enabled ? (
                <p role="status">
                  Les abonnements ne sont pas encore ouverts. Vous pouvez
                  explorer le pilote dès maintenant.
                </p>
              ) : !signedIn ? (
                <Link className="button primary" to="/login?next=business">
                  Se connecter pour s’abonner
                </Link>
              ) : (
                <Button
                  disabled={pending || !status || status.subscribed}
                  onClick={() => void redirect("checkout")}
                >
                  {pending
                    ? "Ouverture de Stripe…"
                    : status?.subscribed
                      ? "Vous êtes abonné"
                      : "Continuer avec Stripe"}
                </Button>
              )}
              <Link to="/dashboard?mode=demo">Explorer la démo →</Link>
            </section>
            <section className="billing-summary">
              <h2>Votre abonnement</h2>
              <p className="billing-state">
                {signedIn
                  ? statuses[status?.status || "none"] || "Statut à vérifier"
                  : "Connectez-vous pour consulter votre statut."}
              </p>
              {status?.cancel_at_period_end && (
                <p>Résiliation prévue à la fin de la période en cours.</p>
              )}
              {status?.has_customer && (
                <Button
                  className="button secondary"
                  disabled={pending || !plan?.enabled}
                  onClick={() => void redirect("portal")}
                >
                  Gérer mon abonnement
                </Button>
              )}
              <Button
                className="button ghost"
                disabled={loading || pending}
                onClick={() => void load()}
              >
                Actualiser le statut
              </Button>
              <ol className="business-steps">
                <li>
                  <strong>Vérifier l’offre</strong>
                  <span>
                    Montant et périodicité affichés avant tout engagement.
                  </span>
                </li>
                <li>
                  <strong>Payer sur Stripe</strong>
                  <span>Les informations de carte restent chez Stripe.</span>
                </li>
                <li>
                  <strong>Suivre l’abonnement</strong>
                  <span>
                    Factures, moyen de paiement et résiliation depuis le portail
                    sécurisé.
                  </span>
                </li>
              </ol>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
