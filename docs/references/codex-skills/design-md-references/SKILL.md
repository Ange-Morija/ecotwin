---
name: design-md-references
description: "À utiliser quand un projet de code (React/Next.js, HTML/Tailwind, etc.) a besoin d'un langage visuel de référence cohérent — pour s'inspirer d'une marque connue (Stripe, Linear, Apple, Notion, Vercel...) ou fournir un DESIGN.md prêt à l'emploi qu'un agent de code lira automatiquement. Se déclenche quand Morija demande \"que ça ressemble à [marque]\" ou veut un design system de départ pour un projet."
---

# DESIGN.md References

S'appuie sur le dépôt open-source **awesome-design-md** (github.com/VoltAgent/awesome-design-md, MIT), une collection de 73 fichiers `DESIGN.md` extraits par analyse de vrais sites de marques connues.

## Qu'est-ce qu'un DESIGN.md

Concept introduit par Google Stitch : un fichier markdown texte brut (tokens de couleur, typographie, espacements, règles de composants) qu'un agent de code lit pour générer une UI visuellement cohérente avec un langage de marque donné. Pas d'export Figma, pas de JSON à configurer — juste un fichier à déposer à la racine du projet, comme un `AGENTS.md` mais pour l'apparence plutôt que le comportement.

## Récupérer un DESIGN.md

Chaque marque a son fichier à `design-md/<slug>/DESIGN.md`. Récupérer le contenu brut via :
```
https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<slug>/DESIGN.md
```
Puis le déposer à la racine du projet (ou dans le dossier où l'agent de code du projet va le chercher) sous le nom `DESIGN.md`.

## Index par catégorie (slugs entre parenthèses)

**IA & LLM** — Claude (`claude`), Cohere (`cohere`), ElevenLabs (`elevenlabs`), Minimax (`minimax`), Mistral AI (`mistral.ai`), Ollama (`ollama`), OpenCode AI (`opencode.ai`), Replicate (`replicate`), Runway (`runwayml`), Together AI (`together.ai`), VoltAgent (`voltagent`), xAI (`x.ai`)

**Outils dev & IDE** — Cursor (`cursor`), Expo (`expo`), Lovable (`lovable`), Raycast (`raycast`), Superhuman (`superhuman`), Vercel (`vercel`, noir/blanc, police Geist), Warp (`warp`)

**Backend, base de données & DevOps** — ClickHouse (`clickhouse`), Composio (`composio`), HashiCorp (`hashicorp`), MongoDB (`mongodb`), PostHog (`posthog`), Sanity (`sanity`), Sentry (`sentry`), Supabase (`supabase`)

**Productivité & SaaS** — Cal.com (`cal`), Intercom (`intercom`), Linear (`linear.app`, ultra-minimal, accent violet), Mintlify (`mintlify`), Notion (`notion`, minimalisme chaleureux, titres serif), Resend (`resend`), Zapier (`zapier`)

**Design & créatif** — Airtable (`airtable`), Clay (`clay`), Figma (`figma`), Framer (`framer`), Miro (`miro`), Webflow (`webflow`)

**Fintech & crypto** — Binance (`binance`), Coinbase (`coinbase`), Kraken (`kraken`), Mastercard (`mastercard`), Revolut (`revolut`), Stripe (`stripe`, dégradés violets signature, poids typo 300), Wise (`wise`)

**E-commerce & retail** — Airbnb (`airbnb`), Meta (`meta`), Nike (`nike`), Shopify (`shopify`), Starbucks (`starbucks`)

**Média & tech grand public** — Apple (`apple`), HP (`hp`), IBM (`ibm`), NVIDIA (`nvidia`), Pinterest (`pinterest`), PlayStation (`playstation`), SpaceX (`spacex`), Spotify (`spotify`), The Verge (`theverge`), Uber (`uber`), Vodafone (`vodafone`), WIRED (`wired`)

**Automobile** — BMW (`bmw`), BMW M (`bmw-m`), Bugatti (`bugatti`), Ferrari (`ferrari`), Lamborghini (`lamborghini`), Renault (`renault`), Tesla (`tesla`)

**Rétro / nostalgie** — Dell 1996 (`dell-1996`), Nintendo.com 2001 (`nintendo-2001`)

Si la marque cherchée n'est pas dans cette liste, un DESIGN.md sur mesure peut être demandé via getdesign.md/request (y compris en privé).

## Comment l'utiliser correctement

1. **Choisir la référence la plus proche de l'intention**, pas forcément la marque la plus connue du secteur — le descriptif court de chaque entrée (ambiance, accent, typo) sert justement à éviter d'avoir à ouvrir chaque fichier pour choisir.
2. **Toujours adapter, jamais copier tel quel** : un DESIGN.md donne des tokens (couleurs, typo, rayons) à utiliser comme point de départ, pas la palette finale du projet de Morija. Remplacer au minimum la couleur d'accent et la police par une combinaison propre au projet avant livraison — reproduire l'identité visuelle exacte d'une marque connue (surtout un concurrent direct ou une marque très reconnaissable comme Stripe/Apple/Nike) pose un risque de confusion de marque, pas seulement un problème d'originalité.
3. **Vérifier la cohérence du résultat** avec la skill **impeccable-design** avant livraison — un DESIGN.md bien exécuté peut quand même produire un rendu "IA slop" si les règles de mise en page ne sont pas respectées à côté.

## À croiser avec les autres skills de design

- **godly-inspiration** pour trouver une direction avant de choisir quel DESIGN.md convient.
- **taste-skill-frontend** pour le cadrage du brief et la checklist anti-slop sur landing pages/portfolios.
- **aceternity-ui** pour l'exécution en React/Tailwind une fois les tokens du DESIGN.md choisis.