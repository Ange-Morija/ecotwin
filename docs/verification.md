# Vérification du pilote EcoTwin
Date: 2026-10-15. Base du travail: e524b29; rapport de validation du pilote préparé pour publication du code sur GitHub. Ce rapport ne vaut pas validation distante de GitHub Actions ni déploiement.

## Résultats exécutés
| Contrôle | Résultat et portée |
|---|---|
| Python 3.12.14, dépendances figées | uv pip sync --require-hashes réussi; 32 packages compatibles |
| API et régressions | **12 tests réussis**, dont auth, CSRF, session/révocation/expiration, limitation, ownership, maintenance/actions, schémas et replay CSV |
| InfluxDB réel 2.7.12 | Instance Docker jetable fraîche; ingestion de 3 points, lecture immédiate, identifiant contenant des caractères d'injection et dashboard live vérifiés; aucune donnée utilisateur réutilisée |
| Exécution Python sans serveur de test Influx | **11 réussis et 1 ignoré** explicitement; ne pas compter ce run comme une intégration réelle |
| Navigateur Chromium, serveur source | 8 parcours réussis; serveur de tests séparé sur 8010, stockage de tests séparé |
| Images API et web/Nginx | Deux images construites avec CA gérée et TLS vérifié; erreurs de propriété des copies corrigées sans exécuter l'API en root |
| Navigateur derrière Nginx | **8 parcours réussis**: produit/démo, auth, panne/réessai, modèle XKT local, responsive/accessibilité 390 et 1440, clavier/select natif, actions persistantes et prévention d'injection HTML |
| Nouvelle correction de lisibilité mobile du graphique | Contrôle ciblé responsive/accessibilité sur 390 et 1440; géométrie SVG adaptée pour garder les axes lisibles sur téléphone |
| Ruff | Lint et format des sources/tests Python réussis |
| JavaScript | npm run check et npm run format:check réussis |
| Design | DESIGN.md: 0 erreur, 0 avertissement; audit premium strict: 0 finding |
| Spec Kit | Initialisation CLI officielle et check-prerequisites --require-tasks --include-tasks réussis |
| Git | diff --check réussi; .env et fichiers internes InfluxDB retirés du suivi sans supprimer les copies locales |
| Cloud | install_script et start_skill actualisés et sauvegardés en brouillon; aucune publication effectuée |

Les tests navigateur couvrent aussi les champs invalides, le message d'identifiants erronés, la révélation du mot de passe, la conservation des filtres dans l'URL, l'export, les données périmées après coupure, les dialogues de sauvegarde/suppression et le retour de focus. Le modèle XKT est effectivement chargé en WebGL, pas seulement servi par HTTP. Les analyses axe utilisent les règles WCAG A/AA disponibles; elles ne constituent pas une certification complète d'accessibilité.

## Artifacts
- Tests: api/tests/test_platform.py, tests/e2e/platform.spec.js.
- Rapports statiques: docs/design-lint.json et docs/premium-audit.json.
- Captures locales générées et ignorées: test-results/produit-390.png, produit-1440.png, connexion-390.png, connexion-1440.png, dashboard-390.png, dashboard-1440.png, capteurs-390.png, capteurs-1440.png.
- Rapport navigateur local: test-results/report/index.html. Un run ciblé remplace ce rapport; se référer aussi aux résultats complets ci-dessus.
- CI configurée dans .github/workflows/ci.yml; l'exécution distante n'a pas été déclenchée.

## Limites restantes
- Pilote mono-site partagé; pas encore d'isolation multi-client, de RBAC, de SSO, de récupération de compte ou de validation e-mail.
- Mapping entre objet BIM et capteur non configuré. Import IFC, versionnement et multi-sites planifiés.
- Seuils illustratifs à valider; aucune prédiction ni fournisseur IA connecté.
- Grafana facultatif n'a pas été démarré ou validé. Les outils historiques restent une surface secondaire; la nouvelle UI produit/connexion/dashboard est la référence.
- La source du bâtiment réel n'est pas configurée dans le serveur de développement courant; le parcours réel a été testé sur une base jetable.
- Les dépendances Python historiques produisent des avertissements de dépréciation (Starlette/httpx et InfluxDB); les assertions passent. Leur modernisation est un travail séparé.
- Les anciens identifiants restent potentiellement dans l'historique Git. Leur rotation et une éventuelle purge dédiée précèdent la production.
- La publication et la restauration dans une nouvelle tâche cloud n'ont pas été effectuées.

