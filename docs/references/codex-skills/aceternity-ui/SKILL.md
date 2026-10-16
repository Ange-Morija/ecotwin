---
name: aceternity-ui
description: "À utiliser quand on construit ou améliore une interface React/Next.js + Tailwind CSS et qu'un composant animé prêt à l'emploi (hero, carte 3D, background, navigation...) est utile — explique comment choisir et installer les composants Aceternity UI (ui.aceternity.com)."
---

# Aceternity UI

Aceternity UI est une librairie de plus de 200 composants React animés (React/Next.js + Tailwind CSS + Framer Motion), en copier-coller ou via le CLI shadcn, créée par Manu Arora (@mannupaaji). Cette skill s'applique dès qu'un projet est en **React/Next.js avec Tailwind CSS** et que la tâche implique une section visuellement travaillée (hero, background animé, carte interactive, navigation, timeline, etc.).

## Prérequis du projet

- Next.js (ou React) + Tailwind CSS déjà installés. Sinon, initialiser d'abord avec `create-next-app`, puis Tailwind.
- Le projet doit être configuré pour shadcn (utilitaire `cn`, `tailwind.config.js`, variables CSS) :
  ```bash
  npx shadcn@latest init
  ```
- Vérifier/ajouter `framer-motion`, `clsx`, `tailwind-merge` si un composant les requiert (le CLI les installe normalement automatiquement).

## Installer un composant

Deux méthodes, à préférer dans cet ordre :

**1. Registre nommé (recommandé, CLI shadcn 3.0+)** — ajouter une fois dans `components.json` :
```json
{
  "registries": {
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
  }
}
```
Puis pour chaque composant :
```bash
npx shadcn@latest add @aceternity/nom-du-composant
```
Découverte : `npx shadcn@latest list @aceternity`, `search @aceternity -q "card"`, `view @aceternity`.

**2. Installation directe par URL** (sans configurer le registre) :
```bash
npx shadcn@latest add https://ui.aceternity.com/registry/nom-du-composant.json
```

Après installation, le composant arrive comme code source local (pas une dépendance npm opaque) — il est donc normal et attendu de l'adapter ensuite (couleurs, texte, tailles) au design du projet plutôt que de l'utiliser tel quel.

## Catalogue par intention (pour choisir le bon composant)

**Cartes / contenu**
- 3D Card Effect — carte avec effet de perspective au survol
- Card Hover Effect — survol qui révèle un fond/contenu
- Card Spotlight — spot radial qui suit le curseur
- Glare Card, Bento Grid (grille asymétrique de features)

**Sections héro**
- Hero Parallax, Hero avec scroll infini, variantes multi-couleurs / onglets

**Backgrounds / ambiance**
- Aurora Background, Background Beams, Wavy Background, Background Gradient Animation, Lamp Effect, Sparkles, Shader effects

**Texte animé**
- Text Generate Effect (fade progressif), Typewriter Effect, Flip Words, Text Hover Effect, Text Reveal Card

**Navigation / layout**
- Floating Dock (style barre macOS), Navbar Menu, Sidebar (extensible au survol), Sticky Banner

**Spécialisés**
- MacBook Scroll, Parallax Scroll, 3D Pin, 3D Globe interactif, Moving Border, Infinite Moving Cards, Timeline, Carousel

**Blocs prêts à l'emploi (compatibles shadcn)** — features, témoignages, équipe, pricing, CTA, formulaires de connexion, contact, blog, FAQ, empty states.

Note : le catalogue gratuit couvre 200+ composants ; certains blocs/templates complets et shaders avancés sont réservés à l'offre payante — vérifier sur place si un composant demandé est premium avant de promettre son installation gratuite.

## Discipline d'usage (à croiser avec la skill impeccable-design)

Plusieurs effets Aceternity (glow radial, halos de dégradé saturé, arrière-plans violet/cyan, points pulsants, curseurs de frappe décoratifs) recoupent exactement des anti-patterns "AI slop" listés dans la skill **impeccable-design**. Règles à appliquer :
- Choisir le composant en fonction du **mode** de la page (Persuade/Operate/Read/Experience) — les effets spectaculaires (Aurora, Beams, 3D Globe, Moving Border) conviennent à une page "Persuade" (landing), rarement à un dashboard "Operate".
- Un seul effet de fond héro fort par page, pas plusieurs cumulés.
- Adapter systématiquement les couleurs/tailwind tokens du composant à la palette du projet plutôt que garder les valeurs par défaut de la démo.
- Après intégration, repasser la checklist anti-patterns d'impeccable-design (notamment : glow décoratif, halo radial saturé, palette violet/cyan "IA", point pulsant purement décoratif) avant de livrer.