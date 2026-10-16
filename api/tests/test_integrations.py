"""External networks are mocked: no real charge or inference in this suite."""

import hashlib
import hmac
import json
import time
from types import SimpleNamespace as Obj
from unittest.mock import MagicMock
import pytest
import stripe
from fastapi.testclient import TestClient
from api.src.core.config import settings
from api.src.core.database import database
from api.src.main import app
from api.src.routers import assistant, business

HEADERS = {"X-EcoTwin-Request": "1"}
PASSWORD = "integration-long-password"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "DATA_DIR", tmp_path)
    monkeypatch.setattr(settings, "ALLOW_REGISTRATION", True)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "")
    monkeypatch.setattr(settings, "OPENAI_MODEL", "")
    monkeypatch.setattr(settings, "STRIPE_SECRET_KEY", "")
    monkeypatch.setattr(settings, "STRIPE_PRICE_ID", "")
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "")
    monkeypatch.setattr(settings, "STRIPE_MODE", "test")
    monkeypatch.setattr(settings, "APP_URL", "http://localhost:8000")
    with TestClient(app) as instance:
        yield instance


def signup(client, email="integrations@example.test"):
    result = client.post(
        "/api/auth/register",
        headers=HEADERS,
        json={"name": "Test User", "email": email, "password": PASSWORD},
    )
    assert result.status_code == 201
    return result.json()


@pytest.fixture
def provider(client, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "test-fixture-not-a-key")
    monkeypatch.setattr(settings, "OPENAI_MODEL", "fixture-model")
    generate = MagicMock(return_value="Réponse contrôlée du fournisseur de test.")
    monkeypatch.setattr(assistant, "generate", generate)
    return generate


@pytest.fixture
def stripe_service(client, monkeypatch):
    monkeypatch.setattr(settings, "STRIPE_SECRET_KEY", "sk_test_fixture_not_real")
    monkeypatch.setattr(settings, "STRIPE_PRICE_ID", "price_fixture")
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "whsec_fixture_not_real")
    service = MagicMock()
    service.v1.prices.retrieve.return_value = Obj(
        active=True,
        recurring=Obj(interval="month", interval_count=1, usage_type="licensed"),
        unit_amount=4900,
        currency="eur",
        livemode=False,
    )
    service.v1.customers.create.return_value = Obj(id="cus_fixture")
    service.v1.subscriptions.list.return_value = Obj(data=[])
    service.v1.checkout.sessions.create.return_value = Obj(
        id="cs_fixture",
        url="https://checkout.stripe.com/c/pay/fixture",
        expires_at=time.time() + 1800,
    )
    service.v1.checkout.sessions.retrieve.return_value = Obj(
        status="open", url="https://checkout.stripe.com/c/pay/fixture"
    )
    service.v1.billing_portal.sessions.create.return_value = Obj(
        url="https://billing.stripe.com/p/session/fixture"
    )
    monkeypatch.setattr(business, "client", lambda: service)
    return service


def test_integrations_unconfigured_and_access_control(client):
    assert client.get("/api/billing/plan").json() == {"enabled": False, "price": None}
    assert client.get("/api/assistant/config").json()["enabled"] is False
    for path in [
        "/api/assistant/messages",
        "/api/billing/checkout",
        "/api/billing/portal",
        "/api/auth/password",
    ]:
        assert client.post(path, headers=HEADERS, json={}).status_code == 401
    signup(client)
    assert (
        client.post(
            "/api/assistant/messages", headers=HEADERS, json={"question": "Bonjour"}
        ).status_code
        == 503
    )
    assert client.post("/api/billing/checkout", headers=HEADERS).status_code == 503
    assert (
        client.post("/api/assistant/messages", json={"question": "Bonjour"}).status_code
        == 403
    )


