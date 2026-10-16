# Contrat UX EcoTwin
Identité: [DESIGN.md](DESIGN.md). Locale fr-FR; dates Europe/Paris. Route / publique; /login et /register pour le pilote; /dashboard?mode=demo publique et clairement étiquetée; /dashboard privé sinon.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | web/src/pages/Auth.tsx | UX-CONTRACT.md | login/register | tests/e2e/platform.spec.js |
| Select/Listbox | HTML select natif dans les composants React | UX-CONTRACT.md | période et métrique; popup OS accepté | tests/e2e/platform.spec.js |
| Date | Intl.DateTimeFormat | UX-CONTRACT.md | affichage fr-FR Europe/Paris | tests/e2e/platform.spec.js |
| Scrollbar | platform.css global | DESIGN.md | tous les débordements | tests/e2e/platform.spec.js |
| Toast | components/ui.tsx ErrorBanner + useDashboard | UX-CONTRACT.md | statut non modal, erreurs inline | tests/e2e/platform.spec.js |
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

- React Router possède les routes canoniques. Les liens conservent la navigation clavier; les changements de surface déplacent le focus vers le contenu, les changements de métrique conservent le focus du contrôle.
- L’URL restaure aussi `state`, `sort` et `dir` du catalogue. Recherche et filtres d’état se combinent, sans appel réseau; la composition IME est validée avant mise à jour de l’URL.
- La sélection d’observation est accessible par curseur natif (Home/End/flèches), avec date, valeur et unité en texte; elle reste en place pendant le rafraîchissement. Les acquisitions espacées de plus de 90 minutes ne sont pas reliées dans la série horaire.
- BimPanel conserve le canvas pendant la navigation entre vues; bim-engine détruit la scène et ses événements à la sortie du dashboard. Une erreur de modèle permet de réessayer et laisse le téléchargement disponible.
- Aucun composant ne modifie directement le DOM possédé par React. Les outils historiques restent isolés sous `/public/index.html`.

- La sélection rapide d’une métrique met à jour le graphique, le select et l’URL sans nouvelle lecture réseau; `aria-pressed` expose la sélection. La dernière acquisition du résumé provient du maximum des dates reçues, distinct de l’heure de consultation.
- Les filtres métrique/période ont des labels visibles. L’aperçu BIM indique son caractère schématique jusqu’au chargement du modèle réel; les boutons de navigation 3D restent désactivés avant ce chargement.

- Recherche : le bouton « Rechercher » et `/` ouvrent le catalogue et focalisent la recherche. Le raccourci est inactif dans les champs et zones éditables; il n’intercepte pas les combinaisons Ctrl/Meta/Alt.
- Le contrôle « Actualisation automatique » suspend les lectures périodiques et la reprise automatique au retour réseau/onglet. La lecture en cours peut finir; l’actualisation manuelle et un changement de période restent possibles. Ce choix est éphémère, ne modifie ni données ni session, et reste en place entre vues du dashboard.
- La période est accessible dans le catalogue, le BIM et les insights; elle partage le paramètre URL `period` du graphique. Réinitialiser les filtres remet métrique/période/recherche/état/tri à leurs valeurs initiales en conservant la vue et le mode réel/démo.
