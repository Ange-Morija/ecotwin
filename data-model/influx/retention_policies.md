# Rétention des observations

Le pilote ne définit et n'applique pas de politique de rétention de production. La rétention dépend de la configuration du bucket InfluxDB.

La fenêtre d'affichage (24 heures ou 7 jours) et la recherche latest sur 30 jours ne suppriment aucune observation et ne constituent pas une politique de rétention.

Avant mise en production, décider avec le responsable des données : durée de conservation, éventuelles agrégations, sauvegarde/restauration, accès et suppression. Documenter et vérifier le paramétrage du bucket avant toute modification pouvant supprimer des données existantes. Ce travail est suivi dans la préparation de production.