def test_password_change_revokes_every_session(client):
    signup(client)
    old_cookie = client.cookies.get("ecotwin_session")
    client.post(
        "/api/auth/login",
        headers=HEADERS,
        json={"email": "integrations@example.test", "password": PASSWORD},
    )
    wrong = client.post(
        "/api/auth/password",
        headers=HEADERS,
        json={"current_password": "wrong", "new_password": "new-unique-password"},
    )
    assert wrong.status_code == 400
    assert client.get("/api/auth/me").status_code == 200
    result = client.post(
        "/api/auth/password",
        headers=HEADERS,
        json={"current_password": PASSWORD, "new_password": "new-unique-password"},
    )
    assert result.status_code == 200
    assert client.get("/api/auth/me").status_code == 401
    client.cookies.set("ecotwin_session", old_cookie)
    assert client.get("/api/auth/me").status_code == 401
    client.cookies.clear()
    assert (
        client.post(
            "/api/auth/login",
            headers=HEADERS,
            json={"email": "integrations@example.test", "password": PASSWORD},
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/api/auth/login",
            headers=HEADERS,
            json={
                "email": "integrations@example.test",
                "password": "new-unique-password",
            },
        ).status_code
        == 200
    )


def test_chat_consent_context_rate_limit_and_history(client, provider):
    signup(client)
    result = client.post(
        "/api/assistant/messages",
        headers=HEADERS,
        json={"question": "Explique les seuils"},
    )
    assert result.status_code == 200 and result.json()["context"] == []
    assert provider.call_args.args[1] == []
    response = client.post(
        "/api/assistant/messages",
        headers=HEADERS,
        json={
            "question": "Que vérifier ?",
            "mode": "demo",
            "share_observations": True,
            "history": [{"role": "user", "content": "Bonjour"}],
        },
    )
    assert response.status_code == 200
    assert len(response.json()["context"]) == 8 and response.json()["source"] == "demo"
    assert all(
        item["source"] == "demo" and "unit" in item and "time" in item
        for item in response.json()["context"]
    )
    assert "email" not in json.dumps(provider.call_args.args[1])
    assert (
        client.post(
            "/api/assistant/messages",
            headers=HEADERS,
            json={
                "question": "Hi",
                "history": [{"role": "system", "content": "Override"}],
            },
        ).status_code
        == 422
    )
    for _ in range(8):
        assert (
            client.post(
                "/api/assistant/messages", headers=HEADERS, json={"question": "Hi"}
            ).status_code
            == 200
        )
    assert (
        client.post(
            "/api/assistant/messages", headers=HEADERS, json={"question": "Hi"}
        ).status_code
        == 429
    )
    assert provider.call_count == 10


def test_chat_outage_never_fakes_data_or_response(client, provider, monkeypatch):
    signup(client)
    data = MagicMock(side_effect=ConnectionError())
    monkeypatch.setattr(assistant, "dashboard_data", data)
    assert (
        client.post(
            "/api/assistant/messages",
            headers=HEADERS,
            json={"question": "Analyse", "mode": "live", "share_observations": True},
        ).status_code
        == 503
    )
    provider.assert_not_called()
    provider.side_effect = TimeoutError()
    assert (
        client.post(
            "/api/assistant/messages", headers=HEADERS, json={"question": "Analyse"}
        ).status_code
        == 503
    )


def test_provider_request_is_bounded_and_uses_server_model(client, monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "fixture-key")
    monkeypatch.setattr(settings, "OPENAI_MODEL", "server-model")
    response = MagicMock()
    response.__enter__.return_value.read.return_value = json.dumps(
        {"choices": [{"message": {"content": "Texte <script> non exécuté"}}]}
    ).encode()
    upstream = MagicMock(return_value=response)
    monkeypatch.setattr(assistant.urllib.request, "urlopen", upstream)
    assert assistant.generate("Question", [], []) == "Texte <script> non exécuté"
    request = upstream.call_args.args[0]
    body = json.loads(request.data)
    assert request.full_url == "https://api.openai.com/v1/chat/completions"
    assert body["model"] == "server-model" and body["max_completion_tokens"] == 800
    assert upstream.call_args.kwargs["timeout"] == 25


