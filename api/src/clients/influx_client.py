from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from ..core.config import settings


class InfluxClient:
    def __init__(self):
        self.client = InfluxDBClient(
            url=settings.INFLUX_URL,
            token=settings.INFLUX_TOKEN,
            org=settings.INFLUX_ORG,
            timeout=10000,
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()

    def write_points(self, points: list[Point]) -> int:
        if not points:
            return 0
        self.write_api.write(
            bucket=settings.INFLUX_BUCKET, org=settings.INFLUX_ORG, record=points
        )
        return len(points)

    def query(self, flux: str, params: dict | None = None):
        return self.query_api.query(flux, org=settings.INFLUX_ORG, params=params)

    def close(self):
        self.write_api.close()
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()
