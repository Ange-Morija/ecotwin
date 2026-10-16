# Contrat UX EcoTwin
Identité: [DESIGN.md](DESIGN.md). Locale fr-FR; dates Europe/Paris. Route / publique; /login et /register pour le pilote; /dashboard?mode=demo publique et clairement étiquetée; /dashboard privé sinon.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | platform.js authForm | UX-CONTRACT.md | login/register | tests/e2e/platform.spec.js |
| Select/Listbox | HTML select natif | UX-CONTRACT.md | période et métrique; popup OS accepté | tests/e2e/platform.spec.js |
| Date | Intl.DateTimeFormat | UX-CONTRACT.md | affichage fr-FR Europe/Paris | tests/e2e/platform.spec.js |
| Scrollbar | platform.css global | DESIGN.md | tous les débordements | tests/e2e/platform.spec.js |
| Toast | platform.js status region | UX-CONTRACT.md | statut non modal, erreurs inline | tests/e2e/platform.spec.js |
| CRUD | API operations + session | contracts/api.md | actions de l'auteur, maintenance mono-site | api/tests/test_platform.py |

- Navigation par vrais liens; URL conserve view/metric/period/q et retour arrière.
- Validation formulaire possédée par l'application, novalidate, erreurs en texte liées aux champs, focus sur la première erreur, valeurs conservées. Mot de passe masqué avec révélation accessible. Aucun secret localStorage.
- Requête en cours: bouton désactivé avec largeur stable. Connexion réussie vers /dashboard. Déconnexion invalide la session côté serveur et retourne /login.
- Recherche locale de huit capteurs: pas de requête réseau, clear explicite, composition IME respectée; requêtes dashboard annulées si filtres changent.
- Chargement sur une région stable; absence de mesure affichée «—», série vide expliquée; panne conserve la dernière réponse réussie avec badge périmé et réessayer.
- Données démo déterministes et isolées des écritures. Les insights sont des règles explicables; IA non connectée.
- Select et date: affichage et contrôle natifs acceptés; aucun calendrier personnalisé.
- Graphique SVG avec axes/unités, résumé, table alternative et export CSV. WebGL facultatif avec erreur textuelle et modèle téléchargeable.
- Ancien viewer conservé pour outils de mesure; la nouvelle navigation et le dashboard sont canoniques.

- Rafraîchir les données conserve la scène BIM et l’ouverture de la table de valeurs. Les filtres du viewer historique exploitent un cache mémoire de 30 secondes, invalidé après mutation; aucun stockage navigateur persistant. Les onglets sans implémentation et la prédiction IA inopérante ont été retirés.

- Catalogue triable au clavier par nom, état et acquisition; `aria-sort` décrit l’ordre. Le tri reste actif pendant recherche et rafraîchissement. Export du catalogue limité aux lignes visibles, dans le même ordre; les métriques d’unités différentes ne sont pas triées par valeur.
- La procédure [design-workflow](docs/design-workflow.md) guide chaque évolution d’interface, avec vérification des états et des captures mobile/ordinateur.
