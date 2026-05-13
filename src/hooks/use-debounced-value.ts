import { useEffect, useState } from "react";

/**
 * Returns `value` only after it has stayed unchanged for `delayMs`.
 * Useful for search fields to avoid querying on every keystroke.
 */

const DELAY_MS = 1000;
export function useDebouncedValue<T>(value: T, delayMs: number = DELAY_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
