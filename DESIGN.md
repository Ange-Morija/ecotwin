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
platform.js possède navigation, boutons, champs, messages et rendu sûr des données. platform.css possède tous les tokens, les scrollbars et leurs états. bim-viewer.js possède exclusivement la scène WebGL. Les légendes ne reposent pas sur le survol.

## Do's and Don'ts
Afficher source, unité, date et absence de données. Aucun badge «live» pour la démo, aucun graphique inventé pour une panne réelle. Respecter prefers-reduced-motion; focus explicite; cibles 44 px. Exporter les observations effectivement affichées. Rendu de données externes via textContent.
