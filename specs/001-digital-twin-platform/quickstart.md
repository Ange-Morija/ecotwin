# Démarrage et vérification
Depuis la racine du dépôt:
```bash
uv venv .venv --python python3
uv pip sync --python .venv/bin/python --require-hashes api/requirements-dev.lock
npm ci
npm run build
.venv/bin/python -m uvicorn api.src.main:app --host 0.0.0.0 --port 8000
```
Le serveur sert /, /login, /register, /dashboard et /api sur la même origine. En démo: /dashboard?mode=demo. Créer explicitement un compte local via /register; aucun compte ou mot de passe par défaut.
Données locales: .runtime/ecotwin.sqlite (ignoré). ECOTWIN_DATA_DIR permet de déplacer ce stockage. Pour HTTPS définir COOKIE_SECURE=true; avant exposition publique ALLOW_REGISTRATION=false ou remplacer par SSO approuvé.
Données réelles: fournir INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET et une API_KEY pour les machines; ne jamais les committer. L'absence de source réelle affiche une erreur 503 explicite.
```bash
.venv/bin/python -m pytest api/tests -q
.venv/bin/python -m ruff check api/src api/tests
npm run check
npm run test:e2e
```
Spec Kit: .agents/skills/speckit-* ; sélectionner .specify/feature.json, puis préciser spec → plan → tasks → implement → analyze. CLI initialisée depuis github/spec-kit commit 3238fa9285694dc539aeb9829b337bfd6aed7317. Les scripts officiels restent utilisables sans CLI.
La base Influx déjà versionnée n'est pas réutilisée. L'historique Git peut toujours contenir d'anciens identifiants: rotation et purge éventuelle nécessitent une intervention dédiée, jamais un reset automatique.
