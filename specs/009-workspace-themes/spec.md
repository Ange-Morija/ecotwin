# Atelier 3D et thèmes clair/sombre

Date : 2026-10-19. Périmètre : interface du dashboard (démo publique et espace connecté), pilote mono-site. Aucun changement d’API ni de modèle de données.

## Besoin
Remplacer la vue d’ensemble (rail latéral, résumé en bandeau, grille asymétrique) par un atelier 3D inspiré de Tandem et des exemples APS (`aps-iot-extensions-demo`, `aps-digital-twin`) : le jumeau occupe l’écran, des panneaux flottants donnent le contexte, une barre temporelle rejoue l’historique. Proposer un thème clair et un thème sombre. Plusieurs familles de capteurs sont attendues à terme, pas seulement l’environnement.

## Parcours et acceptation
- W001 : `/dashboard` et `/dashboard?mode=demo` affichent une barre supérieure (marque, navigation Vue d’ensemble / Capteurs & données / Insights, source, assistant, recherche, thème, actualisation, compte, Business, connexion ou déconnexion). Un seul h1; la page courante porte `aria-current`. Les routes `view=bim` anciennes retombent sur `view=overview`.
- W002 : thème clair et thème sombre sur le dashboard. Premier affichage selon `prefers-color-scheme`; le bouton bascule et mémorise le choix dans `localStorage` (convenance par visiteur, lecture/écriture protégées; sans stockage le choix vaut pour la visite). Pages publiques, Compte et Business inchangées. Contrastes WCAG A/AA vérifiés dans les deux thèmes.
- W003 : vue d’ensemble ≥ 1151 px = atelier plein écran sans défilement de page. Jumeau 3D plein cadre; panneaux flottants à gauche (Niveaux, Cartes thermiques) et à droite (Capteurs / Points à examiner en onglets, Historique); outils 3D en barre horizontale; barre temporelle en bas. Sous 1151 px : vue, outils, panneaux, barre temporelle, empilés.
- W004 : Niveaux lus dans le modèle XKT chargé (`IfcBuildingStorey`, noms IFC non traduits). Isoler un niveau met le reste en transparence; « Tous les niveaux » restaure. Avant chargement ou sans niveau, le panneau le dit. Aucun niveau inventé.
- W005 : Cartes thermiques présentes mais inactives (« Aucun capteur relié ») tant que l’association objet-capteur n’existe pas; aucune couleur illustrative appliquée au vrai modèle ni présentée comme mesure.
- W006 : onglet Capteurs = quatre indicateurs calculés (conformité aux seuils, mesures disponibles, points de vigilance, dernière acquisition) et liste groupée par famille, repliable (`aria-expanded`), lignes sélectionnables (`aria-pressed`) avec jauge de seuil et état textuel. Famille = `sensor.family` si l’API la fournit, sinon « Environnement ». Onglet Points à examiner = règles explicables avec compteur. Les outils BIM, maintenance et actions restent dans l’ancien viewer, lié depuis le panneau.
- W007 : barre temporelle = précédent, lecture (700 ms par observation, arrêt en fin de série ou au changement de métrique), pause, suivant; elle partage la sélection d’observation avec le graphique. Le curseur natif « Observation sélectionnée » reste le contrôle clavier; la piste est décorative. Série vide : « Aucune observation ». Elle porte aussi l’actualisation automatique, l’état de connexion et la source.
- W008 : la scène 3D reste montée entre vues et actualisations; les pages Capteurs & données et Insights restent des pages centrées avec leurs filtres, tri et export.
- W009 : états hérités conservés : chargement, absence de source, panne avec données périmées, démonstration étiquetée, erreur WebGL avec nouvelle tentative.

## Constitution
Principe I : aucun lien BIM ni résultat illustratif n’est présenté comme réel (W005). Principe II : les points de vigilance sont dans l’en-tête de l’onglet Capteurs et en onglet dédié; tâches essentielles au clavier et sur mobile. Principe IV : les résultats non exécutés sont consignés dans docs/verification.md.

## Décisions et limites
Le thème n’est pas appliqué hors du dashboard. Les familles de capteurs, leurs unités et l’association objet-capteur dépendent de lots futurs (voir tâches ouvertes). Les tailles de cible des lignes de panneaux (36 à 40 px) restent sous les 44 px des boutons principaux, au-dessus du minimum WCAG 2.2 de 24 px. Références visuelles réellement consultées : voir DESIGN.md, « Références consultées ».
