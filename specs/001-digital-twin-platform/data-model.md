# Modèle de données du pilote
- User(id, name, email unique normalisé, password_hash salé, created_at).
- Session(token_hash, user_id FK, expires). Seul le jeton opaque est dans un cookie HttpOnly; seul son hash est stocké.
- Site: un site partagé dans ce pilote. Aucune promesse d'isolation multi-tenant.
- Sensor(id, label, field, unit, threshold). Catalogue initial de huit métriques; les seuils de démo sont illustratifs.
- Observation(sensor, field, value nullable, time UTC). Série réelle dans InfluxDB, jamais dans le cache de maintenance.
- BIMModel: modèle XKT existant. BIMObject.id retourné par picking. Le fichier de mapping existant est vide: correspondance non configurée.
- Maintenance(sensor PK, payload JSON, updated_by FK). État partagé du site pilote.
- Action(id, user_id FK, payload JSON). L'auteur possède ses actions; lecture et mutation filtrées par user_id.
- Insight(metric, observed_value, threshold, explanation, source=rule). Pas de confidence IA inventée.
