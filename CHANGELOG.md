# Journal des changements

## Non publié — pilote 0.2.0

### Produit
- Pages présentation, connexion, inscription locale et dashboard responsive en français.
- Viewer BIM XKT avec SDK figé servi localement, sélection d'objet et navigation.
- Catalogue de huit métriques, historique horaire, filtres partageables, table alternative et export CSV.
- Insights par règles de seuil avec provenance et statut IA non connectée.
- Constitution, spécification, architecture, contrats et tâches via GitHub Spec Kit.

### Corrections
- Import circulaire qui bloquait FastAPI et incohérences de routes/frontend.
- Requêtes Flux paramétrées et listes de champs valides.
- Écritures Influx synchrones avant accusé de réception.
- Validation des mesures vides/non finies et limitation de taille des lots.
- Sessions révocables, hash des mots de passe, CSRF et contrôle d'accès.
- Persistance des actions/maintenances; suppression des faux succès locaux.
- Rendus de données externes sans injection HTML; dialogues et focus améliorés.
- Replay CSV : endpoint, valeurs invalides et arrêt en fin de fichier.
- Docker : assets/modèle inclus, proxy Nginx et droits pour utilisateurs non privilégiés.

### Qualité et documentation
- Tests API dont intégration InfluxDB réelle et parcours Playwright.
- Vérifications axe sur les principales pages à 390 et 1440 pixels.
- CI GitHub Actions ajoutée, avec InfluxDB jetable.
- README, architecture, déploiement, sécurité, modèle de données et captures actualisés.
- .env et fichiers internes InfluxDB retirés du suivi, copies locales préservées.

### Encore planifié
Mapping BIM-capteurs, multi-sites/IAM/SSO, import IFC, connecteurs IoT, moteurs IA, notifications et préparation de production. Aucun déploiement de production ou tag de release n'est créé par ce journal.
