from fastapi import FastAPI, Depends, Header, HTTPException, Request
from .routers.telemetry import router as telemetry_router
from .core.config import settings

app = FastAPI(title="EcoTwin API", version="0.1.0")

def api_key_guard(request: Request, x_api_key: str | None = Header(None)):
    # accepte aussi ?api_key=... pour tests navigateur
    key = x_api_key or request.query_params.get("api_key")
    if settings.API_KEY and key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

@app.get("/health")
def health():
    return {"status": "ok"}

# on monte le router SANS dépendance globale
app.include_router(telemetry_router)
