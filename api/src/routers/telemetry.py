import json
import logging
from fastapi import APIRouter, HTTPException, Query, Depends
from ..schemas.telemetry import BulkIngestRequest
from ..services.telemetry_service import measurement_to_point, FIELDS
from ..clients.influx_client import InfluxClient
from ..core.config import settings
from ..core.security import api_key_guard

router = APIRouter(tags=["telemetry"], dependencies=[Depends(api_key_guard)])
logger = logging.getLogger(__name__)


def query_latest(sensor):
    flux = f"""
from(bucket: bucketParam)
  |> range(start: -30d)
  |> filter(fn:(r)=> r._measurement == measurementParam and r.sensor == sensorParam)
  |> filter(fn:(r)=> contains(value: r._field, set: {json.dumps(list(FIELDS))}))
  |> group(columns: ["_field"])
  |> last()
"""
    with InfluxClient() as client:
        tables = client.query(
            flux,
            params={
                "bucketParam": settings.INFLUX_BUCKET,
                "measurementParam": settings.MEASUREMENT,
                "sensorParam": sensor,
            },
        )
        out = {"sensor": sensor}
        latest_time = None
        for table in tables:
            for record in table.records:
                out[str(record.get_field())] = record.get_value()
                timestamp = record.get_time()
                if timestamp is not None and (
                    latest_time is None or timestamp > latest_time
                ):
                    latest_time = timestamp
        if latest_time:
            out["_time"] = latest_time.isoformat()
        return out


@router.post("/ingest")
def ingest_bulk(req: BulkIngestRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="Aucune mesure à enregistrer.")
    try:
        with InfluxClient() as client:
            n = client.write_points([measurement_to_point(m) for m in req.items])
        return {"written": n}
    except Exception:
        logger.warning("InfluxDB ingestion failed; see dependency availability")
        raise HTTPException(
            503, "La source de données est indisponible. Réessayez."
        ) from None


@router.get("/latest")
def latest(sensor: str = Query(..., min_length=1, max_length=128)):
    try:
        return query_latest(sensor)
    except Exception:
        logger.warning("InfluxDB latest query failed; see dependency availability")
        raise HTTPException(
            503, "La source de données est indisponible. Réessayez."
        ) from None
