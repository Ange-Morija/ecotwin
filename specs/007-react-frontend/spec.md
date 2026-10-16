# Migration du frontend React

Demande : remplacer le frontend par une stack adaptée aux interfaces dynamiques et faciles à utiliser, en conservant les capacités du jumeau numérique.

## Scénarios et critères d’acceptation

- Découverte → démo → connexion : les pages sont des composants React; les liens internes conservent leur sémantique et ne rechargent pas le document.
- Surveillance : sélection de métrique et période, sélection d’observation au clavier ou au pointeur, table alternative, source/unité/date et export CSV fonctionnent. Les trous temporels ne sont pas interpolés.
- Catalogue : recherche, filtre d’état et tri accessibles; état partageable dans l’URL, restauré par retour arrière et rechargement; export des lignes affichées uniquement.
- BIM : un seul canvas conservé entre les vues du dashboard et les actualisations, SDK local chargé à la demande, nettoyage de la scène à la sortie, erreur textuelle et possibilité de réessayer. Aucun mapping capteur inventé.
- Authentification : validation par champ, premier champ invalide focalisé, cookies serveur et protections CSRF conservés; inscription désactivable; déconnexion réelle.
- Résilience : initialisation, chargement, état vide, erreur réseau et données périmées explicites; annulation des réponses dépassées, absence de repli silencieux vers la démo.
- Livraison : même build statique servi par FastAPI ou Nginx, Docker reproductible depuis le lockfile, SDK et XKT locaux, IFC source hors distribution, tests navigateur et typage strict.

Le scope n’ajoute ni SSO, ni multi-sites, ni IA, ni import IFC. Les outils historiques de mesure/maintenance/actions restent accessibles et testés; leur moteur n’est pas réécrit sans nécessité fonctionnelle.
