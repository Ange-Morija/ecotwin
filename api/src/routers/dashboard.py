import logging
from typing import Literal
from fastapi import APIRouter, HTTPException, Request
from ..core.security import api_key_guard
from ..services.dashboard_service import dashboard_data

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
def dashboard(
    request: Request,
    mode: Literal["demo", "live"] = "live",
    period: Literal["24h", "7d"] = "24h",
):
    if mode != "demo":
        api_key_guard(request)
    try:
        return dashboard_data(mode, period)
    except Exception:
        logging.getLogger(__name__).warning("Dashboard data source unavailable")
        raise HTTPException(
            503,
            "InfluxDB est indisponible ou non configuré. Vérifiez la connexion à votre source.",
        ) from None
