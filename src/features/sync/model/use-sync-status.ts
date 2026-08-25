import { useEffect, useState } from "react";
import type { SyncStatus } from "../model/types";
import { getSyncManager } from "./create-sync-manager";
import useRefetchAppData from "./use-refetch-app-data";


/** Subscribes to the SyncManager's status stream. Use for a small "syncing…" indicator. */
export function useSyncStatus(): SyncStatus {
  const { refetchAppData } = useRefetchAppData();
  const [status, setStatus] = useState<SyncStatus>(() =>
    getSyncManager(refetchAppData).getStatus(),
  );

  useEffect(() => {
    const manager = getSyncManager(refetchAppData);
    setStatus(manager.getStatus());
    return manager.subscribe(setStatus);
  }, []);

  return status;
}
