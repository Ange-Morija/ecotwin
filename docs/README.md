# Documentation EcoTwin

EcoTwin est un pilote de plateforme de jumeaux numériques **mono-site partagé**. L'interface relie une vue BIM XKT, un catalogue de huit métriques et des observations datées. Les correspondances objet-capteur restent planifiées; le chatbot OpenAI et les abonnements Stripe sont configurables.

## Commencer
- [Présentation et installation](../README.md)
- [Produit, parcours et captures](product.md)
- [Architecture et flux](architecture.md)
- [Déploiement et configuration](deployment.md)
- [Sécurité et limites du pilote](security.md)
- [Tests exécutés et limites de validation](verification.md)
- [Nettoyage et mesures d’optimisation](../specs/001-digital-twin-platform/optimization.md)
- [Assistant IA](ai-integration.md)
- [Abonnements et configuration Stripe](billing.md)
- [Comptes, IA et Business](../specs/008-auth-ai-business/spec.md) et [contrats HTTP](../specs/008-auth-ai-business/contracts.md)

- [Migration du frontend React](../specs/007-react-frontend/spec.md) et [plan technique](../specs/007-react-frontend/plan.md)
- [Atelier 3D et thèmes clair/sombre](../specs/009-workspace-themes/spec.md), [plan](../specs/009-workspace-themes/plan.md) et [tâches](../specs/009-workspace-themes/tasks.md)

## Concevoir et contribuer
- [Constitution](../.specify/memory/constitution.md)
- [Spécification du pilote](../specs/001-digital-twin-platform/spec.md)
- [Plan technique](../specs/001-digital-twin-platform/plan.md)
- [Modèle de données](../specs/001-digital-twin-platform/data-model.md)
- [Contrats API](../specs/001-digital-twin-platform/contracts/api.md)
- [Tâches et prochaines étapes](../specs/001-digital-twin-platform/tasks.md)
- [Design](../DESIGN.md) et [contrat UX](../UX-CONTRACT.md)
- [Contribution](../CONTRIBUTING.md) et [changements](../CHANGELOG.md)

## Données
- [Mesures, unités et identifiants](../data-model/influx/measurements.md)
- [Rétention des observations](../data-model/influx/retention_policies.md)

L'OpenAPI interactive est servie sous `/docs` par FastAPI. Le frontend Nginx sert les pages produit; pour consulter l'OpenAPI dans un déploiement à deux conteneurs, utiliser le port API local documenté. Les fonctionnalités non livrées ne sont pas décrites comme disponibles.

Méthode UI : [huit méthodes de conception et de validation](design-workflow.md).
