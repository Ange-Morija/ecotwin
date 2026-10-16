"""Server-owned subscription price and customer. No card data enters EcoTwin."""

import time
import secrets
from urllib.parse import urlsplit
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from ..core.config import settings
from ..core.database import database
from ..core.security import check_csrf, current_user

router = APIRouter(prefix="/api/billing", tags=["billing"])


def enabled():
    live = settings.STRIPE_MODE == "live"
    origin = urlsplit(settings.APP_URL)
    return bool(
        settings.STRIPE_MODE in {"test", "live"}
        and settings.STRIPE_SECRET_KEY
        and settings.STRIPE_PRICE_ID
        and settings.STRIPE_WEBHOOK_SECRET
        and not origin.username
        and not origin.password
        and origin.hostname
        and not origin.query
        and not origin.fragment
        and origin.path in ("", "/")
        and (
            origin.scheme == "https"
            or (
                not live
                and origin.scheme == "http"
                and not origin.username
                and not origin.password
                and origin.hostname in {"localhost", "127.0.0.1"}
            )
        )
        and (not live or settings.STRIPE_ALLOW_LIVE)
    )


def client():
    if not enabled():
        raise HTTPException(503, "Les abonnements ne sont pas encore ouverts.")
    return stripe.StripeClient(
        settings.STRIPE_SECRET_KEY,
        max_network_retries=0,
        http_client=stripe.RequestsClient(timeout=15),
    )


def unavailable():
    return HTTPException(
        503, "Stripe est indisponible. Aucun paiement n’a été confirmé. Réessayez."
    )


def price_data(service):
    price = service.v1.prices.retrieve(settings.STRIPE_PRICE_ID)
    if (
        bool(price.livemode) != (settings.STRIPE_MODE == "live")
        or not price.active
        or not price.recurring
        or price.unit_amount is None
        or price.recurring.usage_type != "licensed"
    ):
        raise HTTPException(503, "L’offre Business est en cours de configuration.")
    return {
        "amount": price.unit_amount,
        "currency": price.currency,
        "interval": price.recurring.interval,
        "interval_count": price.recurring.interval_count,
        "test_mode": not price.livemode,
    }


@router.get("/plan")
def plan():
    if not enabled():
        return {"enabled": False, "price": None}
    try:
        return {"enabled": True, "price": price_data(client())}
    except stripe.StripeError:
        raise unavailable() from None


def subscriptions(service, customer):
    result = service.v1.subscriptions.list(
        {"customer": customer, "status": "all", "limit": 100}
    )
    if getattr(result, "has_more", False):
        raise HTTPException(
            503,
            "L’historique de facturation nécessite une vérification. Contactez votre administrateur.",
        )
    return result.data


@router.get("/status")
def status(user=Depends(current_user)):
    with database() as db:
        row = db.execute(
            "SELECT customer FROM billing WHERE user_id=?", (user["id"],)
        ).fetchone()
    if row and not enabled():
        raise HTTPException(
            503, "Le statut de votre abonnement est momentanément indisponible."
        )
    if not row:
        return {"status": "none", "subscribed": False, "has_customer": bool(row)}
    try:
        items = subscriptions(client(), row["customer"])
        relevant = [
            item
            for item in items
            if item.status not in {"canceled", "incomplete_expired"}
        ]
        item = max(relevant or items, key=lambda x: x.created, default=None)
        matches = item and any(
            i.price.id == settings.STRIPE_PRICE_ID for i in item["items"].data
        )
        return {
            "status": item.status if item else "none",
            "subscribed": bool(matches and item.status in {"active", "trialing"}),
            "has_customer": True,
            "cancel_at_period_end": bool(item and item.cancel_at_period_end),
        }
    except stripe.StripeError:
        raise unavailable() from None


