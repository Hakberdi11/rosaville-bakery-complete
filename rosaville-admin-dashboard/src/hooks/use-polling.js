import { useEffect, useRef } from "react";

// Periodically re-runs `callback` (typically a page's `load()` refetch) so
// pages reflect new data (e.g. a new order coming in) without a manual
// browser refresh. Pauses while the tab is hidden/backgrounded so it doesn't
// burn requests on inactive tabs, and always fires once immediately when the
// tab becomes visible again to catch up.
export default function usePolling(callback, intervalMs = 15000) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!intervalMs) return;

    const tick = () => {
      if (document.visibilityState === "visible") callbackRef.current();
    };

    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);
}
