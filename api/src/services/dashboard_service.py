"""Demo observations are explicit fixtures; live observations always come from InfluxDB."""

import json
import math
from datetime import datetime, timedelta, timezone
from ..clients.influx_client import InfluxClient
from ..core.config import settings

SENSORS = [
    {
        "id": "CAP_TEMP",
        "name": "Température",
        "field": "temperature",
        "unit": "°C",
        "threshold": 26,
        "demo": 24.2,
    },
    {
        "id": "CAP_HUM",
        "name": "Humidité",
        "field": "humidity",
        "unit": "%",
        "threshold": 65,
        "demo": 48.0,
    },
    {
        "id": "CAP_PM25",
        "name": "Particules PM2.5",
        "field": "pm25",
        "unit": "µg/m³",
        "threshold": 15,
        "demo": 18.6,
    },
    {
        "id": "CAP_PM10",
        "name": "Particules PM10",
        "field": "pm10",
        "unit": "µg/m³",
        "threshold": 45,
        "demo": 27.4,
    },
    {
        "id": "CAP_SO2",
        "name": "Dioxyde de soufre",
        "field": "so2",
        "unit": "ppb",
        "threshold": 75,
        "demo": 2.1,
    },
    {
        "id": "CAP_CO",
        "name": "Monoxyde de carbone",
        "field": "co",
        "unit": "ppm",
        "threshold": 9,
        "demo": 0.7,
    },
    {
        "id": "CAP_O3",
        "name": "Ozone",
        "field": "o3",
        "unit": "ppb",
        "threshold": 70,
        "demo": 12.3,
    },
    {
        "id": "CAP_NO2",
        "name": "Dioxyde d’azote",
        "field": "no2",
        "unit": "ppb",
        "threshold": 100,
        "demo": 8.2,
    },
]


def dashboard_data(mode: str, period: str):
    now = datetime.now(timezone.utc)
    hours = 24 if period == "24h" else 168
    history = {s["id"]: [] for s in SENSORS}
    if mode == "demo":
        end = now.replace(minute=0, second=0, microsecond=0)
        for index, sensor in enumerate(SENSORS):
            for i in range(hours):
                value = round(
                    sensor["demo"]
                    * (
                        1
                        + 0.12 * math.sin((i - hours + 1) / 3 + index)
                        - 0.12 * math.sin(index)
                    ),
                    2,
                )
                history[sensor["id"]].append(
                    {
                        "time": (end - timedelta(hours=hours - 1 - i)).isoformat(),
                        "value": value,
                    }
                )
    else:
        flux = f"""
from(bucket: bucketParam)
 |> range(start: -{hours}h)
 |> filter(fn:(r)=> r._measurement == measurementParam)
 |> filter(fn:(r)=> contains(value:r.sensor, set:{json.dumps([s["id"] for s in SENSORS])}))
 |> window(every: 1h)
 |> last()
 |> group(columns: ["sensor", "_field"])
"""
        with InfluxClient() as client:
            tables = client.query(
                flux,
                params={
                    "bucketParam": settings.INFLUX_BUCKET,
                    "measurementParam": settings.MEASUREMENT,
                },
            )
            by_id = {s["id"]: s for s in SENSORS}
            for table in tables:
                for record in table.records:
                    sensor_id = record.values.get("sensor")
                    if (
                        sensor_id in by_id
                        and record.get_field() == by_id[sensor_id]["field"]
                    ):
                        value = record.get_value()
                        timestamp = record.get_time()
                        if (
                            timestamp is not None
                            and isinstance(value, (int, float))
                            and math.isfinite(value)
                        ):
                            history[sensor_id].append(
                                {"time": timestamp.isoformat(), "value": value}
                            )
        for points in history.values():
            points.sort(key=lambda point: point["time"])
    sensors, insights = [], []
    for sensor in SENSORS:
        points = history[sensor["id"]]
        value = points[-1]["value"] if points else None
        timestamp = points[-1]["time"] if points else None
        stale = (
            timestamp
            and (now - datetime.fromisoformat(timestamp)).total_seconds() > 7200
        )
        status = (
            "missing"
            if value is None
            else "stale"
            if stale
            else "warning"
            if value > sensor["threshold"]
            else "normal"
        )
        item = {k: v for k, v in sensor.items() if k != "demo"}
        item.update(value=value, time=timestamp, status=status, bim_object_id=None)
        sensors.append(item)
        if value is not None and value > sensor["threshold"]:
            insights.append(
                {
                    "sensor": sensor["id"],
                    "title": f"{sensor['name']} au-dessus du seuil",
                    "value": value,
                    "threshold": sensor["threshold"],
                    "unit": sensor["unit"],
                    "explanation": "Contrôlez la mesure et la ventilation de la zone avant toute intervention.",
                    "source": "rule",
                    "stale": bool(stale),
                }
            )
    return {
        "source": mode,
        "period": period,
        "generated_at": now.isoformat(),
        "site": {
            "name": "Atelier EcoTwin",
            "description": "Site de démonstration" if mode == "demo" else "Site pilote",
            "bim_mapping": "not_configured",
        },
        "sensors": sensors,
        "history": history,
        "insights": insights,
        "threshold_note": "Seuils illustratifs à valider par votre responsable métier; ils ne constituent pas un diagnostic sanitaire.",
        "ai": {"connected": False, "provider": None, "method": "threshold_rules"},
    }
