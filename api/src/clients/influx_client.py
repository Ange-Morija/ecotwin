from influxdb_client import InfluxDBClient, Point, WriteOptions
from ..core.config import settings

class InfluxClient:
    def __init__(self):
        self.client = InfluxDBClient(url=settings.INFLUX_URL, token=settings.INFLUX_TOKEN, org=settings.INFLUX_ORG)
        self.write_api = self.client.write_api(write_options=WriteOptions(batch_size=5000, flush_interval=5000))
        self.query_api = self.client.query_api()

    def write_points(self, points: list[Point]) -> int:
        if not points: return 0
        self.write_api.write(bucket=settings.INFLUX_BUCKET, org=settings.INFLUX_ORG, record=points)
        self.write_api.flush()
        return len(points)

    def query(self, flux: str):
        return self.query_api.query(flux, org=settings.INFLUX_ORG)

    def close(self):
        self.client.close()
