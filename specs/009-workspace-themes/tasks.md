# Tâches — atelier 3D et thèmes

- [x] W001 Remplacer le rail latéral par une barre supérieure; unifier vue d’ensemble et ancienne vue BIM.
- [x] W002 Ajouter `useTheme`, le thème sombre, le bouton, la mémorisation et les surcharges de contraste, dialogue de l’assistant inclus.
- [x] W003 Composer l’atelier plein écran : panneaux flottants, outils 3D horizontaux, empilement sous 1151 px.
- [x] W004 Lire et isoler les niveaux du modèle chargé (`levels`, `isolate`).
- [x] W005 Présenter les cartes thermiques comme inactives tant que l’association objet-capteur n’existe pas.
- [x] W006 Regrouper les capteurs par famille (`family?`, « Environnement » par défaut), onglets Capteurs / Points à examiner, indicateurs calculés.
- [x] W007 Ajouter la barre temporelle (précédent, lecture, pause, suivant) avec sélection partagée avec le graphique.
- [x] W008 Supprimer le CSS et les composants devenus inutiles; déplacer `data.csv` hors des assets servis; comparer les captures avant/après.
- [x] W009 Mettre à jour DESIGN.md, UX-CONTRACT.md, documentation, specs 001/007/008 et tests e2e adaptés; consigner résultats et limites dans docs/verification.md.
- [ ] W010 Rejouer `npm run test:e2e` et les tests API avec le backend (le nouveau test « atelier » et les tests adaptés n’ont pas été exécutés dans la session de livraison).
- [ ] W011 Ajouter `family` (et les unités par famille) à l’API et au modèle de données, puis valider le regroupement avec de vraies familles de capteurs.
- [ ] W012 Activer les cartes thermiques une fois l’association objet-capteur livrée (dépend de T030 dans `specs/001-digital-twin-platform/tasks.md`).
- [ ] W013 Régénérer les captures de `docs/images/` avec l’API de démonstration réelle (elles montrent l’ancienne interface).
- [ ] W014 Compléter la vérification : axe à 768 px, mouvement réduit, rendu WebGL en thème sombre, lecture sur 7 jours, autres modèles (niveaux).
