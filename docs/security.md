# Sécurité du pilote
Auth locale mono-site: scrypt avec sel unique, jetons opaques de 256 bits, hash de jeton en SQLite, expiration 8h, cookie HttpOnly SameSite strict, révocation au logout, header CSRF et contrôle Origin, limitation de connexion par adresse. En HTTPS définir COOKIE_SECURE=true. Configurer les hôtes/forwarded headers autorisés dans le reverse proxy; ne jamais faire confiance à un X-Forwarded-For arbitraire.
L'inscription ouverte est réservée au développement (désactivée par défaut dans Compose). Aucun compte administrateur ou mot de passe par défaut. Ce pilote donne aux comptes accès à un même site partagé; les actions sont personnelles. Il n'est pas conçu pour héberger plusieurs clients.
La télémétrie machine utilise X-API-Key, jamais des clés en query string. Le chatbot OpenAI est désactivé sans configuration et exige une session ainsi qu’un consentement avant transmission des observations. Les règles et leur seuil sont illustratifs.
Les fichiers .env et l'état InfluxDB précédemment suivis sont retirés du suivi sans supprimer les copies locales. Cela n'efface pas les anciens commits. Avant usage réel: vérifier et renouveler les identifiants historiques, réinitialiser les accès concernés et décider d'une purge d'historique dédiée. Aucun identifiant n'est reproduit dans cette documentation.
Avant production: IAM/SSO, validation e-mail/récupération, politique de mot de passe et quotas, RBAC/multi-tenant, rétention et backups, TLS, origine et monitoring. Voir T028–T034.

## Dépendances frontend — migration React

Les versions React, React DOM, React Router, TypeScript et Vite sont exactes et installées depuis le lockfile. Les dépendances Node sont utilisées au build; ni node_modules ni un serveur Vite ne sont copiés dans les images finales.

L’audit npm exécuté le 16 octobre 2026 signale 7 entrées (5 hautes, 2 modérées) dans la chaîne du SDK Xeokit existant : loaders.gl → texture-compressor → image-size / argparse / sprintf-js. Les avis directs concernent notamment [image-size](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) et [sprintf-js](https://github.com/advisories/GHSA-hp3w-g68c-fv3c). La proposition automatique rétrograde Xeokit en 2.2.5; elle n’est pas appliquée sans validation de compatibilité. L’application utilise le bundle navigateur Xeokit et un modèle XKT local; elle n’expose pas un service Node de compression de textures. Cela ne constitue pas une preuve d’absence de risque dans le SDK. Analyser une mise à jour compatible ou le retrait des outils transitifs inutilisés avant production; tâche R007 du lot React.

## Comptes, IA et paiement
Le changement de mot de passe vérifie le secret actuel, limite les erreurs et révoque toutes les sessions de façon atomique. Pas de récupération par e-mail non raccordée. Les retours de connexion sont limités à dashboard/account/business.

Chat : quotas utilisateur et global persistés, contenu borné, aucun outil exécutant des opérations, textes rendus sans HTML, pas de persistance locale des conversations. Voir [politique de transmission et limites](ai-integration.md).

Stripe : prix et client possédés par le serveur, CSRF, Checkout/Portal hébergés, signature temporelle du corps brut, identifiants d’événements dédupliqués, statut relu chez Stripe. Pas de stockage de carte ni droit accordé par retour navigateur. Mode live nécessite une activation explicite. Les paiements ne fournissent pas l’isolation multi-client encore absente. Voir [activation et limites](billing.md).
