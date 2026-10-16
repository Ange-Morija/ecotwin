export type Mode = "demo" | "live";
export type Period = "24h" | "7d";
export type View = "overview" | "bim" | "sensors" | "insights";
export type User = { id: string; name: string; email: string };
export type Point = { time: string; value: number };
export type SensorStatus = "normal" | "warning" | "stale" | "missing";
export type Sensor = {
  id: string;
  name: string;
  field: string;
  unit: string;
  threshold: number;
  value: number | null;
  time: string | null;
  status: SensorStatus;
  bim_object_id: string | null;
};
export type Insight = {
  sensor: string;
  title: string;
  value: number;
  threshold: number;
  unit: string;
  explanation: string;
  source: "rule";
  stale: boolean;
};
export type DashboardData = {
  source: Mode;
  period: Period;
  generated_at: string;
  site: { name: string; description: string; bim_mapping: string };
  sensors: Sensor[];
  history: Record<string, Point[]>;
  insights: Insight[];
  threshold_note: string;
  ai: { connected: boolean; provider: string | null; method: string };
};