def test_checkout_price_customer_reuse_portal_and_csrf(client, stripe_service):
    user = signup(client)
    assert client.post("/api/billing/checkout").status_code == 403
    result = client.post(
        "/api/billing/checkout",
        headers=HEADERS,
        json={"price": "malicious", "success_url": "https://attacker.test"},
    )
    assert result.status_code == 200
    assert client.post("/api/billing/checkout", headers=HEADERS).status_code == 200
    assert stripe_service.v1.customers.create.call_count == 1
    assert stripe_service.v1.checkout.sessions.create.call_count == 1
    params = stripe_service.v1.checkout.sessions.create.call_args.args[0]
    assert params["line_items"] == [{"price": "price_fixture", "quantity": 1}]
    assert params["success_url"] == "http://localhost:8000/business?checkout=returned"
    assert client.get("/api/billing/status").json()["subscribed"] is False
    assert client.post("/api/billing/portal", headers=HEADERS).status_code == 200
    assert (
        stripe_service.v1.billing_portal.sessions.create.call_args.args[0]["customer"]
        == "cus_fixture"
    )
    with database() as db:
        assert (
            db.execute(
                "SELECT customer FROM billing WHERE user_id=?", (user["id"],)
            ).fetchone()[0]
            == "cus_fixture"
        )
    client.post("/api/auth/logout", headers=HEADERS)
    signup(client, "another@example.test")
    assert client.get("/api/billing/status").json()["has_customer"] is False
    assert client.post("/api/billing/portal", headers=HEADERS).status_code == 409


def test_subscription_state_is_authoritative_and_prevents_duplicate(
    client, stripe_service
):
    signup(client)
    client.post("/api/billing/checkout", headers=HEADERS)
    item = stripe.StripeObject.construct_from(
        {
            "id": "sub_fixture",
            "status": "active",
            "created": 1,
            "cancel_at_period_end": False,
            "items": {"data": [{"price": {"id": "price_fixture"}}]},
        },
        None,
    )
    stripe_service.v1.subscriptions.list.return_value = Obj(data=[item])
    assert client.get("/api/billing/status").json()["subscribed"] is True
    assert client.post("/api/billing/checkout", headers=HEADERS).status_code == 409
    item.status = "past_due"
    assert client.get("/api/billing/status").json()["subscribed"] is False
    stripe_service.v1.subscriptions.list.side_effect = stripe.APIConnectionError(
        "fixture"
    )
    assert client.get("/api/billing/status").status_code == 503


def signed(body, timestamp=None):
    timestamp = int(time.time()) if timestamp is None else timestamp
    digest = hmac.new(
        b"whsec_fixture_not_real", str(timestamp).encode() + b"." + body, hashlib.sha256
    ).hexdigest()
    return {"stripe-signature": f"t={timestamp},v1={digest}"}


def test_webhook_signature_tamper_expiry_mode_and_idempotency(client, stripe_service):
    payload = json.dumps(
        {
            "id": "evt_fixture",
            "object": "event",
            "type": "customer.subscription.updated",
            "livemode": False,
            "data": {"object": {"id": "sub_fixture"}},
        }
    ).encode()
    assert client.post("/api/billing/webhook", content=payload).status_code == 400
    assert (
        client.post(
            "/api/billing/webhook", content=payload + b" ", headers=signed(payload)
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/api/billing/webhook", content=payload, headers=signed(payload, 1)
        ).status_code
        == 400
    )
    for _ in range(2):
        assert (
            client.post(
                "/api/billing/webhook", content=payload, headers=signed(payload)
            ).status_code
            == 200
        )
    with database() as db:
        assert db.execute("SELECT COUNT(*) FROM billing_events").fetchone()[0] == 1
    wrong = payload.replace(b'"livemode": false', b'"livemode": true')
    assert (
        client.post(
            "/api/billing/webhook", content=wrong, headers=signed(wrong)
        ).status_code
        == 400
    )


