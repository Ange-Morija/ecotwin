import time
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from api.src.core.config import settings
from api.src.core.database import database
from api.src.main import app
from api.src.routers import telemetry

HEADERS = {"X-EcoTwin-Request": "1"}


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "DATA_DIR", tmp_path)
    monkeypatch.setattr(settings, "API_KEY", "unit-test-key-not-a-real-secret")
    with TestClient(app) as instance:
        yield instance


def signup(client, email="camille@example.test"):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Camille",
            "email": email,
            "password": "long-unique-test-password",
        },
        headers=HEADERS,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_health_and_assets(client):
    assert client.get("/health").json() == {"status": "ok"}
    for path in [
        "/",
        "/login",
        "/dashboard",
        "/js/platform.js",
        "/styles/platform.css",
        "/assets/model.xkt",
        "/vendor/xeokit-sdk.es.js",
    ]:
        response = client.get(path)
        assert response.status_code == 200, path
        assert response.content


def test_auth_session_hash_revocation_and_expiry(client):
    user = signup(client)
    assert client.get("/api/auth/me").json()["id"] == user["id"]
    token = client.cookies.get("ecotwin_session")
    with database() as db:
        session = db.execute("SELECT * FROM sessions").fetchone()
        stored_user = db.execute("SELECT * FROM users").fetchone()
        assert session["token_hash"] != token
        assert stored_user["password_hash"] != "long-unique-test-password"
    assert client.post("/api/auth/logout", headers=HEADERS).status_code == 200
    assert client.get("/api/auth/me").status_code == 401
    client.cookies.set("ecotwin_session", token)
    assert client.get("/api/auth/me").status_code == 401
    client.cookies.clear()
    assert (
        client.post(
            "/api/auth/login",
            headers=HEADERS,
            json={
                "email": "CAMILLE@example.test",
                "password": "long-unique-test-password",
            },
        ).status_code
        == 200
    )
    with database() as db:
        db.execute("UPDATE sessions SET expires=?", (time.time() - 1,))
    assert client.get("/api/auth/me").status_code == 401


def test_csrf_auth_validation_and_registration_config(client, monkeypatch):
    payload = {
        "name": "Camille",
        "email": "camille@example.test",
        "password": "long-unique-test-password",
    }
    assert client.post("/api/auth/register", json=payload).status_code == 403
    assert (
        client.post(
            "/api/auth/register",
            json=payload,
            headers={**HEADERS, "Origin": "https://untrusted.example"},
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/api/auth/register", json={**payload, "password": "short"}, headers=HEADERS
        ).status_code
        == 422
    )
    monkeypatch.setattr(settings, "ALLOW_REGISTRATION", False)
    assert (
        client.post("/api/auth/register", json=payload, headers=HEADERS).status_code
        == 403
    )


