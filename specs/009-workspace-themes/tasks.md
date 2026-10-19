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
- [x] W010 Rejouer `npm run test:e2e` et les tests API avec le backend : Python 3.12 requis (le lock épingle pydantic-core 2.16.3, sans binaire pour 3.13). Résultat 2026-10-19 : API 25 réussis / 1 ignoré, Ruff OK, Playwright 26/26 après correction de 8 échecs dus à la refonte (voir docs/verification.md).
- [ ] W011 Ajouter `family` (et les unités par famille) à l’API et au modèle de données, puis valider le regroupement avec de vraies familles de capteurs.
- [ ] W012 Activer les cartes thermiques une fois l’association objet-capteur livrée (dépend de T030 dans `specs/001-digital-twin-platform/tasks.md`).
- [x] W013 Régénérer les captures de `docs/images/` avec l’API de démonstration réelle (dashboard clair, sombre, mobile, assistant).
- [ ] W014 Compléter la vérification : rendu WebGL du vrai modèle en thème sombre, lecture sur 7 jours, autres modèles (niveaux), thème sombre dans la suite Playwright (axe 320/768/1440 px et mouvement réduit déjà couverts en clair sur le dashboard de démonstration).