Aucun résultat absent ou ignoré n'est présenté comme réussi. Les conteneurs et comptes des tests sont isolés des données du pilote.

## Lot d’optimisation suivant
- 4 tests natifs Node du cache : mutualisation, expiration, invalidation concurrente et reprise après échec.
- 9 parcours navigateur réussis sur le serveur source; régressions supplémentaires pour le canvas conservé, la table ouverte et les filtres locaux sans relecture.
- Contrôle Python de ce lot : 11 réussis et 1 ignoré. Le test Influx réel n’a pas été relancé pour ce nettoyage de fichiers sans modification des opérations de données; son exécution initiale à 12 tests reste documentée ci-dessus.
- Nginx : transfert du SDK gzip vérifié par comparaison après décompression, et réponse non compressée lorsque gzip;q=0 est demandé. IFC absent de la livraison mais toujours présent dans Git.
- Mesures avant/après et périmètre conservé : [optimization.md](../specs/001-digital-twin-platform/optimization.md).

## Affinement des huit méthodes — 16 octobre 2026

Modifications : présentation sans cartes répétitives ni titres décoratifs, texte d’interface minimum 12 px hors annotations SVG, cibles opérationnelles 44 px, en-tête mobile adaptable, catalogue triable et CSV respectant recherche et ordre. Procédure intégrée dans `docs/design-workflow.md`, DESIGN.md, UX-CONTRACT.md et les tâches T040–T043.

Vérifications exécutées sur Chromium local :
- `npm run test:e2e` : 10 parcours réussis, dont axe WCAG A/AA sur présentation, connexion, dashboard et catalogue à 390 et 1440 px. Le premier passage avait révélé un débordement mobile; corrigé avant cette exécution réussie.
- `ECOTWIN_E2E_URL=http://127.0.0.1:8011 npx playwright test --grep 'petits écrans'` : 1 parcours supplémentaire réussi, à 320 et 768 px, présentation/inscription/catalogue, nom long et réduction des animations. Exécuté après la suite principale sur un serveur isolé; les deux résultats représentent 11 scénarios distincts. Une tentative concurrente sur le port 8010 occupé n’a exécuté aucun test et n’est pas comptée.
- `npm run test:unit` : 4 réussis.
- `npm run check` et `npm run format:check` : réussis.
- `python -m pytest api/tests -q` dans l’environnement Python du projet : 11 réussis, 1 ignoré faute d’instance Influx de test; avertissements de dépréciation existants des dépendances.
- Inspection visuelle des captures avant/après : présentation ordinateur et dashboard mobile. Captures de la suite dans `test-results/`, non versionnées.

Limites : Chromium uniquement; aucun nouveau test sur Safari/Firefox, lecteur d’écran réel ou appareil physique. Le test Influx réel et les images Docker n’ont pas été relancés pour cette modification frontend/documentaire. Les résultats premium antérieurs ci-dessus concernent la livraison précédente; le lanceur Impeccable est absent de cet environnement. Pas de nouvelle recherche Godly, ni de composant Aceternity puisque la stack reste JavaScript native. Aucun résultat de CI distante n’est affirmé.

## Migration React — 16 octobre 2026

Les pages principales utilisent React 19.3.1, React DOM 19.3.1, React Router 7.18.4, TypeScript 7.0.2 et Vite 8.3.4, versions exactes dans le lockfile. Les outils historiques BIM/maintenance/actions sont conservés séparément; ils n’ont pas été convertis en React. Les captures `docs/images` ont été actualisées depuis les captures navigateur de cette migration (démo explicitement illustrative).

