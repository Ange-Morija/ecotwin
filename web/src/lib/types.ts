export type Mode = "demo" | "live";
export type Period = "24h" | "7d";
export type View = "overview" | "sensors" | "insights";
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
  /** Sensor family; absent until the API provides it (grouped as Environnement). */
  family?: string;
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
export type Selection = { sensor: string; index: number } | null;
/** Index of the selected observation, defaulting to the latest one. */
export const resolveIndex = (
  selection: Selection,
  sensor: string,
  length: number,
) =>
  selection?.sensor === sensor
    ? Math.min(selection.index, Math.max(0, length - 1))
    : Math.max(0, length - 1);
