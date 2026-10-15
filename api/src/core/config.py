import os
from pathlib import Path
from dataclasses import dataclass


@dataclass
class Settings:
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
