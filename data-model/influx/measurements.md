# Observations environnementales

Measurement InfluxDB : `air_quality`. Bucket configurable via INFLUX_BUCKET, par défaut air_quality. Tag de capteur : `sensor`; instant stocké en UTC.

| Identifiant initial | Champ | Unité |
|---|---|---|
| CAP_TEMP | temperature | °C |
| CAP_HUM | humidity | % |
| CAP_PM25 | pm25 | µg/m³ |
| CAP_PM10 | pm10 | µg/m³ |
| CAP_SO2 | so2 | ppb |
| CAP_CO | co | ppm |
| CAP_O3 | o3 | ppb |
| CAP_NO2 | no2 | ppb |

POST /api/telemetry/ingest reçoit un objet items avec au plus 1000 observations. Chaque observation requiert un identifiant non vide et au moins une valeur numérique finie. time est facultatif : le serveur utilise alors son instant UTC; une date sans fuseau est interprétée comme UTC. La clé machine est transmise par X-API-Key, jamais dans l'URL.

La lecture latest cherche les dernières valeurs sur 30 jours. Le dashboard couvre 24 heures ou 7 jours, avec la dernière valeur reçue par fenêtre horaire et métrique; les heures manquantes ne sont pas interpolées. Les identifiants du catalogue initial correspondent à ceux du script de replay. Leur correspondance à un objet BIM n'est pas encore définie.

Les seuils codés dans le pilote sont illustratifs et ne constituent ni un diagnostic sanitaire ni une politique métier validée. Les unités doivent être confirmées à l'intégration de chaque producteur réel.
