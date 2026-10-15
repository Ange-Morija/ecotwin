from pydantic import BaseModel, Field, ConfigDict, model_validator
from datetime import datetime
from typing import Optional


class Measurement(BaseModel):
    model_config = ConfigDict(extra="ignore", allow_inf_nan=False)
    time: Optional[datetime] = Field(
        None, description="optionnel; si absent: now UTC côté serveur"
    )
    sensor: str = Field(min_length=1, max_length=128)
    humidity: Optional[float] = None
    temperature: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None

    @model_validator(mode="after")
    def at_least_one_metric(self):
        if all(
            getattr(self, name) is None
            for name in (
                "humidity",
                "temperature",
                "pm25",
                "pm10",
                "so2",
                "co",
                "o3",
                "no2",
            )
        ):
            raise ValueError("Renseignez au moins une valeur de mesure.")
        if not self.sensor.strip():
            raise ValueError("Renseignez un identifiant de capteur.")
        return self


class BulkIngestRequest(BaseModel):
    items: list[Measurement] = Field(max_length=1000)
