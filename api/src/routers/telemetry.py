from fastapi import APIRouter, HTTPException, Query, Depends
from ..schemas.telemetry import BulkIngestRequest
from ..services.telemetry_service import measurement_to_point, FIELDS
from ..clients.influx_client import InfluxClient
from ..core.config import settings
from ..main import api_key_guard  # réutilise le guard

router = APIRouter(tags=["telemetry"])

@router.post("/ingest", dependencies=[Depends(api_key_guard)])
def ingest_bulk(req: BulkIngestRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="No items")
    client = InfluxClient()
    n = client.write_points([measurement_to_point(m) for m in req.items])
    client.close()
    return {"written": n}

@router.get("/latest")  # GET ouvert (pas de clé requise)
def latest(sensor: str = Query(..., description="id capteur")):
    fields = [f for f in FIELDS]
    flux = f'''
from(bucket:"{settings.INFLUX_BUCKET}")
  |> range(start: -30d)
  |> filter(fn:(r)=> r._measurement=="{settings.MEASUREMENT}" and r.sensor=="{sensor}")
  |> filter(fn:(r)=> contains(value: r._field, set: {fields}))
  |> group(columns: ["_field"])
  |> last()
'''
    client = InfluxClient()
    tables = client.query(flux)
    out = {"sensor": sensor}
    for t in tables:
        for r in t.records:
            out[str(r.get_field())] = r.get_value()
            out["_time"] = str(r.get_time())
    client.close()
    return out
