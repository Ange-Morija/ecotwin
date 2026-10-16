# Plan technique de migration

## Décision
React 19 + TypeScript strict + Vite 8 + React Router 7, versions exactes dans package.json/package-lock.json. FastAPI reste l’API et propriétaire de la sécurité. Le déploiement existant consomme des fichiers statiques; aucun serveur Node n’est requis en production. Un serveur Next.js et le SSR n’apportent pas de capacité nécessaire au pilote actuel. CSS partagé conservé; aucun ajout de Tailwind ou Aceternity sans besoin de composant précis.

## Propriétaires
- `web/src/App.tsx` : routes, frontières d’erreur/chargement et navigation clavier.
- `pages/Landing.tsx`, `pages/Auth.tsx`, `pages/Dashboard.tsx` : parcours.
- `components/ui.tsx` : boutons, navigation, icônes, messages et indicateurs.
- `components/TrendPanel.tsx` : graphique SVG déclaratif, sélection d’observation, table et CSV; une série de 24 ou 168 points.
- `components/SensorTable.tsx` : catalogue borné, recherche/filtre/tri et export cohérent.
- `components/BimPanel.tsx` : cycle de vie React, textes et commandes; `lib/bim-engine.ts` : objets GPU et SDK chargé à la demande, callbacks, destruction. Une seule scène.
- `lib/useDashboard.ts` : appels groupés, annulation et délai de réponse, rafraîchissement toutes les 30 secondes si onglet visible, reprise réseau, état périmé et retour à la période de la dernière réponse exploitable après échec.
- `lib/types.ts` et `lib/api.ts` : contrats TypeScript et client même origine; aucun secret stocké dans le navigateur.
- `platform.css` : tokens; `react.css` : agencement des composants React. Le build Vite produit CSS et JS minifiés par route dans `web/dist/app-assets`.

URL : mode, view, metric, period, q, state, sort, dir. Recherche en replaceState; navigation/choix validés en pushState. Le point de graphique sélectionné, le détail d’insight et l’ouverture de la table sont éphémères et conservés pendant les actualisations. Aucun stockage local de données ou session.

Mobile : résumé et vigilance avant graphique/BIM; filtres natifs, slider clavier/tactile, catalogue défilable dans une région focalisable, mêmes opérations qu’au bureau. Aucun blocage du défilement natif; préférence de réduction des animations conservée. Mode portrait et paysage reposent sur les mêmes breakpoints.

## Distribution
`npm run build` vérifie le typage, construit le bundle, copie les assets utiles et le SDK précompressé, exclut l’IFC source. FastAPI monte `web/dist` et Nginx reçoit ce même dossier. `npm run dev` expose Vite avec proxy `/api` vers FastAPI local pour le rechargement à chaud. Playwright reconstruit avant de lancer son serveur isolé.

## Vérification
Tests existants adaptés à la persistance des composants, plus navigation SPA/canvas conservé, restauration filtre/tri, sélection au clavier, image illustrative réellement chargée et état vide sans données fabriquées. Vérifier les deux images et au moins les parcours React/BIM/auth via Nginx. Voir les résultats datés dans docs/verification.md.
