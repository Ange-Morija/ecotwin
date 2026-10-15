# Optimisation du pilote — lot de maintenance

## Objectif et limites
Réduire le code mort, les requêtes et les octets livrés sans supprimer les outils BIM, les comptes, les observations, la maintenance ou les actions. Conserver Spec Kit, ses templates et le fichier IFC source utile à de futurs imports.

## Exigences
- OPT-001 : retirer uniquement les fichiers vides ou sans référence et les panneaux qui n'ont aucune implémentation.
- OPT-002 : les recherches locales ne doivent pas relancer les mêmes lectures réseau; mutualiser les requêtes en cours, expirer le cache à 30 secondes et l'invalider après mutation.
- OPT-003 : actualiser les données sans recréer la scène BIM, les contrôles statiques ou fermer la table de valeurs ouverte.
- OPT-004 : ne pas copier l'IFC non utilisé dans les images; précompresser le SDK avec la bibliothèque standard et le servir via Nginx selon Accept-Encoding.
- OPT-005 : vérifier les parcours existants, les requêtes dédupliquées, les sauvegardes après invalidation et la conservation de la scène.

## Plan
1. Retirer deux JavaScript non importés et cinq fichiers vides; supprimer les panneaux de prédiction/Grafana non raccordés et leurs styles.
2. Ajouter un petit cache de requêtes partagé pour le viewer historique; ne charger que l'onglet actif.
3. Mettre à jour les panneaux du dashboard sans reconstruire les éléments statiques.
4. Réduire le contexte Docker et préparer le SDK gzip; conserver les assets source dans Git.
5. Tests natifs Node du cache, tests navigateur des parcours, contrôles Python et vérification des images.

Les mesures et limitations figurent ci-dessous. Aucun gain de latence n’est annoncé sans mesure.

## Mesures exécutées
| Élément | Avant | Après | Vérification |
|---|---:|---:|---|
| SDK transféré avec gzip | 5 104 210 octets | 881 478 octets | Réponse Nginx, décompression identique au fichier source; environ 83 % de moins |
| Image API locale, taille non compressée | 243 320 494 octets | 198 894 775 octets | docker image inspect, environ 44,4 Mo de moins |
| Image web locale, taille non compressée | 115 319 045 octets | 70 893 505 octets | docker image inspect, environ 44,4 Mo de moins |
| Recherche et effacement du filtre capteurs | Relectures à chaque saisie | Aucune lecture supplémentaire dans le cache valide | Test navigateur : 8 lectures latest et 8 maintenances, compteurs inchangés après filtrage |
| Sauvegarde de maintenance | Cache local pouvant rester obsolète | Cache invalidé, données relues | Test navigateur : notes mises à jour et deuxième lot de lectures après sauvegarde |
| Scène BIM et table ouverte | Reconstructions possibles avant chargement de la scène | Nœud canvas et ouverture conservés lors du refresh | Tests navigateur d'identité du canvas et attribut open |

Les tailles d’images comparent les images locales du pilote précédent et ce lot; elles ne sont pas les tailles compressées d’un registre. Aucun temps de réponse ni gain de FPS n’a été mesuré.

## Éléments retirés
- web/js/api.js et web/js/grafana-panels.js : aucun import ni utilisation.
- api/src/routers/health.py, api/src/core/logging.py, api/src/utils/time.py, scripts/export_dashboards.sh et data-model/mapping/ifc_mapping.json : fichiers vides.
- Trois onglets sans implémentation du viewer historique : mesures vides, iframes Grafana figées et prévisions/MLOps. Les fonctions disponibles restent accessibles via capteurs, maintenance, actions et dashboard.
- Contrôles et branches de prédiction IA sans moteur; tentative d’écriture sur une route alternative inexistante.
- Choix arbitraire d’un autre champ numérique lorsqu’une métrique est absente : une valeur manquante reste désormais absente.

Le modèle IFC source, le XKT, les configurations Grafana facultatives et Spec Kit sont conservés. Les tests du cache sont natifs Node, sans nouvelle dépendance.
