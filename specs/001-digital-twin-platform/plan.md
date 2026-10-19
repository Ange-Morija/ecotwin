# Implementation Plan: Plateforme EcoTwin
**Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

## Summary
Livrer un pilote mono-site exploitable: pages produit/connexion/dashboard, viewer BIM local, observations avec source et règles explicables. Corriger les régressions avant d'étendre l'IA.

## Technical Context
- Python >=3.11, FastAPI 0.110, Pydantic 2.6.4, InfluxDB client 1.43.
- JavaScript ESM, CSS partagé, SVG pour un historique (24 à 168 points); Xeokit 2.6.114 pour une seule scène WebGL chargée à la demande.
- SQLite dans .runtime pour comptes, sessions, maintenance et actions. Aucune dépendance à la base Influx versionnée.
- Serveur même origine pour pages, assets et /api; CORS limité pour compatibilité du serveur statique.
- Auth locale du pilote: scrypt salé, cookie HttpOnly SameSite strict expirant, contrôle CSRF et limitation des tentatives; inscription désactivable. SSO et multi-tenant non livrés.
- Validation: pytest + TestClient, Playwright + axe, navigateur 390/1440 px, lint Python/JS, contrôles Spec Kit.

## Constitution Check
Source de démo visible, règles distinctes de l'IA, autorisations serveur, pas de secrets générés en Git, états vides/erreurs accessibles. Pas de microservices ou framework superflu. Aucun compte par défaut.

## Project Structure
- api/src/core: configuration, stockage, sécurité.
- api/src/routers: auth, télémétrie, dashboard, opérations.
- api/src/services: points Influx et données de démonstration explicitement étiquetées.
- web/index.html + web/js/platform.js + web/styles/platform.css: nouvelles surfaces.
- web/js/bim-viewer.js: viewer chargé à la demande; ancien viewer conservé.
- tests/e2e et api/tests: parcours et contrats.
- .specify + .agents/skills: outils officiels Spec Kit.
- specs/001-digital-twin-platform: spécification, recherche, modèle, contrats, quickstart, tâches.

## Visualisation et interactions
Job: surveillance/anomalies et évolution temporelle. Route principale: dashboards-and-real-time-visualization. Historique SVG à axes et unité explicites; fallback table accessible et CSV. Une scène WebGL pour l'orientation BIM; aucun capteur n'est placé sur un objet sans mapping vérifié. Pas de particules décoratives.
URL: mode, view, metric, period, q. Aucune information sensible dans l'URL. Polling 30 s seulement lorsque l'onglet est visible; un seul appel en cours, annulation au changement de filtres. Données conservées lors d'une panne et statut périmé. Démo déterministe, sans badge «en direct».
Mobile: vue 3D, outils, puis panneaux capteurs/alertes/historique et barre temporelle (voir specs/009-workspace-themes); navigation compacte, contrôles >=44 px, aucune interaction essentielle au survol.
Budget: une série <=168 points et une scène; SDK local lazy, pas d'animation continue de graphiques; fallback WebGL explicite. Rendu BIM dépendant du GPU et de la taille du modèle.

## Delivery boundaries
Le mapping BIM-capteur, import IFC, multi-sites, RBAC/SSO, fournisseurs IA et alertes externes font l'objet de tâches futures, jamais de faux boutons de fonctionnalités actives.

## Évolution du frontend — 16 octobre 2026

La réalisation JavaScript initiale décrite ci-dessus est remplacée par les composants React/TypeScript de [007-react-frontend](../007-react-frontend/plan.md). Les contrats API et frontières métier restent valides; le nouveau build Vite sert `web/dist`. Les chemins platform.js et bim-viewer.js du plan initial sont historiques.