def test_login_rate_limit_and_generic_errors(client):
    for _ in range(5):
        response = client.post(
            "/api/auth/login",
            headers=HEADERS,
            json={"email": "unknown@example.test", "password": "incorrect"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "E-mail ou mot de passe incorrect."
    assert (
        client.post(
            "/api/auth/login",
            headers=HEADERS,
            json={"email": "unknown@example.test", "password": "incorrect"},
        ).status_code
        == 429
    )


def test_public_demo_is_explicit_and_live_is_private(client):
    response = client.get("/api/dashboard?mode=demo")
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "demo" and data["ai"]["connected"] is False
    assert len(data["sensors"]) == 8
    assert len(data["history"]["CAP_TEMP"]) == 24
    assert data["sensors"][0]["value"] == 24.2
    assert data["sensors"][0]["bim_object_id"] is None
    assert data["insights"][0]["source"] == "rule"
    assert (
        len(
            client.get("/api/dashboard?mode=demo&period=7d").json()["history"][
                "CAP_TEMP"
            ]
        )
        == 168
    )
    assert client.get("/api/dashboard").status_code == 401
    assert client.get("/api/dashboard?mode=demo&period=invalid").status_code == 422
    assert (
        client.post(
            "/api/mlops/actions", json={"text": "fake demo write"}, headers=HEADERS
        ).status_code
        == 401
    )


def test_flux_parameters_preserve_sensor_as_data(client, monkeypatch):
    context = MagicMock()
    context.__enter__.return_value = context
    context.query.return_value = []
    monkeypatch.setattr(telemetry, "InfluxClient", lambda: context)
    malicious = 'sensor" |> drop(columns: ["_value"]) //'
    response = client.get(
        "/api/telemetry/latest",
        params={"sensor": malicious},
        headers={"X-API-Key": settings.API_KEY},
    )
    assert response.status_code == 200
    flux = context.query.call_args.args[0]
    params = context.query.call_args.kwargs["params"]
    assert malicious not in flux
    assert params["sensorParam"] == malicious
    assert '["humidity", "temperature"' in flux
    assert context.__exit__.called


def test_ingest_failure_is_not_acknowledged(client, monkeypatch):
    context = MagicMock()
    context.__enter__.return_value = context
    context.write_points.side_effect = RuntimeError("upstream refused")
    monkeypatch.setattr(telemetry, "InfluxClient", lambda: context)
    headers = {"X-API-Key": settings.API_KEY}
    assert (
        client.post(
            "/api/telemetry/ingest", json={"items": []}, headers=headers
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/api/telemetry/ingest",
            json={"items": [{"sensor": "CAP_TEMP", "temperature": 21.2}]},
            headers=headers,
        ).status_code
        == 503
    )
    assert context.__exit__.called
    assert (
        client.post(
            "/api/telemetry/ingest",
            json={"items": [{"sensor": "", "temperature": 21.2}]},
            headers=headers,
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/telemetry/ingest",
            json={"items": [{"sensor": "CAP_TEMP", "temperature": 21.2}]},
        ).status_code
        == 401
    )


def test_influx_unavailable_never_falls_back_to_demo(client, monkeypatch):
    from api.src.routers import dashboard

    signup(client)
    monkeypatch.setattr(
        dashboard, "dashboard_data", MagicMock(side_effect=ConnectionError())
    )
    response = client.get("/api/dashboard?mode=live")
    assert response.status_code == 503
    assert "source" not in response.json()


def test_maintenance_and_actions_persist_with_ownership(client):
    first = signup(client)
    maintenance = {
        "maintenance": {
            "interval_days": 30,
            "notes": "Contrôle filtre",
            "last": "2026-10-15T08:00:00Z",
        }
    }
    assert (
        client.post(
            "/api/telemetry/maintenance?sensor=CAP_TEMP",
            json=maintenance,
            headers=HEADERS,
        ).status_code
        == 200
    )
    assert (
        client.get("/api/telemetry/maintenance?sensor=CAP_TEMP").json()["maintenance"][
            "notes"
        ]
        == "Contrôle filtre"
    )
    action = client.post(
        "/api/mlops/actions", json={"text": "Vérifier ventilation"}, headers=HEADERS
    ).json()
    assert action["source"] == "manual"
    assert client.get("/api/mlops/actions").json()[0]["id"] == action["id"]
    assert client.put(
        f"/api/mlops/actions/{action['id']}",
        json={"text": "Vérifier ventilation", "done": True},
        headers=HEADERS,
    ).json()["done"]
    assert (
        client.post("/api/mlops/actions", json={"text": "CSRF rejected"}).status_code
        == 403
    )
    client.post("/api/auth/logout", headers=HEADERS)
    signup(client, "other@example.test")
    assert client.get("/api/mlops/actions").json() == []
    assert (
        client.delete(f"/api/mlops/actions/{action['id']}", headers=HEADERS).status_code
        == 404
    )
    with database() as db:
        assert (
            db.execute(
                "SELECT user_id FROM actions WHERE id=?", (action["id"],)
            ).fetchone()[0]
            == first["id"]
        )


@pytest.mark.skipif(
    not __import__("os").getenv("ECOTWIN_TEST_INFLUX_URL"),
    reason="Set ECOTWIN_TEST_INFLUX_URL to a fresh disposable InfluxDB 2 instance",
)
def test_real_influx_ingest_query_and_dashboard(client, monkeypatch):
    import os
    import secrets
    import httpx

    url = os.environ["ECOTWIN_TEST_INFLUX_URL"]
    with httpx.Client(trust_env=False) as upstream:
        response = upstream.post(
            f"{url}/api/v2/setup",
            json={
                "username": "ecotwin-test",
                "password": secrets.token_urlsafe(24),
                "org": "EcoTwinTest",
                "bucket": "test_observations",
            },
        )
        assert response.status_code == 201, (
            "Integration requires a fresh disposable database"
        )
        token = response.json()["auth"]["token"]
    monkeypatch.setattr(settings, "INFLUX_URL", url)
    monkeypatch.setattr(settings, "INFLUX_TOKEN", token)
    monkeypatch.setattr(settings, "INFLUX_ORG", "EcoTwinTest")
    monkeypatch.setattr(settings, "INFLUX_BUCKET", "test_observations")
    headers = {"X-API-Key": settings.API_KEY}
    malicious = 'sensor" |> drop(columns: ["_value"]) //'
    response = client.post(
        "/api/telemetry/ingest",
        headers=headers,
        json={
            "items": [
                {"sensor": "CAP_TEMP", "temperature": 21.2},
                {"sensor": "CAP_PM25", "pm25": 18.1},
                {"sensor": malicious, "temperature": 19.4},
            ]
        },
    )
    assert response.status_code == 200 and response.json() == {"written": 3}
    latest = client.get(
        "/api/telemetry/latest", params={"sensor": "CAP_TEMP"}, headers=headers
    )
    assert latest.status_code == 200, latest.text
    assert latest.json()["temperature"] == 21.2
    assert (
        client.get("/latest", params={"sensor": malicious}, headers=headers).json()[
            "temperature"
        ]
        == 19.4
    )
    dashboard = client.get("/api/dashboard?mode=live", headers=headers)
    assert dashboard.status_code == 200, dashboard.text
    data = dashboard.json()
    assert data["source"] == "live"
    assert data["sensors"][0]["value"] == 21.2
    assert data["sensors"][1]["value"] is None
    assert len(data["history"]["CAP_TEMP"]) == 1
    assert data["insights"][0]["sensor"] == "CAP_PM25"


def test_measurement_requires_finite_values_and_identifier(client):
    headers = {"X-API-Key": settings.API_KEY}
    for item in [
        {"sensor": "CAP_TEMP"},
        {"sensor": "  ", "temperature": 21},
        {"sensor": "CAP_TEMP", "temperature": "NaN"},
    ]:
        response = client.post(
            "/api/telemetry/ingest", json={"items": [item]}, headers=headers
        )
        assert response.status_code == 422


def test_csv_replay_validates_values_and_stops_at_eof(tmp_path, monkeypatch):
    from scripts import replay_csv_every_3min_per_metric_no_time as replay

    assert replay.build_items(
        {"36_temperature": "21.5", "37_humidity": "NaN", "38_pm25": "invalid"}
    ) == [{"sensor": "CAP_TEMP", "temperature": 21.5}]
    source = tmp_path / "observations.csv"
    source.write_text("temperature\n21.5\n")
    monkeypatch.setenv("CSV_PATH", str(source))
    monkeypatch.setenv("API_KEY", "test-only-key")
    monkeypatch.setenv("LOOP", "false")
    monkeypatch.setenv("START_INDEX", "0")
    monkeypatch.setattr(replay.signal, "signal", lambda *_: None)
    send = MagicMock(return_value=1)
    monkeypatch.setattr(replay, "send", send)
    replay.main()
    assert send.call_count == 1
