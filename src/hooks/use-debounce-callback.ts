import { useCallback, useRef } from "react";

const DEFAULT_DEBOUNCE_MS = 1500;

type Callback = (...args: any[]) => void;

const useDebounceCallback = (
  callback: Callback,
  delay: number = DEFAULT_DEBOUNCE_MS
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      // Clear the previous timeout if it's still running
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args); // Call the passed function after the delay
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup function to clear the timeout when the component is unmounted
  const clearDebounce = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return [debouncedCallback, clearDebounce];
};

export default useDebounceCallback;
