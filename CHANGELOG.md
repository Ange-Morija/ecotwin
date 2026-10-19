# Journal des changements

## 2026-10-19 — Dashboard : conformité aux seuils
- Quatrième indicateur « Conformité aux seuils » : part des mesures disponibles sous leur seuil illustratif, avec une barre segmentée (une cellule par métrique) et un résumé textuel.
- Références Godly consultées et principes retenus (DESIGN.md) : libellés monospace, pastilles d’état, compteur de conformité, apparition échelonnée et surbrillance des valeurs modifiées, sans mouvement permanent.
- Thèmes clair et sombre du dashboard (suivi du système, bouton, mémorisation).
- Vue d’ensemble refondue en atelier 3D plein écran : barre supérieure à la place du rail latéral, panneaux flottants (niveaux lus dans le modèle, cartes thermiques inactives, capteurs groupés par famille, points à examiner, historique), barre temporelle de lecture. Suppression de la chronologie de quatre observations et du CSS du rail.
- Jauge fine par métrique : valeur rapportée au seuil illustratif, avec alternative textuelle; aucune donnée absente n’est tracée.

## 2026-10-19 — Rejeu des suites
- Suites API (25 réussis) et Playwright (26/26) exécutées; 8 échecs dus à la refonte corrigés (h1 unique, nom d’utilisateur, onglets, contraste pendant l’animation, navigation à 320 px); captures de la documentation régénérées.

## 2026-10-19 — Nettoyage
- Suppression du CSS et de composants devenus inutiles; `data.csv` déplacé de `web/assets/` vers `data-model/samples/` (il n’est plus servi publiquement).

## 2026-10-16 — Comptes, assistant et Business
- Espace compte, changement du mot de passe et révocation de toutes les sessions.
- Chatbot OpenAI configurable avec consentement, contexte borné et quotas persistés; pas d’activation sans clé/modèle.
- Offre Business lue depuis Stripe, Checkout/Portal, webhooks signés et dédupliqués, reprise des tentatives concurrentes ou interrompues.
- Palette utilisateur, courbes animées avec mouvement réduit, chronologie des observations et liens compte/facturation sur mobile.
- Spécification 008, documentation d’activation, captures et tests; fournisseurs externes encore à valider avec les identifiants du propriétaire.

## Non publié — pilote 0.2.0

### Produit
- Pages présentation, connexion, inscription locale et dashboard responsive en français.
- Viewer BIM XKT avec SDK figé servi localement, sélection d'objet et navigation.
- Catalogue de huit métriques, historique horaire, filtres partageables, table alternative et export CSV.
- Insights par règles de seuil avec provenance et statut IA non connectée.
- Constitution, spécification, architecture, contrats et tâches via GitHub Spec Kit.

### Corrections
- Import circulaire qui bloquait FastAPI et incohérences de routes/frontend.
- Requêtes Flux paramétrées et listes de champs valides.
- Écritures Influx synchrones avant accusé de réception.
- Validation des mesures vides/non finies et limitation de taille des lots.
- Sessions révocables, hash des mots de passe, CSRF et contrôle d'accès.
- Persistance des actions/maintenances; suppression des faux succès locaux.
- Rendus de données externes sans injection HTML; dialogues et focus améliorés.
- Replay CSV : endpoint, valeurs invalides et arrêt en fin de fichier.
- Docker : assets/modèle inclus, proxy Nginx et droits pour utilisateurs non privilégiés.

### Qualité et documentation
- Tests API dont intégration InfluxDB réelle et parcours Playwright.
- Vérifications axe sur les principales pages à 390 et 1440 pixels.
- CI GitHub Actions ajoutée, avec InfluxDB jetable.
- README, architecture, déploiement, sécurité, modèle de données et captures actualisés.
- .env et fichiers internes InfluxDB retirés du suivi, copies locales préservées.

### Encore planifié
Mapping BIM-capteurs, multi-sites/IAM/SSO, import IFC, connecteurs IoT, moteurs IA, notifications et préparation de production. Aucun déploiement de production ou tag de release n'est créé par ce journal.

### Optimisation du pilote
- Retrait de sept fichiers vides ou sans référence, des iframes Grafana figées et des panneaux IA non implémentés.
- Cache mémoire partagé : requêtes simultanées mutualisées, expiration et invalidation après mutation.
- Filtres locaux sans relecture des huit capteurs; chargement des seuls onglets actifs.
- Actualisation des panneaux sans reconstruire la scène BIM ni fermer la table de valeurs.
- SDK précompressé pour Nginx; exclusion de l’IFC source et des sorties vendor préexistantes du contexte Docker. Le fichier IFC reste conservé dans Git.
- Tests natifs Node du cache et régressions navigateur ajoutés à la CI.

## Affinement UI — 16 octobre 2026
- Présentation allégée : colonnes ouvertes, retrait des icônes répétitives et titres décoratifs.
- Interface lisible sur mobile : texte minimum 12 px hors annotations graphiques, commandes opérationnelles de 44 px et en-tête adaptable.
- Catalogue triable par métrique, état et acquisition avec indication accessible; export limité à la recherche et respectant le tri.
- Huit méthodes de conception intégrées à la documentation et au suivi Spec Kit.

## Migration React — 16 octobre 2026
- Présentation, connexion, inscription et dashboard réécrits en React 19 et TypeScript strict, avec React Router et Vite.
- Navigation sans rechargement; filtre d’état et tri partageables dans l’URL, recherche compatible IME et exports des lignes visibles.
- Sélection d’observation au clavier/tactile et au pointeur; axe temporel réel, interruption des lignes aux acquisitions manquantes et état vide explicite.
- Scène BIM conservée entre vues et rafraîchissements, destruction à la sortie, rechargement possible après échec du SDK, ajustement sans animation lorsque demandé.
- Chunks JS/CSS minifiés par route, distribution `web/dist` commune à FastAPI et Nginx, Docker et développement Vite adaptés.
- Anciens moteurs platform.js/bim-viewer.js supprimés; outils avancés BIM/maintenance/actions conservés et testés.
- Spécification, plan et tâches du lot 007, contrats UX, documentation et tests actualisés.

## Interface du dashboard — affinement
- Navigation bleu encre et hiérarchie plus nette; trois indicateurs fondés sur les données remplacent les quatre cartes génériques.
- Accès direct aux huit métriques avec valeurs/unités et sélection synchronisée au graphique et à l’URL.
- Espace BIM agrandi, aperçu schématique explicitement identifié, filtres du graphique libellés et points à examiner mis en évidence.
- Styles du dashboard isolés dans une feuille chargée avec la route; adaptation aux écrans intermédiaires et mobiles.

## Méthodes de l’archive utilisateur
- Références des huit skills conservées avec empreintes, sans exécution des installateurs fournis.
- Recherche accessible au clavier (`/`), focus sur le catalogue et raccourci ignoré pendant la saisie.
- Pause/reprise de l’actualisation automatique, commande manuelle conservée et période accessible depuis les vues de détail.
- Réinitialisation des filtres, saisie mobile à 16 px et textes d’accueil/connexion simplifiés.

## Nouvelle composition du dashboard
- Rail blanc, sélection vert sauge et typographie Manrope variable auto-hébergée avec licence SIL OFL.
- BIM dans le panneau principal, métriques en liste latérale; historique et points à examiner regroupés sur la rangée suivante.
- Liste de mesures en deux colonnes sur mobile, filtres et commandes conservés, sans nouvelle bibliothèque d’animation.
- Création originale : le connecteur Figma n’était pas disponible, aucun modèle Figma n’est présenté comme consulté ou importé.
