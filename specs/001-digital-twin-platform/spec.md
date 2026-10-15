# Feature Specification: Plateforme de jumeaux numériques EcoTwin

**Created**: 2026-10-15
**Status**: Pilote implémenté et vérifié; extensions planifiées dans tasks.md
**Input**: Plateforme inspirée des usages Autodesk Tandem, combinant BIM, données, insights et possibilité d'intégration IA. Présentation produit, connexion, dashboard premium et correction des défauts existants. Identité EcoTwin originale, sans affiliation Autodesk.

## User Scenarios & Testing

### User Story 1 — Comprendre et explorer (Priority: P1)
Un gestionnaire de bâtiment découvre le produit puis explore un site de démonstration sans compte.
**Independent Test**: accueil → explorer la démo → dashboard avec source démonstration visible, mesures et modèle BIM disponibles.
**Acceptance Scenarios**:
1. Depuis l'accueil, les bénéfices BIM, données et exploitation sont compréhensibles sans jargon d'implémentation.
2. La démo ne présente jamais ses valeurs comme des mesures réelles et ne permet aucune écriture privée.

### User Story 2 — Se connecter (Priority: P1)
Un utilisateur crée un compte local du pilote, se connecte, consulte son espace et se déconnecte.
**Independent Test**: inscription → session → rechargement → déconnexion → accès privé refusé.
**Acceptance Scenarios**:
1. Les identifiants invalides produisent une erreur générique associée au formulaire.
2. Une session est révocable et expirante; le mot de passe n'est jamais conservé côté navigateur.
3. Le dashboard authentifié ne transforme pas une panne InfluxDB en données de démonstration.

### User Story 3 — Exploiter BIM + données (Priority: P1)
L'exploitant repère une mesure hors seuil, filtre un capteur et sa période, explore le BIM et exporte les observations.
**Independent Test**: changement de capteur et période actualise graphique, valeurs et export; le lien partagé restaure les filtres.
**Acceptance Scenarios**:
1. Les graphiques affichent unité, fenêtre, source et dernière acquisition; une table fournit les valeurs sans survol.
2. Une panne laisse les dernières données visibles avec un statut périmé et une action Réessayer.
3. La sélection BIM montre l'identifiant de l'objet. Sans mapping vérifié, aucune correspondance capteur/objet n'est affirmée.

### User Story 4 — Préparer l'IA (Priority: P2)
L'exploitant consulte des recommandations explicables issues de seuils, sans les confondre avec une prédiction IA.
**Independent Test**: chaque insight expose règle, valeur et limite; le statut IA non connectée est visible.
L'intégration d'un fournisseur IA, la validation métier et la traçabilité des réponses forment un lot ultérieur.

### Edge Cases
Session expirée, email invalide, double clic connexion, identifiants erronés, réseau coupé, InfluxDB indisponible, série vide, données anciennes, modèle inaccessible, WebGL indisponible, filtres URL invalides, navigation mobile et clavier, texte externe contenant du HTML.

## Requirements
- **FR-001**: Trois routes principales /, /login et /dashboard, plus /register et une démo explicitement publique.
- **FR-002**: Authentification locale sécurisée du pilote et protection serveur des données réelles.
- **FR-003**: Viewer XKT existant conservé, dépendance SDK figée et servie localement.
- **FR-004**: Huit métriques environnementales avec unités, historique, état et export CSV.
- **FR-005**: Contrat unique /api/telemetry; alias /latest et /ingest conservés pour compatibilité.
- **FR-006**: Requêtes Flux paramétrées et écritures synchrones confirmées avant accusé de réception.
- **FR-007**: Maintenance et actions persistées côté serveur, accessibles aux comptes du pilote, jamais seulement en mémoire navigateur.
- **FR-008**: Données de démo déterministes séparées; aucune substitution silencieuse aux données réelles.
- **FR-009**: UI responsive, focus visible, erreurs explicites, contraste AA et alternative textuelle aux visualisations.
- **FR-010**: Aucun secret ni état interne de base de données dans les nouveaux fichiers suivis.

### Key Entities
Utilisateur, Session, Site, Modèle BIM, Objet BIM, Capteur, Observation, Insight, Maintenance, Action. Le pilote possède un site partagé; les actions appartiennent à leur auteur. La multi-location et le RBAC sont des extensions planifiées.

## Success Criteria
- **SC-001**: Les parcours présentation/démo/connexion/déconnexion fonctionnent à 390 px et sur bureau.
- **SC-002**: Uvicorn démarre, /health répond et les tests couvrent régression d'import, auth, autorisations, requêtes Flux et persistance.
- **SC-003**: Aucun 404 pour scripts, styles, SDK et modèle dans le déploiement documenté.
- **SC-004**: Les données réelles indisponibles produisent un état d'erreur explicite, jamais des KPI inventés.
- **SC-005**: La liste de tâches sépare les capacités livrées et les futurs connecteurs, IAM, BIM et IA.
