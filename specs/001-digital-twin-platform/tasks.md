# Tasks: Plateforme EcoTwin

**Input**: spec.md, plan.md, research.md, data-model.md et contracts/api.md.
**Tests**: obligatoires pour auth, contrats de données, régressions et parcours UI.

## Phase 1 — Setup
- [x] T001 Initialiser les templates/scripts/intégration Codex officiels dans `.specify/` et `.agents/skills/`.
- [x] T002 Définir constitution, scénarios, recherche et contrats dans `specs/001-digital-twin-platform/`.
- [x] T003 Créer l'identité et les propriétaires UI dans `DESIGN.md` et `UX-CONTRACT.md`.

## Phase 2 — Fondations bloquantes
- [x] T004 Supprimer l'import circulaire dans `api/src/core/security.py` et `api/src/main.py`.
- [x] T005 Paramétrer Flux et confirmer les écritures dans `api/src/routers/telemetry.py` et `api/src/clients/influx_client.py`; corriger aussi endpoint/EOF/valeurs invalides du script `scripts/replay_csv_every_3min_per_metric_no_time.py`.
- [x] T006 Ajouter SQLite et l'initialisation dans `api/src/core/database.py`.
- [x] T007 Corriger les images et chemins statiques dans `web/Dockerfile`, `api/Dockerfile` et `infra/`.
- [x] T008 Ajouter les tests de régression dans `api/tests/test_platform.py`.

## Phase 3 — US1 Présentation et découverte (P1)
**Test indépendant**: `/` → exploration sans compte → données de démo étiquetées.
- [x] T009 [US1] Créer présentation responsive et navigation dans `web/js/platform.js`.
- [x] T010 [US1] Ajouter démo déterministe publique dans `api/src/services/dashboard_service.py`.
- [x] T011 [US1] Vérifier liens, source visible et capture mobile dans `tests/e2e/platform.spec.js`.

## Phase 4 — US2 Connexion réelle (P1)
**Test indépendant**: inscription → connexion → session persistante → déconnexion → accès refusé.
- [x] T012 [US2] Implémenter scrypt, sessions révocables, CSRF et limitation des tentatives dans `api/src/core/security.py` et `api/src/routers/auth.py`.
- [x] T013 [US2] Créer connexion/inscription et états de validation dans `web/js/platform.js`.
- [x] T014 [US2] Tester expiration, refus, origine et révocation dans `api/tests/test_platform.py` et `tests/e2e/platform.spec.js`.

## Phase 5 — US3 BIM + observations (P1)
**Test indépendant**: charger le XKT réel, sélectionner une métrique, changer la période et exporter les valeurs affichées.
- [x] T015 [US3] Implémenter dashboard, catalogue, URL, SVG et CSV dans `web/js/platform.js`.
- [x] T016 [US3] Servir un SDK figé et isoler le viewer dans `scripts/build-web.mjs` et `web/js/bim-viewer.js`.
- [x] T017 [US3] Ajouter les observations réelles sans fallback silencieux dans `api/src/services/dashboard_service.py`.
- [x] T018 [US3] Persister maintenance et actions dans `api/src/routers/operations.py`.
- [x] T019 [US3] Corriger cache et rendus non sûrs de l'ancien viewer dans `web/js/app.js`.
- [x] T020 [US3] Vérifier acquisition → InfluxDB → lecture et échec d'écriture dans `api/tests/`.
- [x] T021 [US3] Vérifier filtre, URL, export, panne et BIM dans `tests/e2e/platform.spec.js`.

## Phase 6 — US4 Insights explicables et frontière IA (P2)
**Test indépendant**: chaque alerte décrit observation/seuil/source et reste identifiée comme règle; le chatbot configurable est séparé.
- [x] T022 [US4] Créer règles et statuts honnêtes dans `api/src/services/dashboard_service.py`.
- [x] T023 [US4] Présenter les insights et l'état IA dans `web/js/platform.js`.
- [x] T024 [US4] Documenter le contrat futur fournisseur/preuves/validation dans `docs/ai-integration.md`.