Vérifications locales exécutées :
- Build Vite et TypeScript strict réussis; pages chargées en chunks, SDK Xeokit externe local à la demande. Le build affiche un avertissement Rolldown sur la directive `use client` de React Router : l’application est exclusivement cliente, sans frontière serveur React.
- `npm run test:e2e` : 13 scénarios réussis sur la distribution servie par FastAPI. Après amélioration de la reprise du SDK et de la préférence de mouvement, 4 scénarios ciblés réussis (chargement XKT, navigation React, graphique/état vide et erreur SDK suivie d’une nouvelle tentative). Ce dernier porte la suite à 14 scénarios distincts.
- Contrôles axe WCAG A/AA sur présentation, connexion, dashboard et catalogue à 390 et 1440 px; petit écran 320 px, intermédiaire 768 px, textes longs et réduction des animations vérifiés par la suite. Inspection des captures ordinateur/mobile; illustration SVG et masquage des sections corrigés avant succès final.
- `npm run check`, `npm run format:check` et `npm run test:unit` réussis : 4 tests de cache Node.
- Ruff check et format réussis. Après adaptation du test d’assets au HTML compilé : pytest 11 réussis, 1 test Influx ignoré faute de base jetable. Le test vérifie les bundles réellement référencés, le XKT et l’absence d’exposition de l’IFC et des sources TypeScript par FastAPI.
- DESIGN.md lint : 0 erreur, 0 avertissement. Audit premium strict : 0 finding, rapport `docs/premium-audit.json`. Ces contrôles statiques complètent les parcours, sans prouver seuls l’accessibilité.
- Les deux images Docker sont reconstruites avec vérification TLS et secret CA; FastAPI sert le HTML compilé depuis `/app/web/dist`, le XKT est inclus et l’IFC source est absent. Validation navigateur via Nginx consignée ci-dessous.

Limites : Chromium uniquement, pas de lecteur d’écran réel, de Safari/Firefox ou de mesure de gain FPS/latence. Pas de nouvelle validation Influx/Grafana; aucune CI distante déclarée réussie. `npm audit` signale 7 entrées sur les dépendances transitives du SDK Xeokit existant (5 hautes, 2 modérées); voir `docs/security.md` et R007. Aucun nouvel outil IA ou mapping objet-capteur n’est annoncé comme livré.

Validation finale de la distribution Docker : `ECOTWIN_E2E_URL=http://127.0.0.1:8021 npm run test:e2e` → **14/14 réussis** derrière Nginx, avec API non-root et stockage de test isolé. La première exécution avait 13 succès et une assertion de tri exécutée avant la fin du rendu React; remplacée par une attente Playwright sur les lignes affichées avant cette exécution complète réussie. Le SDK est servi en gzip (881 478 octets), décompression identique au fichier local de 5 104 210 octets. Les conteneurs et le réseau de validation sont ensuite supprimés; aucune instance de production n’a été déployée ou modifiée.

## Affinement du poste de surveillance — 16 octobre 2026

Résumé de trois informations réellement calculées, accès direct aux huit métriques, navigation contrastée, espace BIM agrandi, filtres métrique/période libellés et aperçu schématique identifié. Les styles du dashboard sont isolés dans `web/src/dashboard.css` et chargés avec la route.

Vérifications exécutées : `npm run check` (TypeScript strict), `npm run format:check`, 4 tests Node et **15/15 parcours Playwright réussis** sur le build statique servi par FastAPI. La suite comprend axe à 390/1440 px, 320/768 px avec texte long et mouvement réduit, connexion, erreurs réseau, tri/export, XKT et nouvelle tentative après erreur SDK. Le nouveau scénario vérifie que les boutons de métrique synchronisent URL, graphique et select sans requête supplémentaire. Captures ordinateur/mobile inspectées puis actualisées dans docs/images; elles montrent l’aperçu schématique avant chargement. Le chargement du véritable XKT a aussi été exécuté.

Limites : Chromium, sans appareil physique ni lecteur d’écran réel. Pas de nouvelle validation Docker, Python/Influx ou audit premium pour cette passe UI; les résultats précédents restent datés dans les sections ci-dessus. La charte conserve les tokens existants; le lanceur de contexte Impeccable est absent et les documents du projet ont été lus directement.

## Application de codex-skills.zip — 16 octobre 2026

Les huit références originales sont conservées avec empreintes SHA-256 et périmètre d’application dans `docs/references/codex-skills/README.md`. Les installateurs du ZIP n’ont pas été exécutés. Les méthodes remove-ai-slop, impeccable-design, design-checklist et playwright-testing ont guidé la réalisation : texte produit plus concret, recherche `/` avec focus, filtres de détail, réinitialisation, pause/reprise réelle de l’actualisation automatique et saisie mobile à 16 px.

Vérifications réellement exécutées :
- Build Vite avec TypeScript strict et `npm run check` réussis; `npm run format:check` et les 4 tests Node réussis.
- Suite navigateur : 16 scénarios réussis lors de l’exécution complète; le dernier avait un sélecteur de test ambigu (`status` désignait plusieurs régions). Après ciblage du texte de pause, les deux nouveaux scénarios « commandes » et « actualisation » ont été rejoués et réussis. Au total, les 17 scénarios distincts ont été validés; pas de revendication d’une exécution finale unique à 17/17.
- La pause est vérifiée avec une horloge Playwright contrôlée : absence de nouvelles requêtes pendant 60 secondes simulées, lecture manuelle possible, reprise périodique après réactivation. Aucun sleep artificiel.
- Axe sur les pages principales à 390/1440 px et scénario responsive à 320/768 px, connexion réelle, modèle XKT et reprise SDK couverts par la suite. Captures ordinateur/mobile inspectées et actualisées.
- DESIGN.md lint : aucune erreur ni avertissement. Huit empreintes des références originales vérifiées, liens de documentation contrôlés et prérequis Spec Kit du lot 007 valides.

