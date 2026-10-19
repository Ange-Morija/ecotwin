---
version: alpha
colors:
  terracotta: "#ab6c63"
  seaGlass: "#8ac1bd"
  orchid: "#a35c8a"
  primary: "#85456f"
  ink: "#3d332e"
  muted: "#6b5d56"
  background: "#faf7f4"
  surface: "#ffffff"
  accent: "#386d69"
  warning: "#9a5b10"
  danger: "#b43c44"
  workspaceBackground: "#faf7f4"
  workspaceText: "#3d332e"
  workspaceMuted: "#6b5d56"
  workspaceAccent: "#386d69"
  workspaceSelected: "#dcefed"
typography:
  display:
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  body:
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  workspace:
    fontFamily: "'Manrope Variable', 'Segoe UI', system-ui, sans-serif"
  data:
    fontFamily: "'SFMono-Regular', Consolas, monospace"
rounded:
  control: "8px"
  panel: "14px"
  workspacePanel: "16px"
spacing:
  unit: "4px"
  panel: "24px"
components:
  timelineMarker:
    backgroundColor: "{colors.terracotta}"
  authStory:
    backgroundColor: "{colors.seaGlass}"
    textColor: "{colors.ink}"
  timelineLabel:
    textColor: "{colors.orchid}"
  button:
    height: "46px"
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  input:
    height: "46px"
    textColor: "{colors.ink}"
  caption:
    textColor: "{colors.muted}"
  focus:
    textColor: "{colors.accent}"
  warning:
    textColor: "{colors.warning}"
  error:
    textColor: "{colors.danger}"
  workspaceSurface:
    backgroundColor: "{colors.workspaceBackground}"
    textColor: "{colors.workspaceText}"
  workspaceCaption:
    textColor: "{colors.workspaceMuted}"
  workspaceSelection:
    backgroundColor: "{colors.workspaceSelected}"
    textColor: "{colors.workspaceAccent}"
---
# EcoTwin design system

## Overview
Un poste de pilotage architectural pour responsables de bâtiments: précis, calme, matériel. Hybride: récit éditorial sur l'accueil, densité opérationnelle dans l'espace connecté. Signature: coupe axonométrique d'un bâtiment avec repères techniques; illustration explicitement schématique sur l'accueil, véritable modèle XKT dans le dashboard. Inspiration métier Tandem, identité propre sans copie de marque. Éviter le fond noir fluorescent, les halos décoratifs et les KPI sans provenance.

## Colors
Les variables de web/styles/platform.css sont la source d'exécution canonique (modèle B); le frontmatter reflète leurs valeurs. primary→--primary; ink→--ink; muted→--muted; background→--bg; surface→--surface; accent→--accent; warning→--warning; danger→--danger. Palette demandée : terracotta #AB6C63, verre marin #8AC1BD, encre chaude #3D332E et orchidée #A35C8A. Prune assombrie #85456F pour boutons/texte sur blanc, vert profond #386D69 pour sélections lisibles; ambre pour vigilance, rouge pour erreur; toujours un libellé en plus de la couleur.

## Typography
Familles système sur les pages publiques; Manrope variable auto-hébergée sur le dashboard (paquet @fontsource-variable/manrope 5.3.0, SIL OFL). La police est chargée avec la route et possède un repli système; aucune requête à Google Fonts. Titres marketing grands et légèrement resserrés, titres produit sobres, mesures en chiffres tabulaires et légendes techniques monospace. Français fr-FR; dates Europe/Paris. Aucune police décorative dans les tableaux.

## Layout
Rythme 4 px, panneaux 24 px. Accueil asymétrique texte/axonométrie; dashboard rail blanc 224 px et grille asymétrique : BIM/historique dans la colonne principale, métriques/points à examiner dans une colonne de 304 px (340 px au-delà de 1600 px). Sous 1150 px les panneaux passent en colonne; sous 800 px la navigation est horizontale et les alertes précèdent les mesures puis graphique/BIM. Le document reste scrollable.

## Elevation & Depth
Surfaces blanches et bordures gris bleu; ombre légère pour la vue axonométrique et panneaux flottants seulement. La profondeur 3D encode l'orientation du bâtiment.

## Shapes
Contrôles 8 px, panneaux 14 px sur les pages publiques et 16 px dans le dashboard. Pas de piles de capsules décoratives. Icônes linéaires partagées.

## Components
web/src/components/ui.tsx possède les primitives React; pages/Auth.tsx possède les formulaires. platform.css possède tous les tokens, les scrollbars et leurs états; react.css adapte les compositions. lib/bim-engine.ts possède exclusivement la scène WebGL et remonte les états à BimPanel.tsx par callbacks. Les légendes ne reposent pas sur le survol.

