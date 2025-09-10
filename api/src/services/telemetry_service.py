from influxdb_client import Point
from datetime import datetime, timezone
from ..core.config import settings
from ..schemas.telemetry import Measurement

FIELDS = ("humidity","temperature","pm25","pm10","so2","co","o3","no2")

def _resolved_time(ts: datetime | None) -> datetime:
    if ts is None: return datetime.now(timezone.utc)
    if ts.tzinfo is None: return ts.replace(tzinfo=timezone.utc)
    return ts

def measurement_to_point(m: Measurement) -> Point:
    p = Point(settings.MEASUREMENT).tag("sensor", m.sensor).time(_resolved_time(m.time))
    for f in FIELDS:
        v = getattr(m, f)
        if v is not None:
            p = p.field(f, float(v))
    return p
