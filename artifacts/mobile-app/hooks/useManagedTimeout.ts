import { useCallback, useEffect, useRef } from "react";

/**
 * A setTimeout that automatically cancels any still-pending timers when the
 * component unmounts. In this app, characters and items are frequently
 * unmounted mid-animation (scene switches, the Home reset, consumed items),
 * so unmanaged timers could fire after unmount and update stale state. Use
 * this instead of the global setTimeout inside components.
 */
export function useManagedTimeout() {
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(
    () => () => {
      timers.current.forEach((id) => clearTimeout(id));
      timers.current.clear();
    },
    [],
  );

  return useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);
}