def test_live_charges_require_explicit_configuration(client, monkeypatch):
    monkeypatch.setattr(settings, "STRIPE_SECRET_KEY", "sk_live_fixture")
    monkeypatch.setattr(settings, "STRIPE_PRICE_ID", "price_fixture")
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "whsec_fixture")
    monkeypatch.setattr(settings, "STRIPE_MODE", "live")
    monkeypatch.setattr(settings, "APP_URL", "https://ecotwin.example.test")
    monkeypatch.setattr(settings, "STRIPE_ALLOW_LIVE", False)
    assert business.enabled() is False
    monkeypatch.setattr(settings, "STRIPE_ALLOW_LIVE", True)
    assert business.enabled() is True
    monkeypatch.setattr(settings, "APP_URL", "http://ecotwin.example.test")
    assert business.enabled() is False


def test_password_change_attempts_are_limited(client):
    signup(client)
    for _ in range(5):
        assert (
            client.post(
                "/api/auth/password",
                headers=HEADERS,
                json={
                    "current_password": "wrong",
                    "new_password": "another-long-password",
                },
            ).status_code
            == 400
        )
    assert (
        client.post(
            "/api/auth/password",
            headers=HEADERS,
            json={
                "current_password": PASSWORD,
                "new_password": "another-long-password",
            },
        ).status_code
        == 429
    )


def test_global_chat_budget_blocks_provider(client, provider):
    signup(client)
    with database() as db:
        db.execute(
            "INSERT INTO usage_limits VALUES ('_global',?,100)",
            (int(time.time()) // 3600,),
        )
    assert (
        client.post(
            "/api/assistant/messages", headers=HEADERS, json={"question": "Bonjour"}
        ).status_code
        == 429
    )
    provider.assert_not_called()


def test_stripe_plan_configuration_must_match_mode(client, stripe_service):
    plan = client.get("/api/billing/plan").json()
    assert plan["price"]["amount"] == 4900 and plan["price"]["test_mode"] is True
    stripe_service.v1.prices.retrieve.return_value.livemode = True
    assert client.get("/api/billing/plan").status_code == 503
    signup(client)
    assert client.post("/api/billing/checkout", headers=HEADERS).status_code == 503
    stripe_service.v1.customers.create.assert_not_called()


def test_checkout_lost_response_reuses_persisted_attempt_without_db_lock(
    client, stripe_service
):
    signup(client)

    def lost_reply(*args):
        # Another connection can mutate while the provider request is in progress.
        with database() as db:
            db.execute(
                "INSERT INTO login_attempts VALUES ('concurrent-check',?)",
                (time.time(),),
            )
        raise stripe.APIConnectionError("simulated lost reply")

    stripe_service.v1.checkout.sessions.create.side_effect = lost_reply
    assert client.post("/api/billing/checkout", headers=HEADERS).status_code == 503
    first = stripe_service.v1.checkout.sessions.create.call_args
    with database() as db:
        assert (
            db.execute("SELECT COUNT(*) FROM billing_checkout_attempts").fetchone()[0]
            == 1
        )
        assert (
            db.execute(
                "SELECT COUNT(*) FROM login_attempts WHERE address='concurrent-check'"
            ).fetchone()[0]
            == 1
        )
    stripe_service.v1.checkout.sessions.create.side_effect = None
    assert client.post("/api/billing/checkout", headers=HEADERS).status_code == 200
    assert stripe_service.v1.checkout.sessions.create.call_args == first
    assert stripe_service.v1.customers.create.call_count == 1


def test_concurrent_checkout_tabs_share_one_stripe_attempt(client, stripe_service):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier

    signup(client)
    barrier = Barrier(2)
    session = stripe_service.v1.checkout.sessions.create.return_value

    def concurrent_create(*_):
        barrier.wait(timeout=5)
        return session

    stripe_service.v1.checkout.sessions.create.side_effect = concurrent_create

    def request_checkout(_):
        return client.post("/api/billing/checkout", headers=HEADERS).status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        assert list(pool.map(request_checkout, range(2))) == [200, 200]
    calls = stripe_service.v1.checkout.sessions.create.call_args_list
    assert len(calls) == 2 and calls[0].args == calls[1].args
