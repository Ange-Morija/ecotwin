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
