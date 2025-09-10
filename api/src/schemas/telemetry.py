from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class Measurement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    time: Optional[datetime] = Field(None, description="optionnel; si absent: now UTC côté serveur")
    sensor: str
    humidity: Optional[float] = None
    temperature: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None

class BulkIngestRequest(BaseModel):
    items: list[Measurement]
