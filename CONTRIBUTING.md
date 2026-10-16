# Contribuer à EcoTwin

## Avant de modifier le produit
Lire [la constitution](.specify/memory/constitution.md), [DESIGN.md](DESIGN.md), [UX-CONTRACT.md](UX-CONTRACT.md) et la [spécification active](specs/001-digital-twin-platform/spec.md). Les valeurs de démonstration, observations réelles et résultats IA doivent rester distincts.

Utiliser le workflow Spec Kit installé : specify → plan → tasks → implement → analyze. Les compétences Codex sont sous .agents/skills; la sélection active est dans .specify/feature.json. Une tâche n'est cochée qu'après implémentation et vérification.

## Installation et vérification
Les commandes reproductibles se trouvent dans [README.md](README.md). Avant de proposer un changement:
```bash
.venv/bin/python -m ruff check api/src api/tests
.venv/bin/python -m ruff format --check api/src api/tests
npm run build
.venv/bin/python -m pytest api/tests -q
npm run check
npm run format:check
npm run test:unit
npm run test:e2e
git diff --check
```
Le test Influx réel nécessite une base neuve jetable; son absence doit être déclarée comme test ignoré. Les fichiers test-results sont locaux et ignorés.

## Changements attendus
- Correction de régression : test qui reproduit le comportement défectueux.
- Nouvelle interaction : vérifier clavier, mobile, chargement, état vide et erreur.
- Nouvelle source : documenter unités, provenance, date et autorisations.
- Nouvelle UI : réutiliser les tokens/composants et mettre à jour les contrats si la décision est durable.
- Documentation : distinguer ce qui fonctionne, ce qui a été exécuté et ce qui reste planifié.

Ne jamais committer .env, comptes de tests persistants, secrets, dossiers de dépendances ou fichiers internes d'une base. Ne pas publier de valeurs sensibles dans une issue ou un rapport. Les changements d'historique, de production ou de politique d'accès doivent être explicitement décidés.

Méthode UI : [huit méthodes de conception et de validation](docs/design-workflow.md).

Frontend : travailler dans `web/src`, réutiliser `components/ui.tsx` et les tokens existants. `npm run dev` active le rechargement Vite; `npm run build` vérifie le typage et reconstruit les fichiers réellement servis par FastAPI. Ne pas modifier `web/dist` directement. Le SDK WebGL est isolé dans `lib/bim-engine.ts`; ne pas muter le DOM React depuis le renderer.
