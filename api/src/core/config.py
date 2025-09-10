import os
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

settings = Settings()