## Phase 7 — Qualité et livraison
- [x] T025 Vérifier bureau/mobile/clavier/contraste via `tests/e2e/platform.spec.js` et conserver les rapports.
- [x] T026 Auditer le contrat premium et linter `DESIGN.md`; conserver les résultats dans `docs/verification.md`.
- [x] T027 Actualiser `README.md`, commandes d'installation et instructions cloud après validation.

## Lots suivants — planifiés, non livrés
- [ ] T028 Définir organisations/sites et migration PostgreSQL, RBAC et audit d'accès dans `specs/002-multi-site-iam/`.
- [ ] T029 Choisir et intégrer OIDC/SSO, invitation, récupération et vérification e-mail dans `specs/002-multi-site-iam/`.
- [ ] T030 Définir import IFC, versionnement, mapping objet-capteur vérifié et sélection liée dans `specs/003-bim-data-mapping/`.
- [ ] T031 Ajouter connecteurs IoT/MQTT, gestion de qualité et seuils métier configurables dans `specs/004-data-connectors/`.
- [ ] T032 Finaliser preuves vérifiées et revue humaine structurée : le premier chatbot configurable, ses limites et son consentement sont livrés dans `specs/008-auth-ai-business/`; activation réelle et analyses BIM tracées restent ouvertes.
- [ ] T033 Ajouter notifications, acquittement et historique des interventions dans `specs/006-operations/`.
- [ ] T034 Valider conservation des données et rotation des identifiants historiques avant production dans `docs/security.md`.

## Dépendances et exécution
Setup → fondations → US1 et US2 → US3 → US4 → qualité. T028/T029 précèdent toute exploitation multi-client; T030/T031 précèdent des analyses IA prétendant relier une mesure à un objet. T034 précède la production.
Travail parallélisable par une future équipe: T009/T010 pour US1; T012/T013 pour US2; T015/T016 pour US3; T022/T023 pour US4. Aucune délégation automatique n'est nécessaire pour cette livraison.
Stratégie: livrer le pilote mesurable, garder les lots futurs non cochés, puis spécifier chacun avant implémentation.

## Validation de clôture du pilote
Voir [docs/verification.md](../../docs/verification.md): 12 tests Python avec intégration Influx réelle et 8 parcours navigateur. Les tâches T028–T034 restent planifiées.

## Lot de maintenance — optimisation du pilote
Spécification et critères : [optimization.md](optimization.md).
- [x] T035 Supprimer sept fichiers vides ou non référencés et les panneaux inopérants dans web/ et api/src/.
- [x] T036 Mutualiser les lectures du viewer historique et invalider les snapshots après mutation dans web/js/data-cache.js et web/js/app.js.
- [x] T037 Conserver la scène, les filtres et la table ouverte lors des rafraîchissements dans web/js/platform.js.
- [x] T038 Précompresser le SDK et exclure l’IFC source des images via scripts/build-web.mjs, infra/nginx.conf et .dockerignore.
- [x] T039 Ajouter les tests unitaires natifs Node, les régressions réseau navigateur et documenter les mesures dans optimization.md.

## Affinement UI — huit méthodes
- [x] T040 Simplifier la présentation et retirer les titres décoratifs et cartes répétées; conserver l’identité métier.
- [x] T041 Ajouter tri accessible et export du catalogue filtré, préserver recherche et ordre lors des rafraîchissements.
- [x] T042 Améliorer lisibilité mobile, cibles tactiles et retour à la ligne des commandes.
- [x] T043 Intégrer les huit méthodes dans `docs/design-workflow.md`, DESIGN.md et le contrat UX; documenter les méthodes conditionnelles.

Les chemins JavaScript des tâches initiales sont historiques après la [migration React](../007-react-frontend/tasks.md); leurs propriétaires actuels sont décrits dans le plan du lot 007.
