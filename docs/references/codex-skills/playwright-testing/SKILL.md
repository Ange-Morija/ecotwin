---
name: playwright-testing
description: "À utiliser pour écrire, exécuter ou déboguer des tests end-to-end ou des scripts d'automatisation de navigateur avec Playwright (Node.js/TypeScript ou Python) — se déclenche dès qu'il s'agit de tester un site/webapp (Geodemy, ATS Config Studio, Point Cloud Toolkit, plateforme environnementale, portfolio, SaaS...), de générer un test par enregistrement, ou de diagnostiquer un test instable/qui échoue."
---

# Playwright Testing

Playwright (playwright.dev, Microsoft) pilote Chromium, Firefox et WebKit avec une seule API, pour des tests end-to-end fiables ou de l'automatisation de navigateur. Dans cet environnement de travail, le CLI Playwright est **déjà installé globalement** (v1.56.0) avec Chromium pré-téléchargé — ne pas relancer `playwright install`, il récupérerait inutilement les navigateurs. Vérifier avec `playwright --version` avant toute réinstallation.

## Installer Playwright dans un projet

**Node.js / TypeScript (recommandé pour du test end-to-end)** :
```bash
npm init playwright@latest
```
Crée automatiquement `playwright.config.ts`, un dossier `tests/`, et propose d'installer les navigateurs (à accepter seulement si le projet n'est pas dans cet environnement pré-équipé).

**Python** :
```bash
pip install playwright
playwright install
```

**CLI seul (sans framework de test)**, utile pour du scripting/automatisation ponctuelle :
```bash
npm i -g @playwright/cli@latest
```

## Écrire un test — les bons réflexes

- **Privilégier les locators orientés utilisateur** plutôt que des sélecteurs CSS fragiles qui cassent au moindre changement de style :
  - `getByRole()` — par rôle ARIA (le plus robuste, calqué sur ce qu'un utilisateur/lecteur d'écran perçoit)
  - `getByLabel()`, `getByPlaceholder()` — pour les champs de formulaire
  - `getByTestId()` — quand aucun attribut sémantique n'est disponible, en dernier recours
- **Ne jamais ajouter de `sleep`/timeout artificiel** : Playwright attend automatiquement qu'un élément soit actionnable avant d'agir, et les assertions (`expect(...)`) reprennent automatiquement jusqu'à ce que la condition soit remplie. Un timeout manuel cache un vrai problème de synchronisation plutôt que de le résoudre.
- **Isolation** : chaque test démarre avec un contexte de navigateur neuf (équivalent d'un profil vierge) — ne pas faire dépendre un test de l'état laissé par un autre.

## Générer un test par enregistrement (Codegen)

Utile pour démarrer rapidement sur un flux (ex : formulaire de contact du portfolio, tunnel d'inscription d'un SaaS) :
```bash
npx playwright codegen https://exemple.com
```
Playwright ouvre un navigateur, enregistre les interactions et génère le code correspondant — à utiliser comme point de départ à nettoyer (remplacer les sélecteurs fragiles générés automatiquement par des locators sémantiques quand possible), pas comme code final.

## Lancer et déboguer les tests

```bash
npx playwright test                 # lancer toute la suite
npx playwright test nom-fichier.spec.ts   # un seul fichier
npx playwright test --debug         # pas à pas, navigateur visible
npx playwright test --ui            # mode UI interactif
npx playwright show-report          # rapport HTML après exécution
```

**Trace Viewer** — le réflexe pour un test qui échoue de manière non évidente : il donne la timeline complète de l'exécution (snapshots DOM, requêtes réseau, logs console, captures d'écran à chaque étape) sans avoir à relancer le test en observant en direct.
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Choix du langage

Playwright fonctionne en TypeScript/Node.js, Python, .NET et Java. Sauf contrainte du projet, préférer **TypeScript/Node.js** : c'est l'écosystème le plus documenté et le plus utilisé pour Playwright, avec le tooling (UI mode, codegen, VS Code extension) le plus abouti.

## Dans cet environnement de travail

Le navigateur Chromium préinstallé est pointé via `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. Pour un script ponctuel (pas un vrai projet de tests), lancer directement avec l'exécutable préinstallé plutôt que de retenter un téléchargement :
```js
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' });
```
(chemin exact à vérifier avec `ls /opt/pw-browsers` si un projet pingle une autre version de `@playwright/test`).