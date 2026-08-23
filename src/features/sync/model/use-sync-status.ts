import { useEffect, useState } from "react";
import type { SyncStatus } from "../model/types";
import { getSyncManager } from "./create-sync-manager";

/** Subscribes to the SyncManager's status stream. Use for a small "syncing…" indicator. */
export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(() =>
    getSyncManager().getStatus(),
  );

  useEffect(() => {
    const manager = getSyncManager();
    setStatus(manager.getStatus());
    return manager.subscribe(setStatus);
  }, []);

  return status;
}
