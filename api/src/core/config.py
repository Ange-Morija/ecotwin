import os
from pathlib import Path
from dataclasses import dataclass


@dataclass
class Settings:
    APP_URL: str = os.getenv("APP_URL", "http://localhost:8000").rstrip("/")
    OPENAI_API_KEY: str = os.getenv(
        "ECOTWIN_OPENAI_API_KEY", os.getenv("OPENAI_API_KEY", "")
    )
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_PRICE_ID: str = os.getenv("STRIPE_PRICE_ID", "")
    STRIPE_MODE: str = os.getenv("STRIPE_MODE", "test")
    STRIPE_ALLOW_LIVE: bool = os.getenv("STRIPE_ALLOW_LIVE", "false").lower() == "true"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_KEY: str | None = os.getenv("API_KEY")

    INFLUX_URL: str = os.getenv("INFLUX_URL", "http://localhost:8086")
    INFLUX_TOKEN: str = os.getenv("INFLUX_TOKEN", "")
    INFLUX_ORG: str = os.getenv("INFLUX_ORG", "EcoTwin")
    INFLUX_BUCKET: str = os.getenv("INFLUX_BUCKET", "air_quality")
    MEASUREMENT: str = "air_quality"
    DATA_DIR: Path = Path(
        os.getenv(
            "ECOTWIN_DATA_DIR", str(Path(__file__).resolve().parents[3] / ".runtime")
        )
    )
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    ALLOW_REGISTRATION: bool = os.getenv("ALLOW_REGISTRATION", "true").lower() == "true"
    CORS_ORIGINS: tuple = tuple(
        filter(
            None,
            os.getenv(
                "CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080"
            ).split(","),
        )
    )


settings = Settings()
