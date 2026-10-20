import { useCallback, useEffect, useState } from "react";
export type Theme = "light" | "dark";
const KEY = "ecotwin-theme";
const query = () =>
  typeof matchMedia === "function"
    ? matchMedia("(prefers-color-scheme: dark)")
    : null;
/** A saved choice is a per-viewer convenience; storage may be unavailable. */
function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}
/** Follows the system setting until the viewer picks a theme explicitly. */
export function useTheme() {
  const [override, setOverride] = useState<Theme | null>(stored);
  const [system, setSystem] = useState<Theme>(() =>
    query()?.matches ? "dark" : "light",
  );
  useEffect(() => {
    const media = query();
    if (!media) return;
    const change = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const theme = override ?? system;
  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setOverride(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* The choice still applies for this visit. */
    }
  }, [theme]);
  return { theme, toggle };
}
