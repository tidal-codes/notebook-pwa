import { useCallback, useEffect, useRef, useState } from "react";
import { useHealthCheck } from "../api/mutations";

export interface NetworkStatus {
  isOnline: boolean;
  isVerifying: boolean;
  lastChangedAt: number;
  checkNow: () => Promise<boolean>;
}

interface UseNetworkStatusOptions {
  intervalMs?: number;
  /** Timeout for a single ping attempt (ms). Default 5s */
  timeoutMs?: number;
}

export function useNetworkStatus({
  intervalMs = 30_000,
}: UseNetworkStatusOptions): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isVerifying, setIsVerifying] = useState(false);
  const lastChangedAtRef = useRef<number>(Date.now());
  const { mutateAsync: checkForHealth } = useHealthCheck();

  const setOnlineState = useCallback((next: boolean) => {
    setIsOnline((prev) => {
      if (prev !== next) lastChangedAtRef.current = Date.now();
      return next;
    });
  }, []);

  const checkNow = useCallback(async (): Promise<boolean> => {
    // Don't even try a ping if the OS already says there's no interface up.
    if (!navigator.onLine) {
      setOnlineState(false);
      return false;
    }

    setIsVerifying(true);

    try {
      const isOk = await checkForHealth();

      const online = isOk;
      setOnlineState(online);
      return online;
    } catch {
      setOnlineState(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [setOnlineState]);

  useEffect(() => {
    const handleOnline = () => {
      void checkNow();
    };
    const handleOffline = () => setOnlineState(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const stopInterval = () => intervalId && clearInterval(intervalId);
    const startInterval = () => {
      stopInterval();
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") void checkNow();
      }, intervalMs);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void checkNow();
        startInterval();
      } else {
        stopInterval();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startInterval();
    void checkNow(); // verify once on mount

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      stopInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkNow, intervalMs]);

  return {
    isOnline,
    isVerifying,
    lastChangedAt: lastChangedAtRef.current,
    checkNow,
  };
}