## Do's and Don'ts
Afficher source, unité, date et absence de données. Aucun badge «live» pour la démo, aucun graphique inventé pour une panne réelle. Respecter prefers-reduced-motion; focus explicite; cibles 44 px. Exporter les observations effectivement affichées. Rendu de données externes via textContent.

## Lisibilité et interaction

Public principal : responsables de bâtiments et équipes techniques. Présentation : expliquer les capacités et ouvrir la démo; connexion : accéder au pilote; dashboard : examiner une mesure et prioriser les vérifications.

Texte d’interface au minimum 12 px, corps 14 px, titres 15–34 px selon le rôle. Les libellés ne rétrécissent pas sur mobile. Le graphique conserve une table alternative; ses annotations SVG restent contraintes par son repère. Espacements : 4, 8, 12, 16, 24, 32 et 48 px. Cibles opérationnelles de 44 px minimum. Les fonctionnalités de présentation utilisent des colonnes ouvertes séparées par un filet, sans cartes ni icônes répétitives. Les panneaux du dashboard regroupent des tâches distinctes.

Le tri natif du catalogue expose `aria-sort` sur la colonne active, avec boutons nommés et focus visible. L’export respecte recherche et ordre affichés. Les dates absentes restent en fin de liste. Pas de tri transversal des valeurs de métriques d’unités différentes.

Mouvement : transitions de couleur de 150 ms pour confirmer un état; tracé des courbes 650 ms pour matérialiser une sélection, ouverture du dialogue 180 ms; aucun mouvement permanent. Le défilement doux est désactivé avec `prefers-reduced-motion`. Les pages publiques conservent leurs polices système; le dashboard charge sa police locale avec la route.

Méthode de référence : [les huit méthodes de conception](docs/design-workflow.md). L’inspiration métier Tandem n’implique aucune affiliation Autodesk. Références Godly de la passe du 2026-10-19 : voir la section « Références consultées » ci-dessous.

## Frontend React

React possède les interfaces déclaratives, les contrôles, les états et les textes; Xeokit possède la géométrie et la sélection GPU. React Router conserve les filtres dans l’URL et la scène reste montée entre vues du dashboard. Les pages publiques partagent la palette demandée et conservent leurs familles système; le dashboard utilise les variantes documentées ci-dessous. La réduction des animations reste respectée. Le graphique propose une observation sélectionnée au pointeur ou avec un curseur natif au clavier; aucune information ne dépend uniquement du survol. Les boutons, messages et champs restent partagés, sans nouvelle bibliothèque de style concurrente.

## Poste de surveillance — affinement du dashboard

Le dashboard adopte un rail blanc, un espace ivoire chaud et une sélection verre marin. Il s’agit d’une création originale répondant à la demande d’une composition de dashboard de type kit UI; aucun fichier ni modèle Figma n’a été consulté (connecteur absent de la session). Aucun élément n’est présenté comme importé de Figma.

`web/src/dashboard.css` possède les tokens `--workspace-bg`, `--workspace-text`, `--workspace-muted`, `--workspace-line`, `--workspace-accent`, `--workspace-selected` correspondant aux rôles workspace du système. Les cinq couleurs de surface/texte/sélection sont dans le frontmatter; le séparateur `--workspace-line: #e7dcd6` est documenté ici car le schéma de composants ne possède pas de propriété de bordure. Manrope correspond à typography.workspace et le rayon 16 px à rounded.workspacePanel. Les tokens des pages publiques restent dans platform.css. La feuille et la police sont chargées avec la route.

Le résumé présente trois informations calculées : mesures disponibles, dépassements observés et dernière acquisition reçue. Les huit métriques deviennent une liste latérale sélectionnable avec valeur/unité et état; aucune courbe miniature ni progression fictive. Sur mobile, cette liste devient une grille de deux colonnes. Le panneau BIM est principal; le dessin préalable est marqué « Aperçu schématique ». L’historique reste accessible avec ses filtres libellés, sa sélection clavier et sa table alternative. La composition change sans détruire la scène WebGL ni ses états.

## Commandes de travail

La barre de recherche du dashboard ouvre le catalogue et place le focus dans le champ; le raccourci `/` est affiché sur ordinateur et ignoré pendant une saisie. Une barre de commandes rend visibles la source, la période des vues de détail et l’actualisation automatique. Elle utilise les tokens existants et des contrôles natifs. Les champs de saisie et selects passent à 16 px sur mobile, afin de faciliter la lecture et d’éviter le zoom automatique du navigateur.

