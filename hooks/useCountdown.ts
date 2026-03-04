import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountdownReturn {
  seconds: number;
  minutes: number;
  isExpired: boolean;
  reset: (seconds: number) => void;
}

export const useCountdown = (initialSeconds: number): UseCountdownReturn => {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = (startSeconds: number) => {
    clearTimer();
    setRemaining(startSeconds);

    if (startSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer(initialSeconds);
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback((seconds: number) => {
    startTimer(seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    seconds: remaining % 60,
    minutes: Math.floor(remaining / 60),
    isExpired: remaining === 0,
    reset,
  };
};
