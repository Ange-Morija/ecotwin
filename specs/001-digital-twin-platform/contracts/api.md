# Contrats API
Toutes les données réelles exigent un cookie de session valide ou, pour la télémétrie machine, X-API-Key configurée. Les écritures avec cookie et toutes les opérations auth requièrent X-EcoTwin-Request: 1 et une Origin autorisée si présente.
- GET /health → {"status":"ok"}.
- POST /api/auth/register {name,email,password>=12} → 201 user + session; 403 si inscription désactivée.
- POST /api/auth/login {email,password} → user + session; 401 générique; 429 après limitation.
- GET /api/auth/me → user ou 401.
- POST /api/auth/logout → session révoquée.
- GET /api/dashboard?mode=demo|live&period=24h|7d → source, generated_at, sensors[], history{}, insights[], ai.
  Démo publique; live protégé et 503 si Influx indisponible. Valeurs absentes null, pas zéro.
- POST /api/telemetry/ingest {items:[Measurement]} → written après écriture synchrone; 400 vide, 422 invalide, 503 dépendance.
- GET /api/telemetry/latest?sensor=id → valeurs + _time, paramètres Flux.
- POST /api/telemetry/maintenance?sensor=id {maintenance:{...},maintenance_ia:{...}} → état persisté; authentifié.
- GET/POST /api/mlops/actions; PUT/DELETE /api/mlops/actions/{id} → actions de l'auteur.
Alias historiques /latest et /ingest conservés. Pas de route de prédiction IA fictive.
