# Contrat HTTP

Toutes les réponses `/api/` sont no-store. Session HttpOnly; les POST navigateur exigent `X-EcoTwin-Request: 1` et une Origin autorisée lorsqu’elle est fournie. Pas de clé fournisseur côté navigateur.

| Route | Accès | Entrée / résultat |
|---|---|---|
| POST /api/auth/password | Session + CSRF | current_password, new_password; succès révoque toutes les sessions et supprime le cookie |
| GET /api/assistant/config | Public | enabled, provider, modèle configuré; ne teste pas la disponibilité du fournisseur |
| POST /api/assistant/messages | Session + CSRF + quotas | question, mode demo/live, share_observations=false, history borné; réponse answer/model/provider/source/context/generated_at |
| GET /api/billing/plan | Public | enabled=false si absent; sinon montant mineur/devise/intervalle/nombre d’intervalles/mode test lus chez Stripe |
| GET /api/billing/status | Session | état Stripe, subscribed pour le prix configuré, has_customer, résiliation programmée; aucune autorité donnée à la query URL |
| POST /api/billing/checkout | Session + CSRF | Aucun prix/client/redirect libre; URL Stripe hébergée |
| POST /api/billing/portal | Session + CSRF | Client du compte courant uniquement; URL portail Stripe |
| POST /api/billing/webhook | Signature Stripe brute | Corps ≤ 256 Kio; contrôle horodatage et mode, identifiant dédupliqué; received=true |

Erreurs : 401 session absente, 403 CSRF/origine, 422 entrée invalide, 429 quota/tentatives, 409 abonnement existant ou absence de client pour portail, 503 configuration/source/fournisseur indisponible. Signature falsifiée/expirée/mode incorrect : 400. Les exceptions des fournisseurs ne sont jamais renvoyées telles quelles (elles peuvent contenir des données sensibles).

L’IA ne produit aucune mutation. Le champ context représente les observations envoyées, pas une certification des citations ou conclusions du modèle. Le modèle renvoyé est le nom configuré pour la requête, pas une version matérielle vérifiée. Les comptes, actions et données du pilote conservent leur périmètre mono-site.
