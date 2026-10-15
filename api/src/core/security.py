import hashlib
import hmac
import secrets
import time
from fastapi import HTTPException, Request
from .config import settings
from .database import database

COOKIE_NAME = "ecotwin_session"


def password_hash(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(
        password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1
    ).hex()
    return f"{salt}:{digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, _ = stored.split(":", 1)
    return hmac.compare_digest(password_hash(password, salt), stored)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def current_user(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        with database() as db:
            row = db.execute(
                "SELECT u.id, u.name, u.email FROM users u JOIN sessions s ON u.id=s.user_id "
                "WHERE s.token_hash=? AND s.expires>?",
                (token_hash(token), time.time()),
            ).fetchone()
        if row:
            return dict(row)
    raise HTTPException(401, "Connectez-vous pour accéder à cet espace.")


def check_csrf(request: Request):
    """A custom header prevents cross-site forms; validate Origin when a browser sends it."""
    if request.headers.get("x-ecotwin-request") != "1":
        raise HTTPException(403, "Requête non autorisée.")
    origin = request.headers.get("origin")
    allowed = {str(request.base_url).rstrip("/"), *settings.CORS_ORIGINS}
    if origin and origin not in allowed:
        # Reverse proxies must preserve the original host/protocol through trusted forwarding.
        raise HTTPException(403, "Origine non autorisée.")


def api_key_guard(request: Request):
    key = request.headers.get("x-api-key")
    if settings.API_KEY and key and hmac.compare_digest(key, settings.API_KEY):
        return True
    current_user(request)
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        check_csrf(request)
    return True
