// ...existing code...
# ecotwin

EcoTwin est une application de visualisation 3D et dashboard de télémétrie. Ce README fournit : aperçu, installation locale, pipeline CI/CD détaillé (diagramme + étapes), déploiement local, bonnes pratiques et contribution.

---

## Table des matières
- [Aperçu](#aperçu)
- [Structure du dépôt](#structure-du-dépôt)
- [Prérequis](#prérequis)
- [Installation & lancement local](#installation--lancement-local)
- [Architecture & flux de données](#architecture--flux-de-données)
- [Pipeline CI/CD — diagramme et description complète](#pipeline-cicd---diagramme-et-description-complète)
- [Exemple GitHub Actions (CI)](#exemple-github-actions-ci)
- [Déploiement local (docker-compose)](#déploiement-local-docker-compose)
- [Bonnes pratiques](#bonnes-pratiques)
- [Contribuer](#contribuer)
- [Fichiers-clés](#fichiers-clés)

---

## Aperçu
EcoTwin fournit :
- un backend API Python (FastAPI) pour télémétrie et services (endpoint santé, accès aux modèles, etc.)
- un frontend statique HTML/CSS/JS qui héberge un viewer 3D et un dashboard
- orchestration infra via Docker Compose (Influx/Grafana optionnels)

---

## Structure du dépôt
- api/ — code API (FastAPI)
- web/ — assets frontend (public, js, styles)
- infra/ — docker-compose, .env.example
- docs/ — documentation d'architecture, notes
- README.md — ce fichier

---

## Prérequis
- Windows 10/11 (ou autre OS)
- Python 3.10+
- Node.js/npm (optionnel pour builds frontend)
- Docker & Docker Compose

---

## Installation & lancement local

API (Windows)
```powershell
cd api
python -m venv .venv
. .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (serveur statique simple)
```powershell
cd web/public
npx http-server -p 8080
# ouvrir http://localhost:8080
```

Tests (API)
```powershell
cd api
. .venv\Scripts\activate
pytest
```

---

## Architecture & flux de données
- Frontend charge un viewer 3D (xeokit ou équivalent) et les composants UI dans web/js/.
- Backend expose API REST/WebSocket pour télémétrie, métadonnées IFC, et endpoints de santé.
- Time-series (optionnel) : InfluxDB + Grafana via infra/docker-compose.yml.
- Les assets 3D (xkt/glb/ifc) sont servis par l'API ou via le serveur statique web.

---

## Pipeline CI/CD — diagramme et description complète

Diagramme (Mermaid) — pipeline CI/CD complet :
```mermaid
flowchart TB
  A[Pull/PR] --> B[Checkout]
  B --> C[Lint & Format]
  C --> D[Static Analysis]
  D --> E[Unit Tests]
  E --> F[Build Artifacts]
  F --> G[Package / Frontend Build]
  G --> H[Build Docker Images]
  H --> I[Scan Images]
  I --> J[Push to Registry]
  J --> K[Deploy]
  K --> L[Smoke Tests & Monitoring]
  subgraph CI
    B C D E F G H I J
  end
  subgraph CD
    J K L
  end
  K --> |local| K1[docker-compose up -d]
  K --> |prod| K2[Helm / kubectl -> Cluster]
```

Étapes détaillées
1. Pull/PR : déclenchement par push ou pull request.
2. Checkout : récupération du code et checkout de la branche/PR.
3. Lint & Format :
   - Python : ruff/black/flake8
   - JS : eslint + prettier
4. Static Analysis :
   - type checking (mypy/pyright)
   - dépendances vulnérables (safety / npm audit)
5. Unit Tests :
   - pytest pour api/
   - tests JS (jest/playwright) si présents
   - Coverage minimum (ex: 80%)
6. Build Artifacts :
   - frontend build (si toolchain présent)
   - empaqueter assets statiques
7. Package / Frontend Build :
   - minification, bundling, asset hashing
8. Build Docker Images :
   - api: Dockerfile optimisé (multi-stage)
   - web: image statique nginx ou similar
9. Security & Scanning :
   - image scan (Trivy) avant push
10. Push to Registry :
   - tag : semver + commit SHA
11. Deploy :
   - staging : automatique
   - production : manuel ou via gated promotion
   - options : docker-compose (local), Kubernetes (Helm)
12. Post-deploy Smoke Tests :
   - call /health, vérifier UI status, end-to-end basique
13. Monitoring :
   - logs, alerting (Grafana/Prometheus ou solutions cloud)

Points d'attention
- Linter/tests doivent être verts avant build d'images.
- Secrets via variables de pipeline / vault ; ne pas compromettre .env.
- Tagging reproductible pour rollback facile.

---

## Exemple GitHub Actions (CI) — snippet minimal
```yaml
# filepath: .github/workflows/ci.yml
# ...existing code...
name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  lint-and-test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install deps
        run: |
          python -m venv .venv
          . .venv\Scripts\activate
          pip install -r api/requirements.txt
      - name: Lint (ruff)
        run: |
          . .venv\Scripts\activate
          pip install ruff
          ruff check api
      - name: Run tests
        run: |
          . .venv\Scripts\activate
          pip install pytest
          pytest api -q
  build-and-publish:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: |
          docker build -t ghcr.io/${{ github.repository_owner }}/ecotwin-api:latest ./api
          docker build -t ghcr.io/${{ github.repository_owner }}/ecotwin-web:latest ./web
      - name: Push (example)
        run: echo "Push to registry step (configure credentials)"
# ...existing code...
```

---

## Déploiement local (docker-compose)
```powershell
cd infra
copy .env.example .env
docker compose up -d --build
docker compose logs -f
```
Fichiers importants : infra/docker-compose.yml, infra/.env.example

---

## Bonnes pratiques
- Ne pas committer secrets (.env).
- Multi-stage Dockerfile pour images légères.
- Tests et scans avant push.
- Tag par SHA pour traçabilité.
- Separate staging/prod avec gating.

---

## Contribuer
- Ouvrir une issue pour discuter.
- Branches : feature/xxx, fix/xxx.
- Inclure tests et documentation pour les changements significatifs.
- Respecter formatage et checks CI.

---

## Fichiers-clés (ouvrir pour plus de détails)
- api/src/main.py
- api/Dockerfile
- web/public/index.html
- web/js/app.js
- web/js/pages/dashboard.js
- web/js/components/card-latest.js
- web/styles/main.css
- infra/docker-compose.yml
- infra/.env.example
- docs/architecture.md

---

Licence
- MIT (ou adapter selon besoin)

// ...existing