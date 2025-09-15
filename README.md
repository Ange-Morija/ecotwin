# EcoTwin

EcoTwin — application de visualisation 3D et dashboard de télémétrie. Ce dépôt contient :
- API Python (FastAPI) : api/
- Frontend statique (HTML/CSS/JS) : web/
- Infra pour tests locaux : infra/ (docker-compose, .env.example)
- Documentation d'architecture : docs/

Résumé : viewer 3D + panneau de télémétrie, assets servis soit par l'API soit statiquement.

---

## Table des matières
- Aperçu
- Structure du dépôt
- Prérequis
- Lancement local (Windows)
- Déploiement local (docker-compose)
- Pipeline CI/CD — diagramme simple + étapes
- Exemple GitHub Actions (minimal)
- Bonnes pratiques
- Contribuer
- Fichiers importants
- Licence

---

## Aperçu
- Backend : FastAPI pour endpoints REST/WebSocket (télémétrie, métadonnées, santé).
- Frontend : viewer 3D + dashboard (web/public, web/js, web/styles).
- Optionnel : InfluxDB/Grafana via infra/docker-compose.yml pour séries temporelles.

---

## Structure du dépôt
- api/ — code source API, Dockerfile
- web/ — public/, js/, styles/, Dockerfile
- infra/ — docker-compose.yml, .env.example
- docs/ — architecture, notes

---

## Prérequis
- Windows 10/11 (instructions ci‑dessous en PowerShell)
- Python 3.10+
- Node.js/npm (optionnel pour frontend tooling)
- Docker & Docker Compose

---

## Lancement local (Windows - PowerShell)

API
```powershell
cd api
python -m venv .venv
. .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
# API disponible sur http://localhost:8000 (vérifier /health)
```

Frontend (serveur statique)
```powershell
cd web/public
npx http-server -p 8080
# Ouvrir http://localhost:8080
```

Tests API
```powershell
cd api
. .venv\Scripts\activate
pytest -q
```

---

## Déploiement local (docker-compose)
```powershell
cd infra
copy .env.example .env
docker compose up -d --build
docker compose logs -f
```
Vérifier : endpoint santé de l'API et page frontend.

---

## Pipeline CI/CD — diagramme simple (Markdown)
Diagramme simple en ASCII (lisible n'importe où) :

```text
[PR / Push]
     |
     v
+-----------------+
| Checkout        |
+-----------------+
     |
     v
+-----------------+
| Lint & Format   |
+-----------------+
     |
     v
+-----------------+
| Unit Tests      |
+-----------------+
     |
     v
+-----------------+
| Build Artifacts |
| (frontend build)|
+-----------------+
     |
     v
+-----------------+
| Build Docker    |
| Images (api,web)|
+-----------------+
     |
     v
+-----------------+
| Push to Registry|
+-----------------+
     |
     v
+---------------------------+
| Deploy (compose / k8s)    |
+---------------------------+
     |
     v
+-----------------+
| Smoke Tests     |
+-----------------+
```

Étapes rapides
1. Checkout (PR/branch).
2. Lint & format (Python : ruff/black, JS : eslint/prettier).
3. Static analysis (mypy / npm audit).
4. Unit tests (pytest, jest/playwright si présents).
5. Frontend build / empaquetage des assets.
6. Build image Docker (multi-stage recommandé).
7. Scanner images (Trivy).
8. Push images (registry privée / GHCR).
9. Déploiement (staging automatique, prod manuel/gated).
10. Smoke tests (endpoint /health, UI load).

---

## Exemple GitHub Actions (minimal)
Extrait à adapter / sécuriser (se placer dans .github/workflows/ci.yml) :

```yaml
# filepath: .github/workflows/ci.yml
# ...existing code...
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v4
        with: python-version: '3.10'
      - name: Install deps & test
        run: |
          python -m venv .venv
          . .venv\Scripts\activate
          pip install -r api/requirements.txt
          pip install ruff pytest
          ruff check api
          pytest api -q
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build images
        run: |
          docker build -t ghcr.io/${{ github.repository_owner }}/ecotwin-api:latest ./api
          docker build -t ghcr.io/${{ github.repository_owner }}/ecotwin-web:latest ./web
# ...existing code...
```

Notes : sécuriser secrets (REGISTRY auth), activer scans d'images, tag par SHA.

---

## Bonnes pratiques
- Ne versionnez pas de secrets (.env). Utilisez variables CI / vault.
- Docker : multi-stage pour réduire taille et surface d'attaque.
- Linter/tests avant build d'images.
- Tag images avec semver + commit SHA.
- Monitoring & alerting sur métriques/erreurs.

---

## Contribuer
- Ouvrir une issue pour discuter d'une feature.
- Créer branche feature/xxx ou fix/xxx.
- Ajouter tests et documentation pour changements significatifs.
- Ouvrir PR et attendre checks CI verts.

---

## Fichiers importants
- api/src/main.py
- api/Dockerfile
- web/public/index.html
- web/js/app.js
- web/js/pages/dashboard.js
- web/js/components/card-latest.js
- web/styles/main.css
- web/Dockerfile
- infra/docker-compose.yml
- infra/.env.example
- docs/architecture.md

---s

Licence
- MIT