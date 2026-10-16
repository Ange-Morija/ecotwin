---
name: remove-ai-slop
description: "À utiliser pour auditer et nettoyer un site/webapp existant de Morija (Geodemy, ATS Config Studio, portfolio, Point Cloud Toolkit, etc.) des tics visuels \"IA générique\" — se déclenche dès qu'elle demande de nettoyer, dépolluer, rendre moins \"AI slop\", ou passer en revue un site déjà construit avant de le livrer ou le refondre."
---

# Remove AI Slop

Liste de nettoyage personnelle de Morija : les tics visuels qu'un agent de code produit par défaut et qu'elle veut systématiquement traquer et supprimer de ses sites existants. Contrairement à **impeccable-design** (checklist générale à appliquer en construisant), cette skill sert à **auditer du code déjà écrit** et à le corriger point par point.

## Méthode

1. Parcourir le code du site (HTML/CSS/JSX/TSX) et chercher chaque motif ci-dessous avec les indices de recherche donnés.
2. Pour chaque occurrence trouvée, appliquer le correctif proposé plutôt que de simplement supprimer l'élément — la plupart de ces motifs remplacent un vrai besoin (hiérarchie, structure) qu'il faut satisfaire autrement.
3. Une fois la passe terminée, relire l'ensemble de la page : ces motifs se combinent souvent (ex : gradient + glow + glassmorphism sur la même carte), corriger un par un peut laisser des résidus visuels à la fin.

## Checklist de suppression

**Couleur & fond**
- **Dégradé violet-vers-bleu** : chercher `gradient` combiné à des teintes violet/bleu (`purple`, `indigo`, `violet` à `blue`/`cyan`). Remplacer par une couleur d'accent unique et sobre, ou un fond neutre.
- **Texte en dégradé dans le hero** (`background-clip: text` / classes `bg-gradient-to-* bg-clip-text`) : repasser en couleur pleine, réserver le dégradé à un élément décoratif isolé si vraiment nécessaire.
- **Glassmorphism** (`backdrop-blur`, fonds semi-transparents sur cartes) : à garder seulement si un vrai empilement visuel le justifie ; sinon repasser en fond opaque.
- **Mode sombre à faible contraste** : vérifier le contraste texte/fond en dark mode indépendamment du mode clair (WCAG AA 4.5:1) — ne jamais supposer qu'il a été hérité correctement.
- **Texture de grain sur un dégradé** (overlay de bruit/noise en CSS ou SVG filter) : supprimer sauf si elle sert une identité de marque délibérée.
- **Bordure colorée sur le côté des cartes** (`border-l-4 border-blue-500` et variantes) : le signe le plus reconnaissable d'une UI générique. Supprimer, utiliser l'espacement ou une vraie élévation pour hiérarchiser à la place.

**Typographie**
- **Emojis partout** (dans les titres, bullet points, boutons) : remplacer par des icônes vectorielles cohérentes (une seule bibliothèque) ou rien du tout — un emoji n'est jamais un substitut à une hiérarchie visuelle.
- **Inter partout** : vérifier `font-family` — si c'est Inter par défaut sans raison de marque, choisir une police plus distinctive (voir impeccable-design pour des alternatives).
- **Badge au-dessus du titre héros** (pastille/pill "eyebrow" en majuscules) : supprimer ou remplacer par du texte explicite intégré au titre.
- **Serif en italique sur les mots d'accent** dans un titre par ailleurs sans-serif : mettre en valeur avec l'italique/gras de la même police plutôt qu'une famille différente.
- **Combo Space Grotesk + Instrument Serif** : combinaison très reconnaissable comme "générée par IA" — remplacer l'une des deux polices par un choix moins standard.
- **Tirets cadratins (—) partout dans les textes** : les remplacer par une virgule, un point, ou restructurer la phrase.
- **Copy générique à base de buzzwords** ("streamline", "empower", "unlock", "seamless") : réécrire avec des phrases concrètes sur ce que fait réellement le produit.

**Composants & icônes**
- **Trois icônes en ligne (feature cards identiques)** : la mise en page "3 cartes égales, icône + titre + texte" répétée — remplacer par une grille asymétrique ou une autre structure de section.
- **Icônes Lucide partout sans discernement** : ok comme bibliothèque, mais vérifier qu'elles sont utilisées avec sens (pas une icône décorative pour chaque titre de section) et cohérence de style/taille.
- **Composants shadcn non retouchés** : chercher les classes par défaut de shadcn/ui laissées telles quelles — adapter au minimum les couleurs, rayons et espacements au design du projet.

**Mouvement & interaction**
- **Sections qui apparaissent en fondu au scroll** (`IntersectionObserver` ou libs de scroll-reveal appliquées systématiquement à chaque section) : garder seulement là où l'animation raconte quelque chose (révélation d'une donnée, transition d'état) — sinon, supprimer.
- **Faisceau lumineux qui suit le curseur** (spotlight/glow lié à `mousemove`) : supprimer sauf usage très ciblé et justifié.
- **Effets de survol qui font disparaitre le bouton** (opacity qui descend au hover sur un CTA) : contre-intuitif pour l'utilisateur — inverser la logique (le CTA doit se renforcer au survol, pas s'effacer).

**Espacement**
- **Espacement incohérent** : auditer les valeurs de padding/margin utilisées dans le fichier — les ramener à une échelle fixe (ex. 4/8/16/24/32/48px) plutôt que des valeurs arbitraires dispersées.

## À la fin de l'audit

Relire la page dans son ensemble et vérifier qu'aucune combinaison de deux motifs corrigés séparément ne laisse un résultat incohérent (ex : accent color changé dans une section mais pas dans une autre). Si le site va au-delà de cette liste précise, poursuivre avec la checklist complète de **impeccable-design** pour une passe plus large.