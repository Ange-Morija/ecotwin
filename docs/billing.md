# Business et Stripe

Routes UI : `/business` publique pour l’offre; statut/Checkout/portail privés. Aucun tarif commercial n’est fourni par défaut. Le montant affiché vient d’un prix récurrent actif créé par le propriétaire dans Stripe (`STRIPE_PRICE_ID`), avec sa devise et sa périodicité. Les taxes et le total sont affichés par Stripe avant engagement. Le pilote reste mono-site partagé; l’abonnement ne crée aucun droit ou espace multi-client supplémentaire.

## Configuration

1. Créer le produit Business et son prix récurrent fixe, usage licensed, dans le sandbox Stripe. Choisir le montant, la devise et la périodicité voulus. Éviter les prix à paliers/usage, non pris en charge par cette interface.
2. Définir `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_MODE=test`, `APP_URL` (origine publique canonique sans chemin, query ou fragment). Les retours sont toujours `/business?checkout=returned` et `/business?checkout=canceled`; aucun paramètre de prix/redirect venant du navigateur n’est utilisé.
3. Configurer un endpoint Stripe HTTPS sur `/api/billing/webhook`, puis son secret brut `STRIPE_WEBHOOK_SECRET` dans le gestionnaire de secrets de l’hébergement. Pour un test local, utiliser le forwarding de Stripe CLI et son secret de signature. Ne pas placer cette valeur dans le dépôt ou le chat.
4. Activer et configurer le Customer Portal Stripe pour factures, carte et résiliation. Les changements d’offre ou quantités ne sont pas gérés par EcoTwin : les désactiver dans ce portail tant que les droits correspondants ne sont pas définis.
5. Valider le parcours en sandbox : confirmation, interruption, carte refusée/3DS, retour, résiliation, facture échouée et reprise. Vérifier TVA/mentions/conditions avec le propriétaire avant mise en vente.

En production : prix/clé/webhook du même mode, `STRIPE_MODE=live`, `STRIPE_ALLOW_LIVE=true`, `APP_URL=https://...`, cookies Secure et configuration de sécurité production. Le code vérifie le mode du prix avant Checkout. Aucun paiement réel n’a été effectué pendant le développement.

## Contrôles

Compte Stripe client associé à l’utilisateur par SQLite; pas de customer ou subscription ID provenant du navigateur. CSRF sur Checkout/portail, authentification sur statut. Carte saisie uniquement sur `checkout.stripe.com`; portail sur `billing.stripe.com`. Le navigateur vérifie ces destinations HTTPS avant navigation.

Création du client avec clé d’idempotence stable par compte. Tentative Checkout persistée avant l’appel, clé d’idempotence partagée entre onglets et réutilisation d’une session ouverte persistée jusqu’à expiration. Aucun verrou SQLite n’est maintenu pendant les appels externes. Un abonnement non terminal existant bloque une seconde souscription et renvoie vers le portail. Les appels Stripe ont un timeout de 15 s; une défaillance ne peut confirmer un paiement.

Statut relu directement auprès de Stripe à chaque consultation : aucun droit accordé par URL de retour, métadonnées de navigateur ou événement désordonné. `active`/`trialing` n’est considéré abonné que pour le prix Business configuré; retard/impayé/incomplet/résilié ne l’est pas. Un historique supérieur à 100 abonnements impose une vérification explicite plutôt qu’une conclusion partielle.

Webhook vérifié par le SDK officiel Stripe 16.0.0 sur le corps brut, tolérance temporelle par défaut 300 s, mode test/live cohérent, corps limité à 256 Kio. Seuls identifiant et date de réception sont conservés, doublons ignorés. Ce journal ne pilote aucun droit local : l’API Stripe reste la source d’autorité, ce qui évite les régressions d’état par événements reçus hors ordre. S’abonner seulement aux événements nécessaires (Checkout terminé, abonnement mis à jour/supprimé, facture payée/échouée). Prévoir une rétention de ce journal avant production.

## Cloud de développement

Le brouillon de configuration déclare les clés sortantes pour `api.stripe.com` et `api.openai.com`. Le nom `OPENAI_API_KEY` est réservé par cette plateforme : utiliser `ECOTWIN_OPENAI_API_KEY`. Ces bindings peuvent être remplacés par le proxy uniquement sur leurs destinations HTTPS. **Le secret de webhook doit être brut dans le processus serveur pour vérifier une signature locale** : un placeholder de secret proxy ne convient pas. Configurer ce secret au niveau de l’hébergement applicatif avant les tests de webhooks réels.

Tests API avec objets SDK simulés et signatures HMAC réellement vérifiées; tests navigateur des états et erreurs simulés. Les appels et paiements sandbox Stripe externes restent à valider avec les vrais identifiants du propriétaire.

Utiliser des stockages applicatifs distincts pour les environnements Stripe test et live : les identifiants client créés en sandbox ne sont pas utilisables avec une clé live. Ne pas réutiliser les comptes de test comme clientèle de production.
