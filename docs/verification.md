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
