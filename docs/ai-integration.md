# Assistant IA

Les insights du dashboard restent des règles de dépassement de seuil. Le chatbot est une fonction séparée : OpenAI Chat Completions, modèle choisi par `OPENAI_MODEL`, clé serveur `ECOTWIN_OPENAI_API_KEY` (`OPENAI_API_KEY` accepté en hébergement classique). Les deux sont nécessaires; sans configuration, l’interface signale que l’assistant n’est pas activé.

## Accès et données

Une session et l’en-tête CSRF sont obligatoires. L’utilisateur pose une question et autorise séparément l’envoi des observations. Sans accord : aucune requête Influx et aucun envoi de mesures. Avec accord : le serveur relit les huit dernières valeurs du site pilote partagé, avec identifiant, nom, unité, date, état et source démo/réelle. Pas de géométrie BIM, d’e-mail ou de secret ajouté au contexte. Panne réelle : erreur, aucun remplacement par la démo.

Le dialogue rappelle que les questions sont envoyées à OpenAI. Les trois derniers échanges sont transmis pour garder le contexte; ceux contenant des observations sont exclus si le partage est décoché. Les textes de questions peuvent eux-mêmes contenir des données : ne pas saisir de données confidentielles sans autorisation. Les observations transmises sont consultables sous chaque réponse, sans prétendre que toutes les phrases produites sont des citations vérifiées.

Conversations en mémoire React, sans stockage local, ni conservation serveur du contenu. Quitter le dashboard/recharger efface cet historique. Le fournisseur applique sa politique de conservation : valider les conditions OpenAI, le traitement des données du bâtiment et les utilisateurs autorisés avant activation réelle. Le consentement de l’interface ne remplace pas la politique de l’organisation.

## Coûts et fiabilité

2000 caractères/question, six messages d’historique de 2000 caractères maximum, huit observations, 800 tokens de sortie demandés. Quotas SQLite : dix tentatives/heure/compte et cent/heure pour l’instance, y compris échecs après réservation. Ce sont des limites de volume, pas un plafond financier garanti; configurer également un budget fournisseur. Modèle explicite, timeout réseau 25 s, aucun retry automatique. L’annulation dans le navigateur arrête l’attente; elle ne garantit pas l’arrêt ni la non-facturation de l’appel déjà commencé.

Réponse rendue en texte, sans HTML/Markdown exécutable. Aucun outil d’action ou commande d’équipement, aucune écriture métier déclenchée par le modèle. Les recommandations nécessitent une vérification humaine; pas de diagnostic certain ni mapping objet-capteur inventé. Une erreur fournisseur reste une erreur explicite, jamais une réponse synthétique locale présentée comme une inférence.

Tests locaux avec fournisseur simulé; aucun appel OpenAI réel validé dans cette livraison faute de clé et modèle configurés. Le lot T032 reste partiellement ouvert pour preuves vérifiées, audit métier, revue humaine structurée et analyses liées à un mapping BIM.