Limites : Chromium; pas de nouveau test Python/Influx, de reconstruction Docker ou d’audit npm pour cette évolution du frontend. Les constats de dépendances Xeokit restent suivis séparément en R007. Aucune référence Godly ni documentation Aceternity n’a été présentée comme consultée. La plateforme connectée n’est pas remplacée par le modèle HTML autonome présent dans l’archive.

## Composition claire et asymétrique — 16 octobre 2026

Création originale pour la demande d’un dashboard de type kit UI : navigation blanche, sélection vert sauge, Manrope variable auto-hébergée, BIM principal avec métriques en liste latérale, puis historique et points à examiner. Le connecteur Figma n’était pas disponible dans la session; aucun fichier Figma ni modèle communautaire n’a été consulté, importé ou revendiqué comme source. L’URL Design4Users n’a pas pu être consultée lors de la demande précédente (réseau 403).

Validation finale : **17/17 parcours Playwright réussis** sur le build statique FastAPI, après contrôle des captures ordinateur/mobile et ajustement groupé des textes et cibles. Axe A/AA sur les pages principales à 390/1440 px, 320/768 px avec textes longs, navigation clavier, authentification réelle, filtres/exports, pause/reprise, conservation du canvas et chargement/reprise SDK inclus. TypeScript, build Vite, format et 4 tests Node réussis. DESIGN.md lint : 0 erreur, 0 avertissement. L’essai initial d’import d’un sous-fichier de police inexistant a été corrigé avant le premier build réussi et les tests.

Manrope est verrouillée en 5.3.0; ses fichiers WOFF2 sont intégrés par Vite, sans dépendance à une URL Google Fonts à l’exécution. La licence SIL OFL est conservée dans web/assets/manrope-OFL.txt et copiée dans la distribution. Les captures docs/images/dashboard-desktop.png et dashboard-mobile.png montrent l’état initial avec aperçu schématique explicitement nommé; le XKT réel a été vérifié par les parcours.

Limites : Chromium uniquement; pas de nouvelle reconstruction Docker, de test Python/Influx, de mesure FPS/latence ou de validation CI distante. Les limitations métier et le suivi des dépendances Xeokit restent inchangés.

## 2026-10-16 — Comptes, assistant IA, Business et palette

Périmètre et décisions : [lot 008](../specs/008-auth-ai-business/spec.md). Authentification réelle conservée et complétée; intégrations configurables, sans activation externe implicite.

Vérifications réellement exécutées :
- `uv pip compile` puis synchronisation avec hashes du lock Python incluant Stripe 16.0.0 réussies.
- API : **25 tests réussis, 1 ignoré**. Le test ignoré exige une instance InfluxDB jetable. Les tests nouveaux couvrent changement du mot de passe/révocation globale/limitation, accès/CSRF, consentement IA et absence de fallback, requête fournisseur bornée, quotas compte/global, prix et client Stripe possédés par le serveur, statut, portail, signature brute (falsification/expiration/mode), doublons, réponse Checkout perdue et appels concurrents réutilisant la même tentative. Les appels aux fournisseurs sont simulés; la vérification de signature du SDK est réelle.
- Build React/TypeScript, `npm run check`, `npm run format:check`, Ruff lint/format et **4 tests Node réussis**.
- **24 scénarios Playwright réussis** sur la distribution servie par FastAPI; puis **24 réussis via Nginx + API Docker**, après les évolutions compte/IA/Stripe/navigation mobile et chronologie. Parcours historiques, chargement du vrai XKT, réessai SDK, conservation de scène et filtres inclus.
- Axe : pages publiques/dashboard/catalogue à 390/1440 px; Business, Compte et dialogue assistant à 320/768/1440 px, sans violation WCAG A/AA détectée. Débordements, clavier/Échap/retour de focus, réduction des mouvements, consentement décoché par défaut et texte externe sans injection couverts. Les états actifs du chatbot et les erreurs Stripe côté navigateur utilisent des routes de test simulées, explicitement nommées dans les tests.
- Images API et Nginx reconstruites avec le bundle CA de build monté en secret et vérification TLS conservée; Compose validé avec `.env.example`. Les contrôles colorés du viewer historique ont reçu une dernière correction CSS de contraste sans dégradé, suivie d’une reconstruction et d’un rejeu ciblé des deux parcours historiques.
- DESIGN.md : 0 erreur et 0 avertissement. Prérequis Spec Kit du lot 008 valides; liens relatifs des documents modifiés contrôlés. Captures produit/connexion/dashboard/Business/assistant sur ordinateur et mobile actualisées et inspectées.

