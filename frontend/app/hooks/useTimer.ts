import { useCallback, useRef } from "react";

export function useTimer() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((
    onTick: (remaining: number) => void,
    totalSeconds: number,
  ) => {
    clearTimer();
    let remaining = totalSeconds;
    onTick(remaining);

    timerRef.current = setInterval(() => {
      remaining -= 1;
      onTick(remaining);
      if (remaining <= 0) {
        clearTimer();
      }
    }, 1000);
  }, [clearTimer]);

  return { timerRef, clearTimer, startTimer };
}
