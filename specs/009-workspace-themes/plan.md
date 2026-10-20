# Plan technique — atelier 3D et thèmes

## Décision
Aucune dépendance ajoutée. React reste propriétaire des panneaux, textes et états; `lib/bim-engine.ts` reste le seul propriétaire de la scène (nouvelles méthodes `levels()` et `isolate(id)`). Les thèmes reposent sur des variables CSS surchargées sous `.dashboard-layout[data-theme="dark"]`; aucune seconde bibliothèque de style.

## Propriétaires
- `pages/Dashboard.tsx` : coque (barre supérieure, bannière démo, retours d’erreur, `main`), état de sélection d’observation partagé, atelier (`.workspace-stage`, masqué hors vue d’ensemble pour conserver le canvas) et pages Capteurs/Insights.
- `components/BimPanel.tsx` : scène, outils 3D, panneaux Niveaux et Cartes thermiques (inactif), texte d’état et de sélection BIM.
- `components/SensorsPanel.tsx` : onglets, indicateurs, groupes de familles, lignes de capteurs, intégration d’`InsightsPanel`.
- `components/TrendPanel.tsx` : graphique, désormais contrôlé (`selection`, `onSelection`); `components/TimelineBar.tsx` : lecture et barre temporelle, partageant la même sélection.
- `lib/theme.ts` : `useTheme` (système, choix mémorisé); `lib/motion.ts` : compteur et surbrillance, désactivés en mouvement réduit; `lib/types.ts` : `Selection`, `resolveIndex`, `Sensor.family?`.
- `theme.css` : jetons sombres et surcharges; `workspace.css` : coque, panneaux flottants, barre temporelle, empilement mobile; `dashboard.css` : tokens clairs et pages. Rail latéral, `ObservationTimeline` et les règles associées sont supprimés.

## Distribution et vérification
Même build statique. Vérifier : typage et build, format, tests Node; sur API simulée et Chromium, bascule/mémorisation du thème, axe WCAG A/AA/2.1/2.2 dans les deux thèmes à 1440 et 390 px, parcours de sélection/onglets/familles/lecture/niveaux, comparaison de captures avant/après nettoyage. Rejouer la suite Playwright du dépôt avec le backend. Résultats datés dans docs/verification.md.

## Suites
Champ `family` et unités par famille côté API; association objet-capteur (T030) pour activer les cartes thermiques; thème des pages Compte/Business si demandé.