Limites : Chromium uniquement. Aucun appel OpenAI réel, aucun Checkout/Portal/webhook externe Stripe et aucun paiement réel exécutés, faute de configuration du propriétaire. Le modèle, le prix, le secret brut de signature et les politiques de données/commercialisation restent à configurer/valider. Les écrans désactivés sont intentionnels dans cet état, pas des réponses IA ou paiements simulés présentés comme réels. Le test Influx réel n’a pas été exécuté ici. Les risques de dépendances Xeokit déjà suivis en R007 restent ouverts; aucun audit npm supplémentaire n’est revendiqué pour ce lot.

Le brouillon cloud a enregistré les besoins non secrets et les bindings sortants `ECOTWIN_OPENAI_API_KEY`/`STRIPE_SECRET_KEY`, ajoutant `api.openai.com` et `api.stripe.com`. Cela ne configure pas le secret brut de webhook, n’applique pas les clés au processus en cours et ne publie pas l’environnement. Revoir/enregistrer les valeurs dans les paramètres, puis publier l’environnement avant une validation externe. Aucune mise en production applicative n’a été effectuée.

## 2026-10-19 — Indicateur de conformité et jauges de métriques

Changement : quatrième indicateur du résumé et jauges par métrique (`Dashboard.tsx`, `dashboard.css`); test e2e du nombre d’indicateurs passé de 3 à 4.

Vérifications réellement exécutées : build React/TypeScript (`npm run build`) réussi; captures Chromium à 1440 et 390 px sur la distribution statique avec une API simulée (quatre capteurs dont un sans mesure et un au-dessus du seuil), inspectées.

Non exécutés : le backend Python n’a pas pu être installé dans cet environnement (échec de compilation de pydantic-core), donc ni tests API ni scénarios Playwright, y compris le test modifié. Aucun contrôle axe sur la nouvelle zone. À rejouer : `npm run test:e2e`.

Complément du 2026-10-19 (mouvement et références) : `npm run build`, `npm run check`, `npm run format:check` et `npm run test:unit` exécutés; captures ordinateur inspectées après ajout des pastilles d’état et du compteur. Les animations ne sont pas validées en mouvement réduit par un test automatisé, et la surbrillance d’une valeur modifiée n’a pas été observée en situation réelle (aucun rafraîchissement simulé). Mêmes limites que ci-dessus : ni API ni Playwright.

## 2026-10-19 — Thèmes clair/sombre et vue d’ensemble flottante

Vérifications réellement exécutées : `npm run build`, `npm run check`, `npm run format:check`, `npm run test:unit` (voir plus bas pour le résultat). Sur la distribution statique avec une API simulée (8 capteurs dont un sans mesure, 1 point de vigilance) et Chromium : bascule clair/sombre, suivi de `prefers-color-scheme: dark`, mémorisation après rechargement; axe WCAG A/AA sans violation sur vue d’ensemble clair/sombre, capteurs clair/sombre, insights sombre et BIM sombre à 1440 px (une violation de contraste du bouton « Charger le modèle 3D » en sombre a été trouvée puis corrigée); captures ordinateur et mobile inspectées, dont le dialogue de l’assistant et le bandeau mobile compte/facturation qui étaient illisibles avant correction.

Limites : le backend Python n’a pas pu être installé ici (compilation de pydantic-core), donc aucun test d’API ni scénario Playwright du dépôt n’a été exécuté, y compris le nouveau test de thème et les tests existants dont la mise en page a changé (vue d’ensemble). À rejouer : `npm run test:e2e`. Non vérifiés : axe à 390/768 px et en sombre sur Compte/Business (non thématisés), mouvement réduit, vrai modèle XKT dans le thème sombre (le fond de la vue et le dessin schématique clair ont été regardés, pas le rendu WebGL), clic sur les mesures flottantes quand la liste défile.
