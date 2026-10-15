"""Replay an explicitly selected CSV into the EcoTwin ingestion API.

Credentials come from API_KEY; the CSV must be supplied through CSV_PATH.
Uses only the Python standard library and stops cleanly at end-of-file.
"""

import csv
import json
import math
import os
import signal
import threading
from pathlib import Path
from urllib.request import Request, urlopen

SENSOR_ID = {
    "temperature": "CAP_TEMP",
    "humidity": "CAP_HUM",
    "pm25": "CAP_PM25",
    "pm10": "CAP_PM10",
    "so2": "CAP_SO2",
    "co": "CAP_CO",
    "o3": "CAP_O3",
    "no2": "CAP_NO2",
}
COLMAP = {
    "36_temperature": "temperature",
    "37_humidity": "humidity",
    "38_pm25": "pm25",
    "39_pm10": "pm10",
    "41_so2": "so2",
    "42_co": "co",
    "43_o3": "o3",
    "40_no2": "no2",
}


def build_items(row):
    items = []
    for column, field in COLMAP.items():
        raw = row.get(column, row.get(field))
        try:
            value = float(raw)
        except (TypeError, ValueError):
            continue
        if math.isfinite(value):
            items.append({"sensor": SENSOR_ID[field], field: value})
    return items


def send(items, api_base, api_key):
    if not items:
        return 0
    request = Request(
        f"{api_base.rstrip('/')}/api/telemetry/ingest",
        data=json.dumps({"items": items}).encode(),
        headers={"Content-Type": "application/json", "X-API-Key": api_key},
        method="POST",
    )
    with urlopen(request, timeout=30) as response:
        return json.load(response)["written"]


def main():
    csv_path = os.getenv("CSV_PATH")
    api_key = os.getenv("API_KEY")
    if not csv_path or not api_key:
        raise SystemExit("Définissez CSV_PATH et API_KEY avant de lancer la reprise.")
    interval = int(os.getenv("SLEEP_SEC", "180"))
    start = int(os.getenv("START_INDEX", "0"))
    if interval < 1 or start < 0:
        raise SystemExit(
            "SLEEP_SEC doit être positif et START_INDEX doit être positif ou nul."
        )
    looping = os.getenv("LOOP", "false").lower() == "true"
    stop = threading.Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda *_: stop.set())
    with Path(csv_path).open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    if start >= len(rows):
        raise SystemExit("Le CSV est vide ou START_INDEX dépasse la dernière ligne.")
    index = start
    while not stop.is_set():
        count = send(
            build_items(rows[index]),
            os.getenv("API_BASE_URL", "http://localhost:8000"),
            api_key,
        )
        print(f"Ligne {index + 1}: {count} mesure(s) enregistrée(s).")
        index += 1
        if index == len(rows):
            if not looping:
                break
            index = 0
        stop.wait(interval)


if __name__ == "__main__":
    main()