Les méthodes originales du ZIP utilisateur sont référencées dans `docs/references/codex-skills/README.md`; leur application privilégie des actions utiles plutôt que des animations décoratives ou un changement de marque.

## Comptes, assistant et Business
Palette explicitement fournie dans l’URL Figma Color Palette Generator : #AB6C63/#8AC1BD/#3D332E/#A35C8A. Ces codes sont une donnée utilisateur; aucune consultation de fichier Figma ou import de template n’est revendiqué. Les tokens brand sont `--terracotta`, `--sea-glass`, `--orchid` dans platform.css. Les couleurs claires servent aux surfaces, marqueurs ou filets; leurs variantes profondes portent les petits textes et actions pour conserver le contraste.

Page de connexion : panneau verre marin et illustration schématique; formulaire lisible sur blanc. Business : offre avec prix Stripe réel et parcours de facturation en trois étapes, sans faux tarif ou témoignage. Compte : identité et une tâche de sécurité explicite. Assistant : bouton dans l’en-tête, dialogue natif avec consentement et provenance; aucun élément flottant ne masque les mesures. Chronologie : quatre dernières observations, synchronisées à la métrique, sans événements d’exploitation inventés.

`services.css` possède ces compositions. Le tracé SVG n’est animé qu’au montage/changement de métrique ou taille de série; aucun redémarrage au survol. La préférence de réduction des mouvements supprime les animations. Les informations restent visibles indépendamment de l’animation.

## Références consultées (2026-10-19)

Pages Godly réellement récupérées : https://godly.design/ (accueil), https://godly.design/apps (liste, sans examen des fiches), https://godly.design/website/reevo, /website/superpower, /website/paradigmai et /website/cloaked. Les captures d’en-tête de Reevo, Superpower et Paradigm ont été regardées; celles de Cloaked n’ont pas été examinées (texte de la fiche seulement). Les sites eux-mêmes n’ont pas été visités et aucune animation n’a été observée en situation : seules des images fixes ont été vues. Aucune interface n’est copiée.

Principes retenus : libellés techniques en capitales monospace et filets verticaux entre indicateurs (Superpower, Paradigm); étiquettes d’état en pastille avec point, y compris pour « sans mesure » (Paradigm); mise en évidence brève d’une valeur qui change (état « en cours de mise à jour » de Paradigm). Principes écartés : fond sombre, photographie plein cadre, titres capitales ultra-condensées (Reevo, Superpower) — contraires à l’identité et aux consignes ci-dessus.

Mouvement ajouté, tous supprimés par `prefers-reduced-motion` : compteur 650 ms de la conformité à l’affichage, apparition échelonnée (380 ms, 40 ms par ligne) des métriques au montage, surbrillance de 900 ms d’une valeur modifiée par une actualisation. Aucun mouvement permanent.

## Thèmes clair et sombre du dashboard (2026-10-19)

L’espace connecté et la démonstration proposent un thème clair (identité ci-dessus) et un thème sombre. Le thème sombre est un brun chaud (`#1d1815` fond, `#27201c` surfaces, `#f1e9e2` texte), pas un noir; verre marin `#8ac1bd` pour les sélections et le focus, ambre `#e3b36a` pour la vigilance, prune éclaircie `#e3b0cc` pour les textes et contours d’actions secondaires. Les jetons vivent dans `web/src/theme.css` sous `.dashboard-layout[data-theme="dark"]`; les jetons clairs restent dans dashboard.css et platform.css. Les pages publiques, le compte et Business gardent leur thème clair.

Le thème suit `prefers-color-scheme` tant que le visiteur n’a pas choisi; le bouton de l’en-tête alterne ensuite clair/sombre et mémorise le choix dans `localStorage` (convenance par visiteur, sans donnée sensible; indisponible = le choix vaut pour la visite).

Composition de la vue d’ensemble sur écran large : le jumeau occupe la largeur et la colonne de droite flotte sur la vue 3D (mesures suivies, puis points à examiner, translucides); l’historique se place sous la vue. Sous 1150 px les panneaux se réempilent comme auparavant. Références : exemples APS `aps-iot-extensions-demo` et `aps-digital-twin` (vignettes et README consultés le 2026-10-19, voir plus haut) pour les panneaux flottants sur la vue 3D; non repris faute de données : sélecteur de niveaux, cartes thermiques et barre temporelle, qui supposent l’association objet-capteur et un modèle avec niveaux exploitables.
