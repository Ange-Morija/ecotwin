import secrets
import sqlite3
import time
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from ..core.config import settings
from ..core.database import database
from ..core.security import (
    COOKIE_NAME,
    check_csrf,
    current_user,
    password_hash,
    token_hash,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value):
        value = value.strip().lower()
        if (
            value.count("@") != 1
            or "." not in value.split("@")[1]
            or any(c.isspace() for c in value)
        ):
            raise ValueError("Adresse e-mail invalide")
        return value


class Registration(Credentials):
    name: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=12, max_length=128)

    @field_validator("name")
    @classmethod
    def valid_name(cls, value):
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Renseignez au moins 2 caractères.")
        return value


def create_session(response, user_id):
    token = secrets.token_urlsafe(32)
    with database() as db:
        db.execute("DELETE FROM sessions WHERE expires<?", (time.time(),))
        db.execute(
            "INSERT INTO sessions VALUES (?,?,?)",
            (token_hash(token), user_id, time.time() + 28800),
        )
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=28800,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="strict",
        path="/",
    )
    response.headers["Cache-Control"] = "no-store"


@router.get("/config")
def auth_config():
    return {"registration_enabled": settings.ALLOW_REGISTRATION}


@router.post("/register", dependencies=[Depends(check_csrf)], status_code=201)
def register(payload: Registration, response: Response):
    if not settings.ALLOW_REGISTRATION:
        raise HTTPException(
            403, "La création de compte est désactivée. Contactez votre administrateur."
        )
    user_id = secrets.token_hex(16)
    try:
        with database() as db:
            db.execute(
                "INSERT INTO users VALUES (?,?,?,?,?)",
                (
                    user_id,
                    payload.name.strip(),
                    payload.email,
                    password_hash(payload.password),
                    time.time(),
                ),
            )
    except sqlite3.IntegrityError:
        raise HTTPException(
            409, "Impossible de créer ce compte. Essayez de vous connecter."
        ) from None
    create_session(response, user_id)
    return {"id": user_id, "name": payload.name.strip(), "email": payload.email}


@router.post("/login", dependencies=[Depends(check_csrf)])
def login(payload: Credentials, request: Request, response: Response):
    address = request.client.host if request.client else "unknown"
    now = time.time()
    with database() as db:
        db.execute("DELETE FROM login_attempts WHERE attempted<?", (now - 600,))
        count = db.execute(
            "SELECT COUNT(*) FROM login_attempts WHERE address=?", (address,)
        ).fetchone()[0]
        user = db.execute(
            "SELECT * FROM users WHERE email=?", (payload.email,)
        ).fetchone()
    if count >= 5:
        raise HTTPException(429, "Trop de tentatives. Réessayez dans 10 minutes.")
    # Perform a costly hash even for unknown users to reduce account timing disclosure.
    valid = (
        verify_password(payload.password, user["password_hash"])
        if user
        else bool(password_hash(payload.password) and False)
    )
    if not valid:
        with database() as db:
            db.execute("INSERT INTO login_attempts VALUES (?,?)", (address, now))
        raise HTTPException(401, "E-mail ou mot de passe incorrect.")
    create_session(response, user["id"])
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


@router.get("/me")
def me(user=Depends(current_user)):
    return user


@router.post("/logout", dependencies=[Depends(check_csrf)])
def logout(request: Request, response: Response):
    with database() as db:
        db.execute(
            "DELETE FROM sessions WHERE token_hash=?",
            (token_hash(request.cookies.get(COOKIE_NAME, "")),),
        )
    response.delete_cookie(
        COOKIE_NAME,
        path="/",
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite="strict",
    )
    return {"status": "ok"}
