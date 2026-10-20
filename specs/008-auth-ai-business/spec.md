# Comptes, assistant IA et Business

Date : 2026-10-16. Périmètre : pilote mono-site partagé, aucune isolation multi-client implicite.

## Besoin
Compléter l’authentification et proposer un chatbot, un abonnement Stripe, la palette fournie par l’utilisateur et des interfaces dynamiques avec chronologie et courbes animées.

## Parcours et acceptation
- A001 : connexion/inscription réelles conservées; une inscription commencée depuis Business ou Compte revient sur cette route, parmi une liste fermée. Aucun redirect externe provenant d’un paramètre utilisateur.
- A002 : compte privé; changement exige le mot de passe actuel et un nouveau mot de passe de 12–128 caractères. Après succès, toutes les sessions sont révoquées. Cinq erreurs en dix minutes bloquent temporairement la modification.
- A003 : assistant uniquement après authentification, CSRF valide et configuration serveur. L’utilisateur autorise explicitement l’envoi des huit dernières observations. Sans accord, aucune lecture de source n’est effectuée. Démo/réel/absence de contexte restent distincts.
- A004 : question ≤ 2000 caractères, historique ≤ 6 messages de 2000 caractères, réponse ≤ 800 tokens demandés; 10 tentatives/heure/compte, 100 globalement. Panne du fournisseur ou de la source : erreur explicite, aucun résultat fabriqué.
- A005 : prix récurrent Business lu depuis Stripe; aucun montant commercial inventé. Checkout hébergé et portail de facturation, client Stripe lié au compte côté serveur, abonnement existant protégé contre une seconde souscription.
- A006 : protection CSRF sauf webhook signé sur corps brut, tolérance de signature du SDK; livraison répétée dédupliquée. État d’abonnement relu directement chez Stripe, jamais décidé par le retour du navigateur ou l’ordre des événements.
- A007 : mode test par défaut. Paiements réels nécessitent mode live explicite, autorisation live, prix et clé du même mode, URL HTTPS canonique et configuration du webhook.
- A008 : palette #AB6C63/#8AC1BD/#3D332E/#A35C8A; variantes de texte accessibles. Chronologie issue des observations réellement affichées, synchronisée à la métrique (depuis le 2026-10-19, la liste de quatre observations est remplacée par la barre temporelle de l’atelier, voir 009). Animation du tracé et du dialogue respectant prefers-reduced-motion.
- A009 : mobile, clavier, focus du dialogue restauré, texte externe rendu sans HTML, erreurs et états indisponibles testés.

## Décisions et limites
OpenAI via Chat Completions est le premier adaptateur; le modèle reste à sélectionner explicitement dans la configuration. Le tarif, la devise et la périodicité commerciaux restent à définir dans Stripe. Aucun modèle, tarif, essai gratuit, promesse contractuelle ou droit Business n’est inventé. L’abonnement ne modifie pas les permissions du pilote.

Pas de récupération par e-mail sans service de messagerie, pas de SSO, pas d’exécution d’actions par IA, pas de diagnostic garanti, pas de mapping BIM-capteur implicite. Une commercialisation multi-client reste conditionnée à RBAC/isolation, conditions commerciales, politique de données et exploitation production.
