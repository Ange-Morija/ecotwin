---
version: alpha
colors:
  primary: "#234e70"
  ink: "#172c3d"
  muted: "#5b6e7d"
  background: "#f3f6f8"
  surface: "#ffffff"
  accent: "#167d88"
  warning: "#9a5b10"
  danger: "#b43c44"
typography:
  display:
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  body:
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  data:
    fontFamily: "'SFMono-Regular', Consolas, monospace"
rounded:
  control: "8px"
  panel: "14px"
spacing:
  unit: "4px"
  panel: "24px"
components:
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
---
# EcoTwin design system

## Overview
Un poste de pilotage architectural pour responsables de bâtiments: précis, calme, matériel. Hybride: récit éditorial sur l'accueil, densité opérationnelle dans l'espace connecté. Signature: coupe axonométrique d'un bâtiment avec repères techniques; illustration explicitement schématique sur l'accueil, véritable modèle XKT dans le dashboard. Inspiration métier Tandem, identité propre sans copie de marque. Éviter le fond noir fluorescent, les halos décoratifs et les KPI sans provenance.

## Colors
Les variables de web/styles/platform.css sont la source d'exécution canonique (modèle B); le frontmatter reflète leurs valeurs. primary→--primary; ink→--ink; muted→--muted; background→--bg; surface→--surface; accent→--accent; warning→--warning; danger→--danger. Accent bleu pétrole pour sélection, ambre pour vigilance, rouge pour erreur; toujours un libellé en plus de la couleur.

## Typography
Familles système pour zéro téléchargement ni décalage. Titres marketing grands et légèrement resserrés, titres produit sobres, mesures en chiffres tabulaires et légendes techniques monospace. Français fr-FR; dates Europe/Paris. Aucune police décorative dans les tableaux.

## Layout
Rythme 4 px, panneaux 24 px. Accueil asymétrique texte/axonométrie; dashboard barre latérale 228 px, en-tête et grille principale BIM/historique. À 900 px navigation horizontale; à 600 px une colonne et résumé avant BIM. Le document reste scrollable.

## Elevation & Depth
Surfaces blanches et bordures gris bleu; ombre légère pour la vue axonométrique et panneaux flottants seulement. La profondeur 3D encode l'orientation du bâtiment.

## Shapes
Contrôles 8 px, panneaux 14 px. Pas de piles de capsules décoratives. Icônes linéaires partagées.

## Components
web/src/components/ui.tsx possède les primitives React; pages/Auth.tsx possède les formulaires. platform.css possède tous les tokens, les scrollbars et leurs états; react.css adapte les compositions. lib/bim-engine.ts possède exclusivement la scène WebGL et remonte les états à BimPanel.tsx par callbacks. Les légendes ne reposent pas sur le survol.

## Do's and Don'ts
Afficher source, unité, date et absence de données. Aucun badge «live» pour la démo, aucun graphique inventé pour une panne réelle. Respecter prefers-reduced-motion; focus explicite; cibles 44 px. Exporter les observations effectivement affichées. Rendu de données externes via textContent.

## Lisibilité et interaction

Public principal : responsables de bâtiments et équipes techniques. Présentation : expliquer les capacités et ouvrir la démo; connexion : accéder au pilote; dashboard : examiner une mesure et prioriser les vérifications.

Texte d’interface au minimum 12 px, corps 14 px, titres 15–34 px selon le rôle. Les libellés ne rétrécissent pas sur mobile. Le graphique conserve une table alternative; ses annotations SVG restent contraintes par son repère. Espacements : 4, 8, 12, 16, 24, 32 et 48 px. Cibles opérationnelles de 44 px minimum. Les fonctionnalités de présentation utilisent des colonnes ouvertes séparées par un filet, sans cartes ni icônes répétitives. Les panneaux du dashboard regroupent des tâches distinctes.

Le tri natif du catalogue expose `aria-sort` sur la colonne active, avec boutons nommés et focus visible. L’export respecte recherche et ordre affichés. Les dates absentes restent en fin de liste. Pas de tri transversal des valeurs de métriques d’unités différentes.

Mouvement : transitions de couleur de 150 ms pour confirmer un état; aucun effet d’entrée décoratif. Le défilement doux est désactivé avec `prefers-reduced-motion`. Police système conservée pour la continuité visuelle et l’absence de téléchargement.

Méthode de référence : [les huit méthodes de conception](docs/design-workflow.md). Aucune nouvelle référence externe consultée pendant cette passe; l’inspiration métier Tandem n’implique aucune affiliation Autodesk.

## Frontend React

React possède les interfaces déclaratives, les contrôles, les états et les textes; Xeokit possède la géométrie et la sélection GPU. React Router conserve les filtres dans l’URL et la scène reste montée entre vues du dashboard. La charte couleur, les familles système et la réduction des animations restent les mêmes. Le graphique propose une observation sélectionnée au pointeur ou avec un curseur natif au clavier; aucune information ne dépend uniquement du survol. Les boutons, messages et champs restent partagés, sans nouvelle bibliothèque de style concurrente.
