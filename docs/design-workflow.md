# Méthodes de conception et de validation

Ces huit méthodes s’appliquent aux évolutions d’EcoTwin, une plateforme de jumeaux numériques destinée aux responsables de bâtiments et aux équipes techniques. Le parcours public explique le pilote; l’espace connecté aide à examiner une mesure, son contexte BIM et les points de vigilance.

1. **Retirer le décor générique.** Examiner les pages rendues avant de modifier. Supprimer les halos, effets et icônes sans fonction, les slogans vagues et les cartes répétées. Conserver les conventions métier, l’identité et les choix explicites du projet. Une grille dans une vue BIM sert au repérage; elle ne devient pas un motif de fond global.
2. **Maintenir DESIGN.md.** Les couleurs, polices, espacements, composants, états et mouvements y sont définis. Les variables CSS restent la source d’exécution. Mettre à jour le contrat UX lors d’un changement de comportement.
3. **Construire un dashboard utile.** Afficher unités, source et date; distinguer démo et réel, absence et panne. Synchroniser métrique et période avec l’URL. Proposer une table alternative au graphique, un catalogue triable et un export cohérent avec les lignes affichées. Ne pas classer ensemble des valeurs d’unités différentes.
4. **Soigner l’interface.** Hiérarchie claire, palette limitée, texte lisible et commandes accessibles. Vérifier présentation, connexion, inscription, dashboard et outils BIM concernés sur mobile et ordinateur. Les espaces libres séparent les tâches; les panneaux regroupent des contenus fonctionnels.
5. **Chercher des références si la direction manque.** Consulter plusieurs exemples pertinents sur Godly ou une source comparable, noter les URL réellement visitées et les principes retenus. Ne jamais inventer une consultation. Pour cette passe, l’identité existante et la référence métier Autodesk Tandem fournie par le porteur du projet suffisent : aucune recherche Godly n’a été effectuée.
6. **Tester avec Playwright.** Utiliser rôles et libellés, attendre les états visibles et les réponses attendues. Tester navigation, authentification, filtres, tri, export, erreur réseau et BIM. Rapporter les commandes exécutées et les limites; une suite configurée ne constitue pas une suite exécutée.
7. **Évaluer Aceternity selon la stack.** Le frontend utilise React et du CSS partagé, sans Tailwind : aucun composant Aceternity n’est ajouté pour cette migration. Si un composant spécifique devient utile, vérifier la documentation actuelle, l’utilité, le coût et la réduction des animations avant intégration.
8. **Faire la vérification de livraison.** Contrôler responsive, contraste, clavier, focus, libellés, états vides, chargement, erreurs, textes longs et débordements. Examiner les captures en plus des contrôles axe. Documenter les écarts restants sans déclarer une conformité non vérifiée.

## Commandes et preuves

`npm run check`, `npm run format:check`, `npm run test:unit` et `npm run test:e2e` couvrent les contrôles automatisés du frontend. Playwright produit les captures et traces dans `test-results/` (ignoré par Git). Les résultats datés sont consignés dans [verification.md](verification.md).

Cette procédure complète la [spécification](../specs/001-digital-twin-platform/spec.md), le [design](../DESIGN.md) et le [contrat UX](../UX-CONTRACT.md). Elle ne transforme pas les fonctionnalités planifiées — association objet-capteur et IA — en fonctionnalités disponibles.
