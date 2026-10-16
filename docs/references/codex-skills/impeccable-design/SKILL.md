---
name: impeccable-design
description: "À utiliser pour toute conception ou revue d'interface web (site, landing page, dashboard, artifact HTML) — applique le vocabulaire et les anti-patterns d'Impeccable pour éviter le rendu générique \"IA\" et produire un design soigné."
---

# Impeccable Design

Cette skill encode la méthode du système **Impeccable** (impeccable.style), conçu pour corriger les défauts récurrents ("AI slop") des interfaces générées par IA. Elle s'applique dès qu'une tâche implique de concevoir, styliser ou revoir une interface web : site vitrine, landing page, dashboard, artifact HTML, mockup.

## Étape 1 — Cadrer avant de construire (`shape`)

Avant d'écrire du code, clarifier en une phrase :
- **Mode** : le design doit-il **Persuade** (convaincre — landing page, page produit), **Operate** (faire — dashboard, outil), **Read** (clarifier — article, documentation) ou **Experience** (laisser le contenu primer) ?
- **Public cible** et **voix de marque** (ton, registre).
- Références à éviter (styles génériques "SaaS IA" à ne pas reproduire).

Ce cadrage détermine les choix de mise en page, de ton du texte, et le niveau d'expressivité admissible.

## Étape 2 — Construire en respectant un système cohérent

- Définir (ou respecter s'il existe déjà) un système de tokens simple : palette de couleurs, échelle typographique, rayons de bordure, espacements. Ne jamais introduire une couleur, une police ou un rayon "hors système" au fil du travail.
- Une seule famille de police pour le corps de texte + éventuellement une deuxième pour les titres — jamais plus, jamais une police par section.
- Échelle typographique nette : les tailles de titres doivent être clairement distinctes des tailles de corps (éviter une hiérarchie "plate").

## Étape 3 — Passer la checklist anti-patterns avant de livrer

Avant de considérer un design terminé, vérifier qu'aucun des défauts suivants n'est présent (regroupés par catégorie ; c'est la checklist "slop" d'Impeccable, ~66 règles) :

**Système de design**
- Couleur, police, taille de police ou rayon de bordure qui sortent de la palette/échelle définie.

**Détails visuels**
- Bordure d'accent verticale sur le côté d'une carte ("side-tab border" — le signe le plus reconnaissable d'une UI générée par IA).
- Glassmorphism (flou) utilisé comme pure décoration.
- Grille décorative en fond sans fonction.
- Bordure épaisse d'accent sur un élément très arrondi (conflit visuel).
- Cartes sur-arrondies (rayon > ~24px).
- Rayures en dégradé répété comme texture de fond.
- Illustrations SVG "faites main" à l'aspect amateur.

**Typographie**
- Label "kicker/eyebrow" en majuscules au-dessus d'un titre.
- Petite pastille/icône arrondie empilée au-dessus d'un titre.
- Titre héros en serif italique surdimensionné.
- Pilule/chip "eyebrow" juste au-dessus du titre héros.
- Titre héros qui est une phrase complète entière en taille display.
- Letter-spacing resserré à l'excès (nuit à la lisibilité).
- Police trop utilisée (Inter, Geist, Space Grotesk) sans raison de marque.
- Une seule police pour absolument tout.
- Texte long tout en majuscules.
- Texte fonctionnel (labels, légendes) sous 11px.

**Couleur & contraste**
- Halo en dégradé radial saturé sur fond sombre (décoration "IA").
- Palette violet/cyan typique "IA".
- Fond sombre avec glow coloré en box-shadow.
- Texte en dégradé qui nuit à la lisibilité.
- Texte gris qui s'estompe sur fond coloré.
- Palette crème/beige par défaut sans intention.
- Contraste texte/fond sous le seuil WCAG AA.

**Mise en page & espacement**
- Petits numéros décoratifs répétés à côté des titres de section.
- Cartes qui touchent le bord du conteneur/scroller.
- Élément opaque qui recouvre du texte lisible.
- Une colonne beaucoup plus large que sa voisine sans raison.
- Titre trop collé au bloc précédent.
- Mise en page "gros chiffre + petit label" répétée en trio de stats sans variation.
- Grille de cartes identiques (icône + titre + texte répété N fois).
- Une seule valeur d'espacement utilisée partout (rythme monotone).
- Cartes imbriquées dans des cartes ("nested cards").
- Lignes de texte de plus de ~80 caractères de large.
- Contenu qui déborde de son conteneur.
- Contenu positionné en absolu coupé par un conteneur en overflow (tooltips tronqués).
- Padding trop serré, texte collé au bord de son conteneur ou au bord de la page.
- Texte justifié sans césure (espacement inégal des mots).
- Niveau de titre sauté (h1 → h3 sans h2).
- Line-height sous 1.3x la taille de police.
- Corps de texte sous 12px.
- Letter-spacing large (> 0.05em) sur du texte de corps.

**Mouvement**
- Point de statut qui pulse pour simuler du "live" de façon purement décorative.
- Faux curseur clignotant sur du texte non éditable.
- Bandeau en défilement automatique continu (marquee).
- Easing "bounce"/élastique sur des éléments d'interface.
- Animation de propriétés de layout (width/height/padding) qui cause du thrash.
- Transformation au survol d'une image (scale/rotate) sans raison.

**Texte / contenu**
- Même libellé répété plusieurs fois dans un même conteneur.
- Plus de deux tirets cadratins (—) dans un même paragraphe (signature de texte généré par IA).
- Buzzwords marketing génériques ("streamline", "empower", "unlock", etc.).
- Cadence "aphoristique" artificielle (phrases-punchline répétitives).

**Imagerie**
- Illustration héros assemblée à partir de formes SVG génériques.
- Contour "organique" simulé par un clip-path fragile.
- Photo rendue quasi invisible sous un voile/opacité.
- Image cassée ou avec un src placeholder/vide.

**Qualité générale**
- Erreur de script non interceptée au chargement.
- Contenu invisible au repos (animation de reveal mal réglée).

## Étape 4 — Passe de polish finale

Une fois la checklist passée, faire une dernière relecture "`/polish`" : chercher les petits détails qui séparent un design correct d'un design soigné — alignement au pixel près, cohérence des ombres, transitions discrètes et utiles (pas décoratives), micro-espacements. Éviter la sur-correction : `/quieter` si le résultat devient trop chargé, `/bolder` s'il reste trop timide.

## Vocabulaire de référence (interventions nommées)

Quand Morija demande une retouche précise, ces termes désignent une intervention ciblée — les utiliser pour clarifier ce qui va changer :
- **typeset** — corriger la hiérarchie typographique générique.
- **colorize** — ajouter une couleur stratégique et intentionnelle.
- **layout** — corriger l'espacement et le rythme visuel.
- **animate** — ajouter un mouvement expressif et délibéré (pas décoratif).
- **distill** — soustraction impitoyable, réduire à l'essentiel.
- **adapt** — rendre le design fonctionnel sur tous les écrans.
- **harden** — rendre prêt pour la production (cas limites, erreurs, contenu vide).
- **audit** — vérification technique en 5 dimensions, sévérité P0 à P3.
- **critique** — revue de design avec score et test "persona".

## Note

Cette skill reproduit la méthodologie et les règles publiques du système Impeccable (impeccable.style) pour guider la conception dans cette conversation. Ce n'est pas l'outil Impeccable lui-même (qui s'installe comme CLI/plugin dans un projet de code avec ses propres commandes slash et hooks d'audit automatiques) — si Morija veut l'outil complet avec détection automatique intégrée à son repo, il faudrait l'installer séparément depuis impeccable.style.