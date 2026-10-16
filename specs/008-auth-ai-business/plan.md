# Plan technique

- Conserver le monolithe FastAPI + React; aucune migration de stack supplémentaire.
- `routers/auth.py` possède le changement de mot de passe et la révocation atomique, SQLite conserve les identités/sessions.
- `routers/assistant.py` possède le fournisseur OpenAI, les limites persistées, la sélection serveur des observations et le consentement. Appel HTTPS standard avec vérification TLS, timeout 25 s, aucune clé ou URL fournisseur configurable par navigateur. Aucune persistance de conversation côté serveur.
- `components/Assistant.tsx` possède un dialogue natif modal, l’historique éphémère borné, l’annulation de l’attente client et les états d’erreur. Le contexte de conversations contenant des observations est exclu de l’envoi lorsque le partage est décoché. Les questions sont toujours envoyées au fournisseur lorsque l’utilisateur clique Envoyer.
- `routers/business.py` utilise le SDK officiel Stripe 16.0.0, client par appel et timeout 15 s. Le prix est fixé par STRIPE_PRICE_ID; APP_URL possède les destinations de retour. Identité client persistée, clés d’idempotence et réutilisation d’un Checkout ouvert. Une tentative persistée avant l’appel fournit la même clé aux requêtes concurrentes, sans verrou SQLite pendant le réseau. Un statut ambigu ou indisponible ne produit pas une réussite fictive.
- `/api/billing/status` relit Stripe à chaque demande : événements désordonnés sans effet sur les droits. `billing_events` conserve uniquement identifiant et date de réception. Le webhook n’active aucun droit local; sa signature vérifiée ne remplace pas la source de vérité Stripe.
- Schéma additif : billing(user_id, customer, checkout_id, checkout_url, checkout_expires), billing_checkout_attempts(user_id, attempt), billing_events(id, received), usage_limits(user_id, bucket, count). Aucun effacement des comptes existants.
- `pages/Business.tsx`, `pages/Account.tsx` sont des routes paresseuses; `services.css` porte leurs styles et les accents de la palette. Tokens canoniques dans platform.css, variantes du poste dans dashboard.css. La scène Xeokit et ses frontières restent inchangées.
- `ObservationTimeline` dérive quatre points de la série sélectionnée; `TrendPanel` anime le tracé à l’entrée/changement de métrique ou taille de série, pas à chaque survol ni rafraîchissement identique.

Validation : tests API avec SDK/fournisseur simulés, vraie vérification cryptographique de signature; parcours navigateur sur distribution compilée; axe et écrans étroits; aucun paiement réel ou appel IA déclaré testé sans clés.
