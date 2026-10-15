# Research et décisions
- Le dépôt possède un viewer XKT de 13,7 Mo et un IFC source; conserver ces actifs et l'ancien viewer plutôt que les remplacer par une illustration.
- Import circulaire main/telemetry reproduit; déplacer l'auth dans core/security.py.
- Le SDK Influx installé a flush() non implémenté en mode batching; utiliser SYNCHRONOUS et propager les échecs avant de compter les points écrits.
- Flux doit utiliser des paramètres, dont sensor et bucket. Encoder les tableaux de champs via JSON, et jamais repr(list).
- Routes historiques /latest et /ingest conservées mais protégées; nouveau contrat /api/telemetry.
- Connexion locale et cookies serveur: aucun fournisseur OAuth demandé/configuré. Pilote local avec inscription explicite; décision SSO de production reste à prendre.
- Démo publique séparée de l'API réelle. Une panne de base ne déclenche jamais la démo.
- Pas de moteur IA présent: recommandations par règles exposées comme telles; aucun appel fournisseur inventé.
- Spec Kit initialisé via CLI officielle 1.2.1.dev0, source github/spec-kit commit 3238fa9285694dc539aeb9829b337bfd6aed7317. Les templates/scripts/intégration Codex sont installés; pas de publication de tickets.
