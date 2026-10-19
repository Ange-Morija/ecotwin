import { useEffect, useRef, useState } from "react";
const reduced = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Counts up to an integer target on first display, then follows later changes directly. */
export function useCountUp(target: number | null, duration = 650) {
  const [shown, setShown] = useState<number | null>(
    target === null || reduced() ? target : 0,
  );
  const first = useRef(true);
  useEffect(() => {
    if (target === null || reduced() || !first.current) {
      setShown(target);
      return;
    }
    first.current = false;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      setShown(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return shown;
}
/** True for a short moment after the value changes, never on first render. */
export function useChanged(value: unknown, duration = 900) {
  const previous = useRef(value);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setChanged(true);
    const timer = setTimeout(() => setChanged(false), duration);
    return () => clearTimeout(timer);
  }, [value, duration]);
  return changed;
}
