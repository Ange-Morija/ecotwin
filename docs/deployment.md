# Déploiement et configuration

## Serveur de développement
Suivre les commandes de la [racine](../README.md). FastAPI sert pages, ressources et API sur une origine unique. Les comptes sont créés explicitement; l'état local se trouve dans `.runtime/`. Les tests navigateur utilisent un serveur et un stockage distincts.

## Configuration
| Variable | Usage | Valeur par défaut du développement |
|---|---|---|
| ECOTWIN_DATA_DIR | Dossier SQLite | .runtime à la racine |
| ALLOW_REGISTRATION | Autoriser la création de comptes locaux | true en Python, false dans Docker/Compose |
| COOKIE_SECURE | Cookie limité à HTTPS | false pour le local HTTP; true requis en HTTPS |
| CORS_ORIGINS | Origines navigateur autorisées si frontend séparé | localhost:8080 et 127.0.0.1:8080 en HTTP |
| API_KEY | Authentification des producteurs machine | Aucune; à fournir pour l'ingestion machine |
| INFLUX_URL | Source InfluxDB du serveur Python | http://localhost:8086 |
| INFLUX_TOKEN | Jeton lu directement par le serveur Python | Aucun |
| INFLUX_ORG / INFLUX_BUCKET | Organisation et bucket | EcoTwin / air_quality |

Ne pas confondre `INFLUX_TOKEN` du processus Python et `INFLUX_INIT_ADMIN_TOKEN` de Compose : Compose transmet cette dernière au service API sous le nom INFLUX_TOKEN. Ne jamais committer leurs valeurs.

## Compose
Depuis la racine, créer un fichier local à partir de `infra/.env.example` **seulement si aucun fichier local n'existe**. Les anciens fichiers ont été conservés; revoir leur configuration et renouveler les identifiants historiques avant usage réel.

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

Le mode par défaut lance API et Nginx, avec inscription désactivée. Les ports hôte sont liés au loopback. La démo fonctionne sans InfluxDB; le mode réel affiche explicitement l'absence de source.

Pour une source locale neuve, renseigner avant initialisation un mot de passe et un jeton uniques dans le fichier local, puis activer InfluxDB:
```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml --profile telemetry up -d --build
```
Pour Grafana, renseigner aussi son mot de passe administrateur puis ajouter `--profile monitoring`. Grafana est facultatif et n'a pas été validé dans cette livraison. Les iframes figées de l’ancien viewer ont été supprimées; Grafana est une console facultative autonome.

Les données vivent dans des volumes nommés : app-data, influx-data, influx-config, grafana-data. Ne pas exécuter `down -v` sur un environnement contenant des données à préserver. La modification des variables d'initialisation ne renouvelle pas automatiquement les identifiants d'une base Influx déjà initialisée.

## Proxy TLS du cloud
Pour les builds derrière le proxy géré, monter le bundle CA approprié comme secret BuildKit:
```bash
docker build --secret id=proxy_ca,src=/etc/ssl/certs/ca-certificates.crt -f api/Dockerfile -t ecotwin-api .
docker build --secret id=proxy_ca,src=/etc/ssl/certs/ca-certificates.crt -f web/Dockerfile -t ecotwin-web .
```
Le SDK dispose d’une version gzip préparée au build; Nginx la sert selon Accept-Encoding, sans recompresser le SDK à chaque requête. Le fichier IFC source n’est pas inclus dans les images; le modèle XKT est conservé.

Les Dockerfiles conservent les vérifications TLS et ne copient pas le certificat dans l'image. Les builds Compose derrière ce proxy doivent recevoir le même secret via une configuration locale adaptée; le paramètre d'un build direct ne se transmet pas implicitement à Compose.

## Diagnostic
- **API ne démarre pas** : contrôler les logs et les droits du dossier SQLite; l'image attend l'UID 10001.
- **SDK/modèle manquant** : lancer npm ci puis npm run build; vérifier les fichiers sous /vendor et /assets.
- **Mode live indisponible** : vérifier accès InfluxDB, token, organisation et bucket côté serveur. Ne pas remplacer les résultats par la démo.
- **403 sur un formulaire** : vérifier l'origine autorisée, le host transmis par le reverse proxy et les headers de la requête.
- **Cookie non conservé** : contrôler HTTPS et COOKIE_SECURE, puis la durée de session.
- **Tests** : ECOTWIN_TEST_INFLUX_URL doit viser une base jetable fraîche; jamais le bucket de production.

## Limites avant production
Le pilote n'est pas un service multi-client. SSO/RBAC, récupération de compte, politique de rétention, sauvegardes et accès aux données réelles doivent être définis avant production. Consulter [security.md](security.md) et la liste de tâches.

## Build React

Node.js 22.12+ et les dépendances de développement sont nécessaires dans l’étape de construction (`npm ci`, puis `npm run build`). Le runtime ne contient ni node_modules ni serveur Vite : Nginx reçoit `web/dist` et l’image API le place dans `/app/web/dist`. Ne pas copier le `web/index.html` source dans le répertoire servi; il contient l’entrée TypeScript de développement. Les bundles minifiés par route sont sous `/app-assets/`. Recréer le build avant de redémarrer un serveur FastAPI après une modification du frontend.
