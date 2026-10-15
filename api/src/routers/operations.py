import json
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from ..core.database import database
from ..core.security import check_csrf, current_user

router = APIRouter(prefix="/api", tags=["operations"])


class MaintenanceFields(BaseModel):
    last: datetime | None = None
    next: datetime | None = None
    interval_days: int | None = Field(None, ge=1, le=3650)
    notes: str | None = Field(None, max_length=4000)


class MaintenanceInput(BaseModel):
    maintenance: MaintenanceFields


class ActionInput(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    due_at: datetime | None = None
    done: bool = False
    done_at: datetime | None = None
    done_by: str = Field("", max_length=80)


@router.get("/telemetry/maintenance")
def get_maintenance(
    sensor: str = Query(min_length=1, max_length=128), user=Depends(current_user)
):
    with database() as db:
        row = db.execute(
            "SELECT payload FROM maintenance WHERE sensor=?", (sensor,)
        ).fetchone()
    return json.loads(row[0]) if row else {"maintenance": {}}


@router.post("/telemetry/maintenance", dependencies=[Depends(check_csrf)])
def save_maintenance(
    payload: MaintenanceInput,
    sensor: str = Query(min_length=1, max_length=128),
    user=Depends(current_user),
):
    with database() as db:
        db.execute(
            "INSERT INTO maintenance VALUES (?,?,?) ON CONFLICT(sensor) DO UPDATE SET payload=excluded.payload, updated_by=excluded.updated_by",
            (sensor, payload.model_dump_json(), user["id"]),
        )
    return payload.model_dump(mode="json")


@router.get("/mlops/actions")
def list_actions(user=Depends(current_user)):
    with database() as db:
        rows = db.execute(
            "SELECT payload FROM actions WHERE user_id=? ORDER BY rowid DESC LIMIT 200",
            (user["id"],),
        ).fetchall()
    return [json.loads(row[0]) for row in rows]


@router.post("/mlops/actions", status_code=201, dependencies=[Depends(check_csrf)])
def create_action(payload: ActionInput, user=Depends(current_user)):
    value = payload.model_dump(mode="json")
    value.update(
        id=secrets.token_hex(12),
        created_at=datetime.now(timezone.utc).isoformat(),
        source="manual",
    )
    with database() as db:
        db.execute(
            "INSERT INTO actions VALUES (?,?,?)",
            (value["id"], user["id"], json.dumps(value)),
        )
    return value


@router.put("/mlops/actions/{action_id}", dependencies=[Depends(check_csrf)])
def update_action(action_id: str, payload: ActionInput, user=Depends(current_user)):
    with database() as db:
        row = db.execute(
            "SELECT payload FROM actions WHERE id=? AND user_id=?",
            (action_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Action introuvable.")
        value = json.loads(row[0])
        value.update(payload.model_dump(mode="json"))
        db.execute(
            "UPDATE actions SET payload=? WHERE id=? AND user_id=?",
            (json.dumps(value), action_id, user["id"]),
        )
    return value


@router.delete("/mlops/actions/{action_id}", dependencies=[Depends(check_csrf)])
def delete_action(action_id: str, user=Depends(current_user)):
    with database() as db:
        count = db.execute(
            "DELETE FROM actions WHERE id=? AND user_id=?", (action_id, user["id"])
        ).rowcount
    if not count:
        raise HTTPException(404, "Action introuvable.")
    return {"deleted": True}