@router.post("/checkout", dependencies=[Depends(check_csrf)])
def checkout(user=Depends(current_user)):
    service = client()
    try:
        price_data(service)
        with database() as db:
            row = db.execute(
                "SELECT * FROM billing WHERE user_id=?", (user["id"],)
            ).fetchone()
        if not row:
            customer = service.v1.customers.create(
                {"email": user["email"], "name": user["name"]},
                {"idempotency_key": f"ecotwin-customer-{user['id']}"},
            )
            with database() as db:
                db.execute(
                    "INSERT OR IGNORE INTO billing(user_id,customer) VALUES (?,?)",
                    (user["id"], customer.id),
                )
                row = db.execute(
                    "SELECT * FROM billing WHERE user_id=?", (user["id"],)
                ).fetchone()
        if any(
            i.status not in {"canceled", "incomplete_expired"}
            for i in subscriptions(service, row["customer"])
        ):
            raise HTTPException(
                409, "Un abonnement existe déjà. Utilisez Gérer mon abonnement."
            )
        if row["checkout_id"] and row["checkout_expires"] > time.time():
            existing = service.v1.checkout.sessions.retrieve(row["checkout_id"])
            if existing.status == "open":
                return {"url": existing.url}
            if existing.status == "complete":
                raise HTTPException(
                    409, "Paiement en cours de confirmation. Actualisez le statut."
                )
        # Persist a shared attempt BEFORE the external request. No SQLite lock is held on the network.
        # Lost replies and concurrent tabs reuse the exact same Stripe idempotency key.
        with database() as db:
            db.execute("BEGIN IMMEDIATE")
            latest = db.execute(
                "SELECT * FROM billing WHERE user_id=?", (user["id"],)
            ).fetchone()
            if (
                latest["checkout_id"] != row["checkout_id"]
                and latest["checkout_expires"]
                and latest["checkout_expires"] > time.time()
            ):
                return {"url": latest["checkout_url"]}
            if latest["checkout_id"]:
                db.execute(
                    "DELETE FROM billing_checkout_attempts WHERE user_id=?",
                    (user["id"],),
                )
                db.execute(
                    "UPDATE billing SET checkout_id=NULL, checkout_url=NULL, checkout_expires=NULL WHERE user_id=?",
                    (user["id"],),
                )
            db.execute(
                "INSERT OR IGNORE INTO billing_checkout_attempts VALUES (?,?)",
                (user["id"], secrets.token_hex(16)),
            )
            attempt = db.execute(
                "SELECT attempt FROM billing_checkout_attempts WHERE user_id=?",
                (user["id"],),
            ).fetchone()[0]
        session = service.v1.checkout.sessions.create(
            {
                "customer": row["customer"],
                "mode": "subscription",
                "line_items": [{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
                "success_url": settings.APP_URL + "/business?checkout=returned",
                "cancel_url": settings.APP_URL + "/business?checkout=canceled",
            },
            {"idempotency_key": "ecotwin-checkout-" + attempt},
        )
        with database() as db:
            db.execute(
                "UPDATE billing SET checkout_id=?,checkout_url=?,checkout_expires=? WHERE user_id=?",
                (session.id, session.url, session.expires_at, user["id"]),
            )
        if getattr(session, "status", "open") != "open":
            raise HTTPException(
                409,
                "Paiement en cours de confirmation ou expiré. Actualisez le statut.",
            )
        return {"url": session.url}
    except stripe.StripeError:
        raise unavailable() from None


@router.post("/portal", dependencies=[Depends(check_csrf)])
def portal(user=Depends(current_user)):
    service = client()
    with database() as db:
        row = db.execute(
            "SELECT customer FROM billing WHERE user_id=?", (user["id"],)
        ).fetchone()
    if not row:
        raise HTTPException(409, "Aucun abonnement à gérer.")
    try:
        session = service.v1.billing_portal.sessions.create(
            {"customer": row["customer"], "return_url": settings.APP_URL + "/business"}
        )
        return {"url": session.url}
    except stripe.StripeError:
        raise unavailable() from None


@router.post("/webhook")
async def webhook(request: Request):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(503, "Service indisponible.")
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 262144:
            raise HTTPException(413, "Événement trop volumineux.")
    try:
        event = stripe.Webhook.construct_event(
            bytes(body),
            request.headers.get("stripe-signature", ""),
            settings.STRIPE_WEBHOOK_SECRET,
        )
        if not event.id or bool(event.livemode) != (settings.STRIPE_MODE == "live"):
            raise ValueError("mode mismatch")
    except (ValueError, AttributeError, KeyError, stripe.SignatureVerificationError):
        raise HTTPException(400, "Signature invalide.") from None
    # Only retain event identity, never the payment payload or personal/card details.
    # Subscription state is reconciled from Stripe on every /status request, never from a redirect or event ordering.
    with database() as db:
        db.execute(
            "INSERT OR IGNORE INTO billing_events(id,received) VALUES (?,?)",
            (event.id, time.time()),
        )
    return {"received": True}
