from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .core.database import initialize
from .routers.auth import router as auth_router
from .routers.dashboard import router as dashboard_router
from .routers.operations import router as operations_router
from .routers.telemetry import router as telemetry_router


@asynccontextmanager
async def lifespan(app):
    initialize()
    yield


app = FastAPI(title="EcoTwin API", version="0.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.CORS_ORIGINS),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-API-Key", "X-EcoTwin-Request"],
)


@app.middleware("http")
async def response_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(operations_router)
app.include_router(telemetry_router, prefix="/api/telemetry")
app.include_router(telemetry_router, include_in_schema=False)

WEB_ROOT = Path(__file__).resolve().parents[2] / "web" / "dist"
if WEB_ROOT.is_dir():
    for folder in ("js", "styles", "assets", "vendor", "public", "app-assets"):
        directory = WEB_ROOT / folder
        if directory.is_dir():
            app.mount(f"/{folder}", StaticFiles(directory=directory), name=folder)

    @app.get("/", include_in_schema=False)
    @app.get("/login", include_in_schema=False)
    @app.get("/register", include_in_schema=False)
    @app.get("/dashboard", include_in_schema=False)
    def platform():
        return FileResponse(WEB_ROOT / "index.html")
