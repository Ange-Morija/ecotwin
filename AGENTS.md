# Consignes EcoTwin

Avant une modification, lire le README et les consignes du sous-répertoire concerné s’il en existe.

Pour les interfaces, appliquer les huit méthodes de [docs/design-workflow.md](docs/design-workflow.md) selon leur pertinence. Lire [DESIGN.md](DESIGN.md) et [UX-CONTRACT.md](UX-CONTRACT.md), préserver l’identité et les choix explicites du projet. Réaliser les corrections demandées, puis vérifier les parcours et les états concernés; ne pas livrer uniquement un audit lorsqu’une réalisation est demandée.

Distinguer strictement données réelles et démo, absence de données et panne. Ne pas présenter l’IA ou l’association objet-capteur planifiées comme déjà livrées. Conserver le rendu sûr des textes externes et les protections de session.

Maintenir les documents et les tâches Spec Kit en accord avec le code. Consigner les tests effectivement exécutés et leurs limites dans docs/verification.md. Ne pas inventer de références visuelles consultées ni de résultats de tests.

Le frontend canonique est React/TypeScript dans `web/src`. Les assets servis sont générés dans `web/dist` par `npm run build`; ne pas les éditer directement. Le SDK WebGL reste derrière `lib/bim-engine.ts`. Consulter `specs/007-react-frontend/plan.md` avant de modifier ces frontières.
