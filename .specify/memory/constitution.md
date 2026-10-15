# Constitution EcoTwin

## Core Principles

### I. Un jumeau explicable
Chaque mesure conserve sa source, son unité, son horodatage et son lien BIM lorsqu'il est vérifié. Démonstration, données réelles et données manquantes restent distinctes. Aucun lien BIM ni résultat IA ne doit être inventé.

### II. Des parcours utilisables
Présentation, connexion et exploitation partagent un langage visuel et des composants accessibles. Les tâches essentielles fonctionnent au clavier et sur mobile. Le dashboard montre d'abord les anomalies et leur contexte.

### III. Sécurité par défaut
Sessions côté serveur, mots de passe hachés, autorisation des écritures, requêtes paramétrées, aucune clé dans le navigateur. L'isolation multi-tenant est obligatoire avant tout déploiement multi-client.

### IV. Contrats et preuves
Chaque fonctionnalité est décrite dans spec.md, planifiée dans plan.md puis suivie par tâche identifiable. Les corrections de régression et les parcours critiques ont des tests. Les résultats non exécutés ne sont jamais déclarés validés.

### V. Livraison progressive
Réutiliser FastAPI, le frontend modulaire et le viewer XKT. Préférer un monolithe modulaire vérifiable à des services prématurés. Connecteurs, SSO et IA sont des frontières explicites et documentées.

## Contraintes
Python >=3.11, français/fr-FR, fuseau Europe/Paris pour l'affichage. Stockage local SQLite pour comptes et sessions du pilote mono-site; InfluxDB pour les séries réelles. Le mode démonstration est public et ne donne aucun accès aux écritures ni aux données privées.

## Workflow et qualité
Une spécification et des critères d'acceptation précèdent l'implémentation. Tests API, parcours navigateur, vérification mobile et contrôle des secrets précèdent une livraison. Les tâches futures restent non cochées.

## Governance
Tout changement de principe met à jour cette constitution et les contrats concernés. Les décisions du produit et les changements d'architecture sont tracés dans les spécifications. Aucune publication automatique n'est requise par cette constitution.

**Version**: 1.0.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-15
