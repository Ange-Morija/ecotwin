import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "./api";
import type { DashboardData, Mode, Period } from "./types";
export function useDashboard(
  mode: Mode,
  period: Period,
  enabled: boolean,
  rollback: (period: Period) => void,
) {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef<DashboardData | null>(null);
  const controller = useRef<AbortController | null>(null);
  const rollbackRef = useRef(rollback);
  rollbackRef.current = rollback;
  const refresh = useCallback(async () => {
    if (!enabled) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    const timeout = setTimeout(
      () =>
        current.abort(
          new DOMException("Délai de réponse dépassé", "TimeoutError"),
        ),
      20000,
    );
    try {
      const result = await api<DashboardData>(
        `/api/dashboard?mode=${mode}&period=${period}`,
        { signal: current.signal },
      );
      if (controller.current !== current || current.signal.aborted) return;
      latest.current = result;
      setData(result);
      setError("");
    } catch (e) {
      if (
        controller.current !== current ||
        current.signal.reason?.name === "AbortError"
      )
        return;
      if (e instanceof ApiError && e.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (latest.current && latest.current.period !== period)
        rollbackRef.current(latest.current.period);
      setError(
        e instanceof ApiError
          ? e.message
          : "Vérifiez votre connexion puis réessayez.",
      );
    } finally {
      clearTimeout(timeout);
      if (controller.current === current) setLoading(false);
    }
  }, [mode, period, enabled, navigate]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 30000);
    const online = () => {
      if (!document.hidden) void refresh();
    };
    window.addEventListener("online", online);
    return () => {
      controller.current?.abort();
      clearInterval(timer);
      window.removeEventListener("online", online);
    };
  }, [refresh]);
  return { data, loading, error, refresh };
}
